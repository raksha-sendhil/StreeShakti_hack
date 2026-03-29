// 1. DATA SERVICES (The "Fake Backend")

const AuthService = {
    getDB: function() {
        const db = localStorage.getItem('usersDB');
        return db ? JSON.parse(db) : {}; 
    },
    saveDB: function(db) {
        localStorage.setItem('usersDB', JSON.stringify(db));
    },

    login: function(phone, role) {
        localStorage.setItem('tempPhone', phone);
        localStorage.setItem('tempRole', role);
        return { success: true };
    },
    
    verifyOTP: function(otp) {
        // Updated to check for 5 digits since you have 5 boxes
        if (otp.length < 5) return { success: false, message: "Please enter the full OTP" };
        
        const phone = localStorage.getItem('tempPhone');
        const role = localStorage.getItem('tempRole');
        
        localStorage.setItem('activePhone', phone);
        localStorage.setItem('activeRole', role);
        
        localStorage.removeItem('tempPhone');
        localStorage.removeItem('tempRole');
        
        const db = this.getDB();
        const existingUser = db[phone]; 
        
        const isExistingUser = !!(existingUser && existingUser.name);
        
        return { success: true, role: role, isExistingUser: isExistingUser };
    },
    
    saveProfile: function(data) {
        const phone = localStorage.getItem('activePhone');
        const db = this.getDB();
        
        db[phone] = {
            name: data.name,
            location: data.location,
            skill: data.skill,
            language: data.language
        };
        
        this.saveDB(db);
        return { success: true };
    },
    
    isLoggedIn: function() {
        return !!localStorage.getItem('activePhone'); 
    },
    
    getUserData: function() {
        const phone = localStorage.getItem('activePhone');
        const db = this.getDB();
        return db[phone] || {}; 
    },
    
    logout: function() {
        localStorage.removeItem('activePhone');
        localStorage.removeItem('activeRole');
        window.location.href = 'login.html'; // Adjust this to your first landing page file name if different
    }
};

// 2. GLOBAL ROUTING (Stay Signed In & Security)

const currentPage = window.location.pathname;

if (AuthService.isLoggedIn()) {
    // If logged in, block them from all 3 login pages
    if (currentPage.includes('login') || currentPage.includes('enter_otp.html') || currentPage.includes('index.html')) {
        window.location.href = 'employee_dashboard.html';
    }
} else {
    // Optional Security Kick-out
    if (currentPage.includes('employee_dashboard.html') || currentPage.includes('onboarding_seeker.html')) {
        // window.location.href = 'login.html'; 
    }
}

// 3. UI CONTROLLERS (Multi-Page Login Flow)

// --- PAGE 1: ROLE SELECTION (The first Namaste page) ---
// Finds the button that says "Job Seeker" and clicks it
const jobSeekerBtn = Array.from(document.querySelectorAll('button')).find(btn => btn.textContent.trim() === 'Job Seeker');
if (jobSeekerBtn && !document.getElementById('phone_input')) {
    jobSeekerBtn.addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = 'login_job_seeker.html';
    });
}

// --- PAGE 2: PHONE INPUT (login_job_seeker.html) ---
const phoneInput = document.getElementById('phone_input');
const getOtpBtn = document.getElementById('verify_btn');

// Make sure we are on the phone page, not the OTP page
if (phoneInput && getOtpBtn) {
    getOtpBtn.addEventListener('click', function(event) {
        event.preventDefault();
        const phone = phoneInput.value;
        
        if (phone.length < 10) return alert("Please enter a valid 10-digit phone number.");

        // Because they clicked "Job Seeker" earlier, we hardcode the role to 'seeker'
        const response = AuthService.login(phone, 'seeker');
        if (response.success) window.location.href = 'enter_otp.html';
    });
}

// --- PAGE 3: ENTER OTP (enter_otp.html) ---
// Find all 5 input boxes
const otpInputs = document.querySelectorAll('input[maxlength="1"]');
const verifyOtpBtn = document.getElementById('verify_btn');

// Make sure we are on the OTP page
if (otpInputs.length > 0 && verifyOtpBtn && !phoneInput) {
    
    // BONUS UX: Auto-advance to the next box when typing!
    otpInputs.forEach((input, index) => {
        input.addEventListener('input', () => {
            if (input.value.length === 1 && index < otpInputs.length - 1) {
                otpInputs[index + 1].focus();
            }
        });
    });

    verifyOtpBtn.addEventListener('click', function(event) {
        event.preventDefault();
        
        // Combine all 5 boxes into a single string
        let otp = '';
        otpInputs.forEach(input => otp += input.value);
        
        const response = AuthService.verifyOTP(otp);
        if (!response.success) return alert(response.message);

        // Routing Logic (New vs Old User)
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

// --- PAGE 4: ONBOARDING ---
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