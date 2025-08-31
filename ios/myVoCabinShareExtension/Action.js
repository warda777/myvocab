// Action.js  (Safari JavaScript Preprocessing)
(function () {
  function getSelectionText() {
    try {
      var sel = window.getSelection();
      if (!sel) return "";
      return (sel.toString() || "").trim();
    } catch (e) {
      return "";
    }
  }
  var payload = {
    selection: getSelectionText(),
    url: window.location ? window.location.href : "",
    title: document && document.title ? document.title : "",
  };
  // Übergibt die Daten an die Extension (kUTTypePropertyList)
  return { NSExtensionJavaScriptPreprocessingResultsKey: payload };
})();
