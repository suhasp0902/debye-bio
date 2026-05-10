import { useState, useEffect } from 'react';
import Topbar from './components/Topbar';
import PaletteSidebar from './components/PaletteSidebar';
import Canvas from './components/Canvas';
import CopilotPanel from './components/CopilotPanel';
import BottomPanel from './components/BottomPanel';
import Toast from './components/Toast';
import AiPromptModal from './components/AiPromptModal';
import { SCENARIOS } from './data/scenarios';
import { runSimulation } from './lib/simulation';
import { runDRC } from './lib/drc';

export default function App() {
  const [scenarioId, setScenarioId] = useState(null); // null means blank canvas
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  
  const [simulationData, setSimulationData] = useState(null);
  const [drcResults, setDrcResults] = useState(null);
  const [logs, setLogs] = useState([{ time: new Date().toLocaleTimeString('en-US', { hour12: false }), message: 'Debye Bio-Electronics Suite Initialized.', type: 'info' }]);
  
  const [simRunning, setSimRunning] = useState(false);
  const [drcRunning, setDrcRunning] = useState(false);
  
  const [activeTab, setActiveTab] = useState('simulation');
  const [toasts, setToasts] = useState([]);
  
  const [externalMessage, setExternalMessage] = useState('');
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [showGrid, setShowGrid] = useState(true);

  const addLog = (msg, type = 'info') => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    setLogs(prev => [...prev, { time, message: msg, type }]);
  };

  const addToast = (msg, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message: msg, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const processEdges = (rawEdges) => {
    return rawEdges.map(edge => {
      let stroke = '#3A3A4A'; 
      if (edge.data?.type === 'bio') stroke = '#22D3EE';
      else if (edge.data?.type === 'elec') stroke = '#6366F1';
      else if (edge.data?.type === 'mixed') stroke = '#818CF8'; 
      
      return {
        ...edge,
        style: { ...edge.style, stroke, strokeWidth: 2 },
        labelStyle: { fill: '#F1F5F9', fontWeight: 'bold' },
        labelBgStyle: { fill: '#1A1A24', fillOpacity: 0.8 },
      };
    });
  };

  useEffect(() => {
    if (scenarioId === 0) {
      setIsAiModalOpen(true);
      return;
    }

    const scenario = SCENARIOS[scenarioId];
    if (scenario) {
      setNodes(scenario.nodes);
      setEdges(processEdges(scenario.edges));
      setSimulationData(null);
      setDrcResults(null);
      setSelectedNode(null);
      addLog(`Opened Example Project: ${scenario.name}`);
      addLog(`Nodes: ${scenario.nodes.length} | Edges: ${scenario.edges.length}`);
      
      if (scenarioId === 1) setExternalMessage(`Explain the design context for the Continuous Glucose Monitor.`);
      else if (scenarioId === 2) setExternalMessage(`Explain the design context for the Cardiac Arrhythmia Patch.`);
      else if (scenarioId === 3) setExternalMessage(`Explain the design context for the Cancer Biomarker Chip.`);
      else if (scenarioId === 4) setExternalMessage(`Explain the design context for the Electrical Wound-Healing Patch.`);
      else if (scenarioId === 5) setExternalMessage(`Explain the design context for the Implantable Drug Delivery Device.`);
    }
  }, [scenarioId]);

  const handleSimulate = () => {
    if (nodes.length === 0) return;
    setActiveTab('simulation');
    setSimRunning(true);
    setSimulationData(null);
    
    setTimeout(() => {
      const data = runSimulation(nodes, scenarioId);
      setSimulationData(data);
      setSimRunning(false);
      addLog(`Mixed-Signal Simulation complete — 1.8ms`, 'success');
      addLog(`Impedance @ 1kHz: ${data.impedance1kHz} | Total noise: ${data.noiseTotal} µVrms | SNR: ${data.snr} dB`);
      addToast('Simulation complete');
    }, 1500);
  };

  const handleRunDRC = () => {
    if (nodes.length === 0) return;
    setActiveTab('drc');
    setDrcRunning(true);
    setDrcResults(null);
    
    setNodes(nds => nds.map(n => ({ ...n, data: { ...n.data, status: undefined } })));

    setTimeout(() => {
      const results = runDRC(nodes, scenarioId);
      setDrcResults(results);
      setDrcRunning(false);
      
      if (results.errors.length > 0) {
         setNodes(nds => nds.map(n => {
            const hasError = results.errors.some(err => n.data.role === err.affected || n.data.label === err.affected || `${n.data.label} node` === err.affected || `${n.data.role} node` === err.affected || err.affected.includes(n.data.role) || err.affected.includes(n.data.label));
            return hasError ? { ...n, data: { ...n.data, status: 'error' } } : n;
         }));
         addToast('DRC found issues — review below', 'warning');
         addLog(`DRC complete — ${results.errors.length} error, ${results.warnings.length} warnings, ${results.passed} passed`, 'error');
      } else {
         addToast('DRC passed successfully', 'success');
         addLog(`DRC complete — 0 errors`, 'success');
      }
    }, 800);
  };

  const handleUpdateNode = (id, newData) => {
    setNodes(nds => nds.map(n => {
      if (n.id === id) {
        return { ...n, data: { ...n.data, ...newData } };
      }
      return n;
    }));
    
    if (selectedNode?.id === id) {
        setSelectedNode(prev => ({ ...prev, data: { ...prev.data, ...newData } }));
    }
    
    addToast('Node properties updated', 'success');
    
    setTimeout(() => {
        if (simulationData) handleSimulate();
        if (drcResults) handleRunDRC();
    }, 100);
  };

  const handleApplySuggestion = (sugId) => {
    if (sugId === 'BIO-001') {
      const electrode = nodes.find(n => n.data?.role === 'Electrode Contact' || n.data?.label.includes('Electrode'));
      if (electrode) {
        handleUpdateNode(electrode.id, { area: 2000, status: 'valid' });
        addToast('Fix applied: Area increased to 2000 µm²', 'success');
        addLog('Applied Copilot Fix for BIO-001.', 'success');
      }
    }
  };

  const handleNodesChangeParent = (changes) => {};

  const handleExport = () => {
    if (nodes.length === 0) {
       addToast('Canvas is empty. Nothing to export.', 'warning');
       return;
    }
    addLog(`Exporting GDSII and Gerber files for fabrication...`);
    addToast('Fabrication files and regulatory docs exported to /downloads', 'success');
    addLog(`Export successful.`, 'success');
  };

  const handleAiPromptSubmit = (prompt) => {
    setIsAiModalOpen(false);
    addLog(`AI Copilot generating design for: "${prompt}"...`);
    
    setTimeout(() => {
      const generatedNodes = [
        { id: 'bio-gen', type: 'biology', position: { x: 50, y: 150 }, data: { label: 'Gastric Mucosa', type: 'stomach', conductivity: 0.6, permittivity: 2200 } },
        { id: 'elec-gen1', type: 'electronics', position: { x: 300, y: 150 }, data: { label: 'Pacing Electrode', material: 'Platinum-Iridium', area: 2500 } },
        { id: 'mat-gen', type: 'material', position: { x: 300, y: 350 }, data: { label: 'Titanium Enclosure', iso: true, chronic: true } },
        { id: 'elec-gen2', type: 'electronics', position: { x: 550, y: 150 }, data: { label: 'Stimulator / IPG', current: '2 mA' } }
      ];
      const generatedEdges = [
        { id: 'egen1', source: 'elec-gen1', target: 'bio-gen', animated: true, data: { label: '350 Ω', type: 'bio' } },
        { id: 'egen2', source: 'elec-gen2', target: 'elec-gen1', animated: true, data: { label: 'Pulse', type: 'mixed' } },
        { id: 'egen3', source: 'mat-gen', target: 'elec-gen1', type: 'default', animated: true, data: { type: 'mixed' } }
      ];
      
      setNodes(generatedNodes);
      setEdges(processEdges(generatedEdges));
      setSimulationData(null);
      setDrcResults(null);
      setScenarioId(0);
      
      addToast('AI Design generated successfully', 'success');
      setExternalMessage(`I have generated a starting design based on your request: "${prompt}". I've included a Platinum-Iridium pacing electrode and a Titanium enclosure suitable for 5-year chronic implantation in the gastric mucosa. Would you like me to run a simulation to verify the pacing thresholds?`);
    }, 1500);
  };

  const handleNewProject = () => {
    setScenarioId(null);
    setNodes([]);
    setEdges([]);
    setSimulationData(null);
    setDrcResults(null);
    setSelectedNode(null);
    addLog('New Blank Project created.');
  };

  const handleSaveProject = () => {
    const data = JSON.stringify({ nodes, edges, scenarioId });
    localStorage.setItem('debye_project', data);
    addToast('Project saved successfully', 'success');
    addLog('Project saved to local storage.', 'success');
  };

  const handleOpenProject = () => {
    const data = localStorage.getItem('debye_project');
    if (data) {
      const parsed = JSON.parse(data);
      setNodes(parsed.nodes || []);
      setEdges(parsed.edges || []);
      setScenarioId(parsed.scenarioId || null);
      addToast('Project loaded', 'success');
      addLog('Project loaded from local storage.', 'success');
    } else {
      addToast('No saved project found', 'warning');
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-background text-text-primary overflow-hidden font-sans">
      <Toast toasts={toasts} removeToast={() => {}} />
      <AiPromptModal 
        isOpen={isAiModalOpen} 
        onClose={() => { setIsAiModalOpen(false); if(scenarioId === 0) setScenarioId(null); }} 
        onSubmit={handleAiPromptSubmit} 
      />
      
      <Topbar 
        scenario={scenarioId} 
        setScenario={setScenarioId} 
        onSimulate={handleSimulate}
        onRunDRC={handleRunDRC}
        onExport={handleExport}
        onNewProject={handleNewProject}
        onSaveProject={handleSaveProject}
        onOpenProject={handleOpenProject}
        showGrid={showGrid}
        setShowGrid={setShowGrid}
      />
      
      <div className="flex-1 flex min-h-0 relative">
        <PaletteSidebar />
        
        <div className="flex-1 flex flex-col relative min-w-0">
            <Canvas 
              scenarioId={scenarioId}
              nodes={nodes}
              setNodes={setNodes}
              edges={edges}
              setEdges={setEdges}
              showGrid={showGrid}
              setSelectedNode={(node) => {
                setSelectedNode(node);
                if (node) setActiveTab('properties');
              }}
              onContextMenuExplain={(msg) => setExternalMessage(msg)}
              onNodesChangeParent={handleNodesChangeParent}
            />
          
          <BottomPanel 
            simulationData={simulationData}
            drcResults={drcResults}
            logs={logs}
            selectedNode={selectedNode}
            onUpdateNode={handleUpdateNode}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            simRunning={simRunning}
            drcRunning={drcRunning}
            onExplain={(msg) => setExternalMessage(msg)}
            onFixDRC={handleApplySuggestion}
            nodes={nodes}
          />
        </div>

        <CopilotPanel 
          designContext={{ scenarioId, nodes, edges, drcResults, simulationData }}
          onApplySuggestion={handleApplySuggestion}
          externalMessage={externalMessage}
          onExternalMessageProcessed={() => setExternalMessage('')}
        />
      </div>
    </div>
  );
}
