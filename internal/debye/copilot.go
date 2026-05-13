package debye

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"
)

func AskCopilot(req Request) map[string]any {
	evidence := retrieveEvidence(req.Message, req.DesignContext)
	if strings.TrimSpace(req.Message) == "" {
		return map[string]any{"response": "Ask about a tissue, electrode material, DRC violation, or simulation result and I will answer from the Debye knowledge base.", "evidence": evidence}
	}
	if os.Getenv("GEMINI_API_KEY") == "" {
		return map[string]any{"response": offlineCopilot(req.Message, evidence), "evidence": evidence, "mode": "offline-grounded"}
	}
	response, err := callGemini(req, evidence)
	if err != nil {
		return map[string]any{"response": offlineCopilot(req.Message, evidence), "evidence": evidence, "mode": "offline-grounded", "warning": err.Error()}
	}
	return map[string]any{"response": response, "evidence": evidence, "mode": "gemini-grounded"}
}

func retrieveEvidence(message string, context map[string]any) []map[string]any {
	query := strings.ToLower(message + " " + fmt.Sprint(context))
	var evidence []map[string]any
	for key, tissue := range Tissues {
		if strings.Contains(query, key) || strings.Contains(query, strings.ToLower(strings.Split(tissue.Name, " ")[0])) {
			evidence = append(evidence, map[string]any{"kind": "tissue", "key": key, "record": tissue})
		}
	}
	for key, material := range Materials {
		if strings.Contains(query, key) || strings.Contains(query, strings.ToLower(strings.Split(material.Name, " ")[0])) {
			evidence = append(evidence, map[string]any{"kind": "material", "key": key, "record": material})
		}
	}
	for key, signal := range SignalBands {
		if strings.Contains(query, key) || strings.Contains(query, strings.ToLower(signal.Name)) {
			evidence = append(evidence, map[string]any{"kind": "signal", "key": key, "record": signal})
		}
	}
	if len(evidence) == 0 {
		evidence = append(evidence, map[string]any{"kind": "sources", "record": Citations})
	}
	return evidence
}

func offlineCopilot(message string, evidence []map[string]any) string {
	var b strings.Builder
	b.WriteString("I can answer this from the curated Debye knowledge base. ")
	if len(evidence) == 0 {
		b.WriteString("No directly matching tissue or material record was found, so I will not invent numeric values.")
		return b.String()
	}
	for _, item := range evidence {
		switch record := item["record"].(type) {
		case Tissue:
			b.WriteString(fmt.Sprintf("%s uses Cole-Cole parameters R0 %.0f ohm-cm, Rinf %.0f ohm-cm, tau %.4g s, alpha %.2f, with biological noise %.2f uVrms. Citation: %s. ", record.Name, record.R0, record.RInf, record.Tau, record.ColeAlpha, record.NoiseUV, record.Citation))
		case Material:
			b.WriteString(fmt.Sprintf("%s has CIL %.2f mC/cm2, EIS factor %.2f, chronic-safe=%t. Citation: %s. ", record.Name, record.CIL, record.EISFactor, record.ChronicSafe, record.Citation))
		case SignalBand:
			b.WriteString(fmt.Sprintf("%s uses %.2f-%.0f Hz with minimum SNR %.1f dB and nominal amplitude %.1f uV. ", record.Name, record.FMin, record.FMax, record.MinSNR, record.AmplitudeUV))
		}
	}
	b.WriteString("If a value is not in these records, I will say it is unknown rather than guess.")
	return b.String()
}

func callGemini(req Request, evidence []map[string]any) (string, error) {
	key := os.Getenv("GEMINI_API_KEY")
	body := map[string]any{
		"system_instruction": map[string]any{"parts": []map[string]string{{"text": "You are Debye's bioelectronics copilot. Use only the supplied evidence and current design context. Cite record citations by name. If a numeric value is missing, say it is not in the curated knowledge base. Keep answers concise and actionable."}}},
		"contents": []map[string]any{{
			"role":  "user",
			"parts": []map[string]string{{"text": fmt.Sprintf("Question: %s\n\nDesign context: %v\n\nCurated evidence: %v", req.Message, req.DesignContext, evidence)}},
		}},
	}
	payload, _ := json.Marshal(body)
	client := http.Client{Timeout: 20 * time.Second}
	resp, err := client.Post("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key="+key, "application/json", bytes.NewReader(payload))
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()
	if resp.StatusCode >= 300 {
		return "", fmt.Errorf("gemini returned HTTP %d", resp.StatusCode)
	}
	var decoded struct {
		Candidates []struct {
			Content struct {
				Parts []struct {
					Text string `json:"text"`
				} `json:"parts"`
			} `json:"content"`
		} `json:"candidates"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&decoded); err != nil {
		return "", err
	}
	if len(decoded.Candidates) == 0 || len(decoded.Candidates[0].Content.Parts) == 0 {
		return "", fmt.Errorf("gemini returned no candidate text")
	}
	return decoded.Candidates[0].Content.Parts[0].Text, nil
}
