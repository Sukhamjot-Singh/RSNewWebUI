'use strict';

let m = require('mithril');

const API_URL = 'http://127.0.0.1:';
let loginKey = {
  username: '',
  passwd: '',
  isVerified: false,
  port: 9092,
};

// Make this as object property?
function setKeys(username, password, port = 9092, verified = true) {
  loginKey.username = username;
  loginKey.passwd = password;
  loginKey.port = port;
  loginKey.isVerified = verified;
}

function rsJsonApiRequest(path, data, callback, async = true, headers = {},
  handleDeserialize, handleSerialize = JSON.stringify) {
  // Retroshare will crash if data is not of object type.
  data = data || {};
  callback = callback || (() => {});
  headers['Accept'] = 'application/json';
  if(loginKey.isVerified) {
    headers['Authorization'] =
      'Basic ' + btoa(loginKey.username + ':' + loginKey.passwd);
  }
  //console.info('Sending request: \nPath: ', path, '\nData: ', data,
  //  '\nHeaders:', headers);
  // NOTE: After upgrading to mithrilv2, options.extract is no longer required
  // since the status will become part of return value and then
  // handleDeserialize can also be simply passed as options.deserialize
  // TODO: Properly handle types of fail situtations
  // Eg. Retroshare switched off, wrong path, incorrect data, etc.
  return m.request({
      method: 'POST',
      url: API_URL + loginKey.port + path,
      async,
      extract: (xhr) => {
        // Empty string is not valid json and fails on parse
        let response = xhr.responseText || '""';
        handleDeserialize = handleDeserialize || JSON.parse;
        return {
          status: xhr.status,
          body: handleDeserialize(response),
        };
      },
      serialize: handleSerialize,
      headers: headers,
      data: data,
    })
    .then((result) => {
      if(result.status === 200) {
        callback(result.body, true);
      } else {
        loginKey.isVerified = false;
        callback(result, false);
      }
    })
    .catch(function(e) {
      callback(e, false);
      console.error('Error: While sending request for path:', path,
        '\ninfo:', e);
    });
}

function setBackgroundTask(task, interval, taskInScope) {
  // Always use bound(.bind) function when accsssing outside objects
  // to avoid loss of scope
  task();
  let taskId = setTimeout(function caller() {
    if(taskInScope()) {
      task();
      taskId = setTimeout(caller, interval);
    } else {
      clearTimeout(taskId);
    }
  }, interval);
  return taskId;
};

module.exports = {
  rsJsonApiRequest,
  setKeys,
  setBackgroundTask,
};

