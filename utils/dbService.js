require("./dbQueries")
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const CHANNEL_TYPES = require("./constants");
const crypto = require("crypto");
const dbQueries = require("./dbQueries");

require("dotenv").config({path: __dirname + '/../.env'});


function dmChannelName(userId1, userId2) {
  sorted = [userId1, userId2].sort();
  const dmChannelName = "dm_" + crypto.createHash("sha256")
                                     .update(sorted.join("-"))
                                     .digest("hex")
                                     .slice(0, 16);
  return dmChannelName;
}


const userInChannel = async (user, channelID) => {
    const channel = await dbQueries.getChannelFromID(channelID);
    if (!channel || channel.success === false) {
        return ("Channel not found");
    }
    const membership  = await dbQueries.getUserInChannel(user, channel);
    if (!membership  || membership .success === false)
    {
      return ("user not in channel");
    }
    return (true);
}

const getUser = async (userID) => {
  const user = dbQueries.getUserFromID(userID);
  return user;
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

    return channel
}

const  CreateDMOrChannel = async (user, type, targetID = null, channelName= null, channelDiscription = null) => {
  if (type == CHANNEL_TYPES.DM) {
    if (!targetID) {
      return ('error')
    }
    const channel = await CreateDM(user, targetID)
    return channel
  } else if (type === CHANNEL_TYPES.CHANNEL) {
    if (!channelName) {
      return { success: false, error: "Channel name is required" };
    }
    const channel = await dbQueries.CreateChannel(channelName, channelDiscription, user, CHANNEL_TYPES.CHANNEL)
    await dbQueries.AdduserToChannel(channel, user)
    return channel
  }
}



const SendMessage = async (user, channelID, content) => {
    if (!userInChannel(user, channelID))
    {
      return {success: false}
    }

    const message = await dbQueries.addMessageToChannel(user, channelID, content);

    return {success: true}
}


const CreateUser = async (username, password) => {
    const hashedPassword = await bcrypt.hash(password, 12); 
    const request = await dbQueries.CreateAccount(username, hashedPassword);
    return request;
} 

const GetUserServerList = async (user) => {
  const request = dbQueries.GetUserServerListQuerry(user);
  return request;
}
const getMemberList = async (channel, user) => {
  const membership = userInChannel(user, channel.id);
  if (!membership) {
    return {success: false};
  }
  const request = dbQueries.GetServerMemberListQuerry(channel);
  return request;
}
const getMessages = async (channel) => {
  const membership = userInChannel(user, channel.id);
  if (!membership) {
    return {success: false};
  }
  const request = dbQueries.getMessagesFromChannel(channel);
  return request;
}
const addUserToServer = async (user, channel) => {
  const request = await dbQueries.AdduserToChannel(channel, user);
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
  const user = await dbQueries.getUserFromID(1);

  const getchanneltest = await dbQueries.getUserInChannel(user, channel) 
  console.log(getchanneltest)

})();

module.exports = {
  getUser,
  userInChannel,
  CreateDMOrChannel,
  SendMessage,
  CreateUser,
  GetUserServerList,
  getMemberList,
  getMessages
}