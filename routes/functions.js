// functions.js
const { MESSAGE_TYPES } = require('../utils/constants');
const dbService = require('../utils/dbService');
const { logError } = require('../utils/errorHandlers');

// Handle incoming WebSocket message
async function handleMessage(ws, message, rooms) {
    switch (message.type) {
        case MESSAGE_TYPES.MESSAGE:
            try {
                await saveMessage(message);

                // Broadcast only to the same room
                const room = rooms[ws.roomKey] || new Set();
                room.forEach(client => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify(message));
                    }
                });

            } catch (err) {
                logError({ ...err, severity: 'server' });
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({ type: 'error', error: 'Failed to save message.' }));
                }
            }
            break;

        case MESSAGE_TYPES.KEEP_ALIVE:
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ type: 'keep-alive', body: 'pong' }));
            }
            break;

        default:
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ type: 'error', error: 'Unknown message type.' }));
            }
    }
}
// Wrapper functions for dbService
async function saveMessage(message) {
    return dbService.saveMessage(message);
}

async function getMessages(channelId) {
    return dbService.getMessages(channelId);
}

async function getUser(userId) {
    return dbService.getUser(userId);
}

async function getChannel(channelId) {
    return dbService.getChannel(channelId);
}

async function addUserToChannel(userId, channelId) {
    return dbService.addUserToChannel(userId, channelId);
}

async function removeUserFromChannel(userId, channelId) {
    return dbService.removeUserFromChannel(userId, channelId);
}

// Export all functions
module.exports = {
    handleMessage,
    saveMessage,
    getMessages,
    getUser,
    getChannel,
    addUserToChannel,
    removeUserFromChannel
};
