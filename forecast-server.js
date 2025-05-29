const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

let trackedPoint = null;

const radarColors = [
  { color: 'red', level: 'หนักมาก', value: 4 },
  { color: 'orange', level: 'หนัก', value: 3 },
  { color: 'yellow', level: 'ปานกลาง', value: 2 },
  { color: 'green', level: 'เบา', value: 1 }
];

function simulateForecastFor(point) {
  const now = new Date();
  const randomMinutes = Math.floor(Math.random() * 30) + 5;
  const arrival = new Date(now.getTime() + randomMinutes * 60000);
  const rainStrength = radarColors[Math.floor(Math.random() * radarColors.length)];

  return {
    location: point,
    rain_level: rainStrength.level,
    color: rainStrength.color,
    expected_arrival: arrival.toISOString(),
    minutes_until_arrival: randomMinutes
  };
}

app.post('/track', (req, res) => {
  const { lat, lng } = req.body;
  if (!lat || !lng) {
    return res.status(400).json({ error: 'Missing coordinates' });
  }

  trackedPoint = { lat, lng };
  return res.json({ message: 'Tracking updated', point: trackedPoint });
});

app.get('/forecast', (req, res) => {
  if (!trackedPoint) {
    return res.status(400).json({ error: 'No tracked location' });
  }

  const forecast = simulateForecastFor(trackedPoint);
  return res.json(forecast);
});

app.listen(PORT, () => {
  console.log(`Forecast server running on port ${PORT}`);
});