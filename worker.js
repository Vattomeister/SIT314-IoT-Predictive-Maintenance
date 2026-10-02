const mongoose = require("mongoose");
const {
    SQSClient,
    GetQueueUrlCommand,
    ReceiveMessageCommand,
    DeleteMessageCommand
} = require("@aws-sdk/client-sqs");

const MaintenanceData = require("./models/maintenanceData");

require("dotenv").config();

const sqs = new SQSClient({
    region: "us-east-1"
});

async function processMessage(data) {

    let healthScore = 100;

    // Same calculation as Distinction project
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

    await maintenanceRecord.save();

    console.log("-----------------------------");
    console.log("Machine:", data.machineId);
    console.log("Health Score:", healthScore);
    console.log("Recommendation:", recommendation);
    console.log("Action:", action);
    console.log("Saved to MongoDB");
}

async function startWorker() {

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB Atlas");

    const queue = await sqs.send(
        new GetQueueUrlCommand({
            QueueName: "predictive-maintenance-queue"
        })
    );

    console.log("Connected to SQS");
    console.log("Worker waiting for messages...");

    while (true) {

        try {

            const result = await sqs.send(
                new ReceiveMessageCommand({
                    QueueUrl: queue.QueueUrl,
                    MaxNumberOfMessages: 1,
                    WaitTimeSeconds: 20,
                    VisibilityTimeout: 30
                })
            );

            if (!result.Messages) {
                continue;
            }

            for (const message of result.Messages) {

                const data = JSON.parse(message.Body);

                console.log("Received SQS message:", message.MessageId);

                await processMessage(data);

                // Remove only after successful processing
                await sqs.send(
                    new DeleteMessageCommand({
                        QueueUrl: queue.QueueUrl,
                        ReceiptHandle: message.ReceiptHandle
                    })
                );

                console.log("Message removed from SQS");
            }

        } catch (error) {
            console.error("Worker error:", error);
        }
    }
}

startWorker().catch(console.error);
