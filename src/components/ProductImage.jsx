import { useState } from "react";

export default function ProductImage({ product, className = "" }) {
  const [failed, setFailed] = useState(false);
  const src = `https://loremflickr.com/400/400/${product.image}?lock=${product.id}`;

  return (
    <div
      className={`product-thumb ${className}`}
      style={{ backgroundColor: product.color }}
    >
      {failed ? (
        <span>{product.emoji}</span>
      ) : (
        <img
          src={src}
          alt={product.name}
          loading="lazy"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
