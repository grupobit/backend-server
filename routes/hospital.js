var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');

var Hospital = require('../models/hopital');

var app = express();

// ----------------------------------------------
// Obtener todos los Hospitales.
// ----------------------------------------------

app.get('/', ( req, res, next ) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find({})
    .skip(desde)
    .limit(5)
    .populate('usuario', 'nombre email')
    .exec((err, hospitales) => {

        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando hospital',
                errors: err
            });
        }

        Hospital.countDocuments({}, (err, conteo) => {

            res.status(200).json({
                ok: true,
                hospitales: hospitales,
                total: conteo
             });
        });
        
    });


});


app.put('/:id', mdAutenticacion.verificaToken, ( req,res ) => {

    var id = req.params.id;
    var body = req.body;
    
    Hospital.findById(id, (err, hospital) =>{

        if(err) {
       
            return res.status(500).json({
                ok: false,
                mensaje: 'Hospital no existe con ese ' + id,
                errors: err
            })
        }

        if(!hospital) {

            return res.status(400).json({
                ok: false,
                mensaje: 'Error al buscar hospital con este ' + id,
                errors: { message: 'No existe un hospital con ese ID'}
            });
        }

        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id;

        hospital.save( (err, hospitalGuardado) =>{

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar datos del hospital',
                    errors:err
                });
            }

            res.status(200).json({
                ok: true,
                hospitalGuardado: hospitalGuardado
            });

        });

    });

});

app.post('/', mdAutenticacion.verificaToken, ( req, res ) => {

    data = req.body;

    nuevoHospital = new Hospital({
        nombre: data.nombre,
        usuario: req.usuario._id
    });
    
    nuevoHospital.save( (err, nuevoHospitalGuardado) => {

        if (err){   

            return res.status(400).json({
                ok: false,
                mensaje: 'Error al guardad en base de datos',
                errors: err
            });
        }

        res.status(201).json({

            ok: true,
            hospital: nuevoHospitalGuardado,
        });

    });


});

app.delete('/:id', mdAutenticacion.verificaToken, ( req, res ) => {

    id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {

        if (err) {
            return status(500).json({
                ok:false,
                mensaje: 'Error al intentar borrar hospital con id ' +id,
                errors: err
            });
        }

        if (!hospitalBorrado) {

            return res.status(400).json({
                ok: false,
                mensaje: 'No existe hospital con este id: ' +id,
                errors: {mensaje: 'No existe hospital con este id'}
            });
        }

        res.status(200).json({

            ok: true,
            hospitalBorrado: hospitalBorrado
        });
    });

});

module.exports = app;