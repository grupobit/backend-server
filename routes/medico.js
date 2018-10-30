var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var mdAutenticacion = require('../middlewares/autenticacion');

var Medico = require('../models/medico');

var app = express();

// ----------------------------------------------
// Obtener todos los Hospitales.
// ----------------------------------------------

app.get('/', ( req, res, next ) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({})
    .skip(desde)
    .limit(5)   
    .populate('usuario', 'nombre email')
    .populate('hospital')
     
    .exec((err, Medicos) => {

        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando el médico',
                errors: err
            });
        }
        
        Medico.countDocuments({}, (err, conteo) => {

             res.status(200).json({
                    ok: true,
                    Medicos: Medicos,
                    total: conteo
            });
        
        });

    });

});


app.put('/:id', mdAutenticacion.verificaToken, ( req,res ) => {

    var id = req.params.id;
    var body = req.body;
    
    Medico.findById(id, (err, medico) =>{

        if(err) {
       
            return res.status(500).json({
                ok: false,
                mensaje: 'Este existe médico con este ' + id,
                errors: err
            })
        }

        if(!medico) {

            return res.status(400).json({
                ok: false,
                mensaje: 'Error al buscar medico con este ' + id,
                errors: { message: 'No existe un medico con ese ID'}
            });
        }

        medico.nombre = body.nombre;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;

        medico.save( (err, medicoGuardado) =>{

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar datos del médico',
                    errors:err
                });
            }

            res.status(200).json({
                ok: true,
                medicoGuardado: medicoGuardado
            });

        });

    });

});

app.post('/', mdAutenticacion.verificaToken, ( req, res ) => {

    data = req.body;

    nuevoMedico = new Medico({
        nombre: data.nombre,
        usuario: req.usuario._id,
        hospital: data.hospital
    });
    
    nuevoMedico.save( (err, nuevoMedicoGuardado) => {

        if (err){   

            return res.status(400).json({
                ok: false,
                mensaje: 'Error al guardar el medico en base de datos',
                errors: err
            });
        }

        res.status(201).json({

            ok: true,
            hospital: nuevoMedicoGuardado,
            medico: req.medico
        });

    });


});

app.delete('/:id', mdAutenticacion.verificaToken, ( req, res ) => {

    id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {

        if (err) {
            return status(500).json({
                ok:false,
                mensaje: 'Error al intentar borrar al medico con id ' +id,
                errors: err
            });
        }

        if (!medicoBorrado) {

            return res.status(400).json({
                ok: false,
                mensaje: 'No existe el medico con este id: ' +id,
                errors: {mensaje: 'No existe el medico con este id'}
            });
        }

        res.status(200).json({

            ok: true,
            medicoBorrado: medicoBorrado
        });
    });

});

module.exports = app;