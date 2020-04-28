document.addEventListener("click", (evt) => {
  const insideElement = document.getElementById("logInForm");
  let targetElement = evt.target; // clicked element
  do {
    if ( targetElement == insideElement || targetElement == document.getElementById("signInButton")) { 
      document.getElementById("logInDiv").style.display = "block";
      return; }
    // Go up the DOM
    targetElement = targetElement.parentNode;
    } while (targetElement);

  // This is a click outside.
  document.getElementById("logInDiv").style.display = "none";
});