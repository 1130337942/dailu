$(function(){
	var isAllbus = false;
	var busNum = 0;
	var resArr = [];
	var postData = {}
	var this_uid = getCookie('uid');
	postData.is_hotel = sessionStorage.is_hotel=='ok'? "ok" :'';
	postData.is_edit = sessionStorage.is_edit=='ok'? "true" :"false";
	$.post('ServerData',postData,function(res){
			if(!res) return false;
			resArr = res.info;
			$(res.traffic).each(function(){
				switch(this.city_trc_name){
					case '飞机交通':
					this.station = '机场'
					break ;
					case '铁路交通':
					this.station = '火车站'
					break;
					default:
					this.station = this.city_name+'市';
				}

			})
			
			var cityStr = "<tr>"+
								"<td class='cityIndex' cityIndex='0' rowspan=''>"+res.info[0].this_city+"</td>"+
								"<td class='day_row' rowspan=''>D1</td>"+
								"<td class='bg'>"+res.info[0].day_arry[0].date+"</td>"+
								"<td colspan='' class='bg txl'>"+res.traffic[0].start_city+"出发 — "+res.traffic[0].city_trc_name+" — 到"+res.traffic[0].city_name+"</td>"+
								"<td colspan='' class='bg'>"+res.traffic[0].dis+"公里</td>"+	
								"<td class='bg line_server'></td>"+
							"</tr>"  
			var dayIndex = 0;
			$(res.info).each(function(i,ele){
				var citydata = this;
				var cityIndex = i;
				var  this_space = res.juliInfo[i]
				if(res.info[i+1] && res.info[i+1].prevHotel){
					this.day_arry[this.day_arry.length-1].hotel=res.info[i+1].prevHotel.hotel;
				}
				$(citydata.day_arry).each(function(j,ele){
					var dayData = this;
					var today_hotel = this.hotel.hotel_name==''?this.hotel.hotel_name:' — '+this.hotel.hotel_name;
					var prevDay_hotel ;
					var day_space = this_space[j].SpotDisSum==0?'不详':this_space[j].SpotDisSum+'公里';
					if (j>0){
						 prevDay_hotel = citydata.day_arry[j-1].hotel.hotel_name==''?citydata.day_arry[j-1].hotel.hotel_name: citydata.day_arry[j-1].hotel.hotel_name+' — '

					}else {
						if(cityIndex==0&&citydata.day_arry.length==1){ //如果一个城市只玩一天
							prevDay_hotel ='';
						}else{
							prevDay_hotel = this.hotel.hotel_name==''?this.hotel.hotel_name:this.hotel.hotel_name+' — ';

						}
					}
					
					
					var line_cros = '';
					$(dayData.day).each(function(i,ele){
						line_cros+=this.this_name;
						if(i<dayData.day.length-1){
							line_cros += ' — ';
						}
					})

					cityStr+="<tr>"+
						"<td class='cityIndex' cityIndex="+cityIndex +" rowspan='' >"+citydata.this_city+"</td>"+
						"<td class='day_row' rowspan=''>D"+(dayIndex+j+1)+"</td>"+
						"<td>"+ dayData.date+"</td>"+
						"<td class='txl'>"+prevDay_hotel+line_cros+  (j==citydata.day_arry.length-1?' - '+res.traffic[cityIndex+1].station:today_hotel)  +"</td>"+
						"<td colspan='' class=''>"+day_space+"</td>"+
						"<td class='city"+cityIndex +"'><span><i class='check bus'></i>包车</span></td>"+
					"</tr>";

				/*	cityStr+="<tr>"+
						"<td class='cityIndex' cityIndex="+cityIndex +" rowspan='' >"+citydata.this_city+"</td>"+
						"<td class='day_row' rowspan=''>D"+(dayIndex+j+1)+"</td>"+
						"<td>"+ dayData.date+"</td>"+
						"<td class='txl'>"+prevDay_hotel+line_cros+  (j==citydata.day_arry.length-1?' - '+res.traffic[cityIndex+1].station:today_hotel)  +"</td>"+
						"<td colspan='' class=''>"+dayData.SpotDisSum+"公里</td>"+
						"<td class='city"+cityIndex +"'><span><i class='check bus'></i>包车</span></td>"+
					"</tr>";*/


					
					if(j==citydata.day_arry.length-1){
						cityStr = cityStr+ "<tr>"+ 
						"<td class='cityIndex' cityIndex="+cityIndex +" rowspan='' >"+citydata.this_city+"</td>"+
						"<td class='day_row' rowspan=''>D"+(dayIndex+j+1)+"</td>"+
						"<td class='bg'><span class='last_day'>"+dayData.date+"</span></td>"+
						"<td colspan='' class='bg txl'>"+res.traffic[cityIndex+1].start_city+"出发 — "+res.traffic[cityIndex+1].city_trc_name+" — 到"+res.traffic[cityIndex+1].city_name+"</td>"+			
						"<td colspan='' class='bg'>"+res.traffic[cityIndex+1].dis+"公里</td>"+			
						"<td class='bg line_server'></td>"+
						"</tr>"
					}	
				})

				dayIndex+=citydata.day_arry.length;
			})
			
			$('tbody').append(cityStr);
			var cityArr=[]; /*城市数组*/
			var rowspanArr =[]; /*每个车市对应的rowspan 值*/
			
			$('tbody tr td.cityIndex').each(function(i,ele){
				if(cityArr.indexOf($(this).attr('cityindex'))==-1){
					cityArr.push($(this).attr('cityindex'));
				}
			})

			$(cityArr).each(function(i,ele){
				var rowspan =  0;
				var that = this;
				$('tbody tr td.cityIndex').each(function(){
					if(that==$(this).attr('cityindex')){
						rowspan ++
					}

				})
				rowspanArr.push(rowspan)
				rowspan =  1;
				
			})
			var row = 0;
			$(cityArr).each(function(i,ele){
				var that = this;
				var index = i;
				if(row!=0){
					row++
				}
				$('tbody tr td.cityIndex').each(function(k,ele){
					if($(this).attr('cityIndex') == that){
						if(k==row){
							$(this).attr('rowspan',rowspanArr[index]).removeClass('del')
						}else{
							row++
							$(this).addClass('del')
						}
						
					}

				})

			})

			$('tbody .del').remove();

			$('.line_server').each(function(i,ele){
				switch(res.traffic[i].city_trc_name){
					case '飞机交通':
					$(this).html("<span><i class='check  first_type'></i>接机</span><span><i class='check return_type'></i>送机</span>")
					break ;
					case '铁路交通':
					$(this).html("<span><i class='check  first_type'></i>接站</span><span><i class='check return_type'></i>送站</span>")
					break;
					default:
					""
				}
			})
			
			busNum = $('table i.bus').length;
			
					
	},'json')
		
	$.get('Title',{'uid':this_uid},function(res){
		if(res.travel_title){
			$('.name_wap .travel_title').val(res.travel_title);
			$('.headerPic').attr("src",res.image_cover)
		}
	},'json')	

	$('.mainTable').on('click','table i.bus',function(e){
		$(e.target).toggleClass('on');
		if(!$(e.target).hasClass('on')){
			isAllbus = false;
		}
		var checkNum = 0;
		$('table i.bus').each(function(i,ele){
			if(!$(this).hasClass('on')){
				isAllbus = false;
				return false;
			}else{
				checkNum ++ ;
			}
		})
		if (checkNum == busNum){
			isAllbus = true;
		}
		isAllbus?$('.allbus').addClass('on'):$('.allbus').removeClass('on');
		
	})
	
	$('.allbus').on('click',function(){
		$(this).toggleClass('on');
		$(this).hasClass('on')?$('table i.bus').addClass('on'):$('table i.bus').removeClass('on');
		// $('.allshare').removeClass('on')
	})

	// $('.allshare').on('click',function(){
	// 	$(this).toggleClass('on');
	// 	$(this).hasClass('on')?$('table i.bus').removeClass('on'):'';
	// 	$('.allbus').removeClass('on')
	// })
	 
	$('.mainTable').on('click','.bg .check',function(e){
		$(e.target).toggleClass('on');
	})
	$('.main .bottomServer .item3 span i').on('click',function(){
		$(this).toggleClass('on')
	})
	
	//编辑行程
	$('.btnBox .edit').on('click',function(){
		window.history.go(-1);
	})
	$('.nameMask .close').on('click',function(){
		$('.nameMask').hide();
	})
	$('.btnBox .check').on('click',function(){
		if(!getCookie('uid')){
			window.location.href='/portal/login/login.html';
			return false ;
		}
		$(".nameMask").show();
		//提交标题
		$('.name_wap span').on('click',function(){
			var query ={};
			query.travel_title = $('.travel_title').val().replace(' ','');
			if(query.travel_title ==''){
				layer.msg('请确定好行程标题了再试哦！',{
				time:2000,
				offset:'200px'
			})
				return false;
			}

			if(query.travel_title.length >100){
				layer.msg('行程标题长度不能大于100个字符',{
				time:2000,
				offset:'200px'
			})
				return false;
			}
			query.j_data = [];
			for(var i=0;i<resArr.length;i++){
				var temp = {};
				temp.city= resArr[i].this_city;
				temp.dayArr = [];
				var cityIndex = i ;
				$('.city'+i).each(function(k,ele){
					var day_list = {};
					/* 1 包车 */
					/* 0 未选交通工具 */
					day_list.travel_type =  $(this).find('.check.bus').hasClass('on')?'bus':'';
					day_list.date = resArr[i].day_arry[k].date;
					temp.dayArr.push(day_list);
				})                    
				query.j_data.push(temp); 
			}
			query.traffic =[];
			$('td.line_server').each(function(i,ele){
				var temp ={};
				temp.come = false;
				temp.send = false;
				if($(this).find('.first_type').hasClass('on')){
					temp.come = true;
				}
				if($(this).find('.return_type').hasClass('on')){
					temp.send = true;
				}
				query.traffic.push(temp);
			})

			query.is_plan_edit = sessionStorage.is_plan_edit=='ok'? "ok" :''
			query.is_hotel = sessionStorage.is_hotel=='ok'? "ok" :''
			query.is_edit = sessionStorage.is_edit=='ok'? "true" :"false";
			query.cover = $("img.headerPic").attr("src");
			$(".mask").show();
			$(".nameMask").hide();
			$.post('serverResult',query,function(res){
				if(res.status == 'ok'){
					window.location.href='/portal/itinerary/books.html?them='+res.uid + '&trip='+res.trip_id;
				}else{
					alert('增值服务提交失败');
					$(".mask").hide();
				}
			},'json')
		})

		
		
	});

	//上传头像
	var clipArea = new bjj.PhotoClip("#clipArea", {
		size: [600, 400],// 截取框的宽和高组成的数组。默认值为[260,260] 3:2 的比例
		outputSize: [600, 400], // 输出图像的宽和高组成的数组。默认值为[0,0]，表示输出图像原始大小
		//outputType: "jpg", // 指定输出图片的类型，可选 "jpg" 和 "png" 两种种类型，默认为 "jpg"
		file: "#file", // 上传图片的<input type="file">控件的选择器或者DOM对象
		ok: "#clipBtn", // 确认截图按钮的选择器或者DOM对象
		loadStart: function() {
			// 开始加载的回调函数。this指向 fileReader 对象，并将正在加载的 file 对象作为参数传入
			$('.cover-wrap').fadeIn();
			// console.log("照片读取中");
		},
		loadComplete: function() {
			 // 加载完成的回调函数。this指向图片对象，并将图片地址作为参数传入
			// console.log("照片读取完成");
		},
		//loadError: function(event) {}, // 加载失败的回调函数。this指向 fileReader 对象，并将错误事件的 event 对象作为参数传入
		clipFinish: function(dataURL) {
			 // 裁剪完成的回调函数。this指向图片对象，会将裁剪出的图像数据DataURL作为参数传入
			$('.cover-wrap').fadeOut();
			$('img.headerPic').attr('src',dataURL);
			// console.log(dataURL)
			var query ={};
				query.cover = dataURL;
				// EditPersonal
			$.post('UpCover',query,function(res){
				// console.log(res)
				if(res.status){
					layer.msg(res.msg,{
						time:600,
						offset:'250px'
					});
					$(".addcover_box,.file_box").fadeOut(300)
					$('.cover_txt1').text("修改行程封面")
					$('img.headerPic').attr('src',res.data.cover);
					$(".cover_box").hover(function(){
						$(".addcover_box,.file_box").fadeIn(300)
					},function(){
						$(".addcover_box,.file_box").fadeOut(300)
					})
				}else{
					layer.msg(res.msg,{
						time:600,
						offset:'250px'
					})
				}
			},'json')
		}
	});
	
})