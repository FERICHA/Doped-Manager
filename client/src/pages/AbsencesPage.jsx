import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiRefreshCw, FiAlertCircle, FiSearch, FiEdit2, FiTrash2, FiUser, FiEye, FiDownload } from 'react-icons/fi';
import { absenceAPI, employeeAPI } from '../services/Api'; 
import AbsenceForm from '../components/Absences/AbsenceForm';
import AbsenceInfo from '../components/Absences/AbsenceInfo';
import Sidebar from '../components/Dashboard/Sidebar';
import ConfirmationModal from '../components/Common/ConfirmationModal';
import '../styles/absencesPage.css';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../Auth/AuthHelpers';

const AbsencesPage = () => {
  const [absences, setAbsences] = useState([]);
  const [employees, setEmployees] = useState([]); 
  const [filteredAbsences, setFilteredAbsences] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [selectedAbsence, setSelectedAbsence] = useState(null);
  const [editingAbsence, setEditingAbsence] = useState(null);
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
      const worksheet = workbook.addWorksheet('Absences');

      worksheet.columns = [
        { header: 'Employé', key: 'employee', width: 25 },
        { header: 'Date début', key: 'startDate', width: 20 },
        { header: 'Date fin', key: 'endDate', width: 20 },
        { header: 'Durée (jours)', key: 'duration', width: 15 },
        { header: 'Motif', key: 'reason', width: 25 },
        { header: 'Statut', key: 'status', width: 15 },
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

      filteredAbsences.forEach(absence => {
        const duration = calculateDuration(absence.startDate, absence.endDate);
        const row = worksheet.addRow({
          employee: absence.employeeId?.name || 'N/A',
          startDate: new Date(absence.startDate).toLocaleDateString('fr-FR'),
          endDate: new Date(absence.endDate).toLocaleDateString('fr-FR'),
          duration: duration,
          reason: absence.reason,
          status: getStatusLabel(absence.status)
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

        if (absence.status === 'rejected') {
          row.getCell('status').fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFC7CE' }
          };
        } else if (absence.status === 'pending') {
          row.getCell('status').fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFEB9C' }
          };
        } else {
          row.getCell('status').fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFC6EFCE' }
          };
        }
      });

      const footerRow = worksheet.addRow([]);
      const footerCell = worksheet.mergeCells(`A${footerRow.number}:F${footerRow.number}`);
      const footer = worksheet.getCell(`A${footerRow.number}`);
      footer.value = `Exporté le ${new Date().toLocaleDateString('fr-FR')}`;
      footer.font = { italic: true };
      footer.alignment = { horizontal: 'right' };

      const buffer = await workbook.xlsx.writeBuffer();
      const data = new Blob([buffer], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
      saveAs(data, `absences_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
      console.error("Erreur lors de l'export Excel:", error);
      setError("Erreur lors de l'export Excel");
    }
  };
  
  const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
    
        const [absencesResponse, employeesResponse] = await Promise.all([
          absenceAPI.getAll(),
          employeeAPI.getAll()
        ]);
    
        const employeesList = employeesResponse.data;
        setEmployees(employeesList);
    
        const enrichedAbsences = absencesResponse.data.map(absence => {
          const employeeId = absence.employeeId?._id;
          const employee = employeesList.find(emp => emp._id === employeeId);
          console.log("Employé trouvé :", employee);
          return {
            ...absence,
            employeeName: employee ? employee.name : 'Inconnu'
          };
        });
    
        setAbsences(enrichedAbsences);
        setFilteredAbsences(enrichedAbsences);
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        setError(error.response?.data?.error || "Erreur lors du chargement des données");
      } finally {
        setIsLoading(false);
      }
    };
    

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let result = absences;
    
    if (statusFilter !== 'all') {
      result = result.filter(a => a.status === statusFilter);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(a => {
        const employeeName = a.employeeId?.name?.toLowerCase() || '';
        return (
          employeeName.includes(term) || 
          a.reason.toLowerCase().includes(term)
        );
      });
    }
    
    setFilteredAbsences(result);
  }, [absences, searchTerm, statusFilter]);

  const handleAddAbsence = async (absenceData) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await absenceAPI.add(absenceData);
      setAbsences([response.data, ...absences]);
      setIsFormOpen(false);
      return { success: true };
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'absence:", error);
      const errorMsg = error.response?.data?.error || "Erreur lors de l'ajout de l'absence";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateAbsence = async (id, absenceData) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await absenceAPI.update(id, absenceData);
      
      const updated = response.data;
      const employee = employees.find(e => e._id === updated.employeeId);
      
      if (employee) {
        updated.employeeId = employee; 
      }
  
      const updatedAbsences = absences.map(a => a._id === id ? updated : a);
      setAbsences(updatedAbsences);
      setEditingAbsence(null);
      setIsFormOpen(false);
      setIsInfoOpen(false);
      return { success: true };
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'absence:", error);
      const errorMsg = error.response?.data?.error || "Erreur lors de la mise à jour de l'absence";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };
  

  const handleDeleteAbsence = async () => {
    if (!deleteId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      await absenceAPI.delete(deleteId);
      setAbsences(absences.filter(a => a._id !== deleteId));
      setDeleteId(null);
      setIsInfoOpen(false);
    } catch (error) {
      console.error("Erreur lors de la suppression de l'absence:", error);
      setError(error.response?.data?.error || "Erreur lors de la suppression de l'absence");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewAbsence = (absence) => {
    setSelectedAbsence(absence);
    setIsInfoOpen(true);
  };

  const statusOptions = ['all', 'pending', 'approved', 'rejected'];

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  const calculateDuration = (startDate, endDate) => {
    const diffTime = Math.abs(new Date(endDate) - new Date(startDate));
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
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
          <h1 className="page-title text-center mt-4 mb-3 d-block d-md-none">Absences</h1>
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
            <h1 className="page-title  d-none d-md-block">Absences</h1>

            <div className="d-flex flex-wrap gap-2">
              <button 
                className="btn btn-primary"
                onClick={() => {
                  setEditingAbsence(null);
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
                disabled={isLoading || filteredAbsences.length === 0}
              >
                <FiDownload className="me-2" />
                Export Excel
              </button>

              <button 
                className="btn btn-outline-secondary"
                onClick={fetchData}
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

          <div className="row mb-4">
            <div className="col-md-6 mb-3 mb-md-0">
              <div className="input-group">
                <span className="input-group-text">
                  <FiSearch />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Rechercher par employé ou motif..."
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
                      {status === 'all' ? 'Tous statuts' : getStatusLabel(status)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              {isLoading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Chargement...</span>
                  </div>
                </div>
              ) : filteredAbsences.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  Aucune absence trouvée
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Employé(e)</th>
                        <th>Période</th>
                        <th>Durée</th>
                        <th>Motif</th>
                        <th>Statut</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAbsences.map(absence => (
                        <tr key={absence._id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="employe-avatar me-3">
                                <FiUser />
                              </div>
                              <div>
                                <div className="fw-bold">{absence.employeeName || 'Données Enregistrées'}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="d-flex flex-column">
                              <span>Du {formatDate(absence.startDate)}</span>
                              <span>Au {formatDate(absence.endDate)}</span>
                            </div>
                          </td>
                          <td>
                            {calculateDuration(absence.startDate, absence.endDate)} jours
                          </td>
                          <td>
                            <div className="text-truncate" style={{maxWidth: '150px'}}>
                              {absence.reason}
                            </div>
                          </td>
                          <td>
                            <span className={`badge ${getStatusBadgeClass(absence.status)}`}>
                              {getStatusLabel(absence.status)}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex gap-2">
                              <button 
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => handleViewAbsence(absence)}
                              >
                                <FiEye />
                              </button>
                              <button 
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => {
                                  setEditingAbsence(absence);
                                  setIsFormOpen(true);
                                }}
                              >
                                <FiEdit2 />
                              </button>
                              <button 
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => setDeleteId(absence._id)}
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
            <AbsenceForm
              absence={editingAbsence}
              employees={employees} 
              onAdd={handleAddAbsence}
              onUpdate={handleUpdateAbsence}
              onClose={() => {
                setIsFormOpen(false);
                setEditingAbsence(null);
              }}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isInfoOpen && (
            <AbsenceInfo 
              absence={selectedAbsence} 
              onEdit={() => {
                setEditingAbsence(selectedAbsence);
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
          onConfirm={handleDeleteAbsence}
          title="Confirmer la suppression"
          message="Êtes-vous sûr de vouloir supprimer cette absence ?"
          confirmText="Supprimer"
          cancelText="Annuler"
        />
      </motion.main>
    </div>
  );
};

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'approved':
      return 'bg-success bg-opacity-10 text-success';
    case 'rejected':
      return 'bg-danger bg-opacity-10 text-danger';
    case 'pending':
      return 'bg-warning bg-opacity-10 text-warning';
    default:
      return 'bg-secondary bg-opacity-10 text-secondary';
  }
};

const getStatusLabel = (status) => {
  switch (status) {
    case 'approved': return 'Approuvé';
    case 'rejected': return 'Rejeté';
    case 'pending': return 'En attente';
    default: return status;
  }
};

export default AbsencesPage;