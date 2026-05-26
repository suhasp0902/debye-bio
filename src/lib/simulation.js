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
 * Cole-Cole impedance model with Newman spreading resistance
 * R_spreading = rho / 4r
 * Z(ω) = R_inf + (R_0 - R_inf) / (1 + (jωτ)^α)
 */
function coleColeImpedance(freq, tissue, radius_m) {
  const omega = 2 * Math.PI * freq;
  const { rho0, rho_inf, tau, cole_alpha } = tissue;

  const r0 = rho0 / (4 * radius_m);
  const r_inf = rho_inf / (4 * radius_m);

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
 * Randles circuit electrode impedance + Warburg
 * Models: R_solution + ( (R_ct + Z_w) || C_dl )
 */
function randlesImpedance(freq, rSolution, rCt, cDl, aw) {
  const omega = 2 * Math.PI * freq;
  // Warburg impedance: Zw = Aw / sqrt(w) - j * Aw / sqrt(w)
  const zW_real = aw / Math.sqrt(omega);
  const zW_imag = -aw / Math.sqrt(omega);
  
  const rS_branch = rCt + zW_real;
  const iS_branch = zW_imag;
  
  // Parallel with C_dl (impedance Z_c = -j / (omega * cDl))
  // Admittance: Y_total = Y_s + Y_c
  const Y_s_denom = rS_branch * rS_branch + iS_branch * iS_branch;
  const Y_s_real = rS_branch / Y_s_denom;
  const Y_s_imag = -iS_branch / Y_s_denom;
  
  const Y_c_imag = omega * cDl;
  
  const Y_total_real = Y_s_real;
  const Y_total_imag = Y_s_imag + Y_c_imag;
  
  const Z_p_denom = Y_total_real * Y_total_real + Y_total_imag * Y_total_imag;
  const Z_p_real = Y_total_real / Z_p_denom;
  const Z_p_imag = -Y_total_imag / Z_p_denom;

  return {
    real: rSolution + Z_p_real,
    imag: Z_p_imag
  };
}

/**
 * Compute electrode circuit parameters from explicit physical properties
 */
function electrodeParams(material, area_um2, timeInBodyDays) {
  // FBR scale factor (fibrosis increases impedance over time, saturating around 30 days)
  const fbrFactor = 1 + 2.5 * (1 - Math.exp(-timeInBodyDays / 14)); 
  
  // Convert area to cm^2
  const area_cm2 = area_um2 * 1e-8;

  // Specific properties
  const rCt = (material.specific_rct_ohm_cm2 / area_cm2) * fbrFactor;
  const cDl = (material.specific_capacitance_uF_cm2 * 1e-6) * area_cm2;
  
  // Warburg coefficient (approximated based on Rct scale to simulate diffusion limitations)
  const aw = (material.specific_rct_ohm_cm2 * 0.05) / area_cm2; 

  return { rCt, cDl, aw, fbrFactor, area_cm2 };
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
  let isChronic = false;
  let voltage = 3.3; // Default system voltage for SAR calc
  let current_mA = 2.0; // Default stimulation current

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
      if (d.chronic) isChronic = true;
      if (d.voltage) voltage = Number(String(d.voltage).replace(/[^0-9.]/g, ''));
      if (d.current) current_mA = Number(String(d.current).replace(/[^0-9.]/g, ''));
    }

    // Track signal chain components
    const ll = label.toLowerCase();
    if (ll.includes('mcu') || ll.includes('microcontroller')) hasMCU = true;
    if (ll.includes('amplifier') || ll.includes('amp')) hasAmplifier = true;
    if (ll.includes('filter') || ll.includes('adc')) hasFilter = true;
    if (ll.includes('electrode') && d.area) electrodeArea = Number(d.area);
    if (ll.includes('chronic') || d.chronic) isChronic = true;
  }

  // Fallback defaults if canvas doesn't have explicit tissue/material
  if (!tissue) tissue = { key: 'subcutaneous', ...TISSUES.subcutaneous };
  if (!material) material = { key: 'platinum', ...MATERIALS.platinum };

  // ---- Compute Physics parameters ----
  const timeInBodyDays = isChronic ? 30 : 1;
  const { rCt, cDl, aw, fbrFactor, area_cm2 } = electrodeParams(material, electrodeArea, timeInBodyDays);
  
  // Convert area to radius in meters (assuming circular disk electrode)
  const radius_m = Math.sqrt((electrodeArea * 1e-12) / Math.PI);

  // Spreading resistance based on Newman's formula: R = rho / 4r
  const rSolution_SAR = tissue.rho0 / (4 * radius_m);

  // ---- Charge Injection Capacity & SAR ----
  const chargeCapacityTotal = material.cil * area_cm2 * 1000; // mC
  const pulseWidth_ms = 0.5;
  const injectedCharge = current_mA * pulseWidth_ms / 1000; // mC
  const cicSafe = injectedCharge <= chargeCapacityTotal;
  
  // Joule Heating (SAR proxy): P = I^2 * R
  const powerDissipated_mW = (current_mA * current_mA * rSolution_SAR) / 1000;
  // Approx temp rise: dT = P / (mass * heat_capacity), very simplified
  const tempRise_C = (powerDissipated_mW * 0.05).toFixed(2);

  // ---- EIS sweep (combined Cole-Cole + Randles) ----
  const eisData = [];
  for (let logF = 0; logF <= 5; logF += 0.1) {
    const f = Math.pow(10, logF);

    // Tissue impedance (Cole-Cole with Newman spreading resistance)
    const zTissue = coleColeImpedance(f, tissue, radius_m);
    // Electrode interface impedance (Randles interface only, no redundant spreading resistance)
    const zElectrode = randlesImpedance(f, 0, rCt, cDl, aw);

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

  // ---- Time-Domain Transient Simulation ----
  const timeData = [];
  const sampleRate = 1000; // Hz
  for (let i = 0; i < 100; i++) {
    const t = i / sampleRate;
    // Mock biological signal (ECG-like pulse)
    const bioSignal = i === 10 ? 1000 : i === 11 ? -200 : i > 11 && i < 20 ? 100 : 0;
    
    // Simple RC lowpass filter approximation based on Z at 1kHz for the time domain
    const alpha = 1 / (1 + (impedance1kHzRaw * cDl * sampleRate));
    const previousFiltered = i > 0 ? timeData[i-1].filtered : 0;
    const filtered = alpha * bioSignal + (1 - alpha) * previousFiltered;
    
    // Add noise
    const noise = (Math.random() - 0.5) * 50; 
    
    timeData.push({
      time: (t * 1000).toFixed(0), // ms
      raw: bioSignal,
      filtered: hasFilter ? filtered : (bioSignal + noise),
      output: (hasFilter ? filtered : (bioSignal + noise)) * (hasAmplifier ? 10 : 1)
    });
  }

  // ---- Noise Budget (physics-grounded) ----
  const bandwidth = 10000; // 10 kHz measurement bandwidth
  const thermalNoise = Math.sqrt(4 * kT * (rCt + rSolution_SAR) * bandwidth) * 1e6; // µV
  const amplifierNoise = hasAmplifier ? 0.8 : 1.6; // Good amplifier reduces noise
  const motionNoiseBase = tissue.name === 'Skin (Epidermis)' ? 3.0 : tissue.name === 'Cardiac Muscle' ? 2.5 : 1.2;
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
    timeData,
    noiseSources,
    impedance1kHz,
    impedance1kHzRaw,
    noiseTotal,
    snr,
    signalDetectable,
    tissue: tissue.name,
    material: material.name,
    electrodeArea,
    timeInBodyDays,
    fbrFactor: fbrFactor.toFixed(2),
    chargeCapacityTotal: chargeCapacityTotal.toExponential(2),
    injectedCharge: injectedCharge.toExponential(2),
    cicSafe,
    tempRise_C,
    physicsParams: {
      r0: tissue.rho0,
      r_inf: tissue.rho_inf,
      tau: tissue.tau,
      cole_alpha: tissue.cole_alpha,
      rSolution: rSolution_SAR.toFixed(0),
      rCt: rCt.toExponential(2),
      cDl: cDl.toExponential(2),
      aw: aw.toExponential(2)
    },
    hasMCU
  };
}
