import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

// 🔄 2. PATCH: Product update handler (JSON Parsing & Cloudinary / Color Compatible)
export async function PATCH(req, { params }) {
  try {
    const { id } = await params;
    const targetId = String(id);

    // Read JSON payload sent from frontend
    const body = await req.json();
    const { name, description, categoryId, images, variants, isFeatured } = body;

    if (!name || !description || !variants || variants.length === 0) {
      return NextResponse.json(
        { message: 'Missing required product metrics' },
        { status: 400 }
      );
    }

    const updatedProduct = await prisma.$transaction(async (tx) => {
      // 1. Core Product Record Update
      const product = await tx.product.update({
        where: { id: targetId },
        data: {
          name: String(name),
          description: String(description),
          categoryId: categoryId && String(categoryId).trim() !== "" ? String(categoryId) : null,
          isFeatured: Boolean(isFeatured),
        },
      });

      // 2. Refresh Product Images Mapping
      await tx.productImage.deleteMany({ where: { productId: targetId } });
      if (images && images.length > 0) {
        await tx.productImage.createMany({
          data: images.map((img) => ({
            url: img.url,
            productId: targetId,
          })),
        });
      }

      // 3. Safe Variant Sync (Supports both Size & Color)
      if (variants) {
        const incomingVariantIds = variants
          .filter((v) => v.id)
          .map((v) => String(v.id));

        // Delete variants that are no longer present (and not locked in orders)
        await tx.productVariant.deleteMany({
          where: {
            productId: targetId,
            id: { notIn: incomingVariantIds },
            orderItems: { none: {} }, // Order safety guard
          },
        });

        for (const v of variants) {
          if (v.id) {
            await tx.productVariant.update({
              where: { id: String(v.id) },
              data: {
                size: String(v.size || ''),
                color: String(v.color || ''),
                price: parseFloat(v.price),
                stock: parseInt(v.stock) || 0,
              },
            });
          } else {
            await tx.productVariant.create({
              data: {
                size: String(v.size || ''),
                color: String(v.color || ''),
                price: parseFloat(v.price),
                stock: parseInt(v.stock) || 0,
                productId: targetId,
              },
            });
          }
        }
      }

      return product;
    });

    return NextResponse.json({ success: true, product: updatedProduct }, { status: 200 });
  } catch (error) {
    console.error("❌ CRITICAL EDIT ERROR:", error);
    return NextResponse.json(
      { message: 'Failed to update product', error: error.message },
      { status: 500 }
    );
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
        variant: { productId: targetId },
      },
    });

    if (hasBeenOrdered) {
      await prisma.$transaction([
        prisma.product.update({
          where: { id: targetId },
          data: { name: `${targetId}__ARCHIVED` },
        }),
        prisma.productVariant.updateMany({
          where: { productId: targetId },
          data: { stock: 0 },
        }),
        prisma.cartItem.deleteMany({
          where: { variant: { productId: targetId } },
        }),
      ]);

      return NextResponse.json(
        {
          success: true,
          message: "Product safely archived due to order locks.",
        },
        { status: 200 }
      );
    }

    await prisma.$transaction([
      prisma.cartItem.deleteMany({ where: { variant: { productId: targetId } } }),
      prisma.productImage.deleteMany({ where: { productId: targetId } }),
      prisma.productVariant.deleteMany({ where: { productId: targetId } }),
      prisma.product.delete({ where: { id: targetId } }),
    ]);

    return NextResponse.json({ success: true, message: "Product completely deleted." }, { status: 200 });
  } catch (error) {
    console.error("❌ CRITICAL CORE ENGINE DELETE ERROR:", error);
    return NextResponse.json(
      {
        message: 'Failed to execute delete transaction',
        error: error.message,
      },
      { status: 500 }
    );
  }
}