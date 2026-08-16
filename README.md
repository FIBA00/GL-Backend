<div align="center">

<img src="./imgs/guzo-logo-lockup.png" alt="Guzolink" width="360" />

### A lightweight marketplace platform where local merchants create online shops and sell products

[![CI](https://github.com/<owner>/<repo>/actions/workflows/ci.yml/badge.svg)](https://github.com/<owner>/<repo>/actions/workflows/ci.yml)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](./LICENSE)
[![Node](https://img.shields.io/badge/Node-18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](#contributing)

</div>

---

## Overview

Guzolink pairs a **Node.js + Express** REST API with a **Vite-powered** frontend. Merchants register, open a shop, and manage a product catalog; customers browse, cart, and check out. Core domains: merchants, shops, products, orders, and payments.

## Tech Stack

<div align="left">

![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white)
![Mongoose](https://img.shields.io/badge/Mongoose-880000?logo=mongoose&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-635BFF?logo=stripe&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-C21325?logo=jest&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?logo=githubactions&logoColor=white)

</div>

| Layer           | Stack                                  |
| --------------- | -------------------------------------- |
| **Backend**     | Node.js · Express · Mongoose (MongoDB) |
| **Frontend**    | Vite · Vanilla JS · Tailwind CSS       |
| **Payments**    | Stripe (pluggable provider)            |
| **Dev tooling** | nodemon · Jest · Supertest             |
| **CI/CD**       | GitHub Actions                         |

## Repository Layout

```text
├── backend/            # Express API — merchants, shops, products, orders
├── guzolink_client/    # Vite frontend — merchant dashboard & storefront
├── imgs/               # Screenshots and README assets
└── scripts/            # Utility scripts (seed data, demo merchant)
```

## Quick Start

**Prerequisites:** Node.js 18+, npm, a running MongoDB instance.

```bash
# Backend
cd backend
npm install
npm run dev          # dev server with auto-reload
npm run start         # production server (defaults to PORT 9000)

# Frontend
cd guzolink_client
npm install
npm run dev
```

## Environment Variables

Backend config resolves in priority order: `backend/envs/.env.local` → `backend/envs/.env.prod` → `backend/.env`.

```env
PORT=9000
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=1d

DB_URI=mongodb://localhost:27017/Guzolink
HOST=localhost
DB_NAME=Guzolink

PAYMENTS_PROVIDER_KEY=sk_test_yourStripeKeyHere
```

## API Reference

| Method   | Endpoint             | Description                    | Auth  |
| -------- | -------------------- | ------------------------------ | :---: |
| `POST`   | `/api/auth/register` | Register a new merchant        |   –   |
| `POST`   | `/api/auth/login`    | Authenticate and receive a JWT |   –   |
| `GET`    | `/api/shops`         | List active shops              |   –   |
| `POST`   | `/api/shops`         | Create a shop                  |   ✅   |
| `GET`    | `/api/products`      | Fetch product catalog          |   –   |
| `POST`   | `/api/products`      | Add a product                  |   ✅   |
| `PUT`    | `/api/products/:id`  | Update a product               |   ✅   |
| `DELETE` | `/api/products/:id`  | Remove a product               |   ✅   |

## Scripts

| Command                                  | Where              | Does                                     |
| ---------------------------------------- | ------------------ | ---------------------------------------- |
| `npm run dev`                            | `backend/`         | Start dev server (nodemon)               |
| `npm start`                              | `backend/`         | Start production server                  |
| `npm test`                               | `backend/`         | Run Jest + Supertest suite               |
| `node src/scripts/createDemoMerchant.js` | `backend/`         | Seed a demo merchant, shop, and products |
| `npm run dev`                            | `guzolink_client/` | Start Vite dev server                    |
| `npm run build`                          | `guzolink_client/` | Build production assets                  |
| `npm run preview`                        | `guzolink_client/` | Preview the production build locally     |

## Contributing

Issues and PRs are welcome — please include a clear description of the change and its rationale.

## Team

Fraol Bulti · Daniel · Gemechis Bekena

## License

[ISC](./LICENSE)
