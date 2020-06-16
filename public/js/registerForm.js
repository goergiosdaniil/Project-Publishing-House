let submitButton = document.getElementById("submit-button");
let firstname = document.getElementById("firstname");
let surname = document.getElementById("surname");
let email = document.getElementById("email");
let pswd1 = document.getElementById("password");
let pswd2 = document.getElementById("passwordRe");
let emailDiv = document.getElementById("emailDiv");
 
submitButton.disabled = true;
pswd1.addEventListener('focusout',validatePswd);
pswd2.addEventListener('focusout',validatePswd);
email.addEventListener('focusout',validateEmail);
document.querySelectorAll('input').forEach(item => {
    item.addEventListener('input', buttonDisabled)});

function buttonDisabled(){
    if ( !(emptyTxt(firstname)) && !(emptyTxt(surname))  &&  validatePswd() && validateEmail() ) {
        submitButton.disabled=false;
        return false;
    }
    submitButton.disabled=true;
    return true;
}

function validateEmail(){
    var emailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    var emailLegend = document.getElementById('emailLegend');
    if (email.value.match(emailFormat)) {
        emailLegend.innerHTML = "";
        emailDiv.style.marginBottom = "16px";
        return true;    
    }else if (email.value==="") { 
        emailLegend.innerHTML = "";
        emailDiv.style.marginBottom = "16px";
        return false;
    }
    emailLegend.innerHTML = "Λανθασμένη διεύθυνση E-mail";
    emailDiv.style.marginBottom = "0px";   
    return false;
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

function validatePswd(){
    if (pswdMatch(pswd1,pswd2)){
        return true;
    }
    return false;
}
function pswdLength(inputtxt) {
    return ((inputtxt.value.length<=12 && inputtxt.value.length>5) || inputtxt.value === "");
}

function pswdMatch(pswd1,pswd2) {
    let pswdLegend = document.getElementById("pswdLegend");
    if (!(pswdLength(pswd1))){
        pswdLegend.innerHTML = "Ο κωδικός δεν εχει κατάλληλο μέγεθος";
        pswdLegend.style.marginBottom = "0px";
        if (pswd1.value == "" ){
            pswdLegend.innerHTML = ""
            pswdLegend.style.marginBottom = "16px";
            return false;
        }
        return false;
    }
    var CharArray = pswd1.value.split(" ");
    if (CharArray.length >1) {
        pswdLegend.innerHTML = "Ο κωδικός δεν μπορει να περιέχει κενά"
        pswdLegend.style.marginBottom = "0px";
        return false;
    }
    if (pswd1.value == "" || pswd2.value == "" ){
        pswdLegend.innerHTML = ""
        pswdLegend.style.marginBottom = "16px";
        return false;
    }
    if(pswd1.value===pswd2.value){
        pswdLegend.innerHTML = ""
        pswdLegend.style.marginBottom = "16px";
        return true;
    }
    pswdLegend.innerHTML = "Οι κωδικοί δεν ταιριάζουν"
    pswdLegend.style.marginBottom = "0px";
    return false;
}