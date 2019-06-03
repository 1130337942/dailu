$(function(){
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
	})



})