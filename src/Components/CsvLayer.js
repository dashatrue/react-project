import { useState, useEffect, useRef } from 'react';
import { loadModules } from 'esri-loader';
import CsvUploadForm from './CsvUploadForm';

const CsvLayer = ({ map }) => {
  const csvLayerRef = useRef(null);
  const [csvText, setCsvText] = useState(null);

  const handleCsvLoad = (text) => {
    setCsvText(text);
    };

  useEffect(() => {
    const fetchCsv = () => {
      fetch('data:text/csv;charset=utf-8,' + encodeURIComponent(csvText))
        .then(response => response.text())
        .then(processCsv)
        .catch(error => console.error('Error fetching CSV:', error));
    };

    const processCsv = csvText => {
      try {
        if (csvLayerRef.current) {
          map.remove(csvLayerRef.current);
          csvLayerRef.current = null;
        }

      loadModules(['esri/layers/CSVLayer'], { css: true })
        .then(([CSVLayer]) => {
          // Parse CSV
          const csvData = csvText.split('\n').map(row => row.split(','));
          const headers = csvData.shift();
          const processedCsvData = [];

          // Process longitude values
          for (let i = 0; i < csvData.length; i++) {
            let long = parseFloat(csvData[i][0]);
            let aurora = parseFloat(csvData[i][1]);

            if (aurora !== 0) {
              if (long >= 180) {
                long = (-1)*(360 - long);
              }

              csvData[i][0] = long.toString(); // Update the value in the array
              csvData[i][1] = aurora.toString();
              processedCsvData.push(csvData[i]);
            }
          }

          // Create CSV string from processed data
          let processedCsvText = headers.join(',') + '\n';
          processedCsvText += processedCsvData.map(row => row.join(',')).join('\n');
          console.log('Processed CSV Text:', processedCsvText); 

          const renderer = {
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
          };

          csvLayerRef.current = new CSVLayer({
            url: URL.createObjectURL(new Blob([processedCsvText], { type: 'text/csv' })),
            delimiter: ',',
            title: "Вероятность появления полярного сияния",
            renderer: renderer,
            labelsVisible: true,
            popupTemplate: {
              title: "Вероятность",
              content: "Вероятность полярного сияния в точке с координатами [{lat}; {long}] = {aurora}",
              fieldInfos: [
                {
                  fieldName: "aurora",
                  format: {
                    digitSeparator: true,
                    places: 0
                  }
                }
              ]
            },
            labelingInfo: [
              {
                symbol: {
                  type: "text",
                  color: "white",
                  font: {
                    family: "Noto Sans",
                    size: 8
                  },
                  haloColor: "#472b77",
                  haloSize: 0.75
                },
                labelPlacement: "center-left",
                labelExpressionInfo: {
                  expression: "Text($feature.mag, '#.0')"
                },
                where: "aurora > 1"
              }
            ]
          });

          map.add(csvLayerRef.current);
        })
        .catch(error => console.error('Error loading CSVLayer:', error));
      }
      catch (error) {
        console.error('Error processing CSV:', error);
      }
    };

    if (csvText) {
      fetchCsv();
    }

    return () => {
      if (csvLayerRef.current) {
        map.remove(csvLayerRef.current);
        csvLayerRef.current = null;
      }
    };
  }, [csvText, map]);

return (
    <div>
      <CsvUploadForm onCsvLoad={handleCsvLoad} />
    </div>
  )
}

export default CsvLayer;