import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout.jsx";
import { Loading } from "./components/ui.jsx";
import HomePage from "./pages/HomePage.jsx";

// other pages load on demand so the home screen stays fast (recharts is large)
const LearnPage = lazy(() => import("./pages/LearnPage.jsx"));
const CheckupsPage = lazy(() => import("./pages/CheckupsPage.jsx"));
const RiskPage = lazy(() => import("./pages/RiskPage.jsx"));

const page = (el) => <Suspense fallback={<Loading what="page" />}>{el}</Suspense>;

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="learn" element={<Navigate to="/learn/optic-disc" replace />} />
        <Route path="learn/:partId" element={page(<LearnPage />)} />
        <Route path="checkups" element={page(<CheckupsPage />)} />
        <Route path="risk" element={page(<RiskPage />)} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
