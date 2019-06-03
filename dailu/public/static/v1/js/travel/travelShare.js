$(function(){
	var isFirefox=navigator.userAgent.indexOf("Firefox");
	var mousewhell = isFirefox > 0? "DOMMouseScroll" : "mousewheel";
	var isoverRecom =  false; 
	$('.recom ul').css({
		width:$('.recom ul .list').length*424
	}).hover(function(){
		isoverRecom = true ;
	},function(){
		isoverRecom = false ;
	})

	$('.allCity ul').css({
		height : Math.ceil($('.allCity ul .list').length/2)*75
	})

	$(document).on(mousewhell,function(){
		if(isoverRecom){
			console.log(123)
		}
	})
	

		var disX,disY , curX,curY; //page 坐标

			$('.fix_wap').hover(function(event){
				disX = event.pageX ;
				disY = event.pageY ;					 
			},function(event){
				disX = null ;
				disY = null;
			})	 

		// 顶部悬浮小岛
		  var index_div_pro = [{
                        sx: 380,
                        sy: 106,
                        mw: 6,
                        mh: 5,
                        bx: 10,
                        by: 13,
                        rx: -0.3
                },
                {
                        sx: 380,
                        sy: 0,
                        mw: 3,
                        mh: 5,
                        bx: 10,
                        by: 10.4,
                        rx: -0.35
                },
                {
                        sx: 437,
                        sy: 227,
                        mw: 0.3,
                        mh: 0.2,
                        bx: 6.5,
                        by: 7.4,
                        rx: -0.2
                },
                {
                        sx: 610,
                        sy: 256,
                        mw: 0.3,
                        mh: 0.1,
                        bx: 6.5,
                        by: 7.4,
                        rx: -0.3
                }];
                
                var ePageX = null;
                var ePageY = null;
		$('.fix_wap').on('mousemove',function(event){
				  event = event || window.event;
                        ePageX = event.pageX;
                        ePageY = event.pageY;
		})
		  function getMousePos(expression) {
                        if (ePageX == null || ePageY == null) return null;
                        var _x = $(expression).position().left;
                        // _x += ePageX - $(expression).parent().position().left;
                        _x += ePageX - $(expression).parent().offset().left;
                        var _y = $(expression).position().top;
                        // _y += ePageY - $(expression).parent().position().top;
                        _y += ePageY - $(expression).parent().offset().top;
                        return {
                                x: _x,
                                y: _y
                        }
                };
		 var index_xh = setInterval(function () {
                        for (var i = 0; i < 4; i++) {
                                   var mousepos = getMousePos("#indexg" + i);
                              		console.log(mousepos)
                                if (mousepos != null) {
                                        var left = parseInt($("#indexg" + i).css("left"));
                                        var l = left + (index_div_pro[i].sx + index_div_pro[i].mw - (mousepos.x - 200) / index_div_pro[i].bx * index_div_pro[i].rx - left) * 0.05;
                                        var bottom = parseInt($("#indexg" + i).css("bottom"));
                                        var b = bottom + (index_div_pro[i].sy + index_div_pro[i].mh - (mousepos.y  - 200) / index_div_pro[i].by - bottom) * 0.1;
                                       	// console.log(l+'-'+bottom)
                                        $("#indexg" + i).css({
                                                left: l,
                                                bottom: b
                                        })
                                }
                        }
                },
                20);

		/*分页*/
		$('#Paginator').jqPaginator({
			totalPages: 100,
			visiblePages: 3,
			currentPage: 1,
	    // first: '<li class="first"><a href="javascript:void(0);">First</a></li>',
	    prev: '<li class="prev"><a href="javascript:void(0);">上一页</a></li>',
	    next: '<li class="next"><a href="javascript:void(0);">下一页</a></li>',
	    // last: '<li class="last"><a href="javascript:void(0);">Last</a></li>',
	    page: '<li class="page"><a href="javascript:void(0);">{{page}}</a></li>',
	    onPageChange: function (num, type) {
	    	$('#text').html('当前第' + num + '页');
	    }
	});


})                