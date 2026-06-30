import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import ProductDetailClient from '@/components/ProductDetailClient';

export default async function ProductDetailPage({ params }) {
  // 1. Params ko await karo
  const { id } = await params;

  // 2. Database query (Include category here)
  const product = await prisma.product.findUnique({
    where: { id: id },
    include: { 
      variants: true,
      images: true,
      category: true // <--- Yeh zaroori hai taake category details bhi mil sakein
    }
  });

  // 3. Agar product nahi mila
  if (!product) {
    notFound();
  }

  // 4. Return
  return <ProductDetailClient product={product} />;
}