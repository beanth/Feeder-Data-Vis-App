import { useState, useEffect } from 'react';

const API = "http://localhost:3001";

function App() {
	const [samples, setSamples] = useState([]);
	const [newSample, setNewSample] = useState("");

	const [foodNumber, setFoodNumber] = useState(13);
	const [textValue, setTextValue] = useState("");

	useEffect(() => {
		GetDataPoints();
	}, []);

	const GetDataPoints = () => {
		fetch(API + "/data")
			.then(response => response.json())
			.then(data => setSamples(data))
			.catch(error => console.error("Error: ", error));
	}

	async function handleSubmit(e) {
		e.preventDefault();

		const form = e.target;
		const formData = new FormData(form);

		fetch(API + "/data", {
			crossDomain: true,
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(Object.fromEntries(formData))
		})
			.catch(error => console.error("Error: ", error));

		setFoodNumber(0);
		setTextValue("");
	}

	return (
		<div className="App">
			<h1 style={{color: "blue"}}>Cat Feeder</h1>
			<form onSubmit={handleSubmit}>
				<input type="text" value={textValue} name="text" onChange={e => setTextValue(e.target.value)}></input>
				<br/>
				<input type="number" value={foodNumber} name="food" onChange={e => setFoodNumber(e.target.value)}></input>
				<br/>
				<button type="submit">Submit</button>
			</form>
			<div className="samples">
			{samples.map(samples => (
				<div className="data" style={{display: "flex", flexDirection: "row", alignItems: "center"}}>
					<div>
					{ samples.time }<br/>
					{ samples.food }
					&nbsp;{ samples.text }
					</div>
					&emsp;<button>X</button>
				</div>
			))}
			</div>
		</div>
	);
}

export default App;
