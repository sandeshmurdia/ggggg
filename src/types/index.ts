/**
 * Shared types for the e-commerce app.
 */

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  categoryId: string;
  description: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
}

export interface Category {
  id: string;
  name: string;
  image: string;
  productCount: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Address {
  id: string;
  label: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
  createdAt: string;
  address: Address;
}
