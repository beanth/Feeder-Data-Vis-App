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

async function getDataPoints() {
	try {
		const data = await fetch("http://pi.local:5010/data");
		const response = await data.json();
		for (let i = 0; i < response.length; i++) {
			const datapoint = new Sample({
				food: response[i][1],
				time: response[i][0]
			});

			datapoint.save();
		}
	}
	catch(e) {
		console.error("ERROR: ", e);
	}
	//const datapoint
}

getDataPoints();

mongoose.connect("mongodb://127.0.0.1:27017/")
	.then(() => console.log("Connected to DB"))
	.then(() => setInterval(getDataPoints, 1000 * 10)) // only want to fetch when we can properly store the data
	.catch((err) => console.error(err));

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

router.listen(3001, () => console.log("Listening on 3001"));