const mongoose = require('mongoose');

const maintenanceDataSchema = new mongoose.Schema({
    machineId: String,
    temperature: Number,
    vibration: Number,
    current: Number,
    status: String,
    healthScore: Number,
    recommendation: String,
    action: String,
    timestamp: Date
});

module.exports = mongoose.model('MaintenanceData', maintenanceDataSchema);