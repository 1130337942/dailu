<?php
// +----------------------------------------------------------------------
// | ThinkCMF [ WE CAN DO IT MORE SIMPLE ]
// +----------------------------------------------------------------------
// | Copyright (c) 2013-2017 http://www.thinkcmf.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed ( http://www.apache.org/licenses/LICENSE-2.0 )
// +----------------------------------------------------------------------
// | Author: 老猫 <thinkcmf@126.com>
// +----------------------------------------------------------------------
namespace app\portal\controller;

use cmf\controller\HomeBaseController;
use think\Db;


use app\portal\model\HotelModel;

use app\admin\model\ThemeModel;

class ItineraryController extends HomeBaseController
{
    //行程确认、接收收据(最后一个城市做完，做数据存储操作)
    public function overview()
    {
        session_start();
        $info = $_SESSION;
        // $post = $GLOBALS['HTTP_RAW_POST_DATA']; 低版本的PHP
        $post = file_get_contents('php://input'); 
        $post = json_decode($post,true);  
//         print_r($info);
//        print_r($post);
//         exit;
        $go_city_array = $post['go_city_array']; //游玩城市
        $cityNumber = count($go_city_array);  //城市个数
        $nowcity = $post['singcityData']['this_city'];   //当前城市名称
        $this_city_index = $post['singcityData']['this_city_index'];   //当前城市索引
        $singcityData = $post['singcityData']; //该城市优化后的景点，酒店，美食安排
        // print_r($post['singcityData']);
        if(isset($_SESSION['cityResult']))
        {
            $cityResult = $_SESSION['cityResult'];
        }else{
            for($i=0;$i<$cityNumber;$i++)
            {
                $cityResult[] = '';
            }
        }
         $newhotelData = [];
        //计算每天的公里数，交通时间数
        foreach($singcityData['day_arry'] as &$siVaue){
            $dsum = 0;
            $tsum = 0;
            if(isset($siVaue['day']) && !empty($siVaue['day'])){
                foreach($siVaue['day'] as $spotv){
                    if(isset($spotv['traffic_distance'])){
                        $dsum = $dsum + $spotv['traffic_distance'];
                        $tsum = $tsum + $spotv['traffic_time'];
                    }
                }
            }
            $siVaue['SpotDisSum'] = $dsum;
            $siVaue['traffic_timeSum'] = $tsum;
            
            //当前城市已经选择的酒店（最新的）
            if(isset($siVaue['hotel'])){
                $newhotelData[] =$siVaue['hotel'];
            }
        }
        $oldhotel = $info['allhotel']; //之前选择的酒店
         //日期相同的用最新的酒店替换原来的酒店
        if(isset($newhotelData) && !empty($newhotelData)){
//            echo 3;
            foreach($oldhotel as $key=>&$oldvalue){
                foreach($newhotelData as $newvalue){
                    if($oldvalue['of_date'] == $newvalue['of_date']){
                        $oldvalue = $newvalue;
                    }
                }
            }  
            //日期相同的替换后，将$newhotelData去重操作
//            foreach($oldhotel as $key => $valueA){
//                $of_date = $valueA['of_date'];
//                foreach($newhotelData as $keys => $valueB){
//                    if($of_date == $valueB['of_date']){
//                        unset($newhotelData[$key]);
//                    }
//                }
//            }
//            $addtohotel = array_merge($newhotelData);

            // 酒店整合(所有城市最新的酒店)
            $allhotel = array_merge($oldhotel);
        }else{
            $allhotel = array_merge($oldhotel);
        }
       
        foreach($allhotel as &$en){
            $en['dateTostamp'] = strtotime($en['of_date']);
        }
        $datesort = array_column($allhotel, 'dateTostamp'); //按照日期顺序排列
        array_multisort($datesort, SORT_ASC, $allhotel);
        $_SESSION['allhotel'] = $allhotel;
        
        foreach($cityResult as $key=>$r){
            if($key == $this_city_index){
                $cityResult[$key] = $singcityData ;   //将最新的城市数据存到对应的空间内
            }
        }   
        $_SESSION['cityResult'] = $cityResult;    //多个城市数据整合
//    print_r($cityResult);
//    exit;
        $singacross = $post['across_city']; //当前城市最后一天是否跨城的信息
//        print_r($singacross);
        if(isset($_SESSION['across_city']))
        {
            $across_city = $_SESSION['across_city'];
        }else{
            for($i=0;$i<$cityNumber;$i++)
            {
                $across_city[] = '';
            }
        }
        foreach($across_city as $key=>$across){
            if($key == $this_city_index){
                $across_city[$key] = $singacross;   //将跨城标记数据存到对应的空间内
            }
        }  
        $_SESSION['across_city'] = $across_city;
        
       /*当前是城市是行程单最后一个城市时，将之前整合的所有数据存到数据库
        *生成行程单
        * 
        */
        //最新的基本数据
        $adult = $post['adult'];
        $children = $post['children'];
        $date = $post['date'];
        $day_num = $post['day_num'];
        $title = $post['title'];
        $_SESSION['title'] =  $title; //行程单标题
        $cover = $post['cover'];

        $departure_city = $post['departure_city'];
        $return_city = $post['return_city'];
        $go_city_array = $post['go_city_array'];
        //最新的基本数据存储
        $_SESSION['citysession']['cityArray'] = $post['cityArray'];
        $_SESSION['citysession']['departure_city'] = $post['departure_city'];
        $_SESSION['citysession']['return_city'] = $post['return_city'];
        $_SESSION['citysession']['go_city_array'] = $post['go_city_array'];
        $_SESSION['citysession']['adult'] = $post['adult'];
        $_SESSION['citysession']['children'] = $post['children'];
        $_SESSION['citysession']['date'] = $post['date'];
        $_SESSION['citysession']['day_num'] = $post['day_num'];
        $_SESSION['citysession']['title'] = $post['title'];
        $_SESSION['citysession']['cover'] = $post['cover'];
  
        $cityArray = $post['cityArray'];
        //在制作最后一个城市结束时： 调用生成行程单的接口
        if($this_city_index == $cityNumber-1)
        {   
            $result = $this->serverResult($adult,$children,$date,$day_num,$departure_city,$return_city,$go_city_array,$cityArray,$title,$cover);  
           
            $return = array('status'=>true,'msg'=>'行程单制作完成!','data'=>$result);
        }else{
            if(isset($cityResult)){
                $return = array('status'=>true,'msg'=>'当前城市线路制作成功!','data'=>[]);
            }else{
                $return = array('status'=>false,'msg'=>'制作失败!','data'=>[]);
            }
        }
        echo json_encode($return,JSON_UNESCAPED_UNICODE);
    }
    
    //整理数据，存入数据库，生成行程单
    public function serverResult($adult,$children,$date,$day_num,$departure_city,$return_city,$go_city_array,$cityArray,$title,$cover)
    {
        //清除无用的session数据
        unset($_SESSION['aroundcity'],$_SESSION['data'],$_SESSION['result']);
//        unset($_SESSION['citysession']);
        $info = $_SESSION;
        //print_r($info);
        $uid = $_COOKIE['uid'];   //用户uid
        //酒店总数
        $allhotel = $info['allhotel'];
        $hotelSum = 0;
        foreach($allhotel as $ht){
            if(isset($ht['hotel_name'])){
                $hotelSum += 1;
            }
        }
        //游玩人数
        $people = $adult + $children;
        //交通方式
        $go_city = $go_city_array; //游玩城市
        foreach($go_city as &$vc){
            $vc['tooltime'] = $vc['flightTime'] = $vc['trainTime']= $vc['trafficTime'] = $vc['busTime'] = $vc['trc_time'];
        }
        $number = count($go_city);
        //出发城市
        $dep_cityname = $departure_city['city_name'];
        //返回的交通
        $re_city =  $return_city;
        $re_cityname = $re_city['city_name'];
        $re_city['flightTime']=$re_city['trainTime']=$re_city['trafficTime']=$re_city['busTime'] = $re_city['trc_time'];
        $re_way = $re_city['city_trc_name'];
        $dis = $re_city['dis'];
        $tooltime = $re_city['trc_time']; //返回交通时间
        //返回
        $start_city = $go_city[$number-1]['city_name'];
        $start_time = $go_city[$number-1]['city_date2'];
        $array = array(
            'start_city'=>$start_city,
            'city_date'=>$start_time,
            'city_name'=>$re_cityname,
            'city_trc_name'=>$re_way,
            'dis'=>$dis,
            'trc_class'=>'',
            'people' =>$people,
            'tooltime'=>$tooltime,
            'trafficTime'=>$tooltime
        );
        //跨城
        $across_city = $info['across_city'];
//        print_r($info['next_city_day0']);
//        print_r($go_city);
//        exit;
//        print_r($across_city);
        //游玩城市之间的交通
        foreach($go_city as $k3 => &$g)
        {
            if($number > 1)
            {
                if($k3 == 0)
                {
                    $g['start_city'] = $dep_cityname;
                    $g['people'] = $people;
                }else{
                    //跨城
                    if($across_city[$k3-1] !=='false'){
                        $go_city[$k3]['start_city'] = $go_city[$k3-1]['city_name'];
                        if($go_city[$k3]['city_daynum'] == 0){
                            $go_city[$k3]['city_date'] = date('Y-m-d',strtotime($go_city[$k3]['city_date']));
                        }else{
                            $go_city[$k3]['city_date'] = date('Y-m-d',strtotime($go_city[$k3]['city_date']) -3600*24);
                        }    
                        $g['people'] = $people;
                    }else{
                        $go_city[$k3]['start_city'] = $go_city[$k3-1]['city_name'];
                        $g['people'] = $people;
                    }
                }
            }else{
                $g['start_city'] = $dep_cityname;
                $g['people'] = $people;
            }
//           $g['tooltime'] = $tooltime;
            unset($g['city_time_1'],$g['city_time_2']);
            unset($g['city_id'],$g['province_id'],$g['provinceNames']);
            unset($g['flightTime'],$g['trainTime'],$g['busTime'],$g['trc_time']);
            unset($g['city_Introduction'],$g['city_date2'],$g['city_daynum']);
            unset($g['city_d_1'],$g['city_d_2'],$g['fit_day']);
        }   
        array_push($go_city,$array);    //所有的大交通

        //调用交通接口，计算费用
        foreach ($go_city as $go_key => &$go_value) {
            if(array_key_exists('people_number',$go_value)){
                $go_value['people'] = $go_value['people_number'];
            }
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
            }else{
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
            }
        }

        //选择了几家酒店
        $allhotel = $info['allhotel'];
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
            foreach($hotel_newArr as $k5=>&$ee)
            {
                foreach($new as $k6=>$ww)
                {
                    if($k5 == $k6)
                    {
                        $ee['number_night'] = $ww;  //每个酒店住几晚
                    }
                }
            }
            foreach($hotel_newArr as $y=>$o){
                $h_Result[] = $o;   //总共选择了几家酒店入住
            }
        }
         /*** 餐饮费用 ***/
        foreach($info['cityResult'] as $key3=>$c)
        {
            foreach($c['day_arry'] as $cc)
            {
                if(isset($cc['day'])){
                    foreach($cc['day'] as $ccc)
                    {
                        if(!empty($ccc['eat_info']))
                        {
                            $eat[] = $ccc['eat_info'];
                        }
                    }
                }
            }
        }
        if(isset($eat)){
            foreach($eat as $k => $v) 
            {
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
//         print_r($go_city);
        //大交通匹配到对应的日期中traffic[one_city，two_city],二维数组，可能一天有多个大交通
        $cityResult = $info['cityResult'];
        foreach($cityResult as $key=>$rvalue){
            foreach($rvalue['day_arry'] as $key2=>&$day_aryValue){
                foreach($go_city as $key3=>$gvalue){
                    if($key3 !== 0){
                        if( $gvalue['city_date'] == $day_aryValue['of_date']){
                            $gvalue['one_city'] =  $gvalue['start_city'];
                            $gvalue['two_city'] =  $gvalue['city_name'];
                            if($rvalue['this_city'] == $gvalue['start_city'] ){
                                $cityResult[$key]['day_arry'][$key2]['transport'][] = $gvalue;
                                $temptraffic[] = $gvalue;   //已经存进去的大交通统计
                            } 
                        }
                    }else{
                        if( $gvalue['city_date'] == $day_aryValue['of_date']){
                            $gvalue['one_city'] =  $gvalue['start_city'];
                            $gvalue['two_city'] =  $gvalue['city_name'];
                             if($rvalue['this_city'] == $gvalue['city_name'] ){
                                    $cityResult[$key]['day_arry'][$key2]['transport'][] = $gvalue;
                                    $temptraffic[] = $gvalue;
                             }
                        }
                    }
                }
            }
        }

        $tempgo_city = $go_city;
        if(isset($temptraffic)){
            foreach($tempgo_city as $lkey=>$aorgo){
                 foreach($temptraffic as $tempvv){
                    if($aorgo['start_city'] == $tempvv['start_city'] && $aorgo['city_date'] == $tempvv['city_date']){
                        unset($tempgo_city[$lkey]);
                    }
                }
            }
            $residueData = array_merge($tempgo_city);   //剩余没有插入的大交通
        }
//            print_r($residueData);
//            exit;
        //按照对应日期插入对应的剩余的大交通
        foreach($cityResult as $rkey=>$ccValue){
            foreach($ccValue['day_arry'] as $frkey=>$mnvalue){
                foreach($residueData as $key3=>$resi){
                    if($resi['city_date'] == $mnvalue['of_date']){
                        $resi['one_city'] =  $resi['start_city'];
                        $resi['two_city'] =  $resi['city_name'];
                        $cityResult[$rkey]['day_arry'][$frkey]['transport'][] = $resi;
                        unset($residueData[$key3]);
                        $residueData = array_merge($residueData);
                    }
                }
            }
        }
//        print_r($cityResult);
        //查询城市详情info
        $cityData = $cityResult; 
        foreach($cityData as $kk2=>&$cityinfo)
        {
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
                //一天出现两个大交通时，由于顺序反了，调换一下（第一天除外）
                if($kk2 !== 0){
                    if(isset($d['transport'])){
                        $transportNum = count($d['transport']);
                        if($transportNum == 2){
                            $d['transport'] = array_merge(array_reverse($d['transport']));
                        }
                    }
                }
               
                //查询景点详情
                if(isset($d['day']))
                {
                    $this_floor_index = '';
                    $spot_name = '';
                    foreach($d['day'] as &$ji)
                    {
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
                            //unset($shopList5['picture2']);
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
        
        /* 最后信息整合，生成的行程单分别对应存储到对应的表当中
        *  行程概览：trip_info表
        *  城市线路：city_line表
        *  交通费用：traffic_money表
        *  酒店费用：hotel表
        *  餐饮费用，接机费用(增值服务)：eat_money表
        *  日程安排：plan_info表
        */

        $time = time();
        $trip_id = $uid.'-'.$time;  //行程单号

        //⑴行程概览
        $baseInfo['uid'] = $uid;
        $baseInfo['trip_id'] = $trip_id;
        $baseInfo['creat_time'] = $time;
        $baseInfo['status'] = 0;
       
        $baseData['departure_latlng']['lat'] = $departure_city['lat'];
        $baseData['departure_latlng']['lng'] = $departure_city['lng'];
        $baseData['return_latlng']['lat'] =  $return_city['lat'];
        $baseData['return_latlng']['lat'] =  $return_city['lng'];	

        $baseInfo['dep_lat'] = $departure_city['lat'];
        $baseInfo['dep_lng'] = $departure_city['lng'];
        $baseInfo['ret_lat'] =  $return_city['lat']; 
        $baseInfo['ret_lng'] =  $return_city['lng'];
        //返回
        $baseInfo['dis'] =  $return_city['dis'];
        $baseInfo['flightTime'] =  $return_city['trc_time'];
        $baseInfo['trainTime'] =  $return_city['trc_time'];
        $baseInfo['city_trc_name'] =  $return_city['city_trc_name'];
        
        $return_city['trainTime'] = $return_city['trafficTime'] = $return_city['flightTime'] = $return_city['trc_time'];
        $baseInfo['return_cityInfo'] = json_encode($return_city);
        $baseInfo['go_city_array'] = json_encode($go_city_array); 

        $baseInfo['adult'] = $adult;
        $baseInfo['children'] = $children;
        $baseInfo['date'] = $date;
        $baseInfo['day_num'] = $day_num;
        //拼接行程单名称
        $user = Db::name('Customer')->field('user_name')->where(array('uid'=>$uid))->find();
        $cityString = implode('.',$cityArray);
        $citynum = count($cityArray);
        $baseInfo['trip_name'] = $user['user_name'].'的'.$cityString.$day_num.'日游行程单';
        $baseInfo['travel_title'] = $title;
        $baseInfo['cover'] = $cover;

        $baseInfo['departure_city'] = $departure_city['city_name'];
        $baseInfo['return_city'] = $return_city['city_name'];
        $baseInfo['traffic_tools'] = $return_city['city_trc_name'];
        $baseInfo['hotelSum'] = $hotelSum;
        $baseInfo['allhotel'] = json_encode($info['allhotel']); //所有日期对应的酒店

         //⑵城市线路
        $city_line['uid'] = $uid;
        $city_line['trip_id'] = $trip_id;
        $city_line['creat_time'] = $time;
        $city_line['status'] = 0;
        foreach($go_city_array as &$df){
            $df['this_city'] = $df['city_name'];
            $df['this_city_lat'] = $df['lat'];
            $df['this_city_lng'] = $df['lng'];
            $df['day_num'] = $df['city_daynum'];
            $df['province'] = $df['provinceNames'];
            $df['departure_city'] = $departure_city['city_name'];
            $df['return_city'] = $return_city['city_name'];
        }
        $city_line['list'] = json_encode($go_city_array);
        $city_line['return_date'] = date("Y-m-d",(strtotime($date) + ($day_num-1)*3600*24)); 

        //⑶交通费用
        $traffic_money['uid'] = $uid;
        $traffic_money['trip_id'] = $trip_id;
        $traffic_money['creat_time'] = $time;
        $traffic_money['status'] = 0;
        $traffic_money['traffic_money'] = json_encode($go_city);
        
        //日程安排，景点信息
        $plan_info['uid'] = $uid;
        $plan_info['trip_id'] = $trip_id;
        $plan_info['creat_time'] = $time;
        $plan_info['status'] = 0;
        //由于cityData的数据比较大，先进行序列化后再存储，防止数据丢失
        $plan_info['schedufing'] = base64_encode(serialize($cityData));
        
        //数据存入数据库
        $result = Db::name('trip_info')->insert($baseInfo);
        $result = Db::name('city_line')->insert($city_line);
        $result = Db::name('traffic_money')->insert($traffic_money);
        $result = Db::name('plan_info')->insert($plan_info);
        // ⑷酒店费用
        if(isset($h_Result)){
            $hotelData['uid'] = $uid;
            $hotelData['trip_id'] = $trip_id;
            $hotelData['creat_time'] = $time;
            $hotelData['status'] = 0;
            $hotelData['hotel_info'] = json_encode($h_Result);
            $result = Db::name('hotel')->insert($hotelData);
        }
        //⑸餐饮费用，接机费用(增值服务)
        if(isset($eatResult)){
            $eat_money['uid'] = $uid;
            $eat_money['trip_id'] = $trip_id;
            $eat_money['creat_time'] = $time;
            $eat_money['status'] = 0;
            if(isset($way)){
                $eat_money['way_money'] = json_encode($way);
            }
            $eat_money['eat_money'] = json_encode($eatResult); 
            $result = Db::name('eat_money')->insert($eat_money);
        }
        if($result){
            $returnData['uid'] = $uid;
            $returnData['trip_id'] = $trip_id;
            return  $returnData;
        }else{
            return false;
        }
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
    //增值服务
    public function addServer()
    {
        // eat_name_arry
        return $this->fetch();
    }
    //h5行程单分享
    public function tripinfoshares()
    {
        // eat_name_arry
        return $this->fetch();
    }
     //下载行程单
    public function downpdf()
    {
        // eat_name_arry
        return $this->fetch();
    }

    public function downpdf2()
    {
        // eat_name_arry
        return $this->fetch();
    }


    //接收的是base64的图片格式，转化成路径格式
    public function UpCover()
    {
        $post = $_POST;
        $orgurl = '/upload/portal/cover/'.date('Ymd').'/';
        $imageresult = $this->saveBase64Image($post['cover'],$orgurl);
        $url['cover'] = $imageresult['url'];
        if($url)
        {
            $return = array('status'=>true,'msg'=>'上传成功','data'=>$url);
        }else{
            $return = array('status'=>false,'msg'=>'上传失败','data'=>$url);
        }
        echo json_encode($return,JSON_UNESCAPED_UNICODE);
    }
    /**
    * 保存64位编码图片
    **/
    function saveBase64Image($base64_image_content,$url)
    {
        if (preg_match('/^(data:\s*image\/(\w+);base64,)/', $base64_image_content, $result)){

            //图片后缀
            $type = $result[2];

            //保存位置--图片名
            $image_name=date('His').str_pad(mt_rand(1, 99999), 5, '0', STR_PAD_LEFT).".".$type;   
            $image_url = $url.$image_name;   

            if(!is_dir(dirname('.'.$image_url))){
                    mkdir(dirname('.'.$image_url));
                    chmod(dirname('.'.$image_url), 0777);
                    // umask($oldumask);
            }
            
            //解码
            $decode=base64_decode(str_replace($result[1], '', $base64_image_content));
            if (file_put_contents('.'.$image_url, $decode)){
                    $data['code']=0;
                    $data['imageName']=$image_name;
                    $data['url']=$image_url;
                    $data['msg']='保存成功！';
            }else{
                $data['code']=1;
                $data['imgageName']='';
                $data['url']='';
                $data['msg']='图片保存失败！';
            }
        }else{
            $data['code']=1;
            $data['imgageName']='';
            $data['url']='';
            $data['msg']='base64图片格式有误！';
        }       
        return $data;
    }
    //用户自己在编辑之前已经完成的行程单的时候，渲染之前行程单标题,封面图
    public function Title()
    {
        session_start();
        // print_r($_SESSION);
        if(isset($_SESSION['complete_order']['trip_id']))
        {
            $complete_trip_id = $_SESSION['complete_order']['trip_id'];
            $titleData = Db::name('trip_info')->field('uid,trip_id,travel_title,cover')->where(array('trip_id'=>$complete_trip_id))->find();
            $titleData['image_cover'] = $titleData['cover'];
        }else{
            $uid = $_GET['uid'];
            //拼接行程单名称
            $user = Db::name('Customer')->field('user_name')->where(array('uid'=>$uid))->find();
            if(isset($_SESSION['overview']['head']['city']) && isset($_SESSION['citysession']['day_num']))
            {
                $day_num = $_SESSION['citysession']['day_num'];
                $cityArray = $_SESSION['overview']['head']['city'];
                $cityString = implode('.',$cityArray);
                $citynum = count($cityArray);
                // $titleData['travel_title'] = $cityString. $citynum.'城市'.$day_num.'日游行程单';
                $titleData['travel_title'] = $user['user_name'].'的'.$cityString.$day_num.'日游行程单';
                //封面图
                $tempUrl = $_SESSION['data']['spot_data']['addgo_arry'][0]['this_img_src'];//默认用一个景点图片作为封面图
                $titleData['image_cover'] = '/'.substr($tempUrl,strpos($tempUrl,'/upload')+1); 
            }else{
                $titleData['travel_title'] = '';
                $titleData['image_cover'] = '';
            } 
        }
        echo json_encode($titleData,JSON_UNESCAPED_UNICODE);
    }
    //行程单页面 (电子书模式)
    public function books()
    {
        return $this->fetch();
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
    
    //在行程单列表或日历模式中 点击景点查看景点详情
    public function LookDetail()
    {
        /****** 景区  *********/
        $post = $_POST;
        $this_floor_index = $post['this_floor_index']; //景点所属楼层
        $this_type = $post['this_type'];  //类型：人文景观，美食街区
        $spot_name = $post['spot_name'];
        $city_id = $post['city_id'];
        $longitude1 = $post['lng'];
        $latitude1 = $post['lat'];
        
        $where['spot_name'] = $spot_name;
        $result = array();
        /** 1F-3F 附近推荐 
        * 景区附近推荐 (美食推荐、景点推荐、购物推荐)，
        * 规则：景点3公里以内的给予推荐
        **/
        // //① 附近推荐景点
        $cityData = Db::name('Cultural_spot')->where(array('city_id'=>$city_id))->select();
        $cityInfo = json_decode($cityData,true);
        if($cityInfo)
        { 
            foreach($cityInfo as $key=>&$cityValue)
            {
                $lo = $cityValue['longitude'];
                $la= $cityValue['latitude'];
                //调用common.php 中的 getDistance方法计算两个地理位置之间的距离
                $distance = getDistance($longitude1, $latitude1, $lo, $la, 1,0);
                //景区中的景点不推送在附近景点中
                if($cityValue['scenic_name'] == $spot_name)
                {
                    unset($cityInfo[$key]);
                }
                if($distance > 3000 )
                {
                    unset($cityInfo[$key]);
                }else{
                    $cityValue['distance'] = $distance.'米';
                }
                if(!empty($cityValue['pic']))
                {
                    $pic =json_decode($cityValue['pic'],true);
                  
                    foreach($pic as $kk => $pic_value)
                    {
                        //common.php中封装的图片url解析方法
                        if(!empty($pic_value['url']))
                        {
                            $cityValue['img_url'] = cmf_get_image_preview_url($pic_value['url']); 
                        }
                    }
                }
               
                unset($cityValue['pic']);
                unset($cityValue['picture2']); 
                $cityValue['introduction'] = htmlchars($cityValue['spot_Introduction']);
                unset($cityValue['spot_Introduction']); 
                //适玩时间
                $cityValue['tag_time'] = $this->play_time($cityValue['play_time']);  //时间统一成小时
            } 
        }
        // ② 附近推荐美食
        $store_infoData = Db::name('Store_info')->where(array('city_id'=>$city_id))->select();
        $storeInfo = json_decode($store_infoData,true);
        foreach($storeInfo as $key2=>&$storeValue)
        {
            $long = $storeValue['longitude'];
            $lat= $storeValue['latitude'];
            //调用common.php 中的 getDistance方法计算两个地理位置之间的距离
            $distance2 = getDistance($longitude1, $latitude1, $long, $lat, 1,0);
            if($distance2 > 3000 )
            {
                unset($storeInfo[$key2]);
            }else{
                $storeValue['distance'] = $distance2.'米';
            }
            if(!empty($storeValue['pic']))
            {
                $image =json_decode($storeValue['pic'],true);
                foreach($image as $kk2 => &$pic_value)
                {
                    //common.php中封装的图片url解析方法
                    $storeValue['img_url'] = cmf_get_image_preview_url($pic_value['url']); 
                }
                unset($storeValue['pic']);
            }
           
            unset($storeValue['picture2']); 
            $storeValue['introduction'] = htmlchars($storeValue['store_Introduction']);
            unset($storeValue['store_Introduction']); 
        }
        // ③ 附近推荐购物
        $shop_streetData = Db::name('shopping_streets')->where(array('city_id'=>$city_id))->select();
        $shop_streetInfo = json_decode($shop_streetData,true);
        foreach($shop_streetInfo as $key3=>&$shopValue)
        {
            $longitu = $shopValue['longitude'];
            $latitu= $shopValue['latitude'];
            //调用common.php 中的 getDistance方法计算两个地理位置之间的距离
            $distance3 = getDistance($longitude1, $latitude1, $longitu, $latitu, 1,0);

            if($distance3 > 3000 )
            {
                unset($shop_streetInfo[$key3]);
            }else{
                $shopValue['distance'] = $distance3.'米';
            }
            if(!empty($shopValue['picture2']))
            {
                $picture =json_decode($shopValue['picture2'],true);
                foreach($picture as $kk3 => &$picvalue)
                {
                    //common.php中封装的图片url解析方法
                    $shopValue['img_url'] = cmf_get_image_preview_url($picvalue['url']);
                }
                unset($shopValue['pic']);
            }
           
            unset($shopValue['picture2']); 
            $shopValue['introduction'] = htmlchars($shopValue['shopping_Introduction']);
            unset($shopValue['shopping_Introduction']); 
            //适玩时间
            $shopValue['tag_time'] = $this->play_time($shopValue['shopping_time']);  //时间统一成小时
        }
        $re1['jingdian'] = array_merge($cityInfo);
        $re2['food'] = array_merge($storeInfo);
        $re3['shop'] = array_merge($shop_streetInfo);
        $tuijian = array_merge($re1,$re2,$re3); //整合成 附近推荐的数据
        
        //1F景点详情
        if($this_floor_index == 0){
            $spotDetail = Db::name('Nature_absture')->where($where)->find();
            $spotDetail['release_time'] = date('Y-m-d', $spotDetail['update_time']);
            //适玩季节
            if(isset($spotDetail['suit_season']))
            {
                if($spotDetail['suit_season'] == '1,2,3,4,5,6,7,8,9,10,11,12')
                {
                    $spotDetail['suit_season'] = '1-12月';
                }else{
                    if(strstr($spotDetail['suit_season'], '月')){
                        if($spotDetail['suit_season'] == '-月'){
                            $spotDetail['suit_season'] = '暂无';
                        }else{
                            $spotDetail['suit_season'] = $spotDetail['suit_season'];
                        }
                    }else{
                         $spotDetail['suit_season'] = substr( $spotDetail['suit_season'],0,strpos( $spotDetail['suit_season'], ',')).'-'.trim(strrchr($spotDetail['suit_season'], ','),',').'月';  
                    }
                }
            }else{
                $spotDetail['suit_season'] = '暂无';
            }
            //景点封面图片 cover
            if(!empty($spotDetail['picture2']))
            {
                $cover_pic = json_decode($spotDetail['picture2'],true);
                foreach($cover_pic as $k => &$pic_value)
                {
                    //common.php中封装的图片url解析方法
                    $spotDetail['image_url'][$k]= cmf_get_image_preview_url($pic_value['url']); 
                    $spotDetail['image_name'][$k]= substr($pic_value['name'],0,strpos($pic_value['name'], '.'));
                    $pp['url'] = $spotDetail['image_url'][$k];
                    $pp['name'] = $spotDetail['image_name'][$k];
                    $spotDetail['image'][$k] = $pp;
                }
                unset($spotDetail['picture2']);
            }
            //文字描述中的html标签转化成实体
            if(isset($spotDetail['spot_Introduction'])){
                $spotDetail['introduction'] = htmlchars($spotDetail['spot_Introduction']);
            }else{
                $spotDetail['introduction'] = '';
            }
            
            unset($spotDetail['spot_Introduction']);
            $spotDetail['description'] = htmlchars($spotDetail['other_description']);
            unset($spotDetail['spot_Introduction']);

            /*****  景区中的景点   *****/
            $where_condition['scenic_name'] = $spot_name;
            $cultural_spot = Db::name('Cultural_spot')->where($where_condition)->select();
            $culturalResult = json_decode($cultural_spot,true);
            if($culturalResult)
            {
                foreach($culturalResult as &$cultural)
                {
                    if(!empty($cultural['pic']))
                    {
                        $image =json_decode($cultural['pic'],true);  
                        foreach($image as $key => &$img_value)
                        {
                            $cultural['img_url'] = cmf_get_image_preview_url($img_value['url']); 
                        }
                        unset($cultural['pic']);
                    }

                    unset($cultural['picture2']);
                    $cultural['introduction'] = htmlchars($cultural['spot_Introduction']);
                    unset($cultural['spot_Introduction']);
                }
            }
            $result['spot'] =  $spotDetail;    //景区里的简要介绍
            $result['tuijian'] = $tuijian;     //景区中的附近推荐
            $result['cultural'] = $culturalResult; //景区中的景点
        }
        
        //2F 景点详情
        if($this_floor_index == 1){
            $localDetail = Db::name('Describe')->where($where)->find();
            $localDetail['release_time'] = date('Y-m-d', $localDetail['update_time']);
            if(isset($localDetail['suit_season']))
            {
                if($localDetail['suit_season'] == '1,2,3,4,5,6,7,8,9,10,11,12')
                {
                    $localDetail['suit_season'] = '1-12月';
                }else{
                    if(strstr($localDetail['suit_season'], '月')){
                        if($localDetail['suit_season'] == '-月'){
                            $localDetail['suit_season'] = '暂无';
                        }else{
                            $localDetail['suit_season'] = $localDetail['suit_season'];
                        }
                    }else{
                         $localDetail['suit_season'] = substr($localDetail['suit_season'],0,strpos( $localDetail['suit_season'], ',')).'-'.trim(strrchr($localDetail['suit_season'], ','),',').'月';  
                    }
                }
            }else{
                $localDetail['suit_season'] = '暂无';
            }
            //景点封面图片 cover
            if(!empty($localDetail['picture2']))
            {
                $cover_pic = json_decode($localDetail['picture2'],true);
                foreach($cover_pic as $k => &$pic_value)
                {
                    //common.php中封装的图片url解析方法
                    $localDetail['image_url'][$k]= cmf_get_image_preview_url($pic_value['url']); 
                    $localDetail['image_name'][$k]= substr($pic_value['name'],0,strpos($pic_value['name'], '.'));
                    $pp['url'] = $localDetail['image_url'][$k];
                    $pp['name'] = $localDetail['image_name'][$k];
                    $localDetail['image'][$k] = $pp;
                }
                unset($localDetail['picture2']);
            }
            //文字描述中的html标签转化成实体
            $localDetail['introduction'] = htmlchars($localDetail['spot_Introduction']);
            unset($localDetail['spot_Introduction']);
            $localDetail['qita_description'] = htmlchars($localDetail['other_description']);
            unset($localDetail['other_description']);
            unset($localDetail['pic']);
            $result['spot'] =  $localDetail;    //景区里的简要介绍
            $result['tuijian'] = $tuijian;     //景区中的附近推荐
        }
        
        //3F 景点详情
        if($this_floor_index == 2){
            $nightDetail = Db::name('Night')->where($where)->find();
            $nightDetail['release_time'] = date('Y-m-d', $nightDetail['update_time']);
            if(isset($nightDetail['suit_season']))
            {
                if($nightDetail['suit_season'] == '1,2,3,4,5,6,7,8,9,10,11,12')
                {
                    $nightDetail['suit_season'] = '1-12月';
                }else{
                    if(strstr($nightDetail['suit_season'], '月')){
                        if($nightDetail['suit_season'] == '-月'){
                            $nightDetail['suit_season'] = '暂无';
                        }else{
                            $nightDetail['suit_season'] = $nightDetail['suit_season'];
                        }
                    }else{
                        $nightDetail['suit_season'] = substr($nightDetail['suit_season'],0,strpos($nightDetail['suit_season'], ',')).'-'.trim(strrchr($nightDetail['suit_season'], ','),',').'月'; 
                    }
                }
            }else{
                $nightDetail['suit_season'] = '暂无';
            }
            //景点封面图片 cover
            if(!empty($nightDetail['picture2']))
            {
                $cover_pic = json_decode($nightDetail['picture2'],true);
                foreach($cover_pic as $k => &$pic_value)
                {
                    //common.php中封装的图片url解析方法
                    $nightDetail['image_url'][$k]= cmf_get_image_preview_url($pic_value['url']); 
                    $nightDetail['image_name'][$k]= substr($pic_value['name'],0,strpos($pic_value['name'], '.'));
                    $pp['url'] = $nightDetail['image_url'][$k];
                    $pp['name'] = $nightDetail['image_name'][$k];
                    $nightDetail['image'][$k] = $pp;
                }
                unset($nightDetail['picture2']);
            }
            $result['spot'] =  $nightDetail;    //景区里的简要介绍
            $result['tuijian'] = $tuijian;     //景区中的附近推荐
        }
        
        //4F 美食街区景点详情
        if($this_floor_index == 3 && $this_type == '美食街区'){
             $courtInfo = Db::name('Food_court')->where(array('city_id'=>$city_id,'food_court_name'=>$spot_name))->find();
            //景点封面图片 cover
            if(!empty($courtInfo))
            {
                if(!empty($courtInfo['picture2']))
                {
                    $cover_pic = json_decode($courtInfo['picture2'],true);
                    foreach($cover_pic as $k => &$pic_value)
                    {
                        //common.php中封装的图片url解析方法
                        $courtInfo['image_url'][$k]= cmf_get_image_preview_url($pic_value['url']); 
	                    $courtInfo['image_name'][$k]= substr($pic_value['name'],0,strpos($pic_value['name'], '.'));
	                    $pp['url'] = $courtInfo['image_url'][$k];
	                    $pp['name'] = $courtInfo['image_name'][$k];
	                    $courtInfo['image'][$k] = $pp; 
                    }
                    unset($courtInfo['picture2']);
                }
                
                $courtInfo['spot_name'] = $courtInfo['food_court_name'];
                //文字描述中的html标签转化成实体
                $courtInfo['introduction'] = htmlchars($courtInfo['court_Introduction']);
                unset($courtInfo['court_Introduction']);
                $courtInfo['qita_description'] = htmlchars($courtInfo['other_description']);
                unset($courtInfo['other_description']);
                unset($courtInfo['pic']);
                $courtInfo['release_time'] = date('Y-m-d', $courtInfo['update_time']);
            }
            if(!empty($courtInfo)){
                $result['spot'] = $courtInfo; 
            }
        }

        //5F 景点详情
       if($this_floor_index == 4){
            $where2['shopping_name'] = $spot_name;
            $shopDetail = Db::name('shopping_streets')->where($where2)->find();
            $shopDetail['release_time'] = date('Y-m-d', $shopDetail['update_time']);
            //景点封面图片 cover
            if(!empty($shopDetail['picture2']))
            {
                $cover_pic = json_decode($shopDetail['picture2'],true);
                foreach($cover_pic as $k => &$pic_value)
                {
                    //common.php中封装的图片url解析方法
                    $shopDetail['image_url'][$k]= cmf_get_image_preview_url($pic_value['url']); 
                    $shopDetail['image_name'][$k]= substr($pic_value['name'],0,strpos($pic_value['name'], '.'));
                    $pp['url'] = $shopDetail['image_url'][$k];
                    $pp['name'] = $shopDetail['image_name'][$k];
                    $shopDetail['image'][$k] = $pp;
                }
                unset($shopDetail['picture2']);
            }
            //文字描述中的html标签转化成实体
            if(isset($shopDetail['shopping_Introduction'])){
                $shopDetail['introduction'] = htmlchars($shopDetail['shopping_Introduction']);
                unset($shopDetail['shopping_Introduction']);
            }

           if(isset($shopDetail['other_description'])) {
                $shopDetail['qita_description'] = htmlchars($shopDetail['other_description']);
                unset($shopDetail['other_description']);
            }
            $shopDetail['spot_name'] = $shopDetail['shopping_name'];
            unset($shopDetail['pic']);
            /*** 特色商品 ***/
            $goodinfoList = Db::name('goods_info')->where(array('city_id'=>$city_id,'type'=>$this_type,'store_name'=>$spot_name))->select();
            $goodinfoResult = json_decode($goodinfoList,true);
            foreach($goodinfoResult as $key2=>&$goodinfo)
            {
                if(!empty($goodinfo['pic']))
                {
                    $cover_pic = json_decode($goodinfo['pic'],true);
                    foreach($cover_pic as $k => &$pic_value)
                    {
                        //common.php中封装的图片url解析方法
                        $goodinfo['image_url']= cmf_get_image_preview_url($pic_value['url']); 
                    }
                    unset($goodinfo['pic']);
                }
            }
            $result['spot'] = $shopDetail;    //景区里的简要介绍
            $result['features_goods'] = $goodinfoResult;   //本土特产、土特产店、购物商圈中的特色商品
        }
        
        //7F 景点详情
       if($this_floor_index == 6){
            $city_id = $post['city_id'];
            $where3['spot_name'] = $spot_name;
            $where3['city_id'] = $city_id;
            $New_spot = Db::name('New_spot')->where($where3)->find();

            $New_spot['release_time'] = date('Y-m-d', $New_spot['creat_time']);
            //适玩季节
            if(isset($New_spot['suit_season']))
            {
                if($New_spot['suit_season'] == '1,2,3,4,5,6,7,8,9,10,11,12')
                {
                    $New_spot['suit_season'] = '1-12月';
                }else{
                    if(strstr($New_spot['suit_season'], '月')){
                        if($New_spot['suit_season'] == '-月'){
                            $New_spot['suit_season'] = '暂无';
                        }else{
                            $New_spot['suit_season'] = $New_spot['suit_season'];
                        }
                    }else{
                         $New_spot['suit_season'] = substr( $New_spot['suit_season'],0,strpos( $New_spot['suit_season'], ',')).'-'.trim(strrchr($New_spot['suit_season'], ','),',').'月';  
                    }
                }
            }else{
                $New_spot['suit_season'] = '暂无';
            }

            //景点封面图片 cover
            if(!empty($New_spot['picture2']))
            {
                $cover_pic = json_decode($New_spot['picture2'],true);
                $New_spot['image_url'] = $cover_pic;
                foreach($cover_pic as $k => &$pic_value)
                {
                    $nameurl[$k]['name']  = substr($pic_value,-10);
                    $nameurl[$k]['url']  = $pic_value;
                    $New_spot['image_name'][$k]= substr($pic_value,-10);
                    $New_spot['image'] = $nameurl;
                }
                unset($New_spot['picture2']);
            }

            //文字描述中的html标签转化成实体
            $New_spot['introduction'] = htmlchars($New_spot['spot_Introduction']);
             $New_spot['type'] = '我的景点';
            unset($New_spot['spot_Introduction']);
            $New_spot['description'] = htmlchars($New_spot['other_description']);
            unset($New_spot['spot_Introduction']);
            $result = array();
            $result['spot'] =  $New_spot;    //景区里的简要介绍
            $result['tuijian'] = $tuijian;     //景区中的附近推荐
        }
       
        if(!empty($result)){
             $return = array('status'=>true,'msg'=>'请求成功','data'=>$result);
        }else{
             $return = array('status'=>false,'msg'=>'请求失败','data'=>[]);
        }
        echo json_encode($return,JSON_UNESCAPED_UNICODE);
    }
    
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
    //电子书模式,行程单数据
    public function BooksData()
    {
        session_start();
        $uid = $_POST['uid'];    //制作行程单人的id
        $collect_uid = $_POST['collect_uid'];  //登录人的uid
        $trip_id = $_POST['trip_id'];

        $_SESSION['trip_id'] = $trip_id;   //防止本行程单返回链接
        $user= Db::name('customer')->where(array('uid'=>$uid))->field('uid,user_name,head_port')->find();

        $trip_info = Db::name('trip_info')->where(array('uid'=>$uid,'trip_id'=>$trip_id))->find();

        $city_line = Db::name('city_line')->where(array('uid'=>$uid,'trip_id'=>$trip_id))->find();
        $traffic_money = Db::name('traffic_money')->where(array('uid'=>$uid,'trip_id'=>$trip_id))->find();
        $hotel = Db::name('hotel')->where(array('uid'=>$uid,'trip_id'=>$trip_id))->find();
        $eat_money = Db::name('eat_money')->where(array('uid'=>$uid,'trip_id'=>$trip_id))->find();
        $plan_info = Db::name('plan_info')->where(array('uid'=>$uid,'trip_id'=>$trip_id))->find();
        if(isset($trip_info)){
             //行程概览
            $lastResult['status']  = $trip_info['status'];   //是否发布的状态(0-未发布，1-已发布，2-审核通过) 
            //手机端制作的的缺少的数据处理一下 
            $goInfo = json_decode($trip_info['go_city_array'],true); 
            foreach($goInfo as $key=>&$goValue)
            {
                if(!isset($goValue['city_date2']))
                {
                    $a = ($goValue['city_daynum']-1).'day';  
                    $city_date = str_replace('.','-',$goValue['city_date']);
                    $goValue['city_date2'] =  date('Y-m-d',strtotime("$city_date+$a"));
                    $uu1 = str_replace(".","-",$goValue['city_date']);
                    $goValue['city_time_1'] = str_replace('-','.',substr($city_date,strpos($city_date,'-')+1)); 
                    $goValue['city_time_2'] = str_replace('-','.',substr($goValue['city_date2'],strpos($goValue['city_date2'],'-')+1));
                }
            }
            $std = 0; 
            $lencity = count($goInfo);
            if(!isset($goInfo[0]['city_d_1']))
            {
                for($i=0;$i<$lencity;$i++)
                {
                    $std = $std + 1;
                    $goInfo[$i]['city_d_1'] = $std; //每个城市游玩的初始天
                    $std = $std+($goInfo[$i]['city_daynum']-1);
                    $goInfo[$i]['city_d_2'] = $std; //每个城市游玩的结束天
                }
            }
            $lastResult['gailan']['go_city_array'] = $goInfo;
            // $lastResult['gailan']['go_city_array'] = json_decode($trip_info['go_city_array'],true);  

            $lastResult['gailan']['adult']  = $trip_info['adult'];
            //如果用户自己编写了行程单的标题，使用此此标题；若没有编写，使用默认标题
            if(!empty($trip_info['travel_title']))
            {
                unset($trip_info['trip_name']);
                $lastResult['gailan']['trip_name'] = $trip_info['travel_title'];
            }else{
                $lastResult['gailan']['trip_name']  = $trip_info['trip_name'];
            }
            $lastResult['gailan']['whe_hide']  = $trip_info['whe_hide']; //是否隐藏费用清单（默认0不隐藏，1隐藏）
            $lastResult['gailan']['collect_num']  = $trip_info['collect_num'];
            $lastResult['gailan']['like_num']  = $trip_info['like_num'];
            $lastResult['gailan']['click_num']  = $trip_info['click_num'];
            $lastResult['gailan']['user_name']  = $user['user_name'];
            $lastResult['gailan']['head_port']  = $user['head_port'];
            $lastResult['gailan']['children']  = $trip_info['children'];
            $lastResult['gailan']['date']  = $trip_info['date'];
            $lastResult['gailan']['day_num']  = $trip_info['day_num'];
            $lastResult['gailan']['departure_city']  = $trip_info['departure_city'];
            $lastResult['gailan']['return_city']  = $trip_info['return_city']; 
            
            $tempreturn = json_decode($trip_info['return_cityInfo'],true); 
            //手机端制作的行程单，返回的交通时间没有计算
            if($tempreturn['flightTime'] == ''){
                $tempreturn['flightTime'] = ' ';
                $tempreturn['trainTime'] = ' ';
                $tempreturn['busTime'] = ' ';
                $tempreturn['trafficTime'] = ' ';
            }
            $lastResult['gailan']['return_cityInfo'] = $tempreturn; 
            // print_r($lastResult['gailan']['return_cityInfo']);
            // exit;
            $lastResult['gailan']['hotelSum']  = $trip_info['hotelSum'];
            $lastResult['gailan']['dep_lng']  = $trip_info['dep_lng'];
            $lastResult['gailan']['dep_lat']  = $trip_info['dep_lat'];
            $lastResult['gailan']['creat_time']  = date("Y-m-d",$trip_info['creat_time']); 
           
            if(!empty($trip_info['cover']))
            {
                if(strstr($trip_info['cover'], 'http')){
                    $lastResult['gailan']['image_cover'] = $trip_info['cover'];
                }else{
                    $ab ='http://';
                    $lastResult['gailan']['image_cover'] = $ab.$_SERVER['HTTP_HOST'].$trip_info['cover'];   
                }     
            }else{
                //封面
                if(isset($plan_info))
                {
                    $plan_info['info'] = unserialize(base64_decode($plan_info['schedufing']));
                    $plan_info['info'] = json_decode(json_encode($plan_info['info']),true);
                    // print_r($plan['info']);
                    foreach($plan_info['info'] as $info)
                    {
                        foreach($info['day_arry'] as $arr)
                        {
                            if(!empty($arr['day']))
                            {
                                foreach($arr['day'] as $jing)
                                {
                                    $plan_info['jindian'][] = $jing['this_name'];
                                    if(!empty( $jing['info']['spot_image_url']))
                                    {
                                        $image_cover = $jing['info']['spot_image_url'];
                                    }
                                }
                            }
                        }
                    }
                }
                if(isset($image_cover)){
                    $lastResult['gailan']['image_cover'] = $image_cover;   
                }else{
                     $lastResult['gailan']['image_cover'] = ''; 
                }
            }
            //由于之前的单中的缺少一些后期添加的字段
            //在这个时间2018/12/19 18:00之前的单不让编辑，只可以查看；之后的单可以查看，可以编辑
            if($trip_info['creat_time'] > 1545213633)
            {
                $lastResult['gailan']['old_new'] = 'new';
            }else{
                $lastResult['gailan']['old_new'] = 'old';
            }
            //城市线路
            $lastResult['xianlu']['list'] = json_decode($city_line['list'],true);         
            $lastResult['xianlu']['return_date'] = $city_line['return_date'];
            $lastResult['xianlu']['dep_lat'] = $trip_info['dep_lat'];
            $lastResult['xianlu']['dep_lng'] = $trip_info['dep_lng'];
            $lastResult['xianlu']['ret_lat'] = $trip_info['ret_lat'];
            $lastResult['xianlu']['ret_lng'] = $trip_info['ret_lng'];

            $lastResult['traffic_money'] = json_decode($traffic_money['traffic_money'],true);     //交通费用
            $lastResult['allhotel'] = json_decode($trip_info['allhotel'],true);     //选择的酒店，按照日期排列
              
            if(isset($hotel)) { 
                $lastResult['hotel_money'] = json_decode($hotel['hotel_info'],true); //酒店费用
            }      
            if(isset($eat_money['eat_money'])) { 
                $eatData = json_decode($eat_money['eat_money'],true);
                foreach($eatData as &$eatValue)
                {
                    if(isset($eatValue['this_name'])){$eatValue['name'] = $eatValue['this_name'];}
                }
                $lastResult['eat_money'] = $eatData;  //餐饮费用
                
                // $lastResult['eat_money'] = json_decode($eat_money['eat_money'],true);  //餐饮费用
            } 
            if(isset($eat_money['way_money'])){
                $lastResult['way_money'] = json_decode($eat_money['way_money'],true);      //接机费用  
            }
           

            //城市知名景点、特色美食，特色商品，城市交通 (反序列化之前的数据)
            if(isset($plan_info['schedufing']))
            {
                $scheduf = unserialize(base64_decode($plan_info['schedufing']));
                $scheduf = json_decode(json_encode($scheduf),true); 
            }
            if(isset($scheduf))
            {
                foreach($scheduf  as &$ss)
                {
                    foreach($ss['day_arry'] as &$gcb){
                        if(isset($gcb['hotel']['ThumbNailUrl'])){
                            if(is_array($gcb['hotel']['ThumbNailUrl'])){
                                // echo 4;
                                $gcb['hotel']['ThumbNailUrl'] = implode($gcb['hotel']['ThumbNailUrl']);
                            }
                        }
                    }
                    $famous_spot = Db::name('Famous_spot')->where(array('city_name'=>$ss['this_city']))->select()->toArray();
                    foreach ($famous_spot as $key => $value) {
                        $arr1[] = $value['spot_name'];
                    }
                    if(isset($arr1))
                    {
                        $famous = implode(',',$arr1);
                        $ss['famous_spot'] = $famous;
                    }else{
                        $ss['famous_spot'] = '';
                    }
                   
                    $special_food = Db::name('Special_food')->where(array('city_name'=>$ss['this_city']))->select()->toArray();
                    foreach ($special_food as $key => $value) {
                        $arr2[] = $value['dishes_name'];
                    }
                    if(isset($arr2))
                    {
                        $food = implode(',',$arr2);
                        $ss['special_food'] = $food;
                    }else{
                        $ss['special_food'] = '';
                    }
                
        
                    $special_goods = Db::name('Special_goods')->where(array('city_name'=>$ss['this_city']))->select()->toArray();
                    foreach ($special_goods as $key => $value) {
                        $arr3[] = $value['goods_name'];
                    }
                    if(isset($arr3))
                    {
                        $goods = implode(',',$arr3);
                        $ss['special_goods'] = $goods;
                    }else{
                        $ss['special_goods'] = '';
                    }
                  
        
                    $city_traffic = Db::name('City_traffic')->where(array('city_name'=>$ss['this_city']))->select()->toArray();
                    foreach ($city_traffic as $key => $value) {
                        if($value['traffic_type'] == 'plane')
                        {
                            $arr4[] = $value['traffic_name'];
                        }
                        if($value['traffic_type'] == 'train')
                        {
                            $arr5[] = $value['traffic_name'];
                        }
                    }
                    if(isset($arr4))
                    {
                        $plane = implode(',',$arr4);
                        $ss['plane'] = $plane;
                    }else{
                        $ss['plane'] = '';
                    }
                    if(isset($arr5))
                    {
                        $train = implode(',',$arr5);
                        $ss['train'] = $train;
                    }else{
                        $ss['train'] = '';
                    }
                }
                $lastResult['Schedufing'] = $scheduf;       //日程安排
            }
           
            

            //收藏
            $collect = Db::name('Collect')->where(array('collect_user'=>$collect_uid,'collect_id'=>$trip_id))->find();
            if(!empty($collect))
            {
                $lastResult['collect_status'] = 'collected';
            }else{
                $lastResult['collect_status'] = 'no_collect';
            }
            //喜欢
            $carefor = Db::name('Like')->where(array('collect_uid'=>$collect_uid,'trip_id'=>$trip_id))->find();
            if(!empty($carefor))
            {
                $lastResult['like_status'] = 'liked';
            }else{
                $lastResult['like_status'] = 'no_like';
            }
            //点击量
            Db::name('trip_info')->where(array('uid'=>$uid,'trip_id'=> $trip_id))->setInc('click_num',1);
            Db::name('plan_info')->where(array('uid'=>$uid,'trip_id'=> $trip_id))->setInc('click_num',1);
            // print_r($lastResult);
            
            //本人是否已经复制过此行程单
            $rel = Db::name('trip_info')->where(array('uid'=>$collect_uid,'p_trip_id'=>$trip_id))->find();
            if(empty($rel))
            {
                $lastResult['copy_status'] = 'no_copy';
            }else{
                $lastResult['copy_status'] = 'copied';
            }
            //海报的信息
            $field = array('id','trip_id','poster_name','team_number','team_price','departure_date','logo','agency','remarks');
            $poster = Db::name('Poster')->field($field)->where(array('trip_id'=>$trip_id))->find();
            if($poster)
            {
                $poster['departure_date'] = $poster['departure_date'];
                $lastResult['posterData'] = $poster;
            }else{
                $lastResult['posterData'] = '';
            }
           

            if(isset($lastResult))
            {
                $return = $lastResult;
            }else{
                $return = array();
            }
             $result = $return;
        }else{
            $result = array('status'=>false,'msg'=>'该行程单已不存在','data'=>[]);
        }
        echo json_encode($result,JSON_UNESCAPED_UNICODE);
    }
    
    //日历模式中展示行程单备注
    public function RemarksData(){
        $post = $_POST;
        $trip_id = $post['trip_id'];  
        $result = Db::name('Poster')->where(array('trip_id'=>$trip_id))->find();
        if($result)
        {
            $return = array('status'=>true,'msg'=>'行程单备注','data'=>$result);
        }else{
            $return = array('status'=>true,'msg'=>'行程单备注为空','data'=>[]);
        }
        echo json_encode($return,JSON_UNESCAPED_UNICODE);
    }
    //日历模式中添加、修改行程单备注
    public function AddRemarks(){
        $post = $_POST;
        $data['trip_id'] = $post['trip_id'];
        //备注信息
        $data['remarks'] = $post['remarks'];  
        $isOr = Db::name('Poster')->where(array('trip_id'=>$post['trip_id']))->find();
        if($isOr){
            // 修改
            $result = Db::name('Poster')->where(array('trip_id'=>$post['trip_id']))->update($data);
        }else{
            // 添加
            $result = Db::name('Poster')->insert($data);
        }
        if(false !== $result)
        {
            $return = array('status'=>true,'msg'=>'请求成功');
        }else{
            $return = array('status'=>false,'msg'=>'请求失败');
        }
        echo json_encode($return,JSON_UNESCAPED_UNICODE);
    }
    //行程单页面 (上下拉动模式)
    public function tripInfo()
    {
        $url = 'http://'.$_SERVER['SERVER_NAME'].':'.$_SERVER["SERVER_PORT"].$_SERVER["REQUEST_URI"];

        //之前的url格式，暂时屏蔽
        // $array1 = explode('?', $url);
        // $array2 = explode('&', $array1[1]);
        // $uid = substr($array2[0],strpos($array2[0],'=')+1);
        // $trip_id = substr($array2[1],strpos($array2[1],'=')+1);

        $array2 = trim(strrchr($url, '/'),'/');
        $array3 = explode('.', $array2);
        $array4 = explode('-', $array3[0]);
        $uid = $array4[0];
        $trip_id = $array3[0];

        $trip_info = Db::name('trip_info')->field('uid,trip_id,trip_name,day_num')->where(array('uid'=>$uid,'trip_id'=>$trip_id))->find();

        $day_num = $trip_info['day_num'];
        $trip_name =substr($trip_info['trip_name'],0,strpos($trip_info['trip_name'], '行'));
        //截取城市
        $cityname = preg_replace('/^([^\d]+).*/', '$1', $trip_name);
        $nowY = date('Y',time());
        $citystring = ''.$cityname.''.$day_num.'日游';

        if(strstr($cityname, '.'))
        {
            $cityname = explode('.', $cityname);
            $v1="";
            $v2="";
            $v3="";
            $v4="";
            $v5="";
            $v6='';
            $v7= '';
            $v8='';
            $v9='';
            foreach($cityname as $key=>$c)
            {
                $v1 .= ''.$c.'3日游,';
                $v2 .= ''.$c.'哪里好玩,';
                $v3 .= ''.$c.'景点推荐,';
                $v4 .= ''.$c.'自由行,';
                $v5 .= ''.$c.'游记,';
                $v6 .= ''.$c.'旅游攻略,';
                $v7= '2019'.$c.'旅游攻略,';
                $v8=''.$c.'必吃必玩';
                
            }
            $v1 = substr($v1,0,strlen($v1)-1);
            $v2 = substr($v2,0,strlen($v2)-1);
            $v9.='私定行程-'.$citystring.'';
            $Keywords =  ' '.$citystring.','.$v6.','.$v5.','.$v3.','.$v2.','.$v1.','.$day_num.'日游 ';
            $title =  ' 定制游,'.$v9.','.$v8.','.$v7.','.$v5.'';
        }else{
            $te1="";
            $te2="";
            $te3="";
            $te4='';
            $te5='';
            $te6='';
            $te7= '';
            $te1 .=''.$cityname.'景点推荐,';
            $te2 .= ''.$cityname.'自由行,';
            $te3 .= ''.$cityname.'游记';
            $te4 .= ''.$cityname.'旅游攻略,';
            $te5 .= ''.$nowY.''.$cityname.'旅游攻略';
            $te6 .=''.$cityname.'必吃必玩';
            $te7 .= '私定行程-'.$citystring.'';

            $Keywords = ' '.$citystring.','.$te1.','.$te2.','.$te3.','.$te4.','.$cityname.'哪里好玩,'.$day_num.'日游';
            $title =  ' 定制游,'.$te7.','.$te5.','.$te6.','.$te3.' ';
        }
       

        $this->assign('Keywords',$Keywords);
        if(is_array($cityname)){$cityname = implode('.',$cityname);}
        $description = ''.$nowY.''.$cityname.'旅游攻略,介绍了'.$cityname.'旅游景点、线路、美食、住宿、地图等旅游攻略信息,智能导游，人工讲解，了解'.$cityname.'旅游等自由行攻略信息来袋鹿旅行。'.$cityname.'旅游, '.$cityname.'旅游必去景点, '.$cityname.'自助游,'.$cityname.'旅游行程';
        $this->assign('title',$title);
        $this->assign('description',$description);
        return $this->fetch();
    }

    public function tripinfoShare()
    {
        // eat_name_arry
        // if (strpos($_SERVER['HTTP_USER_AGENT'], 'MicroMessenger') !== false) {
        //     if(empty($_COOKIE['uid'])){
        //         $trip_id = input('get.trip');
        //         action('wap/getBaseInfo',['trip_id'=>$trip_id]);
        //     }
        // }
        $a = '还是';
        $this->assign('a',$a);
        return $this->fetch();
    }
     public function wxSignature(){
        $url = urldecode(input('post.url'));
        $nonce_str = '';
        $pattern = '1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLOMNOPQRSTUVWXYZ';    //字符池
        for($i=0; $i<20; $i++){
            $nonce_str .= $pattern{mt_rand(0,62)};    //生成php随机数
        }
        // echo $nonce_str."<br>";
        $timestamp = time();
        $app_id = 'wx7646596dc6e4f51a';
        $secret = '3eb9f29f4d9a0612bcee3fb5373cb33b';
        // $url = 'http://'.$_SERVER['HTTP_HOST'].$_SERVER['REQUEST_URI'];
        $data = json_decode(file_get_contents("https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=$app_id&secret=$secret"));
        // print_r($data);
        $data = json_decode(file_get_contents("https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=".$data->access_token."&type=jsapi"));
        $jsapi_ticket = $data->ticket;
        $signature = sha1("jsapi_ticket=".$jsapi_ticket."&noncestr=".$nonce_str."&timestamp=".$timestamp."&url=".$url);
        $result = array('app_id'=>$app_id,'secret'=>$secret,'timestamp'=>$timestamp,'nonce_str'=>$nonce_str,'signature'=>$signature);
        echo json_encode($result,JSON_UNESCAPED_UNICODE);
     }

    //发布行程
    public function publish_trip()
    { 
        $post = $_POST;
        // print_r($post);
        $uid = $post['uid'];
        $trip_id = $post['trip_id'];
        $where = array('uid'=>$uid,'trip_id'=>$trip_id);
        $data['status'] = 1;
        $data['submit_time'] = time();

        Db::name('trip_info')->where($where)->update($data);
        Db::name('city_line')->where($where)->update($data);
        Db::name('traffic_money')->where($where)->update($data);
        Db::name('hotel')->where($where)->update($data);
        Db::name('eat_money')->where($where)->update($data);
        Db::name('plan_info')->where($where)->update($data);

        $result = array('status'=>'ok');
        echo json_encode($result,JSON_UNESCAPED_UNICODE);

    }

    //收藏行程
    public function collect()
    {
        $uid = $_POST['uid'];
        $trip_id = $_POST['trip_id'];
        $collect_status = $_POST['collect_status'];

        $data['collect_user'] = $uid;
        $data['collect_id'] = $trip_id;
        $data['collect_table'] = 'trip';
        $data['collect_time'] = time();

        //收藏
        if($collect_status == 'no_collect')
        {
            if(Db::name('Collect')->insert($data))
            {
                Db::name('Trip_info')->where(array('trip_id'=>$trip_id))->setInc('collect_num',1);
                $result = array('status'=>'ok','msg'=>'收藏成功！');
            }
        }
        // 取消收藏
        if($collect_status == 'collected')
        {
            if(Db::name('Collect')->where(array('collect_id'=>$trip_id))->delete())
            {
                Db::name('Trip_info')->where(array('trip_id'=>$trip_id))->setDec('collect_num',1);
                $result = array('status'=>'ok','msg'=>'取消收藏成功！');
            }
        }
        echo json_encode($result,JSON_UNESCAPED_UNICODE);        
    }

    //喜欢行程
    public function CareFor()
    {
        $uid = $_POST['uid'];
        $uid_trip = $_POST['uid_trip'];
        $trip_id = $_POST['trip_id'];
        $like_status = $_POST['like_status'];

        $data['uid'] = $uid_trip;  //制作人uid
        $data['collect_uid'] = $uid;  //登录人uid

        $data['trip_id'] = $trip_id;
        $data['like_type'] = 'trip';
        $data['like_time'] = time();

        if($like_status == 'no_like')
        {
            if(Db::name('Like')->insert($data))
            {
                Db::name('Trip_info')->where(array('trip_id'=>$trip_id))->setInc('like_num',1);
                $result = array('status'=>'ok','msg'=>'点赞成功！');
            }
        }
        echo json_encode($result,JSON_UNESCAPED_UNICODE);    
    }

    //复制达人行程（可在自己的个人中心查看结果）
    public function CopyTrip()
    {
        $post = $_POST;

        $uid = $post['uid'];  //现在登录人的uid
        $them = $post['them']; //之前制作行程单的人的uid
        $trip_id = $post['trip_id'];  //之前的行程单号 

        //验证一下这个行程是否已经被本人复制过了
        $rel = Db::name('trip_info')->where(array('uid'=>$uid,'p_trip_id'=>$trip_id))->find();
        if(empty($rel))
        {
            $trip_info = Db::name('trip_info')->where(array('uid'=>$them,'trip_id'=>$trip_id))->find();
            $tripData['uid'] = $uid;
            $time = time();
            $tripId = $uid.'-'.$time;  //新的行程单号
            $tripData['trip_id'] = $tripId;
            $tripData['adult'] = $trip_info['adult'];
            $tripData['children'] = $trip_info['children'];
            //拼接行程单名称行程单名称
            $user = Db::name('Customer')->field('user_name')->where(array('uid'=>$uid))->find();
            $go_city_array = json_decode($trip_info['go_city_array'],true);
            foreach($go_city_array as $city){ $cityArray[] = $city['city_name'];}
            $cityString = implode('.',$cityArray);
            $citynum = count($cityArray);
            // $tripData['trip_name'] = $cityString. $citynum.'城市'.$trip_info['day_num'].'日游行程单';
            $tripData['trip_name'] = $user['user_name'].'的'.$cityString.$trip_info['day_num'].'日游行程单';

            $tripData['custom_title'] =$trip_info['custom_title'];
            $tripData['date'] = $trip_info['date'];
            $tripData['day_num'] = $trip_info['day_num'];

            $tripData['departure_city'] = $trip_info['departure_city'];
            $tripData['dep_lat'] = $trip_info['dep_lat'];
            $tripData['dep_lng'] =$trip_info['dep_lng'];
            $tripData['ret_lat'] =$trip_info['ret_lat'];
            $tripData['ret_lng'] = $trip_info['ret_lng'];
            $tripData['dis'] = $trip_info['dis'];
            $tripData['flightTime'] = $trip_info['flightTime'];
            $tripData['trainTime'] = $trip_info['trainTime'];
            $tripData['city_trc_name'] = $trip_info['city_trc_name'];
            $tripData['go_city_array'] = $trip_info['go_city_array'];
            $tripData['return_city'] =$trip_info['return_city'];
            $tripData['return_cityInfo'] = $trip_info['return_cityInfo'];
            $tripData['traffic_tools'] = $trip_info['traffic_tools'];
            $tripData['hotelSum'] = $trip_info['hotelSum'];
            $tripData['return_cityInfo'] = $trip_info['return_cityInfo'];
            $tripData['creat_time'] = $trip_info['creat_time'];
            $tripData['submit_time'] = 0;
            $tripData['pass_time'] = 0;
            $tripData['click_num'] = 0;
            $tripData['collect_num'] = 0;
            $tripData['like_num'] = 0;
            $tripData['p_trip_id'] = $trip_id;   //如果此行程是复制达人行程而来的，来源于达人的订单号
            $tripData['status'] = 0;
            
            if(Db::name('trip_info')->insert($tripData))
            {
                $tag1 = 1;
            }else{
                $tag1 =0;
            }

            $city_line = Db::name('city_line')->where(array('uid'=>$them,'trip_id'=>$trip_id))->find();
            if(isset($city_line))
            {
                $cityData['uid'] = $uid;
                $cityData['trip_id'] = $tripId;
                $cityData['list'] = $city_line['list'];
                $cityData['return_date'] = $city_line['return_date'];
                $cityData['creat_time'] = $city_line['creat_time'];
                $cityData['submit_time'] = 0;
                $cityData['pass_time'] = 0;
                $cityData['p_trip_id'] = $trip_id;
                $cityData['status'] = 0;

                if(Db::name('city_line')->insert($cityData))
                {
                    $tag2 = 1;
                }else{
                    $tag2 = 0;
                }
            }else{
                $tag2 = 1;
            }
        

            $traffic_money = Db::name('traffic_money')->where(array('uid'=>$them,'trip_id'=>$trip_id))->find();
            if(isset($traffic_money))
            {
                $trafficData['uid'] = $uid;
                $trafficData['trip_id'] = $tripId;
                $trafficData['traffic_money'] = $traffic_money['traffic_money'];
                $trafficData['creat_time'] = $traffic_money['creat_time'];
                $trafficData['submit_time'] = 0;
                $trafficData['pass_time'] = 0;
                $trafficData['p_trip_id'] = $trip_id;
                $trafficData['status'] = 0;
                if(Db::name('traffic_money')->insert($trafficData))
                {
                    $tag3 = 1;
                }else{
                    $tag3 = 0;
                }
            }else{
                $tag3 = 1;
            }

            $hotel = Db::name('hotel')->where(array('uid'=>$them,'trip_id'=>$trip_id))->find();
            if(isset($hotel))
            {
                $hotelData['uid'] = $uid;
                $hotelData['trip_id'] = $tripId;
                $hotelData['hotel_info'] = $hotel['hotel_info'];
                $hotelData['creat_time'] = $hotel['creat_time'];
                $hotelData['submit_time'] = 0;
                $hotelData['pass_time'] =0;
                $hotelData['p_trip_id'] = $trip_id;
                $hotelData['status'] = 0;
                if(Db::name('hotel')->insert($hotelData))
                {
                    $tag4 = 1;
                }else{
                    $tag4 = 0;
                }
            }else{
                $tag4 = 1;
            }
            $eat_money = Db::name('eat_money')->where(array('uid'=>$them,'trip_id'=>$trip_id))->find();
            if(isset($eat_money))
            {
                $eat_moneyData['uid'] = $uid;
                $eat_moneyData['trip_id'] = $tripId;
                $eat_moneyData['eat_money'] = $eat_money['eat_money'];
                $eat_moneyData['way_money'] = $eat_money['way_money'];
                $eat_moneyData['creat_time'] = $eat_money['creat_time'];
                $eat_moneyData['submit_time'] = 0;
                $eat_moneyData['pass_time'] =0;
                $eat_monryData['p_trip_id'] = $trip_id;
                $eat_moneyData['status'] = 0;
                if(Db::name('eat_money')->insert($eat_moneyData))
                {
                    $tag5 = 1;
                }else{
                    $tag5 = 0;
                }
            }else{
                $tag5 = 1;
            }
            $plan_info = Db::name('plan_info')->where(array('uid'=>$them,'trip_id'=>$trip_id))->find();
            $planData['uid'] = $uid;
            $planData['trip_id'] = $tripId;
            $planData['schedufing'] = $plan_info['schedufing'];
            $planData['creat_time'] = $plan_info['creat_time'];
            $planData['submit_time'] = 0;
            $planData['pass_time'] =0;
            $planData['p_trip_id'] = $trip_id;
            $planData['status'] = 0;
            if(Db::name('plan_info')->insert($planData))
            {
                $tag6 = 1;
            }else{
                $tag6 = 0;
            }
            if($tag1 == 1 && $tag2 == 1 && $tag3 == 1 && $tag4 == 1 && $tag5 == 1 && $tag6 == 1)
            {
                $result = array('status'=>true,'msg'=>'请求成功','data'=>array());
            }else{
                $result = array('status'=>false,'msg'=>'请求失败','data'=>array());
            }
        }else{
                $result = array('status'=>'true','msg'=>'已经复制过了','data'=>array());
        }
        echo json_encode($result,JSON_UNESCAPED_UNICODE);
    }

    //评论模板页
    public function tripComment()
    {
        return $this->fetch();
    }

    
    //h5页面行程单评论
    public function Discuss()
    {
        $post = $_POST;
        $trip_id = $post['trip_id'];
        $user_id = $post['uid'];
        $userData = Db::name('Customer')->field('user_name')->where(array('uid'=>$user_id))->find();
        $user_name = $userData['user_name'];
        $content = $post['comment_text'];

        $image = [];
        if(isset($_FILES['file']))
        {
            $files = $_FILES['file']; //图片文件

            //创建指定路径
            $fileName = $_SERVER['DOCUMENT_ROOT']."/upload/portal/commentImage/".date('Ymd').'/';
            if(!file_exists($fileName)){
                //进行文件创建
                mkdir($fileName,0777,true);
            }
            if(is_array($files['tmp_name'])){
                foreach($files['tmp_name'] as $key => $value){
                    $pattern = '1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLOMNOPQRSTUVWXYZ';    //字符池
                    $noncestr = '';
                    for($i=0; $i<10; $i++){
                        $noncestr .= $pattern{mt_rand(0,62)};    //生成php随机数
                    }
                    $name = time().$noncestr;
                    //进行名称的拼接
                    $imgName = $fileName.$name.'.png';
                    //获取上传数据并写入
                    $result = move_uploaded_file($value,$imgName);
                    if($result){
                        array_push($image,'http://'.$_SERVER['HTTP_HOST']."/upload/portal/commentImage/".date('Ymd').'/'.$name.'.png');
                    }else{
                        exit(json_encode(['status'=>false,'msg'=>'图片上传失败'],JSON_UNESCAPED_UNICODE));
                    }
                }
            }
        }
        
        $data['user_id'] = $user_id;
        $data['user_name'] = $user_name;
        $data['content'] = $content;
        $data['view_id'] = $trip_id;
        $data['image_url'] = json_encode($image);
        $data['type'] = 'trip';
        $data['create_time'] = time();

        $result = Db::name('comment')->insert($data);
        if($result){
            echo json_encode(['status'=>true,'msg'=>'评价成功'],JSON_UNESCAPED_UNICODE);
        }else{
            echo json_encode(['status'=>false,'msg'=>'评价失败'],JSON_UNESCAPED_UNICODE);
        }
    }


    //获取H5评论
    public function HoldComment()
    {
        vendor('Page.system_page'); //分页
        $post = $_POST;
        $p = isset($post['page'])?$post['page']:1;
        // $p = 1;
        $trip_id = $post['trip_id'];
        // $trip_id = '38-1551166195';
        $where['view_id'] = $trip_id;
        $data = DB::name('comment')->where($where)->page($p.',5')->order('create_time desc')->select()->toArray();
        $count = DB::name('comment')->where($where)->count();
        foreach ($data as $key => &$value) {
            $value['image_url'] = json_decode($value['image_url']);
            $value['createTime'] =  date("Y-m-d H:i",$value['create_time']);
            $userData = Db::name('Customer')->field('user_name,head_port')->where(array('uid'=>$value['user_id']))->find();
            // if(!empty($userData['head_port'])){
            //     $ab ='http://';
            //     $head_port = $ab.$_SERVER['HTTP_HOST'].$userData['head_port']; 
            // }else{
            //     $head_port = $userData['head_port'];
            // }
            $head_port = $userData['head_port'];
            $value['head_port'] = $head_port;
            $value['user_name'] = $userData['user_name'];
        }
        if($data)
        {
            $result = array('status'=>true,'msg'=>'请求成功','data'=>$data,'count'=>$count);
        }else{
            $result = array('status'=>false,'msg'=>'请求失败','data'=>array(),'count'=>0);
        }
        echo json_encode($result,JSON_UNESCAPED_UNICODE);
    }

    //h5行程详情
    public function tripDetail()
    {
        return $this->fetch();
    }
    //地图日程页面
    public function tripMap()
    {
        return $this->fetch();
    }
    public function tripEdit()
    {
        return $this->fetch();
    }
    public function spotComment()
    {
        return $this->fetch();
    }
    //h5导出pdf
     public function tripinfoSharePdf()
    {
        return $this->fetch();
    }
    //h5酒店详情
     public function hotelDetail()
    {
        return $this->fetch();
    }
    public function mtripEdit()
    {
        return $this->fetch();
    }
    
    
    //日历模式/个人中心，点击修改行程
    public function ModifyTrip()
    {
        session_start();
        //在做编辑之前，清空之前所有的session
        unset($_SESSION['citysession'],$_SESSION['allhotel'],$_SESSION['timeInterval'],$_SESSION['cityResult'],$_SESSION['across_city']);
//        session_destroy();
        
        $uid = $_POST['uid'];
        $trip_id = $_POST['trip_id'];

        $trip_info = Db::name('trip_info')->where(array('uid'=>$uid,'trip_id'=>$trip_id))->find();
        $city_line = Db::name('city_line')->where(array('uid'=>$uid,'trip_id'=>$trip_id))->find();
        $traffic_money = Db::name('traffic_money')->where(array('uid'=>$uid,'trip_id'=>$trip_id))->find();
        $hotel = Db::name('hotel')->where(array('uid'=>$uid,'trip_id'=>$trip_id))->find();
        $eat_money = Db::name('eat_money')->where(array('uid'=>$uid,'trip_id'=>$trip_id))->find();
        $plan_info = Db::name('plan_info')->where(array('uid'=>$uid,'trip_id'=>$trip_id))->find();
        //存到session
        $_SESSION['trip_info'] = $trip_info;  
        $_SESSION['city_line'] = $city_line;  
        $_SESSION['plan_info'] = $plan_info;
        $_SESSION['allhotel'] = $trip_info['allhotel']; 
        if(isset($hotel)){
            $_SESSION['hotel'] = $hotel; 
        }
        if(isset($traffic_money)){
            $_SESSION['traffic_money'] =$traffic_money;  
        }
        if(isset($eat_money)){
            $_SESSION['eat_money'] = $eat_money;  
        }

        //手机端制作的的缺少的数据处理一下 
        $goInfo = json_decode($trip_info['go_city_array'],true); 
        foreach($goInfo as $key=>&$goValue)
        {
            if(!isset($goValue['city_date2']))
            {
                $a = ($goValue['city_daynum']-1).'day';  
                $city_date = str_replace('.','-',$goValue['city_date']);
                $goValue['city_date2'] =  date('Y-m-d',strtotime("$city_date+$a"));
                $uu1 = str_replace(".","-",$goValue['city_date']);
                $goValue['city_time_1'] = str_replace('-','.',substr($city_date,strpos($city_date,'-')+1)); 
                $goValue['city_time_2'] = str_replace('-','.',substr($goValue['city_date2'],strpos($goValue['city_date2'],'-')+1));
            }
            if(!isset($goValue['provinceNames'])){
                $citytopro = Db::name('City_details')->field('province_name')->where(array('city_name'=>$goValue['city_name']))->find();
                $goValue['provinceNames'] = $citytopro['province_name'];
            } 
        }
        $std = 0; 
        $lencity = count($goInfo);
        if(!isset($goInfo[0]['city_d_1']))
        {
            for($i=0;$i<$lencity;$i++)
            {
                $std = $std + 1;
                $goInfo[$i]['city_d_1'] = $std; //每个城市游玩的初始天
                $std = $std+($goInfo[$i]['city_daynum']-1);
                $goInfo[$i]['city_d_2'] = $std; //每个城市游玩的结束天
            }
        }
        //主结构数据
        if(isset($plan_info['schedufing'])){
            $scheduf = unserialize(base64_decode($plan_info['schedufing']));
            $scheduf = json_decode(json_encode($scheduf),true); 
        }
//        print_r(json_decode($traffic_money['traffic_money'],true));
//        print_r($scheduf);
//        exit;
        
        /*** start-上个版本中缺少的字段补全 ***/
        foreach($scheduf as $key1=>&$scvalue){
            if(isset($scvalue['departure_date'])){
                $departure_date = $scvalue['departure_date'];
                if(!isset($year)){
                    $year = substr($departure_date,0,strpos($departure_date, '-'));
                }
            }elseif(isset($scvalue['formData']['date'])){
                $year = substr($scvalue['formData']['date'],0,strpos($scvalue['formData']['date'], '-'));
            }else{
                $year = '2019';
            }
            $len = count($scvalue['day_arry']);
            foreach($scvalue['day_arry'] as $key3=>&$nvalue){
                if(!isset($nvalue['betw_time'])){
                    $nvalue['betw_time'] = $nvalue['start_time'].'-'.$nvalue['end_time'];
                }
                if(!isset($nvalue['month_day'])){
                    if(isset($year)){
                        if(!isset($nvalue['of_date'])){
                            $nvalue['of_date'] = $year.'-'.str_replace('.','-',$nvalue['date']);
                        }   
                    }
                    $nvalue['month_day'] = str_replace('.','月',$nvalue['date']).'日';
                    $weeks = date("N",(strtotime($nvalue['of_date'])));
                    foreach($goInfo as $key2=>$fg){
                        if($key1 == $key2){
                            if($key3 == 0){
                                $nvalue['hotel_day'] = $fg['city_d_1'];
                            }
                            else{
                                $nvalue['hotel_day'] = $fg['city_d_1'] + $key3;
                            }
                        }
                    }
                    switch($weeks)
                    {
                        case 1:
                        $nvalue['weeks'] = '周一';
                        break;  
                        case 2:
                        $nvalue['weeks'] = '周二';
                        break;
                        case 3:
                        $nvalue['weeks'] = '周三';
                        break;
                        case 4:
                        $nvalue['weeks'] = '周四';
                        break;
                        case 5:
                        $nvalue['weeks'] = '周五';
                        break;
                        case 6:
                        $nvalue['weeks'] = '周六';
                        break;
                        case 7:
                        $nvalue['weeks'] = '周天';
                        default:
                    }
                }
                //开放时间
                if(isset($nvalue['day'])){
                    foreach($nvalue['day'] as &$hh){
                        if(!isset($hh['business_hours'])){
                            if(isset($hh['info']['business_hours'])){
                                $hh['business_hours'] = $hh['info']['business_hours'];
                            }
                        }
                        if(isset($hh['business_hours']) && $hh['business_hours'] == ''){
                            $hh['business_hours'] = '09:00 - 21:00';
                        }
                    }
                }
            }
        }
        /*** end-上个版本中缺少的字段补全 ***/
        //默认第一次取第一个城市的内容
        $firstcity = $scheduf[0];
       // print_r($trip_info);
        
        $r_spot['adult'] = $trip_info['adult'];
        $r_spot['children'] = $trip_info['children'];
        $r_spot['title'] = $trip_info['travel_title'];
        $r_spot['day_num']  = $trip_info['day_num'];
        $r_spot['cover']  = $trip_info['cover'];
        $r_spot['date']  = $trip_info['date'];
        $r_spot['across_city']  = 'false';
        $r_spot['next_city_day0']  = 'false';
        $r_spot['spot_data']['this_city_index'] = 0; //默认进来是第一个城市下标
        foreach($goInfo as &$cvf){
            if(!isset($cvf['lng'])){
                $cvf['lng'] = $cvf['position']['lng'];
                $cvf['lat'] = $cvf['position']['lat'];
            }
        }
        $r_spot['go_city_array']  = $goInfo;
        $r_spot['departure_city']['city_name'] = $trip_info['departure_city'];
        $r_spot['departure_city']['lat'] = $trip_info['dep_lat'];
        $r_spot['departure_city']['lng'] = $trip_info['dep_lng'];
        $r_spot['return_city']  =json_decode($trip_info['return_cityInfo']);
        foreach($goInfo as $key=>$goVa){
            $cityArray[$key] = $goVa['city_name'];
        }
        $r_spot['cityArray']  = $cityArray;
        
        //dayTime
//        foreach($firstcity['day_arry'] as $key=>$fistvalue){
//            $dayTime['betw_time'] = $fistvalue['betw_time'];
//            $dayTime['date'] = $fistvalue['date'];
//            $dayTime['hotel_day'] = $fistvalue['hotel_day'];
//            $dayTime['month_day'] = $fistvalue['month_day'];
//            $dayTime['of_date'] = $fistvalue['of_date'];
//            $dayTime['time1'] = $fistvalue['time1'];
//            $dayTime['time2'] = $fistvalue['time2'];
//            $r_spot['dayTime'][]  =$dayTime;
//        }

        $data['r_spot'] = $r_spot;
        $data['result'] = $firstcity;
//        print_r($_SESSION);
        if($data)
        {
            $return = array('status'=>true,'msg'=>'请求成功','data'=>$data);
        }else{
            $return = array('status'=>false,'msg'=>'请求失败','data'=>[]);
        }  
        // print_r($return);
        echo json_encode($return,JSON_UNESCAPED_UNICODE);
    }
    
    
    /* 多个城市之间相互切换，接收修改后的城市数据，计算整体日期，替换到session中
     * //查看行程单 (存到数据库)
     */
    public function MakeCity()
    {
        session_start();
//        print_r($_SESSION);
//        exit;  
        $info = $_SESSION;
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
        if(!empty($_SESSION['allhotel'])){
            $allhotel = json_decode($_SESSION['allhotel'],true); //已经选择的所有的酒店，按日期存储
        }else{
            $allhotel = array(); 
        }
        
        //上个城市数据
        $singcityData = $ccData['singcityData'];   
//        print_r($singcityData);
//        exit;
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
        
        $trip_info = $info['trip_info'];
        $plan_info = $info['plan_info'];
        $city_line = $info['city_line'];
//    print_r($mostnewHotel);
//    print_r($noHotel);
//    exit;
        //更新allhotel字段中的酒店数据
        if(!empty($mostnewHotel)){
            if(!empty($allhotel)){
                foreach($mostnewHotel as $mostValue){
                    foreach($allhotel as $allkey=>&$allValue){
                        if($mostValue['of_date'] == $allValue['of_date']){
                            $allhotel[$allkey] = $mostValue;
                        }
                    }
                }
                //删除allhotel中的某天酒店
                if(isset($noHotel)){
                    foreach($noHotel as $noValue){
                        foreach($allhotel as $yhkey=>&$yh){
                            if($yh['of_date'] == $noValue['of_date']){
                                unset($allhotel[$yhkey]);
                            }
                        }
                    }
                    $allhotel = array_merge($allhotel);
                }
                $resultHotel = $allhotel;
            }else{
                $resultHotel = $mostnewHotel;   //更新到allhotel字段中
            }
        }

         //主结构数据
        if(isset($plan_info['schedufing'])){
            $scheduf = unserialize(base64_decode($plan_info['schedufing']));
            $scheduf = json_decode(json_encode($scheduf),true); 
        }
       
        //1、替换已经修改过的城市数据,如果城市天数发生改变，所有城市，酒店日期重新计算
        //根据游玩总天数是否变化，判断后面的城市日期是否联动更新
        $go_city_array = $ccData['go_city_array'];
        //上个版本中缺少的字段补全
        foreach($scheduf as $key1=>&$bnvalue){
            if(isset($bnvalue['departure_date'])){
                 $departure_date = $bnvalue['departure_date'];
                if(!isset($year)){
                     $year = substr($departure_date,0,strpos($departure_date, '-'));
                }
            }elseif(isset($bnvalue['formData']['date'])){
                $year = substr($bnvalue['formData']['date'],0,strpos($bnvalue['formData']['date'], '-'));
            }else{
                $year = '2019';
            }
            $len = count($bnvalue['day_arry']);
            foreach($bnvalue['day_arry'] as $key3=>&$resl){
                if(!isset($resl['betw_time'])){
                    $resl['betw_time'] = $resl['start_time'].'-'.$resl['end_time'];
                }
                if(!isset($resl['month_day'])){
                    if(!isset($resl['of_date'])){
                         $resl['of_date'] = $year.'-'.str_replace('.','-',$resl['date']);
                    }
                    $resl['month_day'] = str_replace('.','月',$resl['date']).'日';
                    $weeks = date("N",(strtotime($resl['of_date'])));
                    foreach($go_city_array as $key2=>$fg){
                        if($key1 == $key2){
                            if($key3 == 0){
                                $resl['hotel_day'] = $fg['city_d_1'];
                            }
                            else{
                                $resl['hotel_day'] = $fg['city_d_1'] + $key3;
                            }
                        }
                    }
                    switch($weeks)
                    {
                        case 1:
                        $resl['weeks'] = '周一';
                        break;  
                        case 2:
                        $resl['weeks'] = '周二';
                        break;
                        case 3:
                        $resl['weeks'] = '周三';
                        break;
                        case 4:
                        $resl['weeks'] = '周四';
                        break;
                        case 5:
                        $resl['weeks'] = '周五';
                        break;
                        case 6:
                        $resl['weeks'] = '周六';
                        break;
                        case 7:
                        $resl['weeks'] = '周天';
                        default:
                    }
                }
                //开放时间
                if(isset($resl['day'])){
                    foreach($resl['day'] as &$mj){
                        if(!isset($mj['business_hours'])){
                            if(isset($mj['info']['business_hours'])){
                                $mj['business_hours'] = $mj['info']['business_hours'];
                            }
                        }
                    }
                }
            }
        }
        $this_city_index = $singcityData['this_city_index'];
        $oldday_num = $trip_info['day_num'];
        $newday_num = $ccData['day_num'];  //最新总天数
        if($oldday_num == $newday_num){
            //上个城市的新数据替换进来
            $scheduf[$this_city_index] = $singcityData;
            $plan_info['schedufing'] = base64_encode(serialize($scheduf));
            
            $trip_info['day_num'] = $tripData['day_num'] = $ccData['day_num'];
            $trip_info['cover'] = $tripData['cover'] = $ccData['cover'];
            $trip_info['date'] = $tripData['date'] = $ccData['date'];
            $trip_info['adult'] = $tripData['adult'] = $ccData['adult'];
            $trip_info['children'] = $tripData['children'] = $ccData['children'];
            $trip_info['departure_city'] = $tripData['departure_city'] = $ccData['departure_city'];
            $trip_info['return_city'] = $tripData['return_city'] = $ccData['return_city'];
            $trip_info['travel_title'] = $tripData['travel_title'] = $ccData['title'];
        }
//        else{   //编辑时，城市天数发生改变，日期更新
//            $citylen = count($go_city_array);
//            foreach($scheduf  as $key=>$sdValue){
//                if($key !== $this_city_index){
//                    $daysum = 0;
//                    $city_d_1 = 0; 
//                    $city_d_2 = 0;
//                    for($i=0;$i<$citylen;$i++)
//                    {
//                        $city_d_1 = $city_d_2 + 1; 
//                        $city_d_2 = $city_d_2 + $go_city_array[$i]['city_daynum']; 
//                        if($i == 0)
//                        {
//                            $go_city_array[0]['city_d_1'] = $city_d_1;
//                            $go_city_array[0]['city_d_2'] = $city_d_2;
//                            $go_city_array[0]['city_date'] = date("Y-m-d",(strtotime($date)));
//                            $go_city_array[0]['city_date2'] = date("Y-m-d",(strtotime($date) + ($go_city_array[0]['city_daynum']-1)*3600*24));
//                        }
//                        if($i>0)
//                        {
//                            if($go_city_array[$i]['city_daynum'] !== '0'){
//                                $go_city_array[$i]['city_d_1'] = $city_d_1;
//                                $go_city_array[$i]['city_d_2'] = $city_d_2;
//                                $daysum = $daysum + $go_city_array[$i-1]['city_daynum'];
//                                $go_city_array[$i]['city_date'] = date("Y-m-d",(strtotime($date) + $daysum*3600*24));
//                                $go_city_array[$i]['city_date2'] = date("Y-m-d",(strtotime($date) + ($city_d_2-1)*3600*24));
//                            }else{
//                                //选择了城市游玩0天
//                                $go_city_array[$i]['city_d_1'] = $city_d_2;
//                                $go_city_array[$i]['city_d_2'] = $city_d_2;
//                                $daysum = $daysum + $go_city_array[$i-1]['city_daynum'];
//                                $go_city_array[$i]['city_date2'] = $go_city_array[$i]['city_date'] = date("Y-m-d",(strtotime($date) + ($city_d_2-1)*3600*24));
//                            }
//                        }
//                    }
//                } 
//            }
//        }
//            print_r($scheduf);
//            exit;
        //酒店数据更新
        foreach($scheduf as $key1=>$jkl){
            foreach($jkl['day_arry'] as $key2=>$mko){
                if(isset($mko['hotel'])){
                    $hotelData[]= $mko['hotel'];
                }
            }
        }
//        print_r($hotelData);
//        exit;
         //酒店总数
        if(isset($hotelData)){
            $hotelSum = 0;
            foreach($hotelData as $ht){
                if(isset($ht['hotel_name'])){
                    $hotelSum += 1;
                }
            }
            $trip_info['allhotel'] = $tripData['allhotel'] = $hotelData;
            $trip_info['hotelSum'] = $tripData['hotelSum'] = $hotelSum;
        }
        
        //如果手机端制作的缺少的数据处理一下 
        $goInfo = $go_city_array;
        foreach($goInfo as $key=>&$goValue2)
        {
            if(!isset($goValue2['city_date2']))
            {
                $a = ($goValue2['city_daynum']-1).'day';  
                $city_date = str_replace('.','-',$goValue2['city_date']);
                $goValue2['city_date2'] =  date('Y-m-d',strtotime("$city_date+$a"));
                $uu1 = str_replace(".","-",$goValue2['city_date']);
                $goValue2['city_time_1'] = str_replace('-','.',substr($city_date,strpos($city_date,'-')+1)); 
                $goValue2['city_time_2'] = str_replace('-','.',substr($goValue2['city_date2'],strpos($goValue2['city_date2'],'-')+1));
            }
        }
        $std = 0; 
        $lencity = count($goInfo);
        if(isset($now_city_index)){
            if(!isset($goInfo[$now_city_index]['city_d_1']))
            {
                for($i=0;$i<$lencity;$i++)
                {
                    $std = $std + 1;
                    $goInfo[$i]['city_d_1'] = $std; //每个城市游玩的初始天
                    $std = $std+($goInfo[$i]['city_daynum']-1);
                    $goInfo[$i]['city_d_2'] = $std; //每个城市游玩的结束天
                }
            }
        }else{
            if(!isset($goInfo[$this_city_index]['city_d_1']))
            {
                for($i=0;$i<$lencity;$i++)
                {
                    $std = $std + 1;
                    $goInfo[$i]['city_d_1'] = $std; //每个城市游玩的初始天
                    $std = $std+($goInfo[$i]['city_daynum']-1);
                    $goInfo[$i]['city_d_2'] = $std; //每个城市游玩的结束天
                }
            }
        }
        
        $r_spot['go_city_array']  = $goInfo;
         //设置成最新的数据
        $trip_info['go_city_array'] = $goInfo;
        if(isset($hotelData)){
            $_SESSION['hotelData'] = $hotelData;
        }
        $_SESSION['trip_info'] = $trip_info;
        $_SESSION['plan_info'] = $plan_info;
        
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
            $nowcity = $scheduf[$now_city_index];
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
            foreach($scheduf as $key3=>$c){
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

            //数据存入数据库
            //1、基础数据
            if(isset($resultHotel)){
                 $tripData['allhotel'] = json_encode($resultHotel);
            }else{
                if(!empty($trip_info['allhotel'])){
                    $tripData['allhotel'] = json_encode($trip_info['allhotel']);
                }
            }
            $okstatus = Db::name('trip_info')->where(array('trip_id'=>$trip_id))->update($tripData);
            //dump(Db::getLastSql());
            //2、详细数据
            //先进行序列化后再存储
            $planData['schedufing'] = $plan_info['schedufing'];
            $okstatus = Db::name('plan_info')->where(array('trip_id'=>$trip_id))->update($planData);
            
            //3、list
            //$result = Db::name('city_line')->where(array('trip_id'=>$trip_id))->update($city_line);
            //4、交通费用
            //$result = Db::name('traffic_money')->where(array('trip_id'=>$trip_id))->update($traffic_money);
            // 5、酒店费用
            if(isset($h_Result)){
                $hotelInfo['hotel_info'] = json_encode($h_Result);
                $okstatus = Db::name('hotel')->where(array('trip_id'=>$trip_id))->update($hotelInfo);
            }
             
            //6、餐饮费用
            if(isset($eatResult)){
                //接机费用(增值服务)
                if(isset($way)){
                    $eat_money['way_money'] = json_encode($way);
                }
                $eat_money['eat_money'] = json_encode($eatResult); 
                $okstatus = Db::name('eat_money')->where(array('trip_id'=>$trip_id))->update($eat_money);
            }
            //反回更新成功的状态
            if($okstatus !== false){
                $return = array('status'=>true,'msg'=>'请求成功','data'=>[]);
            }else{
                $return = array('status'=>false,'msg'=>'请求失败','data'=>[]);
            }   
        }
        echo json_encode($return,JSON_UNESCAPED_UNICODE);
    }

}