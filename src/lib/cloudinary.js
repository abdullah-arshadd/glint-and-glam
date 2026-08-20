// lib/cloudinary.js
//
// Shared helper — import this everywhere an <img> shows a Cloudinary URL:
// admin/products/page.js, shop/page.js, components/ProductDetailClient.js
//
// Why: your /api/upload route already saves a ~1000px webp version, but a
// shop grid thumbnail only needs ~500px. Without this, every card downloads
// the full 1000px image even though it's rendered at 1/3 the size.
//
// This asks Cloudinary to serve an on-the-fly resized/cropped/compressed
// version of the SAME uploaded image. Cloudinary caches the result on its
// CDN after the first request, so it's fast for every user after that.

/**
 * @param {string} url - the Cloudinary secure_url stored in your DB
 * @param {number} width - target display width in px (pick based on where it's used)
 * @param {object} [options]
 * @param {string} [options.aspect] - e.g. '4:5', '1:1' — forces a crop to this ratio
 * @param {string} [options.crop] - Cloudinary crop mode, default 'fill' (used with aspect)
 */
export const getOptimizedUrl = (url, width = 600, { aspect, crop = 'fill' } = {}) => {
  if (!url || typeof url !== 'string' || !url.includes('cloudinary.com')) return url;

  const parts = [`f_auto`, `q_auto`, `w_${width}`];

  if (aspect) {
    parts.push(`c_${crop}`, `ar_${aspect}`);
  } else {
    parts.push(`c_limit`); // never upscale, just cap the width
  }

  return url.replace('/upload/', `/upload/${parts.join(',')}/`);
};