const bookedSlots = {};
const userBookings = {};
let selectedSlots = [];

function submitUser() {
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const company = document.getElementById("company").value.trim();

  if (!name || !email || !phone || !company) {
    alert("Please fill in all fields.");
    return;
  }

  document.getElementById("user-form").classList.add("hidden");
  document.getElementById("booking-section").classList.remove("hidden");

  showUserHistory(name, email);
}

function showTimeSlots() {
  const instrument = document.getElementById("instrument-select").value;
  const slotContainer = document.getElementById("timeslots");
  slotContainer.innerHTML = "";
  selectedSlots = [];

  if (!instrument) return;

  const slots = generateTimeSlots("09:00", "19:00");
  const booked = bookedSlots[instrument] || [];

  slots.forEach(timeRange => {
    const slot = document.createElement("div");
    slot.className = "slot";
    slot.textContent = timeRange;

    if (booked.includes(timeRange)) {
      slot.classList.add("booked");
    } else {
      slot.onclick = () => toggleSlotSelection(slot, timeRange);
    }

    slotContainer.appendChild(slot);
  });

  const bookBtn = document.createElement("button");
  bookBtn.textContent = "Confirm Booking";
  bookBtn.style.marginTop = "20px";
  bookBtn.onclick = () => confirmBooking(instrument);
  slotContainer.appendChild(bookBtn);
}

function generateTimeSlots(start, end) {
  const times = [];
  let [hour] = start.split(':').map(Number);
  const [endHour] = end.split(':').map(Number);

  while (hour < endHour) {
    const startT = hour.toString().padStart(2, '0') + ":00";
    const endT = (hour + 1).toString().padStart(2, '0') + ":00";
    times.push(`${startT} - ${endT}`);
    hour++;
  }
  return times;
}

function toggleSlotSelection(slot, timeRange) {
  if (selectedSlots.includes(timeRange)) {
    selectedSlots = selectedSlots.filter(t => t !== timeRange);
    slot.classList.remove("selected");
  } else {
    selectedSlots.push(timeRange);
    slot.classList.add("selected");
  }
}

function confirmBooking(instrument) {
  if (selectedSlots.length === 0) {
    alert("Please select at least one time slot.");
    return;
  }

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const key = `${name}|${email}`;

  const user = {
    name,
    email,
    phone: document.getElementById("phone").value.trim(),
    company: document.getElementById("company").value.trim()
  };

  alert(`Booking Confirmed!\n\nName: ${user.name}\nInstrument: ${instrument}\nTime Slots: ${selectedSlots.join(", ")}`);
sendDataToSheet({
  name: user.name,
  email: user.email,
  phone: user.phone,
  company: user.company,
  bookings: selectedSlots.map(slot => ({
    instrument,
    timeSlot: slot
  }))
});

  if (!bookedSlots[instrument]) {
    bookedSlots[instrument] = [];
  }

  bookedSlots[instrument].push(...selectedSlots);

  if (!userBookings[key]) userBookings[key] = [];
  selectedSlots.forEach(slot =>
    userBookings[key].push({ instrument, timeRange: slot })
  );

  selectedSlots = [];
  document.getElementById("instrument-select").value = "";
  document.getElementById("timeslots").innerHTML = "";

  showUserHistory(name, email);
}

function showUserHistory(name, email) {
  const key = `${name}|${email}`;
  const container = document.getElementById("timeslots");

  if (!userBookings[key] || userBookings[key].length === 0) return;

  const historyBox = document.createElement("div");
  historyBox.style.background = "#eef";
  historyBox.style.padding = "10px";
  historyBox.style.marginBottom = "15px";
  historyBox.style.border = "1px solid #ccc";
  historyBox.style.borderRadius = "8px";

  const title = document.createElement("strong");
  title.textContent = "Your Booking History:";
  historyBox.appendChild(title);

  const list = document.createElement("ul");
  userBookings[key].forEach(entry => {
    const li = document.createElement("li");
    li.textContent = `${entry.instrument}: ${entry.timeRange}`;
    list.appendChild(li);
  });

  historyBox.appendChild(list);
  container.appendChild(historyBox);
}
function sendDataToSheet(data) {
 fetch("https://script.google.com/macros/s/AKfycbylaXFpwQ18JevmJZCD2-ElxJFY-a6U-RwzGy2G4wCaZnC_X-SpT-dZVRRvKvzbTTIOpw/exec", {

    method: "POST",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" }
  })
  .then(res => res.json())
  .then(res => console.log("Google Sheet response:", res))
  .catch(err => console.error("Error sending to Google Sheet:", err));
}
