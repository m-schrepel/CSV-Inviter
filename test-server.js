const http = require('http');
var qs = require('querystring');
const port = 9991;

const requestHandler = (request, response) => {

	console.log('Something happened!!');
	console.log('Url');
	console.log(request.url);
	
	console.log('Headers');
	console.log(request.headers);

	response.end('{"success":"true"}');

	var body = '';
	
		request.on('data', function (data) {
						body += data;

						// Too much POST data, kill the connection!
						// 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
						if (body.length > 1e6)
										request.connection.destroy();
		});

		request.on('end', function () {
						var post = qs.parse(body);
						// use post['blah'], etc.
			
	   console.log(post);
			      
		});
}

const server = http.createServer(requestHandler);

server.listen(port, (err) => {
  if (err) {
			return console.log('something bad happened', err);
  }

	console.log(`server is listening on ${port}`);
})
