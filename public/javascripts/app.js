function addEventHandler(elem, eventType, handler) {
  if(elem === null){
    return false;
  }
  if (elem.addEventListener)
    elem.addEventListener (eventType, handler, false);
  else if (elem.attachEvent)
    elem.attachEvent ('on' + eventType, handler);
}

function showErrorMessage(msg){
  document.getElementById('loading').classList.remove("show");
  document.getElementById('loading').classList.add("hidden");
  document.getElementById('resultsDiv').classList.remove("show");
  document.getElementById('resultsDiv').classList.add("hidden");
  document.getElementById('errormsgs').classList.remove("hidden");
  document.getElementById('errormsgs').classList.add("show");
  document.getElementById("errormsgs").innerHTML = msg;
}

addEventHandler(document, 'DOMContentLoaded', function() {

    addEventHandler(document.getElementById('testSlopeByPinApi'), 'click', function() {
      window.open("/api/slopebypin/" + document.getElementById('testSlopePin').value, "_blank");
    });
    addEventHandler(document.getElementById('calcButton'), 'click', function() {
      document.getElementById('loading').classList.remove("hidden");
      document.getElementById('loading').classList.add("show");
      $.get('/api/slopebypin/' + document.getElementById("pinInput").value, function(data, status){
        if(status === 'success'){
          if(data.id == 0){  
            showErrorMessage("PIN not found. Verify that it is a valid 10 or 15 digit PIN number in Buncombe County.");
            return;
          }
          document.getElementById('loading').classList.remove("show");
          document.getElementById('loading').classList.add("hidden");
          document.getElementById('resultsDiv').classList.remove("hidden");
          document.getElementById('resultsDiv').classList.add("show");
          document.getElementById('errormsgs').classList.add("hidden");
          document.getElementById("jurisdiction").innerHTML = data.jurisdiction;
          document.getElementById("acres").innerHTML = data.acres;
          document.getElementById("maxElevation").innerHTML = data.maxElevation;
          document.getElementById("percentSlope").innerHTML = data.percentSlope;
        }else{
          showErrorMessage("There was an error processing your request.");
        }
      }, 'json');
    });

});
