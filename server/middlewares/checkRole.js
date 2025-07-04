export function checkRole(requiredRole) {
    return (req, res, next) => {
        if (req.user.role !== requiredRole) {
            return res.status(403).json({ error: "Insufficient permissions" });
        }
        next();
    };
}