import React, { useState } from 'react';
import { FiLock, FiEye, FiEyeOff, FiCheckCircle } from 'react-icons/fi';
import { authAPI } from '../../services/Api';

const SecuritySettings = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const toggleShowPassword = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Le mot de passe actuel est requis';
    }
    
    if (!formData.newPassword) {
      newErrors.newPassword = 'Le nouveau mot de passe est requis';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Le mot de passe doit contenir au moins 8 caractères';
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      await authAPI.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      
      setSuccessMessage('Votre mot de passe a été changé avec succès !');
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Erreur lors du changement de mot de passe:', error);
      setErrors({
        ...errors,
        currentPassword: error.response?.data?.message || 'Erreur lors du changement de mot de passe'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="security-settings">
      <div className="card border-0 shadow-sm rounded-lg overflow-hidden">
        <div className="card-header bg-headBar">
          <h4 className="mb-0 d-flex align-items-center">
            <FiLock className="me-2" size={20} />
            Sécurité du compte
          </h4>
        </div>
        
        <div className="card-body p-4">
          <h5 className="mb-4">Changer votre mot de passe</h5>
          
          {successMessage && (
            <div className="alert alert-success d-flex align-items-center">
              <FiCheckCircle className="me-2" size={20} />
              {successMessage}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="form-label fw-semibold text-muted">Mot de passe actuel</label>
              <div className="input-group">
                <input
                  type={showPassword.current ? "text" : "password"}
                  className={`form-control form-control-lg border-2 py-3 ${errors.currentPassword ? 'is-invalid' : ''}`}
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                />
                <button 
                  type="button" 
                  className="btn btn-outline-secondary"
                  onClick={() => toggleShowPassword('current')}
                >
                  {showPassword.current ? <FiEyeOff /> : <FiEye />}
                </button>
                {errors.currentPassword && (
                  <div className="invalid-feedback">{errors.currentPassword}</div>
                )}
              </div>
            </div>
            
            <div className="mb-4">
              <label className="form-label fw-semibold text-muted">Nouveau mot de passe</label>
              <div className="input-group">
                <input
                  type={showPassword.new ? "text" : "password"}
                  className={`form-control form-control-lg border-2 py-3 ${errors.newPassword ? 'is-invalid' : ''}`}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                />
                <button 
                  type="button" 
                  className="btn btn-outline-secondary"
                  onClick={() => toggleShowPassword('new')}
                >
                  {showPassword.new ? <FiEyeOff /> : <FiEye />}
                </button>
                {errors.newPassword && (
                  <div className="invalid-feedback">{errors.newPassword}</div>
                )}
              </div>
              <small className="text-muted">Minimum 8 caractères</small>
            </div>
            
            <div className="mb-4">
              <label className="form-label fw-semibold text-muted">Confirmer le nouveau mot de passe</label>
              <div className="input-group">
                <input
                  type={showPassword.confirm ? "text" : "password"}
                  className={`form-control form-control-lg border-2 py-3 ${errors.confirmPassword ? 'is-invalid' : ''}`}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <button 
                  type="button" 
                  className="btn btn-outline-secondary"
                  onClick={() => toggleShowPassword('confirm')}
                >
                  {showPassword.confirm ? <FiEyeOff /> : <FiEye />}
                </button>
                {errors.confirmPassword && (
                  <div className="invalid-feedback">{errors.confirmPassword}</div>
                )}
              </div>
            </div>
            
            <div className="d-flex justify-content-end pt-2">
              <button 
                type="submit" 
                className="btn bg-btn px-4"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    En cours...
                  </>
                ) : 'Mettre à jour'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;