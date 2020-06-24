var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var job_schema = new Schema({
    category: { type: String, required: true },
    type: { type: String, required: true },
    company: { type: String, required: true },
    extension: { type: String, required: false },
    position: { type: String, required: true },
    location: { type: String, required: true },
    description: { type: String, required: true },
    creator: { type: Schema.Types.ObjectId, ref: "User" },
    created: {
        type: Date,
        default: Date.now
    }
});


var Job = mongoose.model("Job", job_schema);
module.exports = Job;