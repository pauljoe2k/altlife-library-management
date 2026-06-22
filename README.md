# Frontend Architecture

## Overview

The frontend is built using React and Vite and follows a modular, component-driven architecture. It consumes the existing Library Management System REST APIs without modifying backend behavior or database design.

### Technology Stack

* React
* Vite
* React Router
* Axios
* CSS Modules / Scoped CSS
* REST API Integration

### Architecture

```text
React Components
       ↓
Page Layer
       ↓
Service Layer (Axios)
       ↓
Express REST API
       ↓
Prisma ORM
       ↓
PostgreSQL
```

### Pages

#### Dashboard

Displays:

* Total Books
* Total Members
* Active Issuances
* Returned Issuances

#### Books

Features:

* View all books
* Add new books
* Edit existing books
* Delete books

#### Members

Features:

* View all members
* Add members
* Edit member information
* Delete members

#### Issuances

Features:

* View all issuances
* Issue a book to a member
* Return issued books
* Delete issuance records

### Folder Structure

```text
src/
│
├── pages/
│   ├── Dashboard/
│   ├── Books/
│   ├── Members/
│   └── Issuances/
│
├── components/
│   ├── Layout/
│   ├── Tables/
│   ├── Forms/
│   └── Modals/
│
├── services/
│   ├── api.js
│   ├── booksService.js
│   ├── membersService.js
│   └── issuancesService.js
│
├── router/
│
└── App.jsx
```

### API Integration

The frontend communicates exclusively through service modules.

Example:

```javascript
booksService.getBooks();
membersService.getMembers();
issuancesService.createIssuance();
```

This prevents direct API calls inside components and keeps business logic separated from UI rendering.

### Data Flow

```text
User Action
     ↓
React Component
     ↓
Service Layer
     ↓
Axios Request
     ↓
Backend API
     ↓
Prisma
     ↓
PostgreSQL
     ↓
API Response
     ↓
React State Update
     ↓
UI Re-render
```

### Key Design Decisions

* No Redux used (project scale does not require global state management)
* Service-layer abstraction for API communication
* Reusable modal and table components
* Strict adherence to backend API contracts
* CamelCase-only frontend data model
* No database-specific fields exposed to UI

### Frontend Highlights

* Clean interview-ready UI
* Modular architecture
* RESTful API integration
* Component reusability
* Separation of concerns
* Scalable project structure
* Production-oriented code organization

```
```
