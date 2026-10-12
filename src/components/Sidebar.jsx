import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Bookmark,
  Code2,
  ChartNoAxesCombined,
  Settings,
  CircleHelp,
  ChevronRight,
  Boxes,
} from "lucide-react";
import { useLearning } from "../learning/LearningContext";

const navigation = [
  {
    title: "LEARN",
    items: [
      { label: "Dashboard", icon: LayoutDashboard, path: "/" },
      { label: "Topics", icon: BookOpen, path: "/topics" },
      { label: "Saved", icon: Bookmark, path: "/bookmarks", count: "saved" },
      { label: "Practice", icon: Code2, path: "/practice" },
    ],
  },
  {
    title: "YOUR JOURNEY",
    items: [
      { label: "Progress", icon: ChartNoAxesCombined, path: "/progress" },
    ],
  },
];

const bottomItems = [
  { label: "Settings", icon: Settings, path: "/settings" },
  { label: "Help & Support", icon: CircleHelp, path: "/help" },
];

// "/topics" is also active on a topic page such as "/topics/arrays".
function isActive(path, pathname) {
  if (path === "/") return pathname === "/";
  return pathname === path || pathname.startsWith(`${path}/`);
}

function NavItem({ item, pathname, count = 0 }) {
  const Icon = item.icon;
  const active = isActive(item.path, pathname);

  return (
    <Link
      className={`nav-item ${active ? "active" : ""}`}
      to={item.path}
      aria-current={active ? "page" : undefined}
    >
      <Icon size={18} strokeWidth={1.8} />
      <span className="nav-label">{item.label}</span>

      {count > 0 && (
        <span className="nav-tag count" aria-label={`${count} saved`}>
          {count}
        </span>
      )}
      {active && <ChevronRight className="nav-arrow" size={16} />}
    </Link>
  );
}

function Sidebar() {
  const { pathname } = useLocation();
  const { state } = useLearning();
  const counts = { saved: state.bookmarks.length };

  return (
    <aside className="sidebar">
      <Link className="brand" to="/" aria-label="DSA Universe, go to dashboard">
        <div className="brand-icon">
          <Boxes size={23} />
        </div>

        <div>
          <h2>DSA<span> Universe</span></h2>
          <p>YOUR LEARNING SPACE</p>
        </div>
      </Link>

      <div className="sidebar-section">
        <span className="section-label">WORKSPACE</span>
      </div>

      {navigation.map((section) => (
        <nav className="nav-section" key={section.title} aria-label={section.title}>
          <p className="nav-heading">{section.title}</p>

          {section.items.map((item) => (
            <NavItem
              item={item}
              pathname={pathname}
              count={item.count ? counts[item.count] : 0}
              key={item.label}
            />
          ))}
        </nav>
      ))}

      <nav className="sidebar-bottom" aria-label="Settings and help">
        {bottomItems.map((item) => (
          <NavItem item={item} pathname={pathname} key={item.label} />
        ))}

        <div className="sidebar-note">
          <div className="note-icon">
            <BookOpen size={18} />
          </div>

          <p>Small steps. Strong foundations.</p>
          <span>Keep learning every day.</span>
        </div>
      </nav>
    </aside>
  );
}

export default Sidebar;
