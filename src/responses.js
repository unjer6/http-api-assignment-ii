const fs = require('fs');

const index = fs.readFileSync(`${__dirname}/../hosted/client.html`);
const style = fs.readFileSync(`${__dirname}/../hosted/style.css`);
const js = fs.readFileSync(`${__dirname}/../hosted/client.js`);

const users = {};

// Helpers

const createErrorJSON = (message, id) => {
  let json = `{"message": "${message}"`;

  if (id) { json += `,"id":"${id}"`; }

  json += '}';

  return json;
};

const getData = (request, response, code, type, data) => {
  response.writeHead(code, { 'Content-Type': type });
  response.write(data);
  response.end();
};

const getHead = (request, response, code, type) => {
  response.writeHead(code, { 'Content-Type': type });
  response.end();
};

// Get handlers

const getIndex = (request, response) => {
  getData(request, response, 200, 'text/html', index);
};

const getCSS = (request, response) => {
  getData(request, response, 200, 'text/css', style);
};

const getJS = (request, response) => {
  getData(request, response, 200, 'application/javascript', js);
};

const getUsers = (request, response) => {
  const data = { users };
  getData(request, response, 200, 'application/json', JSON.stringify(data));
};

const notFound = (request, response) => {
  const data = createErrorJSON('The page you are looking for was not found.', 'notFound');
  getData(request, response, 404, 'application/json', data);
};

// Head handlers

const getUsersHead = (request, response) => {
  getHead(request, response, 200, 'application/json');
};

const notFoundHead = (request, response) => {
  getHead(request, response, 404, 'application/json');
};

// Post handlers

const addUser = (request, response, params) => {
  if (!params.name || !params.age) {
    const data = {
      id: 'addUserMissingParams',
      message: 'Name and age are both required.',
    };
    return getData(request, response, 400, 'application/json', JSON.stringify(data));
  }

  let statusCode = 204;

  if (!users[params.name]) {
    statusCode = 201;
    users[params.name] = {};
  }

  users[params.name].name = params.name;
  users[params.name].age = params.age;

  if (statusCode === 201) {
    const data = {
      message: 'Created Successfully',
    };
    return getData(request, response, statusCode, 'application/json', JSON.stringify(data));
  }

  return getHead(request, response, statusCode, 'application/json');
};

module.exports = {
  getIndex,
  getCSS,
  getJS,
  getUsers,
  notFound,

  getUsersHead,
  notFoundHead,

  addUser,
};
