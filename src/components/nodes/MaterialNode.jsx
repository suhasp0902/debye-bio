import BaseNode from './BaseNode';

export default function MaterialNode(props) {
  const { data } = props;
  return (
    <BaseNode {...props} type="MATERIAL" color="#f5b836" categoryClass="node-material">
      <div className="flex flex-col gap-1 text-[10px] text-text-secondary font-mono opacity-80">
        {data.role && <div className="text-inherit opacity-60 uppercase tracking-tighter text-[9px] font-bold">{data.role}</div>}
        {data.chronic && <div>Chronic: {data.chronic ? 'Yes' : 'No'}</div>}
        {data.iso && <div>ISO Cert: {data.iso ? 'Yes' : 'No'}</div>}
      </div>
    </BaseNode>
  );
}
