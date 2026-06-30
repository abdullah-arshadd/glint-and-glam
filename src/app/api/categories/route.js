import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Tumhari existing prisma instance

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { parentId: null }, // Sirf Main Categories fetch hongi
      include: { 
        children: {
          include: {
            children: true // Agar sub-subcategory bhi hain
          }
        } 
      }
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error("Fetch categories error:", error);
    // 🔑 FIXED: Catch block mein object return karne ke bajaye empty array return kar rahe hain taake frontend loop break na ho
    return NextResponse.json([], { 
      status: 500, 
      headers: { 'x-error-message': 'Failed to fetch categories' } 
    });
  }
}