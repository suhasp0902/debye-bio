import { useState, useCallback } from 'react';
import { ReactFlow, Controls, Background, applyNodeChanges, applyEdgeChanges, addEdge, Panel } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import BiologyNode from './nodes/BiologyNode';
import ElectronicsNode from './nodes/ElectronicsNode';
import MaterialNode from './nodes/MaterialNode';

const nodeTypes = {
  biology: BiologyNode,
  electronics: ElectronicsNode,
  material: MaterialNode,
};

export default function Canvas({ 
  nodes, 
  setNodes, 
  edges, 
  setEdges, 
  setSelectedNode, 
  onContextMenuExplain,
  onNodesChangeParent
}) {
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  const onNodesChange = useCallback(
    (changes) => {
      setNodes((nds) => applyNodeChanges(changes, nds));
      onNodesChangeParent(changes);
    },
    [setNodes, onNodesChangeParent]
  );
  
  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );
  
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, animated: true, data: { type: 'mixed' }, style: { stroke: '#818CF8', strokeWidth: 2 } }, eds)),
    [setEdges]
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

      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: `node_${Date.now()}`,
        type,
        position,
        data: { label: label, role: label },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  const onNodeClick = (_, node) => {
    setSelectedNode(node);
  };

  const onNodeContextMenu = (event, node) => {
    event.preventDefault();
    onContextMenuExplain(`Explain this component: ${node.data.label || node.type}`);
  };

  const onPaneClick = () => {
    setSelectedNode(null);
  };

  return (
    <div className="flex-1 h-full relative" ref={(ref) => { if (ref) ref.focus() }}>
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
        fitView
        connectionRadius={40}
        proOptions={{ hideAttribution: true }}
        className="debye-canvas"
      >
        <Background />
        <Controls position="bottom-left" className="!bg-surface !border-border !fill-text-primary shadow-lg" />
        
        {nodes.length === 0 && (
          <Panel position="center" className="text-center text-text-muted">
            <div className="text-4xl mb-4 opacity-50">+</div>
            <div className="font-medium">Drop components here to start designing</div>
            <div className="text-sm mt-1">or select a scenario from the top bar</div>
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
}
