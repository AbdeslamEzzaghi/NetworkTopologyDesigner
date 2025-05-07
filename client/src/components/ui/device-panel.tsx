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
      case 'access_point': return translate('devicePanel.access_point');
      case 'repeater': return translate('devicePanel.repeater');
      case 'isp': return translate('devicePanel.isp');
      case 'modem': return translate('devicePanel.modem');
      case 'ont': return translate('devicePanel.ont');
      case 'home_phone': return translate('devicePanel.home_phone');
      case 'tablet': return translate('devicePanel.tablet');
      case 'tv': return translate('devicePanel.tv');
      default: return deviceId;
    }
  };
  
  return (
    <aside className="w-72 bg-white border-r border-neutral-200 flex flex-col h-full shadow-sm">
      <div className="p-4 border-b border-neutral-200 flex justify-between items-center">
        <h2 className="font-medium text-lg text-neutral-400">{translate('devicePanel.title')}</h2>
        <LanguageSelector />
      </div>
      
      {/* Devices Section */}
      <div className="p-2 h-1/2 overflow-y-auto">
        <h3 className="text-sm text-neutral-500 font-medium px-2 mb-2">{translate('devicePanel.title')}</h3>
        <div className="device-icons grid grid-cols-3 gap-2">
          {DEVICE_TYPES.map((device) => (
            <div 
              key={device.id}
              className="device bg-neutral-100 p-2 rounded text-center flex flex-col items-center" 
              data-device-type={device.id}
              draggable="true"
            >
              <MaterialIcon icon={device.icon} className="text-primary text-xl" />
              <span className="text-xs mt-1 line-clamp-1">{getDeviceName(device.id)}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Connections Section */}
      <div className="p-4 border-t border-neutral-200 h-1/2 overflow-y-auto">
        <h2 className="font-medium text-lg text-neutral-400 mb-2">{translate('devicePanel.connections')}</h2>
        <div className="flex flex-col space-y-2">
          <h3 className="text-sm text-neutral-500 font-medium mb-1">{translate('devicePanel.wired')}</h3>
          <div className="grid grid-cols-2 gap-2">
            <Button
              id="rj11-connection-btn"
              variant={connectionMode.active && connectionMode.type === ConnectionType.RJ11 ? "default" : "outline"}
              className="flex items-center justify-start h-9"
              onClick={() => onConnectionTypeChange(ConnectionType.RJ11)}
              size="sm"
            >
              <div className="w-4 h-0.5 bg-amber-500 ml-1"></div>
              <span className="ml-1 text-xs">{translate('devicePanel.connection_rj11')}</span>
            </Button>
            
            <Button
              id="rj45-connection-btn"
              variant={connectionMode.active && connectionMode.type === ConnectionType.RJ45 ? "default" : "outline"}
              className="flex items-center justify-start h-9"
              onClick={() => onConnectionTypeChange(ConnectionType.RJ45)}
              size="sm"
            >
              <div className="w-4 h-0.5 bg-blue-500 ml-1"></div>
              <span className="ml-1 text-xs">{translate('devicePanel.connection_rj45')}</span>
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <Button
              id="fiber-connection-btn"
              variant={connectionMode.active && connectionMode.type === ConnectionType.FIBER ? "default" : "outline"}
              className="flex items-center justify-start h-9"
              onClick={() => onConnectionTypeChange(ConnectionType.FIBER)}
              size="sm"
            >
              <div className="w-4 h-0.5 bg-green-500 ml-1"></div>
              <span className="ml-1 text-xs">{translate('devicePanel.connection_fiber')}</span>
            </Button>
            
            <Button
              id="phone-connection-btn"
              variant={connectionMode.active && connectionMode.type === ConnectionType.PHONE ? "default" : "outline"}
              className="flex items-center justify-start h-9"
              onClick={() => onConnectionTypeChange(ConnectionType.PHONE)}
              size="sm"
            >
              <div className="w-4 h-0.5 bg-gray-500 ml-1"></div>
              <span className="ml-1 text-xs">{translate('devicePanel.connection_phone')}</span>
            </Button>
          </div>
          
          <h3 className="text-sm text-neutral-500 font-medium mt-2 mb-1">{translate('devicePanel.wireless')}</h3>
          <Button
            id="wireless-connection-btn"
            variant={connectionMode.active && connectionMode.type === ConnectionType.WIRELESS ? "default" : "outline"}
            className="flex items-center justify-center"
            onClick={() => onConnectionTypeChange(ConnectionType.WIRELESS)}
            size="sm"
          >
            <div className="w-6 h-0.5 border-t border-dashed border-purple-500"></div>
            <span className="ml-2 text-xs">{translate('devicePanel.wireless')}</span>
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
