$(function(){
    var sharurl = window.location.href;
    if(/Android|webOS|iPhone|iPod|BlackBerry/i.test(navigator.userAgent))  window.location.href =  sharurl.replace('details','mdetails');
	sosh('.shareList', {
    // 分享的链接，默认使用location.href
    url: sharurl,
    // 分享的标题，默认使用document.title
    title: '',
    // 分享的摘要，默认使用<meta name="description" content="">content的值
    digest: '',
    // 分享的图片，默认获取本页面第一个img元素的src
    pic: 'http://www.dailuer.com/static/v1/img/tripinfoShare/prev.png',
    // 选择要显示的分享站点，顺序同sites数组顺序，
    // 支持设置的站点有weixin,yixin,weibo,qzone,tqq,douban,renren,tieba
    sites: ['weibo','weixin','qzone']
  })
})