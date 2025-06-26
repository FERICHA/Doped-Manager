import transactionModel from '../models/TransactionModel.js';
import mongoose from 'mongoose';

export const getAllTransactions = async (req, res) => {
  try {
    if (!req.user?.session) {
      return res.status(403).json({ error: "Session non autorisée" });
    }

    const transactions = await transactionModel.find({ session: req.user.session }).sort({ createdAt: -1 });

    res.status(200).json(transactions);
  } catch (err) {
    console.error("getAllTransactions Error:", err);
    res.status(500).json({ error: "Erreur lors de la récupération de toutes les transactions" });
  }
};

export const getRecentTransactions = async (req, res) => {
  try {
    if (!req.user?.session) {
      return res.status(403).json({ error: "Session non autorisée" });
    }

    const transactions = await transactionModel.find({ session: req.user.session })
      .sort({ createdAt: -1 })
      .limit(6);

    res.status(200).json(transactions);
  } catch (err) {
    console.error("getRecentTransactions Error:", err);
    res.status(500).json({ error: "Erreur lors de la récupération des transactions récentes" });
  }
};

export const addTransaction = async (req, res) => {
  try {
    const { amount, type, category, date, description } = req.body;

    const newTransaction = new transactionModel({
      userId: req.user.id,
      amount,
      type,
      category,
      date,
      description,
      session: req.user.session
    });

    await newTransaction.save();
    res.status(201).json(newTransaction);
  } catch (err) {
    console.error("addTransaction Error:", err);
    res.status(400).json({ error: err.message });
  }
};

export const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID de transaction invalide" });
    }

    const updatedTransaction = await transactionModel.findOneAndUpdate(
      { _id: id, session: req.user.session },
      req.body,
      { new: true }
    );

    if (!updatedTransaction) {
      return res.status(404).json({ error: "Transaction non trouvée" });
    }

    res.status(200).json(updatedTransaction);
  } catch (err) {
    console.error("updateTransaction Error:", err);
    res.status(500).json({ error: "Erreur lors de la mise à jour de la transaction" });
  }
};

export const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID de transaction invalide" });
    }

    const deletedTransaction = await transactionModel.findOneAndDelete({
      _id: id,
      session: req.user.session
    });

    if (!deletedTransaction) {
      return res.status(404).json({ error: "Transaction non trouvée" });
    }

    res.status(200).json({ message: "Transaction supprimée avec succès", deletedId: id });
  } catch (err) {
    console.error("deleteTransaction Error:", err);
    res.status(500).json({ error: "Erreur lors de la suppression de la transaction" });
  }
};
