$(function(){
	var tripId= getUrlParam('trip');
	var thisUid = getCookie('uid');
	var comment_text = $('.content textarea').val();
	var flag = true;
	//上传图片
		var $tgaUpload1 = $('#goodsUpload').diyUpload({
				url: 'Discuss',
				formData :{
					trip_ip:tripId
				},
				success: function(data) {
					console.log(123)
				},
				error: function(err) {
					console.log(456)
				},
				buttonText: '',
				fileNumLimit:3,
				accept: {
					title: "Images",
					extensions: 'gif,jpg,jpeg,bmp,png'
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
			$(list).each(function(i,ele){
				query.append('file[]',ele.source.source)
			})
			query.append('trip_id',tripId)
			query.append('uid',thisUid)
			query.append('comment_text',$('.content textarea').val());
			flag =false;
			$('.submit_btn').hide().siblings('.uploading_btn').show();
			$.ajax({
                type:'POST',
                url:'Discuss',
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