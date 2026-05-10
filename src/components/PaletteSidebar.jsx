import { useState } from 'react';
import { Search, ChevronDown, ChevronRight, Activity, Cpu, Layers } from 'lucide-react';

const PALETTE_ITEMS = [
  {
    category: 'Biology',
    icon: <Activity className="w-4 h-4 text-accent-secondary" />,
    items: [
      { id: 'bio_subq', label: 'Subcutaneous Tissue', type: 'biology', role: 'Tissue' },
      { id: 'bio_cardiac', label: 'Cardiac Muscle', type: 'biology', role: 'Tissue' },
      { id: 'bio_blood', label: 'Blood Sample', type: 'biology', role: 'Fluid' },
      { id: 'bio_wound', label: 'Wound Tissue', type: 'biology', role: 'Tissue' },
      { id: 'bio_brain', label: 'Brain Tissue (Cortex)', type: 'biology', role: 'Tissue' },
      { id: 'bio_nerve', label: 'Nerve Fiber', type: 'biology', role: 'Tissue' },
      { id: 'bio_gut', label: 'Gastric Mucosa', type: 'biology', role: 'Tissue' },
      { id: 'bio_skin', label: 'Epidermis', type: 'biology', role: 'Tissue' }
    ]
  },
  {
    category: 'Electronics',
    icon: <Cpu className="w-4 h-4 text-accent-primary" />,
    items: [
      { id: 'el_contact', label: 'Electrode Contact', type: 'electronics', role: 'Interface' },
      { id: 'el_array', label: 'Microelectrode Array', type: 'electronics', role: 'Interface' },
      { id: 'el_ref', label: 'Reference Electrode', type: 'electronics', role: 'Interface' },
      { id: 'el_amp', label: 'Amplifier', type: 'electronics', role: 'Circuit' },
      { id: 'el_adc', label: 'ADC', type: 'electronics', role: 'Circuit' },
      { id: 'el_dac', label: 'DAC', type: 'electronics', role: 'Circuit' },
      { id: 'el_tx', label: 'Wireless Transmitter', type: 'electronics', role: 'Circuit' },
      { id: 'el_stim', label: 'Pulse Generator', type: 'electronics', role: 'Circuit' },
      { id: 'el_mcu', label: 'Microcontroller', type: 'electronics', role: 'Logic' },
      { id: 'el_batt', label: 'Microbattery', type: 'electronics', role: 'Power' },
      { id: 'el_res', label: 'Resistor', type: 'electronics', role: 'Passive' },
      { id: 'el_cap', label: 'Capacitor', type: 'electronics', role: 'Passive' },
      { id: 'el_ind', label: 'Inductor', type: 'electronics', role: 'Passive' }
    ]
  },
  {
    category: 'Materials',
    icon: <Layers className="w-4 h-4 text-text-primary" />,
    items: [
      { id: 'mat_pt', label: 'Platinum', type: 'material', role: 'Metal' },
      { id: 'mat_au', label: 'Gold', type: 'material', role: 'Metal' },
      { id: 'mat_ir', label: 'Iridium Oxide', type: 'material', role: 'Metal' },
      { id: 'mat_ptir', label: 'Platinum-Iridium', type: 'material', role: 'Metal' },
      { id: 'mat_ti', label: 'Titanium', type: 'material', role: 'Metal' },
      { id: 'mat_ag', label: 'Ag/AgCl', type: 'material', role: 'Compound' },
      { id: 'mat_pedot', label: 'PEDOT:PSS', type: 'material', role: 'Polymer' },
      { id: 'mat_parylene', label: 'Parylene-C', type: 'material', role: 'Encapsulant' },
      { id: 'mat_silicone', label: 'Silicone PDMS', type: 'material', role: 'Encapsulant' },
      { id: 'mat_hydrogel', label: 'Conductive Hydrogel', type: 'material', role: 'Polymer' }
    ]
  }
];

export default function PaletteSidebar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCats, setExpandedCats] = useState(['Biology', 'Electronics', 'Materials']);

  const toggleCat = (cat) => {
    if (expandedCats.includes(cat)) {
      setExpandedCats(expandedCats.filter(c => c !== cat));
    } else {
      setExpandedCats([...expandedCats, cat]);
    }
  };

  const onDragStart = (event, nodeType, label) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('application/label', label);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-[280px] bg-surface border-r border-border flex flex-col shrink-0 h-full relative z-10">
      <div className="p-4 border-b border-border bg-surface-raised">
        <div className="relative">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search components..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface border border-border text-text-primary text-sm rounded-md pl-9 pr-3 py-2 focus:outline-none focus:border-accent-primary transition-colors"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
        {PALETTE_ITEMS.map((category) => {
          const filteredItems = category.items.filter(item => 
            item.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
            item.role.toLowerCase().includes(searchQuery.toLowerCase())
          );

          if (filteredItems.length === 0 && searchQuery) return null;

          const isExpanded = expandedCats.includes(category.category) || searchQuery;

          return (
            <div key={category.category} className="mb-2">
              <button 
                onClick={() => toggleCat(category.category)}
                className="w-full flex items-center gap-2 p-2 hover:bg-surface-raised rounded-md text-text-primary text-sm font-bold transition-colors"
              >
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                {category.icon}
                {category.category}
              </button>
              
              {isExpanded && (
                <div className="mt-1 flex flex-col gap-1 pl-6 pr-2">
                  {filteredItems.map(item => (
                    <div 
                      key={item.id}
                      draggable
                      onDragStart={(e) => onDragStart(e, item.type, item.label)}
                      className="text-xs text-text-secondary hover:text-text-primary p-2 border border-transparent hover:border-border hover:bg-surface-raised rounded cursor-grab active:cursor-grabbing flex justify-between items-center transition-colors"
                    >
                      <span>{item.label}</span>
                      <span className="text-[10px] text-text-muted">{item.role}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
