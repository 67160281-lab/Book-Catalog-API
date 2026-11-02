/**
 * โครงสร้างข้อมูลรีวิวหนังสือ
 */
export interface Review {
  id: number;
  rating: number;
  content: string;
  bookId: number;
}

/**
 * โครงสร้างข้อมูลหนังสือและรายการรีวิวที่เกี่ยวข้อง
 */
export interface Book {
  id: number;
  title: string;
  author: string;
  publishedAt: Date;
  coverUrl?: string | null;
  reviews?: Review[];
}
