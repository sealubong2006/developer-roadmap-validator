/**
 * Curated skill roadmaps based on roadmap.sh
 * Version: v1.0
 * Last Updated: February 2026
 */

export const ROADMAPS = {
  frontend: {
    name: 'Frontend Development',
    description: 'Client-side web development skills',
    coreSkills: [
      // Fundamentals (Critical: 9-10)
      { name: 'HTML', weight: 10, category: 'fundamentals' },
      { name: 'CSS', weight: 10, category: 'fundamentals' },
      { name: 'JavaScript', weight: 10, category: 'fundamentals' },
      { name: 'Responsive Design', weight: 9, category: 'fundamentals' },
      { name: 'Browser DevTools', weight: 9, category: 'fundamentals' },
      
      // Modern JavaScript (Important: 7-8)
      { name: 'ES6+', weight: 8, category: 'javascript' },
      { name: 'Async/Await', weight: 8, category: 'javascript' },
      { name: 'Promises', weight: 8, category: 'javascript' },
      { name: 'DOM Manipulation', weight: 8, category: 'javascript' },
      { name: 'Event Handling', weight: 7, category: 'javascript' },
      
      // Frameworks & Libraries (Critical: 8-9)
      { name: 'React', weight: 9, category: 'frameworks' },
      { name: 'Component Architecture', weight: 8, category: 'frameworks' },
      { name: 'State Management', weight: 8, category: 'frameworks' },
      { name: 'React Hooks', weight: 8, category: 'frameworks' },
      
      // Styling (Important: 6-8)
      { name: 'CSS Flexbox', weight: 8, category: 'styling' },
      { name: 'CSS Grid', weight: 8, category: 'styling' },
      { name: 'Sass/SCSS', weight: 6, category: 'styling' },
      { name: 'CSS-in-JS', weight: 6, category: 'styling' },
      { name: 'Tailwind CSS', weight: 6, category: 'styling' },
      
      // Build Tools (Important: 7-8)
      { name: 'npm/yarn', weight: 8, category: 'tooling' },
      { name: 'Webpack', weight: 7, category: 'tooling' },
      { name: 'Vite', weight: 7, category: 'tooling' },
      { name: 'Babel', weight: 6, category: 'tooling' },
      
      // Version Control (Critical: 9)
      { name: 'Git', weight: 9, category: 'fundamentals' },
      { name: 'GitHub', weight: 8, category: 'fundamentals' },
      
      // Web APIs (Important: 6-7)
      { name: 'Fetch API', weight: 8, category: 'apis' },
      { name: 'Local Storage', weight: 7, category: 'apis' },
      { name: 'Web Storage', weight: 6, category: 'apis' },
      
      // Performance (Important: 6-7)
      { name: 'Performance Optimization', weight: 7, category: 'performance' },
      { name: 'Lazy Loading', weight: 6, category: 'performance' },
      { name: 'Code Splitting', weight: 6, category: 'performance' },
      
      // Testing (Important: 6-7)
      { name: 'Jest', weight: 7, category: 'testing' },
      { name: 'React Testing Library', weight: 6, category: 'testing' },
      { name: 'Unit Testing', weight: 7, category: 'testing' },
      
      // Accessibility (Important: 7)
      { name: 'Web Accessibility', weight: 7, category: 'accessibility' },
      { name: 'ARIA', weight: 6, category: 'accessibility' },
      
      // TypeScript (Useful: 7)
      { name: 'TypeScript', weight: 7, category: 'languages' },
      
      // Additional (Useful: 4-6)
      { name: 'SEO Basics', weight: 6, category: 'optimization' },
      { name: 'Browser Compatibility', weight: 6, category: 'fundamentals' },
      { name: 'Progressive Web Apps', weight: 5, category: 'advanced' },
      { name: 'Web Components', weight: 5, category: 'advanced' }
    ]
  },

  backend: {
    name: 'Backend Development',
    description: 'Server-side development skills',
    coreSkills: [
      // Fundamentals (Critical: 9-10)
      { name: 'JavaScript', weight: 10, category: 'fundamentals' },
      { name: 'Node.js', weight: 10, category: 'fundamentals' },
      { name: 'HTTP/HTTPS', weight: 9, category: 'fundamentals' },
      { name: 'REST APIs', weight: 9, category: 'fundamentals' },
      { name: 'JSON', weight: 9, category: 'fundamentals' },
      
      // Frameworks (Important: 8-9)
      { name: 'Express.js', weight: 9, category: 'frameworks' },
      { name: 'Middleware', weight: 8, category: 'frameworks' },
      { name: 'Routing', weight: 8, category: 'frameworks' },
      
      // Databases (Critical: 8-9)
      { name: 'SQL', weight: 9, category: 'databases' },
      { name: 'PostgreSQL', weight: 8, category: 'databases' },
      { name: 'MySQL', weight: 8, category: 'databases' },
      { name: 'MongoDB', weight: 8, category: 'databases' },
      { name: 'Database Design', weight: 8, category: 'databases' },
      { name: 'ORMs', weight: 7, category: 'databases' },
      
      // Authentication & Security (Critical: 8-9)
      { name: 'Authentication', weight: 9, category: 'security' },
      { name: 'Authorization', weight: 9, category: 'security' },
      { name: 'JWT', weight: 8, category: 'security' },
      { name: 'OAuth', weight: 7, category: 'security' },
      { name: 'Encryption', weight: 8, category: 'security' },
      { name: 'HTTPS/TLS', weight: 8, category: 'security' },
      
      // API Design (Important: 7-8)
      { name: 'RESTful Design', weight: 8, category: 'apis' },
      { name: 'API Versioning', weight: 7, category: 'apis' },
      { name: 'GraphQL', weight: 6, category: 'apis' },
      { name: 'Error Handling', weight: 8, category: 'apis' },
      
      // Version Control (Critical: 9)
      { name: 'Git', weight: 9, category: 'fundamentals' },
      { name: 'GitHub', weight: 8, category: 'fundamentals' },
      
      // Async Programming (Important: 8)
      { name: 'Async/Await', weight: 8, category: 'programming' },
      { name: 'Promises', weight: 8, category: 'programming' },
      { name: 'Event Loop', weight: 7, category: 'programming' },
      
      // Testing (Important: 7-8)
      { name: 'Unit Testing', weight: 8, category: 'testing' },
      { name: 'Integration Testing', weight: 7, category: 'testing' },
      { name: 'Jest', weight: 7, category: 'testing' },
      { name: 'API Testing', weight: 7, category: 'testing' },
      
      // DevOps Basics (Important: 6-7)
      { name: 'Environment Variables', weight: 8, category: 'devops' },
      { name: 'Logging', weight: 7, category: 'devops' },
      { name: 'Deployment', weight: 7, category: 'devops' },
      { name: 'CI/CD Basics', weight: 6, category: 'devops' },
      
      // Performance (Important: 6-7)
      { name: 'Caching', weight: 7, category: 'performance' },
      { name: 'Rate Limiting', weight: 7, category: 'performance' },
      { name: 'Load Balancing', weight: 6, category: 'performance' },
      
      // Additional (Useful: 5-7)
      { name: 'Docker', weight: 7, category: 'devops' },
      { name: 'Redis', weight: 6, category: 'databases' },
      { name: 'Message Queues', weight: 6, category: 'architecture' },
      { name: 'Microservices', weight: 5, category: 'architecture' },
      { name: 'WebSockets', weight: 6, category: 'realtime' },
      { name: 'TypeScript', weight: 7, category: 'languages' }
    ]
  },

  fullstack: {
    name: 'Full Stack Development',
    description: 'Complete web development stack',
    coreSkills: [
      // Core Fundamentals (Critical: 10)
      { name: 'HTML', weight: 10, category: 'frontend-fundamentals', section: 'frontend' },
      { name: 'CSS', weight: 10, category: 'frontend-fundamentals', section: 'frontend' },
      { name: 'JavaScript', weight: 10, category: 'fundamentals', section: 'both' },
      { name: 'Git', weight: 10, category: 'fundamentals', section: 'both' },
      
      // Frontend Critical (8-9)
      { name: 'React', weight: 9, category: 'frontend-frameworks', section: 'frontend' },
      { name: 'Responsive Design', weight: 9, category: 'frontend-fundamentals', section: 'frontend' },
      { name: 'CSS Flexbox', weight: 8, category: 'frontend-styling', section: 'frontend' },
      { name: 'CSS Grid', weight: 8, category: 'frontend-styling', section: 'frontend' },
      { name: 'ES6+', weight: 8, category: 'javascript', section: 'both' },
      { name: 'Async/Await', weight: 8, category: 'javascript', section: 'both' },
      { name: 'Fetch API', weight: 8, category: 'frontend-apis', section: 'frontend' },
      
      // Backend Critical (8-9)
      { name: 'Node.js', weight: 10, category: 'backend-fundamentals', section: 'backend' },
      { name: 'Express.js', weight: 9, category: 'backend-frameworks', section: 'backend' },
      { name: 'REST APIs', weight: 9, category: 'backend-apis', section: 'backend' },
      { name: 'HTTP/HTTPS', weight: 9, category: 'backend-fundamentals', section: 'backend' },
      { name: 'SQL', weight: 9, category: 'backend-databases', section: 'backend' },
      { name: 'Authentication', weight: 9, category: 'backend-security', section: 'backend' },
      { name: 'Database Design', weight: 8, category: 'backend-databases', section: 'backend' },
      
      // Full Stack Integration (Critical: 8-9)
      { name: 'RESTful Design', weight: 9, category: 'integration', section: 'both' },
      { name: 'State Management', weight: 8, category: 'frontend-frameworks', section: 'frontend' },
      { name: 'Error Handling', weight: 8, category: 'integration', section: 'both' },
      { name: 'Environment Variables', weight: 8, category: 'backend-devops', section: 'backend' },
      
      // Databases (Important: 7-8)
      { name: 'PostgreSQL', weight: 8, category: 'backend-databases', section: 'backend' },
      { name: 'MongoDB', weight: 7, category: 'backend-databases', section: 'backend' },
      
      // Security (Critical: 8-9)
      { name: 'Authorization', weight: 8, category: 'backend-security', section: 'backend' },
      { name: 'JWT', weight: 8, category: 'backend-security', section: 'backend' },
      { name: 'Encryption', weight: 7, category: 'backend-security', section: 'backend' },
      
      // Build & Deploy (Important: 7-8)
      { name: 'npm/yarn', weight: 8, category: 'tooling', section: 'both' },
      { name: 'Webpack', weight: 7, category: 'frontend-tooling', section: 'frontend' },
      { name: 'Deployment', weight: 8, category: 'backend-devops', section: 'backend' },
      
      // Testing (Important: 7-8)
      { name: 'Unit Testing', weight: 8, category: 'testing', section: 'both' },
      { name: 'Integration Testing', weight: 7, category: 'backend-testing', section: 'backend' },
      { name: 'Jest', weight: 7, category: 'testing', section: 'both' },
      
      // Performance (Important: 6-7)
      { name: 'Caching', weight: 7, category: 'backend-performance', section: 'backend' },
      { name: 'Performance Optimization', weight: 7, category: 'frontend-performance', section: 'frontend' },
      { name: 'Rate Limiting', weight: 7, category: 'backend-performance', section: 'backend' },
      
      // Additional Important (6-7)
      { name: 'TypeScript', weight: 7, category: 'languages', section: 'both' },
      { name: 'Docker', weight: 7, category: 'backend-devops', section: 'backend' },
      { name: 'Web Accessibility', weight: 7, category: 'frontend-accessibility', section: 'frontend' },
      { name: 'Logging', weight: 7, category: 'backend-devops', section: 'backend' },
      { name: 'Browser DevTools', weight: 7, category: 'frontend-fundamentals', section: 'frontend' }
    ]
  }
};

/**
 * Get all skills for autocomplete
 */
export function getAllSkills() {
  const skillsSet = new Set();
  
  Object.values(ROADMAPS).forEach(roadmap => {
    roadmap.coreSkills.forEach(skill => {
      skillsSet.add(skill.name);
    });
  });
  
  return Array.from(skillsSet).sort();
}

/**
 * Get core skills for a specific track
 */
export function getCoreSkills(track) {
  const roadmap = ROADMAPS[track];
  if (!roadmap) {
    throw new Error(`Invalid track: ${track}`);
  }
  return roadmap.coreSkills;
}

/**
 * Get skill weight for a specific track
 */
export function getSkillWeight(track, skillName) {
  const coreSkills = getCoreSkills(track);
  const skill = coreSkills.find(s => s.name.toLowerCase() === skillName.toLowerCase());
  return skill ? skill.weight : 0;
}

/**
 * Check if a skill is core for a track
 */
export function isCoreSkill(track, skillName) {
  const coreSkills = getCoreSkills(track);
  return coreSkills.some(s => s.name.toLowerCase() === skillName.toLowerCase());
}

export default ROADMAPS;
