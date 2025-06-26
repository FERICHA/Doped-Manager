import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import { authAPI } from "../services/Api";
import { decodeToken } from "./AuthHelpers";
import '../styles/auth.css';
import { FaEnvelope, FaLock } from "react-icons/fa";

export default function Login() {
  const [values, setValues] = useState({
    email: '',
    password: ''
  });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPopup, setShowForgotPopup] = useState(false);
  const navigate = useNavigate();

  const handleInput = (event) => {
    setValues(prev => ({ ...prev, [event.target.name]: event.target.value }));
  };

  axios.defaults.withCredentials = true;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage('');
    
    try {
      const response = await authAPI.login(values);
      
      if (response.data?.token) {
        localStorage.setItem('JwtToken', response.data.token);
        
        const decoded = decodeToken(response.data.token);
        
        
        setMessage("Connexion réussie. Redirection en cours...");
        setTimeout(() => navigate('/dashboard'), 1500); 
      } else {
        setMessage("Identifiants incorrects. Veuillez réessayer.");
      }
    } catch (err) {
      console.error("Erreur lors de la connexion:", err);
      setMessage(() => {
        if (err.response?.data?.message) {
          return err.response.data.message;
        } else if (err.response?.message) {
          return `Erreur ${err.response.message}`;
        } else if (err.request) {
          return "Erreur lors de la connexion.";
        } else {
          return "Serveur indisponible. Veuillez réessayer plus tard.";
        }
      });
      
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-auth">
        <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Connexion</h2>
          <p>Bienvenue ! Veuillez vous connecter à votre compte.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label htmlFor="email">Adresse Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="entrez votre email"
              value={values.email}
              onChange={handleInput}
              required
              autoFocus
            />
            <span className="input-icon"><FaEnvelope  className="text-purple"/></span>
          </div>

          <div className="input-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="entrez votre mot de passe"
              value={values.password}
              onChange={handleInput}
              required
            />
            <span className="input-icon"><FaLock className="text-purple"/></span>
          </div>

          <button 
            type="submit" 
            className="auth-button"
            disabled={isLoading}
          >
            {isLoading ? 'Connexion en cours...' : 'Se connecter'}
          </button>

          {message && (
            <div className={`auth-message ${message.includes("réussie") ? "success" : "error"}`}>
              {message}
            </div>
          )}

          <div className="auth-footer">
          <button 
              type="button" 
              className="forgot-link" 
              onClick={() => setShowForgotPopup(true)}
            >
              Mot de passe oublié?
           </button>

          </div>
        </form>
        {showForgotPopup && (
          <div className="forgot-popup">
            <div className="forgot-popup-content">
              <p>Veuillez contacter l'équipe Doped Club pour réinitialiser votre mot de passe.</p>
              <button onClick={() => setShowForgotPopup(false)} className="close-popup-btn">Fermer</button>
            </div>
          </div>
        )}

      </div>
    </div>
    </div>
  );
}