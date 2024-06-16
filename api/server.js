const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

var corsOptions = {
	origin: 'http://localhost:3000',
	optionsSuccessStatus: 200
}

const router = express();
router.use(express.json());
router.use(cors());

mongoose.connect("mongodb://127.0.0.1:27017/")
	.then(() => console.log("Connected to DB"))
	.catch(console.error);

const Sample = require("./models/Sample");

router.get("/data", async (req, res) => {
	const datapoints = await Sample.find();

	res.json(datapoints);
});

router.post("/data", (req, res) => {
	const datapoint = new Sample({
		food: req.body.food,
		text: req.body.text,
	});

	datapoint.save();

	res.json(datapoint);
});

router.delete("/data/:id", async (req, res) => {
	const datapoint = await Sample.findByIdAndDelete(req.params.id);
	res.json(datapoint);
});


router.listen(3001, () => console.log("Started on 3001"));