const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Clean slug generator
const createSlug = (name) => name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

async function main() {
  console.log("🚀 Initializing category synchronization pipeline...");

  const data = [
    { name: 'Hair Accessories', children: ['Claw Clips', 'Hair bows', 'Claw clips bundles', 'Hair barrettes', 'Hair bands'] },
    { name: 'Jewelry', children: ['Earrings', 'Rings', 'Bracelets', 'Necklaces', 'Sets', 'Handcuffs'] },
    { name: 'Nails', children: [] },
    { name: 'Jewelry organizers', children: [] },
    { name: 'Makeup', children: [] },
    { name: 'Jhumkay', children: [] },
    { name: 'Printables', children: [] },
    { name: 'Bouquet', children: [] },
    { name: 'Gift bundles', children: [] }
  ];

  const jewelrySubMap = {
    'Earrings': ['Crystal earrings', 'Premium zirconia collection', 'Statement earrings/ daily wear', 'Traditional earrings', 'Studs packs', 'Earcuffs', 'Korean earrings'],
    'Rings': ['Rings set', 'Zirconia rings', 'Stainless Steel rings'],
    'Bracelets': ['Stainless Steel bracelets', 'Zirconia bracelets', 'Korean bracelets', 'Bracelets packs'],
    'Necklaces': ['Stainless Steel/daily wear necklace', 'Others'],
    'Sets': ['Stainless Steel/ daily wear', 'Korean sets'],
    'Handcuffs': ['Daily wear/ Stainless Steel', 'Korean', 'Others']
  };

  for (const item of data) {
    const mainSlug = createSlug(item.name);
    
    // 1. Level 1: Main Category
    const parent = await prisma.category.upsert({
      where: { slug: mainSlug },
      update: { name: item.name },
      create: { name: item.name, slug: mainSlug }
    });
    
    for (const childName of item.children) {
      // 🔑 Combo slug to avoid clashes across domains (e.g., jewelry-earrings)
      const childSlug = createSlug(`${item.name}-${childName}`);

      // 2. Level 2: Sub Category
      const child = await prisma.category.upsert({ 
        where: { slug: childSlug },
        update: { name: childName },
        create: { name: childName, slug: childSlug, parentId: parent.id } 
      });

      if (jewelrySubMap[childName]) {
        for (const sub of jewelrySubMap[childName]) {
          // 🔑 Deep nested combo slug (e.g., jewel-earrings-crystal-earrings)
          const deepChildSlug = createSlug(`jewel-${childName}-${sub}`);

          // 3. Level 3: Deep Nested Specifics
          await prisma.category.upsert({ 
            where: { slug: deepChildSlug },
            update: { name: sub },
            create: { name: sub, slug: deepChildSlug, parentId: child.id } 
          });
        }
      }
    }
  }

  console.log("✅ Database category tree has been successfully synced!");
}

main()
  .catch(e => { console.error("❌ Seeding runtime error:", e); process.exit(1); })
  .finally(async () => await prisma.$disconnect());