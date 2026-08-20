import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

// 🌟 Vercel Serverless Function Timeout Extension (60 seconds)
export const maxDuration = 60;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: 'glint_and_glam_products',
            resource_type: 'image', // 'auto' ki jagah strictly 'image'
            format: 'webp', // 🚀 Forces modern lightweight format (10x smaller)
            transformation: [
              { width: 1000, crop: 'limit' }, // 🚀 Shrinks 4K images to max 1000px width
              { quality: 'auto' } // 🚀 Smart compression without losing visual quality
            ]
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        )
        .end(buffer);
    });

    return NextResponse.json({ url: uploadResult.secure_url }, { status: 200 });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return NextResponse.json(
      { error: `Image upload failed: ${error.message}` },
      { status: 500 }
    );
  }
}