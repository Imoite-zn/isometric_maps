// EnhancedIsometricMap.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Tile, TileTypes } from './types';
import { isoToScreen, screenToIso, calculateDepth } from '../../lib/isoUtils';

const EnhancedIsometricMap: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [selectedTile, setSelectedTile] = useState<Tile | null>(null);
  const [brushType, setBrushType] = useState<string>('grass');
  const [isDrawing, setIsDrawing] = useState<boolean>(false);

  const tileTypes: TileTypes = {
    grass: { color: '#27ae60', height: 0 },
    water: { color: '#3498db', height: -1 },
    mountain: { color: '#7f8c8d', height: 2 },
    sand: { color: '#f1c40f', height: 0 },
    forest: { color: '#2ecc71', height: 1 }
  };

  const mapData = {
    width: 15,
    height: 15,
    tileSize: 64
  };



  // Initialize map
  useEffect(() => {
    const initialTiles: Tile[] = [];
    for (let x = 0; x < mapData.width; x++) {
      for (let y = 0; y < mapData.height; y++) {
        // Create a more interesting terrain
        let type = 'grass';
        const distanceFromCenter = Math.sqrt(
          Math.pow(x - mapData.width / 2, 2) + Math.pow(y - mapData.height / 2, 2)
        );

        if (distanceFromCenter < 3) type = 'mountain';
        else if (distanceFromCenter < 5) type = 'forest';
        else if (Math.random() > 0.7) type = 'water';

        initialTiles.push({
          x,
          y,
          z: tileTypes[type].height,
          type,
          color: tileTypes[type].color
        });
      }
    }
    setTiles(initialTiles);
  }, []);

  // Draw a single tile
  const drawTile = (ctx: CanvasRenderingContext2D, tile: Tile, isSelected: boolean = false): void => {
    const screenPos = isoToScreen(tile.x, tile.y, tile.z, mapData.tileSize, 400, 200);
    const { tileSize } = mapData;

    // Draw shadow for elevated tiles
    if (tile.z > 0) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.moveTo(screenPos.x, screenPos.y + tile.z * 8);
      ctx.lineTo(screenPos.x + tileSize / 2, screenPos.y + tileSize / 4 + tile.z * 8);
      ctx.lineTo(screenPos.x, screenPos.y + tileSize / 2 + tile.z * 8);
      ctx.lineTo(screenPos.x - tileSize / 2, screenPos.y + tileSize / 4 + tile.z * 8);
      ctx.closePath();
      ctx.fill();
    }

    // Draw tile
    ctx.fillStyle = tile.color;
    ctx.strokeStyle = isSelected ? '#ff0000' : '#2c3e50';
    ctx.lineWidth = isSelected ? 3 : 1;

    ctx.beginPath();
    ctx.moveTo(screenPos.x, screenPos.y);
    ctx.lineTo(screenPos.x + tileSize / 2, screenPos.y + tileSize / 4);
    ctx.lineTo(screenPos.x, screenPos.y + tileSize / 2);
    ctx.lineTo(screenPos.x - tileSize / 2, screenPos.y + tileSize / 4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Draw height indicator
    if (tile.z !== 0) {
      ctx.fillStyle = '#fff';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(
        `z:${tile.z}`,
        screenPos.x,
        screenPos.y + tileSize / 2 + 20
      );
    }
  };

  // Draw the entire map
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Sort by depth
    const sortedTiles = [...tiles].sort((a: Tile, b: Tile) => {
      const depthA = a.y + a.x - a.z;
      const depthB = b.y + b.x - b.z;
      return depthA - depthB;
    });

    sortedTiles.forEach((tile: Tile) => {
      const isSelected = selectedTile ? selectedTile.x === tile.x && selectedTile.y === tile.y : false;
      drawTile(ctx, tile, isSelected);
    });
  }, [tiles, selectedTile]);

  // Handle canvas click
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>): void => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const isoCoords = screenToIso(x, y, mapData.tileSize, 400, 200);

    // Find or create tile
    let tile = tiles.find((t: Tile) => t.x === isoCoords.x && t.y === isoCoords.y);

    if (tile) {
      setSelectedTile(tile);
    } else if (isoCoords.x >= 0 && isoCoords.x < mapData.width &&
               isoCoords.y >= 0 && isoCoords.y < mapData.height) {
      const newTile: Tile = {
        x: isoCoords.x,
        y: isoCoords.y,
        z: tileTypes[brushType].height,
        type: brushType,
        color: tileTypes[brushType].color
      };
      setTiles(prev => [...prev, newTile]);
      setSelectedTile(newTile);
    }
  };

  const handleMouseDown = (): void => setIsDrawing(true);
  const handleMouseUp = (): void => setIsDrawing(false);

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>): void => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const isoCoords = screenToIso(x, y, mapData.tileSize, 400, 200);

    if (isoCoords.x >= 0 && isoCoords.x < mapData.width &&
        isoCoords.y >= 0 && isoCoords.y < mapData.height) {

      const existingTileIndex = tiles.findIndex(
        (t: Tile) => t.x === isoCoords.x && t.y === isoCoords.y
      );

      if (existingTileIndex === -1) {
        const newTile: Tile = {
          x: isoCoords.x,
          y: isoCoords.y,
          z: tileTypes[brushType].height,
          type: brushType,
          color: tileTypes[brushType].color
        };
        setTiles(prev => [...prev, newTile]);
      }
    }
  };

  return (
    <div className="isometric-map-container">
      <div className="map-controls">
        <h2>Enhanced Isometric Map Editor</h2>

        <div className="brush-controls">
          <h3>Brush Type:</h3>
          <div className="brush-options">
            {Object.keys(tileTypes).map((type: string) => (
              <button
                key={type}
                className={`brush-option ${brushType === type ? 'active' : ''}`}
                style={{ backgroundColor: tileTypes[type].color }}
                onClick={() => setBrushType(type)}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {selectedTile && (
          <div className="selected-tile-info">
            <h3>Selected: ({selectedTile.x}, {selectedTile.y}) - {selectedTile.type}</h3>
            <p>Height: {selectedTile.z}</p>
          </div>
        )}
      </div>

      <div className="canvas-container">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          onClick={handleCanvasClick}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          className="isometric-canvas"
        />
      </div>
    </div>
  );
};

export default EnhancedIsometricMap;
