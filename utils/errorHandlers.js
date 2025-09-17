const { ERROR_SEVERITY, ERROR_CODES} = require("./constants");

const ErrorHandle = async (error_code, error) => {

    if (error_code.severity === ERROR_SEVERITY.SERVER) {
        // log to external service
        ServerErrorHandler(error_code, error);
    }
    else if (error_code.severity === ERROR_SEVERITY.HIGH) {
        HighErrorHandler(error_code);
    }
    else if (error_code.severity === ERROR_SEVERITY.NORMAL) {
        NormalErrorHandler(error_code);
    }
    else if (error_code.severity === ERROR_SEVERITY.LOW) {
        LowErrorHandler(error_code);
    }
    else if (error_code.severity === ERROR_SEVERITY.MIN) {
        MinErrorHandler(error_code);
    }
} 
const ServerErrorHandler = async (error_code, error) => {
    
    await ntfy(error_code, error);
} 


const HighErrorHandler = async (error_code, error) => {

    await ntfy(error_code, error);

    // additional logging or alerting can be added here
}
const NormalErrorHandler = (err) => {
    console.warn(err);
    // log to file or monitoring service
}
const LowErrorHandler = (err) => {
    console.info(err);
    // log to file
}
const MinErrorHandler = (err) => {
    // possibly ignore or log very lightly
    console.debug(err);
}

const ntfy = async (error_code, error) => {
    const API_URL = "https://ntfy.sundewdev.xyz/chatsite-errors";
    const title = `Error: ${error_code.code}`;
    const message = `${error_code.message}\nDetails: ${error_code.code || 'N/A'} \n\n\n error object: \n ${JSON.stringify(error, null, 2)}`;

    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Title': title,
            'Priority': `${error_code.severity}`,
            'Content-Type': 'text/plain'
        },
        body: message
    });
}

module.exports = { ErrorHandle };

