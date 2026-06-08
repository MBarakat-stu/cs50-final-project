
let loggedInUser = null;
let allReservations = [];


function customConfirm(message) {
    return new Promise((resolve) => {
        const modal = document.getElementById('confirmModal');
        const msgSpan = document.getElementById('confirmMessage');
        msgSpan.innerText = message;
        modal.style.display = 'flex';
        const yesBtn = document.getElementById('confirmYes');
        const noBtn = document.getElementById('confirmNo');
        const handleYes = () => { modal.style.display = 'none'; cleanup(); resolve(true); };
        const handleNo = () => { modal.style.display = 'none'; cleanup(); resolve(false); };
        const cleanup = () => {
            yesBtn.removeEventListener('click', handleYes);
            noBtn.removeEventListener('click', handleNo);
        };
        yesBtn.addEventListener('click', handleYes);
        noBtn.addEventListener('click', handleNo);
    });
}


let currentPageId = '';
function showPage(pageId, contentGenerator) {
    currentPageId = pageId;
    const container = document.getElementById('pageContent');
    container.innerHTML = `<div class="page-card" id="${pageId}"></div>`;
    contentGenerator();
}

async function fetchWithAuth(url, options = {}) {
    const headers = options.headers || {};
    if (loggedInUser) headers['X-User-ID'] = loggedInUser.userID;
    return fetch(url, { ...options, headers });
}

function updateNavbar() {
    const isLoggedIn = !!loggedInUser;
    document.getElementById('navLoginBtn').style.display = isLoggedIn ? 'none' : 'inline-block';
    document.getElementById('navRegisterBtn').style.display = isLoggedIn ? 'none' : 'inline-block';
    document.getElementById('navManageBuildingsBtn').style.display = isLoggedIn ? 'inline-block' : 'none';
    document.getElementById('navReservationsBtn').style.display = isLoggedIn ? 'inline-block' : 'none';
    document.getElementById('navUsersBtn').style.display = isLoggedIn ? 'inline-block' : 'none';
    document.getElementById('navPersonsBtn').style.display = isLoggedIn ? 'inline-block' : 'none';
    document.getElementById('navLogoutBtn').style.display = isLoggedIn ? 'inline-block' : 'none';
    document.getElementById('userInfo').innerHTML = isLoggedIn ? `${loggedInUser.username}` : '';
    if (!isLoggedIn) {
        showPage('loginPage', renderLoginPage);
    } else {
        showPage('dashboardPage', renderDashboard);
    }
}


async function renderDashboard() {
    const container = document.getElementById('dashboardPage');
    if (!container) return;
    const [buildingsRes, apartmentsRes, reservationsRes, usersRes, personsRes] = await Promise.all([
        fetch('/api/buildings/'),
        fetchWithAuth('/api/manage_apartments/'),
        fetchWithAuth('/api/list_all_reservations/'),
        fetchWithAuth('/api/listusers/'),
        fetchWithAuth('/api/listpersons/')
    ]);
    const buildings = await buildingsRes.json();
    const apartments = await apartmentsRes.json();
    const reservations = await reservationsRes.json();
    const users = await usersRes.json();
    const persons = await personsRes.json();
    container.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px,1fr)); gap: 1rem;">
            <div class="stat-card">Buildings: ${buildings.length}</div>
            <div class="stat-card">Apartments: ${apartments.length}</div>
            <div class="stat-card">Reservations: ${reservations.length}</div>
            <div class="stat-card">Users: ${users.length}</div>
            <div class="stat-card">Persons: ${persons.length}</div>
        </div>
        <hr>
        <p>Welcome to the Real Estate Management System.</p>
    `;
}


function renderLoginPage() {
    const container = document.getElementById('loginPage');
    container.innerHTML = `
        <h2 style="text-align:center;">Login</h2>
        <div class="auth-form">
            <div class="form-group"><label>Username or Email</label><input type="text" id="loginUsernameEmail"></div>
            <div class="form-group"><label>Password</label><input type="password" id="loginPassword"></div>
            <button id="loginSubmitBtn" class="btn-primary" style="width:100%;">Login</button>
            <div id="loginMessage"></div>
            <p style="text-align:center;">Don't have an account? <button id="gotoRegisterFromLogin" class="btn-secondary">Register</button></p>
        </div>
    `;
    
    container.classList.add('auth-card');

    document.getElementById('loginSubmitBtn').onclick = async () => {
        const ue = document.getElementById('loginUsernameEmail').value;
        const pwd = document.getElementById('loginPassword').value;
        const res = await fetch('/api/login/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username_or_email: ue, password: pwd }) });
        const data = await res.json();
        if (res.ok) {
            loggedInUser = data;
            sessionStorage.setItem('loggedInUser', JSON.stringify(data));
            updateNavbar();
        } else {
            document.getElementById('loginMessage').innerHTML = `<span class="error">${data.error}</span>`;
        }
    };
    document.getElementById('gotoRegisterFromLogin').onclick = () => showPage('registerPage', renderRegisterPage);
}


function renderRegisterPage() {
    const container = document.getElementById('registerPage');
    container.innerHTML = `
        <h2 style="text-align:center;">Register</h2>
        <div class="auth-form">
            <div class="form-group"><label>Username</label><input type="text" id="regUsername"></div>
            <div class="form-group"><label>Email</label><input type="email" id="regEmail"></div>
            <div class="form-group"><label>Password</label><input type="password" id="regPassword"></div>
            <button id="registerSubmitBtn" class="btn-primary" style="width:100%;">Register</button>
            <div id="registerMessage"></div>
            <p style="text-align:center;">Already have an account? <button id="gotoLoginFromRegister" class="btn-secondary">Login</button></p>
        </div>
    `;
    
    container.classList.add('auth-card');

    document.getElementById('registerSubmitBtn').onclick = async () => {
        const username = document.getElementById('regUsername').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;
        const res = await fetch('/api/register/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password, email }) });
        const data = await res.json();
        if (res.ok) {
            document.getElementById('registerMessage').innerHTML = `<span class="success">${data.message}</span>`;
            setTimeout(() => showPage('loginPage', renderLoginPage), 2000);
        } else {
            document.getElementById('registerMessage').innerHTML = `<span class="error">${data.error}</span>`;
        }
    };
    document.getElementById('gotoLoginFromRegister').onclick = () => showPage('loginPage', renderLoginPage);
}


function renderBuildingsPage() {
    const container = document.getElementById('buildingsPage');
    if (!container) return;
    container.innerHTML = `
        <h2>Manage Buildings</h2>
        <div class="inline-form">
            <input type="text" id="newBuildingName" placeholder="Name">
            <input type="text" id="newBuildingAddress" placeholder="Address">
            <input type="file" id="newBuildingPicture" accept="image/*">
            <button id="addBuildingBtn" class="btn-success">Add Building</button>
            <div id="addBuildingMessage" style="flex-basis:100%;"></div>
        </div>
        <div id="buildingsContainer"></div>
    `;
    document.getElementById('addBuildingBtn').onclick = async () => {
        const fd = new FormData();
        fd.append('name', document.getElementById('newBuildingName').value);
        fd.append('address', document.getElementById('newBuildingAddress').value);
        const pic = document.getElementById('newBuildingPicture').files[0];
        if (pic) fd.append('picture', pic);
        const res = await fetchWithAuth('/api/manage_buildings/', { method: 'POST', body: fd });
        const data = await res.json();
        if (res.ok) {
            loadBuildingsList();
            document.getElementById('addBuildingMessage').innerHTML = `<span class="success">${data.message}</span>`;
        } else {
            document.getElementById('addBuildingMessage').innerHTML = `<span class="error">${data.error}</span>`;
        }
    };
    loadBuildingsList();
}

async function loadBuildingsList() {
    const res = await fetchWithAuth('/api/manage_buildings/');
    const buildings = await res.json();
    const container = document.getElementById('buildingsContainer');
    if (!buildings.length) {
        container.innerHTML = '<p>No buildings yet.</p>';
        return;
    }

    let html = `<table class="data-table" id="buildingsTable">
        <thead><tr><th>Picture</th><th>Name</th><th>Address</th><th>Actions</th></tr></thead><tbody>`;

    buildings.forEach(b => {
        html += `
            <tr class="building-row" data-building-id="${b.buildingID}">
                <td data-label="Picture" class="building-pic-cell">
                    ${b.picture ? `<img src="${b.picture}" class="building-pic-thumb" onerror="this.style.display='none'">` : 'No image'}
                </td>
                <td data-label="Name">${b.name}</td>
                <td data-label="Address">${b.address}</td>
                <td data-label="Actions">
                    <button class="edit-building-btn btn-secondary" data-id="${b.buildingID}">Edit</button>
                    <button class="delete-building-btn btn-danger" data-id="${b.buildingID}">Delete</button>
                    <button class="toggle-apartments-btn btn-primary" data-id="${b.buildingID}">Show Apartments</button>
                </td>
            </tr>
            <tr class="apartment-row" id="apartments-${b.buildingID}" style="display:none;">
                <td colspan="4">
                    <div class="apartment-content" id="apartment-content-${b.buildingID}"></div>
                </td>
            </tr>`;
    });
    html += `</tbody></table>`;
    container.innerHTML = html;

    
    document.querySelectorAll('.edit-building-btn').forEach(btn => btn.onclick = () => editBuildingInline(btn.dataset.id));
    document.querySelectorAll('.delete-building-btn').forEach(btn => btn.onclick = async () => {
        if (await customConfirm('Delete this building and all apartments?')) deleteBuilding(btn.dataset.id);
    });
    document.querySelectorAll('.toggle-apartments-btn').forEach(btn => {
        const buildingId = btn.dataset.id;
        btn.onclick = () => toggleApartments(buildingId);
    });
}

async function toggleApartments(buildingId) {
    const aptRow = document.getElementById(`apartments-${buildingId}`);
    const contentDiv = document.getElementById(`apartment-content-${buildingId}`);
    if (aptRow.style.display === 'none') {
        aptRow.style.display = '';
        if (contentDiv.innerHTML === '') {
            await loadApartmentsForBuilding(buildingId);
        }
    } else {
        aptRow.style.display = 'none';
    }
}

async function loadApartmentsForBuilding(buildingId) {
    const res = await fetchWithAuth(`/api/manage_apartments/?buildingID=${buildingId}`);
    const apartments = await res.json();
    const container = document.getElementById(`apartment-content-${buildingId}`);
    container.innerHTML = '';

    
    let formHtml = `
        <div class="inline-form" style="margin-bottom:1rem;">
            <input type="number" id="apt-number-${buildingId}" placeholder="Number" required>
            <input type="number" id="apt-floor-${buildingId}" placeholder="Floor" required>
            <input type="number" id="apt-rooms-${buildingId}" placeholder="Rooms" required>
            <input type="number" id="apt-kitchen-${buildingId}" placeholder="Kitchen">
            <input type="number" id="apt-bathroom-${buildingId}" placeholder="Bathroom">
            <input type="number" id="apt-livingroom-${buildingId}" placeholder="Livingroom">
            <button id="add-apt-btn-${buildingId}" class="btn-success">Add Apartment</button>
            <div id="apt-message-${buildingId}" style="flex-basis:100%;"></div>
        </div>`;
    container.innerHTML = formHtml;

    if (apartments.length) {
        let tableHtml = `<table class="data-table">
            <thead><tr><th>Number</th><th>Floor</th><th>Rooms</th><th>Kitchen</th><th>Bathroom</th><th>Livingroom</th><th>Status</th><th>Reserved by</th><th>Actions</th></tr></thead><tbody>`;
        apartments.forEach(apt => {
            tableHtml += `
                <tr>
                    <td data-label="Number">${apt.number}</td>
                    <td data-label="Floor">${apt.floor}</td>
                    <td data-label="Rooms">${apt.rooms}</td>
                    <td data-label="Kitchen">${apt.kitchen}</td>
                    <td data-label="Bathroom">${apt.bathroom}</td>
                    <td data-label="Livingroom">${apt.livingroom}</td>
                    <td data-label="Status">${apt.roomstatus === 1 ? 'Reservable' : (apt.roomstatus === 2 ? 'Reserved' : 'Maintenance')}</td>
                    <td data-label="Reserved by">${apt.personName || '-'}</td>
                    <td data-label="Actions">
                        <button class="edit-apt-btn btn-secondary" data-id="${apt.apartmentID}">Edit</button>
                        <button class="delete-apt-btn btn-danger" data-id="${apt.apartmentID}">Delete</button>
                        ${apt.roomstatus === 3 ? `<button class="make-reservable-btn btn-warning" data-id="${apt.apartmentID}">Make Reservable</button>` : (apt.roomstatus === 1 ? `<button class="reserve-apt-btn btn-primary" data-id="${apt.apartmentID}">Reserve</button>` : '')}
                    </td>
                </tr>`;
        });
        tableHtml += `</tbody></table>`;
        container.innerHTML += tableHtml;

        
        document.querySelectorAll(`#apartment-content-${buildingId} .edit-apt-btn`).forEach(btn => btn.onclick = () => editApartmentInline(btn.dataset.id, buildingId));
        document.querySelectorAll(`#apartment-content-${buildingId} .delete-apt-btn`).forEach(btn => btn.onclick = async () => {
            if (await customConfirm('Delete apartment?')) deleteApartment(btn.dataset.id, buildingId);
        });
        document.querySelectorAll(`#apartment-content-${buildingId} .make-reservable-btn`).forEach(btn => btn.onclick = async () => {
            if (await customConfirm('Make this apartment reservable?')) {
                const r = await fetchWithAuth('/api/make_apartment_reservable/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ apartmentID: btn.dataset.id }) });
                const data = await r.json();
                if (r.ok) loadApartmentsForBuilding(buildingId);
                else alert(data.error);
            }
        });
        document.querySelectorAll(`#apartment-content-${buildingId} .reserve-apt-btn`).forEach(btn => btn.onclick = () => openReserveModal(btn.dataset.id, buildingId));
    } else {
        container.innerHTML += '<p>No apartments in this building.</p>';
    }

   
    document.getElementById(`add-apt-btn-${buildingId}`).onclick = async () => {
        const data = {
            buildingID: buildingId,
            number: document.getElementById(`apt-number-${buildingId}`).value,
            floor: document.getElementById(`apt-floor-${buildingId}`).value,
            rooms: document.getElementById(`apt-rooms-${buildingId}`).value,
            kitchen: document.getElementById(`apt-kitchen-${buildingId}`).value || 0,
            bathroom: document.getElementById(`apt-bathroom-${buildingId}`).value || 0,
            livingroom: document.getElementById(`apt-livingroom-${buildingId}`).value || 0
        };
        const res = await fetchWithAuth('/api/manage_apartments/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        const result = await res.json();
        if (res.ok) loadApartmentsForBuilding(buildingId);
        else document.getElementById(`apt-message-${buildingId}`).innerHTML = `<span class="error">${result.error}</span>`;
    };
}

async function editBuildingInline(id) {
    const newName = prompt('New name:');
    if (!newName) return;
    const newAddress = prompt('New address:');
    if (!newAddress) return;
    const res = await fetchWithAuth('/api/manage_buildings/', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ buildingID: id, name: newName, address: newAddress }) });
    const data = await res.json();
    if (res.ok) loadBuildingsList();
    else alert(data.error);
}

async function deleteBuilding(id) {
    const res = await fetchWithAuth(`/api/manage_buildings/?buildingID=${id}`, { method: 'DELETE' });
    if (res.ok) loadBuildingsList();
    else alert((await res.json()).error);
}

async function editApartmentInline(id, buildingId) {
    const newNumber = prompt('New number:');
    if (!newNumber) return;
    const data = {
        apartmentID: id,
        number: newNumber,
        floor: prompt('Floor:'),
        rooms: prompt('Rooms:'),
        kitchen: prompt('Kitchen:'),
        bathroom: prompt('Bathroom:'),
        livingroom: prompt('Livingroom:')
    };
    const res = await fetchWithAuth('/api/manage_apartments/', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (res.ok) loadApartmentsForBuilding(buildingId);
    else alert((await res.json()).error);
}

async function deleteApartment(id, buildingId) {
    const res = await fetchWithAuth(`/api/manage_apartments/?apartmentID=${id}`, { method: 'DELETE' });
    if (res.ok) loadApartmentsForBuilding(buildingId);
    else alert((await res.json()).error);
}

function openReserveModal(apartmentId, buildingId) {
    (async () => {
        const identifier = prompt('Enter person email, phone, or national ID:');
        if (!identifier) return;
        const start = prompt('Start date (YYYY-MM-DD):');
        if (!start) return;
        const end = prompt('End date (YYYY-MM-DD):');
        if (!end) return;
        const res = await fetchWithAuth('/api/reserve_apartment_management/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ apartmentID: apartmentId, personIdentifier: identifier, startdate: start, finaldate: end })
        });
        const data = await res.json();
        if (res.ok) {
            alert(data.message);
            loadApartmentsForBuilding(buildingId);
        } else alert(data.error);
    })();
}


async function renderReservationsPage() {
    const container = document.getElementById('reservationsPage');
    container.innerHTML = `
        <h2>All Reservations</h2>
        <div class="inline-form">
            <input type="text" id="searchReservationInput" placeholder="Search by email, phone, national ID">
            <button id="searchReservationBtn" class="btn-primary">Search</button>
            <button id="refreshReservationsBtn" class="btn-secondary">Refresh</button>
        </div>
        <div id="reservationsList"></div>
    `;
    document.getElementById('searchReservationBtn').onclick = searchReservations;
    document.getElementById('refreshReservationsBtn').onclick = loadAllReservations;
    await loadAllReservations();
}

async function loadAllReservations() {
    const res = await fetchWithAuth('/api/list_all_reservations/');
    allReservations = await res.json();
    displayReservations(allReservations);
}

function displayReservations(list) {
    const container = document.getElementById('reservationsList');
    if (!list.length) {
        container.innerHTML = '<p>No reservations found.</p>';
        return;
    }
    let html = `<table class="data-table">
        <thead><tr>
            <th>ID</th><th>Person</th><th>Building</th><th>Apartment</th>
            <th>Start</th><th>End</th><th>Status</th><th>Actions</th>
        </tr></thead><tbody>`;
    list.forEach(r => {
        html += `<tr>
            <td data-label="ID">${r.reservationID}</td>
            <td data-label="Person">${r.personName}<br><small>${r.personEmail}<br>${r.personPhone}<br>${r.personNationalId}</small></td>
            <td data-label="Building">${r.buildingName}</td>
            <td data-label="Apartment">${r.apartmentNumber}</td>
            <td data-label="Start">${r.startdate}</td>
            <td data-label="End">${r.finaldate}</td>
            <td data-label="Status">${r.statusName}</td>
            <td data-label="Actions">
                <button class="edit-res-btn btn-secondary" data-id="${r.reservationID}">Edit</button>
                <button class="delete-res-btn btn-danger" data-id="${r.reservationID}">Delete</button>
            </td>
        </tr>`;
    });
    html += `</tbody></table>`;
    container.innerHTML = html;

    document.querySelectorAll('.edit-res-btn').forEach(btn =>
        btn.onclick = () => showEditReservationModal(btn.dataset.id)
    );
    document.querySelectorAll('.delete-res-btn').forEach(btn =>
        btn.onclick = async () => {
            if (await customConfirm('Delete this reservation?')) deleteReservation(btn.dataset.id);
        }
    );
}


function showEditReservationModal(reservationId) {
    const reservation = allReservations.find(r => r.reservationID == reservationId);
    if (!reservation) return;

    const modalHtml = `
        <div id="editReservationModal" class="modal-overlay" style="display:flex;">
            <div class="modal-card">
                <h3>Edit Reservation</h3>
                <div class="form-group">
                    <label>Start Date</label>
                    <input type="date" id="editResStart" value="${reservation.startdate}">
                </div>
                <div class="form-group">
                    <label>End Date</label>
                    <input type="date" id="editResEnd" value="${reservation.finaldate}">
                </div>
                <div class="form-group">
                    <label>Status</label>
                    <select id="editResStatus">
                        <option value="1" ${reservation.status == 1 ? 'selected' : ''}>Active</option>
                        <option value="2" ${reservation.status == 2 ? 'selected' : ''}>Inactive</option>
                    </select>
                </div>
                <div id="editResMessage" class="error" style="margin-bottom:0.5rem;"></div>
                <div class="modal-actions">
                    <button id="updateResBtn" class="btn-primary">Update</button>
                    <button id="closeEditResModal" class="btn-secondary">Cancel</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    document.getElementById('closeEditResModal').onclick = () => {
        document.getElementById('editReservationModal').remove();
    };
    document.getElementById('editReservationModal').addEventListener('click', function(e) {
        if (e.target === this) this.remove();
    });

    document.getElementById('updateResBtn').onclick = async () => {
        const startdate = document.getElementById('editResStart').value;
        const finaldate = document.getElementById('editResEnd').value;
        const statusID = document.getElementById('editResStatus').value;

        if (!startdate || !finaldate) {
            document.getElementById('editResMessage').innerText = 'Both dates are required.';
            return;
        }

        const resp = await fetchWithAuth('/api/update_reservation/', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                reservationID: reservationId,
                startdate,
                finaldate,
                statusID
            })
        });
        const data = await resp.json();
        if (resp.ok) {
            document.getElementById('editReservationModal').remove();
            loadAllReservations();
        } else {
            document.getElementById('editResMessage').innerText = data.error || 'Update failed.';
        }
    };
}

async function deleteReservation(id) {
    const res = await fetchWithAuth(`/api/delete_reservation/?reservationID=${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (res.ok) {
        loadAllReservations();
    } else {
        alert(data.error); 
    }
}

async function searchReservations() {
    const query = document.getElementById('searchReservationInput').value.trim().toLowerCase();
    if (!query) {
        displayReservations(allReservations);
        return;
    }
    const filtered = allReservations.filter(r =>
        r.personEmail.toLowerCase().includes(query) ||
        r.personPhone.toLowerCase().includes(query) ||
        r.personNationalId.toLowerCase().includes(query)
    );
    displayReservations(filtered);
}


async function renderUsersPage() {
    const container = document.getElementById('usersPage');
    container.innerHTML = `
        <h2>Manage Users</h2>
        <div class="inline-form">
            <input type="text" id="searchUserInput" placeholder="Search by username or email">
            <button id="searchUserBtn" class="btn-primary">Search</button>
            <button id="refreshUsersBtn" class="btn-secondary">Refresh</button>
        </div>
        <div id="usersList"></div>
        <h4>Add New User</h4>
        <div class="inline-form">
            <input type="text" id="newUsername" placeholder="Username">
            <input type="email" id="newUserEmail" placeholder="Email">
            <input type="password" id="newUserPassword" placeholder="Password">
            <button id="addUserBtn" class="btn-success">Add User</button>
        </div>
        <div id="usersMessage"></div>
    `;
    document.getElementById('searchUserBtn').onclick = searchUsers;
    document.getElementById('refreshUsersBtn').onclick = loadUsers;
    document.getElementById('addUserBtn').onclick = addUser;
    await loadUsers();
}

async function loadUsers() {
    const res = await fetchWithAuth('/api/listusers/');
    const users = await res.json();
    renderUsersTable(users);
}

function renderUsersTable(users) {
    const container = document.getElementById('usersList');
    if (!users.length) {
        container.innerHTML = '<p>No users found.</p>';
        return;
    }
    let html = `<table class="data-table">
        <thead><tr><th>Username</th><th>Email</th><th>Actions</th></tr></thead><tbody>`;
    users.forEach(u => {
        html += `
            <tr>
                <td data-label="Username">${u.username}</td>
                <td data-label="Email">${u.email}</td>
                <td data-label="Actions">
                    <button class="edit-user-btn btn-secondary" data-id="${u.userID}" data-username="${u.username}" data-email="${u.email}">Edit</button>
                    <button class="delete-user-btn btn-danger" data-id="${u.userID}">Delete</button>
                </td>
            </tr>`;
    });
    html += `</tbody></table>`;
    container.innerHTML = html;

    
    document.querySelectorAll('.edit-user-btn').forEach(btn => {
        btn.onclick = () => showEditUserModal(
            btn.dataset.id,
            btn.dataset.username,
            btn.dataset.email
        );
    });
    document.querySelectorAll('.delete-user-btn').forEach(btn => {
        btn.onclick = async () => {
            if (await customConfirm('Delete this user?')) deleteUser(btn.dataset.id);
        };
    });
}

async function deleteUser(id) {
    const res = await fetchWithAuth(`/api/deleteuser/?userID=${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (res.ok) {
        loadUsers();
    } else {
        alert(data.error);
    }
}

async function addUser() {
    const username = document.getElementById('newUsername').value.trim();
    const email = document.getElementById('newUserEmail').value.trim();
    const password = document.getElementById('newUserPassword').value;
    const msgDiv = document.getElementById('usersMessage');
    if (!username || !email || !password) {
        msgDiv.innerHTML = `<span class="error">All fields are required.</span>`;
        return;
    }
    const res = await fetchWithAuth('/api/adduser/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
    });
    const data = await res.json();
    if (res.ok) {
        msgDiv.innerHTML = `<span class="success">${data.message}</span>`;
        document.getElementById('newUsername').value = '';
        document.getElementById('newUserEmail').value = '';
        document.getElementById('newUserPassword').value = '';
        loadUsers();
    } else {
        msgDiv.innerHTML = `<span class="error">${data.error}</span>`;
    }
}

async function searchUsers() {
    const query = document.getElementById('searchUserInput').value.trim();
    if (!query) {
        loadUsers();
        return;
    }
    const res = await fetchWithAuth(`/api/search4user/?q=${encodeURIComponent(query)}`);
    const users = await res.json();
    renderUsersTable(users);
}


function showEditUserModal(userId, currentUsername, currentEmail) {
    const modalHtml = `
        <div id="editUserModal" class="modal-overlay" style="display:flex;">
            <div class="modal-card">
                <h3>Edit User</h3>
                <div class="form-group">
                    <label>Username</label>
                    <input type="text" id="editUsername" value="${currentUsername}">
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" id="editEmail" value="${currentEmail}">
                </div>
                <div class="form-group">
                    <label>New Password (leave blank to keep unchanged)</label>
                    <input type="password" id="editPassword">
                </div>
                <div id="editUserMessage" class="error" style="margin-bottom:0.5rem;"></div>
                <div class="modal-actions">
                    <button id="updateUserBtn" class="btn-primary">Update</button>
                    <button id="closeEditUserModal" class="btn-secondary">Cancel</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    document.getElementById('closeEditUserModal').onclick = () => {
        document.getElementById('editUserModal').remove();
    };
    document.getElementById('editUserModal').addEventListener('click', function(e) {
        if (e.target === this) this.remove();
    });

    document.getElementById('updateUserBtn').onclick = async () => {
        const newUsername = document.getElementById('editUsername').value.trim();
        const newEmail = document.getElementById('editEmail').value.trim();
        const newPassword = document.getElementById('editPassword').value;

        if (!newUsername || !newEmail) {
            document.getElementById('editUserMessage').innerText = 'Username and email are required.';
            return;
        }

        const body = { userID: userId, username: newUsername, email: newEmail };
        if (newPassword) body.password = newPassword;

        const res = await fetchWithAuth('/api/update_user/', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const data = await res.json();
        if (res.ok) {
            document.getElementById('editUserModal').remove();
            loadUsers();
        } else {
            document.getElementById('editUserMessage').innerText = data.error || 'Update failed.';
        }
    };
}


async function renderPersonsPage() {
    const container = document.getElementById('personsPage');
    container.innerHTML = `
        <h2>Manage Persons</h2>
        <div class="inline-form">
            <input type="text" id="searchPersonInput" placeholder="Search by name, email, phone, national ID">
            <button id="searchPersonBtn" class="btn-primary">Search</button>
            <button id="refreshPersonsBtn" class="btn-secondary">Refresh</button>
        </div>
        <div id="personsList"></div>
        <h4>Add New Person</h4>
        <div class="inline-form">
            <input type="text" id="newPersonFname" placeholder="First Name">
            <input type="text" id="newPersonLname" placeholder="Last Name">
            <input type="email" id="newPersonEmail" placeholder="Email">
            <input type="text" id="newPersonPhone" placeholder="Phone">
            <input type="text" id="newPersonNationalId" placeholder="National ID">
            <input type="date" id="newPersonBirthdate">
            <input type="text" id="newPersonMartialStatus" placeholder="Marital Status">
            <button id="addPersonBtn" class="btn-success">Add Person</button>
        </div>
        <div id="personsMessage"></div>
    `;
    document.getElementById('searchPersonBtn').onclick = searchPersons;
    document.getElementById('refreshPersonsBtn').onclick = loadPersons;
    document.getElementById('addPersonBtn').onclick = addPerson;
    await loadPersons();
}

async function loadPersons() {
    const res = await fetchWithAuth('/api/listpersons/');
    const persons = await res.json();
    renderPersonsTable(persons);
}

function renderPersonsTable(persons) {
    const container = document.getElementById('personsList');
    if (!persons.length) {
        container.innerHTML = '<p>No persons found.</p>';
        return;
    }
    let html = `<table class="data-table">
        <thead><tr><th>First Name</th><th>Last Name</th><th>Email</th><th>Phone</th><th>National ID</th><th>Birthdate</th><th>Marital Status</th><th>Actions</th></tr></thead><tbody>`;
    persons.forEach(p => {
        html += `
            <tr>
                <td data-label="First">${p.fname}</td>
                <td data-label="Last">${p.lname}</td>
                <td data-label="Email">${p.email}</td>
                <td data-label="Phone">${p.phonenumber}</td>
                <td data-label="National ID">${p.nationalid}</td>
                <td data-label="Birthdate">${p.birthdate || ''}</td>
                <td data-label="Marital">${p.martialstatus || ''}</td>
                <td data-label="Actions">
                    <button class="edit-person-btn btn-secondary" data-id="${p.personID}" 
                        data-fname="${p.fname}" 
                        data-lname="${p.lname}" 
                        data-email="${p.email}" 
                        data-phone="${p.phonenumber}" 
                        data-nationalid="${p.nationalid}" 
                        data-birthdate="${p.birthdate || ''}" 
                        data-martialstatus="${p.martialstatus || ''}">Edit</button>
                    <button class="delete-person-btn btn-danger" data-id="${p.personID}">Delete</button>
                </td>
            </tr>`;
    });
    html += `</tbody></table>`;
    container.innerHTML = html;

    document.querySelectorAll('.edit-person-btn').forEach(btn => {
        btn.onclick = () => showEditPersonModal(
            btn.dataset.id,
            btn.dataset.fname,
            btn.dataset.lname,
            btn.dataset.email,
            btn.dataset.phone,
            btn.dataset.nationalid,
            btn.dataset.birthdate,
            btn.dataset.martialstatus
        );
    });
    document.querySelectorAll('.delete-person-btn').forEach(btn => {
        btn.onclick = async () => {
            if (await customConfirm('Delete this person?')) deletePerson(btn.dataset.id);
        };
    });
}

async function deletePerson(id) {
    const res = await fetchWithAuth(`/api/deleteperson/?personID=${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (res.ok) {
        loadPersons();
    } else {
        alert(data.error);
    }
}

async function addPerson() {
    const msgDiv = document.getElementById('personsMessage');
    const data = {
        fname: document.getElementById('newPersonFname').value.trim(),
        lname: document.getElementById('newPersonLname').value.trim(),
        email: document.getElementById('newPersonEmail').value.trim(),
        phonenumber: document.getElementById('newPersonPhone').value.trim(),
        nationalid: document.getElementById('newPersonNationalId').value.trim(),
        birthdate: document.getElementById('newPersonBirthdate').value,
        martialstatus: document.getElementById('newPersonMartialStatus').value.trim()
    };
    if (!data.fname || !data.lname || !data.email || !data.phonenumber || !data.nationalid) {
        msgDiv.innerHTML = `<span class="error">First name, last name, email, phone, and national ID are required.</span>`;
        return;
    }
    const res = await fetchWithAuth('/api/addperson/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    const result = await res.json();
    if (res.ok) {
        msgDiv.innerHTML = `<span class="success">${result.message}</span>`;
        // Clear form
        ['newPersonFname','newPersonLname','newPersonEmail','newPersonPhone','newPersonNationalId','newPersonBirthdate','newPersonMartialStatus'].forEach(id => {
            document.getElementById(id).value = '';
        });
        loadPersons();
    } else {
        msgDiv.innerHTML = `<span class="error">${result.error}</span>`;
    }
}

async function searchPersons() {
    const query = document.getElementById('searchPersonInput').value.trim();
    if (!query) {
        loadPersons();
        return;
    }
    const res = await fetchWithAuth(`/api/search4person/?q=${encodeURIComponent(query)}`);
    const persons = await res.json();
    renderPersonsTable(persons);
}


function showEditPersonModal(id, fname, lname, email, phone, nationalid, birthdate, martialstatus) {
    const modalHtml = `
        <div id="editPersonModal" class="modal-overlay" style="display:flex;">
            <div class="modal-card">
                <h3>Edit Person</h3>
                <div class="form-group">
                    <label>First Name</label>
                    <input type="text" id="editFname" value="${fname}">
                </div>
                <div class="form-group">
                    <label>Last Name</label>
                    <input type="text" id="editLname" value="${lname}">
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" id="editEmail" value="${email}">
                </div>
                <div class="form-group">
                    <label>Phone</label>
                    <input type="text" id="editPhone" value="${phone}">
                </div>
                <div class="form-group">
                    <label>National ID</label>
                    <input type="text" id="editNationalId" value="${nationalid}">
                </div>
                <div class="form-group">
                    <label>Birthdate</label>
                    <input type="date" id="editBirthdate" value="${birthdate}">
                </div>
                <div class="form-group">
                    <label>Marital Status</label>
                    <input type="text" id="editMartialStatus" value="${martialstatus}">
                </div>
                <div id="editPersonMessage" class="error" style="margin-bottom:0.5rem;"></div>
                <div class="modal-actions">
                    <button id="updatePersonBtn" class="btn-primary">Update</button>
                    <button id="closeEditPersonModal" class="btn-secondary">Cancel</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    document.getElementById('closeEditPersonModal').onclick = () => {
        document.getElementById('editPersonModal').remove();
    };
    document.getElementById('editPersonModal').addEventListener('click', function(e) {
        if (e.target === this) this.remove();
    });

    document.getElementById('updatePersonBtn').onclick = async () => {
        const newFname = document.getElementById('editFname').value.trim();
        const newLname = document.getElementById('editLname').value.trim();
        const newEmail = document.getElementById('editEmail').value.trim();
        const newPhone = document.getElementById('editPhone').value.trim();
        const newNationalId = document.getElementById('editNationalId').value.trim();
        const newBirthdate = document.getElementById('editBirthdate').value;
        const newMartialStatus = document.getElementById('editMartialStatus').value.trim();

        if (!newFname || !newLname || !newEmail || !newPhone || !newNationalId) {
            document.getElementById('editPersonMessage').innerText = 'First name, last name, email, phone, and national ID are required.';
            return;
        }

        const res = await fetchWithAuth('/api/update_person/', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                personID: id,
                fname: newFname,
                lname: newLname,
                email: newEmail,
                phonenumber: newPhone,
                nationalid: newNationalId,
                birthdate: newBirthdate || null,
                martialstatus: newMartialStatus
            })
        });
        const data = await res.json();
        if (res.ok) {
            document.getElementById('editPersonModal').remove();
            loadPersons();
        } else {
            document.getElementById('editPersonMessage').innerText = data.error || 'Update failed.';
        }
    };
}


document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');
    toggle.onclick = () => navLinks.classList.toggle('show');

    document.getElementById('navLoginBtn').onclick = () => showPage('loginPage', renderLoginPage);
    document.getElementById('navRegisterBtn').onclick = () => showPage('registerPage', renderRegisterPage);
    document.getElementById('navManageBuildingsBtn').onclick = () => showPage('buildingsPage', () => { renderBuildingsPage(); });
    document.getElementById('navReservationsBtn').onclick = () => showPage('reservationsPage', renderReservationsPage);
    document.getElementById('navUsersBtn').onclick = () => showPage('usersPage', renderUsersPage);
    document.getElementById('navPersonsBtn').onclick = () => showPage('personsPage', renderPersonsPage);
    document.getElementById('navLogoutBtn').onclick = () => {
        loggedInUser = null;
        sessionStorage.removeItem('loggedInUser');
        updateNavbar();
    };

    const saved = sessionStorage.getItem('loggedInUser');
    if (saved) loggedInUser = JSON.parse(saved);
    updateNavbar();
});