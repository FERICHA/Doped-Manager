import React, { useState } from 'react';
import { FiEdit, FiTrash2, FiUser, FiUserCheck, FiUserX } from 'react-icons/fi';
import { userAPI } from '../../services/Api';

const UserManagement = ({ users, onEdit, onDelete, isLoading, onRefresh }) => {
  const [editingStatus, setEditingStatus] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [error, setError] = useState(null);

  const handleStatusChangeClick = (user) => {
    setEditingStatus(user._id);
    setNewStatus(user.statut);
    setError(null); 
  };

  const handleStatusSubmit = async (userId) => {
    try {
      const user = users.find(u => u._id === userId);
      if (user && newStatus === user.statut) {
        setEditingStatus(null);
        return;
      }

      await userAPI.updateBySession(userId, { statut: newStatus });
      setEditingStatus(null);
      onRefresh(); 
    } catch (error) {
      console.error("Failed to update user status:", error);
      setError("Échec de la mise à jour du statut. Veuillez réessayer.");
    }
  };

  if (isLoading) {
    return <div className="loading">Chargement des utilisateurs...</div>;
  }

  if (users.length === 0) {
    return <div className="no-data">Aucun utilisateur trouvé</div>;
  }

  return (
    <div className="table-responsive">
      {error && (
        <div className="alert alert-danger mb-3">
          {error}
        </div>
      )}
      <table className="table">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Email</th>
            <th>Rôle</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user._id} className={user.statut === 'no active' ? 'text-muted' : ''}>
              <td>
                <FiUser className="me-2" />
                {user.name}
              </td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>
                {editingStatus === user._id ? (
                  <select
                    className="form-select form-select-sm"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                  >
                    <option value="active">active</option>
                    <option value="no active">no active</option>
                  </select>
                ) : (
                  <span className={`badge ${user.statut === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                    {user.statut === 'active' ? 'active' : 'no active'}
                  </span>
                )}
              </td>
              <td>
                {editingStatus === user._id ? (
                  <>
                    <button
                      onClick={() => handleStatusSubmit(user._id)}
                      className="btn btn-sm btn-success me-2"
                    >
                      Enregistrer
                    </button>
                    <button
                      onClick={() => {
                        setEditingStatus(null);
                        setError(null);
                      }}
                      className="btn btn-sm btn-outline-secondary"
                    >
                      Annuler
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleStatusChangeClick(user)}
                      className="btn btn-sm btn-outline-warning me-2 mt-1"
                      title="Changer statut"
                    >
                      {user.statut === 'active' ? <FiUserX /> : <FiUserCheck />}
                    </button>
                    <button
                      onClick={() => onEdit(user)}
                      className="btn btn-sm btn-outline-primary me-2 mt-1"
                      title="Modifier"
                    >
                      <FiEdit />
                    </button>
                    <button
                      onClick={() => onDelete(user._id)}
                      className="btn btn-sm btn-outline-danger mt-1"
                      title="Supprimer"
                      disabled={user.role === 'admin'} 
                    >
                      <FiTrash2 />
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserManagement;