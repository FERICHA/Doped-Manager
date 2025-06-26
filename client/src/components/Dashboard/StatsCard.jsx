import React from 'react';

const StatsCard = ({ title, value, change, icon }) => {
  const isPositive = change.startsWith('+');
  
  return (
    <div className="stats-card">
      <div className="stats-icon">{icon}</div>
      <div className="stats-content">
        <h3>{title}</h3>
        <p className="stats-value">{value}</p>
        <p className={`stats-change ${isPositive ? 'positive' : 'negative'}`}>
          {change}
        </p>
      </div>
    </div>
  );
};

export default StatsCard;