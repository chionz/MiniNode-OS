document.addEventListener("DOMContentLoaded", () => {
  const recycleBin = document.getElementById('recycleBin');
  const browserHome = document.getElementById('browserHome');
  makeDraggable(recycleBin);

  recycleBin.addEventListener('dblclick', () => openWindow('recycleBinWindow'));
  browserHome.addEventListener('dblclick', () => openWindow('browserWindow'));
});

document.addEventListener("DOMContentLoaded", () => {
  const browserHome = document.getElementById('browserHome');
  makeDraggable(browserHome);

  browserHome.addEventListener('dblclick', () => openWindow('browserWindow'));
});