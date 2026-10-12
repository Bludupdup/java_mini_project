import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Code2,
  Trophy,
  ChartNoAxesCombined,
  Settings,
  CircleHelp,
  ChevronRight,
  Boxes,
} from "lucide-react";

const navigation = [
  {
    title: "LEARN",
    items: [
      { label: "Dashboard", icon: LayoutDashboard, path: "/" },
      // No topics list page yet, so this item only highlights on a topic page.
      { label: "Topics", icon: BookOpen, matchPrefix: "/topics/" },
      { label: "Practice", icon: Code2 },
    ],
  },
  {
    title: "YOUR JOURNEY",
    items: [
      { label: "Achievements", icon: Trophy },
      { label: "Progress", icon: ChartNoAxesCombined },
    ],
  },
];

function isActive(item, pathname) {
  if (item.path) {
    return pathname === item.path;
  }

  return Boolean(item.matchPrefix && pathname.startsWith(item.matchPrefix));
}

function Sidebar() {
  const { pathname } = useLocation();

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon">
          <Boxes size={23} />
        </div>

        <div>
          <h2>DSA<span> Universe</span></h2>
          <p>YOUR LEARNING SPACE</p>
        </div>
      </div>

      <div className="sidebar-section">
        <span className="section-label">WORKSPACE</span>
      </div>

      {navigation.map((section) => (
        <div className="nav-section" key={section.title}>
          <p className="nav-heading">{section.title}</p>

          {section.items.map((item) => {
            const Icon = item.icon;
            const active = isActive(item, pathname);
            const className = `nav-item ${active ? "active" : ""}`;

            const content = (
              <>
                <Icon size={18} strokeWidth={1.8} />
                <span>{item.label}</span>

                {active && <ChevronRight className="nav-arrow" size={16} />}
              </>
            );

            return item.path ? (
              <Link className={className} to={item.path} key={item.label}>
                {content}
              </Link>
            ) : (
              <button className={className} key={item.label}>
                {content}
              </button>
            );
          })}
        </div>
      ))}

      <div className="sidebar-bottom">
        <button className="nav-item">
          <Settings size={18} strokeWidth={1.8} />
          <span>Settings</span>
        </button>

        <button className="nav-item">
          <CircleHelp size={18} strokeWidth={1.8} />
          <span>Help & Support</span>
        </button>

        <div className="sidebar-note">
          <div className="note-icon">
            <BookOpen size={18} />
          </div>

          <p>Small steps. Strong foundations.</p>
          <span>Keep learning every day.</span>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
