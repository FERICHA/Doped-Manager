import employeeModel from '../models/EmployeeModel.js';

export const getAllEmployees = async (req, res) => {
  try {
    const session = req.user.session;
    const employees = await employeeModel.find({ session });
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors du chargement des employés.' });
  }
};

export const addEmployee = async (req, res) => {
  try {
    const {
      name,
      position,
      startDate,
      status,
      email,
      phoneNumber,
      educationLevel,
      description
    } = req.body;

    const newEmployee = new employeeModel({
      name,
      position,
      startDate,
      status,
      email,
      phoneNumber,
      educationLevel,
      description,
      session: req.user.session
    });

    await newEmployee.save();
    res.status(201).json(newEmployee);
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'employé:", error);
    res.status(400).json({ error: error.message });
  }
};

export const updateEmployee = async (req, res) => {
  try {
    const session = req.user.session;
    const updated = await employeeModel.findOneAndUpdate(
      { _id: req.params.id, session },
      req.body,
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: 'Employé non trouvé.' });
    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ error: 'Erreur lors de la mise à jour de l\'employé.' });
  }
};

export const deleteEmployee = async (req, res) => {
  try {
    const session = req.user.session;
    const deleted = await employeeModel.findOneAndDelete({ _id: req.params.id, session });

    if (!deleted) return res.status(404).json({ error: 'Employé non trouvé.' });
    res.status(200).json({ message: 'Employé supprimé avec succès.' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'employé.' });
  }
};
