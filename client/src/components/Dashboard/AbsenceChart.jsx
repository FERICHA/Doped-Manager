import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { absenceAPI } from '../../services/Api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const AbsenceChart = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState([]);
  const [chartData, setChartData] = useState({
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
    datasets: [
      {
        label: 'Absences Approuvées',
        data: Array(12).fill(0),
        borderColor: '#4ade80',
        backgroundColor: 'rgba(74, 222, 128, 0.1)',
        tension: 0.3,
        fill: true
      },
      {
        label: 'Absences en Attente',
        data: Array(12).fill(0),
        borderColor: '#fbbf24',
        backgroundColor: 'rgba(251, 191, 36, 0.1)',
        tension: 0.3,
        fill: true
      },
      {
        label: 'Absences Rejetées',
        data: Array(12).fill(0),
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.3,
        fill: true
      }
    ]
  });

  useEffect(() => {
    const fetchAbsenceData = async () => {
      try {
        const response = await absenceAPI.getAll();
        const absences = response.data;
        
        const years = extractAvailableYears(absences);
        setAvailableYears(years);
        
        if (!years.includes(selectedYear) && years.length > 0) {
          setSelectedYear(Math.max(...years));
        } else {
          processChartData(absences, selectedYear);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des données d\'absence:', error);
      }
    };

    fetchAbsenceData();
  }, [selectedYear]);

  const extractAvailableYears = (absences) => {
    const years = new Set();
    absences.forEach(absence => {
      const year = new Date(absence.startDate).getFullYear();
      years.add(year);
    });
    return Array.from(years).sort((a, b) => b - a); 
  };

  const processChartData = (absences, year) => {
    const monthlyCounts = {
      approved: Array(12).fill(0),
      pending: Array(12).fill(0),
      rejected: Array(12).fill(0)
    };

    absences.forEach(absence => {
      const startDate = new Date(absence.startDate);
      const absenceYear = startDate.getFullYear();
      
      if (absenceYear === year) {
        const month = startDate.getMonth(); // 0-11
        switch (absence.status.toLowerCase()) {
          case 'approved':
            monthlyCounts.approved[month]++;
            break;
          case 'pending':
            monthlyCounts.pending[month]++;
            break;
          case 'rejected':
            monthlyCounts.rejected[month]++;
            break;
          default:
            break;
        }
      }
    });

    setChartData(prev => ({
      ...prev,
      datasets: [
        { ...prev.datasets[0], data: monthlyCounts.approved },
        { ...prev.datasets[1], data: monthlyCounts.pending },
        { ...prev.datasets[2], data: monthlyCounts.rejected }
      ]
    }));
  };

  const handleYearChange = (e) => {
    setSelectedYear(parseInt(e.target.value));
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top'
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.raw}`;
          }
        }
      },
      title: {
        display: true,
        text: `Statistiques des absences - ${selectedYear}`,
        font: {
          size: 16
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
          stepSize: 1
        }
      }
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <select 
          value={selectedYear}
          onChange={handleYearChange}
          className="border rounded px-3 py-1"
        >
          {availableYears.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default AbsenceChart;