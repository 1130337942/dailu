$(function(){
	var trip = getUrlParam('trip');
    var u = getUrlParam('them');
    var this_uid = getCookie('uid');
    window.scrollTo(0,0);
    disabledMouseWheel();
    var ewm_url = window.location.href.replace('downpdf','tripinfoshare');
        ewm_url ='../store/getarcode?url='+ encodeURIComponent(ewm_url)
        $('.ewm_box .line_ewm').attr('src',ewm_url);
    $.post('BooksData',{'collect_uid':this_uid,'uid':u,'trip_id':trip},function(res){
    		if(!res.Schedufing) return false ;
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
                var lineCity = '';
                var lineTitle = res.gailan.departure_city+'/';
                var mainMaparr = [{lat:res.gailan.dep_lat,lng:res.gailan.dep_lng}];
               	var first_day = 0;
                $(res.gailan.go_city_array).each(function(i,ele){
                	mainMaparr.push(this.position);
                	lineCity+=this.city_name+'·';
                	lineTitle += this.city_name+'/';
                	var city_daynum_arr = [];
                    for(var k=0;k<this.city_daynum;k++){
                        first_day ++
                        city_daynum_arr.push(first_day);
                    }
                    this.city_daynum_arr = city_daynum_arr;
                });
                lineTitle = lineTitle + res.gailan.return_city;
                lineCity = lineCity.substring(0,lineCity.length-1) + res.gailan.go_city_array.length +'城市' + res.gailan.day_num +'日游'
                var u_time = res.gailan.date.replace(/-/g,'.') +' - ' + res.xianlu.return_date.replace(/-/g,'.');
                $('.main .sur').find('.line_tit').text(lineCity).end()
                .find('.line_cros').text(lineTitle).end()
                .find('.line_time').text(u_time).end()
                .find('.user').text('作者：'+res.gailan.user_name);
                $('.main .sur .travel_img').attr('src',res.Schedufing[0].city_image_url);
                renderMap(mainMaparr,$('.line_img img'))
                 main($('.line_img img').attr('src'), function(base64){
                    	$('.line_img img').attr('src',base64);
                    });
                /*header部分 end*/
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
                	 traffic_table += '<div class="cost_list_item">'+
							'<span class="tab_head"><i class="'+this.traffic_ico+'"></i>'+this.line_cros+'</span>'+
							'<span class="tab_price"><em>¥'+(this.price).toFixed(1)+'</em> 起</span>'+
							'<span class="tab_num">x'+this.people+'</span>'+
							'<span class="tab_tot"><em>¥'+(this.people*this.price).toFixed(1)+'</em> 起</span>'+
							'</div>'
                })
                	
                 $('.cost_list_traffic').html(traffic_table);  

                var p_str = plane_num>0?'飞机'+plane_num+'次，':'';
                var t_str = train_num>0?'铁路'+train_num+'次，':'';
                var b_str = bus_num>0?'飞机'+bus_num+'次，':'';
                var  traffic_num = 	p_str+t_str+b_str ;
                $('.summarize').find('.person_num').text(res.gailan.adult+'成人，'+res.gailan.children+'儿童').end()
                .find('.day_num').text(res.gailan.day_num+'天').end()
                .find('.start_city').text(res.gailan.departure_city).end()
                .find('.last_city').text(res.gailan.return_city).end()
                .find('.start_date').text(res.gailan.date).end()
                .find('.hotel_num').text('共'+res.hotel_money.length).end()
                .find('.traffic_num').text(traffic_num.substring(0,traffic_num.length-1));

                /*行程概览 end*/

                /*行程线路 start*/
                $('.travel_line .start_catalog span').text(res.gailan.departure_city)
                $('.travel_line .start_catalog .day').text(res.gailan.date)
                $('.travel_line .city_catalog_last span').text(res.gailan.return_city)
                $('.travel_line .city_catalog_last .day').text(res.xianlu.return_date)
                var overviewRender = template.compile(overviewTemplate);
                var overview_str = overviewRender(res.gailan);
                    $('.city_catalog_last').before(overview_str);
                /*行程线路 end*/
                 /*费用清单 start*/
                    var hotel_tot =0;
                    var hotel_table =''

                        $(res.hotel_money).each(function(i,ele){
                        hotel_tot += this.LowRate*this.number_night;
                             hotel_table += '<div class="cost_list_item">'+
							'<span class="tab_head"><i class="hotel"></i>'+this.hotel_name+'</span>'+
							'<span class="tab_price"><em>¥'+(this.LowRate*1).toFixed(1)+'</em> 起</span>'+
							'<span class="tab_num">x'+this.number_night+'</span>'+
							'<span class="tab_tot"><em>¥'+(this.number_night*this.LowRate).toFixed(1)+'</em> 起</span>'+
							'</div>'
                        })
                        $('.cost_list_hotel').html(hotel_table);             
                                   
                    var eat_tot =0;
                    var eat_table =''

                        $(res.eat_money).each(function(i,ele){
                        eat_tot += this.price*this.people;
                            eat_table += '<div class="cost_list_item">'+
							'<span class="tab_head"><i class="canyin"></i>'+this.name+'</span>'+
							'<span class="tab_price"><em>¥'+(this.price*1).toFixed(1)+'</em> 起</span>'+
							'<span class="tab_num">x'+this.people+'</span>'+
							'<span class="tab_tot"><em>¥'+(this.price*this.people).toFixed(1)+'</em> 起</span>'+
							'</div>'
                        })
                        $('.cost_list_eat').html(eat_table);  
                        $('.clost .num em').text('¥'+(eat_tot+hotel_tot+trafficTot).toFixed(1))         
                        var priceArr =[{value:eat_tot, name:'餐饮费用'},
                                        {value:trafficTot, name:'交通费用'},
                                        {value:hotel_tot, name:'住宿费用'}]
                        renderEchats(priceArr);
                        var p_right_str = '';
                        for(var i=0;i<priceArr.length;i++){
                            p_right_str += '<li class="fl"><span></span>'+priceArr[i].name +' <b style="color:red;">¥'+(priceArr[i].value).toFixed(2)+'</b> 起</li>'
                        }
                        $('.eahart ul').html(p_right_str);
                /*费用清单 end*/
                /*daylist start*/
                var daylist = [];
                day_list_img =[];
                $(res.Schedufing).each(function(i,ele){
                    var that =this;
                    var sch_length = res.Schedufing.length-1;
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
                        temp.two_city_Introduction = that.city_Introduction;
                        temp.two_city_abbreviation = that.city_abbreviation;
                        temp.one_city_abbreviation = daylist.length>0?daylist[daylist.length-1].two_city_abbreviation :'';
                        temp.one_city_Introduction = daylist.length>0?daylist[daylist.length-1].two_city_Introduction :'';
                        daylist.push(temp);
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
                var dayListObj = {};
                dayListObj.daylist = daylist;
                var dayListRender = template.compile(dayListTemplate);
                var html = dayListRender(dayListObj);

                $('.day_wap').append(html)
                $('.day_wap .city_map img').each(function(i,ele){
                	var that = this;
                    renderMap(day_list_img[i],$(this))
                    main($(this).attr('src'), function(base64){
                    	$(that).attr('src',base64);
                    });
                })
                /*页面加载完毕 自动下载pdf文件*/
                setTimeout(function(){
                	window.scrollTo(0,0);
                	html2canvas($('.main')[0], {
                		onrendered:function(canvas) {
                			var contentWidth = canvas.width;
                			var contentHeight = canvas.height;
                  //一页pdf显示html页面生成的canvas高度;
                  var pageHeight = contentWidth / 595.28 * 841.89;
                  //未生成pdf的html页面高度
                  var leftHeight = contentHeight;
                  //pdf页面偏移
                  var position = 0;
                  //a4纸的尺寸[595.28,841.89]，html页面生成的canvas在pdf中图片的宽高
                  var imgWidth = 595.28;
                  var imgHeight = 595.28/contentWidth * contentHeight;
                  var pageData = canvas.toDataURL('image/jpeg', 1);
                  var pdf = new jsPDF('', 'pt', 'a4');
                  //有两个高度需要区分，一个是html页面的实际高度，和生成pdf的页面高度(841.89)
                  //当内容未超过pdf一页显示的范围，无需分页
                  if (leftHeight < pageHeight) {
                  	pdf.addImage(pageData, 'JPEG', 0, 0, imgWidth, imgHeight );
                  } else {
                  	while(leftHeight > 0) {
                  		pdf.addImage(pageData, 'JPEG', 0, position, imgWidth, imgHeight)
                  		leftHeight -= pageHeight;
                  		position -= 841.89;
                          //避免添加空白页
                          if(leftHeight > 0) {
                          	pdf.addPage();
                          }
                      }
                  }
                  pdf.save('dailuer.pdf');
                  $('.mask').hide();
                  normalMouseWheel();

              }
          })
        },2000);
         /*页面加载完毕 自动下载pdf文件 end*/

    },'json')
	

/*
     $('.download_pdf').on('click',function(){
         window.scrollTo(0,0);
         html2canvas($('.main')[0], {
              onrendered:function(canvas) {
                  var contentWidth = canvas.width;
                  var contentHeight = canvas.height;
                  //一页pdf显示html页面生成的canvas高度;
                  var pageHeight = contentWidth / 595.28 * 841.89;
                  //未生成pdf的html页面高度
                  var leftHeight = contentHeight;
                  //pdf页面偏移
                  var position = 0;
                  //a4纸的尺寸[595.28,841.89]，html页面生成的canvas在pdf中图片的宽高
                  var imgWidth = 595.28;
                  var imgHeight = 595.28/contentWidth * contentHeight;
                  var pageData = canvas.toDataURL('image/jpeg', 1);
                  var pdf = new jsPDF('', 'pt', 'a4');
                  //有两个高度需要区分，一个是html页面的实际高度，和生成pdf的页面高度(841.89)
                  //当内容未超过pdf一页显示的范围，无需分页
                  if (leftHeight < pageHeight) {
                      pdf.addImage(pageData, 'JPEG', 0, 0, imgWidth, imgHeight );
                  } else {
                      while(leftHeight > 0) {
                          pdf.addImage(pageData, 'JPEG', 0, position, imgWidth, imgHeight)
                          leftHeight -= pageHeight;
                          position -= 841.89;
                          //避免添加空白页
                          if(leftHeight > 0) {
                              pdf.addPage();
                          }
                      }
                  }
                  pdf.save('content.pdf');
                  normalMouseWheel();
              }
          })
     });*/

      var dayListTemplate = '{{each daylist as value i}}\
                   <div class="daylist">\
                       <div class="tit">\
                           <span class="day_index">D{{i+1}}</span>\
                           <span class="city_line">{{if value.one_city}}{{value.one_city}} —— {{/if}}{{value.two_city}}</span>\
                           <span class="use_time">09:00-19:00</span>\
                           <span class="date fr">{{value.date}}</span>\
                       </div>\
                       <div class="city_map">\
                           <img index = "{{i}}" src="" alt="">\
                       </div>\
                       <div class="inner_box">\
                           {{if value.one_city}}\
                           <div class="inner_tit circle">\
                               <span class="cityName">{{value.one_city}}</span> <span class="tip">{{value.one_city_abbreviation}}</span>\
                           </div>\
                           <div class="inner_msg">{{value.one_city_Introduction}}</div>\
                           <div class="point city2city">\
                               <i class="wap_ico {{value.traffic_ico}}"></i>\
                               <span class="p_line">{{value.one_city}}-{{value.two_city}}</span> | {{value.city_trc_name}}·{{value.dis}}公里·{{value.use_time}}小时20分钟\
                           </div>\
                           <div class="inner_tit circle">\
                               <span class="cityName">{{value.two_city}}</span> <span class="tip">{{value.two_city_abbreviation}}</span>\
                           </div>\
                           <div class="inner_msg">{{value.two_city_Introduction}}</div>\
                           <div class="p_line" style="margin:20px 0">\
                               <i class="wap_ico taxi"></i>\
                               接{{value.city_trc_name}}服务\
                           </div>\
                           {{/if}}\
                           {{if value.hotel.hotel_name}}\
                           <div class="hotel_wap">\
                               <div class="inner_tit point">\
                                   <span class="cityName hotel">{{value.hotel.hotel_name}}</span> \
                               </div>\
                               <div class="deeptime">\
                                   入住日期 {{value.date}}\
                               </div>\
                               <div class="">联系电话：<span>{{value.hotel.tel}}</span></div>\
                               <div class="">详细地址：<span>{{value.hotel.address}}</span></div>\
                           </div>\
                           {{/if}}\
                           <div class="spot_wap">\
                               {{each value.day as item k}}\
                               <div class="spot_list">\
                                   <div class="inner_tit">\
                                       <em>{{k+1}}</em>\
                                       <span class="cityName">{{item.info.spot_name}}</span> <span class="tip">适玩{{item.info.play_time}}</span>\
                                   </div>\
                                   <div class="spot_info">\
                                       <div class="clearfix" style="margin-bottom: 10px;">\
                                           <div class="img_box fl">\
                                               <img src="{{item.info.spot_image_url}}" alt="">\
                                           </div>\
                                           <div class="fr spot_msg">\
                                               <div class="on_time">营业时间：<span>{{item.info.business_hours}}</span></div>\
                                               <div class="one_pay">人均消费：{{#item.info.attractions_tickets}}</div>\
                                               <div class="address">详细地址：<span>{{item.info.address}}</span></div>\
                                               <div class="phone">联系电话：<span>{{item.info.phone}}</span></div>\
                                           </div>\
                                       </div>\
                                       <div>{{item.info.absture}}</div>\
                                   </div>\
                               </div>\
                               {{/each}}\
                           </div>\
                       </div>\
                   </div>\
           {{/each}}'

      var overviewTemplate = '{{each go_city_array as value i}}\
                                    <div class="city_catalog">\
                                    <i class="zxq_ico">{{i+1}}</i>\
                                    <span>{{value.city_name}}</span>\
                                        <div class="day fr">\
                                        {{each value.city_daynum_arr as item k}}\
                                            <span>D{{item}}</span>\
                                        {{/each}}\
                                        </div>\
                                    </div>\
                                {{/each}}' 

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
            var imgsrc = 'http://maps.google.cn/maps/api/staticmap?center='+center.lat+','+center.lng +'zoom=1&size=640x480&maptype=roadmap'+markerstr+'&path=color:0xFF0000|weight:5'+  pathstr +'&key=AIzaSyDyRjVndlLtlpWVIg_RSfgGYLUUvclNLGw';
            selector.attr('src',imgsrc);
    }

     /*图片地图end*/

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
	/*图片转 base64 start*/	
    function getBase64Image(img) {
    	var canvas = document.createElement("canvas");
    	canvas.width = img.width;
    	canvas.height = img.height;
    	var ctx = canvas.getContext("2d");
    	ctx.drawImage(img, 0, 0, img.width, img.height);
   		var dataURL = canvas.toDataURL("image/jpeg");  // 可选其他值 image/png
   	    return dataURL;
	}	

	function main(src, cb) {
		var image = new Image();
		src= src+'&v=' + Math.random();
		image.src = src ;
	    /*image.src = src + '?v=' + Math.random(); // 处理缓存*/
	    image.crossOrigin = "*";  // 支持跨域图片
	    image.onload = function(){
	    	var base64 = getBase64Image(image);
	    	cb && cb(base64);
	    }
	}
	/*图片转 base64 end*/
	function disabledMouseWheel() {
		if (document.addEventListener) {
			document.addEventListener('DOMMouseScroll', scrollFunc, false);
  		}
  		window.onmousewheel = document.onmousewheel = scrollFunc;//IE/Opera/Chrome
	}
	function normalMouseWheel() {
		if (document.addEventListener) {
			document.addEventListener('DOMMouseScroll', null, false);
  		}
  		window.onmousewheel = document.onmousewheel = null;//IE/Opera/Chrome
	}

	function scrollFunc(evt) {
		evt = evt || window.event;
		if(evt.preventDefault) {
	    // Firefox
	    evt.preventDefault();
	    evt.stopPropagation();
	} else {
	      // IE
	      evt.cancelBubble=true;
	      evt.returnValue = false;
	  }
	  return false;
	}
   
})