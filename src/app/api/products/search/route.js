import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim() || "";

    if (!query) {
      return NextResponse.json({ products: [] }, { status: 200 });
    }

    // 🎯 PostgreSql case-insensitive relational query matching schema
    const filteredProducts = await prisma.product.findMany({
      where: {
        OR: [
          {
            name: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            category: {
              name: {
                contains: query,
                mode: "insensitive",
              },
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        // 🌟 NEW: Image fetch karne ke liye add kiya hai
        images: {
          select: {
            url: true,
          },
          take: 1, // Sirf main/pehli image utha rahe hain thumbnail ke liye
        },
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
        variants: {
          select: {
            price: true,
          },
          take: 1, // Card pricing display ke liye first variant utha rahe hain
        },
      },
      take: 6,
    });

    // Client ke response ko map kar rahe hain schema ke mutabik format maintain rakhne ke liye
    const formattedProducts = filteredProducts.map((product) => ({
      id: product.id,
      name: product.name,
      category: product.category?.name || null,
      slug: product.category?.slug || "", // Parent category ka slug redirection ke liye
      price: product.variants[0]?.price ? Number(product.variants[0].price) : null,
      // 🌟 NEW: Frontend ke liye cleanly image URL map kar diya
      imageUrl: product.images[0]?.url || null, 
    }));

    return NextResponse.json(
      { products: formattedProducts },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          "Pragma": "no-cache",
        },
      }
    );
  } catch (error) {
    console.error("Prisma relational search failed:", error);
    return NextResponse.json(
      { error: "Internal Server Error", products: [] },
      { status: 500 }
    );
  }
}