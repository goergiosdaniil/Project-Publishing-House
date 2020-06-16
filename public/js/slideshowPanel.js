let slidesActive = document.getElementsByClassName("slidesActive");
var i=1;
for (slide of slidesActive){
    slide.childNodes[1].innerHTML=i;
    i+=1;
}