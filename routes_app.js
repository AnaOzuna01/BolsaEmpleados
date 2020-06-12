var express = require("express");
var Job = require("./models/jobs");
var router = express.Router();
var fs = require("fs");
var path = require('path');
//var multer = require("multer");
var job_find_middleware = require("./middlewares/find_job");
const { Console } = require("console");
/*
var storage = multer.diskStorage({
    destination: path.join(__dirname, "public/jobs_images"),
    filename: (req, file, callback) => {
        callback(null, file.originalname);
    }
});

router.use(multer({
    storage: storage,
    dest: path.join(__dirname, "public/jobs_images")
}).single("logo"));
*/

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
    res.render("app/user_jobs/user_home");
});

router.get("/user_jobs/user_post", function(req, res) {
    res.render("app/user_jobs/user_post");
});

router.get("/user_jobs/user_info", function(req, res) {
    res.render("app/user_jobs/user_info");
});

router.all("/jobs/:id*", job_find_middleware);

router.get("/jobs/:id/edit", function(req, res) {
    res.render("app/jobs/edit");
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