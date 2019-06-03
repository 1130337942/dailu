$(function(){

	var sliderArr = [];
	var arrival_date=$('#arr_time').val();
	var departure_date=$('#leave_time').val();
	// 翻页
	$("#pagination").pagination( {
		pageCount:5,  
        coping:false,  
        count:1,  
        prevContent:'上一页',  
        nextContent:'下一页', 
        totalData: 100,
    	showData: 6,
   		coping: true ,
        callback:callbackAjax  
	});
                
	function callbackAjax (api){
			// api.getPageCount() 获取总页数
			// api.setPageCount(page) 设置总页数
		var index = api.getCurrent() //获取当前是第几页
		console.log(index)
	}
	// 日历
	$('.doubledate').kuiDate({
			className:'doubledate',
			isDisabled: "0"  // 	isDisabled为可选参数，“0”表示今日之前不可选，“1”标志今日之前可选
	});
	$('#arr_time').val(arrival_date);
	$('#leave_time').val(departure_date);

	$('.hotel_list').on('click',' .preview',function(){
		$(this).siblings('.slideWap').toggleClass('hide');
		$(this).parents('.list').toggleClass('hov');
	})

	$('.bottom_info .left_img').on('click','.img_list',function(){
		var this_big = $(this).find('img').attr('src').replace('120_120','350_350');
		$(this).find('span').addClass('bd3');
		$(this).siblings('.img_list').find('span').removeClass('bd3');
		$('.hetel_show .big_img img').attr('src',this_big);
	})	

	$('.title_bar a').on('click',function(){
		var selecter = $(this).attr('type');
		var top = $('.'+selecter).offset().top -100;
		$("html,body").animate({scrollTop:top},"slow");  
	})

	$('#leave_time,#arr_time').on('focus',function(event){
		if(event.target.id=='leave_time'){
			$('.kui_data_content_pane').css({'top': '55px','left':'702px'})
		}else{
			$('.kui_data_content_pane').css({'top': '55px','left':'502px'})
		}
	})

	$('#leave_time,#arr_time').on('change',function(event){
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
		query.hotel_id = $('.right_info .title .tit').attr('hotel_id');
		query.arrival_date = $('#arr_time').val();
		query.departure_date =$('#leave_time').val();
		query.map_post = true;
		$.post('getHotelDetail',query,function(res){
			if(!res.Rooms) return false;
				sliderArr = res.highImage;
			var hotelListRender = template.compile(listTemplate);
			var html = hotelListRender(res);
			$('.hotel_list ul').html(html)
			arrival_date=query.arrival_date
			departure_date= query.departure_date
		},'json')
	})
	
	$('.filterItem .options li').on('click',function(){
		var queryType = '';
		$(this).parents('.filterItem').find('span').text($(this).text())
		$(this).parents('.options').hide()
	})

	$('.nearby .nearby_list').on('click',function(){
		var hotel_id =  $(this).find('.n_name').attr('hotel_id');
		var arrival_date = $('#arr_time').val();
		var departure_date = $('#leave_time').val();
		window.open('/portal/store/hoteldetail.html?hotel_id='+hotel_id+'&arrival_date='+arrival_date+'&departure_date='+departure_date);  
	});

	$('.right_info .loca span ,.nearby_more a').on('click',function(event){
		var query ={};
		if(event.target.id=="area"){
			query.zone_id = $(this).attr('zone_id');
		}else{
			query.rate = $(this).attr('price')+','+ ($(this).attr('price')*1+100);
		}
			query.city = $('#q_city').attr('city')+'市';
			query.arrival_date = $('#arr_time').val();
			query.departure_date= $('#leave_time').val();
			query.post= true;

				$.post('hotel',query,function(res){
				if(res.hotel){
					window.location.href='/portal/store/hotelList.html'
				}else{
					alert('未查询到酒店，请核实查询信息是否正确')
				}
				
			},'json')
	})

	$('.hetel_show .big_img').on('click',function(){
		$('#slideshow').show();
		if(sliderArr.length && sliderArr.length>0){
			sliderInit(sliderArr)
		}else{
			var query = {};
			query.hotel_id = $('.right_info .title .tit').attr('hotel_id');
			query.arrival_date = $('#arr_time').val();
			query.departure_date =$('#leave_time').val();
			query.map_post = true;
			$.post('getHotelDetail',query,function(res){
				if(!res.highImage) return false;
				sliderArr = res.highImage;
				sliderInit(sliderArr)
			},'json')
		}
		
		
	})

	$('.hotel_list').on('click','.zt.can .destine',function(){
		var that = this ;
		var toHotelForm ={};
			toHotelForm.img = $('.big_img img').attr('src');
			toHotelForm.hotelName = $('.right_info .title .tit').text();
			toHotelForm.phone = $('.right_info .title .tit').attr('phone');
			toHotelForm.place=$('.right_info .title .loca').text();
			toHotelForm.roomType = $(this).parents('.list').find('.tit').text()+' - '+$(this).parent('.can').siblings('.zc').text();
			toHotelForm.area = $(this).parents('.list').find('.service span:eq(0)').text();
			toHotelForm.bad=$(this).parents('.list').find('.service span:eq(1)').text();
			toHotelForm.floor=$(this).parents('.list').find('.service span:eq(3)').text();
			toHotelForm.perNum=$(this).parents('.list').find('.service span:eq(2)').text();
			toHotelForm.other=$(this).parents('.list').find('.service span:eq(4)').text();
			toHotelForm.tell=$(this).parents('.hotel_list').siblings('.hotelInfo_box').find('.list .tell').text();
			toHotelForm.arrival_date = arrival_date;
			toHotelForm.departure_date = departure_date;
			toHotelForm.tell=$(this).parents('.hotel_list').siblings('.hotelInfo_box').find('.list .tell').text();
			toHotelForm.price=$(this).parent('.zt').siblings('.price').text().substr(1).trim();
			toHotelForm.hotel_id =$('.right_info .title .tit').attr('hotel_id');
			toHotelForm.room_type =$(this).parents('.slide_list').find('.cp').attr('room_type');
			toHotelForm.rate_plan =$(this).parents('.slide_list').find('.cp').attr('rate_plan');
			toHotelForm.total_price =$(this).parents('.slide_list').find('.cp').attr('total_price');
			toHotelForm.rooms_number =1;
			toHotelForm.payment_type =$(this).parents('.slide_list').find('.cp').attr('payment_type');
			toHotelForm.pay_type =$(this).siblings('span').text();
			var query = toHotelForm;
			$.post('hotelVal',query,function(res){
				if(res.ResultCode=='OK'){
					toHotelForm.room_id = $(that).parents('.list').find('.preview .tit').attr('room_id');
					toHotelForm = JSON.stringify(toHotelForm)
					sessionStorage.setItem("toHotelForm",toHotelForm); 
					window.location.href= '/portal/store/hotelform.html';
				}else{
					alert('酒店预订失败，请重新查询后再试')
				}
				
			},'json')
			
	})


	// 地图
		var map1 = new BMap.Map("map_s");
		    map1.enableScrollWheelZoom();
		var center = new BMap.Point($('.title .loca span').attr('lng'),$('.title .loca span').attr('lat'));
	 		map1.centerAndZoom(center, 15);
	 	var myIcon = new BMap.Icon("/static/v1/img/hotel_marker.png", new BMap.Size(20, 53)); //创建marker
		var marker1 = new BMap.Marker(center, {
							icon: myIcon
						});
		var marker2 = new BMap.Marker(center, {
							icon: myIcon
						});
		map1.addOverlay(marker1);              // 将标注添加到地图中\
		var map2 = new BMap.Map("bigmap");
		    map2.enableScrollWheelZoom();
		    // center = new BMap.Point(120.219548, 30.508933);
	 		map2.centerAndZoom(center, 15);

	 	map2.addOverlay(marker2);   




	 		// 定义自定义覆盖物的构造函数  
			function SquareOverlay(point, text){
					    this._center = point;
					    this._text = text;
					
					}
					
					// 继承API的BMap.Overlay
					SquareOverlay.prototype = new BMap.Overlay();
					SquareOverlay.prototype.initialize = function(map2){
					   			// 保存map对象实例
					   			this._map = map2;
					
					   			var textLength = this._text.length
					   			// 创建div元素，作为自定义覆盖物的容器
					   			var div = document.createElement("div");
					   			div.style.position = "absolute";
					   			// 可以根据参数设置元素外观
					   			div.style.width = 12*textLength + "px";
					   			// div.style.height = 20 + "px";
					   			div.style.color = "#333";
					   			div.style.whiteSpace = "nowrap";
					   			div.style.backgroundColor = "#fff";
									//让文字不被选中
								div.style.MozUserSelect = "none";
								div.style.fontSize = "12px";
								div.style.borderRadius = "4px";
								div.style.overflow = "hidden";
							
							var title = document.createElement("div");
								title.style.width = "330px";
					   			title.style.height = "36px";
					   			title.style.lineHeight = "36px";
					   			title.style.paddingLeft = "20px";
					   			title.style.fontWeight = "600";
					   			title.appendChild(document.createTextNode('联系地址'));
								div.appendChild(title);

							var loca = document.createElement("div");
								loca.style.minWidth = "330px";
					   			loca.style.height = "36px";
					   			loca.style.lineHeight = "36px";
					   			loca.style.paddingLeft = "20px";
					   			loca.style.borderTop = "1px solid #e5e5e5";
					   			loca.appendChild(document.createTextNode(this._text));
								div.appendChild(loca);

							
									//创建一个文本节点 
					   			// 将div添加到覆盖物容器中
					   			map2.getPanes().markerPane.appendChild(div);
					   			// 保存div实例
					   			this._div = div;
					   			// 需要将div元素作为方法的返回值，当调用该覆盖物的show、
					   			// hide方法，或者对覆盖物进行移除时，API都将操作此元素。
					   			return div;
					   		}
						// 添加自定义覆盖物   
					
						SquareOverlay.prototype.draw = function(){    
					// 根据地理坐标转换为像素坐标，并设置给容器    
							var position = this._map.pointToOverlayPixel(this._center);
							this._div.style.left = position.x - parseInt(this._div.style.width)/2  + "px";    
							this._div.style.top = position.y-110 + "px";    
							this._div.style.zIndex = -1;    
					
						}

						var mySquare = new SquareOverlay(center,'地址:'+$('.right_info .loca').text()); 
						map2.addOverlay(mySquare);
				
					

			var listTemplate = 	'{{each Rooms as value i}}\
					<li class="list hov">\
							<div class="preview up">\
								<div class="roomimg_head">\
								<img src="{{value.ImageUrl}}" alt=""></div>\
								<div class="tit" room_id="{{value.RoomId}}">{{value.Name}}</div>\
								<div class="service">\
									<span>房间{{value.Area}}㎡</span>\
									<span>{{value.BedType}}</span> \
									<span>可住人数：{{value.Capcity}}人</span> \
									<span>楼层：{{value.Floor}}</span> \
									<span>{{value.Broadnet}}</span>\
								</div>\
								<div class="short">\
									<div class="price">¥ {{value.lowPrice}} <em>起</em></div>\
									<div class="showBtn">共{{value.num}}个产品<i class="ico"></i></div>\
								</div>\
							</div>\
							<div class="slideWap hide">\
								<div class="slide_title">\
									<span class="cp">产品名称</span>\
									<span class="gy">供应商</span>\
									<span class="zc">早餐</span>\
									<span class="qx">取消规则</span>\
									<span class="rj">日均价</span>\
								</div>\
								{{each value.RatePlans as item key}}\
													<div class="slide_list">\
													<span class="cp" hotel_code="{{item.HotelCode}}" room_type="{{item.RoomTypeId}}" payment_type="{{item.PaymentType}}" rate_plan="{{item.RatePlanId}}" total_price="{{item.TotalRate}}">{{item.RatePlanName}}</span>\
													<span class="gy">艺龙</span>\
													<span class="zc">{{item.ValueAdd.TypeCode}}</span>\
													<span class="qx">\
														{{item.PrepayRule.ChangeRule?item.PrepayRule.ChangeRule:(item.GuranteeRule.ChangeRule?item.GuranteeRule.ChangeRule:"免费取消")}}\
													</span>\
													<span class="rj price">¥ {{item.AverageRate}}</span>\
													{{if item.Status && item.NightlyRates[0].Status}}\
													<span class="zt can" ><div class="destine" title="预定酒店时需提前在线支付房费" ><a href="javascript:;">预订</a><span class="qx_type">{{#item.payType}}</span></div>{{if item.CurrentAlloment !=0 }}<span class="last">仅剩{{item.CurrentAlloment}}间</span>{{/if}}</span>\
													{{else}}\
													<span class="zt not" ><div class="destine" title="此房型已售完"><a href="javascript:;">已售完</a><span class="qx_type">{{#item.payType}}</span></div></span>\
													{{/if}}\
													</div>\
												{{/each}}\
									<div class="otherInfo">\
										<div class="otherImg">\
										{{each value.trueImg.small as list j}}\
												<div class="preview_img">\
													<img class="img_s" src="{{list}}" alt="">\
													<div class="bigImg">\
														<img class="" src="{{value.trueImg.big[j]}}" alt="">\
													</div>\
												</div>\
											{{/each}}\
										</div>\
									</div>\
								</div>\
							</li>\
							{{/each}}'


	function sliderInit (sliderArr){
		var index = 0;
		var listNun =0 ;
		var MaxlistNun = Math.ceil(sliderArr.length/10)-1;
		$('#slideshow .box_bigimg img').attr('src',sliderArr[0]);
		var listStr = '';
		$(sliderArr).each(function(i,ele){
			listStr+='<li index='+i+' class="fl"><img src='+ele+' alt=""></li>'
		})
		$('#slideshow .imglist ul').width(121*sliderArr.length+'px').html(listStr).find('li').eq(0).addClass('active');
		$('#slideshow .imglist li').on('click',function(){
			index =  $(this).attr('index');
			$(this).addClass('active').siblings().removeClass('active');
			$('#slideshow .box_bigimg img').attr('src',sliderArr[index]);
		})
		$('.topWap .nextBtn').on('click',function(){
			if(index<sliderArr.length){
				index++
				$('#slideshow .box_bigimg img').attr('src',sliderArr[index]);
				$('.botomWap .imglist li').eq(index).addClass('active').siblings().removeClass('active')
			}
			if(index % 10 == 0){ //判断是不是10的整数倍
				$('.imglist_next').click();
			}

		})

		$('.topWap .prevBtn').on('click',function(){
			if(index>0){
				index--
				$('#slideshow .box_bigimg img').attr('src',sliderArr[index]);
				$('.botomWap .imglist li').eq(index).addClass('active').siblings().removeClass('active')

			}
			if((index+1) % 10 == 0){ //判断是不是10的整数倍
				$('.imglist_prev').click();
			}
		})

		$('.botomWap .imglist_next').on('click',function(){
			if(listNun<MaxlistNun){
				listNun++
				$('.botomWap .imglist ul').css({'transform':'translateX('+(-1210*listNun) +'px)'})
			}
			
		})

		$('.botomWap .imglist_prev').on('click',function(){
			if(listNun>0){
				listNun--
				$('.botomWap .imglist ul').css({'transform':'translateX('+(-1210*listNun) +'px)'})
			}
		})

		$('#slideshow .slider_close').on('click',function(){
			$('#slideshow').hide();
		})
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



