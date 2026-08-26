import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useOrders } from "../context/OrdersContext";

export default function Orders() {
  const { orders, loading, error, refresh } = useOrders();

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (loading) {
    return (
      <div className="page">
        <p className="empty-state">Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <p className="empty-state">Couldn't load orders: {error}</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="page">
        <p className="empty-state">You haven't placed any orders yet.</p>
        <Link to="/" className="btn btn-primary">
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>Order History</h1>
      <div className="orders-list">
        {orders.map((order) => (
          <div className="order-card" key={order.id}>
            <div className="order-header">
              <div>
                <strong>{order.id}</strong>
                <div className="order-date">
                  {new Date(order.date).toLocaleString()}
                </div>
              </div>
              <span className="status-badge">{order.status}</span>
            </div>
            <div className="order-items">
              {order.items.map((item) => (
                <div className="summary-row" key={item.id}>
                  <span>
                    {item.emoji} {item.name} × {item.qty}
                  </span>
                  <span>${(item.qty * item.price).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>${order.totalPrice.toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
