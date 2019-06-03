var initObj = {},
    map,hover_Marker,h_MarkerArr=[];
var _trc_res,//行程数据
    _floor_res,//楼层数据
    _post_floorData = {},//请求楼层数据向后台传入数据
    this_city_index,
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
    addgo_arry = [],//添加我想去的景点(从上个页面添加的我想去)
    newGo_arr = [],//当前页面新添加的景点
    addgo_marker_array = [],//添加我想去的景点marker数组
    eat_name_arry = [],//添加美食数组
    hotel_markArr = [],//酒店marker数组
    addHotel_markArr = [],//添加酒店的marker数组
    addHotel_info_arr = [],//添加酒店的，map info数据
    time_Arr = [],//时间区间数组
    _this_cityDay_num;//当前城市游玩时间;
   
   
//高亮
var polyOptions = {
    //边线边框线
    strokeColor: "#9B868B",
    fillColor: '#FF0000',
    fillOpacity: 0.1,
    strokeWeight: 1,
    zIndex: 1
};
var day_polylineArr=[],//每天（一组）的连线
    allday_polyPathArr = [], //所有天(每天一组)连线 Path arr
    day_markerArr, //每天(一组)的marker 数组 
    allday_markerArr = [],//所有天(每天一组)的marker 数组
    _res_day_Arr, //请求后当前城市天数的景点
    _res_r_spot;//数据r_spot
   
var food_res_dayArr=[]//美食（处理已添加的美食）

var isEdit = sessionStorage.isEdit //从日历模式 编辑过来

var uid =  getCookie('uid'); 
if(uid == null){//没有登录
    $('.floor7').hide()
}
// //存储1-7楼景点页面后退
// sessionStorage.setItem('is_spot_back','ok')
$('#date_picker,.start,.end').css({'pointer-events': 'none'}).find('.arr').hide()
$(function(){
    var pos_url 
    if(isEdit == 'ok'){
        pos_url = '/portal/Itinerary/ModifyTrip'
    }else if(isEdit == 'EditQuick'){ // 一键制作过来
        pos_url = '/portal/map/EditQuick'
    }else{
        pos_url ='plan'
    }
    var post_data = {}
    if(isEdit == 'ok'){
        post_data.uid =  getCookie('uid'); 
        post_data.trip_id =  sessionStorage.trip_id;
    }
    $.post(pos_url,post_data,function(res){
        if(!res.status)return
        // console.log(res)
       
        //初始化调动方法
        initObj.initFn(res);
       
        
    },'json');

    initObj={
        initFn:function(res){
            _trc_res = res.data;
            _res_r_spot = _trc_res.r_spot
            this_city_index = Number(_res_r_spot.spot_data.this_city_index)
            _this_city_data = _res_r_spot.go_city_array[this_city_index]
            city_id = _this_city_data.city_id;
            _post_floorData = {city_id:city_id};
            _city_name = _this_city_data.city_name;
            _res_day_Arr = _trc_res.result.day_arry;
            _Daydate_arr = _res_day_Arr;
            food_res_dayArr = _res_day_Arr //美食(处理已添加的美食)
            //当前城市游玩天数
            _this_cityDay_num = Number(_this_city_data.city_daynum);
            //整个行程游玩天数
            _allDay_num = Number(_res_r_spot.day_num);
            $(".loading_box").fadeOut();

            $('.city_name').html(_city_name)
            //加载地图
            google.maps.event.addDomListener(window, "load", mapObj.initMap());
            //城市高亮
            mapObj.cityOptionsPathFn();
            //渲染每天的列表
            templateObj.dayItem_fn();
            //初始化的数据(展示marker 连线)
            initObj.init_dataFn()
            //左边 nav 渲染事件
            initObj.left_nav_Fn();
            // nav 表单
            initObj.nav_formFn();
            //编辑 城市 切换
            initObj.edit_cityTabFn();
            //第一遍加载一楼数据
            initObj.post_listDate('renwen','top8');
            //楼层和tab切换
            initObj.floor_TabFn();
            //景点搜索
            initObj.sportSearch();
            //上传封面
            initObj.add_cover_imgFn();
            //下一步
            initObj.next_fn();
            //编辑 查看行程单
            initObj.edit_nextFn()
            //添加天数
            initObj.add_dayNun();
            // 1-6 楼位置
            $(".floor_box").show().offset({
                left: $(".js_help").offset().left + 30
            });
            $(window).resize(function() {
                $(".floor_box").offset({
                    left: $(".js_help").offset().left + 30
                })
            });
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

            //酒店行政区域select框下拉变化
            initObj.selectChangeFn(_city_name);
            //酒店城市切换
            initObj.hotel_city_tabFn()
        },
        //nav 表单
        nav_formFn:function(){
            var cityArr = _res_r_spot.cityArray;
            //标题
            var title = _res_r_spot.title
            go_city_name = _res_r_spot.departure_city.city_name;
            return_city_name = _res_r_spot.return_city.city_name;
            $('.trc_title').html(title);
            //表单
            $('.cartBox').find('#trc_title').val(title).end().find('#wap3_date').val(_res_r_spot.date).end()
            .find('.wap2_adult_num').html(_res_r_spot.adult).end().find('.wap2_childrent_num').html(_res_r_spot.children).end()
            .find('.start_name').html(go_city_name).end().find('.end_name').html(return_city_name);
            $('.madeTravelMask img.bgImg').attr('src', _res_r_spot.cover);
            if(isEdit){
                //编辑流程 nav top城市渲染
                templateObj.edit_topCity_temFn()
            }else{
                //正常流程 nav top城市渲染
                templateObj.normal_topCity_temFn();
            }
            
            $('.city_name_ul').width((cityArr.length+2)*68)
            $('.city_line').width($('.normal_head').width()-68);
            if($('.city_name_ul').width()>$('.normal_head').width()){
                $('.LRbut').show();
            }else{
                $('.LRbut').hide();
            };
            var city_show_len;
            $(window).resize(function(){
                $('.city_name_ul').css('transform','translateX(0px)')
                $('.city_line').width($('.normal_head').width()-68);
                city_show_len = $('.normal_head').width()/68;
                if($('.city_name_ul').width()>$('.normal_head').width()){
                    $('.LRbut').show();
                }else{
                    $('.LRbut').hide();
                }
            });
            city_show_len = $('.normal_head').width()/68;
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
        //edit top 城市切换
        edit_cityTabFn:function(){
            $('.edit_city_ul').find('li').unbind('click').on('click',function(){
                var post_data = initObj.nextPost_dataFn();
                post_data.now_city_index =  $(this).index();
                post_data.uid =  getCookie('uid'); 
                post_data.trip_id =  sessionStorage.trip_id;
                $('.floor_box').find('.floor1').addClass('active').siblings('.floor').removeClass('active').find('i').removeAttr('style')
                $('.hotel_con_rig').hide();
                $('.spot_con_rig').show();
                
                $.ajax({
                    url: isEdit == 'ok'?'/portal/Itinerary/MakeCity':'/portal/map/SucessQuick',
                    type: "post",
                    dataType: "json",
                    contentType:"application/json;charset=utf-8",
                    data:JSON.stringify(post_data), 
                    success: function (res) {
                        // console.log(res)
                        if(!res.status)return;
                        $('.hotel_box').html('')
                        initObj.initFn(res);
                        
                    }
                })
            })
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
                    }
                    
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
        //hover 右边楼层景点
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
                mapObj.style_InfowindowFn(infoData,"spot_hover",45)
                
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
                    mapObj.style_InfowindowFn(infoData,"spot_hover",45)
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
        detail_showFn:function(){
            //景点详情
            $(".spot_con_rig .list").unbind('click').on("click", ".introduce,.list_l", function () {
                var detail_url = $(".floor_box").find(".active").attr('data-detailUrl');
                var list = $(this).parents(".list");
                var this_index = list.index();
                var name = list.find(".attractions_name").text();
                var lat = list.attr("data-lat");
                var lng = list.attr("data-lng");
                var r_top_active = $(".r_top_tab_ul").find(".active").text();
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
                            templateObj.detailsPopup(data, this_index);
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
                        newGo_arr.push(addgo_obj);
                        // console.log(addgo_arry);
                        templateObj.add_go_temFn(addgo_obj);
                        var marker_data = {
                            lat: lat,
                            lng: lng,
                            marker_url:'qt',
                            name:spot_name,
                            playTime:'适玩时长'+addgo_obj.this_playtime
                        }
                        // mapObj.addgo_markerFn(marker_data);
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
        // 添加我想去景点
        add_spot_Fn:function(){
            $(".js_rlist_ul .list").on("click", ".js_go_button", function () {
                
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
                    addgo_obj.this_playtime = this_playtime;//展示计算的时间
                    addgo_obj.default_playtime = this_playtime;//原本数据的时间
                    addgo_obj.this_tag_time = Number(this_tag_time);//计算的时间
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
                    addgo_obj.traffic_distance = '0' //交通距离
                    addgo_obj.traffic_time= '0' //交通时间 num
                    addgo_obj.traffic_time_chinese = '0分钟' //交通时间（小时
                    addgo_arry.push(addgo_obj);//添加我想去的景点(从上个页面添加的我想去)
                    newGo_arr.push(addgo_obj);//当前页面新添加的景点
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
                    // mapObj.addgo_markerFn(marker_data);
                   
                    //动画
                    initObj.addflyer(this_list, $(this));
                    
                    // //添加元素的总时长
                    // initObj.all_play_timeFn('add',addgo_obj.this_tag_time)
                };
    
            });
        },
        //删除当天里的景点
        del_day_spot_Fn:function(){
            $('.dayItem').unbind('click').on('click','.delete_icon',function () {
                var $this = $(this)
                var day_index = $this.parents('.dayItem').index();
                var spot_index = $this.parents('.spot_list').index();
                _res_day_Arr[day_index].day.splice(spot_index,1);
                //判断有没有绑定的景点
                if( $this.parents('.spot_list').find('.foodBox').attr('data-food_index')){
                    $('.food_box').find('.food_ul').html('');
                    $('.food_box').hide();
                }
                $this.parents('.spot_list').remove();
                allday_markerArr[day_index][spot_index].setMap(null);
                var del_name = $this.parents('.spot_list').find('.name').text()
                allday_markerArr[day_index].splice(spot_index,1);
                var get_addgo_arry_i = getArrIndex(addgo_arry,{this_name:del_name})
                addgo_arry.splice(get_addgo_arry_i,1);
                $(".js_rlist_ul li").each(function (i, n) {
                    var list_name = $(n).find(".attractions_name").text();
                    if (del_name == list_name) {
                        $(".js_rlist_ul li").eq(i).removeClass("city_list_go").find(".go_button").removeClass("go_button_gray").html("我想去");
                    }
                })
                //移除自定义窗口
                $('#map').find('.popup-content').each(function(){
                    $this.remove()
                });
                //删除对应的连线
                allday_polyPathArr[day_index].removeAt(spot_index);
                
                // console.log(_res_day_Arr);
                //重新设置label的值
                var dis = null,hours_time
                var thisDayspot_arr = _res_day_Arr[day_index].day
                for (var a = 0; a < thisDayspot_arr.length; a++) {
                    allday_markerArr[day_index][a].setLabel({
                        text: a == 0?'D'+(day_index+1):(a+1).toString(),
                        color: "#659ff5",
                        fontWeight: "800",
                    });

                    if(a+1 < thisDayspot_arr.length){
                        var lat1 = Number(thisDayspot_arr[a].this_lat)
                        var lng1 = Number(thisDayspot_arr[a].this_lng)
                        var lat2 = Number(thisDayspot_arr[a+1].this_lat)
                        var lng2 = Number(thisDayspot_arr[a+1].this_lng)

                        var spot_dis = GetDistance(lat1,lng1, lat2, lng2);
                        dis = decimal(spot_dis,1);// 向上取整 保留1位小数
                        
                        //计算时速
                        var time_num =  initObj.dis_speedFn(dis);//time num
                        hours_time = initObj.disTimeFn(time_num); // time 小时
                        thisDayspot_arr[a].traffic_distance = dis //交通距离
                        thisDayspot_arr[a].traffic_time= time_num //交通时间 num
                        thisDayspot_arr[a].traffic_time_chinese = hours_time //交通时间（小时
                    };
                    if(a == thisDayspot_arr.length-1){
                        //最后一个景点到酒店的距离，
                        if(!$('.dayItem_box').find('.dayItem').eq(day_index).find('.hotel_box').hasClass('not_hotel')){
                        
                            var last_lat1 = Number(thisDayspot_arr[a].this_lat);
                            var last_lng1 = Number(thisDayspot_arr[a].this_lng);
                            var hotel_lat = Number(thisDayspot_arr[day_index].lat);
                            var hotel_lng = Number(thisDayspot_arr[day_index].lng);
                            var lats_spot_dis = GetDistance(last_lat1,last_lng1, hotel_lat, hotel_lng);
                            dis = decimal(lats_spot_dis,1);// 向上取整 保留1位小数
                            //计算时速
                            var time_num =  initObj.dis_speedFn(dis);//time num
                            hours_time = initObj.disTimeFn(time_num); // time 小时
                            thisDayspot_arr[a].traffic_distance = dis //交通距离
                            thisDayspot_arr[a].traffic_time= time_num //交通时间 num
                            thisDayspot_arr[a].traffic_time_chinese = hours_time //交通时间 （小时
                        }else{
                            dis = null
                            delete thisDayspot_arr[a].traffic_distance 
                            delete thisDayspot_arr[a].traffic_time
                            delete thisDayspot_arr[a].traffic_time_chinese 
                        }
                    }
                
                    var dis_data = {
                        day_index :day_index,
                        spot_index : a,
                        dis:dis,
                        hours_time:hours_time
                    }
                    //渲染距离交通
                    templateObj.dis_time_temFn(dis_data);

                };
            
                var del_name = $this.parents('.spot_list').find('.name').html()
                $(".js_rlist_ul li").each(function (i, n) {
                    var list_name = $(n).find(".attractions_name").text();
                    if (del_name == list_name) {
                        $(".js_rlist_ul li").eq(i).removeClass("city_list_go").find(".go_button").removeClass("go_button_gray").html("我想去");
                    }
                });
                //删除addgo_arrys数组中对应的景点
                for (var i = 0; i < addgo_arry.length; i++) {
                    if(addgo_arry[i].this_name == del_name){
                        addgo_arry.splice(i,1)
                    }
                };
                
                

                // if(spot_index != 0) return
                //重新添加黑色info 重新添加
                // mapObj.del_hei_info()
               
            })
        },
        //添加美食 当景点
        add_eatFn:function(){
            $(".js_rlist_ul .eat").on("click", ".eat_go_button", function () {
                // console.log(eat_name_arry)
                $(".f_prompt").hide();
                
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
                
                
                if ($(this).hasClass("go_button_gray")) return
                $(this).addClass("go_button_gray").html("已添加").parents('.eat').addClass("city_list_go");
                
                var this_lat = parseFloat(eat_list.attr("data-lat"));
                var this_lng = parseFloat(eat_list.attr("data-lng"));
                var eat_img = eat_list.find("img").attr('src');
               
                var meal_time = eat_list.find('.time_num').html();
                var tag_time = Number(eat_list.attr('data-tag_time'))
                var floor_index = $(".floor_box").find(".active").index();
                var this_type = $(".r_top_tab_ul").find(".active").text();
                var addgo_obj = {};
                addgo_obj.this_name = eat_name;
                addgo_obj.this_lat = this_lat;
                addgo_obj.this_lng = this_lng;
                addgo_obj.this_img_src = eat_img;
                addgo_obj.this_playtime = meal_time;//展示计算的时间
                addgo_obj.default_playtime = meal_time;//原本数据的时间
                addgo_obj.this_tag_time = tag_time;//计算的时间
                addgo_obj.this_floor_index = floor_index;
                addgo_obj.this_type = this_type;
                addgo_obj.ranking = '';
                addgo_obj.period_time = 'allday';
                addgo_obj.not_modifity = '0';
                addgo_obj.js_sport_eat = 'spot';
                addgo_obj.business_hours = '';
                addgo_obj.ticket_data = '';
                addgo_obj.city_id = city_id;
                //当前月可玩不可玩
                addgo_obj.suit_season = '';
                addgo_obj.traffic_distance = '0' //交通距离
                addgo_obj.traffic_time= '0' //交通时间 num
                addgo_obj.traffic_time_chinese = '0分钟' //交通时间（小时

                eat_name_arry.push(addgo_obj);
                newGo_arr.push(addgo_obj);//当前页面新添加的景点
                // console.log(eat_name_arry)
                // this_citydata.eat_name_arry = eat_name_arry;
                initObj.addflyer(eat_list, $(this));
                templateObj.add_go_temFn(addgo_obj);

                //添加元素的总时长
                // initObj.all_play_timeFn('add',add_eat_obj.tag_time);
               

                    
                
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
            var hotel_city_arr = uniq(_res_r_spot.cityArray);
            var str;
            $(hotel_city_arr).each(function(){
                if(this == _city_name){
                    str += '<option value="'+this+'" selected="selected">'+this+'</option>';
                }else{
                    str += '<option value="'+this+'">'+this+'</option>';
                }
            })
            $('.hotle_cityTab').find('select').html(str)
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
        Pagination:function () { //设置翻页
            $('#Paginator').jqPaginator({
                totalPages: 1,
                visiblePages: 5,
                currentPage: 1,
                prev: '<li class="prev"><a href="javascript:void(0);">上一页</a></li>',
                next: '<li class="next"><a href="javascript:void(0);">下一页</a></li>',
                page: '<li class="page"><a href="javascript:void(0);">{{page}}</a></li>',
                onPageChange: function (num, type) {
                    var search_hotel = $('.searchBox .searchText').val().trim().replace(/\s/g,"");
                    var slider_len = _Daydate_arr.length
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
                            $('.con_rig .hotel_box').html('')
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
                       
                        //酒店详情
                        initObj.hotel_detailFn();
                        //鼠标hover酒店列表
                        initObj.hover_hotel_listFn();
                      
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
        //鼠标hover酒店列表
        hover_hotel_listFn:function(){
            var h_index
            $('.hotelBox').find('li').unbind('hover').hover(function(){
                h_index = $(this).index();
                if(!hotelList[h_index])return
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
                mapObj.style_InfowindowFn(data, 'hotel_hover',45);
                hotel_markArr[h_index].setIcon('/static/v1/img/map/hotel2.png');
            },function(){
                //移除自定义窗口
                $('#map').find('.popup-content').each(function(){
                    $(this).remove()
                });
                if(!hotel_markArr[h_index])return
                hotel_markArr[h_index].setIcon('/static/v1/img/map/hotel1.png');
            })
        },
        //添加酒店
        addHotelFn:function(){
            //入住下拉框显示
            $('.hotel_box').on('click', '.addHotel', function () {
                var slider_len =_Daydate_arr.length
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
                var dis = null,hours_time
                var lats_spot_arr = _res_day_Arr[iIndex].day
                if($(this).hasClass('active')){
                    var curr_hotel = {};
                    curr_hotel.Features =Features;
                    curr_hotel.hotel_name = hotelList[oIndex].Detail.HotelName;
                    curr_hotel.BusinessZoneName = hotelList[oIndex].Detail.BusinessZoneName;
                    curr_hotel.LowRate = hotelList[oIndex].LowRate;
                    curr_hotel.ThumbNailUrl = hotelList[oIndex].Detail.ThumbNailUrl;
                    curr_hotel.address = hotelList[oIndex].Detail.Address;
                    curr_hotel.lat = hotelList[oIndex].Detail.Latitude;
                    curr_hotel.lng = hotelList[oIndex].Detail.Longitude;
                    curr_hotel.tel = hotelList[oIndex].Detail.Phone;
                    curr_hotel.hotel_id = hotelList[oIndex].HotelId;
                    curr_hotel.city = hotelList[oIndex].Detail.CityName;
                    curr_hotel.StarRate = hotelList[oIndex].Detail.StarRate;
                    curr_hotel.date =  _res_day_Arr[iIndex].date;
                    curr_hotel.of_date =  _res_day_Arr[iIndex].of_date;
                    curr_hotel.month_day =  _res_day_Arr[iIndex].month_day;
                    // console.log(curr_hotel)
                    _res_day_Arr[iIndex].hotel = curr_hotel;

                    var Category = hotelList[oIndex].Detail.Category;//类型 豪华.舒适.经济
                    var Score = hotelList[oIndex].Detail.Review.Score;//评分
                    var comm = hotelList[oIndex].Detail.Review.comm;//棒极了
                    var LowRate = hotelList[oIndex].LowRate;
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
                    addHotel_info_arr[iIndex] = data;

                    //最后一个景点到酒店的距离
                    var spot_li = $('.dayItem').eq(iIndex).find('ul li:last-child');
                    var last_lat1 = Number(spot_li.attr("data-lat"));
                    if(last_lat1){
                        var last_lng1 = Number(spot_li.attr("data-lng"));
                        var hotel_lat = Number(addHotel_info_arr[iIndex].lat);
                        var hotel_lng = Number(addHotel_info_arr[iIndex].lng);
                        var lats_spot_dis = GetDistance(last_lat1,last_lng1, hotel_lat, hotel_lng);
                        dis = decimal(lats_spot_dis,1);// 向上取整 保留1位小数
                        //计算时速
                        var time_num =  initObj.dis_speedFn(dis);//time num
                        hours_time = initObj.disTimeFn(time_num); // time 小时
                        var lats_spot = lats_spot_arr[lats_spot_arr.length-1];
                        lats_spot.traffic_distance = dis //交通距离
                        lats_spot.traffic_time= time_num //交通时间 num
                        lats_spot.traffic_time_chinese = hours_time //交通时间（小时
                    }
                   
                }else{
                    delete _res_day_Arr[iIndex].hotel;
                    addHotel_markArr[iIndex].setMap(null)
                    // addHotel_markArr.splice(iIndex,1);
                    addHotel_markArr[iIndex] = null;
                  
                   
                }
                // console.log(_res_day_Arr)
                //渲染对应的酒店
                templateObj.add_hotel_temFn(iIndex);
                var dis_data = {
                    day_index : iIndex,
                    spot_index : lats_spot_arr.length-1,
                    dis:dis,
                    hours_time:hours_time
                }
                //渲染距离交通
                templateObj.dis_time_temFn(dis_data);
                
            });
        },
        //删除酒店
        del_hotelFn:function(){
            $('.dayItem').on('click','.hotel_ico',function(){
                if($(this).parents('.hotel_box').hasClass('not_hotel')) return
                var this_index = $(this).parents('.dayItem').index();
                // console.log(li_index)
                delete _res_day_Arr[this_index].hotel;
                // // console.log(addHotel_markArr)
                addHotel_markArr[this_index].setMap(null);
                // //删除数组的某一个marker
                // addHotel_markArr.splice(this_index,1);
                addHotel_markArr[this_index] = null;
                // 删除存储酒店info的对应的数据
                addHotel_info_arr.splice(this_index,1)
                $(this).parents('.hotel_box').addClass('not_hotel').find('.day_hotel').html('当前暂未添加酒店')

                $('.msg_box').each(function (i,n) {
                    $(n).find('.wap:eq(' + this_index + ')').removeClass('disabled').removeClass('active');
                });
                //最后一个景点到酒店的距离
                var spot_Arr = _res_day_Arr[this_index].day
                var last_spot = spot_Arr[spot_Arr.length-1];
                if(last_spot){ //当天是否有景点
                    delete last_spot.traffic_distance
                    delete last_spot.traffic_time
                    delete last_spot.traffic_time_chinese;
                    var dis_data = {
                        day_index : this_index,
                        spot_index : spot_Arr.length-1,
                        dis:null,
                    }
                    //渲染距离交通
                    templateObj.dis_time_temFn(dis_data);
                }
                // console.log(_res_day_Arr)
            });
        },
        //酒店详情
        hotel_detailFn:function(){
            $('.hotel_con_rig').find('.list').unbind('click').on('click', '.name, .left_img', function () {
                var slider_len =_Daydate_arr.length
                var query = {};
                query.hotel_id = $(this).parents('.list').find('.name').attr('hotelId');
                query.arrival_date = _this_city_data.city_date;
                query.departure_date = getDateAfter_n(query.arrival_date,slider_len,'-');
                query.map_post = true;
                $.post('../store/getHotelDetail', query, function (res) {
                    if (!res) return false;
                    $(".hotel_details_popup_box").fadeIn();
                    // console.log(res)
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

                $(_res_day_Arr).each(function(i,ele){ //判断住店日期是否正确
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
                        
                        $(_res_day_Arr).each(function(i,ele){ //匹配新增的是哪天的酒店
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
                                newHotel.date =  _res_day_Arr[i].date;
                                newHotel.of_date =  _res_day_Arr[i].of_date;
                                newHotel.month_day =  _res_day_Arr[i].month_day;
                               
                                _res_day_Arr[i].hotel = newHotel;
                                // console.log(_res_day_Arr)
                                templateObj.add_hotel_temFn(i);
                                
                                //最后一个景点到酒店的距离
                                var lats_spot_arr = _res_day_Arr[i].day
                                var spot_li = $('.dayItem').eq(i).find('ul li:last-child');
                                var last_lat1 = Number(spot_li.attr("data-lat"));
                                if(last_lat1){
                                    var last_lng1 = Number(spot_li.attr("data-lng"));
                                    var hotel_lat = data.lat;
                                    var hotel_lng = data.lng;
                                    var lats_spot_dis = GetDistance(last_lat1,last_lng1, hotel_lat, hotel_lng);
                                    var dis = decimal(lats_spot_dis,1);// 向上取整 保留1位小数
                                    //计算时速
                                    var time_num =  initObj.dis_speedFn(dis);//time num
                                    var hours_time = initObj.disTimeFn(time_num); // time 小时
                                    var lats_spot = lats_spot_arr[lats_spot_arr.length-1]
                                    lats_spot.traffic_distance = dis //交通距离
                                    lats_spot.traffic_time= time_num //交通时间 num
                                    lats_spot.traffic_time_chinese = hours_time //交通时间 （小时
                                }
                                
                                var dis_data = {
                                    day_index : i,
                                    spot_index : lats_spot_arr.length-1,
                                    dis:dis,
                                    hours_time:hours_time
                                }
                                //渲染距离交通
                                templateObj.dis_time_temFn(dis_data);
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
        //hover 已添加 酒店
        hover_day_hotelFn:function(){
            $('.dayItem_box').find('.hotel_box').hover(function(){
                var this_index = $(this).parents('.dayItem').index();
                var data = addHotel_info_arr[this_index];
                if(!data)return
                mapObj.style_InfowindowFn(data, 'hotel_hover',45);
            },function(){
                //移除自定义窗口
                $('#map').find('.popup-content').each(function(){
                    $(this).remove()
                })
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
        //添加我想去动画
        addflyer: function (list, $this,is_new) {
            // console.log(is_new)
            $(".u-flyer").eq(0).remove();
            var img_src = is_new?$(list).find("img.address_cover").attr("src"): list.find("img").attr("src");
            // console.log( $(list).html())
            var city_postion = $this.offset();
            var left = city_postion.left
            var top = city_postion.top;
            var end_postion = $(".dap_top").eq(0).offset(),
                end_width = $(".dap_top").width() / 2,
                end_height = $(".dap_top").height() + 50;
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
            if (eat_name_arry != undefined) {
                for (var i = 0; i < eat_name_arry.length; i++) {
                    var add_eatname = eat_name_arry[i].this_name;
                    $(".js_rlist_ul .eat").each(function (a, n) {
                        if ($(n).find(".attractions_name").text() == add_eatname) {
                            $(".js_rlist_ul .eat").eq(a).addClass("city_list_go").find(".eat_go_button").addClass("go_button_gray").html("已添加");
                        }
                    })
                };
            }
        },

        //初始化已选的数据（展示marker 连线）push 到 addgo_arry
        init_dataFn:function(){
            var day_arr = _trc_res.result.day_arry;
            for(var i = 0;i<day_arr.length;i++){
                day_markerArr = [];//每天（一组）的marker
                //定义连线
                var FlightPath = new google.maps.Polyline({
                    strokeColor: i == 0?"#58b0fc":"#b3b3b3",
                    // strokeColor: "#b3b3b3",
                    strokeOpacity: 1,
                    strokeWeight: 4,
                });
                FlightPath.setMap(map);
                var FlightPath_arr = FlightPath.getPath(); //城市连线数组

                //酒店marker
                var hotel_data = day_arr[i].hotel
                if(hotel_data){
                   
                    var Category = hotel_data.Category;//类型 豪华.舒适.经济
                    var Score = hotel_data.Score;//评分
                    var comm = hotel_data.comm;//棒极了
                    var LowRate = hotel_data.LowRate;
                    var data = {
                        lat:Number(hotel_data.lat),
                        lng:Number(hotel_data.lng),
                        name:hotel_data.hotel_name,
                        Category:Category,Score:Score,comm:comm,
                        LowRate:'￥'+LowRate+'起',
                        index:i,
                        is_hover_hotel:true
                    }
                    mapObj.add_hotel_markerFn(data);
                    //存储map 酒店info 的数据
                    addHotel_info_arr[i] = data
                }
                var day = day_arr[i].day;
                for(var a = 0;a<day.length;a++){
                    var lat = Number(day[a].this_lat);
                    var lng = Number(day[a].this_lng);
                    var name = day[a].this_name;
                    var time = day[a].default_playtime;
                    var marker_data = {
                        lat: lat,
                        lng: lng,
                        lable_text:a == 0? 'D'+day_arr[i].hotel_day:Number(a+1).toString(),
                        name:name,
                        icon_url: i == 0?'spot_1':'spot_0',
                        // icon_url: 'spot_0',
                        playTime:'游玩时长'+time,
                        label_color: i == 0?"#7daff9":'#b3b3b3',
                        // label_color: '#b3b3b3',
                        dayItem_index:i
                    }
                    // console.log(marker_data)
                    mapObj.initMarkerFn(marker_data);
                    //连线
                    FlightPath_arr.push(new google.maps.LatLng(lat, lng));
                    //已添加的景点
                    addgo_arry.push(day[a])
                    //每天的第一个元素，加黑色自定义info
                    // if(a == 0){
                    //     // console.log(i)
                    //     var data = {
                    //         lat: lat,
                    //         lng: lng,
                    //         text:'Day'+Number(i+1),
                    //         index:i,
                    //         Class_name : "infoClass"
                    //     }
                    //     // console.log(infoDum_data);
                    //     // var infoID = 'info_DayNum'
                    //     // var day_Popup = createPopupClass(infoID,30);
                    //     // //自定义信息窗口 
                    //     // $("#map").append('<div class='+infoID+'>'+data.text+'</div>');
                    //     // $("#map").append('<div class='+infoID+'>'+data.text+'</div>')
                    //     // var is_id_Classs =  document.getElementsByClassName(infoID)[data.index]
                    //     // // console.log(is_id_Classs)
                    //     // var day_popup = new day_Popup(new google.maps.LatLng(data.lat, data.lng), is_id_Classs);
                    //     // day_popup.setMap(map);
                    //     mapObj.style_InfowindowFn(data,'is_DayNum',30);
                      
                    // }
                }
                day_polylineArr.push(FlightPath);//每天的连线
                allday_polyPathArr.push(FlightPath_arr)//每天(一组)的连线的path
                allday_markerArr.push(day_markerArr);
               
            }
            
        },
        //左边 nav 渲染事件
        left_nav_Fn:function(){
            //天数tab导航
            initObj.DayNumTab_fn();
            //景点 拖拽
            initObj.spot_dragFn();
            //删除每天的景点
            initObj.del_day_spot_Fn();
            //鼠标放在列表 dayItem 上
            initObj.hover_dayItemFn();
            // //计算游玩时间 加减
            initObj.playtimeFn();
            //hover 已添加 酒店
            initObj.hover_day_hotelFn();
            //删除酒店
            initObj.del_hotelFn();
            //点击美食icon 显示美食列表弹框
            initObj.food_list_Fn()
        },
        //天数tab导航
        DayNumTab_fn:function(){
            var day_len = _Daydate_arr.length;
            var li_width = $('.Dnum_ul').find('li:eq(0)').width()+16//16是margin值
            var Dnum_ul_width = day_len*li_width;
            $('.Dnum_ul').css({'width':Dnum_ul_width+'px'});
            //天数向左向右
            var num = 0,pos_px;
            $('.Dnum_but').on('click','.Dnum_left,.Dnum_right',function(){
                if($(this).hasClass('Dnum_right')){
                    if(num >= day_len-3)return
                    num++
                    pos_px = -num*li_width;
                    $('.Dnum_ul').css({'transform':'translateX('+pos_px+'px)'})
                }else{
                    if(num == 0 )return
                    num--
                    pos_px = -num*li_width;
                    $('.Dnum_ul').css({'transform':'translateX('+pos_px+'px)'})
                }
            });
            //滚动条定位
            $('.Dnum_ul').on('click','li',function(){
                $(this).addClass('active').siblings('li').removeClass('active')
                var i = $(this).index();
                var top =  $('#day'+i).position().top-15;
                $('.f_main').stop().animate({scrollTop:top}, 500);
            });
            //列表滚动
            $('.f_main').scroll(function(){
                var scrollPx;
                // console.log($('.f_main').scrollTop())
                // $('.dayItem_box').find('.dayItem').each(function(i,n){
                //     if( $('.f_main').scrollTop()>=$(n).position().top-172 && $('.f_main').scrollTop()<=$(n).position().top+30){
                //         // $('.Dnum_ul').find('li').eq(i).addClass('active').siblings('li').removeClass('active');
                //         if(i>day_len-3)return
                //         scrollPx = -i*li_width;
                //         $('.Dnum_ul').css({'transform':'translateX('+scrollPx+'px)'});
                //     }
                // })
            });
            //待安排
            $('.city_bottom .dap').on('click',function(){
                $('.f_main').stop().animate({scrollTop:$('.dap_top').position().top}, 500);
            });
        },
        //添加天数
        add_dayNun:function(){
            $('.Dnum_add').unbind('click').on('click',function(){
                // var str= '<div class="dayItem" id="day{{i}}">\
                //             <div class="day_nav">\
                //                 <div class="day_nav_top clearfix">\
                //                     <span class="fl item_Dnum">Day{{value.hotel_day}}</span>\
                //                     <div class="fr"><i class="del_icon"></i></div>\
                //                 </div>\
                //                 <div class="day_nav_bottom">\
                //                     <span class="day_date">{{value.date}}</span><span class="day_weeks">{{value.weeks}}</span><span>|</span><span class="day_betw_time">{{value.betw_time}}</span>\
                //                 </div>\
                //             </div>\
                //             <ul id="day_ul{{i}}" class="connectedSortable"> </ul>\
                //             <div class="hotel_box not_hotel clearfix">\
                //                 <div class="fl"><i class="hotel_ico"></i>当前暂未添加酒店</div><span class="fr">住</span>\
                //             </div>\
                //             <i class="js_dayI" data-start_time="{{value.start_time}}" data-end_time="{{value.end_time}}"  data-start_clock="{{value.start_clock}}" data-resultsTime="{{value.resultsTime}}"\
                //             data-month_day="{{value.month_day}}" data-of_date="{{value.of_date}}" data-playtimeNum="{{value.playtimeNum}}" data-reality_time="{{value.reality_time}}"\
                //             data-time="{{value.time}}" data-time1="{{value.time1}}" data-time2="{{value.time2}}" ></i>\
                //         </div>'

                // $(str).appendTo($('.dayItem_box').find('.dayItem').eq(_this_cityDay_num-2));
                // _this_cityDay_num += 1
            });
        },
        //景点拖拽
        spot_dragFn:function(){
            var ulId_arr = []
            $(_Daydate_arr).each(function(i,n){
                var ul_id = '#day_ul'+i 
                ulId_arr.push(ul_id)
            });
            // ulId_arr.push('#dap_ul')
            var ul_id_item = ulId_arr.join(',');
            $( ul_id_item ).sortable({ //cursorAt:{top:35,left:145}
                axis: "y",connectWith: ".connectedSortable",
                cursorAt:{top:30},
                // distance: 5,
                cancel: ".add_ico,.dow_ico,.delete_icon,.foodBox",
            },{
                //拖拽开始触发的事件
                start: function( event, ui ) {
                    startFn(event, ui)
                },
                //拖拽结束触发事件
                stop: function( event, ui ) {
                    stopFn(event, ui);
                },
            }).disableSelection();
            //拖拽开始
            function startFn (event, ui){
                ui.item.css({"height":"67","overflow": "hidden"});

                //清除连线标记
                for(var i = 0;i<allday_markerArr.length;i++){
                    var spot_marker = allday_markerArr[i];// 清除标记
                    for(var a = 0; a<spot_marker.length;a++){
                        spot_marker[a].setMap(null)// 清除标记
                    }
                    spot_marker = [];// 清除标记
                }

                for(var i = 0;i<allday_polyPathArr.length;i++){
                    var polyPathArr = allday_polyPathArr[i]//清除连线
                    for(var a = 0; a<polyPathArr.length;a++){
                        polyPathArr.removeAt(a)//清除连线
                    }
                    for(var a = 0; a<polyPathArr.length;a++){
                        polyPathArr.removeAt(a)//清除连线
                    }
                    polyPathArr = [];// 清除连线
                };
                allday_markerArr = []// 清除标记
                allday_polyPathArr = [];// 清除连线path
                day_polylineArr = [] // 清除连线
                // 清除黑色
                // $('.info_DayNum').each(function(){
                //     $(this).parents('.popup-info_DayNum').remove()
                //     $(this).remove()
                // })
            };
            //拖拽结束
            function stopFn (event, ui){
                var day_index = $(ui.item).parents('.dayItem').index()
                var dayItem_arry = []//所有天的数组(包含每天的景点);
                $('.dayItem_box').find('.dayItem').each(function(i,n){
                    var day_spot_arr = []
                    var spot_li = $(n).find('ul li');
                    var dayItem_obj = {}
                    $(spot_li).each(function(a,b){
                        var this_list = $(b);
                        var stored_data = $(b).find(".js_stored_data");
                        var addgo_obj = {};
                        addgo_obj.this_name = this_list.find('.name').text();
                        addgo_obj.this_lat = this_list.attr("data-lat");
                        addgo_obj.this_lng = this_list.attr("data-lng");
                        addgo_obj.this_img_src = stored_data.attr("data-this_img_src");
                        //最新（游玩）的时间（展示）
                        addgo_obj.this_playtime = this_list.find(".time_num").html();
                        //数据库适玩时间（初始时间）
                        addgo_obj.default_playtime = stored_data.attr("data-default_playtime");
                        addgo_obj.this_tag_time =  this_list.attr("data-this_tag_time");//计算的时间num
                        addgo_obj.this_floor_index = stored_data.attr("data-this_floor_index");
                        addgo_obj.this_type = stored_data.attr("data-this_type");
                        addgo_obj.ranking = stored_data.attr("data-ranking");
                        addgo_obj.period_time = stored_data.attr("data-period_time");
                        addgo_obj.not_modifity = stored_data.attr("data-not_modifity");
                        addgo_obj.js_sport_eat = stored_data.attr("data-js_sport_eat");
                        addgo_obj.business_hours = this_list.find('.js_bh').html();
                        addgo_obj.ticket_data = stored_data.attr("data-ticket_data");
                        addgo_obj.city_id = stored_data.attr("data-city_id");
                        //当前月可玩不可玩
                        addgo_obj.suit_season = stored_data.attr("data-suit_season");
                        
                        var dis = null,hours_time;
                        //景点之间的交通距离时间
                        if(a+1 < $(spot_li).length){
                            var lat1 = Number(spot_li.eq(a).attr("data-lat"))
                            var lng1 = Number(spot_li.eq(a).attr("data-lng"))
                            var lat2 = Number(spot_li.eq(a+1).attr("data-lat"))
                            var lng2 = Number(spot_li.eq(a+1).attr("data-lng"))

                            var spot_dis = GetDistance(lat1,lng1, lat2, lng2);
                            dis = decimal(spot_dis,1);// 向上取整 保留1位小数

                            //计算时速
                            var time_num =  initObj.dis_speedFn(dis);//time num
                            hours_time = initObj.disTimeFn(time_num); // time 小时
                            addgo_obj.traffic_distance = dis //交通距离
                            addgo_obj.traffic_time= time_num //交通时间 num
                            addgo_obj.traffic_time_chinese = hours_time //交通时间（小时
                        };
                        //最后一个景点到酒店的距离
                        if(a == $(spot_li).length-1){
                            if(!$('.dayItem').eq(i).find('.hotel_box').hasClass('not_hotel')){
                                var last_lat1 = Number(spot_li.eq(a).attr("data-lat"));
                                var last_lng1 = Number(spot_li.eq(a).attr("data-lng"));
                                var hotel_lat = Number(addHotel_info_arr[i].lat);
                                var hotel_lng = Number(addHotel_info_arr[i].lng);
                                var lats_spot_dis = GetDistance(last_lat1,last_lng1, hotel_lat, hotel_lng);
                                dis = decimal(lats_spot_dis,1);// 向上取整 保留1位小数
                                //计算时速
                                var time_num =  initObj.dis_speedFn(dis);//time num
                                hours_time = initObj.disTimeFn(time_num); // time 小时
                                addgo_obj.traffic_distance = dis //交通距离
                                addgo_obj.traffic_time= time_num //交通时间 num
                                addgo_obj.traffic_time_chinese = hours_time //交通时间（小时
                            }
                           
                        }
                        var dis_data = {
                            day_index : i,
                            spot_index : a,
                            dis:dis,
                            hours_time:hours_time
                        }
                        templateObj.dis_time_temFn(dis_data) 
                        
                        //美食
                        if($(this).find('.foodBox').attr('data-food_index')){
                            var getAttr = $(this).find('.foodBox').attr('data-food_index').split('_');
                            var day_index = getAttr[0];
                            var spot_index = getAttr[1]
                            addgo_obj.eat_info = food_res_dayArr[day_index].day[spot_index].eat_info
                        }
                        day_spot_arr.push(addgo_obj)
                    });
                    dayItem_obj.day = day_spot_arr;
                    dayItem_obj.hotel_day = Number($(n).find('.item_Dnum').html().split('Day')[1]);
                    dayItem_obj.betw_time = $(n).find('.day_betw_time').html();
                    dayItem_obj.date = $(n).find('.day_date').html();
                    dayItem_obj.weeks = $(n).find('.day_weeks').html();
                    if(_res_day_Arr[i].hotel){
                        dayItem_obj.hotel = _res_day_Arr[i].hotel;
                    }
                    var dayItem_i = $(n).find('.js_dayI');
                    dayItem_obj.start_time = dayItem_i.attr('data-start_time');
                    dayItem_obj.end_time = dayItem_i.attr('data-end_time');
                    dayItem_obj.start_clock = dayItem_i.attr('data-start_clock');
                    dayItem_obj.resultstime = dayItem_i.attr('data-resultstime');
                    dayItem_obj.month_day = dayItem_i.attr('data-month_day');
                    dayItem_obj.of_date = dayItem_i.attr('data-of_date');
                    dayItem_obj.playtimenum = dayItem_i.attr('data-playtimenum');
                    dayItem_obj.reality_time = dayItem_i.attr('data-reality_time');
                    dayItem_obj.time = dayItem_i.attr('data-time');
                    dayItem_obj.time1 = dayItem_i.attr('data-time1');
                    dayItem_obj.time2 = dayItem_i.attr('data-time2');
                    //大交通
                    var traffictimeNum = _res_day_Arr[i].traffictimeNum;
                    var traffic_timeSum = _res_day_Arr[i].traffic_timeSum;
                    var transport = _res_day_Arr[i].transport;
                    var one_city = _res_day_Arr[i].one_city;
                    var two_city = _res_day_Arr[i].two_city;
                    if(traffictimeNum){
                        dayItem_obj.traffictimeNum = traffictimeNum;
                    }
                    if(traffic_timeSum){
                        dayItem_obj.traffic_timeSum = traffic_timeSum;
                    }
                    if(transport){
                        dayItem_obj.transport = transport;
                    }
                    if(one_city){
                        dayItem_obj.one_city = one_city;
                    }
                    if(two_city){
                        dayItem_obj.two_city = two_city;
                    }
                    dayItem_arry.push(dayItem_obj);
                });

                _res_day_Arr = dayItem_arry //所有天的数组(包含每天的景点);
                // console.log(_res_day_Arr);
                
                for(var i = 0;i<dayItem_arry.length;i++){
                    //定义连线
                    var FlightPath = new google.maps.Polyline({
                        strokeColor: "#b3b3b3",
                        strokeOpacity: 1,
                        strokeWeight: 4,
                    });
                    FlightPath.setMap(map);
                    var FlightPath_arr = FlightPath.getPath(); //城市连线数组

                    day_markerArr = [];//每天（一组）的marker
                    var spot_arr =  dayItem_arry[i].day;
                    for(var a = 0;a <spot_arr.length; a++){
                        var spot_item =  spot_arr[a];
                        var lat = Number(spot_item.this_lat);
                        var lng = Number(spot_item.this_lng);
                        var name = spot_item.this_name;
                        var time = spot_item.this_playtime
                        var marker_data = {
                            lat: lat,
                            lng: lng,
                            name:name,
                            lable_text: a == 0?'D'+(i+1):(a+1).toString(),
                            icon_url:'spot_0',
                            playTime:'游玩时长'+time,
                            label_color: '#b3b3b3',
                            dayItem_index:i
                        };
                        mapObj.initMarkerFn(marker_data);
                        //连线
                        FlightPath_arr.push(new google.maps.LatLng(lat, lng)); 
                        // 添加黑色info
                        // if(a == 0){
                        //     var data = {
                        //         lat: lat,
                        //         lng: lng,
                        //         text:'Day'+Number(i+1),
                        //         index:i,
                        //         Class_name : "infoClass",
                        //     }
                        //     mapObj.style_InfowindowFn(data,'is_DayNum',30);
                        // } 
                    }
                   
                    day_polylineArr.push(FlightPath);//每天的连线
                    allday_polyPathArr.push(FlightPath_arr)//每天(一组)的连线的path
                    allday_markerArr.push(day_markerArr);
                };
              
                mapObj.marlker_poly_colorFn(day_index,'#58b0fc','spot_1') 
                //鼠标放在列表 dayItem 上和景点上
                initObj.hover_dayItemFn();
                //删除每天的景点
                initObj.del_day_spot_Fn();
                
                //删除酒店
                initObj.del_hotelFn();
            }
        },
        //待安排 拖拽
        dap_dragFn:function(){
           
            $( "#dap_catalog" ).accordion();
            $( "#dap_catalog li" ).draggable({
                axis: "y", 
                appendTo: ".dayItem_box",
                helper: "clone",
                cancel: ".play_t,.play_d,.delete_icon",
                drag: function( event, ui ) {
                    $( "#spot_cart ul" ).each(function(i,n){
                        var this_li_len = $(n).find('li').length;
                        // console.log(i)
                        $(n).css({'min-height': this_li_len*100+70+"px"})
                    })
                },
                stop: function( event, ui ) {
                    $( "#spot_cart ul" ).css({'min-height':"5px"})
                }
            });
            $( "#spot_cart ul" ).droppable({
                activeClass: "ui-state-default",
                hoverClass: "ui-state-hover",
                accept: ":not(.ui-sortable-helper)",
                activate:function(event, ui ){
                    // $( "#spot_cart ul" ).css({'min-height':"70px"});
                    var this_li_len = $(this).find('li').length;
                
                    // $( "#spot_cart ul" ).css({'min-height': this_li_len*100+70+"px"})
                    // $( "#spot_cart ul" ).each(function(i,n){
                    //     console.log(i)
                    //     // console.log(this_li_len*100+70+"px")
                    //     // $(n).css({'min-height': this_li_len*100+70+"px"})
                    // })
                },
                over:function( event, ui ){
                    
                    // var this_li_len = $(this).find('li').length
                    // $( "#spot_cart ul" ).css({'min-height': this_li_len*100+70+"px"})
                },
                drop: function( event, ui ) {
                //  $( "<li></li>" ).text( ui.draggable.text() ).appendTo( this );
                    //ui 是要放置的景点列表，this是接收要放置的景点列表的 ul
                    dropFn(event, ui,this)
                    // $( "#spot_cart ul" ).css({'min-height':"5px"})
                }
            }).sortable({
                // items: "li:not(.placeholder)",
                sort: function() {
                    // 获取由 droppable 与 sortable 交互而加入的条目
                    // 使用 connectWithSortable 可以解决这个问题，但不允许您自定义 active/hoverClass 选项
                    // $( this ).removeClass( "ui-state-default" );
                }
            });
            function dropFn(event, ui,$this){
                var index = ui.draggable.index();
                var this_add_spot =  newGo_arr[index];//新添加的数组的对应的景点数据
                var droplist = ui.draggable
                var lat = Number(droplist.attr('data-lat'));
                var lng = Number(droplist.attr('data-lng'));
                var name = droplist.find('.p1').html();
                var this_tag_time = this_add_spot.this_tag_time;
                var business_hours = this_add_spot.business_hours;
                var str = '<li class="spot_list ui-sortable-handle" data-lat="'+lat+'" data-lng="'+lng+'" data-this_tag_time="' + this_tag_time + '" >\
                            <div class="spot_box clearfix">\
                                <i class="delete_icon"></i>\
                                <div class="div1 clearfix">\
                                    <span class="name fl" title="'+name+'">'+name+'</span>\
                                    <div class="fr time_div">\
                                        <span class="time_num">'+this_add_spot.this_playtime+'</span>\
                                        <div class="tiem_ico"><i class="add_ico"></i><i class="dow_ico"></i></div>\
                                    </div>\
                                </div>\
                                <div class="div2 clearfix">\
                                    <span class="fl">开放时间:</span><span class="fl js_bh">'+business_hours+'</span>'
                                    if(this_add_spot.this_floor_index == 4){
                                        str +='<span class="fr">购</span>'
                                    }else{
                                        if(this_add_spot.this_type == '必吃美食'||this_add_spot.this_type == '本土美食'){
                                            str +='<span class="fr">食</span>'
                                        }else{
                                            str +='<span class="fr">景</span>'
                                        }
                                    }
                                    
                            str +='</div>\
                            </div>\
                            <div class="spot_trc_box"><i class="trc_ico" data-traffic_time="0"></i><span class="js_disKm">0</span>km·<span class="js_trcTime">0分钟</span></div>\
                            <i class="dis_none js_stored_data" data-city_id="'+this_add_spot.city_id+'" data-default_playtime="'+this_add_spot.default_playtime+'"\
                            data-js_sport_eat="'+this_add_spot.js_sport_eat+'" data-not_modifity="'+this_add_spot.not_modifity+'"\
                            data-ranking="'+this_add_spot.ranking+'" data-suit_season="'+this_add_spot.suit_season+'" data-this_img_src="'+this_add_spot.this_img_src+'"\
                            data-this_type="'+this_add_spot.this_type+'" data-ticket_data="'+this_add_spot.ticket_data+'"\
                            data-period_time="'+this_add_spot.period_time+'" data-this_floor_index="'+this_add_spot.this_floor_index+'" ></i>\
                        </li>'
                $(str).appendTo( $this );
                //向当前行程对应的天数push当前拖拽进去的数据
                var day_index = Number($($this).attr('id').split('day_ul')[1]);
                var last_day_spot = _res_day_Arr[day_index].day
                last_day_spot.push(this_add_spot);
                var this_list_len = $($this).find('li').length
                // console.log(_res_day_Arr);
                var marker_data = {
                    lat: lat,
                    lng: lng,
                    lable_text:this_list_len == 1? 'D'+(day_index+1):this_list_len.toString() ,
                    name:name,
                    icon_url:'spot_0',
                    playTime:'游玩时长'+this_tag_time+'小时',
                    label_color: '#b3b3b3',
                    dayItem_index:day_index
                }
                mapObj.initMarkerFn(marker_data,'is_dap_drag');
                //连线
                var FlightPath = day_polylineArr[day_index].getPath()
                FlightPath.push(new google.maps.LatLng(lat, lng))
                
                var dis = null,hours_time; 
                //新添加的景点与景点之间的距离
                for(var a = 0;a<last_day_spot.length;a++){
                    if(a+1 < last_day_spot.length){
                        var lat1 = Number(last_day_spot[a].this_lat)
                        var lng1 = Number(last_day_spot[a].this_lng)
                        var lat2 = Number(last_day_spot[a+1].this_lat)
                        var lng2 = Number(last_day_spot[a+1].this_lng)

                        var spot_dis = GetDistance(lat1,lng1, lat2, lng2);
                        dis = decimal(spot_dis,1);// 向上取整 保留1位小数
                        
                        //计算时速
                        var time_num =  initObj.dis_speedFn(dis);//time num
                        hours_time = initObj.disTimeFn(time_num); // time 小时
                        last_day_spot[a].traffic_distance = dis //交通距离
                        last_day_spot[a].traffic_time= time_num //交通时间 num
                        last_day_spot[a].traffic_time_chinese =  hours_time //交通时间（小时
                    };
                    if(a == last_day_spot.length-1){
                        //最后一个景点到酒店的距离，
                        if(!$('.dayItem_box').find('.dayItem').eq(day_index).find('.hotel_box').hasClass('not_hotel')){
                          
                            var last_lat1 = Number(last_day_spot[a].this_lat);
                            var last_lng1 = Number(last_day_spot[a].this_lng);
                            var hotel_lat = Number(addHotel_info_arr[day_index].lat);
                            var hotel_lng = Number(addHotel_info_arr[day_index].lng);
                            var lats_spot_dis = GetDistance(last_lat1,last_lng1, hotel_lat, hotel_lng);
                            dis = decimal(lats_spot_dis,1);// 向上取整 保留1位小数
                            //计算时速
                            var time_num =  initObj.dis_speedFn(dis);//time num
                            hours_time = initObj.disTimeFn(time_num); // time 小时
                            last_day_spot[a].traffic_distance = dis //交通距离
                            last_day_spot[a].traffic_time= time_num //交通时间 num
                            last_day_spot[a].traffic_time_chinese = hours_time  //交通时间（小时
                        }else{
                            dis = null
                            delete last_day_spot[a].traffic_distance 
                            delete last_day_spot[a].traffic_time
                            delete last_day_spot[a].traffic_time_chinese 
                        }
                    }
                   
                    var dis_data = {
                        day_index :day_index,
                        spot_index : a,
                        dis:dis,
                        hours_time:hours_time
                    }
                    //渲染距离交通
                    templateObj.dis_time_temFn(dis_data);
                }

                //删除当天里的景点
                initObj.del_day_spot_Fn();
                //鼠标放在列表 dayItem 上和景点上
                initObj.hover_dayItemFn();
                // //计算游玩时间 加减
                initObj.playtimeFn();
                // 删除对应的待安排
                $('.dap_ul').find('li').eq(index).remove()
                //删除新添加数组中对应的数据
                newGo_arr.splice(index,1)
                // //删除酒店
                initObj.del_hotelFn();
           
                //当天只有一个景点
                // if(this_list_len == 1){
                //     //重新添加黑色info 重新添加
                //     mapObj.del_hei_info();
                // }
                
                
               
            }
        },
        //hover 待安排列表上
        hover_dapList_fn:function(){
            $('.dap_ul').find('li').unbind('hover').hover(function(){
                var lat = Number($(this).attr('data-lat'));
                var lng = Number($(this).attr('data-lng'));
                var name = $(this).find('._r .p1').html();
                var index = $(this).index()
                var floor_index = newGo_arr[index].this_floor_index;
                var icon_url = floor_index == ''?'qt':floor_index
                var pos={lat:lat,lng:lng};
                mapObj.hoverMarker(icon_url,pos)
                var infoData = {
                    name:name,
                    lat:lat,
                    lng:lng,
                    playTime:'游玩时长'+$(this).find('.time_num').html()
                }
                mapObj.style_InfowindowFn(infoData,"spot_hover",45)
            },function(){
                $('#map').find('.popup-content').each(function(){
                    $(this).remove()
                })
                hover_Marker.setMap(null)
            })
        },
        //待安排 景点列表 删除
        del_dapListFn:function(){
            $('.dap_ul li').find('.delete_icon').unbind('click').on('click',function(){
                var list = $(this).parents("li");
                var this_index = list.index();
                var del_name = list.find('._r .p1').html();
                $(".js_rlist_ul li").each(function (i, n) {
                    var list_name = $(n).find(".attractions_name").text();
                    if (del_name == list_name) {
                        $(".js_rlist_ul li").eq(i).removeClass("city_list_go").find(".go_button").removeClass("go_button_gray").html("我想去");
                    }
                })
                list.remove();
                newGo_arr.splice(this_index, 1);
                //移除自定义窗口
                $('#map').find('.popup-content').each(function(){
                    $(this).remove()
                });
                //删除addgo_arrys数组中对应的景点
                for (var i = 0; i < addgo_arry.length; i++) {
                    if(addgo_arry[i].this_name == del_name){
                        addgo_arry.splice(i,1)
                    }
                };
                // console.log(addgo_arry)
            })
        },
        //鼠标放在列表 dayItem 上和景点上
        hover_dayItemFn:function(){
            var day_index;
            $('.dayItem').unbind('hover').hover(function(){
                day_index = $(this).index();
                
                // 改变marker 连线的颜色
                mapObj.marlker_poly_colorFn(day_index,'#58b0fc','spot_1')
               
            },function(){
             
                mapObj.marlker_poly_colorFn(day_index,'#b3b3b3','spot_0')
              
                
            });
            //hover 景点上
            $('.dayItem').find('.spot_box').unbind('hover').hover(function(){
                var list = $(this).parents('li')
                var name = $(this).find('.name').html();
                var lat = Number(list.attr('data-lat'));
                var lng = Number(list.attr('data-lng'));
                var time =  list.find('.time_num').html()
                var data = {
                    lat: lat,
                    lng: lng,
                    name:name,
                    playTime:'游玩时长'+time,
                };
                mapObj.style_InfowindowFn(data, 'spot_hover',30);
            },function(){
                //移除自定义窗口
                $('#map').find('.popup-content').each(function(){
                    $(this).remove()
                });
                
            });
            //鼠标放在黑色info上
            // initObj.hover_hei_info()
        },
        //点击美食icon 显示美食列表弹框
        food_list_Fn:function(){
            var day_index,spot_index,this_foodBox;
            $('.dayItem').find('.foodBox').on('click',function(){
                this_foodBox = $(this)
                var getAttr = this_foodBox.attr('data-food_index').split("_")
                day_index = getAttr[0];
                spot_index = getAttr[1]
                var res_eatinfo = food_res_dayArr[day_index].day[spot_index];
                var this_spot_name = this_foodBox.parents('.spot_list').find('.name').text()
                $('.food_box .food_title').text(this_spot_name+'附近的餐厅')
                $('.food_box').fadeIn()
                //美食弹框渲染
                templateObj.food_popu_listFn(res_eatinfo,day_index,spot_index);
                //hover food 列表
                $('.food_ul').find('li').hover(function(){
                    var food_index = $(this).index();
                    var food_data = food_res_dayArr[day_index].day[spot_index].eat_info[food_index];
                    var lat = Number(food_data.lat);
                    var lng = Number(food_data.lng);
                    var name = food_data.name;
                    var pos={lat:lat,lng:lng};
                    mapObj.hoverMarker(3,pos)
                    var infoData = {
                        name:name,
                        lat:lat,
                        lng:lng,
                        playTime:'用餐'+food_data.meal_time
                    }
                    mapObj.style_InfowindowFn(infoData,"spot_hover",45)
                },function(){
                    //清空hover marker
                    mapObj.del_hover_Marker()
                    $('#map').find('.popup-content').each(function(){
                        $(this).remove()
                    })
                })   
            });
            //美食删除
            $('.food_ul').on('click','.delete_icon',function(){
                var food_index = $(this).parents('li').index();
                $(this).parents('li').remove();
                food_res_dayArr[day_index].day[spot_index].eat_info.splice(food_index,1);
                // console.log(food_res_dayArr)
                if($('.food_ul').find('li').length == 0){
                    $('.food_box').fadeOut()
                    this_foodBox.remove()
                }
            });
            //隐藏
            $('.X_icon').on('click',function(){
                $('.food_box').fadeOut().find('.food_ul').html('')
            })
        },
        //鼠标放在黑色info上
        hover_hei_info:function(){
            //鼠标放在黑色info
            timer =  setTimeout(function(){
                $('#map').find('.info_DayNum').unbind('hover').hover(function(e){
                    var index = Number($(this)[0].innerHTML.split('Day')[1])-1
                    mapObj.marlker_poly_colorFn(index,'#58b0fc','spot_1')
                    
                },function(){
                    var index = Number($(this)[0].innerHTML.split('Day')[1])-1
                    mapObj.marlker_poly_colorFn(index,'#b3b3b3','spot_0')
                })
            },1000)
        },
        //登录/注册
        loginFn: function () {
            $(".mainBox").fadeIn().removeClass("dis_none");
            // 校验是否有汉字
            var zhReg = /[\u4e00-\u9fa5]+/;
            var phoneReg = /^[1][3-8]+\d{9}/;
            var passWorldReg = /^[a-zA-Z0-9]{6,12}$/;
            var countdown = 60; /*重新发送短信倒计时*/
            var canSend = true; /*是否能发送验证码*/
            var checkUserTimer; /*用户名延迟校验定时器*/
            var checkPhoneTimer; /*用户名延迟校验定时器*/
            var phonePass, passWorldPass, userPass = false; /*用户名是否通过*/
            var checkWorldTimer; /*密码延迟校验定时器*/
            var picvige = false;
            $('.listWap .erwm').on('click', function () {
                $(this).hide().siblings('.code').show();
                $('.listWap .normal').hide().siblings('.erwmBox').show();
            });
            $('.listWap .code,.to-passWorld').on('click', function () {
                $('.listWap .wap1 .code').hide().siblings('.erwm').show();
                $('.listWap .erwmBox').hide().siblings('.normal').show();
            });
            $('.listWap .register,.to-register').on('click', function () {
                $('.listWap').hide().addClass("dis_none").siblings('.registerWap').show().removeClass("dis_none");
            });
            $(".registerWap .js_list1a").on("click", function () {
                $('.registerWap').hide().addClass("dis_none").siblings('.listWap').show().removeClass("dis_none");
            });
            $('.registerWap  .agree').on('click', function () {
                $('.agreementMask').fadeIn();
                $('.loginBox').fadeOut();
            });
            $('.registerWap .phone').on('input', function () {
                $(this).val($(this).val() > 11 ? $(this).val().slice(0, 11) : $(this).val());
            });
            $('.jsuser,#phone,.jspassWorld').on('focus', function () {
                $(this).addClass('active').prev('label').addClass('active');
            }).on('blur', function () {
                $(this).removeClass('active').prev('label').removeClass('active');

            });
            $('.agreementMask .agreeBtn,.close').on('click', function () {
                $('.agreementMask').fadeOut();
                $('.loginBox').fadeIn().removeClass("dis_none");
            });
            $(".loginBox .close").on("click", function () {
                $(".mainBox").fadeOut().addClass("dis_none");
            });
            //-----------------登录-------------------------
            $('.listWap .wap4 .login').on('click', function () {
                login()
            });

            function login() {
                var userName = $('#login_user').val().trim();
                var passWorld = $('#login_passWorld').val().trim();

                if (!(userName && passWorld)) {
                    alert("请将信息填写完整");
                    return
                };
                var postData = {};
                postData.user_name = userName;
                postData.pwd = passWorld;

                $.post('../login/do_login', postData, function (data) {
                    // console.log(data);
                    if (data.error_code != false || data.msg != 'OK') {
                        alert(data.msg);
                        return false;
                    } else {
                        //登录成功
                        initObj.nextPost_Fn()
                    }
                }, 'json');
            };


            // ----------------------注册-------------------------
            //验证码
            var handlerEmbed = function (captchaObj) {
                captchaObj.appendTo("#embed-captcha");

                captchaObj.onSuccess(function(){
                    picvige = true;
                })

                captchaObj.onReady(function () {
                    $("#wait").css({'display':'none'});
                });
                captchaObj.onError(function () {
                    alert('验证失败请刷新重试！')
                });
            };

            $.ajax({
                // 获取id，challenge，success（是否启用failback）
                url: "../login/StartCaptchaServlet?t="+ (new Date()).getTime(), // 加随机数防止缓存
                type: "get",
                dataType: "json",
                success: function (data) {
                    // 使用initGeetest接口
                    // 参数1：配置参数
                    // 参数2：回调，回调的第一个参数验证码对象，之后可以使用它做appendTo之类的事件
                    initGeetest({ //验证拖拽图片插件（/static/common/js/gt.js
                        width:'100%',
                        gt: data.gt,
                        challenge: data.challenge,
                        new_captcha: data.new_captcha,
                        product: 'popup', // 产品形式，包括：float，embed，popup。注意只对PC版验证码有效
                        offline: !data.success // 表示用户后台检测极验服务器是否宕机，一般不需要关注
                    }, handlerEmbed);
                }
            });
            $('.phoneCode .sendCode').on('click', function () {
                var phoneNumber = $('.registerWap #phone').val().trim();
                if(!picvige){
                    alert('请完成图形验证再发验证码')
                    return false;
                }
                var geetest_challenge = $.trim($("input[name=geetest_challenge]").val());
                var geetest_validate = $.trim($("input[name=geetest_validate]").val());
                var geetest_seccode = $.trim($("input[name=geetest_seccode]").val());
                if (canSend && phonePass) {
                    $(this).addClass('disabled')
                    settime($(this))
                    $.post('../login/GenerateForReg', {
                        'phone': phoneNumber,
                        'geetest_challenge':geetest_challenge,
                        'geetest_validate':geetest_validate,
                        'geetest_seccode':geetest_seccode
                    }, function (data) {
                        // console.log(data)
                        switch (data.error_code) {
                            case 1:
                                alert(data.msg)
                                break;
                            case 2:
                                alert('验证过于频繁,请稍后再试')
                                break;
                        }
                    }, 'json');
                };
            });
            //用户名验证
            $('#reg_user').on('input', function () {
                $(this).prev('label').removeClass('error');
                userPass = false;
                var _self = this;
                clearTimeout(checkUserTimer);
                checkUserTimer = setTimeout(function () {
                    userPass = true;
                    var userStr = $(_self).val();
                    if (userStr.indexOf(' ') != -1) {
                        $(_self).prev('label').addClass('error').find('.errInfo').text('用户名不能有空格');
                        userPass = false;
                        return;
                    }
                    if (zhReg.test(userStr)) {
                        if (userStr.length && (userStr.length > 8 || userStr.length < 2)) {
                            userPass = false;
                            $(_self).prev('label').addClass('error').find('.errInfo').text('用户名必须是，2-8汉字/4-16字符');
                        }
                    } else {
                        if (userStr.length && (userStr.length > 16 || userStr.length < 4)) {
                            userPass = false;
                            $(_self).prev('label').addClass('error').find('.errInfo').text('用户名必须是，2-8汉字/4-16字符');
                        }
                    }
                    clearTimeout(checkUserTimer);
                }, 1000)
            });
            // 手机号码验证
            $('#phone').on('input', function () {
                $(this).prev('label').removeClass('error');
                phonePass = false;
                var _self = this;
                clearTimeout(checkPhoneTimer);
                checkPhoneTimer = setTimeout(function () {
                    phonePass = true;
                    var phoneStr = $(_self).val() - 0;
                    // console.log(phoneReg.test(phoneStr))
                    if (!phoneReg.test(phoneStr)) {
                        phonePass = false;
                        $(_self).prev('label').addClass('error').find('.errInfo').text('请输入正确手机号码');
                    }
                    clearTimeout(checkPhoneTimer)
                }, 1000)
            });
            //密码验证 
            $('#reg_passWorld').on('input', function () {
                $(this).prev('label').removeClass('error');
                passWorldPass = false;
                var _self = this;
                clearTimeout(checkWorldTimer);
                checkWorldTimer = setTimeout(function () {
                    passWorldPass = true;
                    var passWorld = $(_self).val() + '';
                    if (passWorld.length < 6) {
                        passWorldPass = false;
                        $(_self).prev('label').addClass('error').find('.errInfo').text('密码需大于等于6位');
                    }
                    clearTimeout(checkWorldTimer)
                }, 1000)
            });

            $('.go_register').on('click', function () {
                register()
            });
            document.onkeydown = function (e) {
                var theEvent = e || window.event;
                var code = theEvent.keyCode || theEvent.which || theEvent.charCode;
                if (code == 13) {
                    if (!$(".mainBox").hasClass("dis_none")) {
                        if (!$(".listWap").hasClass("dis_none")) {
                            login();
                            return
                        };
                        if (!$(".registerWap").hasClass("dis_none")) {
                            register()
                        }
                    }
                };
            };

            function register() {
                if (phonePass && passWorldPass && userPass && ($('#phoneCode').val() != '')) {
                    var psotData = {};
                    psotData.phone = $('#phone').val().trim();
                    psotData.user_name = $('#reg_user').val().trim();
                    psotData.pwd = $('#reg_passWorld').val().trim();
                    psotData.vfycode = $('#phoneCode').val().trim();
                    $.post('../login/register_request', psotData, function (data) {
                        // console.log(data);
                        switch (data.error_code) {
                            case false:
                                // window.location.href = 'login.html'
                                initObj.nextPost_Fn()
                                // $('.registerWap').hide().addClass("dis_none").siblings('.listWap').show().removeClass("dis_none");
                                break;
                            case true:
                                alert(data.msg);
                                break;
                            case 2:
                                alert('验证过于频繁,请稍后再试')
                                break;
                        }
                    }, 'json')
                } else {
                    alert("请将信息填写完整")
                }
            }

            function settime(obj) {
                if (countdown <= 0) {
                    obj.removeClass("disabled");
                    obj.text("获取验证码");
                    countdown = 60;
                    canSend = true;
                    return;
                } else {
                    canSend = false;
                    obj.addClass("disabled");
                    obj.text('重新发送(' + countdown + ')');
                    countdown--;
                }
                setTimeout(function () {
                    settime(obj)
                }, 1000)
            }
        },
        //计算时速
        dis_speedFn:function(dis){
            var time;
            //距离 >80,60公里/小时, 距离<=80,时速30公里/小时, 距离小于5公里,步行，时速5公里/小时
            if(dis>80){
                time = dis/60
            }else if(dis <= 80 && dis >=5 ){
                time = dis/30
            }else{
                time = dis/5
            }
            return time.toFixed(1)
        },
        //计算距离时间返回的是具体分钟
        disTimeFn:function(trc_time){
            var time = Number(trc_time);
            if(time<1){
                time = time * 60+'分钟'
            }else{
                time = time.toString().split('.')
                if(time[1]){
                    time=Number(time[1]) * 60 == 0?Number(time[0])+'小时':Number(time[0])+'小时'+(Number(time[1]) * 6)+'分钟'
                }else{
                    time = Number(time[0])+'小时'
                }
            }
           
            return time
        },
        //计算游玩时间
        playtimeFn:function(){
            $('.dap_ul,.dayItem').find('li').unbind('click').on('click','.play_t,.play_d,.add_ico,.dow_ico',function(){
                var time_num = Number($(this).parents('li').attr('data-this_tag_time'));
                if($(this).hasClass('play_t')||$(this).hasClass('add_ico')){
                    time_num = time_num <8 ? time_num += 0.5 :8;
                    //总时间
                    // initObj.all_play_timeFn('add',0.5)
                }else{
                    time_num = time_num >0.5 ? time_num -= 0.5 :0.5;
                    //总时间
                    // initObj.all_play_timeFn('sub',0.5)
                };
                var time_txt = time_num == 8? '1天' : time_num+'小时'
                $(this).parents('li').find('.time_num').html(time_txt);
                $(this).parents('li').attr('data-this_tag_time',time_num);

                var index = $(this).parents('li').index();
                if($(this).hasClass('play_t') || $(this).hasClass('play_d')){
                    newGo_arr[index].this_tag_time = time_num;
                    newGo_arr[index].this_playtime = time_txt;
                    // console.log(newGo_arr);
                }else{
                    var day_index = $(this).parents('.dayItem').index()
                    _res_day_Arr[day_index].day[index].this_tag_time = time_num;
                    _res_day_Arr[day_index].day[index].this_playtime = time_txt;
                    // console.log(_res_day_Arr)
                }   
                
                
               
            });
        },
        //下一步
        next_fn:function(){
            //判断是否登陆(正常流程)
            $('.normal_next').on('click',function(){
                // 待安排 提醒
                if(newGo_arr.length != 0){
                    $('.prompt_c').show();
                    $('.prompt_det').on('click',function(){
                        $('.prompt_c').hide();
                        det_nextFn()
                    })
                }else{
                    det_nextFn()
                }
                function det_nextFn(){
                    //判断是不是最后一个城市
                    var is_last_city = Number(this_city_index)==_res_r_spot.go_city_array.length-1;
                    if(is_last_city){
                        //判断有没有登录
                        $.post("login_name",  function (data) {
                            // console.log(data)
                            if (data == null) {
                                initObj.loginFn()
                            } else {
                                initObj.nextPost_Fn()
                            };
                        }, "json")
                    }else{
                        initObj.nextPost_Fn();
                    };
                }
                
            });
            $('.prompt_cancel').click(function(){
                $('.prompt_c').hide();
            })
        },
        //下一步 整理数据
        nextPost_dataFn:function(){
            var post_data = {},singcityData={};
            post_data.across_city = _res_r_spot.across_city//是否跨城
            post_data.cityArray = _res_r_spot.cityArray//城市数组
            //表单
            post_data.adult = $('.wap2_adult_num').html()//成人人数
            post_data.children = $('.wap2_childrent_num').html() //儿童人数
            post_data.cover =  $('.upload_box .bgImg').attr('src')//封面
            post_data.date = $('.madeTravel #wap3_date').val() //日期
            post_data.title = $('.madeTravel #trc_title').val().trim().replace(/\s/g,"");//行程标题
            post_data.day_num = _res_r_spot.day_num;//行程总天数
            post_data.return_city = _res_r_spot.return_city
            post_data.departure_city = _res_r_spot.departure_city;
            
            post_data.go_city_array = _res_r_spot.go_city_array //添加我想去的城市
            post_data.next_city_day0 = _res_r_spot.next_city_day0 //当前城市是否为0天

            var res_result = _trc_res.result;
            singcityData.day_arry = _res_day_Arr //我想去的元素
            singcityData.eat_len = res_result.eat_len //吃的个数
            singcityData.shop_len = res_result.shop_len //购物的个数
            singcityData.spot_len = res_result.spot_len //景点的个数
            singcityData.this_city = res_result.this_city //当前城市名字
            singcityData.this_city_lat = res_result.this_city_lat 
            singcityData.this_city_lng = res_result.this_city_lng 
            singcityData.this_city_index = this_city_index ;
            post_data.singcityData = singcityData;
            return post_data
        },
        // 下一步 post请求
        nextPost_Fn:function(){
            var post_data = initObj.nextPost_dataFn()
            // console.log(post_data)
            var is_last_city = Number(this_city_index)==_res_r_spot.go_city_array.length-1;
            if(is_last_city){
                $('.plan_mask').show()
            }
            $.ajax({
                url: '/portal/Itinerary/overview',
                type: "post",
                dataType: "json",
                contentType:"application/json;charset=utf-8",
                data:JSON.stringify(post_data), 
                success: function (res) {
                    // console.log(res)
                    if(!res.status) return
                    if(!is_last_city){ //判断时候是最后一个城市
                        sessionStorage.setItem("this_city_index",this_city_index+1);
                        //清除刚开始进入到这个页面的 后退存储
                        sessionStorage.removeItem("is_spot_back")
                        window.location.href = "/portal/scenerymap/cityAttractions.html"
                    }else{
                        window.location.href ='/portal/itinerary/books.html?them='+res.data.uid+'&trip='+res.data.trip_id
                    }
                   
                }
            })
        },
        //编辑 查看行程单
        edit_nextFn:function(){
            $('.edit_next').unbind('click').on('click',function(){
                var post_data = initObj.nextPost_dataFn();
                post_data.push_type =  'look';
                post_data.uid =  getCookie('uid'); 
                post_data.trip_id =  sessionStorage.trip_id;
                // console.log(post_data)
                $('.plan_mask').show()
                $.ajax({
                    url: isEdit == 'ok'?'/portal/Itinerary/MakeCity':'/portal/map/SucessQuick',
                    type: "post",
                    dataType: "json",
                    contentType:"application/json;charset=utf-8",
                    data:JSON.stringify(post_data), 
                    success: function (res) {
                        // console.log(res)
                        if(!res.status)return;
                        var trip_id = post_data.trip_id?post_data.trip_id:res.data.trip_id
                        window.location.href ='/portal/itinerary/books.html?them='+post_data.uid+'&trip='+trip_id
                    }
                })
            })
        } 
    }
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
        //初始化 展示地图上的marker
        initMarkerFn:function(data,is_dap_drag){
            var marker = new google.maps.Marker({
                position: {lat:data.lat,lng:data.lng},
                icon: "/static/v1/img/map/"+data.icon_url+".png",
                map: map,
                label: {
                    text: data.lable_text,
                    color: data.label_color,
                    fontWeight: "800",
                }
            });
            var index = data.dayItem_index
            if(is_dap_drag){
                allday_markerArr[index].push(marker);
                // console.log(allday_markerArr);
            }else{
                day_markerArr.push(marker);
            }
            
            // console.log(addgo_marker_array)
            
            // 鼠标放上去
            google.maps.event.addListener(marker, "mouseover",
                function () {
                    marker.setIcon('/static/v1/img/map/spot_1.png');
                  
                    mapObj.style_InfowindowFn(data, 'spot_hover',30);
                    mapObj.marlker_poly_colorFn(index,'#58b0fc','spot_1')
                   
                });
            google.maps.event.addListener(marker, "mouseout",
                function () {
                    marker.setIcon('/static/v1/img/map/spot_0.png');
                  
                    $('#map').find('.popup-content').each(function(){
                        $(this).remove()
                    });
                   
                    mapObj.marlker_poly_colorFn(index,'#b3b3b3','spot_0');
                });
            
                
        },
        //marker 和 连选 颜色变化
        marlker_poly_colorFn:function(index,color,url){
            //改变连线的颜色
            if(day_polylineArr[index]){
                day_polylineArr[index].setOptions({
                    strokeColor:color
                });
            }
            
            //改变marker的颜色
            var dayItem_marker = allday_markerArr[index]
            if(!dayItem_marker)return
            for(var i = 0; i<dayItem_marker.length;i++){
                dayItem_marker[i].setIcon('/static/v1/img/map/'+url+'.png');
                var mark_data = dayItem_marker[i].label
                dayItem_marker[i].setLabel({
                    text: mark_data.text,
                    color:color,
                    fontWeight: "800",
                })
            }
        },
        //添加自定义信息窗口
        style_InfowindowFn: function (data, is_type,yPx) {
            var str,infoID;
            if(is_type == "spot_hover"){
                infoID = 'content'
                str = '<div id='+infoID+'>\
                        <div class="info_name">'+data.name+'</div>\
                        <div class="info_time">'+data.playTime+'</div>\
                    </div>';
            }else if( is_type == 'is_DayNum' ){
                infoID = 'info_DayNum'
                str = '<div class='+infoID+'>'+data.text+'</div>';
                // $("#map").append(str);

                if(data.is_dap != true){
                    $("#map").append(str);
                }
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
        //清除黑色info
        del_hei_info:function(){
            // 清除黑色info
            $('.info_DayNum').each(function(){
                $(this).parents('.popup-info_DayNum').remove()
                $(this).remove()
            });
            //重新添加黑色info 重新添加
            for(var i = 0;i<_res_day_Arr.length;i++){
                var spot_arr =  _res_day_Arr[i].day;
                for(var a = 0;a <spot_arr.length; a++){
                    var spot_item =  spot_arr[a];
                    var lat = Number(spot_item.this_lat);
                    var lng = Number(spot_item.this_lng);
                    if(a == 0){
                        var data = {
                            lat: lat,
                            lng: lng,
                            text:'Day'+Number(i+1),
                            index:i,
                            Class_name : "infoClass",
                        }
                        mapObj.style_InfowindowFn(data,'is_DayNum',30);
                    } 
                }
            };
            //鼠标放在黑色info上
            initObj.hover_hei_info()
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
                                    time: 600,
                                    offset: '300px'
                                });
                                return
                            }
                        }else{
                            if(!poi.district && !poi.address){
                                layer.msg("请输详细的信息", {
                                    time: 600,
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
                            time: 600,
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
                    mapObj.style_InfowindowFn(data, 'hotel_hover',45);
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
    var templateObj = {
        //渲染每天的列表
        dayItem_fn:function(){
            var dayNnm_str = '{{each day_arry as value i}}\
                                {{if i == 0}}\
                                    <li class="active">Day{{(value.hotel_day)}}</li>\
                                {{else}}\
                                    <li>Day{{(value.hotel_day)}}</li>\
                                {{/if}}\
                             {{/each}}'
            var dayNnm_render = template.compile(dayNnm_str);
            var dayNnm_html = dayNnm_render(_trc_res.result);
            $('.Dnum_box .Dnum_ul').html(dayNnm_html)
             
            var dayItem_str = '{{each day_arry as value i}}\
                        <div class="dayItem" id="day{{i}}">\
                            <div class="day_nav">\
                                <div class="day_nav_top clearfix">\
                                    <span class="fl item_Dnum">Day{{value.hotel_day}}</span>\
                                    <div class="fr"><i class="del_icon"></i></div>\
                                </div>\
                                <div class="day_nav_bottom">\
                                    <span class="day_date">{{value.date}}</span><span class="day_weeks">{{value.weeks}}</span><span>|</span><span class="day_betw_time">{{value.betw_time}}</span>\
                                </div>\
                            </div>\
                            <ul id="day_ul{{i}}" class="connectedSortable">\
                                {{each value.day as spot s}}\
                                    <li class="spot_list" data-lat="{{spot.this_lat}}" data-lng="{{spot.this_lng}}" data-this_tag_time="{{spot.this_tag_time}}" >\
                                        <div class="spot_box clearfix">\
                                            <i class="delete_icon"></i>\
                                            <div class="div1 clearfix">\
                                                <span class="name fl" title="{{spot.this_name}}">{{spot.this_name}}</span>\
                                                {{if spot.eat_info}}\
                                                    <i class="foodBox" data-food_index="{{i}}_{{s}}"></i>\
                                                {{/if}}\
                                                <div class="fr time_div">\
                                                    {{if spot.this_tag_time == 8}}\
                                                        <span class="time_num">1</span>\
                                                        <div class="tiem_ico"><i class="add_ico"></i><i class="dow_ico"></i></div>天\
                                                    {{else}}\
                                                        <span class="time_num">{{spot.this_playtime}}</span>\
                                                        <div class="tiem_ico"><i class="add_ico"></i><i class="dow_ico"></i></div>\
                                                    {{/if}}\
                                                </div>\
                                            </div>\
                                            <div class="div2 clearfix">\
                                                <span class="fl">开放时间:</span><span class="fl js_bh">{{spot.business_hours}}</span>\
                                                {{if spot.this_floor_index <= 3 || spot.this_floor_index == 6}}\
                                                    <span class="fr">景</span>\
                                                {{else}}\
                                                    <span class="fr">购</span>\
                                                {{/if}}\
                                            </div>\
                                        </div>\
                                        <div class="spot_trc_box">\
                                            {{if spot.traffic_distance}}\
                                                <i class="trc_ico"></i><span class="js_disKm">{{spot.traffic_distance}}</span>km·约<span class="js_trcTime">{{spot.traffic_time_chinese}}</span>\
                                            {{else}}\
                                            <i class="trc_ico" data-traffic_time="0"></i><span class="js_disKm">0</span>km·<span class="js_trcTime">0分钟</span>\
                                            {{/if}}\
                                        </div>\
                                        <i class="dis_none js_stored_data" data-city_id="{{spot.city_id}}" data-default_playtime="{{spot.default_playtime}}"\
                                            data-js_sport_eat="{{spot.js_sport_eat}}" data-not_modifity="{{spot.not_modifity}}"\
                                            data-ranking="{{spot.ranking}}" data-suit_season="{{spot.suit_season}}" data-this_img_src="{{spot.this_img_src}}"\
                                            data-this_type="{{spot.this_type}}" data-ticket_data="{{spot.ticket_data}}"\
                                            data-period_time="{{spot.period_time}}" data-this_floor_index="{{spot.this_floor_index}}" ></i>\
                                    </li>\
                                {{/each}}\
                            </ul>\
                            {{if value.hotel}}\
                                {{if value.hotel.hotel_name != ""}}\
                                    <div class="hotel_box clearfix">\
                                        <div class="fl" title="{{value.hotel.hotel_name}}"><i class="hotel_ico"></i><span class="day_hotel">{{value.hotel.hotel_name}}</span></div><span class="fr">住</span>\
                                    </div>\
                                {{else}}\
                                    <div class="hotel_box not_hotel clearfix">\
                                        <div class="fl"><i class="hotel_ico"></i><span class="day_hotel">当前暂未添加酒店</span></div><span class="fr">住</span>\
                                    </div>\
                                {{/if}}\
                            {{else}}\
                                <div class="hotel_box not_hotel clearfix">\
                                    <div class="fl"><i class="hotel_ico"></i><span class="day_hotel">当前暂未添加酒店</span></div><span class="fr">住</span>\
                                </div>\
                            {{/if}}\
                            <i class="js_dayI" data-start_time="{{value.start_time}}" data-end_time="{{value.end_time}}"  data-start_clock="{{value.start_clock}}" data-resultsTime="{{value.resultsTime}}"\
                            data-month_day="{{value.month_day}}" data-of_date="{{value.of_date}}" data-playtimeNum="{{value.playtimeNum}}" data-reality_time="{{value.reality_time}}"\
                            data-time="{{value.time}}" data-time1="{{value.time1}}" data-time2="{{value.time2}}" ></i>\
                        </div>\
                    {{/each}}';
            var dayItem_render = template.compile(dayItem_str);
            var dayItem_html = dayItem_render(_trc_res.result);
            $('.dayItem_box').html(dayItem_html);
           
        },
        //美食弹框渲染
        food_popu_listFn:function(data){
            var str = '{{each eat_info as value i}}\
                            <li data-tag_time = {{value.tag_time}}>\
                                <div class="li_top"><span class="food_name">{{value.name}}</span><span class="food_line">|</span>用餐<span class="food_time">{{value.meal_time}}</span></div>\
                                <div class="li_bot">距离景点<span class="food_dis">{{value.eat_to_spot}}</span>km<span class="dis_time dis_none">·约15分钟</span></div>\
                                <i class="delete_icon"></i>\
                            </li>\
                        {{/each}}'
            var food_render = template.compile(str);
            var foot_html= food_render(data);
            $('.food_ul').html(foot_html)
        },
        //交通距离时间渲染
        dis_time_temFn:function(data){
            var spot_trc_box = $('.dayItem_box').find('.dayItem').eq(data.day_index).find('ul').find('li').eq(data.spot_index).find('.spot_trc_box')
            if(data.dis == null){
                spot_trc_box.find('.js_disKm').html('0').end()
                .find('.js_trcTime').html('0分钟')
            }else{
                spot_trc_box.find('.js_disKm').html(data.dis).end()
                .find('.js_trcTime').html(data.hours_time)
            }
            
        },
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
        //正常流程城市名字渲染
        normal_topCity_temFn:function(){
            $('.normal_head,.normal_next').show()
            var city_name_tem = '<li>'+go_city_name+'<i class="li_ico"></i></li>\
                    {{each cityArray as value i}}\
                        {{if i == '+this_city_index+'}}\
                        <li class="active" >{{value}}<i class="li_ico"></i></li>\
                        {{else}}\
                        <li>{{value}}<i class="li_ico"></i></li>\
                        {{/if}}\
                    {{/each}}<li>'+return_city_name+'<i class="li_ico"></i></li>';
            var city_name_render = template.compile(city_name_tem);
            var city_name_html = city_name_render(_res_r_spot);
            $(".city_name_ul").html(city_name_html);
        },
        // 编辑流程 城市名字渲染
        edit_topCity_temFn:function(){
            $('.edit_head,.edit_next').show()
            var city_name_tem = '{{each cityArray as value i}}\
                                    <li>{{value}}</li>\
                                {{/each}}';
            var city_name_render = template.compile(city_name_tem);
            var city_name_html = city_name_render(_res_r_spot);
            $(".edit_city_ul").html(city_name_html);
            $('.edit_city_ul').find('li').eq(this_city_index).addClass('active');
           
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
            initObj.detail_showFn()
            //添加我想去的景点
            initObj.add_spot_Fn();
            //添加美食当景点
            initObj.add_eatFn();
            //已选的灰掉
            initObj.is_list_grayFn();
       
            

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
            
            var temDay_data = {day_arry:_res_day_Arr}
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
            var sport_srt = '<li data-this_tag_time="' + this_data.this_tag_time + '" data-lat="' + this_data.this_lat + '" data-lng="' + this_data.this_lng + '" data-period_time="' + this_data.period_time + '" data-this_floor_index="' + this_data.this_floor_index + '" >\
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
            $(".dap_ul").append(sport_srt);
            //待安排 拖拽
            initObj.dap_dragFn();
            //hover 待安排列表
            initObj.hover_dapList_fn();
            //删除景点
            initObj.del_dapListFn();
            // //计算游玩时间 加减
            initObj.playtimeFn();
            //待安排
            $('#dap_catalog').find('.dap_ul').removeAttr('style');
            $('.f_main').stop().animate({scrollTop:$('.dap_top').position().top+180}, 500);
            
        },
        //添加后酒店渲染
        add_hotel_temFn: function(index){
            var top = $('.dayItem').eq(index).find('.hotel_box').position().top
            $('.f_main').stop().animate({scrollTop:top-100}, 500);
            if(_res_day_Arr[index].hotel){
                $('.dayItem').eq(index).find('.hotel_box').removeClass('not_hotel').find('.day_hotel').text(_res_day_Arr[index].hotel.hotel_name)
            }else{
                $('.dayItem').eq(index).find('.hotel_box').addClass('not_hotel').find('.day_hotel').text('当前暂未添加酒店')
            }
            
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
    var slider_len =_Daydate_arr.length
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
//向上取整并保留1位小数
/**num:计算的值，v保留几位小数 */
function decimal(num,v){
    var vv = Math.pow(10,v);
    return Math.round(num*vv)/vv;
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