$(function(){
	var successRoue = Boolean(Get_ssdata('shareRote'))?Get_ssdata('shareRote'):'/';
	$(".ctrl .pass_toggle ").on("click",function(){
		$(this).toggleClass('pass_on');
		var type = $(this).hasClass('pass_on')?"text":"password";
		console.log(type);
		$('#password').prop('type',type);
	})

	$('.doLogin').on('click',function(){
			$('.input_wap input').each(function(){
				if($(this).val().trim()==""){
					$(this).focus();
					layer.msg('请填写登录信息',{
							time:1000,
							offset:'200px'
					})
					return false;
				}	
			})
		var query={};
			query.user_name = $('#user').val().trim();
			query.pwd = $('#password').val().trim();
		$.post('../login/do_login',query,function(data){
			if(data.error_code != false || data.msg !='OK'){
				layer.msg(data.msg,{
							time:1000,
							offset:'200px'
					})
				return false;
			}
			window.location.href = successRoue;  
    		return false
		},'json')	
	})


})