import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiRefreshCw, FiAlertCircle, FiSearch, FiEdit2, FiTrash2, FiUser, FiBriefcase, FiCalendar, FiEye, FiDownload } from 'react-icons/fi';
import { employeeAPI } from '../services/Api';
import EmployeeForm from '../components/Employees/EmployeeForm';
import EmployeeInfo from '../components/Employees/EmployeeInfo';
import Sidebar from '../components/Dashboard/Sidebar';
import ConfirmationModal from '../components/Common/ConfirmationModal';
import '../styles/employeesPage.css';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../Auth/AuthHelpers';

const EmployeesPage = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
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
      const worksheet = workbook.addWorksheet('Employés');

      worksheet.columns = [
        { header: 'Nom', key: 'name', width: 25 },
        { header: 'Poste', key: 'position', width: 25 },
        { header: 'Statut', key: 'status', width: 15 },
        { header: 'Date d\'embauche', key: 'startDate', width: 20 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'Téléphone', key: 'phoneNumber', width: 20 },
        { header: 'Niveau d\'étude', key: 'educationLevel', width: 20 },
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

      filteredEmployees.forEach(employee => {
        const row = worksheet.addRow({
          name: employee.name,
          position: employee.position,
          status: employee.status,
          startDate: new Date(employee.startDate).toLocaleDateString('fr-FR'),
          email: employee.email || '-',
          phoneNumber: employee.phoneNumber || '-',
          educationLevel: employee.educationLevel || '-',
          description: employee.description || '-'
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

        if (employee.status === 'inactive') {
          row.getCell('status').fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFC7CE' } 
          };
        } else if (employee.status === 'congé') {
          row.getCell('status').fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFEB9C' } 
          };
        } else if (employee.status === 'active') {
          row.getCell('status').fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFC6EFCE' } 
          };
        }else if (employee.status === 'essai') {
            row.getCell('status').fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: '0ECAF0' } 
            };
          }
      });

      const footerRow = worksheet.addRow([]);
      const footerCell = worksheet.mergeCells(`A${footerRow.number}:H${footerRow.number}`);
      const footer = worksheet.getCell(`A${footerRow.number}`);
      footer.value = `Exporté le ${new Date().toLocaleDateString('fr-FR')}`;
      footer.font = { italic: true };
      footer.alignment = { horizontal: 'right' };

      // Génération du fichier
      const buffer = await workbook.xlsx.writeBuffer();
      const data = new Blob([buffer], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0];
      saveAs(data, `employes_${dateStr}.xlsx`);

    } catch (error) {
      console.error("Erreur lors de l'export Excel:", error);
      setError("Erreur lors de l'export Excel");
    }
  };

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await employeeAPI.getAll();
      setEmployees(response.data);
      setFilteredEmployees(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des employés:", error);
      setError("Erreur lors du chargement des employés");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    let result = employees;
    
    if (statusFilter !== 'all') {
      result = result.filter(e => e.status === statusFilter);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(e => 
        e.name.toLowerCase().includes(term) || 
        e.position.toLowerCase().includes(term)
      );
    }
    
    setFilteredEmployees(result);
  }, [employees, searchTerm, statusFilter]);

  const handleAddEmployee = async (employeeData) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await employeeAPI.add(employeeData);
      setEmployees([response.data, ...employees]);
      setIsFormOpen(false);
      return { success: true };
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'employé:", error);
      setError("Erreur lors de l'ajout de l'employé");
      return { success: false, error: error.response?.data?.error || "Une erreur est survenue" };
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateEmployee = async (id, employeeData) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await employeeAPI.update(id, employeeData);
      const updatedEmployees = employees.map(e => e._id === id ? response.data : e);
      setEmployees(updatedEmployees);
      setEditingEmployee(null);
      setIsFormOpen(false);
      setIsInfoOpen(false);
      return { success: true };
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'employé:", error);
      setError("Erreur lors de la mise à jour de l'employé");
      return { success: false, error: error.response?.data?.error || "Une erreur est survenue" };
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEmployee = async () => {
    if (!deleteId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      await employeeAPI.delete(deleteId);
      setEmployees(employees.filter(e => e._id !== deleteId));
      setDeleteId(null);
      setIsInfoOpen(false);
    } catch (error) {
      console.error("Erreur lors de la suppression de l'employé:", error);
      setError("Erreur lors de la suppression de l'employé");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewEmployee = (employee) => {
    setSelectedEmployee(employee);
    setIsInfoOpen(true);
  };

  const statusOptions = ['all', 'active', 'inactive', 'congé', 'essai'];

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

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
          <h1 className="text-center page-title mt-4 mb-3 d-block d-md-none">Employé(e)s</h1>
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
            <h1 className="page-title d-none d-md-block">Employé(e)s</h1>
            

            <div className="d-flex flex-wrap gap-2">
              <button 
                className="btn btn-primary"
                onClick={() => {
                  setEditingEmployee(null);
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
                disabled={isLoading || filteredEmployees.length === 0}
              >
                <FiDownload className="me-2" />
                Export Excel
              </button>

              <button 
                className="btn btn-outline-secondary"
                onClick={fetchEmployees}
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
                  placeholder="Rechercher par nom ou poste..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="d-flex align-items-center">
                <select
                  id="statusFilter"
                  className="form-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  {statusOptions.map(status => (
                    <option key={status} value={status}>
                      {status === 'all' ? 'Tous statuts' : status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Liste des employés */}
          <div className="card">
            <div className="card-body">
              {isLoading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Chargement...</span>
                  </div>
                </div>
              ) : filteredEmployees.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  Aucun employé trouvé
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Nom</th>
                        <th>Poste</th>
                        <th>Date d'embauche</th>
                        <th>Statut</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEmployees.map(employee => (
                        <tr key={employee._id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="employe-avatar me-3">
                                <FiUser />
                              </div>
                              <div>
                                <div className="fw-bold">{employee.name}</div>
                                <small className="text-muted">{employee.email}</small>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <FiBriefcase className="me-2 text-muted" />
                              {employee.position}
                            </div>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <FiCalendar className="me-2 text-muted" />
                              {formatDate(employee.startDate)}
                            </div>
                          </td>
                          <td>
                            <span className={`badge ${getStatusBadgeClass(employee.status)}`}>
                              {employee.status}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex gap-2">
                              <button 
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => handleViewEmployee(employee)}
                              >
                                <FiEye />
                              </button>
                              <button 
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => {
                                  setEditingEmployee(employee);
                                  setIsFormOpen(true);
                                }}
                              >
                                <FiEdit2 />
                              </button>
                              <button 
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => setDeleteId(employee._id)}
                              >
                                <FiTrash2 />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isFormOpen && (
            <EmployeeForm
              employee={editingEmployee}
              onAdd={handleAddEmployee}
              onUpdate={handleUpdateEmployee}
              onClose={() => {
                setIsFormOpen(false);
                setEditingEmployee(null);
              }}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isInfoOpen && (
            <EmployeeInfo 
              employee={selectedEmployee} 
              onEdit={() => {
                setEditingEmployee(selectedEmployee);
                setIsFormOpen(true);
                setIsInfoOpen(false);
              }}
              onClose={() => setIsInfoOpen(false)}
            />
          )}
        </AnimatePresence>

        <ConfirmationModal
          isOpen={!!deleteId}
          onClose={() => setDeleteId(null)}
          onConfirm={handleDeleteEmployee}
          title="Confirmer la suppression"
          message="Êtes-vous sûr de vouloir supprimer cet employé ?"
          confirmText="Supprimer"
          cancelText="Annuler"
        />
      </motion.main>
    </div>
  );
};

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'active':
      return 'bg-success bg-opacity-10 text-success';
    case 'inactive':
      return 'bg-danger bg-opacity-10 text-danger';
    case 'congé':
      return 'bg-warning bg-opacity-10 text-warning';
    case 'essai':
      return 'bg-info bg-opacity-10 text-info';
    default:
      return 'bg-secondary bg-opacity-10 text-secondary';
  }
};

export default EmployeesPage;