import React, { useRef, useEffect } from 'react';
import { loadModules } from 'esri-loader';

const GridLines = ({ map }) => {
  const gridLayerRef = useRef(null);

  useEffect(() => {
    loadModules(['esri/layers/GraphicsLayer', 'esri/Graphic', 'esri/geometry/Polyline']).then(([GraphicsLayer, Graphic, Polyline]) => {
      const gridLayer = new GraphicsLayer();
      map.add(gridLayer);
      gridLayerRef.current = gridLayer;

      // Создание и добавление линий долготы
      for (let i = -180; i <= 180; i += 20) {
        const longitudeLine = new Polyline({
          paths: [[
            [i, -90],
            [i, 90]
          ]],
          spatialReference: {
            wkid: 4326
          }
        });

        const lineGraphic = new Graphic({
          geometry: longitudeLine,
          symbol: {
            type: "simple-line",
            color: [169, 169, 169],
            width: 1
          }
        });

        gridLayer.add(lineGraphic);
      }

      // Создание и добавление линий широты
      for (let j = -90; j <= 90; j += 10) {
        const latitudeLine = new Polyline({
          paths: [[
            [-180, j],
            [180, j]
          ]],
          spatialReference: {
            wkid: 4326
          }
        });

        const lineGraphic = new Graphic({
          geometry: latitudeLine,
          symbol: {
            type: "simple-line",
            color: [169, 169, 169],
            width: 1
          }
        });

        gridLayer.add(lineGraphic);
      }
    }).catch(error => {
      console.error('Error loading modules:', error);
    });

    return () => {
      if (gridLayerRef.current) {
        map.remove(gridLayerRef.current);
      }
    };
  }, [map]);

  return null;
};

export default GridLines;