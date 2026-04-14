# Premium Digital Ebook Store

A professional, high-conversion digital storefront built with **Next.js 15**, **Tailwind CSS**, and **Supabase**.

## 🚀 Features

- **Dynamic Catalog**: Manage products, best sellers, and categories directly via Supabase.
- **Professional Checkout**: Structured order flow with integrated Easypaisa and JazzCash support.
- **Verification System**: Built-in payment screenshot upload and manual verification workflow.
- **Content Management**: Update store info (email, WhatsApp, logo) via the `site_settings` table.
- **Responsive Design**: Fully optimized for mobile, tablet, and desktop.

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS + ShadCN UI
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage (for payment receipts)

## 📦 Getting Started

1. **Environment Variables**:
   Create a `.env.local` file with your credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_ADMIN_EMAIL=itxprince440@gmail.com
   ```

2. **Database Setup**:
   Run the provided SQL scripts in your Supabase SQL Editor to create the following tables:
   - `products`: Your ebook inventory.
   - `orders`: Customer purchase requests.
   - `payment_methods`: Easypaisa/JazzCash details.
   - `site_settings`: Store-wide configuration (Logo, Name, Contact).
   - `reviews`: Customer testimonials.

3. **Install & Run**:
   ```bash
   npm install
   npm run dev
   ```

## 📄 License
MIT
