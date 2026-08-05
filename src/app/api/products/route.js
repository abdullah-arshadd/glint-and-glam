import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 📊 GET: Saare ACTIVE products variants aur images ke sath lane ke liye
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const isFeaturedQuery = searchParams.get("featured") === "true";

    let whereClause = {
      NOT: {
        name: {
          endsWith: '__ARCHIVED' 
        }
      }
    };

    if (isFeaturedQuery) {
      whereClause.isFeatured = true;
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        variants: true,
        images: true, 
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      }
    });

    // 🌟 Format Decimals for Frontend (price + originalPrice)
    const formattedProducts = products.map((product) => ({
      ...product,
      variants: product.variants.map((v) => ({
        ...v,
        price: Number(v.price),
        originalPrice: v.originalPrice ? Number(v.originalPrice) : null,
      })),
    }));
    
    return NextResponse.json(formattedProducts, { status: 200 });
  } catch (error) {
    console.error("Fetch products error:", error);
    return NextResponse.json([], { 
      status: 500, 
      headers: { 'x-error-message': 'Failed to fetch products' } 
    });
  }
}

// ➕ POST: Naya product create karne ke liye (Original Price Support Added)
export async function POST(req) {
  try {
    const body = await req.json();
    const { name, description, categoryId, images, variants, isFeatured } = body;

    if (!name || !description || !variants || variants.length === 0) {
      return NextResponse.json({ message: 'Required fields are missing' }, { status: 400 });
    }

    const cleanCategoryId = categoryId && String(categoryId).trim() !== "" ? String(categoryId) : null;

    const newProduct = await prisma.product.create({
      data: {
        name: String(name),
        description: String(description),
        categoryId: cleanCategoryId, 
        isFeatured: Boolean(isFeatured),
        images: {
          create: (images || []).map((img) => ({
            url: img.url
          })),
        },
        variants: {
          create: variants.map((v) => ({
            size: String(v.size || ''),
            color: String(v.color || ''),
            price: parseFloat(v.price),
            originalPrice: v.originalPrice ? parseFloat(v.originalPrice) : null, // 🏷️ Original Price support
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