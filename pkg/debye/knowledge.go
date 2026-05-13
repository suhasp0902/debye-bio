package debye

import (
	"math"
	"strconv"
	"strings"
)

var Citations = []Citation{
	{ID: "gabriel-1996-measurements", Title: "The dielectric properties of biological tissues: II. Measurements in the frequency range 10 Hz to 20 GHz", URL: "https://pubmed.ncbi.nlm.nih.gov/8938025/", Note: "Primary tissue dielectric measurements used for conductivity/permittivity ranges."},
	{ID: "gabriel-1996-models", Title: "The dielectric properties of biological tissues: III. Parametric models for the dielectric spectrum of tissues", URL: "https://pubmed.ncbi.nlm.nih.gov/8938026/", Note: "Cole-Cole style parametric tissue spectra."},
	{ID: "cogan-2008", Title: "Neural Stimulation and Recording Electrodes", URL: "https://www.annualreviews.org/content/journals/10.1146/annurev.bioeng.10.061807.160518", Note: "Electrode material behavior, stimulation safety, charge injection context."},
	{ID: "randles-1947", Title: "Kinetics of rapid electrode reactions", URL: "https://pubs.rsc.org/en/content/articlehtml/1947/df/df9470100011", Note: "Randles interface model lineage."},
}

var Tissues = map[string]Tissue{
	"subcutaneous":     {Key: "subcutaneous", Name: "Subcutaneous Tissue", Conductivity: 0.30, Permittivity: 1200, ColeAlpha: 0.78, Tau: 1.2e-3, R0: 650, RInf: 320, NoiseUV: 1.2, MotionUV: 1.4, Application: []string{"CGM", "Wearable", "Drug Delivery"}, Citation: "Gabriel et al. 1996 PMB; Gabriel et al. 1996 parametric models"},
	"cardiac":          {Key: "cardiac", Name: "Cardiac Muscle", Conductivity: 0.40, Permittivity: 1600, ColeAlpha: 0.72, Tau: 0.8e-3, R0: 420, RInf: 180, NoiseUV: 3.0, MotionUV: 2.5, Application: []string{"ECG", "Pacing", "Defibrillation"}, Citation: "Gabriel et al. 1996 PMB; Faes et al. 1999 review"},
	"cortical":         {Key: "cortical", Name: "Cortical Gray Matter", Conductivity: 0.30, Permittivity: 2000, ColeAlpha: 0.65, Tau: 5e-3, R0: 800, RInf: 350, NoiseUV: 5.0, MotionUV: 0.8, Application: []string{"Neural Recording", "BCI", "DBS"}, Citation: "Gabriel et al. 1996 PMB; Logothetis et al. 2007 neural signals"},
	"white_matter":     {Key: "white_matter", Name: "White Matter", Conductivity: 0.15, Permittivity: 1500, ColeAlpha: 0.70, Tau: 4e-3, R0: 1200, RInf: 550, NoiseUV: 2.0, MotionUV: 0.7, Application: []string{"DBS", "Neural Recording"}, Citation: "Gabriel et al. 1996 PMB"},
	"blood":            {Key: "blood", Name: "Blood", Conductivity: 0.70, Permittivity: 2500, ColeAlpha: 0.90, Tau: 0.2e-3, R0: 180, RInf: 140, NoiseUV: 0.5, MotionUV: 0.5, Application: []string{"Intravascular", "Blood glucose", "Impedance hematology"}, Citation: "Gabriel et al. 1996 PMB; Geddes and Baker 1967"},
	"skin_epidermis":   {Key: "skin_epidermis", Name: "Skin (Epidermis)", Conductivity: 0.0002, Permittivity: 1100, ColeAlpha: 0.50, Tau: 8e-3, R0: 12000, RInf: 100, NoiseUV: 8.0, MotionUV: 3.5, Application: []string{"EEG", "ECG", "Wearable"}, Citation: "Gabriel et al. 1996 PMB; Yamamoto and Yamamoto 1976"},
	"peripheral_nerve": {Key: "peripheral_nerve", Name: "Peripheral Nerve", Conductivity: 0.08, Permittivity: 3000, ColeAlpha: 0.60, Tau: 10e-3, R0: 1500, RInf: 600, NoiseUV: 2.5, MotionUV: 0.8, Application: []string{"Neural Stimulation", "Pain Management"}, Citation: "Gabriel et al. 1996 PMB; Ranck 1963"},
	"gastric":          {Key: "gastric", Name: "Gastric Mucosa", Conductivity: 0.60, Permittivity: 2200, ColeAlpha: 0.82, Tau: 0.5e-3, R0: 280, RInf: 120, NoiseUV: 1.8, MotionUV: 1.8, Application: []string{"GI Monitoring", "Gastric Pacing"}, Citation: "Gabriel et al. 1996 PMB; O'Brien et al. 2010"},
	"wound":            {Key: "wound", Name: "Wound Bed (Acute)", Conductivity: 0.50, Permittivity: 1800, ColeAlpha: 0.75, Tau: 1.0e-3, R0: 350, RInf: 200, NoiseUV: 2.2, MotionUV: 2.2, Application: []string{"Wound Monitoring", "Electrostimulation"}, Citation: "Gabriel et al. 1996 PMB; Swain and Bhansali 2019"},
	"wound_chronic":    {Key: "wound_chronic", Name: "Wound Bed (Chronic)", Conductivity: 0.35, Permittivity: 1400, ColeAlpha: 0.68, Tau: 2.0e-3, R0: 550, RInf: 280, NoiseUV: 3.5, MotionUV: 2.6, Application: []string{"Chronic Wound Care", "Biofilm Monitoring"}, Citation: "Gabriel et al. 1996 PMB; Swain and Bhansali 2019"},
	"retina":           {Key: "retina", Name: "Retina", Conductivity: 0.28, Permittivity: 1900, ColeAlpha: 0.63, Tau: 6e-3, R0: 900, RInf: 400, NoiseUV: 4.0, MotionUV: 0.7, Application: []string{"Retinal Prosthesis", "ERG Recording"}, Citation: "Gabriel et al. 1996 PMB; Weiland and Humayun 2014"},
	"liver":            {Key: "liver", Name: "Liver", Conductivity: 0.28, Permittivity: 2100, ColeAlpha: 0.73, Tau: 1.5e-3, R0: 700, RInf: 300, NoiseUV: 1.0, MotionUV: 0.6, Application: []string{"Bioimpedance Analysis", "Thermal Ablation"}, Citation: "Gabriel et al. 1996 PMB"},
	"bone":             {Key: "bone", Name: "Bone (Cortical)", Conductivity: 0.006, Permittivity: 500, ColeAlpha: 0.55, Tau: 15e-3, R0: 8000, RInf: 1200, NoiseUV: 0.2, MotionUV: 0.3, Application: []string{"Fracture Healing", "Implant Osseointegration"}, Citation: "Gabriel et al. 1996 PMB; Sierpowska et al. 2006"},
	"csf":              {Key: "csf", Name: "Cerebrospinal Fluid", Conductivity: 1.79, Permittivity: 109, ColeAlpha: 0.97, Tau: 0.1e-3, R0: 55, RInf: 52, NoiseUV: 0.3, MotionUV: 0.2, Application: []string{"Intracranial Recording", "DBS"}, Citation: "Gabriel et al. 1996 PMB"},
	"fat":              {Key: "fat", Name: "Adipose Tissue", Conductivity: 0.04, Permittivity: 900, ColeAlpha: 0.58, Tau: 12e-3, R0: 3500, RInf: 700, NoiseUV: 0.4, MotionUV: 0.7, Application: []string{"Body Composition", "Wearable Sensing"}, Citation: "Gabriel et al. 1996 PMB; Kyle et al. 2004"},
}

var Materials = map[string]Material{
	"platinum":         {Key: "platinum", Name: "Platinum", CIL: 0.15, EISFactor: 2.5, ISO10993: true, ChronicSafe: true, MaxYears: 10, Color: "#E5E4E2", CPEQ: 40e-6, CPEAlpha: 0.88, WarburgSigma: 180, Notes: "Common noble-metal electrode for chronic neural and cardiac interfaces.", Citation: "Cogan 2008"},
	"platinum_iridium": {Key: "platinum_iridium", Name: "Platinum-Iridium (90/10)", CIL: 0.35, EISFactor: 1.8, ISO10993: true, ChronicSafe: true, MaxYears: 10, Color: "#C8C8C8", CPEQ: 55e-6, CPEAlpha: 0.89, WarburgSigma: 150, Notes: "Durable alloy used in DBS and cochlear-style electrodes.", Citation: "Cogan 2008; Merrill et al. 2005"},
	"pedot":            {Key: "pedot", Name: "PEDOT:PSS", CIL: 15.0, EISFactor: 0.05, ISO10993: true, ChronicSafe: false, MaxYears: 2, Coating: true, Color: "#6B21A8", CPEQ: 950e-6, CPEAlpha: 0.94, WarburgSigma: 35, Notes: "Conducting polymer coating with very low impedance but limited chronic stability.", Citation: "Ludwig et al. 2011; Cogan 2008 context"},
	"iridium_oxide":    {Key: "iridium_oxide", Name: "Iridium Oxide (IrOx)", CIL: 4.0, EISFactor: 0.3, ISO10993: true, ChronicSafe: true, MaxYears: 5, Coating: true, Color: "#1D4ED8", CPEQ: 320e-6, CPEAlpha: 0.92, WarburgSigma: 55, Notes: "High charge-injection material for stimulation.", Citation: "Cogan 2008; Cogan et al. 2004"},
	"gold":             {Key: "gold", Name: "Gold", CIL: 0.1, EISFactor: 3.2, ISO10993: true, ChronicSafe: true, MaxYears: 8, Color: "#EAB308", CPEQ: 25e-6, CPEAlpha: 0.86, WarburgSigma: 220, Notes: "Flexible electronics material with lower charge injection than Pt.", Citation: "Cogan 2008; Williams 2008"},
	"titanium_nitride": {Key: "titanium_nitride", Name: "Titanium Nitride (TiN)", CIL: 1.0, EISFactor: 0.8, ISO10993: true, ChronicSafe: true, MaxYears: 7, Coating: true, Color: "#78716C", CPEQ: 180e-6, CPEAlpha: 0.91, WarburgSigma: 95, Notes: "High surface area coating for low impedance recording contacts.", Citation: "Cogan 2008; Nordhausen et al. 1996"},
	"carbon_nanotube":  {Key: "carbon_nanotube", Name: "Carbon Nanotube (CNT)", CIL: 8.0, EISFactor: 0.1, ISO10993: false, ChronicSafe: false, MaxYears: 1, Coating: true, Color: "#1C1917", CPEQ: 700e-6, CPEAlpha: 0.93, WarburgSigma: 45, Notes: "Research material; chronic biocompatibility remains unsettled.", Citation: "Keefer et al. 2008"},
	"graphene":         {Key: "graphene", Name: "Graphene", CIL: 3.0, EISFactor: 0.15, ISO10993: false, ChronicSafe: false, MaxYears: 1, Coating: true, Color: "#374151", CPEQ: 520e-6, CPEAlpha: 0.92, WarburgSigma: 50, Notes: "Transparent flexible research electrode material.", Citation: "Park et al. 2018"},
	"parylene_c":       {Key: "parylene_c", Name: "Parylene-C (Insulator)", CIL: 0, EISFactor: 9999, ISO10993: true, ChronicSafe: true, MaxYears: 10, Color: "#D1FAE5", CPEQ: 1e-9, CPEAlpha: 0.7, WarburgSigma: 9999, Notes: "Encapsulant, not a conductive electrode.", Citation: "Seymour et al. 2009"},
	"titanium":         {Key: "titanium", Name: "Titanium (Structural)", CIL: 0, EISFactor: 9999, ISO10993: true, ChronicSafe: true, MaxYears: 20, Color: "#9CA3AF", CPEQ: 1e-9, CPEAlpha: 0.7, WarburgSigma: 9999, Notes: "Structural housing material, not a sensing contact.", Citation: "Albrektsson et al. 1981"},
}

var SignalBands = map[string]SignalBand{
	"eeg":     {Key: "eeg", Name: "EEG", FMin: 0.5, FMax: 100, MinSNR: 10, AmplitudeUV: 10, Citation: "Clinical neurophysiology recording ranges"},
	"ecg":     {Key: "ecg", Name: "ECG", FMin: 0.05, FMax: 150, MinSNR: 20, AmplitudeUV: 1000, Citation: "Diagnostic ECG acquisition conventions"},
	"emg":     {Key: "emg", Name: "EMG", FMin: 20, FMax: 2000, MinSNR: 15, AmplitudeUV: 500, Citation: "Surface/intramuscular EMG acquisition conventions"},
	"spike":   {Key: "spike", Name: "Neural Spikes", FMin: 300, FMax: 5000, MinSNR: 6, AmplitudeUV: 50, Citation: "Extracellular neural recording conventions"},
	"lfp":     {Key: "lfp", Name: "Local Field Potential", FMin: 1, FMax: 300, MinSNR: 8, AmplitudeUV: 200, Citation: "LFP acquisition conventions"},
	"glucose": {Key: "glucose", Name: "Glucose (Amperometric)", FMin: 0.01, FMax: 1, MinSNR: 30, AmplitudeUV: 5, Citation: "Amperometric biosensor signal-band approximation"},
	"ep":      {Key: "ep", Name: "Evoked Potential", FMin: 1, FMax: 1000, MinSNR: 12, AmplitudeUV: 20, Citation: "Evoked potential acquisition conventions"},
}

var tissueByPalette = map[string]string{
	"bio_subq": "subcutaneous", "bio_cardiac": "cardiac", "bio_cortex": "cortical", "bio_white": "white_matter",
	"bio_blood": "blood", "bio_skin": "skin_epidermis", "bio_nerve": "peripheral_nerve", "bio_gastric": "gastric",
	"bio_wound_a": "wound", "bio_wound_c": "wound_chronic", "bio_retina": "retina", "bio_liver": "liver",
	"bio_bone": "bone", "bio_csf": "csf", "bio_fat": "fat",
}

var materialByPalette = map[string]string{
	"mat_pt": "platinum", "mat_ptir": "platinum_iridium", "mat_au": "gold", "mat_irox": "iridium_oxide",
	"mat_tin": "titanium_nitride", "mat_pedot": "pedot", "mat_cnt": "carbon_nanotube", "mat_graphene": "graphene",
	"mat_parylene": "parylene_c", "mat_ti": "titanium",
}

func NormalizeDesign(req Request) NormalizedDesign {
	design := NormalizedDesign{
		Tissue:           Tissues["subcutaneous"],
		Material:         Materials["platinum"],
		Signal:           SignalBands["glucose"],
		ElectrodeArea:    1000,
		TemperatureK:     310.15,
		BandwidthHz:      10000,
		SampleRateHz:     20000,
		AmplifierNoiseNV: 22,
	}

	if req.SignalProfile != nil {
		if sig, ok := SignalBands[strings.ToLower(req.SignalProfile.Key)]; ok {
			design.Signal = sig
		}
		if req.SignalProfile.Bandwidth > 0 {
			design.BandwidthHz = req.SignalProfile.Bandwidth
		}
		if req.SignalProfile.SampleRate > 0 {
			design.SampleRateHz = req.SignalProfile.SampleRate
		}
		if req.SignalProfile.Amplitude > 0 {
			design.Signal.AmplitudeUV = req.SignalProfile.Amplitude
		}
	}

	for _, node := range req.Nodes {
		label := lowerString(node.Data["label"])
		itemID := lowerString(node.Data["item_id"])
		nodeType := strings.ToLower(node.Type)

		if nodeType == "biology" || lowerString(node.Data["type"]) == "tissue" {
			if tissue, ok := ResolveTissue(label, itemID); ok {
				design.Tissue = tissue
			}
		}

		if nodeType == "material" || nodeType == "electronics" {
			if material, ok := ResolveMaterial(label, itemID); ok {
				design.Material = material
			}
			if material, ok := ResolveMaterial(lowerString(node.Data["material"]), ""); ok {
				design.Material = material
			}
		}

		if area := numberValue(node.Data["area"]); area > 0 {
			design.ElectrodeArea = area
		}

		if bw := numberValue(node.Data["bandwidthHz"]); bw > 0 {
			design.BandwidthHz = bw
		}
		if sr := numberValue(node.Data["sampleRateHz"]); sr > 0 {
			design.SampleRateHz = sr
		}
		if temp := numberValue(node.Data["temperatureK"]); temp > 250 {
			design.TemperatureK = temp
		}
		if noise := numberValue(node.Data["noiseNVrtHz"]); noise > 0 {
			design.AmplifierNoiseNV = noise
		}

		if strings.Contains(label, "amplifier") || strings.Contains(label, " amp") || strings.Contains(label, "lna") {
			design.HasAmplifier = true
			if design.AmplifierNoiseNV > 12 {
				design.AmplifierNoiseNV = 8
			}
		}
		if strings.Contains(label, "filter") || strings.Contains(label, "bandpass") {
			design.HasFilter = true
		}
		if strings.Contains(label, "adc") {
			design.HasADC = true
		}
		if strings.Contains(label, "mcu") || strings.Contains(label, "microcontroller") || strings.Contains(label, "wireless") || strings.Contains(label, "processor") {
			design.HasMCU = true
		}
		if strings.Contains(label, "reference") || strings.Contains(label, "ag/agcl") {
			design.HasReference = true
		}
		if strings.Contains(label, "parylene") || strings.Contains(label, "encapsulant") || strings.Contains(label, "titanium enclosure") || strings.Contains(label, "housing") {
			design.HasEncapsulant = true
		}
		if strings.Contains(label, "pulse") || strings.Contains(label, "stimulat") || strings.Contains(label, "pacing") {
			design.StimCurrentMA = firstPositive(numberValue(node.Data["currentMA"]), parseLeadingNumber(lowerString(node.Data["current"])), 2)
			design.PulseWidthMS = firstPositive(numberValue(node.Data["pulseWidthMS"]), parseLeadingNumber(lowerString(node.Data["pulseWidth"])), 1)
		}
	}

	design.Signal = inferSignal(design)
	if design.Signal.FMax > 0 {
		design.BandwidthHz = math.Max(design.BandwidthHz, design.Signal.FMax-design.Signal.FMin)
	}
	return design
}

func ResolveTissue(label string, itemID string) (Tissue, bool) {
	if key, ok := tissueByPalette[itemID]; ok {
		return Tissues[key], true
	}
	for key, tissue := range Tissues {
		if strings.Contains(label, key) || strings.Contains(label, strings.ToLower(strings.Split(tissue.Name, " ")[0])) {
			return tissue, true
		}
	}
	switch {
	case strings.Contains(label, "subcutaneous") || strings.Contains(label, "glucose"):
		return Tissues["subcutaneous"], true
	case strings.Contains(label, "cardiac") || strings.Contains(label, "heart"):
		return Tissues["cardiac"], true
	case strings.Contains(label, "brain") || strings.Contains(label, "cortex") || strings.Contains(label, "cortical"):
		return Tissues["cortical"], true
	case strings.Contains(label, "blood"):
		return Tissues["blood"], true
	case strings.Contains(label, "skin") || strings.Contains(label, "epidermis"):
		return Tissues["skin_epidermis"], true
	case strings.Contains(label, "nerve"):
		return Tissues["peripheral_nerve"], true
	case strings.Contains(label, "gastric") || strings.Contains(label, "stomach"):
		return Tissues["gastric"], true
	case strings.Contains(label, "wound"):
		return Tissues["wound"], true
	case strings.Contains(label, "retina"):
		return Tissues["retina"], true
	case strings.Contains(label, "liver"):
		return Tissues["liver"], true
	case strings.Contains(label, "bone"):
		return Tissues["bone"], true
	case strings.Contains(label, "csf") || strings.Contains(label, "cerebrospinal"):
		return Tissues["csf"], true
	case strings.Contains(label, "fat") || strings.Contains(label, "adipose"):
		return Tissues["fat"], true
	}
	return Tissue{}, false
}

func ResolveMaterial(label string, itemID string) (Material, bool) {
	if key, ok := materialByPalette[itemID]; ok {
		return Materials[key], true
	}
	for key, material := range Materials {
		if strings.Contains(label, key) || strings.Contains(label, strings.ToLower(strings.Split(material.Name, " ")[0])) {
			return material, true
		}
	}
	switch {
	case strings.Contains(label, "pedot") || strings.Contains(label, "pss"):
		return Materials["pedot"], true
	case strings.Contains(label, "pt-ir") || strings.Contains(label, "platinum-iridium") || strings.Contains(label, "platinum iridium"):
		return Materials["platinum_iridium"], true
	case strings.Contains(label, "platinum") || label == "pt":
		return Materials["platinum"], true
	case strings.Contains(label, "gold") || label == "au":
		return Materials["gold"], true
	case strings.Contains(label, "irox") || strings.Contains(label, "iridium"):
		return Materials["iridium_oxide"], true
	case strings.Contains(label, "tin") || strings.Contains(label, "titanium nitride"):
		return Materials["titanium_nitride"], true
	case strings.Contains(label, "cnt") || strings.Contains(label, "carbon nanotube"):
		return Materials["carbon_nanotube"], true
	case strings.Contains(label, "graphene"):
		return Materials["graphene"], true
	case strings.Contains(label, "parylene"):
		return Materials["parylene_c"], true
	case strings.Contains(label, "titanium"):
		return Materials["titanium"], true
	}
	return Material{}, false
}

func inferSignal(design NormalizedDesign) SignalBand {
	app := strings.ToLower(strings.Join(design.Tissue.Application, " "))
	switch {
	case strings.Contains(app, "ecg") || strings.Contains(design.Tissue.Key, "cardiac"):
		return SignalBands["ecg"]
	case strings.Contains(app, "neural recording") || strings.Contains(design.Tissue.Key, "cortical"):
		return SignalBands["spike"]
	case strings.Contains(app, "dbs") || strings.Contains(app, "stimulation") || strings.Contains(app, "pacing"):
		return SignalBands["ep"]
	case strings.Contains(app, "eeg") || strings.Contains(design.Tissue.Key, "skin"):
		return SignalBands["eeg"]
	case strings.Contains(app, "glucose") || strings.Contains(app, "cgm"):
		return SignalBands["glucose"]
	}
	return design.Signal
}

func lowerString(v any) string {
	if v == nil {
		return ""
	}
	return strings.ToLower(strings.TrimSpace(toString(v)))
}

func toString(v any) string {
	switch value := v.(type) {
	case string:
		return value
	case float64:
		return strconv.FormatFloat(value, 'f', -1, 64)
	case int:
		return strconv.Itoa(value)
	default:
		return ""
	}
}

func numberValue(v any) float64 {
	switch value := v.(type) {
	case float64:
		return value
	case int:
		return float64(value)
	case string:
		return parseLeadingNumber(value)
	default:
		return 0
	}
}

func parseLeadingNumber(value string) float64 {
	fields := strings.Fields(strings.ReplaceAll(value, ",", ""))
	if len(fields) == 0 {
		return 0
	}
	parsed, _ := strconv.ParseFloat(fields[0], 64)
	return parsed
}

func firstPositive(values ...float64) float64 {
	for _, value := range values {
		if value > 0 {
			return value
		}
	}
	return 0
}
