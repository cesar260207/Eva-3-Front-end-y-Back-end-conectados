function authorize(...allowedRoles) {
  return (req, res, next) => {
    const userRole = String(req.user?.role || '').toLowerCase();
    const roles = allowedRoles.map(role => String(role || '').toLowerCase());

    if (!roles.includes(userRole)) {
      return res.status(403).json({
        ok: false,
        message: 'No tienes permisos suficientes para acceder a este recurso.'
      });
    }

    next();
  };
}

module.exports = { authorize };