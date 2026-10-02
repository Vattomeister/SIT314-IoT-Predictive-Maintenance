const express = require('express');
const mongoose = require('mongoose');
const {
    SQSClient,
    SendMessageCommand
} = require('@aws-sdk/client-sqs');

require('dotenv').config();

const app = express();
const port = 3000;

app.use(express.json());



// AWS SQS CONFIGURATION
const sqsClient = new SQSClient({
    region: 'us-east-1'
});

// Queue URL is stored in .env
const queueUrl = process.env.SQS_QUEUE_URL;

console.log('Queue', queueUrl);



// MONGODB CONNECTION
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB Atlas');
    })
    .catch((err) => {
        console.log('MongoDB connection error:', err);
    });



// RECEIVE SENSOR DATA
// Send incoming data to SQS
app.post('/sensor-data', async function (req, res) {

    const startTime = Date.now();

    try {

        const data = req.body;

        // Add timestamp if one was not supplied
        if (!data.timestamp) {
            data.timestamp = new Date().toISOString();
        }

        const command = new SendMessageCommand({
            QueueUrl: queueUrl,
            MessageBody: JSON.stringify(data)
        });

        const result = await sqsClient.send(command);

        const endTime = Date.now();
        const responseTime = endTime - startTime;

        console.log('-----------------------------');
        console.log('Sensor data added to SQS');
        console.log('Machine:', data.machineId);
        console.log('Message ID:', result.MessageId);
        console.log(`Queue Response Time: ${responseTime} ms`);

        // 202 = request accepted for asynchronous processing
        res.status(202).json({
            message: 'Sensor data queued for processing',
            machineId: data.machineId,
            messageId: result.MessageId,
            responseTime: responseTime
        });

    } catch (err) {

        console.log('Error sending sensor data to SQS:', err);

        res.status(500).json({
            error: 'Failed to queue sensor data'
        });
    }
});



// GET ALL MAINTENANCE DATA
const MaintenanceData = require('./models/maintenanceData');

app.get('/maintenance-data', async function (req, res) {

    try {

        const records = await MaintenanceData.find()
            .sort({ timestamp: -1 });

        res.json(records);

    } catch (err) {

        console.log('Error retrieving maintenance data:', err);

        res.status(500).json({
            error: 'Failed to retrieve maintenance data'
        });
    }
});



// GET DATA FOR ONE MACHINE
app.get('/maintenance-data/:machineId', async function (req, res) {

    try {

        const records = await MaintenanceData.find({
            machineId: req.params.machineId
        })
        .sort({ timestamp: -1 });

        res.json(records);

    } catch (err) {

        console.log('Error retrieving machine data:', err);

        res.status(500).json({
            error: 'Failed to retrieve machine maintenance data'
        });
    }
});



// MACHINE TREND
// Latest 10 readings
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

        console.log('Error calculating machine trend:', err);

        res.status(500).json({
            error: 'Failed to calculate machine trend'
        });
    }
});



// AWS LOAD BALANCER HEALTH CHECK
app.get('/health', function (req, res) {

    res.status(200).json({
        status: 'OK'
    });

});



// START SERVER
app.listen(port, function () {

    console.log(
        `Predictive maintenance HD server running on port ${port}`
    );

});
