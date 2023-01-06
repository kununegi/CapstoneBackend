const axios = require ('axios');
const HttpError = require('../models/error.js')

const API_KEY = 'AIzaSyBKchfshbb9tYzy3LrKsUyb_vkZq6Rrt8A';

async function getCoordsForAddress(address) {

    // return{
    //         lat:40.7484474,
    //         lng:-73.9871516
    
    // };
    const response = await axios.get
    (`https://maps.googleapis.com/maps/api/geocode/json?address=
    ${encodeURIComponent(address)}&key=${API_KEY}`
    );
    const data = response.data;
    if (!data || data.status === 'ZERO_RESULTS'){
        const error = new HttpError('Could not found location for the specified address');
        throw error;
    }
    const coordinates = data.results[0].geometry.location;
    return coordinates;
}

module.exports = getCoordsForAddress

