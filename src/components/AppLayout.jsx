import { Outlet } from "react-router-dom";
import { TriangleAlert, X } from "lucide-react";
import AchievementToasts from "./AchievementToasts";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { useAuth } from "../auth/AuthContext";
import CatalogProvider from "../catalog/CatalogProvider";
import { useLearning } from "../learning/LearningContext";
import LearningProvider from "../learning/LearningProvider";

/** Shown when a change couldn't be saved to the server. */
function SaveErrorBanner() {
  const { saveError, dismissSaveError } = useLearning();

  if (!saveError) return null;

  return (
    <div className="auth-alert save-error" role="alert">
      <TriangleAlert size={16} />
      <span>Your last change wasn't saved. {saveError}</span>
      <button type="button" className="icon-button" onClick={dismissSaveError} aria-label="Dismiss">
        <X size={15} />
      </button>
    </div>
  );
}

/**
 * The frame around every logged-in page: sidebar, header and the page itself
 * (<Outlet />). Topics come from the backend first, then this account's
 * progress; key={user.id} gives the next account a completely fresh provider.
 */
function AppLayout({ search, onSearchChange }) {
  const { user } = useAuth();

  return (
    <CatalogProvider>
      <LearningProvider key={user.id}>
        <div className="app-layout">
          <Sidebar />

          <main className="main-content">
            <Header search={search} onSearchChange={onSearchChange} />
            <SaveErrorBanner />
            <Outlet />
          </main>

          <AchievementToasts />
        </div>
      </LearningProvider>
    </CatalogProvider>
  );
}

export default AppLayout;
