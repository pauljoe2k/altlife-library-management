# Library Management System API

A production-grade, highly secure, and DevOps-optimized Library Management System backend built with **Node.js, Express, PostgreSQL, Prisma ORM, and Docker**.

This system manages book inventories, library members, and book borrowing/issuing processes under strict transactional validation constraints. It is designed to illustrate enterprise-level backend engineering, separation of concerns, and clean containerized deployment.

---

## Project Overview

The Library Management System (LMS) API is designed to automate the core operations of a library. It exposes RESTful endpoints secured by API Key authentication to perform CRUD operations on Books and Members, and handle transactional Issuances (borrowing and returning books). The system is built with high reliability, incorporating database health checks, automated schema synchronizations, database seeding, graceful shutdowns, and unified global error handlers.

---

## Features

* **Complete Book Inventory (CRUD)**: Create, retrieve, update, and delete books with automated ISBN uniqueness checks.
* **Member Management (CRUD)**: Create, retrieve, update, and delete members with unique email constraints.
* **Transactional Book Issuance**: Manage borrowing records with active inventory checks (prevents issuing out-of-stock books), existence validation for both book and member, duplicate return guards, and future-date enforcement for deadlines.
* **Secured Perimeter Gatekeeping**: Global header-based API Key authentication on all `/api` routes.
* **Interactive API Documentation**: Embedded Swagger UI served directly from the application for real-time sandbox execution.
* **DevOps Containerization**: Seamless multi-container orchestrations using Docker and Docker Compose with database-aware startup sequences.
* **Proactive System Diagnostics**: Active database health-checking endpoint checking connectivity via raw PostgreSQL queries.
* **Graceful Process Shutdown**: Complete cleanup logic listening to process signals to release database pools and terminate active HTTP connections without data corruption.

---

## Tech Stack

* **Runtime Environment**: Node.js (v20 Alpine)
* **Application Framework**: Express.js (v5)
* **Database Driver & ORM**: Prisma ORM (v6.8.2)
* **Relational Database**: PostgreSQL (v16 Alpine)
* **Request Validation**: Joi Validation (v18)
* **API Specifications**: Swagger UI & OpenAPI 3.0
* **API Client Configs**: Thunder Client
* **Dev Tools**: Nodemon

---

## Architecture

The API follows a clean **Separation of Concerns (SoC)**, structuring code into modular, unidirectional layers:

```
Request → Route → API Key Auth Middleware → Joi Validator Middleware → Controller → Service → Prisma ORM → PostgreSQL
```

This structural integrity ensures that:
1. Security gates validate request authenticity before domain controllers execute.
2. HTTP payloads are strictly sanitized and parsed at the HTTP layer, preventing malicious payloads or parameters from reaching services.
3. Services contain isolated, transactional business logic rules and direct database commands.
4. Database connections are handled through a single, shared connection pool.

---

## Folder Structure

```
altlife-library-management/
├── prisma/
│   ├── schema.prisma       # Database design schemas and models
│   └── seed.js             # Idempotent database seeding script
├── sql/
│   └── queries.sql         # PostgreSQL query assignment solutions
├── src/
│   ├── config/
│   │   └── db.js           # Centralized Prisma Client connection pool
│   ├── controllers/
│   │   ├── book.controller.js
│   │   ├── member.controller.js
│   │   └── issuance.controller.js
│   ├── docs/
│   │   └── swagger.json    # OpenAPI 3.0 static specifications
│   ├── middleware/
│   │   ├── auth.js         # Secure API Key gatekeeper middleware
│   │   ├── validate.js     # Reusable Joi validator schema middleware
│   │   └── errorHandler.js # Global JSON database/app error handler
│   ├── routes/
│   │   ├── book.routes.js
│   │   ├── member.routes.js
│   │   ├── issuance.routes.js
│   │   └── docs.routes.js  # Serve interactive Swagger UI documentation
│   ├── services/
│   │   ├── book.service.js
│   │   ├── member.service.js
│   │   └── issuance.service.js
│   ├── utils/
│   │   └── asyncHandler.js # Express async router wrapper utility
│   ├── validators/
│   │   ├── book.validator.js
│   │   ├── member.validator.js
│   │   └── issuance.validator.js
│   └── app.js              # Application entrypoint & lifecycle listeners
├── .dockerignore           # Excludes node_modules and credentials from builds
├── .env                    # Local environment credentials (ignored by git)
├── .env.example            # Sample template for configuration environment
├── .gitignore              # Configured to prevent committing sensitive keys
├── Dockerfile              # Lightweight Alpine production container setup
├── docker-compose.yml      # Multi-container orchestration pipelines
├── package.json            # Application scripts and packages manifest
└── package-lock.json       # Strict package lock manifest
└── Validation.docx         # Validation document
```

---

## Installation

To run the application locally on your host machine without Docker, follow these steps:

### 1. Clone and Install Dependencies
Navigate to the directory and run:
```bash
npm install
```

### 2. Configure Local Environment
Copy the example environment file:
```bash
cp .env.example .env
```
Open `.env` and verify that it points to a running local PostgreSQL instance:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/library"
PORT=3000
API_KEY=your-secret-key
NODE_ENV=development
```

### 3. Sync Databases & Run Seeders
Compile the Prisma client, build structural tables, and load the database seeder:
```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

---

## Environment Variables

The application relies on the following configurations in your `.env` file:

| Variable | Description | Example |
| :--- | :--- | :--- |
| `DATABASE_URL` | Full PostgreSQL connection string (uses `db` as host in Docker compose, `localhost` on local machine) | `postgresql://postgres:postgres@db:5432/library` |
| `PORT` | The port the Express application listens on | `3000` |
| `API_KEY` | Secret token required in headers (`x-api-key`) for secure routes | `your-secret-key` |
| `NODE_ENV` | Mode of operation (`development` or `production`) | `development` |

---

## Docker Setup

You can build and deploy the entire multi-container ecosystem (Express server, PostgreSQL Database, Auto-migration, and Database Seeding) with a single command.

### 1. Prerequisites
Ensure **Docker Desktop** and **docker-compose** are installed and active on your system.

### 2. Copy Environment Template
Ensure a local `.env` is created:
```bash
cp .env.example .env
```
*(Verify the `DATABASE_URL` inside `.env` uses `db` as the hostname).*

### 3. Deploy the Stack
Run Compose inside the project root:
```bash
docker-compose up --build
```

#### What happens automatically during this deployment:
1. **Database Container Initialization**: Starts the PostgreSQL database container with mapped persistent volumes (`pgdata`).
2. **Database Health Polling**: The application container waits for the database ports to become healthy.
3. **Database Schema Sync**: Prisma aligns the database layout directly with `schema.prisma`.
4. **Idempotent Data Seeding**: Runs the seed script to populate books and members.
5. **API Boot**: The Express application starts listening on port `3000`.

---

## Running the Application

### Local Development Mode (Hot-Reload)
Starts the application with Nodemon to track file edits and reload on the fly:
```bash
npm run dev
```

### Local Production Mode
Launches the server as a raw, high-performance Node process:
```bash
npm start
```
The server will start listening on `http://localhost:3000`.

---

## Prisma Commands

Prisma ORM is used to manage database relations and models. Key commands for development:

* **Generate Client**: Compiles database interfaces to memory.
  ```bash
  npx prisma generate
  ```
* **Push Schema Changes**: Directly aligns the target database structure with your local schema (useful for prototyping).
  ```bash
  npx prisma db push
  ```
* **Seed Database**: Runs the seed file located at `/prisma/seed.js` to insert demo records.
  ```bash
  npx prisma db seed
  ```
* **Open Prisma Studio**: Opens an interactive, browser-based GUI to inspect and edit database records at `http://localhost:5555`.
  ```bash
  npx prisma studio
  ```

---

## API Authentication

All routes starting with `/api` are fully secured against unauthorized access. 

* **Required HTTP Header**: `x-api-key`
* **Configured Secret Key**: Defined via `API_KEY` in the `.env` file (defaults locally to `your-secret-key`).
* **Protected Paths**: `/api/books`, `/api/members`, `/api/issuances`.
* **Public Paths**: `/` (root description page), `/health` (load balancer monitor), `/api-docs` (Swagger UI).

If the header is missing or incorrect, the server returns:
```json
{
  "status": "fail",
  "error": "Unauthorized",
  "message": "Missing or invalid API key. Please provide the 'x-api-key' header with the correct secret key."
}
```

---

## Swagger Documentation

The system includes interactive API documentation generated via Swagger.

1. Boot the server (using Docker Compose or running locally).
2. Open your browser and navigate to: **`http://localhost:3000/api-docs`**
3. To execute secured requests:
   * Click the **Authorize** lock button at the top-right.
   * Enter your configured `API_KEY` (e.g., `your-secret-key`) and click **Authorize**.
   * You can now run interactive operations (`Try it out`) on all API endpoints directly from the browser.

---

## API Endpoints

### Public Endpoints
* `GET /` — Welcome message and Swagger details.
* `GET /health` — Operational state check of database connection and uptime stats.
* `GET /api-docs` — Swagger UI API Console.

### Secured Domain Endpoints (`x-api-key` Required)

| Method | Endpoint | Description | Validation Guards / Constraints |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/books` | Retrieve all books | Returns full inventory list |
| **GET** | `/api/books/:id` | Get single book details | Returns 404 if ID does not exist |
| **POST** | `/api/books` | Create a new book | Body: `title`, `author`, `isbn` (unique), `totalCopies` (min 1) |
| **PUT** | `/api/books/:id` | Modify book attributes | Partial changes allowed; blocks if active loan exists |
| **DELETE**| `/api/books/:id` | Delete book record | Blocks if active loans remain; transactionally wipes logs |
| **GET** | `/api/members` | Retrieve all members | Returns full registration list |
| **GET** | `/api/members/:id`| Get member details | Returns 404 if member ID does not exist |
| **POST** | `/api/members` | Register new member | Body: `name`, `email` (unique), `phone` (optional) |
| **PUT** | `/api/members/:id`| Update member details | Allows partial changes; validations apply |
| **DELETE**| `/api/members/:id`| Deregister member | Blocks if outstanding books are unreturned; wipes logs |
| **GET** | `/api/issuances` | Get all borrow history | Includes nested member and book details |
| **GET** | `/api/issuances/:id`| Get loan record details | Returns 404 if loan ID not found |
| **POST** | `/api/issuances` | Issue a book to member | Body: `memberId`, `bookId`, `dueDate` (must be future date). Validates existence and stock. |
| **PUT** | `/api/issuances/:id/return`| Return an issued book | Records return timestamp; guards against duplicate returns |

---

## SQL Queries

All database assignments requested are compiled inside `/sql/queries.sql`:

1. **Books Never Borrowed**: Employs an anti-join subquery to filter and retrieve books in the library inventory whose primary IDs do not exist inside any issuance record.
2. **Outstanding Borrowed Books**: Performs primary inner joins across the `Issuance`, `Book`, and `Member` tables to list all unreturned issuances (`returnedAt IS NULL`), ordered by approaching due date.
3. **Top 10 Borrowed Books**: Employs left joins between `Book` and `Issuance`, groups by book attributes, aggregates borrowing counts, and returns the top 10 ranked in descending order.

---

## Validation Evidence

All runtime verifications, test cases, and container health configurations have been fully validated.
* **validation.docx**: Located in your submission folder, containing structural validation evidence, database status captures, and successful endpoint execution flows.
* **Root Images**: Loose screenshots showcasing local validation runs are available at `image.png` and `image-1.png`.

---

## Assumptions

1. **Relational Database**: PostgreSQL was selected over SQLite for enterprise-grade transactional concurrency, relational constraint safety, and strict alignment with production Docker patterns.
2. **Auto-Incrementing IDs**: Record identifiers are standard PostgreSQL autoincrementing integers (`serial`).
3. **Delete Cascades**: Deleting members/books with active borrowing records is strictly blocked at the service level to protect operational integrity. Historical returned loans are transactionally cleaned up during deletion.
4. **API Key Uniformity**: The API key is stored securely in environment variables and verified uniformly at the Express routing perimeter.

---

## Future Improvements

1. **Timing-Safe Authentication**: Switch basic comparison to `crypto.timingSafeEqual` in the authentication middleware to safeguard against side-channel attacks.
2. **Security Headers**: Install `helmet` to automatically inject modern secure HTTP response headers (CSP, HSTS, frame protections).
3. **CORS Restrictions**: Implement the `cors` package to restrict cross-origin access strictly to verified clients.
4. **API Rate Limiting**: Deploy `express-rate-limit` on public endpoints (`/health`, `/api-docs`) to defend against DDoS or brute-force scripts.
5. **Database Index Optimizations**: Add explicit indices to `memberId` and `bookId` foreign keys inside `schema.prisma` to eliminate table scans on large datasets.
6. **Docker Multi-Stage Build**: Redesign the `Dockerfile` into a multi-stage compilation to isolate build dependencies, run processes as a non-root `node` user, and optimize runtime size.
