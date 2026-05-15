import { Handle, Position, NodeResizer } from '@xyflow/react';
import { X } from 'lucide-react';

export default function BaseNode({ id, data, selected, children, type, color, categoryClass }) {
  return (
    <div className={`glass-node ${categoryClass} ${selected ? 'glass-node-selected' : ''} group relative`} style={{ minWidth: '160px', minHeight: '90px' }}>
      <NodeResizer 
        minWidth={160} 
        minHeight={90} 
        isVisible={selected} 
        lineClassName="border-accent-primary/50" 
        handleClassName="!w-2 !h-2 !bg-accent-primary !border-white !rounded-full"
      />
      
      {/* Header */}
      <div className="backdrop-blur-md px-2 py-1.5 border-b border-white/10 rounded-t-[12px] flex items-center justify-between bg-white/5">
        <span className="text-[9px] font-black tracking-widest uppercase opacity-80">{type}</span>
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
        <div className="text-inherit text-[13px] font-bold mb-1.5 leading-tight">{data.label}</div>
        {children}
      </div>

      {/* 4 Handles - Universal connectivity */}
      <Handle type="source" position={Position.Top} id="t" className="node-handle" />
      <Handle type="source" position={Position.Bottom} id="b" className="node-handle" />
      <Handle type="source" position={Position.Left} id="l" className="node-handle" />
      <Handle type="source" position={Position.Right} id="r" className="node-handle" />
    </div>
  );
}
