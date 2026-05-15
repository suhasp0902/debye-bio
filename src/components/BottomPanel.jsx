import { useState, useRef, useCallback } from 'react';
import { ChevronDown, ChevronUp, Activity, Shield, Sliders, TerminalSquare, X, GripHorizontal } from 'lucide-react';
import SimulationTab from './tabs/SimulationTab';
import DRCTab from './tabs/DRCTab';
import PropertiesTab from './tabs/PropertiesTab';
import ConsoleTab from './tabs/ConsoleTab';

export default function BottomPanel({ 
  simulationData, 
  drcResults, 
  logs, 
  selectedNode, 
  onUpdateNode, 
  activeTab, 
  setActiveTab,
  simRunning,
  drcRunning,
  onExplain,
  onFixDRC,
  nodes,
  height,
  setHeight,
  onClose
}) {
  const [collapsed, setCollapsed] = useState(false);
  const isResizing = useRef(false);

  const handleMouseMove = useCallback((e) => {
    if (!isResizing.current) return;
    const newHeight = window.innerHeight - e.clientY;
    if (newHeight > 100 && newHeight < window.innerHeight * 0.8) {
      setHeight(newHeight);
    }
  }, [setHeight]);

  const stopResizing = useCallback(() => {
    isResizing.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.body.style.cursor = 'default';
  }, [handleMouseMove]);

  const startResizing = useCallback(() => {
    isResizing.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', stopResizing, { once: true });
    document.body.style.cursor = 'row-resize';
  }, [handleMouseMove, stopResizing]);

  const tabs = [
    { id: 'simulation', label: 'Simulation', icon: <Activity className="w-4 h-4" /> },
    { id: 'drc', label: 'DRC', icon: <Shield className="w-4 h-4" /> },
    { id: 'properties', label: 'Properties', icon: <Sliders className="w-4 h-4" /> },
    { id: 'console', label: 'Console', icon: <TerminalSquare className="w-4 h-4" /> }
  ];

  return (
    <div 
      className={`bg-surface border-t border-border flex flex-col transition-all shrink-0 relative z-30 shadow-[0_-8px_30px_rgb(0,0,0,0.12)] group/panel`} 
      style={{ height: collapsed ? '40px' : `${height}px` }}
    >
      {/* Resize Handle */}
      <div 
        onMouseDown={startResizing}
        className="absolute top-0 left-0 right-0 h-1 cursor-row-resize hover:bg-accent-primary/50 transition-colors z-40"
      >
        <div className="absolute left-1/2 top-0 -translate-x-1/2 opacity-0 group-hover/panel:opacity-100 transition-opacity">
           <GripHorizontal className="w-3 h-3 text-text-muted" />
        </div>
      </div>

      <div className="flex items-center justify-between px-2 bg-surface-raised border-b border-border h-[40px] shrink-0">
        <div className="flex h-full">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (collapsed) setCollapsed(false);
              }}
              className={`flex items-center gap-2 px-4 h-full text-sm font-medium border-r border-border transition-colors ${activeTab === tab.id && !collapsed ? 'bg-surface text-accent-primary border-t-2 border-t-accent-primary' : 'text-text-muted hover:text-text-primary hover:bg-surface/50 border-t-2 border-t-transparent'}`}
            >
              {tab.icon}
              {tab.label}
              {tab.id === 'drc' && drcResults?.errors?.length > 0 && (
                <span className="bg-accent-error text-white text-[10px] px-1.5 py-0.5 rounded-full ml-1 leading-none">{drcResults.errors.length}</span>
              )}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 text-text-muted hover:text-text-primary transition-colors"
          >
            {collapsed ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          <button 
            onClick={onClose}
            className="p-1.5 text-text-muted hover:text-red-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="flex-1 min-h-0 bg-surface relative z-10 overflow-hidden">
          {activeTab === 'simulation' && <SimulationTab data={simulationData} isRunning={simRunning} />}
          {activeTab === 'drc' && <DRCTab results={drcResults} isRunning={drcRunning} onExplain={onExplain} onFix={onFixDRC} nodes={nodes} />}
          {activeTab === 'properties' && <PropertiesTab selectedNode={selectedNode} onUpdateNode={onUpdateNode} />}
          {activeTab === 'console' && <ConsoleTab logs={logs} />}
        </div>
      )}
    </div>
  );
}
