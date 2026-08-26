import { createContext, useCallback, useContext, useState } from "react";
import { api } from "../lib/api";

const OrdersContext = createContext(null);

export function OrdersProvider({ children }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.getOrders();
      setOrders(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const placeOrder = async (items) => {
    const payload = items.map((item) => ({ productId: item.id, qty: item.qty }));
    const order = await api.placeOrder(payload);
    setOrders((prev) => [order, ...prev]);
    return order;
  };

  return (
    <OrdersContext.Provider value={{ orders, loading, error, placeOrder, refresh }}>
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error("useOrders must be used within an OrdersProvider");
  return ctx;
}
