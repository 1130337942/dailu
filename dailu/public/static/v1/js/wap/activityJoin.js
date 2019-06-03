$(function(){
	var phoneReg = /^1[3456789]\d{9}$/;
	var phonePass =false;
	var share_pic = 'http://a.dailuer.com/static/v1/img/tripinfoShare/prev.png'; /*分享出去的预览图*/
	var share_url=window.location.href.split('#')[0]; /*分享的url*/
	var sharetitle= '年终福利，景区打卡大奖能你来拿'; /*微信分享的标题*/
	var sharedesc='袋鹿旅行，自由行的必备工具'; /*微信分享的副标题*/

	wechatConfig();

	$('.submit_wap .submit').on('click',function(){
		var query ={};
			query.user_name = $('#name').val().trim();
			query.user_phone = $('#phone').val().trim();
			query.activity_id = $('.submit_wap .submit').attr('type');
			query.activity = $('.top_wap .main_tit').text();

			if(query.user_name==''){
				layer.msg('请填写姓名',{
					time:1000,
					offset:'200px'
				})
				return false;
			}

			checkPhone('#phone');
			if(phonePass&&query.user_name!=''){
				$.post('addActivityUser',query,function(res){
					if(res.status==true){
						layer.msg('恭喜您报名成功',{
							time:1000,
							offset:'200px'
						})
					}else {
						layer.msg(res.msg,{
							time:2000,
							offset:'200px'
						})
					}
				},'json')
			}
		

	})



	function checkPhone (target){
		var phoneStr = $(target).val()-0;
		if(!phoneReg.test(phoneStr)){
			phonePass =false;
			layer.msg('电话号码有误',{
				time:1000,
				offset:'200px'
			})
			$(target).focus();
		}else{
			phonePass =true;
		}
	}

	/*微信分享*/
	function wechatConfig() {
    $.ajax({
        type: 'post',
        url: '../itinerary/wxSignature',
        data:{'url':encodeURIComponent(share_url)},
        dataType: "json",
        success: function(data) {
            var config_obj = data;
            wx.config({
                debug: false,
                appId: config_obj.app_id,
                timestamp: config_obj.timestamp,
                nonceStr: config_obj.nonce_str,
                signature: config_obj.signature,
                jsApiList: [
                    'onMenuShareTimeline',
                    'onMenuShareAppMessage',
                    'onMenuShareQQ',
                    'onMenuShareWeibo'
                ]
            });
            wx.ready(function () {
                wx.onMenuShareAppMessage({
                    title: sharetitle,
                    desc: sharedesc,
                    link: share_url,
                    imgUrl: share_pic,
                    success: function (res) {
                    },
                    cancel: function (res) {
                    },
                    fail: function (res) {
                    }
                });

             
                wx.onMenuShareTimeline({
                    title: sharetitle+sharedesc,
                    link: share_url,
                    imgUrl: share_pic,
                    success: function (res) {
                    },
                    cancel: function (res) {
                    },
                    fail: function (res) {
                    }
                });
                wx.onMenuShareQQ({
					title: sharetitle, // 分享标题
					desc: sharedesc, // 分享描述
					link: share_url, // 分享链接
					imgUrl: share_pic, // 分享图标
					success: function () {
					
					},
					cancel: function () {
					
					}
				});
            });
            wx.error(function(res){
            });

            setShareInfo({
            	title:          sharetitle,
            	summary:        sharedesc,
            	pic:            share_pic,
            	url:            share_url,
            	WXconfig:       {
            		swapTitleInWX: true,
            		appId: config_obj.app_id,
            		timestamp: config_obj.timestamp,
            		nonceStr: config_obj.nonce_str,
            		signature: config_obj.signature
            	}
            });
        },
        error:function(xhr, type) {
        }
    });
}


/*微信分享 end*/

})