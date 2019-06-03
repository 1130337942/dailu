$(function(){  
	var userName = getCookie('user_name');
	var uid = getCookie('uid');
	var hasImg = false;
	$('.mainBox .infoBox .adviceType .list').on('click',function(){
		$(this).addClass('active').siblings('.list').removeClass('active');
	})
		var uploader = WebUploader.create({
	
	    // 选完文件后，是否自动上传。
	    auto: false,
	
	    // swf文件路径
	    swf:  '/static/common/webuploader-0.1.5/Uploader.swf',
	
	    // 文件接收服务端。
	    server: 'personalData',
	
	    // 选择文件的按钮。可选。
	    // 内部根据当前运行是创建，可能是input元素，也可能是flash.
		pick: {
                id: '#filePicker',
                multiple:false, 
                label: '选择图片'
            },
	    // 只允许选择图片文件。
	    accept: {
	    	title: 'Images',
	    	extensions: 'gif,jpg,jpeg,bmp,png',
	    	mimeTypes: 'image/*'
	    },
	    fileNumLimit:1
	});
		uploader.on( 'fileQueued', function( file ) {
	    var $li = $(
	            '<div id="' + file.id + '" class="file-item thumbnail">' +
	                '<img>' +
	                '<div class="info">' + file.name + '</div>' +
	            '</div>'
	            ),
	        $img = $li.find('img');
	
	
	    // $list为容器jQuery实例
	    $('.upload .prev_img').append( $li );
	
	    // 创建缩略图
	    // 如果为非图片文件，可以不用调用此方法。
	    // thumbnailWidth x thumbnailHeight 为 100 x 100
	    uploader.makeThumb( file, function( error, src ) {
	        if ( error ) {
	            $img.replaceWith('<span>不能预览</span>');
	            return;
	        }
	
	        $img.attr( 'src', src );
	    }, 100, 100 );
	});
	// 文件上传过程中创建进度条实时显示。
			uploader.on( 'uploadProgress', function( file, percentage ) {
				var $li = $( '#'+file.id ),
				$percent = $li.find('.progress .progress-bar');
	
	    // 避免重复创建
	    if ( !$percent.length ) {
	    	$percent = $('<div class="progress progress-striped active">' +
	    		'<div class="progress-bar" role="progressbar" style="width: 0%">' +
	    		'</div>' +
	    		'</div>').appendTo( $li ).find('.progress-bar');
	    }
	
	    $li.find('p.state').text('上传中');
	
	    $percent.css( 'width', percentage * 100 + '%' );
	});
	
			uploader.on( 'uploadSuccess', function( file ) {
				$( '#'+file.id ).find('p.state').text('已上传');
				layer.msg('上传成功', {
    				 time: 2000, //20s后自动关闭
				 },function(){
				 	window.location.reload();
				 });
			});

			uploader.on( 'uploadError', function( file ) {
				$( '#'+file.id ).find('p.state').text('上传出错');
				layer.msg('上传出错', {
    				 time: 2000 //20s后自动关闭
				 });
			});

			uploader.on( 'uploadComplete', function( file ) {
				$( '#'+file.id ).find('.progress').fadeOut();
			});

			uploader.on( 'fileQueued', function( file ) {
					if(file){
						hasImg =true;
					}
			})

		$('.submit').on('click',function(){
			if(!uid) {
				window.location.href = "/portal/login/login.html";
				return false ;
			}
			if( !$('#massage').val() || !hasImg )  {
				layer.msg('请上传一张遇到的问题截图以及问题的描述', {
    				 time: 2000 //20s后自动关闭
				 });

				return false ;

			}
			var infoType = $('.typeBox .active').attr('type');
			var query ={};
				query.user_name=userName
				query.uid=uid;
				query.adviceType="PC";
				query.info = $('#massage').val();
				query.info_type = infoType ;
			uploader.options.formData=query;
			uploader.upload();
		})
})