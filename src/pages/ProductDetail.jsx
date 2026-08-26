import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import StarRating from "../components/StarRating";
import ProductImage from "../components/ProductImage";
import { api } from "../lib/api";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    setQty(1);
    api
      .getProduct(id)
      .then(setProduct)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="page">
        <p className="empty-state">Loading...</p>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="page">
        <p className="empty-state">Product not found.</p>
        <Link to="/" className="btn btn-secondary">
          Back to shop
        </Link>
      </div>
    );
  }

  const handleAdd = () => {
    addToCart(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleBuyNow = () => {
    addToCart(product, qty);
    navigate("/cart");
  };

  return (
    <div className="page">
      <button className="btn-link back-link" onClick={() => navigate(-1)}>
        ← Back
      </button>
      <div className="product-detail">
        <ProductImage product={product} className="large" />
        <div className="product-detail-info">
          <span className="category-tag">{product.category}</span>
          <h1>{product.name}</h1>
          <StarRating rating={product.rating} />
          <div className="product-price large">${product.price.toFixed(2)}</div>
          <p className="product-description">{product.description}</p>
          <p className="stock-info">
            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
          </p>

          {product.stock > 0 && (
            <>
              <div className="qty-selector">
                <label htmlFor="qty">Quantity</label>
                <input
                  id="qty"
                  type="number"
                  min="1"
                  max={product.stock}
                  value={qty}
                  onChange={(e) =>
                    setQty(
                      Math.max(1, Math.min(product.stock, Number(e.target.value) || 1))
                    )
                  }
                />
              </div>
              <div className="action-row">
                <button className="btn btn-primary" onClick={handleAdd}>
                  {added ? "Added ✓" : "Add to cart"}
                </button>
                <button className="btn btn-secondary" onClick={handleBuyNow}>
                  Buy now
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
