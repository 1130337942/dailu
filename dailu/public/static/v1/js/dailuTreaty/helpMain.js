$(function(){
	$(document).scroll(function(){
		var scrollTop = $(document).scrollTop()
		var chooseTop =  $('.topSearch').offset().top-$(document).scrollTop();
		var opacity =((($(document).scrollTop() / 150) > 0.9) ? 1 : ($(document).scrollTop() / 150)) 
			opacity==1?$('.header').addClass('shadow'):$('.header').removeClass('shadow')
		$('.header').css({background:'rgba(255,255,255,'+opacity+')'})
		
		
	
	})

	$('.video_box .ctrl').on('click',function(){
		$('.video_box video').attr('controls','true')[0].play();
	})

		$('.video_box video').on('pause',function(){
			$('.video_box .ctrl').show()
		}).on('play',function(){
			$('.video_box .ctrl').hide()
		})
	
})                    