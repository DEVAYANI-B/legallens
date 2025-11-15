import React from 'react';

function DocumentInfo({ fileName, wordCount, documentType, riskLevel }) {
  const getRiskColor = (risk) => {
    const colors = {
      'LOW': '#10b981',
      'MEDIUM': '#f59e0b',
      'HIGH': '#ef4444',
      'CRITICAL': '#dc2626'
    };
    return colors[risk] || '#6b7280';
  };

  return (
    <div className="section">
      <div className="section-header">Document Information</div>
      <div className="section-content">
        <div className="info-row">
          <span className="info-label">File name:</span>
          <span className="info-value">{fileName}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Word Count:</span>
          <span className="info-value">{wordCount}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Document Type:</span>
          <span className="info-value">{documentType}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Risk Level:</span>
          <span 
            className="risk-badge" 
            style={{ backgroundColor: getRiskColor(riskLevel) }}
          >
            {riskLevel}
          </span>
        </div>
      </div>
    </div>
  );
}

export default DocumentInfo;