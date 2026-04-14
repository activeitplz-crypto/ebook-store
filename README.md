# JanzyEbooks Store

A premium digital ebook storefront built with **Next.js 15**, **Tailwind CSS**, and **Supabase**.

## 🚀 Features

- **Dynamic Catalog**: Manage ebooks and best sellers directly via Supabase.
- **Dynamic Payment Methods**: Add Easypaisa, JazzCash, or any bank account via the database.
- **Verification System**: Automated checkout workflow with manual verification.
- **Responsive Design**: Fully optimized for mobile, tablet, and desktop.
- **Secure Auth**: Powered by Supabase Auth.

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS + ShadCN UI
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage (for payment receipts)

## 📦 Getting Started

1. **Environment Variables**:
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

2. **Database Setup**:
   Run the SQL scripts provided in the app components to create the necessary tables:
   - `products`
   - `orders`
   - `payment_methods`
   - `site_settings`
   - `reviews`

3. **Install & Run**:
   ```bash
   npm install
   npm run dev
   ```

## 📄 License
MIT
