
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

  console.log(dmChannelName)
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
const LoginUser = async (username, password) => {
  // Use the dbQueries LoginUser function which handles JWT token generation
  return await dbQueries.LoginUser(username, password);
};

const CreateDM = async (user, targetID) => {
    const targetUser = await dbQueries.getUserFromID(targetID);
    if (!targetUser || targetUser.success === false) {
        return ("Target user not found");
    }

    
    
    const channelName = dmChannelName(user.id, targetID)

    const channel = await dbQueries.CreateChannel(channelName, `Chat between ${user.username} & ${targetUser.username}`, user, 0)
    console.log(user)
    await dbQueries.AdduserToChannel(channel.id, user.id)
    await dbQueries.AdduserToChannel(channel.id, targetID)

    return channel
}

const  CreateDMOrChannel = async (user, type, targetID = null, channelName= null, channelDiscription = null) => {
  if (type == 0) {

    if (!targetID) {
      return ('error')
    }
  
    const channel = await CreateDM(user, targetID)
    return channel
  } else if (type === 1) {
    if (!channelName) {
      return { success: false, error: "Channel name is required" };
    }
    const channel = await dbQueries.CreateChannel(channelName, channelDiscription, user, 1)
    await dbQueries.AdduserToChannel(channel.id, user.id)
    console.log(channel)
    return channel
  }
}



const SendMessage = async (userID, channelID, content) => {
    if (!userInChannel(userID, channelID))
    {
      return {success: false}
    }

    const message = await dbQueries.addMessageToChannel(userID, channelID, content);

    return {success: true}
}


const CreateUser = async (username, password) => {
    const hashedPassword = await bcrypt.hash(password, 12); 
    const request = await dbQueries.CreateAccount(username, hashedPassword);
    return request;
} 

const GetUserServerList = async (user) => {
  const request = await dbQueries.GetUserServerListQuerry(user);
  return request;
}
const getMemberList = async (channel, user) => {
  // For now, let's skip the user membership check and just get members
  // TODO: Add proper user authentication to check membership
  const request = await dbQueries.GetServerMemberListQuerry(channel);
  return request;
}
const getMessages = async (channel) => {
  // For now, let's skip the user membership check and just get messages
  // TODO: Add proper user authentication to check membership
  const request = await dbQueries.getMessagesFromChannel(channel);
  return request;
}
const addUserToServer = async (user, channel) => {
  const request = await dbQueries.AdduserToChannel(channel, user);
  return request;
}

const addUserToChannel = async (userId, channelId) => {
  const user = await dbQueries.getUserFromID(userId);
  const channel = await dbQueries.getChannelFromID(channelId);
  
  if (!user || user.success === false) {
    return { success: false, error: "User not found" };
  }
  
  if (!channel || channel.success === false) {
    return { success: false, error: "Channel not found" };
  }
  
  const request = await dbQueries.AdduserToChannel(channel.result, user.result);
  return request;
}

const createChannel = async ({ user, type, targetID, channelName, channelDescription }) => {
  return await CreateDMOrChannel(user, type, targetID, channelName, channelDescription);
}

const getUserChannels = async (userId) => {
  const user = await dbQueries.getUserFromID(userId);
  if (!user) {
    return { success: false, error: "User not found" };
  }
  
  // Pass the user object with the correct structure
  return await GetUserServerList(user);
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

  const getchanneltest = await GetUserServerList(user) 
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
  getMessages,
  LoginUser,
  addUserToChannel,
  createChannel,
  getUserChannels
}