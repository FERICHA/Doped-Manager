import React, { useState } from 'react';
import { FiEdit, FiTrash2, FiDollarSign } from 'react-icons/fi';

const ProductList = ({ products, onEdit, onDelete, isLoading, onSell }) => {
  const [sellingProduct, setSellingProduct] = useState(null);
  const [quantitySold, setQuantitySold] = useState(1);

  const handleSellClick = (product) => {
    setSellingProduct(product);
    setQuantitySold(1); 
  };

  const handleSellSubmit = (e) => {
    e.preventDefault();
    if (quantitySold > 0 && quantitySold <= sellingProduct.quantity) {
      onSell(sellingProduct._id, quantitySold);
      setSellingProduct(null);
    }
  };

  if (isLoading) {
    return <div className="loading">Chargement des produits...</div>;
  }

  if (products.length === 0) {
    return <div className="no-data">Aucun produit trouvé</div>;
  }

  return (
    <div className="table-responsive">
      <table className="table">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Catégorie</th>
            <th>Prix</th>
            <th>Quantité</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map(product => (
            <React.Fragment key={product._id}>
              <tr className={product.quantity <= product.threshold ? 'low-stock' : ''}>
                <td>{product.name}</td>
                <td>{product.category}</td>
                <td>{product.price.toFixed(2)} DHS</td>
                <td>{product.quantity}</td>
                <td>
                  <button 
                    onClick={() => handleSellClick(product)} 
                    className="btn btn-sm btn-outline-success me-2 mt-1"
                    title="Vendre"
                  >
                    <FiDollarSign />
                  </button>
                  <button 
                    onClick={() => onEdit(product)} 
                    className="btn btn-sm btn-outline-primary me-2 mt-1"
                    title="Modifier"
                  >
                    <FiEdit />
                  </button>
                  <button 
                    onClick={() => onDelete(product._id)} 
                    className="btn btn-sm btn-outline-danger mt-1"
                    title="Supprimer"
                  >
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
              
              {/* Ligne de saisie pour la vente */}
              {sellingProduct && sellingProduct._id === product._id && (
                <tr className="sell-row">
                  <td colSpan="5">
                    <form onSubmit={handleSellSubmit} className="d-flex align-items-center">
                      <div className="me-3">
                        <label htmlFor="quantity" className="form-label me-2">
                          Quantité vendue:
                        </label>
                        <input
                          type="number"
                          id="quantity"
                          className="form-control"
                          min="1"
                          max={sellingProduct.quantity}
                          value={quantitySold}
                          onChange={(e) => setQuantitySold(parseInt(e.target.value) || '')}
                          style={{ width: '80px' }}
                        />
                        <span className="ms-2">/ {sellingProduct.quantity} disponible(s)</span>
                      </div>
                      
                      <div className="d-flex">
                        <button 
                          type="submit" 
                          className="btn btn-sm btn-success me-2"
                          disabled={quantitySold <= 0 || quantitySold > sellingProduct.quantity}
                        >
                          Confirmer
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => setSellingProduct(null)}
                        >
                          Annuler
                        </button>
                      </div>
                    </form>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductList;