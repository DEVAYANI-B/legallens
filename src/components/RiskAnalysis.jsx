import React from 'react';

function RiskAnalysis({ riskyClausesList, recommendations }) {
  return (
    <div className="section">
      <div className="section-header">Risk Analysis</div>
      <div className="section-content">
        <ul className="risk-list">
          {riskyClausesList.map((item, index) => (
            <li key={index}>
              <strong>{item.clause}</strong>
              <br />
              <span className="risk-explanation">{item.risk}</span>
            </li>
          ))}
        </ul>
        
        <h3 className="recommendations-title">Recommendations:</h3>
        <ul className="recommendations-list">
          {recommendations.map((rec, index) => (
            <li key={index}>{rec}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default RiskAnalysis;