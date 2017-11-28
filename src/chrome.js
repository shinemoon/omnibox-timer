// Store thistory
var thistory = timerHistory();
resetDefaultSuggestion();

chrome.omnibox.onInputEntered.addListener(function(text){
  console.log(thistory);
  if (text == "options" || text == "show") {
    openOptionsPage();
  } else {
    var result = tryToSetupTimer(text);

    // Store thistory when a timer is set
    if (result) {
      thistory.add(text);
    }
  }
});

function updateDefaultSuggestion(text) {
  if (text.trim() === "") {
    resetDefaultSuggestion();
  } else {

    var arr = text.split(/\s+/);
    var seconds = parseTime(arr.shift());
    if (!seconds) {
      console.log("parse error: " + text);
      giveFeedback("err");
    }

    if (arr.length > 0) {
      desc = arr.join(" ");
    } else {
      desc = 'Timer done!';
    }

    var timer = {
      currentTime: (new Date()).getTime(),
      desc: desc,
      seconds: seconds,
      popup: 0
    };

    var notificationTime = timer.currentTime + timer.seconds * 1000;

    chrome.omnibox.setDefaultSuggestion({
      description: 'Timer set: <match>' + text + '</match> | &lt;time&gt; [&lt;message&gt;] | ' + 'Will alert in ' + moment(notificationTime).calendar()
    });
  }
}

function resetDefaultSuggestion() {
  chrome.omnibox.setDefaultSuggestion({
    description: 'Timer set: &lt;time&gt; [&lt;message&gt;]'
  });
}

chrome.omnibox.onInputStarted.addListener(function() {
  resetDefaultSuggestion();
});

chrome.omnibox.onInputChanged.addListener(function(text, suggest) {
  updateDefaultSuggestion(text);
  chrome.storage.local.get({historySuggestionType: "time"}, function(object) {
    var suggestions = [];
    if (object.historySuggestionType === "time") {
      var founds = thistory.findByTime(text);
    } else {
      var founds = thistory.findByCount(text);
    }
    for (var i = 0; i < founds.length; i++) {
      var found = founds[i];
      suggestions.push({
        content: found["text"],
        description: found["text"] + " - <dim>Used " + found["count"] + " time(s)</dim>"
      });
    }
    suggest(suggestions);
  });
});

chrome.omnibox.onInputCancelled.addListener(function(text, suggest) {
  resetDefaultSuggestion();
});

chrome.browserAction.onClicked.addListener(function(tab) {
  openOptionsPage();
});

function openOptionsPage() {
  var url = chrome.runtime.getURL("options.html");
  chrome.tabs.query({url: url, currentWindow: true}, function(tabs) {
    if (tabs.length > 0) {
      chrome.tabs.update(tabs[0].id, {active: true});
    } else {
      chrome.tabs.create({url: url});
    }
  });
}
