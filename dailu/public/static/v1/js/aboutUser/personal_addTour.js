$(function(){
	var u_name = getCookie('user_name');
	var u_id = getCookie('uid');     
	// $('.user').text(decodeURI(u_name));
	$('.navBox .leftBar li').removeClass('active').eq(0).addClass('active');
	$.post('addTouData',{uid:u_id},function(res){
		if(!res) return false ;
		var data ={};
		data.tourList =res;
  		var tourListRender = template.compile(tourListTemplate);
   	 	var html = tourListRender(data);
    	$('.contentWap .main .routeList').append(html);

    


	},'json')

	var  tourListTemplate =	'{{each tourList as value i}}\
				<li class="list fl">\
					<a href="/portal/itinerary/tripInfo/{{value.trip_id}}.html">\
						<div class="picBox">\
							<img src="{{value.image_cover}}" alt="">\
							<div class="day"><strong>{{value.day_num}}</strong>天</div>\
							<div class="imgMask">\
								<div class="cart hide">\
									<span class="copy"><strong>复制</strong> </span>\
									<span class="del"><strong>删除</strong></span>\
								</div>\
							</div>\
							<div class="line hide">\
								发布时间<br>{{value.submitDate}}\
							</div>\
						</div>\
						<div class="info">\
							<div class="con">{{value.trip_name}}</div>	\
							<div class="date">\
								{{value.date}} | 出发\
							</div>\
						</div>\
						<div class="up_user">\
									{{each value.jindian_name as place j}}\
									{{place}}\
									{{if j<value.jindian_name.length-1}}\
									·\
									{{/if}}\
								{{/each}}\
						</div>\
					</a>\
					\
				</li>\
				{{/each}}'

})