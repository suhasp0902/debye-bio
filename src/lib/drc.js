import { TISSUES, MATERIALS } from '../data/bioData';

// ============================================================
// Debye Bio — Dynamic Design Rule Check Engine
// Runs against actual canvas nodes & connections, not scenarios
// ============================================================

/**
 * Resolve tissue from node label
 */
function findTissue(label) {
  if (!label) return null;
  const l = label.toLowerCase();
  for (const [key, t] of Object.entries(TISSUES)) {
    if (l.includes(key) || l.includes(t.name.toLowerCase().split(' ')[0])) return { key, ...t };
  }
  if (l.includes('subcutaneous') || l.includes('glucose')) return { key: 'subcutaneous', ...TISSUES.subcutaneous };
  if (l.includes('cardiac') || l.includes('heart')) return { key: 'cardiac', ...TISSUES.cardiac };
  if (l.includes('brain') || l.includes('cortex')) return { key: 'cortical', ...TISSUES.cortical };
  if (l.includes('blood')) return { key: 'blood', ...TISSUES.blood };
  if (l.includes('skin') || l.includes('epidermis')) return { key: 'skin_epidermis', ...TISSUES.skin_epidermis };
  if (l.includes('nerve')) return { key: 'peripheral_nerve', ...TISSUES.peripheral_nerve };
  if (l.includes('gastric') || l.includes('stomach')) return { key: 'gastric', ...TISSUES.gastric };
  if (l.includes('wound')) return { key: 'wound', ...TISSUES.wound };
  if (l.includes('retina')) return { key: 'retina', ...TISSUES.retina };
  if (l.includes('bone')) return { key: 'bone', ...TISSUES.bone };
  return null;
}

/**
 * Resolve material from node label
 */
function findMaterial(label) {
  if (!label) return null;
  const l = label.toLowerCase();
  for (const [key, m] of Object.entries(MATERIALS)) {
    if (l.includes(key) || l.includes(m.name.toLowerCase().split(' ')[0])) return { key, ...m };
  }
  if (l.includes('pedot') || l.includes('pss')) return { key: 'pedot', ...MATERIALS.pedot };
  if (l.includes('pt-ir') || l.includes('platinum-iridium')) return { key: 'platinum_iridium', ...MATERIALS.platinum_iridium };
  if (l.includes('platinum') || l.includes('pt')) return { key: 'platinum', ...MATERIALS.platinum };
  if (l.includes('gold') || l.includes('au')) return { key: 'gold', ...MATERIALS.gold };
  if (l.includes('irox') || l.includes('iridium oxide')) return { key: 'iridium_oxide', ...MATERIALS.iridium_oxide };
  if (l.includes('graphene')) return { key: 'graphene', ...MATERIALS.graphene };
  if (l.includes('cnt') || l.includes('carbon nanotube')) return { key: 'carbon_nanotube', ...MATERIALS.carbon_nanotube };
  return null;
}

/**
 * Main DRC runner — analyses actual canvas nodes and edges
 */
export function runDRC(nodes, scenarioId, edges = []) {
  const errors = [];
  const warnings = [];
  let passed = 0;

  if (nodes.length === 0) {
    return { errors, warnings, passed: 0 };
  }

  // ---- Classify nodes ----
  const tissueNodes = [];
  const electrodeNodes = [];
  const materialNodes = [];
  const electronicsNodes = [];

  for (const node of nodes) {
    const d = node.data || {};
    const label = (d.label || '').toLowerCase();

    if (node.type === 'biology' || d.type === 'tissue') {
      const t = findTissue(d.label);
      tissueNodes.push({ node, tissue: t });
    } else if (node.type === 'material') {
      const m = findMaterial(d.label);
      materialNodes.push({ node, material: m });
    } else if (node.type === 'electronics') {
      electronicsNodes.push(node);
      if (label.includes('electrode')) {
        const m = findMaterial(d.material || d.label);
        electrodeNodes.push({ node, material: m, area: d.area || 1000 });
      }
    }
  }

  // ---- RULE: Check electrode impedance range ----
  for (const elec of electrodeNodes) {
    if (elec.material && elec.material.eis_factor > 2.0 && elec.area < 1500) {
      errors.push({
        id: "BIO-001",
        title: "ELECTRODE IMPEDANCE OUT OF RANGE",
        affected: elec.node.data.label,
        message: `Electrode "${elec.node.data.label}" (${elec.area} µm², ${elec.material.name}) has high impedance at 1 kHz. For reliable sensing, increase area to ≥1500 µm² or switch to a lower-impedance material like PEDOT:PSS or IrOx.`,
        fixable: true,
      });
    } else {
      passed++;
    }
  }

  // ---- RULE: ISO 10993 biocompatibility ----
  for (const mat of materialNodes) {
    if (mat.material && !mat.material.iso10993) {
      errors.push({
        id: "BIO-006",
        title: "MATERIAL NOT ISO 10993 APPROVED",
        affected: mat.node.data.label,
        message: `"${mat.material.name}" has not passed ISO 10993 biocompatibility testing. Not approved for implantable or in-vivo use. Suitable for research/in-vitro only.`,
        fixable: false,
      });
    } else if (mat.material) {
      passed++;
    }
  }

  // ---- RULE: Chronic implant without encapsulant ----
  const hasChronicTissue = tissueNodes.some(t =>
    t.tissue && (t.tissue.key === 'cortical' || t.tissue.key === 'peripheral_nerve' ||
      t.tissue.key === 'retina' || t.tissue.key === 'gastric')
  );
  const hasEncapsulant = materialNodes.some(m =>
    m.material && (m.material.key === 'parylene_c' || m.material.key === 'titanium')
  );

  if (hasChronicTissue && !hasEncapsulant) {
    errors.push({
      id: "BIO-007",
      title: "NO ENCAPSULANT ON CHRONIC IMPLANT",
      affected: "Device Assembly",
      message: `Design targets chronic implant tissue but has no encapsulant (Parylene-C) or structural housing (Titanium). Chronic implants require hermetic sealing to prevent moisture ingress and device failure.`,
      fixable: false,
    });
  } else if (hasChronicTissue && hasEncapsulant) {
    passed++;
  }

  // ---- RULE: Charge injection limit ----
  for (const elec of electrodeNodes) {
    const pulseGen = electronicsNodes.find(n =>
      (n.data.label || '').toLowerCase().includes('pulse') ||
      (n.data.label || '').toLowerCase().includes('stimulat')
    );
    if (pulseGen && elec.material) {
      const current_mA = parseFloat(pulseGen.data?.current) || 2;
      const pulseWidth_ms = parseFloat(pulseGen.data?.pulseWidth) || 1;
      const charge_uC = current_mA * pulseWidth_ms; // µC per phase
      const area_cm2 = (elec.area || 1000) * 1e-8;
      const chargeDensity_mC = (charge_uC * 1e-3) / area_cm2; // mC/cm²

      if (chargeDensity_mC > elec.material.cil) {
        errors.push({
          id: "BIO-003",
          title: "CHARGE INJECTION LIMIT EXCEEDED",
          affected: elec.node.data.label,
          message: `Charge density ${chargeDensity_mC.toFixed(1)} mC/cm² exceeds the safe limit for ${elec.material.name} (${elec.material.cil} mC/cm²). Risk of tissue damage and electrode dissolution. Reduce current, shorten pulse width, or increase electrode area.`,
          fixable: false,
        });
      } else {
        passed++;
      }
    }
  }

  // ---- RULE: No reference electrode ----
  const hasRefElectrode = nodes.some(n =>
    (n.data?.label || '').toLowerCase().includes('reference')
  );
  const hasPotentiostat = nodes.some(n =>
    (n.data?.label || '').toLowerCase().includes('potentiostat') ||
    (n.data?.label || '').toLowerCase().includes('adc')
  );
  if (hasPotentiostat && !hasRefElectrode && electrodeNodes.length > 0) {
    warnings.push({
      id: "BIO-004",
      title: "NO REFERENCE ELECTRODE",
      affected: "Measurement System",
      message: `Design includes measurement electronics but no reference electrode. A stable reference (e.g., Ag/AgCl) is critical for drift-free potentiometric and amperometric measurements.`,
      fixable: false,
    });
  } else if (hasPotentiostat && hasRefElectrode) {
    passed++;
  }

  // ---- RULE: Material fouling for chronic ----
  for (const elec of electrodeNodes) {
    if (elec.material && !elec.material.chronic_safe && hasChronicTissue) {
      warnings.push({
        id: "WARN-007",
        title: "MATERIAL NOT RATED FOR CHRONIC USE",
        affected: elec.node.data.label,
        message: `${elec.material.name} is rated for max ${elec.material.max_years} year(s) implantation. Your design targets chronic tissue. Expect impedance increase of 15–40% due to protein fouling and fibrous encapsulation over time.`,
        fixable: false,
      });
    } else if (elec.material && elec.material.chronic_safe) {
      passed++;
    }
  }

  // ---- RULE: Motion artifact on wearable tissues ----
  const hasWearableTissue = tissueNodes.some(t =>
    t.tissue && (t.tissue.key === 'skin_epidermis' || t.tissue.key === 'subcutaneous')
  );
  const hasMotionFilter = nodes.some(n =>
    (n.data?.label || '').toLowerCase().includes('filter') ||
    (n.data?.label || '').toLowerCase().includes('motion')
  );
  if (hasWearableTissue && !hasMotionFilter && electrodeNodes.length > 0) {
    warnings.push({
      id: "WARN-003",
      title: "NO MOTION ARTIFACT FILTER",
      affected: "Signal Chain",
      message: `Design is placed on wearable tissue (skin/subcutaneous) but includes no motion artifact rejection. For ambulatory use, add an adaptive filter or accelerometer-based artifact cancellation.`,
      fixable: false,
    });
  } else if (hasWearableTissue && hasMotionFilter) {
    passed++;
  }

  // ---- RULE: No temperature compensation ----
  const hasTempComp = nodes.some(n =>
    (n.data?.label || '').toLowerCase().includes('temp') ||
    (n.data?.label || '').toLowerCase().includes('thermistor')
  );
  if (electrodeNodes.length > 0 && !hasTempComp) {
    warnings.push({
      id: "WARN-011",
      title: "NO TEMPERATURE COMPENSATION",
      affected: "Measurement Accuracy",
      message: `Electrode impedance drifts ±2% per °C. Without a temperature sensor in the signal chain, measurement accuracy will degrade in environments with temperature variation (e.g., wearables, point-of-care).`,
      fixable: false,
    });
  } else if (hasTempComp) {
    passed++;
  }

  // ---- RULE: No MCU/Wireless for complex designs ----
  const hasMCU = nodes.some(n => {
    const l = (n.data?.label || '').toLowerCase();
    return l.includes('mcu') || l.includes('microcontroller') || l.includes('wireless');
  });
  if (nodes.length > 4 && !hasMCU) {
    warnings.push({
      id: "WARN-020",
      title: "NO DATA PROCESSING UNIT",
      affected: "System Architecture",
      message: `Complex design (${nodes.length} components) but no microcontroller or data processing unit. Consider adding an MCU for signal processing, data logging, or wireless transmission.`,
      fixable: false,
    });
  } else if (hasMCU) {
    passed++;
  }

  // ---- Base pass count for general topology checks ----
  if (tissueNodes.length > 0) passed++;
  if (electrodeNodes.length > 0) passed++;
  if (edges && edges.length > 0) passed++;

  return { errors, warnings, passed };
}
