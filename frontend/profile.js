// Wait for the HTML to load completely before running the script
window.addEventListener('DOMContentLoaded', () => {

    // 1. Fetch User Data from our Fake Backend (localStorage)
    const userData = AuthService.getUserData();
    const activePhone = localStorage.getItem('activePhone'); // Phone isn't in getUserData by default, but it is the key!

    // 2. Populate the text fields (Name, Phone, Location)
    const nameEl = document.getElementById('pfp_name');
    const phoneEl = document.getElementById('pfp_phone');
    const locationEl = document.getElementById('pfp_location');

    if (nameEl && userData.name) {
        nameEl.textContent = `Name: ${userData.name}`;
    }
    
    if (phoneEl && activePhone) {
        phoneEl.textContent = `Phone Number: ${activePhone}`;
    }
    
    if (locationEl && userData.location) {
        locationEl.textContent = `Location: ${userData.location}`;
    }

    // 3. Populate the Skills Checkboxes
    // In auth.js, skill might be saved as a single string (from a dropdown) or an array. 
    // We convert it to an array so we can loop through it easily.
    if (userData.skill) {
        const skillsArray = Array.isArray(userData.skill) ? userData.skill : [userData.skill];
        
        skillsArray.forEach(skillValue => {
            // Find the checkbox that matches this specific skill value
            const checkbox = document.querySelector(`input[name="skill_pfp"][value="${skillValue}"]`);
            if (checkbox) {
                checkbox.checked = true; // Check it!
            }
        });
    }

    // 4. Handle the "Save" Button
    const saveBtn = document.getElementById('pfp_save_btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            // Gather all the currently checked skills
            const selectedSkills = Array.from(document.querySelectorAll('input[name="skill_pfp"]:checked')).map(cb => cb.value);

            // Package the data. We keep the old name, location, and language, but update the skills.
            const updatedData = {
                name: userData.name,
                location: userData.location,
                language: userData.language, 
                skill: selectedSkills // Saving the new array of skills
            };

            // Save to the fake database
            AuthService.saveProfile(updatedData);
            
            // Give the user feedback
            alert("Profile skills updated successfully!");
        });
    }

    // 5. Update the Navbar Greeting (Optional, keeps it consistent with the dashboard)
    const titleElement = document.querySelector('.font-script');
    if (userData.name && titleElement) {
        titleElement.textContent = `Welcome, ${userData.name}!`;
        titleElement.classList.replace('text-5xl', 'text-4xl');
    }
});