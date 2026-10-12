import { Search, Bell, User } from "lucide-react";

function Header({ search, onSearchChange }) {
  return (
    <header className="header">
      <label className="search-box">
        <Search size={17} strokeWidth={1.8} />
        <input
          type="text"
          placeholder="Search topics..."
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </label>

      <div className="header-actions">
        <button className="icon-button" aria-label="Notifications">
          <Bell size={18} strokeWidth={1.8} />
        </button>

        <button className="avatar" aria-label="Profile">
          <User size={18} strokeWidth={1.8} />
        </button>
      </div>
    </header>
  );
}

export default Header;
