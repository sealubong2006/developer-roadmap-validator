/**
 * Prerequisite chains for learning order
 * Format: skill -> [prerequisites]
 */

export const PREREQUISITES = {
  frontend: {
    // Fundamentals have no prerequisites
    'HTML': [],
    'CSS': ['HTML'],
    'JavaScript': ['HTML'],
    
    // Advanced CSS
    'CSS Flexbox': ['CSS'],
    'CSS Grid': ['CSS'],
    'Responsive Design': ['CSS', 'CSS Flexbox'],
    'Sass/SCSS': ['CSS'],
    'CSS-in-JS': ['CSS', 'JavaScript'],
    'Tailwind CSS': ['CSS'],
    
    // JavaScript progression
    'ES6+': ['JavaScript'],
    'DOM Manipulation': ['JavaScript'],
    'Event Handling': ['JavaScript', 'DOM Manipulation'],
    'Promises': ['JavaScript', 'ES6+'],
    'Async/Await': ['Promises'],
    'Fetch API': ['Promises', 'Async/Await'],
    
    // React ecosystem
    'React': ['JavaScript', 'ES6+', 'HTML', 'CSS'],
    'Component Architecture': ['React'],
    'React Hooks': ['React', 'Component Architecture'],
    'State Management': ['React', 'React Hooks'],
    
    // Build tools
    'npm/yarn': ['JavaScript'],
    'Babel': ['JavaScript', 'ES6+'],
    'Webpack': ['npm/yarn', 'JavaScript'],
    'Vite': ['npm/yarn', 'JavaScript'],
    
    // Version control
    'Git': [],
    'GitHub': ['Git'],
    
    // Web APIs
    'Local Storage': ['JavaScript'],
    'Web Storage': ['JavaScript'],
    
    // Browser
    'Browser DevTools': ['HTML', 'CSS', 'JavaScript'],
    'Browser Compatibility': ['HTML', 'CSS', 'JavaScript'],
    
    // Performance
    'Performance Optimization': ['JavaScript', 'React'],
    'Lazy Loading': ['JavaScript', 'React'],
    'Code Splitting': ['Webpack', 'React'],
    
    // Testing
    'Unit Testing': ['JavaScript'],
    'Jest': ['JavaScript', 'Unit Testing'],
    'React Testing Library': ['React', 'Jest'],
    
    // Accessibility
    'Web Accessibility': ['HTML', 'CSS'],
    'ARIA': ['HTML', 'Web Accessibility'],
    
    // Advanced
    'TypeScript': ['JavaScript', 'ES6+'],
    'SEO Basics': ['HTML'],
    'Progressive Web Apps': ['JavaScript', 'Service Workers', 'Fetch API'],
    'Web Components': ['JavaScript', 'HTML', 'CSS']
  },

  backend: {
    // Fundamentals
    'JavaScript': [],
    'Node.js': ['JavaScript'],
    'JSON': ['JavaScript'],
    'HTTP/HTTPS': [],
    
    // Express
    'Express.js': ['Node.js', 'JavaScript'],
    'Middleware': ['Express.js'],
    'Routing': ['Express.js'],
    
    // APIs
    'REST APIs': ['HTTP/HTTPS', 'JSON'],
    'RESTful Design': ['REST APIs', 'Express.js'],
    'API Versioning': ['RESTful Design'],
    'GraphQL': ['JavaScript', 'REST APIs'],
    'Error Handling': ['Express.js', 'REST APIs'],
    'API Testing': ['REST APIs', 'Unit Testing'],
    
    // Databases
    'SQL': [],
    'Database Design': ['SQL'],
    'PostgreSQL': ['SQL', 'Database Design'],
    'MySQL': ['SQL', 'Database Design'],
    'MongoDB': ['JSON'],
    'ORMs': ['SQL', 'Node.js'],
    'Redis': ['Node.js'],
    
    // Security
    'Authentication': ['Express.js', 'HTTP/HTTPS'],
    'Authorization': ['Authentication'],
    'JWT': ['Authentication', 'JSON'],
    'OAuth': ['Authentication'],
    'Encryption': ['JavaScript'],
    'HTTPS/TLS': ['HTTP/HTTPS'],
    
    // Async
    'Promises': ['JavaScript'],
    'Async/Await': ['Promises', 'JavaScript'],
    'Event Loop': ['JavaScript', 'Node.js'],
    
    // Testing
    'Unit Testing': ['JavaScript'],
    'Integration Testing': ['Unit Testing', 'Express.js'],
    'Jest': ['JavaScript', 'Unit Testing'],
    
    // DevOps
    'Environment Variables': ['Node.js'],
    'Logging': ['Node.js'],
    'Deployment': ['Node.js', 'Environment Variables'],
    'CI/CD Basics': ['Git', 'Deployment'],
    'Docker': ['Node.js', 'Deployment'],
    
    // Performance
    'Caching': ['Node.js'],
    'Rate Limiting': ['Express.js'],
    'Load Balancing': ['Deployment'],
    
    // Version control
    'Git': [],
    'GitHub': ['Git'],
    
    // Advanced
    'Message Queues': ['Node.js', 'Async/Await'],
    'Microservices': ['REST APIs', 'Docker'],
    'WebSockets': ['Node.js', 'HTTP/HTTPS'],
    'TypeScript': ['JavaScript']
  },

  fullstack: {
    // Core fundamentals
    'HTML': [],
    'CSS': ['HTML'],
    'JavaScript': ['HTML'],
    'Git': [],
    'GitHub': ['Git'],
    
    // Frontend basics
    'Responsive Design': ['CSS', 'CSS Flexbox'],
    'CSS Flexbox': ['CSS'],
    'CSS Grid': ['CSS'],
    'Browser DevTools': ['HTML', 'CSS', 'JavaScript'],
    
    // JavaScript progression
    'ES6+': ['JavaScript'],
    'Async/Await': ['JavaScript', 'ES6+'],
    'Fetch API': ['JavaScript', 'Async/Await'],
    
    // React
    'React': ['JavaScript', 'ES6+', 'HTML', 'CSS'],
    'State Management': ['React'],
    
    // Backend fundamentals
    'Node.js': ['JavaScript'],
    'HTTP/HTTPS': [],
    'REST APIs': ['HTTP/HTTPS', 'JSON'],
    'Express.js': ['Node.js'],
    
    // Full stack integration
    'RESTful Design': ['REST APIs', 'Express.js'],
    'Error Handling': ['Express.js', 'React'],
    
    // Databases
    'SQL': [],
    'Database Design': ['SQL'],
    'PostgreSQL': ['SQL', 'Database Design'],
    'MongoDB': ['Node.js'],
    
    // Security
    'Authentication': ['Express.js', 'HTTP/HTTPS'],
    'Authorization': ['Authentication'],
    'JWT': ['Authentication'],
    'Encryption': ['JavaScript'],
    
    // Build and deploy
    'npm/yarn': ['JavaScript'],
    'Webpack': ['npm/yarn', 'JavaScript'],
    'Environment Variables': ['Node.js'],
    'Deployment': ['Node.js', 'Environment Variables'],
    
    // Testing
    'Unit Testing': ['JavaScript'],
    'Integration Testing': ['Unit Testing', 'Express.js'],
    'Jest': ['JavaScript', 'Unit Testing'],
    
    // Performance
    'Caching': ['Node.js'],
    'Performance Optimization': ['JavaScript', 'React'],
    'Rate Limiting': ['Express.js'],
    
    // Advanced
    'TypeScript': ['JavaScript', 'ES6+'],
    'Docker': ['Node.js', 'Deployment'],
    'Web Accessibility': ['HTML', 'CSS'],
    'Logging': ['Node.js']
  }
};

/**
 * Get prerequisites for a skill in a track
 */
export function getPrerequisites(track, skillName) {
  const trackPrereqs = PREREQUISITES[track];
  if (!trackPrereqs) {
    return [];
  }
  return trackPrereqs[skillName] || [];
}

/**
 * Check if all prerequisites are met
 */
export function prerequisitesMet(track, skillName, learnedSkills) {
  const prereqs = getPrerequisites(track, skillName);
  const learnedSet = new Set(learnedSkills.map(s => s.toLowerCase()));
  return prereqs.every(prereq => learnedSet.has(prereq.toLowerCase()));
}

/**
 * Get learning order for a set of skills
 * Returns skills sorted by dependency order
 */
export function getLearningOrder(track, skillNames) {
  const trackPrereqs = PREREQUISITES[track];
  if (!trackPrereqs) {
    return skillNames;
  }

  const ordered = [];
  const remaining = new Set(skillNames);
  const processed = new Set();

  // Keep processing until all skills are ordered
  let maxIterations = skillNames.length * 2;
  let iterations = 0;

  while (remaining.size > 0 && iterations < maxIterations) {
    iterations++;
    let addedThisRound = false;

    for (const skill of remaining) {
      const prereqs = trackPrereqs[skill] || [];
      const allPrereqsMet = prereqs.every(prereq => 
        processed.has(prereq) || !skillNames.includes(prereq)
      );

      if (allPrereqsMet) {
        ordered.push(skill);
        processed.add(skill);
        remaining.delete(skill);
        addedThisRound = true;
      }
    }

    // If no skills were added, add remaining in alphabetical order
    if (!addedThisRound && remaining.size > 0) {
      const remainingArray = Array.from(remaining).sort();
      ordered.push(...remainingArray);
      break;
    }
  }

  return ordered;
}

/**
 * Get suggested next skills to learn
 * Based on current skills and gaps
 */
export function getSuggestedNext(track, currentSkills, gapSkills, count = 3) {
  const learnedSet = new Set(currentSkills.map(s => s.toLowerCase()));
  const suggestions = [];

  for (const gapSkill of gapSkills) {
    const prereqs = getPrerequisites(track, gapSkill);
    const allPrereqsMet = prereqs.every(prereq => learnedSet.has(prereq.toLowerCase()));
    
    if (allPrereqsMet) {
      suggestions.push({
        skill: gapSkill,
        reason: 'Prerequisites met',
        prereqs: prereqs
      });
    } else {
      const missingPrereqs = prereqs.filter(prereq => !learnedSet.has(prereq.toLowerCase()));
      if (missingPrereqs.length === 1) {
        suggestions.push({
          skill: gapSkill,
          reason: `Learn ${missingPrereqs[0]} first`,
          prereqs: prereqs,
          missingPrereqs: missingPrereqs
        });
      }
    }
  }

  return suggestions.slice(0, count);
}

export default PREREQUISITES;
