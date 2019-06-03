$(function () {
    $('.cartBox .man .ctr-adult,.cartBox .child .ctr-child').on('click', function (e) {
        var daynum = $(this).siblings('span').text() - 0;
        if (e.target.className == 'add') {
            daynum++
            $(this).siblings('span').text(daynum);
        } else if (e.target.className == 'sub') {
            daynum <= 1 ? daynum : daynum--;
            $(this).siblings('span').text(daynum);
        }else{
            daynum <= 0 ? daynum : daynum--;
            $(this).siblings('span').text(daynum);
        }
    });
    //日历
    $('#wap3_date').datepicker({
        minDate: 0,
        dateFormat: "yy-mm-dd"
    });
    $('.nav_title').on('click', function () {
        $('.madeTravelMask').fadeIn()
    })
    $('.buttonBox .save').on('click',function(){
        $('.nav_title .trc_title').html($('.wap1').find('#trc_title').val())
    })
    //确定 取消 X
    $('.buttonBox .cancel,.buttonBox .save,.closeMadeTravelMask').on("click", function () {
        $('.madeTravelMask').fadeOut();
    });

    //上传封面
    
    var clipArea = new bjj.PhotoClip("#nav_clipArea", {
        size: [600, 400], // 截取框的宽和高组成的数组。默认值为[260,260] 3:2 的比例
        outputSize: [600, 400], // 输出图像的宽和高组成的数组。默认值为[0,0]，表示输出图像原始大小
        //outputType: "jpg", // 指定输出图片的类型，可选 "jpg" 和 "png" 两种种类型，默认为 "jpg"
        file: "#nav_file", // 上传图片的<input type="file">控件的选择器或者DOM对象
        ok: "#nav_clipBtn", // 确认截图按钮的选择器或者DOM对象
        loadStart: function () {
            // 开始加载的回调函数。this指向 fileReader 对象，并将正在加载的 file 对象作为参数传入
            $('.nav_cover-wrap').fadeIn();
            // console.log("照片读取中");
        },
        loadComplete: function () {
            // 加载完成的回调函数。this指向图片对象，并将图片地址作为参数传入
            // console.log("照片读取完成");
        },
        //loadError: function(event) {}, // 加载失败的回调函数。this指向 fileReader 对象，并将错误事件的 event 对象作为参数传入
        clipFinish: function (dataURL) {
            // 裁剪完成的回调函数。this指向图片对象，会将裁剪出的图像数据DataURL作为参数传入
            $('.nav_cover-wrap').fadeOut();
            $('.madeTravelMask img.bgImg').attr('src', dataURL);
            // console.log(dataURL)
           
            layer.msg("图片上传成功", {
                time: 600,
                offset: '250px'
            });
            $('.madeTravelMask').find('.upload_but span').html("修改封面")
        }
    });
})
