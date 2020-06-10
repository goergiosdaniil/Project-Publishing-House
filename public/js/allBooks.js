$(document).ready(function() {
  var totalPages = document.getElementById("totalPages").value;
  
  totalPages = parseInt(totalPages);
  if (totalPages != 1){for (i=1; i < totalPages+1 ; i++){
    var listItem = document.createElement("LI");
  listItem.setAttribute("class","page-item");
  listItem.setAttribute("id","page"+i);
  var a = document.createElement("a");
  a.setAttribute("class","page-link");

if (typeof category !== 'undefined') {
  // the variable is defined
  cat = parseInt(category.value);
  a.setAttribute("href","?page="+i+"&category="+cat);
}
else if(typeof author !== 'undefined'){
  auth = parseInt(author.value);
  a.setAttribute("href","?page="+i+"&author="+auth);
}
else{
a.setAttribute("href","?page="+i);
}
  a.innerHTML = i;
  listItem.appendChild(a);
  document.getElementById("listOfPages").appendChild(listItem);
  }
  let nowPage = document.getElementById("page").value;
 document.getElementById("page"+nowPage).setAttribute("class","page-item active");}
 });

let categoryToggle = document.getElementById("toggleButton");
let articleContainer = document.getElementById("mytable");
let closeToggle = document.getElementById("closeToggle");
let asideCategories = document.getElementById("asideCategories");
categoryToggle.addEventListener("click",()=>{
  categoryToggle.style.display="none";
  articleContainer.style.position="unset";
  asideCategories.style.display="block";
})
closeToggle.addEventListener("click",()=>{
  categoryToggle.style.display="block";
  articleContainer.style.position="relative";
  asideCategories.style.display="none";
})

window.addEventListener('resize', ()=>{
  if (window.innerWidth>767){ 
    categoryToggle.style.display="none";
    asideCategories.style.display="block";
  }
  if (window.innerWidth<768){
    categoryToggle.style.display="block";
    articleContainer.style.position="relative";
    asideCategories.style.display="none";
  }
});
