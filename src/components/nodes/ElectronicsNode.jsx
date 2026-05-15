import BaseNode from './BaseNode';

export default function ElectronicsNode(props) {
  const { data } = props;
  return (
    <BaseNode {...props} type="ELECTRONICS" color="#0b67b2">
      <div className="flex flex-col gap-1 text-[10px] text-text-secondary font-mono opacity-80">
        {data.role && <div className="text-accent-primary uppercase tracking-tighter text-[9px]">{data.role}</div>}
        {data.material && <div>Mat: {data.material}</div>}
        {data.area && <div>Area: {data.area} µm²</div>}
        {data.voltage && <div>Vout: {data.voltage}</div>}
      </div>
    </BaseNode>
  );
}
