import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiUser, FiBriefcase, FiCalendar, FiMail, FiPhone, FiBook, FiInfo, FiEdit2 } from 'react-icons/fi';

const EmployeeInfo = ({ employee, onEdit, onClose }) => {
  if (!employee) return null;

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'active': return 'bg-success bg-opacity-10 text-success';
      case 'inactive': return 'bg-danger bg-opacity-10 text-danger';
      case 'congé': return 'bg-warning bg-opacity-10 text-warning';
      case 'essai': return 'bg-info bg-opacity-10 text-info';
      default: return 'bg-secondary bg-opacity-10 text-secondary';
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
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
        {/* Overlay */}
        <motion.div
          className="modal-backdrop"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={overlayVariants}
          onClick={onClose}
          transition={{ duration: 0.2 }}
        />

        {/* Modal */}
        <motion.div
          className="employee-info-modal"
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <div className="modal-header">
            <h3 className="modal-title">Détails de l'employé</h3>
            <button 
              className="close-button" 
              onClick={onClose}
              aria-label="Fermer"
            >
              <FiX size={24} />
            </button>
          </div>

          <div className="modal-body">
            <div className="employee-info-section text-center mb-4">
              <div className="employee-avatar">
                <FiUser size={48} />
              </div>
              <h4 className="employee-name mt-3">{employee.name}</h4>
              <span className={`badge ${getStatusBadgeClass(employee.status)}`}>
                {employee.status}
              </span>
            </div>

            <div className="row">
              <div className="col-md-6">
                <div className="info-section mb-4">
                  <h5 className="section-title">
                    <FiBriefcase className="me-2" />
                    Informations professionnelles
                  </h5>
                  <div className="info-item">
                    <span className="info-label">Poste:</span>
                    <span className="info-value">{employee.position}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Date d'embauche:</span>
                    <span className="info-value">{formatDate(employee.startDate)}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Niveau d'étude:</span>
                    <span className="info-value">{employee.educationLevel || 'Non spécifié'}</span>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="info-section mb-4">
                  <h5 className="section-title">
                    <FiMail className="me-2" />
                    Coordonnées
                  </h5>
                  <div className="info-item">
                    <span className="info-label">Email:</span>
                    <span className="info-value">{employee.email || 'Non spécifié'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Téléphone:</span>
                    <span className="info-value">{employee.phoneNumber || 'Non spécifié'}</span>
                  </div>
                </div>
              </div>
            </div>

            {employee.description && (
              <div className="info-section">
                <h5 className="section-title">
                  <FiInfo className="me-2" />
                  Description
                </h5>
                <div className="info-description">
                  <p className="mb-0">{employee.description}</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default EmployeeInfo;