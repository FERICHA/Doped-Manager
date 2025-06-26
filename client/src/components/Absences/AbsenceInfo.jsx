import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiUser, FiCalendar, FiInfo, FiEdit2 } from 'react-icons/fi';

const AbsenceInfo = ({ absence, onEdit, onClose }) => {
  if (!absence) return null;

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  const calculateDuration = (startDate, endDate) => {
    const diffTime = Math.abs(new Date(endDate) - new Date(startDate));
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'approved': return 'bg-success bg-opacity-10 text-success';
      case 'rejected': return 'bg-danger bg-opacity-10 text-danger';
      case 'pending': return 'bg-warning bg-opacity-10 text-warning';
      default: return 'bg-secondary bg-opacity-10 text-secondary';
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

  const modalVariants = {
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
      <div className="employee-info-overlay">
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
          className="employee-info-modal"
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <div className="modal-header">
            <h3 className="modal-title">Détails de l'absence</h3>
            <button 
              className="close-button" 
              onClick={onClose}
              aria-label="Fermer"
            >
              <FiX size={24} />
            </button>
          </div>

          <div className="modal-body">
            <div className="info-section">
              <div className="info-item-infos">
                <FiUser className="info-icon" />
                <div>
                  <span className="info-label">Employé:</span>
                  <span className="info-value text-start ">{absence.employeeId?.name || 'N/A'}</span>
                </div>
              </div>

              <div className="info-item-infos">
                <FiCalendar className="info-icon" />
                <div>
                  <span className="info-label">Période:</span>
                  <span className="info-value">
                    Du {formatDate(absence.startDate)} au {formatDate(absence.endDate)}
                  </span>
                </div>
              </div>

              <div className="info-item-infos">
                <FiCalendar className="info-icon" />
                <div>
                  <span className="info-label">Durée:</span>
                  <span className="info-value">
                    {calculateDuration(absence.startDate, absence.endDate)} jours
                  </span>
                </div>
              </div>

              <div className="info-item-infos">
                <div>
                  <span className="info-label">Statut:</span>
                  <span className={`badge ${getStatusBadgeClass(absence.status)}`}>
                    {getStatusLabel(absence.status)}
                  </span>
                </div>
              </div>
            </div>

            <div className="info-section">
              <h5 className="section-title">
                <FiInfo className="me-2" />
                Motif
              </h5>
              <div className="info-description">
                <p>{absence.reason}</p>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button 
              className="btn btn-primary"
              onClick={() => {
                onEdit();
                onClose();
              }}
            >
              <FiEdit2 className="me-2" />
              Modifier
            </button>
            <button 
              className="btn btn-outline-secondary"
              onClick={onClose}
            >
              Fermer
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AbsenceInfo;