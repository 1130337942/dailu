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
	var share_url = 'http://'+window.location.host+'/portal/itinerary/tripinfoshare.html?them='+  u +'&trip='+trip; /*分享的url*/
	var sharetitle= getUrlParam('shareTitle')?decodeURI(escape(getUrlParam('shareTitle'))):''; /*微信分享的标题*/
	var sharedesc='袋鹿旅行，自由行的必备工具'; /*微信分享的副标题*/
	var timer ;
	var commentArr=[];
	var commentPage = 1;
	var editspot={};
	var editdom;
  var traveLtitle = ''//行程标题	
  var travel_cover = '';//行程封面

  $('.g-doc .toTripinfo').on('click',function(){
        window.location.href="/portal/itinerary/tripInfo/"+trip+".html"
  })

$.post('../Detail/FormData',{'collect_uid':this_uid,'uid':u,'trip_id':trip},function(res){
	if(!res||res.status==null){
		$('.nodata').show();
		return false
	};
	if(res.gailan.insiders !=3||(this_uid!=u)){
		alert('您暂无编辑权限，请联系管理员');
		window.location.href='/';
	}

	res.traffic_money=res.traffic_money?res.traffic_money:[];
	// console.log(res)
	if(!res.hotel_money) res.hotel_money = [];
	if(res.gailan.whe_hide==1){
		$('.cost').hide();
	}
  traveLtitle = res.gailan.trip_name;
	var mainMaparr = [{lat:res.gailan.dep_lat,lng:res.gailan.dep_lng}];
	var gailan_tit = '<span>'+res.gailan.departure_city+'（发） — </span>';
	var gailan_tit_edit  = res.gailan.departure_city+'（发） - '
	$(res.gailan.go_city_array).each(function(i,ele){
		mainMaparr.push(this.position);
		gailan_tit+='<em>'+(i+1)+'</em> <span>'+this.city_name+' — </span>'
		gailan_tit_edit += this.city_name+' - '
		switch(this.city_trc_name.trim())
		{
			case '铁路交通':
			this.traffic_ico = 'train'
			this.use_time = this.trainTime
			break;
			case '飞机交通':
			this.traffic_ico = 'air';
			this.use_time = this.flightTime
			break;
			default:
			this.traffic_ico  = 'bus'
			this.use_time = this.trafficTime;
		}
		res.Schedufing[i].city_trc_name = this.city_trc_name;
		res.Schedufing[i].traffic_ico = this.traffic_ico;
		res.Schedufing[i].dis = this.dis;
		res.Schedufing[i].use_time = this.use_time;
	})
	 gailan_tit+='<span>（返）'+res.gailan.return_city+'</span>'
	 gailan_tit_edit += '（返）'+res.gailan.return_city

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
	travel_cover = res.gailan.image_cover?res.gailan.image_cover:res.Schedufing[0].city_image_url
	$('.firstClient .travel_img').attr('src',res.gailan.image_cover?res.gailan.image_cover:res.Schedufing[0].city_image_url);
	if(res.toplist){
    $('.lineCros').html(res.toplist.line);
  }else{
    $('.lineCros').html(gailan_tit);
  }
	$('.theEnd .ctrl .like').text(like_num+'喜欢')
	$('.theEnd .ctrl .collect').text(collect_num+'收藏')
	$('.theEnd .ctrl .hot').text(hot_num+'人气');
	$('.firstClient').find('.travel_title').text(res.gailan.trip_name).end()
				  .find('.author').text(res.gailan.user_name+'·'+res.gailan.creat_time.replace(/-/g,'.')+'制作').end();
	if(res.posterData==''){ //如果没有出团信息不显示
		$('.remark').html('').hide();
		$('.otherlogo').hide();
		$('.remark_end').hide();
		$('.dluser').show()
	}else{
		res.posterData.remarks==''?$('.remark_end').hide():$('.remark_end').show();
		$('.theEnd .con_info').html(getFormatCode(res.posterData.remarks));
		$('.theEnd .agency').text(res.posterData.agency==''?'袋鹿':res.posterData.agency)
    var posterDep = res.posterData.departure_date==''?'':res.posterData.date_title+res.posterData.departure_date;
    var posterNum = res.posterData.team_number==''?'':res.posterData.team_title+res.posterData.team_number;
    var posterteampric = res.posterData.team_price==''?'':res.posterData.price_title+res.posterData.team_price;
		$('.firstClient .remark').find('.team_date').text(posterDep).end()
								 .find('.team_num').text(posterNum).end()
								 .find('.team_price').text(posterteampric).end()
                .find('.travel_price').text(res.posterData.travel_price?'出团价格：'+res.posterData.travel_price:'');
		$('.otherlogo img').attr('src',res.posterData.logo);
		$('.firstClient').find('.author').text(res.posterData.agency+'·'+res.gailan.creat_time.replace(/-/g,'.')+'制作').end();
	}
	renderMap(mainMaparr,$('.overview .line_img'),true)

	/*header部分 end*/

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
                   break;
                   case '飞机交通':
                   this.city_station = '机场';
                   break;
                   default:
                   this.city_station = '其它';
                   
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
        if(i>0){
              var prevdayLength = res.Schedufing[i-1].day_arry.length;
              if(k==0){
                this.daySource = res.Schedufing[i-1].day_arry[prevdayLength-1].daySource+1;
              }else{
                  this.daySource = that.day_arry[k-1].daySource+1;
              }
            
              if(this.date==res.Schedufing[i-1].day_arry[prevdayLength-1].date){
                  this.daySource = res.Schedufing[i-1].day_arry[prevdayLength-1].daySource;
              }
          }else {
              this.daySource = k;
          }
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

					})
				 temp.famous_spot=that.famous_spot;
                 temp.special_food=that.special_food;
                 temp.special_goods=that.special_goods;
                 temp.trainStation=that.train;
                 temp.airport=that.plane;
                 temp.this_city_index = i;
                 temp.day_arry_index = k;
                 temp.this_city = that.this_city;
				temp.use_time = that.use_time;
				temp.traffic_ico = temp.traffic_ico?temp.traffic_ico:that.traffic_ico;
				temp.city_trc_name = that.city_trc_name;
				temp.city_station = that.city_station;
        temp.dis = that.dis;
				temp.daynumber = temp.daynumber==undefined?'Day'+(this.daySource+1):temp.daynumber;
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
                   res.gailan.return_cityInfo.use_time = res.gailan.return_cityInfo.trainTime;
                   break;
                   case '飞机交通':
                   res.gailan.return_cityInfo.use_time = res.gailan.return_cityInfo.flightTime;
                   break;
                   default:
                   res.gailan.return_cityInfo.use_time = res.gailan.return_cityInfo.trafficTime;
               }
		 daylist[daylist.length-1].one_city_Introduction =res.Schedufing[res.Schedufing.length-1].city_Introduction;
         daylist[daylist.length-1].one_city_abbreviation =res.Schedufing[res.Schedufing.length-1].city_abbreviation;
         daylist[daylist.length-1].two_city_Introduction ='';
         daylist[daylist.length-1].two_city_abbreviation ='';
         daylist[daylist.length-1].city_trc_name =res.gailan.return_cityInfo.city_trc_name;
         daylist[daylist.length-1].dis =res.gailan.return_cityInfo.dis;
         daylist[daylist.length-1].use_time =res.gailan.return_cityInfo.use_time;

	  
            var maskStr = '';
            var gailanStr=''  //行程概览str
            for(var i=0;i<daylist.length;i++){
                if(res.toplist){//如果编辑过行程概览
                  var dayline = res.toplist.same_day_spot[i];
                  var daycity = res.toplist.day_line[i];
                  var dayplay = res.toplist.trafficstring[i];
                  var date =  res.toplist.datestring[i];
                  var dateSourse = res.toplist.daynumber[i];
                }else{
                  var date =daylist[i].date.replace('.','月') +'日';
                  var dateSourse ='DAY '+(i+1);
            		  var dayline='';
            		  var daycity = daylist[i].one_city?(daylist[i].one_city+' — ' + daylist[i].two_city):daylist[i].this_city;
            		  var dayplay = daylist[i].one_city?(daylist[i].city_trc_name):'游玩';
            		  $(daylist[i].day).each(function(){
            		  	dayline += ' '+this.this_name+' —'
            		  })
            	    dayline = dayline.substr(1,dayline.length-2);
              }
             

            	var hide = i>3?'hide':''; //大于第四天的隐藏
           		gailanStr +='<a href="#day'+i+'" ><div class="view_list '+ hide+'">'+
							'<div class="flex">'+
							'	<span class="main_color">'+dateSourse+'</span><span class="line">'+daycity+'</span>'+
							'</div>'+
							'<div class="flex">'+
							'	<span class="date">'+ date +'</span><span class="date">'+dayplay+'</span>'+
							'</div>'+
							'<div class="gl_line">'+ dayline +'</div>'+
						'</div></a>'

            	maskStr+='<a index="3" href="#day'+i+'">D'+(i+1)+'</a>'

              /*如果修改了当天的交通信息 start*/
                if(daylist[i].nowdate!=undefined){
                  daylist[i].date =  daylist[i].nowdate
                  daylist[i].dis =  daylist[i].tra_dis
                  daylist[i].use_time = daylist[i].tra_time
                  daylist[i].betw_time = daylist[i].interval
                }
                
              /*如果修改了当天的交通信息 end*/


            }
             var dayListObj = {};
            var flagtime = (new Date("2019/04/18 12:00:00")).getTime()/1000; //这个时间之前的出发城市和返回城市是反的
            if(daylist.length<=1 && res.gailan.creat_untime<flagtime){
              var city_temp = daylist[0].one_city
              daylist[0].one_city= daylist[0].two_city;
              daylist[0].two_city = city_temp;
            }
            dayListObj.daylist = daylist;
            var dayListRender = template.compile(dayListTemplate);
            var html = dayListRender(dayListObj);
            $('.day_wap .theEnd').before(html);
            if(daylist.length>4){
            	gailanStr+='<div class="show_view up">查看更多</div>'
            }

            $('.overview').append(gailanStr); //行程概览str
            toSport()//点击景点跳详情
            eidtFirstClient() //第一屏编辑
            eidtTravelOverview(daylist,gailan_tit_edit,res.toplist)//行程概览编辑
            editModel.editHotel();//编辑酒店
            editModel.editPoster()//编辑海报
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

        $('strong.more').on('click',function(){
        	if($(this).hasClass('up')){
        		$(this).removeClass('up').parent('div').removeClass('up');
        		$(this).text('[ 查看更多 ]')
        	}else{
        		$(this).addClass('up').parent('div').addClass('up');
        		$(this).text('[ 收起更多 ]')
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
                        $(_self).html('<div>公共交通 · '+(result.plans[0].distance/1000).toFixed(2)+'公里 · 约'+(result.plans[0].time/3600).toFixed(1)+'小时<span class="fr">详情</span></div>');
                         $(_self).append('<div>'+crosStr+'</div>')
                         $(_self).find('span.fr').on('click',function(){
                            $(_self).toggleClass('auto');
                        })
                      }else{
                        $(_self).text('暂无公共交通信息');
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


},'json')

function toTripmap (){
	$('.toTripmap').on('click',function(){
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
					
					mapInfo.push(temp);
			})
		Set_ssdata('mapInfo',mapInfo);
		window.location.href='/portal/itinerary/tripMap.html';
	})
}

function eidtFirstClient (){
	$('.mask-first').on('click',function(){
		$('#travelRemark').show().siblings('.edit-tab').hide();
	})

	$.post('/portal/aboutuser/EditPoster',{'trip_id':trip},function(res){
		editModel.renderFirstClient(res)
	},'json')
	editModel.submitFirstClient()
}
function eidtTravelOverview (daylist,gailan_tit_edit,toplist){
	$('.overview_mask').on('click',function(){
		$('#travelOverview').show().siblings('.edit-tab').hide();
	})
	editModel.renderTravelOverview(daylist,gailan_tit_edit,toplist)
	editModel.submitTravelOverview()
}

var ue = ueditorInit('t_container','');
var ue2 = ueditorInit('spot_Introduction','');
var ue3 = ueditorInit('remarks','');//当天备注
var ue4 = ueditorInit('traffic_marks','');//当天大交通
var ue5 = ueditorInit('spot_remarks','');//景点备注
var allchara_e; //整体特色
var travel_remarks_e;//备注信息
var editModel ={   
  	   renderFirstClient:function(arg){
        $('#travelRemark').find('.travel_title').val(traveLtitle).end();
                 //上传行程封面
        var clipArea = new bjj.PhotoClip("#clipArea-first", {
          size: [960, 640],// 截取框的宽和高组成的数组。默认值为[260,260]
          outputSize: [960, 640], // 输出图像的宽和高组成的数组。默认值为[0,0]，表示输出图像原始大小
          //outputType: "jpg", // 指定输出图片的类型，可选 "jpg" 和 "png" 两种种类型，默认为 "jpg"
          file: ".file_input-first", // 上传图片的<input type="file">控件的选择器或者DOM对象
          ok: "#clipBtn-first", // 确认截图按钮的选择器或者DOM对象
          loadStart: function() {
            // 开始加载的回调函数。this指向 fileReader 对象，并将正在加载的 file 对象作为参数传入
            $('.cover-wrap-first').fadeIn();
            console.log("照片读取中");
          },
          loadComplete: function() {
             // 加载完成的回调函数。this指向图片对象，并将图片地址作为参数传入
            console.log("照片读取完成");
          },
          //loadError: function(event) {}, // 加载失败的回调函数。this指向 fileReader 对象，并将错误事件的 event 对象作为参数传入
          clipFinish: function(dataURL) {
             // 裁剪完成的回调函数。this指向图片对象，会将裁剪出的图像数据DataURL作为参数传入
            $('.cover-wrap-first').fadeOut();
            $('#travelRemark img.travel_img').attr('src',dataURL);
            // $('.left_wap .inner').hide().siblings('.poster_img_box').show();
            // $('.up_btn').removeClass('disabled')
            
          }
        });
  	   	if(arg.status == false){
            allchara_e=ueditorInit('allchara','') //整体特色
            travel_remarks_e = ueditorInit('travel_remarks','');//景点备注
            $('#travelRemark').find('.travel_img').attr('src',travel_cover)
            return false;
        } 
  	   		var data = arg.data; 
  	   		$('#travelRemark').find('.agency').val(data.agency).end()
  	   						.find('.travel_title').val(traveLtitle).end()
  	   						.find('.team_title').val(data.team_title).end()
  	   						.find('.team_number').val(data.team_number).end()
  	   						.find('.price_title').val(data.price_title).end()
                  .find('.team_price').val(data.team_price).end()
  	   						.find('.travel_price').val(data.travel_price).end()
  	   						.find('.date_title').val(data.date_title).end()
  	   						.find('.departure_date').val(data.departure_date).end()
  	   						.find('.travel_img').attr('src',data.cover).end()
                  .find('.inscribe').val(data.inscribe).end()
  	   						.find('.travel_price').val(data.travel_price);
                  allchara_e=ueditorInit('allchara',data.allchara) //整体特色
  	   						travel_remarks_e = ueditorInit('travel_remarks',data.remarks);//景点备注
  	   	
  	   

  	   }
     ,submitFirstClient:function(){
   		$('#travelRemark .submit').on('click',function(){
   				var firstClient ={} ;
     			firstClient.trip_id=trip;
     			firstClient.agency = $('input.agency').val();
     			firstClient.travel_title = $('input.travel_title').val();
     			firstClient.team_title = $('input.team_title').val();
     			firstClient.team_number = $('input.team_number').val();
     			firstClient.price_title = $('input.price_title').val();
          firstClient.team_price = $('input.team_price').val();
     			firstClient.travel_price = $('input.travel_price').val();
     			firstClient.date_title = $('input.date_title').val();
     			firstClient.departure_date = $('input.departure_date').val();
     			firstClient.inscribe = $('input.inscribe').val();
     			firstClient.allchara = allchara_e.getContent();
     			firstClient.remarks = travel_remarks_e.getContent();
          var cover=$('#travelRemark img.travel_img').attr('src');
          if(cover.indexOf('http')==-1){
            firstClient.cover = $('#travelRemark img.travel_img').attr('src');
          }
     			// return false;
     			$.post('/portal/Detail/topcontent',firstClient,function(res){
	               if(res.status==true){
                    window.location.reload();
                 }
     			},'json')
   		})
   		$('#travelRemark .cancel').on('click',function(){
   			$('#travelRemark').hide().siblings('.g-doc').show();
   		})
     
     }
   ,renderTravelOverview:function(daylist,gailan_tit,toplist){
      if(toplist){
        var afterEdit =toplist;
        var gailanStr = '<tr><td>途经城市</td><td><input type="text" class="gailan_tit" placeholder="请输入途经城市" value="'+afterEdit.line+'"></td></tr>';
        for(var i=0;i<daylist.length; i++){
            gailanStr+= '<tr><td><input class="dayindex" placeholder="如 DAY1" type="text" value="'+ afterEdit.daynumber[i] +'"></td><td><input type="text" class="daycity" placeholder="如：城市A → 城市B" value="'+ afterEdit.day_line[i] +'"></td></tr>'
            gailanStr+='<tr><td><input class="playdate" type="text" placeholder="日期 如：XX月XX日" value="'+afterEdit.datestring[i]+'"></td><td><input type="text" class="dayplay" placeholder="请输入交通方式 如：汽车" value="'+afterEdit.trafficstring[i]+'"></td></tr>'
            gailanStr+='<tr><td>当天景点</td><td><input class="dayline" type="text" placeholder="请输入当天游玩景点" value="'+afterEdit.same_day_spot[i]+'"></td></tr>'

        }
      }else{
          var gailanStr = '<tr><td>途经城市</td><td><input type="text" class="gailan_tit" placeholder="请输入途经城市" value="'+gailan_tit+'"></td></tr>'
          for(var i=0;i<daylist.length;i++){
               var dayline = '';
                   var daytit='<tr><td>第'+ (daylist[i].daySource+1) +'天</td></tr>';
                   var daycity = daylist[i].one_city?(daylist[i].one_city+' — ' + daylist[i].two_city):daylist[i].this_city;
                   var dayplay = daylist[i].one_city?(daylist[i].city_trc_name):'游玩';
                   $(daylist[i].day).each(function(){
                     dayline += ' '+this.this_name+' —'
                   })
                   dayline = dayline.substr(1,dayline.length-2);
                 gailanStr+= daytit
                 gailanStr += '<tr><td><input class="dayindex" type="text" value="DAY'+(daylist[i].daySource+1)+'"></td><td><input type="text" class="daycity" placeholder="如：城市A → 城市B" value="'+ daycity +'"></td></tr>'
                 gailanStr+='<tr><td><input class="playdate" type="text" placeholder="日期 如：XX月XX日" value="'+daylist[i].date.replace('.','月')+'日"></td><td><input type="text" class="dayplay" placeholder="请输入交通方式 如：汽车" value="'+dayplay+'"></td></tr>'
                 gailanStr+='<tr><td>当天景点</td><td><input class="dayline" type="text" placeholder="请输入当天游玩景点" value="'+dayline+'"></td></tr>'
          }
      }
        
   	  
            $('#travelOverview table').html(gailanStr)

   }
   ,submitTravelOverview:function(){
   		$('#travelOverview .submit').on('click',function(){
   				var query ={};
              query.line =$('input.gailan_tit').val()
              query.trip_id =trip;
              query.daynumber =[];
              query.day_line = [];
              query.datestring = [];
              query.trafficstring = [];
              query.same_day_spot = [];
              $('#travelOverview input.dayindex').each(function(i,ele){
                query.daynumber.push($(this).val());
                var day_line = $('#travelOverview input.daycity').eq(i).val()
                var datestring =$('#travelOverview input.playdate').eq(i).val()
                var trafficstring =$('#travelOverview input.dayplay').eq(i).val()
                var same_day_spot =$('#travelOverview input.dayline').eq(i).val()
                query.day_line.push(day_line)
                query.datestring.push(datestring)
                query.trafficstring.push(trafficstring)
                query.same_day_spot.push(same_day_spot)
              })
          $.post('/portal/Detail/BaseList',query,function(res){
              $('.loading_mask').show();
              if(res.status==true){
                layer.msg('提交成功',{
                  time:1000
                },function(){
                  $('.loading_mask').hide();
                  window.location.reload();
                })
              }
          },'json')
     			return false;
     			
   		})
   		$('#travelOverview .cancel').on('click',function(){
   			$('#travelOverview').hide().siblings('.g-doc').show();
   		})
     
     }
    ,editHotel:function(){
    	$('.eachlist .hotelmask').on('click',function(){
    		var dayindex = $(this).parents('.daylist').attr('dayindex');
    		editModel.renderHotelEdit(dayindex)
    		editModel.submitHotel(dayindex);
    	})

    	$('#hotelEdit .cancel').on('click',function(){
  			$('#hotelEdit').hide().siblings('.g-doc').show();
  		})
    }
  	,renderHotelEdit:function(dayindex){
  		var hotel = daylist[dayindex].hotel;
  		$('#hotelEdit').show().siblings('.edit-tab').hide();
  		$('#hotelEdit').find('.hotel_name').val(hotel.hotel_name).end()
  					.find('.address').val(hotel.address).end()
  					.find('#Category').val(hotel.Category).end()
  					.find('#hotel_desc').val(hotel.Features).end()
  					.find('#Gen').val(hotel.GeneralAmenities).end();
      var hotelArr = [];
      var hotelStr = '';
      $(daylist).each(function(i,index){
         if(this.hotel.hotel_id){
             hotelStr+='<p data-index='+i+'>'+ this.hotel.hotel_name +'</p>'
         }
         hotelArr.push(this.hotel);
      })
      $('#hotelEdit .tip_hotel').html(hotelStr);
      $('#hotelEdit .hotel_name').on('focus',function(){
          $('#hotelEdit .tip_hotel').show();
      })
      $('#hotelEdit').on('click',function(event){
          if(event.target!=$('.hotel_name')[0]){
            $('#hotelEdit .tip_hotel').hide();
          }
      })
      $('#hotelEdit .hotel_name').on('keyup',function(){
          $('#hotelEdit .tip_hotel').hide();
      })
      $('#hotelEdit .tip_hotel p').on('click',function(){
        $('#hotelEdit').find('.hotel_name').val($(this).text())
        $('#hotelEdit .tip_hotel').hide();
        var that_hotel = hotelArr[$(this).attr('data-index')];
        $('#hotelEdit').find('.hotel_name').val(that_hotel.hotel_name).end()
            .find('.address').val(that_hotel.address).end()
            .find('#Category').val(that_hotel.Category).end()
            .find('#hotel_desc').val(that_hotel.Features).end()
            .find('#Gen').val(that_hotel.GeneralAmenities).end();
            $('.already .imgUL').html('');
      })
  		var highImage =hotel.highImage || [];
  		var imgstr = '';
  		$(highImage).each(function(){
			imgstr+='<img src='+this+' >'
  		})	
  		$('.already .imgUL').html(imgstr);
  	}
  	,submitHotel:function(dayindex){
  		$('#hotelEdit .submit').on('click',function(){
  			var query2 = new FormData()
    		query2.append('trip_id',trip);
        var hotel =daylist[dayindex].hotel;
        var hotel_name = $('#hotelEdit .hotel_name').val();
        var flage = false;
          $(daylist).each(function(i,index){
              if((hotel_name==this.hotel.hotel_name)&&this.hotel.hotel_id){
                 hotel = this.hotel;
                 hotel.that_city_index = daylist[i].this_city_index;
                 hotel.that_day_index = daylist[i].day_arry_index;
                 flage = true ;
                 return false;
              }  
          })
          var piclist = $tgaUpload_hotel.getFiles('inited');
          if(!flage && piclist.length<=0){
            alert('该酒店非艺龙平台酒店 请上传酒店图片');
            return false;
          }
  			var query = new FormData();
  				hotel.trip_id= trip;
  				hotel.day_arry_index = daylist[dayindex].day_arry_index;
  				hotel.this_city_index = daylist[dayindex].this_city_index;
  				hotel.hotel_name = $('#hotelEdit .hotel_name').val();
  				hotel.address=$('#hotelEdit .address').val()
  				hotel.Category = $('#Category').val();
  				hotel.GeneralAmenities  = $('#Gen').val();       
  				hotel.Features  = $('#hotel_desc').val(); 
  			
  			
        
        hotel.hotel_id = flage?hotel.hotel_id :'';
        for(var key in hotel){
          query.append(key,hotel[key])    
        }
			$(piclist).each(function(i,ele){
				query.append('file[]',ele.source.source)
			})
			$('.loading_mask').show()
  			$.ajax({
                type:'POST',
                url:'../Detail/HotelEdit',
                data:query,
                processData:false,
                contentType : false,
                dataType:'json',
                success:function(data){
                   if(data.status== true){
                   		layer.msg(data.msg,{
                   			time:1000
                   		})
                   		window.location.reload();
                   }
                    $('.loading_mask').hide()
                },
                error:function(res){
                	layer.msg('网络错误',{
                   			time:1000
                   		})
               	}
            });

  		})	
  	}
  	,editPoster:function(){
  		$("#trip_ewm").qrcode({
			width: 100, //宽度  
			height: 100, //高度  
			text: share_url, //任意内容 
		});
		var x = 100 * 0.38;                                                                  
        var y = 100 * 0.38;                                                                 
        var lw = 100 * 0.28;                                                                 
        var lh = 100 * 0.28; 
    	$("#trip_ewm canvas")[0].getContext('2d').drawImage($("#hh")[0], x, y, lw, lh);

    	$('.trip_ewmbox').on('mousedown',function(event){
			var pageX = eventUtil.getPageX(event);
        	var pageY = eventUtil.getPageY(event);
        	var boxX = pageX;
        	var boxY = pageY ;
        	var startLeft = $('.trip_ewmbox').position().left;	
        	var startTop=  $('.trip_ewmbox').position().top;
        	$('.left_wap').on('mousemove',function(){
        		var event = eventUtil.getEvent(event);
            	var pageX = eventUtil.getPageX(event);
            	var pageY = eventUtil.getPageY(event);
            	var nowLeft = startLeft+pageX-boxX;
            	var nowtop= startTop+pageY - boxY;
            	nowLeft = nowLeft<12?12:nowLeft;
            	nowLeft = nowLeft>390?390:nowLeft;
            	nowtop = nowtop<12?12:nowtop;
            	nowtop = nowtop>652?652:nowtop;
           		$('.trip_ewmbox').css({'left':nowLeft+'px','top':nowtop+'px'});
            	window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty();
        	})
        	
		})
    	$('.trip_ewmbox').on('mouseup',function(){
		 	$('.left_wap').off('mousemove')
		})
		 //上传海报
		var clipArea_poster = new bjj.PhotoClip("#clipArea-poster", {
			size: [360, 540],// 截取框的宽和高组成的数组。默认值为[260,260]
			outputSize: [640, 1008], // 输出图像的宽和高组成的数组。默认值为[0,0]，表示输出图像原始大小
			//outputType: "jpg", // 指定输出图片的类型，可选 "jpg" 和 "png" 两种种类型，默认为 "jpg"
			file: ".file_input", // 上传图片的<input type="file">控件的选择器或者DOM对象
			ok: "#clipBtn-poster", // 确认截图按钮的选择器或者DOM对象
			loadStart: function() {
				// 开始加载的回调函数。this指向 fileReader 对象，并将正在加载的 file 对象作为参数传入
				$('.cover-wrap-poster').fadeIn();
				console.log("照片读取中");
			},
			loadComplete: function() {
				 // 加载完成的回调函数。this指向图片对象，并将图片地址作为参数传入
				console.log("照片读取完成");
			},
			//loadError: function(event) {}, // 加载失败的回调函数。this指向 fileReader 对象，并将错误事件的 event 对象作为参数传入
			clipFinish: function(dataURL) {
				 // 裁剪完成的回调函数。this指向图片对象，会将裁剪出的图像数据DataURL作为参数传入
				$('.cover-wrap-poster').fadeOut();
				$('img.poster_img').attr('src',dataURL);
				$('.left_wap .inner').hide().siblings('.poster_img_box').show();
				// $('.up_btn').removeClass('disabled')
				
			}
		});

  	}

}

var $tgaUpload_hotel = $('#hotelUpload').diyUpload({
				url: '',
				formData :{
					city_name:''
				},
				success: function(data) {
					
				},
				error: function(err) {
					
				},
				buttonText: '',
				fileNumLimit:10,
				fileSingleSizeLimit:50*1024*1024,//限制在50M
				accept: {
					title: "图片或者视频上传",
					extensions: 'gif,jpg,jpeg,bmp,png'
				},
				compress :{
					noCompressIfLarger: true
				},

				thumb: {
					width: 160,
					height: 120,
					quality: 100,
					allowMagnify: true,
					crop: true,
					type: "image/jpeg"
				}
		});

function toSport (){
	var dayindex ,spotIndex;
	var coverImg = '';

	//上传图片
		var $tgaUpload1 = $('#goodsUpload').diyUpload({
				url: '',
				formData :{
					city_name:''
				},
				success: function(data) {
					
				},
				error: function(err) {
					
				},
				buttonText: '',
				fileNumLimit:10,
				fileSingleSizeLimit:50*1024*1024,//限制在50M
				accept: {
					title: "图片或者视频上传",
					extensions: 'gif,jpg,jpeg,bmp,png'
				},
				compress :{
					noCompressIfLarger: true
				},

				thumb: {
					width: 160,
					height: 120,
					quality: 100,
					allowMagnify: true,
					crop: true,
					type: "image/jpeg"
				}
		});

		
		
	$('.eachlist.toSpot .editMask').on('click',function(){
		dayindex = $(this).parents('.daylist').attr('dayindex');
		spotIndex = $(this).parents('.toSpot').attr('spotindex');
    	$('#editBox').show(300);
    	var photo= daylist[dayindex].day[spotIndex].image_url||[];
    	var photoStr = '';
    	$(photo).each(function(i,ele){
    		photoStr+='<div class="imgouter"><img src='+this +'> <span index='+i+' class="delimg">删除图片</span></div>'
    	})
    	$('#editBox .phototr').html(photoStr)
    	editspot = daylist[dayindex].day[spotIndex].info;
    	$('#editBox #this_playtime').val(daylist[dayindex].day[spotIndex].this_playtime);
      $('.imgouter .delimg').on('click',function(){
         var _self  = this;
         var delQuery ={};
             delQuery.this_city_index = daylist[dayindex].this_city_index;
             delQuery.day_arry_index = daylist[dayindex].day_arry_index;
             delQuery.spot_index =  spotIndex;
             delQuery.trip_id = trip;
             var index = $(this).attr('index');
             $(this).parents('.phototr').find('.imgouter').each(function(i,ele){
                var eleindex = $(this).find('.delimg').attr('index');
                if(index==eleindex){
                  delQuery.image_index = i;
                }
             })
             
           layer.open({
              content: '图片删除后，将无法找回！',
              yes: function(index, layero){
              //do something
              layer.close(index); //如果设定了yes回调，需进行手工关闭
              $.post('../Detail/Deletepicture',delQuery,function(res){
                if(res.status==true){
                  layer.msg('删除成功',{
                    time:2000
                  })
                  $(_self).parents('.imgouter').remove();
                }else{
                  layer.msg('删除失败',{
                    time:2000
                  })
                }
              },'json').error(function(){
                  layer.msg('网络错误，删除失败')
              })

            }
           }); 
      })

    	var query = {};
    		query.info = editspot;
    		query.this_city_index = daylist[dayindex].this_city_index;
    		query.day_arry_index = daylist[dayindex].day_arry_index;
    		query.trip_id = trip;
    		query.spot_index =  spotIndex;
    		$('#editBox').find('#spot_name').val(query.info.spot_name).end()
    					 .find('.imgbox img').attr('src',query.info.spot_image_url).end()
    					 .find('#address').val(query.info.address).end()
    					 .find('#business_hours').val(query.info.business_hours).end()
    					 .find('#phone').val(query.info.phone).end()
    					 .find('#absture').val(query.info.absture).end()
    					 .find('#sremarks_title').val(daylist[dayindex].day[spotIndex].sremarks_title||'')
    					  /*var ue = UE.getEditor('t_container',{
    					  	autoHeightEnabled: true,
        					autoFloatEnabled: true,
        					initialFrameWidth: 690,
        					initialFrameHeight:300
    					  });
    					 ue.addListener("ready", function () {
       							 ue.setContent(query.info.attractions_tickets);
    					 });*/
    					 // console.log(query.info.attractions_tickets)
    					
    					ue.setContent(query.info.attractions_tickets||'');
    					ue2.setContent(query.info.spot_Introduction||'');
    					ue5.setContent(daylist[dayindex].day[spotIndex].spot_remarks||'');
    					// var ue = ueditorInit('t_container',query.info.attractions_tickets);
    					// var ue2 = ueditorInit('spot_Introduction',query.info.spot_Introduction);
    					// var ue3 = ueditorInit('remarks',(daylist[dayindex].remarks||''));//当天备注
    					// var ue4 = ueditorInit('traffic_marks',(daylist[dayindex].traffic_remarks||''));//当天大交通
    					// var ue5 = ueditorInit('spot_remarks',(daylist[dayindex].day[spotIndex].spot_remarks||''));//景点备注
	})	
	$('#editBox .submitbtn').on('click',function(){	  //景点提交
			editspot = daylist[dayindex].day[spotIndex].info;
      var image_url = daylist[dayindex].day[spotIndex].image_url;
			var query = {};
    		query.info = editspot;
    		query.this_playtime = $('#this_playtime').val();
    		query.this_city_index = daylist[dayindex].this_city_index;
    		query.day_arry_index = daylist[dayindex].day_arry_index;
    		query.trip_id = trip;
    		query.spot_index =  spotIndex;
    		query.info.spot_name = $('#spot_name').val()
    		query.info.address = $('#address').val()
    		query.info.business_hours = $('#business_hours').val()
    		query.info.phone = $('#phone').val();
    		query.info.absture = $('#absture').val();
    		query.spot_remarks = ue5.getContent();
    		query.info.attractions_tickets = ue.getContent()
    		query.sremarks_title = $('#sremarks_title').val()
    		query.info.spot_Introduction = ue2.getContent()
    		if(coverImg!=''){
    			query.info.cover = coverImg;
    		}
    		var query2 = new FormData()
    		query2.append('trip_id',trip)
    		query2.append('this_city_index',daylist[dayindex].this_city_index)
    		query2.append('day_arry_index',daylist[dayindex].day_arry_index)
    		query2.append('spot_index',spotIndex) 
    		var piclist = $tgaUpload1.getFiles('inited');
			$(piclist).each(function(i,ele){
				query2.append('file[]',ele.source.source)
			})
			$('.loading_mask').show()
			var imgtrue = false;
			var msgtrue = false;
      var addQuery = query;

			$.ajax({
                type:'POST',
                url:'../Detail/PhotoAlbum',
                data:query2,
                processData:false,
                contentType : false,
                dataType:'json',
                success:function(data){
                  if(image_url.length>0){
                     addQuery.image_url = image_url
                  }
                  if(data.data){
                      addQuery.image_url = data.data//重新上传景点相册后的数据
                  }

                  addQuery.uid = this_uid
                  imgtrue =  true;
                  if(imgtrue&&msgtrue){
                   		layer.msg('提交成功',{
    						          time:1000
    					          })
                  
                  
                  
                  setNewspotInfo(addQuery)
    					   
						     // $('.loading_mask').hide()
                }
                },
                error:function(res){

               	}
            });

    		$.post('../Detail/EditElement',query,function(res){
    			if(res.status==true){
            if(res.spot_image_url){
               addQuery.info.spot_image_url = res.spot_image_url;//重新上传景点相册后的数据
            }
           
    				msgtrue = true;
    				if(imgtrue&&msgtrue){
                    layer.msg('提交成功',{
    						    time:1000
    						  })
             
              setNewspotInfo(addQuery)
    					// $('#editBox').hide();
    					// window.location.reload();
						// $('.loading_mask').hide()
                   	}
    			}else{
    				layer.msg('提交失败请重试',{
    					time:1000
    				})
    			}
    		},'json')
			
			
		})
	

	$('.dayedit_mask').on('click',function(){
		$('#day_ramark').show(300);
		dayindex = $(this).parents('.daylist').attr('dayindex');
		ue3.setContent(daylist[dayindex].remarks||'');
    	ue4.setContent(daylist[dayindex].traffic_remarks||'');
    	if(!daylist[dayindex].one_city){
    		$('#day_ramark .croscity').hide()
    	}
    	$('#remarks_title').val(daylist[dayindex].remarks_title);
      if(daylist[dayindex].nowdate!=undefined){//表示编辑过
        // console.log(daylist[dayindex].nowdate)
         $('#day_ramark .daySourseEdit').val(daylist[dayindex].daynumber)
         $('#day_ramark').find('.date').val(daylist[dayindex].nowdate);
         $('#traffic_day').val(daylist[dayindex].bigtraffic);
         $('#day_ramark .distance').val(daylist[dayindex].tra_dis);
         $('#day_ramark  .usetime').val(daylist[dayindex].tra_time)
         $('#day_ramark .betw_time').val(daylist[dayindex].interval);
      }else{

          $('#day_ramark .daySourseEdit').val('Day'+(dayindex-0+1))
          $('#day_ramark').find('.date').val(daylist[dayindex].date);
          $('#traffic_day').val(daylist[dayindex].city_trc_name);
          $('#day_ramark .distance').val(daylist[dayindex].dis);
          $('#day_ramark  .usetime').val(daylist[dayindex].use_time)
          $('#day_ramark .betw_time').val(daylist[dayindex].betw_time);
      }
      

	})

	$('#day_ramark .submitbtn').on('click',function(){	 //天数备注提交
    		var query ={};
    		query.this_city_index = daylist[dayindex].this_city_index;
    		query.day_arry_index = daylist[dayindex].day_arry_index;
    		query.remarks = ue3.getContent();
    		query.remarks_title = $('#remarks_title').val();
    		query.traffic_remarks = ue4.getContent(); 
        query.trip_id = trip;       
        query.daynumber = $('#day_ramark .daySourseEdit').val();      
        query.nowdate = $('#day_ramark .date').val();      
        query.bigtraffic = $('#day_ramark #traffic_day').val();      
        query.tra_dis = $('#day_ramark .distance').val();      
        query.tra_time = $('#day_ramark .usetime').val();       
        query.interval = $('#day_ramark .betw_time').val();   		
    		$.post('../Detail/EditElement',query,function(res){
    			if(res.status==true){
    				layer.msg('提交成功',{
    					time:1000
    				})
    				$('#day_ramark').hide();
    				window.location.reload();
    			}else{
    				layer.msg('提交失败请重试',{
    					time:1000
    				})
    			}
    		},'json')
			
		})

	//上传景点封面
		var clipArea_cover = new bjj.PhotoClip("#clipArea", {
			size: [960, 640],// 截取框的宽和高组成的数组。默认值为[260,260]
			outputSize: [960, 640], // 输出图像的宽和高组成的数组。默认值为[0,0]，表示输出图像原始大小
			//outputType: "jpg", // 指定输出图片的类型，可选 "jpg" 和 "png" 两种种类型，默认为 "jpg"
			file: "#coverfile", // 上传图片的<input type="file">控件的选择器或者DOM对象
			ok: "#clipBtn", // 确认截图按钮的选择器或者DOM对象
			loadStart: function() {
				// 开始加载的回调函数。this指向 fileReader 对象，并将正在加载的 file 对象作为参数传入
				$('.cover-wrap').fadeIn();
				console.log("照片读取中");
			},
			loadComplete: function() {
				 // 加载完成的回调函数。this指向图片对象，并将图片地址作为参数传入
				console.log("照片读取完成");
			},
			//loadError: function(event) {}, // 加载失败的回调函数。this指向 fileReader 对象，并将错误事件的 event 对象作为参数传入
			clipFinish: function(dataURL) {
				 // 裁剪完成的回调函数。this指向图片对象，会将裁剪出的图像数据DataURL作为参数传入
				$('.cover-wrap').fadeOut();
				$('#editBox .imgbox img').attr('src',dataURL);
				coverImg = dataURL;
				
			}
		});	

		$('#day_ramark .submit .yl').on('click',function(){
			$('.daycity .dayedit_mask').hide();
			$('#day_ramark').hide()
			editdom = '#day_ramark'
			$('.cancel_yl').show()
			$('.day_wap .daylist').eq(dayindex).find('.daytip .m_inner').html('[温馨提示]：'+ue3.getContent())
			$('.day_wap .daylist').eq(dayindex).find('.city_trafffic .c_wap3').html('<p>交通备注：'+ue4.getContent()+'<span></span></p>')
			
			})

		$('#editBox .submit .yl').on('click',function(){
			$('.toSpot .editMask').hide();
			$('#editBox').hide()
			editdom = '#editBox'
			$('.cancel_yl').show()
			daylist[dayindex].remarks =  ue3.getContent()
			daylist[dayindex].traffic_remarks = ue4.getContent();
			$('.day_wap .daylist').eq(dayindex).find('.eachlist.toSpot').eq(spotIndex).find('.over_h').html($('#spot_name').val());
			$('.day_wap .daylist').eq(dayindex).find('.eachlist.toSpot').eq(spotIndex).find('.eachlist_img img').attr('src',$('#editBox .imgbox img').attr('src'));
			$('.day_wap .daylist').eq(dayindex).find('.eachlist.toSpot').eq(spotIndex).find('.spot_remarks .m_inner').html(ue5.getContent());
			
			
		})
		$('.cancel_yl').on('click',function(){
			$(editdom).show();
			$('.toSpot .editMask').removeAttr('style');
			$('.daycity .dayedit_mask').removeAttr('style');
		})

		$('#editBox .cancel').on('click',function(){
    		$('#editBox').hide(300);
    		$('.cancel_yl').hide();
    		$('.toSpot .editMask').removeAttr('style');
			$('.daycity .dayedit_mask').removeAttr('style');
    	})

    	$('#day_ramark .cancel').on('click',function(){
    		$('#day_ramark').hide(300);
    		$('.cancel_yl').hide();
    		$('.toSpot .editMask').removeAttr('style');
			$('.daycity .dayedit_mask').removeAttr('style');
    	})


};//

function setNewspotInfo (query){ //新增加七楼数据
  $.post('../Detail/addseven',query,function(res){
    if(res.status==true){
      $('#editBox').hide();
      $('.loading_mask').hide()
      window.location.reload();
    }

  },'json').error(function(){
    layer.msg('七数据保存失败')
  })
}

function ueditorInit (id,content) {
	var ue = UE.getEditor(id,{
    					  	autoHeightEnabled: true,
        					autoFloatEnabled: true,
        					initialFrameWidth: 690,
        					initialFrameHeight:300
    		  });
	 	
    	ue.addListener("ready", function () {
           ue.setContent(content);
           ue.execCommand('fontfamily','宋体');   //字体
           ue.execCommand('fontsize', '12px');       //字号
           ue.execCommand('lineheight',1.75);          //行间距
         
    	});

    	return ue;
}

function getFormatCode (strValue){
	return strValue.replace(/\r\n/g, '<br/>').replace(/\n/g, '<br/>').replace(/\s/g, ' ');
}


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

var eventUtil = {
			getEvent: function (event) {
				return event || window.event;
			},
			getPageX: function (event) {
				return event.pageX || event.clientX + document.documentElement.scrollLeft;
			},
			getPageY: function (event) {
				return event.pageY || event.clientY + document.documentElement.scrollTop;
			},
			stopPropagation: function (event) {
				if (event.stopPropagation) {
					event.stopPropagation();
				} else {
					event.cancelBubble = true;
				}
			},
			getTarget: function (event) {
				return event.target || event.srcElement;
			}
};



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
     var tripOverviewTemplate = ' <tr><td>第1天</td></tr>\
					<tr>\
						<td>途经城市</td>\
						<td><input type="text" class="" placeholder="请输入途经城市"></td>\
					</tr>\
					<tr>\
						<td><input type="text" placeholder="DAY1"></td>\
						<td><input type="text" class="" placeholder="如：城市A → 城市B"></td>\
					</tr>\
					<tr>\
						<td><input type="text" placeholder="日期 如：XX月XX日"></td>\
						<td><input type="text" class="" placeholder="请输入交通方式 如：汽车"></td>\
					</tr>\
					<tr>\
						<td>当天景点</td>\
						<td><input type="text" placeholder="请输入当天游玩景点"></td>\
					</tr>'
       

	 var  dayListTemplate =  '{{each daylist as value i}}\
     			<div class="daylist" dayindex="{{i}}" id=day{{i}}>\
					<div class="daycity">\
     					<div class="dayedit_mask">编辑当天备注</div>\
            {{if value.daynumber}}\
						<div class="time">\
							<p><span class="dayIndex">{{value.daynumber}}</span><span class="dateTime">{{ if value.date }}{{value.date.replace(".","月")+"日"}} {{/if}}</span></p><a class="toTripmap" href="javascript:;" index="{{i}}">地图模式</a>\
            </div>\
            {{/if}}\
					{{if value.one_city}}\
					<div class="city_trafffic">\
						<div class="c_wap2">\
							<span class="morebz down"></span>\
							<div class="date">\
								<p><span>{{value.one_city}}</span><span class="ico ico_{{value.traffic_ico}}"></span><span>{{value.two_city}}</span></p>\
							</div>\
							<div class="cros tac">\
								<p>{{value.dis}}公里</p>\
							</div>\
							<div class="usetime tar">\
								<p>约{{value.use_time}}小时</p>\
							</div>\
						</div>\
						<div class="c_wap3">\
							<p>交通备注：{{#value.traffic_remarks||"暂无"}}<span></span></p>\
						</div>\
					</div>\
					{{/if}}\
						<div class="dayc_tit">\
							<div class="cityneme">{{value.this_city}} <span class="fr">{{value.start_time}}-{{value.end_time}}</span></div>\
							<div class="soptline">\
								{{each value.day as spot j}}\
									<em>{{j+1}}</em> {{spot.this_name}}\
								{{/each}}\
							</div>\
							<div class="daytip">\
								<div class="m_inner">{{#value.remarks_title||"[温馨提示]"}}：{{#value.remarks||"暂无"}}</div>\
								<strong class="fr more">[ 查看更多 ]</strong>\
							</div>\
						</div>\
					</div>\
					{{if value.hotel.hotel_name}}\
					<div class="eachlist hotel">\
						<div class="hotelmask">点击修改</div>\
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
						<div class="editMask">编辑此景点</div>\
						<div class="eachtit"><em>{{key+1}}</em>\
							<div class="over_h">{{item.info.spot_name}}</div>\
							<span class="">游玩时间 {{item.this_playtime}}</span>\
						</div>\
						<div class="eachlist_img">\
								<img src="{{item.info.spot_image_url}}" alt="">\
						</div>\
						<div class="spot_remarks"><div class="m_inner">{{item.sremarks_title||"备注"}}：{{#item.spot_remarks||"暂无"}}</div><strong class="more">[ 查看更多 ]</strong></div>\
					 </div>\
						{{if key<value.day.length-1}}\
					 	<div class="common_traffic item_traffic" this_city="{{value.this_city}}" this_lng="{{item.this_lng}}" this_lat="{{item.this_lat}}" next_lng="{{value.day[key+1].this_lng}}" next_lat="{{value.day[key+1].this_lat}}">\
					 		公共交通信息不详\
					 	</div>\
					 	{{/if}}\
					 {{/each}}\
				</div>\
				{{/each}}'			

})