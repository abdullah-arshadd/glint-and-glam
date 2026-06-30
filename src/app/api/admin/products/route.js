import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, description, category, imageUrl, variants } = body;

    // Basic Validation
    if (!name || !price || !variants || variants.length === 0) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Product create karo aur sath hi uske variants bhi (Nested Create)
    const product = await prisma.product.create({
      data: {
        name,
        description,
        category,
        imageUrl,
        variants: {
          create: variants.map(v => ({
            size: v.size,
            price: parseFloat(v.price),
            stock: parseInt(v.stock)
          }))
        }
      }
    });

    return NextResponse.json({ message: 'Product added successfully!', product }, { status: 201 });
  } catch (error) {
    console.error('ADMIN_PRODUCT_ERROR:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}