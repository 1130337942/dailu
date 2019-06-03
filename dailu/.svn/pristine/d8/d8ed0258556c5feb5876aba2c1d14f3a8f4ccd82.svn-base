
$(function(){
	var page = getUrlParam('page')||1;
	var show_status = getUrlParam('show_status');
	switch(show_status)
	{
		case '1':
		$('.limit_type.ispay').addClass('active');
		break;
		case '8':
		$('.limit_type.notpay').addClass('active');
		break;
		case '256':
		$('.limit_type.nottrip').addClass('active');
		break;
		default:
		$('.limit_type.all').addClass('active');
	}
	var totCount =$('.allist').attr('count');
		setPagination(totCount,page);
	var delId = null;
	var delTarget = '';
	var candel = true;
	$('.order_list .list_tit .delist').on('click',function(){
		delTarget = $(this).parents('.order_list');
		delId = $(this).attr('value');
		$('.del_msk').show();

	})

	$('.del_msk .confirm').on('click',function(){
		if(!candel) return false;
			candel = false;	
			$.post('delOrder',{'id':delId},function(res){
				candel =true ;
				if(res.status==true){
					delTarget.slideUp(300);
					$('.del_msk').hide()
				}else{
					$('.del_msk').hide()
					alert('订单出错，联系后台管理员')
				}
			},'json')
	})

	$('.del_msk .cancel').on('click',function(){
		$('.del_msk').hide()
	})

	$('.limit_wap .status .limit_type').on('click',function(){
		var show_status = $(this).attr('show_status');
		if(show_status){
			window.location.href="/portal/store/storeOrderlist.html?show_status="+show_status;
		}else{
			window.location.href="/portal/store/storeOrderlist.html";
		}
	})

	$('.center_list.position ul a').on('click',function(){
		window.location.href="/portal/aboutuser/personal_center.html";
	})
		function setPagination (totnum,page){   //设置翻页
			$("#pagination").pagination( {
				pageCount:5,   
				count:1,  
				current:page-0,
				prevContent:'上一页',  
				nextContent:'下一页', 
				totalData: totnum,
				showData: 8,
				coping: true ,
				callback:function (api){
				// api.getPageCount() 获取总页数
				// api.setPageCount(page) 设置总页数
				var index = api.getCurrent() //获取当前是第几页
				var href = window.location.search;
				window.location.href="/portal/store/storeOrderlist.html"+href+"&page="+index;
				
			}
		
		})
		};	
})
