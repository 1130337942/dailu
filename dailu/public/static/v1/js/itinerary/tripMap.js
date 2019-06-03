$(function(){
	var pointArr =[]; 
	var pointArr = Get_ssdata('mapInfo');
	var txetMarkers = [];//标记点数组
	var Amap = new AMap.Map("mapContainer", {
				view: new AMap.View2D({//创建地图二维视口
                			center:[120.169122,30.239956],//创建中心点坐标
                			zoom: 14, //设置地图缩放级别
                			rotation: 0 //设置地图旋转角度
           			 }),
                  center: [120.169122,30.239956],
                  zoom: 14,
                  mapStyle:'amap://styles/bb63db3182ec26f76bce1fe6f8a01243'
                });

		/*var myurl = '';
		var dlMap = new AMap.TileLayer.Flexible({
			 	cacheSize: 255,
			 	zooms:[13,18],
			 	zIndex:13,
				createTile:function(x, y, z, success, fail){
					myurl= 'http://qn'+z +'.5199yl.com/tile'+x+'_'+y+'.png?v='+Math.random();
					var img = document.createElement('img');
						 img.src = myurl;
					img.onload = function () {
						success(img)//除了img 还支持canvas
					};
           			//img.crossOrigin = "anonymous";//3D 的时候添加，同时图片要有跨域头
           			 img.onerror = function () {
            			fail()
            		};
				}
			})
		dlMap.setMap(Amap);*/
		$('.header .prevPage').on('click',function(){
			window.history.go(-1);
		})
		

  var model ={
  	maplayOut:function(){
  			var parthArr = [];//地图连线路径数组
  			for(var i=0;i<pointArr.length;i++){
  				parthArr.push(new AMap.LngLat(pointArr[i].this_lng,pointArr[i].this_lat))
  				var text = new AMap.Text({
  					text:i+1,
  					extData:{
  						id:'point'+i
  					},
        			anchor:'center', // 设置文本标记锚点
        			draggable:false,
        			cursor:'pointer',
        			angle:10,
        			style:{
        				'padding': '0rem 0rem',
        				'border-radius': '50%',
        				'background-color': 'rgba(101, 159, 245, 1)',
        				'width': '0.18rem',
        				'border-width': '3px',
        				'text-align': 'center',
        				'font-size': '12px',
        				'font-style':'normal',
        				'color': '#fff',
        				'border-color':'#fff',
        				'transform':'rotate(0deg)'
        				},
        			position: [pointArr[i].this_lng,pointArr[i].this_lat]
        		});
        		txetMarkers.push(text);
  				text.setMap(Amap);
  				text.on('click',function(){
  					// this.setStyle({'background-color':'#f4a21e'})
  				})
  			}
  		var polyline = new AMap.Polyline({
  			path: parthArr,  
    		borderWeight: 2, // 线条宽度，默认为 1
    		strokeColor: 'rgba(101, 159, 245, 1)', // 线条颜色
    		lineJoin: 'round' // 折线拐点连接处样式
    	});

  		Amap.add(polyline);//添加标记点
 		Amap.setFitView(); // 添加折线

 		txetMarkers[0]. setStyle({'background-color':'#f4a21e'})
 		// $('#point0').css({'background-color':'red'})
	},
	layoutSlider: function(){
	  		var pointObj = {};
            pointObj.pointArr = pointArr;
            var silderRender = template.compile(sliderTemp);
            var html = silderRender(pointObj);
            $('.cardBox .card_inner').html(html);


            var swiper = new Swiper('.swiper-container', {
    					lazyLoading:true,
    					speed:1000,
    					observer: true,
    					observeParents: true,
    					slidesPerView:1.1,
    					centeredSlides: true,
    					spaceBetween: 10,
    					on:{
    						slideChangeTransitionStart: function(event){//slider change事件
    							for(var i=0;i<txetMarkers.length;i++){
    								if(swiper.realIndex == i){
    									txetMarkers[i]. setStyle({'background-color':'#f4a21e'})
    									var center = txetMarkers[i].getPosition();
    									Amap.setCenter(center);
    								}else{
    									txetMarkers[i]. setStyle({'background-color':'rgba(101, 159, 245, 1)'})
    								}
      								
    							}
    						},
    						click:function(event){
    							var curpoint= pointArr[swiper.activeIndex];
    							var floor = curpoint.this_floor_index;
                  var editFlag = curpoint.isedit;
                  var spot = encodeURI(encodeURI(curpoint.spot_name)) //中文乱码处理
                  var city = encodeURI(encodeURI(curpoint.this_city))
                  if(editFlag){  //如果景点编辑过则按tripId查询详情
                    window.location.href="/portal/itinerary/tripDetail.html?city="+ city+"&spot="+ spot+"&trip="+curpoint.trip+'&icity='+curpoint.this_city_index+'&iday='+curpoint.day_arr_index+'&ispot='+curpoint.spotIndex; 
                    return false;
                  }

    							if(curpoint.id==='' || floor===''){
    								layer.msg('该景点暂无详情，请试试其它景点哦',{
    									time:1000
    								})
    								return false;
    							}
    							window.location.href="/portal/itinerary/tripDetail.html?spot="+spot+'&city='+city+'&floor='+floor;
    						}
    					},
				}); 

		
		
	},

	}; 
  	
	model.maplayOut();
    model.layoutSlider();

})

 var sliderTemp = '{{each pointArr as value i}}\
					<div class="card_list swiper-slide" floor="{{value.this_floor_index}}" spotid="{{value.id}}">\
						<div class="left_img">\
							<img src="{{value.spot_image_url}}" alt="">\
						</div>\
						<div class="right_info">\
							<div class="name">{{value.spot_name}}</div>\
							<div class="suit">适玩季节：<span>{{value.suit_season}}</span></div>\
							<div class="address"><p>{{value.address}}</p><span class="more">详情</span></div>\
						</div>\
					</div>\
				{{/each}}'
