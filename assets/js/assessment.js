// Tier 1 Assessment Logic
class AssessmentManager {
    constructor() {
        this.currentQuestion = 0;
        this.answers = {};
        this.questions = this.getQuestions();
        this.init();
    }

    init() {
        this.form = document.getElementById('tier1-assessment-form');
        this.container = document.getElementById('assessment-questions');
        this.prevBtn = document.getElementById('prev-btn');
        this.nextBtn = document.getElementById('next-btn');
        this.submitBtn = document.getElementById('submit-btn');
        this.progressBar = document.querySelector('.progress-fill');

        if (this.form) {
            this.setupEventListeners();
            this.loadQuestions();
            this.checkSavedData();
        }
    }

    getQuestions() {
        return [
            {
                id: 'property_address',
                question: 'What is your property address?',
                type: 'address',
                required: true,
                placeholder: 'Enter your property address',
                help: 'We use this to check local zoning laws and property details.'
            },
            {
                id: 'primary_use',
                question: 'What is the primary use of your ADU?',
                type: 'select',
                required: true,
                options: [
                    { value: 'rental', label: 'Rental Income' },
                    { value: 'family', label: 'Family Member Housing' },
                    { value: 'office', label: 'Home Office/Studio' },
                    { value: 'airbnb', label: 'Short-term Rental (Airbnb)' },
                    { value: 'other', label: 'Other' }
                ]
            },
            {
                id: 'lot_size',
                question: 'What is your approximate lot size?',
                type: 'select',
                required: true,
                options: [
                    { value: 'small', label: 'Less than 5,000 sq ft' },
                    { value: 'medium', label: '5,000 - 7,500 sq ft' },
                    { value: 'large', label: '7,500 - 10,000 sq ft' },
                    { value: 'xlarge', label: 'More than 10,000 sq ft' },
                    { value: 'unsure', label: "I'm not sure" }
                ]
            },
            {
                id: 'budget_range',
                question: 'What is your estimated budget?',
                type: 'select',
                required: true,
                options: [
                    { value: 'budget', label: 'Under $100k' },
                    { value: 'standard', label: '$100k - $200k' },
                    { value: 'premium', label: '$200k - $300k' },
                    { value: 'luxury', label: 'Over $300k' }
                ]
            },
            {
                id: 'timeline',
                question: 'When do you want to start construction?',
                type: 'select',
                required: true,
                options: [
                    { value: 'immediate', label: 'Within 3 months' },
                    { value: 'soon', label: '3-6 months' },
                    { value: 'planning', label: '6-12 months' },
                    { value: 'exploring', label: 'Just exploring options' }
                ]
            },
            {
                id: 'financing',
                question: 'How do you plan to finance your ADU?',
                type: 'select',
                required: true,
                options: [
                    { value: 'cash', label: 'Cash/Savings' },
                    { value: 'heloc', label: 'Home Equity Line of Credit' },
                    { value: 'construction', label: 'Construction Loan' },
                    { value: 'combination', label: 'Combination of Sources' },
                    { value: 'unsure', label: 'Not sure yet' }
                ]
            }
        ];
    }

    setupEventListeners() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.prevBtn.addEventListener('click', () => this.previousQuestion());
        this.nextBtn.addEventListener('click', () => this.nextQuestion());

        // Auto-save on input
        this.form.addEventListener('input', () => this.saveProgress());
    }

    loadQuestions() {
        this.renderQuestion();
    }

    renderQuestion() {
        const question = this.questions[this.currentQuestion];
        
        let html = `
            <div class="question-wrapper" data-question="${this.currentQuestion}">
                <h3 class="question-title">Question ${this.currentQuestion + 1} of ${this.questions.length}</h3>
                <label class="question-label">${question.question}</label>
        `;

        switch (question.type) {
            case 'address':
                html += `
                    <input type="text" 
                           id="${question.id}" 
                           name="${question.id}"
                           class="form-input" 
                           placeholder="${question.placeholder || ''}"
                           ${question.required ? 'required' : ''}
                           value="${this.answers[question.id] || ''}">
                    <div id="address-suggestions" class="address-suggestions"></div>
                `;
                break;

            case 'select':
                html += `
                    <select id="${question.id}" 
                            name="${question.id}"
                            class="form-select" 
                            ${question.required ? 'required' : ''}>
                        <option value="">Choose an option...</option>
                        ${question.options.map(opt => `
                            <option value="${opt.value}" 
                                    ${this.answers[question.id] === opt.value ? 'selected' : ''}>
                                ${opt.label}
                            </option>
                        `).join('')}
                    </select>
                `;
                break;
        }

        if (question.help) {
            html += `<p class="question-help">${question.help}</p>`;
        }

        html += '</div>';

        this.container.innerHTML = html;

        // Setup address autocomplete if needed
        if (question.type === 'address') {
            this.setupAddressAutocomplete(question.id);
        }

        // Update progress and navigation
        this.updateProgress();
        this.updateNavigation();
    }

    setupAddressAutocomplete(inputId) {
        const input = document.getElementById(inputId);
        const suggestionsDiv = document.getElementById('address-suggestions');

        // In production, this would use Google Places API
        // For now, simulate with timeout
        let timeout;
        input.addEventListener('input', (e) => {
            clearTimeout(timeout);
            const value = e.target.value;
            
            if (value.length > 3) {
                timeout = setTimeout(() => {
                    // Simulated suggestions
                    const suggestions = [
                        `${value}, San Francisco, CA`,
                        `${value}, Oakland, CA`,
                        `${value}, Berkeley, CA`
                    ];
                    
                    suggestionsDiv.innerHTML = suggestions.map(s => 
                        `<div class="suggestion-item" onclick="assessmentManager.selectAddress('${s}')">${s}</div>`
                    ).join('');
                    suggestionsDiv.style.display = 'block';
                }, 300);
            } else {
                suggestionsDiv.style.display = 'none';
            }
        });

        // Hide suggestions on click outside
        document.addEventListener('click', (e) => {
            if (!input.contains(e.target) && !suggestionsDiv.contains(e.target)) {
                suggestionsDiv.style.display = 'none';
            }
        });
    }

    selectAddress(address) {
        const input = document.querySelector('input[name="property_address"]');
        if (input) {
            input.value = address;
            this.answers.property_address = address;
            document.getElementById('address-suggestions').style.display = 'none';
        }
    }

    updateProgress() {
        const progress = ((this.currentQuestion + 1) / this.questions.length) * 100;
        this.progressBar.style.width = `${progress}%`;
    }

    updateNavigation() {
        // Previous button
        this.prevBtn.style.display = this.currentQuestion > 0 ? 'flex' : 'none';
        
        // Next/Submit button
        if (this.currentQuestion === this.questions.length - 1) {
            this.nextBtn.style.display = 'none';
            this.submitBtn.style.display = 'flex';
        } else {
            this.nextBtn.style.display = 'flex';
            this.submitBtn.style.display = 'none';
        }
    }

    previousQuestion() {
        if (this.currentQuestion > 0) {
            this.saveCurrentAnswer();
            this.currentQuestion--;
            this.renderQuestion();
        }
    }

    nextQuestion() {
        if (this.validateCurrentQuestion()) {
            this.saveCurrentAnswer();
            if (this.currentQuestion < this.questions.length - 1) {
                this.currentQuestion++;
                this.renderQuestion();
            }
        }
    }

    validateCurrentQuestion() {
        const question = this.questions[this.currentQuestion];
        const input = document.getElementById(question.id);
        
        if (question.required && !input.value) {
            this.showError('Please answer this question before continuing.');
            input.focus();
            return false;
        }

        return true;
    }

    saveCurrentAnswer() {
        const question = this.questions[this.currentQuestion];
        const input = document.getElementById(question.id);
        if (input) {
            this.answers[question.id] = input.value;
        }
    }

    saveProgress() {
        this.saveCurrentAnswer();
        const data = {
            answers: this.answers,
            currentQuestion: this.currentQuestion,
            timestamp: Date.now()
        };
        localStorage.setItem('adu_assessment_draft', JSON.stringify(data));
    }

    checkSavedData() {
        const saved = localStorage.getItem('adu_assessment_draft');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                if (data.answers) {
                    this.answers = data.answers;
                    // Don't auto-jump to saved question on page load
                    // Let user click resume if they want
                }
            } catch (e) {
                console.error('Error loading saved data:', e);
            }
        }
    }

    loadSavedData() {
        const saved = localStorage.getItem('adu_assessment_draft');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                if (data.answers) {
                    this.answers = data.answers;
                    this.currentQuestion = data.currentQuestion || 0;
                    this.renderQuestion();
                }
            } catch (e) {
                console.error('Error loading saved data:', e);
            }
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        if (!this.validateCurrentQuestion()) {
            return;
        }

        this.saveCurrentAnswer();

        // Show loading state
        this.submitBtn.disabled = true;
        this.submitBtn.innerHTML = `
            <span class="spinner"></span>
            Analyzing your property...
        `;

        try {
            // Call Cloud Function to process assessment
            const processAssessment = functions.httpsCallable('processAssessment');
            const result = await processAssessment({
                answers: this.answers,
                timestamp: new Date().toISOString()
            });

            // Clear saved draft
            localStorage.removeItem('adu_assessment_draft');

            // Redirect to results page
            window.location.href = `/assessment/${result.data.assessmentId}`;

        } catch (error) {
            console.error('Error submitting assessment:', error);
            this.showError('Something went wrong. Please try again.');
            
            // Reset button
            this.submitBtn.disabled = false;
            this.submitBtn.innerHTML = `
                Get My Report
                <span class="material-icons">assessment</span>
            `;
        }
    }

    showError(message) {
        if (window.app) {
            window.app.showToast(message, 'error');
        } else {
            alert(message);
        }
    }
}

// Initialize assessment manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.assessmentManager = new AssessmentManager();
});

// Add assessment-specific styles
const assessmentStyles = document.createElement('style');
assessmentStyles.textContent = `
    .question-wrapper {
        animation: fadeIn 0.3s ease-out;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    .question-title {
        font-size: 14px;
        color: var(--text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 16px;
    }
    
    .question-label {
        font-size: 24px;
        font-weight: 600;
        display: block;
        margin-bottom: 24px;
        line-height: 1.3;
    }
    
    .form-input, .form-select {
        width: 100%;
        padding: 16px;
        border: 2px solid var(--border);
        border-radius: 8px;
        font-size: 16px;
        transition: border-color 0.2s;
    }
    
    .form-input:focus, .form-select:focus {
        outline: none;
        border-color: var(--primary);
    }
    
    .question-help {
        font-size: 14px;
        color: var(--text-secondary);
        margin-top: 8px;
    }
    
    .address-suggestions {
        display: none;
        position: absolute;
        background: var(--surface);
        border: 1px solid var(--border);
        border-top: none;
        border-radius: 0 0 8px 8px;
        max-height: 200px;
        overflow-y: auto;
        width: 100%;
        z-index: 100;
    }
    
    .suggestion-item {
        padding: 12px 16px;
        cursor: pointer;
        transition: background 0.2s;
    }
    
    .suggestion-item:hover {
        background: var(--background);
    }
    
    .spinner {
        display: inline-block;
        width: 16px;
        height: 16px;
        border: 2px solid rgba(255,255,255,0.3);
        border-top-color: white;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
    }
`;
document.head.appendChild(assessmentStyles);