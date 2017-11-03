# Omnibox Timer Again

Yet another quick timer tool for Chrome users, based on ***Omnibox Timer***

["Omnibox Timer"](https://chrome.google.com/webstore/detail/iooaeaogjngpihndkcednkblomlkaaif) is so good extension, but with below restriction (Or indeed it's just author's own special flavor... I believe so.)

+ Can't support absolute time for reminder, e.g. `14:00 Call Mom`
+ Can't support combined way of configuration , e.g. `1h20m Go Home`
+ Can't cancel/stop ongoing timers
+ Help info is not so readable for newbie, especially if they don't have habit to read the webstore page 
+ Peronsally I am not so in favor of the page style of option page, icon and font, etc.... but just personally


That's the reason I fork and create the extension: https://github.com/shinemoon/omnibox-timer.git

# How to Use It
1. Focus in the address bar;
2. Type 'ta' and hit space key, then you will see it invokes extension prompt for further input;
3. Use syntax like below example to define the reminders for timer;
    + `[Number]s|m|h [Reminder Description]`(e.g. `10m Have Dinner`) , or
    + `hh:mm [Reminder Description]` (e.g. `20:20 Go Home`)
4. Reminder will pop up by defined time;
5. Options and Timers can be managed via this page.
