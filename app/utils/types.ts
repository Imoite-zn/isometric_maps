// types.ts
export interface Tile {
  x: number;
  y: number;
  z: number;
  type: string;
  color: string;
}

export interface MapData {
  width: number;
  height: number;
  tileSize: number;
}

export interface ScreenPosition {
  x: number;
  y: number;
}

export interface IsoCoordinates {
  x: number;
  y: number;
}

export interface TileType {
  color: string;
  height: number;
}

export interface TileTypes {
  [key: string]: TileType;
}