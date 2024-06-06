import React from 'react';
import './CsvUploadForm.css';

function CsvUploadForm({ onCsvLoad }) {
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const csvText = event.target.result;
      onCsvLoad(csvText);
    };

    reader.readAsText(file);
  };

  return (
    <div>
      <input type="file" id="csvFileInput" onChange={handleFileChange} style={{ display: 'none' }} />
      <button id="loadCsvButton" onClick={() => document.getElementById("csvFileInput").click()}>Выбрать CSV-файл</button>
    </div>
  );
}

export default CsvUploadForm;