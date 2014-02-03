buddycloud bubbles: buddycloud sorts the most interesting information for you
-----------------------------------------------------------------------------

Bubbling is unique to buddycloud and defines which events cause a user
or channel to float upwards to the top of the channel list. Users subscribe 
to hundreds of channels. We want to **show the user the most important information with the least
amount of scrolling**. 

Channels bubble up according to the following sorting:

(Never sorted by post counts)

-   the owner's channel should be pinned to the top of the channel list
    (and scroll with all channels)
-   1st: channels with unread @mentions - sorted from newest to oldest (where am I mentioned?)
-   2nd: channels with unread private messages - sorted from newest to oldest (did someone try to contact me?)
-   3th: channels with unread channel posts - most recent posts to oldest (show new new posts higher up the list)
-   4th: sorted from most recent posts to oldest
-   5th: tie breaker - compare alphabetically (for example a new user with pre-defined channels)

```
sort(channelA, channelB):
  if (channelA.hasMentions and !channelB.hasMentions):
    return 1
  if (!channelA.hasMentions and channelB.hasMentions):
    return -1
  if (channelA.hasMentions and channelB.hasMentions):
    return channelA.lastPost - channelB.lastPost
    
  if (channelA.hasPrivate and !channelB.hasPrivate):
    return 1
  if (!channelA.hasPrivate and channelB.hasPrivate):
    return -1
  if (channelA.hasPrivate and channelB.hasPrivate):
    return channelA.lastPost - channelB.lastPost
    
  if (channelA.hasPost and !channelB.hasPost):
    return 1
  if (!channelA.hasPost and channelB.hasPost):
    return -1
  if (channelA.hasPost and channelB.hasPost):
    return channelA.lastPost - channelB.lastPost
    
  if (channelA.lastPost != channelB.lastPost):
    return channelA.lastPost - channelB.lastPost
  
  return channelA.name - channelB.name
    
```

So for example our hypothetical user might have their list of channels
in the following order:

-   name@domain.com (top becasue they are name@domain.com)
-   coffee@domain.com (mentioned in a post - they really know their
    coffee (or code))
-   java@domain.com (also mentioned here)
-   barristas@domain.com (users replied to name@domain.com's posting)
-   mom@family.com (a private message from mom)
-   dad@family.com (a private messgae from dad that was sent before mom
    sent hers)
-   team@work.com (a very new channel post)
-   swimgroup@sports.com (an older channel post)
-   news-updats@bbc.co.uk (nothing unread, but most recently accessed)
-   boring-channel@boring-domain.com (nothing unread, but also not read
    for a long time)
-   even-more-boring@boring-domain.com (not read for even longer than
    boring-channel@boring-domain.com)
