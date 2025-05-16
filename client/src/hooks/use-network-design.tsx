import { useState, useRef, useCallback } from 'react';
import { Device, Connection, ConnectionType, HistoryAction, ConnectionMode } from '@/types/network';
import { generateId, DEFAULT_FLOOR_PLANS } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export function useNetworkDesign() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [floorPlan, setFloorPlan] = useState<string>(DEFAULT_FLOOR_PLANS[0].src);
  const [name, setName] = useState<string>('Untitled Network Diagram');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [connectionMode, setConnectionMode] = useState<ConnectionMode>({
    active: false,
    type: null,
    sourceId: null
  });
  
  const [historyStack, setHistoryStack] = useState<HistoryAction[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const stageRef = useRef<any>(null);
  const { toast } = useToast();

  // Add a device to the canvas
  const addDevice = useCallback((type: string, x: number, y: number) => {
    const newDevice: Device = {
      id: generateId(),
      type,
      label: type.charAt(0).toUpperCase() + type.slice(1),
      x,
      y
    };
    
    setDevices(prev => [...prev, newDevice]);
    
    // Add to history
    const action: HistoryAction = {
      type: 'ADD_DEVICE',
      payload: newDevice,
      undo: () => setDevices(prev => prev.filter(d => d.id !== newDevice.id)),
      redo: () => setDevices(prev => [...prev, newDevice])
    };
    
    addToHistory(action);
    return newDevice;
  }, []);

  // Remove a device from the canvas
  const removeDevice = useCallback((deviceId: string) => {
    const deviceToRemove = devices.find(d => d.id === deviceId);
    if (!deviceToRemove) return;
    
    // Also remove any connections involving this device
    const connectionsToRemove = connections.filter(
      c => c.sourceId === deviceId || c.targetId === deviceId
    );
    
    setDevices(prev => prev.filter(d => d.id !== deviceId));
    setConnections(prev => 
      prev.filter(c => c.sourceId !== deviceId && c.targetId !== deviceId)
    );
    
    // Add to history
    const action: HistoryAction = {
      type: 'REMOVE_DEVICE',
      payload: { device: deviceToRemove, connections: connectionsToRemove },
      undo: () => {
        setDevices(prev => [...prev, deviceToRemove]);
        setConnections(prev => [...prev, ...connectionsToRemove]);
      },
      redo: () => {
        setDevices(prev => prev.filter(d => d.id !== deviceId));
        setConnections(prev => 
          prev.filter(c => c.sourceId !== deviceId && c.targetId !== deviceId)
        );
      }
    };
    
    addToHistory(action);
  }, [devices, connections]);

  // Update device position
  const updateDevicePosition = useCallback((deviceId: string, x: number, y: number) => {
    const oldDevice = devices.find(d => d.id === deviceId);
    if (!oldDevice) return;
    
    const oldPosition = { x: oldDevice.x, y: oldDevice.y };
    
    setDevices(prev => 
      prev.map(d => 
        d.id === deviceId ? { ...d, x, y } : d
      )
    );
    
    // Add to history
    const action: HistoryAction = {
      type: 'MOVE_DEVICE',
      payload: { deviceId, newPosition: { x, y }, oldPosition },
      undo: () => {
        setDevices(prev => 
          prev.map(d => 
            d.id === deviceId ? { ...d, x: oldPosition.x, y: oldPosition.y } : d
          )
        );
      },
      redo: () => {
        setDevices(prev => 
          prev.map(d => 
            d.id === deviceId ? { ...d, x, y } : d
          )
        );
      }
    };
    
    addToHistory(action);
  }, [devices]);

  // Rename a device
  const renameDevice = useCallback((deviceId: string, newLabel: string) => {
    const oldDevice = devices.find(d => d.id === deviceId);
    if (!oldDevice) return;
    
    const oldLabel = oldDevice.label;
    
    setDevices(prev => 
      prev.map(d => 
        d.id === deviceId ? { ...d, label: newLabel } : d
      )
    );
    
    // Add to history
    const action: HistoryAction = {
      type: 'RENAME_DEVICE',
      payload: { deviceId, newLabel, oldLabel },
      undo: () => {
        setDevices(prev => 
          prev.map(d => 
            d.id === deviceId ? { ...d, label: oldLabel } : d
          )
        );
      },
      redo: () => {
        setDevices(prev => 
          prev.map(d => 
            d.id === deviceId ? { ...d, label: newLabel } : d
          )
        );
      }
    };
    
    addToHistory(action);
  }, [devices]);

  // Set connection mode
  const setConnectionType = useCallback((type: ConnectionType | null) => {
    if (connectionMode.active && connectionMode.type === type) {
      // Toggle off if clicking the same type
      setConnectionMode({
        active: false,
        type: null,
        sourceId: null
      });
    } else {
      // Set new connection type
      setConnectionMode({
        active: true,
        type,
        sourceId: null
      });
    }
  }, [connectionMode]);

  // Handle device selection for connection
  const handleDeviceSelect = useCallback((deviceId: string) => {
    if (!connectionMode.active || !connectionMode.type) return;
    
    // Special handling for Main Cable (Bus) - can be created with just one device
    if (connectionMode.type === ConnectionType.MAIN_CABLE) {
      if (!connectionMode.sourceId) {
        // First device selected - for bus cable, we can set both source and target as the same device
        // This allows the bus cable to exist without requiring two different endpoints
        const busConnection: Connection = {
          id: generateId(),
          sourceId: deviceId,
          targetId: deviceId, // Same device - indicates a standalone bus
          type: ConnectionType.MAIN_CABLE
        };
        
        setConnections(prev => [...prev, busConnection]);
        
        // Add to history
        const action: HistoryAction = {
          type: 'ADD_CONNECTION',
          payload: busConnection,
          undo: () => setConnections(prev => prev.filter(c => c.id !== busConnection.id)),
          redo: () => setConnections(prev => [...prev, busConnection])
        };
        
        addToHistory(action);
        
        // Keep connection mode active to allow connecting more devices to the bus
        setConnectionMode({
          active: true,
          type: connectionMode.type,
          sourceId: deviceId // Keep track of the bus source
        });
      } else {
        // Additional device selected - connect to the bus
        const newConnection: Connection = {
          id: generateId(),
          sourceId: connectionMode.sourceId,
          targetId: deviceId,
          type: ConnectionType.MAIN_CABLE
        };
        
        // Allow connections to existing bus connections
        setConnections(prev => [...prev, newConnection]);
        
        // Add to history
        const action: HistoryAction = {
          type: 'ADD_CONNECTION',
          payload: newConnection,
          undo: () => setConnections(prev => prev.filter(c => c.id !== newConnection.id)),
          redo: () => setConnections(prev => [...prev, newConnection])
        };
        
        addToHistory(action);
        
        // Keep the same source for additional connections
        setConnectionMode({
          active: true,
          type: connectionMode.type,
          sourceId: connectionMode.sourceId
        });
      }
    } else {
      // Normal connection handling for other connection types
      if (!connectionMode.sourceId) {
        // First device selected
        setConnectionMode(prev => ({
          ...prev,
          sourceId: deviceId
        }));
      } else if (connectionMode.sourceId !== deviceId) {
        // Second device selected, create connection
        const newConnection: Connection = {
          id: generateId(),
          sourceId: connectionMode.sourceId,
          targetId: deviceId,
          type: connectionMode.type
        };
        
        // Check if connection already exists
        const connectionExists = connections.some(
          c => (c.sourceId === connectionMode.sourceId && c.targetId === deviceId) ||
               (c.sourceId === deviceId && c.targetId === connectionMode.sourceId)
        );
        
        if (!connectionExists) {
          setConnections(prev => [...prev, newConnection]);
          
          // Add to history
          const action: HistoryAction = {
            type: 'ADD_CONNECTION',
            payload: newConnection,
            undo: () => setConnections(prev => prev.filter(c => c.id !== newConnection.id)),
            redo: () => setConnections(prev => [...prev, newConnection])
          };
          
          addToHistory(action);
        }
        
        // Reset connection mode
        setConnectionMode({
          active: true, // Keep active to allow more connections of same type
          type: connectionMode.type,
          sourceId: null
        });
      }
    }
  }, [connectionMode, connections]);

  // Remove a connection
  const removeConnection = useCallback((connectionId: string) => {
    const connectionToRemove = connections.find(c => c.id === connectionId);
    if (!connectionToRemove) return;
    
    setConnections(prev => prev.filter(c => c.id !== connectionId));
    
    // Add to history
    const action: HistoryAction = {
      type: 'REMOVE_CONNECTION',
      payload: connectionToRemove,
      undo: () => setConnections(prev => [...prev, connectionToRemove]),
      redo: () => setConnections(prev => prev.filter(c => c.id !== connectionId))
    };
    
    addToHistory(action);
  }, [connections]);

  // Change floor plan
  const changeFloorPlan = useCallback((newFloorPlan: string) => {
    const oldFloorPlan = floorPlan;
    setFloorPlan(newFloorPlan);
    
    // Add to history
    const action: HistoryAction = {
      type: 'CHANGE_FLOOR_PLAN',
      payload: { newFloorPlan, oldFloorPlan },
      undo: () => setFloorPlan(oldFloorPlan),
      redo: () => setFloorPlan(newFloorPlan)
    };
    
    addToHistory(action);
  }, [floorPlan]);

  // History management
  const addToHistory = useCallback((action: HistoryAction) => {
    // Remove any future actions if we're not at the end of the stack
    const newStack = historyStack.slice(0, historyIndex + 1);
    setHistoryStack([...newStack, action]);
    setHistoryIndex(newStack.length);
  }, [historyStack, historyIndex]);

  // Undo the last action
  const undo = useCallback(() => {
    if (historyIndex >= 0) {
      const action = historyStack[historyIndex];
      action.undo();
      setHistoryIndex(prev => prev - 1);
    }
  }, [historyStack, historyIndex]);

  // Redo the last undone action
  const redo = useCallback(() => {
    if (historyIndex < historyStack.length - 1) {
      const action = historyStack[historyIndex + 1];
      action.redo();
      setHistoryIndex(prev => prev + 1);
    }
  }, [historyStack, historyIndex]);

  // Clear the canvas
  const clearCanvas = useCallback(() => {
    setDevices([]);
    setConnections([]);
    // Don't clear floor plan or name
    
    // Reset history
    setHistoryStack([]);
    setHistoryIndex(-1);
    
    toast({
      title: "Canvas cleared",
      description: "All devices and connections have been removed."
    });
  }, [toast]);

  // Update zoom level
  const updateZoom = useCallback((delta: number) => {
    setZoomLevel(prev => {
      const newZoom = Math.max(50, Math.min(150, prev + delta));
      return newZoom;
    });
  }, []);

  // Save the current design
  const saveDesign = useCallback(async () => {
    try {
      const designData = {
        devices,
        connections,
        floorPlan,
        name
      };
      
      const response = await fetch('/api/diagrams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(designData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save design');
      }
      
      const savedDesign = await response.json();
      
      toast({
        title: "Design Saved",
        description: `"${name}" has been saved successfully.`
      });
      
      return savedDesign;
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "There was an error saving your design.",
        variant: "destructive"
      });
      return null;
    }
  }, [devices, connections, floorPlan, name, toast]);

  // Load a design
  const loadDesign = useCallback(async (id: number) => {
    try {
      const response = await fetch(`/api/diagrams/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to load design');
      }
      
      const loadedDesign = await response.json();
      
      setDevices(loadedDesign.devices);
      setConnections(loadedDesign.connections);
      setFloorPlan(loadedDesign.floorPlan);
      setName(loadedDesign.name);
      
      // Reset history when loading a new design
      setHistoryStack([]);
      setHistoryIndex(-1);
      
      toast({
        title: "Design Loaded",
        description: `"${loadedDesign.name}" has been loaded successfully.`
      });
      
      return loadedDesign;
    } catch (error) {
      toast({
        title: "Load Failed",
        description: "There was an error loading the design.",
        variant: "destructive"
      });
      return null;
    }
  }, [toast]);

  return {
    devices,
    connections,
    floorPlan,
    name,
    zoomLevel,
    connectionMode,
    stageRef,
    historyStack,
    historyIndex,
    setName,
    addDevice,
    removeDevice,
    updateDevicePosition,
    renameDevice,
    setConnectionType,
    handleDeviceSelect,
    removeConnection,
    changeFloorPlan,
    undo,
    redo,
    clearCanvas,
    updateZoom,
    saveDesign,
    loadDesign
  };
}
