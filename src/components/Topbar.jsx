import {
  Download,
  File,
  FolderOpen,
  Grid,
  Maximize,
  MessageSquare,
  Moon,
  PanelRight,
  Play,
  Save,
  Settings,
  Shield,
  Sparkles,
  Sun,
  TerminalSquare,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { useReactFlow } from '@xyflow/react';
import { Link } from 'react-router-dom';
import BrandLogo from './BrandLogo';

function ToggleButton({ active, children, onClick, title }) {
  return (
    <button
      className={`designer-icon-button ${active ? 'is-active' : ''}`}
      onClick={onClick}
      title={title}
      type="button"
    >
      {children}
    </button>
  );
}

export default function Topbar({
  scenario,
  setScenario,
  onSimulate,
  onRunDRC,
  onExport,
  onNewProject,
  onSaveProject,
  onOpenProject,
  onClearCanvas,
  showGrid,
  setShowGrid,
  hasUnsavedChanges,
  nodeCount,
  showProperties,
  setShowProperties,
  showCopilot,
  setShowCopilot,
  showBottomPanel,
  setShowBottomPanel,
  darkMode,
  setDarkMode,
}) {
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  return (
    <div className="designer-topbar flex flex-col shrink-0 border-b border-border z-30 relative">
      <div className="designer-menubar">
        <div className="designer-menu-left">
          <Link to="/" className="designer-brand" aria-label="Debye home">
            <BrandLogo idPrefix="tb" svgClass="w-4 h-4 shrink-0" />
          </Link>

          <div className="designer-menu-group">
            <button className="designer-menu-trigger" type="button">
              File
            </button>
            <div className="designer-dropdown">
              <button onClick={onNewProject} type="button">
                <File className="w-4 h-4" /> New Blank Project
              </button>
              <button onClick={() => setScenario(0)} type="button">
                <Sparkles className="w-4 h-4" /> AI Copilot Design...
              </button>
              <div className="designer-menu-rule" />
              <button onClick={onOpenProject} type="button">
                <FolderOpen className="w-4 h-4" /> Open Project...
              </button>
              <button onClick={onSaveProject} type="button">
                <Save className="w-4 h-4" /> Save Project...
              </button>
              <div className="designer-menu-rule" />
              <div className="designer-menu-label">Open Example</div>
              <button onClick={() => setScenario(1)} type="button">
                Continuous Glucose Monitor
              </button>
              <button onClick={() => setScenario(2)} type="button">
                Cardiac Arrhythmia Patch
              </button>
              <button onClick={() => setScenario(3)} type="button">
                Cancer Biomarker Chip
              </button>
              <button onClick={() => setScenario(4)} type="button">
                Electrical Wound Patch
              </button>
              <button onClick={() => setScenario(5)} type="button">
                Implantable Drug Delivery
              </button>
              <div className="designer-menu-rule" />
              <button onClick={onExport} type="button">
                <Download className="w-4 h-4" /> Export BOM & Netlist...
              </button>
            </div>
          </div>

          <div className="designer-menu-group">
            <button className="designer-menu-trigger" type="button">
              Edit
            </button>
            <div className="designer-dropdown">
              <button className="is-disabled" type="button">
                Undo (Ctrl+Z)
              </button>
              <button className="is-disabled" type="button">
                Redo (Ctrl+Y)
              </button>
              <div className="designer-menu-rule" />
              <button onClick={onClearCanvas} type="button">
                Clear Canvas
              </button>
            </div>
          </div>

          <div className="designer-menu-group">
            <button className="designer-menu-trigger" type="button">
              View
            </button>
            <div className="designer-dropdown">
              <button onClick={() => setShowGrid(!showGrid)} type="button">
                <span>Show Grid</span>
                <strong>{showGrid ? 'On' : 'Off'}</strong>
              </button>
              <button onClick={() => setShowProperties(!showProperties)} type="button">
                <span>Properties Inspector</span>
                <strong>{showProperties ? 'On' : 'Off'}</strong>
              </button>
              <button onClick={() => setShowCopilot(!showCopilot)} type="button">
                <span>AI Copilot</span>
                <strong>{showCopilot ? 'On' : 'Off'}</strong>
              </button>
              <button onClick={() => setShowBottomPanel(!showBottomPanel)} type="button">
                <span>Bottom Panel</span>
                <strong>{showBottomPanel ? 'On' : 'Off'}</strong>
              </button>
              <div className="designer-menu-rule" />
              <button onClick={() => zoomIn()} type="button">
                Zoom In
              </button>
              <button onClick={() => zoomOut()} type="button">
                Zoom Out
              </button>
              <button onClick={() => fitView({ duration: 800 })} type="button">
                Fit View to Contents
              </button>
            </div>
          </div>

          <div className="designer-menu-group">
            <button className="designer-menu-trigger" type="button">
              Tools
            </button>
            <div className="designer-dropdown wide">
              <button onClick={onRunDRC} type="button">
                <Shield className="w-4 h-4" /> Run Design Rule Check (F9)
              </button>
              <button onClick={onSimulate} type="button">
                <Play className="w-4 h-4" /> Run Mixed-Signal Simulation (F10)
              </button>
            </div>
          </div>
        </div>

        <div className="designer-project-pill">
          <span>{scenario === null ? 'Untitled.dsn' : `Project_0${scenario}.dsn`}</span>
          {hasUnsavedChanges && <i title="Unsaved changes" />}
        </div>

        <div className="designer-status">
          <span className="designer-live-dot" />
          <span>Designer ready</span>
          <span>{nodeCount} objects</span>
          <span>V1.2.0</span>
        </div>
      </div>

      <div className="designer-toolbar">
        <button className="designer-icon-button" onClick={onNewProject} title="New Blank Project" type="button">
          <File className="w-4 h-4" />
        </button>
        <button className="designer-icon-button" onClick={onOpenProject} title="Open Project" type="button">
          <FolderOpen className="w-4 h-4" />
        </button>
        <button className="designer-icon-button" onClick={onSaveProject} title="Save Project" type="button">
          <Save className="w-4 h-4" />
        </button>

        <div className="designer-toolbar-rule" />

        <button className="designer-action-button ghost" onClick={onRunDRC} title="Run Design Rule Check (F9)" type="button">
          <Shield className="w-3.5 h-3.5" />
          <span>DRC</span>
        </button>

        <button className="designer-action-button" onClick={onSimulate} title="Run Mixed-Signal Simulation (F10)" type="button">
          <Play className="w-3.5 h-3.5" />
          <span>Simulate</span>
        </button>

        <div className="designer-toolbar-rule" />

        <ToggleButton active={showGrid} onClick={() => setShowGrid(!showGrid)} title="Show/Hide Grid">
          <Grid className="w-4 h-4" />
        </ToggleButton>
        <ToggleButton
          active={showProperties}
          onClick={() => setShowProperties(!showProperties)}
          title="Toggle Properties Panel"
        >
          <PanelRight className="w-4 h-4" />
        </ToggleButton>
        <ToggleButton active={showCopilot} onClick={() => setShowCopilot(!showCopilot)} title="Toggle AI Copilot">
          <MessageSquare className="w-4 h-4" />
        </ToggleButton>
        <ToggleButton
          active={showBottomPanel}
          onClick={() => setShowBottomPanel(!showBottomPanel)}
          title="Toggle Bottom Panel"
        >
          <TerminalSquare className="w-4 h-4" />
        </ToggleButton>

        <div className="designer-toolbar-rule" />

        <button className="designer-icon-button" onClick={() => zoomIn()} title="Zoom In" type="button">
          <ZoomIn className="w-4 h-4" />
        </button>
        <button className="designer-icon-button" onClick={() => zoomOut()} title="Zoom Out" type="button">
          <ZoomOut className="w-4 h-4" />
        </button>
        <button className="designer-icon-button" onClick={() => fitView({ duration: 800 })} title="Fit View" type="button">
          <Maximize className="w-4 h-4" />
        </button>

        <div className="designer-toolbar-rule" />
        
        <ToggleButton active={darkMode} onClick={() => setDarkMode(!darkMode)} title="Toggle Dark Mode">
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </ToggleButton>

        <div className="designer-toolbar-rule" />

        <button className="designer-icon-button" title="Settings" type="button">
          <Settings className="w-4 h-4" />
        </button>

      </div>
    </div>
  );
}
