import BaseNode from './BaseNode';

export default function ElectrodeNode(props) {
  const { data } = props;
  return (
    <BaseNode {...props} type="ELECTRODE" color="#06B6D4">
      <div className="flex flex-col gap-1 text-[10px] text-text-secondary font-mono opacity-80">
        {data.role && <div className="text-white/60 uppercase tracking-tighter text-[8px] font-bold">{data.role}</div>}
        {data.material && <div className="flex justify-between"><span>Material:</span> <span className="text-white">{data.material}</span></div>}
        {data.area && <div className="flex justify-between"><span>Area:</span> <span className="text-white">{data.area} µm²</span></div>}
        {data.interfaceModel && <div className="flex justify-between"><span>Model:</span> <span className="text-white">{data.interfaceModel}</span></div>}
        <div className="mt-1 h-1 w-full bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-[#06B6D4]" style={{ width: data.area ? Math.min(100, data.area / 50) + '%' : '30%' }}></div>
        </div>
      </div>
    </BaseNode>
  );
}
