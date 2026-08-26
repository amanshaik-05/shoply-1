import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pool } from "../db.js";
import { products } from "./seedData.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function seed() {
  const schema = readFileSync(path.join(__dirname, "schema.sql"), "utf-8");
  await pool.query(schema);
  console.log("Schema ready.");

  for (const p of products) {
    await pool.query(
      `INSERT INTO products (id, name, category, price, rating, stock, image, emoji, color, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         category = EXCLUDED.category,
         price = EXCLUDED.price,
         rating = EXCLUDED.rating,
         image = EXCLUDED.image,
         emoji = EXCLUDED.emoji,
         color = EXCLUDED.color,
         description = EXCLUDED.description`,
      [
        p.id,
        p.name,
        p.category,
        p.price,
        p.rating,
        p.stock,
        p.image,
        p.emoji,
        p.color,
        p.description,
      ]
    );
  }

  await pool.query(
    `SELECT setval(pg_get_serial_sequence('products', 'id'), (SELECT MAX(id) FROM products))`
  );

  console.log(`Seeded ${products.length} products.`);
  await pool.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
