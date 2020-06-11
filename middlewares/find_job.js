var Job = require("../models/jobs");
var owner_check = require("./job_permission");

module.exports = function(req, res, next) {
    Job.findById(req.params.id)
        .populate("creator")
        .exec(function(err, job) {
            if (job != null && owner_check(job, req, res)) {
                console.log("Job founded. Creator ID:  " + job.creator);
                res.locals.job = job;
                next();
            } else {
                res.redirect("/app");
            }
        })
}