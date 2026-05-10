import { useState } from 'react';
import { ChevronDown, ChevronUp, Activity, Shield, Sliders, TerminalSquare } from 'lucide-react';
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
  nodes
}) {
  const [collapsed, setCollapsed] = useState(false);

  const tabs = [
    { id: 'simulation', label: 'Simulation', icon: <Activity className="w-4 h-4" /> },
    { id: 'drc', label: 'DRC', icon: <Shield className="w-4 h-4" /> },
    { id: 'properties', label: 'Properties', icon: <Sliders className="w-4 h-4" /> },
    { id: 'console', label: 'Console', icon: <TerminalSquare className="w-4 h-4" /> }
  ];

  return (
    <div className={`bg-surface border-t border-border flex flex-col transition-all duration-300 ease-in-out shrink-0 relative z-20 ${collapsed ? 'h-[40px]' : 'h-[280px]'}`}>
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
        
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 text-text-muted hover:text-text-primary transition-colors"
        >
          {collapsed ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {!collapsed && (
        <div className="flex-1 min-h-0 bg-surface relative z-10">
          {activeTab === 'simulation' && <SimulationTab data={simulationData} isRunning={simRunning} />}
          {activeTab === 'drc' && <DRCTab results={drcResults} isRunning={drcRunning} onExplain={onExplain} onFix={onFixDRC} nodes={nodes} />}
          {activeTab === 'properties' && <PropertiesTab selectedNode={selectedNode} onUpdateNode={onUpdateNode} />}
          {activeTab === 'console' && <ConsoleTab logs={logs} />}
        </div>
      )}
    </div>
  );
}
