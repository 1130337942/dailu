$(function(){
	var trip = getUrlParam('trip');
    var u = getUrlParam('them');
    var this_uid = getCookie('uid'); 

   $.post('BooksData',{'collect_uid':this_uid,'uid':u,'trip_id':trip},function(res){
   		if(!res.Schedufing) return false;
   		
   		var daylist=[];
   		$(res.Schedufing).each(function(){
   			var dayArry = this.day_arry ;
   			$(dayArry).each(function(){
   				daylist.push(this);
   			})	
   		})
   		var dayListObj = {};
   			dayListObj.dayList = daylist;
   		console.log(daylist);
   		 var calendarRender = template.compile(calendarTemplate);
         var calendarHtml = calendarRender(dayListObj);
         $('.datelist_box').html(calendarHtml);



         $('.block_in_left').hover(function(){
         	$(this).stop().animate({'width':'162px'},300,'easeOutQuad');
         	$(this).siblings('.block_in_right').stop().animate({'width':0,'padding':'0'},300,'easeOutQuad')
         },function(){
         	$(this).stop().animate({'width':'116px'},300,'easeInQuad');
         	$(this).siblings('.block_in_right').stop().animate({'width':'44px','padding':'10px 12px'},300,'easeInQuad')
         });
         $('.block_in_right').hover(function(){
         	var _self = this;
         	$(this).find('.in_title_s').stop().fadeIn();
         	$(this).find('.tip_s').stop().fadeIn();
         	$(this).stop().animate({'width':'162px'},300,'easeOutQuad').find('.ico').stop().fadeOut(200,function(){
         		$(_self).find('.ico').css({'margin':'0','bottom':'12px','right':'12px'}).stop().fadeIn(200)
         	});
         	$(this).siblings('.block_in_left').stop().animate({'width':0,'padding':0},300,'easeOutQuad')
         },function(){
         	var _self = this;
         	$(this).find('.in_title_s').stop().fadeOut()
         	$(this).find('.tip_s').stop().fadeOut()
         	$(this).stop().animate({'width':'44px'},300,'easeInQuad',function(){
         		$(_self).find('.ico').css({'margin':'0px -11px -11px 0','bottom':'50%','right':'50%'})
         	});
         	$(this).siblings('.block_in_left').stop().animate({'width':'116px','padding':'10px 12px'},300,'easeInQuad')
		});
   },'json') 

   	var calendarTemplate='{{each dayList as value i}}\
   			<li class="daylist fl">\
				<div class="daytit">\
					<div class="daynum">第{{i+1}}天</div>\
					<div class="tit_city">{{value.date}} 周一 | 南京 - 杭州</div>\
				</div>\
				<div class="distance">里程 · 10公里 <span class="traffic_type">包车</span></div>\
				<div class="no_with">\
				</div>\
				{{if i==0}}\
				<div class="block">\
					<div class="block_in traff" style="">\
						<div class="in_title">{{value.one_city}} — {{value.two_city}}</div>\
						<div class="tip">铁路 · 3小时</div>\
						<i class="ico date_train"></i>	\
					</div>\
					<div class="toBook">\
						<div class="book_tit">{{value.one_city}} — {{value.two_city}}</div>\
						<div class="tips">1月15日 | 火车·400公里·2时2分 | ¥300起</div>\
						<div class="clearfix">\
							<span class="fl book_btn">去预定</span>\
							<span class="fr ico date_train"></span>\
							<span class="close_info"></span>\
						</div>\
					</div>\
				</div>\
				{{/if}}\
				{{each value.day as item key}}\
				<div class="no_with" style="height: 38px;"></div>\
				<div class="block">\
					<div class="gai block_in clearfix" style="">\
						<div class="block_in_left fl" {{ if item.eat_info.length>0}} style="width: 116px;"{{/if}}>\
							<div class="in_title_s"><span>{{key+1}} .</span>{{item.info.spot_name}}</div>\
							<div class="tip_s">适玩 {{item.this_playtime}} 小时</div>\
							<i class="ico sport"></i>	\
						</div>\
						{{if item.eat_info&&item.eat_info.length>0}}\
						<div class="block_in_right fr" style="width: 44px; padding: 10px 12px;">\
							{{each item.eat_info as list j}}\
								<div class="in_title_s dis_none">{{list.name}}</div>\
								<div class="tip_s dis_none">美食 · 人均 ¥{{list.per_capita}} 起</div>\
							{{/each}}\
							<i class="ico cy"></i>	 \
						</div>\
						{{/if}}\
					</div>\
				</div>\
				{{/each}}\
			</li>\
		{{/each}}'

})