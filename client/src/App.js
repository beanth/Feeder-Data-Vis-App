import { useState, useEffect, setState } from 'react';
import CamFeed from './CamFeed';
import { LineChart, Line, Legend, Tooltip, XAxis, YAxis, CartesianGrid, ReferenceLine } from 'recharts';

const API = "http://localhost:3001";
const MAX_FOOD = 32000000;
const MIN_FOOD = 8000000;

function App() {
	const [samples, setSamples] = useState([]);

	const [foodNumber, setFoodNumber] = useState(13);
	const [dateValue, setDateValue] = useState("");
	const [refillAmt, setRefillAmt] = useState(20);
	
	useEffect(() => {
		GetDataPoints();
		console.log(samples.length);
		//setInterval(GetDataPoints, 1000 * 10);
	}, []);

	async function GetDataPoints() {
		// TODO:
		//	OPTIMIZE QUERY TO ONLY FETCH MISSING DATAPOINTS
		fetch(API + "/data/average")
			.then(response => response.json())
			.then((data) => {
				for (var i in data) {
					data[i].time = new Date(data[i].time).toLocaleString([],
						{ hour: '2-digit', minute: '2-digit' });
					data[i].food = ((data[i].food - MIN_FOOD) / MAX_FOOD * 100).toFixed(1);
				}
				setSamples(data);
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
			setSamples(samples => samples.filter(sample => sample._id !== data._id));
	}

	return (
		<div className="App" style={{ margin: 10 }}>
			<h1 style={{ color: "blue" }}>Cat Feeder</h1>
			<LineChart width={730} height={400} data={samples}
				margin={{ top: 30, right: 30, left: 30, bottom: 30 }}>
				<CartesianGrid strokeDasharray="6 12"/>
				<XAxis dataKey="time" angle={-25} textAnchor='end' height={55}/>
				<YAxis dataKey="food" tickFormatter={ value => `${value}%` }/>
				<ReferenceLine y={refillAmt} position={"top"} label={{
		          position: "bottom",
		          value: "Refill threshold"
		        }} stroke="#722F37" />
				<Tooltip formatter={ value => `${ Math.round(value) }%` }/>
				<Legend/>
				<Line type="monotone" dataKey="food" stroke="blue"/>
			</LineChart>
			<CamFeed/>
			<form onSubmit={handleSubmit}>
				<input type="datetime-local" value={dateValue} name="time" onChange={e => setDateValue(e.target.value)}></input>
				<input type="number" value={foodNumber} name="food" onChange={e => setFoodNumber(e.target.value)}></input>
				<br/>
				<button type="submit">Submit</button>
			</form>
			{/*<div className="samples">
			{samples.map(samples => (
				<div key={samples._id} className="data" style={{display: "flex", flexDirection: "row", alignItems: "center"}}>
					<div>
					{ samples.time }<br/>
					{ samples.food }
					&nbsp;{ samples.text }
					</div>
					&emsp;<button id={samples._id} onClick={handleDelete}>X</button>
				</div>
			))}
			</div>*/}
		</div>
	);
}

export default App;