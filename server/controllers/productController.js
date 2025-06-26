import productModel from '../models/ProductModel.js';

export const getAllProducts = async (req, res) => {
  try {
    const session = req.user.session;
    const products = await productModel.find({ session });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors du chargement des produits.' });
  }
};

export const getLowStockProducts = async (req, res) => {
  try {
    const session = req.user.session;
    const lowStock = await productModel.find({ session, quantity: { $lte: 5 } });
    res.status(200).json(lowStock);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la vérification du stock.' });
  }
};

export const addProduct = async (req, res) => {
    try {
      const { name, description, price, quantity, alertThreshold, category } = req.body;
  
      const newProduct = new productModel({
        userId: req.user.id,
        name,
        description,
        price,
        quantity,
        alertThreshold,
        category,
        session: req.user.session
      });
  
      await newProduct.save();
      res.status(201).json(newProduct);
    } catch (err) {
      console.error("Erreur lors de l'ajout du produit:", err);
      res.status(400).json({ error: err.message });
    }
  };
  

export const updateProduct = async (req, res) => {
  try {
    const session = req.user.session;
    const updated = await productModel.findOneAndUpdate(
      { _id: req.params.id, session },
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Produit non trouvé.' });
    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ error: 'Erreur lors de la mise à jour.' });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const session = req.user.session;
    const deleted = await productModel.findOneAndDelete({ _id: req.params.id, session });
    if (!deleted) return res.status(404).json({ error: 'Produit non trouvé.' });
    res.status(200).json({ message: 'Produit supprimé avec succès.' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression.' });
  }
};
