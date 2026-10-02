# SIT314 IoT Predictive Maintenance System

This repository contains the implementation of my SIT314 Distinction and High Distinction project: **An IoT-Based Predictive Smart Maintenance System for a Manufacturing Site**.

The project explores the development and scalability of a cloud-based IoT predictive maintenance system.

## System Overview

The system processes simulated machine sensor data including:

- Temperature
- Vibration
- Current

The Distinction implementation uses MQTT, Node-RED, Node.js, MongoDB Atlas, AWS EC2, and an AWS Load Balancer.

For the High Distinction extension, the architecture was expanded using **Amazon SQS** and independent worker processes to investigate asynchronous message-driven processing and scalability.

## High Distinction Architecture

Sensor Data → AWS Load Balancer → EC2 API Servers → Amazon SQS → Worker Processes → MongoDB Atlas

The API servers accept incoming sensor data and place messages into Amazon SQS. Independent workers retrieve the messages, perform predictive maintenance processing, store the results in MongoDB Atlas, and delete successfully processed messages from the queue.

## Main Files

- `maintenanceServer.js` – Original predictive maintenance server.
- `maintenanceServerHD.js` – High Distinction API server using Amazon SQS.
- `worker.js` – Processes messages from the SQS queue.
- `mqttPublisher.js` – Simulates and publishes IoT sensor data.
- `loadTest.js` – Generates workloads for performance testing.
- `models/maintenanceData.js` – MongoDB maintenance data model.
- `sensors/` – Simulated sensor components.

## Technologies

- Node.js
- Express
- MQTT / HiveMQ
- Node-RED
- MongoDB Atlas
- AWS EC2
- AWS Elastic Load Balancing
- Amazon SQS

## Configuration

Create a `.env` file using `.env.example` as a template:

```env
MONGODB_URI=your_mongodb_connection_string
SQS_QUEUE_URL=your_sqs_queue_url