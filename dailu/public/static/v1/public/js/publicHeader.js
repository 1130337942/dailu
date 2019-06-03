

		var exit = document.getElementsByClassName('user_exit')[0];
		if(exit){
			exit.addEventListener('click',function(){
				delCookie('user_name')
			// window.location.reload()
		})
		}
		


		function SetCookie(name, value)//两个参数，一个是cookie的名子，一个是值
			{
			var Days = 30; //此 cookie 将被保存 30 天
			var exp = new Date(); //new Date("December 31, 9998");
			exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
			document.cookie = name + "=" + escape(value) + ";expires=" + exp.toGMTString();
			}
			function getCookie(name)//取cookies函数
			{
				var arr = document.cookie.match(new RegExp("(^| )" + name + "=([^;]*)(;|$)"));
				if (arr != null) return unescape(arr[2]); return null;
			}
			function delCookie(name)//删除cookie
			{
				var exp = new Date();
				exp.setTime(exp.getTime() - 1);
				var cval = getCookie(name);
				console.log(cval)
				if (cval != null) document.cookie = name + "=" + cval + ";expires=" + exp.toGMTString();
			}
			$('.user_exit').on('click',function(){
				$.post('/portal/login/un_rep',function(res){
					if(res.status=='ok'){
						if(window.location.href.indexOf('aboutuser')== '-1'){
							window.location.reload(true);
						}else{
							window.location.href='/';
						}
						
					}else{
						alert('退出失败，请联系管理员！')
					}
				},'json')
			})
	
		var uid = getCookie('uid');

		if(uid){
			$.post('/portal/aboutuser/PersonalInfo',{uid:uid},function(res){
				if(!res) return false;
				$('.user , .uname').text(res.user_name);
				if(res.sign){
					$('.autograph , .sign , .publicBanner .personInfo').text(res.sign)
				}
				if(res.head_port){
					$('.header .headPic img , img.headerPic , .userInfo .headerImg img').attr('src',res.head_port)
				}
			},'json')
		}else{
			
		}
	