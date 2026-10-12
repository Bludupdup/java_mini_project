import { useCallback, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { CircleHelp, LogOut, Settings, User } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { useDismiss } from "../hooks/useDismiss";
import { getInitials } from "../learning/format";
import { useLearning } from "../learning/LearningContext";

/** The avatar in the header: who's logged in, settings, help and log out. */
function ProfileMenu() {
  const { user, logOut } = useAuth();
  const { state } = useLearning();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  // A display name chosen in Settings wins over the account name.
  const name = state.preferences.name || user.name;
  const initials = getInitials(name);

  const close = useCallback(() => setOpen(false), []);

  useDismiss(menuRef, open, close);

  return (
    <div className="menu" ref={menuRef}>
      <button
        type="button"
        className="avatar"
        aria-label={`Account menu for ${name}`}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen(!open)}
      >
        {initials ? (
          <span className="avatar-initials">{initials}</span>
        ) : (
          <User size={18} strokeWidth={1.8} />
        )}
      </button>

      {open && (
        <div className="menu-panel profile-panel" role="menu" aria-label="Account">
          <div className="profile-summary">
            <strong>{name}</strong>
            <span>{user.email}</span>
          </div>

          <Link className="menu-item" role="menuitem" to="/settings" onClick={close}>
            <Settings size={16} />
            Settings
          </Link>
          <Link className="menu-item" role="menuitem" to="/help" onClick={close}>
            <CircleHelp size={16} />
            Help & Support
          </Link>
          <button type="button" className="menu-item danger" role="menuitem" onClick={logOut}>
            <LogOut size={16} />
            Log out
          </button>
        </div>
      )}
    </div>
  );
}

export default ProfileMenu;
