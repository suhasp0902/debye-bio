export const SCENARIOS = {
  1: {
    id: 1,
    name: "Continuous Glucose Monitor",
    nodes: [
      { id: 'bio-1', type: 'biology', position: { x: 50, y: 150 }, data: { label: 'Subcutaneous Tissue', type: 'subcutaneous', conductivity: 0.3, permittivity: 1200 } },
      { id: 'elec-1', type: 'electronics', position: { x: 300, y: 150 }, data: { label: 'Pt Electrode', role: 'Electrode Contact', material: 'Platinum', area: 1000, impedance: 2.1, status: 'error' } },
      { id: 'mat-1', type: 'material', position: { x: 300, y: 350 }, data: { label: 'PEDOT:PSS', cil: 15, iso: true } },
      { id: 'elec-2', type: 'electronics', position: { x: 300, y: 550 }, data: { label: 'Reference Electrode' } },
      { id: 'elec-3', type: 'electronics', position: { x: 550, y: 150 }, data: { label: 'Amplifier', gain: 60, bw: '0.1-100 Hz', noise: 8 } },
      { id: 'elec-4', type: 'electronics', position: { x: 800, y: 150 }, data: { label: 'ADC' } },
      { id: 'elec-5', type: 'electronics', position: { x: 1050, y: 150 }, data: { label: 'Wireless Transmitter' } },
    ],
    edges: [
      { id: 'e1', source: 'bio-1', target: 'elec-1', animated: true, data: { label: '2.1 MΩ', type: 'bio' } },
      { id: 'e2', source: 'elec-1', target: 'elec-3', animated: true, data: { label: '', type: 'mixed' } },
      { id: 'e3', source: 'elec-3', target: 'elec-4', animated: true, data: { label: '', type: 'elec' } },
      { id: 'e4', source: 'elec-4', target: 'elec-5', animated: true, data: { label: '', type: 'elec' } },
      { id: 'e5', source: 'mat-1', target: 'elec-1', type: 'default', animated: true, data: { type: 'mixed' } },
      { id: 'e6', source: 'elec-2', target: 'elec-1', type: 'default', animated: true, data: { type: 'elec' } },
    ]
  },
  2: {
    id: 2,
    name: "Cardiac Arrhythmia Patch",
    nodes: [
      { id: 'bio-2', type: 'biology', position: { x: 50, y: 150 }, data: { label: 'Cardiac Muscle', type: 'cardiac', conductivity: 0.4, permittivity: 1600 } },
      { id: 'elec-6', type: 'electronics', position: { x: 300, y: 150 }, data: { label: 'Ag/AgCl Electrode x2', status: 'valid' } },
      { id: 'elec-7', type: 'electronics', position: { x: 550, y: 150 }, data: { label: 'Differential Amplifier' } },
      { id: 'elec-8', type: 'electronics', position: { x: 800, y: 150 }, data: { label: 'Signal Filter' } },
      { id: 'elec-9', type: 'electronics', position: { x: 1050, y: 150 }, data: { label: 'ADC' } },
      { id: 'elec-10', type: 'electronics', position: { x: 1300, y: 150 }, data: { label: 'Wireless Transmitter' } },
    ],
    edges: [
      { id: 'e7', source: 'bio-2', target: 'elec-6', animated: true, data: { label: '180 Ω', type: 'bio' } },
      { id: 'e8', source: 'elec-6', target: 'elec-7', animated: true, data: { type: 'mixed' } },
      { id: 'e9', source: 'elec-7', target: 'elec-8', animated: true, data: { type: 'elec' } },
      { id: 'e10', source: 'elec-8', target: 'elec-9', animated: true, data: { type: 'elec' } },
      { id: 'e11', source: 'elec-9', target: 'elec-10', animated: true, data: { type: 'elec' } },
    ]
  },
  3: {
    id: 3,
    name: "Cancer Biomarker Chip",
    nodes: [
      { id: 'bio-3', type: 'biology', position: { x: 50, y: 150 }, data: { label: 'Blood Sample', type: 'blood', conductivity: 0.7, permittivity: 2500 } },
      { id: 'elec-11', type: 'electronics', position: { x: 300, y: 150 }, data: { label: 'Antibody Electrode Array', area: 500, status: 'error' } },
      { id: 'elec-12', type: 'electronics', position: { x: 300, y: 350 }, data: { label: 'Counter Electrode' } },
      { id: 'elec-13', type: 'electronics', position: { x: 300, y: 550 }, data: { label: 'Reference (Ag/AgCl)' } },
      { id: 'elec-14', type: 'electronics', position: { x: 550, y: 150 }, data: { label: 'Potentiostat' } },
      { id: 'elec-15', type: 'electronics', position: { x: 800, y: 150 }, data: { label: 'Signal Processor' } },
      { id: 'elec-16', type: 'electronics', position: { x: 1050, y: 150 }, data: { label: 'Display Output' } },
    ],
    edges: [
      { id: 'e12', source: 'bio-3', target: 'elec-11', animated: true, data: { label: '45 kΩ', type: 'bio' } },
      { id: 'e13', source: 'elec-11', target: 'elec-14', animated: true, data: { type: 'mixed' } },
      { id: 'e14', source: 'elec-14', target: 'elec-15', animated: true, data: { type: 'elec' } },
      { id: 'e15', source: 'elec-15', target: 'elec-16', animated: true, data: { type: 'elec' } },
      { id: 'e16', source: 'elec-12', target: 'elec-11', type: 'default', animated: true, data: { type: 'elec' } },
      { id: 'e17', source: 'elec-13', target: 'elec-11', type: 'default', animated: true, data: { type: 'elec' } },
    ]
  },
  4: {
    id: 4,
    name: "Electrical Wound-Healing Patch",
    nodes: [
      { id: 'bio-4', type: 'biology', position: { x: 50, y: 150 }, data: { label: 'Wound Tissue', type: 'wound', conductivity: 0.5, permittivity: 1800 } },
      { id: 'elec-17', type: 'electronics', position: { x: 300, y: 150 }, data: { label: 'Pt-Ir Electrode Array', material: 'Platinum-Iridium', area: 5000, status: 'error' } },
      { id: 'mat-2', type: 'material', position: { x: 300, y: 350 }, data: { label: 'Platinum-Iridium', cil: 3.5, iso: true } },
      { id: 'elec-18', type: 'electronics', position: { x: 550, y: 150 }, data: { label: 'Stimulator (Pulse Gen)', current: '5 mA', pulseWidth: '1 ms' } },
      { id: 'elec-19', type: 'electronics', position: { x: 800, y: 150 }, data: { label: 'MCU Control' } },
      { id: 'elec-20', type: 'electronics', position: { x: 1050, y: 150 }, data: { label: 'Wireless Transceiver' } },
    ],
    edges: [
      { id: 'e18', source: 'elec-17', target: 'bio-4', animated: true, data: { label: '120 Ω', type: 'bio' } },
      { id: 'e19', source: 'elec-18', target: 'elec-17', animated: true, data: { label: 'Pulse', type: 'mixed' } },
      { id: 'e20', source: 'elec-19', target: 'elec-18', animated: true, data: { type: 'elec' } },
      { id: 'e21', source: 'elec-20', target: 'elec-19', animated: true, data: { type: 'elec' } },
      { id: 'e22', source: 'mat-2', target: 'elec-17', type: 'default', animated: true, data: { type: 'mixed' } },
    ]
  },
  5: {
    id: 5,
    name: "Implantable Drug Delivery",
    nodes: [
      { id: 'bio-5', type: 'biology', position: { x: 50, y: 150 }, data: { label: 'Subcutaneous (Chronic)', type: 'subcutaneous', conductivity: 0.3, permittivity: 1200 } },
      { id: 'elec-21', type: 'electronics', position: { x: 300, y: 150 }, data: { label: 'Micro-valve', status: 'valid' } },
      { id: 'mat-3', type: 'material', position: { x: 300, y: 350 }, data: { label: 'Parylene-C', iso: true, chronic: true } },
      { id: 'bio-6', type: 'biology', position: { x: 300, y: -50 }, data: { label: 'Drug Reservoir', volume: '2 mL' } },
      { id: 'elec-22', type: 'electronics', position: { x: 550, y: 150 }, data: { label: 'Control Circuit' } },
      { id: 'elec-23', type: 'electronics', position: { x: 800, y: 150 }, data: { label: 'Inductive Power/Data' } },
    ],
    edges: [
      { id: 'e23', source: 'elec-21', target: 'bio-5', animated: true, data: { label: 'Diffusion', type: 'bio' } },
      { id: 'e24', source: 'bio-6', target: 'elec-21', animated: true, data: { type: 'bio' } },
      { id: 'e25', source: 'elec-22', target: 'elec-21', animated: true, data: { label: 'Trigger', type: 'mixed' } },
      { id: 'e26', source: 'elec-23', target: 'elec-22', animated: true, data: { type: 'elec' } },
      { id: 'e27', source: 'mat-3', target: 'elec-21', type: 'default', animated: true, data: { type: 'mixed' } },
      { id: 'e28', source: 'mat-3', target: 'elec-22', type: 'default', animated: true, data: { type: 'mixed' } },
    ]
  }
};
