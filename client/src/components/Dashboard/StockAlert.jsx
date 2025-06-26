import React, { useState, useEffect } from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { FiAlertTriangle, FiPackage } from 'react-icons/fi';
import { productAPI } from '../../services/Api';
import { useNavigate } from 'react-router-dom';


ChartJS.register(ArcElement, Tooltip, Legend);

const StockAlert = () => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [stockData, setStockData] = useState({ ok: 0, low: 0, out: 0 });
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();


  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [allResponse, lowStockResponse] = await Promise.all([
          productAPI.getAll(),
          productAPI.getLowStock()
        ]);

        const allProducts = allResponse.data;
        const lowStock = lowStockResponse.data;

        const okStock = allProducts.filter(p => p.quantity > p.alertThreshold).length;
        const lowStockCount = allProducts.filter(p =>
          p.quantity <= p.alertThreshold && p.quantity > 0
        ).length;
        const outOfStock = allProducts.filter(p => p.quantity === 0).length;

        setStockData({ ok: okStock, low: lowStockCount, out: outOfStock });
        setLowStockProducts(lowStock);
      } catch (err) {
        console.error("Erreur de chargement des données:", err);
        setError("Erreur lors du chargement des données de stock");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStockData();
  }, []);

  const chartData = {
    labels: ['Stock OK', 'Stock Faible', 'Rupture'],
    datasets: [
      {
        data: [stockData.ok, stockData.low, stockData.out],
        backgroundColor: ['#198754', '#ffc107', '#dc3545'], 
        borderWidth: 0,
        hoverOffset: 10
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: windowWidth < 768 ? 'bottom' : 'right',
        labels: {
          boxWidth: 12,
          font: { size: 12 }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
    cutout: windowWidth < 768 ? '60%' : '70%'
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '250px' }}>
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger d-flex align-items-center" role="alert">
        <FiAlertTriangle className="me-2" />
        {error}
      </div>
    );
  }

  return (
    <div className="card shadow-sm border-0">
      <div className="card-body">
        <h5 className="card-title d-flex align-items-center mb-4">
          <FiAlertTriangle className="me-2 text-warning" />
          Aperçu du Stock
        </h5>

        <div className="row g-4">
          {/* Doughnut Chart */}
          <div className="col-md-6">
            <div style={{ height: '320px' }}>
              <Doughnut
                data={chartData}
                options={chartOptions}
                redraw={windowWidth < 768}
              />
            </div>
          </div>

          {/* Low Stock List */}
          <div className="col-md-6">
            <h6 className="mb-3 d-flex align-items-center">
              <FiPackage className="me-2 text-primary" />
              Produits en Alerte ({lowStockProducts.length})
            </h6>

            <div className="list-group overflow-auto" style={{ maxHeight: '250px' }}>
              {lowStockProducts.length > 0 ? (
                lowStockProducts.map(product => (
                  <div key={product._id} className="list-group-item d-flex justify-content-between align-items-center">
                    <span className="text-truncate" style={{ maxWidth: '70%' }}>
                      {product.name}
                    </span>
                    <span className={`badge rounded-pill ${
                      product.quantity === 0 ? 'bg-danger' : 'bg-warning text-dark'
                    }`}>
                      {product.quantity === 0 ? 'Rupture' : `${product.quantity} restant(s)`}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-muted small">Aucun produit en alerte de stock</div>
              )}
            </div>

            {windowWidth >= 768 && (
              <button
              onClick={() => navigate('/products')}
              className="btn btn-link mt-3 p-0 text-decoration-none">
                Voir tous les produits →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockAlert;
