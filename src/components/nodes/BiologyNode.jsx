import { Handle, Position } from '@xyflow/react';

export default function BiologyNode({ data, selected }) {
  return (
    <div className={`bg-node-bio border rounded-[10px] w-40 overflow-hidden shadow-lg transition-transform ${selected ? 'border-accent-primary ring-1 ring-accent-primary' : 'border-node-bioBorder'} hover:-translate-y-1`}>
      <div className="bg-node-bio/80 px-2 py-1 border-b border-node-bioBorder/30">
        <span className="text-accent-secondary text-[10px] font-bold tracking-wider">BIOLOGY</span>
      </div>
      <div className="p-2">
        <div className="text-white text-[13px] font-bold mb-2">{data.label}</div>
        <div className="flex flex-col gap-1 text-[11px] text-text-secondary font-mono">
          {data.conductivity && <div>Cond: {data.conductivity} S/m</div>}
          {data.permittivity && <div>Perm: {data.permittivity}</div>}
        </div>
      </div>
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-accent-secondary border-2 border-[#1E1E2A] shadow-md" />
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-accent-secondary border-2 border-[#1E1E2A] shadow-md" />
    </div>
  );
}
