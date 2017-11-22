/*
 *  This application is intended to consume a CSV, convert that to an array, then make API calls to Tradeshift's DD backend.
 *	If calls fail, we will generate a timestamped CSV which can be run again separately.
 *
 *	The intent is to create onboardings for DD suppliers in a fast way which we can't do from the application. There it is
 * 	one by one.
 *
 * 	The command line arguments go as such 1) csv file to pase, 2) session ID, 3) csrf token
 */

const fs = require('fs');
const axios = require('axios');
const csv = require('csvtojson');
const uuidv4 = require('uuid/v4');

 
var InviteProcess = {
	csrf:'',
	sessid:'',
	testmode: true
};

InviteProcess.sendInviteRequest =function (dataObj, callback) { 
	
			var targetUrl = (testmode) ?
				'http://localhost:9991?onboardingId=' + dataObj.onboardingId
				:
				'https://sandbox.tradeshift.com/appRuntime/proxy/actions/manager/createandinvite?onboardingId=' + dataObj.onboardingId;

				var requestConfig = {
						headers: {
								'host': 'sandbox.tradeshift.com',
								'User-Agent': 'DDMagicScript/1.0',
								'Content-Type': 'application/json',
							 'Accept': 'text/plain',
        'accept-language': 'en-GB,en-US;q=0.8,en;q=0.5,da;q=0.3',
								'X-Tradeshift-Remote-Component-ID': 'TradeshiftDD.DDManager.Main 1.0.0-848876f682f9f0ad966083b445c32907',
								'X-Tradeshift-Remote-HTTP-Method': 'post', 
								'X-Tradeshift-Remote-Service-Key': 'provider', 
								'X-Requested-With': 'XMLHttpRequest', 
								'Referer': 'https://sandbox.tradeshift.com/ts3/frame/1095761275', 
								'Cookie': 'TSAPPID=90769707; test=1; csrfToken=' + dataObj.Csrf + '; JSESSIONID=' + dataObj.SessionId + ';', 
								'DNT': '1', 
								'Connection': 'keep-alive' 
						}
				};
				
				if (!dataObj.deleted) {
						dataObj.deleted = 'false';
				}
				if (!dataObj.status) {
						dataObj.status = "DRAFT";
				}
				if (!dataObj.fromEmail) {
						dataObj.fromEmail = 'no-reply';
				}
				if (!dataObj.skipContractReview) {
						dataObj.skipContractReview = 'false';
				}
				if (!dataObj.programIds) {
						dataObj.programIds = [];
				}
				if (dataObj.ProgramId) {
						dataObj.programIds = [ dataObj.ProgramId ];
				}
				if (!dataObj.properties) {
					dataObj.properties = {};
				}

				dataObj.supplierCompanyAccountId = dataObj.SupplierUUID;

				delete dataObj.id;
				delete dataObj.Csrf;
				delete dataObj.SessionId;
				delete dataObj.onboardingId;
				delete dataObj.ProgramId;
	   delete dataObj.SupplierUUID;

	axios.post(targetUrl, dataObj, requestConfig)
		.then(function (response) { 
					//console.log(response);
					callback(response);
		})
		.catch((error) => {
			 console.log(error);
				done();
		});
	
}

InviteProcess.onRequestSuccess = function(data, err) { 
	   if(err){
					   console.log('ERROR!');
				}else{
					   console.log('SUCCESS');
				}
}

InviteProcess.createRequestFromRow = function(rowObj,csrf,sessid) { 
				console.log('createRequestFromRow - Process rowObj');

	/*
		for(var key in rowObj){
			console.log(key + ' : ' + rowObj[key]);
		}
	*/


				if (rowObj.SupplierUUID) {
								console.log('send request...');
								rowObj.onboardingId = uuidv4();
								rowObj.Csrf = this.csrf;
								rowObj.SessionId = this.sessid;
								this.sendInviteRequest(rowObj, this.onRequestSuccess)
				}
}

InviteProcess.loadAndRunCSVLoop = function(csvpath,csrf,sessid) { 
			this.csrf = csrf;
			this.sessid = sessid;
	  console.log('loadAndRunCSVLoop - Process file: ' + csvpath);
							if (csvpath.includes('csv')) {
								  console.log('Read csv: ' + csvpath);
											dataToParse = fs.readFile(`./${csvpath}`, 'utf-8', (err, data) => {
												  if (err) {
															console.log(err);	
														}
												else
														csv({ flatKeys: true })
																	.fromString(data)
																	.on('json', (rowObj) => {
																		this.createRequestFromRow(rowObj);
																	})
																	.on('done', () => { });
											 });
								}

}


InviteProcess.runBulkInvites = function() { 

				console.log('Begin sending bulk invitation requests to server.');
				console.log('Csrf: ' + process.argv[3]);
				console.log('session: ' + process.argv[4]);
							
				if (!process.argv[2] || !process.argv[3] || !process.argv[4]) {
				
					console.log('Usage: node index [fileName].csv Csrf SessionId');
					
				} else {

					console.log('Load and parse ' + process.argv[2]);
					
					 this.loadAndRunCSVLoop(process.argv[2], process.argv[3], process.argv[4]);
				}
}

InviteProcess.runBulkInvites();
