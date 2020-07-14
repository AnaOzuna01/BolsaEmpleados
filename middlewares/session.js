var User = require("../models/user").User;

module.exports = function(req, res, next) {
    if (!req.session.user_id) {
        next();
    } else {
        User.findById(req.session.user_id, function(err, user) {
            if (err) {
                return res.redirect("/login");
                console.log(err);
                alert("Error con su usuario o contraseña");
            } else {
                res.locals = { user: user }; //Para ver que user inicia session
                next();
            }
        });
    }
}