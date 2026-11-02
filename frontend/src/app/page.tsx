"use client";

import React, { useEffect, useState } from "react";

/**
 * โครงสร้างข้อมูลรีวิวของหนังสือ
 */
interface Review {
  id: number;
  rating: number;
  content: string;
  bookId: number;
}

/**
 * โครงสร้างข้อมูลหนังสือและรายการรีวิว
 */
interface Book {
  id: number;
  title: string;
  author: string;
  publishedAt: string;
  coverUrl: string | null;
  reviews: Review[];
}

const API_BASE = "http://localhost:3000";

/**
 * คอมโพเนนต์หน้าหลักสำหรับแสดงผลและจัดการข้อมูลคลังหนังสือ (CRUD, อัปโหลดไฟล์ และรีวิว)
 */
export default function BookCatalogPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<string>("");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState<string>("");
  const [author, setAuthor] = useState<string>("");
  const [coverUrl, setCoverUrl] = useState<string>("");
  const [uploading, setUploading] = useState<boolean>(false);

  const [searchId, setSearchId] = useState<string>("");
  const [reviewInputs, setReviewInputs] = useState<{
    [bookId: number]: { rating: number; content: string };
  }>({});

  /**
   * ดึงข้อมูลหนังสือทั้งหมดจาก API (GET /books)
   */
  const fetchBooks = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/books`);
      const data = await res.json();
      setBooks(Array.isArray(data) ? data : []);
    } catch {
      setMessage("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ API (http://localhost:3000) ได้");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  /**
   * ค้นหาข้อมูลหนังสือรายเล่มตามรหัส ID (GET /books/:id)
   */
  const handleSearchById = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) {
      fetchBooks();
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/books/${searchId}`);
      if (res.status === 404) {
        setBooks([]);
        setMessage(`ไม่พบข้อมูลหนังสือรหัส ID: ${searchId} (404 Not Found)`);
      } else if (res.ok) {
        const book = await res.json();
        setBooks([book]);
        setMessage(`พบข้อมูลหนังสือรหัส ID: ${searchId} (200 OK)`);
      }
    } catch {
      setMessage("เกิดข้อผิดพลาดในการดึงข้อมูลหนังสือ");
    } finally {
      setLoading(false);
    }
  };

  /**
   * อัปโหลดไฟล์รูปปกหนังสือไปยังเซิร์ฟเวอร์ (POST /upload)
   */
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage("");
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setCoverUrl(data.url);
        setMessage("อัปโหลดไฟล์รูปปกสำเร็จ");
      } else {
        setMessage("อัปโหลดไฟล์ไม่สำเร็จ");
      }
    } catch {
      setMessage("เกิดข้อผิดพลาดขณะอัปโหลดไฟล์");
    } finally {
      setUploading(false);
    }
  };

  /**
   * บันทึกข้อมูลหนังสือใหม่ (POST /books) หรืออัปเดตข้อมูลหนังสือเดิม (PUT /books/:id)
   */
  const handleSubmitBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !author.trim()) {
      setMessage("กรุณากรอกชื่อหนังสือและผู้แต่งให้ครบถ้วน");
      return;
    }

    try {
      if (editingId !== null) {
        const res = await fetch(`${API_BASE}/books/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            author,
            coverUrl: coverUrl || null,
          }),
        });

        if (res.ok) {
          setMessage(`แก้ไขข้อมูลหนังสือรหัส #${editingId} สำเร็จ (200 OK)`);
          resetForm();
          fetchBooks();
        }
      } else {
        const res = await fetch(`${API_BASE}/books`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            author,
            coverUrl: coverUrl || null,
          }),
        });

        if (res.status === 201) {
          setMessage("เพิ่มข้อมูลหนังสือเล่มใหม่สำเร็จ (201 Created)");
          resetForm();
          fetchBooks();
        }
      }
    } catch {
      setMessage("ไม่สามารถบันทึกข้อมูลหนังสือได้");
    }
  };

  /**
   * นำข้อมูลหนังสือที่เลือกมาแสดงในฟอร์มเพื่อเตรียมแก้ไข
   */
  const startEditBook = (book: Book) => {
    setEditingId(book.id);
    setTitle(book.title);
    setAuthor(book.author);
    setCoverUrl(book.coverUrl || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /**
   * ล้างค่าในฟอร์มกลับเป็นค่าเริ่มต้น
   */
  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setAuthor("");
    setCoverUrl("");
  };

  /**
   * ลบข้อมูลหนังสือตามรหัส ID (DELETE /books/:id)
   */
  const handleDeleteBook = async (id: number) => {
    if (!confirm(`ยืนยันการลบหนังสือรหัส #${id} ใช่หรือไม่?`)) return;

    try {
      const res = await fetch(`${API_BASE}/books/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setMessage(`ลบข้อมูลหนังสือรหัส #${id} สำเร็จ (200 OK)`);
        fetchBooks();
      }
    } catch {
      setMessage("ไม่สามารถลบข้อมูลหนังสือได้");
    }
  };

  /**
   * บันทึกข้อมูลรีวิวใหม่ให้กับหนังสือที่ระบุ (POST /books/:id/reviews)
   */
  const handleAddReview = async (bookId: number) => {
    const input = reviewInputs[bookId] || { rating: 5, content: "" };
    if (!input.content.trim()) {
      setMessage("กรุณากรอกข้อความรีวิวก่อนกดบันทึก");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/books/${bookId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: Number(input.rating),
          content: input.content,
        }),
      });

      if (res.status === 201) {
        setMessage(`เพิ่มรีวิวสำหรับหนังสือรหัส #${bookId} สำเร็จ (201 Created)`);
        setReviewInputs((prev) => ({
          ...prev,
          [bookId]: { rating: 5, content: "" },
        }));
        fetchBooks();
      }
    } catch {
      setMessage("ไม่สามารถบันทึกข้อมูลรีวิวได้");
    }
  };

  return (
    <div className="container">
      <header className="header">
        <div>
          <h1>ระบบจัดการคลังหนังสือและรีวิว (Book Catalog)</h1>
          <p>Next.js Frontend เชื่อมต่อกับ Express.js, Prisma (SQLite) และระบบอัปโหลดไฟล์</p>
        </div>
        <div className="status-badge">จำนวนหนังสือทั้งหมด {books.length} เล่ม</div>
      </header>

      {message && (
        <div
          style={{
            padding: "0.85rem 1.25rem",
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
            borderRadius: "10px",
            marginBottom: "1.5rem",
            color: "#1e40af",
            fontWeight: 600,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>{message}</span>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setMessage("")}
          >
            ปิดข้อความ
          </button>
        </div>
      )}

      <div className="grid-layout">
        <div className="card">
          <h2>
            {editingId
              ? `แก้ไขข้อมูลหนังสือรหัส #${editingId}`
              : "เพิ่มหนังสือเล่มใหม่"}
          </h2>
          <form onSubmit={handleSubmitBook}>
            <div className="form-group">
              <label>ชื่อหนังสือ (Title) *</label>
              <input
                type="text"
                className="form-control"
                placeholder="ระบุชื่อหนังสือ"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>ผู้แต่ง (Author) *</label>
              <input
                type="text"
                className="form-control"
                placeholder="ระบุชื่อผู้แต่ง"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>อัปโหลดรูปปกหนังสือ (File Upload)</label>
              <input
                type="file"
                accept="image/*"
                className="form-control"
                onChange={handleFileUpload}
              />
              {uploading && (
                <small style={{ color: "#2563eb" }}>กำลังอัปโหลดไฟล์...</small>
              )}
            </div>

            <div className="form-group">
              <label>ลิงก์รูปปกหนังสือ (Cover URL)</label>
              <input
                type="text"
                className="form-control"
                placeholder="http://localhost:3000/uploads/..."
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
              />
              {coverUrl && (
                <img
                  src={coverUrl}
                  alt="ตัวอย่างรูปปกหนังสือ"
                  className="preview-img"
                />
              )}
            </div>

            <div style={{ display: "flex", gap: "0.5rem", marginTop: "1.25rem" }}>
              <button type="submit" className="btn btn-primary">
                {editingId ? "บันทึกการแก้ไข (PUT)" : "เพิ่มหนังสือ (POST)"}
              </button>
              {editingId && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={resetForm}
                >
                  ยกเลิก
                </button>
              )}
            </div>
          </form>
        </div>

        <div>
          <div className="card" style={{ marginBottom: "1.5rem" }}>
            <form
              onSubmit={handleSearchById}
              style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}
            >
              <input
                type="number"
                className="form-control"
                placeholder="ค้นหาหนังสือด้วยรหัส ID (เช่น 1)"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
              />
              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: "auto", whiteSpace: "nowrap" }}
              >
                ค้นหาตาม ID
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setSearchId("");
                  fetchBooks();
                }}
              >
                แสดงทั้งหมด
              </button>
            </form>
          </div>

          {loading ? (
            <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
              กำลังโหลดข้อมูลหนังสือ...
            </div>
          ) : books.length === 0 ? (
            <div
              className="card"
              style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}
            >
              ยังไม่มีข้อมูลหนังสือในระบบ กรุณาเพิ่มหนังสือเล่มใหม่จากฟอร์มด้านซ้าย
            </div>
          ) : (
            <div className="books-grid">
              {books.map((book) => {
                const revInput = reviewInputs[book.id] || {
                  rating: 5,
                  content: "",
                };
                return (
                  <div key={book.id} className="book-card">
                    {book.coverUrl ? (
                      <img
                        src={book.coverUrl}
                        alt={book.title}
                        className="book-cover"
                      />
                    ) : (
                      <div className="book-cover">ไม่มีรูปปกหนังสือ</div>
                    )}

                    <div className="book-body">
                      <div className="book-title">
                        รหัส #{book.id} - {book.title}
                      </div>
                      <div className="book-meta">
                        ผู้แต่ง: <strong>{book.author}</strong>
                        <br />
                        วันที่บันทึก:{" "}
                        {new Date(book.publishedAt).toLocaleDateString("th-TH")}
                      </div>

                      <div className="book-actions">
                        <button
                          className="btn btn-warning btn-sm"
                          onClick={() => startEditBook(book)}
                        >
                          แก้ไข
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteBook(book.id)}
                        >
                          ลบ
                        </button>
                      </div>

                      <div className="reviews-section">
                        <div className="reviews-title">
                          รายการรีวิว ({book.reviews?.length || 0})
                        </div>

                        {book.reviews && book.reviews.length > 0 ? (
                          book.reviews.map((rev) => (
                            <div key={rev.id} className="review-item">
                              <span className="rating-stars">
                                คะแนน {rev.rating}/5:
                              </span>
                              <span>{rev.content}</span>
                            </div>
                          ))
                        ) : (
                          <div
                            style={{
                              fontSize: "0.82rem",
                              color: "#94a3b8",
                              marginBottom: "0.5rem",
                            }}
                          >
                            ยังไม่มีรีวิวสำหรับหนังสือเล่มนี้
                          </div>
                        )}

                        <div className="review-form">
                          <select
                            className="form-control"
                            style={{ width: "95px", padding: "0.4rem" }}
                            value={revInput.rating}
                            onChange={(e) =>
                              setReviewInputs((prev) => ({
                                ...prev,
                                [book.id]: {
                                  ...revInput,
                                  rating: Number(e.target.value),
                                },
                              }))
                            }
                          >
                            <option value={5}>5 คะแนน</option>
                            <option value={4}>4 คะแนน</option>
                            <option value={3}>3 คะแนน</option>
                            <option value={2}>2 คะแนน</option>
                            <option value={1}>1 คะแนน</option>
                          </select>
                          <input
                            type="text"
                            className="form-control"
                            style={{ padding: "0.4rem 0.6rem" }}
                            placeholder="เขียนความคิดเห็นรีวิว..."
                            value={revInput.content}
                            onChange={(e) =>
                              setReviewInputs((prev) => ({
                                ...prev,
                                [book.id]: {
                                  ...revInput,
                                  content: e.target.value,
                                },
                              }))
                            }
                          />
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            style={{ width: "auto" }}
                            onClick={() => handleAddReview(book.id)}
                          >
                            ส่งรีวิว
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
