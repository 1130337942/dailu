$(function(){
	var this_uid = getCookie('uid');
	var spot_Introduction = ueditorInit('spot_Introduction','');
	var attractions_tickets = ueditorInit('attractions_tickets','');
	var other_description = ueditorInit('other_description','');
	$.post('../Detail/ProvinceData',function(res){
		var provinceStr = '';
		$(res.data).each(function(){
			provinceStr +='<option value='+ this.area_id +'>'+ this.area_name +'</option>'	
		})
		$('#province').append(provinceStr)
	},'json')


	 $("#province").on("change", function () {
            var area_id = $(this).val();
            $('.city_id option').each(function () {
                if ($(this).text() != '城市') {
                    $(this).remove();
                }
            });
            $('.area_id option').each(function () {
                if ($(this).text() != '地区') {
                    $(this).remove();
                }
            });
            $.get("../Detail/getCityLink", {
                area_type: 2,
                area_id: area_id
            }, function (data) {
                var json = $.parseJSON(data);
                var option = "";
                $.each(json, function (key, val) {
                    option += '<option value="' + val.area_id + '">' + val.area_name +
                        '</option>';
                });
                $(".city_id").append(option);
            });

        });

	    //城市切换到区域/县
        $(".city_id").change(function () {
            var area_id = $(this).val();
            $('.area_id option').each(function () {
                $(this).remove();
            });
            $.get("../Detail/getCityLink", {
                area_type: 3,
                area_id: area_id
            }, function (data) {
                var json = $.parseJSON(data);
                var option = "";
                option += '<option value="">区/县</option>';
                $.each(json, function (key, val) {
                    option += '<option value="' + val.area_id + '">' + val.area_name +
                        '</option>';
                });
                $(".area_id").append(option);
            });
        });

        // $('.editor').each(function(i,ele){
        // 	var id = $(this).attr('type');
        // 	ueditorInit(id,'')
        // })

          $("#all").click(function() {
                $(":checkbox[name='vehicle']").prop("checked", this.checked); 
                getMonth()
            });
            $("input[name='vehicle']").on('click',function(){
                if( !this.checked){
                    $("#all").prop("checked", false);
                }
                getMonth()
            });
           
            function getMonth(){
                var month_num = "";
                $("input[name='vehicle']:checkbox:checked").each(function () {
                    month_num += $(this).val()+','
                });
                $("input[name='suit_season']").val(month_num.substring(0,month_num.length-1))
            }
            $('.submit_wap .back').on('click',function(){
            	window.history.go(-1);
            })

            $('.submit_wap .sbumit').on('click',function(){
            	var page_info = {};
            		page_info.city_id = $('.city_id').val()
					page_info.province_id = $('.province_id').val()
					page_info.area_id = $('.area_id').val()
					page_info.city_name = $('.city_id option:selected').text()
					page_info.spot_name = $('.spot_name').val()
					page_info.longitude = $('.longitude').val()
					page_info.latitude = $('.latitude').val()
					page_info.absture = $('.absture').val()
					page_info.spot_Introduction = spot_Introduction.getContent()
					page_info.attractions_tickets = attractions_tickets.getContent()
					page_info.other_description = other_description.getContent()
					page_info.suit_season = $('.suit_season').val()
					page_info.business_hours = $('.business_hours').val()
					page_info.phone = $('.phone').val()
					page_info.play_time = $('.play_time').val()
					page_info.address = $('.address').val()
					page_info.ticket_data = $('.ticket_data').val()
					
				for(var key in page_info){
					if(page_info[key]==""&& key!='area_id'){
						layer.msg('该页面都是必填项，请填完相应信息',{
							time:2000
						})
						return false ;
					}
				}
				
				page_info.play_time = $('.play_time').val()+'小时';
            	
            	
            	var query_photo = new FormData();
            	var piclist_photo = $tgaUpload_photo.getFiles('inited');
            	var piclist_cover = $tgaUpload_cover.getFiles('inited');

            	if(piclist_photo.length<1){
            		layer.msg('景点图片必须上传',{
            			time:2000
            		})
            		return false;
            	}

            	if(piclist_cover.length<1){
            		layer.msg('景点封面必须上传',{
            			time:2000
            		})
            		return false;
            	}

            	$(piclist_photo).each(function(i,ele){
					query_photo.append('file[]',ele.source.source)
				})
            		query_photo.append('file[]',piclist_cover[0].source.source);
            	$('.loadingMask').show();
            	
            	
            	$.ajax({
                	type:'POST',
                	url:'../Detail/Newphotos',
                	data:query_photo,
                	processData:false,
                	contentType : false,
                	dataType:'json',
                	success:function(res){

                	 	setInfo(res.data,page_info)
                	},
                	error:function(res){
						layer.msg('图片上传失败')
               		}
            	});
          })

          $('.laymap').on('click',function(){
          		$('#map_wap').show()
				$('#myPageTop').show()
          })  
   			
            //地图加载
			var map = new AMap.Map("map_wap", {
			    resizeEnable: true,
			   	center: [120.20545,30.205453],
			   	zoom: 13
			});
			var clickEventListener = map.on('click', function(e) {
			        document.getElementById("lnglat").value = e.lnglat.getLng() + ',' + e.lnglat.getLat()
			        	var pointArr = [];
			        	var temp = {};
			        		var x  = e.lnglat.getLng();
			        		var y  = e.lnglat.getLat();
			        		temp.Lng=x; 
			        		temp.Lat=y; 
			       $('#lnglat').attr('longitude',x)		
			       $('#lnglat').attr('latitude',y)		
			   });

			$('.close_map').on('click',function(){
				$('#map_wap').hide()
				$('#myPageTop').hide()
			})

			$('#myPageTop .confirm').on('click',function(){
				
				$('.longitude').val($('#lnglat').attr('longitude')||'');
				$('.latitude').val($('#lnglat').attr('latitude')||'');

				$('#map_wap').hide()
				$('#myPageTop').hide()
			})
            function setInfo (image_url,page_info){
            	var info ={
            		absture: "",//简介
					address: "",//地址
					area_id: '',//区域Id
					attr_score: "",//评分
					attractions_tickets: "",//门票详情
					ticket_data: 0,//门票价格
					business_hours: "",//开放时间
					city_id: "",
					city_name: "绍兴",//城市
					latitude: "30.0035580000",
					longitude: "120.5774240000",
					other_description: "",
					phone: "",
					play_time: "",//适玩时间
					province_id: "",
					spot_Introduction: "",//景点详情
					spot_image_url: "",//景点封面
					spot_name: "",//景点名称
					suit_season: ""//适玩月份
				}
				for(var key in page_info){
					info[key] = page_info[key]
				}
				info.spot_image_url = image_url[0]


				var query = {};
					query.info = info;
					query.image_url = image_url;
					query.uid = this_uid;
					$.post('../Detail/addseven',query,function(res){
						if(res.status==true){
							layer.msg('内容提交成功',{
								time:2000
							},function(){
								$('.loadingMask').hide();
								window.location.href="/portal/aboutuser/personal_spot.html"
							})
						}
					},'json').error(function(){
						layer.msg('内容上传失败')
					})
            }
          




var $tgaUpload_cover = $('#coverUpload').diyUpload({
				url: '',
				formData :{
					city_name:''
				},
				success: function(data) {
					
				},
				error: function(err) {
					
				},
				buttonText: '',
				fileNumLimit:1,
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
	
	var $tgaUpload_photo = $('#hotelUpload').diyUpload({
				url: '',
				formData :{
					city_name:''
				},
				success: function(data) {
					
				},
				error: function(err) {
					
				},
				buttonText: '',
				fileNumLimit:10,
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


function ueditorInit (id,content) {
	var ue = UE.getEditor(id,{
    					  	autoHeightEnabled: true,
        					autoFloatEnabled: true,
        					initialFrameWidth: '100%',
        					initialFrameHeight:300
    		  });
	 	
    	ue.addListener("ready", function () {
           ue.setContent(content);
           ue.execCommand('fontfamily','宋体');   //字体
           ue.execCommand('fontsize', '12px');       //字号
           ue.execCommand('lineheight',1.75);          //行间距
         
    	});

    	return ue;
}

})


