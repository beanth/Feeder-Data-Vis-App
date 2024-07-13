const express = require("express");
const mongoose = require("mongoose"); // MIGRATE TO POSTGRESQL
const cors = require("cors");

const router = express();
router.use(express.json());
router.use(cors());

const apiURI = "67.168.172.32";//"pi.local";

async function getDataPoints() {
	try {
		const data = await fetch("http://" + apiURI + ":5010/data");
		const response = await data.json();
		for (let i = 0; i < response.length; i++) {
			const datapoint = new Sample({
				food: response[i][1],
				time: new Date(response[i][0])
			});

			await datapoint.save();
		}
	}
	catch(e) {
		console.error("ERROR:", e);
	}
}

mongoose.connect("mongodb://127.0.0.1:27017/")
	.then(() => console.log("Connected to DB"))
	.then(async () => {
		const to_date = await Sample.findOne().sort("-time")
			.then((date) => {
				return new Date(date.time).getTime();
			})
			.catch((err) => console.error(err));

		Sample.deleteMany({ time: { $lte: to_date - 1000*60*60*24*7 } })
			.then(() => console.log("Deleted from a week ago"))
			.catch((err) => console.error(err));
	})
	.then(() => setInterval(getDataPoints, 1000 * 10)) // only want to start interval when we can properly store the data
	.catch((err) => console.error(err));

const Sample = require("./models/Sample");

getDataPoints();

router.get("/data", async (req, res) => {
	var datapoints = await Sample.aggregate([
		  { $group: {
		      _id: {
		        time: {
		          $dateTrunc: {
		            date: "$time",
		            unit: "minute",
		            binSize: 5
		          }
		        },
		      },
		      food: {$avg: "$food"},
		  } },
		  { $project: {
		  	_id: 0,
		  	food: "$food",
		  	time: "$_id.time"
		  } },
		  { $sort: { time: 1 } }
	]);

	res.json(datapoints);
});

router.get("/data/average", async (req, res) => {
	var averages = [];
	var from_date = await Sample.findOne().sort("+time")
		.then((date) => {
			var dateObj = new Date(date.time);
			dateObj.setMinutes(0);
			dateObj.setSeconds(0);
			dateObj.setMilliseconds(0);
			return dateObj.getTime();
		})
		.catch((err) => console.error(err));

	const to_date = await Sample.findOne().sort("-time")
		.then((date) => {
			return new Date(date.time).getTime();
		})
		.catch((err) => console.error(err));

	while (from_date < to_date) {
		const outer_range = Math.min(from_date + 1000*60*60, to_date);
		var datapoints = await Sample.aggregate([
			{ $match : { 
				time: { $gte: new Date(from_date), $lt: new Date(outer_range)},
				food: { $gte: 6000000 }//, $lt: 40000000 }
				//5000000
			} },
			{ $group: { _id: null, food: { $avg: "$food" } } }
		]).then((data) => {
			return data[0];
		});


		if (datapoints !== undefined) {
			datapoints.time = new Date(outer_range);
			datapoints.food = Math.ceil(datapoints.food);
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