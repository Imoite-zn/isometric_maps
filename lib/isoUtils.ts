// isoUtils.ts
import { ScreenPosition, IsoCoordinates } from '../components/isometric/types';

/**
 * Convert isometric coordinates to screen coordinates
 * @param x - Isometric x coordinate
 * @param y - Isometric y coordinate
 * @param z - Isometric z coordinate (height)
 * @param tileSize - Size of each tile
 * @param offsetX - Screen offset X (for centering)
 * @param offsetY - Screen offset Y (for centering)
 * @returns Screen position
 */
export const isoToScreen = (
  x: number,
  y: number,
  z: number = 0,
  tileSize: number = 64,
  offsetX: number = 0,
  offsetY: number = 0
): ScreenPosition => {
  const screenX = (x - y) * tileSize / 2 + offsetX;
  const screenY = (x + y) * tileSize / 4 - z * tileSize / 4 + offsetY;
  return { x: screenX, y: screenY };
};

/**
 * Convert screen coordinates to isometric coordinates
 * @param screenX - Screen x coordinate
 * @param screenY - Screen y coordinate
 * @param tileSize - Size of each tile
 * @param offsetX - Screen offset X (for centering)
 * @param offsetY - Screen offset Y (for centering)
 * @returns Isometric coordinates
 */
export const screenToIso = (
  screenX: number,
  screenY: number,
  tileSize: number = 64,
  offsetX: number = 0,
  offsetY: number = 0
): IsoCoordinates => {
  const relativeX = screenX - offsetX;
  const relativeY = screenY - offsetY;
  const x = (relativeX / (tileSize / 2) + relativeY / (tileSize / 4)) / 2;
  const y = (relativeY / (tileSize / 4) - relativeX / (tileSize / 2)) / 2;
  return { x: Math.round(x), y: Math.round(y) };
};

/**
 * Calculate the depth of a tile for proper isometric rendering
 * @param x - Isometric x coordinate
 * @param y - Isometric y coordinate
 * @param z - Isometric z coordinate (height)
 * @returns Depth value for sorting
 */
export const calculateDepth = (x: number, y: number, z: number = 0): number => {
  return y + x - z;
};

/**
 * Check if coordinates are within map bounds
 * @param x - X coordinate
 * @param y - Y coordinate
 * @param width - Map width
 * @param height - Map height
 * @returns True if coordinates are within bounds
 */
export const isWithinBounds = (x: number, y: number, width: number, height: number): boolean => {
  return x >= 0 && x < width && y >= 0 && y < height;
};

/**
 * Calculate distance between two points
 * @param x1 - First point x
 * @param y1 - First point y
 * @param x2 - Second point x
 * @param y2 - Second point y
 * @returns Distance between points
 */
export const calculateDistance = (x1: number, y1: number, x2: number, y2: number): number => {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
};
