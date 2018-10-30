var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var hospitalSchema = Schema({
    nombre:     {type:String, require:[true, 'El nombre del usuario']},
    img:        {type:String, require: false},
    usuario:    {type:Schema.Types.ObjectId,ref:'Usuario'}
},{collection:'hospitales'});


module.exports = mongoose.model('Hospital', hospitalSchema);