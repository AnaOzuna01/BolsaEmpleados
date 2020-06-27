var express = require("express");
var Job = require("./models/jobs");
var router = express.Router();
var fs = require("fs");
var path = require('path');
var job_find_middleware = require("./middlewares/find_job");
var nodemailer = require("nodemailer");
var env = require("dotenv").config();
var swal = require("sweetalert");

router.get("/", function(req, res) {
    Job.find({}, null, { sort: { created: -1 } })
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

// Search Bar General
router.get("/user_jobs/user_home", function(req, res) {
    if (req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        Job.find({
                "$or": [{
                    category: regex
                }, {
                    company: regex
                }, {
                    position: regex
                }, {
                    location: regex
                }]
            }, null, { sort: { created: -1 } })
            .populate("creator")
            .exec(function(err, users_jobs) {
                if (err) console.log(err);
                console.log(users_jobs);
                res.render("app/user_jobs/user_home", { users_jobs: users_jobs });
            })
    } else {
        Job.find({}, null, { sort: { created: -1 } })//.skip((PerPage * Page) - PerPage).limit(PerPage)
            .populate("creator")
            .exec(function(err, users_jobs) {
                if (err) console.log(err);
                console.log(users_jobs);
                res.render("app/user_jobs/user_home", { users_jobs: users_jobs });
            })
    }
});

// Pages
router.get("/user_jobs/user_home/:page", function(req, res) {
        let perPage = 1;
        let page = req.params.page || 1;
    if (req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        Job.find({
                "$or": [{
                    category: regex
                }, {
                    company: regex
                }, {
                    position: regex
                }, {
                    location: regex
                }]
            }, null, { sort: { created: -1 } }).skip((perPage * page) - perPage).limit(perPage)
            .populate("creator")
            .exec(function(err, users_jobs) {
                if (err) console.log(err);
                console.log(users_jobs);
                res.render("app/user_jobs/user_home", { users_jobs: users_jobs });
            })
    } else {
        Job.find({}, null, { sort: { created: -1 } }).skip((perPage * page) - perPage).limit(perPage)
            .populate("creator")
            .exec(function(err, users_jobs) {
                if (err) console.log(err);
                console.log(users_jobs);
                Job.count(function(err, count){
                    if (err) console.log(err);
                        console.log(users_jobs);
                    res.render("app/user_jobs/user_home", { users_jobs: users_jobs,
                        current: page,
                        pages: Math.ceil(count / perPage)
                      });
                })
                //res.render("app/user_jobs/user_home", { users_jobs: users_jobs });
            })
    }
});

router.all("/jobs/:id*", job_find_middleware);

router.get("/jobs/:id/edit", function(req, res) {
    Job.findById(req.params.id, function(err, job) {
        res.render("app/jobs/edit", { job: job });
    })
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
        Job.find({ creator: res.locals.user._id }, null, { sort: { created: -1 } }, function(err, jobs) {
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


//User Post
router.get("/user_jobs/:id/user_post", function(req, res) {
    Job.findById(req.params.id, function(err, job) {
        res.render("app/user_jobs/user_post", { job: job });
    })
});

router.post("/user_jobs/:id/user_post", function(req, res) {

    "use strict";
    const nodemailer = require("nodemailer");

    // async..await is not allowed in global scope, must use a wrapper
    async function main() {
        // Generate test SMTP service account from ethereal.email
        // Only needed if you don't have a real mail account for testing
        let testAccount = await nodemailer.createTestAccount();

        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: process.env.GMAIL_EMAIL, // generated ethereal use
                pass: process.env.GMAIL_PASS // generated ethereal password
            },
        });

        // send mail with defined transport object
        let info = await transporter.sendMail({
            from: req.body.email, // sender address
            to: "anamol2699@hotmail.com", // list of receivers
            subject: "Interested in job.", // Subject line
            text: "Postulant: " + req.body.email + " Category: " + req.body.category + " Location: " + req.body.location + " Position: " + req.body.position + " Company: " + req.body.company, // plain text body
        });

        console.log("Message sent: %s", info.messageId);

        //swal("Confirmation!", "¡The message was sent successfully!", "success");
        //alert("¡The message was sent successfully!");

    }

    main().catch(console.error);
});

//User Jobs
router.get("/user_jobs/:id/user_info", function(req, res) {
    Job.findById(req.params.id)
        .populate("creator")
        .exec(function(err, job) {
            if (err) console.log(err);
            res.render("app/user_jobs/user_info", { job: job });
        })
});

router.route("user_jobs/:id");

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

/*function skipRow(){

};*/
module.exports = router;