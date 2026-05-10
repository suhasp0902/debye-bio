export function runSimulation(nodes, scenarioId) {
  let rSolution = 500;
  let rCt = 2000000;
  let cDl = 50e-9;
  let noiseTotal = 3.0;
  let snr = 24.4;
  let signalDetectable = true;
  let impedance1kHz = "2.1 MΩ";
  let noiseSources = [
    { name: "Thermal", value: 2.1 },
    { name: "1/f Amplifier", value: 1.6 },
    { name: "Motion Artifact", value: 1.2 },
    { name: "Biological", value: 0.8 },
    { name: "Shot Noise", value: 0.3 }
  ];

  if (scenarioId === 2) {
    rCt = 1000;
    cDl = 1e-6;
    impedance1kHz = "180 Ω";
    noiseTotal = 5.2;
    snr = 48;
    noiseSources = [
      { name: "Motion Artifact", value: 3.8 },
      { name: "Thermal", value: 1.1 },
      { name: "1/f Amplifier", value: 0.8 },
      { name: "Biological", value: 0.4 },
      { name: "Shot Noise", value: 0.1 }
    ];
  } else if (scenarioId === 3) {
    rCt = 45000;
    cDl = 100e-9;
    impedance1kHz = "45 kΩ";
    noiseTotal = 1.8;
    snr = 15;
    noiseSources = [
      { name: "Shot Noise", value: 1.2 },
      { name: "Thermal", value: 0.8 },
      { name: "Biological", value: 0.5 },
      { name: "1/f Amplifier", value: 0.4 },
      { name: "Motion Artifact", value: 0.1 }
    ];
  } else if (scenarioId === 4) {
    rCt = 800;
    cDl = 2e-6;
    impedance1kHz = "120 Ω";
    noiseTotal = 8.5;
    snr = 85; 
    noiseSources = [
      { name: "Stimulus Artifact", value: 5.0 },
      { name: "Electrochemical", value: 2.1 },
      { name: "Thermal", value: 0.8 },
      { name: "Biological", value: 0.4 },
      { name: "1/f Amplifier", value: 0.2 }
    ];
  } else if (scenarioId === 5) {
    rCt = 15000;
    cDl = 800e-9;
    impedance1kHz = "15 kΩ";
    noiseTotal = 2.1;
    snr = 42; 
    noiseSources = [
      { name: "Tissue Growth", value: 1.0 },
      { name: "1/f Amplifier", value: 0.5 },
      { name: "Thermal", value: 0.3 },
      { name: "Biological", value: 0.2 },
      { name: "Motion Artifact", value: 0.1 }
    ];
  }

  // Handle dynamic node updates
  const electrodeNode = nodes.find(n => n.data?.role === 'Electrode Contact' || n.data?.label.includes('Electrode'));
  if (electrodeNode && electrodeNode.data.area && scenarioId === 1) {
     const areaFactor = 1000 / electrodeNode.data.area; 
     rCt = rCt * areaFactor;
     cDl = cDl / areaFactor;
     if (electrodeNode.data.area >= 2000) {
         impedance1kHz = "0.9 MΩ";
         snr = 32.1;
         noiseTotal = 2.4;
     } else {
         impedance1kHz = "2.1 MΩ";
     }
  }

  const eisData = [];
  for (let logF = 0; logF <= 5; logF += 0.1) {
    const f = Math.pow(10, logF);
    const omega = 2 * Math.PI * f;
    const denom = 1 + Math.pow(omega * rCt * cDl, 2);
    const zPReal = rCt / denom;
    const zPImag = -(omega * Math.pow(rCt, 2) * cDl) / denom;
    
    const zTotalReal = rSolution + zPReal;
    const zTotalImag = zPImag;
    
    const magnitude = Math.sqrt(Math.pow(zTotalReal, 2) + Math.pow(zTotalImag, 2));
    const phase = Math.atan2(zTotalImag, zTotalReal) * (180 / Math.PI);
    
    eisData.push({
      frequency: f,
      magnitude: magnitude,
      phase: phase
    });
  }

  return { eisData, noiseSources, impedance1kHz, noiseTotal, snr, signalDetectable };
}
