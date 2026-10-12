import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import "./App.css";
import { GuestOnly, RequireAuth } from "./auth/RouteGuards";
import AppLayout from "./components/AppLayout";
import AchievementsPage from "./pages/AchievementsPage";
import BookmarksPage from "./pages/BookmarksPage";
import Dashboard from "./pages/Dashboard";
import HelpPage from "./pages/HelpPage";
import LoginPage from "./pages/LoginPage";
import PracticePage from "./pages/PracticePage";
import ProgressPage from "./pages/ProgressPage";
import RegisterPage from "./pages/RegisterPage";
import SettingsPage from "./pages/SettingsPage";
import TopicPage from "./pages/TopicPage";
import TopicsPage from "./pages/TopicsPage";

function App() {
  // The header search is shared: the header shows quick results and the
  // topics page filters its grid with the same text.
  const [search, setSearch] = useState("");
  const { pathname } = useLocation();

  // Open every page at the top instead of keeping the previous scroll position.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <Routes>
      <Route path="/login" element={<GuestOnly><LoginPage /></GuestOnly>} />
      <Route path="/register" element={<GuestOnly><RegisterPage /></GuestOnly>} />

      {/* Everything else needs a logged-in user. */}
      <Route
        element={
          <RequireAuth>
            <AppLayout search={search} onSearchChange={setSearch} />
          </RequireAuth>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route
          path="/topics"
          element={<TopicsPage search={search} onSearchChange={setSearch} />}
        />
        <Route path="/topics/:topicId" element={<TopicPage />} />
        <Route path="/bookmarks" element={<BookmarksPage />} />
        <Route path="/practice" element={<PracticePage />} />
        <Route path="/progress" element={<ProgressPage />} />
        <Route path="/achievements" element={<AchievementsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
