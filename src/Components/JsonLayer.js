import { useState, useEffect, useRef } from 'react';
import { loadModules } from 'esri-loader';
import JsonUploadForm from './JsonUploadForm';

const JsonLayer = ({ map }) => {
  console.log("JsonLayer компонент загружен и выполняется");
  const geoJsonLayerRef = useRef(null);
  const [jsonText, setJsonText] = useState(null);

  const handleJsonLoad = (text) => {
    setJsonText(text);
  };

  useEffect(() => {
    const processJson = jsonData => {
      if (geoJsonLayerRef.current) {
        map.remove(geoJsonLayerRef.current);
        geoJsonLayerRef.current = null;
      }

      loadModules(['esri/layers/GeoJSONLayer'], { css: true })
        .then(([GeoJSONLayer]) => {
          const processedCoordinates = jsonData.coordinates
            .filter(coord => coord[2] !== 0)
            .map(coord => {
              let long = coord[0];
              if (long >= 180) {
                long = (-1) * (360 - long);
              }
              return [long, coord[1], coord[2]];
            });

          const geoJson = {
            type: "FeatureCollection",
            features: processedCoordinates.map(coord => ({
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: [coord[0], coord[1]]
              },
              properties: {
                aurora: coord[2],
                longitude: coord[0],
                latitude: coord[1]
              }
            }))
          };

          const blob = new Blob([JSON.stringify(geoJson)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);

          geoJsonLayerRef.current = new GeoJSONLayer({
            url: url,
            title: "Вероятность полярного сияния",
            renderer: {
              type: "heatmap",
              field: "aurora",
              colorStops: [
                { ratio: 0, color: "rgba(0, 0, 205, 0)" },
                { ratio: 0.08, color: "rgba(50, 205, 50, 1)" },
                { ratio: 0.1, color: "rgba(186, 252, 5, 1)" },
                { ratio: 0.2, color: "rgba(255, 140, 0, 1)" },
                { ratio: 0.5, color: "rgba(255, 49, 57, 1)" },
                { ratio: 1, color: "rgba(178, 34, 34, 1)" }
              ],
              minDensity: 0,
              maxDensity: 1,
              radius: 30
            },
            legendEnabled: true,
            popupTemplate: {
              title: "Вероятность полярного сияния",
              content: "Вероятность полярного сияния в точке с координатами [{longitude}; {latitude}] = {aurora}",
              fieldInfos: [
                {
                  fieldName: "aurora",
                  format: {
                    digitSeparator: true,
                    places: 0
                  }
                },
                {
                  fieldName: "longitude",
                  format: {
                    digitSeparator: true,
                    places: 0
                  }
                },
                {
                  fieldName: "latitude",
                  format: {
                    digitSeparator: true,
                    places: 0
                  }
                }
              ]
            }
          });

          map.add(geoJsonLayerRef.current);
        })
        .catch(error => console.error('Error loading GeoJSONLayer:', error));
    };

    if (jsonText) {
      try {
        const jsonData = JSON.parse(jsonText);
        processJson(jsonData);
      } catch (error) {
        console.error('Error parsing JSON:', error);
      }
    }

    return () => {
      if (geoJsonLayerRef.current) {
        map.remove(geoJsonLayerRef.current);
        geoJsonLayerRef.current = null;
      }
    };
  }, [jsonText, map]);

  return (
    <div>
      <JsonUploadForm onJsonLoad={handleJsonLoad} />
    </div>
  );
};

export default JsonLayer;
