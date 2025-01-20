// API Base URL (Update this if your backend runs on a different port)
const API_BASE_URL = 'http://localhost:5000/api';

// Sidebar Navigation
const sidebarLinks = document.querySelectorAll("aside ul li a");
const sections = document.querySelectorAll("section");
const dashboardSection = document.getElementById("dashboard");
const issuesSection = document.getElementById("issues");
const newIssueFormSection = document.getElementById("newIssueForm");
const resolvedIssueFormSection = document.getElementById("resolvedIssueForm");

function showSection(sectionId) {
    // Hide all sections
    sections.forEach(section => {
        section.style.display = 'none';
    });

    // Show the selected section
    const selectedSection = document.getElementById(sectionId);
    if (selectedSection) {
        selectedSection.style.display = 'block';
    }

    // Update active link in sidebar
    sidebarLinks.forEach(link => {
        link.classList.remove("active");
        if (link.getAttribute("href") === `#${sectionId}`) {
            link.classList.add("active");
        }
    });
}

sidebarLinks.forEach(link => {
    link.addEventListener("click", function (event) {
        event.preventDefault();

        const targetId = this.getAttribute("href").substring(1); // Remove the # from the href

        // Show the corresponding section
        showSection(targetId);

        // Fetch and display issues if Issues section is active
        if (targetId === 'issues') {
            fetchIssues();
        }

        // Fetch and render charts if the Dashboard section is active
        if (targetId === 'dashboard') {
            renderDashboardCharts();
        }
    });
});

// New Issue Form
const newIssueForm = document.getElementById('newForm');
const newNameInput = document.getElementById('newName');
const newTitleInput = document.getElementById('newTitle');
const newDescriptionInput = document.getElementById('newDescription');
const newSeverityInput = document.getElementById('newSeverity');

newIssueForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const newIssue = {
        name: newNameInput.value,
        title: newTitleInput.value,
        description: newDescriptionInput.value,
        severity: newSeverityInput.value
    };

    try {
        const response = await fetch(`${API_BASE_URL}/issues`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newIssue)
        });

        if (response.ok) {
            const data = await response.json();
            console.log('New issue created:', data);
            alert('Issue Created Successfully');

            // Clear the form fields
            newNameInput.value = '';
            newTitleInput.value = '';
            newDescriptionInput.value = '';
            newSeverityInput.value = 'Low'; // Reset to default value

            // Optionally, switch back to the dashboard or issues page
            showSection('dashboard'); // Assuming you want to go back to the dashboard
        } else {
            const errorData = await response.json();
            console.error('Error creating issue:', errorData);
            alert('Failed to create issue. Please try again.');
        }
    } catch (error) {
        console.error('Network error:', error);
        alert('An error occurred. Please check your network connection.');
    }
});

// Resolved Issue Form
const resolveIssueForm = document.getElementById('resolveForm');
const resolvedIdInput = document.getElementById('resolvedId');

resolveIssueForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const issueId = resolvedIdInput.value;

    try {
        const response = await fetch(`${API_BASE_URL}/issues/${issueId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ type: 'resolved' }) // Update the type to 'resolved'
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Issue resolved:', data);
            alert('Issue Resolved Successfully');
            resolvedIdInput.value = ''; // Clear the input field

            // Optionally, switch back to the dashboard or issues page
            showSection('dashboard'); // Assuming you want to go back to the dashboard
        } else {
            const errorData = await response.json();
            console.error('Error resolving issue:', errorData);
            alert('Failed to resolve issue. Please try again.');
        }
    } catch (error) {
        console.error('Network error:', error);
        alert('An error occurred. Please check your network connection.');
    }
});

// Function to Fetch and Display Issues
const issuesList = document.getElementById('issuesList');

async function fetchIssues() {
    try {
        const response = await fetch(`${API_BASE_URL}/issues`);

        if (response.ok) {
            const issues = await response.json();
            displayIssues(issues);
        } else {
            const errorData = await response.json();
            console.error('Error fetching issues:', errorData);
            issuesList.innerHTML = '<p>Error fetching issues. Please try again.</p>';
        }
    } catch (error) {
        console.error('Network error:', error);
        issuesList.innerHTML = '<p>An error occurred. Please check your network connection.</p>';
    }
}

// Function to Display Issues in the Issues Section
function displayIssues(issues) {
    issuesList.innerHTML = ''; // Clear the list

    if (issues.length === 0) {
        issuesList.innerHTML = '<p>No issues found.</p>';
        return;
    }

    const table = document.createElement('table');
    table.className = 'table-auto w-full';
    table.innerHTML = `
    <thead>
      <tr>
        <th class="px-4 py-2">ID</th>
        <th class="px-4 py-2">Title</th>
        <th class="px-4 py-2">Description</th>
        <th class="px-4 py-2">Severity</th>
        <th class="px-4 py-2">Status</th>
        <th class="px-4 py-2">Created By</th>
      </tr>
    </thead>
    <tbody>
    </tbody>
  `;
    const tbody = table.querySelector('tbody');

    issues.forEach(issue => {
        const row = document.createElement('tr');
        row.innerHTML = `
      <td class="border px-4 py-2">${issue.id}</td>
      <td class="border px-4 py-2">${issue.title}</td>
      <td class="border px-4 py-2">${issue.description}</td>
      <td class="border px-4 py-2">${issue.severity}</td>
      <td class="border px-4 py-2">${issue.type}</td>
      <td class="border px-4 py-2">${issue.name}</td>
    `;
        tbody.appendChild(row);
    });

    issuesList.appendChild(table);
}

// Button to show New Issue Form
const newIssueBtn = document.getElementById("newIssueBtn");
newIssueBtn.addEventListener("click", () => {
    showSection('newIssueForm');
});

// Button to show Resolved Issue Form
const resolvedIssueBtn = document.getElementById("resolvedIssueBtn");
resolvedIssueBtn.addEventListener("click", () => {
    showSection('resolvedIssueForm');
});

// Chart.js Setup
// Assuming Chart.js is loaded via a <script> tag in your HTML

// Function to Fetch and Render Charts
async function renderDashboardCharts() {
    

    // Fetch Data from APIs
    try {
        const severityData = await fetchChartData('charts/severity');
        const statusData = await fetchChartData('charts/status');
        const timelineData = await fetchChartData('charts/timeline');
        const assigneeData = await fetchChartData('charts/assignee');

        // Render Charts
        renderSeverityChart(severityData);
        renderStatusChart(statusData);
        renderTimelineChart(timelineData);
        renderAssigneeChart(assigneeData);
    } catch (error) {
        console.error("Error fetching or rendering charts:", error);
        displayChartErrorMessages(); // Handle errors
    }
}

// Helper Function to Fetch Chart Data
async function fetchChartData(endpoint) {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`);
    if (!response.ok) {
        const errorData = await response.json(); // Try to get error details from response
        console.error(`API request failed for ${endpoint} with status ${response.status}:`, errorData);
        throw new Error(`API request failed for ${endpoint} with status ${response.status}`);
    }
    const data = await response.json();

    // Log the fetched data for debugging purposes
    console.log(`Data fetched for ${endpoint}:`, data);

    return data;
}

// Function to Show Loading States
function showChartLoadingStates() {
    const chartContainers = document.querySelectorAll('.chart');
    chartContainers.forEach(container => {
        container.innerHTML = '<p>Loading...</p>'; // Simple loading message
    });
}

// Function to Display Error Messages
function displayChartErrorMessages() {
    const chartContainers = document.querySelectorAll('.chart');
    chartContainers.forEach(container => {
        container.innerHTML = '<p>Error loading chart data.</p>';
    });
}

// Function to Render Severity Pie Chart
function renderSeverityChart(chartData) {
    const canvas = document.getElementById('severityChart');
    console.log("Canvas element:", canvas); // Check if canvas is null
    if (!canvas) {
        console.error("Canvas element not found for severityChart");
        return;
    }
    const ctx = canvas.getContext('2d');

    console.log("Rendering Severity Chart with data:", chartData); // Log the data
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: chartData.labels,
            datasets: [{
                data: chartData.data,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.5)',
                    'rgba(255, 159, 64, 0.5)',
                    'rgba(255, 205, 86, 0.5)',
                    'rgba(75, 192, 192, 0.5)'
                ],
                borderColor: [
                    'rgb(255, 99, 132)',
                    'rgb(255, 159, 64)',
                    'rgb(255, 205, 86)',
                    'rgb(75, 192, 192)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
        }
    });

}

// Function to Render Status Donut Chart
function renderStatusChart(chartData) {
    const canvas = document.getElementById('statusChart');

    console.log("Canvas element:", canvas); // Check if canvas is null
    if (!canvas) {
        console.error("Canvas element not found for severityChart");
        return;
    }
    const ctx = canvas.getContext('2d');
    console.log("Rendering Status Chart with data:", chartData); // Log the data

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: chartData.labels,
            datasets: [{
                data: chartData.data,
                backgroundColor: [
                    'rgba(54, 162, 235, 0.5)',
                    'rgba(255, 205, 86, 0.5)',
                    'rgba(75, 192, 192, 0.5)'
                ],
                borderColor: [
                    'rgb(54, 162, 235)',
                    'rgb(255, 205, 86)',
                    'rgb(75, 192, 192)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
        }
    });
}

// Function to Render Timeline Line Chart
function renderTimelineChart(chartData) {
    const canvas = document.getElementById('timeChart');
    console.log("Canvas element:", canvas); // Check if canvas is null
    if (!canvas) {
        console.error("Canvas element not found for severityChart");
        return;
    }
    const ctx = canvas.getContext('2d');
    console.log("Rendering Timeline Chart with data:", chartData); // Log the data
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartData.labels, // e.g., months
            datasets: chartData.datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Function to Render Assignee Stacked Bar Chart
function renderAssigneeChart(chartData) {
    const canvas = document.getElementById('assigneeChart');
    console.log("Canvas element:", canvas); // Check if canvas is null
    if (!canvas) {
        console.error("Canvas element not found for severityChart");
        return;
    }
    const ctx = canvas.getContext('2d');
    console.log("Rendering Assignee Chart with data:", chartData); // Log the data
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: chartData.labels, // Assignee names
            datasets: chartData.datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    stacked: true
                },
                y: {
                    stacked: true,
                    beginAtZero: true
                }
            }
        }
    });
}
document.addEventListener('DOMContentLoaded', () => {
    // Show the dashboard by default
    showSection('dashboard');
    // Optionally, if you want to pre-render the charts on load:
    renderDashboardCharts();
});