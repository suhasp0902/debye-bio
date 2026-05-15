import BaseNode from './BaseNode';

export default function ElectrodeNode(props) {
  const { data } = props;
  return (
    <BaseNode {...props} type="ELECTRODE" color="#0b67b2" categoryClass="node-electrode">
      <div className="flex flex-col gap-1 text-[10px] text-text-secondary font-mono opacity-80">
        {data.role && <div className="text-inherit opacity-60 uppercase tracking-tighter text-[8px] font-bold">{data.role}</div>}
        {data.material && <div className="flex justify-between"><span>Material:</span> <span className="text-inherit font-bold">{data.material}</span></div>}
        {data.area && <div className="flex justify-between"><span>Area:</span> <span className="text-inherit font-bold">{data.area} µm²</span></div>}
        {data.interfaceModel && <div className="flex justify-between"><span>Model:</span> <span className="text-inherit font-bold">{data.interfaceModel}</span></div>}
        <div className="mt-1 h-1 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-[#0b67b2]" style={{ width: data.area ? Math.min(100, data.area / 50) + '%' : '30%' }}></div>
        </div>
      </div>
    </BaseNode>
  );
}
