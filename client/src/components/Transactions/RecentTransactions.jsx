import React from 'react';
import { motion } from 'framer-motion';
import { FiArrowUp, FiArrowDown } from 'react-icons/fi';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const RecentTransactions = ({ transactions, onEdit }) => {
  const formatDate = (dateString) => {
    return format(new Date(dateString), 'PP', { locale: fr });
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'Dhs'
    }).format(amount);
  };

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="card-title mb-0">Transactions récentes</h5>
      </div>
      <div className="card-body">
        {transactions.length === 0 ? (
          <p className="text-muted">Aucune transaction récente</p>
        ) : (
          <ul className="list-group list-group-flush">
            {transactions.map((transaction, index) => (
              <motion.li 
                key={transaction._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="list-group-item d-flex justify-content-between align-items-center px-0 py-3 border-0"
              >
                <div>
                  <h6 className="mb-1">{transaction.category}</h6>
                  <small className="text-muted">{formatDate(transaction.date)}</small>
                </div>
                <div className="d-flex align-items-center">
                  <span className={`fw-bold ${transaction.type === 'income' ? 'text-success' : 'text-danger'}`}>
                    {transaction.type === 'income' ? (
                      <FiArrowUp className="me-1" />
                    ) : (
                      <FiArrowDown className="me-1" />
                    )}
                    {formatAmount(transaction.amount)}
                  </span>
                  <button 
                    className="btn btn-sm btn-link text-primary ms-2"
                    onClick={() => onEdit(transaction)}
                  >
                    Modifier
                  </button>
                </div>
              </motion.li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default RecentTransactions;