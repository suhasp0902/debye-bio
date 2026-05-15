import BaseNode from './BaseNode';

export default function ElectronicsNode(props) {
  const { data } = props;
  return (
    <BaseNode {...props} type="ELECTRONICS" color="#991b1b" categoryClass="node-electronics">
      <div className="flex flex-col gap-1 text-[10px] text-text-secondary font-mono opacity-80">
        {data.role && <div className="text-inherit opacity-60 uppercase tracking-tighter text-[9px] font-bold">{data.role}</div>}
        {data.material && <div>Mat: {data.material}</div>}
        {data.area && <div>Area: {data.area} µm²</div>}
        {data.voltage && <div>Vout: {data.voltage}</div>}
      </div>
    </BaseNode>
  );
}
