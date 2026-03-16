export type Category =
  | "FICTION"
  | "NON_FICTION"
  | "SCIENCE"
  | "HISTORY"
  | "TECHNOLOGY"
  | "SELF_HELP"
  | "FANTASY"
  | "BIOGRAPHY";

export interface Book {
  id: string;
  title: string;
  author: string;
  price: number;
  category: Category;
  cover: string;
  description: string;
  rating: number;
  reviews: number;
  stock: number;
  isbn: string;
  pages: number;
  publishedYear: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: "USER" | "ADMIN";
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  id?: string;
  cartId?: string;
  bookId?: string;
  book: Book;
  quantity: number;
}

export type OrderStatus = "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

export interface OrderItem {
  id?: string;
  orderId?: string;
  bookId?: string;
  book: Book;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  items: OrderItem[];
  totalPrice: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt?: string;
}
