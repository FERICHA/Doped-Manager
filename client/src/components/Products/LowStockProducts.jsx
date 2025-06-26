import React from 'react';
import { FiAlertTriangle } from 'react-icons/fi';
import { motion } from 'framer-motion';

const LowStockProducts = ({ products }) => {
  // Vérifie si products est défini avant de l'utiliser
  if (!products || products.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="alert alert-success mb-0"
      >
        Aucun produit en stock faible. Tous les niveaux de stock sont suffisants.
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="low-stock-container"
    >
      <h4 className="d-flex align-items-center text-danger mb-3">
        <FiAlertTriangle className="me-2" />
        Produits en stock critique
      </h4>
      
      <div className="list-group">
        {products.map((product, index) => (
          <motion.div
            key={product._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
          >
            <div>
              <strong>{product.name}</strong>
              <div className="text-muted small">{product.category}</div>
            </div>
            
            <div className="text-end">
              <span className="badge bg-danger rounded-pill me-2">
                {product.quantity} unité(s)
              </span>
              <div className="text-muted small">
                Seuil: {product.threshold}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default LowStockProducts;