$(function(){  

	var demo = document.getElementsByClassName('demo')[0]
	var map = new BMap.Map("mapBox");
	// map.enableScrollWheelZoom();   //启用滚轮放大缩小，默认禁用
	map.enableContinuousZoom();    //启用地图惯性拖拽，默认禁用
	var point = new BMap.Point(120.211658,30.214868);
	map.centerAndZoom(point, 18);
	var marker = new BMap.Marker(point);  // 创建标注
	// map.addOverlay(marker);               // 将标注添加到地图中
	// marker2.setAnimation(BMAP_ANIMATION_BOUNCE); //跳动的动画
	var pointUs = new BMap.Point(120.211281,30.215898);

	var myIcon = new BMap.Icon("/static/v1/img/contactMarkr.png", new BMap.Size(30,30));           
	var marker2 = new BMap.Marker(pointUs,{icon:myIcon});
	map.addOverlay(marker2);           
	marker2.setAnimation(BMAP_ANIMATION_DROP); //跳动的动画	
	 		// 定义自定义覆盖物的构造函数  
			function SquareOverlay(point, text){
					    this._center = point;
					    this._text = text;
					
					}
					
					// 继承API的BMap.Overlay
					SquareOverlay.prototype = new BMap.Overlay();
					SquareOverlay.prototype.initialize = function(map){
					   			// 保存map对象实例
					   			this._map = map;
					
					   			var textLength = this._text.length
					   			// 创建div元素，作为自定义覆盖物的容器
					   			var div = document.createElement("div");
					   			div.style.position = "absolute";
					   			// 可以根据参数设置元素外观
					   			div.style.width = 12*textLength + "px";
					   			// div.style.height = 20 + "px";
					   			div.style.color = "#333";
					   			div.style.whiteSpace = "nowrap";
					   			div.style.backgroundColor = "#fff";
									//让文字不被选中
								div.style.MozUserSelect = "none";
								div.style.fontSize = "12px";
								div.style.borderRadius = "4px";
								div.style.overflow = "hidden";
							
							var title = document.createElement("div");
								title.style.width = "330px";
					   			title.style.height = "36px";
					   			title.style.lineHeight = "36px";
					   			title.style.paddingLeft = "20px";
					   			title.style.fontWeight = "600";
					   			title.appendChild(document.createTextNode('联系地址'));
								div.appendChild(title);

							var loca = document.createElement("div");
								loca.style.minWidth = "330px";
					   			loca.style.height = "36px";
					   			loca.style.lineHeight = "36px";
					   			loca.style.paddingLeft = "20px";
					   			loca.style.borderTop = "1px solid #e5e5e5";
					   			loca.appendChild(document.createTextNode(this._text));
								div.appendChild(loca);

							
									//创建一个文本节点 
					   			// 将div添加到覆盖物容器中
					   			map.getPanes().markerPane.appendChild(div);
					   			// 保存div实例
					   			this._div = div;
					   			// 需要将div元素作为方法的返回值，当调用该覆盖物的show、
					   			// hide方法，或者对覆盖物进行移除时，API都将操作此元素。
					   			return div;
					   		}
						// 添加自定义覆盖物   
					
						SquareOverlay.prototype.draw = function(){    
					// 根据地理坐标转换为像素坐标，并设置给容器    
							var position = this._map.pointToOverlayPixel(this._center);
							this._div.style.left = position.x - parseInt(this._div.style.width)/2  + "px";    
							this._div.style.top = position.y-110 + "px";    
							this._div.style.zIndex = -1;    
					
						}

						var mySquare = new SquareOverlay(pointUs,'地址:浙江省杭州市滨江区江晖路隆和国际603室 '); 
						map.addOverlay(mySquare);


						$('.type_online .pic_bg').on('click',function(){
							window.open('http://www.365webcall.com/chat/ChatWin3.aspx?settings=mw7mw6XN6PNwNPz3A7mXIPz3Am00mwXz3AX6mmPm&LL=0','你的袋鹿小管家','height=530, width=730, top=100, left=50, toolbar=no, menubar=no, scrollbars=no, resizable=no,location=no, status=no')

						})

})