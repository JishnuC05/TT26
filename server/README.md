# BookWave Backend API

A comprehensive REST API for the BookWave bookstore application built with Node.js, Express, TypeScript, and Prisma.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Book Management**: Full CRUD operations for books with search and filtering
- **Shopping Cart**: Persistent cart management with stock validation
- **Order Processing**: Complete order lifecycle with status tracking
- **Payment Integration**: Stripe payment processing
- **Database**: SQLite with Prisma ORM (easily switchable to PostgreSQL)
- **Validation**: Zod schema validation for all inputs
- **Security**: Helmet, CORS, rate limiting, input sanitization
- **Error Handling**: Comprehensive error handling with proper HTTP status codes

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: SQLite (via Prisma)
- **ORM**: Prisma
- **Authentication**: JWT
- **Validation**: Zod
- **Payments**: Stripe
- **Security**: Helmet, CORS, express-rate-limit
- **Password Hashing**: bcryptjs

## 📦 Installation

1. **Navigate to server directory**
   ```bash
   cd server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up database**
   ```bash
   # Generate Prisma client
   npm run db:generate

   # Push schema to database
   npm run db:push

   # Seed database with sample data
   npm run db:seed
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## 🗄️ Database Setup

The application uses SQLite for development. To switch to PostgreSQL for production:

1. Update `DATABASE_URL` in `.env`
2. Change `provider` in `prisma/schema.prisma` to `"postgresql"`
3. Run `npm run db:push`

## 🔐 Environment Variables

```env
# Database
DATABASE_URL="file:./dev.db"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# Server
PORT=5000
NODE_ENV="development"

# CORS
FRONTEND_URL="http://localhost:5173"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

## 📋 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Books
- `GET /api/books` - Get all books (with filtering/search)
- `GET /api/books/:id` - Get single book
- `POST /api/books` - Create book (Admin only)
- `PUT /api/books/:id` - Update book (Admin only)
- `DELETE /api/books/:id` - Delete book (Admin only)
- `GET /api/books/categories/list` - Get categories with counts

### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:itemId` - Update cart item quantity
- `DELETE /api/cart/:itemId` - Remove item from cart
- `DELETE /api/cart` - Clear cart

### Orders
- `GET /api/orders` - Get user orders (Admin sees all)
- `GET /api/orders/:id` - Get single order
- `POST /api/orders` - Create order from cart
- `PUT /api/orders/:id/status` - Update order status (Admin only)

### Payments
- `POST /api/payments/create-payment-intent` - Create Stripe payment intent
- `POST /api/payments/confirm-payment` - Confirm payment and create order
- `GET /api/payments/config` - Get Stripe publishable key

## 🔑 Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 📊 Sample Data

The database is seeded with:
- **Admin user**: `admin@bookstore.com` / `admin123`
- **Regular user**: `user@bookstore.com` / `user123`
- **12 sample books** across different categories
- **Sample order** for testing

## 🧪 Testing the API

### Using cURL

```bash
# Register a new user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@bookstore.com","password":"user123"}'

# Get books
curl http://localhost:5000/api/books
```

### Using Postman/Insomnia

Import the following collection structure:
- Authentication endpoints
- Books CRUD operations
- Cart management
- Order processing
- Payment flows

## 🚀 Deployment

### Environment Setup
1. Set `NODE_ENV=production`
2. Use PostgreSQL in production
3. Set secure `JWT_SECRET`
4. Configure Stripe webhook endpoints
5. Set up proper CORS origins

### Build Process
```bash
npm run build
npm start
```

### Docker (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

## 🔒 Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing control
- **Rate Limiting**: API rate limiting
- **Input Validation**: Zod schema validation
- **Password Hashing**: bcryptjs
- **JWT**: Secure token-based authentication
- **SQL Injection Protection**: Prisma ORM

## 📈 Monitoring & Logging

- Request logging with timestamps
- Error logging with stack traces
- Database query logging (in development)
- Stripe webhook event logging

## 🔧 Development

### Available Scripts
- `npm run dev` - Development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes
- `npm run db:seed` - Seed database
- `npm run db:migrate` - Create and run migrations
- `npm run db:studio` - Open Prisma Studio

### Code Quality
- TypeScript for type safety
- ESLint configuration
- Prettier for code formatting
- Husky for git hooks (recommended)

## 🤝 API Response Format

All API responses follow this format:

```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

Error responses:
```json
{
  "success": false,
  "error": "Error message",
  "details": [...] // Validation errors
}
```

## 📚 Data Models

### User
- id, name, email, password, role, avatar, timestamps

### Book
- id, title, author, price, category, cover, description, rating, reviews, stock, isbn, pages, publishedYear, timestamps

### Cart/CartItem
- User has one cart, cart has many items
- Items reference books with quantity

### Order/OrderItem
- Orders belong to users
- Order items reference books with quantity and price at time of order

## 🔄 Webhook Integration

Stripe webhooks are supported for payment events. Configure the webhook endpoint in your Stripe dashboard to point to `/api/payments/webhook`.

## 📞 Support

For API documentation and examples, see the frontend integration guide or check the route handlers for detailed JSDoc comments.

---

Built with ❤️ for the BookWave bookstore application.