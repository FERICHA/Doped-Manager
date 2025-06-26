import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiRefreshCw, FiAlertCircle, FiSearch, FiDownload } from 'react-icons/fi';
import { transactionAPI } from '../services/Api';
import TransactionForm from '../components/Transactions/TransactionForm';
import TransactionList from '../components/Transactions/TransactionList';
import RecentTransactions from '../components/Transactions/RecentTransactions';
import TransactionStats from '../components/Transactions/TransactionStats';
import Sidebar from '../components/Dashboard/Sidebar';
import '../styles/transactionsPage.css';
import ConfirmationModal from '../components/Common/ConfirmationModal';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../Auth/AuthHelpers';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [transactionFilter, setTransactionFilter] = useState('all');
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
      const user = getCurrentUser();
      if (!user) {
        navigate('/login');
      }
    }, []);

    const exportToExcel = async () => {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Transactions');
    
      worksheet.columns = [
        { header: 'Type', key: 'type', width: 12 },
        { header: 'Montant', key: 'amount', width: 15 },
        { header: 'Catégorie', key: 'category', width: 20 },
        { header: 'Description', key: 'description', width: 30 },
        { header: 'Date', key: 'date', width: 15 }
      ];
    
      worksheet.getRow(1).eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: '667eea' }
        };
        cell.font = {
          bold: true,
          color: { argb: 'FFFFFFFF' }
        };
        cell.alignment = { horizontal: 'center' };
      });
    
      filteredTransactions.forEach(transaction => {
        const row = worksheet.addRow({
          type: transaction.type === 'income' ? 'Revenu' : 'Dépense',
          amount: transaction.amount,
          category: transaction.category,
          description: transaction.description || '',
          date: new Date(transaction.date).toLocaleDateString('fr-FR')
        });
    
        const color = transaction.type === 'income' ? 'FFC6EFCE' : 'FFFFC7CE';
        const fontColor = transaction.type === 'income' ? 'FF006100' : 'FF9C0006';
        
        row.eachCell((cell) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: color }
          };
          cell.font = {
            bold: true,
            color: { argb: fontColor }
          };
        });
      });
    
      const buffer = await workbook.xlsx.writeBuffer();
      const data = new Blob([buffer], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0];
      saveAs(data, `transactions_${dateStr}.xlsx`);
    };

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [allResponse, recentResponse] = await Promise.all([
        transactionAPI.getAll(),
        transactionAPI.getRecent(),
      ]);
      setTransactions(allResponse.data);
      setFilteredTransactions(allResponse.data);
      setRecentTransactions(recentResponse.data);
      calculateStats(allResponse.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des transactions:", error);
      setError("Erreur lors du chargement des transactions");
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (transactions) => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    setStats({
      totalIncome: income,
      totalExpense: expense,
      balance: income - expense
    });
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    let result = transactions;
    
    if (transactionFilter !== 'all') {
      result = result.filter(t => t.type === transactionFilter);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(t => {
        const nameMatch = t.name?.toLowerCase().includes(term) || false;
        const descMatch = t.description?.toLowerCase().includes(term) || false;
        return nameMatch || descMatch;
      });
    }
    
    setFilteredTransactions(result);
  }, [transactions, searchTerm, transactionFilter]);

  const handleAddTransaction = async (transactionData) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await transactionAPI.add(transactionData);
      const updatedTransactions = [response.data, ...transactions];
      setTransactions(updatedTransactions);
      setRecentTransactions([response.data, ...recentTransactions.slice(0, 4)]);
      calculateStats(updatedTransactions);
      setIsFormOpen(false);
      return { success: true };
    } catch (error) {
      console.error("Erreur lors de l'ajout de la transaction:", error);
      setError("Erreur lors de l'ajout de la transaction");
      return { success: false, error: error.response?.data?.error || "Une erreur est survenue" };
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateTransaction = async (id, transactionData) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await transactionAPI.update(id, transactionData);
      const updatedTransactions = transactions.map(t => t._id === id ? response.data : t);
      setTransactions(updatedTransactions);
      setRecentTransactions(recentTransactions.map(t => t._id === id ? response.data : t));
      calculateStats(updatedTransactions);
      setEditingTransaction(null);
      setIsFormOpen(false);
      return { success: true };
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la transaction:", error);
      setError("Erreur lors de la mise à jour de la transaction");
      return { success: false, error: error.response?.data?.error || "Une erreur est survenue" };
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTransaction = async () => {
    if (!deleteId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      await transactionAPI.delete(deleteId);
      const updatedTransactions = transactions.filter(t => t._id !== deleteId);
      setTransactions(updatedTransactions);
      setRecentTransactions(recentTransactions.filter(t => t._id !== deleteId));
      calculateStats(updatedTransactions);
      setDeleteId(null);
    } catch (error) {
      console.error("Erreur lors de la suppression de la transaction:", error);
      setError("Erreur lors de la suppression de la transaction");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (transaction) => {
    setEditingTransaction(transaction);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
  };

  const pageVariants = {
    initial: { opacity: 0, x: -20 },
    animate: { 
      opacity: 1,
      x: 0,
      transition: { 
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    },
    exit: { opacity: 0, x: 20 }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      
      <motion.main 
        className="main-content"
        initial="initial"
        animate="animate"
        variants={pageVariants}
      >
        <div className="container-fluid py-4">
          <h1 className="page-title text-center mt-4 mb-3 d-block d-md-none">Transactions</h1>
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
          <h1 className="page-title d-none d-md-block">Transactions</h1>

          <div className="d-flex flex-wrap gap-2 ">
            <button 
              className="btn btn-primary"
              onClick={() => {
                setEditingTransaction(null);
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
              disabled={isLoading || filteredTransactions.length === 0}
            >
              <FiDownload className="me-2" />
              Export Excel
            </button>

            <button 
              className="btn btn-outline-secondary"
              onClick={fetchTransactions}
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
                  id="transactionFilter"
                  className="form-select"
                  value={transactionFilter}
                  onChange={(e) => setTransactionFilter(e.target.value)}
                >
                  <option value="all">Toutes les transactions</option>
                  <option value="income">Revenus seulement</option>
                  <option value="expense">Dépenses seulement</option>
                </select>
              </div>
            </div>
          </div>

          <TransactionStats stats={stats} />

          <div className="row mt-4">
            <div className="col-lg-8">
              <TransactionList 
                transactions={filteredTransactions}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
                isLoading={isLoading}
              />
            </div>
            <div className="col-lg-4">
              <RecentTransactions 
                transactions={recentTransactions} 
                onEdit={handleEditClick}
              />
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isFormOpen && (
            <TransactionForm
              transaction={editingTransaction}
              onAdd={handleAddTransaction}
              onUpdate={handleUpdateTransaction}
              onClose={() => {
                setIsFormOpen(false);
                setEditingTransaction(null);
              }}
            />
          )}
        </AnimatePresence>

        <ConfirmationModal
          isOpen={!!deleteId}
          onClose={() => setDeleteId(null)}
          onConfirm={handleDeleteTransaction}
          title="Confirmer la suppression"
          message="Êtes-vous sûr de vouloir supprimer cette transaction ?"
          confirmText="Supprimer"
          cancelText="Annuler"
        />
      </motion.main>
    </div>
  );
};

export default TransactionsPage;