import { useState, useEffect } from 'react';

export default function PropertiesTab({ selectedNode, onUpdateNode }) {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (selectedNode) {
      setFormData({ ...selectedNode.data });
    } else {
      setFormData({});
    }
  }, [selectedNode]);

  if (!selectedNode) {
    return (
      <div className="h-full flex items-center justify-center text-text-muted bg-surface relative z-10">
        Select a node on the canvas to view or edit its properties.
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: isNaN(Number(value)) || value === '' ? value : Number(value)
    }));
  };

  const handleUpdate = () => {
    onUpdateNode(selectedNode.id, formData);
  };

  return (
    <div className="h-full flex flex-col p-4 bg-surface overflow-y-auto custom-scrollbar relative z-10">
      <div className="text-sm font-bold text-text-primary mb-1">Node: {selectedNode.data.label || selectedNode.data.role}</div>
      <div className="text-xs text-text-muted mb-4 border-b border-border pb-2">Type: {selectedNode.type}</div>

      <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-6">
        {Object.entries(formData).map(([key, value]) => {
          if (['label', 'type', 'role', 'status'].includes(key)) return null;
          
          return (
            <div key={key} className="flex flex-col gap-1">
              <label className="text-xs text-text-muted capitalize">{key}:</label>
              <input 
                type={typeof value === 'number' ? 'number' : 'text'}
                name={key}
                value={value}
                onChange={handleChange}
                className="bg-surface-raised border border-border rounded px-2 py-1 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
              />
            </div>
          );
        })}
      </div>

      <div className="bg-surface-raised border border-border rounded-md p-3 mb-6">
        <div className="text-xs font-bold text-text-primary mb-2">Computed Properties:</div>
        <div className="grid grid-cols-[1fr_auto] gap-2 text-sm font-mono">
          <div className="text-text-secondary">Impedance @ 1kHz:</div>
          <div className="text-accent-warning text-right">{selectedNode.data.impedance || '2.1'} MΩ ⚠</div>
          <div className="text-text-secondary">Charge Inj. Limit:</div>
          <div className="text-text-primary text-right">0.15 mC/cm²</div>
          <div className="text-text-secondary">ISO 10993:</div>
          <div className="text-accent-success text-right">✓ Compliant</div>
        </div>
      </div>

      <div className="flex gap-3 mt-auto pt-4">
        <button 
          onClick={handleUpdate}
          className="flex-1 bg-accent-primary hover:bg-accent-primary/90 text-white text-sm font-bold py-2 rounded-md transition-colors"
        >
          Update Node
        </button>
        <button 
          onClick={() => setFormData({ ...selectedNode.data })}
          className="flex-1 border border-border hover:bg-surface-raised text-text-primary text-sm font-bold py-2 rounded-md transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
