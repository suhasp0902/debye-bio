export function runDRC(nodes, scenarioId) {
  let errors = [];
  let warnings = [];
  let passed = 8;
  
  if (scenarioId === 1) {
    const electrodeNode = nodes.find(n => n.data?.role === 'Electrode Contact');
    if (electrodeNode && electrodeNode.data.area >= 2000) {
       passed += 1;
    } else {
       errors.push({
         id: "BIO-001",
         title: "ELECTRODE IMPEDANCE OUT OF RANGE",
         affected: "Electrode Contact node",
         message: "Your electrode impedance (2.1 MΩ at 1 kHz) exceeds the recommended range for glucose amperometric sensing (< 1 MΩ). This will reduce sensitivity at low glucose concentrations (< 3 mmol/L).",
         fixable: true
       });
    }

    warnings.push({
      id: "WARN-003",
      title: "NO MOTION ARTIFACT FILTER",
      affected: "Signal Filter node",
      message: "Motion artifact noise (1.2 µVrms) is 4% of your signal amplitude. For a wearable worn during exercise, consider adding an adaptive motion artifact rejection stage.",
      fixable: false
    });
    
    warnings.push({
      id: "WARN-007",
      title: "MATERIAL FOULING RISK",
      affected: "Platinum electrode",
      message: "Platinum electrodes in subcutaneous tissue show 15–40% impedance increase over 14 days due to protein fouling. Your simulation reflects Day 1 performance only.",
      fixable: false
    });
  } else if (scenarioId === 2) {
    warnings.push({
       id: "WARN-012",
       title: "ELECTRODE SPACING",
       affected: "Ag/AgCl Electrode",
       message: "Electrode spacing (8 cm) may cause common-mode interference above threshold for ambulatory use. Recommend CMRR > 100 dB.",
       fixable: false
    });
    passed += 2;
  } else if (scenarioId === 3) {
    errors.push({
       id: "BIO-008",
       title: "AREA BELOW MINIMUM",
       affected: "Antibody Electrode Array",
       message: "Electrode area (500 µm²) below minimum for required sensitivity at clinical threshold.",
       fixable: false
    });
    warnings.push({
       id: "WARN-015",
       title: "NO TEMP COMPENSATION",
       affected: "Potentiostat",
       message: "No temperature compensation — signal will drift ±2% per °C in point-of-care setting.",
       fixable: false
    });
    passed += 1;
  } else if (scenarioId === 4) {
    errors.push({
       id: "STIM-004",
       title: "CHARGE INJECTION LIMIT EXCEEDED",
       affected: "Pt-Ir Electrode Array",
       message: "The 5 mA pulse at 1 ms pulse-width delivers 5 µC per phase. Over a 5000 µm² area, the charge density exceeds the Platinum-Iridium safe limit of 3.5 mC/cm², risking tissue damage and electrode dissolution.",
       fixable: false
    });
    warnings.push({
       id: "WARN-019",
       title: "IMPEDANCE DRIFT",
       affected: "Wound Tissue",
       message: "Wound bed impedance changes significantly during the healing process. Simulation shows Day 1 impedance (120 Ω). Consider adding an adaptive current source.",
       fixable: false
    });
  } else if (scenarioId === 5) {
    warnings.push({
       id: "BIO-022",
       title: "FIBROTIC ENCAPSULATION",
       affected: "Subcutaneous (Chronic)",
       message: "Device is designed for >2 years implantation. Tissue growth around the valve will alter diffusion rates by an estimated 15-30% over the device lifetime.",
       fixable: false
    });
    passed += 3; // Parylene-C passes chronic biocompatibility
  }
  
  return { errors, warnings, passed };
}
