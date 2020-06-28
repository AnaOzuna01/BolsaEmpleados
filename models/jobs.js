var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var job_schema = new Schema({
    category: { type: String, required: true },
    type: { type: String, required: true },
    company: { type: String, required: true },
    extension: { type: String, required: false },
    position: { type: String, required: true },
    location: { type: String, required: true },
    description: { type: String, required: true },
    creator: { type: Schema.Types.ObjectId, ref: "User" },
    created: {
        type: Date,
        default: Date.now
    }
});

job_schema.virtual('creatDate')
    .set(function(date) {
        // El formato esperado es 'yyyy-mm-dd' que es el devuelto por el campo input
        // el valor recibido se almacenará en el campo fecha_nacimiento_iso de nuestro documento
        this.created = new Date(date);
    })
    .get(function() {
        // el valor devuelto será un string en formato 'yyyy-mm-dd'
        return this.created.toISOString().substring(0, 10);
    });



var Job = mongoose.model("Job", job_schema);
module.exports = Job;