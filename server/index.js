import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import AuthRoutes from './routes/AuthRoutes.js';
import UserRoutes from './routes/UserRoutes.js';
import TransactionRoutes from './routes/TransactionRoutes.js';
import ProductRoutes from './routes/ProductRoutes.js';
import EmployeeRoutes from './routes/EmployeeRoutes.js';
import AbsenceRoutes from './routes/AbsenceRoutes.js';
import cors from 'cors';

dotenv.config();

const app = express();
const PORT = process.env.DATABASE_PORT || 3000;

app.use(express.json());

app.use(cors({
    origin: 'http://localhost:3000', 
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], 
    credentials: true 
}));


mongoose.connect(process.env.MONGODB_DATABASE)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.use("/api/auth", AuthRoutes);
app.use("/api/users", UserRoutes);
app.use('/api/transactions', TransactionRoutes);
app.use('/api/products', ProductRoutes);
app.use('/api/employees', EmployeeRoutes);
app.use('/api/absences', AbsenceRoutes);


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});