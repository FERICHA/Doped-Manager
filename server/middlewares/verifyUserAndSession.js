const verifyUserAndSession = (req, res, next) => {
    const userIdFromToken = req.user.id; 
    const userIdFromHeader = req.headers['x-user-id'];  
    const sessionFromHeader = req.headers['x-session'];  
  
    if (userIdFromToken !== userIdFromHeader || req.user.session !== sessionFromHeader) {
      return res.status(403).json({ error: 'Session ou utilisateur non autorisé' });
    }
  
    next();  
  };
  
  export default verifyUserAndSession;
  