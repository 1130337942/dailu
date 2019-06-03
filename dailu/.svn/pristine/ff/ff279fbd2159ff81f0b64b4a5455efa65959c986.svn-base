
$(function(){
	var clientHeight = window.screen.availHeight ;
	var daylist; //天数数组
	var trip = getUrlParam('trip');
    var u = getUrlParam('them');
    var this_uid = getCookie('uid');
    var collect_status ='';
    var like_status ='';
    var collect_num =0 ;
    var like_num= 0;
   	var hot_num=0;
    // var lineCity =''; 
    var share_pic = 'http://a.dailuer.com/static/v1/img/tripinfoShare/prev.png'; /*分享出去的预览图*/
    var share_pic1 = 'http://a.dailuer.com/static/v1/img/tripinfoShare/prev.png'; /*分享出去的预览图*/
	var share_url; /*分享的url*/
	var sharetitle= getUrlParam('shareTitle')?decodeURI(escape(getUrlParam('shareTitle'))):''; /*微信分享的标题*/
	// var sharedesc='袋鹿旅行，自由行的必备工具'; /*微信分享的副标题*/
	var sharedesc='袋鹿行程单'; /*微信分享的副标题*/
	var timer ;
	var commentArr=[];
	var commentPage = 1;
	var loadMoreComment= true;

	var swiper1 = new Swiper('.swiper-container1', {
    		lazyLoading:true,
    		speed:1000,
    		observer: true,
    		observeParents: true,
    		autoplay:true,
    		loop:true,
    		autoplayStopOnLast:true
		});
	$('.moreTravel').on('click',function(){
		$('.travelList').show();
		
	})
	$('.closelist').on('click',function(){
		$('.travelList').hide();
	})

	$('.click_bar').on('click','.daylist_mask a,.flex a',function(){
		var index =  $(this).attr('index');
		$('.mask').hide();
	})

	$('.commemt_box .toComment , .commemt_box .nocomment').on('click',function(){
		var thisUid = getCookie('uid');
		if(!thisUid){
			Set_ssdata("shareRote",window.location.href);
			window.location.href='/portal/h5login/login.html';
			return fasle;
		}
		window.location.href="/portal/itinerary/tripcomment.html?them="+ thisUid +"&trip="+trip;
	})

	$('.ctrl_bar').on('click',function(){
		$('.mask').show().find('.click_bar').slideDown(300);
	})
	$('.close').on('click',function(){
		$('.click_bar').slideUp(300,function(){
			$(this).parents('.mask').hide(); 
		})
	})		

	$(window).on('scroll',function(){
		var soletop =  $('.sole').offset().top-$(window).scrollTop() <= clientHeight ;
		if(soletop && loadMoreComment){
			loadMoreComment = false;
			commentPage++
 			$.post('HoldComment',{'trip_id':trip,'page':commentPage},function(res){
 				res.data.length<5?$('.morecomment').hide():$('.morecomment').show();
 				if(res.status==false){
 					loadMoreComment = false;
 					return false;
 				}
 				$(res.data).each(function(){
 					if(isPhoneNumber(Number(this.user_name))){
 						 var xx = this.user_name.substring(3,this.user_name.length-4);
    					 this.user_name = this.user_name.replace(xx,"****");
 					}
 				})
 	 			var commentListRender = template.compile(commentTemplate);
        	    var html = commentListRender(res);
        	    $('.commemt_box ul').append(html);
 				loadMoreComment = true;
			 },'json')
		}
	})

	  
      window.addEventListener("popstate", function(e) {
          $('.sliderbox').hide();
      }, false);

      function pushHistory() {
        var state = {
            title: "title",
            url: "#"
        };
        window.history.pushState(state, "title", "#");
      }
  // $('.theEnd .ctrl .collect').on('click',function(){
  //           if(!this_uid){
  //           	Set_ssdata("shareRote",window.location.href);
  //               window.location.href='/portal/h5login/login.html';
  //               return false;
  //           }
  //           var _self = this;
  //           var query ={};
  //               query.uid=this_uid;
  //               query.uid_trip=u;
  //               query.trip_id=trip;
  //               query.collect_status =collect_status;
  //           $.post('collect',query,function(res){
  //                   if(res.status=='ok'){
  //                       collect_num = collect_status=='no_collect'?collect_num+1:collect_num-1;
  //                       collect_status = collect_status=='no_collect'?'collected':'no_collect';
  //                       collect_num = collect_num ==0?'':collect_num;
  //                       $('.theEnd .ctrl .collect').text(collect_num+'收藏').toggleClass('on');
  //                   }
  //           },'json')   
  //       })
  /*      $('.theEnd .ctrl .like').on('click',function(){
            if(!this_uid){
            	Set_ssdata("shareRote",window.location.href);
                window.location.href='/portal/h5login/login.html';
                return false;
            }
            var _self = this;
            if($(this).hasClass('on')) return false;
            var query ={};
                query.uid=this_uid;
                query.uid_trip=u;
                query.trip_id=trip;
                query.like_status =like_status;
            $.post('CareFor',query,function(res){
                    if(res.status=='ok'){
                        like_status = 'liked';
                        $(_self).addClass('on').text(like_num+1+'点赞');
                    }
            },'json')   
       })*/

       $('.theEnd .ctrl .copy').on('click',function(){
            if(!this_uid){
            	Set_ssdata("shareRote",window.location.href);
                window.location.href='/portal/h5login/login.html';
                return false;
            }
            var _self = this;
           
            var query ={};
                query.uid=this_uid;
                query.them=u;
                query.trip_id=trip;
            $.post('/portal/detail/Duplicate',query,function(res){
                    if(res.status==true){
                    	layer.msg('复制成功',{time:1000},function(){
                    		window.location.href="/portal/itinerary/tripinfoshare.html?them="+ this_uid +"&trip="+res.data;
                    	})
                      
                    }
            },'json')   
       })


       $('.theEnd .ctrl .edit').on('click',function(){
            if(!this_uid){
            	Set_ssdata("shareRote",window.location.href);
                window.location.href='/portal/h5login/login.html';
                return false;
            }
            var _self = this;
            var query ={};
                query.uid=this_uid;
                query.them=u;
                query.trip_id=trip;
            $.post('/portal/detail/Alter',query,function(res){
                    if(res.status==true){
                    	window.location.href="/portal/itinerary/mtripEdit.html?trip="+res.data;
                    }else{
                    	layer.msg('网络错误',{
                    		time:2000
                    	})
                    }
            },'json')   
       })


 $('.commemt_box').on('click','.uploadImg img',function(){
 	var str =''
 	$(this).parents('.uploadImg').find('img').each(function(){
 		str+='<img class="swiper-slide" src='+ $(this).attr('src') +' alt="">'
 	})

 	$('.sliderMask .sliderIMg').html(str);
 	$('.sliderbox').show();
 	pushHistory();
 	var swiper = new Swiper('.swiper-container', {
    	lazyLoading:true,
    	speed:1000,
    	observer: true,
    	observeParents: true,
    	autoHeight:true,
		});
 	$('.sliderbox ').on('click',function(e){
 		$('.sliderbox').hide();
 	})
 	
 })
 	$('.morecomment').on('click',function(){
 			commentPage++
 		 $.post('HoldComment',{'trip_id':trip,'page':commentPage},function(res){
 			res.data.length<5?$('.morecomment').hide():$('.morecomment').show();
 			if(res.status==false){
 				return false;
 			}
 			$(res.data).each(function(){
 					if(isPhoneNumber(Number(this.user_name))){
 						 var xx = this.user_name.substring(3,this.user_name.length-4);
    					 this.user_name = this.user_name.replace(xx,"****");
 					}
 				})
 	 		var commentListRender = template.compile(commentTemplate);
            var html = commentListRender(res);
            $('.commemt_box ul').append(html);
 			
		 },'json')
 	})

 $.post('HoldComment',{'trip_id':trip,'page':1},function(res){
 			res.count>5?$('.morecomment').show():$('.morecomment').hide();
 			if(res.status==false){
 				$('.nocomment').show()
 				return false;
 			}
 			$(res.data).each(function(){
 					if(isPhoneNumber(Number(this.user_name))){
 						 var xx = this.user_name.substring(3,this.user_name.length-4);
    					 this.user_name = this.user_name.replace(xx,"****");
 					}
 				})
 			$('.comment_in .title span').text(res.count);
 	 		var commentListRender = template.compile(commentTemplate);
            var html = commentListRender(res);
            $('.commemt_box ul').html(html);
 			
 },'json')

$.post('../Detail/FormData',{'collect_uid':this_uid,'uid':u,'trip_id':trip},function(res){
	if(!res||res.status===null||res.status===false){
		$('.nodata').show();
		layer.msg('该行程单已不存在')
		return false
	};
	share_pic1 = res.gailan.image_cover?res.gailan.image_cover:res.Schedufing[0].city_image_url;
	res.traffic_money=res.traffic_money?res.traffic_money:[];
	if(!res.hotel_money) res.hotel_money = [];
	if(res.gailan.whe_hide==1){
		$('.cost').hide();
	}
	var mainMaparr = [{lat:res.gailan.dep_lat,lng:res.gailan.dep_lng}];
	var gailan_tit = '<span>'+res.gailan.departure_city+'（发） → </span>';
	$(res.gailan.go_city_array).each(function(i,ele){
		mainMaparr.push(this.position);
		gailan_tit+='<em>'+(i+1)+'</em> <span>'+this.city_name+' → </span>'
		switch(this.city_trc_name.trim())
		{
			case '铁路交通':
			this.traffic_ico = 'train'
			this.use_time = this.trainTime||this.trc_time
			break;
			case '飞机交通':
			this.traffic_ico = 'air';
			this.use_time = this.flightTime||this.trc_time
			break;
			default:
			this.traffic_ico  = 'bus'
			this.use_time = this.trafficTime||this.trc_time;
		}
		res.Schedufing[i].city_trc_name = this.city_trc_name;
		res.Schedufing[i].traffic_ico = this.traffic_ico;
		res.Schedufing[i].dis = this.dis;
		res.Schedufing[i].use_time = CheckIsChinese(this.use_time);
	})
	 gailan_tit+='<span>（返）'+res.gailan.return_city+'</span>'
	/*header部分 start*/
	
	var first_day = 0;
    
	var city_daynum_arr = [];
        for(var k=0;k<this.city_daynum;k++){
          first_day ++
          city_daynum_arr.push(first_day);
        }
        this.city_daynum_arr = city_daynum_arr;
     	collect_num = res.gailan.collect_num == 0?'':res.gailan.collect_num;
     	like_num = res.gailan.like_num == 0?'':res.gailan.like_num;
     	hot_num = res.gailan.click_num == 0?'':res.gailan.click_num;
     	like_status = res.like_status;
     	       if(like_status!='no_like'){
     	           $('.theEnd .ctrl .like').addClass('on');
     	       }else{
     	       	$('.theEnd .ctrl .like').removeClass('on')
     	       }
	
     	collect_status = res.collect_status;
     	       if(collect_status!='no_collect'){
     	           $('.theEnd .ctrl .collect').addClass('on');
     	       }else{
     	           $('.theEnd .ctrl .collect').removeClass('on');

     	       }
	
	$('.firstClient .travel_img').attr('src',res.gailan.image_cover?res.gailan.image_cover:res.Schedufing[0].city_image_url);
	if(res.toplist){
		$('.lineCros').html(res.toplist.line);
	}else{
		$('.lineCros').html(gailan_tit);
	}
	$('.theEnd .ctrl .like').text(like_num+'点赞')
	$('.theEnd .ctrl .collect').text(collect_num+'收藏')
	$('.heat .heat_num').text(hot_num);
	$('.firstClient').find('.travel_title').text(res.gailan.trip_name).end()
				  .find('.author').text(res.gailan.user_name+'·'+res.gailan.creat_time.replace(/-/g,'.')+'制作').end();
	if(res.posterData==''){ //如果没有出团信息不显示
		$('.remark').html('').hide();
		$('.otherlogo').hide();
		$('.remark_end').hide();
		$('.dluser').show()
		$('.allchara').hide()
	}else{
		$('.allchara').html(res.posterData.allchara);
		$('.author_phone').html(res.posterData.phone?'联系电话：'+res.posterData.phone:'');
		
		res.posterData.remarks==''?$('.remark_end').hide():$('.remark_end').show();
		$('.theEnd .inscribe').html(res.posterData.inscribe);
		$('.theEnd .con_info').html(getFormatCode(res.posterData.remarks));
		var conHeight = 0 ;
		$('.theEnd .con_info').children().each(function(){
			conHeight+=$(this).height()
		})
		if(conHeight<100){
			$('.theEnd .con_info').addClass('all first');
		}
		$('.theEnd .agency').text(res.posterData.agency==''?'袋鹿':res.posterData.agency);
		var poster_datestr = res.posterData.departure_date==''? '':(res.posterData.date_title||'出团日期：') + res.posterData.departure_date;
		var poster_num = res.posterData.team_number==''? '':(res.posterData.team_title||'出团人数：') + res.posterData.team_number;
		var poster_pric = res.posterData.team_price==''? '':(res.posterData.price_title||'出团天数：') + res.posterData.team_price;
		
		$('.firstClient .remark').find('.team_date').html(res.posterData.departure_date?poster_datestr:'').end()
								 .find('.team_num').text(res.posterData.team_number?poster_num:'').end()
								 .find('.team_price').text(res.posterData.team_price?poster_pric:'').end()
								 .find('.travel_price').text(res.posterData.travel_price?'出团价格：'+res.posterData.travel_price:'')
		/*$('.firstClient .remark').find('.team_date').html((res.posterData.date_title||'发团日期：')+res.posterData.departure_date.replace(/-/g,'.')).end()
								 .find('.team_num').text((res.posterData.team_title||'发团人数：')+res.posterData.team_number).end()
								 .find('.team_price').text((res.posterData.price_title||'出团价格：')+res.posterData.team_price).end()*/
		$('.otherlogo img').attr('src',res.posterData.logo);

		$('.firstClient').find('.author').html(res.posterData.agency?res.posterData.agency+'·制作':'').end();
	}
	// renderMap(mainMaparr,$('.overview .line_img'),true)

	/*header部分 end*/
	/* 自定义微信分享*/
		sharetitle = sharetitle?sharetitle : res.gailan.trip_name;
		wechatConfig()

	/*行程概览 start*/
	var traffiCost  = res.traffic_money?res.traffic_money:[]; 
	var trafficTot = 0;
	var traffic_table = '';
	$(traffiCost).each(function(i,ele) {
		this.line_cros = this.start_city +'—'+this.city_name;
		trafficTot += this.price*this.people;
		switch(this.city_trc_name.trim())
		{
			case '铁路交通':
			this.traffic_ico = 'train'
			break;
			case '飞机交通':
			this.traffic_ico = 'plane'
			break;
			default:
			this.traffic_ico = 'bus'
		}
	    traffic_table += '<div class="list '+ this.traffic_ico+'"><span>'+this.line_cros+'</span><span>¥ '+this.price+' x'+this.people+'</span></div>';
					
	})
	$('.cost .traffic_cost').append(traffic_table);
	$('.cost .traffic_tot').text('¥ '+trafficTot.toFixed(2))
	
	$('.firstClient').find('.person').text(res.gailan.adult+'成人，'+res.gailan.children+'儿童').end()
					.find('.travel_day').text(res.gailan.day_num+'天').end()
					.find('.back_day').text(res.xianlu.return_date).end()
					.find('.start_date').text(res.gailan.date).end()
					
					


		

	/*行程概览 end*/

	/*费用清单*/
	var hotel_table = '';
		hotel_tot_money  = 0;
	$(res.hotel_money).each(function(i,ele){
			hotel_table +='<div class="list hotel"><span>'+this.hotel_name+'</span><span>¥ '+this.LowRate+' x'+this.number_night+'x'+Math.round((res.gailan.children/2+res.gailan.adult*1)/2)+'</span></div>'
			hotel_tot_money +=this.number_night*this.LowRate*Math.round((res.gailan.children/2+res.gailan.adult*1)/2);	
	})
	$('.cost .hotel_cost').append(hotel_table);
	$('.cost .hotel_tot').text('¥ '+hotel_tot_money.toFixed(2))
	var eating_table = '';
		eat_tot_money  = 0;
	$(res.eat_money).each(function(i,ele){
			eating_table+='<div class="list eat"><span>'+this.name+'</span><span>¥ '+this.price+' x'+this.people+'</span></div>';
			eat_tot_money +=this.price*this.people;	
	})
	$('.cost .eat_cost').append(eating_table);
	$('.cost .eat_tot').text('¥ '+eat_tot_money.toFixed(2));
	$('.tot_money').text('¥ '+(eat_tot_money+hotel_tot_money+trafficTot)+'元')

	/*daylist start*/
		daylist = [];
	var day_list_img =[];
	var ticketCost = [];
    var ticketTot = 0 ;
		$(res.Schedufing).each(function(i,ele){
			var that =this;
			var sch_length = res.Schedufing.length;
			switch(ele.city_trc_name)
               {
                   case '铁路交通':
                   this.city_station = '火车站';
                   this.city_trc_name = '铁路'
                   break;
                   case '飞机交通':
                   this.city_station = '机场';
                   this.city_trc_name = '飞机';
                   break;
                   case '汽车交通':
                   this.city_station = '汽车站';
                   this.city_trc_name = '汽车';
                   break;
                   default:
                   this.city_station = '汽车站';
                   this.city_trc_name = '汽车';
               }
           if(i>0&&this.prevHotel&&daylist[(daylist.length-1)].hotel.hotel_name==''){
                daylist[(daylist.length-1)].hotelNearby =this.prevHotel.hotelNearby; 
                 var preHotelImg = daylist[(daylist.length-1)].hotel.highImage;
                if(preHotelImg&&preHotelImg.length==0){
                	daylist[(daylist.length-1)].hotel =this.prevHotel.hotel; 
                }
             } 
			$(that.day_arry).each(function(k,ele){
				var temp =this;
				var dayMapoint = [];
					$(temp.day).each(function(){
						dayMapoint.push({'lng':this.this_lng,'lat':this.this_lat})
					   var ticketTemp ={};
                       var strt,end,price;
                        if(!this.info.attractions_tickets){
                       	this.info.attractions_tickets='';
                       }
                       start = this.info.attractions_tickets.indexOf("成人票：");
                       end = this.info.attractions_tickets.indexOf("元/人"); 
                       price =  (start=="-1"||end=="-1")?0:parseFloat(this.info.attractions_tickets.substring(start+4,end));
                      
                       ticketTemp.ticket=Boolean(price)?price:0;
                       ticketTemp.spotName=this.info.spot_name;
                       ticketTemp.type="门票费用";
                       ticketTemp.totmoney = res.gailan.adult * ticketTemp.ticket;
                       ticketTemp.peopleNum = res.gailan.adult+"(成人)";
                       ticketTot+=res.gailan.adult * ticketTemp.ticket;
                       ticketCost.push(ticketTemp);
                       if(!this.eat_info){
                       		this.eat_info =[]
                       }
					})
				 temp.famous_spot=that.famous_spot;
                 temp.special_food=that.special_food;
                 temp.special_goods=that.special_goods;
                 temp.trainStation=that.train;
                 temp.airport=that.plane;
                 temp.this_city = that.this_city;
                 temp.this_city_index = i;
                 temp.day_arr_index = k;
				temp.use_time = that.use_time;
				temp.traffic_ico = temp.traffic_ico?temp.traffic_ico:that.traffic_ico;
				temp.city_trc_name = that.city_trc_name;
				temp.city_station = that.city_station;
				temp.dis = that.dis;
				// temp.daynumber = temp.daynumber==undefined?'Day'+(daylist.length+1):temp.daynumber;
				temp.mapPosition = dayMapoint;
				temp.city_image_url = that.city_image_url;
				temp.two_city = this.two_city?this.two_city:that.day_arry[0].two_city;
				temp.two_city_Introduction = that.city_Introduction;
				temp.two_city_abbreviation = that.city_abbreviation;
				temp.one_city_abbreviation = daylist.length>0?daylist[daylist.length-1].two_city_abbreviation :'';
				temp.one_city_Introduction = daylist.length>0?daylist[daylist.length-1].two_city_Introduction :'';
				daylist.push(temp);
				day_list_img.push(dayMapoint);
			})
		})
		
		 var ticket_table = '';
		$(ticketCost).each(function(i,ele){
			ticket_table+='<div class="list ticket"><span>'+this.spotName+'</span><span>¥ '+this.ticket+' x'+this.peopleNum+'</span></div>';
		})
		$('.cost .ticket_cost').append(ticket_table);
		$('.cost .ticket_tot').text('¥ '+ticketTot.toFixed(2));
		 switch(res.gailan.return_cityInfo.city_trc_name.trim())
               {
                   case '铁路交通':
                   res.gailan.return_cityInfo.use_time = res.gailan.return_cityInfo.trainTime||res.gailan.return_cityInfo.trc_time;
                   res.gailan.return_cityInfo.city_trc_name = '铁路';
                   break;
                   case '飞机交通':
                   res.gailan.return_cityInfo.use_time = res.gailan.return_cityInfo.flightTime||res.gailan.return_cityInfo.trc_time;
                   res.gailan.return_cityInfo.city_trc_name = '飞机';
                   break;
                   case '汽车交通':
                   res.gailan.return_cityInfo.use_time = res.gailan.return_cityInfo.busTime||res.gailan.return_cityInfo.trc_time;
                   res.gailan.return_cityInfo.city_trc_name = '汽车';
                   break;
                   default:
                   res.gailan.return_cityInfo.city_trc_name = '汽车';
                   res.gailan.return_cityInfo.use_time = res.gailan.return_cityInfo.trafficTime||res.gailan.return_cityInfo.trc_time;
               }
		 daylist[daylist.length-1].one_city_Introduction =res.Schedufing[res.Schedufing.length-1].city_Introduction;
         daylist[daylist.length-1].one_city_abbreviation =res.Schedufing[res.Schedufing.length-1].city_abbreviation;
         daylist[daylist.length-1].two_city_Introduction ='';
         daylist[daylist.length-1].two_city_abbreviation ='';
         daylist[daylist.length-1].city_trc_name =res.gailan.return_cityInfo.city_trc_name;
         daylist[daylist.length-1].dis =res.gailan.return_cityInfo.dis;
         daylist[daylist.length-1].use_time =CheckIsChinese(res.gailan.return_cityInfo.use_time);

            var maskStr = '';
            var gailanStr=''  //行程概览str
            for(var i=0;i<daylist.length;i++){
            		var dayline='';
            		
            		var date =  daylist[i].date.replace('.','月')+'日'
            		if(i==0){   //解决一天多个城市的天数情况
                            daylist[i].dayindex  = i;
                    }else{
                         daylist[i].dayindex = daylist[i-1].dayindex +1
                    }  
                    if( i>0 &&  daylist[i-1].date == daylist[i].date){
                        daylist[i].dayindex = daylist[i-1].dayindex;  
                    }
                    daylist[i].daynumber =  daylist[i].daynumber ==undefined?'Day'+ (daylist[i].dayindex+1):daylist[i].daynumber;
                    if(daylist[i].transport){
                    	$(daylist[i].transport).each(function(){
                    		switch (this.city_trc_name){
                    			case '铁路交通':
                    			this.traffic_ico = 'train';
                    			break;
                    			case '飞机交通':
                    			this.traffic_ico = 'air';
                    			break;
                    			case 'default':
                    			this.traffic_ico = 'bus';
                    			break;
                    		}
                    	})
                    }


            		if(daylist[i].one_city){
            			var daycity = daylist[i].one_city==daylist[i].two_city ? daylist[i].two_city : (daylist[i].one_city+' → ' + daylist[i].two_city)
            		}else{
            			var daycity = daylist[i].this_city;
            		}
            		var dayplay = daylist[i].one_city?(daylist[i].city_trc_name):'游玩';
            		$(daylist[i].day).each(function(){
            			dayline += ' '+this.this_name+' →'
            		})
            	dayline = dayline.substr(1,dayline.length-2);
            	var daySourse ='DAY '+(daylist[i].dayindex+1);
            	var hide = i>3?'hide':''; //大于第四天的隐藏
            		if(res.toplist){
            			daycity = res.toplist.day_line[i];
            			dayplay = res.toplist.trafficstring[i];
            			dayline= res.toplist.same_day_spot[i];
            			daySourse = res.toplist.daynumber[i];
            			date = res.toplist.datestring[i];
            		}
           		gailanStr +='<a href="#day'+i+'" ><div class="view_list '+ hide+'">'+
							'<div class="flex">'+
							'	<span class="main_color">'+daySourse +'</span><span class="line">'+daycity+'</span>'+
							'</div>'+
							'<div class="flex">'+
							'	<span class="date">'+ date +'</span><span class="date">'+dayplay+'</span>'+
							'</div>'+
							'<div class="gl_line">'+ dayline +'</div>'+
						'</div></a>'

            	maskStr+='<a index="3" href="#day'+i+'">D'+(daylist[i].dayindex+1)+'</a>'

            	/*如果修改了当天的交通信息 start*/
                if(daylist[i].nowdate!=undefined){
                  daylist[i].date =  daylist[i].nowdate
                  daylist[i].dis =  daylist[i].tra_dis
                  daylist[i].use_time = daylist[i].tra_time
                  daylist[i].betw_time = daylist[i].interval
                }
                
              	/*如果修改了当天的交通信息 end*/

            }
            var dayListObj = {}; //渲染页面
            var flagtime = (new Date("2019/04/18 12:00:00")).getTime()/1000; //这个时间之前的出发城市和返回城市是反的
            if(daylist.length<=1 && res.gailan.creat_untime<flagtime){
            	var city_temp = daylist[0].one_city
            	daylist[0].one_city= daylist[0].two_city;
            	daylist[0].two_city = city_temp;
            }

            dayListObj.daylist = daylist;
           
            if(daylist[0].one_city){ //老单
            	var dayListRender = template.compile(dayListTemplate);
            }else{ //新单
            	var dayListRender = template.compile(dayListTemplate1);
            }
            var html = dayListRender(dayListObj);
            $('.day_wap .theEnd').before(html);
            // sliderInit()
            if(res.gailan.insiders==3){
            	$('.nearby').hide();
            }
            if(daylist.length>4){
            	gailanStr+='<div class="show_view up">查看更多</div>'
            }
            $('.overview').append(gailanStr); //行程概览str
            toTripmap()//点城市地图跳转
            toSport()//点击景点跳详情
            toHotel()//点击酒店跳详情
            $('.daylist_mask').html(maskStr).css({width:daylist.length*0.7+'rem'});
            $('.show_view').on('click',function(){
            	$('.view_list.hide').toggle()
            	if($(this).hasClass('up')){
            		$(this).removeClass('up').text('收起列表');
            	}else{
            		$(this).addClass('up').text('查看更多');
            	}
            	
            })
            $('.eachlist').each(function(){
            	if(!$(this).prev().hasClass('common_traffic')){
            		$(this).css({'marginTop':'0.1rem'});
            	}
            })

          	$('.city_trafffic .morebz').on('click',function(){
          		if($(this).hasClass('down')){
          			$(this).parents('.city_trafffic').find('.c_wap3').show();
          			$(this).removeClass('down');
          		}else{
          			$(this).parents('.city_trafffic').find('.c_wap3').hide(200);
          			$(this).addClass('down');
          		}
          		

          	})

            $('#qd').on('click',function(){
            	$(this).toggleClass('down').siblings().toggle();
            })

            $('.theEnd .mark_content .loadMore').on('click',function(){	
            	$(this).siblings('.con_info').toggleClass('all');
            	if($(this).siblings('.con_info').hasClass('all')){
            		$(this).text('收起更多')
            	}else{
            		$(this).text('查看更多')
            	}
            })
        /*daylist end*/

        $('.daylist .m_outer').each(function(){
        	if($(this).height()<265){
        		$(this).find('.more_mark').hide()
        	}
        })
        $('span.more_mark').on('click',function(){
        	if($(this).hasClass('up')){
        		$(this).removeClass('up').parents('.m_outer').removeClass('up');
        	}else{
        		$(this).addClass('up').parents('.m_outer').addClass('up');
        	}
        	
        })
        

        var priceArr =[{value:eat_tot_money, name:'餐饮费用'},
                {value:trafficTot, name:'交通费用'},
                {value:hotel_tot_money, name:'住宿费用'},
                {value:ticketTot, name:'门票费用'}
                ];
        $('.firstClient .totmoney').text(ticketTot+hotel_tot_money+trafficTot+'元')
		renderEchats(priceArr);
		 $('#qd').siblings().hide()

    //实例化地图 算公共交通 start
               var Amap = new AMap.Map("mapContainer", {
                  center: [120.583213,29.992493],
                  zoom: 14
                });
                $('.common_traffic.item_traffic').each(function(i,ele){
                  var _self = this;
                  var crosStr='';
                  var transferOption = {
                    nightflag: false, // 是否计算夜班车
                    city: $(_self).attr('this_city')+'市',
                    autoFitView: true,
                    policy: AMap.TransferPolicy.LEAST_TIME // 其它policy取值请参照 https://lbs.amap.com/api/javascript-api/reference/route-search#m_TransferPolicy
                  }
                   //根据起、终点坐标查询公交换乘路线
                   var startLng = parseFloat($(_self).attr('this_lng'))
                   var startLat = parseFloat($(_self).attr('this_lat'))
                   var nextLng = parseFloat($(_self).attr('next_lng'))
                   var nextLat = parseFloat($(_self).attr('next_lat'))
                   if(startLng&&startLat&&nextLng&&nextLat){
                    var transfer = new AMap.Transfer(transferOption)
                    transfer.search(new AMap.LngLat(startLng,startLat), new AMap.LngLat(nextLng,nextLat), function(status, result) {
                      
                      if(result.info=='OK'){
                      	$(result.plans[0].segments).each(function(){ //获取查询结果的第一条线路规划
                             crosStr+=this.instruction;
                         })
                      		
                        	$(_self).html('<div>公共交通 · '+(result.plans[0].distance/1000).toFixed(2)+'公里 · 约'+formatSeconds(result.plans[0].time)+'<span class="fr">详情</span></div>');
                        	$(_self).append('<div>'+crosStr+'</div>')
                        	$(_self).find('span.fr').on('click',function(){
                            $(_self).toggleClass('auto');
                        })
                      }else{
                      	var dis = GetDistance(startLat, startLng, nextLat, nextLng);
                      	if(dis<=0){
                      		 $(_self).text('暂无交通信息');
                      		 return false ;
                      	}
                      	//飞机700 在加0.5小时， 铁路230 ，其他50 汽车 80
                      	var time ;
                      	if(dis<40){
                      		time =  dis/20*3600; 	
                      	}else{
                      		time = dis/60*3600;
                      	}

                      	$(_self).html('<div>汽车交通 · '+dis.toFixed(2)+'公里 · 约'+formatSeconds(time.toFixed(0))+'</div>');
                       
                      }
                    // result即是对应的公交路线数据信息，相关数据结构文档请参考  https://lbs.amap.com/api/javascript-api/reference/route-search#m_TransferResult
                    if (status === 'complete') {
                    } else {
                     // console.log('公交路线数据查询失败' )
                   }
                 });
                 }

                  
                })  
        //实例化地图 算公共交通 start

        scrolltoTarget()
},'json').error(function(){
	layer.msg('网络错误')
	$('.nodata').show();
	return false
})

$.post('../Detail/Released',{'uid':u,'page':1},function(res){
		if(!res.status) return false;
        var travelListRender = template.compile(triplistTemplate);
        var html = travelListRender(res);
        $('.travelList .inner_list').html(html);
},'json')

var tripPage = 1;
var getTrip = true;
$('.flex_inner').on('scroll',function(){
	var scrollHeight = $('.flex_inner .inner_list')[0].scrollHeight; //内容的高度
	var scrollTop = $(this).scrollTop(); //卷曲头部的高度（隐藏高度）
	var height = $(this).height(); //视窗高度
	if(height + scrollTop >= scrollHeight && getTrip){
		tripPage++;
		getTrip = false;
		var loadingStr  = '<div class="loading"><img src="/static/v1/img/loading.gif" alt=""></div>'
		$('.travelList .inner_list').append(loadingStr)
		$.post('../Detail/Released',{'uid':u,page:tripPage},function(res){
        	$('.travelList .inner_list .loading').remove();
			if (!res.status) return false;
			getTrip = true;
			var travelListRender = template.compile(triplistTemplate);
        	var html = travelListRender(res);
        	$('.travelList .inner_list').append(html);
		},'json')
	}	

	
	
})

function scrolltoTarget (){
	 	window.onbeforeunload=function(a){    //页面跳转走之前的操作，(return false;)可阻断关闭和跳转
        console.log("当前页面滚动高度是：:"+$(window).scrollTop());
        sessionStorage.setItem("scrollTop",$(window).scrollTop());
        sessionStorage.setItem("trip_id",trip); 
        // return false;
    }
               //页面加载操作，进行数据渲染和高度滚动
        if(sessionStorage.getItem("scrollTop")!==undefined && sessionStorage.getItem("scrollTop")>0){
        	if(sessionStorage.getItem("trip_id")==trip){
            	$("html,body").animate({scrollTop:sessionStorage.getItem("scrollTop")}, 500);
        	}
        }
    
}



function toTripmap (){
	$('.toTripmap , .dayc_tit strong.more').on('click',function(){
		var mapInfo = [];
		var index = $(this).attr('index');
		var dayInfo = daylist[index];
			$(dayInfo.day).each(function(i,ele){
				var temp = {};
					temp.this_lat= this.this_lat;
					temp.this_lng= this.this_lng;
					temp.spot_image_url= this.info.spot_image_url;
					temp.address= this.info.address;
					temp.spot_name= this.info.spot_name;
					temp.this_floor_index= this.this_floor_index;
					temp.suit_season = this.info.suit_season;
					temp.id = this.info.id?this.info.id:'';
					temp.this_city = dayInfo.this_city;
					temp.trip = trip;
					temp.isedit = this.info.isedit;
					temp.this_city_index = dayInfo.this_city_index;
					temp.day_arr_index = dayInfo.day_arr_index;
					temp.spotIndex = i;
					mapInfo.push(temp);
			})
		Set_ssdata('mapInfo',mapInfo);
		window.location.href='/portal/itinerary/tripMap.html';
	})
}

function toHotel(argument) {
	$('.eachlist.hotel').on('click',function(){
		var hotelId = $(this).attr('data-hotel-id');
		var dayindex = $(this).parents('.daylist').attr('dayindex');
		var icity = daylist[dayindex].this_city_index;
		var iday = daylist[dayindex].day_arr_index;
		if(!hotelId){

			if(!daylist[dayindex].hotel.highImage){
					layer.msg('该酒店暂无详情',{
						time:1000
					})
				return false;
			}
		window.location.href = '/portal/itinerary/hotelDetail.html?icity='+icity+'&iday='+iday+'&trip='+trip;
		return false;	
		}
		window.location.href = '/portal/itinerary/hotelDetail.html?hotel='+hotelId;
	})	
}

function sliderInit (){
	$('.spot_slider').each(function(i,ele){
		var loopStatus = false;
		if($(this).find('img').length>1){
			loopStatus = true;
		}
		
    	// lazyLoading:true,
		var spot_swiper = new Swiper('.spot_slider'+i, {
    	speed:1000,
    	observer: true,
    	observeParents: true,
    	autoplay:true,
    	loop:loopStatus
		});
	})
}

function toSport (){
	var dayindex ,spotIndex;
	$('.eachlist.toSpot .eachlist_img ,.eachlist.toSpot strong.more').on('click',function(){
		dayindex = $(this).parents('.daylist').attr('dayindex');
		spotIndex = $(this).parents('.toSpot').attr('spotindex');
		var curSpot = daylist[dayindex].day[spotIndex];
		var spot = curSpot.info.spot_name;
		var floor = curSpot.this_floor_index;
		var city = daylist[dayindex].this_city;
		var editFlag = curSpot.info.isedit?curSpot.info.isedit:'';
		spot = encodeURI(encodeURI(spot)) //中文乱码处理
    	city = encodeURI(encodeURI(city))
		if(editFlag){  //如果景点编辑过则按tripId查询详情
			window.location.href="/portal/itinerary/tripDetail.html?spot="+spot+'&city='+city+"&trip="+trip+'&icity='+daylist[dayindex].this_city_index+'&iday='+daylist[dayindex].day_arr_index+'&ispot='+spotIndex; 
			return false;
		}
		
		if(curSpot.info.id==='' || floor==='' || floor==-2){ // 数据库的景点或者用户自己录的景点 //手机端用户自己录的楼层是-2
    			layer.msg('该景点暂无详情，请试试其它景点哦',{
    				time:1000
    			})
    			return false;
    		}

			// spot = encodeURI(encodeURI(spot)) //中文乱码处理
   //  		city = encodeURI(encodeURI(city))
    	window.location.href="/portal/itinerary/tripDetail.html?spot="+spot+'&city='+city+'&floor='+floor;

	})
}

function getFormatCode (strValue){
	return strValue.replace(/\r\n/g, '<br/>').replace(/\n/g, '<br/>').replace(/\s/g, ' ');
}

//根据经纬度计算两点之间的距离
// 方法定义 lat,lng 调用 return的距离单位为km
function GetDistance(lat1, lng1, lat2, lng2) {
	// console.log(lat1,lat2)
	var radLat1 = lat1 * Math.PI / 180.0;
	var radLat2 = lat2 * Math.PI / 180.0;
	var a = radLat1 - radLat2;
	var b = lng1 * Math.PI / 180.0 - lng2 * Math.PI / 180.0;
	var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) +
		Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
	s = s * 6378.137; // EARTH_RADIUS;
	// s = Math.round(s * 10000) / 10000;
	s = Math.round(s);
	return s;
};

//判断是否是微信浏览器的函数
function isWeiXin(){
  //window.navigator.userAgent属性包含了浏览器类型、版本、操作系统类型、浏览器引擎类型等信息，这个属性可以用来判断浏览器类型
  var ua = window.navigator.userAgent.toLowerCase();
  //通过正则表达式匹配ua中是否含有MicroMessenger字符串
  if(ua.match(/MicroMessenger/i) == 'micromessenger'){
  return true;
  }else{
  return false;
  }
}

/*微信分享 start*/
// var mpid = 'wx6a68684031971e42';

    function formatSeconds(value) {
        var secondTime = parseInt(value);// 秒
        var minuteTime = 0;// 分
        var hourTime = 0;// 小时
        if(secondTime > 60) {//如果秒数大于60，将秒数转换成整数
            //获取分钟，除以60取整数，得到整数分钟
            minuteTime = parseInt(secondTime / 60);
            //获取秒数，秒数取佘，得到整数秒数
            secondTime = parseInt(secondTime % 60);
            //如果分钟大于60，将分钟转换成小时
            if(minuteTime > 60) {
                //获取小时，获取分钟除以60，得到整数小时
                hourTime = parseInt(minuteTime / 60);
                //获取小时后取佘的分，获取分钟除以60取佘的分
                minuteTime = parseInt(minuteTime % 60);
            }
        }
        // var result = "" + parseInt(secondTime) + "秒";
        var result = "";

        if(minuteTime > 0) {
            result = "" + parseInt(minuteTime) + "分" + result;
        }
        if(hourTime > 0) {
            result = "" + parseInt(hourTime) + "小时" + result;
        }
        return result;
    }


function wechatConfig() {
    
    share_url = window.location.href.split('#')[0];
    $.ajax({
        type: 'post',
        url: 'wxSignature',
        data:{'url':encodeURIComponent(share_url)},
        dataType: "json",
        success: function(data) {
            var config_obj = data;
            wx.config({
                debug: false,
                appId: config_obj.app_id,
                timestamp: config_obj.timestamp,
                nonceStr: config_obj.nonce_str,
                signature: config_obj.signature,
                jsApiList: [
                	'updateAppMessageShareData',
                	'updateTimelineShareData',
                    'onMenuShareTimeline',
                    'onMenuShareAppMessage',
                    'onMenuShareQQ',
                    'onMenuShareWeibo'
                ]
            });
            wx.ready(function () {
            	  //需在用户可能点击分享按钮前就先调用
            		wx.updateAppMessageShareData({ 
        			title: sharetitle, // 分享标题
        			desc: sharedesc, // 分享描述
        			link: share_url, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
        			imgUrl: share_pic, // 分享图标
        			success: function () {
          				// 设置成功
     				 	}
 					});
           
                wx.updateTimelineShareData({ 
        			title: sharetitle, // 分享标题
        			link: share_url, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
        			imgUrl: share_pic1, // 分享图标
        			success: function () {
        			 // 设置成功
        			}
   				 })
            });

            wx.error(function(res){
            });

            setShareInfo({
            	title:          sharetitle,
            	summary:        sharedesc,
            	pic:            share_pic,
            	url:            share_url,
            	WXconfig:       {
            		swapTitleInWX: true,
            		appId: config_obj.app_id,
            		timestamp: config_obj.timestamp,
            		nonceStr: config_obj.nonce_str,
            		signature: config_obj.signature
            	}
            });
        },
        error:function(xhr, type) {
        }
    });
}


/*微信分享 end*/




 function renderEchats(priceArr){
             // 基于准备好的dom，初始化echarts实例
        var myChart = echarts.init(document.getElementById('p_left'));
 
        // 指定图表的配置项和数据
        var colors=['#393939','#f5b031','#fad797','#59ccf7','#c3b4df'];
        var option = {
                        tooltip: {
                            trigger: 'item',
                            formatter: "{a} <br/>{b}: {c} ({d}%)"
                        },
                        legend: {
                            orient: 'vertical',
                            x: 'right',
                            data:['餐饮费用','交通费用','住宿费用','门票费用']
                        },
                        color:['#975ee4','#fbd336','#3aa0ff','#f2637a'],
                        series: [
                        {
                            name:'费用类型',
                            type:'pie',
                            radius:['50%', '65.5%'],
                            avoidLabelOverlap: false,
                            label: {
                             normal: {
                                show: true,
                                z:1,
                                position: 'center',
                                formatter:function(){
                                    return '总费用\n '+(priceArr[0].value+priceArr[1].value+priceArr[2].value+priceArr[3].value).toFixed(2)
                                },
                                textStyle: {
                                    fontSize: '20',
                                    fontWeight: 'bold',
                                    backgroundColor:'#fff',
                                    textAlign:'center',

                                }

                            },
                            emphasis: {
                                show: true,
                                textStyle: {
                                    fontSize: '20',
                                    fontWeight: 'bold',
                                    backgroundColor:'#fff',
                                    padding: 20
                                },
                                formatter:function(p){
                                    return p.data.name
                                },
                                z:2
                            }
                        },
                        labelLine: {
                            normal: {
                                show: false
                            }
                        },
                        data:priceArr
                    }
                    ]
                };


        // 使用刚指定的配置项和数据显示图表。
        myChart.setOption(option);
    }

    /**判断是否是手机号**/
	function isPhoneNumber(tel) {
	    var reg =/^0?1[3|4|5|6|7|8|9][0-9]\d{8}$/;
	    return reg.test(tel);
	}

	function CheckIsChinese(val,isreturn){    //用于大交通是否加小时单位
             if(typeof(val)=='string' && val.trim()!=''){
                var reg = new RegExp("[\\u4E00-\\u9FFF]+","g");
            　   if(reg.test(val)){
                    return val;
                    }else{
                    return val+'小时';
                    }   
             }
        } 

     /*图片地图 start*/
       function renderMap (pointArr,selector,isCitys){
            // var pointArr= [{'lng':109.501375,'lat':26.128291},{'lng':114.335359,'lat':30.517291},{'lng':116.378816,'lat':28.200323},{'lng':120.158113,'lat':30.004871}]
            var lngarr=[];
            var latarr=[];
            for(var i=0;i<pointArr.length;i++){
                lngarr.push(pointArr[i].lng)
                latarr.push(pointArr[i].lat)
            }
            var center={}
            center.lng =(Math.max.apply(null,lngarr )+Math.min.apply(null,lngarr))/2;
            center.lat =(Math.max.apply(null,latarr )+Math.min.apply(null,latarr))/2;
            var markerstr = '';
            var pathstr = '';
            if(pointArr.length<1){
            	selector.attr('src','/static/v1/img/nodata_day.png');
            	return false ;
            }
            if(isCitys){ //游玩城市概览 显示出发城市
              markerstr = '&markers=icon:http://www.dailuer.com/static/v1/img/map/departureicon.png|'+pointArr[0].lat+','+pointArr[0].lng;
              for(var i= 0;i<pointArr.length-1;i++){
                markerstr += '&markers=color:blue|label:'+(i +1) +'|'+pointArr[i+1].lat+','+pointArr[i+1].lng;
                pathstr += '|'+pointArr[i+1].lat+','+pointArr[i+1].lng;
              }
            }else{
              for(var i= 0;i<pointArr.length;i++){
                markerstr += '&markers=color:blue|label:'+(i +1) +'|'+pointArr[i].lat+','+pointArr[i].lng;
                pathstr += '|'+pointArr[i].lat+','+pointArr[i].lng;
              }
            }
            

            var imgsrc = 'http://maps.google.cn/maps/api/staticmap?center='+center.lat+','+center.lng +'zoom=1&size=678x400&maptype=roadmap'+markerstr+'&path=color:0xFF0000|weight:5'+  pathstr +'&key=AIzaSyDyRjVndlLtlpWVIg_RSfgGYLUUvclNLGw';
           	selector.attr('src',imgsrc)
           
    }

     /*图片地图end*/

	/*新版本的模板*/ var  dayListTemplate1 =  '{{each daylist as value i}}\
     			<div class="daylist" dayindex="{{i}}" id=day{{i}}>\
					<div class="daycity">\
						{{if value.daynumber}}\
						<div class="time">\
							<p><span class="dayIndex">{{value.daynumber}}</span><span class="dateTime">{{if value.date}} {{value.date.replace(".","月")+"日"}} {{/if}}</span></p><a class="toTripmap" href="javascript:;" index="{{i}}">地图模式</a>\
						</div>\
						{{/if}}\
					{{if value.transport}}\
					{{each value.transport as traffic j}}\
					<div class="city_trafffic">\
						{{if traffic.one_city!=traffic.two_city }}\
						<div class="c_wap2">\
							<span class="morebz down"></span>\
							<div class="date">\
								<p><span>{{traffic.one_city}}</span><span class="ico ico_{{traffic.traffic_ico}}"></span><span>{{traffic.two_city}}</span></p>\
							</div>\
							<div class="cros tac">\
								<p>{{traffic.dis}}公里</p>\
							</div>\
							<div class="usetime tar">\
								<p>约{{traffic.trafficTime}}</p>\
							</div>\
						</div>\
						{{else}}\
						<div class="c_wap2">\
							<span class="morebz down"></span>\
							<div class="date">\
								<p><span>{{traffic.one_city}}</span><span class="ico ico_{{traffic.traffic_ico}}"></span></p>\
							</div>\
						</div>\
						{{/if}}\
						{{if j==0}}\
						<div class="c_wap3">\
							<div>交通备注：{{#value.traffic_remarks||"暂无"}}<span></span></div>\
						</div>\
						{{/if}}\
					</div>\
					{{/each}}\
					{{/if}}\
						<div class="dayc_tit">\
							<div class="cityneme">{{value.this_city}}\
							{{if value.start_time}}\
							 <span class="fr">{{value.betw_time ||(value.start_time+" - "+value.end_time)}}</span>\
							 {{/if}}\
							 </div>\
							<div class="soptline">\
								{{each value.day as spot j}}\
									<em>{{j+1}}</em> {{spot.this_name}}\
								{{/each}}\
							</div>\
							{{if value.remarks}}\
							<div class="daytip m_outer">\
								<div class="m_inner">{{#value.remarks_title||"[温馨提示]"}}：{{#value.remarks||"暂无"}}</div>\
								<div class="listmore"><span class="more_mark"></span><strong class="fr more" index="{{i}}">[ 地图模式 ]</strong></div>\
							</div>\
							{{/if}}\
						</div>\
					</div>\
					{{if value.hotel.hotel_name}}\
					<div class="eachlist hotel" data-hotel-id={{value.hotel.hotel_id}}>\
						<div class="eachtit"><em>住</em>\
							<div class="over_h">{{value.hotel.hotel_name}}</div>\
							<span class="">{{value.date}}入住</span>\
						</div>\
						<div class="eachlist_img">\
								<img src="{{value.hotel.ThumbNailUrl}}" alt="">\
						</div>\
						<div class="nearby">\
							<p class="left_tip dl">附近美食</p>\
							<ul class="nearby_outer">\
								{{each value.hotelNearby as hfood m}}\
									 {{if m<3}}\
									 <li class="near_list"><img src="{{hfood.dianpu_image}}" alt=""> <p class="food_n">{{hfood.name}}</p></li>\
									 {{/if}}\
								{{/each}}\
							</ul>\
						</div>\
					 </div>\
						{{if value.day[0]}}\
					 	<div class="common_traffic item_traffic" this_city="{{value.this_city}}" this_lng="{{value.hotel.lng}}" this_lat="{{value.hotel.lat}}" next_lng="{{value.day[0].this_lng}}" next_lat="{{value.day[0].this_lat}}">\
					 		公共交通信息不详\
					 	</div>\
					 	{{/if}}\
					{{/if}}\
					{{each value.day as item key}}\
					<div class="eachlist toSpot" spotIndex="{{key}}">\
						<div class="eachtit"><em>{{key+1}}</em>\
							<div class="over_h">{{item.info.spot_name}}</div>\
							<span class="">游玩时间 {{item.this_playtime||item.info.play_time}}</span>\
						</div>\
						<div class="eachlist_img">\
								<img class="" src="{{item.info.spot_image_url}}" alt="">\
						</div>\
						<div class="nearby">\
							{{if item.eat_info[0] && item.eat_info[0].near}}\
								<p class="left_tip dl">{{item.eat_info[0].near}}</p>\
									{{else}}\
								<p class="left_tip">已选美食</p>\
								{{/if}}\
							<ul class="nearby_outer">\
								{{each item.eat_info as food l}}\
									 {{if l<3}}\
									 <li class="near_list"><img src="{{food.dianpu_image}}" alt=""> <p class="food_n">{{food.name}}</p></li>\
									 {{/if}}\
								{{/each}}\
							</ul>\
						</div>\
						{{if item.spot_remarks}}\
						<div class="spot_remarks m_outer"><div class="m_inner">{{item.sremarks_title||"备注"}}：{{#item.spot_remarks||"暂无"}}</div><div class="listmore"><span class="more_mark"></span><strong class="more">[ 查看更多 ]</strong></div></div>\
						{{/if}}\
					 </div>\
						{{if key<value.day.length-1}}\
					 	<div class="common_traffic item_traffic" this_city="{{value.this_city}}" this_lng="{{item.this_lng}}" this_lat="{{item.this_lat}}" next_lng="{{value.day[key+1].this_lng}}" next_lat="{{value.day[key+1].this_lat}}">\
					 		公共交通信息不详\
					 	</div>\
					 	{{/if}}\
					 {{/each}}\
				</div>\
				{{/each}}'	
	
	 var  dayListTemplate =  '{{each daylist as value i}}\
     			<div class="daylist" dayindex="{{i}}" id=day{{i}}>\
					<div class="daycity">\
						{{if value.daynumber}}\
						<div class="time">\
							<p><span class="dayIndex">{{value.daynumber}}</span><span class="dateTime">{{if value.date}} {{value.date.replace(".","月")+"日"}} {{/if}}</span></p><a class="toTripmap" href="javascript:;" index="{{i}}">地图模式</a>\
						</div>\
						{{/if}}\
					{{if value.one_city}}\
					<div class="city_trafffic">\
						{{if value.one_city!=value.two_city }}\
						<div class="c_wap2">\
							<span class="morebz down"></span>\
							<div class="date">\
								<p><span>{{value.one_city}}</span><span class="ico ico_{{value.traffic_ico}}"></span><span>{{value.two_city}}</span></p>\
							</div>\
							<div class="cros tac">\
								<p>{{value.dis}}公里</p>\
							</div>\
							<div class="usetime tar">\
								<p>约{{value.use_time}}</p>\
							</div>\
						</div>\
						{{else}}\
						<div class="c_wap2">\
							<span class="morebz down"></span>\
							<div class="date">\
								<p><span>{{value.one_city}}</span><span class="ico ico_{{value.traffic_ico}}"></span></p>\
							</div>\
						</div>\
						{{/if}}\
						<div class="c_wap3">\
							<div>交通备注：{{#value.traffic_remarks||"暂无"}}<span></span></div>\
						</div>\
					</div>\
					{{/if}}\
						<div class="dayc_tit">\
							<div class="cityneme">{{value.this_city}}\
							{{if value.start_time}}\
							 <span class="fr">{{value.betw_time ||(value.start_time+" - "+value.end_time)}}</span>\
							 {{/if}}\
							 </div>\
							<div class="soptline">\
								{{each value.day as spot j}}\
									<em>{{j+1}}</em> {{spot.this_name}}\
								{{/each}}\
							</div>\
							{{if value.remarks}}\
							<div class="daytip m_outer">\
								<div class="m_inner">{{#value.remarks_title||"[温馨提示]"}}：{{#value.remarks||"暂无"}}</div>\
								<div class="listmore"><span class="more_mark"></span><strong class="fr more" index="{{i}}">[ 地图模式 ]</strong></div>\
							</div>\
							{{/if}}\
						</div>\
					</div>\
					{{if value.hotel.hotel_name}}\
					<div class="eachlist hotel" data-hotel-id={{value.hotel.hotel_id}}>\
						<div class="eachtit"><em>住</em>\
							<div class="over_h">{{value.hotel.hotel_name}}</div>\
							<span class="">{{value.date}}入住</span>\
						</div>\
						<div class="eachlist_img">\
								<img src="{{value.hotel.ThumbNailUrl}}" alt="">\
						</div>\
						<div class="nearby">\
							<p class="left_tip dl">附近美食</p>\
							<ul class="nearby_outer">\
								{{each value.hotelNearby as hfood m}}\
									 {{if m<3}}\
									 <li class="near_list"><img src="{{hfood.dianpu_image}}" alt=""> <p class="food_n">{{hfood.name}}</p></li>\
									 {{/if}}\
								{{/each}}\
							</ul>\
						</div>\
					 </div>\
						{{if value.day[0]}}\
					 	<div class="common_traffic item_traffic" this_city="{{value.this_city}}" this_lng="{{value.hotel.lng}}" this_lat="{{value.hotel.lat}}" next_lng="{{value.day[0].this_lng}}" next_lat="{{value.day[0].this_lat}}">\
					 		公共交通信息不详\
					 	</div>\
					 	{{/if}}\
					{{/if}}\
					{{each value.day as item key}}\
					<div class="eachlist toSpot" spotIndex="{{key}}">\
						<div class="eachtit"><em>{{key+1}}</em>\
							<div class="over_h">{{item.info.spot_name}}</div>\
							<span class="">游玩时间 {{item.this_playtime||item.info.play_time}}</span>\
						</div>\
						<div class="eachlist_img">\
								<img class="" src="{{item.info.spot_image_url}}" alt="">\
						</div>\
						<div class="nearby">\
							{{if item.eat_info && item.eat_info[0] && item.eat_info[0].near}}\
								<p class="left_tip dl">{{item.eat_info[0].near}}</p>\
									{{else}}\
								<p class="left_tip">已选美食</p>\
								{{/if}}\
							<ul class="nearby_outer">\
								{{each item.eat_info as food l}}\
									 {{if l<3}}\
									 <li class="near_list"><img src="{{food.dianpu_image}}" alt=""> <p class="food_n">{{food.name}}</p></li>\
									 {{/if}}\
								{{/each}}\
							</ul>\
						</div>\
						{{if item.spot_remarks}}\
						<div class="spot_remarks m_outer"><div class="m_inner">{{item.sremarks_title||"备注"}}：{{#item.spot_remarks||"暂无"}}</div><div class="listmore"><span class="more_mark"></span><strong class="more">[ 查看更多 ]</strong></div></div>\
						{{/if}}\
					 </div>\
						{{if key<value.day.length-1}}\
					 	<div class="common_traffic item_traffic" this_city="{{value.this_city}}" this_lng="{{item.this_lng}}" this_lat="{{item.this_lat}}" next_lng="{{value.day[key+1].this_lng}}" next_lat="{{value.day[key+1].this_lat}}">\
					 		公共交通信息不详\
					 	</div>\
					 	{{/if}}\
					 {{/each}}\
				</div>\
				{{/each}}'	

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
    var triplistTemplate ='{{each data as value i}}\
     							<div class="list">\
									<a href="/portal/itinerary/tripinfoshare.html?them={{value.uid}}&trip={{value.trip_id}}">\
										<div class="left_msg">\
											<div class="con">{{value.travel_title}}</div>\
											<div class="citys">游玩天数：{{value.day_num}}天</div>\
										</div>\
										<div class="right_img">\
											<img src="{{value.cover}}" alt="">\
										</div>\
									</a>\
								</div>\
    						{{/each}}'							
})