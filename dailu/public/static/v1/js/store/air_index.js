$(function(){

	var dateInput = ['#air_leave_time','#air_arr_time']
		$(dateInput).each(function(i,ele){
		
			$(ele).datepicker({
				minDate: 0,
				dateFormat: "yy-mm-dd"
			});
		})	
		$('#air_leave_time').val(getDate());
		$('#air_arr_time').val(getDateAfter_n('',1,'-'));
	$('#air_leave_time,#air_arr_time').on('change',function(event){
		if(event.target.id=='air_leave_time'){
			var initDay = $(this).val();
			$('#air_arr_time').val(getDateAfter_n(initDay,1,'-'))
			return false;
		}
		var date1 = new Date($('#air_leave_time').val().replace(/-/g,'/'))
		var date2 = new Date($('#air_arr_time').val().replace(/-/g,'/'))
		day	= (date2-date1)/86400000;
		if(day<=0){
			alert('机票返回日期须大于出发日期1天')
			$('#air_arr_time').val(getDateAfter_n($('#air_leave_time').val(),1,'-'));	
		}
	})
	$('.wap .title .tit_right span').on('click',function(){
		var query = {};
			query.type = $(this).parents('.title').attr('type')
			query.city = $(this).html();
		$.post("test.php",query,
			function(data){
    			
				

 		}, "json");
	})

	$('.leftForm .formList .searchBtn').on('click',function(){
		var query = {};
			query.start_city = $('#lea_city').val().trim();
			query.end_city = $('#arr_city').val().trim();
			query.date = $('#air_leave_time ').val().trim();
			query.rdate = $('#air_arr_time').val().trim();
			query.return = $('.choice .return').hasClass('on');
			$.post('searchFlight',query,function(res){
				console.log(res.status)
				if(res.status=='true'){
					window.location.href='/portal/store/airlist.html'
				}else{
					alert('未查询到航班，请核实查询信息是否正确')
				}
				
			},'json')
	})

	$('.sale_box .list').on('click',function(){
		var query = {};
			query.start_city = $(this).find('.cityBox .leave .city').text().trim();
			query.end_city = $(this).find('.cityBox .arrive .city').text().trim();
			query.date = $(this).find('.date').text().trim();
			query.rdate = $('#air_arr_time').val().trim();
			query.return = false; 
			$.post('searchFlight',query,function(res){
				if(res.status=='true'){
					window.location.href='/portal/store/airlist.html'
				}else{
					alert('未查询到航班，请核实查询信息是否正确')
				}
			},'json')		
	})


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

	$('.checkBox').on('click',function(){
		$(this).addClass('on').siblings('.checkBox').removeClass('on');
	})



	$('.formList .change').on('click',function(){
		var temp = $(this).siblings('.leave').find('input').val();
		var arrive  = $(this).siblings('.arrive').find('input').val();
		$(this).siblings('.leave').find('input').val(arrive);
		$(this).siblings('.arrive').find('input').val(temp);
	})
})