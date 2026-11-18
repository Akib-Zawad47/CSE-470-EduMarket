# How to run Feature 5 on your computer

## One-time setup
1. Install **JDK 17 or newer** (Java 8 is too old) and **Maven**.
   Close and reopen VS Code afterwards, then check:
   `java -version` shows 17 or higher, and `mvn -v` prints a version.
2. Open `backend-main/src/main/resources/application.properties` and replace
   `YOUR_PASSWORD` with your PostgreSQL password.
3. Make sure `schema.sql` and `seed.sql` are already loaded in the `Edu_Market`
   database in pgAdmin.

## Start the backend (Terminal 1)
    cd backend-main
    mvn spring-boot:run

Wait for "Started EduMarketApplication". Test: open
http://localhost:8080/api/public/instructors in the browser. You should see JSON.

## Start the frontend (Terminal 2)
    cd frontend
    npm install
    npm run dev

Open http://localhost:5173/instructors in the browser.

## Common problems
- "release version 17 not supported": Java is still version 8. Install JDK 17+
  and reopen the terminal.
- "password authentication failed": wrong password in application.properties.
- "database ... does not exist": the name in application.properties must match
  pgAdmin exactly (`Edu_Market`).
- Page says "Could not load": the backend is not running or is not on port 8080.
