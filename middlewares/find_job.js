var Job = require("../models/jobs");

module.exports = function(req, res, next) {
    Job.findById(req.params.id, function(err, job) {
        if (job != null) {
            res.locals.job = job;
            next();
        } else {
            res.redirect("/app");
        }
    })
}