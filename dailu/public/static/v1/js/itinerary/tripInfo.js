   

$(function(){
        var collect_status ='';
        var like_status ='';
        var arrUrl = window.location.href.split("/");
        var searchIdARR =arrUrl[arrUrl.length-1].split("-");
        var trip =arrUrl[arrUrl.length-1].substr(0,arrUrl[arrUrl.length-1].indexOf('.html'));
        var u = searchIdARR[0];
        var this_uid = getCookie('uid');
        var collect_num =0 ;
        var like_num= 0;
        var bookData,map;
         var FlightPath ,//红色连线
             FlightPath_blue,//蓝色连线
             Dottedline, //定义虚线
             Dottedline_array = [], //虚线;
             markerArr =[],
             FlightPath_arr=[],//所有点的marker
             spot_polyline,
             spotPolyline_array=[]; //景点的连线数组
        var ewm_url ='http://' + window.location.host+'/portal/itinerary/tripinfoshare.html?them='+u+'&trip='+trip;
        if(/Android|webOS|iPhone|iPod|BlackBerry/i.test(navigator.userAgent)) {
            window.location.href = ewm_url;
            return false;
        }
        ewm_url ='/portal/store/getarcode?url='+ encodeURIComponent(ewm_url)
        $('.shareBox .share_code_img').attr('src',ewm_url);
        $('#foo').val(window.location.href);
        var clipboard = new ClipboardJS('.copy');   //一键复制
        clipboard.on('success', function(e) {
            e.clearSelection();
            layer.msg('复制成功',{
                time:600,
                offset:'200px'
            })

        });

        clipboard.on('error', function(e) {
            layer.msg('复制失败请手动复制',{
                time:600,
                offset:'200px'
            })
        });

        // 更换h5行程单二维码 START
        $('#shareTitle').on('focus',function(){
            $('.titledit').hide().siblings('.titlesave').show();
        })

        $('.titledit').on('click',function(){
             $(this).hide().siblings('.titlesave').show();
             $('#shareTitle').focus();
        })

        $('.titlesave').on('click',function(){
            $(this).hide().siblings('.titledit').show();
              var shareEwm = 'http://'+window.location.host+'/portal/itinerary/tripinfoshare.html?them='+u+'&trip='+trip+'&shareTitle='+$('#shareTitle').val();
                shareEwm ='/portal/store/getarcode?url='+ encodeURIComponent(shareEwm);
                $('.shareBox .share_code_img').attr('src',shareEwm);
        })

        // 更换h5行程单二维码 END

        $('.topBanner .addTrip').on('click',function(){
            if(!this_uid){
                window.location.href="/portal/login/login.html"
            }
            var _self =  this ;
            if($(this).hasClass('disabled')) return false;
            var query = {};
                query.uid = this_uid ;
                query.them = u ;
                query.trip_id = trip ;
                $.post('/portal/itinerary/CopyTrip',query,function(res){
                    if(res.status == true){
                       
                            $(_self).text('已添加到我的行程').addClass('disabled');
                    }else{
                        alert('添加失败');
                    }
                    
                },'json')

            
        })
        //左侧电梯导航 定位
        function setfloorPosition (renderArr){
            var floorStr = '';
            for(var i=0;i<=renderArr.length-1;i++){
                floorStr+='<div class="flage" index="day'+i+'">D'+(renderArr[i].dayindex+1)+'</div>'
            }
            floorStr += '<div class="flage top"><a href="javascript:;"></a>目录</div>'
            $('.fixfloor').html(floorStr)
            var initLeft = $('.fixfloor').next('.daylist').find('.header_traffic').eq(0).position().left -68;
            $('.fixfloor').css({left:initLeft}) 
            $('.fixfloor .top').on('click',function(){
                $("html,body").stop().animate({scrollTop:0}, 500);
            })
            $('.fixfloor .top').hover(function(){
                    $(this).text('顶部')
            },function(){
                    $(this).text('目录')
            })

            $('.fixfloor .flage').not('.top').on('click',function(){
                var index = $(this).attr('index');
                var top = $('#'+index).offset().top-79
              $("html,body").stop().animate({scrollTop:top}, 500);
            })

            $(window).scroll(function() {  
                    $('#imgShow').hide();
                    var barTop,barLeft,maxTop,daylistTop;
                    barLeft = $('.fixfloor').offset().left-$(window).scrollLeft();
                    daylistTop = $('.daylist').offset().top-$(window).scrollTop();
                    maxTop = $('.userComment').offset().top-$(window).scrollTop();
                    var  minTop = $('.rightList ').height() - $('.fixfloor').height()+80;
                    if(daylistTop<=70){
                      $('.fixfloor').css({position:'fixed',top:'79px',left:barLeft});
                      if(maxTop<=380){
                        $('.fixfloor').css({position:'absolute',top:0,left:initLeft});
                      }
                    }else{
                        $('.fixfloor').css({position:'absolute',top:'0px',left:initLeft});
                    }
                
                var difArr = [] ;
                $('.day_header').each(function(){
                    var dif_space = Math.abs($(this).offset().top - $(window).scrollTop()-68);
                    difArr.push(dif_space);
                })
                var miin_dif =   Math.min.apply(null, difArr);//最小值
                var index  = difArr.indexOf(miin_dif);
                $('.fixfloor .flage').removeClass('active')
                $('.fixfloor .flage').eq(index).addClass('active');
            });
        }

        $('.shareTrip').on('click',function(){
            $('.ewm_box').hasClass('hide')?$('.ewm_box').show(300).toggleClass('hide'):$('.ewm_box').hide(300).toggleClass('hide')
        })

        $('.short.collect,.short.c_collect').on('click',function(){
            if(!this_uid){
                window.location.href='/portal/login/login.html';
                return false;
            }
            var _self = this;
            var query ={};
                query.uid=this_uid;
                query.uid_trip=u;
                query.trip_id=trip;
                query.collect_status =collect_status;
            $.post('/portal/itinerary/collect',query,function(res){
                    if(res.status=='ok'){
                        collect_num = collect_status=='no_collect'?collect_num+1:collect_num-1;
                        collect_status = collect_status=='no_collect'?'collected':'no_collect';
                        var collect_text = collect_num ==0?'收藏':'已收藏';
                        $(_self).addClass('hide').siblings('.hide').removeClass('hide');
                        $('.blogger .collectnum').text('收藏'+collect_num);
                    }
            },'json')   
        })
        $('.short.like').on('click',function(){
            if(!this_uid){
                window.location.href='/portal/login/login.html';
                return false;
            }
            var _self = this;
            if($(this).hasClass('is_like')) return false;
            var query ={};
                query.uid=this_uid;
                query.uid_trip=u;
                query.trip_id=trip;
                query.like_status =like_status;
            $.post('/portal/itinerary/CareFor',query,function(res){
                    if(res.status=='ok'){
                        like_status = 'liked';
                        $(_self).addClass('is_like').text('已喜欢');
                        $('.blogger .likenum').text('喜欢'+(like_num+1));
                    }
            },'json')   
        })

       

        $.post('/portal/itinerary/BooksData',{'collect_uid':this_uid,'uid':u,'trip_id':trip},function(res){
            $('.blogger .name').text(res.gailan.user_name);
            if(!res) return false;

            //收藏状态
            collect_status = res.collect_status;
            if(collect_status=='no_collect'){
                $('.short.collect').removeClass('hide');
                $('.short.c_collect').addClass('hide');
            }else{
                $('.short.collect').addClass('hide');
                $('.short.c_collect').removeClass('hide');
            }
           
                like_num = res.gailan.like_num;  
                collect_num = res.gailan.collect_num ;  
            res.gailan.click_num = res.gailan.click_num == 0?1:res.gailan.click_num;
            $('.short.see').text(res.gailan.click_num);
            $('.blogger .clicknum').text('查看 '+res.gailan.click_num);
            $('.blogger .likenum').text('喜欢 '+res.gailan.like_num);
            $('.blogger .collectnum').text('收藏 '+res.gailan.collect_num);
            if(res.gailan.head_port){
                $('.blogger .headImg img').attr('src',res.gailan.head_port);
            }
             //喜欢状态
            like_status = res.like_status;
            if(like_status!='no_like'){
                $('.short.like').addClass('is_like').text('已喜欢');
            }

            if(res.copy_status == 'copied'){
                $('.topBanner .addTrip').addClass('disabled').text('已添加到我的行程');
            }

            if(!res.hotel_money) res.hotel_money = [];

            /*行程详情部分 start*/
            var lineCity = '';
            var lineTitle = res.gailan.departure_city+' — ';
            var leftBar = '';
            var pointArr = [{lat:res.gailan.dep_lat,lng:res.gailan.dep_lng}];
                $(res.gailan.go_city_array).each(function(i,ele){
                    // if(this.position){
                    //     pointArr.push(this.position);
                    // }else{
                    //     pointArr.push({
                    //         lat: this.latitude,
                    //         lng: this.longitude
                    //     })
                    // }
                     
                     lineCity+=this.city_name+' · ';
                     lineTitle += this.city_name+' — ';
                });

                lineTitle = lineTitle + res.gailan.return_city;
                for(var i=0; i<res.gailan.day_num;i++){
                    leftBar+="<li type='day"+i+" '><a href='javascript:;'>第"+ (i+1) +"天</a></li>"
                }

            // renderMap(pointArr);
            $('.topBanner .coverimg img, .topBanner .banner_bg').attr('src',res.gailan.image_cover);
            $('.topBanner').find('.triptitle').text(res.gailan.trip_name).end()
                         .find('.linecity').text(res.gailan.day_num+'天 | '+lineCity.substring(0,lineCity.length-2)).end()
                         .find('.banner_left .num').text('人数：'+ (Number(res.gailan.adult)+Number(res.gailan.children))+'人').end()
                         .find('.banner_left .startDay').text('出发日期：'+res.gailan.date.replace(/-/g,'.')).end()
                         .find('.banner_left .day').text('天数：'+res.gailan.day_num+'天');
            $('.dayWap').find('.rightList .place').text(lineTitle).end()
                        .find('.leftLift ul').html(leftBar);
            $('.blogger .edit_date').text(res.gailan.creat_time.replace(/-/g,'.')+" 发布 · ")
            var renderArr = [];
            $(res.gailan.go_city_array).each(function(i,ele){
                /* mainMaparr.push(this.position);
                 gailan_tit+='<em>'+(i+1)+'</em> <span>'+this.city_name+' → </span>'*/
                 switch(this.city_trc_name.trim())
                 {
                     case '铁路交通':
                     this.traffic_ico = 'train'
                     this.use_time = CheckIsChinese(this.trainTime)
                     break;
                     case '飞机交通':
                     this.traffic_ico = 'air';
                     this.use_time = CheckIsChinese(this.flightTime)
                     break;
                     default:
                     this.traffic_ico  = 'bus'
                     this.use_time = CheckIsChinese(this.trafficTime);
                 }
                 res.Schedufing[i].city_trc_name = this.city_trc_name;
                 res.Schedufing[i].traffic_ico = this.traffic_ico;
                 res.Schedufing[i].dis = this.dis;
                 res.Schedufing[i].use_time = this.use_time;
            })

           $(res.Schedufing).each(function(i,ele){
                var that =  this;
                if(i>0&&this.prevHotel){
                    if(!renderArr[(renderArr.length-1)].hotel.highImage && renderArr[(renderArr.length-1)].hotel.hotel_name==''){ //是否重新修改酒店
                     renderArr[(renderArr.length-1)].hotel =this.prevHotel.hotel; 
                    }
                }
                $(this.day_arry).each(function(k,value){
                    var _self = this;
                    this.thisCity =  that.this_city;
                    this.city_trc_name =  that.city_trc_name;
                    this.city_abbreviation =  that.city_abbreviation;
                    this.use_time =  that.use_time;
                    this.dis =  that.dis;
                    this.two_city = this.two_city?this.two_city:that.day_arry[0].two_city;
                  
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
                        // if(i>0 && this.date==res.Schedufing[i-1].day_arry[prevdayLength-1].date && this.hotel){
                        //    res.Schedufing[i-1].day_arry[prevdayLength-1].hotel = this.hotel
                           
                        // }

                     if(this.hotel && res.allhotel){
                            $(res.allhotel).each(function(){
                                if(_self.date ==  this.date  ){
                                    if(this.city.indexOf(that.this_city)!=-1){
                                        _self.hotel= this;   
                                    }else{
                                         _self.hotel= '';   
                                    }      
                                }
                            })
                        }

                    if(!this.hotel){
                        this.hotel={
                            hotel_name:''
                        }
                    }

                    renderArr.push(this);
                })
            })
            switch(res.gailan.return_cityInfo.city_trc_name.trim())
               {
                   case '铁路交通':
                   res.gailan.return_cityInfo.use_time = res.gailan.return_cityInfo.trainTime||res.gailan.return_cityInfo.trafficTime;
                   // res.gailan.return_cityInfo.city_trc_name = '铁路';
                   break;
                   case '飞机交通':
                   res.gailan.return_cityInfo.use_time = res.gailan.return_cityInfo.flightTime||res.gailan.return_cityInfo.trafficTime;
                   // res.gailan.return_cityInfo.city_trc_name = '飞机';
                   break;
                   case '汽车交通':
                   res.gailan.return_cityInfo.use_time = res.gailan.return_cityInfo.busTime||res.gailan.return_cityInfo.trafficTime;
                   // res.gailan.return_cityInfo.city_trc_name = '汽车';
                   break;
                   default:
                   res.gailan.return_cityInfo.city_trc_name = '其它交通';
                   res.gailan.return_cityInfo.use_time = res.gailan.return_cityInfo.trafficTime||res.gailan.return_cityInfo.trafficTime;
               }
            
            renderArr[renderArr.length-1].city_trc_name =res.gailan.return_cityInfo.city_trc_name;
            renderArr[renderArr.length-1].dis =res.gailan.return_cityInfo.dis;
            renderArr[renderArr.length-1].use_time =CheckIsChinese(res.gailan.return_cityInfo.use_time);

              $(renderArr).each(function(i,ele){
                        if(!this.day){
                            this.day =[] //有的数据里没有选景点 没有day字段 难受
                        }
                        
                        if(i==0){   //解决一天多个城市的天数情况
                            this.dayindex  = i;
                        }else{
                             this.dayindex = renderArr[i-1].dayindex +1
                        }  
                        if( i>0 &&  renderArr[i-1].date == this.date){
                            this.dayindex = renderArr[i-1].dayindex
                            
                        }

                        $(this.day).each(function(){
                              switch(this.this_floor_index-0)
                                {
                                    case 0:
                                    this.spotType = '人文自然'
                                    break;
                                    case 1:
                                    this.spotType = '本土体验'
                                    break;
                                     case 2:
                                    this.spotType = '醉美夜色'
                                    break;
                                     case 3:
                                    this.spotType = '美食诱惑'
                                    break;
                                     case 4:
                                    this.spotType = '购物天堂'
                                    break;
                                    default:
                                    this.spotType = '暂无分类'
                                }
                            if(!this.info){
                                this.info={
                                     absture:'暂无详情',
                                     address:'暂无详情',
                                     attractions_tickets:'暂无详情',
                                     business_hours:'暂无详情',
                                }
                            }
                        })
                           
                    })
            var data = {};
                data.dayArray = renderArr;
            var hotelListRender = template.compile(hotelListTemplate);
            var html = hotelListRender(data);
            $('.dayWap .fixfloor').after(html);
                bookData = res
                mapCtrl.initCtrl(res.Schedufing)//地图 渲染
                mapCtrl.renderAllcity(res.gailan);
            $('.main .dayWap .leftLift li').first().find('a').addClass('on');
            setfloorPosition(renderArr)

            /*费用清单部分 start */
            var ticketCost = [];
            var ticketTot = 0 ;
            $(renderArr).each(function(i,ele){

                $(ele.day).each(function(){
                    var temp ={};
                    var start,end,price;
                       this.info = this.info.attractions_tickets?this.info:{'attractions_tickets':'暂无','spot_name':''};
                       start = this.info.attractions_tickets.indexOf("成人票：");
                       end = this.info.attractions_tickets.indexOf("元/人"); 
                       price =  (start=="-1"||end=="-1")?0:parseFloat(this.info.attractions_tickets.substring(start+4,end));
                       if(this.info && this.info.ticket_data!=undefined){
                            temp.ticket = this.info.ticket_data;
                       }else{
                            temp.ticket=Boolean(price)?price:0;
                       }
                       temp.spotName=this.info.spot_name;
                       temp.type="门票费用";
                       temp.totmoney = res.gailan.adult * temp.ticket;
                       temp.peopleNum = (res.gailan.adult-0+ res.gailan.children-0) +"人";
                       ticketTot+=res.gailan.adult * temp.ticket;
                       ticketCost.push(temp);
                })
            })

            var foodCost = res.eat_money;
            var hotelCost = res.hotel_money;
            var traffiCost = res.traffic_money;
            var foodStr = hotelStr = trafficStr= ticketStr= '';
            var trafficTot = foodTot = hotelTot= 0;
            $(traffiCost).each(function(i,ele) {
                this.line_cros = this.start_city +'—'+this.city_name;
              
                switch(this.city_trc_name.trim())
                {
                    case '铁路交通':
                    this.traffic_ico = 'train'
                    trafficTot += this.price*this.people;
                    break;
                    case '飞机交通':
                    this.traffic_ico = 'plane';
                    trafficTot += this.price*this.people;
                    break;
                    default:
                   this.traffic_ico = 'bus'
                   trafficTot += this.price*this.people;
                }
            })
            $(hotelCost).each(function(){
                hotelTot += this.LowRate*this.number_night*(Math.round((res.gailan.children/2+res.gailan.adult*1)/2));
            })
            $(foodCost).each(function(){
                foodTot += this.price*this.people;
            })
            $('.calc_tot').text(hotelTot+foodTot+trafficTot+ticketTot);
             var per_hotel = (hotelTot/(hotelTot+foodTot+trafficTot+ticketTot)).toFixed(2)
             var per_food = (foodTot/(hotelTot+foodTot+trafficTot+ticketTot)).toFixed(2)
             var per_traffic = (trafficTot/(hotelTot+foodTot+trafficTot+ticketTot)).toFixed(2)
             var per_ticket = (ticketTot/(hotelTot+foodTot+trafficTot+ticketTot)).toFixed(2)
            var echartsArr = [
                    {value:foodTot, name:'餐饮费用'},
                    {value:trafficTot, name:'交通费用'},
                    {value:hotelTot, name:'住宿费用'},
                    {value:ticketTot, name:'门票费用'}
                ]
            var per_info_str = '';
            $(echartsArr).each(function(i,ele){
                per_info_str+= '<li class="fl"><span></span> '+this.name+(this.value).toFixed(2) +'元</li>'
            })
            $('.percentBox .p-right ul').html(per_info_str);
            var peopleInfo = {};
                peopleInfo.child = res.gailan.children;
                peopleInfo.adult = res.gailan.adult;

            trafficStr =  renderCostTable(traffiCost,trafficTot,'traffic','line_cros','price','people',peopleInfo);  
            hotelStr =  renderCostTable(hotelCost,hotelTot,'hotel','hotel_name','LowRate','number_night',peopleInfo);  
            foodStr =  renderCostTable(foodCost,foodTot,'eat','name','price','people',peopleInfo);  
            ticketStr =  renderCostTable(ticketCost,ticketTot,'ticket','spotName','ticket','peopleNum',peopleInfo);  
            var tableStr = foodStr +hotelStr +trafficStr+ticketStr; 
            // $('tbody').html( )
            $('.tableBox tbody').html(tableStr)
            $('tbody td').each(function(){
                if($(this).text()==="¥0元"){
                    $(this).text('不详')
                }
            })
            renderEchats(echartsArr);

            //实例化地图 算公共交通 start
            var Amap = new AMap.Map("AmapContainer", {
                  center: [120.583213,29.992493],
                  zoom: 14
                });
                $('.daylist .commen_traffic').each(function(i,ele){
                  var _self = this;
                  var crosStr='';
                  var transferOption = {
                    nightflag: false, // 是否计算夜班车
                    city: $(_self).attr('this_city')+'市',
                    autoFitView: true,
                    policy: AMap.TransferPolicy.LEAST_TIME // 其它policy取值请参照 https://lbs.amap.com/api/javascript-api/reference/route-search#m_TransferPolicy
                  }
                   //根据起、终点坐标查询公交换乘路线
                   var startLng = parseFloat($(_self).attr('this_lng'))
                   var startLat = parseFloat($(_self).attr('this_lat'))
                   var nextLng = parseFloat($(_self).attr('next_lng'))
                   var nextLat = parseFloat($(_self).attr('next_lat'))

                   if(startLng&&startLat&&nextLng&&nextLat){
                    var transfer = new AMap.Transfer(transferOption)
                    transfer.search(new AMap.LngLat(startLng,startLat), new AMap.LngLat(nextLng,nextLat), function(status, result) {
                      
                      if(result.info=='OK'){
                        $(result.plans[0].segments).each(function(){ //获取查询结果的第一条线路规划
                             crosStr+=this.instruction;
                         })
                            
                            $(_self).find('.trafficType').html('公共交通 · '+(result.plans[0].distance/1000).toFixed(2)+'公里 · 约'+formatSeconds(result.plans[0].time));
                            $(_self).find('.trafficType').after('<div class="msg">'+crosStr+'</div>')
                            // $(_self).find('span.fr').on('click',function(){
                            //     $(_self).toggleClass('auto');
                            // })
                      }else{
                        $(_self).find('.toggle').hide();    
                        var dis = GetDistance(startLat, startLng, nextLat, nextLng);
                        if(dis<=4){
                             $(_self).find('.trafficType').text('其它交通');
                             return false ;
                        }
                        //飞机700 在加0.5小时， 铁路230 ，其他50 汽车 80
                        var time ;
                        if(dis<40){
                            time =  dis/20*3600;    
                        }else{
                            time = dis/60*3600;
                        }

                        $(_self).find('.trafficType').html('汽车交通 · '+dis.toFixed(2)+'公里 · 约'+formatSeconds(time.toFixed(0)));
                       
                      }
                    // result即是对应的公交路线数据信息，相关数据结构文档请参考  https://lbs.amap.com/api/javascript-api/reference/route-search#m_TransferResult
                    if (status === 'complete') {
                    } else {
                     // console.log('公交路线数据查询失败' )
                   }
                 });
                 }
                })  
                $('.commen_traffic .toggle').on('click',function(){
                    var down =  $(this).hasClass('down');
                    if(down){
                        $(this).removeClass('down').text('[展开详情]').siblings('.msg').hide().siblings('.trafficType').show();
                    }else{
                        $(this).addClass('down').text('[收起详情]').siblings('.msg').show().siblings('.trafficType').hide();

                    }
                })
            //实例化地图 算公共交通 end

        },'json')

        renderComment();

        $('.short .like').on('click',function(){
            $(this).hasClass('on')?$(this).removeClass('on'): $(this).addClass('on');               
        })

        $('.leftLift ul').on('click','li',function(){
            $(this).siblings('li').find('a').removeClass('on');
            $(this).find('a').addClass('on');
            var selecter = $(this).attr('type');
            var top = $('#'+selecter).offset().top -68;
            $("html,body").animate({scrollTop:top},"slow");  
        })

       /* $('.openMore').on('click',function(){
            if($(this).hasClass('up')){
                $(this).removeClass('up').text('查看更多').parents('.tableBox').css({height:'384px'})
            }else{
                $(this).addClass('up').text('收起更多').parents('.tableBox').css({height:'auto'});
            }
        })*/

        $('.tableBox').on('click','.tog_cost',function(){
            $(this).toggleClass('on');
            $(this).parent('tr').next('tr').siblings().find('.info').addClass('hide');
            $(this).parent('tr').next('tr').find('.info').toggleClass('hide');
            $(this).parent('tr').toggleClass('show').siblings().removeClass('show');
            $('.tog_cost').text('[展开详情]');
            if($(this).hasClass('on')){
                $(this).text('[收起详情]')
            }else{
                 $(this).text('[展开详情]')
            }
        })
        $('.toggleMap').on('click',function(){
           $('.fixdMap').show();
        })
        $('.fixdMap .totrip,.fixdMap .toggleMap2').on('click',function(){
            $('.fixdMap').hide();
        })

       /*图片地图 start*/
       function renderMap (pointArr){
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
            var markerstr = '&markers=icon:http://www.dailuer.com/static/v1/img/map/departureicon.png|'+pointArr[0].lat+','+pointArr[0].lng;
            var pathstr = '';
            for(var i= 0;i<pointArr.length-1;i++){
                markerstr += '&markers=color:blue|label:'+(i +1) +'|'+pointArr[i+1].lat+','+pointArr[i+1].lng;
                
                pathstr += '|'+pointArr[i+1].lat+','+pointArr[i+1].lng;
            }
            var imgsrc = 'http://maps.google.cn/maps/api/staticmap?center='+center.lat+','+center.lng +'zoom=1&size=804x456&maptype=roadmap'+markerstr+'&path=color:0xFF0000|weight:5'+  pathstr +'&key=AIzaSyDyRjVndlLtlpWVIg_RSfgGYLUUvclNLGw';
            $('.banner_right  .mapimg').attr('src',imgsrc);
            var tempImage = new Image();
              tempImage.src = imgsrc;
              tempImage.crossOrigin = "*";
              tempImage.onload = function(){
              var base64 = getBase64Image(tempImage);
              $('.rightPic  .mapimg').attr('src',base64) 
            }
    }

     /*图片地图end*/
  

         var hotelListTemplate ='{{each dayArray as value i}}\
                                <div class="daylist">\
                                    <div class="main">\
                                        <div class="day_header"  id="day{{i}}">\
                                            {{if value.one_city ||( value.transport && value.transport.length>0)}}\
                                            <div class="header_traffic"><span class="br1 daynum">Day{{value.dayindex+1}}</span><span class="br1">{{value.one_city ||value.transport[0].one_city}} — {{value.two_city||value.transport[0].two_city}}</span><span>{{value.city_trc_name||value.transport[0].city_trc_name}} · {{value.dis||value.transport[0].dis}}公里</span><span class=""> · 约 {{if value.use_time}} {{value.use_time}} {{else}} {{value.transport?value.transport[0].tooltime:""}} {{/if}}</span><span class="fr">{{if value.date}} {{value.date.replace(".","月")+"日"}} {{/if}}</span></div>\
                                            <div class="currCity">\
                                                <span class="cityname">{{value.thisCity}}</span>\
                                                <div class="fr"><span class="">{{value.betw_time||"09:00 - 18:00"}}</span></div>\
                                            </div>\
                                            {{else}}\
                                             <div class="header_traffic"><span class="br1 daynum">Day{{value.dayindex+1}}</span><span class="daynum">{{value.thisCity}}</span><span class="fr">{{if value.date}} {{value.date.replace(".","月")+"日"}} {{/if}}</span><span class="fr br1">{{value.betw_time||"09:00 - 18:00"}}</span></div>\
                                            {{/if}}\
                                        </div>\
                                        {{each value.day as item key}}\
                                        <div class="eachList spot clearfix" city_id ={{item.city_id||item.info.city_id}} spot_name={{item.this_name}} lng={{item.this_lng}} lat={{item.this_lat}} this_type={{item.this_type}} this_floor_index={{item.this_floor_index}}>\
                                            <span class="spotIndex">{{key<9?"0"+(key+1):(key+1)}}</span>\
                                            <div class="imgouter fl">\
                                                <img src="{{item.info.spot_image_url}}" alt="">\
                                            </div>\
                                            <div class="list_info fl">\
                                                <div class="eachtitle">\
                                                    <span class="spotname">{{item.this_name}}</span><span>游玩时间：{{item.this_playtime||item.info.play_time}}</span>\
                                                    <div class="fr">{{item.spotType}} {{if item.ranking&&item.ranking<9}}· 第 <span class="num">{{item.ranking}}</span> 名{{/if}}\
                                                    </div>\
                                                </div>\
                                                <div class="explain">{{item.info.absture}}</div>\
                                                <div class="info_wap"><span class="weight">景点地址：</span>{{item.info.address}}</div>\
                                                <div class="info_wap"><span class="weight">开放时间：</span>{{item.info.business_hours}}</div>\
                                                <div class="info_wap"><span class="weight">景点门票：</span>{{#item.info.attractions_tickets}}</div>\
                                            </div>\
                                        </div>\
                                        {{if key<value.day.length-1}}\
                                         <div class="commen_traffic" this_city="{{value.thisCity}}" this_lng="{{item.this_lng}}" this_lat="{{item.this_lat}}" next_lng="{{value.day[key+1].this_lng}}" next_lat="{{value.day[key+1].this_lat}}">\
                                            <div class="trafficType">\
                                                <span> 暂无公共交通信息</span>\
                                            </div>\
                                            <span class="toggle fr">[展开详情]</span>\
                                        </div>\
                                        {{/if}}\
                                        {{/each}}\
                                        {{if value.day.length == 0}}\
                                             <div class="eachList tac"> <img class="nospot" src="/static/v1/img/tripinfo/undraw_fast_car_p4cu.png" alt=""><div>当天未安排行程，好好休息吧~</div> </div>\
                                        {{/if}}\
                                        {{if  value.hotel && value.hotel.hotel_name}}\
                                        <div class="eachList hotel clearfix" hotelid={{value.hotel.hotel_id}}>\
                                            <div class="imgouter fl">\
                                                <img src="{{value.hotel.ThumbNailUrl.replace("120_120","350_350")}}" alt="">\
                                            </div>\
                                            <div class="list_info fl">\
                                                <div class="eachtitle">\
                                                    <span class="spotname"> {{value.hotel.hotel_name}}</span>\
                                                    <div class="fr">酒店住宿  <strong></strong>入住时间：<span class="num">{{if value.date}} {{value.date.replace(".","月")+"日"}} {{/if}}</span>\
                                                    </div>\
                                                </div>\
                                                <div class="explain">{{value.hotel.Features}}</div>\
                                                <div class="info_wap"><span class="weight">电话：</span>{{value.hotel.tel||"暂无详情"}}</div>\
                                                <div class="info_wap"><span class="weight">商圈：</span>{{value.hotel.BusinessZoneName||"暂无详情"}}</div>\
                                                <div class="info_wap"><span class="weight">地址：</span>{{value.hotel.address}}</div>\
                                            </div>\
                                        </div>\
                                        {{/if}}\
                                    </div>\
                                </div>\
                                {{if i<dayArray.length-1}}\
                                    <p class="daylist_line"></p>\
                                {{/if}}\
                            {{/each}}' ;

                var commentListTemplate= '{{each data as value i}}\
                    <li class="list clearfix">\
                        <div class="headPic fl">\
                            {{if value.head_port}}\
                                <img src="{{value.head_port}}" alt="">\
                             {{else}}\
                                <img src="/static/v1/img/header.jpg" alt="">\
                            {{/if}}\
                        </div>\
                        <div class="com-info fr">\
                            <div class="name">{{value.user_name}} <span><i>☆</i><i>★</i><i>★</i></span></div>\
                            <div class="text">{{value.content}}</div>\
                            <div class="com-img clearfix">\
                                {{if value.image_url.length>0}}\
                                    {{each value.image_url as item k}}\
                                        <div class="pic_outer"><img src={{item}} alt=""></div>\
                                    {{/each}}\
                                {{/if}}\
                            </div>\
                            <div class="com-time clearfix">\
                                <div class="t-left fl">{{value.createTime}}</div>\
                                <div class="short fr"><span> <i class="ico like"></i>喜欢</span><span><i class="ico report"></i>举报</span></div>\
                            </div>\
                        </div>\
                    </li>\
                    {{/each}}'

                   
      function getBase64Image(img) { //img 转base64 ;
            var canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, img.width, img.height);
            var ext = img.src.substring(img.src.lastIndexOf(".")+1).toLowerCase();
            var dataURL = canvas.toDataURL("image/"+ext);
            return dataURL;
        }

        function renderCostTable (eachArr,allmoney,icon,Name,price,num,peopleInfo) {
            var htmlStr  = '';
            switch(icon)
            {
                case "traffic": //如果是交通 则根据不同的交通方式 渲染icon
                      htmlStr +='<tr>\
                                        <td rowspan="2"  class="t_tit">交通费用</td>\
                                        <td>当前交通费用共计 <span class="cost">¥'+allmoney +'元</span> </td>\
                                        <td class="tog_cost">[展开详情]</td>\
                                    </tr>\
                                    <tr>\
                                        <td colspan="2" class="info hide">\
                                            <table cellpadding="0" cellspacing="0" class="table_in">\
                                                <tr>\
                                                    <td>明细</td>\
                                                    <td>单价</td>\
                                                    <td>人数</td>\
                                                    <td>总价</td>\
                                                </tr>'

                    $(eachArr).each(function(i,ele){
                        var totmoney =  ele[price]*ele[num];
                        htmlStr+='<tr>\
                                    <td><i class="ico '+ele['traffic_ico']+'"></i>'+ele[Name]+'</td>\
                                    <td>¥'+ ele[price] +'元</td>\
                                    <td>'+ele[num]+'人</td>\
                                    <td>¥'+totmoney+'元</td>\
                                  </tr>'
                    })  
                    htmlStr+='     </table>\
                                </td>\
                            </tr>'
                break;
                case "eat"://如果是餐饮费用
                     htmlStr +='<tr>\
                                        <td rowspan="2"  class="t_tit">餐饮费用</td>\
                                        <td>当前餐饮费用共计 <span class="cost">¥'+allmoney +'元</span> </td>\
                                        <td class="tog_cost">[展开详情]</td>\
                                    </tr>\
                                    <tr>\
                                        <td  class="info hide" colspan="2">\
                                            <table cellpadding="0" cellspacing="0" class="table_in">\
                                                <tr>\
                                                    <td>明细</td>\
                                                    <td>单价</td>\
                                                    <td>人数</td>\
                                                    <td>总价</td>\
                                                </tr>'

                     $(eachArr).each(function(i,ele){
                         htmlStr+='<tr>\
                                    <td><i class="ico jd"></i>'+ele.name+'</td>\
                                    <td>¥'+ ele.price +'元</td>\
                                    <td>'+(peopleInfo.adult+peopleInfo.child)+'人</td>\
                                    <td>¥'+ele.total_price+'元</td>\
                                  </tr>'
                    })  
                    htmlStr+='     </table>\
                                </td>\
                            </tr>'
                break;
                case "ticket"://如果是门票费用
                     htmlStr +='<tr>\
                                        <td rowspan="2"  class="t_tit">门票费用</td>\
                                        <td>当前门票费用共计 <span class="cost">¥'+allmoney +'元</span> </td>\
                                        <td class="tog_cost">[展开详情]</td>\
                                    </tr>\
                                    <tr>\
                                        <td class="info hide" colspan="2">\
                                            <table cellpadding="0" cellspacing="0" class="table_in">\
                                                <tr>\
                                                    <td>明细</td>\
                                                    <td>单价</td>\
                                                    <td>人数</td>\
                                                    <td>总价</td>\
                                                </tr>'

                     $(eachArr).each(function(i,ele){
                         htmlStr+='<tr>\
                                    <td><i class="ico jd"></i>'+ele.spotName+'</td>\
                                    <td>¥'+ ele.ticket +'元</td>\
                                    <td>'+ ele.peopleNum +'</td>\
                                    <td>¥'+ele.totmoney+'元</td>\
                                  </tr>'
                    })  
                    htmlStr+='     </table>\
                                </td>\
                            </tr>'
                break;
                default: //如果是酒店 则渲染固定的icon
                  htmlStr +='<tr>\
                                <td rowspan="2" class="t_tit">酒店费用</td>\
                                <td>当前酒店费用共计 <span class="cost">¥'+allmoney +'元</span> </td>\
                                <td class="tog_cost">[展开详情]</td>\
                            </tr>\
                            <tr>\
                                <td colspan="2" class="info hide">\
                                    <table cellpadding="0" cellspacing="0" class="table_in">\
                                        <tr>\
                                            <td>明细</td>\
                                            <td>单价</td>\
                                            <td>数量</td>\
                                            <td>总价</td>\
                                        </tr>'

                     $(eachArr).each(function(i,ele){
                         htmlStr+='<tr>\
                                    <td><div class="name" title='+ele[Name]+'><i class="ico '+icon+'"></i>'+ele[Name]+'</div></td>\
                                    <td>¥'+ ele[price] +'元</td>'
                                    htmlStr +=  num=='number_night'? ' <td>'+ele[num]+'(晚)x'+Math.round((peopleInfo.child/2+peopleInfo.adult*1)/2)+'间</td>':' <td>'+ele[num]+'人</td>'
                                    htmlStr+=   num=='number_night'?'  <td>¥'+(ele[price]*ele[num])*Math.round((peopleInfo.child/2+peopleInfo.adult*1)/2)+'元</td>' :'<td>¥'+(ele[price]*ele[num])+'元</td>'+
                                  '</tr>'
                    })  
                    htmlStr+='     </table>\
                                </td>\
                            </tr>'

            }
        
        return htmlStr;
    }

    //上传图片
        var $tgaUpload1 = $('#commentPicUpload').diyUpload({
                url: '',
                formData :{
                    city_name:''
                },
                success: function(data) {
                    
                },
                error: function(err) {
                    
                },
                buttonText: '',
                fileNumLimit:3,
                fileSingleSizeLimit:50*1024*1024,//限制在50M
                accept: {
                    title: "图片或者视频上传",
                    extensions: 'gif,jpg,jpeg,bmp,png'
                },
                compress :{
                    noCompressIfLarger: true
                },

                thumb: {
                    width: 160,
                    height: 120,
                    quality: 100,
                    allowMagnify: true,
                    crop: true,
                    type: "image/jpeg"
                }
        });

    function renderComment (){
        var page = 1;
        getCommentData(1,true);
        $('.commentMask').on('click',function(event){
            $(this).hide();
            $(this).siblings('#commentbox').hide();
        })
        $('.userComment .toComment').on('click',function(){
            $('.commentMask').show().siblings('#commentbox').show();
        })
        $('#commentbox .submit').on('click',function(){
            var query = new FormData()
            var piclist = $tgaUpload1.getFiles('inited');
            $(piclist).each(function(i,ele){
                query.append('file[]',ele.source.source)
            })
            query.append('trip_id',trip)
            query.append('uid',this_uid)
            query.append('comment_text',$('#commentinfo').val());
            if(piclist.length ==0 && $('#commentinfo').val()==''){
                layer.msg('评论内容不能为空')
                return false;
            }
            var flag = false;
            $.ajax({
                type:'POST',
                url:'../Discuss',
                data:query,
                processData:false,
                contentType : false,
                dataType:'json',
                success:function(data){
                    flag = true;
                    if(data.status==true){
                        layer.msg('评论成功',{
                            time:1000
                        })
                       window.location.reload()
                    }
                },
                error:function(res){
                    layer.msg('图片太大，评论失败',{
                            time:1000
                        })
                }
            });
        })

        $('.com-list').on('click','img',function(){
            var img = $(this).attr('src');
            $('#imgShow img').attr('src',img);
            $('#imgShow').show().find('img').show(200);
        })
        $('#imgShow').on('click',function(){
            $(this).hide().find('img').hide();
        })

        $('.userComment .more').on('click',function(){
            page ++ ;
            getCommentData(page);
        })




    }

    function getCommentData (page,isinit){
        page = page?page:1;
        $.post('../HoldComment',{'trip_id':trip,'page':page},function(res){
            if(isinit && res.data.length<=0){
                return false;
            }
            $(res.data).each(function(){
                    if(isPhoneNumber(Number(this.user_name))){
                         var xx = this.user_name.substring(3,this.user_name.length-4);
                         this.user_name = this.user_name.replace(xx,"****");
                    }
             })

            if(res.data.length<=0){
                layer.msg('暂无更多评论',{
                    time:1000
                });
                return false;
            }
            var commentListRender = template.compile(commentListTemplate);
            var html = commentListRender(res);
            $('.userComment .com-list').append(html);
            $('.userComment .commentCount').html(res.count);
            $('.shortCart .tocom').html(res.count+'条');

        },'json')
    }
   
      /**判断是否是手机号**/
    function isPhoneNumber(tel) {
        var reg =/^0?1[3|4|5|6|7|8|9][0-9]\d{8}$/;
        return reg.test(tel);
    }
    
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

    function formatSeconds(value) {
        var secondTime = parseInt(value);// 秒
        var minuteTime = 0;// 分
        var hourTime = 0;// 小时
        if(secondTime > 60) {//如果秒数大于60，将秒数转换成整数
            //获取分钟，除以60取整数，得到整数分钟
            minuteTime = parseInt(secondTime / 60);
            //获取秒数，秒数取佘，得到整数秒数
            secondTime = parseInt(secondTime % 60);
            //如果分钟大于60，将分钟转换成小时
            if(minuteTime > 60) {
                //获取小时，获取分钟除以60，得到整数小时
                hourTime = parseInt(minuteTime / 60);
                //获取小时后取佘的分，获取分钟除以60取佘的分
                minuteTime = parseInt(minuteTime % 60);
            }
        }
        // var result = "" + parseInt(secondTime) + "秒";
        var result = "";

        if(minuteTime > 0) {
            result = "" + parseInt(minuteTime) + "分" + result;
        }
        if(hourTime > 0) {
            result = "" + parseInt(hourTime) + "小时" + result;
        }
        return result;
    }

    function UrlEncode(str){
      var ret="";
      var strSpecial="!\"#$%&'()*+,/:;<=>?[]^`{|}~%";
      var tt= "";

      for(var i=0;i<str.length;i++){
        var chr = str.charAt(i);
        var c=str2asc(chr);
        tt += chr+":"+c+"n";
        if(parseInt("0x"+c) > 0x7f){
          ret+="%"+c.slice(0,2)+"%"+c.slice(-2);
        }else{
          if(chr==" ")
            ret+="+";
          else if(strSpecial.indexOf(chr)!=-1)
            ret+="%"+c.toString(16);
          else
            ret+=chr;
        }
      }
      return ret;
    }

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
                // $(".gallery-top").html("");
                // $(".gallery-thumbs").html("");
        });

    // 酒店详情start
    // $('.more_pic_hotel .pic_hide').on('click',function(){
    //     $('.more_pic_hotel').hide();
    // })
    // $('.details_popup_box').on('click','.popup_img_url_hotel img,.more',function(){
    //     $('.more_pic_hotel').show().css({'z-index':'99'});
    // })
    $('.dayWap').on('click','.eachList.hotel',function(){
        var query ={}
        var day1 = getDate();
        var day2 = getDateAfter_n(day1,1,'-');
        query.hotel_id= $(this).attr('hotelid');
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
    $('.dayWap').on('click','.eachList.spot',function(){
        $('.tab_content.rwpopup_tab4').hide().siblings().show();
        $('.tab_tit.hotelmsg').hide().siblings().show();
        $('.hotel_info_right').hide();
        var query = {};
            query.this_floor_index = $(this).attr('this_floor_index');
            query.this_type = $(this).attr('this_type');
            query.lat = $(this).attr('lat');
            query.lng = $(this).attr('lng');
            query.city_id = $(this).attr('city_id');
            query.spot_name = $(this).attr('spot_name');
        $.post('/portal/itinerary/LookDetail',query,function(res){
                if(!res.status){
                    return false;
                    layer.msg('暂无景点详情')
                }

                $('.details_popup_box').show();
                var data = res.data;
                maskFn.detailsPopup(data,1)
                maskFn.morePictures(data.spot)
               /* $(".popup_img_box").on('click', ".last_li_img,li", function () {
                $(".more_pic_box_spot").fadeIn();
                    maskFn.morePictures(data.spot)
                });
    
                $(".pic_hide").click(function () {
                        $(".more_pic_box_spot").fadeOut();
                        $(".gallery-top").html("");
                        $(".gallery-thumbs").html("");
                });*/
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
                .find('.p2_hotelprice').hide().end()
                .find('.p2').show().end()
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
                observer:true,//修改swiper自己或子元素时，自动初始化swiper
                observeParents:true,//修改swiper的父元素时，自动初始化swiper
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

        function CheckIsChinese(val,isreturn){    //用于大交通是否加小时单位
             if(typeof(val)=='string' && val.trim()!=''){
                var reg = new RegExp("[\\u4E00-\\u9FFF]+","g");
            　   if(reg.test(val)){
                    return val;
                    }else{
                    return val+'小时';
                    }   
             }
        }  


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
    