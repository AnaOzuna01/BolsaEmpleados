var express = require("express");
var Job = require("./models/jobs");
var router = express.Router();
var fs = require("fs");
var path = require('path');
var job_find_middleware = require("./middlewares/find_job");
var user_job_find_middleware = require("./middlewares/user_job_permission")

router.get("/", function(req, res) {
    Job.find({})
        .populate("creator")
        .exec(function(err, jobs) {
            if (err) console.log(err);
            res.render("app/home", { jobs: jobs });
        })
});

/*REST*/

router.get("/jobs/new", function(req, res) {
    res.render("app/jobs/new");
});

router.get("/user_jobs/user_home", function(req, res) {
    Job.find({})
        .populate("creator")
        .exec(function(err, users_jobs) {
            if (err) console.log(err);
            console.log(users_jobs);
            res.render("app/user_jobs/user_home", { users_jobs: users_jobs });
        })
});

router.get("/user_jobs/user_post", function(req, res) {
    res.render("app/user_jobs/user_post");
});
//Funciona para ver todos
/*
router.get("/user_jobs/user_info", function(req, res) {
    Job.find({})
        .populate("creator")
        .exec(function(err, users_jobs) {
            if (err) console.log(err);
            console.log(users_jobs);
            res.render("app/user_jobs/user_info", { users_jobs: users_jobs });
        })
});
*/
router.all("/jobs/:id*", job_find_middleware);
router.get("/jobs/:id/edit", function(req, res) {
    res.render("app/jobs/edit");
});

//Para UserFind
router.all("/user_jobs/:id*", user_job_find_middleware);
router.get("/user_jobs/:id/user_info", function(req, res) {
    res.render("app/user_jobs/user_info");
});

router.route("/jobs/:id/")
    .get(function(req, res) {
        res.render("app/jobs/show");
    })

.put(function(req, res) {
    res.locals.job.category = req.body.category;
    res.locals.job.type = req.body.type;
    res.locals.job.company = req.body.company;
    res.locals.job.url = req.body.url;
    res.locals.job.position = req.body.position;
    res.locals.job.location = req.body.location;
    res.locals.job.description = req.body.description;

    res.locals.job.save(function(err) {
        if (!err) {
            res.render("app/jobs/show");

        } else {
            res.render("app/jobs/" + req.params.id + "/edit");
        }
    })
})

.put(function(req, res) {

    res.locals.job.company = req.body.company;
    res.locals.job.location = req.body.location;
    res.locals.job.position = req.body.position;
    res.locals.job.type = req.body.type;
    res.locals.job.description = req.body.description;

    res.locals.job.save(function(err) {
        if (!err) {
            res.render("app/user_jobs/user_home");

        } else {
            res.render("app/user_jobs/" + req.params.id + "/user_info");
        }
    })
})

.delete(function(req, res) {
    Job.findOneAndRemove({ _id: req.params.id }, function(err) {
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
        Job.find({ creator: res.locals.user._id }, function(err, jobs) {
            if (err) { res.redirect("/app"); return; }
            res.render("app/jobs/index", { jobs: jobs });

        });
    })

.post(function(req, res) {
    console.log(req.files.logo);
    var extension = req.files.logo.name.split(".").pop();
    var data = {
        category: req.body.category,
        type: req.body.type,
        company: req.body.company,
        extension: extension,
        position: req.body.position,
        location: req.body.location,
        description: req.body.description,
        creator: res.locals.user._id
    }

    var job = new Job(data);
    job.save(function(err) {
        if (!err) {
            fs.rename(req.files.logo.path, "public/jobs_images/" + job._id + "." + extension, function(err) {
                res.redirect("/app/jobs/" + job._id);
            });

        } else {
            console.log(job);
            res.render(err);
        }

    });
});

module.exports = router;