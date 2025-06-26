import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCalendar, FiUser, FiInfo } from 'react-icons/fi';
import { employeeAPI } from '../../services/Api';

const AbsenceForm = ({ absence, onAdd, onUpdate, onClose }) => {
  const [formData, setFormData] = useState({
    employeeId: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    reason: '',
    status: 'pending'
  });

  const getStatusLabel = (status) => {
    switch (status) {
      case 'approved': return 'Approuvé';
      case 'rejected': return 'Rejeté';
      case 'pending': return 'En attente';
      default: return status;
    }
  };

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await employeeAPI.getAll();
        setEmployees(response.data);
      } catch (error) {
        console.error("Erreur lors du chargement des employés", error);
      }
    };
    
    fetchEmployees();
  }, []);

  useEffect(() => {
      if (absence && employees.length > 0) {
        const employeeObject = typeof absence.employeeId === 'string'
          ? employees.find(e => e._id === absence.employeeId)
          : absence.employeeId;
    
        setFormData({
          employeeId: employeeObject?._id || '',
          startDate: absence.startDate.split('T')[0],
          endDate: absence.endDate.split('T')[0],
          reason: absence.reason,
          status: absence.status
        });
      }
    }, [absence, employees]);
    
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.employeeId) newErrors.employeeId = 'Employé requis';
    if (!formData.startDate) newErrors.startDate = 'Date de début requise';
    if (!formData.endDate) newErrors.endDate = 'Date de fin requise';
    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      newErrors.endDate = 'La date de fin doit être après la date de début';
    }
    if (!formData.reason.trim()) newErrors.reason = 'Motif requis';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      if (absence) {
        await onUpdate(absence._id, formData);
      } else {
        await onAdd(formData);
      }
    } catch (error) {
      console.error('Erreur formulaire absence:', error);
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

  const statusOptions = ['pending', 'approved', 'rejected'];

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
              {absence ? 'Modifier Absence' : 'Nouvelle Absence'}
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
              <div className={`form-field ${errors.employeeId ? 'has-error' : ''}`}>
                <label htmlFor="employeeId" className="field-label">
                  <FiUser className="field-icon" />
                  Employé
                </label>
                <select
                  id="employeeId"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleChange}
                  className="field-input"
                  disabled={!!absence}
                >
                  <option value="">Sélectionner un employé</option>
                  {employees.map(employee => (
                    <option key={employee._id} value={employee._id}>
                      {employee.name}
                    </option>
                  ))}
                </select>
                {errors.employeeId && <span className="error-message">{errors.employeeId}</span>}
              </div>

              <div className={`form-field ${errors.startDate ? 'has-error' : ''}`}>
                <label htmlFor="startDate" className="field-label">
                  <FiCalendar className="field-icon" />
                  Date de début
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="field-input"
                  min={new Date().toISOString().split('T')[0]}
                />
                {errors.startDate && <span className="error-message">{errors.startDate}</span>}
              </div>

              <div className={`form-field ${errors.endDate ? 'has-error' : ''}`}>
                <label htmlFor="endDate" className="field-label">
                  <FiCalendar className="field-icon" />
                  Date de fin
                </label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="field-input"
                  min={formData.startDate}
                />
                {errors.endDate && <span className="error-message">{errors.endDate}</span>}
              </div>

              {absence && (
                <div className="form-field">
                  <label htmlFor="status" className="field-label">
                    Statut
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="field-input"
                  >
                    {statusOptions.map(status => (
                      <option key={status} value={status}>
                        {getStatusLabel(status)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className={`form-field full-width ${errors.reason ? 'has-error' : ''}`}>
                <label htmlFor="reason" className="field-label">
                  <FiInfo className="field-icon" />
                  Motif
                </label>
                <textarea
                  id="reason"
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  className="field-textarea"
                  rows="3"
                  placeholder="Raison de l'absence..."
                />
                {errors.reason && <span className="error-message">{errors.reason}</span>}
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
                ) : absence ? (
                  'Mettre à jour'
                ) : (
                  'Ajouter Absence'
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AbsenceForm;