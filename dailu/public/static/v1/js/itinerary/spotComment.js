$(function(){
	var spot= decodeURI(getUrlParam('spot'));
	var city= decodeURI(getUrlParam('city'));
	var thisUid = getCookie('uid');
	var comment_text = $('.content textarea').val();
	var flag = true;
	//上传图片
		var $tgaUpload1 = $('#goodsUpload').diyUpload({
				url: '../Detail/CommentOn',
				formData :{
					city_name:city
				},
				success: function(data) {
					
				},
				error: function(err) {
					
				},
				buttonText: '',
				fileNumLimit:3,
				fileSingleSizeLimit:50*1024*1024,//限制在50M
				accept: {
					title: "图片或者视频上传",
					extensions: 'gif,jpg,jpeg,bmp,png'
				},
				compress :{
					noCompressIfLarger: true
				},

				thumb: {
					width: 160,
					height: 120,
					quality: 100,
					allowMagnify: true,
					crop: true,
					type: "image/jpeg"
				}
			});

		$tgaUpload1.on( 'uploadBeforeSend', function( block, data ) {
			$($tgaUpload1.getFiles()).each(function(){
				// console.log($tgaUpload1.getFile(this.id))
			})
		
   		 data.comment_text= $('.content textarea').val();
   		 data.last = $tgaUpload1.getFiles().length;
		});
	$('.header .prevPage').on('click',function(){
		window.history.go(-1);
	})
	$('.submit_btn').on('click',function(){
		if(!flag) return false;
		if($('.content textarea').val()){
			var query = new FormData()
			var list = $tgaUpload1.getFiles();
			console.log(list);
			$(list).each(function(i,ele){
				/*if(ele.ext=='mp4'){
					$('#fileBox_WU_FILE_'+i).find('.viewThumb').append('<span>视频无法预览</span>')
				}*/
				query.append('file[]',ele.source.source)
			})
			query.append('spot_name',spot)
			query.append('uid',thisUid)
			query.append('city_name',city)
			query.append('comment_text',$('.content textarea').val());
			flag =false;
			$('.submit_btn').hide().siblings('.uploading_btn').show();
			$.ajax({
                type:'POST',
                url:'../Detail/CommentOn',
                data:query,
                processData:false,
                contentType : false,
                dataType:'json',
                success:function(data){
                	flag = true;
                    if(data.status==true){
                    	layer.msg('评论成功',{
							time:1000
						})
                    	window.history.go(-1);
                    }
                },
                error:function(res){
                	layer.msg('图片太大，评论失败',{
							time:1000
						})
               	}
            });
		}else{
			layer.msg('请填写评论信息',{
				time:1000
			})
		}

	})
	
})