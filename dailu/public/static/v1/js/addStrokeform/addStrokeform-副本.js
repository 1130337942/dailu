
$(function () {
    // if(window.name!="hasLoad"){      
    //     location.reload();      
    //     window.name = "hasLoad";      
    // }else{      
    //     window.name="";      
    // }  
    var form_data = {}
    sessionStorage.clear();
    $(".form_content").each(function (i, n) {
        $(n).on("click", function () {
            $(".form_bottom").stop(true).slideUp();
            $(n).next(".form_bottom").stop(true).slideToggle();
        })
    });
    //-----------出发时间
    $("#date_picker").val(getDate())
    $('#date_picker').datepicker({
        minDate: 0,
        dateFormat: "yy-mm-dd"
    });
    $("#date_picker").on("click", function () {
        $(".form_bottom").stop(true).slideUp()
    })

    //-----------交通工具
    $(".select_clas_box").each(function (i, n) {
        $(n).on("click", function () {
            $(n).addClass("hover_color").siblings().removeClass("hover_color");
            $(".det_name").html($(n).find("span").html());
            $(".form_bottom").stop(true).slideUp();
            $(n).find(".form_icon").addClass("tra_active"+i)
            if(i == 0){
                $(n).siblings().find(".form_icon").removeClass("tra_active1 tra_active2 tra_active3");
            }else if(i == 1){
                $(n).siblings().find(".form_icon").removeClass("tra_active0 tra_active2 tra_active3");
            }else if(i == 2){
                $(n).siblings().find(".form_icon").removeClass("tra_active0 tra_active1 tra_active3");
            }else {
                $(n).siblings().find(".form_icon").removeClass("tra_active0 tra_active1 tra_active2");
            }
        });
        // 
    });
    
    //确定
    $(".traffic_but_det").on("click", function () {
        $(".form_bottom").stop(true).slideUp();
    });
    //------------出行天数
    $(".input_day_num").on('keyup',function(){
        var v = Number($(this).val());
        if(v >= 30){
            $(this).val(30);
        }
    })
    $(".day_num .add_icon").on("click", function () {
        var day_num = Number($(".input_day_num").val());
        day_num++
        if (day_num >= 30) {
            day_num = 30
        }
        $(".input_day_num").val(day_num);
    })
    $(".day_num .under_icon").on("click", function () {
        var day_num = Number($(".input_day_num").val());
        day_num--
        if (day_num <= 1) {
            day_num = 1
        }
        $(".input_day_num").val(day_num);
    });

    //确定
    $(".daynum_but_det").on("click", function () {
        $(".change_daynum").removeClass("change_daynum_text corred").html($(".input_day_num").val());
        $(".day_num_text").html("&nbsp;天")
        $(".form_bottom").stop(true).slideUp();
    })
    //-----------出游人数
    $(".adult_box .add_icon").on("click", function (event) {
        var adult_num = Number($(".adult_num").val());
        adult_num++
        $(".adult_num").val(adult_num);
    });
    $(".adult_box .under_icon").on("click", function () {
        var adult_num = Number($(".adult_num").val());
        adult_num--
        if (adult_num <= 1) {
            adult_num = 1
        }
        $(".adult_num").val(adult_num);
    });

    $(".children_box .add_icon").on("click", function () {
        var children_num = Number($(".children_num").val());
        children_num++
        $(".children_num").val(children_num);
    });
    $(".children_box .under_icon").on("click", function () {
        var children_num = Number($(".children_num").val());
        children_num--
        if (children_num < 0) {
            children_num = 0
        }
        $(".children_num").val(children_num);
    });

    //确定
    $(".peoplenum_but_det").on("click", function () {
        $(".change_adult").html($(".adult_num").val());
        $(".change_children").html($(".children_num").val());
        $(".form_bottom").stop(true).slideUp();
    });

    $("#body_bg").on('click', function (e) {
        if ($(e.target).attr('data-click') == 'show') {
            $(this).parents(".form_bottom").show();
        } else {
            $(".form_bottom").stop(true).slideUp();
        }
    });

    $(".add_icon").hover(function(){
        $(this).attr("src","/static/common/img/add_b.png");
    },function(){
        $(this).attr("src","/static/common/img/add.png");
    });
    $(".under_icon").hover(function(){
        $(this).attr("src","/static/common/img/under_b.png")
    },function(){
        $(this).attr("src","/static/common/img/under.png");
    })

    //实例化城市查询类
    var citysearch = new AMap.CitySearch();
    //自动获取用户IP，返回当前城市
    citysearch.getLocalCity(function (status, result) {
        if (status === 'complete' && result.info === 'OK') {
            if (result && result.city && result.bounds) {
                var cityinfo = result.city;
                //地图显示当前城市
                var city_arry = cityinfo.split("市");
                var cityname = city_arry[0];
                $(".departurecity").html(cityname);
                $(".returncity").html(cityname);
                $(".departure_city").val(cityname);
                $(".return_city").val(cityname);
                $(".current_city_name").html(cityname);
            }
        } else {
            // console.log(result.info)
            $(".departurecity").html("北京");
            $(".returncity").html("北京");
            $(".departure_city").val("北京");
            $(".return_city").val("北京");
            $(".current_city_name").html("北京");
        }
    });

    //城市列表显示
    //出发城市
    $(".departure_box").on("click", function () {
        var city_name = $(".departure_city").val();
        $(".current_city_name").html(city_name);

        city_template(city_name, "departure_city");
    });
    //返回城市
    $(".return_box").on("click", function () {
        var city_name = $(".return_city").val();
        $(".current_city_name").html(city_name);

        city_template(city_name, "return_city");
    });
    //搜索
    var timer;
    $("#search_city").on('input propertychange', function () {
        $("#seach_list").fadeIn();
        $(".search_icon").addClass("searchdel")
        var city_name = $(this).val();
        // console.log(city_name);
        clearTimeout(timer)
        timer = setTimeout(function(){
            $.ajax({
                url: allUrl.search_formcity,
                type: "get",
                dataType: "json",
                data: {
                    city_name: city_name
                },
                success: function (data) {
                    // console.log(data)
                    if (data == null) {
                        $(".seach_list").html("<ul><li class='not_data'>未检索到相关信息</li></ul>")
                    } else {
                        var seach_list_template = '<ul>\
                                                {{each searchList as value i}}\
                                                <li>{{value.area_name}}</li>\
                                                {{/each}}\
                                              </ul>';
                        var seach_list_render = template.compile(seach_list_template);
                        var seach_list_html = seach_list_render(data);
                        if (data.searchList == "") {
                            $(".seach_list").html("<ul><li class='not_data'>未检索到相关信息</li></ul>")
                        } else {
                            $(".seach_list").html(seach_list_html)
                        }
                    }
    
                }
            })
        },500)
        
    });


    //取消搜索
    $(".seach_box").on("click", ".searchdel", function () {
        $(this).removeClass("searchdel");
        $("#search_city").val("")
        $("#seach_list").fadeOut();
    });
    //确定
    $(".city_but_det").on("click", function () {
        $(".departurecity").html($(".departure_city").val());
        $(".returncity").html($(".return_city").val());
        $(".form_bottom").stop(true).slideUp();
    })
    //tab切换
    //当前城市
    $(".current_city").on("click", function () {
        $(".other_city").removeClass("city_color").removeClass("city_list_bgcolor");
        $(this).addClass("city_color").addClass("city_list_bgcolor")
        $(".current_list").fadeIn();
        $(".other_list").fadeOut();
        $(".sfcity").html("");
    });
    //其他城市
    $(".other_city").on("click", function () {
        $(".current_city").removeClass("city_color").removeClass("city_list_bgcolor");
        $(this).addClass("city_color").addClass("city_list_bgcolor");
        $(".other_list").fadeIn();
        $(".current_list").fadeOut();
        $(".sfcity").html("");
        $.ajax({
            url: allUrl.otherSearchCity,
            type: "Get",
            dataType: "json",
            success: function (data) {
                // console.log(data);
                var zxs_template = '{{each Info.municipalitie as value i}}\
                                        <li>{{value.area_name}}</li>\
                                    {{/each}}';
                var zxs_render = template.compile(zxs_template);
                var zxs_html = zxs_render(data);
                $(".zxs_ul").html(zxs_html);

                var sf_template = '{{each Info.province as value i}}\
                                        <li data-sfid = "{{value.area_id}}">{{value.area_name}}</li>\
                                    {{/each}}';
                var sf_render = template.compile(sf_template);
                var sf_html = sf_render(data);
                $(".sf_ul").html(sf_html);


            }
        });

    });
    //
    $(".sf").on("click", ".sf_ul li", function () {
        $(".other_list").fadeOut();
        var province_id = $(this).data("sfid");
        $.ajax({
            url: allUrl.province_city,
            type: "Get",
            dataType: "json",
            data: {
                province_id: province_id
            },
            success: function (data) {
                // console.log(data)
                var sfcity_template = '<ul class="sfcity_ul clearfix">\
                                        {{each city as value i}}\
                                        <li>{{value.area_name}}</li>\
                                        {{/each}}\
                                    </ul>';
                var sfcity_render = template.compile(sfcity_template);
                var sfcity_html = sfcity_render(data);
                $(".sfcity").html(sfcity_html);
            }
        })
    });

    //隐藏
    $(".city_bottom").on("click", function () {
        $(".more_cities").fadeOut();
    })
    //马上出发
    $(".now_go").on("click", function () {
        $(".form_bottom").stop(true).slideUp();
        
        form_data.date = $(".form_input").val();
        form_data.traffic_tools = $(".det_name").html();
        form_data.day_num = $(".change_daynum").html();
        form_data.adult = $(".change_adult").html();
        form_data.children = $(".change_children").html();
        form_data.departure_city = $(".departurecity").html();
        form_data.return_city = $(".returncity").html();

        if (form_data.day_num == "选择出行天数") {
            $(".change_daynum_text").addClass("corred");
        } else {
            $.post("startData",form_data,function(data){
                if(data.status == "ok"){
                    sessionStorage.setItem("form_data", 'ok');
                    window.location.href = "/portal/map/customline.html";
                }
            },'json');
        }

    })


    $(".but_cancel").on("click", function () {
        $(".form_bottom").stop(true).slideUp();
    });



    //当前城市省份的城市数据模版渲染
    function city_template(city_name, this_city) {
        $(".more_cities").fadeIn();
        $(".other_city").removeClass("city_color").removeClass("city_list_bgcolor");
        $(".current_city").addClass("city_color").addClass("city_list_bgcolor")
        $(".current_list").fadeIn();
        $(".other_list").fadeOut();
        $(".sfcity").html("");
        $(".search_icon").removeClass("searchdel");
        $("#search_city").val("")
        $("#seach_list").fadeOut();

        $(".current_city_name").attr("data-this", this_city);

        $.ajax({
            url: allUrl.cityForm,
            type: "get",
            dataType: "json",
            data: {
                city_name: city_name
            },
            success: function (data) {
                // console.log(data);
                var city_template = '<ul class="clearfix">\
                                        {{each list as value i}}\
                                        <li>{{value.area_name}}</li>\
                                        {{/each}}\
                                    </ul>';
                var city_render = template.compile(city_template);
                var city_html = city_render(data);
                $(".current_list").html(city_html);

            }
        });





    };
    //出发城市 返回城市 改变input val()值
    $(".current_list").on("click", "li", function () {
        thisValfn(this)
        $(".form_bottom").stop(true).slideUp();
    });
    //
    $(".zxs").on("click", ".zxs_ul li", function () {
        thisValfn(this)
    });
    $(".sfcity").on("click", ".sfcity_ul li", function () {
        thisValfn(this)
    });
    //搜索
    $(".seach_list").on("click", "li:not('.not_data')", function () {
        thisValfn(this)
    })

    function thisValfn(n) {
        var this_attr = $(".current_city_name").attr("data-this");
        $(".current_city_name").html($(n).html());
        // console.log(this_attr)
        if (this_attr == "departure_city") {
            // console.log(111)
            $(".return_city").val($(n).html());
            $('.returncity').html($(n).html())
        }
        $("." + this_attr).val($(n).html());
        $('.departurecity').html($(n).html())
        $(".more_cities").fadeOut();
        // $(".city .form_bottom").show();
    }
})