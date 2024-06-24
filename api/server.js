const express = require("express");
const mongoose = require("mongoose"); // MIGRATE TO POSTGRESQL
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
				time: new Date(response[i][0])
			});

			datapoint.save();
		}
	}
	catch(e) {
		console.error("ERROR:", e);
	}
	//const datapoint
}

getDataPoints();

mongoose.connect("mongodb://127.0.0.1:27017/")
	.then(() => console.log("Connected to DB"))
	//.then(() => setInterval(getDataPoints, 1000 * 10)) // only want to start interval when we can properly store the data
	.catch((err) => console.error(err));

const Sample = require("./models/Sample");

router.get("/data", async (req, res) => {
	const to_date = await Sample.findOne().sort("-time")
		.then((date) => {
			return new Date(date.time).getTime();
		});
	const from_date = to_date - 1000*60*60*12;

	const datapoints = await Sample.find({"time": {"$gte": from_date, "$lte": to_date}})
		.sort("+time");
	res.json(datapoints);
});

router.get("/data/average", async (req, res) => {
	var averages = [];
	var from_date = await Sample.findOne().sort("+time")
		.then((date) => {
			return new Date(date.time).getTime();
		});

	const to_date = await Sample.findOne().sort("-time")
		.then((date) => {
			return new Date(date.time).getTime();
		});

	while (from_date < to_date) {
		const outer_range = from_date + 1000*60*60;
		var datapoints = await Sample.aggregate([
			{ $match : { 
				time: { $gte: new Date(from_date), $lt: new Date(outer_range)},
				food: { $gte: 16000000, $lt: 40000000 } } },
			{ $group: { _id: null, food: { $avg: "$food" } } }
		]).then((data) => {
			return data[0];
		});


		if (datapoints !== undefined) {
			datapoints.time = new Date(outer_range);
			averages.push(datapoints);
		}
		from_date = outer_range;
	}

	res.json(averages);
});

router.post("/data", async (req, res) => {
	const datapoint = new Sample({
		food: req.body.food,
		time: Date.parse(req.body.time)
	});

	datapoint.save();

	res.json(datapoint);
});

router.delete("/data/:id", async (req, res) => {
	const datapoint = await Sample.findByIdAndDelete(req.params.id);
	res.json(datapoint);
});

router.listen(3001, () => console.log("Listening on 3001"));