var express = require("express");
var Job = require("./models/jobs");
var router = express.Router();

router.get("/", function(req, res) {

    res.render("app/home");
});

/*REST*/

router.get("/jobs/new", function(req, res) {
    res.render("app/jobs/new");
});

router.get("/jobs/:id/edit", function(req, res) {

});

router.route("/jobs/:id/")
    .get(function(req, res) {
        Job.findById(req.params.id, function(err, job) {
            res.render("app/jobs/show", { job: job });
        })
    })

.put(function(req, res) {

})

.delete(function(req, res) {

});

router.route("/jobs")
    .get(function(req, res) {
        Job.find({}, function(err, jobs) {
            if (err) { res.redirect("/app"); return; }
            res.render("app/jobs/index", { jobs: jobs });
        });
    })

.post(function(req, res) {
    var data = {
        category: req.body.category,
        type: req.body.type,
        company: req.body.company,
        //logo
        position: req.body.position,
        location: req.body.location,
        description: req.body.description
    }

    var job = new Job(data);

    job.save(function(err) {
        if (!err) {
            res.redirect("/app/jobs/" + job._id)
        } else {
            res.render(err);
        }

    });
});

module.exports = router;