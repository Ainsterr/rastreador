const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

// Endpoint to receive location data
app.post('/api/location', (req, res) => {
    const locationData = req.body;
    const dataFilePath = path.join(__dirname, 'data', 'locations.json');
    
    let locations = [];
    if (fs.existsSync(dataFilePath)) {
        const fileContent = fs.readFileSync(dataFilePath, 'utf-8');
        locations = JSON.parse(fileContent);
    }
    
    locations.push(locationData);
    fs.writeFileSync(dataFilePath, JSON.stringify(locations, null, 2));
    
    res.status(200).json({ message: 'Location data stored successfully' });
});

// Endpoint to get all locations
app.get('/api/locations', (req, res) => {
    const dataFilePath = path.join(__dirname, 'data', 'locations.json');
    let locations = [];
    
    if (fs.existsSync(dataFilePath)) {
        const fileContent = fs.readFileSync(dataFilePath, 'utf-8');
        locations = JSON.parse(fileContent);
    }
    
    res.json(locations);
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

