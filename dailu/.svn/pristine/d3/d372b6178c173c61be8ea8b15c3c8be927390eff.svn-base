$(function(){
	$('.ctrl .submit_reason').on('click',function(){
		var query ={}; 
		query.order_id=$(this).attr('value');
		query.cause=$('#cause').val();
		query.orther_cause=$('#orther_cause').val().trim();
		if(query.orther_cause==''){
			layer.msg('请填写好，取消说明')
			return false;
		}
		$.post('hotelOrderCancel',query,function(res){
			if(res.status==true){
				layer.msg('订单取消成功，若已付款客服会尽快联系您退款', {
  							time: 1000, 
  							end:function(){
  							window.location.href='/portal/store/storeOrderlist.html';
  						}
				})
			}else{
				layer.msg('取消订单失败')
			}
		},'json')
	})


})