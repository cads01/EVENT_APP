# Countdown + Reminder + Geolocation Feature

## What was added

### Backend
- `server/models/Event.js` — added `venue { address, lat, lng }` fields
- `server/jobs/reminderJob.js` — weekly cron job (Mondays 9AM Lagos time)
- `server/routes/adminRoutes.js` — manual trigger route for testing
- `server/server.js` — starts the cron job after DB connects

### Frontend
- `client/src/components/Countdown.jsx` — live days/hours/mins/secs ticker
- `client/src/components/GetDirections.jsx` — geolocation → Google Maps

---

## Setup

### 1. Install node-cron and resend on the server
```bash
cd server
npm install node-cron resend
```

### 2. Add env variables to your Render backend
```
RESEND_API_KEY=re_xxxxxxxxxxxx
EMAIL_FROM=reminders@yourdomain.com
GOOGLE_MAPS_API_KEY=AIza...  (optional — for static map image in emails)
```

### 3. Mount admin routes in server.js
```js
import adminRoutes from "./routes/adminRoutes.js";
app.use("/api/admin", adminRoutes);
```

### 4. When creating events via your admin form
Add lat/lng fields so the map link is precise. If you only have an address string, the Google Maps link still works — it geocodes the address automatically.

---

## Using the components

### Countdown — drop into your event detail page
```jsx
import Countdown from "../components/Countdown";

// Inside your event detail JSX:
<Countdown eventDate={event.date} />
```

### GetDirections — drop below the countdown or location field
```jsx
import GetDirections from "../components/GetDirections";

<GetDirections venue={event.venue} location={event.location} />
```

---

## How the geolocation works

1. User clicks "Get Directions"
2. Browser requests their GPS location
3. If granted → opens `maps.google.com/dir/USER_LAT,USER_LNG/EVENT_LAT,EVENT_LNG`
4. If denied → opens `maps.google.com/dir/?destination=EVENT_ADDRESS` (Google asks for location itself)

Works on mobile and desktop. No API key needed for directions links.

---

## Testing reminders locally

Hit this endpoint as an admin user:
```
POST /api/admin/send-reminders
Authorization: Bearer <admin_jwt_token>
```

This fires the same function the cron job calls — you'll see emails land in real inboxes immediately.
