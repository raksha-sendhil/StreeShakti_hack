// 1. DATA SERVICES (The "Fake Backend")

const AuthService = {
    // This grabs our whole user database from memory, or makes an empty one if it doesn't exist
    getDB: function() {
        const db = localStorage.getItem('usersDB');
        return db ? JSON.parse(db) : {}; // JSON.parse turns the text back into a JS object
    },
    // This saves the updated database back to memory
    saveDB: function(db) {
        localStorage.setItem('usersDB', JSON.stringify(db));
    },

    // --- Core Functions ---
    login: function(phone, role) {
        localStorage.setItem('tempPhone', phone);
        localStorage.setItem('tempRole', role);
        return { success: true };
    },
    
    verifyOTP: function(otp) {
        if (otp.length < 4) return { success: false, message: "Invalid OTP" };
        
        // 1. Get the phone they used to log in
        const phone = localStorage.getItem('tempPhone');
        const role = localStorage.getItem('tempRole');
        
        // 2. Make them the "Active" user
        localStorage.setItem('activePhone', phone);
        localStorage.setItem('activeRole', role);
        
        // 3. Clean up the temp storage
        localStorage.removeItem('tempPhone');
        localStorage.removeItem('tempRole');
        
        // 4. THE SMART CHECK: Look up THIS specific phone number in our database
        const db = this.getDB();
        const existingUser = db[phone]; 
        
        // If the user exists and has a name saved, they are an old user!
        const isExistingUser = !!(existingUser && existingUser.name);
        
        return { success: true, role: role, isExistingUser: isExistingUser };
    },
    
    saveProfile: function(data) {
        // Grab the currently logged-in phone number and the database
        const phone = localStorage.getItem('activePhone');
        const db = this.getDB();
        
        // Save all their data UNDER their specific phone number
        db[phone] = {
            name: data.name,
            location: data.location,
            skill: data.skill,
            language: data.language
        };
        
        // Save the updated database back to memory
        this.saveDB(db);
        return { success: true };
    },
    
    isLoggedIn: function() {
        return !!localStorage.getItem('activePhone'); // Checks if someone is actively logged in
    },
    
    getUserData: function() {
        const phone = localStorage.getItem('activePhone');
        const db = this.getDB();
        
        // Return the specific data for the logged-in phone number
        return db[phone] || {}; 
    },
    
    logout: function() {
        // ONLY delete the active session. 
        // We leave 'usersDB' completely untouched so their data is safe!
        localStorage.removeItem('activePhone');
        localStorage.removeItem('activeRole');
        window.location.href = 'login.html';
    }
};


// 2. GLOBAL ROUTING (Stay Signed In & Security)
// This runs immediately on every page load.

const currentPage = window.location.pathname;

if (AuthService.isLoggedIn()) {
    // If they are logged in, keep them away from login/OTP pages
    if (currentPage.includes('login.html') || currentPage.includes('enter_otp.html')) {
        window.location.href = 'employee_dashboard.html';
    }
} else {
    // Optional Security: If they are NOT logged in, kick them out of the dashboard
    if (currentPage.includes('employee_dashboard.html') || currentPage.includes('onboarding_seeker.html')) {
        // window.location.href = 'login.html'; // Uncomment to enforce login!
    }
}



// 3. UI CONTROLLERS (Button Clicks for Specific Pages)


// PAGE 1: LOGIN
const loginBtn = document.getElementById('verify_btn');
const phoneInput = document.getElementById('phone_input');

if (loginBtn && phoneInput) {
    loginBtn.addEventListener('click', function(event) {
        event.preventDefault();
        
        const phone = phoneInput.value;
        const userTypeEl = document.querySelector('input[name="userType"]:checked');
        
        if (phone.length < 10) return alert("Please enter a valid 10-digit phone number.");
        if (!userTypeEl) return alert("Please select Business or Job Seeker.");

        const response = AuthService.login(phone, userTypeEl.value);
        if (response.success) window.location.href = 'enter_otp.html';
    });
}

// PAGE 2: OTP
const otpBtn = document.getElementById('verify_btn');
const otpInput = document.getElementById('otp_input');

if (otpBtn && otpInput) {
    otpBtn.addEventListener('click', function(event) {
        event.preventDefault();
        
        const response = AuthService.verifyOTP(otpInput.value);
        if (!response.success) return alert(response.message);

        // Routing Logic (New vs Old User happens here)
        if (response.role === 'business') {
            window.location.href = 'employee_dashboard.html';
        } else {
            if (response.isExistingUser) {
                window.location.href = 'employee_dashboard.html'; // Old User
            } else {
                window.location.href = 'onboarding_seeker.html';  // New User
            }
        }
    });
}

// PAGE 3: ONBOARDING 
const saveBtn = document.getElementById('save_data_btn');

if (saveBtn) {
    saveBtn.addEventListener('click', function(event) {
        event.preventDefault();
        
        const data = {
            name: document.getElementById('name').value,
            location: document.getElementById('location').value,
            skill: document.getElementById('skills_dropdown').value,
            language: document.getElementById('languages_dropdown').value
        };
        
        if (!data.name || !data.location) return alert("Name and location are required.");

        const response = AuthService.saveProfile(data);
        if (response.success) window.location.href = 'employee_dashboard.html';
    });
}

//  PAGE 4: DASHBOARD (Dynamic Updates & Logout)
const navbar = document.getElementById('navbar');

if (navbar) {
    const userData = AuthService.getUserData();
    
    // 1. Greet the user by name if we have it
    if (userData.name) {
        const titleElement = navbar.querySelector('.font-script');
        if (titleElement) {
            // Changes "StreeShakti" to "Welcome, [Name]!"
            titleElement.textContent = `Welcome, ${userData.name}!`; 
            titleElement.classList.replace('text-5xl', 'text-4xl'); // Shrink it slightly to fit
        }
    }

    // NOTE: The logout confirm block that was here has been completely removed!
}

