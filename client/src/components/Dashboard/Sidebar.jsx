import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiHome, FiDollarSign, FiPackage, FiUsers,
  FiCalendar, FiSettings, FiUser, FiLogOut,
  FiMenu, FiX
} from 'react-icons/fi';
import { authAPI, userAPI } from '../../services/Api';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const location = useLocation();
  const navigate = useNavigate(); 
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      setIsOpen(!mobile);
    };

    window.addEventListener('resize', handleResize);
    handleResize(); 

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => setIsOpen(prev => !prev);

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      localStorage.removeItem('JwtToken');
      localStorage.removeItem('user');
      navigate('/login');
    } catch (err) {
      console.error('Erreur lors de la déconnexion', err);
    }
  };

  useEffect(() => {
  const fetchUserProfile = async () => {
    try {
      const response = await userAPI.getMyProfile();
      setUserProfile(response.data); 
    } catch (error) {
      console.error('Erreur lors du chargement du profil utilisateur :', error);
    }
  };

  fetchUserProfile();
}, []);


  const navItems = [
    { path: "/dashboard", icon: <FiHome />, label: "Tableau de bord" },
    { path: "/transactions", icon: <FiDollarSign />, label: "Transactions" },
    { path: "/products", icon: <FiPackage />, label: "Stock" },
    { path: "/employees", icon: <FiUsers />, label: "Employés" },
    { path: "/absences", icon: <FiCalendar />, label: "Absences" },
    { path: "/settings", icon: <FiSettings />, label: "Paramètres" },
  ];

  const sidebarVariants = {
    hidden: { x: '-100%', opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 30,
        when: "beforeChildren",
        staggerChildren: 0.1
      },
    },
    exit: {
      x: '-100%',
      opacity: 0,
      transition: { duration: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { type: "spring", stiffness: 300 }
    }
  };

  return (
    <>
      {/* Menu Toggle Button - Only shows when sidebar is closed on mobile */}
      <AnimatePresence>
        {isMobile && !isOpen && (
          <motion.button 
            className="menu-toggle"
            onClick={toggleSidebar}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring" }}
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            <FiMenu size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Overlay on mobile */}
      <AnimatePresence>
        {isMobile && isOpen && (
          <motion.div
            className="sidebar-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={toggleSidebar}
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {(isOpen || !isMobile) && (
          <motion.aside
            className="sidebar"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={sidebarVariants}
            aria-label="Main navigation"
          >
            <div className="sidebar-header">
              <h2>Doped Manager</h2>
              {isMobile && (
                <button 
                  className="close-btn" 
                  onClick={toggleSidebar}
                  aria-label="Close menu"
                >
                  <FiX size={24} />
                </button>
              )}
            </div>

            <nav className="sidebar-nav">
              <ul>
                {navItems.map((item, index) => (
                  <motion.li
                    key={index}
                    variants={itemVariants}
                    className={location.pathname === item.path ? 'active' : ''}
                  >
                    <Link to={item.path} onClick={isMobile ? toggleSidebar : undefined}>
                      <span className="icon" aria-hidden="true">{item.icon}</span>
                      <span className="label">{item.label}</span>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </nav>

            <motion.div 
              className="sidebar-footer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="user-profile">
                <div className="avatar"><FiUser /></div>
                <div className="user-info">
                  <span className="username">{userProfile?.name || 'Utilisateur'}</span>
                  <span className="role">{userProfile?.role || '---'}</span>
                </div>
              </div>
              <button className="logout-btn" onClick={handleLogout}>
                <FiLogOut size={18} />
                <span>Déconnexion</span>
              </button>
            </motion.div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;