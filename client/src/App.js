import { useState, useEffect } from 'react';
import CamFeed from './CamFeed';
import { LineChart, Line, Legend, Tooltip, XAxis, YAxis, CartesianGrid, ReferenceLine } from 'recharts';

const API = "http://localhost:3001";
const MAX_FOOD = 40000000;
const MIN_FOOD = 6000000;//8000000;

function App() {
	const [samples, setSamples] = useState([]);
	const [referenceLines, setReferenceLines] = useState([]);

	const [foodNumber, setFoodNumber] = useState(13);
	const [dateValue, setDateValue] = useState("");
	const [refillAmt, setRefillAmt] = useState(20);

	//var minDate, maxDate;
	
	useEffect(() => {
		GetDataPoints();
		//setInterval(GetDataPoints, 1000 * 10);
	}, []);

	async function GetDataPoints() {
		// TODO:
		//	OPTIMIZE QUERY TO ONLY FETCH MISSING DATAPOINTS
		var referenceLines = [];
		fetch(API + "/data/")
			.then(response => response.json())
			.then((samples) => {
				for (var i in samples) {
					samples[i].time = new Date(samples[i].time);
					samples[i].food = ((samples[i].food - MIN_FOOD) / MAX_FOOD * 100).toFixed(1);

					if (i < 1)
						continue;
					const slope = (samples[i].food - samples[i - 1].food) / (samples[i].time - samples[i - 1].time);
					if (slope > -.1*10 ** -3)
						continue;
					if (referenceLines[referenceLines.length - 1] === samples[i - 1].time) {
						referenceLines[referenceLines.length - 1] = samples[i].time;
						continue;
					}
					referenceLines.push(samples[i].time)
					//samples.splice(i, 1);
				}
				setSamples(samples);
				setReferenceLines(referenceLines);
				console.log(referenceLines);
			})
			.catch(error => console.error("Error: ", error));
	}

	async function handleSubmit(e) {
		e.preventDefault();

		const form = e.target;
		const formData = new FormData(form);

		console.log(Object.fromEntries(formData));

		const data = await fetch(API + "/data", {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(Object.fromEntries(formData))
		})
			.then(res => res.json())
			.catch(error => console.error("Error: ", error));
		const newSamples = samples.concat(data);
		setSamples(newSamples);
		setFoodNumber(0);
		setDateValue("");
	}

	async function handleDelete(e) {
		const data = await fetch(API + "/data/" + e.target.id, {
			crossDomain: true,
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({})
		})
			.then(res => res.json())
			.catch(error => console.error("Error: ", error));

		if (data !== null)
			e.target.parentElement.remove();
		//	setSamples(samples => samples.filter(sample => sample._id !== data._id));
	}

	var maxSlope = -99;

	return (
		<div className="App" style={{ margin: 20 }}>
			<h1 style={{ color: "blue" }}>Cat Feeder</h1>
			<LineChart width={735} height={400} data={samples}
				margin={{ top: 10, right: 5, bottom: 10 }}>
				<CartesianGrid strokeDasharray="6 10"/>
				<XAxis dataKey="time" angle={-25} type="number" scale="time"
					domain={samples.length !== 0 ? [samples[0].time.getTime(), samples[samples.length - 1].time.getTime()] : [0, 0]}
					textAnchor='end' height={50} tickFormatter={ value => value.toLocaleString([],
						{ hour: 'numeric', minute: 'numeric', hour12: true }) }/>
				<YAxis dataKey="food" domain={[0,100]} tickFormatter={ value => `${value}%` }/>
				<ReferenceLine y={refillAmt} position={"top"} label={{
		          position: "bottom",
		          value: "Refill threshold"
		        }} stroke="#722F37" />
				{/*samples.map((sample, index) => {
					if (index < 1 || samples[index - 1].food - sample.food < 1)
						return;
					const slope = (sample.food - samples[index - 1].food) / (sample.time - samples[index - 1].time);
					if (slope > -6*10 ** -7)
						return;
					if (slope > maxSlope)
						maxSlope = slope;
					samples.splice(index, 1);
					return (
						<ReferenceLine x={sample.time.getTime()} label={{
			        		position: "top",
			        		value: slope
			        	}} stroke="gray" />
				)})*/
				referenceLines.map((ref, index) => {
					return (
						<ReferenceLine x={ref.getTime()} label={{
			        		position: "top",
			        		value: ref,
			        		fontSize: 5,
			        	}} stroke="gray" strokeWidth="4" />
				)})
		    	}
				<Tooltip formatter={ value => `${ Math.round(value) }%` }
					labelFormatter={label => label.toLocaleString([],
						{ weekday: "short", month: "short", day: "numeric", hour: 'numeric', minute: 'numeric', hour12: true })}/>
				<Legend/>
				<Line type="monotone" dataKey="food" stroke="blue"/>
			</LineChart>
			<CamFeed height="400"/>
			<form onSubmit={handleSubmit}>
				<input type="datetime-local" value={dateValue} name="time" onChange={e => setDateValue(e.target.value)}></input>
				<input type="number" value={foodNumber} name="food" onChange={e => setFoodNumber(e.target.value)}></input>
				<br/>
				<button type="submit">Submit</button>
			</form>
			{/*<div className="samples">
			{samples.map(samples => {
				var color = 'red';
				if (samples.food > 60)
					color = "white";
				if (samples.food > 80)
					color = "darkred";
				return (
				<div key={samples._id} className="data" style={{backgroundColor: color, display: "flex", flexDirection: "row", alignItems: "center"}}>
					<div>
					{ samples.time.toString() }<br/>
					{ samples.food }
					&nbsp;{ samples.text }
					</div>
					&emsp;<button id={samples._id} onClick={handleDelete}>X</button>
				</div>
			)})}
			</div>*/}
		</div>
	);
}

export default App;