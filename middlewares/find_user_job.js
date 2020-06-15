var Job = require("../models/jobs");

module.exports = function(req, res, next) {
    Job.findById(req.params.id);
    res.redirect("/app/user_jobs_user_home");
}