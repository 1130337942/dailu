var initObj = {},
    map,hover_Marker,h_MarkerArr=[];
var _trc_res,//行程数据
    _floor_res,//楼层数据
    _post_floorData = {},//请求楼层数据向后台传入数据
    go_city_name,
    return_city_name,
    city_id,
    _dataspot,//1-5楼详情
    hotelList,//酒店列表
    _hotel_datal,//酒店详情
    _this_city_data,//当前城市数据
    _city_name,//当前城市名字
    bounds = {},//地图缩放后，向后台传地图数据调用酒店接口
    _Daydate_arr = [],//每天的日期
    addgo_arry = [],//添加我想去的景点
    addgo_marker_array = [],//添加我想去的景点marker数组
    eat_name_arry = [],//添加美食数组
    hotel_markArr = [],//酒店marker数组
    addHotel_markArr = [],//添加酒店的marker数组
    addHotel_info_arr = [],//添加酒店的，map info数据
    time_Arr = [],//时间区间数组
    addAll_time = 0,//添加元素的总时间
    _this_cityDay_num,//当前城市游玩时间
    _title_city_name,//标题的 城市名字和个数
    _allDay_num,//整个行程游玩天数
    next_city_day0,//判断当前城市后面有几个0
    lastDay0_time2,//当前城市后面有0天的。当前最后一天的结束时间;
    allHours = 0,//当前城市的总小时
    across_city; //跨城
//高亮
var polyOptions = {
    //边线边框线
    strokeColor: "#9B868B",
    fillColor: '#FF0000',
    fillOpacity: 0.1,
    strokeWeight: 1,
    zIndex: 1
};
var lbsmap,lbsmarker,lbsinfoWindow,geocoder;

//当前城市索引
var this_city_index = Number(sessionStorage.this_city_index);

var uid =  getCookie('uid'); 
if(uid == null){//没有登录
    $('.floor7').hide()
}

//判断是否为ie浏览器
var is_ie_num = IEVersion();
var barGg = is_ie_num == -1?'-webkit-':'-ms-'

// //从1到5楼返回省份页面标记
// sessionStorage.setItem('is_back_city','ok');


if (document.referrer == "" || !sessionStorage.this_city_index) {
    window.location.href = "/";
}
// 从景点优化页面后退
var is_spot_back = sessionStorage.is_spot_back;
// console.log(is_spot_back)
$('#date_picker,.start,.end').css({'pointer-events': 'none'}).find('.arr').hide()

$(function(){
   
    if(is_spot_back == 'ok'){
        // console.log(this_city_index)
        $.post("ReturnSceni", function (res) {
            if(!res)return
            
            //加载隐藏
            $(".loading_box").fadeOut();
            _trc_res = res;
            _this_city_data = _trc_res.go_city_array[this_city_index];
            city_id = _this_city_data.city_id;
            _city_name = _this_city_data.city_name;
            //当前城市游玩天数
            _this_cityDay_num = Number(_this_city_data.city_daynum);
            //整个行程游玩天数
            _allDay_num = Number(_trc_res.day_num)
            _post_floorData = {city_id:city_id};
            //初始化调动方法
            
            initObj.initFn();
        },'json')
    }else{
       
        $.post('TrafficSite',{this_city_index:this_city_index},function(res){
            if(!res.status)return
            //加载隐藏
            $(".loading_box").fadeOut();
            // console.log(res)
            _trc_res = res.data;
            _this_city_data = _trc_res.go_city_array[this_city_index];
            city_id = _this_city_data.city_id;
            _city_name = _this_city_data.city_name;
            //当前城市游玩天数
            _this_cityDay_num = Number(_this_city_data.city_daynum);
            //整个行程游玩天数
            _allDay_num = Number(_trc_res.day_num)
            _post_floorData = {city_id:city_id};
            // //判断当前城市后面有几个0;
            // if(_trc_res.zero_num){
            //     next_city_day0 =  Number(_trc_res.zero_num.zero_num);
            // }else{
            //     //当前0天城市最后的结束时间不用在加2小时 默认为0
            //     //当前城市 next_city_day0 true 是0天;false 不是0天 
            //     if(_trc_res.next_city_day0 == 'true'){ 
            //         next_city_day0 = 0 ;
            //         $('.td_but').hide();//0天城市不让加减天数
            //     }
            // }
            
            //初始化调动方法
            initObj.initFn();

        },'json');
    }
    

   
    initObj = {
        initFn:function(){
            //加载地图
            google.maps.event.addDomListener(window, "load", mapObj.initMap());
            //城市高亮
            mapObj.cityOptionsPathFn();
            // 1-6 楼位置
            $(".floor_box").show().offset({
                left: $(".js_help").offset().left + 30
            });
            $(window).resize(function() {
                $(".floor_box").offset({
                    left: $(".js_help").offset().left + 30
                })
            });
            //左边数据渲染事件
            initObj.left_nav_Fn();
            //第一遍加载一楼数据
            initObj.post_listDate('renwen','top8');
            //楼层和tab切换
            initObj.floor_TabFn();
            //景点搜索
            initObj.sportSearch();
            //点击显示时间进度条
            $('.daySet').on('click',function(){
                $('.city_dayset').css({'opacity': 1})
            });
            $('.city_dayset_close').on('click',function(){
                $('.city_dayset').removeAttr('style')
            })

            //判断当前城市后面有几个0;
            if(_trc_res.zero_num){
                next_city_day0 =  Number(_trc_res.zero_num.zero_num);
            }else{
                //当前0天城市最后的结束时间不用在加2小时 默认为0
                //当前城市 next_city_day0 true 是0天;false 不是0天 
                if(_trc_res.next_city_day0 == 'true'){ 
                    next_city_day0 = 0 ;
                    $('.td_but').hide();//0天城市不让加减天数
                }else{

                }
            }
            //游玩时间编辑
            initObj.edit_timeFn();
          
            //详情弹出关闭
            $(".shut_down").on("click", function () {
                $(".details_popup_box").fadeOut();
            });
            //相册
            $(".popup_img_box").on('click', ".last_li_img,li", function () {
                $(".more_pic_box").fadeIn();
                var floor_i = $('.floor_box').find('.active').index();
                var pic_type = floor_i<5 || floor_i==6?'is_spot':'is_hotel'
                initObj.morePictures(pic_type);
            });
            //相册关闭
            $(".pic_hide").click(function () {
                $(".more_pic_box").fadeOut();
                $(".gallery-top").html("");
                $(".gallery-thumbs").html("");
            });
            //上传封面
            initObj.add_cover_imgFn();
            //下一步
            initObj.next_stepFn();
            //显示当前城市的交通站点信息
            initObj.plane_train_fn();
            //酒店行政区域select框下拉变化
            initObj.selectChangeFn(_city_name);
            //酒店城市切换
            initObj.hotel_city_tabFn()
        },  
        //左边数据渲染事件
        left_nav_Fn:function(){
            $('.bar_city_name').html(_city_name);
            //当前城市的开始时间和结束日期
            var date1 = _this_city_data.city_date
            var date2 = _this_city_data.city_date2
            $('.date1').html(dateFn(date1));
            $('.date2').html(dateFn(date2));
            function dateFn (city_date){
                var date = city_date.split('-');
                return date = Number(date[1])+'月'+Number(date[2])+'日'
            };
            //当前城市游玩天数
            $('.city_day_num').html(_this_cityDay_num);
            var cityArr = _trc_res.cityArray;
            var title = _trc_res.title;
            //标题的 城市名字和个数
            _title_city_name = title.split(_allDay_num.toString())[0]
            go_city_name = _trc_res.departure_city.city_name;
            return_city_name = _trc_res.return_city.city_name;
            $('.trc_title').html(title);
            //表单
            $('.cartBox').find('#trc_title').val(title).end().find('#wap3_date').val(_trc_res.date).end()
            .find('.wap2_adult_num').html(_trc_res.adult).end().find('.wap2_childrent_num').html(_trc_res.children).end()
            .find('.start_name').html(go_city_name).end().find('.end_name').html(return_city_name);
            $('.madeTravelMask img.bgImg').attr('src', _trc_res.cover);
            //nav top城市渲染
            templateObj.topCity_temFn();
            $('.city_name_ul').width((cityArr.length+2)*68)
            $('.city_line').width($('.map_head_l').width()-68);
            if($('.city_name_ul').width()>$('.map_head_l').width()){
                $('.LRbut').show();
            }else{
                $('.LRbut').hide();
            };
            var city_show_len;
            $(window).resize(function(){
                $('.city_name_ul').css('transform','translateX(0px)')
                $('.city_line').width($('.map_head_l').width()-68);
                city_show_len = $('.map_head_l').width()/68;
                if($('.city_name_ul').width()>$('.map_head_l').width()){
                    $('.LRbut').show();
                }else{
                    $('.LRbut').hide();
                }
            });
            city_show_len = $('.map_head_l').width()/68;
            var num = 0,xPx;
            $('.LRbut').find('i').unbind('click').on('click',function(){
                if($(this).hasClass('Lico')){
                    if(num>(cityArr.length)-city_show_len) return
                    num++ 
                    xPx = -num*68+"px";
                }else{
                    if(num == 0)return
                    num--
                    xPx = -num*68+"px";
                }
                $('.city_name_ul').css('transform','translateX('+xPx+')');
            })
        },
        //显示当前城市的交通站点信息
        plane_train_fn:function(){
            if(!_trc_res.traffic || (_trc_res.traffic.plane != 'null' && _trc_res.traffic.train != 'null'))return
            var planeArr = _trc_res.traffic.plane;
            var trainArr = _trc_res.traffic.train;
            for(var i = 0;i<planeArr.length;i++){
                var data = {}
                data.lat = Number(planeArr[i].traffic_latitude);
                data.lng = Number(planeArr[i].traffic_longitude);
                data.name = planeArr[i].traffic_name;
                data.marker_url = 'plane'
                mapObj.traffic_markerFn(data)
            };
            for(var i = 0;i<trainArr.length;i++){
                var data = {}
                data.lat = Number(trainArr[i].traffic_latitude);
                data.lng = Number(trainArr[i].traffic_longitude);
                data.name = trainArr[i].traffic_name;
                data.marker_url = 'train'
                mapObj.traffic_markerFn(data)
            }
        },
        //楼层和tab切换
        floor_TabFn:function(){
            $(".floor").eq(0).find("i").css("background", "url(/static/v1/img/map/f1.png) no-repeat")
            //点击楼层渲染数据
            $('.floor_box').unbind('click').on('click','.floor',function(){
                var index = $(this).index();
                if(index<5 || index == 6){
                    //隐藏hotel marker
                    for(var i = 0;i<hotel_markArr.length;i++){
                        hotel_markArr[i].setMap(null)
                    };
                    $('.hotel_con_rig').hide();
                    $('.spot_con_rig').show()
                    $('.js_sport_li,.r_top_tab').show().siblings(".search_content_list,.js_searchBox").hide();
                    var type = $(this).attr('data-type');
                    var get_postUrl = $(this).attr('data-postUrl');
                    if(index == 6){
                       _post_floorData.uid = uid         
                    }
                    if(!$(this).hasClass("active")){
                         //请求楼层接口
                        initObj.post_listDate(get_postUrl,type);
                        $('#map').find('.popup-content').each(function(){
                            $(this).remove()
                        });
                        if(hover_Marker){
                            hover_Marker.setMap(null)
                        }
                    };
                }else if(index==5){
                    if(!$(this).hasClass("active")){
                        //酒店列表
                        initObj.hotelListFn();
                    }
                }
                $(this).addClass("active").siblings().removeClass("active")
                $(".floor").find("i").removeAttr("style")
                $(this).find("i").css("background", "url(/static/v1/img/map/f" + (index + 1) + ".png) no-repeat");
            });
            //tab类型切换
            $(".r_top_tab_ul").unbind('click').on("click", "li", function () {
                $(".r_top_tab_ul li").removeClass('active');
                $(this).addClass("active");
                var type = $(this).attr('data-type');
                //渲染楼层数据
                templateObj.floor_list_temFn(type);

                $('#map').find('.popup-content').each(function(){
                    $(this).remove()
                })
                if(hover_Marker) hover_Marker.setMap(null);
               
            });
        },
        //游玩时间编辑
        edit_timeFn:function(){
            var sethtml_day_mun = _this_cityDay_num == 0?'<1':_this_cityDay_num
            $('.edit_day_num').text(sethtml_day_mun);
            //push 每天日期的数组
            var day_date, num=0,hotelDay = Number(_this_city_data.city_d_1);
          
            if(_trc_res.dayTime){
                _Daydate_arr = _trc_res.dayTime
            }else{
                for(var i = 0;i<_this_cityDay_num;i++){
                    day_date = _this_city_data.city_date;
                    hotelDay=Number(_this_city_data.city_d_1+num);
                    var date1 = addDate(day_date,num);
                    var get_Date = getDateAfter_n(day_date,num,'-');
                    var monthDay = monthDate(day_date,num);
                    num++
                    day_date = date1;
                   
                    _Daydate_arr.push({
                        date:date1,hotel_day:hotelDay,
                        month_day:monthDay,of_date:get_Date,
                        time1:'480',time2:'1320',
                        betw_time:"8:00-22:00"
                    })
                    
                };
            }
            // console.log(_Daydate_arr)
           
            // 第一个城市 后面的城市(不包括第一个城市)
            //判断是否有跨城 有跨城在数组中开头插入一天
            across_city = _trc_res.across_city;
            if(across_city != 'false' && this_city_index>0){
                // console.log(across_city.time2)
                _Daydate_arr.unshift({
                    date:across_city.date,
                    hotel_day:across_city.hotel_day,
                    month_day:across_city.month_day,
                    of_date:across_city.of_date,
                    time1:across_city.time1,
                    time2:across_city.time2,
                    betw_time:across_city.betw_time
                });
            };
            // console.log(next_city_day0)
            //判断当前城市后面几个0，最后一天的结束时间要做限制
            if(next_city_day0 != 0){
                var minutes0 = next_city_day0*2*60; //1个0小时城市。每个城市2小时
                var last_time2 = Number(_Daydate_arr[_Daydate_arr.length-1].time2);
                lastDay0_time2 = last_time2 - minutes0
                _Daydate_arr[_Daydate_arr.length-1].time2 = lastDay0_time2.toString();
            }
            // console.log(_Daydate_arr);
            // return false ;
            templateObj.edit_time_temFn();

            for(var i = 0;i<_Daydate_arr.length;i++){
                //时间进度条方法
                initObj.slider_Fn(i);
                var time1 = Number(_Daydate_arr[i].time1);
                var time2 = Number(_Daydate_arr[i].time2);
                var hours = (time2 - time1) / 60;
                allHours += hours;
            };
           
            //判断是否有跨城 跨城的开始时间不能拖动
            if(across_city != 'false'){
                $('.slider_ul').find('li:eq(0)').find('.jslider-pointer:eq(0)').css('pointer-events','none');
                $('.slider_ul').find('li:eq(0)').find('.slider_title').append('<span class="fr across_txt">到达'+_city_name+'</span>')
            };
            //判断当前城市后面有0天的，结束时间不能拖动
            if( next_city_day0 != 0){
                $('.slider_ul').find('li:last-child').find('.jslider-pointer:eq(1)').css('pointer-events','none')
            }
            //判断当前城市为0天的 结束时间不能拖
            if(_trc_res.next_city_day0 == 'true'){ 
                $('.slider_ul').find('li:last-child').find('.jslider-pointer:eq(1)').css('pointer-events','none')
            }
            //总小时
            $('.all_day_hours').html(allHours);

            //城市游玩时间加减
            $('.td_but').unbind('click').on('click','.sub_day,.add_day',function(){
                if($(this).hasClass('add_day')){
                    if(_allDay_num >=30) return;//整个行程时间
                    _this_cityDay_num+=1 
                    _allDay_num += 1;

                    var last_i = _Daydate_arr.length-1;
                    var last_time1 = _Daydate_arr[last_i].time1;
                    var last_time2 = _Daydate_arr[last_i].time2;
                    var last_of_date = _Daydate_arr[last_i].of_date; //在添加之前的最后一天日期
                    var last_monthDay = _Daydate_arr[last_i].month_day;
                    var last_hotelDay = Number((_Daydate_arr[last_i].hotel_day));
                    var last_betw_time = _Daydate_arr[last_i].betw_time;
                    $('.slider_ul').find('li').eq(last_i).remove()
                    
                    var next_of_date = getDateAfter_n(last_of_date,1,'-');
                    var next_date = addDate(last_of_date,1);
                    var next_monthDay = monthDate(last_of_date,1);
                    var next_hotelDay = last_hotelDay+1; 
                   
                   
                    var next_i = _Daydate_arr.length
                    var next_str = '<li class="slider_list">\
                                        <div class="layout-slider">\
                                            <div class="slider_title">Day'+last_hotelDay +'<span class="eait_line">|</span>'+ last_monthDay +'</div>\
                                            <input id="slider'+last_i+'" type="slider" name="area" value="480;1320" />\
                                        </div>\
                                    </li>\
                                    <li class="slider_list">\
                                        <div class="layout-slider">\
                                            <div class="slider_title">Day'+next_hotelDay +'<span class="eait_line">|</span>'+ next_monthDay +'</div>\
                                            <input id="slider'+next_i+'" type="slider" name="area" value="'+last_time1+";"+last_time2+'" />\
                                        </div>\
                                    </li>'
                    $('.slider_ul').append(next_str);
                    initObj.slider_Fn(last_i);
                    initObj.slider_Fn(next_i);
                    
                    _Daydate_arr.push({date:next_date,hotel_day:next_hotelDay,
                    month_day:next_monthDay,of_date:next_of_date,time1:last_time1,
                    time2:last_time2,betw_time:last_betw_time});

                    //总小时
                    allHours += 14;
                    $('.all_day_hours').html(allHours);
                    

                    
                }else{

                    if(_this_cityDay_num <= 1) return;
                    _this_cityDay_num-=1
                    _allDay_num -= 1
                    subFn()
                 
                    function subFn(){
                        var last_i = _Daydate_arr.length-1;
                        var last_time1 = _Daydate_arr[last_i].time1;
                        var last_time2 = _Daydate_arr[last_i].time2;
                        var last_betw_time = _Daydate_arr[last_i].betw_time;
                        $('.slider_ul').find('li').eq(last_i).remove();
                        $('.slider_ul').find('li').eq(last_i-1).remove();

                        //对应的酒店列表删除
                        // $('.js_hotel_ul').find('li:last-child').remove();
                        $('.js_hotel_ul li').each(function(i,n){ //匹配新增的是哪天的酒店
                            if(_Daydate_arr[last_i].month_day.replace(/-/g,'.').indexOf($(n).find('.time_num').html())!=-1){
                                $(n).remove()
                            }
                        })

                        //删除的时间
                        var del_time1 = Number(_Daydate_arr[last_i-1].time1);
                        var del_time2 = Number(_Daydate_arr[last_i-1].time2);
                        var del_time = (del_time2 - del_time1)/60;
                        allHours -= del_time;
                        //总小时
                        $('.all_day_hours').html(allHours);
                        _Daydate_arr.pop();//删除最后一个(删除后数组的长度就变了)
                        var pop_i = _Daydate_arr.length-1
                        _Daydate_arr[pop_i].time1 = last_time1
                        _Daydate_arr[pop_i].time2 = last_time2
                        _Daydate_arr[pop_i].betw_time = last_betw_time;
                        var pop_hotelDay = _Daydate_arr[pop_i].hotel_day;
                        var pop_monthDay= _Daydate_arr[pop_i].month_day;
                        // console.log(_Daydate_arr);

                        var pop_str = '<li class="slider_list">\
                                            <div class="layout-slider">\
                                                <div class="slider_title">'+pop_hotelDay +'<span class="eait_line">|</span>'+ pop_monthDay +'</div>\
                                                <input id="slider'+pop_i+'" type="slider" name="area" value="'+last_time1+";"+last_time2+'" />\
                                            </div>\
                                        </li>'
                        $('.slider_ul').append(pop_str);
                        initObj.slider_Fn(pop_i);

                        
                        // $('.msg_box').each(function (i,n) {
                        //     $(n).find('.wap:eq(' + this_index + ')').removeClass('disabled').removeClass('active');
                        // });
                    }
                        
                };
                $('.city_day_num').html(_this_cityDay_num);
                $('.edit_day_num').html(_this_cityDay_num);
                var title = _title_city_name+_allDay_num+'日游行程单'
                $('.trc_title').html(title);
                $('#trc_title').val(title);
                //当前城市的游玩结束日期
                $('.date2').html(_Daydate_arr[_Daydate_arr.length-1].month_day);
                // 计算所有添加游玩的时间，和添加总天数时间做对比
                initObj.all_play_timeFn('add',0);
                //判断当是否在酒店楼层
                if($('.floor_box').find('.active').index() == 5){
                    initObj.Pagination()
                }
            });   
            

        },
        //时间进度条
        slider_Fn: function (i) {
            
            jQuery("#slider"+i).slider({
                from: 300,
                to: 1440,
                step: 30,
                dimension: '',
                skin: "round",
                // scale: ['5:00','24:00'],
                limits: false,
                round: 0,
                calculate: function (value) { //初始化
                    var hours = Math.floor(value / 60);
                    // console.log(hours)
                    var mins = (value - hours * 60);
                    // console.log(mins)
                    return (hours < 10 ? "0" + hours : hours) + ":" + (mins == 0 ? "00" : mins);
                },
                callback: function (value) { //改变后
                    if(i == 'next')return
                    //滑动之前的时间
                    var before_time1 = Number(_Daydate_arr[i].time1);
                    var before_time2 = Number(_Daydate_arr[i].time2);
                    var before_time = (before_time2-before_time1)/60;
                    // console.log(before_time)
                    //滑动之后的时间
                    // console.log(value)
                    var timeArr = value.split(';');
                    var time1 = Number(timeArr[0]);
                    var time2 = Number(timeArr[1]);
                    var betw_time1Arr = (time1/60).toString().split('.');
                    var betw_time1 = betw_time1Arr[1]?betw_time1Arr[0]+":30":betw_time1Arr[0]+":00";
                    var betw_time2Arr = (time2/60).toString().split('.');
                    var betw_time2 = betw_time2Arr[1]?betw_time2Arr[0]+":30":betw_time2Arr[0]+":00";
                    _Daydate_arr[i].time1 = time1.toString();
                    _Daydate_arr[i].time2 = time2.toString();
                    _Daydate_arr[i].betw_time = betw_time1+"-"+betw_time2;
                    // console.log(_Daydate_arr);
                    //滑动之后的时间
                    var after_time = (time2-time1)/60;
                    //总小时
                    allHours += after_time-before_time
                    $('.all_day_hours').html(allHours);
                    initObj.all_play_timeFn('add',0)
                    if (next_city_day0 == 0){//下个城市不是0天
                        //最后一天是否跨城
                        if(i == _Daydate_arr.length-1){
                            if(time2<1320){
                                var next_val = time2+120+';1320';
                                $('.slider_box').find('.next_slider_list').remove();
                                var next_i = 'next';
                                var next_city = _trc_res.go_city_array[Number(this_city_index+1)]
                                if(next_city){//判断当前城市是不是最后一个城市
                                    var next_city_str =  '<div class="next_slider_list">\
                                                    <div class="layout-slider">\
                                                        <div class="slider_title">到达'+next_city.city_name+'</div>\
                                                        <input id="slider'+ next_i +'" type="slider" name="area" value="'+next_val+'" />\
                                                    </div>\
                                                </div>';
                                    $('.slider_box').append(next_city_str)
                                    initObj.slider_Fn(next_i);
                                    $('.next_slider_list .jslider-pointer:eq(0)').css('pointer-events','none')
                                }
                            
                            }else{
                                $('.slider_box').find('.next_slider_list').remove();
                            }
                        };
                    }
                    
                }
               
            });
           


        },
        //请求楼层的数据
        post_listDate:function(postUrl,type){
            $.post(postUrl,_post_floorData,function(res){
                if(!res) return
                _floor_res = res;
                //渲染楼层tab类型
                templateObj.list_tab_temFn();
                // console.log(_floor_res)
                //渲染楼层数据
                templateObj.floor_list_temFn(type);
                
            },'json')
        },
        //hover景点
        hoverListFn:function(){
            //hover 景点列表
            $('.js_rlist_ul').find('.hov_list').unbind('hover').hover(function(){
                var lat = Number($(this).attr('data-lat'));
                var lng = Number($(this).attr('data-lng'));
                var name = $(this).find('.attractions_name').html();
                var floor_index = $(".floor_box").find(".active").index();
                var pos={lat:lat,lng:lng};
                mapObj.hoverMarker(floor_index,pos)
                var infoData = {
                    name:name,
                    lat:lat,
                    lng:lng,
                    playTime:$(this).find('.jsPlay').html()+$(this).find('.time_num').html()
                }
                mapObj.style_InfowindowFn(infoData,"spot_hover")
                
            },function(){
                $('#map').find('.popup-content').each(function(){
                    $(this).remove()
                })
                hover_Marker.setMap(null)
            });
        },
        //hover右边列表分店
        hoverFenListFn:function(type){
            $('.js_rlist_ul').find('.fen_list').unbind('hover').hover(function(){
                var parentsI = $(this).parents('li.show_store_list').index();
                var thisI = $(this).index();
                var fenData;
                if (type == 'eat'){ //type楼层数据类型
                    fenData = _floor_res.eat[parentsI].place[thisI].fen_store
                }else{
                    fenData = _floor_res.local[thisI].fen_store
                };
                for(var i = 0;i<fenData.length;i++){
                    var lat = Number(fenData[i].latitude);
                    var lng = Number(fenData[i].longitude);
                    var name = fenData[i].branch_name;
                    var pos={lat:lat,lng:lng};
                    mapObj.hoverMarker(3,pos,type)
                    var infoData = {
                        name:name,
                        lat:lat,
                        lng:lng,
                        playTime:'推荐用餐1.5小时'
                    }
                    mapObj.style_InfowindowFn(infoData,"spot_hover")
                }
            },function(){
                //删除地图info
                $('#map').find('.popup-content').each(function(){
                    $(this).remove()
                })
                //清空hover marker
                mapObj.del_hover_Marker()
            })
            
        },
        //点击展开店铺
        click_shopFn:function(){
            // var show_num = 0;
            $(".r_main .js_rlist_ul").unbind('click').on("click", ".js_show_shop", function () {
                $(this).parents("li.show_store_list").find(".f5_store").stop(true,true).slideToggle();
                if($(this).html() == '展开店铺'){
                    $(this).html('收起店铺')
                }else{
                    $(this).html('展开店铺')
                }

            });    
        },
        //详情展示
        detail_showFn:function($sel,$click_sel){
            //景点详情
            $($sel).unbind('click').on("click", $click_sel, function () {
            // $(".spot_con_rig .list,.js_attractions_ul li").unbind('click').on("click", ".introduce,.list_l,._l,.p1", function () {
                var list,detail_url,name,r_top_active;
                if($(this).parents('ul').hasClass('js_attractions_ul')){
                    list = $(this).parents("li");
                    detail_url = $(".floor_box").find(".floor").eq(Number(list.attr('data-this_floor'))).attr('data-detailUrl');
                    name = list.find("._r .p1").text();
                    r_top_active = list.attr('data-this_type');
                }else{
                    list = $(this).parents(".list");
                    detail_url = $(".floor_box").find(".active").attr('data-detailUrl');
                    name = list.find(".attractions_name").text();
                    r_top_active = $(".r_top_tab_ul").find(".active").text();
                    
                }
               
                var lat = list.attr("data-lat");
                var lng = list.attr("data-lng");
                
                var post_data = {
                    city_id: city_id,
                    spot_name: name,
                    type: r_top_active,
                    lat: lat,
                    lng: lng
                };
                if(detail_url == "food_detail"){
                    post_data.store_type = list.hasClass("fen_list") ? 1 : 0;
                }
                $.post(detail_url,post_data,function(data){
                    if(!data) return;
                    var tab_text = $(".r_top_tab_box").find("li.active").text();
                        if (detail_url == "food_detail" || detail_url == "shop_detail") {
                            if (tab_text == "必吃美食") {
                                details_popup_show(".f4_details_popup_box");
                                templateObj.f4_store_detailsPopup(data);
                                _dataspot = data.spot.store;
                            } else if (tab_text == "本土美食") {
                                details_popup_show(".f4tab2_details_popup_box");
                                templateObj.f4tab2_detailsPopup(data);
                                _dataspot = data.store;
                            } else if (tab_text == "美食街区") {
                                details_popup_show(".foodstreet_details_popup_box");
                                templateObj.foodstreet_detailsPopup(data.spot);
                                _dataspot = data.spot;
                            } else {
                                details_popup_show(".f5_details_popup_box");
                                templateObj.f5_tab2_3_detailsPopup(data);
                                _dataspot = data.spot;
                                return
                            }
                        } else {
                            details_popup_show(".rw_details_popup_box");
                            _dataspot = data.spot;
                            templateObj.detailsPopup(data);
                            return;
                        }

                        function details_popup_show(details) {
                            $(details).fadeIn();
                            tabSwitch(details);
                            $(details).find('.details_popup_tab_active').css({
                                left: 0
                            });
                            $(details).find(".tab_content_box .tab_content").hide();
                            $(details).find(".tab_content_box").find(".tab_content").eq(0).show();
                        };
                      
                },'json')
            });
            //菜品和商品
            $(".spot_con_rig .show_store_list").unbind('click').on("click", ".store_introduce,.store_list_l", function () {
                var list = $(this).parents(".show_store_list");
                var name = list.find(".attractions_name").eq(0).text();
                var lat = list.attr("data-lat");
                var lng = list.attr("data-lng");
                var detail_ajax_url;
                var r_top_active = $(".r_top_tab_ul").find(".active").text();
                var post_data = {
                    spot_name: name,
                    type: r_top_active,
                    city_id:city_id,
                    lat: lat,
                    lng: lng
                };

                switch ($(".floor_box").find(".active").index()) {
                    case 3:
                        detail_ajax_url = "specific";
                        break;
                    case 4:
                        detail_ajax_url = "local_product";
                        break;
                }

                $.ajax({
                    url: detail_ajax_url,
                    type: "post",
                    dataType: "JSON",
                    data: post_data,
                    success: function (data) {
                        // console.log(data);
                        var tab_text = $(".r_top_tab_box").find("li.active").text();
                        $(".eat_goods_details_popup").css({
                            background: "url(" + list.find("img").attr("src") + ") no-repeat",
                            backgroundSize: 100 + "%"
                        });
                        $(".eat_goods_details_box").fadeIn();
                        templateObj.eatgoods_detailsPopup(data, tab_text);

                    }
                });
            });
           
        },
        //相册
        morePictures: function (type) {
            var img_top_html,img_thumbs_html,img_length;
            if(type == 'is_spot'){
                var spot_data = _dataspot
                $(".swiper-wrapper").removeAttr("style")
                $(".gallery-thumbs").html("");
                $(".gallery-top").html("");
                var img_data = spot_data.image_url;
                img_length = img_data.length;
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
                var spot_img_top_html = img_top_render(spot_data);
                img_top_html = spot_img_top_html

                var img_thumbs_tem = '<div class="swiper-wrapper">\
                                {{each image_url as value i}}\
                                    <div class="swiper-slide" style="background-image:url({{value}})"></div>\
                                {{/each}}\
                            </div>';
                var img_thumbs_render = template.compile(img_thumbs_tem);
                var spot_img_thumbs_html = img_thumbs_render(spot_data);
                img_thumbs_html = spot_img_thumbs_html
            }else{
                var hotel_data = _hotel_datal
                var img_data = hotel_data.highImage;
                img_length = img_data.length;
                $(".content_name").html(hotel_data.Detail.HotelName);
                $(".content_p").html(hotel_data.Detail.Features);
                var roomStr = '';
                        for(var i = 0 ;i< hotel_data.Rooms.length;i++){
                            roomStr+=hotel_data.Rooms[i].BedType+'、'
                        }
                $('.more_pic_box  .hotel_content_info').show().find('.content_phone').text(hotel_data.Detail.Phone).end()
                    .find('.content_adress').text(hotel_data.Detail.Address).end()
                    .find('.content_room').text(roomStr.substring(0,roomStr.length-1)).end()
                    
                var img_top_tem = '<div class="swiper-wrapper">\
                                    {{each highImage as value i}}\
                                    <div class="swiper-slide" style="background-image:url({{value}})"></div>\
                                    {{/each}}\
                                </div>\
                                <div class="img_text_box"><div class="swiper-pagination"></div></div>';
                var img_top_render = template.compile(img_top_tem);
                var hotel_img_top_html = img_top_render(hotel_data);
                img_top_html = hotel_img_top_html;

                var img_thumbs_tem = '<div class="swiper-wrapper">\
                                    {{each highImage as value i}}\
                                        <div class="swiper-slide" style="background-image:url({{value}})"></div>\
                                    {{/each}}\
                                 </div>';
                var img_thumbs_render = template.compile(img_thumbs_tem);
                var hotel_img_thumbs_html = img_thumbs_render(hotel_data);
                img_thumbs_html = hotel_img_thumbs_html
            }
            
            
            $(".gallery-top").html(img_top_html);
            $(".gallery-thumbs").html(img_thumbs_html);

            var galleryTop = new Swiper('.gallery-top', {
                spaceBetween: 5,
                loop: true,
                allowTouchMove: false,

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
                loop: true,
                centeredSlides: false,
                allowTouchMove: false,
                loopedSlides: img_length, //looped slides should be the same
                slideToClickedSlide: true,
            });

            galleryTop.controller.control = galleryThumbs;
            galleryThumbs.controller.control = galleryTop;
        },
        //景点搜索
        sportSearch: function () {
            $(".js_tab_search").on("click", function () {
                $(".r_top_tab").hide().siblings(".js_searchBox").show();
                $("#nearby").val("")
            });
            $(".search_del").on("click", function () {
                $(".r_top_tab,.js_sport_li").show().siblings(".js_searchBox,.search_content_list").hide();
            })
            var search_time;
            $("#nearby").bind("input propertychenge", function () {
                var postData = {
                    spot_name: $(this).val(),
                    city_id: city_id
                }
                clearTimeout(search_time)
                if ($(this).val() == "") {
                    $('.js_sport_li').show().siblings(".search_content_list").hide();
                   
                } else {
                    $(".search_content_list").show().siblings(".js_sport_li").hide();
                    search_time = setTimeout(function () {
                        getSearchli()
                    }, 500)

                }
                function getSearchli() {
                    $.get("allfloorSearch", postData, function (data) {
                        if (!data) return false;
                        // console.log(data)
                        if (data == "") {
                            //显示高德地图
                            $('.no_retrieval_box').show();
                            $('.js_search_ul').html("")
                            //新增景点
                            $('.spot_con_rig .retrieval_but').unbind('click').on('click', function () {
                                var search_txt = $('#nearby').val() ==""? "美食" : $('#nearby').val();
                                mapObj.lbsAmapFn(search_txt,'is_spot');
                            });
                        } else {
                            $('.no_retrieval_box').hide()
                            var str = '';
                            for (var i = 0; i < data.length; i++) {
                                str += '<li class="search_li clearfix" data-floor="' + data[i].floor_index + '" data-group="' + data[i].group + '">\
                                    <span class="fl">' + data[i].spot_name + '</span >\
                                    <span class="fr">' + data[i].type + '</span></li>'
                            };
                            $(".js_search_ul").html(str);
                        }
                    }, 'json');


                }
            })
            $(".search_content_list").on("click", ".search_li:not(.not_search)", function () {
                var floor_index = Number($(this).attr("data-floor"))
                var yw_type = $(this).attr("data-group")
                _post_floorData.search_spot_name = $(this).find(".fl").html()
                _post_floorData.group = yw_type
                _post_floorData.type = $(this).find(".fr").html()
                var postUrl = $('.floor_box').find('.floor').eq(floor_index).attr('data-postUrl')
                $('.js_sport_li,.r_top_tab').show().siblings(".search_content_list,.js_searchBox").hide();
                $(".floor_box .floor").eq(floor_index).addClass("active").siblings().removeClass("active")
                initObj.post_listDate(postUrl, yw_type);
            })
        },
        
        // 保存新增景点地点
        add_address_saveFn:function (){
            // 取消添加 
            $('.retrieval_popup_box').find('.ret_cancel').on('click',function(){
                $('.retrieval_popup_box').hide();
                $('.con_rig').find('.search_content_list').hide().end().find('.js_sport_li').show().end()
                .find('.js_searchBox').hide().end().find('.r_top_tab').show();
            });
            $('.retrieval_popup_box').find('.ret_save').unbind('click').on("click",function(){
                var spot_name = $('.spot_input_name').val(); //input name
                var address = $('.retrieval_middle').attr('data-address');//input address
                var map_name = $('.add_newName').html();
                var lat = Number($('.retrieval_middle').attr('data-address_lat'));
                var lng = Number($('.retrieval_middle').attr('data-address_lng'));
               
                var postData={
                    city_id : city_id,
                    latitude : lat,
                    longitude:lng,
                    address:address,
                    spot_name:spot_name,
                    map_name:map_name,
                    pic : $('img.address_cover').attr('src')
                };
                if(uid != null){
                    postData.uid = uid;
                }
                if(spot_name=="" || address == "" || !map_name) return false
                $.post('NewSpot',postData,function(res){
                    // console.log(res)
                    if(res.status){
                        layer.msg(res.msg,{
                            time: 600,
                            offset: '250px'
                        })
                        $('img.address_cover').attr('src',res.data)
                        var ret_save_offset = $('.ret_save').offset()
                        $('.new_spot_box').css({position:"absolute"}).animate({
                            width:'56px',
                            height:'56px',
                            left: ret_save_offset.left,
                            top:ret_save_offset.top,
                            
                        },function(){
                            $('.new_spot_box').find('.retrieval_popup_box').hide().end().find('.address_cover').show();
                            initObj.addflyer('.new_spot_box', $('.address_cover'),'add_newAddress');
                            $('.address_cover').hide();
                        });
                        var addgo_obj = {}
                        addgo_obj.this_name = spot_name;
                        addgo_obj.this_lat = lat;
                        addgo_obj.this_lng = lng;
                        addgo_obj.this_img_src = res.data; //上传后图片
                        addgo_obj.this_playtime = "1小时";
                        addgo_obj.default_playtime = "1小时";
                        addgo_obj.this_tag_time = 1;
                        addgo_obj.this_floor_index = 6;
                        addgo_obj.this_type = "add_newSpot";
                        addgo_obj.ranking = "";
                        addgo_obj.period_time = "allday";
                        addgo_obj.not_modifity = "0";
                        addgo_obj.js_sport_eat = 'spot';
                        addgo_obj.suit_season = "";
                        addgo_obj.city_id = city_id;
                        
                        addgo_arry.push(addgo_obj);
                        // console.log(addgo_arry);
                        templateObj.add_go_temFn(addgo_obj);
                        var marker_data = {
                            lat: lat,
                            lng: lng,
                            marker_url:'qt',
                            name:spot_name,
                            playTime:'适玩时长'+addgo_obj.this_playtime
                        }
                        mapObj.addgo_markerFn(marker_data);
                        $('.retrieval_popup_box').hide();
                        $('.con_rig').find('.search_content_list').hide().end().find('.js_sport_li').show().end().find('.js_searchBox').hide().end().find('.r_top_tab').show();
                    }else{
                        layer.msg(res.msg,{
                            time: 600,
                            offset: '250px'
                        })
                    }
                
                    
                },"json")

            })
        },
        //显示酒店列表
        hotelListFn:function(){
            $('.hotel_con_rig').show();
            $('.spot_con_rig').hide();
            $('.hotel_con_rig .city').html(_city_name);
            if($('.hotel_box').find('li').length == 0){
                //分页
                initObj.Pagination();
            }else{
                for(var i = 0;i<hotel_markArr.length;i++){
                    hotel_markArr[i].setMap(map)
                };
            }
            
            //谷歌地图缩放和平移后事件
            mapObj.map_idleFn();
            
            //酒店搜索
            $('.searchBox .searchText').on('input propertychange',function(){
                debouncelimitHotel(initObj.Pagination,500);
            })
           
        },
        //酒店城市切换
        hotel_city_tabFn:function(){
            //uniq()数组去重
            var hotel_city_arr = uniq(_trc_res.cityArray);
            var str;
            $(hotel_city_arr).each(function(){
                if(this == _city_name){
                    str += '<option value="'+this+'" selected="selected">'+this+'</option>';
                }else{
                    str += '<option value="'+this+'">'+this+'</option>';
                };
            })
            $('.hotle_cityTab').find('select').html(str);
            $('.hotle_cityTab').find('select').on('change',function(){
                var tab_city = $('.hotle_cityTab select').val()
                //分页 
                initObj.Pagination();
                 //酒店行政区域select框下拉变化
                initObj.selectChangeFn(tab_city);
            })
        },
        //酒店select框下拉变化
        selectChangeFn:function(tab_city){
            $('.selectCanton select').find('option:not(.moren)').remove()
            //行政区渲染
            $.post('../store/position',{type:'行政区',city:(tab_city+'市')},function(res){
                var str = '';
                if (!res) return false ;
                $(res).each(function(){
                    str +='<option value='+ this.Id +'>'+this.Name+'</option>'
                })
                $('.hotel_con_rig .selectCanton select').append(str);
            },'json');
            $('.hotel_con_rig .selectPrice select,.con_rig .selectCanton select').on('change', function () {
                //分页
                initObj.Pagination();
            });
            
        },
        //酒店分页
        Pagination:function (tab_city) { //设置翻页
            $('#Paginator').jqPaginator({
                totalPages: 1,
                visiblePages: 5,
                currentPage: 1,
                prev: '<li class="prev"><a href="javascript:void(0);">上一页</a></li>',
                next: '<li class="next"><a href="javascript:void(0);">下一页</a></li>',
                page: '<li class="page"><a href="javascript:void(0);">{{page}}</a></li>',
                onPageChange: function (num, type) {
                    var search_hotel = $('.searchBox .searchText').val().trim().replace(/\s/g,"");
                    var slider_len = $('.slider_ul li').length
                    var query = {};
                    query.arrival_date = _Daydate_arr[0].of_date;
                    query.departure_date = getDateAfter_n(query.arrival_date,slider_len,'-');
                    query.city = $('.hotle_cityTab select').val() + '市';
                    query.page = num;
                    query.page_size = 20; //每页显示的数据条数
                    query.post = true;
                    query.map_post = true;
                    query.rate = $('.selectPrice select').val();//价格
                    query.dis_id = $('.selectCanton select').val(); //选择行政区
                    query.query_text = search_hotel;//酒店收索文字
                    if(bounds.Radius){
                        query.position=bounds;//经纬度区域
                    }
                    // console.log(1111)
                    $.post("../store/hotel", query, function (res) {
                        if (!res.count || !res.hotel){
                            $('.hotel_box').html('')
                            $('.con_rig .no_hotelbox').show()
                            $("#pagination").hide();
                            $('#Paginator').hide();
                            $('.hotel_con_rig .retrieval_but').unbind('click').on('click',function(){
                                var s_hotel = search_hotel == ''? "酒店":search_hotel;
                                mapObj.lbsAmapFn(s_hotel,'is_hotel')
                            });
                            //清空酒店灰色marker
                            mapObj.del_hotle_markerFn();
                            //移除自定义窗口
                            $('#map').find('.popup-content').each(function(){
                                $(this).remove()
                            })
                            return false;
                        }
                        
                        $('.con_rig .no_hotelbox').hide()
                        // console.log(res)
                        $('#Paginator').jqPaginator('option',{
                            totalPages: Math.ceil(res.count/20)//总页数
                        });
                        $('#Paginator').show();
                        hotelList = res.hotel;
                        //酒店 列表数据
                        initObj.hotle_listDataFn()
                        //渲染酒店
                        templateObj.hotelList_temFn(res)
                        //添加酒店
                        initObj.addHotelFn();
                        //删除酒店
                        initObj.del_hotelFn();
                        //酒店详情
                        initObj.hotel_detailFn();
                        //鼠标hover酒店列表
                        initObj.hover_hotel_listFn();
                        // initFn.MarkerFn(hotelList);
                       
                        // mapFn.mapChange();
                    }, 'json')
                }
            });
        },
        // 酒店 列表数据
        hotle_listDataFn:function(){
            //清空hotel marker
            mapObj.del_hotle_markerFn();
            //移除自定义窗口
            $('#map').find('.popup-content').each(function(){
                $(this).remove()
            })
            for(var i = 0;i<hotelList.length;i++){
                var hotel_data = hotelList[i].Detail;
                var lat = Number(hotel_data.Latitude);
                var lng = Number(hotel_data.Longitude);
                var name = hotel_data.HotelName;
                var Category = hotel_data.Category;//类型 豪华.舒适.经济
                var Score = hotel_data.Review.Score;//评分
                var comm = hotel_data.Review.comm;//棒极了
                var LowRate = hotelList[i].LowRate;
                var data = {
                    lat:lat,lng:lng,name:name,
                    Category:Category,Score:Score,comm:comm,
                    LowRate:'￥'+LowRate+'起',
                    index:i
                }
               //展示默认灰色marker
               mapObj.hotel_markerFn(data); 
               
            }                 
        },
        //添加酒店
        addHotelFn:function(){
            //入住下拉框显示
            $('.hotel_box').on('click', '.addHotel', function () {
                var slider_len = $('.slider_ul li').length
                var query = {}, that =this;
                query.hotel_id = $(this).parents('.list').find('div.name').attr('hotelId');
                query.arrival_date = _this_city_data.city_date;
                query.departure_date = getDateAfter_n(query.arrival_date,slider_len,'-');
                query.map_post = true;
                $.post('../store/getHotelDetail', query, function (res) {
                    // console.log(res.Detail.Features)
                    var post_Features = res.Detail.Features == ''?'':res.Detail.Features
                    $(that).parents('.list').attr('Features',post_Features);
                    $(that).parent('li').find('.msg_box').slideDown(300).removeClass('dis_none');
                    $(that).parent('li').siblings('li').find('.msg_box').slideUp(200).addClass('dis_none');
                },'json')
               
            });
            //确定，取消
            $('.hotel_box').on('click', '.cancel,.confirm', function () {
                $(this).parents('.msg_box').slideUp(300).addClass('dis_none');
            });
            //添加酒店
            $('.con_rig').find('.msg_box .wap').unbind('click').on('click', function () {
                if($(this).hasClass('disabled')) return false;
                
                $(this).parents('.msg_box').find('.confirm').addClass('disabled'); //确定按钮文字变蓝
                
                var oIndex = $(this).parents('.list').attr('index');
                var Features = $(this).parents('.list').attr('Features');
                // console.log(Features)
                var iIndex = $(this).attr('index');

                $('.msg_box').each(function (i,n) {
                    $(n).find('.wap:eq(' + iIndex + ')').addClass('disabled');
                })
                $(this).removeClass('disabled').toggleClass('active');
                $(this).parents('.msg_box').find('.wap').each(function(){
                    if($(this).hasClass('active')){
                        $(this).parents('.msg_box').find('.confirm').removeClass('disabled');
                        return false;
                    }
                })
                if(!$(this).hasClass('active')){
                    $('.msg_box').each(function () {
                        $(this).find('.wap:eq(' + iIndex + ')').removeClass('disabled');
                    })
                }
                if($(this).hasClass('active')){
                    var curr_hotel = {};
                    curr_hotel.Features =Features;
                    curr_hotel.hotel_name = hotelList[oIndex].Detail.HotelName;
                    curr_hotel.BusinessZoneName = hotelList[oIndex].Detail.BusinessZoneName;
                    curr_hotel.LowRate = hotelList[oIndex].LowRate;//价格
                    curr_hotel.ThumbNailUrl = hotelList[oIndex].Detail.ThumbNailUrl;
                    curr_hotel.address = hotelList[oIndex].Detail.Address;
                    curr_hotel.lat = hotelList[oIndex].Detail.Latitude;
                    curr_hotel.lng = hotelList[oIndex].Detail.Longitude;
                    curr_hotel.tel = hotelList[oIndex].Detail.Phone;
                    curr_hotel.hotel_id = hotelList[oIndex].HotelId;
                    curr_hotel.city = hotelList[oIndex].Detail.CityName;
                    curr_hotel.StarRate = hotelList[oIndex].Detail.StarRate;
                    curr_hotel.Category = hotelList[oIndex].Detail.Category;//类型 豪华.舒适.经济
                    curr_hotel.Score = hotelList[oIndex].Detail.Review.Score;//评分;
                    curr_hotel.comm = hotelList[oIndex].Detail.Review.comm;//棒极了
                    curr_hotel.date =  _Daydate_arr[iIndex].date;
                    curr_hotel.of_date =  _Daydate_arr[iIndex].of_date;
                    curr_hotel.month_day =  _Daydate_arr[iIndex].month_day;
                    // console.log(curr_hotel)
                    _Daydate_arr[iIndex].hotel = curr_hotel;

                    var Category = curr_hotel.Category 
                    var Score = curr_hotel.Score
                    var comm = curr_hotel.comm
                    var LowRate = curr_hotel.LowRate;
                    var data = {
                        lat:Number(curr_hotel.lat),
                        lng:Number(curr_hotel.lng),
                        name:curr_hotel.hotel_name,
                        Category:Category,Score:Score,comm:comm,
                        LowRate:'￥'+LowRate+'起',
                        index:iIndex,
                        is_hover_hotel:true
                    }
                    mapObj.add_hotel_markerFn(data);
                    //存储map info 的数据
                    addHotel_info_arr[iIndex] = data
                }else{
                    delete _Daydate_arr[iIndex].hotel;
                    addHotel_markArr[iIndex].setMap(null)
                    // addHotel_markArr.splice(iIndex,1);
                    addHotel_markArr[iIndex] = null;
                    
                }
                // console.log(_Daydate_arr)
                templateObj.add_hotel_temFn()
                //酒店详情
                initObj.hotel_detailFn();
                
            });
        },
        //鼠标hover酒店列表
        hover_hotel_listFn:function(){
            var h_index
            $('.hotelBox').find('li').unbind('hover').hover(function(){
                h_index = $(this).index();
                var hotel_data = hotelList[h_index].Detail;
                var lat = Number(hotel_data.Latitude);
                var lng = Number(hotel_data.Longitude);
                var name = hotel_data.HotelName;
                var Category = hotel_data.Category;//类型 豪华.舒适.经济
                var Score = hotel_data.Review.Score;//评分
                var comm = hotel_data.Review.comm;//棒极了
                var LowRate = hotelList[h_index].LowRate;
                var data = {
                    lat:lat,lng:lng,name:name,
                    Category:Category,Score:Score,comm:comm,
                    LowRate:'￥'+LowRate+'起',
                    index:h_index,
                    is_hover_hotel:true
                }
                mapObj.style_InfowindowFn(data, 'hotel_hover');
                hotel_markArr[h_index].setIcon('/static/v1/img/map/hotel2.png');
            },function(){
                //移除自定义窗口
                $('#map').find('.popup-content').each(function(){
                    $(this).remove()
                })
                hotel_markArr[h_index].setIcon('/static/v1/img/map/hotel1.png');
            })
        },
        //删除酒店
        del_hotelFn:function(){
            $('.js_hotel_ul').unbind('click').on('click','.delete_icon',function(){
                var this_index = $(this).parents('li').attr('data-day_index');
                // console.log(li_index)
                delete _Daydate_arr[this_index].hotel;
                addHotel_markArr[this_index].setMap(null);
                // // //删除数组的某一个marker
                // addHotel_markArr.splice(this_index,1);
                addHotel_markArr[this_index] = null;
                // 删除存储酒店info的对应的数据
                addHotel_info_arr.splice(this_index,1);
                $(this).parents('li').remove();
                $('.msg_box').each(function (i,n) {
                    $(n).find('.wap:eq(' + this_index + ')').removeClass('disabled').removeClass('active');
                });
            });
        },
        //酒店详情
        hotel_detailFn:function(){
            $('.hotel_con_rig,.js_hotel_ul').find('.list,.jsHotel').unbind('click').on('click', '.name,.left_img,._l,.p1', function () {
                var slider_len = $('.slider_ul li').length
                var query = {};
                query.hotel_id = $(this).parents('.list,.jsHotel').find('.name,.p1').attr('hotelId');
                query.arrival_date = _this_city_data.city_date;
                query.departure_date = getDateAfter_n(query.arrival_date,slider_len,'-');
                query.map_post = true;
                $.post('../store/getHotelDetail', query, function (res) {
                    if (!res) return false;
                    $(".hotel_details_popup_box").fadeIn();
                    _hotel_datal = res
                    var rooms = '';
                    for (var i = 0; i < res.Rooms.length; i++) {
                        rooms += res.Rooms[i].Name + '丨'+ res.Rooms[i].BedType +'、';
                    }
                    var imgs = '';
                    for (var i = 0; i < 5; i++) {
                        imgs += '<li><img src=' + res.highImage[i] + ' alt=""></li>'
                    }
                    var img_length = res.highImage.length;
                    if (img_length >= 5) {
                        $(".last_li_img").show();
                    } else {
                        $(".last_li_img").hide();
                    };
                    var grade = res.Detail.Review.Score>=4.5?'棒极了':(res.Detail.Review.Score<4?'还不错':'挺好哒');
                    var starStr = '';
                    for(var i=0;i<res.Detail.Category;i++){
                        starStr+='<i class="star"></i>'
                    }
                    $('.hotel_details_popup_box').find('.p1').text(res.Detail.HotelName).end()
                        .find('.p2').html(starStr+ '¥' + Math.ceil(res.LowRate)+ '起').end()
                        .find('.p3 .tel').text(res.Detail.Phone).end()
                        .find('.p3 .address').text(res.Detail.Address).end()
                        .find('.spot_Introduction').text(res.Detail.Features).end()
                        .find('.popup_tab1 .phone').text(res.Detail.Phone).end()
                        .find('.popup_tab1 .address_name').text(res.Detail.DistrictName + res.Detail.Address).end()
                        .find('.popup_tab1 .type').text(rooms).end()
                        .find('.popup_tab1 .suit_season').text(res.Detail.GeneralAmenities).end()
                        .find('.popup_tab1 .traffic_info').text(res.Detail.Traffic).end()
                        .find('.popup_img_url').html(imgs).end()
                        .find('.hotel_info_right .fz_18').html(grade+' <em></em> '+res.Detail.Review.Score+'分');
                }, 'json');
            })
        },
        // 保存新增酒店
        add_new_hotleFn:function(){
            // 取消添加 
            $('.retrieval_popup_box').find('.ret_cancel').on('click',function(){
                $('.retrieval_popup_box').hide();
            });
            $('.retrieval_popup_box').find('.ret_save').unbind('click').on("click",function(){
                var dateTrue =  true;
                var newHotel = {};
                newHotel.BusinessZoneName= '';
                newHotel.LowRate= parseInt($('.hotel_inputBox .input_price').val())?parseInt($('.hotel_inputBox .input_price').val()):0; //价格
                newHotel.ThumbNailUrl= $('.new_spot_box .address_cover').attr('src');
                newHotel.address= $('.hotel_inputBox .hotel_input_address').val();
                newHotel.hotel_name= $('.hotel_inputBox .hotel_input_name').val();
                newHotel.lat= $('.retrieval_middle').attr('data-address_lat');
                newHotel.lng= $('.retrieval_middle').attr('data-address_lng');
                newHotel.tel= '';
                newHotel.arrivalDate= $('.hotel_inputBox .input_date').val();
                newHotel.Features = '';
                newHotel.hotel_id =''
                newHotel.city ='';
                newHotel.city_id = city_id;
                newHotel.StarRate ='';
                newHotel.Category = '';//类型 豪华.舒适.经济
                newHotel.Score = '';//评分;
                newHotel.comm = '';//棒极了
                for(var key in newHotel){
                    // console.log(newHotel)
                    // console.log(key)
                    // console.log(!0) 是true
                    if(!newHotel[key]){
                        switch(key){
                            case 'ThumbNailUrl':
                            layer.msg('请上传一张酒店封面',{
                                time:2000
                            })
                            return false;
                            break;

                            case 'address':
                            layer.msg('请输入酒店地址',{
                                time:2000
                            })
                            return false;
                            break;

                            case 'hotel_name':
                            layer.msg('请输入酒店名称',{
                                time:2000
                            })
                            return false;
                            break;

                            case 'arrivalDate':
                            layer.msg('请输入住店日期',{
                                time:2000
                            })
                            return false;
                            break;

                            case 'LowRate':
                            layer.msg('请输入酒店价格',{
                                time:2000
                            })
                            // console.log(newHotel[key])
                            return false;
                            break;
                        }
                    }
                }

                $(_Daydate_arr).each(function(i,ele){ //判断住店日期是否正确
                    dateTrue = false;
                    if(newHotel.arrivalDate.replace(/-/g,'.').indexOf(this.date)!=-1){
                            dateTrue = true;
                            return false;   
                    }
                })

                if(!dateTrue){
                    layer.msg('酒店入住日期和行程不匹配，请认真选择入住日期',{
                                time:2000
                            })
                    $('.input_date_out .input_date').focus();
                    return false;
                } 
                $.post('NewHotel',newHotel,function(res){
                    if(res.status==true){
                        newHotel.ThumbNailUrl = res.data;
                        var temp = {};
                        temp.lng =newHotel.lng;
                        temp.lat =newHotel.lat;
                        temp.name =newHotel.hotel_name;
                        
                        $(_Daydate_arr).each(function(i,ele){ //匹配新增的是哪天的酒店
                            if(newHotel.arrivalDate.replace(/-/g,'.').indexOf(this.date)!=-1){
                                var data = {
                                    lat:Number(newHotel.lat),
                                    lng:Number(newHotel.lng),
                                    name:newHotel.hotel_name,
                                    LowRate:'￥'+newHotel.LowRate+'起',
                                    index:i,
                                    is_hover_hotel:true
                                }
                                mapObj.add_hotel_markerFn(data);
                                addHotel_info_arr[i] = data
                                newHotel.date =  _Daydate_arr[i].date;
                                newHotel.of_date =  _Daydate_arr[i].of_date;
                                newHotel.month_day =  _Daydate_arr[i].month_day;
                               
                                _Daydate_arr[i].hotel = newHotel;
                                // console.log(_Daydate_arr)
                                templateObj.add_hotel_temFn()  
                            }

                        })
                        $('.add_address_img').find('span').html("上传封面")
                        $('.new_spot_box input').val('');
                        $('.new_spot_box .input_address').attr('readonly','readonly');
                        $('.new_spot_box .address_cover').attr('src','');
                        $('.new_spot_box .retrieval_popup_box').hide();
                        $('.hotel_con_rig .searchBox').find('input').val('')
                        initObj.Pagination();
                    }else{
                        layer.msg('网络错误，保存失败',{
                            time:2000
                        })
                        return false ;   
                    }
                },'json')
            })
            
            
        },
        //上传封面
        add_cover_imgFn:function () {
            //上传头像
            var clipArea = new bjj.PhotoClip("#clipArea", {
                size: [600, 400], // 截取框的宽和高组成的数组。默认值为[260,260] 3:2 的比例
                outputSize: [600, 400], // 输出图像的宽和高组成的数组。默认值为[0,0]，表示输出图像原始大小
                //outputType: "jpg", // 指定输出图片的类型，可选 "jpg" 和 "png" 两种种类型，默认为 "jpg"
                file: "#file", // 上传图片的<input type="file">控件的选择器或者DOM对象
                ok: "#clipBtn", // 确认截图按钮的选择器或者DOM对象
                loadStart: function () {
                    // 开始加载的回调函数。this指向 fileReader 对象，并将正在加载的 file 对象作为参数传入
                    $('.cover-wrap').fadeIn();
                    // console.log("照片读取中");
                },
                loadComplete: function () {
                    // 加载完成的回调函数。this指向图片对象，并将图片地址作为参数传入
                    // console.log("照片读取完成");
                },
                //loadError: function(event) {}, // 加载失败的回调函数。this指向 fileReader 对象，并将错误事件的 event 对象作为参数传入
                clipFinish: function (dataURL) {
                    // 裁剪完成的回调函数。this指向图片对象，会将裁剪出的图像数据DataURL作为参数传入
                    $('.cover-wrap').fadeOut();
                    $('img.address_cover').attr('src', dataURL);
                    // console.log(dataURL)
                   
                    layer.msg("图片上传成功", {
                        time: 600,
                        offset: '250px'
                    });
                    $('.add_address_img').find('span').html("修改封面")
                }
            });
        },
        // 添加我想去景点
        add_spot_Fn:function(){
            $(".js_rlist_ul .list").on("click", ".js_go_button", function () {
                $(".visitors_eat").fadeOut();
                var floor_index = $(".floor_box").find(".active").index();
                var this_type = $(".r_top_tab_ul").find(".active").text();
                var this_list = $(this).parents('.list');
                var go_name = this_list.find('.attractions_name').text();
                var this_offset = $(this).offset();
                for (var i = 0; i < addgo_arry.length; i++) {
                    var this_name = addgo_arry[i].this_name;
                    if (this_name == go_name) {
                        if (!$(this).hasClass("go_button_gray")) {
                            $(".same").css({
                                left: this_offset.left - 156,
                                top: this_offset.top - 14
                            }).stop(true, true).fadeIn().html("您已添加相同的景点");
                            setTimeout(function () {
                                $(".same").fadeOut();
                            }, 800)
                            return
                        }
                    }
                };
    
                if (!$(this).hasClass("go_button_gray")) {
                    $(this).addClass("go_button_gray").html("已添加").parents('.list').addClass("city_list_go");
                    var this_lat = Number(this_list.attr("data-lat"));
                    var this_lng = Number(this_list.attr("data-lng"));
                    var this_playtime = this_list.find(".time_num").html();
                    var this_tag_time = this_list.attr("data-time");
                    var this_img_src = this_list.find("img").attr("src");
                    var this_ranking = this_list.attr("data-ranking");
                    var period_time = this_list.attr("data-period_time")
                    var not_modifity = this_list.attr("data-not_modifity");
                    var business_hours = this_list.attr('data-business_hours');
                    var ticket_data = this_list.attr('data-ticket_data');
                    var addgo_obj = {};
                    
                    addgo_obj.this_name = go_name;
                    addgo_obj.this_lat = this_lat;
                    addgo_obj.this_lng = this_lng;
                    addgo_obj.this_img_src = this_img_src;
                    addgo_obj.this_playtime = this_playtime;//最新（游玩）的时间（展示）
                    addgo_obj.default_playtime = this_playtime;//数据库适玩时间（初始时间）
                    addgo_obj.this_tag_time = Number(this_tag_time);//计算的时间num
                    addgo_obj.this_floor_index = floor_index;
                    addgo_obj.this_type = this_type;
                    addgo_obj.ranking = this_ranking;
                    addgo_obj.period_time = period_time;
                    addgo_obj.not_modifity = not_modifity;
                    addgo_obj.js_sport_eat = 'spot';
                    addgo_obj.business_hours = business_hours;
                    addgo_obj.ticket_data = ticket_data;
                    addgo_obj.city_id = city_id;
                    //当前月可玩不可玩
                    addgo_obj.suit_season = this_list.find('.go_button').attr('data-suit_season');
                    addgo_arry.push(addgo_obj);
                    // this_citydata.addgo_arry = addgo_arry;//返回的时候
                    // console.log(addgo_arry);
                    templateObj.add_go_temFn(addgo_obj);
                    var marker_data = {
                        lat: this_lat,
                        lng: this_lng,
                        marker_url:floor_index,
                        name:go_name,
                        playTime:'适玩时长'+addgo_obj.this_playtime
                    }
                    mapObj.addgo_markerFn(marker_data);
                    //动画
                    initObj.addflyer(this_list, $(this));
                    
                    //添加元素的总时长
                    initObj.all_play_timeFn('add',addgo_obj.this_tag_time)
                };
    
            });
        },
        //删除景点
        del_spot_Fn:function(){
            $('.js_attractions_ul li.jsSport').find('.delete_icon').unbind('click').on('click',function(){
                var list = $(this).parents("li");
                var this_index = $('li.jsSport').index(list);
                var del_name = $(this).parents('li').find('._r .p1').html();
                $(".js_rlist_ul li").each(function (i, n) {
                    var list_name = $(n).find(".attractions_name").text();
                    if (del_name == list_name) {
                        $(".js_rlist_ul li").eq(i).removeClass("city_list_go").find(".go_button").removeClass("go_button_gray").html("我想去");
                    }
                })
                list.remove();
                addgo_arry.splice(this_index, 1);
                addgo_marker_array[this_index].setMap(null);
                addgo_marker_array.splice(this_index, 1);
                //移除自定义窗口
                $('#map').find('.popup-content').each(function(){
                    $(this).remove()
                });
                //删除元素的总时长
                var del_time = Number(list.attr('data-this_tag_time'))
                initObj.all_play_timeFn('sub',del_time)
            })
        },
        //添加美食
        add_eatFn:function(){
            $(".js_rlist_ul .eat").on("click", ".eat_go_button", function () {
                $(".visitors_eat").fadeOut();
                $(".f_prompt").hide();
                var this_city_daynum = _this_cityDay_num * 5;
                var eat_list = $(this).parents('.eat');
                var eat_name = eat_list.find('.attractions_name').html();
                var this_offset = $(this).offset();
                for (var i = 0; i < eat_name_arry.length; i++) {
                    var this_name = eat_name_arry[i].name;
                    if (this_name == eat_name) {
                        if (!$(this).hasClass("go_button_gray")) {
                            $(".same").css({
                                left: this_offset.left - 156,
                                top: this_offset.top - 14
                            }).stop(true, true).fadeIn().html("您已添加相同的饭店");
                            setTimeout(function () {
                                $(".same").fadeOut();
                            }, 800)
                            return
                        }
                    }
                };
                
                var add_eat_obj = {};
                if ($(this).hasClass("go_button_gray")) return
                $(this).addClass("go_button_gray").html("已添加").parents('.eat').addClass("city_list_go");
                var fen_data;
                if (eat_list.hasClass("fen_list")) {
                    if (eat_list.parents("li").hasClass("show_store_list")) {
                        var parents_index = eat_list.parents(".show_store_list").index()
                        fen_data = _floor_res.eat[parents_index].place[eat_list.index()].fen_store;
                    } else {
                        fen_data = _floor_res.local[eat_list.index()].fen_store;
                    }
                }
                add_eat_obj.fen_data = fen_data;//分店
                var this_lat = parseFloat(eat_list.attr("data-lat"));
                var this_lng = parseFloat(eat_list.attr("data-lng"));
                var eat_img = eat_list.find("img").attr('src');
                // console.log(eat_img)
                var meal_time = eat_list.find('.time_num').html();
                var tag_time = Number(eat_list.attr('data-tag_time'))
                // add_eat_obj.this_id = id;
                add_eat_obj.name = eat_name;
                add_eat_obj.lat = this_lat;
                add_eat_obj.lng = this_lng;
                add_eat_obj.dianpu_image = eat_img;
                add_eat_obj.meal_time = meal_time; //展示用餐时间(和计算后)
                add_eat_obj.tag_time = tag_time; //计算用餐时间
                add_eat_obj.per_capita = eat_list.attr("data-per_capita");
                add_eat_obj.js_sport_eat = 'eat';
                add_eat_obj.this_type = $('.r_top_tab_ul').find('.active').text();
                // console.log(getEat_data)
                var is_eatData;
                if ($('.r_top_tab_ul').find('.active').text() == '本土美食') {
                    is_eatData = _floor_res.local;
                } else {
                    var store_index = $(this).parents('.show_store_list').index();
                    is_eatData = _floor_res.eat[store_index].place
                }
                var this_eat_index = eat_list.index()
                var add_eatData = is_eatData[this_eat_index];
                // console.log(add_eatData)
                add_eat_obj.city_id = add_eatData.city_id;
                add_eat_obj.address = add_eatData.address;
                add_eat_obj.business_hours = add_eatData.business_hours;
                add_eat_obj.store_Introduction = add_eatData.store_Introduction;
                add_eat_obj.phone = add_eatData.phone;
                eat_name_arry.push(add_eat_obj);
                // console.log(eat_name_arry)
                // this_citydata.eat_name_arry = eat_name_arry;
                initObj.addflyer(eat_list, $(this));
                templateObj.add_eat_temFn(add_eat_obj);

                //添加元素的总时长
                initObj.all_play_timeFn('add',add_eat_obj.tag_time);
                   
               
            })
            
        },
        //美食删除
        del_eatFn:function(){
            $('.js_attractions_ul li.jsEat').find('.delete_icon').unbind('click').on('click',function(){
                var list = $(this).parents("li");
                var this_index = $('li.jsEat').index(list);
                var del_name = $(this).parents('li').find('._r .p1').html();
                $(".js_rlist_ul .eat").each(function (a, n) {
                    if ($(n).find(".attractions_name").text() == del_name) {
                        $(".js_rlist_ul .eat").eq(a).removeClass("city_list_go").find(".eat_go_button").removeClass("go_button_gray").html("我想去");
                    }
                });
                list.remove();
                eat_name_arry.splice(this_index, 1);
                //清空hover marker
                mapObj.del_hover_Marker();
                //移除自定义窗口
                $('#map').find('.popup-content').each(function(){
                    $(this).remove()
                });
                var del_time = Number(list.attr('data-this_tag_time'));
                //删除元素的总时长
                initObj.all_play_timeFn('sub',del_time)
            })
        },
        //添加我想去动画
        addflyer: function (list, $this,is_new) {
            // console.log(is_new)
            $(".u-flyer").eq(0).remove();
            var img_src = is_new?$(list).find("img.address_cover").attr("src"): list.find("img").attr("src");
            // console.log( $(list).html())
            var city_postion = $this.offset();
            var left = city_postion.left
            var top = city_postion.top;
            var end_postion = $(".js_endfly").eq(0).offset(),
                end_width = $(".js_endfly").width() / 2,
                end_height = $(".js_endfly").height() + 50;
                // console.log(img_src)
            var flyer = $('<img class="u-flyer" src=' + img_src + ' />')
            flyer.fly({
                start: {
                    left: left,
                    top: top
                },
                end: {
                    left: end_postion.left + end_width,
                    top: end_postion.top + end_height,
                    width: 0,
                    height: 0
                },
                speed: 1.4, //动画时间 
            });
        },
        //hover左边已添加的列表
        hover_left_ListFn:function(){
            //hover 景点
            $(".js_attractions_ul").find('.jsSport').unbind('hover').hover(function () {
                var lat = parseFloat($(this).attr("data-lat"));
                var lng = parseFloat($(this).attr("data-lng"));
                var this_name = $(this).find(".p1").html()
                var infoData = {
                    lat:lat,
                    lng:lng,
                    name:this_name,
                    playTime:'游玩时长'+$(this).find('.time_num').html()
                }
                //定义信息窗口
                mapObj.style_InfowindowFn(infoData, 'spot_hover')
            }, function () {
                $('#map').find('.popup-content').each(function(){
                    $(this).remove()
                })
            });
            //hover 美食
            $(".js_attractions_ul .jsEat").unbind('hover').hover(function () {
                var lat = parseFloat($(this).attr("data-lat"));
                var lng = parseFloat($(this).attr("data-lng"));
                var this_name = $(this).find('.p1').text()
                //  //定义信息窗口
                var infoData = {
                    lat:lat,
                    lng:lng,
                    name:this_name,
                    playTime:'推荐用餐'+$(this).find('.time_num').html()
                }
                mapObj.hoverMarker(3,{lat:lat,lng:lng},'eat');
                mapObj.style_InfowindowFn(infoData,"spot_hover")
            }, function () {
                //清空hover marker
                mapObj.del_hover_Marker();
                $('#map').find('.popup-content').each(function(){
                    $(this).remove()
                })
            });
            //hover 美食分店
            $(".js_attractions_ul .fen_list").unbind('hover').hover(function () {
                if ($(this).hasClass('fen_list')) {
                    var fen_index = $('.jsEat').index($(this))
                    var fen_data = eat_name_arry[fen_index].fen_data;
                    for (var i = 0; i < fen_data.length; i++) {
                        var this_name = fen_data[i].branch_name;
                        var lat = parseFloat(fen_data[i].latitude);
                        var lng = parseFloat(fen_data[i].longitude);
                        var infoData = {
                            lat:lat,
                            lng:lng,
                            name:this_name,
                            playTime:'推荐用餐'+$(this).find('.time_num').html()
                        }
                        mapObj.hoverMarker(3,{lat:lat,lng:lng},'eat');
                        mapObj.style_InfowindowFn(infoData,"spot_hover")
                    };
                }

            }, function () {
                //清空hover marker
                mapObj.del_hover_Marker();
                $('#map').find('.popup-content').each(function(){
                    $(this).remove()
                })
            });
            //hover 添加后 酒店
            $('.js_hotel_ul').find('li').unbind('hover').hover(function(){
                var this_index = $(this).attr('data-day_index');
                var data = addHotel_info_arr[this_index];
                mapObj.style_InfowindowFn(data, 'hotel_hover');
                
            },function(){
                //移除自定义窗口
                $('#map').find('.popup-content').each(function(){
                    $(this).remove()
                })
            });
        },
        //选完我想去对应的灰掉
        is_list_grayFn:function(){
            //我想去
            for (var s = 0; s < addgo_arry.length; s++) {
                var add_name = addgo_arry[s].this_name;
                $(".js_rlist_ul li:not(.eat)").each(function (i, n) {
                    var list_name = $(n).find(".attractions_name").text();
                    if (add_name == list_name) {
                        $(".js_rlist_ul li").eq(i).addClass("city_list_go").find(".go_button").addClass("go_button_gray").html("已添加");
                    }
                })
            };
            //必吃美食
            // console.log(eat_name_arry)
            if (eat_name_arry != undefined) {
                for (var i = 0; i < eat_name_arry.length; i++) {
                    var add_eatname = eat_name_arry[i].name;
                    $(".js_rlist_ul .eat").each(function (a, n) {
                        if ($(n).find(".attractions_name").text() == add_eatname) {
                            $(".js_rlist_ul .eat").eq(a).addClass("city_list_go").find(".eat_go_button").addClass("go_button_gray").html("已添加");
                        }
                    })
                };
            }
        },
        //计算游玩时间
        playtimeFn:function(){
            $('.js_attractions_ul').find('li').unbind('click').on('click','.play_t,.play_d',function(){
                var time_num = Number($(this).parents('li').attr('data-this_tag_time'));
                if($(this).hasClass('play_t')){
                    time_num = time_num <8 ? time_num += 0.5 :8;
                    //总时间
                    initObj.all_play_timeFn('add',0.5)
                }else{
                    time_num = time_num >0.5 ? time_num -= 0.5 :0.5;
                    //总时间
                    initObj.all_play_timeFn('sub',0.5)
                };
                var time_txt = time_num == 8? '1天' : time_num+'小时'

                var list = $(this).parents('li')
                list.find('.time_num').html(time_txt);
                list.attr('data-this_tag_time',time_num);
                
                var eat_index = $('li.jsEat').index(list);
                var spot_index = $('li.jsSport').index(list);
                if($(this).parents('li').hasClass('jsEat')){
                    eat_name_arry[eat_index].meal_time = time_txt;
                    eat_name_arry[eat_index].tag_time = time_num
                }else{
                    addgo_arry[spot_index].this_tag_time = time_num;
                    addgo_arry[spot_index].this_playtime = time_txt;
                }
               
                // console.log(addgo_arry)
            });
        },
        //计算所有添加元素的总时间
        all_play_timeFn:function(is_add_sub,time_num){
            // addAll_time 添加的游玩时间； allHours 当前天数总时长小时
            //添加元素的总时长 
            if(is_add_sub == 'add'){
                addAll_time += time_num;
            }else{
                addAll_time -= time_num;
            };
            var city_Dnum = _this_cityDay_num == 0 ? 1 : _this_cityDay_num;
            var comfortable = city_Dnum * 10 //舒适
            var difficult = city_Dnum * 13 //困难
            var Pbar_c;
            if (addAll_time <= comfortable) {
                // addClass("color_red");
                $(".js_dengji").html("舒适")
                Pbar_c = 1
            } else if (addAll_time > comfortable && addAll_time <= difficult) {
                $(".js_dengji").html("困难");
                Pbar_c = 2
            } else {
                $(".js_dengji").html("极限")
                Pbar_c = 3
            }
            var bar_Pro = addAll_time / allHours * 100;
            Progressbar(bar_Pro,Pbar_c);
            // console.log(addAll_time)
          
        },
        //下一步
        next_stepFn:function(){
            $(".f_main_next").on("click", function () {

                var z_day_Time = 0 //进度条 白景 总时间 18点之前(包含18点)
                var z_night_Time = 0 //进度条 白景 总时间 18点之后
                for (var i = 0; i < _Daydate_arr.length; i++) {
                    var time1 = Number(_Daydate_arr[i].time1);
                    var time2 = Number(_Daydate_arr[i].time2)
                    var day_Time_item; //进度条白天的时间
                    var night_Time_item; //进度条白天的时间
                    if (time2 >= 1080) {
                        day_Time_item = ((1080 - time1) / 60) <= 0 ? 0 : (1080 - time1) / 60;
                    } else {
                        day_Time_item = ((time2 - time1) / 60) <= 0 ? 0 : (time2 - time1) / 60;
                    };
                    if(time1 >= 1080){
                        night_Time_item = ((time2 - time1) / 60) <= 0 ? 0 : (time2 - time1) / 60;
                    }else{
                        night_Time_item = ((time2 - 1080) / 60) <= 0 ? 0 : (time2 - 1080) / 60;
                    }
                    z_day_Time += day_Time_item
                    z_night_Time += night_Time_item
                    // console.log(z_night_Time)
                }
                // console.log('总时间的白景'+z_day_Time)
                // console.log('总时间的夜景'+z_night_Time)

                var list_dayTime = 0 //白景
                var list_nightTime = 0 //夜景
                var list_allTime = 0 //全景
                $('.js_attractions_ul').find('li').each(function () {
                    var isTypeTime = $(this).attr('data-period_time');
                    var tag_time = Number($(this).attr('data-this_tag_time'))
                    switch (isTypeTime) {
                        case '':
                            list_allTime += tag_time + 0
                            break;
                        case 'allday':
                            list_allTime += tag_time + 0
                            break;
                        case 'day':
                            list_dayTime += tag_time + 0
                            break;
                        case 'night':
                            list_nightTime += tag_time + 0
                            break;
                    }
                })
                var city_Dnum = _this_cityDay_num == 0 ? 1 : _this_cityDay_num;
                var beyondTime = city_Dnum * 50 //每天不能超出50个小时
                // console.log('添加游玩的总时间------'+addAll_time)
                // console.log('超出的时间------'+beyondTime)
                var ts_str = ''
                if (addAll_time <= beyondTime) {
                    if (list_nightTime > 0) { //选夜景了
                        // console.log(z_night_Time)
                        if (list_nightTime > z_night_Time && list_dayTime > z_day_Time) {
                            $('.prompt_c').show()
                            ts_str = '选择 白景和夜景 超出'
                        } else if (list_nightTime > z_night_Time) {
                            $('.prompt_c').show()
                            ts_str = '选择 夜景 超出';
                        } else if (list_dayTime > z_day_Time) {
                            $('.prompt_c').show()
                            ts_str = '所选景点时间较长，当心白天时间不够用哦！'
                        } else {
                            initObj.next_postFn()
                        }
                    } else { //没选夜景
                        if (list_dayTime > z_day_Time) {
                            $('.prompt_c').show()
                            ts_str = '所选景点时间较长，当心白天时间不够用哦！'
                        } else {
                            initObj.next_postFn()
                        }
                    };
                    $('.cancel_prompt_text').html(ts_str)

                } else {
                    $('.prompt_b').show()
                    ts_str = '选择 白景和夜景 超出（景点超出）请适当删除'
                    $('.prompt_text').html(ts_str)
                }
                //确定
                $('.prompt_det').click(function () {
                    initObj.next_postFn()
                });
                //取消
                $(".prompt_cancel,.prompt_but").on("click", function () {
                    $(".prompt").fadeOut();
                });
            })
        },
        next_postFn:function(){
            var post_data = {},city_spotData={};
            //获取跨城
            var across_cityObj = {}
            if($('.slider_box').find('div').hasClass('next_slider_list')){
                acrossCity_objFn();
                post_data.next_city_day0 = 'false'
            }else{
                if(_trc_res.next_city_day0 == 'false'){
                    if(next_city_day0 ==0){
                        across_cityObj = "false"
                        post_data.next_city_day0 = 'false'
                    }else{
                        acrossCity_objFn();
                        post_data.next_city_day0 = 'true';
                    }
                }else{
                    if(_trc_res.go_city_array[Number(this_city_index+1)]){
                        var next_city_dayNum =Number(_trc_res.go_city_array[Number(this_city_index+1)].city_daynum)
                        //判断下个城市是否0天
                        if(next_city_dayNum == 0){
                            acrossCity_objFn();
                            post_data.next_city_day0 = 'true'
                        }else{
                            across_cityObj = "false"
                            post_data.next_city_day0 = 'false'
                        }
                    }else{
                        across_cityObj = "false"
                        post_data.next_city_day0 = 'false'
                    };
                }
            }
            //跨城对象
            function acrossCity_objFn (){
                across_cityObj.date = _Daydate_arr[_Daydate_arr.length-1].date//04.23
                across_cityObj.hotel_day = _Daydate_arr[_Daydate_arr.length-1].hotel_day//D3
                across_cityObj.month_day = _Daydate_arr[_Daydate_arr.length-1].month_day//4月23
                across_cityObj.of_date = _Daydate_arr[_Daydate_arr.length-1].of_date//2019-04-23
                var next_city_li = $('.slider_box').find('.next_slider_list');
                //0天城市的时间区间
                var across_cityVal;
                if(_trc_res.next_city_day0 == 'false'){
                    across_cityVal = next_city_day0 ==0?next_city_li.find('input').val():lastDay0_time2+";"+Number(lastDay0_time2+120)
                }else{//当前城市是0天的城市
                    var minutes0 = 2*60; //1个0小时城市。每个城市2小时
                    var last_time2 = Number(_Daydate_arr[_Daydate_arr.length-1].time2);
                    var nextDay0_time2 = last_time2 + minutes0
                    across_cityVal = last_time2+";"+nextDay0_time2
                }
                
                var timeArr = across_cityVal.split(';');
                across_cityObj.time1 = timeArr[0];
                across_cityObj.time2 = timeArr[1];
                var time1 = Number(timeArr[0]);
                var time2 = Number(timeArr[1]);
                var betw_time1Arr = (time1/60).toString().split('.');
                var betw_time1 = betw_time1Arr[1]?betw_time1Arr[0]+":30":betw_time1Arr[0]+":00";
                var betw_time2Arr = (time2/60).toString().split('.');
                var betw_time2 = betw_time2Arr[1]?betw_time2Arr[0]+":30":betw_time2Arr[0]+":00";
                across_cityObj.betw_time = betw_time1+'-'+betw_time2;
            };
            //更新添加的当前城市的数据(日期，天数..)
            _trc_res.go_city_array[this_city_index].city_date2 = _Daydate_arr[_Daydate_arr.length-1].of_date;
            _trc_res.go_city_array[this_city_index].city_d_2 = Number(_Daydate_arr[_Daydate_arr.length-1].hotel_day);
            _trc_res.go_city_array[this_city_index].city_daynum = _this_cityDay_num.toString();


            city_spotData.addgo_arry = addgo_arry; //景点
            city_spotData.eat_name_arry = eat_name_arry; //美食
            city_spotData.shop_len = $(".js_attractions_ul .jsShop").length
            city_spotData.spot_len = $(".js_attractions_ul .jsSport").length - city_spotData.shop_len;
            city_spotData.eat_len = eat_name_arry.length;
            city_spotData.this_city = _city_name;
            city_spotData.this_cityid = city_id;
            city_spotData.this_city_index = this_city_index;
            city_spotData.this_city_lat = _this_city_data.lat;
            city_spotData.this_city_lng = _this_city_data.lng;
            city_spotData.this_cityDayNum = $('.city_day_num').html();
            //表单
            post_data.adult = $('.wap2_adult_num').html()//成人人数
            post_data.children = $('.wap2_childrent_num').html()//儿童人数
            post_data.title = $('#trc_title').val().trim().replace(/\s/g,""); //行程标题
            post_data.date = $('.madeTravel #wap3_date').val();// 出发日期
            post_data.cover =  $('.upload_box .bgImg').attr('src')//封面
            post_data.day_num = _allDay_num //行程总天数

            post_data.cityArray = _trc_res.cityArray;//城市数组
            post_data.dayTime = _Daydate_arr; //每天日期酒店
            post_data.return_city = _trc_res.return_city
            post_data.departure_city = _trc_res.departure_city;
            post_data.go_city_array = _trc_res.go_city_array;
            post_data.spot_data = city_spotData; //选择的该城市的元素
            post_data.across_city = across_cityObj;//跨城
            
            // console.log(post_data)
            $.ajax({
                url: "optimize_line",
                type: "post",
                dataType: "JSON",
                contentType: "application/json;charset=utf-8",
                data: JSON.stringify(post_data),
                success: function (data) {
                    if(!data.status) return
                    // console.log(data)
                    window.location.href = "/portal/scenerymap/attractionsArrange.html";
                }
            })
        }
        
    };
    var mapObj = {
        //加载谷歌地图
        initMap: function () {
            var lat = Number(_this_city_data.lat)
            var lng = Number(_this_city_data.lng)
            map = new google.maps.Map(document.getElementById('map'), {
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
        //城市边界线高亮
        cityOptionsPathFn:function(){
            var provinceNames = _this_city_data.provinceNames;
            var data_type ;
            if(provinceNames == '北京'||provinceNames == '上海'||provinceNames == '天津'||provinceNames == '重庆'){
                data_type = 1
            }else if(provinceNames == '香港'||provinceNames == '澳门'||provinceNames == '台湾'){
                data_type = 2
            }else{
                data_type = 0
            }
            var sfen_zxsData 
            if(data_type == 0){
                sfen_zxsData = cityData.provinces
            }else if(data_type = 2){
                sfen_zxsData = cityData.other
            }else{
                sfen_zxsData = cityData.municipalities
            }
            
            var this_proIndex = getArrIndex(sfen_zxsData, {
                n: provinceNames
            });
            // console.log(sfen_zxsData)
            var city_dataArr 
            if(data_type == 0){
                city_dataArr = sfen_zxsData[this_proIndex].cities
            }else if(data_type = 2){
                city_dataArr = sfen_zxsData
            }else{
                city_dataArr = sfen_zxsData
            }
            var cityMapIndex = getArrIndex(city_dataArr, {
                n: _city_name
            });
            var getZoom = city_dataArr[cityMapIndex].z?city_dataArr[cityMapIndex].z:9
            map.setZoom(getZoom)
            var city_paths = city_dataArr[cityMapIndex].b;
            var city_polygon = new google.maps.Polygon();
            city_polygon.setOptions(polyOptions);
            var paths = mapPaths(city_paths)
            city_polygon.setPaths(paths);
            city_polygon.setMap(map);
        },
        //鼠标放在列表上显示marker
        hoverMarker:function(marker_url,location,type){
            if(!type && hover_Marker){
                hover_Marker.setMap(null)
            };
            hover_Marker = new google.maps.Marker({
                position: location,
                icon: "/static/v1/img/map/mark" + marker_url + ".png",
                map: map
            });
            if(type){
                h_MarkerArr.push(hover_Marker)
            };
        },
        //清空hover marker
        del_hover_Marker:function(){
            hover_Marker.setMap(null)
            for(var i = 0;i<h_MarkerArr.length;i++){
                h_MarkerArr[i].setMap(null)
            }
            h_MarkerArr = []
        },
        //添加景点marker
        addgo_markerFn:function(data){
            var addgo_Marker = new google.maps.Marker({
                position: {lat:data.lat,lng:data.lng},
                icon: "/static/v1/img/map/mark" + data.marker_url + ".png",
                map: map
            });
            addgo_marker_array.push(addgo_Marker);
            // console.log(addgo_marker_array)
            //鼠标放上去
            google.maps.event.addListener(addgo_Marker, "mouseover",
                function () {
                    mapObj.style_InfowindowFn(data, 'spot_hover')
                });
            google.maps.event.addListener(addgo_Marker, "mouseout",
                function () {
                    $('#map').find('.popup-content').each(function(){
                        $(this).remove()
                    })
                });
        },
        //添加自定义信息窗口
        style_InfowindowFn: function (data, is_type) {
            var str, yPx = 45,infoID;
            if(is_type == "spot_hover"){
                infoID = 'content'
                str = '<div id='+infoID+'>\
                        <div class="info_name">'+data.name+'</div>'
                        if(data.playTime){
                            str +='<div class="info_time">'+data.playTime+'</div>'
                        }else{
                            yPx = 30
                        }
                    str +='</div>';
            }else{
                infoID = 'content'
                var is_hover_hotel = data.is_hover_hotel?'dis_none':''
                str = '<div id='+infoID+' class="hotel_info">\
                        <div class="info_name" onclick="hotel_Map_detai('+data.index+')">'+data.name+'</div>'
                if(data.Category ){
                    str +='<div class="info_type">'+data.Category+'</div>\
                    <div class="info_type1"><span class="info_Score">'+data.Score+'</span>'+data.comm+'<span class="info_line">|</span>'+data.LowRate+'</div>'
                }else{
                    str +=' <div class="info_type1">'+data.LowRate+'</div>'
                }
                        str +='<i class="addMapIcon'+is_hover_hotel+'" onclick="addhotelFn('+data.index+');"></i>\
                    </div>';
            }
            //移除自定义窗口
            $('#map').find('.popup-content').each(function(){
                $(this).remove()
            })
            //自定义窗口样式init
            Popup = createPopupClass(infoID,yPx);
            //自定义信息窗口 
            $("#map").append(str);
            var is_id_Classs = data.Class_name == "infoClass" ? document.getElementsByClassName(infoID)[data.index] : document.getElementById(infoID)
            // console.log(is_id_Classs)
            popup = new Popup(new google.maps.LatLng(data.lat, data.lng), is_id_Classs);
            popup.setMap(map);
        },
        //高德地图搜索POI点
        lbsAmapFn:function (search_txt,type) {
            //高德地图
            lbsmap = new AMap.Map('container', {
                zoom: 10,
            });
            lbsmarker = new AMap.Marker();
            lbsinfoWindow = new AMap.InfoWindow({
                isCustom: true,  //使用自定义窗体
                offset: new AMap.Pixel(0, -40)
            });
            
            $('.add_address_img').find('span').html("上传封面");
            $('.address_cover').attr('src','')
            $('.retrieval_popup_box').show().find('input').val("");//新增弹框显示
            $('.retrieval_middle').removeAttr("data-address_lat").removeAttr("data-address_lng");
            if(type == 'is_spot'){
                $('.retrieval_middle').removeAttr("data-address");
                $('.spot_input_name').show();
                $('.hotel_inputBox').hide();
                $('.ret_TopDiv1').html('新增景点')
            }else{
                $('.spot_input_name').hide();
                $('.hotel_inputBox').show()
                $('.ret_TopDiv1').html('新增酒店')
                $(".input_date").val(_Daydate_arr[0].of_date)
                $('.input_date').datepicker({
                    minDate: 0,
                    dateFormat: "yy-mm-dd"
                });
            };
            lbsmap.remove(lbsmarker); //清除标记点
            // lbsinfoWindow.open(null);
            lbsinfoWindow.close() //清除信息框

            var city_lat = Number(_this_city_data.lat);
            var city_lng = Number(_this_city_data.lng);
            lbsmap.setCenter([city_lng,city_lat]); //设置地图中心点
            geocoder = new AMap.Geocoder();
            geocoder.getAddress([city_lng,city_lat], function(status, result) {
                if (status === 'complete'&&result.regeocode) {
                    // console.log(result)
                    // lbsMap_city_name = result.regeocode.addressComponent.city
                    // var address = result.regeocode.formattedAddress;
                    // document.getElementById('address').value = address;
                    AMapUI.loadUI(['misc/PoiPicker'], function (PoiPicker) {
                        var poiPicker = new PoiPicker({
                            city:result.regeocode.addressComponent.city == ""?_city_name:result.regeocode.addressComponent.city,
                            citylimit:true,
                            input: 'pickerInput',
                            autocompleteOptions:{
                                citylimit:true
                            },
                            // suggestContainer:"poiSugges",
                            suggestContainer:"poiInfo",
                            // searchResultsContainer:"poiInfo"
                        });
                        //初始化poiPicker
                        poiPickerReady(poiPicker);
                        
                    });
                }
            });
        
            function poiPickerReady(poiPicker) {
                // console.log(poiPicker)
                window.poiPicker = poiPicker;
                
                //选取了某个POI
                poiPicker.on('poiPicked', function (poiResult) {
                    // console.log(poiResult)
                    var source = poiResult.source
                    var poi = poiResult.item

                    var address =  poi.address.length == 0?poi.district:poi.address
                    if (poi.location) {
                        // console.log(poi.address)
                        var info = {
                            source: source,
                            id: poi.id,
                            name: poi.name,
                            location: poi.location.toString(),
                            address:address
                        };
                        if(poi.cityname){
                            if( poi.cityname != _city_name+'市' || !poi.district && !poi.address){
                                layer.msg("请输详细的信息", {
                                    time: 800,
                                    offset: '300px'
                                });
                                return
                            }
                        }else{
                            if(!poi.district && !poi.address){
                                layer.msg("请输详细的信息", {
                                    time: 800,
                                    offset: '300px'
                                });
                                return
                            }
                        }
                        
                        // lbsmap.setCenter([poi.location.lng,poi.location.lat]);
                        // console.log( lbsmap )
                        lbsmarker.setMap(lbsmap);
                        lbsinfoWindow.setMap(lbsmap);
                    
                        lbsmarker.setPosition(poi.location);
                        lbsinfoWindow.setPosition(poi.location);

                        var input_address = poi.district?poi.district+poi.address:poi.cityname+poi.address;
                        if(type == 'is_spot'){
                            $('.retrieval_middle').attr("data-address",input_address)
                            $('.spot_input_name').val(poi.name)
                        }else{
                            $('.retrieval_middle').attr("data-address_lat",poi.location.lat).attr("data-address_lng",poi.location.lng)
                            $('.hotel_input_address').val(input_address)
                            $('.hotel_input_name').val(poi.name)
                        }
                        $('.retrieval_middle').attr("data-address_lat",poi.location.lat).attr("data-address_lng",poi.location.lng)
                        //JSON.stringify(info, null, 2)使用2个空格缩进
                        // infoWindow.setContent('POI信息: <pre>' + JSON.stringify(info, null, 2) + '</pre>');
                        var lbsMap_str = "<div class='lbsMap_txt'>名字：<span class='add_newName'>" + info.name + "</span><br>地址：<span class='add_newAddress'>" + input_address + "</span></div>";
                        lbsinfoWindow.setContent(lbsMap_str);
                        lbsinfoWindow.open(lbsmap, lbsmarker.getPosition());
                        lbsmap.setCenter(lbsmarker.getPosition());
                        
                    } else {
                        layer.msg("请输入详细的信息", {
                            time: 800,
                            offset: '300px'
                        });
                    }
                    
                });
                poiPicker.onCityReady(function () {
                    // console.log(111)
                    // console.log(search_txt)
                    // console.log($("#pickerInput").val())
                    // poiPicker.suggest("美味");
                    poiPicker.searchByKeyword(search_txt)
                    // poiPicker.searchByKeyword($("#pickerInput").val())
                    poiPicker.suggest(search_txt); //
                    
                });
            };
            if(type == 'is_spot'){
                //保存新增景点地点
                initObj.add_address_saveFn();
            }else{
                initObj.add_new_hotleFn()
            }
           
        },
        //谷歌地图缩放和平移后事件
        map_idleFn:function(){
            google.maps.event.addListener(map,"idle",function(event){
                var floor_index = $('.floor_box').find('.active').index();
                if(floor_index != 5 ) return
                var mapLatLngBounds = map.getBounds();
                var mapLatLngBounds = map.getBounds()
                var centerLat = map.getCenter().lat();
                var centerLng = map.getCenter().lng();
                var maxX = mapLatLngBounds.getNorthEast().lng();
                var maxY = mapLatLngBounds.getNorthEast().lat();
                var minX = mapLatLngBounds.getSouthWest().lng();
                var minY = mapLatLngBounds.getSouthWest().lat();
                //计算直径距离。后台根据中心点计算 半径 范围的数据
                var rad = parseInt(GetDistance (maxY, maxX, minY, maxX)/2*1000); 
                //向后台传入 地图 中心点 和页面可视地图的直径
                bounds={'Longitude':centerLng,'Latitude':centerLat,'Radius':rad};
                debouncelimitHotel();  //地图改变大小 函数防抖
            })
        },
        //展示酒店默认灰色marker
        hotel_markerFn:function(data){
            //酒店二次加载会有重合已选酒店合未选酒店(灰色和蓝色)
            var hotel_Marker = new google.maps.Marker({
                position: {lat:data.lat,lng:data.lng},
                icon: "/static/v1/img/map/hotel1.png",
                map: map
            });
            hotel_markArr.push(hotel_Marker);
            //鼠标放上去
            google.maps.event.addListener(hotel_Marker, "mouseover",
                function () {
                    mapObj.style_InfowindowFn(data, 'hotel_hover');
                    hotel_Marker.setIcon('/static/v1/img/map/hotel2.png')
                    
                });
            google.maps.event.addListener(hotel_Marker, "mouseout",
                function () {
                    for(var i = 0;i<_Daydate_arr.length;i++){
                        if(_Daydate_arr[i].hotel){
                            if(_Daydate_arr[i].hotel.hotel_name == data.name){
                                hotel_Marker.setIcon('/static/v1/img/map/hotel2.png')
                                // console.log(111)
                            }else{
                                hotel_Marker.setIcon('/static/v1/img/map/hotel1.png')
                            }
                        }else{
                            hotel_Marker.setIcon('/static/v1/img/map/hotel1.png')
                        }
                    }
                   
                });
            
            
        },
        //清空酒店灰色marker
        del_hotle_markerFn:function(){
            for(var i = 0;i<hotel_markArr.length;i++){
                hotel_markArr[i].setMap(null)
            };
            hotel_markArr = []
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
                    mapObj.style_InfowindowFn(data, 'hotel_hover');
                   
                });
            google.maps.event.addListener(hotel_Marker, "mouseout",
                function () {
                    //移除自定义窗口
                    $('#map').find('.popup-content').each(function(){
                        $(this).remove()
                    })
                });
            
        },
        //当前城市站点marker
        traffic_markerFn:function(data){
            var trc_Marker = new google.maps.Marker({
                position: {lat:data.lat,lng:data.lng},
                icon: "/static/v1/img/map/" + data.marker_url + ".png",
                map: map
            });
            //鼠标放上去
            google.maps.event.addListener(trc_Marker, "mouseover",
                function () {
                    mapObj.style_InfowindowFn(data, 'spot_hover')
                });
            google.maps.event.addListener(trc_Marker, "mouseout",
                function () {
                    $('#map').find('.popup-content').each(function(){
                        $(this).remove()
                    })
                });
        }
    };
    var templateObj = {
        //楼层类型切换
        list_tab_temFn:function(){
            var list_tab_tem = '{{each tab as value i}}\
                                            {{if i == 0}}\
                                            <li class="active" data-type="{{value.them}}">{{value.type}}</li>\
                                            {{else}}\
                                            <li data-type="{{value.them}}">{{value.type}}</li>\
                                            {{/if}}\
                                        {{/each}}';
            var list_tab_render = template.compile(list_tab_tem);
            var list_tab_html = list_tab_render(_floor_res);
            $(".r_top_tab_ul").html(list_tab_html);
        },
        //城市名字渲染
        topCity_temFn:function(){
            var city_name_tem = '<li>'+go_city_name+'<i class="li_ico"></i></li>\
                    {{each cityArray as value i}}\
                        {{if i == '+this_city_index+'}}\
                        <li class="active" >{{value}}<i class="li_ico"></i></li>\
                        {{else}}\
                        <li>{{value}}<i class="li_ico"></i></li>\
                        {{/if}}\
                    {{/each}}<li>'+return_city_name+'<i class="li_ico"></i></li>';
            var city_name_render = template.compile(city_name_tem);
            var city_name_html = city_name_render(_trc_res);
            $(".city_name_ul").html(city_name_html);
        },
        //渲染每楼的数据
        floor_list_temFn: function (type) {
            // console.log(type)
            // console.log(data)
            var f1_f3_list_tem = '{{each ' + type + ' as value i}}\
                                        <li class="list hov_list clearfix" data-time="{{value.tag_time}}" data-lat="{{value.latitude}}" data-lng="{{value.longitude}}"  data-ranking="{{value.ranking}}"  data-not_modifity="{{value.not_modifity}}" data-period_time="{{value.period_time}}" data-business_hours="{{value.business_hours}}" data-ticket_data="{{value.ticket_data}}">\
                                            <div class="list_l fl">\
                                                <img src="{{value.cover_url}}" alt="" >\
                                            </div>\
                                            <div class="list_r fl">\
                                                <div class="text">\
                                                    <p class="css_r_name"><span class="attractions_name">{{value.spot_name}}</span></p>\
                                                    <p class="time_distance"><span class="jsPlay">适玩时长</span>：<span class="time_num">{{value.play_time}}</span></p>\
                                                    <p class="introduce">点击查看介绍</p>\
                                                </div>\
                                                <div class="num">Top{{value.ranking}}</div>\
                                                <div class="go_button js_go_button" data-suit_season="{{value.suit_season}}">我想去</div>\
                                            </div>\
                                        </li>\
                                    {{/each}}';
            var f4_eat_tem = '{{each eat as value i}}\
                                <li class="show_store_list">\
                                    <div class="shoops clearfix">\
                                        <div class="store_list_l fl">\
                                            <img src="{{value.goods_url}}" alt="" >\
                                        </div>\
                                        <div class="list_r fl">\
                                            <div class="text">\
                                                <p class="css_r_name">\
                                                    <span class="attractions_name">{{value.name}}</span>\
                                                </p>\
                                                <p class="time_distance local_introduce" title="{{value.recom_sites}}">推荐地点：<span>{{value.recom_sites}}</span></p>\
                                                <p class="store_introduce">点击查看介绍</p>\
                                            </div>\
                                        </div>\
                                        <div class="go_button js_show_shop">展开店铺</div>\
                                    </div>\
                                    <div class="f5_store dis_none">\
                                        <ul>\
                                            {{each value.place as v s}}\
                                                {{if v.store_type == 1}}\
                                                    <li class="list fen_list eat hov_list clearfix"  data-lat="{{v.latitude}}" data-lng="{{v.longitude}}"  data-per_capita="{{v.per_capita}}" data-tag_time="{{v.tag_time}}">\
                                                        <div class="list_l fl">\
                                                            <img src="{{v.dianpu_image}}" alt="">\
                                                        </div>\
                                                        <div class="list_r fl">\
                                                            <div class="text">\
                                                                <p class="css_r_name"><span class="attractions_name">{{v.store_name}}</span></p>\
                                                                <p class="time_distance"><span class="jsPlay">推荐用餐</span>：<span class="time_num">{{v.meal_time}}</span></p>\
                                                                <p class="introduce">点击查看介绍</p>\
                                                            </div>\
                                                            <div class="num"></div>\
                                                            <div class="go_button eat_go_button" >我想去</div>\
                                                        </div>\
                                                        <div class="line"></div>\
                                                    </li>\
                                                {{else}}\
                                                    <li class="list eat hov_list clearfix"  data-lat="{{v.latitude}}" data-lng="{{v.longitude}}" data-per_capita="{{v.per_capita}}" data-tag_time="{{v.tag_time}}">\
                                                        <div class="list_l fl">\
                                                            <img src="{{v.dianpu_image}}"  alt="">\
                                                        </div>\
                                                        <div class="list_r fl">\
                                                            <div class="text">\
                                                                <p class="css_r_name"><span class="attractions_name">{{v.store_name}}</span></p>\
                                                                <p class="time_distance"><span class="jsPlay">推荐用餐</span>：<span class="time_num">{{v.meal_time}}</span></p>\
                                                                <p class="introduce">点击查看介绍</p>\
                                                            </div>\
                                                            <div class="num"></div>\
                                                            <div class="go_button eat_go_button" >我想去</div>\
                                                        </div>\
                                                        <div class="line"></div>\
                                                    </li>\
                                                {{/if}}\
                                            {{/each}}\
                                        </ul>\
                                    </div>\
                                </li>\
                            {{/each}}';
            var f4_local_tem = '{{each local as value i}}\
                                    {{if value.store_type == 1}}\
                                        <li class="list fen_list eat hov_list clearfix"  data-lat="{{value.latitude}}" data-lng="{{value.longitude}}"  data-per_capita="{{value.per_capita}}" data-tag_time="{{value.tag_time}}">\
                                            <div class="list_l fl">\
                                                <img  src="{{value.url}}" alt="">\
                                            </div>\
                                            <div class="list_r fl">\
                                                <div class="text">\
                                                    <p class="css_r_name"><span class="attractions_name">{{value.store_name}}</span></p>\
                                                    <p class="time_distance"><span class="jsPlay">推荐用餐</span>：<span class="time_num">{{value.meal_time}}</span></p>\
                                                    <p class="introduce">点击查看介绍</p>\
                                                </div>\
                                                <div class="num"></div>\
                                                <div class="go_button eat_go_button" >我想去</div>\
                                            </div>\
                                        </li>\
                                    {{else}}\
                                        <li class="list eat hov_list clearfix"  data-lat="{{value.latitude}}" data-lng="{{value.longitude}}"  data-per_capita="{{value.per_capita}}" data-tag_time="{{value.tag_time}}">\
                                            <div class="list_l fl">\
                                                <img  src="{{value.url}}"  alt="">\
                                            </div>\
                                            <div class="list_r fl">\
                                                <div class="text">\
                                                    <p class="css_r_name"><span class="attractions_name">{{value.store_name}}</span></p>\
                                                    <p class="time_distance"><span class="jsPlay">推荐用餐</span>：<span class="time_num">{{value.meal_time}}</span></p>\
                                                    <p class="introduce">点击查看介绍</p>\
                                                </div>\
                                                <div class="num"></div>\
                                                <div class="go_button eat_go_button" >我想去</div>\
                                            </div>\
                                        </li>\
                                    {{/if}}\
                                {{/each}}';
            var f4_street_tem = '{{each street as value i}}\
                                    <li class="list hov_list clearfix" data-time = "{{value.tag_time}}" data-lat="{{value.latitude}}" data-lng="{{value.longitude}}" data-business_hours="{{value.business_hours}}" data-not_modifity="{{value.not_modifity}}" data-period_time="{{value.period_time}}" data-ticket_data="{{value.ticket_data}}">\
                                        <div class="list_l fl">\
                                            <img src="{{value.url}}" alt="">\
                                        </div>\
                                        <div class="list_r fl">\
                                            <div class="text">\
                                                <p class="css_r_name"><span class="attractions_name">{{value.store_name}}</span></p>\
                                                <p class="time_distance"><span class="jsPlay">适玩时长</span>：<span class="time_num">{{value.suit_time}}</span></p>\
                                                <p class="introduce">点击查看介绍</p>\
                                            </div>\
                                            <div class="num"></div>\
                                            <div class="go_button js_go_button" >我想去</div>\
                                        </div>\
                                    </li>\
                                {{/each}}';
            var f5_local_product = '{{each ' + type + ' as value i}}\
                                        <li class="show_store_list">\
                                            <div class="shoops clearfix">\
                                                <div class="store_list_l fl">\
                                                    <img src="{{value.goods_url}}" alt="">\
                                                </div>\
                                                <div class="list_r fl">\
                                                    <div class="text">\
                                                        <p class="css_r_name">\
                                                            <span class="attractions_name">{{value.name}}</span>\
                                                        </p>\
                                                        <p class="time_distance local_introduce" title="{{value.recom_sites}}">推荐地点：<span>{{value.recom_sites}}</span></p>\
                                                        <p class="store_introduce">点击查看介绍</p>\
                                                    </div>\
                                                </div>\
                                                <div class="go_button js_show_shop">展开店铺</div>\
                                            </div>\
                                            <div class="f5_store dis_none">\
                                                <ul>\
                                                    {{each value.place as v s}}\
                                                        <li class="list hov_list clearfix" data-time = "{{v.tag_time}}" data-lat="{{v.latitude}}"data-lng="{{v.longitude}}" data-business_hours="{{v.business_hours}}" data-not_modifity="{{v.not_modifity}}" data-period_time="{{v.period_time}}" data-ticket_data="{{v.ticket_data}}">\
                                                            <div class="list_l fl">\
                                                                <img src="{{v.dianpu_image}}" alt="">\
                                                            </div>\
                                                            <div class="list_r fl">\
                                                                <div class="text">\
                                                                    <p class="css_r_name"><span class="attractions_name">{{v.store_name}}</span></p>\
                                                                    <p class="time_distance"><span class="jsPlay">适玩时长</span>：<span class="time_num">{{v.shopping_time}}</span></p>\
                                                                    <p class="introduce">点击查看介绍</p>\
                                                                </div>\
                                                                <div class="num"></div>\
                                                                <div class="go_button js_go_button" >我想去</div>\
                                                            </div>\
                                                            <div class="line"></div>\
                                                        </li>\
                                                    {{/each}}\
                                                </ul>\
                                            </div>\
                                        </li>\
                                    {{/each}}';
            var f5_tab2_3 = '{{each ' + type + ' as value i}}\
                                <li class="list hov_list clearfix" data-time = "{{value.tag_time}}" data-lat="{{value.latitude}}" data-lng="{{value.longitude}}" data-business_hours="{{value.business_hours}}" data-not_modifity="{{value.not_modifity}}" data-period_time="{{value.period_time}}" data-ticket_data="{{value.ticket_data}}">\
                                    <div class="list_l fl">\
                                        <img src="{{value.img_url}}"  alt="">\
                                    </div>\
                                    <div class="list_r fl">\
                                        <div class="text">\
                                            <p class="css_r_name"><span class="attractions_name">{{value.shopping_name}}</span></p>\
                                            <p class="time_distance"><span class="jsPlay">适玩时长</span>：<span class="time_num">{{value.shopping_time}}</span></p>\
                                            <p class="introduce">点击查看介绍</p>\
                                        </div>\
                                        <div class="num"></div>\
                                        <div class="go_button js_go_button" >我想去</div>\
                                    </div>\
                                </li>\
                            {{/each}}';

            var floor_list_render;
            if (type == "eat") {
                floor_list_render = template.compile(f4_eat_tem);
            } else if (type == "local") {
                floor_list_render = template.compile(f4_local_tem); //本土美食
            } else if (type == "street") {
                floor_list_render = template.compile(f4_street_tem); //美食街区
            } else if (type == "localProduct") {
                floor_list_render = template.compile(f5_local_product);
            } else if (type == "productShops" || type == "businessCircle") {
                floor_list_render = template.compile(f5_tab2_3);
            } else {
                floor_list_render = template.compile(f1_f3_list_tem);
            }
            var floor_list_html = floor_list_render(_floor_res);
            $(".js_rlist_ul").html(floor_list_html);
            //hover列表
            initObj.hoverListFn();
            //展开店铺
            initObj.click_shopFn();
            //hover分店
            if(type == 'eat'||type=='local'){
                initObj.hoverFenListFn(type);
            }
            //详情展示
            initObj.detail_showFn('.spot_con_rig .list','.introduce,.list_l')
            //添加我想去的景点
            initObj.add_spot_Fn();
            //添加美食
            initObj.add_eatFn();
            //已选的灰掉
            initObj.is_list_grayFn();
           
            // initFn.hover_list();
            // if (type == "local") {
            //     initFn.hover_fen_list(data, "local")
            // } else if (type == "eat") {
            //     initFn.hover_fen_list(data, "eat")
            // }

            

        },
        //景点详情
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
            templateObj.popup_img(spot_data)
            //摘要介绍
            $(".rw_details_popup_box .popup_tab1").find(".spot_Introduction").html(spot_data.introduction).end()
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
            $(".rwpopup_tab2").html(rwpopup_tab2_html)
            //附近景点
            var tuijian_data = data.tuijian
            var rwpopup_tab3_tem = '{{each food as value i}}\
                                    <li class="clearfix js_tj_food_list"  data-lat="{{value.latitude}}" data-lng="{{value.longitude}}" data-per_capita="{{value.per_capita}}">\
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
                                    <li class="clearfix tj_jDshop_list" data-time = "{{value.tag_time}}"  data-lat="{{value.latitude}}" data-lng="{{value.longitude}}">\
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
                                    <li class="clearfix tj_jDshop_list" data-time = "{{value.tag_time}}"  data-lat="{{value.latitude}}" data-lng="{{value.longitude}}">\
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
            var rwpopup_tab3_html = rwpopup_tab3_render(tuijian_data);
            if (tuijian_data.food.length == 0 && tuijian_data.jingdian.length == 0 && tuijian_data.shop.length == 0) {
                $(".rwpopup_tab3_ul").html("暂无数据");
            } else {
                $(".rwpopup_tab3_ul").html(rwpopup_tab3_html);
            };

        },
        //必吃美食——本土特产详情
        eatgoods_detailsPopup: function (data, tab_text) {
            // console.log(data)
            if (tab_text == "必吃美食") {
                $(".eat_goods_top_details_text").find(".p1").html(data.dishes_name);
            } else {
                $(".eat_goods_top_details_text").find(".p1").html(data.goods_name);
            }
            $(".eat_goods_top_details_text").find(".p2 span").html(data.recom_sites).end()
                .find(".p3").html(data.spot_Introduction);
            var eat_goods_details = ' {{each image_url as value i}}\
                                        {{if i <= 3}}\
                                        <li>\
                                            <img src="{{value}}" alt="">\
                                        </li>\
                                        {{/if}}\
                                    {{/each}}';
            var eat_goods_render = template.compile(eat_goods_details);
            var eat_goods_html = eat_goods_render(data);
            $(".eat_goods_ul").html(eat_goods_html);

            $(".eat_goods_ul").on("click", "li", function () {
                $(".bigImg_box").fadeIn().find("img").attr("src", $(this).find("img").attr("src"))
            })
            $(".bigImg_box,.eat_goods_details_box .shut_down").on("click", function () {
                $(".bigImg_box").fadeOut().find("img").attr("src", "")
            })
        },
        //店铺详情
        f4_store_detailsPopup: function (data) {
            // console.log(data)
            var data_sport = data.spot.store;
            $(".f4_top_details_text").find(".p1").html(data_sport.store_name).end()
                .find(".meal_time").html(data_sport.meal_time).end()
                .find(".per_capita").html(data_sport.per_capita).end()
                .find(".tel").html(data_sport.phone).end()
                .find(".address").html(data_sport.address).end();
            templateObj.popup_img(data_sport);
            $(".f4_details_popup_box .popup_tab1").find(".Introduction").html(data_sport.Introduction).end()
                .find(".type").html(data_sport.type).end()
                .find(".per_capita").html(data_sport.per_capita).end()
                .find(".meal_time").html(data_sport.meal_time).end()
                .find(".business_hours").html(data_sport.business_hours).end()
                .find(".phone").html(data_sport.phone).end()
                .find(".address_name").html(data_sport.address).end()
                .find(".update_time").html(data_sport.release_time).end();
            if (data_sport.tebie_tuijian != undefined) {
                $(".recommended").show().find(".tebie_tuijian").html(data_sport.tebie_tuijian);
            } else {
                $(".recommended").hide().find(".tebie_tuijian").html("");

            };

            var f4_tab1_tem = ' {{each dishes as value i}}\
                                    <li>\
                                        <div class="img_box">\
                                            <img src="{{value.image_url}}" alt="">\
                                        </div>\
                                        <div class="store_text">\
                                            <span class="goods_name">{{value.dishes_name}}</span>\
                                        </div>\
                                    </li>\
                                {{/each}}';
            var f4_tab1_render = template.compile(f4_tab1_tem);
            var f4_tab1_html = f4_tab1_render(data);
            if (data.dishes.length == 0) {
                $(".f4_tab_content1_ul").html("暂无数据");
            } else {
                $(".f4_tab_content1_ul").html(f4_tab1_html);
            };
            var details_box = $(".f4_details_popup_box");
            templateObj.branchFn(details_box, data.spot);
        },
        f4tab2_detailsPopup: function (data) {
            // console.log(data)
            var data_sport = data.store;
            $(".f4tab2_top_details_text").find(".p1").html(data_sport.store_name).end()
                .find(".meal_time").html(data_sport.meal_time).end()
                .find(".per_capita").html(data_sport.per_capita).end()
                .find(".tel").html(data_sport.phone).end()
                .find(".address").html(data_sport.address).end();
            templateObj.popup_img(data_sport);
            $(".f4tab2_details_popup_box .popup_tab1").find(".Introduction").html(data_sport.Introduction).end()
                .find(".type").html(data_sport.type).end()
                .find(".per_capita").html(data_sport.per_capita).end()
                .find(".meal_time").html(data_sport.meal_time).end()
                .find(".update_time").html(data_sport.release_time).end();
            if (data_sport.tebie_tuijian != '') {
                $(".recommended").show().find(".tebie_tuijian").html(data_sport.tebie_tuijian);
            } else {
                $(".recommended").hide().find(".tebie_tuijian").html("");
            };

            var f4_tab1_tem = ' {{each tj as value i}}\
                                    <li>\
                                        <div class="img_box">\
                                            <img src="{{value.image_url}}" alt="">\
                                        </div>\
                                        <div class="store_text">\
                                            <span class="goods_name">{{value.dishes_name}}</span>\
                                        </div>\
                                    </li>\
                                {{/each}}';
            var f4_tab1_render = template.compile(f4_tab1_tem);
            var f4_tab1_html = f4_tab1_render(data);
            if (data.tj.length == 0) {
                $(".f4tab2_tab_content1_ul").html("暂无数据");
            } else {
                $(".f4tab2_tab_content1_ul").html(f4_tab1_html);
            };
            var details_box = $(".f4tab2_details_popup_box");
            templateObj.branchFn(details_box, data);
        },
        //分店
        branchFn: function (details, data) {
            // console.log(data)
            details.find(".branch_title span").html("(" + data.fen.length + ")");
            var branch_tem = '{{each fen as value i}}\
                                <li>\
                                    <div class="img_box">\
                                        <img src="{{value.image_url}}" alt="">\
                                    </div>\
                                    <div class="branch_text">\
                                        <div class="branch_name">{{value.branch_name}}</div>\
                                        <div class="branch_address">地址：{{value.address}}</div>\
                                        <div class="">电话：{{value.phone}}</div>\
                                        <div>营业时间：{{value.business_hours}}</div>\
                                    </div>\
                                </li>\
                            {{/each}}';
            var branch_render = template.compile(branch_tem);
            var branch_html = branch_render(data);
            if (data.fen.length == 0) {
                details.find(".branch_ul").html("");
                details.find(".branch_box").hide()
            } else {
                details.find(".branch_ul").html(branch_html);
                details.find(".branch_box").show()
            }
        },
        foodstreet_detailsPopup: function (data) {
            $(".foodstreet_top_details_text").find(".p1").html(data.food_court_name).end()
                .find(".meal_time").html(data.meal_time).end()
                .find(".per_capita").html(data.per_capita).end()
                .find(".tel").html(data.phone).end()
                .find(".address").html(data.address).end();

            $(".foodstreet_details_popup_box .popup_tab1").find(".spot_Introduction").html(data.Introduction).end()
                .find(".type").html(data.type).end()
                .find(".suit_time").html(data.suit_time).end()
                .find(".business_hours").html(data.business_hours).end()
                .find(".address_name").html(data.address).end()
                .find(".update_time").html(data.release_time).end()
            if (data.tebie_tuijian != '') {
                $(".recommended").show().find(".tebie_tuijian").html(data.tebie_tuijian);
            } else {
                $(".recommended").hide().find(".tebie_tuijian").html("");
            }
            //图片
            templateObj.popup_img(data);
        },
        f5_tab2_3_detailsPopup: function (data) {
            var data_sport = data.spot;
            $(".f5_top_details_text").find(".p1").html(data_sport.shopping_name).end()
                .find(".p2").html(data_sport.type).end()
                .find(".tel").html(data_sport.phone).end()
                .find(".address").html(data_sport.address).end();
            templateObj.popup_img(data_sport);
            $(".f5_details_popup_box .popup_tab1").find(".Introduction").html(data_sport.Introduction).end()
                .find(".type").html(data_sport.type).end()
                .find(".shopping_time").html(data_sport.shopping_time).end()
                .find(".business_hours").html(data_sport.business_hours).end()
                .find(".phone").html(data_sport.phone).end()
                .find(".address_name").html(data_sport.address).end()
                .find(".update_time").html(data_sport.release_time).end();
            if (data_sport.tebie_tuijian != '') {
                $(".recommended").show().find(".tebie_tuijian").html(data_sport.tebie_tuijian);
            } else {
                $(".recommended").hide().find(".tebie_tuijian").html("");
            };
            // console.log(data_sport)
            var f5_tab1_tem = ' {{each features_goods as value i}}\
                                    <li>\
                                        <div class="img_box">\
                                            <img src="{{value.image_url}}" alt="">\
                                        </div>\
                                        <div class="store_text">\
                                            <span class="goods_name">{{value.goods_name}}</span>\
                                        </div>\
                                    </li>\
                                {{/each}}';
            var f5_tab1_render = template.compile(f5_tab1_tem);
            var f5_tab1_html = f5_tab1_render(data);
            if (data.features_goods.length == 0) {
                $(".f5_tab_content1_ul").html("暂无数据");
            } else {
                $(".f5_tab_content1_ul").html(f5_tab1_html);
            }
        },
        //详情相册
        popup_img: function (spot_data) {
            //图片
            if(!spot_data.image_url)return
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
        },
        //酒店列表渲染
        hotelList_temFn:function(res){
            var holtelistTemplate = '{{each hotel as value i }}\
                                <li id="hotel_{{i}}" class="list" index ="{{i}}" lat="{{value.Detail.Latitude}}" lng="{{value.Detail.Longitude}}" >\
                                <div class="left_img">\
                                <img src="{{value.Detail.ThumbNailUrl}}" alt="">\
                                </div>\
                                <div class="addHotel">\
                                添加\
                                </div>\
                                <div class="clearfix">\
                                <div class="name fl" hotelId="{{value.HotelId}}"  lat="{{value.Detail.Latitude}}" lng="{{value.Detail.Longitude}}" title="{{value.Detail.HotelName}}">{{value.Detail.HotelName}}</div>\
                                <div class="r_tip point fr orange">{{value.Detail.Review.Score}}</div>\
                                </div>\
                                <div class="clearfix">\
                                <div class="price fl orange">¥{{value.LowRate}} <span>起</span></div>\
                                <div class="r_tip type fr tip">{{value.Detail.Category}}型</div>\
                                </div>\
                                <div class="tip loca"><span class="circle r_tip"></span>{{value.Detail.BusinessZoneName}}附近</div>\
                                <div class="msg_box dis_none">\
                                <ul>\
                                </ul>\
                                <div class="ctrl_bar">\
                                <span class="cancel">取消</span><span class="confirm disabled">确定</span>\
                                </div>\
                                </div>\
                                </li>\
                            {{/each}}';
            var hotelListRender = template.compile(holtelistTemplate);
            var html = hotelListRender(res);
            $('.hotelBox .hotel_box').html(html);
            
            var temDay_data = {day_arry:_Daydate_arr}
            var hotelCheck = '{{each day_arry as value i }}\
                            {{if value.hotel}}\
                                <div class="wap disabled" index="{{i}}">\
                                    <span class="day">Day{{value.hotel_day}}</span>\
                                    <span class="time">{{value.month_day}} 入住</span>\
                                    <span class="i_circle"></span>\
                                </div>\
                            {{else}}\
                                <div class="wap" index="{{i}}">\
                                    <span class="day">Day{{value.hotel_day}}</span>\
                                    <span class="time">{{value.month_day}} 入住</span>\
                                    <span class="i_circle"></span>\
                                </div>\
                            {{/if}}\
                        {{/each}}'
            var hotelCheckRender = template.compile(hotelCheck);
            var html1 = hotelCheckRender(temDay_data);
            $('.hotelBox .hotel_box .msg_box ul').html(html1);


        },
        //添加景点渲染
        add_go_temFn: function (this_data) {
            // console.log(this_data)
            $(".f_prompt").hide();
            $(".f_main_next").show();
            var is_shop = this_data.this_floor_index == 4?'jsShop':'';
            var sport_srt = '<li class="jsSport '+is_shop+'"  data-this_tag_time="' + this_data.this_tag_time + '"\
            data-lat="' + this_data.this_lat + '" data-lng="' + this_data.this_lng + '" data-period_time="' + this_data.period_time + '"\
            data-this_floor="' + this_data.this_floor_index + '" data-this_type = "'+this_data.this_type+'">\
                                <div class="_l">\
                                    <img src="' + this_data.this_img_src + '" alt="">\
                                </div>\
                                <div class="_r">\
                                    <p class="p1" title=' + this_data.this_name + '>'+this_data.this_name+'</p>\
                                    <p class="p2 playTime">游玩时长：<span class="time_num">' + this_data.this_playtime + '</span>\
                                    <span class="playBut is_timeEdit' + this_data.not_modifity + '"><i class="play_t"></i><i class="play_d"></i></span></p>\
                                </div>\
                                <div class="delete_icon"></div>\
                            </li>'
            $(".js_attractions_ul").append(sport_srt)
            //hover,左边添加后的景点
            initObj.hover_left_ListFn();
            //删除景点
            initObj.del_spot_Fn();
            //计算适玩时间
            initObj.playtimeFn();
            //详情展示
            initObj.detail_showFn('.js_attractions_ul li','._l,.p1')
        },
        //添加美食渲染
        add_eat_temFn: function (this_data) {
            // console.log(this_data)
            $(".f_main_next").show();
            var str = ""
            if (this_data.fen_data) {
                str = '<li class="jsEat fen_list"  data-this_tag_time="' + this_data.tag_time + '" data-lat="' + this_data.lat + '" data-lng="' + this_data.lng + '" \
                data-period_time="" data-this_floor="3" data-this_type="'+this_data.this_type+'">\
                        <div class="_l">\
                            <img src="' + this_data.dianpu_image + '" alt="">\
                        </div>\
                        <div class="_r">\
                            <p class="p1" title="' + this_data.name + '">' + this_data.name + '</p>\
                            <p class="p2 playTime">推荐用餐：<span class="time_num">' + this_data.meal_time + '</span><span class="playBut"><i class="play_t"></i><i class="play_d"></i></span> </p>\
                        </div>\
                        <div class="delete_icon"></div>\
                    </li>'

            } else {
                str = '<li class="jsEat"  data-this_tag_time="' + this_data.tag_time + '" data-lat="' + this_data.lat + '" data-lng="' + this_data.lng + '"\
                data-period_time="" data-this_floor="3" data-this_type="'+this_data.this_type+'">\
                                <div class="_l">\
                                    <img src="' + this_data.dianpu_image + '" alt="">\
                                </div>\
                                <div class="_r">\
                                    <p class="p1" title="' + this_data.name + '">' + this_data.name + '</p>\
                                    <p class="p2 playTime">推荐用餐：<span class="time_num">' + this_data.meal_time + '</span><span class="playBut"><i class="play_t"></i><i class="play_d"></i></span> </p>\
                                </div>\
                                <div class="delete_icon"></div>\
                            </li>'

            }
            $('.js_attractions_ul').append(str)
            //hover,左边添加后的景点
            initObj.hover_left_ListFn();
            //删除添加的美食
            initObj.del_eatFn();
            //计算适玩时间
            initObj.playtimeFn()
            //详情展示
            initObj.detail_showFn('.js_attractions_ul li','._l,.p1')
           
        },
        //添加后酒店渲染
        add_hotel_temFn: function(){
            $(".f_prompt").hide();
            $(".f_main_next").show();
            var dayObjs = {dayObj:_Daydate_arr}
            // console.log(_Daydate_arr)
            var hotel_srt = '{{each dayObj as value i}}\
                            {{if value.hotel}}\
                            {{if value.hotel.hotel_name != ""}}\
                                <li class="jsHotel" data-lat="{{value.hotel.lat}}" data-lng="{{value.hotel.lng}}" data-day_index="{{i}}">\
                                    <div class="_l">\
                                        <img src="{{value.hotel.ThumbNailUrl}}" alt="">\
                                    </div>\
                                    <div class="_r">\
                                        <p class="p1" hotelId="{{value.hotel.hotel_id}}" title="{{value.hotel.hotel_name}}"><span>{{value.hotel.hotel_name }}</span></i></p>\
                                        <p class="p2 playTime">入住时间：<span class="time_num">{{value.hotel.month_day }}</span></p>\
                                    </div>\
                                    <div class="delete_icon"></div>\
                                </li>\
                            {{/if}}\
                            {{/if}}\
                            {{/each}}'
            var addhotelRender = template.compile(hotel_srt);
            var html = addhotelRender(dayObjs);
            $('.js_hotel_ul').html(html);
            initObj.hover_left_ListFn()
        },
        //游玩时间编辑
        edit_time_temFn:function(){
            var tem_data= {dayArr:_Daydate_arr};
            var time_str = '{{each dayArr as value i}}\
                                    <li class="slider_list">\
                                        <div class="layout-slider">\
                                            <div class="slider_title">Day{{value.hotel_day}}<span class="eait_line">|</span>{{value.month_day}}</div>\
                                            <input id="slider{{i}}" type="slider" name="area" value="{{value.time1}};{{value.time2}}" />\
                                        </div>\
                                    </li>\
                            {{/each}}'
            var tem_time_render = template.compile(time_str)
            var time_li_html = tem_time_render(tem_data);
            $('.slider_ul').html(time_li_html)
            
            
        },
    }
    
    var debouncelimitHotel = debounce(initObj.Pagination,500)
})
//防抖函数
function debounce (fn,delay) {
    var timer;  
    return function(){
        var args= arguments;
        var _this = this;
        if(timer){
            clearTimeout(timer);
        }
        timer = setTimeout(function(){
            fn.apply(_this,args);
        },delay)
    }
}
// 酒店 info酒店添加
function addhotelFn(index){
    var top = $('.hotelBox').find('li').eq(index).position().top-92
    $('.hotelBox').stop().animate({scrollTop:top}, 500);
    var msg_box_attr = $('.hotelBox').find('li').eq(index).find('.msg_box')
    if(msg_box_attr.hasClass('dis_none')){
        $('.hotelBox').find('li').find('.msg_box').slideUp(300).addClass('dis_none');
        $('.hotelBox').find('li').eq(index).find('.msg_box').slideDown(300).removeClass('dis_none')
        
    }
};
//酒店info详情
function hotel_Map_detai(index){
    var slider_len = $('.slider_ul li').length
    var query = {};
    query.hotel_id = $('.hotel_box').find('.list').eq(index).find('.name').attr('hotelId');
    query.arrival_date = _this_city_data.city_date;
    query.departure_date = getDateAfter_n(query.arrival_date,slider_len,'-');
    query.map_post = true;
    $.post('../store/getHotelDetail', query, function (res) {
        if (!res) return false;
        $(".hotel_details_popup_box").fadeIn();
        _hotel_datal = res
        var rooms = '';
        for (var i = 0; i < res.Rooms.length; i++) {
            rooms += res.Rooms[i].Name + '丨'+ res.Rooms[i].BedType +'、';
        }
        var imgs = '';
        for (var i = 0; i < 5; i++) {
            imgs += '<li><img src=' + res.highImage[i] + ' alt=""></li>'
        }
        var img_length = res.highImage.length;
        if (img_length >= 5) {
            $(".last_li_img").show();
        } else {
            $(".last_li_img").hide();
        };
        var grade = res.Detail.Review.Score>=4.5?'棒极了':(res.Detail.Review.Score<4?'还不错':'挺好哒');
        var starStr = '';
        for(var i=0;i<res.Detail.Category;i++){
            starStr+='<i class="star"></i>'
        }
        $('.hotel_details_popup_box').find('.p1').text(res.Detail.HotelName).end()
            .find('.p2').html(starStr+ '¥' + Math.ceil(res.LowRate) + '起').end()
            .find('.p3 .tel').text(res.Detail.Phone).end()
            .find('.p3 .address').text(res.Detail.Address).end()
            .find('.spot_Introduction').text(res.Detail.Features).end()
            .find('.popup_tab1 .phone').text(res.Detail.Phone).end()
            .find('.popup_tab1 .address_name').text(res.Detail.DistrictName + res.Detail.Address).end()
            .find('.popup_tab1 .type').text(rooms).end()
            .find('.popup_tab1 .suit_season').text(res.Detail.GeneralAmenities).end()
            .find('.popup_tab1 .traffic_info').text(res.Detail.Traffic).end()
            .find('.popup_img_url').html(imgs).end()
            .find('.hotel_info_right .fz_18').html(grade+' <em></em> '+res.Detail.Review.Score+'分');
    }, 'json');
}
//进度条
function Progressbar(percentage,is_color) {
    var color1;
    var color2;
    if (is_color == 1) {
        color1 = '#caf587'
        color2 = '#aada60'
    } else if (is_color == 2) {
        color1 = '#f4e237'
        color2 = '#ddc802'
    } else {
        color1 = '#d44337'
        color2 = '#af1407'
    }
    $('#progressbar').LineProgressbar({
        percentage: percentage,
        fillBackgroundColor: barGg+'linear-gradient(right,' + color2 + ',' + color1 + ')',
        height: '10px',
        radius: '5px'
    });
}
Progressbar(0);

//给当前时间加天数
var monthDate = function (date, days) {
    var d = new Date(date);
    d.setDate(d.getDate() + days);
    var m = d.getMonth() + 1;
    // return d.getFullYear()+'-'+m+'-'+d.getDate(); 
    // ---
    d = d.getDate();
    // if (m >= 1 && m <= 9) {
    //     m = "0" + m;
    // }
    // if (d >= 0 && d <= 9) {
    //     d = "0" + d;
    // }
    return m + '月' + d +'日';
}

//计算两点间的直线距离 单位km
function GetDistance (lat1, lng1, lat2, lng2) { 
    var radLat1 = lat1 * Math.PI / 180.0;
    var radLat2 = lat2 * Math.PI / 180.0;
    var a = radLat1 - radLat2;
    var b = lng1 * Math.PI / 180.0 - lng2 * Math.PI / 180.0;
    var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) +
        Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
    s = s * 6378.137; // EARTH_RADIUS;
    s = Math.round(s * 10000) / 10000;
    
    return s;
}

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

//判断是否为ie浏览器
function IEVersion() {
    var userAgent = navigator.userAgent; //取得浏览器的userAgent字符串  
    var isIE = userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1; //判断是否IE<11浏览器  
    var isEdge = userAgent.indexOf("Edge") > -1 && !isIE; //判断是否IE的Edge浏览器  
    var isIE11 = userAgent.indexOf('Trident') > -1 && userAgent.indexOf("rv:11.0") > -1;
    if(isIE) {
        var reIE = new RegExp("MSIE (\\d+\\.\\d+);");
        reIE.test(userAgent);
        var fIEVersion = parseFloat(RegExp["$1"]);
        if(fIEVersion == 7) {
            return 7;
        } else if(fIEVersion == 8) {
            return 8;
        } else if(fIEVersion == 9) {
            return 9;
        } else if(fIEVersion == 10) {
            return 10;
        } else {
            return 6;//IE版本<=7
        }   
    } else if(isEdge) {
        return 'edge';//edge
    } else if(isIE11) {
        return 11; //IE11  
    }else{
        return -1;//不是ie浏览器
    }
};
// 最简单数组去重法
/*
* 新建一新数组，遍历传入数组，值不在新数组就push进该新数组中
* IE8以下不支持数组的indexOf方法
* */
function uniq(array){
    var temp = []; //一个新的临时数组
    for(var i = 0; i < array.length; i++){
        if(temp.indexOf(array[i]) == -1){
            temp.push(array[i]);
        }
    }
    return temp;
}