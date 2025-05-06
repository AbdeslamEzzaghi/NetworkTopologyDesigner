import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Image, Line, Group, Text, Circle } from 'react-konva';
import { Device, Connection, ConnectionType } from '@/types/network';
import { DEVICE_TYPES } from '@/lib/utils';
import useImage from 'use-image';

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
  const [floorPlanImage] = useImage(floorPlan);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [deviceIcons, setDeviceIcons] = useState<Record<string, HTMLImageElement>>({});
  const [isDragging, setIsDragging] = useState(false);

  // Load device icons
  useEffect(() => {
    const loadIcons = async () => {
      const icons: Record<string, HTMLImageElement> = {};
      
      // Create canvas element to draw material icons
      const canvas = document.createElement('canvas');
      canvas.width = 48;
      canvas.height = 48;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return;
      
      // Load icons for each device type
      for (const deviceType of DEVICE_TYPES) {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Set background
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(24, 24, 20, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw circle border
        ctx.strokeStyle = '#3f51b5';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(24, 24, 20, 0, Math.PI * 2);
        ctx.stroke();
        
        // Add icon text
        ctx.fillStyle = '#3f51b5';
        ctx.font = '24px "Material Icons"';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(deviceType.icon, 24, 24);
        
        // Get data URL from canvas and create new image asynchronously
        const dataUrl = canvas.toDataURL();
        const image = document.createElement('img');
        image.src = dataUrl;
        icons[deviceType.id] = image;
      }
      
      setDeviceIcons(icons);
    };
    
    loadIcons();
  }, []);

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
    
    const newName = prompt('Enter device name:', device.label);
    if (newName !== null && newName.trim() !== '') {
      onDeviceRename(deviceId, newName);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, deviceId: string | null, connectionId: string | null) => {
    e.preventDefault();
    
    if (deviceId) {
      if (confirm('Remove this device?')) {
        onDeviceRemove(deviceId);
      }
    } else if (connectionId) {
      if (confirm('Remove this connection?')) {
        onConnectionRemove(connectionId);
      }
    }
  };

  const getDeviceIcon = (type: string) => {
    return deviceIcons[type] || null;
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
            
            return (
              <Group 
                key={connection.id}
                onContextMenu={(e) => handleContextMenu(e.evt as unknown as React.MouseEvent, null, connection.id)}
              >
                <Line
                  points={[source.x, source.y, target.x, target.y]}
                  stroke={connection.type === ConnectionType.WIRED ? '#3f51b5' : '#ff9800'}
                  strokeWidth={2}
                  dash={connection.type === ConnectionType.WIRELESS ? [5, 3] : undefined}
                  lineCap="round"
                  lineJoin="round"
                />
              </Group>
            );
          })}
          
          {/* Devices */}
          {devices.map((device) => {
            const icon = getDeviceIcon(device.type);
            
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
                {icon && (
                  <Image
                    image={icon}
                    width={40}
                    height={40}
                    offsetX={20}
                    offsetY={20}
                  />
                )}
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
              stroke={connectionMode.type === ConnectionType.WIRED ? '#3f51b5' : '#ff9800'}
              strokeWidth={2}
              dash={connectionMode.type === ConnectionType.WIRELESS ? [5, 3] : undefined}
              lineCap="round"
              opacity={0.7}
            />
          )}
        </Layer>
      </Stage>

      {/* Help tips */}
      <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm rounded-lg shadow-md p-4 max-w-xs">
        <h3 className="font-medium text-neutral-400 mb-2">Tips</h3>
        <ul className="text-sm text-neutral-400 space-y-1">
          <li>• Drag devices from the sidebar</li>
          <li>• Select connection type and click two devices to connect</li>
          <li>• Double-click a device to edit its label</li>
          <li>• Right-click to remove devices or connections</li>
        </ul>
      </div>
    </div>
  );
}
