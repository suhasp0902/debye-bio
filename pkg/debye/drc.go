package debye

import (
	"fmt"
	"math"
	"strings"
)

func RunDRC(req Request) DRCResponse {
	design := NormalizeDesign(req)
	var errors []Violation
	var warnings []Violation
	passed := 0

	if len(req.Nodes) == 0 {
		return DRCResponse{Errors: errors, Warnings: warnings, Passed: 0, Citations: Citations}
	}

	electrodes := electrodeNodes(req.Nodes)
	materials := materialNodes(req.Nodes)
	tissues := tissueNodes(req.Nodes)

	for _, electrode := range electrodes {
		local := design
		local.ElectrodeArea = firstPositive(numberValue(electrode.Data["area"]), design.ElectrodeArea)
		if material, ok := ResolveMaterial(lowerString(electrode.Data["material"])+" "+lowerString(electrode.Data["label"]), lowerString(electrode.Data["item_id"])); ok {
			local.Material = material
		}
		z, _ := randlesImpedance(1000, local.Material, local.ElectrodeArea)
		total := math.Abs(real(z))
		if total > maxImpedanceForSignal(local.Signal) {
			errors = append(errors, Violation{
				ID: "BIO-001", Title: "ELECTRODE IMPEDANCE OUT OF RANGE", Affected: labelOf(electrode),
				Message:  fmt.Sprintf("%s at %.0f um2 with %s is %.0f ohm at 1 kHz; %s sensing should stay below %.0f ohm or use a lower-impedance coating.", labelOf(electrode), local.ElectrodeArea, local.Material.Name, total, local.Signal.Name, maxImpedanceForSignal(local.Signal)),
				Severity: "error", Equation: "Z = Rs + ((Rct + Zw) || CPE)", Value: round(total, 1), Limit: maxImpedanceForSignal(local.Signal), Citation: "Randles 1947; Cogan 2008", Fixable: true,
				Autofix: map[string]any{"field": "area", "value": math.Ceil(local.ElectrodeArea * total / maxImpedanceForSignal(local.Signal))},
			})
		} else {
			passed++
		}

		if design.StimCurrentMA > 0 && local.Material.CIL > 0 {
			cd := chargeDensityMCPerCM2(local)
			if cd > local.Material.CIL {
				errors = append(errors, Violation{
					ID: "BIO-003", Title: "CHARGE INJECTION LIMIT EXCEEDED", Affected: labelOf(electrode),
					Message:  fmt.Sprintf("Charge density %.2f mC/cm2 exceeds %s limit %.2f mC/cm2. Reduce current, shorten pulse width, or increase area.", cd, local.Material.Name, local.Material.CIL),
					Severity: "error", Equation: "Qd = (I * pulse_width) / electrode_area", Value: round(cd, 2), Limit: local.Material.CIL, Citation: local.Material.Citation, Fixable: false,
				})
			} else {
				passed++
			}
		}
	}

	for _, materialNode := range materials {
		if material, ok := ResolveMaterial(lowerString(materialNode.Data["label"]), lowerString(materialNode.Data["item_id"])); ok {
			if !material.ISO10993 {
				errors = append(errors, Violation{
					ID: "BIO-006", Title: "MATERIAL NOT ISO 10993 APPROVED", Affected: labelOf(materialNode),
					Message:  fmt.Sprintf("%s is marked research-only in the curated library. Do not use it for in-vivo or investor-demo implant claims.", material.Name),
					Severity: "error", Citation: material.Citation, Fixable: false,
				})
			} else {
				passed++
			}
			if chronicTarget(tissues) && !material.ChronicSafe && material.CIL > 0 {
				warnings = append(warnings, Violation{
					ID: "WARN-007", Title: "MATERIAL NOT RATED FOR CHRONIC USE", Affected: labelOf(materialNode),
					Message:  fmt.Sprintf("%s is rated in this library for about %d year(s). Chronic designs should include drift/fouling margin or a stable coating.", material.Name, material.MaxYears),
					Severity: "warning", Citation: material.Citation, Fixable: false,
				})
			}
		}
	}

	if chronicTarget(tissues) && !design.HasEncapsulant {
		errors = append(errors, Violation{ID: "BIO-007", Title: "NO ENCAPSULANT ON CHRONIC IMPLANT", Affected: "Device Assembly", Message: "Chronic implant targets need a moisture barrier or housing such as Parylene-C or titanium.", Severity: "error", Citation: "ISO 10993 contact-duration framework; chronic implant packaging practice", Fixable: false})
	} else if chronicTarget(tissues) {
		passed++
	}

	if design.HasADC && !design.HasReference && len(electrodes) > 0 {
		warnings = append(warnings, Violation{ID: "BIO-004", Title: "NO REFERENCE ELECTRODE", Affected: "Measurement System", Message: "A stable reference electrode is needed for drift-controlled potentiometric/amperometric measurements.", Severity: "warning", Citation: "Electrochemical measurement practice", Fixable: false})
	} else if design.HasReference {
		passed++
	}

	if wearableTarget(tissues) && !design.HasFilter && len(electrodes) > 0 {
		warnings = append(warnings, Violation{ID: "WARN-003", Title: "NO MOTION ARTIFACT FILTER", Affected: "Signal Chain", Message: "Wearable tissue targets should include bandpass or adaptive motion rejection before SNR claims are trusted.", Severity: "warning", Equation: "noise_total = sqrt(sum(noise_i^2))", Citation: design.Tissue.Citation, Fixable: false})
	} else if design.HasFilter {
		passed++
	}

	if len(req.Nodes) > 4 && !design.HasMCU {
		warnings = append(warnings, Violation{ID: "WARN-020", Title: "NO DATA PROCESSING UNIT", Affected: "System Architecture", Message: "Complex designs need a controller, processor, or wireless/data path for a credible prototype flow.", Severity: "warning", Fixable: false})
	} else if design.HasMCU {
		passed++
	}

	if len(tissues) > 0 {
		passed++
	}
	if len(electrodes) > 0 {
		passed++
	}
	if len(req.Edges) > 0 {
		passed++
	}

	return DRCResponse{Errors: errors, Warnings: warnings, Passed: passed, Citations: Citations}
}

func maxImpedanceForSignal(signal SignalBand) float64 {
	switch signal.Key {
	case "spike":
		return 900000
	case "lfp", "eeg":
		return 250000
	case "glucose":
		return 5000000
	case "ecg":
		return 100000
	default:
		return 750000
	}
}

func electrodeNodes(nodes []Node) []Node {
	var out []Node
	for _, node := range nodes {
		label := lowerString(node.Data["label"])
		role := lowerString(node.Data["role"])
		nodeType := strings.ToLower(node.Type)
		if (nodeType == "electronics" || nodeType == "electrode" || nodeType == "neuromodulation") && 
		   (strings.Contains(label, "electrode") || strings.Contains(role, "interface") || strings.Contains(role, "electrode") || nodeType == "electrode") {
			out = append(out, node)
		}
	}
	return out
}

func materialNodes(nodes []Node) []Node {
	var out []Node
	for _, node := range nodes {
		if node.Type == "material" {
			out = append(out, node)
		}
	}
	return out
}

func tissueNodes(nodes []Node) []Node {
	var out []Node
	for _, node := range nodes {
		if node.Type == "biology" {
			out = append(out, node)
		}
	}
	return out
}

func chronicTarget(nodes []Node) bool {
	for _, node := range nodes {
		label := lowerString(node.Data["label"])
		if strings.Contains(label, "cortical") || strings.Contains(label, "nerve") || strings.Contains(label, "retina") || strings.Contains(label, "gastric") || strings.Contains(label, "chronic") {
			return true
		}
	}
	return false
}

func wearableTarget(nodes []Node) bool {
	for _, node := range nodes {
		label := lowerString(node.Data["label"])
		if strings.Contains(label, "skin") || strings.Contains(label, "subcutaneous") || strings.Contains(label, "wearable") {
			return true
		}
	}
	return false
}

func labelOf(node Node) string {
	label := toString(node.Data["label"])
	if label == "" {
		return node.ID
	}
	return label
}
