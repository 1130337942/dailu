<?php
// +----------------------------------------------------------------------
// | ThinkCMF [ WE CAN DO IT MORE SIMPLE ]
// +----------------------------------------------------------------------
// | Copyright (c) 2013-2017 http://www.thinkcmf.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed ( http://www.apache.org/licenses/LICENSE-2.0 )
// +----------------------------------------------------------------------
// | Author: bingwang <thinkcmf@126.com>
// +----------------------------------------------------------------------
namespace app\portal\controller;

use cmf\controller\HomeBaseController;
use think\Db;

class MapController extends HomeBaseController
{
    public function customline()
    {
        return $this->fetch();
    }

    //我的出行计划
    public function MyPlan()
    {
        session_start();
        $info = $_SESSION;
        $result = $info['start'];
        echo json_encode($result,JSON_UNESCAPED_UNICODE);
    }
    
    //机场三字码
    public function changeThreeWord($city_name_var)
    {
        $xml = simplexml_load_file(dirname(__FILE__)."\city.xml");
        $city_name=$city_name_var;  //取参数
        $three_word=array();  //机场的三字码
        $i=0;
        foreach($xml->state as $state){
            foreach($state->attributes() as $city){
                if($city_name==$city){
                   foreach($state->children() as $a){
                       foreach($a->attributes() as $b){
                           $three_word[$i]=$b;
                           $i++;
                       }
                   }
                }
            }
        }
        return $three_word;
    }
    //模拟post
    public function request($url,$https,$method,$post_data)
    {
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        if($https === true){
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        }
        if($method ==='post'){
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $post_data);
        }
        if($method==='get'){
            curl_setopt_array($ch, array(
            CURLOPT_URL =>$url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => "",
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => "GET",
            CURLOPT_HTTPHEADER => array(
                "cache-control: no-cache",
                "postman-token: 2dd165a8-96bf-22d4-cf96-1c8ec21045e9"
            ),
         ));
        }
        $content = curl_exec($ch);
        curl_close($ch);
        return $content;
    }
    //判断该城市是否可以一键制作行程
    public function IsQuick()
    {
        $post= $_POST;   
        $cityArray = $post['go_city_array'];
        //查找城市对应的行程单
        $info = Db::name('City_line')->field('citystring,trip_id,list')->where(array('rapid_tag'=>1))->select()->toarray();
        //找到对应的城市所有行程单
        foreach($cityArray as $kk=>$va)
        {
            $re = [];
            foreach ($info as $key => $drvalue) 
            {
                $list = json_decode($drvalue['list'],true);
                if(strstr($drvalue['citystring'],$va['city_name'])){
                    foreach($list as $ll){
                        if(isset($ll['this_city']) && $ll['this_city'] == $va['city_name']){
                            $re[$key]['day_num'] = $ll['day_num']; 
                        }
                        if(isset($ll['city_name']) && $ll['city_name'] == $va['city_name']){
                            $re[$key]['day_num'] = $ll['day_num']; 
                        }
                    }
                    $re[$key]['this_city'] = $va['city_name']; 
                    $re[$key]['trip_id'] = $drvalue['trip_id']; 
                }
            }
            //若 某个城市的模板数据不存在，则不可以进行一键制作
            if(empty($re)){
                $result = 'false';
            }
        }
        if(isset($result)){
            $return = array('status'=>false,'msg'=>'暂时没有合适数据进行一键制作');
        }else{
            $return = array('status'=>true,'msg'=>'可以进行一键制作');
        }
        echo json_encode($return,JSON_UNESCAPED_UNICODE);
    }
    //一键制作接收游玩城市，匹配特殊行程的数据
    public function QuickBuilt()
    {
        session_start();
        $post = $_POST;
//        $uid = $post['uid'];
        $cityArray = $post['go_city_array'];
        $day_num = $post['day_num'];
        $date = $post['date'];
        $cover = $post['cover'];
        $uid = $post['uid'];
//        print_r($post);
//        exit;
        
        $departure_city = $post['departure_city'];
        $return_city = $post['return_city'];
         
        $citylen = count($cityArray);
        //每个游玩城市的起始日期,结束时间
        if($citylen < 2){
            $city_daynum = $cityArray[0]['city_daynum'];
            $cityArray[0]['city_d_1'] = 1;
            $cityArray[0]['city_d_2'] = $city_daynum; 
            $cityArray[0]['city_date'] = $date;
            $cityArray[0]['city_date2'] = date("Y-m-d",(strtotime($date) + ($city_daynum-1)*3600*24));
        }else{
            $daysum = 0;
            $city_d_1 = 0; 
            $city_d_2 = 0;
            for($i=0;$i<$citylen;$i++)
            {
                $city_d_1 = $city_d_2 + 1; 
                $city_d_2 = $city_d_2 + $cityArray[$i]['city_daynum']; 
                if($i == 0)
                {
                    $cityArray[0]['city_d_1'] = $city_d_1;
                    $cityArray[0]['city_d_2'] = $city_d_2;
                    $cityArray[0]['city_date'] = date("Y-m-d",(strtotime($date)));
                    $cityArray[0]['city_date2'] = date("Y-m-d",(strtotime($date) + ($cityArray[0]['city_daynum']-1)*3600*24));
                }
                if($i>0)
                {
                    if($cityArray[$i]['city_daynum'] !== '0'){
                        $cityArray[$i]['city_d_1'] = $city_d_1;
                        $cityArray[$i]['city_d_2'] = $city_d_2;
                        $daysum = $daysum + $cityArray[$i-1]['city_daynum'];
                        $cityArray[$i]['city_date'] = date("Y-m-d",(strtotime($date) + $daysum*3600*24));
                        $cityArray[$i]['city_date2'] = date("Y-m-d",(strtotime($date) + ($city_d_2-1)*3600*24));
                    }else{
                        //选择了城市游玩0天
                        $cityArray[$i]['city_d_1'] = $city_d_2;
                        $cityArray[$i]['city_d_2'] = $city_d_2;
                        $daysum = $daysum + $cityArray[$i-1]['city_daynum'];
                        $cityArray[$i]['city_date2'] = $cityArray[$i]['city_date'] = date("Y-m-d",(strtotime($date) + ($city_d_2-1)*3600*24));
                    }
                }
            }
        }

        //游玩总天数
        $day_num = array_sum(array_map(create_function('$vals', 'return $vals["city_daynum"];'),$cityArray));
        $citylen = count($cityArray);
        //每个游玩城市的起始日期
        if($citylen < 2){
            $cityArray[0]['city_date'] = $date;
        }else{
            $daysum = 0;
            for($i=0;$i<$citylen;$i++){
                if($i == 0){
                    $cityArray[0]['city_date'] = date("Y-m-d",(strtotime($date)));
                }
                if($i>0){
                    $daysum = $daysum + $cityArray[$i-1]['city_daynum'];
                    $cityArray[$i]['city_date'] = date("Y-m-d",(strtotime($date) + $daysum*3600*24));
                }
            }
        }
        foreach($cityArray as $key=>$cityValue){
            $cityList[] = $cityValue['city_name']; 
            //时间类（日期，周几，安排时段）
            $first_date = $cityValue['city_date'];
            for($i=0;$i<$cityValue['city_daynum'];$i++){
                $dateArray[$key][$i]['city_id'] = $cityValue['city_id'];
                if($i == 0){
                    $dateArray[$key][$i]['hotel_day'] = $cityValue['city_d_1'];
                }else{
                    $dateArray[$key][$i]['hotel_day'] = $cityValue['city_d_1'] + $i;
                }
                $dateArray[$key][$i]['city_name'] = $cityValue['city_name'];
                $dateArray[$key][$i]['of_date'] = date("Y-m-d",(strtotime($first_date) + $i*3600*24));
                $dateArray[$key][$i]['date'] = str_replace('-','.',date("m-d",(strtotime($first_date) + $i*3600*24)));
                $dateArray[$key][$i]['month_day'] = str_replace('.','月',$dateArray[$key][$i]['date']).'日';
                $weeks = date("N",(strtotime($first_date) + $i*3600*24));
                $dateArray[$key][$i]['betw_time'] = '08:00-22:00';
                switch($weeks)
                {
                    case 1:
                    $dateArray[$key][$i]['weeks'] = '周一';
                    break;  
                    case 2:
                    $dateArray[$key][$i]['weeks'] = '周二';
                    break;
                    case 3:
                    $dateArray[$key][$i]['weeks'] = '周三';
                    break;
                    case 4:
                    $dateArray[$key][$i]['weeks'] = '周四';
                    break;
                    case 5:
                    $dateArray[$key][$i]['weeks'] = '周五';
                    break;
                    case 6:
                    $dateArray[$key][$i]['weeks'] = '周六';
                    break;
                    case 7:
                    $dateArray[$key][$i]['weeks'] = '周天';
                    default:
                }
            }
        }
//        print_r($dateArray);
//        exit;
            
            foreach($cityArray as $k1=>&$goValue)
            {
                foreach($dateArray as $k2=>$dateValue)
                {
                    if($k1 == $k2)
                    {
                        $goValue['timeData'] = $dateValue;
                    }
                }
            }
//        print_r($cityArray);
//            $departure_city['day_num'] = $day_num;
      //查找城市对应的行程单
        $info = Db::name('City_line')->field('citystring,trip_id,list')->where(array('rapid_tag'=>1))->select()->toarray();
        //找到对应的城市所有行程单
        foreach($cityArray as $kk=>$va)
        {
            // echo 1;
            $re = [];
            foreach ($info as $key => $drvalue) 
            {
                $list = json_decode($drvalue['list'],true);
                if(strstr($drvalue['citystring'],$va['city_name'])){
                    foreach($list as $ll){
                        if($ll['this_city'] == $va['city_name']){
                            $re[$key]['day_num'] = $ll['day_num']; 
                        }
                    }
                    $re[$key]['this_city'] = $va['city_name']; 
                    $re[$key]['trip_id'] = $drvalue['trip_id']; 
                }
            }
            $tripArray = array_merge($re);
//             print_r($tripArray);

            //匹配对应的城市天数，找到对应的唯一一个trip_id
            $baseData='';
            if(!empty($tripArray))
            {
                foreach($tripArray as $ke2=>$val)
                {
                    $baseData1 = '';
                    $baseData2 = '';
                    if($va['city_name'] == $val['this_city'])
                    {    
                        if($va['city_daynum'] == $val['day_num']){
                            // echo 7;
                            $baseData1 = $val;
                            break;
                        }else{
                            // echo 8;
                            $f_sort = array_column($tripArray, 'day_num');  
                            array_multisort($f_sort, SORT_DESC, $tripArray); 
                            $baseData2 = $tripArray[0];
                        }
                    }
                }
                if(!empty($baseData1)){
                    // echo 5;
                    $baseData = $baseData1; //找个匹配的天数
                }else if(empty($baseData1) && !empty($baseData2)){
                    // echo 9;
                    $baseData = $baseData2; //没有匹配的天数，用最大的天数
                }
            }
//            print_r($baseData);
            //根据确定的trip_id，查询plan_info表中的景点数据,改变维度
            if(!empty($baseData))
            {
                $planInfo = Db::name('plan_info')->field('uid,trip_id,schedufing')->where(array('trip_id'=>$baseData['trip_id']))->find();
                $sch = unserialize(base64_decode($planInfo['schedufing']));
                $scheduf = json_decode(json_encode($sch),true); 
//                 print_r($scheduf);
                foreach($scheduf as $schValue)
                {
                    if($schValue['this_city'] == $baseData['this_city'])
                    {
                        $schlen = count($schValue['day_arry']);
                        // echo $schlen;
                        // echo $va['city_daynum'];
                        if($schlen == $va['city_daynum']){ //天数正好匹配
                            $spotDay = $schValue;
                        }else if($schlen < $va['city_daynum']){ //行程单中的天数少，追加维度
                            // echo 0; 
                            $temparray = array(array('date'=>'','newtime'=>'9:00','time'=>0,'start_index_hotel'=>''));
                            for($i=0;$i<$va['city_daynum']-$schlen;$i++){
                                $schValue['day_arry'] = array_merge($schValue['day_arry'],$temparray);
                            }
                        }else{    //行程单中的天数多了，减少维度
                            // echo 1;
                            $mark = $schlen-($schlen-$va['city_daynum']);
                            $schValue['day_arry'] = array_slice($schValue['day_arry'],0,$mark);
                        }
                    }
                }

                $spotDay = $schValue;
                if(isset($spotDay['arrival_date'])){
                    unset($spotDay['arrival_date']);
                }
                if(isset($spotDay['departure_date'])){
                    unset($spotDay['departure_date']);
                }
                if(isset($spotDay['prevHotel'])){
                    unset($spotDay['prevHotel']);
                }
                if(isset($spotDay['hotel_num'])){
                    unset($spotDay['hotel_num']);
                }
                //重新匹配每天的日期
                foreach($spotDay['day_arry'] as $keyy1=>&$ssVl)
                {
                    foreach($va['timeData'] as $keyy2=>$dateValue)
                    {
                        if($keyy1 == $keyy2){
                            $ssVl['of_date'] = $dateValue['of_date'];
                            $ssVl['date'] = $dateValue['date'];
//                            $ssVl['date'] = str_replace('-','.',substr($dateValue['date'],strpos($dateValue['date'],'-')+1));
                            $ssVl['hotel_day'] = $dateValue['hotel_day'];
                            $ssVl['month_day'] = $dateValue['month_day'];
                            $ssVl['weeks'] = $dateValue['weeks'];
                            $ssVl['month_day'] = $dateValue['month_day'];
                            $ssVl['betw_time'] = $dateValue['betw_time'];
                        }
                    }
                    if(isset($ssVl['hotel']) && empty($ssVl['hotel']['hotel_name'])){
                        unset($ssVl['hotel']);
                    }
                }
                $allList[] = $spotDay;
            }
        }
//print_r($allList);

//    print_r($post);
//   print_r($allList);
//    exit;  
        //景点之间的距离，大交通重构
        foreach($allList as $kk2=>&$cityinfo)
        {
            unset($cityinfo['middle_city'],$cityinfo['formData']);
            $cityinfo['departure_city'] = $departure_city['city_name'];
            $cityinfo['return_city'] = $return_city['city_name'];

            $cityinfo['arrival_date'] = $cityArray[$kk2]['city_date'];
            $t = strtotime($cityArray[$kk2]['city_date']);
            $a = ($cityArray[$kk2]['city_daynum']-1).'day';  
            $cityinfo['departure_date'] = date('Y-m-d',strtotime("+$a",$t));
                                    
            //查询城市详情
            $city_name = $cityinfo['this_city'];
            $this_city = Db::name('City_details')->where(array('city_name'=> $city_name))->field(array('city_Introduction','more','city_abbreviation'))->find();
//            $cityinfo['city_abbreviation'] = $this_city['city_abbreviation']; 
//            $cityinfo['city_Introduction'] = htmlchars($this_city['city_Introduction']); 

            $dish_cover = json_decode($this_city['more'],true);
            foreach($dish_cover as $k2 => &$dish_value){
                $cityinfo['city_image_url']= cmf_get_image_preview_url($dish_value['url']); 
            }
            unset($this_city['more']);
           
            $day = $cityinfo['day_arry'];
            $dist2 = array();   //初始化景点之间的距离
            foreach($day as $key1=>&$vvv)
            {
                //每个城市第一天的大交通
                unset($vvv['one_city'],$vvv['two_city']);  //原始数据中剔除，后面赋予新的数据
                foreach($cityArray as $kk5=>$f)
                {
                    $times = strtotime($f['city_date']);
                    if(strtotime($vvv['of_date']) == $times)
                    { 
                        if($kk2 !== 0){         //除了第一个城市的其他城市第一天
                            $vvv['one_city'] = $cityArray[$kk5-1]['city_name'];
                            $vvv['two_city'] = $f['city_name'];
                            $vvv['city_trc_name'] = $f['city_trc_name'];
                            //大交通结构
                            $transport['one_city'] =  $transport['start_city'] = $cityArray[$kk5-1]['city_name'];
                            $transport['two_city'] =  $transport['city_name']= $f['city_name'];
                            $transport['city_date'] = $vvv['of_date'];
                            $transport['tooltime'] = $transport['trafficTime']= $f['trc_time'];
                            if($vvv['city_trc_name'] == '飞机交通'){
                                $transport['trc_class'] = 'air_icon ';
                            }
                            if($vvv['city_trc_name'] == '铁路交通'){
                                $transport['trc_class'] = 'tra_icon';
                            }
                            if($vvv['city_trc_name'] == '汽车交通'){
                                $transport['trc_class'] = 'car_icon';
                            }
                            if($vvv['city_trc_name'] == '其他交通'){
                                $transport['trc_class'] = 'other_icon';
                            }
                            $transport['price'] = 0;
                            $transport['people'] = 1;
                            $transport['dis'] = $f['dis'];
                            $transport['city_trc_name'] = $vvv['city_trc_name'];
                            $vvv['transport'] = [$transport];
                        }

                        if($kk2 == 0){           //第一个游玩城市第一天
                            if($key1 == 0){
                                $vvv['city_trc_name'] = $f['city_trc_name'];
                                $vvv['dis'] = $f['dis'];
                                $vvv['one_city'] = $departure_city['city_name'];
                                $vvv['two_city'] = $f['city_name'];
                                
                                //大交通结构
                                $transport['one_city'] =  $transport['start_city'] = $departure_city['city_name'];
                                $transport['two_city'] =  $transport['city_name']= $f['city_name'];
                                $transport['city_date'] = $vvv['of_date'];
                                $transport['tooltime'] = $transport['trafficTime']= $f['trc_time'];
                                if($f['city_trc_name'] == '飞机交通'){
                                    $transport['trc_class'] = 'air_icon ';
                                }
                                if($f['city_trc_name'] == '铁路交通'){
                                    $transport['trc_class'] = 'tra_icon';
                                }
                                if($f['city_trc_name'] == '汽车交通'){
                                    $transport['trc_class'] = 'car_icon';
                                }
                                if($f['city_trc_name'] == '其他交通'){
                                    $transport['trc_class'] = 'other_icon';
                                }
                                $transport['price'] = 0;
                                $transport['people'] = 1;
                                $transport['dis'] = $f['dis'];
                                $transport['city_trc_name'] = $vvv['city_trc_name'];
                                $vvv['transport'] = [$transport];
                            }
                        }
                    }
                    if($kk2 == $citylen-1){   //最后一个游玩城市最后一天
                        $xc = count($allList[$kk2]['day_arry']);
                        if($key1 == $xc-1){
                            $vvv['city_trc_name'] = $return_city['city_trc_name'];
                            $vvv['dis'] = $return_city['dis'];
                            $vvv['one_city'] = $f['city_name'];
                            $vvv['two_city'] = $return_city['city_name'];
                            
                             //大交通结构
                            $transport['one_city'] =  $transport['start_city'] = $f['city_name'];
                            $transport['two_city'] =  $transport['city_name']= $return_city['city_name'];
                            $transport['city_date'] = $vvv['of_date'];
                            $transport['tooltime'] = $transport['trafficTime']= $return_city['trc_time'];
                            if($return_city['city_trc_name'] == '飞机交通'){
                                $transport['trc_class'] = 'air_icon ';
                            }
                            if($return_city['city_trc_name'] == '铁路交通'){
                                $transport['trc_class'] = 'tra_icon';
                            }
                            if($return_city['city_trc_name'] == '汽车交通'){
                                $transport['trc_class'] = 'car_icon';
                            }
                            if($return_city['city_trc_name'] == '其他交通'){
                                $transport['trc_class'] = 'other_icon';
                            }
                            $transport['price'] = 0;
                            $transport['people'] = 1;
                            $transport['dis'] = $return_city['dis'];
                            $transport['city_trc_name'] = $vvv['city_trc_name'];
                            $vvv['transport'] = [$transport];
                        }
                    }                  
                }
                ////
                //
                //计算每天的时间总和(景点适玩时间、交通时间、美食时间)
                if(isset($vvv['day']))
                {
                    $len = count($vvv['day']);
                    if($len >1)
                    { 
                        foreach($vvv['day'] as $key2=>&$vs)
                        {
                            if($key2 < count($vvv['day'])-1)
                            {
                                $dist2[$key1][] =getDistance($vvv['day'][$key2]['this_lng'], $vvv['day'][$key2]['this_lat'],
                                $vvv['day'][$key2+1]['this_lng'], $vvv['day'][$key2+1]['this_lat'], 2); 
                            }
                            unset($day[$key1]['day'][$key2]['traffic_time']);
                            unset($day[$key1]['day'][$key2]['dis']);
                            unset($day[$key1]['day'][$key2]['distance']);
                            
                            if(isset($vs['eat_info']) && empty($vs['eat_info'])){
                                unset($day[$key1]['day'][$key2]['eat_info']);    
                            }
                        }
                    }
                    if($len == 1){
                        foreach($vvv['day'] as $key2=>&$vs){
                            if(isset($vs['eat_info']) && empty($vs['eat_info'])){
                                unset($day[$key1]['day'][$key2]['eat_info']);    
                            }
                        }
                    }
                    if(isset($day[$key1]['day'][$len-1]['traffic_time'])) {unset($day[$key1]['day'][$len-1]['traffic_time']);}
                    if(isset($day[$key1]['day'][$len-1]['dis'])){unset($day[$key1]['day'][$len-1]['dis']);}

                    //每天的最后一个景点和酒店之间的距离和交通时间
                    if(isset($vvv['hotel'])){
                        $endspot = end($vvv['day']);
                        $spot_to_hotleDis = getDistance($endspot['this_lng'], $endspot['this_lat'],
                        $vvv['hotel']['lng'], $vvv['hotel']['lat'], 2);
                        $vvv['day'][$len-1]['traffic_distance'] = round($spot_to_hotleDis,1);
                        if($spot_to_hotleDis<= 80){
                            $ttt = round($spot_to_hotleDis/30,5);
                            $vvv['day'][$len-1]['traffic_time'] = $ttt;
                            $tra = explode('.', $ttt);
                            if(isset($tra[1])){
                                $min =ceil (('0'.'.'.$tra[1]) * 60);
                                if($tra[0] > 0){
                                    $vvv['day'][$len-1]['traffic_time_chinese'] = $tra[0].'小时'.$min.'分钟';
                                }else{
                                    if($tra[0] == 1){
                                        $vvv['day'][$len-1]['traffic_time_chinese'] = '1小时';
                                    }else{
                                        $vvv['day'][$len-1]['traffic_time_chinese'] = $min.'分钟';
                                    }
                                }
                            }else{
                                $vvv['day'][$len-1]['traffic_time_chinese'] = '0分钟';
                            }
                        }
                        if($spot_to_hotleDis> 80){
                            $ttt = round($spot_to_hotleDis/60,1);
                            $vvv['day'][$len-1]['traffic_time'] = $ttt;
                            $tra = explode('.', $ttt);
                            if(isset($tra[1])){
                                $min = ceil(('0'.'.'.$tra[1]) * 60);
                                if($tra[0] > 0){
                                    if($tra[0] == 1){
                                        $vvv['day'][$len-1]['traffic_time_chinese'] = '1小时';
                                    }else{
                                        $vvv['day'][$len-1]['traffic_time_chinese'] = $tra[0].'小时'.$min.'分钟';
                                    }
                                }else{
                                    $vvv['day'][$len-1]['traffic_time_chinese'] = $min.'分钟';
                                }
                            }else{
                                $vvv['day'][$len-1]['traffic_time_chinese'] = '0分钟';
                            }
                        }
                        //距离小于5公里,步行时间（5公里/小时）
                        if($spot_to_hotleDis< 5){
                            $ttt = round($spot_to_hotleDis/5,1);
                            $vvv['day'][$len-1]['traffic_time'] = $ttt;
                            $tra = explode('.', $ttt);
                            if(isset($tra[1])){
                                $min = ceil(('0'.'.'.$tra[1]) * 60);
                                $vvv['day'][$len-1]['traffic_time_chinese'] = $min.'分钟';
                            }else{
                                $vvv['day'][$len-1]['traffic_time_chinese'] = '0分钟';
                            }
                        }
                    }
                    
                    if(!isset($vs['business_hours'])){
                       if(isset($vs['info']['business_hours'])){
                            $vs['business_hours'] = $vs['info']['business_hours'];
                        }
                    }
                    if(isset($vs['business_hours']) && $vs['business_hours'] == ''){
                        $vs['business_hours'] = '09:00 - 21:00';
                    }
                }
            }
//print_r($dist2);
//print_r($day);
//exit;
            foreach($day as $k1=>$tacter)
            {
                if(isset($dist2))
                {
                    foreach($dist2 as $k2=>$vale)
                    {
                        if($k1 == $k2)
                        {
                            foreach($vale as $k3=>$v)
                            {
                                $day[$k1]['day'][$k3]['traffic_distance'] =round($v,1);
                                if($v<= 80){
                                    $traffictime = round($v/30,1);
                                    $day[$k1]['day'][$k3]['traffic_time'] = $traffictime;
                                    $traTime = explode('.', $traffictime);
                                    if(isset($traTime[1])){
                                        $min = ceil(('0'.'.'.$traTime[1]) * 60);
                                        if($traTime[0] > 0){
                                            if($traTime[0] == 1){
                                                $day[$k1]['day'][$k3]['traffic_time_chinese'] = '1小时';
                                            }else{
                                                $day[$k1]['day'][$k3]['traffic_time_chinese'] = $traTime[0].'小时'.$min.'分钟';
                                            } 
                                        }else{
                                            $day[$k1]['day'][$k3]['traffic_time_chinese'] = $min.'分钟';
                                        }
                                    }else{
                                        $day[$k1]['day'][$k3]['traffic_time_chinese'] = '0分钟';
                                    }
                                }
                                if($v> 80){
                                    $traffictime = round($v/60,1);
                                    $day[$k1]['day'][$k3]['traffic_time'] = $traffictime;
                                    $traTime = explode('.', $traffictime);
                                    if(isset($traTime[1])){
                                        $min = ceil(('0'.'.'.$traTime[1]) * 60);
                                        if($traTime[0] > 0){
                                            if($traTime[0] == 1){
                                                $day[$k1]['day'][$k3]['traffic_time_chinese'] = '1小时';
                                            }else{
                                                $day[$k1]['day'][$k3]['traffic_time_chinese'] = $traTime[0].'小时'.$min.'分钟';
                                            } 
                                        }else{
                                            $day[$k1]['day'][$k3]['traffic_time_chinese'] = $min.'分钟';
                                        }
                                    }else{
                                        $day[$k1]['day'][$k3]['traffic_time_chinese'] = '0分钟';
                                    }
                                }
                                //距离小于5公里,步行时间(5公里/小时)
                                if($v< 5){
                                    $traffictime = round($v/5,1);
                                    $day[$k1]['day'][$k3]['traffic_time'] = $traffictime;
                                    $traTime = explode('.', $traffictime);
                                    if(isset($traTime[1])){
                                        $min = ceil(('0'.'.'.$traTime[1]) * 60);
                                        $day[$k1]['day'][$k3]['traffic_time_chinese'] = $min.'分钟';
                                    }else{
                                        $day[$k1]['day'][$k3]['traffic_time_chinese'] = '0分钟';
                                    }
                                }
                            }
                        } 
                    }
                } 
            }
            $cityinfo['day_arry'] = $day;  
        }
        $adult = $post['adult'];
        $children = $post['children'];
//    print_r($allList);
//    exit;
        //大交通单独拿出来
        foreach($allList as $tkey=>$traValue){
             foreach($traValue['day_arry'] as $tkey2=>$tvalue){
                 if(isset($tvalue['transport'])){
                    $Trafficmoney[] = $tvalue['transport'][0];
                 }
            }
        }   
        $_SESSION['Trafficmoney'] = $Trafficmoney; 
       
        //行程单名称,封面图默认第一目的地城市封面
        $cityString = '';
        $cityString = implode('.',$cityList);
        $trip_name = $cityString. $citylen.'城市'.$day_num.'日游';
        //基础数据
        //出发城市
        $baseInfo['dep']['dep_lat'] = $departure_city['lat'];
        $baseInfo['dep']['dep_lng'] =  $departure_city['lng'];
        $baseInfo['dep']['departure_city'] =  $departure_city['city_name'];
        $baseInfo['dep']['city_trc_name'] =  $cityArray[0]['city_trc_name'];
        $baseInfo['dep']['flightTime'] =  $cityArray[0]['trc_time'];
        $baseInfo['dep']['trainTime'] = $cityArray[0]['trc_time'];
        $baseInfo['dep']['dis'] =  $cityArray[0]['dis'];
        
        $baseInfo['dep']['adult'] = $adult;
        $baseInfo['dep']['children'] = $children;
        $baseInfo['dep']['date'] = $date;
        $baseInfo['dep']['day_num'] = $day_num;
        $baseInfo['dep']['travel_title'] = $trip_name;
        $baseInfo['dep']['cover'] = $cover;
        // 返回城市
        $baseInfo['ret']['ret_lat'] =  $return_city['lat'];
        $baseInfo['ret']['ret_lng'] =  $return_city['lng'];        
        $baseInfo['ret']['return_city'] =  $return_city['city_name'];
        $baseInfo['ret']['city_trc_name'] = $return_city['city_trc_name'];
        $baseInfo['ret']['flightTime'] = $return_city['trc_time'];
        $baseInfo['ret']['trainTime'] = $return_city['trc_time'];
        $baseInfo['ret']['trafficTime'] = $return_city['trc_time'];
        $baseInfo['ret']['dis'] = $return_city['dis'];
        $baseInfo['travel_title'] =  $trip_name;
        $baseInfo['cover'] =  $cover;

//        foreach($allList as $key2=>&$h)
//        {
//            foreach($h['day_arry'] as $keyy=>&$ft)
//            {
//                //数据格式
//                if(isset($ft['start_time'])){
//                    $ft['start_clock'] = $ft['start_time'];
//                    $ft['resultsTime'] = $ft['end_time'];
//                }else{
//                    $ft['start_clock'] = '08:00';
//                    $ft['resultsTime'] = '22:00';
//                }
//                if(isset($ft['city_trc_name'])){
//                    $ft['traffic']['city_trc_name'] =  $ft['city_trc_name'];
//                    $ft['traffic']['city_date'] =  $ft['of_date'];
//                    $ft['traffic']['dis'] =  $ft['dis'];
//                    $ft['traffic']['start_city'] =  $ft['one_city'];
//                    $ft['traffic']['city_name'] =  $ft['two_city'];
//      
//                    if($ft['city_trc_name'] == '飞机交通'){
//                        $ft['traffic']['tooltime'] =  $ft['flightTime'];
//                    }else if($ft['city_trc_name'] == '铁路交通'){
//                        $ft['traffic']['tooltime'] =  $ft['trainTime'];
//                    }else{
//                        $ft['traffic']['tooltime'] =  $ft['trafficTime'];
//                    } 
//                }
//                $ft['city'] =  $h['this_city'];
//                $ft['hotel']['date'] = $ft['date'];
//                $h['day_arry'][$keyy]['hotel']['date'] = $h['day_arry'][$keyy]['date'];
//                
//                if(isset($ft['hotel']) && empty($ft['hotel']['hotel_name'])){
//                    unset($ft['hotel']);
//                }
//                if(!isset($ft['day'])){
//                    $ft['day'] = array();
//                }else{
//                   /* foreach($ft['day'] as $keyy3=>$jing){
//                        if(isset($jing['info'])){
//                            unset($jing['info']);
//                        }
//                        if(isset($jing['eat_info'])){
//                            unset($jing['eat_info']);
//                        }
//                    }*/
//                }
//            }
//        }
      
          
        $r_spot['adult'] = $adult;
        $r_spot['children'] = $children;
        $r_spot['title'] = $trip_name;
        $r_spot['day_num']  = $day_num;
        $r_spot['cover']  = $cover;
        $r_spot['date']  = $date;
        $r_spot['across_city']  = 'false';
        $r_spot['next_city_day0']  = 'false';
        $r_spot['spot_data']['this_city_index'] = 0; //默认进来是第一个城市下标
        $r_spot['go_city_array']  = $cityArray;
        $r_spot['departure_city']['city_name'] = $departure_city['city_name'];
        $r_spot['departure_city']['lat'] = $departure_city['lat'];
        $r_spot['departure_city']['lng'] = $departure_city['lng'];
        $r_spot['return_city']  = $return_city;
        foreach($cityArray as $key=>$goVa){
            $citynameData[$key] = $goVa['city_name'];
        }
        $r_spot['cityArray']  = $citynameData;
//          print_r($r_spot);
//         exit; 
        $firstcity = $allList[0];
        $data['r_spot'] = $r_spot;
        $data['result'] = $firstcity;
        
        $_SESSION['firstData'] = $data;
        
        $_SESSION['list'] = $allList;
        $_SESSION['baseInfo'] = $baseInfo;
        $_SESSION['cityArray'] = $cityArray;
        
        if($data){
            $return = array('status'=>true,'msg'=>'请求成功','data'=>[]);
        }else{
            $return = array('status'=>false,'msg'=>'请求失败','data'=>[]);
        }
        echo json_encode($return,JSON_UNESCAPED_UNICODE);
    }
    //一键制作，返回第一个城市的数据到编辑页面展示
    public function  EditQuick()
    {
        session_start();
        $data = $_SESSION['firstData'];
        if($data)
        {
            $return = array('status'=>true,'msg'=>'请求成功','data'=>$data);
        }else{
            $return = array('status'=>false,'msg'=>'请求失败','data'=>[]);
        }
        echo json_encode($return,JSON_UNESCAPED_UNICODE);
    }
    
    //一键制作，查看行程单
    public function SucessQuick()
    {
        session_start();
        unset($_SESSION['aroundCity']);
        $info = $_SESSION;
        $allList = $info['list'];
        $baseInfo = $info['baseInfo'];
        $cityArray = $info['cityArray'];

        //接收被修改的城市数据和当前城市的索引值,多个城市
        $post = file_get_contents('php://input'); 
        $ccData = json_decode($post,true); 
        if(isset($ccData['now_city_index'])){
            $now_city_index = $ccData['now_city_index'];  //被点击城市下标
        }
        if(isset($ccData['push_type'])){
            $push_type = $ccData['push_type'];  //点击类型（查看行程单按钮look）
        }
        if(isset($ccData['trip_id'])){
            $uid = $ccData['uid'];
            $trip_id = $ccData['trip_id'];
        }
        //生成行程单号
        $time = time();
        $uid = $ccData['uid'];
        $trip_id = $uid.'-'.$time;  
        //上个城市数据
        $singcityData = $ccData['singcityData'];   
        $city_name = $singcityData['this_city'];
        foreach($singcityData['day_arry'] as &$rtu){
            if(isset($rtu['hotel'])){
                $mostnewHotel[] = $rtu['hotel'];
            }else{
                $noHotel[]['of_date'] = $rtu['of_date']; //没有选择酒店的日期
            }
            if(isset($rtu['day'])){
                foreach($rtu['day'] as &$ji){
                    if(!isset($ji['info'])){  //新增加的景点没有info详情时，插入info详情
                        $this_floor_index = '';
                        $spot_name = '';
                        $this_floor_index = $ji['this_floor_index'];
                        $spot_name = $ji['this_name'];
//                        echo gettype($this_floor_index );

                        $shopList1 = Db::name('Nature_absture')->where(array('city_name'=> $city_name,'spot_name'=>$spot_name))->find();
                        if(isset($shopList1))
                        {
                            // 若选择了Top8的景点，最后输出的时候，id匹配到人文景观中对应景点的id
                            if($shopList1['type'] == 'Top8')
                            {
                                $absture = Db::name('Nature_absture')->field('spot_name,id')->where(array('city_name'=>$city_name,'spot_name'=>$spot_name,'type'=>'人文景观'))->find();
                                if(!empty($absture)){ $shopList1['id'] = $absture['id'];}
                            }

                            if(!empty($shopList1['pic']))
                            {
                                $spot_cover = json_decode($shopList1['pic'],true);
                                foreach($spot_cover as $k2 => &$spot_value)
                                {
                                    $shopList1['spot_image_url']= cmf_get_image_preview_url($spot_value['url']); 
                                }
                                unset($shopList1['pic']);
                            }
                            //unset($shopList1['picture2']);
                            //营业时间
                            $shopList1['business_hours'] = $shopList1['suit_time'];
                            unset($shopList1['suit_time']);
                            //人均
                            $shopList1['per_capita'] = '';
                            $ji['info'] = $shopList1;
                        }

                        $shopList2 = Db::name('Describe')->where(array('city_name'=> $city_name,'spot_name'=>$spot_name))->find();
                        if(isset($shopList2))
                        {
                            if(!empty($shopList2['pic']))
                            {
                                $spot_cover = json_decode($shopList2['pic'],true);
                                foreach($spot_cover as $k2 => &$spot_value)
                                {
                                    $shopList2['spot_image_url']= cmf_get_image_preview_url($spot_value['url']); 
                                }
                                //unset($shopList2['pic']);
                            }
                            unset($shopList2['picture2']);
                            $shopList2['business_hours'] = $shopList2['suit_time'];
                            unset($shopList2['suit_time']);
                            $shopList2['per_capita'] = '';
                            $ji['info'] = $shopList2;
                        }

                        $shopList3 = Db::name('Night')->where(array('city_name'=> $city_name,'spot_name'=>$spot_name))->find();
                        if(isset($shopList3))
                        {
                            if(!empty($shopList3['pic']))
                            {
                                $spot_cover = json_decode($shopList3['pic'],true);
                                foreach($spot_cover as $k2 => &$spot_value)
                                {
                                    $shopList3['spot_image_url']= cmf_get_image_preview_url($spot_value['url']); 
                                }
                                unset($shopList3['pic']);
                            }
                            //unset($shopList3['picture2']);
                            $shopList3['business_hours'] = $shopList3['suit_time'];
                            unset($shopList3['suit_time']);
                            $shopList3['per_capita'] = '';
                            $ji['info'] = $shopList3;
                        }

                        $shopList4 = Db::name('Food_court')->where(array('city_name'=> $city_name,'food_court_name'=>$spot_name))->find();
                        if(isset($shopList4))
                        {
                            if(!empty($shopList4['pic']))
                            {
                                $spot_cover = json_decode($shopList4['pic'],true);
                                foreach($spot_cover as $k2 => &$spot_value)
                                {
                                    $shopList4['spot_image_url']= cmf_get_image_preview_url($spot_value['url']); 
                                }
                            }
                            //楼层中的相关字段，名称匹配
                            if(isset($shopList4['food_court_name']))
                            {
                                $shopList4['spot_name'] = $shopList4['food_court_name'];
                                unset($shopList4['food_court_name']);
                            }

                            //适玩时间
                            if(isset($shopList4['suit_time']))
                            {
                                $shopList4['play_time'] = $shopList4['suit_time'];
                                unset($shopList4['suit_time']);
                            }

                            //门票
                            $shopList4['attractions_tickets'] = '';
                            $shopList4['ticket_data'] = '';
                            unset($shopList4['pic'],$shopList4['picture2']);
                            $ji['info'] = $shopList4;
                        }

                        $shopList5 = Db::name('shopping_streets')->where(array('city_name'=> $city_name,'shopping_name'=>$spot_name))->find();
                        if(isset($shopList5))
                        {
                            if(!empty($shopList5['pic']))
                            {
                                $spot_cover = json_decode($shopList5['pic'],true);
                                foreach($spot_cover as $k2 => &$spot_value)
                                {
                                    $shopList5['spot_image_url']= cmf_get_image_preview_url($spot_value['url']); 
                                }
                            }

                            if(isset($shopList5['shopping_name']))
                            {
                                $shopList5['spot_name'] = $shopList5['shopping_name'];
                                unset($shopList5['shopping_name']);
                            }
                            //适玩时间
                            if(isset($shopList5['shopping_time']))
                            {
                                $shopList5['play_time'] = $shopList5['shopping_time'];
                                unset($shopList5['shopping_time']);
                            }

                            $shopList5['attractions_tickets'] = '';
                            $shopList5['ticket_data'] = '';
                            $shopList5['suit_season'] = '';
                            unset($shopList5['pic']);
                            $ji['info'] = $shopList5;
                        }
                        //用户自己新增的景点
                        if($this_floor_index === '')
                        {
                            $newspot = Db::name('New_spot')->field('address,city_id')->where(array('spot_name'=> $ji['this_name'],'city_id'=>$ji['city_id']))->find();
                            $ji['info']['city_id'] = $newspot['city_id'];
                            $ji['info']['city_name'] = $city_name;
                            $ji['info']['play_time'] = $ji['this_playtime'];
                            $ji['info']['spot_image_url'] = $ji['this_img_src'];
                            $ji['info']['latitude'] = $ji['this_lat'];
                            $ji['info']['longitude'] = $ji['this_lng'];
                            $ji['info']['spot_name'] = $ji['this_name'];
                            $ji['info']['longitude'] = $ji['this_lng'];
                            $ji['info']['address'] = $newspot['address'];
                            $ji['address'] = $newspot['address'];

                            $ji['info']['attractions_tickets'] = '';
                            $ji['info']['suit_season'] = '';
                            $ji['info']['business_hours'] = '';
                            $ji['info']['phone'] = '';
                            $ji['info']['spot_Introduction'] = '';

                            $ji['info']['attractions_tickets'] = '';
                            $ji['info']['ticket_data'] = '';
                            $ji['info']['picture2'] = '';
                        }
                        //用户自己的景点，7楼
                        $selfList = Db::name('New_spot')->where(array('uid'=> $uid,'spot_name'=>$spot_name))->find();
                        if(isset($selfList))
                        {
                            if(!empty($selfList['pic'])){
                               $selfList['spot_image_url'] = $selfList['pic'];
                            }
                            $selfList['business_hours'] = $selfList['suit_time'];
                            unset($selfList['suit_time']);
                            $selfList['per_capita'] = '';
                            $ji['info'] = $selfList;
                        }
                         //编辑时，将美食当做景点拖入时。插入info
                        if($ji['this_type'] == '必吃美食' || $ji['this_type'] == '本土美食')
                        {
                            $ji['info']['city_id'] = $ji['city_id'];
                            $ji['info']['city_name'] = $city_name;
                            $ji['info']['play_time'] = $ji['this_playtime'];
                            $ji['info']['spot_image_url'] = $ji['this_img_src'];
                            $ji['info']['latitude'] = $ji['this_lat'];
                            $ji['info']['longitude'] = $ji['this_lng'];
                            $ji['info']['spot_name'] = $ji['this_name'];
                            $ji['info']['longitude'] = $ji['this_lng'];
                            $ji['info']['address'] = '';

                            $ji['info']['attractions_tickets'] = '';
                            $ji['info']['suit_season'] = '';
                            $ji['info']['business_hours'] = '';
                            $ji['info']['phone'] = '';
                            $ji['info']['spot_Introduction'] = '';

                            $ji['info']['attractions_tickets'] = '';
                            $ji['info']['ticket_data'] = '';
                            $ji['info']['picture2'] = '';
                        }
                    }
                }
            }
        }
         
        
        $r_spot['go_city_array'] = $cityArray;
        //点击城市卡片，返回对应城市数据
        if(!isset($push_type)){
            //2、输出当前城市数据
            $r_spot['adult'] = $ccData['adult'];
            $r_spot['children'] = $ccData['children'];
            $r_spot['title'] = $ccData['title'];
            $r_spot['day_num']  = $ccData['day_num'];
            $r_spot['cover']  = $ccData['cover'];
            $r_spot['date']  = $ccData['date'];
            $r_spot['across_city']  = 'false';
            $r_spot['next_city_day0']  = 'false';
            $r_spot['spot_data']['this_city_index'] = $now_city_index;
            $r_spot['departure_city'] = $ccData['departure_city'];
            $r_spot['return_city']  = $ccData['return_city'];
            $r_spot['cityArray']  = $ccData['cityArray'];
            $nowcity = $allList[$now_city_index];
            $data['r_spot'] = $r_spot;
            $data['result'] = $nowcity;
            if($data)
            {
                $return = array('status'=>true,'msg'=>'请求成功','data'=>$data);
            }else{
                $return = array('status'=>false,'msg'=>'请求失败','data'=>[]);
            }
        }else{         
            //点击查看行程单按钮，数据更新到数据库
            //选择了几家酒店
            if(isset($hotelData)){
                $allhotel = $hotelData;
                foreach($allhotel  as $kv=>$ha){
                    if(empty($ha['hotel_name'])){
                        unset($allhotel[$kv]);
                    }
                }
                array_merge($allhotel);
                 //计算重复酒店的个数
                if(!empty($allhotel)){
                    foreach($allhotel as $te){
                        $b[]= $te['hotel_name'];
                    }
                    $c = array_unique($b);
                    foreach($c as $v)
                    {
                        $n=0;
                        foreach($allhotel as $t){
                            if($v==$t['hotel_name'])
                                $n++;
                        }
                        // echo "数字 $v 出现了 $n 次";
                        $new[$v]=$n;
                    }
                    // echo json_encode($new);
                    $aa="'".implode("','", $new)."'";
                    //去重后的酒店数据
                    $hotel_newArr = $this->array_unset_tt($allhotel,'hotel_name'); 
                    //每个酒店个数整合
                    foreach($hotel_newArr as $k5=>&$poi)
                    {
                        foreach($new as $k6=>$ww)
                        {
                            if($k5 == $k6){
                                $poi['number_night'] = $ww;  //每个酒店住几晚
                            }
                        }
                    }
                    foreach($hotel_newArr as $y=>$o){
                        $h_Result[] = $o;   //总共选择了几家酒店入住
                    }
                }
            }
//            print_r($h_Result);
//            exit;
            //游玩人数
            $people = $ccData['adult'] + $ccData['children'];
             /*** 餐饮费用 ***/
            foreach($allList as $key3=>$c){
                foreach($c['day_arry'] as $cc){
                    if(isset($cc['day'])){
                        foreach($cc['day'] as $ccc){
                            if(!empty($ccc['eat_info'])){
                                $eat[] = $ccc['eat_info'];
                            }
                        }
                    }
                }
            }
            if(isset($eat)){
                foreach($eat as $k => $v) {
                    foreach($v as $n){
                        $eatResult[] = $n;
                    }
                }
            }
            if(isset($eatResult)){
                foreach($eatResult as &$vv){
                    preg_match('/\d+/',$vv['per_capita'],$b); 
                    // print_r($b);
                    if(isset($b[0])){
                        $vv['price'] = $b[0];
                        $vv['people'] = $people;
                        $vv['total_price'] = $b[0] * $people;
                    }
                }
            }

            $Trafficmoney = $info['Trafficmoney'];
             //调用交通接口，计算费用
            foreach ($Trafficmoney as $go_key => &$go_value) {
                $go_value['people'] = $ccData['adult']; + $ccData['children'];
                if($go_value['city_trc_name'] == '飞机交通'){
                    $result= $this->changeThreeWord($go_value['start_city']);
                    if(empty($result)){
                        $price = 0;
                        $go_value['price'] = $price;
                        continue;
                    }
                    foreach ($result as $start_val){
                        break;
                    }
                    $result= $this->changeThreeWord($go_value['city_name']);
                    if(empty($result)){
                        $price = 0;
                        $go_value['price'] = $price;
                        continue;
                    }
                    foreach ($result as $end_val){
                        break;
                    }
                    $createTime = time();
                    $date = str_replace('.','-',$go_value['city_date']);
                    $params = json_encode(array( 
                        'dpt'=>"$start_val",
                        'arr'=>"$end_val",
                        'date'=>$date,
                        'ex_track'=>'tehui'
                        ));
                    $sign   = md5('createTime='.$createTime.'key=6178322b4842d39dba955decb330d534params='.$params.'tag=flight.national.supply.sl.searchflighttoken=aef2cd32710926403bfa70170bbf205d');
                    $url     = "http://qae.qunar.com/api/router?sign=$sign&tag=flight.national.supply.sl.searchflight&token=aef2cd32710926403bfa70170bbf205d&createTime=$createTime&params=$params";
                    $flight_data = file_get_contents($url);
                    $flight_data = json_decode($flight_data);
                    if($flight_data->message == 'SUCCESS'){
                        $price = $flight_data->result->flightInfos[0]->barePrice;
                    }else{
                        $price = 0;
                    }
                    $go_value['price'] = $price;
                }elseif($go_value['city_trc_name'] == '铁路交通'){
                    if($go_value['start_city'] !== $go_value['city_name']){
                        $start     = $go_value['start_city'];//出发地
                        // $start     = '舟山';//出发地
                        $end       = $go_value['city_name'];//目的地
                        $startTime = str_replace('.','-',$go_value['city_date']);//始发时间
                        $station   = include(dirname(__FILE__).'\name.php');
                        $retailId  = "FX7052709274825C095";//公司账号id
                        $Dptime    = $startTime;//出发日期
                        if(empty($station[$start]) || empty($station[$end])){
                            $price = 0;
                        }else{
                            $dptCode   = $station[$start];//出发地三字码
                            $eptCode   = $station[$end]; //目的地三字码
                            $url       = "http://hcp.51bib.com/TrainSearchList.ashx";
                            $body      = "data={\"retailId\":\"$retailId\",\"Dptime\":\"$Dptime\",\"dptCode\":\"$dptCode\",\"eptCode\":\"$eptCode\"}";
                            $res       = $this -> request($url,$https=false,$method='post',$body);
                            $content   = iconv("GB2312","UTF-8//ignore",$res);
                            $train_data = json_decode($content);
                            if($train_data->message == '操作成功' && !empty($train_data->trainList)){
                                $price = $train_data->trainList[0]->trainSeatList[0]->price;
                            }else{
                                $price = 0;
                            }
                        }
                        $go_value['price'] = $price;
                    }else{
                        $go_value['price'] = 0;
                    }
                }else{
                    $go_value['price'] = 0;
                }
            }
            $_SESSION['Trafficmoney'] = $Trafficmoney;   //大交通的费用
//          
            //数据存入数据库
            //1、基础数据
//            if(isset($resultHotel)){
//                 $tripData['allhotel'] = json_encode($resultHotel);
//            }else{
//                if(!empty($trip_info['allhotel'])){
//                    $tripData['allhotel'] = json_encode($trip_info['allhotel']);
//                }
//            }
//            print_r($baseInfo);
//            exit;
            $time = time();    
            $tripData['trip_id'] = $trip_id;
            $tripData['uid'] = $uid;
            $tripData['adult'] = $ccData['adult'];
            $tripData['children'] = $ccData['children'];
            $tripData['trip_name'] =  $tripData['custom_title'] = $tripData['travel_title'] = $ccData['title'];
            $tripData['day_num'] = $ccData['day_num'];
            $tripData['cover'] = $ccData['cover'];
            $tripData['date'] = $ccData['date'];
            $tripData['departure_city'] = $baseInfo['dep']['departure_city'];
            $tripData['dep_lat'] = $baseInfo['dep']['dep_lat'];
            $tripData['dep_lng'] = $baseInfo['dep']['dep_lng'];
            $tripData['ret_lng'] = $baseInfo['ret']['ret_lng'];
            $tripData['ret_lat'] = $baseInfo['ret']['ret_lat'];
            $tripData['return_city'] = $baseInfo['ret']['return_city'];
            $tripData['traffic_tools'] = $baseInfo['ret']['city_trc_name'];
            $tripData['dis'] = $baseInfo['ret']['dis'];
            $tripData['flightTime'] = $baseInfo['ret']['flightTime'];
            $tripData['trainTime'] = $baseInfo['ret']['trainTime'];
            $tripData['city_trc_name'] =  $baseInfo['ret']['city_trc_name'];
            $tripData['go_city_array'] = json_encode($cityArray);
            $tripData['return_cityInfo'] = json_encode($baseInfo['ret']);
            $tripData['creat_time'] = $time;
            $tripData['to_origin'] = 0;    //行程单是电脑制作还是app制作（0-pc，1-app）
            $tripData['hotelSum'] = 0;
            $okstatus = Db::name('trip_info')->insert($tripData);
            //dump(Db::getLastSql());
            //
            //2、详细数据
            $planData['trip_id'] = $trip_id;
            $planData['uid'] = $uid;
            $planData['creat_time'] = $time;
            $planData['schedufing'] = base64_encode(serialize($allList));
            $okstatus = Db::name('plan_info')->insert($planData);
            
            //3、list
            $city_line['trip_id'] = $trip_id;
            $city_line['uid'] = $uid;
            $city_line['list'] = json_encode($cityArray);
            $city_line['return_date'] =  date("Y-m-d",(strtotime($ccData['date']) + ($ccData['day_num']-1)*3600*24));
            $city_line['creat_time'] = $time;
            $city_line['uid'] = $uid;
            $okstatus = Db::name('city_line')->insert($city_line);
            //4、交通费用
            $traffic_money['traffic_money'] = json_encode($Trafficmoney);
            $traffic_money['uid'] = $uid;
            $traffic_money['trip_id'] = $trip_id;
            $traffic_money['creat_time'] = $time;
            $traffic_money['status'] = 0;
            $okstatus = Db::name('traffic_money')->insert($traffic_money);
            // 5、酒店费用
            if(isset($h_Result)){
                $hotelInfo['uid'] = $uid;
                $hotelInfo['trip_id'] = $trip_id;
                $hotelInfo['creat_time'] = $time;
                $hotelInfo['hotel_info'] = json_encode($h_Result);
                $okstatus = Db::name('hotel')->insert($hotelInfo);
            }
             
            //6、餐饮费用
            if(isset($eatResult)){
                $eat_money['uid'] = $uid;
                $eat_money['trip_id'] = $trip_id;   
                $eat_money['creat_time'] = $time;
                //接机费用(增值服务)
                if(isset($way)){
                    $eat_money['way_money'] = json_encode($way);
                }
                $eat_money['eat_money'] = json_encode($eatResult); 
                $okstatus = Db::name('eat_money')->insert($eat_money);
            }
            //返回生成成功的状态和trip_id
            if($okstatus !== false){
                $result['trip_id'] = $trip_id;
                $return = array('status'=>true,'msg'=>'请求成功','data'=>$result);
            }else{
                $return = array('status'=>false,'msg'=>'请求失败','data'=>[]);
            }   
        }
        echo json_encode($return,JSON_UNESCAPED_UNICODE);
    }
    
    
    
    //首页地图省份列表
    public function province()
    {
        // //清除上一次操作的session数据
        // session_start();
        // unset($_SESSION);
        // session_destroy(); 
        $get = $_GET;
        $provinceResult = array();
        if(isset($get['uid'])){
            $customer = Db::name('Customer')->where(array('uid'=>$get['uid']))->field('insiders')->find();
            $insiders = $customer['insiders'];
            $provinceResult['insiders'] = $insiders;
        }else{
            $provinceResult['insiders'] = false;
        }
        //港澳台
        $otherData = Db::name('Province_details')->field(array('id','province_id','pic','province_English','province_name','is_municipalities','paiming_id'))->where(array('is_municipalities'=>2))->select()->toarray();
        //is_municipalities = 1  直辖市
        $municipalitiesData = Db::name('Province_details')->field(array('id','province_id','pic','province_English','province_name','is_municipalities','paiming_id'))->where(array('is_municipalities'=>1))->select();
        //is_municipalities = 0  省份
        $provinceData = Db::name('Province_details')->field(array('id','province_id','pic','province_English','province_name','is_municipalities','paiming_id'))->where(array('is_municipalities'=>0))->select();
        $m = json_decode($municipalitiesData,true);  
        $p = json_decode($provinceData,true);
        if(isset($otherData)){
            $Result = array_merge($m,$p,$otherData); //将直辖市和省份,港澳台的数据合并到一个数组中
        }else{
            $Result = array_merge($m,$p); //将直辖市和省份的数据合并到一个数组中
        }
        
        //根据paiming_id 升序输出
        $sort = array_column($Result, 'paiming_id');  
        array_multisort($sort, SORT_ASC, $Result); 

        $provinceResult['pro'] = $Result;
        //处理图片URL
        foreach($provinceResult['pro'] as &$value)
        {
            if(!empty($value['pic']))
            {
                $image =json_decode($value['pic'],true);
                foreach($image as &$img_value)
                {
                    //common.php中封装的图片url解析方法
                    $value['img_url'] = cmf_get_image_preview_url($img_value['url']);   
                }
                unset($value['pic']);
            }
            
        }
        echo json_encode($provinceResult,JSON_UNESCAPED_UNICODE);
    }

    /******** 省份详情   *********/
    public function province_info()
    {
        $pid = $_POST['province_id'];
        //省份表数据
        $provinceData= Db::name('Province_details')->field(array('province_id','province_Introduction','province_English','province_name','pic'))->where(array('province_id'=>$pid))->find();
        if(!empty($provinceData['pic']))
        {
        	$img =json_decode($provinceData['pic'],true);
	        foreach($img as $k => &$image)
	        {
	            //common.php中封装的图片url解析方法
	            $provinceData['img_url'] = cmf_get_image_preview_url($image['url']);   
	        }
	        unset($provinceData['pic']);
        }
        
        //文字描述中的html标签转化成实体
        $provinceData['introduction'] = htmlchars($provinceData['province_Introduction']);
        unset($provinceData['province_Introduction']); 
        /*** 省份下的热门城市 ***/
        $city_where['recommended'] = 1;
        $city_where['province_id'] = $pid;
        $cityData = Db::name('City_details')->field(array('province_id','city_id','city_name','hot_spots','more'))->where($city_where)->order('recom_time desc')->select();

        $cityResult = json_decode($cityData,true);
        foreach($cityResult as &$city)
        {
            $image =json_decode($city['more'],true);
            foreach($image as $key => &$img_value)
            {
                //common.php中封装的图片url解析方法
                $city['img_url'] = cmf_get_image_preview_url($img_value['url']); 
                // $city['img_url'][$key] = cmf_get_image_preview_url($img_value['url']);多张   
            }
            unset($city['more']);
        }
        
        /*** 省份下的热门景点 ***/
        $where['is_province_hot'] = 1;
        $where['province_id'] = $pid;
        $spotData = Db::name('Famous_spot')->field(array('province_id','city_id','city_name','spot_name','pic','absture'))->where($where)->select();
        $spotResult = json_decode($spotData,true);
        foreach($spotResult as &$spot)
        {
            $pic =json_decode($spot['pic'],true);
            foreach($pic as $key2 => &$pic_value)
            {
                //common.php中封装的图片url解析方法
                $spot['img_url'] = cmf_get_image_preview_url($pic_value['url']);   
        }
            unset($spot['pic']);
        }

        /*** 省份下的本地特产 ***/
        $where_condition['goods_is_recommended'] = 1;
        $where_condition['province_id'] = $pid;
        $goodsData = Db::name('Special_goods')->field(array('province_id','city_id','goods_name','city_name','goods_pic','goods_Introduction'))->where($where_condition)->select();
        $goodsResult = json_decode($goodsData,true);
        foreach($goodsResult as &$goods)
        {
            if(!empty($goods['goods_pic']))
            {
                $pic3 =json_decode($goods['goods_pic'],true);
                foreach($pic3 as $key3 => &$value)
                {
                    //common.php中封装的图片url解析方法
                    $goods['img_url'] = cmf_get_image_preview_url($value['url']);   
                }
                unset($goods['goods_pic']);
            }
        }
        
        //省份下美食
        $where_condition2['is_recommended'] = 1;
        $where_condition2['province_id'] = $pid;
        $foodData = Db::name('Special_food')->field(array('province_id','city_id','dishes_name','city_name','dishes_picture','dishes_Introduction'))->where($where_condition2)->select();
        $foodResult = json_decode($foodData,true);
        foreach($foodResult as &$food)
        {
            $food['goods_name'] = $food['dishes_name'];
            $food['goods_Introduction'] = $food['dishes_Introduction'];
            unset($food['dishes_name']);
            unset($food['dishes_Introduction']);

            if(!empty($food['dishes_picture']))
            {
                $pic4 =json_decode($food['dishes_picture'],true);
                foreach($pic4 as $key4 => &$value)
                {
                    //common.php中封装的图片url解析方法
                    $food['img_url'] = cmf_get_image_preview_url($value['url']);   
                }
                unset($food['dishes_picture']);
            }
        }
        if(!empty($foodResult))
        {
            $goodsResult = array_merge($goodsResult,$foodResult);
        }

        /*** 整体上返回省份介绍的数据 ***/
        $provinceInfo = array();    
        $provinceInfo['provinceData'] = $provinceData;
        $provinceInfo['hot_city'] = $cityResult; 
        $provinceInfo['hot_spot'] = $spotResult;
        $provinceInfo['special_goods'] = $goodsResult;
        echo json_encode($provinceInfo,JSON_UNESCAPED_UNICODE);
    }

    //搜索框 (行程表单里的城市搜索)
    public function city_search()
    {
        $queryString = $_GET['city_name'];
        if(strlen($queryString) > 0)
        {
            $where = array();
            $where['area_name'] = array('like',"%$queryString%");  
            $where['area_type'] = 2;
            $provinceData['searchList'] = Db::name('Area')->field(array('area_name','area_id'))->where($where)->select();
            echo json_encode($provinceData,JSON_UNESCAPED_UNICODE);
        }
    }


    /*** 城市列表 ***/
    public function city()
    {
        $province_id = $_POST['province_id'];

        $cityData = Db::name('City_details')->field(array('province_id','city_id','city_name','city_abbreviation','more','fit_day','longitude','latitude','city_score','city_Introduction'))->where(array('province_id'=>$province_id))->select();
        $cityResult = json_decode($cityData,true);
        foreach($cityResult as &$city)
        {
            $image =json_decode($city['more'],true);
            foreach($image as $key => &$img_value)
            {
                //common.php中封装的图片url解析方法
                $city['img_url'] = cmf_get_image_preview_url($img_value['url']); 
            }
            unset($city['more']);
            //根据Top8中的数据排序输出
            preg_match('/\d+/',$city['city_score'],$b); 
            $city['score_num'] = $b[0];
        }
        $cityList = array();
        $sort = array_column($cityResult, 'score_num');  
        array_multisort($sort, SORT_ASC, $cityResult); 
        $cityList['cityList'] = $cityResult;
        echo json_encode($cityList,JSON_UNESCAPED_UNICODE);
    }

    //选择的城市存储到session中，用于返回时使用
    public function CitySession()
    {
        session_start();
        $post = $_POST;
        $_SESSION['citysession'] = $post;
        $result['status'] = 'ok'; 
        echo json_encode($result,JSON_UNESCAPED_UNICODE);
    }

    //返回已经选择好的城市数据
    public function TakeCity()
    {
        session_start();
        $info = $_SESSION;
        if(strtotime($info['citysession']['date']) < time() ){
            $info['citysession']['date'] = date("Y-m-d",time());
        }
        $result = $info['citysession'];
        if($result)
        {
            $return = array('status'=>true,'msg'=>'请求成功','data'=>$result);
        }else{
            $return = array('status'=>true,'msg'=>'请求失败','data'=>[]);
        }  
        echo json_encode($return,JSON_UNESCAPED_UNICODE);
    }

    /*** 城市详情 ***/
    public function city_info()
    {
        /*** 城市基本数据 ***/
        $postData = $_POST;  
        $cityData = Db::name('City_details')->field(array('province_id','city_id','city_name','city_abbreviation','more','city_Introduction','fit_day'))->where(array('city_id'=>$postData['city_id']))->find();
        $img =json_decode($cityData['more'],true);
        foreach($img as $k => &$image)
        {
            //common.php中封装的图片url解析方法
            $cityData['img_url'] = cmf_get_image_preview_url($image['url']);   
        }
        unset($cityData['more']);
        //文字描述中的html标签转化成实体
        $cityData['introduction'] = htmlchars($cityData['city_Introduction']);
        unset($cityData['city_Introduction']);

        /*** 城市下的知名景点 ***/
        $famous_spotData = Db::name('famous_spot')->where(array('city_id'=>$postData['city_id']))->select();
        $famous_spotResult = json_decode($famous_spotData,true);
        foreach($famous_spotResult as &$spot)
        {
            $image =json_decode($spot['pic'],true);
            foreach($image as $key => &$img_value)
            {
                //common.php中封装的图片url解析方法
                $spot['img_url'] = cmf_get_image_preview_url($img_value['url']); 
            }
            unset($spot['pic']);
            //文字描述中的html标签转化成实体
            $spot['spot_In'] = htmlchars($spot['spot_Introduction']);
            unset($spot['spot_Introduction']);
        }
   
        /*** 城市下的特色美食 ***/
        $special_foodData = Db::name('special_food')->where(array('city_id'=>$postData['city_id']))->select();
        $special_foodResult = json_decode($special_foodData,true);
        foreach($special_foodResult as &$food)
        {
            $dishes_pic =json_decode($food['dishes_picture'],true);
            foreach($dishes_pic as $key2 => &$dishes_pic_value)
            {
                //common.php中封装的图片url解析方法
                $food['img_url'] = cmf_get_image_preview_url($dishes_pic_value['url']); 
            }
            unset($food['dishes_picture']);
            //文字描述中的html标签转化成实体
            $food['dishes_de'] = htmlchars($food['dishes_details']);
            unset($food['dishes_details']);
        }
        

        /*** 城市下的特色商品(本地特产) ***/
        $special_goodsData = Db::name('special_goods')->where(array('city_id'=>$postData['city_id']))->select();
        $special_goodsResult = json_decode($special_goodsData,true);
        foreach($special_goodsResult as &$goods)
        {
            $goods_pic =json_decode($goods['goods_pic'],true);
            foreach($goods_pic as $key2 => &$goods_pic_value)
            {
                //common.php中封装的图片url解析方法
                $goods['img_url'] = cmf_get_image_preview_url($goods_pic_value['url']); 
            }
            unset($goods['goods_pic']);
             //文字描述中的html标签转化成实体
            $goods['goods_de'] = htmlchars($goods['goods_details']);
            unset($goods['goods_details']);
        }

        /*** 城市下的城市交通 ***/
        $planeData = Db::name('city_traffic')->where(array('city_id'=>$postData['city_id']))->select();
    
        $Result = json_decode($planeData,true);
        foreach($Result as &$traffic)
        {
        	if(!empty($traffic['traffic_pic']))
        	{
        		$traffic_pic =json_decode($traffic['traffic_pic'],true);
	            foreach($traffic_pic as $key3 => &$traffic_pic_value)
	            {
	                //common.php中封装的图片url解析方法
	                $traffic['img_url'] = cmf_get_image_preview_url($traffic_pic_value['url']); 
	            }
	            unset($traffic['traffic_pic']);
        	}
            

            if($traffic['traffic_type'] == 'plane')
            {
                $planeResult[] = $traffic;
            }
            if($traffic['traffic_type'] == 'train')
            {
                $trainResult[] = $traffic;
            }
            if($traffic['traffic_type'] == 'bus')
            {
                $busResult[] = $traffic;
            }
            if($traffic['traffic_type'] == '')
            {
                $traData[] = $Result;
            }
            
        }
       
        if(!empty($planeResult) && !empty($trainResult) && !empty($busResult))
        {
            $city_trafficResult = array_merge($planeResult,$trainResult,$busResult);
        }
        if(!empty($planeResult) && empty($trainResult) && !empty($busResult))
        {
            $city_trafficResult = array_merge($planeResult,$busResult);
        }
        if(!empty($planeResult) && !empty($trainResult) && empty($busResult))
        {
            $city_trafficResult = array_merge($planeResult,$trainResult);
        }
        if(empty($planeResult) && !empty($trainResult) && !empty($busResult))
        {
            $city_trafficResult = array_merge($trainResult,$busResult);
        }
        if(empty($planeResult) && !empty($trainResult) && empty($busResult))
        {
            $city_trafficResult = $trainResult;
        }
        if(empty($planeResult) && empty($trainResult) && !empty($busResult))
        {
            $city_trafficResult = $busResult;
        }
        if(!empty($planeResult) && empty($trainResult) && empty($busResult))
        {
            $city_trafficResult = $planeResult;
        }
        //没有录入交通方式的情况下
        if(empty($planeResult) && empty($trainResult) && empty($busResult))
        {
            $city_trafficResult = $Result;
        }
       
        
        /*** 整体上返回城市的数据 ***/
        $cityInfo = array();    
        $cityInfo['cityData'] = $cityData;
        $cityInfo['famous_spot'] = $famous_spotResult; 
        $cityInfo['special_food'] = $special_foodResult;
        $cityInfo['special_goods'] = $special_goodsResult;
        $cityInfo['city_traffic'] = $city_trafficResult;

        echo json_encode($cityInfo,JSON_UNESCAPED_UNICODE);
    }

  
    /* 中心点城市的周边的城市显示
     * 规则一：
     * 根据行程的天数 每天100公里，以中心点城市进行折射 ，即：
     * 范围0 < $distance < ($day_num * 100)
     * 
     * 规则二：
     * 当前城市所属省份下的所有城市也显示
     * 
     * 注意：最后整合去重操作
     * */
    public function aroundCity()
    {
        session_start();
        //$post => city_id、lng、lat、day_num
        $post = $_POST;

        $longitude1 = $post['lng'];
        $latitude1 = $post['lat'];
        $city_id = $post['city_id'];
        $province_id = $post['province_id'];
        $day_num = $post['day_num'];   //总的行程天数
        $now_num = $post['city_day_num'];                   //当前中心点城市的适玩天数
        $last_num = $day_num - $now_num;
        $y = 100;
        $c = $last_num * $y; 

        //中心点城市所属省份下的所有城市
        $current =  Db::name('City_details')->field(array('id','province_id','city_id','province_name','city_name','city_abbreviation','fit_day','more','longitude','latitude','city_score','city_Introduction'))->where(array('province_id'=>$province_id))->order('id asc')->select();
        $currentProvinceData = json_decode($current,true);

        foreach($currentProvinceData as $key=>&$cityValue)
        {
            $lo = $cityValue['longitude'];
            $la= $cityValue['latitude'];
            //调用common.php 中的 getDistance方法计算两个地理位置之间的距离
            $distance = getDistance($longitude1, $latitude1, $lo, $la, 2);
//            if($distance == 0)
//            {
//                unset($currentProvinceData[$key]);
//            }
//            else{
                $cityValue['dis'] = intval($distance);
                $cityValue['distance'] = intval($distance).'km';
//            }

            if(!empty($cityValue['more']))
            {
                $pic =json_decode($cityValue['more'],true);
                foreach($pic as $kk => &$pic_value)
                {
                    //common.php中封装的图片url解析方法
                    $cityValue['img_url'] = cmf_get_image_preview_url($pic_value['url']); 
                }
                unset($cityValue['more']);
            }
           
        }
        $current_result = array_merge($currentProvinceData);
        $sort = array_column($current_result, 'dis'); 
        array_multisort($sort, SORT_ASC,$current_result);

        $centcity[] = $current_result[0];   //第一个游玩城市
        unset($current_result[0]);
        $current_result = array_merge($current_result);
        //周边城市
        $cityData = Db::name('City_details')->field(array('id','province_id','city_id','province_name','city_name','city_abbreviation','fit_day','more','longitude','latitude','city_score','city_Introduction'))->order('id asc')->select();
        $cityInfo = json_decode($cityData,true);

        foreach($cityInfo as $key=>&$cityValue)
        {
            if($cityValue['province_id'] == $province_id)
            {
                unset($cityInfo[$key]);
            }
            $lo = $cityValue['longitude'];
            $la= $cityValue['latitude'];
            //调用common.php 中的 getDistance方法计算两个地理位置之间的距离
            $distance = getDistance($longitude1, $latitude1, $lo, $la, 2);
            if($distance == 0)
            {
                unset($cityInfo[$key]);
            }
            else if($distance > $c){
                unset($cityInfo[$key]);
            }
            else{
                $cityValue['dis'] = intval($distance);
                $cityValue['distance'] = intval($distance).'km';
            }

            if(!empty($cityValue['more']))
            {
                $pic =json_decode($cityValue['more'],true);
                foreach($pic as $kk => &$pic_value)
                {
                     //common.php中封装的图片url解析方法
                    $cityValue['img_url'] = cmf_get_image_preview_url($pic_value['url']); 
                }
                unset($cityValue['more']);
            }
           
        }

        if(!empty($cityInfo)){
            $sort = array_column($cityInfo, 'dis'); 
            array_multisort($sort, SORT_ASC,$cityInfo); 
        }

        //整合当前城市下的所属省份下的所有城市、其他满足规则的城市
        if(isset($cityInfo))
        {
            $aroundCity = array_merge($current_result,$cityInfo,$centcity);
        }else{
            $aroundCity = array_merge($current_result);
        }
        $_SESSION['aroundcity'] = $aroundCity;  //存到session，适用于后面的搜索城市列表

        echo json_encode($aroundCity,JSON_UNESCAPED_UNICODE);
    }

  //点击搜索的结果，返回对应单个城市,在拼接返回周边城市列表
  public function around_searchCity()
  {
        session_start();
        $search = $_POST;
        $cityData = Db::name('City_details')->where(array('city_id'=>$search['city_id']))->find();
        if(!empty($cityData['more']))
        {
            $image = json_decode($cityData['more'],true);
            foreach($image as $key => &$img_value)
            {
                //common.php中封装的图片url解析方法
                $cityData['img_url'] = cmf_get_image_preview_url($img_value['url']); 
            }
            unset($cityData['more']);
        }
        $aroudCity = $_SESSION['aroundcity'];

        //清除重复数据
        if(isset($aroudCity))
        {
            foreach($aroudCity as $kkk=>&$group)
            {
                if($cityData['city_name'] == $group['city_name'])
                {
                    unset($aroudCity[$kkk]);
                } 
            }
        }
        foreach($aroudCity as $kkk=>&$current)
        {
            if($cityData['city_name'] == $current['city_name'])
            {
                unset($aroudCity[$kkk]);
            }
        }

        array_unshift($aroudCity,$cityData);
        $cityResult = array_merge($aroudCity);
        echo json_encode($cityResult,JSON_UNESCAPED_UNICODE);
  }

    // /*** 搜索框 智能检索 ***/
    public function searchTest()
    {
        return $this->fetch();
    }
    //省份页面的搜索框(可以搜索省份，城市，景点,店铺，连锁店)
    public function search()
    {
        $queryString = $_GET['city_name'];
        if(strlen($queryString) > 0)
        {
            $where = array();
            $where_condition = array(); 
            $where['city_name | city_abbreviation'] = array('like', "%$queryString%");
            $where_condition['spot_name'] = array('like',"%$queryString%"); 
            $where_con['store_name'] = array('like',"%$queryString%"); 
            $con['restaurant_name'] = array('like',"%$queryString%"); 
            $food_con['food_court_name'] = array('like',"%$queryString%"); 
            $shop_con['shopping_name'] = array('like',"%$queryString%");
            $goods_con['goods_name'] = array('like',"%$queryString%");
            $where_province['province_name'] = array('like',"%$queryString%"); 
            $field = array('id','province_id','city_id','city_name','spot_name');
            $cityResult = Db::name('City_details')->field(array('id','province_id','city_id','province_name','city_name','city_abbreviation'))->where($where)->select()->toArray();
            $famousResult = Db::name('famous_spot')->field($field)->where($where_condition)->select()->toArray();
            $NatureResult = Db::name('Nature_absture')->field($field)->where($where_condition)->select()->toArray();
            $DescribeResult = Db::name('Describe')->field($field)->where($where_condition)->select()->toArray();
            $NightResult = Db::name('Night')->field($field)->where($where_condition)->select()->toArray();
            $bentuResult = Db::name('Store_info')->field(array('id','province_id','city_id','city_name','store_name'))->where($where_con)->select()->toArray();
            $resResult = Db::name('Restaurant_chain')->field(array('id','province_id','city_id','city_name','restaurant_name'))->where($con)->select()->toArray();
            $foodResult = Db::name('Food_court')->field(array('id','province_id','city_id','city_name','food_court_name'))->where($food_con)->select()->toArray();
            $shoppingResult = Db::name('shopping_streets')->field(array('id','province_id','city_id','city_name','shopping_name'))->where($shop_con)->select()->toArray();
            $goodsResult = Db::name('goods_info')->field(array('id','province_id','city_id','city_name','goods_name'))->where($goods_con)->select()->toArray();

            $ProvinceResult = Db::name('Province_details')->where($where_province)->select()->toArray();
            foreach($ProvinceResult as &$province)
            {
                $province['spot_name'] = '';
                $province['city_abbreviation'] = $province['province_English'];
                $province['city_id'] = '';
                $province['city_name'] = '';
                unset($province['pic']);
                unset($province['status']);
                unset($province['is_top']);
                unset($province['create_time']);
                unset($province['update_time']);
                unset($province['published_time']);
                unset($province['province_Introduction']);
                unset($province['province_English']);
            }
            foreach($cityResult as &$city)
            {
                $city['spot_name'] = '';
                $pData = $this->pro_is_municipalities($city['province_id']);
                $city['is_municipalities'] = $pData['is_municipalities'];
            }
            foreach($famousResult as &$famous)
            {
                $pData = $this->pro_is_municipalities($famous['province_id']);
                $famous['is_municipalities'] = $pData['is_municipalities'];
                $famous['province_name'] = $pData['province_name'];
            }
            foreach($NatureResult as &$na)
            {
                $pData = $this->pro_is_municipalities($na['province_id']);
                $na['is_municipalities'] = $pData['is_municipalities'];
                $na['province_name'] = $pData['province_name'];
            }
            foreach($DescribeResult as &$de)
            {
                $pData = $this->pro_is_municipalities($de['province_id']);
                $de['is_municipalities'] = $pData['is_municipalities'];
                $de['province_name'] = $pData['province_name'];
            }
            foreach($NightResult as &$ni)
            {
                $pData = $this->pro_is_municipalities($ni['province_id']);
                $ni['is_municipalities'] = $pData['is_municipalities'];
                $ni['province_name'] = $pData['province_name'];
            }
            foreach($bentuResult as &$bentu)
            {
                $pData = $this->pro_is_municipalities($bentu['province_id']);
                $bentu['is_municipalities'] = $pData['is_municipalities'];
                $bentu['province_name'] = $pData['province_name'];
                $bentu['spot_name'] =  $bentu['store_name'];
                unset($bentu['store_name']);
            }
            foreach($resResult as &$res)
            {
                $pData = $this->pro_is_municipalities($res['province_id']);
                $res['is_municipalities'] = $pData['is_municipalities'];
                $res['province_name'] = $pData['province_name'];
                $res['spot_name'] =  $res['restaurant_name'];
            }
            foreach($foodResult as &$ff)
            {
                $pData = $this->pro_is_municipalities($ff['province_id']);
                $ff['is_municipalities'] = $pData['is_municipalities'];
                $ff['province_name'] = $pData['province_name'];
                $ff['spot_name'] =  $ff['food_court_name'];
            }
            foreach($shoppingResult as &$sh)
            {
                $pData = $this->pro_is_municipalities($sh['province_id']);
                $sh['is_municipalities'] = $pData['is_municipalities'];
                $sh['province_name'] = $pData['province_name'];
                $sh['spot_name'] =  $sh['shopping_name'];
            }
            foreach($goodsResult as &$gg)
            {
                $pData = $this->pro_is_municipalities($gg['province_id']);
                $gg['is_municipalities'] = $pData['is_municipalities'];
                $gg['province_name'] = $pData['province_name'];
                $gg['spot_name'] =  $gg['goods_name'];
            }
            
            $searchData['city'] = array_merge($ProvinceResult,$cityResult,$famousResult,$NatureResult,$DescribeResult,$NightResult,
            $bentuResult,$resResult,$foodResult,$shoppingResult,$goodsResult);
            echo json_encode($searchData,JSON_UNESCAPED_UNICODE);
        }
    }

    public function pro_is_municipalities($province_id)
    {
        $is_mun = Db::name('Province_details')->field(array('is_municipalities','province_name'))->where(array('province_id'=>$province_id))->find();
        return $is_mun;
    }
    //点击搜索的结果，返回省份下城市
    public function searchCity()
    {
        $search = $_POST;
        $cityResult = Db::name('City_details')->field(array('province_id','province_name','city_id','city_name','city_abbreviation','more','fit_day','longitude','latitude','city_score'))->where(array('province_id'=>$search['province_id']))->select()->toArray();
        foreach($cityResult as $kk=>&$city)
        {
            $image =json_decode($city['more'],true);
            foreach($image as $key => &$img_value)
            {
                //common.php中封装的图片url解析方法
                $city['img_url'] = cmf_get_image_preview_url($img_value['url']); 
            }
            unset($city['more']);
            if($city['city_id'] == $search['city_id'])
            {  
                $topcity = $city;
                unset($cityResult[$kk]);
            }
        }
        if(isset($topcity))
        {
            array_unshift($cityResult,$topcity);
        }
        
        $cityList = array();
        $cityList['cityList'] = $cityResult;
        echo json_encode($cityList,JSON_UNESCAPED_UNICODE);
    }

    //设计行程表单页面
    public function travelItinerary()
    {
        session_start();
        unset($_SESSION['aroundcity']);
        
        return $this->fetch();
    }
    //经纬度换算距离
    function distance($lng1, $lat1, $lng2, $lat2) {
        // 将角度转为狐度
        $radLat1 = deg2rad($lat1); //deg2rad()函数将角度转换为弧度
        $radLat2 = deg2rad($lat2);
        $radLng1 = deg2rad($lng1);
        $radLng2 = deg2rad($lng2);
        $a = $radLat1 - $radLat2;
        $b = $radLng1 - $radLng2;
        $s = 2 * asin(sqrt(pow(sin($a / 2), 2) + cos($radLat1) * cos($radLat2) * pow(sin($b / 2), 2))) * 6378.137;
        return (int)$s;
    }
    //城市优化
    function automatic(){
        session_start();
        $departure_city = $_POST['departure_city'];//出发城市
        $return_city = $_POST['return_city'];//返回城市
        $go_city_array = $_POST['go_city_array'];//游玩城市
        $traffic_tools = $_POST['traffic_tools'];//默认出行
        foreach ($go_city_array as $key2 => &$value2) {
            $value2['lat'] = $value2['position']['lat'];
            $value2['lng'] = $value2['position']['lng'];
        }
        $count = count($go_city_array);
        if($count>=2){
            $shortDis = array();
            $return=$this->sortDis($shortDis,$go_city_array);
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
                    $dis[]= $this->distance($array[$i]['lng'],$array[$i]['lat'],$array[$j]['lng'],$array[$j]['lat']);break;
                }
            }
            unset($array[0]);
            $array = array_values($array);
            $last = $array[$count-1];
            $last['dis'] = '';
            $last['trainTime'] = '';
            $last['flightTime'] = '';
            $lastDis= $this->distance($last['lng'],$last['lat'],$return_city['lng'],$return_city['lat']);
            foreach ($array as $key => &$value) {
                $value['dis'] = $dis[$key];
                unset($value['lat'],$value['lng']);
                $value['position']['lat'] = floatval($value['position']['lat']);
                $value['position']['lng'] = floatval($value['position']['lng']);
                $value['trainTime'] = round($dis[$key]/230,1);
                $value['trafficTime'] = round($dis[$key]/50,1);
                if($value['dis']<300){
                    $value['flightTime'] = '';
                }else{
                    $value['flightTime'] = round($dis[$key]/700+0.5,1);
                }
            }
            $return_city['dis'] = $lastDis;
            if($lastDis<300){
                $return_city['flightTime'] = '';
            }else{
                $return_city['flightTime'] = round($lastDis/700+0.5,1);
            }
            $return_city['trainTime'] = round($lastDis/230,1);
            $return_city['trafficTime'] = round($lastDis/50,1);
            $returnData = array('departure_city'=>$departure_city,'go_city_array'=>$array,'last'=>$last,'return_city'=>$return_city);
        }else{
            $oneDis = $this->distance($departure_city['lng'],$departure_city['lat'],$go_city_array[0]['lng'],$go_city_array[0]['lat']);
            $go_city_array[0]['dis'] = $oneDis;
            if($oneDis<300){
                $go_city_array[0]['flightTime'] = '';
            }else{
                $go_city_array[0]['flightTime'] = round($oneDis/700+0.5,1);
            }
            $go_city_array[0]['trainTime'] = round($oneDis/230,1);
            $go_city_array[0]['trafficTime'] = round($oneDis/50,1);
            $last = $go_city_array[0];
            $last['dis'] = '';
            $last['trainTime'] = '';
            $last['flightTime'] = '';
            $lastDis = $this->distance($go_city_array[0]['lng'],$go_city_array[0]['lat'],$return_city['lng'],$return_city['lat']);
            unset($go_city_array[0]['lat'],$go_city_array[0]['lng']);
            $go_city_array[0]['position']['lat'] = floatval($go_city_array[0]['position']['lat']);
            $go_city_array[0]['position']['lng'] = floatval($go_city_array[0]['position']['lng']);
            $return_city['dis'] = $lastDis;
            if($lastDis<300){
                $return_city['flightTime'] = '';
            }else{
                $return_city['flightTime'] = round($lastDis/700+0.5,1);
            }
            $return_city['trainTime'] = round($lastDis/230,1);
            $return_city['trafficTime'] = round($lastDis/50,1);
            $returnData = array('departure_city'=>$departure_city,'go_city_array'=>$go_city_array,'last'=>$last,'return_city'=>$return_city);
        }
        //初始化城市数组空间
        $len = count($returnData['go_city_array']);
        for($i=0;$i<$len;$i++)
        {
            $cityResult[] = '';
        }
        $_SESSION['cityResult'] = $cityResult;
        //此分组的数据是用于编辑行程
        if(isset($_SESSION['spotArray']))
        {
            $_SESSION['cityResult'] = $_SESSION['spotArray'];
        }

        //初始化城市下标空间
        for($i=0;$i<$len;$i++)
        {
            $index[] = '';
        }
        $_SESSION['index'] = $index;
        //初始化酒店数组空间
        for($i=0;$i<$len;$i++)
        {
            $hotelResult[] = '';
        }
        $_SESSION['hotelResult'] = $hotelResult;
        //此分组的数据是用于编辑行程
        if(isset($_SESSION['hotelArray']))
        {
            $_SESSION['hotelResult'] = $_SESSION['hotelArray'];
        }

    // print_r($returnData);

        echo json_encode($returnData,JSON_UNESCAPED_UNICODE);
    }
    //城市优化
    function sortDis($shortDis,$data){
        $arr = array();
        $num = count($data);
        for($i=0;$i<$num;$i++){
            for($j=1;$j<$num;$j++){
                $arr[] = [$data[$i],$data[$j]];
            }
            break;
        }
        foreach ($arr as $k => $v) {
            $dis = $this->distance($v['0']['lng'],$v['0']['lat'],$v['1']['lng'],$v['1']['lat']);
            $allDis[$v[1]['city_name']] = $dis;
        }
        asort($allDis);
        $sDis = array_keys($allDis);
        $shortDis[] = $sDis[0];//距离最短地点
        foreach ($data as $key => $value) {
            if($value['city_name'] == $sDis[0]){
                //将数组第一个城市替换成距离最短地点
                $data[0] = $value;
                unset($data[$key]);
            }
        }
        $data = array_values($data);//键值归零
        if(!empty($data[1])){
            $shortDis = $this->sortDis($shortDis,$data);
        }
        return $shortDis;

    }
    
    //城市经纬度更新脚本
    public function allcity(){
        $allData = Db::name('City_details')->field(array('id','city_name'))->select()->toarray();
        echo json_encode($allData,JSON_UNESCAPED_UNICODE);
    }
    public function lnglat(){
        $post = $_POST;
        if(isset($post['id'])){
            $where['id'] = $post['id'];
            $data['longitude'] = $post['lng'];
            $data['latitude'] = $post['lat'];
            $result = Db::name('City_details')->where($where)->update($data);
        }else{
            $result = false;
        }
        if($result !== false){
            echo '更新成功';
        }else{
            echo '更新失败';
        }
    }
}


