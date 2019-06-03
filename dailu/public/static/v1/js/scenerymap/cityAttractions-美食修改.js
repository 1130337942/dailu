var citypolyOptions;
var jumptimer = null;
var polyOptions_array = [];
var addgo_marker_array = [];
var eat_marker_array = [];
var hover_list_marker_array = [];


var this_citydata = {};
var addgo_arry = [] //存储我想去数组
var eat_name_arry = []; //存储必吃美食
this_citydata.addgo_arry = [];
this_citydata.eat_name_arry = [];
var get_attr_id;

var get_url_havI = getUrlParam("havI");
var get_url_tI = getUrlParam("tI");

var dayTime_arr = [];


var sportEat_time_arr = [];
var getEat_data;
$(function () {
    var mapFn = {
        initMap: function (center, get_first_city_data, first_city_name) {

            map = new google.maps.Map(document.getElementById('map'), {
                // zoom: 9,
                gestureHandling: 'greedy',
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                scaleControl: true,
                streetViewControl: false,
                center: center,
            });
            var first_provinceNames = get_first_city_data.provinceNames;
            mapFn.mapPolyOptions(first_provinceNames, first_city_name)
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
                var zoom ;
                if (iszxs == 0) {
                    var cityData_cities = cityData.provinces[get_index].cities;
                    // console.log(cityData_cities)
                    // console.log(cityName)
                    var get_city_index = getArrIndex(cityData_cities, {
                        n: cityName
                    });
                    
                    if (cityData_cities[get_city_index] != undefined) {
                        var get_city_b = cityData_cities[get_city_index].b;
                       
                        zoom = cityData_cities[get_city_index].z
                        
                        citypolyOptions(get_city_b);
                    }

                } else {
                    var zxs_b = cityData.municipalities[get_index].b
                    zoom = cityData.municipalities[get_index].sz//(直辖市)
                    citypolyOptions(zxs_b);
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
        //hover list marker
        hover_list_marker: function (location, floor_index, this_name) {
            // console.log(location)
            $(".infoBox").each(function (i, n) {
                $(this).remove()
            })
            var center_pos = new google.maps.LatLng(location.lat, location.lng);
            // map.setCenter(center_pos);
            var Marker = new google.maps.Marker({
                position: location,
                icon: "/static/v1/img/map/mark" + floor_index + ".png",
                map: map
            });

            //定义信息窗口
            mapFn.styleInfowindow(this_name, Marker)
            hover_list_marker_array.push(Marker);
        },
        del_hover_list_marker: function () {
            for (var i = 0; i < hover_list_marker_array.length; i++) {
                hover_list_marker_array[i].setMap(null);
            };
            hover_list_marker_array = [];
            $(".infoBox").each(function (i, n) {
                $(this).remove()
            })
        },
        //我想去\我想吃 标记点
        addgo_marker: function (location, floor_index, this_name) {
            $(".infoBox").each(function (i, n) {
                $(this).remove()
            })
            // // console.log(location)
            var addgo_Marker = new google.maps.Marker({
                position: location,
                icon: "/static/v1/img/map/mark" + floor_index + ".png",
                map: map
            });


            addgo_marker_array.push(addgo_Marker);
            // console.log(addgo_marker_array)
            //鼠标放上去
            google.maps.event.addListener(addgo_Marker, "mouseover",
                function () {
                    mapFn.styleInfowindow(this_name, addgo_Marker)
                });
            google.maps.event.addListener(addgo_Marker, "mouseout",
                function () {
                    $(".infoBox").each(function (i, n) {
                         $(this).remove()
                    })
            });

            
        },
        //我想吃
        eat_marker: function (location, this_name) {
            $(".infoBox").each(function (i, n) {
                $(".infoBox").eq(i).remove()
            })
            var eat_Marker = new google.maps.Marker({
                position: location,
                icon: "/static/v1/img/map/mark" + 3 + ".png",
                map: map
            });

            eat_marker_array.push(eat_Marker);
            //鼠标放上去
            google.maps.event.addListener(eat_Marker, "mouseover",
                function () {
                    mapFn.styleInfowindow(this_name, eat_Marker)
                });
            google.maps.event.addListener(eat_Marker, "mouseout",
                function () {
                    id.open(null, eat_Marker);
                });
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
            $(".info_text_none").html(name)
            var info_width = $(".info_text_none").innerWidth();
            var myOptions = {
                content: boxText,
                disableAutoPan: true,
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
            ib = new InfoBox(myOptions);
            ib.open(map, marker);
        }

    };
    var initFn = {
        initialization: function () {
            // console.log(sessionStorage.is_edit)
            if (document.referrer == "") {
                window.location.href = "/";
            }
            if (sessionStorage.isTraveCity == undefined) {
                window.location.href = "/";
            }
            //景点收索
            initFn.sportSearch();

            if (sessionStorage.is_addSpot){
                $.post("ReturnSceni", function (data) {
                        // console.log(data)
                        if (!data) {
                            return false;
                        } else {
                            $(".loading_box").fadeOut();
                            plan(data.city_data);
                            showData(data.city_data,data);
                            addgo_arry = data.spot_data.addgo_arry;
                            this_citydata.addgo_arry = addgo_arry;
                            
                            for (var i = 0; i < addgo_arry.length; i++) {
                                var latlng_obj = {
                                    lat: Number(addgo_arry[i].this_lat),
                                    lng: Number(addgo_arry[i].this_lng)
                                }
                                var floor_index = addgo_arry[i].this_floor_index;
                                var go_name = addgo_arry[i].this_name
                                mapFn.addgo_marker(latlng_obj, floor_index, go_name)
                            };
    
                            eat_name_arry = data.spot_data.eat_name_arry == undefined ? [] : data.spot_data.eat_name_arry
                            this_citydata.eat_name_arry = eat_name_arry;
                            
                            //后退渲染
                            templateFn.return_temData(data.spot_data);
                            var time = initFn.getAllsum(sportEat_time_arr);
                            initFn.playtimeFn(time);
                            var slider_cityday_num = Number($('.cityday_num').html())
                            var slider_city_name = $('.bar_city_name').html()
                            //滑动进度条
                            initFn.jSsliderFn(slider_cityday_num,slider_city_name,data.dayTime);
                            initFn.allHours()
                            initFn.daytimesFn();
                            //一共选择景点的时间
                            var time = initFn.getAllsum(sportEat_time_arr);
                            initFn.playtimeFn(time);
                            
    
                        };
                    }, 'json');
            }else{
                $.post("CityData",function(cityData){
                    // console.log(cityData)
                    if (!cityData) {
                        return false;
                    } else {
                        
                        //表单的
                        plan(cityData);
                        // 城市的
                        showData(cityData,cityData);
                        var this_index = $('.map_head_city').find('.active').index();
                        $.post('EditTrip',{
                            this_city_index:this_index,
                            is_plan_edit:sessionStorage.is_plan_edit=='ok'?'ok':'',
                            is_edit:sessionStorage.is_edit=='ok'?'true':'false'
                        },function(data){
                            // console.log(data)
                            $(".loading_box").fadeOut();
                            var slider_cityday_num = Number($('.cityday_num').html())
                            var slider_city_name = $('.bar_city_name').html()
                            //滑动进度条
                            initFn.jSsliderFn(slider_cityday_num,slider_city_name,data.dayTime);
                            initFn.allHours()
                            initFn.daytimesFn();

                            if(data.status == 'true'){
                            
                                if(data.addgo_arry[this_index]){
                                    var jingdian = data.addgo_arry[this_index].jingdian
                                    if(jingdian){
                                        // console.log(jingdian)
                                        for(var j = 0; j< jingdian.length ; j++){
                                            if( jingdian[j].eat_info.length>=0 ){
                                                delete jingdian[j].eat_info
                                            }
                                        }
                                        // console.log(jingdian)
                                        addgo_arry = data.addgo_arry[this_index].jingdian;
                                        this_citydata.addgo_arry = addgo_arry;
                                        //后退渲染
                                        templateFn.return_temData(data);
                                        var time = initFn.getAllsum(sportEat_time_arr);
                                        initFn.playtimeFn(time);
                                        if(addgo_arry){
                                            for (var i = 0; i < addgo_arry.length; i++) {
                                                var latlng_obj = {
                                                    lat: Number(addgo_arry[i].this_lat),
                                                    lng: Number(addgo_arry[i].this_lng)
                                                }
                                                var floor_index = addgo_arry[i].this_floor_index;
                                                var go_name = addgo_arry[i].this_name
                                                mapFn.addgo_marker(latlng_obj, floor_index, go_name)
                                            };
                                            // console.log(data.addgo_arry[this_index].eat_data)
                                            eat_name_arry = data.addgo_arry[this_index].eat_data == undefined || data.addgo_arry[this_index].eat_data == ''  ? [] : data.addgo_arry[this_index].eat_data;
                                            // console.log(eat_name_arry)
                                            this_citydata.eat_name_arry = eat_name_arry;
                                            // templateFn.adgo_eat(eat_name_arry);
                                            initFn.is_goFn() //有选择的景点变灰
                                        }else{
                                            addgo_arry = []
                                        };

                                        
                                    }
                                    
                                }    
                            }
                            
                        },'json')
                    }
                },'json')
            }
            
            

               


            function plan(data) {
                form_data = data //----------------------------------------------------------
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
                } else if (form_data.traffic_tools == "其他交通") {
                    $("#js_traffic_ico").css("background-image", "url(/static/v1/img/addStrokeform/otherJT.png)");
                } else {
                    $("#js_traffic_ico").css("background-image", "url(/static/v1/img/addStrokeform/air.png)");
                };
            }

            function showData(form_data,data) {
                go_city_array = form_data.go_city_array; //------------------------------------------------
                
                if(data.spot_data  == undefined){
                    get_first_city_data = go_city_array[0];
                }else{
                    get_first_city_data = go_city_array[data.spot_data.this_city_index];
                }
                var fitst_center_latlng = {
                    lat: Number(get_first_city_data.position.lat),
                    lng: Number(get_first_city_data.position.lng)
                };
                var first_city_name = get_first_city_data.city_name;
                var ci_id = get_first_city_data.city_id;
                google.maps.event.addDomListener(window, "load", mapFn.initMap(fitst_center_latlng, get_first_city_data, first_city_name));

                

                var get_departure_date = get_first_city_data.city_time_1;
                var departure_date = get_departure_date.replace(".", "-");
                $(".departure_date").html(departure_date).attr('data-ymd',get_first_city_data.city_date);
                $(".top_departure_city").html(form_data.departure_city);
                var get_return_date = go_city_array[go_city_array.length - 1].city_time_2;
                var return_date = get_return_date.replace(".", "-");
                $(".return_date").html(return_date);
                $(".top_last_city").html(go_city_array[go_city_array.length - 1].city_name);
                $(".top_return_city").html(form_data.return_city);
                $(".bar_city_name").html(first_city_name);

                var bar_city_date2 = get_first_city_data.city_time_2
                var bar_city_date = get_departure_date == bar_city_date2 ? bar_city_date2 : get_departure_date + "-" + bar_city_date2;
                $(".bar_city_date").html(bar_city_date);
                // console.log(get_first_city_data.city_date2)
                $('.bar_city_name').attr('data-time2',get_first_city_data.city_date2)
                // $(".bar_city_date").attr()
                //城市渲染
                var leftop_city_ul_tem = '{{each go_city_array as value i}}\
                                            {{if i == go_city_array.length - 1}}\
                                                <li>{{value.city_name}}</li>\
                                            {{else}}\
                                                <li>{{value.city_name}}，</li>\
                                            {{/if}}\
                                        {{/each}}';
                var leftop_city_ul_render = template.compile(leftop_city_ul_tem);
                var leftop_city_ul_html = leftop_city_ul_render(form_data);
                $(".leftop_city_ul").html(leftop_city_ul_html);
                var map_head_city_tem = '{{each go_city_array as value i}}\
                                            {{if i == 0}}\
                                                <div class="city_item active" data-cityid="{{value.city_id}}">\
                                                    <div class="cityName">{{value.city_name}}</div>\
                                                    <ul class="city_dayul dis_none"></ul>\
                                                </div>\
                                            {{else}}\
                                                <div class="city_item" data-cityid="{{value.city_id}}">\
                                                    <div class="cityName">{{value.city_name}}</div>\
                                                    <ul class="city_dayul dis_none"></ul>\
                                                </div>\
                                            {{/if}}\
                                        {{/each}}';
                var map_head_city_render = template.compile(map_head_city_tem);
                var map_head_city_html = map_head_city_render(form_data);
                $(".map_head_city").html(map_head_city_html);


                for (var i = 0; i < go_city_array.length; i++) {
                    var day_len = go_city_array[i].city_daynum;
                    var daylist = Number(go_city_array[i].city_d_1)
                    var str = "";
                    for (var a = 0; a < day_len; a++) {
                        str += "<li>D" + (daylist++) + "</li>"
                    }
                    $(".city_item").eq(i).find(".city_dayul").html(str)
                };
                $(".map_head_city .city_item").each(function (i, n) {
                    if ($(n).find("li").length == 1) {
                        var min_width = $(".map_head_city .city_item").eq(i).outerWidth(true);
                        $(".map_head_city .city_item").eq(i).find("li").css("min-width", min_width + "px");
                    }
                });
                var width = $(".map_head_city").width() / 2;
                $(".map_head_city").css({
                    left: "calc( 50% - " + width + "px )"
                });
                // ----------------------------------------------------------------------------------------------
                
                var get_cityday_num = get_first_city_data.city_daynum;
                $(".cityday_num").html(get_cityday_num);
               
                // console.log(ci_id)
                //第一次进入页面暂时展示一楼 人文自然数据
                if (get_url_tI == null) {
                    initFn.list_Data({
                        city_id: ci_id
                    }, "renwen", "tab");
                };
                
                //map_head tab切换
                $(".map_head_city .city_item").each(function (a, n) {
                    $(n).on("click", function () {
                        if (get_url_tI != null) {
                            var get_havI_array = get_url_havI.split(",");
                            for(var i = 0;i<get_havI_array.length;i++){
                                if (Number(get_havI_array[i]) == a) {
                                    $(".prompt_b").fadeIn().find(".prompt_text").html("抱歉，请先完成本城市的行程安排");
                                    return
                                } else {
                                    mapTabFn(a)
                                };
                            }
                        } else {
                            mapTabFn(a)
                        }
                    });
                });
            
                    

                
                //路径有参数
                if (get_url_tI != null) {
                    mapTabFn(get_url_tI);
                }else{
                    
                    if(data.spot_data != undefined){
                        var city_index = Number(data.spot_data.this_city_index);
                        $(".map_head_city .city_item").eq(city_index).addClass("active").siblings().removeClass("active");
                    }
                }
                
                function mapTabFn(i) {
                    // console.log(i)
                    if (this_citydata.addgo_arry.length == 0 && this_citydata.eat_name_arry.length == 0) {
                        $(".map_head_city .city_item").eq(i).addClass("active").siblings().removeClass("active");
                        var li_span = $(".map_head_city .city_item").eq(i).find(".cityName");
                        var span_text = li_span.text();
                        $(".bar_city_name").html(span_text);
                       
                        var go_city_day_num = go_city_array[i].city_daynum;
                        $(".cityday_num").html(go_city_day_num);
                        var map_head_city_date = go_city_array[i].city_time_1 == go_city_array[i].city_time_2 ? go_city_array[i].city_time_2 : go_city_array[i].city_time_1 + "-" + go_city_array[i].city_time_2;
                        $(".bar_city_date").html(map_head_city_date);
                        // console.log(go_city_array[i].city_date2)
                        $('.bar_city_name').attr('data-time2',go_city_array[i].city_date2)
                        var city_position = go_city_array[i].position;
                        var center_pos = new google.maps.LatLng(city_position.lat, city_position.lng);
                        map.setCenter(center_pos); //设置地图中心点
                        var map_head_provinceName = go_city_array[i].provinceNames;
                        mapFn.mapPolyOptions(map_head_provinceName, span_text);
                        var map_head_cityID = go_city_array[i].city_id;
                        initFn.list_Data({
                            city_id: map_head_cityID
                        }, "renwen", "tab");
                        $(".floor_box").find(".floor1").addClass("active").siblings().removeClass("active");
                        // console.log(this_citydata)
                        
                        //滑动进度条
                        initFn.jSsliderFn(go_city_day_num,span_text);
                        initFn.allHours()
                        initFn.daytimesFn();

                    } else {
                        if (!$(".map_head_city .city_item").eq(i).hasClass("active")) {
                            $(".prompt_b").fadeIn().find(".prompt_text").html("抱歉，请先完成本城市的行程安排");
                        }
                    }
    
                    
                };

                


                //第一次进入页面显示提示框
                var new_date = new Date();
                new_date = new Date(new_date.getYear() + 1900, new_date.getMonth(), new_date.getDate());
                new_date = new_date.toString();
                if (localStorage.visitors_tab == undefined) {
                    if($('.map_head_city').find('.city_item').length>1){
                        $(".visitors_tab").fadeIn();
                    }
                    $(".visitors_tab").on("click", ".visitors_end", function () {
                        $(".visitors_tab").fadeOut();
                        var visitors_tab_time = new Date;
                        visitors_tab_time = new Date(visitors_tab_time.getYear() + 1900, visitors_tab_time.getMonth(), visitors_tab_time.getDate());
                        visitors_tab_time.setDate(visitors_tab_time.getDate() + 3);
                        localStorage.setItem("visitors_tab", visitors_tab_time);
                    });
                }
                if (new_date == localStorage.visitors_tab) {
                    localStorage.removeItem("visitors_tab");
                };
                if (localStorage.visitors_cityAttr == undefined) {
                    $(".visitors_cityAttr").fadeIn();
                    $(".visitors_cityAttr").on("click", ".visitors_end", function () {
                        $(".visitors_cityAttr").fadeOut();
                        var visitors_cityAttr_time = new Date;
                        visitors_cityAttr_time = new Date(visitors_cityAttr_time.getYear() + 1900, visitors_cityAttr_time.getMonth(), visitors_cityAttr_time.getDate());
                        visitors_cityAttr_time.setDate(visitors_cityAttr_time.getDate() + 3);
                        localStorage.setItem("visitors_cityAttr", visitors_cityAttr_time);
                    });
                };
                if (new_date == localStorage.visitors_cityAttr) {
                    localStorage.removeItem("visitors_cityAttr");
                };


            };
            
            //表单保存
            $(".save").on("click", function () {
                $('.madeTravelMask').fadeOut();
            });

            // 1-5 位置
            window.onresize = function () {
                $(".floor_box").offset({
                    left: $(".js_help").offset().left+30
                })
            };
            $(".floor_box").show().offset({
                left: $(".js_help").offset().left+30
            });





            //详情
            //弹出关闭
            $(".shut_down").on("click", function () {
                $(".details_popup_box").fadeOut();
            });
            hoverDetailsPopup()

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
            $(".floor").eq(0).find("i").css("background", "url(/static/v1/img/map/f1.png) no-repeat")
            //1-5 点击 数据切换
            $(".floor_box").on("click", ".floor", function () {
                $(".infoBox").each(function (i, n) {
                    $(".infoBox").eq(i).remove()
                })
                $(".search_content_list,.js_searchBox").hide().siblings(".js_sport_li,.r_top_tab").show();
                $(this).addClass("active").siblings().removeClass("active");
                var city_index = $(".map_head_city").find(".active").index();
                var this_city_id = go_city_array[city_index].city_id;
                // console.log(this_city_id)
                var postData = {
                    city_id: this_city_id
                }
                initFn.floor_switchFn($(this).index(), postData, "tab");


            });
            //1-5 tab 切换
            $(".r_top_tab_ul").on("click", "li", function () {
                $(".r_top_tab_ul li").removeClass('active');
                $(this).addClass("active");
                $(".infoBox").each(function (i, n) {
                    $(".infoBox").eq(i).remove();
                })
                switch ($(this).text()) {
                    case "Top8":
                        templateFn.floor_list(_type_data, "top8");
                        break;
                    case "人文景观":
                        templateFn.floor_list(_type_data, "nature");
                        break;
                    case "自然风光":
                        templateFn.floor_list(_type_data, "scenery");
                        break;
                    case "文化艺术":
                        templateFn.floor_list(_type_data, "art");
                        break;
                    case "休闲情调":
                        templateFn.floor_list(_type_data, "leisure");
                        break;
                    case "视觉享受":
                        templateFn.floor_list(_type_data, "visual");
                        break;
                    case "灯红酒绿":
                        templateFn.floor_list(_type_data, "neon");
                        break;
                    case "本土美食":
                        templateFn.floor_list(_type_data, "local");
                        getEat_data = _type_data.local;
                        break;
                    case "必吃美食":
                        templateFn.floor_list(_type_data, "eat");
                        getEat_data = _type_data.eat
                        break;
                    case "美食街区":
                        templateFn.floor_list(_type_data, "street");
                        break;
                    case "本土特产":
                        templateFn.floor_list(_type_data, "localProduct");
                        break;
                    case "土特产店":
                        templateFn.floor_list(_type_data, "productShops");
                        break;
                    case "购物商圈":
                        templateFn.floor_list(_type_data, "businessCircle");
                        break;
                }
                
                initFn.details_popup();
                initFn.add_go();
                 

            });
            //详情 附近推荐 添加 我想去 的数据
            // initFn.details_tj_go();
            
            var show_num = 0;
            $(".js_rlist_ul").on("click", ".js_show_shop", function () {
                $(this).parents(".show_store_list").find(".f5_store").stop(true).slideToggle();


                if (show_num == 1) {
                    show_num = 0;
                    changehtml($(this).html(), $(this))

                } else {
                    changehtml($(this).html(), $(this))
                    show_num++;
                }

                function changehtml(name, _this) {
                    if (name == "展开店铺") {
                        _this.html("收起店铺")
                    } else if (name == "收起店铺") {
                        _this.html("展开店铺")
                    }
                }

            });
            
            //安排行程
            initFn.arrangeSchedule();
            //编辑城市跳转
            $(".editor_box").on("click", function () {
                window.location.href = "/portal/map/travelItinerary.html"
            });


        },
        //人文自然
        list_Data: function (postData, ajax_url, isSearch) {
            // console.log(postData)
            $.ajax({
                url: ajax_url,
                type: "post",
                dataType: "JSON",
                data: postData,
                success: function (data) {
                    // console.log(data)
                    _listdata = data

                    _type_data = data;

                    var indexNum;
                    if (postData.type == undefined) {
                        indexNum = 0;
                    } else {
                        indexNum = getArrIndex(data.type, postData.type);
                    }
                    var f1_f3_list_tab_tem = '{{each type as value i}}\
                                                    {{if i == ' + indexNum + '}}\
                                                    <li class="active">{{value}}</li>\
                                                    {{else}}\
                                                    <li>{{value}}</li>\
                                                    {{/if}}\
                                                {{/each}}';


                    var f1_f3_list_tab_render = template.compile(f1_f3_list_tab_tem);
                    var f1_f3_list_tab_html = f1_f3_list_tab_render(data);
                    $(".r_top_tab_ul").html(f1_f3_list_tab_html);

                    if (isSearch == "tab") {
                        //第一次默认 
                        switch (ajax_url) {
                            case "renwen": //1楼 人文自然————>Top8
                                templateFn.floor_list(data, "top8");
                                break;
                            case "local": //2楼 本土体验————>文化艺术
                                templateFn.floor_list(data, "art");
                                break;
                            case "night": //3楼 醉美夜色 —————>视觉享受
                                templateFn.floor_list(data, "visual");
                                break;
                            case "food": //4楼 美食诱惑——————>必吃美食
                                templateFn.floor_list(data, "eat");
                                getEat_data = data.eat
                                break;
                            case "shop":
                                templateFn.floor_list(data, "localProduct");
                                break;
                        };
                    } else {
                        templateFn.floor_list(data, postData.group);
                    }
                    //详情
                    initFn.details_popup();
                    //我想去\我想吃
                    initFn.add_go();
                    
                }
            });
        },
        //hover 景点 list 地图标记点亮
        hover_list: function () {
            $(".js_rlist_ul .hov_list").hover(function () {
                $(".infoBox").each(function (i, n) {
                    $(this).remove()
                })
                var this_list = $(this);
                var floor_index = $(".floor_box").find(".active").index();
                var this_name = this_list.find(".attractions_name").text();
                var this_lat = parseFloat(this_list.attr("data-lat"));
                var this_lng = parseFloat(this_list.attr("data-lng"));
                var latlng_obj = {
                    lat: this_lat,
                    lng: this_lng
                };
                mapFn.hover_list_marker(latlng_obj, floor_index, this_name);
            }, function () {
                mapFn.del_hover_list_marker();
            })
        },
        hover_fen_list: function (data, iseat) {
            $(".js_rlist_ul .fen_list").hover(function () {
                $(".infoBox").each(function (i, n) {
                    $(".infoBox").eq(i).remove()
                })
                var fen_data;
                if (iseat == "eat") {
                    var eatlist_index = $(this).parents(".show_store_list").index();
                   
                    fen_data = data.eat[eatlist_index].place[$(this).index()].fen_store;
                } else {
                    fen_data = data.local[$(this).index()].fen_store;
                };
                if (fen_data != "") {
                    for (var i = 0; i < fen_data.length; i++) {
                        var name = fen_data[i].branch_name;
                        var latlng_obj = {
                            lat: parseFloat(fen_data[i].latitude),
                            lng: parseFloat(fen_data[i].longitude)
                        };
                        mapFn.hover_list_marker(latlng_obj, 3, name);
                    };
                };
            }, function () {
                mapFn.del_hover_list_marker();
                $(".infoBox").each(function (i, n) {
                    $(this).remove()
                })
            })
        },
        //列表 我想去\我想吃
        add_go: function () {
            //我想去
            $(".js_rlist_ul .list").on("click", ".js_go_button", function () {
                initFn.add_goFn($(this), ".list", ".attractions_name");
            });
            
            //我想吃
            $(".js_rlist_ul .eat").on("click", ".eat_go_button", function () {
                initFn.add_eatFn($(this), ".eat", ".attractions_name");
            });
            //景点的适玩时间 加减
            initFn.timeAddRed()
           //删除我想去\我想吃的数据
           initFn.del_add_data();
        },
        //详情 附近推荐 我想去
        details_tj_go: function () {
            //详情 我想吃
            // $(".rwpopup_tab3_ul").on("click", ".js_tj_food_list .js_tj_food_go", function () {
            //     initFn.add_eatFn($(this), ".js_tj_food_list", ".spot_name");
            // });
            // //详情 我想去
            // $(".rwpopup_tab3_ul").on("click", ".tj_jDshop_list .tj_jDshop_go", function () {
            //     initFn.add_goFn($(this), ".tj_jDshop_list", ".spot_name");

            // });
        },
        add_goFn: function ($this, list, name) {
            // $(".visitors_tab").fadeOut();
            $(".visitors_eat").fadeOut();
            // $(".visitors_cityAttr").fadeOut();
            var floor_index = $(".floor_box").find(".active").index();
            var this_type = $(".r_top_tab_ul").find(".active").text();
            var this_list = $this.parents(list);
            var go_name = this_list.find(name).text();

            var this_offset = $this.offset();
            
            for (var i = 0; i < addgo_arry.length; i++) {
                var this_name = addgo_arry[i].this_name;
                if (this_name == go_name) {
                    if (!$this.hasClass("go_button_gray")) {
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
            }
            
            
            if (!$this.hasClass("go_button_gray")) {
                if (list == ".list") {
                    $this.addClass("go_button_gray").html("已添加").parents(list).addClass("city_list_go");
                } else {
                    $this.addClass("go_button_gray").html("已添加");
                };
                var get_setid = this_list.attr("id");
                var this_lat = parseFloat(this_list.attr("data-lat"));
                var this_lng = parseFloat(this_list.attr("data-lng"));
                var this_playtime = this_list.find(".time_num").html();
                var this_tag_time = this_list.attr("data-time");
                var this_img_src = this_list.find("img").attr("src");
                var this_ranking = this_list.attr("data-ranking");
                var period_time = this_list.attr("data-period_time")
                var not_modifity = this_list.attr("data-not_modifity")
                var addgo_obj = {};
                // addgo_obj.this_id = get_setid;
                addgo_obj.this_name = go_name;
                addgo_obj.this_lat = this_lat;
                addgo_obj.this_lng = this_lng;
                addgo_obj.this_img_src = this_img_src;
                addgo_obj.this_playtime = this_playtime;
                addgo_obj.default_playtime = this_playtime;
                addgo_obj.this_tag_time = Number(this_tag_time);
                addgo_obj.this_floor_index = floor_index;
                addgo_obj.this_type = this_type;
                addgo_obj.ranking = this_ranking;
                addgo_obj.period_time = period_time;
                addgo_obj.not_modifity = not_modifity;
                addgo_obj.js_sport_eat = 'sport';
                addgo_obj.suit_season = this_list.find('.go_button').attr('data-suit_season')
                addgo_arry.push(addgo_obj);
                this_citydata.addgo_arry = addgo_arry;
                // console.log(addgo_arry);
                templateFn.add_godata(addgo_obj);
                var latlng_obj = {
                    lat: this_lat,
                    lng: this_lng
                }
                mapFn.addgo_marker(latlng_obj, floor_index, go_name); 
                var list_ = "#" + get_setid;
                cityAttractions.addflyer(list_, $this);

            };



        },
        add_eatFn: function ($this, this_list, name) {
            // $(".visitors_tab").fadeOut();
            // $(".visitors_cityAttr").fadeOut();
            $(".visitors_eat").fadeOut();
            $(".f_prompt").hide();
            var this_cityIndex = $(".map_head_city").find(".active").index();
            var this_city_daynum = parseInt((go_city_array[this_cityIndex].city_daynum)*5);
            var eat_list = $this.parents(this_list);
            var eat_name = eat_list.find(name).html();
            var this_offset = $this.offset();
            for (var i = 0; i < eat_name_arry.length; i++) {
                var this_name = eat_name_arry[i].name;
                if (this_name == eat_name) {
                    if (!$this.hasClass("go_button_gray")) {
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
            
            //限制美食单店连锁点的个数
            if (eat_name_arry.length <= this_city_daynum) {
                if (eat_name_arry.length < this_city_daynum) {
                    if (!$this.hasClass("go_button_gray")) {
                        if (this_list == ".eat") {
                            $this.addClass("go_button_gray").html("已添加").parents(this_list).addClass("city_list_go");
                        } else {
                            $this.addClass("go_button_gray").html("已添加");
                        };
                        var fen_data;
                        if (eat_list.hasClass("fen_list")) {
                            if (eat_list.parents("li").hasClass("show_store_list")) {
                                var parents_index = eat_list.parents(".show_store_list").index()
                                fen_data = _listdata.eat[parents_index].place[eat_list.index()].fen_store;
                                add_eat_obj.fen_data = fen_data;
                            } else {
                                fen_data = _listdata.local[eat_list.index()].fen_store;
                                add_eat_obj.fen_data = fen_data;
                            }

                        }
                        var id = eat_list.attr("id");
                        var this_lat = parseFloat(eat_list.attr("data-lat"));
                        var this_lng = parseFloat(eat_list.attr("data-lng"));
                        var eat_img = eat_list.find("img").attr('src');
                        // console.log(eat_img)
                        var meal_time = eat_list.find('.time_num').html();
                        var tag_time = eat_list.attr('data-tag_time')
                        // add_eat_obj.this_id = id;
                        add_eat_obj.name = eat_name;
                        add_eat_obj.lat = this_lat;
                        add_eat_obj.lng = this_lng;
                        add_eat_obj.dianpu_image = eat_img;
                        add_eat_obj.meal_time = meal_time;
                        add_eat_obj.tag_time = tag_time;
                        add_eat_obj.per_capita = eat_list.attr("data-per_capita");
                        add_eat_obj.js_sport_eat = 'eat';
                       

                        // console.log(getEat_data)
                        var is_eatData;
                        if($('.r_top_tab_ul').find('.active').text() == '本土美食'){
                            is_eatData = getEat_data
                        }else{
                            var store_index = $this.parents('.show_store_list').index();
                            is_eatData = getEat_data[store_index].place
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
                        this_citydata.eat_name_arry = eat_name_arry;
                        var list_ = "#" + id;
                        cityAttractions.addflyer(list_, $this);
                        templateFn.adgo_eat(add_eat_obj);

                        // ------------------------------------------------------------------------------------------------

                        // var latlng_obj = {
                        //     lat: this_lat,
                        //     lng: this_lng
                        // }
                        // mapFn.eat_marker(latlng_obj, eat_name);
                    };
                    return
                };

                if (eat_name_arry.length == this_city_daynum) {
                    if (!$this.hasClass("go_button_gray")) {
                        $(".visitors_eat").stop(true, true).fadeIn();
                    }
                    setTimeout(function () {
                        $(".visitors_eat").fadeOut();
                    }, 1500);
                };
            };

        },
        //删除我想去\我想吃 
        del_add_data: function () {
            //删除 我想去
            $(".js_attractions_ul").on("click", "li.jsSport .delete_icon", function () {
                var list = $(this).parents("li");
                if(list.hasClass('jsSport')){
                    var this_index = $('li.jsSport').index(list);
                    var del_name = addgo_arry[this_index].this_name;
                    $(".js_rlist_ul li").each(function (i, n) {
                        var list_name = $(n).find(".attractions_name").text();
                        if (del_name == list_name) {
                            $(".js_rlist_ul li").eq(i).removeClass("city_list_go").find(".go_button").removeClass("go_button_gray").html("我想去");
                        }
                    })

                    list.remove();
                    addgo_marker_array[this_index].setMap(null);
                    $(".infoBox").each(function (i, n) {
                        $(this).remove();
                    })
                    addgo_arry.splice(this_index, 1);
                    addgo_marker_array.splice(this_index, 1);
                    sportEat_time_arr.splice(this_index,1);
                    //一共选择元素的时间
                    var time = initFn.getAllsum(sportEat_time_arr);
                    // var time = initFn.getSum(addgo_arry);
                    initFn.playtimeFn(time);
                    cityAttractions.delNull();

                }


            }).end()
            // 美食  删除
            .on("click", "li.jsEat .delete_icon", function () {
                var list = $(this).parents("li")
                if(list.hasClass('jsEat')){
                    // console.log($('li.jsEat').index(list))
                    var this_index = $('li.jsEat').index(list);
                    // eat_marker_array[this_index].setMap(null);
                    mapFn.del_hover_list_marker();
                    // console.log(eat_name_arry)
                    var del_name = eat_name_arry[this_index].name;
                    $(".infoBox").each(function (i, n) {
                        $(this).remove();
                    })
                    $(".js_rlist_ul .eat").each(function (a, n) {
                        if ($(n).find(".attractions_name").text() == del_name) {
                            $(".js_rlist_ul .eat").eq(a).removeClass("city_list_go").find(".eat_go_button").removeClass("go_button_gray").html("我想去");
                        }
                    });

                    eat_name_arry.splice(this_index, 1);
                    eat_marker_array.splice(this_index, 1);
                    sportEat_time_arr.splice(this_index,1);
                    //一共选择元素的时间
                    var time = initFn.getAllsum(sportEat_time_arr);
                    // var time = initFn.getSum(addgo_arry);
                    initFn.playtimeFn(time);
                    list.remove();
                    // 判断美食为空
                    // if ($(".food_box_ul li").length == 0) {
                    //     $(".ts_food").stop(true, true).hide();
                    //     $(".f_main_main .food_box").hide();
                    // }


                    cityAttractions.delNull();
                }
                

            });
        },
        //景点详情 弹出程
        details_popup: function () {

            //店铺
            $(".r_main .list").on("click", ".introduce,.list_l", function () {
                var list = $(this).parents(".list");
                var this_index = list.index();
                var name = list.find(".attractions_name").text();
                var lat = list.attr("data-lat");
                var lng = list.attr("data-lng");
                var detail_ajax_url;
                var r_top_active = $(".r_top_tab_ul").find(".active").text();
                var post_data = {
                    city_id: $(".map_head_city").find(".active").attr("data-cityid"),
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
                        post_data.store_type = list.hasClass("fen_list") ? 1 : 0;
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
                var name = list.find(".attractions_name").eq(0).text();
                var lat = list.attr("data-lat");
                var lng = list.attr("data-lng");
                var detail_ajax_url;
                var r_top_active = $(".r_top_tab_ul").find(".active").text();
                var post_data = {
                    spot_name: name,
                    type: r_top_active,
                    city_id: $(".map_head_city").find(".active").attr("data-cityid"),
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
        playtimeFn: function (time) {
            $('.bar_city_name').attr('data-Allpalytime',time)
            // console.log(time)
            // $(".been_time").html(time);
            // 总时间
            var all_time = Number($(".bar_city_name").attr('data-allhours'));
            var bar_Pro = time / all_time * 100;

            var daynum = Number($('.cityday_num').html());
            var comfortable = daynum * 10 //舒适
            var difficult = daynum * 13 //困难
            // console.log(comfortable)
            var Pbar_c ;
            if (time <= comfortable) {
                // addClass("color_red");
                $(".js_dengji").html("舒适")
                Pbar_c = 1
            }else if(time>comfortable && time <= difficult){
                $(".js_dengji").html("困难");
                Pbar_c = 2
            } else {
                $(".js_dengji").html("极限")
                Pbar_c = 3
            }
            cityAttractions.Progressbar(bar_Pro,Pbar_c);
        },
        getAllsum : function (array) {
            var sum = 0;
            for (var i = 0; i < array.length; i++) {
                sum += parseFloat(array[i]+0.5);
            }
            return sum
        },
        timeAddRed:function(){
             //时间加
            $('.js_attractions_ul').unbind('click').on('click','li .play_t',function(){
                var list = $(this).parents("li")
                var num = 0
                var tag_time = Number(list.attr('data-this_tag_time'))
                num = num+0.5;
                var play_time = num+tag_time >=8?"1天" : num+tag_time+'小时';
                // console.log(play_time)
                list.find('.time_num').html(play_time);
                var tag_attr =  num+tag_time >=8?8 : num+tag_time
                list.attr('data-this_tag_time',tag_attr);
                var this_index = list.index()
                sportEat_time_arr[this_index] = tag_attr
                
                if(list.hasClass('jsSport')){
                    var sport_index = $("li.jsSport").index(list)
                    addgo_arry[sport_index].this_playtime = play_time;
                    addgo_arry[sport_index].this_tag_time = tag_attr;
                }else{
                    var eat_index = $("li.jsEat").index(list)
                    eat_name_arry[eat_index].meal_time = play_time;
                    eat_name_arry[eat_index].tag_time = tag_attr
                }
                
                var time = num+Number($('.bar_city_name').attr('data-allpalytime'))
                $('.bar_city_name').attr('data-allpalytime',time)
                initFn.playtimeFn(time)
            }).end()
            // 时间减
            .unbind('click').on('click','li .play_d',function(){
                var list = $(this).parents("li")
                var reduce_num = 0
                var tag_time = Number(list.attr('data-this_tag_time'))
                reduce_num = reduce_num-0.5;
                var play_time = tag_time+reduce_num<=0.5?0.5+'小时':tag_time+reduce_num+'小时'
                list.find('.time_num').html(play_time);
                var tag_attr =  tag_time+reduce_num <=0.5? 0.5 : tag_time+reduce_num
                list.attr('data-this_tag_time',tag_attr);

                var this_index = list.index()
                sportEat_time_arr[this_index] = tag_attr

                if(list.hasClass('jsSport')){
                    var sport_index = $("li.jsSport").index(list)
                    addgo_arry[sport_index].this_playtime = play_time;
                    addgo_arry[sport_index].this_tag_time = tag_attr;
                }else{
                    var eat_index = $("li.jsEat").index(list)
                    eat_name_arry[eat_index].meal_time = play_time;
                    eat_name_arry[eat_index].tag_time = tag_attr
                }
                var time = reduce_num+Number($('.bar_city_name').attr('data-allpalytime'))
                $('.bar_city_name').attr('data-allpalytime',time)
                initFn.playtimeFn(time)
            })   
           
           
            
            
        },
        //安排日程 下一步
        arrangeSchedule: function () {
            $(".f_main_next").on("click", function () {
                // 16:00 value值是1080
                // 24:00 value值是1440
                var z_day_Time = 0 //白景 总时间（选择的总时间）
                var z_night_Time = 0 //白景 总时间
                // console.log(dayTime_arr)
                for(var i = 0;i<dayTime_arr.length;i++){
                    var timeVal_item = ($(".slider_list").eq(i).find('input').val()).split(";");
                    // console.log(timeVal_item)
                    var day_Time_item; //选择的进度条白天的时间
                    if(timeVal_item[1] >= 1080){
                        day_Time_item = ((1080 - timeVal_item[0])/60) <= 0?0:(1080 - timeVal_item[0])/60;
                    }else{
                        day_Time_item = ((timeVal_item[1] - timeVal_item[0])/60)<=0?0:(timeVal_item[1] - timeVal_item[0])/60 ;
                    }
                    // console.log(day_Time_item)
                    z_day_Time += day_Time_item
                   
                    var night_Time_item = ((timeVal_item[1] - 1080)/60)<=0? 0 :(timeVal_item[1] - 1080)/60 ;
                    // console.log(night_Time_item)
                    z_night_Time += night_Time_item
                }
                // console.log('总时间的白景'+z_day_Time)
                // console.log('总时间的夜景'+z_night_Time)
                
                var list_dayTime = 0 //白景
                var list_nightTime = 0 //夜景
                var list_allTime = 0 //全景
                $('.js_attractions_ul').find('li').each(function(){
                    var isTypeTime = $(this).attr('data-period_time');
                    var tag_time = Number($(this).attr('data-this_tag_time'))
                    switch(isTypeTime){
                        case '' :
                        list_allTime += tag_time+0.5
                        break;
                        case 'allday':
                        list_allTime += tag_time+0.5
                        break;
                        case 'day':
                        list_dayTime += tag_time+0.5
                        break;
                        case 'night':
                        list_nightTime += tag_time+0.5
                        break;
                    }
                })
                // console.log('选择的白景---'+list_dayTime)
                // console.log('选择的夜景---'+list_nightTime)
                // console.log('选择的全景---'+list_allTime)
                
               

                var z_playTime = Number($('.bar_city_name').attr('data-allpalytime'))
                var beyondTime = Number($('.cityday_num').html())*50 //每天不能超出50个小时
                // console.log('选择的总时间------'+z_playTime)
                // console.log('超出的时间------'+beyondTime)
                var ts_str = ''
                if(z_playTime<=beyondTime){
                    if(list_nightTime >0){//选夜景了
                        if(list_nightTime >=z_night_Time && list_dayTime >=z_day_Time){
                            $('.prompt_c').show()
                            ts_str = '选择 白景和夜景 超出'
                        }else if(list_nightTime >=z_night_Time){
                            $('.prompt_c').show()
                            ts_str = '选择 夜景 超出';
                        }else if(list_dayTime >=z_day_Time){
                            $('.prompt_c').show()
                            ts_str = '选择 白景 超出'
                        }else{
                            initFn.post_ajaxFn()
                        }
                    }else{ //没选夜景
                        if(list_dayTime >=z_day_Time){
                            $('.prompt_c').show()
                            ts_str = '选择 白景 超出'
                        }else{
                            initFn.post_ajaxFn()
                        }
                    };
                    $('.cancel_prompt_text').html(ts_str)
                    
                }else{
                    $('.prompt_b').show()
                    ts_str = '选择 白景和夜景 超出（景点超出）请适当删除'
                    $('.prompt_text').html(ts_str)
                }
                
                $('.prompt_det').click(function(){
                    initFn.post_ajaxFn()
                })

            });
        },
        post_ajaxFn: function () {
            // console.log(form_data);
           
            var post_formData = {};
            post_formData.adult = $(".cartBox").find(".wap2_adult_num").html();
            post_formData.children = $(".cartBox").find(".wap2_childrent_num").html();
            post_formData.custom_title = $(".cartBox").find("#custom_title").val();
            post_formData.date = $(".cartBox").find("#wap3_date").val();
            post_formData.day_num = $(".cartBox").find(".wap1_day_num").html();
            post_formData.departure_city = $(".cartBox").find(".start_name").html();
            post_formData.departure_latlng = form_data.departure_latlng;
            post_formData.go_city_array = form_data.go_city_array;
            post_formData.return_city = $(".cartBox").find(".end_name").html();
            post_formData.return_latlng = form_data.return_latlng;
            post_formData.traffic_tools = $(".cartBox").find(".wap2_traffic").html();
            post_formData.return_traffic = form_data.return_traffic;
            // console.log(post_formData)
            var shop_len_arr = []
            $(".js_attractions_ul li").each(function (i, n) {
                if ($(n).attr("data-this_floor") == 4) {
                    shop_len_arr.push(i)
                };
            });
            var shop_len = shop_len_arr.length;
            this_citydata.shop_len = shop_len
            this_citydata.spot_len = $(".js_attractions_ul .jsSport").length - shop_len;
            this_citydata.eat_len = eat_name_arry.length; 

            var thisCity = $(".map_head_city").find(".active");
            var this_cityid = thisCity.attr("data-cityid");
            var this_city_name = thisCity.find(".cityName").text();
            var this_city_index = thisCity.index();
            var thisCDmnu = $('.cityday_num').html();
            this_citydata.this_city = this_city_name;
            this_citydata.this_cityid = this_cityid;
            this_citydata.this_city_index = this_city_index;
            this_citydata.this_city_lat = go_city_array[this_city_index].position.lat;
            this_citydata.this_city_lng = go_city_array[this_city_index].position.lng;
            this_citydata.this_cityDayNum = thisCDmnu;
            var city_len = $(".map_head_city").find(".city_item").length;
            if (city_len == 1) {
                this_citydata.status = 3 //只有一个城市
            } else {
                if (this_city_index == 0) {
                    this_citydata.status = 1;//第一个城市
                } else if (this_city_index == go_city_array.length - 1) {
                    this_citydata.status = 2 //最后一个城市
                } else {
                    this_citydata.status = 0 //中间的城市
                }
            };
            
           

            // console.log(this_citydata);
            // console.log(post_formData)
            var nextObj = {
                spot_data: this_citydata,
                city_data: post_formData,
                dayTime:dayTime_arr
            }
            $.ajax({
                url: "optimize_line",
                type: "post",
                dataType: "JSON",
                contentType:"application/json;charset=utf-8",
                data:JSON.stringify(nextObj),
                success: function (data) {
                    // console.log(data)
                    var cityindex = $(".map_head_city .active").index();
                    if (data.status == 1) {
                        
                        // if(!sessionStorage.is_edit){
                            sessionStorage.setItem('is_addSpot', 'ok')
                        // }
                        
                        var hvaI = getUrlParam("havI");
                        // console.log(hvaI)

                        if (hvaI == null) {
                            window.location.href = "/portal/scenerymap/attractionsArrange.html?thisCity=" + cityindex;
                        } else {
                            window.location.href = "/portal/scenerymap/attractionsArrange.html?thisCity=" + cityindex + "&havI=" + hvaI;
                        }

                    }
                }
            })
        },
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
                var cityID = $(".map_head_city .active").attr("data-cityid");
                var postData = {
                    spot_name: $(this).val(),
                    city_id: cityID
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
                    var str = '';
                    $.get("allfloorSearch", postData, function (data) {
                        if (!data) return false;
                        // console.log(data)
                        if (data == "") {
                            str = '<li class="search_li not_search">未检索到相关信息</li>'
                        } else {
                            for (var i = 0; i < data.length; i++) {
                                str += '<li class="search_li clearfix" data-floor="' + data[i].floor_index + '" data-group="' + data[i].group + '">\
                                    <span class="fl">' + data[i].spot_name + '</span >\
                                    <span class="fr">' + data[i].type + '</span></li>'
                            };
                        }

                        $(".js_search_ul").html(str);
                    }, 'json');


                }
            })
            $(".search_content_list").on("click", ".search_li:not(.not_search)", function () {
                var floor_num = Number($(this).attr("data-floor"))
                var cityID = $(".map_head_city .active").attr("data-cityid");
                var postData = {
                    city_id: cityID,
                    search_spot_name: $(this).find(".fl").html(),
                    group: $(this).attr("data-group"),
                    type: $(this).find(".fr").html()
                }
                $('.js_sport_li,.r_top_tab').show().siblings(".search_content_list,.js_searchBox").hide();
                $(".floor_box .floor").eq(floor_num).addClass("active").siblings().removeClass("active")
                initFn.floor_switchFn(floor_num, postData, "search");
            })
        },
        floor_switchFn: function (index, postData, isSearch) {
            $(".floor").find("i").removeAttr("style")
            $(".floor").eq(index).find("i").css("background", "url(/static/v1/img/map/f" + (index + 1) + ".png) no-repeat");
            switch (index) {
                case 0:
                    initFn.list_Data(postData, "renwen", isSearch);
                    break;
                case 1:
                    initFn.list_Data(postData, "local", isSearch);
                    break;
                case 2:
                    initFn.list_Data(postData, "night", isSearch);
                    break;
                case 3:
                    initFn.list_Data(postData, "food", isSearch);
                    break;
                case 4:
                    initFn.list_Data(postData, "shop", isSearch);
                    break;
            }
        },
        is_goFn:function(){
            //我想去
            for (var s = 0; s < addgo_arry.length; s++) {
               var add_name = addgo_arry[s].this_name;
               $(".js_rlist_ul li").each(function (i, n) {
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
       //滑块进度条方法 试玩天数加减
       jSsliderFn:function(city_dnum,city_name,daytimeArr){
        //    console.log(city_dnum)
            $('.daySet').click(function(){
                $('.city_dayset').css({"opacity": 1})
            })
            
            var str = ''
            if(daytimeArr){
                for(var i = 0;i<city_dnum;i++){
                    var tag_time = daytimeArr[i].split('-');
                    var value1 = tag_time[0].split(':')[0]*60+Number(tag_time[0].split(':')[1])
                    var value2 = tag_time[1].split(':')[0]*60+Number(tag_time[1].split(':')[1])
                    str += '<li class="slider_list">\
                                <div class="layout-slider">\
                                    <div class="slider_title"><p>'+city_name+'&nbsp;&nbsp;D'+(i+1)+'</p></div>\
                                    <input id="slider'+i+'" type="slider" name="area" value="'+value1+';'+value2+'" />\
                                </div>\
                            </li>'
                            
                }
            }else{
                for(var i = 0;i<city_dnum;i++){
                   
                    str += '<li class="slider_list">\
                                <div class="layout-slider">\
                                    <div class="slider_title"><p>'+city_name+'&nbsp;&nbsp;D'+(i+1)+'</p></div>\
                                    <input id="slider'+i+'" type="slider" name="area" value="480;1320" />\
                                </div>\
                            </li>'
                            
                }
            }
            
            $('.slider_box').html(str)
            for(var i = 0;i<city_dnum;i++){
               initFn.slider_tFn(i)
            };
            
            
            //天数加
            $('.td_but').find('.n_t').unbind('click').on('click',function(){
               
                var num = $('.slider_box li:last').index()+1;
                var strs = '<li class="slider_list">\
                            <div class="layout-slider">\
                                <div class="slider_title"><p>'+city_name+'&nbsp;&nbsp;D'+(num+1)+'</p></div>\
                                <input id="slider'+num+'" type="slider" name="area" value="480;1320" />\
                            </div>\
                        </li>'

                var allDayNum =  Number($('.wap1_day_num').html())
                if( allDayNum >= 30){
                    allDayNum = 30
                    return
                } 
                $('.slider_box').append(strs);
               
                $('.cityday_num').html(num+1)
                

                initFn.slider_tFn(num);
                initFn.allHours();
                initFn.daytimesFn();
                 //一共选择景点的时间
                // var time = initFn.getSum(addgo_arry);
                var time = initFn.getAllsum(sportEat_time_arr);
                initFn.playtimeFn(time);

                //日期加
                Modification_date("add");
               
            }).end()
            //天数减
            .find('.n_d').unbind('click').on('click',function(){
                if($('.cityday_num').html() == 1)return;
                $('.slider_box li:last').remove();
                var num = $('.slider_box li').length;
                $('.cityday_num').html(num);
                initFn.allHours();
                initFn.daytimesFn();
                //一共选择景点的时间
                // var time = initFn.getSum(addgo_arry);
                var time = initFn.getAllsum(sportEat_time_arr);
                initFn.playtimeFn(time);

                //日期减
                Modification_date("subtract")
                
            });
            
            $('.city_dayset_close').click(function(){
                $('.city_dayset').css({"opacity": 0})
            })
            //日期修改
            function Modification_date (isAdd){
                var time2 = $('.bar_city_name').attr('data-time2')
                var go_date = time2.replace('.', '/').replace('.', '/');
                var new_date = city_addDate(go_date,1,isAdd).split('-');
                // console.log(new_date)
                $('.bar_city_date').html($('.bar_city_date').html().split('-')[0]+'-'+new_date[0]);
                $('.bar_city_name').attr('data-time2',new_date[1])

                //总时间
                var allDayNum =  Number($('.wap1_day_num').html())
                if(isAdd == 'add'){
                    allDayNum ++
                }else{
                    allDayNum --
                }
                
                // console.log(allDayNum)
                $('.wap1_day_num').html(allDayNum)
                
                var get_startYmd = $('.departure_date').attr('data-ymd').replace('.', '/').replace('.', '/');
                var new_endYmd = city_addDate(get_startYmd,allDayNum-1,'add').split('-');
                // console.log(new_endYmd[0])
                $('.return_date').html(new_endYmd[0].replace('.','-'))
                changeDate()
            };
            //当前城市
            var Fom_goData = form_data.go_city_array;
            var this_city_index = $(".map_head_city").find(".active").index()
            var this_cityGo_Data =  Fom_goData[this_city_index]
            // console.log(this_city_index)
            function changeDate(){
                // //当前城市
                this_cityGo_Data.city_daynum = $('.cityday_num').html();
                //出发日期
                // console.log(Fom_goData)
                var chufa_date = form_data.date //获取出发日期
                var firtNumber = 0 //第一次要设置 初始 加的天数
                for(var i = 0;i<Fom_goData.length;i++){
                    // console.log(Fom_goData[i])
                    var item_city_num = Number(Fom_goData[i].city_daynum); //获取列表的天数(适玩)
                    var first_time = city_addDate(chufa_date,firtNumber,'add').split('-') //获取开始时间
                    Fom_goData[i].city_date = first_time[1] //渲染开始时间
                    Fom_goData[i].city_time_1 = first_time[0] 
                    Fom_goData[i].city_d_1 = firtNumber+1
                    firtNumber = firtNumber+item_city_num //初始天数加上适玩天数
                    // console.log(chufa_date)
                    var first_times = city_addDate(chufa_date,firtNumber - 1,'add').split('-');
                    // console.log(first_times)
                    Fom_goData[i].city_date2 = first_times[1]
                    Fom_goData[i].city_time_2 = first_times[0]
                    Fom_goData[i].city_d_2 = firtNumber
                    first_times = city_addDate(chufa_date,firtNumber,'add').split('-');
                    first_time = first_times
                }
            }

           

        },
        slider_tFn:function(i){
            jQuery("#slider"+i).slider({
                from: 300,
                to: 1440,
                step: 30,
                dimension: '',
                skin: "round",
                // scale: ['5:00','24:00'],
                limits: false,
                round: 0,
                calculate: function (value) {
                    // console.log(value)
                    var hours = Math.floor(value / 60);
                    // console.log(hours)
                    var mins = (value - hours * 60);
                    // console.log(mins)
                    return (hours < 10 ? "0" + hours : hours) + ":" + (mins == 0 ? "00" : mins);
                },
                callback: function (value) {
                    // console.log(value)
                    initFn.allHours();
                    initFn.daytimesFn();
                    //一共选择景点的时间
                    var time = initFn.getAllsum(sportEat_time_arr);
                    initFn.playtimeFn(time);
                }
            });
            
        },
        allHours:function(){
            var allhours=0;
            $('.slider_box input').each(function(a,n){
                // console.log(a)
                var valArray = ($(n).val()).split(';');
                // console.log(valArray)
                var hours =  (valArray[1]-valArray[0]) / 60;
                // console.log(a)
                allhours += hours;
            });
            // 总小时
            // console.log(allhours)
            $('.bar_city_name').attr('data-allhours',allhours)
        },
        daytimesFn:function(){
            dayTime_arr = []
            $('.slider_box li').each(function(i,n){
                var time1 = $(n).find('.jslider-value').eq(0).find("span").text()
                var time2 = $(n).find('.jslider-value').eq(1).find("span").text()
                // console.log(time1)
                // console.log(time1.indexOf('–') == -1 )
                var times 
                if(time1.indexOf('–') == -1 && time2.indexOf('–') == -1){
                    times = time1+"-"+time2
                    // console.log(times)
                    
                }else{
                    if(time1.indexOf('–') != -1){
                        times = (time1.replace(/–/g,'-')).replace(/\s+/g,"")
                    }
                    if(time2.indexOf('–') != -1){
                        times = (time2.replace(/–/g,'-')).replace(/\s+/g,"")
                    }
                }
                dayTime_arr.push(times)
            });
            // 每天的时间段
            // console.log(dayTime_arr)
        },
        // 页面后退hover事件
        return_hoverFn:function(){
            //hover 景点
            var thishover_index;
            $(".js_attractions_ul").find('.jsSport').unbind('hover').hover(function() {
                var lat = parseFloat($(this).attr("data-lat"));
                var lng = parseFloat($(this).attr("data-lng"));
                var center_pos = new google.maps.LatLng(lat, lng);
                // map.setCenter(center_pos);
                var this_name = $(this).find(".p1").html()
                thishover_index = $('.jsSport').index($(this));
                // map.setZoom(8)
                //定义信息窗口
                // console.log(addgo_marker_array[thishover_index])
                mapFn.styleInfowindow(this_name, addgo_marker_array[thishover_index])
            }, function () {
                $(".infoBox").each(function (i, n) {
                    $(this).remove()
                })
            });

            //hover 美食
            $(".js_attractions_ul .jsEat").unbind('hover').hover(function () {
                // console.log(eat_marker_array)
                // console.log($(this).attr("data-lat")
                var lat = parseFloat($(this).attr("data-lat"));
                var lng = parseFloat($(this).attr("data-lng"));
                var center_pos = new google.maps.LatLng(lat, lng);
                // map.setCenter(center_pos);
                
                var this_name = $(this).find('.p1 span').text()
                //  //定义信息窗口
                var latlng_obj = {
                    lat: lat,
                    lng: lng
                }
                mapFn.hover_list_marker(latlng_obj, 3, this_name);
            }, function () {
               
                mapFn.del_hover_list_marker();
            });
            //hover 美食分店
            $(".js_attractions_ul .fen_list").unbind('hover').hover(function () {
                if($(this).hasClass('fen_list')){
                    var fen_index = $('.jsEat').index($(this))
                    var fen_data = eat_name_arry[fen_index].fen_data;
                    for (var i = 0; i < fen_data.length; i++) {
                        var name = fen_data[i].branch_name;
                        var latlng_obj = {
                            lat: parseFloat(fen_data[i].latitude),
                            lng: parseFloat(fen_data[i].longitude)
                        };
                        mapFn.hover_list_marker(latlng_obj, 3, name);
                    };
                }
               
            }, function () {
                mapFn.del_hover_list_marker();
                hover_list_marker_array = [];
                $(".infoBox").each(function (i, n) {
                    $(".infoBox").eq(i).remove()
                })
            });
        }

    }

    var templateFn = {
        //人文自然
        floor_list: function (data, type) {
            // console.log(type)
            // console.log(data)
            var id = type + "_";
            var f1_f3_list_tem = '{{each ' + type + ' as value i}}\
                                        <li class="list hov_list clearfix" data-time = "{{value.tag_time}}" data-lat={{value.latitude}} data-lng={{value.longitude}} id = ' + id + '{{value.city_id}}_{{i}} data-ranking ={{value.ranking}}  data-not_modifity={{value.not_modifity}} data-period_time={{value.period_time}}>\
                                            <div class="list_l fl">\
                                                <img src="{{value.cover_url}}" alt="" >\
                                            </div>\
                                            <div class="list_r fl">\
                                                <div class="text">\
                                                    <p class="css_r_name"><span class="attractions_name">{{value.spot_name}}</span></p>\
                                                    <p class="time_distance">适玩时长：<span class="time_num">{{value.play_time}}</span></p>\
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
                                            <div class="go_button js_show_shop">展开店铺</div>\
                                        </div>\
                                    </div>\
                                    <div class="f5_store dis_none">\
                                        <ul>\
                                            {{each value.place as v s}}\
                                                {{if v.store_type == 1}}\
                                                    <li class="list fen_list eat hov_list clearfix"  data-lat="{{v.latitude}}" data-lng="{{v.longitude}}" id = "' + id + '{{v.city_id}}_{{i}}_{{s}}" data-per_capita="{{v.per_capita}}" data-tag_time="{{v.tag_time}}">\
                                                        <div class="list_l fl">\
                                                            <img src="{{v.dianpu_image}}" alt="">\
                                                        </div>\
                                                        <div class="list_r fl">\
                                                            <div class="text">\
                                                                <p class="css_r_name"><span class="attractions_name">{{v.store_name}}</span></p>\
                                                                <p class="time_distance">推荐用餐：<span class="time_num">{{v.meal_time}}</span></p>\
                                                                <p class="introduce">点击查看介绍</p>\
                                                            </div>\
                                                            <div class="num"></div>\
                                                            <div class="go_button eat_go_button" >我想去</div>\
                                                        </div>\
                                                        <div class="line"></div>\
                                                    </li>\
                                                {{else}}\
                                                    <li class="list eat hov_list clearfix"  data-lat={{v.latitude}} data-lng={{v.longitude}} id = "' + id + '{{v.city_id}}_{{i}}_{{s}}" data-per_capita="{{v.per_capita}}" data-tag_time="{{v.tag_time}}">\
                                                        <div class="list_l fl">\
                                                            <img src="{{v.dianpu_image}}"  alt="">\
                                                        </div>\
                                                        <div class="list_r fl">\
                                                            <div class="text">\
                                                                <p class="css_r_name"><span class="attractions_name">{{v.store_name}}</span></p>\
                                                                <p class="time_distance">推荐用餐：<span class="time_num">{{v.meal_time}}</span></p>\
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
                                        <li class="list fen_list eat hov_list clearfix"  data-lat="{{value.latitude}}" data-lng="{{value.longitude}}" id = "' + id + '{{value.city_id}}_{{i}}" data-per_capita="{{value.per_capita}}" data-tag_time="{{value.tag_time}}">\
                                            <div class="list_l fl">\
                                                <img  src="{{value.url}}" alt="">\
                                            </div>\
                                            <div class="list_r fl">\
                                                <div class="text">\
                                                    <p class="css_r_name"><span class="attractions_name">{{value.store_name}}</span></p>\
                                                    <p class="time_distance">推荐用餐：<span class="time_num">{{value.meal_time}}</span></p>\
                                                    <p class="introduce">点击查看介绍</p>\
                                                </div>\
                                                <div class="num"></div>\
                                                <div class="go_button eat_go_button" >我想去</div>\
                                            </div>\
                                        </li>\
                                    {{else}}\
                                        <li class="list eat hov_list clearfix"  data-lat={{value.latitude}} data-lng="{{value.longitude}}" id = "' + id + '{{value.city_id}}_{{i}}" data-per_capita="{{value.per_capita}}" data-tag_time="{{value.tag_time}}">\
                                            <div class="list_l fl">\
                                                <img  src="{{value.url}}"  alt="">\
                                            </div>\
                                            <div class="list_r fl">\
                                                <div class="text">\
                                                    <p class="css_r_name"><span class="attractions_name">{{value.store_name}}</span></p>\
                                                    <p class="time_distance">推荐用餐：<span class="time_num">{{value.meal_time}}</span></p>\
                                                    <p class="introduce">点击查看介绍</p>\
                                                </div>\
                                                <div class="num"></div>\
                                                <div class="go_button eat_go_button" >我想去</div>\
                                            </div>\
                                        </li>\
                                    {{/if}}\
                                {{/each}}';
            var f4_street_tem = '{{each street as value i}}\
                                    <li class="list hov_list clearfix" data-time = "{{value.tag_time}}" data-lat="{{value.latitude}}" data-lng="{{value.longitude}}" id = "' + id + '{{value.city_id}}_{{i}}" data-not_modifity="{{value.not_modifity}}" data-period_time="{{value.period_time}}">\
                                        <div class="list_l fl">\
                                            <img src="{{value.url}}" alt="">\
                                        </div>\
                                        <div class="list_r fl">\
                                            <div class="text">\
                                                <p class="css_r_name"><span class="attractions_name">{{value.store_name}}</span></p>\
                                                <p class="time_distance">适玩时长：<span class="time_num">{{value.suit_time}}</span></p>\
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
                                                    <div class="go_button js_show_shop">展开店铺</div>\
                                                </div>\
                                            </div>\
                                            <div class="f5_store dis_none">\
                                                <ul>\
                                                    {{each value.place as value s}}\
                                                        <li class="list hov_list clearfix" data-time = "{{value.tag_time}}" data-lat="{{value.latitude}}"data-lng="{{value.longitude}}" id = "' + id + '{{value.city_id}}_{{i}}_{{s}}" data-not_modifity="{{value.not_modifity}}" data-period_time="{{value.period_time}}">\
                                                            <div class="list_l fl">\
                                                                <img src="{{value.dianpu_image}}" alt="">\
                                                            </div>\
                                                            <div class="list_r fl">\
                                                                <div class="text">\
                                                                    <p class="css_r_name"><span class="attractions_name">{{value.store_name}}</span></p>\
                                                                    <p class="time_distance">适玩时长：<span class="time_num">{{value.shopping_time}}</span></p>\
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
                                <li class="list hov_list clearfix" data-time = "{{value.tag_time}}" data-lat="{{value.latitude}}" data-lng="{{value.longitude}}" id = "' + id + '{{value.city_id}}_{{i}}" data-not_modifity="{{value.not_modifity}}" data-period_time="{{value.period_time}}">\
                                    <div class="list_l fl">\
                                        <img src="{{value.img_url}}"  alt="">\
                                    </div>\
                                    <div class="list_r fl">\
                                        <div class="text">\
                                            <p class="css_r_name"><span class="attractions_name">{{value.shopping_name}}</span></p>\
                                            <p class="time_distance">适玩时长：<span class="time_num">{{value.shopping_time}}</span></p>\
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
            var floor_list_html = floor_list_render(data);
            $(".js_rlist_ul").html(floor_list_html);

            initFn.is_goFn()

            // $(".con_rig img").removeAttr('src')


            // $(".list img,.show_store_list img").lazyload({
            // $("img.lazy").lazyload({
            //     threshold :100,
            //     placeholder: "/static/v1/img/timg.gif",
            //     effects:"fadeIn",
            //     // event : "click",
            //     // container: $("#container") ,
            //     // failure_limit : 100,
            //     // skip_invisible : true, 
    
            // });

            initFn.hover_list();
            if (type == "local") {
                initFn.hover_fen_list(data, "local")
            } else if (type == "eat") {
                initFn.hover_fen_list(data, "eat")
            }

            // 当前月景点可以选不可以选 以当前城市默认的结束月份计算，天数加减，不作为改变
            // var end_month = $('.bar_city_date').html().indexOf('-')== -1 ? $('.bar_city_date').html().split('.')[0].toString():$('.bar_city_date').html().split('-')[1].split('.')[0].toString();
            // // console.log(end_month)
            // $('.js_rlist_ul').find('.list').each(function(i,n){
            //     var optional_month = $(this).find('.go_button').attr('data-suit_season');
                
            //     if(optional_month){
            //          //不能包含中文
            //         if(/.*[\u4e00-\u9fa5]+.*$/.test(optional_month)){
            //             optional_month = '1,2,3,4,5,6,7,8,9,10,11,12'
            //             // console.log(optional_month)
            //         }
            //         var optional_m_arr = optional_month.split(',');
            //         // console.log(optional_m_arr)
            //         var new_month_arr = []
            //         for(var m = 0;m<optional_m_arr.length;m++){
            //             var new_m = optional_m_arr[m]<10?"0"+optional_m_arr[m]:optional_m_arr[m]
            //             new_month_arr.push(new_m)
            //         }
            //         var new_m_str = new_month_arr.join(',')
            //         // console.log(new_m_str)
            //         if(new_m_str.indexOf(end_month) == -1){
            //             $(this).find('.go_button').addClass('go_button_gray')
            //         }
                   
            //     }
               
            // })

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

            //我想去
            // for (var s = 0; s < addgo_arry.length; s++) {
            //     var tj_jDshop_id = addgo_arry[s].this_id;
            //     // $(".js_rlist_ul li").each(function (i, n) {
            //     $("#" + tj_jDshop_id).find(".tj_jDshop_go").addClass("go_button_gray").html("已添加");
            //     // });
            // };

            //必吃美食
            // console.log(eat_name_arry)
            // for (var i = 0; i < eat_name_arry.length; i++) {
            //     var eat_go_id = eat_name_arry[i].this_id;
            //     $("#" + eat_go_id).find(".go").addClass("go_button_gray");
            // };

        },
        //必吃美食——本土特产
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
            templateFn.branchFn(details_box, data.spot);
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
            };
            var details_box = $(".f4tab2_details_popup_box");
            templateFn.branchFn(details_box, data);
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
        add_godata: function (this_data) {
            // console.log(this_data)
            $(".f_prompt").hide();
            $(".f_main_next").show();
       
                var sport_srt = '<li class="jsSport" data-this_floor='+this_data.this_floor_index+' data-this_tag_time='+this_data.this_tag_time+' data-lat='+this_data.this_lat+' data-lng='+this_data.this_lng+' data-period_time="'+this_data.period_time+'" >\
                                <div class="_l">\
                                    <img src="'+this_data.this_img_src+'" alt="">\
                                </div>\
                                <div class="_r">\
                                    <p class="p1" title='+this_data.this_name+'><span>'+this_data.this_name+'</span></i></p>\
                                    <p class="p2 playTime">适玩时长：<span class="time_num">'+this_data.this_playtime+'</span>\
                                    <span class="playBut is_timeEdit'+this_data.not_modifity+'"><i class="play_t"></i><i class="play_d"></i></span></p>\
                                </div>\
                                <div class="delete_icon"></div>\
                            </li>'
               
            
            $(".js_attractions_ul").append(sport_srt)
            //添加景点适玩时间
            sportEat_time_arr.push(this_data.this_tag_time);
            var time = initFn.getAllsum(sportEat_time_arr);
            initFn.playtimeFn(time);
            initFn.return_hoverFn()

        },
        adgo_eat: function (this_data) {
            // console.log(this_data)
            // $(".food_box").show();
            var str = ""
            if(this_data.fen_data){
                str = '<li class="jsEat fen_list"  data-this_tag_time='+this_data.tag_time+' data-lat='+this_data.lat+' data-lng='+this_data.lng+' data-period_time="">\
                        <div class="_l">\
                            <img src="'+this_data.dianpu_image+'" alt="">\
                        </div>\
                        <div class="_r">\
                            <p class="p1" title='+this_data.name+'><span>'+this_data.name+'</span><i class="time_icon"></i></p>\
                            <p class="p2 playTime">推荐用餐：<span class="time_num">'+this_data.meal_time+'</span><span class="playBut"><i class="play_t"></i><i class="play_d"></i></span> </p>\
                        </div>\
                        <div class="delete_icon"></div>\
                    </li>'
               
            }else{
                str = '<li class="jsEat"  data-this_tag_time='+this_data.tag_time+' data-lat='+this_data.lat+' data-lng='+this_data.lng+' data-period_time="">\
                                <div class="_l">\
                                    <img src="'+this_data.dianpu_image+'" alt="">\
                                </div>\
                                <div class="_r">\
                                    <p class="p1" title='+this_data.name+'><span>'+this_data.name+'</span></i></p>\
                                    <p class="p2 playTime">推荐用餐：<span class="time_num">'+this_data.meal_time+'</span><span class="playBut"><i class="play_t"></i><i class="play_d"></i></span> </p>\
                                </div>\
                                <div class="delete_icon"></div>\
                            </li>'
                       
            }
            $('.js_attractions_ul').append(str)

            //添加美食适玩时间
            sportEat_time_arr.push(Number(this_data.tag_time))
            var time = initFn.getAllsum(sportEat_time_arr);
            initFn.playtimeFn(time);

            initFn.return_hoverFn()
            

            

        },
        return_temData:function(data){
            // console.log(data)
            $(".f_prompt").hide();
            $(".f_main_next").show();
            var return_str = '{{each completeData as value i}}\
                                {{if value.js_sport_eat == "sport"}}\
                                    <li class="jsSport" data-this_floor={{value.this_floor_index}} data-this_tag_time={{value.this_tag_time}} data-lat={{value.this_lat}} data-lng={{value.this_lng}} data-period_time={{value.period_time}}>\
                                        <div class="_l">\
                                            <img src="{{value.this_img_src}}" alt="">\
                                        </div>\
                                        <div class="_r">\
                                            <p class="p1" title={{value.this_name}}><span>{{value.this_name}}</span></i></p>\
                                            <p class="p2 playTime">适玩时长：<span class="time_num">{{value.this_playtime}}</span><span class="playBut is_timeEdit{{value.not_modifity}}"><i class="play_t"></i><i class="play_d"></i></span></p>\
                                        </div>\
                                        <div class="delete_icon"></div>\
                                    </li>\
                                {{else}}\
                                    {{if value.fen_list}}\
                                        <li class="jsEat fen_list"  data-this_tag_time={{value.tag_time}} data-lat={{value.lat}} data-lng={{value.lng}}>\
                                            <div class="_l">\
                                                <img src="{{value.dianpu_image}}" alt="">\
                                            </div>\
                                            <div class="_r">\
                                                <p class="p1" title={{value.name}}><span>{{value.name}}</span><i class="time_icon"></i></p>\
                                                <p class="p2 playTime">推荐用餐：<span class="time_num">{{value.meal_time}}</span><span class="playBut"><i class="play_t"></i><i class="play_d"></i></span> </p>\
                                            </div>\
                                            <div class="delete_icon"></div>\
                                        </li>\
                                    {{else}}\
                                        <li class="jsEat"  data-this_tag_time={{value.tag_time}} data-lat={{value.lat}} data-lng={{value.lng}}>\
                                            <div class="_l">\
                                                <img src="{{value.dianpu_image}}" alt="">\
                                            </div>\
                                            <div class="_r">\
                                                <p class="p1" title={{value.name}}><span>{{value.name}}</span><i class="time_icon"></i></p>\
                                                <p class="p2 playTime">推荐用餐：<span class="time_num">{{value.meal_time}}</span><span class="playBut"><i class="play_t"></i><i class="play_d"></i></span> </p>\
                                            </div>\
                                            <div class="delete_icon"></div>\
                                        </li>\
                                    {{/if}}\
                                {{/if}}\
                            {{/each}}'
            var render = template.compile(return_str);
            var renter_html = render(data) 
            $('.js_attractions_ul').html(renter_html)
            initFn.return_hoverFn();

            var completeData = data.completeData;
            for(var i = 0;i<completeData.length;i++){
                var paly_tag_time = completeData[i].this_tag_time?completeData[i].this_tag_time:completeData[i].tag_time
                sportEat_time_arr.push(Number(paly_tag_time))
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
        //进度条
        Progressbar: function (percentage,is_color) {
            var color1 ;
            var color2 ;
            if(is_color == 1){
                color1 = '#caf587' 
                color2 = '#aada60' 
            }else if(is_color == 2){
                color1 = '#f4e237' 
                color2 = '#ddc802' 
            }else{
                color1 = '#d44337' 
                color2 = '#af1407' 
            }
            $('#progressbar').LineProgressbar({
                percentage: percentage,
                fillBackgroundColor:  '-webkit-linear-gradient(right,'+color2+','+color1+')' ,
                height: '10px',
                radius: '5px'
            });
        },
        //隐藏提示 文字 和 安排日程 按钮
        delNull: function () {
            // console.log(this_citydata)
            if (this_citydata.eat_name_arry.length == 0 && this_citydata.addgo_arry.length == 0) {
                $(".f_prompt").show();
                $(".f_main_next").hide();
                $('.bar_city_name').attr('data-allpalytime','0')
            }else if(this_citydata.eat_name_arry.length == 1 && this_citydata.addgo_arry.length == 0){
                $(".f_main_next").hide();
            }
        },
        //添加我想去动画
        addflyer: function (list, $this) {
            $(".u-flyer").eq(0).remove();
            var img_src = $(list).find("img").attr("src");
            var city_postion = $this.offset();
            var left = city_postion.left
            var top = city_postion.top;
            var end_postion = $(".js_endfly").eq(0).offset(),
                end_width = $(".js_endfly").width() / 2,
                end_height = $(".js_endfly").height() + 50;
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
    cityAttractions.Progressbar(0);
    cityAttractions.downFn();

     //给当前时间加天数
     var city_addDate = function (date, days,isAdd) {
        
        var d = new Date(date);
        
        if(isAdd == 'add'){
            d.setDate(d.getDate() + days);
        }else{
            d.setDate(d.getDate() - days);
        }
        var y = d.getFullYear();
        var m = d.getMonth() + 1;
        // console.log(y)
        // return d.getFullYear()+'-'+m+'-'+d.getDate(); 
        // ---
        d = d.getDate();
        if (m >= 1 && m <= 9) {
            m = "0" + m;
        }
        if (d >= 0 && d <= 9) {
            d = "0" + d;
        }
        return m + '.' + d+"-"+y+'.'+m + '.' + d;
        
    }
    
  
});