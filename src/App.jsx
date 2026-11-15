import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout.jsx";
import HomePage from "./pages/HomePage.jsx";
import LearnPage from "./pages/LearnPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="learn" element={<Navigate to="/learn/optic-disc" replace />} />
        <Route path="learn/:partId" element={<LearnPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
