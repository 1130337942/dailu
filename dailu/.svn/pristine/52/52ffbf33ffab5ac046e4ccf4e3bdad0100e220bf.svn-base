$(function(){
	var uid = getCookie('uid');
	$.post('invitationData',{uid:uid},function(res){
		var loginPath = window.location.origin +'/portal/login/register.html?invitation=';
			loginPath = encodeURI(loginPath) +res.refer_code;
			$('#foo').val(loginPath);
	},'json')


	var clipboard = new ClipboardJS('.copy');
	clipboard.on('success', function(e) {
		e.clearSelection();
		layer.msg('复制成功',{
			time:600,
			offset:'200px'
		})
		
	});

	clipboard.on('error', function(e) {
		layer.msg('复制失败请手动复制',{
			time:600,
			offset:'200px'
		})
	});
	 

})