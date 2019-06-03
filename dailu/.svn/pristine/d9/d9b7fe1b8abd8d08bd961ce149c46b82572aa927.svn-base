$(function(){
	var emailReg = /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/;
	var phoneReg = /^1[3456789]\d{9}$/;
	var passWorldReg =/^[a-zA-Z0-9]{6,20}$/; 
	var u_id = getCookie('uid'); 
	var oddPhonePass=false;
	var countdown = 60;
	$.post('PersonalInfo',{uid:u_id},function(res){
		if (!res) return false ;
		$('#gender').val(res.sex)
		$('.phone_email .phone .info').text(res.phone);
		$('.phone_email .email .info').text(res.email);
		$('.s_wap .phone input').val(res.phone);
		$('.s_wap .email input').val(res.email);
		$('.s_wap .autograph_i input').val(res.sign);
		$('.s_wap .user_i input').val(res.user_name);
		laydate.render({
  		elem: '#birth',//指定元素
  		max:-7 ,
  		value: (res.birthDate?res.birthDate:'2000-01-01'),
  		change:function(value,date){

  		},
  		done:function(value,date){
  			var query ={'uid':u_id};
  			query.type = 'birth';
  			query.birth = $('#birth').val();
  			$.post('EditPersonal',query,function(res){
  				if (!res) return false;
  				if(res.status=='ok'){
  					layer.msg('生日修改成功',{
  						time:600,
  						offset:'200px'
  					})
  				}else{
  					layer.msg(res.message,{
  						time:600,
  						offset:'200px'
  					})
  				}
  			},'json')
  		}
  	});

	},'json')

	
	$('.s_wap .edit').on('click',function(){
		$('.s_wap input').removeClass('active');
		$(this).siblings().find('input').removeAttr("readonly").focus().addClass('active');
		$(this).hide().siblings('.save').show().siblings('.cancel').show();

	})

	$('.s_wap .cancel').on('click',function(){
		$('.s_wap input').removeClass('active');
		$(this).hide().siblings('.edit').show().siblings('.save').hide().siblings().find('input').attr('readonly',true).removeClass('active');

	})
	$('.edit_p').on('click',function(){
		$('.editphone_mask').show();
	})

	$('.editphone_mask .editBox .close').on('click',function(){
		$('.editphone_mask').hide().find('.newphone').hide().siblings('.oldphone').show();
	})

	$('.editphone_mask input').on('focus',function(){
		$('.editphone_mask input').removeClass('active');
		$(this).addClass('active');
	})

	$('.editphone_mask input').on('blur',function(){
		/*var val =$(this).val();
		if(!phoneReg.test(val)){
				$(this).addClass('error');
				layer.msg('手机号码格式错误',{
					time:600,
					offset:'200px'
				})
				return false ;
		}else{

			}*/
	})

	$('.editBox .oldphone .nextStep').on('click',function(){
		var oldCode = $('.oldphone .phonecode_wap input').val()
		$.post('url',{'code':oldCode},function(res){
				
		},'json')
		$('.editBox .oldphone').slideUp().siblings('.newphone').slideDown(300);

	})

	$('.editphone_mask .sendcode').on('click',function(){
		var phone = $(this).parent('.phonecode_wap').siblings('.phonenumber').val();
		if(!phoneReg.test(phone)){
				$(this).addClass('error');
				layer.msg('手机号码格式错误',{
					time:600,
					offset:'200px'
				})
				return false ;
		}else{
			if(!$(this).hasClass('disabled'))
				$.post('url',{'phone':phone},function(res){
					if(res.status==false){
						layer.msg('验证码发送错误60秒后重试',{
							time:600,
							offset:'200px'
						})
					}
				})
				settime($(this))
			}
	})

	$('.s_wap .edit_passworld').on('click',function(){
		$(this).parent('.password_edit').hide().siblings('.password_save').show().find('.fresh').slideDown(300);
		$('.formerly input').focus();
		
	})

	$('.position li').eq(0).on('click',function(){  //后面优化
		$('html,body').animate({'scrollTop':0},300)
	})

	$('.position li').eq(1).on('click',function(){ //后面优化
		$('html,body').animate({'scrollTop':($('.right_wap .safety').offset().top-68)},300)
		
	})

	$('.s_wap .save').on('click',function(){
		var _self = this ;
		var  type = $(this).attr('type');
		var  val = $(this).siblings().find('input').val();
		var query ={'uid':u_id};
		query.type = type ;
		query[type] = val;
		switch (type){
			case 'email':
			if(!emailReg.test(val)){
				layer.msg('邮箱格式错误',{
					time:600,
					offset:'200px'
				})
				return false ;
			}
			
			break;
			case 'user_name':
			if(Trim(val).length<2||Trim(val).length>12){
				layer.msg('用户名必须在2-12位之间',{
					time:600,
					offset:'200px'
				})
				return false ;
			}else{
				query[type] = Trim(val);
			}
			break;
			case 'sign':
			if(Trim(val).length>40){
				layer.msg('签名必须少于40位',{
					time:600,
					offset:'200px'
				})
				return false ;
			}else{
				query[type] = Trim(val);
			}
			break;
			case 'phone':
				if(!phoneReg.test(val)){
					layer.msg('手机号码格式错误',{
						time:600,
						offset:'200px'
					})
					return false ;
				}
				
			break;

		}
		$.post(' EditPersonal',query,function(res){
			if(res.status=='ok'){
				layer.msg('修改成功',{
					time:600,
					offset:'200px'
				})
				$(_self).hide().siblings('.edit').show().siblings().find('input').attr('readonly',true).removeClass('active');
				switch(type){
					case 'phone':
					$('.phone_email .phone .info').text(val);
					break ;
					case 'email':
					$('.phone_email .email .info').text(val);
					break;
					case 'user_name':
					$('.user,.uname').text(val);
					break;
				}

			}else{
				layer.msg(res.message,{
					time:600,
					offset:'200px'
				})
			}
		},'json')
	})

	$('.s_wap .p_save')	.on('click',function(){
		var query  ={'uid':u_id};
		query.type = 'password';
		query.old_pwd = $(this).parent('.fresh').siblings('.formerly').find('input').val().trim();
		query.new_pwd =$(this).siblings('input').val().trim();
		if(query.new_pwd.length<6){
			layer.msg('新密码必须大于6位',{
				time:600,
				offset:'200px'
			})
		}
		$.post('EditPersonal',query,function(res){
			if (!res) return false;
			if(res.status=='ok'){
				layer.msg('密码修改成功',{
					time:600,
					offset:'200px'
				})
			}else{
				layer.msg(res.message,{
					time:600,
					offset:'200px'
				})
			}
		},'json')
	})

	$('#gender').on('change',function(){
		var query ={'uid':u_id};
		query.type = 'sex';
		query.sex = $('#gender').val();
		$.post('EditPersonal',query,function(res){
			if (!res) return false;
			if(res.status=='ok'){
				layer.msg('性别修改成功',{
					time:600,
					offset:'200px'
				})
			}else{
				layer.msg(res.message,{
					time:600,
					offset:'200px'
				})
			}
		},'json')
	})


	function Trim(str)
	{ 
		return str.replace(/(^\s*)|(\s*$)/g, ""); 
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

	 //上传头像
		var clipArea = new bjj.PhotoClip("#clipArea", {
			size: [260, 260],// 截取框的宽和高组成的数组。默认值为[260,260]
			outputSize: [300, 300], // 输出图像的宽和高组成的数组。默认值为[0,0]，表示输出图像原始大小
			//outputType: "jpg", // 指定输出图片的类型，可选 "jpg" 和 "png" 两种种类型，默认为 "jpg"
			file: "#file", // 上传图片的<input type="file">控件的选择器或者DOM对象
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
				$('img.headerPic').attr('src',dataURL);
				var query ={'uid':u_id};
					query.type='head_port';
					query.head_port = dataURL;
				$.post(' EditPersonal',query,function(res){
					if(res.status=='ok'){
						layer.msg('修改成功',{
							time:600,
							offset:'200px'
						})
						
						$('img.headerPic,.headPic img').attr('src',dataURL);
					}else{
						layer.msg(res.message,{
							time:600,
							offset:'200px'
						})
					}
				},'json')
			}
		});
		
		//clipArea.destroy();

})