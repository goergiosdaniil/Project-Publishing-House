
$(document).ready(function(){
    //showing data to edit modal      
$('#mytable').on('click','.edit',function(){
var id = $(this).data('id');
var current_state = $(this).data('current_state');
$('#EditModal').modal('show');
$('.id').val(id);
$('.current_state').val(current_state);
});

$('#mytable').on('click','.sendMail',function(){
    var user_id = $(this).data('user_id');
    var email = $(this).data('email');
    $('#SendMailModal').modal('show');
    $('.user_id').val(user_id);
    $('.email').val(email);
    });
    //showing delete record modal
$('#mytable').on('click','.delete',function(){
var id = $(this).data('id');
$('#DeleteModal').modal('show');
$('.id').val(id);
});
});


