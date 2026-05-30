const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("[Seeder] Starting database seeding...");

  // 1. Idempotent Seed for Books (ISBN is unique)
  const books = [
    {
      title: "The Phoenix Project",
      author: "Gene Kim, Kevin Behr, George Spafford",
      isbn: "978-0988262591",
      totalCopies: 5,
    },
    {
      title: "Designing Data-Intensive Applications",
      author: "Martin Kleppmann",
      isbn: "978-1449373320",
      totalCopies: 3,
    },
    {
      title: "Clean Code",
      author: "Robert C. Martin",
      isbn: "978-0132350884",
      totalCopies: 4,
    },
    {
      title: "The Pragmatic Programmer",
      author: "Andrew Hunt, David Thomas",
      isbn: "978-0135957059",
      totalCopies: 2,
    },
    {
      title: "Site Reliability Engineering",
      author: "Betsy Beyer, Chris Jones, Jennifer Petoff",
      isbn: "978-1491929124",
      totalCopies: 3,
    },
  ];

  for (const book of books) {
    const upsertedBook = await prisma.book.upsert({
      where: { isbn: book.isbn },
      update: {
        title: book.title,
        author: book.author,
        totalCopies: book.totalCopies,
      },
      create: book,
    });
    console.log(`[Seeder] Upserted Book: "${upsertedBook.title}" (ISBN: ${upsertedBook.isbn})`);
  }

  // 2. Idempotent Seed for Members (Email is unique)
  const members = [
    {
      name: "Paul Joe",
      email: "paul.joe@altlifelabs.com",
      phone: "+91-9876543210",
    },
    {
      name: "Alice Smith",
      email: "alice.smith@example.com",
      phone: "+1-555-0143",
    },
    {
      name: "Bob Johnson",
      email: "bob.johnson@example.com",
      phone: "+1-555-0156",
    },
    {
      name: "Charlie Brown",
      email: "charlie.brown@example.com",
      phone: null,
    },
    {
      name: "Diana Prince",
      email: "diana.prince@example.com",
      phone: "+1-555-0182",
    },
  ];

  for (const member of members) {
    const upsertedMember = await prisma.member.upsert({
      where: { email: member.email },
      update: {
        name: member.name,
        phone: member.phone,
      },
      create: member,
    });
    console.log(`[Seeder] Upserted Member: "${upsertedMember.name}" (Email: ${upsertedMember.email})`);
  }

  console.log("[Seeder] Database seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error("[Seeder] Error during database seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
