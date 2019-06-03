// console.log(form_data)
var citypolyOptions;
var polyOptions_array = [];
var addgo_marker_array = [];
var eat_marker_array = [];

var all_city_data_arry = [];
var this_citydata = {};
var addgo_arry = [] //存储我想去数组
var eat_name_arry = [] //存储必吃美食
this_citydata.addgo_arry = [];
this_citydata.eat_name_arry = [];
var get_attr_id;

var icon_style = {};
var spot_markers_arry = [];
var spotPolyline_array = [];
var mapdayNumA = [];
var thisdayNumA = [];
var hover_marker_array = [];
var hover_icon_style = {};
var get_hotel = getUrlParam("hotel");
var get_havI = getUrlParam("havI");
var cityhotel_marker = [];
var hover_hotel_marker = [];

var plan_edit_date;
$(function () {
    var mapFn = {
        initMap: function (center, first_city_name, first_provinceNames) {

            // console.log(first_provinceNames)
            map = new google.maps.Map(document.getElementById('map'), {
                // zoom: 10,
                gestureHandling: 'greedy',
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                scaleControl: true,
                streetViewControl: false,
                center: center,
                // styles: [{
                //     elementType: "labels.icon",
                //     stylers: [{
                //         visibility: "off"
                //     }]
                // }]
            });
            mapFn.mapPolyOptions(first_provinceNames, first_city_name);
        },
        mapPolyOptions: function (provinceName, cityName) {
            switch (provinceName) {
                case "北京":
                    provincesCity(1)
                    break;
                case "上海":
                    provincesCity(1)
                    break;
                case "天津":
                    provincesCity(1)
                    break;
                case "重庆":
                    provincesCity(1)
                    break;
                default:
                    provincesCity(0)
            }

            function provincesCity(iszxs) {
                var get_index = getArrIndex(iszxs == 0 ? cityData.provinces : cityData.municipalities, {
                    n: provinceName
                });
                // console.log(get_index)
                var zoom ;
                if (iszxs == 0) {
                    var cityData_cities = cityData.provinces[get_index].cities;
                    var get_city_index = getArrIndex(cityData_cities, {
                        n: cityName
                    });
                    if (cityData_cities[get_city_index] != undefined) {
                        var get_city_b = cityData_cities[get_city_index].b;
                        citypolyOptions(get_city_b);
                        zoom = cityData_cities[get_city_index].z;
                    }


                } else {
                    var zxs_b = cityData.municipalities[get_index].b
                    citypolyOptions(zxs_b);
                    zoom = cityData.municipalities[get_index].sz;
                }
                if(zoom){
                    map.setZoom(zoom)
                }else{
                    map.setZoom(9)
                }
            };

            function citypolyOptions(path) {
                for (var i = 0; i < polyOptions_array.length; i++) {
                    polyOptions_array[i].setMap(null)
                }

                var paths = mapPaths(path);
                citypolyOptions = new google.maps.Polygon({
                    paths: paths,
                    strokeColor: '#FF0000',
                    strokeOpacity: 1,
                    strokeWeight: 1,
                    fillColor: '#FF0000',
                    fillOpacity: 0.1

                });
                polyOptions_array.push(citypolyOptions);
                citypolyOptions.setPaths(paths)
                citypolyOptions.setMap(map);
            };
        },
        cityMap: function (data, b_index) {
            var this_data = data.list[b_index];
            // console.log(this_data)
            var fitst_center_latlng = {
                lat: parseFloat(this_data.this_city_lat),
                lng: parseFloat(this_data.this_city_lng)
            };
            var first_city_name = this_data.this_city;
            var first_provinceNames = this_data.province;
            google.maps.event.addDomListener(window, "load", mapFn.initMap(fitst_center_latlng, first_city_name, first_provinceNames));

        },
        //景点连线
        city_spot_polyFn: function (day_arry, Dnum_arry) {
            // console.log(Dnum_arry)
            if (typeof Dnum_arry == "object") {
                for (var i = 0; i < day_arry.length; i++) {
                    var day_path_arry = []
                    if (day_arry[i].day != undefined) {
                        for (var a = 0; a < day_arry[i].day.length; a++) {

                            var lat = parseFloat(day_arry[i].day[a].this_lat);
                            var lng = parseFloat(day_arry[i].day[a].this_lng);
                            // console.log(lat)
                            var spot_pos = new google.maps.LatLng(lat, lng)
                            day_path_arry.push(spot_pos);
                            var spot_num = (a + 1).toString();
                            // console.log(day_path_arry)
                            isBlue(Dnum_arry[i], spot_num, a);
                            var this_name = day_arry[i].day[a].this_name;
                            mapFn.spotMarker(spot_pos, this_name);
                        };
                        // console.log(day_path_arry)
                        spotPolyline(day_path_arry);
                    }

                };
            } else {
                var daypath_arry = []
                for (var a = 0; a < day_arry.length; a++) {

                    var lat = parseFloat(day_arry[a].this_lat);
                    var lng = parseFloat(day_arry[a].this_lng);

                    var spot_pos = new google.maps.LatLng(lat, lng)
                    daypath_arry.push(spot_pos);
                    var spot_num = (a + 1).toString();

                    isBlue(Dnum_arry, spot_num, a);
                    var this_name = day_arry[a].this_name;
                    mapFn.spotMarker(spot_pos, this_name);

                };
                spotPolyline(daypath_arry);
            }




            function spotPolyline(path) {
                spot_polyline = new google.maps.Polyline({
                    path: path,
                    //多线段
                    geodesic: true,
                    strokeColor: icon_style.color,
                    strokeOpacity: 1.0,
                    strokeWeight: 3.5,
                });
                spot_polyline.setMap(map);
                spotPolyline_array.push(spot_polyline);
            };

            function isBlue(Dnum, spot_num, a) {
                icon_style.color = "#7daff9";
                if (a == 0) {
                    icon_style.url = "iconnum1";
                    icon_style.num = Dnum;
                    icon_style.point_left = 15;
                    icon_style.point_top = 17;
                } else {
                    icon_style.url = "spot_1";
                    icon_style.num = spot_num;
                    icon_style.point_left = 13;
                    icon_style.point_top = 14;
                }
            };


        },
        spotMarker: function (location, name) {
            // console.log(location)
            var markers = new google.maps.Marker({
                position: location,
                icon: {
                    url: "/static/v1/img/map/" + icon_style.url + ".png",
                    labelOrigin: new google.maps.Point(icon_style.point_left, icon_style.point_top),
                },
                map: map,
                label: {
                    text: icon_style.num,
                    color: icon_style.color,
                    fontWeight: "800",
                }

            });


            spot_markers_arry.push(markers);


            //鼠标放上去
            google.maps.event.addListener(markers, "mouseover",
                function () {
                    mapFn.styleInfowindow(name, markers)
                });
            google.maps.event.addListener(markers, "mouseout",
                function () {
                    ib.open(null, markers);
                });


        },
        cityHotelMarker: function (location, name) {
            // console.log(location)
            var cityhotel_markers = new google.maps.Marker({
                position: location,
                icon: "/static/v1/img/map/hotel2.png",
                map: map
            });
            cityhotel_marker.push(cityhotel_markers);
            //鼠标放上去
            google.maps.event.addListener(cityhotel_markers, "mouseover",
                function () {
                    mapFn.styleInfowindow(name, cityhotel_markers)
                });
            google.maps.event.addListener(cityhotel_markers, "mouseout",
                function () {
                    ib.open(null, cityhotel_markers);
                });
        },
        hover_hotel: function (location, name) {
            var hotel_markers = new google.maps.Marker({
                position: location,
                icon: "/static/v1/img/map/hotel2.png",
                map: map
            });
            hover_hotel_marker.push(hotel_markers);

            mapFn.styleInfowindow(name, hotel_markers)
        },
        //自定义Infowindow
        styleInfowindow: function (name, marker) {
            var boxText = document.createElement("div");
            boxText.classList.add("info")

            boxText.innerHTML = name;
            var myReg = /^[\u4e00-\u9fa5]+$/; //判断是否有英文
            if (!myReg.test(name)) {
                $(".info_text_none").css("font-size", "13px")
            } else {
                $(".info_text_none").css("font-size", "14px")
            }
            var info_top;
            if (marker.label != undefined) {
                var marker_text = marker.label.text;
                if (marker_text.indexOf("D")) {
                    info_top = -60
                } else {
                    info_top = -75
                }
            } else {
                info_top = -75
            }

            $(".info_text_none").html(name)
            var info_width = $(".info_text_none").innerWidth();
            var myOptions = {
                content: boxText,
                disableAutoPan: true,
                maxWidth: 0,
                pixelOffset: new google.maps.Size(-(info_width / 2), info_top),
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
            ib = new InfoBox(myOptions);
            ib.open(map, marker);
        },
        del_hover_marker: function (markerArray) {
            for (var i = 0; i < markerArray.length; i++) {
                markerArray[i].setMap(null)
            };
            markerArray = [];
            $(".infoBox").each(function (i, n) {
                $(".infoBox").eq(i).remove()
            })
        }
    }
    var initFn = {
        initialization: function () {
            if (document.referrer == "") {
                window.location.href = "/";
            }
            //禁止后退
            $(document).ready(function (e) {
                // var counter = 0;
                if (window.history && window.history.pushState) {
                    $(window).on('popstate', function () {
                        window.history.pushState('forward', null, '');
                        window.history.forward(1);
                        // $("#label").html("第" + (++counter) + "次单击后退按钮。");
                        // alert('禁止后退')
                    });
                }
                window.history.pushState('forward', null, ''); //在IE中必须得有这两行
                window.history.forward(1);
            });
            //禁止页面选中文字
            document.onselectstart = function (event) {
                event.returnValue = false;
            };
            sessionStorage.removeItem('is_addSpot')
            sessionStorage.removeItem('is_hotel')
            //表单保存
            $(".save").on("click", function () {
                $('.madeTravelMask').fadeOut();
            });
            var post_url;
            var post_is_edit;
            var post_data = {}
            if (get_hotel == null) {
                // if(get_havI == null){ //---------------------------------------------------------------------
                //     post_url = "do_view"
                // }else{
                //     post_url = "hotelList"
                // }
                post_url = "do_view";
                post_is_edit = sessionStorage.is_edit == 'ok' ? true : false;
                post_is_plan_edit =  sessionStorage.is_plan_edit == 'ok' ? 'ok' : '';
                post_data.is_edit = post_is_edit;
                post_data.is_plan_edit = post_is_plan_edit
            } else {
                post_url = "hotelList";
                post_is_edit = sessionStorage.is_edit == 'ok' ? true : false;
                post_data.is_edit = post_is_edit
                sessionStorage.setItem("is_hotel",'ok')
            }
            $.ajax({
                url: post_url,
                type: "post",
                data: post_data,
                dataType: "json",
                success: function (data) {
                    // console.log(data)
                    if (!data) {
                        return false;
                    } else {
                        $(".loading_box").fadeOut()
                    }

                    _data = data;
                    if (get_hotel == null) {
                        mapFn.cityMap(data, data.this_city_index);
                        templateFn.leftTop_city(data.head);
                        templateFn.allTripTem(data, "list");
                        initFn.tripBlue(data);
                        plan(data.list[data.this_city_index].formData)
                    } else {
                        mapFn.cityMap(data, get_hotel);
                        templateFn.leftTop_city(data.lastInfo.head);
                        templateFn.allTripTem(data, "hotelResult");
                        initFn.tripBlue(data);
                        plan(data.hotelResult[0].formData)
                    };



                }
            });

            function plan(data) {
                var form_data = data
                // 我的出行计划弹窗部分satrt
                $("#custom_title").val(form_data.custom_title).attr("placeholder", form_data.custom_title)
                $(".wap1_day_num").html(form_data.day_num);
                $(".wap2_adult_num").html(form_data.adult);
                $(".wap2_childrent_num").html(form_data.children);
                $(".wap2_traffic").html(form_data.traffic_tools);
                $('#wap3_date').val(form_data.date);
                $(".start_name").html(form_data.departure_city);
                $(".end_name").html(form_data.return_city);
                if (form_data.traffic_tools == "铁路交通") {
                    $("#js_traffic_ico").css("background-image", "url(/static/v1/img/addStrokeform/train.png)");
                } else if (form_data.traffic_tools == "汽车交通") {
                    $("#js_traffic_ico").css("background-image", "url(/static/v1/img/addStrokeform/otherJT.png)");
                } else {
                    $("#js_traffic_ico").css("background-image", "url(/static/v1/img/addStrokeform/air.png)");
                };
            };

            

            //添加酒店
            $(".add_hotel,.prompt_det,.edit_hotel").on("click", function () {
                var hotelcity = $(".tripTab").find(".bgBlue").parents(".cityItem").index();
                window.location.href = "/portal/scenerymap/addHotel.html?hotelcity=" + hotelcity;
            });
            // --------------------------点击显示 该 天的 景点---------------------------------------
            $(".tripTab").on("click", ".jshavDate li", function (e) {
                $(".tripTab").find(".cityName").removeClass("bgBlue");
                $(this).parents(".jshavDate").find(".cityName").addClass("bgBlue");
                var city_index = $(this).parents(".jshavDate").index();
                var city_name = $(".tripTab").find(".cityItem").eq(city_index).find(".cityName").html();
                var this_daynum = $(this).html();
                // console.log(this_daynum)
                mapFn.cityMap(_data, city_index);
                initFn.dayClickMap($(this), city_index, city_name, this_daynum);
                e.cancelBubble = true;
                e.stopPropagation();
            });
            $(".tripBox").on("click", ".trip_blue li", function () {
                // console.log($(this).index())
                var city_index = $(this).parents(".trip_blue").index();
                var city_name = $(this).find(".tlist_city").html();
                var this_daynum = $(this).find(".list_day").html()
                mapFn.cityMap(_data, city_index);
                initFn.dayClickMap($(this), city_index, city_name, this_daynum);
            });

            //tab没有数据
            $(".tripTab").on("click", ".cityItem:not(.jshavDate)", function () {
                var haveindexArray = _data.index;
                // var haveindexArray = ["0","1",""];
                var hI_array = [];
                for (var i = 0; i < haveindexArray.length; i++) {
                    // console.log(haveindexArray[i])
                    if ((haveindexArray[i]).toString() != '') {
                        hI_array.push(i)
                    }
                };
                // console.log(hI_array.toString())
                var hovdata_index = hI_array.toString();
                var this_index = $(this).index();

                if ($('.js_cityDate').find('.js_ul li').html()) {
                    if ($(".js_cityDate .cityHotel").find(".cityHotel_name").html() == "") {
                        $(".prompt_c").fadeIn();
                    } else {
                        // sessionStorage.removeItem('is_edit')
                        window.location.href = "/portal/scenerymap/cityAttractions.html?tI=" + this_index + "&havI=" + hovdata_index;
                    }

                } else {

                    // sessionStorage.removeItem('is_edit')
                    window.location.href = "/portal/scenerymap/cityAttractions.html?tI=" + this_index + "&havI=" + hovdata_index;
                }

                $(".prompt_cancel").on("click", function () {

                    // sessionStorage.removeItem('is_edit')
                    window.location.href = "/portal/scenerymap/cityAttractions.html?tI=" + this_index + "&havI=" + hovdata_index;
                });

            });
            //tab有数据
            $(".tripTab").on("click", ".jshavDate", function () {
                $(".tripTab").find(".cityName").removeClass("bgBlue");
                $(this).find(".cityName").addClass("bgBlue");
                var thisCity_index = $(this).index();
                mapFn.cityMap(_data, thisCity_index);
                initFn.cityClickmap(thisCity_index, _data);
                mapFn.del_hover_marker(cityhotel_marker)
                var getcitydata = get_hotel == null ? _data.list[thisCity_index] : _data.hotelResult[thisCity_index];
                templateFn.ri_cityListFn(getcitydata, thisCity_index);
            });

            //详情
            //弹出关闭
            $(".shut_down").on("click", function () {
                $(".details_popup_box").fadeOut();
            });
            hoverDetailsPopup();

            //相册
            $(".popup_img_box").on('click', ".last_li_img,li", function () {
                $(".more_pic_box").fadeIn();
                initFn.morePictures(_dataspot);
            });
            $(".pic_hide").click(function () {
                $(".more_pic_box").fadeOut();
                $(".gallery-top").html("");
                $(".gallery-thumbs").html("");
            });


            //编辑城市跳转
            $(".edit_but").on("click", function () {
                // if($('.f_main_next').hasClass('next_g')){
                //行程没有做完
                sessionStorage.setItem('is_edit', 'ok')
                // }else{
                //     //行程全部安排完
                //     sessionStorage.setItem('is_Alledit','ok')
                // }


                window.location.href = "/portal/map/customline.html";
            });
        },
        //有数据 蓝
        tripBlue: function (data) {
            // console.log(data)
            var get_index = data.index;
            // console.log(get_index)
            for (var i = 0; i < get_index.length; i++) {
                var b_index = (get_index[i]).toString();
                if (b_index != "") {
                    $(".tripBox .tripItem").eq(b_index).addClass("trip_blue");
                    $(".tripTab").find(".cityItem").eq(b_index).addClass("jshavDate");
                }

            };
            var blue_len = $(".tripBox").find(".trip_blue").length;
            var all_len = $(".tripBox").find(".tripItem").length;
            if (blue_len == all_len) {
                $('.but_box').show().siblings('.first_next').hide();
                $(".f_main_next").addClass("next_b").removeClass("next_g");
            } else {
                $(".f_main_next").addClass("next_g").removeClass("next_b");
            }

            var first_index;
            var rifirst_data;
            if (get_hotel == null) {
                first_index = data.this_city_index;
                rifirst_data = data.list[first_index];

            } else {
                first_index = get_hotel;
                rifirst_data = data.hotelResult[first_index];
            }

            templateFn.ri_cityListFn(rifirst_data, first_index);
            $(".tripTab").find(".cityName").eq(first_index).addClass("bgBlue");
            $(".tripBox").find(".tripItem").eq(first_index).find("li").each(function (i, n) {
                var day_num = $(n).find(".list_day").html();
                mapdayNumA.push(day_num)
            });
            mapFn.city_spot_polyFn(rifirst_data.day_arry, mapdayNumA);


            // ------------------------------------------------------------

            $(".tripBox").on("click", ".trip_blue .itemTop", function () {
                var this_index = $(this).parents(".trip_blue").index();
                $(".tripTab").find(".cityName").removeClass("bgBlue");
                $(".tripTab").find(".cityItem").eq(this_index).find(".cityName").addClass("bgBlue");
                mapFn.cityMap(data, this_index);
                // console.log(data)
                initFn.cityClickmap(this_index, data);
                mapFn.del_hover_marker(cityhotel_marker)
                var getcitydata = get_hotel == null ? _data.list[this_index] : _data.hotelResult[this_index];
                templateFn.ri_cityListFn(getcitydata, this_index);
            });
            //安排行程
            initFn.arrangeSchedule();

        },
        //del map
        delMap: function () {
            for (var i = 0; i < spotPolyline_array.length; i++) {
                spotPolyline_array[i].setMap(null);
            }
            spotPolyline_array = [];
            for (var i = 0; i < spot_markers_arry.length; i++) {
                spot_markers_arry[i].setMap(null);
            };
            spot_markers_arry = [];
            $(".infoBox").each(function (i, n) {
                $(".infoBox").eq(i).remove()
            })
        },
        dayClickMap: function ($this, city_index, city_name, Dnum) {
            // console.log(city_name)
            $(".js_cityDate").hide();
            $(".js_dayDate").show();

            var day_index = $this.index();
            // console.log(day_index)
            $(".tripTab li,.cityName").removeClass("bgBlue");
            $(".tripTab .cityItem").eq(city_index).find("li").eq(day_index).addClass("bgBlue").end();
            $(".tripTab .cityItem").eq(city_index).find(".cityName").addClass("bgBlue").end();

            $(".js_dayDate").find(".dayum").html(Dnum).end()
                .find(".riCity_name").html(city_name + "-");
            initFn.delMap()
            $.ajax({
                url: "right_list",
                type: "post",
                dataType: "json",
                data: {
                    cityindex: city_index,
                    dayindex: day_index
                },
                success: function (data) {
                    // console.log(data)
                    templateFn.ri_dayListFn(data, day_index, city_index);
                    var get_day = data.jingdian;
                    mapFn.city_spot_polyFn(get_day, Dnum);
                    initFn.hover_list()
                }
            });
        },
        cityClickmap: function (this_index, data) {
            // console.log(this_index)
            $(".js_dayDate").hide();
            $(".js_cityDate").show();
            initFn.delMap();
            $(".tripTab").find("li").removeClass("bgBlue");
            thisdayNumA = []
            $(".tripBox").find(".tripItem").eq(this_index).find("li").each(function (i, n) {
                var thisday_num = $(n).find(".list_day").html();
                thisdayNumA.push(thisday_num)
            });
            var this_city_data = data.list[this_index].day_arry;
            // console.log(thisdayNumA)
            mapFn.city_spot_polyFn(this_city_data, thisdayNumA);
        },

        //hover 景点 list 地图标记点亮
        hover_list: function () {
            $(".js_dayDate .dayspot").hover(function () {
                var this_list = $(this);
                var this_name = this_list.find(".daysport_name").html();
                var lat = parseFloat(this_list.attr("data-lat"));
                var lng = parseFloat(this_list.attr("data-lng"));
                var first_dayNum = this_list.parents(".js_dayDate").find(".dayum").html();
                var this_index = $(this).parents("li").index();
                // console.log(this_index)
                var location = {
                    lat: lat,
                    lng: lng
                }

                if (this_index == 0) {
                    hover_icon_style.this_num = first_dayNum;
                    hover_icon_style.icon_url = "iconnum1";
                    hover_icon_style.point_left = 15;
                    hover_icon_style.point_top = 17;
                } else {
                    hover_icon_style.this_num = (this_index + 1).toString();
                    hover_icon_style.icon_url = "spot_1";
                    hover_icon_style.point_left = 13;
                    hover_icon_style.point_top = 14
                }
                var Marker = new google.maps.Marker({
                    position: location,
                    icon: {
                        url: "/static/v1/img/map/" + hover_icon_style.icon_url + ".png",
                        labelOrigin: new google.maps.Point(hover_icon_style.point_left, hover_icon_style.point_top),
                    },
                    label: {
                        text: hover_icon_style.this_num,
                        color: "#7daff9",
                        fontWeight: "800",
                    },
                    map: map
                });
                mapFn.styleInfowindow(this_name, Marker)
                hover_marker_array.push(Marker);

            }, function () {
                mapFn.del_hover_marker(hover_marker_array)
            })
        },
        //登录
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
                        window.location.href = "/portal/itinerary/addServer.html"
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
                    initGeetest({
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
                                window.location.href = "/portal/itinerary/addServer.html";
                                // $('.registerWap').hide().addClass("dis_none").siblings('.listWap').show().removeClass("dis_none");
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
        //详情 附近推荐 我想去
        details_tj_go: function () {
            //详情 我想吃
            $(".rwpopup_tab3_ul").on("click", ".js_tj_food_list .js_tj_food_go", function () {

                initFn.add_eatFn($(this), ".js_tj_food_list", ".spot_name");
            });
            //详情 我想去
            $(".rwpopup_tab3_ul").on("click", ".tj_jDshop_list .tj_jDshop_go", function () {

                initFn.add_goFn($(this), ".tj_jDshop_list", ".spot_name");

            });
        },

        //景点详情 弹出程
        details_popup: function () {

            //店铺
            $(".r_main .list").on("click", ".introduce,.list_l", function () {
                var list = $(this).parents(".list");
                var this_index = list.index();
                var name = list.find(".attractions_name").html();
                var lat = list.attr("data-lat");
                var lng = list.attr("data-lng");
                var detail_ajax_url;
                var r_top_active = $(".r_top_tab_ul").find(".active").text();
                var post_data = {
                    city_id: $(".js_map_head_ul").find(".active").attr("data-cityid"),
                    spot_name: name,
                    type: r_top_active,
                    lat: lat,
                    lng: lng
                };

                switch ($(".floor_box").find(".active").index()) {
                    case 0:
                        detail_ajax_url = "renwen_detail";
                        break;
                    case 1:
                        detail_ajax_url = "local_detail";
                        break;
                    case 2:
                        detail_ajax_url = "night_detail";
                        break;
                    case 3:
                        detail_ajax_url = "food_detail";
                        break;
                    case 4:
                        detail_ajax_url = "shop_detail";
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
                        if (detail_ajax_url == "food_detail" || detail_ajax_url == "shop_detail") {
                            if (tab_text == "必吃美食") {
                                details_popup_show(".f4_details_popup_box");
                                templateFn.f4_store_detailsPopup(data);
                                _dataspot = data.spot.store;
                            } else if (tab_text == "本土美食") {
                                details_popup_show(".f4tab2_details_popup_box");
                                templateFn.f4tab2_detailsPopup(data);
                                _dataspot = data.store;
                            } else if (tab_text == "美食街区") {
                                details_popup_show(".foodstreet_details_popup_box");
                                templateFn.foodstreet_detailsPopup(data.spot);
                                _dataspot = data.spot;
                            } else {
                                details_popup_show(".f5_details_popup_box");
                                templateFn.f5_tab2_3_detailsPopup(data);
                                _dataspot = data.spot;
                                return
                            }
                        } else {
                            details_popup_show(".rw_details_popup_box");
                            _dataspot = data.spot;
                            templateFn.detailsPopup(data, this_index);
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
                    }
                });
            });
            //菜品和商品
            $(".r_main .show_store_list").on("click", ".store_introduce,.store_list_l", function () {
                var list = $(this).parents(".show_store_list");
                var name = list.find(".attractions_name").html();
                var lat = list.attr("data-lat");
                var lng = list.attr("data-lng");
                var detail_ajax_url;
                var r_top_active = $(".r_top_tab_ul").find(".active").text();
                var post_data = {
                    spot_name: name,
                    type: r_top_active,
                    city_id: $(".js_map_head_ul").find(".active").attr("data-cityid"),
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
                        templateFn.eatgoods_detailsPopup(data, tab_text);

                    }
                });
            });
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
                                    {{each image_url as value i}}\
                                    <div class="swiper-slide" style="background-image:url({{value}})"><div class="img_text_box">上传于{{release_time}}·<span class="js_byName"></span></div></div>\
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

                loopedSlides: img_length,
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
                loopedSlides: img_length,
                slideToClickedSlide: true,
            });

            galleryTop.controller.control = galleryThumbs;
            galleryThumbs.controller.control = galleryTop;
        },
        //下一步
        arrangeSchedule: function () {
            // initFn.loginFn()
            
            $(".next_b").on("click", function () {
                if (!$('.tripTab li').hasClass('bgBlue')) {
                    var hotel_textarr = [];
                    $('.js_cityDate .riCity li').each(function (i, n) {
                        var hotel_text = $(n).find('.cityHotel_name').text();
                        if (hotel_text == '') {
                            if(plan_edit_date != 0){
                                $('.prompt_c').show();
                                hotel_textarr.push(i);
                            }
                           
                        }
                    });
                    if (hotel_textarr.length != 0) {
                        if(plan_edit_date != 0){
                            $('.prompt_c').show();
                            hotel_textarr.push(i);
                        }
                        $(".prompt_cancel").on("click", function () {
                            initFn.next_post()
                        });
                    } else {
                        initFn.next_post()
                    }
                }else{
                    $('.tripTab li').each(function(i,n){
                        //类名的索引
                        if($(this).context.className != ''){
                            //不是最后一天
                            if(i != $('.tripTab li').length-1){
                                var day_hotel = $('.js_dayDate .hotelName').text();
                                if(day_hotel){
                                    initFn.next_post()
                                }else{
                                    if(plan_edit_date != 0){
                                        $('.prompt_c').show();
                                        hotel_textarr.push(i);
                                    }
                                    $(".prompt_cancel").on("click", function () {
                                        initFn.next_post()
                                    });
                                }
                            }else{ //最后一天不添加酒店
                                initFn.next_post()
                            }
                        }
                        
                    })
                    
                    

                }

            });

        },
        next_post: function () {
            var post_formData = {};
            post_formData.adult = $(".cartBox").find(".wap2_adult_num").html();
            post_formData.children = $(".cartBox").find(".wap2_childrent_num").html();
            post_formData.custom_title = $(".cartBox").find("#custom_title").val();

            post_formData.date = $(".cartBox").find("#wap3_date").val();
            post_formData.day_num = $(".cartBox").find(".wap1_day_num").html();
            post_formData.departure_city = $(".cartBox").find(".start_name").html();
            post_formData.return_city = $(".cartBox").find(".end_name").html();
            post_formData.traffic_tools = $(".cartBox").find(".wap2_traffic").html();
            $.post("login_name", {
                form_data: post_formData
            }, function (data) {
                // console.log(data)
                if (data == null) {
                    initFn.loginFn()
                } else {
                    window.location.href = "/portal/itinerary/addServer.html";
                };
            }, "json")
        }
    }

    var templateFn = {
        leftTop_city: function (data) {
            var dataCity = data.city
            var departure_date_arry = data.departure_date.split("-");
            $(".departure_date").html(departure_date_arry[1] + "-" + departure_date_arry[2]);
            $(".top_departure_city").html(data.departure_city);
            var return_date_arry = data.return_date.split("-");
            $(".return_date").html(return_date_arry[1] + "-" + return_date_arry[2]);
            $(".top_last_city").html(dataCity[dataCity.length - 1]);
            $(".top_return_city").html(data.return_city);

            $(".top_date").html(parseInt(departure_date_arry[1]) + "." + parseInt(departure_date_arry[2]) + "-" + parseInt(return_date_arry[1]) + "." + parseInt(return_date_arry[2]))
            //城市渲染
            var leftop_city_ul_tem = '{{each city as value i}}\
              {{if i == city.length - 1}}\
                  <li>{{value}}</li>\
              {{else}}\
                  <li>{{value}}，</li>\
              {{/if}}\
              {{/each}}';
            var leftop_city_ul_render = template.compile(leftop_city_ul_tem);
            var leftop_city_ul_html = leftop_city_ul_render(data);
            $(".leftop_city_ul").html(leftop_city_ul_html);

            
            
        },
        allTripTem: function (data, getList) {
            // console.log(data)
            var allTriptem = '{{each ' + getList + ' as value i}}\
                            <div class="tripItem">\
                                <div class="itemTop clearfix">\
                                    <i class="city_icon fl"></i><span class="itemTop_city fl">{{value.this_city}}</span><span class="itemTop_date fr">{{value.betw}}</span>\
                                </div>\
                                <ul class="item_ul">\
                                    {{each value.day_arry as v a}}\
                                        <li>\
                                            <div class="clearfix"><span class="list_day fl"></span><span class="fr list_date">{{v.date}}</span></div>\
                                            {{if v.start_time == undefined}}\
                                                <div class="clearfix"><span class="tlist_city fl">{{value.this_city}}</span><span class="fr listTime"></span></div>\
                                            {{else}}\
                                                <div class="clearfix"><span class="tlist_city fl">{{value.this_city}}</span><span class="fr listTime">{{v.start_time}}-{{v.end_time}}</span></div>\
                                            {{/if}}\
                                        </li>\
                                    {{/each}}\
                                </ul>\
                            </div>\
                            {{/each}}';
            var allTriprender = template.compile(allTriptem);
            var allTimehtml = allTriprender(data);
            $(".tripBox").html(allTimehtml);

            var tripTabtem = '{{each list as value i}}\
                                <div class="cityItem fl">\
                                    <div class="cityName">{{value.this_city}}</div>\
                                    <div class="dayBox">\
                                        <ul>\
                                            {{each value.day_arry as v a}}\
                                                <li></li>\
                                            {{/each}}\
                                        </ul>\
                                    </div>\
                                </div>\
                            {{/each}}'
            var tripTabrender = template.compile(tripTabtem);
            var tripTabhtml = tripTabrender(data);
            $(".tripTab").html(tripTabhtml);
            var tripTab_wdth = $(".tripTab").width() / 2;
            $(".tripTab").css("left", "calc(50% - " + tripTab_wdth + "px)");
            $(".tripTab .cityItem").each(function (i, n) {
                if ($(n).find("li").length == 1) {
                    var min_width = $(".tripTab .cityItem").eq(i).outerWidth(true);
                    $(".tripTab .cityItem").eq(i).find("li").css("min-width", min_width + "px");
                }
            })
            $(".tripBox li").each(function (i, n) {
                $(n).find(".list_day").html("D" + Number(i + 1));
                $(".tripTab li").eq(i).html("D" + Number(i + 1));
            });

        },
        ri_cityListFn: function (data, index) {
            // console.log(_data)
            // console.log(data)
            var day_arrylen = _data.list[0].day_arry.length
            // console.log(day_arrylen)
            var city_len = _data.index.length;
            var riList_city = '{{each day_arry as value i}}\
                                {{if day_arry.length >= 2}}\
                                    {{if i < day_arry.length-1}}\
                                        <li>\
                                            <div class="clearfix"><span class="riDay fl"></span><span class="riDate fr">{{value.date}}</span></div>\
                                            {{if value.hotel.hotel_name != ""}}\
                                                <div class="cityHotel" data-lat={{value.hotel.lat}} data-lng={{value.hotel.lng}}><i class="hotelIcon"></i><span class="cityHotel_name"  title="{{value.hotel.hotel_name}}">{{value.hotel.hotel_name}}</span></div>\
                                            {{else}}\
                                                <div class="cityHotel dis_none"><i class="hotelIcon"></i><span class="cityHotel_name" title=""></span></div>\
                                            {{/if}}\
                                        </li>\
                                    {{/if}}\
                                {{else}}\
                                    {{if ' + city_len + ' == 1}}\
                                        <li>\
                                            <div class="clearfix"><span class="riDay fl"></span><span class="riDate fr">{{value.date}}</span></div>\
                                            {{if value.hotel.hotel_name != ""}}\
                                                <div class="cityHotel" data-lat={{value.hotel.lat}} data-lng={{value.hotel.lng}}><i class="hotelIcon"></i><span class="cityHotel_name"  title="{{value.hotel.hotel_name}}">{{value.hotel.hotel_name}}</span></div>\
                                            {{else}}\
                                                <div class="cityHotel dis_none"><i class="hotelIcon"></i><span class="cityHotel_name" title=""></span></div>\
                                            {{/if}}\
                                        </li>\
                                    {{/if}}\
                                {{/if}}\
                            {{/each}}'
            // -----------第一个城市只有一天
            // {{ if '+ day_arrylen +' == 1}}\
            // <li class="dis_none">\
            //     <div class="clearfix"><span class="riDay fl"></span><span class="riDate fr">{{value.date}}</span></div>\
            //     {{if value.hotel.hotel_name != ""}}\
            //         <div class="cityHotel" data-lat={{value.hotel.lat}} data-lng={{value.hotel.lng}}><i class="hotelIcon"></i><span class="cityHotel_name"  title="{{value.hotel.hotel_name}}">{{value.hotel.hotel_name}}</span></div>\
            //     {{else}}\
            //         <div class="cityHotel dis_none"><i class="hotelIcon"></i><span class="cityHotel_name" title=""></span></div>\
            //     {{/if}}\
            // </li>\
            // {{/if}}\
            var riList_render = template.compile(riList_city);
            var riList_html = riList_render(data);
            $(".js_cityDate .js_ul").html(riList_html);

            if (data.status == 0 || data.status == 2) {
                var preli = $(".tripBox .tripItem").eq(index - 1).find(".item_ul li:last");
                var preDnum = preli.find(".list_day").text();
                var preDate = preli.find(".list_date").text();
                var str;
                if (data.prevHotel != undefined) {
                    var pre_hotelDate = data.prevHotel.hotel;
                    var pre_hotel_name = pre_hotelDate.hotel_name;
                }
                // console.log(data)
                if (data.prevHotel != undefined && pre_hotelDate.hotel_name != '') {
                    str = '<li>\
                        <div class="clearfix"><span class="riDay fl">' + preDnum + '</span><span class="riDate fr">' + preDate + '</span></div>\
                        <div class="cityHotel" data-lat=' + pre_hotelDate.lat + ' data-lng=' + pre_hotelDate.lng + '><i class="hotelIcon"></i><span class="cityHotel_name" title="' + pre_hotel_name + '">' + pre_hotel_name + '</span></div>\
                    </li>';
                } else {
                    str = '<li>\
                        <div class="clearfix"><span class="riDay fl">' + preDnum + '</span><span class="riDate fr">' + preDate + '</span></div>\
                        <div class="cityHotel dis_none"><i class="hotelIcon"></i><span class="cityHotel_name" title=""></span></div>\
                    </li>';
                };
                $(".js_ul").prepend(str)
            }

            $(".tripBox").find(".tripItem").eq(index).find("li").each(function (i, n) {
                var day_num = $(n).find(".list_day").html();
                if (data.status == 0 || data.status == 2) {
                    var pre_dayNum = $(".tripBox").find(".tripItem").eq(index).find("li").eq(i - 1).find(".list_day").html();
                    if (i > 0) {
                        $(".riCity").find("li").eq(i).find(".riDay").html(pre_dayNum);
                    }
                } else {
                    $(".riCity").find("li").eq(i).find(".riDay").html(day_num);
                }

            });
            var start_date = $(".js_cityDate .js_ul li:first").find(".riDate").text();
            var lats_date = $(".js_cityDate .js_ul li:last").find(".riDate").text();
            $(".js_cityDate").find(".riCity_name").html(data.this_city + "住宿");
            if (start_date != '') {
                $(".js_cityDate").find(".rt_date").html(start_date + "-" + lats_date);
            } else {
                var oneDay_index = $('.tripTab').find('.bgBlue').parents('.cityItem').index();
                var oneDay_date = $(".tripBox").find('.tripItem').eq(oneDay_index).find('li:first').find('.list_date').html();
                $(".js_cityDate").find(".rt_date").html(oneDay_date);
            };
            
            var gethadeDate = _data.lastInfo?_data.lastInfo.head:_data.head;
            plan_edit_date = contrastTime(gethadeDate.departure_date);
            //判断个人中心编辑后的日历
            function contrastTime(start) {
                var dB = new Date(start.replace(/-/g, "/"));//获取当前选择日期
                // console.log(dB,new Date())
                var newDate = new Date();
                var nDate = new Date(newDate.getYear()+1900,newDate.getMonth(),newDate.getDate()); //当前日期
                // console.log(nDate)
                if ( dB < nDate) {
                    return 0;
                }else{
                    return 1;
                }
            }
            
            $(".js_cityDate li").each(function (i, n) {
                var lat = parseFloat($(n).find(".cityHotel").attr("data-lat"));
                var lng = parseFloat($(n).find(".cityHotel").attr("data-lng"));
                var location = {
                    lat: lat,
                    lng: lng
                };
                var name = $(n).find(".cityHotel_name").html();
                mapFn.cityHotelMarker(location, name);
                
                
                if(plan_edit_date == 0){
                    $('.add_hotel,.edit_hotel').hide()
                }else{
                    if ($(".js_cityDate li").eq(i).find('.cityHotel').hasClass("dis_none")) {
                        $(".edit_hotel").hide().siblings(".add_hotel").show()
                    } else {
                        $(".edit_hotel").show().siblings(".add_hotel").hide()
                    }
                }
                   
                
               
               

            });
            mapFn.del_hover_marker(hover_hotel_marker);

            $(".js_cityDate li").hover(function () {
                var lat = parseFloat($(this).find(".cityHotel").attr("data-lat"));
                var lng = parseFloat($(this).find(".cityHotel").attr("data-lng"));
                var name = $(this).find(".cityHotel .cityHotel_name").html();
                var location = {
                    lat: lat,
                    lng: lng
                };
                if (lat && lng != NaN) {
                    mapFn.hover_hotel(location, name);
                };
            }, function () {
                // mapFn.del_hotelHover()
                mapFn.del_hover_marker(hover_hotel_marker)
            });


            var eat_data = _data.list[index].eat_data;
            // console.log(eat_data)
            if (eat_data == undefined) {
                $(".eat_box ul").html('选择0美食');
                $(".foodIcon").hide()
            } else {
                //美食hover
                $(".foodIcon").hover(function () {
                    var offset = $(this).offset();
                    $(".eat_box").show().offset({
                        left: offset.left,
                        top: offset.top + 25
                    });
                }, function () {
                    $(".eat_box").hide();
                });

                $(".foodIcon").show()
                var str = '';
                for (var i = 0; i < eat_data.length; i++) {
                    var eat_name = eat_data[i].name;
                    var lat = eat_data[i].lat;
                    var lng = eat_data[i].lng;
                    str += '<li data-lat=' + lat + ' data-lng=' + lng + ' >' + eat_name + '</li>';
                }
                $(".eat_box ul").html(str)
            }
        },
        ri_dayListFn: function (data, day_index, city_index) {
            var riList_day = '{{each jingdian as value i}}\
                            <li>\
                                <div class="clearfix dayspot" data-lat="{{value.this_lat}}" data-lng="{{value.this_lng}}">\
                                    <div class="fl"><span class="daynum">{{i+1}}</span><span class="daysport_name" title="{{value.this_name}}">{{value.this_name}}</span></div>\
                                    <div class="sport_icon floor_{{value.this_floor_index}} fr"></div>\
                                </div>\
                                <div class=""></div>\
                            </li>\
                            {{/each}}'
            var riList_render = template.compile(riList_day);
            var riList_html = riList_render(data);
            // console.log(data)
            $(".js_dayDate").find(".js_ul").html(riList_html).end()
                .find(".daydate").html(data.date).end()
                .find(".daytime").html(data.start_time +'-'+ data.end_time).end();

            var last_city = data.status;
            if (get_hotel == null) {
                $(".dayHotel").hide().removeAttr("data-lat").removeAttr("data-lng").find(".hotelName").html("").removeAttr("title");
            } else {

                var this_dayArray = _data.hotelResult[city_index].day_arry;
                var hotel_name;
                if (day_index == this_dayArray.length - 1) {
                    if (last_city != 3) {
                        var this_date = this_dayArray[day_index].date;
                        var next_preHotel = _data.hotelResult[city_index + 1];
                        if (next_preHotel != undefined) {
                            var next_hotel = next_preHotel.prevHotel;
                            if (next_hotel != undefined) {
                                var next_date = next_hotel.date;
                                hotel_name = next_hotel.hotel.hotel_name;
                                if (this_date == next_date && hotel_name != '') {

                                    $(".dayHotel").show().attr("data-lat", next_hotel.hotel.lat).attr("data-lng", next_hotel.hotel.lng).find(".hotelName").html(hotel_name).attr("title", hotel_name);
                                } else {
                                    $(".dayHotel").hide().removeAttr("data-lat").removeAttr("data-lng").find(".hotelName").html("").removeAttr("title");
                                };
                            } else {
                                $(".dayHotel").hide().removeAttr("data-lat").removeAttr("data-lng").find(".hotelName").html("").removeAttr("title");
                            }
                        } else {
                            $(".dayHotel").hide().removeAttr("data-lat").removeAttr("data-lng").find(".hotelName").html("").removeAttr("title");
                        }
                    } else {

                        if (this_dayArray.length < 2) {
                            if (this_dayArray[day_index].hotel != undefined) {
                                var only_city_day = this_dayArray[day_index].hotel;
                                var only_hotel_name = only_city_day.hotel_name;
                                $(".dayHotel").show().attr("data-lat", only_city_day.lat).attr("data-lng", only_city_day.lng).find(".hotelName").html(only_hotel_name).attr("title", only_hotel_name);
                            } else {
                                $(".dayHotel").hide().removeAttr("data-lat").removeAttr("data-lng").find(".hotelName").html("").removeAttr("title");
                            }
                        } else {
                            $(".dayHotel").hide().removeAttr("data-lat").removeAttr("data-lng").find(".hotelName").html("").removeAttr("title");
                        }

                    }
                } else {
                    var list_hotel = this_dayArray[day_index].hotel
                    hotel_name = list_hotel.hotel_name;
                    if (hotel_name == "") {
                        $(".dayHotel").hide().removeAttr("data-lat").removeAttr("data-lng").find(".hotelName").html("").removeAttr("title");
                    } else {
                        $(".dayHotel").show().attr("data-lat", list_hotel.lat).attr("data-lng", list_hotel.lng).find(".hotelName").html(hotel_name).attr("title", hotel_name);
                    }

                };

                mapFn.del_hover_marker(cityhotel_marker)
                var hotel_lat = parseFloat($(".dayHotel").attr("data-lat"));
                var hotel_lng = parseFloat($(".dayHotel").attr("data-lng"));
                var location = {
                    lat: hotel_lat,
                    lng: hotel_lng
                };
                mapFn.cityHotelMarker(location, hotel_name);

                mapFn.del_hover_marker(hover_hotel_marker);
                $(".dayHotel").hover(function () {
                    mapFn.del_hover_marker(hover_hotel_marker)
                    var lat = parseFloat($(this).attr("data-lat"));
                    var lng = parseFloat($(this).attr("data-lng"));
                    var name = $(this).find(".hotelName").html();
                    var location = {
                        lat: lat,
                        lng: lng
                    };
                    mapFn.hover_hotel(location, name);

                }, function () {
                    mapFn.del_hover_marker(hover_hotel_marker)
                })
            };
            // console.log(data)
            if (data.dis == undefined) {
                $(".trafficBox").hide();
            } else {
                var traffic_icon;
                var traffic_time;
                if (data.city_trc_name == "飞机交通") {
                    traffic_icon = "air";
                    traffic_time = data.flightTime
                } else if (data.city_trc_name == "铁路交通") {
                    traffic_icon = "railway";
                    traffic_time = data.trainTime
                } else {
                    traffic_icon = "other";
                    traffic_time = data.trafficTime
                }
                $(".departureType").find(".traffic_icon").addClass(traffic_icon).end()
                    .find("span").html(data.city_trc_name + "·" + data.dis + "公里·" + traffic_time + "小时");

                //出发城市---当前城市top
                if (data.departure_city == undefined) {
                    $(".departure_city").hide();
                } else {
                    $(".departure_city").show().find(".departure_div span").html(data.departure_city).end()
                        .find(".Bootom_this_city span").html(data.this_city);

                };
                //当前城市---下一个城市bottom
                if (data.next_city == undefined) {
                    $(".next_city").hide()
                } else {
                    $(".next_city").show().find(".Top_this_city span").html(data.this_city).end()
                        .find(".nextCity span").html(data.next_city);
                };
                if (data.return_city == undefined) {
                    $(".return_city").hide();
                } else {
                    $(".return_city").show().find(".Top_this_city span").html(data.this_city).end()
                        .find(".nextCity span").html(data.return_city);
                }
            };
        },

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
            templateFn.popup_img(spot_data)
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
                                    <li class="clearfix js_tj_food_list" id="tj' + id_index + '_food_{{i}}" data-lat="{{value.latitude}}" data-lng="{{value.longitude}}">\
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
                                        <div class="go js_tj_food_go">我想去</div>\
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
                                        <div class="go tj_jDshop_go">我想去</div>\
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
                                        <div class="go tj_jDshop_go">我想去</div>\
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
        //必吃美食——本土特产
        eatgoods_detailsPopup: function (data, tab_text) {
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
        },
        f4_store_detailsPopup: function (data) {
            // console.log(data)
            var data_sport = data.spot.store;
            $(".f4_top_details_text").find(".p1").html(data_sport.store_name).end()
                .find(".meal_time").html(data_sport.meal_time).end()
                .find(".per_capita").html(data_sport.per_capita).end()
                .find(".tel").html(data_sport.phone).end()
                .find(".address").html(data_sport.address).end();
            templateFn.popup_img(data_sport);
            $(".f4_details_popup_box .popup_tab1").find(".Introduction").html(data_sport.Introduction).end()
                .find(".type").html(data_sport.type).end()
                .find(".per_capita").html(data_sport.per_capita).end()
                .find(".meal_time").html(data_sport.meal_time).end()
                .find(".business_hours").html(data_sport.business_hours).end()
                .find(".phone").html(data_sport.phone).end()
                .find(".address_name").html(data_sport.address).end()
                .find(".update_time").html(data_sport.release_time).end();
            if (data_sport.tebie_tuijian != '') {
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
            }
        },
        f4tab2_detailsPopup: function (data) {
            // console.log(data)
            var data_sport = data.store;
            $(".f4tab2_top_details_text").find(".p1").html(data_sport.store_name).end()
                .find(".meal_time").html(data_sport.meal_time).end()
                .find(".per_capita").html(data_sport.per_capita).end()
                .find(".tel").html(data_sport.phone).end()
                .find(".address").html(data_sport.address).end();
            templateFn.popup_img(data_sport);
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
            }

            //分店
            $(".branch_title span").html("(" + data.fen.length + ")");
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
                $(".branch_ul").html("");
            } else {
                $(".branch_ul").html(branch_html);
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
            templateFn.popup_img(data);
        },
        f5_tab2_3_detailsPopup: function (data) {
            var data_sport = data.spot;
            $(".f5_top_details_text").find(".p1").html(data_sport.shopping_name).end()
                .find(".p2").html(data_sport.type).end()
                .find(".tel").html(data_sport.phone).end()
                .find(".address").html(data_sport.address).end();
            templateFn.popup_img(data_sport);
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
    var cityAttractions = {

        downFn: function () {
            //提示框关闭
            $(".prompt_but").on("click", function () {
                $(".prompt").fadeOut();
            });
            //取消
            $(".prompt_cancel").on("click", function () {
                $(".prompt").fadeOut();
            });

        }
    };

    initFn.initialization();
    // cityAttractions.Progressbar(0);
    cityAttractions.downFn();

});