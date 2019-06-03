<?php
// +----------------------------------------------------------------------
// | ThinkCMF [ WE CAN DO IT MORE SIMPLE ]
// +----------------------------------------------------------------------
// | Copyright (c) 2013-2017 http://www.thinkcmf.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed ( http://www.apache.org/licenses/LICENSE-2.0 )
// +----------------------------------------------------------------------
// | Author: bingwng <thinkcmf@126.com>
// +----------------------------------------------------------------------
namespace app\portal\controller;

use cmf\controller\HomeBaseController;
use think\Db;

class LoginController extends HomeBaseController
{
    /*******************  注册用户  *****************/
    // 注册页面
    public function register()
    {
        return $this->fetch();
    }

    //初始化 极验  会有异步请求
    public function StartCaptchaServlet() {
        session_start();
        vendor('geetest.geetestlib'); //极验接口API
        $gid = 'd20edb0b278234139f70a118f021855c';
        $gkey = 'b7f3c61169746ddf921c8ab885c14404';
        $GtSdk = new \GeetestLib($gid,$gkey);
        $data = array(
                "user_id" => "test", # 网站用户id
                "client_type" => "web", #web:电脑上的浏览器；h5:手机上的浏览器，包括移动应用内完全内置的web_view；native：通过原生SDK植入APP应用的方式
                "ip_address" => "unknow" # 请在此处传输用户请求验证时所携带的IP
        );
        $status = $GtSdk->pre_process($data, 1); 
        $_SESSION['gtserver'] = $status;
        $_SESSION['user_id'] = $data['user_id'];       
        echo $GtSdk->get_response_str();
    }
    /**  生成短信，发送注册码  **/
    public function GenerateForReg() 
    {
        session_start();
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

        $phone = trim($_POST['phone']);
        
        //手机号验证
        if (empty($phone))
        {
            exit(json_encode(array('error_code' => 1, 'msg' => '手机号不能为空'),JSON_UNESCAPED_UNICODE));
        }
        if(!is_numeric($phone) || (strlen($phone) != 11))
        {
            exit(json_encode(array('error_code' => 1, 'msg' => '请输入正确手机号'),JSON_UNESCAPED_UNICODE));
        }

        //用户表 Customer
        $Userarr = Db::name('Customer')->where(array('phone' => $phone))->find(); 
        if(!empty($Userarr))
        {
            exit(json_encode(array('error_code' => 1, 'msg' => '手机号码已被注册'),JSON_UNESCAPED_UNICODE));
        }

        $starttime = date("Y-m-d")." 00:00:00";
        $map['time'] = array('EGT', strtotime($starttime));
        $map['phone'] = $phone;

        //每天最多5次验证
        $count = Db::name('Sms_record')->where($map)->count();
        $recent = Db::name('Sms_record')->where(array('phone'=>$phone))->order('time desc')->select();
        $smsData = json_decode($recent,true);
        if($smsData)
        //间隔时间10分钟
        {
            $time_interval = time() - $smsData[0]['time'];
            if ($count>=5 || $time_interval <= 600 )
            {
                exit(json_encode(array('error_code' => 2, 'msg' => '您的手机短时间内验证次数过多，请稍后再试！')));
            }
        }
        $vcode = createRandomStr(6,true,true); // 生成6位数字的验证码
        $sms_text = "【袋鹿】您的验证码是：".$vcode.",请在10分钟内使用。";     
        $data['uid']=$Userarr['uid'];
        $data['sendto']='user';
        $data['type']='regCode1';
        
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

       

        // 本次的验证码及用户的相关信息存 User_modifypwd表
        $addtime = time();
        $expiry = $addtime + 1 * 600; /***  10分钟有效期 ***/
        $data = array('telphone' => $phone, 'vfcode' => $vcode, 'expiry' => $expiry, 'addtime' => $addtime);
        $user_modifypwdDb = Db::name('User_modifypwd');
        $insert_id = $user_modifypwdDb->insert($data);
        exit(json_encode(array('error_code' => 0, 'id' => $insert_id,'code'=>$vcode,'time'=>$addtime)));
    }

    //立即注册请求
    public function register_request()
    {
        $user_name= isset($_POST['user_name']) ? $_POST['user_name'] : '';
        $phone = isset($_POST['phone']) ? $_POST['phone'] : '';
        $pwd = isset($_POST['pwd']) ? $_POST['pwd'] : '';
        $vfycode = isset($_POST['vfycode']) ? $_POST['vfycode'] : '';
        //是否通过他人的推广链接中的推广码注册 （0-否，1-是）
        $ornot = isset($_POST['ornot']) ? $_POST['ornot'] : '';
        //上级推广人推广码
        $p_refer_code = isset($_POST['p_refer_code']) ? $_POST['p_refer_code'] : '';

        //验证码验证
        $user_modifypwdDb = Db::name('User_modifypwd');     	
        $modifypwd = $user_modifypwdDb->where(array('vfcode' => $vfycode, 'telphone' => $phone))->find();
        if (!empty($modifypwd))
        {
            $nowtime = time();
            if ($modifypwd['expiry'] < $nowtime) 
            {
                exit(json_encode(array('error_code' => true, 'msg' => '验证码过期！'),JSON_UNESCAPED_UNICODE));
            }
        }
        if(empty($modifypwd))
        {
            exit(json_encode(array('error_code' => true, 'msg' => '验证码错误！'),JSON_UNESCAPED_UNICODE));
        }
        //根据手机号和密码进行验证，成功时，存入customer表
        $result = $this->checkreg($phone, $pwd,$user_name,$ornot,$p_refer_code);  
       
        exit(json_encode($result,JSON_UNESCAPED_UNICODE));
    }

    //注册信息存入用户表 customer表
    public function checkreg($phone,$pwd,$user_name,$ornot,$p_refer_code)
    {
        vendor('duanxin.sendAPI');
        $customer = Db::name('Customer');
        if (empty($user_name)) {
			return array('error_code' => true, 'msg' => '用户名不能为空');
		}
		if (empty($phone)) {
			return array('error_code' => true, 'msg' => '手机号不能为空');
		}
		if (empty($pwd)) {
			return array('error_code' => true, 'msg' => '密码不能为空');
		}
		
		if(!preg_match('/^[0-9]{11}$/',$phone)){
			return array('error_code' => false, 'msg' => '请输入有效的手机号');
        }
        $where_user['user_name'] = $user_name;
        if($customer->field('uid')->where($where_user)->find())
        {
			return array('error_code' => true, 'msg' => '用户名已存在');
		}
			
		$condition_user['phone'] = $phone;
        if($customer->field('uid')->where($condition_user)->find())
        {
			return array('error_code' => true, 'msg' => '手机号已存在');
		}
        	
		$data_user['phone'] = $phone;
		$data_user['pwd'] = md5($pwd);	
        $data_user['user_name'] = $user_name;
        $data_user['ornot'] = $ornot;
        $data_user['p_refer_code'] = $p_refer_code;
        //推广码、推广链接、
        $randData = create_guid();   //生成永远唯一的推广码
        // $urlData = $_SERVER["REQUEST_SCHEME"].'://'.$_SERVER["SERVER_NAME"].':'.'8080'."/portal/login/register.html?invitation=$randData";
        
        $urlData = $_SERVER["REQUEST_SCHEME"].'://'.$_SERVER["SERVER_NAME"]."/portal/login/register.html?invitation=$randData";
        
        $data_user['refer_code'] = $randData;
        $data_user['refer_url'] = $urlData;

		$data_user['add_time'] = $data_user['last_time'] = $_SERVER['REQUEST_TIME'];
		$data_user['add_ip'] = $data_user['last_ip'] = get_client_ip(1);
        
        if($customer->insert($data_user))
        {
            $userInfo = $customer->where(array('phone'=>$phone))->find();
            //注册后自动登录
            cookie('user_name',$user_name,'time()+3*24*3600');
            cookie('uid',$userInfo['uid'],'time()+3*24*3600');

            $sms_text = '【袋鹿】欢迎您成为袋鹿大家庭的一员，您的用户名为：'.$data_user['user_name'].'，祝您生活愉快！';       
            $data['uid'] = $userInfo['uid'];
            $data['sendto'] = 'user';
            $data['type'] = 'regsucces';
            
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
            //通过他人的推广码注册成功时，他人的register_data 加一
            if(!empty($p_refer_code))
            {
                $customer->where(array('refer_code'=>$p_refer_code))->setInc('register_data',1);
            }
            
            return array('error_code' =>false,'msg' =>'注册成功！');
		}else{
			return array('error_code' => true, 'msg' => '注册失败！请重试。');
		}
    }
    //手机号 验证码快捷登录 发送验证码
    public function QuickReg() 
    {
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

        $phone = trim($_POST['phone']);
        
        //手机号验证
        if (empty($phone))
        {
            exit(json_encode(array('error_code' => 1, 'msg' => '手机号不能为空'),JSON_UNESCAPED_UNICODE));
        }
        if(!is_numeric($phone) || (strlen($phone) != 11))
        {
            exit(json_encode(array('error_code' => 1, 'msg' => '请输入正确手机号'),JSON_UNESCAPED_UNICODE));
        }

        $starttime = date("Y-m-d")." 00:00:00";
        $map['time'] = array('EGT', strtotime($starttime));
        $map['phone'] = $phone;

        //每天最多5次验证
        $count = Db::name('Sms_record')->where($map)->count();
        $recent = Db::name('Sms_record')->where(array('phone'=>$phone))->order('time desc')->select();
        $smsData = json_decode($recent,true);
        if($smsData)
        //间隔时间10分钟
        {
            $time_interval = time() - $smsData[0]['time'];
            if ($count>=5 || $time_interval <= 600 )
            {
                exit(json_encode(array('error_code' => 2, 'msg' => '您的手机短时间内验证次数过多，请稍后再试！')));
            }
        }
        $vcode = createRandomStr(6,true,true); // 生成6位数字的验证码
        $sms_text = "【袋鹿】您的快捷登录验证码是：".$vcode.",请在10分钟内使用。";     
        $data['sendto']='user';
        $data['type']='quickLogin';
        
        //调用短信接口
        $sendArr = array(
            'content' 	=> $sms_text,     //短信内容
            'mobile' 	=> $phone         //手机号码
        );
        $url 		= "http://www.api.zthysms.com/sendSms.do";
        $username 	= 'YRCWhy';
        $password 	= 'Yrcw123456';
        $ucpass = new \sendAPI($url, $username, $password); //这里第一个反斜杠是必须要有的。 
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
        

        // 本次的验证码及用户的相关信息存 User_modifypwd表
        $addtime = time();
        $expiry = $addtime + 1 * 600; /***  10分钟有效期 ***/
        $data = array('telphone' => $phone, 'vfcode' => $vcode, 'expiry' => $expiry, 'addtime' => $addtime);
        $user_modifypwdDb = Db::name('User_modifypwd');
        $insert_id = $user_modifypwdDb->insert($data);
        exit(json_encode(array('error_code' => 0, 'id' => $insert_id,'code'=>$vcode,'time'=>$addtime)));
    }
    //手机号 验证码快捷登录
    public function QuickLogin()
    {
        vendor('duanxin.sendAPI');
        $phone = isset($_POST['phone']) ? $_POST['phone'] : '';
        $vfycode = isset($_POST['vfycode']) ? $_POST['vfycode'] : '';
        //用户表 Customer
        $Userarr = Db::name('Customer')->where(array('phone' => $phone))->find(); 
        //之前有注册过
        if(!empty($Userarr))
        {
            //验证码验证
            $user_modifypwdDb = Db::name('User_modifypwd');     	
            $modifypwd = $user_modifypwdDb->where(array('vfcode' => $vfycode, 'telphone' => $phone))->find();
            if(empty($modifypwd))
            {
                exit(json_encode(array('error_code' => true, 'msg' => '验证码错误！'),JSON_UNESCAPED_UNICODE));
            }

            if (!empty($modifypwd))
            {
                $nowtime = time();
                if ($modifypwd['expiry'] < $nowtime) 
                {
                    exit(json_encode(array('error_code' => true, 'msg' => '验证码过期！'),JSON_UNESCAPED_UNICODE));
                }else{
                    $lastdata['last_ip'] = get_client_ip(1); //更新最后ip
                    $lastdata['last_time'] = time();  //更新登录时间
                    if(Db::name('Customer')->where(array('phone' => $phone))->update($lastdata))
                    {
                        $result = Db::name('Customer')->where(array('phone' => $phone))->find();
                    }
                }
            }  
        }else{  //之前没有注册
            //验证码验证
            $user_modifypwdDb = Db::name('User_modifypwd');     	
            $modifypwd = $user_modifypwdDb->where(array('vfcode' => $vfycode, 'telphone' => $phone))->find();
            if(empty($modifypwd))
            {
                exit(json_encode(array('error_code' => true, 'msg' => '验证码错误！'),JSON_UNESCAPED_UNICODE));
            }

            if (!empty($modifypwd))
            {
                $nowtime = time();
                if ($modifypwd['expiry'] < $nowtime) 
                {
                    exit(json_encode(array('error_code' => true, 'msg' => '验证码过期！'),JSON_UNESCAPED_UNICODE));
                }else{
                    $lastdata['phone'] = $phone;
                    $lastdata['user_name'] = $phone;
                    $lastdata['pwd'] = md5('123456'); //给个默认的密码
                    $randData = create_guid(); 
                    // $urlData = $_SERVER["REQUEST_SCHEME"].'://'.$_SERVER["SERVER_NAME"].':'.'8080'."/portal/login/register.html?invitation=$randData";
                    
                    $urlData = $_SERVER["REQUEST_SCHEME"].'://'.$_SERVER["SERVER_NAME"]."/portal/login/register.html?invitation=$randData";
                    
                    $lastdata['refer_code'] = $randData;
                    $lastdata['refer_url'] = $urlData;
                    $lastdata['add_time'] = $data_lastdatauser['last_time'] = $_SERVER['REQUEST_TIME'];
                    $lastdata['add_ip'] = $lastdata['last_ip'] = get_client_ip(1);
                    if(Db::name('Customer')->insert($lastdata))
                    {
                        $result = Db::name('Customer')->where(array('phone' => $phone))->find();   
                    }
                }
            }
        }

        if(isset($result))
        {
            cookie('user_name',$result['user_name'],'time()+3*24*3600');
            cookie('uid',$result['uid'],'time()+3*24*3600');
            $sms_text = '【袋鹿】欢迎'.$result['user_name'].'，使用短信快捷登录袋鹿旅行，祝您生活愉快！';       
            $data['uid'] = $result['uid'];
            $data['sendto'] = 'user';
            $data['type'] = 'quickLoginsucces';
            
            //调用短信接口
            $sendArr = array(
                'content' 	=> $sms_text,
                'mobile' 	=> $phone 
            );
            $url 		= "http://www.api.zthysms.com/sendSms.do";
            $username 	= 'YRCWhy';
            $password 	= 'Yrcw123456';
            $ucpass = new \sendAPI($url, $username, $password); 
            $ucpass->send_sms($phone,$sms_text,$sendArr,$data);
            exit(json_encode(array('error_code' => false, 'msg' => '短信快捷登录成功！'),JSON_UNESCAPED_UNICODE));
        }else{
            exit(json_encode(array('error_code' => true, 'msg' => '短信快捷登录失败！'),JSON_UNESCAPED_UNICODE));
        } 
    }
    
    /*******************  用户登录  *******************/
    // 登录页面
    public function login()
    {
        return $this->fetch();
    }

    public function do_login()
    {
        $user_name = isset($_POST['user_name']) ? $_POST['user_name'] : '';
        $pwd = isset($_POST['pwd']) ? $_POST['pwd'] : '';
        //验证正确后登录
        $result = $this->checkin($user_name, $pwd);
        if(isset($result['customer']))
        {
            // cookie('user_name',$result['customer']['user_name'],'time()+3*24*3600');
            // cookie('uid',$result['customer']['uid'],'time()+3*24*3600');

            cookie('user_name',$result['customer']['user_name'],1*39*3600);
            cookie('uid',$result['customer']['uid'],1*39*3600);
        }
        
        exit(json_encode($result,JSON_UNESCAPED_UNICODE));
    }

    /*帐号密码检入*/
    public function checkin($user_name,$pwd)
    {
        if (empty($user_name))
        {
			return array('error_code' => true, 'msg' => '用户名不能为空');
		}
        if (empty($pwd))
        {
			return array('error_code' => true, 'msg' => '密码不能为空');
        }
        $customer = Db::name('Customer');
        // $now_customer = $customer->field(true)->where(array('user_name' => $user_name))->find();
        $now_customer = $customer->field(true)->where("user_name='{$user_name}' OR phone='{$user_name}'")->find();
// print_r($now_customer);
// exit;
        if ($now_customer)
        {
            if($now_customer['user_name'] != $user_name && $now_customer['phone'] != $user_name){
				return array('error_code' => true, 'msg' => '用户名不正确!');
			}
			if($now_customer['pwd'] != md5($pwd)){
				return array('error_code' => true, 'msg' => '密码不正确!');
			}
			if($now_customer['status'] == 1){
				return array('error_code' => true, 'msg' => '该帐号被禁止登录!');
			}
			return array('error_code' =>false , 'msg' => 'OK' ,'customer'=>$now_customer);
		} else {
			return array('error_code' => true, 'msg' => '用户不存在!');
		}
    }


    // 忘記密码页面
    public function forget_password()
    {
        return $this->fetch();
    }
    /***生成短信-重置密码**** */
    public function Generate() 
    {
        vendor('duanxin.sendAPI');
        vendor('geetest.geetestlib'); //极验接口API
        //极 验
        $GtSdk = new \GeetestLib('d20edb0b278234139f70a118f021855c', 'b7f3c61169746ddf921c8ab885c14404');
        $verifyData = array(
                "user_id" => "test", # 网站用户id
                "client_type" => "web", #web:电脑上的浏览器；h5:手机上的浏览器，包括移动应用内完全内置的web_view；native：通过原生SDK植入APP应用的方式
                "ip_address" => "" # 请在此处传输用户请求验证时所携带的IP
        );
        $_SESSION['gtserver'] = 1;

        $phone = trim($_POST['phone']);
        
        //手机号验证
        if (empty($phone))
        {
            exit(json_encode(array('error_code' => 1, 'msg' => '手机号不能为空'),JSON_UNESCAPED_UNICODE));
        }
        if(!is_numeric($phone) || (strlen($phone) != 11))
        {
            exit(json_encode(array('error_code' => 1, 'msg' => '请输入正确手机号'),JSON_UNESCAPED_UNICODE));
        }
        $Userarr = Db::name('Customer')->where(array('phone' => $phone))->find(); 
        if(empty($Userarr))
        {
            exit(json_encode(array('error_code' => 3, 'msg' => '还没有账号？')));
        }

        // $starttime = date("Y-m-d")." 00:00:00";
        // $map['time'] = array('EGT', strtotime($starttime));
        $map['time'] = time();
        $map['phone'] = $phone;

        //每天最多5次验证
        $count = Db::name('Sms_record')->where($map)->count();
        $recent = Db::name('Sms_record')->where(array('phone'=>$phone))->order('time desc')->select();
        $smsData = json_decode($recent,true);
        if($smsData)
        //间隔时间10分钟,10分钟内的验证码有效，无须发送第二条
        {
            $time_interval = time() - $smsData[0]['time'];
            if ($count>=5 || $time_interval <= 600 )
            {
                exit(json_encode(array('error_code' => 2, 'msg' => '您的手机短时间内验证次数过多，请稍后再试！')));
            }
        }
        $vcode = createRandomStr(6,true,true); // 生成6位数字的验证码
        $sms_text = "【袋鹿】您的验证码是：".$vcode.",请在10分钟内使用。";     
        $data['uid'] = $Userarr['uid'];
        $data['sendto']='user';
        $data['type']='forgetCode';
        
        //调用短信接口
        $sendArr = array(
            'content' 	=> $sms_text,     //短信内容
            'mobile' 	=> $phone         //手机号码
        );
        $url 		= "http://www.api.zthysms.com/sendSms.do";
        $username 	= 'YRCWhy';
        $password 	= 'Yrcw123456';
        $ucpass = new \sendAPI($url, $username, $password); //这里第一个反斜杠是必须要有的。 
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
        // 本次的验证码及用户的相关信息存 User_modifypwd表
        $addtime = time();
        $expiry = $addtime + 1 * 600; /***  10分钟有效期 ***/
        $data = array('telphone' => $phone, 'vfcode' => $vcode, 'expiry' => $expiry, 'addtime' => $addtime);
        $user_modifypwdDb = Db::name('User_modifypwd');
        $insert_id = $user_modifypwdDb->insert($data);
        exit(json_encode(array('error_code' => 0, 'id' => $insert_id,'code'=>$vcode,'time'=>$addtime)));
    }

    /*** 修改密码 *****/
    public function pwdModify() {
        vendor('duanxin.sendAPI');
        $phone = isset($_POST['phone']) ? $_POST['phone'] : '';
        $newpwd = isset($_POST['pwd']) ? $_POST['pwd'] : '';
        $vfycode = isset($_POST['vfycode']) ? $_POST['vfycode'] : '';
        
        /**验证码验证*/ 		 
        $user_modifypwdDb = Db::name('User_modifypwd');
        $modifypwd = $user_modifypwdDb->where(array('vfcode' => $vfycode, 'telphone' => $phone))->find();
        if (!empty($modifypwd)) {
            $nowtime = time();
            if ($modifypwd['expiry'] < $nowtime) {
                exit(json_encode(array('error_code' => true, 'msg' => '验证码过期！')));
            }
        }
        if(empty($modifypwd))
        {
            exit(json_encode(array('error_code' => true, 'msg' => '验证码错误！')));
        }
        // $time = time();
        $time = date('Y-m-d H:i:s',time());
        $where['pwd'] = md5($newpwd);

        if (Db::name('Customer')->where(array('phone' => $phone))->update($where)) 
        {
            $userInfo = Db::name('Customer')->where(array('phone'=>$phone))->find();
            //修改成功后可自动登录
            cookie('user_name',$userInfo['user_name'],'time()+3*24*3600');
            cookie('uid',$userInfo['uid'],'time()+3*24*3600');

            $sms_text = '【袋鹿】提醒您,尊敬的：'.$userInfo['user_name'].'用户于'.$time.'修改了登录密码，请勿泄露！';       
            $data['uid'] = $userInfo['uid'];
            $data['sendto'] = 'user';
            $data['type'] = 'pwdModify';
            
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

            exit(json_encode(array('error_code' => false, 'msg' => '密码修改成功！')));
        } else {
            exit(json_encode(array('error_code' => true, 'msg' => '密码修改失败！')));
        } 

    }

    //退出用户账号
    public function un_rep()
    {
        session_start();
        unset($_SESSION['trip_id']);
        unset($_SESSION['rep']);
        setcookie('user_name','',time()-3600,'/'); 
        setcookie('uid','',time()-3600,'/'); 

        if(!isset($_SESSION['trip_id']))
        {
            $result['status'] = 'ok';
        }else{
            $result['status'] = 'false';
        }
        
        echo json_encode($result,JSON_UNESCAPED_UNICODE);
    }

}
