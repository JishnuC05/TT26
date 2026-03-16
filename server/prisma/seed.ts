import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@bookstore.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@bookstore.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  // Create regular user
  const userPassword = await bcrypt.hash('user123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'user@bookstore.com' },
    update: {},
    create: {
      name: 'Jane Reader',
      email: 'user@bookstore.com',
      password: userPassword,
      role: 'USER',
    },
  });

  // Create sample books
  const books = [
    {
      title: 'The Midnight Library',
      author: 'Matt Haig',
      price: 14.99,
      category: 'FICTION',
      cover: 'https://picsum.photos/seed/book1/300/420',
      description: 'A novel about choices and second chances',
      stock: 42,
      isbn: '978-0525559474',
      pages: 288,
      publishedYear: 2020,
    },
    {
      title: 'Atomic Habits',
      author: 'James Clear',
      price: 16.99,
      category: 'SELF_HELP',
      cover: 'https://picsum.photos/seed/book2/300/420',
      description: 'How to build good habits and break bad ones',
      stock: 87,
      isbn: '978-0735211292',
      pages: 320,
      publishedYear: 2018,
    },
  ];

  for (const bookData of books) {
    await prisma.book.upsert({
      where: { isbn: bookData.isbn },
      update: {},
      create: bookData,
    });
  }

  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });