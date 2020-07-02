var User = require("../models/user").User;

module.exports = function(req, res, next) {
    if (!req.session.user_id) {
        next();
    } else {
        User.findById(req.session.user_id, function(err, user) {
            if (err) {
                console.log(err);
                res.redirect("/login");
            } else {
                res.locals = { user: user }; //Para ver que user inicia session
                console.log(user.role);
                if(user.role == "Administrator"){
                    res.render("app/admin/home_admin");
                    //res.redirect("/admin");
                }
                next();
            }
        });
    }
}