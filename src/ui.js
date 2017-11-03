$(function() {
  //Get background
  //
  var root = chrome.extension.getBackgroundPage();

  chrome.storage.local.get({
    timers: [],
    idCounter: 0,
    soundType: "tts",
    historySuggestionType: "time"
  }, function(object) {
    for (var i = 0; i < Math.min(object.timers.length,10) ; i++) {
      var timer = object.timers[i];
      console.log(timer);
      notificationTime = timer.currentTime + timer.seconds * 1000;
      $("#timers > tbody:last").append(
        "<tr><td>" + timer.desc + "</td>"
        + "<td>" + moment(timer.currentTime).calendar() + "</td>"
        + "<td>" + moment(notificationTime).calendar() + " (" + moment(notificationTime).fromNow() + ")</td>"
        + "<td toid='"+timer.tid+"' class='remove-button "+ timer.status + "'> "+timer.status+"</td>"
        + "</tr>");
        $('tr').last().addClass(timer.status);
        if(timer.status=='ongoing'){
            $(".remove-button").text("Cancel");
        }
    }

    $('.remove-button').click(function(){
        if($(this).parent().hasClass('ongoing')) {
            //  
        } else {
            return;
        }
        if(confirm("To Cancel Timer? " )){
           console.log("Cancelled");
           var curi = parseInt($(this).attr('toid'));
           root.clearTimeout(curi) ;
           $(this).parent().removeClass("ongoing").addClass('cancelled');
           //Rewrite the timer
           chrome.storage.local.get({timers: []}, function(object) {
                timers = object.timers;
                //Locate the index
                for(var i =0; i< timers.length; i++) {
                    if(parseInt(timers[i].tid)== curi){
                        timers[i].status="cancelled";
                    }
                }
                chrome.storage.local.set({timers: timers});
                //Refresh Page
                location.reload();
           });
        }
    });

    $("#stats").append("<li># of timers you created: " + object.idCounter + "</li>");

    if (object.soundType == "tts") {
      $("input#tts").attr("checked", true);
    } else if(object.soundType == "mute") {
      $("input#mute").attr("checked", true);
    } else {
      $("input#bell").attr("checked", true);
    }

    $("input#tts").change(function() {
      chrome.storage.local.set({soundType: "tts"});
      showSaveMessage();
    });
    $("input#mute").change(function() {
      chrome.storage.local.set({soundType: "mute"});
      showSaveMessage();
    });
    $("input#bell").change(function() {
      chrome.storage.local.set({soundType: "bell"});
      showSaveMessage();
    });

    if (object.historySuggestionType === "time") {
      $("input#time").attr("checked", true);
    } else {
      $("input#count").attr("checked", true);
    }

    $("input#time").change(function() {
      chrome.storage.local.set({historySuggestionType: "time"});
      showSaveMessage();
    });
    $("input#count").change(function() {
      chrome.storage.local.set({historySuggestionType: "count"});
      showSaveMessage();
    });

    $('#clear-button').click(function(){
        if(confirm("Sure to stop all timers?")){
           //Rewrite the timer
           chrome.storage.local.get({timers: []}, function(object) {
                timers = object.timers;
                //Locate the index
                for(var i =0; i< timers.length; i++) {
                    timers[i].status="cancelled";
                    root.clearTimeout(parseInt(timers[i].tid));
                }
                root.timercount = 0
                //chrome.storage.local.set({timers: timers});
                chrome.storage.local.set({timers: []});
                //Refresh Page
                location.reload();
           });
        }
    });



  });
});

function showSaveMessage() {
  $("#flash").show();
  $("#flash").html("Saved");
  setTimeout(function() {
    $("#flash").fadeOut("slow");
  }, 1000);
}
