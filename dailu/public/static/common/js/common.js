//获取当前时间，格式YYYY-MM-DD
var getDate = function () {
    var date = new Date();
    var seperator1 = "-";
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var strDate = date.getDate();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }
    // var currentdate = year + seperator1 + month + seperator1 + strDate;
    var currentdate = year + "-" + month + "-" + strDate;
    return currentdate;
};
//给当前时间加天数
var addDate = function (date, days) {
    var d = new Date(date);
    d.setDate(d.getDate() + days);
    var m = d.getMonth() + 1;
    // return d.getFullYear()+'-'+m+'-'+d.getDate(); 
    // ---
    d = d.getDate();
    if (m >= 1 && m <= 9) {
        m = "0" + m;
    }
    if (d >= 0 && d <= 9) {
        d = "0" + d;
    }
    return m + '.' + d;
}


//根据对象的值获取数组里该对象的索引值
var getArrIndex = function (arr, obj) {
    var index = null;
    var key = Object.keys(obj)[0];
    arr.every(function (value, i) {
        if (value[key] === obj[key]) {
            index = i;
            return false;
        };
        return true;
    });
    return index;
};
//获取边界线的经纬度
var mapPaths = function (latLngs) {
    var paths = [],
        latLng = "",
        list = latLngs.split(";");
    //console.log(list)
    for (i = list.length - 1; i >= 0; i--) {
        latLng = list[i].split(",");
        var lat = latLng[1],
            lng = latLng[0];
        if ((isFloatNumber(lat)) && (isFloatNumber(lng))) {
            paths.push(new google.maps.LatLng(lat, lng));
        }
    };
    return paths
};

function isFloatNumber(value) {
    return (!isNaN(value));
};

//详情弹出层tab切换
function tabSwitch(details) {
    $(details).find(".details_popup_tab li").each(function (i, n) {
        var length_num = $(".details_popup_tab li").length;
        $(n).click(function () {
            $(details).find(".tab_content_box .tab_content").scrollTop(0)
            var tab_lits_position = $(n).position().left
            $(details).find(".details_popup_tab_active").stop(true, true).animate({
                left: tab_lits_position
            }, length_num * 10);
            $(details).find(".tab_content_box .tab_content").eq(i).stop(true, true).fadeIn("fast").siblings().fadeOut("fast");
        });
    });

};


//判断对象是否为空
function isObject(obj) {
    for (var key in obj) {
        return false;
    }
    return true;
};

//获取路径参数
function getUrlParam(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
    var r = window.location.search.substr(1).match(reg); //匹配目标参数
    if (r != null) return unescape(r[2]);
    return null; //返回参数值
}


/**
 * 计算n天后的日期
 * initDate：开始日期，默认为当天日期， 格式：yyyymmdd/yyyy-mm-dd
 * days:天数
 * flag：返回值， 年与日之间的分隔符， 默认为xxxx年xx月xx日格式
 */
function getDateAfter_n(initDate, days, flag) {

    if (!days) {
        return initDate;
    }
    initDate = initDate.replace(/-/g, '');
    flag = $.trim(flag);
    var date;
    // 是否设置了起始日期
    if (!$.trim(initDate)) { // 没有设置初始化日期，就默认为当前日期
        date = new Date();
    } else {
        var year = initDate.substring(0, 4);
        var month = initDate.substring(4, 6);
        var day = initDate.substring(6, 8);
        date = new Date(year, month - 1, day); // 月份是从0开始的
    }
    date.setDate(date.getDate() + days);

    var yearStr = date.getFullYear();
    var monthStr = ("0" + (date.getMonth() + 1)).slice(-2, 8); // 拼接2位数月份
    var dayStr = ("0" + date.getDate()).slice(-2, 8); // 拼接2位数日期
    var result = "";
    if (!flag) {
        result = yearStr + "年" + monthStr + "月" + dayStr + "日";
    } else {
        result = yearStr + flag + monthStr + flag + dayStr;
    }
    return result;
}

/*function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1);
        if (c.indexOf(name) != -1) return c.substring(name.length, c.length);
    }
    return "";
}*/

function getCookie(name)//取cookies函数
{
    var arr = document.cookie.match(new RegExp("(^| )" + name + "=([^;]*)(;|$)"));
    if (arr != null) return unescape(arr[2]); return null;
}

//在线客服
$('.js_map_service').on('click',function(){
    window.open('http://www.365webcall.com/chat/ChatWin3.aspx?settings=mw7mw6XN6PNwNPz3A7mXIPz3Am00mwXz3AX6mmPm&LL=0','你的袋鹿小管家','height=530, width=730, top=100, left=50, toolbar=no, menubar=no, scrollbars=no, resizable=no,location=no, status=no')
})
//帮助中心
$('.js_help').on('click',function(){
    window.open('/portal/helpcenter/helpMain.html')
})

function Set_ssdata(data_id, data) {
        if (data_id != "") {
            if (data) {
                var lsobj = window.sessionStorage;
                var datajson = JSON.stringify(data);
                lsobj.setItem(data_id, datajson);
            }
        }
    }

    //获取本地存储数据
function Get_ssdata(data_id) {
        if (data_id != "") {
            var data = null;
            var lsdata = window.sessionStorage;
            try {
                var datajson = lsdata.getItem(data_id);
                datajson = JSON.parse(datajson);
                data = datajson;
            } catch (e) {

            } finally {
                return data;
            }
        }
    }