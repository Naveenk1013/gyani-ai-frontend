const API_BASE_URL = 'https://gyani-ai-backend.onrender.com';

class GyaniAI {
    constructor() {
        this.currentRequest = null;
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Enter key with Ctrl to submit
        document.getElementById('prompt').addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                this.generateContent();
            }
        });
    }

    async generateContent() {
        const prompt = document.getElementById('prompt').value.trim();
        const model = document.getElementById('model').value;

        if (!prompt) {
            alert('Please enter a research prompt.');
            return;
        }

        this.showLoading(true);
        this.clearOutput();

        try {
            this.currentRequest = fetch(`${API_BASE_URL}/ai?prompt=${encodeURIComponent(prompt)}&model=${encodeURIComponent(model)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const response = await this.currentRequest;
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            if (data.error) throw new Error(data.error);
            this.displayOutput(data.response, model);
        } catch (error) {
            console.error('Error:', error);
            this.displayError(`An error occurred: ${error.message}. Please try again or contact support.`);
        } finally {
            this.showLoading(false);
            this.currentRequest = null;
        }
    }

    displayOutput(content, model) {
        const outputDiv = document.getElementById('output');
        const formattedContent = this.formatResearchContent(content);

        const outputHTML = `
            <div class="output-header">
                <small>Generated with: <strong>${this.getModelName(model)}</strong></small>
                <button class="copy-btn" onclick="gyaniAI.copyToClipboard()">Copy to Clipboard</button>
            </div>
            <div class="research-content">${formattedContent}</div>
        `;

        outputDiv.innerHTML = outputHTML;
    }

    formatResearchContent(content) {
        return content
            .replace(/\n\s*\n/g, '</p><p>')
            .replace(/\n/g, '<br>')
            .replace(/^(#+)\s*(.*)$/gm, (match, hashes, text) => {
                const level = hashes.length;
                return `<h${level}>${text}</h${level}>`;
            })
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>');
    }

    getModelName(modelId) {
        const modelNames = {
            'meta-llama/llama-3.1-405b-instruct': 'Llama 3.1 405B',
            'qwen/qwen-2.5-coder-32b-instruct': 'Qwen2.5 Coder 32B',
            'qwen/qwen-2.5-72b-instruct': 'Qwen2.5 72B',
            'qwen/qwen2.5-vl-32b-instruct': 'Qwen2.5 VL 32B'
        };
        return modelNames[modelId] || modelId;
    }

    displayError(message) {
        const outputDiv = document.getElementById('output');
        outputDiv.innerHTML = `
            <div class="error">
                <h3>❌ Error</h3>
                <p>${message}</p>
            </div>
        `;
    }

    clearOutput() {
        const outputDiv = document.getElementById('output');
        outputDiv.innerHTML = '<p class="placeholder">Your generated research content will appear here...</p>';
    }

    clearContent() {
        document.getElementById('prompt').value = '';
        this.clearOutput();
    }

    showLoading(show) {
        const loadingDiv = document.getElementById('loading');
        const generateBtn = document.getElementById('generate-btn');

        if (show) {
            loadingDiv.style.display = 'block';
            generateBtn.disabled = true;
            generateBtn.textContent = 'Generating...';
        } else {
            loadingDiv.style.display = 'none';
            generateBtn.disabled = false;
            generateBtn.textContent = 'Generate Research Content';
        }
    }

    async copyToClipboard() {
        const content = document.querySelector('.research-content').innerText;
        try {
            await navigator.clipboard.writeText(content);
            alert('Content copied to clipboard!');
        } catch (err) {
            console.error('Failed to copy:', err);
            alert('Failed to copy content. Please try again.');
        }
    }
}

// Initialize the application
const gyaniAI = new GyaniAI();

// Global functions for HTML onclick
function generateContent() {
    gyaniAI.generateContent();
}

function clearContent() {
    gyaniAI.clearContent();
}