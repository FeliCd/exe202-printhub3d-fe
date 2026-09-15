import type { Product } from '../types';
import MainContent from '../features/products/components/MainContent';

interface HomePageProps {
  onAddToCart: (product: Product) => void;
}

export default function HomePage({ onAddToCart }: HomePageProps) {
  return <MainContent onAddToCart={onAddToCart} />;
}
