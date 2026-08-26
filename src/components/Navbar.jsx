import { Link, NavLink, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { signOut, useSession } from "../lib/authClient";

export default function Navbar() {
  const { totalItems } = useCart();
  const { data: session, isPending } = useSession();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand">
          🛒 ShopEasy
        </Link>
        <nav className="nav-links">
          <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}>
            Shop
          </NavLink>
          <NavLink to="/orders" className={({ isActive }) => (isActive ? "active" : "")}>
            Orders
          </NavLink>
          <NavLink to="/cart" className={({ isActive }) => (isActive ? "active" : "")}>
            Cart
            {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
          </NavLink>
          {!isPending && session ? (
            <span className="user-menu">
              <span className="user-name">{session.user.name}</span>
              <button className="btn-link" onClick={handleSignOut}>
                Sign out
              </button>
            </span>
          ) : (
            !isPending && (
              <NavLink to="/login" className={({ isActive }) => (isActive ? "active" : "")}>
                Sign in
              </NavLink>
            )
          )}
        </nav>
      </div>
    </header>
  );
}
