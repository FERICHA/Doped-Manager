import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { transactionAPI } from '../../services/Api';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const RecentTransactions = () => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await transactionAPI.getRecent();
        const transactions = response.data;
        
        const labels = transactions.map((t, index) => `Transaction ${index + 1}`);
        const incomeData = transactions.map(t => t.type === 'income' ? t.amount : 0);
        const expenseData = transactions.map(t => t.type === 'expense' ? t.amount : 0);
        
        setChartData({
          labels: labels,
          datasets: [
            {
              label: 'Revenus',
              data: incomeData,
              backgroundColor: '#198754',
              borderColor: '#198754',
              borderWidth: 1
            },
            {
              label: 'Dépenses',
              data: expenseData,
              backgroundColor: '#dc3545',
              borderColor: '#dc3545',
              borderWidth: 1
            }
          ]
        });
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };

    fetchData();
  }, []);

  if (!chartData) return <div className="chart-loading">Chargement des données...</div>;

  return (
    <div className="chart-container" style={{ height: '400px' }}>
      <Bar 
        data={chartData} 
        options={{
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Montant'
              }
            },
            x: {
              title: {
                display: true,
                text: 'Transactions récentes'
              }
            }
          },
          plugins: {
            legend: { 
              position: 'top',
              labels: {
                boxWidth: 12
              }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  let label = context.dataset.label || '';
                  if (label) {
                    label += ': ';
                  }
                  if (context.parsed.y !== null) {
                    label += new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'Dhs' }).format(context.parsed.y);
                  }
                  return label;
                }
              }
            }
          }
        }} 
      />
    </div>
  );
};

export default RecentTransactions;