import React from 'react';
import './Travel.css';

const BACKEND_URL = 'http://liferay-gs-ci:8091'

const travel = (props) => {
    console.log(props.details);
    const backgroundImage = 
        props.details
            .filter(field => field.type === "image")
            .slice(0,1)
            .map(imageField => imageField.value.image.contentUrl);
    console.log("Image: ", backgroundImage);            

    return (
        <div className="Travel">
            <h3>{props.title}</h3>
            <img style={{width: '200px'}} src={BACKEND_URL+backgroundImage}></img>
        </div>
    );
}
export default travel;