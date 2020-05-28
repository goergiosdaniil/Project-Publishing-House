let commentText = document.getElementById("comment-text");
let ratingStars = document.getElementById("rating");
let submitButton = document.getElementById("submitButton");

if (submitButton){
    submitButton.disabled=true;
}

let bookStarValue = document.querySelector("progress").value;

let starsArray = document.querySelectorAll('i');
let starsNewComment=[];
let starsBook=[];
for (i in starsArray){
    if (i<5){
        starsBook.push(starsArray[i]);
    }
    if (i>5 && i<=10){
        starsNewComment.push(starsArray[i]);
    }
}
starsArray=[];

starsNewComment.forEach(item=>{
    item.addEventListener('mouseout',event=>{
        for (item of starsNewComment){
            item.setAttribute('class',"fa fa-star");
        }
    })});

starsNewComment.forEach(item=>{
    item.addEventListener('mouseover',event=>{
        for (item of starsNewComment){
            item.setAttribute('class',"fa fa-star text-warning");
            if (item==event.target){
                break;
            }
        }
    })});

starsNewComment.forEach(item=>{
    item.addEventListener('click',event=>{
        for (i in starsNewComment){
            
            starsNewComment[i].setAttribute('style',"color:rgb(246,194,68)");
            if (starsNewComment[i]==event.target){
                ratingStars.value=i;
                var index=Number(i);
            }
            if (i>index){
                starsNewComment[i].setAttribute('style',"color:grey");
            }
        }
        ratingStars.value=index+1;
        submitButtonDisabled();
    })});

function submitButtonDisabled(){
    submitButton.disabled=false;
}

let commentRating = document.querySelectorAll(".comment-rating");

commentRating.forEach(item=>{
    let commentStarValue = item.children[0].value;
    for (var k=1;k<6;k++){
        let commentStar = document.createElement("i");
        if (k<=commentStarValue){ 
            commentStar.setAttribute('class',"fa fa-star text-warning");
        }else{
            commentStar.setAttribute('class',"fa fa-star");
        }
        item.appendChild(commentStar);
    }
})

var d = new Date();
var day = "-"+d.getDate();
var mon = d.getMonth()+1;
if (mon<10){
    mon = "0"+mon;
}
var yea = d.getFullYear()+"-";
var fullDate = yea.concat(mon);
fullDate = fullDate.concat(day);
var tempDate = document.getElementById("date");
if (tempDate){ 
    tempDate.setAttribute("value",fullDate);
}
var allMeters = document.querySelectorAll("meter");
var MOstars = 0;
if (!(allMeters[0] == undefined)){
    for (meter of allMeters){
        MOstars = MOstars + meter.value;
    }
    MOstars = MOstars / allMeters.length;
    MOstars = parseInt(MOstars.toFixed());
    bookStarValue = MOstars;
}

var y=0;
while(y<bookStarValue){
    starsBook[y].style.color="rgb(246,194,68)";
    y++;
}

let rmBtns = document.getElementsByClassName("removeButton");
let rmDiv = document.getElementsByClassName("removeButtonDiv");
let usr = document.getElementById("user_id");
if (usr){ 
    for (rm in rmDiv){
        if (rmDiv[rm].innerHTML==usr.value){
            console.log(rmDiv[rm].innerHTML,usr.value);
            rmBtns[rm].setAttribute("style","display:block;");
        }
    }
}