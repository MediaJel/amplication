import "reactflow/dist/style.css";
import "./ModelOrganizer.scss";

import {
  Button,
  CircularProgress,
  Dialog,
  Icon,
  SearchField,
  Snackbar,
} from "@amplication/ui/design-system";
import { useCallback, useEffect, useState } from "react";
import {
  Background,
  ConnectionMode,
  ControlButton,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowInstance,
} from "reactflow";
import * as models from "../../models";
import ModelOrganizerToolbar from "./ModelOrganizerToolbar";
import relationEdge from "./edges/relationEdge";
import RelationMarkets from "./edges/relationMarkets";
import simpleRelationEdge from "./edges/simpleRelationEdge";
import { findGroupByPosition } from "./helpers";
import useModelOrganization from "./hooks/useModelOrganizer";
import { applyAutoLayout } from "./layout";
import modelGroupNode from "./nodes/modelGroupNode";
import ModelNode from "./nodes/modelNode";
import ModelSimpleNode from "./nodes/modelSimpleNode";
import { NODE_TYPE_MODEL, NODE_TYPE_MODEL_GROUP, Node } from "./types";
import NewTempResource from "./NewTempResource";
import ModelsGroupsList from "./ModelsGroupsList";

export const CLASS_NAME = "model-organizer";

const nodeTypes = {
  model: ModelNode,
  modelGroup: modelGroupNode,
};

const simpleNodeTypes = {
  model: ModelSimpleNode,
  modelGroup: modelGroupNode,
};

const edgeTypes = {
  relation: relationEdge,
  relationSimple: simpleRelationEdge,
};

type Props = {
  loadingResources?: boolean;
  errorMessage?: string;
};

export default function ModelOrganizer({
  loadingResources,
  errorMessage,
}: Props) {
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance>(null);

  const [newService, setNewService] = useState<boolean>(false);
  const handleNewServiceClick = useCallback(() => {
    setNewService(!newService);
  }, [newService, setNewService]);

  const {
    nodes,
    currentResourcesData,
    setNodes,
    edges,
    onEdgesChange,
    showRelationDetails,
    toggleShowRelationDetails,
    resetToOriginalState,
    changes,
    saveChanges,
    moveNodeToParent,
    createNewTempService,
    modelGroupFilterChanged,
    searchPhraseChanged,
  } = useModelOrganization();

  const [currentDropTarget, setCurrentDropTarget] = useState<Node>(null);

  const [readOnly, setReadOnly] = useState<boolean>(true);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (changes?.movedEntities?.length > 0) {
      setReadOnly(false);
    }
  }, [changes, setReadOnly]);

  const onRedesignClick = useCallback(
    (resource: models.Resource) => {
      setNodes((nodes) => {
        nodes.forEach((node) => {
          if (node.data.originalParentNode === resource.id) {
            node.draggable = true;
          }
          if (node.id === resource.id) {
            node.selected = true;
          }
        });

        return [...nodes];
      });

      setReadOnly(false);
    },
    [setReadOnly, nodes, setNodes]
  );

  const onCancelChangesClick = useCallback(() => {
    resetToOriginalState();

    setReadOnly(true);
  }, [setReadOnly]);

  const onApplyPlanClick = useCallback(() => {
    saveChanges();
    setReadOnly(true);
    setHasChanges(false);
  }, [saveChanges, setReadOnly]);

  const onInit = useCallback(
    (instance: ReactFlowInstance) => {
      setReactFlowInstance(instance);
    },
    [setReactFlowInstance]
  );

  const handleServiceCreated = useCallback(
    (newResource: models.Resource) => {
      setNewService(false);
      createNewTempService(newResource);
    },
    [setNewService, nodes, setNodes]
  );

  const onNodeDrag = useCallback(
    async (
      event: React.MouseEvent,
      draggedNode: Node,
      draggedNodes: Node[]
    ) => {
      let targetGroup;

      if (draggedNode.type === NODE_TYPE_MODEL) {
        const dropPosition = reactFlowInstance.screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });
        targetGroup = findGroupByPosition(nodes, dropPosition);
        if (targetGroup?.id !== draggedNode.parentNode) {
          setCurrentDropTarget(targetGroup);
        } else {
          setCurrentDropTarget(null);
          targetGroup = null;
        }
      }

      setNodes((nodes) => {
        nodes.forEach((node) => {
          if (node.id === draggedNode.id) {
            node.position = draggedNode.position;
          }
          node.data.isCurrentDropTarget = node.id === targetGroup?.id;
        });

        return [...nodes];
      });
    },
    [setNodes, reactFlowInstance, nodes]
  );

  const onNodeDragStop = useCallback(
    async (
      event: React.MouseEvent,
      draggedNode: Node,
      draggedNodes: Node[]
    ) => {
      if (draggedNode.type === NODE_TYPE_MODEL_GROUP) {
        return;
      }

      const node = nodes.find((node) => node.id === draggedNode.id);

      if (currentDropTarget && currentDropTarget.id !== node.parentNode) {
        const dropPosition = reactFlowInstance.screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });

        node.position = {
          x: dropPosition.x - currentDropTarget.position.x,
          y: dropPosition.y - currentDropTarget.position.y,
        };

        moveNodeToParent(node, currentDropTarget);
      }
      if (currentDropTarget) {
        currentDropTarget.data.isCurrentDropTarget = false;
      }
      setCurrentDropTarget(null);
    },
    [setNodes, edges, nodes, reactFlowInstance, showRelationDetails, changes]
  );

  const onToggleShowRelationDetails = useCallback(async () => {
    await toggleShowRelationDetails();

    reactFlowInstance.fitView();
  }, [setNodes, showRelationDetails, nodes, edges]);

  const onArrangeNodes = useCallback(async () => {
    const updatedNodes = await applyAutoLayout(
      nodes,
      edges,
      showRelationDetails
    );
    setNodes(updatedNodes);
    reactFlowInstance.fitView();
  }, [setNodes, showRelationDetails, nodes, edges]);

  return (
    <div className={CLASS_NAME}>
      {loadingResources ? (
        <CircularProgress centerToParent />
      ) : (
        <>
          <ModelOrganizerToolbar
            readOnly={readOnly}
            hasChanges={changes?.movedEntities?.length > 0}
            resources={currentResourcesData}
            onApplyPlan={onApplyPlanClick}
            onRedesign={onRedesignClick}
            onCancelChanges={onCancelChangesClick}
          />
          <ModelsGroupsList
            modelGroups={nodes?.filter((model) => model.type === "modelGroup")}
            handleModelGroupFilterChanged={modelGroupFilterChanged}
          ></ModelsGroupsList>
          <SearchField
            label="search"
            placeholder="search"
            onChange={searchPhraseChanged}
          />
          <Button onClick={handleNewServiceClick}>+</Button>
          <Dialog
            isOpen={newService}
            onDismiss={handleNewServiceClick}
            title="New Service"
          >
            <NewTempResource onSuccess={handleServiceCreated}></NewTempResource>
          </Dialog>

          <div className={"reactflow-wrapper"}>
            <ReactFlow
              onInit={onInit}
              nodes={nodes}
              edges={edges}
              fitView
              nodeTypes={showRelationDetails ? nodeTypes : simpleNodeTypes}
              edgeTypes={edgeTypes}
              onNodeDrag={onNodeDrag}
              onNodeDragStop={onNodeDragStop}
              onEdgesChange={onEdgesChange}
              connectionMode={ConnectionMode.Loose}
              proOptions={{ hideAttribution: true }}
              minZoom={0.1}
              nodesDraggable={!readOnly}
            >
              <Background color="grey" />
              <Controls>
                <ControlButton onClick={onToggleShowRelationDetails}>
                  <Icon icon="list" />
                </ControlButton>
                <ControlButton onClick={onArrangeNodes}>
                  <Icon icon="layers" />
                </ControlButton>
              </Controls>
              <MiniMap pannable={true} zoomable={true} />
            </ReactFlow>
            <RelationMarkets />
          </div>
          <Snackbar open={Boolean(errorMessage)} message={errorMessage} />
        </>
      )}
    </div>
  );
}