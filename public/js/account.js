let badgeFull = document.getElementById("badgeFull");
let badgeGrey = document.getElementById("badgeGrey");
let totCom = document.getElementById("totalComments");
let upBtn = document.getElementById("uploadBtn");
let doc = document.getElementById("document");
let radioType = document.getElementsByClassName("radioType");

upBtn.disabled = true;
doc.addEventListener('change',upBtnDisabled);

//kalitera na  ginei sto nodejs auto
if (totCom.innerHTML < 10){
    badgeFull.style.display = "none";
}else{
    badgeGrey.style.display = "none";
}

var currStates = document.getElementsByClassName("currentState");
for (i = 0 ; i<currStates.length ; i++){
    console.log(currStates[i].innerHTML);
    if(currStates[i].innerHTML == "Σε αναμονή"){
        currStates[i].style.color ="#0087ff";
    }
    else if(currStates[i].innerHTML == "Εγκρίθηκε"){
        currStates[i].style.color ="Green";
    }
    else if(currStates[i].innerHTML == "Απορρίφθηκε"){
        currStates[i].style.color ="Red";
    }
}

function upBtnDisabled(){
    if (doc.value==""){
        upBtn.disabled = true;
    }else{
        for (radio of radioType){
            if (radio.checked===true){
                upBtn.disabled = false;
            }
        } 
    }
}
