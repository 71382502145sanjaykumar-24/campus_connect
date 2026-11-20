import { db } from '../firebaseAdmin';
import { LibraryBookRecord, BookTransactionRecord } from '../types/schema';
import { AuditService } from './auditService';

export class LibraryService {
  private static booksCollection = db.collection('library_books');
  private static txCollection = db.collection('book_transactions');

  /**
   * Issue a book to a student with an atomic transaction that decrements available copies.
   */
  static async issueBook(params: {
    bookId: string;
    studentId: string;
    issuedByStaffId: string;
    durationDays?: number;
  }): Promise<BookTransactionRecord> {
    const bookRef = this.booksCollection.doc(params.bookId);
    const txRef = this.txCollection.doc();

    const now = new Date();
    const dueDate = new Date(now.getTime() + (params.durationDays || 14) * 86400000);

    const txRecord = await db.runTransaction(async (transaction) => {
      const bookSnap = await transaction.get(bookRef);
      if (!bookSnap.exists) {
        throw new Error(`Library Error: Book with ID '${params.bookId}' does not exist.`);
      }

      const book = bookSnap.data() as LibraryBookRecord;
      if (book.availableCopies <= 0) {
        throw new Error(`Library Error: No copies of "${book.bookTitle}" currently available for circulation.`);
      }

      const txData: BookTransactionRecord = {
        transactionId: txRef.id,
        bookId: params.bookId,
        studentId: params.studentId,
        issuedByStaffId: params.issuedByStaffId,
        issueDate: now.toISOString(),
        dueDate: dueDate.toISOString(),
        fineAmount: 0,
        transactionStatus: 'Issued',
      };

      transaction.update(bookRef, {
        availableCopies: book.availableCopies - 1,
        updatedAt: now.toISOString(),
      });

      transaction.set(txRef, txData);
      return txData;
    });

    await AuditService.recordLog({
      userId: params.issuedByStaffId,
      userRole: 'Librarian',
      actionType: 'BOOK_CIRCULATION',
      collectionName: 'book_transactions',
      documentId: txRef.id,
      updatedData: { action: 'ISSUE', bookId: params.bookId, studentId: params.studentId },
    });

    return txRecord;
  }

  /**
   * Return an issued book and restore available copy count.
   */
  static async returnBook(transactionId: string, staffId: string): Promise<BookTransactionRecord> {
    const txRef = this.txCollection.doc(transactionId);
    const now = new Date();

    const updatedTx = await db.runTransaction(async (transaction) => {
      const txSnap = await transaction.get(txRef);
      if (!txSnap.exists) {
        throw new Error(`Transaction with ID '${transactionId}' not found.`);
      }

      const txData = txSnap.data() as BookTransactionRecord;
      if (txData.transactionStatus === 'Returned') {
        throw new Error(`Book was already marked as Returned on ${txData.returnDate}.`);
      }

      const bookRef = this.booksCollection.doc(txData.bookId);
      const bookSnap = await transaction.get(bookRef);

      if (bookSnap.exists) {
        const book = bookSnap.data() as LibraryBookRecord;
        transaction.update(bookRef, {
          availableCopies: Math.min(book.totalCopies, book.availableCopies + 1),
          updatedAt: now.toISOString(),
        });
      }

      // Calculate fine if overdue
      let fine = 0;
      const due = new Date(txData.dueDate);
      if (now > due) {
        const overdueDays = Math.ceil((now.getTime() - due.getTime()) / 86400000);
        fine = overdueDays * 2; // Rs. 2 per day overdue
      }

      const finalRecord: BookTransactionRecord = {
        ...txData,
        returnDate: now.toISOString(),
        fineAmount: fine,
        transactionStatus: 'Returned',
      };

      transaction.update(txRef, {
        returnDate: finalRecord.returnDate,
        fineAmount: fine,
        transactionStatus: 'Returned',
      });

      return finalRecord;
    });

    await AuditService.recordLog({
      userId: staffId,
      userRole: 'Librarian',
      actionType: 'BOOK_CIRCULATION',
      collectionName: 'book_transactions',
      documentId: transactionId,
      updatedData: { action: 'RETURN', returnDate: now.toISOString() },
    });

    return updatedTx;
  }
}
