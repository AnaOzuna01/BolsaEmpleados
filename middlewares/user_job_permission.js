var Job = require("../models/jobs");

module.exports = function(job, req, res) {
    if (req.method === "GET" && req.path.indexOf("user_info") < 0) {
        return true;
    }
}