import React from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiTrendingDown, FiDollarSign } from 'react-icons/fi';

const TransactionStats = ({ stats }) => {
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'Dhs'
    }).format(amount);
  };

  return (
    <div className="row">
      <motion.div 
        className="col-md-4 mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="card bg-success bg-opacity-10 border-success">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-success mb-0">Revenus</h6>
                <h3 className="mb-0">{formatAmount(stats.totalIncome)}</h3>
              </div>
              <FiTrendingUp className="text-success" size={24} />
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div 
        className="col-md-4 mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="card bg-danger bg-opacity-10 border-danger">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-danger mb-0">Dépenses</h6>
                <h3 className="mb-0">{formatAmount(stats.totalExpense)}</h3>
              </div>
              <FiTrendingDown className="text-danger" size={24} />
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div 
        className="col-md-4 mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className={`card ${stats.balance >= 0 ? 'bg-success' : 'bg-danger'} bg-opacity-10 ${stats.balance >= 0 ? 'border-success' : 'border-danger'}`}>
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className={stats.balance >= 0 ? 'text-success' : 'text-danger'} mb-0>Solde</h6>
                <h3 className="mb-0">{formatAmount(stats.balance)}</h3>
              </div>
              <FiDollarSign className={stats.balance >= 0 ? 'text-success' : 'text-danger'} size={24} />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TransactionStats;