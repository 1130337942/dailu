 $(function(){
    var dateInput = ['#leave_day','#dest_day']
    $(dateInput).each(function(i,ele){
        $(ele).datepicker({
            minDate: 0,
            dateFormat: "yy-mm-dd"

        });

    })  

    var leave_day =  $("#leave_day").val();
    var dayArray =  getMinute_Data(leave_day)
    var calenderStr = "";
    for(var i=0;i<dayArray.length;i++){
        var week = getMyweek(dayArray[i].currentTime)
        calenderStr+= '<li time='+ dayArray[i].currentTime +'><div class="day">'+dayArray[i].currentdate+'</div><div class="week">'+week+'</div></li>'
    }
    $(".calender .listbox").html(calenderStr);

    $(".calender .prev").on("click",function(){
       var leave_day = $('.calender .listbox li:eq(0)').attr('time') - 9 * 24 * 3600 * 1000;
       var dayArray =  getMinute_Data(leave_day,true);
       var calenderStr = "";
       for(var i=0;i<dayArray.length;i++){
            var week = getMyweek(dayArray[i].currentTime)
            calenderStr+= '<li  time='+ dayArray[i].currentTime +'><div class="day">'+dayArray[i].currentdate+'</div><div class="week">'+week+'</div></li>'
        }
        $(".calender .listbox").html(calenderStr);
    })

    $(".calender .next").on("click",function(){
       var leave_day = $('.calender .listbox li:eq(8)').attr('time') - 0 + 1 * 24 * 3600 * 1000;
       var dayArray =  getMinute_Data(leave_day,true);
       var calenderStr = "";
       for(var i=0;i<dayArray.length;i++){
            var week = getMyweek(dayArray[i].currentTime)
            calenderStr+= '<li  time='+ dayArray[i].currentTime +'><div class="day">'+dayArray[i].currentdate+'</div><div class="week">'+week+'</div></li>'
        }
        $(".calender .listbox").html(calenderStr);
    })

    $('.filter_box .filter .checkBox').on('click',function(){
        $(this).toggleClass('on');
    })

        //获取时间列表数据
    function getMinute_Data(date,timestamp){
        var goingDate = date+'';
        var timeArr = [];
        var dataArr = [];
            goingDate = goingDate.replace(/-/g,'/')
        var the_firstDate = timestamp ? goingDate-0: new Date(goingDate);
        var seperator1 = "-";
        var seperator2 = ":";
        console.log(the_firstDate)
        for(var i = 0 ; i<9 ; i++){
            if(timestamp){
                timeArr.push((the_firstDate + i * 24 * 3600 * 1000 ))
            }else{
                timeArr.push((the_firstDate.getTime() + i * 24 * 3600 * 1000 ))
            }

            
        };
        
        for(var i  = 0 ;i < timeArr.length; i++){
            var month = new Date(timeArr[i]).getMonth() + 1;
            var strDate = new Date(timeArr[i]).getDate();

        if (month >= 1 && month <= 9) {
            month = "0" + month;
        }
        if (strDate >= 0 && strDate <= 9) {
            strDate = "0" + strDate;
        }
            var currentdate= month + seperator1 + strDate;
            var curerentWeek = getMyweek(timeArr[i]);
            var currentTime = timeArr[i];
            dataArr.push({
                currentdate:currentdate,
                currentWeek:curerentWeek,
                currentTime:currentTime
            });
        }
            return dataArr; 
    }

  
    setPagination(30)
    function setPagination (totnum){   //设置翻页
        $("#pagination").pagination( {
            pageCount:5,  
            coping:false,  
            count:1,  
            prevContent:'上一页',  
            nextContent:'下一页', 
            totalData: 30,
                // totalData: totnum,
                showData: 2,
                coping: true ,
                callback:function (api){
                // api.getPageCount() 获取总页数
                // api.setPageCount(page) 设置总页数
            var index = api.getCurrent() //获取当前是第几页
            console.log(index)
            var query = {};
            query.arrival_date = $('#arr_time').val();
            query.departure_date = $('#leave_time').val();
                // query.city= $('#des').val();
                query.city= '北京';
                query.page= index;
                query.post= true;
                // $.post('hotel',query,function(res){
                //     map.clearOverlays()
                //     renderList(res);
                //     renderMarker();
                // },'json')
            }
    
        })
    };

    function getMyweek(date){
            var date = new Date(date)
            var week;
            if(date.getDay()==0) {week="周日"}
            if(date.getDay()==1) {week="周一"}
            if(date.getDay()==2) {week="周二"}
            if(date.getDay()==3) {week="周三"}
            if(date.getDay()==4) {week="周四"}
            if(date.getDay()==5) {week="周五"}
            if(date.getDay()==6) {week="周六"}
            return week;
    }

})
    

