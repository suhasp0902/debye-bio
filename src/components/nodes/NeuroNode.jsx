import BaseNode from './BaseNode';

export default function NeuroNode(props) {
  const { data } = props;
  return (
    <BaseNode {...props} type="NEUROMOD" color="#FB923C">
      <div className="flex flex-col gap-1 text-[10px] text-text-secondary font-mono opacity-80">
        {data.role && <div className="text-white/60 uppercase tracking-tighter text-[8px] font-bold">{data.role}</div>}
        {data.frequency && <div className="flex justify-between"><span>Freq:</span> <span className="text-white">{data.frequency} Hz</span></div>}
        {data.pulseWidth && <div className="flex justify-between"><span>Pulse:</span> <span className="text-white">{data.pulseWidth} µs</span></div>}
        {data.chargeDensity && <div className="flex justify-between"><span>Charge:</span> <span className="text-white">{data.chargeDensity} µC/cm²</span></div>}
        <div className="mt-2 flex gap-0.5 h-3 items-end">
          {[4, 10, 4, 10, 4].map((h, i) => (
            <div key={i} className="bg-[#FB923C] w-1.5" style={{ height: h + 'px' }}></div>
          ))}
        </div>
      </div>
    </BaseNode>
  );
}
