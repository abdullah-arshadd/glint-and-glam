import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 📊 GET: Saare ACTIVE products variants aur images ke sath lane ke liye (With Featured Filter)
export async function GET(req) {
  try {
    // 🔑 URL parameters read karne ke liye logic connect kiya
    const { searchParams } = new URL(req.url);
    const isFeaturedQuery = searchParams.get("featured") === "true";

    // Base filters: Archived products ko hide rakhna hamesha
    let whereClause = {
      NOT: {
        name: {
          endsWith: '__ARCHIVED' 
        }
      }
    };

    // Agar URL me ?featured=true ho, toh filtration criteria me add kar do
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
        createdAt: 'desc', // Taake naya product sab se upar aaye
      }
    });
    
    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error("Fetch products error:", error);
    return NextResponse.json([], { 
      status: 500, 
      headers: { 'x-error-message': 'Failed to fetch products' } 
    });
  }
}

// ➕ POST: Naya product create karne ke liye (With Featured Flag support)
export async function POST(req) {
  try {
    const body = await req.json();
    // 🔑 `isFeatured` ko body se destructure kiya
    const { name, description, categoryId, images, variants, isFeatured } = body;

    // Validation checks
    if (!name || !description || !variants || variants.length === 0) {
      return NextResponse.json({ message: 'Required fields are missing' }, { status: 400 });
    }

    // Agar categoryId empty string "" ho ya whitespace ho, toh usko explicit NULL assign karo
    const cleanCategoryId = categoryId && categoryId.trim() !== "" ? String(categoryId) : null;

    const newProduct = await prisma.product.create({
      data: {
        name,
        description,
        categoryId: cleanCategoryId, 
        isFeatured: Boolean(isFeatured), // 🔥 Admin UI checkbox value assignment secure dynamic filter
        images: {
          create: images && images.length > 0 ? images.filter(img => img.url && img.url.trim() !== "").map((img) => ({ url: img.url })) : [],
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