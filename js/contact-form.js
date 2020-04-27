let submitButton = document.getElementById("submit-button");
let firstname = document.getElementById("firstname");
let surname = document.getElementById("surname");
let subject = document.getElementById("subject");
let email = document.getElementById("email");

submitButton.disabled = true;
firstname.addEventListener('input',submitButtonDisabled);
surname.addEventListener('input',submitButtonDisabled);
email.addEventListener('input',submitButtonDisabled);
subject.addEventListener('input',submitButtonDisabled);

function submitButtonDisabled() {
if (!emptyTxt(firstname) && !emptyTxt(surname) && !emptyTxt(email) && msgLength(subject) ) {
    submitButton.disabled = false;  
}else{
    submitButton.disabled = true;   
}}

function allLetter(inputtxt) {
    var letters = /^[A-Za-z]+$/;
    if(inputtxt.value.match(letters)) {
        return true; 
    }else{
        return false; }
}

function emptyTxt(inputtxt) {
    if (inputtxt.value==="") {
        return true;
    }else{
        if (allLetter(inputtxt)) {
            return false;
        }else{
            return true;
        }
    }
}

function msgLength(inputtxt) {
    return (inputtxt.value.length<=210 && inputtxt.value.length>=3);
}