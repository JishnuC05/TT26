import express from 'express';

import { prisma } from '../lib/prisma';
import { protect, authorize, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { bookSchema, updateBookSchema } from '../validation/schemas';

const router = express.Router();

// @desc    Get all books
// @route   GET /api/books
// @access  Public
router.get('/', async (req, res, next) => {
  try {
    const {
      search,
      category,
      sort = 'title',
      page = '1',
      limit = '12',
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { author: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (category && category !== 'All') {
      where.category = category;
    }

    // Build order by
    let orderBy: any = { title: 'asc' };
    switch (sort) {
      case 'price-asc':
        orderBy = { price: 'asc' };
        break;
      case 'price-desc':
        orderBy = { price: 'desc' };
        break;
      case 'rating':
        orderBy = { rating: 'desc' };
        break;
      case 'title':
        orderBy = { title: 'asc' };
        break;
    }

    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where,
        orderBy,
        skip,
        take: limitNum,
      }),
      prisma.book.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        books,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get single book
// @route   GET /api/books/:id
// @access  Public
router.get('/:id', async (req, res, next) => {
  try {
    const book = await prisma.book.findUnique({
      where: { id: req.params.id },
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        error: 'Book not found',
      });
    }

    res.json({
      success: true,
      data: book,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create book
// @route   POST /api/books
// @access  Private/Admin
router.post(
  '/',
  protect,
  authorize('ADMIN'),
  validate(bookSchema),
  async (req: AuthRequest, res, next) => {
    try {
      const book = await prisma.book.create({
        data: req.body,
      });

      res.status(201).json({
        success: true,
        data: book,
      });
    } catch (error) {
      next(error);
    }
  }
);

// @desc    Update book
// @route   PUT /api/books/:id
// @access  Private/Admin
router.put(
  '/:id',
  protect,
  authorize('ADMIN'),
  validate(updateBookSchema),
  async (req: AuthRequest, res, next) => {
    try {
      const book = await prisma.book.findUnique({
        where: { id: req.params.id as string },
      });

      if (!book) {
        return res.status(404).json({
          success: false,
          error: 'Book not found',
        });
      }

      const updatedBook = await prisma.book.update({
        where: { id: req.params.id as string },
        data: req.body,
      });

      res.json({
        success: true,
        data: updatedBook,
      });
    } catch (error) {
      next(error);
    }
  }
);

// @desc    Delete book
// @route   DELETE /api/books/:id
// @access  Private/Admin
router.delete('/:id', protect, authorize('ADMIN'), async (req: AuthRequest, res, next) => {
  try {
    const book = await prisma.book.findUnique({
      where: { id: req.params.id as string },
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        error: 'Book not found',
      });
    }

    await prisma.book.delete({
      where: { id: req.params.id as string },
    });

    res.json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get book categories
// @route   GET /api/books/categories/list
// @access  Public
router.get('/categories/list', async (req, res, next) => {
  try {
    const categories = await prisma.book.groupBy({
      by: ['category'],
      _count: {
        category: true,
      },
    });

    const categoryList = categories.map((cat) => ({
      name: cat.category,
      count: cat._count.category,
    }));

    res.json({
      success: true,
      data: categoryList,
    });
  } catch (error) {
    next(error);
  }
});

export default router;