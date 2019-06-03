$(function(){
	var phoneReg = /^1[3456789]\d{9}$/;
	var canSend = true;
	var phonePass = true;
	var countdown = 180;
	var picvige = false;
	var successRoue = Boolean(Get_ssdata('shareRote'))?Get_ssdata('shareRote'):'/';
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
   	// $("#commit").prop('disabled',true).css('background','#ccc');
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


	$(".ctrl .sendcode").on("click",function(){
		var _self = this;
		if(!picvige){
			layer.msg('请先完成图形验证码',{
								time:1000,
								offset:'200px'
							})
			return false;
		}
		var geetest_challenge = $.trim($("input[name=geetest_challenge]").val());
		var geetest_validate = $.trim($("input[name=geetest_validate]").val());
		var geetest_seccode = $.trim($("input[name=geetest_seccode]").val());
		var phoneNumber = $('#phone').val().trim();
			checkPhone("#phone");
		if(canSend&&phonePass){
			settime($(this))
			$.post('../login/QuickReg',{'phone':phoneNumber,
						'geetest_challenge':geetest_challenge,
                        'geetest_validate':geetest_validate,
                        'geetest_seccode':geetest_seccode},function(data){
				switch(data.error_code)
				{	case 1:
					layer.msg(data.msg,{
						time:1000,
						offset:'200px'
					})
					canSend = true;
					countdown=0;
					break;
					case 2:
					layer.msg('验证过于频繁',{
						time:1000,
						offset:'200px'
					})
					break;
				}
			},'json')
		}
	})

	$("a.doLogin").on("click",function(){
		var phoneNumber = $('#phone').val().trim();
		var code = $('input.msg_code').val().trim();
			checkPhone("#phone");
			if(phonePass&&code!=""){
				$.post('../login/QuickLogin',{'phone':phoneNumber,'vfycode':code},function(data){
					if(data.error_code != false){
						layer.msg(data.msg,{
							time:1000,
							offset:'200px'
						})
						return false;
					}
					window.location.href = successRoue;  
					return false
			},'json')
		}
	})



	function checkPhone (target){
		var phoneStr = $(target).val()-0;
		if(!phoneReg.test(phoneStr)){
			phonePass =false;
			layer.msg('电话号码有误',{
				time:1000,
				offset:'200px'
			})
			$(target).focus();

		}else{
			phonePass =true;
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
			obj.text('重新获取验证码('+ countdown + ')'); 
			countdown--; 
		} 
		setTimeout(function() { 
			settime(obj) }
			,1000) 
	}
})