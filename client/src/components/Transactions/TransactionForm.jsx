import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiDollarSign, FiCalendar, FiType, FiTag, FiFileText } from 'react-icons/fi';

const TransactionForm = ({ transaction, onAdd, onUpdate, onClose }) => {
  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense',
    category: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (transaction) {
      setFormData({
        amount: transaction.amount,
        type: transaction.type,
        category: transaction.category,
        date: transaction.date.split('T')[0],
        description: transaction.description
      });
    }
  }, [transaction]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.amount || isNaN(formData.amount)) {
      newErrors.amount = 'Montant invalide';
    }
    if (!formData.type) {
      newErrors.type = 'Type requis';
    }
    if (!formData.category) {
      newErrors.category = 'Catégorie requise';
    }
    if (!formData.date) {
      newErrors.date = 'Date requise';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const data = {
        ...formData,
        amount: parseFloat(formData.amount),
        date: new Date(formData.date).toISOString()
      };

      if (transaction) {
        await onUpdate(transaction._id, data);
      } else {
        await onAdd(data);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const formVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 30 }
    },
    exit: { opacity: 0, y: 50 }
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  return (
    <AnimatePresence>
      <div className="transaction-form-overlay">
        <motion.div
          className="modal-backdrop"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={overlayVariants}
          onClick={onClose}
          transition={{ duration: 0.2 }}
        />

        <motion.div
          className="transaction-form-modal"
          variants={formVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <div className="form-header">
            <h3 className="form-title">
              {transaction ? 'Modifier Transaction' : 'Nouvelle Transaction'}
            </h3>
            <button 
              className="close-button" 
              onClick={onClose}
              aria-label="Fermer"
            >
              <FiX size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="transaction-form">
            <div className="form-grid">
              {/* Type Field */}
              <div className={`form-field ${errors.type ? 'has-error' : ''}`}>
                <label htmlFor="type" className="field-label">
                  <FiType className="field-icon" />
                  Type
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="field-input"
                >
                  <option value="expense">Dépense</option>
                  <option value="income">Revenu</option>
                </select>
                {errors.type && <span className="error-message">{errors.type}</span>}
              </div>

              {/* Amount Field */}
              <div className={`form-field ${errors.amount ? 'has-error' : ''}`}>
                <label htmlFor="amount" className="field-label">
                  <FiDollarSign className="field-icon" />
                  Montant
                </label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  className="field-input"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                />
                {errors.amount && <span className="error-message">{errors.amount}</span>}
              </div>

              {/* Category Field */}
              <div className={`form-field ${errors.category ? 'has-error' : ''}`}>
                <label htmlFor="category" className="field-label">
                  <FiTag className="field-icon" />
                  Catégorie
                </label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="field-input"
                  placeholder="Ex: Nourriture, Salaire..."
                />
                {errors.category && <span className="error-message">{errors.category}</span>}
              </div>

              {/* Date Field */}
              <div className={`form-field ${errors.date ? 'has-error' : ''}`}>
                <label htmlFor="date" className="field-label">
                  <FiCalendar className="field-icon" />
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="field-input"
                />
                {errors.date && <span className="error-message">{errors.date}</span>}
              </div>

              {/* Description Field */}
              <div className="form-field full-width">
                <label htmlFor="description" className="field-label">
                  <FiFileText className="field-icon" />
                  Description (Optionnel)
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="field-textarea"
                  rows="3"
                  placeholder="Ajoutez des détails..."
                />
              </div>
            </div>

            <div className="form-actions">
              <motion.button
                type="button"
                className="cancel-button"
                onClick={onClose}
                disabled={isSubmitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Annuler
              </motion.button>
              <motion.button
                type="submit"
                className="submit-button"
                disabled={isSubmitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isSubmitting ? (
                  <span className="loading-text">En cours...</span>
                ) : transaction ? (
                  'Mettre à jour'
                ) : (
                  'Ajouter Transaction'
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TransactionForm;