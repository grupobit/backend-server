var jwt = require('jsonwebtoken');
var _SEED = require('../config/config').SEED;


// ----------------------------------------------
// Verificar token. Usamos un Middleware
// ----------------------------------------------
exports.verificaToken = function(req, res, next) {

    var token = req.query.token;
    jwt.verify ( token, _SEED, (err, decoded) => {

        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Token no valido',
                errors: err
            });

        }
        req.usuario = decoded.usuario;
        next();
    });

}


   

