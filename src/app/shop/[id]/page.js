import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import ProductDetailClient from '@/components/ProductDetailClient';
import { getOptimizedUrl } from '@/lib/cloudinary';

// 🌟 ISR: cache this page for 5 minutes instead of hitting Prisma on every
// single request. First visitor after the window still pays the DB cost,
// everyone else gets the cached HTML instantly (images included).
export const revalidate = 300;

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

  // 🌟 Hero image preload — MUST use the exact same getOptimizedUrl(width, aspect)
  // call as ProductDetailClient's main slider, otherwise the browser treats it
  // as a different resource and preloads a URL that never actually gets used.
  const heroImageUrl = product.images?.[0]?.url
    ? getOptimizedUrl(product.images[0].url, 900, { aspect: '4:5' })
    : null;

  // 4. Return initialProduct for instant rendering
  return (
    <>
      {heroImageUrl && (
        // App Router hoists <link> tags rendered from a Server Component into
        // <head> automatically — this kicks off the image fetch the moment
        // the browser starts parsing HTML, well before React hydrates.
        <link rel="preload" as="image" href={heroImageUrl} />
      )}
      <ProductDetailClient productId={id} initialProduct={formattedProduct} />
    </>
  );
}