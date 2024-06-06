import { useEffect } from 'react';
import './PoleSwitcher.css'

const PoleSwitcher = ({ view }) => {
  const switchToNorthPole = () => {
    view.center = [0, 90]
  };

  const switchToSouthPole = () => {
    view.center = [0, -90];
  };

  useEffect(() => {
    const northPoleButton = document.getElementById("northPoleButton");
    const southPoleButton = document.getElementById("southPoleButton");

    northPoleButton.addEventListener("click", switchToNorthPole);
    southPoleButton.addEventListener("click", switchToSouthPole);

    return () => {
      northPoleButton.removeEventListener("click", switchToNorthPole);
      southPoleButton.removeEventListener("click", switchToSouthPole);
    };
  }, [view]);

  return (
    <div>
      <button id="northPoleButton">С↑</button>
      <button id="southPoleButton">Ю↓</button>
    </div>
  );
};

export default PoleSwitcher;