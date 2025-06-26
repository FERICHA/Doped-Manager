import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSettings, FiUser, FiUsers, FiLock, FiPlus } from 'react-icons/fi';
import Sidebar from '../components/Dashboard/Sidebar';
import UserProfile from '../components/Settings/UserProfile';
import UserManagement from '../components/Settings/UserManagement';
import SecuritySettings from '../components/Settings/SecuritySettings';
import { userAPI } from '../services/Api';
import UserModal from '../components/Settings/UserModal';
import '../styles/settingsPage.css';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../Auth/AuthHelpers';

const settingsOptions = [
  { id: 'profile', label: 'Mon Profil', icon: <FiUser />, roles: ['admin', 'user'] },
  { id: 'users', label: 'Gestion Utilisateurs', icon: <FiUsers />, roles: ['admin'] },
  { id: 'security', label: 'Sécurité', icon: <FiLock />, roles: ['admin', 'user'] }
];

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      navigate('/login');
    } else {
      setUserRole(user.role); 
      if (user.role !== 'admin' && activeTab === 'users') {
        setActiveTab('profile');
      }
    }
  }, [navigate, activeTab]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await userAPI.getAllBySession();
      setUsers(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'users' && userRole === 'admin') {
      fetchUsers();
    }
  }, [activeTab, userRole]);

  const handleEditUser = (user) => {
    setCurrentUser(user);
    setShowUserModal(true);
  };

  const handleDeleteUser = async (userId) => {
    try {
      await userAPI.deleteBySession(userId);
      fetchUsers();
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    }
  };

  const handleStatusChange = async () => {
    await fetchUsers();
  };

  const handleUserModalClose = () => {
    setShowUserModal(false);
    setCurrentUser(null);
  };

  const handleUserModalSubmit = async (userData) => {
    try {
      if (currentUser) {
        await userAPI.updateBySession(currentUser._id, userData);
      } else {
        await userAPI.createBySession(userData);
      }
      fetchUsers();
      setShowUserModal(false);
    } catch (error) {
      console.error("Erreur lors de l'enregistrement:", error);
    }
  };

  const filteredOptions = settingsOptions.filter(option => 
    option.roles.includes(userRole)
  );

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
          <h1 className="page-title text-center mt-4 mb-3 d-block d-md-none">Paramètres</h1>
          <div className="settings-header mb-4">
            <h1 className="page-title d-none d-md-block">
              Paramètres
            </h1>
            {activeTab === 'users' && userRole === 'admin' && (
              <button
                className="btn bg-btn"
                onClick={() => setShowUserModal(true)}
              >
                <FiPlus className="me-2" />
                Ajouter un utilisateur
              </button>
            )}
          </div>

          <div className="row settings-container">
            <div className="col-lg-3 col-md-4 settings-sidebar">
              <ul className="settings-menu">
                {filteredOptions.map((option) => (
                  <li
                    key={option.id}
                    className={activeTab === option.id ? 'active' : ''}
                    onClick={() => setActiveTab(option.id)}
                  >
                    {option.icon}
                    <span>{option.label}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-lg-9 col-md-8 settings-content">
              {activeTab === 'profile' && <UserProfile />}
              {activeTab === 'users' && userRole === 'admin' && (
                <UserManagement
                  users={users}
                  onEdit={handleEditUser}
                  onDelete={handleDeleteUser}
                  isLoading={isLoading}
                  onRefresh={fetchUsers}
                  onStatusChange={handleStatusChange}
                />
              )}
              {activeTab === 'security' && <SecuritySettings />}
            </div>
          </div>
        </div>

        {/* Modal pour ajouter/modifier un utilisateur */}
        {showUserModal && userRole === 'admin' && (
          <UserModal
            user={currentUser}
            onClose={handleUserModalClose}
            onSubmit={handleUserModalSubmit}
          />
        )}
      </motion.main>
    </div>
  );
};

export default SettingsPage;