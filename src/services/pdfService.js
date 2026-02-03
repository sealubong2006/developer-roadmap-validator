/**
 * PDF generation service
 * Generates comprehensive validation reports
 * Gracefully handles missing chart images
 */

import PDFDocument from 'pdfkit';
import chartService from './chartService.js';
import { CONSTANTS } from '../config/constants.js';

class PDFService {
  /**
   * Generate validation report PDF
   */
  async generateValidationReport(validationResults, options = {}) {
    const {
      userSkills = [],
      track = validationResults.track
    } = options;

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'LETTER',
          margins: {
            top: CONSTANTS.PDF.MARGIN,
            bottom: CONSTANTS.PDF.MARGIN,
            left: CONSTANTS.PDF.MARGIN,
            right: CONSTANTS.PDF.MARGIN
          }
        });

        const buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfData = Buffer.concat(buffers);
          resolve(pdfData);
        });
        doc.on('error', reject);

        // Generate PDF content
        this.addCoverPage(doc, validationResults, track);
        this.addMethodology(doc);
        this.addExecutiveSummary(doc, validationResults);
        
        // Add charts if Canvas is available
        if (validationResults.gaps && validationResults.gaps.length > 0) {
          this.addCharts(doc, validationResults, track);
        }
        
        this.addGapAnalysis(doc, validationResults);
        this.addLearningPath(doc, validationResults);
        this.addKeepSharp(doc, validationResults);
        this.addEvidenceTables(doc, validationResults);
        this.addDataSources(doc, validationResults);

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Add cover page
   */
  addCoverPage(doc, results, track) {
    const trackNames = {
      frontend: 'Frontend Development',
      backend: 'Backend Development',
      fullstack: 'Full Stack Development'
    };

    doc.fontSize(CONSTANTS.PDF.FONT_SIZES.TITLE)
       .fillColor('#2C3E50')
       .text('Developer Roadmap', 100, 200, { align: 'center' })
       .text('Validation Report', 100, 235, { align: 'center' });

    doc.fontSize(CONSTANTS.PDF.FONT_SIZES.HEADING)
       .fillColor('#34495E')
       .text(trackNames[track] || track, 100, 300, { align: 'center' });

    doc.fontSize(CONSTANTS.PDF.FONT_SIZES.BODY)
       .fillColor('#7F8C8D')
       .text(`Generated: ${new Date(results.timestamp).toLocaleString()}`, 100, 350, { align: 'center' })
       .text(`Roadmap Version: ${results.roadmapVersion}`, 100, 370, { align: 'center' })
       .text(`Last Updated: ${CONSTANTS.ROADMAP_LAST_UPDATED}`, 100, 390, { align: 'center' });

    doc.fontSize(CONSTANTS.PDF.FONT_SIZES.SMALL)
       .fillColor('#95A5A6')
       .text(`Based on ${CONSTANTS.ROADMAP_SOURCE}`, 100, 450, { align: 'center' })
       .text(CONSTANTS.ROADMAP_SOURCE_URL, 100, 465, { align: 'center', link: CONSTANTS.ROADMAP_SOURCE_URL });

    // Coverage circle
    const centerX = doc.page.width / 2;
    const centerY = 550;
    const radius = 60;

    doc.circle(centerX, centerY, radius)
       .fillAndStroke('#3498DB', '#2980B9');

    doc.fontSize(24)
       .fillColor('#FFFFFF')
       .text(`${results.coveragePercent}%`, centerX - 40, centerY - 15, { width: 80, align: 'center' });

    doc.fontSize(CONSTANTS.PDF.FONT_SIZES.SMALL)
       .fillColor('#7F8C8D')
       .text('Coverage', centerX - 40, centerY + 80, { width: 80, align: 'center' });

    doc.addPage();
  }

  /**
   * Add methodology section
   */
  addMethodology(doc) {
    this.addSection(doc, 'Methodology');

    doc.fontSize(CONSTANTS.PDF.FONT_SIZES.BODY)
       .fillColor('#2C3E50')
       .text('This report validates your current skills against curated core competencies for your chosen track.', {
         width: doc.page.width - 2 * CONSTANTS.PDF.MARGIN,
         align: 'left'
       });

    doc.moveDown();
    
    const methodology = [
      'Core Skills: Curated from industry-standard roadmaps (roadmap.sh)',
      'Gap Analysis: Identifies missing skills from the core list',
      'Impact Weighting: Each skill weighted 1-10 based on criticality',
      'Demand Evidence: Live data from GitHub repositories and Stack Overflow',
      'Learning Order: Based on prerequisite chains',
      'Keep Sharp: Strong proficiency skills shown for maintenance'
    ];

    methodology.forEach(item => {
      doc.fontSize(CONSTANTS.PDF.FONT_SIZES.BODY)
         .fillColor('#34495E')
         .text(`• ${item}`, {
           width: doc.page.width - 2 * CONSTANTS.PDF.MARGIN - 20,
           indent: 20
         })
         .moveDown(0.3);
    });

    doc.moveDown(2);
  }

  /**
   * Add executive summary
   */
  addExecutiveSummary(doc, results) {
    this.addSection(doc, 'Executive Summary');

    const summaryData = [
      ['Total Core Skills', results.totalCoreSkills],
      ['Your Skills', results.userSkillCount],
      ['Skill Gaps', results.gapCount],
      ['Coverage', `${results.coveragePercent}%`]
    ];

    const startY = doc.y;
    const colWidth = (doc.page.width - 2 * CONSTANTS.PDF.MARGIN) / 2;

    summaryData.forEach((row, index) => {
      const y = startY + (index * 25);
      
      doc.fontSize(CONSTANTS.PDF.FONT_SIZES.BODY)
         .fillColor('#7F8C8D')
         .text(row[0], CONSTANTS.PDF.MARGIN, y, { width: colWidth });

      doc.fontSize(CONSTANTS.PDF.FONT_SIZES.SUBHEADING)
         .fillColor('#2C3E50')
         .text(row[1].toString(), CONSTANTS.PDF.MARGIN + colWidth, y, { width: colWidth, align: 'right' });
    });

    doc.y = startY + (summaryData.length * 25) + 20;
    doc.moveDown(2);
  }

  /**
   * Add charts (with graceful handling when Canvas is not available)
   */
  addCharts(doc, results, track) {
    // Check if we need a new page
    if (doc.y > 600) {
      doc.addPage();
    }

    this.addSection(doc, 'Visual Analysis');

    // Check if chartService has Canvas available
    if (!chartService.isAvailable()) {
      doc.fontSize(CONSTANTS.PDF.FONT_SIZES.BODY)
         .fillColor('#7F8C8D')
         .text('Chart visualization requires Canvas package (optional dependency)', {
           width: doc.page.width - 2 * CONSTANTS.PDF.MARGIN,
           align: 'center'
         })
         .moveDown(0.5);

      doc.fontSize(CONSTANTS.PDF.FONT_SIZES.SMALL)
         .fillColor('#95A5A6')
         .text('Charts are available in the web interface', {
           width: doc.page.width - 2 * CONSTANTS.PDF.MARGIN,
           align: 'center'
         })
         .moveDown(0.5);

      doc.fontSize(CONSTANTS.PDF.FONT_SIZES.SMALL)
         .fillColor('#95A5A6')
         .text('To enable PDF charts: npm install @napi-rs/canvas', {
           width: doc.page.width - 2 * CONSTANTS.PDF.MARGIN,
           align: 'center'
         })
         .moveDown(2);

      return;
    }

    try {
      // Generate impact ranking chart
      const impactChart = chartService.generateImpactRankingChart(results.gaps, {
        title: `${track.charAt(0).toUpperCase() + track.slice(1)} Skill Gaps by Impact`
      });

      if (impactChart) {
        const chartWidth = doc.page.width - 2 * CONSTANTS.PDF.MARGIN;
        const aspectRatio = 0.6; // Height is 60% of width
        const chartHeight = chartWidth * aspectRatio;

        // Check if chart fits on current page
        if (doc.y + chartHeight > doc.page.height - CONSTANTS.PDF.MARGIN) {
          doc.addPage();
        }

        doc.image(impactChart, CONSTANTS.PDF.MARGIN, doc.y, {
          width: chartWidth,
          height: chartHeight
        });

        doc.y += chartHeight + 20;
      } else {
        doc.fontSize(CONSTANTS.PDF.FONT_SIZES.BODY)
           .fillColor('#E74C3C')
           .text('Chart generation failed', { align: 'center' })
           .moveDown();
      }
    } catch (error) {
      console.error('[PDF Service] Error adding charts:', error);
      doc.fontSize(CONSTANTS.PDF.FONT_SIZES.BODY)
         .fillColor('#E74C3C')
         .text('Unable to generate charts', { align: 'center' })
         .moveDown();
    }

    doc.addPage();
  }

  /**
   * Add gap analysis
   */
  addGapAnalysis(doc, results) {
    this.addSection(doc, 'Skill Gap Analysis');

    if (!results.gaps || results.gaps.length === 0) {
      doc.fontSize(CONSTANTS.PDF.FONT_SIZES.BODY)
         .fillColor('#27AE60')
         .text('Congratulations! You have mastered all core skills for this track.', {
           align: 'center'
         })
         .moveDown();
      return;
    }

    doc.fontSize(CONSTANTS.PDF.FONT_SIZES.BODY)
       .fillColor('#2C3E50')
       .text(`${results.gaps.length} skill gap(s) identified, sorted by ${results.sortedBy}.`, {
         width: doc.page.width - 2 * CONSTANTS.PDF.MARGIN
       })
       .moveDown();

    // Table header
    this.drawTableHeader(doc, ['Rank', 'Skill', 'Impact', 'Demand', 'GitHub', 'Stack Overflow']);

    results.gaps.forEach((gap, index) => {
      const rank = (index + 1).toString();
      const skill = gap.skill;
      const impact = gap.weight.toString();
      const demand = gap.evidence?.demandCategory?.toUpperCase() || 'N/A';
      const github = gap.evidence?.github?.count?.toLocaleString() || '0';
      const stackoverflow = gap.evidence?.stackoverflow?.count?.toLocaleString() || '0';

      this.drawTableRow(doc, [rank, skill, impact, demand, github, stackoverflow]);

      // Check for page break
      if (doc.y > doc.page.height - 100) {
        doc.addPage();
        this.drawTableHeader(doc, ['Rank', 'Skill', 'Impact', 'Demand', 'GitHub', 'Stack Overflow']);
      }
    });

    doc.moveDown(2);
  }

  /**
   * Add learning path
   */
  addLearningPath(doc, results) {
    if (doc.y > 600) {
      doc.addPage();
    }

    this.addSection(doc, 'Suggested Learning Path');

    if (results.suggestedNext && results.suggestedNext.length > 0) {
      doc.fontSize(CONSTANTS.PDF.FONT_SIZES.SUBHEADING)
         .fillColor('#3498DB')
         .text('Next 3 Recommended:', { underline: true })
         .moveDown(0.5);

      results.suggestedNext.forEach((suggestion, index) => {
        doc.fontSize(CONSTANTS.PDF.FONT_SIZES.BODY)
           .fillColor('#2C3E50')
           .text(`${index + 1}. ${suggestion.skill}`, { indent: 20 })
           .fontSize(CONSTANTS.PDF.FONT_SIZES.SMALL)
           .fillColor('#7F8C8D')
           .text(`   ${suggestion.reason}`, { indent: 30 })
           .moveDown(0.5);
      });
    }

    if (results.learningOrder && results.learningOrder.length > 0) {
      doc.moveDown();
      doc.fontSize(CONSTANTS.PDF.FONT_SIZES.SUBHEADING)
         .fillColor('#3498DB')
         .text('Complete Learning Order:', { underline: true })
         .moveDown(0.5);

      const itemsPerLine = 3;
      const learningOrder = results.learningOrder.slice(0, 21); // Limit to 21 for space

      for (let i = 0; i < learningOrder.length; i += itemsPerLine) {
        const line = learningOrder.slice(i, i + itemsPerLine)
          .map((skill, idx) => `${i + idx + 1}. ${skill}`)
          .join('  |  ');
        
        doc.fontSize(CONSTANTS.PDF.FONT_SIZES.SMALL)
           .fillColor('#34495E')
           .text(line, { indent: 20 })
           .moveDown(0.3);
      }
    }

    doc.moveDown(2);
  }

  /**
   * Add keep sharp section
   */
  addKeepSharp(doc, results) {
    if (!results.keepSharp || results.keepSharp.length === 0) {
      return;
    }

    if (doc.y > 650) {
      doc.addPage();
    }

    this.addSection(doc, 'Keep Sharp');

    doc.fontSize(CONSTANTS.PDF.FONT_SIZES.BODY)
       .fillColor('#2C3E50')
       .text('Core skills you already have at strong proficiency. Keep practicing!', {
         width: doc.page.width - 2 * CONSTANTS.PDF.MARGIN
       })
       .moveDown();

    const skillsPerRow = 3;
    for (let i = 0; i < results.keepSharp.length; i += skillsPerRow) {
      const row = results.keepSharp.slice(i, i + skillsPerRow)
        .map(s => `${s.skill} (${s.weight})`)
        .join('  |  ');
      
      doc.fontSize(CONSTANTS.PDF.FONT_SIZES.BODY)
         .fillColor('#27AE60')
         .text(row, { indent: 20 })
         .moveDown(0.3);
    }

    doc.moveDown(2);
  }

  /**
   * Add evidence tables
   */
  addEvidenceTables(doc, results) {
    if (!results.gaps || results.gaps.length === 0) {
      return;
    }

    doc.addPage();
    this.addSection(doc, 'Detailed Evidence');

    doc.fontSize(CONSTANTS.PDF.FONT_SIZES.SMALL)
       .fillColor('#7F8C8D')
       .text('Demand metrics from GitHub and Stack Overflow APIs', {
         width: doc.page.width - 2 * CONSTANTS.PDF.MARGIN
       })
       .moveDown();

    // Show top 10 gaps with full evidence
    const top10 = results.gaps.slice(0, 10);

    top10.forEach((gap, index) => {
      if (doc.y > doc.page.height - 150) {
        doc.addPage();
      }

      doc.fontSize(CONSTANTS.PDF.FONT_SIZES.SUBHEADING)
         .fillColor('#2C3E50')
         .text(`${index + 1}. ${gap.skill}`, { underline: true })
         .moveDown(0.3);

      const evidence = [
        `Impact Weight: ${gap.weight}/10`,
        `Demand Category: ${gap.evidence?.demandCategory?.toUpperCase() || 'N/A'}`,
        `GitHub Repos: ${gap.evidence?.github?.count?.toLocaleString() || 'N/A'}`,
        `Stack Overflow Questions: ${gap.evidence?.stackoverflow?.count?.toLocaleString() || 'N/A'}`,
        `Combined Score: ${Math.round(gap.evidence?.combinedScore || 0).toLocaleString()}`
      ];

      evidence.forEach(line => {
        doc.fontSize(CONSTANTS.PDF.FONT_SIZES.SMALL)
           .fillColor('#34495E')
           .text(line, { indent: 20 })
           .moveDown(0.2);
      });

      doc.moveDown(0.5);
    });
  }

  /**
   * Add data sources
   */
  addDataSources(doc, results) {
    doc.addPage();
    this.addSection(doc, 'Data Sources & Methodology');

    const sources = [
      {
        title: 'Roadmap Reference',
        items: [
          `Source: ${CONSTANTS.ROADMAP_SOURCE}`,
          `URL: ${CONSTANTS.ROADMAP_SOURCE_URL}`,
          `Version: ${results.roadmapVersion}`,
          `Last Updated: ${CONSTANTS.ROADMAP_LAST_UPDATED}`
        ]
      },
      {
        title: 'Demand Data',
        items: [
          'GitHub API: Repository counts by skill keywords',
          'Stack Exchange API: Question counts by tags',
          'Time Window: Past 6 months',
          `Report Generated: ${new Date(results.timestamp).toLocaleString()}`
        ]
      },
      {
        title: 'Demand Categories',
        items: [
          `High: Combined score >= ${CONSTANTS.DEMAND_THRESHOLDS.HIGH}`,
          `Medium: Combined score >= ${CONSTANTS.DEMAND_THRESHOLDS.MEDIUM}`,
          `Low: Combined score < ${CONSTANTS.DEMAND_THRESHOLDS.MEDIUM}`
        ]
      }
    ];

    sources.forEach(section => {
      doc.fontSize(CONSTANTS.PDF.FONT_SIZES.SUBHEADING)
         .fillColor('#3498DB')
         .text(section.title, { underline: true })
         .moveDown(0.5);

      section.items.forEach(item => {
        doc.fontSize(CONSTANTS.PDF.FONT_SIZES.SMALL)
           .fillColor('#34495E')
           .text(`• ${item}`, { indent: 20 })
           .moveDown(0.2);
      });

      doc.moveDown();
    });
  }

  /**
   * Helper: Add section heading
   */
  addSection(doc, title) {
    doc.fontSize(CONSTANTS.PDF.FONT_SIZES.HEADING)
       .fillColor('#2C3E50')
       .text(title, {
         width: doc.page.width - 2 * CONSTANTS.PDF.MARGIN
       })
       .moveDown(0.5);
    
    // Underline
    doc.moveTo(CONSTANTS.PDF.MARGIN, doc.y)
       .lineTo(doc.page.width - CONSTANTS.PDF.MARGIN, doc.y)
       .strokeColor('#3498DB')
       .lineWidth(2)
       .stroke();
    
    doc.moveDown();
  }

  /**
   * Helper: Draw table header
   */
  drawTableHeader(doc, headers) {
    const colWidth = (doc.page.width - 2 * CONSTANTS.PDF.MARGIN) / headers.length;
    const y = doc.y;

    doc.rect(CONSTANTS.PDF.MARGIN, y, doc.page.width - 2 * CONSTANTS.PDF.MARGIN, 20)
       .fillAndStroke('#3498DB', '#2980B9');

    headers.forEach((header, index) => {
      doc.fontSize(CONSTANTS.PDF.FONT_SIZES.SMALL)
         .fillColor('#FFFFFF')
         .text(header, CONSTANTS.PDF.MARGIN + (index * colWidth), y + 5, {
           width: colWidth,
           align: 'center'
         });
    });

    doc.y = y + 25;
  }

  /**
   * Helper: Draw table row
   */
  drawTableRow(doc, cells) {
    const colWidth = (doc.page.width - 2 * CONSTANTS.PDF.MARGIN) / cells.length;
    const y = doc.y;

    cells.forEach((cell, index) => {
      doc.fontSize(CONSTANTS.PDF.FONT_SIZES.SMALL)
         .fillColor('#2C3E50')
         .text(cell, CONSTANTS.PDF.MARGIN + (index * colWidth), y, {
           width: colWidth,
           align: 'center'
         });
    });

    doc.moveDown(0.8);
  }
}

export default new PDFService();