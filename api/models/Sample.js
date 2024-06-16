const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DataSchema = new Schema({
	text: {
		type: String,
	},
	time: {
		type: Date,
		default: function() { return Date.now() }
	},
	food: {
		type: Number,
		required: true
	}
});

const Sample = mongoose.model("Sample", DataSchema);

module.exports = Sample;