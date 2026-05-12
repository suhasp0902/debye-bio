import BaseNode from './BaseNode';

export default function BiochemistryNode(props) {
  const { data } = props;
  return (
    <BaseNode {...props} type="BIOCHEMISTRY" color="#10B981">
      <div className="text-accent-success/80 text-[10px] font-medium mb-2">{data.role}</div>
      <div className="flex flex-col gap-1 text-[10px] text-text-secondary font-mono opacity-80">
        {data.info && <div>Info: {data.info}</div>}
      </div>
    </BaseNode>
  );
}
