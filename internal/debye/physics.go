package debye

import (
	"fmt"
	"math"
	"math/cmplx"
	"sort"
)

const (
	boltzmann = 1.380649e-23
	qElectron = 1.602176634e-19
	gasR      = 8.314462618
	faraday   = 96485.33212
)

func RunSimulation(req Request) SimulationResponse {
	design := NormalizeDesign(req)
	minHz, maxHz, points := sweepBounds(req.Sweep)

	eis := make([]EISPoint, 0, points)
	nyquist := make([]NyquistPoint, 0, points)
	var z1k EISPoint
	bestDist := math.MaxFloat64
	for i := 0; i < points; i++ {
		logF := math.Log10(minHz) + (math.Log10(maxHz)-math.Log10(minHz))*float64(i)/float64(points-1)
		f := math.Pow(10, logF)
		zt := coleColeImpedance(f, design.Tissue)
		ze, _ := randlesImpedance(f, design.Material, design.ElectrodeArea)
		z := zt + ze
		point := EISPoint{
			Frequency: round(f, 5),
			Magnitude: round(cmplx.Abs(z), 3),
			Phase:     round(cmplx.Phase(z)*180/math.Pi, 3),
			ZReal:     round(real(z), 3),
			ZImag:     round(imag(z), 3),
		}
		eis = append(eis, point)
		nyquist = append(nyquist, NyquistPoint{Frequency: point.Frequency, ZReal: point.ZReal, NegZImag: round(-point.ZImag, 3)})
		if dist := math.Abs(f - 1000); dist < bestDist {
			bestDist = dist
			z1k = point
		}
	}

	noiseSources, totalNoise := noiseBudget(design, math.Max(z1k.ZReal, 1))
	signalRMS := design.Signal.AmplitudeUV / math.Sqrt2
	snr := 20 * math.Log10(signalRMS/math.Max(totalNoise, 1e-9))
	snr = round(snr, 1)
	timeData := deterministicTimeSeries(design, totalNoise)
	chargeDensity := chargeDensityMCPerCM2(design)
	cilMargin := 999.0
	if design.Material.CIL > 0 && chargeDensity > 0 {
		cilMargin = round(design.Material.CIL/chargeDensity, 2)
	}

	return SimulationResponse{
		EISData:          eis,
		NyquistData:      nyquist,
		TimeData:         timeData,
		NoiseSources:     noiseSources,
		MonteCarlo:       monteCarlo(design, z1k.Magnitude, totalNoise),
		DesignVariants:   variants(design),
		Impedance1kHz:    formatImpedance(z1k.Magnitude),
		Impedance1kHzRaw: round(z1k.Magnitude, 3),
		NoiseTotal:       round(totalNoise, 2),
		SNR:              snr,
		SignalDetectable: snr >= design.Signal.MinSNR,
		Tissue:           design.Tissue.Name,
		Material:         design.Material.Name,
		Signal:           design.Signal.Name,
		ElectrodeArea:    design.ElectrodeArea,
		PhysicsParams: map[string]any{
			"r0": design.Tissue.R0, "r_inf": design.Tissue.RInf, "tau": design.Tissue.Tau, "cole_alpha": design.Tissue.ColeAlpha,
			"rSolution": round(solutionResistance(design.Material, design.ElectrodeArea), 2),
			"rCt":       round(chargeTransferResistance(design.Material, design.ElectrodeArea), 2),
			"cpeQ":      design.Material.CPEQ, "cpeAlpha": design.Material.CPEAlpha, "warburgSigma": design.Material.WarburgSigma,
			"nernst_mV":    round(nernstPotentialMV(design.TemperatureK, 1, 10, 1), 2),
			"signalRMS_uV": round(signalRMS, 2),
		},
		SafetyMargins: map[string]float64{
			"snrMarginDb":             round(snr-design.Signal.MinSNR, 2),
			"chargeInjectionMargin":   cilMargin,
			"nyquistSampleRateMargin": round(design.SampleRateHz/math.Max(2*design.Signal.FMax, 1), 2),
		},
		Citations:  Citations,
		Normalized: design,
	}
}

func coleColeImpedance(freq float64, tissue Tissue) complex128 {
	omega := 2 * math.Pi * freq
	term := cmplx.Pow(complex(0, omega*tissue.Tau), complex(tissue.ColeAlpha, 0))
	z := complex(tissue.RInf, 0) + complex(tissue.R0-tissue.RInf, 0)/(1+term)
	return z
}

func randlesImpedance(freq float64, material Material, areaUM2 float64) (complex128, map[string]float64) {
	omega := 2 * math.Pi * freq
	rs := solutionResistance(material, areaUM2)
	rct := chargeTransferResistance(material, areaUM2)
	areaScale := math.Max(areaUM2/1000, 0.001)
	q := material.CPEQ * areaScale
	yCPE := complex(q, 0) * cmplx.Pow(complex(0, omega), complex(material.CPEAlpha, 0))
	zw := warburgImpedance(omega, material.WarburgSigma/math.Sqrt(areaScale))
	faradaic := complex(rct, 0) + zw
	yFaradaic := 1 / faradaic
	parallel := 1 / (yCPE + yFaradaic)
	return complex(rs, 0) + parallel, map[string]float64{"rSolution": rs, "rCt": rct, "cpeQ": q, "warburgSigma": material.WarburgSigma}
}

func warburgImpedance(omega, sigma float64) complex128 {
	if omega <= 0 {
		omega = 1e-9
	}
	return complex(sigma/math.Sqrt(omega), -sigma/math.Sqrt(omega))
}

func solutionResistance(material Material, areaUM2 float64) float64 {
	return math.Max(25, 420*material.EISFactor/math.Sqrt(math.Max(areaUM2, 1)/1000))
}

func chargeTransferResistance(material Material, areaUM2 float64) float64 {
	return math.Max(1, (2.0e6*material.EISFactor)/(math.Max(areaUM2, 1)/1000))
}

func nernstPotentialMV(tempK float64, z float64, outside float64, inside float64) float64 {
	if z == 0 || inside <= 0 || outside <= 0 {
		return 0
	}
	return (gasR * tempK / (z * faraday)) * math.Log(outside/inside) * 1000
}

func noiseBudget(design NormalizedDesign, electrodeResistance float64) ([]NoiseSource, float64) {
	bandwidth := math.Max(design.Signal.FMax-design.Signal.FMin, 1)
	if design.BandwidthHz > 0 {
		bandwidth = math.Min(design.BandwidthHz, math.Max(design.Signal.FMax*1.25, bandwidth))
	}
	thermal := math.Sqrt(4*boltzmann*design.TemperatureK*electrodeResistance*bandwidth) * 1e6
	amp := design.AmplifierNoiseNV * 1e-3 * math.Sqrt(bandwidth)
	if !design.HasAmplifier {
		amp *= 1.8
	}
	motion := design.Tissue.MotionUV
	if design.HasFilter {
		motion *= 0.45
	}
	bio := design.Tissue.NoiseUV * math.Sqrt(math.Max(bandwidth, 1)/100)
	shot := math.Sqrt(2*qElectron*1e-9*bandwidth) * math.Max(electrodeResistance, 1) * 1e6
	adc := 0.02
	if !design.HasADC {
		adc = 0.08
	}
	sources := []NoiseSource{
		{Name: "Thermal", Value: round(thermal, 2), Citation: "Johnson-Nyquist noise"},
		{Name: "Amplifier", Value: round(amp, 2), Citation: "Input-referred voltage noise integrated over bandwidth"},
		{Name: "Motion Artifact", Value: round(motion, 2), Citation: design.Tissue.Citation},
		{Name: "Biological", Value: round(bio, 2), Citation: design.Tissue.Citation},
		{Name: "Shot Noise", Value: round(shot, 2), Citation: "Shot noise approximation"},
		{Name: "ADC Quantization", Value: round(adc, 2), Citation: "Quantization noise approximation"},
	}
	sort.Slice(sources, func(i, j int) bool { return sources[i].Value > sources[j].Value })
	var rss float64
	for _, source := range sources {
		rss += source.Value * source.Value
	}
	return sources, math.Sqrt(rss)
}

func deterministicTimeSeries(design NormalizedDesign, noiseUV float64) []TimePoint {
	points := make([]TimePoint, 100)
	sampleRate := math.Max(design.SampleRateHz, 100)
	signalFreq := math.Max(design.Signal.FMin, 1)
	if design.Signal.FMax > signalFreq {
		signalFreq = math.Sqrt(design.Signal.FMin * design.Signal.FMax)
	}
	seed := uint32(len(design.Tissue.Key)*131 + len(design.Material.Key)*313 + int(design.ElectrodeArea))
	for i := range points {
		seed = seed*1664525 + 1013904223
		noiseUnit := float64(seed%10000)/5000 - 1
		t := float64(i) / sampleRate
		signal := design.Signal.AmplitudeUV * math.Sin(2*math.Pi*signalFreq*t)
		noise := noiseUnit*noiseUV*0.65 + 0.25*noiseUV*math.Sin(2*math.Pi*0.7*float64(i)/100)
		points[i] = TimePoint{Time: i, Signal: round(signal, 2), Noise: round(noise, 2), Voltage: round(signal+noise, 2)}
	}
	return points
}

func chargeDensityMCPerCM2(design NormalizedDesign) float64 {
	if design.StimCurrentMA <= 0 || design.PulseWidthMS <= 0 || design.ElectrodeArea <= 0 {
		return 0
	}
	chargeUC := design.StimCurrentMA * design.PulseWidthMS
	areaCM2 := design.ElectrodeArea * 1e-8
	return (chargeUC * 1e-3) / areaCM2
}

func monteCarlo(design NormalizedDesign, baseZ float64, baseNoise float64) []MonteCarloPoint {
	points := make([]MonteCarloPoint, 24)
	for i := range points {
		areaScale := 1 + deterministicSpread(i, 0.12)
		noiseScale := 1 + deterministicSpread(i+7, 0.18)
		z := baseZ / math.Max(areaScale, 0.2)
		noise := baseNoise * math.Max(noiseScale, 0.2)
		snr := 20 * math.Log10((design.Signal.AmplitudeUV/math.Sqrt2)/math.Max(noise, 1e-9))
		points[i] = MonteCarloPoint{Run: i + 1, SNR: round(snr, 1), Impedance: round(z, 1), Noise: round(noise, 2)}
	}
	return points
}

func variants(design NormalizedDesign) []DesignVariant {
	candidates := []string{"platinum", "platinum_iridium", "iridium_oxide", "pedot", "titanium_nitride"}
	var out []DesignVariant
	for _, key := range candidates {
		material := Materials[key]
		clone := design
		clone.Material = material
		z, _ := randlesImpedance(1000, material, design.ElectrodeArea)
		zt := coleColeImpedance(1000, design.Tissue)
		total := cmplx.Abs(z + zt)
		_, noise := noiseBudget(clone, math.Max(real(z), 1))
		snr := 20 * math.Log10((design.Signal.AmplitudeUV/math.Sqrt2)/math.Max(noise, 1e-9))
		rec := "balanced"
		if snr > design.Signal.MinSNR+6 && material.ChronicSafe {
			rec = "recommended"
		}
		if !material.ISO10993 {
			rec = "research only"
		}
		out = append(out, DesignVariant{Name: material.Name, Material: key, ElectrodeArea: design.ElectrodeArea, Impedance1kHz: round(total, 1), SNR: round(snr, 1), Recommendation: rec})
	}
	sort.Slice(out, func(i, j int) bool { return out[i].SNR > out[j].SNR })
	return out
}

func deterministicSpread(i int, width float64) float64 {
	x := math.Sin(float64(i)*12.9898+78.233) * 43758.5453
	return (x - math.Floor(x) - 0.5) * 2 * width
}

func sweepBounds(sweep *SweepRequest) (float64, float64, int) {
	minHz, maxHz, points := 1.0, 100000.0, 61
	if sweep != nil {
		if sweep.MinHz > 0 {
			minHz = sweep.MinHz
		}
		if sweep.MaxHz > minHz {
			maxHz = sweep.MaxHz
		}
		if sweep.Points >= 16 && sweep.Points <= 240 {
			points = sweep.Points
		}
	}
	return minHz, maxHz, points
}

func formatImpedance(ohms float64) string {
	switch {
	case ohms >= 1e6:
		return trim(round(ohms/1e6, 1)) + " Mohm"
	case ohms >= 1e3:
		return trim(round(ohms/1e3, 1)) + " kohm"
	default:
		return trim(round(ohms, 0)) + " ohm"
	}
}

func round(v float64, places int) float64 {
	scale := math.Pow(10, float64(places))
	return math.Round(v*scale) / scale
}

func trim(v float64) string {
	if math.Abs(v-math.Round(v)) < 1e-9 {
		return strconvFormat(math.Round(v), 0)
	}
	return strconvFormat(v, 1)
}

func strconvFormat(v float64, places int) string {
	if places < 0 || places > 9 {
		places = 1
	}
	return fmt.Sprintf("%.*f", places, v)
}
