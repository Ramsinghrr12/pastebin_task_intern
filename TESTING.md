# Testing Guide for Pastebin-Lite

## Quick Start Testing

### 1. Start the Backend
```bash
cd backend
npm install  # if not already done
npm run dev
```
Backend should run on http://localhost:5000

### 2. Start the Frontend
```bash
cd frontend
npm install  # if not already done
npm start
```
Frontend should open at http://localhost:3000

### 3. Test Input Scenarios

#### Test Case 1: Basic Paste (No Constraints)
1. Open http://localhost:3000
2. Enter some text in the "Paste Content" field:
   ```
   Hello, this is a test paste!
   ```
3. Leave TTL and Max Views empty
4. Click "Create Paste"
5. ✅ Should show success message with URL

#### Test Case 2: Paste with TTL
1. Enter content: `This paste expires in 60 seconds`
2. Enter TTL: `60`
3. Leave Max Views empty
4. Click "Create Paste"
5. ✅ Should create paste that expires in 60 seconds

#### Test Case 3: Paste with View Limit
1. Enter content: `This paste can only be viewed 2 times`
2. Enter Max Views: `2`
3. Leave TTL empty
4. Click "Create Paste"
5. ✅ Should create paste with view limit of 2

#### Test Case 4: Paste with Both Constraints
1. Enter content: `Limited paste`
2. Enter TTL: `120`
3. Enter Max Views: `3`
4. Click "Create Paste"
5. ✅ Should create paste with both constraints

#### Test Case 5: Validation Test
1. Try to submit without entering content
2. ✅ Button should be disabled
3. ✅ Form should not submit

#### Test Case 6: Error Handling
1. Stop the backend server
2. Try to create a paste
3. ✅ Should show error: "Unable to connect to server..."

## Testing via API (using curl or Postman)

### Create a Paste
```bash
curl -X POST http://localhost:5000/api/pastes \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Test paste content",
    "ttl_seconds": 3600,
    "max_views": 5
  }'
```

### View Paste (API)
```bash
curl http://localhost:5000/api/pastes/<paste-id>
```

### View Paste (HTML)
Open in browser: http://localhost:5000/p/<paste-id>

### Health Check
```bash
curl http://localhost:5000/api/healthz
```

## Expected Results

✅ **Success Indicators:**
- Form submits without errors
- Success message appears with URL
- URL is clickable and works
- Paste content displays correctly
- View count decreases on each view
- Paste expires after TTL or view limit

❌ **Error Indicators:**
- Error message appears if backend is down
- Validation errors for invalid input
- 404 error for expired/unavailable pastes
