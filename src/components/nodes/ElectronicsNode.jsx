import { Handle, Position } from '@xyflow/react';

export default function ElectronicsNode({ data, selected }) {
  const isError = data.status === 'error';
  const isValid = data.status === 'valid';

  return (
    <div className={`bg-node-elec border rounded-[10px] w-40 overflow-hidden shadow-lg transition-transform ${selected ? 'border-accent-primary ring-1 ring-accent-primary' : (isError ? 'border-accent-error' : 'border-node-elecBorder')} hover:-translate-y-1 ${isError ? 'animate-[pulse_2s_ease-in-out_infinite]' : ''}`}>
      <div className="bg-node-elec/80 px-2 py-1 border-b border-node-elecBorder/30 flex justify-between items-center">
        <span className="text-accent-primary text-[10px] font-bold tracking-wider">ELECTRONICS</span>
        {(isError || isValid) && (
          <div className={`w-2 h-2 rounded-full ${isError ? 'bg-accent-error' : 'bg-accent-success'}`} />
        )}
      </div>
      <div className="p-2">
        <div className="text-white text-[13px] font-bold mb-2">{data.label}</div>
        <div className="flex flex-col gap-1 text-[11px] text-text-secondary font-mono">
          {data.area && <div>Area: {data.area} µm²</div>}
          {data.impedance && <div>Z: {data.impedance} MΩ</div>}
          {data.material && <div>Mat: {data.material}</div>}
          {data.gain && <div>Gain: {data.gain} dB</div>}
          {data.bw && <div>BW: {data.bw}</div>}
          {data.noise && <div>Noise: {data.noise} nV/√Hz</div>}
        </div>
      </div>
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-accent-primary border-2 border-[#1E1E2A] shadow-md" />
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-accent-primary border-2 border-[#1E1E2A] shadow-md" />
    </div>
  );
}
