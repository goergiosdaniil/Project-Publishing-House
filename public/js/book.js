let commentText = document.getElementById("comment-text");
let ratingStars = document.getElementById("rating");
let submitButton = document.getElementById("submitButton");
submitButton.disabled=true;

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
var y=0;
while(y<bookStarValue){
    starsBook[y].style.color="rgb(246,194,68)";
    y++;
}

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

