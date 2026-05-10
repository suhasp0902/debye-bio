export const TISSUES = {
  subcutaneous: { conductivity: 0.3, permittivity: 1200, name: "Subcutaneous Tissue" },
  cardiac: { conductivity: 0.4, permittivity: 1600, name: "Cardiac Muscle" },
  cortical: { conductivity: 0.3, permittivity: 2000, name: "Cortical Gray Matter" },
  blood: { conductivity: 0.7, permittivity: 2500, name: "Blood" },
  skin: { conductivity: 0.02, permittivity: 1100, name: "Skin (Epidermis)" },
};

export const MATERIALS = {
  platinum: { cil: 0.15, eis_1kHz: "0.5–5 MΩ·µm²", iso10993: true, name: "Platinum" },
  pedot: { cil: 15, eis_1kHz: "0.01–0.1 MΩ·µm²", iso10993: true, name: "PEDOT:PSS" },
  gold: { cil: 0.1, eis_1kHz: "1–10 MΩ·µm²", iso10993: true, name: "Gold" },
  iridium_oxide: { cil: 4.0, eis_1kHz: "0.05–0.5 MΩ·µm²", iso10993: true, name: "Iridium Oxide" },
  titanium_nitride: { cil: 1.0, eis_1kHz: "0.1–1 MΩ·µm²", iso10993: true, name: "Titanium Nitride" },
};

export const DRC_RULES = {
  BIO001: { id: "BIO-001", severity: "error", name: "Electrode impedance out of range" },
  BIO002: { id: "BIO-002", severity: "error", name: "Electrode pitch smaller than target cell soma" },
  WARN003: { id: "WARN-003", severity: "warning", name: "No motion artifact filter" },
  WARN007: { id: "WARN-007", severity: "warning", name: "Material fouling risk for chronic use" },
};
