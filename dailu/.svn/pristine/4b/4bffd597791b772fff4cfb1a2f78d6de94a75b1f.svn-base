$(function(){
	var city = decodeURI(getUrlParam('city'));
	var spot= decodeURI(getUrlParam('spot'));
	var floor = getUrlParam('floor');
	var trip = getUrlParam('trip');
	var icity = getUrlParam('icity');
	var iday = getUrlParam('iday');
	var ispot = getUrlParam('ispot');
	var imgArr ,videoArr;
	var postUrl;
	var query ={};
	var commentPage = 1;
	var this_uid = getCookie('uid');	
	if(trip){
		postUrl = '../detail/IsEditdetail'
		query.trip_id = trip;
		query.this_city_index = icity;
		query.day_arry_index = iday;
		query.spot_index = ispot;
		query.city_name = city;
		query.spot_name = spot;
	}else{
		postUrl = '../detail/spotDetail'
		query.city_name = city;
		query.spot_name = spot;
		query.this_floor_index = floor;
	}
	
	var spotInfo ;

	function videoInit () {
		if(videoArr.length<=0) {
			$('.tabs').hide()
			return false;
		}
		var swiper2 = new Swiper('.swiper-container2', {
			lazyLoading:true,
			speed:1000,
			observer: true,
			observeParents: true,
			autoplayStopOnLast:true,
			on:{
				slideChangeTransitionStart:function (argument) {
					$('.swiper-container2 .poster').show().siblings('.video_play').show();
					$('video').each(function(i,ele){
						this.pause();
					})
					
				}
			}
		});
		// var videoArr = ['/static/v1/video/hz/1西湖/成片.mp4','/static/v1/video/hz/2雷峰塔/成片1.mp4'];
		var videoStr = '';
		$(videoArr).each(function (i,ele) {
			videoStr+= '<div class="swiper-slide"><div class="video_play"></div><img class="poster" src="http://a.dailuer.com/upload/tourist/20180522/fdfb32905aad6ed935b176b5638b6309.jpg" ><video controls="controls" preload="auto" poster="" x5-playsinline="true"   webkit-playsinline="true" x-webkit-airplay="true" playsinline="true"  src='+ ele +'></video></div>';	
		})
		$('.swiper-container2 .swiper-wrapper').html(videoStr);

		 $("video").on("loadeddata", function (e) {

                        var obj = e.target;
                        var scale = 0.8;
                        var canvas = document.createElement("canvas");
                        canvas.width = obj.videoWidth * scale;
                        canvas.height = obj.videoHeight * scale;
                        canvas.getContext('2d').drawImage(obj, 0, 0, canvas.width, canvas.height);
                        // obj.setAttribute("poster", canvas.toDataURL("image/png"));
                   		// $(this).siblings('img').attr('src','http://a.dailuer.com/upload/tourist/20180522/fdfb32905aad6ed935b176b5638b6309.jpg')
                   	
                    } )


		$('video').on('play',function(){
			$(this).parents('.swiper-slide').siblings().find('video')[0].pause();
			// $('.video_play').hide()
		})

		$('video').on('pause',function(){
			$(this).hide().siblings().show();
		})

		$('.video_play').on('click',function () {
			var videoIndex =  swiper2.activeIndex;
			$(this).hide().siblings('img').hide();
			$('.swiper-container2 .swiper-slide video').each(function (i,ele) {
				this.pause();
				if(i==videoIndex){
					this.play()
					$(this).show();
				}

			})
		})
	}
	

	$.post(postUrl,query,function(res){
		if(!res.status) return false;
		//加载视屏 start
		/*switch (res.data.spot_name){
			case '西湖':
			videoArr =['/static/v1/video/hz/1西湖/成片.mp4','/static/v1/video/hz/1西湖/西湖/素材1.mp4','/static/v1/video/hz/1西湖/西湖/素材2.mp4','/static/v1/video/hz/1西湖/西湖/素材3.mp4','/static/v1/video/hz/1西湖/西湖/素材4.mp4','/static/v1/video/hz/1西湖/西湖/素材5.mp4'];
			break ;
			case '雷峰塔':
			videoArr =['/static/v1/video/hz/2雷峰塔/成片1.mp4','/static/v1/video/hz/2雷峰塔/素材/素材1.mp4','/static/v1/video/hz/2雷峰塔/素材/素材2.mp4','/static/v1/video/hz/2雷峰塔/素材/素材3.mp4','/static/v1/video/hz/2雷峰塔/素材/素材4.mp4','/static/v1/video/hz/2雷峰塔/素材/素材5.mp4'];
			break ;
			case '河坊街':
			videoArr =['/static/v1/video/hz/3河坊街/成片.mp4','/static/v1/video/hz/3河坊街/素材/素材1.mp4','/static/v1/video/hz/3河坊街/素材/素材2.mp4','/static/v1/video/hz/3河坊街/素材/素材3.mp4','/static/v1/video/hz/3河坊街/素材/素材4.mp4','/static/v1/video/hz/3河坊街/素材/素材5.mp4','/static/v1/video/hz/3河坊街/素材/素材6.mp4'];
			break ;
			case 'G20峰会体验馆':
			videoArr =['/static/v1/video/hz/4G20/成片.mp4','/static/v1/video/hz/4G20/素材/素材1.mp4','/static/v1/video/hz/4G20/素材/素材2.mp4','/static/v1/video/hz/4G20/素材/素材3.mp4','/static/v1/video/hz/4G20/素材/素材4.mp4','/static/v1/video/hz/4G20/素材/素材5.mp4'];
			break ;
			default:
			videoArr =[];
		}
		videoArr = ['/static/v1/video/hz/1西湖/成片.mp4','/static/v1/video/hz/2雷峰塔/成片1.mp4','/static/v1/video/hz/3河坊街/成片.mp4','/static/v1/video/hz/4G20/成片.mp4']
		videoInit()

*/
		//加载视屏 end
		


		spotInfo = res.data;
		// return false;
		var bannerStr = '';
		imgArr = res.data.image_url||[spotInfo.spot_image_url];
		$(imgArr).each(function(){
			bannerStr+= '<img class="swiper-slide" src='+ this +' alt="">'
		})
		$('.banner_img .imgCount').html(imgArr.length+'张')
		$('.swiper-container1 .swiper-wrapper').html(bannerStr);
		var swiper1 = new Swiper('.swiper-container1', {
    		lazyLoading:true,
    		speed:1000,
    		observer: true,
    		observeParents: true,
    		autoHeight:true,
    		autoplay:true,
    		autoplayStopOnLast:true
		});

		$('.detail_info').find('.detail_tit').text(spotInfo.spot_name).end()
						 .find('.address').text(spotInfo.address).end()
						 .find('.itemlist .type').text(spotInfo.type).end()
						 .find('.itemlist .suit_season').text(spotInfo.suit_season).end()
						 .find('.itemlist .play_time').text(spotInfo.play_time).end()
						 .find('.itemlist .phone').text(spotInfo.phone).end()
						 .find('.itemlist .suit_time').text(spotInfo.suit_time||spotInfo.business_hours).end()
						 .find('.itemlist .ticket').html(spotInfo.attractions_tickets).end()
						 .find('.itemlist .other_desc').html(spotInfo.other_description||'暂无');
		$('.flex_inner').find('.detail_tit').html(spotInfo.spot_name).end()
						.find('.spot_desc')	.html(spotInfo.spot_Introduction);			 
		$('.detail_info .spot_desc').html(spotInfo.spot_Introduction)
		$('.itemlist strong').each(function(){

			if($(this).text()=='暂无'||$(this).text()==''){
				$(this).parents('.itemlist').hide();
			}
		})
		var c_query = {};
			c_query.page = 1;
			c_query.city_name = spotInfo.city_name
			c_query.spot_name = spotInfo.spot_name
		$.post('../Detail/CommentData',c_query,function(res){
			res.data.length<3?$('.comment_in .morecomment').hide():$('.morecomment').show();
 			if(res.data.length<=0){
 				$(' .comment_in ul').hide().siblings('.morecomment').hide().siblings('.nocomment').show();
 			}
 			if(res.status==false){
 				return false;
 			}
 			var commentListRender = template.compile(commentTemplate);
 			var html = commentListRender(res);
 			$('.commemt_box ul').append(html);
		},'json')


	},'json')
	$('.more_msg').on('click',function(){
		if($(this).hasClass('up')){
			$(this).removeClass('up').text('展开更多').siblings('strong').css({'max-height':'0.6rem','padding-bottom':'0rem'});
		}else{
			$(this).addClass('up').text('收起更多').siblings('strong').css({'max-height':'none','padding-bottom':'0.18rem'});
		}
		
	})

	$('.tabs span').on('click',function() {
		if ($(this).hasClass('active')) return false;
		$(this).addClass('active').siblings().removeClass('active');
		if($(this).hasClass('imgs')){
			$('.swiper-container1').show().siblings('.swiper-container2').hide()
			$('.video_play').hide();
			$('.imgCount').text(imgArr.length+'张')
			$('.swiper-container2 .swiper-slide video').each(function (i,ele) {
				this.pause();
				})
		}else{
			$('.swiper-container2').show().siblings('.swiper-container1').hide()
			$('.video_play').show();
			$('.imgCount').text(videoArr.length+'部')
		}

	})


	$('.header .prevPage').on('click',function(){
			window.history.go(-1);
		})
	$('.banner_img .swiper-container1,.commemt_box .comment_in').on('click','img',function(){
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

	$('.toComment, .nocomment').on('click',function(){
		if(!this_uid){
			Set_ssdata("shareRote",window.location.href);
            window.location.href='/portal/h5login/login.html';
            return false;
		}
		var spot = encodeURI(encodeURI(spotInfo.spot_name))
		var city = encodeURI(encodeURI(spotInfo.city_name))
		window.location.href="/portal/itinerary/spotComment.html?city="+city+'&spot='+spot;
	})

	
 	$('.sliderMask ').on('click',function(e){
 		$('.sliderbox').hide();
 	})

 	

 	$('.morecomment').on('click',function(){
 		commentPage++
 		$.post('../Detail/CommentData',{'city_name':spotInfo.city_name,'spot_name':spotInfo.spot_name,'page':commentPage},function(res){ 
 			res.data.length<3?$('.comment_in .morecomment').hide():$('.morecomment').show();
 			if(res.status==false){
 				return false;
 			}
 			var commentListRender = template.compile(commentTemplate);
 			var html = commentListRender(res);
 			$('.commemt_box ul').append(html);
 			
 		},'json')
 	})
})

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