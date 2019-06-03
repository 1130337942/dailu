$(function($){
//配置turn.json
            var map;
            var day_list_img = [];
            var daylist=[];
            var bookData;
            var trip = getUrlParam('trip');
            var u = getUrlParam('them');
            var this_uid = getCookie('uid');   
            var ewm_url = window.location.href.replace('books','tripinfoshare');
            ewm_url ='../store/getarcode?url='+ encodeURIComponent(ewm_url);
            var issue = false ;
            var travelHotelArr=[];
            var travelFoodArr=[];
            var FlightPath ,//红色连线
                FlightPath_blue,//蓝色连线
                Dottedline, //定义虚线
                Dottedline_array = [], //虚线;
                markerArr =[],
                FlightPath_arr=[],//所有点的marker
                spot_polyline,
                spotPolyline_array=[]; //景点的连线数组
            sessionStorage.setItem("trip_id",trip);
            sessionStorage.setItem("isEdit",'ok');
            $('.phone_img .ewm,.hard_last .ewm').attr('src',ewm_url);
            if(u!=this_uid){
               $('.editTrip').hide();
            }
        $('.editTrip').on('click',function(oEvent){
            //省份下的城市
            window.location.href="/portal/scenerymap/attractionsArrange.html";
        })
        

            $.post('BooksData',{'collect_uid':this_uid,'uid':u,'trip_id':trip},function(res){
                if(!res.Schedufing) return false ;
 
                if(res.gailan.old_new && res.gailan.old_new == 'new'){//判断是不是老单
                    $('.calendar.calendar_pat').remove()
                }else{
                    layer.msg('部分景点已经更新，袋鹿建议您重新规划行程',{
                        time:3000
                    },function(){
                        window.history.go(-1);
                    })
                    $('.calendar.new_calendar_pat').remove()
                    $('.calendar.calendar_pat').hide();
                    $('.book_box').show();
                }


                if(res.status!=0) {//未发布
                    $('.issue').addClass('disabled').removeClass('issue').text('已发布');
                    issue = true;
                }
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
                        this.use_time = this.trafficTime;
                    }
                    res.Schedufing[i].city_trc_name = this.city_trc_name;
                    res.Schedufing[i].traffic_ico = this.traffic_ico;
                    res.Schedufing[i].dis = this.dis;
                    res.Schedufing[i].use_time = this.use_time;
                })
               
                /*行程线路部分 start*/
                
                var lineTitle = res.gailan.departure_city+'/';
                var mainMaparr = [{lat:res.gailan.dep_lat,lng:res.gailan.dep_lng}];
                var gailan = '';
                var first_day  = 0;
                $(res.gailan.go_city_array).each(function(i,ele){
                    mainMaparr.push(this.position);
                    lineTitle += this.city_name+'/';
                    var city_daynum_arr = [];
                    for(var k=0;k<this.city_daynum;k++){
                        first_day ++
                        city_daynum_arr.push(first_day);
                    }
                    this.city_daynum_arr = city_daynum_arr;
                });
               
                lineTitle = lineTitle + res.gailan.return_city;
                $('.overview .header_line').text(lineTitle);
                $('.city_catalog_box .start_catalog span').text(res.gailan.departure_city)
                $('.city_catalog_box .start_catalog .day').text(res.gailan.date)
                $('.city_catalog_box .city_catalog_last span').text(res.gailan.return_city)
                $('.city_catalog_box .city_catalog_last .day').text(res.xianlu.return_date)
                var overviewRender = template.compile(overviewTemplate);
                var overview_str = overviewRender(res.gailan);
                    $('.city_catalog_last').before(overview_str);
                renderMap(mainMaparr,$('.main_map img'),true);

                /*行程链路部分 end*/


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
                    traffic_table +='<div class="list">'+
                                   '    <span class="wap_1">'+
                                   '        <i class="wap_ico '+this.traffic_ico+'"></i>'+ this.line_cros+
                                   '    </span>'+
                                   '    <span class="wap_2">¥'+ this.price +'起</span>'+
                                   '    <span class="wap_3">x'+ this.people +'</span>'+
                                   '    <span class="wap_3">¥'+this.price*this.people +'起</span>'+
                            '</div>'
                });
                $('.wap_content_traffic').html(traffic_table);

                var p_str = plane_num>0?'飞机'+plane_num+'次，':'';
                var t_str = train_num>0?'铁路'+train_num+'次，':'';
                var b_str = bus_num>0?'其它交通'+bus_num+'次，':'';
                var  traffic_num =  p_str+t_str+b_str ;
                $('.overview').find('.person_num').text(res.gailan.adult+'成人，'+res.gailan.children+'儿童').end()
                .find('.day_num').text(res.gailan.day_num+'天').end()
                .find('.start_city').text(res.gailan.departure_city).end()
                .find('.last_city').text(res.gailan.return_city).end()
                .find('.start_date').text(res.gailan.date).end()
                .find('.hotel_num').text('共'+res.hotel_money.length).end()
                .find('.traffic_num').text(traffic_num.substring(0,traffic_num.length-1));
                /*行程概览 end*/

                /*right_bar start*/
                var right_bar_str = '';
                    for(var i= 0; i<res.gailan.day_num;i+=2){
                        var D2 = (i+2)>res.gailan.day_num?'':'/D'+(i+2);
                        right_bar_str += '<li index='+(6+i) +' class="bar dayindex">D'+ (i+1)+D2+'</li>'
                    }
                    $('.book_right_bar ul').append(right_bar_str);
                /*right_bar end*/

                /*费用清单 start*/
                    var ticket_tot = 0;
                    var ticket_table='';
                    var hotel_tot =0;
                    var hotel_table =''

                        $(res.hotel_money).each(function(i,ele){
                        hotel_tot += this.LowRate*this.number_night;
                        hotel_table += '<div class="list">'+
                                   '   <span class="wap_1">'+
                                   '        <i class="wap_ico hotel"></i>'+this.hotel_name+
                                   '    </span>'+
                                   '    <span class="wap_2">¥'+(this.LowRate*1).toFixed(1)+'起</span>'+
                                   '    <span class="wap_3">x'+this.number_night+'</span>'+
                                   '    <span class="wap_3">¥'+(this.number_night*this.LowRate).toFixed(1)+'起</span>'+
                            '</div>'
                        })
                        $('.wap_content_hotel').html(hotel_table);             
                                   
                    var eat_tot =0;
                    var eat_table =''

                        $(res.eat_money).each(function(i,ele){
                        eat_tot += this.price*this.people;
                        eat_table += '<div class="list">'+
                                   '   <span class="wap_1">'+
                                   '        <i class="wap_ico hotel"></i>'+this.name+
                                   '    </span>'+
                                   '    <span class="wap_2">¥'+(this.price*1).toFixed(1)+'起</span>'+
                                   '     <span class="wap_3">x'+this.people+'</span>'+
                                   '    <span class="wap_3">¥'+(this.price*this.people).toFixed(1)+'起</span>'+
                            '</div>'
                        })
                        $('.wap_content_eat').html(eat_table);  
                        // $('.travel_tot_money').text((eat_tot+hotel_tot+trafficTot).toFixed(2));         
                       /* var priceArr =[{value:eat_tot, name:'餐饮费用'},
                                        {value:trafficTot, name:'交通费用'},
                                        {value:hotel_tot, name:'住宿费用'},
                                        {value:ticket_tot, name:'门票费用'}]
                        renderEchats(priceArr)
                        var p_right_str = '';
                        for(var i=0;i<priceArr.length;i++){
                            p_right_str += '<li class="fl"><span></span>'+priceArr[i].name +' '+(priceArr[i].value).toFixed(2)+'元</li>'
                        }
                        $('.percentBox .p-right ul').html(p_right_str);*/
                /*费用清单 end*/

                /*daylist start*/
                daylist = [];
                day_list_img =[];
                $(res.Schedufing).each(function(i,ele){
                    var that =this;
                    var sch_length = res.Schedufing.length-1;
                    var foodTemp ={};
                        foodTemp.len = this.day_arry.length;
                        foodTemp.food =[];
                    if(i<sch_length){
                        this.day_arry[this.day_arry.length-1].hotel=res.Schedufing[i+1].prevHotel?res.Schedufing[i+1].prevHotel.hotel:this.day_arry[this.day_arry.length-1].hotel;
                    }; //本城市最后一天的hotel
                    $(that.day_arry).each(function(k,ele){
                        var temp =this;
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
                        temp.dateCity =  that.this_city;  
                        var dayMapoint = [];
                        
                        if(this.eat){
                            foodTemp.food.push(this.eat)
                        }

                        if(this.hotel && res.allhotel){
                            $(res.allhotel).each(function(){
                                if(temp.date ==  this.date){
                                    temp.hotel= this;         
                                }
                            })

                            
                        }
                        if(i>0 && this.date==res.Schedufing[i-1].day_arry[prevdayLength-1].date){
                            if(!daylist[daylist.length-1].day){ //如果没有day 字段
                                daylist[daylist.length-1].day=[];
                            }
                           daylist[daylist.length-1].dateCity = daylist[daylist.length-1].dateCity+'/'+that.this_city;
                           if(this.day.length>0){
                            this.day[0].crossCity  = 'cross';
                           }
                           this.transport=this.transport?this.transport:[];

                           [].push.apply(daylist[daylist.length-1].day,this.day);
                           [].push.apply(daylist[daylist.length-1].transport,this.transport);
                           // if(this.hotel){
                           //      res.Schedufing[i-1].day_arry[prevdayLength-1].hotel = '';
                           //      travelHotelArr[travelHotelArr.length-1]=this.hotel;
                           // }
                           return true;
                        }
                        if(!this.hotel){
                            this.hotel={
                                hotel_name:''
                            }
                        }
                        travelHotelArr.push(this.hotel);
                       /* if(this.SpotDisSum){
                            this.dis = this.SpotDisSum;
                        }*/
                        $(temp.day).each(function(){
                            dayMapoint.push({'lng':(this.this_lng||this.info.this_lng),'lat':(this.this_lat||this.info.this_lat)})
                        })
                        temp.thisCity = that.this_city;
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
                    travelFoodArr.push(foodTemp);
                })

                /*费用清单 景点门票start*/
                $(daylist).each(function(i,ele){
                    if(!this.day){
                        this.day=[];//有些数据里没有day字段报错
                    }
                    $(this.transport).each(function(){
                        var hours = deFormatHour(this.trafficTime)
                        this.hours = hours;
                        switch(this.city_trc_name.trim())
                            {
                                case '铁路交通':
                                this.traffic_ico = 'date_train'
                                break;
                                case '飞机交通':
                                this.traffic_ico = 'date_air'
                                break;
                                case '汽车交通':
                                this.traffic_ico = 'date_bus'
                                break;
                                default:
                                this.traffic_ico = 'date_other'
                            }
                    }) 
                   

                    if(i==0){   //解决一天多个城市的天数情况
                        this.dayindex  = i;
                    }else{
                         this.dayindex = daylist[i-1].dayindex +1
                    }  
                    if( i>0 &&  daylist[i-1].date == this.date){
                        this.dayindex = daylist[i-1].dayindex
                        
                    }
                   
                    $(ele.day).each(function(){
                        var temp ={};
                        var strt,end,price;
                            temp.ticket=0;
                            if(!this.info){
                                this.info ={};
                            }
                        if(this.info.ticket_data!=undefined){
                            temp.ticket=this.info.ticket_data;
                        }else{ 
                            if(this.info.attractions_tickets){
                                start = this.info.attractions_tickets.indexOf("成人票：");
                                end = this.info.attractions_tickets.indexOf("元/人"); 
                                price =  (start=="-1"||end=="-1")?0:parseFloat(this.info.attractions_tickets.substring(start+4,end));
                                temp.ticket=Boolean(price)?price:0;
                            }
                        }
                        
                        
                        temp.spotName=this.info.spot_name; 
                        temp.type="门票费用";
                        temp.totmoney =  temp.ticket==0?'不详' : '¥' + (res.gailan.adult * temp.ticket) + '起';
                        temp.peopleNum = res.gailan.adult + res.gailan.children;
                        ticket_tot+=res.gailan.adult * temp.ticket;
                        ticket_table += '<div class="list">'+
                                   '   <span class="wap_1">'+
                                   '        <i class="wap_ico hotel"></i>'+temp.spotName+
                                   '    </span>'+
                                   '    <span class="wap_2">¥'+ temp.ticket+'</span>'+
                                   '     <span class="wap_3">x'+temp.peopleNum+'</span>'+
                                   '    <span class="wap_3">'+temp.totmoney+'</span>'+
                            '</div>'
                    })
                })
               
                 $('.wap_content_ticket').html(ticket_table);  
                 $('.travel_tot_money').text((eat_tot+hotel_tot+trafficTot+ticket_tot).toFixed(2));
                 var priceArr =[{value:eat_tot, name:'餐饮费用'},
                                        {value:trafficTot, name:'交通费用'},
                                        {value:hotel_tot, name:'住宿费用'},
                                        {value:ticket_tot, name:'门票费用'}]
                        renderEchats(priceArr)
                        var p_right_str = '';
                        for(var i=0;i<priceArr.length;i++){
                            p_right_str += '<li class="fl"><span></span>'+priceArr[i].name +' '+(priceArr[i].value).toFixed(2)+'元</li>'
                        }
                        $('.percentBox .p-right ul').html(p_right_str);

                 /*费用清单 景点门票end*/
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
                    tot_day= daylist.length;
                $('.time_line  .tit1').text(res.gailan.day_num+'天')
                var calendarRender = template.compile(calendarTemplate);
                var calendarHtml = calendarRender(dayListObj);
                $('.flag_before').before(html);
                $('.day_wap_outer .day_inner').html(calendarHtml);
                // var crostrafficStr ;
                // var crossTrafic = $('.datespot.cross').parents('.daylist').find('.traffic_block');
                //     $(crossTrafic).each(function(i,ele){
                //         if(i==crossTrafic.length-1){
                //             crostrafficStr = ele;
                //         }
                //     })
                // $('.datelist_box .daylist').each(function(){

                // })
                 bookData = res
                 mapCtrl.initCtrl(res.Schedufing)//地图 渲染
                 mapCtrl.renderAllcity(res.gailan);
                 // mapCtrl.renderCity(res.Schedufing[0]);
                 // mapCtrl.renderDay(res.Schedufing[0],0)
                $('.datespot.cross').each(function(i,ele){
                    var _self = this;
                    var city = $(this).attr('cityname')
                    var cossTraff = $(this).parents('.daylist').find('.traffic_date');
                        cossTraff.each(function(){
                            if(city == $(this).attr('twocity')){
                                $(_self).before(this)
                                $(this).css({
                                    position:'relative',
                                    top:'0',
                                    left:'0'
                                });
                            }
                        })
                    // $(this).before(cossTraff.eq(i)[0])
                    // cossTraff.eq(i).remove()
                })
                var calendarHotelStr = '';
                var calendarFoodStr = '';
                
                $(travelHotelArr).each(function(i,ele){
                    if(this.hotel_name){
                        calendarHotelStr +=  '<div class="hotel_box fl">\
                            <div class="hotel_name">'+this.hotel_name+' <i class="hotel_ico"></i></div>\
                            <div class="toBook">\
                                <div class="book_tit" data-id='+ this.hotel_id +'>'+this.hotel_name+'</div>\
                                <div class="tips">地址：'+this.address+' | ¥'+this.LowRate+'起</div>\
                                <div class="clearfix">\
                                    <span class="fl book_btn hide">去预定</span>\
                                    <span class="fr ico hotel_ico"></span>\
                                    <span class="close_info"></span>\
                                </div>\
                            </div>\
                      </div>'
                  }else{
                    calendarHotelStr += '<div class="hotel_box fl"><div class="no_hotel">暂未安排酒店</div> </div>';
                  }
                    
                });

                $(travelFoodArr).each(function(){
                        var _self = this;
                         calendarFoodStr+='<div style="width:'+(228*this.len+this.len)+'px;" class="bottom_food_outer fl">'+
                            '<div class="bottom_food_list">'
                                $(this.food).each(function(i,ele){
                                   calendarFoodStr+=  i<_self.food.length-1?this.store_name+'、':this.store_name
                                   
                                })
                               calendarFoodStr+='</div></div>';
                })
                
                $('#datebox  .bottom_hotel .hotel_ul').append(calendarHotelStr);
                $('.calendar_pat .bottom_food_box').html(calendarFoodStr);
                    modeldatePointer();
                    calcspotHeight()
                    loadApp()

                  $('.book_right_bar').on('click','.bar',function(){
                        if($(this).hasClass('active')) return false;
                        $(this).addClass('active').siblings().removeClass('active');
                        var index = $(this).attr('index');
                         $("#flipbook").turn("page",index);
                  })
                $('.day_list .map img').each(function(i,ele){
                    renderMap(day_list_img[i],$(this))

                })

                     $('#flipbook .page').each(function(i,ele){
                    
                    if(i%2 ==!0){ 
                        $(this).css({'backgroundColor':'#f0f0f0'})
                    }else{
                        $(this).find('.page_tit').css({'textAlign':'right'})
                    }
                })
               
                /*daylist end*/
                /*f发布行程*/
                $('.issue').on('click',function(){
                    if(issue) return false ;
                    $.post('publish_trip',{'uid':u,'trip_id':trip},function(res){
                        if(res.status=='ok'){
                            $('.issue').addClass('disabled').text('已发布')
                             issue = true ;
                             window.location.href= '/portal/itinerary/tripInfo/'+trip+'.html';
                        }else{
                             alert('行程发布失败');
                        }
                        
                      
                    },'json')
                })
     },'json')
        
       
                                      
                // loadApp()
                function loadApp() {
                    $('#flipbook').turn({
                        // Width
                        width: 1100,
                        // Height
                        height: 660,
                        // Elevation
                        elevation: 300,
                        display: 'double',
                        page:2,//初始页面
                        // pages:10,
                        // Enable gradients
                        gradients: true,
                        // Auto center this flipbook
                        autoCenter: true,
                        when: {
                            turning: function (e, page, view) {
                                var totPage = $("#flipbook").turn("pages")
                                if(page<2||page>(totPage-1)) {
                                    return false;
                                }
                                 $('.day_list .map img').each(function(i,ele){
                                     var index =  $(this).attr('index')
                                     renderMap(day_list_img[index],$(this))

                                })  
                                
                            },
                            turned: function (e, page, view) {
                                $('.book_right_bar .bar').each(function(){
                                    if(page == $(this).attr('index')||page==($(this).attr('index')*1+1)){
                                        $(this).addClass('active').siblings().removeClass('active');
                                    }
                                })
                                var total = $("#flipbook").turn("pages");//总页数                        
                          
                            }
                        }
                    })
                }

		$(window).on('keydown',function(e){
			if(e.keyCode==37){
				$('#flipbook').turn('previous');
			}
			if(e.keyCode==39){
				$('#flipbook').turn('next');
			}
		})
        
        /*$('.new_calendar_pat .day_wap_outer,.calendar_pat .day_wap_outer').on('click','.day_list_title',function(){
            var index = $(this).parent('.day_list').attr('index');
           renderMap(day_list_img[index],$('.cimgMask img'));
           $('.cimgMask').show().on('click',function(){
                $(this).hide();
           })
           $(window).on('keyup',function(event){
                if(event.keyCode==27){
                   $('.cimgMask').hide();
                }
           })
        })*/
         



         var dayListTemplate = '{{each daylist as value i}}\
                    <div class="page">\
                        <div class="page_inner page_list">\
                            <div class="page_head clearfix">\
                                <span class="fl">日程安排</span><span class="fr">袋鹿旅行</span>\
                            </div>\
                            {{if i==0}}\
                            <div class="page_tit">\
                                <div class="book_title">日程安排</div>\
                                <div class="">\
                                    <span>SCHEDULE</span>\
                                </div>\
                            </div>\
                            {{/if}}\
                            <div class="day_list">\
                                <div class="day_list_tit city">\
                                    <span class="day_num">D{{value.dayindex+1}}</span>\
                                    <span class="city_line">{{value.thisCity}}</span>\
                                    {{if value.start_time}}\
                                    <span class="time_line">{{value.start_time + " - " + value.end_time }}</span>\
                                    {{else}}\
                                    <span class="time_line">{{if i==0}}13:00{{else}}09:00{{/if}} -19:00</span>\
                                    {{/if}}\
                                    <span class="date fr">{{value.date}}</span>\
                                </div>\
                                <div class="map">\
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
                                        <span class="p_line">{{value.one_city}}-{{value.two_city}}</span> | {{value.city_trc_name}}.{{value.dis}}公里·{{value.use_time}}小时\
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
                                                <span class="cityName">{{item.info.spot_name}}</span> <span class="tip">游玩时间 {{item.this_playtime}}</span>\
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

        var calendarTemplate='{{each daylist as value i}}\
            <li class="daylist fl">\
                <div class="daytit" >\
                    <div class="daynum">第{{value.dayindex+1}}天</div>\
                    <div class="tit_city">{{value.date}} {{value.weeks||""}} |  {{value.dateCity}}</div>\
                </div>\
                <div class="distance">里程 · {{if value.SpotDisSum}} {{value.SpotDisSum+"公里"}} {{else}} 不详{{/if}} <span class="traffic_type hide">包车</span></div>\
                <div class="no_with start_time" start_time="{{value.start_time}}">\
                </div>\
                {{if value.transport}}\
                <div twocity = {{value.transport[0].two_city}} class="block traffic_block traffic_date" style="min-height:64px; max-height:79px; height:{{value.transport[0].hours*40}}px">\
                    <div class="block_in traff" style="">\
                        <div class="in_title">{{value.transport[0].one_city}} — {{value.transport[0].two_city}}</div>\
                        <div class="tip">交通 · {{value.transport[0].trafficTime}}</div>\
                        <i class="ico {{value.transport[0].traffic_ico}}"></i>  \
                    </div>\
                    <div class="toBook">\
                        <div class="book_tit">{{value.transport[0].one_city}} — {{value.transport[0].two_city}}</div>\
                        <div class="tips">{{value.transport[0].city_date}} | {{value.transport[0].city_trc_name}}·{{value.transport[0].dis}}公里·{{value.transport[0].trafficTime}} | ¥{{value.transport[0].price}}起</div>\
                        <div class="clearfix">\
                            <span class="fl book_btn hide">去预定</span>\
                            <span class="fr ico {{value.transport[0].traffic_ico}}"></span>\
                            <span class="close_info"></span>\
                        </div>\
                    </div>\
                </div>\
                {{/if}}\
                {{each value.day as item key}}\
                {{if item.this_tag_time>3}}\
                    <div cityname="{{item.info.city_name}}" class="block datespot {{item.crossCity}}" style="height:{{40*item.this_tag_time}}px;" city_id ={{item.city_id}} spot_name={{item.this_name}} lng={{item.this_lng}} lat={{item.this_lat}} this_type={{item.this_type}} this_floor_index={{item.this_floor_index}}>\
                        <div class="block_in gai" {{if item.eat_info&&item.eat_info.length>0}} style="padding-bottom:52px;"{{/if}}>\
                            <div class="block_in_up">\
                                <div class="in_title"><span>{{key+1}}.</span>{{item.info.spot_name}}</div>\
                                <div class="tip">景点 · 游玩 {{item.this_playtime}}</div>\
                                <i class="ico sport"></i>   \
                            </div>\
                            {{if item.eat_info&&item.eat_info.length>0}}\
                            <div class="block_in_down">\
                                <div class="food_inner">\
                                {{each item.eat_info as list j}}\
                                <div class="in_title_s">{{list.name}}</div>\
                                {{/each}}\
                                </div>\
                                <i class="ico cy"></i>  \
                            </div>\
                            {{/if}}\
                        </div>\
                    </div>\
                    <div class="no_with" style="height: 16px;"></div>\
                {{else}}\
                <div cityname="{{item.info.city_name}}" class="block datespot {{item.crossCity}}" style="height:{{40*item.this_tag_time}}px;" city_id ={{item.city_id}} spot_name={{item.this_name}} lng={{item.this_lng}} lat={{item.this_lat}} this_type={{item.this_type}} this_floor_index={{item.this_floor_index}}>\
                    <div class="gai block_in clearfix" style="">\
                        <div class="block_in_left fl" {{ if item.eat_info &&item.eat_info.length>0}} style="width: 116px;"{{/if}}>\
                            <div class="in_title_s"><span>{{key+1}} .</span>{{item.info.spot_name}}</div>\
                            <div class="tip_s">景点 · 游玩 {{item.this_playtime}}</div>\
                            <i class="ico sport"></i>   \
                        </div>\
                        {{if item.eat_info&&item.eat_info.length>0}}\
                        <div class="block_in_right fr" style="width: 44px; padding: 10px 12px;">\
                            <div class="food_inner">\
                            {{each item.eat_info as list j}}\
                                <div class="in_title_s dis_none">{{list.name}}</div>\
                            {{/each}}\
                            </div>\
                            <i class="ico cy"></i>   \
                        </div>\
                        {{/if}}\
                    </div>\
                </div>\
                <div class="no_with" style="height: 16px;"></div>\
                {{/if}}\
                {{/each}}\
                {{if value.day.length==0}}\
                    <div class="notravel">当天没有行程</div>\
                {{/if}}\
                {{if value.transport}}\
                {{each value.transport as traffic k}}\
                    {{if k>0}}\
                    <div twocity = {{traffic.two_city}} class="block traffic_date" style="min-height:64px; max-height:79px; height:{{traffic.hours*40}}px">\
                        <div class="block_in traff" style="">\
                            <div class="in_title">{{traffic.one_city}} — {{traffic.two_city}}</div>\
                            <div class="tip">交通 · {{traffic.trafficTime}}</div>\
                            <i class="ico date_train"></i>  \
                        </div>\
                        <div class="toBook">\
                            <div class="book_tit">{{traffic.one_city}} — {{traffic.two_city}}</div>\
                            <div class="tips">{{traffic.city_date}} | {{traffic.city_trc_name}}·{{traffic.dis}}公里·{{traffic.trafficTime}} | ¥{{traffic.price}}起</div>\
                            <div class="clearfix">\
                                <span class="fl book_btn hide">去预定</span>\
                                <span class="fr ico {{traffic.traffic_ico}}"></span>\
                                <span class="close_info"></span>\
                            </div>\
                        </div>\
                    </div>\
                    {{/if}}\
                {{/each}}\
                {{/if}}\
            </li>\
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
            if(pointArr.length<1){
                selector.attr('src','/static/v1/img/nodata_day.png')
                return false ;
            }
            if(isCitys){ //游玩城市概览 显示出发城市
              markerstr = '&markers=icon:http://www.dailuer.com/static/v1/img/map/departureicon.png|'+pointArr[0].lat+','+pointArr[0].lng;
              for(var i= 0;i<pointArr.length-1;i++){
                markerstr += '&markers=color:red|label:'+(i +1) +'|'+pointArr[i+1].lat+','+pointArr[i+1].lng;
                pathstr += '|'+pointArr[i+1].lat+','+pointArr[i+1].lng;
              }
            }else{
              for(var i= 0;i<pointArr.length;i++){
                markerstr += '&markers=color:red|label:'+(i +1) +'|'+pointArr[i].lat+','+pointArr[i].lng;
                pathstr += '|'+pointArr[i].lat+','+pointArr[i].lng;
              }
            }
            /*for(var i= 0;i<pointArr.length;i++){
                markerstr += '&markers=color:red|label:'+(i+1) +'|'+pointArr[i].lat+','+pointArr[i].lng;
                pathstr += '|'+pointArr[i].lat+','+pointArr[i].lng;
            }*/
            //   AIzaSyAC3WnNnGZrYPuklsqw19790DmJ99c5xNU
            var imgsrc = 'http://maps.google.cn/maps/api/staticmap?key=AIzaSyDyRjVndlLtlpWVIg_RSfgGYLUUvclNLGw&center='+center.lat+','+center.lng +'zoom=15&size=678x400&maptype=roadmap'+markerstr+'&path=color:0xFF0000|weight:5'+pathstr;
            // var imgsrc = 'http://maps.google.cn/maps/api/staticmap?center='+center.lat+','+center.lng +'zoom=1&size=678x400&maptype=roadmap'+markerstr+'&path=color:0xFF0000|weight:5'+  pathstr +'&key=AIzaSyBcGy-zXcXLVGAmVvG3IJsnw_WVVIH8cOY&signature=VWWPUMyKSepuBHEedSs7bSGC0Y0=';
                imgsrc = encodeURI(imgsrc)
                // var keystr ='&signature=KVcIQXhgPfSLBY-FQZjznrpuYvg='
                // imgsrc = imgsrc + keystr
            selector.attr('src',imgsrc)
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
    $('.app_btn,.ewm').on('click',function(){
        $('.ewm').toggleClass('scale');
    })
     
    $('.left_tab span , .downshare').on('click',function(){
        $('.hotelmsg').hide();
        // if($(this).hasClass('active')) return false;
        $(this).addClass('active').siblings().removeClass('active');
        switch($(this).attr('tar'))
                    {
                        case 'books':
                       $('.book_box').show().siblings().hide()
                        break;
                        case 'share':
                       $('.down2share').show().siblings().hide()
                        break;
                        case 'date':
                       $('.calendar').show().siblings().hide()
                        break;
                         case 'map':
                       $('#mapBox').show().siblings().hide()
                        break;
                    }
        $('.downshare').removeClass('active');
    })
    
     $('.download').on('click',function(){
            window.open('/portal/itinerary/downpdf.html?them='+u + '&trip='+trip);
    })

     /*日历模式*/
     var calendarIndex = 0;
     var tot_day ;
     $('.new_calendar_pat .dayNext').on('click',function(){
        if(calendarIndex >= (tot_day-6)) return false;
        $(this).siblings('.dayPrev').removeClass('dis')
        calendarIndex ++;
        if(calendarIndex >= (tot_day-6)){
             $(this).addClass('dis');
        }
        var range = -calendarIndex* 171 +'px';
        $('.day_inner').css({'transform':'translateX('+range+')'})
        $('.bottom_hotel .hotel_ul').css({'transform':'translateX('+range+')'})
     })
     $('.new_calendar_pat .dayPrev').on('click',function(){
        if(calendarIndex ==0) return false;
        $(this).siblings('.dayNext').removeClass('dis')
        calendarIndex --
        if(calendarIndex ==0){
            $(this).addClass('dis')
        }
        var range = -calendarIndex* 171 +'px';
        $('.day_inner').css({'transform':'translateX('+range+')'})
        $('.bottom_hotel .hotel_ul').css({'transform':'translateX('+range+')'})
     })

     $('.remark').on('click',function(){
        $('.remark_mask').show();

     })
     $('.cancel').on('click',function(){
        $('.remark_mask').hide();
     })
     $.post('RemarksData',{'trip_id':trip},function(res){
            if(res.status==true){
                $('.remark_putin textarea').val(res.data.remarks);
                $('.remark .remarkText').html(res.data.remarks);
                if(res.data.remarks!=undefined && res.data.remarks.length>0){
                    $('.remark .tips').hide();
                }
            }
       },'json')

     $('.remark_box .save').on('click',function(){
        var query ={};
            query.trip_id = trip;
            query.remarks = $('.remark_putin textarea').val().trim();
       $.post('AddRemarks',query,function(res){
            if(res.status==true){
                $('.remark_mask').hide();
                layer.msg('备注保存成功',{
                    time:2000
                })
   
                $('.remark .remarkText').html(query.remarks);
                if(query.remarks.length>0){
                    $('.remark .tips').hide();
                }else{
                    $('.remark .tips').show()
                }
            }
       },'json').error(function(){
            layer.msg('网络错误，提交失败',{
                time:2000
            })
       });

     })


     function calcspotHeight (){
        var oneMinute = 47/60;
        var reg = /[\u4e00-\u9fa5]/g; //截取时间单位
        var names = name.match(reg);
        

        $('.new_calendar_pat .no_with').each(function(){
            var mbt = getHour('05:00:00',$(this).attr('start_time'))*38.6666;
            $(this).css('height',mbt+'px');
        })


     }
     function modeldatePointer (){
            $('.block.datespot').each(function(){

                if($(this).height()<80){
                    $(this).find('.ico').not('.cy').hide()
                }
                if($(this).height()<40){
                    $(this).find('.ico.cy').hide()
                    $(this).find('.block_in_left').css({'padding':'7px 12px'})
                    $(this).find('.block_in_right').css({'padding':'7px 12px'})
                }
                if($(this).find('.block_in_right').length==0 && $(this).height()>40){
                     $(this).find('.ico').not('.cy').show();
                }
            })

            var listWidth =  $('.datelist_box .daylist').length*172;
            var listHeightArr =[];
             $('.datelist_box').width(listWidth);
             $('.datelist_box .daylist').each(function(){
                listHeightArr.push($(this).height())
             })
             var max = Math.max.apply(null, listHeightArr);
             $('.datelist_box .daylist').height(max)
             $('.bottom_hotel .hotel_ul').width(listWidth)
            $('.block_in_left').hover(function(){
                if($(this).siblings('.block_in_right').length<=0){
                    return false;
                }
                $(this).stop().animate({'width':'162px'},300,'easeOutQuad');
                $(this).siblings('.block_in_right').stop().animate({'width':0,'padding':'0'},300,'easeOutQuad')
             },function(){
                if($(this).siblings('.block_in_right').length<=0){
                    return false;
                }
                $(this).stop().animate({'width':'116px'},300,'easeInQuad');
                if($(this).parents('.block.datespot').height()<=40){
                    $(this).siblings('.block_in_right').stop().animate({'width':'44px','padding':'7px 12px'},300,'easeInQuad');
                }else{
                     $(this).siblings('.block_in_right').stop().animate({'width':'44px','padding':'10px 12px'},300,'easeInQuad');
                }
             });
             $('.block_in_right').hover(function(){
                var _self = this;
                $(this).find('.in_title_s').stop().show();
                // $(this).find('.tip_s').stop().fadeIn(200);
                $(this).stop().animate({'width':'162px'},300,'easeOutQuad').find('.ico').stop().fadeOut(200,function(){
                    $(_self).find('.ico').css({'margin':'0','bottom':'12px','right':'12px'}).stop()
                    if($(_self).parents('.block.datespot').height()>=40){
                        $(_self).find('.ico').fadeIn(200)
                    }
                });
                $(this).siblings('.block_in_left').stop().animate({'width':0,'padding':0},300,'easeOutQuad')
             },function(){
                var _self = this;
                $(this).find('.in_title_s').stop().hide()
                // $(this).find('.tip_s').stop().fadeOut()
                $(this).stop().animate({'width':'44px'},300,'easeInQuad',function(){
                    $(_self).find('.ico').css({'margin':'0px -11px -11px 0','bottom':'50%','right':'50%'});
                });
                if($(_self).parents('.block.datespot').height()<=40){
                    $(this).siblings('.block_in_left').stop().animate({'width':'116px','padding':'7px 12px'},300,'easeInQuad')
                }else{
                    $(this).siblings('.block_in_left').stop().animate({'width':'116px','padding':'10px 12px'},300,'easeInQuad')

                }
            });
    
            // 上下布局
            
             $('.block_in_up').hover(function(){
                if($(this).siblings('.block_in_down').length<=0){
                    return false;
                }
                var blockHeight = $(this).parents('.block').height();
                $(this).siblings('.block_in_down').find('.ico.cy').hide();
                $(this).stop().animate({'height':blockHeight},300,'easeOutQuad');
                $(this).siblings('.block_in_down').stop().animate({'height':0,'padding':'0 12px'},300,'easeOutQuad')
             },function(){
                if($(this).siblings('.block_in_down').length<=0){
                    return false;
                }
                $(this).siblings('.block_in_down').find('.ico.cy').show(300);
                $(this).stop().animate({'height':'100%'},300,'easeInQuad');
                $(this).siblings('.block_in_down').stop().css({}).animate({'height':'52px','padding':'8px 12px'},300,'easeInQuad')
             });
    
            $('.block_in_down').hover(function(){
                var blockHeight = $(this).parents('.block').height();
                $(this).stop().animate({'height':blockHeight},300,'easeOutQuad');
                $(this).siblings('.block_in_up').stop().animate({'height':0,'padding':'0 12px'},300,'easeOutQuad')
             },function(){
                $(this).stop().animate({'height':'52px','padding':'8px 12px'},300,'easeInQuad');
                $(this).siblings('.block_in_up').stop().css({}).animate({'height':'100%','padding':'10px 12px'},300,'easeInQuad')
            });

            $('.block_in.traff').on('click',function(){
                $(this).hide().siblings('.toBook').show()  
            })

            $('.block .toBook .close_info').on('click',function(){
                $(this).parents('.toBook').hide().siblings('.block_in').show()  
            })

            $('.hotel_box .hotel_name').on('click',function(){
                  var top = $(this).parents('.hotel_box').offset().top-$(document).scrollTop()-65;
                  var botom = $(this).parents('.hotel_box').offset().bottom;
                  var left = $(this).parents('.hotel_box').offset().left;
                var html = $(this).siblings('.toBook').clone();
                $('.hotelmsg').css({'top':top+'px','left':left+'px'}).show();
                $('.hotelmsg').html(html);
            })

            $('.hotelmsg').on('click','.close_info',function(){
                $('.hotelmsg').hide();     
            })

            $('.datelist_box').on('mousemove', '.block_in',function(e){
                var offset = $(this).offset()
                var x = e.pageX - offset.left
                var y = e.pageY - offset.top
                
                var centerX = $(this).outerWidth() /2
                var centerY = $(this).outerHeight() /2 
                
                var deltaX = x - centerX
                var deltaY = y - centerY
                
                var percentX = deltaX / centerX
                var percentY = deltaY / centerY
                var deg = 10

                $(this).css({
                    transform: 'rotateX('+deg*percentY + 'deg)'+
                    ' rotateY('+deg*-percentX+'deg)'
                    })
            })

            $('.datelist_box').on('mouseleave', '.block ',function(){
               
              $('.block_in').css({
                 transform: '',
                
              })
              
              
                    
            })
        }

     function getHour(s1, s2) {
        s1= s1+':00'
        s2= s2+':00'
        var reDate = /\d{4}-\d{1,2}-\d{1,2} /;
        s1 = new Date((reDate.test(s1) ? s1 : '2017-1-1 ' + s1 ).replace(/-/g, '/'));
        s2 = new Date((reDate.test(s2) ? s2 : '2017-1-1 ' + s2 ).replace(/-/g, '/'));
        var ms = s2.getTime() - s1.getTime();
        if (ms < 0) return 0;
        return ms / 1000 / 60 / 60;
    }
    //自己注意传递要么都带日期，要么都不带，否则计算出来的不对
    // console.log(getHour('2017-8-23 12:05:05', '2017-8-25 10:05:05'))
    // console.log(getHour('05:00:00', '08:30:00'))

    function deFormatHour(time) {
        var hourIndex = time.indexOf('小时');
        var minuteIndex = time.indexOf('分钟');
        var hours ;
        if(hourIndex==-1 && minuteIndex!=-1){
            hours  = time.substring(0,minuteIndex)/60
        }
        if(hourIndex!=-1 && minuteIndex!=-1){
            hours =time.substring(0,hourIndex)-0 +  time.substring(hourIndex+2,minuteIndex)/60-0
        }
       return hours
    }

    // 酒店详情start
    $(".popup_img_box").on('click', ".last_li_img,li", function () {
        
        var ishotel = $(this).parents('.popup_img_box').find('.popup_img_url').hasClass('popup_img_url_hotel')
        if(ishotel){
            $(".more_pic_hotel").fadeIn();
            $('.hotel_content_info').show().siblings('.content_p').hide()
        }else{
            $(".more_pic_box_spot").fadeIn();
             $('.hotel_content_info').hide().siblings('.content_p').show()
        }
        });
     
        $(".pic_hide").click(function () {
                $(".more_pic_box").fadeOut();
        });

    $('.hotelmsg').on('click','.book_tit',function(){
        $('.tab_tit.hotel').show().siblings().hide();
        $('.details_popup_tab_active').css({left:'0'})
        var query ={}
        var day1 = getDate();
        var day2 = getDateAfter_n(day1,1,'-');
        query.hotel_id= $(this).attr('data-id');
        query.arrival_date= day1;
        query.departure_date= day2;
        query.map_post= true;
        $.post('/portal/store/getHotelDetail',query,function(res){
            if(!res){
                layer.msg('暂无酒店详情')
                return false;
            }
            var rooms = '';
            for (var i = 0; i < res.Rooms.length; i++) {
                rooms += res.Rooms[i].Name + '丨'+ res.Rooms[i].BedType +'、';
            }
            var popup_imgstr = '';
            $(res.highImage).each(function(i,ele){
                if(i<5){
                    popup_imgstr += '<li><img src='+ this +' alt=""></li> '
                }
            })
        // $('.details_popup_box').show();
        $('.popup_img_url').html(popup_imgstr).addClass('popup_img_url_hotel'); 
        
          $('.top_details_text').find('.p1').text(res.Detail.HotelName).end()
                                .find('.p2_hotelprice').text('¥'+res.LowRate+'起').show().end()
                                .find('.tel ').text(res.Detail.Phone).end()
                                .find('.address').text(res.Detail.Address).end()
                                .find('.p2').hide();
                        
            $('.hotel_info_right').html(res.Detail.Review.Score+'分').show()                    
          $('.more_pic_hotel').find('.content_name').text(res.Detail.HotelName).end()
                              .find('.content_phone').text(res.Detail.Phone).end()     
                              .find('.content_adress').text(res.Detail.Address).end()     
                              .find('.content_room').text(rooms||'暂无').end()     
            $(".more_pic_hotel .swiper-wrapper").removeAttr("style")
            $(".more_pic_hotel .gallery-thumbs").html("");
            $(".more_pic_hotel .gallery-top").html("");

            var spot_data = {}
                spot_data.image_url = res.highImage;
             // maskFn.popup_img(spot_data)
               var img_top_tem = '<div class="swiper-wrapper">\
                                    {{each image_url as value i}}\
                                    <div class="swiper-slide" style="background-image:url({{value}})">\
                                    </div>\
                                    {{/each}}\
                                </div>\
                                <div class="img_text_box"><div class="swiper-pagination"></div></div>';
            var img_top_render = template.compile(img_top_tem);
            var img_top_html = img_top_render(spot_data);
            $(".more_pic_hotel .gallery-top").html(img_top_html);
 

            var img_thumbs_tem = '<div class="swiper-wrapper">\
                                    {{each image_url as value i}}\
                                        <div class="swiper-slide" style="background-image:url({{value}})"></div>\
                                    {{/each}}\
                                 </div>';
            var img_thumbs_render = template.compile(img_thumbs_tem);
            var img_thumbs_html = img_thumbs_render(spot_data);
            $(".more_pic_hotel .gallery-thumbs").html(img_thumbs_html);
            var galleryTop = new Swiper('.more_pic_hotel .gallery-top', {
                spaceBetween: 0,
                observer:true,//修改swiper自己或子元素时，自动初始化swiper
                observeParents:true,//修改swiper的父元素时，自动初始化swiper

                loop: true,
                allowTouchMove: false,
                loopedSlides: spot_data.image_url.length, //looped slides should be the same
                navigation: {
                    nextEl: '.more_pic_hotel .swiper-button-next',
                    prevEl: '.more_pic_hotel .swiper-button-prev',
                },
                pagination: {
                    el: '.more_pic_hotel .swiper-pagination',
                    type: 'fraction',
                },
            });

            var galleryThumbs = new Swiper('.more_pic_hotel .gallery-thumbs', {
                spaceBetween: 9,
                slidesPerView: spot_data.image_url.length >= 8 ? 8 : spot_data.image_url.length,
                touchRatio: 0.2,
                loop: true,
                observer:true,//修改swiper自己或子元素时，自动初始化swiper
                observeParents:true,//修改swiper的父元素时，自动初始化swiper
                centeredSlides: false,
                allowTouchMove: false,
                loopedSlides: spot_data.image_url.length, //looped slides should be the same
                slideToClickedSlide: true,
            });
            galleryTop.controller.control = galleryThumbs;
            galleryThumbs.controller.control = galleryTop;

            $('.details_popup_box').show();
            $('.tab_content.rwpopup_tab4').show().siblings().hide();
            $('.tab_tit.hotelmsg').show().siblings().hide();
            $('.tab_content.rwpopup_tab4').find('.spot_Introduction').html(res.Detail.Features).end()
                                        .find('.phone').text(res.Detail.Phone).end()
                                        .find('.address').text(res.Detail.Address).end()
                                        .find('.hotelset').text(res.Detail.GeneralAmenities).end()
                                        .find('.hotel_traffic').text(res.Detail.Traffic).end()
                                        .find('.room').text(rooms).end()

        },'json').error(function(){
             layer.msg('暂无酒店详情')
        })

        
    })

    
    // 酒店详情end

    // 景点详情 start

    /*rwpopup_tab2*/
    $('.datebox_inner').on('click','.block_in_up,.block_in_left',function(){
        $('.tab_content.rwpopup_tab4').hide().siblings().show();
        $('.tab_tit.hotel').hide().siblings().show();
        $('.hotel_info_right').hide();
        var query = {};
            query.this_floor_index = $(this).parents('.datespot').attr('this_floor_index');
            query.this_type = $(this).parents('.datespot').attr('this_type');
            query.lat = $(this).parents('.datespot').attr('lat');
            query.lng = $(this).parents('.datespot').attr('lng');
            query.city_id = $(this).parents('.datespot').attr('city_id');
            query.spot_name = $(this).parents('.datespot').attr('spot_name');
        $.post('LookDetail',query,function(res){
            if(!res.status){
                layer.msg('暂无景点详情')
                return false;
            }
            $('.details_popup_box').show();
               var data = res.data;
                maskFn.detailsPopup(data,1)
                maskFn.morePictures(data.spot)
                // $(".popup_img_box").on('click', ".last_li_img,li", function () {
                // $(".more_pic_box").fadeIn();
                //     maskFn.morePictures(data.spot)
                // });
    
                // $(".pic_hide").click(function () {
                //         $(".more_pic_box").fadeOut();
                //         $(".gallery-top").html("");
                //         $(".gallery-thumbs").html("");
                // });
        },'json').error(function(){
            layer.msg('暂无景点详情')
        })

    })
    $('.details_popup_box .shut_down ').on('click',function(){
        $(this).parents('.details_popup_box').hide();
        $('.popup_img_url').removeClass('popup_img_url_hotel');
    })

    $('.details_popup_tab .tab_tit').on('click',function(){
        var type = $(this).attr('type');
        var left =  $(this).position().left
        $('.details_popup_tab_active').animate({'left':left},200);
        $('.rwpopup_tab'+type).show().siblings('.tab_content').hide();
    })

// maskFn.details_popup()
    
    var maskFn={
           //景点详情 弹出程
        detailsPopup: function (data, id_index) {
            var spot_data = data.spot
            // var img_length = spot_data.image_url.length;
            //top
            $(".rw_top_details_text").find(".p1").html(spot_data.spot_name).end()
                .find(".details_time").html(spot_data.play_time).end()
                .find(".suit_season").html(spot_data.suit_season).end()
                .find(".suit_time").html(spot_data.suit_time).end()
                .find(".tel").html(spot_data.phone).end()
                .find(".address").html(spot_data.address).end();
            //图片
             maskFn.popup_img(spot_data)
            //摘要介绍
            $(".js_details_popup_main .rwpopup_tab1").find(".spot_Introduction").html(spot_data.introduction).end()
                .find(".type").html(spot_data.type).end()
                .find(".suit_season").html(spot_data.suit_season).end()
                .find(".suit_time").html(spot_data.suit_time).end()
                .find(".play_time").html(spot_data.play_time).end()
                .find(".phone").html(spot_data.phone).end()
                .find('.address_name').html(spot_data.address).end()
                .find(".attractions_tickets").html(spot_data.attractions_tickets).end()
                .find(".update_time").html(spot_data.release_time);
            //景区景点
            if (data.cultural != undefined) {
                if (data.cultural.length > 0) {
                    $(".js_cultural").show();
                } else {
                    $(".js_cultural").hide();
                };
            } else {
                $(".js_cultural").hide();
            }

            if(!data.tuijian){
                data.tuijian={
                    'food':[],
                    'jingdian':[],
                    'shop':[]
                }
                $(".rwpopup_tab3_ul").html("暂无数据");
            }

            var rwpopup_tab2_tem = '<ul>\
                                        {{each cultural as value i}}\
                                        <li class="clearfix">\
                                            <div class="img_box">\
                                                <img src="{{value.img_url}}" alt="">\
                                            </div>\
                                            <div class="popup_tab_content">\
                                                <div><span class="spot_name">{{value.spot_name}}</span><span class="spot_time">适玩{{value.play_time}}</span></div>\
                                                <div class="spot_details">{{value.introduction}}</div>\
                                                <div class="spot_address">地址：<span>{{value.address}}</span></div>\
                                            </div>\
                                        </li>\
                                        {{/each}}\
                                    </ul>';
            var rwpopup_tab2_render = template.compile(rwpopup_tab2_tem);
            var rwpopup_tab2_html = rwpopup_tab2_render(data);
            $(".rwpopup_tab2").html(rwpopup_tab2_html);
            //附近景点
            var tuijian_data = data.tuijian
            var rwpopup_tab3_tem = '{{each food as value i}}\
                                    <li class="clearfix js_tj_food_list" id="tj' + id_index + '_food_{{i}}" data-lat="{{value.latitude}}" data-lng="{{value.longitude}}" data-per_capita="{{value.per_capita}}">\
                                        <div class="img_box">\
                                            <img src="{{value.img_url}}" alt="">\
                                        </div>\
                                        <div class="popup_tab_content">\
                                            <div><span class="spot_name">{{value.store_name}}</span></div>\
                                            <div class="type_box">\
                                                <div class="foot">{{value.type}}</div>\
                                                <div class="per">人均￥<span class="js_pernum">{{value.per_capita}}</span></div>\
                                                <div class="distance">距离<span class="js_distance">{{value.distance}}</span></div>\
                                            </div>\
                                            <div>地址：<span class="jsaddress">{{value.address}}</span></div>\
                                            <div>电话：<span class="jstel">{{value.phone}}</span></div>\
                                            <div>营业时间：<span class="jstime">{{value.business_hours}}</span></div>\
                                        </div>\
                                        <div class="go js_tj_food_go dis_none">我想去</div>\
                                    </li>\
                                    {{/each}}\
                                    {{each jingdian as value i}}\
                                    <li class="clearfix tj_jDshop_list" data-time = "{{value.tag_time}}" id="tj' + id_index + '_jingdian_{{i}}" data-lat="{{value.latitude}}" data-lng="{{value.longitude}}">\
                                        <div class="img_box">\
                                            <img src="{{value.img_url}}" alt="">\
                                        </div>\
                                        <div class="popup_tab_content">\
                                            <div><span class="spot_name">{{value.spot_name}}</span></div>\
                                            <div class="dis_none time_num">{{value.play_time}}</div>\
                                            <div class="type_box">\
                                                <div class="foot">人文景观</div>\
                                                <div class="distance">距离<span class="js_distance">{{value.distance}}</span></div>\
                                            </div>\
                                            <div>地址：<span class="jsaddress">{{value.address}}</span></div>\
                                            <div>电话：<span class="jstel">{{value.phone}}</span></div>\
                                            <div>开放时间：<span class="jstime">{{value.meal_time}}</span></div>\
                                        </div>\
                                        <div class="go tj_jDshop_go dis_none">我想去</div>\
                                    </li>\
                                    {{/each}}\
                                    {{each shop as value i}}\
                                    <li class="clearfix tj_jDshop_list" data-time = "{{value.tag_time}}" id="tj' + id_index + '_shop_{{i}}" data-lat="{{value.latitude}}" data-lng="{{value.longitude}}">\
                                        <div class="img_box">\
                                            <img src="{{value.img_url}}" alt="">\
                                        </div>\
                                        <div class="popup_tab_content">\
                                            <div><span class="spot_name">{{value.shopping_name}}</span></div>\
                                            <div class="dis_none time_num">{{value.shopping_time}}</div>\
                                            <div class="type_box">\
                                                <div class="foot">{{value.type}}</div>\
                                                <div class="distance">距离<span class="js_distance">{{value.distance}}</span></div>\
                                            </div>\
                                            <div>地址：<span class="jsaddress">{{value.address}}</span></div>\
                                            <div>电话：<span class="jstel">{{value.phone}}</span></div>\
                                            <div>营业时间：<span class="jstime">{{value.business_hours}}</span></div>\
                                        </div>\
                                        <div class="go tj_jDshop_go dis_none">我想去</div>\
                                    </li>\
                                    {{/each}}';
            var rwpopup_tab3_render = template.compile(rwpopup_tab3_tem);
                data.food = data.food?data.food:[];
                data.jingdian = data.jingdian?data.jingdian:[];
                data.shop = data.shop?data.shop:[];
            var rwpopup_tab3_html = rwpopup_tab3_render(tuijian_data);
            if (tuijian_data.food.length == 0 && tuijian_data.jingdian.length == 0 && tuijian_data.shop.length == 0) {
                $(".rwpopup_tab3_ul").html("暂无数据");
            } else {
                $(".rwpopup_tab3_ul").html(rwpopup_tab3_html);
            };

        },
        //相册
        morePictures: function (spot_data) {
            // console.log(spot_data)
            $(".swiper-wrapper").removeAttr("style")
            $(".gallery-thumbs").html("");
            $(".gallery-top").html("");
            var img_data = spot_data.image_url;
            var img_length = img_data.length;
            var tab_text = $(".r_top_tab_box").find("li.active").text();
            if (tab_text == "美食街区") {
                $(".content_name").html(spot_data.food_court_name);
                $(".content_p").html(spot_data.absture);
            } else if (tab_text == "必吃美食" || tab_text == "本土美食") {
                $(".content_name").html(spot_data.store_name);
                $(".content_p").html(spot_data.Introduction);
            } else if (tab_text == "本土特产" || tab_text == "土特产店" || tab_text == "购物商圈") {
                $(".content_name").html(spot_data.shopping_name);
                $(".content_p").html(spot_data.absture);
            } else {
                $(".content_name").html(spot_data.spot_name);
                $(".content_p").html(spot_data.absture);
            }

            var img_top_tem = '<div class="swiper-wrapper">\
                                    {{each image as value i}}\
                                    <div class="swiper-slide" style="background-image:url({{value.url}})">\
                                        <div class="img_text_box">上传于&nbsp{{release_time}}&nbsp·by&nbsp;&nbsp;{{value.name}}<span class="js_byName"></span></div>\
                                    </div>\
                                    {{/each}}\
                                </div>\
                                <div class="img_text_box"><div class="swiper-pagination"></div></div>';
            var img_top_render = template.compile(img_top_tem);
            var img_top_html = img_top_render(spot_data);
            $(".gallery-top").html(img_top_html);


            var img_thumbs_tem = '<div class="swiper-wrapper">\
                                    {{each image_url as value i}}\
                                        <div class="swiper-slide" style="background-image:url({{value}})"></div>\
                                    {{/each}}\
                                 </div>';
            var img_thumbs_render = template.compile(img_thumbs_tem);
            var img_thumbs_html = img_thumbs_render(spot_data);
            $(".gallery-thumbs").html(img_thumbs_html);

            var galleryTop = new Swiper('.gallery-top', {
                spaceBetween: 5,
                loop: true,
                allowTouchMove: false,
                observer:true,//修改swiper自己或子元素时，自动初始化swiper
                observeParents:true,//修改swiper的父元素时，自动初始化swiper
                loopedSlides: img_length, //looped slides should be the same
                navigation: {
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev',
                },
                pagination: {
                    el: '.swiper-pagination',
                    type: 'fraction',
                },
            });

            var galleryThumbs = new Swiper('.gallery-thumbs', {
                spaceBetween: 9,
                slidesPerView: img_length >= 8 ? 8 : img_length,
                touchRatio: 0.2,
                observer:true,//修改swiper自己或子元素时，自动初始化swiper
                observeParents:true,//修改swiper的父元素时，自动初始化swiper
                loop: true,
                centeredSlides: false,
                allowTouchMove: false,
                loopedSlides: img_length, //looped slides should be the same
                slideToClickedSlide: true,
            });

            galleryTop.controller.control = galleryThumbs;
            galleryThumbs.controller.control = galleryTop;
        },
        //详情相册
        popup_img: function (spot_data) {
            //图片
            var img_length = spot_data.image_url.length;
            var popup_img_tem = '{{each image_url as value i}}\
                                {{if i <= 4}}\
                                <li><img src={{value}} alt=""></li>\
                                {{/if}}\
                                {{/each}}';
            var popup_img_render = template.compile(popup_img_tem);
            var popup_img_html = popup_img_render(spot_data);
            $(".popup_img_url").html(popup_img_html);
            if (img_length >= 5) {
                $(".last_li_img").show();
            } else {
                $(".last_li_img").hide();
            };
        }
    } 
    // 景点详情 end
    // 
    // 
    
    // 地图模式 
    var mapCtrl={
        initCtrl: function(cityArr){
            var data = {};
                data.cityArr = cityArr;
            var ctrlTemplate = '{{each cityArr as value i}}\
                <li class="citylist fl">\
                    <div class="city" city_index={{i}}>{{value.this_city}}</div>\
                    <div class="dayouter clearfix">\
                        {{each value.day_arry as item k}}\
                        <span city_index={{i}} day_index={{k}} class="daySourse fl">D{{item.daySource+1}}</span>\
                        {{/each}}\
                    </div>\
                </li>\
                {{/each}}'  


            var ctrlRender = template.compile(ctrlTemplate);
            var ctrl_html = ctrlRender(data);
            $('.cityBar .citycon').html(ctrl_html);
            $('.cityBar .daySourse').on('click',function(){
                $('#leftList .forDay').show().siblings().hide();
                $('.cityBar').find('.active').removeClass('active')
                $(this).addClass('active')
                var day_index = $(this).attr('day_index');
                var city_index = $(this).attr('city_index');
                var daySource = bookData.Schedufing[city_index].day_arry[day_index].daySource
                mapObj.delMapinfo();//先清除地图marker 和连线
                mapCtrl.renderDay(bookData.Schedufing[city_index],day_index,daySource)
                
            })

            $('.cityBar .cityAll').on('click',function(){
                $('#leftList .allPrv').show().siblings().hide();
                $('.cityBar').find('.active').removeClass('active')
                $(this).addClass('active')
                mapObj.delMapinfo(); //先清除地图marker 和连线
                mapCtrl.renderAllcity(bookData.gailan)
            })

            $('.cityBar .citylist .city').on('click',function(){
                $('#leftList .forCity').show().siblings().hide();
                $('.cityBar').find('.active').removeClass('active')
                $(this).addClass('active')
                var city_index = $(this).attr('city_index');
                mapObj.delMapinfo();//先清除地图marker 和连线
                mapCtrl.renderCity(bookData.Schedufing[city_index])
            })        
        },
        renderAllcity:function(gailan){ //总览
            $('.allPrv .list.start .cityName').text(gailan.departure_city);
            $('.allPrv .list.end .cityName').text(gailan.return_city);
            var lastStart =gailan.date.replace(/-/g,'.')
            var lastTime = getDateAfter_n(gailan.date,gailan.day_num,'.')
            $('.allPrv .date_line').html(lastStart+' — '+lastTime);
            var data = {};
                data.traffic= gailan.go_city_array;
            var allprvTemplate = '{{each traffic as value i}}\
                        <div class="traffic">\
                            <span class="traffic_ico {{value.trc_class}}"></span>\
                            {{value.city_trc_name}}·{{value.dis}}公里·{{value.trc_time}}\
                        </div>\
                        <div class="list">\
                            <div class="num">{{i+1}}</div>\
                            <div class="cityName">{{value.city_name}}</div>\
                            <div class="play_time">游玩{{value.city_daynum}}天</div>\
                            <div class="right_pos"><span class="fz14">D{{value.city_d_1}}-D{{value.city_d_2}}</span></div>\
                        </div>\
                        {{/each}}';
            var allprvRender = template.compile(allprvTemplate);
            var allprv_html = allprvRender(data);
                allprv_html+='<div class="traffic"><span class="traffic_ico '+ gailan.return_cityInfo.trc_class+'"></span>'+ gailan.return_cityInfo.city_trc_name +'·'+ gailan.return_cityInfo.dis+'公里·'+gailan.return_cityInfo.trafficTime+'</div>'
            $('.allPrv .allPrvstr').html(allprv_html);
            var startDash =[];
            var endDash =[];
            var cityline =[];
            $.each(data.traffic,function(i,ele){//经过城市
                  mapObj.initMarkerFn({lat:Number(ele.lat),
                         lng :Number(ele.lng),
                         icon_url:'iconnum1',
                         label_color:'#659ff5',
                         lable_text:i+1+'',
                     })
                  if(i==0){
                    startDash.push({lat:Number(ele.lat),lng :Number(ele.lng)})
                    map.setZoom(8);
                    var center_pos = new google.maps.LatLng(Number(ele.lat), Number(ele.lng));
                    map.setCenter(center_pos);
                  }
                  if(i==data.traffic.length-1){
                    endDash.push({lat:Number(ele.lat),lng :Number(ele.lng)})
                  }
                  
                 //城市连线
                var city_pos = new google.maps.LatLng(Number(ele.lat), Number(ele.lng));
                cityline.push(city_pos);

            })
            mapObj.cityPolyline(cityline);

            if(gailan.departure_city!=gailan.return_city){
                mapObj.initMarkerFn({ //返回城市
                    lat:Number(gailan.return_cityInfo.lat),
                    lng :Number(gailan.return_cityInfo.lng),
                    icon_url:'returnicon',
                })
            }
            

            mapObj.initMarkerFn(//出发城市
               {lat:Number(gailan.dep_lat),
                        lng :Number(gailan.dep_lng),
                        icon_url:'departureicon',
                       
                       
                })

            startDash.push({lat:Number(gailan.dep_lat),lng :Number(gailan.dep_lng)})
            endDash.push({ lng :Number(gailan.return_cityInfo.lng), lat:Number(gailan.return_cityInfo.lat)})
            mapObj.gobackpolyline(startDash)
            mapObj.gobackpolyline(endDash)
            
        },
        renderCity:function(city){//城市
            var data = city;
            $('.forCity .leftList_tit').text(data.this_city);
            if(data.day_arry&&data.day_arry.length>0){
                $('.forCity .date_line').text((data.day_arry[0].month_day||data.day_arry[0].date)+' — '+ (data.day_arry[data.day_arry.length-1].month_day||data.day_arry[data.day_arry.length-1].date));
            }
            var cityTemplate = '{{each day_arry as value i }}\
                        <div class="list">\
                            <div class="daytitle">Day{{value.daySource+1}}</div>\
                            <div class="tips"> {{value.month_day||value.date}} {{value.weeks}} | {{value.betw_time}}</div>\
                        </div>\
                        {{each value.day as item k}}\
                        <div class="list spot">\
                            <div class="num">{{k+1}}</div>\
                            <div class="clearfix spotname">\
                                <span class="fl">{{item.this_name}}</span> {{if item.eat_info}}<span class="fl hasfood"></span>{{/if}} <span class="pos_r"><strong>{{item.this_tag_time}}</strong> 小时</span>\
                            </div>\
                            <div class="business">营业时间：{{item.business_hours||item.info.business_hours}} <span class="pos_r">景</span></div>\
                        </div>\
                        {{if k<value.day.length-1 && item.traffic_distance}}<div class="traffic"> <span>···</span> {{item.traffic_distance}}km 约{{item.traffic_time_chinese}}</div>\
                            {{else}}\
                            <div class="no_traffic"></div>\
                        {{/if}}\
                        {{/each}}\
                        {{if value.hotel && value.hotel.hotel_name}}\
                        <div class="list spot hotel">\
                            <div class="num"></div>\
                            <div class="clearfix spotname">\
                                <span class="fl">{{value.hotel.hotel_name}}</span> <span class="pos_r">住</span>\
                            </div>\
                            \
                        </div>\
                        {{/if}}\
                        {{/each}}'
            var cityRender = template.compile(cityTemplate);
            var city_html = cityRender(data);  
            $('.forCity .list_container').html(city_html);
            if(data.day_arry[0].day[0]){
                map.setZoom(11);
                var center_pos = new google.maps.LatLng(Number(data.day_arry[0].day[0].this_lat), Number(data.day_arry[0].day[0].this_lng));
                map.setCenter(center_pos);
            }else{
                map.setZoom(11);
                var center_pos = new google.maps.LatLng(Number(data.this_city_lat), Number(data.this_city_lng));
                map.setCenter(center_pos);
            }

            $.each(data.day_arry,function(i,value){
                 var day_path_arry = []
                 if(value.hotel&&value.hotel.hotel_name){
                    mapObj.initMarkerFn({lat:Number(value.hotel.lat),
                         lng :Number(value.hotel.lng),
                         icon_url:'hotel2',
                     })
                 }

                $.each(this.day,function(k,item){
                    var text = k+1+'';
                    if(k == 0){
                        text = 'D'+(value.daySource+1);
                    }

                    mapObj.initMarkerFn({lat:Number(item.this_lat),
                         lng :Number(item.this_lng),
                         icon_url:'spot_1',
                         label_color:'#659ff5',
                         lable_text:text,
                     },'isSpot')
                    //景点连线
                    var spot_pos = new google.maps.LatLng(Number(item.this_lat), Number(item.this_lng));
                        day_path_arry.push(spot_pos);

                }) 
                mapObj.spotPolyline(day_path_arry);
            })
        },
        renderDay:function(city,index,daySource){
                    daySource = daySource -0;
                var bigtraffic = '' 
                var data  = city.day_arry[index];
                if(data.transport){
                    $.each(data.transport,function(i,ele){
                        bigtraffic +='<i class="ico '+ele.trc_class+'"></i><div class="fl cityname">'+ ele.one_city+' — '+ ele.two_city+'</div><div class="fr time">'+ele.city_trc_name+'·'+ele.trafficTime+'</div>'
                    })
                    $('.forDay .big_traffic').css({'padding':'18px 18px 18px 56px'});
                }else{
                    $('.forDay .big_traffic').css({padding:'0'})
                }
                if(data.hotel&&data.hotel.hotel_name){
                    var hotelstr ='<div class="no_traffic"></div>\
                    <div class="list spot hotel">\
                            <div class="num"></div>\
                            <div class="clearfix spotname">\
                                <span class="fl">'+ data.hotel.hotel_name +'</span> <span class="pos_r">住</span>\
                            </div>\
                            \
                        </div>'
                    $('.forDay .hotel_str').html(hotelstr)
                    mapObj.initMarkerFn({lat:Number(data.hotel.lat),
                         lng :Number(data.hotel.lng),
                         icon_url:'hotel2',
                     })
                }else{
                    $('.forDay .hotel_str').html('')
                }

                $('.forDay .leftList_tit').text('Day'+(daySource+1)+' '+city.this_city)
                $('.forDay .date_line').text((data.month_day||data.date)+ ' '+ (data.weeks||'')+' | '+ (data.betw_time||''))
                $('.forDay .big_traffic').html(bigtraffic)

                var dayTemplate = '{{each day as value i}}\
                    <div class="list spot">\
                        <div class="num">{{i+1}}</div>\
                        <div class="clearfix spotname">\
                            <span class="fl">{{value.this_name}}</span>{{if value.eat_info}}<span class="fl hasfood">{{/if}}</span> <span class="pos_r"><strong>{{value.this_tag_time}}</strong> 小时</span>\
                        </div>\
                        <div class="business">营业时间：{{value.business_hours||value.info.business_hours}} <span class="pos_r">景</span></div>\
                    </div>\
                    {{if i<day.length-1 && value.traffic_distance}}\
                    <div class="traffic"> <span>···</span> {{value.traffic_distance}}km 约{{value.traffic_time_chinese}}</div>\
                    {{/if}}\
                    {{/each}}'
            var dayRender = template.compile(dayTemplate);

            var day_html = dayRender(data);  
            $('.forDay .day_str').html(day_html);
                if(data.day.length>0){
                    map.setZoom(12);
                    var center_pos = new google.maps.LatLng(Number(data.day[0].this_lat), Number(data.day[0].this_lng));
                    map.setCenter(center_pos);
                }else{//当天没有景点
                    map.setZoom(12);
                    var center_pos = new google.maps.LatLng(Number(city.this_city_lat), Number(city.this_city_lng));
                    map.setCenter(center_pos);
                }

                var day_path_arry = []
                $.each(data.day,function(k,item){
                    var text = k+1+'';
                    if(k == 0){
                        text = 'D'+(daySource+1);
                        
                    }
                    mapObj.initMarkerFn({lat:Number(item.this_lat),
                         lng :Number(item.this_lng),
                         icon_url:'spot_1',
                         label_color:'#659ff5',
                         lable_text:text,
                     },'isSpot')
                    //景点连线
                    var spot_pos = new google.maps.LatLng(Number(item.this_lat), Number(item.this_lng));
                        day_path_arry.push(spot_pos);

                }) 
                mapObj.spotPolyline(day_path_arry);
                
               
        }

    };
   

     var mapObj = {
        //加载谷歌地图
        initMap: function () {
            var lat = 30.230744 ;
            var lng =120.213947 ;
            map = new google.maps.Map(document.getElementById('mapContainer'), {
                zoom:8,
                gestureHandling: 'greedy',
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                scaleControl: true,
                streetViewControl: false,
                center: {
                    lat: lat,
                    lng: lng
                }
            });
        },
         //出发城市 返回城市虚线
        gobackpolyline: function (latlngArr) {
            var lineSymbol = {
                path: 'M 0,-1 0,1',
                strokeOpacity: 1,
                scale: 2
            };
            Dottedline = new google.maps.Polyline({
                path: latlngArr,
                strokeOpacity: 0,
                icons: [{
                    icon: lineSymbol,
                    offset: '0',
                    repeat: '10px',

                }],
                strokeWeight: 4,
                strokeColor: '#337fef',
                map: map
            });
            Dottedline_array.push(Dottedline)
        },
        
        //初始化 展示地图上的marker
        initMarkerFn:function(data,isSpot){
            var icon_config ={};
            if(isSpot=='isSpot'){
                icon_config = { url:"/static/v1/img/map/"+data.icon_url+".png",
                                labelOrigin: new google.maps.Point(13, 14)
                            }
            }else if(isSpot=='hotel'){
                icon_config = { url:"/static/v1/img/map/"+data.icon_url+".png",
                                labelOrigin: new google.maps.Point(15, 17)
                        }
            }else{
                 icon_config = { url:"/static/v1/img/map/"+data.icon_url+".png",
                                labelOrigin: new google.maps.Point(15, 17)
                            }
            }

            var marker = new google.maps.Marker({
                position: {lat:data.lat,lng:data.lng},
                icon: icon_config,
                map: map,
                label: {
                    text: data.lable_text||' ',
                    color: data.label_color||' ',
                    fontWeight: "800",

                }
            });
        
            markerArr.push(marker);
                
            
                
        },
         
        delMapinfo:function(){
            if(Dottedline_array[0]){//清理虚线
                Dottedline_array[0].setMap(null);
                Dottedline_array[1].setMap(null);
            }
            Dottedline_array = [];

           
            $(FlightPath_arr).each(function(i,ele){ //清理城市连线
                this.setMap(null)
            })
            FlightPath_arr=[];

            //清除marker
            $(markerArr).each(function(){
                this.setMap(null)
            });
            markerArr=[];

            //  清理景点连线
            $.each(spotPolyline_array,function(){
               this.setMap(null)
               
            })
            spotPolyline_array=[];
        },
       
        spotPolyline:function (path) { //城市多端连线
                spot_polyline = new google.maps.Polyline({
                    path: path,
                    //多线段
                    geodesic: true,
                    strokeColor: '#659ff5',
                    strokeOpacity: 1.0,
                    strokeWeight: 4,
                });
                spot_polyline.setMap(map);
                spotPolyline_array.push(spot_polyline);
        },
        cityPolyline:function (path) { //城市多端连线
                spot_polyline = new google.maps.Polyline({
                    path: path,
                    //多线段
                    geodesic: true,
                    strokeColor: '#FF0000',
                    strokeOpacity: 1.0,
                    strokeWeight: 4,
                });
                spot_polyline.setMap(map);
                FlightPath_arr.push(spot_polyline);
        },
     
        //添加酒店marker
        add_hotel_markerFn:function(data){
            var hotel_Marker = new google.maps.Marker({
                position: {lat:data.lat,lng:data.lng},
                icon: "/static/v1/img/map/hotel2.png",
                map: map
            });
            addHotel_markArr[data.index] = hotel_Marker;
           
            //鼠标放上去
            google.maps.event.addListener(hotel_Marker, "mouseover",
                function () {
                    mapObj.style_InfowindowFn(data, 'hotel_hover',45);
                   
                });
            google.maps.event.addListener(hotel_Marker, "mouseout",
                function () {
                    //移除自定义窗口
                    $('#map').find('.popup-content').each(function(){
                        $(this).remove()
                    })
                });
            
        }
    };

    mapObj.initMap(); 
   
})

// 自定义标记
function createPopupClass(infoID, yPx) {
    var divId = infoID
    /**
     * A customized popup on the map.
     * @param {!google.maps.LatLng} position
     * @param {!Element} infoID The bubble div.
     * @constructor
     * @extends {google.maps.OverlayView}
     */
    function Popup(position, infoID) {
        this.position = position;
        // console.log(infoID)
        infoID.classList.add('popup-bubble');

        // This zero-height div is positioned at the bottom of the bubble.
        var bubbleAnchor = document.createElement('div');
        bubbleAnchor.classList.add('popup-bubble-anchor');
        bubbleAnchor.appendChild(infoID);

        // This zero-height div is positioned at the bottom of the tip.
        this.containerDiv = document.createElement('div');
        this.containerDiv.classList.add('popup-' + divId);
        this.containerDiv.appendChild(bubbleAnchor);

        // Optionally stop clicks, etc., from bubbling up to the map.
        google.maps.OverlayView.preventMapHitsAndGesturesFrom(this.containerDiv);
    }
    // ES5 magic to extend google.maps.OverlayView.
    Popup.prototype = Object.create(google.maps.OverlayView.prototype);

    /** Called when the popup is added to the map. */
    Popup.prototype.onAdd = function () {
        this.getPanes().floatPane.appendChild(this.containerDiv);
    };

    /** Called when the popup is removed from the map. */
    Popup.prototype.onRemove = function () {
        if (this.containerDiv.parentElement) {
            this.containerDiv.parentElement.removeChild(this.containerDiv);
        }
    };

    /** Called each frame when the popup needs to draw itself. */
    Popup.prototype.draw = function () {
        var divPosition = this.getProjection().fromLatLngToDivPixel(this.position);

        // Hide the popup when it is far out of view.
        var display =
            Math.abs(divPosition.x) < 4000 && Math.abs(divPosition.y) < 4000 ?
            'block' :
            'none';

        if (display === 'block') {
            this.containerDiv.style.left = divPosition.x + 'px';
            this.containerDiv.style.top = divPosition.y - yPx + 'px';
        }
        if (this.containerDiv.style.display !== display) {
            this.containerDiv.style.display = display;
        }
    };

    return Popup;
}