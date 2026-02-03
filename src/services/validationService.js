/**
 * Core validation service
 * Validates user skills against track roadmaps
 */

import { getCoreSkills, getSkillWeight, isCoreSkill } from '../config/roadmaps.js';
import { getLearningOrder, getSuggestedNext } from '../config/prerequisites.js';
import githubService from './githubService.js';
import stackoverflowService from './stackoverflowService.js';
import { CONSTANTS } from '../config/constants.js';

class ValidationService {
  /**
   * Validate user skills against track
   */
  async validateSkills(track, userSkills, options = {}) {
    const {
      githubToken = null,
      soKey = null,
      sortBy = CONSTANTS.SORT_OPTIONS.IMPACT
    } = options;

    // Get core skills for track
    const coreSkills = getCoreSkills(track);
    const coreSkillNames = coreSkills.map(s => s.name);

    // Separate user skills by proficiency
    const userSkillsByProficiency = this.categorizeUserSkills(userSkills);
    const allUserSkillNames = userSkills.map(s => s.name);

    // Find gaps
    const gaps = this.findGaps(track, allUserSkillNames, coreSkillNames);

    // Find strong proficiency core skills (for "Keep Sharp" section)
    const keepSharpSkills = this.findKeepSharpSkills(
      track,
      userSkillsByProficiency.strong,
      coreSkillNames
    );

    // Fetch demand data for gaps
    const gapsWithEvidence = await this.addEvidenceToGaps(
      gaps,
      track,
      githubToken,
      soKey
    );

    // Sort gaps
    const sortedGaps = this.sortGaps(gapsWithEvidence, sortBy);

    // Get learning order
    const learningOrderSkills = getLearningOrder(
      track,
      sortedGaps.map(g => g.skill)
    );

    // Get suggested next steps
    const suggestedNext = getSuggestedNext(
      track,
      allUserSkillNames,
      learningOrderSkills,
      3
    );

    return {
      track,
      totalCoreSkills: coreSkillNames.length,
      userSkillCount: userSkills.length,
      gapCount: gaps.length,
      coveragePercent: ((1 - gaps.length / coreSkillNames.length) * 100).toFixed(1),
      gaps: sortedGaps,
      keepSharp: keepSharpSkills,
      learningOrder: learningOrderSkills,
      suggestedNext,
      sortedBy: sortBy,
      timestamp: new Date().toISOString(),
      roadmapVersion: CONSTANTS.ROADMAP_VERSION
    };
  }

  /**
   * Categorize user skills by proficiency
   */
  categorizeUserSkills(userSkills) {
    return {
      beginner: userSkills
        .filter(s => s.proficiency === CONSTANTS.PROFICIENCY_LEVELS.BEGINNER)
        .map(s => s.name),
      intermediate: userSkills
        .filter(s => s.proficiency === CONSTANTS.PROFICIENCY_LEVELS.INTERMEDIATE)
        .map(s => s.name),
      strong: userSkills
        .filter(s => s.proficiency === CONSTANTS.PROFICIENCY_LEVELS.STRONG)
        .map(s => s.name)
    };
  }

  /**
   * Find missing core skills (gaps)
   */
  findGaps(track, userSkillNames, coreSkillNames) {
    const userSkillSet = new Set(userSkillNames.map(s => s.toLowerCase()));
    
    return coreSkillNames
      .filter(coreSkill => !userSkillSet.has(coreSkill.toLowerCase()))
      .map(skill => ({
        skill,
        weight: getSkillWeight(track, skill)
      }));
  }

  /**
   * Find strong proficiency skills that are core (for Keep Sharp section)
   */
  findKeepSharpSkills(track, strongSkills, coreSkillNames) {
    const coreSkillSet = new Set(coreSkillNames.map(s => s.toLowerCase()));
    
    return strongSkills
      .filter(skill => coreSkillSet.has(skill.toLowerCase()))
      .map(skill => ({
        skill,
        weight: getSkillWeight(track, skill)
      }))
      .sort((a, b) => b.weight - a.weight);
  }

  /**
   * Add demand evidence to gaps
   */
  async addEvidenceToGaps(gaps, track, githubToken, soKey) {
    const gapsWithEvidence = await Promise.all(
      gaps.map(async (gap) => {
        try {
          // Fetch GitHub and SO data in parallel
          const [githubData, soData] = await Promise.all([
            githubService.getSkillDemand(gap.skill, track, githubToken),
            stackoverflowService.getSkillDemand(gap.skill, track, soKey)
          ]);

          const githubCount = githubData.data?.count || 0;
          const soCount = soData.data?.count || 0;
          const combinedScore = githubCount + (soCount * 0.5); // Weight SO less

          return {
            ...gap,
            evidence: {
              github: {
                count: githubCount,
                error: githubData.data?.error || null
              },
              stackoverflow: {
                count: soCount,
                error: soData.data?.error || null
              },
              combinedScore,
              demandCategory: this.categorizeDemand(combinedScore),
              timestamp: new Date().toISOString()
            }
          };
        } catch (error) {
          console.error(`Error fetching evidence for ${gap.skill}:`, error.message);
          return {
            ...gap,
            evidence: {
              github: { count: 0, error: error.message },
              stackoverflow: { count: 0, error: error.message },
              combinedScore: 0,
              demandCategory: CONSTANTS.DEMAND_CATEGORIES.LOW,
              timestamp: new Date().toISOString()
            }
          };
        }
      })
    );

    return gapsWithEvidence;
  }

  /**
   * Categorize demand into Low/Medium/High
   */
  categorizeDemand(combinedScore) {
    if (combinedScore >= CONSTANTS.DEMAND_THRESHOLDS.HIGH) {
      return CONSTANTS.DEMAND_CATEGORIES.HIGH;
    } else if (combinedScore >= CONSTANTS.DEMAND_THRESHOLDS.MEDIUM) {
      return CONSTANTS.DEMAND_CATEGORIES.MEDIUM;
    } else {
      return CONSTANTS.DEMAND_CATEGORIES.LOW;
    }
  }

  /**
   * Sort gaps by selected criteria
   */
  sortGaps(gaps, sortBy) {
    switch (sortBy) {
      case CONSTANTS.SORT_OPTIONS.IMPACT:
        return [...gaps].sort((a, b) => b.weight - a.weight);

      case CONSTANTS.SORT_OPTIONS.DEMAND:
        return [...gaps].sort((a, b) => 
          b.evidence.combinedScore - a.evidence.combinedScore
        );

      case CONSTANTS.SORT_OPTIONS.LEARNING_ORDER:
        // This will be handled separately in the UI
        return gaps;

      case CONSTANTS.SORT_OPTIONS.QUICK_WINS:
        // Quick wins: High demand, lower weight (easier to learn, high value)
        return [...gaps].sort((a, b) => {
          const scoreA = a.evidence.combinedScore / (a.weight + 1);
          const scoreB = b.evidence.combinedScore / (b.weight + 1);
          return scoreB - scoreA;
        });

      default:
        return gaps;
    }
  }

  /**
   * Get demand trends for a skill
   */
  async getSkillTrends(skillName, track, githubToken = null, soKey = null) {
    try {
      const [githubTrend, soTrend] = await Promise.all([
        githubService.getSkillDemandOverTime(skillName, track, githubToken),
        stackoverflowService.getSkillDemandOverTime(skillName, track, soKey)
      ]);

      // Merge monthly data
      const mergedData = githubTrend.data.monthlyData.map((githubMonth, index) => {
        const soMonth = soTrend.data.monthlyData[index];
        return {
          month: githubMonth.month,
          label: githubMonth.label,
          github: githubMonth.count,
          stackoverflow: soMonth?.count || 0,
          combined: githubMonth.count + (soMonth?.count || 0) * 0.5
        };
      });

      return {
        skill: skillName,
        track,
        monthlyData: mergedData,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error(`Error fetching trends for ${skillName}:`, error.message);
      throw error;
    }
  }

  /**
   * Validate for fullstack (returns separate frontend and backend sections)
   */
  async validateFullstack(userSkills, options = {}) {
    const coreSkills = getCoreSkills('fullstack');
    
    // Separate gaps by section
    const frontendGaps = [];
    const backendGaps = [];
    const bothGaps = [];

    const allUserSkillNames = userSkills.map(s => s.name);
    const userSkillSet = new Set(allUserSkillNames.map(s => s.toLowerCase()));

    coreSkills.forEach(coreSkill => {
      if (userSkillSet.has(coreSkill.name.toLowerCase())) {
        return; // Not a gap
      }

      const gap = {
        skill: coreSkill.name,
        weight: coreSkill.weight,
        section: coreSkill.section
      };

      if (coreSkill.section === 'frontend') {
        frontendGaps.push(gap);
      } else if (coreSkill.section === 'backend') {
        backendGaps.push(gap);
      } else {
        bothGaps.push(gap);
      }
    });

    // Add evidence to all gaps
    const allGaps = [...frontendGaps, ...backendGaps, ...bothGaps];
    const gapsWithEvidence = await this.addEvidenceToGaps(
      allGaps,
      'fullstack',
      options.githubToken,
      options.soKey
    );

    // Separate back into sections
    const frontendWithEvidence = gapsWithEvidence.filter(g => 
      frontendGaps.some(fg => fg.skill === g.skill)
    );
    const backendWithEvidence = gapsWithEvidence.filter(g => 
      backendGaps.some(bg => bg.skill === g.skill)
    );
    const bothWithEvidence = gapsWithEvidence.filter(g => 
      bothGaps.some(bg => bg.skill === g.skill)
    );

    return {
      track: 'fullstack',
      totalCoreSkills: coreSkills.length,
      userSkillCount: userSkills.length,
      gapCount: allGaps.length,
      coveragePercent: ((1 - allGaps.length / coreSkills.length) * 100).toFixed(1),
      sections: {
        frontend: {
          gaps: this.sortGaps(frontendWithEvidence, options.sortBy || CONSTANTS.SORT_OPTIONS.IMPACT),
          count: frontendWithEvidence.length
        },
        backend: {
          gaps: this.sortGaps(backendWithEvidence, options.sortBy || CONSTANTS.SORT_OPTIONS.IMPACT),
          count: backendWithEvidence.length
        },
        both: {
          gaps: this.sortGaps(bothWithEvidence, options.sortBy || CONSTANTS.SORT_OPTIONS.IMPACT),
          count: bothWithEvidence.length
        }
      },
      timestamp: new Date().toISOString(),
      roadmapVersion: CONSTANTS.ROADMAP_VERSION
    };
  }
}

export default new ValidationService();
