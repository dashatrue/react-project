import React, { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './JsonUploadForm.css';

function JsonUploadForm({ onJsonLoad }) {
  const [fileInputKey, setFileInputKey] = useState(0); // Ключ для перезагрузки input file

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    console.log("Файл выбран", file);

    if (!file) {
      toast.error("Файл не выбран.");
      return;
    }

    // Проверяем тип файла
    if (file.type !== "application/json") {
      toast.error("Пожалуйста, выберите файл в формате JSON.");
      setFileInputKey(prevKey => prevKey + 1);
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const jsonText = event.target.result;
      try {
        const jsonData = JSON.parse(jsonText); // Проверка на корректность JSON
        // Отправка файла на сервер
        const formData = new FormData();
        formData.append('file', file);

        console.log("Тест: обработка файла началась");
        const response = await fetch('/api/upload/', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Не удалось загрузить файл на сервер.");
        }

        const serverResponse = await response.json();
        console.log("Ответ от сервера:", serverResponse);
        toast.success("Файл успешно обработан на сервере.");
        console.log("Сервер успешно обработал файл и передал данные.");
        onJsonLoad(serverResponse); // Передаём обработанные данные
      } catch (error) {
        toast.error("Ошибка: Неверный формат файла или проблема с загрузкой.");
      } finally {
        // Очистка и перезагрузка input file
        setFileInputKey(prevKey => prevKey + 1);
      }
    };

    reader.readAsText(file); // Чтение содержимого файла
  };

  return (
    <div>
      <input key={fileInputKey} type="file" id="jsonFileInput" onChange={handleFileChange} style={{ display: 'none' }} />
      <button id="loadJsonButton" onClick={() => document.getElementById("jsonFileInput").click()}>
        Выбрать JSON-файл
      </button>
      <ToastContainer position="top-center" />
    </div>
  );
}

export default JsonUploadForm;
