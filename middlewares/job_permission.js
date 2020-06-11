var Job = require("../models/jobs");

module.exports = function(job, req, res) {
    if (req.method === "GET" && req.path.indexOf("edit") < 0) {
        return true;
    }

    if (typeof job.creator == "undefined") return false;

    if (job.creator._id.toString() == res.locals.user._id) {
        return true;
    }
    return false;
}