import mongoose from 'mongoose';

const AbsenceSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  reason: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  session: { 
    type: String,
  }
}, { timestamps: true });

const absenceModel = mongoose.model("Absence", AbsenceSchema);

export default absenceModel;