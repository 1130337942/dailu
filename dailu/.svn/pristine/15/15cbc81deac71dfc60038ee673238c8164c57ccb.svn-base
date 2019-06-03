$(function(){
	var tot_tour = 0;
	var u_name = getCookie('user_name');
	var u_id = getCookie('uid');     
	// $('.user').text(decodeURI(u_name));
	$('.navBox .leftBar li').removeClass('active').eq(1).addClass('active');
	$.post('personal_planData',{uid:u_id},function(res){
		if(!res) return fasle ;
		var data =res;

		$('.tot_rout .num').text(data.num);
  		var tourListRender = template.compile(tourListTemplate);
   	 	var html = tourListRender(data);
    	$('.contentWap .main .tot_rout').after(html);
    	console.log(data.insiders)
    	if(data.insiders != 3){ //词字段如果等于3 说明是旅行社账号 开放景点编辑功能
			$('.list .cart .more').hide()
		}
		$('.list').find('.edit').on('click',function(oEvent){
			//省份下的城市
			
			
			var list_plan = $(this).parents('.list')
			sessionStorage.setItem("trip_id",list_plan.attr("data-trip_id"));
            sessionStorage.setItem("isEdit",'ok');
			// var postdata = {
			// 	is_plan_edit:'ok',
			// 	uid:list_plan.attr('data-uid'),
			// 	trip_id:list_plan.attr("data-trip_id")
			// }
			window.location.href="/portal/scenerymap/attractionsArrange.html"
			
			// oEvent.cancelBubble = true;
			oEvent.stopPropagation();
			return false
		})

		$('.list').find('.del').on('click',function(e){
			e.preventDefault(); 
			e.stopPropagation();
			var _self = this;
			 layer.open({
  				content: '行程删除后，将无法找回！',
  				yes: function(index, layero){
    			//do something
   				layer.close(index); //如果设定了yes回调，需进行手工关闭
   				var trip_id = $(_self).parents('.list').attr('data-trip_id');
  				$.post('DelTrip',{'trip_id':trip_id},function(res){
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

		$('.list .toSportEdit').on('click',function(e){
			var url =$(this).attr('url');
			window.location.href=url;
			e.stopPropagation();
			e.preventDefault();
			return false
		})

		$('.list .poster').on('click',function(e){
			var tripId = $(this).parents('.list').attr('data-trip_id');
			var u = $(this).parents('.list').attr('data-uid');
			window.location.href='/portal/aboutuser/create_poster.html?tripId='+tripId+'&u='+u;
			e.stopPropagation();
			e.preventDefault();
			return false
		})
		$('.list .topdf').on('click',function(e){
			var tripId = $(this).parents('.list').attr('data-trip_id');
			var u = $(this).parents('.list').attr('data-uid');
			window.location.href='/portal/itinerary/tripinfoSharePdf.html?trip='+tripId+'&them='+u;
			e.stopPropagation();
			e.preventDefault();
			return false
		})

		$('.list .stick_up').on('click',function(e){
			var tripId = $(this).parents('.list').attr('data-trip_id');
			var _self = this;
			var status = $(this).attr('type');
			e.preventDefault(); 
			e.stopPropagation();
			$.post('/portal/aboutuser/SelfMore',{'trip_id':tripId,'status':status},function(res){
				if(res.status){
					var msgtext = status==3?'成功设为优质':'取消优质成功';
					layer.msg(msgtext,{
  							time:2000
  					})
  					$(_self).attr('type',status==3?0:3);
  					$(_self).attr('title',status==3?'取消优质':'设为优质行程');
  					$(_self).hasClass('stick_up3')?$(_self).removeClass('stick_up3').addClass('stick_up0'):$(_self).removeClass('stick_up0').addClass('stick_up3');
				}else{
  						layer.msg('操作失败',{
  							time:2000
  						})
  					}
			},'json')
			return false;
		})

		$('.list').find('.bill').on('click',function(e){
			e.preventDefault(); 
			e.stopPropagation();
			var _self = this;
			var tripId = $(this).parents('.list').attr('data-trip_id');
			var whe_hide = $(this).attr('type');
			var u = $(this).parents('.list').attr('data-uid');
			$.post('HideExpense',{'trip_id':tripId,'whe_hide':whe_hide},function(res){
  					if(res.status==true){ //1是隐藏费用清单 0是展示费用清单
  						var msgtext = whe_hide==1?'隐藏成功':'显示成功';
  						layer.msg(msgtext,{
  							time:2000
  						})
  					$(_self).attr('type',whe_hide==1?0:1);
  					$(_self).text(whe_hide==1?'显示清单':'隐藏清单');
  					}else{
  						layer.msg('操作失败',{
  							time:2000
  						})
  					}
  				},'json')
			return false  
		})

		$('.cart .copy').on('click',function(e){
			var query = {};
				query.uid= u_id;
				query.them= $(this).parents('.list').attr('data-uid');
				query.trip_id= $(this).parents('.list').attr('data-trip_id');
				$.post('/portal/detail/Duplicate',query,function(res){
					if(res.status==true){
						layer.msg('复制成功',{
							time:300
						},function(){
							window.location.reload()
						})
						
					}
				},'json')
			 
			e.stopPropagation();
			e.preventDefault();
			return false

		})

	},'json')
	
	
									var aa = '{{if item.whe_hide==0}}\
												<span class="bill" type=1 >隐藏清单</span>\
											{{else}}\
												<span class="bill" type=0 >显示清单</span>\
											{{/if}}\
											<span class="poster">海报版</span>'
	

	var  tourListTemplate = '{{each tourList as value i}}\
			<div class="monthWap">\
					<div class="month"><span>{{value[0].month}}月</span>/{{value[0].date.substr(0,4)}}</div>\
					<ul class="routeList clearfix">\
					{{each value as item k}}\
						<li class="list fl" data-uid={{item.uid}} data-trip_id={{item.trip_id}}>\
							{{if item.status==3}}\
								<div class="stick_up stick_up{{item.status}}" type=0 title="取消优质"></div>\
							{{else}}\
								<div class="stick_up stick_up{{item.status}}" type=3 title="设为优质行程"></div>\
							{{/if}}\
							<a  href="/portal/itinerary/tripInfo/{{item.trip_id}}.html" class="clearfix">\
								<div class="picBox fl">\
									<img src="{{item.image_cover}}" alt="">\
									<div class="day_mask">\
										<div class="day"><strong>{{item.day_num}}</strong>天</div>\
									</div>\
									<div class="line hide"\
										发布时间<br>\
									</div>\
								</div>\
								<div class="right_box fr">\
									<div class="info">\
										<div class="con">{{item.trip_name}}</div>	\
										<div class="date">\
											{{item.date}} | 出发\
										</div>\
									</div>\
									<div class="up_user">\
										{{each item.jindian_name as place j}}\
										{{place}}\
											{{if j<item.jindian_name.length-1}}\
												·\
											{{/if}}\
										{{/each}}\
									</div>\
									<div class="cart">\
											<span class="copy cart_hide">复制</span>\
											{{if item.old_new=="new" && item.isoredit!=1}}\
											<span class="edit">编辑 </span>\
											{{/if}}\
											<span class="copy">复制</span>\
											<span class="del">删除</span>\
											<div class="more"><span>高级</span>\
												<div class="m_list topdf">导出PDF</div>\
												{{if item.whe_hide==0}}\
												<div class="m_list bill" type=1 >隐藏清单</div>\
												{{else}}\
												<div class="m_list bill" type=0 >显示清单</div>\
												{{/if}}\
												<div class="m_list toSportEdit" url="/portal/itinerary/tripEdit.html?trip={{item.trip_id}}&them={{item.uid}}">景点编辑</div>\
												<div class="m_list poster">海报制作</div>\
											</div>\
									</div>\
								</div>\
							</a>\
						</li>\
						{{/each}}\
					</ul>\
				</div>\
				{{/each}}'
})