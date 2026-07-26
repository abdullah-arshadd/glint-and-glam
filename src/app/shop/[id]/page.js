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
      category: true // Category details ke liye zaroori hai
    }
  });

  // 3. Agar product nahi mila
  if (!product) {
    notFound();
  }

  // 🌟 Decimal price ko plain Number mein convert karein
  const formattedProduct = {
    ...product,
    variants: product.variants.map((variant) => ({
      ...variant,
      price: Number(variant.price) 
    }))
  };

  // 4. Return (initialProduct pass karein taake SWR pehli dafa instant render kare)
  return <ProductDetailClient productId={id} initialProduct={formattedProduct} />;
}