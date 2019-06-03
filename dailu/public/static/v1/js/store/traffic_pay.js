$(function(){
	$('.type_box .list').on('click',function(){
		$(this).addClass('active').siblings('.list').removeClass('active');
	})

	$('.submit_btn').on('click',function(){
		var pay_type = $('.type_list .active').attr('type');
		var id= $(this).attr('id');
		switch(pay_type){
			case 'alipay':
			window.location.href='/portal/store/Alipay?type=flight&id='+$(this).attr('id');
			break;
			case 'weixin':
			$.get('wxPay',{'id':id,type:'flight'},function(res){
					orderDetail = res.out_trade_no;
					$('.weixin_mask .weixin_ewm').attr('src','getarcode?url='+res.qr);
					$('.weixin_mask .weixin_box strong').text('¥'+res.price);

			},'json')
			$('.weixin_mask').fadeIn();
			var timer = setInterval(function(){
				$.post('wxOrderDetail',{'out_trade_no':orderDetail},function(res){
					if(res.status==true){
						window.clearInterval(timer);   
						window.location.href="/portal/store/storePaySuccess.html?type=flight&out_trade_no="+orderDetail;
					}
				},'json')

			},1000);

			break;
			case 'online':
				window.location.href='/portal/store/billPay?type=flight&id='+$(this).attr('id');
			break;
			
		}
	})

	$('.weixin_mask').on('click',function(){
		$(this).fadeOut(300);
	})
	function MinutesTest(){
		//     var sdate1 = new Date($('#countdown').attr('time'));
		    var sdate1 = $('.lookout').attr('time')*1000 +30*60*1000;
				sdate1= new Date (sdate1);
		    var now= sdate1.getFullYear()+'年' +(sdate1.getMonth()+1) +'月'+sdate1.getDate()+ '日' + sdate1.getHours()+":"+sdate1.getMinutes();
		    return now;
	}
	 $('.lookout').text( ' '+ MinutesTest())

})


