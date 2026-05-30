-- Alt Life Labs: Library Management System
-- PostgreSQL Database Queries

-- ============================================================================
-- 1. Books Never Borrowed
-- This query retrieves all books in the inventory that have never been issued.
-- ============================================================================
SELECT 
    b.id AS "Book ID",
    b.title AS "Book Title",
    b.author AS "Author",
    b.isbn AS "ISBN",
    b."totalCopies" AS "Total Copies"
FROM "Book" b
WHERE b.id NOT IN (
    SELECT DISTINCT i."bookId"
    FROM "Issuance" i
);


-- ============================================================================
-- 2. Outstanding Books
-- This query lists all books currently issued to members that have not yet 
-- been returned (returnedAt is NULL), including borrower names and return deadlines.
-- ============================================================================
SELECT
    i.id AS "Issuance ID",
    b.title AS "Book Title",
    b.isbn AS "ISBN",
    m.name AS "Borrower Name",
    m.email AS "Borrower Email",
    i."issuedAt" AS "Issued Date",
    i."dueDate" AS "Due Date"
FROM "Issuance" i
JOIN "Book" b ON i."bookId" = b.id
JOIN "Member" m ON i."memberId" = m.id
WHERE i."returnedAt" IS NULL
ORDER BY i."dueDate" ASC;


-- ============================================================================
-- 3. Top 10 Borrowed Books
-- This query ranks the top 10 most popular books in the library based on 
-- the total frequency of borrowings.
-- ============================================================================
SELECT
    b.id AS "Book ID",
    b.title AS "Book Title",
    b.author AS "Author",
    b.isbn AS "ISBN",
    COUNT(i.id) AS "Total Borrow Count"
FROM "Book" b
LEFT JOIN "Issuance" i ON b.id = i."bookId"
GROUP BY b.id, b.title, b.author, b.isbn
ORDER BY "Total Borrow Count" DESC, b.title ASC
LIMIT 10;
