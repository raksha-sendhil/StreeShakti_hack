// 1. DATA LAYER
const MOCK_JOBS = [
    { job_id: 'j_001', title: 'Weaver needed for 2 weeks', job_type: 'weaving', location: 'Rajkot, Gujarat', is_wfh: false, salary_monthly_min: 8000, salary_monthly_max: 12000, employer_name: 'Meena Fabrics', rating: 4.5, total_hires: 23, is_verified: true, has_applied: false, posted_at: '2025-01-15T10:30:00Z' },
    { job_id: 'j_002', title: 'Cook needed for school canteen', job_type: 'cooking', location: 'Anand, Gujarat', is_wfh: false, salary_monthly_min: 5000, salary_monthly_max: 7000, employer_name: 'Sunrise School', rating: 4.1, total_hires: 8, is_verified: false, has_applied: false, posted_at: '2025-01-14T08:00:00Z' },
    { job_id: 'j_003', title: 'Embroidery work from home', job_type: 'handicrafts', location: 'Jamnagar, Gujarat', is_wfh: true, salary_monthly_min: 4000, salary_monthly_max: 6000, employer_name: 'CraftCo', rating: 3.9, total_hires: 41, is_verified: true, has_applied: false, posted_at: '2025-01-13T14:00:00Z' },
    { job_id: 'j_004', title: 'Nanny needed - flexible hours', job_type: 'nanny', location: 'Vadodara, Gujarat', is_wfh: false, salary_monthly_min: 6000, salary_monthly_max: 9000, employer_name: 'Patel Family', rating: 4.8, total_hires: 3, is_verified: false, has_applied: false, posted_at: '2025-01-12T11:00:00Z' }
];

function formatSalary(min, max) {
    if (min === max) return '₹' + min.toLocaleString('en-IN') + '/month';
    return '₹' + min.toLocaleString('en-IN') + ' – ₹' + max.toLocaleString('en-IN') + '/month';
}

// 2. SERVICE LAYER
const JobService = {
    getJobs: async function(filters = {}) {
        return MOCK_JOBS.filter(job => {
            const matchesSkill = filters.skills?.length ? filters.skills.includes(job.job_type) : true;
            const matchesLocation = filters.locations?.length ? filters.locations.some(city => job.location.includes(city)) : true;
            
            let matchesWfh = true;
            if (filters.wfhs?.length) {
                const wantsWfh = filters.wfhs.includes('yes');
                const wantsInPerson = filters.wfhs.includes('no');
                if (wantsWfh && !wantsInPerson) matchesWfh = job.is_wfh === true;
                if (!wantsWfh && wantsInPerson) matchesWfh = job.is_wfh === false;
            }
            let matchesSalary = true;
            if (filters.salaries?.length) {
                matchesSalary = filters.salaries.some(bucket => {
                    if (bucket === 'under_2k') return job.salary_monthly_max < 2000;
                    if (bucket === 'under_5k') return job.salary_monthly_max < 5000;
                    if (bucket === 'under_10k') return job.salary_monthly_max < 10000;
                    if (bucket === 'above_10k') return job.salary_monthly_min >= 10000;
                    return true;
                });
            }
            return matchesSkill && matchesLocation && matchesWfh && matchesSalary;
        });
    }
};

// 3. UI CONTROLLER
const container = document.getElementById('job_list_container');
const applyBtn = document.getElementById('apply_filters_btn');

function renderJobs(jobsArray) {
    container.innerHTML = '';
    if (jobsArray.length === 0) {
        container.innerHTML = `<div class="p-10 text-center text-gray-500 font-bold text-xl">No jobs found matching these filters.</div>`;
        return;
    }
    jobsArray.forEach(job => {
        const jobCard = document.createElement('div');
        jobCard.className = "border shadow-lg rounded-lg bg-white pb-6 mb-6 overflow-hidden"; 
        const salaryString = formatSalary(job.salary_monthly_min, job.salary_monthly_max);
        jobCard.innerHTML = `
            <div class="bg-pink-400 flex justify-center items-center h-16 font-bold text-xl text-white">
                ${job.employer_name} </div>
            <div class="text-center mt-4 px-4">
                <h2 class="text-gray-800 font-bold text-lg mb-1">${job.title}</h2> 
                <p class="text-sm text-gray-500 mb-2 font-medium bg-purple-100 text-purple-700 inline-block px-3 py-1 rounded-full">
                    ${job.job_type} ${job.is_wfh ? '🏠 (WFH)' : ''}
                </p>
                <div class="flex flex-col items-center justify-center gap-1 my-3 text-sm">
                    <p>📍 <span class="font-medium text-gray-700">${job.location}</span></p> 
                    <p>💰 <span class="font-bold text-green-600">${salaryString}</span></p> </div>
                <div class="flex items-center justify-center gap-4 mt-2 mb-4 bg-gray-50 py-2 rounded">
                    <span class="text-yellow-500 font-bold">⭐ ${job.rating}</span> 
                    <span class="text-gray-500 text-sm">🤝 ${job.total_hires} previous hires</span> </div>
                <button onclick="applyForJob('${job.job_id}')" class="bg-blue-500 hover:bg-blue-600 transition-colors text-white px-8 py-2 rounded shadow font-medium">
                    Check out now
                </button>
            </div>
        `;
        container.appendChild(jobCard);
    });
}

async function handleFilters() {
    const activeFilters = {
        skills: Array.from(document.querySelectorAll('input[name="filter_skill"]:checked')).map(el => el.value),
        locations: Array.from(document.querySelectorAll('input[name="filter_location"]:checked')).map(el => el.value),
        salaries: Array.from(document.querySelectorAll('input[name="filter_salary"]:checked')).map(el => el.value),
        wfhs: Array.from(document.querySelectorAll('input[name="filter_wfh"]:checked')).map(el => el.value)
    };
    const filteredJobs = await JobService.getJobs(activeFilters);
    renderJobs(filteredJobs);
}

function applyForJob(jobId) {
    window.location.href = 'job_detail.html?job_id=' + jobId; 
}

// 4. NAVIGATION & GREETING CONTROLLER (Your Changes)
window.onload = async () => {
    // Dynamic Greeting 
    const userName = localStorage.getItem('userName');
    const titleElement = document.querySelector('.font-script');
    if (userName && titleElement) {
        titleElement.textContent = `Welcome, ${userName}!`;
        titleElement.classList.replace('text-5xl', 'text-4xl');
    }

    // Initial Load
    const allJobs = await JobService.getJobs({});
    renderJobs(allJobs);

    // Filter Apply Button
    if (applyBtn) applyBtn.addEventListener('click', handleFilters);

    // Profile Click Logic (NO LOGOUT POPUPS!)
    const profileBtn = document.getElementById('profile_btn');
    if (profileBtn) {
        profileBtn.onclick = () => { window.location.href = 'profile.html'; };
    }

    // Training Click Logic
    const trainingBtn = document.getElementById('training_btn');
    if (trainingBtn) {
        trainingBtn.onclick = () => { window.location.href = 'training.html'; };
    }
};