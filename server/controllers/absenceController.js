import absenceModel from '../models/AbsenceModel.js';

export const getAllAbsences = async (req, res) => {
  try {
    const session = req.user.session;
    const absences = await absenceModel.find({ session }).populate('employeeId');
    res.status(200).json(absences);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors du chargement des absences.' });
  }
};

export const addAbsence = async (req, res) => {
  try {
    const { employeeId, startDate, endDate, reason, status } = req.body;

    const newAbsence = new absenceModel({
      employeeId,
      startDate,
      endDate,
      reason,
      status: status || 'pending',
      session: req.user.session
    });

    await newAbsence.save();
    res.status(201).json(newAbsence);
  } catch (error) {
    console.error('Erreur lors de l’ajout de l’absence:', error);
    res.status(400).json({ error: error.message });
  }
};

export const updateAbsence = async (req, res) => {
  try {
    const session = req.user.session;
    const updated = await absenceModel.findOneAndUpdate(
      { _id: req.params.id, session },
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Absence non trouvée.' });
    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ error: 'Erreur lors de la mise à jour.' });
  }
};

export const deleteAbsence = async (req, res) => {
  try {
    const session = req.user.session;
    const deleted = await absenceModel.findOneAndDelete({ _id: req.params.id, session });
    if (!deleted) return res.status(404).json({ error: 'Absence non trouvée.' });
    res.status(200).json({ message: 'Absence supprimée avec succès.' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression.' });
  }
};
