package debye

type Request struct {
	Nodes         []Node         `json:"nodes"`
	Edges         []Edge         `json:"edges"`
	ScenarioID    any            `json:"scenarioId,omitempty"`
	Sweep         *SweepRequest  `json:"sweep,omitempty"`
	SignalProfile *SignalProfile `json:"signalProfile,omitempty"`
	DesignContext map[string]any `json:"designContext,omitempty"`
	Message       string         `json:"message,omitempty"`
	Conversation  []ChatMessage  `json:"conversationHistory,omitempty"`
}

type Node struct {
	ID       string         `json:"id"`
	Type     string         `json:"type"`
	Position map[string]any `json:"position,omitempty"`
	Data     map[string]any `json:"data"`
}

type Edge struct {
	ID     string         `json:"id"`
	Source string         `json:"source"`
	Target string         `json:"target"`
	Data   map[string]any `json:"data,omitempty"`
}

type SweepRequest struct {
	MinHz  float64 `json:"minHz,omitempty"`
	MaxHz  float64 `json:"maxHz,omitempty"`
	Points int     `json:"points,omitempty"`
}

type SignalProfile struct {
	Key        string  `json:"key,omitempty"`
	Bandwidth  float64 `json:"bandwidthHz,omitempty"`
	SampleRate float64 `json:"sampleRateHz,omitempty"`
	Amplitude  float64 `json:"amplitudeUV,omitempty"`
}

type ChatMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type Tissue struct {
	Key          string   `json:"key"`
	Name         string   `json:"name"`
	Conductivity float64  `json:"conductivity"`
	Permittivity float64  `json:"permittivity"`
	ColeAlpha    float64  `json:"cole_alpha"`
	Tau          float64  `json:"tau"`
	R0           float64  `json:"r0"`
	RInf         float64  `json:"r_inf"`
	NoiseUV      float64  `json:"noise_uV"`
	MotionUV     float64  `json:"motion_uV"`
	Application  []string `json:"application"`
	Citation     string   `json:"citation"`
}

type Material struct {
	Key          string  `json:"key"`
	Name         string  `json:"name"`
	CIL          float64 `json:"cil"`
	EISFactor    float64 `json:"eis_factor"`
	ISO10993     bool    `json:"iso10993"`
	ChronicSafe  bool    `json:"chronic_safe"`
	MaxYears     int     `json:"max_years"`
	Coating      bool    `json:"coating"`
	Color        string  `json:"color"`
	CPEQ         float64 `json:"cpe_q"`
	CPEAlpha     float64 `json:"cpe_alpha"`
	WarburgSigma float64 `json:"warburg_sigma"`
	Notes        string  `json:"notes"`
	Citation     string  `json:"citation"`
}

type SignalBand struct {
	Key         string  `json:"key"`
	Name        string  `json:"name"`
	FMin        float64 `json:"fMin"`
	FMax        float64 `json:"fMax"`
	MinSNR      float64 `json:"minSNR"`
	AmplitudeUV float64 `json:"amplitude_uV"`
	Citation    string  `json:"citation"`
}

type Citation struct {
	ID    string `json:"id"`
	Title string `json:"title"`
	URL   string `json:"url"`
	Note  string `json:"note"`
}

type NormalizedDesign struct {
	Tissue           Tissue     `json:"tissue"`
	Material         Material   `json:"material"`
	Signal           SignalBand `json:"signal"`
	ElectrodeArea    float64    `json:"electrodeArea"`
	TemperatureK     float64    `json:"temperatureK"`
	BandwidthHz      float64    `json:"bandwidthHz"`
	SampleRateHz     float64    `json:"sampleRateHz"`
	AmplifierNoiseNV float64    `json:"amplifierNoiseNVrtHz"`
	HasAmplifier     bool       `json:"hasAmplifier"`
	HasFilter        bool       `json:"hasFilter"`
	HasADC           bool       `json:"hasADC"`
	HasMCU           bool       `json:"hasMCU"`
	HasReference     bool       `json:"hasReference"`
	HasEncapsulant   bool       `json:"hasEncapsulant"`
	StimCurrentMA    float64    `json:"stimCurrentMA"`
	PulseWidthMS     float64    `json:"pulseWidthMS"`
	FlowRateULMin    float64    `json:"flowRateULMin"`
	ChannelWidthUM   float64    `json:"channelWidthUM"`
}

type SimulationResponse struct {
	EISData          []EISPoint         `json:"eisData"`
	NyquistData      []NyquistPoint     `json:"nyquistData"`
	TimeData         []TimePoint        `json:"timeData"`
	NoiseSources     []NoiseSource      `json:"noiseSources"`
	MonteCarlo       []MonteCarloPoint  `json:"monteCarlo"`
	DesignVariants   []DesignVariant    `json:"designVariants"`
	Impedance1kHz    string             `json:"impedance1kHz"`
	Impedance1kHzRaw float64            `json:"impedance1kHzRaw"`
	NoiseTotal       float64            `json:"noiseTotal"`
	SNR              float64            `json:"snr"`
	SignalDetectable bool               `json:"signalDetectable"`
	Tissue           string             `json:"tissue"`
	Material         string             `json:"material"`
	Signal           string             `json:"signal"`
	ElectrodeArea    float64            `json:"electrodeArea"`
	PhysicsParams    map[string]any     `json:"physicsParams"`
	SafetyMargins    map[string]float64 `json:"safetyMargins"`
	Citations        []Citation         `json:"citations"`
	Normalized       NormalizedDesign   `json:"normalized"`
	NeuralData       []NeuralPoint      `json:"neuralData,omitempty"`
	FluidicData      []FluidicPoint     `json:"fluidicData,omitempty"`
	Compliance       []ComplianceCheck  `json:"compliance,omitempty"`
}

type EISPoint struct {
	Frequency float64 `json:"frequency"`
	Magnitude float64 `json:"magnitude"`
	Phase     float64 `json:"phase"`
	ZReal     float64 `json:"zReal"`
	ZImag     float64 `json:"zImag"`
}

type NyquistPoint struct {
	Frequency float64 `json:"frequency"`
	ZReal     float64 `json:"zReal"`
	NegZImag  float64 `json:"negZImag"`
}

type TimePoint struct {
	Time    int     `json:"time"`
	Voltage float64 `json:"voltage"`
	Signal  float64 `json:"signal"`
	Noise   float64 `json:"noise"`
}

type NoiseSource struct {
	Name     string  `json:"name"`
	Value    float64 `json:"value"`
	Citation string  `json:"citation,omitempty"`
}

type MonteCarloPoint struct {
	Run       int     `json:"run"`
	SNR       float64 `json:"snr"`
	Impedance float64 `json:"impedance"`
	Noise     float64 `json:"noise"`
}

type DesignVariant struct {
	Name           string  `json:"name"`
	Material       string  `json:"material"`
	ElectrodeArea  float64 `json:"electrodeArea"`
	Impedance1kHz  float64 `json:"impedance1kHz"`
	SNR            float64 `json:"snr"`
	Recommendation string  `json:"recommendation"`
}

type DRCResponse struct {
	Errors    []Violation `json:"errors"`
	Warnings  []Violation `json:"warnings"`
	Passed    int         `json:"passed"`
	Citations []Citation  `json:"citations"`
}

type Violation struct {
	ID       string         `json:"id"`
	Title    string         `json:"title"`
	Affected string         `json:"affected"`
	Message  string         `json:"message"`
	Severity string         `json:"severity"`
	Equation string         `json:"equation,omitempty"`
	Value    float64        `json:"value,omitempty"`
	Limit    float64        `json:"limit,omitempty"`
	Citation string         `json:"citation,omitempty"`
	Fixable  bool           `json:"fixable"`
	Autofix  map[string]any `json:"autofix,omitempty"`
}

type NeuralPoint struct {
	Time   float64 `json:"time"`
	Spike  float64 `json:"spike"`
	LFP    float64 `json:"lfp"`
	Raw    float64 `json:"raw"`
}

type FluidicPoint struct {
	Position float64 `json:"position"`
	Pressure float64 `json:"pressure"`
	Velocity float64 `json:"velocity"`
}

type ComplianceCheck struct {
	Standard string `json:"standard"`
	Status   string `json:"status"` // "PASS", "FAIL", "WARNING"
	Value    string `json:"value"`
	Limit    string `json:"limit"`
	Details  string `json:"details"`
}
