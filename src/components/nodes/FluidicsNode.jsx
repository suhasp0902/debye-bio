import BaseNode from './BaseNode';

export default function FluidicsNode(props) {
  const { data } = props;
  return (
    <BaseNode {...props} type="FLUIDICS" color="#db2777" categoryClass="node-fluidics">
      <div className="flex flex-col gap-1 text-[10px] text-text-secondary font-mono opacity-80">
        {data.role && <div className="text-inherit opacity-60 uppercase tracking-tighter text-[8px] font-bold">{data.role}</div>}
        {data.flowRate && <div className="flex justify-between"><span>Flow:</span> <span className="text-inherit font-bold">{data.flowRate} µL/min</span></div>}
        {data.viscosity && <div className="flex justify-between"><span>Visc:</span> <span className="text-inherit font-bold">{data.viscosity} cP</span></div>}
        {data.channelWidth && <div className="flex justify-between"><span>Width:</span> <span className="text-inherit font-bold">{data.channelWidth} µm</span></div>}
      </div>
    </BaseNode>
  );
}
