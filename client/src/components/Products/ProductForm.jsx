import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiPackage, FiDollarSign, FiHash, FiAlertCircle, FiList } from 'react-icons/fi';

const ProductForm = ({ product, onAdd, onUpdate, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    quantity: 0,
    category: '',
    alertThreshold: 5
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || 0,
        quantity: product.quantity || 0,
        category: product.category || '',
        alertThreshold: product.alertThreshold || 5
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'quantity' || name === 'alertThreshold' 
        ? parseFloat(value) || '' 
        : value
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Nom requis';
    if (!formData.price || isNaN(formData.price)) newErrors.price = 'Prix invalide';
    if (!formData.quantity || isNaN(formData.quantity)) newErrors.quantity = 'Quantité invalide';
    if (!formData.category) newErrors.category = 'Catégorie requise';
    if (!formData.alertThreshold || isNaN(formData.alertThreshold)) newErrors.alertThreshold = 'Seuil invalide';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      if (product) {
        await onUpdate(product._id, formData);
      } else {
        await onAdd(formData);
      }
    } catch (error) {
      console.error('Erreur formulaire produit:', error);
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
              {product ? 'Modifier Produit' : 'Nouveau Produit'}
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
              <div className={`form-field ${errors.name ? 'has-error' : ''}`}>
                <label htmlFor="name" className="field-label">
                  <FiPackage className="field-icon" />
                  Nom du produit
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="field-input"
                  placeholder="Ex: iPhone 13"
                />
                {errors.name && <span className="error-message">{errors.name}</span>}
              </div>

              <div className={`form-field ${errors.price ? 'has-error' : ''}`}>
                <label htmlFor="price" className="field-label">
                  <FiDollarSign className="field-icon" />
                  Prix (DHS)
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="field-input"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                />
                {errors.price && <span className="error-message">{errors.price}</span>}
              </div>

              <div className={`form-field ${errors.quantity ? 'has-error' : ''}`}>
                <label htmlFor="quantity" className="field-label">
                  <FiHash className="field-icon" />
                  Quantité en stock
                </label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  className="field-input"
                  min="0"
                  placeholder="0"
                />
                {errors.quantity && <span className="error-message">{errors.quantity}</span>}
              </div>

              <div className={`form-field ${errors.category ? 'has-error' : ''}`}>
                <label htmlFor="category" className="field-label">
                  <FiList className="field-icon" />
                  Catégorie
                </label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="field-input"
                  placeholder="Ex: Électronique, Alimentation"
                />
                {errors.category && <span className="error-message">{errors.category}</span>}
              </div>

              <div className={`form-field ${errors.alertThreshold ? 'has-error' : ''}`}>
                <label htmlFor="alertThreshold" className="field-label">
                  <FiAlertCircle className="field-icon" />
                  Seuil d'alerte
                </label>
                <input
                  type="number"
                  id="alertThreshold"
                  name="alertThreshold"
                  value={formData.alertThreshold}
                  onChange={handleChange}
                  className="field-input"
                  min="1"
                  placeholder="5"
                />
                {errors.alertThreshold && <span className="error-message">{errors.alertThreshold}</span>}
              </div>

              <div className="form-field full-width">
                <label htmlFor="description" className="field-label">
                  <FiList className="field-icon" />
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="field-textarea"
                  rows="3"
                  placeholder="Description détaillée du produit..."
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
                ) : product ? (
                  'Mettre à jour'
                ) : (
                  'Ajouter Produit'
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ProductForm;