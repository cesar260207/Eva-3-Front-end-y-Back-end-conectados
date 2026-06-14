const { fail } = require('../utils/api-response');
const { verifyAccessToken } = require('../utils/jwt');
const userService = require('../services/user.service');

async function authenticate(req, res, next) {
  try {
    const authorization = req.headers.authorization || '';
    const [scheme, token] = authorization.split(' ');

    if (scheme !== 'Bearer' || !token) {
      return fail(res, 'No autorizado. Debe enviar un token Bearer.', 401);
    }

    const decoded = verifyAccessToken(token);
    const userId = decoded.sub || decoded.id; 

    if (!userId) {
      return fail(res, 'Token no contiene un ID de usuario válido.', 401);
    }

    const user = await userService.getUserById(userId);

    if (!user) {
      return fail(res, 'Usuario no encontrado en la base de datos.', 401);
    }

    req.auth = decoded;
    req.user = user;
    next();
  } catch (error) {
    console.error("Error en autenticación middleware:", error.message);
    return fail(res, 'Token inválido o expirado.', 401);
  }
}

module.exports = { authenticate };