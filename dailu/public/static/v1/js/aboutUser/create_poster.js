$(function(){
	var reg=/^[0-9]+.?[0-9]*$/;
	var tripId = getUrlParam('tripId');
	var tripuid = getUrlParam('u');
	var shareUrl = 'http://'+window.location.host+'/portal/itinerary/tripinfoshare.html?them='+  tripuid +'&trip='+tripId;
	var logo = '';
	var cover = '';
	$("#trip_ewm").qrcode({
			width: 100, //宽度  
			height: 100, //高度  
			text: shareUrl, //任意内容 
	});
		var x = 100 * 0.38;                                                                  
        var y = 100 * 0.38;                                                                 
        var lw = 100 * 0.28;                                                                 
        var lh = 100 * 0.28; 
    $("#trip_ewm canvas")[0].getContext('2d').drawImage($("#hh")[0], x, y, lw, lh); 
    $.post('EditPoster',{trip_id:tripId},function(res){
    	if(!res.status) {
    		return false;	
    	}
    	// $('.write_info input').on('change',function(){
    	// 	$('.up_btn').removeClass('disabled');
    	// })
    	$('.editImg').on('click',function(){
    		$('.trip_ewmbox').show();
    	})
    	$('.trip_ewmbox').hide();
    	$('.poster_img_box .poster_img').attr('src',res.data.pic);
    	$('.write_info').find('.title_info input').val(res.data.poster_name).end()
    		$(".tphone_btn .pic_ewm").qrcode({
										width: 145, //宽度  
										height: 145, //高度  
										text: res.data.pic, //任意内容 
									});
    		$('.downPicBox .inner').hide().siblings('.poster_img_box ').show();
    		
    },'json')

	$('.ctrl_wap .down_btn').on('click',function(){
		var posterName = $('.title_info input').val();
		if(posterName==''){
			posterName= '我的行程单海报'
		}
		html2canvas(document.querySelector(".downPicBox")).then(canvas => {
            Canvas2Image.saveAsJPEG(canvas,428,760,posterName);

    	});
	})
	$('.tphone_btn').on('click',function(){
		$(this).find('.pic_ewm').toggle();
	})

	$('.trip_ewmbox').on('mousedown',function(event){
			var pageX = eventUtil.getPageX(event);
        	var pageY = eventUtil.getPageY(event);
        	var boxX = pageX;
        	var boxY = pageY ;
        	var startLeft = $('.trip_ewmbox').position().left;	
        	var startTop=  $('.trip_ewmbox').position().top;
        	$('.left_wap').on('mousemove',function(){
        		var event = eventUtil.getEvent(event);
            	var pageX = eventUtil.getPageX(event);
            	var pageY = eventUtil.getPageY(event);
            	var nowLeft = startLeft+pageX-boxX;
            	var nowtop= startTop+pageY - boxY;
            	nowLeft = nowLeft<12?12:nowLeft;
            	nowLeft = nowLeft>390?390:nowLeft;
            	nowtop = nowtop<12?12:nowtop;
            	nowtop = nowtop>652?652:nowtop;
           		$('.trip_ewmbox').css({'left':nowLeft+'px','top':nowtop+'px'});
            	window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty();
        	})
        	
	})
	$('.trip_ewmbox').on('mouseup',function(){
		 $('.left_wap').off('mousemove')
	})
	
	$('.up_btn').on('click',function(){
		if($(this).hasClass('disabled')) return false;
		html2canvas(document.querySelector(".downPicBox")).then(canvas => {
			var base64Img =canvas.toDataURL("image/png")
			var query ={};
			query.trip_id = tripId;
			query.poster_name = $('.title_info input').val();
			query.pic =base64Img;
			query.logo =logo;
			$.post('AddPoster',query,function(res){
				if(res.status==true){
					layer.msg('保存成功',{
						time:3000
					})
					$('.up_btn').addClass('disabled');
					$(".tphone_btn .pic_ewm").html('');
					$(".tphone_btn .pic_ewm").qrcode({
										width: 145, //宽度  
										height: 145, //高度  
										text: res.data, //任意内容 
									});
				}else{
					layer.msg('上传失败',{
						time:3000
					})
				}
			},'json')
		});
	})		

	 //上传海报
		var clipArea = new bjj.PhotoClip("#clipArea", {
			size: [428, 760],// 截取框的宽和高组成的数组。默认值为[260,260]
			outputSize: [428, 760], // 输出图像的宽和高组成的数组。默认值为[0,0]，表示输出图像原始大小
			//outputType: "jpg", // 指定输出图片的类型，可选 "jpg" 和 "png" 两种种类型，默认为 "jpg"
			file: ".file_input", // 上传图片的<input type="file">控件的选择器或者DOM对象
			ok: "#clipBtn", // 确认截图按钮的选择器或者DOM对象
			loadStart: function() {
				// 开始加载的回调函数。this指向 fileReader 对象，并将正在加载的 file 对象作为参数传入
				$('.cover-wrap').fadeIn();
				console.log("照片读取中");
			},
			loadComplete: function() {
				 // 加载完成的回调函数。this指向图片对象，并将图片地址作为参数传入
				console.log("照片读取完成");
			},
			//loadError: function(event) {}, // 加载失败的回调函数。this指向 fileReader 对象，并将错误事件的 event 对象作为参数传入
			clipFinish: function(dataURL) {
				 // 裁剪完成的回调函数。this指向图片对象，会将裁剪出的图像数据DataURL作为参数传入
				$('.cover-wrap').fadeOut();
				$('img.poster_img').attr('src',dataURL);
				$('.left_wap .inner').hide().siblings('.poster_img_box').show();
				$('.up_btn').removeClass('disabled')
				
			}
		});


		var eventUtil = {
			getEvent: function (event) {
				return event || window.event;
			},
			getPageX: function (event) {
				return event.pageX || event.clientX + document.documentElement.scrollLeft;
			},
			getPageY: function (event) {
				return event.pageY || event.clientY + document.documentElement.scrollTop;
			},
			stopPropagation: function (event) {
				if (event.stopPropagation) {
					event.stopPropagation();
				} else {
					event.cancelBubble = true;
				}
			},
			getTarget: function (event) {
				return event.target || event.srcElement;
			}
	};

})