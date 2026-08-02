# E-Commerce Admin Dashboard

## Project Overview
This repository contains a full-stack admin dashboard for an e-commerce platform. It is organized as a monorepo with a React + TypeScript frontend in the client folder and a Node.js + Express + Prisma backend in the server folder.

## Main Features
- Admin authentication and authorization
- Role-based access control (RBAC)
- Dashboard analytics
- User, role, and permission management
- Category, brand, attribute, and product management
- Media upload and management via Cloudinary
- Prisma-based database access with PostgreSQL

## Tech Stack
- Node.js
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT
- Zod
- Multer
- Cloudinary
- Bcrypt

## Frontend and Backend URLs

### Frontend app
- https://e-commerce-admin-dashboard-front-end.onrender.com

### Backend API
- https://e-commerce-admin-dashboard-backend.onrender.com

## Seeded Accounts
### Super Admin
- Email: `admin@trendsbird.test`
- Password: `Admin@12345`

### Catalog User
- Email: `catalog@trendsbird.test`
- Password: `Catalog@12345`

## Project Structure (Back-End)

```text
Backend: 

server/
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── src/
│   ├── app.ts
│   ├── index.ts
│   ├── config/
│   ├── constants/
│   ├── middlewares/
│   ├── modules/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── permission/
│   │   ├── permission-group/
│   │   ├── role/
│   │   ├── user/
│   │   ├── category/
│   │   ├── brand/
│   │   ├── attribute/
│   │   ├── media/
│   │   └── product/
│   ├── types/
│   ├── utils/
│   └── generated/
└── package.json
```

## Installation
```bash
git clone https://github.com/md-abunayem/e-commerce-admin-dashboard.git
cd server
npm install
```

### API base path
```text
https://e-commerce-admin-dashboard-backend.onrender.com/api/v1
```

## Frontend Environment Variables
Create a `.env` file inside the `client` folder for local development.

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

For Render deployment, set the same variable in the Render dashboard for the frontend service:

```env
VITE_API_BASE_URL=https://e-commerce-admin-dashboard-backend.onrender.com/api/v1
```

## Backend Environment Variables
Create a `.env` file inside the `server` folder for local development.

```env
PORT=5000
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
DATABASE_URL=your_database_url
SUPER_ADMIN_EMAIL=admin@trendsbird.test
SUPER_ADMIN_NAME=Super Admin
SUPER_ADMIN_PASSWORD=Admin@12345
CATALOG_USER_EMAIL=catalog@trendsbird.test
CATALOG_USER_NAME=Catalog Viewer
CATALOG_USER_PASSWORD=Catalog@12345
ACCESS_TOKEN_SECRET=your_secret
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_SECRET=your_secret
REFRESH_TOKEN_EXPIRY=15d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

For Render deployment, use the production values in the Render dashboard, for example:

```env
NODE_ENV=production
CORS_ORIGIN=https://e-commerce-admin-dashboard-front-end.onrender.com
DATABASE_URL=postgresql://...
ACCESS_TOKEN_SECRET=your_secure_secret
REFRESH_TOKEN_SECRET=your_secure_secret
```

## Backend Database Setup
```bash
cd server
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
```

## Running the Project Locally

### Backend
```bash
cd server
npm install
npm run dev
```

### Frontend
```bash
cd client
npm install
npm run dev
```

## Authentication
The API uses JWT-based authentication with:
- Access token in cookies or Bearer header
- Refresh token rotation
- Protected routes via `verifyJWT`
- RBAC enforcement via `authorize`

## Available Endpoints

## Authentication
The API uses JWT-based authentication with:
- Access token in cookies or Bearer header
- Refresh token rotation
- Protected routes via `verifyJWT`
- RBAC enforcement via `authorize`

## Backend Live Link
- https://e-commerce-admin-dashboard-backend.onrender.com

## API Base URL
```text
/api/v1
```

## Available Endpoints

### Auth
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh-token`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`

### Dashboard
- `GET /api/v1/dashboard`

### Permissions
- `POST /api/v1/permissions`
- `GET /api/v1/permissions`
- `GET /api/v1/permissions/watch`
- `GET /api/v1/permissions/:id`
- `PUT /api/v1/permissions/:id`
- `DELETE /api/v1/permissions/:id`

### Permission Groups
- `POST /api/v1/permission-groups`
- `GET /api/v1/permission-groups`
- `GET /api/v1/permission-groups/watch`
- `GET /api/v1/permission-groups/:id`
- `PATCH /api/v1/permission-groups/update/:id`
- `DELETE /api/v1/permission-groups/delete/:id`

### Roles
- `POST /api/v1/role`
- `GET /api/v1/role/all-roles`
- `GET /api/v1/role/:id`
- `PATCH /api/v1/role/:id`
- `DELETE /api/v1/role/:id`

### Users
- `POST /api/v1/user`
- `GET /api/v1/user`
- `GET /api/v1/user/watch`
- `GET /api/v1/user/:id`
- `PATCH /api/v1/user/:id`
- `PATCH /api/v1/user/:id/status`
- `DELETE /api/v1/user/:id`

### Categories
- `POST /api/v1/category`
- `GET /api/v1/category`
- `GET /api/v1/category/watch`
- `GET /api/v1/category/tree`
- `GET /api/v1/category/:id`
- `PATCH /api/v1/category/:id`
- `DELETE /api/v1/category/:id`

### Brands
- `POST /api/v1/brand`
- `GET /api/v1/brand`
- `GET /api/v1/brand/watch`
- `GET /api/v1/brand/:id`
- `PATCH /api/v1/brand/:id`
- `DELETE /api/v1/brand/:id`

### Attributes
- `POST /api/v1/attribute`
- `GET /api/v1/attribute`
- `GET /api/v1/attribute/watch`
- `GET /api/v1/attribute/:id`
- `PATCH /api/v1/attribute/:id`
- `DELETE /api/v1/attribute/:id`
- `POST /api/v1/attribute/:id/values`
- `GET /api/v1/attribute/:id/values`
- `PATCH /api/v1/attribute/values/:id`
- `DELETE /api/v1/attribute/values/:id`

### Media
- `POST /api/v1/media/upload`
- `POST /api/v1/media/upload/multiple`
- `GET /api/v1/media`
- `GET /api/v1/media/watch`
- `GET /api/v1/media/:id`
- `PATCH /api/v1/media/:id`
- `DELETE /api/v1/media/:id`

### Products
- `POST /api/v1/product`
- `GET /api/v1/product`
- `GET /api/v1/product/watch`
- `GET /api/v1/product/:id`
- `PATCH /api/v1/product/:id`
- `DELETE /api/v1/product/:id`

## Deletion Behavior
- User deletion is implemented as a soft delete using the `deletedAt` field.
- Other modules in this project currently use hard delete operations.

## Module Status
| Module | Status |
|---|---|
| Authentication | Complete |
| Dashboard | Complete |
| Permission Group | Complete |
| Permission | Complete |
| Role | Complete |
| User | Complete |
| Media | Complete |
| Category | Complete |
| Brand | Complete |
| Attribute | Complete |
| Product | Complete |
| Frontend | Complete |

## Deployment Notes
- Frontend should be deployed as a static app on Render or another host.
- The frontend must have `VITE_API_BASE_URL` set to the backend URL.
- The backend must use the deployed frontend origin in `CORS_ORIGIN`.
- Do not commit real `.env` secrets to GitHub; configure them in the Render dashboard.
- Ensure Prisma is seeded on the deployed database before login testing.

## Notes
- The backend uses JWT-based authentication and permission-based authorization.
- Media files are uploaded to Cloudinary.
- The project follows a feature-based module structure.

## Author
Md. Abu Nayem
