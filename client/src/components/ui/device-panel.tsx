import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DEVICE_TYPES } from "@/lib/utils";
import { ConnectionType } from "@/types/network";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/languageContext";
import { LanguageSelector } from "@/components/ui/language-selector";

// Material icons from Google Fonts
const MaterialIcon: React.FC<{ icon: string; className?: string }> = ({ 
  icon, 
  className 
}) => (
  <span 
    className={cn("material-symbols-outlined", className)}
    style={{ fontFamily: 'Material Icons' }}
  >
    {icon}
  </span>
);

interface DevicePanelProps {
  connectionMode: {
    active: boolean;
    type: ConnectionType | null;
    sourceId: string | null;
  };
  onConnectionTypeChange: (type: ConnectionType | null) => void;
  onChangeBackgroundClick: () => void;
}

export function DevicePanel({
  connectionMode,
  onConnectionTypeChange,
  onChangeBackgroundClick
}: DevicePanelProps) {
  const { translate } = useLanguage();
  
  // Translate device names based on device type
  const getDeviceName = (deviceId: string) => {
    switch (deviceId) {
      case 'computer': return translate('devicePanel.computer');
      case 'laptop': return translate('devicePanel.laptop');
      case 'smartphone': return translate('devicePanel.smartphone');
      case 'router': return translate('devicePanel.router');
      case 'switch': return translate('devicePanel.switch');
      case 'server': return translate('devicePanel.server');
      case 'printer': return translate('devicePanel.printer');
      default: return deviceId;
    }
  };
  
  return (
    <aside className="w-64 bg-white border-r border-neutral-200 flex flex-col h-full shadow-sm">
      <div className="p-4 border-b border-neutral-200 flex justify-between items-center">
        <h2 className="font-medium text-lg text-neutral-400">{translate('devicePanel.title')}</h2>
        <LanguageSelector />
      </div>
      
      <div className="overflow-y-auto flex-1 p-2">
        <div className="device-icons">
          {DEVICE_TYPES.map((device) => (
            <div 
              key={device.id}
              className="device bg-neutral-100 p-3 rounded text-center flex flex-col items-center" 
              data-device-type={device.id}
              draggable="true"
            >
              <MaterialIcon icon={device.icon} className="text-primary text-2xl" />
              <span className="text-sm mt-1">{getDeviceName(device.id)}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="p-4 border-t border-neutral-200">
        <h2 className="font-medium text-lg text-neutral-400 mb-2">{translate('devicePanel.connections')}</h2>
        <div className="flex flex-col space-y-2">
          <Button
            id="wired-connection-btn"
            variant={connectionMode.active && connectionMode.type === ConnectionType.WIRED ? "default" : "outline"}
            className="flex items-center justify-center"
            onClick={() => onConnectionTypeChange(ConnectionType.WIRED)}
          >
            <div className="w-6 h-0.5 bg-primary"></div>
            <span className="ml-2 text-sm">{translate('devicePanel.wired')}</span>
          </Button>
          <Button
            id="wireless-connection-btn"
            variant={connectionMode.active && connectionMode.type === ConnectionType.WIRELESS ? "default" : "outline"}
            className="flex items-center justify-center"
            onClick={() => onConnectionTypeChange(ConnectionType.WIRELESS)}
          >
            <div className="w-6 h-0.5 border-t border-dashed border-primary"></div>
            <span className="ml-2 text-sm">{translate('devicePanel.wireless')}</span>
          </Button>
        </div>
      </div>
      
      <div className="mt-auto p-4 border-t border-neutral-200">
        <Button
          id="change-background-btn"
          variant="outline"
          className="w-full flex items-center justify-center"
          onClick={onChangeBackgroundClick}
        >
          <MaterialIcon icon="image" className="text-sm mr-1" />
          <span className="text-sm">{translate('devicePanel.changeBackground')}</span>
        </Button>
      </div>
    </aside>
  );
}
