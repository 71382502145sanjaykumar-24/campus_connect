import { Router, Response } from 'express';
import prisma from '../db';
import { authenticateToken, authorizeRoles, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /api/library/books - Search, category filter
router.get('/books', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { search, category } = req.query;
    const where: any = {};

    if (category && category !== 'ALL') {
      where.category = category as string;
    }

    if (search) {
      where.OR = [
        { title: { contains: search as string } },
        { author: { contains: search as string } },
        { isbn: { contains: search as string } },
      ];
    }

    const books = await prisma.libraryBook.findMany({
      where,
      orderBy: { title: 'asc' },
    });

    res.json(books);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch library books', error: error.message });
  }
});

// POST /api/library/books
router.post('/books', authenticateToken, authorizeRoles('ADMIN', 'STAFF'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { title, author, isbn, category, totalCopies, shelfLocation } = req.body;

    if (!title || !author || !isbn || !category || !shelfLocation) {
      res.status(400).json({ message: 'Title, author, ISBN, category, and shelf location are required' });
      return;
    }

    const copies = totalCopies ? parseInt(totalCopies) : 5;

    const book = await prisma.libraryBook.create({
      data: {
        title: String(title),
        author: String(author),
        isbn: String(isbn).trim(),
        category: String(category),
        totalCopies: copies,
        availableCopies: copies,
        shelfLocation: String(shelfLocation),
      },
    });

    res.status(201).json(book);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to add library book', error: error.message });
  }
});

// PUT /api/library/books/:id
router.put('/books/:id', authenticateToken, authorizeRoles('ADMIN', 'STAFF'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { title, author, isbn, category, totalCopies, availableCopies, shelfLocation } = req.body;

    const updated = await prisma.libraryBook.update({
      where: { id },
      data: {
        title: title ? String(title) : undefined,
        author: author ? String(author) : undefined,
        isbn: isbn ? String(isbn).trim() : undefined,
        category: category ? String(category) : undefined,
        totalCopies: totalCopies !== undefined ? parseInt(totalCopies) : undefined,
        availableCopies: availableCopies !== undefined ? parseInt(availableCopies) : undefined,
        shelfLocation: shelfLocation ? String(shelfLocation) : undefined,
      },
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to update library book', error: error.message });
  }
});

// DELETE /api/library/books/:id
router.delete('/books/:id', authenticateToken, authorizeRoles('ADMIN', 'STAFF'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    await prisma.libraryBook.delete({ where: { id } });
    res.json({ message: 'Book deleted from catalog' });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to delete book', error: error.message });
  }
});

// GET /api/library/issues
router.get('/issues', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { studentId, status } = req.query;
    const where: any = {};

    if (studentId) {
      where.studentId = studentId as string;
    } else if (req.user?.role === 'STUDENT' && req.user.studentId) {
      where.studentId = req.user.studentId;
    }

    if (status && status !== 'ALL') {
      where.status = status as string;
    }

    const issues = await prisma.bookIssue.findMany({
      where,
      include: {
        book: true,
        student: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
      },
      orderBy: { issueDate: 'desc' },
    });

    res.json(issues);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch book issues', error: error.message });
  }
});

// POST /api/library/issues - Issue book to student
router.post('/issues', authenticateToken, authorizeRoles('ADMIN', 'STAFF'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { bookId, studentId, dueDate } = req.body;

    if (!bookId || !studentId || !dueDate) {
      res.status(400).json({ message: 'bookId, studentId, and dueDate are required' });
      return;
    }

    const book = await prisma.libraryBook.findUnique({ where: { id: String(bookId) } });
    if (!book) {
      res.status(404).json({ message: 'Book not found' });
      return;
    }

    if (book.availableCopies <= 0) {
      res.status(400).json({ message: 'No copies currently available for issue' });
      return;
    }

    const [issue] = await prisma.$transaction([
      prisma.bookIssue.create({
        data: {
          bookId: String(bookId),
          studentId: String(studentId),
          dueDate: new Date(dueDate),
          issuedByStaffId: req.user?.id ? String(req.user.id) : null,
          status: 'ISSUED',
        },
        include: {
          book: true,
          student: { include: { user: true } },
        },
      }),
      prisma.libraryBook.update({
        where: { id: String(bookId) },
        data: { availableCopies: { decrement: 1 } },
      }),
    ]);

    res.status(201).json(issue);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to issue book', error: error.message });
  }
});

// POST /api/library/issues/:id/return - Return book
router.post('/issues/:id/return', authenticateToken, authorizeRoles('ADMIN', 'STAFF'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { fineAmount = 0 } = req.body;

    const issue = await prisma.bookIssue.findUnique({ where: { id } });
    if (!issue) {
      res.status(404).json({ message: 'Issue record not found' });
      return;
    }

    if (issue.status === 'RETURNED') {
      res.status(400).json({ message: 'This book has already been returned' });
      return;
    }

    const [updated] = await prisma.$transaction([
      prisma.bookIssue.update({
        where: { id },
        data: {
          status: 'RETURNED',
          returnDate: new Date(),
          fineAmount: parseFloat(fineAmount),
        },
        include: { book: true, student: { include: { user: true } } },
      }),
      prisma.libraryBook.update({
        where: { id: issue.bookId },
        data: { availableCopies: { increment: 1 } },
      }),
    ]);

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to process return', error: error.message });
  }
});

export default router;
