

var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hostipal = require('../models/hopital');

app.use(fileUpload());

// Ruta
app.put('/:tipo/:id', ( req, res, next ) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    // Tipos de coleccion
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];
    if ( tiposValidos.indexOf( tipo ) < 0 ){
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipos de colección no es válida',
            errors: { message: 'Debe de seleccionar un Tipos de colección válida'}
        });
    }

    if( !req.files) {

        return res.status(400).json({
            ok: false,
            mensaje: 'No selecciono ninguna imagen',
            errors: { message: 'Debe de seleccionar una imagen'}
        });
    }

    // -------------------------------------------------------
    // Manejo de imagenes:
    // Para subir imagenes al backen instalamos la libreria 
    // npm install --save express-fileupload
    // https://github.com/expressjs/serve-index
    // -------------------------------------------------------
 
    // Obtener nombre del archivo
    // -------------------------------------------------------
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[ nombreCortado.length -1 ];

    // Validación del tipo de extensión
    // -------------------------------------------------------
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if ( extensionesValidas.indexOf( extensionArchivo ) < 0 ) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extension no valida',
            errors: { message: 'Las extensiones validas son ' + extensionesValidas.join(', ')}
        });

    }

    // Nombre de archivo personalizado
    // -------------------------------------------------------
    var nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extensionArchivo }`;


    // Mover archivo del tempotal a un path
    // -------------------------------------------------------
    var path = `./uploads/${ tipo }/${ nombreArchivo }`;

    archivo.mv( path, err => { 

        if ( err ) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover el archivo',
                errors: err
            });
        }

        subirPorTipo( tipo, id, nombreArchivo, res );
     });
    
});

function subirPorTipo( tipo, id, nombreArchivo, res ) {

    if ( tipo === 'usuarios' ){

        Usuario.findById(id, (err, usuario) => {

            if (!usuario) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Usuario no existe',
                    errors: {message: 'Usuario no existe para este id: ' +id}
                });
            }

            var pathViejo = './uploads/usuarios/' + usuario.img;
            
            // Si existe imagen anterior la borramos
            if ( fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo, () => {});                
            }

            usuario.img = nombreArchivo;
            usuario.save((err, usuarioActualizado) => {

                usuarioActualizado.password = ':)';

                //if (err) {
                //    
                //    return res.status(400).join({
                //        ok:false,
                //        mensaje: 'Error'
                //    });
                //}

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizada',
                    usuario: usuarioActualizado,
                    path: pathViejo
                });
            });

        });
    }

    if ( tipo === 'medicos' ){

        Medico.findById(id, (err, medico) => {

            if (!medico) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Medico no existe',
                    errors: {message: 'Medico no existe para este id: ' +id}
                });
            }

            var pathViejo = './uploads/medicos/' + medico.img;
            
            // Si existe imagen anterior la borramos
            if ( fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo, () => {});                
            }

            medico.img = nombreArchivo;
            medico.save((err, medicoActualizado) => {

                //if (err) {
                //    
                //    return res.status(400).join({
                //        ok:false,
                //        mensaje: 'Error'
                //    });
                //}

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizada',
                    medico: medicoActualizado,
                    path: pathViejo
                });
            });

        });
    }

    if ( tipo === 'hospitales' ){
        Hostipal.findById(id, (err, hospital) => {

            if (!hospital) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Hospital no existe',
                    errors: {message: 'Hospital no existe para este id: ' +id}
                });
            }

            var pathViejo = './uploads/hospitales/' + hospital.img;
            
            // Si existe imagen anterior la borramos
            if ( fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo, () => {});                
            }

            hospital.img = nombreArchivo;
            hospital.save((err, hospitalActualizado) => {

                //if (err) {
                //    
                //    return res.status(400).join({
                //        ok:false,
                //        mensaje: 'Error'
                //    });
                //}

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizada',
                    hospital: hospitalActualizado,
                    path: pathViejo
                });
            });

        });
    }
}

module.exports = app;