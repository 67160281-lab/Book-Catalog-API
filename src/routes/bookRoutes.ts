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

router.get('/', getAllBooks);
router.get('/:id', getBookById);
router.post('/', createBook);
router.put('/:id', updateBook);
router.delete('/:id', deleteBook);

// Endpoint สำหรับเพิ่มรีวิวให้หนังสือเล่มนั้นๆ (POST /books/:id/reviews)
router.post('/:id/reviews', addReview);

export default router;
