import { LearningSession } from './session-store';

interface ExportData {
  sessions: LearningSession[];
  interventionStats: {
    totalAttempts: number;
    avgScore: number;
    passRate: number;
    totalPassed: number;
  };
  videoStats: {
    totalModulesWatched: number;
    avgWatchPercentage: number;
    completedVideos: number;
  };
  sessionStats: {
    totalSessions: number;
    avgEngagement: number;
    avgQuizScore: number;
    remedialCount: number;
    repeatCount: number;
    advancedCount: number;
  };
}

export function exportToCSV(data: ExportData, filename: string = 'learning-analytics') {
  const lines: string[] = [];
  
  // Summary section
  lines.push('LEARNING ANALYTICS REPORT');
  lines.push(`Generated: ${new Date().toLocaleString()}`);
  lines.push('');
  
  // Session Statistics
  lines.push('SESSION STATISTICS');
  lines.push('Metric,Value');
  lines.push(`Total Sessions,${data.sessionStats.totalSessions}`);
  lines.push(`Average Engagement,${data.sessionStats.avgEngagement}%`);
  lines.push(`Average Quiz Score,${data.sessionStats.avgQuizScore}%`);
  lines.push(`Advanced Recommendations,${data.sessionStats.advancedCount}`);
  lines.push(`Repeat Recommendations,${data.sessionStats.repeatCount}`);
  lines.push(`Remedial Recommendations,${data.sessionStats.remedialCount}`);
  lines.push('');
  
  // Intervention Statistics
  lines.push('INTERVENTION STATISTICS');
  lines.push('Metric,Value');
  lines.push(`Total Attempts,${data.interventionStats.totalAttempts}`);
  lines.push(`Average Score,${data.interventionStats.avgScore}%`);
  lines.push(`Pass Rate,${data.interventionStats.passRate}%`);
  lines.push(`Total Passed,${data.interventionStats.totalPassed}`);
  lines.push('');
  
  // Video Statistics
  lines.push('VIDEO STATISTICS');
  lines.push('Metric,Value');
  lines.push(`Modules Watched,${data.videoStats.totalModulesWatched}`);
  lines.push(`Average Watch Percentage,${data.videoStats.avgWatchPercentage}%`);
  lines.push(`Completed Videos,${data.videoStats.completedVideos}`);
  lines.push('');
  
  // Session Details
  lines.push('SESSION DETAILS');
  lines.push('Date,Module,Engagement Score,Quiz Score,Recommendation');
  data.sessions.forEach(session => {
    lines.push(`${new Date(session.timestamp).toLocaleDateString()},${session.moduleTitle},${session.engagementScore}%,${session.quizScore}%,${session.recommendation}`);
  });
  
  const csvContent = lines.join('\n');
  downloadFile(csvContent, `${filename}.csv`, 'text/csv');
}

export function exportToPDF(data: ExportData, filename: string = 'learning-analytics') {
  // Create HTML content for PDF
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Learning Analytics Report</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
        h1 { color: #6366f1; border-bottom: 2px solid #6366f1; padding-bottom: 10px; }
        h2 { color: #64748b; margin-top: 30px; }
        .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 20px 0; }
        .stat-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; text-align: center; }
        .stat-value { font-size: 28px; font-weight: bold; color: #6366f1; }
        .stat-label { font-size: 12px; color: #64748b; margin-top: 5px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #e2e8f0; padding: 10px; text-align: left; }
        th { background: #f1f5f9; font-weight: 600; }
        tr:nth-child(even) { background: #f8fafc; }
        .badge { padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: 500; }
        .badge-success { background: #dcfce7; color: #166534; }
        .badge-warning { background: #fef3c7; color: #92400e; }
        .badge-danger { background: #fee2e2; color: #991b1b; }
        .footer { margin-top: 40px; text-align: center; color: #94a3b8; font-size: 12px; }
      </style>
    </head>
    <body>
      <h1>📊 Learning Analytics Report</h1>
      <p>Generated: ${new Date().toLocaleString()}</p>
      
      <h2>📈 Session Statistics</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">${data.sessionStats.totalSessions}</div>
          <div class="stat-label">Total Sessions</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${data.sessionStats.avgEngagement}%</div>
          <div class="stat-label">Avg Engagement</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${data.sessionStats.avgQuizScore}%</div>
          <div class="stat-label">Avg Quiz Score</div>
        </div>
      </div>
      
      <h2>🧠 Intervention Statistics</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">${data.interventionStats.totalAttempts}</div>
          <div class="stat-label">Total Attempts</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${data.interventionStats.avgScore}%</div>
          <div class="stat-label">Average Score</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${data.interventionStats.passRate}%</div>
          <div class="stat-label">Pass Rate</div>
        </div>
      </div>
      
      <h2>🎬 Video Statistics</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">${data.videoStats.totalModulesWatched}</div>
          <div class="stat-label">Modules Watched</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${data.videoStats.avgWatchPercentage}%</div>
          <div class="stat-label">Avg Watch %</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${data.videoStats.completedVideos}</div>
          <div class="stat-label">Completed Videos</div>
        </div>
      </div>
      
      <h2>📋 Session History</h2>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Module</th>
            <th>Engagement</th>
            <th>Quiz Score</th>
            <th>Recommendation</th>
          </tr>
        </thead>
        <tbody>
          ${data.sessions.map(session => `
            <tr>
              <td>${new Date(session.timestamp).toLocaleDateString()}</td>
              <td>${session.moduleTitle}</td>
              <td><span class="badge ${session.engagementScore >= 70 ? 'badge-success' : session.engagementScore >= 40 ? 'badge-warning' : 'badge-danger'}">${session.engagementScore}%</span></td>
              <td><span class="badge ${session.quizScore >= 70 ? 'badge-success' : session.quizScore >= 40 ? 'badge-warning' : 'badge-danger'}">${session.quizScore}%</span></td>
              <td><span class="badge ${session.recommendation === 'advanced' ? 'badge-success' : session.recommendation === 'repeat' ? 'badge-warning' : 'badge-danger'}">${session.recommendation}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="footer">
        <p>Generated by Adaptive Learning System</p>
      </div>
    </body>
    </html>
  `;
  
  // Open print dialog with the HTML content
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  }
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
