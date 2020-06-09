let badgeFull = document.getElementById("badgeFull");
let badgeGrey = document.getElementById("badgeGrey");
let totCom = document.getElementById("totalComments");


//kalitera na  ginei sto nodejs auto
if (totCom.innerHTML < 10){
    badgeFull.style.display = "none";
}else{
    badgeGrey.style.display = "none";
}