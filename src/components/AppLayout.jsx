import { Outlet } from "react-router-dom";
import AchievementToasts from "./AchievementToasts";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { useAuth } from "../auth/AuthContext";
import LearningProvider from "../learning/LearningProvider";

/**
 * The frame around every logged-in page: sidebar, header and the page itself
 * (<Outlet />). Progress is loaded for this account; key={user.id} gives the
 * next account that logs in a completely fresh provider.
 */
function AppLayout({ search, onSearchChange }) {
  const { user } = useAuth();

  return (
    <LearningProvider key={user.id} userId={user.id}>
      <div className="app-layout">
        <Sidebar />

        <main className="main-content">
          <Header search={search} onSearchChange={onSearchChange} />
          <Outlet />
        </main>

        <AchievementToasts />
      </div>
    </LearningProvider>
  );
}

export default AppLayout;
