document.addEventListener('DOMContentLoaded', () => {
    fetchGithubPlannedIssues();
});
async function fetchGithubPlannedIssues() {

    const githubIssuesContainer = document.getElementById('github-planned-issues-container');
    const githubLoadingMessage = document.getElementById('github-loading-message');

    // IMPORTANT: Replace with your actual GitHub username and repository name
    // Example: 'octocat', 'Spoon-Knife'
    const githubOwner = '10xInsights-dev'; // Replace with your GitHub username
    const githubRepo = '10xInsights-dev.github.io'; // Replace with your repository name
    const issueLabel = 'planned'; // The specific tag/label you want to filter by

    // Construct the GitHub API URL for issues, filtered by label and state
    const githubApiUrl = `https://api.github.com/repos/${githubOwner}/${githubRepo}/issues?labels=${issueLabel}&state=open`;
    const proxiedGithubUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(githubApiUrl)}`;

    try {
        const response = await fetch(proxiedGithubUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} from ${proxiedGithubUrl}`);
        }
        const data = await response.json();

        if (data.contents) {
            const issues = JSON.parse(data.contents);
            githubLoadingMessage.remove(); // Remove loading message

            if (issues.length === 0) {
                githubIssuesContainer.innerHTML = `<p class="text-center text-muted">No candidates found "${issueLabel}" tag.</p>`;
                return;
            }

            // Create an unordered list to display the issue titles
            const ul = document.createElement('ul');
            ul.className = 'list-group'; // Bootstrap list styling

            issues.forEach(issue => {
                const li = document.createElement('li');
                li.className = 'list-group-item d-flex justify-content-between align-items-center';

                // Make the issue title clickable, linking to the GitHub issue
                li.innerHTML = `
                                <a href="${issue.html_url}" target="_blank" rel="noopener noreferrer" class="text-decoration-none text-dark fw-semibold">
                                    ${issue.title}
                                </a>
                                <span class="badge bg-secondary rounded-pill">${issue.labels.map(label => label.name).join(', ')}</span>
                            `;
                ul.appendChild(li);
            });
            githubIssuesContainer.appendChild(ul);

        } else {
            githubIssuesContainer.innerHTML = '<p class="text-center text-danger">Failed to load planned issues.</p>';
        }

    } catch (error) {
        console.error('Error fetching GitHub issues:', error);
        githubIssuesContainer.innerHTML = `<p class="text-center text-danger">Error loading planned issues: ${error.message}</p>`;
    }
}