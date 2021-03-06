var go_city_array = []; //添加我想去的城市信息
var customLine_obj = {}; //地图1存储当前页面数据带到下个页面
var postData = {}; //传给后台的数据线路优化;
// var post_city_array = [];//传给后台添加的城市
var new_date = new Date();
new_date = new Date(new_date.getYear() + 1900, new_date.getMonth(), new_date.getDate());
new_date = new_date.toString();
var ranking_array = ["第一名", "第二名", "第三名"];

var city_polygon_path = new google.maps.Polygon();

if(sessionStorage.form_data == undefined){
    window.location.href="/portal/addStrokeform/addStrokeform.html"
}
//出发城市返回城市
var depReturn_cityArray = []



$(function () {
    // console.log(screen.height,screen.width)
    console.log(document.body.clientWidth,document.body.clientHeight)
    $(document).bind("contextmenu",function(){return false;});  
    $(document).bind("selectstart",function(){return false;});  
    // console.log(sessionStorage.is_edit)
    // console.log(sessionStorage.is_Alledit)
    if(sessionStorage.is_edit == 'ok' || sessionStorage.is_Alledit == 'ok'){
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
    }
    function isphone_show() {
        var sUserAgent = navigator.userAgent.toLowerCase();
        var bIsIpad = sUserAgent.match(/ipad/i) == "ipad";
        var bIsIphoneOs = sUserAgent.match(/iphone os/i) == "iphone os";
        var bIsMidp = sUserAgent.match(/midp/i) == "midp";
        var bIsUc7 = sUserAgent.match(/rv:1.2.3.4/i) == "rv:1.2.3.4";
        var bIsUc = sUserAgent.match(/ucweb/i) == "ucweb";
        var bIsAndroid = sUserAgent.match(/android/i) == "android";
        var bIsCE = sUserAgent.match(/windows ce/i) == "windows ce";
        var bIsWM = sUserAgent.match(/windows mobile/i) == "windows mobile";
        if (bIsIpad || bIsIphoneOs || bIsMidp || bIsUc7 || bIsUc || bIsAndroid || bIsCE || bIsWM) {
            //跳转移动端页面
            $('.con_lef,.nav_rig').hide()
            $(".con_map").addClass('s_map')
        } else {
            //跳转pc端页面
            $('.con_lef,.nav_rig').show()
            $(".con_map").removeClass('s_map')
        }
    }
    isphone_show();

    //提示框设置时间
    if (localStorage.first_visitors_plan_time == undefined) {
        $(".visitors_plan").fadeIn();
        $(".visitors_plan").click(function () {
            $(".visitors_plan").fadeOut();
            var first_visitors_plan_time = new Date();
            first_visitors_plan_time = new Date(first_visitors_plan_time.getYear() + 1900, first_visitors_plan_time.getMonth(), first_visitors_plan_time.getDate());
            first_visitors_plan_time.setDate(first_visitors_plan_time.getDate() + 3);
            // console.log(first_visitors_plan_time)
            localStorage.setItem("first_visitors_plan_time", first_visitors_plan_time);
        });
    }
    var get_first_visitors_plan_time = localStorage.first_visitors_plan_time;
    if (new_date == get_first_visitors_plan_time) {
        localStorage.removeItem("first_visitors_plan_time");
    }
    if (localStorage.visitors_ri_time == undefined) {
        $(".visitors_ri").fadeIn();
        $(".visitors_ri").click(function () {
            $(".visitors_ri").fadeOut();
            var visitors_ri_time = new Date()
            visitors_ri_time = new Date(visitors_ri_time.getYear() + 1900, visitors_ri_time.getMonth(), visitors_ri_time.getDate());
            visitors_ri_time.setDate(visitors_ri_time.getDate() + 3);
            localStorage.setItem("visitors_ri_time", visitors_ri_time);
        });
    }
    var get_visitors_ri_time = localStorage.visitors_ri_time;
    if (new_date == get_visitors_ri_time) {
        localStorage.removeItem("get_visitors_ri_time");
    }

    
    
    
    //渲染表单的数据
    function formData(data){
        var form_data = data;
        // console.log(form_data)

        // 我的出行计划弹窗部分satrt
        $("#custom_title").val(form_data.custom_title).attr("placeholder", form_data.custom_title)
        
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


        //页面左边
        if(sessionStorage.setDayNum){
            $(".num_day").html(sessionStorage.setDayNum);
            $(".wap1_day_num").html(sessionStorage.setDayNum);
        }else{
            $(".f_top_p .num_day").html(form_data.day_num);
            $(".wap1_day_num").html(form_data.day_num);
        }
        $(".f_top .calendar .date").html(form_data.date);
        $(".people_num .adult").html(form_data.adult);
        if (form_data.children !== "0") {
            $(".people_num .children").html(form_data.children + "儿童");
        }
        $(".departure_city").html(form_data.departure_city);
        $(".return_city").html(form_data.return_city);

        //出行计划 title
        var title_data = $("#wap3_date").val();
        $("#custom_title").attr("placeholder", title_data + "的行程");
        $("#custom_title").attr("value", title_data + "的行程");
       
        
    }
    
    //渲染已选的城市数据
    function back_cityFn (data){
        var city_data = data.go_city_array;
        _back_go_city_array = city_data;
        var lat = Number(city_data[0].position.lat);
        var lng = Number(city_data[0].position.lng);
        var position = {
            lat:lat,
            lng:lng
        }
        mapCenter(position,7);
        $(".provinces_con_rig").hide();
        $(".city_con_rig").show();
        $(".city_r_main").show();
        $(".surrounding_city_r_main").hide();

        //周边城市显隐
        sur_show();
        var post_data = {}
        post_data.lat = lat;
        post_data.lng = lng;
        post_data.city_id = city_data[0].city_id;
        post_data.province_id = city_data[0].province_id;
        post_data.day_num = $(".num_day").html();
        post_data.city_day_num = city_data[0].city_daynum;
        post_surList(post_data);

        for(var i = 0;i<city_data.length;i++){
            var city_postion = {
                lat:Number(city_data[i].position.lat),
                lng:Number(city_data[i].position.lng)
            }
            var city_name = city_data[i].city_name;
            // console.log(city_name)
            surClickmarker(city_postion, city_name);
        }
        var obj_addciy = {
            addcitylist: city_data
        }
        addcity_template(obj_addciy);
        fortableDaynum(100);
        //出发城市返回城市icon
        dep_return_marker()
    }

    //出行计划 出发城市和返回城市搜索
    $(".wap2").on("click", ".start,.end", function (e) {
        $(".search_city_box").hide().end()
            .find(".s_city_list").html("").end().find(".s_city_list").hide().end().find("#s_input").val("");
        var this_pos = $(this).position();
        $(".search_city_box").show().css({
            left: this_pos.left,
            top: this_pos.top + 42
        });
        $(".search_city_box").attr("data-searchcity", $(this).attr("class"));
    });

    $(".search_city_box .s_city_list").on("click", "li", function () {
        var bs_this = $(".search_city_box").attr("data-searchcity")
        $("." + bs_this).find("." + bs_this + "_name").html($(this).html());
        $(".search_city_box").hide().end()
            .find(".s_city_list").html("").end().find(".s_city_list").hide().end().find("#s_input").val("");
    })

    $(".closeMadeTravelMask").on("click", function () {
        $(".search_city_box").hide();
    });
    $(".search_city_box .e_icon").on("click", function () {
        $(".search_city_box").hide();
    });
    var nav_timer;
    $("#s_input").on('input propertychange', function () {
        $(".s_city_list").fadeIn();
        $(".e_icon").show();
        $(".s_icon").hide()
        var city_name = $(this).val();
        clearTimeout(nav_timer)
        nav_timer = setTimeout(function () {
            $.ajax({
                url: allUrl.city_search,
                type: "get",
                dataType: "json",
                data: {
                    city_name: city_name
                },
                success: function (data) {
                    // console.log(data)
                    if (data == null) {
                        $(".s_city_list").html("未检索到相关信息")
                    } else {
                        var seach_list_template = '<ul>\
                                            {{each searchList as value i}}\
                                            <li>{{value.area_name}}</li>\
                                            {{/each}}\
                                          </ul>';
                        var seach_list_render = template.compile(seach_list_template);
                        var seach_list_html = seach_list_render(data);
                        if (data.searchList == "") {
                            $(".s_city_list").html("未检索到相关信息")
                        } else {
                            $(".s_city_list").html(seach_list_html)
                        }
                    };

                }
            })
        }, 500)

    });


    // 出行计划保存
    $(".save").on("click", function () {
        //左边数据改变
        var dayN = $(".wap1_day_num").html()
        $(".num_day").html(dayN);
        $(".people_num .adult").html($(".wap2_adult_num").html());
        if ($(".wap2_childrent_num").html() != 0) {
            $(".people_num .children").html($(".wap2_childrent_num").html() + "儿童");
        }

        $(".departure_city").html($(".wap2 .start_name").html());
        $(".return_city").html($(".wap2 .end_name").html());
        $(".calendar .date").html($("#wap3_date").val());
        if(!$('.city_box').hasClass('dis_none')){
        //    console.log(depReturn_cityArray)
            infoDepReturn_del() 
            for (var i = 0; i < depReturn_cityArray.length; i++) {
                depReturn_cityArray[i].setMap(null);
            }
            depReturn_cityArray = []
            //出发城市返回城市icon
            dep_return_marker()
        }
       

        $('.madeTravelMask').fadeOut();
        fortableDaynum("first");

        sessionStorage.setItem("setDayNum",dayN)
        
       
    });

    


    //收索城市和景点 省份
    var input_timer;
    $(".provinces_search_s").focus(function () {
        $(".province_search_icon").hide();
        $(".provsearch_del").show();
    }).bind('input propertychange', function () {
        var input_val = $(this).val();
        if (input_val !== '') {
            $(".province_r_main").hide();
            $(".search_content_list").show();

            clearTimeout(input_timer);
            input_timer = setTimeout(function () {
                $.ajax({
                    url: allUrl.search,
                    type: "get",
                    dataType: "json",
                    data: {
                        city_name: input_val
                    },
                    success: function (data) {
                        // console.log(data);
                        //搜索 预选项列表 渲染
                        var pre = ".search_content_list";

                        if (data.city.length == 0) {
                            $(".search_content_list").html('<li class="search_li not_search" >未检索到相关信息</li>')
                        } else {
                            searchTemplate(data, pre, "city");
                        }

                    }
                })
            }, 500)
        }

    });
    //省份搜索删除
    $(".provsearch_del").on("click", function () {
        $(".province_r_main").show();
        $(".search_content_list").hide();
        $(".provsearch_del").hide();
        $(".province_search_icon").show();
        $(".provinces_search_s").val("");
    });
    $(".citysearch_del").on("click", function () {
        $(".city_r_main").show();
        $(".citysearch_cont_list").hide();
        $(".search_content").hide();
        $(".city_r_top").show();
        $(".city_search_s").val("");
    });
    //城市收索
    $(".city_nearby_right").on("click", function () {
        $(".city_r_top").hide();
        $(".search_content").show();
    });
    $(".city_search_s").bind('input propertychange', function () {
        var input_val = $(this).val();
        if (input_val !== '') {
            $(".city_r_main").hide();
            $(".citysearch_cont_list").show();
            $(".citysearch_del").show();
            $(".citys_search_icon").hide();
            clearTimeout(input_timer);
            input_timer = setTimeout(function () {
                $.ajax({
                    url: allUrl.search,
                    type: "get",
                    dataType: "json",
                    data: {
                        city_name: input_val
                    },
                    success: function (data) {
                        // console.log(data);
                        //搜索 预选项列表 渲染
                        var city = ".citysearch_cont_list";
                        if (data.city.length == 0) {
                            $(".citysearch_cont_list").html('<ul><li class="search_li not_search" >未检索到相关信息</li></ul>')
                        } else {
                            searchTemplate(data, city, "city");
                        }
                    }
                })
            }, 500)
        }
    })

    //周边城市搜索
    $(".addcity_r_top").on("click", ".search_icon,.addcitytext", function () {
        $('.search_icon,.addcitytext').hide().siblings(".sur_del").show();
        $(".addcitytext").hide().siblings("#sur_input").show();
        $("#sur_input").val("")
    });
    $(".sur_del").on("click", function () {
        $(this).hide().siblings(".search_icon").show();
        $(".addcitytext").show().siblings("#sur_input").hide();
        $(".sur_serch_list").hide().siblings(".surrounding_city_r_main").show();
    });
    $("#sur_input").bind('input propertychange', function () {
        var input_val = $(this).val();
        var postDdata = {
            city_name: input_val
        };
        clearTimeout(input_timer)
        if (input_val != '') {
            $(".sur_serch_list").show().siblings(".surrounding_city_r_main").hide();
            input_timer = setTimeout(function () {
                post_sur_list()
            }, 500)
        } else {
            $(".sur_serch_list").hide().siblings(".surrounding_city_r_main").show();
        }

        function post_sur_list() {
            var str = ""
            $.get(allUrl.search, postDdata, function (data) {
                // console.log(data)
                if (data.city.length == 0) {
                    str = '<ul><li class="search_li not_search">未检索到相关信息</li></ul>'
                    $(".sur_serch_list").html(str)
                } else {
                    searchTemplate(data, ".sur_serch_list", "sur");
                }


            }, "json")
        }
    });

    //搜索 预选项列表 渲染
    function searchTemplate(data, n, isSur) {
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


        $(n).find(".search_li").each(function (i, n) {
            $(n).on("click", function () {
                var search_placeNames = data.city[i].province_name;
                var search_data_type = data.city[i].is_municipalities;
                var search_province_id = data.city[i].province_id;
                var search_city_id = data.city[i].city_id;
                if (isSur != "sur") {
                    // console.log(search_city_id)
                    $(".province_r_main").show();
                    $(".citysearch_cont_list").hide();
                    $(".province_search_icon").show();
                    $("#nearby").val("");
                    $("#search_nearby").val("");
                    $(".city_r_top").show();
                    $(".search_content").hide();
                    proCitylist(search_placeNames, search_data_type, search_province_id, search_city_id);
                } else {
                    var postData = {
                        city_name: data.city[i].city_name,
                        city_id: data.city[i].city_id
                    }
                    $.post("around_searchCity", postData, function (data) {
                        // console.log(data)
                        if (!data) return false;
                        $(".sur_serch_list").hide().siblings(".surrounding_city_r_main").show();
                        $(".addcitytext,.search_icon").show().siblings("#sur_input,.sur_del").hide();
                        surroundingCitytemplate(data, "search");
                        $('.surrounding_city_r_main').scrollTop(0)
                        sur_hoverli(data,'search')
                    }, 'json');
                }
            })
        });



    };



    var data_obj = {};
    data_obj.provinces_data = [];
    data_obj.click_city_data = [];

    var fortable_daynumA = [] //试玩天数

    var map = null;
    var provinces = ["广西-#C8C1E3", "广东-#FBC5DC", "湖南-#DBEDC7",
        "贵州-#E7CCAF", "云南-#DBEDC7", "福建-#FEFCBF",
        "江西-#E7CCAF", "浙江-#C8C1E3", "安徽-#FBC5DC",
        "湖北-#C8C1E3", "河南-#DBECC8", "江苏-#DBECC8",
        "四川-#FCFBBB", "海南省-#FCFBBB", "山东-#FCFBBB",
        "辽宁-#FCFBBB", "新疆-#FCFBBB", "西藏-#E7CCAF",
        "陕西-#E7CCAF", "河北-#E7CCAF", "黑龙江-#E7CCAF",
        "宁夏-#FBC5DC", "内蒙古自治区-#DBEDC7", "青海-#DBEDC7",
        "甘肃-#C8C1E3", "山西-#FBC5DC", "吉林省-#C8C1E3",
        "北京-#FBC5DC", "天津-#C8C1E3", "三河市-#E7CCAF",
        "上海-#FCFBBB", "重庆市-#FBC5DC", "香港-#C8C1E3", "台湾-#C8C1E3", "澳门-#C8C1E3"
    ];
    //省份
    var polyOptions = {
        //边线边框线
        strokeColor: "#9B868B",
        provincesName: "省份",
        provincesLocation: "",
        fillColor: "",
        fillOpacity: 0.5,
        strokeWeight: 1,
        zIndex: 1
    };

    //城市
    //省份边界线
    var cityPolyOptions = {
        //边线边框线
        strokeColor: "#F00000",
        // provincesName: "省份",
        // provincesLocation: "",
        // fillColor: "#FF8C69",
        fillOpacity: 0,
        strokeWeight: 1,
        zIndex: 1
    };

    //城市高亮
    var citypolyOptions = {
        strokeColor: "#9B868B",//边线边框线
        provincesName: "城市",
        // provincesLocation: "",
        fillColor: "", //背景颜色
        fillOpacity: 0,
        strokeWeight: 1,
        zIndex: 1
    };
    var city_paths_arry = [] //城市边界线;
    var sur_click_position = [] //点击 我想去存该城市的经纬度

    //标记点
    var provinces_markers = []; //省份icon
    var city_markers = []; //城市标记点
    var sur_clickCity_markers = []; //点击周边城市标记点
    var sur_city_markers = []; //周边城市标记点
    var hover_sur_city_markers = []; //hover 周边城市 显示标记点
    var departure_pos; //出发城市 经纬度
    var return_pos; //返回城市 经纬度

   

    function initMap() {

        //定义标记点
        provinces_icon_image = {
            // url: "../../public/themes/simpleboot3/public/assets/images/map1.png",
            url: "/static/common/img/map1.png",
            // This marker is 20 pixels wide by 32 pixels high.
            size: new google.maps.Size(40, 20),
            // The origin for this image is (0, 0).
            origin: new google.maps.Point(20, 0),
            // The anchor for this image is the base of the flagpole at (0, 32).
            anchor: new google.maps.Point(20, 10)
        };
        sessionStorage.removeItem('isTraveCity')
        if(sessionStorage.is_City_data == undefined){
            $.post("MyPlan", function (data) {
                // console.log(data)
                formData(data)
                
            }, 'json');
            getProvinces();
        }else{
            $.post('TakeCity',function(data){
                // console.log(data)
                if(data){
                    $(".loading_box").fadeOut()
                    //渲染表单的数据
                    formData(data);
                    back_cityFn(data)
                }else{
                    return false;
                }
            },'json');
        }   

        

    }
    //地图中心点
    function mapCenter(centerLocation, zoom) {
        
        map = new google.maps.Map(document.getElementById('map'), {
            zoom: zoom,
            //可以解决出现 Ctrl+鼠标滚轮滚动
            gestureHandling: 'greedy',
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            scaleControl: true,
            streetViewControl: false,
            center: centerLocation
        });
    }

    //获取省份数据
    function getProvinces() {
        var list_placeNames;
        var data_type;
        $.ajax({
            type: "GET",
            url: allUrl.province,
            dataType: "json",
            success: function (province_data) {
                // console.log(province_data)
                //袋鹿正在努力加载中。。。。隐藏
                if (!province_data) {
                    return false;
                } else {
                    $(".loading_box").fadeOut()
                    $('.r_text').addClass('animated flash')
                };

                //省份高亮地图方法
                provincesMap()
                //省份列表渲染
                provinceTemplate(province_data);
                // ----显示初始状态
                $(".city_con_rig").hide();
                $(".provinces_con_rig").show();
                $(".city_box").addClass("dis_none");
                $(".people_num ").show();
                $(".addcity_r_top").hide();
                $(".city_r_top").show();
                $(".f_prompt").show();
                $(".f_main_bg").show();
                $(".f_main_next").hide();
                $(".text_logo_bgc").hide();
                $(".provsearch_del ").hide();
                $(".beyond_day_num").hide().html("");
                $(".visitors_firstcity").fadeOut();
                $(".visitors_lef").fadeOut();
                $(".sj_icon").fadeOut();
                $(".addcitytext").show().siblings("#sur_input").hide();
                sur_city_markers = [] //清空周边城市的icon
                //省份列表hover
                $('.province_r_main .list').each(function (i, n) {
                    $(n).hover(function () {
                        data_type = $(this).attr("data-type");
                        list_placeNames = $(this).find(".provinces").html();
                        place_fn(list_placeNames, map, data_type);
                    }, function () {
                        data_type = $(this).attr("data-type");
                        list_placeNames = $(this).find(".provinces").html();
                        place_fn(list_placeNames, null, data_type);
                        setMapOnAll(null);
                    });
                    //省份详情
                    var province_id = province_data.pro[i].province_id; //省份id
                    $(n).on("click", ".province_introduce,.list_l", function () {
                        $.ajax({
                            type: "POST",
                            url: allUrl.province_info,
                            dataType: "json",
                            data: {
                                province_id: province_id
                            },
                            success: function (details_data) {
                                // console.log(details_data);
                                //省份图片
                                $(".province_details").css({
                                    background: "url(" + details_data.provinceData.img_url + ") no-repeat",
                                    backgroundSize: 100 + "%"
                                });
                                //省份详情渲染
                                provinceDetails(details_data)
                            }
                        })

                    });

                    // //点击省份加载城市列表
                    $(n).on("click", ".list_icon_box", function () {
                        var clist_placeNames = $(n).find(".provinces").html(); //省份名字
                        var clist_data_type = $(n).attr("data-type");
                        var s_city_id = "";
                        proCitylist(clist_placeNames, clist_data_type, province_id, s_city_id)

                    });
                });
            }
        })
    };
    //省份加载城市列表
    function proCitylist(clist_placeNames, clist_data_type, province_id, search_city_id) {
        // console.log(province_id);
        $(".provinces_con_rig").hide();
        $(".city_con_rig").show();
        $(".city_r_main").show();
        $(".surrounding_city_r_main").hide();

        // console.log( search_city_id)
        $.ajax({
            url: search_city_id == "" ? allUrl.city : allUrl.searchCity, //searchCity点击搜索的结果，返回省份下城市
            type: "POST",
            dataType: "json",
            data: {
                province_id: province_id,
                city_id: search_city_id
            },
            success: function (city_data) {
                var city_latlng_array = [];
                // console.log(city_data);
                for (var i = 0; i < city_data.cityList.length; i++) {
                    var lat = city_data.cityList[i].latitude;
                    var lng = city_data.cityList[i].longitude;
                    var city_latlng = new google.maps.LatLng(lat, lng);
                    city_latlng_array.push(city_latlng);

                };
                // console.log(city_latlng_array)
                cityTemplate(city_data, clist_placeNames);
                //省份边界线亮
                cityMap(clist_data_type, clist_placeNames, city_latlng_array);
                //我想去
                go_city()



            }
        })
    };
    // 省份城市 城市详情介绍
    $(".city_r_main").on("click", ".list .city_introduce,.list_l", function () {
        cityInfofn($(this));
    });

    //城市详情渲染
    function cityInfofn(n) {
        var city_list_id = {};
        city_list_id.city_id = n.parents("li").find(".city_introduce").attr("data-cityid");
        city_list_id.province_id = n.parents("li").find(".city_introduce").attr("data-provinceid");
        $.ajax({
            url: allUrl.city_info,
            type: "POST",
            dataType: "json",
            data: city_list_id,
            success: function (city_info_data) {
                // console.log(city_info_data)
                //城市详情渲染
                cityDetails(city_info_data);
                $(".city_details").css({
                    background: "url(" + city_info_data.cityData.img_url + ") no-repeat",
                    backgroundSize: 100 + "%"
                })
            }
        })
    }

    //省份高亮地图方法
    function provincesMap() {
        var centerLocation = {
            lat: 32.694866,
            lng: 105.996094
        };
        // console.log(cityData)
        mapCenter(centerLocation, 5);
        //cityData是citydata.json里面的数据
        // 普通省
        for (var i = 0, n = cityData.provinces.length; i < n; i++) {
            var provinces_location = g_location(cityData.provinces[i]);
            showBoundaryEx(cityData.provinces[i].b, getColor(cityData.provinces[i].n), cityData.provinces[i].n, provinces_location);

        };
        //直辖市 
        for (var i = 0, n = cityData.municipalities.length; i < n; i++) {
            var municipalities_location = g_location(cityData.municipalities[i]);
            showBoundaryEx(cityData.municipalities[i].b, getColor(cityData.municipalities[i].n), cityData.municipalities[i].n, municipalities_location);
        };
        //港澳台
        for (var i = 0, n = cityData.other.length; i < n; i++) {
            var other_location = g_location(cityData.other[i]);
            showBoundaryEx(cityData.other[i].b, getColor(cityData.other[i].n), cityData.other[i].n, other_location);
        }

    };

    //省份列表hover对应地图高亮
    function place_fn(list_placeNames, map, data_type) {
        if (data_type == 1) {
            var municipalities_index = getArrIndex(cityData.municipalities, {
                n: list_placeNames
            });
            var municipalities_index_data = cityData.municipalities[municipalities_index];
            //地图直辖市高亮
            provinces_paths(municipalities_index_data.b, "#FFFF00", list_placeNames, map);

            //添加标记点
            splitMarker(municipalities_index_data, list_placeNames);

        } else {
            var provinces_index = getArrIndex(cityData.provinces, {
                n: list_placeNames
            });
            var provinces_index_data = cityData.provinces[provinces_index];
            //地图身份高亮
            provinces_paths(provinces_index_data.b, "#FFFF00", list_placeNames, map);
            //添加标记点
            splitMarker(provinces_index_data, list_placeNames);

        }


    };

    //省份列表渲染
    function provinceTemplate(province_data) {
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
                                        <div class="list_icon_box"><i class="list_icon"></i></div>\
                                    </div>\
                                </li>\
                                {{/each}}\
                            </ul>'
        var Provinces_render = template.compile(Provinces_template);
        var Provinces_html = Provinces_render(province_data)
        $(".province_r_main").html(Provinces_html);
    };

    //城市列表渲染
    function cityTemplate(city_data, clist_placeNames) {
        // console.log(city_data)
        var city_template = '<ul>\
                            {{each cityList as value i}}\
                            <li class="list" data-lat={{value.latitude}} data-lng={{value.longitude}}>\
                                <div class="list_l">\
                                    <img src="{{value.img_url}}" alt="">\
                                </div>\
                                <div class="list_r city_list_r">\
                                    <div class="text">\
                                        <p><span class="city_name">{{value.city_name}}</span> <span class="city_py">{{value.city_abbreviation}}</span></p>\
                                        <p class="day_distance">适玩<span class="r_daynum">{{value.fit_day}}</span>天</p>\
                                        <p class="introduce city_introduce" data-cityid = "{{value.city_id}}" data-provinceid= "{{value.province_id}}">点击查看介绍</p>\
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
    };

    //渲染周边城市列表
    function surroundingCitytemplate(data, isSearch) {
        var obj= {current:data}
        var surtemplate = '{{each current as value i}}\
                                <li class="list" data-lat={{value.latitude}} data-lng={{value.longitude}} data-cityId={{value.city_id}} data-provinceId={{value.province_id}}>\
                                    <div class="list_l">\
                                        <img src="{{value.img_url}}" alt="">\
                                    </div>\
                                    <div class="list_r city_list_r">\
                                        <div class="text">\
                                            <p>\
                                                <span class="city_name">{{value.city_name}}</span>\
                                                <span class="city_py">{{value.city_abbreviation}}</span>\
                                            </p>\
                                            <p class="day_distance">适玩<span class="r_daynum">{{value.fit_day}}</span>天·距<span class="sur_this_city"></span><span class="city_km">{{value.distance}}</span></p>\
                                            <p class="introduce city_introduce" data-cityid = "{{value.city_id}}" data-provinceid= "{{value.province_id}}">点击查看介绍</p>\
                                        </div>\
                                        <div class="go_button">我想去</div>\
                                    </div>\
                                    <div class="top_box"><span class="js_prename">{{value.province_name}}</span>&nbsp;|&nbsp;<span class="top_num">{{value.city_score}}</span></div>\
                                    <i class="dis_none js_idata" data-city_Introduction={{value.city_Introduction}}></i>\
                                </li>\
                            {{/each}}';
        var sur_city_render = template.compile(surtemplate);
        var sur_city_html = sur_city_render(obj);
        $(".js_surcity_li").html(sur_city_html);

        $(".city_box li").each(function (a, n) {
            $(".js_surcity_li li").each(function (i, b) {
                if ($(n).find(".city_list_name").html() == $(b).find(".city_name").html()) {
                    $(b).addClass("city_list_go").find(".go_button").addClass("go_button_gray").html('已添加');
                }
                if (isSearch == "search") {
                    if (i > 0) {
                        $(b).find(".sur_this_city").html($(".city_box li").eq(0).find(".city_list_name").html())
                    } else {
                        $(b).find(".day_distance").html("适玩<span class='r_daynum'>" + data[i].fit_day + "</span>天")
                    }
                } else {
                    $(".js_surcity_li li").find(".sur_this_city").html($(".city_box li").eq(0).find(".city_list_name").html())
                }

            });
        })

        $(".addcitytext .sur_this_city").html($(".city_box li").eq(0).find(".city_list_name").html())


    }

    //省份详情渲染
    function provinceDetails(details_data) {
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
        //热门景点
        $(".hot_spots .pos_rel").each(function (i, n) {
            in_introduce(n)
        });
        //本地特产
        $(".special_goods .pos_rel").each(function (i, n) {
            in_introduce(n)
        })
    };

    //城市详情渲染
    function cityDetails(city_info_data) {
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
        //详情弹出层tab切换
        tabSwitch(".city_details_popup_box");

        //特色美食
        $(".city_foot .pos_rel").each(function (i, n) {
            in_introduce(n)
        });
        //特色商品
        $(".city_goods .pos_rel").each(function (i, n) {
            in_introduce(n)
        });
    };


    //添加省份名字标记点
    function addmarker(location, list_provinces) {
        var provincesMarker = new google.maps.Marker({
            position: location,
            //label: labels[labelIndex++ % labels.length],
            //设置label的文本，和样式
            label: {
                text: list_provinces,
                color: '#ffffff'
            },
            icon: provinces_icon_image,
            map: map

        });
        provinces_markers.push(provincesMarker)

        google.maps.event.addListener(provincesMarker, "click", function () {
            $(".province_r_main li").each(function (i, n) {
                if (list_provinces == $(n).find(".provinces").text()) {
                    var clist_data_type = $(n).attr("data-type");
                    var province_id = $(n).attr("data-province_id");
                    var s_city_id = "";
                    proCitylist(list_provinces, clist_data_type, province_id, s_city_id);
                }
            })
        });

    };
    //清除标记点
    function setMapOnAll(map) {
        for (var i = 0; i < provinces_markers.length; i++) {
            provinces_markers[i].setMap(map);
        }
    };



    //省份列表hover 省份高亮
    function provinces_paths(latLngs, color, provinces_name, map) {

        // console.log(color,map)
        //获取边界线的经纬度
        var paths = mapPaths(latLngs);
        // var polygon = new google.maps.Polygon();
        //清空
        if (map == null) {
            $(data_obj.provinces_data).each(function (i, n) {
                n.setMap(null)
            })

            data_obj.provinces_data = [];


        } else {
            bermudaTriangle = new google.maps.Polygon({
                paths: paths,
                strokeColor: '#9B868B',
                strokeOpacity: 1,
                strokeWeight: 1,
                fillColor: '#FFFF00',
                fillOpacity: 0.5,
                zIndex: 1
            })

            // console.log(data_obj.provinces_data)  
            data_obj.provinces_data.push(bermudaTriangle);
            bermudaTriangle.setPaths(paths)
            bermudaTriangle.setMap(map);

        }

    };

    // 城市列表hover 城市高亮
    function cityPaths(latLngs, color, provinces_name, map) {
        //获取边界线的经纬度
        var paths = mapPaths(latLngs)
        //清空
        if (map == null) {
            $(data_obj.city_data).each(function (i, n) {
                n.setMap(map)
            })
            data_obj.click_city_data = [];
            // data_obj.city_data.splice(0,data_obj.city_data.length);  
        }
        citybermudaTriangle = new google.maps.Polygon({
            paths: paths,
            strokeColor: '#9B868B',
            strokeOpacity: 1,
            strokeWeight: 1,
            fillColor: color,
            fillOpacity: 0.5,
            zIndex: 1
        })
        // data_obj.click_city_data.push(citybermudaTriangle);
        // console.log(data_obj)
        citybermudaTriangle.setMap(map);
    };


    //name从json数据中获取的省的名字
    function getColor(name) {
        //console.log(name)
        for (var m = provinces.length - 1; m >= 0; m--) {
            if (provinces[m].indexOf(name) > -1) {
                var arr = provinces[m].split("-");
                //console.log(arr)
                return arr[1];
            }
        }
    };

    //鼠标放在地图省份高亮
    function showBoundaryEx(latLngs, color, provinces_name, placeName_location) {
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
        // console.log(polygon)
        //鼠标放上去
        google.maps.event.addListener(polygon, "mouseover",
            function () {
                polygon.setOptions({
                    //鼠标放上去的颜色
                    fillColor: "#FFFF00",
                });
                var provincesName = polygon.provincesName;
                var name_location = polygon.provincesLocation;
                addmarker(name_location, provincesName)
                $(".province_r_main li").each(function (i, n) {
                    if (provincesName == $(n).find(".provinces").text()) {
                        $(n).addClass("list_hover").find(".introduce").addClass("introduce_hover")
                    }
                })
            });
        //鼠标离开

        google.maps.event.addListener(polygon, "mouseout",
            function () {
                polygon.setOptions({
                    fillColor: color,
                });
                setMapOnAll(null)
                leave_map($(".province_r_main li"))
            });

        google.maps.event.addListener(polygon, "click", function () {
            polygon.setOptions({
                //鼠标放上去的颜色
                fillColor: "#ddd",
            });
            var provincesName = polygon.provincesName;
            $(".province_r_main li").each(function (i, n) {
                if (provincesName == $(n).find(".provinces").text()) {
                    var clist_data_type = $(n).attr("data-type");
                    var province_id = $(n).attr("data-province_id");
                    var s_city_id = "";
                    proCitylist(provincesName, clist_data_type, province_id, s_city_id)
                }
            })
        });
    }
    //鼠标放在地图上城市高亮
    function hovercityMap(data_type, hoverCitydata, city_latlng_array) {
        // console.log(hoverCitydata)
        var hover_city_name = [];
        $(".city_r_main .city_list_r").each(function (i, name) {
            hover_city_name.push($(name).find(".city_name").html());
        });
        // console.log(hover_city_name)
        var hoverCities_array = data_type == 1 ? hoverCitydata : hoverCitydata.cities;
        $(hover_city_name).each(function (i, n) {
            // console.log(n)
            var cities_index = data_type == 1 ? hoverCities_array : getArrIndex(hoverCities_array, {
                n:n
            });
            if (cities_index != null) {
                var city_paths_latlng = data_type == 1 ? mapPaths(hoverCities_array.b) : mapPaths(hoverCities_array[cities_index].b);
                var city_polygon = new google.maps.Polygon();
                city_polygon.setOptions(citypolyOptions);
                city_polygon.setOptions({
                    provincesName: n,
                  
                });
                city_polygon.setPaths(city_paths_latlng);
                city_polygon.setMap(map);
                city_paths_arry.push(city_polygon)
                // console.log(city_polygon)
                //鼠标放上去
                google.maps.event.addListener(city_polygon, "mouseover",
                    function () {
                        // console.log(city_polygon)
                        // console.log(11)
                        city_polygon.setOptions({
                            // paths:city_paths_latlng,
                            //鼠标放上去的颜色
                            fillColor: "#FFFF00",
                            fillOpacity: 0.5,
                        });
                        
                        addCitymarker(city_latlng_array[i], $(n).selector);
                        $(".city_r_main .list").each(function (i, name) {
                            if ($(name).find(".city_name").html() == $(n).selector) {
                                $(name).addClass("list_hover").find(".introduce").addClass("introduce_hover")
                            };

                        });
                    });


                //鼠标离开
                google.maps.event.addListener(city_polygon, "mouseout", function () {
                    city_polygon.setOptions({
                        fillColor: "",
                        fillOpacity: 0,
                    });
                    clearcityMarker(city_markers)
                    leave_map($(".city_r_main .list"))
                });

                google.maps.event.addListener(city_polygon, "click", function () {
                    city_polygon.setOptions({
                        //鼠标放上去的颜色
                        fillColor: "#ddd"
                    });
                    $(".city_r_main .list").each(function (i, name) {
                        if ($(name).find(".city_name").html() == $(n).selector) {
                            show_surlist($(name).find(".go_button"), name)
                            fortableDaynum("first")
                        };

                    });
                });
            }

        });
    };




    function leave_map($sel) {
        $sel.removeClass("list_hover").find(".introduce").removeClass("introduce_hover")
    }

    //城市列表 （省级边界线亮）
    function cityMap(data_type, list_placeNames, city_latlng_array) {
        if (data_type == 1) {
            var municipalities_index = getArrIndex(cityData.municipalities, {
                n: list_placeNames
            });
            var municipalities_index_data = cityData.municipalities[municipalities_index];
            // console.log(municipalities_index_data);
            //获取中心点的经纬度
            // var municipalities_centerlnglat = splitLocation(municipalities_index_data);
            var municipalities_centerlnglat = g_location(municipalities_index_data);
            // var get_Mzoom = 8;
            var get_Mzoom = cityData.municipalities[municipalities_index].z;
            mapCenter(municipalities_centerlnglat, get_Mzoom);
            provincesPaths(municipalities_index_data.b);
            //城市列表hover
            cityFn(data_type, municipalities_index_data, city_latlng_array,get_Mzoom);
            hovercityMap(data_type, municipalities_index_data, city_latlng_array);


        } else {
            var provinces_index = getArrIndex(cityData.provinces, {
                n: list_placeNames
            });
            // console.log(cityData)
            // console.log(provinces_index)
            var provinces_index_data = cityData.provinces[provinces_index];
            // var get_zoom = Number(cityData.provinces[provinces_index].z);
            var get_zoom = cityData.provinces[provinces_index].z;
            // console.log(get_zoom)
            //获取中心点的经纬度
            var provinces_centerlnglat = g_location(provinces_index_data);
            mapCenter(provinces_centerlnglat, get_zoom);
            // var provinceArray = ["内蒙古-5","西藏-5","新疆-5","陕西-5","云南-5","青海-5","四川-5"]

            // for(var i = 0;i<provinceArray.length;i++){
            //     if (list_placeNames == provinceArray[i]){
            //         mapCenter(provinces_centerlnglat, 5);
            //     }
            // }

            // if (list_placeNames == "内蒙古" || list_placeNames == "西藏" || list_placeNames == "新疆" || list_placeNames == "陕西" || list_placeNames == "云南" || list_placeNames == "青海" || list_placeNames == "四川") {
            //     mapCenter(provinces_centerlnglat, 5);
            // } else {
            //     mapCenter(provinces_centerlnglat, 7);
            // }

            //省份边界线
            provincesPaths(provinces_index_data.b);
            //城市列表hover
            cityFn(data_type, provinces_index_data, city_latlng_array,get_zoom);
            hovercityMap(data_type, provinces_index_data, city_latlng_array);

        }
    };
    //我想去 显示该城市周边城市
    function go_city() {
        $(".city_r_main .list").each(function (i, name) {

            $(name).find(".go_button").click(function () {
                // console.log($(this))
                show_surlist($(this), name)
            });

        });
    };

    function show_surlist($this, name) {
        //出发城市返回城市icon
        dep_return_marker()
        
        var $name = $this.parents("li");
        //我想去 传后台数据
        var post_data = {}
        post_data.lat = Number($name.attr("data-lat"));
        post_data.lng = Number($name.attr("data-lng"));
        post_data.city_id = $name.find(".city_introduce").attr("data-cityid");
        post_data.province_id = $name.find(".city_introduce").attr("data-provinceid");
        post_data.day_num = $(".num_day").html();
        post_data.city_day_num = $name.find(".r_daynum").html();
        //动画
        addflyer(name, $this)
        sur_show()
        //添加我想去的城市icon
        var first_click_marker = new google.maps.LatLng(post_data.lat, post_data.lng);
        var first_click_name = $name.find(".city_name").html();
        surClickmarker(first_click_marker, first_click_name);

        //添加我想去的城市数据存储
        var firstiD = {
            city_id: post_data.city_id,
            province_id: post_data.province_id
        }
        var city_Introduction = $name.find(".jsi_data").attr("data-city_Introduction");
        var clist_placeNames = $name.find(".js_prename").text();
        addsurCity(name, clist_placeNames, city_Introduction, first_click_marker, firstiD);
       
        post_surList(post_data)
    }
    //周边城市显隐
    function sur_show(){
        $(".city_r_main").hide();
        $(".surrounding_city_r_main").show();
        $(".city_r_top").hide();
        $(".addcity_r_top").show();
        $(".people_num").hide();
        $(".f_prompt").hide();
        $(".f_main_bg").hide();
        $(".f_main_next").show();
        $(".text_logo_bgc").show();
        $(".search_content").hide();
        browserRedirect();
        $(".sur_del").hide().siblings(".search_icon").show();
        //清空地图省份边界线和城市高亮
        city_polygon_path.setMap(null);
        for (var b = 0; b < city_paths_arry.length; b++) {
            city_paths_arry[b].setMap(null)
        };
    }
    //请求周边城市列表
    function post_surList(post_data) {
        $.ajax({
            url: allUrl.aroundCity,
            type: "post",
            dataType: "json",
            data: post_data,
            success: function (sur_data) {
                // console.log(sur_data);
                //渲染周边城市
                surroundingCitytemplate(sur_data, "sur");
                // $(".sur_this_city").html($(name).find(".city_name").html());


                //周边城市遍历 我想去 hover 显示icon
                sur_hoverli(sur_data,'sur')

            }
        });
    }

    //周边城市详情
    $(".surrounding_city_r_main ").on("click", ".list .city_introduce,.list_l", function () {
        cityInfofn($(this))
    });

    // 清空出发城市返回城市 自定义窗口
    function infoDepReturn_del() {
        $(".infoBox .info").each(function (a, b) {
            if ($(b).text()==='出发城市') {
                $(".info").eq(a).parents(".infoBox").remove().html("")
            }
            if ($(b).text()==='返回城市') {
                $(".info").eq(a).parents(".infoBox").remove().html("")
            }
        })
    };

    //出发城市返回城市icon
    function dep_return_marker() {
        //添加 出发城市icon和 返回城市icon
        var departure_city_name = $(".departure_city").html();
        var return_city_name = $(".return_city").html();

        var geocoder = new google.maps.Geocoder();
        if (departure_city_name == return_city_name) {
            infoDepReturn_del();
            //-------出发城市和返回城市一样
            geocoder.geocode({
                'address': departure_city_name
            }, function (results, status) {
                if (status === 'OK') {
                    departure_pos = {
                        lat: results[0].geometry.location.lat(),
                        lng: results[0].geometry.location.lng()
                    };
                    return_pos = {
                        lat: results[0].geometry.location.lat(),
                        lng: results[0].geometry.location.lng()
                    };
                    
                    // map.setCenter(results[0].geometry.location);//中心点
                    var departure_marker = new google.maps.Marker({
                        map: map,
                        position: results[0].geometry.location,
                        icon: "/static/v1/img/map/departureicon.png",
                    });
                    //定义信息窗口
                    styleInfowindow("出发城市", departure_marker, "departure_city")
                    depReturn_cityArray.push(departure_marker)
                } else {
                    alert('Geocode was not successful for the following reason: ' + status);
                }
            });
        } else {
            infoDepReturn_del();
            //-------出发城市
            geocoder.geocode({
                'address': departure_city_name
            }, function (results, status) {
                if (status === 'OK') {
                    // notSame_departure_marker.setMap(null)
                    departure_pos = {
                        lat: results[0].geometry.location.lat(),
                        lng: results[0].geometry.location.lng()
                    };
                    // map.setCenter(results[0].geometry.location);
                    var departure_marker = new google.maps.Marker({
                        map: map,
                        position: results[0].geometry.location,
                        icon: "/static/v1/img/map/departureicon.png",
                    });
                    //定义信息窗口
                    styleInfowindow("出发城市", departure_marker, "departure_city");
                    depReturn_cityArray.push(departure_marker)
                } else {
                    alert('Geocode was not successful for the following reason: ' + status);
                }
            });
            //-------返回城市
            geocoder.geocode({
                'address': return_city_name
            }, function (results, status) {
                if (status === 'OK') {
                    return_pos = {
                        lat: results[0].geometry.location.lat(),
                        lng: results[0].geometry.location.lng()
                    };
                    // map.setCenter(results[0].geometry.location);
                        var return_marker = new google.maps.Marker({
                        map: map,
                        position: results[0].geometry.location,
                        icon: "/static/v1/img/map/returnicon.png",
                    });
                    //定义信息窗口
                    styleInfowindow("返回城市", return_marker, "departure_city")
                    depReturn_cityArray.push(return_marker)
                } else {
                    alert('Geocode was not successful for the following reason: ' + status);
                }
            });
        };

    };
    //周边城市遍历 我想去 hover 显示icon
    function sur_hoverli(sur_data,is_search) {

        $(".js_surcity_li li").each(function (i, n) {
            // console.log(i)
            // console.log(sur_data.aroundcity_list[i])
            var lat = Number($(n).attr("data-lat")),
                lng = Number($(n).attr("data-lng"));
                
            // 显示周边城市icon
            var sur_city_position = new google.maps.LatLng(lat, lng);
            if(i <= 1){
                map.setCenter(sur_city_position,6)
            }
            // var sur_city_names = $(".js_surcity_li li").eq(i).find(".city_name").html();
            // surCitymarker(sur_city_position, sur_city_names);
            //我想去
            $(n).on("click", ".go_button", function () {
                browserRedirect()
                $('.is_phone_down').click(function () {
                    $(".is_phone").hide();
                })
                if (!$(n).hasClass("city_list_go")) {
                    var click_lat = Number($(".js_surcity_li li").eq(i).attr("data-lat")),
                        click_lng = Number($(".js_surcity_li li").eq(i).attr("data-lng"));
                    var click_city_position = new google.maps.LatLng(click_lat, click_lng);
                    map.setCenter({lat:click_lat,lng:click_lng}, 6);
                    var cityID = $(".js_surcity_li li").eq(i).attr("data-cityId");
                    var proviceID = $(".js_surcity_li li").eq(i).attr("data-provinceId");
                    var iD = {
                        city_id: cityID,
                        province_id: proviceID
                    }
                    // sur_city_markers[i].setMap(null);
                    var this_sur_city_name = $(n).find(".city_name").html();
                    var this_provinceName = $(n).find(".js_prename").html();
                    surClickmarker(click_city_position, this_sur_city_name);
                    var surcity_Introduction = $(n).find(".js_idata").attr("data-city_Introduction")
                    addsurCity(n, this_provinceName, surcity_Introduction, click_city_position, iD, sur_data);
                    addflyer(n, $(this));

                }
                $(n).find(".go_button").addClass("go_button_gray").html("已添加");
                $(n).find(".top_box").addClass("add_top_box");
                $(n).addClass("city_list_go");

            });
            //hover周边城市
            $(n).hover(function () {
                if (!$(n).hasClass("city_list_go")) {
                    var lat = Number($(".js_surcity_li li").eq(i).attr("data-lat")),
                        lng = Number($(".js_surcity_li li").eq(i).attr("data-lng"))
                    var sur_city_position = new google.maps.LatLng(lat, lng);
                    var sur_city_name = $(n).find(".city_name").html();
                    hoversurCitymarker(sur_city_position, sur_city_name);
                    if(is_search == "search"){
                        if(i <= 1){
                            map.setCenter(sur_city_position,6)
                        }
                    }
                    // map.setZoom(6)
                }
            }, function () {
                clearHoverMarker(hover_sur_city_markers);
            })
        })
    }


    //添加我想去的城市
    function addsurCity(name, provinceNames, city_Introduction, position, iD, sur_data) {

        // console.log(city_Introduction)
        // console.log(sur_data)
        // $(".city_box").removeClass("dis_none");
        //存储我想去的城市
        var go_city_obj = {};
        go_city_obj.city_name = $(name).find(".city_name").html();
        go_city_obj.city_py = $(name).find(".city_py").html();
        go_city_obj.city_daynum = Number($(name).find(".r_daynum").html());
        go_city_obj.this_index = $(name).index();
        go_city_obj.position = {
            lat: position.lat(),
            lng: position.lng()
        };
    
        go_city_obj.city_id = iD.city_id;
        go_city_obj.province_id = iD.province_id
        go_city_obj.provinceNames = provinceNames;
        go_city_obj.city_Introduction = city_Introduction;

        var obj_addciy = {}
        if(sessionStorage.is_City_data == undefined){
            go_city_array.push(go_city_obj);
            obj_addciy.addcitylist = go_city_array
        }else{
            _back_go_city_array.push(go_city_obj);
            obj_addciy.addcitylist = _back_go_city_array
        }

        addcity_template(obj_addciy, sur_data);


    }
    //渲染我添加想去的城市
    function addcity_template(obj_addciy, sur_data) {
        $(".city_box").removeClass("dis_none");
        // console.log(obj_addciy)
        // console.log(sur_data)
        var l_addcitytemplate = '<ul>\
                                {{each addcitylist as value i}}\
                                <li class="clearfix" data-lat={{value.position.lat}} data-lng={{value.position.lng}}>\
                                    <div class="city_list_l">\
                                        <p>\
                                            <span class="city_list_name">{{value.city_name}}</span>\
                                            <i class="delete_icon" ></i>\
                                        </p>\
                                        <p class="city_py">{{value.city_py}}</p>\
                                    </div>\
                                    <div class="city_list_r">\
                                        <p class="day_num">适玩{{value.city_daynum}}天</p>\
                                        <div>\
                                            <i class="reduce_icon all_icon"></i>\
                                            <span class="cor daynum">{{value.city_daynum}}</span>\
                                            <span class="cor">天</span>\
                                            <i class="add_icon all_icon"></i>\
                                        </div>\
                                    </div>\
                                    <i class="set_data dis_none" data-provinceNames={{value.provinceNames}} data-province_id={{value.province_id}} data-city_id={{value.city_id}}></i>\
                                </li>\
                                {{/each}}\
                            </ul>';
        var l_addcity_render = template.compile(l_addcitytemplate);
        var l_addcity_html = l_addcity_render(obj_addciy)
        $(".city_box").html(l_addcity_html);



        $(".city_box li").each(function (i, n) {

            // 删除icon显示
            if (obj_addciy.addcitylist.length == 1) {
                $(".city_box li").eq(0).find(".delete_icon").removeClass("delete_icon_none");
                $(".visitors_lef").fadeOut();
                if (localStorage.visitors_firstcity_time == undefined) {
                    $(".visitors_firstcity").fadeIn().find(".visitors_firstcity_name").html($(".city_box li").eq(0).find(".city_list_name").html());
                    $(".visitors_firstcity").on("click", ".visitors_end", function () {
                        $(".visitors_firstcity").fadeOut();
                        var visitors_firstcity_time = new Date();
                        visitors_firstcity_time = new Date(visitors_firstcity_time.getYear() + 1900, visitors_firstcity_time.getMonth(), visitors_firstcity_time.getDate());
                        visitors_firstcity_time.setDate(visitors_firstcity_time.getDate() + 3);
                        localStorage.setItem("visitors_firstcity_time", visitors_firstcity_time);
                    });
                };
                var get_visitors_firstcity_time = localStorage.visitors_firstcity_time
                if (new_date == get_visitors_firstcity_time) {
                    localStorage.removeItem("visitors_firstcity_time");
                }
            } else if (obj_addciy.addcitylist.length >= 2) {
                $(".city_box li").eq(0).find(".delete_icon").addClass("delete_icon_none");
                if (localStorage.visitors_lef_time == undefined) {
                    $(".visitors_lef").fadeIn();
                    $(".visitors_firstcity").fadeOut();
                    $(".visitors_lef").on("click", ".visitors_end", function () {
                        $(".visitors_lef").fadeOut();
                        $(".visitors_firstcity").fadeOut();
                        var visitors_lef_time = new Date();
                        visitors_lef_time = new Date(visitors_lef_time.getYear() + 1900, visitors_lef_time.getMonth(), visitors_lef_time.getDate());
                        visitors_lef_time.setDate(visitors_lef_time.getDate() + 3);
                        localStorage.setItem("visitors_lef_time", visitors_lef_time);
                    });
                }
                var get_visitors_lef_time = localStorage.visitors_lef_time;
                if (new_date == get_visitors_lef_time) {
                    localStorage.removeItem("visitors_lef_time");
                }
            }
            //试玩玩天数加  减
            $(n).on("click", ".reduce_icon", function () {
                var day_mun = Number($(n).find(".daynum").html());
                day_mun--
                if (day_mun <= 1) {
                    day_mun = 1
                }
                $(n).find(".daynum").html(day_mun);
                obj_addciy.addcitylist[i].city_daynum = day_mun
            });
            $(n).on("click", ".add_icon", function () {
                var day_mun = Number($(n).find(".daynum").html());
                day_mun++
                if(Number($('.num_day').html()) ==30){
                    if($('.beyond_day_num').html()==''){
                        return
                    }
                }
                // console.log(day_mun)
                $(n).find(".daynum").html(day_mun);
                obj_addciy.addcitylist[i].city_daynum = day_mun
                
            });

            //删除
            $(n).on("click", ".delete_icon", function () {
                obj_addciy.addcitylist.splice(i, 1);
                // post_city_array.splice(i, 1);//传给后台的数据
                var new_obj_addciy = {
                    addcitylist: obj_addciy.addcitylist
                };
                if (obj_addciy.addcitylist == "") {
                    sessionStorage.removeItem('is_City_data')
                    window.location.reload()
                    // sessionStorage.is_City_data == undefined? window.location.reload(): getProvinces();
                   
                }


                var del_name = $(n).find(".city_list_name").html();
                if ($(n).index() > 0) {
                    $(".surrounding_city_r_main .list").each(function (g, c) {
                        if (del_name == $(c).find(".city_name").html()) {
                            // console.log(i)
                            $(".surrounding_city_r_main .list").eq(g).removeClass("city_list_go");
                            $(".surrounding_city_r_main .list").eq(g).find(".go_button").removeClass("go_button_gray").html("我想去");
                            $(".surrounding_city_r_main .list").eq(g).find(".top_box").removeClass("add_top_box");
                        }
                    });

                }

                //移除选中的icon
                sur_clickCity_markers[i].setMap(null);
                // click_ib.open(null,sur_clickCity_markers[i])
                $(".info").each(function (a, b) {
                    if (del_name == $(b).text()) {
                        $(".info").eq(a).parents(".infoBox").remove().html("")
                    }
                })

                sur_clickCity_markers.splice(i, 1)

                //添加 移除后icon 高亮
                // var sur_city_index = $(n).attr("data-beforein");
                // if (sur_city_index !== undefined) {
                //     // console.log(sur_city_lat = sur_data.aroundcity_list[sur_city_index])
                //     var sur_city_lat = $(".js_surcity_li li").eq(sur_city_index).attr("data-lat"),
                //         sur_city_lng = $(".js_surcity_li li").eq(sur_city_index).attr("data-lng"),
                //         sur_city_position = new google.maps.LatLng(sur_city_lat, sur_city_lng);
                //     var sur_city_name = $(n).find(".city_list_name").html();
                //     // sur_city_markers[sur_city_index].setMap(map);
                // };

                //从新渲染删除后我想去城市
                addcity_template(new_obj_addciy, sur_data);

                //试玩天数加减
                var isfirst = $(n).index() > 0 ? "sur" : "first";
                fortableDaynum(isfirst);



            });


        });
    };

    //适玩天数 加减
    //我想去
    $(".r_main").on("click", ".go_button", function () {
        fortableDaynum("first")
    })
    //加减
    $(".city_box").on("click", "i.all_icon", function () {
        fortableDaynum("sur")
    });




    //适玩天数
    var lineDay;

    function fortableDaynum(isfirst) {
        var go_total_dayNum = 0

        $(".city_box li").each(function (i, n) {
            go_total_dayNum += Number($(n).find(".daynum").html())
        });

        //行程天数
        var travel_days = Number($(".num_day").html());
        var percentage = go_total_dayNum / travel_days * 100;
        lineDay = travel_days - go_total_dayNum

        // 进度条
        cityProgressbar(percentage);

        if (lineDay > 0) {
            //剩余天数
            var rem_day_num = lineDay;
            if (!$(".city_box").hasClass("dis_none")) {
                $(".beyond_day_num").html("剩余 " + rem_day_num + " 天").show();
            };

            var post_data = {
                city_day_num: go_total_dayNum,
                day_num: travel_days,
                lat: Number($(".city_box li").eq(0).attr("data-lat")),
                lng: Number($(".city_box li").eq(0).attr("data-lng")),
                province_id: $(".city_box li").eq(0).find(".set_data").attr("data-province_id"),
                city_id: $(".city_box li").eq(0).find(".set_data").attr("data-city_id")
            };
            if (isfirst != "first") {
                post_surList(post_data)
            }
            $(".sj_icon").show()
            return
        }
        if (lineDay < 0) {
            //超出适玩天数
            var beyond_day_num = go_total_dayNum - travel_days;
            $(".beyond_day_num").html("超出 " + beyond_day_num + " 天").show();
            $(".city_box .add_icon").css({
                "background-image": "url('/static/v1/img/map/add_red.png')"
            })
            $(".city_box .reduce_icon").css({
                "background-image": "url('/static/v1/img/map/reduce_red.png')"
            });
            $(".sj_icon").show()
            return
        }
        if (lineDay == 0) {
            // $(".sj_icon").fadeOut();
            $(".beyond_day_num").hide().html('');
            $(".city_box .add_icon").css({
                "background-image": "url('/static/v1/img/map/add.png')"
            })
            $(".city_box .reduce_icon").css({
                "background-image": "url('/static/v1/img/map/reduce.png')"
            });
            return
        };

        return
    };

    // 下一步超出行程天数 button
    function goButtonNext() {
        //行程天数加减
        $(".f_top_p").on('click', ".addsj_icon", function () {
            var addsj_travel_days = Number($(".num_day").html());
            addsj_travel_days++
            // console.log(addsj_travel_days)
            if(addsj_travel_days>30) return
            $(".num_day").html(addsj_travel_days);
            $(".wap1_day_num").html(addsj_travel_days)
            fortableDaynum("sur")
            
        });
        $(".f_top_p").on('click', ".reducesj_icon", function () {
            var reducesj_travel_days = Number($(".num_day").html());
            reducesj_travel_days--
            if (reducesj_travel_days < 1)return 
            $(".num_day").html(reducesj_travel_days);
            $(".wap1_day_num").html(reducesj_travel_days)
            fortableDaynum("sur")
        });
        //我想去 下一步 button
        $(".f_main_next").click(function () {
            // console.log(111)
            var add_data = []
            sessionStorage.is_City_data == undefined? add_data = go_city_array : add_data = _back_go_city_array;
            if (add_data.length == 1 && parseInt(lineDay) > 0) {
                //提示框 一个城市
                cancelpromptFn()
                return
            } else if (add_data.length == 1 && parseInt(lineDay) < 0) {
                promptFn()
                return
            } else if (add_data.length > 1 && parseInt(lineDay) > 0 || parseInt(lineDay) < 0) {
                promptFn()
                return

            } else if (parseInt(lineDay) == 0) {
                //当前页面数据存储
                customLineSetData();

                return
            }
            


        });
    }
    goButtonNext();
    // 提示框天数不匹配
    function promptFn() {
        $(".prompt_text").html("您的游玩天数与行程天数不匹配，请修改行程天数");
        $(".prompt_b").fadeIn();
        //确定
        $(".prompt_but").on("click", function () {
            //行程天数加减
            $(".sj_icon").fadeIn();
            //适玩天数加减
            $(".city_box .add_icon").css({
                "background-image": "url('/static/v1/img/map/add_red.png')"
            });
            $(".city_box .reduce_icon").css({
                "background-image": "url('/static/v1/img/map/reduce_red.png')"
            });
            $(".prompt_b").fadeOut();
        })
    };
    //提示框 当前一个城市 剩余天数
    function cancelpromptFn() {
        var first_addgo_cityname = $(".city_box li").eq(0).find(".city_list_name").html();
        //提示框 天数不匹配
        $(".cancel_prompt_text").html("您确定只想在" + first_addgo_cityname + "一地游玩" + Number($(".num_day").html()) + "天吗？");
        $(".prompt_c").fadeIn();

        //取消
        $(".prompt_cancel").on("click", function () {
            $(".prompt_c").fadeOut();
            $(".sj_icon").show();
        });

    }
    //提示框 当前一个城市 剩余天数 确定
    $(".prompt_det").on("click", function () {
        customLineSetData();
        $(".prompt_c").fadeOut();
    });
    //当前页面数据存储
    function customLineSetData() {
        //最后数据存储
        var traffic = $(".wap2_traffic").html();
        customLine_obj.custom_title = $("#custom_title").val(); //行程单标题
        customLine_obj.traffic_tools = traffic; //出行方式
        customLine_obj.adult = $(".wap2_adult_num").html(); //成人数量
        customLine_obj.children = $(".wap2_childrent_num").html(); //儿童数量
        customLine_obj.day_num = $(".wap1_day_num").html(); //出行天数
        customLine_obj.date = $("#wap3_date").val(); //出行日期
        customLine_obj.departure_latlng = departure_pos; //出发城市经纬度
        customLine_obj.return_latlng = return_pos; //返回城市经纬度

        var add_data = []
        sessionStorage.is_City_data == undefined? add_data = go_city_array : add_data = _back_go_city_array;
        // //传给后台的数据
        for (var i = 0; i < add_data.length; i++) {
            delete add_data[i].this_index;
            if (add_data.length == 1) {
                add_data[0].city_daynum = $(".wap1_day_num").html();
            }
        }

        postData.traffic_tools = traffic;
        postData.departure_city = {
            city_name: $(".wap2 .start_name").html(),
            lat: departure_pos.lat,
            lng: departure_pos.lng
        }; //出发城市
        postData.return_city = {
            city_name: $(".wap2 .end_name").html(),
            lat: return_pos.lat,
            lng: return_pos.lng
        }; //返回城市
        postData.go_city_array = add_data; //我想去的城市数组
        // console.log(customLine_obj)
        // console.log(postData);
        $.ajax({
            url: "automatic",
            type: "POST",
            dataType: "json",
            data: postData,
            success: function (data) {
                // console.log(data)
                var return_city_data = data.return_city //返回城市数据
                customLine_obj.go_city_array = data.go_city_array; //我想去的城市数组
                customLine_obj.departure_city = data.departure_city.city_name; //出发城市
                customLine_obj.return_city = return_city_data.city_name; //返回城市
                customLine_obj.return_traffic = return_city_data;
                customLine_obj.return_traffic = {
                    dis: return_city_data.dis,
                    flightTime: return_city_data.flightTime,
                    trainTime: return_city_data.trainTime,
                    trafficTime: return_city_data.trafficTime //其他交通
                }; //返回城市交通方式
                // customLine_obj.last = data.last;//返程点(该功能后来取消)
                $.post("CitySession",customLine_obj,function(data){
                    if(data.status == 'ok'){
                        sessionStorage.setItem("is_City_data",'ok');
                        window.location.href = "/portal/map/travelItinerary.html"
                    }
                },'json')

                // var customLine_str = JSON.stringify(customLine_obj);
                // localStorage.setItem("form_data", customLine_str);
                // // console.log(customLine_obj)
                // window.location.href = "/portal/map/travelItinerary.html"
            }
        });


    }
    //进度条
    function cityProgressbar(percentage) {
        console.log(IEVersion()) 
            var isIE = IEVersion()
            var isbg;
            if(isIE !== -1){
                isbg = '-ms-'
            }else{
                isbg = '-webkit-'
            }
        $('#progressbar').LineProgressbar({
            percentage: percentage,
            fillBackgroundColor: percentage > 100 ? isbg+'linear-gradient(right,#ea3e3e,#659ff5)' : isbg+'linear-gradient(right,#c4dcff,#659ff5)',
            height: '10px',
            radius: '5px'
        });
    }
    cityProgressbar(0)
    //hover添加城市标记点
    function addCitymarker(location, city_name) {

        // console.log(location)
        var cityMarker = new google.maps.Marker({
            position: location,
            icon: "/static/v1/img/map/cityicon2.png",
            map: map

        });
        city_markers.push(cityMarker);


        styleInfowindow(city_name, cityMarker, "hover")

        google.maps.event.addListener(cityMarker, "click", function () {
            $(".city_r_main .list").each(function (i, name) {
                if ($(name).find(".city_name").html() == city_name) {
                    show_surlist($(name).find(".go_button"), name);
                    fortableDaynum("first")
                };

            });
        });


    };

    //清空城市hover标记点
    function clearcityMarker(city_markers) {
        for (var i = 0; i < city_markers.length; i++) {
            city_markers[i].setMap(null);
            ib.open(null, city_markers[i]);
        }
        city_markers = []
    }


    //显示周边城市标记点
    function surCitymarker(location, city_name) {
        // console.log(location)
        var cityMarker = new google.maps.Marker({
            position: location,
            icon: "/static/v1/img/map/cityicon1.png",
            map: map

        });
        sur_city_markers.push(cityMarker);

    };
    //hover周边城市显示该标记点
    function hoversurCitymarker(location, city_name) {
        // console.log(location)
        var hover_city_Marker = new google.maps.Marker({
            position: location,
            icon: "/static/v1/img/map/cityicon2.png",
            map: map
        });
        hover_sur_city_markers.push(hover_city_Marker);

        styleInfowindow(city_name, hover_city_Marker, "hover")
    };
    //清空hover周边城市显示该标记点
    function clearHoverMarker(hover_sur_city_markers) {
        // console.log(hover_sur_city_markers.length)
        // console.log("aaa")
        for (var i = 0; i < hover_sur_city_markers.length; i++) {
            hover_sur_city_markers[i].setMap(null);
            ib.open(null, hover_sur_city_markers[i]);
        }
        hover_sur_city_markers = []
    }
    //点击周边城市我想去的显示的icon
    function surClickmarker(location, city_name) {
        // console.log(location)
        var surClick_cityMarker = new google.maps.Marker({
            position: location,
            icon: "/static/v1/img/map/cityicon2.png",
            map: map

        });
        // clearcityMarker(city_markers)
        styleInfowindow(city_name, surClick_cityMarker, "click")
        sur_clickCity_markers.push(surClick_cityMarker);



    };
    //自定义Infowindow
    function styleInfowindow(name, marker, isclick) {
        var boxText = document.createElement("div");
        boxText.classList.add("info")
        boxText.innerHTML = name;
        $(".info_text_none").text(name)
        var info_width = $(".info_text_none").outerWidth(true);
        // console.log(info_width)
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


        if (isclick == "click") {
            // console.log(name)
            click_ib = new InfoBox(myOptions);
            click_ib.open(map, marker);
        } else if (isclick == "hover") {
            ib = new InfoBox(myOptions);
            ib.open(map, marker);
        } else {
            departure_ib = new InfoBox(myOptions);
            departure_ib.open(map, marker);
        }

    }





    //hover该省份的城市列表城市高亮
    function cityFn(data_type, city_index_data, city_latlng_array,get_zoom) {
        //城市hover，城市高亮
        $(".city_r_main .list").each(function (i, n) {
            var city_name;
            $(n).hover(function () {
                city_name = $(n).find(".city_name").html();
                thisCity(data_type, city_name, city_index_data, map);
                addCitymarker(city_latlng_array[i], city_name);
                // console.log(city_name)
                //获取该省份的城市=------------------------------------------------------------
                // map.setZoom(get_zoom)
            }, function () {

                city_name = $(n).find(".city_name").html();

                thisCity(data_type, city_name, city_index_data, null)
                clearcityMarker(city_markers);

            });
        })

    };

    //该省份的城市高亮
    function thisCity(data_type, city_name, city_index_data, map) {
        //获取该省份的城市数组
        var city_array = data_type == 1 ? city_index_data : city_index_data.cities;

        var city_index = data_type == 1 ? city_array : getArrIndex(city_array, {
            n: city_name
        });
        var this_city = data_type == 1 ? city_array : city_array[city_index];
        if (this_city != undefined) {
            provinces_paths(this_city.b, "#F00000", city_name, map);
        }

    }

    //省份和直辖市边界线
    function provincesPaths(latLngs) {
        // console.log(latLngs)
        //获取边界线的经纬度
        var city_paths = mapPaths(latLngs)
        // city_polygon_path = new google.maps.Polygon();
        city_polygon_path.setOptions(cityPolyOptions);
        city_polygon_path.setPaths(city_paths);
        city_polygon_path.setMap(map);
    };

    //省份详情
    $(".shut_down").click(function () {
        $(".province_details_popup_box .tab_content").eq(0).fadeIn();
        $(".city_details_popup_box .tab_content").eq(0).fadeIn()
        $(".details_popup_tab_active").css({
            left: 0
        });
        $(".details_popup_box").fadeOut();
    });



    //hover 省份 城市 详情 简介弹出
    function in_introduce(n) {
        $(n).hover(function () {
            // $(n).find(".in_introduce").removeClass("out_introduce");
            $(n).find(".in_introduce").stop(true).animate({
                top: 0,
                height: 120 + "px"
            }, 800, "swing");
        }, function () {
            $(n).find(".in_introduce").stop(true).animate({
                top: 160,
                height: 0 + "px"
            }, 800, "swing");
        })
    }


    //城市列表返回
    $(".back").on("click", function () {
        getProvinces();
    });


    //添加标记点
    function splitMarker(citydata_index_data, list_placeNames) {
        // var location =  splitLocation(citydata_index_data)
        var location = g_location(citydata_index_data)
        if (map !== null) {
            addmarker(location, list_placeNames);
        }

    };




    //citydata.json g 的值
    let g_location = function (citydata_json_g) {
        let citydata_json_g_location = citydata_json_g.g.substr(0, citydata_json_g.g.indexOf('|'));
        let citydata_g_lnglat = citydata_json_g_location.split(",");
        let location = {
            lat: parseFloat(citydata_g_lnglat[1]),
            lng: parseFloat(citydata_g_lnglat[0])
        };
        return location
    };

    //添加我想去的城市动画
    function addflyer(list, $this) {
        //添加城市的动画
        $(".u-flyer").eq(0).remove();
        var img_src = $(list).find(".list_l img").attr("src");
        var city_postion = $this.offset();
        var left = city_postion.left
        var top = city_postion.top;
        var end_postion = $(".js_endfly").eq(0).offset(),
            end_width = $(".js_endfly").width() / 2,
            end_height = $(".js_endfly").height() + 150;
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
    }
    function browserRedirect() {
        var sUserAgent = navigator.userAgent.toLowerCase();
        var bIsIpad = sUserAgent.match(/ipad/i) == "ipad";
        var bIsIphoneOs = sUserAgent.match(/iphone os/i) == "iphone os";
        var bIsMidp = sUserAgent.match(/midp/i) == "midp";
        var bIsUc7 = sUserAgent.match(/rv:1.2.3.4/i) == "rv:1.2.3.4";
        var bIsUc = sUserAgent.match(/ucweb/i) == "ucweb";
        var bIsAndroid = sUserAgent.match(/android/i) == "android";
        var bIsCE = sUserAgent.match(/windows ce/i) == "windows ce";
        var bIsWM = sUserAgent.match(/windows mobile/i) == "windows mobile";
       
        if (bIsIpad || bIsIphoneOs || bIsMidp || bIsUc7 || bIsUc || bIsAndroid || bIsCE || bIsWM) {
            //跳转移动端页面
            $(".is_phone").show();
        } 
        $('.is_phone_down').click(function () {
            $(".is_phone").hide();
        })
    }
    google.maps.event.addDomListener(window, "load", initMap);

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

})