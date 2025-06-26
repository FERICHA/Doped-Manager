import mongoose from 'mongoose';

const EmployeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  position: { type: String, required: true },
  startDate: { type: Date, required: true },
  status: { type: String, enum: ['active', 'inactive','congé', 'essai'], default: 'active' },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String }, 
  educationLevel: { type: String }, 
  description: { type: String },
  session: { 
    type: String,
  }
}, { timestamps: true });

const employeeModel = mongoose.model("Employee", EmployeeSchema);

export default employeeModel;