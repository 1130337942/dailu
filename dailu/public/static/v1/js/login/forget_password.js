$(function(){

	// 校验是否有汉字
	var zhReg = /[\u4e00-\u9fa5]+/;
	var phoneReg = /^[1][3-8]+\d{9}/;
	var passWorldReg =/^[a-zA-Z0-9]{6,20}$/;
	var codeReg = /^[0-9a-zA-Z]{10}-[0-9a-zA-Z]{6}$/;
	var countdown=60;  /*重新发送短信倒计时*/
	var canSend = true;/*是否能发送验证码*/
	var checkUserTimer;  /*用户名延迟校验定时器*/
	var checkPhoneTimer;  /*用户名延迟校验定时器*/
	var phonePass,passWorldPass,userPass,invitationPass =false; /*用户名是否通过*/
	var checkWorldTimer; /*密码延迟校验定时器*/
	var checkinvitationTimer;/*邀请码检验定时器*/
	var prevLink = document.referrer;
	var picvige = false;
	var host = window.location.host;

	$('.registerWap .phone').on('input',function(){
		$(this).val($(this).val().length>11?$(this).val().slice(0,11):$(this).val());	
	})

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
        url: "StartCaptchaServlet?t="+ (new Date()).getTime(), // 加随机数防止缓存
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


	$('.phoneCode .sendCode').on('click',function(){
		var phoneNumber = $('#phone').val().trim();
		if(!picvige){
			alert('请先完成图形验证码');
			return false;
		}
		var geetest_challenge = $.trim($("input[name=geetest_challenge]").val());
		var geetest_validate = $.trim($("input[name=geetest_validate]").val());
		var geetest_seccode = $.trim($("input[name=geetest_seccode]").val());
		if(canSend &&  phonePass){
			$(this).addClass('disabled')
			settime($(this))
			$.post('Generate',{'phone':phoneNumber,
						'geetest_challenge':geetest_challenge,
                        'geetest_validate':geetest_validate,
                        'geetest_seccode':geetest_seccode},function(data){
				switch(data.error_code)
				{	case 1:
					alert(data.msg)
					break;
					case 2:
					alert('验证过于频繁,请稍后再试')
					break;
				}
			},'json')
		}	
		
	})

	$('.mainBox .loginBox .close').on('click',function(){
		if($.trim(prevLink)==''){  
				window.location.href = '/';  
				return false
			}else{  
    			if(prevLink.indexOf(host)==-1){    //来自其它站点  
					window.location.href = host;  
    				return false
    			}  
    			if(prevLink.indexOf('register.html')!=-1){      //来自注册页面  
    				window.location.href = '/';  
    				return false
				}  
    			window.location.href = prevLink;  
    			return false
    		} 

	})


	$('#user,#phone,#passWorld ,#invitation').on('focus',function(){
		$(this).addClass('active').prev('label').addClass('active');
	}).on('blur',function(){
		$(this).removeClass('active').prev('label').removeClass('active');

	})	
	
 
	// 手机号码验证
	$('#phone').on('input',function(){
			$(this).prev('label').removeClass('error');
			phonePass =false;
			var _self = this;
			clearTimeout(checkPhoneTimer);
			checkPhoneTimer=setTimeout(function(){
				phonePass =true;
				var phoneStr = $(_self).val()-0;
				if(!phoneReg.test(phoneStr)){
						phonePass =false;
						$(_self).prev('label').addClass('error').find('.errInfo').text('请输入正确手机号码');
					
				}
			clearTimeout(checkPhoneTimer)	
			},1000)
		})

	

	//密码验证 
	$('#passWorld').on('input',function(){
			$(this).prev('label').removeClass('error');
			passWorldPass =false;
			var _self = this;
			clearTimeout(checkWorldTimer);
			checkWorldTimer=setTimeout(function(){
				passWorldPass =true;
				var passWorld = $(_self).val()+'';
				if(passWorld.length<6){
						passWorldPass =false;
						$(_self).prev('label').addClass('error').find('.errInfo').text('密码需大于等于6位');
				}
			clearTimeout(checkWorldTimer)	
			},1000)
		})



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
			obj.text('重新发送('+ countdown + ')'); 
			countdown--; 
		} 
		setTimeout(function() { 
			settime(obj) }
			,1000) 
	}

	$('.go_register').on('click',function(){
		if(phonePass&&passWorldPass&&($('#phoneCode').val()!='')){
				var psotData = {};
					psotData.phone = $('#phone').val().trim();
					psotData.pwd = $('#passWorld').val().trim();
					psotData.vfycode = $('#phoneCode').val().trim();
			 $.post('pwdModify',psotData,function(data){
				switch(data.error_code)
				{	case false:
					if(prevLink.indexOf(host)==-1){    //来自其它站点  
					window.location.href = host;  
    				}else{
    					window.location.href = prevLink;  
    				}  
					break;
					case true:
					alert(data.msg);
					break;
				}
				
			},'json')
		}else{
			console.log('error')
		}
	})



})

