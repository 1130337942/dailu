<?php
namespace app\portal\controller;
header("Content-type: text/html; charset=utf-8"); 
use think\Db;
use \think\Request;
use cmf\controller\HomeBaseController;
class HotelController extends HomeBaseController{
	//酒店列表
    public function hotelList(){
        // $post = input('post.');
        // $city_name = input('post.city');//酒店搜索条件一，城市
        $city_name = '北京市';
        $districts = input('post.districts');//酒店搜索条件二，地区
        $districts = array('东城区','西城区','海淀区');
        // $districts = '西湖区';
        $businessZone = input('post.businessZone');//酒店搜索条件三，商圈
        // $businessZone = '龙川风景区';
        $xml = simplexml_load_file(dirname(__FILE__)."\geo_cn.xml");
        $aa  = json_decode(json_encode($xml))->HotelGeoList->HotelGeo;
        $info = json_decode(json_encode($aa),TRUE);
        $hotel = array();
        foreach ($districts as $ke => $val) {   
            foreach ($info as $k => $v) {
                if($v['@attributes']['CityName'] == $city_name){
                    $city = $v;
                    $cityId = $v['@attributes']['CityCode'];//城市编码
                }
            }
            $disId = '';
            foreach ($city['Districts']['Location'] as $key => $value) {
                if($value['@attributes']['Name'] == $val){
                    $disId = $value['@attributes']['Id'];//地区编码
                }
            }
            $busId = '';
            foreach ($city['CommericalLocations']['Location'] as $key1 => $value1) {
                if($value1['@attributes']['Name'] == $businessZone){
                    $busId = $value1['@attributes']['Id'];//商圈编码
                }
            }
            // print_r($disId);
            $BusinessZoneId = $busId ? $busId : null;
            $districtId = $disId ? $disId : null;
            // print_r($city);exit;
            $time = time();
            // $arrivalDate = input('arrivalDate');
            $arrivalDate = '2018-05-18';
            // $departureDate = input('departureDate');
            $departureDate = '2018-05-20';
            $lowRate = input('post.lowRate') ? input('post.lowRate') : null;
            $highRate = input('post.highRate') ? input('post.highRate') : null;
            $position = input('post.position');
            $sort = input('post.sort')?input('post.sort'):'Default';
            $page = input('post.page')?input('post.page'):'1';
            $data = json_encode(array(
                'Version'=>'1.33',
                'Local'=>'zh_CN',
                'Request'=>array(
                    'ArrivalDate'=> $arrivalDate,//入住日期
                    'DepartureDate'=> $departureDate,//离店日期
                    'CityId'=>$cityId,//城市编码
                    // 'QueryText'=>'',//查询关键词
                    // 'QueryType'=>'',//查询类型
                    'PaymentType'=>'All',//支付方式
                    // 'ProductProperties'=>'LimitedTimeSale',//产品类型
                    // 'Facilities'=>'',//设施
                    // 'ThemeIds'=>'',//主题
                    // 'StarRate'=>'5',//推荐星级
                    // 'BrandId'=>'',//品牌编码
                    // //'GroupId'=>'',//酒店集团编码                
                    'LowRate'=>$lowRate,//最小价格
                    'HighRate'=>$highRate,//最大价格   
                    'DistrictId'=>$disId,//地区编码 
                    'BusinessZoneId'=>'',//商圈编码 
                    // 'Position'=>array(
                    //     'Longitude'=>'116.519419',//经度
                    //     'Latitude'=>'39.880478',//维度 
                    //     'Radius'=>'10000'//半径   
                    // ),//位置查询   
                    // 'InvoiceMode'=>'Hotel',//预付发票模式  
                    'Sort'=>$sort,//排序类型 Default艺龙默认排序,StarRankDesc推荐星级降序,RateAsc价格升序,RateDesc价格降序,DistanceAsc距离升序
                    'PageIndex'=>$page,//页码
                    'PageSize'=>'20',//每页记录数  
                    'CustomerType'=>'None',//宾客类型   
                    'CheckInPersonAmount'=>'0',//房间入住人数  
                    'ResultType'=>'1,2,3,4'//返回信息类型
                )
            ));
            // print_r($data);exit;
            $signature = md5($time.md5($data.'8f96779e575ee86f0da3b80ac8cb028c').'8f183eb910d9724c63a1e2cb441a58c6');
            $str = mb_convert_encoding("http://api.test.lohoo.com/rest?format=json&method=hotel.list&user=Agent1519710554464&timestamp=$time&signature=$signature&data=$data","UTF-8");
            $fileContents = file_get_contents($str);
            // print_r(json_decode($fileContents));exit;
            $contents = json_decode($fileContents)->Result;
            // print_r($contents);
            if(!empty($contents)){
                $obj = $contents->Hotels;
                $count = $contents->Count;//酒店数目
                $hotel = array_merge($hotel,json_decode(json_encode($obj),TRUE));
                // echo json_encode(array('count'=>$count,'hotels'=>$hotel));
            }else{
                echo 'no';
            }
        }
                print_r($hotel);

    }
    //酒店详情
    public function hotelDetail(){
        // $post = input('post.');
        $time = time();
        $data = json_encode(array(
            'Version'=>'1.33',
            'Local'=>'zh_CN',
            'Request'=>array(
                'ArrivalDate'=>'2018-03-20',
                'DepartureDate'=>'2018-03-23',
                'HotelIds'=>'50101021',
                'Options'=>'1,2,3,4',
                'PaymentType'=>'All'
            )
        ));
        // print_r($data);
        $signature = md5($time.md5($data.'8f96779e575ee86f0da3b80ac8cb028c').'8f183eb910d9724c63a1e2cb441a58c6');
        $fileContents = file_get_contents("http://api.test.lohoo.com/rest?format=json&method=hotel.detail&user=Agent1519710554464&timestamp=$time&signature=$signature&data=$data");
        if(!empty($fileContents->Result)){
            $obj = json_decode($fileContents)->Result->Hotels;
            $hotelDetail = json_decode(json_encode($obj),TRUE);
            print_r($hotelDetail);
        }else{
            echo 'no';
        }
    }
    //数据验证
    public function hotelVal(){
        // $post = input('post.');
        $time = time();
        $data = json_encode(array(
            'Version'=>'1.33',
            'Local'=>'zh_CN',
            'Request'=>array(
                'ArrivalDate'=>'2018-03-20',
                'DepartureDate'=>'2018-03-23',
                'EarliestArrivalTime'=>'2018-03-20 16:00:00',
                'LatestArrivalTime'=>'2018-03-20 17:00:00',
                'HotelId'=>'50101021',
                'RoomTypeID'=>'1065',
                'RatePlanId'=>'64876',
                'TotalPrice'=>'1500.0',
                'NumberOfRooms'=>'1'
            )
        ));
        $signature = md5($time.md5($data.'8f96779e575ee86f0da3b80ac8cb028c').'8f183eb910d9724c63a1e2cb441a58c6');
        $url = "http://api.test.lohoo.com/rest?format=json&method=hotel.data.validate&user=Agent1519710554464&timestamp=$time&signature=$signature&data=$data";
        $url = str_replace(" ","%20",$url);
        $fileContents = json_decode(file_get_contents($url));
        $hotelDetail = json_decode(json_encode($fileContents),TRUE);//对象转数组
        print_r($fileContents);
    }
    //酒店下单
    public function hotelOrderCreate(){
        $post = input('post.');
        $time = time();
        $data = json_encode(array(
            'Version'=>'1.33',
            'Local'=>'zh_CN',
            'Request'=>array(
                'AffiliateConfirmationId'=>'ab3311',//订单号，重试时提交不可修改，使用身份证后六位
                'ArrivalDate'=>'2018-03-20',//入驻日期
                'ConfirmationType'=>'NotAllowedConfirm',//SMS_cn 艺龙发送短信，订单失败主动联系
                'Contact'=>array(
                    'Mobile'=>'13121383702',
                    'Name'=>'zmzm'
                ),//联系人
                // 'CreditCard'=>array(
                //     'ExpirationMonth'=>'10',
                //     'ExpirationYear'=>'2016',
                //     'HolderName'=>'',
                //     'IdNo'=>'',
                //     'IdType'=>'IdentityCard',
                //     'Number'=>'',
                //     'cVV'=>'',
                // )
                'CurrencyCode'=>'RMB',//货币类型
                'CustomerIPAddress'=>'192.168.1.62',//客人访问IP
                'CustomerType'=>'All',//客人类型
                'DepartureDate'=>'2018-03-23',//离店日期
                'EarliestArrivalTime'=>'2018-03-20 16:00:00',//最早到店时间
                'HotelId'=>'50101021',//酒店编号    
                'IsGuaranteeOrCharged'=>'false',//是否已担保或已付款
                'IsCreateOrderOnly'=>'true',//true为仅创建订单
                'LatestArrivalTime'=>'2018-03-20 18:00:00',//最晚到店时间 
                'NumberOfCustomers'=>'1',//客人数量
                'NumberOfRooms'=>'1',//房间数量 
                'OrderRooms'=>array(
                    array(
                        'Customers'=>array(
                            array(
                                'Name'=>'zmzm'
                            )
                        )
                    )
                ),//客人信息    
                'PaymentType'=>'SelfPay',//付款类型:SelfPay-前台现付、Prepay-预付
                'RatePlanId'=>'64876',//RatePlanId
                'RoomTypeId'=>'1065',//RoomTypeId
                'TotalPrice'=>'1500.0'//总价,RatePlan的TotalRate * 房间数
            )
        ));
        $signature = md5($time.md5($data.'8f96779e575ee86f0da3b80ac8cb028c').'8f183eb910d9724c63a1e2cb441a58c6');
        $url = "https://api.test.lohoo.com/rest?format=json&method=hotel.order.create&user=Agent1519710554464&timestamp=$time&signature=$signature&data=$data";
        $url = str_replace(" ","%20",$url);
        $fileContents = file_get_contents($url);
        print_r(json_decode($fileContents));
    }
    //酒店订单支付
    public function hotelOrderPay(){
        // $post = input('post.');
        $time = time();
        $data = json_encode(array(
            'Version'=>'1.33',
            'Local'=>'zh_CN',
            'Request'=>array(
                'OrderId'=>'171889351',
                // 'IsGuaranteeOrCharged'=>'',
                //信用卡信息
                'CreditCard'=>array(
                    'ExpirationMonth'=>'10',//有效期月
                    'ExpirationYear'=>'2016',//有效期年
                    'HolderName'=>'',//持卡人
                    'IdNo'=>'',//证件号码
                    'IdType'=>'IdentityCard',//证件类型
                    'Number'=>'',//卡号
                    'cVV'=>'',
                ),
                'Amount'=>'1500.0'
            )
        ));
        $signature = md5($time.md5($data.'8f96779e575ee86f0da3b80ac8cb028c').'8f183eb910d9724c63a1e2cb441a58c6');
        $url = "https://api.test.lohoo.com/rest?format=json&method=hotel.order.pay&user=Agent1519710554464&timestamp=$time&signature=$signature&data=$data";
        // $url = str_replace(" ","%20",$url);
        $fileContents = json_decode(file_get_contents($url));
        $hotelDetail = json_decode(json_encode($fileContents),TRUE);//对象转数组
        print_r($fileContents);
    }
    //订单状态增量
    public function hotelOrderInor(){
        // $post = input('post.');
        $time = time();
        $data = json_encode(array(
            'Version'=>'1.33', 
            'Local'=>'zh_CN',
            'Request'=>array(
                'OrderId'=>'171889351',
                // 'IsGuaranteeOrCharged'=>'',
            )
        ));
        $signature = md5($time.md5($data.'8f96779e575ee86f0da3b80ac8cb028c').'8f183eb910d9724c63a1e2cb441a58c6');
        $url = "https://api.test.lohoo.com/rest?format=json&method=hotel.order.detail&user=Agent1519710554464&timestamp=$time&signature=$signature&data=$data";
        $fileContents = json_decode(file_get_contents($url));
        $hotelDetail = json_decode(json_encode($fileContents),TRUE);//对象转数组
        print_r($fileContents);
    }
    //订单详情
    public function hotelOrderDetail(){
        // $post = input('post.');
        $time = time();
        $data = json_encode(array(
            'Version'=>'1.33', 
            'Local'=>'zh_CN',
            'Request'=>array(
                'OrderId'=>'171889351',
                // 'IsGuaranteeOrCharged'=>'',
            )
        ));
        $signature = md5($time.md5($data.'8f96779e575ee86f0da3b80ac8cb028c').'8f183eb910d9724c63a1e2cb441a58c6');
        $url = "https://api.test.lohoo.com/rest?format=json&method=hotel.order.detail&user=Agent1519710554464&timestamp=$time&signature=$signature&data=$data";
        $fileContents = json_decode(file_get_contents($url));
        $hotelDetail = json_decode(json_encode($fileContents),TRUE);//对象转数组
        print_r($fileContents);
    }
    //取消订单
    public function hotelOrderCancel(){
        // $post = input('post.');
        $time = time();
        $data = json_encode(array(
            'Version'=>'1.33', 
            'Local'=>'zh_CN',
            'Request'=>array(
                'OrderId'=>'171889351',
                'CancelCode'=>'行程变更'
                // 'IsGuaranteeOrCharged'=>'',
            )
        ));
        $signature = md5($time.md5($data.'8f96779e575ee86f0da3b80ac8cb028c').'8f183eb910d9724c63a1e2cb441a58c6');
        $url = "https://api.test.lohoo.com/rest?format=json&method=hotel.order.cancel&user=Agent1519710554464&timestamp=$time&signature=$signature&data=$data";
        $fileContents = json_decode(file_get_contents($url));
        $hotelDetail = json_decode(json_encode($fileContents),TRUE);//对象转数组
        print_r($fileContents);
    }
    function distance($lng1, $lat1, $lng2, $lat2) {
        // 将角度转为狐度
        $radLat1 = deg2rad($lat1); //deg2rad()函数将角度转换为弧度
        $radLat2 = deg2rad($lat2);
        $radLng1 = deg2rad($lng1);
        $radLng2 = deg2rad($lng2);
        $a = $radLat1 - $radLat2;
        $b = $radLng1 - $radLng2;
        $s = 2 * asin(sqrt(pow(sin($a / 2), 2) + cos($radLat1) * cos($radLat2) * pow(sin($b / 2), 2))) * 6378.137;
        return $s;
    } 
    function juli(){
        echo $a = $this->distance('117.06351791899999','30.5429317636','118.17494827709993','30.1296038928');
    }
    //城市优化
    function automatic(){
        $departure_city = $_POST['departure_city'];
        $return_city = $_POST['return_city'];
        $go_city_array = $_POST['go_city_array'];
        $traffic_tools = $_POST['traffic_tools'];
        foreach ($go_city_array as $key2 => &$value2) {
            $value2['lat'] = $value2['position']['lat'];
            $value2['lng'] = $value2['position']['lng'];
        }
        $count = count($go_city_array);
        if($count>2){
            $d1 = array();
            $return=$this->sortDis($d1,$go_city_array);
            foreach ($return as $k => $v) {
                foreach ($go_city_array as $key1 => $value1) {
                    if($v == $value1['city_name']){
                        $array[] = $value1;
                    }
                }
            }
            $start[] = array('city_name'=>$departure_city['city_name'],'lat'=>$departure_city['lat'],'lng'=>$departure_city['lng']);
            $arr = array($go_city_array[0]);
            $array = array_merge($start,$arr,$array);
            $num = count($array);
            for($i=0;$i<$num;$i++){
                for($j=$i+1;$j<$num;$j++){
                    $dis[]= $this->distance($array[$i]['lat'],$array[$i]['lng'],$array[$j]['lat'],$array[$j]['lng']);break;
                }
            }
            unset($array[0]);
            $array = array_values($array);
            foreach ($array as $key => &$value) {
                $value['dis'] = $dis[$key];
                $value['trainTime'] = round($dis[$key]/130,1);
                if($value['dis']<300){
                    $value['flightTime'] = '';
                }else{
                    $value['flightTime'] = round($dis[$key]/200,1);
                }
            }
            $last = array($array[$count-1]);
            $last[0]['dis'] = '';
            $last[0]['trainTime'] = '';
            $last[0]['flightTime'] = '';
            $lastDis= $this->distance($last[0]['lat'],$last[0]['lng'],$return_city['lat'],$return_city['lng']);
            $return_city['dis'] = $lastDis;
            if($lastDis<300){
                $return_city['flightTime'] = '';
            }else{
                $return_city['flightTime'] = round($lastDis/200,1);
            }
            $return_city['trainTime'] = round($lastDis/130,1);
            $array = array_merge($array,$last);
            $returnData = array('departure_city'=>$departure_city,'go_city_array'=>$array,'return_city'=>$return_city);
        }else{
            $oneDis = $this->distance($departure_city['lat'],$departure_city['lng'],$go_city_array[0]['lat'],$go_city_array[0]['lng']);
            $go_city_array[0]['dis'] = $oneDis;
            if($oneDis<300){
                $go_city_array[0]['flightTime'] = '';
            }else{
                $go_city_array[0]['flightTime'] = round($oneDis/200,1);
            }
            $go_city_array[0]['trainTime'] = round($oneDis/130,1);
            $go_city_array[1] = $go_city_array[0];
            $go_city_array[1]['dis'] = '';
            $go_city_array[1]['trainTime'] = '';
            $go_city_array[1]['flightTime'] = '';
            $lastDis = $this->distance($go_city_array[0]['lat'],$go_city_array[0]['lng'],$return_city['lat'],$return_city['lng']);
            $return_city['dis'] = $lastDis;
            if($lastDis<300){
                $return_city['flightTime'] = '';
            }else{
                $return_city['flightTime'] = round($lastDis/200,1);
            }
            $return_city['trainTime'] = round($lastDis/130,1);
            $returnData = array('departure_city'=>$departure_city,'go_city_array'=>$go_city_array,'return_city'=>$return_city);
        }

        echo json_encode($returnData,JSON_UNESCAPED_UNICODE);
    }
    //城市优化
    function sortDis($d1,$data){
        $a = array();
        $num = count($data);
        for($i=0;$i<$num;$i++){
            for($j=1;$j<$num;$j++){
                $a[] = [$data[$i],$data[$j]];
            }
            break;
        }
        foreach ($a as $k => &$v) {
            $dis = $this->distance($v['0']['lat'],$v['0']['lng'],$v['1']['lat'],$v['1']['lng']);
            $b[$v[1]['city_name']] = $dis;
        }
        asort($b);
        $d = array_keys($b);
        $d1[] = $d[0];//距离最短地点1
        foreach ($data as $key => $value) {
            if($value['city_name'] == $d[0]){
                $data[0] = $value;
                unset($data[$key]);
            }
        }
        $data = array_values($data);
        if(!empty($data[1])){
            $d1 = $this->sortDis($d1,$data);
        }
        return $d1;

    }







}