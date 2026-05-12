import BaseNode from './BaseNode';

export default function BiologyNode(props) {
  const { data } = props;
  return (
    <BaseNode {...props} type="BIOLOGY" color="#22D3EE">
      <div className="flex flex-col gap-1 text-[10px] text-text-secondary font-mono opacity-80">
        {data.conductivity && <div>Cond: {data.conductivity} S/m</div>}
        {data.permittivity && <div>Perm: {data.permittivity}</div>}
      </div>
    </BaseNode>
  );
}
