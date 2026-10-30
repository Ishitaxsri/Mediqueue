# MediQueue - Hospital Management System (MERN)

Mini project for **Fullstack Development - I (24CSP-304 / 24ITP-304)**.
It turns the hospital bed-allocation idea into a MERN app that uses only topics from Experiments 1 to 9.

**What it does:** staff register patients, and the system ranks waiting patients by a priority score
(severity, waiting time, distance, age) and places them in an ICU, Emergency or General bed. Patients can be released
to free their bed. Everything is stored in MongoDB.

## 1. Requirements
- Node.js 18 or newer
- MongoDB: local MongoDB Community (with Compass), or a free MongoDB Atlas cluster
- VS Code

## 2. Run the backend
Open a terminal in VS Code (Terminal > New Terminal):

```
cd backend
npm install
npm start
```
You should see `MongoDB connected`, `Beds created` (first run only) and `Server running on http://localhost:5000`.

`backend/.env` is already created. For Atlas, replace `MONGO_URI` in it with your connection string.
Optional: `npm run seed` adds 5 sample patients to the waiting queue.

## 3. Run the frontend
Open a second terminal:

```
cd frontend
npm install
npm run dev
```
Open http://localhost:5173 (no login needed).

## 4. Try it
1. Dashboard: click **Add sample patients**.
2. Waiting queue: see patients ranked by score.
3. Dashboard: click **Allocate next patient** (or **Allocate all waiting**). Watch ward occupancy change.
4. Patients: filter by status, then **Release** an admitted patient to free the bed.
5. Allocation log: see the history of every placement.

## 5. Experiment mapping (for your viva)

| Exp | Where to find it |
|---|---|
| 1 | `PatientCard.jsx` (props, `.map()` with keys), `Layout.jsx` (Header, Sidebar, Footer), conditional rendering in `Patients.jsx` and `Dashboard.jsx` |
| 2 | `PatientForm.jsx` (controlled form), `Patients.jsx` (`useEffect` fetch, spinner, error handling, live search), `Dashboard.jsx` (`useEffect` with `setInterval` and cleanup) |
| 3 | `App.jsx` (routes, nested routes, 404), `PatientDetail.jsx` (`:id` param) |
| 4 | The complete React frontend (list, search, filter, sort, pagination, edit, delete) |
| 5 | `backend/utils/mathUtils.js` and `utils/priority.js` (custom modules), `middleware/logger.js` (`fs` module), `server.js` |
| 6 | `routes/patients.js` (CRUD, status codes 200/201/404), `middleware/logger.js`, `validate.js`, `errorHandler.js` |
| 7 | Not used (login/register removed) |
| 8 | `models/Patient.js` (validations, enum, reference to Bed), `.populate()`, regex search, sort, `.limit()` and `.skip()` in `routes/patients.js` |
| 9 | `frontend/src/api.js` (`fetch`), `app.use(cors())` in `server.js`, full CRUD with live sync in `Patients.jsx` |
| 10 | The complete project |

## 6. How the priority score works (`backend/utils/priority.js`)
`score = severity x 40 + min(minutes waited x 0.5, 30) + max(0, 20 - distance_km x 0.5) + 10 if age is 65+ or 5 or under`

Ward order: severity 4-5 tries ICU, Emergency, General. Severity 3 tries Emergency, ICU, General. Severity 1-2 tries General, Emergency, ICU.
Beds: ICU 5, Emergency 10, General 15 (30 total; created in `config/beds.js`).

## 7. API summary
No authentication is required.

| Method | Route |
|---|---|
| GET, POST | /api/patients |
| GET, PUT, DELETE | /api/patients/:id |
| GET | /api/patients?search=&severity=&status=&sort=&page=&limit= |
| GET | /api/status, /api/queue, /api/log |
| POST | /api/allocate-next, /api/allocate-all, /api/release/:id, /api/demo, /api/reset |

## 8. Common problems
- **MongoDB connection error**: start the MongoDB service, or check the Atlas connection string and IP allow list.
- **Network error in the browser**: make sure the backend is running on port 5000.
