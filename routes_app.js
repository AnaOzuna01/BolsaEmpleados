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
    Job.findById(req.params.id, function(err, job) {
        res.render("app/jobs/edit", { job: job });
    })
});

router.route("/jobs/:id/")
    .get(function(req, res) {
        Job.findById(req.params.id, function(err, job) {
            res.render("app/jobs/show", { job: job });
        })
    })

.put(function(req, res) {
    Job.findById(req.params.id, function(err, job) {
        job.category = req.body.category;
        job.type = req.body.type;
        job.company = req.body.company;
        //logo
        job.url = req.body.url;
        job.position = req.body.position;
        job.location = req.body.location;
        job.description = req.body.description;

        job.save(function(err) {
            if (!err) {
                res.render("app/jobs/show", { job: job });
            } else {
                res.render("app/jobs/" + job.id + "/edit", { job: job });
            }
        })

    })
})

.delete(function(req, res) {
    Job.findByIdAndRemove({ _id: req.params.id }, function(err) {
        if (!err) {
            res.redirect("/app/jobs");
        } else {
            console.log(err);
            res.redirect("/app/jobs" + req.params.id);
        }
    })
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