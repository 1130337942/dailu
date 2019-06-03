$(function(){

	// 校验是否有汉字
	var zhReg = /[\u4e00-\u9fa5]+/;
	var phoneReg = /^1[3456789]\d{9}$/;
	var passWorldReg =/^[a-zA-Z0-9]{6,20}$/;
	var codeReg = /^[0-9a-zA-Z]{10}-[0-9a-zA-Z]{6}$/;
	var countdown=60;  /*重新发送短信倒计时*/
	var canSend = true;/*是否能发送验证码*/
	var checkUserTimer;  /*用户名延迟校验定时器*/
	var checkPhoneTimer;  /*用户名延迟校验定时器*/
	var phonePass,passWorldPass,userPass =false; /*用户名是否通过*/
	var invitationPass = true ;
	var checkWorldTimer; /*密码延迟校验定时器*/
	var checkinvitationTimer;/*邀请码检验定时器*/
	var prevLink = document.referrer;
	var host = window.location.host;
	var share_pic = 'http://www.dailuer.com/static/v1/img/tripinfoShare/prev1.png'; /*分享出去的预览图*/
	var share_url = window.location.href;
	var sharetitle="分分钟设计出属于自己的旅行路书，方便又快捷，你也来试试吧！"; /*微信分享的标题*/
	var sharedesc="不用查攻略也能设计出合理好玩的路线"; /*微信分享的副标题*/
	var picvige = false;
	var invitationCode = '';
		invitationCode = getUrlParam('invitation');
		if(invitationCode){
			$('#invitation').attr('disabled','disabled')
		}else{
			$('#invitation').hide();
			$('.list2 .in-lab').hide();
		}
	$('#invitation').val(invitationCode);

	$('.registerWap .registerBox .agree').on('click',function(){
		$('.agreementMask').fadeIn();
		$('.loginBox').fadeOut();
	})
	$('.agreementMask .agreementInfo .title .close,.agreementMask .agreementInfo .agreeBtn').on('click',function(){
		$('.agreementMask').fadeOut();
		$('.loginBox').fadeIn();
	})

	$('.registerWap .phone').on('input',function(){
		$(this).val($(this).val()>11?$(this).val().slice(0,11):$(this).val());	
	})

	wechatConfig();

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
			alert('请完成图形验证再发验证码')
			return false;
		}
		var geetest_challenge = $.trim($("input[name=geetest_challenge]").val());
		var geetest_validate = $.trim($("input[name=geetest_validate]").val());
		var geetest_seccode = $.trim($("input[name=geetest_seccode]").val());
		if(canSend &&  phonePass){
			$(this).addClass('disabled')
			settime($(this))
			$.post('GenerateForReg',{'phone':phoneNumber,'geetest_challenge':geetest_challenge,'geetest_validate':geetest_validate,'geetest_seccode':geetest_seccode},function(data){
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


	//用户名验证
		$('#user').on('input',function(){
			$(this).prev('label').removeClass('error');
			userPass =false;
			var _self = this;
			clearTimeout(checkUserTimer);
			checkUserTimer=setTimeout(function(){
				userPass =true;
				var userStr = $(_self).val();
				if(userStr.indexOf(' ')!=-1){
					$(_self).prev('label').addClass('error').find('.errInfo').text('用户名不能有空格');
					userPass =false;
					return;
				}
				if(zhReg.test(userStr)){
					if(userStr.length&&(userStr.length>8||userStr.length<2)){
						userPass =false;
						$(_self).prev('label').addClass('error').find('.errInfo').text('用户名必须是，2-8汉字/4-16字符');
					}
				}else{
					if(userStr.length&&(userStr.length>16||userStr.length<4)){
						userPass =false;
						$(_self).prev('label').addClass('error').find('.errInfo').text('用户名必须是，2-8汉字/4-16字符');
					}
				}
				clearTimeout(checkUserTimer);	
			},1000)
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

	// 邀请码
	$('#invitation').on('input',function(){
			$(this).prev('label').removeClass('error');
			invitationPass =false;
			var _self = this;
			clearTimeout(checkinvitationTimer);
			checkinvitationTimer=setTimeout(function(){
				invitationPass =true;
				var invitationStr = $(_self).val();
				if(!codeReg.test(invitationStr)&&invitationStr){
						invitationPass =false;
						$(_self).prev('label').addClass('error').find('.errInfo').text('邀请码无效');
					
				}
			clearTimeout(checkinvitationTimer)	
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
		if((invitationPass||$('#invitation').val().trim()=='')&&phonePass&&passWorldPass&&userPass&&($('#phoneCode').val()!='')){
				var psotData = {};
					psotData.phone = $('#phone').val().trim();
					psotData.user_name = $('#user').val().trim();
					psotData.pwd = $('#passWorld').val().trim();
					psotData.vfycode = $('#phoneCode').val().trim();
					psotData.p_refer_code = $('#invitation').val().trim();
					psotData.ornot = $('#invitation').val().trim()==''?false:true;
			 $.post('register_request',psotData,function(data){
				switch(data.error_code)
				{	case false:
					if(prevLink.indexOf(host)==-1){    //来自其它站点  
					window.location.href = '/';  
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

	/*微信分享 start*/
// var mpid = 'wx6a68684031971e42';



function wechatConfig() {        
    $.ajax({
        type: 'post',
        url: '../itinerary/wxSignature',
        data:{'url':encodeURIComponent(share_url)},
        dataType: "json",
        success: function(data) {
            var config_obj = data;
            wx.config({
                debug: false,
                appId: config_obj.app_id,
                timestamp: config_obj.timestamp,
                nonceStr: config_obj.nonce_str,
                signature: config_obj.signature,
                jsApiList: [
                    'onMenuShareTimeline',
                    'onMenuShareAppMessage',
                    'onMenuShareQQ',
                    'onMenuShareWeibo'
                ]
            });
            wx.ready(function () {
                wx.onMenuShareAppMessage({
                    title: sharetitle,
                    desc: sharedesc,
                    link: share_url,
                    imgUrl: share_pic,
                    success: function (res) {
                    },
                    cancel: function (res) {
                    },
                    fail: function (res) {
                    }
                });

             
                wx.onMenuShareTimeline({
                    title: sharetitle+sharedesc,
                    link: share_url,
                    imgUrl: share_pic,
                    success: function (res) {
                    },
                    cancel: function (res) {
                    },
                    fail: function (res) {
                    }
                });
                wx.onMenuShareQQ({
					title: sharetitle, // 分享标题
					desc: sharedesc, // 分享描述
					link: share_url, // 分享链接
					imgUrl: share_pic, // 分享图标
					success: function () {
					
					},
					cancel: function () {
					
					}
				});
            });
            wx.error(function(res){
            });

    	setShareInfo({
         title:          sharetitle,
         summary:        sharedesc,
         pic:            share_pic,
         url:            share_url,
         WXconfig:       {
             swapTitleInWX: true,
             appId: config_obj.app_id,
             timestamp: config_obj.timestamp,
             nonceStr: config_obj.nonce_str,
             signature: config_obj.signature
        	 }
     	});

        },
        error:function(xhr, type) {
        }
    });


}


/*微信分享 end*/

})

