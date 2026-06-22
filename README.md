# Library Management System – System Architecture & Working

## Project Overview

The Library Management System is a full-stack web application designed to manage books, members, and book issuances within a library.

The system provides:

* Book Management (CRUD)
* Member Management (CRUD)
* Book Issuance & Return Workflow
* Dashboard Analytics
* REST API Architecture
* PostgreSQL Data Persistence
* React-Based Frontend

---

# Technology Stack

## Frontend

* React
* Vite
* Axios
* React Router
* CSS Modules

## Backend

* Node.js
* Express.js
* Prisma ORM
* PostgreSQL

## Infrastructure

* Docker
* Docker Compose

---

# High-Level Architecture

```text
┌─────────────────────────────┐
│         React UI            │
│ Dashboard / Books / Members │
│       / Issuances           │
└──────────────┬──────────────┘
               │ HTTP Requests
               ▼
┌─────────────────────────────┐
│       Axios Services        │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│      Express API Layer      │
│ Routes + Controllers        │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│      Business Services      │
│ Validation + Rules          │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│         Prisma ORM          │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│      PostgreSQL Database    │
└─────────────────────────────┘
```

---

# Frontend Architecture

```text
src/
│
├── pages/
│   ├── Dashboard
│   ├── Books
│   ├── Members
│   └── Issuances
│
├── components/
│   ├── Layout
│   ├── Tables
│   ├── Forms
│   └── Modals
│
├── services/
│   ├── api.js
│   ├── booksService.js
│   ├── membersService.js
│   └── issuancesService.js
│
└── router/
```

Frontend responsibilities:

* Display UI
* Capture user actions
* Perform client-side validation
* Consume APIs
* Manage page state

---

# Backend Architecture

```text
Routes
  ↓
Controllers
  ↓
Services
  ↓
Prisma ORM
  ↓
PostgreSQL
```

## Routes

Receive HTTP requests.

Example:

```text
GET /books
POST /members
PUT /issuances/:id/return
```

---

## Controllers

Handle requests and responses.

Responsibilities:

* Read request data
* Call services
* Return API responses

---

## Services

Contain business logic.

Examples:

* Validate issuance requests
* Check member existence
* Verify book availability
* Handle return operations

---

## Prisma ORM

Responsible for:

* Database communication
* Query generation
* Relationship handling

---

## PostgreSQL

Stores:

* Books
* Members
* Memberships
* Issuances

---

# Database Relationships

```text
Member
   │
   │ 1:N
   ▼
Issuance
   ▲
   │ N:1
   │
Book
```

Meaning:

* One member can borrow many books
* One book can be borrowed many times
* Each issuance belongs to one member and one book

---

# API Contract Design

Database uses:

```text
book_id
mem_id
issuance_id
```

API exposes:

```text
bookId
memberId
id
```

Benefits:

* Clean frontend integration
* Database abstraction
* Consistent API contract

---

# Books Module Workflow

## View Books

1. User clicks Books page
2. React loads BooksPage
3. Axios calls GET /books
4. Express receives request
5. Service fetches books
6. Prisma queries database
7. PostgreSQL returns records
8. API formats response
9. React updates state
10. Table renders books

---

## Add Book

1. User clicks Add Book
2. Modal opens
3. User enters book details
4. React sends POST /books
5. Backend validates data
6. Prisma inserts record
7. Database stores book
8. API returns created book
9. UI refreshes automatically

---

# Members Module Workflow

## View Members

1. User opens Members page
2. Frontend calls GET /members
3. Backend retrieves members
4. Database returns records
5. React renders table

---

## Create Member

1. User submits form
2. POST /members sent
3. Service validates request
4. Prisma creates member
5. Database stores record
6. Frontend updates list

---

# Issuance Module Workflow

This is the core business process.

---

## Issue a Book

### User Flow

1. User opens Issuances page
2. Clicks Issue Book
3. Modal opens
4. Available books loaded
5. Available members loaded

### Submission

User selects:

* Member
* Book
* Due Date

Clicks Submit.

### Backend Flow

1. POST /issuances received
2. Validate member exists
3. Validate book exists
4. Validate issuance rules
5. Create issuance record
6. Save in database
7. Return response

### Frontend Update

1. Refresh issuance list
2. Display new issuance
3. Show status badge

Result:

```text
Issued
```

---

## Return a Book

### User Flow

User clicks:

```text
Return Book
```

### Backend Flow

1. PUT /issuances/:id/return
2. Service locates issuance
3. Status updated

```text
Issued → Returned
```

4. Prisma updates database
5. Response returned

### Frontend Update

Status badge changes instantly.

---

# Dashboard Workflow

Dashboard aggregates information from APIs.

Metrics displayed:

* Total Books
* Total Members
* Active Issuances
* Returned Issuances

Data is fetched from backend endpoints and rendered as summary cards.

---

# Security

API Key Middleware

Headers:

```http
x-api-key: YOUR_KEY
```

Development bypass available:

```javascript
NODE_ENV !== "production"
```

Purpose:

* Secure API access
* Simplify local development

---

# Why This Architecture?

The project follows separation of concerns.

Benefits:

* Scalable
* Maintainable
* Testable
* Production-ready
* Easy frontend/backend collaboration

Each layer has a single responsibility:

* React → UI
* Axios → API communication
* Express Controllers → Request handling
* Services → Business logic
* Prisma → Data access
* PostgreSQL → Persistence

This makes the system easier to extend and maintain over time.

---

# Future Improvements

* Authentication & Role Management
* Search & Filtering
* Pagination
* Fine Calculation
* Email Notifications
* Audit Logs
* Reporting Dashboard
* Inventory Tracking
* Unit & Integration Testing
* CI/CD Pipeline
