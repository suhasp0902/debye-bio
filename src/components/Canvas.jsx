import { useState, useCallback, useEffect, useRef } from 'react';
import { ReactFlow, Controls, Background, MiniMap, applyNodeChanges, applyEdgeChanges, addEdge, Panel } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import BiologyNode from './nodes/BiologyNode';
import ElectronicsNode from './nodes/ElectronicsNode';
import MaterialNode from './nodes/MaterialNode';
import BiochemistryNode from './nodes/BiochemistryNode';
import ElectrodeNode from './nodes/ElectrodeNode';
import NeuroNode from './nodes/NeuroNode';
import FluidicsNode from './nodes/FluidicsNode';

const nodeTypes = {
  biology: BiologyNode,
  electronics: ElectronicsNode,
  material: MaterialNode,
  biochemistry: BiochemistryNode,
  electrode: ElectrodeNode,
  neuromodulation: NeuroNode,
  microfluidics: FluidicsNode,
};

const NODE_COLORS = {
  biology: '#22D3EE',
  electronics: '#A78BFA',
  material: '#E879F9',
  biochemistry: '#10B981',
  electrode: '#6366F1',
  neuromodulation: '#FB923C',
  microfluidics: '#3B82F6',
};

export default function Canvas({ 
  nodes, 
  setNodes, 
  edges, 
  setEdges, 
  showGrid,
  setSelectedNode, 
  onContextMenuExplain,
  onNodesChangeParent,
  onConnect: onConnectParent
}) {
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const contextMenuRef = useRef(null);

  // Close context menu on outside click
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // Handle custom node deletion event
  useEffect(() => {
    const handleDeleteNode = (e) => {
      const { id } = e.detail;
      setNodes((nds) => nds.filter((node) => node.id !== id));
      setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id));
    };

    window.addEventListener('debye-delete-node', handleDeleteNode);
    return () => window.removeEventListener('debye-delete-node', handleDeleteNode);
  }, [setNodes, setEdges]);

  const onNodesChange = useCallback(
    (changes) => {
      setNodes((nds) => applyNodeChanges(changes, nds));
      onNodesChangeParent(changes);
    },
    [setNodes, onNodesChangeParent]
  );
  
  const onEdgesChange = useCallback(
    (changes) => {
      setEdges((eds) => applyEdgeChanges(changes, eds));
    },
    [setEdges]
  );
  
  const onConnect = useCallback(
    (params) => {
      setEdges((eds) => addEdge({ 
        ...params, 
        animated: true, 
        data: { type: 'mixed' }, 
        style: { stroke: '#818CF8', strokeWidth: 2 } 
      }, eds));
      onConnectParent();
    },
    [setEdges, onConnectParent]
  );

  // Right-click on edge shows disconnect menu
  const onEdgeContextMenu = useCallback((event, edge) => {
    event.preventDefault();
    event.stopPropagation();
    
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);
    const sourceLabel = sourceNode?.data?.label || edge.source;
    const targetLabel = targetNode?.data?.label || edge.target;

    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      edgeId: edge.id,
      sourceLabel,
      targetLabel,
    });
  }, [nodes]);

  const handleDisconnect = useCallback(() => {
    if (contextMenu?.edgeId) {
      setEdges((eds) => eds.filter((e) => e.id !== contextMenu.edgeId));
      onConnectParent();
    }
    setContextMenu(null);
  }, [contextMenu, setEdges, onConnectParent]);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      const label = event.dataTransfer.getData('application/label');
      const itemId = event.dataTransfer.getData('application/item_id');

      if (typeof type === 'undefined' || !type) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: `node_${Date.now()}`,
        type,
        position,
        data: { label, role: label, item_id: itemId },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  const onNodeClick = (_, node) => setSelectedNode(node);

  const onNodeContextMenu = (event, node) => {
    event.preventDefault();
    onContextMenuExplain(`Explain this component: ${node.data.label || node.type}`);
  };

  const onPaneClick = () => {
    setSelectedNode(null);
    setContextMenu(null);
  };

  return (
    <div className="flex-1 h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={setReactFlowInstance}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClick}
        onNodeContextMenu={onNodeContextMenu}
        onEdgeContextMenu={onEdgeContextMenu}
        onPaneClick={onPaneClick}
        fitView
        connectionRadius={40}
        connectionMode="loose"
        deleteKeyCode={['Delete', 'Backspace']}
        proOptions={{ hideAttribution: true }}
        className="debye-canvas"
      >
        {showGrid && <Background color="#2a2a3a" gap={24} size={1} />}
        <Controls position="bottom-left" />
        <MiniMap 
          position="bottom-right"
          nodeColor={(node) => NODE_COLORS[node.type] || '#4B5563'}
          nodeStrokeWidth={2}
          maskColor="rgba(10, 10, 18, 0.8)"
          style={{
            backgroundColor: '#13131f',
            border: '1px solid #2a2a3a',
            borderRadius: '6px',
          }}
        />

        {nodes.length === 0 && (
          <Panel position="center">
            <div className="text-center pointer-events-none select-none">
              <div className="text-7xl mb-6 opacity-20">⬡</div>
              <div className="text-text-primary font-semibold text-base mb-1">
                Canvas is empty
              </div>
              <div className="text-text-muted text-sm mb-6">
                Drag a component from the left palette to begin
              </div>
              <div className="flex gap-3 justify-center pointer-events-auto">
                <div className="text-xs text-text-muted bg-surface-raised border border-border rounded px-3 py-1.5">
                  F10 → Simulate
                </div>
                <div className="text-xs text-text-muted bg-surface-raised border border-border rounded px-3 py-1.5">
                  F9 → Run DRC
                </div>
                <div className="text-xs text-text-muted bg-surface-raised border border-border rounded px-3 py-1.5">
                  Right-click edge → Disconnect
                </div>
              </div>
            </div>
          </Panel>
        )}
      </ReactFlow>

      {/* Edge Context Menu (Disconnect) */}
      {contextMenu && (
        <div 
          ref={contextMenuRef}
          className="fixed z-[9999] bg-surface-raised border border-border rounded-lg shadow-2xl py-1 min-w-[220px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-3 py-1.5 text-[10px] text-text-muted font-bold uppercase tracking-wider border-b border-border">
            Connection
          </div>
          <div className="px-3 py-1.5 text-xs text-text-secondary">
            {contextMenu.sourceLabel} → {contextMenu.targetLabel}
          </div>
          <button 
            onClick={handleDisconnect}
            className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
          >
            <span>✕</span> Disconnect
          </button>
        </div>
      )}
    </div>
  );
}
