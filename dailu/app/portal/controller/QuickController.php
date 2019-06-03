<?php
// +----------------------------------------------------------------------
// | ThinkCMF [ WE CAN DO IT MORE SIMPLE ]
// +----------------------------------------------------------------------
// | Copyright (c) 2013-2019 http://www.thinkcmf.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed ( http://www.apache.org/licenses/LICENSE-2.0 )
// +----------------------------------------------------------------------
// | Author: bingwang <thinkcmf@126.com>
// +----------------------------------------------------------------------
namespace app\portal\controller;

use cmf\controller\HomeBaseController;
use think\Db;

class QuickController extends HomeBaseController
{
    //一键字段更新rapid_tag  uid（24  32   968）几个用户，
    //最早的是2019-02-22，第一次更新是2019-4-18
    //(注意更新前，必须先备份一次)
    public function opp(){
        $where['uid'] = 968;   //24，32，968
        $where['creat_time'] = array('gt',1550800400);  //2019-02-22
        $data['rapid_tag'] = 1;
        $result = Db::name('City_line')->where($where)->update($data);
        if($result !==false){
            echo '更新成功';
        }else{
            echo '失败';
        }
    }
    // 更新city_line中的citystring字段   
    // (注意更新前，必须先备份一次)
    public function clineupdate(){
        $data = Db::name('City_line')->field('list,trip_id')->select();
        foreach($data as $key=>$value)
        {   
            $ff = '';
            $list = json_decode($value['list'],true);
            foreach($list as $vv){
                if(isset($vv['this_city'])){
                    $ff = $vv['this_city'].','.$ff;
                }
                else if(isset($vv['city_name'])){
                    $ff = $vv['city_name'].','.$ff;
                }
            }
            $ff = substr($ff, 0, -1);
            // print_r($ff);
            // echo "<br>";
            // exit;
            $citystring['citystring'] = $ff;
            if(empty($value['citystring'])){  //空的更新
                $result = Db::name('City_line')->where(array('trip_id'=>$value['trip_id']))->update($citystring);
                if($result !==false){
                    echo '更新成功';
                }else{
                    echo '失败';
                }
            }
        }
    }
    //判断该城市是否可以一键制作行程
    public function IsQuick()
    {
        $post= $_POST;
        $post = json_decode($post['citymodel'],true);   
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
        // $cookData = $_SERVER['HTTP_COOKIE'];   
        // $sessionid = substr($cookData,strpos($cookData,'=')+1);
        // Session_id($sessionid);
        session_start();
        
        // $cityArray = array(
        //     array(
        //         'city_daynum'=>4,
        //         'city_name'=>'北京',
        //         'img_url'=>'http://discuss.5199yl.com/png15530798259575103.png',
        //         'city_id'=>2,
        //         'city_trc_name'=>'飞机交通',
        //         'trainTime'=>'',
        //         'trafficTime'=>'',
        //         'flightTime'=>'1.9'
        //     ),
        //     array(
        //         'city_daynum'=>3,
        //         'city_name'=>'杭州',
        //         'img_url'=>'http://discuss.5199yl.com/png15530798259575103.png',
        //         'city_id'=>3134,
        //         'city_trc_name'=>'',
        //         'trainTime'=>'',
        //         'trafficTime'=>'',
        //         'flightTime'=>''
        //     )
        // );
        
        // // print_r($cityArray);
        // // exit;
        // $departure_city = array(
   
        //     'city_name'=>'合肥',
        //     'date'=>'2019-03-22',
        //     'adult'=>3,
        //     'children'=>1,
        //     'city_trc_name'=>'',
        //     'latitude'=>'',
        //     'longitude'=>'',
        //     'dis'=>'',
        //     'trainTime'=>'',
        //     'trafficTime'=>'',
        //     'flightTime'=>'',
        // );
        // $return_city = array(

        //     'city_name'=>'上海',
        //     'date'=>'',
        //     'adult'=>'',
        //     'children'=>'',
        //     'latitude'=>'',
        //     'longitude'=>'',
        //     'dis'=>'',
        //     'city_trc_name'=>'铁路',
        //     'trainTime'=>'2.0',
        //     'trafficTime'=>'',
        //     'flightTime'=>'',
        //     'day_num'=>''
        // );

        $post = $_POST;
        $uid = $post['uid'];
        $post = json_decode($post['citymodel'],true);  
      

        $cityArray = $post['go_city_array'];
        $departure_city = $post['departure_city'];
        $return_city = $post['return_city'];

        //游玩总天数
        $day_num = array_sum(array_map(create_function('$vals', 'return $vals["city_daynum"];'),$cityArray));
        $citylen = count($cityArray);
        //每个游玩城市的起始日期
        if($citylen < 2){
            $cityArray[0]['city_date'] = $departure_city['date'];
        }else{
            $daysum = 0;
            for($i=0;$i<$citylen;$i++)
            {
                if($i == 0)
                {
                    $cityArray[0]['city_date'] = date("Y-m-d",(strtotime($departure_city['date'])));
                }
                if($i>0)
                {
                    $daysum = $daysum + $cityArray[$i-1]['city_daynum'];
                    $cityArray[$i]['city_date'] = date("Y-m-d",(strtotime($departure_city['date']) + $daysum*3600*24));
                }
            }
        }

        foreach($cityArray as $key=>$cityValue)
        {
            $cityList[] = $cityValue['city_name']; 
            //时间类（日期，周几，安排时段）
            $first_date = $cityValue['city_date'];
            for($i=0;$i<$cityValue['city_daynum'];$i++)
            {
                $dateArray[$key][$i]['city_id'] = $cityValue['city_id'];
                $dateArray[$key][$i]['city_name'] = $cityValue['city_name'];
                $dateArray[$key][$i]['date'] = date("Y-m-d",(strtotime($first_date) + $i*3600*24));
                $dateArray[$key][$i]['weeks'] = date("N",(strtotime($first_date) + $i*3600*24));
                $dateArray[$key][$i]['dayTime'] = '08:00-24:00';
            }
        }
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
        $departure_city['day_num'] = $day_num;

        // print_r($cityArray);
        // exit;

        //查找城市对应的行程单
        $info = Db::name('City_line')->field('citystring,trip_id,list')->where(array('rapid_tag'=>1))->select()->toarray();

        // print_r($info);
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
            // print_r($tripArray);

            //匹配对应的城市天数，找到对应的唯一一个trip_id
            $baseData='';
            if(!empty($tripArray))
            {
                // echo 0;
                foreach($tripArray as $ke2=>$val)
                {
                    // echo 3;
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
            // print_r($baseData);


            //根据确定的trip_id，查询plan_info表中的景点数据,改变维度
            if(!empty($baseData))
            {
                $planInfo = Db::name('plan_info')->field('uid,trip_id,schedufing')->where(array('trip_id'=>$baseData['trip_id']))->find();
                $sch = unserialize(base64_decode($planInfo['schedufing']));
                $scheduf = json_decode(json_encode($sch),true); 
                // print_r($scheduf);
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
                            $temparray = array(array('date'=>'','newtime'=>'9:00','time'=>0,'hotel'=>array('hotel_name'=>'','lat'=>'','lng'=>'','tel'=>'','address'=>'','LowRate'=>'','BusinessZoneName'=>'','ThumbNailUrl'=>''),'one_city'=>'','two_city'=>'','start_index_hotel'=>''));
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
                //重新匹配每天的日期
                foreach($spotDay['day_arry'] as $keyy1=>&$ssVl)
                {
                    foreach($va['timeData'] as $keyy2=>$dateValue)
                    {
                        if($keyy1 == $keyy2){
                            $ssVl['of_date'] = $dateValue['date'];
                            $ssVl['date'] = str_replace('-','.',substr($dateValue['date'],strpos($dateValue['date'],'-')+1));
                        }
                    }
                }

                // print_r($spotDay);
                $allList[] = $spotDay;
            }
        }
       
        // print_r($allList);
        // exit;
        //行程单名称,封面图默认第一目的地城市封面
        $cityString = '';
        $cityString = implode('.',$cityList);
        $trip_name = $cityString. $citylen.'城市'.$day_num.'日游';
        $TheCover = $cityArray[0]['img_url'];

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
            $cityinfo['city_abbreviation'] = $this_city['city_abbreviation']; 
            $cityinfo['city_Introduction'] = htmlchars($this_city['city_Introduction']); 

            $dish_cover = json_decode($this_city['more'],true);
            foreach($dish_cover as $k2 => &$dish_value)
            {
                $cityinfo['city_image_url']= cmf_get_image_preview_url($dish_value['url']); 
            }
            unset($this_city['more']);

            foreach($cityinfo['day_arry']  as $kk4=>&$d)
            {
                //每个城市每天的景点距离之和(此时没有计算酒店) 
                if(!empty($d['day']))
                {
                    $tempArray = $d['day'];
                }else{  //当某些天没有选择景点的时候，直接赋值空，距离为0
                    $tempArray = array();
                }   
                $len = count($tempArray);
                $sum = 0;
                if($len > 1)
                { 
                    for($i=0;$i < $len-1;$i++)
                    {
                        $dist = getDistance($tempArray[0]['this_lng'], $tempArray[0]['this_lat'], 
                        $tempArray[1]['this_lng'], $tempArray[1]['this_lat'], 2);
                        unset($tempArray[0]);
                        $tempArray = array_merge($tempArray);
                        $sum += $dist;
                    }
                }
                $d['SpotDisSum'] = round($sum);

                //每个城市第一天的大交通
                unset($d['one_city'],$d['two_city']);  //原始数据中剔除，后面赋予新的数据
                foreach($cityArray as $kk5=>$f)
                {
                    $times = strtotime($f['city_date']);
                    if(strtotime($d['of_date']) == $times)
                    { 
                        if($kk2 !== 0){         //除了第一个城市的其他城市第一天
                            $d['one_city'] = $cityArray[$kk5-1]['city_name'];
                            $d['two_city'] = $f['city_name'];

                            $d['city_trc_name'] = $f['city_trc_name'];
                            $d['trainTime'] = $f['trainTime'];
                            $d['trafficTime'] = $f['trafficTime'];
                            $d['flightTime'] = $f['flightTime'];
                            $d['dis'] = $f['dis'];
                            
                        }

                        if($kk2 == 0){           //第一个游玩城市第一天
                            if($kk4 == 0){
                                $d['city_trc_name'] = $f['city_trc_name'];
                                $d['trainTime'] = $f['trainTime'];
                                $d['trafficTime'] = $f['trafficTime'];
                                $d['flightTime'] = $f['flightTime'];
                                $d['dis'] = $f['dis'];

                                $d['one_city'] = $departure_city['city_name'];
                                $d['two_city'] = $f['city_name'];
                            }
                        }
                    }
                    if($kk2 == $citylen-1){   //最后一个游玩城市最后一天
                        $xc = count($allList[$kk2]['day_arry']);
                        if($kk4 == $xc-1){
                            $d['city_trc_name'] = $return_city['city_trc_name'];
                            $d['trainTime'] = $return_city['trainTime'];
                            $d['trafficTime'] = $return_city['trafficTime'];
                            $d['flightTime'] = $return_city['flightTime'];
                            $d['dis'] = $return_city['dis'];

                            $d['one_city'] = $f['city_name'];
                            $d['two_city'] = $return_city['city_name'];
                        }
                    }                  
                }
            } 
        }

        // $_SESSION['list'] = $allList;
        // $result = $allList;
        //基础数据
        //出发城市
        $baseInfo['dep']['dep_lat'] = $departure_city['latitude'];
        $baseInfo['dep']['dep_lng'] =  $departure_city['longitude'];
        $baseInfo['dep']['departure_city'] =  $departure_city['city_name'];
        $baseInfo['dep']['city_trc_name'] =  $cityArray[0]['city_trc_name'];
        $baseInfo['dep']['flightTime'] =  $cityArray[0]['flightTime'];
        $baseInfo['dep']['trainTime'] = $cityArray[0]['trainTime'];
        $baseInfo['dep']['dis'] =  $cityArray[0]['dis'];
        $baseInfo['dep']['adult'] = $departure_city['adult'];
        $baseInfo['dep']['children'] = $departure_city['children'];
        $baseInfo['dep']['date'] = $departure_city['date'];
        $baseInfo['dep']['day_num'] = $departure_city['day_num'];
        $baseInfo['dep']['travel_title'] = $trip_name;
        $baseInfo['dep']['cover'] = $TheCover;
        // 返回城市
        $baseInfo['ret']['ret_lat'] =  $return_city['latitude'];
        $baseInfo['ret']['ret_lng'] =  $return_city['longitude'];        
        $baseInfo['ret']['return_city'] =  $return_city['city_name'];
        $baseInfo['ret']['city_trc_name'] = $return_city['city_trc_name'];
        $baseInfo['ret']['flightTime'] = $return_city['flightTime'];
        $baseInfo['ret']['trainTime'] = $return_city['trainTime'];
        $baseInfo['ret']['trafficTime'] = $return_city['trafficTime'];
        $baseInfo['ret']['dis'] = $return_city['dis'];


        //生成行程单号
        $time = time();
        $trip_id = $uid.'-'.$time;  
        $baseInfo['uid'] =  $uid;
        $baseInfo['trip_id'] =  $trip_id;
        $baseInfo['travel_title'] =  $trip_name;
        $baseInfo['cover'] =  $TheCover;

        foreach($allList as $key2=>&$h)
        {
            foreach($h['day_arry'] as $keyy=>&$ft)
            {
                //数据格式
                if(isset($ft['start_time'])){
                    $ft['start_clock'] = $ft['start_time'];
                    $ft['resultsTime'] = $ft['end_time'];
                }else{
                    $ft['start_clock'] = '08:00';
                    $ft['resultsTime'] = '22:00';
                }
                if(isset($ft['city_trc_name'])){
                    $ft['traffic']['city_trc_name'] =  $ft['city_trc_name'];
                    $ft['traffic']['city_date'] =  $ft['of_date'];
                    $ft['traffic']['dis'] =  $ft['dis'];
                    $ft['traffic']['start_city'] =  $ft['one_city'];
                    $ft['traffic']['city_name'] =  $ft['two_city'];
      
                    if($ft['city_trc_name'] == '飞机交通'){
                        $ft['traffic']['tooltime'] =  $ft['flightTime'];
                    }else if($ft['city_trc_name'] == '铁路交通'){
                        $ft['traffic']['tooltime'] =  $ft['trainTime'];
                    }else{
                        $ft['traffic']['tooltime'] =  $ft['trafficTime'];
                    } 
                }
                $ft['city'] =  $h['this_city'];
                $ft['hotel']['date'] = $ft['date'];
                $h['day_arry'][$keyy]['hotel']['date'] = $h['day_arry'][$keyy]['date'];
                
                if(isset($ft['hotel']) && empty($ft['hotel']['hotel_name'])){
                    unset($ft['hotel']);
                }
                if(!isset($ft['day'])){
                    $ft['day'] = array();
                }else{
                   /* foreach($ft['day'] as $keyy3=>$jing){
                        if(isset($jing['info'])){
                            unset($jing['info']);
                        }
                        if(isset($jing['eat_info'])){
                            unset($jing['eat_info']);
                        }
                    }*/
                }
            }
        }

        $_SESSION['list'] = $allList;
        $_SESSION['baseInfo'] = $baseInfo;
        $_SESSION['cityArray'] = $cityArray;
        if($allList)
        {
            $return = array('status'=>true,'msg'=>'请求成功','data'=>$allList,'trip_id'=>$trip_id,'travel_title'=>$trip_name,'cover'=>$TheCover);
        }else{
            $return = array('status'=>false,'msg'=>'请求失败','data'=>[]);
        }
        echo json_encode($return,JSON_UNESCAPED_UNICODE);
    }

    //查看行程单（生成行程单）
    public function TripSuccess()
    {
        $cookData = $_SERVER['HTTP_COOKIE'];   
        $sessionid = substr($cookData,strpos($cookData,'=')+1);
        Session_id($sessionid);
        session_start();

        $info = $_SESSION;
        $baseInfo = $info['baseInfo'];
        $allList = $info['list'];
        $cityArray = $info['cityArray'];
        $uid = $baseInfo['uid'];
        $trip_id = $baseInfo['trip_id'];
        $time = time();

        // hotel
        $atemp = array();
        foreach($allList as $key2=>$h)
        {
            foreach($h['day_arry'] as $ft)
            {
                if(!empty($ft['hotel']))
                {
                    if(!empty($ft['hotel']['hotel_name'])){
                        $atemp[] = $ft['hotel'];
                    }
                }
            }
        }
        
        
        $hotel_newArr = $this->array_unset_tt($atemp,'hotel_name'); 
        foreach($hotel_newArr as $y=>$o)
        {
        $h_Result[] = $o;
        }
       
        if(isset($h_Result)){
            $hotelData['uid'] = $uid;
            $hotelData['trip_id'] = $trip_id;
            $hotelData['creat_time'] = $time;
            $hotelData['hotel_info'] = json_encode($h_Result);
            $tripInfo['hotelSum'] = count($h_Result);  //所选酒店个数，存到trip_info表
            $result = Db::name('hotel')->insert($hotelData);
        }

        // trip_info
        $tripInfo['uid'] = $uid;
        $tripInfo['trip_id'] = $trip_id;
        $tripInfo['adult'] =  $baseInfo['dep']['adult'];
        $tripInfo['children'] =  $baseInfo['dep']['children'];
        $tripInfo['trip_name'] = $tripInfo['custom_title']=$tripInfo['travel_title'] = $baseInfo['travel_title'];
        $tripInfo['cover'] = $baseInfo['cover'];

        //出发城市
        $tripInfo['date'] = $baseInfo['dep']['date'];
        $tripInfo['day_num'] =  $baseInfo['dep']['day_num'];
        $tripInfo['departure_city'] =  $baseInfo['dep']['departure_city'];
        $tripInfo['dep_lat'] = $baseInfo['dep']['dep_lat'];
        $tripInfo['dep_lng'] = $baseInfo['dep']['dep_lng'];
        //返回城市
        $tripInfo['ret_lat'] = $baseInfo['ret']['ret_lat'];
        $tripInfo['ret_lng'] = $baseInfo['ret']['ret_lat'];
        $tripInfo['flightTime'] =  $baseInfo['ret']['flightTime'];  //飞机交通时间
        $tripInfo['trainTime'] =  $baseInfo['ret']['trainTime'];    //铁路交通时间
        $tripInfo['city_trc_name'] =  $baseInfo['ret']['city_trc_name'];   //交通方式
        $tripInfo['dis'] = $baseInfo['ret']['dis'];               //交通距离
        $tripInfo['return_city'] = $baseInfo['ret']['return_city'];
        $tripInfo['creat_time'] = $time;
        $return_cityInfo = array('dis'=>$baseInfo['ret']['dis'],'flightTime'=>$baseInfo['ret']['flightTime'],'trainTime'=>$baseInfo['ret']['trainTime'],
        'trafficTime'=> $baseInfo['ret']['trafficTime'],'city_trc_name'=>$baseInfo['ret']['city_trc_name']);
        $tripInfo['return_cityInfo'] = json_encode($return_cityInfo);
     
        // 游玩城市
        $tripInfo['go_city_array'] = json_encode($cityArray);
        $tripInfo['to_origin'] = 1;   //用手机app制作
        $result = Db::name('trip_info')->insert($tripInfo);
  
        // plan_info
        $plan_info['uid'] = $uid;
        $plan_info['trip_id'] = $trip_id;
        $plan_info['creat_time'] = $time;
        $plan_info['schedufing'] = base64_encode(serialize($allList));
        $result = Db::name('plan_info')->insert($plan_info);

        // city_line 
        $city_line['uid'] = $uid;
        $city_line['trip_id'] = $trip_id;
        $city_line['creat_time'] = $time;
        $day_num = $baseInfo['dep']['day_num'];
    
        $city_line['return_date']  = date("Y-m-d",(strtotime($baseInfo['dep']['date']) + ($day_num-1)*3600*24));
        $city_line['list'] = json_encode($cityArray);
        $result = Db::name('city_line')->insert($city_line);
        if($result)
        {
            $return = array('status'=>true,'msg'=>'请求成功','data'=>$trip_id);
        }else{

            $return = array('status'=>false,'msg'=>'请求失败','data'=>[]);
        }
        echo json_encode($return,JSON_UNESCAPED_UNICODE);
    }
    //二维数组去重
    //$arr->传入数组   $key->判断的key值
    public function array_unset_tt($arr,$key)
    {   
        //建立一个目标数组
        $res = array();      
        foreach ($arr as $value) 
        {         
            //查看有没有重复项
            if(isset($res[$value[$key]])){
                //有：销毁
                unset($value[$key]);
            }
            else{
                //没有,存储起来
                $res[$value[$key]] = $value;
            }  
        }
        return $res;
    }

    //行程单备注
    public function Remarks()
    {
        $trip_id = $_POST['trip_id'];
        $remarks = $_POST['remarks'];
        $data['trip_id'] = $trip_id;
        $data['remarks'] = $remarks;
        $data['creat_time'] = time();

        $posterInfo = Db::name('poster')->where(array('trip_id'=> $trip_id))->find();
        if(isset($posterInfo)){
            $result = Db::name('poster')->where(array('trip_id'=> $trip_id))->update($data);
        }else{
            $result = Db::name('poster')->insert($data);
        }
        if(false !== $result)
        {
            $return = array('status'=>true,' msg'=>'请求成功','data'=>$remarks);
        }else{
            $return = array('status'=>false,'msg'=>'请求失败','data'=>[]);
        }
        echo json_encode($return,JSON_UNESCAPED_UNICODE);
    }

    //获取行程单备注
    public function getRemarks()
    {
        $trip_id = $_POST['trip_id'];
        $posterInfo = Db::name('poster')->field('trip_id,remarks')->where(array('trip_id'=>$trip_id))->find();
        if(isset($posterInfo)){
            $return = array('status'=>true,'msg'=>'请求成功','data'=>$posterInfo['remarks']);
        }else{
            $return = array('status'=>true,'msg'=>'请求成功','data'=>'');
        }
        echo json_encode($return,JSON_UNESCAPED_UNICODE);
    }

    //搜索景点
    public function allfloorSearch()
    {
        $queryString = $_POST['spot_name'];
        $city_id = $_POST['city_id'];
        if(strlen($queryString) > 0)
        {
            //1F
            $where1 = array();
            $where1['spot_name'] = array('like',"%$queryString%"); 
            $where1['city_id'] = $city_id;
            $spotList = Db::name('Nature_absture')->where($where1)->field(array('province_id','city_id','spot_name','pic','type',
            'longitude','latitude','play_time','not_modifity','phone','period_time','address'))->select();
            $spotResult = json_decode($spotList,true);
            foreach($spotResult as &$spot)
            {
                $spot['tag_time'] = $this->play_time($spot['play_time']);  //时间统一成小时
                $spot['floor_index'] = '0';
                $spot['per_capita'] = '';
                if($spot['type'] == 'Top8')
                {
                    $spot['group'] = 'top8';
                }
                if($spot['type'] == '人文景观')
                {
                    $spot['group'] = 'nature';
                }
                if($spot['type'] == '自然风光')
                {
                    $spot['group'] = 'scenery';
                }
                if(!empty($spot['pic']))
                {
                    $cover_pic =json_decode($spot['pic'],true);
                    foreach($cover_pic as $k => &$pic_value)
                    {
                        //common.php中封装的图片url解析方法
                        $spot['cover_url'] = cmf_get_image_preview_url($pic_value['url']); 
                    }
                    unset($spot['pic']);
                }
                else{
                    //当没有上传图片时，用404图片代替
                    $unified_404 = '404/unified_404.png';
                    $spot['cover_url'] = cmf_get_image_preview_url($unified_404);
                }
            }
            // print_r($spotResult);
            //2F
            $where2 = array();
            $where2['spot_name'] = array('like',"%$queryString%"); 
            $where2['city_id'] = $city_id;
            $DescribeList = Db::name('Describe')->where($where2)->field(array('province_id','city_id','spot_name','pic','type',
            'longitude','latitude','play_time','not_modifity','phone','period_time','address'))->select();
            $DescribeResult = json_decode($DescribeList,true);
            foreach($DescribeResult as &$Describe)
            {
                $Describe['tag_time'] = $this->play_time($Describe['play_time']);
                $Describe['floor_index'] = '1';
                $Describe['per_capita'] = '';
                if($Describe['type'] == '文化艺术')
                {
                    $Describe['group'] = 'art';
                }
                if($Describe['type'] == '休闲情调')
                {
                    $Describe['group'] = 'leisure';
                }
                if(!empty($Describe['pic']))
                {
                    $cover_pic =json_decode($Describe['pic'],true);
                    foreach($cover_pic as $k => &$pic_value)
                    {
                        //common.php中封装的图片url解析方法
                        $Describe['cover_url'] = cmf_get_image_preview_url($pic_value['url']); 
                    }
                    unset($Describe['pic']);
                }
                else{
                    //当没有上传图片时，用404图片代替
                    $unified_404 = '404/unified_404.png';
                    $Describe['cover_url'] = cmf_get_image_preview_url($unified_404);
                }
            }
            //3F
            $where3 = array();
            $where3['spot_name'] = array('like',"%$queryString%"); 
            $where3['city_id'] = $city_id;
            $NightList = Db::name('Night')->where($where2)->field(array('province_id','city_id','spot_name','pic','type',
            'longitude','latitude','play_time','not_modifity','phone','period_time','address'))->select();
            $NightResult = json_decode($NightList,true);
            foreach($NightResult as &$Night)
            {
                $Night['tag_time'] = $this->play_time($Night['play_time']);
                $Night['floor_index'] = '2';
                $Night['per_capita'] = '';
                if($Night['type'] == '视觉享受')
                {
                    $Night['group'] = 'visual';
                }
                if($Night['type'] == '灯红酒绿')
                {
                    $Night['group'] = 'neon';
                }
                if(!empty($Night['pic']))
                {
                    $cover_pic =json_decode($Night['pic'],true);
                    foreach($cover_pic as $k => &$pic_value)
                    {
                        //common.php中封装的图片url解析方法
                        $Night['cover_url'] = cmf_get_image_preview_url($pic_value['url']); 
                    }
                    unset($Night['pic']);
                }
                else{
                    //当没有上传图片时，用404图片代替
                    $unified_404 = '404/unified_404.png';
                    $Night['cover_url'] = cmf_get_image_preview_url($unified_404);
                }
            }

            //4F(本土美食、美食街区)
            $where4 = array();
            $where4['store_name'] = array('like',"%$queryString%"); 
            $where4['city_id'] = $city_id;
            $StoreList = Db::name('Store_info')->where($where4)->field(array('province_id','city_id','store_name','pic','type',
            'longitude','latitude','meal_time','phone','address','per_capita'))->select();
            $StoreResult = json_decode($StoreList,true);
            foreach($StoreResult as &$Store)
            {
                $Store['tag_time'] = $this->play_time($Store['meal_time']);
                $Store['floor_index'] = '3';
                $Store['not_modifity'] = '';
                $Store['period_time'] = '';
                $Store['spot_name'] = $Store['store_name'];
                $Store['play_time'] = $Store['meal_time'];
                if($Store['type'] == '本土美食')
                {
                    $Store['group'] = 'local';
                }
                if($Store['type'] == '美食街区')
                {
                    $Store['group'] = 'street';
                }
                if(!empty($Store['pic']))
                {
                    $cover_pic =json_decode($Store['pic'],true);
                    foreach($cover_pic as $k => &$pic_value)
                    {
                        //common.php中封装的图片url解析方法
                        $Store['cover_url'] = cmf_get_image_preview_url($pic_value['url']); 
                    }
                    unset($Store['pic']);
                }
                else{
                    //当没有上传图片时，用404图片代替
                    $unified_404 = '404/unified_404.png';
                    $Store['cover_url'] = cmf_get_image_preview_url($unified_404);
                }
            }
            //连锁店中的总店
            $where43 = array();
            $where43['restaurant_name'] = array('like',"%$queryString%"); 
            $where43['city_id'] = $city_id;
            $resList = Db::name('Restaurant_chain')->where($where43)->field(array('province_id','city_id','restaurant_name','pic','type',
            'longitude','latitude','meal_time','phone','address','per_capita'))->select()->toArray();
            foreach($resList as &$res)
            {
                $res['tag_time'] = $this->play_time($res['meal_time']);
                $res['play_time'] = $res['meal_time'];
                $res['floor_index'] = '3';
                $res['not_modifity'] = '';
                $res['period_time'] = '';
                $res['spot_name'] = $res['restaurant_name'];
                if($res['type'] == '本土美食')
                {
                    $res['group'] = 'local';
                }
                if($res['type'] == '美食街区')
                {
                    $res['group'] = 'street';
                }
                if(!empty($res['pic']))
                {
                    $cover_pic =json_decode($res['pic'],true);
                    foreach($cover_pic as $k => &$pic_value)
                    {
                        //common.php中封装的图片url解析方法
                        $res['cover_url'] = cmf_get_image_preview_url($pic_value['url']); 
                    }
                    unset($res['pic']);
                }
                else{
                    //当没有上传图片时，用404图片代替
                    $unified_404 = '404/unified_404.png';
                    $res['cover_url'] = cmf_get_image_preview_url($unified_404);
                }
            }
            //美食街区
            $where42 = array();
            $where42['food_court_name'] = array('like',"%$queryString%"); 
            $where42['city_id'] = $city_id;
            $FoodList = Db::name('Food_court')->where($where42)->field(array('province_id','city_id','food_court_name','pic','type',
            'longitude','latitude','meal_time','phone','address','period_time','not_modifity'))->select();
            $FoodResult = json_decode($FoodList,true);
            foreach($FoodResult as &$Food)
            {
                $Food['tag_time'] = $this->play_time($Food['meal_time']);
                $Food['play_time'] = $Food['meal_time'];
                $Food['not_modifity'] = '';
                $Food['period_time'] = '';
                $Food['floor_index'] = '3';
                $Food['spot_name'] = $Food['food_court_name'];
                if($Food['type'] == '本土美食')
                {
                    $Food['group'] = 'local';
                }
                if($Food['type'] == '美食街区')
                {
                    $Food['group'] = 'street';
                }
                if(!empty($Food['pic']))
                {
                    $cover_pic =json_decode($Food['pic'],true);
                    foreach($cover_pic as $k => &$pic_value)
                    {
                        //common.php中封装的图片url解析方法
                        $Food['cover_url'] = cmf_get_image_preview_url($pic_value['url']); 
                    }
                    unset($Food['pic']);
                }
                else{
                    //当没有上传图片时，用404图片代替
                    $unified_404 = '404/unified_404.png';
                    $Food['cover_url'] = cmf_get_image_preview_url($unified_404);
                }
            }

            //5F(土特产店、购物商圈)
            $where5 = array();
            $where5['shopping_name'] = array('like',"%$queryString%"); 
            $where5['city_id'] = $city_id;
            $ShopList = Db::name('Shopping_streets')->where($where5)->field(array('province_id','city_id','shopping_name','pic','type',
            'longitude','latitude','shopping_time','phone','address','period_time','not_modifity'))->select();
            $ShopResult = json_decode($ShopList,true);
            foreach($ShopResult as &$Shop)
            {
                $Shop['tag_time'] = $this->play_time($Shop['shopping_time']);
                $Shop['play_time'] = $Shop['shopping_time'];
                $Shop['not_modifity'] = '';
                $Shop['period_time'] = '';
                $Shop['floor_index'] = '4';
                $Shop['spot_name'] = $Shop['shopping_name'];
                if($Shop['type'] == '土特产店')
                {
                    $Shop['group'] = 'productShops';
                }
                if($Shop['type'] == '购物商圈')
                {
                    $Shop['group'] = 'businessCircle';
                }
                if(!empty($Shop['pic']))
                {
                    $cover_pic =json_decode($Shop['pic'],true);
                    foreach($cover_pic as $k => &$pic_value)
                    {
                        //common.php中封装的图片url解析方法
                        $Shop['cover_url'] = cmf_get_image_preview_url($pic_value['url']); 
                    }
                    unset($Shop['pic']);
                }
                else{
                    //当没有上传图片时，用404图片代替
                    $unified_404 = '404/unified_404.png';
                    $Shop['cover_url'] = cmf_get_image_preview_url($unified_404);
                }
            }
            $searchData = array_merge($spotResult,$DescribeResult,$NightResult,$StoreResult,$resList,$FoodResult,$ShopResult);
            if($searchData) 
            {
                $return = array('status'=>true,'msg'=>'请求成功','data'=>$searchData);
            }else{
                $return = array('status'=>true,'msg'=>'请求成功','data'=>array());
            }
            echo json_encode($return,JSON_UNESCAPED_UNICODE);
        }
    }


    //适玩时间单位统一成小时（规则：一天为10个小时的游玩时间）
    public function play_time($play_time)
    {
        if(strstr($play_time,'天'))
        {
            $time =  mb_strcut($play_time,0,1,'utf-8') * 8;
        }else{
            $time = mb_strcut($play_time,0,3,'utf-8');
        }
        return $time;
    }

    //用户自己新增景点
    public function NewSpot()
    {
        $post = $_POST;
        // $return = array('status'=>true,'msg'=>'请求成功','data'=>$post);   
        // echo json_encode($return,JSON_UNESCAPED_UNICODE);
        // exit;
        $data['city_id'] = $post['city_id'];
        $data['spot_name'] = $post['spot_name'];
        $data['map_name'] = $post['map_name']; //原始地图上的景点名称
        $data['longitude'] = $post['longitude'];
        $data['latitude'] = $post['latitude'];
        $data['address'] = $post['address'];
        $data['creat_time'] = time();
      
        $orgurl = '/upload/newspot/'.date('Ymd').'/';
        if(isset($_FILES['images'])){
            $files = $_FILES['images'];
            
            //创建指定路径
            // $fileName = $_SERVER['DOCUMENT_ROOT']."/upload/newspot/";
            $fileName = $_SERVER['DOCUMENT_ROOT']."/upload/newspot/".date('Ymd').'/';
            if(!file_exists($fileName)){
                //进行文件创建
                mkdir($fileName,0777,true);
            }
            $pattern = '1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLOMNOPQRSTUVWXYZ';    //字符池
            $noncestr = '';
            for($i=0; $i<10; $i++){
                $noncestr .= $pattern{mt_rand(0,62)};    //生成php随机数
            }
            $name = time().$noncestr;
            //进行名称的拼接
            $imgName = $fileName.$name.'.png';
            //获取上传数据并写入
            $result = move_uploaded_file($files['tmp_name'],$imgName);
            if($result){
                $image = '/upload/newspot/'.date('Ymd').'/'.$name.'.png';//图片地址
            }
        }

        $ab ='http://';
        if(isset($image))
        {
            $data['pic'] = $image;
            $image_cover = $ab.$_SERVER['HTTP_HOST'].$image; 
        }else{
            //当没有上传图片时，用logo图片代替
            $no_up = '404/logo.png';
            $data['pic'] = $no_up; 
            $image_cover= cmf_get_image_preview_url($no_up);
        }
        
        $result = Db::name('New_spot')->insert($data);
        if($result) 
        {
            $return = array('status'=>true,'msg'=>'保存成功','data'=>$image_cover);
        }else{
            $return = array('status'=>false,'msg'=>'保存失败','data'=>'');
        }
        echo json_encode($return,JSON_UNESCAPED_UNICODE);
    }

    // 个人行程编辑后，日程列表渲染
    public function Manedit()
    {
        $cookData = $_SERVER['HTTP_COOKIE'];    
        $sessionid = substr($cookData,strpos($cookData,'=')+1);
        Session_id($sessionid);
        session_start();

        $post = input('post.');
        $trip_id = $post['trip_id'];
        $planInfo = Db::name('plan_info')->where(array('trip_id'=>$trip_id))->find();

        if(isset($planInfo))
        {
            $planInfo['info'] = unserialize(base64_decode($planInfo['schedufing']));
            $planResult = json_decode(json_encode($planInfo['info']),true);
            //pc端制作的行程单，字段与app端统一
            foreach ($planResult as $key => &$value) {
                foreach ($value['day_arry'] as $key22 => &$vaa) {
                   if(!isset($vaa['of_date'])){
                        $vaa['of_date'] = str_replace('.','-',$vaa['date']); 
                   }
                    if(!isset($vaa['start_clock'])){
                        $vaa['start_clock'] = $vaa['start_time'];
                   }
                    if(!isset($vaa['resultsTime'])){
                        $vaa['resultsTime'] = $vaa['end_time'];
                   }
                   if(!isset($vaa['city'])){
                        $vaa['city'] = $value['this_city'];
                   }
                    if(isset($vaa['hotel']) && empty($vaa['hotel']['hotel_name'])){
                       unset($vaa['hotel']);
                   }
                  
                }
            }
           // $return = array('status'=>false,'msg'=>'ceshi','data'=>$planResult);
           //      echo json_encode($return,JSON_UNESCAPED_UNICODE);
           //      exit;
            $_SESSION['list'] = $planResult;
            $return = array('status'=>true,'msg'=>'请求成功','data'=> $planResult);
        }else{
            $return = array('status'=>false,'msg'=>'请求失败','data'=>array());
        }
        echo json_encode($return,JSON_UNESCAPED_UNICODE);
    }

    /**
     * 制作过程中编辑
     * 在日程列表编辑每天的景点
     * 调换顺序，删除操作
     */
    public function editDrag()
    {
        $cookData = $_SERVER['HTTP_COOKIE'];    
        $sessionid = substr($cookData,strpos($cookData,'=')+1);
        Session_id($sessionid);

        session_start();
        $list = $_SESSION['list'];  //原有数据

        $post= $_POST;
        $trip_id = $post['trip_id']; //行程单id，可能传过来的是空
        $this_city_index = $post['this_city_index']; //城市索引
        $day_arry_index = $post['day_arry_index'];    //天数索引
        $base = json_decode($post['citymodel'],true);   //改变后，当天的景点数据

        $singday = $list[$this_city_index]['day_arry'][$day_arry_index]['day'];  //指定天数下的景点
        $singday_arry = $list[$this_city_index]['day_arry'][$day_arry_index];  //指定天数
        foreach($base as $key1=>$va2)
        {
            foreach($singday as $key2=>&$value)
            {
                //当天的景点顺序改变
                if($va2['this_name'] == $value['this_name'])  
                {
                    // echo $key2;
                    $newlist[$this_city_index]['day_arry'][$day_arry_index]['day'][] = $singday[$key2];   //景点调换顺序或删除景点
                }
            }
        }  
        $list[$this_city_index]['day_arry'][$day_arry_index]['day'] =  $newlist[$this_city_index]['day_arry'][$day_arry_index]['day'];
        
        // $list[$this_city_index]['day_arry'][$day_arry_index]['day'] = $base;   //景点调换顺序或删除景点

        //从个人中心进来的编辑
        if(!empty($trip_id)){
            $plan_info['schedufing'] = base64_encode(serialize($list));
            $result = Db::name('Plan_info')->where(array('trip_id'=>$trip_id))->update($plan_info);
        }else{
        	$result = 1;
        }

        $_SESSION['list'] = $list;
        if($result) 
        {
            $return = array('status'=>true,'msg'=>'修改成功','data'=>[]);
        }else{
            $return = array('status'=>false,'msg'=>'修改失败','data'=>'');
        }
        echo json_encode($return,JSON_UNESCAPED_UNICODE);
    }

    /**
     * 制作过程中编辑
     * 在日程列表编辑每天的景点
     * 增加景点操作
    */
    public function AddSpot()
    {
        $cookData = $_SERVER['HTTP_COOKIE'];    
        $sessionid = substr($cookData,strpos($cookData,'=')+1);
        Session_id($sessionid);
        session_start();
        $list = $_SESSION['list'];  //原有数据

        $post = $_POST; //接收新增的景点

        $trip_id = $post['trip_id'];
        $this_city_index = $post['this_city_index']; //城市索引
        $day_arry_index = $post['day_arry_index'];    //天数索引
        $newAddspot = json_decode($post['citymodel'],true); 
        
// $return = array('status'=>false,'msg'=>'ceshi','data'=>$post);    
//  echo json_encode($return,JSON_UNESCAPED_UNICODE);
//  exit;
        $singday = $list[$this_city_index]['day_arry'][$day_arry_index]['day'];  //指定天数下的景点
        $singday_arry = $list[$this_city_index]['day_arry'][$day_arry_index];  //指定天数

        //从个人中心进来的编辑,新增加的景点，查询info详情
        if(!empty($trip_id)){
            $city_name = $list[$this_city_index]['this_city'];
            $this_floor_index = $newAddspot['this_floor_index'];
            $spot_name = $newAddspot['this_name'];

            if($this_floor_index == 0)
            {
                $shopList = Db::name('Nature_absture')->where(array('city_name'=> $city_name,'spot_name'=>$spot_name))->find();
                
                // 若选择了Top8的景点，最后输出的时候，id匹配到人文景观中对应景点的id
                if($shopList['type'] == 'Top8')
                {
                    $absture = Db::name('Nature_absture')->field('spot_name,id')->where(array('city_name'=>$city_name,'spot_name'=>$spot_name,'type'=>'人文景观'))->find();
                    if(!empty($absture)){ $shopList1['id'] = $absture['id'];}
                }
                
                if(!empty($shopList['pic']))
                {
                    $spot_cover = json_decode($shopList['pic'],true);
                    foreach($spot_cover as $k2 => &$spot_value)
                    {
                        $shopList['spot_image_url']= cmf_get_image_preview_url($spot_value['url']); 
                    }
                    unset($shopList['pic']);
                }
                
                unset($shopList['picture2']);
                //营业时间
                $shopList['business_hours'] = $shopList['suit_time'];
                unset($shopList['suit_time']);
                //人均
                $shopList['per_capita'] = '';

                $newAddspot['info'] = $shopList;
            }

            if($this_floor_index == 1)
            {
                $shopList = Db::name('Describe')->where(array('city_name'=> $city_name,'spot_name'=>$spot_name))->find();
            
                if(!empty($shopList['pic']))
                {
                    $spot_cover = json_decode($shopList['pic'],true);
                    foreach($spot_cover as $k2 => &$spot_value)
                    {
                        $shopList['spot_image_url']= cmf_get_image_preview_url($spot_value['url']); 
                    }
                    unset($shopList['pic']);
                }
                
                unset($shopList['picture2']);
                $shopList['business_hours'] = $shopList['suit_time'];
                unset($shopList['suit_time']);
                $shopList['per_capita'] = '';

                $newAddspot['info'] = $shopList;
            }

            if($this_floor_index == 2)
            {
                $shopList = Db::name('Night')->where(array('city_name'=> $city_name,'spot_name'=>$spot_name))->find();
            
                if(!empty($shopList['pic']))
                {
                    $spot_cover = json_decode($shopList['pic'],true);
                    foreach($spot_cover as $k2 => &$spot_value)
                    {
                        $shopList['spot_image_url']= cmf_get_image_preview_url($spot_value['url']); 
                    }
                    unset($shopList['pic']);
                }
                
                unset($shopList['picture2']);
                $shopList['business_hours'] = $shopList['suit_time'];
                unset($shopList['suit_time']);
                $shopList['per_capita'] = '';

                $newAddspot['info'] = $shopList;
            }
            if($this_floor_index == 3)
            {
                $shopList = Db::name('Food_court')->where(array('city_name'=> $city_name,'food_court_name'=>$spot_name))->find();

                if(!empty($shopList['pic']))
                {
                    $spot_cover = json_decode($shopList['pic'],true);
                    foreach($spot_cover as $k2 => &$spot_value)
                    {
                        $shopList['spot_image_url']= cmf_get_image_preview_url($spot_value['url']); 
                    }
                }
                
                //楼层中的相关字段，名称匹配
                if(isset($shopList['food_court_name']))
                {
                    $shopList['spot_name'] = $shopList['food_court_name'];
                    unset($shopList['food_court_name']);
                }
                
                //适玩时间
                if(isset($shopList['suit_time']))
                {
                    $shopList['play_time'] = $shopList['suit_time'];
                    unset($shopList['suit_time']);
                }
                
                //门票
                $shopList['attractions_tickets'] = '';

                unset($shopList['pic']);
                unset($shopList['picture2']);
                $newAddspot['info'] = $shopList;
            }
            if($this_floor_index == 4)
            {
                $shopList = Db::name('shopping_streets')->where(array('city_name'=> $city_name,'shopping_name'=>$spot_name))->find();
                if(!empty($shopList['pic']))
                {
                    $spot_cover = json_decode($shopList['pic'],true);
                    foreach($spot_cover as $k2 => &$spot_value)
                    {
                        $shopList['spot_image_url']= cmf_get_image_preview_url($spot_value['url']); 
                    }
                }
                
                if(isset($shopList['shopping_name']))
                {
                    $shopList['spot_name'] = $shopList['shopping_name'];
                    unset($shopList['shopping_name']);
                }
            
                //适玩时间
                if(isset($shopList['shopping_time']))
                {
                    $shopList['play_time'] = $shopList['shopping_time'];
                    unset($shopList['shopping_time']);
                }
                
                $shopList['attractions_tickets'] = '';
                $shopList['suit_season'] = '';

                unset($shopList['pic']);
                unset($shopList['picture2']);
        
                $newAddspot['info'] = $shopList;
            }

            //用户自己新增的景点
            if($this_floor_index == '-2')
            {
                $newspot = Db::name('New_spot')->field('address')->where(array('spot_name'=> $ji['this_name'],'city_id'=>$ji['city_id']))->find();
                $newAddspot['info']['play_time'] = $newAddspot['this_playtime'];
                $newAddspot['info']['spot_image_url'] = $newAddspot['this_img_src'];
                $newAddspot['info']['latitude'] = $newAddspot['this_lat'];
                $newAddspot['info']['longitude'] = $newAddspot['this_lng'];
                $newAddspot['info']['spot_name'] = $newAddspot['this_name'];
                $newAddspot['info']['longitude'] = $newAddspot['this_lng'];
                $newAddspot['info']['address'] = $newspot['address'];
                $newAddspot['address'] = $newspot['address'];

                $newAddspot['info']['attractions_tickets'] = '';
                $newAddspot['info']['suit_season'] = '';
                $newAddspot['info']['business_hours'] = '';
                $newAddspot['info']['phone'] = '';
                $newAddspot['info']['spot_Introduction'] = '';
                $newAddspot['info']['attractions_tickets'] = '';
                $newAddspot['info']['attractions_tickets'] = '';
            }
            $singday[] = $newAddspot;  //新的景点追加到数组后面
        	$list[$this_city_index]['day_arry'][$day_arry_index]['day'] = $singday;
            $plan_info['schedufing'] = base64_encode(serialize($list));
            $result = Db::name('Plan_info')->where(array('trip_id'=>$trip_id))->update($plan_info);
        }else{
            $singday[] = $newAddspot;  //新的景点追加到数组后面
            $list[$this_city_index]['day_arry'][$day_arry_index]['day'] = $singday;
            $result = 1;
        }

        $_SESSION['list'] = $list;
        if($result !==false) 
        {
            $return = array('status'=>true,'msg'=>'添加成功','data'=>$newAddspot);
        }else{
            $return = array('status'=>false,'msg'=>'添加失败','data'=>'');
        }
        echo json_encode($return,JSON_UNESCAPED_UNICODE);

    }
    // 制作过程中编辑结束后 刷新行程总览
    public function refresh()
    {
        $cookData = $_SERVER['HTTP_COOKIE'];    
        $sessionid = substr($cookData,strpos($cookData,'=')+1);
        Session_id($sessionid);
        session_start();
        $list = $_SESSION['list']; 

        //     $return = array('status'=>false,'msg'=>'ceshi','data'=>$list);
        
        // echo json_encode($return,JSON_UNESCAPED_UNICODE);
        // exit;
        if($list) 
        {
            $return = array('status'=>true,'msg'=>'请求成功','data'=>$list);
        }else{
            $return = array('status'=>false,'msg'=>'请求失败','data'=>'');
        }
        echo json_encode($return,JSON_UNESCAPED_UNICODE);
    }
}