/*
 * API test code - uses jquery ajax() call to test the connection to the
 * http api server.
 */

requirejs.config({
    baseUrl: '../js/vendor',
  paths: {
        'config': '../../config',
    'templates': '../../templates',
    'models': '../app/models',
    'Router': '../app/Router',
    'util': '../app/util',
    'views': '../app/views'
    },

});

requirejs(['jquery', 'config'], 
    function($, config) {
      var pathOK = function(url) {
        return function(data, textStatus, jqXHR) {
          console.log("Url: " + url + " OK - " + textStatus);
          console.log("data: ", data, " jqXHR: ", jqXHR);
        }
      }

      var pathErr = function(url) {
        return function(jqXHR, textStatus, errorThrown) {
          console.log("Url: " + url + " ERR - " + textStatus + ", " + errorThrown);
          console.log(" jqXHR: ", jqXHR);
        }
      }

      var testPath = function(path, username, password) {
        // test a given api path.
        url = config.baseUrl + "/" + path;
        var settings = {
          'url': url,
          'success': pathOK(url),
          'error': pathErr(url),
          'username' : username,
          'password' : password,
          'dataType' : 'json'
        }
        $.ajax(settings);
      }

      runTest = function() {
        var username = $('#username').val();
        if (username && username.indexOf('@') == -1) {
                username += '@' + config.homeDomain;
        }
        var password = $('#password').val();
        console.log("Username: " + username + ", password: " + password);
        testPath('subscribed', username, password);
      }

    })
