const flights = [
  { id: 1, airline: "IndiGo", from: "Hyderabad", to: "Dubai", depart: "06:20", arrive: "08:55", duration: "3h 05m", price: 245, class: "Economy" },
  { id: 2, airline: "Air India", from: "Hyderabad", to: "Dubai", depart: "09:10", arrive: "11:40", duration: "3h 00m", price: 315, class: "Economy" },
  { id: 3, airline: "Emirates", from: "Hyderabad", to: "Dubai", depart: "13:35", arrive: "15:55", duration: "2h 50m", price: 520, class: "Business" },
  { id: 4, airline: "Qatar Airways", from: "Hyderabad", to: "Doha", depart: "17:45", arrive: "20:10", duration: "3h 10m", price: 410, class: "Economy" },
  { id: 5, airline: "Vistara", from: "Mumbai", to: "Singapore", depart: "22:30", arrive: "06:20", duration: "5h 20m", price: 480, class: "Business" },
  { id: 6, airline: "Singapore Airlines", from: "Delhi", to: "Singapore", depart: "07:15", arrive: "15:00", duration: "5h 30m", price: 610, class: "Business" },
  { id: 7, airline: "AirAsia", from: "Hyderabad", to: "Bangkok", depart: "11:05", arrive: "16:15", duration: "4h 30m", price: 275, class: "Economy" },
  { id: 8, airline: "Etihad", from: "Hyderabad", to: "Abu Dhabi", depart: "19:25", arrive: "21:35", duration: "3h 25m", price: 360, class: "Economy" }
];

const slides = [...document.querySelectorAll(".slide")];
const dotsContainer = document.getElementById("carouselDots");
const prevSlide = document.getElementById("prevSlide");
const nextSlide = document.getElementById("nextSlide");
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

const flightResults = document.getElementById("flightResults");
const loading = document.getElementById("loading");
const resultsCount = document.getElementById("resultsCount");
const bookingModal = document.getElementById("bookingModal");
const bookingSummary = document.getElementById("bookingSummary");
const confirmation = document.getElementById("confirmation");

const searchForm = document.getElementById("searchForm");
const priceFilter = document.getElementById("priceFilter");
const priceValue = document.getElementById("priceValue");
const timeFilter = document.getElementById("timeFilter");
const airlineFilter = document.getElementById("airlineFilter");
const sortBy = document.getElementById("sortBy");

let currentSlide = 0;
let autoSlide;
let selectedFlight = null;

function renderDots() {
  dotsContainer.innerHTML = "";
  slides.forEach((_, i) => {
    const btn = document.createElement("button");
    btn.className = `dot ${i === 0 ? "active" : ""}`;
    btn.setAttribute("aria-label", `Go to slide ${i + 1}`);
    btn.addEventListener("click", () => showSlide(i));
    dotsContainer.appendChild(btn);
  });
}
function updateDots() {
  document.querySelectorAll(".dot").forEach((dot, i) => dot.classList.toggle("active", i === currentSlide));
}
function showSlide(index) {
  slides[currentSlide].classList.remove("active");
  currentSlide = (index + slides.length) % slides.length;
  slides[currentSlide].classList.add("active");
  updateDots();
}
function startAutoSlide() {
  autoSlide = setInterval(() => showSlide(currentSlide + 1), 5000);
}
function resetAutoSlide() {
  clearInterval(autoSlide);
  startAutoSlide();
}

function airlineIcon(name) {
  const map = { IndiGo: "🛫", "Air India": "🇮🇳", Emirates: "🌍", "Qatar Airways": "⭐", Vistara: "✈", "Singapore Airlines": "🛩", AirAsia: "🟥", Etihad: "🟡" };
  return map[name] || "✈";
}

function getTimeGroup(time) {
  const hour = parseInt(time.split(":")[0], 10);
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 22) return "evening";
  return "night";
}

function getFilteredFlights() {
  const from = document.getElementById("from").value.trim().toLowerCase();
  const to = document.getElementById("to").value.trim().toLowerCase();
  const maxPrice = Number(priceFilter.value);
  const time = timeFilter.value;
  const airline = airlineFilter.value;
  const travelClass = document.getElementById("travelClass").value;

  let data = flights.filter(f =>
    (!from || f.from.toLowerCase().includes(from)) &&
    (!to || f.to.toLowerCase().includes(to)) &&
    f.price <= maxPrice &&
    (airline === "all" || f.airline === airline) &&
    (time === "all" || getTimeGroup(f.depart) === time) &&
    (travelClass === "all" || f.class === travelClass)
  );

  switch (sortBy.value) {
    case "priceLow": data.sort((a, b) => a.price - b.price); break;
    case "priceHigh": data.sort((a, b) => b.price - a.price); break;
    case "durationShort": data.sort((a, b) => a.duration.localeCompare(b.duration)); break;
    default: break;
  }
  return data;
}

function renderFlights(list) {
  if (!list.length) {
    flightResults.innerHTML = `<div class="deal-card"><h3>No flights found</h3><p>Try adjusting your filters or search route.</p></div>`;
    resultsCount.textContent = "No matching flights";
    return;
  }

  resultsCount.textContent = `${list.length} flight${list.length > 1 ? "s" : ""} found`;
  flightResults.innerHTML = list.map(f => `
    <article class="flight-card">
      <div>
        <div class="airline">
          <div class="airline-badge">${airlineIcon(f.airline)}</div>
          <div>
            <h3>${f.airline}</h3>
            <p>${f.from} → ${f.to}</p>
          </div>
        </div>
        <div class="flight-meta">
          <span>Departure: ${f.depart}</span>
          <span>Arrival: ${f.arrive}</span>
          <span>Duration: ${f.duration}</span>
          <span>Class: ${f.class}</span>
        </div>
      </div>
      <div>
        <div class="price">$${f.price}</div>
        <p class="muted">Per passenger</p>
      </div>
      <div>
        <button class="primary-btn book-btn" data-id="${f.id}">Book Now</button>
      </div>
    </article>
  `).join("");

  document.querySelectorAll(".book-btn").forEach(btn => {
    btn.addEventListener("click", () => openBooking(Number(btn.dataset.id)));
  });
}

function refreshResults() {
  loading.hidden = false;
  flightResults.style.opacity = 0.4;
  setTimeout(() => {
    renderFlights(getFilteredFlights());
    loading.hidden = true;
    flightResults.style.opacity = 1;
  }, 700);
}

function openBooking(id) {
  selectedFlight = flights.find(f => f.id === id);
  bookingSummary.innerHTML = `
    <strong>${selectedFlight.airline}</strong><br>
    ${selectedFlight.from} → ${selectedFlight.to}<br>
    Departure: ${selectedFlight.depart} | Arrival: ${selectedFlight.arrive}<br>
    Duration: ${selectedFlight.duration} | Price: $${selectedFlight.price}
  `;
  confirmation.hidden = true;
  bookingModal.classList.add("show");
  bookingModal.setAttribute("aria-hidden", "false");
}

function closeModal() {
  bookingModal.classList.remove("show");
  bookingModal.setAttribute("aria-hidden", "true");
}

renderDots();
showSlide(0);
startAutoSlide();

prevSlide.addEventListener("click", () => { showSlide(currentSlide - 1); resetAutoSlide(); });
nextSlide.addEventListener("click", () => { showSlide(currentSlide + 1); resetAutoSlide(); });

menuToggle.addEventListener("click", () => {
  const show = navLinks.classList.toggle("show");
  menuToggle.setAttribute("aria-expanded", String(show));
});

[priceFilter, timeFilter, airlineFilter, sortBy].forEach(el => el.addEventListener("change", refreshResults));
document.getElementById("travelClass").addEventListener("change", refreshResults);

searchForm.addEventListener("submit", e => {
  e.preventDefault();
  refreshResults();
});

document.getElementById("bookingForm").addEventListener("submit", e => {
  e.preventDefault();
  confirmation.hidden = false;
  setTimeout(closeModal, 1800);
});

document.getElementById("closeModal").addEventListener("click", closeModal);
bookingModal.addEventListener("click", e => { if (e.target === bookingModal) closeModal(); });

airlineFilter.innerHTML += [...new Set(flights.map(f => f.airline))]
  .map(a => `<option value="${a}">${a}</option>`).join("");

priceFilter.value = "1200";
priceValue.textContent = "$1200 max";
priceFilter.addEventListener("input", () => {
  priceValue.textContent = `$${priceFilter.value} max`;
  refreshResults();
});

document.addEventListener("keydown", e => {
  if (e.key === "Escape") closeModal();
});

renderFlights(flights);
