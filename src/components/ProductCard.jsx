import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import StarRating from "./StarRating";
import ProductImage from "./ProductImage";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  return (
    <div className="product-card">
      <Link to={`/product/${product.id}`} className="product-thumb-link">
        <ProductImage product={product} />
      </Link>
      <div className="product-info">
        <Link to={`/product/${product.id}`} className="product-name">
          {product.name}
        </Link>
        <StarRating rating={product.rating} />
        <div className="product-price">${product.price.toFixed(2)}</div>
        <button
          className="btn btn-primary"
          disabled={product.stock === 0}
          onClick={() => addToCart(product, 1)}
        >
          {product.stock === 0 ? "Out of stock" : "Add to cart"}
        </button>
      </div>
    </div>
  );
}
