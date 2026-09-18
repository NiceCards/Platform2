import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import config from '../config/env.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Order from '../models/Order.js';
import DeliveredOrder from '../models/DeliveredOrder.js';
import { generateProductImageSvg } from './generateImages.js';
import { uploadBuffer, isStorageConfigured } from '../services/storage.js';
import { slugify, generateOrderId } from '../utils/helpers.js';

/**
 * Seeds the database with categories, products, a demo user, an admin
 * account and sample orders. Safe to run multiple times (idempotent).
 */
const seedDatabase = async () => {
  await mongoose.connect(config.mongoUri);
  console.log('Connected to MongoDB. Seeding data...');
  console.log(
    isStorageConfigured()
      ? 'Product images will be uploaded to Cloudflare R2.'
      : 'Cloudflare R2 not configured - product images fall back to base64 in MongoDB.'
  );

  // ---- Clean existing seed collections (only seed-generated docs) ----
  await Promise.all([
    Category.deleteMany({}),
    Product.deleteMany({}),
    Order.deleteMany({}),
    DeliveredOrder.deleteMany({}),
    User.deleteMany({}),
  ]);

  // ---- Categories ----
  const categoryData = [
    { name: 'Food & Dining', description: 'Delicious meals, coffee and restaurant gift cards.' },
    { name: 'Shopping', description: 'Gift cards for your favourite online and retail stores.' },
    { name: 'Travel', description: 'Flights, hotels and holiday experiences.' },
    { name: 'Entertainment', description: 'Movies, music, streaming and events.' },
    { name: 'Gaming', description: 'Top-up cards and store credit for gaming platforms.' },
    { name: 'Fashion', description: 'Style up with fashion and apparel store cards.' },
    { name: 'Electronics', description: 'Gadgets, devices and accessories.' },
    { name: 'Health & Beauty', description: 'Self-care, wellness and beauty gift cards.' },
  ];

  const categories = await Category.insertMany(
    categoryData.map((c) => ({ ...c, slug: slugify(c.name) }))
  );
  console.log(`Seeded ${categories.length} categories`);

  const cat = (name) => categories.find((c) => c.name === name)._id;

  // ---- Products ----
  // Prices are in Indian Rupees (INR). Converted from the original USD list at 1 USD = ₹83.
  const productData = [
    { name: 'Starbucks Gift Card', brand: 'Starbucks', category: 'Food & Dining', price: 2075, originalPrice: 2490, stock: 60, rating: 4.8, numReviews: 320, description: 'Coffee & tea lovers favourite. Redeemable at thousands of Starbucks locations worldwide.' },
    { name: 'Uber Eats Voucher', brand: 'Uber Eats', category: 'Food & Dining', price: 4150, stock: 45, rating: 4.6, numReviews: 210, description: 'Order food from your favourite local restaurants with zero delivery hassle.' },
    { name: 'Pizza Hut Gift Card', brand: 'Pizza Hut', category: 'Food & Dining', price: 1660, originalPrice: 2075, stock: 80, rating: 4.5, numReviews: 175, description: 'Hot, cheesy pizza delivered straight to your door.' },
    { name: 'Domino’s Card', brand: 'Domino’s', category: 'Food & Dining', price: 1245, stock: 100, rating: 4.4, numReviews: 140, description: 'Fast and fresh pizza, sides and desserts.' },
    { name: 'Amazon Gift Card', brand: 'Amazon', category: 'Shopping', price: 8300, stock: 120, rating: 4.9, numReviews: 890, description: 'Shop millions of products across every category on Amazon.' },
    { name: 'Walmart Gift Card', brand: 'Walmart', category: 'Shopping', price: 6225, originalPrice: 7470, stock: 55, rating: 4.7, numReviews: 260, description: 'Groceries, electronics, clothing and more, all in one place.' },
    { name: 'Nike Gift Card', brand: 'Nike', category: 'Fashion', price: 4980, stock: 40, rating: 4.8, numReviews: 190, description: 'Premium sportswear, footwear and accessories from Nike.' },
    { name: 'H&M Gift Card', brand: 'H&M', category: 'Fashion', price: 3320, stock: 70, rating: 4.5, numReviews: 150, description: 'Trendy fashion at affordable prices for the whole family.' },
    { name: 'Adidas Voucher', brand: 'Adidas', category: 'Fashion', price: 4565, originalPrice: 5395, stock: 35, rating: 4.6, numReviews: 165, description: 'Iconic three-stripes gear for training and everyday wear.' },
    { name: 'Airbnb Gift Card', brand: 'Airbnb', category: 'Travel', price: 12450, originalPrice: 14525, stock: 25, rating: 4.9, numReviews: 340, description: 'Book unique stays and experiences anywhere in the world.' },
    { name: 'Expedia Gift Card', brand: 'Expedia', category: 'Travel', price: 9960, stock: 30, rating: 4.6, numReviews: 120, description: 'Hotels, flights and holiday packages all in one place.' },
    { name: 'Netflix Gift Card', brand: 'Netflix', category: 'Entertainment', price: 2490, stock: 90, rating: 4.8, numReviews: 520, description: 'Stream award-winning movies, series and documentaries.' },
    { name: 'Spotify Gift Card', brand: 'Spotify', category: 'Entertainment', price: 1660, originalPrice: 2075, stock: 110, rating: 4.7, numReviews: 460, description: 'Millions of songs and podcasts. Premium music for everyone.' },
    { name: 'Disney+ Card', brand: 'Disney+', category: 'Entertainment', price: 2905, stock: 65, rating: 4.7, numReviews: 210, description: 'Disney, Pixar, Marvel, Star Wars and National Geographic.' },
    { name: 'Xbox Gift Card', brand: 'Xbox', category: 'Gaming', price: 4150, stock: 75, rating: 4.8, numReviews: 380, description: 'Games, add-ons and subscriptions for your Xbox console.' },
    { name: 'PlayStation Store Card', brand: 'PlayStation', category: 'Gaming', price: 8300, originalPrice: 9130, stock: 60, rating: 4.9, numReviews: 540, description: 'Top up your PlayStation wallet for games and DLC.' },
    { name: 'Steam Gift Card', brand: 'Steam', category: 'Gaming', price: 3320, stock: 85, rating: 4.8, numReviews: 430, description: 'PC gaming store credit for thousands of titles.' },
    { name: 'Apple Gift Card', brand: 'Apple', category: 'Electronics', price: 16600, stock: 20, rating: 4.9, numReviews: 610, description: 'Use for Apple products, apps, music, movies and more.' },
    { name: 'Best Buy Gift Card', brand: 'Best Buy', category: 'Electronics', price: 6640, originalPrice: 7885, stock: 28, rating: 4.6, numReviews: 185, description: 'Electronics and appliances from the biggest tech retailer.' },
    { name: 'Sephora Gift Card', brand: 'Sephora', category: 'Health & Beauty', price: 3735, stock: 50, rating: 4.7, numReviews: 230, description: 'Makeup, skincare and fragrance from top beauty brands.' },
    { name: 'Bath & Body Works Card', brand: 'Bath & Body Works', category: 'Health & Beauty', price: 2905, originalPrice: 3320, stock: 48, rating: 4.5, numReviews: 130, description: 'Fragrant candles, body care and home scents.' },
    { name: 'Nordstrom Gift Card', brand: 'Nordstrom', category: 'Shopping', price: 7470, stock: 22, rating: 4.6, numReviews: 160, description: 'Designer fashion, beauty and home essentials.' },
    { name: 'Marriott Gift Card', brand: 'Marriott', category: 'Travel', price: 20750, stock: 12, rating: 4.8, numReviews: 95, description: 'Luxury stays at thousands of hotels worldwide.' },
    { name: 'AMC Theatres Card', brand: 'AMC', category: 'Entertainment', price: 2075, stock: 95, rating: 4.4, numReviews: 110, description: 'Movie tickets, concessions and premium formats.' },
  ];

  const products = [];
  for (let i = 0; i < productData.length; i += 1) {
    const data = productData[i];
    const images = await Promise.all(
      [0, 1].map((variant) =>
        uploadBuffer({
          buffer: Buffer.from(
            generateProductImageSvg({
              brand: data.brand,
              name: data.name,
              price: data.price,
              index: i,
              variant,
            }),
            'utf-8'
          ),
          mimetype: 'image/svg+xml',
          originalName: `${slugify(data.name)}-${variant}.svg`,
          prefix: 'products',
        })
      )
    );

    const product = await Product.create({
      name: data.name,
      slug: slugify(data.name),
      category: cat(data.category),
      description: data.description,
      price: data.price,
      originalPrice: data.originalPrice || 0,
      brand: data.brand,
      sku: `${data.brand.toUpperCase().replace(/[^A-Z0-9]/g, '')}-${String(i + 1).padStart(3, '0')}`,
      images,
      stock: data.stock,
      rating: data.rating,
      numReviews: data.numReviews,
      isActive: true,
    });
    products.push(product);
  }
  console.log(`Seeded ${products.length} products`);

  // ---- Demo user ----
  const demoUser = await User.create({
    name: 'Demo Customer',
    email: 'demo@nicecards.com',
    phone: '+1 555 010 1234',
    password: 'demo123',
  });
  console.log('Seeded demo user: demo@nicecards.com / demo123');

  // ---- Admin user record ----
  const adminPasswordHash = await bcrypt.hash(config.adminPassword, 10);
  await User.create({
    name: 'Nice Cards Admin',
    email: 'admin@nicecards.com',
    phone: '+1 555 000 0000',
    password: adminPasswordHash,
  });

  // ---- Sample orders (last 6 months) ----
  const now = new Date();
  let orderCount = 0;
  const randomDate = (monthsAgo) => {
    const d = new Date(now);
    d.setMonth(d.getMonth() - monthsAgo);
    d.setDate(1 + Math.floor(Math.random() * 20));
    d.setHours(10 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60), 0, 0);
    if (d > now) d.setTime(now.getTime() - 1000);
    return d;
  };

  const orderTemplates = [
    { name: 'Sarah Wilson', email: 'sarah.wilson@example.com', phone: '+1 555 010 2244', address: '14 Maple Ave, Springfield, IL 62704' },
    { name: 'James Brown', email: 'james.brown@example.com', phone: '+1 555 010 3345', address: '88 Birch Lane, Austin, TX 73301' },
    { name: 'Emily Davis', email: 'emily.davis@example.com', phone: '+1 555 010 4456', address: '23 Oak Street, Denver, CO 80202' },
    { name: 'Michael Clark', email: 'michael.clark@example.com', phone: '+1 555 010 5567', address: '67 Pine Road, Seattle, WA 98101' },
    { name: 'Olivia Moore', email: 'olivia.moore@example.com', phone: '+1 555 010 6678', address: '301 Cedar Blvd, Miami, FL 33101' },
    { name: 'David Lee', email: 'david.lee@example.com', phone: '+1 555 010 7789', address: '5 Elm Court, Chicago, IL 60601' },
  ];

  for (let i = 0; i < 32; i += 1) {
    const tpl = orderTemplates[i % orderTemplates.length];
    const itemCount = 1 + Math.floor(Math.random() * 3);
    const chosen = new Set();
    const items = [];
    let total = 0;
    for (let j = 0; j < itemCount; j += 1) {
      let idx = Math.floor(Math.random() * products.length);
      while (chosen.has(idx)) idx = Math.floor(Math.random() * products.length);
      chosen.add(idx);
      const p = products[idx];
      const quantity = 1 + Math.floor(Math.random() * 2);
      items.push({
        product: p._id,
        name: p.name,
        price: p.price,
        quantity,
        image: p.images[0],
      });
      total += p.price * quantity;
    }

    const createdAt = randomDate(Math.floor(Math.random() * 6));
    const isDelivered = Math.random() > 0.35;

    const orderId = generateOrderId();
    const order = {
      orderId,
      user: null,
      customer: { name: tpl.name, email: tpl.email, phone: tpl.phone, address: tpl.address },
      items,
      total: Number(total.toFixed(2)),
      status: 'pending',
      createdAt,
    };

    if (isDelivered) {
      const deliveredAt = new Date(createdAt.getTime() + (1 + Math.floor(Math.random() * 10)) * 86400000);
      await DeliveredOrder.create({
        orderId,
        user: null,
        customer: order.customer,
        items,
        total: order.total,
        orderDate: createdAt,
        deliveredAt: deliveredAt > now ? now : deliveredAt,
        status: 'delivered',
        createdAt,
      });
    } else {
      await Order.create(order);
    }
    orderCount += 1;
  }
  console.log(`Seeded ${orderCount} sample orders`);

  await mongoose.disconnect();
  console.log('Database seeded successfully!');
};

seedDatabase()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seeding failed:', err);
    process.exit(1);
  });
