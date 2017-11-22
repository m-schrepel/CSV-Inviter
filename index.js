/*
 *  This application is intended to consume a CSV, convert that to an array,
 *  then make API calls to Tradeshift's DD backend.
 *  If calls fail, we will generate a timestamped CSV which can be run again separately.
 *
 *  The intent is to create onboardings for DD suppliers in a fast way
 *  which we can't do from the application.
 *
 *  The command line arguments go as such 1) csv file to pase, 2) session ID, 3) csrf token
 */

const fs = require('fs');
const axios = require('axios');
const Papa = require('papaparse');
const uuidv4 = require('uuid/v4');

// Arguments should be in order index.js, *.csv, JSESSIONID, CSRF
function getCommandLineArguments() {
  return new Promise((resolve, reject) => {
    if (!process.argv[2] || !process.argv[3] || !process.argv[4]) {
      console.log('Usage: node index [fileName].csv Csrf SessionId');
      return reject(new Error('The terminal input should look like: node index {fileName}.csv {SessionID} {CSRF token}'));
    }
    console.log(`Loading file ${process.argv[2]} with sessionId: ${process.argv[3]} and csrf token: ${process.argv[4]}`);
    return resolve({
      csv: process.argv[2],
      sessionid: process.argv[3],
      csrf: process.argv[4],
    });
  });
}

// CSV should be in the same directory as the index file
function parseCSV(args) {
  return new Promise((resolve, reject) => {
    const fileToRead = fs.readFileSync(`./${args.csv}`, 'utf-8');
    if (fileToRead.includes('Error')) {
      return reject(new Error(`The CSV couldn't be read for some reason: ${fileToRead}`));
    }
    // File read properly, now we parse it
    const parsedCSV = Papa.parse(fileToRead, { header: true, skipEmptyLines: true });
    if (parsedCSV.errors.length === 0) {
      return resolve(parsedCSV.data);
    }
    return reject(new Error(parsedCSV.errors.join(' ')));
  });
}

// Step 1) Get command line arguments.
getCommandLineArguments()
  .then(args => parseCSV(args))
  // Step 2) Parse CSV.
  .then(csv => console.log('csv', csv))
  .catch(e => console.error(e.message));

// const InviteProcess = {
//   csrf: '',
//   sessid: '',
//   testmode: false,
// };

// InviteProcess.sendInviteRequest = (dataObj, callback) => {
//   const sendData = Object.assign({}, dataObj);
//   const targetUrl = (InviteProcess.testmode) ?
//     `http://localhost:9991?onboardingId=${dataObj.onboardingId}`
//     :
//     `https://sandbox.tradeshift.com/appRuntime/proxy/actions/manager/createandinvite?onboardingId=${dataObj.onboardingId}`;

//   const requestConfig = {
//     headers: {
//       host: 'sandbox.tradeshift.com',
//       'User-Agent': 'DDMagicScript/1.0',
//       'Content-Type': 'application/json',
//       Accept: 'text/plain',
//       'accept-language': 'en-GB,en-US;q=0.8,en;q=0.5,da;q=0.3',
//       'X-Tradeshift-Remote-Component-ID': 'TradeshiftDD.DDManager.Main 1.0.0-848876f682f9f0ad966083b445c32907',
//       'X-Tradeshift-Remote-HTTP-Method': 'post',
//       'X-Tradeshift-Remote-Service-Key': 'provider',
//       'X-Requested-With': 'XMLHttpRequest',
//       Referer: 'https://sandbox.tradeshift.com/ts3/frame/1095761275',
//       Cookie: `TSAPPID=90769707; test=1; csrfToken=${dataObj.Csrf}; JSESSIONID=${dataObj.SessionId};`,
//       DNT: '1',
//       Connection: 'keep-alive',
//     },
//   };

//   if (!sendData.deleted) {
//     sendData.deleted = 'false';
//   }
//   if (!sendData.status) {
//     sendData.status = 'DRAFT';
//   }
//   if (!sendData.fromEmail) {
//     sendData.fromEmail = 'no-reply';
//   }
//   if (!sendData.skipContractReview) {
//     sendData.skipContractReview = 'false';
//   }
//   if (!sendData.programIds) {
//     sendData.programIds = [];
//   }
//   if (sendData.ProgramId) {
//     sendData.programIds = [sendData.ProgramId];
//   }
//   if (!sendData.properties) {
//     sendData.properties = {};
//   }

//   sendData.supplierCompanyAccountId = sendData.SupplierUUID;

//   delete sendData.id;
//   delete sendData.Csrf;
//   delete sendData.SessionId;
//   delete sendData.onboardingId;
//   delete sendData.ProgramId;
//   delete sendData.SupplierUUID;

//   axios.post(targetUrl, sendData, requestConfig)
//     .then((response) => {
//       // console.log(response);
//       callback(response);
//     })
//     .catch((error) => {
//       callback(null, error);
//     });
// };

// InviteProcess.onRequestSuccess = (data, err) => {
//   if (err) {
//     console.log('ERROR!');
//   } else {
//     console.log('SUCCESS');
//   }
// };

// InviteProcess.createRequestFromRow = (rowObj, csrf, sessid) => {
//   console.log('createRequestFromRow - Process rowObj');
//   const objCopy = Object.assign({}, rowObj);


//   if (rowObj.SupplierUUID) {
//     console.log('send request...');
//     objCopy.onboardingId = uuidv4();
//     objCopy.Csrf = this.csrf;
//     objCopy.SessionId = this.sessid;
//     this.sendInviteRequest(objCopy, this.onRequestSuccess);
//   }
// };

// InviteProcess.loadAndRunCSVLoop = (csvpath, csrf, sessid) => {
//   this.csrf = csrf;
//   this.sessid = sessid;
//   console.log(`loadAndRunCSVLoop - Process file: ${csvpath}`);
//   if (csvpath.includes('csv')) {
//     console.log(`Read csv: ${csvpath}`);
//     fs.readFile(`./${csvpath}`, 'utf-8', (err, data) => {
//       if (err) {
//         console.log(err);
//       } else {
//         const parsedData = Papa.parse(data, { header: true });
//         console.log(parsedData);
//       }
//     });
//   }
// };


// InviteProcess.runBulkInvites = () => {
//   console.log('Begin sending bulk invitation requests to server.');
//   console.log(`Csrf: ${process.argv[3]}`);
//   console.log(`session: ${process.argv[4]}`);

//   if (!process.argv[2] || !process.argv[3] || !process.argv[4]) {
//     console.log('Usage: node index [fileName].csv Csrf SessionId');
//   } else {
//     console.log(`Load and parse ${process.argv[2]}`);

//     this.loadAndRunCSVLoop(process.argv[2], process.argv[3], process.argv[4]);
//   }
// };

// InviteProcess.runBulkInvites();
