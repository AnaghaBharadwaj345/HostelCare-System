// ==================================================
// HOSTELCARE - JAVASCRIPT SYSTEM
// ==================================================
// 🎯 PROJECT OBJECTIVE:
// To digitize hostel complaint handling using a structured
// workflow system that simulates real-world IT systems.
// ==================================================

// ==================================================
// CENTRALIZED STATE (SIMULATED DATABASE)
// ==================================================

const state = {
    complaints: [],
    counter: 0,
    session: null,
    accounts: {},
    profiles: {},
    seen: {},
    wardenPasswords: {
        "warden": "admin123"
    },
    techPasswords: {}
};

// ==================================================
// SYSTEM CONSTANTS
// ==================================================

const CATEGORIES = [
    "Food",
    "Plumbing",
    "Electrical",
    "Cleaning",
    "Wi-Fi",
    "Furniture",
    "Security",
    "Other"
];

const TECHNICIANS = [
    "Ramesh (Plumber)",
    "Suresh (Electrician)",
    "Anil (Cleaning)",
    "Vikram (General)",
    "Meera (Food Services)"
];

const CATEGORY_TECHNICIAN = {
    "Plumbing": "Ramesh (Plumber)",
    "Electrical": "Suresh (Electrician)",
    "Cleaning": "Anil (Cleaning)",
    "Food": "Meera (Food Services)",
    "Wi-Fi": "Vikram (General)",
    "Furniture": "Vikram (General)",
    "Security": "Vikram (General)",
    "Other": "Vikram (General)"
};

// ==================================================
// HELPER FUNCTIONS
// ==================================================

function now() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
}

// ==================================================
// STUDENT REGISTRATION MODULE
// ==================================================

function registerStudent() {
    const usn = document.getElementById('studentUSN').value.toUpperCase().trim();
    const name = document.getElementById('studentName').value.trim();
    const password = document.getElementById('studentPassword').value;

    if (!usn || !name || !password) {
        alert('Please fill all fields');
        return;
    }

    if (usn in state.accounts) {
        alert('USN already registered');
        return;
    }

    state.accounts[usn] = {
        name: name,
        password: password
    };

    alert('Student registered successfully');
    document.getElementById('studentUSN').value = '';
    document.getElementById('studentName').value = '';
    document.getElementById('studentPassword').value = '';
}

// ==================================================
// STUDENT LOGIN MODULE
// ==================================================

function loginStudentBtn() {
    const usn = document.getElementById('studentUSN').value.toUpperCase().trim();
    const password = document.getElementById('studentPassword').value;

    if (!usn || !password) {
        alert('Please enter USN and password');
        return;
    }

    const acc = state.accounts[usn];

    if (!acc) {
        alert('USN not registered');
        return;
    }

    if (acc.password !== password) {
        alert('Incorrect password');
        return;
    }

    state.session = {
        role: 'student',
        name: acc.name,
        usn: usn
    };

    updateUI();
    alert('Student login successful');
}

// ==================================================
// WARDEN LOGIN MODULE
// ==================================================

function loginWardenBtn() {
    const user = document.getElementById('wardenUser').value || 'warden';
    const password = document.getElementById('wardenPassword').value;

    if (!password) {
        alert('Please enter password');
        return;
    }

    const stored = state.wardenPasswords[user];

    if (stored !== password) {
        alert('Wrong password');
        return;
    }

    state.session = {
        role: 'warden',
        name: 'Warden'
    };

    updateUI();
    alert('Warden login successful');
}

// ==================================================
// TECHNICIAN LOGIN MODULE
// ==================================================

function loginTechnicianBtn() {
    const name = document.getElementById('techName').value.trim();
    const password = document.getElementById('techPassword').value;

    if (!name || !password) {
        alert('Please enter name and password');
        return;
    }

    const stored = state.techPasswords[name] || 'tech123';

    if (stored !== password) {
        alert('Wrong password');
        return;
    }

    state.session = {
        role: 'technician',
        name: name
    };

    updateUI();
    alert('Technician login successful');
}

// ==================================================
// COMPLAINT CREATION MODULE (CORE ENGINE)
// ==================================================

function addComplaint(data) {
    function norm(s) {
        return s.toLowerCase().trim();
    }

    // Duplicate detection
    let existing = null;

    for (let c of state.complaints) {
        if (
            c.status !== "Resolved" &&
            norm(c.category) === norm(data.category) &&
            norm(c.location) === norm(data.location) &&
            (norm(c.title).includes(norm(data.title)) ||
             norm(data.title).includes(norm(c.title)))
        ) {
            existing = c;
            break;
        }
    }

    // Merge logic
    if (existing) {
        const reporter = data.anonymous ? "Anonymous" : data.studentName;
        existing.reports += 1;
        existing.reporters.push(reporter);

        if (data.urgent) {
            existing.urgent = true;
        }

        existing.log.push({
            at: now(),
            status: existing.status,
            note: `New report merged from ${reporter}`,
            by: reporter
        });

        alert('Merged into existing complaint');
        return existing;
    }

    // New complaint creation
    state.counter += 1;
    const cid = "C" + String(state.counter).padStart(3, '0');
    const reporter = data.anonymous ? "Anonymous" : data.studentName;
    const tech = CATEGORY_TECHNICIAN[data.category] || "Vikram (General)";

    const complaint = {
        id: cid,
        title: data.title,
        description: data.description,
        category: data.category,
        location: data.location,
        urgent: data.urgent,
        anonymous: data.anonymous,
        studentName: reporter,
        status: "Assigned",
        assignedTo: tech,
        reports: 1,
        reporters: [reporter],
        createdAt: now(),
        repairNotes: [],
        log: [
            {
                at: now(),
                status: "Submitted",
                note: `Complaint filed by ${reporter}`,
                by: reporter
            },
            {
                at: now(),
                status: "Assigned",
                note: `Assigned to ${tech}`,
                by: "System"
            }
        ]
    };

    state.complaints.push(complaint);
    alert('Complaint added successfully');
    return complaint;
}

// ==================================================
// STATUS UPDATE MODULE
// ==================================================

function updateStatus(cid, status, note = null, by = "Warden") {
    for (let c of state.complaints) {
        if (c.id === cid) {
            c.status = status;
            c.log.push({
                at: now(),
                status: status,
                note: note || `Status changed to ${status}`,
                by: by
            });
            alert('Status updated');
            return;
        }
    }
}

// ==================================================
// TECHNICIAN ASSIGNMENT MODULE
// ==================================================

function assignComplaint(cid, technician) {
    for (let c of state.complaints) {
        if (c.id === cid) {
            c.assignedTo = technician;
            c.log.push({
                at: now(),
                status: c.status,
                note: `Assigned to ${technician}`,
                by: "Warden"
            });
            alert('Technician assigned');
            return;
        }
    }
}

// ==================================================
// REPAIR NOTE MODULE
// ==================================================

function addRepairNote(cid, by, note) {
    for (let c of state.complaints) {
        if (c.id === cid) {
            c.repairNotes.push({
                at: now(),
                by: by,
                note: note
            });
            c.log.push({
                at: now(),
                status: c.status,
                note: `Repair note: ${note}`,
                by: by
            });
            alert('Repair note added');
            return;
        }
    }
}

// ==================================================
// NOTIFICATION SYSTEM
// ==================================================

function unseenCount(name, complaint) {
    const last = state.seen[name]?.[complaint.id] || 0;
    return complaint.log.length - last;
}

function markSeen(name, complaint_id, log_len) {
    if (!state.seen[name]) {
        state.seen[name] = {};
    }
    state.seen[name][complaint_id] = log_len;
}

// ==================================================
// TECHNICIAN DASHBOARD
// ==================================================

function technicianDashboard(name) {
    const complaints = state.complaints.filter(c => c.assignedTo === name);
    return complaints;
}

// ==================================================
// ANALYTICS MODULE
// ==================================================

function analytics() {
    return {
        total: state.complaints.length,
        resolved: state.complaints.filter(c => c.status === "Resolved").length,
        urgent: state.complaints.filter(c => c.urgent).length
    };
}

// ==================================================
// UI FUNCTIONS
// ==================================================

function switchLoginTab(tab) {
    // Hide all login forms
    document.getElementById('studentLogin').classList.remove('active');
    document.getElementById('wardenLogin').classList.remove('active');
    document.getElementById('technicianLogin').classList.remove('active');

    // Remove active class from all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));

    // Show selected form and highlight button
    if (tab === 'student') {
        document.getElementById('studentLogin').classList.add('active');
        document.querySelectorAll('.tab-btn')[0].classList.add('active');
    } else if (tab === 'warden') {
        document.getElementById('wardenLogin').classList.add('active');
        document.querySelectorAll('.tab-btn')[1].classList.add('active');
    } else if (tab === 'technician') {
        document.getElementById('technicianLogin').classList.add('active');
        document.querySelectorAll('.tab-btn')[2].classList.add('active');
    }
}

function updateUI() {
    const session = state.session;

    if (!session) {
        // Hide all dashboards, show login
        document.getElementById('loginSection').classList.add('active');
        document.getElementById('studentDashboard').classList.remove('active');
        document.getElementById('wardenDashboard').classList.remove('active');
        document.getElementById('technicianDashboard').classList.remove('active');
        document.getElementById('userDisplay').textContent = 'Not Logged In';
        document.getElementById('logoutBtn').style.display = 'none';
        return;
    }

    document.getElementById('loginSection').classList.remove('active');
    document.getElementById('logoutBtn').style.display = 'inline-block';
    document.getElementById('userDisplay').textContent = `${session.name} (${session.role})`;

    if (session.role === 'student') {
        document.getElementById('studentDashboard').classList.add('active');
        document.getElementById('wardenDashboard').classList.remove('active');
        document.getElementById('technicianDashboard').classList.remove('active');
        loadStudentDashboard();
    } else if (session.role === 'warden') {
        document.getElementById('studentDashboard').classList.remove('active');
        document.getElementById('wardenDashboard').classList.add('active');
        document.getElementById('technicianDashboard').classList.remove('active');
        loadWardenDashboard();
    } else if (session.role === 'technician') {
        document.getElementById('studentDashboard').classList.remove('active');
        document.getElementById('wardenDashboard').classList.remove('active');
        document.getElementById('technicianDashboard').classList.add('active');
        loadTechnicianDashboard();
    }
}

function loadStudentDashboard() {
    const container = document.getElementById('myComplaintsContainer');
    const complaints = state.complaints.filter(c => c.studentName === state.session.name || c.reporters.includes(state.session.name));

    if (complaints.length === 0) {
        container.innerHTML = '<div class="empty-message">No complaints filed yet</div>';
        return;
    }

    container.innerHTML = complaints.map(c => `
        <div class="complaint-card" onclick="viewComplaintDetails('${c.id}')">
            <h4>${c.id} - ${c.title}</h4>
            <div class="complaint-meta">
                <span><strong>Category:</strong> ${c.category}</span>
                <span><strong>Location:</strong> ${c.location}</span>
                <span><strong>Status:</strong> ${c.status}</span>
                ${c.urgent ? `<span class="complaint-badge badge-urgent">⚠️ URGENT</span>` : ''}
            </div>
            <p>${c.description}</p>
            <small>Created: ${c.createdAt} | Reports: ${c.reports}</small>
        </div>
    `).join('');
}

function loadWardenDashboard() {
    // Update stats
    const stats = analytics();
    document.getElementById('totalComplaintsCount').textContent = stats.total;
    document.getElementById('resolvedComplaintsCount').textContent = stats.resolved;
    document.getElementById('urgentComplaintsCount').textContent = stats.urgent;

    // Load all complaints
    const container = document.getElementById('allComplaintsContainer');
    if (state.complaints.length === 0) {
        container.innerHTML = '<div class="empty-message">No complaints yet</div>';
        return;
    }

    container.innerHTML = state.complaints.map(c => `
        <div class="complaint-card" onclick="viewComplaintDetails('${c.id}')">
            <h4>${c.id} - ${c.title}</h4>
            <div class="complaint-meta">
                <span><strong>Category:</strong> ${c.category}</span>
                <span><strong>Location:</strong> ${c.location}</span>
                <span><strong>Status:</strong> ${c.status}</span>
                <span><strong>Assigned to:</strong> ${c.assignedTo}</span>
                ${c.urgent ? `<span class="complaint-badge badge-urgent">⚠️ URGENT</span>` : ''}
            </div>
            <small>Filed by: ${c.studentName} | Reports: ${c.reports}</small>
        </div>
    `).join('');
}

function loadTechnicianDashboard() {
    const complaints = technicianDashboard(state.session.name);
    const container = document.getElementById('techComplaints');

    if (complaints.length === 0) {
        container.innerHTML = '<div class="empty-message">No complaints assigned to you</div>';
        return;
    }

    container.innerHTML = complaints.map(c => `
        <div class="complaint-card" onclick="viewComplaintDetails('${c.id}')">
            <h4>${c.id} - ${c.title}</h4>
            <div class="complaint-meta">
                <span><strong>Category:</strong> ${c.category}</span>
                <span><strong>Location:</strong> ${c.location}</span>
                <span><strong>Status:</strong> ${c.status}</span>
                ${c.urgent ? `<span class="complaint-badge badge-urgent">⚠️ URGENT</span>` : ''}
            </div>
            <small>Filed by: ${c.studentName}</small>
        </div>
    `).join('');
}

function showComplaintForm() {
    document.getElementById('complaintForm').style.display = 'block';
}

function hideComplaintForm() {
    document.getElementById('complaintForm').style.display = 'none';
    document.getElementById('complaintTitle').value = '';
    document.getElementById('complaintDescription').value = '';
    document.getElementById('complaintCategory').value = '';
    document.getElementById('complaintLocation').value = '';
    document.getElementById('complaintUrgent').checked = false;
    document.getElementById('complaintAnonymous').checked = false;
}

function submitComplaint() {
    const title = document.getElementById('complaintTitle').value.trim();
    const description = document.getElementById('complaintDescription').value.trim();
    const category = document.getElementById('complaintCategory').value;
    const location = document.getElementById('complaintLocation').value.trim();
    const urgent = document.getElementById('complaintUrgent').checked;
    const anonymous = document.getElementById('complaintAnonymous').checked;

    if (!title || !description || !category || !location) {
        alert('Please fill all fields');
        return;
    }

    addComplaint({
        title,
        description,
        category,
        location,
        urgent,
        anonymous,
        studentName: state.session.name
    });

    hideComplaintForm();
    loadStudentDashboard();
}

function viewComplaintDetails(cid) {
    const complaint = state.complaints.find(c => c.id === cid);
    if (!complaint) return;

    const modal = document.getElementById('complaintModal');
    const detailsDiv = document.getElementById('modalComplaintDetails');
    const actionsDiv = document.getElementById('modalComplaintActions');

    // Build details HTML
    let detailsHTML = `
        <div class="complaint-details">
            <h3>${complaint.id} - ${complaint.title}</h3>
            <div class="detail-row">
                <label>Category:</label>
                <span>${complaint.category}</span>
            </div>
            <div class="detail-row">
                <label>Location:</label>
                <span>${complaint.location}</span>
            </div>
            <div class="detail-row">
                <label>Status:</label>
                <span>${complaint.status}</span>
            </div>
            <div class="detail-row">
                <label>Assigned To:</label>
                <span>${complaint.assignedTo}</span>
            </div>
            <div class="detail-row">
                <label>Urgent:</label>
                <span>${complaint.urgent ? '⚠️ Yes' : 'No'}</span>
            </div>
            <div class="detail-row">
                <label>Filed By:</label>
                <span>${complaint.studentName}</span>
            </div>
            <div class="detail-row">
                <label>Reports:</label>
                <span>${complaint.reports}</span>
            </div>
            <div class="detail-row">
                <label>Created:</label>
                <span>${complaint.createdAt}</span>
            </div>
            <div class="detail-row">
                <label>Description:</label>
                <span>${complaint.description}</span>
            </div>
        </div>
    `;

    // Add repair notes if any
    if (complaint.repairNotes.length > 0) {
        detailsHTML += '<div class="repair-notes-section"><h4>Repair Notes</h4>';
        complaint.repairNotes.forEach(note => {
            detailsHTML += `
                <div class="history-item">
                    <div class="history-time">${note.at}</div>
                    <div class="history-status">By: ${note.by}</div>
                    <div class="history-note">${note.note}</div>
                </div>
            `;
        });
        detailsHTML += '</div>';
    }

    // Add history
    detailsHTML += '<div class="repair-notes-section"><h4>History</h4>';
    complaint.log.forEach(entry => {
        detailsHTML += `
            <div class="history-item">
                <div class="history-time">${entry.at}</div>
                <div class="history-status">${entry.status}</div>
                <div class="history-note">${entry.note} (by ${entry.by})</div>
            </div>
        `;
    });
    detailsHTML += '</div>';

    detailsDiv.innerHTML = detailsHTML;

    // Build actions HTML based on user role
    let actionsHTML = '<div class="modal-actions">';

    if (state.session.role === 'warden') {
        actionsHTML += `
            <select id="statusSelect" style="padding: 0.75rem; border-radius: 5px; border: 2px solid #f0f0f0;">
                <option value="">Change Status</option>
                <option value="Assigned">Assigned</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Pending">Pending</option>
            </select>
            <button onclick="changeComplaintStatus('${cid}')">Update Status</button>
            <select id="technicianSelect" style="padding: 0.75rem; border-radius: 5px; border: 2px solid #f0f0f0;">
                <option value="">Reassign Technician</option>
                ${TECHNICIANS.map(t => `<option value="${t}">${t}</option>`).join('')}
            </select>
            <button onclick="changeAssignedTechnician('${cid}')">Reassign</button>
        `;
    } else if (state.session.role === 'technician') {
        actionsHTML += `
            <textarea id="repairNoteText" placeholder="Add repair note" style="padding: 0.75rem; border-radius: 5px; border: 2px solid #f0f0f0; min-height: 80px;"></textarea>
            <button onclick="submitRepairNote('${cid}')">Add Repair Note</button>
            <select id="statusSelect" style="padding: 0.75rem; border-radius: 5px; border: 2px solid #f0f0f0;">
                <option value="">Change Status</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
            </select>
            <button onclick="changeComplaintStatus('${cid}')">Update Status</button>
        `;
    }

    actionsHTML += '</div>';
    actionsDiv.innerHTML = actionsHTML;

    markSeen(state.session.name, complaint.id, complaint.log.length);
    modal.classList.add('show');
}

function changeComplaintStatus(cid) {
    const newStatus = document.getElementById('statusSelect').value;
    if (!newStatus) {
        alert('Please select a status');
        return;
    }
    updateStatus(cid, newStatus, null, state.session.name);
    viewComplaintDetails(cid);
    if (state.session.role === 'warden') {
        loadWardenDashboard();
    } else if (state.session.role === 'technician') {
        loadTechnicianDashboard();
    }
}

function changeAssignedTechnician(cid) {
    const technician = document.getElementById('technicianSelect').value;
    if (!technician) {
        alert('Please select a technician');
        return;
    }
    assignComplaint(cid, technician);
    viewComplaintDetails(cid);
    loadWardenDashboard();
}

function submitRepairNote(cid) {
    const note = document.getElementById('repairNoteText').value.trim();
    if (!note) {
        alert('Please enter a repair note');
        return;
    }
    addRepairNote(cid, state.session.name, note);
    document.getElementById('repairNoteText').value = '';
    viewComplaintDetails(cid);
    loadTechnicianDashboard();
}

function closeComplaintModal() {
    document.getElementById('complaintModal').classList.remove('show');
}

function logout() {
    state.session = null;
    updateUI();
    alert('Logged out successfully');
}

// Event listeners
document.getElementById('logoutBtn').addEventListener('click', logout);

// Initialize
updateUI();