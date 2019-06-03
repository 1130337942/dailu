$(function(){
	var hotel_id = getUrlParam('hotel');
	var icity = getUrlParam('icity');
	var iday = getUrlParam('iday');
	var trip = getUrlParam('trip');
	var arrival_date = getDateAfter_n(getNowFormatDate(),1,'-')
	var departure_date = getDateAfter_n(getNowFormatDate(),2,'-')
	var map_post= true
	var postUrl;
	var query ={};
	var this_uid = getCookie('uid');	
	if(hotel_id){ //调艺龙接口
		postUrl = '/portal/store/getHotelDetail'
		query.hotel_id = hotel_id;
		query.arrival_date = arrival_date;
		query.departure_date = departure_date;
		query.map_post = true;
		$.post(postUrl,query,function(res){
			if(res.status==false){
				layer.msg('暂无详情',{
					time:1000
				})
				return false;
			}
			renderData(res,false)
			return false;
		},'json')

	}else{
		query.this_city_index = icity;
		query.day_arry_index = iday;
		query.trip_id = trip;

		$.post('../Detail/hEdited',query,function(res){
			if(res.status==false){
				layer.msg('暂无详情',{
					time:1000
				})
				return false;
			}
			renderData(res.data,true)
			return false;
		},'json')
		
	}


	$('.header .prevPage').on('click',function(){
			window.history.go(-1);
	})
		
})

function renderData (res,edit){
	$('.banner_img .imgCount').html(res.highImage.length+'张')
		var imgArr = res.highImage;
		var bannerStr = '';
		var Category = '';
		$(imgArr).each(function(){
			bannerStr+= '<img src='+ this +' alt="">'
		})
		$('.banner_img .imgCount').before(bannerStr);

		if(edit){
			$('.detail_info').find('.detail_tit .inner_tit').text(res.hotel_name).end()
						  .find('.address').text(res.address).end()
						  .find('.introduce').text(res.Features);
			$('.esta_info').html(res.GeneralAmenities);
			Category = res.Category;
			$('.hotel_map').hide();
		}else{
				$('.detail_info').find('.detail_tit .inner_tit').text(res.Detail.HotelName).end()
							  .find('.address').text(res.Detail.Address).end()
							  .find('.introduce').text(res.Features);
				Category = res.Detail.Category;
				$('.adress_map').html(res.Detail.Address);
				$('.esta_info').html(res.Detail.GeneralAmenities);
				var Amap = new AMap.Map("amap", {
            	      center: [res.Detail.Longitude,res.Detail.Latitude],
            	      zoom: 14,
            	      
            	    });	
				// 创建一个 Marker 实例：
				var marker = new AMap.Marker({
				    position: new AMap.LngLat(res.Detail.Longitude,res.Detail.Latitude),   // 经纬度对象，也可以是经纬度构成的一维数组[116.39, 39.9]
				    title: res.Detail.HotelName
				});
				
				// 将创建的点标记添加到已有的地图实例：
				Amap.add(marker);
		}

		 switch (Category+'') {
                        case '0':
                           $('.hotel_type').text('客栈');
                            break;
                        case '1':
                         	$('.hotel_type').text('民宿');
                            break;
                        case '2':
                         	$('.hotel_type').text('客栈');
                            break;
                        case '3':
                        	 $('.hotel_type').text('舒适型');
                            break;
                        case '4':
                         	$('.hotel_type').text('高档型');
                            break;
                        case '5':
                         	$('.hotel_type').text('豪华型');
                            break;
                        case 'A':
                        	 $('.hotel_type').text('公寓型');
                            break;
                    }
                    
		$('.banner_img ,.commemt_box .comment_in').on('click','img',function(){
			var str = '';
			$(this).parent('div').find('img').each(function(i,ele){
				str+= '<img class="swiper-slide" src='+ $(ele).attr('src') +' >'
			})
			$('.sliderIMg').html(str);
			var swiper = new Swiper('.swiper-container', {
    			lazyLoading:true,
    			speed:1000,
    			observer: true,
    			observeParents: true,
    			autoHeight:true,
			});
			$('.sliderbox').show();
		})

		$('.sliderMask ').on('click',function(e){
 			$('.sliderbox').hide();
 		})
}


function getNowFormatDate() {
        var date = new Date();
        var seperator1 = "-";
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        var strDate = date.getDate();
        if (month >= 1 && month <= 9) {
            month = "0" + month;
        }
        if (strDate >= 0 && strDate <= 9) {
            strDate = "0" + strDate;
        }
        var currentdate = year + seperator1 + month + seperator1 + strDate;
        return currentdate;
    }

 var commentTemplate ='{{each data as value i}}\
     							<li class="comment_list">\
									<div class="head">\
									{{if value.head_port}}\
										<img src="{{value.head_port}}" alt="">\
									{{else}}\
										<img src="/static/v1/img/header.jpg" alt="">\
									{{/if}}\
										<span>{{value.user_name}}</span>\
									</div>\
									<div class="con">{{value.content}}</div>\
									{{if value.image_url.length>0}}\
									<div class="uploadImg">\
										{{each value.image_url as item k}}\
										<img src={{item}} alt="">\
										{{/each}}\
									</div>\
									{{/if}}\
									<div class="uploadTime">{{value.createTime}}</div>\
								</li>\
    						{{/each}}'