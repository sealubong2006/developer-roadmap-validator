/**
 * Main application logic
 * Handles UI interactions and API calls
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize UI components
    initializeUI();
    loadSavedState();
    setupEventListeners();
});

let currentResults = null;
let currentUserSkills = [];

/**
 * Initialize UI components
 */
function initializeUI() {
    // Load saved API keys
    const githubToken = storageManager.getGitHubToken();
    const soKey = storageManager.getSOKey();
    
    if (githubToken) {
        document.getElementById('githubTokenInput').value = githubToken;
    }
    if (soKey) {
        document.getElementById('soKeyInput').value = soKey;
    }
}

/**
 * Load saved state from localStorage
 */
function loadSavedState() {
    // Load track
    const savedTrack = storageManager.getTrack();
    document.getElementById(`track${savedTrack.charAt(0).toUpperCase() + savedTrack.slice(1)}`).checked = true;
    
    // Load skills
    const savedSkills = storageManager.getSkills();
    if (savedSkills.length > 0) {
        currentUserSkills = savedSkills;
        renderSelectedSkills();
        updateValidateButton();
    }
    
    // Load sort preference
    const sortPref = storageManager.getSortPreference();
    document.getElementById('sortBy').value = sortPref;
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    // Track selection
    document.querySelectorAll('input[name="track"]').forEach(radio => {
        radio.addEventListener('change', handleTrackChange);
    });
    
    // Add skill button
    document.getElementById('addSkillBtn').addEventListener('click', addSkill);
    
    // Skill input - Enter key
    document.getElementById('skillInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addSkill();
        }
    });
    
    // Validate button
    document.getElementById('validateBtn').addEventListener('click', validateSkills);
    
    // Export PDF button
    document.getElementById('exportPdfBtn')?.addEventListener('click', exportPDF);
    
    // Settings save
    document.getElementById('saveSettingsBtn').addEventListener('click', saveSettings);
    
    // Reset button
    document.getElementById('resetBtn').addEventListener('click', resetAll);
}

/**
 * Handle track change
 */
function handleTrackChange(e) {
    const track = e.target.value;
    storageManager.saveTrack(track);
    showToast('Track changed', `Switched to ${track} development`);
}

/**
 * Add skill to list
 */
function addSkill() {
    const skillInput = document.getElementById('skillInput');
    const proficiencySelect = document.getElementById('proficiencySelect');
    
    const skillName = skillInput.value.trim();
    const proficiency = proficiencySelect.value;
    
    if (!skillName) {
        showToast('Error', 'Please enter a skill name', 'error');
        return;
    }
    
    // Check for duplicates
    const exists = currentUserSkills.some(s => 
        s.name.toLowerCase() === skillName.toLowerCase()
    );
    
    if (exists) {
        showToast('Duplicate', 'This skill is already added', 'warning');
        return;
    }
    
    // Add skill
    currentUserSkills.push({
        name: skillName,
        proficiency: proficiency
    });
    
    // Update UI
    renderSelectedSkills();
    storageManager.saveSkills(currentUserSkills);
    updateValidateButton();
    
    // Clear input
    skillInput.value = '';
    skillInput.focus();
}

/**
 * Remove skill from list
 */
function removeSkill(index) {
    currentUserSkills.splice(index, 1);
    renderSelectedSkills();
    storageManager.saveSkills(currentUserSkills);
    updateValidateButton();
}

/**
 * Render selected skills
 */
function renderSelectedSkills() {
    const container = document.getElementById('selectedSkills');
    const countEl = document.getElementById('skillCount');
    
    if (currentUserSkills.length === 0) {
        container.innerHTML = '<p class="text-muted small mb-0">No skills added yet</p>';
        countEl.textContent = '0';
        return;
    }
    
    const proficiencyBadges = {
        beginner: 'bg-info',
        intermediate: 'bg-primary',
        strong: 'bg-success'
    };
    
    container.innerHTML = currentUserSkills.map((skill, index) => `
        <span class="skill-badge ${proficiencyBadges[skill.proficiency]}">
            <span class="skill-name">${skill.name}</span>
            <span class="skill-proficiency">${skill.proficiency}</span>
            <button type="button" class="skill-remove" onclick="removeSkill(${index})" aria-label="Remove ${skill.name}">
                ×
            </button>
        </span>
    `).join('');
    
    countEl.textContent = currentUserSkills.length;
}

/**
 * Update validate button state
 */
function updateValidateButton() {
    const btn = document.getElementById('validateBtn');
    btn.disabled = currentUserSkills.length === 0;
}

/**
 * Validate skills
 */
async function validateSkills() {
    const track = document.querySelector('input[name="track"]:checked').value;
    const sortBy = document.getElementById('sortBy').value;
    const githubToken = storageManager.getGitHubToken();
    const soKey = storageManager.getSOKey();
    
    if (currentUserSkills.length === 0) {
        showToast('Error', 'Please add at least one skill', 'error');
        return;
    }
    
    // Show loading
    showLoading(true);
    setValidateButtonLoading(true);
    
    try {
        const response = await fetch('/api/validate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                track,
                skills: currentUserSkills,
                githubToken,
                soKey,
                sortBy
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Validation failed');
        }
        
        const result = await response.json();
        currentResults = result.data;
        
        // Save results
        storageManager.saveResults(currentResults);
        storageManager.saveSortPreference(sortBy);
        
        // Display results
        displayResults(currentResults, track);
        
        showToast('Success', 'Validation completed successfully');
        
    } catch (error) {
        console.error('Validation error:', error);
        showToast('Error', error.message, 'error');
    } finally {
        showLoading(false);
        setValidateButtonLoading(false);
    }
}

/**
 * Display validation results
 */
function displayResults(results, track) {
    // Show results section
    document.getElementById('resultsSection').classList.remove('d-none');
    
    // Update summary cards
    document.getElementById('coveragePercent').textContent = `${results.coveragePercent}%`;
    document.getElementById('totalGaps').textContent = results.gapCount || (results.sections ? 
        (results.sections.frontend.count + results.sections.backend.count) : 0);
    document.getElementById('userSkillsCount').textContent = results.userSkillCount;
    document.getElementById('coreSkillsCount').textContent = results.totalCoreSkills;
    
    // Render gaps
    renderGaps(results, track);
    
    // Render learning path
    renderLearningPath(results);
    
    // Render charts
    renderCharts(results, track);
    
    // Scroll to results
    document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
}

/**
 * Render gaps section
 */
function renderGaps(results, track) {
    const container = document.getElementById('gapsContent');
    
    if (track === 'fullstack') {
        // Fullstack has sections
        const { frontend, backend, both } = results.sections;
        
        container.innerHTML = `
            <h5 class="mb-3">Frontend Gaps (${frontend.count})</h5>
            ${renderGapList(frontend.gaps)}
            
            <h5 class="mb-3 mt-4">Backend Gaps (${backend.count})</h5>
            ${renderGapList(backend.gaps)}
            
            ${both.count > 0 ? `
                <h5 class="mb-3 mt-4">Core Skills (${both.count})</h5>
                ${renderGapList(both.gaps)}
            ` : ''}
        `;
    } else {
        // Regular track
        if (results.gapCount === 0) {
            container.innerHTML = `
                <div class="text-center py-5">
                    <h4 class="text-success">🎉 Congratulations!</h4>
                    <p class="text-muted">You have mastered all core skills for ${track} development.</p>
                </div>
            `;
        } else {
            container.innerHTML = renderGapList(results.gaps);
        }
        
        // Keep sharp section
        if (results.keepSharp && results.keepSharp.length > 0) {
            container.innerHTML += `
                <h5 class="mb-3 mt-4">Keep Sharp 💪</h5>
                <p class="text-muted small">Core skills you already have at strong proficiency.</p>
                <div class="keep-sharp-list">
                    ${results.keepSharp.map(skill => `
                        <span class="badge bg-success me-2 mb-2">${skill.skill} (${skill.weight})</span>
                    `).join('')}
                </div>
            `;
        }
    }
}

/**
 * Render gap list
 */
function renderGapList(gaps) {
    if (!gaps || gaps.length === 0) {
        return '<p class="text-muted">No gaps found!</p>';
    }
    
    const demandColors = {
        high: 'success',
        medium: 'warning',
        low: 'secondary'
    };
    
    return `
        <div class="table-responsive">
            <table class="table table-hover">
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Skill</th>
                        <th>Impact</th>
                        <th>Demand</th>
                        <th>GitHub</th>
                        <th>Stack Overflow</th>
                    </tr>
                </thead>
                <tbody>
                    ${gaps.map((gap, index) => `
                        <tr>
                            <td>${index + 1}</td>
                            <td><strong>${gap.skill}</strong></td>
                            <td><span class="badge bg-primary">${gap.weight}/10</span></td>
                            <td><span class="badge bg-${demandColors[gap.evidence?.demandCategory || 'low']}">
                                ${(gap.evidence?.demandCategory || 'low').toUpperCase()}
                            </span></td>
                            <td>${(gap.evidence?.github?.count || 0).toLocaleString()}</td>
                            <td>${(gap.evidence?.stackoverflow?.count || 0).toLocaleString()}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

/**
 * Render learning path
 */
function renderLearningPath(results) {
    const container = document.getElementById('learningContent');
    
    let html = '';
    
    // Suggested next
    if (results.suggestedNext && results.suggestedNext.length > 0) {
        html += `
            <h5 class="mb-3">Suggested Next Steps</h5>
            <ol class="list-group list-group-numbered mb-4">
                ${results.suggestedNext.map(suggestion => `
                    <li class="list-group-item">
                        <strong>${suggestion.skill}</strong>
                        <br><small class="text-muted">${suggestion.reason}</small>
                    </li>
                `).join('')}
            </ol>
        `;
    }
    
    // Full learning order
    if (results.learningOrder && results.learningOrder.length > 0) {
        html += `
            <h5 class="mb-3">Complete Learning Order</h5>
            <p class="text-muted small">Based on prerequisite chains</p>
            <ol class="learning-order-list">
                ${results.learningOrder.map(skill => `
                    <li>${skill}</li>
                `).join('')}
            </ol>
        `;
    }
    
    container.innerHTML = html || '<p class="text-muted">No learning path available</p>';
}

/**
 * Render charts (placeholder - actual charts in charts.js)
 */
function renderCharts(results, track) {
    const container = document.getElementById('chartsContent');
    container.innerHTML = '<p class="text-muted">Chart functionality will render here with Canvas</p>';
    
    // Call chart rendering if available
    if (window.renderImpactChart) {
        window.renderImpactChart(results, track);
    }
}

/**
 * Export to PDF
 */
async function exportPDF() {
    if (!currentResults) {
        showToast('Error', 'No results to export', 'error');
        return;
    }
    
    const track = document.querySelector('input[name="track"]:checked').value;
    
    showLoading(true, 'Generating PDF...');
    
    try {
        const response = await fetch('/api/generate-pdf', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                validationResults: currentResults,
                userSkills: currentUserSkills,
                track
            })
        });
        
        if (!response.ok) {
            throw new Error('PDF generation failed');
        }
        
        // Download PDF
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `roadmap-validation-${track}-${Date.now()}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        showToast('Success', 'PDF downloaded successfully');
        
    } catch (error) {
        console.error('PDF export error:', error);
        showToast('Error', error.message, 'error');
    } finally {
        showLoading(false);
    }
}

/**
 * Save settings
 */
function saveSettings() {
    const githubToken = document.getElementById('githubTokenInput').value.trim();
    const soKey = document.getElementById('soKeyInput').value.trim();
    
    storageManager.saveGitHubToken(githubToken);
    storageManager.saveSOKey(soKey);
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('settingsModal'));
    modal.hide();
    
    showToast('Success', 'Settings saved');
}

/**
 * Reset all data
 */
function resetAll() {
    if (!confirm('Are you sure you want to reset all data? This will clear your skills, results, and settings.')) {
        return;
    }
    
    storageManager.clearAll();
    currentUserSkills = [];
    currentResults = null;
    
    // Reset UI
    document.getElementById('trackFullstack').checked = true;
    document.getElementById('skillInput').value = '';
    document.getElementById('selectedSkills').innerHTML = '';
    document.getElementById('skillCount').textContent = '0';
    document.getElementById('resultsSection').classList.add('d-none');
    document.getElementById('githubTokenInput').value = '';
    document.getElementById('soKeyInput').value = '';
    
    updateValidateButton();
    showToast('Success', 'All data reset');
}

/**
 * Show loading overlay
 */
function showLoading(show, message = 'Loading...') {
    const overlay = document.getElementById('loadingOverlay');
    if (show) {
        overlay.querySelector('p').textContent = message;
        overlay.classList.remove('d-none');
    } else {
        overlay.classList.add('d-none');
    }
}

/**
 * Set validate button loading state
 */
function setValidateButtonLoading(loading) {
    const btn = document.getElementById('validateBtn');
    const text = btn.querySelector('.btn-text');
    const spinner = btn.querySelector('.btn-spinner');
    
    if (loading) {
        text.textContent = 'Validating...';
        spinner.classList.remove('d-none');
        btn.disabled = true;
    } else {
        text.textContent = 'Validate Skills';
        spinner.classList.add('d-none');
        btn.disabled = currentUserSkills.length === 0;
    }
}

/**
 * Show toast notification
 */
function showToast(title, message, type = 'success') {
    const toast = document.getElementById('toastNotification');
    const toastBody = toast.querySelector('.toast-body');
    const toastHeader = toast.querySelector('.toast-header strong');
    
    toastHeader.textContent = title;
    toastBody.textContent = message;
    
    // Add color class
    toast.className = 'toast';
    if (type === 'error') {
        toast.classList.add('bg-danger', 'text-white');
    } else if (type === 'warning') {
        toast.classList.add('bg-warning');
    } else {
        toast.classList.add('bg-success', 'text-white');
    }
    
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
}

// Make functions global for onclick handlers
window.removeSkill = removeSkill;
