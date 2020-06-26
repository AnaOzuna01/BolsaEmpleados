var express = require("express");
var bodyParser = require("body-parser");
var User = require("./models/user").User;
var session = require("express-session");
var router_app = require("./routes_app");
var session_middlewares = require("./middlewares/session");
var form = require("express-form-data");
var redis = require("redis");
var redisClient = redis.createClient();
var RedisStore = require("connect-redis")(session);
var Job = require("./models/jobs");

var methodOverride = require("method-override");

var app = express();

app.use("/public", express.static('public'));
app.use(bodyParser.json()); //Para peticiones application/json
app.use(bodyParser.urlencoded({ extended: true }));

app.use(methodOverride("_method"))

var sessionMiddleware = session({
    store: new RedisStore({ client: redisClient }),
    secret: "super ultra secret word"
});
app.use(sessionMiddleware);

app.use(form.parse({ keepExtensions: true }));

app.set("view engine", "jade");

app.get("/", function(req, res) {
    console.log(req.session.user_id);
    res.render("index");
});

app.get("/signup", function(req, res) {
    User.find(function(err, doc) {
        console.log(doc);
        res.render("signup");
    });

});

app.get("/login", function(req, res) {
    res.render("login");
});

app.get("/logout", function(req, res) {
    req.session.destroy(function(err) {
        if (err) {
            console.log(err);
        } else {
            console.log("user.logout()")
            res.render("index");
        }
    });
});

app.post("/users", function(req, res) {
    var user = new User({
        email: req.body.email,
        password: req.body.password,
        password_confirmation: req.body.password_confirmation,
        username: req.body.username,
        role: req.body.role
    });


    user.save().then(function(us) {
        res.send("Guardamos el usuario exitosamente.");
    }, function(err) {
        if (err) {
            console.log(String(err));
            res.send("No pudimos guardar la informacion.");
        }
    });

});

app.post("/sessions", function(req, res) {
    User.findOne({ email: req.body.email, password: req.body.password }, function(err, user) {
        req.session.user_id = user._id;
        res.redirect("/app")
    });
});

// Jobs
app.get("/user_jobs/user_home", function(req, res) {
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
        //const skp = skipRow();
        Job.find({}, null, { sort: { created: -1 } }).limit(10)//.skip(skp)
            .populate("creator")
            .exec(function(err, users_jobs) {
                if (err) console.log(err);
                console.log(users_jobs);
                res.render("app/user_jobs/user_home", { users_jobs: users_jobs });
            })
    }
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

app.use("/app", session_middlewares);
app.use("/app", router_app);

app.listen(8080);