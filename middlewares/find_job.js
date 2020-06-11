var Job = require("../models/jobs");

module.exports = function(req, res, next) {
    Job.findById(req.params.id)
        .populate("creator")
        .exec(function(err, job) {
            if (job != null) {
                console.log("Job founded. Creator ID:  " + job.creator);
                res.locals.job = job;
                next();
            } else {
                res.redirect("/app");
            }
        })
}