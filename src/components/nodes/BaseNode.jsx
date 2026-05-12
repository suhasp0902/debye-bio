import { Handle, Position, NodeResizer } from '@xyflow/react';
import { X } from 'lucide-react';

export default function BaseNode({ id, data, selected, children, type, color, border }) {
  return (
    <div className={`glass-node bg-opacity-10 border rounded-[12px] min-w-[160px] min-h-[90px] overflow-visible shadow-2xl transition-all duration-300 ${selected ? 'glass-node-selected' : 'border-opacity-30'} group relative`} style={{ backgroundColor: `${color}15`, borderColor: selected ? color : `${color}40` }}>
      <NodeResizer 
        minWidth={160} 
        minHeight={90} 
        isVisible={selected} 
        lineClassName="border-accent-primary/50" 
        handleClassName="!w-2 !h-2 !bg-accent-primary !border-white !rounded-full"
      />
      
      {/* Header */}
      <div className="backdrop-blur-md px-2 py-1.5 border-b border-white/10 rounded-t-[12px] flex items-center justify-between" style={{ backgroundColor: `${color}30` }}>
        <span className="text-[9px] font-black tracking-widest uppercase" style={{ color: color }}>{type}</span>
        {selected && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              window.dispatchEvent(new CustomEvent('debye-delete-node', { detail: { id } }));
            }}
            className="hover:bg-red-500/20 p-0.5 rounded-full transition-colors"
          >
            <X className="w-3 h-3 text-red-400" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <div className="text-white text-[13px] font-bold mb-1.5 leading-tight">{data.label}</div>
        {children}
      </div>

      {/* 4 Handles - Universal connectivity */}
      <Handle type="source" position={Position.Top} id="t" className="node-handle" style={{ backgroundColor: color }} />
      <Handle type="source" position={Position.Bottom} id="b" className="node-handle" style={{ backgroundColor: color }} />
      <Handle type="source" position={Position.Left} id="l" className="node-handle" style={{ backgroundColor: color }} />
      <Handle type="source" position={Position.Right} id="r" className="node-handle" style={{ backgroundColor: color }} />
    </div>
  );
}
