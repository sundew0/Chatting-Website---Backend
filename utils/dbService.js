require("./dbQueries")
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const CHANNEL_TYPES = require("./constants");
const crypto = require("crypto");
const dbQueries = require("./dbQueries");

require("dotenv").config({path: __dirname + '/../.env'});


function dmChannelName(userId1, userId2) {
  const sorted = [userId1, userId2].sort(); // ensures consistent order
  return crypto.createHash("sha256")
               .update(sorted.join("-"))
               .digest("hex")
               .slice(0, 16); // short hash
}

const channel = {

      id: 1,
      name: '412a4789b02cad19',
      description: 'Chat between sundew & Maddie',
      created_by: 1,
      created_at: "2025-09-16T11:58:56.279Z",
      type: 0
    
};

const CreateDM = async (user, targetID) => {
    const targetUser = await dbQueries.getUserFromID(targetID);
    if (!targetUser || targetUser.success === false) {
        return ("Target user not found");
    }
    const channelName = dmChannelName(user.id, targetID)
    const channel = await dbQueries.CreateChannel(channelName, `Chat between ${user.username} & ${targetUser.username}`, user, CHANNEL_TYPES.DM)

    await dbQueries.AdduserToChannel(channel, user)
    await dbQueries.AdduserToChannel(channel, targetUser)
}

const SendMessage = async (user, channelID, content) => {
    const channel = await dbQueries.getChannelFromID(channelID);
    if (!channel || channel.success === false) {
        return ("Channel not found");
    }
    const message = await dbQueries.addMessageToChannel(user, channelID, content);
}


const CreateUser = async (username, password) => {
    const hashedPassword = await bcrypt.hash(password, 12); 
    await dbQueries.CreateAccount(username, hashedPassword);
} 

const GetUserServerList = async (user) => {
  const request = dbQueries.GetUserServerListQuerry(user);
  return request;
}
/*
(async () => { 
  const user = await dbQueries.getUserFromID(1);
  const test = await dbQueries.addMessageToChannel(user , 1, "Hello, this is a test message!");
  console.log(test);
  return;
})();*/


(async () => {
  const user = await dbQueries.getMessagesFromChannel(1);
  console.log(user); // actual user object or { success: false, ... }
  const GetUserServerListReponse = await dbQueries.getMessagesFromChannel(channel);
  console.log(GetUserServerListReponse);
})();
