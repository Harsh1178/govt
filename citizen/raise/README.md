# Citizen Complaint Demo

Run:
1. `python -m venv venv`
2. Activate the environment.
3. `pip install -r requirements.txt`
4. `python app.py`
5. Open http://127.0.0.1:5000

Camera and geolocation require a secure context; localhost is allowed by modern browsers. The demo uses Nominatim for reverse geocoding and prints complaint records instead of using a database.
