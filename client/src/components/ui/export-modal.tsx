import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useState } from "react";

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

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: string, filename: string) => void;
}

export function ExportModal({
  isOpen,
  onClose,
  onExport
}: ExportModalProps) {
  const [format, setFormat] = useState<string>("png");
  const [filename, setFilename] = useState<string>("my_network_diagram");

  const handleExport = () => {
    onExport(format, filename);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-medium">Export Diagram</DialogTitle>
          <DialogDescription>
            Save your network diagram as an image or document.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="mb-4">
            <Label className="text-sm font-medium text-neutral-400 mb-1">Export Format</Label>
            <RadioGroup value={format} onValueChange={setFormat} className="flex space-x-2">
              <div className="flex items-center space-x-2 flex-1">
                <RadioGroupItem value="png" id="format-png" />
                <Label htmlFor="format-png" className="flex-1 py-2 px-4 border rounded text-center cursor-pointer hover:bg-neutral-50">
                  PNG Image
                </Label>
              </div>
              <div className="flex items-center space-x-2 flex-1">
                <RadioGroupItem value="pdf" id="format-pdf" />
                <Label htmlFor="format-pdf" className="flex-1 py-2 px-4 border rounded text-center cursor-pointer hover:bg-neutral-50">
                  PDF Document
                </Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="mb-4">
            <Label htmlFor="filename" className="text-sm font-medium text-neutral-400 mb-1">Filename</Label>
            <Input 
              id="filename"
              type="text" 
              value={filename} 
              onChange={(e) => setFilename(e.target.value)}
              className="w-full border border-neutral-200 rounded p-2" 
            />
          </div>
        </div>
        
        <DialogFooter className="flex justify-end space-x-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            variant="default" 
            className="bg-secondary hover:bg-orange-500 text-white" 
            onClick={handleExport}
          >
            <MaterialIcon icon="download" className="text-sm mr-1" />
            Export
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
