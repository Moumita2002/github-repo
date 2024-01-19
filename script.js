let currentPage = 1;
let totalPages = 1; // Initialize totalPages

async function fetchUserDetails() {
    const username = document.getElementById('username').value;
    const userProfileElement = document.getElementById('userProfile');
    const repoListElement = document.getElementById('repoList');
    const loader = document.getElementById('loader');
    const paginationElement = document.getElementById('pagination');

    try {
        loader.style.display = 'block';

        // Fetch user details
        const userResponse = await fetch(`https://api.github.com/users/${username}`);
        const user = await userResponse.json();

        // Display user details
        userProfileElement.innerHTML = `
                    <div class="photo">
                    <img class="pro" src="${user.avatar_url}" alt="Profile Photo">
                    <p id="gitlink">https://github.com/${user.login}</p>
                    </div>
                    <div class="user">
                    <h1>${user.name || username}</h1>
                    <p style="font-weight:bold;">Bio: ${user.bio || 'No bio available'}</p>

                    <p class="loca"><img src="loc.png" class="loc">${user.location || 'Not specified'}</p>
                    <p>${user.twitter_username ? `<p>Twitter: <a href="https://twitter.com/${user.twitter_username}" target="_blank">${user.twitter_username}</a></p>` : ''}</p>

                    <p>${user.linkedin ? `<p>LinkedIn: <a href="${user.linkedin}" target="_blank">LinkedIn Profile</a></p>` : ''}</p>

                    </div>
                `;

        // Fetch user repositories
        const response = await fetch(`https://api.github.com/users/${username}/repos?page=1&per_page=100`);
        const repositories = await response.json();

        repoListElement.innerHTML = '';

        repositories.slice((currentPage - 1) * 10, currentPage * 10).forEach(repo => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                        <h2 style="color: blue;">${repo.name}</h2>
                        <p>${repo.description || 'No description available'}</p>
                        <div class="languages" id="languages-${repo.name}"></div>
                        <a href="${repo.html_url}" target="_blank">Show</a>
                    `;
            repoListElement.appendChild(listItem);

            fetchLanguages(username, repo.name);
        });

        // Update totalPages based on the total number of repositories for the user
        totalPages = Math.ceil(repositories.length / 10);

        updatePagination();
    } catch (error) {
        console.error('Error fetching user details:', error);
        userProfileElement.innerHTML = '<p>Error fetching user details</p>';
        repoListElement.innerHTML = '<li>Error fetching repositories</li>';
    } finally {
        loader.style.display = 'none';
    }
}

async function fetchRepositories(page) {
    currentPage = page;
    fetchUserDetails();
}

async function fetchLanguages(username, repoName) {
    const languagesElement = document.getElementById(`languages-${repoName}`);
    try {
        const response = await fetch(`https://api.github.com/repos/${username}/${repoName}/languages`);
        const languages = await response.json();
        const languageList = Object.keys(languages);

        languageList.forEach(language => {
            const languageSpan = document.createElement('span');
            languageSpan.textContent = language;
            languagesElement.appendChild(languageSpan);
        });
    } catch (error) {
        console.error(`Error fetching languages for ${repoName}:`, error);
        languagesElement.textContent = 'Error fetching languages';
    }
}

function updatePagination() {
    const paginationElement = document.getElementById('pagination');
    paginationElement.innerHTML = '';

    const prevButton = document.createElement('button');
    prevButton.textContent = '<<';
    prevButton.onclick = () => fetchRepositories(currentPage - 1);
    prevButton.disabled = currentPage === 1;
    paginationElement.appendChild(prevButton);

    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.onclick = () => fetchRepositories(i);

        // Add a class to highlight the current page
        button.classList.toggle('current-page', i === currentPage);

        paginationElement.appendChild(button);
    }

    const nextButton = document.createElement('button');
    nextButton.textContent = '>>';
    nextButton.onclick = () => fetchRepositories(currentPage + 1);
    nextButton.disabled = currentPage === totalPages;
    paginationElement.appendChild(nextButton);
}
