import BaseNode from './BaseNode';

export default function FluidicsNode(props) {
  const { data } = props;
  return (
    <BaseNode {...props} type="FLUIDICS" color="#2fb8e7">
      <div className="flex flex-col gap-1 text-[10px] text-text-secondary font-mono opacity-80">
        {data.role && <div className="text-white/60 uppercase tracking-tighter text-[8px] font-bold">{data.role}</div>}
        {data.flowRate && <div className="flex justify-between"><span>Flow:</span> <span className="text-white">{data.flowRate} µL/min</span></div>}
        {data.viscosity && <div className="flex justify-between"><span>Visc:</span> <span className="text-white">{data.viscosity} cP</span></div>}
        {data.channelWidth && <div className="flex justify-between"><span>Width:</span> <span className="text-white">{data.channelWidth} µm</span></div>}
        <div className="mt-2 flex items-center gap-2">
           <div className="flex-1 h-1.5 bg-blue-500/20 rounded-full relative overflow-hidden">
              <div className="absolute inset-0 bg-blue-400/40 animate-pulse"></div>
           </div>
        </div>
      </div>
    </BaseNode>
  );
}
