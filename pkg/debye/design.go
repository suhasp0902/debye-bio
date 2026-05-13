package debye

import "strings"

func GenerateDesign(req Request) map[string]any {
	prompt := strings.ToLower(req.Message)
	tissueKey := "subcutaneous"
	materialKey := "platinum"
	signalKey := "glucose"
	if strings.Contains(prompt, "gastric") || strings.Contains(prompt, "stomach") {
		tissueKey, materialKey, signalKey = "gastric", "platinum_iridium", "ep"
	}
	if strings.Contains(prompt, "cardiac") || strings.Contains(prompt, "ecg") || strings.Contains(prompt, "heart") {
		tissueKey, materialKey, signalKey = "cardiac", "platinum_iridium", "ecg"
	}
	if strings.Contains(prompt, "neural") || strings.Contains(prompt, "brain") || strings.Contains(prompt, "cortex") {
		tissueKey, materialKey, signalKey = "cortical", "iridium_oxide", "spike"
	}
	if strings.Contains(prompt, "wound") {
		tissueKey, materialKey, signalKey = "wound_chronic", "iridium_oxide", "ep"
	}
	if strings.Contains(prompt, "blood") || strings.Contains(prompt, "biomarker") || strings.Contains(prompt, "cancer") {
		tissueKey, materialKey, signalKey = "blood", "gold", "glucose"
	}
	if strings.Contains(prompt, "pedot") {
		materialKey = "pedot"
	}

	tissue := Tissues[tissueKey]
	material := Materials[materialKey]
	nodes := []Node{
		{ID: "bio-target", Type: "biology", Position: map[string]any{"x": 60, "y": 160}, Data: map[string]any{"label": tissue.Name, "item_id": paletteForTissue(tissueKey), "conductivity": tissue.Conductivity, "permittivity": tissue.Permittivity}},
		{ID: "elec-work", Type: "electronics", Position: map[string]any{"x": 320, "y": 160}, Data: map[string]any{"label": "Working Electrode", "role": "Electrode Contact", "material": material.Name, "area": 2500}},
		{ID: "mat-electrode", Type: "material", Position: map[string]any{"x": 320, "y": 360}, Data: map[string]any{"label": material.Name, "item_id": paletteForMaterial(materialKey), "iso": material.ISO10993, "chronic": material.ChronicSafe}},
		{ID: "elec-ref", Type: "electronics", Position: map[string]any{"x": 320, "y": 540}, Data: map[string]any{"label": "Reference Electrode (Ag/AgCl)", "role": "Interface"}},
		{ID: "elec-front-end", Type: "electronics", Position: map[string]any{"x": 580, "y": 160}, Data: map[string]any{"label": "Low-Noise Amplifier + Filter", "noiseNVrtHz": 8, "bandwidthHz": SignalBands[signalKey].FMax}},
		{ID: "elec-adc", Type: "electronics", Position: map[string]any{"x": 840, "y": 160}, Data: map[string]any{"label": "24-bit ADC", "sampleRateHz": 2 * SignalBands[signalKey].FMax * 4}},
		{ID: "elec-mcu", Type: "electronics", Position: map[string]any{"x": 1100, "y": 160}, Data: map[string]any{"label": "MCU + Wireless Telemetry"}},
	}
	if signalKey == "ep" {
		nodes = append(nodes, Node{ID: "elec-stim", Type: "electronics", Position: map[string]any{"x": 580, "y": 340}, Data: map[string]any{"label": "Biphasic Pulse Generator", "currentMA": 1.0, "pulseWidthMS": 0.2}})
	}
	if strings.Contains(prompt, "chronic") || tissueKey == "gastric" || tissueKey == "cortical" {
		nodes = append(nodes, Node{ID: "mat-encap", Type: "material", Position: map[string]any{"x": 580, "y": 520}, Data: map[string]any{"label": "Parylene-C Encapsulation", "item_id": "mat_parylene", "iso": true, "chronic": true}})
	}
	edges := []Edge{
		{ID: "e-bio-electrode", Source: "bio-target", Target: "elec-work", Data: map[string]any{"type": "bio"}},
		{ID: "e-material", Source: "mat-electrode", Target: "elec-work", Data: map[string]any{"type": "mixed"}},
		{ID: "e-ref", Source: "elec-ref", Target: "elec-work", Data: map[string]any{"type": "elec"}},
		{ID: "e-front-end", Source: "elec-work", Target: "elec-front-end", Data: map[string]any{"type": "mixed"}},
		{ID: "e-adc", Source: "elec-front-end", Target: "elec-adc", Data: map[string]any{"type": "elec"}},
		{ID: "e-mcu", Source: "elec-adc", Target: "elec-mcu", Data: map[string]any{"type": "elec"}},
	}
	if signalKey == "ep" {
		edges = append(edges, Edge{ID: "e-stim", Source: "elec-stim", Target: "elec-work", Data: map[string]any{"type": "mixed", "label": "biphasic pulse"}})
	}
	generatedReq := Request{Nodes: nodes, Edges: edges, SignalProfile: &SignalProfile{Key: signalKey}}
	return map[string]any{
		"schemaVersion": 2,
		"nodes":         nodes,
		"edges":         edges,
		"simulation":    RunSimulation(generatedReq),
		"drc":           RunDRC(generatedReq),
		"message":       "Generated a validated starting design with a tissue target, electrode interface, reference path, analog front end, ADC, and telemetry chain.",
	}
}

func paletteForTissue(key string) string {
	for item, mapped := range tissueByPalette {
		if mapped == key {
			return item
		}
	}
	return ""
}

func paletteForMaterial(key string) string {
	for item, mapped := range materialByPalette {
		if mapped == key {
			return item
		}
	}
	return ""
}
