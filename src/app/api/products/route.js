import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 📊 GET: Saare ACTIVE products variants aur images ke sath lane ke liye
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: {
        NOT: {
          name: {
            endsWith: '__ARCHIVED' // 🔑 Jo products archive ho chuke hain unhe shop/api se hide kar do
          }
        }
      },
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
    // 🔑 FIXED: Object ke sath an empty array fallback bhej rahe hain taake frontend map/forEach crash na ho
    return NextResponse.json([], { 
      status: 500, 
      headers: { 'x-error-message': 'Failed to fetch products' } 
    });
  }
}

// ➕ POST: Naya product create karne ke liye
export async function POST(req) {
  try {
    const body = await req.json();
    const { name, description, categoryId, images, variants } = body;

    // Validation checks
    if (!name || !description || !variants || variants.length === 0) {
      return NextResponse.json({ message: 'Required fields are missing' }, { status: 400 });
    }

    // 🔑 FIXED: Agar categoryId empty string "" ho ya whitespace ho, toh usko explicit NULL assign karo
    const cleanCategoryId = categoryId && categoryId.trim() !== "" ? String(categoryId) : null;

    const newProduct = await prisma.product.create({
      data: {
        name,
        description,
        categoryId: cleanCategoryId, 
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