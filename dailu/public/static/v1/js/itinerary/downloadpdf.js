$(function(){
	 var trip = getUrlParam('trip');
    var u = getUrlParam('them');
    var this_uid = getCookie('uid');
    window.scrollTo(0,0);
   
    var ewm_url = window.location.href.replace('downpdf','tripinfoshare');
        ewm_url ='../store/getarcode?url='+ encodeURIComponent(ewm_url)
        $('.share_phone .share_code,.cover .right_code img').attr('src',ewm_url);
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
                var gailan_tit = '<span class="start">'+res.gailan.departure_city+'</span> — ';
                var gailan_tablestr =''; 
                $(res.gailan.go_city_array).each(function(i,ele){
                	mainMaparr.push(this.position);
                  gailan_tit+='<span class="num">'+(i+1)+'</span> '+this.city_name+' — '
                  lineCity+=this.city_name+'·';
                  lineTitle += this.city_name+'/';
                  var city_daynum_arr = [];
                  for(var k=0;k<this.city_daynum;k++){
                    first_day ++
                    city_daynum_arr.push(first_day);
                  }
                  this.city_daynum_arr = city_daynum_arr;
                  if(i==0){
                    gailan_tablestr += '<div class="list clearfix">'+
                    '<div class="item1 fl">D'+this.city_d_1+'</div>    '+
                    '<div class="item2 fl">'+this.city_date.substr(5).replace('-','.')+'</div>    '+
                    '<div class="item3 fl">'+res.traffic_money[i].city_trc_name+'</div>    '+
                    '<div class="item4 fl">'+res.traffic_money[i].start_city+' — '+res.traffic_money[i].city_name+'</div>'+
                    '</div>'
                  }
                
                  var daystr=''; 
                  var date = '';
                 for(var j=this.city_d_1;j<=this.city_d_2;j++){
                    daystr+='D'+j+'/'
                 }
                 daystr = daystr.substr(0, daystr.length - 1);
                 date += this.city_date.substr(5).replace('-','.')+' - '+ this.city_date2.substr(5).replace('-','.')

                 gailan_tablestr += '<div class="list clearfix">'+
                    '<div class="item1 fl">'+daystr+'</div>    '+
                    '<div class="item2 fl">'+date+'</div>    '+
                    '<div class="item3 fl">游玩</div>    '+
                    '<div class="item4 fl">'+this.city_name+'</div>'+
                    '</div>'
                 gailan_tablestr += '<div class="list clearfix">'+
                 '<div class="item1 fl">D'+this.city_d_2+'</div>    '+
                 '<div class="item2 fl">'+this.city_date2.substr(5).replace('-','.')+'</div>    '+
                 '<div class="item3 fl">'+res.traffic_money[i+1].city_trc_name+'</div>    '+
                 '<div class="item4 fl">'+res.traffic_money[i+1].start_city+' — '+res.traffic_money[i+1].city_name+'</div>'+
                 '</div>'
                });


                $('.day_info').append(gailan_tablestr);
                gailan_tit+='<span class="end">'+res.gailan.return_city+'</span>'
                lineTitle = lineTitle + res.gailan.return_city;
                lineCity = lineCity.substring(0,lineCity.length-1) + res.gailan.go_city_array.length +'城市' + res.gailan.day_num +'日游'
                $('.main .cover').find('.cover_title').text(lineCity).end()
                .find('.line_cros').text(lineTitle).end()
                .find('.create').text('时间：'+res.gailan.creat_time).end()
                .find('.author').text('作者：'+res.gailan.user_name);
                $('.main .cover .cover_img').attr('src',(res.gailan.image_cover||res.Schedufing[0].city_image_url));
                $('.gailan .gailan_cros').html(gailan_tit);
                renderMap(mainMaparr,$('.gailan .main_map'),true)
                 main($('.gailan .main_map').attr('src'), function(base64){
                    	$('.gailan .main_map').attr('src',base64);
                    });

              
                /*header部分 end*/
                /*行程概览 start*/
                var traffiCost  = res.traffic_money; 
                var trafficTot = 0;
                var traffic_table = '';
                $(traffiCost).each(function(i,ele) {
                	this.line_cros = this.start_city +'—'+this.city_name;
                	trafficTot += this.price*this.people;

                  traffic_table += '<div class="list clearfix">\
                  <div class="item1 fl">'+this.start_city+' — '+this.city_name+'（'+this.city_trc_name.substr(0,2)+'）</div>\
                  <div class="item2 fl">¥'+this.price+'</div>\
                  <div class="item3 fl">x'+this.people+'</div>\
                  <div class="item4 fl">¥'+this.people*this.price+'</div>\
                  </div>'
                })

                

                 $('.traffic_cost').append(traffic_table);  

                $('.gailan').find('em.people_num').text(res.gailan.adult+'成人，'+res.gailan.children+'儿童').end()
                .find('em.tot_day').text(res.gailan.day_num).end()
                .find('em.date').text(res.gailan.date).end()
                /*行程概览 end*/

                 /*费用清单 start*/
                    var hotel_tot =0;
                    var hotel_table ='';

                        $(res.hotel_money).each(function(i,ele){
                        hotel_tot += this.LowRate*this.number_night;
                        hotel_table+='<div class="list clearfix">\
                        <div class="item1 fl">'+this.hotel_name+'</div>\
                        <div class="item2 fl">¥'+(this.LowRate*1).toFixed(1)+'</div>\
                        <div class="item3 fl">x'+this.number_night+'</div>\
                        <div class="item4 fl">¥'+(this.number_night*this.LowRate).toFixed(1)+'</div>\
                        </div>'
                         
                        })
                        $('.hotel_cost').append(hotel_table);             
                       

                    var eat_tot =0;
                    var eat_table ='';

                        $(res.eat_money).each(function(i,ele){
                        eat_tot += this.price*this.people;
                        eat_table+='<div class="list clearfix">\
                        <div class="item1 fl">'+this.name+'</div>\
                        <div class="item2 fl">¥'+(this.price*1).toFixed(1)+'</div>\
                        <div class="item3 fl">x'+this.people+'</div>\
                        <div class="item4 fl">¥'+(this.price*this.people).toFixed(1)+'</div>\
                        </div>'
                            
                        })
                        $('.food_cost').append(eat_table);  
                       
                    
                /*费用清单 end*/
                /*daylist start*/
                var daylist = [];
                var day_list_img =[];
                var ticketCost = [];
                var ticketTot = 0 ;
                $(res.Schedufing).each(function(i,ele){
                    var that =this;
                    var sch_length = res.Schedufing.length-1;
                    if(i>0&&this.prevHotel){
                      daylist[(daylist.length-1)].hotel =this.prevHotel.hotel; 
                    }
                    $(that.day_arry).each(function(k,ele){
                        if(!this.hotel){
                          this.hotel={
                            hotel_name:''
                          }
                        }
                        

                        var temp =this;
                        var dayMapoint = [];
                        $(temp.day).each(function(){
                          dayMapoint.push({'lng':this.this_lng,'lat':this.this_lat});
                          var ticketTemp ={};
                          var strt,end,price;
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
                        temp.this_city = that.this_city;
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
                  $(daylist).each(function(i,ele){
                      if(i==0){   //解决一天多个城市的天数情况
                        this.dayindex  = i;
                        }else{
                             this.dayindex = daylist[i-1].dayindex +1
                        }  
                        if( i>0 &&  daylist[i-1].date == this.date){
                            this.dayindex = daylist[i-1].dayindex
                            
                        }
                  })
                    var ticket_table =''

                    $(ticketCost).each(function(i,ele){
                    ticket_table+='<div class="list clearfix">\
                    <div class="item1 fl">'+this.spotName+'</div>\
                    <div class="item2 fl">¥'+this.ticket+'</div>\
                    <div class="item3 fl">x'+this.peopleNum+'</div>\
                    <div class="item4 fl">¥'+this.totmoney+'</div>\
                    </div>'
                        
                    })
                    $('.ticket_cost').append(ticket_table);  
                    $('em.tot_money').text((eat_tot+hotel_tot+trafficTot+ticketTot).toFixed(1));      
                        var priceArr =[{value:eat_tot, name:'餐饮费用'},
                                        {value:trafficTot, name:'交通费用'},
                                        {value:hotel_tot, name:'住宿费用'},
                                        {value:ticketTot, name:'门票费用'}]
                        renderEchats(priceArr);
                        var p_right_str = '';
                        for(var i=0;i<priceArr.length;i++){
                            p_right_str += '<li class=""><span></span>'+priceArr[i].name +' <b style="color:red;">¥'+(priceArr[i].value).toFixed(2)+'</b> 起</li>'
                        }
                        $('.p_right ul').html(p_right_str);


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

                // console.log(dayListObj.daylist);
               
                var dayListRender = template.compile(dayListTemplate1);
                var html = dayListRender(dayListObj);

                $('.day_wap').html(html)
               
                $('.day_wap img.day_map').each(function(i,ele){
                	 var that = this;
                    renderMap(day_list_img[i],$(this))
                    main($(this).attr('src'), function(base64){
                    	$(that).attr('src',base64);
                    });
                })
                //实例化地图 算公共交通 start
                var Amap = new AMap.Map("mapContainer", {
                  center: [120.583213,29.992493],
                  zoom: 14
                });
                $('.common_traffic').each(function(i,ele){
                  var _self = this;
                  var crosStr = '';
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
                      // console.log(result)
                      
                      if(result.info=='OK'){
                         $(result.plans[0].segments).each(function(){ //获取查询结果的第一条线路规划
                             crosStr+=this.instruction;
                         })
                        $(_self).html('相距'+(result.plans[0].distance/1000).toFixed(2)+'公里·乘坐公共交通约'+(result.plans[0].time/3600).toFixed(1)+'小时<span class="fr">详情</span>')
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

                
                /*页面加载完毕 自动下载pdf文件*/

                $('.download_pdf').on('click',function(){
                  
                    downPdf();
                })
               function downPdf (){
                  var usual_height = $('.integral').height()
                  var mul =  usual_height/1128;
                  var mul2 = Math.ceil(mul)
                  $('.integral').height(mul2*1128);
                	window.scrollTo(0,0);
                   disabledMouseWheel();
                  $('.download_pdf').hide();
                  $('.mask').show();
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
                  $('.download_pdf').show();
                  normalMouseWheel();
                  $('.integral').height(usual_height);
              }
          })
        };
         /*页面加载完毕 自动下载pdf文件 end*/

    },'json')
	

     var dayListTemplate1 ='{{each daylist as value i}}\
     <div class="list">\
        <div class="title_1">D{{value.dayindex+1}} {{value.this_city}}</div>\
        <div class="date">{{value.date.replace(".","月")+"日"}}</div>\
        <div class="service"></div>\
        <img index={{i}} class="day_map" src="/static/v1/img/dt.png" alt="">\
        <div class="p_left18">\
          {{if value.one_city}}\
          <div class="day_city  l_circle">{{value.one_city}}</div>\
          <div class="city_traffic">{{value.city_trc_name+" · "+value.dis}}公里 · 约{{value.use_time}}小时 <span class="fr ctrl">订票</span></div>\
          <div class="day_city l_circle">{{value.two_city}}</div>\
          {{if i<daylist.length-1}}\
          <div class="this_introduce">\
            <div class="introduce_1 clearfix">\
              <div class="left_img fl">\
                <img src="{{value.city_image_url}}" alt="">\
              </div>\
              <div class="right_info fr">\
                <div class="info_list">知名景点：{{value.famous_spot}}</div>\
                <div class="info_list">特色美食：{{value.special_food}}</div>\
                <div class="info_list">特色商品：{{value.special_goods}}</div>\
                <div class="info_list">机场：{{value.airport}}</div>\
                <div class="info_list">火车站：{{value.trainStation}}</div>\
              </div>\
            </div>\
            <div class="introduce_2">{{value.two_city_Introduction}}</div>\
          </div>\
          {{/if}}\
          <div class="city_traffic">距离不详 <span class="fr ctrl">可选接站服务</span></div>\
          {{/if}}\
          {{if value.hotel.hotel_name}}\
          <div class="hotel_wap">\
            <div class="hotel_tit l_circle"><span class="type">住</span>{{value.hotel.hotel_name}}</div>\
            <div class="hotel_introduce">\
              <div class="introduce_1 clearfix">\
                <div class="left_img fl">\
                  <img src="{{value.hotel.ThumbNailUrl}}" alt="">\
                </div>\
                <div class="right_info fr">\
                  <div class="info_list">酒店房价：{{value.hotel.LowRate}}起</div>\
                  <div class="info_list">详细地址：{{value.hotel.address}}</div>\
                  <div class="info_list">联系电话：{{value.hotel.tel}}</div>\
                  <div class="info_list">酒店星级：不详</div>\
                </div>\
              </div>\
              <div class="introduce_2">{{value.hotel.Features}}</div>\
            </div>\
          </div>\
                {{if value.day[0]}}\
            <div this_city={{value.this_city}} this_lng="{{value.hotel.lng}}" this_lat={{value.hotel.lat}} next_lng="{{value.day[0].this_lng}}" next_lat={{value.day[0].this_lat}} class="city_traffic common_traffic">暂无公共交通信息 </div>\
                {{/if}}\
          {{/if}}\
          {{each value.day as item key}}\
          <div class="list_tit l_circle"><span class="type type{{item.this_floor_index}}"></span>{{item.info.spot_name}}<span class=" play_time">适玩{{item.info.play_time}}</span></div>\
          <div class="list_introduce">\
              <div class="introduce_1 clearfix">\
                <div class="left_img fl">\
                  <img src="{{item.info.spot_image_url}}" alt="">\
                </div>\
                <div class="right_info fr">\
                  <div class="info_list">营业时间：{{item.info.business_hours}}</div>\
                  <div class="info_list">详细地址：{{item.info.address}}</div>\
                  <div class="info_list">联系电话：{{item.info.phone}}</div>\
                  <div class="info_list">人均消费：{{#item.info.attractions_tickets}}</div>\
                </div>\
              </div>\
              <div class="introduce_2">{{item.info.absture}}</div>\
          </div>\
            {{if key<value.day.length-1}}\
              <div this_city={{value.this_city}}  this_lng="{{item.this_lng}}" this_lat="{{item.this_lat}}" next_lng="{{value.day[key+1].this_lng}}" next_lat="{{value.day[key+1].this_lat}}" class="common_traffic city_traffic">暂无公共交通信息 </div>\
            {{/if}}\
          {{/each}}\
        </div>\
      </div>\
      {{/each}}'


     

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
            if(isCitys){
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
            var imgsrc = 'http://maps.google.cn/maps/api/staticmap?center='+center.lat+','+center.lng +'zoom=1&size=733x450&maptype=roadmap'+markerstr+'&path=color:0xFF0000|weight:5'+  pathstr +'&key=AIzaSyDyRjVndlLtlpWVIg_RSfgGYLUUvclNLGw';
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