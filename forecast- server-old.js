// forecast-server.js
const express = require('express');
const axios = require('axios');
const Jimp = require('jimp'); // สำหรับประมวลผลภาพ
const app = express();
const PORT = 3000;

// ความแรงของฝนตามสีในภาพเรดาร์
const rainIntensityFromColor = (r, g, b) => {
  if (r > 200 && g < 50 && b < 50) return 'หนักมาก'; // แดง
  if (r > 200 && g > 100 && b < 50) return 'หนัก';    // ส้ม
  if (r > 200 && g > 200 && b < 100) return 'ปานกลาง'; // เหลือง
  if (g > 100 && r < 100 && b < 100) return 'เบา';    // เขียว
  return 'ไม่มีฝน';
};

app.get('/forecast', async (req, res) => {
  try {
    // สมมุติ URL ของภาพเรดาร์ (ตัวอย่าง 2 เฟรมล่าสุด)
    const frames = [
      'https://weather.bangkok.go.th/radar/image/NK/RadarImg_1.png',
      'https://weather.bangkok.go.th/radar/image/NK/RadarImg_2.png'
    ];

    const images = await Promise.all(frames.map(url => Jimp.read(url)));

    const width = images[0].getWidth();
    const height = images[0].getHeight();

    // ตรวจสอบพิกัดตรงกลาง (หรือจะระบุพิกัดเองก็ได้)
    const x = Math.floor(width / 2);
    const y = Math.floor(height / 2);

    const [r1, g1, b1] = Jimp.intToRGBA(images[0].getPixelColor(x, y));
    const [r2, g2, b2] = Jimp.intToRGBA(images[1].getPixelColor(x, y));

    const intensity = rainIntensityFromColor(r2, g2, b2);

    // ตรวจสอบการเคลื่อนที่ของฝน (อย่างง่าย)
    const rainMoved = Jimp.intToRGBA(images[0].getPixelColor(x, y)).r !== Jimp.intToRGBA(images[1].getPixelColor(x, y)).r;

    res.json({
      ตำแหน่ง: { x, y },
      ความแรงฝน: intensity,
      ฝนเคลื่อนที่หรือไม่: rainMoved ? 'ฝนกำลังเคลื่อน' : 'ฝนคงที่',
      ความถี่ข้อมูล: 'ทุก 5 นาที',
      หมายเหตุ: 'ระบบประมวลผลจากศูนย์กลางภาพเรดาร์ หากต้องการปักหมุด ให้ระบุตำแหน่ง x, y ที่ต้องการ'
    });

  } catch (err) {
    res.status(500).json({ error: 'ไม่สามารถโหลดภาพเรดาร์ได้', details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Forecast server is running at http://localhost:${PORT}`);
});
