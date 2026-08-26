import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

function toProductJson(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    price: Number(row.price),
    rating: Number(row.rating),
    stock: row.stock,
    image: row.image,
    emoji: row.emoji,
    color: row.color,
    description: row.description,
  };
}

router.get("/", async (req, res, next) => {
  try {
    const { rows } = await pool.query("SELECT * FROM products ORDER BY id");
    res.json(rows.map(toProductJson));
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: "Invalid product id" });
    }
    const { rows } = await pool.query("SELECT * FROM products WHERE id = $1", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(toProductJson(rows[0]));
  } catch (err) {
    next(err);
  }
});

export default router;
