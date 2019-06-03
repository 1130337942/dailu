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
use think\Db;

use cmf\controller\HomeBaseController; 


/***************** 个人主页 ****************/
class AboutUserController extends HomeBaseController
{
    public function aboutus()
    {
        return $this->fetch();
    }
    public function contactus()
    {
        return $this->fetch();
    }
    //意见反馈页面
    public function advice()
    {
        return $this->fetch();
    }
    //接收意见数据
    public function personalData()
    {
        $post = $_POST;
        $data['uid'] = $post['uid'];
        $data['content'] = $post['info'];
        $data['pro_type'] = $post['info_type'];
        $data['problem_go'] = $post['adviceType'];  //问题来源，pc，app
        $data['feedback_time'] = time();   //反馈时间
        //图片
        $files = $_FILES['file'];
        $tmp_name = $_FILES['file']['tmp_name'];
        $fileName = $_SERVER['DOCUMENT_ROOT'].'/upload/portal/advice/'.$files['name']; 
        move_uploaded_file($tmp_name,iconv("UTF-8","gb2312",$fileName));
        $data['pic'] ='/upload/portal/advice/'.$files['name'];
        // print_r($data);   exit;
        if(Db::name('Advice')->insert($data))
        {
            $result = array('status'=>'true','msg'=>'提交反馈成功！');
        } else{
            $result = array('status'=>'false','msg'=>'提交反馈失败，请重新提交！');
        }
        echo json_encode($result,JSON_UNESCAPED_UNICODE);

    }


    /*** 发布行程 ***/
    public function personal_addTour()
    {
        return $this->fetch();
    }
   
    public function addTouData()
    {
        $post = $_POST;
        $uid = $post['uid'];
        $where['uid'] = $uid;
        $trip_info = Db::name('trip_info')->field(array('uid','trip_name','trip_id','custom_title','day_num','date','creat_time','submit_time','travel_title','cover'))->where($where)->where('status=1 or status=2')->order('id desc')->select()->toArray();
        $plan_info = Db::name('plan_info')->where($where)->where('status=1 or status=2')->order('id desc')->select()->toArray();
        foreach($plan_info as &$plan)
        {
            $plan['info'] = unserialize(base64_decode($plan['schedufing']));
            $plan['info'] = json_decode(json_encode($plan['info']),true);
            foreach($plan['info'] as $info)
            {
                foreach($info['day_arry'] as $arr)
                {
                    if(!empty($arr['day']))
                    {
                        foreach($arr['day'] as $jing)
                        {
                            if(isset($jing['this_name'])){
                                $plan['jindian'][] = $jing['this_name'];
                            }
                            if(!empty( $jing['info']['spot_image_url']))
                            {
                                $plan['image_cover'] = $jing['info']['spot_image_url'];
                            }
                        }
                    }
                }
            }
            unset($plan['schedufing']);
            foreach($trip_info as &$trip)
            {
                $trip['submitDate'] = date('Y-m-d', $trip['submit_time']);//发布时间
                //如果用户自己编写了行程单的标题，使用此此标题；若没有编写，使用默认标题
                if(!empty($trip['travel_title']))
                {
                    unset($trip['trip_name']);
                    $trip['trip_name'] = $trip['travel_title'];
                }
                //由于之前的单中的缺少一些后期添加的字段
                //在这个时间2018/12/18之前的单不让编辑，只可以查看；之后的单可以查看，可以编辑
                if($trip['creat_time'] > 1545062400)
                {
                    $trip['old_new'] = 'new';
                }else{
                    $trip['old_new'] = 'old';
                }

                if($plan['trip_id'] == $trip['trip_id'])
                {
                    if(isset($plan['jindian'])){
                        $trip['jindian_name'] = $plan['jindian'];
                    }
                    if(!empty($trip['cover']))
                    {
                        // $ab ='http://';
                        // $trip['image_cover'] = $ab.$_SERVER['HTTP_HOST'].$trip['cover'];   
                        if(strstr($trip['cover'], 'http')){
                            $trip['image_cover'] = $trip['cover'];   
                        }else{
                            $ab ='http://';
                            $trip['image_cover'] = $ab.$_SERVER['HTTP_HOST'].$trip['cover'];  
                        }
                        
                    }else{
                        $trip['image_cover'] = $plan['image_cover'];
                    }
                }
            }
        }

        foreach($trip_info as &$tt)
        {
            $tt['month'] = $this->cut_str($tt['date'],'-',-2);
        }
        foreach($trip_info as $y=>$o)
        {
            $result[] = $o;
        }
        echo json_encode($result,JSON_UNESCAPED_UNICODE);
    }

    /*** 用户推广 ***/
    public function user_invitation()
    {
        return $this->fetch();
    }
   

    //个人中心
    public function personal_center()
    {
        return $this->fetch();
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
            // $image_url = '/upload/portal/headphoto/'.date('Ymd').'/'.$image_name;   
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

    //个人信息
    public function PersonalInfo()
    {
        $post = $_POST;
        $uid = $post['uid'];
        $field = array('uid','user_name','sign','phone','head_port','man_cover','email','birth','resid_addres','sex');
        $result = Db::name('Customer')->field($field)->where(array('uid'=>$uid))->find();
        $result['birthDate'] = date('Y-m-d', $result['birth']);
        echo json_encode($result,JSON_UNESCAPED_UNICODE);
    }
    //个人中心修改个人信息
    public function EditPersonal()
    {
        vendor('duanxin.sendAPI');
        $post = $_POST;
        $uid = $post['uid'];
        $customer = Db::name('Customer');
        $field = array('uid','user_name','sign','phone','head_port','man_cover','email','birth','resid_addres','sex');
        if($post['type'] == 'user_name'){$data['user_name'] = $post['user_name'];}

        if($post['type'] == 'sign'){$data['sign'] = $post['sign'];}

        if($post['type'] == 'phone'){$data['phone'] = $post['phone'];}

        if($post['type'] == 'email'){$data['email'] = $post['email'];}

        if($post['type'] == 'sex'){$data['sex'] = $post['sex'];}

        if($post['type'] == 'birth'){$data['birth'] = strtotime($post['birth']);}

        if($post['type'] == 'resid_addres'){ $data['resid_addres'] = $post['resid_addres'];}
        //图像的格式是base64的。
        if($post['type'] == 'head_port') 
        {
            $orgurl = '/upload/portal/headphoto/'.date('Ymd').'/';
            $imageresult = $this->saveBase64Image($post['head_port'],$orgurl);
            $data['head_port'] = $imageresult['url'];
        }
  
        if(isset($data))
        {
            $user = $customer->where(array('uid'=>$uid))->update($data);
            if( false !== $user)
            {
                $result = Db::name('Customer')->field($field)->where(array('uid'=>$uid))->find();
                exit(json_encode(array('status' => 'ok', 'message' => '修改成功！','userInfo'=>$result)));
            }
        }
       

        //修改密码
        if($post['type'] == 'password')
        {
            $old_pwd = $post['old_pwd'];
            $userInfo = $customer->where(array('uid'=>$uid))->find();
            $phone = $userInfo['phone'];
            $time = date('Y-m-d H:i:s',time());
            if(md5($old_pwd) != $userInfo['pwd']){
                exit(json_encode(array('status' => false, 'message' => '原密码错误，请重新输入！')));
            }else{
                $pwd['pwd'] = md5($post['new_pwd']);
                if($customer->where(array('uid'=>$uid))->update($pwd))
                {
                    $sms_text = '【袋鹿】提醒您,尊敬的：'.$userInfo['user_name'].'用户于'.$time.'修改了登录密码，请务泄露！';       
                    $data['uid'] = $uid;
                    $data['sendto'] = 'user';
                    $data['type'] = 'pwdModify';
                    
                    //调用短信接口
                    $sendArr = array(
                        'content' 	=> $sms_text, 
                        'mobile' 	=> $userInfo['phone'] 
                    );
                    $url 		= "http://www.api.zthysms.com/sendSms.do";
                    $username 	= 'YRCWhy';
                    $password 	= 'Yrcw123456';
                    $ucpass = new \sendAPI($url, $username, $password); //这里第一个反斜杠是必须要有的。 
                    $ucpass->send_sms($phone,$sms_text,$sendArr,$data);
                    exit(json_encode(array('status' => 'ok', 'message' => '密码修改成功！')));
                }
            }   
        }

    }
    
          

    public function invitationData()
    {
        $post = $_POST;
        $uid = $post['uid'];
        $userData = Db::name('Customer')->field(array('uid','refer_code','register_data','is_audit'))->where(array('uid'=>$uid))->find();
        echo json_encode($userData,JSON_UNESCAPED_UNICODE);
    }


    /*** 行程计划  ***/
    public function personal_planTour()
    {
        //在个人中心点击编辑行程，必须先清空之前的session里的值
        session_start();
        unset($_SESSION);
        session_destroy(); 
        
        return $this->fetch();
    }

    public function personal_planData()
    {
        $post = $_POST;
        $uid = $post['uid'];
        $trip_info = Db::name('trip_info')->field(array('uid','trip_name','trip_id','custom_title','day_num','date','creat_time','submit_time','travel_title','cover','whe_hide','status','p_trip_id'))->where(array('uid'=>$uid))->order('id desc')->select()->toArray();
        $plan_info = Db::name('plan_info')->where(array('uid'=>$uid))->order('id desc')->select()->toArray();
        foreach($plan_info as &$plan)
        {
            $plan['info'] = unserialize(base64_decode($plan['schedufing']));
            $plan['info'] = json_decode(json_encode($plan['info']),true);
            foreach($plan['info'] as $info)
            {
                foreach($info['day_arry'] as $arr)
                {
                    if(!empty($arr['day']))
                    {
                        foreach($arr['day'] as $jing)
                        {
                             if(isset($jing['this_name'])){
                                $plan['jindian'][] = $jing['this_name'];
                            }
                            if(!empty( $jing['info']['spot_image_url']))
                            {
                                $plan['image_cover'] = $jing['info']['spot_image_url'];
                            }
                        }
                    }
                }
            }
            unset($plan['schedufing']);
            foreach($trip_info as &$trip)
            {
                $trip['creatDate'] = date('Y-m-d', $trip['creat_time']);//创建时间
                //如果用户自己编写了行程单的标题，使用此此标题；若没有编写，使用默认标题
                if(!empty($trip['travel_title']))
                {
                    unset($trip['trip_name']);
                    $trip['trip_name'] = $trip['travel_title'];
                }
                //由于之前的单中的缺少一些后期添加的字段
                //在这个时间2018/12/19 18:00之前的单不让编辑，只可以查看；之后的单可以查看，可以编辑
                if($trip['creat_time'] > 1545213633)
                {
                    $trip['old_new'] = 'new';
                }else{
                    $trip['old_new'] = 'old';
                }
               
                if($plan['trip_id'] == $trip['trip_id'])
                {
                    if(isset( $plan['jindian'])){
                        $trip['jindian'][] =  $plan['jindian'];
                    }
                    
                    if(!empty($trip['cover']))
                    {
                        if(strstr($trip['cover'], 'http')){
                            $trip['image_cover'] = $trip['cover'];   
                        }else{
                            $ab ='http://';
                            $trip['image_cover'] = $ab.$_SERVER['HTTP_HOST'].$trip['cover'];  
                        }
                    }else{
                        $trip['image_cover'] = $plan['image_cover'];
                    }
                    $trip['isoredit'] = $plan['isoredit']; //是否在h5中进行了编辑（0-没有，默认），（1-有修改)
                }
            }
        }
        
        foreach($trip_info as &$tt){
            if($tt['p_trip_id'] == 0){
                $tt['month'] = $this->cut_str($tt['date'],'-',-2);
            }else{  
                //复制的行程单,根据创建的时间，选择月份
                $tt['month'] = $this->cut_str($tt['creatDate'],'-',-2);
            }
        }
        //按照月份分组
        $data =  [];  //初始化一个数组                                  
        foreach($trip_info as $k=>$v)
        {
            $data[$v['month']][] = $v;  //根据month 进行数组重新赋值

        }
        foreach($data as $y=>$o)
        {
            $result[] = $o;
        }
        $userData = Db::name('customer')->where(array('uid'=>$uid))->field('uid,insiders')->find();
        $dataRselut['tourList'] = $result;
        $dataRselut['num'] = count($trip_info);  
        $dataRselut['insiders'] = $userData['insiders']; 
        // print_r($dataRselut);
        echo json_encode($dataRselut,JSON_UNESCAPED_UNICODE);
    }
    
    /**
     * 按符号截取字符串的指定部分
     * @param string $str 需要截取的字符串
     * @param string $sign 需要截取的符号
     * @param int $number 如是正数以0为起点从左向右截  负数则从右向左截
     * @return string 返回截取的内容
    */
    function cut_str($str,$sign,$number){
        $array=explode($sign, $str);
        $length=count($array);
        if($number<0){
            $new_array=array_reverse($array);
            $abs_number=abs($number);
            if($abs_number>$length){
                return 'error';
            }else{
                return $new_array[$abs_number-1];
            }
        }else{
            if($number>=$length){
                return 'error';
            }else{
                return $array[$number];
            }
        }
    }
    //收藏列表页面
    public function personal_collectTour()
    {
        return $this->fetch();
    }
    //收藏列表数据
    public function CollectData()
    {
        $post = $_POST;
        $uid = $post['uid'];   
        $collectData = Db::name('Collect')->where(array('collect_user'=>$uid))->select()->toarray();
        // print_r($collectData);
        // exit;
        foreach($collectData as $ckey=>&$collect)
        {
            $trip_info = Db::name('trip_info')->field(array('uid','trip_name','trip_id','custom_title','day_num','date','creat_time','submit_time','cover'))->where(array('trip_id'=>$collect['collect_id']))->find();
            $plan_info = Db::name('plan_info')->where(array('trip_id'=>$collect['collect_id']))->find();
            //取制作人的名字、头像
            if(isset($plan_info))
            {
                $userData = Db::name('Customer')->field(array('user_name','head_port'))->where(array('uid'=>$plan_info['uid']))->find();   
                $trip_info['user_name'] = $userData['user_name'];
                $trip_info['head_port'] = $userData['head_port'];

                $sch = unserialize(base64_decode($plan_info['schedufing']));
                $schedufing = json_decode(json_encode($sch),true);
                foreach($schedufing as $info)
                {
                    foreach($info['day_arry'] as $arr)
                    {
                        if(!empty($arr['day']))
                        {
                            foreach($arr['day'] as $jing)
                            {
                                if(isset($jing['this_name'])){
                                    $collect['jindian_name'][] = $jing['this_name'];
                                }
                                if(!empty( $jing['info']['spot_image_url']))
                                {
                                    $collect['image_cover'] = $jing['info']['spot_image_url'];
                                }
                            }
                        }
                    }
                } 
                if(!empty($trip_info['cover']))
                {
                    if(strstr($trip_info['cover'], 'http')){
                        $collect['image_cover']  = $trip_info['cover'];   
                    }else{
                        $ab ='http://';
                        $collect['image_cover'] = $ab.$_SERVER['HTTP_HOST'].$trip_info['cover'];  
                    } 
                }else{
                    $collect['image_cover'] =  $collect['image_cover'];
                }
            }
            if(!empty($trip_info)){
                $trip_info['submitDate'] = date('Y-m-d', $trip_info['submit_time']);//发布时间
                $collect['info'] = $trip_info;
            }else{
                unset($collectData[$ckey]);
            }
           
        }
        $collectData = array_merge($collectData);
        echo json_encode($collectData,JSON_UNESCAPED_UNICODE);
    }

    public function personal_recordTour()
    {
        return $this->fetch();
    }
    public function dailu_msg()
    {
        return $this->fetch();
    }

    //个人中心删除行程
    public function DelTrip()
    {
        $post = $_POST;
        $trip_id = $post['trip_id'];
        // $trip_id = '50-1535934985';
        //行程单数据表
        $result = Db::name('Plan_info')->where(array('trip_id'=>$trip_id))->delete();
        $result = Db::name('trip_info')->where(array('trip_id'=>$trip_id))->delete();
        if($result){
            $result = Db::name('city_line')->where(array('trip_id'=>$trip_id))->delete();
            Db::name('hotel')->where(array('trip_id'=>$trip_id))->delete();
            Db::name('eat_money')->where(array('trip_id'=>$trip_id))->delete();
            Db::name('traffic_money')->where(array('trip_id'=>$trip_id))->delete();
            //收藏列表
            Db::name('Collect')->where(array('collect_id'=>$trip_id))->delete();
            //行程单海报表数据
            Db::name('Poster')->where(array('trip_id'=>$trip_id))->delete();
            $return = array('status'=>true,'msg'=>'删除成功');
        }else{
            $return = array('status'=>false,'msg'=>'删除失败');
        }
        echo json_encode($return,JSON_UNESCAPED_UNICODE);
    }

    //海报模板页
    public function create_poster()
    {
        return $this->fetch();
    }

    //保存行程单海报
    public function AddPoster()
    {
        $post = $_POST;
        $data['trip_id'] = $post['trip_id'];
        // $data['poster_name'] = $post['poster_name'];
       
        // $data['team_number'] = $post['team_number'];
        // $data['team_price'] = $post['team_price'];
        // $data['departure_date'] = $post['departure_date'];
        
        // $data['team_title'] = $post['team_title'];
        // $data['price_title'] = $post['price_title'];
        // $data['date_title'] = $post['date_title'];
        $data['creat_time'] = $data['update_time'] = time();
        // $uid = substr($post['trip_id'],0,strpos($post['trip_id'], '-'));
        //旅行社名称
        // $data['agency'] = $post['agency'];
        //备注信息
        // $data['remarks'] = $post['remarks'];
        //海报图片
        $base64_image_content = $post['pic'];
        $orgurl = '/upload/portal/poster/'.date('Ymd').'/';
        $imageresult = $this->saveBase64Image($base64_image_content,$orgurl);
        $data['pic'] = $imageresult['url'];
        $ab ='http://';
        $image_cover = $ab.$_SERVER['HTTP_HOST'].$imageresult['url'];  

        //旅行社logo
        // $base64_logo = $post['logo'];
        // $logourl = '/upload/portal/poster/'.date('Ymd').'/';
        // $logoresult = $this->saveBase64Image($base64_logo,$logourl);
        // $data['logo'] = $logoresult['url'];
        //落款
        // $data['inscribe'] = $post['inscribe'];
        //整体特色
        // $data['allchara'] = $post['allchara'];

        // $c['agency'] = $post['agency'];
       
        //行程封面(如果上传了新的封面，更新到行程单表)
        // $base64_cover = $post['cover'];
        // $coverurl = '/upload/portal/cover/'.date('Ymd').'/';
        // if(!empty($base64_cover))
        // {
        //     $coverresult = $this->saveBase64Image($base64_cover,$coverurl);
        //     $data2['cover'] = $coverresult['url'];
        //     Db::name('trip_info')->where(array('trip_id'=>$post['trip_id']))->update($data2);
        // }

        $isOr = Db::name('Poster')->where(array('trip_id'=>$post['trip_id']))->find();
        if($isOr)
        {
            // 修改
            $result = Db::name('Poster')->where(array('trip_id'=>$post['trip_id']))->update($data);
            // $result = Db::name('Customer')->where(array('uid'=>$uid))->update($c);
        }else{
            // 添加
            $result = Db::name('Poster')->insert($data);
            // $result = Db::name('Customer')->where(array('uid'=>$uid))->update($c);
        }
       
        if(false !== $result)
        {
            $return = array('status'=>true,'msg'=>'保存成功','data'=>$image_cover);
        }else{
            $return = array('status'=>false,'msg'=>'保存失败','data'=>'');
        }
        echo json_encode($return,JSON_UNESCAPED_UNICODE);
    }

    //修改海报(渲染)
    public function EditPoster()
    {
        $post = $_POST;
        $trip_id = $post['trip_id'];
        $field = array('id','trip_id','poster_name','team_number','team_price','pic','departure_date','logo','agency','remarks','inscribe','allchara','team_title','price_title','date_title','travel_price');
        $tripInfo = Db::name('trip_info')->field(array('trip_id','cover'))->where(array('trip_id'=>$trip_id))->find();
        $uid = substr($trip_id,0,strpos($trip_id, '-'));

        $result = Db::name('Poster')->field($field)->where(array('trip_id'=>$trip_id))->find();
        if($result)
        {
            $result['departure_date'] = $result['departure_date'];
            $ab ='http://';
            $result['pic'] = $ab.$_SERVER['HTTP_HOST'].$result['pic']; 
            $result['logo'] = $ab.$_SERVER['HTTP_HOST'].$result['logo']; 
            if(!empty($tripInfo['cover'])){
                $result['cover'] = $ab.$_SERVER['HTTP_HOST'].$tripInfo['cover'];
            }else{
                $result['cover'] = '';
            }
            $return = array('status'=>true,'msg'=>'查询成功','data'=>$result);
        }else{
            $cData = Db::name('Customer')->where(array('uid'=>$uid))->field('agency,uid')->find();
            $return = array('status'=>false,'msg'=>'查询常用旅行成功','data'=>$cData['agency']);
        }
        echo json_encode($return,JSON_UNESCAPED_UNICODE);
    }

    //是否隐藏费用清单
    public function HideExpense()
    {
        $post = $_POST;
        $trip_id = $post['trip_id'];
        $data['whe_hide'] = $post['whe_hide'];
        $result = Db::name('trip_info')->where(array('trip_id'=>$trip_id))->update($data);
        if($result !== false)
        {  
            $return = array('status'=>true,'msg'=>'设置成功');
        }else{
            $return = array('status'=>false,'msg'=>'设置失败');
        }
        echo json_encode($return,JSON_UNESCAPED_UNICODE);
    }

    //设置成属于自己的更多优质行程
    public function SelfMore()
    {
        $post = input('post.');
        $trip_id = $post['trip_id']; 
        $data['status'] = $post['status'];   //3-自己的优质行程，0-一般行程
        $result = Db::name('trip_info')->where(array('trip_id'=>$trip_id))->update($data);
        $result = Db::name('plan_info')->where(array('trip_id'=>$trip_id))->update($data);
        if($result !== false)
        {  
            $return = array('status'=>true,'msg'=>'设置成功');
        }else{
            $return = array('status'=>false,'msg'=>'设置失败');
        }
        echo json_encode($return,JSON_UNESCAPED_UNICODE);
    }
    //用户自己新增景点
    public function personal_addspot()
    {
        return $this->fetch();
    }
    //我的景点
    public function personal_spot()
    {
        return $this->fetch();
    }
    
    //我的景点列表
    public function MySpot()
    {
        $uid = input('post.uid');
        $field = array('id','uid','spot_name','creat_time','address','pic','play_time','city_name');
        $Data = Db::name('New_spot')->field($field)->where(array('uid'=>$uid))->order('creat_time desc')->select()->toarray();
        foreach($Data as &$dvalue){
            $dvalue['maketime'] = date("Y-m-d H:i:s",$dvalue['creat_time']);
            $dvalue['image_cover'] =  $dvalue['pic'];
            unset( $dvalue['pic'],$dvalue['creat_time']);
        }

        if($Data)
        {
            $return = array('status'=>true,'msg'=>'请求成功','data'=>$Data);
        }else{
            $return = array('status'=>false,'msg'=>'请求失败','data'=>[]);
        }
        echo json_encode($return,JSON_UNESCAPED_UNICODE);
    }

}
