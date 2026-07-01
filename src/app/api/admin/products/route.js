import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, description, categoryId, images, variants, isFeatured } = body;

    // 1. Validation: Name, Description aur Variants mandatory hain
    if (!name || !description || !variants || variants.length === 0) {
      return NextResponse.json({ message: 'Required fields are missing' }, { status: 400 });
    }

    // 2. Category Handling
    const cleanCategoryId = categoryId && categoryId.trim() !== "" ? String(categoryId) : null;

    // 3. Product creation with nested relationships
    const newProduct = await prisma.product.create({
      data: {
        name,
        description,
        categoryId: cleanCategoryId,
        isFeatured: Boolean(isFeatured), // 🔥 Admin panel ka toggle yahan save hoga
        images: {
          create: images && images.length > 0 
            ? images.filter(img => img.url && img.url.trim() !== "").map((img) => ({ url: img.url })) 
            : [],
        },
        variants: {
          create: variants.map((v) => ({
            size: String(v.size),
            price: parseFloat(v.price),
            stock: parseInt(v.stock) || 0,
          })),
        },
      },
      include: {
        variants: true,
        images: true, 
      }
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error("Product upload error:", error);
    return NextResponse.json({ message: `Database operational crash: ${error.message}` }, { status: 500 });
  }
}