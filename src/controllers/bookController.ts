import { Request, Response } from 'express';
import { prisma } from '../prisma';

// 1. GET /books - ดึงหนังสือทั้งหมด พร้อมรายการรีวิว (Nested list of reviews)
export const getAllBooks = async (req: Request, res: Response) => {
  try {
    const books = await prisma.book.findMany({
      include: { reviews: true }
    });
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลหนังสือ" });
  }
};

// 2. GET /books/:id - ดึงหนังสือเล่มเดียวตาม ID พร้อมรายการรีวิว
export const getBookById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const book = await prisma.book.findUnique({
      where: { id },
      include: { reviews: true }
    });

    if (!book) {
      res.status(404).json({ message: "ไม่พบข้อมูลหนังสือ" });
      return;
    }
    res.status(200).json(book);
  } catch (error) {
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลหนังสือ" });
  }
};

// 3. POST /books - เพิ่มหนังสือใหม่
export const createBook = async (req: Request, res: Response) => {
  try {
    const { title, author, publishedAt, coverUrl } = req.body;
    const newBook = await prisma.book.create({
      data: {
        title,
        author,
        ...(publishedAt ? { publishedAt: new Date(publishedAt) } : {}),
        coverUrl: coverUrl ?? null
      },
      include: { reviews: true }
    });
    res.status(201).json(newBook);
  } catch (error) {
    res.status(400).json({ message: "ไม่สามารถสร้างข้อมูลหนังสือได้ กรุณาตรวจสอบข้อมูล" });
  }
};

// 4. PUT /books/:id - แก้ไขข้อมูลหนังสือ
export const updateBook = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const existingBook = await prisma.book.findUnique({ where: { id } });

    if (!existingBook) {
      res.status(404).json({ message: "ไม่พบข้อมูลหนังสือ" });
      return;
    }

    const { title, author, publishedAt, coverUrl } = req.body;
    const updatedBook = await prisma.book.update({
      where: { id },
      data: {
        title: title ?? existingBook.title,
        author: author ?? existingBook.author,
        publishedAt: publishedAt ? new Date(publishedAt) : existingBook.publishedAt,
        coverUrl: coverUrl !== undefined ? coverUrl : existingBook.coverUrl
      },
      include: { reviews: true }
    });

    res.status(200).json(updatedBook);
  } catch (error) {
    res.status(400).json({ message: "ไม่สามารถแก้ไขข้อมูลหนังสือได้" });
  }
};

// 5. DELETE /books/:id - ลบหนังสือ
export const deleteBook = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const existingBook = await prisma.book.findUnique({ where: { id } });

    if (!existingBook) {
      res.status(404).json({ message: "ไม่พบข้อมูลหนังสือ" });
      return;
    }

    await prisma.book.delete({ where: { id } });
    res.status(200).json({ message: "ลบข้อมูลหนังสือสำเร็จ" });
  } catch (error) {
    res.status(500).json({ message: "ไม่สามารถลบข้อมูลหนังสือได้" });
  }
};

// 6. POST /books/:id/reviews (หรือ POST /reviews) - เพิ่มรีวิวให้กับหนังสือ (Practical Exercise ข้อ 3)
export const addReview = async (req: Request, res: Response) => {
  try {
    // รองรับทั้งการส่ง bookId มาจาก URL (/books/:id/reviews) หรือส่งมาใน Body ({ bookId, rating, content })
    const bookId = req.params.id ? parseInt(req.params.id as string) : parseInt(req.body.bookId);
    const { rating, content } = req.body;

    if (!bookId || isNaN(bookId)) {
      res.status(400).json({ message: "กรุณาระบุ bookId" });
      return;
    }

    if (rating === undefined || rating < 1 || rating > 5) {
      res.status(400).json({ message: "คะแนนรีวิว (rating) ต้องอยู่ระหว่าง 1 ถึง 5" });
      return;
    }

    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book) {
      res.status(404).json({ message: "ไม่พบข้อมูลหนังสือที่ต้องการรีวิว" });
      return;
    }

    const newReview = await prisma.review.create({
      data: {
        rating: Number(rating),
        content,
        bookId
      }
    });

    res.status(201).json(newReview);
  } catch (error) {
    res.status(400).json({ message: "ไม่สามารถเพิ่มรีวิวได้" });
  }
};
