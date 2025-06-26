import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiUser, FiMail, FiPhone, FiBriefcase } from 'react-icons/fi';
import { userAPI } from '../../Api/Api';

const UserForm = ({ user, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    position: user?.position || ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Nom requis';
    if (!formData.email.trim()) newErrors.email = 'Email requis';
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Email invalide';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      let response;
      if (user) {
        response = await userAPI.updateBySession(user._id, formData);
      } else {
        response = await userAPI.create(formData);
      }
      onSuccess(response.data);
    } catch (error) {
      console.error('Error saving user:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="modal-overlay">
        <div className="modal-backdrop" onClick={onClose} />
        
        <motion.div 
          className="user-form-modal"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
        >
          <div className="modal-header">
            <h3>{user ? 'Modifier Utilisateur' : 'Nouvel Utilisateur'}</h3>
            <button className="close-button" onClick={onClose}>
              <FiX size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label><FiUser /> Nom complet</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? 'error' : ''}
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label><FiMail /> Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'error' : ''}
                disabled={!!user}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label><FiPhone /> Téléphone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label><FiBriefcase /> Poste</label>
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleChange}
              />
            </div>

            <div className="form-actions">
              <button type="button" onClick={onClose} disabled={isSubmitting}>
                Annuler
              </button>
              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default UserForm;