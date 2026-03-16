import express from 'express';

import { prisma } from '../lib/prisma';
import { protect, authorize, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { orderSchema, updateOrderStatusSchema } from '../validation/schemas';

const router = express.Router();

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
router.get('/', protect, async (req: AuthRequest, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        userId: req.user!.role === 'ADMIN' ? undefined : req.user!.id,
      },
      include: {
        items: {
          include: {
            book: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
router.get('/:id', protect, async (req: AuthRequest, res, next) => {
  try {
    const order = await prisma.order.findFirst({
      where: {
        id: req.params.id as string,
        ...(req.user!.role !== 'ADMIN' && { userId: req.user!.id }),
      },
      include: {
        items: {
          include: {
            book: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found',
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create order
// @route   POST /api/orders
// @access  Private
router.post('/', protect, validate(orderSchema), async (req: AuthRequest, res, next) => {
  try {
    const { items } = req.body;

    // Get user cart
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

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Cart is empty',
      });
    }

    // Validate stock and calculate total
    let totalPrice = 0;
    const orderItems: any[] = [];

    for (const cartItem of cart.items) {
      if (cartItem.book.stock < cartItem.quantity) {
        return res.status(400).json({
          success: false,
          error: `Insufficient stock for ${cartItem.book.title}`,
        });
      }

      orderItems.push({
        bookId: cartItem.bookId,
        quantity: cartItem.quantity,
        price: cartItem.book.price,
      });

      totalPrice += cartItem.book.price * cartItem.quantity;
    }

    // Create order in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create order
      const order = await tx.order.create({
        data: {
          userId: req.user!.id,
          userName: req.user!.email, // We'll update this with actual name later
          totalPrice,
          items: {
            create: orderItems,
          },
        },
        include: {
          items: {
            include: {
              book: true,
            },
          },
        },
      });

      // Update book stock
      for (const item of orderItems) {
        await tx.book.update({
          where: { id: item.bookId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      // Clear cart
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return order;
    });

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
router.put(
  '/:id/status',
  protect,
  authorize('ADMIN'),
  validate(updateOrderStatusSchema),
  async (req: AuthRequest, res, next) => {
    try {
      const { status } = req.body;

      const order = await prisma.order.findUnique({
        where: { id: req.params.id as string },
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          error: 'Order not found',
        });
      }

      const updatedOrder = await prisma.order.update({
        where: { id: req.params.id as string },
        data: { status },
        include: {
          items: {
            include: {
              book: true,
            },
          },
        },
      });

      res.json({
        success: true,
        data: updatedOrder,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;