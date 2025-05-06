import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export async function exportDiagramAsImage(stageRef: any, filename: string = "network_diagram"): Promise<void> {
  if (!stageRef.current) return;

  const stage = stageRef.current;
  const dataURL = stage.toDataURL({ pixelRatio: 2 });
  
  // Create a temporary link element and trigger a download
  const link = document.createElement('a');
  link.download = `${filename}.png`;
  link.href = dataURL;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function exportDiagramAsPDF(stageRef: any, filename: string = "network_diagram"): Promise<void> {
  // This would require adding a PDF library dependency
  // For now, we'll just export as PNG
  await exportDiagramAsImage(stageRef, filename);
}

// Import floor plan assets
import smallApartmentSrc from '../assets/floorplans/small-apartment.svg';
import largeHouseSrc from '../assets/floorplans/large-house.svg';
import officeSpaceSrc from '../assets/floorplans/office-space.svg';
import schoolBuildingSrc from '../assets/floorplans/school-building.svg';

export const DEFAULT_FLOOR_PLANS = [
  {
    id: 'small-apartment',
    name: 'Small Apartment',
    src: smallApartmentSrc,
  },
  {
    id: 'large-house',
    name: 'Large House',
    src: largeHouseSrc,
  },
  {
    id: 'office-space',
    name: 'Office Space',
    src: officeSpaceSrc,
  },
  {
    id: 'school-building',
    name: 'School Building',
    src: schoolBuildingSrc,
  },
];

export const DEVICE_TYPES = [
  { id: 'router', name: 'Router', icon: 'router' },
  { id: 'modem', name: 'Modem', icon: 'router' },
  { id: 'switch', name: 'Switch', icon: 'device_hub' },
  { id: 'access_point', name: 'Access Point', icon: 'wifi' },
  { id: 'repeater', name: 'Repeater', icon: 'signal_cellular_alt' },
  { id: 'isp', name: 'ISP', icon: 'cloud' },
  { id: 'computer', name: 'Computer', icon: 'computer' },
  { id: 'laptop', name: 'Laptop', icon: 'laptop' },
  { id: 'smartphone', name: 'Smartphone', icon: 'smartphone' },
  { id: 'tablet', name: 'Tablet', icon: 'tablet' },
  { id: 'printer', name: 'Printer', icon: 'print' },
  { id: 'tv', name: 'Smart TV', icon: 'tv' },
];
