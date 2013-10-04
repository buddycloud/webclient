This is the software guide for localisation. For helping with
translating buddycloud, please see the [Translate
buddycloud](Translate buddycloud "wikilink") page.

Aim
---

-   get as many users using buddycloud as possible.
-   support continuous updates of the translation files
-   provide good guidance on how to translate buddycloud strings
-   keep all localisation client side (server sends error messages that
    the client can then present the localised version of)

Process
-------

-   new strings are added to a master json file
-   translation team is notified of updated strings
-   translation happens (untranslated strings stay as English)
-   the build process pulls in reviewed translations.

Resources
---------

-   Diaspora has good documentation on how this works:
    <https://github.com/diaspora/diaspora/wiki/How-to-contribute-translations>
-   <http://blog.webtranslateit.com/post/14607630107>
-   Javascript and processing gettext into whatever:
    [http://24ways.org/2007/javascript-internationalisation\#c001522](http://24ways.org/2007/javascript-internationalisation#c001522)
-   Javascript gettext library:
    <http://jsgettext.berlios.de/doc/html/Gettext.html>
-   Nodejs version of the above library:
    <https://github.com/DanielBaulig/node-gettext>
-   The main gettext page:
    [http://www.gnu.org/software/gettext/manual/html\_node/gettext.html\#gettext](http://www.gnu.org/software/gettext/manual/html_node/gettext.html#gettext)
-   Bidirectional languages tutorial:
    [http://www.w3.org/International/tutorials/bidi-xhtml/\#Slide0250](http://www.w3.org/International/tutorials/bidi-xhtml/#Slide0250)
-   <https://github.com/fabi1cazenave/webL10n>
-   Guidelines for writing localisable web apps:
    <https://developer.mozilla.org/en-US/docs/Web_Localizability/Creating_localizable_web_applications>

Background
----------

Initially, I was planning to use a gettext based library for
localisation; however I've since found
[webL10n](https://github.com/fabi1cazenave/webL10n), which is a more
modern library, and better suited to javascript in the browser. It has
good handling of plural forms, which is a problem for some l10n
libraries, and the reason I was planning to use gettext.

Also, the web client has now been rewritten to use the HTTP API, which
changes some of my earlier thinking.

In principle, it would be possible to use WebL10n as it is to do a lot
of the localisation. However, having tried using this library in a
couple of demos, I've come to think that although the core localisation
code is pretty sound, we probably don't need the higher level code which
localises strings after they have been inserted into the DOM, based on
html attributes. It seems better, and most likely faster, to localise
the strings before they get to the DOM.

So, what I've been working on is a cut down version of webL10n which
just includes the core localisation functions (resource loading and
string substitution), but not the higher level bits. It's also written
as a module for requirejs, which makes it easy to integrate with the new
web client.

There is a [core module](https://github.com/highfellow/js-l10n), which
is platform-independent, and various adapters which make it work on
different javascript platforms (e.g. browser / node etc.). The [browser
adapter](https://github.com/highfellow/js-l10n-browser) also includes a
utility function which makes it easy to localise strings in html based
templates, like those used by underscorejs.

Most of the strings in the webclient are now done, with the exception of
a few special cases that are generated in code.

API
---

### Loading the libraries

At initialisation, main.js first loads l10n.js and l10n-browser.js:

~~~~ {.javascript}
var l10n = require('l10n');
var l10nBrowser = require('l10n-browser');
~~~~

then gets the language from navigator.language /
navigator.browserLanguage:

~~~~ {.javascript}
if (typeof(navigator.browserLanguage) != 'undefined') {
  // handle IE.
  lang = navigator.browserLanguage;
} else {
  // everyone else
  lang = navigator.language;
}
~~~~

connects the core library with the browser adapter:

~~~~ {.javascript}
l10n.setAdapter(l10nBrowser, {baseURL: '/locales/'});
~~~~

and finally loads the locale file(s), with the rest of the
initialisation set to run as a callback once the locale file(s) have
loaded:

~~~~ {.javascript}
l10n.loadResource('data.properties', lang, 
    initialize, // do this once the locale data has loaded
    function(err) {
      console.log('Failed to load locale data');
    }
    )
~~~~

### Locale files

The locale files are in the java .properties format, which is supported
by webtranslateit.com. The first file which is loaded, data.properties,
contains include statements which pull in any files specific to the
locale set in the browser:

~~~~ {.javascript}
#encoding: UTF-8

[*]
@import url(data.en.properties)

[de]
@import url(data.de.properties)

[fr]
@import url(data.fr.properties)
~~~~

For any language that is set (e.g. 'de-DE'), l10n.js will recognise the
includes for the language variant (e.g. '[de-DE]'), the language (e.g.
'[de]'), and the global include ('[\*]'), but not any others. It's
important to keep the global include at the top, and also generic
languages like '[de]' above their variants like '[de-DE]' in order for
the files to be loaded properly.

The format of the language specific files is like this:

~~~~ {.javascript}
# encoding: UTF-8

# following strings from overlay/welcome.html
welcomeMessage = Share, discover and communicate in a magically simple way.
aboutLink = about
developersLink = developers
loginLink = login
joinLink = join
~~~~

#### Adding locale files from webtranslateit.com

This is what you need to do to manually add new or updated locale files
from webtranslateit.com to the web client.

-   set up the ruby based webtranslateit client (wti) on your working
    machine: <https://github.com/AtelierConvivialite/webtranslateit>
-   fork the buddycloud webclient to another github account.
-   git clone that version somewhere on your working machine.
-   go into 'webclient/locales'.
-   initialise wti with the buddycloud webtranslateit public API key.
    (The config file name 'locales/wti-config.wti is in .gitignore, so
    if you use wti with that as a custom config file, the file won't get
    added to the repository accidentally.)
-   use the wti commands to check translation status and pull down
    updated or new languages.
-   if it's a new language, edit the master locale file to add an
    include for the new file(s). (See above).
-   then do a standard 'git add .'; 'git commit'; 'git push origin
    master' to push the changes up to your fork of the web client.
-   finally go to the buddycloud version of the webclient on github and
    create a pull request from the version on your account.

### Localising strings

Before adding any new strings, it would be a good idea to read this
[page](https://developer.mozilla.org/en-US/docs/Web_Localizability/Creating_localizable_web_applications)
from mozilla on localising web apps. It does a nice job of pointing out
common pitfalls and how to avoid them.

The basic string localisation function in js-l10n is:

~~~~ {.javascript}
  l10n.get(token, args, fallback)
~~~~

-   token: a token like 'login-button' which is used to look up the
    string value in the properties file.
-   args: an optional dictionary of argument values to replace in the
    string.
-   fallback: an optional fallback string in case no locale file is
    found.

You can use this in any module which writes to the DOM, just by
require'ing l10n.js, then calling l10n.get as above. See the
[webL10n](https://github.com/fabi1cazenave/webL10n) github page for more
information on the options etc.

#### Strings in templates

Most of the strings in the client are in the template, as the content of
html tags. These can be localised as follows:

For each string, add a 'data-l10n' attribute in the enclosing tag, with
the attribute value equal to the token for the string:

~~~~ {.html5}
<p data-l10n="welcomeMessage">Share, discover and communicate in a magically simple way.</p>
~~~~

For strings which include markup with code content, such as link hrefs,
it's better to keep the code out of the locale files by using a separate
data-l10n attribute in the included markup tag as well as the main
string:

~~~~ {.html5}
<p class="middle" data-l10n="footerMessage">
  buddycloud is <a href="https://github.com/buddycloud/webclient" data-l10n="footerOpenSource">Open Source</a> and built by amazing people from all over the world.
</p>
~~~~

In this case, the main string in the locale file needs to include the
substring's token in {{double braces}}:

~~~~ {.javascript}
footerMessage = buddycloud is {{footerOpenSource}} and built by amazing people from all over the world.
footerOpenSource = Open source
~~~~

The view which loads the template needs to first require l10n-browser:

~~~~ {.javascript}
  var l10nBrowser = require('l10n-browser');
~~~~

then use l10n-browser.localiseHTML in the view's 'initialize' function
to localise the strings in the template:

~~~~ {.javascript}
  this.localTemplate = l10nBrowser.localiseHTML(template, {});
~~~~

This will replace the contents of each tag with the locale string for
that token. If no string is found, it will use the existing tag contents
as a fallback.

then use the localised template in the 'render' function:

~~~~ {.javascript}
  this.$el.html(_.template(this.localTemplate));
~~~~

Strings in html attributes need to be done differently. You require
l10n.js in the view, then add l10n.get under a suitable alias (I've used
'l') when rendering the template:

~~~~ {.javascript}
  this.$el.html(_.template(this.localTemplate, {user: this.options.user, l: l10n.get}));
~~~~

Having done this, you can then use l10n.get (as 'l') in embedded
javascript:

~~~~ {.html5}
<form class="centered span-2">
  <input type="search" name="search" placeholder="<%= l('findChannelsPosts', {}, 'Find channels and posts') %>" class="withButton" autofocus>
  <input type="submit" value="Search" class="search button">
</form>
~~~~

#### Hard-coded strings

A few strings are not in the templates at all, but hard-coded into the
javascript views. These also need to be treated differently. The way
I've done it (e.g. in ChannelDetails.js), is as follows:

Require 'l10n' (in addition to l10n-browser if that's already required).

~~~~ {.javascript}
  var l10n = require('l10n');
~~~~

Make an alias for l10n.get in the module namespace:

~~~~ {.javascript}
  var l = l10n.get;
~~~~

In each place where a viewable string is included in the javascript,
replace it with a call to 'l'. For example:

~~~~ {.javascript}
  this.moderatorsList = new ChannelList({title: 'moderators', role: 'Moderator'});
  this.followersList = new ChannelList({title: 'followers', role: 'Follower'});
  this.similarList = new ChannelList({title: 'similar', role: 'Similar'});
~~~~

becomes

~~~~ {.javascript}
  this.moderatorsList = new ChannelList({title: l('moderatorsList', {}, 'moderators'), role: l('moderatorCaps', {}, 'Moderator')});
  this.followersList = new ChannelList({title: l('followersList', {}, 'followers'), role: l('followerCaps', {}, 'Follower')});
  this.similarList = new ChannelList({title: l('similarList', {}, 'similar'), role: l('similarCaps', {}, 'Similar')});
~~~~

You may need to adapt this example according to the situation.

Contact
-------

If you have any questions about the technical side of localisation,
either post in the localisation channel (channel:
localisation@topics.buddycloud.org), or contact andy@highfellow.org by
email.

Language translation progress
-----------------------------

<https://webtranslateit.com/api/projects/9e8a06a43416f7e6e0eb0a4803559e95afc022f5/charts.png>
