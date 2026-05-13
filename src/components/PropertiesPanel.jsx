import { Settings, Info, Zap, Layers, X, Activity, Droplets, Radio } from 'lucide-react';

export default function PropertiesPanel({ selectedNode, onUpdateNode, onClose }) {
  if (!selectedNode) {
    return (
      <div className="w-[280px] bg-surface border-l border-border flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-surface-raised flex items-center justify-center mb-4 border border-border">
          <Info className="w-6 h-6 text-text-muted" />
        </div>
        <div className="text-text-primary font-bold text-sm mb-1">Properties Inspector</div>
        <div className="text-text-muted text-xs leading-relaxed">
          Select a component on the canvas to view and edit its bio-electronic parameters.
        </div>
      </div>
    );
  }

  const { data, id, type } = selectedNode;

  return (
    <div className="w-[280px] bg-surface border-l border-border flex flex-col shrink-0 h-full overflow-hidden">
      <div className="p-3 border-b border-border bg-surface-raised flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-accent-primary" />
          <span className="text-xs font-bold uppercase tracking-wider">Inspector</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-text-muted font-mono">{id}</span>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-surface-raised rounded transition-colors text-text-muted hover:text-text-primary"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
        {/* General Info */}
        <section>
          <div className="text-[10px] text-text-muted font-bold uppercase mb-3 flex items-center gap-2">
            <Info className="w-3 h-3" /> Basic Info
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-[10px] text-text-muted block mb-1">Component Name</label>
              <input 
                type="text" 
                value={data.label || ''} 
                onChange={(e) => onUpdateNode(id, { label: e.target.value })}
                className="w-full bg-background border border-border rounded px-2 py-1.5 text-xs text-text-primary focus:border-accent-primary outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-text-muted block mb-1">Entity Type</label>
              <div className="text-xs text-text-secondary bg-surface-raised px-2 py-1.5 rounded border border-border uppercase tracking-tight">
                {type}
              </div>
            </div>
          </div>
        </section>

        {/* Technical Parameters */}
        <section>
          <div className="text-[10px] text-text-muted font-bold uppercase mb-3 flex items-center gap-2">
            <Zap className="w-3 h-3" /> Technical Specs
          </div>
          <div className="space-y-4">
            {type === 'biology' && (
              <>
                <div>
                  <label className="text-[10px] text-text-muted block mb-1">Conductivity (S/m)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={data.conductivity || 0} 
                    onChange={(e) => onUpdateNode(id, { conductivity: parseFloat(e.target.value) })}
                    className="w-full bg-background border border-border rounded px-2 py-1.5 text-xs text-text-primary focus:border-accent-primary outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-text-muted block mb-1">Relative Permittivity</label>
                  <input 
                    type="number" 
                    value={data.permittivity || 0} 
                    onChange={(e) => onUpdateNode(id, { permittivity: parseInt(e.target.value) })}
                    className="w-full bg-background border border-border rounded px-2 py-1.5 text-xs text-text-primary focus:border-accent-primary outline-none"
                  />
                </div>
              </>
            )}

            {(type === 'electrode' || type === 'electronics') && (
              <>
                <div>
                  <label className="text-[10px] text-text-muted block mb-1">Surface Area (µm²)</label>
                  <input 
                    type="number" 
                    value={data.area || 0} 
                    onChange={(e) => onUpdateNode(id, { area: parseInt(e.target.value) })}
                    className="w-full bg-background border border-border rounded px-2 py-1.5 text-xs text-text-primary focus:border-accent-primary outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-text-muted block mb-1">Material Composition</label>
                  <select 
                    value={data.material || ''} 
                    onChange={(e) => onUpdateNode(id, { material: e.target.value })}
                    className="w-full bg-background border border-border rounded px-2 py-1.5 text-xs text-text-primary focus:border-accent-primary outline-none"
                  >
                    <option value="Platinum">Platinum</option>
                    <option value="Platinum-Iridium">Platinum-Iridium</option>
                    <option value="Gold">Gold</option>
                    <option value="Iridium Oxide">Iridium Oxide</option>
                    <option value="PEDOT:PSS">PEDOT:PSS</option>
                    <option value="Titanium Nitride">Titanium Nitride</option>
                  </select>
                </div>
              </>
            )}

            {type === 'neuromodulation' && (
              <>
                <div>
                  <label className="text-[10px] text-text-muted block mb-1">Frequency (Hz)</label>
                  <input 
                    type="number" 
                    value={data.frequency || 130} 
                    onChange={(e) => onUpdateNode(id, { frequency: parseInt(e.target.value) })}
                    className="w-full bg-background border border-border rounded px-2 py-1.5 text-xs text-text-primary focus:border-accent-primary outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-text-muted block mb-1">Pulse Width (µs)</label>
                  <input 
                    type="number" 
                    value={data.pulseWidth || 60} 
                    onChange={(e) => onUpdateNode(id, { pulseWidth: parseInt(e.target.value) })}
                    className="w-full bg-background border border-border rounded px-2 py-1.5 text-xs text-text-primary focus:border-accent-primary outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-text-muted block mb-1">Charge Density (µC/cm²)</label>
                  <input 
                    type="number" 
                    value={data.chargeDensity || 30} 
                    onChange={(e) => onUpdateNode(id, { chargeDensity: parseInt(e.target.value) })}
                    className="w-full bg-background border border-border rounded px-2 py-1.5 text-xs text-text-primary focus:border-accent-primary outline-none"
                  />
                </div>
              </>
            )}

            {type === 'microfluidics' && (
              <>
                <div>
                  <label className="text-[10px] text-text-muted block mb-1">Flow Rate (µL/min)</label>
                  <input 
                    type="number" 
                    value={data.flowRate || 5} 
                    onChange={(e) => onUpdateNode(id, { flowRate: parseFloat(e.target.value) })}
                    className="w-full bg-background border border-border rounded px-2 py-1.5 text-xs text-text-primary focus:border-accent-primary outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-text-muted block mb-1">Channel Width (µm)</label>
                  <input 
                    type="number" 
                    value={data.channelWidth || 100} 
                    onChange={(e) => onUpdateNode(id, { channelWidth: parseInt(e.target.value) })}
                    className="w-full bg-background border border-border rounded px-2 py-1.5 text-xs text-text-primary focus:border-accent-primary outline-none"
                  />
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
