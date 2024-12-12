let reviewCounts = {
    red: 0,
    green: 0,
    yellow: 0,
    total: 0
};

document.addEventListener('DOMContentLoaded', function() {
    const startButton = document.getElementById('startAnalysis');
    const loadingElement = document.getElementById('loading');
    const statsElement = document.getElementById('stats');
    let isAnalyzing = false;

    // Initialize counts from localStorage
    reviewCounts = {
        red: parseInt(localStorage.getItem('redValue') || 0),
        green: parseInt(localStorage.getItem('greenValue') || 0),
        yellow: parseInt(localStorage.getItem('yellowValue') || 0),
        total: parseInt(localStorage.getItem('totalValue') || 0)
    };
    updateStats();

    startButton.addEventListener('click', async () => {
        try {
            startButton.disabled = true;
            loadingElement.style.display = 'block';
            statsElement.style.display = 'none';

            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            chrome.tabs.sendMessage(tab.id, { action: 'startAnalysis' });

            // Show success state
            setTimeout(() => {
                loadingElement.style.display = 'none';
                statsElement.style.display = 'block';
                updateStats();
                startButton.disabled = false;
            }, 2000);
        } catch (error) {
            console.error('Error:', error);
            loadingElement.style.display = 'none';
            startButton.disabled = false;
        }
    });
});

// Listen for count updates from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "updateReviewCount") {
        reviewCounts = message.counts;
        // Save to localStorage
        localStorage.setItem('redValue', reviewCounts.red);
        localStorage.setItem('greenValue', reviewCounts.green);
        localStorage.setItem('yellowValue', reviewCounts.yellow);
        localStorage.setItem('totalValue', reviewCounts.total);
        updateStats();
    }
});

function updateStats() {
    const statsContent = document.getElementById('statsContent');
    if (!statsContent) return;

    statsContent.innerHTML = `
        <div class="stat-item">
            <div class="stat-label">
                Potentially Fake
            </div>
            <div class="stat-value">${reviewCounts.red}</div>
        </div>
        <div class="stat-item">
            <div class="stat-label">
                 Suspicious
            </div>
            <div class="stat-value">${reviewCounts.yellow}</div>
        </div>
        <div class="stat-item">
            <div class="stat-label">
                Genuine
            </div>
            <div class="stat-value">${reviewCounts.green}</div>
        </div>
        <div class="stat-item">
            <div class="stat-label">
                Total Reviews
            </div>
            <div class="stat-value">${reviewCounts.total}</div>
        </div>
    `;
}

// Reset counts when window loads
window.addEventListener('load', function() {
    if (!localStorage.getItem('totalValue')) {
        localStorage.setItem('redValue', 0);
        localStorage.setItem('greenValue', 0);
        localStorage.setItem('yellowValue', 0);
        localStorage.setItem('totalValue', 0);
        reviewCounts = { red: 0, green: 0, yellow: 0, total: 0 };
        updateStats();
    }
});