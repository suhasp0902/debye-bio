import { TISSUES, MATERIALS } from '../data/bioData';

// ============================================================
// Debye Bio — Physics-Grounded Simulation Engine
// Implements Cole-Cole impedance model + Randles circuit
// + thermal noise budget from electrode/tissue properties
// ============================================================

// Boltzmann constant * room temp (310K body temp)
const kT = 1.38e-23 * 310; // J

const paletteTissueMap = {
  'bio_subq': 'subcutaneous',
  'bio_cardiac': 'cardiac',
  'bio_cortex': 'cortical',
  'bio_white': 'white_matter',
  'bio_blood': 'blood',
  'bio_skin': 'skin_epidermis',
  'bio_nerve': 'peripheral_nerve',
  'bio_gastric': 'gastric',
  'bio_wound_a': 'wound',
  'bio_wound_c': 'wound_chronic',
  'bio_retina': 'retina',
  'bio_liver': 'liver',
  'bio_bone': 'bone',
  'bio_csf': 'csf',
  'bio_fat': 'fat',
};

const paletteMaterialMap = {
  'mat_pt': 'platinum',
  'mat_ptir': 'platinum_iridium',
  'mat_au': 'gold',
  'mat_irox': 'iridium_oxide',
  'mat_tin': 'titanium_nitride',
  'mat_pedot': 'pedot',
  'mat_cnt': 'carbon_nanotube',
  'mat_graphene': 'graphene',
  'mat_parylene': 'parylene_c',
  'mat_ti': 'titanium',
};

/**
 * Resolve tissue key from node label or itemId
 */
function resolveTissue(label, itemId) {
  if (itemId && paletteTissueMap[itemId]) {
    return { key: paletteTissueMap[itemId], ...TISSUES[paletteTissueMap[itemId]] };
  }
  if (!label) return null;
  const l = label.toLowerCase();
  for (const [key, tissue] of Object.entries(TISSUES)) {
    if (l.includes(key) || l.includes(tissue.name.toLowerCase().split(' ')[0].toLowerCase())) {
      return { key, ...tissue };
    }
  }
  // Fuzzy matching
  if (l.includes('subcutaneous') || l.includes('glucose')) return { key: 'subcutaneous', ...TISSUES.subcutaneous };
  if (l.includes('cardiac') || l.includes('heart')) return { key: 'cardiac', ...TISSUES.cardiac };
  if (l.includes('brain') || l.includes('cortex') || l.includes('cortical')) return { key: 'cortical', ...TISSUES.cortical };
  if (l.includes('blood')) return { key: 'blood', ...TISSUES.blood };
  if (l.includes('skin') || l.includes('epidermis')) return { key: 'skin_epidermis', ...TISSUES.skin_epidermis };
  if (l.includes('nerve') || l.includes('peripheral')) return { key: 'peripheral_nerve', ...TISSUES.peripheral_nerve };
  if (l.includes('gastric') || l.includes('stomach')) return { key: 'gastric', ...TISSUES.gastric };
  if (l.includes('wound')) return { key: 'wound', ...TISSUES.wound };
  if (l.includes('retina')) return { key: 'retina', ...TISSUES.retina };
  if (l.includes('liver')) return { key: 'liver', ...TISSUES.liver };
  if (l.includes('bone')) return { key: 'bone', ...TISSUES.bone };
  if (l.includes('csf') || l.includes('cerebrospinal')) return { key: 'csf', ...TISSUES.csf };
  if (l.includes('fat') || l.includes('adipose')) return { key: 'fat', ...TISSUES.fat };
  return null;
}

/**
 * Resolve material key from node label/data or itemId
 */
function resolveMaterial(label, itemId) {
  if (itemId && paletteMaterialMap[itemId]) {
    return { key: paletteMaterialMap[itemId], ...MATERIALS[paletteMaterialMap[itemId]] };
  }
  if (!label) return null;
  const l = label.toLowerCase();
  for (const [key, mat] of Object.entries(MATERIALS)) {
    if (l.includes(key) || l.includes(mat.name.toLowerCase().split(' ')[0].toLowerCase())) {
      return { key, ...mat };
    }
  }
  if (l.includes('pedot') || l.includes('pss')) return { key: 'pedot', ...MATERIALS.pedot };
  if (l.includes('pt-ir') || l.includes('platinum-iridium') || l.includes('ptiridium')) return { key: 'platinum_iridium', ...MATERIALS.platinum_iridium };
  if (l.includes('platinum') || l.includes('pt')) return { key: 'platinum', ...MATERIALS.platinum };
  if (l.includes('gold') || l.includes('au')) return { key: 'gold', ...MATERIALS.gold };
  if (l.includes('irox') || l.includes('iridium oxide')) return { key: 'iridium_oxide', ...MATERIALS.iridium_oxide };
  if (l.includes('tin') || l.includes('titanium nitride')) return { key: 'titanium_nitride', ...MATERIALS.titanium_nitride };
  if (l.includes('cnt') || l.includes('carbon nanotube')) return { key: 'carbon_nanotube', ...MATERIALS.carbon_nanotube };
  if (l.includes('graphene')) return { key: 'graphene', ...MATERIALS.graphene };
  return null;
}

/**
 * Cole-Cole impedance model:
 * Z(ω) = R_inf + (R_0 - R_inf) / (1 + (jωτ)^α)
 */
function coleColeImpedance(freq, tissue) {
  const omega = 2 * Math.PI * freq;
  const { r0, r_inf, tau, cole_alpha } = tissue;

  const wt = omega * tau;
  const wt_alpha = Math.pow(wt, cole_alpha);

  // (jωτ)^α = wt^α * (cos(απ/2) + j*sin(απ/2))
  const cosA = Math.cos(cole_alpha * Math.PI / 2);
  const sinA = Math.sin(cole_alpha * Math.PI / 2);

  const denom_real = 1 + wt_alpha * cosA;
  const denom_imag = wt_alpha * sinA;
  const denom_mag_sq = denom_real * denom_real + denom_imag * denom_imag;

  const delta_R = r0 - r_inf;

  const z_real = r_inf + delta_R * denom_real / denom_mag_sq;
  const z_imag = -delta_R * denom_imag / denom_mag_sq;

  return { real: z_real, imag: z_imag };
}

/**
 * Randles circuit electrode impedance
 * Models: R_solution + (R_ct || C_dl)
 */
function randlesImpedance(freq, rSolution, rCt, cDl) {
  const omega = 2 * Math.PI * freq;
  const denom = 1 + Math.pow(omega * rCt * cDl, 2);
  const zPReal = rCt / denom;
  const zPImag = -(omega * rCt * rCt * cDl) / denom;

  return {
    real: rSolution + zPReal,
    imag: zPImag
  };
}

/**
 * Compute electrode circuit parameters from material + area
 */
function electrodeParams(material, area_um2) {
  // Base impedance values scaled by material factor and area
  const rSolution = 500 * (1000 / area_um2); // Scales inversely with area
  const rCt = (2e6 * material.eis_factor) / (area_um2 / 1000);
  const cDl = (50e-9 / material.eis_factor) * (area_um2 / 1000);

  return { rSolution: Math.max(50, rSolution), rCt, cDl };
}

/**
 * Format impedance value for display
 */
function formatImpedance(ohms) {
  if (ohms >= 1e6) return `${(ohms / 1e6).toFixed(1)} MΩ`;
  if (ohms >= 1e3) return `${(ohms / 1e3).toFixed(1)} kΩ`;
  return `${ohms.toFixed(0)} Ω`;
}

/**
 * Main simulation runner — reads actual canvas nodes
 */
export function runSimulation(nodes) {
  // ---- Extract design parameters from canvas nodes ----
  let tissue = null;
  let material = null;
  let electrodeArea = 1000; // default µm²
  let hasMCU = false;
  let hasAmplifier = false;
  let hasFilter = false;

  for (const node of nodes) {
    const d = node.data || {};
    const label = d.label || '';
    const itemId = d.item_id;

    // Find tissue
    if (node.type === 'biology' || d.type === 'tissue') {
      const t = resolveTissue(label, itemId);
      if (t) tissue = t;
    }

    // Find electrode material
    if (node.type === 'material' || node.type === 'electronics') {
      const m = resolveMaterial(label, itemId);
      if (m) material = m;
      if (d.area) electrodeArea = Number(d.area);
      if (d.material) {
        const mm = resolveMaterial(d.material, null);
        if (mm) material = mm;
      }
    }

    // Track signal chain components
    const ll = label.toLowerCase();
    if (ll.includes('mcu') || ll.includes('microcontroller')) hasMCU = true;
    if (ll.includes('amplifier') || ll.includes('amp')) hasAmplifier = true;
    if (ll.includes('filter') || ll.includes('adc')) hasFilter = true;
    if (ll.includes('electrode') && d.area) electrodeArea = Number(d.area);
  }

  // Fallback defaults if canvas doesn't have explicit tissue/material
  if (!tissue) tissue = { key: 'subcutaneous', ...TISSUES.subcutaneous };
  if (!material) material = { key: 'platinum', ...MATERIALS.platinum };

  // ---- Compute Randles circuit parameters ----
  const { rSolution, rCt, cDl } = electrodeParams(material, electrodeArea);

  // ---- EIS sweep (combined Cole-Cole + Randles) ----
  const eisData = [];
  for (let logF = 0; logF <= 5; logF += 0.1) {
    const f = Math.pow(10, logF);

    // Tissue impedance (Cole-Cole)
    const zTissue = coleColeImpedance(f, tissue);
    // Electrode impedance (Randles)
    const zElectrode = randlesImpedance(f, rSolution, rCt, cDl);

    // Total = tissue + electrode in series
    const zReal = zTissue.real + zElectrode.real;
    const zImag = zTissue.imag + zElectrode.imag;

    const magnitude = Math.sqrt(zReal * zReal + zImag * zImag);
    const phase = Math.atan2(zImag, zReal) * (180 / Math.PI);

    eisData.push({
      frequency: f,
      magnitude,
      phase,
      zReal,
      zImag
    });
  }

  // ---- Impedance at 1 kHz ----
  const z1k = eisData.find(d => d.frequency >= 1000);
  const impedance1kHz = z1k ? formatImpedance(z1k.magnitude) : "N/A";
  const impedance1kHzRaw = z1k ? z1k.magnitude : 0;

  // ---- Noise Budget (physics-grounded) ----
  const bandwidth = 10000; // 10 kHz measurement bandwidth
  const thermalNoise = Math.sqrt(4 * kT * (rCt + rSolution) * bandwidth) * 1e6; // µV
  const amplifierNoise = hasAmplifier ? 0.8 : 1.6; // Good amplifier reduces noise
  const motionNoiseBase = tissue.key === 'skin_epidermis' ? 3.0 : tissue.key === 'cardiac' ? 2.5 : 1.2;
  const motionNoise = hasFilter ? motionNoiseBase * 0.5 : motionNoiseBase;
  const biologicalNoise = tissue.noise_uV;
  const shotNoise = 0.3;

  const noiseSources = [
    { name: "Thermal", value: parseFloat(thermalNoise.toFixed(1)) },
    { name: "1/f Amplifier", value: amplifierNoise },
    { name: "Motion Artifact", value: motionNoise },
    { name: "Biological", value: biologicalNoise },
    { name: "Shot Noise", value: shotNoise }
  ].sort((a, b) => b.value - a.value);

  const noiseTotal = parseFloat(
    Math.sqrt(noiseSources.reduce((sum, n) => sum + n.value * n.value, 0)).toFixed(1)
  );

  // ---- SNR Calculation ----
  // Estimate signal amplitude from tissue type
  const signalAmplitude = tissue.application?.includes('ECG') ? 1000 :
    tissue.application?.includes('Neural Recording') ? 50 :
    tissue.application?.includes('CGM') ? 5 :
    tissue.application?.includes('EEG') ? 10 : 30;

  const snr = parseFloat((20 * Math.log10(signalAmplitude / noiseTotal)).toFixed(1));
  const signalDetectable = snr > 6; // Minimum usable SNR

  return {
    eisData,
    noiseSources,
    impedance1kHz,
    impedance1kHzRaw,
    noiseTotal,
    snr,
    signalDetectable,
    tissue: tissue.name,
    material: material.name,
    electrodeArea,
    physicsParams: {
      r0: tissue.r0,
      r_inf: tissue.r_inf,
      tau: tissue.tau,
      cole_alpha: tissue.cole_alpha,
      rSolution: rSolution.toFixed(0),
      rCt: rCt.toExponential(2),
      cDl: cDl.toExponential(2)
    },
    hasMCU
  };
}
