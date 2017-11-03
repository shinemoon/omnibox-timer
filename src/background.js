/* 
 > To Support More Style of Timer    
 > Author: Claud     
 > Date: Nov 2018    

## Format Like "1h20m" or "20m30s" and etc.
- No space or other characters, just ?h?m?s, and 'h', 'm', 's' can be in any orders, and they must be in Int


## Format Like "20:02 Go Home" 
- Must in 24 hour way
- Can't be equal to or earliery than current time


*/


var timercount = 0;
chrome.browserAction.setBadgeText({text: String(timercount)});



// configurations
var audioList = [
  {
    "name": "ring",
    "src": "alarm.wav"
  }
];
var audios = {};

// Reset timers when Chrome starts
resetTimers();

// Load all Audios
loadAudios();

function parseTime(str) {

  var num = parseFloat(str);
  if (isNaN(num))
    return null;

  var hn =0;
  var mn =0;
  var sn =60;
  var abstime = 0;

  var regExp = /(\d+)h/;
  var matches = regExp.exec(str);
  if(matches!=null)
    hn = parseInt(matches[1]);
    
  regExp = /(\d+)m/;
  matches = regExp.exec(str);
  if(matches!=null)
    mn = parseInt(matches[1]);
 
  regExp = /(\d+)s/;
  matches = regExp.exec(str);
  if(matches!=null)
    sn = parseInt(matches[1]);
 
  regExp = /(\d+):(\d+)/;
  matches = regExp.exec(str);
  console.log(matches);
  if(matches!=null) {
    hn = parseInt(matches[1])%24;
    mn = parseInt(matches[2])%60;
    var totalm = hn*60+mn;
    //to get current time
    var myDate = new Date();
    curh = myDate.getHours();
    curm = myDate.getMinutes();
    var ctotalm = curh*60+curm;
    var deltm = totalm - ctotalm;

    if(deltm<=0) return null;
    // Return direct value 
    return deltm*60;
  }

  var totalseconds;
  totalseconds = hn*3600 + mn*60 + sn;
  return totalseconds;
   
/*
  var last = str.charAt(str.length - 1);
  switch (last) {
  case 'h': mul = 60 * 60; break;
  case 'm': mul = 60; break;
  case 's': mul = 1; break;
  default: mul = 60; break;
  }
  return num * mul;
*/

}

function setupNotification(timer) {
  if (!window.Notification) {
    console.log("Notification is not supported.");
    return;
  }

  var id = timer.id;
  var ms = timer.seconds * 1000;
  var title = 'Timer done!';

  console.log(id + ": setup " + timer.seconds + " seconds from "
              + timer.currentTime);

  var ctimerid = setTimeout(function() {
    var notification = new window.Notification(title, {
      tag: id,
      icon: "256.png",
      body: timer.desc
    });
    notification.addEventListener('click', function(e) {
      if (e && e.target && e.target.close) {
        e.target.close();
      }
      console.log(id + ": closed at " + new Date().toString());
    });
    chrome.storage.local.get({soundType: "tts", soundId: "ring"}, function(object) {
      if (object.soundType == "tts") {
        chrome.tts.speak(timer.desc);
      } else if (object.soundType == "bell") {
        audios[object.soundId].play();
      }
    });
    console.log(id + ": notified at " + new Date().toString());
    timercount=timercount-1;
    chrome.browserAction.setBadgeText({text: String(timercount)});
    // To Update the timer info in local storage
    //Rewrite the timer
    console.log(ctimerid);
        chrome.storage.local.get({timers: []}, function(object) {
            timers = object.timers;
            //Locate the index
            for(var i =0; i< timers.length; i++) {
                console.log(timers[i].tid);
                if(parseInt(timers[i].tid)== ctimerid){
                        timers[i].status="done";
                    }
                }
                chrome.storage.local.set({timers: timers});
        });

  }, ms);
  return ctimerid;
}

function tryToSetupTimer(text) {
  var arr = text.split(/\s+/);
  var seconds = parseTime(arr.shift());
  if (!seconds) {
    console.log("parse error: " + text);
    giveFeedback("err");
    return false;
  }

  if (arr.length > 0) {
    desc = arr.join(" ");
  } else {
    desc = 'Timer done!';
  }

  var timer = {
    currentTime: (new Date()).getTime(),
    desc: desc,
    seconds: seconds
  };

  setupTimer(timer, function(timer) {
    var cid = setupNotification(timer);
    //Timer Id used for delete and cancellation
    timer['tid']= cid;
    timer['status']= "ongoing";
    storeTimer(timer);
    timercount=timercount+1;
    giveFeedback("add")
  });

  return true;
}

function setupTimer(timer, callback) {
  chrome.storage.local.get({idCounter: 0}, function(object) {
    var id = object.idCounter;
    timer.id = id;
    chrome.storage.local.set({idCounter: id+1});

    callback(timer);
  });
}

function storeTimer(timer) {
  chrome.storage.local.get({timers: []}, function(object) {
    timers = object.timers;
    timers.unshift(timer);
    chrome.storage.local.set({timers: timers});
  });
}

function resetTimers() {
  if (chrome && chrome.storage) {
    chrome.storage.local.set({timers: []});
  }
}

function loadAudios() {
  for (var i = 0; i < audioList.length; i++) {
    var item = audioList[i];
    var audio = new Audio();
    audio.src = item.src;
    audio.load();
    audios[item.name] = audio;
    console.log(audio);
  }
}

function giveFeedback(message) {
  chrome.browserAction.setBadgeText({text: message});
  // Modify a bit for using available items in local storage
  setTimeout(function() {
    //chrome.browserAction.setBadgeText({text: ""});
    chrome.browserAction.setBadgeText({text: String(timercount)});
  }, 3000);
}

function timerHistory() {
  // Store history
  var sortedByTime = [];
  var sortedByCount = [];
  var historiesHash = {};

  // Compare histories.
  // Frequently entered one comes later.
  function compareByCount(a, b) {
    if (a["count"] < b["count"]) {
      return -1;
    } else if (a["count"] === b["count"]) {
      return 0;
    } else {
      return 1;
    }
  }

  function findHistories(histories, text) {
    var text = text.trim();
    var founds = [];
    for (var i = histories.length - 1; i >= 0; i--) {
      var history = histories[i];
      if (history["text"].indexOf(text) >= 0) {
        // copy
        founds.push({
          text: history["text"],
          count: history["count"],
          timestamp: history["timestamp"]
        });
      }
    }
    return founds;
  }

  return {
    add: function(text) {
      text = text.trim()
      if (text in historiesHash) {
        var history = historiesHash[text];

        history["count"] += 1;
        history["timestamp"] = new Date().getTime();

        // sort by time: the latest one goes to the end.
        var idx = sortedByTime.indexOf(history);
        sortedByTime.splice(idx, 1);
        sortedByTime.push(history);
      } else {
        var obj = {
          text: text,
          count: 1,
          timestamp: new Date().getTime()
        };
        sortedByCount.push(obj);
        sortedByTime.push(obj);
        historiesHash[text] = obj;
      }

      // sort by count: frequently input one goes to the end.
      sortedByCount.sort(compareByCount);
    },
    findByCount: function(text) {
      return findHistories(sortedByCount, text);
    },
    findByTime: function(text) {
      return findHistories(sortedByTime, text);
    }
  }
}
