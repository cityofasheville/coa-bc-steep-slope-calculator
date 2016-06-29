function addEventHandler(elem, eventType, handler) {
  if (elem.addEventListener)
    elem.addEventListener (eventType, handler, false);
  else if (elem.attachEvent)
    elem.attachEvent ('on' + eventType, handler);
}

addEventHandler(document, 'DOMContentLoaded', function() {

    addEventHandler(document.getElementById('testSlopeByPinApi'), 'click', function() {
      console.log(document.getElementById('testSlopePin').value);
        window.open("/api/slopebypin/" + document.getElementById('testSlopePin').value, "_blank");
    });
    // addEventHandler(document.getElementById('testSlopePinForm'), 'submit', function() {
    //
    // });
});
