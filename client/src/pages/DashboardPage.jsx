import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaMoneyBillWave, FaUsers, FaBoxes, FaUmbrellaBeach } from 'react-icons/fa';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import Sidebar from '../components/Dashboard/Sidebar';
import StatsCard from '../components/Dashboard/StatsCard';
import RecentTransactions from '../components/Dashboard/RecentTransactions';
import StockAlert from '../components/Dashboard/StockAlert';
import AbsenceChart from '../components/Dashboard/AbsenceChart';
import '../styles/dashboard.css';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../Auth/AuthHelpers';
import { absenceAPI, employeeAPI, productAPI, transactionAPI } from '../services/Api'; 
import MobileNavbar from '../components/Dashboard/MobileNavbar';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [statsData, setStatsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      navigate('/login');
    } else {
      fetchDashboardData();
    }
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const [
        employeesResponse, 
        productsResponse, 
        absencesResponse, 
        transactionsResponse,
        lowStockResponse
      ] = await Promise.all([
        employeeAPI.getAll(),
        productAPI.getAll(),
        absenceAPI.getAll(),
        transactionAPI.getRecent(),
        productAPI.getLowStock()
      ]);

      const revenues = transactionsResponse.data
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const expenses = transactionsResponse.data
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      const employees = employeesResponse.data;
      const employeesCount = employees.length;
      const activeEmployeesCount = employees.filter(e => e.status === 'active').length;
      const productsCount = productsResponse.data.length;
      const absences = absencesResponse.data;
      const absencesCount = absences.length;
      const approvedAbsencesCount = absences.filter(a => a.status === 'approved').length;
      const total = revenues + expenses;
      const revenuePercent = total ? ((revenues / total) * 100).toFixed(2) : 0;
      const expensePercent = total ? ((expenses / total) * 100).toFixed(2) : 0;

      const updatedStatsData = [
        {
          title: "Revenus",
          value: `${revenues.toLocaleString()} DHS`,
          change: `+${revenuePercent}%`,
          icon: <FaMoneyBillWave size={24} />,
          trend: 'up'
        },
        {
          title: "Dépenses",
          value: `-${Math.abs(expenses).toLocaleString()} DHS`,
          change: `-${expensePercent}%`, 
          icon: <FaMoneyBillWave size={24} />,
          trend: 'down'
        },
        {
          title: "Employés",
          value: employeesCount.toString(),
          change: `+${activeEmployeesCount} active`, 
          icon: <FaUsers size={24} />,
          trend: 'up'
        },
        {
          title: "Produits",
          value: productsCount.toString(),
          change: `${lowStockResponse.data.length} à vérifier`,
          icon: <FaBoxes size={24} />,
          trend: lowStockResponse.data.length > 0 ? 'down' : 'up'
        },
        {
          title: "Absences",
          value: absencesCount.toString(),
          change: `+${approvedAbsencesCount} approuvée`,
          icon: <FaUmbrellaBeach size={24} />,
          trend: 'down'
        }
      ];

      setStatsData(updatedStatsData);
      setLoading(false);
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  const cardVariants = {
    hover: {
      y: -5,
      boxShadow: "0 10px 20px rgba(0,0,0,0.1)"
    }
  };

  return (
    <div>
    <motion.div 
      className="dashboard-container"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <Sidebar />
      
      <motion.div className="main-content" variants={itemVariants}>
        <motion.h1 
          className="dashboard-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Tableau de Bord
        </motion.h1>
        
        {/* Cartes de statistiques */}
        <motion.div className="stats-grid" variants={containerVariants}>
          {statsData.map((stat, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover="hover"
              variants={cardVariants}
            >
              <StatsCard 
                title={stat.title}
                value={stat.value}
                change={stat.change}
                icon={stat.icon}
                trendIcon={stat.trend === 'up' ? 
                  <FiTrendingUp color="#4CAF50" /> : 
                  <FiTrendingDown color="#F44336" />}
              />
            </motion.div>
          ))}
        </motion.div>
        
        {/* Grille principale */}
        <motion.div 
          className="dashboard-grid"
          variants={containerVariants}
        >
          <motion.div 
            className="card chart-card"
            variants={itemVariants}
            whileHover="hover"
            variants={cardVariants}
          >
            <h3>Transactions Récentes</h3>
            <RecentTransactions />
          </motion.div>
          
          <motion.div 
            className="card chart-card"
            variants={itemVariants}
            whileHover="hover"
            variants={cardVariants}
          >
            <h3>Alertes Stock</h3>
            <StockAlert />
          </motion.div>
          
          <motion.div 
            className="card chart-card wide"
            variants={itemVariants}
            whileHover="hover"
            variants={cardVariants}
          >
            <h3>Statistiques Absences</h3>
            <AbsenceChart />
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
    </div>
  );
};

export default DashboardPage;