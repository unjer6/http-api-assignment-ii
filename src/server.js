const http = require('http');
const url = require('url');
const query = require('querystring');
const responseHandler = require('./responses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const urlStruct = {
  GET: {
    '/': responseHandler.getIndex,
    '/style.css': responseHandler.getCSS,
    '/client.js': responseHandler.getJS,

    '/getUsers': responseHandler.getUsers,
    '/notReal': responseHandler.notFound,
  },
  HEAD: {
    '/getUsers': responseHandler.getUsersHead,
    '/notReal': responseHandler.notFoundHead,
  },
  POST: {
    '/addUser': responseHandler.addUser,
  },

  notFound: responseHandler.notFound,
};

const parseBody = (request, response, handler) => {
  const body = [];

  request.on('error', (err) => {
    console.dir(err);
    response.statusCode = 400;
    response.end();
  });

  request.on('data', (chunk) => {
    body.push(chunk);
  });

  request.on('end', () => {
    const bodyString = Buffer.concat(body).toString();
    const bodyParams = query.parse(bodyString);

    console.log(bodyString);

    handler(request, response, bodyParams);
  });
};

const onRequest = (request, response) => {
  console.log(request.url);
  console.log(request.method);

  const parsedUrl = url.parse(request.url);
  const params = query.parse(parsedUrl.query);

  if (urlStruct[request.method] && urlStruct[request.method][parsedUrl.pathname]) {
    if (request.method === 'POST') {
      return parseBody(request, response, urlStruct[request.method][parsedUrl.pathname]);
    }

    return urlStruct[request.method][parsedUrl.pathname](request, response, params);
  }

  return urlStruct.notFound(request, response, params);
};

http.createServer(onRequest).listen(port, () => {
  console.log(`Listening on 127.0.0.1:${port}`);
});
