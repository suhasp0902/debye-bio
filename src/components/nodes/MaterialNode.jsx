import BaseNode from './BaseNode';

export default function MaterialNode(props) {
  const { data } = props;
  return (
    <BaseNode {...props} type="MATERIAL" color="#f5b836">
      <div className="flex flex-col gap-1 text-[10px] text-text-secondary font-mono opacity-80">
        {data.role && <div className="text-yellow-300 uppercase tracking-tighter text-[9px]">{data.role}</div>}
        {data.chronic && <div>Chronic: {data.chronic ? 'Yes' : 'No'}</div>}
        {data.iso && <div>ISO Cert: {data.iso ? 'Yes' : 'No'}</div>}
      </div>
    </BaseNode>
  );
}
