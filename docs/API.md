# Blagonku API

Base URL: `/api`

All protected routes require:

```http
Authorization: Bearer <accessToken>
```

Refresh tokens are stored in an HTTP-only cookie.

## Auth

### Signup

`POST /auth/signup`

```json
{
  "username": "Aishu",
  "email": "aishu@example.com",
  "password": "password123",
  "bio": "Cosmic writer",
  "adminSecretKey": "optional-private-admin-key"
}
```

`adminSecretKey` is optional and is validated only on the backend against `ADMIN_SECRET_KEY`. If it is absent or invalid, the account is created as a normal `user`.

Response `201`:

```json
{
  "user": { "_id": "...", "username": "Aishu", "email": "aishu@example.com", "role": "user" },
  "accessToken": "..."
}
```

### Login

`POST /auth/login`

```json
{
  "email": "aishu@example.com",
  "password": "password123"
}
```

Response `200`: same as signup.

### Refresh

`POST /auth/refresh`

Response `200`:

```json
{
  "user": { "_id": "...", "username": "Aishu", "role": "user" },
  "accessToken": "..."
}
```

### Logout

`POST /auth/logout`

Response `200`:

```json
{ "message": "Logged out" }
```

## Blogs

### List Published Blogs

`GET /blogs?page=1&limit=9&search=mars&category=Cosmology&sort=trending`

Response `200`:

```json
{
  "data": [{ "_id": "...", "title": "Mars Colony", "slug": "mars-colony" }],
  "meta": { "page": 1, "limit": 9, "total": 1, "pages": 1 }
}
```

### Create Blog

`POST /blogs`

Content type: `multipart/form-data`

Fields: `title`, `content`, `excerpt`, `category`, `tags`, `status`, optional `coverImage`.

Response `201`:

```json
{
  "data": {
    "_id": "...",
    "title": "Event Horizon Notes",
    "slug": "event-horizon-notes",
    "status": "published"
  }
}
```

### Get Blog

`GET /blogs/:slug`

Response `200`:

```json
{
  "data": { "_id": "...", "title": "Event Horizon Notes", "content": "<p>...</p>" },
  "related": []
}
```

### Update Blog

`PATCH /blogs/:id`

Protected. Authors can edit their own blogs; admins can edit all.

### Delete Blog

`DELETE /blogs/:id`

Protected. Returns `200`.

### Like Blog

`POST /blogs/:id/like`

Response `200`:

```json
{ "liked": true, "likesCount": 12 }
```

## Comments

### List Comments

`GET /comments/:blogId`

### Create Comment

`POST /comments/:blogId`

```json
{ "content": "Beautifully written." }
```

### Edit Comment

`PUT /comments/:commentId`

Only the owner or an admin can edit.

```json
{ "content": "Updated thought." }
```

### Delete Comment

`DELETE /comments/:commentId`

Only the owner or an admin can delete. Deleting a comment also deletes nested replies.

### Reply

`POST /comments/:commentId/reply`

```json
{ "content": "Agreed." }
```

### Like Comment

`POST /comments/:commentId/like`

Response `200`:

```json
{ "liked": true, "likesCount": 3, "likes": ["..."] }
```

## Users

### Update Profile

`PATCH /users/me`

Content type: `multipart/form-data`

Fields: `username`, `bio`, optional `profileImage`.

### Toggle Bookmark

`POST /users/bookmarks/:blogId`

### List Bookmarks

`GET /users/bookmarks`

## Admin

All admin routes require `role: admin`.

- `GET /admin/dashboard`
- `GET /admin/users`
- `GET /admin/blogs`
- `PATCH /admin/users/:id/suspension`
- `PATCH /admin/blogs/:id`
- `PATCH /admin/comments/:id`
