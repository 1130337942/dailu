$(function(){
	var is_weixin = (function(){return navigator.userAgent.toLowerCase().indexOf('micromessenger') !== -1})();
	var is_dailu = (function(){return navigator.userAgent.toLowerCase().indexOf('dailu') !== -1})();
	if(is_dailu) {
		$('.header').hide();
	}

	$('.downApp').on('click',function(){
		if (/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)) {  //判断iPhone|iPad|iPod|iOS
			window.location.href ="https://itunes.apple.com/cn/app/%E8%A2%8B%E9%B9%BF%E6%97%85%E8%A1%8C/id1436562784?mt=8";
		}else{
			window.location.href="http://www.dailuer.com/upload/portal/袋鹿旅行.apk";
		}
	})
	

})