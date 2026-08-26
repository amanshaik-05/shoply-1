import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();
router.use(requireAuth);

function formatOrder(order, items) {
  return {
    id: order.id,
    date: order.created_at,
    status: order.status,
    totalPrice: Number(order.total_price),
    items: items.map((i) => ({
      id: i.product_id,
      name: i.name,
      price: Number(i.price),
      qty: i.qty,
      emoji: i.emoji,
      color: i.color,
      image: i.image,
    })),
  };
}

router.get("/", async (req, res, next) => {
  try {
    const { rows: orders } = await pool.query(
      "SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC",
      [req.user.id]
    );
    if (orders.length === 0) {
      return res.json([]);
    }

    const { rows: items } = await pool.query(
      "SELECT * FROM order_items WHERE order_id = ANY($1::text[])",
      [orders.map((o) => o.id)]
    );

    res.json(
      orders.map((o) => formatOrder(o, items.filter((i) => i.order_id === o.id)))
    );
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  const { items } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "A non-empty items array is required" });
  }
  for (const item of items) {
    if (!Number.isInteger(item.productId) || !Number.isInteger(item.qty) || item.qty < 1) {
      return res.status(400).json({ error: "Each item needs a valid productId and qty" });
    }
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    let totalPrice = 0;
    const orderItems = [];

    for (const { productId, qty } of items) {
      const { rows } = await client.query(
        "SELECT * FROM products WHERE id = $1 FOR UPDATE",
        [productId]
      );
      const product = rows[0];
      if (!product) {
        throw Object.assign(new Error(`Product ${productId} not found`), { status: 404 });
      }
      if (product.stock < qty) {
        throw Object.assign(
          new Error(`Not enough stock for "${product.name}" (only ${product.stock} left)`),
          { status: 409 }
        );
      }
      await client.query("UPDATE products SET stock = stock - $1 WHERE id = $2", [
        qty,
        productId,
      ]);
      totalPrice += Number(product.price) * qty;
      orderItems.push({ product, qty });
    }

    const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    await client.query(
      "INSERT INTO orders (id, user_id, total_price, status) VALUES ($1, $2, $3, 'Confirmed')",
      [orderId, req.user.id, totalPrice]
    );

    for (const { product, qty } of orderItems) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, name, price, qty, emoji, color, image)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [orderId, product.id, product.name, product.price, qty, product.emoji, product.color, product.image]
      );
    }

    await client.query("COMMIT");

    const { rows: orderRows } = await pool.query("SELECT * FROM orders WHERE id = $1", [orderId]);
    const { rows: itemRows } = await pool.query(
      "SELECT * FROM order_items WHERE order_id = $1",
      [orderId]
    );

    res.status(201).json(formatOrder(orderRows[0], itemRows));
  } catch (err) {
    await client.query("ROLLBACK");
    if (err.status) {
      res.status(err.status).json({ error: err.message });
    } else {
      next(err);
    }
  } finally {
    client.release();
  }
});

export default router;
