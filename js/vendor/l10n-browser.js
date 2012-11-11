/**
 * Browser adapter for js-l10n.
 * (C) 2012 Andrew Baxter <andy@highfellow.org>
 **/

var l10n_browser = {
  // a class which l10n can use to get the resource loader.
  // baseURL is optionally a non-standard base URL to use when retrieving resources from relative paths.
  getLoader: function(options) {
    var baseURL;
    if (typeof(options) == 'object' && typeof(options.baseURL) == 'string') {
      baseURL = options.baseURL;
    } else {
      baseURL = ''; // base URL defaults to the current document path.
    }
    return(function(path, success, failure, async) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', baseURL + path, async);
      if (xhr.overrideMimeType) {
        xhr.overrideMimeType('text/plain; charset=utf-8');
      }
      xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
          if (xhr.status == 200 || xhr.status === 0) {
            if (success)
              success(xhr.responseText);
          } else {
              if (failure)
                failure();
          }
        }
      };
      xhr.send(null);
    });
  }
}

define([], // no required modules.
    function() {
      return l10n_browser;
    })
