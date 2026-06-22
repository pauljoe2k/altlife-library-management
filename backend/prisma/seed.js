const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("[Seeder] Starting...");

  const member = await prisma.member.upsert({
    where: {
      mem_email: "paul@example.com",
    },
    update: {},
    create: {
      mem_name: "Paul",
      mem_phone: "9876543210",
      mem_email: "paul@example.com",
    },
  });

  const membership = await prisma.membership.create({
    data: {
      member_id: member.mem_id,
      status: "Active",
    },
  });

  const collection = await prisma.collection.create({
    data: {
      collection_name: "Programming Books",
    },
  });

  const category = await prisma.category.create({
    data: {
      cat_name: "Technology",
      sub_cat_name: "Software",
    },
  });

  const book = await prisma.book.create({
    data: {
      book_name: "Node.js Basics",
      book_cat_id: category.cat_id,
      book_collection_id: collection.collection_id,
      book_launch_date: new Date(),
      book_publisher: "Kalvium Press",
    },
  });

  const issuance = await prisma.issuance.create({
    data: {
      book_id: book.book_id,
      membership_id: membership.membership_id,
      issued_by: "Admin",
      target_return_date: new Date("2026-12-31"),
      issuance_status: "Issued",
    },
  });

  console.log("Member:", member.mem_id);
  console.log("Membership:", membership.membership_id);
  console.log("Book:", book.book_id);
  console.log("Issuance:", issuance.issuance_id);
  console.log("[Seeder] Complete");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });