import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

export function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized access" });
    }

    const token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.SECRET_KEY, (error, data) => {
        if (error) {
            return res.status(403).json({ error: "Unauthorized access" });
        } else {
            req.user = data; 
            next();
        }
    });
}
