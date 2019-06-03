$(function(){
	var trip  = getUrlParam('trip');
	var this_uid = getCookie('uid');
	var screenH = window.screen.height
	if($('.main').height()<screenH){
		$('body').height(screenH);
		$('.main_box , .main').css({'height':'100%'});
	}
	$('.submit_edit').on('click',function(){
		var query  = {};
			query.trip_id = trip;
			query.agency = $('input.poster_name').val();
			query.phone = $('input.phone').val();
			query.travel_price = $('input.team_price').val();
			// for(var key in query){
			// 	if(query[key]==''){
			// 		layer.msg('行程信息不能为空',{
			// 			time:2000
			// 		})
			// 		return false;
			// 	}
			// }
			if(query.agency==''){
				layer.msg('旅行社名称不能为空',{
						time:2000
				})
				return false;
			}
			$.post('/portal/detail/submitRevise',query,function(res){
				if(res.status==true){
					window.location.href="/portal/itinerary/tripinfoshare.html?them="+ this_uid +"&trip="+trip;
				}
			},'json')
	})
	$('.kt').on('click',function(){
		$('.mask_layout').show();
		$('.per_box').show();
	})
	$('.mask_layout').on('click',function(){
		$(this).hide();
		$('.per_box').hide();
	})
	$('.per_box input').on('focus',function(){
		$('.per_box')[0].scrollIntoViewIfNeeded(false)
		
	})
	$('.submit_tj').on('click',function(){
		var query = {};
			query.uid = this_uid;
			query.user_name = $('.per_box input.name').val()
			query.phone = $('.per_box input.phone').val()
			for(var key in query){
				if(query[key]==''){
					layer.msg('为方便小鹿联系你,个人信息不能为空',{
						time:2000
					})
					return false;
				}
			}
		$.post('/portal/detail/applyAgency',query,function(res){
			if(res.status==true){
				layer.msg(res.msg,{
					time:2000
				},function(){
					$('.mask_layout').hide();
					$('.per_box').hide();
				})
			}
		},'json')	
	})
})