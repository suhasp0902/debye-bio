import { useState, useCallback, useEffect, useMemo } from 'react';
import { ReactFlow, Controls, Background, MiniMap, applyNodeChanges, applyEdgeChanges, addEdge, Panel, getBezierPath, BaseEdge } from '@xyflow/react';
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

// Custom edge with X button for disconnect
function DeletableEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style, markerEnd, selected, data }) {
  const [edgePath, labelX, labelY] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });
  
  const edgeColor = (() => {
    if (data?.type === 'bio') return '#22D3EE';
    if (data?.type === 'elec') return '#6366F1';
    return '#818CF8';
  })();

  return (
    <>
      <BaseEdge 
        path={edgePath} 
        markerEnd={markerEnd} 
        style={{ 
          ...style, 
          stroke: selected ? '#f43f5e' : edgeColor, 
          strokeWidth: selected ? 3 : 2,
          filter: selected ? 'drop-shadow(0 0 4px rgba(244,63,94,0.5))' : 'none',
        }} 
      />
      {selected && (
        <foreignObject
          width={24}
          height={24}
          x={labelX - 12}
          y={labelY - 12}
          requiredExtensions="http://www.w3.org/1999/xhtml"
        >
          <button
            className="w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg border-2 border-white cursor-pointer transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              window.dispatchEvent(new CustomEvent('debye-delete-edge', { detail: { id } }));
            }}
            title="Disconnect"
          >
            ✕
          </button>
        </foreignObject>
      )}
      {data?.label && (
        <foreignObject
          width={80}
          height={20}
          x={labelX - 40}
          y={labelY - 28}
          requiredExtensions="http://www.w3.org/1999/xhtml"
        >
          <div className="text-[10px] text-center text-text-muted font-bold bg-background/80 rounded px-1">
            {data.label}
          </div>
        </foreignObject>
      )}
    </>
  );
}

const edgeTypes = { default: DeletableEdge };

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

  // Handle custom edge deletion event (from the X button on edge)
  useEffect(() => {
    const handleDeleteEdge = (e) => {
      const { id } = e.detail;
      setEdges((eds) => eds.filter((edge) => edge.id !== id));
    };

    window.addEventListener('debye-delete-edge', handleDeleteEdge);
    return () => window.removeEventListener('debye-delete-edge', handleDeleteEdge);
  }, [setEdges]);

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
        type: 'default',
        animated: true, 
        data: { type: 'mixed' }, 
      }, eds));
      onConnectParent();
    },
    [setEdges, onConnectParent]
  );

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

  const onPaneClick = () => setSelectedNode(null);

  // Ensure all edges use our custom type
  const processedEdges = useMemo(() => {
    return edges.map(e => ({ ...e, type: 'default' }));
  }, [edges]);

  return (
    <div className="flex-1 h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={processedEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={setReactFlowInstance}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeClick={onNodeClick}
        onNodeContextMenu={onNodeContextMenu}
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
                  Click edge → ✕ Disconnect
                </div>
              </div>
            </div>
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
}
