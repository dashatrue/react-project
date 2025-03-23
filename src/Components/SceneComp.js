import React, { useEffect, useRef, useState } from 'react';
import { loadModules } from 'esri-loader';
import GridLines from './GridLines';
import PoleSwitcher from './PoleSwitcher';
import ScaleIndicator from './ScaleIndicator';
import JsonLayer from './JsonLayer';
import Timeslider from './Timeslider';

function SceneComp() {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [view, setView] = useState(null);

  useEffect(() => {
    loadModules(
      ['esri/Map', 'esri/views/SceneView', 'esri/layers/CSVLayer', 'esri/layers/GeoJSONLayer', 'esri/widgets/Legend', 'esri/widgets/Search'],
      { css: true }
    ).then(([Map, SceneView, CSVLayer, GeoJSONLayer, Legend, Search]) => {
      const map = new Map({
        basemap: 'satellite',
        ground: 'world-elevation',
      });

      const view = new SceneView({
        container: mapRef.current,
        map: map,
        scale: 146000000,
        center: [81.5, 59.14],
        constraints: {
          minScale: 10000000,
          maxScale: 10000000,
        },
      });

      setMap(map);
      setView(view);

      view.ui.add(new Legend({ view }), 'bottom-left');

      const searchWidget = new Search({
        view: view,
        autoNavigate: false,
      });

      searchWidget.on('select-result', (event) => {
        const result = event.result;
        if (result) {
          const coordinates = result.feature.geometry;
          result.name = `${result.name} (Coordinates: ${coordinates.latitude.toFixed(0)}, ${coordinates.longitude.toFixed(0)})`;
        }
      });

      view.ui.add(searchWidget, { position: 'top-right' });

      // Load CSV Layer directly
      const csvLayer = new CSVLayer({
        url: 'https://raw.githubusercontent.com/dashatrue/data/main/observatory.csv', 
        renderer: {
          type: 'simple',
          symbol: {
            type: 'simple-marker',
            color: 'orange',
            size: 4,
          },
        },
        popupTemplate: {
          title: '{Название_обсерватории}',
          content: '{Name} <p> Координаты: [{Latitude}, {Longitude}]',
        },
        legendEnabled: false,
      });

      map.add(csvLayer);

      // Load GeoJSON Layer directly from GitHub
      const geoJsonLayer = new GeoJSONLayer({
        url: 'https://raw.githubusercontent.com/dashatrue/jsondata/main/Electric_Power_Transmission1.json',
        renderer: {
          type: 'simple', 
          symbol: {
            type: 'simple-line',
            color: '#FF6347',
            width: 0.4,
          },
        },
        legendEnabled: false,
      });

      geoJsonLayer.on("layerview-create-error", function(event) {
        console.error("Failed to create layer view: ", event.error);
      });

      map.add(geoJsonLayer);

    }).catch(err => console.error('ArcGIS modules failed to load:', err));
  }, []);

  return (
    <div ref={mapRef} style={{ width: '100%', height: '100vh' }}>
      {map && <GridLines map={map} />}
      {view && <PoleSwitcher view={view} />}
      {map && view && <Timeslider view={view} map={map} />}
      {map && view && <JsonLayer map={map} view={view} />}
      {view && <ScaleIndicator view={view} />}
    </div>
  );
}

export default SceneComp;
