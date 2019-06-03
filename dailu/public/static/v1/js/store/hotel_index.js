$(function(){
	
		$('.doubledate').kuiDate({
			className:'doubledate',
			isDisabled: "0"  // 	isDisabled为可选参数，“0”表示今日之前不可选，“1”标志今日之前可选
		});
		$('#arr_time').val(getDate())
		$('#leave_time').val(getDateAfter_n('',1,'-'));

		$('#leave_time,#arr_time').on('change',function(event){
			var today = new Date().getTime();
			var date1 = new Date($('#arr_time').val().replace(/-/g,'/')).getTime();
			var date2 = new Date($('#leave_time').val().replace(/-/g,'/')).getTime();
			if(event.target.id=='arr_time' && date2<=date1){
				$('#leave_time').val(getDateAfter_n($('#arr_time').val(),1,'-'));
			}
			else if (event.target.id=='leave_time'&& date2<=date1 && date2>today){
				$('#arr_time').val(getDateAfter_n($('#leave_time').val(),-1,'-'));
			}
			else if (event.target.id=='leave_time'&& date2<=date1 && date2<=today ){
				$('#arr_time').val ($('#leave_time').val());
				$('#leave_time').val(getDateAfter_n($('#arr_time').val(),1,'-'));
			}
			else if(event.target.id=='leave_time'&&date2==today){
				$('#arr_time').val(getDate())
				$('#leave_time').val (getDateAfter_n('',1,'-'));
			}
		})

		$('#arr_time').on('focus',function(){
			$('.kui_data_content_pane').css({'left':'26px','top':'184px'})
		})
		$('#leave_time').on('focus',function(){
			$('.kui_data_content_pane').css({'left':'26px','top':'254px'})
		})

		$('#loca').on('focus',function(){
			$.post('hotelFilter',{'city':$('#des').val()+'市'},function(res){
				var hotList = {};
				hotList.list = res.hotelFilterInfos;
				var hotRender = template.compile(hotTemplate);
				var html = hotRender(hotList);
				$('.business .businessBox').html(html)

			},'json')
			$('.business .businessBox').show();
		})

		 $('.business .businessBox').on('click','span',function(){
 			var querytext = $(this).text();
 			$('.business .businessBox').hide();
 			$('#loca').val(querytext);
 		})

		$('html').on('click',function(event){
			if(event.target.id!='loca'){
				$('.business .businessBox').hide()
			}
			
		})



	var listTemplate = 	'{{each hotel as value i}}\
						<li class="list fl" hotel_id="{{value.HotelId}}">\
							<a href="javascript:;">\
								<div class="listImg">\
									<img src="{{value.Detail.ThumbNailUrl}}" alt="">\
								</div>\
								<div class="info">\
									<div class="tit">{{value.Detail.HotelName}} <span>¥<strong>{{value.LowRate}}</strong>起</span></div>\
									<div class="con">地址：{{value.Detail.Address}}</div>\
								</div>\
							</a>\
						</li>\
						{{/each}}'

	var areaTemplate = '{{each areaList as value i}}\
						<li class="list fl">\
						<div class="tit" dis_id={{value.dis_id}}>{{value.dis_name}}</div>\
						<div class="place_box">\
						{{each value.business as item key}}\
						<span class="place" bus_id={{item.bus_id}}>{{item.bus_name}}</span>\
						{{/each}}\
						</div>\
						</li>\
						{{/each}}'


 	var hotTemplate ='{{each list as value i}}\
 				<div class="b_wap">\
					<div class="tit">{{value.nameCn}}</div>\
					<div class="">\
						{{each value.subHotelFilterInfos as item key}}\
 					  		{{if key<11}}\
							<span>{{item.nameCn}}</span>\
							{{/if}}\
						{{/each}}\
					</div>\
				</div>\
				{{/each}}'

						
	$('.hot_hotel .tit_right span').on('click',function(){
		if($(this).hasClass('active')){
			return  false;
		}else{
			$(this).addClass('active').siblings().removeClass('active')
		}
		var that= this;
		var query ={};
			query.city = $(this).text()+"市";
			query.departure_date =$('#leave_time').val()
			query.arrival_date =$('#arr_time').val()
			query.page_size =6;
			query.type ='ture'
			$.post("hotel",query,function(res){
			res.hotel==false?alert('查询失败'):'';
    	var hotelRender = template.compile(listTemplate);
					var html = hotelRender(res);
					$(that).parents('.wap').find('ul.hot_box').html(html)
 			}, "json");
		})

	$('.hotel_advice .dest_city select').on('change',function(){
		var that= this;
		var query ={};
			query.city = $(this).val()+"市";
			query.departure_date =$('#leave_time').val()
			query.arrival_date =$('#arr_time').val()
			query.page_size =4;
			query.type ='ture'
			$.post("hotel",query,function(res){
				res.hotel==false?alert('查询失败'):'';
    	var hotelRender = template.compile(listTemplate);
					var html = hotelRender(res);
					$(that).parents('.wap').find('ul.advice_box').html(html)
					
 			}, "json");

			$.post('theme',{'city':$(this).val()+"市"},function(res){
				if(!res) return false;
				var specialStr = '';
				$(res).each(function(i,ele){
					if(i<6){
						specialStr+='<span type='+ ele.Id +'>'+ ele.Name +'</span>'
					}
				})
				$('.hotel_advice .tit_right').html(specialStr);
				$('.hotel_advice .tit_right span').eq(0).addClass('active');
			})

	})

	$('.hotel_advice .tit_right').on('click','span',function(){
		if($(this).hasClass('active')){
			return  false;
		}else{
			$(this).addClass('active').siblings().removeClass('active')
		}
		var that= this;
		var query ={};
			query.city = $(this).parent('.tit_right').siblings('.dest_city').find('select').val()+"市";
			query.departure_date =$('#leave_time').val()
			query.arrival_date =$('#arr_time').val()
			query.page_size =4;
			query.type ='ture';
			query.theme_id = $(this).attr('type');
			$.post("hotel",query,function(res){
				res.hotel==false?alert('查询失败'):'';
    	var hotelRender = template.compile(listTemplate);
					var html = hotelRender(res);
					$(that).parents('.wap').find('ul.advice_box').html(html)
 			}, "json");
		})

	$('.hotel_list .tit_right span').on('click',function(){
		if($(this).hasClass('active')){
			return  false;
		}else{
			$(this).addClass('active').siblings().removeClass('active')
		}
		var that= this;
		var query ={};
			query.city_name = $(this).text();
			$.post("citySelect",query,function(res){
			var data = {};
				data.areaList = res;
    		var areaRender = template.compile(areaTemplate);
				var html = areaRender(data);
				$(that).parents('.wap').find('.hotelLsit_box ul').html(html)
 			}, "json");

	})

	$('.leftForm .formList .searchBtn').on('click',function(){
		var query ={};
			query.city = $('#des').val()+'市';
			query.arrival_date = $('#arr_time').val();
			query.departure_date= $('#leave_time').val();
			query.query_text= $('#loca').val();
			query.post= true;
				$.post('hotel',query,function(res){
				if(res.hotel){
					window.location.href='/portal/store/hotelList.html'
				}else{
					alert('未查询到酒店，请核实查询信息是否正确')
				}
				
			},'json')
	})

	$('.hotelLsit_box').on('click','.list .place_box .place',function(){
		var query ={};
			query.post= true;
			query.city = $(this).parents('.hotel_list').find('.tit_right .active').text()+'市';
			query.arrival_date = $('#arr_time').val();
			query.departure_date= $('#leave_time').val();
			query.zone_id = $(this).attr('zone_id');
				$.post('hotel',query,function(res){
				if(res.hotel){
					window.location.href='/portal/store/hotelList.html'
				}else{
					alert('未查询到酒店，请核实查询信息是否正确')
				}
				
			},'json')

	})

	$('.wap ul').on('click','.list a',function(){
		var hotel_id = $(this).parents('li.list').attr('hotel_id');
		var arrival_date = getDateAfter_n('',1,'-')
		var departure_date = getDateAfter_n('',2,'-')
			window.location.href= '/portal/store/hoteldetail.html?hotel_id='+hotel_id+'&arrival_date='+arrival_date+'&departure_date='+departure_date;
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