document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = window.API_BASE_URL;

    const loginPage = document.getElementById('login-page');
    const signupPage = document.getElementById('signup-page');
    const dashboardPage = document.getElementById('dashboard-page');
    const welcomePage = document.getElementById('welcome-page');
    const profilePage = document.getElementById('profile-page');
    const registerStorePage = document.getElementById('register-store-page');
    const forgotPasswordPage = document.getElementById('forgot-password-page');
    const passwordResetConfirmPage = document.getElementById('password-reset-confirm-page');
    const pages = [loginPage, signupPage, dashboardPage, welcomePage, profilePage, registerStorePage, forgotPasswordPage, passwordResetConfirmPage];

    const profileLink = document.getElementById('profile-link');
    const dashboardLink = document.getElementById('dashboard-link');
    const registerStoreLink = document.getElementById('register-store-link');
    const logoutLink = document.getElementById('logout-link');
    const navItems = [profileLink, dashboardLink, registerStoreLink, logoutLink];

    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const profileForm = document.getElementById('profile-form');
    const registerStoreForm = document.getElementById('register-store-form');
    const forgotPasswordForm = document.getElementById('forgot-password-form');
    const passwordResetConfirmForm = document.getElementById('password-reset-confirm-form');

    const sendOtpBtn = document.getElementById('send-otp-btn');
    const showSignupLink = document.getElementById('show-signup-link');
    const showLoginLink = document.getElementById('show-login-link');
    const welcomeDashLink = document.getElementById('welcome-dash-link');
    const welcomeProfileLink = document.getElementById('welcome-profile-link');
    const welcomeStoreLink = document.getElementById('welcome-store-link');
    const verifyEmailChangeBtn = document.getElementById('verify-email-change-btn');
    const editEmailBtn = document.getElementById('edit-email-btn');
    const cancelEmailBtn = document.getElementById('cancel-email-btn');
    const sendOtpForEmailBtn = document.getElementById('send-otp-email-btn');

    const forgotPasswordLink = document.getElementById('forgot-password-link');
    const showLoginLinkFromForgot = document.getElementById('show-login-link-from-forgot');

    let originalEmail = '';


    function showPage(pageId) {
        pages.forEach(page => {
            if (!page) return;
            page.style.display = page.id === pageId ? 'flex' : 'none';
        });
    }

    function updateNavbar() {
        const token = localStorage.getItem('accessToken');
        if (token) {
            navItems.forEach(item => item.style.display = 'block');
        } else {
            navItems.forEach(item => item.style.display = 'none');
        }
    }

    async function apiCall(endpoint, method = 'GET', body = null, requiresAuth = true) {
        const headers = { 'Content-Type': 'application/json' };
        if (requiresAuth) {
            const token = localStorage.getItem('accessToken');
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            } else {
                handleLogout();
                throw new Error('Authentication token not found.');
            }
        }

        const options = { method, headers };
        if (body) {
            options.body = JSON.stringify(body);
        }

        try {
            const response = await fetch(API_BASE_URL + endpoint, options);
            if (!response.ok) {
                if (response.status === 401 && requiresAuth) {
                    try {
                        const refresh = localStorage.getItem('refreshToken');
                        const refreshResponse = await fetch(API_BASE_URL + '/auth/jwt/refresh/', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ refresh })
                        });
                        if (!refreshResponse.ok) throw new Error('Token refresh failed.');
                        const data = await refreshResponse.json();
                        localStorage.setItem('accessToken', data.access);
                        return await apiCall(endpoint, method, body, requiresAuth);
                    } catch (refreshError) {
                        handleLogout();
                        throw refreshError;
                    }
                }
                const errorData = await response.json();
                throw new Error(JSON.stringify(errorData));
            }
            return response.status === 204 ? null : await response.json();
        } catch (error) {
            console.error('API Call Error:', error.message);
            alert('An error occurred: ' + error.message);
            throw error;
        }
    }


    async function handleLogin(event) {
        event.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        try {
            const data = await apiCall('/auth/jwt/create/', 'POST', { email, password }, false);
            localStorage.setItem('accessToken', data.access);
            localStorage.setItem('refreshToken', data.refresh);
            showPage('welcome-page');
            updateNavbar();
        } catch (error) {}
    }

    function handleLogout() {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        showPage('login-page');
        updateNavbar();
    }

    async function handleSignup(event) {
        event.preventDefault();
        const email = document.getElementById('signup-email').value;
        const otp = document.getElementById('otp').value;
        const password = document.getElementById('signup-password').value;
        const re_password = document.getElementById('signup-re-password').value;
        const username = document.getElementById('signup-username').value;
        const first_name = document.getElementById('signup-first-name').value;
        const last_name = document.getElementById('signup-last-name').value;

        if (password !== re_password) {
            alert('Passwords do not match.');
            return;
        }
        try {
            await apiCall('/verify_otp/', 'POST', { email, otp }, false);
            const userData = { email, password, re_password, username, first_name, last_name };
            await apiCall('/auth/users/', 'POST', userData, false);
            alert('Signup successful! Please log in.');
            showPage('login-page');
        } catch (error) {}
    }

    async function loadDashboard() {
        showPage('dashboard-page');
        const dashboardContent = document.getElementById('dashboard-content');

        const customersIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`;
        const ordersIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M17 18c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2zM7 18c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2zm.16-8L8.1 13h5.25l.95-2H7.16zM15.55 13l-1.45-2.79c-.25-.48-.71-.79-1.23-.84L8.5 9.02l-1.1-2H4.21l.94 2H18.4l-2.85 5z"/></svg>`;
        const revenueIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-.9.6-1.75 2.4-1.75 1.4 0 2.5.65 2.5 1.75h-2.1c0-.35-.3-.65-.8-.65s-.8.3-.8.65c0 .45.3.65.9.85 2.25.6 3 1.2 3 2.15 0 .95-.6 1.75-2.4 1.75-1.4 0-2.5-.65-2.5-1.75h2.1c0 .35.3.65.8.65s.8-.3.8-.65c0-.45-.3-.65-.9-.85zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>`;

        try {
            const [stats, ordersByDate, topCustomers] = await Promise.all([
                apiCall('/dashboard/api/stats/'),
                apiCall('/dashboard/api/orders-by-date/'),
                apiCall('/dashboard/api/top-customers/')
            ]);

            dashboardContent.innerHTML = `
                <div class="card kpi-card">
                    <div class="icon">${customersIcon}</div>
                    <div class="details">
                        <h4>Total Customers</h4>
                        <p class="value">${stats.total_customers}</p>
                    </div>
                </div>
                <div class="card kpi-card">
                    <div class="icon">${ordersIcon}</div>
                    <div class="details">
                        <h4>Total Orders</h4>
                        <p class="value">${stats.total_orders}</p>
                    </div>
                </div>
                <div class="card kpi-card">
                    <div class="icon">${revenueIcon}</div>
                    <div class="details">
                        <h4>Total Revenue</h4>
                        <p class="value">${stats.total_revenue.toFixed(2)}</p>
                    </div>
                </div>

                <div class="card chart-card">
                    <h3>Orders per Day</h3>
                    <canvas id="ordersChart"></canvas>
                </div>

                <div class="card top-customers-card">
                    <h3>Top 5 Customers</h3>
                    <ul id="top-customers-list">
                        ${topCustomers.map(c => `<li><span class="customer-info">${c.first_name || ''} ${c.last_name || ''} (${c.email})</span> <span class="customer-spend">${parseFloat(c.total_spent).toFixed(2)}</span></li>`).join('')}
                    </ul>
                </div>
            `;

            new Chart(document.getElementById('ordersChart'), {
                type: 'line',
                data: {
                    labels: ordersByDate.map(d => d.date),
                    datasets: [{
                        label: 'Orders',
                        data: ordersByDate.map(d => d.order_count),
                        borderColor: '#007bff',
                        backgroundColor: 'rgba(0, 123, 255, 0.1)',
                        fill: true,
                        tension: 0.3
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            });
        } catch (error) {
            dashboardContent.innerHTML = `<div class="card"><p style="color: red;">Could not load dashboard. ${error.message}</p></div>`;
        }
    }

    function resetProfileEmailState() {
        document.getElementById('profile-email').readOnly = true;
        document.getElementById('profile-email').value = originalEmail;
        editEmailBtn.style.display = 'block';
        sendOtpForEmailBtn.style.display = 'none';
        cancelEmailBtn.style.display = 'none';
        document.getElementById('email-change-verification').style.display = 'none';
    }

    async function loadProfile() {
        showPage('profile-page');
        resetProfileEmailState();
        try {
            const user = await apiCall('/auth/users/me/');
            originalEmail = user.email || '';
            document.getElementById('profile-username').textContent = user.username;
            document.getElementById('profile-first-name').value = user.first_name || '';
            document.getElementById('profile-last-name').value = user.last_name || '';
            document.getElementById('profile-email').value = originalEmail;
        } catch (error) {}
    }

    async function handleProfileUpdate(event) {
        event.preventDefault();
        const updatedData = {
            first_name: document.getElementById('profile-first-name').value,
            last_name: document.getElementById('profile-last-name').value,
        };
        try {
            await apiCall('/auth/users/me/', 'PATCH', updatedData);
            alert('Profile updated successfully!');
            loadProfile();
        } catch (error) {}
    }

    async function handleSendOtpForEmail() {
        const newEmail = document.getElementById('profile-email').value;
        if (newEmail === originalEmail) {
            alert('Please enter a new email address.');
            return;
        }
        try {
            await apiCall('/send_otp/', 'POST', { email: newEmail }, false);
            alert('OTP sent to your new email address.');
            sendOtpForEmailBtn.style.display = 'none';
            cancelEmailBtn.style.display = 'none';
            document.getElementById('email-change-verification').style.display = 'block';
        } catch (error) {
            alert('Failed to send OTP. Please check the email address and try again.');
        }
    }

    async function handleEmailChangeVerification() {
        const newEmail = document.getElementById('profile-email').value;
        const password = document.getElementById('profile-current-password').value;
        const otp = document.getElementById('profile-otp').value;
        if (!password || !otp) {
            alert('Please provide your current password and the OTP.');
            return;
        }
        try {
            await apiCall('/verify_otp/', 'POST', { email: newEmail, otp }, false);
            await apiCall('/auth/users/set_email/', 'POST', { new_email: newEmail, current_password: password });
            alert('Email updated successfully! Other profile information can be updated separately.');
            loadProfile();
        } catch (error) {
            alert(`Failed to update email. ${error.message}`);
        }
    }

    async function handleRegisterStore(event) {
        event.preventDefault();
        const storeData = { name: document.getElementById('tenant-name').value, shopify_domain: document.getElementById('tenant-domain').value, access_token: document.getElementById('tenant-token').value };
        try {
            await apiCall('/api/tenants/', 'POST', storeData);
            alert('Store registered successfully!');
            showPage('welcome-page');
        } catch (error) {}
    }

    async function handleForgotPassword(event) {
        event.preventDefault();
        const email = document.getElementById('forgot-password-email').value;
        try {
            await apiCall('/auth/users/reset_password/', 'POST', { email }, false);
            alert('If an account with that email exists, a password reset link has been sent.');
            showPage('login-page');
        } catch (error) {
            alert('If an account with that email exists, a password reset link has been sent.');
            showPage('login-page');
        }
    }

    async function handlePasswordResetConfirm(event) {
        event.preventDefault();
        const new_password = document.getElementById('new-password').value;

        const path = window.location.hash.substring(1); 
        const parts = path.split('/');
        if (parts.length < 5 || parts[0] !== 'password' || parts[1] !== 'reset' || parts[2] !== 'confirm') {
            alert('Invalid password reset link.');
            return;
        }
        const uid = parts[3];
        const token = parts[4];

        try {
            await apiCall('/auth/users/reset_password_confirm/', 'POST', { uid, token, new_password }, false);
            alert('Password has been reset successfully! Please log in.');
            window.location.hash = '';
            showPage('login-page');
        } catch (error) {
            alert('Failed to reset password. The link may be invalid or expired.');
        }
    }


    function init() {
        loginForm.addEventListener('submit', handleLogin);
        signupForm.addEventListener('submit', handleSignup);
        profileForm.addEventListener('submit', handleProfileUpdate);
        registerStoreForm.addEventListener('submit', handleRegisterStore);
        forgotPasswordForm.addEventListener('submit', handleForgotPassword);
        passwordResetConfirmForm.addEventListener('submit', handlePasswordResetConfirm);

        logoutLink.addEventListener('click', handleLogout);
        verifyEmailChangeBtn.addEventListener('click', handleEmailChangeVerification);
        editEmailBtn.addEventListener('click', () => {
            document.getElementById('profile-email').readOnly = false;
            editEmailBtn.style.display = 'none';
            sendOtpForEmailBtn.style.display = 'block';
            cancelEmailBtn.style.display = 'block';
        });
        cancelEmailBtn.addEventListener('click', resetProfileEmailState);
        sendOtpForEmailBtn.addEventListener('click', handleSendOtpForEmail);
        sendOtpBtn.addEventListener('click', () => {});

        forgotPasswordLink.addEventListener('click', (e) => { e.preventDefault(); showPage('forgot-password-page'); });
        showLoginLinkFromForgot.addEventListener('click', (e) => { e.preventDefault(); showPage('login-page'); });

        showSignupLink.addEventListener('click', (e) => { e.preventDefault(); showPage('signup-page'); });
        showLoginLink.addEventListener('click', (e) => { e.preventDefault(); showPage('login-page'); });
        dashboardLink.addEventListener('click', (e) => { e.preventDefault(); loadDashboard(); });
        profileLink.addEventListener('click', (e) => { e.preventDefault(); loadProfile(); });
        registerStoreLink.addEventListener('click', (e) => { e.preventDefault(); showPage('register-store-page'); });
        
        welcomeDashLink.addEventListener('click', (e) => { e.preventDefault(); loadDashboard(); });
        welcomeProfileLink.addEventListener('click', (e) => { e.preventDefault(); loadProfile(); });
        welcomeStoreLink.addEventListener('click', (e) => { e.preventDefault(); showPage('register-store-page'); });

        const path = window.location.hash.substring(1);
        const parts = path.split('/');
        if (parts.length >= 5 && parts[0] === 'password' && parts[1] === 'reset' && parts[2] === 'confirm') {
            showPage('password-reset-confirm-page');
        } else {
            const token = localStorage.getItem('accessToken');
            if (token) {
                showPage('welcome-page');
            } else {
                showPage('login-page');
            }
        }
        updateNavbar();
    }

    init();
});
