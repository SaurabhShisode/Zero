import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function Navbar() {
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-800">
      <Link to="/" className="font-bold text-lg">Zero</Link>

      <div className="flex gap-4 items-center">
        {user && (
          <Link to={`/profile/${user.profileSlug}`} className="text-sm">
            Profile
          </Link>
        )}
        <button onClick={onLogout} className="text-sm text-red-400">
          Logout
        </button>
      </div>
    </div>
  );
}
