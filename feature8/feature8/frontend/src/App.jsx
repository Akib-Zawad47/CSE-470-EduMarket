import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPageListPage from "./pages/LandingPageListPage";
import LandingPageBuilderPage from "./pages/LandingPageBuilderPage";
import LandingPageViewPage from "./pages/LandingPageViewPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/builder" replace />} />
        <Route path="/builder" element={<LandingPageListPage />} />
        <Route path="/builder/new" element={<LandingPageBuilderPage />} />
        <Route path="/builder/view/:slug" element={<LandingPageViewPage />} />
        <Route path="/builder/:id" element={<LandingPageBuilderPage />} />
      </Routes>
    </BrowserRouter>
  );
}
