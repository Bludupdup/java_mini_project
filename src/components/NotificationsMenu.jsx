import { useCallback, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, Flame, Sparkles, Trophy } from "lucide-react";
import { useCatalog } from "../catalog/CatalogContext";
import { useDismiss } from "../hooks/useDismiss";
import { timeAgo } from "../learning/format";
import { useLearning } from "../learning/LearningContext";
import { countUnread, getNotifications } from "../learning/notifications";

const KIND_ICONS = { tip: Sparkles, streak: Flame, achievement: Trophy };

/** The bell: achievement unlocks and streak reminders. Opening it marks them read. */
function NotificationsMenu() {
  const { topics } = useCatalog();
  const { state, markNotificationsRead } = useLearning();
  // When the menu was opened (null = closed), and what was already read before that.
  const [openedAt, setOpenedAt] = useState(null);
  const [readBefore, setReadBefore] = useState(0);
  const menuRef = useRef(null);
  const open = openedAt !== null;
  const unread = countUnread(state);

  const close = useCallback(() => setOpenedAt(null), []);

  useDismiss(menuRef, open, close);

  function toggle() {
    if (open) {
      setOpenedAt(null);
      return;
    }

    setReadBefore(state.notificationsSeenAt);
    setOpenedAt(Date.now());
    markNotificationsRead();
  }

  const items = open ? getNotifications(state, topics, openedAt) : [];

  return (
    <div className="menu" ref={menuRef}>
      <button
        type="button"
        className="icon-button"
        aria-label={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={toggle}
      >
        <Bell size={18} strokeWidth={1.8} />
        {unread > 0 && <span className="unread-badge">{unread > 9 ? "9+" : unread}</span>}
      </button>

      {open && (
        <div className="menu-panel notifications-panel" role="dialog" aria-label="Notifications">
          <p className="menu-title">Notifications</p>

          {items.length === 0 ? (
            <p className="menu-empty">You're all caught up.</p>
          ) : (
            <ul className="notification-list">
              {items.map((item) => {
                const Icon = KIND_ICONS[item.kind];
                const fresh = item.time !== null && item.time > readBefore;

                return (
                  <li key={item.id}>
                    <Link
                      className={`notification ${item.kind} ${fresh ? "new" : ""}`}
                      to={item.to}
                      onClick={close}
                    >
                      <span className="notification-icon">
                        <Icon size={16} />
                      </span>
                      <span className="notification-text">
                        <strong>{item.title}</strong>
                        <span>{item.text}</span>
                        {item.time !== null && <small>{timeAgo(item.time, openedAt)}</small>}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}

          <Link className="menu-footer" to="/achievements" onClick={close}>
            See all achievements
          </Link>
        </div>
      )}
    </div>
  );
}

export default NotificationsMenu;
