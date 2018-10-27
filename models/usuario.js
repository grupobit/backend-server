// npm install --save mongoose-unique-validator
// Con este pluging podremos hacer que las validaciones sean más sencillas de realizar

var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;


var rolesValidos = {
    values: ['ADMIN', 'USER_ROLE'],
    message: '{VALUE} no es un rol permitido'
};

var usuarioSchema = new Schema({

    nombre: {type: String, required: [true, 'El nombre es necesario'] },
    email: {type: String, unique:true, required: [true, 'El correo es necesario'] },
    password: {type: String, required: [true, 'La contraseña es necesario'] },
    img: {type: String, required:false },
    role: {type: String, required:true, default: 'USER_ROLE', enum: rolesValidos }
    
});

usuarioSchema.plugin( uniqueValidator, { message: '{PATH} debe ser unico' } );


module.exports = mongoose.model('Usuario', usuarioSchema);