//地图
var map;
var flightPath;
var Dottedline;

var city_index; //城市索引值
var last_inputcity_latlng; // 返回程点
var Dottedline_array = [] //虚线数组
var city_day_array = []; //第一次 试玩天数
var mouseup_daynum_array = []; //拖拽后 天数
var first_pos_array = []; //第一次  经纬度
var mouseup_pos_array = []; //拖拽后 经纬度
var city_markers = [];

var backpoly_array = []; //出返城市一样
var goline_array = []; //出返城市不一样 出发
var backline_array = []; //出返城市不一样 返回

var isback = getUrlParam('b')

var mapFn = {
    initMap: function (center) {
        // console.log(center)
        map = new google.maps.Map(document.getElementById('map'), {
            zoom: 6,
            gestureHandling: 'greedy',
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            scaleControl: true,
            streetViewControl: false,
            center: center
        });
        
    },
    //出发城市 和 返回城市的marker
    tripHome: function (departure_pos, return_pos, firstcity_one_pos, firstcity_last_pos) {

        //出发城市和返回城市一样
        if (departure_pos.lat == return_pos.lat && departure_pos.lng == return_pos.lng) {
            var departure_marker = new google.maps.Marker({
                map: map,
                position: departure_pos,
                icon: "/static/v1/img/map/departureicon.png",
            });
            //定义信息窗口
            mapFn.styleInfowindow("出发城市", departure_marker, "departure_city")
            backpoly_array.push(firstcity_one_pos, departure_pos, firstcity_last_pos);
            mapFn.gobackpolyline(backpoly_array)
            // console.log(backpoly_array);
        } else {
            var departure_marker = new google.maps.Marker({
                map: map,
                position: departure_pos,
                icon: "/static/v1/img/map/departureicon.png",
            });
            mapFn.styleInfowindow("出发城市", departure_marker, "departure_city")
            //返回
            var return_marker = new google.maps.Marker({
                map: map,
                position: return_pos,
                icon: "/static/v1/img/map/returnicon.png",
            });
            //定义信息窗口
            mapFn.styleInfowindow("返回城市", return_marker, "departure_city")
            goline_array.push(departure_pos, firstcity_one_pos);
            backline_array.push(firstcity_last_pos, return_pos);
            mapFn.gobackpolyline(goline_array);
            mapFn.gobackpolyline(backline_array);
        }
        
    },
    //城市marker
    cityMarker: function (location, city_name, city_num) {
        // console.log(i)
        var markers = new google.maps.Marker({
            position: location,
            icon: {
                url: "/static/v1/img/map/iconnum1.png",
                labelOrigin: new google.maps.Point(15, 17),

            },
            map: map,
            label: {
                text: city_num,
                color: "#659ff5",
                fontWeight: "800",
            }

        });
        city_markers.push(markers)
        //定义信息窗口
        mapFn.styleInfowindow(city_name, markers, "drag")
        
    },
    clearMarker: function () {
        for (var i = 0; i < city_markers.length; i++) {
            city_markers[i].setMap(null);
            $(".info").eq(i).parent(".infoBox").remove().html("")
        };
        city_markers = [];
    },
    //-----定义连线
    polyline: function (obj_latlng) {
        //定义箭头
        var lineSymbol = {
            path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            // path: google.maps.SymbolPath.CIRCLE,
            // scale: 3,
            // path: "M903.5264 706.0224l0-67.8656-305.4848-203.648 0-237.568c0 0 0-67.8656-67.8656-67.8656-67.8912 0-67.8912 67.8656-67.8912 67.8656l0 237.568L156.8256 638.1568l0 67.8656 305.4592-101.8368 0 190.1056-101.8112 81.4592 0 67.8656 169.7024-67.8656 169.7024 67.8656 0-67.8656-101.8368-81.4592 0-190.1056L903.5264 706.0224z",
            fillColor: '#f5a21d',
            fillOpacity: 1,
            // scale: 10,
            scale: 5,
            strokeColor: '#f5a21d',
            // anchor:new google.maps.Point(530,0),
            // strokeWeight: 6,
            strokeWeight: 3

        };
        flightPath = new google.maps.Polyline({
            path: obj_latlng,
            icons: [{
                icon: lineSymbol,
                offset: '100%',
            }],
            //多线段
            geodesic: true,
            strokeColor: '#FF0000',
            strokeOpacity: 1.0,
            strokeWeight: 4,
        });
        
    },
    //添加连线
    addPolyline: function (isadd) {
        flightPath.setMap(isadd);
        
    },
    //出发城市 返回城市虚线
    gobackpolyline: function (obj_array_pos) {
        var lineSymbol = {
            path: 'M 0,-1 0,1',
            strokeOpacity: 1,
            scale: 2
        };
        Dottedline = new google.maps.Polyline({
            path: obj_array_pos,
            strokeOpacity: 0,
            icons: [{
                icon: lineSymbol,
                offset: '0',
                repeat: '10px',

            }],
            strokeWeight: 4,
            strokeColor: '#FF0000',
            map: map
        });
        Dottedline_array.push(Dottedline)
    },
    //清空
    cleargobackline: function () {
        for (var i = 0; i < Dottedline_array.length; i++) {
            Dottedline_array[i].setMap(null)
        }
        Dottedline_array = []
    },
    //自定义Infowindow
    styleInfowindow: function (name, marker, isdrag) {
        var boxText = document.createElement("div");
        if (isdrag == "drag") {
            boxText.classList.add("info")
        } else {
            boxText.classList.add("departure_info")
        }

        boxText.innerHTML = name;
        $(".info_text_none").text(name)
        var info_width = $(".info_text_none").outerWidth(true);
        // console.log(info_width)
        var myOptions = {
            content: boxText,
            disableAutoPan: false,
            maxWidth: 0,
            pixelOffset: new google.maps.Size(-(info_width / 2), -75),
            zIndex: null,
            boxStyle: {
                background: "", //窗口的背景图 "url('tipbox.gif') no-repeat"
                opacity: 1,
            },
            closeBoxURL: "", // x关闭 的图 图片路径
            infoBoxClearance: new google.maps.Size(1, 1),
            isHidden: false,
            pane: "floatPane",
            enableEventPropagation: false
        };
        if (isdrag == "drag") {
            ib = new InfoBox(myOptions);
            ib.open(map, marker);
        } else {
            departure_ib = new InfoBox(myOptions);
            departure_ib.open(map, marker);
        }

    }
};
$(function () {
    var travelFn = {
        
        traveCityldata: function () {
           
            if (document.referrer == "") {
                window.location.href = "/";
            }
            if(sessionStorage.form_data == undefined){
                $(".js_prompt").fadeIn();
            }
            sessionStorage.removeItem('is_addSpot')
            var postUrl = sessionStorage.isTraveCity == undefined? 'TakeCity' : 'ResturnDrop';
            $.post(postUrl, function (data) {
                // console.log(data)
                if (!data) {
                    return false
                } else {
                    $(".loading_box").fadeOut();
                    travelFn.citylTemplate(data);
                    plan(data)
                    
                    // console.log(form_data)
                    travelFn.getTraveldata(data);
                    showData(data);

                    
                    //第一次日期渲染
                    travelFn.firstDate();
                    travelFn.nextFn(data)


                    var city_data = data.go_city_array;
                    // console.log(city_data)
                    var firstcity_one_pos = {
                        lat: Number(city_data[0].position.lat),
                        lng: Number(city_data[0].position.lng),
                    };
                    setTimeout(function(){
                        map.setCenter(firstcity_one_pos)
                    },100)
                }

            }, 'json');
           
            function plan (data){
                var form_data = data
                // 我的出行计划弹窗部分satrt
                $("#custom_title").val(form_data.custom_title).attr("placeholder", form_data.custom_title)
                $(".wap1_day_num").html(form_data.day_num);
                $(".wap2_adult_num").html(form_data.adult);
                $(".wap2_childrent_num").html(form_data.children);
                // $(".wap2_traffic").html(form_data.traffic_tools);
                $('#wap3_date').val(form_data.date);
                $(".start_name").html(form_data.departure_city);
                $(".end_name").html(form_data.return_city);
                // nav_trc_icon(form_data.traffic_tools)
            }

            function showData(form_data) {
                var city_data = form_data.go_city_array;
                // console.log(city_data)
                var firstcity_one_pos = {
                    lat: Number(city_data[0].position.lat),
                    lng: Number(city_data[0].position.lng),
                };
                // console.log(firstcity_one_pos)
                google.maps.event.addDomListener(window, "load", mapFn.initMap(firstcity_one_pos));

               
                var departure_pos = {
                    lat: Number(form_data.departure_latlng.lat),
                    lng: Number(form_data.departure_latlng.lng),
                };
                var return_pos = {
                    lat: Number(form_data.return_latlng.lat),
                    lng: Number(form_data.return_latlng.lng),
                }
                var firstcity_last_pos = {
                    lat: Number(city_data[city_data.length - 1].position.lat),
                    lng: Number(city_data[city_data.length - 1].position.lng)
                };
                //出发城市，返回城市
                mapFn.tripHome(departure_pos, return_pos, firstcity_one_pos, firstcity_last_pos);

                

                // $("#last_input").on("input propertychange",function () {     //-----
                //     $(".searchdel").show();                                  //    |
                //     var this_input_offset = $(this).offset();                //    |
                //     $(".search_input").show().offset({                       //    返
                //         left:this_input_offset.left,                         //    程
                //         top:this_input_offset.top+23                         //    点
                //     })                                                       //    |
                // });                                                          //    |
                // $(".searchdel").on("click",function(){                       //    |
                //     $(".search_input").fadeOut();                            //    |
                //     $(".searchdel").hide();                                  //-----
                // })
                $("#city_list").sortable();
                $("#city_list").disableSelection();
                for (var i = 0; i < city_data.length; i++) {
                    var city_position = city_data[i].position;
                    var city_name = city_data[i].city_name;
                    var lat = Number(city_position.lat);
                    var lng = Number(city_position.lng)
                    var city_latlng = new google.maps.LatLng(lat, lng);
                    var icon_num = (i + 1).toString();
                    
                    mapFn.cityMarker(city_latlng, city_name, icon_num);
                    city_day_array.push(city_data[i].city_daynum);
                    $("#city_list .list").eq(i).attr("data-lat", lat);
                    $("#city_list .list").eq(i).attr("data-lng", lng);
                    first_pos_array.push({
                        lat: lat,
                        lng: lng
                    });
                    
                   
                };
                mapFn.polyline(first_pos_array);
                mapFn.addPolyline(map);
                // console.log(first_pos_array)
                
                //天数
                var first_day = 0;
                for (var i = 0; i < city_day_array.length; i++) {
                    //第一次 天数
                    var this_day = Number(city_day_array[i]);
                    $(".city_box .list").eq(i).find(".d_1").html(first_day + 1);
                    $(".city_box .list").eq(i).find(".d_2").html(first_day + this_day);
                    first_day = first_day + this_day;
                    //一天 显示一个日期
                    if ($(".city_box .list").eq(i).find(".d_1").html() == $(".city_box .list").eq(i).find(".d_2").html()) {
                        $(".city_box .list").eq(i).find(".js_dD").hide().end().find(".d_2").hide();
                        $(".city_box .list").eq(i).find(".js_tem").hide().end().find(".time_2").hide();
                    };
                };
                //交通方式
                travelFn.tratoolsFn();
                travelFn.tracontent($("#city_list .list").eq(0).find(".traffic_icon_r"));
                var trc_typeName = $('#city_list li').eq(0).find('.list_trc_name').html();
                $('.wap2_traffic').html(trc_typeName);
                nav_trc_icon(trc_typeName)
                // $(document).click(function () {
                //     $(".traffic_more").fadeOut();
                // });

                //拖拽后
                function mouseup_daynum() {
                    mouseup_daynum_array = [];
                    mouseup_pos_array = [];
                    mapFn.addPolyline(null);
                    mapFn.clearMarker();
                    backpoly_array = [];
                    goline_array = [];
                    backline_array = [];
                    mapFn.cleargobackline();

                    $("#city_list .list").each(function (i, n) {
                        //获取当前拖拽的天数
                        var mouseup_this_days = $(n).attr("data-daynum");
                        //拖拽后经纬度
                        var mouseup_lat = Number($(n).attr("data-lat"));
                        var mouseup_lng = Number($(n).attr("data-lng"));
                        // console.log(mouseup_this_days)
                        var name = $(n).find('.city_list_name').html();
                        if (mouseup_this_days != undefined) {
                            mouseup_daynum_array.push(mouseup_this_days);
                            //拖拽后 经纬度从新push 到数组 
                            mouseup_pos_array.push({
                                lat: mouseup_lat,
                                lng: mouseup_lng
                            });
                        }

                    });
                    // console.log(mouseup_pos_array);
                    $(".city_box .traffic_icon_r").removeClass("traffic_icon_hover");
                    var mouseup_day_num = 0
                    var mouseup_firs_time = 0
                    for (var i = 0; i < mouseup_daynum_array.length; i++) {
                        //拖拽后适玩天数重新渲染
                        var mouseup_this_day = Number(mouseup_daynum_array[i]);
                        $(".city_box .list").eq(i).find(".d_1").html(mouseup_day_num + 1);
                        $(".city_box .list").eq(i).find(".d_2").html(mouseup_day_num + mouseup_this_day);
                        mouseup_day_num = mouseup_day_num + mouseup_this_day;

                        $(".city_box .list").eq(i).find(".city_num").html(i + 1);

                        //拖拽后 日期 
                        var go_date = $(".calendar .date").html();
                        var yearDate = YearDate(go_date, mouseup_firs_time)
                        $(".city_box .list").eq(i).attr("data-year", yearDate)
                        var mouseup_new_date = addDate(go_date, mouseup_firs_time);
                        $(".city_box .list").eq(i).find(".time_1").html(mouseup_new_date);
                        mouseup_firs_time = mouseup_firs_time + mouseup_this_day;

                        var yearDate2 = YearDate(go_date, mouseup_firs_time - 1);
                        $(".city_box .list").eq(i).attr("data-year2", yearDate2)
                        var mouseupnew_dates = addDate(go_date, mouseup_firs_time - 1);
                        $(".city_box .list").eq(i).find(".time_2").html(mouseupnew_dates);
                        mouseupnew_dates = addDate(go_date, mouseup_firs_time)
                        mouseup_new_date = mouseupnew_dates;
                        //拖拽后 标记点
                        var mouseup_lat = $(".city_box .list").eq(i).attr("data-lat");
                        var mouseup_lng = $(".city_box .list").eq(i).attr("data-lng");
                        var mouseup_latlng = new google.maps.LatLng(mouseup_lat, mouseup_lng);
                        var mouseup_city_name = $(".city_box .list").eq(i).find(".city_list_name").html();
                        var mouseup_icon_num = i + 1;
                        var tos_icon_num = mouseup_icon_num.toString()
                        mapFn.cityMarker(mouseup_latlng, mouseup_city_name, tos_icon_num);

                        //拖拽后公里数 时间 显示的交通工具   //飞机700 在加0.5小时， 铁路230 ，其他50
                        //我想去的城市
                        var mouseup_lat_next = $(".city_box .list").eq(i + 1).attr("data-lat");
                        var mouseup_lng_next = $(".city_box .list").eq(i + 1).attr("data-lng");

                        if (mouseup_lng_next != undefined) {
                            var mouseup_list_dis = travelFn.GetDistance(mouseup_lat, mouseup_lng, mouseup_lat_next, mouseup_lng_next);
                            mouseup_list_dis = parseInt(mouseup_list_dis);
                            $(".city_box .list").eq(i + 1).find(".js_list_dis").html(mouseup_list_dis);
                            var air_time = (mouseup_list_dis / 700) + 0.5;
                            var train_time = mouseup_list_dis / 230;
                            var car_time = mouseup_list_dis / 80; //汽车交通
                            var other_time = mouseup_list_dis / 50;
                            air_time = air_time.toFixed(1);
                            train_time = train_time.toFixed(1);
                            car_time = car_time.toFixed(1);
                            other_time = other_time.toFixed(1);
                            if (mouseup_list_dis > 300) {
                                if (form_data.traffic_tools == "飞机交通") {
                                    airTra($(".city_box .list").eq(i + 1), "list");
                                } else if (form_data.traffic_tools == "其他交通") {
                                    otherTra($(".city_box .list").eq(i + 1), "list");
                                }else if (form_data.traffic_tools == "汽车交通"){
                                    carTra($(".city_box .list").eq(i + 1), "list")
                                } else {
                                    railwayTra($(".city_box .list").eq(i + 1), "list");
                                }
                                allattr($(".city_box .list").find(".traffic_icon_r").eq(i + 1), "list")
                            } else {
                                if (form_data.traffic_tools == "飞机交通" || form_data.traffic_tools == "铁路交通") {
                                    railwayTra($(".city_box .list").eq(i + 1), "list")
                                }else if (form_data.traffic_tools == "汽车交通"){
                                    carTra($(".city_box .list").eq(i + 1), "list")
                                }else {
                                    otherTra($(".city_box .list").eq(i + 1), "list");
                                }
                                other_tra($(".city_box .list").find(".traffic_icon_r").eq(i + 1), "list");
                            };
                            //出发城市
                            var depart_citylat = parseFloat(departure_pos.lat);
                            var depart_citylng = parseFloat(departure_pos.lng);
                            var firstlist_lat = parseFloat($(".city_box .list").eq(0).attr("data-lat"));
                            var firstlist_lng = parseFloat($(".city_box .list").eq(0).attr("data-lng"));
                            // console.log(depart_citylat)
                            var start_dis = parseInt(travelFn.GetDistance(depart_citylat, depart_citylng, firstlist_lat, firstlist_lng));
                            $(".city_box .list").eq(0).find(".js_list_dis").html(start_dis);
                            var start_air_time = ((start_dis / 700) + 0.5).toFixed(1);
                            var start_train_time = (start_dis / 230).toFixed(1);
                            var start_car_time = (start_dis / 80).toFixed(1);; //汽车交通
                            var start_other_time = (start_dis / 50).toFixed(1);
                            var first_list = $(".city_box .list").eq(0);
                            if (start_dis > 300) {
                                if (form_data.traffic_tools == "飞机交通") {
                                    airTra(first_list, "start")
                                } else if (form_data.traffic_tools == "其他交通") {
                                    otherTra(first_list, "start")
                                } else {
                                    railwayTra(first_list, "start")
                                }

                                allattr(first_list.find(".traffic_icon_r"), "start")
                            } else {
                                if (form_data.traffic_tools == "飞机交通" || form_data.traffic_tools == "铁路交通") {
                                    // console.log(start_train_time)
                                    railwayTra(first_list, "start")
                                }else if (form_data.traffic_tools == "汽车交通"){
                                    carTra(first_list, "start")
                                } else {
                                    otherTra(first_list, "start");
                                };
                                other_tra(first_list.find(".traffic_icon_r"), "start");
                                // console.log(start_air_time)
                            };

                            //返回城市
                            var last_list_citylat = $(".city_box .list").eq(mouseup_daynum_array.length - 1).attr("data-lat");
                            var last_list_citylng = $(".city_box .list").eq(mouseup_daynum_array.length - 1).attr("data-lng");
                            var return_citylat = return_pos.lat;
                            var return_citylng = return_pos.lng;
                            var return_dis = travelFn.GetDistance(last_list_citylat, last_list_citylng, return_citylat, return_citylng);
                            return_dis = parseInt(return_dis);
                            $(".return_traffic").find(".js_return_dis").html(return_dis);
                            var return_air_time = (return_dis / 700) + 0.5;
                            var return_train_time = return_dis / 230;
                            var return_car_time = return_dis / 80;
                            var return_other_time = return_dis / 50;
                            return_air_time = return_air_time.toFixed(1);
                            return_train_time = return_train_time.toFixed(1);
                            return_car_time = return_car_time.toFixed(1);
                            return_other_time = return_other_time.toFixed(1);
                            if (return_dis > 300) {
                                if (form_data.traffic_tools == "飞机交通") {
                                    airTra($(".return_traffic"), "return")
                                } else if (form_data.traffic_tools == "其他交通") {
                                    otherTra($(".return_traffic"), "return")
                                } else {
                                    railwayTra($(".return_traffic"), "return")
                                }
                                allattr($(".return_traffic").find(".traffic_icon_r"), "return")
                            } else {
                                if (form_data.traffic_tools == "飞机交通" || form_data.traffic_tools == "铁路交通") {
                                    railwayTra($(".return_traffic"), "return")
                                }else if (form_data.traffic_tools == "汽车交通"){
                                    carTra($(".return_traffic"), "return")
                                } else {
                                    otherTra($(".return_traffic"), "return");
                                };
                                other_tra($(".return_traffic").find(".traffic_icon_r"), "return");
                            };

                            function airTra($n, type) {
                                var fn_train_time;
                                switch (type) {
                                    case "list":
                                        fn_train_time = air_time;
                                        break;
                                    case "return":
                                        fn_train_time = return_air_time;
                                        break;
                                    case "start":
                                        fn_train_time = start_air_time;
                                        break;
                                }
                                $n.find(".trcTime").html(fn_train_time).end()
                                    .find(".list_trc_name").html("飞机交通").end()
                                    .find(".traffic_icon").removeClass("tra_icon other_icon").addClass("air_icon");
                            }

                            function railwayTra($n, type) {
                                var fn_train_time;
                                switch (type) {
                                    case "list":
                                        fn_train_time = train_time;
                                        break;
                                    case "return":
                                        fn_train_time = return_train_time;
                                        break;
                                    case "start":
                                        fn_train_time = start_train_time;
                                        break;
                                };
                                $n.find(".trcTime").html(fn_train_time).end()
                                    .find(".list_trc_name").html("铁路交通").end()
                                    .find(".traffic_icon").removeClass("air_icon other_icon").addClass("tra_icon");
                            }

                            function otherTra($n, type) {
                                var fn_train_time;
                                switch (type) {
                                    case "list":
                                        fn_train_time = other_time;
                                        break;
                                    case "return":
                                        fn_train_time = return_other_time;
                                        break;
                                    case "start":
                                        fn_train_time = start_other_time;
                                        break;
                                };
                                $n.find(".trcTime").html(fn_train_time).end()
                                    .find(".list_trc_name").html("其他交通").end()
                                    .find(".traffic_icon").removeClass("tra_icon air_icon").addClass("other_icon");
                            }
                            function carTra($n, type) {
                                var fn_train_time;
                                switch (type) {
                                    case "list":
                                        fn_train_time = car_time;
                                        break;
                                    case "return":
                                        fn_train_time = return_car_time;
                                        break;
                                    case "start":
                                        fn_train_time = start_car_time;
                                        break;
                                };
                                $n.find(".trcTime").html(fn_train_time).end()
                                    .find(".list_trc_name").html("汽车交通").end()
                                    .find(".traffic_icon").removeClass("tra_icon air_icon other_icon").addClass("car_icon");
                            }

                            function allattr($n, type) {
                                if (type == "list") {
                                    $n.attr("data-flt", air_time)
                                        .attr("data-trt", train_time)
                                        .attr("data-car", car_time)
                                        .attr("data-othert", other_time);
                                       
                                } else if (type == "start") {
                                    $n.attr("data-flt", start_air_time)
                                        .attr("data-trt", start_train_time)
                                        .attr("data-car", start_car_time)
                                        .attr("data-othert", start_other_time);
                                } else {
                                    $n.attr("data-flt", return_air_time)
                                        .attr("data-trt", return_train_time)
                                        .attr("data-car", return_car_time)
                                        .attr("data-othert", return_other_time);
                                }

                            }

                            function other_tra($n, type) {
                                if (type == "list") {
                                    $n.attr("data-flt", "")
                                        .attr("data-trt", train_time)
                                        .attr("data-car", car_time)
                                        .attr("data-othert", other_time);
                                } else if (type == "start") {
                                    $n.attr("data-flt", "")
                                        .attr("data-trt", start_train_time)
                                        .attr("data-car", start_car_time)
                                        .attr("data-othert", start_other_time);
                                } else {
                                    $n.attr("data-flt", "")
                                        .attr("data-trt", return_train_time)
                                        .attr("data-car", return_car_time)
                                        .attr("data-othert", return_other_time);
                                }

                            }
                            // ------------------------------返程点-------------------------------
                            //返程点城市名字
                            // var last_list_cityname = $(".city_box .list").eq(mouseup_daynum_array.length-1).find(".city_list_name").html();
                            // $("#last_input").val(last_list_cityname);
                            //返程点经纬度
                            // var geocoder = new google.maps.Geocoder();
                            // geocoder.geocode({
                            //     'address': last_list_cityname
                            // }, function (results, status) {
                            //     if (status === 'OK') {
                            //         last_inputcity_latlng = {lat:results[0].geometry.location.lat(),lng:results[0].geometry.location.lng()};
                            //         console.log(last_input_city)
                            //         map.setCenter(results[0].geometry.location);
                            //         var departure_marker = new google.maps.Marker({
                            //             map: map,
                            //             position: results[0].geometry.location,
                            //             icon: "/static/v1/img/map/departureicon.png",
                            //         });
                            //         //定义信息窗口
                            //         var contentString = '<div id="content">\
                            //                                 <div id="bodyContent">出发城市</div>\
                            //                             </div>';
                            //         infowindow = new google.maps.InfoWindow({
                            //             content: contentString
                            //         });
                            //         infowindow.open(map, departure_marker);
                            //     } else {
                            //         alert('Geocode was not successful for the following reason: ' + status);
                            //     }
                            // });
                        }


                    }
                    mapFn.polyline(mouseup_pos_array);
                    mapFn.addPolyline(map);
                    var mouseup_one_pos = mouseup_pos_array[0];
                    var mouseup_last_pos = mouseup_pos_array[mouseup_pos_array.length - 1];
                    // console.log(mouseup_one_pos)


                    //出发城市和返回城市一样
                    if (departure_pos.lat == return_pos.lat && departure_pos.lng == return_pos.lng) {
                        backpoly_array.push(mouseup_one_pos, departure_pos, mouseup_last_pos);
                        mapFn.gobackpolyline(backpoly_array);
                    } else {
                        // mapFn.cleargobackline()
                        goline_array.push(departure_pos, mouseup_one_pos);
                        mapFn.gobackpolyline(goline_array);
                        backline_array.push(mouseup_last_pos, return_pos);
                        mapFn.gobackpolyline(backline_array);
                    }
                    travelFn.tratoolsFn();
                };
                //鼠标松开
                $("#city_list .list").on("mouseup", function (e) {
                    $(this).find(".list_traffic").removeClass("list_tra_none");
                    setTimeout(function () {
                        mouseup_daynum();

                    }, 10);
                });
                $("#city_list .list").on("mousedown", function (e) {
                    $(this).find(".list_traffic").addClass("list_tra_none");
                    $(".traffic_more").hide();
                })
                $(document).click(function () {
                    $(".list_traffic").removeClass("list_tra_none");
                })
            };

        },
        //获取展示上个页面的数据
        getTraveldata: function (form_data) {
            var city_data = form_data.go_city_array;
            //visitors
            var new_date = new Date();
            new_date = new Date(new_date.getYear() + 1900, new_date.getMonth(), new_date.getDate());
            new_date = new_date.toString()
            if (localStorage.first_visitors_tra_time == undefined) {
                $(".visitors_traffic").fadeIn()
                $(".visitors_traffic").on("click", ".visitors_end", function () {
                    //设置保存时间
                    var first_visitors_tra_time = new Date();
                    first_visitors_tra_time = new Date(first_visitors_tra_time.getYear() + 1900, first_visitors_tra_time.getMonth(), first_visitors_tra_time.getDate());
                    first_visitors_tra_time.setDate(first_visitors_tra_time.getDate() + 3);
                    // console.log(first_visitors_tra_time)
                    localStorage.setItem("first_visitors_tra_time", first_visitors_tra_time);
                    $(".visitors_traffic").fadeOut();
                });
            }
            var get_first_visitors_tra_time = localStorage.first_visitors_tra_time;
            if (get_first_visitors_tra_time == new_date) {
                localStorage.removeItem("first_visitors_tra_time");
            };


            // 有两条以上城市数据显示拖拽提示
            if (city_data.length >= 2) {
                if (localStorage.first_visitors_drag_time == undefined) {
                    $(".visitors_drag").fadeIn();
                    $(".visitors_drag").on("click", ".visitors_end", function () {
                        //设置保存时间
                        var first_visitors_drag_time = new Date();
                        first_visitors_drag_time = new Date(first_visitors_drag_time.getYear() + 1900, first_visitors_drag_time.getMonth(), first_visitors_drag_time.getDate());
                        first_visitors_drag_time.setDate(first_visitors_drag_time.getDate() + 3);
                        localStorage.setItem("first_visitors_drag_time", first_visitors_drag_time);
                        $(".visitors_drag").fadeOut();
                    });
                };
                var first_visitors_drag_time = localStorage.first_visitors_drag_time;
                if (first_visitors_drag_time == new_date) {
                    localStorage.removeItem("first_visitors_drag_time");
                }
            }


            //提示确定
            $(".prompt_but").on("click", function () {
                $(".prompt").fadeOut();
            })

            //左边
            $(".f_top_p .num_day").html(form_data.day_num);
            $(".departure_city").html(form_data.departure_city);
            $(".return_city").html(form_data.return_city);
            $(".calendar .date").html(form_data.date);


            // 出行计划弹出层
            $(".dayNum .ctr-daynum").hide();
            $(".start .arr").hide();
            $(".end .arr").hide();
            //保存
            $(".save").on("click", function () {
                //左边数据改变

                $(".calendar .date").html($("#wap3_date").val());

                $('.madeTravelMask').fadeOut();
                //日期改变从新渲染日期
                travelFn.firstDate()
            });

        },
        //第一次日期渲染
        firstDate: function () {
            var go_date = $(".calendar .date").html();
            go_date = go_date.replace('-', '/');
            go_date = go_date.replace('-', '/');
            var firs_time = 0;
            for (var i = 0; i < city_day_array.length; i++) {
                //第一次 日期  
                var first_year = YearDate(go_date, firs_time);
                $(".city_box .list").eq(i).attr("data-year", first_year);
                var this_day = Number(city_day_array[i]);
                var new_date = addDate(go_date, firs_time);
                $(".city_box .list").eq(i).find(".time_1").html(new_date);
                firs_time = firs_time + this_day;

                var first_year2 = YearDate(go_date, firs_time - 1);
                $(".city_box .list").eq(i).attr("data-year2", first_year2)
                var new_dates = addDate(go_date, firs_time - 1);
                $(".city_box .list").eq(i).find(".time_2").html(new_dates);
                new_dates = addDate(go_date, firs_time)
                new_date = new_dates;
            };

        },
        //进度条
        cityProgressbar: function (percentage) {
            $('#progressbar').LineProgressbar({
                percentage: percentage,
                fillBackgroundColor: '-webkit-linear-gradient(right,#c4dcff,#659ff5)',
                height: '10px',
                radius: '5px'
            });
        },
        //城市渲染
        citylTemplate: function (data) {
            // console.log(data)
            var traveCityltemplate = '<ul id="city_list">\
                                        {{each go_city_array as value i}}\
                                        <li class="list" data-daynum = {{value.city_daynum}} data-cid = {{value.city_id}} data-pid = {{value.province_id}} data-provinceNames={{value.provinceNames}} data-city_Introduction={{value.city_Introduction}}>\
                                            <div class="list_traffic">\
                                                {{if traffic_tools == "飞机交通"}}\
                                                    {{if value.flightTime == "" && value.trainTime != ""}}\
                                                        <i class="traffic_icon tra_icon"></i><span class="list_trc_name">铁路交通</span>·<span class="js_list_dis">{{value.dis}}</span>公里·<span class="trcTime">{{value.trainTime}}</span>小时\
                                                    {{else if value.flightTime == "" && value.trainTime == ""}}\
                                                        <i class="traffic_icon other_icon"></i><span class="list_trc_name">其他交通</span>·<span class="js_list_dis">{{value.dis}}</span>公里·<span class="trcTime">{{value.trafficTime}}</span>小时\
                                                    {{else}}\
                                                        <i class="traffic_icon air_icon"></i><span class="list_trc_name">飞机交通</span>·<span class="js_list_dis">{{value.dis}}</span>公里·<span class="trcTime">{{value.flightTime}}</span>小时\
                                                    {{/if}}\
                                                {{else if traffic_tools == "其他交通"}}\
                                                    <i class="traffic_icon other_icon"></i><span class="list_trc_name">其他交通</span>·<span class="js_list_dis">{{value.dis}}</span>公里·<span class="trcTime">{{value.trafficTime}}</span>小时\
                                                {{else}}\
                                                    {{if value.trainTime == ""}}\
                                                        <i class="traffic_icon other_icon"></i><span class="list_trc_name">其他交通</span>·<span class="js_list_dis">{{value.dis}}</span>公里·<span class="trcTime">{{value.trafficTime}}</span>小时\
                                                    {{else}}\
                                                        <i class="traffic_icon tra_icon"></i><span class="list_trc_name">铁路交通</span>·<span class="js_list_dis">{{value.dis}}</span>公里·<span class="trcTime">{{value.trainTime}}</span>小时\
                                                    {{/if}}\
                                                {{/if}}\
                                                <i class="traffic_icon_r" data-flt = "{{value.flightTime}}" data-trt = "{{value.trainTime}}" data-othert="{{value.trafficTime}}" data-car="{{return_traffic.carTime}}"></i>\
                                            </div>\
                                            <div class="list_city clearfix">\
                                                <div class="city_list_l fl clearfix">\
                                                    <p class="city_num fl">{{i+1}}</p>\
                                                    <div class="city_text fl">\
                                                        <p class="city_list_name">{{value.city_name}}</p>\
                                                        <p class="city_py">{{value.city_py}}</p>\
                                                    </div>\
                                                </div>\
                                                <div class="city_list_r fr">\
                                                    <p class="city_date"><span class="time_1"></span><span class="js_tem">-</span><span class="time_2"></span></p>\
                                                    <p class="city_day">D<span class="d_1"></span><span class="js_dD">-D</span><span class="d_2"></span></p>\
                                                </div>\
                                            </div>\
                                        </li>\
                                        {{/each}}\
                                    </ul>\
                                    <div class="return_traffic">\
                                        {{if traffic_tools == "飞机交通"}}\
                                            {{if return_traffic.flightTime == "" && return_traffic.trainTime != ""}}\
                                                <i class="traffic_icon tra_icon"></i><span class="list_trc_name">铁路交通</span>·<span class="js_return_dis">{{return_traffic.dis}}</span>公里·<span class="trcTime">{{return_traffic.trainTime}}</span>小时\
                                            {{else if return_traffic.flightTime == "" && return_traffic.trainTime == ""}}\
                                                <i class="traffic_icon other_icon"></i><span class="list_trc_name">其他交通</span>·<span class="js_return_dis">{{return_traffic.dis}}</span>公里·<span class="trcTime">{{return_traffic.trafficTime}}</span>小时\
                                            {{else}}\
                                                <i class="traffic_icon air_icon"></i><span class="list_trc_name">飞机交通</span>·<span class="js_return_dis">{{return_traffic.dis}}</span>公里·<span class="trcTime">{{return_traffic.flightTime}}</span>小时\
                                            {{/if}}\
                                        {{else if traffic_tools == "其他交通"}}\
                                            <i class="traffic_icon other_icon"></i><span class="list_trc_name">其他交通</span>·<span class="js_return_dis">{{return_traffic.dis}}</span>公里·<span class="trcTime">{{return_traffic.trafficTime}}</span>小时\
                                        {{else}}\
                                            {{if return_traffic.trainTime == ""}}\
                                                <i class="traffic_icon other_icon"></i><span class="list_trc_name">其他交通</span>·<span class="js_return_dis">{{return_traffic.dis}}</span>公里·<span class="trcTime">{{return_traffic.trafficTime}}</span>小时\
                                            {{else}}\
                                                <i class="traffic_icon tra_icon"></i><span class="list_trc_name">铁路交通</span>·<span class="js_return_dis">{{return_traffic.dis}}</span>公里·<span class="trcTime">{{return_traffic.trainTime}}</span>小时\
                                            {{/if}}\
                                        {{/if}}\
                                        <i class="traffic_icon_r return_traffic_icon_r" data-flt = "{{return_traffic.flightTime}}" data-trt = "{{return_traffic.trainTime}}" data-othert="{{return_traffic.trafficTime}}" data-car="{{return_traffic.carTime}}" ></i>\
                                    </div>';

            // console.log(city_data)
            var traveCityrender = template.compile(traveCityltemplate);
            var traveCityhtml = traveCityrender(data);
            $(".city_box").html(traveCityhtml);
            
        },
        //交通工具选项
        tratoolsFn: function () {
            //我想去的城市hover
            $("#city_list .list").find(".traffic_icon_r").hover(function () {
                travelFn.tracontent($(this));
            });
            $(".return_traffic .return_traffic_icon_r").hover(function () {
                travelFn.tracontent($(this));
            })
            // $("#city_list .list").find(".traffic_icon_r").on("click",function () {
            //     tracontent($(this))
            // });
            // $(".return_traffic .return_traffic_icon_r").on("click",function () {
            //     tracontent($(this))
            // })
            
            //点击交通工具选项
            $(".traffic_more .trc_l").on("click", function () {
                $(".traffic_more .trc_l").removeClass("selected");
                trafficMore(city_index, $(this));
                $(".traffic_more").fadeOut()
            });


            function trafficMore(city_index, n) {
                // console.log(city_index)
                n.addClass("selected");
                var tra_name = n.siblings(".trc_r").find(".trc_name").html();
                var tra_time = n.siblings(".trc_r").find(".js_traTime").html();
                // console.log(city_index,tra_name,tra_time)
                if (city_index == -1) {
                    $(".return_traffic").find(".list_trc_name").html(tra_name);
                    $(".return_traffic").find(".trcTime").html(tra_time);
                    $(".return_traffic").find(".traffic_icon_r").removeClass("traffic_icon_hover");
                    if (tra_name == "飞机交通") {
                        $(".return_traffic").find(".traffic_icon").addClass("air_icon").removeClass("tra_icon air_icon other_icon");
                    }else if (tra_name == "汽车交通"){
                        $(".return_traffic").find(".traffic_icon").addClass("car_icon").removeClass("tra_icon air_icon other_icon");
                    } else if (tra_name == "其他交通") {
                        $(".return_traffic").find(".traffic_icon").addClass("other_icon").removeClass("tra_icon air_icon other_icon");
                    } else {
                        $(".return_traffic").find(".traffic_icon").addClass("tra_icon").removeClass("tra_icon air_icon other_icon");
                    }
                } else {
                    $("#city_list .list").eq(city_index).find(".list_trc_name").html(tra_name);
                    $("#city_list .list").eq(city_index).find(".trcTime").html(tra_time);
                    $("#city_list .list").eq(city_index).find(".traffic_icon_r").removeClass("traffic_icon_hover");
                    if (tra_name == "飞机交通") {
                        $("#city_list .list").eq(city_index).find(".traffic_icon").addClass("air_icon").removeClass("tra_icon other_icon");
                    } else if (tra_name == "其他交通") {
                        $("#city_list .list").eq(city_index).find(".traffic_icon").addClass("other_icon").removeClass("air_icon tra_icon");
                    } else {
                        $("#city_list .list").eq(city_index).find(".traffic_icon").addClass("tra_icon").removeClass("air_icon other_icon");
                    }

                    if(city_index == 0){
                        $('.wap2_traffic').html(tra_name);
                        nav_trc_icon(tra_name)
                    }
                }

            };


        },
        //交通工具弹出框
        tracontent:function (this_hover) {
            $(".traffic_more .trc_l").removeClass("selected");
            $(".city_box .traffic_icon_r").removeClass("traffic_icon_hover");
            var this_offset = this_hover.offset();
            var this_flightTime = this_hover.attr("data-flt");
            var this_trainTime = this_hover.attr("data-trt");
            var this_otherTime = this_hover.attr("data-othert");
            var this_carTime = this_hover.attr("data-car");
            var trc_name = this_hover.siblings(".list_trc_name").html();
            city_index = this_hover.parents("li").index();
            $(".traffic_more").fadeIn().offset({
                left: this_offset.left + 65,
                top: this_offset.top - 32
            });

            this_hover.addClass("traffic_icon_hover")
            if (trc_name == "飞机交通") {
                if (this_flightTime == "" && this_trainTime != "") {
                    train_other();
                    $(".train_trc .trc_l").addClass("selected");
                } else if (this_trainTime == "" && this_flightTime == "") {
                    otherTraffic()
                } else {
                    trafficAll()
                    $(".air_trc .trc_l").addClass("selected");
                };
            } else if (trc_name == "铁路交通") {
                if (this_flightTime == "" && this_trainTime != "") {
                    train_other()
                    $(".train_trc .trc_l").addClass("selected");
                } else if (this_trainTime == "" && this_flightTime == "") {
                    otherTraffic()
                } else {
                    trafficAll()
                    $(".train_trc .trc_l").addClass("selected");
                };
            }else if (trc_name == "汽车交通"){
                if (this_flightTime == "" && this_trainTime != "") {
                    train_other()
                } else if (this_trainTime == "" && this_flightTime == "") {
                    otherTraffic()
                } else {
                    trafficAll()
                };
                $(".car_trc .trc_l").addClass("selected");
            } else {
                if (this_flightTime == "" && this_trainTime != "") {
                    train_other();
                    $(".other_trc .trc_l").addClass("selected");
                } else if (this_trainTime == "" && this_flightTime == "") {
                    otherTraffic()
                } else {
                    trafficAll()
                    $(".other_trc .trc_l").addClass("selected");
                };
            }

            function trafficAll() {
                $(".air_trc,.train_trc").show();
                $(".trc_time").html(this_trainTime);
                $(".flt_time").html(this_flightTime);
                $(".other_time").html(this_otherTime);
                $(".car_time").html(this_carTime);
            }
            //没有飞机交通
            function train_other() {
                $(".air_trc").hide();
                $(".other_time").html(this_otherTime);
                $(".trc_time").html(this_trainTime);
                $(".car_time").html(this_carTime);
            }
            //其他交通
            function otherTraffic() {
                $(".air_trc,.train_trc").hide();
                $(".other_time").html(this_otherTime);
                $(".other_trc .trc_l").addClass("selected");
            }

        },
        // 方法定义 lat,lng 调用 return的距离单位为km
        GetDistance: function (lat1, lng1, lat2, lng2) {
            var radLat1 = lat1 * Math.PI / 180.0;
            var radLat2 = lat2 * Math.PI / 180.0;
            var a = radLat1 - radLat2;
            var b = lng1 * Math.PI / 180.0 - lng2 * Math.PI / 180.0;
            var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) +
                Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
            s = s * 6378.137; // EARTH_RADIUS;
            s = Math.round(s * 10000) / 10000;

            return s;
        },
        nextFn: function (form_data) {
            var city_data = form_data.go_city_array;
            //下一步
            $(".next").on("click", function () {
                map.setZoom(7);
                //连线 动画
                function animateCircle(line) {
                    var count = 0;
                    var flag = true;
                    var num;
                    if (flag) {
                        var timer = window.setInterval(function () {

                            count = (count + 1) % 200;
                            var icons = line.get('icons');
                            icons[0].offset = (count / 2) + "%";
                            num = icons[0].offset.substring(0, icons[0].offset.length - 1) - 0;
                            if (num >= 99.5) {
                                flag = false;
                                window.clearInterval(timer);
                                icons[0].offset = "100%";
                                icons[0].icon.fillColor = "#659ef4"
                                icons[0].icon.fillOpacity = 1;
                                icons[0].icon.strokeColor = "#659ef4";
                                line.strokeColor = "#659ef4"
                            }
                            line.set('icons', icons);

                        }, 12);

                    };

                };
                if (city_data.length != 1) {
                    animateCircle(flightPath);
                }

                // console.log(form_data)
                var post_form_data = {}
                //数据存储
                form_data.custom_title = $("#custom_title").val(); //行程单标题
                form_data.adult = $(".wap2_adult_num").html(); //成人数量
                form_data.children = $(".wap2_childrent_num").html(); //儿童数量
                form_data.date = $("#wap3_date").val(); //出行日期
                form_data.day_num = $(".num_day").html() //出行天数
                form_data.traffic_tools = $('.wap2_traffic').html()
                form_data.return_traffic = {
                    dis: $(".return_traffic .js_return_dis").html(),
                    flightTime: $(".return_traffic .return_traffic_icon_r").attr("data-flt"),
                    trainTime: $(".return_traffic .return_traffic_icon_r").attr("data-trt"),
                    carTime: $(".return_traffic .return_traffic_icon_r").attr("data-car"),
                    trafficTime: $(".return_traffic .return_traffic_icon_r").attr("data-othert"),
                    city_trc_name: $(".return_traffic .list_trc_name").html()
                }
                // console.log(form_data.go_city_array)
                var tra_go_city_array = []
                $("#city_list .list").each(function (i, n) {
                    var tra_go_city_obj = {}
                    var list_go_city = $("#city_list .list").eq(i);
                    tra_go_city_obj.city_name = list_go_city.find(".city_list_name").html(); //城市名字
                    tra_go_city_obj.city_daynum = list_go_city.attr("data-daynum"); //适玩天数
                    tra_go_city_obj.city_d_1 = list_go_city.find(".d_1").html();
                    tra_go_city_obj.city_d_2 = list_go_city.find(".d_2").html();
                    tra_go_city_obj.city_time_1 = list_go_city.find(".time_1").html();
                    tra_go_city_obj.city_time_2 = list_go_city.find(".time_2").html();
                    tra_go_city_obj.city_date = list_go_city.attr("data-year");
                    tra_go_city_obj.city_date2 = list_go_city.attr("data-year2");
                    tra_go_city_obj.city_py = list_go_city.find(".city_py").html();
                    tra_go_city_obj.city_id = list_go_city.attr("data-cid");
                    tra_go_city_obj.province_id = list_go_city.attr("data-pid");
                    tra_go_city_obj.city_trc_name = list_go_city.find(".list_trc_name").html(); //交通方式
                    tra_go_city_obj.dis = list_go_city.find(".js_list_dis").html(); //公里
                    tra_go_city_obj.flightTime = list_go_city.find(".traffic_icon_r").attr("data-flt") //飞机时间
                    tra_go_city_obj.trainTime = list_go_city.find(".traffic_icon_r").attr("data-trt") //铁路时间
                    tra_go_city_obj.carTime = list_go_city.find(".traffic_icon_r").attr("data-car") //铁路交通
                    tra_go_city_obj.trafficTime = list_go_city.find(".traffic_icon_r").attr("data-othert") //其他交通时间
                    tra_go_city_obj.position = {
                        lat: Number(list_go_city.attr("data-lat")),
                        lng: Number(list_go_city.attr("data-lng"))
                    };
                    tra_go_city_obj.provinceNames = list_go_city.attr("data-provinceNames");
                    tra_go_city_obj.city_Introduction = list_go_city.attr("data-city_Introduction");
                    tra_go_city_array.push(tra_go_city_obj);
                });
                form_data.go_city_array = tra_go_city_array;

                // console.log(form_data) 
                // var form_data_str = JSON.stringify(form_data);
                // localStorage.setItem("form_data", form_data_str);

                $.post('DragDrop', form_data, function (data) {
                    if (data.status == 'ok') {
                        if (city_data.length == 1) {
                            window.location.href = "/portal/scenerymap/cityAttractions.html";
                            sessionStorage.setItem('isTraveCity','ok')
                        } else {
                            window.setTimeout(function () {
                                $(".prompt_c").fadeIn();
                            }, 2600);
                        }
                    }
                }, 'json');

                //确定
                $(".prompt_det").on("click", function () {
                    window.location.href = "/portal/scenerymap/cityAttractions.html";
                    sessionStorage.setItem('isTraveCity','ok')
                });
                //取消
                $(".prompt_cancel").on("click", function () {
                    $(".prompt_c").fadeOut()
                })
            });
        }

    };
    travelFn.cityProgressbar(100);
    travelFn.traveCityldata();
    


    //上一步
    $(".pre").on("click", function () {
        window.location.href = "/portal/map/customline.html"
    });

    function nav_trc_icon (trc_typeName){
        if (trc_typeName == "铁路交通") {
            $("#js_traffic_ico").css("background-image", "url(/static/v1/img/addStrokeform/train.png)")
        } else if (trc_typeName == "其他交通") {
            $("#js_traffic_ico").css("background-image", "url(/static/v1/img/addStrokeform/otherJT.png)")
        } else {
            $("#js_traffic_ico").css("background-image", "url(/static/v1/img/addStrokeform/air.png)")
        }
    }

})
var YearDate = function (date, days) {
    var d = new Date(date);
    d.setDate(d.getDate() + days);
    var y = d.getFullYear()
    var m = d.getMonth() + 1;
    d = d.getDate();
    if (m >= 1 && m <= 9) {
        m = "0" + m;
    }
    if (d >= 0 && d <= 9) {
        d = "0" + d;
    }

    return y + '.' + m + '.' + d;
}

/* ------------------------返程点----------------
<div class="last_box dis_none">\
    <div class="last_traffic dis_none">\
        <i class="traffic_icon tra_icon"></i><span class="list_trc_name"></span>·<span></span>公里·<span class="trcTime"></span>小时\
        <i class="traffic_icon_r last_traffic_icon_r" data-flt = "{{last.flightTime}}" data-trt = "{{last.trainTime}}"></i>\
    </div>\
    <div class="last_city">\
        <p class="p_text">返程点</p>\
        <label for="last_input" class="last_icon"></label><input type="text" id="last_input" placeholder="请输入您的返程点" value="{{last.city_name}}" />\
        <i class="searchdel"></i>\
    </div>\
</div>\
*/