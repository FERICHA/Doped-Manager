import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEdit2, FiTrash2, FiChevronDown, FiChevronUp } from 'react-icons/fi';

const TransactionItem = ({ transaction, onEdit, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Formatage simple de la date sans date-fns
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formattedDate = formatDate(transaction.date);
  const amountColor = transaction.type === 'income' ? 'text-green-600' : 'text-red-600';

  return (
    <div className="border-b last:border-b-0 hover:bg-gray-50 transition">
      <div className="grid grid-cols-12 p-4 items-center">
        <div className="col-span-3 text-sm text-gray-600">{formattedDate}</div>
        <div className="col-span-4 font-medium truncate">{transaction.description || 'Aucune description'}</div>
        <div className="col-span-2 text-sm text-gray-500">{transaction.category}</div>
        <div className={`col-span-2 text-right font-medium ${amountColor}`}>
          {transaction.type === 'income' ? '+' : '-'}{transaction.amount} €
        </div>
        <div className="col-span-1 flex justify-end gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-0 bg-gray-50 flex justify-end gap-2">
              <button
                onClick={() => onEdit(transaction)}
                className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition"
              >
                <FiEdit2 size={14} />
                <span>Modifier</span>
              </button>
              <button
                onClick={() => onDelete(transaction._id)}
                className="flex items-center gap-1 px-3 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 transition"
              >
                <FiTrash2 size={14} />
                <span>Supprimer</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TransactionItem;