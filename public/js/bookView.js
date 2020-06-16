$(document).ready(function(){
    //showing data to edit modal      
    $('#mytable').on('click','.edit',function(){
    var book_id = $(this).data('id');
    var book_title = $(this).data('book_title');
    var book_description = $(this).data('book_description');
    var book_cover = $(this).data('book_cover');
    var book_author_id = $(this).data('book_author_id');
    var book_category = $(this).data('book_category');
    $('#EditModal').modal('show');
    $('.book_title').val(book_title);
    $('.book_description').val(book_description);
    $('.book_cover').val(book_cover);
    $('.book_author_id').val(book_author_id);
    $('.book_category').val(book_category);
    $('.book_id').val(book_id);


    });
    //showing delete record modal
    $('#mytable').on('click','.delete',function(){
    var book_id = $(this).data('id');
    $('#DeleteModal').modal('show');
    $('.book_id2').val(book_id);
    });
  
  
});

function functionForCovers(selectObject) {
    if(selectObject.value == "NewImage"){
        document.getElementById("fileForCover").style.display = "inline-block";
    }
    else{
        document.getElementById("fileForCover").style.display = "none";
        document.getElementById("fileForCoverType").value = "";
    }
}
 

function functionForCoversUpdate(selectObject) {
    if(selectObject.value == "NewImage"){
        document.getElementById("fileForCoverFromUpdate").style.display = "inline-block";
    }
    else{
        document.getElementById("fileForCoverFromUpdate").style.display = "none";
        document.getElementById("fileForCoverTypeFromUpdate").value = "";
    }
}

  