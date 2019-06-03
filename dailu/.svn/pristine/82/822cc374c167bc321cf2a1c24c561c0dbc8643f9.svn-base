$(function(){
	$(window).scroll(function(){
		var top = $(window).scrollTop();
		if($(window).scrollTop()>670){
			$('.header').css({'backgroundColor':'#fff','boxShadow':'0px 1px 8px 0px rgba(0, 0, 0, 0.08)'})
			$('.header .right-wap .links a').css({'color':'#666'});
			$('.header img.logo').attr('src','/static/common/img/logo.png');

		}else{
			$('.header').css({'backgroundColor':'rgba(255,255,255,0)','boxShadow':'none'});
			$('.header .right-wap .links a').css({'color':'#fff'});
			$('.header img.logo').attr('src','/static/v1/img/downApp/logo.png');

		}

		if(top>100){
			$('.wap1 .info_wap').show().addClass('fadeInDownBig')
		}
		if(top>750){
			$('.wap2 .info_wap').show().addClass('fadeInLeft')

		}
		if(top>1200){
			$('.wap3 .info_wap').show().addClass('bounceIn')

		}
		if(top>1700){
			$('.wap4 .info_wap').show().addClass('bounceInUp')

		}
		
	})
})