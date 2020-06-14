
$(document).ready(function(){
    //showing data to edit modal      
$('#mytable').on('click','.edit',function(){
var id = $(this).data('id');
var isAdmin = $(this).data('isAdmin');
$('#EditModal').modal('show');
$('.id').val(id);
$('.isAdmin').val(isAdmin);
});
    //showing delete record modal
$('#mytable').on('click','.delete',function(){
    var id = $(this).data('id');
$('#DeleteModal').modal('show');
$('.id').val(id);
});
});


