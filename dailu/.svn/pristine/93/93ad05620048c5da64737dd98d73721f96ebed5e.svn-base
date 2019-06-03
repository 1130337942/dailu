$(function(){
	$('.doubledate').kuiDate({
			className:'doubledate',
			isDisabled: "0"  // 	isDisabled为可选参数，“0”表示今日之前不可选，“1”标志今日之前可选
	});
	$.post('hotelFilter',{'city':$('#des').val()+'市','filter_type':'3'},function(res){
		if(!res) return false;
			var outerStr = '';
			for(var key in res){
				var listStr = '';
				for(var i=0; i < res[key].length; i++){
					listStr += '<li><span type="brand_id" val='+ res[key][i].idV4+' class="filter">'+res[key][i].nameCn+'</span></li>';
				}
			outerStr+='<div class="brand_box clearfix">'+
					'	<h3>'+ key +'</h3>'+
					'	<ul class="brand_list fl">'+
						listStr+
					'	</ul>'+
					'</div>'  
			}               
			$('.allBrandDiv').html(outerStr);
				
	},'json')

	$('.list_wap .hotel_box').on('click','.area',function(){
			var zone_id = $(this).attr('zone_id');
			var query = {};
 				query.query_text =$('#loca').val();
 				$('.filter.active').each(function(){
 					var key = $(this).attr('type');
 					var val = $(this).attr('val')
 					query[key] = val;
 				})
				query.arrival_date = $('#arr_time').val();
				query.departure_date = $('#leave_time').val();
				query.city= $('#des').val()+"市";
				query.post= true;
				query.page_size= 20;
				query.zone_id= zone_id;
 			$.post('hotel',query,function(res){
 				if(!res) return false;
 				map.clearOverlays()
 				renderList(res)
 				setPagination(res.count);
 				renderMarker();

 			},'json')
	})

	$('#arr_time,#leave_time').on('change',function(event){
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
	})

	$('#leave_time,#arr_time').on('focus',function(event){
		if(event.target.id=='leave_time'){
			$('.kui_data_content_pane').css({'top': '98px','left':'494px'})
		}else{
			$('.kui_data_content_pane').css({'top': '98px','left':'230px'})
		}
	})

	var totnum = $('.totnum').text()
	
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

	$('.filter_more').on('click',function(){
		$(this).toggleClass('up');
		if($(this).hasClass('up')){
			$('.allBrandDiv').show()
			$(this).text('收起更多');
		}else{
			$('.allBrandDiv').hide()
			$(this).text('更多');
		}
	})

	$('.filter_topicmore').on('click',function(){
		$(this).toggleClass('up');
		if($(this).hasClass('up')){
			$('.filter_topic').height('auto');
			$(this).text('收起更多');
		}else{
			$('.filter_topic').height('40px');
			$(this).text('更多');
		}
	})

	$('.filterBox').on('click','.filter',function(){
		$('.filter_more').removeClass('up').text('更多');
		$('.allBrandDiv').hide()
	})
	$('html').on('click',function(event){
		var targetId = event.target.id
		if(targetId!='loca'){
			$('.business .businessBox').hide()
		}
		if(targetId!='arr_time' && targetId!='leave_time' ){
			$('#kui_d_pane').hide()
		}
		if(targetId!='filter_more'){
			$('.allBrandDiv').hide()
			$('#filter_more').text('更多').removeClass('up');
		}
	})
	var map = new BMap.Map("allmap");
	map.enableScrollWheelZoom();

	// 定义自定义覆盖物的构造函数  
	function SquareOverlay(point, text){
		this._center = point;
		this._text = text;
	}

	// 继承API的BMap.Overlay
		SquareOverlay.prototype = new BMap.Overlay();
		SquareOverlay.prototype.initialize = function(map){
					// 保存map对象实例
					this._map = map;

					var textLength = this._text.length
					// 创建div元素，作为自定义覆盖物的容器
					var div = document.createElement("div");
					div.style.position = "absolute";
					// 可以根据参数设置元素外观
					div.style.width = 13*textLength + "px";
					div.style.height = 20 + "px";
					div.style.color = "#2e94d3";
					div.style.lineHeight = "20px";
					div.style.whiteSpace = "nowrap";
					div.style.backgroundColor = "#fff";
					//让文字不被选中
					div.style.MozUserSelect = "none";
					div.style.fontSize = "12px";
					div.style.borderRadius = "3px";
					div.style.paddingLeft = "5px";
					// textNode1=document.createTextNode(this._),  
					div.appendChild(document.createTextNode(this._text));
					//创建一个文本节点 
					// 将div添加到覆盖物容器中
					map.getPanes().markerPane.appendChild(div);
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
					this._div.style.left = position.x +5 + "px";    
					this._div.style.top = position.y -24 + "px";    
					this._div.style.zIndex = -1;    
					
			}




		setPagination(totnum)				
 		renderMarker() //通过列表渲染marker
 		var currPoint = '';
 		$('.content_wap .hotel_box').on('mouseenter','.list',function(){
 			var center = {};
 			center.lng =$(this).attr('lng');
 			center.lat =$(this).attr('lat');
 			var point = new BMap.Point(center.lng, center.lat);
 			map.centerAndZoom(point, 12);
 			var allPoint =  map.getOverlays();
 			for(var i = 0;i<allPoint.length;i++){
 				if(allPoint[i].point.lng==center.lng && allPoint[i].point.lat==center.lat){
 					currPoint=allPoint[i];
 					currPoint.setAnimation(BMAP_ANIMATION_BOUNCE)
 					return false;
 				}
 			}
 		}).on('mouseleave','.list',function(){
 			currPoint.setAnimation(null);
 		})

 		$('.filterBox .list').on('click','.filter',function(){
 			if($(this).hasClass('title')) return false;
 			$(this).parents('.list').find('.filter').removeClass('active');
 			$(this).addClass('active')
 		})

 		

 		$('.list_wap .filter').on('click',function(){
 			var that =this;
 			setTimeout(function(){
 				if($(that).attr('val')=='RateDesc'){
 					$(that).addClass('active').removeClass('up').attr('val','RateAsc');
 				}else if($(that).attr('val')=='RateAsc'){
 					$(that).addClass('up').attr('val','RateDesc');
 				}	
 			},300)
 			
 		})


 		$(window).scroll(function() {  
 			var mapTop,mapLeft;
 			mapTop =  $('.content_wap').offset().top-$(window).scrollTop(); 
 			mapLeft = $('.content_wap .map_wap').offset().left-$(window).scrollLeft()
 			if(mapTop<=100){
 				$('.content_wap .map_wap').css({position:'fixed',top:'100px',left:mapLeft})
 			}else{
 				$('.content_wap .map_wap').css({position:'relative',top:'0px',left:0})
 			}
 		});  

 		$('.filterBox .loc_list').on('click','.locType',function(){
 			if($(this).hasClass('clickActive')){
 				$('.loc_list').addClass('hide');
 			}
 			else{
 				$('.loc_list').removeClass('hide')
 			}
 			
 			$(this).addClass('clickActive').siblings().removeClass('clickActive');

 			
 			if($(this).hasClass('clickActive')&& $('.loc_list').hasClass('hide')){
 				$(this).removeClass('clickActive');
 			}
 			var query = {};
 				query.type = $(this).attr('val');
				query.city= $('#des').val()+"市";
				switch(query.type)
				{
					case '商圈':
					var type = 'zone_id';
					break;
					case '行政区':
					var type = 'dis_id';
					break;
					case '机场/车站':
					var type = 'query_text';
					break;
					case '医院':
					var type = 'query_text';
					break;
					case '大学':
					var type = 'query_text';
					break;
					case '市内景点':
					var type = 'query_text';
					break;
					case '市外景点':
					var type = 'query_text';
					break;
					case '演出场馆':
					var type = 'query_text';
					break;
				}

 				$.post('position',query,function(res){
 					if (!Array.isArray(res)) return false;
 					var str = '';
 						if(type =='query_text'){
 							for(var i=0;i<res.length;i++){
 								str+= '<span class="filter" type ='+ type +' val='+res[i].Name+'>'+res[i].Name+'</span>'
 							}
 						}else{
 							for(var i=0;i<res.length;i++){
 								str+= '<span class="filter" type ='+ type +' val='+res[i].Id+'>'+res[i].Name+'</span>'
 							}
 						}
 						
 					$('.loc_box').html(str);
 				},'json')

 		})

 		$('.filterBox ,.list_wap .title').on('click','.filter',function(){
 				var query = {};
 				query.query_text =$('#loca').val();
 				$('.filter.active').each(function(){
 					var key = $(this).attr('type');
 					var val = $(this).attr('val')
 					query[key] = val;
 				})
				query.arrival_date = $('#arr_time').val();
				query.departure_date = $('#leave_time').val();
				query.city= $('#des').val()+"市";
				query.post= true;
				query.page_size= 20;
 			$.post('hotel',query,function(res){
 				if(!res) return false;
 				map.clearOverlays()
 				renderList(res)
 				setPagination(res.count);
 				renderMarker();

 			},'json')
 		})

 		$('.business .businessBox').on('click','.list span',function(){
 			var querytext = $(this).text();
 			$('.business .businessBox').hide();
 			$('#loca').val(querytext);
 			var query = {};
 				$('.filter.active').each(function(){
 					var key = $(this).attr('type');
 					var val = $(this).attr('val')
 					query[key] = val;
 				})
				query.arrival_date = $('#arr_time').val();
				query.departure_date = $('#leave_time').val();
				query.city= $('#des').val()+"市";
				query.post= true;
				query.page_size= 20;
				query.query_text =$('#loca').val();
 			$.post('hotel',query,function(res){
 				if(!res) return false;
 				map.clearOverlays()
 				renderList(res)
 				setPagination(res.count);
 				renderMarker();

 			},'json')

 		})

 		$('.filter input').on('change',function(){
 			var priceArr =[];
 			$('.filter input').each(function(){
 				priceArr.push($(this).val());
 			})
 			var val = priceArr.join(',')
 			$(this).parent('.filter').attr('val',val)
 			
 		})

 		$(window).on('resize',function(){
 			$('.content_wap .map_wap').css({position:'relative',top:'0px',left:0})
 		})

 		$('.nodata a').on('click',function(){
 			$('.list .filter').removeClass('active');
 			$('.list .bx').addClass('active');
 			var query = {};
				query.arrival_date = $('#arr_time').val();
				query.departure_date = $('#leave_time').val();
				query.city= $('#des').val()+"市";
				query.post= true;
				query.page_size= 20;
 			$.post('hotel',query,function(res){
 				if(!res) return false;
 				map.clearOverlays()
 				renderList(res)
 				setPagination(res.count);
 				renderMarker();
 			},'json')
 		})
 		$('.search_form .searchBtn').on('click',function(){
 			$('.businessBox').hide();
 			var query = {};
				query.arrival_date = $('#arr_time').val();
				query.departure_date = $('#leave_time').val();
				query.city= $('#des').val()+"市";
				query.post= true;
				query.page_size= 20;
				query.query_text= $('#loca').val();
 			$.post('hotel',query,function(res){
 				if(!res) return false;
 				window.location.reload();
 				/*map.clearOverlays()
 				renderList(res)
 				setPagination(res.count);
 				renderMarker();*/

 			},'json')

 		// 	$.post('theme',{'city':$('#des').val()+"市"},function(res){
			// 	if(!res) return false;
			// 	var specialStr = '<span class="filter active bx" type="theme_id" val="">不限</span>';
			// 	$(res).each(function(i,ele){
			// 		specialStr+='<span class="filter" type="theme_id" val='+ele.Id+'>'+ele.Name+'</span>'
			// 	})
			// 	$(".filter_topic .filter[type='theme_id']").remove();
			// 	$('.list.filter_topic').append(specialStr);
			// })

 			/*var query1={};
 				query1.city= $('#des').val()+"市"; 
 				query1.type= 'area'; 
 			$.post('position',query1,function(res){
 					if (!Array.isArray(res)) return false;
 					var str = '';
 							for(var i=0;i<res.length;i++){
 								str+= '<span class="filter" type="dis_id" val='+res[i].Id+'>'+res[i].Name+'</span>'
 							}
 					$('.loc_box').html(str);
 				},'json')

 			$('.filter').removeClass('active').not('.title').each(function(){
 				if($(this).text()=='不限'){
 					$(this).addClass('active');
 				}
 				if($(this).text()=='星级 '){
 					$(this).addClass('active');
 				}
 			})*/
 		})

 		$('.list_wap').on('click','.btn a ,.hot_tit',function(){
 			var hotel_id = $(this).parents('.list').find('.btn a').attr('hotel_id'); 
 			var arrival_date = $('#arr_time').val();
			var departure_date = $('#leave_time').val();
 			window.open(encodeURI('/portal/store/hoteldetail.html?hotel_id='+hotel_id+'&arrival_date='+arrival_date+'&departure_date='+departure_date));
 		})

 	function renderMarker (){  //地图上添加标记 marker
 		$('.content_wap .hotel_box .list').each(function(i,ele){
 			var lat = $(this).attr('lat');
 			var lng = $(this).attr('lng');
 			var hotelName = $(this).find('.info .hot_tit').html();
 			var center ; 
	 		if(i==0){
	 			center = new BMap.Point(lng, lat);
	 			map.centerAndZoom(center, 15);
	 		}

	 		var point = new BMap.Point(lng, lat);

	 		var mySquare = new SquareOverlay(point,hotelName);    

			var myIcon = new BMap.Icon("/static/v1/img/hotel_marker.png", new BMap.Size(20, 53)); //创建marker
			var marker = new BMap.Marker(point, {
				icon: myIcon
			});

			map.addOverlay(marker);              // 将标注添加到地图中\
			map.addOverlay(mySquare);
		})

 	}

 
 	var hotTemplate ='{{each list as value i}}\
 				<div class="b_wap">\
					<div class="tit">{{value.nameCn}}</div>\
					<div class="list">\
						{{each value.subHotelFilterInfos as item key}}\
 					  		{{if key<11}}\
							<span>{{item.nameCn}}</span>\
							{{/if}}\
						{{/each}}\
					</div>\
				</div>\
				{{/each}}'
 
 	function renderList (data){
 		$('.totnum').text(data.count);
 		if(!data.count){
 			$('.list_wap .nodata').show();
 		}else{
 			$('.list_wap .nodata').hide();
 		}
 		var templateStr = '';
 		var hotel = data.hotel;

 			var hotelListTemplate = '{{each hotel as value i}}\
 				<li lng="{{value.Detail.Longitude}}" lat="{{value.Detail.Latitude}}" class="list clearfix">\
						<div class="imgBox fl">\
							<img src="{{value.Detail.ThumbNailUrl}}" alt="">\
						</div>\
						<div class="info fl">\
							<div class="hot_tit" title="{{value.Detail.HotelName}}">{{value.Detail.HotelName}}</div>\
							<div class="keyword">\
								<span class="area" zone_id ="{{value.Detail.BusinessZone}}">{{value.Detail.BusinessZoneName}}</span>\
								<span>{{value.Detail.Category}}星级</span>\
							</div>\
							<div class="location">\
								{{value.Detail.Address}} \
							</div>\
							<div class="booking_time">{{value.Detail.book_time}}小时之前有人预订了该酒店</div>\
							<div class="service">\
								{{each value.Facilities as item key}}\
 										<span class="ico{{item.id}} ico" title="{{item.type}}"></span>\
 								{{/each}}\
							</div>\
						</div>\
						<div class="price_box fl">\
							<div class="point"><span>{{value.Detail.Review.Score}}</span> {{value.Detail.Review.comm}}</div>\
							<div class="pj">用户评价 {{value.Detail.Review.Count}}条</div>\
							<div class="td">“{{value.Detail.comment}}”</div>\
						</div>\
						<div  class="price"><span>¥{{value.LowRate}} </span>起</div>\
						<div class="btn"><a href="javascript:;" hotel_id="{{value.HotelId}}">查看详情</a></div>\
					</li>\
				{{/each}}'
 					var hotelListRender = template.compile(hotelListTemplate);
					var html = hotelListRender(data);
 					$('.list_wap .hotel_box').html(html)

 	}

 	function setPagination (totnum){   //设置翻页
 		if(!totnum){
 			$("#pagination").html('');
 			return false;
 		}
 		$("#pagination").pagination( {
 			pageCount:5,   
 			count:4,  
 			prevContent:'上一页',  
 			nextContent:'下一页', 
 			totalData: totnum,
 			showData: 20,
 			coping: true ,
 			callback:function (api){
			// api.getPageCount() 获取总页数
			// api.setPageCount(page) 设置总页数
		var index = api.getCurrent() //获取当前是第几页
		var query = {};
			$('.filter.active').each(function(){
 					var key = $(this).attr('type');
 					var val = $(this).attr('val')
 					query[key] = val;
 				})
			query.query_text =$('#loca').val();
			query.arrival_date = $('#arr_time').val();
			query.departure_date = $('#leave_time').val();
			query.city= $('#des').val()+'市';
			query.page= index;
			query.page_size= 20;
			query.post= true;
			$.post('hotel',query,function(res){
				map.clearOverlays()
				renderList(res);
				renderMarker();
				window.scrollTo(0,435);
			},'json')
		}

	})
 	};

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
