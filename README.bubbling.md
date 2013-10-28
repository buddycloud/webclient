buddycloud bubbles
------------------

bubbling is unique to buddycloud and defines which events cause a user
or channel to float upwards to the top of the channel list. Some users
subscribe to hundreds of channels. To make it easier to Channels should
initially be sorted on activity so that a channel post causes that
channel to "bubble" upwards and become visible to the user. How far up a
channel bubbles is defined in the sorting. The following events should
cause an entry to bubble up

-   place change
-   next place setting
-   status update
-   posting into a channel
    -   private message
    -   @reply post (your name mentioned in a channel)
    -   channel post

buddycloud sorts the most interesting information for you
---------------------------------------------------------

We want to **show the user the most important information with the least
amount of scrolling**. When a channel bubbles up it stops rising upwards
at a certain point:

sort by recent posts (newer messages are more important than message
count)

-   the owner's channel should be pinned to the top of the channel list
    (and scroll with all channels)
-   1st: channels with unread user@mentions (where am I mentioned?)
-   2nd: channels with unread replies (replies to my posts)
-   3rd: channels with unread private messages (did someone try to contact me?)
-   4th: channels with unread channel posts (users check back regularly for new posts - make this easy)
-   5th: activity (which channels did you most recently read/who did you message most recently?) eg: if you read a channel, it drops down to the bottom of the list of unread channels.

Note: an account that was read and no longer has unread posts, @replies
or personal messages stays in the previous list order until the user
reads a new channel at which point it silently drops down when you click
on a new channel.

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

