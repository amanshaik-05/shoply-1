export default function StarRating({ rating }) {
  const full = Math.round(rating);
  return (
    <span className="stars" aria-label={`Rated ${rating} out of 5`}>
      {"★".repeat(full)}
      {"☆".repeat(5 - full)}
      <span className="rating-value"> {rating}</span>
    </span>
  );
}
