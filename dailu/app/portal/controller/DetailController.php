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
use Qiniu\Auth;
use Qiniu\Storage\BucketManager;
use Qiniu\Storage\UploadManager;

class DetailController extends HomeBaseController
{
    //H5点击景点查看详情
    public function SpotDetail()
    {
        $post = input('post.');
        $city_name = $post['city_name'];
        $spot_name = $post['spot_name'];
        $this_floor_index = $post['this_floor_index'];
        $field = array('id','province_id','city_id','city_name','type','spot_name','play_time','longitude','latitude','suit_season'
        ,'phone','address','picture2','attractions_tickets','spot_Introduction','other_description','suit_time');
        if($this_floor_index == 0)
        {
            $singData = Db::name('Nature_absture')->field($field)->where(array('city_name'=>$city_name,'spot_name'=>$spot_name))->find();
        }
        if($this_floor_index == 1)
        {
            $singData = Db::name('Describe')->field($field)->where(array('city_name'=>$city_name,'spot_name'=>$spot_name))->find();
        }
        if($this_floor_index == 2)
        {
            $singData = Db::name('Night')->field($field)->where(array('city_name'=>$city_name,'spot_name'=>$spot_name))->find();
        }
        if($this_floor_index == 3)
        {
            $field2 = array('id','province_id','city_id','city_name','type','food_court_name','meal_time','longitude','latitude'
            ,'phone','address','picture2','court_Introduction','other_description','per_capita','business_hours');
            $singData = Db::name('Food_court')->field($field2)->where(array('city_name'=>$city_name,'food_court_name'=>$spot_name))->find();
            $singData['play_time'] = $singData['meal_time'];
            $singData['spot_Introduction'] = $singData['court_Introduction'];
            $singData['attractions_tickets'] = $singData['per_capita'];
            $singData['suit_time'] = $singData['business_hours'];
            unset($singData['meal_time'],$singData['court_Introduction'],$singData['per_capita'],$singData['business_hours']);
        }
        if($this_floor_index == 4)
        {
            $field3 = array('id','province_id','city_id','city_name','type','shopping_name','shopping_time','longitude','latitude'
            ,'phone','address','picture2','shopping_Introduction','other_description','business_hours');
            $singData = Db::name('shopping_streets')->field($field3)->where(array('city_name'=>$city_name,'shopping_name'=>$spot_name))->find();
            $singData['spot_name'] = $singData['shopping_name'];
            $singData['suit_time'] = $singData['business_hours'];
            $singData['play_time'] = $singData['shopping_time'];
            $singData['spot_Introduction'] = $singData['shopping_Introduction'];
            $singData['attractions_tickets'] = '';
            unset($singData['business_hours'],$singData['shopping_name'],$singData['shopping_time'],$singData['shopping_Introduction'],$singData['shopping_name']);
        }
        //7楼景点
        if($this_floor_index == 6){
            $singData = Db::name('New_spot')->field($field)->where(array('city_name'=>$city_name,'spot_name'=>$spot_name))->find();
            $singData['image_url'] = json_decode($singData['picture2'],true);
            $singData['type'] = '我的景点';
            unset($singData['picture2']);
        }
        //景点相册
        if(!empty($singData['picture2']))
        {
            $cover_pic = json_decode($singData['picture2'],true);
            foreach($cover_pic as $k => &$pic_value)
            {
                $singData['image_url'][$k]= cmf_get_image_preview_url($pic_value['url']); 
            }
            unset($singData['picture2']);
        }
        if(isset($singData['suit_season']))
        {
            if($singData['suit_season'] == '1,2,3,4,5,6,7,8,9,10,11,12')
            {
                $singData['suit_season'] = '1-12月';
            }else{
                if(strstr($singData['suit_season'], '月')){
                    if($singData['suit_season'] == '-月'){
                        $singData['suit_season'] =  '暂无';
                    }else{
                        $singData['suit_season'] =  $singData['suit_season'];
                    }
                }else{
                    $singData['suit_season'] = substr($singData['suit_season'],0,strpos($singData['suit_season'], ',')).'-'.trim(strrchr($singData['suit_season'], ','),',').'月';  
                }
            }
        }else{
            $singData['suit_season'] = '暂无';
        }
        
        if($singData)
        {
            $return = array('status'=>true,'msg'=>'请求成功','data'=>$singData);
        }else{
            $return = array('status'=>false,'msg'=>'请求失败','data'=>[]);
        }
        echo json_encode($return,JSON_UNESCAPED_UNICODE);
    }

    //若h5修改过景点详情，详情数据返回
    public function IsEditdetail()
    {
        $post = input('post.');
        $trip_id = $post['trip_id'];
        $this_city_index = $post['this_city_index']; //城市索引
        $d_index = $post['day_arry_index']; //城市下的天数索引
        $spot_index = $post['spot_index'];  //景点索引
        //景点原数据的相册
        $city_name = $post['city_name'];  //城市名称
        $spot_name = $post['spot_name'];  //景点名称
        $field = array('picture2');
        $singData1 = Db::name('Nature_absture')->field($field)->where(array('city_name'=>$city_name,'spot_name'=>$spot_name))->find();
        $singData2 = Db::name('Describe')->field($field)->where(array('city_name'=>$city_name,'spot_name'=>$spot_name))->find();
        $singData3 = Db::name('Night')->field($field)->where(array('city_name'=>$city_name,'spot_name'=>$spot_name))->find();
        $singData4 = Db::name('Food_court')->field($field)->where(array('city_name'=>$city_name,'food_court_name'=>$spot_name))->find();
        $singData5 = Db::name('shopping_streets')->field($field)->where(array('city_name'=>$city_name,'shopping_name'=>$spot_name))->find();
        if(isset($singData1)){
            $singResult = $singData1;
        }
        if(isset($singData2)){
            $singResult = $singData2;
        }
        if(isset($singData3)){
            $singResult = $singData3;
        }
        if(isset($singData4)){
            $singResult = $singData4;
        }
        if(isset($singData5)){
            $singResult = $singData5;
        }
        //景点相册
        if(!empty($singResult['picture2']))
        {
            $cover_pic = json_decode($singResult['picture2'],true);
            foreach($cover_pic as $k => &$pic_value)
            {
                $singResult['image_url'][$k]= cmf_get_image_preview_url($pic_value['url']); 
            }
            unset($singResult['picture2']);
        }

        $data = Db::name('Plan_info')->where(array('trip_id'=>$trip_id))->find();
        $schedufing = unserialize(base64_decode($data['schedufing']));
        $info= json_decode(json_encode($schedufing),true);
        foreach($info as $key=>&$value)
        {
            if($key == $this_city_index){ //城市
                $city_name = $value['this_city'];
                foreach($value['day_arry'] as $key2=>&$v)
                {
                    if($key2 == $d_index){ //天数
                        foreach($v['day'] as $key3=>&$vv)
                        {
                            if($key3 == $spot_index)
                            {
                                //修改了景点相册以后，重新输出
                                if(isset($vv['image_url'])){
                                    if(strstr($vv['image_url'], ';')){
                                        $vv['image_url'] = explode(';',$vv['image_url']);
                                        if(!empty($singResult)){  //合并修改的相冊和值之前的相冊
                                            $vv['image_url'] = array_merge($vv['image_url'],$singResult['image_url']);
                                        }
                                    }else{
                                        $vv['image_url'] = array($vv['image_url']);
                                        if(!empty($singResult)){  //合并修改的相冊和值之前的相冊
                                            $vv['image_url'] = array_merge($vv['image_url'],$singResult['image_url']);
                                        }
                                    }
                                }else{
                                    $vv['image_url'] ='';
                                    if(!empty($singResult)){ 
                                        $vv['image_url'] = $singResult['image_url'];
                                    }
                                }
                               $vv['info']['image_url'] = $vv['image_url'];

                               $result = $vv['info'];
                               $result['city_name'] = $city_name;
                               
                                if($vv['info']['type'] == 'add_newSpot'){
                                    $result['type'] = '我的景点';
                                }
                                if(isset($vv['info']['suit_season']) && !empty($vv['info']['suit_season']))
                                {
                                    if($vv['info']['suit_season'] == '1,2,3,4,5,6,7,8,9,10,11,12')
                                    {
                                        $result['suit_season'] = '1-12月';
                                    }else{
                                        if(strstr($vv['info']['suit_season'], '月')){
                                            if($vv['info']['suit_season'] == '-月'){
                                                $result['suit_season'] = '暂无';
                                            }else{
                                                $result['suit_season'] = $vv['info']['suit_season'];
                                            }
                                        }
                                        else{
                                            $result['suit_season'] = substr($vv['info']['suit_season'],0,strpos($vv['info']['suit_season'], ',')).'-'.trim(strrchr($vv['info']['suit_season'], ','),',').'月';  
                                        }
                                    }
                                }else{
                                    $result['suit_season'] = '暂无';
                                }
                            }
                        }
                    }
                }
            }
        }

        if($result)
        {
            $return = array('status'=>true,'msg'=>'请求成功','data'=>$result);
        }else{
            $return = array('status'=>false,'msg'=>'请求失败','data'=>[]);
        }
        echo json_encode($return,JSON_UNESCAPED_UNICODE);
    }

    //删除用户自己上传的景点相册中的指定的图片
    public function Deletepicture()
    {
        $post = input('post.');
        $trip_id = $post['trip_id'];
        $this_city_index = $post['this_city_index']; //城市索引
        $d_index = $post['day_arry_index']; //城市下的天数索引
        $spot_index = $post['spot_index'];  //景点索引
        $image_index = $post['image_index'];  //图片索引
        $data = Db::name('Plan_info')->where(array('trip_id'=>$trip_id))->find();
        $schedufing = unserialize(base64_decode($data['schedufing']));
        $info= json_decode(json_encode($schedufing),true);
        foreach($info as $key=>&$value)
        {
            if($key == $this_city_index){ //城市
                foreach($value['day_arry'] as $key2=>&$v)
                {
                    if($key2 == $d_index){ //天数
                        foreach($v['day'] as $key3=>&$vv)
                        {
                            if($key3 == $spot_index) //景点
                            {
                                // print_r($vv['image_url']);
                                // exit;
                                if(strstr($vv['image_url'], ';')){
                                    $vv['image_url'] = explode(';',$vv['image_url']);
                                    unset($vv['image_url'][$image_index]);
                                    //删除以后，再转成字符串存到数据库
                                    $vv['image_url'] = array_merge($vv['image_url']);
                                    $vv['image_url'] = implode(';', $vv['image_url']);
                                }else{
                                    $vv['image_url'] = array($vv['image_url']);
                                    unset($vv['image_url']);
                                }
                            }
                        }
                    }
                }
            }
        }
        $dataresult['schedufing'] = base64_encode(serialize($info));
        $resultInfo = Db::name('Plan_info')->where(array('trip_id'=>$trip_id))->update($dataresult);
        if(false !== $resultInfo)
        {
            $return = array('status'=>true,'msg'=>'删除成功','data'=>[]);
        }else{
            $return = array('status'=>false,'msg'=>'删除失败','data'=>[]);
        }
        echo json_encode($return,JSON_UNESCAPED_UNICODE);
    }
    //若h5修改过酒店详情，详情数据返回
    public function hEdited()
    {
        $post = input('post.');
        $trip_id = $post['trip_id'];
        $this_city_index = $post['this_city_index']; //城市索引
        $d_index = $post['day_arry_index']; //城市下的天数索引

        $data = Db::name('Plan_info')->where(array('trip_id'=>$trip_id))->find();
        $schedufing = unserialize(base64_decode($data['schedufing']));
        $info= json_decode(json_encode($schedufing),true);
        foreach($info as $key=>&$value)
        {
            if($key == $this_city_index){ //城市
                foreach($value['day_arry'] as $key2=>&$v)
                {
                    if($key2 == $d_index){ //天数
                        //修改了酒店相册以后，重新输出
                        if(isset($v['hotel']['highImage'])){
                            if(is_string($v['hotel']['highImage'])){
                                if(strstr($v['hotel']['highImage'], ';')){
                                    $v['hotel']['highImage'] = explode(';',$v['hotel']['highImage']);
                                }else{
                                    $v['hotel']['highImage'] = array($v['hotel']['highImage']);
                                }
                            }
                        }else{
                            $v['hotel']['highImage'] = array();
                        }
                        $result = $v['hotel'];
                    }
                }
            }
        }

        if($result)
        {
            $return = array('status'=>true,'msg'=>'请求成功','data'=>$result);
        }else{
            $return = array('status'=>false,'msg'=>'请求失败','data'=>[]);
        }
        echo json_encode($return,JSON_UNESCAPED_UNICODE);
    }

    //H5景点评论（图片上传到七牛云,路径存到数据库）
    public function CommentOn()
    {
        vendor('qiniu.php-sdk.sendAPI');//引入加载文件 
        // require_once __DIR__ . '/php-sdk/autoload.php'; //引入加载文件 
        $accessKey = 'vbYc94XHTg28x9Xd_xY9uCk1TztEGJpWyzRTqKAZ';
        $secretKey = 'YKZkI5t_yExwLgRP1aVr5VnFuzk9hJyImhbVk7sg';
        $auth = new Auth($accessKey, $secretKey);  //实例化
        $bucket='discuss';//存储空间
        $token = $auth->uploadToken($bucket);
        $uploadMgr = new UploadManager();
        if(isset($_FILES['file']))
        {
            $filePath = $_FILES['file']['tmp_name'];//'./php-logo.png';  //接收图片信息
            $fileType = $_FILES['file']['type'];
            $typecount = count($fileType);
            $picUrl = '';
            if(isset($fileType)){
                for($i=0;$i<$typecount;$i++)
                {
                    
                    // $pattern = '1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLOMNOPQRSTUVWXYZ';    //字符池
                    $name = time().rand(1000000, 9999999);

                    if($fileType[$i] == 'video/mp4'){
                        $key = 'video'.$name.'.mp4';  
                    }elseif($fileType[$i] == 'audio/mp3'){
                        $key = 'audio'.$name.'.mp3';  
                    }else{
                        $key = 'png'.$name.'.png';  
                    }
                    list($ret, $err) = $uploadMgr->putFile($token, $key, $filePath[$i]);
                    if ($err !== null) {  
                        echo '上传失败';
                    } else{
                        //上传成功以后，外链存到数据库中
                        $picUrl = 'http://discuss.5199yl.com/'.$ret['key'].';'.$picUrl; //多张图片
                        // echo $picUrl;
                        if(isset($picUrl))
                        {
                            $data['pic'] = substr($picUrl, 0, -1);  //剔除最后的分号;
                        }
                    }
                }
            }
           
        }
        $post = input('post.');
        $data['uid'] = $post['uid']; //评论人的uid
        $userData = Db::name('Customer')->field('user_name,head_port')->where(array('uid'=>$post['uid']))->find();
        $data['user_name'] = $userData['user_name'];
        $data['head_port'] = $userData['head_port'];
        $data['content'] = $post['comment_text'];
        $data['city_name'] = $post['city_name'];
        $data['spot_name'] = $post['spot_name'];
        $data['create_time'] = time();
        
        $result = Db::name('Spot_discuss')->insert($data);
        if($result)
        {
            $result = array('status'=>true,'msg'=>'评论成功');
        }else{
            $result = array('status'=>false,'msg'=>'评论失败');
        }
        echo json_encode($result,JSON_UNESCAPED_UNICODE);
    }

    //查询景点评论
    public function CommentData()
    {
        vendor('Page.system_page'); //分页
        $post = input('post.');
        $p = isset($post['page'])?$post['page']:1;
        $city_name = $post['city_name'];
        $spot_name = $post['spot_name'];
        // $city_name = '青岛';
        // $spot_name = '栈桥';
        // $p = 1;

        $commentInfo = Db::name('Spot_discuss')->page($p.',5')->order('create_time desc')->where(array('city_name'=>$city_name,'spot_name'=>$spot_name))->select()->toArray();
        $totalcount = Db::name('Spot_discuss')->where(array('city_name'=>$city_name,'spot_name'=>$spot_name))->count();
        foreach($commentInfo as $key=>&$value)
        {
            if(!empty($value['pic'])){
                if(strstr($value['pic'], ';')){
                    $value['image_url'] = explode(';',$value['pic']);
                }else{
                    $value['image_url'][] = $value['pic'];
                } 
            }else{
                $value['image_url'] = '';
            }
            $value['createTime'] =  date("Y-m-d H:i",$value['create_time']);
            unset($value['pic'],$value['create_time']);
        }
        // print_r($commentInfo);
        if($commentInfo)
        {
            $result = array('status'=>true,'msg'=>'查询成功','data'=>$commentInfo,'totalcount'=>$totalcount);
        }else{
            $result = array('status'=>false,'msg'=>'查询失败','data'=>[],'totalcount'=>0);
        }
        echo json_encode($result,JSON_UNESCAPED_UNICODE);
    }

   
    //电脑版h5行程单数据 (处理了酒店附近的美食，每个景点附近的美食)
    public function FormData()
    {
        session_start();
        $uid = $_POST['uid'];    //制作行程单人的id
        $collect_uid = $_POST['collect_uid'];  //登录人的uid
        $trip_id = $_POST['trip_id'];

        $_SESSION['trip_id'] = $trip_id;   //防止本行程单返回链接
        $user= Db::name('customer')->where(array('uid'=>$uid))->field('uid,user_name,head_port,insiders')->find();

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
	        $lastResult['gailan']['insiders']  = $user['insiders'];
	        $lastResult['gailan']['children']  = $trip_info['children'];
	        $lastResult['gailan']['date']  = $trip_info['date'];
	        $lastResult['gailan']['day_num']  = $trip_info['day_num'];
	        $lastResult['gailan']['departure_city']  = $trip_info['departure_city'];
	        $lastResult['gailan']['return_city']  = $trip_info['return_city']; 
	        $lastResult['gailan']['return_cityInfo'] = json_decode($trip_info['return_cityInfo'],true); 
	        // print_r($lastResult['gailan']['return_cityInfo']);
	        // exit;
	        $lastResult['gailan']['hotelSum']  = $trip_info['hotelSum'];
	        $lastResult['gailan']['dep_lng']  = $trip_info['dep_lng'];
	        $lastResult['gailan']['dep_lat']  = $trip_info['dep_lat'];
	        $lastResult['gailan']['creat_time']  = date("Y-m-d",$trip_info['creat_time']); 
	        $lastResult['gailan']['creat_untime']  = $trip_info['creat_time']; 
	        if(!empty($trip_info['cover']))
	        {
	            if(strstr($trip_info['cover'], 'http')){
	                $lastResult['gailan']['image_cover'] = $trip_info['cover'];
	            }else{
	                $ab ='http://';
	                $lastResult['gailan']['image_cover'] = $ab.$_SERVER['HTTP_HOST'].$trip_info['cover'];
	            }  
	        }else{
	            $lastResult['gailan']['image_cover'] = '';   
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
	        $field = array('id','city_id','store_name','longitude','latitude','pic');
	        if(isset($scheduf))
	        {
	            foreach($scheduf  as &$ss)
	            {
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
	                if(isset($ss['city_id']))
	                {
	                    $stoteData = Db::name('Store_info')->field($field)->where('city_id',$ss['city_id'])->select()->toarray();
	                }
	                if(isset($ss['this_city']) && !isset($ss['city_id']))
	                {
	                    $stoteData = Db::name('Store_info')->field($field)->where('city_name',$ss['this_city'])->select()->toarray();
	                }

	                foreach($ss['day_arry'] as $key2=>&$v)
	                {
	                	$distance = '';
	                    //酒店附近的3个美食
	                    if(!empty($v['hotel']['lng']) && !empty( $v['hotel']['lat'])){
	                        $hotel_lng = $v['hotel']['lng'];
	                        $hotel_lat = $v['hotel']['lat'];
	                        foreach($stoteData as $ke3=>&$vvv)
	                        {
	                            $vvv['to_dis']= getDistance($hotel_lng, $hotel_lat, $vvv['longitude'], $vvv['latitude'], 2);
	                            if(!empty($vvv['pic']))
	                            {
	                                $cover_pic =json_decode($vvv['pic'],true);
	                                foreach($cover_pic as $k => &$pic_value)
	                                {
	                                    $vvv['dianpu_image'] = cmf_get_image_preview_url($pic_value['url']); 
	                                }
	                                unset($vvv['pic']);
	                            }
	                            if(isset($vvv['store_name'])){$vvv['name'] = $vvv['store_name'];}
	                            
	                            $distance[] = $vvv;
	                           
	                        }  
	                     	if(!empty($distance)){
	                            $sort = array_column($distance, 'to_dis');
	                          
	                            array_multisort($sort, SORT_ASC, $distance);
	                            $hotelNearby = array_slice($distance,0,3); 
	                            $v['hotelNearby'] = $hotelNearby;
	                        }else{
	                            $v['hotelNearby'] = array();
	                        }
	                    }else{
	                        $v['hotelNearby'] = array();
	                    }
	                    //修改了酒店相册以后，重新输出封面
	                    if(isset($v['hotel']['ThumbNailUrl'])){
	                        if(is_array($v['hotel']['ThumbNailUrl'])){
	                            $v['hotel']['ThumbNailUrl'] = implode($v['hotel']['ThumbNailUrl']);
	                        }
	                    }
	                    //修改了酒店相册以后，重新输出相册
	                    if(isset($v['hotel']['highImage'])){
	                        if(is_string($v['hotel']['highImage'])){
	                            if(strpos($v['hotel']['highImage'], ';') !== false){
	                                $v['hotel']['highImage'] = explode(';',$v['hotel']['highImage']);
	                            }else{
	                                $v['hotel']['highImage'] = array($v['hotel']['highImage']);
	                            }
	                        }
	                    }else{
	                        $v['hotel']['highImage'] = array();
	                    }
	                    //景点附近的3个美食
	                    if(!empty($v['day']))
	                    {
	                        foreach($v['day'] as &$jingdian)
	                        {
	                            $dis = '';
	                            $this_lng = $jingdian['this_lng'];
	                            $this_lat = $jingdian['this_lat'];
	                            foreach($stoteData as $ke4=>&$vs)
	                            {
	                                $vs['to_dis']= getDistance($this_lng, $this_lat, $vs['longitude'], $vs['latitude'], 2);
	                                $vs['near'] = '附近美食';
	                                if(!empty($vs['pic']))
	                                {
	                                    $cover_pic =json_decode($vs['pic'],true);
	                                    foreach($cover_pic as $k => &$pic_value)
	                                    {
	                                        $vs['dianpu_image'] =cmf_get_image_preview_url($pic_value['url']); 
	                                    }
	                                    unset($vs['pic']);
	                                }
	                                if(isset($vs['store_name'])){$vs['name'] = $vs['store_name'];}
	                                $dis[] = $vs;
	                            }
	                            if(!empty($dis)){
	                                $sort = array_column($dis, 'to_dis');
	                                array_multisort($sort, SORT_ASC, $dis);
	                                $Nearby = array_slice($dis,0,3); 
	                                if(empty($jingdian['eat_info'])){
	                                    $jingdian['eat_info'] = $Nearby;
	                                }
	                            }
	                            //已经选择的美食
	                            if(!empty($jingdian['eat_info'])){
	                                //手机端制作的行程的字段替换输出
	                                foreach($jingdian['eat_info'] as &$vva){
	                                    if(isset($vva['this_name'])){
	                                        $vva['name'] = $vva['this_name'];
	                                        $vva['dianpu_image'] = $vva['this_img_src'];
	                                    }
	                                }
	                            }

	                            //适玩季节
	                            if(isset($jingdian['info']['suit_season']) && !empty($jingdian['info']['suit_season']))
	                            {
	                                if($jingdian['info']['suit_season'] == '1,2,3,4,5,6,7,8,9,10,11,12')
	                                {
	                                    $jingdian['info']['suit_season'] = '1-12月';
	                                }else{
	                                    if(strstr($jingdian['info']['suit_season'], '月')){
	                                        if($jingdian['info']['suit_season'] == '-月'){
	                                            $jingdian['info']['suit_season'] = '暂无';
	                                        }else{
	                                            $jingdian['info']['suit_season'] = $jingdian['info']['suit_season'];
	                                        }
	                                    }else{
	                                        $jingdian['info']['suit_season'] = substr($jingdian['info']['suit_season'],0,strpos($jingdian['info']['suit_season'], ',')).'-'.trim(strrchr($jingdian['info']['suit_season'], ','),',').'月';  
	                                    }
	                                }
	                            }else{
	                                $jingdian['info']['suit_season'] = '暂无';
	                            }
	                            //修改了景点相册以后，重新输出
	                            if(isset($jingdian['image_url'])){
	                                if(is_string($jingdian['image_url'])){
	                                    if(strstr($jingdian['image_url'], ';')){
	                                        $jingdian['image_url'] = explode(';',$jingdian['image_url']);
	                                    }else{
	                                        $jingdian['image_url'] = array($jingdian['image_url']);
	                                    }
	                                }
	                            }else{
	                                $jingdian['image_url'] = array();
	                                // if(isset($jingdian['info']['picture2']))
	                                // {
	                                //     if(!empty($jingdian['info']['picture2']))
	                                //     {
	                                //         $spot_cover = json_decode($jingdian['info']['picture2'],true);
	                                //         foreach($spot_cover as $k2 => &$spot_value)
	                                //         {
	                                //             $jingdian['image_url'][$k2] = cmf_get_image_preview_url($spot_value['url']); 
	                                //         }
	                                //     }else{
	                                //         $jingdian['image_url'] = '';
	                                //     }
	                                // }
	                                // if(!isset($jingdian['info']['picture2']))
	                                // {
	                                //     $spot_name = $jingdian['this_name'];
	                                //     $fieldstring = array('picture2');
	                                //     if(isset($jingdian['city_id']))
	                                //     {
	                                //     	$city_id = $jingdian['city_id'];
		                            //         $shopList1 = Db::name('Nature_absture')->field($fieldstring)->where(array('city_id'=> $city_id,'spot_name'=>$spot_name))->find();
		                            //         if(isset($shopList1))
		                            //         {
		                            //             if(!empty($shopList1['picture2']))
		                            //             {
		                            //                 $spot_cover = json_decode($shopList1['picture2'],true);
		                            //                 foreach($spot_cover as $k2 => &$spot_value)
		                            //                 {
		                            //                     $jingdian['image_url'][$k2] = cmf_get_image_preview_url($spot_value['url']); 
		                            //                 }
		                            //             }
		                            //         }
		    
		                            //         $shopList2 = Db::name('Describe')->field($fieldstring)->where(array('city_id'=> $city_id,'spot_name'=>$spot_name))->find();
		                            //         if(isset($shopList2))
		                            //         {
		                            //             if(!empty($shopList2['picture2']))
		                            //             {
		                            //                 $spot_cover = json_decode($shopList2['picture2'],true);
		                            //                 foreach($spot_cover as $k2 => &$spot_value)
		                            //                 {
		                            //                     $jingdian['image_url'][$k2] = cmf_get_image_preview_url($spot_value['url']); 
		                            //                 }
		                            //             }
		                            //         }
		    
		                            //         $shopList3 = Db::name('Night')->field($fieldstring)->where(array('city_id'=> $city_id,'spot_name'=>$spot_name))->find();
		                            //         if(isset($shopList3))
		                            //         {
		                            //             if(!empty($shopList3['picture2']))
		                            //             {
		                            //                 $spot_cover = json_decode($shopList3['picture2'],true);
		                            //                 foreach($spot_cover as $k2 => &$spot_value)
		                            //                 {
		                            //                     $jingdian['image_url'][$k2] = cmf_get_image_preview_url($spot_value['url']); 
		                            //                 }
		                            //             }
		                            //         }
		    
		                            //         $shopList4 = Db::name('Food_court')->field($fieldstring)->where(array('city_id'=> $city_id,'food_court_name'=>$spot_name))->find();
		                            //         if(isset($shopList4))
		                            //         {
		                            //             if(!empty($shopList4['picture2']))
		                            //             {
		                            //                 $spot_cover = json_decode($shopList4['picture2'],true);
		                            //                 foreach($spot_cover as $k2 => &$spot_value)
		                            //                 {
		                            //                     $jingdian['image_url'][$k2]= cmf_get_image_preview_url($spot_value['url']); 
		                            //                 }
		                            //             }
		                            //         }
		    
		                            //         $shopList5 = Db::name('shopping_streets')->field($fieldstring)->where(array('city_id'=> $city_id,'shopping_name'=>$spot_name))->find();
		                            //         if(isset($shopList5))
		                            //         {
		                            //             if(!empty($shopList5['picture2']))
		                            //             {
		                            //                 $spot_cover = json_decode($shopList5['picture2'],true);
		                            //                 foreach($spot_cover as $k2 => &$spot_value)
		                            //                 {
		                            //                     $jingdian['image_url'][$k2]= cmf_get_image_preview_url($spot_value['url']); 
		                            //                 }
		                            //             }
		                            //         }
	                                //     }else{
	                                    	
	                                //     	//没有city_id的数据
		                            //         $shopList1 = Db::name('Nature_absture')->field($fieldstring)->where(array('spot_name'=>$spot_name))->find();
		                            //         if(isset($shopList1))
		                            //         {
		                            //             if(!empty($shopList1['picture2']))
		                            //             {
		                            //                 $spot_cover = json_decode($shopList1['picture2'],true);
		                            //                 foreach($spot_cover as $k2 => &$spot_value)
		                            //                 {
		                            //                     $jingdian['image_url'][$k2] = cmf_get_image_preview_url($spot_value['url']); 
		                            //                 }
		                            //             }
		                            //         }
		    
		                            //         $shopList2 = Db::name('Describe')->field($fieldstring)->where(array('spot_name'=>$spot_name))->find();
		                            //         if(isset($shopList2))
		                            //         {
		                            //             if(!empty($shopList2['picture2']))
		                            //             {
		                            //                 $spot_cover = json_decode($shopList2['picture2'],true);
		                            //                 foreach($spot_cover as $k2 => &$spot_value)
		                            //                 {
		                            //                     $jingdian['image_url'][$k2] = cmf_get_image_preview_url($spot_value['url']); 
		                            //                 }
		                            //             }
		                            //         }
		    
		                            //         $shopList3 = Db::name('Night')->field($fieldstring)->where(array('spot_name'=>$spot_name))->find();
		                            //         if(isset($shopList3))
		                            //         {
		                            //             if(!empty($shopList3['picture2']))
		                            //             {
		                            //                 $spot_cover = json_decode($shopList3['picture2'],true);
		                            //                 foreach($spot_cover as $k2 => &$spot_value)
		                            //                 {
		                            //                     $jingdian['image_url'][$k2] = cmf_get_image_preview_url($spot_value['url']); 
		                            //                 }
		                            //             }
		                            //         }
		    
		                            //         $shopList4 = Db::name('Food_court')->field($fieldstring)->where(array('food_court_name'=>$spot_name))->find();
		                            //         if(isset($shopList4))
		                            //         {
		                            //             if(!empty($shopList4['picture2']))
		                            //             {
		                            //                 $spot_cover = json_decode($shopList4['picture2'],true);
		                            //                 foreach($spot_cover as $k2 => &$spot_value)
		                            //                 {
		                            //                     $jingdian['image_url'][$k2]= cmf_get_image_preview_url($spot_value['url']); 
		                            //                 }
		                            //             }
		                            //         }
		    
		                            //         $shopList5 = Db::name('shopping_streets')->field($fieldstring)->where(array('shopping_name'=>$spot_name))->find();
		                            //         if(isset($shopList5))
		                            //         {
		                            //             if(!empty($shopList5['picture2']))
		                            //             {
		                            //                 $spot_cover = json_decode($shopList5['picture2'],true);
		                            //                 foreach($spot_cover as $k2 => &$spot_value)
		                            //                 {
		                            //                     $jingdian['image_url'][$k2]= cmf_get_image_preview_url($spot_value['url']); 
		                            //                 }
		                            //             }
		                            //         }
	                                //     }
	                                // }
	                            }
	                        }
	                    }
	                }
	                // 上一个城市的最后一天的酒店附近美食，特殊处理
	                if(isset($ss['prevHotel']))
	                {
	                    $prehotel_lng = $ss['prevHotel']['hotel']['lng'];
	                    $prehotel_lat = $ss['prevHotel']['hotel']['lat'];
	                    foreach($stoteData as $ke5=>&$vv2)
	                    {
	                        $vv2['to_dis']= getDistance($prehotel_lng, $prehotel_lat, $vv2['longitude'], $vv2['latitude'], 2);
	                        $distance2[] = $vv2;
	                    }
	                    if(!empty($distance2)){
	                        $sort = array_column($distance2, 'to_dis');
	                        array_multisort($sort, SORT_ASC, $distance2);
	                        $ss['prevHotel']['hotelNearby'] = array_slice($distance2,0,3); 
	                    }else{
	                        $ss['prevHotel']['hotelNearby']= array();
	                    }
	                   
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
	        $field = array('id','trip_id','poster_name','team_number','team_price','departure_date','logo','agency','remarks','inscribe','allchara','team_title','price_title','date_title','phone','travel_price');
	        $poster = Db::name('Poster')->field($field)->where(array('trip_id'=>$trip_id))->find();
	        if($poster)
	        {
	            $poster['departure_date'] = $poster['departure_date'];
	            $lastResult['posterData'] = $poster;
	        }else{
	            $lastResult['posterData'] = '';
	        }

	        //用戶自己修改了行程單的头部列表
	        $Baselist = Db::name('Base_list')->field(array('line','daynumber','day_line','datestring','trafficstring','same_day_spot'))->where(array('trip_id'=>$trip_id))->find();
	        if($Baselist)
	        {
	            $Baselist['daynumber'] = json_decode($Baselist['daynumber'],true);
	            $Baselist['day_line'] = json_decode($Baselist['day_line'],true);
	            $Baselist['datestring'] = json_decode($Baselist['datestring'],true);
	            $Baselist['trafficstring'] = json_decode($Baselist['trafficstring'],true);
	            $Baselist['same_day_spot'] = json_decode($Baselist['same_day_spot'],true);
	            $lastResult['toplist'] = $Baselist;
	        }else{
	            $lastResult['toplist'] = '';
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

    //编辑酒店信息
    public function HotelEdit()
    {
        vendor('qiniu.php-sdk.sendAPI');//引入加载文件 
        // require_once __DIR__ . '/php-sdk/autoload.php'; //引入加载文件 
        $accessKey = 'vbYc94XHTg28x9Xd_xY9uCk1TztEGJpWyzRTqKAZ';
        $secretKey = 'YKZkI5t_yExwLgRP1aVr5VnFuzk9hJyImhbVk7sg';
        $auth = new Auth($accessKey, $secretKey);  //实例化
        $bucket='discuss';//存储空间
        $token = $auth->uploadToken($bucket);
        $uploadMgr = new UploadManager();
        if(isset($_FILES['file']))
        {
            $filePath = $_FILES['file']['tmp_name'];//'./php-logo.png';  //接收图片信息
            $fileType = $_FILES['file']['type'];
            $typecount = count($fileType);
            $picUrl = '';
            if(isset($fileType)){
                for($i=0;$i<$typecount;$i++)
                {
                    // $pattern = '1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLOMNOPQRSTUVWXYZ';    //字符池
                    $name = time().rand(1000000, 9999999);

                    if($fileType[$i] == 'video/mp4'){
                        $key = 'video'.$name.'.mp4';  
                    }elseif($fileType[$i] == 'audio/mp3'){
                        $key = 'audio'.$name.'.mp3';  
                    }else{
                        $key = 'png'.$name.'.png';  
                    }
                    list($ret, $err) = $uploadMgr->putFile($token, $key, $filePath[$i]);
                    if ($err !== null) {  
                        echo '上传失败';
                    } else{
                        //上传成功以后，外链存到数据库中
                        $picUrl = 'http://discuss.5199yl.com/'.$ret['key'].';'.$picUrl; //多张图片
                        // echo $picUrl;
                        if(isset($picUrl))
                        {
                            $highImage= substr($picUrl, 0, -1);  //剔除最后的分号;      //酒店相册
                        }
                    }
                }
            }
        }
        //取第一张当做酒店封面图
        if(isset($highImage)){
            if(is_string($highImage)){
                if(strstr($highImage, ';')){
                    $image_url = explode(';',$highImage);
                    $ThumbNailUrl = $image_url[0];
                }else{
                    $highImage = array($highImage);
                    $ThumbNailUrl = $highImage;
                }
            }
        }else{
            $highImage = array();
        }
        $post = $_POST;
        $trip_id = $post['trip_id'];
        $this_city_index = $post['this_city_index']; //城市索引
        $d_index = $post['day_arry_index']; //城市下的天数索引 

        //所选择的酒店所在目标位置
        if(isset($post['that_city_index'])){
            $that_city_index = $post['that_city_index']; //城市索引
        }
        if(isset($post['that_day_index'])){
            $that_day_index = $post['that_day_index']; //天数索引
        }

        $hotel_name = $post['hotel_name'];  //酒店名称
        $hotel_id = $post['hotel_id'];  //酒店id
        $address = $post['address'];      //酒店地址
        $Category = $post['Category'];    //酒店类型 
        $GeneralAmenities = $post['GeneralAmenities'];   //酒店设施
        $Features = $post['Features'];    //酒店描述 

        $data = Db::name('Plan_info')->where(array('trip_id'=>$trip_id))->find();
        $schedufing = unserialize(base64_decode($data['schedufing']));
        $info= json_decode(json_encode($schedufing),true);
        // print_r($info);
        // exit;
        //修改时使用了艺龙的酒店
        if(!empty($hotel_id)){
            if(isset($that_city_index)){
                $hotelData = $info[$that_city_index]['day_arry'][$that_day_index]['hotel'];
                $info[$this_city_index]['day_arry'][$d_index]['hotel'] = $hotelData;
            }
        }else{
            foreach($info as $key=>&$value)
            {
                if($key == $this_city_index){ //城市
                    foreach($value['day_arry'] as $key2=>&$v)
                    {
                        if($key2 == $d_index){ //天数
                            
                            $v['hotel']['hotel_name'] = $hotel_name;
                            $v['hotel']['address'] = $address;
                            $v['hotel']['Category'] = $Category;
                            $v['hotel']['GeneralAmenities'] = $GeneralAmenities;
                            $v['hotel']['Features'] = $Features;
                            $v['hotel']['highImage'] = $highImage;
                            $v['hotel']['ThumbNailUrl'] = $ThumbNailUrl;
        
                            $v['hotel']['BusinessZoneName'] = '';
                            $v['hotel']['LowRate'] = '';
                            $v['hotel']['lat'] = '';
                            $v['hotel']['lng'] = '';
                            $v['hotel']['tel'] = '';
                            $v['hotel']['hotel_id'] = $hotel_id;
                            $v['hotel']['city'] = '';
                            $v['hotel']['StarRate'] = '';
                        }
                    }
                }
            }
        }
       
        $dataresult['schedufing'] = base64_encode(serialize($info));
        $dataresult['isoredit'] = 1;   //是否在h5中进行了编辑（0-没有，默认），（1-有修改)
        $resultInfo = Db::name('Plan_info')->where(array('trip_id'=>$trip_id))->update($dataresult);
        if(false !== $resultInfo)
        {
            $result = array('status'=>true,'msg'=>'请求成功');
        }else{
            $result = array('status'=>false,'msg'=>'请求失败');
        }
        echo json_encode($result,JSON_UNESCAPED_UNICODE);
    }

    //编辑时,上传景点相册
    public function PhotoAlbum()
    {
        vendor('qiniu.php-sdk.sendAPI');//引入加载文件 
        // require_once __DIR__ . '/php-sdk/autoload.php'; //引入加载文件 
        $accessKey = 'vbYc94XHTg28x9Xd_xY9uCk1TztEGJpWyzRTqKAZ';
        $secretKey = 'YKZkI5t_yExwLgRP1aVr5VnFuzk9hJyImhbVk7sg';
        $auth = new Auth($accessKey, $secretKey);  //实例化
        $bucket='discuss';//存储空间
        $token = $auth->uploadToken($bucket);
        $uploadMgr = new UploadManager();
        if(isset($_FILES['file']))
        {
            $filePath = $_FILES['file']['tmp_name'];//'./php-logo.png';  //接收图片信息
            $fileType = $_FILES['file']['type'];
            $typecount = count($fileType);
            $picUrl = '';
            if(isset($fileType)){
                for($i=0;$i<$typecount;$i++)
                {
                    // $pattern = '1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLOMNOPQRSTUVWXYZ';    //字符池
                    $name = time().rand(1000000, 9999999);

                    if($fileType[$i] == 'video/mp4'){
                        $key = 'video'.$name.'.mp4';  
                    }elseif($fileType[$i] == 'audio/mp3'){
                        $key = 'audio'.$name.'.mp3';  
                    }else{
                        $key = 'png'.$name.'.png';  
                    }
                    list($ret, $err) = $uploadMgr->putFile($token, $key, $filePath[$i]);
                    if ($err !== null) {  
                        echo '上传失败';
                    } else{
                        //上传成功以后，外链存到数据库中
                        $picUrl = 'http://discuss.5199yl.com/'.$ret['key'].';'.$picUrl; //多张图片
                        // echo $picUrl;
                        if(isset($picUrl))
                        {
                            $image_url= substr($picUrl, 0, -1);  //剔除最后的分号;
                        }
                    }
                }
            }
        }
        $post = input('post.');
        $trip_id = $post['trip_id'];
        $this_city_index = $post['this_city_index']; //城市索引
        $d_index = $post['day_arry_index']; //城市下的天数索引 
        if(isset($post['spot_index'])){
            $spot_index = $post['spot_index'];  //景点索引
        }
        $data = Db::name('Plan_info')->where(array('trip_id'=>$trip_id))->find();
        $schedufing = unserialize(base64_decode($data['schedufing']));
        $info= json_decode(json_encode($schedufing),true);
        foreach($info as $key=>&$value)
        {
            if($key == $this_city_index){ //城市
                foreach($value['day_arry'] as $key2=>&$v)
                {
                    if($key2 == $d_index){ //天数
                        foreach($v['day'] as $key3=>&$vv)
                        {
                            if(isset($spot_index)){
                                if($key3 == $spot_index)
                                {
                                    if(isset($image_url)){
                                        $vv['image_url'] = $image_url;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        $dataresult['schedufing'] = base64_encode(serialize($info));
        $dataresult['isoredit'] = 1;   //是否在h5中进行了编辑（0-没有，默认），（1-有修改)
        $resultInfo = Db::name('Plan_info')->where(array('trip_id'=>$trip_id))->update($dataresult);
        if(false !== $resultInfo)
        {
            if(isset($image_url)){
                if(is_string($image_url)){
                    if(strstr($image_url, ';')){
                        $image_urlResult = explode(';',$image_url);
                    }else{
                         $image_urlResult= array($image_url);
                    }
                }else{
                    $image_urlResult= $image_url;
                }
                $result = array('status'=>true,'msg'=>'请求成功','data'=>$image_urlResult);
            }else{
                $result = array('status'=>true,'msg'=>'请求成功');
            }
        }else{
            $result = array('status'=>false,'msg'=>'请求失败');
        }
        echo json_encode($result,JSON_UNESCAPED_UNICODE);
    }

    //编辑H5中的行程概览列表
    public function BaseList()
    {
        $post = $_POST;
        $trip_id = $post['trip_id'];
        $data['trip_id'] = $trip_id;
        $data['line'] = $post['line'];
        $data['daynumber'] = json_encode($post['daynumber']);
        $data['day_line'] = json_encode($post['day_line']);
        $data['datestring'] = json_encode($post['datestring']);
        $data['trafficstring'] = json_encode($post['trafficstring']);
        $data['same_day_spot'] = json_encode($post['same_day_spot']);
        $data['creat_time'] = time();
        $baselist = Db::name('Base_list')->where(array('trip_id'=>$trip_id))->find();
        if($baselist){
            $tag = Db::name('Base_list')->where('trip_id',$trip_id)->update($data);
        }else{
            $tag = Db::name('Base_list')->insert($data);
        }
        if($tag){
                $result = array('status'=>true,'msg'=>'请求成功');
        }else{
                $result = array('status'=>false,'msg'=>'请求失败');
        }
        echo json_encode($result,JSON_UNESCAPED_UNICODE);
    }

    //电脑版h5编辑行程单头部内容
    public function topcontent()
    {
        $post = $_POST;
        $data['trip_id'] = $post['trip_id'];
        $data['team_number'] = $post['team_number'];
        $data['team_price'] = $post['team_price'];
        $data['departure_date'] = $post['departure_date']; 
        $data['team_title'] = $post['team_title'];
        $data['travel_price'] = $post['travel_price'];
        $data['price_title'] = $post['price_title'];
        $data['date_title'] = $post['date_title'];
        $data['update_time'] = time();
        // $uid = substr($post['trip_id'],0,strpos($post['trip_id'], '-'));
        //旅行社名称
        $data['agency'] = $post['agency'];
        //备注信息
        $data['remarks'] = $post['remarks'];  
        //落款
        $data['inscribe'] = $post['inscribe'];
        //整体特色
        $data['allchara'] = $post['allchara'];

        //行程封面(如果上传了新的封面，更新到行程单表)
        $data2['travel_title'] = $post['travel_title'];   //行程单标题
        if(isset($post['cover'])){
            $base64_cover = $post['cover'];
            $coverurl = '/upload/portal/cover/'.date('Ymd').'/';
            if(!empty($base64_cover))
            {
                $coverresult = $this->saveBase64Image($base64_cover,$coverurl);
                $data2['cover'] = $coverresult['url'];
            }
        }

        $isOr = Db::name('Poster')->where(array('trip_id'=>$post['trip_id']))->find();
        if($isOr)
        {
            // 修改
            $result = Db::name('Poster')->where(array('trip_id'=>$post['trip_id']))->update($data);
            $result =  Db::name('trip_info')->where(array('trip_id'=>$post['trip_id']))->update($data2);
        }else{
            // 添加
            $result = Db::name('Poster')->insert($data);
            $result =  Db::name('trip_info')->where(array('trip_id'=>$post['trip_id']))->update($data2);
        }
       
        if(false !== $result)
        {
            $return = array('status'=>true,'msg'=>'修改成功');
        }else{
            $return = array('status'=>false,'msg'=>'修改失败');
        }
        echo json_encode($return,JSON_UNESCAPED_UNICODE);
    }
    //电脑版h5编辑行程中的元素
    public function EditElement()
    { 
        $post = $_POST;
        $trip_id = $post['trip_id'];
        $this_city_index = $post['this_city_index']; //城市索引
        $d_index = $post['day_arry_index']; //城市下的天数索引 
        //这些数据用于一天两城市
        if(isset($post['daynumber'])){
            $daynumber = $post['daynumber']; //如：DAY1
        }
        if(isset($post['nowdate'])){
            $nowdate = $post['nowdate'];    //当天日期
        }
        if(isset($post['bigtraffic'])){
            $bigtraffic = $post['bigtraffic'];  //跨城市的交通方式
            //交通图标
            if($bigtraffic == '飞机交通'){
                $traffic_ico = 'plane';
            }else if($bigtraffic == '铁路交通'){
                $traffic_ico = 'train';
            }else{
                $traffic_ico = 'bus';
            }
        }
        if(isset($post['tra_dis'])){
            $tra_dis = $post['tra_dis'];      //两个城市相距公里
        }
        if(isset($post['tra_time'])){
            $tra_time = $post['tra_time'];    //交通所需时间
        }
        if(isset($post['interval'])){
            $interval = $post['interval'];  //当天游玩时间区间
        }

        if(isset($post['this_playtime'])){
            $this_playtime = $post['this_playtime'];  //游玩时间
        }
        if(isset($post['remarks_title'])){
            $remarks_title = $post['remarks_title'];  //当天备注标题
        }
        if(isset($post['remarks'])){
            $remarks = $post['remarks'];  //当天备注
        }
        if(isset($post['traffic_remarks'])){
            $traffic_remarks = $post['traffic_remarks'];  //每天大交通备注
        }

        if(isset($post['info'])){
            $dataArray = $post['info'];  //修改的内容
        }
        if(isset($post['spot_index'])){
            $spot_index = $post['spot_index'];  //景点索引
        }
        if(isset($post['spot_remarks'])){
            $spot_remarks = $post['spot_remarks'];  //当前景点备注
        }
        if(isset($post['sremarks_title'])){
            $sremarks_title = $post['sremarks_title'];  //当前景点备注标题
        }
        //景点封面图
        $orgurl = '/upload/portal/cover/'.date('Ymd').'/';
        if(isset($dataArray['cover'])){
            $imageresult = $this->saveBase64Image($dataArray['cover'],$orgurl);
            $ab ='http://';
            $cover = $ab.$_SERVER['HTTP_HOST'].$imageresult['url']; 
        }

        $data = Db::name('Plan_info')->where(array('trip_id'=>$trip_id))->find();
        $schedufing = unserialize(base64_decode($data['schedufing']));
        $info= json_decode(json_encode($schedufing),true);
        foreach($info as $key=>&$value)
        {
            if($key == $this_city_index){ //城市
                foreach($value['day_arry'] as $key2=>&$v)
                {
                    if($key2 == $d_index){ //天数
                        if(isset($remarks)){
                            $v['remarks_title'] = $remarks_title;
                            $v['remarks'] = $remarks; //天数中的备注
                            $v['traffic_remarks'] = $traffic_remarks; //交通的备注

                            $v['daynumber'] = $post['daynumber'];
                            $v['nowdate'] = $post['nowdate'];
                            $v['bigtraffic'] = $post['bigtraffic'];
                            $v['traffic_ico'] = $traffic_ico;
                            $v['tra_dis'] = $post['tra_dis'];
                            $v['tra_time'] = $post['tra_time'];
                            $v['interval'] = $post['interval'];
                        }
                        foreach($v['day'] as $key3=>&$vv)
                        {
                            if(isset($spot_index)){
                                if($key3 == $spot_index)
                                {
                                    $vv['sremarks_title'] = $sremarks_title;
                                    $vv['spot_remarks'] = $spot_remarks; //景点备注
                                    unset($dataArray['cover']);
                                    $vv['info'] =  $dataArray;
                                    $vv['info']['isedit'] =  'yes';
                                    $vv['this_name'] =  $dataArray['spot_name'];
                                    $vv['this_playtime'] =  $this_playtime;
                                    $vv['this_tag_time'] =  $this->play_time($this_playtime);
                                    if(isset($dataArray['play_time'])){
                                        $vv['play_time'] =  $dataArray['play_time'];
                                    }
                                    
                                    if(isset($cover)){
                                        $vv['info']['spot_image_url'] = $cover;
                                        $vv['this_img_src'] =  $cover;
                                    }else{
                                        if(isset($dataArray['spot_image_url'])){
                                            $vv['this_img_src'] =  $dataArray['spot_image_url'];
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        $data['schedufing'] = base64_encode(serialize($info));
        $data['isoredit'] = 1;   //是否在h5中进行了编辑（0-没有，默认），（1-有修改)
        $result = Db::name('Plan_info')->where(array('trip_id'=>$trip_id))->update($data);
        if(false !== $result)
        {
            if(isset($cover)){
                 $return = array('status'=>true,'msg'=>'请求成功','spot_image_url'=>$cover);
            }else{
                $return = array('status'=>true,'msg'=>'请求成功');
            }
        }else{
            $return = array('status'=>false,'msg'=>'请求失败');
        }
        echo json_encode($return,JSON_UNESCAPED_UNICODE);
    }

    //修改h5的景点以后，保存一份数据到7都当中，关联对应的uid
    //或者个人中心自己新增景点
    public function addseven()
    {
        $post = $_POST;
//        print_r($post);
//        exit;
        
        $newspotData['uid'] = $post['uid'];
        if(isset($post['image_url'])){
            $newspotData['picture2'] = json_encode($post['image_url']);
        }else{
            $newspotData['picture2'] = [];
        }
        $newspotData['city_id'] = $post['info']['city_id'];
        if(isset($post['info']['city_name'])){
            $newspotData['city_name'] = $post['info']['city_name'];
        }
        $newspotData['type'] = 'add_newSpot';
        $newspotData['ranking'] = 10;
        $newspotData['spot_name'] = $newspotData['map_name'] = $post['info']['spot_name'];
        $newspotData['attr_score'] = $post['info']['attr_score'];
        $newspotData['play_time'] = $post['info']['play_time'];
        $newspotData['spot_Introduction'] = $post['info']['spot_Introduction'];
        $newspotData['absture'] = $post['info']['absture'];
        if(isset($post['info']['suit_season'])){
             $newspotData['suit_season'] = $post['info']['suit_season'];
        }else{
            $newspotData['suit_season'] = '1-12月';
        }
        $newspotData['phone'] = $post['info']['phone'];
        $newspotData['attractions_tickets'] = $post['info']['attractions_tickets'];
        if(isset($post['info']['ticket_data'])){
            $newspotData['ticket_data'] = $post['info']['ticket_data'];
        }else{
            $newspotData['ticket_data'] = 0;
        }
        if(isset($post['info']['period_time'])){
            $newspotData['period_time'] = $post['info']['period_time'];
        }else{
            $newspotData['period_time'] = 'allday';
        }

        if(isset($post['info']['suit_time'])){
            $newspotData['suit_time'] = $post['info']['suit_time'];
        }else{
            $newspotData['suit_time'] = '09:00-21:00';
        }
        if(isset($post['info']['business_hours'])){
            $newspotData['business_hours'] = $post['info']['business_hours'];
        }else{
            $newspotData['business_hours'] = '09:00-21:00';
        }
        if(isset($post['info']['other_description'])){
            $newspotData['other_description'] = $post['info']['other_description'];
        }else{
            $newspotData['other_description'] = '';
        }
        $newspotData['longitude'] = $post['info']['longitude'];
        $newspotData['latitude'] = $post['info']['latitude'];
        $newspotData['address'] = $post['info']['address'];
        $newspotData['creat_time'] = time();
        $newspotData['not_modifity'] = 0;
        if(isset($post['info']['spot_image_url'])){
            $newspotData['pic'] = $post['info']['spot_image_url'];
        }else{
            $newspotData['pic'] = '';
        }
        
        $yn = Db::name('New_spot')->where(array('uid'=>$post['uid'],'spot_name'=>$post['info']['spot_name']))->find();
        if(isset($yn)){
              $result = Db::name('New_spot')->where(array('uid'=>$post['uid'],'spot_name'=>$post['info']['spot_name']))->update($newspotData);
        }else{
            $result = Db::name('New_spot')->insert($newspotData);
        }
        if($result !== false)
        {
            $return = array('status'=>true,'msg'=>'请求成功');
        }else{
            $return = array('status'=>false,'msg'=>'请求失败');
        }
        echo json_encode($return,JSON_UNESCAPED_UNICODE);
    }
    //用户在个人中心新增属于自己的新景点。图片上传到七牛云
    public function Newphotos()
    {
        vendor('qiniu.php-sdk.sendAPI');//引入加载文件 
        // require_once __DIR__ . '/php-sdk/autoload.php'; //引入加载文件 
        $accessKey = 'vbYc94XHTg28x9Xd_xY9uCk1TztEGJpWyzRTqKAZ';
        $secretKey = 'YKZkI5t_yExwLgRP1aVr5VnFuzk9hJyImhbVk7sg';
        $auth = new Auth($accessKey, $secretKey);  //实例化
        $bucket='discuss';//存储空间
        $token = $auth->uploadToken($bucket);
        $uploadMgr = new UploadManager();
        if(isset($_FILES['file']))
        {
            $filePath = $_FILES['file']['tmp_name'];//'./php-logo.png';  //接收图片信息
            $fileType = $_FILES['file']['type'];
            $typecount = count($fileType);
            $picUrl = '';
            if(isset($fileType)){
                for($i=0;$i<$typecount;$i++)
                {
                    // $pattern = '1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLOMNOPQRSTUVWXYZ';    //字符池
                    $name = time().rand(1000000, 9999999);

                    if($fileType[$i] == 'video/mp4'){
                        $key = 'video'.$name.'.mp4';  
                    }elseif($fileType[$i] == 'audio/mp3'){
                        $key = 'audio'.$name.'.mp3';  
                    }else{
                        $key = 'png'.$name.'.png';  
                    }
                    list($ret, $err) = $uploadMgr->putFile($token, $key, $filePath[$i]);
                    if ($err !== null) {  
                        echo '上传失败';
                    } else{
                        //上传成功以后，外链存到数据库中
                        $picUrl = 'http://discuss.5199yl.com/'.$ret['key'].';'.$picUrl; //多张图片
                        // echo $picUrl;
                        if(isset($picUrl)){
                            $image_url= substr($picUrl, 0, -1);  //剔除最后的分号;
                        }
                    }
                }
            }
        }

        if(isset($image_url)){
            if(is_string($image_url)){
                if(strstr($image_url, ';')){
                    $image_urlResult = explode(';',$image_url);
                }else{
                     $image_urlResult= array($image_url);
                }
            }else{
                $image_urlResult= $image_url;
            }
            //返回图片，数组格式。链接存储到数据库
            $result = array('status'=>true,'msg'=>'请求成功','data'=>$image_urlResult);
        }else{
            $result = array('status'=>true,'msg'=>'请求成功','data'=>[]);
        }
        echo json_encode($result,JSON_UNESCAPED_UNICODE);
    }
    
    //个人中心删除我的景点
    public function DeleteSelf()
    {
        $id = input('post.id');
        $result = Db::name('New_spot')->where(array('id'=>$id))->delete();
        if($result){
            $return = array('status'=>true,'msg'=>'删除成功','data'=>[]);
        }else{
            $return = array('status'=>false,'msg'=>'删除失败','data'=>[]);
        }
        echo json_encode($return,JSON_UNESCAPED_UNICODE);
    }
    //获取省份信息
    public function ProvinceData() {
        //获取省份信息
        $provinceData =$this->getPro();
        if($provinceData)
        {
            $return = array('status'=>true,'msg'=>'请求成功','data'=>$provinceData);
        }else{
            $return = array('status'=>false,'msg'=>'请求失败','data'=>[]);
        }
//        print_r($return);
        echo json_encode($return,JSON_UNESCAPED_UNICODE);
    } 
     //列出省份信息
    public function getPro() {
        //获取省份信息
        $areaDB=Db::name('Area');
        $where['area_type']=1;
        $where['area_pid']=0;
        $areaArr=$areaDB->where($where)->select()->toarray();
        return $areaArr;
    } 
    //根据城市id列出 某个城市下的区域列表 
    public function getArea($city_id) {
        //获取省份信息
        $areaDB=Db::name('Area');
        $where['area_type']=3;
        $where['area_pid']=$city_id;
        $areaArr=$areaDB->where($where)->select();
        return $areaArr;
    } 
    //根据省份获取城市/地区联动
    public function getCityLink() {
        $area_id=$_GET['area_id'];
        $area_type=$_GET['area_type'];
        $areaDB=Db::name('Area');
        $where['area_pid']=$area_id;
        $where['area_type']=$area_type;
        $areas=$areaDB->where($where)->select();
        echo json_encode($areas);
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

    //查看本用户已经发布的行程单
    public function Released()
    {
        vendor('Page.system_page'); //分页
        $post = input('post.');
        $p = isset($post['page'])?$post['page']:1;
        $uid = $post['uid'];
        $tripInfo = Db::name('trip_info')->page($p.',15')->field('uid,trip_id,trip_name,travel_title,cover,day_num,status,creat_time')->where(array('uid'=>$uid,'status'=>3))->order('creat_time desc')->select()->toarray();
        // $tripInfo = Db::name('trip_info')->field('uid,trip_id,trip_name,travel_title,cover,day_num,status,creat_time')->limit(15)->where(array('uid'=>$uid,'status'=>2))->order('creat_time desc')->select()->toarray();
        foreach($tripInfo as &$vv)
        {
            if(empty($vv['travel_title'])){
                $vv['travel_title']  = $vv['trip_name'];
            }
            unset($vv['trip_name']);
            //如果没有封面图，用景点图替换
            if(empty($vv['cover'])){
                $plan_info = Db::name('plan_info')->where(array('status'=>3,'trip_id'=>$vv['trip_id']))->find();
                if(isset($plan_info)){
                    $plan_info['info'] = unserialize(base64_decode($plan_info['schedufing']));
                    $plan= json_decode(json_encode($plan_info['info']),true);
                    foreach($plan as $info)
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
                                        $vv['cover'] = $jing['info']['spot_image_url'];
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        // print_r($tripInfo);
        if($tripInfo)
        {
            $return = array('status'=>true,'msg'=>'请求成功','data'=>$tripInfo);
        }else{
            $return = array('status'=>false,'msg'=>'请求失败','data'=>[]);
        }
        echo json_encode($return,JSON_UNESCAPED_UNICODE);
    }

    //复制行程（可在自己的个人中心查看结果）
    public function Duplicate()
    {
        $post = input('post.');
        $uid = $post['uid'];  //现在登录人的uid
        $them = $post['them']; //之前制作行程单的人的uid
        $trip_id = $post['trip_id'];  //之前的行程单号 
        //可以复制多次
        $trip_info = Db::name('trip_info')->where(array('uid'=>$them,'trip_id'=>$trip_id))->find();
        $tripData['uid'] = $uid;
        $time = time();
        $tripId = $uid.'-'.$time;  //新的行程单号
        $tripData['trip_id'] = $tripId;
        $tripData['adult'] = $trip_info['adult'];
        $tripData['children'] = $trip_info['children'];
        //拼接行程单名称行程单名称
        // $user = Db::name('Customer')->field('user_name')->where(array('uid'=>$uid))->find();
        // $go_city_array = json_decode($trip_info['go_city_array'],true);
        // foreach($go_city_array as $city){ $cityArray[] = $city['city_name'];}
        // $cityString = implode('.',$cityArray);
        // $citynum = count($cityArray);
        // $tripData['trip_name'] = $user['user_name'].'的'.$cityString.$trip_info['day_num'].'日游行程单';
        $tripData['trip_name'] = $trip_info['travel_title'];
        $tripData['custom_title'] =$trip_info['custom_title'];
        $tripData['travel_title'] =$trip_info['travel_title'];
        $tripData['date'] = $trip_info['date'];
        $tripData['day_num'] = $trip_info['day_num'];
        $tripData['cover'] = $trip_info['cover'];

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
        $tripData['creat_time'] = $time;
        $tripData['submit_time'] = 0;
        $tripData['pass_time'] = 0;
        $tripData['click_num'] = 1;
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
            $cityData['creat_time'] = $time;
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
            $trafficData['creat_time'] = $time;
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
            $hotelData['creat_time'] = $time;
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
            $eat_moneyData['creat_time'] = $time;
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
        $planData['creat_time'] = $time;
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

        $baselist = Db::name('base_list')->where(array('trip_id'=>$trip_id))->find();
        if(isset($baselist))
        {
            $bal['trip_id'] = $tripId;
            $bal['line'] = $baselist['line'];
            $bal['daynumber'] = $baselist['daynumber'];
            $bal['day_line'] = $baselist['day_line'];
            $bal['datestring'] = $baselist['datestring'];
            $bal['trafficstring'] = $baselist['trafficstring'];
            $bal['same_day_spot'] = $baselist['same_day_spot'];
            $bal['creat_time'] = $time;
            if(Db::name('base_list')->insert($bal))
            {
                $tag7 = 1;
            }else{
                $tag7 = 0;
            }
        }else{
            $tag7 = 1;
        }
        //复制海报表
        $pp = Db::name('poster')->where(array('trip_id'=>$trip_id))->find();
        if(isset($pp))
        {
            $pdata['trip_id'] = $tripId;
            $pdata['agency'] = $pp['agency'];
            $pdata['departure_date'] = $pp['departure_date'];
            $pdata['phone'] = $pp['phone'];
            $pdata['team_number'] = $pp['team_number'];
            $pdata['team_price'] = $pp['team_price'];

            $pdata['poster_name'] = $pp['poster_name'];
            $pdata['pic'] = '';
            $pdata['logo'] = '';
            $pdata['remarks'] = $pp['remarks'];
            $pdata['inscribe'] = $pp['inscribe'];
            $pdata['allchara'] = $pp['allchara'];
            $pdata['team_title'] = $pp['team_title'];
            $pdata['price_title'] = $pp['price_title'];
            $pdata['date_title'] = $pp['date_title'];
            $bal['creat_time'] = $time;
            if(Db::name('poster')->insert($pdata))
            {
                $tag8 = 1;
            }else{
                $tag8 = 0;
            }
        }else{
            $tag8 = 1;
        }

        if($tag1 == 1 && $tag2 == 1 && $tag3 == 1 && $tag4 == 1 && $tag5 == 1 && $tag6 == 1 && $tag7 == 1 && $tag8 == 1)
        {
            $result = array('status'=>true,'msg'=>'复制成功','data'=>$tripId);
        }else{
            $result = array('status'=>false,'msg'=>'复制失败','data'=>array());
        }
        echo json_encode($result,JSON_UNESCAPED_UNICODE);
    }

    //点击修改行程头部（点击修改过程中做了复制操作）
    public function Alter()
    {
        $post = input('post.');
        $uid = $post['uid'];  //现在登录人的uid
        $them = $post['them']; //之前制作行程单的人的uid
        $trip_id = $post['trip_id'];  //之前的行程单号 
        //登录人的uid如果与之前制作行程单的人uid相同，不做复制操作
        if($uid == $them){  
            $result = array('status'=>true,'msg'=>'请求成功','data'=>$trip_id);
        }else{
            //可以复制多次
            $trip_info = Db::name('trip_info')->where(array('uid'=>$them,'trip_id'=>$trip_id))->find();
            $tripData['uid'] = $uid;
            $time = time();
            $tripId = $uid.'-'.$time;  //新的行程单号
            $tripData['trip_id'] = $tripId;
            $tripData['adult'] = $trip_info['adult'];
            $tripData['children'] = $trip_info['children'];
            $tripData['trip_name'] = $trip_info['travel_title'];
            $tripData['custom_title'] =$trip_info['custom_title'];
            $tripData['travel_title'] =$trip_info['travel_title'];
            $tripData['date'] = $trip_info['date'];
            $tripData['day_num'] = $trip_info['day_num'];
            $tripData['cover'] = $trip_info['cover'];

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
            $tripData['creat_time'] = $time;
            $tripData['submit_time'] = 0;
            $tripData['pass_time'] = 0;
            $tripData['click_num'] = 1;
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
                $cityData['creat_time'] = $time;
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
                $trafficData['creat_time'] = $time;
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
                $hotelData['creat_time'] = $time;
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
                $eat_moneyData['creat_time'] = $time;
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
            $planData['creat_time'] = $time;
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

            $baselist = Db::name('base_list')->where(array('trip_id'=>$trip_id))->find();
            if(isset($baselist))
            {
                $bal['trip_id'] = $tripId;
                $bal['line'] = $baselist['line'];
                $bal['daynumber'] = $baselist['daynumber'];
                $bal['day_line'] = $baselist['day_line'];
                $bal['datestring'] = $baselist['datestring'];
                $bal['trafficstring'] = $baselist['trafficstring'];
                $bal['same_day_spot'] = $baselist['same_day_spot'];
                $bal['creat_time'] = $time;
                if(Db::name('base_list')->insert($bal))
                {
                    $tag7 = 1;
                }else{
                    $tag7 = 0;
                }
            }else{
                $tag7 = 1;
            }
            //复制海报表
            $pp = Db::name('poster')->where(array('trip_id'=>$trip_id))->find();
            if(isset($pp))
            {
                $pdata['trip_id'] = $tripId;
                $pdata['agency'] = $pp['agency'];
                $pdata['departure_date'] = $pp['departure_date'];
                $pdata['phone'] = $pp['phone'];
                $pdata['team_number'] = $pp['team_number'];
                $pdata['team_price'] = $pp['team_price'];

                $pdata['poster_name'] = $pp['poster_name'];
                $pdata['pic'] = '';
                $pdata['logo'] = '';
                $pdata['remarks'] = $pp['remarks'];
                $pdata['inscribe'] = $pp['inscribe'];
                $pdata['allchara'] = $pp['allchara'];
                $pdata['team_title'] = $pp['team_title'];
                $pdata['price_title'] = $pp['price_title'];
                $pdata['date_title'] = $pp['date_title'];

                $bal['creat_time'] = $time;
                if(Db::name('poster')->insert($pdata))
                {
                    $tag8 = 1;
                }else{
                    $tag8 = 0;
                }
            }else{
                $tag8 = 1;
            }
            if($tag1 == 1 && $tag2 == 1 && $tag3 == 1 && $tag4 == 1 && $tag5 == 1 && $tag6 == 1 && $tag7 == 1 && $tag8 == 1)
            {
                $result = array('status'=>true,'msg'=>'复制成功','data'=>$tripId);
            }else{
                $result = array('status'=>false,'msg'=>'复制失败','data'=>array());
            }
        }
        echo json_encode($result,JSON_UNESCAPED_UNICODE);
    }

    //复制A旅行社行程单，修改为B旅行社头部信息
    public function submitRevise()
    {
        $post = input('post.');
        $data['trip_id'] = $post['trip_id'];
        $data['agency'] = $post['agency'];
        $data['phone'] = $post['phone'];
        $data['travel_price'] = $post['travel_price'];
        $poster = Db::name('poster')->where(array('trip_id'=>$post['trip_id']))->find();
        if(isset($poster)){
            $tag = Db::name('poster')->where(array('trip_id'=>$post['trip_id']))->update($data);
        }else{
            $tag = Db::name('poster')->insert($data);
        }
        
        if($tag !==false)
        {
            $result = array('status'=>true,'msg'=>'提交成功');
        }else{
            $result = array('status'=>false,'msg'=>'提交失败');
        }
        echo json_encode($result,JSON_UNESCAPED_UNICODE);
    }

    //申请开通旅行社权限
    public function applyAgency()
    {
        $post = input('post.');
        $data['uid'] = $post['uid'];
        $data['user_name']= $post['user_name'];
        $data['phone']= $post['phone'];
        $data['apply_time'] = time();
        $customer = Db::name('customer')->where(array('uid'=>$post['uid']))->field('insiders')->find();
        if($customer['insiders'] == 3){
            $result = array('status'=>true,'msg'=>'此账户id已存在高级功能，不需要申请！');
        }else{
            $applyInfo = Db::name('apply_agency')->where(array('uid'=>$post['uid']))->find();
            if(isset($applyInfo)){
                $result = array('status'=>true,'msg'=>'您已提交申请，请勿重复提交！');
            }else{
                $tag = Db::name('apply_agency')->insert($data);
                if($tag)
                {
                    $result = array('status'=>true,'msg'=>'提交成功,请耐心等待审核！');
                }else{
                    $result = array('status'=>false,'msg'=>'提交失败');
                }
            }
        }
        echo json_encode($result,JSON_UNESCAPED_UNICODE);
    }

}
