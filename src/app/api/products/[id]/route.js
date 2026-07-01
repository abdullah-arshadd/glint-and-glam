import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 🔄 PATCH: Product update handler (UPGRADED WITH ISFEATURED SUPPORT)
export async function PATCH(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json();
    // 🔑 Destructured isFeatured field from the incoming payload body
    const { name, description, categoryId, images, variants, isFeatured } = body;

    const updatedProduct = await prisma.$transaction(async (tx) => {
      // 1. Core Product Data ko update karo (Including Featured Boolean Toggle)
      const product = await tx.product.update({
        where: { id: String(id) },
        data: {
          name,
          description,
          categoryId: categoryId ? String(categoryId) : null,
          isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : undefined, // 🔥 dynamic filter checkbox value mapper
        }
      });

      // 2. Images Sync (Images ordered nahi hoti isliye deleteMany safe hai)
      if (images) {
        await tx.productImage.deleteMany({ where: { productId: String(id) } });
        if (images.length > 0) {
          await tx.productImage.createMany({
            data: images.map(img => ({ url: img.url, productId: String(id) }))
          });
        }
      }

      // 3. 🔑 THE PRODUCTION-READY FIX: Variants Sync via Safe Upsert & Filtered Purge
      if (variants) {
        // A. Pehle un variants ki IDs nikal lo jo frontend ke current safe structure me bachi hain
        const incomingVariantIds = variants.filter(v => v.id).map(v => String(v.id));

        // B. Jo variants payload me nahi aaye (yaani user ne delete kar diye), unhe safely target karo 
        // par sirf tab delete karo agar un par koi order dependencies na ho!
        await tx.productVariant.deleteMany({
          where: {
            productId: String(id),
            id: { notIn: incomingVariantIds },
            orderItems: { none: {} } // 🛡️ Ye check order references ko crash hone se bachayega
          }
        });

        // C. Ab baaki variants ko loop chala kar individually update ya create (upsert) karo
        for (const v of variants) {
          if (v.id) {
            // Agar pehle se maujud hai toh crash karne ki jagah safe update run karo
            await tx.productVariant.update({
              where: { id: String(v.id) },
              data: {
                size: String(v.size),
                price: parseFloat(v.price),
                stock: parseInt(v.stock) || 0,
              }
            });
          } else {
            // Agar bilkul naya variant row add kiya hai matrix me toh fresh create chalao
            await tx.productVariant.create({
              data: {
                size: String(v.size),
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

// ❌ DELETE: Full Cascade Control with Soft-Archive Fallback
export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    const targetId = String(id);

    console.log("🚀 Delete request received for Product ID:", targetId);

    if (!targetId) {
      return NextResponse.json({ message: 'Product ID is missing' }, { status: 400 });
    }

    // 1. Check if order references exist (Foreign Key Constraint protection)
    const hasBeenOrdered = await prisma.orderItem.findFirst({
      where: {
        variant: { productId: targetId }
      }
    });

    if (hasBeenOrdered) {
      console.log("⚠️ Product exists in Order History. Executing Soft Archive Toggles...");
      
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

    // 2. Clear out any lingering dependencies manually if it's a fresh product
    console.log("🧼 Fresh product detected. Cleaning up children tables...");
    
    await prisma.$transaction([
      prisma.cartItem.deleteMany({ where: { variant: { productId: targetId } } }),
      prisma.productImage.deleteMany({ where: { productId: targetId } }),
      prisma.productVariant.deleteMany({ where: { productId: targetId } }),
      prisma.product.delete({ where: { id: targetId } })
    ]);

    console.log("✅ Hard delete execution completed successfully.");
    return NextResponse.json({ success: true, message: "Product completely deleted." }, { status: 200 });

  } catch (error) {
    console.error("❌ CRITICAL CORE ENGINE DELETE ERROR:", error);
    return NextResponse.json({ 
      message: 'Failed to execute delete transaction', 
      error: error.message 
    }, { status: 500 });
  }
}