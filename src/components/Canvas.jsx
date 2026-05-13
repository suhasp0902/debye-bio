import { useState, useCallback, useEffect } from 'react';
import { ReactFlow, Controls, Background, MiniMap, applyNodeChanges, applyEdgeChanges, addEdge, Panel } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import BiologyNode from './nodes/BiologyNode';
import ElectronicsNode from './nodes/ElectronicsNode';
import MaterialNode from './nodes/MaterialNode';
import BiochemistryNode from './nodes/BiochemistryNode';

const nodeTypes = {
  biology: BiologyNode,
  electronics: ElectronicsNode,
  material: MaterialNode,
  biochemistry: BiochemistryNode,
};

const NODE_COLORS = {
  biology: '#22D3EE',
  electronics: '#6366F1',
  material: '#F59E0B',
  biochemistry: '#10B981',
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
      onConnectParent();
    },
    [setEdges, onConnectParent]
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

  const onEdgeClick = useCallback((_, edge) => {
    // Edge is now selected, standard delete key will remove it
    console.log('Edge selected:', edge.id);
  }, []);

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
        onPaneClick={onPaneClick}
        onEdgeClick={onEdgeClick}
        fitView
        connectionRadius={40}
        connectionMode="loose"
        deleteKeyCode="Delete"
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
                  Del → Remove node
                </div>
              </div>
            </div>
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
}
