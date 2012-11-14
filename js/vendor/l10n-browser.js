/**
 * Browser adapter for js-l10n.
 * (C) 2012 Andrew Baxter <andy@highfellow.org>
 **/

define(['l10n'],
    function(l10n) {
      function localiseHTML(html, options) {
        // localise the HTML fragment in html, by looking for data-l10n-token attributes and replacing the tag's contents with the looked up string.
        // options is an object with l10n.get options.
        var emptytags = [
          'area',
          'base',
          'basefont',
          'br',
          'col',
          'frame',
          'hr',
          'img',
          'input',
          'isindex',
          'link',
          'meta',
          'param',
        ];

        var l10ntag = /<([-A-Za-z0-9_]+) [^>]*?data-l10n=['"]([-A-Za-z0-9_]+)['"][^>]*?>/;
        var anytag = /<\/?([-A-Za-z0-9_]+)[^>]*>/;
        var match, name, token, starttag, tag, depth, contents, result='', index = 0;
        console.log('parsing template');
        while ((index = html.search(l10ntag)) != -1) {
          // find an l10n tag.
          match = html.match(l10ntag);
          console.log(match);
          result += html.slice(0, index);
          starttag = match[0];
          name = match[1];
          token = match[2];
          html = html.slice(index + match[0].length);
          // now look for the end of the tag.
          depth = 0;
          contents = '';
          while ((index = html.search(anytag)) != -1) {
            match = html.match(anytag);
            console.log(match);
            contents += html.slice(0, index);
            tag = match[0];
            name = match[1];
            html = html.slice(index + match[0].length);
            if (match[0].substring(1,2) == '/') {
              // an end tag
              if (depth == 0) {
                break;
              } else {
                depth--;
              }
            } else {
              // a start tag
              // this is only to handle the case where the fallback string contains html.
              // e.g. a span element.
              if (emptytags.indexOf(name) == -1) {
                depth++;
              }
            }
            contents += match[2];
          }
          result += starttag + l10n.get(token, options, contents) + tag;
        }
        result += html;
        return result;
      };

      function getLoader(options) {
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
      return {
        // an object which l10n.js can use to get the resource loader.
        // options.baseURL is optionally a non-standard base URL to use when retrieving resources from relative paths.
        'getLoader': getLoader,
        'localiseHTML': localiseHTML
      }
    })
