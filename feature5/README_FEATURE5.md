# Feature 5: Custom Instructor Portfolios

Public pages that show an instructor's bio, ratings aggregated from student
reviews, and their full course catalog. No login is needed to view them.

## 1. Copy the files into your project

| From this folder | Into your project |
|---|---|
| `backend-main/src/main/java/com/edumarket/core/dto/*`          | `backend-main/src/main/java/com/edumarket/core/dto/` (new folder) |
| `backend-main/src/main/java/com/edumarket/core/repositories/PortfolioRepository.java` | `.../core/repositories/` |
| `backend-main/src/main/java/com/edumarket/core/services/PortfolioService.java`        | `.../core/services/` |
| `backend-main/src/main/java/com/edumarket/core/controllers/PortfolioController.java`  | `.../core/controllers/` |
| `frontend/src/pages/*`, `components/*`, `services/*`, `styles/*` | the same folders under `frontend/src/` |

## 2. Backend settings

`application.properties` must point at your database:

    spring.datasource.url=jdbc:postgresql://localhost:5432/Edu_Market
    spring.datasource.username=postgres
    spring.datasource.password=YOUR_PASSWORD

Use the exact database name you created in pgAdmin (`Edu_Market`).

These endpoints are public. When Feature 1 (RBAC) adds Spring Security, it must
allow `/api/public/**` without a login.

## 3. Frontend routes

Install what the pages use: `npm install axios react-router-dom`

In `App.jsx`:

    import { BrowserRouter, Routes, Route } from "react-router-dom";
    import InstructorListPage from "./pages/InstructorListPage";
    import InstructorPortfolioPage from "./pages/InstructorPortfolioPage";

    <BrowserRouter>
      <Routes>
        <Route path="/instructors" element={<InstructorListPage />} />
        <Route path="/instructors/:id" element={<InstructorPortfolioPage />} />
      </Routes>
    </BrowserRouter>

The API address is the `API_BASE` line in `services/portfolioService.js`.

## 4. Try it

1. Start the backend, then open <http://localhost:8080/api/public/instructors>
   in the browser. You should see JSON for the seeded instructors.
2. Open <http://localhost:8080/api/public/instructors/2> for one full portfolio.
3. Start the frontend and visit `/instructors`, then click a card.

## API

| Method and path | Returns |
|---|---|
| `GET /api/public/instructors?search=name` | List of instructors with average rating, review, student and course counts, best rated first |
| `GET /api/public/instructors/{id}` | `instructor`, `courses` (with per-course rating and student count), `recentReviews` (latest 6). 404 if not found |

Ratings are calculated live from the `reviews` table, and students are counted
from ACTIVE and COMPLETED enrollments.
