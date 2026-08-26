import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useOrders } from "../context/OrdersContext";

const emptyForm = {
  name: "",
  address: "",
  city: "",
  zip: "",
  cardNumber: "",
  expiry: "",
  cvc: "",
};

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const { placeOrder } = useOrders();
  const [form, setForm] = useState(emptyForm);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (items.length === 0 && !confirmedOrder) {
    return (
      <div className="page">
        <p className="empty-state">Your cart is empty.</p>
        <Link to="/" className="btn btn-primary">
          Start shopping
        </Link>
      </div>
    );
  }

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const order = await placeOrder(items);
      clearCart();
      setConfirmedOrder(order);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (confirmedOrder) {
    return (
      <div className="page">
        <div className="confirmation">
          <h1>🎉 Order placed!</h1>
          <p>
            Thanks for your order. Your confirmation number is{" "}
            <strong>{confirmedOrder.id}</strong>.
          </p>
          <p>This is a mock checkout — no real payment was processed.</p>
          <div className="action-row">
            <Link to="/orders" className="btn btn-primary">
              View order history
            </Link>
            <Link to="/" className="btn btn-secondary">
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>Checkout</h1>
      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={handleSubmit}>
          <h2>Shipping details</h2>
          <label>
            Full name
            <input
              required
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Jane Doe"
            />
          </label>
          <label>
            Address
            <input
              required
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="123 Main St"
            />
          </label>
          <div className="form-row">
            <label>
              City
              <input
                required
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="Springfield"
              />
            </label>
            <label>
              ZIP code
              <input
                required
                name="zip"
                value={form.zip}
                onChange={handleChange}
                placeholder="12345"
              />
            </label>
          </div>

          <h2>Payment (mock)</h2>
          <label>
            Card number
            <input
              required
              name="cardNumber"
              value={form.cardNumber}
              onChange={handleChange}
              placeholder="4242 4242 4242 4242"
              maxLength={19}
            />
          </label>
          <div className="form-row">
            <label>
              Expiry
              <input
                required
                name="expiry"
                value={form.expiry}
                onChange={handleChange}
                placeholder="MM/YY"
              />
            </label>
            <label>
              CVC
              <input
                required
                name="cvc"
                value={form.cvc}
                onChange={handleChange}
                placeholder="123"
                maxLength={4}
              />
            </label>
          </div>

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="btn btn-primary full-width" disabled={submitting}>
            {submitting ? "Placing order..." : `Place order — $${totalPrice.toFixed(2)}`}
          </button>
        </form>

        <div className="cart-summary">
          <h2>Order Summary</h2>
          {items.map((item) => (
            <div className="summary-row" key={item.id}>
              <span>
                {item.name} × {item.qty}
              </span>
              <span>${(item.qty * item.price).toFixed(2)}</span>
            </div>
          ))}
          <hr />
          <div className="summary-row total">
            <span>Total</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
