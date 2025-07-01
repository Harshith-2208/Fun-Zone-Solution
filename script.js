const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let drawing = false;
let points = [];

const centerX = canvas.width / 2;
const centerY = canvas.height / 2;

function drawCenterPoint() {
  ctx.beginPath();
  ctx.arc(centerX, centerY, 4, 0, 2 * Math.PI);
  ctx.fillStyle = 'red';
  ctx.fill();
}

function getBestScore() {
  return parseFloat(sessionStorage.getItem('bestScore')) || 0;
}

function updateBestScore(newScore) {
  const best = getBestScore();
  if (newScore > best) {
    sessionStorage.setItem('bestScore', newScore);
  }
  document.getElementById('bestScore').innerText = `Best Score: ${getBestScore().toFixed(1)}%`;
}

canvas.addEventListener('mousedown', (e) => {
  drawing = true;
  points = [];
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawCenterPoint();
  ctx.beginPath();
  ctx.strokeStyle = 'green';
  ctx.lineWidth = 10;

  const { offsetX, offsetY } = e;
  ctx.moveTo(offsetX, offsetY);
  points.push([offsetX, offsetY]);
});


canvas.addEventListener('mousemove', (e) => {
  if (!drawing) return;
  const { offsetX, offsetY } = e;
  ctx.lineTo(offsetX, offsetY);
  ctx.stroke();
  points.push([offsetX, offsetY]);
});

canvas.addEventListener('mouseup', () => {
  drawing = false;
  evaluateCircle();
});

canvas.addEventListener('mouseleave', () => {
  if (drawing) {
    drawing = false;
    evaluateCircle();
  }
});


function evaluateCircle() {
  if (points.length < 10) {
    document.getElementById('score').innerText = 'Draw a full circle!';
    return;
  }

  const centerInside = isPointInPolygon(centerX, centerY, points);
  if (!centerInside) {
    document.getElementById('score').innerText =
      'Invalid circle!';
    return;
  }

  let radii = points.map(([x, y]) => Math.hypot(x - centerX, y - centerY));
  let avgRadius = radii.reduce((a, b) => a + b, 0) / radii.length;
  let variance = radii.reduce((sum, r) => sum + Math.abs(r - avgRadius), 0) / radii.length;

  let score = Math.max(0, 100 - variance);
  document.getElementById('score').innerText = `Circle Score: ${score.toFixed(1)}%`;
  updateBestScore(score);
}

function isPointInPolygon(x, y, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];

    const intersect = ((yi > y) !== (yj > y)) &&
                      (x < (xj - xi) * (y - yi) / (yj - yi + 0.00001) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}



function reset() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  document.getElementById('score').innerText = 'Draw around the center dot!';
  drawCenterPoint();
}


drawCenterPoint();
updateBestScore(0);
