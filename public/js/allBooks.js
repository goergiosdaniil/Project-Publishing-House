$(document).ready(function() {
  var totalPages = document.getElementById("totalPages").value;
  totalPages = parseInt(totalPages);
    for (i=1; i < totalPages+1 ; i++){
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
else{
  a.setAttribute("href","?page="+i);
}
    a.innerHTML = i;
    listItem.appendChild(a);
    document.getElementById("listOfPages").appendChild(listItem);
    }
    let nowPage = document.getElementById("page").value;
   document.getElementById("page"+nowPage).setAttribute("class","page-item active");

  

  
 });