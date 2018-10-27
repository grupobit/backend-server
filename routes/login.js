var express = require('express');

// Antes hay que instalar plugins  npm install bcryptjs --save
// Este se debe importar donde se valla a trabajar con datos encryptados
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var _SEED = require('../config/config').SEED;


var app = express();

var Usuario = require('../models/usuario');


app.post('/', ( req, res ) => {

    var body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usario',
                errors: err
            });
        }

        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales no validas - email',
                errors: err
            });
        }

        if( !bcrypt.compareSync( body.password, usuarioDB.password ) ){
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales no validas - password',
                errors: err
            });
        }

        // Crear token!!!!
        // --------------------------------------------------------------
        // Instalamos jsonwebtoken - npm install jsonwebtoken --save
        usuarioDB.password = ':)';
        var token = jwt.sign({ usuario: usuarioDB }, _SEED, { expiresIn: 14400 }); // 4 horas


        res.status(200).json({
            ok: true,
            usuario: usuarioDB,
            token: token,
            id: usuarioDB._id
        });

    });

    
});



module.exports = app;