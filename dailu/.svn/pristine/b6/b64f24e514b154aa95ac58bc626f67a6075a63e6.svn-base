$(function(){
	var type = getUrlParam('type');
	switch(type)
	{
		case 'deal':
		$('.rightFrame').hide().eq(0).show();
		$('.left_wap .list').eq(0).addClass('active').siblings().removeClass('active');
		break;
		case 'assert':
		$('.rightFrame').hide().eq(1).show();
		$('.left_wap .list').eq(1).addClass('active').siblings().removeClass('active');
		break;
		case 'duty':
		$('.rightFrame').hide().eq(2).show();
		$('.left_wap .list').eq(2).addClass('active').siblings().removeClass('active');
		break;
	}

	$('.left_wap .list').on('click',function(){
		if($(this).hasClass('active') && $('.right_wap').hasClass('on')) return;
		$(this).addClass('active').siblings().removeClass('active');
		var index = $(this).attr('index');
		$('.rightFrame').hide().eq(index).show();

	})
})