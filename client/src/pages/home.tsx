import { useState, useEffect } from "react";
import { DevicePanel } from "@/components/ui/device-panel";
import { DesignCanvas } from "@/components/ui/design-canvas";
import { ToolsPanel } from "@/components/ui/tools-panel";
import { ExportModal } from "@/components/ui/export-modal";
import { BackgroundModal } from "@/components/ui/background-modal";
import { useNetworkDesign } from "@/hooks/use-network-design";
import { exportDiagramAsImage, exportDiagramAsPDF, DEVICE_TYPES } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

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

export default function Home() {
  const networkDesign = useNetworkDesign();
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [backgroundModalOpen, setBackgroundModalOpen] = useState(false);
  const [loadModalOpen, setLoadModalOpen] = useState(false);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  
  // Setup drag event listeners for devices
  useEffect(() => {
    const handleDeviceDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement;
      const deviceType = target.getAttribute('data-device-type');
      
      if (deviceType && e.dataTransfer) {
        e.dataTransfer.setData('deviceType', deviceType);
      }
    };
    
    const deviceElements = document.querySelectorAll('.device');
    deviceElements.forEach(device => {
      device.addEventListener('dragstart', handleDeviceDragStart as EventListener);
    });
    
    return () => {
      deviceElements.forEach(device => {
        device.removeEventListener('dragstart', handleDeviceDragStart as EventListener);
      });
    };
  }, []);
  
  // Load saved diagrams
  const { data: savedDiagrams, isLoading: loadingDiagrams } = useQuery({
    queryKey: ['/api/diagrams'],
    enabled: loadModalOpen,
  });
  
  const handleExport = (format: string, filename: string) => {
    if (format === 'png') {
      exportDiagramAsImage(networkDesign.stageRef, filename);
    } else {
      exportDiagramAsPDF(networkDesign.stageRef, filename);
    }
  };
  
  const handleLoad = (id: number) => {
    networkDesign.loadDesign(id);
    setLoadModalOpen(false);
  };
  
  return (
    <div className="bg-neutral-100 h-screen flex flex-col">
      {/* Header */}
      <header className="bg-primary text-white p-4 shadow-md flex justify-between items-center">
        <h1 className="text-xl font-medium">Network Design Tool</h1>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            className="flex items-center bg-white/10 hover:bg-white/20 px-3 py-2 rounded text-white"
            onClick={() => networkDesign.saveDesign()}
          >
            <MaterialIcon icon="save" className="text-sm mr-1" />
            Save
          </Button>
          <Button
            variant="ghost"
            className="flex items-center bg-white/10 hover:bg-white/20 px-3 py-2 rounded text-white"
            onClick={() => setLoadModalOpen(true)}
          >
            <MaterialIcon icon="folder_open" className="text-sm mr-1" />
            Load
          </Button>
          <Button
            variant="secondary"
            className="flex items-center hover:bg-orange-500 text-white px-3 py-2 rounded"
            onClick={() => setExportModalOpen(true)}
          >
            <MaterialIcon icon="download" className="text-sm mr-1" />
            Export
          </Button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        <DevicePanel
          connectionMode={networkDesign.connectionMode}
          onConnectionTypeChange={networkDesign.setConnectionType}
          onChangeBackgroundClick={() => setBackgroundModalOpen(true)}
        />
        
        <DesignCanvas
          devices={networkDesign.devices}
          connections={networkDesign.connections}
          floorPlan={networkDesign.floorPlan}
          zoomLevel={networkDesign.zoomLevel}
          connectionMode={networkDesign.connectionMode}
          stageRef={networkDesign.stageRef}
          onDeviceAdd={networkDesign.addDevice}
          onDeviceMove={networkDesign.updateDevicePosition}
          onDeviceSelect={networkDesign.handleDeviceSelect}
          onDeviceRemove={networkDesign.removeDevice}
          onDeviceRename={networkDesign.renameDevice}
          onConnectionRemove={networkDesign.removeConnection}
        />
      </div>

      {/* Footer tools */}
      <ToolsPanel
        zoomLevel={networkDesign.zoomLevel}
        canUndo={networkDesign.historyIndex > -1}
        canRedo={networkDesign.historyIndex < networkDesign.historyStack.length - 1}
        onClear={() => setConfirmClearOpen(true)}
        onUndo={networkDesign.undo}
        onRedo={networkDesign.redo}
        onZoomIn={() => networkDesign.updateZoom(10)}
        onZoomOut={() => networkDesign.updateZoom(-10)}
      />

      {/* Modals */}
      <ExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        onExport={handleExport}
      />
      
      <BackgroundModal
        isOpen={backgroundModalOpen}
        onClose={() => setBackgroundModalOpen(false)}
        onApply={networkDesign.changeFloorPlan}
        currentFloorPlan={networkDesign.floorPlan}
      />
      
      <Dialog open={loadModalOpen} onOpenChange={setLoadModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Load Saved Diagram</DialogTitle>
            <DialogDescription>
              Select a previously saved network diagram to load
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {loadingDiagrams ? (
              <div className="text-center py-8">Loading saved diagrams...</div>
            ) : savedDiagrams && Array.isArray(savedDiagrams) && savedDiagrams.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {savedDiagrams.map((diagram: any) => (
                  <Button
                    key={diagram.id}
                    variant="outline"
                    className="w-full justify-start text-left"
                    onClick={() => handleLoad(diagram.id)}
                  >
                    <MaterialIcon icon="description" className="mr-2" />
                    {diagram.name}
                    <span className="ml-auto text-xs text-neutral-400">
                      {new Date(diagram.updatedAt).toLocaleDateString()}
                    </span>
                  </Button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-neutral-400">
                No saved diagrams found
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={confirmClearOpen} onOpenChange={setConfirmClearOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear all devices and connections?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will remove all devices and connections from your canvas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                networkDesign.clearCanvas();
                setConfirmClearOpen(false);
              }}
              className="bg-destructive text-destructive-foreground"
            >
              Clear All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
