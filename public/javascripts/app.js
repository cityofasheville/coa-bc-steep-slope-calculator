function addEventHandler(elem, eventType, handler) {
  if (elem.addEventListener)
    elem.addEventListener (eventType, handler, false);
  else if (elem.attachEvent)
    elem.attachEvent ('on' + eventType, handler);
}

addEventHandler(document, 'DOMContentLoaded', function() {
    addEventHandler(document.getElementById('testSlopePin'), 'change', function() {
        document.getElementById('testSlopeLink').href = "/api/slope/" + this.value;
    });
});
