import BaseNode from './BaseNode';

export default function BiochemistryNode(props) {
  const { data } = props;
  return (
    <BaseNode {...props} type="BIOCHEMISTRY" color="#4f46e5" categoryClass="node-biochemistry">
      <div className="text-inherit opacity-60 text-[10px] font-bold uppercase mb-2">{data.role}</div>
      <div className="flex flex-col gap-1 text-[10px] text-text-secondary font-mono opacity-80">
        {data.info && <div>Info: {data.info}</div>}
      </div>
    </BaseNode>
  );
}
