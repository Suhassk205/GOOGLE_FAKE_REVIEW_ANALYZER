(function() {
    console.log("Review Analyzer Extension Started");

    let processedReviews = new Set();
    let isAnalyzing = false;

    function getRandomScore() {
        return Math.floor(Math.random() * 10) + 1;  // Returns 1-10
    }

    function getRandomClass() {
        const random = Math.random();
        return {
            type: random < 0.33 ? 'red' : 
                  random < 0.66 ? 'yellow' : 'green',
            text: random < 0.33 ? 'Fake' : 
                  random < 0.66 ? 'Suspicious' : 'Genuine',
            confidence: Math.floor(Math.random() * 30) + 70 // 70-100%
        };
    }

    function createScoreModal(result) {
        const scores = {
            grammar: getRandomScore(),
            length: getRandomScore(),
            sentiment: getRandomScore(),
            content: getRandomScore()
        };
        
        const finalScore = Math.round(
            (scores.grammar + scores.length + scores.sentiment + scores.content) / 4
        );

        const overlay = document.createElement('div');
        overlay.className = 'feedback-overlay';
        
        const scoreCard = document.createElement('div');
        scoreCard.className = 'score-card';
        scoreCard.innerHTML = `
            <h3>Review Analysis Scores</h3>
            
            <div class="score-item">
                <div class="score-label">Grammar Score</div>
                <div class="progress-bar-container">
                    <div class="progress-bar" style="width: ${scores.grammar * 10}%">
                        <span>${scores.grammar}/10</span>
                    </div>
                </div>
            </div>

            <div class="score-item">
                <div class="score-label">Length Score</div>
                <div class="progress-bar-container">
                    <div class="progress-bar" style="width: ${scores.length * 10}%">
                        <span>${scores.length}/10</span>
                    </div>
                </div>
            </div>

            <div class="score-item">
                <div class="score-label">Sentiment Score</div>
                <div class="progress-bar-container">
                    <div class="progress-bar" style="width: ${scores.sentiment * 10}%">
                        <span>${scores.sentiment}/10</span>
                    </div>
                </div>
            </div>

            <div class="score-item">
                <div class="score-label">Content Score</div>
                <div class="progress-bar-container">
                    <div class="progress-bar" style="width: ${scores.content * 10}%">
                        <span>${scores.content}/10</span>
                    </div>
                </div>
            </div>

            <div class="score-item final-score">
                <div class="score-label">Final Score</div>
                <div class="progress-bar-container">
                    <div class="progress-bar" style="width: ${finalScore * 10}%">
                        <span>${finalScore}/10</span>
                    </div>
                </div>
            </div>

            <button class="close-btn">Close</button>
        `;

        overlay.appendChild(scoreCard);
        document.body.appendChild(overlay);

        const closeBtn = scoreCard.querySelector('.close-btn');
        closeBtn.addEventListener('click', () => overlay.remove());
    }

    function createFeedbackForm() {
        const overlay = document.createElement('div');
        overlay.className = 'feedback-overlay';
        
        const form = document.createElement('div');
        form.className = 'feedback-form';
        form.innerHTML = `
            <h3>Review Analysis Feedback</h3>
            
            <div class="feedback-options">
                <p>Why do you think this analysis is incorrect?</p>
                <label>
                    <input type="radio" name="feedback-reason" value="wrong-classification">
                    Wrong classification
                </label>
                <label>
                    <input type="radio" name="feedback-reason" value="confidence-score">
                    Incorrect confidence score
                </label>
                <label>
                    <input type="radio" name="feedback-reason" value="review-content">
                    Review content suggests otherwise
                </label>
                <label>
                    <input type="radio" name="feedback-reason" value="other">
                    Other reason
                </label>
            </div>

            <div class="feedback-text">
                <p>Additional Comments:</p>
                <textarea placeholder="Please provide more details..." rows="4"></textarea>
            </div>

            <div class="feedback-buttons">
                <button class="submit-btn">Submit</button>
                <button class="cancel-btn">Cancel</button>
            </div>
        `;

        overlay.appendChild(form);
        document.body.appendChild(overlay);

        const submitBtn = form.querySelector('.submit-btn');
        const cancelBtn = form.querySelector('.cancel-btn');

        submitBtn.addEventListener('click', () => {
            const reason = form.querySelector('input[name="feedback-reason"]:checked')?.value;
            if (!reason) {
                alert('Please select a reason for your feedback');
                return;
            }
            overlay.remove();
        });

        cancelBtn.addEventListener('click', () => overlay.remove());
    }

    function processReview(reviewElement) {
        if (processedReviews.has(reviewElement)) return;
        
        const result = getRandomClass();
        
        const flagContainer = document.createElement('div');
        flagContainer.className = 'flag-container';
        
        const flag = document.createElement('div');
        flag.className = `review-flag ${result.type}`;
        flag.textContent = `${result.text} (${result.confidence}%)`;
        flag.addEventListener('click', () => createScoreModal(result));
        
        const feedbackBtn = document.createElement('button');
        feedbackBtn.className = 'feedback-button';
        feedbackBtn.textContent = 'Feedback';
        feedbackBtn.addEventListener('click', createFeedbackForm);
        
        flagContainer.appendChild(flag);
        flagContainer.appendChild(feedbackBtn);
        
        reviewElement.style.position = 'relative';
        reviewElement.insertBefore(flagContainer, reviewElement.firstChild);
        
        processedReviews.add(reviewElement);
    }

    function findAndProcessReviews() {
        try {
            const reviews = document.querySelectorAll('.jftiEf');
            console.log(`Found ${reviews.length} reviews`);
            
            reviews.forEach(review => {
                if (!review.hasAttribute('data-processed')) {
                    review.setAttribute('data-processed', 'true');
                    processReview(review);
                }
            });
        } catch (error) {
            console.error('Error processing reviews:', error);
        }
    }

    // Message listener
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        try {
            if (message.action === 'startAnalysis') {
                console.log('Starting analysis...');
                isAnalyzing = true;
                findAndProcessReviews();
                sendResponse({ status: 'Analysis started' });
            }
            return true;
        } catch (error) {
            console.error('Error:', error);
            sendResponse({ status: 'error', message: error.message });
            return true;
        }
    });

    // Scroll handler
    window.addEventListener('scroll', () => {
        if (isAnalyzing) {
            findAndProcessReviews();
        }
    });

    console.log('Review analyzer ready');
})();