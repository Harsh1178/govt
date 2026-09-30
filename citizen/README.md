# JanConnect Citizen Complaint Portal

A modern, high-performance web application built with **100% pure HTML, CSS, and JavaScript** (no Flask or backend server required).

## Features
- **Integrated Complaint Flow**:
  - **Inline `@` Mention Autocomplete**: Instant, zero-latency department suggestions from `list.txt` as you type `@` in the description.
  - **Live Camera Evidence Capture**: Uses `navigator.mediaDevices.getUserMedia` and HTML5 `<canvas>` to capture photos directly from your webcam or mobile camera.
  - **Photo File Upload**: Option to attach evidence photos from device storage.
  - **GPS Geolocation & OpenStreetMap Reverse Geocoding**: Direct client-side reverse geocoding via OpenStreetMap Nominatim API, automatically populating Town, City, State, and Pincode.
  - **Editable Location Inputs**: Town, City, State, and Pincode fields can be reviewed and edited before submission.
- **Client-Side Persistence (`localStorage`)**:
  - Complaints are saved to browser storage, persisting across page refreshes.
  - Automatically updates the **My Complaints** view with the newly raised complaint (`Under review`, timestamp, address, evidence image).
  - Rewards **+25 Citizen Points** upon submission and updates all dashboard counters.
- **Interactive Community Feed**:
  - Public civic reports with upvotes, comments, before/after resolution imagery, and category filters.

## How to Run

Simply open **`index.html`** in any web browser!

Or serve using any static web server (e.g. VS Code Live Server or Python static server):
```bash
python -m http.server 8000
```
Then visit `http://localhost:8000`.
