import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

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
    
    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error("Fetch products error:", error);
    return NextResponse.json([], { 
      status: 500, 
      headers: { 'x-error-message': 'Failed to fetch products' } 
    });
  }
}

// ➕ POST: Naya product create karne ke liye (FORMDATA, LOCAL FILES & COLOR VARIANTS SUPPORT)
export async function POST(req) {
  try {
    const formData = await req.formData();
    
    const name = formData.get('name');
    const description = formData.get('description');
    const categoryId = formData.get('categoryId');
    const isFeatured = formData.get('isFeatured') === 'true';
    
    const variants = JSON.parse(formData.get('variants') || '[]');
    const newImageFiles = formData.getAll('images');
    
    const newUploadedImages = [];

    // 🚀 Public uploads directory path
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (err) {}

    // Files save karne ki execution loop
    for (const file of newImageFiles) {
      if (typeof file === 'object' && file !== null && 'arrayBuffer' in file) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        const originalName = file.name || `img-${Date.now()}.png`;
        const sanitizedName = originalName.replace(/[^a-zA-Z0-9.\-]/g, '_');
        const uniqueFileName = `${Date.now()}-${sanitizedName}`;
        
        const filePath = path.join(uploadDir, uniqueFileName);
        await writeFile(filePath, buffer);
        
        // Relative path for Database serving
        newUploadedImages.push({ url: `/uploads/${uniqueFileName}` });
      }
    }

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
          create: newUploadedImages,
        },
        variants: {
          create: variants.map((v) => ({
            size: String(v.size || ''),
            color: String(v.color || ''), // 🔑 Mapped Color attribute field
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