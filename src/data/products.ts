/**
 * Mock products for the e-commerce app.
 */
import { Product } from '../types';

export const products: Product[] = [
  { id: 'p1', name: 'Wireless Headphones Pro', price: 129.99, originalPrice: 159.99, image: 'https://picsum.photos/seed/h1/400/400', categoryId: '1', description: 'Premium noise-cancelling wireless headphones with 30hr battery.', rating: 4.5, reviewCount: 234, inStock: true },
  { id: 'p2', name: 'Smart Watch Series X', price: 299.99, image: 'https://picsum.photos/seed/sw1/400/400', categoryId: '1', description: 'Track fitness, receive notifications, and stay connected.', rating: 4.8, reviewCount: 512, inStock: true },
  { id: 'p3', name: 'Portable Bluetooth Speaker', price: 79.99, image: 'https://picsum.photos/seed/sp1/400/400', categoryId: '1', description: 'Water-resistant, 20hr playtime, rich bass.', rating: 4.3, reviewCount: 189, inStock: true },
  { id: 'p4', name: 'Classic Cotton Tee', price: 24.99, image: 'https://picsum.photos/seed/tee1/400/400', categoryId: '2', description: 'Soft organic cotton, unisex fit.', rating: 4.6, reviewCount: 1203, inStock: true },
  { id: 'p5', name: 'Running Sneakers', price: 89.99, originalPrice: 119.99, image: 'https://picsum.photos/seed/shoe1/400/400', categoryId: '2', description: 'Lightweight, breathable, ideal for daily runs.', rating: 4.7, reviewCount: 445, inStock: true },
  { id: 'p6', name: 'Leather Crossbody Bag', price: 149.99, image: 'https://picsum.photos/seed/bag1/400/400', categoryId: '2', description: 'Handcrafted genuine leather, multiple compartments.', rating: 4.4, reviewCount: 78, inStock: true },
  { id: 'p7', name: 'Desk Lamp LED', price: 44.99, image: 'https://picsum.photos/seed/lamp1/400/400', categoryId: '3', description: 'Adjustable brightness, USB charging port.', rating: 4.5, reviewCount: 312, inStock: true },
  { id: 'p8', name: 'Throw Pillow Set (4pk)', price: 39.99, image: 'https://picsum.photos/seed/pillow1/400/400', categoryId: '3', description: 'Soft velvet, modern colors.', rating: 4.2, reviewCount: 156, inStock: true },
  { id: 'p9', name: 'Yoga Mat Premium', price: 34.99, image: 'https://picsum.photos/seed/yoga1/400/400', categoryId: '4', description: 'Non-slip, 6mm thick, eco-friendly.', rating: 4.8, reviewCount: 567, inStock: true },
  { id: 'p10', name: 'Dumbbell Set 2x5kg', price: 59.99, image: 'https://picsum.photos/seed/dumb1/400/400', categoryId: '4', description: 'Rubber coated, hex design for stability.', rating: 4.6, reviewCount: 234, inStock: true },
  { id: 'p11', name: 'Best Seller: Clean Code', price: 42.99, image: 'https://picsum.photos/seed/book1/400/400', categoryId: '5', description: 'A handbook of agile software craftsmanship.', rating: 4.9, reviewCount: 2891, inStock: true },
  { id: 'p12', name: 'Design Patterns', price: 54.99, image: 'https://picsum.photos/seed/book2/400/400', categoryId: '5', description: 'Elements of reusable object-oriented software.', rating: 4.7, reviewCount: 1204, inStock: true },
];

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getProductsByCategory(categoryId: string): Product[] {
  return products.filter((p) => p.categoryId === categoryId);
}

export function getFeaturedProducts(): Product[] {
  return [products[0], products[1], products[4], products[8]];
}
