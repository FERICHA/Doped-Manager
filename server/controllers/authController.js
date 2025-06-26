import userModel from '../models/UserModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'; 
import dotenv from 'dotenv';
dotenv.config();

export async function Login(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ 
                error: "Email et mot de passe requis",
                received: { email: !!email, password: !!password }
            });
        }

        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: "Identifiants invalides" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Identifiants invalides" });
        }

        const SECRET_KEY = process.env.SECRET_KEY;
        if (!SECRET_KEY) {
            console.error("SECRET_KEY manquant dans .env");
            return res.status(500).json({ error: "Configuration serveur invalide" });
        }

        const token = jwt.sign(
            { 
                id: user._id,
                email: user.email,
                role: user.role,
                session: user.session 
            }, 
            SECRET_KEY, 
            { expiresIn: '8h' } 
        );

        // Ne pas renvoyer le mot de passe
        const { password: _, ...userWithoutPassword } = user.toObject();

        res.status(200).json({ 
            token,
            user: userWithoutPassword,
            expiresIn: '8h'
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({
            error: "Échec de la connexion",
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

export async function changeMyPassword(req, res) {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: "Les deux mots de passe sont requis" });
        }

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "Utilisateur non trouvé" });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Mot de passe actuel incorrect" });
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedNewPassword;
        await user.save();

        res.status(200).json({ message: "Mot de passe modifié avec succès" });
    } catch (error) {
        console.error("changeMyPassword Error:", error);
        res.status(500).json({
            error: "Erreur serveur lors du changement de mot de passe",
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

export async function Logout(req, res) {
    try {
        return res.status(200).json({ message: "Déconnexion réussie." });
    } catch (error) {
        console.error("Logout Error:", error);
        res.status(500).json({
            error: "Erreur serveur lors de la déconnexion"
        });
    }
}
