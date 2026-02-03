/**
 * Chart service for generating Canvas-based chart images
 * Used for PDF export
 * Gracefully handles missing Canvas dependency on Windows
 */

import { CONSTANTS } from '../config/constants.js';

// Try to import canvas, but handle gracefully if not available
let createCanvas = null;
let canvasAvailable = false;

try {
  // Dynamic import to catch errors gracefully
  const canvasModule = await import('canvas');
  createCanvas = canvasModule.createCanvas;
  canvasAvailable = true;
  console.log('[Chart Service] Canvas module loaded successfully');
} catch (error) {
  console.warn('[Chart Service] Canvas module not available. Chart generation disabled.');
  console.warn('[Chart Service] PDFs will be generated without chart images.');
  console.warn('[Chart Service] To enable charts, install Canvas or use @napi-rs/canvas');
}

class ChartService {
  /**
   * Check if canvas is available
   */
  isAvailable() {
    return canvasAvailable;
  }

  /**
   * Generate demand trend chart
   */
  generateDemandTrendChart(trendData, options = {}) {
    if (!canvasAvailable) {
      console.warn('[Chart Service] Skipping demand trend chart - Canvas not available');
      return null;
    }

    const {
      width = CONSTANTS.CHARTS.DEFAULT_WIDTH,
      height = CONSTANTS.CHARTS.DEFAULT_HEIGHT,
      title = 'Demand Trend Over Time'
    } = options;

    try {
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext('2d');

      // Background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      // Setup
      const padding = { top: 60, right: 40, bottom: 60, left: 60 };
      const chartWidth = width - padding.left - padding.right;
      const chartHeight = height - padding.top - padding.bottom;

      // Title
      ctx.fillStyle = '#333';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(title, width / 2, 30);

      // Find max value for scaling
      const maxValue = Math.max(
        ...trendData.monthlyData.map(d => Math.max(d.github, d.stackoverflow, d.combined))
      );

      if (maxValue === 0) {
        ctx.fillStyle = '#666';
        ctx.font = '14px Arial';
        ctx.fillText('No data available', width / 2, height / 2);
        return canvas.toBuffer('image/png');
      }

      const yScale = chartHeight / (maxValue * 1.1); // 10% padding

      // Draw axes
      ctx.strokeStyle = '#ddd';
      ctx.lineWidth = 1;
      
      // Y-axis
      ctx.beginPath();
      ctx.moveTo(padding.left, padding.top);
      ctx.lineTo(padding.left, padding.top + chartHeight);
      ctx.stroke();

      // X-axis
      ctx.beginPath();
      ctx.moveTo(padding.left, padding.top + chartHeight);
      ctx.lineTo(padding.left + chartWidth, padding.top + chartHeight);
      ctx.stroke();

      // Y-axis labels and grid lines
      ctx.fillStyle = '#666';
      ctx.font = '12px Arial';
      ctx.textAlign = 'right';
      for (let i = 0; i <= 5; i++) {
        const value = (maxValue / 5) * i;
        const y = padding.top + chartHeight - (value * yScale);
        ctx.fillText(Math.round(value).toString(), padding.left - 10, y + 4);
        
        // Grid line
        ctx.strokeStyle = '#f0f0f0';
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(padding.left + chartWidth, y);
        ctx.stroke();
      }

      // X-axis labels
      ctx.fillStyle = '#666';
      ctx.textAlign = 'center';
      const xStep = chartWidth / (trendData.monthlyData.length - 1 || 1);
      trendData.monthlyData.forEach((data, index) => {
        const x = padding.left + (index * xStep);
        ctx.fillText(data.label, x, padding.top + chartHeight + 25);
      });

      // Draw lines helper function
      const drawLine = (dataKey, color, lineWidth = 2) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.beginPath();

        trendData.monthlyData.forEach((data, index) => {
          const x = padding.left + (index * xStep);
          const y = padding.top + chartHeight - (data[dataKey] * yScale);

          if (index === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });

        ctx.stroke();

        // Draw points
        ctx.fillStyle = color;
        trendData.monthlyData.forEach((data, index) => {
          const x = padding.left + (index * xStep);
          const y = padding.top + chartHeight - (data[dataKey] * yScale);
          
          ctx.beginPath();
          ctx.arc(x, y, 4, 0, Math.PI * 2);
          ctx.fill();
        });
      };

      // Draw all lines
      drawLine('github', CONSTANTS.CHARTS.COLORS.GITHUB, 2);
      drawLine('stackoverflow', CONSTANTS.CHARTS.COLORS.STACKOVERFLOW, 2);
      drawLine('combined', CONSTANTS.CHARTS.COLORS.PRIMARY, 3);

      // Legend
      const legendY = height - 20;
      const legendItems = [
        { label: 'GitHub', color: CONSTANTS.CHARTS.COLORS.GITHUB },
        { label: 'Stack Overflow', color: CONSTANTS.CHARTS.COLORS.STACKOVERFLOW },
        { label: 'Combined', color: CONSTANTS.CHARTS.COLORS.PRIMARY }
      ];

      let legendX = (width - (legendItems.length * 120)) / 2;
      legendItems.forEach(item => {
        ctx.fillStyle = item.color;
        ctx.fillRect(legendX, legendY - 8, 15, 3);
        
        ctx.fillStyle = '#666';
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(item.label, legendX + 20, legendY);
        
        legendX += 120;
      });

      return canvas.toBuffer('image/png');
    } catch (error) {
      console.error('[Chart Service] Error generating demand trend chart:', error);
      return null;
    }
  }

  /**
   * Generate impact ranking chart (horizontal bars)
   */
  generateImpactRankingChart(gaps, options = {}) {
    if (!canvasAvailable) {
      console.warn('[Chart Service] Skipping impact ranking chart - Canvas not available');
      return null;
    }

    const {
      width = CONSTANTS.CHARTS.DEFAULT_WIDTH,
      height = Math.max(400, gaps.length * 35 + 100),
      title = 'Skill Gaps by Impact',
      maxItems = 15
    } = options;

    try {
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext('2d');

      // Background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      // Setup
      const padding = { top: 60, right: 40, bottom: 40, left: 200 };
      const chartWidth = width - padding.left - padding.right;
      const chartHeight = height - padding.top - padding.bottom;

      // Title
      ctx.fillStyle = '#333';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(title, width / 2, 30);

      // Limit items
      const displayGaps = gaps.slice(0, maxItems);
      
      if (displayGaps.length === 0) {
        ctx.fillStyle = '#666';
        ctx.font = '14px Arial';
        ctx.fillText('No gaps to display', width / 2, height / 2);
        return canvas.toBuffer('image/png');
      }

      const barHeight = Math.min(30, chartHeight / displayGaps.length - 5);
      const maxWeight = Math.max(...displayGaps.map(g => g.weight));

      // Draw bars
      displayGaps.forEach((gap, index) => {
        const y = padding.top + (index * (barHeight + 5));
        const barWidth = (gap.weight / maxWeight) * chartWidth;

        // Determine bar color based on demand category
        let demandColor = CONSTANTS.CHARTS.COLORS.INFO; // Low demand default
        
        if (gap.evidence?.demandCategory === 'high') {
          demandColor = CONSTANTS.CHARTS.COLORS.SUCCESS;
        } else if (gap.evidence?.demandCategory === 'medium') {
          demandColor = CONSTANTS.CHARTS.COLORS.WARNING;
        }

        // Draw bar
        ctx.fillStyle = demandColor;
        ctx.fillRect(padding.left, y, barWidth, barHeight);

        // Border
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 1;
        ctx.strokeRect(padding.left, y, barWidth, barHeight);

        // Skill name (left side)
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(gap.skill, padding.left - 10, y + barHeight / 2 + 4);

        // Weight value (inside bar)
        ctx.textAlign = 'left';
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px Arial';
        ctx.fillText(gap.weight.toString(), padding.left + 5, y + barHeight / 2 + 4);
      });

      // Legend
      const legendY = height - 20;
      const legendItems = [
        { label: 'High Demand', color: CONSTANTS.CHARTS.COLORS.SUCCESS },
        { label: 'Medium Demand', color: CONSTANTS.CHARTS.COLORS.WARNING },
        { label: 'Low Demand', color: CONSTANTS.CHARTS.COLORS.INFO }
      ];

      let legendX = (width - (legendItems.length * 140)) / 2;
      legendItems.forEach(item => {
        ctx.fillStyle = item.color;
        ctx.fillRect(legendX, legendY - 8, 20, 12);
        
        ctx.fillStyle = '#666';
        ctx.font = '11px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(item.label, legendX + 25, legendY);
        
        legendX += 140;
      });

      return canvas.toBuffer('image/png');
    } catch (error) {
      console.error('[Chart Service] Error generating impact ranking chart:', error);
      return null;
    }
  }

  /**
   * Generate track comparison radar chart (for fullstack)
   */
  generateTrackComparisonChart(frontendGaps, backendGaps, options = {}) {
    if (!canvasAvailable) {
      console.warn('[Chart Service] Skipping track comparison chart - Canvas not available');
      return null;
    }

    const {
      width = CONSTANTS.CHARTS.DEFAULT_WIDTH,
      height = CONSTANTS.CHARTS.DEFAULT_HEIGHT,
      title = 'Frontend vs Backend Gap Analysis'
    } = options;

    try {
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext('2d');

      // Background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      // Title
      ctx.fillStyle = '#333';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(title, width / 2, 30);

      // Categories
      const categories = [
        'Critical Skills',
        'Frameworks',
        'Security',
        'Testing',
        'Performance'
      ];

      const centerX = width / 2;
      const centerY = height / 2 + 20;
      const radius = Math.min(width, height) / 3;

      // Draw pentagon background
      ctx.strokeStyle = '#ddd';
      ctx.lineWidth = 1;

      for (let level = 1; level <= 5; level++) {
        ctx.beginPath();
        for (let i = 0; i <= categories.length; i++) {
          const angle = (Math.PI * 2 * i) / categories.length - Math.PI / 2;
          const r = (radius / 5) * level;
          const x = centerX + r * Math.cos(angle);
          const y = centerY + r * Math.sin(angle);
          
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.closePath();
        ctx.stroke();
      }

      // Draw axes
      for (let i = 0; i < categories.length; i++) {
        const angle = (Math.PI * 2 * i) / categories.length - Math.PI / 2;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(x, y);
        ctx.stroke();

        // Category labels
        const labelDistance = radius + 30;
        const labelX = centerX + labelDistance * Math.cos(angle);
        const labelY = centerY + labelDistance * Math.sin(angle);
        
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(categories[i], labelX, labelY);
      }

      // Calculate scores based on gaps
      const calculateScore = (gaps) => {
        // Simple heuristic: fewer gaps = higher score
        const maxGaps = 10;
        return Math.max(1, 5 - Math.floor((gaps / maxGaps) * 4));
      };

      // Simplified scores (in production, calculate based on actual gap categories)
      const frontendScore = [
        calculateScore(frontendGaps.length),
        calculateScore(frontendGaps.filter(g => g.weight > 7).length),
        3,
        3,
        4
      ];
      
      const backendScore = [
        calculateScore(backendGaps.length),
        4,
        calculateScore(backendGaps.filter(g => g.weight > 7).length),
        4,
        4
      ];

      // Draw data polygons
      const drawPolygon = (scores, color, fill = false) => {
        ctx.strokeStyle = color;
        ctx.fillStyle = color + '40'; // With transparency
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        for (let i = 0; i <= categories.length; i++) {
          const score = scores[i % scores.length];
          const angle = (Math.PI * 2 * i) / categories.length - Math.PI / 2;
          const r = (radius / 5) * score;
          const x = centerX + r * Math.cos(angle);
          const y = centerY + r * Math.sin(angle);
          
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.closePath();
        
        if (fill) {
          ctx.fill();
        }
        ctx.stroke();
      };

      drawPolygon(frontendScore, CONSTANTS.CHARTS.COLORS.PRIMARY, true);
      drawPolygon(backendScore, CONSTANTS.CHARTS.COLORS.SECONDARY, true);

      // Legend
      const legendY = height - 20;
      
      ctx.fillStyle = CONSTANTS.CHARTS.COLORS.PRIMARY;
      ctx.fillRect(width / 2 - 100, legendY - 8, 20, 12);
      ctx.fillStyle = '#666';
      ctx.font = '12px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('Frontend', width / 2 - 75, legendY);

      ctx.fillStyle = CONSTANTS.CHARTS.COLORS.SECONDARY;
      ctx.fillRect(width / 2 + 20, legendY - 8, 20, 12);
      ctx.fillText('Backend', width / 2 + 45, legendY);

      return canvas.toBuffer('image/png');
    } catch (error) {
      console.error('[Chart Service] Error generating track comparison chart:', error);
      return null;
    }
  }

  /**
   * Generate a simple text-based placeholder when canvas is not available
   */
  generatePlaceholderMessage(chartType) {
    return {
      message: `${chartType} chart generation requires Canvas package`,
      suggestion: 'Install Canvas or use @napi-rs/canvas for chart support',
      platform: 'Charts are available in the browser UI'
    };
  }
}

export default new ChartService();