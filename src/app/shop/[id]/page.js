import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import ProductDetailClient from '@/components/ProductDetailClient';

export default async function ProductDetailPage({ params }) {
  // 1. Params ko await karo
  const { id } = await params;

  // 2. Database query (Include category, images, variants)
  const product = await prisma.product.findUnique({
    where: { id: id },
    include: { 
      variants: true,
      images: true,
      category: true
    }
  });

  // 3. Agar product nahi mila
  if (!product) {
    notFound();
  }

  // 🌟 Decimal price aur originalPrice dono ko Plain Numbers mein convert karein
  const formattedProduct = {
    ...product,
    variants: product.variants.map((variant) => ({
      ...variant,
      price: Number(variant.price),
      originalPrice: variant.originalPrice ? Number(variant.originalPrice) : null
    }))
  };

  // 4. Return initialProduct for instant rendering
  return <ProductDetailClient productId={id} initialProduct={formattedProduct} />;
}