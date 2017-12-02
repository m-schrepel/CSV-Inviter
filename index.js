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
const Promise = require('bluebird');

// Arguments should be in order index.js, *.csv, JsessionId, CSRF
function getCommandLineArguments() {
  return new Promise((resolve, reject) => {
    if (!process.argv[2] || !process.argv[3] || !process.argv[4]) {
      console.log('Usage: node index [fileName].csv Csrf sessionId');
      return reject(new Error('The terminal input should look like: node index {fileName}.csv {sessionId} {CSRF token}'));
    }
    console.log(`Loading file ${process.argv[2]} with sessionId: ${process.argv[3]} and csrf token: ${process.argv[4]}`);
    return resolve({
      csv: process.argv[2],
      sessionId: process.argv[3],
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
      return resolve({ parsedCSV: parsedCSV.data, args });
    }
    // For some reason Papa parse failed, so return those errors (always in an array)
    return reject(new Error(parsedCSV.errors.join(' ')));
  });
}

function createRequests(postParseObject) {
  // parsedCSV is our data object to map into promises
  const { parsedCSV, args } = postParseObject;

  // Grab the sessionID and csrf tokens individually
  const { sessionId, csrf } = args;

  // This defines our endpoint with a generated UUID
  const URL =
    `https://sandbox.tradeshift.com/appRuntime/proxy/actions/manager/createandinvite?onboardingId=${uuidv4()}`;

  // This is setup for our request
  const requestConfig = {
    headers: {
      host: 'sandbox.tradeshift.com',
      'User-Agent': 'DDMagicScript/1.0',
      'Content-Type': 'application/json',
      Accept: 'text/plain',
      'accept-language': 'en-GB,en-US;q=0.8,en;q=0.5,da;q=0.3',
      'X-Tradeshift-Remote-Component-ID': 'TradeshiftDD.DDManager.Main 1.0.0-848876f682f9f0ad966083b445c32907',
      'X-Tradeshift-Remote-HTTP-Method': 'post',
      'X-Tradeshift-Remote-Service-Key': 'provider',
      'X-Requested-With': 'XMLHttpRequest',
      Referer: 'https://sandbox.tradeshift.com/ts3/frame/1095761275',
      Cookie: `TSAPPID=73715787; test=1; csrfToken=${csrf}; JsessionId=${sessionId};`,
      DNT: '1',
      Connection: 'keep-alive',
    },
    method: 'post',
    url: URL,
    data: {
      supplierEmail: '',
      // fundingRate: '22',
      // settlementPeriod: '45',
      deleted: 'false',
      status: 'DRAFT',
      fromEmail: 'no-reply',
      skipContractReview: 'false',
      // programIds: [
      // '23177f19-0ac8-4e66-b24c-5ce0e61f0eb1',
      // ],
      properties: {},
      // supplierCompanyAccountId: 'cadea80b-2ace-5a97-82ff-4d03416ed854',
    },
  };

  // Map over the CSV data to turn each object into an unresolved promise
  const requestPromises = parsedCSV.map((data) => {
    // For easier debugging we'll just keep this object as a loggable thing
    const updatedConfigObject = Object.assign({}, requestConfig, {
      data: Object.assign({}, requestConfig.data, {
        supplierEmail: data.supplierEmail,
        fundingRate: data.fundingRate,
        settlementPeriod: data.settlementPeriod,
        programIds: [data.ProgramId],
        supplierCompanyAccountId: data.SupplierUUID,
      }),
    });
    return updatedConfigObject;
  });

  return Promise.map(requestPromises, obj => axios(obj).then(s => s).catch(e => e));
}

function reportSuccessAndCreateCSV(responseArray) {
  const failed = [];
  const succeeded = [];

  responseArray.forEach((response) => {
    if (response.status === 200) {
      succeeded.push(response.statusText);
    } else if (response.constructor === Error) {
      failed.push(JSON.parse(response.config.data));
    }
  });

  const reWriteObject = failed.map(fail => ({
    SupplierUUID: fail.supplierCompanyAccountId,
    supplierEmail: fail.supplierEmail,
    ProgramId: fail.programIds[0],
    fundingRate: fail.fundingRate,
    settlementPeriod: fail.settlementPeriod,
  }));

  return new Promise((resolve, reject) => {
    const fileDateString = `${new Date().toISOString()}`;
    let resolveString = '';
    if (failed.length > 0 && succeeded.length > 0) {
      resolveString += `
        ${succeeded.length} onboarding requests succeded!
        ${failed.length} onboarding requests failed :(

      `;
    }
    if (failed.length > 0) {
      fs.writeFile(`./${fileDateString}-failed.csv`, Papa.unparse(reWriteObject), (err) => {
        if (err) {
          return reject(new Error(`There was an error creating the file of failed requests. Logging them out for copy and paste:
          ${JSON.stringify(reWriteObject, null, 2)}`));
        }
      });
      resolveString += `${failed.length} onboarding creation requests failed so we wrote file with name: ${fileDateString}-failed.csv`;
    }
    if (failed.length === 0) {
      resolveString += `Nothing failed, ${succeeded.length} succeded! It's a miracle!`;
    }
    return resolve(resolveString);
  });
}

// Step 1) Get command line arguments.
getCommandLineArguments()
  .then(args => args)
  // Step 2) Parse CSV.
  .then(args => parseCSV(args))
  // Step 3) Create and resolve requests (Make the network calls)
  .then(postParseObject => createRequests(postParseObject))
  // Step 4) Capture errors and create CSV with failures
  .then(responseArray => reportSuccessAndCreateCSV(responseArray))
  .then(response => console.info('response', response))
  .catch(e => console.error(e.message));

