/**
 * Page controller
 * Handles rendering of EJS pages
 */

import { getAllSkills, getCoreSkills } from '../config/roadmaps.js';
import { CONSTANTS } from '../config/constants.js';

class PageController {
  /**
   * Render home page
   */
  renderHome(req, res) {
    const allSkills = getAllSkills();
    
    res.render('index', {
      title: 'Developer Roadmap Validator',
      allSkills: allSkills,
      tracks: Object.values(CONSTANTS.TRACKS),
      proficiencyLevels: Object.values(CONSTANTS.PROFICIENCY_LEVELS),
      sortOptions: CONSTANTS.SORT_OPTIONS
    });
  }

  /**
   * Render results page (usually handled client-side, but available for direct access)
   */
  renderResults(req, res) {
    res.render('results', {
      title: 'Validation Results - Developer Roadmap Validator',
      tracks: Object.values(CONSTANTS.TRACKS)
    });
  }

  /**
   * Render about/help page
   */
  renderAbout(req, res) {
    res.render('about', {
      title: 'About - Developer Roadmap Validator',
      roadmapVersion: CONSTANTS.ROADMAP_VERSION,
      roadmapSource: CONSTANTS.ROADMAP_SOURCE,
      roadmapSourceUrl: CONSTANTS.ROADMAP_SOURCE_URL
    });
  }
}

export default new PageController();
