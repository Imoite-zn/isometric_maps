// IsometricMap.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Tile, MapData } from './types';
import { isoToScreen, screenToIso, calculateDepth } from '../../lib/isoUtils';

const IsometricMap: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [selectedTile, setSelectedTile] = useState<Tile | null>(null);
  const [mapData, setMapData] = useState<MapData>({
    width: 10,
    height: 10,
    tileSize: 64
  });



  // Initialize the map with some sample tiles
  useEffect(() => {
    const initialTiles: Tile[] = [];
    for (let x = 0; x < mapData.width; x++) {
      for (let y = 0; y < mapData.height; y++) {
        initialTiles.push({
          x,
          y,
          z: 0,
          type: 'grass',
          color: `hsl(${120 + (x + y) * 2}, 60%, 50%)`
        });
      }
    }
    setTiles(initialTiles);
  }, [mapData.width, mapData.height]);

  // Draw the isometric map
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Sort tiles by depth (y + x for proper isometric rendering)
    const sortedTiles = [...tiles].sort((a: Tile, b: Tile) => {
      const depthA = a.y + a.x;
      const depthB = b.y + b.x;
      return depthA - depthB;
    });

    sortedTiles.forEach((tile: Tile) => {
      const screenPos = isoToScreen(tile.x, tile.y, tile.z, mapData.tileSize);

      // Draw tile base
      ctx.fillStyle = tile.color;
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 1;

      ctx.beginPath();
      ctx.moveTo(screenPos.x, screenPos.y);
      ctx.lineTo(screenPos.x + mapData.tileSize / 2, screenPos.y + mapData.tileSize / 4);
      ctx.lineTo(screenPos.x, screenPos.y + mapData.tileSize / 2);
      ctx.lineTo(screenPos.x - mapData.tileSize / 2, screenPos.y + mapData.tileSize / 4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Draw tile info
      ctx.fillStyle = '#fff';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(
        `${tile.x},${tile.y}`,
        screenPos.x,
        screenPos.y + mapData.tileSize / 2 + 15
      );
    });

    // Highlight selected tile
    if (selectedTile) {
      const screenPos = isoToScreen(selectedTile.x, selectedTile.y, selectedTile.z, mapData.tileSize);

      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 3;

      ctx.beginPath();
      ctx.moveTo(screenPos.x, screenPos.y);
      ctx.lineTo(screenPos.x + mapData.tileSize / 2, screenPos.y + mapData.tileSize / 4);
      ctx.lineTo(screenPos.x, screenPos.y + mapData.tileSize / 2);
      ctx.lineTo(screenPos.x - mapData.tileSize / 2, screenPos.y + mapData.tileSize / 4);
      ctx.closePath();
      ctx.stroke();
    }
  }, [tiles, selectedTile, mapData]);

  // Handle canvas click
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const isoCoords = screenToIso(
      x - canvas.width / 2,
      y - canvas.height / 4,
      mapData.tileSize
    );

    const clickedTile = tiles.find(
      (tile: Tile) => tile.x === isoCoords.x && tile.y === isoCoords.y
    );

    setSelectedTile(clickedTile || null);
  };

  // Add a new tile
  const addTile = (x: number, y: number, type: string = 'grass'): void => {
    const newTile: Tile = {
      x,
      y,
      z: 0,
      type,
      color: `hsl(${Math.random() * 360}, 60%, 50%)`
    };
    setTiles(prev => [...prev, newTile]);
  };

  // Remove a tile
  const removeTile = (x: number, y: number): void => {
    setTiles(prev => prev.filter((tile: Tile) => !(tile.x === x && tile.y === y)));
  };

  // Handle input changes
  const handleInputChange = (field: keyof MapData, value: string): void => {
    const numValue = parseInt(value) || 10;
    setMapData(prev => ({
      ...prev,
      [field]: field === 'tileSize' ? Math.max(16, numValue) : Math.max(1, numValue)
    }));
  };

  return (
    <div className="isometric-map-container">
      <div className="map-controls">
        <h2>Isometric Map Editor</h2>
        <div className="control-group">
          <label>
            Map Width:
            <input
              type="number"
              value={mapData.width}
              onChange={(e) => handleInputChange('width', e.target.value)}
              min="1"
              max="50"
            />
          </label>
          <label>
            Map Height:
            <input
              type="number"
              value={mapData.height}
              onChange={(e) => handleInputChange('height', e.target.value)}
              min="1"
              max="50"
            />
          </label>
          <label>
            Tile Size:
            <input
              type="number"
              value={mapData.tileSize}
              onChange={(e) => handleInputChange('tileSize', e.target.value)}
              min="16"
              max="128"
            />
          </label>
        </div>

        {selectedTile && (
          <div className="selected-tile-info">
            <h3>Selected Tile: ({selectedTile.x}, {selectedTile.y})</h3>
            <button onClick={() => removeTile(selectedTile.x, selectedTile.y)}>
              Remove Tile
            </button>
            <button onClick={() => addTile(selectedTile.x + 1, selectedTile.y)}>
              Add Tile to Right
            </button>
          </div>
        )}
      </div>

      <div className="canvas-container">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          onClick={handleCanvasClick}
          className="isometric-canvas"
        />
      </div>
    </div>
  );
};

export default IsometricMap;
