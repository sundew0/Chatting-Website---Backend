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