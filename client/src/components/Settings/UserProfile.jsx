import React, { useState, useEffect } from 'react';
import { FiUser, FiMail, FiPhone, FiSave, FiEdit, FiAward } from 'react-icons/fi';
import { userAPI } from '../../services/Api';

const UserProfile = () => {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    role: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await userAPI.getMyProfile();
        setProfile(response.data);
      } catch (error) {
        console.error('Erreur lors du chargement du profil :', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await userAPI.updateMyProfile(profile);
      setIsEditing(false);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil :', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-purple" style={{ width: '3rem', height: '3rem' }} role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="card border-0 shadow-sm rounded-lg overflow-hidden">
        <div className="card-header bg-headBar text-white">
          <h4 className="mb-0 d-flex align-items-center">
            <FiUser className="me-2" size={20} />
            Mon Profil
          </h4>
        </div>
        
        <div className="card-body p-4">
          {isEditing ? (
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="form-label fw-semibold text-muted">Nom complet</label>
                <input
                  type="text"
                  className="form-control form-control-lg border-2 py-3"
                  name="name"
                  value={profile.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold text-muted">Email</label>
                <input
                  type="email"
                  className="form-control form-control-lg border-2 py-3"
                  name="email"
                  value={profile.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="d-flex justify-content-end gap-3 pt-2">
                <button 
                  type="button" 
                  className="btn btn-outline-secondary px-4"
                  onClick={() => setIsEditing(false)}
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  className="btn bg-btn px-4 d-flex align-items-center"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <FiSave className="me-2" />
                      Enregistrer
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div>
              <div className="d-flex align-items-center mb-4">
                <div className="bg-primary bg-opacity-10 text-purple rounded-circle d-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
                  <FiUser size={32} />
                </div>
                <div className="ms-4">
                  <h3 className="mb-1 fw-bold">{profile.name}</h3>
                  <span className="badge bg-primary bg-opacity-10 text-purple fs-6">{profile.role}</span>
                </div>
              </div>

              <div className="border-top pt-4">
                <div className="d-flex align-items-center mb-3">
                  <div className="bg-light rounded-circle p-3 me-3">
                    <FiMail size={20} className="text-purple" />
                  </div>
                  <div>
                    <p className="text-muted mb-0 small">Email</p>
                    <p className="mb-0 fw-semibold">{profile.email}</p>
                  </div>
                </div>

                {profile.role && (
                  <div className="d-flex align-items-center mb-3">
                    <div className="bg-light rounded-circle p-3 me-3">
                      <FiAward size={20} className="text-purple" />
                    </div>
                    <div>
                      <p className="text-muted mb-0 small">Rôle</p>
                      <p className="mb-0 fw-semibold">{profile.role}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="d-flex justify-content-end mt-5">
                <button 
                  className="btn bg-btn px-4 d-flex align-items-center"
                  onClick={() => setIsEditing(true)}
                >
                  <FiEdit className="me-2" />
                  Modifier le profil
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;