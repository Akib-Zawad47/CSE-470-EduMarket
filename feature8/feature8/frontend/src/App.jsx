import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import StudentPortalPage from "./pages/StudentPortalPage";
import LandingPageListPage from "./pages/LandingPageListPage";
import LandingPageBuilderPage from "./pages/LandingPageBuilderPage";
import LandingPageViewPage from "./pages/LandingPageViewPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StudentPortalPage />} />
        <Route path="/dashboard" element={<StudentPortalPage />} />
        <Route path="/login" element={<StudentPortalPage />} />
        <Route path="/builder" element={<LandingPageListPage />} />
        <Route path="/builder/new" element={<LandingPageBuilderPage />} />
        <Route path="/builder/view/:slug" element={<LandingPageViewPage />} />
        <Route path="/builder/:id" element={<LandingPageBuilderPage />} />
      </Routes>
    </BrowserRouter>
  );
}
