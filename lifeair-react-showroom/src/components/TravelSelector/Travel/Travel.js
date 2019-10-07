import React from 'react';
import './Travel.css';
import 'dotenv/config';

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
            <img style={{width: '200px'}} src={process.env.REACT_APP_BACKEND_URL+backgroundImage}></img>
        </div>
    );
}
export default travel;