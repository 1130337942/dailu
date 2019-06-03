$(function(){
	$('.ctrlwap .add').on('click',function(){
		 $('.passenger .listbox').append(passengerTemp);
		 $('.passenger .paslist .del').show()
	})

	$()

	$('.minWap .leftWap .passenger').on('click','.del',function(){
		$(this).parents('.paslist').remove()
		if($('.passenger .paslist').length<=1){
			$('.passenger .paslist .del').hide()
		}
	})

	$('.leftWap').on('click','.checkBox',function(){
		$(this).toggleClass('on');
	})

	$('.pay .submit_btn').on('click',function(){
		window.location.href="/portal/store//trainformPrev.html"
	})








var passengerTemp ='<li class="paslist">\
							<div class="wap">\
								<div class="tit">姓名*</div>\
								<input type="text" placeholder="请输入乘客姓名">\
								<div class="del">删除</div>\
							</div>	\
							<div class="wap">\
								<div class="tit">证件类型*</div>\
								<span class="select">\
									<select name="" id="">\
										<option value="身份证">身份证</option>\
										<option value="护照">护照</option>\
									</select>\
								</span>\
							</div>\
							<div class="wap">\
								<div class="tit">证件号码*</div>\
								<input type="text" placeholder="请输入证件号码">\
							</div>\
							<div class="wap">\
								<div class="tit">出生日期*</div>\
								<input type="text" placeholder="2018-06-12">\
							</div>\
							<div class="wap">\
								<div class="tit">火车意外险*</div>\
								<span class="select">\
									<select name="" id="">\
										<option value="0">0份保险共10元</option>\
										<option value="0">1份保险共10元</option>\
									</select>\
								</span>\
								<a href="javascript:;">保险说明</a>\
							</div>\
							<div class="wap">\
								<div class="tit"></div>		\
								<i class="checkBox"></i> <span class="tip">保存为常用乘客</span>\
							</div>\
						</li>'

})