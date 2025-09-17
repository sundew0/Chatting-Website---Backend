const CHANNEL_TYPES = {
  DM: 0,
  GROUP: 1
};
/*
Range	Category	Example Codes
1000–1999	- Auth & User 
2000–2999	Messages & Channels	
3000–3999	Requests & Validation	
4000–4999	System/Infra
*/
const ERROR_SEVERITY = {
  MIN: 1,
  LOW: 2,
  NORMAL: 3,
  HIGH: 4,
  SERVER: 5,
}


const ERROR_CODES = {
  // 1000s: Auth & Users
  USER_NOT_FOUND: { code: 1001, message: "User not found.", severity: ERROR_SEVERITY.MIN},
  INVALID_PASSWORD: { code: 1002, message: "Invalid password.", severity: ERROR_SEVERITY.MIN },
  UNAUTHORIZED: { code: 1003, message: "Unauthorized request.", severity: ERROR_SEVERITY.NORMAL },

  // 2000s: Channels & Messages
  CHANNEL_NOT_FOUND: { code: 2001, message: "Channel not found.", severity: ERROR_SEVERITY.MIN },
  NO_MESSAGES_FOUND: { code: 2002, message: "No messages in this channel.", severity: ERROR_SEVERITY.MIN },
  CHANNEL_ALEADYY_EXISTS: { code: 2003, message: "Channel already exists.", severity: ERROR_SEVERITY.MIN },
  USER_ALREADY_IN_CHANNEL: { code: 2004, message: "User already in channel.", severity: ERROR_SEVERITY.MIN },

  // 3000s: Validation
  BAD_REQUEST: { code: 3001, message: "Bad request.", severity: ERROR_SEVERITY.NORMAL },
  INVALID_PARAMETER: { code: 3002, message: "Invalid parameter.", severity: ERROR_SEVERITY.NORMAL },

  // 4000s: System
  DB_QUERY_FAILED: { code: 4001, message: "Database query failed.", severity: ERROR_SEVERITY.HIGH },
  CACHE_ERROR: { code: 4002, message: "Cache error.", severity: ERROR_SEVERITY.HIGH },
  UNKNOWN_ERROR: { code: 4003, message: "Unknown error occurred.", severity: ERROR_SEVERITY.SERVER },
};



module.exports = {
  CHANNEL_TYPES,
  ERROR_CODES,
  ERROR_SEVERITY
}