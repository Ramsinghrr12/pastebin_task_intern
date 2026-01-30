# Pastebin-Lite

A full-stack MERN (MongoDB, Express, React, Node.js) application for creating and sharing text snippets with optional time-based expiry and view count limits.

## Project Description

Pastebin-Lite allows users to:
- Create text pastes with optional constraints (TTL and view limits)
- Share pastes via unique URLs
- View pastes through both API and HTML interfaces
- Automatically expire pastes based on time or view count

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Frontend**: React.js
- **Validation**: express-validator

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn

## Installation & Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd pasteb
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/pastebin-lite
BASE_URL=http://localhost:5000
TEST_MODE=0
```

For MongoDB Atlas (cloud), use:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pastebin-lite
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create a `.env` file in the `frontend` directory (optional, defaults to localhost:5000):

```env
REACT_APP_API_URL=http://localhost:5000
```

### 4. Start MongoDB

Make sure MongoDB is running locally, or use MongoDB Atlas connection string in your `.env` file.

## Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### Production Mode

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
# Serve the build folder using a static server like serve
npx serve -s build
```

## API Endpoints

### Health Check
- `GET /api/healthz` - Returns `{"ok": true}` if service is healthy

### Create Paste
- `POST /api/pastes`
  - Body: `{ "content": "string", "ttl_seconds": 60, "max_views": 5 }`
  - Returns: `{ "id": "string", "url": "https://your-app.com/p/<id>" }`

### Fetch Paste (API)
- `GET /api/pastes/:id`
  - Returns: `{ "content": "string", "remaining_views": 4, "expires_at": "2026-01-01T00:00:00.000Z" }`
  - Returns 404 if paste is unavailable

### View Paste (HTML)
- `GET /p/:id` - Returns HTML page with paste content

## Persistence Layer

**MongoDB** is used as the persistence layer. The application uses Mongoose ODM to interact with MongoDB.

- **Database Name**: `pastebin-lite` (configurable via `MONGODB_URI`)
- **Collection**: `pastes`
- **Schema**: Includes fields for content, TTL, view limits, creation time, and expiry time

The application stores pastes in MongoDB, ensuring data persistence across server restarts and in serverless environments (when using MongoDB Atlas).

## Design Decisions

1. **MERN Stack**: Chose MongoDB for flexible document storage, Express for RESTful API, React for modern UI, and Node.js for JavaScript consistency across the stack.

2. **ID Generation**: Using `crypto.randomBytes()` to generate unique 16-character hexadecimal IDs for pastes.

3. **View Counting**: View count is incremented atomically using Mongoose's `save()` method to prevent race conditions.

4. **TTL Handling**: Expiry time is calculated and stored at creation time. The `isAvailable()` method checks both TTL and view limits.

5. **TEST_MODE**: Supports deterministic time testing via `TEST_MODE=1` environment variable and `x-test-now-ms` header for automated testing.

6. **XSS Prevention**: HTML content is escaped when rendering pastes to prevent script execution.

7. **Error Handling**: Consistent JSON error responses for API endpoints and user-friendly HTML error pages for web views.

8. **Concurrent Safety**: View counting uses database operations to ensure accuracy under concurrent load.

## Testing

The application supports automated testing with deterministic time:

1. Set `TEST_MODE=1` in backend `.env`
2. Send requests with `x-test-now-ms` header (milliseconds since epoch)
3. The application will use the header value as the current time for expiry checks

Example:
```bash
curl -H "x-test-now-ms: 1704067200000" http://localhost:5000/api/pastes/abc123
```

## Deployment

### Vercel Deployment (Recommended)

1. **Backend**: Deploy as a serverless function or use Vercel's Node.js runtime
2. **Frontend**: Deploy React build folder to Vercel
3. **Database**: Use MongoDB Atlas (free tier available)

### Environment Variables for Production

Set these in your deployment platform:
- `MONGODB_URI`: Your MongoDB connection string
- `BASE_URL`: Your deployed application URL
- `PORT`: Server port (usually auto-set by platform)

## Project Structure

```
pasteb/
├── backend/
│   ├── models/
│   │   └── Paste.js          # MongoDB schema
│   ├── routes/
│   │   ├── healthz.js        # Health check endpoint
│   │   ├── pastes.js          # Paste CRUD endpoints
│   │   └── view.js            # HTML view endpoint
│   ├── server.js              # Express server setup
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CreatePaste.js # Create paste form
│   │   │   └── ViewPaste.js   # View paste page
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
└── README.md
```

## License

ISC
