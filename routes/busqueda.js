var express = require('express');

var app = express();

var Hospital = require('../models/hopital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');


// Rutas
app.get('/todo/:busqueda', ( req, res, next ) => {

    var busqueda = req.params.busqueda;
    // Expresión regular
    var index = new RegExp(busqueda, 'i');

    Promise.all([
        buscarHospitales( busqueda, index ), 
        buscarMedicos( busqueda, index ),
        buscarUsuarios( busqueda, index )
    ]).then( respuesta => {

        res.status(200).json({
            ok: true,
            hospitales: respuesta[0],
            medicos: respuesta[1],
            usuarios: respuesta[2]
        });
    });
});



app.get('/coleccion/:tabla/:busqueda', ( req, res, next ) => {

    var busqueda = req.params.busqueda;
    // Expresión regular
    var index = new RegExp(busqueda, 'i');
    var tabla = req.params.tabla;
    var promesa;

    switch ( tabla ) {

        case 'usuarios':
        promesa = buscarUsuarios(busqueda, index);
        break;

        case 'medicos':
        promesa = buscarMedicos(busqueda, index);
        break;

        case 'hospitales':
        promesa = buscarHospitales(busqueda, index);
        break;

        default:
            return res.status(400).json({
                ok: false,
                mensaje: 'Los tipos de busqueda son: usuarios, medicos y hospitales',
                error: { message: 'Tipos de tabla/coleccion no valido'}
            });
    }

    promesa.then( data => { 

        res.status(200).json({
            ok: true,
            [tabla]: data
        });
    });
});


function buscarHospitales(busqueda, index){

    return new Promise((resolve, reject) => {
        Hospital.find({nombre: index})
            .populate('usuario', 'nombre email')
            .exec((err, hospitales) => {
                
                    if (err) {
                        reject('Error al cargar hospitales', err);
                    } else{
                        resolve(hospitales);
                    }
                });  
        });
        
    }


function buscarMedicos(busqueda, index){


    return new Promise((resolve, reject) => {
        Medico.find({nombre: index})
        .populate( 'usuario','nombre email' )
        .populate( 'hospital')
        .exec( (err, medicos) => {    

                    if (err) {
                        reject('Error al cargar hospitales', err);
                    }else{
                        resolve(medicos);
                    }    
            });
    });
}

function buscarUsuarios(busqueda, index){

    return new Promise((resolve, reject) => {

        Usuario.find({}, 'nombre email role')
            .or([ { 'nombre': index }, {'email': index} ])
            .exec( ( err, usuarios ) => {

                 if ( err ) {
                        reject('Error al gargar usuarios', err);
                }else{
                        resolve( usuarios );                        
                 }
            });
    });
}



module.exports = app;