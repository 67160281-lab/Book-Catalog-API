import express, { Application } from 'express';
import bookRoutes from './routes/bookRoutes';
import { addReview } from './controllers/bookController';

const app: Application = express();
const port = 3000;

app.use(express.json());

app.use('/books', bookRoutes);
// รองรับ POST /reviews เผื่อกรณีส่ง bookId ใน JSON body
app.post('/reviews', addReview);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
