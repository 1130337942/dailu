$(function(){
	var uid = getCookie('uid');
	var u_name = getCookie('user_name');
	// $('.left_wap .uname').text(decodeURI(u_name));
	$.post('invitationData',{uid:uid},function(res){
		var loginPath = window.location.origin +'/portal/login/register.html?invitation=';
			loginPath = encodeURI(loginPath) +res.refer_code;
			$('#foo').val(loginPath);
			$('#foo2').val(res.refer_code);
			$('.copy').show();
			$('.user_num').text(res.register_data)
			$('.tot_travel_pass').text(res.is_audit)
	},'json')


	var clipboard = new ClipboardJS('.copy');
	clipboard.on('success', function(e) {
		e.clearSelection();
		layer.msg('复制成功',{
			time:600,
			offset:'200px'
		})
		
	});

	clipboard.on('error', function(e) {
		layer.msg('复制失败请手动复制',{
			time:600,
			offset:'200px'
		})
	});


	$('.right_wap .nav_tab span').hover(function(){
		var left =$(this).offset().left-$(this).parent('.nav_tab').offset().left;
		$(this).siblings('.bder').stop().animate({left:left},200);
	},function(){
		var left =$('.right_wap .nav_tab .active').offset().left - $(this).parent('.nav_tab').offset().left;
		$('.right_wap .nav_tab .bder').stop().animate({left:left},200);
	})
	$('.right_wap .nav_tab span').on('click',function(){
		$(this).addClass('active').siblings().removeClass('active');
		var index = $(this).attr('index');
		$('.right_wap .wap:eq('+ index +')').addClass('on').siblings('.wap').removeClass('on').addClass('hide');
	});
	


})