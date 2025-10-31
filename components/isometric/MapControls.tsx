// MapControls.tsx
import React from 'react';

interface MapControlsProps {
  mapWidth: number;
  mapHeight: number;
  tileSize: number;
  onWidthChange: (width: number) => void;
  onHeightChange: (height: number) => void;
  onTileSizeChange: (tileSize: number) => void;
}

const MapControls: React.FC<MapControlsProps> = ({
  mapWidth,
  mapHeight,
  tileSize,
  onWidthChange,
  onHeightChange,
  onTileSizeChange
}) => {
  return (
    <div className="map-controls">
      <h2>Map Controls</h2>
      <div className="control-group">
        <label>
          Map Width:
          <input
            type="number"
            value={mapWidth}
            onChange={(e) => onWidthChange(parseInt(e.target.value) || 10)}
            min="1"
            max="50"
          />
        </label>
        <label>
          Map Height:
          <input
            type="number"
            value={mapHeight}
            onChange={(e) => onHeightChange(parseInt(e.target.value) || 10)}
            min="1"
            max="50"
          />
        </label>
        <label>
          Tile Size:
          <input
            type="number"
            value={tileSize}
            onChange={(e) => onTileSizeChange(parseInt(e.target.value) || 64)}
            min="16"
            max="128"
          />
        </label>
      </div>
    </div>
  );
};

export default MapControls;
