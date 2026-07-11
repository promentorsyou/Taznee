/**
 * Taznee demo seed data.
 *
 * Populates categories, designers, ~15-20 original fictional products with
 * variants/inventory/images, a demo customer + admin, a demo IN_TRANSIT
 * order, and the ShippingZone/ShippingRate tables (sourced from
 * lib/shipping-data.ts so runtime shipping calculation and the DB agree).
 *
 * All money fields are integer cents. Product images are deterministic
 * picsum.photos placeholder URLs — nothing is scraped from any real site.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { SHIPPING_ZONES } from "../lib/shipping-data";
import { calculateDeliveryEstimate } from "../lib/delivery";

const prisma = new PrismaClient();

function img(seed: string) {
  return `https://picsum.photos/seed/${seed}/800/1000`;
}

async function main() {
  console.log("Seeding Taznee demo data...");

  // ---- Categories ----
  const categoryData = [
    { name: "Sarees", slug: "sarees", description: "Hand-woven and embroidered sarees from Bangladeshi ateliers." },
    { name: "Salwar Kameez", slug: "salwar-kameez", description: "Everyday and occasion salwar kameez sets." },
    { name: "Panjabi", slug: "panjabi", description: "Men's panjabi and kurta for festivals and daily wear." },
    { name: "Wedding", slug: "wedding", description: "Bridal and wedding-party ensembles." },
    { name: "Jewelry", slug: "jewelry", description: "Traditional and contemporary jewelry pieces." },
  ];
  const categories = new Map<string, { id: string }>();
  for (const c of categoryData) {
    const created = await prisma.category.upsert({ where: { slug: c.slug }, update: {}, create: c });
    categories.set(c.slug, created);
  }

  // ---- Designers ----
  const designerData = [
    { name: "Meherun Studio", slug: "meherun-studio", bio: "A Dhaka atelier known for hand-block printed cottons.", location: "Dhaka" },
    { name: "Anindo Textiles", slug: "anindo-textiles", bio: "Third-generation Jamdani weavers based in Narayanganj.", location: "Narayanganj" },
    { name: "Nokshi House", slug: "nokshi-house", bio: "Contemporary embroidery house blending nokshi kantha with modern cuts.", location: "Dhaka" },
    { name: "Shonar Baksho", slug: "shonar-baksho", bio: "Bridal jewelry designers working in gold-plated brass and kundan.", location: "Chittagong" },
  ];
  const designers = new Map<string, { id: string }>();
  for (const d of designerData) {
    const created = await prisma.designer.upsert({ where: { slug: d.slug }, update: {}, create: d });
    designers.set(d.slug, created);
  }

  // ---- Shipping zones/rates ----
  await prisma.shippingRate.deleteMany({});
  await prisma.shippingZone.deleteMany({});
  for (const zone of SHIPPING_ZONES) {
    const created = await prisma.shippingZone.create({ data: { name: zone.zoneName, countries: ["US"] } });
    for (const band of zone.bands) {
      await prisma.shippingRate.create({
        data: {
          shippingZoneId: created.id,
          minWeightGrams: band.minWeightGrams,
          maxWeightGrams: band.maxWeightGrams,
          rateCents: band.rateCents,
          transitMinDays: band.transitMinDays,
          transitMaxDays: band.transitMaxDays,
        },
      });
    }
  }

  // ---- Products ----
  type SeedProduct = {
    name: string;
    slug: string;
    description: string;
    category: string;
    designer: string;
    basePriceCents: number;
    compareAtCents?: number;
    readyToShip: boolean;
    processingMinDays?: number;
    processingMaxDays?: number;
    weightGrams: number;
    isFeatured?: boolean;
    sizes: string[];
    colors: string[];
    imageSeed: string;
  };

  const products: SeedProduct[] = [
    { name: "Ivory Jamdani Saree", slug: "ivory-jamdani-saree", description: "Hand-woven Jamdani saree in ivory silk with gold-thread motifs, woven on traditional looms in Narayanganj.", category: "sarees", designer: "anindo-textiles", basePriceCents: 24900, compareAtCents: 29900, readyToShip: true, weightGrams: 600, isFeatured: true, sizes: ["One Size"], colors: ["Ivory"], imageSeed: "taznee-saree-ivory" },
    { name: "Burgundy Katan Silk Saree", slug: "burgundy-katan-silk-saree", description: "Rich burgundy Katan silk saree with a woven gold border, ideal for evening occasions.", category: "sarees", designer: "anindo-textiles", basePriceCents: 27900, readyToShip: false, processingMinDays: 5, processingMaxDays: 9, weightGrams: 650, isFeatured: true, sizes: ["One Size"], colors: ["Burgundy"], imageSeed: "taznee-saree-burgundy" },
    { name: "Forest Green Block-Print Saree", slug: "forest-green-block-print-saree", description: "Breathable cotton saree in forest green with hand-block printed florals from Meherun Studio.", category: "sarees", designer: "meherun-studio", basePriceCents: 8900, readyToShip: true, weightGrams: 450, sizes: ["One Size"], colors: ["Forest Green"], imageSeed: "taznee-saree-green" },
    { name: "Gold Tissue Wedding Saree", slug: "gold-tissue-wedding-saree", description: "Luminous gold tissue saree with hand-embroidered zari work, made to order for wedding season.", category: "wedding", designer: "nokshi-house", basePriceCents: 42900, compareAtCents: 48900, readyToShip: false, processingMinDays: 10, processingMaxDays: 18, weightGrams: 800, isFeatured: true, sizes: ["One Size"], colors: ["Gold"], imageSeed: "taznee-wedding-gold-saree" },
    { name: "Rose Pink Anarkali Salwar Set", slug: "rose-pink-anarkali-salwar-set", description: "Floor-length Anarkali-style salwar kameez in rose pink georgette with nokshi kantha embroidery.", category: "salwar-kameez", designer: "nokshi-house", basePriceCents: 15900, readyToShip: false, processingMinDays: 4, processingMaxDays: 8, weightGrams: 700, isFeatured: true, sizes: ["S", "M", "L", "XL"], colors: ["Rose Pink"], imageSeed: "taznee-salwar-pink" },
    { name: "Charcoal Cotton Salwar Kameez", slug: "charcoal-cotton-salwar-kameez", description: "Everyday charcoal cotton salwar kameez with subtle embroidered neckline, breathable for daily wear.", category: "salwar-kameez", designer: "meherun-studio", basePriceCents: 6900, readyToShip: true, weightGrams: 500, sizes: ["S", "M", "L", "XL"], colors: ["Charcoal"], imageSeed: "taznee-salwar-charcoal" },
    { name: "Sky Blue Chikankari Kameez Set", slug: "sky-blue-chikankari-kameez-set", description: "Sky blue lawn cotton kameez with delicate chikankari hand embroidery, paired with matching dupatta.", category: "salwar-kameez", designer: "nokshi-house", basePriceCents: 9900, readyToShip: true, weightGrams: 550, sizes: ["S", "M", "L"], colors: ["Sky Blue"], imageSeed: "taznee-salwar-blue" },
    { name: "Mustard Yellow Palazzo Set", slug: "mustard-yellow-palazzo-set", description: "Relaxed-fit palazzo salwar set in mustard yellow cotton-silk blend with printed dupatta.", category: "salwar-kameez", designer: "meherun-studio", basePriceCents: 7900, readyToShip: true, weightGrams: 520, sizes: ["S", "M", "L", "XL"], colors: ["Mustard"], imageSeed: "taznee-salwar-mustard" },
    { name: "Classic White Cotton Panjabi", slug: "classic-white-cotton-panjabi", description: "Tailored white cotton panjabi with mandarin collar, a wardrobe staple for Eid and Friday prayers.", category: "panjabi", designer: "meherun-studio", basePriceCents: 5900, readyToShip: true, weightGrams: 400, isFeatured: true, sizes: ["S", "M", "L", "XL", "XXL"], colors: ["White"], imageSeed: "taznee-panjabi-white" },
    { name: "Indigo Embroidered Panjabi", slug: "indigo-embroidered-panjabi", description: "Indigo dyed panjabi with hand-embroidered placket detailing, made to order in small batches.", category: "panjabi", designer: "nokshi-house", basePriceCents: 8900, readyToShip: false, processingMinDays: 4, processingMaxDays: 7, weightGrams: 420, sizes: ["S", "M", "L", "XL"], colors: ["Indigo"], imageSeed: "taznee-panjabi-indigo" },
    { name: "Maroon Silk Wedding Panjabi", slug: "maroon-silk-wedding-panjabi", description: "Maroon silk panjabi with gold Jamdani panel down the front, designed for grooms and wedding guests.", category: "wedding", designer: "anindo-textiles", basePriceCents: 18900, readyToShip: false, processingMinDays: 7, processingMaxDays: 12, weightGrams: 480, isFeatured: true, sizes: ["S", "M", "L", "XL"], colors: ["Maroon"], imageSeed: "taznee-panjabi-maroon" },
    { name: "Emerald Green Sherwani", slug: "emerald-green-sherwani", description: "Structured emerald green sherwani with gold button detailing, tailored to order for weddings.", category: "wedding", designer: "nokshi-house", basePriceCents: 32900, readyToShip: false, processingMinDays: 12, processingMaxDays: 20, weightGrams: 900, sizes: ["S", "M", "L", "XL"], colors: ["Emerald"], imageSeed: "taznee-sherwani-green" },
    { name: "Blush Pink Bridal Lehenga", slug: "blush-pink-bridal-lehenga", description: "Hand-embellished blush pink bridal lehenga with dupatta, crafted over several weeks by our artisans.", category: "wedding", designer: "nokshi-house", basePriceCents: 58900, compareAtCents: 68900, readyToShip: false, processingMinDays: 14, processingMaxDays: 25, weightGrams: 1200, isFeatured: true, sizes: ["S", "M", "L"], colors: ["Blush Pink"], imageSeed: "taznee-lehenga-pink" },
    { name: "Gold Kundan Choker Necklace Set", slug: "gold-kundan-choker-necklace-set", description: "Gold-plated kundan choker with matching earrings, a bridal favorite from Shonar Baksho.", category: "jewelry", designer: "shonar-baksho", basePriceCents: 11900, readyToShip: true, weightGrams: 250, isFeatured: true, sizes: ["One Size"], colors: ["Gold"], imageSeed: "taznee-jewelry-choker" },
    { name: "Ruby Red Jhumka Earrings", slug: "ruby-red-jhumka-earrings", description: "Classic bell-shaped jhumka earrings with ruby-red stone accents and pearl drops.", category: "jewelry", designer: "shonar-baksho", basePriceCents: 4900, readyToShip: true, weightGrams: 100, sizes: ["One Size"], colors: ["Ruby Red"], imageSeed: "taznee-jewelry-jhumka" },
    { name: "Emerald Tikka & Maang Tikka Set", slug: "emerald-tikka-maang-tikka-set", description: "Emerald-toned maang tikka set with matching nose ring, made for bridal ensembles.", category: "jewelry", designer: "shonar-baksho", basePriceCents: 6900, readyToShip: false, processingMinDays: 3, processingMaxDays: 6, weightGrams: 120, sizes: ["One Size"], colors: ["Emerald"], imageSeed: "taznee-jewelry-tikka" },
    { name: "Layered Gold Bangles (Set of 6)", slug: "layered-gold-bangles-set-of-6", description: "A stackable set of six gold-plated bangles with intricate filigree detailing.", category: "jewelry", designer: "shonar-baksho", basePriceCents: 5900, readyToShip: true, weightGrams: 180, sizes: ["S", "M", "L"], colors: ["Gold"], imageSeed: "taznee-jewelry-bangles" },
    { name: "Cream Nokshi Kantha Dupatta", slug: "cream-nokshi-kantha-dupatta", description: "Hand-stitched nokshi kantha dupatta in cream cotton, a versatile layering piece.", category: "salwar-kameez", designer: "nokshi-house", basePriceCents: 4900, readyToShip: true, weightGrams: 200, sizes: ["One Size"], colors: ["Cream"], imageSeed: "taznee-dupatta-cream" },
  ];

  for (const p of products) {
    const category = categories.get(p.category)!;
    const designer = designers.get(p.designer)!;

    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        categoryId: category.id,
        designerId: designer.id,
        basePriceCents: p.basePriceCents,
        compareAtCents: p.compareAtCents,
        readyToShip: p.readyToShip,
        processingMinDays: p.processingMinDays ?? 3,
        processingMaxDays: p.processingMaxDays ?? 7,
        weightGrams: p.weightGrams,
        isFeatured: p.isFeatured ?? false,
      },
    });

    const existingImages = await prisma.productImage.count({ where: { productId: product.id } });
    if (existingImages === 0) {
      await prisma.productImage.createMany({
        data: [0, 1].map((i) => ({
          productId: product.id,
          url: img(`${p.imageSeed}-${i}`),
          altText: p.name,
          position: i,
        })),
      });
    }

    for (const size of p.sizes) {
      for (const color of p.colors) {
        const sku = `${p.slug}-${size}-${color}`.toUpperCase().replace(/\s+/g, "-");
        const variant = await prisma.productVariant.upsert({
          where: { productId_size_color: { productId: product.id, size, color } },
          update: {},
          create: { productId: product.id, size, color, sku },
        });
        await prisma.inventory.upsert({
          where: { variantId: variant.id },
          update: {},
          create: { variantId: variant.id, quantity: 25 },
        });
      }
    }
  }

  // ---- Demo users ----
  const demoPasswordHash = await bcrypt.hash("password123", 10);
  const demoUser = await prisma.user.upsert({
    where: { email: "demo@taznee.com" },
    update: {},
    create: { name: "Demo Customer", email: "demo@taznee.com", passwordHash: demoPasswordHash, role: "CUSTOMER" },
  });

  const adminPasswordHash = await bcrypt.hash("adminpass123", 10);
  await prisma.user.upsert({
    where: { email: "admin@taznee.com" },
    update: {},
    create: { name: "Taznee Admin", email: "admin@taznee.com", passwordHash: adminPasswordHash, role: "ADMIN" },
  });

  const demoAddress = await prisma.address.upsert({
    where: { id: "demo-address-seed" },
    update: {},
    create: {
      id: "demo-address-seed",
      userId: demoUser.id,
      fullName: "Demo Customer",
      line1: "123 Main Street",
      city: "Austin",
      state: "TX",
      postalCode: "78701",
      country: "US",
      isDefault: true,
    },
  });

  // ---- Demo in-transit order ----
  const sareeVariant = await prisma.productVariant.findFirst({
    where: { product: { slug: "ivory-jamdani-saree" } },
    include: { product: true },
  });
  const earringsVariant = await prisma.productVariant.findFirst({
    where: { product: { slug: "ruby-red-jhumka-earrings" } },
    include: { product: true },
  });

  if (sareeVariant && earringsVariant) {
    const existingDemoOrder = await prisma.order.findFirst({ where: { id: "demo-order-seed" } });
    if (!existingDemoOrder) {
      const zone = SHIPPING_ZONES[0];
      const band = zone.bands[0];
      const shippingCents = band.rateCents;

      const sareeEstimate = calculateDeliveryEstimate({
        readyToShip: sareeVariant.product.readyToShip,
        processingMinDays: sareeVariant.product.processingMinDays,
        processingMaxDays: sareeVariant.product.processingMaxDays,
        transitMinDays: band.transitMinDays,
        transitMaxDays: band.transitMaxDays,
        fromDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      });

      const subtotalCents = sareeVariant.product.basePriceCents + earringsVariant.product.basePriceCents;

      const order = await prisma.order.create({
        data: {
          id: "demo-order-seed",
          userId: demoUser.id,
          addressId: demoAddress.id,
          status: "IN_TRANSIT",
          subtotalCents,
          shippingCents,
          totalCents: subtotalCents + shippingCents,
          estimatedDeliveryMinDays: sareeEstimate.totalMinDays,
          estimatedDeliveryMaxDays: sareeEstimate.totalMaxDays,
          estimatedDeliveryMinDate: sareeEstimate.estimatedMinDate,
          estimatedDeliveryMaxDate: sareeEstimate.estimatedMaxDate,
          createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
          items: {
            create: [
              {
                variantId: sareeVariant.id,
                nameSnapshot: sareeVariant.product.name,
                sizeSnapshot: sareeVariant.size,
                colorSnapshot: sareeVariant.color,
                priceCentsSnapshot: sareeVariant.product.basePriceCents,
                shippingCentsSnapshot: Math.round(shippingCents / 2),
                quantity: 1,
              },
              {
                variantId: earringsVariant.id,
                nameSnapshot: earringsVariant.product.name,
                sizeSnapshot: earringsVariant.size,
                colorSnapshot: earringsVariant.color,
                priceCentsSnapshot: earringsVariant.product.basePriceCents,
                shippingCentsSnapshot: Math.round(shippingCents / 2),
                quantity: 1,
              },
            ],
          },
        },
      });

      await prisma.payment.create({
        data: { orderId: order.id, amountCents: subtotalCents + shippingCents, status: "SUCCEEDED" },
      });
    }
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
