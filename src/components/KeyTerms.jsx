import React from 'react';

function KeyTerms({ terms }) {
  return (
    <div className="section">
      <div className="section-header">Key Legal Terms Found</div>
      <div className="section-content">
        <div className="terms-grid">
          {terms.map((term, index) => (
            <div key={index} className="term-badge" title={term.explanation}>
              {term.term}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default KeyTerms;