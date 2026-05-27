# Deployment Guide

## MongoDB Atlas Free Tier

1. Create a free M0 Atlas cluster.
2. Create a database user with read/write permissions.
3. Add your local IP for development and `0.0.0.0/0` for Render access.
4. Copy the connection string into `MONGODB_URI`.
5. Use database name `blagonku` in the URI.

## Cloudinary Free Tier

1. Create a Cloudinary account.
2. Copy cloud name, API key, and API secret.
3. Add them to Render environment variables.
4. The API stores profile images in `blagonku/profiles` and covers in `blagonku/blogs`.

## Render Backend

1. Create a new Web Service from this repository.
2. Set root directory to `backend`.
3. Build command: `npm install`
4. Start command: `npm start`
5. Add all variables from `backend/.env.example`.
6. Set `CLIENT_URL` to your Vercel frontend URL.

The included `render.yaml` can also be used as a Render blueprint.

## Vercel Frontend

1. Import the repository in Vercel.
2. Set root directory to `frontend`.
3. Framework preset: Vite.
4. Build command: `npm run build`.
5. Output directory: `dist`.
6. Add `VITE_API_URL=https://your-render-service.onrender.com/api`.

## Production Checklist

- Use long random values for both JWT secrets.
- Seed an admin account with `npm run seed:admin --prefix backend`.
- Confirm CORS `CLIENT_URL` matches the deployed frontend.
- Confirm Cloudinary credentials are set before testing uploads.
- Confirm MongoDB Atlas network access allows Render.
