document.addEventListener("DOMContentLoaded", () => {
  const recycleBin = document.getElementById('recycleBin');
  makeDraggable(recycleBin);

  recycleBin.addEventListener('dblclick', () => openWindow('recycleBinWindow'));
});
