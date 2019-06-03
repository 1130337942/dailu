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


/**
 * 1F —— 7F 
 * 
 * 人文自然、本土体验、醉美夜色、美食诱惑，购物天堂
 * 安排行程，我的出行计划
 * 
 * */
class ScenerymapController extends HomeBaseController
{
    //城市景点、美食、购物页面
    public function cityAttractions()
    {
        return $this->fetch();
    }

    //游玩城市和交通站点(是否有城市游玩0天)
    public function TrafficSite()
    {
        session_start();

        $post = input('post.');
        $this_city_index = $post['this_city_index'];
        $info = $_SESSION['citysession'];
        $go_city_array = $info['go_city_array'];
        $citynum= count($go_city_array);
        //游玩天數不是0的城市
        foreach($go_city_array as $key=>$city){
            if($city['city_daynum'] !== '0'){
                $city['orkey'] = $key;
                $noarray[]= $city;
            }
        }
        $noarraylen = count($noarray);
        //每個游玩天數不是0的城市后面有几个天数为0的城市
        foreach($noarray as $key2=>&$novalue){
            if($key2 !== $noarraylen-1){
                $novalue['zero_num'] = $noarray[$key2+1]['orkey'] - $noarray[$key2]['orkey']-1;
            }else{
                $novalue['zero_num'] = $citynum - $noarray[$key2]['orkey']-1;
            }
        }
        foreach($noarray as $vl){
            if($vl['orkey']== $this_city_index){
                unset($vl['lat'],$vl['lng'],$vl['province_id'],$vl['fit_day'],$vl['city_Introduction'],$vl['provinceNames'],$vl['dis'],$vl['trc_name'],
                $vl['trc_time'], $vl['trc_class']);
                $result['zero_num'] = $vl;
            }
        }
        $cover =  $info['cover'];  //第一次默认的封面图
        $citylen = count($go_city_array);
        //每个游玩城市的起始日期,结束时间
        $day_num = $info['day_num'];
        $date = $info['date'];
        if($citylen < 2){
            $city_daynum = $go_city_array[0]['city_daynum'];
            $go_city_array[0]['city_d_1'] = 1;
            $go_city_array[0]['city_d_2'] = $city_daynum;
            $go_city_array[0]['city_date'] = $date;
            $go_city_array[0]['city_date2'] = date("Y-m-d",(strtotime($date) + ($city_daynum-1)*3600*24));
        }else{
            $daysum = 0;
            $city_d_1 = 0; 
            $city_d_2 = 0;
            for($i=0;$i<$citylen;$i++)
            {
                $city_d_1 = $city_d_2 + 1; 
                $city_d_2 = $city_d_2 + $go_city_array[$i]['city_daynum']; 
                if($i == 0)
                {
                    $go_city_array[0]['city_d_1'] = $city_d_1;
                    $go_city_array[0]['city_d_2'] = $city_d_2;
                    $go_city_array[0]['city_date'] = date("Y-m-d",(strtotime($date)));
                    $go_city_array[0]['city_date2'] = date("Y-m-d",(strtotime($date) + ($go_city_array[0]['city_daynum']-1)*3600*24));
                }
                if($i>0)
                {
                    if($go_city_array[$i]['city_daynum'] !== '0'){
                        $go_city_array[$i]['city_d_1'] = $city_d_1;
                        $go_city_array[$i]['city_d_2'] = $city_d_2;
                        $daysum = $daysum + $go_city_array[$i-1]['city_daynum'];
                        $go_city_array[$i]['city_date'] = date("Y-m-d",(strtotime($date) + $daysum*3600*24));
                        $go_city_array[$i]['city_date2'] = date("Y-m-d",(strtotime($date) + ($city_d_2-1)*3600*24));
                    }else{
                        //选择了城市游玩0天
                        $go_city_array[$i]['city_d_1'] = $city_d_2;
                        $go_city_array[$i]['city_d_2'] = $city_d_2;
                        $daysum = $daysum + $go_city_array[$i-1]['city_daynum'];
                        $go_city_array[$i]['city_date2'] = $go_city_array[$i]['city_date'] = date("Y-m-d",(strtotime($date) + ($city_d_2-1)*3600*24));
                    }
                }
            }
        }
        
        // print_r($go_city_array);
        // 选择交通方式，交通站点,附近交通站点
        $singArray = $go_city_array[$this_city_index];
        
        if($singArray['city_id'] == 0)
        {
            $return = array('status'=>false,'msg'=>'暂未查询到当前城市站点信息','data'=>[]);
        }else{
            $cityneartra = Db::name('City_details')->field(array('city_id,near_plane,near_train'))->where(array('city_id'=>$singArray['city_id']))->find();

            //当前城市的飞机场是否存在
            $planeData = Db::name('City_traffic')->where(array('city_id'=>$singArray['city_id'],'traffic_type'=>'plane'))->select()->toArray();
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
            $trainData = Db::name('City_traffic')->where(array('city_id'=>$singArray['city_id'],'traffic_type'=>'train'))->select()->toArray();
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
            // $no_ok = array('city_id'=>0,'traffic_name'=>'待定','traffic_longitude'=>'','traffic_latitude'=>'','main_city_id'=>0,'main_city_name'=>'','to_dis'=>0);
            // array_unshift($plane,$no_ok);
            // array_unshift($train,$no_ok);
            $near['plane'] = $plane;
            $near['train'] =  $train;
        }
        
        if(isset($near)){
            
            $nearResult = $near;
        }else{
            $nearResult = [];
        }

        foreach($go_city_array as $key=>$value)
        {
            $cityArray[$key] = $value['city_name'];
        }
        //跨城条件
        if(isset($_SESSION['across_city'])){
            if($this_city_index >0){
                $result['across_city'] = $_SESSION['across_city'][$this_city_index-1];
            }else{
                 $result['across_city'] = 'false';
            }
        }else{
            $result['across_city'] = 'false';
        }
        //后面一个城市是否有0天的城市
        if(isset($_SESSION['next_city_day0'])){
            $result['next_city_day0'] = $_SESSION['next_city_day0'];
        }else{
            $result['next_city_day0'] = 'false';
        }
        $result['go_city_array'] = $go_city_array;
        $result['cover'] = $cover;
        $result['traffic'] = $nearResult;
        $result['date'] = $info['date'];
        $result['day_num'] = $info['day_num'];
        $result['adult'] = $info['adult'];
        $result['children'] = $info['children'];
        $result['departure_city'] = $info['departure_city'];
        $result['return_city'] = $info['return_city'];
        $result['cityArray'] = $cityArray;
        if(isset($_SESSION['title'])){
            $result['title'] = $_SESSION['title'];
        }else{
            //拼接行程单名称
            $cityString = implode('.',$cityArray);
            $citynum = count($cityArray);
            $result['title'] = $cityString.$info['day_num'].'日游行程单';
        }
        if($go_city_array)
        {
            $return = array('status'=>true,'msg'=>'请求成功','data'=>$result);
        }else{
            $return = array('status'=>true,'msg'=>'请求失败','data'=>[]);
        }  
        // print_r($return);
        echo json_encode($return,JSON_UNESCAPED_UNICODE);
    }
    /*** 1F--5F  当点击返回时候数据返回***/
    public function ReturnSceni()
    {
        session_start();
        $info = $_SESSION;
        $result = $info['data'];
      
        //景点和吃的，放在同一个列表里，数据用于倒退时候1F-5F渲染使用
        if(isset($result['spot_data']['eat_name_arry']))
        {
            $completeData = array_merge($result['spot_data']['addgo_arry'],$result['spot_data']['eat_name_arry']); 
        }else{
            $completeData = array_merge($result['spot_data']['addgo_arry']);
        }
        $result['spot_data']['completeData'] = $completeData;
        
        echo json_encode($result,JSON_UNESCAPED_UNICODE);
    }
    //搜索
    public function allfloorSearch()
    {
        $getData = $_GET;
        $queryString = $getData['spot_name'];
        $city_id = $getData['city_id'];

        if(strlen($queryString) > 0)
        {
            //1F
            $where1 = array();
            $where1['spot_name'] = array('like',"%$queryString%"); 
            $where1['city_id'] = $city_id;
            $spotList = Db::name('Nature_absture')->where($where1)->field(array('province_id','city_id','spot_name','pic','type'))->select();
            $spotResult = json_decode($spotList,true);
            foreach($spotResult as &$spot)
            {
                $spot['floor_index'] = '0';
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
            }
            // print_r($spotResult);
            //2F
            $where2 = array();
            $where2['spot_name'] = array('like',"%$queryString%"); 
            $where2['city_id'] = $city_id;
            $DescribeList = Db::name('Describe')->where($where2)->field(array('province_id','city_id','spot_name','pic','type'))->select();
            $DescribeResult = json_decode($DescribeList,true);
            foreach($DescribeResult as &$Describe)
            {
                $Describe['floor_index'] = '1';
                if($Describe['type'] == '文化艺术')
                {
                    $Describe['group'] = 'art';
                }
                if($Describe['type'] == '休闲情调')
                {
                    $Describe['group'] = 'leisure';
                }
            }
            //3F
            $where3 = array();
            $where3['spot_name'] = array('like',"%$queryString%"); 
            $where3['city_id'] = $city_id;
            $NightList = Db::name('Night')->where($where2)->field(array('province_id','city_id','spot_name','pic','type'))->select();
            $NightResult = json_decode($NightList,true);
            foreach($NightResult as &$Night)
            {
                $Night['floor_index'] = '2';
                if($Night['type'] == '视觉享受')
                {
                    $Night['group'] = 'visual';
                }
                if($Night['type'] == '灯红酒绿')
                {
                    $Night['group'] = 'neon';
                }
            }

            //4F(本土美食、美食街区)
            $where4 = array();
            $where4['store_name'] = array('like',"%$queryString%"); 
            $where4['city_id'] = $city_id;
            $StoreList = Db::name('Store_info')->where($where4)->field(array('province_id','city_id','store_name','pic','type'))->select();
            $StoreResult = json_decode($StoreList,true);
            foreach($StoreResult as &$Store)
            {
                $Store['floor_index'] = '3';
                $Store['spot_name'] = $Store['store_name'];
                if($Store['type'] == '本土美食')
                {
                    $Store['group'] = 'local';
                }
                if($Store['type'] == '美食街区')
                {
                    $Store['group'] = 'street';
                }
            }
            //连锁店中的总店
            $where43 = array();
            $where43['restaurant_name'] = array('like',"%$queryString%"); 
            $where43['city_id'] = $city_id;
            $resList = Db::name('Restaurant_chain')->where($where43)->field(array('province_id','city_id','restaurant_name','pic','type'))->select()->toArray();
            foreach($resList as &$res)
            {
                $res['floor_index'] = '3';
                $res['spot_name'] = $res['restaurant_name'];
                if($res['type'] == '本土美食')
                {
                    $res['group'] = 'local';
                }
                if($res['type'] == '美食街区')
                {
                    $res['group'] = 'street';
                }
            }
            //美食街区
            $where42 = array();
            $where42['food_court_name'] = array('like',"%$queryString%"); 
            $where42['city_id'] = $city_id;
            $FoodList = Db::name('Food_court')->where($where42)->field(array('province_id','city_id','food_court_name','pic','type'))->select();
            $FoodResult = json_decode($FoodList,true);
            foreach($FoodResult as &$Food)
            {
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
            }

            //5F(土特产店、购物商圈)
            $where5 = array();
            $where5['shopping_name'] = array('like',"%$queryString%"); 
            $where5['city_id'] = $city_id;
            $ShopList = Db::name('Shopping_streets')->where($where5)->field(array('province_id','city_id','shopping_name','pic','type'))->select();
            $ShopResult = json_decode($ShopList,true);
            foreach($ShopResult as &$Shop)
            {
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
            }
            $searchData = array_merge($spotResult,$DescribeResult,$NightResult,$StoreResult,$resList,$FoodResult,$ShopResult);
        // print_r($searchData);
            echo json_encode($searchData,JSON_UNESCAPED_UNICODE);
        }
    }

    //用户自己新增景点
    public function NewSpot()
    {
        $post = $_POST;
        if(isset($post['uid'])){
            $data['uid'] = $post['uid'];
        }
        $data['city_id'] = $post['city_id'];
        $areaData = Db::name('area')->field('area_name')->where(array('area_id'=>$post['city_id']))->find();
        $data['city_name'] = $areaData['area_name'];
        $data['spot_name'] = $post['spot_name'];
        $data['map_name'] = $post['map_name']; //原始地图上的景点名称
        $data['longitude'] = $post['longitude'];
        $data['latitude'] = $post['latitude'];
        $data['address'] = $post['address'];
     
        $data['type'] = 'add_newSpot';
        $data['ranking'] = 10;
        $data['suit_season'] = '1-12月';
        $data['period_time'] = 'allday';
        $data['suit_time'] = $data['business_hours'] = '09:00-21:00';
        $data['creat_time'] = time();
        $data['not_modifity'] = 0;
        
        $base64_image_content = $post['pic'];
        $orgurl = '/upload/newspot/'.date('Ymd').'/';
        $imageresult = Base64Image($base64_image_content,$orgurl);
        
        $ab ='http://';
        if(!empty($imageresult['url']))
        {
            //$data['pic'] = $imageresult['url']; 
            $image_cover = $ab.$_SERVER['HTTP_HOST'].$imageresult['url']; 
            $data['pic'] = $image_cover;
        }else{
            //当没有上传图片时，用logo图片代替
            $no_up = '404/logo.png';
            //$data['pic'] = $no_up; 
            $image_cover= cmf_get_image_preview_url($no_up);
            $data['pic'] = $image_cover;
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
     /**
    * 7F
    * 用户 景点列表 
    * 用户登录了才存在7楼对应城市数据
    */
    public function SelfSpot()
    {
        $post = $_POST;
        $city_id = $post['city_id'];
        $uid = $post['uid'];
//        $city_id = 1692;
//        $uid = 38;
        $selflist = Db::name('New_spot')->where(array('uid'=>$uid,'city_id'=>$city_id))
        ->field(array('id','province_id','city_id','spot_name','area_id','attr_score','play_time','pic','type','longitude','latitude','ranking','period_time','not_modifity','suit_season','ticket_data','suit_time'))->select()->toarray();
      
        foreach($selflist as $kk=>&$selfvalue)
        {
            //适玩时间
            $selfvalue['tag_time'] = $this->play_time($selfvalue['play_time']);  //时间统一成小时
            $selfvalue['business_hours'] = $selfvalue['suit_time'];
            //景点封面图片 cover
            if(!empty($selfvalue['pic'])){
                $selfvalue['cover_url'] =  $selfvalue['pic'];
                unset($selfvalue['pic']);
            } else{
                //当没有上传图片时，用404图片代替
                $unified_404 = '404/unified_404.png';
                $selfvalue['cover_url'] = cmf_get_image_preview_url($unified_404);
            }
        }
//          print_r($selflist);
        $return['tab']= array(
            array('type'=>'我的景点','them'=>'self')
        );
        $return['self'] = $selflist;
        echo json_encode($return,JSON_UNESCAPED_UNICODE);
    }
    
    /********** 人文景点中的 查看介绍，景点的详情页面数据  ***********/
    public function self_detail()
    {
        /****** 景区  *********/
        $post = $_POST;
        $spot_name = $post['spot_name'];
        $city_id = $post['city_id'];
        $where['spot_name'] = $spot_name;
        $spotDetail = Db::name('New_spot')->where($where)->find();

        $spotDetail['release_time'] = date('Y-m-d', $spotDetail['creat_time']);
        $spotDetail['type'] = '我的景点';
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
            $spotDetail['image_url'] = $cover_pic;
            foreach($cover_pic as $k => &$pic_value)
            {
                $nameurl[$k]['name']  = substr($pic_value,-10);
                $nameurl[$k]['url']  = $pic_value;
                $spotDetail['image_name'][$k]= substr($pic_value,-10);
                $spotDetail['image'] = $nameurl;
            }
            unset($spotDetail['picture2']);
        }
        
        //文字描述中的html标签转化成实体
        $spotDetail['introduction'] = htmlchars($spotDetail['spot_Introduction']);
        unset($spotDetail['spot_Introduction']);
        $spotDetail['description'] = htmlchars($spotDetail['other_description']);
        unset($spotDetail['spot_Introduction']);
   
  
        /** 附近推荐 
         * 景区附近推荐 (美食推荐、景点推荐、购物推荐)，
         * 规则：景点3公里以内的给予推荐
         **/
        $longitude1 = $post['lng'];
        $latitude1 = $post['lat'];
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
        $result = array();
        $result['spot'] =  $spotDetail;    //景区里的简要介绍
        $result['tuijian'] = $tuijian;     //景区中的附近推荐
        echo json_encode($result,JSON_UNESCAPED_UNICODE);
    }
    
    /**
    * 1F
    * 人文自然 景点列表
    */
    public function renwen()
    {
        //根据传递过来的
        $post = $_POST;
        $city_id = $post['city_id'];
        $spotList = Db::name('Nature_absture')->where(array('city_id'=>$city_id))
        ->field(array('id','province_id','city_id','spot_name','area_id','attr_score','play_time','pic','type','longitude','latitude','ranking','period_time','not_modifity','suit_season','ticket_data','suit_time'))->order('ranking asc')->select();
        $spotResult = json_decode($spotList,true);
        $top = array();
        $nature = array();
        $scenery = array();
        foreach($spotResult as $kk=>&$spot)
        {
            //适玩时间
            $spot['tag_time'] = $this->play_time($spot['play_time']);  //时间统一成小时
            $spot['business_hours'] = $spot['suit_time'];
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

        $abstureList = array();
        $type['tab']= array(
            array('type'=>'Top8','them'=>'top8'),
            array('type'=>'人文景观','them'=>'nature'),
            array('type'=>'自然风光','them'=>'scenery')
        );
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
        //加入搜索条件 
        if(isset($post['group']))
        {
            //top8
            if($post['group'] == 'top8')
            {
                //带有搜索条件下返回的数据，放在列表第一位
                if(isset($post['search_spot_name']) && strlen($post['search_spot_name']) > 0){
                    foreach($abstureList['top8'] as $key=>$top8)
                    {
                        if($post['search_spot_name'] == $top8['spot_name'])
                        {
                            array_unshift($abstureList['top8'],$top8);
                        }
                       
                    }
                    
                }
            }
            foreach($abstureList['top8'] as $key0=>$tt)
            {
                if($tt['spot_name'] == $post['search_spot_name']){
                    if($key0 != 0){
                        unset($abstureList['top8'][$key0]);
                    }
                }
            }
            $abstureList['top8'] = array_merge($abstureList['top8']);

            //人文自然nature
            if($post['group'] == 'nature')
            {
                //带有搜索条件下返回的数据，放在列表第一位
                if(isset($post['search_spot_name']) && strlen($post['search_spot_name']) > 0){
                    foreach($abstureList['nature'] as $key=>$nature)
                    {
                        if($post['search_spot_name'] == $nature['spot_name'])
                        {
                            array_unshift($abstureList['nature'],$nature);
                        }
                       
                    }
                    
                }
            }
            foreach($abstureList['nature'] as $key1=>$na)
            {
                if($na['spot_name'] == $post['search_spot_name']){
                    if($key1 != 0){
                        unset($abstureList['nature'][$key1]);
                    }
                }
            }
            $abstureList['nature'] = array_merge($abstureList['nature']);

            //自然风光scenery
            if($post['group'] == 'scenery')
            {
                //带有搜索条件下返回的数据，放在列表第一位
                if(isset($post['search_spot_name']) && strlen($post['search_spot_name']) > 0){
                    foreach($abstureList['scenery'] as $key=>$scenery)
                    {
                        if($post['search_spot_name'] == $scenery['spot_name'])
                        {
                            array_unshift($abstureList['scenery'],$scenery);
                        }
                        
                    }
                    
                }
            }
            foreach($abstureList['scenery'] as $key2=>$sc)
            {
                if($sc['spot_name'] == $post['search_spot_name']){
                    if($key2 != 0){
                        unset($abstureList['scenery'][$key2]);
                    }
                }
            }
            $abstureList['scenery'] = array_merge($abstureList['scenery']);

        }

    //    print_r($abstureList);     
        echo json_encode($abstureList,JSON_UNESCAPED_UNICODE);
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
        $spotDetail['introduction'] = htmlchars($spotDetail['spot_Introduction']);
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
  
        /** 附近推荐 
         * 景区附近推荐 (美食推荐、景点推荐、购物推荐)，
         * 规则：景点3公里以内的给予推荐
         **/
        $longitude1 = $post['lng'];
        $latitude1 = $post['lat'];
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
        $result = array();
        $result['spot'] =  $spotDetail;    //景区里的简要介绍
        $result['tuijian'] = $tuijian;     //景区中的附近推荐
        $result['cultural'] = $culturalResult; //景区中的景点
        echo json_encode($result,JSON_UNESCAPED_UNICODE);
    }


    /*** 2F
     * 本土体验
     ***/
    //本土体验 景点列表
    public function local()
    {
         //根据传递过来的
        $post = $_POST;
        $city_id = $post['city_id'];

        $localList = Db::name('Describe')->where(array('city_id'=>$city_id))->field(array('province_id','city_id','spot_name','area_id','attr_score','play_time','pic','type','longitude','latitude','attr_score','ranking','period_time','not_modifity','suit_season','ticket_data','suit_time'))->select();
        $localResult = json_decode($localList,true);

        $art = array();
        $leisure = array();
        foreach($localResult as $kk=>&$local)
        {
            //适玩时间
            $local['tag_time'] = $this->play_time($local['play_time']);  //时间统一成小时
            $local['business_hours'] = $local['suit_time'];
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
        $type['tab']= array(
            array('type'=>'文化艺术','them'=>'art'),
            array('type'=>'休闲情调','them'=>'leisure')
        );

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

        //搜索
        if(isset($post['group']))
        {
            //文化艺术 art
            if($post['group'] == 'art')
            {
                //带有搜索条件下返回的数据，放在列表第一位
                if(isset($post['search_spot_name']) && strlen($post['search_spot_name']) > 0){
                    foreach($Result['art'] as $key=>$art)
                    {
                        if($post['search_spot_name'] == $art['spot_name'])
                        {
                            array_unshift($Result['art'],$art);
                        }
                       
                    }
                    
                }
            }
            foreach($Result['art'] as $key0=>$tt)
            {
                if($tt['spot_name'] == $post['search_spot_name']){
                    if($key0 != 0){
                        unset($Result['art'][$key0]);
                    }
                }
            }
            $Result['art'] = array_merge($Result['art']);

            //休闲情调leisure
            if($post['group'] == 'leisure')
            {
                //带有搜索条件下返回的数据，放在列表第一位
                if(isset($post['search_spot_name']) && strlen($post['search_spot_name']) > 0){
                    foreach($Result['leisure'] as $key=>$leisure)
                    {
                        if($post['search_spot_name'] == $leisure['spot_name'])
                        {
                            array_unshift($Result['leisure'],$leisure);
                        }
                       
                    }
                    
                }
            }
            foreach($Result['leisure'] as $key1=>$na)
            {
                if($na['spot_name'] == $post['search_spot_name']){
                    if($key1 != 0){
                        unset($Result['leisure'][$key1]);
                    }
                }
            }
            $Result['leisure'] = array_merge($Result['leisure']);
        }

       
        echo json_encode($Result,JSON_UNESCAPED_UNICODE);
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
        
        /** 附近推荐 
         * 景区附近推荐 (美食推荐、景点推荐、购物推荐)，
         * 规则：景点3公里以内的给予推荐
         **/
        $longitude1 = $post['lng'];
        $latitude1= $post['lat'];
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
                if($distance > 3000 )
                {
                    unset($cityInfo[$key]);
                }else{
                    $cityValue['distance'] = $distance.'米';
                }
                if(!empty($cityValue['pic']))
                {
                    $pic =json_decode($cityValue['pic'],true);
                    foreach($pic as $kk => &$pic_value)
                    {
                        //common.php中封装的图片url解析方法
                        $cityValue['img_url'] = cmf_get_image_preview_url($pic_value['url']); 
                    }
                    unset($cityValue['pic']);
                }
               
                unset($cityValue['picture2']); 
                $cityValue['introduction'] = htmlchars($cityValue['spot_Introduction']);
                unset($cityValue['spot_Introduction']); 
                //适玩时间
                $cityValue['tag_time'] = $this->play_time($cityValue['play_time']);  //时间统一成小时
            } 
        }

        // // ② 附近推荐美食
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
        $shop_streetData = Db::name('shopping_streets')->where(array('city_id' => $city_id))->select();
        $shop_streetInfo = json_decode($shop_streetData,true);
        // print_R($shop_streetInfo);
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
        $result = array();
        $result['spot'] =  $localDetail;    //景区里的简要介绍
        $result['tuijian'] = $tuijian;     //景区中的附近推荐
        echo json_encode($result,JSON_UNESCAPED_UNICODE);
    }

    /*** 3F
     * 最美夜色
     ***/
    //醉美夜色 景点列表
    public function night()
    {
         //根据传递过来的
        $post = $_POST;
        $city_id = $post['city_id'];

        $nightList = Db::name('Night')->where(array('city_id'=>$city_id))->field(array('province_id','city_id','spot_name','area_id','attr_score','play_time','pic','type','longitude','latitude','attr_score','ranking','period_time','not_modifity','suit_season','ticket_data','suit_time'))->select();
        $nightResult = json_decode($nightList,true);

        $visual = array();
        $neon = array();
        foreach($nightResult as $kk=>&$night)
        {
            //适玩时间
            $night['tag_time'] = $this->play_time($night['play_time']);  //时间统一成小时
            $night['business_hours'] = $night['suit_time'];
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
        $type['tab']= array(
            array('type'=>'视觉享受','them'=>'visual'),
            array('type'=>'灯红酒绿','them'=>'neon')
        );

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
        //搜索
        if(isset($post['group']))
        {
            //视觉享受 visual
            if($post['group'] == 'visual')
            {
                //带有搜索条件下返回的数据，放在列表第一位
                if(isset($post['search_spot_name']) && strlen($post['search_spot_name']) > 0){
                    foreach($Result['visual'] as $key=>$visual)
                    {
                        if($post['search_spot_name'] == $visual['spot_name'])
                        {
                            array_unshift($Result['visual'],$visual);
                        }
                       
                    }
                    
                }
            }
            foreach($Result['visual'] as $key0=>$tt)
            {
                if($tt['spot_name'] == $post['search_spot_name']){
                    if($key0 != 0){
                        unset($Result['visual'][$key0]);
                    }
                }
            }
            $Result['visual'] = array_merge($Result['visual']);
            
            //灯红酒绿neon
            if($post['group'] == 'neon')
            {
                //带有搜索条件下返回的数据，放在列表第一位
                if(isset($post['search_spot_name']) && strlen($post['search_spot_name']) > 0){
                    foreach($Result['neon'] as $key=>$neon)
                    {
                        if($post['search_spot_name'] == $neon['spot_name'])
                        {
                            array_unshift($Result['neon'],$neon);
                        }
                       
                    }
                    
                }
            }
            foreach($Result['neon'] as $key1=>$na)
            {
                if($na['spot_name'] == $post['search_spot_name']){
                    if($key1 != 0){
                        unset($Result['neon'][$key1]);
                    }
                }
            }
            $Result['neon'] = array_merge($Result['neon']);
        }

        echo json_encode($Result,JSON_UNESCAPED_UNICODE);
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
       
        
        //文字描述中的html标签转化成实体
        $nightDetail['introduction'] = htmlchars($nightDetail['spot_Introduction']);
        unset($nightDetail['spot_Introduction']);
        $nightDetail['qita_description'] = htmlchars($nightDetail['other_description']);
        unset($nightDetail['other_description']);
        unset($nightDetail['pic']);

        /** 附近推荐 
         * 景区附近推荐 (美食推荐、景点推荐、购物推荐)，
         * 规则：景点3公里以内的给予推荐
         **/
        $longitude1 = $post['lng'];
        $latitude1= $post['lat'];
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
                if($distance > 3000 )
                {
                    unset($cityInfo[$key]);
                }else{
                    $cityValue['distance'] = $distance.'米';
                }
                if(!empty($cityValue['pic']))
                {
                    $pic =json_decode($cityValue['pic'],true);
                    foreach($pic as $kk => &$pic_value)
                    {
                        //common.php中封装的图片url解析方法
                        $cityValue['img_url'] = cmf_get_image_preview_url($pic_value['url']); 
                    }
                    unset($cityValue['pic']);
                }
               
                unset($cityValue['picture2']); 
                $cityValue['introduction'] = htmlchars($cityValue['spot_Introduction']);
                unset($cityValue['spot_Introduction']); 
                //适玩时间
                $cityValue['tag_time'] = $this->play_time($cityValue['play_time']);  //时间统一成小时
            } 
        }

        // // ② 附近推荐美食
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
        $result = array();
        $result['spot'] =  $nightDetail;    //景区里的简要介绍
        $result['tuijian'] = $tuijian;     //景区中的附近推荐
        echo json_encode($result,JSON_UNESCAPED_UNICODE);
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
    public function food()
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
        $storeInfo = Db::name('Store_info')->where(array('city_id'=>$city_id))->select();
        $storeResult = json_decode($storeInfo,true);
        //必吃美食 'is_hot_have'=>1  单店必吃美食
        $foodList = Db::name('dishes_recommended_info')->where(array('city_id'=>$city_id,'is_hot_have'=>1))->select();
        $foodResult = json_decode($foodList,true);

        foreach($storeResult as $key1=>&$store)
        {
            $store['tag_time'] = $this->play_time($store['meal_time']);  //时间统一成小时
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
                    $f['longitude'] = $store['longitude'];
                    $f['latitude'] = $store['latitude'];
                    $f['meal_time'] = $store['meal_time'];
                    $f['dianpu_image'] = $store['pic_url'];
                    $f['per_capita'] = $store['per_capita'];
                    $f['tag_time'] = $store['tag_time'];
                    $f['address'] = $store['address'];
                    $f['phone'] = $store['phone'];
                    $f['business_hours'] = $store['business_hours'];
                    $f['store_Introduction'] = $store['store_Introduction'];
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
                    $food['goods_url']= cmf_get_image_preview_url($food_value['url']); 
                }
            }
            else{
                $unified_404 = '404/unified_404.png';
                $food['goods_url'] = cmf_get_image_preview_url($unified_404);
            }
           
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
            $v['name'] = $keyV[$k];   
            foreach($v['place'] as $k1 => $v1)
            {
                $v['goods_url'] = $v1['goods_url']; //美食图片
                $v['recom_sites'] = $v1['recom_sites'];
            } 
        }

        /******** 连锁总店中的必吃美食  ********/

        $restaurantResult = Db::name('Restaurant_chain')->where(array('city_id'=>$city_id))->select()->toArray();

        //连锁店下的 必吃美食
        $re_food = Db::name('recom_dishes')->where(array('city_id'=>$city_id,'is_hot_have'=>1))->select()->toarray(); 
        foreach($restaurantResult as $key1=>&$res)
        {
            //分店的列表
            $branchInfo = Db::name('branch')->where(array('store_name'=>$res['restaurant_name']))->select()->toArray();
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
                    $f['fen_store'] = $branchInfo;
                    $f['longitude'] = $res['longitude'];
                    $f['latitude'] = $res['latitude'];
                    $f['meal_time'] = $res['meal_time'];
                    $f['dianpu_image'] = $res['pic_url'];
                    $f['per_capita'] = $res['per_capita'];
                    $f['tag_time'] = $res['tag_time'];
                    $f['address'] = $res['address'];
                    $f['phone'] = $res['phone'];
                    $f['business_hours'] = $res['business_hours'];
                    $f['store_Introduction'] = $res['restaurant_Introduction'];
                }
            }
           

        }
        // print_r($re_food);
        foreach($re_food as $key4 => &$food)
        {   
            //商品封面
            if(!empty($food['pic']))
            {
                $food_pic = json_decode($food['pic'],true);
                foreach($food_pic as $k => &$food_value)
                {
                    //common.php中封装的图片url解析方法
                    $food['goods_url']= cmf_get_image_preview_url($food_value['url']); 
                }
            }
            else{
                $unified_404 = '404/unified_404.png';
                $food['goods_url'] = cmf_get_image_preview_url($unified_404);
            }
            
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
                $v['name'] = $keyV2[$k];   
                foreach($v['place'] as $k1 => $v1)
                {
                    $v['goods_url'] = $v1['goods_url']; //美食图片
                    $v['recom_sites'] = "";
                } 
            }
            
            // print_r($arr);
            // print_r($arr2);
            //合并单店、连锁的必吃美食，统一输出
            $arr3 = [];
            foreach($arr as $k1=>&$v1){
                foreach($arr2 as $k2=>$v2){
                    if($v1['name'] == $v2['name']){
                        $arr3[$k1]['place'] = array_merge($v1['place'],$v2['place']);
                        $arr3[$k1]['name'] = $v1['name'];
                        $arr3[$k1]['goods_url'] = $v1['goods_url'];
                        $arr3[$k1]['recom_sites'] = $v1['recom_sites'];
                    }
                }
            }
            $arr5 = array_merge($arr,$arr2);
            foreach($arr3 as $k3=>&$v3){
                foreach($arr5 as $k5=>&$v5){
                    if($v3['name'] == $v5['name']){
                        
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
        $store = Db::name('Store_info')->where(array('city_id'=>$city_id))->select();
        $localResult = json_decode($store,true);
        
        foreach($localResult as &$value)
        {
            $value['tag_time'] = $this->play_time($value['meal_time']);  //时间统一成小时
            if(!empty($value['pic']))
            {
                $pic = json_decode($value['pic'],true);
                foreach($pic as $k => &$p)
                {
                    //common.php中封装的图片url解析方法
                    $value['url']= cmf_get_image_preview_url($p['url']); 
                }
                unset($value['pic']);
            }
            else{
                $unified_404 = '404/unified_404.png';
                $value['url'] = cmf_get_image_preview_url($unified_404);
            }
            $value['store_type'] = 0;   //单店
        }
        //连锁餐厅总店
        foreach($restaurantResult as &$value2)
        {
            $value2['tag_time'] = $this->play_time($value2['meal_time']);  //时间统一成小时
            if(!empty($value2['pic']))
            {
                $pic2 = json_decode($value2['pic'],true);
                foreach($pic2 as $k => &$p2)
                {
                    //common.php中封装的图片url解析方法
                    $value2['url']= cmf_get_image_preview_url($p2['url']); 
                }
                unset($value2['pic']);
            }
            else{
                $unified_404 = '404/unified_404.png';
                $value2['url'] = cmf_get_image_preview_url($unified_404);
            }
            
            $value2['store_name'] = $value2['restaurant_name'];
            $value2['store_type'] = 1;  //连锁店 
            //分店的列表
            $branchInfo = Db::name('branch')->where(array('store_name'=>$value2['restaurant_name']))->select()->toArray();
            $value2['fen_store'] = $branchInfo;
            unset($value2['restaurant_name']);
        }
        $local = array_merge($localResult,$restaurantResult);
        // $local = $this->shuffle_assoc($list);

        /*********  第三部分**********/
        //美食街区
        $foodstreet = Db::name('Food_court')->field(array('id','province_id','city_id','area_id','food_court_name','type','pic','longitude','latitude','meal_time','suit_time','period_time','not_modifity','business_hours'))
        ->where(array('city_id'=>$city_id))->select();
        $foodResult = json_decode($foodstreet,true);
        foreach($foodResult as &$st)
        {
            //适玩时间
            $st['tag_time'] = $this->play_time($st['suit_time']);  //时间统一成小时
            $st['ticket_data'] = ''; //景点门票
            if(!empty($st['pic']))
            {
                $image = json_decode($st['pic'],true);
                foreach($image as $k => &$im)
                {
                    //common.php中封装的图片url解析方法
                    $st['url']= cmf_get_image_preview_url($im['url']); 
                }
                unset($st['pic']);
            }
            
            
            unset($st['picture2']);
            $st['store_name'] = $st['food_court_name'];
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
        $type['tab']= array(
            array('type'=>'必吃美食','them'=>'eat'),
            array('type'=>'本土美食','them'=>'local'),
            array('type'=>'美食街区','them'=>'street')
        );
        $Result = array_merge($willeat,$localeat,$street,$type);
// print_r($Result);
        //搜索
        if(isset($post['group']))
        {
            //本土美食local
            if($post['group'] == 'local')
            {
                //带有搜索条件下返回的数据，放在列表第一位
                if(isset($post['search_spot_name']) && strlen($post['search_spot_name']) > 0){
                    foreach($Result['local'] as $key=>$local)
                    {
                        if($post['search_spot_name'] == $local['store_name'])
                        {
                            array_unshift($Result['local'],$local);
                        }
                       
                    }
                    
                }
            }
            foreach($Result['local'] as $key0=>$tt)
            {
                if($tt['store_name'] == $post['search_spot_name']){
                    if($key0 != 0){
                        unset($Result['local'][$key0]);
                    }
                }
            }
            $Result['local'] = array_merge($Result['local']);

            //美食街区street
            if($post['group'] == 'street')
            {
                //带有搜索条件下返回的数据，放在列表第一位
                if(isset($post['search_spot_name']) && strlen($post['search_spot_name']) > 0){
                    foreach($Result['street'] as $key=>$street)
                    {
                        if($post['search_spot_name'] == $street['store_name'])
                        {
                            array_unshift($Result['street'],$street);
                        }
                       
                    }
                    
                }
            }
            foreach($Result['street'] as $key1=>$na)
            {
                if($na['store_name'] == $post['search_spot_name']){
                    if($key1 != 0){
                        unset($Result['street'][$key1]);
                    }
                }
            }
            $Result['street'] = array_merge($Result['street']);
        }

        echo json_encode($Result,JSON_UNESCAPED_UNICODE);
    }


    /***** 美食诱惑的具体详情  ******/
    public  function food_detail()
    {
        /****** 美食诱惑介绍  *********/
        $post = $_POST;
        $name = $post['spot_name'];
        $city_id = $post['city_id'];
        $type = $post['type'];   //根据传递过来的类型判断是哪个分组下的，然后查询相应的数据表的数据
        $store_type = $post['store_type'];   //0单店，1连锁店
        $Info = array();
        $Data = array();
        $result = array();
        $a = array();
        $b = array(); 

        $result = array();

        //总店
        $restaurant_chain = Db::name('Restaurant_chain')->where(array('city_id'=>$city_id,'restaurant_name'=>$name))->find();
    
        if(isset($restaurant_chain['restaurant_name']))
        {
            $restaurant_chain['store_name'] = $restaurant_chain['restaurant_name'];
            unset($restaurant_chain['restaurant_name']);
        }
        if(isset($restaurant_chain['restaurant_Introduction']))
        {
            $restaurant_chain['Introduction'] = $restaurant_chain['restaurant_Introduction'];
            unset($restaurant_chain['restaurant_Introduction']);
        }
        if(isset($restaurant_chain['update_time']))
        {
            $restaurant_chain['release_time'] = date('Y-m-d', $restaurant_chain['update_time']);
        }
        
        if(isset($restaurant_chain['picture2']))
        {
            $re_cover = json_decode($restaurant_chain['picture2'],true);
            foreach($re_cover as $kk2 => &$re)
            {
                //common.php中封装的图片url解析方法
                $restaurant_chain['image_url'][$kk2]= cmf_get_image_preview_url($re['url']); 
            }
        }
        

        //分店
        $branchInfo = Db::name('branch')->where(array('store_name'=>$name))->select();
        $barnchResult = json_decode($branchInfo,true);

        foreach($barnchResult as &$branch)
        {
            if(!empty($restaurant_chain['pic']))
            {
                $cover = json_decode($restaurant_chain['pic'],true);
                foreach($cover as $k3 => &$value)
                {
                    //common.php中封装的图片url解析方法
                    $branch['image_url']= cmf_get_image_preview_url($value['url']); 
                }
            }
            
        } 
        //单店推荐菜品
        if($store_type == 0)
        {
            $tuijianResult = Db::name('dishes_recommended_info')->field(array('id','store_name','dishes_name','pic','is_hot_have','status','is_top'))
            ->where(array('city_id'=>$city_id,'store_name'=>$name))->select()->toArray();
            foreach($tuijianResult as &$tj)
            {
                if(!empty($tj['pic']))
                {
                    $tj_cover = json_decode($tj['pic'],true);
                    foreach($tj_cover as $k5 => &$vv)
                    {
                        //common.php中封装的图片url解析方法
                        $tj['image_url']= cmf_get_image_preview_url($vv['url']); 
                    }
                    unset($tj['pic']);
                }
               
            }
        }
       
        //连锁店推荐菜品
        if($store_type == 1)
        {
            $tuijianResult = Db::name('recom_dishes')->field(array('id','store_name','dishes_name','pic','is_hot_have','status','is_top'))
            ->where(array('city_id'=>$city_id,'store_name'=>$name))->select()->toArray();
            foreach($tuijianResult as &$tj)
            {
                if(!empty($tj['pic']))
                {
                    $tj_cover = json_decode($tj['pic'],true);
                    foreach($tj_cover as $k5 => &$vv)
                    {
                        //common.php中封装的图片url解析方法
                        $tj['image_url']= cmf_get_image_preview_url($vv['url']); 
                    }
                    unset($tj['pic']);
                }
            }
        }
        $dishesResult = $tuijianResult;
        $a['store'] = $restaurant_chain;
        $a['fen'] = $barnchResult;
        $a['tj'] = $tuijianResult;
        //必吃美食详情
        //单店
        if($type == '必吃美食')
        {
            $storeData = Db::name('Store_info')->where(array('city_id'=>$city_id,'store_name'=>$name))->find();
            $storeData['release_time'] = date('Y-m-d', $storeData['update_time']);
            if(!empty($storeData['picture2']))
            {
                $picture2 = json_decode($storeData['picture2'],true);
                foreach($picture2 as $k => &$val)
                {
                    //common.php中封装的图片url解析方法 
                    $storeData['image_url'][$k]= cmf_get_image_preview_url($val['url']); 
                    $storeData['image_name'][$k]= substr($val['name'],0,strpos($val['name'], '.'));
                    $pp['url'] = $storeData['image_url'][$k];
                    $pp['name'] = $storeData['image_name'][$k];
                    $storeData['image'][$k] = $pp;
                }
                unset($storeData['pic']);
            }
           
            unset($storeData['picture2']);
            //文字描述中的html标签转化成实体
            if(isset($storeData['store_Introduction']))
            {
            	$storeData['Introduction'] = htmlchars($storeData['store_Introduction']);
            	unset($storeData['store_Introduction']);
            }
            if(isset($storeData['other_description']))
            {
            	$storeData['qita_description'] = htmlchars($storeData['other_description']);
            	unset($storeData['other_description']);
            }

        }
        //单店
        if($post['store_type'] == 0)
        {
            if(!empty($storeData))
            {
                $dan['store'] = $storeData;
                $dan['fen'] = array();
                $dan['tj'] = $tuijianResult;
                $Data = $dan;
            }
        //连锁店
        }else{
            $Data = $a;
        }

        //本土美食详情
        if($type == '本土美食')
        {
            $where['store_name'] = $name;
            $storeInfo = Db::name('store_info')->where($where)->find();
            //景点封面图片 cover
            if(!empty($storeInfo))
            {
                if(!empty($storeInfo['picture2']))
                {
                    $cover_pic = json_decode($storeInfo['picture2'],true);
                    foreach($cover_pic as $k => &$pic_value)
                    {
                        //common.php中封装的图片url解析方法 
                     	$storeInfo['image_url'][$k]= cmf_get_image_preview_url($pic_value['url']); 
	                    $storeInfo['image_name'][$k]= substr($pic_value['name'],0,strpos($pic_value['name'], '.'));
	                    $pp['url'] = $storeInfo['image_url'][$k];
	                    $pp['name'] = $storeInfo['image_name'][$k];
	                    $storeInfo['image'][$k] = $pp;
                    }
                    unset($storeInfo['picture2']);
                }
                
                //文字描述中的html标签转化成实体
                $storeInfo['Introduction'] = htmlchars($storeInfo['store_Introduction']);
                unset($storeInfo['store_Introduction']);

                $storeInfo['qita_description'] = htmlchars($storeInfo['other_description']);
                unset($storeInfo['other_description']);
                $storeInfo['release_time'] = date('Y-m-d', $storeInfo['update_time']);
                //推荐菜品
                $dishesInfo = Db::name('Dishes_recommended_info')->field(array('id','store_name','dishes_name','pic','is_hot_have','status','is_top'))->where(array('store_name'=>$name))->select();
                $dishesResult = json_decode($dishesInfo,true);
            
                foreach($dishesResult as &$dish)
                {
                    if(!empty($dish['pic']))
                    {
                        $dish_cover = json_decode($dish['pic'],true);
                        foreach($dish_cover as $k2 => &$dish_value)
                        {
                            //common.php中封装的图片url解析方法
                            $dish['image_url']= cmf_get_image_preview_url($dish_value['url']); 
                        }
                        unset($dish['pic']);
                    }
                  
                }

                $Info['store'] = $storeInfo;
                $Info['fen'] = $b;
                $Info['tj'] = $dishesResult;  
            }else{
                $Info = $a;     //连锁店的数据（总店，分店）
            }

        }

        //美食街区详情
        if($type == '美食街区')
        {
            $courtInfo = Db::name('Food_court')->where(array('city_id'=>$city_id,'food_court_name'=>$name))->find();
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
                
                
                //文字描述中的html标签转化成实体
                $courtInfo['Introduction'] = htmlchars($courtInfo['court_Introduction']);
                unset($courtInfo['court_Introduction']);
                $courtInfo['qita_description'] = htmlchars($courtInfo['other_description']);
                unset($courtInfo['other_description']);
                unset($courtInfo['pic']);
                $courtInfo['release_time'] = date('Y-m-d', $courtInfo['update_time']);
            }
        }
        

        $result = array();
        if(!empty($Data))
        {
            $result['spot'] = $Data;    //店铺的简要介绍
            $result['dishes'] = $dishesResult;   //推荐菜品
        }
        if(!empty($Info))
        {
            $result = $Info;  

        }
        

        if(!empty($courtInfo))
        {
            $result['spot'] = $courtInfo; 
        }
        echo json_encode($result,JSON_UNESCAPED_UNICODE);
    }

    //必吃美食中的菜品详情
    public function specific()
    {
        /****** 美食诱惑介绍  *********/
        $post = $_POST;
        $name = $post['spot_name'];
        $city_id = $post['city_id'];

        $dishesResult = Db::name('Dishes_recommended_info')->where(array('city_id'=>$city_id,'dishes_name'=>$name))->find();
        if(!empty($dishesResult['pic']))
        {
            $dish_cover = json_decode($dishesResult['pic'],true);
            foreach($dish_cover as $k2 => &$dish_value)
            {
                //common.php中封装的图片url解析方法
                $dishesResult['image_url'][$k2]= cmf_get_image_preview_url($dish_value['url']); 
            }
            unset($dishesResult['pic']);
        }
        
        echo json_encode($dishesResult,JSON_UNESCAPED_UNICODE);
    }

    /*** 5F
     * 购物街
     ***/
    //购物街列表
    public function shop()
    {
        //购物详情列表
        ////根据传递过来的
        $post = $_POST;
        $city_id = $post['city_id'];

        $shopList = Db::name('shopping_streets')->where(array('city_id'=>$city_id))->select();
        $shopResult = json_decode($shopList,true);
    
        //推荐商品店铺列表 is_specialty=>1 本土特产
        $goodsList = Db::name('goods_info')->field(array('id','goods_name','recom_sites','store_name','type','pic'))->where(array('is_specialty'=>1,'city_id'=>$city_id))->select();
        $goodsResult = json_decode($goodsList,true);
        foreach($shopResult as $key1=>&$sh)
        {
            //适玩时间
            $sh['tag_time'] = $this->play_time($sh['shopping_time']);  //时间统一成小时
            $sh['ticket_data'] = ''; //景点门票
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
                if($sh['shopping_name'] == $g['store_name'])
                {
                    $g['city_id'] = $sh['city_id'];
                    $g['longitude'] = $sh['longitude'];
                    $g['latitude'] = $sh['latitude'];
                    $g['period_time'] = $sh['period_time'];
                    $g['not_modifity'] = $sh['not_modifity'];
                    $g['business_hours'] = $sh['business_hours'];
                    if(isset($sh['pic_url']))
                    {
                        $g['dianpu_image'] = $sh['pic_url'];
                    }
                    
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
                    $goods['goods_url']= cmf_get_image_preview_url($good_value['url']); 
                }
                $arr[$goods['goods_name']]['place'][] = $goods; //取出数据分组
            }
          
        }
        
        $keyV = array_keys($arr);
        $arr = array_values($arr);
        foreach($arr as $k => &$v)
        {
            $v['name'] = $keyV[$k];
            foreach($v['place'] as $k1 => $v1)
            {
                $v['goods_url'] = $v1['goods_url'];
                $v['recom_sites'] = $v1['recom_sites'];
            } 
        }

        $local_product = array();
        $pro_shops = array();
        $business_circle = array();

        foreach($shopResult as $key=>&$shop)
        {
            //适玩时间
            $shop['tag_time'] = $this->play_time($shop['shopping_time']);  //时间统一成小时
            $shop['ticket_data'] = ''; //景点门票
            if(!empty($shop['pic']))
            {
                $picture = json_decode($shop['pic'],true);
                foreach($picture as $k=> &$picvalue)
                {
                    //common.php中封装的图片url解析方法
                    $shop['img_url'] = cmf_get_image_preview_url($picvalue['url']); 
                }
                unset($shop['pic']);
            }
           
            unset($shop['picture2']);
            //文字描述中的html标签转化成实体
            $shop['shopping_Intro'] = htmlchars($shop['shopping_Introduction']);
            unset($shop['shopping_Introduction']);
            $shop['qita_description'] = htmlchars($shop['other_description']);
            unset($shop['other_description']);

            if($shop['type'] == '土特产店' || $shop['shop_type'] == '土特产店')
            {
                $pro_shops['productShops'][] = $shop;
            }
            if($shop['type'] == '购物商圈' || $shop['shop_type'] == '购物商圈')
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
        $type['tab']= array(
            array('type'=>'本土特产','them'=>'localProduct'),
            array('type'=>'土特产店','them'=>'productShops'),
            array('type'=>'购物商圈','them'=>'businessCircle')
        );
        $Result = array_merge($local_product,$pro_shops,$business_circle,$type);

        //搜索
        if(isset($post['group']))
        {
            //土特产店productShops
            if($post['group'] == 'productShops')
            {
                //带有搜索条件下返回的数据，放在列表第一位
                if(isset($post['search_spot_name']) && strlen($post['search_spot_name']) > 0){
                    foreach($Result['productShops'] as $key=>$productShops)
                    {
                        if($post['search_spot_name'] == $productShops['shopping_name'])
                        {
                            array_unshift($Result['productShops'],$productShops);
                        }
                       
                    }
                    
                }
            }
            foreach($Result['productShops'] as $key0=>$tt)
            {
                if($tt['shopping_name'] == $post['search_spot_name']){
                    if($key0 != 0){
                        unset($Result['productShops'][$key0]);
                    }
                }
            }
            $Result['productShops'] = array_merge($Result['productShops']);

            //购物商圈businessCircle
            if($post['group'] == 'businessCircle')
            {
                //带有搜索条件下返回的数据，放在列表第一位
                if(isset($post['search_spot_name']) && strlen($post['search_spot_name']) > 0){
                    foreach($Result['businessCircle'] as $key=>$businessCircle)
                    {
                        if($post['search_spot_name'] == $businessCircle['shopping_name'])
                        {
                            array_unshift($Result['businessCircle'],$businessCircle);
                        }
                       
                    }
                    
                }
            }
            foreach($Result['businessCircle'] as $key1=>$na)
            {
                if($na['shopping_name'] == $post['search_spot_name']){
                    if($key1 != 0){
                        unset($Result['businessCircle'][$key1]);
                    }
                }
            }
            $Result['businessCircle'] = array_merge($Result['businessCircle']);
        }

        echo json_encode($Result,JSON_UNESCAPED_UNICODE);
    }

    //购物天堂的具体详情
    public  function shop_detail()
    {
        /****** 购物详情介绍  *********/
        $post = $_POST;
        $shopping_name = $post['spot_name'];
        //测试
        // $shopping_name = '天鹅湖店铺';  

        $where['shopping_name'] = $shopping_name;
        $shopDetail = Db::name('shopping_streets')->where($where)->find();
    // print_r($shopDetail); exit;
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
        if(isset($shopDetail['shopping_Introduction']))
        {
        	$shopDetail['Introduction'] = htmlchars($shopDetail['shopping_Introduction']);
        	unset($shopDetail['shopping_Introduction']);
        }
       
       if(isset($shopDetail['other_description']))
        {
        	$shopDetail['qita_description'] = htmlchars($shopDetail['other_description']);
        	unset($shopDetail['other_description']);
        }
        
        unset($shopDetail['pic']);
        /*** 特色商品 ***/
        $goodinfoList = Db::name('goods_info')->where(array('city_id'=>$post['city_id'],'type'=>$shopDetail['type'],'store_name'=>$shopping_name))->select();
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
        $result = array();
        $result['spot'] = $shopDetail;    //景区里的简要介绍
        $result['features_goods'] = $goodinfoResult;   //本土特产、土特产店、购物商圈中的特色商品
        echo json_encode($result,JSON_UNESCAPED_UNICODE);
    }
    

    //本土特产中商品的详情
    public function local_product()
    {
        $post = $_POST;
        $shopping_name = $post['spot_name'];

        $goodsList = Db::name('goods_info')->where(array('city_id'=>$post['city_id'],'goods_name'=>$shopping_name))->find();
        if(!empty($goodsList['pic']))
        {
            $goods_pic = json_decode($goodsList['pic'],true);
            foreach($goods_pic as $k2 => &$dish_value)
            {
                //common.php中封装的图片url解析方法
                $goodsList['image_url'][$k2]= cmf_get_image_preview_url($dish_value['url']); 
            }
            unset($goodsList['pic']);
        }
        
        echo json_encode($goodsList,JSON_UNESCAPED_UNICODE);
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

    //安排日程
    public function attractionsArrange()
    {
       
        return $this->fetch();
    }
    
    //A、B、C、D点之间的距离（依次找距离中心点最近的点）
    public function sortDis($shortDis,$data){
        $arr = array();
        $num = count($data);
        for($i=0;$i<$num;$i++){
            for($j=1;$j<$num;$j++){
                $arr[] = [$data[$i],$data[$j]];
            }
            break;
        }
        foreach ($arr as $k => $v) {
            $dis = getDistance($v['0']['this_lng'],$v['0']['this_lat'],$v['1']['this_lng'],$v['1']['this_lat'],2);
            $allDis[$v[1]['this_name']] = $dis;
        }
        asort($allDis);

        // print_r($allDis);
        // exit;
        $sDis = array_keys($allDis);
        $shortDis[] = $sDis[0];//距离最短地点
        // print_r($shortDis);
        
        foreach ($data as $key => $value) {
            if($value['this_name'] == $sDis[0]){
                //将数组第一个城市替换成距离最短地点
                $data[0] = $value;
                unset($data[$key]);
            }
        }
     
        $data = array_values($data);//键值归零
        if(!empty($data[1])){
            $shortDis = $this->sortDis($shortDis,$data);
        }
        // print_r($shortDis);
        // exit;
        return $shortDis;

    }
    //优化线路数据返回
    public function optimize_line()
    {
        session_start();
        $post = file_get_contents('php://input'); 
        $post = json_decode($post,true);   
        //后面一个城市是否有0天的城市标记
        $_SESSION['next_city_day0'] = $post['next_city_day0'];
        // $citynum = $post['spot_data']['this_cityDayNum']; //当前城市的天数
        $this_city = $post['spot_data']['this_city'];      //当前城市    
        $this_cityid = $post['spot_data']['this_cityid'];   //景点所属city_id
        $this_city_index = $post['spot_data']['this_city_index'];   //当前城市索引
        $this_city_lng = $post['spot_data']['this_city_lng'];   
        $this_city_lat = $post['spot_data']['this_city_lat']; 
        //当前城市景点数，购物数，美食数
        $shop_len = $post['spot_data']['shop_len'];
        $spot_len = $post['spot_data']['spot_len'];
        $eat_len = $post['spot_data']['eat_len'];

        $city_data = $post['go_city_array'];     //游玩城市
        $departure_city = $post['departure_city'];  //出发城市
        $return_city = $post['return_city'];         //返回城市
        $len = count($city_data);

        //需要的基本元素
        $result['this_city'] = $this_city;
        $result['shop_len'] = $shop_len ;
        $result['spot_len'] = $spot_len; 
        $result['eat_len'] = $eat_len;
        $result['this_city_lng'] = $this_city_lng;
        $result['this_city_lat'] = $this_city_lat;
        if(isset($eat_data))
        {
            $result['eat_data'] = $eat_data;
        }

        /*** 行程优化部分 ***/
        //关于景点的基本信息
        $spot_data = $post['spot_data']['addgo_arry'];

        //特殊处理，当数据库period_time字段为空时候（录入组没有录入）,默认为allday属性补全
        //美食街区，5F都没，都没有ranking字段,默认ranking = '10'值补全
        foreach($spot_data as &$stemp)
        {
            if($stemp['period_time'] == '')
            {
                $stemp['period_time'] = 'allday';
            }
            if(!isset($stemp['ranking']))
            {
                $stemp['ranking'] = '10';
            }
        }
        //美食
        if(!empty($post['spot_data']['eat_name_arry']) && !empty($spot_data))
        {
            $eatData = $post['spot_data']['eat_name_arry'];
            //每个美食到每个景点的距离
            foreach($eatData as $key1=>$eat)
            {
                foreach($spot_data as $key2=>&$spotvalue)
                {
                    $longitude1 = $eat['lng']; //美食经纬度
                    $latitude1 = $eat['lat'];
                    $lo = $spotvalue['this_lng']; //景点经纬度
                    $la = $spotvalue['this_lat'];

                    $distance[$eat['name']][$spotvalue['this_name']] = getDistance($longitude1, $latitude1, $lo, $la, 2);
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
                                if($eat['name'] == $key2)
                                { 
                                    if($eat['name'] == $key3)
                                    {
                                        $eatResult['city_id'] = $eat['city_id'];
                                        $eatResult['lng'] = $eat['lng'];
                                        $eatResult['lat'] = $eat['lat'];
                                        $eatResult['per_capita'] = $eat['per_capita'];
                                        $eatResult['address'] = $eat['address'];
                                        $eatResult['business_hours'] = $eat['business_hours'];
                                        if(isset($eat['store_Introduction']))
                                        {
                                            $eatResult['store_Introduction'] = $eat['store_Introduction'];
                                        }
                                       
                                        $eatResult['dianpu_image'] = $eat['dianpu_image'];
                                        $eatResult['js_sport_eat'] = $eat['js_sport_eat'];
                                        $eatResult['meal_time'] = $eat['meal_time'];
                                        $eatResult['tag_time'] = $eat['tag_time'];
                                        
                                        $eatResult['eat_to_spot'] = $dd; //美食到景点的距离
                                        // if(isset($eat['fen_data'])) //分店{ $eatResult['fen_data'] = $eat['fen_data'];}
                                    }   
                                }
                            }
                        }
                        $eatResult['name'] = $key2;
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
            $return=$this->sortDis($shortDis,$duringday);
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
            $return=$this->sortDis($shortDis2,$night);

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
            $return=$this->sortDis($shortDis3,$allday);

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
        }else{
            $all_array = $allday;
        }


        $daytime = array_sum(array_map(create_function('$vals', 'return $vals["this_tag_time"];'),$duringday));
        $nighttime = array_sum(array_map(create_function('$vals', 'return $vals["this_tag_time"];'),$night));
        $alldaytime = array_sum(array_map(create_function('$vals', 'return $vals["this_tag_time"];'),$allday));

        if(!empty($spot_data)){
            $firstspot = $spot_data[0]; //根据ranking确定首景点
        }

        //每天的时间区间,酒店,日期
        $dateArrray = $post['dayTime'];   
        $citynum = count($dateArrray);   //当前城市玩的天数
        foreach($dateArrray as $key1=>&$dater)
        {
            $weeks = date("N",(strtotime($dater['of_date'])));
            switch($weeks)
            {
                case 1:
                $dater['weeks'] = '周一';
                break;  
                case 2:
                $dater['weeks'] = '周二';
                break;
                case 3:
                $dater['weeks'] = '周三';
                break;
                case 4:
                $dater['weeks'] = '周四';
                break;
                case 5:
                $dater['weeks'] = '周五';
                break;
                case 6:
                $dater['weeks'] = '周六';
                break;
                case 7:
                $dater['weeks'] = '周天';
                default:
            }
        }
        // print_r($dateArrray);
        // exit;
        //单个城市每天的游玩时间段,酒店
        foreach($dateArrray as $kkk=>$vbn){
            $group[$kkk] = $vbn['betw_time'];
            if(isset($vbn['hotel'])){
                $hotelData[$kkk] = $vbn['hotel'];
            }else{
                $h = array('of_date'=>$vbn['of_date']);
                $hotelData[$kkk]= $h;
            }
        }
        //    print_r($group);
//            print_r($hotelData);
//            exit;
       //所有城市的酒店按照日期存放
       if(isset($_SESSION['allhotel'])){
            $orghotel = $_SESSION['allhotel'];
            foreach($orghotel as $key=>$vf){
                foreach($hotelData as $fval){
                    //日期相同的用最新的酒店
                    if($vf['of_date'] == $fval['of_date']){
                        unset($orghotel[$key]); 
                    }
                }
            }  
            // 酒店整合
            $allhotel = array_merge($orghotel,$hotelData);
       }else{
            $allhotel = $hotelData;
       }
       $_SESSION['allhotel'] = $allhotel;
    //    print_r($allhotel);
    //    exit;
    
       //根据前一个城市的最后一天的结束时间来判断是否可以在当天跨城市
    //    $endtime = end($group);  //当前城市最后一天的时间段
    //    $endelemt = explode("-",$endtime); //结束时间
    //    if($endelemt[1] < '22:00'){
    //         $tranCity = 'tran_ok';
    //    }else{
    //         $tranCity = 'tran_no';
    //    }
    //    $_SESSION['tranCity'] = $tranCity;
       

        // 所有城市的每天的游玩时段
        if(isset($_SESSION['timeInterval']))
        {
            $groupData = $_SESSION['timeInterval'];
        }else{
            for($i=0;$i<$len;$i++)
            {
                $groupData[] = array();
            }
        }
        foreach($groupData as $key=>$vgh)
        {
            if($key == $this_city_index){
                $groupData[$key] = $group;
            }
        }
        // print_r($groupData);
        // exit;

        $_SESSION['timeInterval'] = $groupData;

        //存入临时变量
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
                if(!empty($n_array)){
                    $n_array = array_merge($n_array); 
                }     
            }
        }
        // print_r($group);
        // var_dump($day);
        // print_r($d_array);
        // exit;
        /*** 情况一:首景点选择的是全天元素  ***/
        if(!empty($firstspot))
        {
            $firsttemp = $firstspot; //首景点临时变量
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
                        if(!empty($d_array))
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
                                    if(isset($temp2) && $temp2['this_tag_time'] < $group[0]['totaltime'])
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
                                    }
                                    
                                   else{
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
            // print_r($poor);
            // print_r($all_array);
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
            // print_r($poor2);
            // var_dump($day);
            // exit;
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
                        // echo 8;
                        foreach($redata as $re)
                        {
                            array_push($day[$len-1]['day'],$re); 
                        }
                    }
                }
            } 
        }
        /////////end 景点优化
        
        //日期匹配到每天
        foreach($dateArrray as $key1=>$yhs)
        {
            foreach($day as $key2=>$yy)
            {
                if($key1 == $key2)
                {
                    $day[$key2]['month_day'] = $yhs['month_day'];
                    $day[$key2]['of_date'] = $yhs['of_date'];
                    $day[$key2]['hotel_day'] = $yhs['hotel_day'];
                    $day[$key2]['weeks'] = $yhs['weeks'];
                    $day[$key2]['date'] = date('m.d',strtotime($yhs['of_date'])); 
                    $day[$key2]['betw_time'] = $yhs['betw_time']; 
                    $day[$key2]['time1'] = $yhs['time1'];
                    $day[$key2]['time2'] = $yhs['time2'];
                }
            }
        }
        // print_r($day)
        $eatArray = $post['spot_data']['eat_name_arry'];
        //只选择了酒店，没有选择任何的景点与美食
        if(empty($spot_data) && empty($eatArray)){
            $day = $dateArrray;
        }
        //只选择了美食店,没有选择景点，此时将美食当做景点看待        
        if(!empty($eatArray) && empty($spot_data))
        {
            foreach($eatArray as &$hc){
                $hc['this_name'] = $hc['name'];
                $hc['this_lat'] = $hc['lat'];
                $hc['this_lng'] = $hc['lng'];
                $hc['this_img_src'] = $hc['dianpu_image'];
                $hc['this_playtime'] = $hc['meal_time'];
                $hc['default_playtime'] = $hc['meal_time'];
                $hc['this_tag_time'] = $hc['tag_time'];
                $hc['this_floor_index'] = 3;
                $hc['this_type'] = '必吃美食';
                $hc['ranking'] = 10;
                $hc['period_time'] = 'allday';
                $hc['not_modifity'] = 0;
                $hc['js_sport_eat'] = 'eat';
                $hc['suit_season'] = '1-12月';
                $hc['business_hours'] = '10:00-21:30';
                unset($hc['name'],$hc['lat'],$hc['lng'],$hc['dianpu_image'],$hc['meal_time']);
            }
            foreach($group as $key1=>$g_value)
            {       
                $sum9 = 0;
                //匹配到每天
                foreach($eatArray as $ky=>$ee){
                    if($sum9 < $g_value['totaltime']){
                        $sum9 = $sum9+ $ee['tag_time'];
                        $day[$key1]['day'][] = $ee;
                        unset($eatArray[$ky]);
                        array_merge($eatArray);
                    }
                }
            }
            // print_r($dateArrray);
            foreach($day as $vkey=>&$vnm)
            {
                foreach($dateArrray as $dkey=>$wer)
                {
                    if($vkey == $dkey){
                        $vnm['date'] = $wer['hotel_day'];
                        $vnm['month_day'] = $wer['month_day'];
                        $vnm['of_date'] = $wer['of_date'];
                        $vnm['betw_time'] = $wer['betw_time'];
                        $vnm['time1'] = $wer['time1'];   //时间区间转化成秒，插件用的
                        $vnm['time2'] = $wer['time2'];  
                        $vnm['weeks'] = $wer['weeks'];
                    }
                }
            }
        }

         //酒店匹配到每天
        foreach($hotelData as $hkey=>$hVlaue){
            foreach($day as $ddkey=>$yyvalue){
                if($hkey == $ddkey){    
                    if(isset($hVlaue['hotel_name'])){
                        $day[$ddkey]['hotel'] = $hVlaue;
                    } 
                }
            }
        }

        //计算每天的时间总和(景点适玩时间、交通时间、美食时间)
        foreach($day as $key1=>&$vvv)
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
                        $timeValue = explode('-',$groupValue);
                        $valuesData['start_clock'] = $timeValue[0]; 
                        $valuesData['start_time'] = $valuesData['start_clock'];
                        $valuesData['resultsTime'] = $timeValue[1]; 
                        $temptime = $valuesData['start_clock'] + $valuesData['time'];
                        if(is_float($temptime)){
                            $df =explode('.',$temptime);
                            $valuesData['end_time']= $df[0].':'.'30';
                        }else{
                            if($temptime <'10'){
                                $valuesData['end_time']= '0'.$temptime.':'.'00';
                            }else{
                                $valuesData['end_time']= $temptime.':'.'00';
                            }
                        }
                    }
                } 
            }
        //没有安排到景点的天里，放一个空的day对象
         foreach($day as &$cvm){
             if(!isset($cvm['day'])){
                 $cvm['day'] = [];
             }
         }
//         print_r($day);
        $result['day_arry'] = $day;
        //原始的数据格式存到session
        $_SESSION['data'] = $post;
        //处理后的结果存到session
        $_SESSION['result'] = $result;
        if(isset($result)){
            $return = array('status'=>true,'msg'=>'生成行程方案成功!','data'=>[]);
        }else{
            $return = array('status'=>false,'msg'=>'生成行程方案失败!','data'=>[]);
        }
        echo json_encode($return,JSON_UNESCAPED_UNICODE);
    }
    //从session取出数据返回
    public function plan()
    {
        session_start();
        // print_r($_SESSION);
        ini_set('session.gc_maxlifetime', 3600); 
        ini_get('session.gc_maxlifetime'); //得到ini中设定值 
        $info['result'] = $_SESSION['result'];
        $info['r_spot'] = $_SESSION['data'];
        if(isset($info)){
            $return = array('status'=>true,'msg'=>'请求成功!','data'=>$info);
        }else{
            $return = array('status'=>false,'msg'=>'请求失败!','data'=>[]);
        }
        echo json_encode($return,JSON_UNESCAPED_UNICODE);
    }
    //用户自己新增酒店
    public function NewHotel()
    {
        $post = input('post.');
        $data['city_id'] = $post['city_id'];
        $data['hotel_name'] = $post['hotel_name'];
        $data['LowRate'] = $post['LowRate']; //最低价格
        $data['lat'] = $post['lat'];
        $data['lng'] = $post['lng'];
        $data['address'] = $post['address'];
        $data['arrivalDate'] =strtotime($post['arrivalDate']);
        $data['creat_time'] =time();
       
        $base64_image_content = $post['ThumbNailUrl'];
        $orgurl = '/upload/newhotel/'.date('Ymd').'/';
        $imageresult = Base64Image($base64_image_content,$orgurl);
        $ab ='http://';
        if(!empty($imageresult['url']))
        {
            $data['ThumbNailUrl'] = $imageresult['url']; 
            $image_cover = $ab.$_SERVER['HTTP_HOST'].$imageresult['url']; 
        }else{
            //当没有上传图片时，用logo图片代替
            $no_up = '404/logo.png';
            $data['ThumbNailUrl'] = $no_up; 
            $image_cover= cmf_get_image_preview_url($no_up);
        }
        
        $result = Db::name('New_hotel')->insert($data);
        if($result) 
        {
            $return = array('status'=>true,'msg'=>'保存成功','data'=>$image_cover);
        }else{
            $return = array('status'=>false,'msg'=>'保存失败','data'=>'');
        }
        echo json_encode($return,JSON_UNESCAPED_UNICODE);
    }
    //行程总览页面
    public function tripOverview()
    {
       return $this->fetch();
    }
    
    //从个人中心编辑已经做好的行程单，链接到这里，数据重新布局到session
    public function Personal_edit()
    {
        session_start();
        if($_POST['is_plan_edit'] == 'ok')
        {
            $uid = $_POST['uid'];
            $trip_id = $_POST['trip_id'];

            $trip_info = Db::name('trip_info')->where(array('uid'=>$uid,'trip_id'=>$trip_id))->find();
            $trip_info['go_city_array'] = json_decode($trip_info['go_city_array'],true);
            $trip_info['return_cityInfo'] = json_decode($trip_info['return_cityInfo'],true);
            
            $city_data['adult'] = $trip_info['adult'];
            $city_data['children'] = $trip_info['children'];
            $city_data['date'] = $trip_info['date'];
            $city_data['day_num'] = $trip_info['day_num'];
            $city_data['departure_city'] = $trip_info['departure_city'];
            $city_data['go_city_array'] = $trip_info['go_city_array'];
            $city_data['return_city'] = $trip_info['return_city'];
            $city_data['departure_latlng']['dep_lat'] = $trip_info['dep_lat'];
            $city_data['departure_latlng']['dep_lng'] = $trip_info['dep_lng'];
            $city_data['return_latlng']['ret_lat'] = $trip_info['ret_lat'];
            $city_data['return_latlng']['ret_lng'] = $trip_info['ret_lng'];
            $city_data['traffic_tools'] = $trip_info['traffic_tools'];
            $city_data['return_traffic'] = $trip_info['return_cityInfo'];

            $plan_info = Db::name('plan_info')->where(array('uid'=>$uid,'trip_id'=>$trip_id))->find();
            $scheduf = unserialize(base64_decode($plan_info['schedufing']));
            $plan_info['schedufing'] = json_decode(json_encode($scheduf),true);

            $num = count($trip_info['go_city_array']);
            for($i=1;$i<=$num;$i++)
            {
                $index[] = array();
            }
            foreach($index as $key=>$ii)
            {
                $index[$key] = strval($key); 
            }
           
            $city_line = Db::name('city_line')->where(array('uid'=>$uid,'trip_id'=>$trip_id))->find();
            $city_line['list'] = json_decode($city_line['list'],true);

            $traffic_money = Db::name('traffic_money')->where(array('uid'=>$uid,'trip_id'=>$trip_id))->find();
            $traffic_money['traffic_money'] = json_decode($traffic_money['traffic_money'],true);

            $hotel = Db::name('hotel')->where(array('uid'=>$uid,'trip_id'=>$trip_id))->find();
            if(isset($hotel['hotel_info']))
            {
                $hotel['hotel_info'] = json_decode($hotel['hotel_info'],true);
            }
            
            $eat_money = Db::name('eat_money')->where(array('uid'=>$uid,'trip_id'=>$trip_id))->find();
            if(isset($eat_money['eat_money']))
            {
                $eat_money['eat_money'] = json_decode($eat_money['eat_money'],true);
            }
            if(isset($eat_money['way_money']))
            {
                $eat_money['way_money'] = json_decode($eat_money['way_money'],true);
            }

            foreach($trip_info['go_city_array'] as $key=>$arr)
            {
                $city[$key] = $arr['city_name'];
            }

            $head['city'] = $city;
            $head['departure_city'] = $trip_info['departure_city'];
            $head['departure_date'] = $trip_info['date'];
            $head['return_city'] = $trip_info['return_city'];
            $head['return_date'] = $city_line['return_date'];

            $overview['head'] = $head;
            $overview['index'] = $index;
            $overview['list'] = $plan_info['schedufing'];

            $start['adult'] = $trip_info['adult'];
            $start['children'] = $trip_info['children'];
            $start['date'] = $trip_info['date'];
            $start['day_num'] = $trip_info['day_num'];
            $start['departure_city'] = $trip_info['departure_city'];
            $start['return_city'] = $trip_info['return_city'];
            $start['traffic_tools'] = $trip_info['traffic_tools'];

            $baseData = $city_data;
            $baseData['go_city_array'] =  $trip_info['go_city_array'];
            $lastInfo['baseData'] = $baseData;
            $lastInfo['head'] = $head;
            $lastInfo['index'] = $index;
            $lastInfo['formData'] = $start;
            $lastInfo['list'] = $plan_info['schedufing'];

            $_SESSION['DragDropcity'] = $city_data;
            $_SESSION['cityResult'] = $plan_info['schedufing'];
            $_SESSION['citysession'] = $city_data;
            $_SESSION['data']['city_data'] = $city_data;
            $_SESSION['hotelArray'] = $plan_info['schedufing'];
            $_SESSION['hotelResult'] = $plan_info['schedufing'];
            $_SESSION['index'] = $index;
            $_SESSION['lastInfo'] = $lastInfo;
            $_SESSION['list'] = $plan_info['schedufing'];
            $_SESSION['overview'] = $overview;
            $_SESSION['spotArray'] = $plan_info['schedufing'];
            // $_SESSION['result'] 当前城市数据
            $_SESSION['start'] = $start;
            $_SESSION['this_city_index'] = '0';
            $_SESSION['complete_order']['uid'] = $uid;
            $_SESSION['complete_order']['trip_id'] = $trip_id;
        }
    }


    //判断用户是否已经登录
    public function login_name()
    {
        if(!empty($_COOKIE['uid']))
        {
            echo json_encode($_COOKIE['user_name'],JSON_UNESCAPED_UNICODE);
        }
    }

}