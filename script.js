document.addEventListener('DOMContentLoaded', () => {
    const jobListingsContainer = document.querySelector('.job-listings-container');
    const filterBarContainer = document.querySelector('.filter-bar-container');
    const activeFiltersDisplay = document.querySelector('.active-filters');
    const clearFiltersBtn = document.querySelector('.clear-filters-btn');

    let jobData = [];
    let activeFilters = [];

    async function fetchData() {
        try {
            const response = await fetch('./data.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} - Could not load data.json`);
            }
            jobData = await response.json();

            addFilter('Frontend');
            addFilter('CSS');
            addFilter('JavaScript');

        } catch (error) {
            console.error('Error fetching job data:', error);
            jobListingsContainer.innerHTML = '<p style="text-align: center; color: red; font-weight: bold;">Failed to load job listings. Please ensure "data.json" is in the correct directory and you are running on a local server (e.g., Live Server in VS Code).</p>';
            filterBarContainer.classList.remove('show');
        }
    }

    function createJobCard(job) {
        const card = document.createElement('div');
        card.classList.add('job-card');
        if (job.featured) {
            card.classList.add('featured');
        }

        let badgesHTML = '';
        if (job.new) {
            badgesHTML += '<span class="new-badge">NEW!</span>';
        }
        if (job.featured) {
            badgesHTML += '<span class="featured-badge">FEATURED</span>';
        }

        const allTags = [job.role, job.level, ...job.languages, ...job.tools];
        let tagsHTML = '';
        allTags.forEach(tag => {
            if (tag) {
                tagsHTML += `<span class="filter-tag" data-filter="${tag}">${tag}</span>`;
            }
        });

        card.innerHTML = `
            <img src="${job.logo}" alt="${job.company} logo">
            <div class="job-info">
                <div class="company-new-featured">
                    <span class="company-name">${job.company}</span>
                    ${badgesHTML}
                </div>
                <h2 class="position">${job.position}</h2>
                <div class="details">
                    <span>${job.postedAt}</span>
                    <span>${job.contract}</span>
                    <span>${job.location}</span>
                </div>
            </div>
            <div class="filters-container">
                ${tagsHTML}
            </div>
        `;
        return card;
    }

    function displayJobs(jobsToDisplay) {
        jobListingsContainer.innerHTML = '';
        if (jobsToDisplay.length === 0 && activeFilters.length > 0) {
            jobListingsContainer.innerHTML = '<p style="text-align: center; color: var(--dark-grayish-cyan);">No job listings match your current filters.</p>';
        } else if (jobsToDisplay.length === 0 && activeFilters.length === 0) {
             jobListingsContainer.innerHTML = '<p style="text-align: center; color: var(--dark-grayish-cyan);">No job listings available.</p>';
        } else {
            jobsToDisplay.forEach(job => {
                const jobCard = createJobCard(job);
                jobListingsContainer.appendChild(jobCard);
            });
        }

        document.querySelectorAll('.job-card .filter-tag').forEach(tag => {
            tag.addEventListener('click', (event) => {
                const filter = event.target.dataset.filter;
                addFilter(filter);
            });
        });
    }

    function addFilter(filter) {
        if (!activeFilters.includes(filter)) {
            activeFilters.push(filter);
            updateFilterBarUI();
            applyFilters();
        }
    }

    function removeFilter(filterToRemove) {
        activeFilters = activeFilters.filter(filter => filter !== filterToRemove);
        updateFilterBarUI();
        applyFilters();
    }

    function clearAllFilters() {
        activeFilters = [];
        updateFilterBarUI();
        applyFilters();
    }

    function updateFilterBarUI() {
        activeFiltersDisplay.innerHTML = '';
        if (activeFilters.length > 0) {
            filterBarContainer.classList.add('show');
            activeFilters.forEach(filter => {
                const filterTagItem = document.createElement('div');
                filterTagItem.classList.add('filter-tag-item');
                filterTagItem.innerHTML = `
                    <span>${filter}</span>
                    <button class="remove-filter-btn" data-filter="${filter}">X</button>
                `;
                activeFiltersDisplay.appendChild(filterTagItem);
            });

            document.querySelectorAll('.filter-tag-item .remove-filter-btn').forEach(btn => {
                btn.addEventListener('click', (event) => {
                    const filterToRemove = event.target.dataset.filter;
                    removeFilter(filterToRemove);
                });
            });
        } else {
            filterBarContainer.classList.remove('show');
        }
    }

    function applyFilters() {
        if (activeFilters.length === 0) {
            displayJobs(jobData);
            return;
        }

        const filteredJobs = jobData.filter(job => {
            const jobTags = [job.role, job.level, ...job.languages, ...job.tools].map(tag => tag ? tag.toLowerCase() : '');

            return activeFilters.every(filter => jobTags.includes(filter.toLowerCase()));
        });
        displayJobs(filteredJobs);
    }

    clearFiltersBtn.addEventListener('click', clearAllFilters);

    fetchData();
});