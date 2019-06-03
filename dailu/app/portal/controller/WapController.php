<?php
namespace app\portal\controller;
use think\Db;
use think\Cookie;
use think\Request;
use cmf\controller\HomeBaseController;
use Qiniu\Auth;
use Qiniu\Storage\BucketManager;
use Exception;
use think\exception\Handle;
use think\exception\HttpException;
header("Content-type: text/html; charset=utf-8");
// header('Content-type: image/jpeg');
class WapController extends HomeBaseController{
     //初始化 极验  会有异步请求
    public function StartCaptchaServlet() {
        vendor('geetest.geetestlib'); //极验接口API
        $gid = 'd20edb0b278234139f70a118f021855c';
        $gkey = 'b7f3c61169746ddf921c8ab885c14404';
        $GtSdk = new \GeetestLib($gid,$gkey);
        $data = array(
                "user_id" => "test", # 网站用户id
                "client_type" => "h5", #web:电脑上的浏览器；h5:手机上的浏览器，包括移动应用内完全内置的web_view；native：通过原生SDK植入APP应用的方式
                "ip_address" => "unknow" # 请在此处传输用户请求验证时所携带的IP
        );
        $status = $GtSdk->pre_process($data, 1); 
        $_SESSION['gtserver'] = $status;
        $_SESSION['user_id'] = $data['user_id'];       
        echo $GtSdk->get_response_str();
    }
	/**  生成短信，发送验证码  **/ 
    public function getVerCode(){
        vendor('duanxin.sendAPI'); //引进短信接口API
        vendor('geetest.geetestlib'); //极验接口API
        //极 验
        $GtSdk = new \GeetestLib('d20edb0b278234139f70a118f021855c', 'b7f3c61169746ddf921c8ab885c14404');
        $verifyData = array(
                "user_id" => "test", # 网站用户id
                "client_type" => "web", #web:电脑上的浏览器；h5:手机上的浏览器，包括移动应用内完全内置的web_view；native：通过原生SDK植入APP应用的方式
                "ip_address" => "" # 请在此处传输用户请求验证时所携带的IP
        );
        $_SESSION['gtserver'] = 1;

        $phone = trim(input('post.phone')) ? trim(input('post.phone')) : '';
        $type = input('post.type') ? input('post.type') : '';
        //手机号验证
        if (empty($phone)){
            exit(json_encode(array('status' =>false, 'msg' => '手机号不能为空'),JSON_UNESCAPED_UNICODE));
        }
        if(!is_numeric($phone) || (strlen($phone) != 11)){
            exit(json_encode(array('status' =>false, 'msg' => '请输入正确手机号'),JSON_UNESCAPED_UNICODE));
        }
        //用户表 Customer
        $user_info = Db::name('Customer')->where(array('phone' => $phone))->find(); 
        if(!empty($user_info)){
            if(empty($type)){
                exit(json_encode(array('status' =>false, 'msg' => '手机号码已被注册'),JSON_UNESCAPED_UNICODE));
            }
        }
        $code = cmf_get_verification_code($phone,6);//检查手机或邮箱是否还可以发送验证码,并返回生成的验证码
        if(empty($code)){
            exit(json_encode(array('status' =>false, 'msg' => '获取验证码超过上限'),JSON_UNESCAPED_UNICODE));
        }
        $sms_text = "【袋鹿旅行】您的验证码是：".$code."。请不要把验证码泄露给其他人,10分钟内有效。";
        $result = cmf_verification_code_log($phone,$code);//更新手机或邮箱验证码发送日志
        $data['uid']=$user_info['uid'];
        $data['sendto']='user';
        $data['type']='wapregCode2';
        //调用短信接口
        $sendArr = array(
            'content' 	=> $sms_text,     //短信内容
            'mobile' 	=> $phone         //手机号码
        );
        $url 		= "http://www.api.zthysms.com/sendSms.do";
        $username 	= 'YRCWhy';
        $password 	= 'Yrcw123456';
        $ucpass = new \sendAPI($url, $username, $password); //这里第一个反斜杠是必须要有的。 
         // 验证
        if ($_SESSION['gtserver'] == 1) {   //服务器正常
            $result = $GtSdk->success_validate($_POST['geetest_challenge'], $_POST['geetest_validate'], $_POST['geetest_seccode'], $verifyData);
            if ($result) {
                $ucpass->send_sms($phone,$sms_text,$sendArr,$data);
            } else{
                echo '{"status":"fail"}';
            }
        }else{  //服务器宕机,走failback模式
            if ($GtSdk->fail_validate($_POST['geetest_challenge'],$_POST['geetest_validate'],$_POST['geetest_seccode'])) {
                sendAPI::send_sms($phone,$sms_text,$sendArr,$data);
            }else{
                echo '{"status":"fail"}';
            }
        }
        
        echo json_encode(array('status' =>true,'msg'=>'获取验证码成功','code'=>$code),JSON_UNESCAPED_UNICODE);
    }

    //立即注册请求
    public function register(){
        $user_name= input('user_name') ? input('user_name') : '';
        $phone = input('post.phone') ? input('post.phone') : '';
        $pwd = input('post.pwd') ? input('post.pwd') : '';
        $code = input('post.code') ? input('post.code') : '';
        $refer_code = input('post.refer_code') ? input('post.refer_code') : '';
        $check_res = cmf_check_verification_code($phone,$code);//核对验证码
        if(!empty($check_res)){
            exit(json_encode(array('status'=>false,'msg'=>$check_res),JSON_UNESCAPED_UNICODE));
        }
        //根据手机号和密码进行验证，成功时，存入customer表
        $result = $this->checkreg($phone, $pwd,$user_name,$refer_code);
        echo json_encode($result,JSON_UNESCAPED_UNICODE);
    }

    //注册信息存入用户表 customer表
    public function checkreg($phone,$pwd,$user_name,$refer_code){
        vendor('duanxin.sendAPI');
        $customer = Db::name('Customer');
		if(!preg_match('/^[0-9]{11}$/',$phone)){
			return array('status' => false, 'msg' => '请输入有效的手机号');
        }
        if($customer->field('uid')->where(['phone'=>$phone])->find()){
            return array('status' => false, 'msg' => '手机号已存在');
        }
        if($customer->field('uid')->where(['user_name'=>$user_name])->find()){
			return array('status' => false, 'msg' => '用户名已存在');
		}
		$data_user['phone'] = $phone;
		$data_user['pwd'] = md5($pwd);
        $data_user['user_name'] = $user_name;
		$data_user['add_time'] = $data_user['last_time'] = $_SERVER['REQUEST_TIME'];
        $data_user['add_ip'] = $data_user['last_ip'] = get_client_ip();
        $data_user['refer_code'] = create_guid();
        $data_user['p_refer_code'] = $refer_code;
        if($refer_code){
            $customer->where('refer_code',$refer_code)->setInc('register_data',1);
        }
		$data_user['refer_url'] = 'http://www.dailuer.com/portal/login/register.html?invitation='.$data_user['refer_code'];
        if($uid = $customer->insertGetId($data_user)){
            $sms_text = '【袋鹿旅行】欢迎您成为袋鹿大家庭的一员，您的用户名为：'.$data_user['user_name'].'，祝您生活愉快！';       
            $data['uid']=$uid;
            $data['sendto']='user';
            $data['type']='wapreg';
            //调用短信接口
            $sendArr = array(
                'content' 	=> $sms_text,     //短信内容
                'mobile' 	=> $phone         //手机号码
            );
            $url 		= "http://www.api.zthysms.com/sendSms.do";
            $username 	= 'YRCWhy';
            $password 	= 'Yrcw123456';
            $ucpass = new \sendAPI($url, $username, $password); //这里第一个反斜杠是必须要有的。 
            $ucpass->send_sms($phone,$sms_text,$sendArr,$data);
            $token = $uid.$data_user['pwd'];
            $token_time = time();
            $customer->where(['uid'=>$uid])->update(['token'=>$token,'token_time'=>$token_time]);
            return array('status' => true,'msg' => '注册成功！','data'=>['uid'=>$uid,'user_name'=>$user_name,'token'=>$token]);
		}else{
			return array('status' => false, 'msg' => '注册失败！请重试。');
		}
    }

    //修改密码
    public function changePwd(){
        $phone = input('post.phone') ? input('post.phone') : '';
        $pwd = input('post.pwd') ? input('post.pwd') : '';
        $new_pwd = input('post.new_pwd') ? input('post.new_pwd') : '';
        $type = input('post.type') ? input('post.type') : '';//type不为空时为忘记密码
        $code = input('post.code') ? input('post.code') : '';
        // $phone = '12345678912';
        // $pwd = '1';
        // $type = '1';
        // $new_pwd = '2';
        if(!empty($type)){
            $check_res = cmf_check_verification_code($phone,$code);//核对验证码
            if(!empty($check_res)){
                exit(json_encode(array('status'=>false,'msg'=>$check_res),JSON_UNESCAPED_UNICODE));
            }
            $upPwd = Db::name('Customer')->where(['phone'=>$phone])->update(['pwd'=>md5($new_pwd)]);
            if($upPwd){
                $msg = '修改成功';
            }else{
                $msg ='与原密码相同';
            }
            exit(json_encode(array('status'=>true,'msg'=>$msg),JSON_UNESCAPED_UNICODE));
        }
        $user_info = Db::name('Customer')->where(['phone'=>$phone,'pwd'=>md5($pwd)])->find();
        $msg = '手机号或原密码错误';
        if(!empty($user_info)){
            $upPwd = Db::name('Customer')->where(['phone'=>$phone])->update(['pwd'=>md5($new_pwd)]);
            if($upPwd){
                $msg = '修改成功';
            }else{
                $msg ='与原密码相同';
            }
        }
        echo json_encode(array('status'=>true,'msg'=>$msg),JSON_UNESCAPED_UNICODE);
    }

    //用户登录
    public function login(){
        $phone = input('post.phone') ? input('post.phone') : '';
        $pwd = input('post.pwd') ? input('post.pwd') : '';
        if(empty($phone)){
            exit(json_encode(array('status' => true,'msg' => '手机号不能为空', 'data'=>['status'=>102,'msg' => '手机号不能为空']),JSON_UNESCAPED_UNICODE));
        }
        $result = Db::name('Customer')->where(array('phone'=>$phone))->find();
        if($result){
            if($pwd == -1){
                exit(json_encode(array('status' => true,'msg' => '用户存在', 'data'=>['status'=>105,'msg' => '用户存在']),JSON_UNESCAPED_UNICODE));
            }elseif(empty($pwd)){
                exit(json_encode(array('status' => true,'msg' => '密码不能为空', 'data'=>['status'=>103,'msg' => '密码不能为空']),JSON_UNESCAPED_UNICODE));
            }
            if($result['pwd'] == md5($pwd)){
                    $data['token'] = $result['uid'].$result['pwd'];
                    $data['token_time'] = time();
                    Db::name('Customer')->where(array('phone'=>$phone))->update($data);
                    $avatar = strstr($result['head_port'],'http') ? $result['head_port'] : cmf_get_image_url($result['head_port']);
                    exit(json_encode(array('status'=>true,'msg' => '登录成功','data'=>['status'=>100,'msg' => '登录成功','uid'=>$result['uid'],'user_name'=>$result['user_name'],'sex'=>$result['sex'],'birth'=>$result['birth'],'phone'=>$result['phone'],'avatar'=>$avatar,'token'=>$data['token']]),JSON_UNESCAPED_UNICODE));
            }else{
                exit(json_encode(array('status' => true,'msg' => '账号或密码不正确', 'data'=>['status'=>104,'msg' => '账号或密码不正确']),JSON_UNESCAPED_UNICODE));
            }
        }else{
            exit(json_encode(array('status' => true,'msg' => '用户不存在', 'data'=>['status'=>101,'msg' => '用户不存在']),JSON_UNESCAPED_UNICODE));
        }
    }

    //退出登录
    public function logout() {
        $uid = input('post.uid') ? input('post.uid') : '';
        $token = input('post.token') ? input('post.token') : '';
        if(!empty($uid) || !empty($token)){
            if(Db::name('Customer')->where(array('uid'=>$uid,'token'=>$token))->update(array('token'=>'','token_time'=>''))){
                exit(json_encode(array('status' => true, 'msg' => '成功退出登录'),JSON_UNESCAPED_UNICODE));
            }else{
                exit(json_encode(array('status' => false, 'msg' => '无法退出登录'),JSON_UNESCAPED_UNICODE));
            }
        }
        exit(json_encode(array('status' => false, 'msg' => '无法退出登录'),JSON_UNESCAPED_UNICODE));
    }

    //推广页面
    public function invitation(){
        $uid = input('post.uid');
        $customer_db = Db::name('Customer');
        $user_info = $customer_db->field('uid,user_name,phone,refer_code,register_data,is_audit')->where(array('uid'=>$uid))->find();
        if(empty($user_info['refer_code'])){
            $user_info['refer_code'] = create_guid();
            $customer_db->where('uid',$uid)->update(['refer_code'=>$user_info['refer_code']]);
        }
        $user_info['title'] = '分分钟设计出属于自己的旅行路书，方便又快捷，你也来试试吧！';
        $user_info['message'] = '不用查攻略也能设计出合理好玩的路线';
        $user_info['logo'] = 'http://www.dailuer.com/static/v1/img/tripinfoShare/prev1.png';
        $user_info['register_url'] = 'http://www.dailuer.com/portal/h5login/register.html?invitation='.$user_info['refer_code'];
        echo json_encode(['status'=>true,'msg'=>'请求成功','data'=>$user_info]);
    }

    //首页
    public function index(){
        $uid = input('post.uid') ? input('post.uid') : null;
        $data = $this->tripList($uid);
        $return = array('status'=>true,'msg'=>'请求成功','data'=>$data);
        echo json_encode($return,JSON_UNESCAPED_UNICODE);
    }

    //查看更多
    public function lookMore(){
        $uid = input('post.uid');//用户id
        $type = input('post.type');//类型
        $city_id = input('post.city_id');//城市id
        if($type == 'my_trip'){
            $trip_info = DB::name('trip_info')->where('uid',$uid)->order('id desc')->select()->toArray();
            $data = $this->make($trip_info);
        }elseif($type == 'hot_trip'){
            $trip_info = DB::name('trip_info')->where('status',2)->select()->toArray();
            $data = $this->make($trip_info);
        }elseif($type == 'nearby_city'){
            $coordinate = DB::name('City_details')->field(['longitude','latitude'])->where(['city_id'=>$city_id])->find();
            $city_list = Db::name('City_details')->field(array('id','province_id','city_id','province_name','city_name','city_abbreviation','more','longitude','latitude'))->order('id asc')->select()->toArray();
            foreach($city_list as $key=>&$city_value){
                $lo = $city_value['longitude'];
                $la= $city_value['latitude'];
                //调用common.php 中的 getDistance方法计算两个地理位置之间的距离
                $distance = getDistance($coordinate['longitude'], $coordinate['latitude'], $lo, $la, 2);
                if($distance == 0){
                    unset($city_list[$key]);
                }else if($distance > 130){
                    unset($city_list[$key]);
                }
                if(!empty($city_value['more'])){
                    $pic =json_decode($city_value['more'],true);
                    foreach($pic as $kk => &$pic_value)
                    {
                         //common.php中封装的图片url解析方法
                        $city_value['img'] = cmf_get_image_preview_url($pic_value['url']); 
                    }
                    unset($city_value['more']);
                }  
            }
            $data = array_merge($city_list);
        }elseif($type == 'famous_spot'){
            //知名景点为top8,详情页面没有景区内景点
            $data = $this->cityView($city_id,1);
        }elseif($type == 'special_food'){
            //城市下的特色美食
            $data = $this->foodDetail($city_id);
        }elseif($type == 'special_goods'){
            //城市下的本地特产
            $data = $this->cityGoods($city_id,1);
        }
        $return = array('status'=>true,'msg'=>'请求成功','data'=>$data);
        echo json_encode($return,JSON_UNESCAPED_UNICODE);
    }

    //行程简介
    public function tripList($uid){
        $trips = DB::name('trip_info')->where(['uid'=>$uid])->order('id desc')->limit(5)->select()->toArray();
        $trip_id = '22-1547088481';
        $trip[] = DB::name('trip_info')->where(['trip_id'=>$trip_id])->find();//默认行程
        // print_r($trip);exit;
        $trip_info = array_merge($trip,$trips);
        $my_trip = $this->make($trip_info);//我的行程
        $my_trip[0]['trip_type'] = true;
        // if(!empty($trip_info)){
        //     $my_trip = $this->make($trip_info);//我的行程
        // }else{
        //     $trip_id = '22-1547088481';
        //     $trip = DB::name('trip_info')->where(['trip_id'=>$trip_id])->find();//默认行程
        //     $trip_demo = [$trip];
        //     $my_trip = $this->make($trip_demo);//我的行程
        // }
        $return['my_trip']['title'] = '我的行程';
        $return['my_trip']['data'] = $my_trip;
        $hot_info = DB::name('trip_info')->where(['status'=>2,'theme'=>'1'])->limit(3)->order('id desc')->select()->toArray();
        $hot_trip = $this->make($hot_info);//热门行程
        $return['hot_trip']['title'] = '达人分享';
        $return['hot_trip']['data'] = $hot_trip;
        // $return = array_merge($my_trip,$hot_trip);
		return $return;
    }

    //行程删除
    public function delTrip(){
        $trip_id = input('post.trip_id');
        $result = DB::name('trip_info')->where('trip_id',$trip_id)->delete();
        $result = DB::name('plan_info')->where('trip_id',$trip_id)->delete();
        $temp = DB::name('traffic_money')->where('trip_id',$trip_id)->find();
        if($temp)
        {
            $result = DB::name('traffic_money')->where('trip_id',$trip_id)->delete();
        }else{
            $result = 'false';
        }

        if($result){
            $return = array('status'=>true,'msg'=>'删除成功');
        }else{
            $return = array('status'=>false,'msg'=>'删除失败');
        }
        echo json_encode($return,JSON_UNESCAPED_UNICODE);
    }

    //处理行程信息
    public function make($data){
        $return = array();
        foreach ($data as $key => &$value) {
            $value['go_city_array'] = json_decode($value['go_city_array']);
            $return[$key]['count'] = $value['collect_num'];//收藏数
            $return[$key]['id'] = $value['id'];//出行人数
            $return[$key]['trip_id'] = $value['trip_id'];//出行人数
            $return[$key]['uid'] = $value['uid'];//出行人id
            $user = DB::name('customer')->where(['uid'=>$value['uid']])->find();
            $return[$key]['head_port']  = strstr($user['head_port'],'http') ? $user['head_port'] :cmf_get_image_url($user['head_port']);//用户头像
            $return[$key]['user_name'] = $user['user_name'];//出行人数
            $return[$key]['people_num'] = $value['adult']+$value['children'];//出行人数
            $return[$key]['title'] = $value['travel_title'] ? $value['travel_title'] : $value['trip_name'];//行程标题
            $return[$key]['date'] = $value['date'];//出行日期
            $return[$key]['city'] = $value['departure_city'];//出行城市
            $day = $value['day_num'];
            $return[$key]['day'] = $day;
            $return[$key]['re_date'] = date('Y-m-d',strtotime("+$day days",strtotime($value['date'])));//返程日期
            $return[$key]['create_time'] = date('Y-m-d',$value['creat_time']);//制作时间
            $return[$key]['submit_time'] = date('Y-m-d',$value['submit_time']);//发布时间
            $return[$key]['click_num'] = $value['click_num'];//出行城市
            if($value['theme'] == 1){
                $return[$key]['hd_img'] = 'http://www.dailuer.com/upload/portal/hd/hd'.$value['theme'].'.png';//出行城市
            }else{
                $return[$key]['hd_img'] = '';//出行城市
            }
            $img = DB::name('city_details')->field('more')->where(['city_id'=>$value['go_city_array'][0]->city_id])->find();
            $img = json_decode($img['more'],true);
            $return[$key]['img'] = cmf_get_image_preview_url($img[0]['url']);
        }
        return $return;
    }

    //行程概要
    public function overview(){
        $trip_id = input('post.trip_id');
        $trip_info= Db::name('trip_info')->where(array('trip_id'=>$trip_id))->find();
        if(!empty($trip_info)){
            $lastResult['adult']  = $trip_info['adult'];//成人人数
            $lastResult['children']  = $trip_info['children'];//儿童人数
            $lastResult['custom_title']  = $trip_info['custom_title'];//行程标题
            $lastResult['date']  = $trip_info['date'];//出行时间
            $lastResult['day_num']  = $trip_info['day_num'];//出行天书数
            $lastResult['departure_city']  = $trip_info['departure_city'];//出发城市
            $lastResult['return_city']  = $trip_info['return_city'];//返回城市
            $lastResult['hotel_num']  = $trip_info['hotelSum'];//酒店数量
            $traffic_money = Db::name('traffic_money')->where(array('trip_id'=>$trip_id))->find();
            if(isset($traffic_money))
            {
                $traffic = json_decode($traffic_money['traffic_money'],true);     //交通费用
                $train_num = 0;
                $flight_num = 0;
                foreach ($traffic as $key => $value) {
                    if($value['city_trc_name'] == '铁路'){
                        $train_num ++;
                    }else{
                        $flight_num ++;
                    }
                }
                $lastResult['train_num'] = $train_num;//火车次数
                $lastResult['flight_num'] = $flight_num;//飞机次数
            }else{
                $lastResult['train_num'] = 0;
                $lastResult['flight_num'] = 0;
            }
            $return = array('status'=>true,'msg'=>'请求成功','data'=>[$lastResult]);
        }else{
            $return = array('status'=>false,'msg'=>'行程不存在','data'=>array());
        }
        echo json_encode($return,JSON_UNESCAPED_UNICODE);
    }

    //行程总览
    public function tripInfo(){
        $trip_id = input('post.trip_id');
        // $trip_id = '13-1539568097';
        $plan_info = DB::name('plan_info')->where(['trip_id'=>$trip_id])->find();
        $trip_info= Db::name('trip_info')->where(array('trip_id'=>$trip_id))->find();

        $trip_name = $trip_info['trip_name'];//行程标题
        $message = '袋鹿旅行，自由行的必备工具';//内容
        $logo = 'http://www.dailuer.com/static/v1/img/tripinfoShare/prev1.png';//logo
        $url = 'http://'.$_SERVER['HTTP_HOST'].'/portal/itinerary/tripinfoshare.html?them='.$trip_info['uid'].'&trip='.$trip_id;//分享链接

        Db::name('trip_info')->where(array('trip_id'=>$trip_id))->update(['click_num'=>$trip_info['click_num']+1]);
        $go_city_array = json_decode($trip_info['go_city_array'],true);
        // print_r($go_city_array);
        $dis = array();//距离计算数据
        if(!empty($plan_info)){
            $schedufing = unserialize(base64_decode($plan_info['schedufing']));
            $schedufing = json_decode(json_encode($schedufing),true);
            foreach ($schedufing as $key => $value) {
                foreach ($value['day_arry'] as $key1 => $value1) {
                    $plan = array();
                    if(array_key_exists('one_city',$value1)){
                        $plan['start_city'] = $value1['one_city'];//出发城市
                        $plan['end_city'] = $value1['two_city'];//返回城市
                    }else{
                        $plan['start_city'] = $value['this_city'];//游玩城市
                        $plan['end_city'] = '';
                    }
                    // if(!empty($value1['hotel']['city'])){
                    //     $dis['hotel'] = [$value1['hotel']];//酒店
                    // }else{
                    //     $dis['hotel'] = [];//酒店
                    // }
                    // 
                     if(isset($value1['hotel']['city']) && !empty($value1['hotel']['city'])){
                        $dis['hotel'] = [$value1['hotel']];//酒店
                    }else{
                        $dis['hotel'] = [];//酒店
                    }
                    if(array_key_exists('day', $value1)){
                        // $plan['view'] = $value1['day'];//景点
                        $view_name = '';
                        $view_list = $value1['day'];
                        foreach($view_list as $key2 => &$value2){
                            $view_name .= $value2['this_name'].' - ';
                            $value2['lat'] = $value2['this_lat'];
                            $value2['lng'] = $value2['this_lng'];
                            $value2['view'] = 'view';
                            unset($value2['info']);
                        }
                        $plan['view_name'] = substr($view_name,0,strlen($view_name)-3);
                        $dis['view'] = $view_list;
                    }else{
                        $plan['view_name'] = '';//景点
                        $dis['view'] = array();
                    }
                    if(array_key_exists('eat', $value1)){
                        $value1['eat']['lat'] = $value1['eat']['latitude'];
                        $value1['eat']['lng'] = $value1['eat']['longitude'];
                        $dis['eat'][] = $value1['eat'];//餐饮
                    }else{
                        $dis['eat'] = array();
                    }
                    $plan['date'] = str_replace('.','/',$value1['date']);//日期
                    // $plan['hotel'][] = $value1['hotel'];//酒店
                    if(array_key_exists('eat', $value1)){
                        if(array_key_exists('store_name', $value1['eat'])){
                            $plan['shop'] = $value1['eat']['store_name'];
                        }else{
                            $plan['shop'] = '';
                        }
                    }else{
                        $plan['shop'] = '';
                    }
                    if(isset($value1['hotel']['hotel_name']))
                    {
                        $plan['hotel'] = $value1['hotel']['hotel_name'];
                    }
        
                    $data[] = $plan;
                    $dis_data[] = $dis;//距离
                }
            }

            foreach ($dis_data as $dis_key => $dis_value) {
                $dis_info = array_merge($dis_value['hotel'],$dis_value['view'],$dis_value['eat']);
                $len = count($dis_info);
                $sum = 0;
                foreach ($dis_info as $tkey => &$tvalue) {
                    if($tkey<$len-1){
                        $dis = getDistance($tvalue['lng'], $tvalue['lat'],$dis_info[$tkey+1]['lng'], $dis_info[$tkey+1]['lat'], 2);
                        $sum += $dis;
                    }
                }
                $distance[] = $sum;
            }
            foreach ($data as $dkey => &$dvalue) {
                foreach ($go_city_array as $gkey => $gvalue) {
                    if($dvalue['end_city'] == $gvalue['city_name']){
                        $dvalue['dis'] = $gvalue['dis'];
                        $dvalue['traffic'] = $gvalue['city_trc_name'];
                        break;
                    }else{
                        $dvalue['dis'] = '';
                        $dvalue['traffic'] = '';
                    }
                }
                $dvalue['dis'] = $dvalue['dis']+$distance[$dkey];
            }
            $return = array('status'=>true,'msg'=>'请求成功','trip_name'=>$trip_name,'message'=>$message,'logo'=>$logo,'url'=>$url,'data'=>$data);
        }else{
            $return = array('status'=>false,'msg'=>'行程不存在','trip_name'=>[],'message'=>[],'logo'=>[],'url'=>[],'data'=>[]);
        }
        echo json_encode($return,JSON_UNESCAPED_UNICODE);
    }

    //达人分享详情
    public function drTripDetail(){
        $trip_id = input('post.trip_id');
        $uid = input('post.uid');
        // $trip_id = '13-1539568097';
        $plan_info = DB::name('plan_info')->where(['trip_id'=>$trip_id])->find();
        $trip_info= Db::name('trip_info')->where(array('trip_id'=>$trip_id))->find();
        Db::name('trip_info')->where(array('trip_id'=>$trip_id))->setInc('click_num',1);
        $user = Db::name('customer')->where('uid',$trip_info['uid'])->find();
        $go_city_array = json_decode($trip_info['go_city_array'],true);
        if(!empty($plan_info)){
            $schedufing = unserialize(base64_decode($plan_info['schedufing']));
            $schedufing = json_decode(json_encode($schedufing),true);
            $plan = array();
            $sort_info = 'traffic,hotel,view,eat';
            $eat = [];
            $day_number = 0;
            $day_price = 0;
            $all_city = '';
            foreach ($schedufing as $key => $value) {
                if(array_key_exists('departure_city', $value)){
                    $all_city .= $value['departure_city'].'-';
                }
                $all_city .= $value['this_city'].'-';
                if(array_key_exists('return_city', $value)){
                    $all_city .= $value['return_city'];
                }
                foreach ($value['day_arry'] as $key1 => $value1) {
                    if(array_key_exists('one_city',$value1)){
                        $start_city = $value1['one_city'];//出发城市
                        $end_city = $value1['two_city'];//返回城市
                    }else{
                        $start_city = $value['this_city'];//游玩城市
                        $end_city = '';
                    }
                    $full_date = date("Y/m/d",strtotime("+$day_number day",strtotime($trip_info['date'])));;
                    $day_number = $day_number+1;
                    foreach ($go_city_array as $city_key => $city_value) {
                        if($city_value['city_name'] == $end_city){
                            $traffic['sort_info'] = $sort_info;
                            $traffic['start_city'] = $start_city;
                            $traffic['end_city'] = $end_city;
                            $traffic['full_date'] = $full_date;
                            $traffic['dis'] = $city_value['dis'];
                            $traffic['traffic_type'] = $city_value['city_trc_name'];
                            $traffic['flightTime'] = $city_value['flightTime'];
                            $traffic['trainTime'] = $city_value['trainTime'];
                            $traffic['trafficTime'] = $city_value['trafficTime'];
                            // $traffic['latitude'] = $city_value['position']['lat'];
                            // $traffic['longitude'] = $city_value['position']['lng'];
                             if(isset($city_value['position']['lat'])){
                                $traffic['latitude'] = $city_value['position']['lat'];
                                $traffic['longitude'] = $city_value['position']['lng'];
                            }
                            //一键制作的数据格式
                            if(isset($city_value['longitude'])){
                                $traffic['latitude'] = $city_value['longitude'];
                                $traffic['longitude'] = $city_value['longitude'];
                            }  
                            $plan['traffic'] = [$traffic];
                            break;
                        }else{
                            $plan['traffic'] = [['start_city'=>$start_city,'latitude' => '30.573095','longitude' => '104.066143','traffic_type'=>'']];
                            // $plan['traffic'] = [];
                        }
                    }
                    if(!empty($value1['hotel']['city'])){
                        $day_price += $value1['hotel']['LowRate'];
                        if(array_key_exists('city',$value1['hotel'])){
                            $value1['hotel']['city_name'] = $value1['hotel']['city'];
                            unset($value1['hotel']['city']);
                        }else{
                            $value1['hotel']['city_name'] = '';
                        }
                        if(!array_key_exists('StarRate',$value1['hotel'])){
                            $value1['hotel']['StarRate'] = 0;
                        }
                        $value1['hotel']['latitude'] = $value1['hotel']['lat'];
                        $value1['hotel']['longitude'] = $value1['hotel']['lng'];
                        $value1['hotel']['spot_image_url'] = $value1['hotel']['ThumbNailUrl'];
                        $value1['hotel']['spot_name'] = $value1['hotel']['hotel_name'];
                        $number = stripos($value1['hotel']['tel'],"、");
                        if($number>0){
                            $value1['hotel']['phone'] = substr($value1['hotel']['tel'],0,$number);
                        }
                        $value1['hotel']['map_type'] = 'hotel';
                        $value1['hotel']['date'] = $full_date;
                        unset($value1['hotel']['lat'],$value1['hotel']['lng'],$value1['hotel']['ThumbNailUrl']);
                        $plan['hotel'] = [$value1['hotel']];//酒店
                    }else{
                        $plan['hotel'] = [];//酒店
                    }
                    if(array_key_exists('day', $value1)){
                        foreach ($value1['day'] as $key2 => &$value2) {
                            $day_v = $value2;
                            $value2 = $value2['info'];
                            $value2['this_floor_index'] = $day_v['this_floor_index'];
                            $value2['this_tag_time'] = $day_v['this_tag_time'];
                            $value2['distance'] = $day_v['distance'];
                            $value2['map_type'] = 'view';
                            // print_r($value2);
                            if(array_key_exists('per_capita',$value2)){
                                $day_price += $value2['per_capita'];
                            }
                            if(array_key_exists('phone', $day_v)){
                                if($number = stripos($day_v['info']['phone'],",")){
                                    $number = $number;
                                }else{
                                    $number = stripos($day_v['info']['phone'],"；");
                                }
                            }else{
                                $number = '暂无';
                            }
                            if($number>0){
                                $value2['phone'] = substr($day_v['info']['phone'],0,$number);
                            }
                            if(array_key_exists('shopping_Introduction', $day_v['info'])){
                                $value2['spot_Introduction'] = $day_v['info']['shopping_Introduction'];
                            }
                            if(array_key_exists('court_Introduction', $day_v['info'])){
                                $value2['spot_Introduction'] = $day_v['info']['court_Introduction'];
                            }
                            if(array_key_exists('phone', $day_v['info'])){
                                $value2['audio_url'] = $this->qiniu($day_v['info']['spot_name']);
                            }else{
                                $value2['audio_url'] = '';
                            }
                        }
                        $plan['view'] = $value1['day'];//景点
                    }else{
                        $plan['view'] = array();//景点
                    }
                    $plan['eat'] = array();
                    if(array_key_exists('eat', $value1)){
                        if(!empty($value1['eat'])){
                            $day_price += $value1['eat']['per_capita'];
                            $picture =json_decode($value1['eat']['picture2'],true);
                            foreach($picture as $kk3 => &$picvalue){
                                //common.php中封装的图片url解析方法
                                $value1['eat']['spot_image_url'] = cmf_get_image_preview_url($picvalue['url']);
                                $value1['eat']['map_type'] = 'eat';
                                $value1['eat']['spot_name'] = $value1['eat']['store_name'];
                            }
                            unset($value1['eat']['picture2']);
                        }
                        $plan['eat'][] = $value1['eat'];//餐饮
                    }else{
                        $plan['eat'] = array();
                    }
                    $tr = array_merge($plan['traffic'],$plan['hotel'],$plan['view'],$plan['eat']);
                    $len = count($tr);
                    $traffic_dis = [];
                    $hotel_dis = [];
                    $view_dis = [];
                    $eat_dis = [];
                    foreach ($tr as $tkey => &$tvalue) {
                        if($tkey<$len-1){
                            $dis = getDistance($tvalue['longitude'], $tvalue['latitude'],$tr[$tkey+1]['longitude'], $tr[$tkey+1]['latitude'], 2);
                            $tr[$tkey+1]['dis'] = $dis;
                        }
                        if(array_key_exists('traffic_type',$tvalue)){
                            $traffic_dis[] = $tvalue;
                        }
                        if(array_key_exists('hotel_name',$tvalue)){
                            $hotel_dis[] = $tvalue;
                        }
                        if(array_key_exists('this_floor_index',$tvalue) && !array_key_exists('store_name',$tvalue)){
                            $view_dis[] = $tvalue;
                        }
                        if(array_key_exists('store_name',$tvalue)){
                            $eat_dis[] = $tvalue;
                        }
                    }
                    $plan['traffic'] = $traffic_dis;
                    $plan['hotel'] = $hotel_dis;
                    $plan['view'] = $view_dis;
                    $plan['eat'] = $eat_dis;
                    $data[] = $plan;
                }
            }
            $img = DB::name('city_details')->field('more')->where('city_name',$trip_info['departure_city'])->find();
            $img = json_decode($img['more'],true);
            $lastResult['id'] = $trip_info['id'];
             //本人是否已经复制过此行程单
            $rel = Db::name('trip_info')->where(array('uid'=>$uid,'p_trip_id'=>$trip_id))->find();
            if(empty($rel))
            {
                $lastResult['copy_status'] = 'no_copy';
            }else{
                $lastResult['copy_status'] = 'copied';
            }
            
            $lastResult['img'] = cmf_get_image_preview_url($img[0]['url']);
            $lastResult['user_name']  = $user['user_name'];//用户名
            $lastResult['head_port']  = strstr($user['head_port'],'http') ? $user['head_port'] :cmf_get_image_url($user['head_port']);//用户头像
            $lastResult['adult']  = $trip_info['adult'];//成人人数
            $lastResult['children']  = $trip_info['children'];//儿童人数
            $lastResult['title']  = $trip_info['custom_title'] ? $trip_info['custom_title'] :$trip_info['trip_name'];//行程标题
            $lastResult['date']  = $trip_info['date'];//出行时间
            $lastResult['day_num']  = $trip_info['day_num'];//出行天书数
            $lastResult['start_city']  = $trip_info['departure_city'];//出发城市
            $lastResult['end_city']  = $trip_info['return_city'];//返回城市
            $lastResult['hotel_num']  = $trip_info['hotelSum'];//酒店数量
            $traffic_money = Db::name('traffic_money')->where(array('trip_id'=>$trip_id))->find();
            $traffic_info = json_decode($traffic_money['traffic_money'],true);     //交通费用
            $train_num = 0;
            $flight_num = 0;
            $traffic_price = 0;
            foreach ($traffic_info as $k_m => $v_m) {
                $traffic_price += $v_m['price'];
                if($v_m['city_trc_name'] == '铁路'){
                    $train_num ++;
                }else{
                    $flight_num ++;
                }
            }
            $lastResult['train_num'] = $train_num;//火车次数
            $lastResult['flight_num'] = $flight_num;//飞机次数
            $all_price = $traffic_price+$day_price;
            $lastResult['all_price'] = $all_price;
            $comment_num = Db::name('comment')->where(['view_id'=>$trip_id,'type'=>'trip'])->count();
            $lastResult['comment_num'] = $comment_num;//评论数
            $lastResult['like_num'] = $trip_info['like_num'];//喜欢数
            $lastResult['click_num'] = $trip_info['click_num'];//喜欢数
            $lastResult['collect_num'] = $trip_info['collect_num'];//收藏数
            $like = Db::name('like')->where(['collect_uid'=>$uid,'trip_id'=>$trip_id,'like_type'=>'trip'])->value('id');
            $collect = Db::name('collect')->where(['collect_user'=>$uid,'collect_id'=>$trip_id,'collect_table'=>'trip'])->value('id');
            $lastResult['like'] = $like ? true : false;//当前用户是否已点赞
            $lastResult['collect'] = $collect ? true : false;//当前用户是否已收藏
            $lastResult['all_city'] = $all_city;//途径城市
            $lastResult['trip_name'] = $trip_info['trip_name'];//行程标题
            $lastResult['message'] = '袋鹿旅行，自由行的必备工具';//内容
            $lastResult['logo'] = 'http://www.dailuer.com/static/v1/img/tripinfoShare/prev1.png';//logo
            $lastResult['url'] = 'http://'.$_SERVER['HTTP_HOST'].'/portal/itinerary/tripinfoshare.html?them='.$trip_info['uid'].'&trip='.$trip_id;//分享链接
            $result = ['status'=>true,'msg'=>'请求成功','data'=>['info'=>$lastResult,'data'=>$data,'price'=>$all_price]];
        }else{
            $result = ['status'=>false,'msg'=>'行程不存在','data'=>[]];
        }
        //本人是否已经复制过此行程单
        $rel = Db::name('trip_info')->where(array('uid'=>$uid,'p_trip_id'=>$trip_id))->find();
        if(empty($rel))
        {
            $result['copy_status'] = 'no_copy';
        }else{
            $result['copy_status'] = 'copied';
        }
        echo json_encode($result,JSON_UNESCAPED_UNICODE);
    }

    //达人行程评论
    public function drComment(){
        $trip_id = input('post.trip_id');
        // $trip_id = '13-1539568097';
        $comment_list = Db::name('comment')->where(['view_id'=>$trip_id,'type'=>'trip'])->order('id desc')->select()->toArray();
        foreach ($comment_list as $comment_k => &$comment_v){
            $head_port = Db::name('customer')->field('head_port')->where('uid',$comment_v['user_id'])->find();
            $comment_v['head'] = strstr($head_port['head_port'],'http') ? $head_port['head_port'] : cmf_get_image_url($head_port['head_port']);
            $comment_v['spot_image_url'] = json_decode($comment_v['image_url']);
            unset($comment_v['image_url']);
        }
        echo json_encode(['status'=>true,'msg'=>'请求成功','data'=>$comment_list]);
    }
    //行程单天总览
    public function tripDetail(){
    	$trip_id = input('post.trip_id');
        $day = input('post.day');
    	$plan_info = DB::name('plan_info')->where(['trip_id'=>$trip_id])->find();
        $trip_info= Db::name('trip_info')->where(array('trip_id'=>$trip_id))->find();
        $go_city_array = json_decode($trip_info['go_city_array'],true);
      
        if(!empty($plan_info)){
            $schedufing = unserialize(base64_decode($plan_info['schedufing']));
            $plan_info['schedufing'] = json_decode(json_encode($schedufing),true);

            $plan = array();
            $plan['sort_info'] = 'traffic,hotel,view,eat';
            $plan['trip_name'] = $trip_info['trip_name'];//行程标题
            $plan['message'] = '袋鹿旅行，自由行的必备工具';//内容
            $plan['logo'] = 'http://www.dailuer.com/static/v1/img/tripinfoShare/prev1.png';//logo
            $plan['url'] = 'http://'.$_SERVER['HTTP_HOST'].'/portal/itinerary/tripinfoshare.html?them='.$trip_info['uid'].'&trip='.$trip_id;//分享链接
            $eat = [];
            $day_number = 0;
        	foreach ($plan_info['schedufing'] as $key => $value) {
                foreach ($value['day_arry'] as $key1 => $value1) {
                    if(array_key_exists('one_city',$value1)){
                        $plan['start_city'] = $value1['one_city'];//出发城市
                        $plan['end_city'] = $value1['two_city'];//返回城市
                    }else{
                        $plan['start_city'] = $value['this_city'];//游玩城市
                        $plan['end_city'] = '';
                    }
                    if(isset($value['city_id'])){
                        $plan['city_id'] = $value['city_id'];
                    }else{
                        $areaData = DB::name('Area')->where(['area_name'=>$value['this_city']])->field('area_id')->find();
                        $plan['city_id'] = $areaData['area_id'];
                    }
                    
                    $plan['city_name'] = $value['this_city'];

                    $plan['full_date'] = date("Y/m/d",strtotime("+$day_number day",strtotime($trip_info['date'])));
                    $day_number = $day_number+1;
                    $plan['date'] = str_replace('.','/',$value1['date']);//日期

                    foreach ($go_city_array as $city_key => $city_value) {
                        if($city_value['city_name'] == $plan['end_city']){
                            $traffic['dis'] = $city_value['dis'];
                            $traffic['traffic_type'] = $city_value['city_trc_name'];
                            $traffic['flightTime'] = $city_value['flightTime'];
                            $traffic['trainTime'] = $city_value['trainTime'];
                            $traffic['trafficTime'] = $city_value['trafficTime'];
                            if(isset($city_value['position']['lat'])){
                                $traffic['latitude'] = $city_value['position']['lat'];
                                $traffic['longitude'] = $city_value['position']['lng'];
                            }
                            //一键制作的数据格式
                            if(isset($city_value['longitude'])){
                                $traffic['latitude'] = $city_value['longitude'];
                                $traffic['longitude'] = $city_value['longitude'];
                            }  
                            $plan['traffic'] = [$traffic];
                            break;
                        }else{
                            $plan['traffic'] = [];
                        }
                    }
                    // if(!empty($value1['hotel']['city'])){
                    //     if(array_key_exists('city',$value1['hotel'])){
                    //         $value1['hotel']['city_name'] = $value1['hotel']['city'];
                    //         unset($value1['hotel']['city']);
                    //     }else{
                    //         $value1['hotel']['city_name'] = '';
                    //     }
                    //     if(!array_key_exists('StarRate',$value1['hotel'])){
                    //         $value1['hotel']['StarRate'] = 0;
                    //     }
                    //     $value1['hotel']['latitude'] = $value1['hotel']['lat'];
                    //     $value1['hotel']['longitude'] = $value1['hotel']['lng'];
                    //     $value1['hotel']['spot_image_url'] = $value1['hotel']['ThumbNailUrl'];
                    //     $value1['hotel']['spot_name'] = $value1['hotel']['hotel_name'];
                    //     $number = stripos($value1['hotel']['tel'],"、");
                    //     if($number>0){
                    //         $value1['hotel']['phone'] = substr($value1['hotel']['tel'],0,$number);
                    //     }
                    //     $value1['hotel']['map_type'] = 'hotel';
                    //     unset($value1['hotel']['lat'],$value1['hotel']['lng'],$value1['hotel']['ThumbNailUrl']);
                    //     $plan['hotel'] = [$value1['hotel']];//酒店
                    // }else{
                    //     $plan['hotel'] = [];//酒店
                    // }
                    // 
        
                   if(isset($value1['hotel']['city']) && !empty($value1['hotel']['city'])){
                        if(array_key_exists('city',$value1['hotel'])){
                            $value1['hotel']['city_name'] = $value1['hotel']['city'];
                            unset($value1['hotel']['city']);
                        }else{
                            $value1['hotel']['city_name'] = '';
                        }
                        if(!array_key_exists('StarRate',$value1['hotel'])){
                            $value1['hotel']['StarRate'] = 0;
                        }
                        $value1['hotel']['latitude'] = $value1['hotel']['lat'];
                        $value1['hotel']['longitude'] = $value1['hotel']['lng'];
                        $value1['hotel']['spot_image_url'] = $value1['hotel']['ThumbNailUrl'];
                        $value1['hotel']['spot_name'] = $value1['hotel']['hotel_name'];
                        $number = stripos($value1['hotel']['tel'],"、");
                        if($number>0){
                            $value1['hotel']['phone'] = substr($value1['hotel']['tel'],0,$number);
                        }
                        $value1['hotel']['map_type'] = 'hotel';
                        unset($value1['hotel']['lat'],$value1['hotel']['lng'],$value1['hotel']['ThumbNailUrl']);
                        $plan['hotel'] = [$value1['hotel']];//酒店
                    }else{
                        $plan['hotel'] = [];//酒店
                    }
      
                    //////
                    if(array_key_exists('day', $value1)){
                        // print_r($value1);
                        foreach ($value1['day'] as $key2 => &$value2) {
                            $day_v = $value2;
                            $value2 = $value2['info'];
                            $value2['this_floor_index'] = $day_v['this_floor_index'];
                            //之前手动添加的景点没有city_id
                            if(!isset($value2['city_id'])){
                                $value2['city_id'] = $plan['city_id'];
                                $value2['city_name'] = $plan['city_name'];
                            }
                            $value2['this_tag_time'] = $day_v['this_tag_time'];
                             if(isset($day_v['distance'])){
                                $value2['distance'] = $day_v['distance'];
                            }else{
                                $value2['distance'] = '';
                            }

                            $value2['map_type'] = 'view';
                            if(array_key_exists('phone', $day_v)){
                                if($number = stripos($day_v['info']['phone'],",")){
                                    $number = $number;
                                }else{
                                    $number = stripos($day_v['info']['phone'],"；");
                                }
                            }else{
                                $number = '暂无';
                            }
                            if($number>0){
                                $value2['phone'] = substr($day_v['info']['phone'],0,$number);
                            }
                            if(array_key_exists('phone', $day_v['info'])){
                                $value2['audio_url'] = $this->qiniu($day_v['info']['spot_name']);
                            }else{
                                $value2['audio_url'] = '';
                            }
                        }
                        $plan['view'] = $value1['day'];//景点

                    }else{
                        $plan['view'] = array();//景点
                    }
  
                    $plan['eat'] = array();
                    if(array_key_exists('eat', $value1)){
                        if(!empty($value1['eat'])){
                            $picture =json_decode($value1['eat']['picture2'],true);
                            foreach($picture as $kk3 => &$picvalue){
                                //common.php中封装的图片url解析方法
                                $value1['eat']['spot_image_url'] = cmf_get_image_preview_url($picvalue['url']);
                                $value1['eat']['map_type'] = 'eat';
                                $value1['eat']['spot_name'] = $value1['eat']['store_name'];
                            }
                            unset($value1['eat']['picture2']);
                        }
        			    $plan['eat'][] = $value1['eat'];//餐饮
                    }else{
                        $plan['eat'] = array();
                    }
                    $map = input('post.map') ? input('post.map') : '';
                    if(!empty($map)){
                        $all[] = array_merge($plan['hotel'],$plan['view'],$plan['eat']);
                    }
                    $data[] = $plan;
                }
            }

            if(!empty($map)){
                exit(json_encode(array('status'=>true,'msg'=>'请求成功','data'=>$all[$day])));
            }

            $day_data = $data[$day];
            $tr = array_merge($day_data['traffic'],$day_data['hotel'],$day_data['view'],$day_data['eat']);
            $len = count($tr);
            $traffic_dis = [];
            $hotel_dis = [];
            $view_dis = [];
            $eat_dis = [];
            foreach ($tr as $tkey => &$tvalue) {
                if($tkey<$len-1){
                    $dis = getDistance($tvalue['longitude'], $tvalue['latitude'],$tr[$tkey+1]['longitude'], $tr[$tkey+1]['latitude'], 2);
                    $tr[$tkey+1]['dis'] = $dis;
                }
                if(array_key_exists('traffic_type',$tvalue)){
                    $traffic_dis[] = $tvalue;
                }
                if(array_key_exists('hotel_name',$tvalue)){
                    $hotel_dis[] = $tvalue;
                }
                if(array_key_exists('this_floor_index',$tvalue) && !array_key_exists('store_name',$tvalue)){
                    if($tvalue['this_floor_index'] === ''){   //在pc端手动添加的元素
                        $tvalue['this_floor_index'] = -2;
                        $tvalue['attr_score'] = 9.8;
                        $tvalue['type'] = '自定义景点';
                    }
                    if($tvalue['this_floor_index'] === -2){   //在app端手动添加的元素
                        $tvalue['type'] = '自定义景点';
                        $tvalue['attr_score'] = 9.8;
                    }
                    $view_dis[] = $tvalue;
                }
                if(array_key_exists('store_name',$tvalue)){
                    $eat_dis[] = $tvalue;
                }
            }
            $img = DB::name('city_details')->field('more')->where('city_name',$trip_info['departure_city'])->find();
            $img = json_decode($img['more'],true);
            $day_data['image'] = cmf_get_image_preview_url($img[0]['url']);
            $day_data['traffic'] = $traffic_dis;
            $day_data['hotel'] = $hotel_dis;
            $day_data['view'] = $view_dis;
            $day_data['eat'] = $eat_dis;
            $return = array('status'=>true,'msg'=>'请求成功','data'=>$day_data);
        }else{
            $return = array('status'=>false,'msg'=>'行程不存在','data'=>[]);
        }
        echo json_encode($return,JSON_UNESCAPED_UNICODE);
    }

    //酒店详情
    public function hotelDetail(){
        $hotel_id = input('post.hotel_id');
        $date = input('post.date');
        $arrival_date = str_replace('/', '-', $date);
        if($arrival_date < date('Y-m-d',time())){
            $arrival_date = date('Y-m-d',time());
        }
        $departure_date = date('Y-m-d',strtotime('+1 day',strtotime($arrival_date)));
        $time = time();
        $data = json_encode(array(
            'Version'=>'1.32',
            'Local'=>'zh_CN',
            'Request'=>array(
                'ArrivalDate'=>$arrival_date,
                'DepartureDate'=>$departure_date,
                'HotelIds'=>$hotel_id,
                'Options'=>'1,2,3,4,8',
                'PaymentType'=>'All'
            )
        ));
        $signature = md5($time.md5($data.'2dfff541a55d28fc7ddecd0be2920a68').'7da0f3f5ced31dcb2a4996b9dfc6f36b');
        $data = urlencode($data);
        $file_contents = file_get_contents("http://api.elong.com/rest?format=json&method=hotel.detail&user=21b5b1dbbc33412cbc2c538de927af4e&timestamp=$time&signature=$signature&data=$data");
        $data = json_decode($file_contents,true);
        if(empty($data['Result'])){
            exit(json_encode(array('status'=>false,'msg'=>'酒店数据为空','data'=>[])));
        }
        $data = $data['Result']['Hotels']['0'];
        if(!array_key_exists('Facilities',$data)){
            $facilities = '';
        }else{
            $facilities = action('Store/facilities',[$data['Facilities']]);
        }
        $hotel_detail = $data['Detail'];
        $hotel_detail['Score'] = substr(number_format($hotel_detail['Review']['Score']*5/100,2),0,-1);
        $hotel_detail['facilities'] = $facilities;
        $hotel_detail['comment'] = $this->loadComment(null,'hotel',$hotel_id);
        $high_pic_arr = array();
        foreach ($data['Images'] as $key2 => $value2) {
            array_push($high_pic_arr,$value2['Locations']['3']['Url']);
            $hotel_detail['highImage'] = $high_pic_arr;
        }
        // print_r($hotel_detail);exit;
        $return = array('status'=>true,'msg'=>'请求成功','data'=>$hotel_detail);
        echo json_encode($return,JSON_UNESCAPED_UNICODE);

    }
    //七牛
    public function qiniu($name){
        // 用于签名的公钥和私钥
        $accessKey = 'vbYc94XHTg28x9Xd_xY9uCk1TztEGJpWyzRTqKAZ';
        $secretKey = 'YKZkI5t_yExwLgRP1aVr5VnFuzk9hJyImhbVk7sg';
        // 初始化签权对象
        $auth = new Auth($accessKey, $secretKey);
        $bucket = 'yinpin';
        $key = $name.'.mp3';
        $config = new \Qiniu\Config();
        $bucketManager = new \Qiniu\Storage\BucketManager($auth, $config);
        list($fileInfo, $err) = $bucketManager->stat($bucket, $key);
        if ($fileInfo) {
            return 'http://yinpin.5199yl.com/'.$key.'?'.rand(0,1000);
        } else {
            return '';
        }
    }

    //电子围栏
    public function enclosure(){
        $id = input('post.id');
        // $id = 1485;
        $type = input('post.type');
        $spot_name = input('post.spot_name');
        $enclosure = Db::name('Amap')->field('coord,name')->where(['view_id'=>$id])->find();
        if($enclosure){
            $coord = json_decode($enclosure['coord']);
        }else{
            $coord = [];
        }
        // $data = ['enclosure'=>[],'yinpin'=>''];
        // $yinpin = $this->qiniu($enclosure['name']);
        $yinpin = $this->qiniu($spot_name);
        if(!$yinpin){
            $yinpin = '';
        }
        $data = ['enclosure'=>$coord,'yinpin'=>$yinpin];
        $msg = '请求成功';
        echo json_encode(['status'=>true,'msg'=>$msg,'data'=>$data],JSON_UNESCAPED_UNICODE);
    }

    //附近推荐
    public function recom(){
        $longitude1 = input('post.lng');
        $latitude1 = input('post.lat');
        $city_id = input('post.city_id');
        $view_name = input('post.view_name');
        $type = input('post.type');

        // $type = 'view';
        // $longitude1 = '120.1573150000';
        // $latitude1 = '30.2398060000';
        // $city_id = '3134';
        // ① 附近推荐景点
        if($type == 'view'){
            $nature = Db::name('Nature_absture')->field(['*'," 1 as spot_type","'0' as this_floor_index"])->where(array('city_id'=>$city_id))->select()->toArray();
            $cultural = Db::name('Cultural_spot')->field(['*'," 2 as spot_type","'5' as this_floor_index"])->where(array('city_id'=>$city_id))->select()->toArray();
            $night = Db::name('night')->field(['*'," 3 as spot_type","'2' as this_floor_index"])->where(array('city_id'=>$city_id))->select()->toArray();
            $data = array_merge($nature,$cultural,$night);
            if($data){
                foreach($data as $key=>&$city_value){
                    //适玩季节
                    if(isset($city_value['suit_season']) && !empty($city_value['suit_season']))
                    {
                        if($city_value['suit_season'] == '1,2,3,4,5,6,7,8,9,10,11,12')
                        {
                            $city_value['suit_season'] = '1-12月';
                        }else{
                            if(strstr($city_value['suit_season'], '月')){
                                if($city_value['suit_season'] == '-月'){
                                    $city_value['suit_season'] = '暂无';
                                }else{
                                    $city_value['suit_season'] = $city_value['suit_season'];
                                }
                            }else{
                                $city_value['suit_season'] = substr($city_value['suit_season'],0,strpos($city_value['suit_season'], ',')).'-'.trim(strrchr($city_value['suit_season'], ','),',').'月';  
                            }
                        }
                    }else{
                        $city_value['suit_season'] = '暂无';
                    }
                    $city_value['business_hours'] = '';//景点开放时间暂无为空
                    $lo = $city_value['longitude'];
                    $la= $city_value['latitude'];
                    //调用common.php 中的 getDistance方法计算两个地理位置之间的距离
                    $distance = getDistance($longitude1, $latitude1, $lo, $la, 1,0);
                    if($distance > 10000 ){
                        unset($data[$key]);
                    }else{
                        $city_value['distance'] = $distance.'米';
                    }
                    if(!empty($city_value['pic'])){
                        $pic =json_decode($city_value['pic'],true);
                        if(is_array($pic)){
                            foreach($pic as $kk => $pic_value){
                                //common.php中封装的图片url解析方法
                                if(!empty($pic_value['url'])){
                                    $city_value['img_url'] = cmf_get_image_preview_url($pic_value['url']); 
                                }
                            }
                        }
                        unset($city_value['pic']);
                        unset($city_value['picture2']); 
                        $city_value['introduction'] = htmlchars($city_value['spot_Introduction']);
                        unset($city_value['spot_Introduction']); 
                        //适玩时间
                        $city_value['tag_time'] = $this->play_time($city_value['play_time']);  //时间统一成小时
                        $city_value['speech'] = '';
                        $city_value['guide'] = '';
                        $city_value['view_type'] = '';
                        $city_value['business_hours'] = '';
                    }
                }
                $data = $this->RecomSort(array_merge($data));
                if(empty($data)){
                    exit(json_encode(array('status'=>false,'msg'=>'附近无推荐景点','data'=>[]),JSON_UNESCAPED_UNICODE));
                }
            }
        }elseif($type == 'food'){
            // ② 附近推荐美食
            $store_data = Db::name('Store_info')->where(array('city_id'=>$city_id))->select();
            $data = json_decode($store_data,true);
            if($data){
                foreach($data as $key2=>&$store_value){
                    $store_value['spot_name'] = $store_value['store_name'];
                    $long = $store_value['longitude'];
                    $lat= $store_value['latitude'];
                    //调用common.php 中的 getDistance方法计算两个地理位置之间的距离
                    $distance2 = getDistance($longitude1, $latitude1, $long, $lat, 1,0);
                    if($distance2 > 10000 ){
                        unset($data[$key2]);
                    }else{
                        $store_value['distance'] = $distance2.'米';
                    }
                    $image =json_decode($store_value['pic'],true);
                    foreach($image as $kk2 => &$pic_value){
                        //common.php中封装的图片url解析方法
                        $store_value['img_url'] = cmf_get_image_preview_url($pic_value['url']); 
                    }
                    unset($store_value['pic'],$store_value['store_name'],$store_value['picture2']);
                    $store_value['introduction'] = htmlchars($store_value['store_Introduction']);
                    unset($store_value['store_Introduction']); 
                }
                $data = $this->RecomSort(array_merge($data));
                if(empty($data)){
                    exit(json_encode(array('status'=>false,'msg'=>'附近无推荐美食','data'=>[]),JSON_UNESCAPED_UNICODE));
                }
            }
        }elseif($type == 'shop'){
            // ③ 附近推荐购物
            $shop_data = Db::name('shopping_streets')->where(array('city_id'=>$city_id))->select();
            $data = json_decode($shop_data,true);
            if($data){
                foreach($data as $key3=>&$shop_value){
                    $shop_value['spot_name'] = $shop_value['shopping_name'];
                    $longitu = $shop_value['longitude'];
                    $latitu= $shop_value['latitude'];
                    //调用common.php 中的 getDistance方法计算两个地理位置之间的距离
                    $distance3 = getDistance($longitude1, $latitude1, $longitu, $latitu, 1,0);
                    if($distance3 > 10000 ){
                        unset($data[$key3]);
                    }else{
                        $shop_value['distance'] = $distance3.'米';
                    }
                    if($shop_value['picture2']){
                        $picture =json_decode($shop_value['picture2'],true);
                        foreach($picture as $kk3 => &$picvalue){
                            //common.php中封装的图片url解析方法
                            $shop_value['img_url'] = cmf_get_image_preview_url($picvalue['url']);
                        }
                    }else{
                        $shop_value['img_url'] = '';
                    }
                    unset($shop_value['pic'],$shop_value['shopping_name'],$shop_value['picture2']);
                    $shop_value['introduction'] = htmlchars($shop_value['shopping_Introduction']);
                    unset($shop_value['shopping_Introduction']); 
                    //适玩时间
                    $shop_value['tag_time'] = $this->play_time($shop_value['shopping_time']);  //时间统一成小时
                }
                $data = $this->RecomSort(array_merge($data));
                if(empty($data)){
                    exit(json_encode(array('status'=>false,'msg'=>'附近无推荐购物','data'=>[]),JSON_UNESCAPED_UNICODE));
                }
            }
        }else{
            $city = input('post.city').'市';
            $date = input('post.arrival_date');
            // $date = '08/29';
            // $city = '杭州市';
            $arrival_date = date('Y',time()).'-'.str_replace('/', '-', $date);
            $departure_date = date('Y-m-d',strtotime('+1 day',strtotime($arrival_date)));
            if($arrival_date < date('Y-m-d',time())){
                exit(json_encode(array('status'=>false,'msg'=>'暂无酒店','data'=>[]),JSON_UNESCAPED_UNICODE));
            }
            $query_text = input('post.sopt');
            $return = action('Store/hotel',['city'=>$city,'arrival_date'=>$arrival_date,'departure_date'=>$departure_date,'query_text'=>$query_text]);
            if(!empty($return['hotel'])){
                foreach ($return['hotel'] as $key => $value) {
                    $data[] = $value['Detail'];
                }
            }else{
                exit(json_encode(array('status'=>false,'msg'=>'暂无酒店','data'=>[]),JSON_UNESCAPED_UNICODE));
            }
        }
        if(!empty($data)){
            $return = array('status'=>true,'msg'=>'请求成功','data'=>array_merge($data));
        }else{
            $return = array('status'=>false,'msg'=>'附近无推荐景点','data'=>[]);
        }
        echo json_encode(array_merge($return),JSON_UNESCAPED_UNICODE);
    }

    //快速排序
    public function RecomSort($array){
        if(!isset($array[1])){
            return $array;
        }
        $mid = str_replace('米','',$array[0]['distance']); //获取一个用于分割的关键字，一般是首个元素
        $leftArray = array(); 
        $rightArray = array();
        foreach($array as $v){
            if((int)str_replace('米','',$v['distance']) > $mid){
                $rightArray[] = $v;  //把比$mid大的数放到一个数组里
            }
            if((int)str_replace('米','',$v['distance']) < $mid){
                $leftArray[] = $v;   //把比$mid小的数放到另一个数组里
            }
        }
        $leftArray = $this->RecomSort($leftArray); //把比较小的数组再一次进行分割
        $leftArray[] = $array[0];        //把分割的元素加到小的数组后面，不能忘了它哦
        $rightArray = $this->RecomSort($rightArray);  //把比较大的数组再一次进行分割
        return array_merge($leftArray,$rightArray);  //组合两个结果
    }

    public function play_time($play_time){
        if(strstr($play_time,'天'))
        {
            $time =  mb_strcut($play_time,0,1,'utf-8') * 10;
        }else{
            $time = mb_strcut($play_time,0,3,'utf-8');
        }
        return $time;
    }

    //景区详情
    public function spotInfo(){
        $type = input('post.type');
        $id = input('post.id');
        $city_id = input('post.city_id');
        $spot_name = input('post.spot_name');
        // $id = '50';
        // $spot_name = '千岛湖中心湖区';
        if($type=='0'){
            //景区详情
            $spot_info = Db::name('Nature_absture')->where(array('city_id'=>$city_id,'spot_name'=>$spot_name))->find();//景区详情
            if(!empty($spot_info)){
                if(strstr($spot_info['phone'],';'))
                {
                    $spot_info['phone'] = substr($spot_info['phone'],0,strpos($spot_info['phone'], ';'));
                }
                $spot_info['release_time'] = date('Y-m-d', $spot_info['update_time']);
                if($spot_info['suit_season'] == '1,2,3,4,5,6,7,8,9,10,11,12')
                {
                    $spot_info['suit_season'] = '1-12月';
                }else{
                    $spot_info['suit_season'] = substr( $spot_info['suit_season'],0,strpos($spot_info['suit_season'], ',')).'-'.trim(strrchr($spot_info['suit_season'], ','),',').'月';  
                }
                //景点封面图片 cover
                if(!empty($spot_info['picture2'])){
                    $cover_pic = json_decode($spot_info['picture2'],true);
                    foreach($cover_pic as $k => &$pic_value){
                        //common.php中封装的图片url解析方法
                        $spot_info['image_url'][$k]= cmf_get_image_preview_url($pic_value['url']); 
                        $spot_info['image_name'][$k]= substr($pic_value['name'],0,strpos($pic_value['name'], '.'));
                        $pic['url'] = $spot_info['image_url'][$k];
                        $pic['name'] = $spot_info['image_name'][$k];
                        $spot_info['image_url'][$k] = $pic;
                    }
                }else{
                    $spot_info['image_url'] = [['url'=>'','name'=>'']];
                }
                unset($spot_info['picture2'],$spot_info['image_name']);
                $spot_info['business_hours'] = $spot_info['suit_time'];
                //文字描述中的html标签转化成实体
                $spot_info['introduction'] = htmlchars($spot_info['spot_Introduction']);
                $spot_info['tickets'] = htmlchars($spot_info['attractions_tickets']);
                $spot_info['introduction'] = str_replace('&nbsp;', "", $spot_info['introduction']);
                $spot_info['description'] = htmlchars($spot_info['other_description']);
                unset($spot_info['spot_Introduction'],$spot_info['attractions_tickets'],$spot_info['spot_Introduction']);
                $spot_info['comment'] = $this->loadComment(null,0,$id);
                // $this->recom($type='view',$city_id='3134');
                $view_list = Db::name('Cultural_spot')->where(array('scenic_name'=>$spot_name))->select()->toArray();//景点详情
                if(!empty($view_list)){
                    foreach ($view_list as $key => $value) {
                        //景点封面图片 cover
                        $image =json_decode($value['pic'],true);
                        // print_r($image);exit;
                        if(is_array($image)){
                            foreach($image as &$img_value){
                                //common.php中封装的图片url解析方法
                                $view_pic = cmf_get_image_preview_url($img_value['url']);   
                            }
                        }else{
                            $view_pic = cmf_get_image_preview_url($image['url']); 
                        }
                        $view['id'] = $value['id'];
                        $view['spot_name'] = $value['spot_name'];
                        $view['image_url'] = $view_pic;
                        $view_data[] = $view; 
                    }
                }else{
                    $view_data = array();
                }
                $data = ['spot'=>$spot_info,'view'=>$view_data];
                $return = array('status'=>true,'msg'=>'请求成功','data'=>$data);
            }else{
                $return = array('status'=>false,'msg'=>'暂无数据','data'=>[]);
            }
        }elseif($type=='1'){
            //本土体验详情
            // $spot_name = '宋城千古情';
            // $city_id = 3134;
            $local_detail = Db::name('Describe')->where(['spot_name'=>$spot_name,'city_id'=>$city_id])->find();
            if(!empty($local_detail)){
                if(strstr($local_detail['phone'],';'))
                {
                    $local_detail['phone'] = substr($local_detail['phone'],0,strpos($local_detail['phone'], ';'));
                }
                $local_detail['release_time'] = date('Y-m-d', $local_detail['update_time']);
                if($local_detail['suit_season'] == '1,2,3,4,5,6,7,8,9,10,11,12')
                {
                    $local_detail['suit_season'] = '1-12月';
                }else{
                    $local_detail['suit_season'] = substr( $local_detail['suit_season'],0,strpos($local_detail['suit_season'], ',')).'-'.trim(strrchr($local_detail['suit_season'], ','),',').'月';  
                }
                //景点封面图片 cover
                if(!empty($local_detail['picture2'])){
                    $cover_pic = json_decode($local_detail['picture2'],true);
                    foreach($cover_pic as $k => &$pic_value){
                        $local_detail['image_url'][$k]= cmf_get_image_preview_url($pic_value['url']); 
                        $local_detail['image_name'][$k]= substr($pic_value['name'],0,strpos($pic_value['name'], '.'));
                        $pic['url'] = $local_detail['image_url'][$k];
                        $pic['name'] = $local_detail['image_name'][$k];
                        $local_detail['image_url'][$k] = $pic;
                    }
                    unset($local_detail['picture2']);
                    unset($local_detail['image_name']);
                }else{
                    $local_detail['image_url'] = [['url'=>'','name'=>'']];
                }
                $local_detail['business_hours'] = $local_detail['suit_time'];
                //文字描述中的html标签转化成实体
                $local_detail['tickets'] = htmlchars($local_detail['attractions_tickets']);
                $local_detail['introduction'] = htmlchars($local_detail['spot_Introduction']);
                $local_detail['introduction'] = str_replace('&nbsp;', "", $local_detail['introduction']);
                $local_detail['qita_description'] = htmlchars($local_detail['other_description']);
                unset($local_detail['attractions_tickets'],$local_detail['spot_Introduction'],$local_detail['other_description'],$local_detail['pic']);
                $local_detail['comment'] = $this->loadComment(null,1,$id);
                $return = array('status'=>true,'msg'=>'请求成功','data'=>['spot'=>$local_detail]);
            }else{
                $return = array('status'=>false,'msg'=>'暂无数据','data'=>array());
            }
        }elseif($type=='2'){
            //醉美夜色详情
            // $spot_name = '西湖苏堤';
            // $city_id = 3134;
            $night_detail = Db::name('Night')->where(array('spot_name'=>$spot_name,'city_id'=>$city_id))->find();
            if(!empty($night_detail)){
                if(strstr($night_detail['phone'],';'))
                {
                    $night_detail['phone'] = substr($night_detail['phone'],0,strpos($night_detail['phone'], ';'));
                }
                $night_detail['release_time'] = date('Y-m-d', $night_detail['update_time']);
                if($night_detail['suit_season'] == '1,2,3,4,5,6,7,8,9,10,11,12')
                {
                    $night_detail['suit_season'] = '1-12月';
                }else{
                    $night_detail['suit_season'] = substr( $night_detail['suit_season'],0,strpos($night_detail['suit_season'], ',')).'-'.trim(strrchr($night_detail['suit_season'], ','),',').'月';  
                }
                //景点封面图片 cover
                if(!empty($night_detail['picture2'])){
                    $cover_pic = json_decode($night_detail['picture2'],true);
                    foreach($cover_pic as $k => &$pic_value){
                        $night_detail['image_url'][$k]= cmf_get_image_preview_url($pic_value['url']); 
                        $night_detail['image_name'][$k]= substr($pic_value['name'],0,strpos($pic_value['name'], '.'));
                        $pic['url'] = $night_detail['image_url'][$k];
                        $pic['name'] = $night_detail['image_name'][$k];
                        $night_detail['image_url'][$k] = $pic;
                    }
                    unset($night_detail['picture2']);
                    unset($night_detail['image_name']);
                }else{
                    $night_detail['image_url'] = [['url'=>'','name'=>'']];
                }
                $night_detail['business_hours'] = $night_detail['suit_time'];
                //文字描述中的html标签转化成实体
                $night_detail['tickets'] = htmlchars($night_detail['attractions_tickets']);
                $night_detail['introduction'] = htmlchars($night_detail['spot_Introduction']);
                $night_detail['introduction'] = str_replace('&nbsp;', "", $night_detail['introduction']);
                $night_detail['qita_description'] = htmlchars($night_detail['other_description']);
                unset($night_detail['attractions_tickets'],$night_detail['spot_Introduction'],$night_detail['other_description'],$night_detail['pic']);
                $local_detail['comment'] = $this->loadComment(null,2,$id);
                $return = array('status' =>true,'msg'=>'请求成功','data'=>['spot'=>$night_detail]);
            }else{
                $return = array('status' =>false,'msg'=>'暂无数据','data'=>array());
            }
            // print_r($night_detail);
        }elseif($type=='3'){
            $court_info = Db::name('Food_court')->where(array('city_id'=>$city_id,'food_court_name'=>$spot_name))->find();
            //景点封面图片 cover
            if(!empty($court_info)){
                $court_info['spot_name'] = $court_info['food_court_name'];
                $court_info['play_time'] = $court_info['meal_time'];
                unset($court_info['food_court_name'],$court_info['meal_time']);
                if(!empty($court_info['picture2'])){
                    $cover_pic = json_decode($court_info['picture2'],true);
                    foreach($cover_pic as $k => &$pic_value){
                        $court_info['image_url'][$k]= cmf_get_image_preview_url($pic_value['url']); 
                        $court_info['image_name'][$k]= substr($pic_value['name'],0,strpos($pic_value['name'], '.'));
                        $pic['url'] = $court_info['image_url'][$k];
                        $pic['name'] = $court_info['image_name'][$k];
                        $court_info['image_url'][$k] = $pic;
                    }
                    unset($court_info['picture2'],$court_info['image_name']);
                }
                //文字描述中的html标签转化成实体
                $court_info['introduction'] = htmlchars($court_info['court_Introduction']);
                $court_info['introduction'] = str_replace('&nbsp;', "", $court_info['introduction']);
                $court_info['qita_description'] = htmlchars($court_info['other_description']);
                unset($court_info['court_Introduction'],$court_info['other_description'],$court_info['pic']);
                $court_info['release_time'] = date('Y-m-d', $court_info['update_time']);
                $return = array('status' =>true,'msg'=>'请求成功','data'=>['spot'=>$court_info]);
            }else{
                $return = array('status' =>false,'msg'=>'暂无数据','data'=>array());
            }
        }elseif($type=='4'){
            // $name = '武林广场'; 
            $shop_detail = Db::name('shopping_streets')->where(['shopping_name'=>$spot_name])->find();
            if(!empty($shop_detail)){
                $shop_detail['spot_name'] = $shop_detail['shopping_name'];
                $shop_detail['play_time'] = $shop_detail['shopping_time'];
                unset($shop_detail['shopping_name'],$shop_detail['shopping_time']);
                $shop_detail['release_time'] = date('Y-m-d', $shop_detail['update_time']);
                //景点封面图片 cover
                if(!empty($shop_detail['picture2'])){
                    $cover_pic = json_decode($shop_detail['picture2'],true);
                    foreach($cover_pic as $k => &$pic_value){
                        $shop_detail['image_url'][$k]= cmf_get_image_preview_url($pic_value['url']); 
                        $shop_detail['image_name'][$k]= substr($pic_value['name'],0,strpos($pic_value['name'], '.'));
                        $pic['url'] = $shop_detail['image_url'][$k];
                        $pic['name'] = $shop_detail['image_name'][$k];
                        $shop_detail['image_url'][$k] = $pic;
                    }
                    unset($shop_detail['picture2'],$shop_detail['image_name']);
                }else{
                    $shop_detail['image_url'] = [['url'=>'','name'=>'']];
                }
                //文字描述中的html标签转化成实体
                $shop_detail['introduction'] = htmlchars($shop_detail['shopping_Introduction']);
                $shop_detail['introduction'] = str_replace('&nbsp;', "", $shop_detail['introduction']);
                $shop_detail['qita_description'] = htmlchars($shop_detail['other_description']);
                unset($shop_detail['shopping_Introduction'],$shop_detail['other_description'],$shop_detail['pic']);
                $shop_detail['comment'] = $this->loadComment(null,'shop',$id);
                /*** 特色商品 ***/
                $goodinfo_list = Db::name('goods_info')->where(array('type'=>$shop_detail['type'],'store_name'=>$spot_name))->select()->toArray();
                foreach($goodinfo_list as $key2=>&$goodinfo){
                    if(!empty($goodinfo['pic'])){
                        $cover_pic = json_decode($goodinfo['pic'],true);
                        foreach($cover_pic as $k => &$pic_value){
                            $goodinfo['image_url']= cmf_get_image_preview_url($pic_value['url']); 
                        }
                        unset($goodinfo['pic']);
                    }
                   
                }
                $result = array();
                $result['spot'] = $shop_detail;    //景区里的简要介绍
                $result['view'] = $goodinfo_list;   //本土特产、土特产店、购物商圈中的特色商品
                $return = array('status' =>true,'msg'=>'请求成功','data'=>$result);
            }else{
                $return = array('status' =>false,'msg'=>'店铺数据为空','data'=>[]);
            }
        }
        echo json_encode($return,JSON_UNESCAPED_UNICODE);
    }

    //景点详情
    public function viewInfo(){
        $id = input('post.id');
        $spot_name = input('post.spot_name');
        // $spot_name = '梅峰岛';
        // $id = '9';
        $spot_info = Db::name('Cultural_spot')->where(['id'=>$id,'spot_name'=>$spot_name])->find();
        if(!empty($spot_info)){
            // print_r($spot_info);exit;
            $spot_info['release_time'] = date('Y-m-d', $spot_info['update_time']);
            //景点封面图片 cover
            $cover_pic = json_decode($spot_info['picture2'],true);
            foreach($cover_pic as $k => &$pic_value){
                $spot_info['image_url'][$k]= cmf_get_image_preview_url($pic_value['url']); 
                $spot_info['image_name'][$k]= substr($pic_value['name'],0,strpos($pic_value['name'], '.'));
                $pic['url'] = $spot_info['image_url'][$k];
                $pic['name'] = $spot_info['image_name'][$k];
                $spot_info['image_url'][$k] = $pic;
            }
            unset($spot_info['picture2']);
            unset($spot_info['image_name']);
            
            //文字描述中的html标签转化成实体
            $spot_info['introduction'] = htmlchars($spot_info['spot_Introduction']);
            unset($spot_info['spot_Introduction']);
            $return = array('status'=>true,'msg'=>'请求成功','data'=>$spot_info);
        }else{
            $return = array('status'=>false,'msg'=>'请求失败','data'=>[]);
        }
        echo json_encode($return,JSON_UNESCAPED_UNICODE);
    }

    //评论
    public function comment(){
        $post = input('post.');
        $user_id = input('post.uid');
        $user_name = input('post.user_name');
        $content = input('post.content');
        $view_id = input('post.view_id');
        $score = input('post.score');
        $type = input('post.type');//被评论类型
        $food_type = input('post.food_type');//美食类型
        if($type == 'food'){
            $type = $food_type;
        }
        $floor = input('post.floor');//一到五楼
        $create_time = time();
        if(isset($_FILES['images'])){
            $files = $_FILES['images'];
            $image = [];
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
            }else{
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
                    array_push($image,'http://'.$_SERVER['HTTP_HOST']."/upload/portal/commentImage/".$name.'.png');
                }else{
                    exit(json_encode(['status'=>false,'msg'=>'图片上传失败'],JSON_UNESCAPED_UNICODE));
                }
            }
            $result = Db::name('comment')->insert(['user_id'=>$user_id,'user_name'=>$user_name,'content'=>$content,'view_id'=>$view_id,'image_url'=>json_encode($image),'score'=>$score,'type'=>$type,'create_time'=>$create_time]);
            if($result){
                echo json_encode(['status'=>true,'msg'=>'评价成功'],JSON_UNESCAPED_UNICODE);
            }else{
                echo json_encode(['status'=>false,'msg'=>'评价成功'],JSON_UNESCAPED_UNICODE);
            }
        }else{
            $result = Db::name('comment')->insert(['user_id'=>$user_id,'user_name'=>$user_name,'content'=>$content,'view_id'=>$view_id,'image_url'=>json_encode([]),'score'=>$score,'type'=>$type,'create_time'=>$create_time]);
            if($result){
                echo json_encode(['status'=>true,'msg'=>'评价成功'],JSON_UNESCAPED_UNICODE);
            }
        }
    }

    //获取评论
    public function loadComment($uid,$type,$id){
        if($uid){
            $where['user_id'] = $uid;
        }
        if($type || is_int($type)){
            $where['type'] = $type;
        }
        $where['view_id'] = $id;
        $data = DB::name('comment')->where($where)->select()->toArray();
        foreach ($data as $key => &$value) {
            $value['image_url'] = json_decode($value['image_url']);
        }
        return $data;
    }

    //详情
    //景点type=view
    //美食type=food
    //购物type=shop
    public function details(){
        $type = input('post.type') ? input('post.type') : '';
        $id = input('post.id') ? input('post.id') : '';
        $name = input('post.name') ? input('post.name') : '';
        $city_id = input('post.city_id') ? input('post.city_id') : '';
        $food_type = input('post.food_type') ? input('post.food_type') : '';
        if($type == 'view'){
            // $name = '梅峰岛';
            // $id = '9';
            $spot_info = Db::name('Cultural_spot')->where(['id'=>$id,'spot_name'=>$name])->find();
            if(!empty($spot_info)){
                // print_r($spot_info);exit;
                $spot_info['business_hours'] = '';
                $spot_info['release_time'] = date('Y-m-d', $spot_info['update_time']);
                //景点封面图片 cover
                if(!empty($spot_info['picture2'])){
                    $cover_pic = json_decode($spot_info['picture2'],true);
                    foreach($cover_pic as $k => &$pic_value){
                        $spot_info['image_url'][$k]= cmf_get_image_preview_url($pic_value['url']); 
                        $spot_info['image_name'][$k]= substr($pic_value['name'],0,strpos($pic_value['name'], '.'));
                        $pic['url'] = $spot_info['image_url'][$k];
                        $pic['name'] = $spot_info['image_name'][$k];
                        $spot_info['image_url'][$k] = $pic;
                    }
                }else{
                    $spot_info['image_url'] = [['url'=>'','name'=>'']];
                }
                //文字描述中的html标签转化成实体
                $spot_info['introduction'] = htmlchars($spot_info['spot_Introduction']);
                $spot_info['introduction'] = str_replace('&nbsp;', "", $spot_info['introduction']);
                unset($spot_info['picture2'],$spot_info['image_name'],$spot_info['spot_Introduction']);
                $spot_info['comment'] = $this->loadComment(null,'view',$id);
                $return = array('status'=>true,'msg'=>'请求成功','data'=>$spot_info);
            }else{
                $return = array('status'=>false,'msg'=>'景点数据为空','data'=>[]);
            }
        }elseif($type == 'food'){
            // $city_id = 3134;
            // $name = '天香楼';
            // $food_type = '本土美食';
            $Info = array();
            $data = array();
            $a = array();
            $b = array(); 
            $result = array();
            //必吃美食详情
            if($food_type == '必吃美食'){
                $store_data = Db::name('Store_info')->where(array('city_id'=>$city_id,'store_name'=>$name))->find();
                $store_data['spot_name'] = $store_data['store_name'];
                $store_data['play_time'] = $store_data['meal_time'];
                unset($store_data['store_name'],$store_data['meal_time']);
                $store_data['release_time'] = date('Y-m-d', $store_data['update_time']);
                if(!empty($store_data['picture2'])){
                    $picture2 = json_decode($store_data['picture2'],true);
                    foreach($picture2 as $k => &$val){
                        $store_data['image_url'][$k]= cmf_get_image_preview_url($val['url']); 
                        $store_data['image_name'][$k]= substr($val['name'],0,strpos($val['name'], '.'));
                        $pic['url'] = $store_data['image_url'][$k];
                        $pic['name'] = $store_data['image_name'][$k];
                        $store_data['image_url'][$k] = $pic;
                    }
                    unset($store_data['pic']);
                }else{
                    $store_data['image_url'] = [['url'=>'','name'=>'']];
                }
                //文字描述中的html标签转化成实体
                $store_data['introduction'] = htmlchars($store_data['store_Introduction']);
                $store_data['introduction'] = str_replace('&nbsp;', "", $store_data['introduction']);
                $store_data['qita_description'] = htmlchars($store_data['other_description']);
                unset($store_data['picture2'],$store_data['store_Introduction'],$store_data['other_description']);
                $store_data['comment'] = $this->loadComment(null,'必吃美食',$id);
                $data = $store_data;
            }
            //总店
            $restaurant_chain = Db::name('Restaurant_chain')->where(array('city_id'=>$city_id,'restaurant_name'=>$name))->find();
            if(isset($restaurant_chain['restaurant_name'])){
                $restaurant_chain['store_name'] = $restaurant_chain['restaurant_name'];
                unset($restaurant_chain['restaurant_name']);
            }
            if(isset($restaurant_chain['restaurant_Introduction'])){
                $restaurant_chain['Introduction'] = $restaurant_chain['restaurant_Introduction'];
                unset($restaurant_chain['restaurant_Introduction']);
            }
            if(isset($restaurant_chain['update_time'])){
                $restaurant_chain['release_time'] = date('Y-m-d', $restaurant_chain['update_time']);
            }
            if(isset($restaurant_chain['picture2'])){
                $re_cover = json_decode($restaurant_chain['picture2'],true);
                foreach($re_cover as $kk2 => &$re){
                    $restaurant_chain['image_url'][$kk2]= cmf_get_image_preview_url($re['url']);
                    $restaurant_chain['image_name'][$kk2]= substr($re['name'],0,strpos($re['name'], '.'));
                    $pic['url'] = $restaurant_chain['image_url'][$kk2];
                    $pic['name'] = $restaurant_chain['image_name'][$kk2];
                    $restaurant_chain['image_url'][$kk2] = $pic;
                    $restaurant_chain['image_name'][$kk2]= substr($re['name'],0,strpos($re['name'], '.'));
                    $pic['url'] = $restaurant_chain['image_url'][$kk2];
                    $pic['name'] = $restaurant_chain['image_name'][$kk2];
                    $restaurant_chain['image_url'][$kk2] = $pic;
                }
                unset($restaurant_chain['image_name'],$restaurant_chain['picture2']);
            }
            //分店
            $barnch_result = Db::name('branch')->where(array('store_name'=>$name))->select()->toArray();
            if(!empty($barnch_result)){
                foreach($barnch_result as &$branch){
                        if(!empty($restaurant_chain['pic'])){
                            $cover = json_decode($restaurant_chain['pic'],true);
                            foreach($cover as $k3 => &$value){
                                $branch['image_url']= cmf_get_image_preview_url($value['url']); 
                            }
                        }
                } 
            }
           
            //推荐菜品
            $tuijian_info = Db::name('dishes_recommended_info')->field(array('id','store_name','dishes_name','pic','is_hot_have','status','is_top'))->where(array('city_id'=>$city_id,'store_name'=>$name))->select()->toArray();
            if(!empty($tuijian_info)){
                foreach($tuijian_info as &$tj){
                    if(!empty($tj['pic'])){
                        $tj_cover = json_decode($tj['pic'],true);
                        foreach($tj_cover as $k5 => &$vv){
                          $tj['image_url']= cmf_get_image_preview_url($vv['url']);
                        }
                       unset($tj['pic']);
                }
            }
            // $restaurant_chain['comment'] = $this->loadComment(null,'本土美食');
            $a['store'] = $restaurant_chain;
            $a['fen'] = $barnch_result;
            $a['view'] = $tuijian_info;
            }
            
            //本土美食详情
            if($food_type == '本土美食'){
                $store_info = Db::name('store_info')->where(array('city_id'=>$city_id,'store_name'=>$name))->find();
                //景点封面图片 cover
                if(!empty($store_info)){
                    $store_info['spot_name'] = $store_info['store_name'];
                    $store_info['play_time'] = $store_info['meal_time'];
                    unset($store_info['store_name'],$store_info['meal_time']);
                    if(!empty($store_info['picture2'])){
                        $cover_pic = json_decode($store_info['picture2'],true);
                        foreach($cover_pic as $k => &$pic_value){
                            $store_info['image_url'][$k]= cmf_get_image_preview_url($pic_value['url']);
                            $store_info['image_name'][$k]= substr($pic_value['name'],0,strpos($pic_value['name'], '.'));
                            $pic['url'] = $store_info['image_url'][$k];
                            $pic['name'] = $store_info['image_name'][$k];
                            $store_info['image_url'][$k] = $pic;
                        }
                        unset($store_info['picture2'],$store_info['image_name']);
                    }
                    //文字描述中的html标签转化成实体
                    $store_info['introduction'] = htmlchars($store_info['store_Introduction']);
                    $store_info['introduction'] = str_replace('&nbsp;', "", $store_info['introduction']);
                    unset($store_info['store_Introduction']);

                    $store_info['qita_description'] = htmlchars($store_info['other_description']);
                    unset($store_info['other_description']);
                    $store_info['release_time'] = date('Y-m-d', $store_info['update_time']);
                    //推荐菜品
                    $dishes_info = Db::name('Dishes_recommended_info')->field(array('id','store_name','dishes_name','pic','is_hot_have','status','is_top'))->where(array('store_name'=>$name))->select()->toArray();
                    foreach($dishes_info as &$dish){
                        if(!empty($dish['pic'])){
                            $dish_cover = json_decode($dish['pic'],true);
                            foreach($dish_cover as $k2 => &$dish_value){
                                $dish['image_url']= cmf_get_image_preview_url($dish_value['url']); 
                            }
                            unset($dish['pic']);
                        }
                      
                    }
                    $store_info['comment'] = $this->loadComment(null,'本土美食',$id);
                    $info['store'] = $store_info;
                    $info['fen'] = $b;
                    $info['view'] = $dishes_info;  
                }else{
                    $info = $a;     //连锁店的数据（总店，分店）
                }
            }

            //美食街区详情
            if($food_type == '美食街区'){
                $court_info = Db::name('Food_court')->where(array('city_id'=>$city_id,'food_court_name'=>$name))->find();
                //景点封面图片 cover
                if(!empty($court_info)){
                    $court_info['spot_name'] = $court_info['food_court_name'];
                    $court_info['play_time'] = $court_info['meal_time'];
                    unset($court_info['food_court_name'],$court_info['meal_time']);
                    if(!empty($court_info['picture2'])){
                        $cover_pic = json_decode($court_info['picture2'],true);
                        foreach($cover_pic as $k => &$pic_value){
                            $court_info['image_url'][$k]= cmf_get_image_preview_url($pic_value['url']); 
                            $court_info['image_name'][$k]= substr($pic_value['name'],0,strpos($pic_value['name'], '.'));
                            $pic['url'] = $court_info['image_url'][$k];
                            $pic['name'] = $court_info['image_name'][$k];
                            $court_info['image_url'][$k] = $pic;
                        }
                        unset($court_info['picture2'],$court_info['image_name']);
                    }
                    //文字描述中的html标签转化成实体
                    $court_info['introduction'] = htmlchars($court_info['court_Introduction']);
                    $court_info['introduction'] = str_replace('&nbsp;', "", $court_info['introduction']);
                    $court_info['qita_description'] = htmlchars($court_info['other_description']);
                    unset($court_info['court_Introduction'],$court_info['other_description'],$court_info['pic']);
                    $court_info['release_time'] = date('Y-m-d', $court_info['update_time']);
                }
            }
            $result = array();
            if(!empty($data)){
                $result['store'] = $data;    //景区里的简要介绍
                $result['dishes'] = $tuijian_info;   //推荐菜品
            }
            if(!empty($info)){
                $result = $info;  
                // $result['dishes'] = $dishesResult;   //推荐菜品
                // $result['branch'] = $barnch_result;   //分店 
            }
            if(!empty($court_info)){
                $court_info['comment'] = $this->loadComment(null,'美食街区',$id);
                $result['store'] = $court_info; 
            }
            $return = array('status' =>true,'msg'=>'请求成功','data'=>$result);
            // print_r($return);
        }else{
            // $name = '武林广场'; 
            $shop_detail = Db::name('shopping_streets')->where(['shopping_name'=>$name])->find();
            if(!empty($shop_detail)){
                $shop_detail['spot_name'] = $shop_detail['shopping_name'];
                $shop_detail['play_time'] = $shop_detail['shopping_time'];
                unset($shop_detail['shopping_name'],$shop_detail['shopping_time']);
                $shop_detail['release_time'] = date('Y-m-d', $shop_detail['update_time']);
                //景点封面图片 cover
                if(!empty($shop_detail['picture2'])){
                    $cover_pic = json_decode($shop_detail['picture2'],true);
                    foreach($cover_pic as $k => &$pic_value){
                        $shop_detail['image_url'][$k]= cmf_get_image_preview_url($pic_value['url']); 
                        $shop_detail['image_name'][$k]= substr($pic_value['name'],0,strpos($pic_value['name'], '.'));
                        $pic['url'] = $shop_detail['image_url'][$k];
                        $pic['name'] = $shop_detail['image_name'][$k];
                        $shop_detail['image_url'][$k] = $pic;
                    }
                    unset($shop_detail['picture2'],$shop_detail['image_name']);
                }else{
                    $shop_detail['image_url'] = [['url'=>'','name'=>'']];
                }
                //文字描述中的html标签转化成实体
                $shop_detail['introduction'] = htmlchars($shop_detail['shopping_Introduction']);
                $shop_detail['introduction'] = str_replace('&nbsp;', "", $shop_detail['introduction']);
                $shop_detail['qita_description'] = htmlchars($shop_detail['other_description']);
                unset($shop_detail['shopping_Introduction'],$shop_detail['other_description'],$shop_detail['pic']);
                $shop_detail['comment'] = $this->loadComment(null,'shop',$id);
                /*** 特色商品 ***/
                $goodinfo_list = Db::name('goods_info')->where(array('type'=>$shop_detail['type'],'store_name'=>$name))->select()->toArray();
                foreach($goodinfo_list as $key2=>&$goodinfo){
                    if(!empty($goodinfo['pic'])){
                        $cover_pic = json_decode($goodinfo['pic'],true);
                        foreach($cover_pic as $k => &$pic_value){
                            $goodinfo['image_url']= cmf_get_image_preview_url($pic_value['url']); 
                        }
                        unset($goodinfo['pic']);
                    }
                   
                }
                $result = array();
                $result['store'] = $shop_detail;    //景区里的简要介绍
                $result['dishes'] = $goodinfo_list;   //本土特产、土特产店、购物商圈中的特色商品
                // print_r($result);
                $return = array('status' =>true,'msg'=>'请求成功','data'=>$result);
            }else{
                $return = array('status' =>true,'msg'=>'店铺数据为空','data'=>[]);
            }
        }
        echo json_encode($return,JSON_UNESCAPED_UNICODE);
    }

    //费用清单
    public function expenseList(){
        $trip_id = input('post.trip_id');
        if(!empty($trip_id)){
            $traffic_money = Db::name('traffic_money')->where(array('trip_id'=>$trip_id))->find();
            $hotel = Db::name('hotel')->where(array('trip_id'=>$trip_id))->find();
            $eat_money = Db::name('eat_money')->where(array('trip_id'=>$trip_id))->find();
            if(isset($traffic_money)){
                $lastResult['traffic_money'] = json_decode($traffic_money['traffic_money'],true);     //交通费用
            }else{
                $lastResult['traffic_money'] = array();
            }
            if(isset($hotel)) { 
                $lastResult['hotel_money'] = json_decode($hotel['hotel_info'],true); //酒店费用
            }else{
                $lastResult['hotel_money'] = array();
            }      
            if(isset($eat_money['eat_money'])) { 
                $lastResult['eat_money'] = json_decode($eat_money['eat_money'],true);  //餐饮费用
            }else{
                $lastResult['eat_money'] = array();
            }
            $lastResult['tickets'] = array();
            $lastResult['car'] = array();
            $return = array('status'=>true,'msg'=>'请求成功','data'=>$lastResult);
        }else{
            $return = array('status'=>false,'msg'=>'请求失败','data'=>array());
        }
        echo json_encode($return,JSON_UNESCAPED_UNICODE);
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

    //发现频道
    public function find(){
        $latitude = input('post.latitude');
        $longitude = input('post.longitude');
        if($latitude){
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
            $city['result']['location'] = $location_a;
        }else{
            //定位
            $ip = $this->get_ip();
            $city_info = get_ip_lookup($ip);//获取当前城市
            // $city_info = get_ip_lookup('115.236.182.122');
            //定位
            $city['city_name'] = str_replace('市', '', $city_info);
            $get_location = file_get_contents('http://api.map.baidu.com/geocoder?address='.$city['city_name'].'&output=json&key=f9i94yRcN7hCVBdptTeG1ZmzXGMQUrkZ');//百度
            $get_location = json_decode($get_location,true);
            if($get_location['status'] == 'OK' && !empty($get_location['result'])){
                $location = $get_location['result']['location'];
            }else{
                $location = ['lat'=>'','lng'=>''];
            }
            $city['result']['location'] = $location;
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
        //附近城市
        $coordinate = DB::name('City_details')->field(['longitude','latitude'])->where(['city_id'=>$city['city_id']])->find();
        $city_list = Db::name('City_details')->field(array('id','province_id','city_id','province_name','city_name','city_abbreviation','more','longitude','latitude'))->order('id asc')->select()->toArray();
        foreach($city_list as $key=>&$city_value){
            $lo = $city_value['longitude'];
            $la= $city_value['latitude'];
            //调用common.php 中的 getDistance方法计算两个地理位置之间的距离
            $distance = getDistance($coordinate['longitude'], $coordinate['latitude'], $lo, $la, 2);
            if($distance == 0){
                unset($city_list[$key]);
            }
            $city_value['dis'] = $distance;
            if(!empty($city_value['more'])){
                $pic =json_decode($city_value['more'],true);
                foreach($pic as $kk => &$pic_value)
                {
                     //common.php中封装的图片url解析方法
                    $city_value['img'] = cmf_get_image_preview_url($pic_value['url']); 
                }
                unset($city_value['more']);
            }
           
        }
        $city_list = $this->quickSort(array_merge($city_list));
        $city_list = array_slice($city_list,0,6);//获取数组从键值为0开始的6个元素
        // $hot_info = DB::name('trip_info')->where('status',2)->order('id desc')->limit(3)->select()->toArray();
        // $hot_trip = $this->make($hot_info);//热门行程
        
        // $daren_info = DB::name('trip_info')->where(['status'=>2,'theme'=>1])->order('id desc')->select()->toArray();
        // $daren_trip = [];
        // foreach ($daren_info as $drkey => $drvalue) {
        //     if(strstr($drvalue['trip_name'],$city['city_name'])){
        //         $daren_trip[] = $drvalue;
        //     }
        // }
        // $daren_trip = array_slice($daren_trip,0,6);
        
        $daren_trip = [];
        // $daren_trip = DB::name('trip_info')->where(['status'=>2,'theme'=>1])->limit(6)->select()->toArray();
        
        $daren_trip = DB::name('trip_info')->limit(6)->order('before_eight desc')->select()->toArray();
        $daren_trip = $this->make($daren_trip);//热门行程
        $news_list = Db::name('news_match')->where('status',1)->order('sort asc')->select()->toArray();
        foreach ($news_list as $key => &$value) {
            $value['image'] = cmf_get_image_url($value['image']);
        }
        $return = array('status'=>true,'msg'=>'请求成功','data'=>['news_list'=>$news_list,'location_city'=>$city,'nearby_city'=>array_merge($city_list),'hot_trip'=>[],'daren_trip'=>$daren_trip,'hot_travels'=>[]]);
        echo json_encode($return,JSON_UNESCAPED_UNICODE);
    }

    //目的地目的地
    public function destination(){
        $province = Db::name('Province_details')->order('paiming_id')->select()->toArray();
        $city_detail = Db::name('city_details')->field(['id','province_id','province_name','city_id','city_name','city_abbreviation','more','fit_day','longitude','latitude','city_score','wellcity','wellcity_sort'])->select()->toArray();
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
        //当季热门城市
        foreach($city_detail as $cvm){
            if($cvm['wellcity'] == 1){
                $wellcity[] = $cvm;
            }
        }
        if(!empty($wellcity)){
             foreach($wellcity as $key2 => &$valu2) {
                if(!empty($valu2['more'])){
                    $pic =json_decode($valu2['more'],true);
                    foreach($pic as $kk => &$pic_value){
                         //common.php中封装的图片url解析方法
                        $valu2['img_url'] = cmf_get_image_preview_url($pic_value['url']); 
                    }
                    unset($valu2['more']);
                }
            }
            $sort1 = array_column($wellcity, 'wellcity_sort');  
            array_multisort($sort1, SORT_ASC, $wellcity);
        }else{
            $wellcity= array();
        }
       
        $WellData['id'] = 1000;
        $WellData['province_name'] = '当季热门';
        $WellData['province_English'] = 'Current hot';
        $WellData['province_id'] = 1000;
        $WellData['detail']['id'] = 1000;
        $WellData['detail']['province_name'] = '当季热门';
        $WellData['detail']['province_English'] = 'Current hot';
        $WellData['detail']['province_Introduction'] = '当季热门简介';
        $WellData['detail']['create_time'] = 0;
        $WellData['detail']['update_time'] = 0;
        $WellData['detail']['published_time'] = 0;
        $WellData['detail']['status'] = 0;
        $WellData['detail']['is_municipalities'] = 0;
        $WellData['detail']['is_top'] = 0;
        $WellData['detail']['paiming_id'] = 0;
        $hot = 'currenthot/currenthot.png';
        $WellData['detail']['img_url'] = cmf_get_image_preview_url($hot);;
        $WellData['city'] = $wellcity;
        $WellData = [$WellData];
        $provinceList = array_merge($WellData,$province);

        if($provinceList){
            $return = array('status'=>true,'msg'=>'请求成功','data'=>$provinceList);
        }else{
            $return = array('status'=>false,'msg'=>'请求失败','data'=>[]);
        }
        echo json_encode($return,JSON_UNESCAPED_UNICODE);
    }

    //省份详情
    public function provinceDetail(){
        $type = input('post.type');
        $province_id = input('post.province_id');
        // $type = 'city';
        // $province_id = '3133';
        //热门城市
        if($type == 'city'){
            $data = Db::name('city_details')->field(['id','province_id','province_name','city_id','city_name','city_abbreviation','more'])->where(['province_id'=>$province_id,'recommended'=>1])->select()->toArray();
            foreach ($data as $key => &$value){
                $pic3 =json_decode($value['more'],true);
                if($pic3){
                    foreach($pic3 as $key3 => &$value3){
                        //common.php中封装的图片url解析方法
                        $value['img'] = cmf_get_image_preview_url($value3['url']);   
                    }
                }
                unset($value['more']);
            }
        //热门景点
        }elseif($type == 'view'){
            $data = Db::name('Famous_spot')->field(['id','province_id','city_id','city_name','spot_name','pic','absture'])->where(array('province_id'=>$province_id,'is_province_hot'=>1))->select()->toArray();
            foreach ($data as $key => &$value){
                $img = json_decode($value['pic'],true);
                if(!empty($img)){
                    foreach ($img as $k => $v){
                        $value['pic'] = cmf_get_image_url($v['url']);
                    }
                }
            }
        //本地特色
        }else{
            $goods_data = Db::name('Special_goods')->field(array('id','province_id','city_id','goods_name','city_name','goods_pic'))->where(['goods_is_recommended'=>1,'province_id'=>$province_id])->select();
            $data = json_decode($goods_data,true);
            foreach($data as &$goods){
                $pic3 =json_decode($goods['goods_pic'],true);
                foreach($pic3 as $key3 => &$value){
                    //common.php中封装的图片url解析方法
                    $goods['img_url'] = cmf_get_image_preview_url($value['url']);   
                }
                unset($goods['goods_pic']);
            }
        }
        // print_r($data);
        if(!empty($data)){
            $return = array('status'=>true,'msg'=>'请求成功','data'=>$data);
        }else{
            $return = array('status'=>true,'msg'=>'暂无数据','data'=>[]);
        }
        echo json_encode($return,JSON_UNESCAPED_UNICODE);
    }

    //城市介绍
    public function cityDetail(){
        $city_id = input('post.city_id');
        // $city_id = 3134;
        //城市详情
        $city_detail = Db::name('city_details')->field('city_id,city_name,fit_day,city_Introduction,more')->where(['city_id'=>$city_id])->find();
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
            if(!empty($city_detail)){
                $data['city_detail'] = $city_detail;
                $data['famous_spot'] = $famous_spot;
                $data['special_food'] = $special_food; 
                $data['special_goods'] = $special_goods;
                $trip_list = DB::name('trip_info')->where('status',2)->limit(3)->select()->toArray();
                $daren_trip = $this->make($trip_list);//热门行程
                $data['daren_trip'] = $daren_trip; 
                // $data['hot_travels'] = array(["trip_id"=>"","uid"=>'',"title"=>"","city"=>"","day"=>'',"create_time"=>"","img"=>""]); 
                $data['hot_travels'] = array();
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

    //人文自然  
    //详情请求景区详情接口
    public function nature(){
        $city_id = input('post.city_id');
        // $city_id = 3134;
        $spot_list = Db::name('Nature_absture')->where(array('city_id'=>$city_id))
        ->field(array('id','province_id','city_id','spot_name','area_id','attr_score','play_time','suit_time','suit_season','pic','type','longitude','latitude','ranking'))->order('ranking asc')->select()->toArray();
        if(!empty($spot_list)){
            $top = array();
            $nature = array();
            $scenery = array();
            foreach($spot_list as &$spot){
                //适玩时间
                $spot['tag_time'] = $this->play_time($spot['play_time']);  //时间统一成小时
                if($spot['suit_season'] == '1,2,3,4,5,6,7,8,9,10,11,12')
                {
                    $spot['suit_season'] = '1-12月';
                }else{
                    $spot['suit_season'] = substr( $spot['suit_season'],0,strpos($spot['suit_season'], ',')).'-'.trim(strrchr($spot['suit_season'], ','),',').'月';  
                }
                //景点封面图片 cover
                if(!empty($spot['pic'])){
                    $cover_pic =json_decode($spot['pic'],true);
                    foreach($cover_pic as $k => &$pic_value){
                        //common.php中封装的图片url解析方法
                        $spot['cover_url'] = cmf_get_image_preview_url($pic_value['url']); 
                    }
                    unset($spot['pic']);
                }else{
                    //当没有上传图片时，用404图片代替
                    $unified_404 = '404/unified_404.png';
                    $spot['cover_url'] = cmf_get_image_preview_url($unified_404);
                }
                if($spot['type'] == 'Top8'){
                    $top['top8'][] = $spot; 
                }
                if($spot['type'] == '人文景观'){
                    $nature['nature'][] = $spot;
                }
                if($spot['type'] == '自然风光'){
                    $scenery['scenery'][] = $spot;
                }
            }
            $absture_list = array();
            if(isset($top['top8'])){
                $top8_sort = array_column($top['top8'], 'ranking');  
                array_multisort($top8_sort, SORT_ASC, $top['top8']);
            }
            if(isset($nature['nature'])){
                 $nature_sort = array_column($nature['nature'], 'ranking');  
                array_multisort($nature_sort, SORT_ASC, $nature['nature']); 
            }
            if(isset($scenery['scenery'])){
                $scenery_sort = array_column($scenery['scenery'], 'ranking');  
                array_multisort($scenery_sort, SORT_ASC,  $scenery['scenery']); 
            }
            $absture_list = array_merge($top,$nature,$scenery);
            $return = array('status'=>true,'msg'=>'请求成功','data'=>$absture_list );
        }else{
            $return = array('status'=>false,'msg'=>'请求失败','data'=>array());
        }
        // print_r($return);
        echo json_encode($return,JSON_UNESCAPED_UNICODE);
    }

    //本土体验
    public function local(){
        $city_id = input('post.city_id');
        // $city_id = 3134;
        $local_list = Db::name('Describe')->where(array('city_id'=>$city_id))->field(array('province_id','city_id','spot_name','suit_season','suit_time','area_id','attr_score','play_time','pic','type','longitude','latitude','attr_score','ranking'))->select()->toArray();
        if(!empty($local_list)){
            $art = array();
            $leisure = array();
            foreach($local_list as $kk=>&$local){
                //适玩时间
                $local['tag_time'] = $this->play_time($local['play_time']);  //时间统一成小时
                if($local['suit_season'] == '1,2,3,4,5,6,7,8,9,10,11,12')
                {
                    $local['suit_season'] = '1-12月';
                }else{
                    $local['suit_season'] = substr($local['suit_season'],0,strpos($local['suit_season'], ',')).'-'.trim(strrchr($local['suit_season'], ','),',').'月';  
                }
                //景点封面图片 cover
                if(!empty($local['pic'])){
                    $cover_pic =json_decode($local['pic'],true);
                    foreach($cover_pic as $k => &$pic_value){
                        $local['cover_url'] = cmf_get_image_preview_url($pic_value['url']); 
                    }
                    unset($local['pic']);
                }else{
                    $unified_404 = '404/unified_404.png';
                    $local['cover_url']  = cmf_get_image_preview_url($unified_404);
                }
                if($local['type'] == '文化艺术'){
                    $art['art'][] = $local;
                }
                if($local['type'] == '休闲情调'){
                    $leisure['leisure'][] = $local;
                }
                
            }
            $data = array();
            if(isset($art['art'])){
                $art_sort = array_column($art['art'], 'ranking');  
                array_multisort($art_sort, SORT_ASC, $art['art']);
            }
            if(isset($leisure['leisure'])){
                $leisure_sort = array_column($leisure['leisure'], 'ranking'); 
                array_multisort($leisure_sort, SORT_ASC, $leisure['leisure']); 
            }
            $data = array_merge($art,$leisure);
            $return = array('status'=>true,'msg'=>'请求成功','data'=>$data);
        }else{
            $return = array('status'=>false,'msg'=>'请求失败','data'=>[]);
        }
        // print_r($return);
        echo json_encode($return,JSON_UNESCAPED_UNICODE);
    }

    //本土体验详情
    public function local_detail(){
        $spot_name = input('post.spot_name');
        $city_id = input('post.city_id');
        // $spot_name = '宋城千古情';
        // $city_id = 3134;
        $local_detail = Db::name('Describe')->where(['spot_name'=>$spot_name,'city_id'=>$city_id])->find();
        if(!empty($local_detail)){
            $local_detail['release_time'] = date('Y-m-d', $local_detail['update_time']);
            //景点封面图片 cover
            if(!empty($local_detail['picture2'])){
                $cover_pic = json_decode($local_detail['picture2'],true);
                foreach($cover_pic as $k => &$pic_value){
                    $local_detail['image_url'][$k]= cmf_get_image_preview_url($pic_value['url']); 
                    $local_detail['image_name'][$k]= substr($pic_value['name'],0,strpos($pic_value['name'], '.'));
                    $pic['url'] = $local_detail['image_url'][$k];
                    $pic['name'] = $local_detail['image_name'][$k];
                    $local_detail['image_url'][$k] = $pic;
                }
                unset($local_detail['picture2']);
                unset($local_detail['image_name']);
            }
            //文字描述中的html标签转化成实体
            $local_detail['tickets'] = htmlchars($local_detail['attractions_tickets']);
            unset($local_detail['attractions_tickets']);
            $local_detail['introduction'] = htmlchars($local_detail['spot_Introduction']);
            unset($local_detail['spot_Introduction']);
            $local_detail['qita_description'] = htmlchars($local_detail['other_description']);
            unset($local_detail['other_description']);
            unset($local_detail['pic']);
            $return = array('status'=>true,'msg'=>'请求成功','data'=>$local_detail);
        }else{
            $return = array('status'=>false,'msg'=>'请求失败','data'=>array());
        }
        // print_r($local_detail);
        echo json_encode($return,JSON_UNESCAPED_UNICODE);
    }

    //醉美夜色
    public function night(){
        $city_id = input('post.city_id');
        // $city_id = 3134;
        $night_list = Db::name('Night')->where(array('city_id'=>$city_id))->field(array('province_id','city_id','spot_name','suit_season','suit_time','area_id','attr_score','play_time','pic','type','longitude','latitude','attr_score','ranking'))->select()->toArray();
        if(!empty($night_list)){
            $visual = array();
            $neon = array();
            foreach($night_list as $kk=>&$night){
                //适玩时间
                $night['tag_time'] = $this->play_time($night['play_time']);  //时间统一成小时
                if($night['suit_season'] == '1,2,3,4,5,6,7,8,9,10,11,12')
                {
                    $night['suit_season'] = '1-12月';
                }else{
                    $night['suit_season'] = substr($night['suit_season'],0,strpos($night['suit_season'], ',')).'-'.trim(strrchr($night['suit_season'], ','),',').'月';  
                }
                //景点封面图片 cover
                if(!empty($night['pic'])){
                    $cover_pic =json_decode($night['pic'],true);
                    foreach($cover_pic as $k => &$pic_value){
                        $night['cover_url'] = cmf_get_image_preview_url($pic_value['url']); 
                    }
                    unset($night['pic']);
                }else{
                    $unified_404 = '404/unified_404.png';
                    $night['cover_url'] = cmf_get_image_preview_url($unified_404);
                }
                if($night['type'] == '视觉享受'){
                    $visual['visual'][] = $night; 
                }
                if($night['type'] == '灯红酒绿'){
                    $neon['neon'][] = $night;
                }
                
            }
            $data = array();
            if(isset($visual['visual'])){
                $visual_sort = array_column($visual['visual'], 'ranking');  
                array_multisort($visual_sort, SORT_ASC,  $visual['visual']); 
            }
            if(isset($neon['neon'])){
                 $neon_sort = array_column($neon['neon'], 'ranking');  
                array_multisort($neon_sort, SORT_ASC, $neon['neon']); 
            }
            $data = array_merge($visual,$neon);
            $return = array('status'=>true,'msg'=>'请求成功','data'=>$data);
        }else{
            $return = array('status'=>false,'msg'=>'请求失败','data'=>array());
        }
        // print_r($return);
        echo json_encode($return,JSON_UNESCAPED_UNICODE);
    }

    //醉美夜色详情
    public function night_detail(){
        $spot_name = input('post.spot_name');
        $city_id = input('post.city_id');
        // $spot_name = '西湖苏堤';
        // $city_id = 3134;
        $night_detail = Db::name('Night')->where(array('spot_name'=>$spot_name,'city_id'=>$city_id))->find();
        if(!empty($night_detail)){
            $night_detail['release_time'] = date('Y-m-d', $night_detail['update_time']);
            //景点封面图片 cover
            if(!empty($night_detail['picture2'])){
                $cover_pic = json_decode($night_detail['picture2'],true);
                foreach($cover_pic as $k => &$pic_value){
                    $night_detail['image_url'][$k]= cmf_get_image_preview_url($pic_value['url']); 
                    $night_detail['image_name'][$k]= substr($pic_value['name'],0,strpos($pic_value['name'], '.'));
                    $pic['url'] = $night_detail['image_url'][$k];
                    $pic['name'] = $night_detail['image_name'][$k];
                    $night_detail['image'][$k] = $pic;
                }
                unset($night_detail['picture2']);
                unset($night_detail['image_name']);
            }
            //文字描述中的html标签转化成实体
            $night_detail['tickets'] = htmlchars($night_detail['attractions_tickets']);
            unset($night_detail['attractions_tickets']);
            $night_detail['introduction'] = htmlchars($night_detail['spot_Introduction']);
            unset($night_detail['spot_Introduction']);
            $night_detail['qita_description'] = htmlchars($night_detail['other_description']);
            unset($night_detail['other_description']);
            unset($night_detail['pic']);
            $return = array('status' =>true,'msg'=>'请求成功','data'=>$night_detail);
        }else{
            $return = array('status' =>false,'msg'=>'请求失败','data'=>array());
        }
        // print_r($night_detail);
        echo json_encode($return,JSON_UNESCAPED_UNICODE);
    }

    //美食诱惑
    public function cityFoodList(){
        $willeat = array();    //必吃美食
        $localeat = array();   //本土美食
        $street = array(); //美食街区
        $arr = array();
        $city_id = input('post.city_id');
        // $city_id = 3134;
        /*********  第一部分**********/
        //必吃美食下关联的店铺
        $arr = $this->foodDetail($city_id);
        /*********  第二部分**********/
        //本土美食店铺列表
        $store = Db::name('Store_info')->field(array('id','province_id','city_id','area_id','store_name','type','pic','longitude','latitude','meal_time','per_capita'))->where(array('city_id'=>$city_id))->select()->toArray();
        $restaurant_chain = Db::name('Restaurant_chain')->field(array('id','province_id','city_id','area_id','restaurant_name','type','pic','longitude','latitude','meal_time','per_capita'))->where(array('city_id'=>$city_id))->select()->toArray();
        $foodstreet = Db::name('Food_court')->field(array('id','province_id','city_id','area_id','food_court_name','type','pic','longitude','latitude','meal_time','suit_time'))->where(array('city_id'=>$city_id))->select()->toArray();
        if(!empty($store)){
            foreach($store as &$value){
                if(!empty($value['pic'])){
                    $pic = json_decode($value['pic'],true);
                    foreach($pic as $k => &$p){
                        $value['image_url']= cmf_get_image_preview_url($p['url']); 
                    }
                    unset($value['pic']);
                }else{
                    $unified_404 = '404/unified_404.png';
                    $value['image_url'] = cmf_get_image_preview_url($unified_404);
                }
            }
        }else{
            $store = [];
        }
        if(!empty($restaurant_chain)){
            //连锁餐厅总店
            foreach($restaurant_chain as &$value2){
                if(!empty($value2['pic'])){
                    $pic2 = json_decode($value2['pic'],true);
                    foreach($pic2 as $k => &$p2){
                        $value2['image_url']= cmf_get_image_preview_url($p2['url']); 
                    }
                    unset($value2['pic']);
                }else{
                    $unified_404 = '404/unified_404.png';
                    $value2['image_url'] = cmf_get_image_preview_url($unified_404);
                }
                $value2['store_name'] = $value2['restaurant_name'];
                unset($value2['restaurant_name']);
            }
        }else{
            $restaurant_chain = [];
        }
        if(!empty($foodstreet)){
            foreach($foodstreet as &$st){
                //适玩时间
                $st['tag_time'] = $this->play_time($st['suit_time']);  //时间统一成小时
                if(!empty($st['pic'])){
                    $image = json_decode($st['pic'],true);
                    foreach($image as $k => &$im){
                        $st['image_url']= cmf_get_image_preview_url($im['url']); 
                    }
                    unset($st['pic']);
                }
                unset($st['picture2']);
                $st['store_name'] = $st['food_court_name'];
                unset($st['food_court_name']);
            }
        }else{
            $restaurant_chain = [];
        }
        $local = array_merge($store,$restaurant_chain);
        $data = array();
        $willeat['eat'] = $arr;  //必吃美食
        $localeat['local'] = $local;  //本土美食
        $street['street'] = $foodstreet ;  //美食街区
        $data = array_merge($willeat,$localeat,$street);
        $return = array('status' =>true,'msg'=>'请求成功','data'=>$data);
        echo json_encode($return,JSON_UNESCAPED_UNICODE);
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

    //美食店详情
    public  function foodStoreDetail(){
        $city_id = input('post.city_id');
        $name = input('post.store_name');
        $type = input('post.type');
        // $city_id = 3134;
        // $name = '天香楼';
        // $type = '本土美食';
        $Info = array();
        $data = array();
        $a = array();
        $b = array(); 
        $result = array();
        //必吃美食详情
        if($type == '必吃美食'){
            $store_data = Db::name('Store_info')->where(array('city_id'=>$city_id,'store_name'=>$name))->find();
            $store_data['spot_name'] = $store_data['store_name'];
            $store_data['play_time'] = $store_data['meal_time'];
            unset($store_data['store_name'],$store_data['meal_time']);
            $store_data['release_time'] = date('Y-m-d', $store_data['update_time']);
            if(!empty($store_data['picture2'])){
                $picture2 = json_decode($store_data['picture2'],true);
                foreach($picture2 as $k => &$val){
                    $store_data['image_url'][$k]= cmf_get_image_preview_url($val['url']); 
                }
                unset($store_data['pic']);
            }
            unset($store_data['picture2']);
            //文字描述中的html标签转化成实体
            $store_data['Introduction'] = htmlchars($store_data['store_Introduction']);
            unset($store_data['store_Introduction']);
            $store_data['qita_description'] = htmlchars($store_data['other_description']);
            unset($store_data['other_description']);
            $data = $store_data;
        }
        //总店
        $restaurant_chain = Db::name('Restaurant_chain')->where(array('city_id'=>$city_id,'restaurant_name'=>$name))->find();
        if(isset($restaurant_chain['restaurant_name'])){
            $restaurant_chain['store_name'] = $restaurant_chain['restaurant_name'];
            unset($restaurant_chain['restaurant_name']);
        }
        if(isset($restaurant_chain['restaurant_Introduction'])){
            $restaurant_chain['Introduction'] = $restaurant_chain['restaurant_Introduction'];
            unset($restaurant_chain['restaurant_Introduction']);
        }
        if(isset($restaurant_chain['update_time'])){
            $restaurant_chain['release_time'] = date('Y-m-d', $restaurant_chain['update_time']);
        }
        if(isset($restaurant_chain['picture2'])){
            $re_cover = json_decode($restaurant_chain['picture2'],true);
            foreach($re_cover as $kk2 => &$re){
                $restaurant_chain['image_url'][$kk2]= cmf_get_image_preview_url($re['url']); 
            }
        }
        //分店
        $barnch_result = Db::name('branch')->where(array('store_name'=>$name))->select()->toArray();
        foreach($barnch_result as &$branch){
            if(!empty($restaurant_chain['pic'])){
                $cover = json_decode($restaurant_chain['pic'],true);
                foreach($cover as $k3 => &$value){
                    $branch['image_url']= cmf_get_image_preview_url($value['url']); 
                }
            }
            
        } 
        //推荐菜品
        $tuijian_info = Db::name('dishes_recommended_info')->field(array('id','store_name','dishes_name','pic','is_hot_have','status','is_top'))->where(array('city_id'=>$city_id,'store_name'=>$name))->select()->toArray();
        foreach($tuijian_info as &$tj){
            if(!empty($tj['pic'])){
                $tj_cover = json_decode($tj['pic'],true);
                foreach($tj_cover as $k5 => &$vv){
                    $tj['image_url']= cmf_get_image_preview_url($vv['url']); 
                }
                unset($tj['pic']);
            }
           
        }
        $a['store'] = $restaurant_chain;
        $a['fen'] = $barnch_result;
        $a['tj'] = $tuijian_info;

        //本土美食详情
        if($type == '本土美食'){
            $store_info = Db::name('store_info')->where(array('city_id'=>$city_id,'store_name'=>$name))->find();
            //景点封面图片 cover
            if(!empty($store_info)){
                $store_info['spot_name'] = $store_info['store_name'];
                $store_info['play_time'] = $store_info['meal_time'];
                unset($store_info['store_name'],$store_info['meal_time']);
                if(!empty($store_info['picture2'])){
                    $cover_pic = json_decode($store_info['picture2'],true);
                    foreach($cover_pic as $k => &$pic_value){
                        $store_info['image_url'][$k]= cmf_get_image_preview_url($pic_value['url']); 
                    }
                    unset($store_info['picture2']);
                }
                //文字描述中的html标签转化成实体
                $store_info['Introduction'] = htmlchars($store_info['store_Introduction']);
                unset($store_info['store_Introduction']);

                $store_info['qita_description'] = htmlchars($store_info['other_description']);
                unset($store_info['other_description']);
                $store_info['release_time'] = date('Y-m-d', $store_info['update_time']);
                //推荐菜品
                $dishes_info = Db::name('Dishes_recommended_info')->field(array('id','store_name','dishes_name','pic','is_hot_have','status','is_top'))->where(array('store_name'=>$name))->select()->toArray();
                foreach($dishes_info as &$dish){
                    if(!empty($dish['pic'])){
                        $dish_cover = json_decode($dish['pic'],true);
                        foreach($dish_cover as $k2 => &$dish_value){
                            $dish['image_url']= cmf_get_image_preview_url($dish_value['url']); 
                        }
                        unset($dish['pic']);
                    }
                  
                }
                $info['store'] = [$store_info];
                $info['fen'] = $b;
                $info['tj'] = $dishes_info;  
            }else{
                $info = $a;     //连锁店的数据（总店，分店）
            }
        }

        //美食街区详情
        if($type == '美食街区'){
            $court_info = Db::name('Food_court')->where(array('city_id'=>$city_id,'food_court_name'=>$name))->find();
            //景点封面图片 cover
            if(!empty($court_info)){
                $court_info['spot_name'] = $court_info['food_court_name'];
                $court_info['play_time'] = $court_info['meal_time'];
                unset($court_info['food_court_name'],$court_info['meal_time']);
                if(!empty($court_info['picture2'])){
                    $cover_pic = json_decode($court_info['picture2'],true);
                    foreach($cover_pic as $k => &$pic_value){
                    
                        $court_info['image_url'][$k]= cmf_get_image_preview_url($pic_value['url']); 
                    }
                    unset($court_info['picture2']);
                }
                //文字描述中的html标签转化成实体
                $court_info['Introduction'] = htmlchars($court_info['court_Introduction']);
                unset($court_info['court_Introduction']);
                $court_info['qita_description'] = htmlchars($court_info['other_description']);
                unset($court_info['other_description']);
                unset($court_info['pic']);
                $court_info['release_time'] = date('Y-m-d', $court_info['update_time']);
            }
        }
        $result = array();
        if(!empty($data)){
            $result['store'] = [$data];    //景区里的简要介绍
            $result['dishes'] = $tuijian_info;   //推荐菜品
        }
        if(!empty($info)){
            $result = $info;  
            // $result['dishes'] = $dishesResult;   //推荐菜品
            // $result['branch'] = $barnch_result;   //分店 
        }
        if(!empty($court_info)){
            $result['spot'] = [$court_info]; 
        }
        $return = array('status' =>true,'msg'=>'请求成功','data'=>$result);
        // print_r($return);
        echo json_encode($return,JSON_UNESCAPED_UNICODE);
    }

    //购物天堂
    public function shopList(){
        $city_id = input('post.city_id');
        // $city_id = 3134;
        $shop_list = Db::name('shopping_streets')->where(array('city_id'=>$city_id))->select()->toArray();
        //推荐商品店铺列表
        $goods_list = Db::name('goods_info')->field(array('id','goods_name','spot_Introduction','recom_sites','store_name','type','pic'))->where(array('is_specialty'=>1,'city_id'=>$city_id))->select()->toArray();
        // print_r($goods_list);
        foreach($shop_list as $key1=>&$sh){
            //适玩时间
            $sh['tag_time'] = $this->play_time($sh['shopping_time']);  //时间统一成小时
            //店铺封面
            if(!empty($sh['pic'])){
                $cover_pic = json_decode($sh['pic'],true);
                foreach($cover_pic as $k => &$pic_value){
                    $sh['pic_url']= cmf_get_image_preview_url($pic_value['url']); 
                }
            }
            //处理商品关联店铺数据
            foreach($goods_list as $key2=>&$g){
                if($sh['shopping_name'] == $g['store_name']){
                    $g['city_id'] = $sh['city_id'];
                    $g['longitude'] = $sh['longitude'];
                    $g['latitude'] = $sh['latitude'];
                    if(isset($sh['pic_url'])){
                        $g['dianpu_image'] = $sh['pic_url'];
                    }
                    $g['shopping_time'] = $sh['shopping_time'];  //2小时
                    //适玩时间
                    $g['tag_time'] = $this->play_time($sh['shopping_time']);  //时间统一成小时
                }
            }
        }
        foreach($goods_list as $key4 => &$goods){   
            //商品封面
            if(!empty($goods['pic'])){
                $goods_pic = json_decode($goods['pic'],true);
                foreach($goods_pic as $k => &$good_value){
                    $goods['goods_url']= cmf_get_image_preview_url($good_value['url']); 
                }
                $goods['introduction'] = htmlchars($goods['spot_Introduction']);
                unset($goods['spot_Introduction']);
                $arr[$goods['goods_name']]['place'][] = $goods; //取出数据分组
            }
          
        }
        
        $keyV = array_keys($arr);
        $arr = array_values($arr);
        foreach($arr as $k => &$v){
            $v['name'] = $keyV[$k];
            foreach($v['place'] as $k1 => $v1){
                $v['goods_url'] = $v1['goods_url'];
                $v['recom_sites'] = $v1['recom_sites'];
                $v['introduction'] = $v1['introduction'];
            } 
        }

        $local_product = array();
        $pro_shops = array();
        $business_circle = array();
        foreach($shop_list as $key=>&$shop){
            //适玩时间
            $shop['tag_time'] = $this->play_time($shop['shopping_time']);  //时间统一成小时
            if(!empty($shop['pic'])){
                $picture = json_decode($shop['pic'],true);
                foreach($picture as $k=> &$picvalue){
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

            // if($shop['type'] == '本土特产')
            // {
            //     $local_product['localProduct'] = $arr; 
            // }

            if($shop['type'] == '土特产店' || $shop['shop_type'] == '土特产店'){
                $pro_shops['productShops'][] = $shop;
            }
            if($shop['type'] == '购物商圈' || $shop['shop_type'] == '购物商圈'){
                $business_circle['businessCircle'][] = $shop;
            }
        }
        $local_product['localProduct'] = $arr; 
        $result = array();
        $result = array_merge($local_product,$pro_shops,$business_circle);
        // print_r($result);
        $return = array('status' =>true,'msg'=>'请求成功','data'=>$result);
        echo json_encode($return,JSON_UNESCAPED_UNICODE);
    }

    //特产店详情
    public function shopDetail(){
        $shopping_name = input('post.shopping_name');
        // $shopping_name = '武林广场'; 
        $shop_detail = Db::name('shopping_streets')->where(['shopping_name'=>$shopping_name])->find();
        // print_r($shop_detail);
        if(!empty($shop_detail)){
            $shop_detail['spot_name'] = $shop_detail['shopping_name'];
            $shop_detail['play_time'] = $shop_detail['shopping_time'];
            unset($shop_detail['shopping_name'],$shop_detail['shopping_time']);
            $shop_detail['release_time'] = date('Y-m-d', $shop_detail['update_time']);
            //景点封面图片 cover
            if(!empty($shop_detail['picture2'])){
                $cover_pic = json_decode($shop_detail['picture2'],true);
                foreach($cover_pic as $k => &$pic_value){
                    $shop_detail['image_url'][$k]= cmf_get_image_preview_url($pic_value['url']); 
                    $shop_detail['image_name'][$k]= substr($pic_value['name'],0,strpos($pic_value['name'], '.'));
                    $pic['url'] = $shop_detail['image_url'][$k];
                    $pic['name'] = $shop_detail['image_name'][$k];
                    $shop_detail['image_url'][$k] = $pic;
                }
                unset($shop_detail['picture2']);
                unset($shop_detail['image_name']);
            }
            //文字描述中的html标签转化成实体
            $shop_detail['Introduction'] = htmlchars($shop_detail['shopping_Introduction']);
            unset($shop_detail['shopping_Introduction']);
            $shop_detail['qita_description'] = htmlchars($shop_detail['other_description']);
            unset($shop_detail['other_description']);
            unset($shop_detail['pic']);
            /*** 特色商品 ***/
            $goodinfo_list = Db::name('goods_info')->where(array('type'=>$shop_detail['type'],'store_name'=>$shopping_name))->select()->toArray();
            foreach($goodinfo_list as $key2=>&$goodinfo){
                if(!empty($goodinfo['pic'])){
                    $cover_pic = json_decode($goodinfo['pic'],true);
                    foreach($cover_pic as $k => &$pic_value){
                        $goodinfo['image_url']= cmf_get_image_preview_url($pic_value['url']); 
                    }
                    unset($goodinfo['pic']);
                }
               
            }
            $result = array();
            $result['store'] = $shop_detail;    //景区里的简要介绍
            $result['dishes'] = $goodinfo_list;   //本土特产、土特产店、购物商圈中的特色商品
            // print_r($result);
            $return = array('status' =>true,'msg'=>'请求成功','data'=>$result);
        }else{
            $return = array('status' =>false,'msg'=>'请求失败','data'=>[]);
        }
        echo json_encode($return,JSON_UNESCAPED_UNICODE);
    }

    //城市交通
    public function cityTraffic(){
        $city_id = input('post.city_id');
        // $city_id = 3134;
        $city_traffic = Db::name('city_traffic')->where(array('city_id'=>$city_id))->select()->toArray();
        // print_r($city_traffic);
        $traffic_list = array('plane'=>[],'train'=>[],'bus'=>[],'other'=>[]);
        if(!empty($city_traffic)){
            foreach($city_traffic as &$traffic){
                $traffic_pic =json_decode($traffic['traffic_pic'],true);
                foreach($traffic_pic as $key3 => &$traffic_pic_value){
                    $traffic['img_url'] = cmf_get_image_preview_url($traffic_pic_value['url']); 
                }
                unset($traffic['traffic_pic']);
                if($traffic['traffic_type'] == 'plane'){
                    $traffic_list['plane'][] = $traffic;
                }elseif($traffic['traffic_type'] == 'train'){
                    $traffic_list['train'][] = $traffic;
                }elseif($traffic['traffic_type'] == 'bus'){
                    $traffic_list['bus'][] = $traffic;
                }else{
                    $traffic_list['other'][] = $traffic;
                }
            }
        // print_r($traffic_list);
            $return = ['status'=>true,'msg'=>'请求成功','data'=>$traffic_list];
        }else{
            $return = ['status'=>false,'msg'=>'请求失败','data'=>array()];
        }
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
            // $image =json_decode($spot['pic'],true);
            // foreach($image as $key => &$img_value){
            //     //common.php中封装的图片url解析方法
            //     $spot['img_url'] = cmf_get_image_preview_url($img_value['url']); 
            // }
            // unset($spot['pic']);
            // //文字描述中的html标签转化成实体
            // $spot['spot_In'] = htmlchars($spot['spot_Introduction']);
            // unset($spot['spot_Introduction']);
        }
        if(!empty($type)){
            return $famous_spot;
        }else{
            echo json_encode($famous_spot,JSON_UNESCAPED_UNICODE);
        }
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

    //发现模块搜索
    public function search(){
        $condition = input('post.condition');
        $condition = str_replace('市','',$condition);
        $nature_list = array();
        $store_list = array();
        $trip_list = array();
        $shopping_list = array();
        $nature_list = Db::name('Nature_absture')->field(['id,city_id,spot_name,type,city_name,suit_time,pic as img',"'nature' as classify"])->where(array('city_name'=>$condition))->limit(10)->select()->toArray();//景区
        if(empty($nature_list)){
            $where1['spot_name'] = ['like',"%".$condition."%"];
            $nature_list = Db::name('Nature_absture')->field(['id,city_id,spot_name,type,city_name,suit_time,pic as img',"'nature' as classify"])->where($where1)->limit(10)->select()->toArray();//景区
        }
        $store_list = Db::name('Store_info')->field(['id,city_id,store_name,type,per_capita,city_name,business_hours,pic as img',"'store' as classify"])->where(array('city_name'=>$condition))->limit(10)->select()->toArray();//美食店
        if(empty($store_list)){
            $store_list = Db::name('Store_info')->field(['id,city_id,store_name,type,per_capita,city_name,business_hours,pic as img',"'store' as classify"])->where(array('store_name'=>$condition))->limit(10)->select()->toArray();//美食店
        }
        $where2['trip_name'] = ['like',"%".$condition."%"];
        $where2['status'] = 2;
        $trip_list = Db::name('trip_info')->where($where2)->order('id desc')->limit(10)->select()->toArray();//热门行程
        $shopping_list = Db::name('shopping_streets')->field(['id,city_id,shopping_name,type,city_name,business_hours,pic as img',"'shopping' as classify"])->where(array('city_name'=>$condition))->limit(10)->select()->toArray();//购物街
        if(empty($shopping_list)){
            $where3['shopping_name'] = ['like',"%".$condition."%"];
            $shopping_list = Db::name('shopping_streets')->field(['id,city_id,shopping_name,type,city_name,business_hours,pic as img',"'shopping' as classify"])->where($where3)->limit(10)->select()->toArray();//购物街
        }
        if($trip_list){
            $trip_list = $this->make($trip_list);
        }
        $list = array('nature'=>$nature_list,'store'=>$store_list,'shopping'=>$shopping_list);
        foreach ($list as $key => &$value) {
            if($key !== 'trip'){
                $value = $this->makePic($value);
            }else{
                foreach ($value as $k => &$v) {
                    $v['img'] ='';
                }
            }
        }
        $list['trip'] = $trip_list;
        echo json_encode(array('status'=>true,'msg'=>'请求成功','data'=>$list),JSON_UNESCAPED_UNICODE);
    }

    //处理图片
    public function makePic($data){
        foreach ($data as $key => &$value) {
            $cover_pic = json_decode($value['img'],true);
            $value['img']= cmf_get_image_preview_url($cover_pic[0]['url']);
        }
        return $data;
    }

    //发现频道特色商品详情
    public function goods(){
        $city_id = input('post.city_id');
        $goods_name = input('post.goods_name');
        // $city_id = 1692;
        // $goods_name = '碧螺春';
        //商品详情
        $goods_info = Db::name('goods_info')->field('id,city_id,goods_name,absture,recom_sites,type,spot_Introduction,pic')->where('goods_name',$goods_name)->find();
        $pic = json_decode($goods_info['pic'],true);
        $goods_info['image_url'] = cmf_get_image_preview_url($pic[0]['url']);
        $goods_info['spot_introduction'] = str_replace('&nbsp;','',htmlchars($goods_info['spot_Introduction']));
        unset($goods_info['pic'],$goods_info['spot_Introduction']);
        $store = explode('、', $goods_info['recom_sites']);
        $where['city_id'] = $city_id;
        $where['shopping_name'] = array('in',$store);
        //商品对应的店铺
        $shop = Db::name('shopping_streets')->field('id,city_id,shopping_name,type,business_hours,pic')->where($where)->select()->toArray();
        $shop = $this->assoc_unique($shop,'shopping_name');
        foreach ($shop as $k => &$v) {
            $shop_pic = json_decode($v['pic'],true);
            $v['image_url'] = cmf_get_image_preview_url($shop_pic[0]['url']);
            unset($v['pic']);
        }
        $data = $goods_info;
        $data['place'] = $shop;
        echo json_encode(['status'=>true,'msg'=>'请求成功','data'=>$data],JSON_UNESCAPED_UNICODE);
    }

    //二维数组去重
    public function assoc_unique($arr, $key){
        $tmp_arr = array();
        foreach($arr as $k => $v){
            if(in_array($v[$key], $tmp_arr))//搜索$v[$key]是否在$tmp_arr数组中存在，若存在返回true
            {
               unset($arr[$k]);
            }else{
                $tmp_arr[] = $v[$key];
            }
        }
        sort($arr); //sort函数对数组进行排序
        return $arr;
    }

    //个人中心常用出行人
    public function personalContact(){
        $user_id = input('post.uid');
        if(!empty($user_id)){
            $contacts = Db::name('contacts')->where(['user_id'=>$user_id])->select()->toArray();
            if(!empty($contacts)){
                $return = array('status'=>true,'msg'=>'请求成功','data'=>$contacts);
            }else{
                $return = array('status'=>true,'msg'=>'用户暂无常用出行人','data'=>[]);
            }
        }else{
            $return = array('status'=>false,'msg'=>'用户未登录','data'=>[]);
        }
        echo json_encode($return,JSON_UNESCAPED_UNICODE);
    }

    //个人中心我的游记
    public function personalTrip(){
        $uid = input('post.uid');
        if(!empty($uid)){
            $trip_info = DB::name('trip_info')->where(['uid'=>$uid])->select()->toArray();
            if(!empty($trip_info)){
                $my_trip = $this->make($trip_info);//我的行程
                $return = array('status'=>true,'msg'=>'请求成功','data'=>$my_trip);
            }else{
                $return = array('status'=>true,'msg'=>'用户无行程','data'=>[]);
            }
        }else{
            $return = array('status'=>false,'msg'=>'用户未登录','data'=>[]);
        }
        echo json_encode($return,JSON_UNESCAPED_UNICODE);
    }

    //个人中心我的收藏
    public function myCollect(){
        $uid = input('post.uid');//用户id
        $collect = Db::name('collect')->where('collect_user',$uid)->column('collect_id');
        $where['trip_id'] = array('in',$collect);
        $my_trip = Db::name('trip_info')->where($where)->select()->toArray();
        $data = $this->make($my_trip);
        echo json_encode(['status'=>true,'msg'=>'请求成功','data'=>$data],JSON_UNESCAPED_UNICODE);
    }
    
    //个人中心我的评论
    public function myComment(){
        $uid = input('post.uid');
        $comment = Db::name('comment')->where(['user_id'=>$uid,'status'=>1])->select()->toArray();//我的点评
        foreach ($comment as $key => &$value) {
            $value['image_url'] = json_decode($value['image_url'],true);
            $value['creat_time'] = date('Y-m-d H:i:s',$value['create_time']);
            // $value['image_url']= cmf_get_image_preview_url($pic);
        }
        echo json_encode(['status'=>true,'msg'=>'请求成功','data'=>$comment],JSON_UNESCAPED_UNICODE);
    }

    //上传头像
    public function upHeardimage(){
        $uid = input('post.uid');
        if(isset($_FILES['images'])){
            $files = $_FILES['images'];
            $image = [];
            //创建指定路径
            $fileName = $_SERVER['DOCUMENT_ROOT']."/upload/portal/headphoto/";
            if(!file_exists($fileName)){
                //进行文件创建
                mkdir($fileName,0777,true);
            }
            foreach($files['tmp_name'] as $key => $value){
                $pattern = '1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLOMNOPQRSTUVWXYZ';    //字符池
                $noncestr = '';
                for($i=0; $i<10; $i++){
                    $noncestr .= $pattern{mt_rand(0,62)};    //生成php随机数
                }
                $name = time().$noncestr;
                //进行名称的拼接
                $imgName = $fileName.$uid.'-'.$name.'.png';
                //获取上传数据并写入
                $result = move_uploaded_file($value,$imgName);
                if($result){
                    $heard_img = 'http://'.$_SERVER['HTTP_HOST']."/upload/portal/headphoto/".$uid.'-'.$name.'.png';
                    Db::name('customer')->where('uid',$uid)->update(['head_port'=>$heard_img]);
                    echo json_encode(['status'=>true,'msg'=>'头像上传成功','img_url'=>$heard_img],JSON_UNESCAPED_UNICODE);
                } else {
                    echo json_encode(['status'=>false,'msg'=>'头像上传失败'],JSON_UNESCAPED_UNICODE);
                }
            }
        }else{
            echo json_encode(['status'=>false,'msg'=>'请先选择图片'],JSON_UNESCAPED_UNICODE);
        }
    }
    
    //个人信息修改
    public function modifyPersonalInfo(){
        $type = input('post.type');
        $uid = input('post.uid');
        $user_name = input('post.user_name');
        $sex = input('post.sex');
        $birth = input('post.birth');
        $resid_addres = input('post.resid_addres');
        if($type == 'user_name'){
            $data = ['user_name'=>$user_name];
        }elseif($type == 'sex'){
            $data = ['sex'=>$sex];
        }elseif($type == 'birth'){
            $data = ['birth'=>$birth];
        }else{
            $data = ['resid_addres'=>$resid_addres];
        }
        $user_info = Db::name('customer')->where(['uid'=>$uid,$type=>$data[$type]])->find();
        if($user_info){
            exit(json_encode(['status'=>true,'msg'=>'修改成功','data'=>$data],JSON_UNESCAPED_UNICODE));
        }
        $result = Db::name('customer')->where('uid',$uid)->update($data);
        if($result){
            $return = ['status'=>true,'msg'=>'修改成功','data'=>$data];
        }else{
            $return = ['status'=>false,'msg'=>'修改失败','data'=>''];
        }
        echo json_encode($return,JSON_UNESCAPED_UNICODE);
    }

    //用户点击收藏
    public function collect(){
        $id = input('post.id');//收藏项目的id
        $uid = input('post.uid');//用户id
        $type = input('post.type');//收藏项目所在表名
        $collect_time = time();
        $collect_db = Db::name('collect');
        $trip_db = Db::name('trip_info');
        $collect_result = $collect_db->where(['collect_id'=>$id,'collect_user'=>$uid,'collect_table'=>$type])->find();
        if($collect_result){
            $collect_db->where('id',$collect_result['id'])->delete();
            $result = $trip_db->where(array('trip_id'=>$id))->setDec('collect_num',1);
            $msg = false;
            if(empty($result)){
                exit(json_encode(['status'=>false,'msg'=>false,'count'=>0]));
            }
        }else{
            $collect_db->insert(['collect_id'=>$id,'collect_user'=>$uid,'collect_table'=>$type,'collect_time'=>$collect_time]);
            $result = $trip_db->where(array('trip_id'=>$id))->setInc('collect_num',1);
            $msg = true;
            if(empty($result)){
                exit(json_encode(['status'=>false,'msg'=>$msg,'count'=>0]));
            }
        }
        $count = $trip_db->where('trip_id',$id)->value('collect_num');
        echo json_encode(['status'=>true,'msg'=>$msg,'count'=>$count],JSON_UNESCAPED_UNICODE);
    }

    //点赞
    public function likeCount(){
        $id = input('post.id');//被点赞内容id
        $uid = input('post.uid');//用户id
        $type = input('post.type');//被点赞类型
        $like_db = Db::name('like');
        $trip_db = Db::name('trip_info');
        $comment_db = Db::name('comment');
        $like_data = $like_db->where(['collect_uid'=>$uid,'trip_id'=>$id,'like_type'=>$type])->find();
        if($like_data){
            $like_result = $like_db->where('id',$like_data['id'])->delete();
            if($type == 'comment'){
                $result = $comment_db->where('id',$id)->setDec('like_num',1);
            }elseif($type == 'trip'){
                $result = $trip_db->where('trip_id',$id)->setDec('like_num',1);
            }
            if($like_result && $result){
                $status = true;
                $msg = false;
            }else{
                $status = false;
                $msg = '取消点赞失败';
            }
        }else{
            $like_result = $like_db->insert(['collect_uid'=>$uid,'trip_id'=>$id,'like_type'=>$type,'like_time'=>time()]);
            if($type == 'comment'){
                $result = $comment_db->where('id',$id)->setInc('like_num',1);
            }elseif($type == 'trip'){
                $result = $trip_db->where('trip_id',$id)->setInc('like_num',1);
            }
            if($like_result && $result){
                $status = true;
                $msg = true;
            }else{
                $status = false;
                $msg = '点赞失败';
            }
        }
        if($type == 'comment'){
            $count = $comment_db->where('id',$id)->value('like_num');
        }elseif($type == 'trip'){
            $count = $trip_db->where('trip_id',$id)->value('like_num');
        }
        echo json_encode(['status'=>$status,'msg'=>$msg,'count'=>$count],JSON_UNESCAPED_UNICODE);
    }

    //个人信息
    public function personal(){
        $uid = input('post.uid');//用户id
        $result = Db::name('customer')->where('uid',$uid)->find();
        $head_port = strstr($result['head_port'],'http') ? $result['head_port'] : cmf_get_image_url($result['head_port']);
        echo json_encode(array('status'=>true,'msg' => '登录成功','data'=>['status'=>100,'uid'=>$result['uid'],'user_name'=>$result['user_name'],'sex'=>$result['sex'],'birth'=>$result['birth'],'phone'=>$result['phone'],'avatar'=>$head_port,'token'=>$result['token']]),JSON_UNESCAPED_UNICODE);
    }

    //我的主页
    public function myInfo(){
        $uid = input('post.uid');//用户id
        $type = input('post.type');//类型
        $trip_num = DB::name('trip_info')->where('uid',$uid)->count();//行程数
        $comment_num = Db::name('comment') ->where(['user_id'=>$uid,'status'=>1])->count();//评论数
        if($type == 'comment'){
            $data = Db::name('comment') ->where(['user_id'=>$uid,'status'=>1])->select()->toArray();//我的点评
            foreach ($data as $key => &$value) {
                $value['image_url'] = json_decode($value['image_url'],true);
                $value['creat_time'] = date('Y-m-d H:i:s',$value['create_time']);
            }
        }else{
            $my_trip = DB::name('trip_info')->where('uid',$uid)->order('id desc')->select()->toArray();//发布的行程信息
            $data = $this->make($my_trip);
        }
        echo json_encode(['status'=>true,'msg'=>'请求成功','trip_num'=>$trip_num,'comment_num'=>$comment_num,'data'=>$data],JSON_UNESCAPED_UNICODE);
    }

    //达人分享目的地
    public function drCity(){
        $province = Db::name('Provinces')->field('province_id,province_name')->select()->toArray();
        $city_detail = Db::name('city_details')->field(['province_id','city_id','city_name'])->select()->toArray();
        foreach ($province as $key => &$value) {
            foreach ($city_detail as $k => $v) {
                if($value['province_id'] == $v['province_id']){
                    $value['city'][] = $v;
                }
            }
        }
        echo json_encode(['status'=>true,'msg'=>'请求成功','data'=>$province],JSON_UNESCAPED_UNICODE);
    }

    //达人分享筛选
    public function drTrip(){
        $city = input('post.city');
        $city = str_replace('市','',$city);
        $time = input('post.time');
        $recom = input('post.recom') ? 'click_num desc' : 'id desc';//人气推荐
        $time = htmlspecialchars_decode($time);//转义
        $time = json_decode($time,true);
        $day = input('post.day');
        $return = [];
        $where['status'] = 2;
        $where['theme'] = 1;
        $where['trip_name'] = ['like',"%".$city."%"];
        if($day>5){
            $where['day_num'] = ['>',5];
            $trip = DB::name('trip_info')->where($where)->order($recom)->select()->toArray();
            $where['theme'] = 0;
            $trip1 = DB::name('trip_info')->where($where)->order($recom)->select()->toArray();
        }elseif($day){
            $where['day_num'] = ['=',$day];
            $trip = DB::name('trip_info')->where($where)->order($recom)->select()->toArray();
            $where['theme'] = 0;
            $trip1 = DB::name('trip_info')->where($where)->order($recom)->select()->toArray();
        }else{
            $trip = DB::name('trip_info')->where($where)->order($recom)->select()->toArray();
            $where['theme'] = 0;
            $trip1 = DB::name('trip_info')->where($where)->order($recom)->select()->toArray();
        }
        $trip = array_merge($trip,$trip1);
        $trip = $this->make($trip);
        foreach ($trip as $key => $value) {
            $v_day = (int)substr($value['date'],strpos($value['date'], '-')+1,2);
            if($time){
                if(in_array($v_day, $time)){
                    $return[] = $value;
                }
            }else{
                $return[] = $value;
            }
        }
        echo json_encode(['status'=>true,'msg'=>'请求成功','data'=>$return],JSON_UNESCAPED_UNICODE);
    }

    //意见反馈
    public function advice(){
        $uid = input('post.uid');
        $pro_type = input('post.pro_type');
        $content = input('post.content');
        $email = input('post.email');
        $problem_go = 'App';
        $feedback_time = time();
        if(isset($_FILES['images'])){
            $files = $_FILES['images'];
            //创建指定路径
            $fileName = $_SERVER['DOCUMENT_ROOT']."/upload/portal/advice/";
            if(!file_exists($fileName)){
                //进行文件创建
                mkdir($fileName,0777,true);
            }
            $pattern = '1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLOMNOPQRSTUVWXYZ';    //字符池
            $noncestr = '';
            for($i=0; $i<10; $i++){
                $noncestr .= $pattern{mt_rand(0,62)};    //生成php随机数
            }
            $name = $uid.'-'.time().$noncestr;
            //进行名称的拼接
            $imgName = $fileName.$name.'.png';
            //获取上传数据并写入
            $result = move_uploaded_file($files['tmp_name'],$imgName);
            if($result){
                $image = '/upload/portal/advice/'.$name.'.png';//图片地址
                $insert = Db::name('advice')->insert(['uid'=>$uid,'pro_type'=>$pro_type,'pic'=>$image,'content'=>$content,'problem_go'=>$problem_go,'email'=>$email,'feedback_time'=>$feedback_time]);
            }else{
                $return = ['status'=>false,'msg'=>'反馈失败'];
            }
        }else{
            $insert = Db::name('advice')->insert(['uid'=>$uid,'pro_type'=>$pro_type,'pic'=>'','content'=>$content,'problem_go'=>$problem_go,'email'=>$email,'feedback_time'=>$feedback_time]);
        }
        if($insert){
            $return = ['status'=>true,'msg'=>'反馈成功'];
        }else{
            $return = ['status'=>false,'msg'=>'反馈失败'];
        }
        echo json_encode($return,JSON_UNESCAPED_UNICODE);
    }

    //行程电子围栏
    public function allEnclosure(){
        $trip_id = input('post.trip_id');
        // $trip_id = '56-1541402354';
        $plan_info = DB::name('plan_info')->where(['trip_id'=>$trip_id])->find();
        $trip_info= Db::name('trip_info')->where(array('trip_id'=>$trip_id))->find();
        $go_city_array = json_decode($trip_info['go_city_array'],true);
        if(!empty($plan_info)){
            $schedufing = unserialize(base64_decode($plan_info['schedufing']));
            $schedufing = json_decode(json_encode($schedufing),true);
            foreach ($schedufing as $value) {
                foreach ($value['day_arry'] as $v) {
                    foreach ($v['day'] as $v1) {
                        // $enclosure = Db::name('Amap')->field('coord,name')->where('view_id',$v1['info']['id'])->find();
                        $enclosure = Db::name('Amap')->field('coord,name')->where('name',$v1['info']['spot_name'])->find();
                        if(!empty($enclosure)){
                            // $yinpin = $this->qiniu($enclosure['name']);
                            $yinpin = $this->qiniu($v1['info']['spot_name']);
                            $data = ['spot_name'=>$v1['info']['spot_name'],'enclosure'=>json_decode($enclosure['coord']),'yinpin'=>$yinpin];
                            $all[] = $data;
                        }
                    }
                }
            }
            if(isset($all)){
                echo json_encode(['status'=>true,'msg'=>'请求成功','data'=>$all],JSON_UNESCAPED_UNICODE);
            }else{
                echo json_encode(['status'=>false,'msg'=>'此景点暂无电子围栏','data'=>[]],JSON_UNESCAPED_UNICODE);
            }
           
        }
    }

    //获取APP版本号
    public function getAppVersion(){
        echo json_encode(['status'=>true,'msg'=>'1.0.2','url'=>'http://www.dailuer.com/upload/portal/袋鹿旅行.apk'],JSON_UNESCAPED_UNICODE);
    }

    //用户途径景点
    public function getSpotWay(){
        $data = input('post.');
        $data['time'] = time();
        unset($data['uid']);
        $record_db = Db::name('spot_activity_record');
        $activity = Db::name('spot_activity_user')->field('activity')->where('user_phone',$data['user_phone'])->select()->toArray();
        if($activity){
            foreach ($activity as $key => $value) {
                $data['activity'] = $value['activity'];
                $add_record = $record_db->insert($data);
            }
        }else{
                $add_record = $record_db->insert($data);
        }
        echo json_encode(['status'=>true]);
    }

    public function activityJoin(){
        $id = input('get.id');
        $activity_info = Db::name('spot_select')->where('id',$id)->find();
        if($activity_info){
            $activity_info['rules'] = json_decode($activity_info['rules']);
            $activity_info['prize'] = json_decode($activity_info['prize']);
            $this->assign('activity_info',$activity_info);
            return $this->fetch();
        }else{
            $this->error('暂无该活动',url('/portal/index/index'));
        }
    }

    public function addActivityUser(){
        $post = input('post.');
        $post['time'] = time();
        $user_db = Db::name('spot_activity_user');
        $user_info = $user_db->where(['user_phone'=>$post['user_phone'],'activity'=>$post['activity']])->find();
        // print_r($user_info);exit;
        if(empty($user_info)){
            $result = $user_db->insert($post);
            if($result){
                $return = ['status'=>true,'msg'=>'报名成功'];
            }else{
                $return = ['status'=>false,'msg'=>'报名失败，请重试'];
            }
        }else{
            $return = ['status'=>false,'msg'=>'该手机号已报名该活动'];
        }
        echo json_encode($return);
    }

    //微信登陆
    public function getBaseInfo($trip_id){
        //获取code
        $appid = "wxb45296996e34d7a3";
        $state = $trip_id ? $trip_id : '22-1547088481';
        $redirect_uri = urlencode("http://a.dailuer.com/portal/wap/getUserInfo");
        $url = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=".$appid."&redirect_uri=".$redirect_uri."&response_type=code&scope=snsapi_userinfo&state=".$state."#wechat_redirect";
        header('location:'.$url);
    }
    public function getUserInfo(){
        $appid = "wxb45296996e34d7a3";
        $APPsecret = "41196ec9d6b886d7763b1791a9d659c8";
        $code = $_GET['code'];
        $trip_id = $_GET['state'];
        $id = str_replace(strstr($trip_id,'-'),'',$trip_id);
        $url = "https://api.weixin.qq.com/sns/oauth2/access_token?appid=".$appid."&secret=".$APPsecret."&code=".$code."&grant_type=authorization_code";
        $url =file_get_contents($url,true);
        $file = json_decode($url,true);
        $user = Db::name('Customer')->where('openid',$file['openid'])->find();
        if ($user) {
            $uid = $user['uid'];//有之前绑定过微信
        }else{
            $info_url ="https://api.weixin.qq.com/sns/userinfo?access_token=".$file['access_token']."&openid=".$file['openid']."&lang=zh_CN";
            $info =file_get_contents($info_url,true);
            $user_info = json_decode($info,true);//用户信息
            // print_r($user_info);exit;
            if (isset($user_info['errcode']) || !$user_info) {
                # code...
                $data = json_encode(array('error_code' =>$user_info['errcode'] , 'msg' => '未查询到相应微信信息'.'  '.$user_info['errmsg']));
                echo $callback.'('.$data.')';//格式
                $this->error('未查询到相应微信信息');
            }else{
                $user['openid'] = $user_info['openid'];
                $user['user_name']= $user_info['nickname'];
                $user['sex'] = $user_info['sex'] == 1 ? '男' : '女';
                $user['resid_addres'] = $user_info['province'].$user_info['city'];
                $user['head_port'] = $user_info['headimgurl'];//头像
                $uid = Db::name('Customer')->insertGetId($user);
            }
        }
        cookie('user_name',$user['user_name'],'time()+3*24*3600');
        cookie('uid',$uid,'time()+3*24*3600');
        header("location:http://a.dailuer.com/portal/itinerary/tripinfoshare.html?them=$id&trip=$trip_id");
    }
}