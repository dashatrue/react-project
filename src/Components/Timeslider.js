import React, { useEffect, useState, useMemo } from 'react';
import { loadModules } from 'esri-loader';

const Timeslider = ({ map, view }) => {
  const jsonFileUrls = useMemo(() => [
    'https://raw.githubusercontent.com/dashatrue/timeslider_data/main/ovation_aurora_latest.json',
    'https://raw.githubusercontent.com/dashatrue/timeslider_data/main/ovation_aurora_latest(1).json',
    'https://raw.githubusercontent.com/dashatrue/timeslider_data/main/ovation_aurora_latest(2).json',
    'https://raw.githubusercontent.com/dashatrue/timeslider_data/main/ovation_aurora_latest(3).json',
  ], []);

  const [currentFileIndex] = useState(0); // setCurrentFileIndex удалён, так как не используется
  const [timeSlider, setTimeSlider] = useState(null);

  useEffect(() => {
    if (!map || !view) return;

    let heatmapLayer;

    const loadFile = async (url) => {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Ошибка загрузки JSON: ${response.statusText}`);
        const data = await response.json();
        const timestamp = new Date(data['Observation Time']).getTime();

        return {
          features: data.coordinates.map(([longitude, latitude, aurora], index) => ({
            geometry: { type: 'point', longitude, latitude },
            attributes: { aurora, timestamp, id: index },
          })),
          timestamp,
        };
      } catch (error) {
        console.error(`Ошибка загрузки ${url}:`, error);
        return { features: [], timestamp: null };
      }
    };

    loadModules(['esri/widgets/TimeSlider', 'esri/layers/FeatureLayer'])
      .then(async ([TimeSlider, FeatureLayer]) => {
        const { features, timestamp } = await loadFile(jsonFileUrls[currentFileIndex]);
        if (features.length === 0) return;

        map.layers.removeAll();

        heatmapLayer = new FeatureLayer({
          source: features,
          objectIdField: 'id',
          fields: [
            { name: 'id', type: 'oid' },
            { name: 'aurora', type: 'double' },
            { name: 'timestamp', type: 'date' },
          ],
          renderer: {
            type: 'heatmap',
            field: 'aurora',
            colorStops: [
              { color: 'rgba(0, 0, 255, 0)', ratio: 0 },
              { color: 'rgba(0, 255, 255, 0.5)', ratio: 0.5 },
              { color: 'rgba(0, 255, 0, 0.8)', ratio: 0.8 },
              { color: 'rgba(255, 0, 0, 1)', ratio: 1 },
            ],
          },
          timeInfo: { startField: 'timestamp' },
        });

        map.add(heatmapLayer);

        if (!timeSlider) {
          console.log('Создание TimeSlider...');
          const newTimeSlider = new TimeSlider({
            container: 'timeSliderDiv',
            view,
            mode: 'instant',
            stops: { interval: { value: 1, unit: 'hours' } },
            fullTimeExtent: { start: new Date(timestamp), end: new Date(timestamp) },
            values: [new Date(timestamp)],
          });

          setTimeSlider(newTimeSlider);
          view.ui.add(newTimeSlider, 'bottom-right');
        } else {
          console.log('Обновление TimeSlider...');
          timeSlider.fullTimeExtent = { start: new Date(timestamp), end: new Date(timestamp) };
          timeSlider.values = [new Date(timestamp)];
        }
      })
      .catch(error => console.error('Ошибка загрузки ArcGIS модулей:', error));

    return () => {
      if (timeSlider) {
        console.log('Удаление TimeSlider...');
        view.ui.remove(timeSlider);
      }
    };
  }, [map, view, currentFileIndex, jsonFileUrls, timeSlider]); // timeSlider добавлен в зависимости

  return <div id="timeSliderDiv" style={{ position: 'absolute', bottom: '10px', right: '10px', zIndex: 10 }} />;
};

export default Timeslider;
