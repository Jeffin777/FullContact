const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const contactSchema = mongoose.Schema({
    fname:   { type: String, required: true },
    lname:   { type: String, required: true },
    email:   { type: String, required: true },
    phone:   { type: String, required: true },
    org:     { type: String, required: false },
    title:   { type: String, required: false },
    desc:    { type: String, required: false },
    image:   { type: String, required: false },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
});

contactSchema.plugin(uniqueValidator);

module.exports = mongoose.model("Contact", contactSchema);