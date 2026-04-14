# Premium Ebook Store

A modern, high-performance digital storefront built with **Next.js 15**, **Tailwind CSS**, and **Supabase**.

## 🚀 Netlify Deployment Guide

When deploying to Netlify, use these **Build Settings**:

- **Runtime**: Next.js
- **Base directory**: (Leave empty)
- **Build command**: `npm run build`
- **Publish directory**: `.next`

### 🔑 Environment Variables
You **must** add these in the Netlify Dashboard (**Site settings > Environment variables**):

1. `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase Project URL.
2. `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase Anonymous Key.
3. `NEXT_PUBLIC_ADMIN_EMAIL`: `itxprince440@gmail.com` (or your chosen admin email).
4. `NEXT_PUBLIC_BASE_URL`: Your deployed site URL (e.g., `https://your-site.netlify.app`).

## 🛠️ Features

- **Dynamic Catalog**: Manage digital products directly via Supabase.
- **Dynamic Payment Methods**: Support for Easypaisa, JazzCash, and Banks managed via DB.
- **Verification System**: Professional checkout workflow with admin verification.
- **Admin Panel**: Management tools for orders, users, and content.

## 💻 Local Development

1. Clone the repository.
2. Create a `.env.local` file with the variables listed above.
3. Run `npm install`.
4. Run `npm run dev`.

## 📄 License
MIT
