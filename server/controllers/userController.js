import userModel from '../models/UserModel.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

export async function GetAllUsersSession(req, res) {
    try {
        if (!req.user?.session) {
            return res.status(403).json({ error: "Session non autorisée" });
        }

        const users = await userModel.find(
            { session: req.user.session },
            { password: 0 } 
        );
        
        res.json(users);
    } catch (error) {
        console.error("GetAllUsers Error:", error);
        res.status(500).json({ 
            error: "Échec de la récupération des utilisateurs",
            code: error.code,
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

export async function GetUserByIdSession(req, res) {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: "ID utilisateur invalide" });
        }

        const user = await userModel.findOne(
            { 
                _id: req.params.id, 
                session: req.user.session 
            },
            { password: 0 }
        );
        
        if (!user) {
            return res.status(404).json({ error: "Utilisateur non trouvé" });
        }
        
        res.json(user);
    } catch (error) {
        console.error("GetUserById Error:", error);
        res.status(500).json({
            error: "Échec de la récupération de l'utilisateur",
            details: error.message
        });
    }
}

export async function CreateUserSession(req, res) {
    try {
        const { name, email, password, confirmPassword, role = 'user', statut = 'active' } = req.body;

        if (!name || !email || !password || !confirmPassword) {
            return res.status(400).json({ 
                error: "Tous les champs sont obligatoires",
                required: ["name", "email", "password", "confirmPassword"]
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ error: "Les mots de passe ne correspondent pas" });
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ error: "Format d'email invalide" });
        }

        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ error: "Cet email est déjà utilisé" });
        }

        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await userModel.create({
            name,
            email,
            password: hashedPassword,
            role,
            statut, 
            session: req.user?.session || 'default-session'
        });

        const { password: _, ...userWithoutPassword } = newUser.toObject();
        
        res.status(201).json(userWithoutPassword);
    } catch (error) {
        console.error("CreateUser Error:", error);
        
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                error: "Erreur de validation",
                details: Object.values(error.errors).map(e => e.message)
            });
        }

        res.status(500).json({
            error: "Échec de la création de l'utilisateur",
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

export async function DeleteUserSession(req, res) {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: "ID utilisateur invalide" });
        }

        const user = await userModel.findOneAndDelete(
            { 
                _id: req.params.id, 
                session: req.user.session 
            }
        );
        
        if (!user) {
            return res.status(404).json({ error: "Utilisateur non trouvé" });
        }
        
        res.status(200).json({ 
            message: "Utilisateur supprimé avec succès",
            deletedId: user._id 
        });
    } catch (error) {
        console.error("DeleteUser Error:", error);
        res.status(500).json({
            error: "Échec de la suppression",
            details: error.message
        });
    }
}

export async function UpdateUserSession(req, res) {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: "ID utilisateur invalide" });
        }

        // Empêcher la mise à jour du mot de passe via cette route
        if (req.body.password) {
            return res.status(400).json({ error: "Utilisez /change-password pour modifier le mot de passe" });
        }

        if (req.body.statut && !['active', 'no active'].includes(req.body.statut)) {
            return res.status(400).json({ error: "Statut invalide" });
        }

        const user = await userModel.findOneAndUpdate(
            { 
                _id: req.params.id, 
                session: req.user.session 
            },
            req.body,
            { 
                new: true,
                select: '-password' 
            }
        );
        
        if (!user) {
            return res.status(404).json({ error: "Utilisateur non trouvé" });
        }
        
        res.status(200).json(user);
    } catch (error) {
        console.error("UpdateUser Error:", error);
        
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                error: "Erreur de validation",
                details: Object.values(error.errors).map(e => e.message)
            });
        }

        res.status(500).json({
            error: "Échec de la mise à jour",
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}


export async function myProfil(req, res) {
        try {
            const userId = req.user?.id;
    
            if (!userId) {
                return res.status(401).json({ error: "Utilisateur non authentifié" });
            }
    
            const user = await userModel.findById(userId).select('-password');
            if (!user) {
                return res.status(404).json({ error: "Profil utilisateur non trouvé" });
            }
    
            res.json(user);
        } catch (error) {
            console.error("myProfil Error:", error);
            res.status(500).json({
                error: "Échec de la récupération du profil",
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
    
    export async function updateMyProfil(req, res) {
        try {
            const userId = req.user?.id;
    
            if (!userId) {
                return res.status(401).json({ error: "Utilisateur non authentifié" });
            }
    
            if (req.body.password) {
                return res.status(400).json({ error: "Utilisez /change-password pour modifier le mot de passe" });
            }
    
            const updatedUser = await userModel.findByIdAndUpdate(
                userId,
                req.body,
                { new: true, runValidators: true, select: '-password' }
            );
    
            if (!updatedUser) {
                return res.status(404).json({ error: "Utilisateur non trouvé" });
            }
    
            res.status(200).json(updatedUser);
        } catch (error) {
            console.error("updateMyProfil Error:", error);
            res.status(500).json({
                error: "Échec de la mise à jour du profil",
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
    

