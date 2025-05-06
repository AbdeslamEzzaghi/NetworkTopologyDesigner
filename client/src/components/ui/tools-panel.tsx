import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Material icons from Google Fonts
const MaterialIcon: React.FC<{ icon: string; className?: string }> = ({ 
  icon, 
  className 
}) => (
  <span 
    className={`material-symbols-outlined ${className || ''}`}
    style={{ fontFamily: 'Material Icons' }}
  >
    {icon}
  </span>
);

interface ToolsPanelProps {
  zoomLevel: number;
  canUndo: boolean;
  canRedo: boolean;
  onClear: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export function ToolsPanel({
  zoomLevel,
  canUndo,
  canRedo,
  onClear,
  onUndo,
  onRedo,
  onZoomIn,
  onZoomOut
}: ToolsPanelProps) {
  return (
    <footer className="bg-white border-t border-neutral-200 py-2 px-4 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                id="clear-btn"
                variant="ghost"
                size="sm"
                className="flex items-center text-neutral-400 hover:text-destructive"
                onClick={onClear}
              >
                <MaterialIcon icon="delete" className="text-sm mr-1" />
                Clear All
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Remove all devices and connections</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                id="undo-btn"
                variant="ghost"
                size="sm"
                className="flex items-center text-neutral-400 hover:text-primary"
                onClick={onUndo}
                disabled={!canUndo}
              >
                <MaterialIcon icon="undo" className="text-sm mr-1" />
                Undo
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Undo last action</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                id="redo-btn"
                variant="ghost"
                size="sm"
                className="flex items-center text-neutral-400 hover:text-primary"
                onClick={onRedo}
                disabled={!canRedo}
              >
                <MaterialIcon icon="redo" className="text-sm mr-1" />
                Redo
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Redo last undone action</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <div className="flex items-center">
        <span className="text-sm text-neutral-300 mr-2">Zoom:</span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                id="zoom-out" 
                variant="ghost" 
                size="icon" 
                className="p-1 text-neutral-400 hover:text-primary"
                onClick={onZoomOut}
                disabled={zoomLevel <= 50}
              >
                <MaterialIcon icon="remove" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Zoom out</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <span id="zoom-level" className="text-sm px-2">{zoomLevel}%</span>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                id="zoom-in" 
                variant="ghost" 
                size="icon" 
                className="p-1 text-neutral-400 hover:text-primary"
                onClick={onZoomIn}
                disabled={zoomLevel >= 150}
              >
                <MaterialIcon icon="add" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Zoom in</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </footer>
  );
}
