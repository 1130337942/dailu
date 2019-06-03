$(function(){
	var u_name = getCookie('user_name');
	var u_id = getCookie('uid');     
	// $('.user').text(decodeURI(u_name));
	$('.navBox .leftBar li').removeClass('active').eq(3).addClass('active');
	$.post('MySpot',{uid:u_id},function(res){
		if(!res) return fasle ;
		var data =res;
		$('.tot_rout .num').text(data.num);
  		var spotListRender = template.compile(spotListTemplate);
   	 	var html = spotListRender(res);
    	$('.mothWap .routeList').html(html);
    	
		$('.list').find('.del_spot').on('click',function(e){
			e.preventDefault(); 
			e.stopPropagation();
			var _self = this;
			 layer.open({
  				content: '景点删除后，将无法找回！',
  				yes: function(index, layero){
    			//do something
   				layer.close(index); //如果设定了yes回调，需进行手工关闭
   				var spot_id = $(_self).parents('.list').attr('data-spot_id');
  				$.post('../Detail/DeleteSelf',{'id':spot_id},function(res){
  					if(res.status==true){
  						layer.msg('删除成功',{
  							time:2000
  						})
  						$(_self).parents('.list').remove();
  					}else{
  						layer.msg('删除失败',{
  							time:2000
  						})
  					}
  				},'json')

  				}
				}); 
				
				return false    
		})

		

	},'json')
	
	
								

	var  spotListTemplate = '{{each data as value i}}\
				<li class="list fl" data-uid="{{value.uid}}" data-spot_id="{{value.id}}"> \
					<a href="javascript:;" class="clearfix">\
						<div class="picBox fl">\
							<img src="{{value.image_cover}}" alt="">\
						</div>\
						<div class="right_box fr">\
							<div class="info">\
								<div class="con">{{value.spot_name}}</div>\
								<div class="date">添加时间：{{value.maketime}}  </div>\
							</div>\
							<div class="up_user">景点位置：{{value.address}}</div>\
							<div class="city">所属城市：{{value.city_name}}</div>\
							<div class="cart">\
								<span class="del_spot">删除</span>\
							</div>\
						</div>\
					</a>\
				</li>\
				{{/each}}'
})