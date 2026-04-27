document.addEventListener('DOMContentLoaded', () => {
  const recycleBin = document.getElementById('recycleBin');
  const browserHome = document.getElementById('browserHome');

  if (recycleBin) {
    recycleBin.addEventListener('dblclick', () => openWindow('recycleBinWindow'));
  }

  if (browserHome) {
    browserHome.addEventListener('dblclick', () => openWindow('browserWindow'));
  }
});
