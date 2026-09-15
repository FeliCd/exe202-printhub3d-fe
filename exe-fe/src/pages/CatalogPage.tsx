import type { Product } from '../types';
import MainContent from '../features/products/components/MainContent';

interface CatalogPageProps {
  onAddToCart: (product: Product) => void;
}

export default function CatalogPage({ onAddToCart }: CatalogPageProps) {
  return <MainContent onAddToCart={onAddToCart} />;
}
