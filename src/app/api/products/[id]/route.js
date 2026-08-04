import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

// 🔍 1. GET: Single product details fetch karne ka handler
export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const targetId = String(id);

    const product = await prisma.product.findUnique({
      where: { id: targetId },
      include: {
        category: true,
        images: true,
        variants: true,
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product, { status: 200 });
  } catch (error) {
    console.error("❌ GET Product Error:", error);
    return NextResponse.json({ error: "Failed to fetch product details" }, { status: 500 });
  }
}

// 🔄 2. PATCH: Product update handler (UPGRADED WITH COLOR & SIZE VARIANTS)
export async function PATCH(req, { params }) {
  try {
    const { id } = await params;
    
    // Parse FormData from client
    const formData = await req.formData();
    
    const name = formData.get('name');
    const description = formData.get('description');
    const categoryId = formData.get('categoryId');
    const isFeatured = formData.get('isFeatured') === 'true';
    
    const variants = JSON.parse(formData.get('variants') || '[]');
    const existingImages = JSON.parse(formData.get('existingImages') || '[]');
    
    const newImageFiles = formData.getAll('images');
    const newUploadedImages = [];

    // Local Disk Path Configuration
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (err) {}

    // Process new local binary image files
    for (const file of newImageFiles) {
      if (typeof file === 'object' && file !== null && 'arrayBuffer' in file) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        const originalName = file.name || `edit-img-${Date.now()}.png`;
        const sanitizedName = originalName.replace(/[^a-zA-Z0-9.\-]/g, '_');
        const uniqueFileName = `${Date.now()}-${sanitizedName}`;
        
        const filePath = path.join(uploadDir, uniqueFileName);
        await writeFile(filePath, buffer);
        
        newUploadedImages.push({ url: `/uploads/${uniqueFileName}` });
      }
    }

    // Merge kept existing images with newly saved files
    const finalImagesToSave = [...existingImages, ...newUploadedImages];

    const updatedProduct = await prisma.$transaction(async (tx) => {
      // 1. Core Product Record Update
      const product = await tx.product.update({
        where: { id: String(id) },
        data: {
          name: String(name),
          description: String(description),
          categoryId: categoryId && String(categoryId).trim() !== "" ? String(categoryId) : null,
          isFeatured: Boolean(isFeatured), 
        }
      });

      // 2. Refresh Product Images Mapping
      await tx.productImage.deleteMany({ where: { productId: String(id) } });
      if (finalImagesToSave.length > 0) {
        await tx.productImage.createMany({
          data: finalImagesToSave.map(img => ({ url: img.url, productId: String(id) }))
        });
      }

      // 3. Safe Variant Sync (Supports both Size & Color)
      if (variants) {
        const incomingVariantIds = variants.filter(v => v.id).map(v => String(v.id));

        await tx.productVariant.deleteMany({
          where: {
            productId: String(id),
            id: { notIn: incomingVariantIds },
            orderItems: { none: {} } // Order safety guard
          }
        });

        for (const v of variants) {
          if (v.id) {
            await tx.productVariant.update({
              where: { id: String(v.id) },
              data: {
                size: String(v.size || ''),
                color: String(v.color || ''), // Mapped Color field
                price: parseFloat(v.price),
                stock: parseInt(v.stock) || 0,
              }
            });
          } else {
            await tx.productVariant.create({
              data: {
                size: String(v.size || ''),
                color: String(v.color || ''), // Mapped Color field
                price: parseFloat(v.price),
                stock: parseInt(v.stock) || 0,
                productId: String(id)
              }
            });
          }
        }
      }

      return product;
    });

    return NextResponse.json({ success: true, product: updatedProduct }, { status: 200 });
  } catch (error) {
    console.error("❌ CRITICAL EDIT ERROR:", error);
    return NextResponse.json({ message: 'Failed to update product', error: error.message }, { status: 500 });
  }
}

// 🔄 3. PUT: Alias to PATCH
export async function PUT(req, ctx) {
  return PATCH(req, ctx);
}

// ❌ 4. DELETE: Full Cascade Control with Soft-Archive Fallback
export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    const targetId = String(id);

    if (!targetId) {
      return NextResponse.json({ message: 'Product ID is missing' }, { status: 400 });
    }

    const hasBeenOrdered = await prisma.orderItem.findFirst({
      where: {
        variant: { productId: targetId }
      }
    });

    if (hasBeenOrdered) {
      await prisma.$transaction([
        prisma.product.update({
          where: { id: targetId },
          data: { name: `${targetId}__ARCHIVED` }
        }),
        prisma.productVariant.updateMany({
          where: { productId: targetId },
          data: { stock: 0 }
        }),
        prisma.cartItem.deleteMany({
          where: { variant: { productId: targetId } }
        })
      ]);

      return NextResponse.json({ 
        success: true, 
        message: "Product safely archived due to order locks." 
      }, { status: 200 });
    }

    await prisma.$transaction([
      prisma.cartItem.deleteMany({ where: { variant: { productId: targetId } } }),
      prisma.productImage.deleteMany({ where: { productId: targetId } }),
      prisma.productVariant.deleteMany({ where: { productId: targetId } }),
      prisma.product.delete({ where: { id: targetId } })
    ]);

    return NextResponse.json({ success: true, message: "Product completely deleted." }, { status: 200 });

  } catch (error) {
    console.error("❌ CRITICAL CORE ENGINE DELETE ERROR:", error);
    return NextResponse.json({ 
      message: 'Failed to execute delete transaction', 
      error: error.message 
    }, { status: 500 });
  }
}