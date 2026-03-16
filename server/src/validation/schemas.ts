import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please provide a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Please provide a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export const bookSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  author: z.string().min(1, 'Author is required'),
  price: z.number().positive('Price must be positive'),
  category: z.string().min(1, 'Category is required'),
  cover: z.string().url('Cover must be a valid URL'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  stock: z.number().int().min(0, 'Stock cannot be negative'),
  isbn: z.string().min(1, 'ISBN is required'),
  pages: z.number().int().positive('Pages must be positive'),
  publishedYear: z.number().int().min(1000).max(new Date().getFullYear()),
});

export const updateBookSchema = bookSchema.partial();

export const cartItemSchema = z.object({
  bookId: z.string().min(1, 'Book ID is required'),
  quantity: z.number().int().positive('Quantity must be positive'),
});

export const orderSchema = z.object({
  items: z.array(z.object({
    bookId: z.string(),
    quantity: z.number().int().positive(),
  })).min(1, 'Order must have at least one item'),
});

export const updateOrderStatusSchema = z.object({
  status: z.string().min(1, 'Status is required'),
});