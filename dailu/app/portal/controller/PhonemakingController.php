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

class PhonemakingController extends HomeBaseController
{
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
            
            //拼接行程单名称
            $user = Db::name('Customer')->field('user_name')->where(array('uid'=>$uid))->find();
            $go_city_array = json_decode($trip_info['go_city_array'],true);
            foreach($go_city_array as $city){ $cityArray[] = $city['city_name'];}
            $cityString = implode('.',$cityArray);
            $citynum = count($cityArray);
            $tripData['trip_name'] = $cityString. $citynum.'城市'.$trip_info['day_num'].'日游行程单';
    
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
            $planData['isoredit'] = $plan_info['isoredit'];
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
    //城市介绍
    public function city_info(){
        $city_id = input('post.city_id');
        //城市详情
        $city_detail = Db::name('city_details')->field('city_id,city_name,fit_day,city_Introduction,more,city_abbreviation')->where(['city_id'=>$city_id])->find();
        if(!empty($city_detail)){
            $pic =json_decode($city_detail['more'],true);
            if($pic){
                foreach($pic as $key => &$value){
                    //common.php中封装的图片url解析方法
                    $city_detail['image_url'][] = cmf_get_image_preview_url($value['url']);   
                }
            }
            $city_detail['introduction'] = htmlchars($city_detail['city_Introduction']);
            unset($city_detail['city_Introduction'],$city_detail['more']);
            //城市下的知名景点
            $famous_spot = $this->cityView($city_id,1);//知名景点为top8,详情页面没有景区内景点
            $famous_spot = array_slice($famous_spot,0,6);
            //城市下的特色美食
            $special_food = $this->foodDetail($city_id);
            $special_food = array_slice($special_food,0,3);
            //城市下的本地特产
            $special_goods = $this->cityGoods($city_id,1);
            $special_goods = array_slice($special_goods,0,3);
            //城市下的交通
            $city_traffic = $this->cityTraffic($city_id);
            if(!empty($city_detail)){
                $data['city_detail'] = $city_detail;
                $data['famous_spot'] = $famous_spot;
                $data['special_food'] = $special_food; 
                $data['special_goods'] = $special_goods;
                $data['city_traffic'] = $city_traffic;
            }else{
                $data = array();
            }
            $return = array('status'=>true,'msg'=>'请求成功','data'=>$data);
        }else{
            $return = array('status'=>true,'msg'=>'请求失败','data'=>[]);
        }
        // print_r($data);
        echo json_encode($return,JSON_UNESCAPED_UNICODE);
    }
    //城市下的知名景点
    public function cityView($city_id,$type){
        $city_id = input('post.city_id')?input('post.city_id'):$city_id;
        $famous_spot = Db::name('Nature_absture')->where(array('city_id'=>$city_id,'type'=>'top8'))->select()->toArray();
        foreach($famous_spot as &$spot){
            $spot['release_time'] = date('Y-m-d', $spot['update_time']);
            //景点封面图片 cover
            if($spot['pic']){
                $cover_pic = json_decode($spot['pic'],true);
                foreach($cover_pic as $k => &$pic_value){
                    //common.php中封装的图片url解析方法
                    $spot['image_url']= cmf_get_image_preview_url($pic_value['url']); 
                    $spot['image_name']= substr($pic_value['name'],0,strpos($pic_value['name'], '.'));
                }
            }else{
                $spot['image_url']= '';
                $spot['image_name']= '';
            }
            unset($spot['pic']);
            //文字描述中的html标签转化成实体
            $spot['introduction'] = htmlchars($spot['spot_Introduction']);
            unset($spot['spot_Introduction']);
            $spot['description'] = htmlchars($spot['other_description']);
            unset($spot['spot_Introduction']);
        }
        if(!empty($type)){
            return $famous_spot;
        }else{
            echo json_encode($famous_spot,JSON_UNESCAPED_UNICODE);
        }
    }
    //必吃美食下关联的店铺
    public function foodDetail($city_id){
        // $city_id = 3134;
        $store_info = Db::name('Store_info')->where(array('city_id'=>$city_id))->select()->toArray();
        //必吃美食 'is_hot_have'=>1
        $food_list = Db::name('dishes_recommended_info')->where(array('city_id'=>$city_id,'is_hot_have'=>1))->select()->toArray();
        foreach($store_info as $key1=>&$store){
            //店铺封面
            if(!empty($store['pic'])){
                $cover_pic = json_decode($store['pic'],true);
                foreach($cover_pic as $k => &$pic_value){
                    $store['pic_url']= cmf_get_image_preview_url($pic_value['url']); 
                }
            }else{
                $unified_404 = '404/unified_404.png';
                $store['pic_url'] = cmf_get_image_preview_url($unified_404);
            }
            //处理美食关联店铺数据
            foreach($food_list as $key2=>&$f){
                if($store['store_name'] == $f['store_name']){
                    $f['longitude'] = $store['longitude'];
                    $f['latitude'] = $store['latitude'];
                    $f['meal_time'] = $store['meal_time'];
                    $f['dianpu_image'] = $store['pic_url'];
                    $f['per_capita'] = $store['per_capita'];
                    $f['type'] = $store['type'];
                }
            }
        }
        foreach($food_list as $key4 => &$food){   
            //商品封面
            if(!empty($food['pic'])){
                $food_pic = json_decode($food['pic'],true);
                foreach($food_pic as $k => &$food_value){
                    $food['image_url']= cmf_get_image_preview_url($food_value['url']); 
                }
                unset($food['pic']);
            }else{
                $unified_404 = '404/unified_404.png';
                $food['image_url'] = cmf_get_image_preview_url($unified_404);
            }
            if(isset($food)){
                $arr[$food['dishes_name']]['place'][] = $food;  //取出数据分组
            }
        
        }
        //同一个美食放到统一数组中，美食一对多店铺
        $keyV = array_keys($arr);
        $arr = array_values($arr);
        foreach($arr as $k => &$v){
            $v['name'] = $keyV[$k];   
            foreach($v['place'] as $k1 => &$v1){
                $branch_num = Db::name('branch')->where(array('store_name'=>$v1['store_name']))->count();
                $v1['branch_num'] = $branch_num; //分店数量
                $v['image_url'] = $v1['image_url']; //美食图片
                if(array_key_exists('dianpu_image',$v1)){
                    $v1['image_url'] = $v1['dianpu_image']; //美食图片
                }else{
                    $v1['image_url'] = '';
                    $v1['dianpu_image'] = '';
                }
                $v['introduction'] = htmlchars($v1['spot_Introduction']); //美食介绍
            } 
        }
        return $arr;
    }
    //城市下的本地特产
    public function cityGoods($city_id,$type){
        $city_id = input('post.city_id')?input('post.city_id'):$city_id;
        $special_goods = Db::name('goods_info')->where(array('city_id'=>$city_id))->group('goods_name')->select()->toArray();
        foreach($special_goods as &$goods){
            if($goods['pic']){
                $goods_pic =json_decode($goods['pic'],true);
                foreach($goods_pic as $key2 => &$goods_pic_value){
                    $goods['image_url'] = cmf_get_image_preview_url($goods_pic_value['url']); 
                }
            }else{
                $goods['image_url'] = '';
            }
            unset($goods['pic']); 
             //文字描述中的html标签转化成实体
            $goods['goods_de'] = str_replace('&nbsp;','',htmlchars($goods['spot_Introduction']));
            unset($goods['spot_Introduction']);
        }
        if(!empty($type)){
            return $special_goods;
        }else{
            echo json_encode($special_goods,JSON_UNESCAPED_UNICODE);
        }
    }
    /*** 城市下的城市交通 ***/
    public function cityTraffic()
    {
        $city_id = input('post.city_id')?input('post.city_id'):$city_id;
        $planeData = Db::name('city_traffic')->where(array('city_id'=>$city_id))->select();
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
        if(!empty($city_trafficResult)){
            return $city_trafficResult;
        }else{
            echo json_encode($city_trafficResult,JSON_UNESCAPED_UNICODE);
        }
    }
    /* 中心点城市的周边的城市显示
     * 规则一：
     * 根据行程的天数 每天100公里，以中心点城市进行折射 ，即：
     * 范围0 < $distance < ($day_num * 100)
     * 
     * 规则二：
     * 当前城市所属省份下的所有城市优先显示
     * 
     * 注意：最后整合去重操作
     * */
    public function aroundCity()
    {
        // //清除上一次操作的session数据
        session_start();
        unset($_SESSION);
        session_destroy(); 
        
        $post = $_POST;
        /*** 周边城市 ***/
        $longitude1 = $post['lng'];
        $latitude1 = $post['lat'];
        $city_id = $post['city_id'];
        $province_id = $post['province_id'];
        // $day_num = $post['day_num'];   //总的行程天数
        $now_num = $post['city_day_num'];  //当前中心点城市的适玩天数
        // $last_num = $day_num - $now_num;
        $y = 100;
        $c = 3 * $y;   //第一次进来，默认辐射有3天的行程距离

        //测试
        // $longitude1 = 120.2099470000;
        // $latitude1 = 30.2458530000;
        // $city_id = 3134;
        // $province_id = 3133;
        // $now_num = 2;  //当前中心点城市的适玩天数

        //中心点城市所属省份下的所有城市
        $current =  Db::name('City_details')->field(array('id','province_id','city_id','province_name','city_name','city_abbreviation','fit_day','more','longitude','latitude','city_score'))->where(array('province_id'=>$province_id))->order('id asc')->select();
        $currentProvinceData = json_decode($current,true);
        foreach($currentProvinceData as $key=>&$cityValue)
        {
            $lo = $cityValue['longitude'];
            $la= $cityValue['latitude'];
            //调用common.php 中的 getDistance方法计算两个地理位置之间的距离
            $distance = getDistance($longitude1, $latitude1, $lo, $la, 2);
            if($distance == 0)
            {
                unset($currentProvinceData[$key]);
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
        $current_result = array_merge($currentProvinceData);
        $sort = array_column($current_result, 'dis'); 
        array_multisort($sort, SORT_ASC,$current_result);

        //周边城市
        $cityData = Db::name('City_details')->field(array('id','province_id','city_id','province_name','city_name','city_abbreviation','fit_day','more','longitude','latitude','city_score'))->order('id asc')->select();
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

        if(!empty($cityInfo))
        {
            $sort = array_column($cityInfo, 'dis'); 
            array_multisort($sort, SORT_ASC,$cityInfo); 
        }

        //整合当前城市下的所属省份下的所有城市、其他满足规则的城市
        if(isset($cityInfo))
        {
            $aroundCity = array_merge($current_result,$cityInfo);
        }else{
            $aroundCity = array_merge($cu);
        }
        // print_r($aroundCity);
        // exit;
        $aroundData['id'] = 1000;
        $aroundData['province_name'] = '周边城市';
        $aroundData['province_English'] = 'around';
        $aroundData['province_id'] = 1000;
        $aroundData['detail']['id'] = 1000;
        $aroundData['detail']['province_name'] = '周边城市';
        $aroundData['detail']['province_English'] = 'around';
        $aroundData['detail']['province_Introduction'] = '周边城市简介';
        $aroundData['detail']['create_time'] = 0;
        $aroundData['detail']['update_time'] = 0;
        $aroundData['detail']['published_time'] = 0;
        $aroundData['detail']['status'] = 0;
        $aroundData['detail']['is_municipalities'] = 0;
        $aroundData['detail']['is_top'] = 0;
        $aroundData['detail']['paiming_id'] = 0;
        $aroundData['detail']['img_url'] = 'http://dailu.com:8080/upload/tourist/20180816/99f13a2ba4fe8068441aa2cdda583bb1.jpg';
        $aroundData['city'] = $aroundCity;
        $aroundData = [$aroundData];
   
        /*** 所有省份城市***/
        $province = Db::name('Province_details')->order('paiming_id')->select()->toArray();
        $city_detail = Db::name('city_details')->field(['id','province_id','province_name','city_id','city_name','city_abbreviation','more','fit_day','longitude','latitude','city_score'])->select()->toArray();
        foreach ($province as $key => &$value) {
            //城市详情
            $detail = $value;
            $value['detail'] = $detail;
            $image =json_decode($value['detail']['pic'],true);
            foreach($image as &$img_value){
                //common.php中封装的图片url解析方法
                $value['detail']['img_url'] = cmf_get_image_preview_url($img_value['url']);   
            }
            foreach ($city_detail as $key2 => $value2) {
                if($value['province_id'] == $value2['province_id']){
                    $value2['distance'] = '0km'; 
                    if(!empty($value2['more'])){
                        $pic =json_decode($value2['more'],true);
                        foreach($pic as $kk => &$pic_value){
                             //common.php中封装的图片url解析方法
                            $value2['img_url'] = cmf_get_image_preview_url($pic_value['url']); 
                        }
                        unset($value2['more']);
                    }
                        $value['city'][] = $value2; 
                        $value['province_Introduction'] = htmlchars($value['province_Introduction']); 
                }
            }
            unset($value['detail']['pic'],$value['pic'],$value['province_Introduction'],$value['creat_time'],$value['update_time'],$value['published_time'],$value['status'],$value['is_municipalities'],$value['is_top'],$value['paiming_id'],$value['create_time']);
            if(!array_key_exists('detail',$value)){
                $value['detail'] = array();
            }
            if(!array_key_exists('city',$value)){
                $value['city'] = array();
            }
        }
        $aroundCity = array_merge($aroundData,$province);
        if(isset($aroundCity))
        {
            $return = array('status'=>true,'msg'=>'请求成功','data'=>$aroundCity);
        }else{
            $return = array('status'=>false,'msg'=>'请求失败','data'=>[]);
        }
        // $_SESSION['aroundcity'] = $aroundCity;  //存到session，适用于后面的搜索城市列表
        // print_r($return);
        echo json_encode($return,JSON_UNESCAPED_UNICODE);
    }

    //省份页面的搜索框(可以搜索省份，城市，景点,店铺，连锁店)
    public function search()
    {
        $queryString = $_GET['searchString'];
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
                $province['itemType'] = 1;
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
                $city['itemType'] = 2;
            }
            foreach($famousResult as &$famous)
            {
                $pData = $this->pro_is_municipalities($famous['province_id']);
                $famous['is_municipalities'] = $pData['is_municipalities'];
                $famous['province_name'] = $pData['province_name'];
                $famous['itemType'] = 3;
            }
            foreach($NatureResult as &$na)
            {
                $pData = $this->pro_is_municipalities($na['province_id']);
                $na['is_municipalities'] = $pData['is_municipalities'];
                $na['province_name'] = $pData['province_name'];
                $na['itemType'] = 3;
            }
            foreach($DescribeResult as &$de)
            {
                $pData = $this->pro_is_municipalities($de['province_id']);
                $de['is_municipalities'] = $pData['is_municipalities'];
                $de['province_name'] = $pData['province_name'];
                $de['itemType'] = 3;
            }
            foreach($NightResult as &$ni)
            {
                $pData = $this->pro_is_municipalities($ni['province_id']);
                $ni['is_municipalities'] = $pData['is_municipalities'];
                $ni['province_name'] = $pData['province_name'];
                $ni['itemType'] = 3;
            }
            foreach($bentuResult as &$bentu)
            {
                $pData = $this->pro_is_municipalities($bentu['province_id']);
                $bentu['is_municipalities'] = $pData['is_municipalities'];
                $bentu['province_name'] = $pData['province_name'];
                $bentu['spot_name'] =  $bentu['store_name'];
                $bentu['itemType'] = 3;
                unset($bentu['store_name']);
            }
            foreach($resResult as &$res)
            {
                $pData = $this->pro_is_municipalities($res['province_id']);
                $res['is_municipalities'] = $pData['is_municipalities'];
                $res['province_name'] = $pData['province_name'];
                $res['spot_name'] =  $res['restaurant_name'];
                $res['itemType'] = 3;
            }
            foreach($foodResult as &$ff)
            {
                $pData = $this->pro_is_municipalities($ff['province_id']);
                $ff['is_municipalities'] = $pData['is_municipalities'];
                $ff['province_name'] = $pData['province_name'];
                $ff['spot_name'] =  $ff['food_court_name'];
                $ff['itemType'] = 3;
            }
            foreach($shoppingResult as &$sh)
            {
                $pData = $this->pro_is_municipalities($sh['province_id']);
                $sh['is_municipalities'] = $pData['is_municipalities'];
                $sh['province_name'] = $pData['province_name'];
                $sh['spot_name'] =  $sh['shopping_name'];
                $sh['itemType'] = 3;
            }
            foreach($goodsResult as &$gg)
            {
                $pData = $this->pro_is_municipalities($gg['province_id']);
                $gg['is_municipalities'] = $pData['is_municipalities'];
                $gg['province_name'] = $pData['province_name'];
                $gg['spot_name'] =  $gg['goods_name'];
                $gg['itemType'] = 3;
            }
           
            $searchData['city'] = array_merge($ProvinceResult,$cityResult,$famousResult,$NatureResult,$DescribeResult,$NightResult,
            $bentuResult,$resResult,$foodResult,$shoppingResult,$goodsResult);
            if(isset($searchData))
            {
                $return = array('status'=>true,'msg'=>'请求成功','data'=>$searchData);
            }else{
                $return = array('status'=>false,'msg'=>'请求失败','data'=>[]);
            }
            echo json_encode($return,JSON_UNESCAPED_UNICODE);
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
        if(isset($searchData))
        {
            $return = array('status'=>true,'msg'=>'请求成功','data'=>$cityList);
        }else{
            $return = array('status'=>false,'msg'=>'请求失败','data'=>[]);
        }
        echo json_encode($return,JSON_UNESCAPED_UNICODE);
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
    //城市顺序优化
    function automatic()
    {
        session_start();
        $post = $_POST;
        //测试数据
        // $zzz = '{"go_city_array":[{"city_name":"天津","distance":"113km","city_abbreviation":"Tianjin","img_url":"http://a.5199yl.com/upload/tourist/20180821/d9d02c064bc22330a18d49b730587535.jpg","province_id":42,"latitude":"39.0852940000","fit_day":2,"id":307,"city_score":"TOP1","city_id":43,"longitude":"117.2015380000","province_name":"天津"},{"city_name":"保定","distance":"140km","city_abbreviation":"Baoding","img_url":"http://a.5199yl.com/upload/tourist/20180821/9814f114e8ae5b6c135f9fc0fb2a3a60.jpg","province_id":814,"latitude":"38.8740620000","fit_day":1,"id":308,"city_score":"Top4","city_id":839,"longitude":"115.4648040000","province_name":"河北"}],"departure_city":{"city_name":"北京","city_abbreviation":"Beijing","img_url":"http://a.5199yl.com/upload/tourist/20180816/99f13a2ba4fe8068441aa2cdda583bb1.jpg","province_id":1,"latitude":"39.9041720000","fit_day":4,"id":300,"city_score":"Top1","city_id":2,"longitude":"116.4074170000","province_name":"北京"}}';
        // $cityData = json_decode($zzz,true);
        //存一个临时的日子文件，便于看数据结构
        // $file  = 'binglog.txt';
        // file_put_contents($file,$zzz,FILE_APPEND);
        // //读文件
        // $file_path = "binglog.txt";
        // if(file_exists($file_path)){
        //     $fp = fopen($file_path,"r");
        //     $str = fread($fp,filesize($file_path));
        //     // echo $str = str_replace("\r\n","<br />",$str);
        // }
        // $cityData = json_decode($str,true);
        
        $cityData = json_decode($post['citymodel'],true);

        //出发城市
        $departureData = $this->DepartureCity($post['latitude'],$post['longitude']);

        $departure_city['latitude'] = $departureData['location']['lat'];
        $departure_city['longitude'] = $departureData['location']['lng'];
        $departure_city['city_name'] = $departureData['city_name'];
        $departure_city['city_id'] = $departureData['city_id'];
        $departure_city['city_py'] = $departureData['city_py'];
        $departure_city['img'] = $departureData['img'];

        $departure_city['date'] = date("Y-m-d",time());
        $departure_city['adult'] = 1;
        $departure_city['children'] = 0;

        //返回城市
        $return_city = $departure_city;

        $go_city_array = $cityData['go_city_array'];//游玩城市

        foreach ($go_city_array as $key2 => &$value2) {
            $value2['lat'] = $value2['latitude'];
            $value2['lng'] = $value2['longitude'];
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
            $start[] = array('city_name'=>$departure_city['city_name'],'lat'=>$departure_city['latitude'],'lng'=>$departure_city['longitude']);
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
            $lastDis= $this->distance($last['lng'],$last['lat'],$return_city['longitude'],$return_city['latitude']);

            foreach ($array as $key => &$value) {
                $value['dis'] = $dis[$key];
                $value['lat'] = floatval($value['lat']);
                $value['lng'] = floatval($value['lng']);
                // unset($value['lat'],$value['lng']);
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
            $returnData = array('departure_city'=>$departure_city,'go_city_array'=>$array,'return_city'=>$return_city);
        }else{
            $oneDis = $this->distance($departure_city['longitude'],$departure_city['latitude'],$go_city_array[0]['lng'],$go_city_array[0]['lat']);
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
            $lastDis = $this->distance($go_city_array[0]['lng'],$go_city_array[0]['lat'],$return_city['longitude'],$return_city['latitude']);
            // unset($go_city_array[0]['lat'],$go_city_array[0]['lng']);
            // $go_city_array[0]['position']['lat'] = floatval($go_city_array[0]['position']['lat']);
            // $go_city_array[0]['position']['lng'] = floatval($go_city_array[0]['position']['lng']);
            $return_city['dis'] = $lastDis;
            if($lastDis<300){
                $return_city['flightTime'] = '';
            }else{
                $return_city['flightTime'] = round($lastDis/700+0.5,1);
            }
            $return_city['trainTime'] = round($lastDis/230,1);
            $return_city['trafficTime'] = round($lastDis/50,1);
            $returnData = array('departure_city'=>$departure_city,'go_city_array'=>$go_city_array,'return_city'=>$return_city);
        }
        // print_r($returnData);
        if(!empty($returnData)){
            $return = array('status'=>true,'msg'=>'请求成功','data'=>$returnData);
        }else{
            $return = array('status'=>false,'msg'=>'暂无数据','data'=>[]);
        }
        
        echo json_encode($return,JSON_UNESCAPED_UNICODE);
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

    //定位当前城市（出发城市）
    // $latitude,$longitude
    public function DepartureCity($latitude,$longitude){
        if(!empty($latitude)){
            $bd_place_url='http://api.map.baidu.com/geocoder/v2/?location='.$latitude.','.$longitude.'&output=json&ak=f9i94yRcN7hCVBdptTeG1ZmzXGMQUrkZ';
            $gd_place_url ='https://restapi.amap.com/v3/geocode/regeo?key=e8ffe372c2f936cd75d8c2ed5d01ae67&location='.$longitude.','.$latitude.'&radius=0';
            try{
                $json_place=file_get_contents($bd_place_url);
                $city = json_decode($json_place,true);
                $city_info = $city['result']['addressComponent'];//百度
            }catch(Exception $e){
                $json_place=file_get_contents($gd_place_url);
                $city = json_decode($json_place,true);
                $city_info = $city['regeocode']['addressComponent'];//高德
            }
            $city['city_name'] = str_replace('市','',$city_info['city']);
            if($city['status'] == 0 || $city['status'] == 1){
                if(isset($city['regeocode']['addressComponent']['streetNumber']['location'])){
                    $locations = explode(',',$city['regeocode']['addressComponent']['streetNumber']['location']);
                    $location_a['lat'] = $locations[0];
                    $location_a['lng'] = $locations[1];
                }else{
                    $location_a = $city['result']['location'];
                }
            }else{
                $location_a = ['lat'=>'','lng'=>''];
            }
            $city['location'] = $location_a;
        }else{
            //自动定位
            $ip = $this->get_ip();
            $city_info = get_ip_lookup($ip);//获取当前城市

            //定位
            if($city_info == 'true')
            {
                $city['city_name'] = $city_info['city'];
                $get_location = file_get_contents('http://api.map.baidu.com/geocoder?address='.$city['city_name'].'&output=json&key=f9i94yRcN7hCVBdptTeG1ZmzXGMQUrkZ');//百度
                $get_location = json_decode($get_location,true);
                if($get_location['status'] == 'OK' && !empty($get_location['result'])){
                    $location = $get_location['result']['location'];
                }else{
                    $location = ['lat'=>'','lng'=>''];
                }
            }else{
                //自动定位失败时
                $city['city_name'] = '杭州';
                $location = ['lat'=>'30.2458530000','lng'=>'120.2099470000'];
            }
            $city['location'] = $location;
        }
       
        import('Pinyin',EXTEND_PATH);
        $pin = new \PinYin();
        
        $city_py = ucwords($pin->getAllPY($city['city_name']));//将首字母大写
        $city['city_py'] = str_replace(' ', '',$city_py);
        $city_details = DB::name('city_details')->field('city_id,more')->where(['city_name'=>$city['city_name']])->find();
        $img = json_decode($city_details['more'],true);
        
        if($city_details){
            $city['img'] = cmf_get_image_preview_url($img[0]['url']);
            $city['city_id'] = $city_details['city_id'];
        }else{
            $city['img'] = 'http://a.5199yl.com/upload/tourist/20180522/cca758531715df1c8050f4733a05a3ba.jpg';
            $city['city_id'] = 0;
        }
        // print_r($city);
        // exit;
        return $city;
    }

    public function quickSort($array){
        if(!isset($array[1])){
            return $array;
        }
        $mid = $array[0]['dis']; //获取一个用于分割的关键字，一般是首个元素
        $leftArray = array(); 
        $rightArray = array();
        foreach($array as $v){
            if($v['dis'] > $mid){
                $rightArray[] = $v;  //把比$mid大的数放到一个数组里
            }
            if($v['dis'] < $mid){
                $leftArray[] = $v;   //把比$mid小的数放到另一个数组里
            }
        }
        $leftArray = $this->quickSort($leftArray); //把比较小的数组再一次进行分割
        $leftArray[] = $array[0];        //把分割的元素加到小的数组后面，不能忘了它哦
        $rightArray = $this->quickSort($rightArray);  //把比较大的数组再一次进行分割
        return array_merge($leftArray,$rightArray);  //组合两个结果
    }

    public function get_ip(){
        //判断服务器是否允许$_SERVER
        if(isset($_SERVER)){    
            // print_r($_SERVER);exit;
            if(isset($_SERVER['HTTP_X_FORWARDED_FOR'])){
                $realip = $_SERVER['HTTP_X_FORWARDED_FOR'];
            }elseif(isset($_SERVER['HTTP_CLIENT_IP'])) {
                $realip = $_SERVER['HTTP_CLIENT_IP'];
            }else{
                $realip = $_SERVER['REMOTE_ADDR'];
            }
        }else{
            //不允许就使用getenv获取  
            if(getenv("HTTP_X_FORWARDED_FOR")){
                  $realip = getenv( "HTTP_X_FORWARDED_FOR");
            }elseif(getenv("HTTP_CLIENT_IP")) {
                  $realip = getenv("HTTP_CLIENT_IP");
            }else{
                  $realip = getenv("REMOTE_ADDR");
            }
        }

        return $realip;
    }

    //选择出发城市、返回城市
    public function DepReturn()
    {
        $post = $_POST;
        $departureData = $this->DepartureCity($post['latitude'],$post['longitude']);
        //当前出发城市或返回城市的所属省份
        $nowcitypro = Db::name('City_details')->where(array('city_id'=>$departureData['city_id']))->field(array('province_id','province_name'))->find();
        /*** 所有省份城市***/
        $province = Db::name('Province_details')->order('province_id')->field(array('id','province_id','province_name','province_English','is_municipalities'))->select()->toArray();
        // $city_detail = Db::name('city_details')->field(['id','province_id','province_name','city_id','city_name','longitude','latitude'])->select()->toArray();
        $city_detail = Db::name('Area')->field(array('area_pid','area_id','area_name'))->where(array('area_type'=>2))->select()->toArray();
        foreach ($province as $key => &$value) 
        {
            //城市详情
            foreach ($city_detail as $key2 => $value2) {
                if($value['province_id'] == $value2['area_pid']){
                    $value2['id'] = $value2['area_id'];
                    $value2['province_id'] = $value2['area_pid'];
                    $value2['city_id'] = $value2['area_id'];
                    $value2['city_name'] = $value2['area_name'];
                    $value['city'][] = $value2; 
                }
            }
            if(!array_key_exists('city',$value)){
                $value['city'] = array();
            }
            //当前出发城市或返回城市的所属省份下的城市放在第一个
            if($nowcitypro['province_id'] == $value['province_id'])
            {
                //定位的当前城市
                $value['cityName'] = $departureData['city_name'];
                unset($province[$key]);
                array_unshift($province,$value); 
            }else{
                $value['cityName'] = '';
            }
        }

        if(!empty($province))
        {
            $return = array('status'=>true,'msg'=>'请求成功','data'=>$province);
        }else{
            $return = array('status'=>true,'msg'=>'请求失败','data'=>[]);
        }
        echo json_encode($return,JSON_UNESCAPED_UNICODE);
    }

    //城市 附近飞机场、火车站 demo更新数据表字段
    public function NearDemo()
    {
        $cityArray = Db::name('City_details')->select();
        $trafficArray = Db::name('City_traffic')->select();
        foreach($cityArray as $key1=>$value1)
        {
            $longitude1 = $value1['longitude'];
            $latitude1 = $value1['latitude'];
            foreach($trafficArray as $key=>$value2)
            {
                //飞机
                if($value2['traffic_type'] == 'plane')
                {
                    $distance[$value1['city_id']][$key]['main_city_id'] = $value1['city_id'];
                    $distance[$value1['city_id']][$key]['main_city_name'] = $value1['city_name'];
                    $distance[$value1['city_id']][$key]['city_id'] = $value2['city_id'];
                    $distance[$value1['city_id']][$key]['traffic_name'] = $value2['traffic_name'];
                    $distance[$value1['city_id']][$key]['traffic_longitude'] =$value2['traffic_longitude'];
                    $distance[$value1['city_id']][$key]['traffic_latitude'] = $value2['traffic_latitude'];
                    $distance[$value1['city_id']][$key]['to_dis'] = getDistance($longitude1, $latitude1, $value2['traffic_longitude'], $value2['traffic_latitude'], 2);
                }
            }
        }
        foreach($distance as $key=>$d){
            foreach($d as $dd){
                $result[$key][] = $dd;
            }
        }
        // print_r($result);
        // exit;
        foreach($result as $re)
        {
            $sort = array_column($re, 'to_dis');
            // print_r($sort);
            array_multisort($sort, SORT_ASC, $re);
            $asd = array_slice($re,0,3); 
            // print_r($asd);

            $data['near_plane'] = json_encode($asd);
            // print_r($data);
            // exit;
            // Db::name('City_details')->where(array('city_id'=>$asd[0]['main_city_id']))->update($data);
        }
    }

    //选择交通方式，交通站点,附近交通站点
    public function TrafficSite()
    {
        $post = $_POST;
        $city_id = $post['city_id'];
        if($city_id == 0)
        {
            $return = array('status'=>false,'msg'=>'暂未查询到当前城市站点信息','data'=>[]);
        }else{
            $cityneartra = Db::name('City_details')->field(array('city_id,near_plane,near_train'))->where(array('city_id'=>$city_id))->find();

            //当前城市的飞机场是否存在
            $planeData = Db::name('City_traffic')->where(array('city_id'=>$city_id,'traffic_type'=>'plane'))->select()->toArray();
            if(empty($planeData))
            {
                $plane = json_decode($cityneartra['near_plane'],true);
            }else{
                foreach($planeData as $key=>&$pl){
                    $pl['main_city_id'] = $pl['city_id'];
                    $pl['main_city_name'] = $pl['city_name'];
                    $pl['to_dis'] = 0;
                    unset($planeData[$key]['city_name'],$planeData[$key]['province_id'],$planeData[$key]['traffic_address'],$planeData[$key]['traffic_pic'],$planeData[$key]['traffic_phone'],$planeData[$key]['id'],$planeData[$key]['traffic_type']);
                }
                $plane = $planeData;
            }
            //当前城市的火车站是否存在
            $trainData = Db::name('City_traffic')->where(array('city_id'=>$city_id,'traffic_type'=>'train'))->select()->toArray();
            if(empty($trainData))
            {
                $train = json_decode($cityneartra['near_train'],true);

            }else{
                foreach($trainData as $key=>&$tra){
                    $tra['main_city_id'] = $tra['city_id'];
                    $tra['main_city_name'] = $tra['city_name'];
                    $tra['to_dis'] = 0;
                    unset($trainData[$key]['city_name'],$trainData[$key]['province_id'],$trainData[$key]['traffic_address'],$trainData[$key]['traffic_pic'],$trainData[$key]['traffic_phone'],$trainData[$key]['id'],$trainData[$key]['traffic_type']);
                }
                $train = $trainData;
            }
            //待定交通
            $no_ok = array('city_id'=>0,'traffic_name'=>'待定','traffic_longitude'=>'','traffic_latitude'=>'','main_city_id'=>0,'main_city_name'=>'','to_dis'=>0);
            array_unshift($plane,$no_ok);
            array_unshift($train,$no_ok);
            $near['plane'] = $plane;
            $near['train'] =  $train;

            if(!empty($near))
            {
                $return = array('status'=>true,'msg'=>'请求成功','data'=>$near);
            }else{
                $return = array('status'=>true,'msg'=>'请求失败','data'=>[]);
            }  
        }
        
        echo json_encode($return,JSON_UNESCAPED_UNICODE);
    }

    //行程总览页面（未安排状态），已经优化好的城市，存到数据库，给出标识（如果做到此页面，关掉了app，下次进来默认从此页面开始）
    public function SaveCity()
    {   
        session_start();
        $post = $_POST;
        $cityInfo = json_decode($post['citymodel'],true);
        $uid = $post['uid'];
        //测试
        // $uid = 18;
        // $cityData = '{"uid":18,"departure_city":{"city_name":"杭州","latitude":30.274084,"longitude":120.15507,"adult":1,"children":1,"date":"2019-01-02"},"return_city":{"city_name":"南京","latitude":30.369084,"longitude":120.19807},"go_city_array":[{"city_Introduction":"","city_py":"","city_id":3182,"province_id":3133,"provinceNames":"","lat":"","city_name":"宁波","city_daynum":3,"lng":"","city_trc_name":"飞机交通","dis":68,"flightTime":1.1,"img_url":"http://a.5199yl.com/upload/tourist/20180816/99f13a2ba4fe8068441aa2cdda583bb1.jpg"},{"city_Introduction":"","city_py":"","city_id":3162,"province_id":3133,"provinceNames":"","lat":"","city_name":"金华","city_daynum":4,"lng":"","city_trc_name":"飞机交通","dis":56,"flightTime":1.5,"img_url":"http://a.5199yl.com/upload/tourist/20180816/99f13a2ba4fe8068441aa2cdda583bb1.jpg"}]}';
        // echo $errorinfo = json_last_error();
        // $cityInfo = json_decode($cityData,true);
        // print_r($cityInfo);
        // exit;
       
        $time = time();
        $trip_id = $uid.'-'.$time;  //生成行程单号
        

        $data['trip_id'] =  $trip_id;
        $cityInfo['trip_id'] = $trip_id;
        // exit;
   
        $data['uid'] = $uid;
        $data['adult'] =  $cityInfo['departure_city']['adult'];
        $data['children'] = $cityInfo['departure_city']['children'];
        $data['date'] = strtotime($cityInfo['departure_city']['date']);
        $go_city_array = $cityInfo['go_city_array'];
    
        //游玩总天数
        $day_num = array_sum(array_map(create_function('$vals', 'return $vals["city_daynum"];'),$go_city_array));
        $data['day_num'] = $day_num; 
        $cityInfo['departure_city']['day_num'] = $day_num;


        $citylen = count($go_city_array);

        //每个游玩城市的起始日期
        if($citylen < 2){
            $go_city_array[0]['city_date'] = $cityInfo['departure_city']['date'];
        }else{
            $daysum = 0;
            for($i=0;$i<$citylen;$i++)
            {
                if($i == 0)
                {
                $go_city_array[0]['city_date'] = date("Y-m-d",(strtotime($cityInfo['departure_city']['date'])));
                }
                if($i>0)
                {
                   $daysum = $daysum + $go_city_array[$i-1]['city_daynum'];
                   $go_city_array[$i]['city_date'] = date("Y-m-d",(strtotime($cityInfo['departure_city']['date']) + $daysum*3600*24));
                }
            }
        }

        foreach($go_city_array as $key=>$cityValue)
        {
            $cityArray[] = $cityValue['city_name']; 
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
        // print_r($dateArray);
    
        $cityString = implode('.',$cityArray);
        $trip_name = $cityString. $citylen.'城市'.$day_num.'日游';
        
        //封面图默认第一目的地城市封面
        $TheCover = $go_city_array[0]['img_url'];
        $cityInfo['trip_name'] = $trip_name;
        $cityInfo['Cover'] = $TheCover;
        //行程单名称
        $data['trip_name'] = $trip_name;
        //行程单封面
        $data['Cover'] = $TheCover;

        //出发城市、返回城市
        $data['departure_city'] =  $cityInfo['departure_city']['city_name'];
        $data['dep_lat'] =  $cityInfo['departure_city']['latitude'];
        $data['dep_lng'] =  $cityInfo['departure_city']['longitude'];
        $data['return_city'] =  $cityInfo['return_city']['city_name'];
        $data['ret_lat'] =  $cityInfo['return_city']['latitude'];
        $data['ret_lng'] =  $cityInfo['return_city']['longitude'];

        //游玩城市
        $data['go_city_array'] = json_encode($go_city_array);
        //每天的游玩时段
        $data['timeData'] = json_encode($dateArray);
        //用于下次打开app时，未完成的行程单保存。1-城市选择页面，2-
        $data['edit_tag'] =  1;
        // print_r($data);
        // exit;

        foreach($go_city_array as $k1=>&$goValue)
        {
            foreach($dateArray as $k2=>$dateValue)
            {
                if($k1 == $k2)
                {
                    $goValue['timeData'] = $dateValue;
                }
            }
        }
        $cityInfo['go_city_array'] = $go_city_array;
        // 服务端
        // $aa = get_headers('http://a.5199yl.com/portal/Phonemaking/SaveCity');

        $_SESSION['trip_id'] = $trip_id;    //trip_id存到session中，下个页面直接使用
        $_SESSION['SaveCity'] = $cityInfo;
        //出行基本数据存到未完成的数据表中
        // if(Db::name('Unfinished')->insert($data))    //暂时屏蔽向数据库插入的操作，后期上传后再放开
        if(!empty($cityInfo))
        {
            $return = array('status'=>true,'msg'=>'请求成功','data'=>$cityInfo);
        }else{
            $return = array('status'=>false,'msg'=>'请求失败','data'=>[]);
        }
        echo json_encode($return,JSON_UNESCAPED_UNICODE);

    }

    //适玩时间单位统一成小时（规则：1天 = 8个小时的游玩时间）
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
    /**
    * 1F
    * 人文自然 景点列表
    */
    public function Rewen()
    {
        //根据传递过来的
        $post = $_POST;
        $city_id = $post['city_id'];
        $spotList = Db::name('Nature_absture')->where(array('city_id'=>$city_id))
        ->field(array('id','province_id','city_id','spot_name','area_id','attr_score','play_time','pic','type','longitude','latitude','ranking','period_time','not_modifity','suit_season'))->order('ranking asc')->select();
        $spotResult = json_decode($spotList,true);
        

        $top = array();
        $nature = array();
        $scenery = array();
        foreach($spotResult as $kk=>&$spot)
        {
            //适玩时间
            $spot['tag_time'] = $this->play_time($spot['play_time']);  //时间统一成小时
            $spot['this_floor_index'] = 0;
            //景点封面图片 cover
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
            if($spot['type'] == 'Top8')
            {
                $top['top8'][] = $spot; 
            }
            if($spot['type'] == '人文景观')
            {
                $nature['nature'][] = $spot;
            }

            if($spot['type'] == '自然风光')
            {
                $scenery['scenery'][] = $spot;
            }
        }
        // print_r($spotResult);
        $abstureList = array();
        $type['type']= array('Top8','人文景观','自然风光');

        if(isset($top['top8']))
        {
            $top8_sort = array_column($top['top8'], 'ranking');  
            array_multisort($top8_sort, SORT_ASC, $top['top8']);
        }
        
        if(isset($nature['nature']))
        {
            $nature_sort = array_column($nature['nature'], 'ranking');  
            array_multisort($nature_sort, SORT_ASC, $nature['nature']); 
        }
    
        if(isset($scenery['scenery']))
        {
            $scenery_sort = array_column($scenery['scenery'], 'ranking');  
            array_multisort($scenery_sort, SORT_ASC,  $scenery['scenery']); 
        }

        $abstureList = array_merge($top,$nature,$scenery,$type);

        // print_r($abstureList);
        if(!empty($abstureList))
        {
            $return = array('status'=>true,'msg'=>'请求成功','data'=>$abstureList);
        }else{
            $return = array('status'=>false,'msg'=>'请求失败','data'=>[]);
        }
        echo json_encode($return,JSON_UNESCAPED_UNICODE);
    }

    /********** 人文景点中的 查看介绍，景点的详情页面数据  ***********/
    public function renwen_detail()
    {
        /****** 景区  *********/
        $post = $_POST;
        $spot_name = $post['spot_name'];
        $city_id = $post['city_id'];
        $where['spot_name'] = $spot_name;
        $spotDetail = Db::name('Nature_absture')->where($where)->find();

        $spotDetail['release_time'] = date('Y-m-d', $spotDetail['update_time']);
        //景点封面图片 cover
        if(!empty($spotDetail['picture2']))
        {
            $cover_pic = json_decode($spotDetail['picture2'],true);
            foreach($cover_pic as $k => &$pic_value)
            {
                //common.php中封装的图片url解析方法
                $spotDetail['image_url'][$k]= cmf_get_image_preview_url($pic_value['url']); 
                // $spotDetail['image_name'][$k]= substr($pic_value['name'],0,strpos($pic_value['name'], '.'));
                // $pp['url'] = $spotDetail['image_url'][$k];
                // $pp['name'] = $spotDetail['image_name'][$k];
                // $spotDetail['image'][$k] = $pp;
            }
            unset($spotDetail['picture2']);
        }
        
        
        //文字描述中的html标签转化成实体
        $spotDetail['introduction'] = htmlchars($spotDetail['spot_Introduction']);
        unset($spotDetail['spot_Introduction']);
        $spotDetail['description'] = htmlchars($spotDetail['other_description']);
        unset($spotDetail['spot_Introduction']);

        if(!empty($spotDetail))
        {
            $return = array('status'=>true,'msg'=>'请求成功','data'=>$spotDetail);
        }else{
            $return = array('status'=>false,'msg'=>'请求失败','data'=>[]);
        }
        echo json_encode($return,JSON_UNESCAPED_UNICODE);

    }

    /*** 2F
     * 本土体验
     ***/
    //本土体验 景点列表
    public function Local()
    {
         //根据传递过来的
        $post = $_POST;
        $city_id = $post['city_id'];

        $localList = Db::name('Describe')->where(array('city_id'=>$city_id))->field(array('province_id','city_id','spot_name','area_id','attr_score','play_time','pic','type','longitude','latitude','attr_score','ranking','period_time','not_modifity','suit_season'))->select();
        $localResult = json_decode($localList,true);
        $art = array();
        $leisure = array();
        foreach($localResult as $kk=>&$local)
        {
            //适玩时间
            $local['tag_time'] = $this->play_time($local['play_time']);  //时间统一成小时
            $local['this_floor_index'] = 1;
            //景点封面图片 cover
            if(!empty($local['pic']))
            {
                $cover_pic =json_decode($local['pic'],true);
                foreach($cover_pic as $k => &$pic_value)
                {
                    //common.php中封装的图片url解析方法
                    $local['cover_url'] = cmf_get_image_preview_url($pic_value['url']); 
                }
                unset($local['pic']);
            }
            else{
                $unified_404 = '404/unified_404.png';
                $local['cover_url']  = cmf_get_image_preview_url($unified_404);
            }
            if($local['type'] == '文化艺术')
            {
                $art['art'][] = $local;
            }

            if($local['type'] == '休闲情调')
            {
                $leisure['leisure'][] = $local;
            }
            
        }
        $Result = array();
        $type['type']= array('文化艺术','休闲情调');

        if(isset($art['art']))
        {
            $art_sort = array_column($art['art'], 'ranking');  
            array_multisort($art_sort, SORT_ASC, $art['art']);
        }

        if(isset($leisure['leisure']))
        {
            $leisure_sort = array_column($leisure['leisure'], 'ranking');  
            array_multisort($leisure_sort, SORT_ASC, $leisure['leisure']); 
        }
        $Result = array_merge($art,$leisure,$type);

        if(!empty($Result))
        {
            $return = array('status'=>true,'msg'=>'请求成功','data'=>$Result);
        }else{
            $return = array('status'=>false,'msg'=>'请求失败','data'=>[]);
        }
        echo json_encode($return,JSON_UNESCAPED_UNICODE);
    }

    /********** 本土体验中的 查看介绍，景点的详情页面数据  ***********/
    public function local_detail()
    {
        /****** 本土详情介绍  *********/
        $post = $_POST;
        $spot_name = $post['spot_name'];
        $city_id = $post['city_id'];
        $where['spot_name'] = $spot_name;
        $localDetail = Db::name('Describe')->where($where)->find();
        $localDetail['release_time'] = date('Y-m-d', $localDetail['update_time']);
        //景点封面图片 cover
        if(!empty($localDetail['picture2']))
        {
            $cover_pic = json_decode($localDetail['picture2'],true);
            foreach($cover_pic as $k => &$pic_value)
            {
                //common.php中封装的图片url解析方法
                $localDetail['image_url'][$k]= cmf_get_image_preview_url($pic_value['url']); 
            }
            unset($localDetail['picture2']);
        }
       
        
        //文字描述中的html标签转化成实体
        $localDetail['introduction'] = htmlchars($localDetail['spot_Introduction']);
        unset($localDetail['spot_Introduction']);
        $localDetail['qita_description'] = htmlchars($localDetail['other_description']);
        unset($localDetail['other_description']);
        unset($localDetail['pic']);

        if(!empty($localDetail))
        {
            $return = array('status'=>true,'msg'=>'请求成功','data'=>$localDetail);
        }else{
            $return = array('status'=>false,'msg'=>'请求失败','data'=>[]);
        }
        echo json_encode($return,JSON_UNESCAPED_UNICODE);
    }

    /*** 3F
     * 最美夜色
     ***/
    //醉美夜色 景点列表
    public function Night()
    {
         //根据传递过来的
        $post = $_POST;
        $city_id = $post['city_id'];

        $nightList = Db::name('Night')->where(array('city_id'=>$city_id))->field(array('province_id','city_id','spot_name','area_id','attr_score','play_time','pic','type','longitude','latitude','attr_score','ranking','period_time','not_modifity','suit_season'))->select();
        $nightResult = json_decode($nightList,true);

        $visual = array();
        $neon = array();
        foreach($nightResult as $kk=>&$night)
        {
            //适玩时间
            $night['tag_time'] = $this->play_time($night['play_time']);  //时间统一成小时
            $night['this_floor_index'] = 2;
            //景点封面图片 cover
            if(!empty($night['pic']))
            {
                $cover_pic =json_decode($night['pic'],true);
                foreach($cover_pic as $k => &$pic_value)
                {
                    //common.php中封装的图片url解析方法
                    $night['cover_url'] = cmf_get_image_preview_url($pic_value['url']); 
                }
                unset($night['pic']);
            }
            else{
                $unified_404 = '404/unified_404.png';
                $night['cover_url'] = cmf_get_image_preview_url($unified_404);
            }

            if($night['type'] == '视觉享受')
            {
                $visual['visual'][] = $night; 
            }
            if($night['type'] == '灯红酒绿')
            {
                $neon['neon'][] = $night;
            }
            
        }
        $Result = array();
        $type['type']= array('视觉享受','灯红酒绿');

        if(isset($visual['visual']))
        {
            $visual_sort = array_column($visual['visual'], 'ranking');  
            array_multisort($visual_sort, SORT_ASC,  $visual['visual']); 
        }

        if(isset($neon['neon']))
        {
            $neon_sort = array_column($neon['neon'], 'ranking');  
            array_multisort($neon_sort, SORT_ASC, $neon['neon']); 
        }
        $Result = array_merge($visual,$neon,$type);
        if(!empty($Result))
        {
            $return = array('status'=>true,'msg'=>'请求成功','data'=>$Result);
        }else{
            $return = array('status'=>false,'msg'=>'请求失败','data'=>[]);
        }
        echo json_encode($return,JSON_UNESCAPED_UNICODE);
    }

    /********** 醉美夜色中的 查看介绍，景点的详情页面数据  ***********/
    public function night_detail()
    {
        /****** 本土详情介绍  *********/
        $post = $_POST;
        $spot_name = $post['spot_name'];
        $city_id = $post['city_id'];
        $where['spot_name'] = $spot_name;
        $nightDetail = Db::name('Night')->where($where)->find();
        $nightDetail['release_time'] = date('Y-m-d', $nightDetail['update_time']);
        //景点封面图片 cover
        if(!empty($nightDetail['picture2']))
        {
            $cover_pic = json_decode($nightDetail['picture2'],true);
            foreach($cover_pic as $k => &$pic_value)
            {
                //common.php中封装的图片url解析方法
                $nightDetail['image_url'][$k]= cmf_get_image_preview_url($pic_value['url']); 
            }
            unset($nightDetail['picture2']);
        }
        
        //文字描述中的html标签转化成实体
        $nightDetail['introduction'] = htmlchars($nightDetail['spot_Introduction']);
        unset($nightDetail['spot_Introduction']);
        $nightDetail['qita_description'] = htmlchars($nightDetail['other_description']);
        unset($nightDetail['other_description']);
        unset($nightDetail['pic']);

        if(!empty($nightDetail))
        {
            $return = array('status'=>true,'msg'=>'请求成功','data'=>$nightDetail);
        }else{
            $return = array('status'=>false,'msg'=>'请求失败','data'=>[]);
        }
        echo json_encode($return,JSON_UNESCAPED_UNICODE);
    }

    //打乱数组
    public function shuffle_assoc($list) 
    {  
        if (!is_array($list)) return $list;  
        $keys = array_keys($list);  
        shuffle($keys);  
        $random = array();  
        foreach ($keys as $key)  
        $random[$key] = $this->shuffle_assoc($list[$key]);  
        return $random;  
    }

    /*** 4F
     * 美食诱惑
    ***/
    //美食诱惑列表
    public function Food()
    {
        $post = $_POST;
        $city_id = $post['city_id'];
    
        $willeat = array();    //必吃美食
        $localeat = array();   //本土美食
        $street = array(); //美食街区
        $arr = array();

        /*********  第一部分**********/
        /****** 单店中的必吃美食 *******/

        //必吃美食下关联的店铺
        $storefield = array('id','city_id','city_name','store_name','pic','longitude','latitude','meal_time','per_capita','address','phone','business_hours');
        $storeInfo = Db::name('Store_info')->field($storefield)->where(array('city_id'=>$city_id))->select();
        $storeResult = json_decode($storeInfo,true);
        //必吃美食 'is_hot_have'=>1  单店必吃美食
        $dishesfield = array('id','city_id','city_name','store_name','pic','is_hot_have','dishes_name','recom_sites');
        $foodList = Db::name('dishes_recommended_info') ->field($dishesfield)->where(array('city_id'=>$city_id,'is_hot_have'=>1))->select();
        $foodResult = json_decode($foodList,true);

        foreach($storeResult as $key1=>$store)
        {
            $store['tag_time'] = $this->play_time($store['meal_time']);  //时间统一成小时
            $store['this_floor_index'] = 3;
            //店铺封面
            if(!empty($store['pic']))
            {
                $cover_pic = json_decode($store['pic'],true);
                foreach($cover_pic as $k => &$pic_value)
                {
                    //common.php中封装的图片url解析方法
                    $store['pic_url']= cmf_get_image_preview_url($pic_value['url']); 
                }
            }
            else{
                $unified_404 = '404/unified_404.png';
                $store['pic_url'] = cmf_get_image_preview_url($unified_404);
            }
            foreach($foodResult as $key2=>&$f)
            {
                if($store['store_name'] == $f['store_name'])
                {
                    $f['store_type'] = 0;   //单店
                    $f['spot_name'] = $store['store_name'];  
                    $f['fen_store'] = array();
                    $f['longitude'] = $store['longitude'];
                    $f['latitude'] = $store['latitude'];
                    $f['play_time'] = $store['meal_time'];
                    $f['dianpu_image'] = $store['pic_url'];
                    $f['per_capita'] = $store['per_capita'];
                    $f['tag_time'] = $store['tag_time'];
                    $f['address'] = $store['address'];
                    $f['phone'] = $store['phone'];
                    $f['business_hours'] = $store['business_hours'];
                    $f['this_floor_index'] = $store['this_floor_index'];
                }
            }
        }

        foreach($foodResult as $key4 => &$food)
        {   
            //商品封面
            if(!empty($food['pic']))
            {
                $food_pic = json_decode($food['pic'],true);
                foreach($food_pic as $k => &$food_value)
                {
                    //common.php中封装的图片url解析方法
                    $food['cover_url']= cmf_get_image_preview_url($food_value['url']); 
                    $food['fen_storeNum']= 0; 
                }
            }
            else{
                $unified_404 = '404/unified_404.png';
                $food['cover_url'] = cmf_get_image_preview_url($unified_404);
            }
            unset($foodResult[$key4]['pic']);
            if(isset($food))
            {
                $arr[$food['dishes_name']]['place'][] = $food;  //取出数据分组
            }
        
        }

        //同一个美食放到统一数组中，美食一对多店铺
        $keyV = array_keys($arr);
        $arr = array_values($arr);
        foreach($arr as $k => &$v)
        {
            $v['spot_name'] = $keyV[$k];  
            $v['this_floor_index'] = 3; 
            foreach($v['place'] as $k1 => $v1)
            {
                $v['cover_url'] = $v1['cover_url']; //美食图片
                $v['recom_sites'] = $v1['recom_sites'];
                unset($v['place'][$k1]['recom_sites']);
            } 
            // unset($arr[$k]['place']['recom_sites']);
        }

        /******** 连锁总店中的必吃美食  ********/
        $resfield = array('id','city_id','city_name','restaurant_name','longitude','latitude','per_capita','meal_time','business_hours','address','phone','pic');
        $restaurantResult = Db::name('Restaurant_chain')->field($resfield)->where(array('city_id'=>$city_id))->select()->toArray();

        //连锁店下的 必吃美食
        $recomfield = array('id','city_id','store_name','dishes_name','pic','is_hot_have');
        $re_food = Db::name('recom_dishes')->field($recomfield)->where(array('city_id'=>$city_id,'is_hot_have'=>1))->select()->toarray(); 
        foreach($restaurantResult as $key1=>&$res)
        {
            //分店的列表
            $fieldfen = array('id','store_name','branch_name','longitude','latitude','phone','address','business_hours');
            $branchInfo = Db::name('branch')->field($fieldfen)->where(array('store_name'=>$res['restaurant_name']))->select()->toArray();
            $res['tag_time'] = $this->play_time($res['meal_time']);  //时间统一成小时
            //连锁店封面
            if(!empty($res['pic']))
            {
                $cover_pic = json_decode($res['pic'],true);
                foreach($cover_pic as $k => &$pic_value)
                {
                    //common.php中封装的图片url解析方法
                    $res['pic_url']= cmf_get_image_preview_url($pic_value['url']); 
                }
            }
            else{
                $unified_404 = '404/unified_404.png';
                $res['pic_url'] = cmf_get_image_preview_url($unified_404);
            }
            foreach($re_food as $key2=>&$f)
            {
                if($res['restaurant_name'] == $f['store_name'])
                {
                    $f['store_type'] = 1;
                    $f['spot_name'] = $res['restaurant_name'];
                    $f['city_name'] = $res['city_name'];
                    $f['fen_store'] = $branchInfo;
                    $f['longitude'] = $res['longitude'];
                    $f['latitude'] = $res['latitude'];
                    $f['play_time'] = $res['meal_time'];
                    $f['dianpu_image'] = $res['pic_url'];
                    $f['per_capita'] = $res['per_capita'];
                    $f['tag_time'] = $res['tag_time'];
                    $f['address'] = $res['address'];
                    $f['phone'] = $res['phone'];
                    $f['business_hours'] = $res['business_hours'];
                    $f['this_floor_index'] = 3;
                }
            }
        }

        foreach($re_food as $key4 => &$food)
        {   
            //商品封面
            if(!empty($food['pic']))
            {
                $food_pic = json_decode($food['pic'],true);
                if(isset($food['fen_store'])){$fenlen = count($food['fen_store']);} //分店数量
                foreach($food_pic as $k => &$food_value)
                {
                    //common.php中封装的图片url解析方法
                    $food['cover_url'] = cmf_get_image_preview_url($food_value['url']); 
                    if(isset($food['fen_store'])){$food['fen_storeNum'] = $fenlen;}
                }
            }
            else{
                $unified_404 = '404/unified_404.png';
                $food['cover_url'] = cmf_get_image_preview_url($unified_404);
            }
            unset($re_food[$key4]['pic']);
            if(isset($food))
            {
                $arr2[$food['dishes_name']]['place'][] = $food;  //取出数据分组
            }
        }
        // print_r($arr2);
        //同一个美食放到统一数组中，美食一对多店铺
        if(isset($arr2))
        {
            $keyV2 = array_keys($arr2);
            $arr2 = array_values($arr2);
            foreach($arr2 as $k => &$v)
            {
                $v['spot_name'] = $keyV2[$k];   
                $v['this_floor_index'] = 3; 
                foreach($v['place'] as $k1 => $v1)
                {
                    $v['cover_url'] = $v1['cover_url']; //美食图片
                    $v['recom_sites'] = "";
                } 
            }
            
            // print_r($arr);
            // print_r($arr2);
            //合并单店、连锁的必吃美食，统一输出
            $arr3 = [];
            foreach($arr as $k1=>&$v1){
                foreach($arr2 as $k2=>$v2){
                    if($v1['spot_name'] == $v2['spot_name']){
                        $arr3[$k1]['place'] = array_merge($v1['place'],$v2['place']);
                        $arr3[$k1]['spot_name'] = $v1['spot_name'];
                        $arr3[$k1]['cover_url'] = $v1['cover_url'];
                        $arr3[$k1]['recom_sites'] = $v1['recom_sites'];
                        $arr3[$k1]['this_floor_index'] = 3;
                    }
                }
            }
            $arr5 = array_merge($arr,$arr2);
            foreach($arr3 as $k3=>&$v3){
                foreach($arr5 as $k5=>&$v5){
                    if($v3['spot_name'] == $v5['spot_name']){
                        
                        unset($arr5[$k5]);
                    }
                }
            }
        
            $arr = array_merge($arr3,$arr5); 
        }else{
            $arr = $arr;
        }
        //    print_r($arr);exit;

        /*********  第二部分**********/
        //本土美食店铺列表
        $fieldarray = array('id','city_id','city_name','type','store_name','longitude','latitude','per_capita','meal_time','phone','address','pic','business_hours');
        $store = Db::name('Store_info')->field($fieldarray)->where(array('city_id'=>$city_id))->select();
        $localResult = json_decode($store,true);
        
        foreach($localResult as &$value)
        {
            $value['this_floor_index'] = 3;
            $value['tag_time'] = $this->play_time($value['meal_time']);  
            $value['play_time'] = $value['meal_time'];//时间统一成小时
            unset($value['meal_time']);
            $value['spot_name'] = $value['store_name'];
            unset($value['store_name']);
            if(!empty($value['pic']))
            {
                $pic = json_decode($value['pic'],true);
                foreach($pic as $k => &$p)
                {
                    //common.php中封装的图片url解析方法
                    $value['cover_url']= cmf_get_image_preview_url($p['url']); 
                }
                unset($value['pic']);
            }
            else{
                $unified_404 = '404/unified_404.png';
                $value['cover_url'] = cmf_get_image_preview_url($unified_404);
            }
            $value['store_type'] = 0;   //单店
            $value['fen_store'] = array();   
        }
        //连锁餐厅总店
        foreach($restaurantResult as &$value2)
        {
            $value2['this_floor_index'] = 3;
            $value2['tag_time'] = $this->play_time($value2['meal_time']);  //时间统一成小时
            $value2['play_time'] = $value2['meal_time'];
            unset($value2['meal_time']);
            unset($value2['pic_url']);
            if(!empty($value2['pic']))
            {
                $pic2 = json_decode($value2['pic'],true);
                foreach($pic2 as $k => &$p2)
                {
                    //common.php中封装的图片url解析方法
                    $value2['cover_url']= cmf_get_image_preview_url($p2['url']); 
                }
                unset($value2['pic']);
            }
            else{
                $unified_404 = '404/unified_404.png';
                $value2['cover_url'] = cmf_get_image_preview_url($unified_404);
            }
            
            $value2['spot_name'] = $value2['restaurant_name'];
            $value2['store_type'] = 1;  //连锁店 
            //分店的列表
            $brafield = array('id','store_name','branch_name','longitude','latitude','phone','address','business_hours');
            $branchInfo = Db::name('branch')->field($brafield)->where(array('store_name'=>$value2['restaurant_name']))->select()->toArray();
            $value2['fen_store'] = $branchInfo;
            unset($value2['restaurant_name']);
        }
        $local = array_merge($localResult,$restaurantResult);
        // $local = $this->shuffle_assoc($list);

        /*********  第三部分**********/
        //美食街区
        $foodstreet = Db::name('Food_court')->field(array('id','province_id','city_id','area_id','food_court_name','type','pic','longitude','latitude','meal_time','suit_time','period_time','not_modifity'))
        ->where(array('city_id'=>$city_id))->select();
        $foodResult = json_decode($foodstreet,true);
        foreach($foodResult as &$st)
        {
            //适玩时间
            $st['tag_time'] = $this->play_time($st['suit_time']);  //时间统一成小时
            $st['play_time'] = $st['suit_time'];
            $st['this_floor_index'] = 3;
            unset($st['suit_time'],$st['meal_time']);

            if(!empty($st['pic']))
            {
                $image = json_decode($st['pic'],true);
                foreach($image as $k => &$im)
                {
                    //common.php中封装的图片url解析方法
                    $st['cover_url']= cmf_get_image_preview_url($im['url']); 
                }
                unset($st['pic']);
            }
            
            
            unset($st['picture2']);
            $st['spot_name'] = $st['food_court_name'];
            unset($st['food_court_name']);
        }
        //美食关联店铺时，店铺详情没有录入时，特殊处理,剔除店铺
        // print_r($arr);
        // exit;
        foreach($arr as $key1=>&$yy)
        {
            foreach($yy['place'] as $key=>$ply)
            {
                if(!isset($ply['longitude']))
                {
                    unset($arr[$key1]['place'][$key]);
                }
            }
            $yy['place'] = array_merge($yy['place']);
        }

        $Result = array();
        $willeat['eat'] = $arr;  //必吃美食
        $localeat['local'] = $local;  //本土美食
        $street['street'] = $foodResult ;  //美食街区
        $type['type']= array('必吃美食','本土美食','美食街区');
        $Result = array_merge($willeat,$localeat,$street,$type);
        // print_r($Result);
        if(!empty($Result))
        {
            $return = array('status'=>true,'msg'=>'请求成功','data'=>$Result);
        }else{
            $return = array('status'=>false,'msg'=>'请求失败','data'=>[]);
        }
        echo json_encode($return,JSON_UNESCAPED_UNICODE);
    }

    /*** 5F
     * 购物街
     ***/
    //购物街列表
    public function Shop()
    {
        //购物详情列表
        ////根据传递过来的
        $post = $_POST;
        $city_id = $post['city_id'];

        $shopfield = array('id','city_id','city_name','type','shop_type','shopping_name','tebie_tuijian','tuijian_time','period_time',
        'not_modifity','shopping_time','longitude','latitude','business_hours','phone','address','pic');
        $shopList = Db::name('shopping_streets')->field($shopfield)->where(array('city_id'=>$city_id))->select();
        $shopResult = json_decode($shopList,true);

        //推荐商品店铺列表 is_specialty=>1 本土特产
        $goodsList = Db::name('goods_info')->field(array('id','goods_name','recom_sites','store_name','type','pic'))->where(array('is_specialty'=>1,'city_id'=>$city_id))->select();
        $goodsResult = json_decode($goodsList,true);
        foreach($shopResult as $key1=>&$sh)
        {
            //适玩时间
            $sh['tag_time'] = $this->play_time($sh['shopping_time']);  //时间统一成小时
            $sh['this_floor_index'] = 4;
            //店铺封面
            if(!empty($sh['pic']))
            {
                $cover_pic = json_decode($sh['pic'],true);
                foreach($cover_pic as $k => &$pic_value)
                {
                    //common.php中封装的图片url解析方法
                    $sh['pic_url']= cmf_get_image_preview_url($pic_value['url']); 
                }
            }

            //处理商品关联店铺数据
            foreach($goodsResult as $key2=>&$g)
            {   
                $g['dishes_name'] = $g['goods_name'];
                if($sh['shopping_name'] == $g['store_name'])
                {
                    $g['city_id'] = $sh['city_id'];
                    $g['spot_name'] = $sh['shopping_name'];
                    $g['longitude'] = $sh['longitude'];
                    $g['latitude'] = $sh['latitude'];
                    $g['play_time'] = $sh['shopping_time'];
                    $g['period_time'] = $sh['period_time'];
                    $g['address'] = $sh['address'];
                    $g['not_modifity'] = $sh['not_modifity'];
                    if(isset($sh['pic_url']))
                    {
                        $g['dianpu_image'] = $sh['pic_url'];
                    }
                    $g['this_floor_index'] = 4;
                    $g['shopping_time'] = $sh['shopping_time'];  //2小时
                    //适玩时间
                    $g['tag_time'] = $this->play_time($sh['shopping_time']);  //时间统一成小时
                }
            }
        }
        foreach($goodsResult as $key4 => &$goods)
        {   
            //商品封面
            if(!empty($goods['pic']))
            {
                $goods_pic = json_decode($goods['pic'],true);
                foreach($goods_pic as $k => &$good_value)
                {
                    //common.php中封装的图片url解析方法
                    $goods['cover_url']= cmf_get_image_preview_url($good_value['url']); 
                }
                $arr[$goods['goods_name']]['place'][] = $goods; //取出数据分组
            }
            
        }
        
        $keyV = array_keys($arr);
        $arr = array_values($arr);
        
        foreach($arr as $k => &$v)
        {
            $v['spot_name'] = $keyV[$k];
            foreach($v['place'] as $k1 => $v1)
            {
                $v['cover_url'] = $v1['cover_url'];
                $v['recom_sites'] = $v1['recom_sites'];
                $v['this_floor_index'] = 4;
                unset($arr[$k]['place'][$k1]['goods_name']);
                unset($arr[$k]['place'][$k1]['store_name']);
                unset($arr[$k]['place'][$k1]['pic']);
                unset($arr[$k]['place'][$k1]['recom_sites']);
            }  
        }
        // print_r($arr);
        $local_product = array();
        $pro_shops = array();
        $business_circle = array();

        foreach($shopResult as $key=>&$shop)
        {
            //适玩时间
            $shop['tag_time'] = $this->play_time($shop['shopping_time']);  //时间统一成小时
            $shop['play_time'] = $shop['shopping_time'];
            $shop['spot_name'] = $shop['shopping_name'];
            if(!empty($shop['pic']))
            {
                $picture = json_decode($shop['pic'],true);
                foreach($picture as $k=> &$picvalue)
                {
                    //common.php中封装的图片url解析方法
                    $shop['cover_url'] = cmf_get_image_preview_url($picvalue['url']); 
                }
                unset($shop['pic']);
            }
            unset($shopResult[$key]['pic'],$shop['picture2'],$shop['pic_url'],$shop['shop_type']);
            unset($shopResult[$key]['shopping_time'],$shop['tebie_tuijian'],$shop['shopping_name'],$shop['tuijian_time']);
            if($shop['type'] == '土特产店')
            {
                $pro_shops['productShops'][] = $shop;
            }
            if($shop['type'] == '购物商圈')
            {
                $business_circle['businessCircle'][] = $shop;
            }
        }
        //商品关联商店时，商店详情没有录入时，特殊处理,剔除商店
        foreach($arr as $key1=>&$yy)
        {
            foreach($yy['place'] as $key=>$ply)
            {
                if(!isset($ply['longitude']))
                {
                    unset($arr[$key1]['place'][$key]);
                }
            }
            $yy['place'] = array_merge($yy['place']);
        }


        $local_product['localProduct'] = $arr; 
        $Result = array();
        $type['type']= array('本土特产','土特产店','购物商圈');
        $Result = array_merge($local_product,$pro_shops,$business_circle,$type);

        if(!empty($Result))
        {
            $return = array('status'=>true,'msg'=>'请求成功','data'=>$Result);
        }else{
            $return = array('status'=>false,'msg'=>'请求失败','data'=>[]);
        }
        echo json_encode($return,JSON_UNESCAPED_UNICODE);
    }

    //行程景点优化的时候使用
    public function SortDis2($shortDis,$data){
        $arr = array();
        $num = count($data);
        for($i=0;$i<$num;$i++){
            for($j=1;$j<$num;$j++){
                $arr[] = [$data[$i],$data[$j]];
            }
            break;
        }
        foreach ($arr as $k => $v) {
            $dis = $this->distance($v['0']['this_lng'],$v['0']['this_lat'],$v['1']['this_lng'],$v['1']['this_lat']);
            $allDis[$v[1]['this_name']] = $dis;
        }
        asort($allDis);
        $sDis = array_keys($allDis);
        $shortDis[] = $sDis[0];//距离最短地点
        foreach ($data as $key => $value) {
            if($value['this_name'] == $sDis[0]){
                //将数组第一个城市替换成距离最短地点
                $data[0] = $value;
                unset($data[$key]);
            }
        }
        $data = array_values($data);//键值归零
        if(!empty($data[1])){
            $shortDis = $this->SortDis2($shortDis,$data);
        }
        return $shortDis;
    }
    //优化线路数据返回
    public function Optimize_line()
    {
        $cookData = $_SERVER['HTTP_COOKIE'];    
        $sessionid = substr($cookData,strpos($cookData,'=')+1);
        Session_id($sessionid);

        session_start();
        // $post = file_get_contents('php://input'); //数据量比较大的时候，用这个方式接收
        $post= $_POST;
        $post = json_decode($post['citymodel'],true);   
        $numtotal = $post['city_data']['departure_city']['city_num']; //行程的全部天数

        $citynum = $post['spot_data']['this_cityDayNum']; //当前城市的天数
    
        $this_city = $post['spot_data']['this_city'];      //当前城市
        $status = $post['spot_data']['status'];     
        $this_cityid = $post['spot_data']['this_cityid'];   //景点所属city_id
        $this_city_index = $post['spot_data']['this_city_index'];   //当前城市索引
        $this_city_lng = $post['spot_data']['this_city_lng'];   
        $this_city_lat = $post['spot_data']['this_city_lat']; 
        //当前城市景点数，购物数，美食数
        $shop_len = $post['spot_data']['shop_len'];
        $spot_len = $post['spot_data']['spot_len'];
        $eat_len = $post['spot_data']['eat_len'];

        $city_data = $post['city_data']['go_city_array'];
        //go_city_array,游玩城市的基本结构，出发城市，返回城市
        $_SESSION['city_data'] = $post['city_data']; 

        $departure_city = $post['city_data']['departure_city'];  //出发城市
        $return_city = $post['city_data']['return_city'];         //返回城市

        $len = count($city_data);

        foreach($city_data as $key=>&$city)
        {
            if($key == $this_city_index && $key < $len-1)
            {
                $middle_city = $city_data[$key+1]['city_name']; 
            }

            if($this_city_index == $key)
            {
                $first_date = $city['city_date'];    //起始日期
                break;
            }
        }

        $first_date = str_replace(".","-","$first_date");
        if($citynum == 1)     //城市只玩一天,初始日期特殊判断
        {
            for($i=0;$i<$citynum;$i++)
            {
                $dateArrray[$i] = date("Y-m-d",(strtotime($first_date) + $i*3600*24)); 
            }
        }
        if($citynum != 1)
        {
            for($i=1;$i<$citynum;$i++)
            {
                $dateArrray[$i] = date("Y-m-d",(strtotime($first_date) + $i*3600*24)); 
            }
        }

        array_unshift($dateArrray,"$first_date");
       
        //需要的基本元素
        $result['this_city'] = $this_city;
        $result['shop_len'] = $shop_len ;
        $result['spot_len'] = $spot_len;
        $result['eat_len'] = $eat_len;
        if(isset($eat_data))
        {
            $result['eat_data'] = $eat_data;
        }
        //只有一个城市时：status=3,
        //多个城市时：首个城市1，中间城市0，末尾城市2
        if($status == 3)
        {
            $result['departure_city'] = $departure_city;
            $result['return_city'] = $return_city;
        }
        if($status == 1)
        {
            $result['departure_city'] = $departure_city;
            foreach($city_data as $key=>&$city)
            {
                if($key == $this_city_index && $key < $len-1)
                {
                    $middle_city = $city_data[$key+1]['city_name']; 
                    $result['middle_city'] = $middle_city;
                }
            }
        }
        
        if($status == 0)
        { 
            foreach($city_data as $key=>&$city)
            {
                if($key == $this_city_index && $key < $len-1)
                {
                    $middle_city = $city_data[$key+1]['city_name']; 
                    $result['middle_city'] = $middle_city;
                }
            }
        }
        if($status == 2)
        { 
            $result['return_city'] = $return_city;
        }
        $result['this_city_lng'] = $this_city_lng;
        $result['this_city_lat'] = $this_city_lat;
        $result['status'] = $status;

        /*** 行程优化部分 ***/
        //关于景点的基本信息
        $spot_data = $post['spot_data']['addgo_arry'];
        //特殊处理，当数据库period_time字段为空时候（录入组没有录入）,默认为allday属性补全
        //美食街区，5F都没，都没有ranking字段,默认ranking = '10'值补全
        // print_r($spot_data);exit;
        

        foreach($spot_data as &$stemp)
        {
            if($stemp['period_time'] == '')
            {
                $stemp['period_time'] = 'allday';
            }
            if($stemp['ranking'] == '-1')
            {
                $stemp['ranking'] = '10';
            }
        }

        //美食
        if(!empty($post['spot_data']['eat_name_arry']))
        {
            $eatData = $post['spot_data']['eat_name_arry'];
            // print_r($spot_data);
            // print_r($eatData);
            // exit;
            
            //每个美食到每个景点的距离
            foreach($eatData as $key1=>$eat)
            {
                foreach($spot_data as $key2=>&$spotvalue)
                {
                    $longitude1 = $eat['this_lng']; //美食经纬度
                    $latitude1 = $eat['this_lat'];
                    $lo = $spotvalue['this_lng']; //景点经纬度
                    $la = $spotvalue['this_lat'];

                    $distance[$eat['this_name']][$spotvalue['this_name']] = getDistance($longitude1, $latitude1, $lo, $la, 2);
                }
            }

            foreach($distance as $key=>$d_value)
            {
                if(min($d_value))
                {
                    //数组一个value值来获取得到其key的值
                    $k = array_search(min($d_value), $d_value);
                    //美食与景点匹配数组
                    $r[$key] = $k;
                    //距离数组
                    $d[$key] = min($d_value);
                }
                
            }

            // print_r($r);
            // print_r($d);
            //美食绑定到距离最近的景点上
            foreach($spot_data as $key1=>&$spot)
            {
                foreach($r as $key2=>$rr)
                {
                    if($spot['this_name'] == $rr)
                    {
                        foreach($eatData as $eat)
                        {
                            foreach($d as $key3=>$dd)
                            {
                                if($eat['this_name'] == $key2)
                                { 
                                    if($eat['this_name'] == $key3)
                                    {
                                        $eatResult['city_id'] = $eat['city_id'];
                                        $eatResult['this_lng'] = $eat['this_lng'];
                                        $eatResult['this_lat'] = $eat['this_lat'];
                                        $eatResult['per_capita'] = $eat['per_capita'];
                                        $eatResult['address'] = $eat['address'];
                                        $eatResult['business_hours'] = $eat['business_hours'];
                                       
                                        $eatResult['this_img_src'] = $eat['this_img_src'];
                                        // $eatResult['js_sport_eat'] = $eat['js_sport_eat'];
                                        $eatResult['this_playtime'] = $eat['this_playtime'];
                                        $eatResult['this_tag_time'] = $eat['this_tag_time'];
                                        
                                        $eatResult['eat_to_spot'] = $dd; //美食到景点的距离
                                        // if(isset($eat['fen_data'])) //分店{ $eatResult['fen_data'] = $eat['fen_data'];}
                                    }   
                                }
                            }
                        }
                        $eatResult['this_name'] = $key2;
                        $spot['eat_info'][] = $eatResult;
                    }
                }
            }
        }
        

        $Sumtime = array_sum(array_map(create_function('$vals', 'return $vals["this_tag_time"];'),$spot_data));
        //night不可以作为首景点处理，单独拿出，再放到数组尾部
        foreach($spot_data as $key=>$v)
        {
            if($v['period_time'] == 'night')
            {
                $nData[] =  $v;
                unset($spot_data[$key]);
            }
        }
        $spot_data = array_merge($spot_data);

        $f_sort = array_column($spot_data, 'ranking');  
        array_multisort($f_sort, SORT_ASC, $spot_data); 
        if(isset($nData))
        {
            $spot_data = array_merge($spot_data,$nData);
        }
        // print_r($spot_data);
        // exit;
     
        //白天、晚上、全天
        $duringday = [];
        $night = [];
        $allday = [];

        foreach($spot_data as $key=>$s_value)
        {
            if($s_value['period_time'] == 'day')
            {
                $duringday[] =  $s_value;
            }
            if($s_value['period_time'] == 'night')
            {
                $night[] =  $s_value;
            }
            if($s_value['period_time'] == 'allday')
            {
                $allday[] =  $s_value;
            }
        }
        $sort1 = array_column($duringday, 'ranking');  
        array_multisort($sort1, SORT_ASC, $duringday);
        $sort2 = array_column($night, 'ranking');  
        array_multisort($sort2, SORT_ASC, $night);
        $sort3 = array_column($allday, 'ranking');  
        array_multisort($sort3, SORT_ASC, $allday); 

        //day元素之间的距离
        $count1 = count($duringday);
        if($count1>=2){

            $shortDis = array();
            $return=$this->SortDis2($shortDis,$duringday);
            // print_r($return);
            // exit;
            foreach ($return as $k => $v) {
                foreach ($duringday as $key1 => $value1) {
                    if($v == $value1['this_name']){
                        $array[] = $value1;
                    }
                }
            }
        
            $arr = array($duringday[0]);
            $d_array = array_merge($arr,$array);

            $num = count($d_array);
            for($i=0;$i<$num;$i++){
                for($j=$i+1;$j<$num;$j++){
                    $dis[]= getDistance($d_array[$i]['this_lng'],$d_array[$i]['this_lat'],$d_array[$j]['this_lng'],$d_array[$j]['this_lat'],2);break;
                }
            }
            $d_array = array_values($d_array);
            foreach($d_array as $key1=>$a)
            {
                foreach($dis as $key2=>$d)
                {
                    if($key1 == $key2)
                    {
                        $d_array[$key1+1]['dis'] = $d;
                    }
                }
            }
        }else{
            $d_array = $duringday;
        }

        //night元素之间的距离
        $count2 = count($night);
        if($count2>=2){
            $shortDis2 = array();
            $return=$this->SortDis2($shortDis2,$night);

            foreach ($return as $k => $v) {
                foreach ($night as $key1 => $value1) {
                    if($v == $value1['this_name']){
                        $array2[] = $value1;
                    }
                }
            }

            $arr = array($night[0]);
            $n_array = array_merge($arr,$array2);
            $num = count($n_array);
            for($i=0;$i<$num;$i++){
                for($j=$i+1;$j<$num;$j++){
                    $dis2[]= getDistance($n_array[$i]['this_lng'],$n_array[$i]['this_lat'],$n_array[$j]['this_lng'],$n_array[$j]['this_lat'],2);break;
                }
            }
            $n_array = array_values($n_array);
            foreach($n_array as $key1=>$a)
            {
                foreach($dis2 as $key2=>$d)
                {
                    if($key1 == $key2)
                    {
                        $n_array[$key1+1]['dis'] = $d;
                    }
                }
            }
            $sort2 = array_column($n_array, 'not_modifity');  //固定时长的夜晚演出放在夜晚的第一个位置
            array_multisort($sort2, SORT_DESC, $n_array);
        }else{
            $n_array = $night;
        }
 
        // print_r($n_array);
        // exit;
        //allday元素之间的距离
        $count3 = count($allday);

        if($count3>=2){

            $shortDis3 = array();
            $return=$this->SortDis2($shortDis3,$allday);
            foreach ($return as $k => $v) {
                foreach ($allday as $key1 => $value1) {
                    if($v == $value1['this_name']){
                        $array3[] = $value1;
                    }
                }
            }
    
            $arr = array($allday[0]);
            $all_array = array_merge($arr,$array3);
            $num = count($all_array);
            for($i=0;$i<$num;$i++){
                for($j=$i+1;$j<$num;$j++){
                    $dis3[]= getDistance($all_array[$i]['this_lng'],$all_array[$i]['this_lat'],$all_array[$j]['this_lng'],$all_array[$j]['this_lat'],2);break;
                }
            }
            $all_array = array_values($all_array);
            foreach($all_array as $key1=>$a)
            {
                foreach($dis3 as $key2=>$d)
                {
                    if($key1 == $key2)
                    {
                        $all_array[$key1+1]['dis'] = $d;
                    }
                }
            }
        }
        else{
            $all_array = $allday;
        }


        $daytime = array_sum(array_map(create_function('$vals', 'return $vals["this_tag_time"];'),$duringday));
        $nighttime = array_sum(array_map(create_function('$vals', 'return $vals["this_tag_time"];'),$night));
        $alldaytime = array_sum(array_map(create_function('$vals', 'return $vals["this_tag_time"];'),$allday));

        $firstspot = $spot_data[0]; //根据ranking确定首景点
        // print_r($firstspot);
    
        //每天的游玩时段
        if(isset($_SESSION['dayTime']))
        {
            $groupData = $_SESSION['dayTime'];
        }else{
            for($i=0;$i<$len;$i++)
            {
                $groupData[] = array();
            }
        }

        foreach($post['city_data']['go_city_array'] as $key=>$vgh)
        {
            if($key == $this_city_index){
                $groupData[$key] = $vgh['timeData'];
                $grouporg = $vgh['timeData'];
            }
        }

        $_SESSION['dayTime'] = $groupData;
        // print_r($group);
        // exit;
        //存入临时变量
        foreach($grouporg as $org)
        {
            $group[] = $org['dayTime'];
        }
        
        $a = $group;
        $groupTemp = $group;
        foreach($group as &$g)
        {
            $g = explode("-",$g);
        }

        foreach($group as $key=>&$t)
        {
            $t['betw'] = $a[$key];
            $t['start'] = $t[0];
            $t['end'] = $t[1];
            $t['totaltime'] = $t[1] - $t[0];
            if(('18:00' - $t[0]) < 0){
                $t['dtime'] = 0;
            }else{
                if($t[1] == '18:00' || $t[1] > '18:00')
                {
                    $t['dtime'] = '18:00' - $t[0];
                }
                if($t[1] < '18:00')
                {
                    $t['dtime'] = $t[1] - $t[0];
                }
            }

            if(($t[1] - '18:00') < 0){
                $t['ntime'] = 0;
            }else{
                if($t[0] == '18:00' || $t[0] < '18:00')
                {
                    $t['ntime'] = $t[1] - '18:00';
                }
                if($t[0] > '18:00')
                {
                    $t['ntime'] = $t[1] - $t[0];
                }
            }
            unset($t[0]);
            unset($t[1]);
        }
        // print_r($group);
        $duringSum = array_sum(array_map(create_function('$vals', 'return $vals["dtime"];'),$group));
        $nightSum = array_sum(array_map(create_function('$vals', 'return $vals["ntime"];'),$group));
        $totalSum = array_sum(array_map(create_function('$vals', 'return $vals["totaltime"];'),$group));
      
        //////
        // print_r($d_array);
        //距离转换成时间
        if($count1>=2)
        {
            foreach($d_array as &$dd)
            {
                if(isset($dd['dis']))
                {
                    if($dd['dis'] <= 80){$dd['traffic_time'] = round($dd['dis']/30,1);}
                    if($dd['dis'] > 80){$dd['traffic_time'] = round($dd['dis']/60,1);}
                }
            }
        }
        if($count2>=2)
        {
            foreach($n_array as &$nn)
            {
                if(isset($nn['dis']))
                {
                    if($nn['dis'] <= 80){$nn['traffic_time'] = round($nn['dis']/30,1);}
                    if($nn['dis'] > 80){$nn['traffic_time'] = round($nn['dis']/60,1);}
                }
            }
        }
        
        if($count3>=2)
        {
            foreach($all_array as &$aa)
            {
                if(isset($aa['dis']))
                {
                    if($aa['dis'] <= 80){$aa['traffic_time'] = round($aa['dis']/30,1);}
                    if($aa['dis'] > 80){$aa['traffic_time'] = round($aa['dis']/60,1);}
                }
            }
        }
        
        //特殊情况:只选择了夜景
        foreach($spot_data as $vals)
        {
            if($vals['period_time'] == 'day')
            {
                $daytag = 1;
            }
            if($vals['period_time'] == 'allday')
            {
                $alldaytag = 1;
            }
        }
        if(!isset($daytag) && !isset($alldaytag))
        {
            $n_array = $spot_data;
            for($i=0;$i<$citynum;$i++)
            {
                $day[] = [];

                $sum = 0;  
                foreach($group as $key1=>$g_value)
                {
                    if($i == $key1)
                    {
                        //只有夜景
                        foreach($n_array as $key2=>$n_value)
                        {
                            if(isset($n_value['traffic_time']))
                            {
                                $sum += $n_value['traffic_time'];
                            }
                            
                            $sum += $n_value['this_tag_time'];
                            if($sum < $group[$key1]['ntime'])
                            {
                                $day[$i]['day'][] = $n_value;
                                unset($n_array[$key2]);
                            }
                        }
                        
                    }
                }
                if(!empty($n_array))
                {
                    $n_array = array_merge($n_array); 
                }     
            }
        }
        // print_r($day);
        // print_r($d_array);
        // exit;
        /*** 情况一:首景点选择的是全天元素  ***/
        $firsttemp = $firstspot; //首景点临时变量
        // print_r( $firstspot);
        // exit;
        if($firstspot['period_time'] == 'allday')
        {
            if($firstspot['this_tag_time'] + $daytime < $duringSum)
            {
                for($i=0;$i<$citynum;$i++)
                {
                    $day[] = [];

                    $sum1 = 0;  //白天

                    foreach($group as $key1=>$g_value)
                    {
                        if($i == $key1)
                        {
                            if(isset($firsttemp))
                            {
                                //首景点是全景时先放进第一天
                                if($firsttemp['this_tag_time'] < $group[0]['totaltime'])
                                {
                                    $day[0]['day'][] = $firsttemp;
                                    $sum1 = $firsttemp['this_tag_time'];
                                    unset($firsttemp);
                                    //已经放进去的全景，从all_array数组剔除
                                    foreach($all_array as $key2=>$a_value)
                                    {
                                        if($a_value['this_name'] == $firstspot['this_name'])
                                        {
                                            unset($all_array[$key2]);
                                        }
                                    }
                                    $all_array = array_merge($all_array); 
                                }else{
                                    $sum1 = 0;
                                }
                            }

                            //白
                            if(!empty($d_array))
                            {
                                foreach($d_array as $key2=>$d_value)
                                {
                                    if(isset($d_value['traffic_time']))
                                    {
                                        $sum1 += $d_value['traffic_time'];
                                    }
                                    
                                    $sum1 += $d_value['this_tag_time'];
                                    if($sum1 < $group[$key1]['dtime'])
                                    {
                                        $day[$i]['day'][] = $d_value;
                                        unset($d_array[$key2]);
                                    }
                                }
                            }
                        }
                    }
                    if(!empty($d_array)){ $d_array = array_merge($d_array);}

                }
            }else{
                foreach($spot_data as $key=>$spotValue)
                {
                    if($spotValue['this_tag_time'] + $daytime < $duringSum)
                    {
                        if($spotValue['period_time'] != 'night')
                        {
                            $firsttemp2 = $spotValue;
                            $temp2 = $firsttemp2;
                        }
                        break;
                    }
                } 
                if(!isset($firsttemp2))
                {
                    if(isset($d_array))
                    {
                        $sort3 = array_column($d_array, 'this_lng');  
                        array_multisort($sort3, SORT_DESC, $d_array); 
                        $firsttemp3 = $d_array[0];
                    }
                    // print_r($d_array);
                    for($i=0;$i<$citynum;$i++)
                    {
                        $day[] = [];
                        $sum1 = 0;
                        foreach($group as $key1=>$g_value)
                        {
                            if($i == $key1)
                            {
                                if(isset($firsttemp3))
                                {                            
                                    foreach($d_array as $key2=>$d_value)
                                    {
                                        if(isset($d_value['traffic_time']))
                                        {
                                            $sum1 += $d_value['traffic_time'];
                                        }
                                        
                                        $sum1 += $d_value['this_tag_time'];
                                        if($sum1 < $group[$key1]['dtime'])
                                        {
                                            $day[$i]['day'][] = $d_value;
                                            unset($d_array[$key2]);
                                        }
                                    }
                                    $d_array = array_merge($d_array);
                                }else{
                                    $sort4 = array_column($all_array, 'this_lng');  
                                    array_multisort($sort4, SORT_DESC, $all_array); 
                                    $firsttemp3 = $all_array[0];
                                    $temp3 = $firsttemp3;
                                    if($temp3['this_tag_time'] < $group[0]['totaltime'])
                                    {
                                        $day[0]['day'][] = $temp3;
                                        $sum1 = $temp3['this_tag_time'];
                                        unset($temp3);
                                        //若是全景，已经放进去的全景，从all_array数组剔除
                                        if($firsttemp3['period_time'] == 'allday')
                                        {
                                            foreach($all_array as $key2=>$a_value)
                                            {
                                                if($a_value['this_name'] == $firsttemp3['this_name'])
                                                {
                                                    unset($all_array[$key2]);
                                                }
                                            }
                                            $all_array = array_merge($all_array);
                                        }
                                    }else{
                                        $sum1 = 0;
                                    }

                                    if(!empty($d_array))
                                    {
                                        foreach($d_array as $key2=>$d_value)
                                        {
                                            if(isset($d_value['traffic_time']))
                                            {
                                                $sum1 += $d_value['traffic_time'];
                                            }
                                            
                                            $sum1 += $d_value['this_tag_time'];
                                            if($sum1 < $group[$key1]['dtime'])
                                            {
                                                $day[$i]['day'][] = $d_value;
                                                unset($d_array[$key2]);
                                            }
                                        }
                                    }
                                    if(!empty($d_array)){ $d_array = array_merge($d_array);}
                                }
                            }
                        }
                    }
                    
                }else{
                    for($i=0;$i<$citynum;$i++)
                    {
                        $day[] = [];

                        $sum1 = 0;  

                        foreach($group as $key1=>$g_value)
                        {
                            if($i == $key1)
                            {
                                if($temp2['this_tag_time'] < $group[0]['totaltime'])
                                {
                                    $day[0]['day'][] = $temp2;
                                    $sum1 = $temp2['this_tag_time'];
                                    unset($temp2);
                                    //若是全景，已经放进去的全景，从all_array数组剔除
                                    if($firsttemp2['period_time'] == 'allday')
                                    {
                                        foreach($all_array as $key2=>$a_value)
                                        {
                                            if($a_value['this_name'] == $firsttemp2['this_name'])
                                            {
                                                unset($all_array[$key2]);
                                            }
                                        }
                                        $all_array = array_merge($all_array);
                                    }
                                    //若是白景，已经放进去的白景，从d_array数组剔除
                                    if($firsttemp2['period_time'] == 'day')
                                    {
                                        foreach($d_array as $key2=>$d_value)
                                        {
                                            if($d_value['this_name'] == $firsttemp2['this_name'])
                                            {
                                                unset($d_array[$key2]);
                                            }
                                        }
                                        $d_array = array_merge($d_array);
                                    }
                                     
                                }else{
                                    $sum1 = 0;
                                }
                                //白
                                if(!empty($d_array))
                                {
                                    foreach($d_array as $key2=>$d_value)
                                    {
                                        if(isset($d_value['traffic_time']))
                                        {
                                            $sum1 += $d_value['traffic_time'];
                                        }
                                        
                                        $sum1 += $d_value['this_tag_time'];
                                        if($sum1 < $group[$key1]['dtime'])
                                        {
                                            $day[$i]['day'][] = $d_value;
                                            unset($d_array[$key2]);
                                        }
                                    }
                                }
                            }
                        }
                        if(!empty($d_array)){ $d_array = array_merge($d_array);}
                    }
                }  
            }
        } 
        // print_r($day);
        //  exit;
       
        /*** 情况二：首景点是白天元素 ***/
        if($firstspot['period_time'] == 'day')
        {
            for($i=0;$i<$citynum;$i++)
            {
                $day[] = [];

                $sum1 = 0;  //白天
                foreach($group as $key1=>$g_value)
                {
                    if($i == $key1)
                    {
                        //白
                        if(!empty($d_array))
                        {
                            foreach($d_array as $key2=>&$d_value)
                            {
                                if(isset($d_value['traffic_time']))
                                {
                                    $sum1 += $d_value['traffic_time'];
                                }
                                $sum1 += $d_value['this_tag_time'];
                                if($sum1 < $group[$key1]['dtime'])
                                {
                                    $day[$i]['day'][] = $d_value;
                                    unset($d_array[$key2]);
                                }
                            }
                        }
                    }
                }
                if(!empty($d_array))
                {
                    $d_array = array_merge($d_array); 
                }     
            }
        }
        // print_r($day);
        // exit;
        //计算每天的适玩时间总和,便于计算每天还剩余多少白天时间
        foreach($day as $key=>$v)
        {
            if(!empty($v))
            {
                foreach($v as $vv)
                {
                    $this_tag_time[] = array_sum(array_map(create_function('$vals', 'return $vals["this_tag_time"];'),$vv));
                }
               
            }else{
                $this_tag_time[] = 0;
            }
        }
        
        // print_r($this_tag_time);
        foreach($this_tag_time as $k1=>$tag)
        {
            foreach($group as $k2=>$gg)
            {
                if($k1 == $k2)
                {
                    $poor[] = $gg['dtime'] - $tag; //每天白天的剩余时间
                }                                                                                           
            }
        }

        //数组中追加全景
        foreach($day as $k1=>$val)
        {
            $sum3 = 0;
            foreach($poor as $k2=>$p)
            {
                if(!empty($all_array))
                {
                    if($k1 == $k2)
                    {
                        foreach($all_array as $key2=>$a_value)
                        {
                            if(isset($a_value['traffic_time']))
                            {
                                $sum3 += $a_value['traffic_time'];
                            }
                            
                            $sum3 += $a_value['this_tag_time'];
                            if($sum3 < $p)
                            {
                                $day[$k1]['day'][] = $a_value;
                                unset($all_array[$key2]);
                            }
                        }
                    }  
                }
            }
        }
        if(!empty($all_array))
        {
            $all_array = array_merge($all_array); 
        }   
        //  print_r($day);
        foreach($day as $key=>$v)
        {
            if(!empty($v))
            {
                foreach($v as $vv)
                {
                    $tag_time[] = array_sum(array_map(create_function('$vals', 'return $vals["this_tag_time"];'),$vv));
                }
            }else{
                $tag_time[] = 0;
            }
        }
        // print_r($tag_time);
        foreach($tag_time as $k1=>$tag)
        {
            foreach($group as $k2=>$gg)
            {
                if($k1 == $k2)
                {
                    $poor2[] = $gg['totaltime'] - $tag;
                }
            }
        }

        //数组中追加夜景
        foreach($day as $k1=>$val)
        {
            $sum4 = 0;
            foreach($poor2 as $k2=>$p)
            {
                if(!empty($n_array))
                {
                    foreach($group as $key1=>$g_v)
                    {
                        if($group[$key1]['ntime'] != 0)
                        {
                            if($k1 == $key1)
                            {
                                if($k1 == $k2)
                                {
                                    foreach($n_array as $key2=>$n_value)
                                    {
                                        if(isset($n_value['traffic_time']))
                                        {
                                            $sum4 += $n_value['traffic_time'];
                                        }
                                        $sum4 += $n_value['this_tag_time'];

                                        if($sum4 < $group[$key1]['ntime'])
                                        {
                                            if($sum4 < $p)
                                            {
                                                $day[$k1]['day'][] = $n_value;
                                                unset($n_array[$key2]);
                                            }  
                                        }
                                    }
                                }  
                            }
                            
                        }
                    }
                }
            }
        }
        
        if(!empty($n_array))
        {
            $n_array = array_merge($n_array); 
        }   

        //多出的数据再处理,放入最后一天 (可能会超出范围)
        $remain = array_merge($n_array,$all_array,$d_array);

        $len = count($day);
        if(!empty($remain))
        {
            if(isset($day[$len-1]['day'])) //最后一天之前有数据时
            {
                foreach($remain as $key=>$value)
                {
                    array_unshift($day[$len-1]['day'],$value); 
                }
                foreach($day[$len-1]['day'] as $key=>$v)
                {
                    if($v['period_time'] == 'night')
                    {
                        $redata[] = $v;   
                        unset($day[$len-1]['day'][$key]);   
                    }
                }
                $day[$len-1]['day'] = array_merge($day[$len-1]['day']);

                if(isset($redata))
                {
                    foreach($redata as $re)
                    {
                        array_push($day[$len-1]['day'],$re); 
                    }
                }
            }else{    //最后一天之前没有任何数据
                // echo 9;
                foreach($remain as $key=>$value)
                {
                    array_unshift($day[$len-1],$value); 
                }
                foreach($day[$len-1] as $key=>$v)
                {
                    if($v['period_time'] == 'night')
                    {
                        $redata[] = $v;   
                        unset($day[$len-1][$key]);   
                    }
                }
                $day[$len-1]['day'] = array_merge($day[$len-1]);

                if(isset($redata))
                {
                    foreach($redata as $re)
                    {
                        array_push($day[$len-1]['day'],$re); 
                    }
                }
            }
        } 


        //日期匹配到每天
        foreach($dateArrray as $key1=>$dater)
        {
            foreach($day as $key2=>$yy)
            {
                if($key1 == $key2)
                {
                    $day[$key2]['of_date'] = $dater;
                    $day[$key2]['date'] = date('m.d',strtotime($dater));   
                }
            }
        }
        

        //计算每天的时间总和（景点适玩时间、交通时间、美食时间）
        foreach($day as $key1=>$vvv)
        {
            if(isset($vvv['day']))
            {
                $len = count($vvv['day']);
                if($len >1)
                { 
                    foreach($vvv['day'] as $key2=>$vs)
                    {
                        if($key2 < count($vvv['day'])-1)
                        {
                            $dist2[$key1][] =getDistance($vvv['day'][$key2]['this_lng'], $vvv['day'][$key2]['this_lat'],
                            $vvv['day'][$key2+1]['this_lng'], $vvv['day'][$key2+1]['this_lat'], 2); 
                        }
                        unset($day[$key1]['day'][$key2]['traffic_time']);
                        unset($day[$key1]['day'][$key2]['dis']);
                    }
                }
                if(isset($day[$key1]['day'][$len-1]['traffic_time'])) {unset($day[$key1]['day'][$len-1]['traffic_time']);}
                if(isset($day[$key1]['day'][$len-1]['dis'])){unset($day[$key1]['day'][$len-1]['dis']);}
            }
        }

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
                            $day[$k1]['day'][$k3+1]['traffic_distance'] =$v;
                        
                            if($v<= 80){$day[$k1]['day'][$k3+1]['traffic_time'] = round($v/30,1);}
                            if($v> 80){$day[$k1]['day'][$k3+1]['traffic_time'] = round($v/60,1);}
                        }
                    } 
                }
            }
            
        }

        foreach($day as &$dd_value)
        {
            $playtimeNum = 0;
            $eattimeNum = 0;
            $traffictimeNum = 0;
            if(isset($dd_value['day']))
            {
                foreach($dd_value['day'] as $dd_va)
                {
                    //每天景点适玩时间之和
                    $playtimeNum += $dd_va['this_tag_time'];

                    //每天美食时间之和(暂时不计算到行程中)
                    // if(isset($dd_va['eat_info']))
                    // {
                    //     foreach($dd_va['eat_info'] as $eatValue)
                    //     {
                    //         // $eattimeNum +=  $eatValue[''];
                    //     }
                    // }

                    //每天交通时间之和
                    if(isset($dd_va['traffic_time'])){$traffictimeNum += $dd_va['traffic_time'];}
                
                }
                $dd_value['playtimeNum'] = $playtimeNum;
                $dd_value['traffictimeNum'] = $traffictimeNum;
                $dd_value['reality_time'] = $playtimeNum + $traffictimeNum;
                //以0.5为刻度
                $wwww = $playtimeNum + $traffictimeNum;
                if(ceil($wwww) == $wwww)
                {
                    $dd_value['time'] = $playtimeNum + $traffictimeNum;
                }else{
                    $TimeSum = $playtimeNum + $traffictimeNum;
                    $TimeSum = sprintf('%.1f', (float)$TimeSum);
                    $hy=explode(".",$TimeSum);
                    if($hy[1] > 5){ $TimeSum = $hy[0] + 1;}
                    if($hy[1] < 5){ $TimeSum = $hy[0] + 0.5;}
                    if($hy[1] = 5){ $TimeSum = $TimeSum;}
                    $dd_value['time'] = $TimeSum;
                }
            }else{
                $dd_value['time'] = 0;
            }
            
        }

        //每天的开始时间
        foreach($day as $kk1=>&$valuesData)
        {
            foreach($groupTemp as $kk2=>$groupValue)
            {
                if($kk1 == $kk2)
                {
                    $valuesData['start_clock'] = substr($groupValue,0,strpos($groupValue, '-'));   
                }
            } 
        }

        $result['day_arry'] = $day;
        $result['city_id'] = $this_cityid; //当前城市id

        //原始的数据格式存到session
        $_SESSION['data'] = $post;
        //处理后的结果存到session
        $_SESSION['result'] = $result;
        //计算每天的结束时间
        foreach($result['day_arry'] as &$Value2)
        {
            if(!isset($Value2['day'])){$Value2['day'] = [];}

            $start_clock = $Value2['start_clock'];
            $time =  $Value2['time'];
            $array= explode(':',$start_clock);
            if(strstr($start_clock, '30') == true)
            {
                $start_clock = $array[0].'.'.'5';
                $siTime = floatval($time) + floatval($start_clock); 
                
            }else{
                $start_clock = $array[0];
                $siTime = floatval($time) + floatval($start_clock); 
            }

            $array2 = explode('.',$siTime);
            if(strstr($siTime, '.5') == true)
            {
                $resultsTime = $array2[0].':30';
            }else{
                $resultsTime = $array2[0].':00';
            }
            $temp = explode(':',$resultsTime);
            if($temp[0] < 10)
            {
                $resultsTime = '0'.$temp[0].':'.$temp[1];
            }
            $Value2['resultsTime'] = $resultsTime;
        }
        if($result)
        {
            $return = array('status'=>true,'msg'=>'请求成功','data'=>$result);
        }else{
            $return = array('status'=>false,'msg'=>'请求失败','data'=>[]);
        }
        echo json_encode($return,JSON_UNESCAPED_UNICODE);
    }

    //已选择的酒店列表
    public function chosehotel()
    {
        $cookData = $_SERVER['HTTP_COOKIE'];   
        $sessionid = substr($cookData,strpos($cookData,'=')+1);
        Session_id($sessionid); 

        session_start();
        $post = input('post.');
        $city_daynum = $post['city_daynum'];  //该城市游玩天数
        $of_date = $post['of_date'];  //该城市的开始日期
        for($i=0;$i<$city_daynum;$i++){
            $chosehotel[$i]['of_date'] = date("Y-m-d",(strtotime($of_date) + $i*3600*24));
            $chosehotel[$i]['date'] = str_replace('-','.',date("m-d",(strtotime($of_date) + $i*3600*24)));
            $chosehotel[$i]['Day'] = $i+1;
        }
        //之前该城市已经选择了酒店,先渲染出来
        if(isset($_SESSION['hotelData'])){
            $hotelData = $_SESSION['hotelData'];
            foreach($hotelData['hotel'] as $key1=>$hlv){
                foreach($chosehotel as $key2=>&$chose){
                    if($key1 == $key2){
                        if($hlv['date'] == $chose['date']){
                            $chose['Detail'] = $hlv;
                            $chose['HotelId'] = $hlv['hotel_id'];
                            $chose['LowRate'] = $hlv['LowRate'];
                        }
                    }
                }
            }
        }
        if($chosehotel)
        {
            $return = array('status'=>true,'msg'=>'请求成功','data'=>$chosehotel);
        }else{
            $return = array('status'=>false,'msg'=>'请求失败','data'=>[]);
        }
        echo json_encode($return,JSON_UNESCAPED_UNICODE);
       
    }
    //行程总览(城市已经安排的状态下)
    public function TripVisit()
    {
        $cookData = $_SERVER['HTTP_COOKIE'];   
        $sessionid = substr($cookData,strpos($cookData,'=')+1);
        Session_id($sessionid); 

        session_start();
        $citybase = $_SESSION['city_data'];
        $go_city_array = $citybase['go_city_array'];
 
        $departure_city = $citybase['departure_city'];
        $return_city = $citybase['return_city'];
        //城市个数
        $cityNumber = count($go_city_array);

        $post = $_POST;    //接收最新的行程线路数据 
        $nowcity = $post['city'];  //当前正在制作的城市
        $this_city_lat = $post['this_city_lat']; 
        $this_city_lng = $post['this_city_lng'];
        $this_city_index = $post['this_city_index'];  //当前正在制作的城市的索引值
        $city_id = $post['city_id'];

        $post = json_decode($post['citymodel'],true); 
        

        $thisData = $post;
        $tempArray = $post;

        // //所有城市组合的初始化
        if(isset($_SESSION['list']))
        {
            $list = $_SESSION['list'];
        }else{
            // for($i=0;$i<$cityNumber;$i++)
            // {
            //     $list[] = [];  
            // }  
            $list = array(array());
        }
        foreach($tempArray as $key=>&$va)
        {
            if(!empty($va['day']))
            {
                $tempArray[$key] = $va['day'];
            }else{  //当某些天没有选择景点的时候，直接赋值空，距离为0
                $tempArray[$key] = array();
            }   
        }

        //每天景点之间的距离 (此时没有选择任何的酒店) 
        foreach($tempArray as $key2=>&$spot_value)
        {
            $sum = 0;
            $len = count($spot_value);
            for($i=0;$i < $len-1;$i++)
            {
                if($len > 1)
                { 
                    $dist = getDistance($spot_value[0]['this_lng'], $spot_value[0]['this_lat'], 
                    $spot_value[1]['this_lng'], $spot_value[1]['this_lat'], 2);
                    unset($spot_value[0]);
                    $spot_value = array_merge($spot_value);
                    $sum += $dist;
                }
            }
            $juliInfo[]['SpotDisSum'] = round($sum);
        }
     

        foreach($juliInfo as $key2=>$juli)
        {
            foreach($thisData as $key1=>&$ttValue)
            {
                if($key1 == $key2)
                {
                    $ttValue['SpotDisSum'] = $juli['SpotDisSum'];
                }
            }
        }

        //城际交通方式
        $dep_tra_name = $go_city_array[0]['city_trc_name'];  //出发城市的交通方式

        $dep_city = $departure_city['city_name'];    //出发城市名   
        $re_way = $return_city['city_trc_name'];    //返回城市的交通方式
        $return_name = $return_city['city_name'];   //返回城市名
        $station_longitude = $return_city['station_longitude'];   //返回的站点的经纬度
        $station_latitude = $return_city['station_latitude'];  
        if(isset($return_city['station']))
        {
            $station = $return_city['station'];   //返回的站点名称
        }else{
            $station = '';
        }

        //返回的dis
        $dis = $return_city['dis'];
        $flightTime =  $return_city['flightTime'];
        $trainTime =  $return_city['trainTime'];
        $trafficTime =  $return_city['trafficTime'];

        $array = array();
        if($re_way == '飞机交通')
        {
            $tooltime  = $flightTime ;
        }
        if($re_way  == '铁路交通')
        {
            $tooltime  = $trainTime;
        }
        if($re_way  == '其他交通')
        {
            $tooltime  = $trafficTime;
        }

        $start_city = $go_city_array[$cityNumber-1]['city_name'];

        $lastlen = count($go_city_array[$cityNumber-1]['timeData']);
        if($lastlen >1)
        {
            $start_time = $go_city_array[$cityNumber-1]['timeData'][$lastlen-1]['date'];
        }else{
            $start_time = $go_city_array[$cityNumber-1]['timeData'][0]['date'];
        }

        $array = array(
            'start_city' => $start_city,
            'city_date' => $start_time,
            'city_name' => $return_name,
            'city_trc_name' => $re_way,
            'dis' => $dis,
            'station_longitude' => $station_longitude,  
            'station_latitude' => $station_latitude,  
            'station' => $station,
            'tooltime' => $tooltime
        );
 
        foreach($go_city_array as $k3 => &$g)
        {
            if($cityNumber > 1)
            {
                if($k3 == 0)
                {
                    $g['start_city'] = $dep_city;
                }else{
                    $go_city_array[$k3]['start_city'] = $go_city_array[$k3-1]['city_name'];
                }
            }else{
                $g['start_city'] = $dep_city;
            }
            
            if($g['city_trc_name'] == '飞机交通')
            {
                $g['tooltime']  = $g['flightTime'];
            }
            if($g['city_trc_name'] == '铁路交通')
            {
                $g['tooltime'] = $g['trainTime'];;
            }
            if($g['city_trc_name'] == '其他交通')
            {
                $g['tooltime']  = $g['trafficTime'];
            } 
            $g['city_date'] = $g['timeData'][0]['date'];
            $t = $g['city_date'];

            $g['city_date2'] = date("Y-m-d",(strtotime($t) + ($g['city_daynum']-1)*3600*24));
            
            unset($g['timeData'],$g['latitude'],$g['longitude'],$g['date'],$g['id'],$g['city_id'],$g['province_id']);
            unset($g['flightTime'],$g['trainTime'],$g['trafficTime'],$g['img_url'],$g['fit_day'],$g['city_daynum'],$g['adult'],$g['children']);
        }   
        array_push($go_city_array,$array);
        
        foreach($go_city_array as $kk1=>$traValue)
        { 
            foreach($thisData as $kk2=>&$ttValue)
            {
                // $ttValue['of_date'] = $ttValue['timeData'][0]['date'];
                // $atemp = str_replace('.','-',$traValue['city_date']);
                if(strtotime($traValue['city_date']) == strtotime($ttValue['of_date']))
                {
                    $ttValue['traffic'] = $traValue;
                }
                $ttValue['city'] = $nowcity;
            }
        }

        //每个城市的每天的景点数据放到各自对应的空间中
        $thisresult['day_arry'] = $thisData;
        $thisresult['this_city'] = $nowcity;
        $thisresult['this_city_lat'] = $this_city_lat;
        $thisresult['this_city_lng'] = $this_city_lng;
        $thisresult['city_id'] = $city_id;
        // foreach($list as $key=>$lValue)
        // {
        //     if($this_city_index == $key)
        //     {
        //         $list[$key] = $thisresult;
        //     } 
        // }
        $list[$this_city_index] = $thisresult;

        //如果选择了酒店,酒店匹配到对应的日期中
        if(isset($_SESSION['hotelData']))
        {
            $hotelData = $_SESSION['hotelData'];
            if(isset($hotelData['hotel']))
            {
                foreach($hotelData['hotel'] as $HH)
                {
                    // 匹配到thisData中
                    foreach($thisData as $ke2=>&$thisvalue)
                    {
                        if($thisvalue['date'] == $HH['date']){$thisData[$ke2]['hotel'] = $HH;}
                    } 
      
                    //匹配到list中
                   foreach($list as $ke3=>&$Lvalue)
                   {
                       if(isset($Lvalue['day_arry']))
                       {
                           foreach($Lvalue['day_arry'] as $ke4=>&$dValue)
                           {   
                               if($dValue['date'] == $HH['date']){$dValue['hotel'] = $HH;}
                           }
                       }
                   }  
                } 
            } 
        }
        
        $_SESSION['list'] = $list;
        $_SESSION['go_city'] = $go_city_array;

        $result['info'] = $thisData;
        $_SESSION['info2'][$this_city_index] = $thisData;
        $_SESSION['tra'] = $go_city_array;

        $result['tra'] = $go_city_array;
        if($result)
        {
            $return = array('status'=>true,'msg'=>'请求成功','data'=>$result);
        }else{
            $return = array('status'=>false,'msg'=>'请求失败','data'=>[]);
        }
        echo json_encode($return,JSON_UNESCAPED_UNICODE);

    }

    //查看行程单 (行程单保存到数据库)
    public function SuccessTrip()
    {
        $cookData = $_SERVER['HTTP_COOKIE'];    
        $sessionid = substr($cookData,strpos($cookData,'=')+1);
        Session_id($sessionid);

        session_start();
        $sessionData = $_SESSION;
        $list = $sessionData['list'];

        $go_city = $_SESSION['go_city'];
        foreach($list as $kk2=>&$cityinfo)
        {
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
                //每个城市第一天的大交通
                foreach($go_city as $f)
                {
                    $times = strtotime($f['city_date']);
                    if(strtotime($d['of_date']) == $times)
                    { 
                        $d['one_city'] = $f['start_city'];
                        $d['two_city'] = $f['city_name'];
                    }
                }

                $d['start_time'] = $d['start_clock'];
                $d['end_time'] = $d['resultsTime'];

                //没有酒店空间的时候
                // if(!isset($d['hotel']))
                // {
                //     $d['hotel'] = array('hotel_name'=>'','lat'=>'','lng'=>'','tel'=>'','address'=>'','LowRate'=>'','BusinessZoneName'=>'','ThumbNailUrl'=>'');
                // }
           
                //查询景点详情
                if(isset($d['day']))
                {
                    foreach($d['day'] as &$ji)
                    {
                        $this_floor_index = $ji['this_floor_index'];
                        $spot_name = $ji['this_name'];
                        if($this_floor_index == 0)
                        {
                            $shopList = Db::name('Nature_absture')->where(array('city_name'=> $city_name,'spot_name'=>$spot_name))->find();
                            
                            // 若选择了Top8的景点，最后输出的时候，id匹配到人文景观中对应景点的id
                            if($shopList['type'] == 'Top8')
                            {
                                $where['city_name'] = $city_name;
                                $where['spot_name'] = $spot_name;
                                $where['type'] = '人文景观';
                                $whereor['type'] = '自然风光';
                                $absture = Db::name('Nature_absture')->field('spot_name,id')->where($where)->whereor($whereor)->find();
                                $shopList['id'] = $absture['id'];
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

                            $ji['info'] = $shopList;
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

                            $ji['info'] = $shopList;
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

                            $ji['info'] = $shopList;
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
                            $ji['info'] = $shopList;
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
                   
                            $ji['info'] = $shopList;
                        }
                        //用户自己新增的景点
                        if($this_floor_index == '-2')
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
                            $ji['info']['attractions_tickets'] = '';
                        }
                    }
                }

            }
        }
        //////////////////////////

        $trip_id = $sessionData['trip_id'];
        $uid = substr($trip_id,0,strpos($trip_id, '-'));
        $trip_name = $sessionData['SaveCity']['trip_name'];
        $cover = $sessionData['SaveCity']['Cover'];
        $time = time();
        $people = $sessionData['SaveCity']['departure_city']['adult'] + $sessionData['SaveCity']['departure_city']['children'];

        $baseInfo['trip_name'] = $trip_name;
        $baseInfo['travel_title'] = $trip_name;
        $baseInfo['uid'] = $uid;
        $baseInfo['trip_id'] = $trip_id;
        $baseInfo['creat_time'] = $time;
        $baseInfo['status'] = 0;

        $baseInfo['dep_lat'] = $sessionData['SaveCity']['departure_city']['latitude'];
        $baseInfo['dep_lng'] = $sessionData['SaveCity']['departure_city']['longitude'];
        $baseInfo['ret_lat'] = $sessionData['SaveCity']['return_city']['latitude'];
        $baseInfo['ret_lng'] = $sessionData['SaveCity']['return_city']['longitude'];
        $baseInfo['departure_city'] = $sessionData['SaveCity']['departure_city']['city_name'];
        $baseInfo['return_city'] = $sessionData['SaveCity']['return_city']['city_name'];
        $baseInfo['city_trc_name'] = $sessionData['SaveCity']['return_city']['city_trc_name'];
        $baseInfo['flightTime'] = $sessionData['SaveCity']['return_city']['flightTime'];
        $baseInfo['trainTime'] = $sessionData['SaveCity']['return_city']['trainTime'];
        $baseInfo['dis'] = $sessionData['SaveCity']['return_city']['dis'];

        $baseInfo['adult'] = $sessionData['SaveCity']['departure_city']['adult'];
        $baseInfo['children'] = $sessionData['SaveCity']['departure_city']['children'];
        $baseInfo['date'] = $sessionData['SaveCity']['departure_city']['date'];
        $baseInfo['day_num'] = $sessionData['SaveCity']['departure_city']['day_num'];

        $re['city_trc_name'] = $sessionData['SaveCity']['return_city']['city_trc_name'];
        $re['flightTime'] = $sessionData['SaveCity']['return_city']['flightTime'];
        $re['trainTime'] = $sessionData['SaveCity']['return_city']['trainTime'];
        $re['trainTime'] = $sessionData['SaveCity']['return_city']['trafficTime'];
        $re['dis'] = $sessionData['SaveCity']['return_city']['dis'];

        $baseInfo['return_cityInfo'] = json_encode($re);
        foreach($sessionData['SaveCity']['departure_city'] as $tre)
        {
            unset($sessionData['SaveCity']['departure_city']['timeData']);
        }
        foreach($sessionData['SaveCity']['go_city_array'] as &$goData)
        {
            $goData['position']['lat'] = $goData['latitude'];
            $goData['position']['lng'] = $goData['longitude'];
        }
        $baseInfo['go_city_array'] = json_encode($sessionData['SaveCity']['go_city_array']); 

        //2、日程安排，景点信息plan表
        $plan_info['uid'] = $uid;
        $plan_info['trip_id'] = $trip_id;
        $plan_info['creat_time'] = $time;
        $plan_info['status'] = 0;
        //由于list的数据比较大，先进行序列化后再存储，防止数据丢失
        $plan_info['schedufing'] = base64_encode(serialize($list));

        //3、城市线路
        $city_line['uid'] = $uid;
        $city_line['trip_id'] = $trip_id;
        $city_line['creat_time'] = $time;
        $city_line['status'] = 0;

        $city_line['list'] = json_encode($sessionData['SaveCity']['go_city_array']);
        $dep_date =  $sessionData['SaveCity']['departure_city']['date'];
        $day_num =  $sessionData['SaveCity']['departure_city']['day_num'];

        $return_date = date("Y-m-d",(strtotime($dep_date) + ($day_num-1)*3600*24)); 
        $city_line['return_date'] = $return_date; 


        //餐饮费用
        foreach($list as $key3=>$c)
        {
            foreach($c['day_arry'] as $cc)
            {
                foreach($cc['day'] as $ccc)
                {
                    if(isset($ccc['eat_info']))
                    {
                        $eat[] = $ccc['eat_info'];
                    }
                }
            }
        }

        if(isset($eat))
        {
            foreach($eat as $k => $v) 
            {
                foreach($v as $n)
                {
                    $eatResult[] = $n;
                }
            }
        }
  
        if(isset($eatResult))
        {
            foreach($eatResult as &$vv)
            {
                preg_match('/\d+/',$vv['per_capita'],$b); 
                if(isset($b[0]))
                {
                    $vv['price'] = $b[0];
                    $vv['people'] = $people;
                    $vv['total_price'] = $b[0] * $people;
                }
            }
        }

        if(isset($eatResult))
        {
            $eat_money['uid'] = $uid;
            $eat_money['trip_id'] = $trip_id;
            $eat_money['creat_time'] = $time;
            $eat_money['status'] = 0;
            $eat_money['eat_money'] = json_encode($eatResult); 
             $result = Db::name('eat_money')->insert($eat_money);
        }
        $result =  Db::name('plan_info')->insert($plan_info);
        $result = Db::name('city_line')->insert($city_line);
        $result = Db::name('trip_info')->insert($baseInfo);
        //行程单如果生成成功，则删除之前为完成表的数据，trip_id（下版本）

        if($result)
        {
            $return = array('status'=>true,'msg'=>'请求成功','data'=>$trip_id);
        }else{
            $return = array('status'=>false,'msg'=>'请求失败','data'=>[]);
        }
        echo json_encode($return,JSON_UNESCAPED_UNICODE);
    }

    //接收酒店数据
    public function GoHotel()
    { 
        $cookData = $_SERVER['HTTP_COOKIE'];    
        $sessionid = substr($cookData,strpos($cookData,'=')+1);
        Session_id($sessionid);

        session_start();
        //酒店数据
        $post= $_POST;
        $trip_id = $post['trip_id'];   //从个人中心进来有trip_id
        $this_city_index = $post['this_city_index'];   //城市索引
        $day_arry_index = $post['day_arry_index'];     //天数索引
        $hotelData = json_decode($post['citymodel'],true);
        // $return = array('status'=>false,'msg'=>'ceshi','data'=>$hotelData);
        //         echo json_encode($return,JSON_UNESCAPED_UNICODE);
        //         exit;
        $_SESSION['hotelData'] = $hotelData;  
        //如果选择了酒店,酒店匹配到对应的日期中
        if(isset($_SESSION['list']))
        {
            $list = $_SESSION['list'];
            if(isset($_SESSION['hotelData']))
            {
                if(isset($hotelData['hotel']))
                {
                    foreach($hotelData['hotel'] as $HH)
                    {
                        //匹配到list中
                        foreach($list as $ke3=>&$Lvalue)
                        {
                            if(isset($Lvalue['day_arry']))
                            {
                                foreach($Lvalue['day_arry'] as $ke4=>&$dValue)
                                {   
                                    if($dValue['date'] == $HH['date']){$dValue['hotel'] = $HH;}
                                }
                            }   
                        } 
                    } 
                }  
            }
            $_SESSION['list'] = $list;
        }
        if(isset($_SESSION['info2']))
        {
            if(isset($_SESSION['info2'][$this_city_index]))
            {
                $thisData = $_SESSION['info2'][$this_city_index];
                if(isset($hotelData['hotel']))
                {
                    foreach($hotelData['hotel'] as $HH)
                    {
                        // 匹配到thisData中
                        foreach($thisData as $ke2=>&$thisvalue)
                        {
                            if($thisvalue['date'] == $HH['date']){$thisData[$ke2]['hotel'] = $HH;}
                        } 
                    }
                }
                $_SESSION['info2'][$this_city_index] = $thisData;
            }
        }

        //从个人中心进来编辑酒店
        if(!empty($trip_id)){
            $ppData = Db::name('Plan_info')->where(array('trip_id'=>$trip_id))->find();
            $schedufing = unserialize(base64_decode($ppData['schedufing']));
            $schedufing = json_decode(json_encode($schedufing),true);
            $schedufing[$this_city_index]['day_arry'][$day_arry_index]['hotel'] = $hotelData['hotel'][0];//新的酒店追加到数组后面
            $plan_info['schedufing'] = base64_encode(serialize($schedufing));
            $result = Db::name('Plan_info')->where(array('trip_id'=>$trip_id))->update($plan_info);
        }
        else{
            $result = 1;
        }
        if($result !== false)
        {
            $return = array('status'=>true,'msg'=>'请求成功','data'=>[]);
        }else{
            $return = array('status'=>false,'msg'=>'请求失败','data'=>[]);
        }
        echo json_encode($return,JSON_UNESCAPED_UNICODE);
    }

    //日程列表
    public function ScList()
    {
        $cookData = $_SERVER['HTTP_COOKIE'];    
        $sessionid = substr($cookData,strpos($cookData,'=')+1);
        Session_id($sessionid);

        session_start();
        $sessionData =  $_SESSION;
        $list = $sessionData['list'];
        foreach($list as $key=>$Lvalue)
        {
            if(!isset($Lvalue['day_arry']))
            {
                unset($list[$key]);
            }
        }
        if($list)
        {
            $return = array('status'=>true,'msg'=>'请求成功','data'=>$list);
        }else{
            $return = array('status'=>false,'msg'=>'请求失败','data'=>[]);
        }
        echo json_encode($return,JSON_UNESCAPED_UNICODE);
    }
    
    // 刷新行程总览
    public function LastView()
    {
        $cookData = $_SERVER['HTTP_COOKIE'];    
        $sessionid = substr($cookData,strpos($cookData,'=')+1);
        Session_id($sessionid);

        session_start();
        $this_city_index = $_POST['this_city_index'];
        foreach($_SESSION['info2'] as $key=>$value)
        {
            if($key == $this_city_index )
            {
                $list['info'] = $_SESSION['info2'][$key];
            }
        }
        // $return = array('status'=>false,'msg'=>'请cesh','data'=>$list);
        // echo json_encode($return,JSON_UNESCAPED_UNICODE);
        // exit;
        $list['tra'] = $_SESSION['tra'];
        if($list)
        {
            $return = array('status'=>true,'msg'=>'请求成功','data'=>$list);
        }else{
            $return = array('status'=>false,'msg'=>'请求失败','data'=>[]);
        }
        echo json_encode($return,JSON_UNESCAPED_UNICODE);
    }
}