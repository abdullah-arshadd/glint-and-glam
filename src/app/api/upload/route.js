import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    // 🌟 Correct Parsing: Read JSON payload sent from frontend
    const body = await req.json();
    const { name, description, categoryId, images, variants, isFeatured } = body;

    if (!name || !description || !variants || variants.length === 0) {
      return NextResponse.json(
        { message: 'Missing required product metrics' },
        { status: 400 }
      );
    }

    const newProduct = await prisma.product.create({
      data: {
        name,
        description,
        categoryId: categoryId || null,
        isFeatured: Boolean(isFeatured),
        images: {
          create: images.map((img) => ({ url: img.url })),
        },
        variants: {
          create: variants.map((v) => ({
            size: v.size || 'Standard',
            color: v.color || '',
            price: Number(v.price),
            stock: Number(v.stock),
          })),
        },
      },
      include: {
        images: true,
        variants: true,
      },
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error('Create product API error:', error);
    return NextResponse.json(
      { message: `Database error: ${error.message}` },
      { status: 500 }
    );
  }
}