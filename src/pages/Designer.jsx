import { useState, useEffect, useRef, useCallback } from 'react';
import Topbar from '../components/Topbar';
import PaletteSidebar from '../components/PaletteSidebar';
import Canvas from '../components/Canvas';
import CopilotPanel from '../components/CopilotPanel';
import BottomPanel from '../components/BottomPanel';
import PropertiesPanel from '../components/PropertiesPanel';
import Toast from '../components/Toast';
import AiPromptModal from '../components/AiPromptModal';
import { SCENARIOS } from '../data/scenarios';
import { simulateDesign, runDesignRules, generateDesignBackend } from '../lib/backend';

export default function Designer() {
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
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Panel Visibility States
  const [showProperties, setShowProperties] = useState(true);
  const [showCopilot, setShowCopilot] = useState(true);
  const [showBottomPanel, setShowBottomPanel] = useState(true);
  const [bottomPanelHeight, setBottomPanelHeight] = useState(320);
  const [copilotWidth, setCopilotWidth] = useState(320);

  const fileInputRef = useRef(null);

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

  const annotateEdgesWithSimulation = useCallback((rawEdges, data) => {
    if (!data) return rawEdges;
    return rawEdges.map(edge => {
      if (edge.data?.type === 'bio') {
        return { ...edge, data: { ...edge.data, label: data.impedance1kHz } };
      }
      if (edge.data?.type === 'mixed' && edge.data?.label) {
        return { ...edge, data: { ...edge.data, label: data.signal || edge.data.label } };
      }
      return edge;
    });
  }, []);

  useEffect(() => {
    if (scenarioId === 0) {
      setTimeout(() => setIsAiModalOpen(true), 0);
      return;
    }

    const scenario = SCENARIOS[scenarioId];
    if (scenario) {
      setTimeout(() => {
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
      }, 0);
    }
  }, [scenarioId]);

  const handleSimulate = useCallback(() => {
    if (nodes.length === 0) { addToast('Canvas is empty — add components first', 'warning'); return; }
    setActiveTab('simulation');
    setSimRunning(true);
    setSimulationData(null);
    
    setTimeout(async () => {
      const data = await simulateDesign({ nodes, edges, scenarioId });
      setSimulationData(data);
      setEdges(prev => annotateEdgesWithSimulation(prev, data));
      setSimRunning(false);
      addLog(`Mixed-Signal Simulation complete — Cole-Cole + Randles model`, 'success');
      addLog(`Tissue: ${data.tissue} | Material: ${data.material} | Electrode: ${data.electrodeArea} µm²`);
      addLog(`Impedance @ 1kHz: ${data.impedance1kHz} | Total noise: ${data.noiseTotal} µVrms | SNR: ${data.snr} dB`);
      addToast('Simulation complete');
    }, 1500);
  }, [nodes, edges, scenarioId, annotateEdgesWithSimulation]);

  const handleRunDRC = useCallback(() => {
    if (nodes.length === 0) { addToast('Canvas is empty — add components first', 'warning'); return; }
    setActiveTab('drc');
    setDrcRunning(true);
    setDrcResults(null);
    
    setNodes(nds => nds.map(n => ({ ...n, data: { ...n.data, status: undefined } })));

    setTimeout(async () => {
      const results = await runDesignRules({ nodes, edges, scenarioId });
      setDrcResults(results);
      setDrcRunning(false);
      
      if (results.errors.length > 0) {
         setNodes(nds => nds.map(n => {
            const hasError = results.errors.some(err =>
              err.affected === n.data.label ||
              err.affected.toLowerCase().includes((n.data.label || '').toLowerCase())
            );
            return hasError ? { ...n, data: { ...n.data, status: 'error' } } : n;
         }));
         addToast('DRC found issues — review below', 'warning');
         addLog(`DRC complete — ${results.errors.length} errors, ${results.warnings.length} warnings, ${results.passed} checks passed`, 'error');
      } else {
         addToast('DRC passed — all checks clear', 'success');
         addLog(`DRC complete — 0 errors, ${results.warnings.length} warnings, ${results.passed} checks passed`, 'success');
      }
    }, 800);
  }, [nodes, edges, scenarioId]);

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
    setHasUnsavedChanges(true);
    
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

  const handleNodesChangeParent = () => {};

  const handleExport = () => {
    if (nodes.length === 0) {
       addToast('Canvas is empty. Nothing to export.', 'warning');
       return;
    }
    addLog(`Generating BOM and Bio-Electrical Netlist...`);

    let bom = "DEBYE BIO-ELECTRONICS SUITE\nBILL OF MATERIALS\n=================\n";
    nodes.forEach(n => {
       bom += `- [${n.type.toUpperCase()}] ${n.data.label || n.id}\n`;
       if (n.data.material) bom += `  Material: ${n.data.material}\n`;
       if (n.data.area) bom += `  Area: ${n.data.area} µm²\n`;
    });

    let netlist = "\nBIO-ELECTRICAL NETLIST\n=====================\n";
    edges.forEach(e => {
       const source = nodes.find(n => n.id === e.source)?.data.label || e.source;
       const target = nodes.find(n => n.id === e.target)?.data.label || e.target;
       netlist += `N_${e.id}: ${source} -> ${target} (${e.data?.type || 'mixed'})\n`;
    });

    const blob = new Blob([bom + netlist], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Debye_Export_${scenarioId || 'Custom'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    addToast('BOM & Netlist exported successfully', 'success');
    addLog(`Export successful.`, 'success');
  };

  const handleAiPromptSubmit = (prompt) => {
    setIsAiModalOpen(false);
    addLog(`AI Copilot generating design for: "${prompt}"...`);
    
    setTimeout(async () => {
      try {
        const generated = await generateDesignBackend(prompt);
        setNodes(generated.nodes || []);
        setEdges(processEdges(generated.edges || []));
        setSimulationData(generated.simulation || null);
        setDrcResults(generated.drc || null);
        setScenarioId(0);
        addToast('AI design generated and validated', 'success');
        setExternalMessage(generated.message || `Generated a starting design for: "${prompt}".`);
        return;
      } catch (err) {
        addToast('AI generation unavailable - using offline template', 'warning');
        addLog(`AI generation fallback: ${err.message}`, 'warning');
      }
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
    setHasUnsavedChanges(false);
    addLog('New Blank Project created.');
  };

  const handleSaveProject = useCallback(() => {
    const projectName = scenarioId === null ? 'Untitled' : `Project_${scenarioId}`;
    const data = JSON.stringify({ schemaVersion: 2, nodes, edges, scenarioId, savedAt: new Date().toISOString() }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName}.dsn`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setHasUnsavedChanges(false);
    addToast('Project saved to device', 'success');
    addLog(`Project saved as "${projectName}.dsn"`, 'success');
  }, [nodes, edges, scenarioId]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'F9') { e.preventDefault(); handleRunDRC(); }
      if (e.key === 'F10') { e.preventDefault(); handleSimulate(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); handleSaveProject(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleRunDRC, handleSimulate, handleSaveProject]);

  const handleOpenProject = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        setNodes(parsed.nodes || []);
        setEdges(parsed.edges || []);
        setScenarioId(parsed.scenarioId || null);
        setHasUnsavedChanges(false);
        addToast('Project loaded from file', 'success');
        addLog(`Loaded project from ${file.name}`, 'success');
      } catch (err) {
        addToast('Failed to parse .dsn file', 'error');
        addLog(`Error parsing file: ${err.message}`, 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  const handleClearCanvas = () => {
    setNodes([]);
    setEdges([]);
    setSimulationData(null);
    setDrcResults(null);
    setSelectedNode(null);
    addToast('Canvas cleared', 'info');
    addLog('Canvas cleared by user.');
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-background text-text-primary overflow-hidden font-sans">
      <input 
        type="file" 
        accept=".dsn,.json" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        style={{ display: 'none' }} 
      />
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
        onClearCanvas={handleClearCanvas}
        showGrid={showGrid}
        setShowGrid={setShowGrid}
        hasUnsavedChanges={hasUnsavedChanges}
        nodeCount={nodes.length}
        showProperties={showProperties}
        setShowProperties={setShowProperties}
        showCopilot={showCopilot}
        setShowCopilot={setShowCopilot}
        showBottomPanel={showBottomPanel}
        setShowBottomPanel={setShowBottomPanel}
      />
      
      <div className="flex-1 flex min-h-0 relative">
        <PaletteSidebar />
        
        <div className="flex-1 flex flex-col relative min-w-0 border-r border-border">
            <Canvas 
              nodes={nodes}
              setNodes={setNodes}
              edges={edges}
              setEdges={setEdges}
              showGrid={showGrid}
              setSelectedNode={(node) => {
                setSelectedNode(node);
                if (node) setShowProperties(true);
              }}
              onContextMenuExplain={(msg) => {
                setExternalMessage(msg);
                setShowCopilot(true);
              }}
              onNodesChangeParent={(changes) => {
                handleNodesChangeParent(changes);
                if (changes.some(c => c.type !== 'select')) setHasUnsavedChanges(true);
              }}
              onConnect={() => setHasUnsavedChanges(true)}
            />
          
          {showBottomPanel && (
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
              onExplain={(msg) => {
                setExternalMessage(msg);
                setShowCopilot(true);
              }}
              onFixDRC={handleApplySuggestion}
              nodes={nodes}
              height={bottomPanelHeight}
              setHeight={setBottomPanelHeight}
              onClose={() => setShowBottomPanel(false)}
            />
          )}
        </div>

        {selectedNode && showProperties && (
          <PropertiesPanel 
            selectedNode={selectedNode}
            onUpdateNode={handleUpdateNode}
            onClose={() => setShowProperties(false)}
          />
        )}

        {showCopilot && (
          <CopilotPanel 
            designContext={{ scenarioId, nodes, edges, drcResults, simulationData }}
            onApplySuggestion={handleApplySuggestion}
            externalMessage={externalMessage}
            onExternalMessageProcessed={() => setExternalMessage('')}
            width={copilotWidth}
            setWidth={setCopilotWidth}
            onClose={() => setShowCopilot(false)}
          />
        )}
      </div>
    </div>
  );
}
