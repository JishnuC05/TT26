import express from 'express';

import { prisma } from '../lib/prisma';
import { protect, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { cartItemSchema } from '../validation/schemas';

const router = express.Router();

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
router.get('/', protect, async (req: AuthRequest, res, next) => {
  try {
    const cart = await prisma.cart.findUnique({
      where: { userId: req.user!.id },
      include: {
        items: {
          include: {
            book: true,
          },
        },
      },
    });

    if (!cart) {
      // Create empty cart if it doesn't exist
      const newCart = await prisma.cart.create({
        data: { userId: req.user!.id },
        include: {
          items: {
            include: {
              book: true,
            },
          },
        },
      });

      return res.json({
        success: true,
        data: {
          items: [],
          totalItems: 0,
          totalPrice: 0,
        },
      });
    }

    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.items.reduce(
      (sum, item) => sum + item.book.price * item.quantity,
      0
    );

    res.json({
      success: true,
      data: {
        items: cart.items,
        totalItems,
        totalPrice,
      },
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
router.post('/', protect, validate(cartItemSchema), async (req: AuthRequest, res, next) => {
  try {
    const { bookId, quantity } = req.body;

    // Check if book exists and has stock
    const book = await prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        error: 'Book not found',
      });
    }

    if (book.stock < quantity) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient stock',
      });
    }

    // Get or create cart
    let cart = await prisma.cart.findUnique({
      where: { userId: req.user!.id },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: req.user!.id },
      });
    }

    // Check if item already exists in cart
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        bookId,
      },
    });

    if (existingItem) {
      // Update quantity
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
    } else {
      // Create new item
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          bookId,
          quantity,
        },
      });
    }

    // Return updated cart
    const updatedCart = await prisma.cart.findUnique({
      where: { userId: req.user!.id },
      include: {
        items: {
          include: {
            book: true,
          },
        },
      },
    });

    const totalItems = updatedCart!.items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = updatedCart!.items.reduce(
      (sum, item) => sum + item.book.price * item.quantity,
      0
    );

    res.json({
      success: true,
      data: {
        items: updatedCart!.items,
        totalItems,
        totalPrice,
      },
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update cart item quantity
// @route   PUT /api/cart/:itemId
// @access  Private
router.put('/:itemId', protect, async (req: AuthRequest, res, next) => {
  try {
    const { quantity } = req.body;

    if (quantity <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Quantity must be positive',
      });
    }

    // Find cart item
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: req.params.itemId as string,
        cart: {
          userId: req.user!.id,
        },
      },
      include: {
        book: true,
      },
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        error: 'Cart item not found',
      });
    }

    // Check stock
    if ((cartItem as any).book.stock < quantity) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient stock',
      });
    }

    // Update quantity
    await prisma.cartItem.update({
      where: { id: req.params.itemId as string },
      data: { quantity },
    });

    // Return updated cart
    const cart = await prisma.cart.findUnique({
      where: { userId: req.user!.id },
      include: {
        items: {
          include: {
            book: true,
          },
        },
      },
    });

    const totalItems = cart!.items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart!.items.reduce(
      (sum, item) => sum + item.book.price * item.quantity,
      0
    );

    res.json({
      success: true,
      data: {
        items: cart!.items,
        totalItems,
        totalPrice,
      },
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Private
router.delete('/:itemId', protect, async (req: AuthRequest, res, next) => {
  try {
    // Find and delete cart item
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: req.params.itemId as string,
        cart: {
          userId: req.user!.id,
        },
      },
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        error: 'Cart item not found',
      });
    }

    await prisma.cartItem.delete({
      where: { id: req.params.itemId as string },
    });

    // Return updated cart
    const cart = await prisma.cart.findUnique({
      where: { userId: req.user!.id },
      include: {
        items: {
          include: {
            book: true,
          },
        },
      },
    });

    const totalItems = cart!.items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart!.items.reduce(
      (sum, item) => sum + item.book.price * item.quantity,
      0
    );

    res.json({
      success: true,
      data: {
        items: cart!.items,
        totalItems,
        totalPrice,
      },
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
router.delete('/', protect, async (req: AuthRequest, res, next) => {
  try {
    const cart = await prisma.cart.findUnique({
      where: { userId: req.user!.id },
    });

    if (cart) {
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
      });
    }

    res.json({
      success: true,
      data: {
        items: [],
        totalItems: 0,
        totalPrice: 0,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;