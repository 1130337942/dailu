$(function(){
	var phoneReg = /^1[3456789]\d{9}$/;
	var emailReg = /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/;
	var hotelInfo  = sessionStorage.getItem('toHotelForm');
		hotelInfo = JSON.parse(hotelInfo);
		if(hotelInfo.pay_type.trim()=='预付'){
			$('.danbao').hide()
			$('.submit_wap .submit_btn').text('预付房费')
		}else if(hotelInfo.pay_type.trim() == '担保'){
			$('.danbao').show();
			$('.submit_wap .submit_btn').text('支付担保金')
		}else{
			$('.zaixian').hide();
			$('.submit_wap .submit_btn').text('立即预定')
		}
	
	$('.infoWap .info').find('.imgBox img').attr('src',hotelInfo.img).end()
					   .find('.tit').text(hotelInfo.hotelName).end()
					   .find('.loca').text(hotelInfo.place).end()
					   .find('.roomType').text(hotelInfo.roomType).end()	
					   .find('.area').text(hotelInfo.area).end()	
					   .find('.bad').text(hotelInfo.bad).end()	
					   .find('.floor').text(hotelInfo.floor).end()	
					   .find('.perNum').text(hotelInfo.perNum).end()	
					   .find('.other').text(hotelInfo.other).end()	
					   .find('.tell span').text(hotelInfo.tell).end();
	$('.infoWap .title').attr('price',hotelInfo.price);	
	$('.money').not('.post').text('¥ '+ hotelInfo.total_price) 			   	
	$('#arr_time').val(hotelInfo.arrival_date);
	$('#leave_time').val(hotelInfo.departure_date);
	$.post('hotelVal',hotelInfo,function(res){
		if(res.ResultCode!='OK'){
			alert('酒店预订失败，请重新查询后再试')
			window.location.href=document.referrer;
			return false;
		}

	},'json');
	var price = $('.infoWap .title').attr('price');
	var calcPrice = hotelInfo.total_price;
	var day =  (new Date($('#leave_time').val().replace(/-/g,'/')) - new Date($('#arr_time').val().replace(/-/g,'/')))/86400000;
	var roomNum = $('#roomNum').val();	
	$('.doubledate').kuiDate({
			className:'doubledate',
			isDisabled: "0"  // 	isDisabled为可选参数，“0”表示今日之前不可选，“1”标志今日之前可选
		});

	$('#leave_time,#arr_time').on('focus',function(event){
		if(event.target.id=='leave_time'){
			$('.kui_data_content_pane').css({'top': '44px','left':'280px'})
		}else{
			$('.kui_data_content_pane').css({'top': '44px','left':'100px'})
		}
	})

 	$('.list.place').citySelect({prov:"浙江", city:"杭州", dist:"滨江"});
	$('#arr_time,#leave_time').on('change',function(event){ //修改住店日期
		var today = new Date().getTime();
			var date1 = new Date($('#arr_time').val().replace(/-/g,'/')).getTime();
			var date2 = new Date($('#leave_time').val().replace(/-/g,'/')).getTime();
			if(event.target.id=='arr_time' && date2<=date1){
				$('#leave_time').val(getDateAfter_n($('#arr_time').val(),1,'-'));
			}
			else if (event.target.id=='leave_time'&& date2<=date1 && date2>today ){
				$('#arr_time').val(getDateAfter_n($('#leave_time').val(),-1,'-'));
			}
			else if (event.target.id=='leave_time'&& date2<=date1 && date2<=today ){
				$('#arr_time').val ($('#leave_time').val());
				$('#leave_time').val(getDateAfter_n($('#arr_time').val(),1,'-'));
			}
			else if(event.target.id=='leave_time'&&date2==today){
				$('#arr_time').val(getDate())
				$('#leave_time').val(getDateAfter_n('',1,'-'));
			}

		var query = {};
			query.hotel_id=hotelInfo.hotel_id;
			query.arrival_date=$('#arr_time').val();
			query.departure_date=$('#leave_time').val();
			query.rate_plan = hotelInfo.rate_plan;
			query.room_id = hotelInfo.room_id;
			query.map_post =true;
		$.post('getHotelDetail',query,function(res){
			if(res.status==true){
				roomNum = 1 ;
				calcPrice = res.TotalRate;
				calcMoney(roomNum)
				RenderRoomlist();
			}
		},'json')
		
	})
$('.formWap').on('focus','input',function(){
	$(this).addClass('active');
}).on('blur','input',function(){
	$(this).removeClass('active');
})

RenderRoomlist();
$('.room .bar .sub').on('click',function(){ //加减房间数量
	if(roomNum<=1) return ;
	roomNum --;
	changeRoom(roomNum,hotelInfo);
	// $('#roomNum').val(roomNum)
	// RenderRoomlist()
	// calcMoney(price,day,roomNum)
})
$('.room .bar .add').on('click',function(){
	if(roomNum>=10) return ;
	roomNum ++;
	changeRoom(roomNum,hotelInfo);
	
})
$('.needInv').on('click',function(){//是否需要发票
	$(this).toggleClass('on').parents('.list').siblings('.invoice').toggleClass('hide')
	calcMoney(roomNum)
})
$('.invoice .tab_bar span').on('click',function(){
	$(this).addClass('active').siblings('span').removeClass('active')
	calcMoney(roomNum)
})

function changeRoom (num,query){
	query.rooms_number = num;
	$.post('hotelVal',query,function(res){
		if(res.ResultCode!='OK'){
			alert('添加房间数失败')
			return false ;
		}else{
			$('#roomNum').val(roomNum)
			RenderRoomlist()
			calcMoney(roomNum)
		}
	},'json')
}

/*$.validator.setDefaults({
	submitHandler: function() {
		alert("提交事件!");
	}
});
$('form').ready(function() {
	$("form").validate();
});
*/

// 提交
$('.submit_wap .submit_btn').on('click',function(){
	var nameEmpty = true;
	var query ={};
		query.mobile = $('.phone_number').val();
		query.email= $('.email').val();
		if(!phoneReg.test(query.mobile)){
			layer.msg('请填写正确的联系电话',{
				time:2000,
				offset:'200px'
			})
			return false;
		}

		if(query.email!='' && !emailReg.test(query.email)){
			layer.msg('请填写正确的邮箱',{
				time:2000,
				offset:'200px'
			})
			return false;
		}

		$('input.name').each(function(){
			if($(this).val()==""){
				nameEmpty = false;	
				return false;
			}
		})

		if(!nameEmpty){
			layer.msg('请填写房间联系人',{
				time:2000,
				offset:'200px'
			})
			return false ;
		}

		query.ArrivalDate=$('#arr_time').val();
		query.DepartureDate=$('#leave_time').val();
		query.HotelId = hotelInfo.hotel_id;
		query.NumberOfRooms = $('#roomNum').val();
		query.NumberOfCustomers = $('#roomNum').val();
		query.total_price = calcMoney(query.NumberOfRooms);
		query.Customers = [];
		query.NeedInvoice = $('.needInv').hasClass('on');
		query.RatePlanId = hotelInfo.rate_plan;
		query.PaymentType = hotelInfo.payment_type;
		query.PayType = hotelInfo.pay_type;
		query.RoomTypeId = hotelInfo.room_type;
		query.invoice =  {'need_inv':false,'inv_type':0};
		if($('.needInv').hasClass('on')){
			query.invoice.need_inv =  true; /*0代表纸质发票 1代表电子发票*/
			query.invoice.inv_type = $('.online').hasClass('active')? 0:1;
		}
		$('.person_list .list').each(function(){
			var temp = {};
				temp.Name = $(this).find('input').val();
				temp.Gender = 'Unknown';
			query.Customers.push(temp);
		});

		query.name = query.Customers[0].Name;
		console.log(query);
		$.post('hotelOrderCreate',query,function(res){
			if(res.status==true){
				window.location.href = '/portal/store/hotelPay.html?hotel_id='+res.id;
			}else{
				alert('提交失败');
			}
		},'json')

})

function calcMoney(person){
	var hotelMoney  = person * calcPrice;
	var expr = ($('.needInv').hasClass('on') && $('span.paper').hasClass('active'))?10:0;
		expr == 10 ?$('.expre').show():$('.expre').hide();
	var totMoney = hotelMoney+expr;
		// totMoney = totMoney.toFixed(2)
	$('.tot_price .money').html('¥ '+ hotelMoney.toFixed(2));
	$('.submit_wap .money').html('¥ '+ totMoney.toFixed(2));
	$('.notice .money').html('¥ '+ totMoney.toFixed(2));
	return totMoney;
}

function RenderRoomlist(){ //渲染房间列表
	var str='';
	for(var i=1;i<=roomNum;i++){
		str += 	'<div class="list"><div class="tit">房间'+ i +'*</div> <input name="name'+i+'" minlength="2" required class="name" type="text"  placeholder="姓名，只需填写一位"></div>'	
	}
	$('.room_list .person_list').html(str)
}

function timestampToTime(timestamp) { //时间戳转日期
        var date = new Date(timestamp);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
        Y = date.getFullYear() + '-';
        M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
        // D = date.getDate() + ' ';
        D = (date.getDate() < 10 ? '0'+date.getDate() : date.getDate())+'';
        // h = date.getHours() + ':';
        // m = date.getMinutes() + ':';
        // s = date.getSeconds();
        return Y+M+D;
    }

    /**
	 * 计算n天后的日期
	 * initDate：开始日期，默认为当天日期， 格式：yyyymmdd/yyyy-mm-dd
	 * days:天数
	 * flag：返回值， 年与日之间的分隔符， 默认为xxxx年xx月xx日格式
	 */
	function getDateAfter_n(initDate, days, flag){
		
		if(!days){
			return initDate;
		}
		initDate = initDate.replace(/-/g,'');
		flag = $.trim(flag);
		var date;
		// 是否设置了起始日期
		if(!$.trim(initDate)){ // 没有设置初始化日期，就默认为当前日期
	        date = new Date();  
		}else{
			var year = initDate.substring(0,4);
			var month = initDate.substring(4,6);
			var day = initDate.substring(6,8);
			date = new Date(year, month-1, day); // 月份是从0开始的
		}
		date.setDate(date.getDate() + days);
 
		var yearStr = date.getFullYear();
		var monthStr = ("0"+(date.getMonth()+1)).slice(-2, 8); // 拼接2位数月份
		var dayStr = ("0"+date.getDate()).slice(-2, 8); // 拼接2位数日期
		var result = "";
		if(!flag){
			result = yearStr+"年"+monthStr+"月"+dayStr+"日";
		}else{
			result = yearStr+flag+monthStr+flag+dayStr;
		}
		return result;
	}

})
