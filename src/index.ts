import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import bookRoutes from './routes/bookRoutes';
import { addReview } from './controllers/bookController';

const app: Application = express();
const port = 3000;

// ตรวจสอบและสร้างโฟลเดอร์สำหรับจัดเก็บไฟล์อัปโหลด
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ตั้งค่าการจัดเก็บไฟล์และรูปแบบชื่อไฟล์ด้วย Multer
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `cover-${uniqueSuffix}${ext}`);
  }
});
const upload = multer({ storage });

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadDir));

/**
 * อัปโหลดไฟล์รูปภาพปกหนังสือและส่งคืน URL ของไฟล์
 * @route POST /upload
 */
app.post('/upload', upload.single('file'), (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ message: 'กรุณาเลือกไฟล์ที่ต้องการอัปโหลด' });
    return;
  }

  const fileUrl = `http://localhost:${port}/uploads/${req.file.filename}`;
  res.status(201).json({ url: fileUrl, filename: req.file.filename });
});

app.use('/books', bookRoutes);
app.post('/reviews', addReview);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
