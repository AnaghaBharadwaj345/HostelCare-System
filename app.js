/////////////////////////////////////////////////////
// HOSTELCARE - FULL SYSTEM (FINAL + STATUS WORKFLOW)
/////////////////////////////////////////////////////

// ==========================
// STATE (FAKE DATABASE)
// ==========================

let state = {
  complaints: [],
  counter: 0,
  session: null,

  accounts: {
    "1MS22CS001": {
      name: "Ananya",
      password: "pass123",
      role: "student"
    }
  },

  wardenAccounts: {
    "pass123": {
      name: "Warden",
      password: "warden123",
      role: "warden"
    }
  },

  techAccounts: {
    "Ramesh": {
      name: "Ramesh",
      password: "tech123",
      role: "technician",
      category: "plumbing"
    },
    "Vikram": {
      name: "Vikram",
      password: "tech123",
      role: "technician",
      category: "general"
    },
    "Meera": {
      name: "Meera",
      password: "tech123",
      role: "technician",
      category: "food"
    },
    "Suresh": {
      name: "Suresh",
      password: "tech123",
      role: "technician",
      category: "electrical"
    },
    "Ganesan": {
      name: "Ganesan",
      password: "tech123",
      role: "technician",
      category: "cleaning"
    }
  },

  notifications: [],

  technicians: {
    plumbing: "Ramesh",
    food: "Meera",
    electrical: "Suresh",
    general: "Vikram",
    cleaning: "Ganesan",
    other: "Vikram"
  }
};


// ==========================
// STATUS SYSTEM
// ==========================

const STATUS = {
  PENDING: "Pending",
  ASSIGNED: "Assigned",
  IN_PROGRESS: "In Progress",
  ESCALATED: "Escalated",
  RESOLVED: "Resolved"
};


// ==========================
// TIME
// ==========================

function now() {
  return new Date().toLocaleString();
}


// ==========================
// NOTIFICATIONS
// ==========================

function notify(to, message, complaintId = null) {
  state.notifications.push({
    to,
    message,
    complaintId,
    time: now()
  });
}

function getMyNotifications() {
  let user = state.session?.name;
  let role = state.session?.role;

  return state.notifications.filter(n =>
    n.to === user || n.to === role || n.to === "all"
  );
}


// ==========================
// AUTO TECH ASSIGNMENT
// ==========================

function assignTechnician(category) {
  return state.technicians[category.toLowerCase()] || state.technicians.other;
}


// ==========================
// TOGGLE LOGIN/SIGNUP
// ==========================

function toggleAuthMode() {
  let loginForm = document.getElementById("loginForm");
  let signupForm = document.getElementById("signupForm");
  let signupToggle = document.getElementById("signupToggle");

  if (loginForm.classList.contains("hidden")) {
    loginForm.classList.remove("hidden");
    signupForm.classList.add("hidden");
    signupToggle.textContent = "Don't have an account? Sign up";
  } else {
    loginForm.classList.add("hidden");
    signupForm.classList.remove("hidden");
    signupToggle.textContent = "Already have an account? Login";
  }
}


// ==========================
// STUDENT SIGNUP
// ==========================

function signupStudent() {
  let studentId = document.getElementById("signupStudentId").value.toUpperCase().trim();
  let name = document.getElementById("signupName").value.trim();
  let password = document.getElementById("signupPassword").value;
  let confirmPassword = document.getElementById("signupConfirmPassword").value;

  // Validation
  if (!studentId || !name || !password || !confirmPassword) {
    alert("All fields are required");
    return;
  }

  if (password !== confirmPassword) {
    alert("Passwords do not match");
    return;
  }

  if (password.length < 4) {
    alert("Password must be at least 4 characters");
    return;
  }

  if (state.accounts[studentId]) {
    alert("Student ID already exists");
    return;
  }

  // Create account
  state.accounts[studentId] = {
    name: name,
    password: password,
    role: "student"
  };

  alert("Account created successfully! You can now login.");
  toggleAuthMode();

  // Clear signup form
  document.getElementById("signupStudentId").value = "";
  document.getElementById("signupName").value = "";
  document.getElementById("signupPassword").value = "";
  document.getElementById("signupConfirmPassword").value = "";
}


// ==========================
// LOGIN
// ==========================

function login() {
  let role = document.getElementById("role").value;
  let user = document.getElementById("username").value;
  let pass = document.getElementById("password").value;

  if (role === "student") {
    let studentId = user.toUpperCase();
    let acc = state.accounts[studentId];

    if (!acc || acc.password !== pass) {
      alert("Invalid student login");
      return;
    }

    state.session = acc;
    showDashboard("student");
  }

  else if (role === "warden") {
    let wardenAcc = state.wardenAccounts[user];

    if (!wardenAcc || wardenAcc.password !== pass) {
      alert("Invalid warden login");
      return;
    }

    state.session = { role: "warden", name: "Warden" };
    showDashboard("warden");
  }

  else if (role === "technician") {
    let techAcc = state.techAccounts[user];

    if (!techAcc || techAcc.password !== pass) {
      alert("Invalid technician login");
      return;
    }

    state.session = { role: "technician", name: user };
    showDashboard("technician");
  }
}


// ==========================
// LOGOUT
// ==========================

function logout() {
  state.session = null;
  document.getElementById("loginBox").classList.remove("hidden");
  document.getElementById("studentDash").classList.add("hidden");
  document.getElementById("wardenDash").classList.add("hidden");
  document.getElementById("techDash").classList.add("hidden");
  document.getElementById("loginForm").classList.remove("hidden");
  document.getElementById("signupForm").classList.add("hidden");

  // Clear form
  document.getElementById("role").value = "student";
  document.getElementById("username").value = "";
  document.getElementById("password").value = "";
}


// ==========================
// DASHBOARD SWITCH
// ==========================

function showDashboard(role) {
  document.getElementById("loginBox").classList.add("hidden");
  document.getElementById("studentDash").classList.add("hidden");
  document.getElementById("wardenDash").classList.add("hidden");
  document.getElementById("techDash").classList.add("hidden");

  if (role === "student") {
    document.getElementById("studentDash").classList.remove("hidden");
    loadStudentUI();
  }

  if (role === "warden") {
    document.getElementById("wardenDash").classList.remove("hidden");
    loadWardenUI();
  }

  if (role === "technician") {
    document.getElementById("techDash").classList.remove("hidden");
    loadTechnicianUI();
  }
}


// ==========================
// NORMALIZER
// ==========================

function norm(s) {
  return s.toLowerCase().trim();
}


// ==========================
// ADD COMPLAINT
// ==========================

function add_complaint(data) {

  let existing = null;

  for (let c of state.complaints) {
    if (
      c.status !== STATUS.RESOLVED &&
      norm(c.category) === norm(data.category) &&
      norm(c.location) === norm(data.location) &&
      (norm(c.title).includes(norm(data.title)) ||
       norm(data.title).includes(norm(c.title)))
    ) {
      existing = c;
      break;
    }
  }

  // ======================
  // MERGE DUPLICATE
  // ======================
  if (existing) {
    let reporter = data.anonymous ? "Anonymous" : data.studentName;

    existing.reports++;
    existing.reporters = existing.reporters || [];
    existing.reporters.push(reporter);

    existing.log.push({
      at: now(),
      status: existing.status,
      note: "Merged report from " + reporter,
      by: reporter
    });

    notify(reporter, "Merged with existing complaint", existing.id);

    loadStudentUI();
    return;
  }

  // ======================
  // NEW COMPLAINT
  // ======================

  state.counter++;
  let cid = "C" + String(state.counter).padStart(3, "0");

  let assignedTech = assignTechnician(data.category);

  let complaint = {
    id: cid,
    title: data.title,
    description: data.description,
    category: data.category,
    location: data.location,

    status: data.urgent ? STATUS.ASSIGNED : STATUS.PENDING,
    assignedTo: assignedTech,

    reports: 1,
    reporter: data.anonymous ? "Anonymous" : data.studentName,
    urgent: data.urgent,

    log: [
      {
        at: now(),
        status: STATUS.PENDING,
        note: "Complaint submitted",
        by: data.anonymous ? "Anonymous" : data.studentName
      },
      {
        at: now(),
        status: STATUS.ASSIGNED,
        note: "Auto assigned to " + assignedTech,
        by: "System"
      }
    ]
  };

  state.complaints.push(complaint);

  notify(data.studentName, "Complaint submitted: " + cid, cid);
  notify(assignedTech, "New complaint assigned: " + cid, cid);

  loadStudentUI();
}


// ==========================
// SUBMIT WRAPPER
// ==========================

function submitComplaint() {
  add_complaint({
    title: document.getElementById("title").value,
    description: document.getElementById("desc").value,
    category: document.getElementById("category").value,
    location: document.getElementById("location").value,

    anonymous: document.getElementById("anonymous")?.checked || false,
    urgent: document.getElementById("urgent")?.checked || false,

    studentName: state.session.name
  });
}


// ==========================
// TECHNICIAN ACTIONS
// ==========================

function technicianUpdate(id, newStatus) {
  for (let c of state.complaints) {
    if (c.id === id && c.assignedTo === state.session.name) {

      c.status = newStatus;

      c.log.push({
        at: now(),
        status: newStatus,
        note: "Updated by technician",
        by: c.assignedTo
      });

      notify(c.reporter, "Status updated: " + newStatus, id);
      notify("warden", "Update on complaint " + id, id);
    }
  }

  loadTechnicianUI();
}


// ==========================
// WARDEN ACTIONS
// ==========================

function resolve(id) {
  for (let c of state.complaints) {
    if (c.id === id) {

      c.status = STATUS.RESOLVED;

      c.log.push({
        at: now(),
        status: STATUS.RESOLVED,
        note: "Resolved by warden",
        by: "Warden"
      });

      notify(c.reporter, "Resolved: " + id, id);
      notify(c.assignedTo, "Resolved: " + id, id);
    }
  }

  loadWardenUI();
}


function escalate(id) {
  for (let c of state.complaints) {
    if (c.id === id) {

      c.status = STATUS.ESCALATED;

      c.log.push({
        at: now(),
        status: STATUS.ESCALATED,
        note: "Escalated by warden",
        by: "Warden"
      });

      notify(c.assignedTo, "Complaint escalated: " + id, id);
      notify(c.reporter, "Complaint escalated", id);
    }
  }

  loadWardenUI();
}


// ==========================
// UI - STUDENT
// ==========================

function loadStudentUI() {
  let div = document.getElementById("studentComplaints");
  div.innerHTML = "";

  for (let c of state.complaints) {
    div.innerHTML += `
      <div class="card">
        <b>${c.id}</b> | ${c.title} | ${c.status}
      </div>
    `;
  }

  loadNotifications("studentNotifications");
}


// ==========================
// UI - TECHNICIAN
// ==========================

function loadTechnicianUI() {
  let div = document.getElementById("techComplaints");
  div.innerHTML = "";

  for (let c of state.complaints) {
    if (c.assignedTo === state.session.name) {
      div.innerHTML += `
        <div class="card">
          <b>${c.id}</b> | ${c.title} | ${c.status}

          <button onclick="technicianUpdate('${c.id}', '${STATUS.IN_PROGRESS}')">Start</button>
          <button onclick="technicianUpdate('${c.id}', '${STATUS.RESOLVED}')">Resolve</button>
          <button onclick="technicianUpdate('${c.id}', '${STATUS.ESCALATED}')">Escalate</button>
        </div>
      `;
    }
  }

  loadNotifications("techNotifications");
}


// ==========================
// UI - WARDEN + ANALYTICS
// ==========================

function loadWardenUI() {
  let div = document.getElementById("wardenComplaints");
  div.innerHTML = "";

  for (let c of state.complaints) {
    div.innerHTML += `
      <div class="card ${c.urgent ? "urgent" : ""}">
        <b>${c.id}</b> | ${c.title} | ${c.status}
        ${c.urgent ? "🔥 URGENT" : ""}

        <button onclick="resolve('${c.id}')">Resolve</button>
        <button onclick="escalate('${c.id}')">Escalate</button>
      </div>
    `;
  }

  loadAnalytics();
}


// ==========================
// NOTIFICATIONS UI
// ==========================

function loadNotifications(id) {
  let div = document.getElementById(id);
  if (!div) return;

  let notes = getMyNotifications();

  div.innerHTML = "";

  for (let n of notes) {
    div.innerHTML += `
      <div class="card">
        <small>${n.time}</small><br>
        ${n.message}
      </div>
    `;
  }
}


// ==========================
// ANALYTICS DASHBOARD
// ==========================

function loadAnalytics() {

  let total = state.complaints.length;
  let resolved = state.complaints.filter(c => c.status === STATUS.RESOLVED).length;
  let pending = state.complaints.filter(c => c.status === STATUS.PENDING).length;
  let inProgress = state.complaints.filter(c => c.status === STATUS.IN_PROGRESS).length;
  let escalated = state.complaints.filter(c => c.status === STATUS.ESCALATED).length;
  let urgent = state.complaints.filter(c => c.urgent).length;

  let categoryCount = {};
  for (let c of state.complaints) {
    categoryCount[c.category] = (categoryCount[c.category] || 0) + 1;
  }

  let top = Object.entries(categoryCount)
    .sort((a, b) => b[1] - a[1])[0];

  document.getElementById("analyticsBox").innerHTML = `
    <div class="card">
      <h3>📊 Analytics Dashboard</h3>

      <p>Total: ${total}</p>
      <p>Pending: ${pending}</p>
      <p>In Progress: ${inProgress}</p>
      <p>Escalated: ${escalated}</p>
      <p>Resolved: ${resolved}</p>
      <p>Urgent: ${urgent}</p>

      <hr>

      <p>🔥 Top Category:</p>
      <b>${top ? top[0] : "N/A"}</b>
    </div>
  `;
}
