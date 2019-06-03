var citypolyOptions;
var polyOptions_array = [];
var this_ciydata = {};
var hotelList = [];
var toReceiveHotelData = {};
var activeHotelPoint = [];
var thisCityIndex = getUrlParam('hotelcity');
var hotelMarkers = []
var haver_hotel_markers = [];
var add_data_arry = [];
var add_markers_arry = [];
var new_add_markers = [];
var start_index_hotel =1 ;
var icon_style = {};
var hover_icon_style = {};
var Dnum_arry = [];
var spot_polyline;
var hover_spot_polyline;
var get_url_cityI = getUrlParam("hotelcity");
var _day_path_arry = [];
var spot_num_array = [];
var hover_marker_array = [];
var bounds={'Longitude':'','Latitude':'','Radius':''};
var currentCity ;    
var lbsmap = new AMap.Map('container', {
        zoom: 10,
    });
    var lbsmarker = new AMap.Marker();
    var lbsinfoWindow = new AMap.InfoWindow({
        offset: new AMap.Pixel(0, -40)
    });
    var geocoder;    
$(function () {
    
    var mapFn = {
        initMap: function (data) {
            var this_city = data.city
            var get_position = data.list[thisCityIndex].position
            var center = {
                lat:parseFloat(get_position.lat),
                lng:parseFloat(get_position.lng)
            }
            map = new google.maps.Map(document.getElementById('map'), {
                // zoom: 9,
                gestureHandling: 'greedy',
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                scaleControl: true,
                streetViewControl: false,
                center: center
            });
            var provinceNames = this_city.province;
            var city_name = this_city.this_city;
            mapFn.mapPolyOptions(provinceNames, city_name)
        },
        mapChange:function(){ //10.12改
            google.maps.event.addListener(map,"idle",function(event){
                // bounds=[];
                var mapLatLngBounds = map.getBounds()
                var centerLat = map.getCenter().lat();
                var centerLng = map.getCenter().lng();
                var maxX = mapLatLngBounds.getNorthEast().lng();
                var maxY = mapLatLngBounds.getNorthEast().lat();
                var minX = mapLatLngBounds.getSouthWest().lng();
                var minY = mapLatLngBounds.getSouthWest().lat();
                var rad = parseInt(GetDistance (maxY, maxX, minY, maxX)/2*1000);
                bounds={'Longitude':centerLng,'Latitude':centerLat,'Radius':rad};
                // bounds = [{'lng':maxX,'lat':maxY},{'lng':maxX,'lat':minY},{'lng':minX,'lat':maxY},{'lng':minX,'lat':minY}] 四个点的经纬度
                debouncelimitHotel(bounds);  //地图改变大小 函数防抖
            });
        },
        mapPolyOptions: function (provinceName, cityName) {
            // console.log(provinceName,cityName)
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
                    var get_city_index = getArrIndex(cityData_cities, {
                        n: cityName
                    });
                    if(cityData_cities[get_city_index]){
                        var get_city_b = cityData_cities[get_city_index].b;
                        citypolyOptions(get_city_b);  
                        zoom = cityData_cities[get_city_index].z;  
                    }
                    /*var get_city_b = cityData_cities[get_city_index].b;
                    citypolyOptions(get_city_b);
*/
                } else {
                    if(cityData.municipalities[get_index]){
                        var zxs_b = cityData.municipalities[get_index].b
                        citypolyOptions(zxs_b);
                        zoom =  cityData.municipalities[get_index].sz;
                    }
                    
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
                citypolyOptions.setPaths(paths);
                citypolyOptions.setMap(map);
            };
        },
        hotelMarker: function (location, name) {
            var markers = new google.maps.Marker({
                position: location,
                icon: "/static/v1/img/map/hotel1.png",
                map: map
            });

            
            google.maps.event.addListener(markers, "mouseover",
                function () {
                    mapFn.styleInfowindow(name,markers)
                });
            google.maps.event.addListener(markers, "mouseout",
                function () {
                    ib.open(null,markers)
                });
            hotelMarkers.push(markers);
        },
        hover_listMarder: function (location, name) {
            var hover_markers = new google.maps.Marker({
                position: location,
                icon: "/static/v1/img/map/hotel2.png",
                map: map
            });
            haver_hotel_markers.push(hover_markers);
            mapFn.styleInfowindow(name,hover_markers)
        },
        addmarker: function (data) {
            add_data_arry = [];
            new_add_markers = []
            // console.log(data)
            for (var i = 0; i < data.length; i++) {
                var name = data[i].name;
                if (name != "") {
                    var lat = parseFloat(data[i].lat);
                    var lng = parseFloat(data[i].lng);
                    var position = {
                        lat: lat,
                        lng: lng,
                    };
                    add_data_arry.push({
                        position: position,
                        name: name
                    })

                };

            };
            // console.log(add_data_arry);
            for (var i = 0; i < add_data_arry.length; i++) {
                addmarkersFn(add_data_arry[i].position, add_data_arry[i].name)
            }
            // console.log(add_markers_arry)
            for (var i = 0; i < add_markers_arry.length; i++) {
                add_markers_arry[i].setMap(null);
            };
            for (var i = 0; i < new_add_markers.length; i++) {
                new_add_markers[i].setMap(map);
            }

            function addmarkersFn(position, name) {

                var add_markers = new google.maps.Marker({
                    position: position,
                    icon: "/static/v1/img/map/hotel2.png",
                });
                add_markers_arry.push(add_markers);
                new_add_markers.push(add_markers)

                google.maps.event.addListener(add_markers, "mouseover",
                    function () {
                        mapFn.styleInfowindow(name,add_markers)
                    });
                google.maps.event.addListener(add_markers, "mouseout",
                    function () {
                        ib.open(null,add_markers);
                    });
            }

        },
         //景点连线
        city_spot_polyFn: function (day_arry,Dnum_arry) {
            // console.log(day_arry)
            
            for (var i = 0; i < day_arry.length; i++) {
                var day_path_arry = [];
                var hover_sport_num = []
                if (day_arry[i].day != undefined) {
                    for (var a = 0; a < day_arry[i].day.length; a++) {

                        var lat = parseFloat(day_arry[i].day[a].this_lat);
                        var lng = parseFloat(day_arry[i].day[a].this_lng);
                        // console.log(lat)
                        var spot_pos = new google.maps.LatLng(lat, lng)
                        day_path_arry.push(spot_pos);
                        var spot_num = (a + 1).toString();
                        hover_sport_num.push(spot_num)
                        isGray(Dnum_arry[i], spot_num, a);
                        var this_name = day_arry[i].day[a].this_name;
                        mapFn.spotMarker(spot_pos, this_name,day_path_arry,Dnum_arry[i],i);
                    };
                    // console.log(spot_num_array)
                    spot_num_array.push(hover_sport_num);
                    _day_path_arry.push(day_path_arry);
                    mapFn.spotPolyline(day_path_arry);
                }

            };
            
            function isGray(Dnum, spot_num,a) {
                icon_style.color = "#b3b3b3";
                // console.log(a)
                if (a == 0) {
                    icon_style.url = "iconnum0";
                    icon_style.num = "D" + Dnum;
                    icon_style.point_left = 15;
                    icon_style.point_top = 17;
                } else {
                    icon_style.url = "spot_0";
                    icon_style.num = spot_num;
                    icon_style.point_left = 13;
                    icon_style.point_top = 14
                }
            }

        },
        spotMarker: function (location, name,day_path_arry,Dnum,i) {
            // console.log(spot_num)  
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
            // spot_markers_arry.push(markers);
            google.maps.event.addListener(markers, "mouseover",function () {
                // console.log(spot_num)  
                mapFn.hover_icon_blue(day_path_arry,Dnum,i,name);
            });
            google.maps.event.addListener(markers, "mouseout",function () {
            });
        },
        
        spotPolyline:function (path) {
            // console.log(path)
            spot_polyline = new google.maps.Polyline({
                path: path,
                //多线段
                geodesic: true,
                strokeColor: icon_style.color,
                strokeOpacity: 1.0,
                strokeWeight: 3.5,
            });
            spot_polyline.setMap(map);
            
        },
        hover_icon_blue:function(day_path_arry,Dnum,i,name){
            for(var a = 0;a < _day_path_arry[i].length;a++){
                // console.log(spot_num_array[i][a])
                var location = _day_path_arry[i][a];
                var hover_spotNum = spot_num_array[i][a];
                mapFn.hover_iconFn(location,Dnum,a,name,day_path_arry,hover_spotNum);
            }
        },
        hover_iconFn:function(location,Dnum,a,name,day_path_arry,hover_spotNum){
            
            hover_icon_style.color = "#7daff9";
            if (a == 0) {
                hover_icon_style.url = "iconnum1";
                hover_icon_style.num = "D" + Dnum;
                hover_icon_style.point_left = 15;
                hover_icon_style.point_top = 17;
            } else {
                hover_icon_style.url = "spot_1";
                hover_icon_style.num = hover_spotNum;
                hover_icon_style.point_left = 13;
                hover_icon_style.point_top = 14;
            }
            var hover_marker = new google.maps.Marker({
                position: location,
                icon: {
                    url: "/static/v1/img/map/" + hover_icon_style.url + ".png",
                    labelOrigin: new google.maps.Point(hover_icon_style.point_left, hover_icon_style.point_top),
                },
                map: map,
                label: {
                    text: hover_icon_style.num,
                    color: hover_icon_style.color,
                    fontWeight: "800",
                }
            });
            hover_marker_array.push(hover_marker)

            google.maps.event.addListener(hover_marker, "mouseover",function () {
                mapFn.styleInfowindow(name,hover_marker)
                hover_spot_polyline = new google.maps.Polyline({
                    path: day_path_arry,
                    //多线段
                    geodesic: true,
                    strokeColor:"#7daff9" ,
                    strokeOpacity: 1.0,
                    strokeWeight: 3.5,
                });
                hover_spot_polyline.setMap(map);
            });
            google.maps.event.addListener(hover_marker, "mouseout",function () {
                ib.open(null,hover_marker);
                mapFn.del_hover_blue()
            });
        },
        del_hover_blue:function(){
            hover_spot_polyline.setMap(null);
            for(var i = 0;i<hover_marker_array.length;i++){
                hover_marker_array[i].setMap(null);
            }
            hover_marker_array = []
            $(".infoBox").each(function (i, n) {
                $(".infoBox").eq(i).remove()
            })
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
            // var regExp = /,/;
            var pattern = new RegExp("[`~!@#$^&*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？%]");
            if(name.match(pattern) != null){
                $(".info_text_none").css("font-size", "14px")
            }else{
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
                disableAutoPan: false,
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
                $(this).remove();
            })
        }
    }
    var initFn = {
        initialization: function () { 
             
            //编辑城市跳转
            $(".editor_box").on("click", function () {
                window.location.href = "/portal/map/travelItinerary.html"
            });
            //表单保存
            $(".save").on("click", function () {
                $('.madeTravelMask').fadeOut();
            });
            var is_edit = sessionStorage.is_edit == 'ok'? true:false
            $.ajax({
                url: "hotelData",
                type: "post",
                data:{
                    'curr_index':thisCityIndex,
                    'is_edit':is_edit,
                    'is_plan_edit':sessionStorage.is_plan_edit=='ok'?'ok':''
                },
                dataType: "json",
                success: function (data) {
                    if (!data){
                        return false;
                    }else{
                        $(".loading_box").fadeOut();
                    }
                    currentCity = data.city;
                    lbsAmapFn();
                    initFn.plan(data.formData)
                    data.city.this_city = data.list[thisCityIndex].city_name;
                    data.curr_index = thisCityIndex;
                    google.maps.event.addDomListener(window, "load", mapFn.initMap(data));
                    
                    toReceiveHotelData = data;
                    this_ciydata = toReceiveHotelData.city;

                    var city_firstdaynum = Number(toReceiveHotelData.list[get_url_cityI].city_d_1);
                    var day_arry_len = this_ciydata.day_arry.length;
                    for(var i = 0;i < day_arry_len;i++){
                        Dnum_arry.push(city_firstdaynum++)
                    }
                    mapFn.city_spot_polyFn(this_ciydata.day_arry,Dnum_arry);
                    //获取酒店数据
                    $(this_ciydata.day_arry).each(function () {
                        var temp = {
                            lat: '',
                            lng: '',
                            name: ''
                        };
                        $(this).start_index_hotel = start_index_hotel;
                        activeHotelPoint.push(temp);
                    })
                    $(toReceiveHotelData.list).each(function (i, ele) {

                        if (this_ciydata.this_city == this.city_name) {
                            if (i > 0) {
                                var prevCity = {};
                                var lastIndex = toReceiveHotelData.list[(i - 1)].hotel.length-1;
                                prevCity.date = toReceiveHotelData.list[(i - 1)].city_time_2
                                prevCity.hotel = toReceiveHotelData.list[(i - 1)].hotel[lastIndex];
                                this_ciydata.day_arry.unshift(prevCity)
                            }
                            this_ciydata.arrival_date = this.date1;
                            this_ciydata.departure_date = this.date2;
                            if(this_ciydata.arrival_date == this_ciydata.departure_date) {
                               this_ciydata.departure_date =  Zxq_Adddate(this_ciydata.departure_date,1)
                            }
                            return false;
                        }

                    })

                    templateFn.leftTop_city(data.head);
                    templateFn.allTripTem(data.city)
                    // console.log(data.city)
                    $(this_ciydata.day_arry).each(function(i,ele){
                        this.start_index_hotel = start_index_hotel+i;
                    })
                    // console.log(this_ciydata)
                    var query = {};
                    query.arrival_date = this_ciydata.arrival_date;
                    query.departure_date = this_ciydata.departure_date;
                    query.city = this_ciydata.this_city + '市';
                    query.page = 1;
                    query.page_size = 20;
                    query.post = true;
                    query.map_post = true;
                    $.post("../store/hotel", query, function (res) {
                        $('.con_rig .no_hotelbox').hide()
                        if (!res.count){
                            $('.hotel_box').html('')
                            $('.con_rig .no_hotelbox').show()
                            $("#pagination").hide()
                            return false;
                        }
                        hotelList = res.hotel;
                        var hotelListRender = template.compile(holtelistTemplate);
                        var html = hotelListRender(res);
                        $('.hotelBox .hotel_box').html(html)
                        var hotelCheckRender = template.compile(hotelCheck);
                        var html1 = hotelCheckRender(this_ciydata);
                        $('.hotelBox .hotel_box .msg_box ul').html(html1)
                        setPagination(res.count);
                        initFn.MarkerFn(hotelList);
                        initFn.hover_hotel();
                        mapFn.mapChange();
                    }, 'json')

                }
            });
            
        },
        plan:function (data) {
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
        },
        MarkerFn: function (data) {
            return false;  //若显示每个酒店的icon 删掉此行即可
            mapFn.del_hover_marker(hotelMarkers) 
            for (var i = 0; i < data.length; i++) {
                var lat = parseFloat(data[i].Detail.Latitude);
                var lng = parseFloat(data[i].Detail.Longitude);
                var hotelName = data[i].Detail.HotelName;
                var location = {
                    lat: lat,
                    lng: lng
                }
                //显示每个酒店的icon
                mapFn.hotelMarker(location, hotelName);
            }

        },
        hover_hotel: function () {
            $(".hotelBox li").hover(function () {
                var lat = parseFloat($(this).attr("lat"));
                var lng = parseFloat($(this).attr("lng"));
                var hotelName = $(this).find(".name").html();
                var hover_location = {
                    lat: lat,
                    lng: lng
                }
                mapFn.hover_listMarder(hover_location, hotelName);
            }, function () {
                mapFn.del_hover_marker(haver_hotel_markers)
            })



        },
        //完成
        arrangeSchedule: function () {
            $(".f_main_next").on("click", function () {
                toReceiveHotelData.city = this_ciydata;
                var hotel_num = 0;
                $('.f_main_sc .hotel_name').each(function(i,ele){
                    if($(this).html()!=''){
                        hotel_num++;
                    }
                })
                toReceiveHotelData.city.hotel_num = hotel_num;
                $(toReceiveHotelData.list).each(function (i, ele) {
                    var that = this;
                    if (toReceiveHotelData.city.this_city == this.city_name) {
                        if (i > 0) {
                            for (var k = 0; k < that.hotel.length - 1; k++) {
                                // console.log(this_ciydata.day_arry)
                                that.hotel[k] = this_ciydata.day_arry[k + 1].hotel;
                            }
                            var prexLsatindex = toReceiveHotelData.list[i - 1].hotel.length - 1;
                            toReceiveHotelData.list[i - 1].hotel[prexLsatindex] = this_ciydata.day_arry[0].hotel;
                            var item = toReceiveHotelData.city.day_arry.shift();
                            toReceiveHotelData.city.prevHotel = item;
                        } else {
                            $(that.hotel).each(function (k, ele) {
                                if (k < that.hotel.length - 1) {
                                    that.hotel[k] = this_ciydata.day_arry[k].hotel;
                                }
                            })
                        }
                        return false;
                    };
                });

                 var post_formData = {};
                 post_formData.adult = $(".cartBox").find(".wap2_adult_num").html();
                 post_formData.children = $(".cartBox").find(".wap2_childrent_num").html();
                 post_formData.custom_title = $(".cartBox").find("#custom_title").val();
                 
                 post_formData.date = $(".cartBox").find("#wap3_date").val();
                 post_formData.day_num =$(".cartBox").find(".wap1_day_num").html();
                 post_formData.departure_city = $(".cartBox").find(".start_name").html();
                 post_formData.return_city = $(".cartBox").find(".end_name").html();
                 post_formData.traffic_tools = $(".cartBox").find(".wap2_traffic").html()
                
                toReceiveHotelData.formData = post_formData;
                var is_edit = sessionStorage.is_edit == 'ok'? true:false
                toReceiveHotelData.is_edit = is_edit
                // console.log(toReceiveHotelData)
                // 
                $.ajax({
                    url:'receiveHotel',
                    dataType:'json',
                    type:'post',
                    contentType:"application/json;charset=utf-8",
                    data:JSON.stringify(toReceiveHotelData), 
                    success:function(res){
                        if (res.status == 1) {
                            var noindexArray = []
                            var haveindexArray = [];
                            var have_index = toReceiveHotelData.index;
                            for (var i = 0; i < have_index.length; i++) {
                                if (have_index[i].toString() == '') {
                                    noindexArray.push(i);
                                } else {
                                    haveindexArray.push(i);
                                }
                            };
                        // console.log(noindexArray[0])
                        var tI = noindexArray[0];
                        var havI = haveindexArray.toString();
                        if(toReceiveHotelData.list.length == 1){
                            window.location.href = "/portal/scenerymap/tripOverview.html?hotel="+thisCityIndex;
                        }else{
                            if(noindexArray != ""){
                                // sessionStorage.removeItem('is_edit')
                                window.location.href = "/portal/scenerymap/cityAttractions.html?tI=" + tI + "&havI=" + havI;
                            }else{
                                window.location.href = "/portal/scenerymap/tripOverview.html?hotel="+thisCityIndex;
                            }

                        }
                        
                    }
                }
            })
               /* $.post('receiveHotel', toReceiveHotelData, function (res) {
                    if (res.status == 1) {
                        var noindexArray = []
                        var haveindexArray = [];
                        var have_index = toReceiveHotelData.index;
                        for (var i = 0; i < have_index.length; i++) {
                            if (have_index[i] == '') {
                                noindexArray.push(i);
                            } else {
                                haveindexArray.push(i);
                            }
                        };
                        // console.log(noindexArray[0])
                        var tI = noindexArray[0];
                        var havI = haveindexArray.toString();
                        if(toReceiveHotelData.list.length == 1){
                            window.location.href = "/portal/scenerymap/tripOverview.html?hotel="+thisCityIndex;
                        }else{
                            if(noindexArray != ""){
                                // sessionStorage.removeItem('is_edit')
                                window.location.href = "/portal/scenerymap/cityAttractions.html?tI=" + tI + "&havI=" + havI;
                            }else{
                                window.location.href = "/portal/scenerymap/tripOverview.html?hotel="+thisCityIndex;
                            }
                           
                        }
                        
                    }
                }, 'json');*/


            });
        },
        morePictures: function (spot_data) {
            // console.log(spot_data)
            $(".swiper-wrapper").removeAttr("style")
            $(".gallery-thumbs").html("");
            $(".gallery-top").html("");
            var img_data = spot_data.highImage;
            var img_length = img_data.length;
            // console.log(img_data)
            $(".content_name").html(spot_data.Detail.HotelName);
            $(".content_p").html(spot_data.Detail.Features);

            var img_top_tem = '<div class="swiper-wrapper">\
                                    {{each highImage as value i}}\
                                    <div class="swiper-slide" style="background-image:url({{value}})"></div>\
                                    {{/each}}\
                                </div>\
                                <div class="img_text_box"><div class="swiper-pagination"></div></div>';
            var img_top_render = template.compile(img_top_tem);
            var img_top_html = img_top_render(spot_data);
            $(".gallery-top").html(img_top_html);

            var img_thumbs_tem = '<div class="swiper-wrapper">\
                                    {{each highImage as value i}}\
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
         //新增酒店
        sportSearch: function () {
                $('.retrieval_but').on('click',function(){
                    $('.new_spot_box').show();

                })
                 $('.new_spot_box .ret_cancel').on('click',function(){
                     $('.new_spot_box').hide();
                 })
                $('.new_spot_box .ret_save').on('click',function(){
                    var dateTrue =  true;
                    var newHotel = {};
                        newHotel.BusinessZoneName= '';
                        newHotel.LowRate= parseInt($('.new_spot_box .input_price').val())?parseInt($('.new_spot_box .input_price').val()):0;
                        newHotel.ThumbNailUrl= $('.new_spot_box .address_cover').attr('src');
                        newHotel.address= $('.new_spot_box .input_address').val();
                        newHotel.hotel_name= $('.new_spot_box .input_name').val();
                        newHotel.lat= $('.new_spot_box .input_address').attr('data-address_lat');
                        newHotel.lng= $('.new_spot_box .input_address').attr('data-address_lng');
                        newHotel.tel= '';
                        newHotel.arrivalDate= $('.new_spot_box .input_date').val();
                        newHotel.Features = '';
                        newHotel.hotel_id =''
                        newHotel.city ='';
                        newHotel.city_id =this_ciydata.city_id;
                        newHotel.StarRate ='';
                        for(var key in newHotel){
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
                                    return false;
                                    break;
                                }
                            }
                        }

                        $(this_ciydata.day_arry).each(function(i,ele){ //判断住店日期是否正确
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
                            $(this_ciydata.day_arry).each(function(i,ele){ //匹配新增的是哪天的酒店
                                if(newHotel.arrivalDate.replace(/-/g,'.').indexOf(this.date)!=-1){
                                    activeHotelPoint[i] = temp;
                                    mapFn.addmarker(activeHotelPoint);
                                    this_ciydata.day_arry[i].hotel = newHotel;
                                    templateFn.allTripTem(this_ciydata);   
                                }

                            })
                            $('.add_address_img').find('span').html("上传封面")
                            $('.new_spot_box input').val('');
                            $('.new_spot_box .input_address').attr('readonly','readonly');
                            $('.new_spot_box .address_cover').attr('src','');
                            $('.new_spot_box').hide();

                        }else{
                            layer.msg('网络错误，保存失败',{
                                time:2000
                            })
                            return false ;   
                        }
                    },'json')
   
                       
                })
                function getSearchli() {
                            //显示高德地图
                            $('.no_retrieval_box').show();
                            $('.js_search_ul').html("")
                            $('.retrieval_but').unbind('click').on('click', function () {
                                var search_txt = $('#nearby').val() ==""? "酒店" : $('#nearby').val();
                                lbsAmapFn(search_txt);
                            });
                           

                }
        
        },
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
        allTripTem: function (data) {
            // console.log(data)
            $('.f_main_top .cur_city').text(data.this_city+'酒店');
            $('.con_rig .riTop .city').text(data.this_city);
            
            $.post('../store/position',{type:'行政区',city:(data.this_city+'市')},function(res){
                var str = '';
                if (!res) return false ;
                $(res).each(function(){
                    str +='<option value='+ this.Id +'>'+this.Name+'</option>'
                })
                $('.con_rig .selectCanton select').append(str);
        },'json')  




            var allTriptem = '{{each day_arry as value i}}\
                                    {{if i<day_arry.length-1 || day_arry.length==1}}\
                                    <li class="tripItem" >\
                                    <div class="clearfix">\
                                        <span class="list_day fl"></span>\
                                        <span class="fr list_date">{{value.date}}</span>\
                                    </div>\
                                    {{if value.hotel.hotel_name}}\
                                    <div class="clearfix">\
                                        <span class="fl hotel_name">{{value.hotel.hotel_name}}</span>\
                                        <span class="fr cancel" index="{{i}}">x</span>\
                                    </div>\
                                    {{/if}}\
                                </li>\
                                {{/if}}\
                            {{/each}}';
            var allTriprender = template.compile(allTriptem);
            var allTimehtml = allTriprender(data);
            $(".item_ul").html(allTimehtml);
            $(".top_date").text($(".tripBox li:first").find(".list_date").html() + ' - ' + $(".tripBox li:last").find(".list_date").html());
            $(toReceiveHotelData.list).each(function (i, ele) {

                var that = this;
                if (data.this_city == this.city_name) {
                    if (i == 0) {
                        $(".tripBox li").each(function (i, n) {
                            $(n).find(".list_day").html("D" + (Number(that.city_d_1) + i))
                        });
                        start_index_hotel = Number(that.city_d_1)
                    } else {
                        $(".tripBox li").each(function (i, n) {
                            $(n).find(".list_day").html("D" + (Number(that.city_d_1) + i - 1))
                        });
                        start_index_hotel = Number(that.city_d_1)-1
                    }

                }

            })
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
    initFn.arrangeSchedule();
    initFn.sportSearch();
    cityAttractions.downFn();

    $('.con_rig .selectPrice select , .con_rig .selectCanton select').on('change', function () {
      /*  var query = {};
        query.arrival_date = this_ciydata.arrival_date;
        query.departure_date = this_ciydata.departure_date;
        query.city = this_ciydata.this_city + '市';
        query.page = 1;
        query.page_size = 20;
        query.post = true;
        query.dis_id =$('.con_rig .selectCanton select').val();
        query.map_post = true;
        query.rate = $('.con_rig .selectPrice select').val();
        $.post("../store/hotel", query, function (res) {
            if (!res.count) return false;
            hotelList = res.hotel;
            var hotelListRender = template.compile(holtelistTemplate);
            var html = hotelListRender(res);
            $('.hotelBox .hotel_box').html(html)
            var hotelCheckRender = template.compile(hotelCheck);
            var html1 = hotelCheckRender(this_ciydata);
            $('.hotelBox .hotel_box .msg_box ul').html(html1)
            setPagination(res.count);

            initFn.MarkerFn(hotelList);
            initFn.hover_hotel();
        }, 'json')*/
        limitHotel(bounds);
    })
    $('.searchBox .searchText').on('input propertychange',function(){
        debouncelimitHotel(bounds);
    })

    $('.searchBox .searchBtn').on('click',function(){
         limitHotel(bounds);
    })

    $('.con_rig').on('click', '.addHotel', function () {
        var that =this; 
        var query = {};
        query.hotel_id = $(this).parent('.list').find('div.name').attr('hotelId');
        query.arrival_date = this_ciydata.arrival_date;
        query.departure_date = this_ciydata.departure_date;
        query.map_post = true;
        $.post('../store/getHotelDetail', query, function (res) {
             $(that).parent('li').attr('Features',res.Detail.Features);   
             $(that).parent('li').find('.msg_box').slideDown(300);
             $(that).parent('li').siblings('li').find('.msg_box').hide();
        },'json')
       
    });

     $('.con_rig').on('mousedown', '.addHotel', function () {
       $(this).addClass('down')
    });
    $('.con_rig').on('mouseup', '.addHotel', function () {
       $(this).removeClass('down')
    });
    $('.con_rig').on('click', '.msg_box .wap', function () {
        $(this).parents('.msg_box').find('.confirm').addClass('disabled');
        if($(this).hasClass('disabled')) return false;
        var oIndex = $(this).parents('.list').attr('index');
        var Features = $(this).parents('.list').attr('Features');
        var iIndex = $(this).attr('index');
        $('.msg_box').each(function () {
            $(this).find('.wap:eq(' + iIndex + ')').addClass('disabled');
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
        

        var temp = {};
        temp.lng =$(this).hasClass('active')?$(this).parents('.list').find('.name').attr('lng'):'';
        temp.lat =$(this).hasClass('active')?$(this).parents('.list').find('.name').attr('lat'):'';
        temp.name =$(this).hasClass('active')?$(this).parents('.list').find('.name').html():'';
        
        activeHotelPoint[iIndex] = temp;
        mapFn.addmarker(activeHotelPoint);

        var curr_hotel = {};
        curr_hotel.Features =$(this).hasClass('active')?Features:'';
        curr_hotel.hotel_name =$(this).hasClass('active')? hotelList[oIndex].Detail.HotelName:'';
        curr_hotel.BusinessZoneName =$(this).hasClass('active')? hotelList[oIndex].Detail.BusinessZoneName:'';
        curr_hotel.LowRate =$(this).hasClass('active')? hotelList[oIndex].LowRate:'';
        curr_hotel.ThumbNailUrl =$(this).hasClass('active')? hotelList[oIndex].Detail.ThumbNailUrl:'';
        curr_hotel.address =$(this).hasClass('active')? hotelList[oIndex].Detail.Address:'';
        curr_hotel.lat = $(this).hasClass('active')?hotelList[oIndex].Detail.Latitude:'';
        curr_hotel.lng =$(this).hasClass('active')? hotelList[oIndex].Detail.Longitude:'';
        curr_hotel.tel = $(this).hasClass('active')?hotelList[oIndex].Detail.Phone:'';
        curr_hotel.hotel_id =$(this).hasClass('active')? hotelList[oIndex].HotelId:'';
        curr_hotel.city =$(this).hasClass('active')? hotelList[oIndex].Detail.CityName:'';
        curr_hotel.StarRate =$(this).hasClass('active')? hotelList[oIndex].Detail.StarRate:'';
        this_ciydata.day_arry[iIndex].hotel = curr_hotel;
        templateFn.allTripTem(this_ciydata);

    });
    $('.con_rig').on('click', '.cancel', function () {
        var this_active_index = []  //当前li标签里的 酒店索引;
        var hotel_temp ={
            Features :'',
            hotel_name :'',
            BusinessZoneName:'',
            LowRate :'',
            ThumbNailUrl :'',
            address :'',
            lat : '',
            lng :'',
            tel : '',
            hotel_id :'',
            city :''
        }
        
        $(this).parents('.msg_box').find('.wap').each(function(i,ele){
            if($(this).hasClass('active')){
                // console.log(i)
                this_active_index.push(i);
            }
        })

        $(this_active_index).each(function(i,ele){
            this_ciydata.day_arry[ele].hotel = hotel_temp;
            templateFn.allTripTem(this_ciydata);
            activeHotelPoint[ele] = {lng:'',lat:'',name:''};
            mapFn.addmarker(activeHotelPoint);
             $('.msg_box').each(function () {
                 $(this).find('.wap:eq(' + ele + ')').removeClass('disabled');
            })
        })

        $(this).parents('.msg_box').slideUp(300).find('.wap').removeClass('active');
        $(this).siblings('.confirm').addClass('disabled');

    });
    $('.tripBox .item_ul').on('click','.cancel',function(){
        var this_index = $(this).attr('index');

        this_ciydata.day_arry[this_index].hotel = {
            Features :'',
            hotel_name :'',
            BusinessZoneName:'',
            LowRate :'',
            ThumbNailUrl :'',
            address :'',
            lat : '',
            lng :'',
            tel : '',
            hotel_id :'',
            city :''};
        templateFn.allTripTem(this_ciydata);
        activeHotelPoint[this_index] = {lng:'',lat:'',name:''};
        mapFn.addmarker(activeHotelPoint);
        $('.con_rig .msg_box').each(function(){
            var this_index_wap =  $(this).find('.wap:eq(' + this_index + ')').removeClass('active').removeClass('disabled');
            this_index_wap.parents('.msg_box').find('.confirm').addClass('disabled');
            this_index_wap.siblings('.wap').each(function(){
                if($(this).hasClass('active')){
                    $(this).parents('.msg_box').find('.confirm').removeClass('disabled');
                    return false;
                }
             })
            // this_index_wap.siblings('.wap').hasClass('active')?this_index_wap.parents('.msg_box').find('.confirm').addClass('disabled')
        })
    });
    $('.con_rig').on('click','.confirm:not(.disabled)', function () {
        $(this).parents('.msg_box').slideUp(300)
    });

    // hotel detail start
    //详情
    //弹出关闭
    $('.con_rig').on('click', '.list .name, .left_img img', function () {
        var query = {};
        query.hotel_id = $(this).parents('.list').find('.name').attr('hotelId');
        query.arrival_date = this_ciydata.arrival_date;
        query.departure_date = this_ciydata.departure_date;
        query.map_post = true;
        $.post('../store/getHotelDetail', query, function (res) {
            if (!res) return false;
            _details_data = res
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
            var roomStr = '';
                for(var i = 0 ;i< res.Rooms.length;i++){
                    roomStr+=res.Rooms[i].BedType+'、'
                }
            $('.more_pic_box  .content_box .content_info').find('.content_phone').text(res.Detail.Phone).end()
                                                          .find('.content_adress').text(res.Detail.Address).end()
                                                          .find('.content_room').text(roomStr.substring(0,roomStr.length-1)).end()
            $('.details_popup').find('.p1').text(res.Detail.HotelName).end()
                .find('.p2').html(starStr+ '¥' + res.LowRate + '起').end()
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
        }, 'json')
        $(".details_popup_box").fadeIn();

        
    });

    
    $(".popup_img_box").on('click', ".last_li_img,li", function () {
        $(".more_pic_box").fadeIn();
        initFn.morePictures(_details_data);
    });
    $(".pic_hide").click(function () {
        $(".more_pic_box").fadeOut();
        $(".gallery-top").html("");
        $(".gallery-thumbs").html("");
    });

    $(".shut_down").on("click", function () {
        $(".details_popup_box").fadeOut();
    });
    hoverDetailsPopup();


    function tabSwitch(details) {
        $(details).find(".details_popup_tab li").each(function (i, n) {
            var length_num = $(".details_popup_tab li").length;
            $(n).click(function () {
                $(details).find(".tab_content_box .tab_content").scrollTop(0)
                var tab_lits_position = $(n).position().left
                $(details).find(".details_popup_tab_active").stop(true, true).animate({
                    left: tab_lits_position
                }, length_num * 10);
                $(details).find(".tab_content_box .tab_content").eq(i).stop(true, true).fadeIn("fast").siblings().fadeOut("fast");
            });
        })
    }

    tabSwitch('.js_details_popup_box')
    //hitel detail end

    var holtelistTemplate = '{{each hotel as value i }}\
                                <li class="list" index ="{{i}}" lat="{{value.Detail.Latitude}}" lng="{{value.Detail.Longitude}}" >\
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
                                <div class="msg_box hide">\
                                <ul>\
                                </ul>\
                                <div class="ctrl_bar">\
                                <span class="cancel">取消</span><span class="confirm disabled">确定</span>\
                                </div>\
                                </div>\
                                </li>\
                            {{/each}}';

    var hotelCheck = '{{each day_arry as value i }}\
                            {{if i < day_arry.length-1||day_arry.length==1}}\
                            <div class="wap" index="{{i}}">\
                                <span class="day">第{{value.start_index_hotel}}天</span>\
                                <span class="time">{{value.date}} 入住</span>\
                                <span class="i_circle"></span>\
                            </div>\
                            {{/if}}\
                      {{/each}}'

    function setPagination(totnum) { //设置翻页
        $("#pagination").show()
        $("#pagination").pagination({
            pageCount: 4,
            count: 1,
            prevContent: '上一页',
            nextContent: '下一页',
            totalData: totnum,
            showData: 20,
            coping: true,
            callback: function (api) {
                // api.getPageCount() 获取总页数
                // api.setPageCount(page) 设置总页数
                var index = api.getCurrent() //获取当前是第几页
                var query = {};
                query.arrival_date = this_ciydata.arrival_date;
                query.departure_date = this_ciydata.departure_date;
                query.city = this_ciydata.this_city + '市';
                query.page = index;
                query.rate = $('.selectPrice select').val();
                query.dis_id = $('.selectCanton select').val();
                query.page_size = 20;
                query.post = true;
                query.map_post = true;
                query.query_text = $('.searchBox .searchText').val().trim();
                if(bounds.Radius){
                    query.position=bounds;
                }
              
                $.post("../store/hotel", query, function (res) {
                    $('.con_rig .no_hotelbox').hide()
                    if (!res.hotel) {
                        $('.hotel_box').html('')
                        $('.con_rig .no_hotelbox').show()
                        $("#pagination").hide()
                        return false;
                    }
                    hotelList = res.hotel;
                    var hotelListRender = template.compile(holtelistTemplate);
                    var html = hotelListRender(res);
                    $('.hotelBox .hotel_box').html(html)
                    var hotelCheckRender = template.compile(hotelCheck);
                    var html1 = hotelCheckRender(this_ciydata);
                    $('.hotelBox .hotel_box .msg_box ul').html(html1);

                    initFn.MarkerFn(hotelList);
                    initFn.hover_hotel();
                }, 'json')
            }

        })
    };

     function limitHotel(bounds){ // 10.12改
        var query = {};
        query.arrival_date = this_ciydata.arrival_date;
        query.departure_date = this_ciydata.departure_date;
        query.city = this_ciydata.this_city + '市';
        query.page = 1;
        query.page_size = 20;
        query.post = true;
        query.dis_id =$('.con_rig .selectCanton select').val();
        query.map_post = true;
        query.rate = $('.con_rig .selectPrice select').val();
        query.position=bounds;
        query.query_text=$('.searchBox .searchText').val().trim();
        $.post("../store/hotel", query, function (res) {
            $('.con_rig .no_hotelbox').hide()
            if (!res.count) {
                $('.hotel_box').html('');
                $('.con_rig .no_hotelbox').show();
                $("#pagination").hide();
                return false;
            }
            hotelList = res.hotel;
            var hotelListRender = template.compile(holtelistTemplate);
            var html = hotelListRender(res);
            $('.hotelBox .hotel_box').html(html)
            var hotelCheckRender = template.compile(hotelCheck);
            var html1 = hotelCheckRender(this_ciydata);
            $('.hotelBox .hotel_box .msg_box ul').html(html1)
            setPagination(res.count);

            initFn.MarkerFn(hotelList);
            initFn.hover_hotel();
        }, 'json')
    }
    var debouncelimitHotel = debounce(limitHotel,500)

    function debounce (fn,delay) {    //函数防抖
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

    function add_address_imgFn() {
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
    }
    add_address_imgFn();

     function GetDistance (lat1, lng1, lat2, lng2) { //就算两点间的直线距离 单位km
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



    function Zxq_Adddate(date,days){ 
        var d=new Date(date); 
        d.setDate(d.getDate()+days); 
        var m=d.getMonth()+1;
    // return d.getFullYear()+'-'+m+'-'+d.getDate(); 
        var y = d.getFullYear()
    d = d.getDate();
    if (m >= 1 && m <= 9) {
        m = "0" + m;
    } 
    if ( d >= 0 && d <= 9) {
        d = "0" + d;
    }
    return y +'-'+ m+'-'+ d ; 
}

});

/*高的地图 搜索酒店相关 start*/
    //高德地图搜索POI点
    //

    function lbsAmapFn(search_txt) {
        $('.add_address_img').find('span').html("上传封面")
        $('.retrieval_popup_box').show().find('input').val("").removeAttr("data-address_lat").removeAttr("data-address_lng");
                $(".input_date").val(getDate())
                $('.input_date').datepicker({
                    minDate: 0,
                    dateFormat: "yy-mm-dd"
                });
        // var lbsmap = new AMap.Map('container', {
        //     zoom: 10,
        //     center:[city_lng,city_lat],
        // });
        lbsmap.remove(lbsmarker); //清除标记点
        // lbsinfoWindow.open(null);
        lbsinfoWindow.close() //清除信息框

        var city_lat = Number(currentCity.this_city_lat);
        var city_lng = Number(currentCity.this_city_lng);
        lbsmap.setCenter([city_lng,city_lat]); //设置地图中心点
        geocoder = new AMap.Geocoder();
        geocoder.getAddress([city_lng,city_lat], function(status, result) {
            if (status === 'complete'&&result.regeocode) {
                // console.log(result.regeocode.addressComponent.city)
                // lbsMap_city_name = result.regeocode.addressComponent.city
                // var address = result.regeocode.formattedAddress;
                // document.getElementById('address').value = address;
                AMapUI.loadUI(['misc/PoiPicker'], function (PoiPicker) {

                    var poiPicker = new PoiPicker({
                        city:result.regeocode.addressComponent.city,
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
       
        // var city_name = $('.bar_city_name').html()
        
       
        
        function poiPickerReady(poiPicker) {
            
            // console.log(poiPicker)
            window.poiPicker = poiPicker;

            // var lbsmarker = new AMap.Marker();

            // var lbsinfoWindow = new AMap.InfoWindow({
            //     offset: new AMap.Pixel(0, -40)
            // });
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
                
                    // lbsmap.setCenter([poi.location.lng,poi.location.lat]);
                    // console.log( lbsmap )
                    lbsmarker.setMap(lbsmap);
                    lbsinfoWindow.setMap(lbsmap);
                    // console.log(poi.location)
                    lbsmarker.setPosition(poi.location);
                    lbsinfoWindow.setPosition(poi.location);
                    
                    //JSON.stringify(info, null, 2)使用2个空格缩进
                    // infoWindow.setContent('POI信息: <pre>' + JSON.stringify(info, null, 2) + '</pre>');
                    var lbsMap_str = "<div class='lbsMap_txt'>名字：<span class='add_newName'>" + info.name + "</span><br>地址：<span class='add_newAddress'>" + info.address + "</span></div>";
                    lbsinfoWindow.setContent(lbsMap_str);
                    lbsinfoWindow.open(lbsmap, lbsmarker.getPosition());

                    var input_address = poi.district?poi.district+poi.address:poi.address
                    $('.input_address').val(input_address).attr("data-address_lat",poi.location.lat).attr("data-address_lng",poi.location.lng);
                    $('.input_name').val(poi.name)
                    // console.log(marker.getPosition())
                    lbsmap.setCenter(lbsmarker.getPosition());
                    
                } else {
                    layer.msg("请输入详细的信息", {
                        time: 600,
                        offset: '300px'
                    });
                }
                
            });
            
            
            // $("#pickerInput").val(search_txt)
            // console.log(search_txt)
            // console.log($("#pickerInput").val())
            // poiPicker.searchByKeyword($("#pickerInput").val()) //设置input 收索框 的val() 显示keyword的搜索结果
            // poiPicker.searchByKeyword(search_txt)
            // poiPicker.suggest(search_txt)
            poiPicker.onCityReady(function () {
                // console.log(111)
                // console.log(search_txt)
                // console.log($("#pickerInput").val())
                // poiPicker.suggest("美味");
                poiPicker.searchByKeyword(search_txt)
                // poiPicker.searchByKeyword($("#pickerInput").val())
                poiPicker.suggest(search_txt); //
                
            });
            
        }
        //保存新增地点
        // add_address_saveFn()
    };
    