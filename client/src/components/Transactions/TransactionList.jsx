import React from 'react';
import { motion } from 'framer-motion';
import { FiEdit2, FiTrash2, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const TransactionList = ({ transactions, onEdit, onDelete, isLoading }) => {
  const formatDate = (dateString) => {
    return format(new Date(dateString), 'PP', { locale: fr });
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'dhs'
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="card">
        <div className="card-body text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="card">
        <div className="card-body text-center py-5">
          <p className="text-muted">Aucune transaction trouvée</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="card-title mb-0">Toutes les transactions</h5>
      </div>
      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Catégorie</th>
                <th className="text-end">Montant</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction, index) => (
                <motion.tr
                  key={transaction._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={transaction.type === 'income' ? 'table-success' : 'table-danger'}
                >
                  <td>{formatDate(transaction.date)}</td>
                  <td>{transaction.description || '-'}</td>
                  <td>{transaction.category}</td>
                  <td className="text-end fw-bold">
                    {transaction.type === 'income' ? (
                      <FiArrowUp className="text-success me-1" />
                    ) : (
                      <FiArrowDown className="text-danger me-1" />
                    )}
                    {formatAmount(transaction.amount)}
                  </td>
                  <td className="text-center">
                    <button 
                      className="btn btn-sm btn-outline-primary me-2 mt-1"
                      onClick={() => onEdit(transaction)}
                    >
                      <FiEdit2 />
                    </button>
                    <button 
                      className="btn btn-sm btn-outline-danger me-2 mt-1"
                      onClick={() => onDelete(transaction._id)}
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TransactionList;