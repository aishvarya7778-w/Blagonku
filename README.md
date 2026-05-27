# Blagonku

Blagonku is a full-stack, production-oriented blogging platform with a premium dark cosmic UI, JWT authentication, role-based admin moderation, MongoDB Atlas persistence, and Cloudinary image uploads.

## Stack

- Frontend: React, Vite, Tailwind CSS, Framer Motion, Lucide React, TipTap
- Backend: Node.js, Express, Mongoose
- Database: MongoDB Atlas free tier
- Auth: JWT access tokens, refresh-token cookie rotation, bcrypt hashing
- Storage: Cloudinary free tier
- Deployment: Vercel frontend, Render backend

## Local Setup

```bash
npm run install:all
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
npm run dev
```

Frontend runs on `http://localhost:5173`.
Backend runs on `http://localhost:5000`.

## Required Environment Variables

Backend:

```bash
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb+srv://...
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

Frontend:

```bash
VITE_API_URL=http://localhost:5000/api
```

## Admin Account

Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `backend/.env`, then run:

```bash
npm run seed:admin --prefix backend
```

## Project Structure

```text
backend
  config        MongoDB and Cloudinary config
  controllers   Request handlers
  middleware    Auth, admin, validation, uploads, errors
  models        User, Blog, Comment schemas and indexes
  routes        REST API routes
  services      Cloudinary integration
  utils         Tokens, pagination, text helpers
  validators    Joi schemas

frontend/src
  components    Reusable UI pieces
  context       Auth provider
  hooks         Shared hooks
  layouts       App shell
  pages         Route-level screens
  services      API client
  assets        Space artwork
```

## Production Notes

- Render free instances sleep after inactivity, so the first API request can be slow.
- Keep MongoDB Atlas indexes enabled for the blog/search/admin queries.
- Cloudinary uploads are limited to 2 MB by the API to protect free-tier memory.
- The backend uses Helmet, CORS, rate limiting, HPP protection, Mongo sanitization, XSS sanitization, and centralized errors.
