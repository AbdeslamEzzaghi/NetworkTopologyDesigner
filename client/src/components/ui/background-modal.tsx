import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useState, useRef } from "react";
import { DEFAULT_FLOOR_PLANS } from "@/lib/utils";

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

interface BackgroundModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (floorPlanSrc: string) => void;
  currentFloorPlan: string;
}

export function BackgroundModal({
  isOpen,
  onClose,
  onApply,
  currentFloorPlan
}: BackgroundModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>(currentFloorPlan);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleApply = () => {
    onApply(selectedPlan);
    onClose();
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setSelectedPlan(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-medium">Change Floor Plan</DialogTitle>
          <DialogDescription>
            Select from templates or upload your own floor plan.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="mb-4">
            <Label className="block text-sm font-medium text-neutral-400 mb-1">Choose a template</Label>
            <RadioGroup value={selectedPlan} onValueChange={setSelectedPlan} className="grid grid-cols-2 gap-2 mb-3">
              {DEFAULT_FLOOR_PLANS.map((plan) => (
                <div key={plan.id} className={`border p-1 rounded ${selectedPlan === plan.src ? 'border-primary border-2' : 'border-neutral-200'}`}>
                  <Label htmlFor={`plan-${plan.id}`} className="cursor-pointer">
                    <div className="relative w-full aspect-[4/3] bg-neutral-100">
                      <img src={plan.src} alt={plan.name} className="w-full h-full object-contain opacity-30" />
                    </div>
                    <RadioGroupItem value={plan.src} id={`plan-${plan.id}`} className="sr-only" />
                    <p className="text-xs text-center mt-1">{plan.name}</p>
                  </Label>
                </div>
              ))}
            </RadioGroup>
            
            <div className="mb-4">
              <Label className="block text-sm font-medium text-neutral-400 mb-1">Or upload your own</Label>
              <Input 
                type="file" 
                accept="image/*" 
                ref={fileInputRef}
                onChange={handleFileChange}
              />
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex justify-end space-x-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            variant="default" 
            onClick={handleApply}
          >
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Input({ 
  type, 
  accept, 
  ref, 
  onChange 
}: { 
  type: string; 
  accept?: string; 
  ref: React.RefObject<HTMLInputElement>; 
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void 
}) {
  return (
    <div className="relative">
      <Button 
        variant="outline" 
        className="w-full" 
        onClick={() => ref.current?.click()}
      >
        <MaterialIcon icon="upload_file" className="mr-2" />
        Select File
      </Button>
      <input 
        type={type} 
        accept={accept} 
        ref={ref} 
        onChange={onChange}
        className="absolute inset-0 opacity-0 cursor-pointer" 
      />
    </div>
  );
}
