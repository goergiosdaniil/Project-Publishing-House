
$(document).ready(function(){
    //showing data to edit modal      
$('#mytable').on('click','.edit',function(){
var id = $(this).data('id');
var role = $(this).data('role');
$('#EditModal').modal('show');
$('.id').val(id);
$('.role').val(role);
});
    //showing delete record modal
$('#mytable').on('click','.delete',function(){
    var id = $(this).data('id');
$('#DeleteModal').modal('show');
$('.id').val(id);
});
});


