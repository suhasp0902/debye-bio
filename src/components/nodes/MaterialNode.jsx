import { Handle, Position } from '@xyflow/react';

export default function MaterialNode({ data, selected }) {
  return (
    <div className={`bg-node-material border rounded-[10px] w-40 overflow-hidden shadow-lg transition-transform ${selected ? 'border-accent-primary ring-1 ring-accent-primary' : 'border-node-materialBorder'} hover:-translate-y-1`}>
      <div className="bg-node-material/80 px-2 py-1 border-b border-node-materialBorder/30">
        <span className="text-accent-warning text-[10px] font-bold tracking-wider">MATERIAL</span>
      </div>
      <div className="p-2">
        <div className="text-white text-[13px] font-bold mb-2">{data.label}</div>
        <div className="flex flex-col gap-1 text-[11px] text-text-secondary font-mono">
          {data.cil && <div>CIL: {data.cil} mC/cm²</div>}
          {data.iso && <div>ISO 10993: ✓</div>}
        </div>
      </div>
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-accent-warning border-2 border-[#1E1E2A] shadow-md" />
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-accent-warning border-2 border-[#1E1E2A] shadow-md" />
    </div>
  );
}
