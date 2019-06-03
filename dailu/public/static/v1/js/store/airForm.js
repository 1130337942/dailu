$(function(){
	var IdCardReg = /(^\d{15}$)|(^\d{17}([0-9]|X)$)/;
	var phoneReg = /^1[3456789]\d{9}$/;
	var emailReg = /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/;
	var passengerNum =  $('.passenger .per_list').length;
	var airMsg = sessionStorage.getItem("airMsg"); 
		airMsg = JSON.parse(airMsg);
	var adult_price , child_price , ticket_price, bkMsg, personInfo ,arf;
	var priceTagArr = [];
	var childNo= 0;
	var adultNo=0; 
	var invoicePrice= 0;
	var passengerPass= true;
	$('.wap.place').citySelect({prov:"浙江", city:"杭州", dist:"滨江"});
	$.post('flightBK',airMsg,function(res){
			if(!res.status) timeoutJump();			
			bkMsg = res.data;
			priceTagArr = bkMsg.result.priceInfo.priceTag;
			arf = bkMsg.result.priceInfo.arf*1 + bkMsg.result.priceInfo.tof*1;
			invoicePrice= bkMsg.result.expressInfo.price;
			console.log(priceTagArr)
		    adult_price = bkMsg.result.extInfo.ticketPirce-0;
		    child_price = priceTagArr.CHI[0].viewPrice-0;
			var str = '<div class="title">'+ bkMsg.result.extInfo.startTime+' <span class="city">'+bkMsg.result.flightInfo[0].dptCity+'-'+bkMsg.result.flightInfo[0].arrCity+'</span></div>'+
				'<div class="info">'+bkMsg.result.flightInfo[0].carrierName+ ' ' +airMsg.airtype+'  |  '+bkMsg.result.flightInfo[0].bcbcn+'</div>'+
				'<div class="port clearfix">'+
					'<div class="leave fl">'+
					'<div class="time">'+bkMsg.result.flightInfo[0].dptTime+'</div>'+
					'<div class="place">'+bkMsg.result.flightInfo[0].dptAirport + bkMsg.result.flightInfo[0].dptTerminal +'</div>'+
				'</div>'+
				'<div class="middle fl">'+
				'</div>'+
				'<div class="dest fr">'+
					'<div class="time">'+bkMsg.result.flightInfo[0].arrTime +'</div>'+
					'<div class="place">'+bkMsg.result.flightInfo[0].arrAirport  + bkMsg.result.flightInfo[0].arrTerminal+'</div>'+
					'</div>'+
				'</div>';
			var receiverStr = '';
			var recObj = bkMsg.result.expressInfo.receiverType;
			for( var key in recObj ){
				receiverStr+='<option value='+ key +'>'+recObj[key]+'</option>'
			}
				
				// console.log(receiverStr)
				$('.receiverType').html(receiverStr);
				$('.airInfo .temp').html(str)
				$('.price_info .ticket_price.adult_p').html('¥ '+ adult_price+'/<em>人</em>')
				$('.price_info .ticket_price.child_p').html('¥ '+ child_price+'/<em>人</em>')
				$('.invoicePrice').text('¥ '+invoicePrice);
				calcPrice()
	},'json')

	$('.linkMam .list_box').height()==0?$('.linkMam').css({'height':'auto'}):'';
	$('.addPerson .add').on('click',function(){
		var str = '<div class="per_list">'+
						'<div class="wap">'+
						'	<span class="tit">姓名*</span><input type="text" class="passengerName" placeholder="请输入姓名">'+
						'	<span class="per_type">'+
						'		<select name="" id="" class="paType" >'+
						'			<option value="0">成人</option>'+
						'			<option value="1">儿童</option>'+
						'		</select>'+
						'	</span>'+
						'	<span class="gender">'+
						'		<select class="p_gender" name="" id="">'+
						'			<option value="1">男</option>	'+
						'			<option value="0">女</option>	'+
						'		</select>'+
						'	</span>'+
						'</div>'+
						'<div class="wap">'+
						'	<span class="tit">证件类型*</span>'+
						'	<span class="card_type">'+
						'		<select name="" id="" class="cardType" >'+
						'			<option value="NI">身份证</option>'+
						'			<option value="PP">护照</option>'+
						'			<option value="ID">其它</option>'+
						'		</select>'+
						'	</span>'+
						'</div>'+
						'<div class="wap">'+
						'	<span class="tit">证件号码*</span>'+
						'	<input placeholder="请输入证件号码" type="text" class="cardNum">'+
						'</div>'+
						'<div class="wap">'+
						'	<span class="tit"></span>'+
						'	<i class="checkBox add_user"></i>保存为常用乘客'+
						'</div>'+
						'<div class="delPerson">删除</div>'+
					'</div>	'
			$(this).parent('.addPerson').before(str);
			$('.passenger .per_list .delPerson').removeClass('hide');
		
			calcPrice();
	})

	$('.passenger').on('change','.paType',function(){
		calcPrice();
	})

	$('.formWap').on('click','.per_list .delPerson',function(){
		$(this).parent('.per_list').remove();
		passengerNum =  $('.passenger .per_list').length;
	
		calcPrice();
		if(passengerNum<=1){
			$('.passenger .per_list .delPerson').addClass('hide');
			return false;
		}
		
	})

	$('.formWap').on('click','.wap .checkBox',function(){
		$(this).toggleClass('on');
		calcPrice();
	})

	$('.safety select').on('change',function(){
		calcPrice();

	})
 
	$('.affirm  .totPrice a').on('click',function(){
			passengerPass = false;
			personInfo = {};
			personInfo.passengers= [];
			$('.passenger .per_list').each(function(i,ele){
				var temp={};
					temp.name = $(this).find('input.passengerName').val();
					temp.ageType = $(this).find('select.paType').val();
					temp.type = temp.ageType==1?'儿童':'成人';
					temp.cardType = $(this).find('select.cardType').val();
					temp.cardNo = $(this).find('input.cardNum').val();
					temp.sex = $(this).find('select.p_gender').val();
					personInfo.passengers.push(temp);
			})
			personInfo.contact=$('.linkMan_info input.linkName').val();
			personInfo.contactPreNum='86';
			personInfo.contactMob=$('.linkMan_info input.linkPhone').val();
			personInfo.contactEmail=$('.linkMan_info input.email').val();
			personInfo.result = bkMsg.result;
			personInfo.xcd = '';
			if(personInfo.contact.length<1 || !phoneReg.test(personInfo.contactMob)){
				layer.msg('联系人姓名或者手机号码错误',{
								time:2000,
								offset:'200px'
							})
					return false;
			}

			$(personInfo.passengers).each(function(i,ele){
				if(this.cardNo.length<1 || (this.cardType=='NI'&& !IdCardReg.test(this.cardNo)) ){
					layer.msg('乘机人'+(i+1)+' 证件号码错误',{
								time:2000,
								offset:'200px'
							})
					return false;
				}
				if(this.name.length<2){
					layer.msg('乘机人'+(i+1)+' 姓名有误',{
								time:2000,
								offset:'200px'
							})
					return false;
					}
				passengerPass = true;
			})


			if($('.checkBox.invoice').hasClass('on')){
				personInfo.xcd = '1';
				personInfo.receiverTitle= $('.receiverTitle').val().trim();
				personInfo.receiverType= $('.receiverType').val();
				personInfo.taxpayerId= $('.taxpayerId').val();
				personInfo.sjr= $('.sjr').val().trim();
				personInfo.sjrPhone=$('.sjrPhone').val().trim();
				personInfo.address=$('#province').val()+$('#city').val()+$('#area').val()+$('.address').val();
				if(personInfo.receiverTitle<1 ||personInfo.taxpayerId<1 || personInfo.sjr<1){
						layer.msg('发票信息填写有误，请核实',{
									time:2000,
									offset:'200px'
								})
						return false;
				}
			}
			if(!passengerPass){
				return false ;
			}
			
			
			
			var perStr='';
			for(var i=0;i<personInfo.passengers.length;i++){

					perStr +=' <li class="list clearfix">'+
						'	<div class="tit">'+
						'		<div class="name fl">'+
						'			乘机人姓名	'+
						'		</div>'+
						'		<div class="type fl">'+
						'			乘机人类型'+
						'		</div>'+
						'		<div class="cardNum fl">'+
						'			乘机人证件号'+
						'		</div>'+
						'	</div>'+
						'	<div class="wap">'+
						'		<div class="name fl">'+personInfo.passengers[i].name+
						'		</div>'+
						'		<div class="type fl">'+personInfo.passengers[i].type+
						'		</div>'+
						'		<div class="cardNum fl">'+personInfo.passengers[i].cardNo+
						'		</div>'+
						'	</div>'+
						'</li>'
			}
			$('.preview_wap  .passenger ul').html(perStr);
			$('.preview_wap .link_man .name').text(personInfo.contact).siblings('.tel').text(personInfo.contactMob).siblings('.email').text(personInfo.contactEmail);
			$(window).scrollTop(0)
			$('.preview_wap').removeClass('hide').siblings('.formWap').addClass('hide');
	})

	$('.totSubmit').on('click',function(){
		$.post('orderCreate',personInfo,function(res){
			if(res.status==true){
				window.location.href="/portal/store/trafficPay.html?traffic_id="+res.traffic_id+"&type=flight";
			}else{
				layer.msg('订单提交失败，请联系管理员处理',{
								time:2000,
								offset:'200px'
				})
			}
		},'json')
	})



	function calcPrice (){
		var totmoney = 0;
		adultNo =childNo = 0;
		$('.passenger .per_list select.paType').each(function(){

			if($(this).val()=='0'){
				adultNo ++
			}else{
				childNo++;
			}
		})

		$('.airInfo .price_info .adult .num').text('x '+adultNo);
		$('.airInfo .price_info .child .num').text('x '+childNo);
		$('.airInfo .price_info .arf .num').text('x '+(adultNo));


		totmoney = adultNo * (adult_price+arf)   + childNo*(child_price);
		var wipe = $('.wipe .checkBox.invoice').hasClass('on');  
		if(wipe){
			totmoney += invoicePrice ;
		}
		totmoney = totmoney.toFixed(2);
		$('.affirm .totPrice strong').html('¥ '+totmoney)
		$('.tot_wap .totPrice').html('¥ '+totmoney)
		$('.totmoney .price').html('¥ '+totmoney)
	}

function timeoutJump (){
	$('.cantBook').show();
	var count =3;
	$('.cantBook  .tips a').on('click',function(){
		window.location.href=document.referrer;
	})

	setInterval(function(){
		if(count==1){
			window.location.href=document.referrer;
			return false ;
		}else{
			count--;
			$('.cantBook  .tips span').text(count);	

		}
	},1000)

}
	
})