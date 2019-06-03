$(function(){
	var trip = getUrlParam('trip');
    var u = getUrlParam('them');
    var this_uid = getCookie('uid');
    var lineCity =''; 
    var share_pic = 'http://a.dailuer.com/static/v1/img/tripinfoShare/prev1.png'; /*分享出去的预览图*/
	var share_url; /*分享的url*/
	var sharetitle=""; /*微信分享的标题*/
	var sharedesc="袋鹿旅行，自由行的必备工具"; /*微信分享的副标题*/


$.post('BooksData',{'collect_uid':this_uid,'uid':u,'trip_id':trip},function(res){
	if(!res) return false;
	if(!res.hotel_money) res.hotel_money = [];
	$(res.gailan.go_city_array).each(function(i,ele){
		switch(this.city_trc_name.trim())
		{
			case '铁路交通':
			this.traffic_ico = 'train'
			this.use_time = this.trainTime
			break;
			case '飞机交通':
			this.traffic_ico = 'plane';
			this.use_time = this.flightTime
			break;
			default:
			this.traffic_ico  = 'bus'
			this.use_time = '';
		}
		res.Schedufing[i].city_trc_name = this.city_trc_name;
		res.Schedufing[i].traffic_ico = this.traffic_ico;
		res.Schedufing[i].dis = this.dis;
		res.Schedufing[i].use_time = this.use_time;
	})
	/*header部分 start*/
	var lineTitle = res.gailan.departure_city+'/';
	var mainMaparr = [{lat:res.gailan.dep_lat,lng:res.gailan.dep_lng}];
	$(res.gailan.go_city_array).each(function(i,ele){
		mainMaparr.push(this.position);
		lineCity+=this.city_name+'·';
		lineTitle += this.city_name+'/';
	});
	lineTitle = lineTitle + res.gailan.return_city;
	lineCity = lineCity.substring(0,lineCity.length-1) + res.gailan.go_city_array.length +'城市' + res.gailan.day_num +'日游'
	var u_time = res.gailan.date.replace(/-/g,'.') +' - ' + res.xianlu.return_date.replace(/-/g,'.');
	$('.main_msg').find('.trip_title').text(lineCity).end()
				  .find('.trip_city').text(lineTitle).end()
				  .find('.user .fr').text(u_time).end()
				  .find('.user .fl').text('作者：'+res.gailan.user_name);
  	
	renderMap(mainMaparr,$('.main_tripimg img'))

	/*header部分 end*/
	/* 自定义微信分享*/
		sharetitle = res.gailan.user_name + '的' + lineCity +'行程单';
		$("meta[itemprop=name]").attr('content',sharetitle);
		wechatConfig()

	/*行程概览 start*/
	var traffiCost  = res.traffic_money; 
	var trafficTot = 0;
	var traffic_table = '';
	var bus_num  = 0 ; 
	var plane_num = 0 ; 
	var train_num = 0 ; 
	$(traffiCost).each(function(i,ele) {
		this.line_cros = this.start_city +'—'+this.city_name;
		trafficTot += this.price*this.people;
		switch(this.city_trc_name.trim())
		{
			case '铁路交通':
			this.traffic_ico = 'train'
			train_num++;
			break;
			case '飞机交通':
			this.traffic_ico = 'plane'
			 plane_num++;
			break;
			default:
			this.traffic_ico = 'bus'
			bus_num ++ ;
		}
		traffic_table +='<div class="wap_list clearfix"><span class="fl"><i class="ico_bill '+ this.traffic_ico+'"></i>'+this.line_cros+'</span><span class="fr list_money">¥ '+this.price+' x'+this.people+'</span></div>'
	})
	$('.bill_wap.traffic').append(traffic_table).find('.wap_tit .list_money').text('¥ '+trafficTot.toFixed(2));

	var p_str = plane_num>0?'飞机'+plane_num+'次，':'';
	var t_str = train_num>0?'铁路'+train_num+'次，':'';
	var b_str = bus_num>0?'飞机'+bus_num+'次，':'';
	var  traffic_num = 	p_str+t_str;
	$('.trip_prev').find('.person_num').text(res.gailan.adult+'成人，'+res.gailan.children+'儿童').end()
					.find('.day_num').text(res.gailan.day_num+'天').end()
					.find('.start_city').text(res.gailan.departure_city).end()
					.find('.last_city').text(res.gailan.return_city).end()
					.find('.start_date').text(res.gailan.date).end()
					.find('.hotel_num').text('共'+res.hotel_money.length).end()
					.find('.traffic_num').text(traffic_num.substring(0,traffic_num.length-1))


		

	/*行程概览 end*/

	/*费用清单*/
	var hotel_table = '';
		hotel_tot_money  = 0;
	$(res.hotel_money).each(function(i,ele){
			hotel_table += '<div class="wap_list clearfix"><span class="fl"><i class="ico_bill hotel"></i>'+this.hotel_name+'</span><span class="fr list_money">¥ '+this.LowRate+' x'+this.number_night+'</span></div>'
			hotel_tot_money +=this.number_night*this.LowRate;	
	})
	$('.bill_wap.hotel').append(hotel_table).find('.wap_tit .list_money').text('¥ '+hotel_tot_money.toFixed(2));

	var eating_table = '';
		eat_tot_money  = 0;
	$(res.eat_money).each(function(i,ele){
			eating_table += '<div class="wap_list clearfix"><span class="fl"><i class="ico_bill canyin"></i>'+this.name+'</span><span class="fr list_money">¥ '+this.price+' x'+this.people+'</span></div>'
			eat_tot_money +=this.price*this.people;	
	})
	$('.bill_wap.food').append(eating_table).find('.wap_tit .list_money').text('¥ '+eat_tot_money.toFixed(2));
	$('.tot_money').text('¥ '+(eat_tot_money+hotel_tot_money+trafficTot)+'元')

	/*daylist start*/
	var daylist = [];
	var day_list_img =[];
		$(res.Schedufing).each(function(i,ele){
			var that =this;
			var sch_length = res.Schedufing.length;
			$(that.day_arry).each(function(k,ele){
				var temp =this;
				var dayMapoint = [];
					$(temp.day).each(function(){
						dayMapoint.push({'lng':this.this_lng,'lat':this.this_lat})
					})
				temp.use_time = that.use_time;
				temp.traffic_ico = that.traffic_ico;
				temp.city_trc_name = that.city_trc_name;
				temp.dis = that.dis;
				temp.mapPosition = dayMapoint;
				temp.city_image_url = that.city_image_url;
				temp.two_city = this.two_city?this.two_city:that.day_arry[0].two_city;
				// temp.two_city =that.day_arry[0].two_city;

				temp.two_city_Introduction = that.city_Introduction;
				temp.two_city_abbreviation = that.city_abbreviation;
				temp.one_city_abbreviation = daylist.length>0?daylist[daylist.length-1].two_city_abbreviation :'';
				temp.one_city_Introduction = daylist.length>0?daylist[daylist.length-1].two_city_Introduction :'';
				daylist.push(temp);
				// console.log(temp)
				day_list_img.push(dayMapoint);
			})
		})
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
		// console.log(daylist)
	   var dayListObj = {};
                dayListObj.daylist = daylist;
            var dayListRender = template.compile(dayListTemplate);
            var html = dayListRender(dayListObj);
            $('.day_wap').html(html)
            $('.map_img .day_list_img').each(function(i,ele){
				renderMap(day_list_img[i],$(this))

            })
        /*daylist end*/



        var priceArr =[{value:eat_tot_money, name:'餐饮费用'},
                {value:trafficTot, name:'交通费用'},
                {value:hotel_tot_money, name:'住宿费用'}]
		renderEchats(priceArr);

},'json')


/*微信分享 start*/
// var mpid = 'wx6a68684031971e42';



function wechatConfig() {
    
    share_url = window.location.href.split('#')[0];
    console.log(share_url)
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
                    'onMenuShareTimeline',
                    'onMenuShareAppMessage',
                    'onMenuShareQQ',
                    'onMenuShareWeibo'
                ]
            });
            wx.ready(function () {
                wx.onMenuShareAppMessage({
                    title: sharetitle,
                    desc: sharedesc,
                    link: share_url,
                    imgUrl: share_pic,
                    success: function (res) {
                    },
                    cancel: function (res) {
                    },
                    fail: function (res) {
                    }
                });

             
                wx.onMenuShareTimeline({
                    title: sharetitle+sharedesc,
                    link: share_url,
                    imgUrl: share_pic,
                    success: function (res) {
                    },
                    cancel: function (res) {
                    },
                    fail: function (res) {
                    }
                });
                wx.onMenuShareQQ({
					title: sharetitle, // 分享标题
					desc: sharedesc, // 分享描述
					link: share_url, // 分享链接
					imgUrl: share_pic, // 分享图标
					success: function () {
					
					},
					cancel: function () {
					
					}
				});
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
        var myChart = echarts.init(document.getElementById('p-left'));
 
        // 指定图表的配置项和数据

        var option = {
                        tooltip: {
                            trigger: 'item',
                            formatter: "{a} <br/>{b}: {c} ({d}%)"
                        },
                        legend: {
                            orient: 'vertical',
                            x: 'right',
                            data:['餐饮费用','交通费用','住宿费用']
                        },
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
                                    return '总费用\n '+(priceArr[0].value+priceArr[1].value+priceArr[2].value).toFixed(2)
                                },
                                textStyle: {
                                    fontSize: '20',
                                    fontWeight: 'bold',
                                    backgroundColor:'#f6f6f6',
                                    textAlign:'center',

                                }

                            },
                            emphasis: {
                                show: true,
                                textStyle: {
                                    fontSize: '20',
                                    fontWeight: 'bold',
                                    backgroundColor:'#f6f6f6',
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
       function renderMap (pointArr,selector){
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
            for(var i= 0;i<pointArr.length;i++){
                markerstr += '&markers=color:blue|label:'+(i +1) +'|'+pointArr[i].lat+','+pointArr[i].lng;
                pathstr += '|'+pointArr[i].lat+','+pointArr[i].lng;
            }

            var imgsrc = 'http://maps.google.cn/maps/api/staticmap?center='+center.lat+','+center.lng +'zoom=1&size=678x400&maptype=roadmap'+markerstr+'&path=color:0xFF0000|weight:5'+  pathstr +'&key=AIzaSyDyRjVndlLtlpWVIg_RSfgGYLUUvclNLGw';
           	selector.attr('src',imgsrc)
           /* var tempImage = new Image();
            tempImage.src = imgsrc;
            tempImage.crossOrigin = "*";
            tempImage.onload = function(){
            	var base64 = getBase64Image(tempImage);
            	$('.rightPic  img').attr('src',base64) 
            }*/
    }

     /*图片地图end*/

     var dayListTemplate ='{{each daylist as value i}}\
     		<div class="day_list">\
     			<p style="width:100%;height:1px;background-color:#e5e5e5;margin-bottom:0.2rem;"></p>\
				<div class="tit clearfix">\
					<span class="fl">D{{i+1}} {{if value.one_city}}{{value.one_city+" - "}}{{/if}} <span>{{value.two_city}}</span></span>\
					<span class="fr">{{value.date}}<span class="one_time">09:00-19:00</span></span>\
				</div>\
				<div class="map_img">\
					<img class="day_list_img" src="{{value.city_image_url}}" alt="">\
				</div>\
				{{if value.one_city}}\
				<div class="city_wap">\
					<div class="info_wap info_wap circle mb_18">\
						<div class="city_name">{{value.one_city}}<span class="py">{{value.one_city_abbreviation}}</span></div>\
						<div class="city_msg">{{value.one_city_Introduction}}</div>\
					</div>\
					<div class="info_wap city_traffic train mb_18">\
							<div class="city_name">{{value.one_city}}<span>→{{value.two_city}}</span></div>\
							<div class="city_msg">\
								{{value.city_trc_name}} · {{value.dis}}公里 · {{value.use_time}}小时  |  未订票\
							</div>\
					</div>\
					<div class="info_wap info_wap circle mb_18">\
							<div class="city_name">{{value.two_city}}<span class="py">{{value.two_city_abbreviation}}</span> <span class="jz">接站</span></div>\
							<div class="city_msg">{{value.two_city_Introduction}}</div>\
					</div>\
				</div>\
				{{/if}}\
				{{if value.hotel.hotel_name}}\
				<div class="hotel_wap">\
					<div class="hotel_img">\
						<img src="{{value.hotel.ThumbNailUrl}}" alt="">\
					</div>\
					<div class="info_wap hotel_info hotel b_b">\
						<div class="city_name">{{value.hotel.hotel_name}}</div>\
						<div class="phone">联系电话：{{value.hotel.tel}}</div>	\
						<div class="address">详细地址：{{value.hotel.address}}</div>	\
					</div>\
					<div class="info_wap common_traffic bus mb_18">\
						<div class="city_name">公共交通 · 1.1公里 · 20分钟</div>	\
					</div>\
				</div>\
				{{/if}}\
				<div class="spot_wap">\
					{{each value.day as item k}}\
					<div class="spot_list">\
						<div class="spot_img">\
							<img src="{{item.info.spot_image_url}}" alt="">\
						</div>	\
						<div class="spot_wap_info ico_num b_b">\
							<i>{{k+1}}</i>\
							<div class="spot_name clearfix"><span class="name">{{item.info.spot_name}}</span><span class="time fr">适玩{{item.info.play_time}}</span></div>\
							<div class="spot_msg">{{item.info.absture}}</div>	\
						</div>	\
						<div class="spot_wap_info spot_ico mb_18">\
							<div class="on_time">营业时间：{{item.info.business_hours}}</div>	\
							<div class="pay_one">人均消费：{{#item.info.attractions_tickets}}</div>	\
							<div class="phone">联系电话：{{item.info.phone}}</div>	\
							<div class="address">详细地址：{{item.info.address}}</div>	\
						</div>		\
					</div>	\
					{{/each}}\
				</div>\
			</div>\
     					   {{/each}}'



})