var Job = require("../models/jobs");
var owner_check = require("./job_permission");

module.exports = function(req, res, next) {
    Job.findById(req.params.id, function(err, job) {
                console.log(job.creator);
                res.locals.job = job;
                next();
            
        });
}