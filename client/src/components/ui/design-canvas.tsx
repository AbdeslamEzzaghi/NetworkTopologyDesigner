import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Image, Line, Group, Text, Circle } from 'react-konva';
import { Device, Connection, ConnectionType } from '@/types/network';
import { DEVICE_TYPES } from '@/lib/utils';
import useImage from 'use-image';
import { useLanguage } from '@/lib/languageContext';

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
  onConnectionRemove
}: DesignCanvasProps) {
  const { translate } = useLanguage();
  const [floorPlanImage] = useImage(floorPlan);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showTips, setShowTips] = useState(true);

  // Render device icons using Material Icon symbol
  const renderDeviceIcon = (deviceType: string) => {
    const iconData = DEVICE_TYPES.find(d => d.id === deviceType);
    
    if (!iconData) return null;
    
    return (
      <>
        {/* Circle background */}
        <Circle
          radius={20}
          fill="#FFFFFF"
          stroke="#3f51b5"
          strokeWidth={2}
        />
        
        {/* Material Icon */}
        <Text
          text={iconData.icon}
          fontFamily="Material Icons"
          fontSize={20}
          fill="#3f51b5"
          align="center"
          verticalAlign="middle"
          width={40}
          height={40}
          offsetX={20}
          offsetY={20}
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
      if (confirm(translate('dialog.removeDevice'))) {
        onDeviceRemove(deviceId);
      }
    } else if (connectionId) {
      if (confirm(translate('dialog.removeConnection'))) {
        onConnectionRemove(connectionId);
      }
    }
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
                  // For standalone Bus, render a bus termination with icon
                  <>
                    <Group
                      x={source.x}
                      y={source.y - 40}
                    >
                      {/* Bus Termination Icon */}
                      <Circle
                        radius={20}
                        fill="#FFFFFF"
                        stroke={getConnectionColor()}
                        strokeWidth={3}
                      />
                      <Text
                        text="settings_input_composite"
                        fontFamily="Material Icons"
                        fontSize={20}
                        fill={getConnectionColor()}
                        align="center"
                        verticalAlign="middle"
                        width={40}
                        height={40}
                        offsetX={20}
                        offsetY={20}
                      />
                      <Text
                        y={35}
                        text="Extrémité du Bus"
                        fontSize={10}
                        fill={getConnectionColor()}
                        align="center"
                        width={80}
                        offsetX={40}
                      />
                    </Group>
                  </>
                ) : (
                  // Normal connection rendering
                  <Line
                    points={[source.x, source.y, target.x, target.y]}
                    stroke={getConnectionColor()}
                    strokeWidth={getStrokeWidth()}
                    dash={connection.type === ConnectionType.WIRELESS ? [5, 3] : undefined}
                    lineCap="round"
                    lineJoin="round"
                  />
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
                {/* Render device icon directly */}
                {renderDeviceIcon(device.type)}
                
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
