import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiUser, FiBriefcase, FiCalendar, FiCheckCircle, FiMail, FiPhone, FiBook, FiInfo } from 'react-icons/fi';

const EmployeeForm = ({ employee, onAdd, onUpdate, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    startDate: new Date().toISOString().split('T')[0],
    status: 'active',
    email: '',
    phoneNumber: '',
    educationLevel: '',
    description: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name || '',
        position: employee.position || '',
        startDate: employee.startDate ? employee.startDate.split('T')[0] : new Date().toISOString().split('T')[0],
        status: employee.status || 'active',
        email: employee.email || '',
        phoneNumber: employee.phoneNumber || '',
        educationLevel: employee.educationLevel || '',
        description: employee.description || ''
      });
    }
  }, [employee]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Nom requis';
    if (!formData.position.trim()) newErrors.position = 'Poste requis';
    if (!formData.startDate) newErrors.startDate = 'Date invalide';
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Email invalide';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      if (employee) {
        await onUpdate(employee._id, formData);
      } else {
        await onAdd(formData);
      }
    } catch (error) {
      console.error('Erreur formulaire employé:', error);
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

  const statusOptions = ['active', 'inactive','congé', 'essai'];
  const educationLevels = ['Bac', 'Bac+2', 'Bac+3', 'Bac+5', 'Doctorat', 'Autre'];

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
          className="transaction-form-modal wide-modal"
          variants={formVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <div className="form-header">
            <h3 className="form-title">
              {employee ? 'Modifier Employé' : 'Nouvel Employé'}
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
              <div className={`form-field ${errors.name ? 'has-error' : ''}`}>
                <label htmlFor="name" className="field-label">
                  <FiUser className="field-icon" />
                  Nom complet
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="field-input"
                  placeholder="Ex: Jean Dupont"
                  required
                />
                {errors.name && <span className="error-message">{errors.name}</span>}
              </div>

              <div className={`form-field ${errors.position ? 'has-error' : ''}`}>
                <label htmlFor="position" className="field-label">
                  <FiBriefcase className="field-icon" />
                  Poste
                </label>
                <input
                  type="text"
                  id="position"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  className="field-input"
                  placeholder="Ex: Gérant, Vendeur"
                  required
                />
                {errors.position && <span className="error-message">{errors.position}</span>}
              </div>

              <div className={`form-field ${errors.startDate ? 'has-error' : ''}`}>
                <label htmlFor="startDate" className="field-label">
                  <FiCalendar className="field-icon" />
                  Date d'embauche
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="field-input"
                  required
                />
                {errors.startDate && <span className="error-message">{errors.startDate}</span>}
              </div>

              <div className="form-field">
                <label htmlFor="status" className="field-label">
                  <FiCheckCircle className="field-icon" />
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
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className={`form-field ${errors.email ? 'has-error' : ''}`}>
                <label htmlFor="email" className="field-label">
                  <FiMail className="field-icon" />
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="field-input"
                  placeholder="email@exemple.com"
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>

              <div className="form-field">
                <label htmlFor="phoneNumber" className="field-label">
                  <FiPhone className="field-icon" />
                  Téléphone
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="field-input"
                  placeholder="06 12 34 56 78"
                />
              </div>

              <div className="form-field">
                <label htmlFor="educationLevel" className="field-label">
                  <FiBook className="field-icon" />
                  Niveau d'étude
                </label>
                <select
                  id="educationLevel"
                  name="educationLevel"
                  value={formData.educationLevel}
                  onChange={handleChange}
                  className="field-input"
                >
                  <option value="">Sélectionner...</option>
                  {educationLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              <div className="form-field full-width">
                <label htmlFor="description" className="field-label">
                  <FiInfo className="field-icon" />
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="field-textarea"
                  rows="3"
                  placeholder="Informations supplémentaires..."
                />
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
                ) : employee ? (
                  'Mettre à jour'
                ) : (
                  'Ajouter Employé'
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default EmployeeForm;