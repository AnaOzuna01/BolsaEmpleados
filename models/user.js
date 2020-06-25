var mongoose = require("mongoose");
var Schema = mongoose.Schema;

mongoose.connect("mongodb://localhost/auth");

var values_job = ["Administrator", "Poster"];

var email_match = [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Coloca un email válido"]

var password_validation = {
    validator: function(p) {
        return this.password_confirmation == p;
    },
    message: "Las contraseñas no son iguales."
}

var user_schema = new Schema({
    username: { type: String, required: true, maxlength: [50, "Username muy grande."] },
    password: { type: String, minlength: [8, "El password es muy corto."], validate: password_validation },
    email: { type: String, required: "El correo es obligatorio.", match: email_match },
    role: { type: String, enum: { values: values_job, message: "Opción no válida" }, required: "El rol es obligatorio." },
    job: { type: String }
});
user_schema.virtual("password_confirmation").get(function() {
    return this.p_c;
}).set(function(password) {
    this.p_c = password;
});
var User = mongoose.model("User", user_schema);

module.exports.User = User;