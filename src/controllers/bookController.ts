import { Request, Response } from 'express';
import { prisma } from '../prisma';

/**
 * ดึงข้อมูลหนังสือทั้งหมดพร้อมรายการรีวิวของหนังสือแต่ละเล่ม
 * @route GET /books
 */
export const getAllBooks = async (_req: Request, res: Response) => {
  try {
    const books = await prisma.book.findMany({
      include: { reviews: true }
    });
    res.status(200).json(books);
  } catch {
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลหนังสือ' });
  }
};

/**
 * ดึงข้อมูลหนังสือรายเล่มตามรหัส ID พร้อมรายการรีวิว
 * @route GET /books/:id
 */
export const getBookById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    const book = await prisma.book.findUnique({
      where: { id },
      include: { reviews: true }
    });

    if (!book) {
      res.status(404).json({ message: 'ไม่พบข้อมูลหนังสือ' });
      return;
    }

    res.status(200).json(book);
  } catch {
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลหนังสือ' });
  }
};

/**
 * สร้างข้อมูลหนังสือเล่มใหม่ลงในฐานข้อมูล
 * @route POST /books
 */
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
  } catch {
    res.status(400).json({ message: 'ไม่สามารถสร้างข้อมูลหนังสือได้ กรุณาตรวจสอบข้อมูล' });
  }
};

/**
 * แก้ไขข้อมูลหนังสือตามรหัส ID
 * @route PUT /books/:id
 */
export const updateBook = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    const existingBook = await prisma.book.findUnique({ where: { id } });

    if (!existingBook) {
      res.status(404).json({ message: 'ไม่พบข้อมูลหนังสือ' });
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
  } catch {
    res.status(400).json({ message: 'ไม่สามารถแก้ไขข้อมูลหนังสือได้' });
  }
};

/**
 * ลบข้อมูลหนังสือตามรหัส ID
 * @route DELETE /books/:id
 */
export const deleteBook = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    const existingBook = await prisma.book.findUnique({ where: { id } });

    if (!existingBook) {
      res.status(404).json({ message: 'ไม่พบข้อมูลหนังสือ' });
      return;
    }

    await prisma.book.delete({ where: { id } });
    res.status(200).json({ message: 'ลบข้อมูลหนังสือสำเร็จ' });
  } catch {
    res.status(500).json({ message: 'ไม่สามารถลบข้อมูลหนังสือได้' });
  }
};

/**
 * เพิ่มข้อมูลรีวิวให้กับหนังสือตามรหัสหนังสือที่ระบุ
 * @route POST /books/:id/reviews หรือ POST /reviews
 */
export const addReview = async (req: Request, res: Response) => {
  try {
    const bookId = req.params.id
      ? parseInt(req.params.id as string, 10)
      : parseInt(req.body.bookId, 10);
    const { rating, content } = req.body;

    if (!bookId || isNaN(bookId)) {
      res.status(400).json({ message: 'กรุณาระบุรหัสหนังสือ (bookId)' });
      return;
    }

    if (rating === undefined || rating < 1 || rating > 5) {
      res.status(400).json({ message: 'คะแนนรีวิวต้องอยู่ระหว่าง 1 ถึง 5' });
      return;
    }

    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book) {
      res.status(404).json({ message: 'ไม่พบข้อมูลหนังสือที่ต้องการรีวิว' });
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
  } catch {
    res.status(400).json({ message: 'ไม่สามารถเพิ่มรีวิวได้' });
  }
};
