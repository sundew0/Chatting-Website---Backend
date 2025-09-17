require("./dbQueries")
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const CHANNEL_TYPES = require("./constants");
const crypto = require("crypto");
const { getUserFromID, AdduserToChannel, CreateAccount, CreateChannel } = require("./dbQueries");

require("dotenv").config({path: __dirname + '/../.env'});


function dmChannelName(userId1, userId2) {
  const sorted = [userId1, userId2].sort(); // ensures consistent order
  return crypto.createHash("sha256")
               .update(sorted.join("-"))
               .digest("hex")
               .slice(0, 16); // short hash
}


const CreateDM = async (user, targetID) => {
    const targetUser = await getUserFromID(targetID);
    if (!targetUser || targetUser.success === false) {
        returm ("Target user not found");
    }
    const channelName = dmChannelName(user.id, targetID)
    const channel = await CreateChannel(channelName, `Chat between ${user.username} & ${targetUser.username}`, user, CHANNEL_TYPES.DM)

    await AdduserToChannel(channel, user)
    await AdduserToChannel(channel, targetUser)
}


(async () => {
  const user = await getUserFromID(1);
  console.log(user); // actual user object or { success: false, ... }
  CreateDM(user, 2)
})();


const CreateUser = async (username, password) => {
    const hashedPassword = await bcrypt.hash(password, 12); 
    await CreateAccount(username, hashedPassword);
} 

/*
i have a database where the sqlqueries to get everything is, SELECT channel_id, user_id, joined_at FROM public.channel_members; SELECT id, "name", description, created_by, created_at, "type" FROM public.channels; SELECT message_id, user_id, read_at FROM public.message_reads; SELECT id, sender_id, channel_id, "content", created_at FROM public.messages; SELECT id, username, password_hash, "token", token_expiry, created_at FROM public.users;, i also have a bunch of functions to call them going along the lines of CreateAccount, LoginUser, CreateChannel, AdduserToChannel, RemoveUserFromChannel, DeleteChannel, addMessageToChannel, addMessageToRead, getUserFromID with more to add, with constants like this const CHANNEL_TYPES = { DM: 0, GROUP: 1 }; / Range Category Example Codes 1000–1999 - Auth & User 2000–2999 Messages & Channels 3000–3999 Requests & Validation 4000–4999 System/Infra / const ERROR_CODES = { // 1000s: Auth & Users USER_NOT_FOUND: { code: 1001, message: "User not found.", severity: ERROR_SEVERITY.MIN}, INVALID_PASSWORD: { code: 1002, message: "Invalid password.", severity: ERROR_SEVERITY.MIN }, UNAUTHORIZED: { code: 1003, message: "Unauthorized request.", severity: ERROR_SEVERITY.NORMAL },

// 2000s: Channels & Messages CHANNEL_NOT_FOUND: { code: 2001, message: "Channel not found.", severity: ERROR_SEVERITY.MIN }, NO_MESSAGES_FOUND: { code: 2002, message: "No messages in this channel.", severity: ERROR_SEVERITY.MIN }, CHANNEL_ALEADYY_EXISTS: { code: 2003, message: "Channel already exists.", severity: ERROR_SEVERITY.MIN }, USER_ALREADY_IN_CHANNEL: { code: 2004, message: "User already in channel.", severity: ERROR_SEVERITY.MIN },

// 3000s: Validation BAD_REQUEST: { code: 3001, message: "Bad request.", severity: ERROR_SEVERITY.NORMAL }, INVALID_PARAMETER: { code: 3002, message: "Invalid parameter.", severity: ERROR_SEVERITY.NORMAL },

// 4000s: System DB_QUERY_FAILED: { code: 4001, message: "Database query failed.", severity: ERROR_SEVERITY.HIGH }, CACHE_ERROR: { code: 4002, message: "Cache error.", severity: ERROR_SEVERITY.HIGH }, UNKNOWN_ERROR: { code: 4003, message: "Unknown error occurred.", severity: ERROR_SEVERITY.SERVER }, };

const ERROR_SEVERITY = { MIN: 0, LOW: 1, NORMAL: 2, HIGH: 3, SERVER: 4, }

i also wanted how i can build the higher functions like this so i can easily see what i need to call for what abilities, with this as a example const CreateDM = async (user, targetID) => { const targetUser = await getUserFromID(targetID); if (!targetUser || targetUser.success === false) { returm ("Target user not found"); } const channelName = dmChannelName(user.id, targetID) const channel = await CreateChannel(channelName, Chat between ${user.username} & ${targetUser.username}, user, CHANNEL_TYPES.DM)

await AdduserToChannel(channel, user)
await Ad
*/ 