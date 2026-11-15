import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// Feature 5: instructor portfolios
import InstructorListPage from "./pages/InstructorListPage";
import InstructorPortfolioPage from "./pages/InstructorPortfolioPage";
// Feature 8: landing page builder
import LandingPageListPage from "./pages/LandingPageListPage";
import LandingPageBuilderPage from "./pages/LandingPageBuilderPage";
import LandingPageViewPage from "./pages/LandingPageViewPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/instructors" replace />} />

        {/* Feature 5 */}
        <Route path="/instructors" element={<InstructorListPage />} />
        <Route path="/instructors/:id" element={<InstructorPortfolioPage />} />

        {/* Feature 8 */}
        <Route path="/builder" element={<LandingPageListPage />} />
        <Route path="/builder/new" element={<LandingPageBuilderPage />} />
        <Route path="/builder/:id" element={<LandingPageBuilderPage />} />
        <Route path="/builder/view/:slug" element={<LandingPageViewPage />} />
      </Routes>
    </BrowserRouter>
  );
}
