function addEventHandler(elem, eventType, handler) {
  if(elem === null){
    return false;
  }
  if (elem.addEventListener)
    elem.addEventListener (eventType, handler, false);
  else if (elem.attachEvent)
    elem.attachEvent ('on' + eventType, handler);
}

addEventHandler(document, 'DOMContentLoaded', function() {

    addEventHandler(document.getElementById('testSlopeByPinApi'), 'click', function() {
      window.open("/api/slopebypin/" + document.getElementById('testSlopePin').value, "_blank");
    });
    addEventHandler(document.getElementById('calcButton'), 'click', function() {
      document.getElementById('loading').classList.remove("hidden");
      document.getElementById('loading').classList.add("show");
      axios.get('/api/slopebypin/' + document.getElementById("pinInput").value)
        .then(function (response) {
          document.getElementById('loading').classList.remove("show");
          document.getElementById('loading').classList.add("hidden");
          document.getElementById('resultsDiv').classList.remove("hidden");
          document.getElementById('resultsDiv').classList.add("show");
          document.getElementById("jurisdiction").innerHTML = response.data.jurisdiction;
          document.getElementById("acres").innerHTML = response.data.acres;
          document.getElementById("maxElevation").innerHTML = response.data.maxElevation;
          document.getElementById("percentSlope").innerHTML = response.data.percentSlope;
          //document.getElementById('resultsDiv')
        })
        .catch(function (error) {
          console.log(error);
        });
    });

});
