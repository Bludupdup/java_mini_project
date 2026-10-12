import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import "./App.css";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";
import TopicPage from "./pages/TopicPage";

function App() {
  const [search, setSearch] = useState("");
  const { pathname } = useLocation();
  const navigate = useNavigate();

  // Open every page at the top instead of keeping the previous scroll position.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // Search filters the dashboard's topics, so jump back there from other pages.
  function handleSearchChange(value) {
    setSearch(value);

    if (pathname !== "/") {
      navigate("/");
    }
  }

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">
        <Header search={search} onSearchChange={handleSearchChange} />

        <Routes>
          <Route path="/" element={<Dashboard search={search} />} />
          <Route path="/topics/:topicId" element={<TopicPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
