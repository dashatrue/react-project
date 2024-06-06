import { useEffect, useState } from 'react';
import './ScaleIndicator.css';

const ScaleIndicator = ({ view, initialScale }) => {
  const [currentScale, setCurrentScale] = useState(initialScale || 146000000);
  const [isInitialScaleSet, setIsInitialScaleSet] = useState(false);

  useEffect(() => {
    const scaleElement = document.getElementById('scaleValue');

    function updateScaleValue(scale) {
      scaleElement.innerText = `Текущий масштаб: 1:${Math.round(scale)}`;
    }

    // Отслеживаем изменения масштаба
    const scaleWatcher = view.watch('scale', function(newValue) {
      setCurrentScale(newValue);
      updateScaleValue(newValue);
    });

    // Отслеживаем начальный масштаб
    const initialScaleWatcher = view.watch('scale', function(newValue) {
      if (!initialScale) {
        setCurrentScale(newValue);
      } else if (!isInitialScaleSet) {
        setCurrentScale(initialScale);
        setIsInitialScaleSet(true);
      }
    });

    // Очищаем слежение при размонтировании компонента
    return () => {
      if (scaleElement) {
        scaleWatcher.remove();
        initialScaleWatcher.remove();
      }
    };
  }, [view, initialScale, isInitialScaleSet]);

  return (
    <div id="scaleValue">
      {isInitialScaleSet ? `Текущий масштаб: 1:${Math.round(currentScale)}` : 'Ожидание начального масштаба...'}
    </div>
  );
};

export default ScaleIndicator;
