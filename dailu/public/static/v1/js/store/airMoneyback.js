$(function(){
	$('.checkBox').on('click',function(){
		if($(this).parent().hasClass('disabled')){
			return false;
		}
		$(this).toggleClass('on');
		var check = 0;
		$('.person_check .checkBox').each(function(){
			if($(this).hasClass('on')){
				$('.submit').removeClass('disabled');
				check++;
			}
		})
		check>0?$('.submit').removeClass('disabled'):$('.submit').addClass('disabled');
			
		
		
	})

	$('.submit').on('click',function(){
		if($('.submit').hasClass('disabled')){
			layer.msg('请选好需要退票的乘客',{
				time:'3000',
				top:'100px'
			})
			return false;
		}else{

			var query = {};
				query.passengers=[];
				$('.person_check .returnId').each(function(){
					var temp ={};
						temp.id=$(this).find('.p_id').val()
						temp.name=$(this).find('.p_name').val()
						query.passengers.push(temp);
				})
				query.order_no=$('.wap1_tit .detail_num span').text();
				query.backreason=$('.backreason select').val();
				query.describe=$('.describe textarea').val();
			$.post('airRefund',query,function(res){
				if(res.status==true){
					layer.msg(res.msg,{
						time:'3000',
						top:'100px'
					})
				}else{
					layer.msg(res.msg,{
						time:'3000',
						top:'100px'
					})
				}
			},'json')
		}

	})


})