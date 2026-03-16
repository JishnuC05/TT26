import express from 'express';
import Stripe from 'stripe';

import { prisma } from '../lib/prisma';
import { protect, AuthRequest } from '../middleware/auth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

const router = express.Router();

// @desc    Create payment intent
// @route   POST /api/payments/create-payment-intent
// @access  Private
router.post('/create-payment-intent', protect, async (req: AuthRequest, res, next) => {
  try {
    const { amount, currency = 'usd' } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid amount is required',
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata: {
        userId: req.user!.id,
      },
    });

    res.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      },
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Confirm payment and create order
// @route   POST /api/payments/confirm-payment
// @access  Private
router.post('/confirm-payment', protect, async (req: AuthRequest, res, next) => {
  try {
    const { paymentIntentId, orderData } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        error: 'Payment intent ID is required',
      });
    }

    // Verify payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        success: false,
        error: 'Payment not completed',
      });
    }

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

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { name: true, email: true },
    });

    // Create order in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create order
      const order = await tx.order.create({
        data: {
          userId: req.user!.id,
          userName: user!.name,
          totalPrice,
          status: 'PROCESSING',
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

    res.json({
      success: true,
      data: {
        order: result,
        paymentIntent: {
          id: paymentIntent.id,
          status: paymentIntent.status,
          amount: paymentIntent.amount,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get Stripe publishable key
// @route   GET /api/payments/config
// @access  Public
router.get('/config', (req, res) => {
  res.json({
    success: true,
    data: {
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    },
  });
});

// Webhook endpoint for Stripe events (optional - for production)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'] as string;
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    console.log(`Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('PaymentIntent was successful!', paymentIntent.id);
      // Update order status if needed
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

export default router;