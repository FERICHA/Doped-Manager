import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiRefreshCw, FiAlertCircle, FiSearch, FiDownload } from 'react-icons/fi';
import { productAPI } from '../services/Api';
import ProductForm from '../components/Products/ProductForm';
import ProductList from '../components/Products/ProductList';
import LowStockProducts from '../components/Products/LowStockProducts';
import Sidebar from '../components/Dashboard/Sidebar';
import ConfirmationModal from '../components/Common/ConfirmationModal';
import '../styles/productsPage.css';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../Auth/AuthHelpers';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
      const user = getCurrentUser();
      if (!user) {
        navigate('/login');
      }
    }, []);

  const exportToExcel = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Produits');

      worksheet.columns = [
        { header: 'Nom', key: 'name', width: 25 },
        { header: 'Catégorie', key: 'category', width: 20 },
        { header: 'Prix', key: 'price', width: 15, style: { numFmt: '#,##0.00' } },
        { header: 'Quantité', key: 'quantity', width: 15 },
        { header: 'Seuil d\'alerte', key: 'alertThreshold', width: 15 },
        { header: 'Statut', key: 'status', width: 15 },
        { header: 'Description', key: 'description', width: 40 }
      ];

      worksheet.getRow(1).eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: '667eea' } 
        };
        cell.font = {
          bold: true,
          color: { argb: 'FFFFFFFF' }, 
          size: 12
        };
        cell.alignment = { 
          vertical: 'middle', 
          horizontal: 'center',
          wrapText: true
        };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });

      filteredProducts.forEach(product => {
        const status = product.quantity <= product.alertThreshold ? 'Stock bas' : 'Disponible';
        const row = worksheet.addRow({
          name: product.name,
          category: product.category,
          price: product.price,
          quantity: product.quantity,
          alertThreshold: product.alertThreshold,
          status: status,
          description: product.description || '-'
        });

        row.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
          cell.alignment = { 
            vertical: 'middle',
            wrapText: true
          };
        });

        if (product.quantity <= product.alertThreshold) {
          row.getCell('status').fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFF0000' } 
          };
          row.getCell('status').font = {
            bold: true,
            color: { argb: 'FFFFFFFF' }
          };

          row.getCell('quantity').fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFC7CE' } 
          };
        } else {
          row.getCell('status').fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFC6EFCE' } 
          };
        }

        row.getCell('price').numFmt = '#,##0.00';
      });

      const footerRow = worksheet.addRow([]);
      const footerCell = worksheet.mergeCells(`A${footerRow.number}:H${footerRow.number}`);
      const footer = worksheet.getCell(`A${footerRow.number}`);
      footer.value = `Exporté le ${new Date().toLocaleDateString('fr-FR')}`;
      footer.font = { italic: true };
      footer.alignment = { horizontal: 'right' };

      const buffer = await workbook.xlsx.writeBuffer();
      const data = new Blob([buffer], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0];
      saveAs(data, `produits_${dateStr}.xlsx`);

    } catch (error) {
      console.error("Erreur lors de l'export Excel:", error);
      setError("Erreur lors de l'export Excel");
    }
  };

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [allResponse, lowStockResponse] = await Promise.all([
        productAPI.getAll(),
        productAPI.getLowStock(),
      ]);
      setProducts(allResponse.data);
      setFilteredProducts(allResponse.data);
      setLowStockProducts(lowStockResponse.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des produits:", error);
      setError("Erreur lors du chargement des produits");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    let result = products;
    
    if (categoryFilter !== 'all') {
      result = result.filter(p => p.category === categoryFilter);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(term) || 
        (p.description && p.description.toLowerCase().includes(term))
      );
    }
    
    setFilteredProducts(result);
  }, [products, searchTerm, categoryFilter]);

  const handleAddProduct = async (productData) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await productAPI.add(productData);
      setProducts([response.data, ...products]);
      if (response.data.quantity <= response.data.alertThreshold) {
        setLowStockProducts([response.data, ...lowStockProducts]);
      }
      setIsFormOpen(false);
      return { success: true };
    } catch (error) {
      console.error("Erreur lors de l'ajout du produit:", error);
      setError("Erreur lors de l'ajout du produit");
      return { success: false, error: error.response?.data?.error || "Une erreur est survenue" };
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProduct = async (id, productData) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await productAPI.update(id, productData);
      const updatedProducts = products.map(p => p._id === id ? response.data : p);
      setProducts(updatedProducts);
      
      const updatedLowStock = await productAPI.getLowStock();
      setLowStockProducts(updatedLowStock.data);
      
      setEditingProduct(null);
      setIsFormOpen(false);
      return { success: true };
    } catch (error) {
      console.error("Erreur lors de la mise à jour du produit:", error);
      setError("Erreur lors de la mise à jour du produit");
      return { success: false, error: error.response?.data?.error || "Une erreur est survenue" };
    } finally {
      setIsLoading(false);
    }
  };

  const handleSellProduct = async (productId, quantitySold) => {
  try {
    setIsLoading(true);
    setError(null);
    
    const productToSell = products.find(p => p._id === productId);
    
    if (!productToSell) {
      throw new Error("Produit non trouvé");
    }
    
    const newQuantity = productToSell.quantity - quantitySold;
    
    if (newQuantity < 0) {
      throw new Error("Quantité insuffisante en stock");
    }
    
    const updateData = {
      ...productToSell,
      quantity: newQuantity
    };
    
    const response = await productAPI.update(productId, updateData);
    
    const updatedProducts = products.map(p => 
      p._id === productId ? response.data : p
    );
    
    setProducts(updatedProducts);
    
    const updatedLowStock = await productAPI.getLowStock();
    setLowStockProducts(updatedLowStock.data);
    
    return { success: true };
  } catch (error) {
    console.error("Erreur lors de la vente du produit:", error);
    setError(error.message || "Erreur lors de la vente du produit");
    return { success: false, error: error.response?.data?.error || error.message };
  } finally {
    setIsLoading(false);
  }
};

  const handleDeleteProduct = async () => {
    if (!deleteId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      await productAPI.delete(deleteId);
      setProducts(products.filter(p => p._id !== deleteId));
      setLowStockProducts(lowStockProducts.filter(p => p._id !== deleteId));
      setDeleteId(null);
    } catch (error) {
      console.error("Erreur lors de la suppression du produit:", error);
      setError("Erreur lors de la suppression du produit");
    } finally {
      setIsLoading(false);
    }
  };

  const categories = ['all', ...new Set(products.map(p => p.category))];

  return (
    <div className="dashboard-layout">
      <Sidebar />
      
      <motion.main 
        className="main-content"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container-fluid py-4">
          <h1 className="page-title text-center mt-4 mb-3 d-block d-md-none">Produits</h1>
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
          <h1 className="page-title d-none d-md-block">Produits</h1>

          <div className="d-flex flex-wrap gap-2">
            <button 
              className="btn btn-primary"
              onClick={() => {
                setEditingProduct(null);
                setIsFormOpen(true);
              }}
              disabled={isLoading}
            >
              <FiPlus className="me-2" />
              Ajouter
            </button>

            <button 
              className="btn btn-success"
              onClick={exportToExcel}
              disabled={isLoading || filteredProducts.length === 0}
            >
              <FiDownload className="me-2" />
              Export Excel
            </button>

            <button 
              className="btn btn-outline-secondary"
              onClick={fetchProducts}
              disabled={isLoading}
            >
              <FiRefreshCw className={isLoading ? "spin" : ""} />
            </button>
          </div>
        </div>


          {error && (
            <div className="alert alert-danger d-flex align-items-center mb-4">
              <FiAlertCircle className="me-2" />
              {error}
              <button 
                type="button" 
                className="btn-close ms-auto" 
                onClick={() => setError(null)}
              />
            </div>
          )}

          {/* Barre de recherche et filtres */}
          <div className="row mb-4">
            <div className="col-md-6 mb-3 mb-md-0">
              <div className="input-group">
                <span className="input-group-text">
                  <FiSearch />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Rechercher par nom ou description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="d-flex align-items-center">
                <select
                  id="categoryFilter"
                  className="form-select"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'Toutes catégories' : category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-4 mb-4 mb-lg-0">
              <div className="card h-100">
                <div className="card-body">
                  <LowStockProducts products={lowStockProducts} />
                </div>
              </div>
            </div>
            <div className="col-lg-8">
              <div className="card h-100">
                <div className="card-body">
                  <ProductList 
                    products={filteredProducts}
                    onEdit={(product) => {
                      setEditingProduct(product);
                      setIsFormOpen(true);
                    }}
                    onDelete={setDeleteId}
                    onSell={handleSellProduct}
                    isLoading={isLoading}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isFormOpen && (
            <ProductForm
              product={editingProduct}
              onAdd={handleAddProduct}
              onUpdate={handleUpdateProduct}
              onClose={() => {
                setIsFormOpen(false);
                setEditingProduct(null);
              }}
            />
          )}
        </AnimatePresence>

        <ConfirmationModal
          isOpen={!!deleteId}
          onClose={() => setDeleteId(null)}
          onConfirm={handleDeleteProduct}
          title="Confirmer la suppression"
          message="Êtes-vous sûr de vouloir supprimer ce produit ?"
          confirmText="Supprimer"
          cancelText="Annuler"
        />
      </motion.main>
    </div>
  );
};

export default ProductsPage;