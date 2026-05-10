import { Play, Shield, Download, File, FolderOpen, Save, Settings, Grid, ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import { useState } from 'react';
import { useReactFlow } from '@xyflow/react';

export default function Topbar({ scenario, setScenario, onSimulate, onRunDRC, onExport, onNewProject, onSaveProject, onOpenProject, showGrid, setShowGrid }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  
  return (
    <div className="flex flex-col shrink-0 border-b border-border z-30 relative">
      {/* Menu Bar (Altium/Cadence style) */}
      <div className="h-[28px] bg-[#1a1a24] flex items-center px-2 text-[13px]">
        <div className="flex items-center gap-2 pr-4 border-r border-border/50">
          <span className="text-accent-primary font-bold tracking-wider">DEBYE</span>
        </div>
        
        <div className="flex px-2 space-x-1">
          {/* File Menu */}
          <div className="relative group">
            <button className="px-3 py-1 text-text-secondary hover:bg-surface-raised hover:text-text-primary rounded cursor-default">File</button>
            <div className="absolute left-0 top-full mt-0 w-56 bg-surface-raised border border-border rounded-md shadow-lg hidden group-hover:block py-1 z-50">
              <button onClick={onNewProject} className="w-full text-left px-4 py-2 text-text-primary hover:bg-accent-primary hover:text-white flex items-center gap-2">
                <File className="w-4 h-4" /> New Blank Project
              </button>
              <button onClick={() => setScenario(0)} className="w-full text-left px-4 py-2 text-text-primary hover:bg-accent-primary hover:text-white flex items-center gap-2">
                <span className="text-accent-secondary">✨</span> AI Copilot Design...
              </button>
              <div className="h-px bg-border my-1"></div>
              <button onClick={onOpenProject} className="w-full text-left px-4 py-2 text-text-primary hover:bg-surface flex items-center gap-2">
                <FolderOpen className="w-4 h-4" /> Open Project (Device)...
              </button>
              <button onClick={onSaveProject} className="w-full text-left px-4 py-2 text-text-primary hover:bg-surface flex items-center gap-2">
                <Save className="w-4 h-4" /> Save Project (Device)...
              </button>
              <div className="h-px bg-border my-1"></div>
              <div className="px-4 py-1 text-text-muted text-[11px] font-bold uppercase tracking-wider">Open Example</div>
              <button onClick={() => setScenario(1)} className="w-full text-left px-4 py-2 text-text-primary hover:bg-surface">Continuous Glucose Monitor</button>
              <button onClick={() => setScenario(2)} className="w-full text-left px-4 py-2 text-text-primary hover:bg-surface">Cardiac Arrhythmia Patch</button>
              <button onClick={() => setScenario(3)} className="w-full text-left px-4 py-2 text-text-primary hover:bg-surface">Cancer Biomarker Chip</button>
              <button onClick={() => setScenario(4)} className="w-full text-left px-4 py-2 text-text-primary hover:bg-surface">Electrical Wound Patch</button>
              <button onClick={() => setScenario(5)} className="w-full text-left px-4 py-2 text-text-primary hover:bg-surface">Implantable Drug Delivery</button>
              <div className="h-px bg-border my-1"></div>
              <button onClick={onExport} className="w-full text-left px-4 py-2 text-text-primary hover:bg-surface flex items-center gap-2">
                <Download className="w-4 h-4" /> Export Fabrication Files...
              </button>
            </div>
          </div>
          
          {/* Edit Menu */}
          <div className="relative group">
            <button className="px-3 py-1 text-text-secondary hover:bg-surface-raised hover:text-text-primary rounded cursor-default">Edit</button>
            <div className="absolute left-0 top-full mt-0 w-48 bg-surface-raised border border-border rounded-md shadow-lg hidden group-hover:block py-1 z-50">
              <button className="w-full text-left px-4 py-2 text-text-secondary hover:bg-surface opacity-50 cursor-not-allowed">Undo (Ctrl+Z)</button>
              <button className="w-full text-left px-4 py-2 text-text-secondary hover:bg-surface opacity-50 cursor-not-allowed">Redo (Ctrl+Y)</button>
              <div className="h-px bg-border my-1"></div>
              <button onClick={onClearCanvas} className="w-full text-left px-4 py-2 text-text-primary hover:bg-accent-error hover:text-white">Clear Canvas</button>
            </div>
          </div>

          {/* View Menu */}
          <div className="relative group">
            <button className="px-3 py-1 text-text-secondary hover:bg-surface-raised hover:text-text-primary rounded cursor-default">View</button>
            <div className="absolute left-0 top-full mt-0 w-48 bg-surface-raised border border-border rounded-md shadow-lg hidden group-hover:block py-1 z-50">
              <button onClick={() => setShowGrid(!showGrid)} className="w-full text-left px-4 py-2 text-text-primary hover:bg-surface flex items-center justify-between">
                <span>Show Grid</span>
                {showGrid && <span className="text-accent-primary">✓</span>}
              </button>
              <div className="h-px bg-border my-1"></div>
              <button onClick={() => zoomIn()} className="w-full text-left px-4 py-2 text-text-primary hover:bg-surface">Zoom In</button>
              <button onClick={() => zoomOut()} className="w-full text-left px-4 py-2 text-text-primary hover:bg-surface">Zoom Out</button>
              <button onClick={() => fitView({ duration: 800 })} className="w-full text-left px-4 py-2 text-text-primary hover:bg-surface">Fit View to Contents</button>
            </div>
          </div>

          {/* Place Menu */}
          <div className="relative group">
            <button className="px-3 py-1 text-text-secondary hover:bg-surface-raised hover:text-text-primary rounded cursor-default">Place</button>
            <div className="absolute left-0 top-full mt-0 w-48 bg-surface-raised border border-border rounded-md shadow-lg hidden group-hover:block py-1 z-50">
              <div className="px-4 py-2 text-text-muted text-xs italic">Drag items from the left palette to place them on the canvas.</div>
            </div>
          </div>

          {/* Tools Menu */}
          <div className="relative group">
            <button className="px-3 py-1 text-text-secondary hover:bg-surface-raised hover:text-text-primary rounded cursor-default">Tools</button>
            <div className="absolute left-0 top-full mt-0 w-64 bg-surface-raised border border-border rounded-md shadow-lg hidden group-hover:block py-1 z-50">
              <button onClick={onRunDRC} className="w-full text-left px-4 py-2 text-text-primary hover:bg-surface flex items-center gap-2">
                <Shield className="w-4 h-4 text-accent-error" /> Run Design Rule Check (F9)
              </button>
              <button onClick={onSimulate} className="w-full text-left px-4 py-2 text-text-primary hover:bg-surface flex items-center gap-2">
                <Play className="w-4 h-4 text-accent-secondary" /> Run Mixed-Signal Simulation (F10)
              </button>
            </div>
          </div>

          {/* Help Menu */}
          <div className="relative group">
            <button className="px-3 py-1 text-text-secondary hover:bg-surface-raised hover:text-text-primary rounded cursor-default">Help</button>
            <div className="absolute left-0 top-full mt-0 w-48 bg-surface-raised border border-border rounded-md shadow-lg hidden group-hover:block py-1 z-50">
              <button className="w-full text-left px-4 py-2 text-text-primary hover:bg-surface">Debye Documentation</button>
              <button className="w-full text-left px-4 py-2 text-text-primary hover:bg-surface">API Reference</button>
              <div className="h-px bg-border my-1"></div>
              <button className="w-full text-left px-4 py-2 text-text-primary hover:bg-surface">About Debye</button>
            </div>
          </div>
        </div>
        
        <div className="ml-auto text-text-muted text-[11px] flex items-center gap-3">
          <span>{scenario === null ? 'Untitled.dsn' : scenario === 0 ? 'AI Generated.dsn' : `Example_${scenario}.dsn`}</span>
          <div className="w-6 h-6 rounded-full bg-accent-primary/20 border border-accent-primary/50 flex items-center justify-center text-[10px] font-bold text-accent-primary">
            FD
          </div>
        </div>
      </div>

      {/* Toolbar (Quick Actions) */}
      <div className="h-[40px] bg-surface flex items-center px-4 gap-2 border-b border-border shadow-sm">
        <button onClick={onNewProject} className="p-1.5 text-text-muted hover:text-text-primary hover:bg-surface-raised rounded tooltip-trigger" title="New Blank Project">
          <File className="w-4 h-4" />
        </button>
        <button onClick={onOpenProject} className="p-1.5 text-text-muted hover:text-text-primary hover:bg-surface-raised rounded tooltip-trigger" title="Open Project">
          <FolderOpen className="w-4 h-4" />
        </button>
        <button onClick={onSaveProject} className="p-1.5 text-text-muted hover:text-text-primary hover:bg-surface-raised rounded tooltip-trigger" title="Save Project">
          <Save className="w-4 h-4" />
        </button>
        
        <div className="h-5 w-px bg-border mx-2"></div>
        
        <button onClick={onRunDRC} className="flex items-center gap-1.5 bg-surface-raised border border-border hover:border-accent-error hover:text-accent-error text-text-primary text-xs font-medium px-3 py-1.5 rounded transition-colors tooltip-trigger" title="Run Design Rule Check (F9)">
          <Shield className="w-3.5 h-3.5" />
          <span>DRC</span>
        </button>
        
        <button onClick={onSimulate} className="flex items-center gap-1.5 bg-accent-secondary/10 border border-accent-secondary text-accent-secondary hover:bg-accent-secondary hover:text-background text-xs font-medium px-3 py-1.5 rounded transition-colors tooltip-trigger" title="Run Mixed-Signal Simulation (F10)">
          <Play className="w-3.5 h-3.5" />
          <span>Simulate</span>
        </button>

        <div className="h-5 w-px bg-border mx-2"></div>

        <button onClick={() => setShowGrid(!showGrid)} className={`p-1.5 rounded tooltip-trigger ${showGrid ? 'text-accent-primary bg-accent-primary/10' : 'text-text-muted hover:text-text-primary hover:bg-surface-raised'}`} title="Show/Hide Grid">
          <Grid className="w-4 h-4" />
        </button>
        <button onClick={() => zoomIn()} className="p-1.5 text-text-muted hover:text-text-primary hover:bg-surface-raised rounded tooltip-trigger" title="Zoom In">
          <ZoomIn className="w-4 h-4" />
        </button>
        <button onClick={() => zoomOut()} className="p-1.5 text-text-muted hover:text-text-primary hover:bg-surface-raised rounded tooltip-trigger" title="Zoom Out">
          <ZoomOut className="w-4 h-4" />
        </button>
        <button onClick={() => fitView({ duration: 800 })} className="p-1.5 text-text-muted hover:text-text-primary hover:bg-surface-raised rounded tooltip-trigger" title="Fit View">
          <Maximize className="w-4 h-4" />
        </button>

        <div className="ml-auto flex items-center gap-2">
          <button className="p-1.5 text-text-muted hover:text-text-primary hover:bg-surface-raised rounded tooltip-trigger" title="Settings">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
