import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import bookRoutes from './routes/bookRoutes';
import { addReview } from './controllers/bookController';

const app: Application = express();
const port = 3000;

// สร้างโฟลเดอร์ uploads อัตโนมัติหากยังไม่มี
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ตั้งค่า Multer สำหรับจัดเก็บไฟล์รูปปกหนังสือที่อัปโหลด
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `cover-${uniqueSuffix}${ext}`);
  }
});
const upload = multer({ storage });

app.use(cors());
app.use(express.json());
// เปิดให้เข้าถึงไฟล์รูปภาพที่อัปโหลดผ่าน URL /uploads/...
app.use('/uploads', express.static(uploadDir));

// Endpoint สำหรับอัปโหลดไฟล์รูปภาพปกหนังสือ
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
