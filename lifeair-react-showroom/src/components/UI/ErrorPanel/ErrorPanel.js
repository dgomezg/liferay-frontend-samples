import React from 'react';

const errorPanel = (props) => (
    <div>An error ocurred while retrieving destinations {props.error.message}</div>
);

export default errorPanel;