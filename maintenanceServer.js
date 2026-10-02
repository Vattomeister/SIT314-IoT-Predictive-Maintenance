const express = require('express');
const mongoose = require('mongoose');
const MaintenanceData = require('./models/maintenanceData');

require('dotenv').config();

const app = express();
const port = 3000;

app.use(express.json());


// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB Atlas');
    })
    .catch((err) => {
        console.log('MongoDB connection error:', err);
    });


// Receive sensor data from Node-RED
app.post('/sensor-data', function (req, res) {

    // Start measuring response time
    const startTime = Date.now();

    const data = req.body;

    let healthScore = 100;


    // Calculate machine health score
    if (data.temperature > 80) {
        healthScore -= 30;
    }

    if (data.vibration > 8) {
        healthScore -= 30;
    }

    if (data.current > 25) {
        healthScore -= 30;
    }


    // Maintenance recommendation
    let recommendation = "Machine operating normally";

    if (healthScore <= 70 && healthScore > 40) {
        recommendation = "Maintenance inspection recommended";
    }

    if (healthScore <= 40) {
        recommendation = "Urgent maintenance required";
    }


    // Actuator decision
    let action = "NO_ACTION";

    if (healthScore <= 70 && healthScore > 40) {
        action = "WARNING_LIGHT";
    }

    if (healthScore <= 40) {
        action = "EMERGENCY_STOP";
    }


    // Display processed information
    console.log('Received processed sensor data:');
    console.log(data);

    console.log('Health Score:', healthScore);
    console.log('Recommendation:', recommendation);
    console.log('Action:', action);


    // Create maintenance record
    const maintenanceRecord = new MaintenanceData({
        machineId: data.machineId,
        temperature: data.temperature,
        vibration: data.vibration,
        current: data.current,
        status: data.status,
        healthScore: healthScore,
        recommendation: recommendation,
        action: action,
        timestamp: data.timestamp
    });


    // Save maintenance data to MongoDB
    maintenanceRecord.save()
        .then(() => {

            // Stop measuring response time after MongoDB save
            const endTime = Date.now();
            const responseTime = endTime - startTime;

            console.log('Maintenance data saved to MongoDB');
            console.log(`Response Time: ${responseTime} ms`);
            console.log('-----------------------------');

            // Return result to Node-RED
            res.json({
                machineId: data.machineId,
                healthScore: healthScore,
                recommendation: recommendation,
                action: action,
                responseTime: responseTime
            });
        })
        .catch((err) => {
            console.log('Error saving maintenance data:', err);

            res.status(500).json({
                error: 'Failed to save maintenance data'
            });
        });
});


// Get all maintenance records
app.get('/maintenance-data', async function (req, res) {
    try {

        const records = await MaintenanceData.find()
            .sort({ timestamp: -1 });

        res.json(records);

    } catch (err) {

        res.status(500).json({
            error: 'Failed to retrieve maintenance data'
        });

    }
});


// Get maintenance records for one machine
app.get('/maintenance-data/:machineId', async function (req, res) {
    try {

        const records = await MaintenanceData.find({
            machineId: req.params.machineId
        })
        .sort({ timestamp: -1 });

        res.json(records);

    } catch (err) {

        res.status(500).json({
            error: 'Failed to retrieve machine maintenance data'
        });

    }
});


// Analyse the latest 10 readings for one machine
app.get('/machine-trend/:machineId', async function (req, res) {
    try {

        const records = await MaintenanceData.find({
            machineId: req.params.machineId
        })
        .sort({ timestamp: -1 })
        .limit(10);

        if (records.length === 0) {
            return res.json({
                message: 'No maintenance data found'
            });
        }


        const avgTemperature =
            records.reduce((sum, r) => sum + r.temperature, 0)
            / records.length;

        const avgVibration =
            records.reduce((sum, r) => sum + r.vibration, 0)
            / records.length;

        const avgCurrent =
            records.reduce((sum, r) => sum + r.current, 0)
            / records.length;


        res.json({
            machineId: req.params.machineId,
            readingsUsed: records.length,
            averageTemperature: Number(avgTemperature.toFixed(2)),
            averageVibration: Number(avgVibration.toFixed(2)),
            averageCurrent: Number(avgCurrent.toFixed(2))
        });

    } catch (err) {

        res.status(500).json({
            error: 'Failed to calculate machine trend'
        });

    }
});


// Start server
app.listen(port, function () {
    console.log(`Predictive maintenance server running on port ${port}`);
});