import { useEffect, useRef } from 'react';

export default function ConsoleTab({ logs }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView();
  }, [logs]);

  return (
    <div className="h-full bg-black p-4 overflow-y-auto custom-scrollbar font-mono text-xs relative z-10">
      {logs.map((log, i) => (
        <div key={i} className="mb-1 leading-relaxed">
          <span className="text-text-muted">[{log.time}]</span>{' '}
          <span className={
            log.type === 'error' ? 'text-accent-error' : 
            log.type === 'success' ? 'text-accent-success' : 
            log.type === 'warning' ? 'text-accent-warning' : 
            'text-text-secondary'
          }>
            {log.message}
          </span>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
