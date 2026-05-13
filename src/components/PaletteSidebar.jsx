import { useState } from 'react';
import { Search, ChevronDown, ChevronRight, Activity, Cpu, Layers, Zap, FlaskConical } from 'lucide-react';

const PALETTE_ITEMS = [
  {
    category: 'Biology',
    icon: <Activity className="w-4 h-4 text-cyan-400" />,
    color: 'text-cyan-400',
    items: [
      { id: 'bio_subq',    label: 'Subcutaneous Tissue',  type: 'biology',     role: 'Tissue',     info: 'σ=0.3 S/m' },
      { id: 'bio_cardiac', label: 'Cardiac Muscle',       type: 'biology',     role: 'Tissue',     info: 'σ=0.4 S/m' },
      { id: 'bio_cortex',  label: 'Cortical Gray Matter', type: 'biology',     role: 'Neural',     info: 'σ=0.3 S/m' },
      { id: 'bio_white',   label: 'White Matter',         type: 'biology',     role: 'Neural',     info: 'σ=0.15 S/m' },
      { id: 'bio_blood',   label: 'Blood',                type: 'biology',     role: 'Fluid',      info: 'σ=0.7 S/m' },
      { id: 'bio_skin',    label: 'Skin (Epidermis)',     type: 'biology',     role: 'Tissue',     info: 'σ=0.002 S/m' },
      { id: 'bio_nerve',   label: 'Peripheral Nerve',     type: 'biology',     role: 'Neural',     info: 'σ=0.08 S/m' },
      { id: 'bio_gastric', label: 'Gastric Mucosa',       type: 'biology',     role: 'Tissue',     info: 'σ=0.6 S/m' },
      { id: 'bio_wound_a', label: 'Wound Bed (Acute)',    type: 'biology',     role: 'Tissue',     info: 'σ=0.5 S/m' },
      { id: 'bio_wound_c', label: 'Wound Bed (Chronic)',  type: 'biology',     role: 'Tissue',     info: 'σ=0.35 S/m' },
      { id: 'bio_retina',  label: 'Retina',               type: 'biology',     role: 'Tissue',     info: 'σ=0.28 S/m' },
      { id: 'bio_liver',   label: 'Liver',                type: 'biology',     role: 'Tissue',     info: 'σ=0.28 S/m' },
      { id: 'bio_bone',    label: 'Bone (Cortical)',      type: 'biology',     role: 'Structural', info: 'σ=0.006 S/m' },
      { id: 'bio_csf',     label: 'Cerebrospinal Fluid',  type: 'biology',     role: 'Fluid',      info: 'σ=1.79 S/m' },
      { id: 'bio_fat',     label: 'Adipose Tissue',       type: 'biology',     role: 'Tissue',     info: 'σ=0.04 S/m' },
    ]
  },
  {
    category: 'Electrodes',
    icon: <Zap className="w-4 h-4 text-indigo-400" />,
    color: 'text-indigo-400',
    items: [
      { id: 'el_contact',  label: 'Electrode Contact',     type: 'electronics', role: 'Interface',  info: '1000 µm²' },
      { id: 'el_array',    label: 'Microelectrode Array',  type: 'electronics', role: 'Interface',  info: 'MEA' },
      { id: 'el_ref',      label: 'Reference Electrode',   type: 'electronics', role: 'Interface',  info: 'Ag/AgCl' },
      { id: 'el_counter',  label: 'Counter Electrode',     type: 'electronics', role: 'Interface',  info: '3-elec' },
      { id: 'el_dbs',      label: 'DBS Electrode',         type: 'electronics', role: 'Neural',     info: 'Implant' },
      { id: 'el_eeg',      label: 'EEG Electrode',         type: 'electronics', role: 'Surface',    info: 'Scalp' },
      { id: 'el_ecg',      label: 'ECG Electrode',         type: 'electronics', role: 'Surface',    info: 'Chest' },
      { id: 'el_needle',   label: 'Needle Electrode',      type: 'electronics', role: 'Penetrating',info: 'EMG' },
    ]
  },
  {
    category: 'Electronics',
    icon: <Cpu className="w-4 h-4 text-violet-400" />,
    color: 'text-violet-400',
    items: [
      { id: 'el_amp',      label: 'Low-Noise Amplifier',   type: 'electronics', role: 'Analog',     info: 'LNA' },
      { id: 'el_ia',       label: 'Instrumentation Amp',   type: 'electronics', role: 'Analog',     info: 'INA' },
      { id: 'el_adc',      label: 'ADC',                   type: 'electronics', role: 'Mixed',      info: '24-bit' },
      { id: 'el_dac',      label: 'DAC',                   type: 'electronics', role: 'Mixed',      info: '16-bit' },
      { id: 'el_filter',   label: 'Bandpass Filter',       type: 'electronics', role: 'Analog',     info: 'BPF' },
      { id: 'el_stim',     label: 'Pulse Generator',       type: 'electronics', role: 'Stimulator', info: 'Biphasic' },
      { id: 'el_mcu',      label: 'Microcontroller',       type: 'electronics', role: 'Logic',      info: 'MCU' },
      { id: 'el_pot',      label: 'Potentiostat',          type: 'electronics', role: 'Analog',     info: '3-elec' },
      { id: 'el_tx',       label: 'Bluetooth LE',          type: 'electronics', role: 'Wireless',   info: 'BLE 5.0' },
      { id: 'el_nfc',      label: 'NFC Transceiver',       type: 'electronics', role: 'Wireless',   info: '13.56MHz' },
      { id: 'el_coil',     label: 'Inductive Coil',        type: 'electronics', role: 'Power',      info: 'WPT' },
      { id: 'el_batt',     label: 'Microbattery',          type: 'electronics', role: 'Power',      info: 'Li-ion' },
      { id: 'el_eharvest', label: 'Energy Harvester',      type: 'electronics', role: 'Power',      info: 'RF/Piezo' },
      { id: 'el_res',      label: 'Resistor',              type: 'electronics', role: 'Passive',    info: 'R' },
      { id: 'el_cap',      label: 'Capacitor',             type: 'electronics', role: 'Passive',    info: 'C' },
      { id: 'el_ind',      label: 'Inductor',              type: 'electronics', role: 'Passive',    info: 'L' },
    ]
  },
  {
    category: 'Materials',
    icon: <Layers className="w-4 h-4 text-purple-400" />,
    color: 'text-purple-400',
    items: [
      { id: 'mat_pt',      label: 'Platinum',              type: 'material',    role: 'Electrode',  info: 'ISO ✓' },
      { id: 'mat_ptir',    label: 'Platinum-Iridium',      type: 'material',    role: 'Electrode',  info: 'ISO ✓' },
      { id: 'mat_au',      label: 'Gold',                  type: 'material',    role: 'Electrode',  info: 'ISO ✓' },
      { id: 'mat_irox',    label: 'Iridium Oxide',         type: 'material',    role: 'Electrode',  info: 'ISO ✓' },
      { id: 'mat_tin',     label: 'Titanium Nitride',      type: 'material',    role: 'Electrode',  info: 'ISO ✓' },
      { id: 'mat_pedot',   label: 'PEDOT:PSS',             type: 'material',    role: 'Polymer',    info: 'ISO ✓' },
      { id: 'mat_cnt',     label: 'Carbon Nanotube',       type: 'material',    role: 'Nano',       info: 'Research' },
      { id: 'mat_graphene',label: 'Graphene',              type: 'material',    role: 'Nano',       info: 'Research' },
      { id: 'mat_parylene',label: 'Parylene-C',            type: 'material',    role: 'Encapsulant',info: 'ISO ✓' },
      { id: 'mat_ti',      label: 'Titanium (Structural)', type: 'material',    role: 'Structural', info: 'ISO ✓' },
      { id: 'mat_silicone',label: 'Silicone PDMS',         type: 'material',    role: 'Encapsulant',info: 'ISO ✓' },
      { id: 'mat_hydrogel',label: 'Conductive Hydrogel',   type: 'material',    role: 'Polymer',    info: 'Research' },
    ]
  },
  {
    category: 'Neuro-Modulation',
    icon: <Zap className="w-4 h-4 text-orange-400" />,
    color: 'text-orange-400',
    items: [
      { id: 'neu_dbs',     label: 'DBS Probe (Chronic)',   type: 'electronics', role: 'Neural',     info: 'Medtronic-spec' },
      { id: 'neu_opt',     label: 'Optogenetic LED',      type: 'electronics', role: 'Neural',     info: '470nm Blue' },
      { id: 'neu_vagus',   label: 'Vagus Nerve Cuff',      type: 'electronics', role: 'Neural',     info: 'Symmetry' },
    ]
  },
  {
    category: 'Microfluidics',
    icon: <Activity className="w-4 h-4 text-blue-400" />,
    color: 'text-blue-400',
    items: [
      { id: 'mf_pump',     label: 'Piezo Micro-Pump',      type: 'electronics', role: 'Fluidics',   info: '50 µL/min' },
      { id: 'mf_valve',    label: 'Micro-Valve',           type: 'electronics', role: 'Fluidics',   info: 'Normally Closed' },
      { id: 'mf_sensor',   label: 'Flow Rate Sensor',      type: 'electronics', role: 'Fluidics',   info: 'Thermal' },
    ]
  },
  {
    category: 'Biochemistry',
    icon: <FlaskConical className="w-4 h-4 text-emerald-400" />,
    color: 'text-emerald-400',
    items: [
      { id: 'bio_glucose',  label: 'Glucose Oxidase Layer', type: 'biochemistry', role: 'Enzyme',     info: 'GOx' },
      { id: 'bio_antibody', label: 'Antibody Capture Layer',type: 'biochemistry', role: 'Immunosensor',info: 'IgG' },
      { id: 'bio_aptamer',  label: 'Aptamer Layer',         type: 'biochemistry', role: 'Biosensor',  info: 'DNA/RNA' },
      { id: 'bio_nafilm',   label: 'Nafion Membrane',       type: 'biochemistry', role: 'Membrane',   info: 'Selectivity' },
      { id: 'bio_redox',    label: 'Redox Mediator',        type: 'biochemistry', role: 'Mediator',   info: 'Fc/MB' },
      { id: 'bio_plasma',   label: 'Blood Plasma',          type: 'biochemistry', role: 'Fluid',      info: '~pH 7.4' },
    ]
  }
];

export default function PaletteSidebar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCats, setExpandedCats] = useState(['Biology', 'Electrodes', 'Electronics', 'Materials', 'Biochemistry']);

  const toggleCat = (cat) => {
    setExpandedCats(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const onDragStart = (event, nodeType, label, itemId) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('application/label', label);
    event.dataTransfer.setData('application/item_id', itemId);
    event.dataTransfer.effectAllowed = 'move';
  };

  const totalItems = PALETTE_ITEMS.reduce((sum, cat) => sum + cat.items.length, 0);

  return (
    <div className="w-[200px] bg-surface border-r border-border flex flex-col shrink-0 h-full relative z-10">
      {/* Search */}
      <div className="p-2 border-b border-border bg-surface-raised">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-text-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface border border-border text-text-primary text-xs rounded pl-8 pr-3 py-1.5 focus:outline-none focus:border-accent-primary transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary text-xs"
            >✕</button>
          )}
        </div>
        {!searchQuery && (
          <div className="text-[10px] text-text-muted mt-1.5 pl-1">{totalItems} components</div>
        )}
      </div>

      {/* Component List */}
      <div className="flex-1 overflow-y-auto py-1">
        {PALETTE_ITEMS.map((category) => {
          const filteredItems = category.items.filter(item =>
            item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.info || '').toLowerCase().includes(searchQuery.toLowerCase())
          );

          if (filteredItems.length === 0 && searchQuery) return null;

          const isExpanded = searchQuery
            ? filteredItems.length > 0
            : expandedCats.includes(category.category);

          return (
            <div key={category.category} className="mb-0.5">
              <button
                onClick={() => toggleCat(category.category)}
                className={`w-full flex items-center gap-1.5 px-2 py-1.5 hover:bg-surface-raised text-xs font-bold transition-colors ${category.color}`}
              >
                {isExpanded
                  ? <ChevronDown className="w-3 h-3 shrink-0" />
                  : <ChevronRight className="w-3 h-3 shrink-0" />
                }
                {category.icon}
                <span className="truncate">{category.category}</span>
                <span className="ml-auto text-[10px] text-text-muted font-normal">
                  {filteredItems.length}
                </span>
              </button>

              {isExpanded && (
                <div className="flex flex-col">
                  {filteredItems.map(item => (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={(e) => onDragStart(e, item.type, item.label, item.id)}
                      className="group flex items-center justify-between px-3 py-1.5 mx-1 rounded cursor-grab active:cursor-grabbing hover:bg-surface-raised border border-transparent hover:border-border/50 transition-all"
                    >
                      <div className="min-w-0">
                        <div className="text-[11px] text-text-secondary group-hover:text-text-primary transition-colors truncate leading-tight">
                          {item.label}
                        </div>
                        <div className="text-[9px] text-text-muted mt-0.5">{item.role}</div>
                      </div>
                      <div className="text-[9px] text-text-muted ml-1 shrink-0 bg-surface px-1 py-0.5 rounded border border-border/50 group-hover:border-border transition-colors">
                        {item.info}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {searchQuery && PALETTE_ITEMS.every(cat =>
          cat.items.filter(i =>
            i.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
            i.role.toLowerCase().includes(searchQuery.toLowerCase())
          ).length === 0
        ) && (
          <div className="p-4 text-center text-text-muted text-xs">
            No components match "{searchQuery}"
          </div>
        )}
      </div>
    </div>
  );
}
