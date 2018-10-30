var express = require('express');

// Antes hay que instalar plugins  npm install bcryptjs --save
// Este se debe importar donde se valla a trabajar con datos encryptados
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var mdAutenticacion = require('../middlewares/autenticacion');
var app = express();
var Usuario = require('../models/usuario');

// ----------------------------------------------
// Obtener todos los usuarios.
// ----------------------------------------------

app.get('/', ( req, res, next ) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Usuario.find({ }, 'nombre email img role')
        .skip(desde)
        .limit(5) 
        .exec( (err, usuarios) => {

            if(err){

                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando usuario',
                    errors: err
                });
                
            }

            Usuario.count({}, (err, conteo) => {

                res.status(200).json({
                    ok: true,
                    usuarios: usuarios,
                    total: conteo
                });
            });

    });
   
});

// ----------------------------------------------
// Actualizar usuario.
// ----------------------------------------------
app.put('/:id', mdAutenticacion.verificaToken, (req,res) => {

    var id = req.params.id;
    var body = req.body;

    // Verificamos si existe el usuaio
    Usuario.findById( id, (err, usuario) =>{

        if(err){

            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if( !usuario ) {

            return res.status(400).json({
                ok: false,
                mensaje: 'Error al buscar usuario con este ' + id,
                errors: { message: 'No existe un usuario con ese ID'}
            });
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save( (err, usuarioGuardado) =>{
            
            if(err) {

                return res.status(400).json({
                    ok: false,
                    mensaje: 'Erros al actualizar usuario',
                    errors: err
                });
            }

            usuarioGuardado.password = ':)';

            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });


        });
        
    });


});

// ----------------------------------------------
// Crear nuevo usuario.
// Requisitos:
// npm install body-parser --save
// ----------------------------------------------
app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save( ( err, usuarioGuardado ) => {

        if(err){

            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuario',
                errors: err
            });
        }

        res.status(201).json({

            ok: true,
            usuario: usuarioGuardado,
            usuariotoken: req.usuario
        });

    });

});

// ----------------------------------------------
// Borrar un usuario.
// ----------------------------------------------

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) =>{

    var id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado)=>{

        
        if(err){

            return res.status(500).json({
                ok: false,
                mensaje: 'Error al crear usuario',
                errors: err
            });
        }

        // Validacion opcional
        if(!usuarioBorrado){

            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un usuario con ese ID',
                errors: { message: 'No existe un usuario con ese ID' }
            });
        }

        res.status(200).json({
            
            ok: true,
            usuario: usuarioBorrado
        });
    });
});

module.exports = app;