import BaseNode from './BaseNode';

export default function NeuroNode(props) {
  const { data } = props;
  return (
    <BaseNode {...props} type="NEUROMOD" color="#7c3aed" categoryClass="node-neuro">
      <div className="flex flex-col gap-1 text-[10px] text-text-secondary font-mono opacity-80">
        {data.role && <div className="text-inherit opacity-60 uppercase tracking-tighter text-[8px] font-bold">{data.role}</div>}
        {data.frequency && <div className="flex justify-between"><span>Freq:</span> <span className="text-inherit font-bold">{data.frequency} Hz</span></div>}
        {data.pulseWidth && <div className="flex justify-between"><span>Pulse:</span> <span className="text-inherit font-bold">{data.pulseWidth} µs</span></div>}
        {data.chargeDensity && <div className="flex justify-between"><span>Charge:</span> <span className="text-inherit font-bold">{data.chargeDensity} µC/cm²</span></div>}
      </div>
    </BaseNode>
  );
}
