import { useState, useEffect, setState } from 'react';
import CamFeed from './CamFeed';
import { LineChart, Line, Legend, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';

const API = "http://localhost:3001";

function App() {
	const [samples, setSamples] = useState([]);

	const [foodNumber, setFoodNumber] = useState(13);
	const [textValue, setTextValue] = useState("");
	
	useEffect(() => {
		GetDataPoints();
		setInterval(GetDataPoints, 1000 * 10);
	}, []);

	async function GetDataPoints() {
		fetch(API + "/data")
			.then(response => response.json())
			.then(data => setSamples(data))
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
		setTextValue("");
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
		<div className="App">
			<h1 style={{color: "blue"}}>Cat Feeder</h1>
			<form onSubmit={handleSubmit}>
				<input type="datetime-local" value={textValue} name="time" onChange={e => setTextValue(e.target.value)}></input>
				<br/>
				<input type="number" value={foodNumber} name="food" onChange={e => setFoodNumber(e.target.value)}></input>
				<br/>
				<button type="submit">Submit</button>
			</form>
			<CamFeed/>
			<LineChart width={730} height={250} data={samples}
				margin={{ top: 30, right: 30, left: 30, bottom: 30 }}>
				<CartesianGrid strokeDasharray="3 3" />
				<XAxis dataKey="time"/>
				<YAxis dataKey="food"/>
				<Tooltip />
				<Legend />
				<Line type="linear" dataKey="food" stroke="#82ca9d" />
			</LineChart>
			<div className="samples">
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
			</div>
		</div>
	);
}

export default App;