// ============================================================
// Debye Bio — Biological Knowledge Database
// All values sourced from peer-reviewed electrochemistry literature
// ============================================================

export const TISSUES = {
  subcutaneous: {
    name: "Subcutaneous Tissue",
    conductivity: 0.3,      // S/m
    permittivity: 1200,
    cole_alpha: 0.78,
    tau: 1.2e-3,
    r0: 650,                // Low-freq resistance (Ω·cm)
    r_inf: 320,             // High-freq resistance
    noise_uV: 1.2,          // Biological background noise µVrms
    application: ["CGM", "Wearable", "Drug Delivery"],
    citation: "Gabriel et al. (1996) Phys. Med. Biol. 41(11)"
  },
  cardiac: {
    name: "Cardiac Muscle",
    conductivity: 0.4,
    permittivity: 1600,
    cole_alpha: 0.72,
    tau: 0.8e-3,
    r0: 420,
    r_inf: 180,
    noise_uV: 3.0,
    application: ["ECG", "Pacing", "Defibrillation"],
    citation: "Faes et al. (1999) Med. Biol. Eng. Comput. 37(3)"
  },
  cortical: {
    name: "Cortical Gray Matter",
    conductivity: 0.3,
    permittivity: 2000,
    cole_alpha: 0.65,
    tau: 5e-3,
    r0: 800,
    r_inf: 350,
    noise_uV: 5.0,
    application: ["Neural Recording", "BCI", "DBS"],
    citation: "Logothetis et al. (2007) Nature 450"
  },
  white_matter: {
    name: "White Matter",
    conductivity: 0.15,
    permittivity: 1500,
    cole_alpha: 0.70,
    tau: 4e-3,
    r0: 1200,
    r_inf: 550,
    noise_uV: 2.0,
    application: ["DBS", "Neural Recording"],
    citation: "Gabriel et al. (1996) Phys. Med. Biol. 41(11)"
  },
  blood: {
    name: "Blood",
    conductivity: 0.7,
    permittivity: 2500,
    cole_alpha: 0.90,
    tau: 0.2e-3,
    r0: 180,
    r_inf: 140,
    noise_uV: 0.5,
    application: ["Intravascular", "Blood glucose", "Impedance hematology"],
    citation: "Geddes & Baker (1967) Med. Biol. Eng. 5(3)"
  },
  skin_epidermis: {
    name: "Skin (Epidermis)",
    conductivity: 0.0002,
    permittivity: 1100,
    cole_alpha: 0.50,
    tau: 8e-3,
    r0: 12000,
    r_inf: 100,
    noise_uV: 8.0,
    application: ["EEG", "ECG", "Wearable"],
    citation: "Yamamoto & Yamamoto (1976) Med. Biol. Eng. Comput. 14"
  },
  peripheral_nerve: {
    name: "Peripheral Nerve",
    conductivity: 0.08,
    permittivity: 3000,
    cole_alpha: 0.60,
    tau: 10e-3,
    r0: 1500,
    r_inf: 600,
    noise_uV: 2.5,
    application: ["Neural Stimulation", "Pain Management"],
    citation: "Ranck (1963) Exp. Neurol. 7(2)"
  },
  gastric: {
    name: "Gastric Mucosa",
    conductivity: 0.6,
    permittivity: 2200,
    cole_alpha: 0.82,
    tau: 0.5e-3,
    r0: 280,
    r_inf: 120,
    noise_uV: 1.8,
    application: ["GI Monitoring", "Gastric Pacing"],
    citation: "O'Brien et al. (2010) Physiol. Meas. 31"
  },
  wound: {
    name: "Wound Bed (Acute)",
    conductivity: 0.5,
    permittivity: 1800,
    cole_alpha: 0.75,
    tau: 1.0e-3,
    r0: 350,
    r_inf: 200,
    noise_uV: 2.2,
    application: ["Wound Monitoring", "Electrostimulation"],
    citation: "Swain & Bhansali (2019) Biosens. Bioelectron."
  },
  wound_chronic: {
    name: "Wound Bed (Chronic)",
    conductivity: 0.35,
    permittivity: 1400,
    cole_alpha: 0.68,
    tau: 2.0e-3,
    r0: 550,
    r_inf: 280,
    noise_uV: 3.5,
    application: ["Chronic Wound Care", "Biofilm Monitoring"],
    citation: "Swain & Bhansali (2019) Biosens. Bioelectron."
  },
  retina: {
    name: "Retina",
    conductivity: 0.28,
    permittivity: 1900,
    cole_alpha: 0.63,
    tau: 6e-3,
    r0: 900,
    r_inf: 400,
    noise_uV: 4.0,
    application: ["Retinal Prosthesis", "ERG Recording"],
    citation: "Weiland & Humayun (2014) IEEE Trans. Biomed. Eng."
  },
  liver: {
    name: "Liver",
    conductivity: 0.28,
    permittivity: 2100,
    cole_alpha: 0.73,
    tau: 1.5e-3,
    r0: 700,
    r_inf: 300,
    noise_uV: 1.0,
    application: ["Bioimpedance Analysis", "Thermal Ablation"],
    citation: "Gabriel et al. (1996) Phys. Med. Biol. 41(11)"
  },
  bone: {
    name: "Bone (Cortical)",
    conductivity: 0.006,
    permittivity: 500,
    cole_alpha: 0.55,
    tau: 15e-3,
    r0: 8000,
    r_inf: 1200,
    noise_uV: 0.2,
    application: ["Fracture Healing", "Implant Osseointegration"],
    citation: "Sierpowska et al. (2006) J. Biomech. 39(5)"
  },
  csf: {
    name: "Cerebrospinal Fluid",
    conductivity: 1.79,
    permittivity: 109,
    cole_alpha: 0.97,
    tau: 0.1e-3,
    r0: 55,
    r_inf: 52,
    noise_uV: 0.3,
    application: ["Intracranial Recording", "DBS"],
    citation: "Gabriel et al. (1996) Phys. Med. Biol. 41(11)"
  },
  fat: {
    name: "Adipose Tissue",
    conductivity: 0.04,
    permittivity: 900,
    cole_alpha: 0.58,
    tau: 12e-3,
    r0: 3500,
    r_inf: 700,
    noise_uV: 0.4,
    application: ["Body Composition", "Wearable Sensing"],
    citation: "Kyle et al. (2004) Clin. Nutr. 23(6)"
  },
};

export const MATERIALS = {
  platinum: {
    name: "Platinum",
    cil: 0.15,                    // Charge injection limit mC/cm²
    eis_factor: 2.5,              // Impedance multiplier vs reference
    iso10993: true,
    chronic_safe: true,
    max_years: 10,
    coating: false,
    color: "#E5E4E2",
    notes: "Gold standard for neural and cardiac electrodes. Excellent biocompatibility, moderate CIL.",
    citation: "Cogan (2008) Annu. Rev. Biomed. Eng."
  },
  platinum_iridium: {
    name: "Platinum-Iridium (90/10)",
    cil: 0.35,
    eis_factor: 1.8,
    iso10993: true,
    chronic_safe: true,
    max_years: 10,
    coating: false,
    color: "#C8C8C8",
    notes: "Higher CIL than pure Pt. Harder, more durable. Standard for DBS and cochlear implants.",
    citation: "Merrill et al. (2005) J. Neurosci. Methods"
  },
  pedot: {
    name: "PEDOT:PSS",
    cil: 15.0,
    eis_factor: 0.05,
    iso10993: true,
    chronic_safe: false,
    max_years: 2,
    coating: true,
    color: "#6B21A8",
    notes: "Conducting polymer. 100x lower impedance than Pt. Excellent for recording, limited chronic stability.",
    citation: "Ludwig et al. (2011) J. Neural Eng. 8(1)"
  },
  iridium_oxide: {
    name: "Iridium Oxide (IrOx)",
    cil: 4.0,
    eis_factor: 0.3,
    iso10993: true,
    chronic_safe: true,
    max_years: 5,
    coating: true,
    color: "#1D4ED8",
    notes: "High CIL, low impedance. Preferred for retinal prostheses and cortical stimulation.",
    citation: "Cogan et al. (2004) J. Neural Eng."
  },
  gold: {
    name: "Gold",
    cil: 0.1,
    eis_factor: 3.2,
    iso10993: true,
    chronic_safe: true,
    max_years: 8,
    coating: false,
    color: "#EAB308",
    notes: "Lower CIL than Pt. Used in flexible electronics and microelectrode arrays.",
    citation: "Williams (2008) Biomaterials 29(13)"
  },
  titanium_nitride: {
    name: "Titanium Nitride (TiN)",
    cil: 1.0,
    eis_factor: 0.8,
    iso10993: true,
    chronic_safe: true,
    max_years: 7,
    coating: true,
    color: "#78716C",
    notes: "High surface area, low impedance. Good for EEG and MEA applications.",
    citation: "Nordhausen et al. (1996) Brain Res. 726"
  },
  carbon_nanotube: {
    name: "Carbon Nanotube (CNT)",
    cil: 8.0,
    eis_factor: 0.1,
    iso10993: false,
    chronic_safe: false,
    max_years: 1,
    coating: true,
    color: "#1C1917",
    notes: "Extremely low impedance. Chronic biocompatibility not yet established. Research use only.",
    citation: "Keefer et al. (2008) Nature Nanotech. 3"
  },
  graphene: {
    name: "Graphene",
    cil: 3.0,
    eis_factor: 0.15,
    iso10993: false,
    chronic_safe: false,
    max_years: 1,
    coating: true,
    color: "#374151",
    notes: "Transparent, flexible. Promising for optical+electrical co-recording. Pre-clinical only.",
    citation: "Park et al. (2018) ACS Nano"
  },
  parylene_c: {
    name: "Parylene-C (Insulator)",
    cil: 0,
    eis_factor: 9999,
    iso10993: true,
    chronic_safe: true,
    max_years: 10,
    coating: false,
    color: "#D1FAE5",
    notes: "Conformal insulating coating. Standard encapsulant for chronic implants. Not an electrode material.",
    citation: "Seymour et al. (2009) Biomaterials 30(31)"
  },
  titanium: {
    name: "Titanium (Structural)",
    cil: 0,
    eis_factor: 9999,
    iso10993: true,
    chronic_safe: true,
    max_years: 20,
    coating: false,
    color: "#9CA3AF",
    notes: "Structural enclosure material. Not an electrode. Best osseointegration of any metal.",
    citation: "Albrektsson et al. (1981) Acta Orthop. Scand."
  },
};

export const DRC_RULES = {
  // Errors
  BIO001: { id: "BIO-001", severity: "error", name: "Electrode impedance out of range for application" },
  BIO002: { id: "BIO-002", severity: "error", name: "Electrode pitch smaller than target cell soma" },
  BIO003: { id: "BIO-003", severity: "error", name: "Charge injection limit exceeded" },
  BIO004: { id: "BIO-004", severity: "error", name: "No reference electrode in 3-electrode system" },
  BIO005: { id: "BIO-005", severity: "error", name: "Electrode area below minimum sensitivity threshold" },
  BIO006: { id: "BIO-006", severity: "error", name: "Material not ISO 10993 biocompatibility approved" },
  BIO007: { id: "BIO-007", severity: "error", name: "No encapsulant on chronic implant device" },
  // Warnings
  WARN003: { id: "WARN-003", severity: "warning", name: "No motion artifact filter" },
  WARN007: { id: "WARN-007", severity: "warning", name: "Material fouling risk for chronic use" },
  WARN010: { id: "WARN-010", severity: "warning", name: "SNR below recommended threshold" },
  WARN011: { id: "WARN-011", severity: "warning", name: "No temperature compensation on potentiostat" },
  WARN012: { id: "WARN-012", severity: "warning", name: "Electrode spacing may cause common-mode interference" },
  WARN015: { id: "WARN-015", severity: "warning", name: "Impedance drift expected over device lifetime" },
  WARN020: { id: "WARN-020", severity: "warning", name: "Power budget not defined" },
  WARN021: { id: "WARN-021", severity: "warning", name: "Wireless data rate may be insufficient for neural bandwidth" },
};

// Physiological signal bands and their SNR requirements
export const SIGNAL_BANDS = {
  eeg:    { name: "EEG",             fMin: 0.5,  fMax: 100,   minSNR: 10, amplitude_uV: 10  },
  ecg:    { name: "ECG",             fMin: 0.05, fMax: 150,   minSNR: 20, amplitude_uV: 1000 },
  emg:    { name: "EMG",             fMin: 20,   fMax: 2000,  minSNR: 15, amplitude_uV: 500  },
  spike:  { name: "Neural Spikes",   fMin: 300,  fMax: 5000,  minSNR: 6,  amplitude_uV: 50   },
  lfp:    { name: "Local Field Pot", fMin: 1,    fMax: 300,   minSNR: 8,  amplitude_uV: 200  },
  glucose:{ name: "Glucose (Amper)", fMin: 0.01, fMax: 1,     minSNR: 30, amplitude_uV: 5    },
  ep:     { name: "Evoked Potential",fMin: 1,    fMax: 1000,  minSNR: 12, amplitude_uV: 20   },
};
