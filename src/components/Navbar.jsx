import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../client"; 
import Logo from "../assets/Logo.png";
import ProfileIcon from "../assets/ProfileIcon.png";

function Navbar({ setSearchTerm }) {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    alert("Logged out successfully!");
    navigate("/login");
    window.location.reload();
  };

  const handleSearchInput = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/" className="nav-logo">
          <img src={Logo} alt="Logo" className="logo-image" />
        </Link>
      </div>

      {user && (
        <div className="nav-center">
          <div className="search-bar">
            <img src={Logo} alt="Search Icon" className="search-icon" />
            <input
              type="text"
              placeholder="Search for Recipes..."
              onChange={handleSearchInput}
              className="search-input"
            />
          </div>
        </div>
      )}

      <div className="nav-right">
        {user ? (
          <>
            <Link to="/new-recipe" className="nav-button">Post</Link>
            <Link to="/profile" className="profile-button">
              <img src={ProfileIcon} alt="Profile" className="profile-icon" />
            </Link>
            <button onClick={handleLogout} className="nav-button">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-button">Login</Link>
            <Link to="/register" className="nav-button">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
