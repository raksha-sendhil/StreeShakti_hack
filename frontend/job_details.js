// 1. DATA LAYER (Includes extra details for the specific job view)
const MOCK_JOBS = [
    { 
        job_id: 'j_001', title: 'Weaver needed for 2 weeks', job_type: 'weaving', location: 'Rajkot, Gujarat', is_wfh: false, salary_monthly_min: 8000, salary_monthly_max: 12000, employer_name: 'Meena Fabrics', rating: 4.5, total_hires: 23, 
        work_hours: '9:00 AM - 5:00 PM',
        description: 'We are looking for an experienced weaver to help us fulfill a large order of traditional Gujarati sarees. Material and looms will be provided at our workshop.',
        reviews: ['"Meena Fabrics pays on time and provides a safe working environment." - Anita', '"Good place to work for short-term contracts." - Rekha']
    },
    { 
        job_id: 'j_002', title: 'Cook needed for school canteen', job_type: 'cooking', location: 'Anand, Gujarat', is_wfh: false, salary_monthly_min: 5000, salary_monthly_max: 7000, employer_name: 'Sunrise School', rating: 4.1, total_hires: 8,
        work_hours: '7:00 AM - 2:00 PM',
        description: 'Looking for a cook to prepare simple, nutritious mid-day meals for 150 primary school students. Must maintain strict hygiene standards.',
        reviews: ['"The school staff is very respectful." - Sunita']
    },
    { 
        job_id: 'j_003', title: 'Embroidery work from home', job_type: 'handicrafts', location: 'Jamnagar, Gujarat', is_wfh: true, salary_monthly_min: 4000, salary_monthly_max: 6000, employer_name: 'CraftCo', rating: 3.9, total_hires: 41,
        work_hours: 'Flexible (Work from Home)',
        description: 'We need skilled artisans to do mirror-work and embroidery on dress materials. We will deliver the raw materials to your home and pick up the finished products weekly.',
        reviews: ['"Perfect for earning extra income while looking after my kids." - Bhavna', '"Sometimes the raw material delivery is late." - Leela']
    },
    { 
        job_id: 'j_004', title: 'Nanny needed - flexible hours', job_type: 'nanny', location: 'Vadodara, Gujarat', is_wfh: false, salary_monthly_min: 6000, salary_monthly_max: 9000, employer_name: 'Patel Family', rating: 4.8, total_hires: 3,
        work_hours: 'Part-time (4 hours a day)',
        description: 'Looking for a caring nanny to look after a 3-year-old child in the afternoons. Light meal prep for the child is included.',
        reviews: ['"The Patel family is wonderful to work for." - Manjula']
    }
];

function formatSalary(min, max) {
    if (min === max) return '₹' + min.toLocaleString('en-IN') + '/month';
    return '₹' + min.toLocaleString('en-IN') + ' – ₹' + max.toLocaleString('en-IN') + '/month';
}

// 2. LOGIC: Get the ID from the URL and load the data
window.addEventListener('DOMContentLoaded', () => {
    // A. Grab the "?job_id=..." from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const targetJobId = urlParams.get('job_id');

    // B. Find the matching job in our database
    const job = MOCK_JOBS.find(j => j.job_id === targetJobId);

    if (!job) {
        document.getElementById('title_job').textContent = "Job Not Found";
        document.getElementById('title_job').classList.add('text-red-500');
        return; // Stop running if the job doesn't exist
    }

    // C. Inject the data into the HTML elements!
    document.getElementById('title_job').textContent = job.title;
    document.getElementById('location_job').innerHTML = `<strong>📍 Location:</strong> ${job.location}`;
    document.getElementById('salary_job').innerHTML = `<strong>💰 Salary:</strong> <span class="text-green-600">${formatSalary(job.salary_monthly_min, job.salary_monthly_max)}</span>`;
    document.getElementById('hours_job').innerHTML = `<strong>🕐 Work Hours:</strong> ${job.work_hours}`;
    document.getElementById('skills_job').innerHTML = `<strong>🛠 Skills:</strong> <span class="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">${job.job_type}</span>`;
    
    document.getElementById('emp_name').innerHTML = `<strong>🏢 Employer:</strong> ${job.employer_name}`;
    document.getElementById('emp_ratings').innerHTML = `<strong>⭐ Ratings:</strong> ${job.rating} / 5.0`;
    document.getElementById('emp_hires').innerHTML = `<strong>🤝 Previous Hires:</strong> ${job.total_hires} women`;

    // D. Render Reviews
    const reviewsContainer = document.getElementById('reviews_container');
    if (job.reviews && job.reviews.length > 0) {
        let reviewsHTML = `<h3 class="font-bold text-lg mb-4">Reviews from other women:</h3> <div class="space-y-3">`;
        job.reviews.forEach(review => {
            reviewsHTML += `<div class="bg-gray-50 p-4 rounded-lg italic text-gray-700 border-l-4 border-pink-400"> ${review} </div>`;
        });
        reviewsHTML += `</div>`;
        reviewsContainer.innerHTML = reviewsHTML;
    } else {
        reviewsContainer.innerHTML = `<p class="text-gray-500">No reviews yet for this employer.</p>`;
    }

    // E. Setup Apply Button
    const applyBtn = document.getElementById('apply_btn');
    if (applyBtn) {
        applyBtn.addEventListener('click', () => {
            alert(`You have successfully applied for the role: ${job.title}!`);
            applyBtn.textContent = "Applied ✅";
            applyBtn.classList.replace('bg-green-400', 'bg-gray-400');
            applyBtn.disabled = true;
        });
    }
});