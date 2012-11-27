/**
 * Browser adapter for js-l10n.
 * (C) 2012 Andrew Baxter <andy@highfellow.org>
 *
 * Repository: https://github.com/highfellow/js-l10n-browser
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 *
 */


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
        var ret;

        function findTag(html, allTags) {
          // returns the index of the next tag in html
          var index;
          if (allTags) {
            return html.indexOf('<');
          } else {
            index = html.indexOf('data-l10n');
            return index === -1 ? index : html.lastIndexOf('<', index);
          }
        }

        function parse(html, l10nArgs, allTags, depth) {
          // parse the html in html, looking only for l10n tags if allTags is false.
          // the results are added to result.
          var index, match, token, name, contents, result, endTag, l10nGet, ret;
          if (depth > 10) throw new Error("max depth exceeded");
          result = ""; endTag = "";
          while ((index = findTag(html, allTags)) !== -1) {
            match = html.slice(index).match(anytag);
            result += html.slice(0, index);
            html = html.slice(index + match[0].length);
            if (match[0].substring(1,2) === '/') {
              // it's an end tag so return to previous level.
              endTag = match[0];
              break;
            }
            name = match[1];
            if (match[0].indexOf('data-l10n') !== -1) {
              // it's an l10n tag so localise it
              match = match[0].match(l10ntag);
              token = match[2];
              // call self recursively.
              contents = parse(html, l10nArgs, true, depth + 1);
              l10nArgs = contents.l10nArgs;
              l10nGet = match[0] + l10n.get(token, l10nArgs, contents.result) + contents.endTag;
              result += l10nGet;
              l10nArgs[token] = l10nGet;
              html = contents.html;
            } else {
              // it's a normal tag.
              // call self recursively.
              contents = parse(html, l10nArgs, true, depth + 1);
              l10nArgs = contents.l10nArgs;
              result += match[0] + contents.result + contents.endTag;
              html = contents.html;
            }
          }
          ret = {
            'html': html,
            'result': result,
            'l10nArgs': l10nArgs,
            'endTag': endTag
          }
          return ret;
        }
        
        ret = parse(html, options, false, 0);
        return ret.result + ret.html;
      }

      function getLoader(options) {
        var baseURL;
        if (typeof(options) === 'object' && typeof(options.baseURL) === 'string') {
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
            if (xhr.readyState === 4) {
              if (xhr.status === 200 || xhr.status === 0) {
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
