/**
 * Charts rendering using Canvas
 * Client-side chart generation with accessibility
 */

class ChartRenderer {
    constructor() {
        this.colors = {
            primary: '#2E86AB',
            secondary: '#A23B72',
            success: '#06A77D',
            warning: '#F18F01',
            danger: '#D64045',
            github: '#6e5494',
            stackoverflow: '#F48024'
        };
    }

    /**
     * Render impact ranking chart
     */
    renderImpactChart(gaps, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = Math.max(400, gaps.length * 40 + 100);
        canvas.setAttribute('role', 'img');
        canvas.setAttribute('aria-label', 'Impact ranking chart showing skill gaps');
        
        const ctx = canvas.getContext('2d');

        // Clear canvas
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const padding = { top: 60, right: 40, bottom: 60, left: 200 };
        const chartWidth = canvas.width - padding.left - padding.right;
        const chartHeight = canvas.height - padding.top - padding.bottom;

        // Title
        ctx.fillStyle = '#333';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Skill Gaps by Impact', canvas.width / 2, 30);

        const displayGaps = gaps.slice(0, 15);
        const barHeight = Math.min(30, chartHeight / displayGaps.length - 5);
        const maxWeight = Math.max(...displayGaps.map(g => g.weight));

        // Draw bars
        displayGaps.forEach((gap, index) => {
            const y = padding.top + (index * (barHeight + 5));
            const barWidth = (gap.weight / maxWeight) * chartWidth;

            // Determine color based on demand
            let barColor = this.colors.secondary;
            if (gap.evidence?.demandCategory === 'high') {
                barColor = this.colors.success;
            } else if (gap.evidence?.demandCategory === 'medium') {
                barColor = this.colors.warning;
            }

            // Draw bar
            ctx.fillStyle = barColor;
            ctx.fillRect(padding.left, y, barWidth, barHeight);

            // Border
            ctx.strokeStyle = '#ddd';
            ctx.lineWidth = 1;
            ctx.strokeRect(padding.left, y, barWidth, barHeight);

            // Skill name
            ctx.fillStyle = '#333';
            ctx.font = '12px Arial';
            ctx.textAlign = 'right';
            ctx.fillText(gap.skill, padding.left - 10, y + barHeight / 2 + 4);

            // Weight
            ctx.textAlign = 'left';
            ctx.fillStyle = '#fff';
            ctx.fillText(gap.weight.toString(), padding.left + 5, y + barHeight / 2 + 4);
        });

        container.appendChild(canvas);

        // Add data table for accessibility
        this.addDataTable(container, displayGaps);
    }

    /**
     * Add accessible data table
     */
    addDataTable(container, gaps) {
        const tableDiv = document.createElement('div');
        tableDiv.className = 'chart-data-table d-none';
        tableDiv.setAttribute('role', 'table');
        tableDiv.setAttribute('aria-label', 'Chart data in table format');

        const table = document.createElement('table');
        table.className = 'table table-sm';

        table.innerHTML = `
            <thead>
                <tr>
                    <th>Rank</th>
                    <th>Skill</th>
                    <th>Impact</th>
                    <th>Demand</th>
                </tr>
            </thead>
            <tbody>
                ${gaps.map((gap, index) => `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${gap.skill}</td>
                        <td>${gap.weight}/10</td>
                        <td>${(gap.evidence?.demandCategory || 'low').toUpperCase()}</td>
                    </tr>
                `).join('')}
            </tbody>
        `;

        tableDiv.appendChild(table);
        container.appendChild(tableDiv);

        // Add toggle button
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'btn btn-sm btn-outline-secondary mt-2';
        toggleBtn.textContent = 'View as Table';
        toggleBtn.addEventListener('click', () => {
            tableDiv.classList.toggle('d-none');
            toggleBtn.textContent = tableDiv.classList.contains('d-none') 
                ? 'View as Table' 
                : 'View as Chart';
        });
        container.appendChild(toggleBtn);
    }

    /**
     * Render demand trend chart
     */
    renderTrendChart(trendData, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 400;
        canvas.setAttribute('role', 'img');
        canvas.setAttribute('aria-label', 'Demand trend over time chart');

        const ctx = canvas.getContext('2d');

        // Background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const padding = { top: 60, right: 40, bottom: 60, left: 60 };
        const chartWidth = canvas.width - padding.left - padding.right;
        const chartHeight = canvas.height - padding.top - padding.bottom;

        // Title
        ctx.fillStyle = '#333';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Demand Trend Over Time', canvas.width / 2, 30);

        // Find max value
        const maxValue = Math.max(
            ...trendData.map(d => Math.max(d.github || 0, d.stackoverflow || 0, d.combined || 0))
        );

        if (maxValue === 0) {
            ctx.fillStyle = '#666';
            ctx.font = '14px Arial';
            ctx.fillText('No data available', canvas.width / 2, canvas.height / 2);
            container.appendChild(canvas);
            return;
        }

        const yScale = chartHeight / (maxValue * 1.1);

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

        // Y-axis labels
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
        ctx.textAlign = 'center';
        const xStep = chartWidth / (trendData.length - 1 || 1);
        trendData.forEach((data, index) => {
            const x = padding.left + (index * xStep);
            ctx.fillText(data.label || data.month, x, padding.top + chartHeight + 25);
        });

        // Draw lines
        const drawLine = (dataKey, color, lineWidth = 2) => {
            ctx.strokeStyle = color;
            ctx.lineWidth = lineWidth;
            ctx.beginPath();

            trendData.forEach((data, index) => {
                const x = padding.left + (index * xStep);
                const value = data[dataKey] || 0;
                const y = padding.top + chartHeight - (value * yScale);

                if (index === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });

            ctx.stroke();

            // Draw points
            ctx.fillStyle = color;
            trendData.forEach((data, index) => {
                const x = padding.left + (index * xStep);
                const value = data[dataKey] || 0;
                const y = padding.top + chartHeight - (value * yScale);

                ctx.beginPath();
                ctx.arc(x, y, 4, 0, Math.PI * 2);
                ctx.fill();
            });
        };

        // Draw all trend lines
        if (trendData[0].github !== undefined) {
            drawLine('github', this.colors.github, 2);
        }
        if (trendData[0].stackoverflow !== undefined) {
            drawLine('stackoverflow', this.colors.stackoverflow, 2);
        }
        if (trendData[0].combined !== undefined) {
            drawLine('combined', this.colors.primary, 3);
        }

        // Legend
        const legendY = canvas.height - 20;
        const legendItems = [];
        
        if (trendData[0].github !== undefined) {
            legendItems.push({ label: 'GitHub', color: this.colors.github });
        }
        if (trendData[0].stackoverflow !== undefined) {
            legendItems.push({ label: 'Stack Overflow', color: this.colors.stackoverflow });
        }
        if (trendData[0].combined !== undefined) {
            legendItems.push({ label: 'Combined', color: this.colors.primary });
        }

        let legendX = (canvas.width - (legendItems.length * 120)) / 2;
        legendItems.forEach(item => {
            ctx.fillStyle = item.color;
            ctx.fillRect(legendX, legendY - 8, 15, 3);

            ctx.fillStyle = '#666';
            ctx.font = '12px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(item.label, legendX + 20, legendY);

            legendX += 120;
        });

        container.appendChild(canvas);
    }
}

// Create global instance
window.chartRenderer = new ChartRenderer();

// Expose render functions
window.renderImpactChart = function(results, track) {
    const container = document.getElementById('chartsContent');
    container.innerHTML = ''; // Clear

    if (track === 'fullstack') {
        // Combine all gaps for fullstack
        const allGaps = [
            ...(results.sections?.frontend?.gaps || []),
            ...(results.sections?.backend?.gaps || [])
        ].sort((a, b) => b.weight - a.weight);
        
        if (allGaps.length > 0) {
            window.chartRenderer.renderImpactChart(allGaps, 'chartsContent');
        }
    } else {
        if (results.gaps && results.gaps.length > 0) {
            window.chartRenderer.renderImpactChart(results.gaps, 'chartsContent');
        }
    }
};
