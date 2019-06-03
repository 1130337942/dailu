$(function(){
	$('.listWap .wap1 .erwm').on('click',function(){	
		$(this).hide().siblings('.code').show();
		$('.listWap .normal').hide().siblings('.erwmBox').show();
	})
	$('.listWap .wap1 .code,.listWap .erwmBox .typeWap .to-passWorld').on('click',function(){	
		$('.listWap .wap1 .code').hide().siblings('.erwm').show();
		$('.listWap .erwmBox').hide().siblings('.normal').show();
	})
	$('.listWap .normal .register,.listWap .erwmBox .typeWap .to-register').on('click',function(){
		window.location.href='register.html'
	})

	$('#user,#passWorld').on('focus',function(){
		$(this).addClass('active').prev('label').addClass('active');
	}).on('blur',function(){
		$(this).removeClass('active').prev('label').removeClass('active');

	})
	var prevLink = document.referrer;  
	var host =window.location.host;		

	$(window).on('keydown',function(e){
			if(e.keyCode==13){
				doLogin();
			}
			
	})
	$('a.forget_password').on('click',function(){
		if(prevLink.indexOf('forget_password.html')==-1){
			sessionStorage.setItem("prev_link",prevLink)
		}
		window.location.href = '/portal/login/forget_password.html'
		
	})

	$('.listWap .wap4 .login').on('click',function(){
			doLogin();
	})

	function doLogin (){

		var userName = $('#user').val().trim();
		var passWorld = $('#passWorld').val().trim();
		if(!(userName&&passWorld)) return ;
		var postData ={};
		postData.user_name = userName;
		postData.pwd = passWorld;

		$.post('do_login',postData,function(data){
			
			if(data.error_code != false || data.msg !='OK'){
				alert(data.msg);
				return false;
			}

			if($.trim(prevLink)==''){ 
				window.location.href = '/';  
				return false
			}else{  
    			if(prevLink.indexOf(host)==-1){    //来自其它站点 
    				window.location.href = '/'; 
    				return false
    			}  
    			if(prevLink.indexOf('register.html')!=-1){      //来自注册页面  
    				window.location.href = '/';  
    				return false
    			}
    			if(prevLink.indexOf('forget_password.html')!=-1){      //来自忘记密码页面  
    				if(sessionStorage.getItem("prev_link")){
    					window.location.href = sessionStorage.getItem("prev_link"); 
    				}else{
    					window.location.href = '/';
    				}
    				  
    				return false
    			}    
    			window.location.href = prevLink;  
    			return false
    		} 
    	},'json')
	}

})