import { Router } from 'express';
import {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  addReview
} from '../controllers/bookController';

const router = Router();

// กำหนดเส้นทาง API สำหรับจัดการข้อมูลหนังสือและรีวิว
router.get('/', getAllBooks);
router.get('/:id', getBookById);
router.post('/', createBook);
router.put('/:id', updateBook);
router.delete('/:id', deleteBook);
router.post('/:id/reviews', addReview);

export default router;
