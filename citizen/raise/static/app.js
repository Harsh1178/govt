const $ = id => document.getElementById(id);
let stream = null, photo = null;

const tags = [
  "Municipal Corporation",
  "Water Department",
  "Electricity Department",
  "Roads Department",
  "Public Works Department",
  "Health Department",
  "Sanitation Department",
  "Traffic Police",
  "District Administration",
  "Urban Development Department",
  "Rural Development Department",
  "Education Department"
];

$("raise").onclick = () => {
  $("modal").classList.remove("hidden");
  $("text").focus();
};

function close() {
  stop();
  $("modal").classList.add("hidden");
}
$("close").onclick = close;
$("cancel").onclick = close;

$("text").oninput = () => {
  let b = $("text").value.slice(0, $("text").selectionStart);
  let m = b.match(/@([a-zA-Z0-9 _-]*)$/);
  if (!m) return hide();
  
  let q = m[1].trim().toLowerCase();
  let a = tags.filter(x => !q || x.toLowerCase().includes(q)).slice(0, 8);
  if (!a.length) return hide();

  let s = $("suggestions");
  s.innerHTML = "";
  a.forEach(n => {
    let x = document.createElement("button");
    x.type = "button";
    x.className = "suggestion";
    x.textContent = "@" + n;
    x.onclick = () => {
      let c = $("text").selectionStart;
      let b = $("text").value.slice(0, c);
      let start = b.length - m[0].length;
      $("text").value = b.slice(0, start) + "@" + n + " " + $("text").value.slice(c);
      hide();
      $("text").focus();
    };
    s.appendChild(x);
  });
  s.classList.remove("hidden");
};

function hide() {
  $("suggestions").classList.add("hidden");
  $("suggestions").innerHTML = "";
}

$("camera").onclick = async () => {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" } },
      audio: false
    });
    $("video").srcObject = stream;
    $("cameraPanel").classList.remove("hidden");
    $("status").textContent = "Camera ready. Requesting location…";
    loc();
  } catch {
    $("status").textContent = "Camera permission was denied or unavailable.";
  }
};

$("capture").onclick = () => {
  let v = $("video"), c = $("canvas");
  c.width = v.videoWidth || 640;
  c.height = v.videoHeight || 480;
  c.getContext("2d").drawImage(v, 0, 0);
  c.toBlob(b => {
    photo = b;
    $("preview").innerHTML = '<img src="' + URL.createObjectURL(b) + '" alt="Captured evidence">';
    stop();
    $("status").textContent = "✓ Photo captured successfully.";
  }, "image/jpeg", 0.9);
};

$("stop").onclick = stop;
function stop() {
  if (stream) {
    stream.getTracks().forEach(t => t.stop());
    stream = null;
  }
  if ($("video")) $("video").srcObject = null;
  $("cameraPanel").classList.add("hidden");
}

$("location").onclick = loc;
function loc() {
  if (!navigator.geolocation) {
    $("status").textContent = "Geolocation unavailable.";
    return;
  }
  $("status").textContent = "Requesting location…";
  navigator.geolocation.getCurrentPosition(
    async p => {
      let la = p.coords.latitude, lo = p.coords.longitude;
      $("latitude").value = la;
      $("longitude").value = lo;
      $("lat").textContent = la.toFixed(6);
      $("lon").textContent = lo.toFixed(6);
      $("status").textContent = "Looking up address…";
      try {
        let r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${la}&lon=${lo}&format=jsonv2&addressdetails=1`);
        let json = await r.json();
        let a = json.address || {};
        $("town").value = a.town || a.suburb || a.village || a.neighbourhood || a.municipality || "";
        $("city").value = a.city || a.city_district || a.county || "";
        $("state").value = a.state || "";
        $("pincode").value = a.postcode || "";
        $("status").textContent = "✓ Current location detected.";
      } catch {
        $("status").textContent = "Coordinates found; address lookup failed.";
      }
    },
    () => {
      $("status").textContent = "Location permission denied/unavailable. Enter it manually.";
    },
    { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
  );
}

$("form").onsubmit = e => {
  e.preventDefault();
  let text = $("text").value.trim();
  if (!text) {
    alert("Please enter a complaint description.");
    return;
  }
  let complaintId = "CMP-" + new Date().toISOString().replace(/[-:T]/g, "").slice(0, 14) + "-" + Math.random().toString(36).substring(2, 8).toUpperCase();
  alert("Complaint submitted successfully. ID: " + complaintId);
  close();
};