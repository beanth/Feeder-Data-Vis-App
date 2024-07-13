import React from 'react';

const IMG_API = "http://67.168.172.32:5010";//"http://pi.local:5010";

function CamFeed(props) {
	return <img src={IMG_API} {...props} alt="Food Bowl CamFeed"/>;
}

export default CamFeed;