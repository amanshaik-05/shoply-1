import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import ProductImage from "../components/ProductImage";

export default function Cart() {
  const { items, removeFromCart, updateQty, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <div className="page">
        <p className="empty-state">Your cart is empty.</p>
        <Link to="/" className="btn btn-primary">
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>Your Cart</h1>
      <div className="cart-layout">
        <div className="cart-items">
          {items.map((item) => (
            <div className="cart-item" key={item.id}>
              <ProductImage product={item} className="small" />
              <div className="cart-item-info">
                <Link to={`/product/${item.id}`} className="product-name">
                  {item.name}
                </Link>
                <div className="cart-item-price">${item.price.toFixed(2)} each</div>
              </div>
              <input
                type="number"
                min="1"
                max={item.stock}
                value={item.qty}
                onChange={(e) => updateQty(item.id, Number(e.target.value) || 1)}
                className="qty-input"
              />
              <div className="cart-item-subtotal">
                ${(item.qty * item.price).toFixed(2)}
              </div>
              <button
                className="btn-link remove-link"
                onClick={() => removeFromCart(item.id)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <div className="cart-summary">
          <h2>Order Summary</h2>
          <div className="summary-row">
            <span>Total</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>
          <Link to="/checkout" className="btn btn-primary full-width">
            Proceed to checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
