# Feature 8: Dynamic Landing Page Builder

A marketing person builds a course promo page from ready-made blocks
(hero, text, image, YouTube video, feature list, testimonial, FAQ, call-to-action),
puts them in order by drag and drop, and publishes it at `/p/<web-address>`.
No code is needed to build a page.

## What is new, and where each file goes

All paths are inside your `feature5` folder (the shared project). Nothing is deleted.

| New file | Goes into | What it does |
|---|---|---|
| `models/LandingPage.java` | `backend-main/src/main/java/com/edumarket/core/models/` (new folder) | JPA entity for the existing `landing_pages` table |
| `repositories/LandingPageRepository.java` | `.../core/repositories/` | Spring Data JPA queries (find by slug, etc.) |
| `dto/LandingPageRequest.java`, `LandingPageResponse.java`, `LandingPageSummary.java` | `.../core/dto/` | Shapes of the JSON sent and received |
| `services/LandingPageValidator.java` | `.../core/services/` | The business rules (allowed blocks, slug format, max 50 blocks) |
| `services/LandingPageService.java` | `.../core/services/` | Create, edit, delete, read pages |
| `controllers/LandingPageController.java` | `.../core/controllers/` | The REST endpoints |
| `components/builder/*` (4 files) | `frontend/src/components/builder/` (new folder) | Block definitions, block drawing, settings form |
| `pages/LandingPage*.jsx` (3 files) | `frontend/src/pages/` | Page list, builder, public page |
| `services/landingPageService.js` | `frontend/src/services/` | Calls to the backend |
| `styles/builder.css` | `frontend/src/styles/` | Styling |

## Shared files that change (please tell your team)

1. `frontend/src/App.jsx`: this zip contains a new version that keeps the Feature 5
   routes and adds 4 routes for Feature 8. If your team has already changed
   App.jsx, do not overwrite it: just add the 4 `<Route>` lines and 3 `import` lines.
2. `backend-main/src/main/resources/application.properties`: add ONE line so the
   browser can show error messages (like "That slug is already used"):

       server.error.include-message=always

No database change. The table `landing_pages` from `schema.sql` is used as it is.

The builder page also reuses `services/portfolioService.js` from Feature 5
(to list instructors and their courses), so Feature 5 must be in the project.

## Run it

1. Copy the files as in the table, then add the one line above.
2. Stop the backend if it is running (Ctrl+C in its terminal), then start it again:

       . "D:\CSE470 Project\env17.ps1"
       cd "D:\CSE470 Project\feature5\backend-main"
       mvn spring-boot:run "-Dmaven.repo.local=D:\maven-repo"

3. In another terminal start the frontend: `cd frontend`, `npm install`, `npm run dev`.
4. Open http://localhost:5173/builder

## Try it

1. Click **New page**. Type a title (the web address fills itself in).
2. Choose an instructor, then one of their courses.
3. Drag blocks from the left into the middle, or click a block to add it.
4. Click a block in the middle to edit its text on the right.
   Reorder by dragging a block, or with the up and down buttons.
5. Click **Save page**, then **Open public page**.

## API

| Method and path | What it does |
|---|---|
| `GET /api/landing-pages` | List of pages (title, address, number of blocks) |
| `GET /api/landing-pages/{id}` | One page with all its blocks |
| `POST /api/landing-pages` | Create a page. 400 if a rule is broken, 409 if the address is taken |
| `PUT /api/landing-pages/{id}` | Save changes |
| `DELETE /api/landing-pages/{id}` | Delete a page |
| `GET /api/public/landing-pages/{slug}` | Public page for visitors |

Request body:

    { "title": "Web Dev Bootcamp", "slug": "web-dev-bootcamp",
      "instructorId": 2, "courseId": 1,
      "blocks": [ { "id": "b1", "type": "hero", "props": { "heading": "Learn to code" } } ] }

## How it is stored

Blocks are saved as JSON in the `content` column (type `jsonb`) of `landing_pages`.
Adding a new kind of block later needs no database change: add it to
`LandingPageValidator.ALLOWED_BLOCK_TYPES` and to `blockUtils.js` and `BlockRenderer.jsx`.

## Known limits (to mention in your report)

- There is no login yet (Feature 1). The builder endpoints are open, and the page
  creator is chosen from a list. When RBAC exists, the creator should come from the
  logged-in user and `/api/landing-pages/**` should require the marketing/instructor role,
  while `/api/public/**` stays open.
- There is no draft/published switch, because the table has no such column. Every saved
  page is public at its address. Adding one would be a database change, so ask first.
- Links in blocks only work for http, https, relative and # addresses. Videos only for YouTube.
