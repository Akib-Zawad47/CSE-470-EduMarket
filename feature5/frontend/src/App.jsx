import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import InstructorListPage from "./pages/InstructorListPage";
import InstructorPortfolioPage from "./pages/InstructorPortfolioPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/instructors" replace />} />
        <Route path="/instructors" element={<InstructorListPage />} />
        <Route path="/instructors/:id" element={<InstructorPortfolioPage />} />
      </Routes>
    </BrowserRouter>
  );
}
