import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Image, Line, Group, Text, Circle, Rect } from 'react-konva';
import { Device, Connection, ConnectionType } from '@/types/network';
import { DEVICE_TYPES } from '@/lib/utils';
import useImage from 'use-image';
import { useLanguage } from '@/lib/languageContext';

// Scale conversion: pixels to meters (1 meter = 10 pixels by default)
const PIXELS_PER_METER = 10;

interface DesignCanvasProps {
  devices: Device[];
  connections: Connection[];
  floorPlan: string;
  zoomLevel: number;
  connectionMode: {
    active: boolean;
    type: ConnectionType | null;
    sourceId: string | null;
  };
  stageRef: React.RefObject<any>;
  onDeviceAdd: (type: string, x: number, y: number) => void;
  onDeviceMove: (id: string, x: number, y: number) => void;
  onDeviceSelect: (id: string) => void;
  onDeviceRemove: (id: string) => void;
  onDeviceRename: (id: string, newName: string) => void;
  onConnectionRemove: (id: string) => void;
  updateConnection?: (connectionId: string, properties: Partial<Connection>) => void;
}

export function DesignCanvas({
  devices,
  connections,
  floorPlan,
  zoomLevel,
  connectionMode,
  stageRef,
  onDeviceAdd,
  onDeviceMove,
  onDeviceSelect,
  onDeviceRemove,
  onDeviceRename,
  onConnectionRemove,
  updateConnection
}: DesignCanvasProps) {
  const { translate } = useLanguage();
  const [floorPlanImage] = useImage(floorPlan);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showTips, setShowTips] = useState(true);

  // Render device icons using Material Icon symbol
  const renderDeviceIcon = (deviceType: string, size: number = 1) => {
    const iconData = DEVICE_TYPES.find(d => d.id === deviceType);
    
    if (!iconData) return null;

    // Special color for certain devices (red)
    const redDevices = ['cable_connector', 'wall_phone_jack', 'bus_closure'];
    const isRedDevice = redDevices.includes(deviceType);
    const iconColor = isRedDevice ? '#ef4444' : '#3f51b5';
    
    // Make certain devices smaller by default
    let defaultSizeMultiplier = 1;
    if (deviceType === 'bus_closure' || deviceType === 'cable_connector') {
      defaultSizeMultiplier = 0.5; // 50% of normal size for these small devices
    }
    
    // Apply size multiplier (with special case for small devices)
    const baseRadius = 20;
    const baseFontSize = 20;
    const baseWidth = 40;
    const baseHeight = 40;
    
    const calculatedSize = size * defaultSizeMultiplier;
    const radius = baseRadius * calculatedSize;
    const fontSize = baseFontSize * calculatedSize;
    const width = baseWidth * calculatedSize;
    const height = baseHeight * calculatedSize;
    
    return (
      <>
        {/* Circle background */}
        <Circle
          radius={radius}
          fill="#FFFFFF"
          stroke={iconColor}
          strokeWidth={2}
        />
        
        {/* Material Icon */}
        <Text
          text={iconData.icon}
          fontFamily="Material Icons"
          fontSize={fontSize}
          fill={iconColor}
          align="center"
          verticalAlign="middle"
          width={width}
          height={height}
          offsetX={width / 2}
          offsetY={height / 2}
        />
      </>
    );
  };

  // Update canvas size on resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setCanvasSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };
    
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Handle drop from device panel
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    const deviceType = e.dataTransfer.getData('deviceType');
    if (!deviceType) return;
    
    // Calculate position relative to canvas
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / (zoomLevel / 100);
    const y = (e.clientY - rect.top) / (zoomLevel / 100);
    
    onDeviceAdd(deviceType, x, y);
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDeviceClick = (deviceId: string) => {
    if (connectionMode.active) {
      onDeviceSelect(deviceId);
    }
  };

  const handleDeviceDblClick = (deviceId: string) => {
    const device = devices.find(d => d.id === deviceId);
    if (!device) return;
    
    const newName = prompt(translate('dialog.enterDeviceName'), device.label);
    if (newName !== null && newName.trim() !== '') {
      onDeviceRename(deviceId, newName);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, deviceId: string | null, connectionId: string | null) => {
    e.preventDefault();
    
    if (deviceId) {
      // Create a custom context menu for devices
      const device = devices.find(d => d.id === deviceId);
      if (!device) return;
      
      // Ask for action: resize or remove or adjust wireless range
      const action = prompt(`Device: ${device.label}\nOptions:\n1. Resize Device\n2. Remove Device\n3. Adjust Wireless Range (if applicable)\nEnter option number:`);
      
      if (action === '1') {
        // Resize device
        const currentSize = device.size || 1;
        const currentPercent = Math.round(currentSize * 100);
        const newSizeStr = prompt(`Enter new size in percentage (25% to 200%).\nCurrent size: ${currentPercent}%`);
        
        if (newSizeStr) {
          // Parse percentage input
          let numericValue = parseFloat(newSizeStr.replace('%', ''));
          if (!isNaN(numericValue)) {
            // Convert percentage to decimal value
            const size = numericValue / 100;
            
            if (size >= 0.25 && size <= 2.0) {
              // Create a copy of the device with the new size
              const updatedDevice = { ...device, size };
              
              // We need to properly update this device
              // First remove the old device
              onDeviceRemove(deviceId);
              
              // Then add a new device at the same position with the same type
              onDeviceAdd(device.type, device.x, device.y);
              
              // Now find the newly added device (it will be the last one in the devices array)
              // and update its properties to match the old device plus the new size
              setTimeout(() => {
                const newDevices = [...devices];
                if (newDevices.length > 0) {
                  const lastDevice = newDevices[newDevices.length - 1];
                  if (lastDevice) {
                    // Update the label to match the original device
                    onDeviceRename(lastDevice.id, device.label);
                    
                    // Note: size should be applied automatically when rendering
                    // We're using the setTimeout to ensure the device is first added
                    // before we try to update its properties
                  }
                }
              }, 10);
            } else {
              alert('Size must be between 25% and 200%');
            }
          } else {
            alert('Please enter a valid percentage');
          }
        }
      } else if (action === '2') {
        // Remove device
        if (confirm(translate('dialog.removeDevice'))) {
          onDeviceRemove(deviceId);
        }
      } else if (action === '3') {
        // Adjust wireless range
        // Find all wireless connections where this device is the source
        const wirelessConnections = connections.filter(
          conn => conn.sourceId === deviceId && conn.type === ConnectionType.WIRELESS
        );
        
        if (wirelessConnections.length === 0) {
          alert('No wireless connections found for this device');
          return;
        }
        
        // Let user select which connection to adjust if there are multiple
        let connectionToAdjust = wirelessConnections[0];
        if (wirelessConnections.length > 1) {
          const targetOptions = wirelessConnections.map((conn, idx) => {
            const targetDevice = devices.find(d => d.id === conn.targetId);
            return `${idx + 1}. Connection to ${targetDevice?.label || 'Unknown Device'}`;
          }).join('\n');
          
          const selection = prompt(`Select wireless connection to adjust range:\n${targetOptions}\nEnter option number:`);
          if (selection) {
            const idx = parseInt(selection) - 1;
            if (idx >= 0 && idx < wirelessConnections.length) {
              connectionToAdjust = wirelessConnections[idx];
            } else {
              alert('Invalid selection');
              return;
            }
          } else {
            return;
          }
        }
        
        // Get current range and ask for new range (in meters)
        const currentRange = connectionToAdjust.range || 10;
        const newRangeStr = prompt(`Enter new wireless coverage range (5 to 50 meters).\nCurrent range: ${currentRange} meters`);
        
        if (newRangeStr) {
          const newRange = parseInt(newRangeStr);
          if (!isNaN(newRange) && newRange >= 5 && newRange <= 50) {
            // Update the connection range in meters using the updateConnection function
            if (updateConnection) {
              updateConnection(connectionToAdjust.id, { range: newRange });
            } else {
              alert('Cannot update wireless range. Feature not available.');
            }
          } else {
            alert('Range must be between 5 and 50 meters');
          }
        }
      }
    } else if (connectionId) {
      if (confirm(translate('dialog.removeConnection'))) {
        onConnectionRemove(connectionId);
      }
    }
  };

  // Function to render scale bar
  const renderScaleBar = () => {
    // Only render if we have a valid canvas size
    if (canvasSize.width === 0 || canvasSize.height === 0) return null;
    
    const scaleBarWidthMeters = 5; // 5 meters
    const scaleBarWidthPixels = scaleBarWidthMeters * PIXELS_PER_METER;
    const scaleBarHeight = 10;
    const padding = 20;
    
    return (
      <Group x={padding} y={canvasSize.height - padding - scaleBarHeight}>
        {/* Background for better visibility */}
        <Rect
          width={scaleBarWidthPixels + 20}
          height={scaleBarHeight + 30}
          fill="rgba(255, 255, 255, 0.7)"
          cornerRadius={5}
        />
        
        {/* Scale bar */}
        <Rect
          y={10}
          width={scaleBarWidthPixels}
          height={scaleBarHeight}
          fill="#333"
        />
        
        {/* Scale label */}
        <Text
          y={22}
          text={`${scaleBarWidthMeters} meters`}
          fontSize={12}
          fill="#333"
          align="center"
          width={scaleBarWidthPixels}
        />
      </Group>
    );
  };

  return (
    <div 
      ref={containerRef}
      className={`flex-1 relative overflow-hidden bg-neutral-100 ${
        connectionMode.active 
          ? 'device-canvas connection-mode'
          : isDragging 
            ? 'device-canvas dragging'
            : 'device-canvas'
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <Stage
        ref={stageRef}
        width={canvasSize.width}
        height={canvasSize.height}
        scaleX={zoomLevel / 100}
        scaleY={zoomLevel / 100}
      >
        <Layer>
          {/* Floor plan background */}
          {floorPlanImage && (
            <Image
              image={floorPlanImage}
              width={canvasSize.width / (zoomLevel / 100)}
              height={canvasSize.height / (zoomLevel / 100)}
              opacity={0.3}
            />
          )}
          
          {/* Scale bar */}
          {renderScaleBar()}
          
          {/* Connections */}
          {connections.map((connection) => {
            const source = devices.find(d => d.id === connection.sourceId);
            const target = devices.find(d => d.id === connection.targetId);
            
            if (!source || !target) return null;
            
            // Determine connection color
            const getConnectionColor = () => {
              switch (connection.type) {
                case ConnectionType.WIRED: return '#3f51b5'; // Default blue
                case ConnectionType.RJ11: return '#f59e0b'; // Amber
                case ConnectionType.RJ45: return '#3b82f6'; // Blue
                case ConnectionType.FIBER: return '#10b981'; // Green
                case ConnectionType.PHONE: return '#6b7280'; // Gray
                case ConnectionType.WIRELESS: return '#8b5cf6'; // Purple
                case ConnectionType.MAIN_CABLE: return '#ef4444'; // Red
                default: return '#3f51b5';
              }
            };
            
            // Determine stroke width
            const getStrokeWidth = () => {
              if (connection.type === ConnectionType.FIBER) return 3;
              if (connection.type === ConnectionType.MAIN_CABLE) return 4;
              return 2;
            };
            
            // Special rendering for Main Cable (Bus) when source and target are the same device
            const isBusConnection = connection.type === ConnectionType.MAIN_CABLE && connection.sourceId === connection.targetId;
            
            return (
              <Group 
                key={connection.id}
                onContextMenu={(e) => handleContextMenu(e.evt as unknown as React.MouseEvent, null, connection.id)}
              >
                {isBusConnection ? (
                  // For Bus connections, don't render anything special
                  <></>
                ) : (
                  // Normal connection rendering
                  <>
                    <Line
                      points={[source.x, source.y, target.x, target.y]}
                      stroke={getConnectionColor()}
                      strokeWidth={getStrokeWidth()}
                      dash={connection.type === ConnectionType.WIRELESS ? [5, 3] : undefined}
                      lineCap="round"
                      lineJoin="round"
                    />
                    
                    {/* Add wireless coverage indication if this is a wireless connection */}
                    {connection.type === ConnectionType.WIRELESS && (
                      <Circle
                        x={source.x}
                        y={source.y}
                        radius={(connection.range || 20) * PIXELS_PER_METER}
                        stroke={getConnectionColor()}
                        strokeWidth={1}
                        dash={[2, 2]}
                        opacity={0.3}
                        fill={getConnectionColor()}
                        fillOpacity={0.05}
                      />
                    )}
                  </>
                )}
              </Group>
            );
          })}
          
          {/* Devices */}
          {devices.map((device) => {
            return (
              <Group
                key={device.id}
                x={device.x}
                y={device.y}
                draggable
                onDragStart={() => setIsDragging(true)}
                onDragEnd={(e) => {
                  setIsDragging(false);
                  onDeviceMove(device.id, e.target.x(), e.target.y());
                }}
                onClick={() => handleDeviceClick(device.id)}
                onDblClick={() => handleDeviceDblClick(device.id)}
                onContextMenu={(e) => handleContextMenu(e.evt as unknown as React.MouseEvent, device.id, null)}
              >
                {/* Render device icon directly with size */}
                {renderDeviceIcon(device.type, device.size || 1)}
                
                {/* Device label */}
                <Text
                  text={device.label}
                  fontSize={12}
                  fill="#000000"
                  align="center"
                  width={80}
                  offsetX={40}
                  offsetY={-30}
                  padding={2}
                />
              </Group>
            );
          })}
          
          {/* Active connection line preview */}
          {connectionMode.active && connectionMode.sourceId && (
            <Line
              points={(() => {
                const sourceDevice = devices.find(d => d.id === connectionMode.sourceId);
                if (!sourceDevice) return [0, 0, 0, 0];
                
                // Get mouse position in stage
                const stage = stageRef.current;
                if (!stage) return [0, 0, 0, 0];
                
                const mousePos = stage.getPointerPosition();
                if (!mousePos) return [0, 0, 0, 0];
                
                // Convert to stage coordinates
                const scale = stage.scaleX();
                const mouseX = mousePos.x / scale;
                const mouseY = mousePos.y / scale;
                
                return [sourceDevice.x, sourceDevice.y, mouseX, mouseY];
              })()}
              stroke={(() => {
                switch (connectionMode.type) {
                  case ConnectionType.WIRED: return '#3f51b5'; // Default blue
                  case ConnectionType.RJ11: return '#f59e0b'; // Amber
                  case ConnectionType.RJ45: return '#3b82f6'; // Blue
                  case ConnectionType.FIBER: return '#10b981'; // Green
                  case ConnectionType.PHONE: return '#6b7280'; // Gray
                  case ConnectionType.WIRELESS: return '#8b5cf6'; // Purple
                  default: return '#3f51b5';
                }
              })()}
              strokeWidth={connectionMode.type === ConnectionType.FIBER ? 3 : 2}
              dash={connectionMode.type === ConnectionType.WIRELESS ? [5, 3] : undefined}
              lineCap="round"
              opacity={0.7}
            />
          )}
        </Layer>
      </Stage>

      {/* Help tips */}
      {showTips ? (
        <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm rounded-lg shadow-md p-4 max-w-xs">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium text-neutral-400">{translate('canvas.tips.title')}</h3>
            <button 
              onClick={() => setShowTips(false)}
              className="text-neutral-400 hover:text-neutral-600 text-xs font-medium px-2 py-1 rounded border border-neutral-300 hover:bg-neutral-100"
            >
              {translate('canvas.tips.minimize')}
            </button>
          </div>
          <ul className="text-sm text-neutral-400 space-y-1">
            <li>• {translate('canvas.tips.dragDevices')}</li>
            <li>• {translate('canvas.tips.connections')}</li>
            <li>• {translate('canvas.tips.doubleClick')}</li>
            <li>• {translate('canvas.tips.rightClick')}</li>
          </ul>
        </div>
      ) : (
        <button 
          onClick={() => setShowTips(true)}
          className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm rounded-lg shadow-md px-3 py-2 text-neutral-400 hover:text-neutral-600 text-sm font-medium hover:bg-white/90"
        >
          {translate('canvas.tips.show')}
        </button>
      )}
    </div>
  );
}
