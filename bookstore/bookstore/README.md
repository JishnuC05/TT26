# BookWave - Modern Bookstore Application

A full-featured React-based bookstore application built with modern web technologies. This is a complete frontend application with mock data, ready for production deployment or backend integration.

## 🚀 Features

### Core Functionality
- **Browse Books**: Search, filter by category, and sort books
- **Book Details**: Individual book pages with ratings and reviews
- **Shopping Cart**: Add/remove items, quantity management, persistent storage
- **User Authentication**: Login/register with role-based access (user/admin)
- **Order Management**: View order history and track status
- **Admin Panel**: Manage books (CRUD operations) and orders

### Technical Features
- **Responsive Design**: Works on all screen sizes
- **Dark/Light Theme**: Automatic theme switching
- **TypeScript**: Full type safety
- **State Management**: Zustand for client-side state
- **UI Components**: shadcn/ui with Tailwind CSS
- **Routing**: React Router with protected routes
- **Mock Data**: Complete dataset for development and demo

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **UI**: shadcn/ui, Tailwind CSS, Lucide Icons
- **State**: Zustand with persistence
- **Routing**: React Router DOM
- **Styling**: Tailwind CSS with custom design system
- **Build**: Vite with TypeScript

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd bookstore
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   ```
   http://localhost:5173
   ```

## 🏗️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run typecheck` - Run TypeScript type checking

## 👤 Demo Accounts

- **Admin User**: `admin@bookstore.com` / `admin123`
- **Regular User**: `user@bookstore.com` / `user123`

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── books/          # Book-specific components
│   └── layout/         # Layout components
├── pages/              # Page components
│   └── admin/          # Admin pages
├── stores/             # Zustand state stores
├── data/               # Mock data
├── types/              # TypeScript type definitions
└── lib/                # Utility functions
```

## 🎨 Design System

The application uses a custom design system built on top of shadcn/ui:
- **Colors**: OKLCH color space with CSS custom properties
- **Typography**: Geist font family
- **Components**: Consistent component API with variants
- **Themes**: Light and dark mode support

## 🔧 Development

### Adding New Components
```bash
npx shadcn@latest add [component-name]
```

### Code Quality
- ESLint for code linting
- Prettier for code formatting
- TypeScript for type checking
- Husky for git hooks (if configured)

## 🚀 Deployment

The application can be deployed as a static site to any hosting platform:

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy the `dist` folder** to your hosting platform

### Recommended Platforms
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

## 🔌 Backend Integration

This is a frontend-only application with mock data. To add a real backend:

1. Replace mock data calls with API calls
2. Add authentication integration
3. Implement real cart persistence
4. Add order processing logic

## 📄 License

This project is for educational and demonstration purposes.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

---

Built with ❤️ using React, TypeScript, and modern web technologies.
