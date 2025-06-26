import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertTriangle, FiX } from 'react-icons/fi';

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirmation requise",
  message = "Êtes-vous sûr de vouloir effectuer cette action ?",
  confirmText = "Confirmer",
  cancelText = "Annuler",
  danger = true
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Bootstrap backdrop with motion */}
          <motion.div
            className=" show"
            style={{ zIndex: 1050 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Bootstrap centered modal */}
          <motion.div
            className="modal d-block"
            style={{ zIndex: 1055 }}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <motion.div
                className="modal-content"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="modal-header bg-light">
                  <div className="d-flex align-items-center gap-2">
                    <FiAlertTriangle className="text-warning" size={24} />
                    <h5 className="modal-title mb-0">{title}</h5>
                  </div>
                  <button type="button" className="btn-close" onClick={onClose}></button>
                </div>

                <div className="modal-body">
                  <p className="mb-0">{message}</p>
                </div>

                <div className="modal-footer">
                  <motion.button
                    className="btn btn-secondary"
                    onClick={onClose}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {cancelText}
                  </motion.button>
                  <motion.button
                    className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`}
                    onClick={onConfirm}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {confirmText}
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ConfirmationModal;
