$(function(){
	var type = getUrlParam('type');
	var page = 1 ;
	 switch(Number(type)){
     case 1:
     	$('.leftList .list_type span').removeClass('active').eq(4).addClass('active');
       break;
     case 2:
     	$('.leftList .list_type span').removeClass('active').eq(1).addClass('active');
     break;
     case 3:
     	$('.leftList .list_type span').removeClass('active').eq(2).addClass('active');
     break;
     case 4:
     	$('.leftList .list_type span').removeClass('active').eq(3).addClass('active')     
       break;
   }
	renderData({'type':type,'page':page});
	$('.leftList .list_type span').on('click',function(){
		$(this).addClass('active').siblings().removeClass('active');
		page = 1;
		type = $(this).attr('type');
		renderData({'type':type,'page':page})
	})

	$('.loadmore span').on('click',function(){
		page++;
		$.post('getNewsList',{'type':type,'page':page},function(res){ 
			var newsListRender = template.compile(newsListTemplate)
			var newsListHtml = newsListRender(res);
			$('.leftList .list_box').append(newsListHtml);
			
		},'json')
	})


	function renderData (query){
		$.post('getNewsList',query,function(res){
			var newsListRender = template.compile(newsListTemplate)
			var newsListHtml = newsListRender(res);
			var hotListRender = template.compile(hotlistTemplate)
			var hotListHtml = hotListRender(res);
			$('.leftList .list_box').html(newsListHtml);
			$('.rightHot .hot_list').html(hotListHtml);
		},'json')
	}

	var newsListTemplate = '{{each news_list as value i}}\
				<a target="_blank" href="/portal/news/details.html?id={{value.id}}">\
				<li class="list clearfix">\
					<div class="left_img fl">\
						<img src="{{value.image}}" alt="">\
					</div>\
					<div class="right_info fr">\
						<div class="info_title">{{value.title}}</div>\
						<div class="info_desc">{{#value.remark}}</div>\
						<div class="list_tips">\
							<span>{{if value.type == "1"}}\
									企业资讯\
									{{else if  value.type == "2"}}\
									旅游指南\
									{{else if  value.type == "3"}}\
									粉丝互动\
									{{else if  value.type == "4"}}\
									媒体聚焦\
								{{/if}}\
							</span>\
							<span class="time">{{value.time}}</span>\
						</div>\
					</div>\
				</li>\
				</a>\
				{{/each}}';

	var hotlistTemplate = '{{each hot_news_list as value i}}\
				<a target="_blank" href="/portal/news/details.html?id={{value.id}}">\
				<li class="list">\
					<div class="list_tit">{{value.title}}</div>\
					<div class="time">{{value.time}}</div>\
				</li>\
				</a>\
				{{/each}}';			
})