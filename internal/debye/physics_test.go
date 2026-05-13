package debye

import "testing"

func TestSimulationVariesByDesign(t *testing.T) {
	cgm := Request{Nodes: []Node{
		{ID: "bio", Type: "biology", Data: map[string]any{"label": "Subcutaneous Tissue", "item_id": "bio_subq"}},
		{ID: "elec", Type: "electronics", Data: map[string]any{"label": "Pt Electrode", "material": "Platinum", "area": 1000.0}},
		{ID: "amp", Type: "electronics", Data: map[string]any{"label": "Low-Noise Amplifier + Filter"}},
	}}
	neural := Request{Nodes: []Node{
		{ID: "bio", Type: "biology", Data: map[string]any{"label": "Cortical Gray Matter", "item_id": "bio_cortex"}},
		{ID: "elec", Type: "electronics", Data: map[string]any{"label": "Iridium Oxide Electrode", "material": "Iridium Oxide", "area": 2500.0}},
		{ID: "amp", Type: "electronics", Data: map[string]any{"label": "Low-Noise Amplifier + Filter"}},
	}}

	a := RunSimulation(cgm)
	b := RunSimulation(neural)

	if a.Impedance1kHzRaw == b.Impedance1kHzRaw {
		t.Fatalf("expected impedance to vary by tissue/material design")
	}
	if a.NoiseTotal == b.NoiseTotal {
		t.Fatalf("expected noise to vary by tissue/material design")
	}
	if a.SNR == b.SNR {
		t.Fatalf("expected SNR to vary by tissue/material design")
	}
	if len(a.TimeData) != 100 || len(b.TimeData) != 100 {
		t.Fatalf("expected deterministic 100 point time-domain outputs")
	}
}

func TestNernstPotential(t *testing.T) {
	got := nernstPotentialMV(310.15, 1, 10, 1)
	if got < 55 || got > 70 {
		t.Fatalf("expected physiologic decade Nernst potential near 61 mV, got %.3f", got)
	}
}

func TestRandlesAreaScaling(t *testing.T) {
	material := Materials["platinum"]
	small, _ := randlesImpedance(1000, material, 500)
	large, _ := randlesImpedance(1000, material, 5000)
	if real(large) >= real(small) {
		t.Fatalf("larger electrode should lower real interface impedance: small=%v large=%v", real(small), real(large))
	}
}

func TestDRCChargeLimit(t *testing.T) {
	req := Request{Nodes: []Node{
		{ID: "bio", Type: "biology", Data: map[string]any{"label": "Gastric Mucosa"}},
		{ID: "elec", Type: "electronics", Data: map[string]any{"label": "Platinum Electrode", "material": "Platinum", "area": 500.0}},
		{ID: "stim", Type: "electronics", Data: map[string]any{"label": "Pulse Generator", "currentMA": 2.0, "pulseWidthMS": 1.0}},
	}}
	result := RunDRC(req)
	found := false
	for _, violation := range result.Errors {
		if violation.ID == "BIO-003" {
			found = true
		}
	}
	if !found {
		t.Fatalf("expected charge injection limit violation")
	}
}

func TestGenerateDesignIsValidated(t *testing.T) {
	result := GenerateDesign(Request{Message: "Design a chronic gastric pacemaker"})
	if result["schemaVersion"].(int) != 2 {
		t.Fatalf("expected schema version 2")
	}
	sim, ok := result["simulation"].(SimulationResponse)
	if !ok || len(sim.EISData) == 0 {
		t.Fatalf("expected generated simulation")
	}
	drc, ok := result["drc"].(DRCResponse)
	if !ok || drc.Passed == 0 {
		t.Fatalf("expected generated DRC result")
	}
}
