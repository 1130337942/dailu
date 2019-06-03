$(function(){
    var uid = getCookie('uid')
    $.post('/portal/aboutuser/PersonalInfo',{uid:uid},function(data){
        // console.log(data)
        if(data.head_port != ''){
            $('.js_portrait img' ).attr('src',data.head_port)
        }
    },'json')
})