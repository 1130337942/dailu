var map, popup, Popup, hoverCityMarker, addCityMarker, pro_polygonPath,
    polygon_arr = [],
    city_polygonArr = [],
    hover_city_markerArr = [],
    add_city_markerArr = [],
    goBackCityMarker,
    go_pos = {},//返回城市经纬度
    back_pos = {},//返回城市经纬度
    go_backCityMarkerArr = [],
    go_back_data_arr = [],//出发城市返回城市信息
    go_city_Arr = [],
    initObj = {},
    FlightPath, //定义城市连线
    FlightPath_arr, //城市连线数
    Dottedline, //定义虚线
    Dottedline_array = [], //虚线
    cover_img_url;//第一个城市的图片(封面)
var post_cityData = {}; //周边城市 向后台发送的数据

var addDayNum = 0; //添加城市的总天数
var if_addDay = 0;//if判断
var ranking_array = ["第一名", "第二名", "第三名"];
//判断是否为ie浏览器
var is_ie_num = IEVersion();
var barGg = is_ie_num == -1?'-webkit-':'-ms-';
//获取用户id
var get_uid = getCookie('uid'); 
if(get_uid != null){
    var uidObj = {uid:get_uid}
}
//用户类别
var insiders;
var provinces = ["广西-#C8C1E3-4", "广东-#FBC5DC-3", "湖南-#DBEDC7-11",
    "贵州-#E7CCAF-5", "云南-#DBEDC7-25", "福建-#FEFCBF-1",
    "江西-#E7CCAF-13", "浙江-#C8C1E3-26", "安徽-#FBC5DC-0",
    "湖北-#C8C1E3-10", "河南-#DBECC8-8", "江苏-#DBECC8-12",
    "四川-#FCFBBB-22", "海南省-#FCFBBB-6", "山东-#FCFBBB-19",
    "辽宁-#FCFBBB-15", "新疆-#FCFBBB-24", "西藏-#E7CCAF-23",
    "陕西-#E7CCAF-21", "河北-#E7CCAF-7", "黑龙江-#E7CCAF-9",
    "宁夏-#FBC5DC-17", "内蒙古自治区-#DBEDC7-16", "青海-#DBEDC7-18",
    "甘肃-#C8C1E3-2", "山西-#FBC5DC-20", "吉林省-#C8C1E3-14",
    "北京-#FBC5DC-27", "天津-#C8C1E3-29", "上海-#FCFBBB-28",
    "重庆市-#FBC5DC-30", "香港-#C8C1E3-31", "台湾-#C8C1E3-33", "澳门-#C8C1E3-32"
];

//高亮
var polyOptions = {
    //边线边框线
    strokeColor: "#9B868B",
    fillColor: "",
    fillOpacity: 0.5,
    strokeWeight: 1,
    zIndex: 1
};
//省份边界线
var var_polyPath = {
    strokeWeight: 1,
    strokeColor: '#FF0000',
    fillOpacity: 0,
}
//从1到5楼返回省份页面标记 页面后退
var is_back_city = sessionStorage.is_back_city;
$(function () {
    //清除所有的session存储
    sessionStorage.clear();
    //头部登陆隐藏
    // $('.nav_rig').find('a').removeAttr('href');

    
    //页面后退
    if(is_back_city == 'ok'){
        //从1到5楼返回省份页面标记
        sessionStorage.setItem('is_back_city','ok')
        $.post('TakeCity',function(data){
            // console.log(data);
            if(!data)return
            $(".loading_box").fadeOut();
            google.maps.event.addDomListener(window, "load", mapObj.initMap());
            //渲染添已添加加城市的数据
            go_city_Arr = data.go_city_array;
            addDayNum = data.day_num
            
            var frstCity_data = go_city_Arr[0]
            post_cityData.lat = Number(frstCity_data.lat);
            post_cityData.lng = Number(frstCity_data.lng);
            post_cityData.city_id = frstCity_data.city_id;
            post_cityData.province_id = frstCity_data.province_id;
            post_cityData.day_num = data.day_num;
            post_cityData.city_day_num = frstCity_data.city_daynum;
            //获取周边城市列表
            initObj.post_surFn();
            map.setCenter({lat:post_cityData.lat,lng:post_cityData.lng});
            map.setZoom(8);
            
            // 行程信息
            initObj.travelinforFn(data);
            $(".content").find(".provinces_con_rig").hide().end() //右边省份隐藏
            .find(".city_con_rig").show().end()
            //周边城市显示
            initObj.post_surList();
            
            //计算进度条
            initObj.calculate_day_parFn(addDayNum)
            templateObj.addcity_template();
            for(var i = 0;i<go_city_Arr.length;i++){
                var lat = Number(go_city_Arr[i].lat)
                var lng = Number(go_city_Arr[i].lng)
                //添加标记点
                mapObj.addCitymarker({lat:lat,lng:lng},Number(i+1));

                var addinfoDataObj = {
                    name: go_city_Arr[i].city_name,
                    lat: lat,
                    lng: lng,
                    Class_name: "infoClass",
                    index: i
                }
                mapObj.style_InfowindowFn(addinfoDataObj, "addCity");

                //城市连线
                FlightPath_arr = FlightPath.getPath();
                FlightPath_arr.push(new google.maps.LatLng(lat, lng));
                
            }
            
            //多个添加城市,第一个城市不能删除
            initObj.is_show_DelIconFn();
            //对已添加的城市(左边列表)事件方法
            initObj.lefe_cityListFn();
           
           
        },'json');
    }else{
       
        //请求省份数据
        $.get("province",uidObj, function (res) {
            if (!res) return false;
            //用户类别
            insiders = res.insiders
            //初始化调动方法
            initObj.initFn(res);

            // $('.nav_rig').find('.landing').on('click',function(){
            //     initObj.loginFn()
            // })
        }, "json");
    }

    // 页面初始化展示的内容
    initObj = {
        //初始化调动方法
        initFn: function (res) {
            //加载动画隐藏
            $(".loading_box").fadeOut()
            //移除自定义窗口
            mapObj.del_infowindowFn("content");
            //省份数据渲染
            templateObj.provinceTemplate(res);
            google.maps.event.addDomListener(window, "load", mapObj.initMap());
            //全国边界线
            mapObj.pre_showBoundaryFn()
            // 行程信息
            initObj.travelinforFn();
            //鼠标放省份列表效果
            initObj.province_lisHoverFn();
            //点击省份列表加载城市列表
            initObj.getCityListFn();
            //右边城市事件
            initObj.right_cityFn()

        },
        // 行程信息
        travelinforFn: function (data) {
            //后退
            if(is_back_city == 'ok'){
                $("#date_from").val(data.date);
                //行程天数
                $('.num_day').html(data.day_num);
                $(".adult_num").html(data.adult);
                $(".children_num").html(data.children);
                var go_city = data.departure_city.city_name;
                var back_city = data.return_city.city_name
                $(".from_name").html(go_city);
                $(".to_name").html(back_city);
                $(".from_name").attr('data-lat',data.departure_city.lat).attr('data-lng',data.departure_city.lng);
                $(".from_name").attr('data-lat',data.return_city.lat).attr('data-lng',data.return_city.lng);
            }else{
                //出发时间
                $("#date_from").val(getDate())
                //行程天数
                $('.num_day').html(5);
                //通过高德地图获取ip地址 渲染出发城市和返回城市
                mapObj.lbsMapIPfn()
            }
           
            $('#date_from').datepicker({
                minDate: 0,
                dateFormat: "yy-mm-dd"
            });
            //行程天数加减
            $(".f_top_p").on('click', ".addsj_icon,.reducesj_icon", function (e) {
                var addsj_travel_days = Number($(".num_day").html());
                if (e.currentTarget.className == 'addsj_icon') {
                    addsj_travel_days < 30 ? addsj_travel_days++ : 30
                } else {
                    addsj_travel_days > 1 ? addsj_travel_days-- : 1
                }
                $(".num_day").html(addsj_travel_days);
                //只有选择城市，进度条才会有变化
                if (!$(".city_box").hasClass('dis_none')) {
                    initObj.calculate_day_parFn(addDayNum)
                }
            });

            
            
            // 成人人数
            $('.adult_box').find(".add_gre").unbind('click').on("click", function () {
                var adult_num = Number($(".adult_num").html());
                adult_num++
                $(".adult_num").html(adult_num);
            }).end().find(".dow_gre").unbind('click').on("click", function () {
                var adult_num = Number($(".adult_num").html());
                adult_num--
                if (adult_num <= 1) {
                    adult_num = 1
                }
                $(".adult_num").html(adult_num);
            });
            // 儿童人数
            $('.children_box').find(".add_gre").unbind('click').on("click", function () {
                var adult_num = Number($(".children_num").html());
                adult_num++
                $(".children_num").html(adult_num);
            }).end().find(".dow_gre").unbind('click').on("click", function () {
                var adult_num = Number($(".children_num").html());
                adult_num--
                if (adult_num <= 0) {
                    adult_num = 0
                }
                $(".children_num").html(adult_num);
            });

            //出发城市，返回城市显示 弹框
            $('.city_rightTxt,.addgo_cityBox').find(".from_div,.to_div,.departure,.return_box").unbind('click').on('click', function () {
                $('.more_cities_box').find(".other_city").removeClass("city_color city_list_bgcolor").end()
                    .find(".current_city").addClass("city_color city_list_bgcolor").end()
                    .find(".current_list").fadeIn().end().find(".other_list").fadeOut().end()
                    .find(".sfcity").html("").end().find("#seach_list").hide().end().find('#search_city').val('').end()
                    .find(".search_icon").removeClass("searchdel");
                var isgo_backAttr = $(this).find('.city_ri,.ft_txt').text().replace(/\s+/g, "") == "出发城市" ? "from_name" : "to_name"
                $('.more_cities').fadeIn().attr('data-isGpBack', isgo_backAttr);
                var city_name = $(this).find('.ct_name').html();
                $('.current_city_name').html(city_name);
                // 展示当前城市的省份城市
                $.get('/portal/addstrokeform/cityForm', {
                    city_name: city_name
                }, function (res) {
                    if (!res) return;
                    var city_template = '<ul class="clearfix">\
                                        {{each list as value i}}\
                                        <li title="{{value.area_name}}">{{value.area_name}}</li>\
                                        {{/each}}\
                                    </ul>';
                    var city_render = template.compile(city_template);
                    var city_html = city_render(res);
                    $(".current_list").html(city_html);
                }, 'json');
            });
            // 展示当前城市的省份城市
            $('.current_city').unbind('click').on('click', function () {
                $(this).addClass('city_list_bgcolor');
                $('.more_cities_box').find('.current_list').fadeIn().end().find('.other_list').fadeOut().end()
                    .find('.other_city').removeClass('city_list_bgcolor').end().find(".sfcity").html("");
            })
            //其他省份
            $('.other_city').unbind('click').on('click', function () {
                $(this).addClass('city_list_bgcolor')
                $('.more_cities_box').find('.current_list').fadeOut().end().find('.other_list').fadeIn().end()
                    .find('.city_color').removeClass('city_list_bgcolor').end().find(".sfcity").html("");
                $.get('/portal/addstrokeform/otherSearchCity', function (res) {
                    if (!res) return
                    var zxs_template = '{{each Info.municipalitie as value i}}\
                                        <li title="{{value.area_name}}">{{value.area_name}}</li>\
                                    {{/each}}';
                    var zxs_render = template.compile(zxs_template);
                    var zxs_html = zxs_render(res);
                    $(".zxs_ul").html(zxs_html);

                    var sf_template = '{{each Info.province as value i}}\
                                            <li data-sfid = "{{value.area_id}}">{{value.area_name}}</li>\
                                        {{/each}}';
                    var sf_render = template.compile(sf_template);
                    var sf_html = sf_render(res);
                    $(".sf_ul").html(sf_html);
                }, 'json')
            });
            //点击省份获取该省的城市
            $('.other_list .sf').find('.sf_ul').unbind('click').on('click', 'li', function () {
                $(".other_list").fadeOut();
                var province_id = $(this).data("sfid");
                $.get('/portal/addstrokeform/province_city', {
                    province_id: province_id
                }, function (res) {
                    if (!res) return
                    var sfcity_template = '<ul class="sfcity_ul clearfix">\
                                            {{each city as value i}}\
                                            <li title="{{value.area_name}}">{{value.area_name}}</li>\
                                            {{/each}}\
                                        </ul>';
                    var sfcity_render = template.compile(sfcity_template);
                    var sfcity_html = sfcity_render(res);
                    $(".sfcity").html(sfcity_html);
                }, 'json')
            });

            //城市搜索
            var timer;
            $("#search_city").on('input propertychange', function () {
                $("#seach_list").fadeIn();
                $(".search_icon").addClass("searchdel");
                var city_name = $(this).val().replace(/\s+/g, "");
                clearTimeout(timer)
                timer = setTimeout(function () {
                    $.get('/portal/addstrokeform/search', {
                        city_name: city_name
                    }, function (res) {
                        if (res == null) {
                            $(".seach_list").html("<ul><li class='not_data'>未检索到相关信息</li></ul>")
                        } else {
                            var seach_list_template = '<ul>\
                                                    {{each searchList as value i}}\
                                                    <li>{{value.area_name}}</li>\
                                                    {{/each}}\
                                                  </ul>';
                            var seach_list_render = template.compile(seach_list_template);
                            var seach_list_html = seach_list_render(res);
                            if (res.searchList == "") {
                                $(".seach_list").html("<ul><li class='not_data'>未检索到相关信息</li></ul>")
                            } else {
                                $(".seach_list").html(seach_list_html)
                            }
                        }
                    }, 'json')
                }, 400);

            });

            //改变出发城市返回城市的值
            $('.more_cities_box').find('.current_list,.zxs,.sfcity,.seach_list').unbind("click").on('click', 'li', function () {
                var isgo_backAttr = $('.more_cities').attr('data-isGpBack')
                var thisCity = $(this).html()
                $('.current_city_name').html(thisCity);
                $('.more_cities').fadeOut();
                var geocoder = new google.maps.Geocoder();
                    geocoder.geocode({
                        'address': thisCity
                    }, function (results, status) {
                        if (status === 'OK') {
                            var position = results[0].geometry.location;
                            $('.' + isgo_backAttr).html(thisCity).attr('data-lat',position.lat()).attr('data-lng',position.lng());
                            
                            if (!$(".city_box").hasClass('dis_none')) {
                                //清除虚线
                                if(Dottedline_array[0]){
                                    Dottedline_array[0].setMap(null);
                                    Dottedline_array[1].setMap(null);
                                }
                                Dottedline_array = [];
                                //清除出发城市返回城市marker
                                $(go_backCityMarkerArr).each(function(){
                                    this.setMap(null)
                                });
                                $('#map').find('.popup-goBackCityInfo,.goBackCityInfo').each(function(){
                                    $(this).remove()
                                })
                                go_backCityMarkerArr = []
                                //添加出发城市和返回城市marker 交通虚线
                                mapObj.go_backCityFn('is_change');
                            }

                        } else {
                            alert('Geocode was not successful for the following reason: ' + status);
                        }
    
                    });
                
            });

            //取消出发 返回 城市弹框
            $('.more_cities_box .city_bottom').unbind('click').on('click', function () {
                $('.more_cities').fadeOut()
            })

             
            
        },
        
        //鼠标hover省份列表
        province_lisHoverFn: function () {
            var provinceName, getPolygon_index;
            $('.province_r_main').find(".list").unbind("hover").hover(function () {
                var iszxs = Number($(this).attr("data-type"));
                provinceName = $(this).find(".provinces").html();
                var get_is_cityData
                if(iszxs == 0){
                    get_is_cityData = cityData.provinces
                }else if(iszxs == 1){
                    get_is_cityData = cityData.municipalities
                }else{
                    get_is_cityData = cityData.other
                }
               
                var get_index = getArrIndex(get_is_cityData, {
                    n: provinceName
                });
                // console.log(polygon_arr)
                getPolygon_index = getColor(provinceName)[2] //根据polygon push数组的索引值
                //地图高亮
                polygon_arr[getPolygon_index].setOptions({
                    //鼠标放上去的颜色
                    fillColor: "#FFFF00",
                });

                // 自定义窗口
                var info_location = g_location(get_is_cityData[get_index]);
                var MapinfoDataObj = {
                    name: provinceName,
                    lat: info_location.lat,
                    lng: info_location.lng,
                }
                mapObj.style_InfowindowFn(MapinfoDataObj, "isProvince")
            }, function () {
                //地图高亮
                if(polygon_arr[getPolygon_index]){
                    polygon_arr[getPolygon_index].setOptions({
                        fillColor: getColor(provinceName)[1],
                    });
                }
                //移除自定义窗口
                mapObj.del_infowindowFn("content");
            });

        },
        //点击省份列表
        getCityListFn: function () {
            $('.province_r_main').find(".list").unbind("click").on('click','.list_icon_box', function () {
                var $list = $(this).parents('li')
                var clist_placeNames = $list.find(".provinces").html(); //省份名字
                var clist_data_type = $list.attr("data-type");
                var province_id = $list.attr("data-province_id"); //省份id
                var s_city_id = ""; //搜索城市id
                initObj.proCitylist(clist_placeNames, clist_data_type, province_id, s_city_id)
            })
        },
        // 点击省份自定义窗口和省份列表对比，获取该省的城市列表
        clickProvinceMapFn: function (provincesName) {
            $(".province_r_main li").each(function (i, n) {
                if (provincesName == $(n).find(".provinces").text()) {
                    var clist_data_type = $(n).attr("data-type");
                    var province_id = $(n).attr("data-province_id");
                    var s_city_id = ""; //搜索城市id
                    //加载城市列表
                    initObj.proCitylist(provincesName, clist_data_type, province_id, s_city_id)
                }
            })
        },
        //点击城市自定义窗口和城市列表对比
        clickCityMapFn: function (city_name) {
            $(".city_r_main .list").each(function (i, n) {
                if ($(n).find(".city_name").html() == city_name) {
                    // 获取第一次添加城市的数据，加载周边城市列表
                    initObj.get_firstAddCatyFn($(n), $("#content"));
                };
            });
        },
        //省份加载城市列表
        proCitylist: function (clist_placeNames, clist_data_type, province_id, search_city_id) {
            // console.log(clist_placeNames);
            $(".content").find(".provinces_con_rig").hide().end() //右边省份隐藏
                .find(".city_con_rig").show().end() //右边城市显示
                .find(".city_r_main").show().end() //改省份的城市列表显示
                .find(".surrounding_city_r_main").hide(); //城市的周边城市列表隐藏(点击城市我想去显示该城市的周边城市列表)
            // console.log( search_city_id)
            $.ajax({
                url: search_city_id == "" ? "city" : "searchCity", //searchCity点击搜索的结果，返回省份下城市
                type: "POST",
                dataType: "json",
                data: {
                    province_id: province_id,
                    city_id: search_city_id
                },
                success: function (res) {
                    // console.log(res);
                    templateObj.cityTemplate(res, clist_placeNames);
                    //省份边界线亮
                    mapObj.provincePolygonMapFn(clist_data_type, clist_placeNames);
                    //城市边界线
                    mapObj.city_OptionsFn(clist_data_type, clist_placeNames, res);
                    //鼠标放在城市列表
                    initObj.hover_CityListfn(clist_data_type)
                    //我想去(第一次添加 根据该城市加载周边城市)
                    initObj.firstGoGetSurListFn();
                   
                }
            });
        },
        //hover省份下的城市列表
        hover_CityListfn: function (data_type) {
            var this_index;
            $('.city_r_main').find(".list").unbind("hover").hover(function () {
                var city_name = $(this).find('.city_name').html();
                this_index = $(this).index();
                if (city_polygonArr.length == 0) return
                city_polygonArr[this_index].setOptions({
                    fillColor: "#FFFF00",
                    fillOpacity: 0.5,
                });
                var cityLocation = city_polygonArr[this_index].cityLocation;
                //hover添加城市标记点
                mapObj.hover_cityMarker(cityLocation, city_name);
                var MapinfoDataObj = {
                    name: city_name,
                    lat: cityLocation.lat,
                    lng: cityLocation.lng,
                    city_day_num: $(this).find('.r_daynum').html()
                }
                //添加自定义窗口
                mapObj.style_InfowindowFn(MapinfoDataObj, "isCity")
            }, function () {
                if (city_polygonArr.length == 0) return
                city_polygonArr[this_index].setOptions({
                    fillColor: "",
                    fillOpacity: 0,
                });
                //清除标记marker
                mapObj.del_cityMarker(hover_city_markerArr,'hover');
                //清除自定义窗口
                mapObj.del_infowindowFn("content");
            })
        },
        //我想去(第一次添加 根据该城市加载周边城市)
        firstGoGetSurListFn: function () {
            $('.city_r_main').find('.list .go_button').unbind('click').on('click', function () {
                var $list = $(this).parents(".list");
                // 获取第一次添加城市的数据，加载周边城市列表
                initObj.get_firstAddCatyFn($list, $(this))
            });

        },
        // 获取第一次添加城市的数据，加载周边城市列表
        get_firstAddCatyFn: function ($list, $this) {
            post_cityData.lat = Number($list.attr("data-lat"));
            post_cityData.lng = Number($list.attr("data-lng"));
            post_cityData.city_id = $list.attr("data-cityid");
            post_cityData.province_id = $list.attr("data-provinceid");
            post_cityData.day_num = $(".num_day").html();
            post_cityData.city_day_num = $list.find(".r_daynum").html();
            cover_img_url = $list.find("img").attr('src')//第一个城市的图片
            var first_city_name = $list.find(".city_name").html();
            //右边top推荐周边城市
            $(".sur_this_city").html(first_city_name);
            // console.log(post_cityData);
            //添加我想去城市数据
            initObj.addCityObjFn($list, $this);
            //添加出发城市和返回城市marker 交通虚线
            mapObj.go_backCityFn();
            //请求周边城市列表 显隐
            initObj.post_surList();
        },
        //请求周边城市列表 显隐
        post_surList: function () {
            // 显隐
            $(".city_box").removeClass("dis_none");
            $('.f_main_main').find('.form_info_box').hide().end().find('.addgo_cityBox').show();
            $('.con_lef').find('.f_main_bg').hide().end().find('.f_main_next').show();
            //清除城市高亮
            mapObj.del_polygon(city_polygonArr, "city");
            //清除省份边界线
            if(pro_polygonPath){
                pro_polygonPath.setMap(null);
            }
            $('.city_con_rig').find('.city_r_main,.city_r_top').hide().end()
            .find(".surrounding_city_r_main,.addcity_r_top").show();
        },
        //请求周边城市接口
        post_surFn:function(){
            $.post('aroundCity',post_cityData,function(res){
                if (!res) return;
                //渲染周边城市
                templateObj.surroundingCitytemplate({current: res}, "sur");
                //鼠标放在周边城市列表
                initObj.hover_surCityFn();
                //添加周边城市我想去
                initObj.click_surCityFn();
            },'json')
        },
        //鼠标放在周边城市列表
        hover_surCityFn: function () {
            $('.surrounding_city_r_main').find('.list').unbind('hover').hover(function () {
                // if (!$(this).hasClass("city_list_go")) {
                if ($(this).hasClass("city_list_go")) return;
                var lat = Number($(this).attr("data-lat")),
                    lng = Number($(this).attr("data-lng"));
                // var sur_city_position = new google.maps.LatLng(lat, lng);
                var sur_city_position = {
                    lat: lat,
                    lng: lng
                }
                var sur_city_name = $(this).find(".city_name").html();
                mapObj.hover_cityMarker(sur_city_position, sur_city_name);
                var MapinfoDataObj = {
                    name: sur_city_name,
                    lat: lat,
                    lng: lng,
                    city_day_num: $(this).find('.r_daynum').html(),
                    addMapIcon: 'hide'
                }
                mapObj.style_InfowindowFn(MapinfoDataObj, 'isCity')
                // }
            }, function () {
                mapObj.del_cityMarker(hover_city_markerArr,'hover');
                //移除自定义窗口
                mapObj.del_infowindowFn("content");
            })
        },
        //点击周边城市
        click_surCityFn: function () {
            $('.surrounding_city_r_main').find(".list .go_button").unbind('click').on('click', function () {
                var $list = $(this).parents('.list');
                if ($list.hasClass('city_list_go')) return;
                // 添加我想去城市数据
                initObj.addCityObjFn($list, $list);
            })
        },
        // 添加我想去城市数据
        addCityObjFn: function ($list, $this) {
            var go_city_obj = {}; //添加我想去城市
            var lat = Number($list.attr("data-lat")),
                lng = Number($list.attr("data-lng")),
                city_name = $list.find('.city_name').html();
            go_city_obj.lat = lat;
            go_city_obj.lng = lng;
            go_city_obj.position={lat:lat,lng:lng}
            go_city_obj.city_id = $list.attr("data-cityid");
            go_city_obj.province_id = $list.attr("data-provinceid");
            go_city_obj.city_daynum = $list.find(".r_daynum").html(); //可以加减的天数
            go_city_obj.fit_day = $list.find(".r_daynum").html(); //适玩天数
            go_city_obj.city_name = city_name;
            go_city_obj.city_Introduction = $list.find(".jsi_data").attr("data-city_Introduction");
            go_city_obj.provinceNames = $list.find('.js_prename').html();
            // console.log(go_city_obj) 
            //计算天数和进度条
            if_addDay = Number(go_city_obj.fit_day)+addDayNum
            if(if_addDay>=30){ //行程超过30天不能添加城市
                layer.msg('行程总天数不能超过30天',{
                    time:600,
                    offset:'300px' //是根据浏览器的位置
                });
                return false
            };
            //计算进度条
            addDayNum += Number(go_city_obj.fit_day);
            initObj.calculate_day_parFn(addDayNum)
            
            go_city_Arr.push(go_city_obj);

            //计算两个城市之间的距离交通
            
            var dis_i = go_city_Arr.length - 1;
            if (dis_i > 0) {
                var dis = GetDistance(go_city_Arr[dis_i - 1].lat, go_city_Arr[dis_i - 1].lng, go_city_Arr[dis_i].lat, go_city_Arr[dis_i].lng);
                //计算城市之间的距离
                initObj.trcDisFn(dis, dis_i);
                //重新加载返回城市虚线 和距离交通
                initObj.backDotteLineFn () 
            }
            //添加动画
            addflyer($list, $this);
            //渲染添加城市的数据
            // templateObj.addcity_template();
            $('.cityBoxUl').append(templateObj.addcity_template(go_city_obj))
            //列表的top值变灰
            // $list.addClass("city_list_go").find(".go_button").addClass("go_button_gray").html("已添加").end()
            //     .find(".top_box").addClass("add_top_box"); 

            var cityLatLng = {
                lat: lat,
                lng: lng
            }
            var labelNum = go_city_Arr.length
            //添加城市marker
            mapObj.addCitymarker(cityLatLng, labelNum);

            var addinfoDataObj = {
                name: city_name,
                lat: lat,
                lng: lng,
                Class_name: "infoClass",
                index: labelNum - 1
            }
            mapObj.style_InfowindowFn(addinfoDataObj, "addCity")
            //城市连线
            FlightPath_arr = FlightPath.getPath();
            FlightPath_arr.push(new google.maps.LatLng(lat, lng));
            //多个添加城市,第一个城市不能删除
            initObj.is_show_DelIconFn();
            //对已添加的城市(左边列表)事件方法
            initObj.lefe_cityListFn();
        },
        //右边省份下的城市部分事件
        right_cityFn: function () {
            //省份搜索
            var seach_timer,seach_res,sur_seach_res,is_city_sur;
            $(".provinces_search_s,.city_search_s,#sur_input").bind('input propertychange', function () {
                var input_val = $.trim($(this).val());
                if (input_val == '')return 
                var thisClass;
                $(".province_r_main,.province_search_icon,.city_r_main,.citys_search_icon,.surrounding_city_r_main").hide();
                $(".search_content_list,.provsearch_del,.citysearch_cont_list,.citysearch_del,.sur_serch_list").show();
                if($(this).hasClass("provinces_search_s")){
                    thisClass = ".search_content_list";
                    is_city_sur = 'city'
                }else if($(this).hasClass("city_search_s")){    
                    thisClass = ".citysearch_cont_list";
                    is_city_sur = 'city'
                }else{
                    $('.citysearch_cont_list').hide()
                    thisClass = ".sur_serch_list";
                    is_city_sur = 'sur'
                }
                clearTimeout(seach_timer);
                seach_timer = setTimeout(function () {
                    $.get("search",{city_name: input_val}, function (res) {
                        if(!res)return
                        // console.log(res);
                        if(is_city_sur == 'city'){
                            seach_res = res 
                        }else{
                            sur_seach_res = res
                        }
                        //搜索 预选项列表 渲染
                        if (res.city.length == 0) {
                            $(thisClass).html('<li class="search_li not_search" >未检索到相关信息</li>')
                        } else {
                            templateObj.searchTemplate(res, thisClass, is_city_sur);
                        }  
                    },"json")
                }, 500)
            })
            //省份下城市返回
            $('.con_rig').find('.back').unbind("click").on('click', function () {
                    //清除省份边界线
                    pro_polygonPath.setMap(null);
                    // 清除城市高亮和城市边界线
                    mapObj.del_polygon(city_polygonArr, "city");
                    //全国边界线
                    mapObj.pre_showBoundaryFn();
                    map.setZoom(4);
                    $(".content").find('.city_con_rig').hide().end().find('.provinces_con_rig,.province_r_main,.province_search_icon').show()
                }).end()
                //省份下城市搜索
                .find('.city_nearby_right').unbind('click').on('click', function () {
                    $(".city_con_rig").find(".city_r_top").hide().end()
                    .find(".search_content").show();
                }).end()
                //周边城市收索
                .find('#sur_input,.addcitytext').on('click',function(){
                    $('.search_icon,.addcitytext').hide()
                    $(".sur_del,#sur_input").show();
                }).end()
                //点击 搜索列表
                .find('.citysearch_cont_list,.search_content_list,.sur_serch_list ').on('click', 'li:not(.not_search)', function () {
                    var i = $(this).index()
                    if($(this).parents('.r_main').hasClass("citysearch_cont_list")){
                        //清除城市高亮
                        mapObj.del_polygon(city_polygonArr, 'city');
                        //清除省份边界线
                        pro_polygonPath.setMap(null);
                        // data = citySearch_res
                    }else if($(this).parents('.r_main').hasClass("sur_serch_list")){
                        var postData = {
                            city_name: sur_seach_res.city[i].city_name,
                            city_id: sur_seach_res.city[i].city_id
                        }
                        $.post("around_searchCity", postData, function (data) {
                            // console.log(data)
                            if (!data) return false;
                            $(".sur_serch_list").hide().siblings(".surrounding_city_r_main").show();
                            $(".addcitytext,.search_icon").show().siblings("#sur_input,.sur_del").hide();
                            $('#sur_input').val('')
                            templateObj.surroundingCitytemplate({current: data}, "search");
                            $('.surrounding_city_r_main').scrollTop(0);
                            //鼠标放在周边城市列表
                            initObj.hover_surCityFn();
                            //添加周边城市我想去
                            initObj.click_surCityFn()
                            // sur_hoverli(data,'search')
                        }, 'json');
                    };
                    if(is_city_sur == 'city'){
                        $(".con_rig").find(".citysearch_cont_list,.search_content,.search_content_list,.provsearch_del").hide().end()
                        .find(".city_r_top").show().end().find("#search_nearby,#nearby").val("");
                   
                    var search_placeNames = seach_res.city[i].province_name;
                    var search_data_type = seach_res.city[i].is_municipalities;
                    var search_province_id = seach_res.city[i].province_id;
                    var search_city_id = seach_res.city[i].city_id;
                    initObj.proCitylist(search_placeNames, search_data_type, search_province_id, search_city_id)
                    }
                   
                });
            //搜索取消
            $('.search_del,.sur_del').on('click',function(){
                $('.search_content_list,.provsearch_del,.citysearch_cont_list,.search_content,.sur_del,#sur_input').hide();
                $('.province_r_main,.province_search_icon,.city_r_top,.city_r_main,.search_icon,.addcitytext').show()
                $('.city_search_s,.provinces_search_s,#sur_input').val('')
            })
            //省份详情
            $('.province_r_main').on('click','.province_introduce,.list_l',function(){
                var province_id = $(this).parents('li').attr('data-province_id'); //省份id
                $.post('province_info',{province_id:province_id},function(res){
                    if(!res)return
                    //省份详情渲染
                    templateObj.provinceDetailsTemp(res)
                    $(".province_details_popup_box").find('.tab_content').eq(0).fadeIn();
                    //省份图片
                    $(".province_details").css({
                        background: "url(" + res.provinceData.img_url + ") no-repeat",
                        backgroundSize: 100 + "%"
                    });
                },'json')
            })
            //城市详情显示
            $('.city_con_rig').on('click','.city_introduce,.list_l',function(){
                var $list = $(this).parents('li');
                var post_data = {};
                post_data.city_id = $list.attr("data-cityid");
                post_data.province_id = $list.attr("data-provinceid");
                $.post('city_info',post_data,function(res){
                    if(!res)return
                    templateObj.cityDetails_template(res);
                    $(".city_details_popup_box").find('.tab_content').eq(0).fadeIn();
                    $(".city_details").css({
                        background: "url(" + res.cityData.img_url + ") no-repeat",
                        backgroundSize: 100 + "%"
                    })
                },'json')
            });
            //详情关闭
            $(".shut_down").click(function () {
                $(".details_popup_tab_active").css({
                    left: 0
                });
                $(".details_popup_box").fadeOut();
                $('.details_popup_box .tab_content').fadeOut()
            });
        },
        //对已添加的城市(左边列表)事件方法
        lefe_cityListFn: function () {
            //试玩玩天数加  减
            $('.city_box').find("li").off('click').on("click", ".reduce_icon,.add_icon", function () {
                // console.log(e.currentTarget.className)
                // console.log($(this).hasClass("add_icon"))
                var $list = $(this).parents('li'); 
                //  &lt;1 是 <1
                var get_html_num = $list.find(".daynum").html() == '&lt;1'?0:Number($list.find(".daynum").html())
                var index = $list.index()
                var day_mun = get_html_num;
                if ($(this).hasClass("add_icon")) {
                    if (addDayNum < 30){ //添加城市的总天数
                        addDayNum++
                        day_mun++
                    }else {
                        addDayNum = 30
                        return
                    }
                }else {
                    //旅行社是3
                    if(insiders == 3){
                        var city0_arr = []
                        $('.city_box').find("li").each(function(i,n){
                            var num0 = $(n).find('.daynum').html();
                            if(num0 == 0){
                                city0_arr.push(i)
                            }
                        })
                        var city0_len =  city0_arr.length
                        var if_num;
                        if(city0_len < 6){
                            if_num = index>0?0:1
                        }else{
                            if_num = 1
                        }
                    
                        if(day_mun >if_num){
                            addDayNum--
                            day_mun--                       
                        }else{
                            return
                        }
                    }else{
                        if(day_mun >1){
                            addDayNum--
                            day_mun--                       
                        }else{
                            return
                        }
                    }
                    
                }
                go_city_Arr[index].city_daynum = day_mun;
                var set_html_num = day_mun == 0?'&lt;1':day_mun;
                $list.find(".daynum").html(set_html_num);
                // console.log(go_city_Arr)
                //改变自定义窗口的值
                // initObj.styleInfoFn(go_city_Arr);
                //计算天数和进度条
                initObj.calculate_day_parFn(addDayNum)
            })
            //删除我想去的城市
            $('.city_box').find('li').on("click", ".delete_icon", function () {
                var $list = $(this).parents('li');
                var index = $list.index(); 
                
                //删除数组中的数据
                go_city_Arr.splice(index, 1);
                //删除折线
                FlightPath_arr.removeAt(index);
                //删除marker
                add_city_markerArr[index].setMap(null)
                add_city_markerArr.splice(index, 1);
                
                //删除自定义信息框
                $('#map').find('.popup-AddCtiycontent').each(function(){
                    $(this).remove()
                });
                //移除自定义窗口
                mapObj.del_infowindowFn("content");

                //只有一个城市的时候不能拖动
                if(go_city_Arr.length<2){
                    $("#city_list").sortable({cancel:'.list_city'})
                }
                // console.log(go_city_Arr)
                //改变自定义窗口的值
                // initObj.styleInfoFn(go_city_Arr);
                //多个添加城市,第一个城市不能删除
                initObj.is_show_DelIconFn();
                addDayNum = addDayNum - Number($list.find('.daynum').html())
                //计算天数和进度条
                initObj.calculate_day_parFn(addDayNum)
                $list.remove();
                //重新设置label的值
                for (var i = 0; i < go_city_Arr.length; i++) {
                    add_city_markerArr[i].setLabel({
                        text: (i + 1).toString(),
                        color: "#659ff5",
                        fontWeight: "800",
                    });
                    var addinfoDataObj = {
                        name:  go_city_Arr[i].city_name,
                        lat: go_city_Arr[i].lat,
                        lng: go_city_Arr[i].lng,
                        Class_name: "infoClass",
                        index: i,
                        is_del_add:'ok'
                    }
                    mapObj.style_InfowindowFn(addinfoDataObj, "addCity")
                };
                //清除地图上的添加城市的info
                $('#map').find('.AddCtiycontent').each(function(){
                    $(this).remove()
                });
                if (index > 0) {
                    var del_name = $list.find(".city_list_name").html()
                    //列表的top值变红
                    // $(".surrounding_city_r_main .list").each(function (g, c) {
                    //     if (del_name == $(c).find(".city_name").html()) {
                    //         $(".surrounding_city_r_main .list").eq(g).removeClass("city_list_go").find(".go_button").removeClass("go_button_gray").html("我想去").end()
                    //             .find(".top_box").removeClass("add_top_box"); 
                    //     }
                    // });
                    //判断删除的是否是数组最后一个
                    if (go_city_Arr.length == index) {
                        //重新加载返回城市虚线 和距离交通
                        initObj.backDotteLineFn();
                    } else {
                        // console.log(index)
                        //删除城市的前一个和后一个城市的距离
                        var city_dis = GetDistance(go_city_Arr[index - 1].lat, go_city_Arr[index - 1].lng, go_city_Arr[index].lat, go_city_Arr[index].lng);
                        var delObj = initObj.trcDisFn(city_dis, index, 'del');
                        //渲染
                        initObj.cityDisHtmlFn(delObj, ".city_box li:nth-child(" + Number(index + 1) + ")");
                    }
                } else {
                    //$(".content").find('.provinces_con_rig').show().end().find(".city_con_rig").hide().find('.js_surcity_li').html("");
                    window.location.reload();
                    // var setDayDate = {
                    //     dayNum:$('.num_day').html(),
                    //     date:$('#date_from').val()   
                    // }
                    // sessionStorage.setItem("setDayDate",JSON.stringify(setDayDate))
                    
                };
            });
            //拖拽
            initObj.dragFn();
            //点击交通方式弹出
            var trcIconArr = ["air_icon","tra_icon","car_icon",'other_icon']//列表交通方式icon灰 
            $('.addgo_cityBox').find('li,.return').on('click','.traffic_icon_r',function(){
                var $list = $(this).parents('div').hasClass('return')? $(this).parents('.return') :$(this).parents('li');
                var this_index = $list.index();
                var this_offset = $(this).offset();
                //交通方式弹框显示
                $('.traffic_more').unbind('click').on('click','.trc_l',function(){
                    $(this).addClass('selected');
                    var this_more_index = $(this).parents('.trc_div').index()
                    var this_more_name = $(this).parents('.trc_div').find('.trc_name').html();
                    var this_more_time = $(this).parents('.trc_div').find('.js_traTime').html();
                    $list.find('.list_trc_name').html(this_more_name).end()
                    .find('.trcTime').html(this_more_time).end()
                    .find("i").eq(0).removeAttr('class').addClass(trcIconArr[this_more_index]+' traffic_icon');
                    if(!$list.hasClass('return')){
                        go_city_Arr[this_index].city_trc_name = this_more_name
                        go_city_Arr[this_index].trc_time = this_more_time
                        go_city_Arr[this_index].trc_class = trcIconArr[this_more_index]
                    };
                    $('.traffic_more').fadeOut();
                })
                // 飞机：700公里/小时，耗时=公里数/700+0.5h,铁路：230公里/小时，耗时=公里数/230,汽车/其他：60公里/小时，耗时=公里数/50
                var trc_name = $list.find(".list_trc_name").html();
                var dis = Number($list.find('.js_list_dis').html());
                var air_time = (dis/700)+0.5; //.toFixed(1)
                var train_time = dis/230
                var car_time = dis/60
                var other_time = dis/50
                var trc_time = [air_time,train_time,car_time,other_time]
                $(".traffic_more .trc_l").removeClass("selected");
                $('.traffic_more').find('.trc_div').each(function(i,n){
                    var more_name = $(n).find('.trc_name').html();
                    if(trc_name == more_name){
                        $(n).find('.trc_l').addClass('selected')
                    }
                    $(n).find('.js_traTime').html(initObj.TrctimeFn(trc_time[i]));
                })
                if(dis>=800){
                    $('.traffic_more').find('div').eq(0).show()
                }else{
                    $('.traffic_more').find('div').eq(0).hide()
                }
                $('.traffic_more').fadeIn().offset({
                    left:this_offset.left+60,
                    top:this_offset.top-32
                })  
            });
            //点击其他地方弹框取消
            $('body').on('click',function(e){
                if($(e.target).hasClass('traffic_icon_r')||$(e.target).parents('.trc_r').hasClass("trc_r")){
                    $('.traffic_more').fadeIn()
                }else{
                    $('.traffic_more').fadeOut()
                }
            })
            //下一步
            initObj.f_main_nextFn();
        },
        //拖拽
        dragFn:function(){
           
            if(go_city_Arr.length<2) return  //disabled: true

            $("#city_list").find('li').off('mousedown').on('mousedown',function(){
                if($(this).find('.daynum').html() == '&lt;1'){
                    $('#city_list').find('li').eq(0).addClass('ui-state-disabled');
                }
                if($(this).index()==0){
                    if($('#city_list').find('li').eq(1).find('.daynum').html() == '&lt;1'){
                        $('#city_list').find('li:gt(0)').addClass('ui-state-disabled');
                    }
                }
            })
            $("#city_list").on('mouseup','li',function(){
                $('#city_list').find('li').removeClass('ui-state-disabled');
            })
           
            $("#city_list").sortable({cursorAt:{top:35,left:145},axis: "y",revert:true,cancel: ".city_list_r,.list_traffic,.delete_icon",items: "li:not(.ui-state-disabled)"},{
                
                //拖拽开始触发的事件
                start: function( event, ui ) {
                    startFn(event, ui)
                },
                //拖拽结束触发事件
                stop: function( event, ui ) {
                    stopFn(event, ui)
                },
              
            });
            $("#city_list").disableSelection();

            //拖拽的时候触发的事件
            function startFn(event, ui){
                ui.item.css({"height":"74",}).find(".list_traffic").css({"height":"0"});
            };

            function stopFn(event, ui){
                $('#city_list').find('li').removeClass('ui-state-disabled')
                ui.item.removeAttr("style").find(".list_traffic").removeAttr("style")
                //多个添加城市,第一个城市不能删除
                initObj.is_show_DelIconFn();
                mapObj.del_cityMarker(add_city_markerArr,"add");

                //拖拽后的数据
                var drag_arr = [];
                $('.city_box').find("li").each(function(i,n){
                    var drag_obj = {};
                    drag_obj.lat = Number($(n).attr("data-lat"));
                    drag_obj.lng = Number($(n).attr("data-lng"));
                    drag_obj.position={lat:drag_obj.lat,lng:drag_obj.lng}
                    drag_obj.city_id = $(n).find(".set_data").attr("data-city_id");
                    drag_obj.province_id = $(n).find(".set_data").attr("data-province_id");
                    drag_obj.city_daynum = $(n).find(".daynum").html() == "&lt;1"?0:$(n).find(".daynum").html(); //可以加减的天数
                    drag_obj.fit_day = $(n).find(".fit_day").html(); //适玩天数
                    drag_obj.city_name = $(n).find('.city_list_name').html();
                    drag_obj.city_Introduction = $(n).find(".set_data").attr("data-city_Introduction");
                    drag_obj.provinceNames = $(n).find('.set_data').attr('data-provinceNames');
                    drag_arr.push(drag_obj)
                    // 删除城市连线
                    for (let a = 0; a < FlightPath_arr.length; a++) {
                        FlightPath_arr.removeAt(a);
                    }
                });
                go_city_Arr = drag_arr;
                // console.log(go_city_Arr)
                //拖拽后城市的距离
                for(var i = 0;i<go_city_Arr.length;i++){
                    //添加标记点
                    mapObj.addCitymarker({lat:go_city_Arr[i].lat,lng:go_city_Arr[i].lng},Number(i+1));
                    if(i+1 < go_city_Arr.length){
                        var city_dis = GetDistance(go_city_Arr[i].lat,go_city_Arr[i].lng, go_city_Arr[Number(i+1)].lat, go_city_Arr[Number(i+1)].lng);
                        var disObj = initObj.trcDisFn(city_dis, Number(i+1), 'del');
                        //渲染
                        initObj.cityDisHtmlFn(disObj, ".city_box li:nth-child(" + Number(i + 2) + ")");
                    }; 
                    
                    FlightPath_arr = FlightPath.getPath();
                    FlightPath_arr.push(new google.maps.LatLng(go_city_Arr[i].lat,go_city_Arr[i].lng));
                };
                //出发城市到第一个城市的距离
                var go_dis = GetDistance(go_pos.lat,go_pos.lng, go_city_Arr[0].lat, go_city_Arr[0].lng);
                var go_disObj = initObj.trcDisFn(go_dis, 0, 'del');
                //渲染
                initObj.cityDisHtmlFn(go_disObj, ".city_box li:nth-child(1)");
                //重新加载出发城市，返回城市虚线 和返回城市距离交通
                initObj.backDotteLineFn();
               
                
            } 
            
          
        },
        //改变自定义窗口的值
        styleInfoFn:function (Arr) {
            // console.log(Arr)
            var num = 0,d1, d2;
            for (var i = 0; i < Arr.length; i++) {
                var city_num = Arr[i].city_daynum ;
                d1 = num + 1;
                d2 = d1 + (city_num - 1);
                var Dnum = d1 == d2 ? "D" + d1 : "D" + d1 + '-D' + d2
                num = d2
                $('#map').find('.popup-AddCtiycontent').each(function(a,n){
                    var name =  $(n).find(".infoCname").html();
                    // console.log(name)
                    // console.log(drag_obj.city_name ,'Arr')
                    if(name === Arr[i].city_name){
                        $(n).find('.infoDnum').html(Dnum)
                    }
                });
            };
        },
        //重新加载出发城市，返回城市虚线 和返回城市距离交通
        backDotteLineFn:function () { 
            //返回城市经纬度
            if(Dottedline_array[0]){
                Dottedline_array[0].setMap(null);
                Dottedline_array[1].setMap(null);
            }
           
            Dottedline_array = [];
            //重新加载返回城市虚线
            var firstPost = {
                lat:go_city_Arr[0].lat,
                lng:go_city_Arr[0].lng,
            }
            var lastPos = {
                lat:go_city_Arr[go_city_Arr.length-1].lat,
                lng:go_city_Arr[go_city_Arr.length-1].lng
            }
            mapObj.gobackpolyline([go_pos,firstPost]);
            mapObj.gobackpolyline([back_pos,lastPos]);
           
            //计算最后一个城市到返回城市之间的距离
            var back_dis = GetDistance(back_pos.lat, back_pos.lng, lastPos.lat, lastPos.lng);
            // console.log(back_dis)
            var back_disObj = initObj.trcDisFn(back_dis, 'first');
            initObj.cityDisHtmlFn(back_disObj, '.return');
            
        },
        //多个添加城市,第一个城市不能删除
        is_show_DelIconFn: function () {
            var list_length = go_city_Arr.length;
            $('.city_box li').find(".city_list_l i").addClass('delete_icon')
            if (list_length > 1) {
                $('.city_box li:lt(1)').find(".city_list_l i").removeClass('delete_icon').end()
                
            }else{
                $('.city_box li:lt(1)').find('.city_list_l').css('cursor',"default")
            }
        },
        //计算天数和进度条
        calculate_day_parFn: function (add_DayNum) {
            var travel_days = Number($(".num_day").html()); //行程天数
            var percentage = add_DayNum / travel_days * 100;
            // 进度条
            cityProgressbar(percentage);
            var lineDay = travel_days - add_DayNum; //剩余天数
            if (lineDay == 0) {
                $(".beyond_day_num").hide().html('');
                post_cityData.city_day_num = add_DayNum
            } else {
                var is_str;
                if (lineDay > 0) {
                    is_str = "剩余" + lineDay + "天"
                    //请求周边城市接口
                    post_cityData.city_day_num = add_DayNum
                    post_cityData.day_num = $(".num_day").html()
                    initObj.post_surFn()
                } else {
                    is_str = "超出" + (-lineDay) + "天";
                    post_cityData.city_day_num = add_DayNum
                }
                $(".beyond_day_num").show().html(is_str)
            }
        },
        //计算交通方式和时间
        trcDisFn: function (dis, index, is_del) {
            // >=800km默认飞机，>800km默认铁路。三种交通方式预选框都会展示
            var trc_name = dis >= 800 ? "飞机交通" : "铁路交通";
            var trc_time = dis >= 800 ? (dis / 700) + 0.5 : dis / 230;
            var trc_class = dis >= 800 ? "air_icon" : "tra_icon";
            if (typeof index == "number") {
                go_city_Arr[index].dis = dis;
                go_city_Arr[index].city_trc_name = trc_name;
                go_city_Arr[index].trc_time = initObj.TrctimeFn(trc_time);//计算小时分钟
                go_city_Arr[index].trc_class = trc_class;
            };
          
            if (index == 'first' || is_del == "del") {
                var firstTrc = {}
                firstTrc.trc_class = trc_class
                firstTrc.dis = dis;
                firstTrc.city_trc_name = trc_name;
                firstTrc.trc_time = initObj.TrctimeFn(trc_time);//计算小时分钟
                return firstTrc
            };
            
        },
        //计算小时分钟
        TrctimeFn:function(trc_time){
            var time = Number(trc_time.toFixed(1));
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
        //渲染两个城市之间的交通
        cityDisHtmlFn: function (trcObj, isClasss) {
            $('.addgo_cityBox').find(isClasss).find('.traffic_icon').removeAttr("class").addClass(trcObj.trc_class+" traffic_icon").end()
                .find('.list_trc_name').html(trcObj.city_trc_name).end()
                .find('.js_list_dis').html(trcObj.dis).end()
                .find('.trcTime').html(trcObj.trc_time).end();
        },
        //hover 省份,城市,详情 简介弹出动画
        in_introduce:function () {
            $(".city_foot .pos_rel,.city_goods .pos_rel,.hot_spots .pos_rel,.special_goods .pos_rel").hover(function () {
                // $(n).find(".in_introduce").removeClass("out_introduce");
                $(this).find(".in_introduce").stop(true).animate({
                    top: 0,
                    height: 120 + "px"
                }, 800, "swing");
            }, function () {
                $(this).find(".in_introduce").stop(true).animate({
                    top: 160,
                    height: 0 + "px"
                }, 800, "swing");
            })
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
                        $(".mainBox").fadeOut().addClass("dis_none");
                        //一键制作
                        initObj.a_key_planFn()
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
                                //注册成功
                                //一键制作
                                initObj.a_key_planFn()
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
        //下一步
        f_main_nextFn: function () {
            $('.f_main_next').unbind('click').on('click', function () {
                var AddallDay = post_cityData.city_day_num//一共游玩的天数
                var trip_Daynum = $('.num_day').html();
                $(".prompt_text").html("您的游玩天数与行程天数不匹配，请修改行程天数");
                if(AddallDay<trip_Daynum){ //剩余
                    //当一个城市的时候
                    if(go_city_Arr.length == 1){
                        //提示框 天数不匹配
                        $(".cancel_prompt_text").html("您确定只想在" + go_city_Arr[0].city_name + "一地游玩" + trip_Daynum + "天吗？");
                        $(".prompt_c").fadeIn();
                    }else{
                        $(".prompt_b").fadeIn();
                    }
                }else if(AddallDay>trip_Daynum) {//超出
                    $(".prompt_b").fadeIn();
                }else{//时间吻合
                    //下一步接口
                    initObj.posNextFn()
                }; 

                //提示框取消
                $(".prompt_cancel,.prompt_but").on("click", function () {
                    $(".prompt").fadeOut();
                });
                //只玩一个城市确定
                $('.prompt_det').on("click", function () {
                    $('.prompt_c').fadeOut();
                    go_city_Arr[0].city_daynum = trip_Daynum
                    //下一步接口
                    initObj.posNextFn()
                });
            })
            
        },
        //下一步
        posNextFn:function(){
            //旅行社不能一键制作,只能手动安排
            if(insiders != 3){
                $('.a_key_bg').fadeIn();
                
                $('.a_key_bg').off('click').on('click','.a_div',function(){
                    if($(this).hasClass('divs')){
                        //手动安排
                        initObj.Manual_arrangement()
                    }else{
                        //判断有没有登陆
                        if(get_uid == null){
                            initObj.loginFn()
                        }else{
                            //一键制作
                            initObj.a_key_planFn()
                        }
                       
                    }
                })
                //取消
                $('.a_key_bg').on('click','.but',function(){
                    $('.a_key_bg').fadeOut();
                })
            }else{
                //手动安排
                initObj.Manual_arrangement()
            }
            
        },
        //一键制作
        a_key_planFn:function(){
            var goCity_postData = {go_city_array:go_city_Arr};
            $.post('IsQuick',goCity_postData,function(res){
                if(res.status){
                    $('.a_key_bg').fadeOut();
                    //可以一键制作
                    var postData = initObj.nextPost_data();
                    postData.uid = getCookie('uid');
                    // console.log(postData)
                    $.post('QuickBuilt',postData,function(res){
                        if(res.status){
                            //一键制作存储
                            sessionStorage.setItem('isEdit','EditQuick');
                            window.location.href='/portal/scenerymap/attractionsArrange.html'
                        }
                    },'json')
                }else{
                    layer.msg(res.msg, {
                        time: 1300,
                        offset: '300px'
                    });
                    //取消
                    $('.a_key_bg').on('click','.but',function(){
                        $('.a_key_bg').fadeOut();
                    })
                }
            },'json')
        },
        //手动安排
        Manual_arrangement:function(){
            var postData = initObj.nextPost_data()
            // console.log(postData)
            $.post('CitySession',postData,function(res){
                if(!res)return
                if(res.status == 'ok'){
                    window.location.href = "/portal/scenerymap/cityAttractions.html";
                    sessionStorage.setItem("this_city_index",0)
                }
            },'json')
        },
        // 向后台传入的数据
        nextPost_data:function(){
            var date = $('#date_from').val();
            var day_num = $('.num_day').html();
            var departure_city = {
                lat:go_pos.lat,
                lng:go_pos.lng,
                city_name:$('.departure_city').html(),
            }
            var returnTrcClass = ($('.return').find("i").eq(0).attr('class').replace(/\s+/g,"") ).split("traffic_icon");
            var return_city = {
                lat:back_pos.lat,
                lng:back_pos.lng,
                city_name:$('.return_city').html(),
                trc_class:returnTrcClass[0],
                dis:$('.return .js_list_dis').html(),
                city_trc_name:$('.return').find('.list_trc_name').html(),
                trc_time:$('.return').find('.trcTime').html()
            }
            var postData = {}
            postData.date = date//行程日期
            postData.day_num = day_num//行程日期
            postData.adult = $('.adult_num').html();
            postData.children = $('.children_num').html();
            postData.departure_city = departure_city //出发城市
            postData.return_city = return_city //返回城市
            postData.cover = cover_img_url//第一个城市的封面
            postData.go_city_array = go_city_Arr //添加我想去的城市
            return postData
        }
    };
    //谷歌地图方法
    var mapObj = {
        //加载谷歌地图
        initMap: function () {
            map = new google.maps.Map(document.getElementById('map'), {
                zoom: 4,
                gestureHandling: 'greedy',
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                scaleControl: true,
                streetViewControl: false,
                center: {
                    lat: 32.694866,
                    lng: 105.996094
                }
            });
            

            //定义连线
            FlightPath = new google.maps.Polyline({
                strokeColor: '#FF0000',
                strokeOpacity: 1.0,
                strokeWeight: 4,
            });
            FlightPath.setMap(map);
            //移除自定义窗口
            mapObj.del_infowindowFn("content");

        },
        //全国边界线
        pre_showBoundaryFn: function () {
            // console.log(cityData)
            // 普通省
            for (var i = 0, n = cityData.provinces.length; i < n; i++) {
                var provinces_location = g_location(cityData.provinces[i]);
                mapObj.showBoundaryEx(cityData.provinces[i].b, getColor(cityData.provinces[i].n)[1], cityData.provinces[i].n, provinces_location);
            };
            //直辖市 
            for (var i = 0, n = cityData.municipalities.length; i < n; i++) {
                var municipalities_location = g_location(cityData.municipalities[i]);
                mapObj.showBoundaryEx(cityData.municipalities[i].b, getColor(cityData.municipalities[i].n)[1], cityData.municipalities[i].n, municipalities_location);
            };
            //港澳台
            for (var i = 0, n = cityData.other.length; i < n; i++) {
                var other_location = g_location(cityData.other[i]);
                mapObj.showBoundaryEx(cityData.other[i].b, getColor(cityData.other[i].n)[1], cityData.other[i].n, other_location);
            };
        },
        //省份高亮
        showBoundaryEx: function (latLngs, color, provinces_name, placeName_location) {
            //移除自定义窗口
            mapObj.del_infowindowFn("content");
            //获取边界线的经纬度
            var paths = mapPaths(latLngs)
            var polygon = new google.maps.Polygon();
            polygon.setOptions(polyOptions);
            polygon.setOptions({
                fillColor: color,
                provincesName: provinces_name,
                provincesLocation: placeName_location
            });
            polygon.setPaths(paths);
            polygon.setMap(map);
            polygon_arr.push(polygon);
            //移除自定义窗口
            mapObj.del_infowindowFn("content");
            // console.log(polygon)
            //去鼠标放在地图省份高亮
            google.maps.event.addListener(polygon, "mouseover",
                function () {
                    polygon.setOptions({
                        //鼠标放上去的颜色
                        fillColor: "#FFFF00",
                    });
                    var provincesName = polygon.provincesName;
                    var name_location = polygon.provincesLocation;
                    var MapinfoDataObj = {
                        name: provincesName,
                        lat: name_location.lat,
                        lng: name_location.lng,
                    }
                    //添加自定义窗口
                    mapObj.style_InfowindowFn(MapinfoDataObj, "isProvince");

                    //鼠标放在地图上对应列表亮
                    hover_mapList($(".province_r_main li"), ".provinces", provincesName)
                });
            //鼠标离开
            google.maps.event.addListener(polygon, "mouseout",
                function () {
                    polygon.setOptions({
                        fillColor: color,
                    });
                    //列表hover效果消失
                    leave_mapList($(".province_r_main li"));
                    //移除自定义窗口
                    mapObj.del_infowindowFn("content");
                });
            //点击地图   
            google.maps.event.addListener(polygon, "click", function () {
                var provincesName = polygon.provincesName;
                //获取城市列表
                initObj.clickProvinceMapFn(provincesName)
            });


        },
        //省份边界线亮
        provincePolygonMapFn: function (data_type, list_placeNames) {
            //移除自定义窗口
            mapObj.del_infowindowFn("content");
            //清除地图上的省份高亮
            mapObj.del_polygon(polygon_arr, 'provinces');
            
            var sfen_zxsData
            if(data_type == 0){
                sfen_zxsData = cityData.provinces
            }else if(data_type == 1){
                sfen_zxsData = cityData.municipalities
            }else{
                sfen_zxsData = cityData.other
            }
            // var sfen_zxsData = data_type == 0 ? cityData.provinces : cityData.municipalities
            var cityDataIndex = getArrIndex(sfen_zxsData, {
                n: list_placeNames
            });
            var cityDataArr = sfen_zxsData[cityDataIndex]
            var centerLatLng = g_location(cityDataArr);
            var get_Mzoom = sfen_zxsData[cityDataIndex].z;
            map.setZoom(get_Mzoom);
            map.setCenter(centerLatLng);
            var pathLatLng = sfen_zxsData[cityDataIndex].b;
            //省份边界线亮
            pro_polygonPath = new google.maps.Polygon();
            pro_polygonPath.setOptions(var_polyPath);
            var paths = mapPaths(pathLatLng)
            pro_polygonPath.setPaths(paths);
            pro_polygonPath.setMap(map);

        },
        // 城市边界线
        city_OptionsFn: function (data_type, province_name, res) {
            var city_list = res.cityList;
            // console.log(city_list)
            var sfen_zxsData
            if(data_type == 0){
                sfen_zxsData = cityData.provinces
            }else if(data_type == 1){
                sfen_zxsData = cityData.municipalities
            }else{
                sfen_zxsData = cityData.other
            }
            var this_proIndex = getArrIndex(sfen_zxsData, {
                n: province_name
            });
            var city_dataArr = data_type == 0 ? sfen_zxsData[this_proIndex].cities : sfen_zxsData;
            for (var i = 0; i < city_list.length; i++) {
                var city_name = city_list[i].city_name;
                var cityMapIndex = getArrIndex(city_dataArr, {
                    n: city_name
                });
                var city_LatLng = {
                    lat: Number(city_list[i].latitude),
                    lng: Number(city_list[i].longitude)
                };
                var city_paths = city_dataArr[cityMapIndex].b
                // console.log(city_paths)
                var fnDataObj = {
                    city_paths: city_paths,
                    city_name: city_name,
                    city_LatLng: city_LatLng,
                    city_day_num: city_list[i].fit_day
                }
                //城市高亮
                mapObj.cityOptionsPathFn(fnDataObj);
            }
        },
        //城市高亮
        cityOptionsPathFn: function (data) {
            // console.log(data)
            var city_polygon = new google.maps.Polygon();
            city_polygon.setOptions(polyOptions);
            city_polygon.setOptions({
                fillOpacity: 0,
                city_name: data.city_name,
                cityLocation: data.city_LatLng
            });
            var paths = mapPaths(data.city_paths)
            city_polygon.setPaths(paths);
            city_polygon.setMap(map);
            city_polygonArr.push(city_polygon);
            // console.log(city_polygonArr)
            //鼠标放上去
            google.maps.event.addListener(city_polygon, "mouseover",
                function () {
                    city_polygon.setOptions({
                        //鼠标放上去的颜色
                        fillColor: "#FFFF00",
                        fillOpacity: 0.5,
                    });
                    var city_name = city_polygon.city_name;
                    //鼠标放在地图上对应城市列表
                    hover_mapList($(".city_r_main .list"), ".city_name", city_name);
                    var city_location = city_polygon.cityLocation;
                    // console.log(city_location)
                    var MapinfoDataObj = {
                        name: city_name,
                        lat: city_location.lat,
                        lng: city_location.lng,
                        city_day_num: data.city_day_num
                    }
                    // //添加自定义窗口
                    mapObj.style_InfowindowFn(MapinfoDataObj, "isCity");
                    mapObj.hover_cityMarker(city_location, city_name,data);
                });
            //鼠标离开
            google.maps.event.addListener(city_polygon, "mouseout",
                function () {
                    city_polygon.setOptions({
                        fillColor: "",
                        fillOpacity: 0,
                    });
                    //列表hover效果消失
                    leave_mapList($(".city_r_main .list"));
                    //移除自定义窗口
                    mapObj.del_infowindowFn("content");
                    //清除城市marker
                    mapObj.del_cityMarker(hover_city_markerArr,'hover');
                });
            //点击
            google.maps.event.addListener(city_polygon, "click", function () {
                //点击城市自定义窗口和城市列表对比
                initObj.clickCityMapFn(city_polygon.city_name);
            });
        },
        //清除高亮
        del_polygon: function (polygonArr, isPre_cityArr) {
            for (var i = 0; i < polygonArr.length; i++) {
                polygonArr[i].setMap(null)
            };
            if (isPre_cityArr == 'city') {
                city_polygonArr = [];
            } else {
                polygon_arr = [];
            }
        },
        //添加自定义信息窗口
        style_InfowindowFn: function (data, isPro_city) {
            var isBg, isArrow, str, yPx;
            if (isPro_city == "isProvince") { //省份
                isBg = 'bgBlack';
                isArrow = 'arrowBlack';
                yPx = 0;
                infoID = 'content';
                str = "<div id=" + infoID + " onclick='provice_infoClick();'  data-name='" + data.name + "'>" + data.name + "</div>"
            } else { //城市
                isBg = 'bgWhite';
                isArrow = 'arrowWhite';
                yPx = 45;
                infoID = 'content'
                if (isPro_city == 'isCity') { //hover城市
                    var is_addMapIcon = data.addMapIcon == "hide" ? "" : "addMapIcon"
                    str = '<div id=' + infoID + '>\
                            <div><span class="infoCityName">' + data.name + '</span><i class="dis_none"' + is_addMapIcon + ' onclick="addCityFn();"></i></div>\
                            <div class="infoCity_play">适玩' + data.city_day_num + '天</div>\
                        </div>';
                } else if (isPro_city == 'addCity') { //添加城市
                    infoID = 'AddCtiycontent'; //和css联动
                    // <span class="infoDnum">' + data.Dnum_end + '</span>
                    str = '<div class=' + infoID + '>\
                        <div class="addInfoDiv"><span class="infoCname">' + data.name + '</span></div>\
                    </div>'
                    if(is_back_city == 'ok' || data.is_del_add=='ok'){
                        $("#map").append(str);
                    }
                } else {
                    infoID = 'goBackCityInfo';
                    //返回城市info
                    str = "<div class=" + infoID + ">" + data.name + "</div>"
                    $("#map").append(str);
                }
            };
            //移除自定义窗口
            mapObj.del_infowindowFn("content");
            //自定义窗口样式init
            Popup = createPopupClass(infoID, isBg, isArrow, yPx);
            //自定义信息窗口 
            $("#map").append(str);
            var is_id_Classs = data.Class_name == "infoClass" ? document.getElementsByClassName(infoID)[data.index] : document.getElementById(infoID)
            // console.log(is_id_Classs)
            popup = new Popup(new google.maps.LatLng(data.lat, data.lng), is_id_Classs);
            popup.setMap(map);
        },
        //移除自定义窗口
        del_infowindowFn: function (infoID) {
            $('#map').find("#" + infoID).each(function () {
                $(this).parents('.popup-' + infoID).remove();
                $(this).remove();
            });
            // console.log('.popup-'+infoID)
            $('#map').find('.popup-' + infoID).remove()
        },
        //添加城市标记点
        addCitymarker: function (location, city_num) {
            addCityMarker = new google.maps.Marker({
                position: location,
                icon: {
                    url: "/static/v1/img/map/iconnum1.png",
                    labelOrigin: new google.maps.Point(15, 17),
                },
                label: {
                    text: city_num.toString(),
                    color: "#659ff5",
                    fontWeight: "800",
                },
                map: map,
                zIndex:city_num

            });
            add_city_markerArr.push(addCityMarker);

        },
        //hover添加城市标记点
        hover_cityMarker: function (location, city_name,data) {
            // console.log(location)
            hoverCityMarker = new google.maps.Marker({
                position: location,
                icon: "/static/v1/img/map/cityicon2.png",
                map: map
            });
            hover_city_markerArr.push(hoverCityMarker);
            google.maps.event.addListener(hoverCityMarker, "click", function () {
                //点击城市自定义窗口和城市列表对比
                initObj.clickCityMapFn(city_name);
            });
            
        },
        //移除城市标记
        del_cityMarker: function (markerArr,is_add_hover) {
            for (var i = 0; i < markerArr.length; i++) {
                markerArr[i].setMap(null);
            }
            if(is_add_hover == 'hover'){
                hover_city_markerArr = []
            }else{
                add_city_markerArr = []
            } 
        },
        //高德地图获取ip
        lbsMapIPfn: function () {
            //实例化城市查询类
            if (!AMap) {
                $(".from_name,.to_name").html("北京").attr('data-lat','39.90403').attr('data-lng','116.407526');
            } else {
                var citysearch = new AMap.CitySearch();
                //自动获取用户IP，返回当前城市
                citysearch.getLocalCity(function (status, result) {
                    if (status === 'complete' && result.info === 'OK') {
                        if (result && result.city && result.bounds) {
                            // console.log(result)
                            var cityinfo = result.city;
                            //地图显示当前城市
                            var city_arry = cityinfo.split("市");
                            var cityname
                            if(city_arry[0]){
                                cityname = city_arry[0];
                            }else{
                                cityname = cityinfo;
                            }
                            var geocoder = new google.maps.Geocoder();
                            geocoder.geocode({
                                'address': cityinfo
                            }, function (results, status) {
                                if (status === 'OK') {
                                    var position = results[0].geometry.location;
                                    $(".from_name,.to_name").html(cityname).attr('data-lat',position.lat()).attr('data-lng',position.lng());
                                } else {
                                    alert('Geocode was not successful for the following reason: ' + status);
                                }
            
                            });
                        }
                    } else {
                        // console.log(result.info)
                        $(".from_name,.to_name").html("北京").attr('data-lat','39.90403').attr('data-lng','116.407526');
                    }
                });
            }
            
        },
        //出发城市返回城市
        go_backCityFn: function (is_change) {
            go_back_data_arr = []
            var form_lat = Number($('.departure').find('.from_name').attr('data-lat'))
            var form_lng = Number($('.departure').find('.from_name').attr('data-lng'))
            var to_lat = Number($('.return').find('.to_name').attr('data-lat'))
            var to_lng = Number($('.return').find('.to_name').attr('data-lng'))
            var form_name = $('.departure').find('.from_name').html();
            var to_name = $('.return').find('.to_name').html();
            var form_Obj = {
                lat:form_lat,
                lng:form_lng,
                name:'出发城市',
                icon_url:"/static/v1/img/map/departureicon.png",
                index: 0,
                Class_name : "infoClass"
            }
            var info_to_name = form_name == to_name?'出发城市':'返回城市';
            var to_icon_url =  form_name == to_name?"/static/v1/img/map/departureicon.png":'/static/v1/img/map/returnicon.png'
            var to_Obj = {
                lat:to_lat,
                lng:to_lng,
                name:info_to_name,
                icon_url : to_icon_url,
                index: 1,
                Class_name : "infoClass"
            };
            go_back_data_arr.push(form_Obj,to_Obj);
            // console.log(go_back_data_arr)
            go_pos = {lat:form_lat,lng:form_lng};
            back_pos = {lat:to_lat,lng:to_lng};
            var first_cityPost = {};
            first_cityPost.lat = go_city_Arr[0].lat
            first_cityPost.lng = go_city_Arr[0].lng;
            var lats_cityPost = {};
            lats_cityPost.lat = go_city_Arr[go_city_Arr.length-1].lat
            lats_cityPost.lng = go_city_Arr[go_city_Arr.length-1].lng;
            if(form_name == to_name){//出发城市返回城市相同
                var data =  go_back_data_arr[0]
                // mapObj.style_InfowindowFn(data, 'go_backCity');
                mapObj.go_backCityMarkerFn(data);
                mapObj.gobackpolyline([go_pos, first_cityPost]);
                mapObj.gobackpolyline([back_pos, lats_cityPost]);
                var dis = GetDistance(form_lat, form_lng, first_cityPost.lat, first_cityPost.lng);
                var trcObj = initObj.trcDisFn(dis,0, "del");
                initObj.cityDisHtmlFn(trcObj, '.city_box li:nth-child(1),.return')
            }else{
                for (var i = 0; i < go_back_data_arr.length; i++) {;
                    var data = go_back_data_arr[i]
                    mapObj.go_backCityMarkerFn(data);
                    // mapObj.style_InfowindowFn(data, 'go_backCity');
                    var dis = GetDistance(data.lat,data.lng, first_cityPost.lat, first_cityPost.lng);
                    if(i == 0){
                        var trcObj = initObj.trcDisFn(dis,0, "del");
                        initObj.cityDisHtmlFn(trcObj, '.city_box li:nth-child(1)');
                        mapObj.gobackpolyline([{lat:data.lat,lng:data.lng}, first_cityPost]);
                    }else{
                        var trcObj = initObj.trcDisFn(dis, "first");
                        initObj.cityDisHtmlFn(trcObj, '.return');
                        mapObj.gobackpolyline([{lat:data.lat,lng:data.lng}, lats_cityPost]);
                    }
                };
            };

        },
        //出发城市返回城市marker
        go_backCityMarkerFn: function (data) {
            goBackCityMarker = new google.maps.Marker({
                position: {lat:data.lat,lng:data.lng},
                icon: data.icon_url,
                map: map
            });
            go_backCityMarkerArr.push(goBackCityMarker)
        },
        //出发城市 返回城市虚线
        gobackpolyline: function (latlngArr) {
            // console.log(latlngArr)
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
            // console.log(Dottedline)
            Dottedline_array.push(Dottedline)
        },
    }

    //数据渲染
    var templateObj = {
        //省份列表渲染
        provinceTemplate: function (province_data) {
            var Provinces_template = '<ul>\
                                    {{each pro as value i}}\
                                    <li class="list" data-type="{{value.is_municipalities}}" data-province_id={{value.province_id}}>\
                                        <div class="list_l">\
                                            <img src="{{value.img_url}}" alt="">\
                                        </div>\
                                        <div class="list_r">\
                                            <div class="text">\
                                                <p class="provinces">{{value.province_name}}</p>\
                                                <p class="py">{{value.province_English}}</p>\
                                                <p class="introduce province_introduce">点击查看介绍</p>\
                                            </div>\
                                            <div class="list_icon_box"></div>\
                                        </div>\
                                    </li>\
                                    {{/each}}\
                                </ul>'
                                // <i class="list_icon"></i>
            var Provinces_render = template.compile(Provinces_template);
            var Provinces_html = Provinces_render(province_data)
            $(".province_r_main").html(Provinces_html);
        },
        //城市列表渲染
        cityTemplate: function (city_data, clist_placeNames) {
            // console.log(city_data)
            var city_template = '<ul>\
                            {{each cityList as value i}}\
                            <li class="list" data-lat="{{value.latitude}}" data-lng="{{value.longitude}}" data-cityid = "{{value.city_id}}" data-provinceid= "{{value.province_id}}">\
                                <div class="list_l">\
                                    <img src="{{value.img_url}}" alt="">\
                                </div>\
                                <div class="list_r city_list_r">\
                                    <div class="text">\
                                        <p><span class="city_name">{{value.city_name}}</span> <span class="city_py">{{value.city_abbreviation}}</span></p>\
                                        <p class="day_distance">适玩<span class="r_daynum">{{value.fit_day}}</span>天</p>\
                                        <p class="introduce city_introduce" >点击查看介绍</p>\
                                    </div>\
                                    <div class="go_button">我想去</div>\
                                </div>\
                                <div class="top_box"><span class="js_prename">' + clist_placeNames + '</span>&nbsp;|&nbsp;<span class="top_num">{{value.city_score}}</span></div>\
                                <i class="dis_none jsi_data" data-city_Introduction={{value.city_Introduction}}></i>\
                            </li>\
                            {{/each}}\
                        </ul>';
            var city_render = template.compile(city_template);
            var city_html = city_render(city_data);
            $(".city_r_main").html(city_html)
        },
        //添加城市渲染
        addcity_template: function (obj_addciy) {
            // var tem_obj = {}
            // tem_obj.addcitylist = go_city_Arr;
            // // console.log(obj_addciy)
            // var l_addcitytemplate = '{{each addcitylist as value i}}\
            //                     <li class="clearfix" data-lat="{{value.lat}}" data-lng="{{value.lng}}" data-index={{i}}>\
            //                         <div class="list_traffic">\
            //                             <i class="traffic_icon {{value.trc_class}}"></i>\
            //                             <p class="trc_p"><span class="list_trc_name">{{value.city_trc_name}}</span>·<span class="js_list_dis">{{value.dis}}</span>公里·<span class="trcTime">{{value.trc_time}}</span></p>\
            //                             <i class="traffic_icon_r"></i>\
            //                         </div>\
            //                         <div class="list_city">\
            //                             <div class="city_list_l">\
            //                                 <i class="delete_icon"></i>\
            //                                 <p><span class="city_list_name">{{value.city_name}}</span></p>\
            //                                 <p class="day_num">适玩<span class="fit_day">{{value.fit_day}}</span>天</p>\
            //                             </div>\
            //                             <div class="city_list_r">\
            //                                 <span class="reduce_icon all_icon"></span><span class="daynum">{{value.city_daynum}}</span><span class="add_icon all_icon"></span>\
            //                             </div>\
            //                             <i class="set_data dis_none" data-provinceNames="{{value.provinceNames}}" data-province_id="{{value.province_id}}" data-city_id="{{value.city_id}}"\
            //                             data-city_Introduction ="{{value.city_Introduction}}"></i>\
            //                         </div>\
            //                     </li>\
            //                     {{/each}}';
            // var l_addcity_render = template.compile(l_addcitytemplate);
            // var l_addcity_html = l_addcity_render(tem_obj)
            // $(".city_box .cityBoxUl").html(l_addcity_html);

            var str = '<li class="clearfix" data-lat="'+obj_addciy.lat+'" data-lng="'+obj_addciy.lng+'">\
                            <div class="list_traffic">\
                                <i class="traffic_icon '+obj_addciy.trc_class+'"></i>\
                                <p class="trc_p"><span class="list_trc_name">'+obj_addciy.city_trc_name+'</span>·<span class="js_list_dis">'+obj_addciy.dis+'</span>公里·<span class="trcTime">'+obj_addciy.trc_time+'</span></p>\
                                <i class="traffic_icon_r"></i>\
                            </div>\
                            <div class="list_city">\
                                <div class="city_list_l">\
                                    <i class="delete_icon"></i>\
                                    <p><span class="city_list_name">'+obj_addciy.city_name+'</span></p>\
                                    <p class="day_num">适玩<span class="fit_day">'+obj_addciy.fit_day+'</span>天</p>\
                                </div>\
                                <div class="city_list_r">\
                                    <span class="reduce_icon all_icon"></span><span class="daynum">'+obj_addciy.city_daynum+'</span><span class="add_icon all_icon"></span>\
                                </div>\
                                <i class="set_data dis_none" data-provinceNames="'+obj_addciy.provinceNames+'" data-province_id="'+obj_addciy.province_id+'" data-city_id="'+obj_addciy.city_id+'"\
                                data-city_Introduction ="'+obj_addciy.city_Introduction+'"></i>\
                            </div>\
                        </li>';
            return str
        },
        //周边城市渲染
        surroundingCitytemplate: function (data,is_sur) {
            var sur_city = $('.sur_this_city').html();
            var surtemplate = '{{each current as value i}}\
                                <li class="list" data-lat="{{value.latitude}}" data-lng="{{value.longitude}}" data-cityId={{value.city_id}} data-provinceId={{value.province_id}}>\
                                    <div class="list_l">\
                                        <img src="{{value.img_url}}" alt="">\
                                    </div>\
                                    <div class="list_r city_list_r">\
                                        <div class="text">\
                                            <p>\
                                                <span class="city_name">{{value.city_name}}</span>\
                                                <span class="city_py">{{value.city_abbreviation}}</span>\
                                            </p>\
                                            <p class="day_distance">适玩<span class="r_daynum">{{value.fit_day}}</span>天<span class="ju">·距</span><span class="sur_this_city">'+sur_city+'</span><span class="city_km">{{value.distance}}</span></p>\
                                            <p class="introduce city_introduce" >点击查看介绍</p>\
                                        </div>\
                                        <div class="go_button">我想去</div>\
                                    </div>\
                                    <div class="top_box"><span class="js_prename">{{value.province_name}}</span>&nbsp;|&nbsp;<span class="top_num">{{value.city_score}}</span></div>\
                                    <i class="dis_none jsi_data" data-city_Introduction="{{value.city_Introduction}}"></i>\
                                </li>\
                            {{/each}}';
            var sur_city_render = template.compile(surtemplate);
            var sur_city_html = sur_city_render(data);
            $(".js_surcity_li").html(sur_city_html);

            if($('.surrounding_city_r_main li:eq(0)').find('.city_km').html() == ""){
                $('.surrounding_city_r_main li:eq(0)').find('.ju,.sur_this_city').hide()
            };
            //列表的top值变灰
            // $(".city_box li").each(function (a, n) {
            //     $(".js_surcity_li li").each(function (i, b) {
            //         if ($(n).find(".city_list_name").html() == $(b).find(".city_name").html()) {
            //             $(b).addClass("city_list_go").find(".go_button").addClass("go_button_gray").html('已添加');
            //         }
    
            //     });
            // })
    
            
        },
        //搜索 预选项列表 渲染
        searchTemplate: function (data, n, isSur) {
            var search_temp = '<ul>\
                                {{each city as value i}}\
                                {{if value.spot_name != ""}}\
                                    <li class="search_li  clearfix" >\
                                        <span class="sport_name">{{value.spot_name}}</span>\
                                        <span class="city_name fr">{{value.city_name}}</span>\
                                    </li>\
                                {{else if value.spot_name == "" && value.city_name =="" && ' + isSur + ' == ' + "city" + '}}\
                                    <li class="search_li  clearfix" >\
                                        <span class="sport_name">{{value.province_name}}</span>\
                                    </li>\
                                {{else if value.spot_name == "" && value.city_name !=""}}\
                                    <li class="search_li  clearfix" >\
                                        <span class="sport_name">{{value.city_name}}</span>\
                                        <span class="city_name fr">{{value.province_name}}</span>\
                                    </li>\
                                {{else}}\
                                    <li class="search_li  dis_none" ></li>\
                                {{/if}}\
                                {{/each}}\
                            </ul>';
            var search_render = template.compile(search_temp);
            var search_temp = search_render(data);
            $(n).html(search_temp);
        },
        //省份详情渲染
        provinceDetailsTemp:function (details_data) {
            // console.log(details_data)
            //省份详情top
            var provinceData_template = '<p class="p1">{{provinceData.province_name}}</p>\
                                        <p class="p2">{{provinceData.province_English}}</p>\
                                        <p class="p3">{{provinceData.introduction}}</p>';
            var provinceData_render = template.compile(provinceData_template);
            var provinceData_html = provinceData_render(details_data);
            $(".province_top_details_text").html(provinceData_html);
            //热门城市
            var hot_city_template = '<ul class="clearfix">\
                                        {{each hot_city as value i}}\
                                        <li>\
                                            <div class="img_box">\
                                                <img src="{{value.img_url}}" alt="">\
                                                <span class="hot_city_ranking"></span>\
                                            </div>\
                                            <div>\
                                                <p class="city_name">{{value.city_name}}</p>\
                                                <p class="attractions css_attractions">{{value.hot_spots}}</p>\
                                            </div>\
                                        </li>\
                                        {{/each}}\
                                    </ul>';
            var hot_city_render = template.compile(hot_city_template);
            var hot_city_html = hot_city_render(details_data);
            $(".hot_city").html(hot_city_html);
            for (var i = 0; i < details_data.hot_city.length; i++) {
                if (i < 3) {
                    $(".hot_city li").eq(i).find(".hot_city_ranking").html(ranking_array[i]);
                } else {
                    $(".hot_city li").eq(i).find(".hot_city_ranking").hide()
                }
            }
            //热门景点
            var hot_spot_template = '<ul class="clearfix">\
                                        {{each hot_spot as value i}}\
                                        <li>\
                                            <div class="img_box pos_rel">\
                                                <img src="{{value.img_url}}" alt="">\
                                                <div class="in_introduce">{{value.absture}}</div>\
                                            </div>\
                                            <div class="clearfix">\
                                                <span class="hot_spots_name" title="{{value.spot_name}}">{{value.spot_name}}</span>\
                                                <span class="hot_spots_city">{{value.city_name}}</span>\
                                            </div>\
                                        </li>\
                                        {{/each}}\
                                    </ul>';
            var hot_spot_render = template.compile(hot_spot_template);
            var hot_spot_html = hot_spot_render(details_data);
            $(".hot_spots").html(hot_spot_html);
            //本地特产
            var special_goods_template = '<ul class="clearfix">\
                {{each special_goods as value i}}\
                <li>\
                    <div class="img_box pos_rel">\
                        <img src="{{value.img_url}}" alt="">\
                        <div class="in_introduce">{{value.goods_Introduction}}</div>\
                    </div>\
                    <div class="clearfix">\
                        <span title="{{value.goods_name}}" class="hot_spots_name">{{value.goods_name}}</span>\
                        <span class="hot_spots_city">{{value.city_name}}</span>\
                    </div>\
                </li>\
                {{/each}}\
            </ul>';
            var special_goods_render = template.compile(special_goods_template);
            var special_goods_html = special_goods_render(details_data);
            $(".special_goods").html(special_goods_html);
            $(".province_details_popup_box").fadeIn();
            tabSwitch(".province_details_popup_box");
            //hover 省份 城市 详情 简介弹出
            //简介弹出动画
            initObj.in_introduce();
            // $(".hot_spots .pos_rel").each(function (i, n) {
            //     in_introduce(n)
            // });
            // //本地特产
            // $(".special_goods .pos_rel").each(function (i, n) {
            //     in_introduce(n)
            // })
        },
        //城市详情渲染
        cityDetails_template:function (city_info_data) {
            city_info_data.ranking_array = ranking_array
            // console.log(city_info_data)
            //城市详情top
            var city_top_template = '<p class="p1">{{cityData.city_name}}</p>\
                                <p class="p2">{{cityData.city_abbreviation}}&nbsp;&nbsp;|&nbsp;&nbsp;适玩{{cityData.fit_day}}天</p>\
                                <p class="p3">{{cityData.introduction}}</p>';
            var city_top_render = template.compile(city_top_template);
            var city_top_html = city_top_render(city_info_data);
            $(".city_top_details_text").html(city_top_html);
            //知名景点
            var city_sport_template = '<ul class="clearfix">\
                                        {{each famous_spot as value i}}\
                                        <li class="clearfix">\
                                            <div class="img_box">\
                                                <img src="{{value.img_url}}" alt="">\
                                            </div>\
                                            <div class="city_sport_content">\
                                                <div class="city_spots_name clearfix">{{value.spot_name}}<span class="hot_sport_ranking"></span> <p class="city_spots_score"><span></span></p></div>\
                                                <div class="city_spots_details">{{value.absture}}</div>\
                                                <div class="city_spots_address">地址：<span>{{value.spot_address}}</span></div>\
                                            </div>\
                                        </li>\
                                        {{/each}}\
                                    </ul>';
            var city_sport_render = template.compile(city_sport_template);
            var city_sport_thml = city_sport_render(city_info_data);
            $(".city_hot_sport").html(city_sport_thml);
            for (var i = 0; i < city_info_data.famous_spot.length; i++) {
                if (i < 3) {
                    $(".city_hot_sport li").eq(i).find(".hot_sport_ranking").html(ranking_array[i]);
                } else {
                    $(".city_hot_sport li").eq(i).find(".hot_sport_ranking").hide()
                }
            }
            //特色美食
            var city_foot_template = '<ul class="clearfix">\
                                    {{each special_food as value i}}\
                                    <li>\
                                        <div class="img_box pos_rel">\
                                            <img src="{{value.img_url}}" alt="">\
                                            <div class="in_introduce">{{value.dishes_Introduction}}</div>\
                                        </div>\
                                        <div class="city_foot_name">{{value.dishes_name}}</div>\
                                    </li>\
                                    {{/each}}\
                                </ul>';
            var city_foot_render = template.compile(city_foot_template);
            var city_foot_html = city_foot_render(city_info_data);
            $(".city_foot").html(city_foot_html);
            //特色商品
            var city_goods_template = '<ul class="clearfix">\
                                        {{each special_goods as value i}}\
                                        <li>\
                                            <div class="img_box pos_rel">\
                                                <img src="{{value.img_url}}" alt="">\
                                                <div class="in_introduce">{{value.goods_Introduction}}</div>\
                                            </div>\
                                            <div class="city_foot_name">{{value.goods_name}}</div>\
                                        </li>\
                                        {{/each}}\
                                    </ul>';
            var city_goods_render = template.compile(city_goods_template);
            var city_goods_html = city_goods_render(city_info_data);
            $(".city_goods").html(city_goods_html);
            //城市交通
            var city_traffic_template = '<ul>\
                                        {{each city_traffic as value i}}\
                                        <li class="xq_list">\
                                            <div class="traffic_left_img {{value.traffic_type}}"></div>\
                                            <div class="traffic_right_text">\
                                                <div class="placeName">{{value.traffic_name}}</div>\
                                                <div class="palce_tip">地址：{{value.traffic_address}}</div>\
                                                <div class="palce_tip">电话：{{value.traffic_phone}}</div>\
                                            </div>\
                                        </li>\
                                        {{/each}}\
                                    </ul>';
            var city_traffic_render = template.compile(city_traffic_template);
            var city_traffic_html = city_traffic_render(city_info_data);
            $(".city_traffic").html(city_traffic_html);
            $(".city_details_popup_box").fadeIn();
            //tab切换
            tabSwitch(".city_details_popup_box");//在common.js方法里
            //简介弹出动画
            initObj.in_introduce();
        },

    }
})
// 点击省份自定义窗口
function provice_infoClick() {
    var name = $("#content").attr('data-name');
    // 点击省份自定义窗口和省份列表对比，获取该省的城市列表
    initObj.clickProvinceMapFn(name);
}
//点击城市自定义窗口添加
function addCityFn() {
    var city_name = $("#content").find(".infoCityName").html()
    //点击城市自定义窗口和城市列表对比
    initObj.clickCityMapFn(city_name)
}
//-----------公用方法----------------

//citydata.json g 的值
let g_location = function (citydata_json_g) {
    // console.log(citydata_json_g)
    let citydata_json_g_location = citydata_json_g.g.substr(0, citydata_json_g.g.indexOf('|'));
    let citydata_g_lnglat = citydata_json_g_location.split(",");
    let location = {
        lat: parseFloat(citydata_g_lnglat[1]),
        lng: parseFloat(citydata_g_lnglat[0])
    };
    return location
};

//根据name获取的对应的颜色
function getColor(name) {
    //console.log(name)
    for (var m = provinces.length - 1; m >= 0; m--) {
        if (provinces[m].indexOf(name) > -1) {
            var arr = provinces[m].split("-");
            // console.log(arr)
            return arr;
        }
    }
};
//鼠标放在地图上对应list变亮
function hover_mapList($sel, list_name, mapName) {
    $sel.each(function (i, n) {
        if (mapName == $(n).find(list_name).html()) {
            $(n).addClass("list_hover").find(".introduce").addClass("introduce_hover")
        };
    });
}
// 鼠标离开地图。对应的列表hover效果也消失
function leave_mapList($sel) {
    $sel.removeClass("list_hover").find(".introduce").removeClass("introduce_hover");
};
//进度条
function cityProgressbar(percentage) {
    $('#progressbar').LineProgressbar({
        percentage: percentage,
        fillBackgroundColor: percentage > 100 ? barGg+'linear-gradient(right,#ea3e3e,#659ff5)' : barGg+'linear-gradient(right,#c4dcff,#659ff5)',
        height: '10px',
        radius: '5px'
    });
}
cityProgressbar(0);

//添加我想去的城市动画
function addflyer(list, $this) {
    //添加城市的动画
    $(".u-flyer").eq(0).remove();
    var img_src = $(list).find(".list_l img").attr("src");
    var city_postion = $this.offset();
    var left = city_postion.left
    var top = city_postion.top;
    var end_postion = $(".percentCount").eq(0).offset();
    var flyer = $('<img class="u-flyer" src=' + img_src + ' />')
    flyer.fly({
        start: {
            left: left,
            top: top
        },
        end: {
            left: end_postion.left + 50,
            top: end_postion.top + 100,
            width: 0,
            height: 0
        },
        speed: 1.4, //动画时间 
    });
};

//根据经纬度计算两点之间的距离
// 方法定义 lat,lng 调用 return的距离单位为km
function GetDistance(lat1, lng1, lat2, lng2) {
    // console.log(lat1,lat2)
    var radLat1 = lat1 * Math.PI / 180.0;
    var radLat2 = lat2 * Math.PI / 180.0;
    var a = radLat1 - radLat2;
    var b = lng1 * Math.PI / 180.0 - lng2 * Math.PI / 180.0;
    var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) +
        Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
    s = s * 6378.137; // EARTH_RADIUS;
    // s = Math.round(s * 10000) / 10000;
    s = Math.round(s);
    return s;
};

// 自定义标记
function createPopupClass(infoID, bgStyle, arrowStyle, yPx) {
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
        // infoID.classList.add('popup-bubble', bgStyle);
        infoID.classList.add('popup-bubble');
        infoID.classList.add(bgStyle)
        // This zero-height div is positioned at the bottom of the bubble.
        var bubbleAnchor = document.createElement('div');
        // bubbleAnchor.classList.add('popup-bubble-anchor', arrowStyle);
        bubbleAnchor.classList.add('popup-bubble-anchor');
        bubbleAnchor.classList.add(arrowStyle);
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
} 