$(function(){
	var iframe = document.getElementById('urls');
    function iframeLoad() {
            iframe.height=document.getElementById("urls").contentWindow.document.body.clientHeight+100;
        }

    if (iframe.attachEvent){
        iframe.attachEvent("onload",function(){
            iframeLoad();
        });
    } else {
        iframe.onload = function(){
            iframeLoad();
        };
    }


	$('.left_wap .list').on('click',function(){
		if($(this).hasClass('active')&&$('.right_wap').hasClass('on')) return;
		$(this).addClass('active').siblings().removeClass('active');
		var src = $(this).attr('index');
		$('#urls').attr('src',src);
		$('.title .curry_way').text($(this).text());
	})
})