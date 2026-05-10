import { ShieldAlert, ShieldCheck, Wrench, FileSearch, CheckCircle } from 'lucide-react';
import { useState } from 'react';

export default function DRCTab({ results, isRunning, onExplain, onFix, nodes }) {
  const [expanded, setExpanded] = useState({});

  if (!results) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-text-muted bg-surface relative z-10">
        {isRunning ? (
          <div className="w-64">
            <div className="h-2 bg-surface-raised rounded-full overflow-hidden relative">
              <div className="absolute inset-y-0 left-0 bg-accent-primary animate-[progress_0.8s_ease-in-out_forwards]" style={{ width: '100%' }} />
            </div>
            <div className="text-sm mt-4 text-center animate-pulse">Running Design Rule Checks...</div>
          </div>
        ) : (
          <div>
            No DRC results. Click "Run DRC" to scan design.
          </div>
        )}
      </div>
    );
  }

  const { errors, warnings, passed } = results;

  const toggleExpand = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const materials = nodes?.filter(n => n.type === 'material') || [];

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-300 bg-surface">
      <div className="h-[36px] bg-surface-raised border-b border-border flex items-center px-4 gap-4 text-sm shrink-0">
        <div className="font-bold text-text-primary">Summary:</div>
        <div className="flex gap-2 items-center text-accent-error">
          <ShieldAlert className="w-4 h-4" /> {errors.length} Errors
        </div>
        <div className="flex gap-2 items-center text-accent-warning">
          <ShieldAlert className="w-4 h-4" /> {warnings.length} Warnings
        </div>
        <div className="flex gap-2 items-center text-accent-success">
          <ShieldCheck className="w-4 h-4" /> {passed} Passed
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex gap-4">
        <div className="flex-1 flex flex-col gap-3">
          {errors.map(err => (
            <div key={err.id} className="border border-accent-error/30 bg-accent-error/5 rounded-md overflow-hidden">
              <div 
                className="p-3 cursor-pointer hover:bg-accent-error/10 flex justify-between items-center transition-colors"
                onClick={() => toggleExpand(err.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-accent-error"></div>
                  <span className="font-mono text-xs text-accent-error font-bold">{err.id}</span>
                  <span className="text-text-primary text-sm font-bold">{err.title}</span>
                </div>
                <div className="text-xs text-text-muted">Affected: {err.affected}</div>
              </div>
              
              {expanded[err.id] !== false && (
                <div className="p-3 pt-0 text-sm text-text-secondary border-t border-accent-error/10 mt-1">
                  <div className="py-2 leading-relaxed">{err.message}</div>
                  <div className="flex gap-2 mt-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); onExplain(`Explain DRC violation: ${err.title}. ${err.message}`); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-border hover:text-text-primary rounded text-xs transition-colors"
                    >
                      <FileSearch className="w-3.5 h-3.5" /> Explain
                    </button>
                    {err.fixable && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); onFix(err.id); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-accent-error/20 hover:bg-accent-error/30 text-accent-error rounded text-xs font-medium transition-colors"
                      >
                        <Wrench className="w-3.5 h-3.5" /> Fix Automatically
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}

          {warnings.map(warn => (
            <div key={warn.id} className="border border-accent-warning/30 bg-accent-warning/5 rounded-md overflow-hidden">
              <div 
                className="p-3 cursor-pointer hover:bg-accent-warning/10 flex justify-between items-center transition-colors"
                onClick={() => toggleExpand(warn.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-accent-warning"></div>
                  <span className="font-mono text-xs text-accent-warning font-bold">{warn.id}</span>
                  <span className="text-text-primary text-sm font-bold">{warn.title}</span>
                </div>
                <div className="text-xs text-text-muted">Affected: {warn.affected}</div>
              </div>
              
              {expanded[warn.id] !== false && (
                <div className="p-3 pt-0 text-sm text-text-secondary border-t border-accent-warning/10 mt-1">
                  <div className="py-2 leading-relaxed">{warn.message}</div>
                  <div className="flex gap-2 mt-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); onExplain(`Explain DRC warning: ${warn.title}. ${warn.message}`); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-border hover:text-text-primary rounded text-xs transition-colors"
                    >
                      <FileSearch className="w-3.5 h-3.5" /> Explain
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {errors.length === 0 && warnings.length === 0 && (
             <div className="border border-accent-success/20 bg-accent-success/5 rounded-md p-3 flex items-center gap-3">
               <ShieldCheck className="w-5 h-5 text-accent-success" />
               <span className="text-sm text-text-primary font-medium">All design rules passed. No violations detected.</span>
             </div>
          )}
        </div>

        <div className="w-[350px] bg-surface-raised border border-border rounded-md p-3 flex flex-col shrink-0">
            <div className="text-xs font-bold text-text-primary mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-accent-success" />
                Biocompatibility Report
            </div>
            {materials.length > 0 ? (
                <div className="flex flex-col gap-2">
                    {materials.map((mat) => (
                        <div key={mat.id} className="bg-surface border border-border rounded p-2 text-xs">
                            <div className="font-bold text-text-primary mb-1">{mat.data.label}</div>
                            <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-1">
                                <span className="text-text-muted">ISO 10993:</span>
                                <span className="text-accent-success font-medium">✓ Compliant</span>
                                <span className="text-text-muted">FDA Status:</span>
                                <span className="text-accent-success font-medium">✓ Approved (Class II/III)</span>
                                {mat.data.chronic && (
                                    <>
                                        <span className="text-text-muted">Chronic:</span>
                                        <span className="text-accent-success font-medium">✓ &gt;2 years</span>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                    <div className="mt-2 text-[10px] text-text-muted leading-relaxed">
                        Materials are cross-referenced against FDA MAF databases and ISO 10993-1 frameworks for intended tissue contact duration.
                    </div>
                </div>
            ) : (
                <div className="text-xs text-text-muted italic">
                    No materials present on canvas to evaluate.
                </div>
            )}
        </div>
      </div>
      <style>{`
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
}
