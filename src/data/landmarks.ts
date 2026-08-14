export interface LandmarkData {
  id: string;
  name: string;
  type: 'tech_lab' | 'security_lab' | 'library' | 'home' | 'station' | 'bridge';
  projectId?: string;     // Refers to content.json
  experienceId?: string;  // Refers to content.json
  x: number;
  z: number;
  w: number;
  d: number;
  floors: number;
  face: 'x-' | 'x+' | 'z-' | 'z+';
  roofKind: 'flat' | 'gable' | 'hip' | 'hipped';
  wall?: number;
}

export const WORLD_LANDMARKS: Record<string, LandmarkData> = {
  bridge: {
    id: 'bridge',
    name: 'Canal Bridge',
    type: 'bridge',
    x: -10, z: 0, w: 1, d: 1, floors: 0, face: 'x+', roofKind: 'flat'
  },
  techLab: {
    id: 'techLab',
    name: 'Tech Lab',
    type: 'tech_lab',
    projectId: 'projects',
    x: 15, z: -15, w: 12, d: 10, floors: 2, face: 'z+', roofKind: 'flat', wall: 7 // blue
  },
  securityLab: {
    id: 'securityLab',
    name: 'Security Lab',
    type: 'security_lab',
    projectId: 'security',
    x: -23, z: -15, w: 14, d: 8, floors: 1, face: 'z+', roofKind: 'flat', wall: 8 // dark
  },
  station: {
    id: 'station',
    name: 'Station',
    type: 'station',
    projectId: 'experience',
    x: -20, z: 0, w: 18, d: 8, floors: 1, face: 'x+', roofKind: 'gable', wall: 1
  },
  library: {
    id: 'library',
    name: 'Library',
    type: 'library',
    projectId: 'education',
    x: 20, z: 0, w: 14, d: 14, floors: 2, face: 'x-', roofKind: 'flat', wall: 4 // cream
  },
  home: {
    id: 'home',
    name: 'Home',
    type: 'home',
    projectId: 'home',
    x: 15, z: 15, w: 8, d: 8, floors: 2, face: 'z-', roofKind: 'hipped', wall: 2
  }
};
