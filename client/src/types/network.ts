export interface DeviceType {
  id: string;
  name: string;
  icon: string;
}

export interface Device {
  id: string;
  type: string;
  label: string;
  x: number;
  y: number;
  size?: number; // Size multiplier, default is 1
}

export enum ConnectionType {
  WIRED = 'wired',
  WIRELESS = 'wireless',
  RJ11 = 'rj11',
  RJ45 = 'rj45',
  FIBER = 'fiber',
  PHONE = 'phone',
  MAIN_CABLE = 'main_cable',
}

export interface Connection {
  id: string;
  sourceId: string;
  targetId: string;
  type: ConnectionType;
  range?: number; // Wireless coverage range in meters, default is 20
}

export interface NetworkDesign {
  devices: Device[];
  connections: Connection[];
  floorPlan: string;
  name: string;
}

export interface FloorPlan {
  id: string;
  name: string;
  src: string;
}

export interface ConnectionMode {
  active: boolean;
  type: ConnectionType | null;
  sourceId: string | null;
}

export type HistoryAction = {
  type: 'ADD_DEVICE' | 'REMOVE_DEVICE' | 'MOVE_DEVICE' | 'ADD_CONNECTION' | 'REMOVE_CONNECTION' | 'CHANGE_FLOOR_PLAN' | 'RENAME_DEVICE' | 'UPDATE_CONNECTION';
  payload: any;
  undo: () => void;
  redo: () => void;
};
