import React from 'react';
import { TimedImage } from "react-timed-image";

const IMG_API = "http://67.168.172.32:5010";//"http://pi.local:5010";

function CamFeed() {
	return (
		<TimedImage src={IMG_API} interval={1000}/>
	)
}

export default CamFeed;