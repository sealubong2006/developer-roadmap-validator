/**
 * Skills management utilities
 * Autocomplete, validation, and skill-related helpers
 */

class SkillsManager {
    constructor() {
        this.allSkills = window.APP_DATA?.allSkills || [];
    }

    /**
     * Fuzzy search for skills
     */
    searchSkills(query) {
        if (!query || query.length < 2) {
            return [];
        }

        const lowerQuery = query.toLowerCase();
        
        return this.allSkills.filter(skill => 
            skill.toLowerCase().includes(lowerQuery)
        ).slice(0, 10);
    }

    /**
     * Validate skill name
     */
    isValidSkill(skillName) {
        return this.allSkills.some(skill => 
            skill.toLowerCase() === skillName.toLowerCase()
        );
    }

    /**
     * Get skill suggestions based on track
     */
    getSuggestedSkills(track) {
        // This would ideally fetch from the server
        // For now, return common skills
        const suggestions = {
            frontend: ['HTML', 'CSS', 'JavaScript', 'React', 'TypeScript'],
            backend: ['Node.js', 'Express.js', 'SQL', 'MongoDB', 'REST APIs'],
            fullstack: ['JavaScript', 'React', 'Node.js', 'SQL', 'Git']
        };

        return suggestions[track] || [];
    }

    /**
     * Format skill name (capitalize properly)
     */
    formatSkillName(skillName) {
        // Find exact match in all skills (case-insensitive)
        const exactMatch = this.allSkills.find(skill => 
            skill.toLowerCase() === skillName.toLowerCase()
        );

        return exactMatch || skillName;
    }

    /**
     * Get skill category color
     */
    getSkillCategoryColor(category) {
        const colors = {
            fundamentals: '#2E86AB',
            frameworks: '#A23B72',
            databases: '#06A77D',
            security: '#D64045',
            testing: '#F18F01',
            devops: '#764ba2',
            default: '#666'
        };

        return colors[category] || colors.default;
    }

    /**
     * Normalize proficiency level
     */
    normalizeProficiency(proficiency) {
        const levels = ['beginner', 'intermediate', 'strong'];
        const lowerProf = proficiency.toLowerCase();
        
        return levels.includes(lowerProf) ? lowerProf : 'intermediate';
    }
}

// Initialize global instance
window.skillsManager = new SkillsManager();

// Enhanced autocomplete functionality
document.addEventListener('DOMContentLoaded', function() {
    const skillInput = document.getElementById('skillInput');
    if (!skillInput) return;

    // Create dropdown for suggestions
    const dropdown = document.createElement('div');
    dropdown.className = 'autocomplete-dropdown';
    dropdown.style.cssText = `
        position: absolute;
        background: white;
        border: 1px solid #ddd;
        border-radius: 8px;
        max-height: 200px;
        overflow-y: auto;
        z-index: 1000;
        display: none;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    `;

    skillInput.parentElement.style.position = 'relative';
    skillInput.parentElement.appendChild(dropdown);

    skillInput.addEventListener('input', function(e) {
        const query = e.target.value.trim();
        
        if (query.length < 2) {
            dropdown.style.display = 'none';
            return;
        }

        const matches = window.skillsManager.searchSkills(query);
        
        if (matches.length === 0) {
            dropdown.style.display = 'none';
            return;
        }

        dropdown.innerHTML = matches.map(skill => `
            <div class="autocomplete-item" style="
                padding: 10px;
                cursor: pointer;
                border-bottom: 1px solid #f0f0f0;
            " data-skill="${skill}">
                ${skill}
            </div>
        `).join('');

        dropdown.style.display = 'block';
        dropdown.style.width = skillInput.offsetWidth + 'px';

        // Add click handlers
        dropdown.querySelectorAll('.autocomplete-item').forEach(item => {
            item.addEventListener('click', function() {
                skillInput.value = this.dataset.skill;
                dropdown.style.display = 'none';
                skillInput.focus();
            });

            item.addEventListener('mouseenter', function() {
                this.style.background = '#f0f0f0';
            });

            item.addEventListener('mouseleave', function() {
                this.style.background = 'white';
            });
        });
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (e.target !== skillInput && !dropdown.contains(e.target)) {
            dropdown.style.display = 'none';
        }
    });

    // Keyboard navigation for dropdown
    skillInput.addEventListener('keydown', function(e) {
        const items = dropdown.querySelectorAll('.autocomplete-item');
        
        if (items.length === 0) return;

        let currentIndex = -1;
        items.forEach((item, index) => {
            if (item.style.background === 'rgb(240, 240, 240)') {
                currentIndex = index;
            }
        });

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (currentIndex < items.length - 1) {
                if (currentIndex >= 0) {
                    items[currentIndex].style.background = 'white';
                }
                currentIndex++;
                items[currentIndex].style.background = '#f0f0f0';
                items[currentIndex].scrollIntoView({ block: 'nearest' });
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (currentIndex > 0) {
                items[currentIndex].style.background = 'white';
                currentIndex--;
                items[currentIndex].style.background = '#f0f0f0';
                items[currentIndex].scrollIntoView({ block: 'nearest' });
            }
        } else if (e.key === 'Enter' && currentIndex >= 0) {
            e.preventDefault();
            skillInput.value = items[currentIndex].dataset.skill;
            dropdown.style.display = 'none';
        } else if (e.key === 'Escape') {
            dropdown.style.display = 'none';
        }
    });
});
