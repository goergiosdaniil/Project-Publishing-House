let submitButton = document.getElementById("submit-button");
let firstname = document.getElementById("firstname");
let surname = document.getElementById("surname");
let subject = document.getElementById("subject");

submitButton.disabled = true;
if (emptyTxt(firstname)===false && emptyTxt(surname)===false && msgLength(subject)) {
    submitButton.disabled = false;   
}

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
    return inputtxt.value.length<=210 ;
}