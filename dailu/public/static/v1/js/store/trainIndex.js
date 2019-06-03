var mySwiper = new Swiper ('.swiper-container', {
		autoplay: {
			delay: 3000,
			stopOnLastSlide: false,
			disableOnInteraction: true,
		},
		loop: true,

    	// 如果需要分页器
    	pagination: {
    		el: '.swiper-pagination',
    		type: 'bullets',
    		clickable :true,
    	}
    }) 

$('#train_arr_time').val(getDate())
$('#train_arr_time').datepicker({
    minDate: 0,
    dateFormat: "yy-mm-dd"
});