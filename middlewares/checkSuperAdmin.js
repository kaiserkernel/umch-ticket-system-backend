module.exports = (req, res, next) => {
    const { role, email } = req.user; 
    
    if (role === 0 && email === process.env.SUPER_ADMIN_EMAIL) {
      next();
    } else {
      res.status(403).json({ message: 'Access forbidden: Super Admin only' });
    }
  };
  