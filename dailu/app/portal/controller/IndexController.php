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

class IndexController extends HomeBaseController
{
    public function index()
    {   
        return  $this->fetch('/index');
    }
    
    public function un_rep()
    {
        return $this->fetch();
    }
    public function do_un_rep()
    {
        session_start();
        unset($_SESSION['rep']);
    }

    //首页第二屏 热门行程数据
    public function hot_planData()
    {
        //清除上一次操作的session数据
        session_start();
        unset($_SESSION);
        session_destroy(); 
    	// 根据点击量多少排序输出（此规则暂时屏蔽，暂使用春节Top8原则）
        // $field = array('uid','trip_id','trip_name','custom_title','day_num','date','submit_time','status','click_num','travel_title');
        // $plan_info = Db::name('plan_info')->where(array('status'=>2))->limit(8)->order('click_num desc')->select()->toArray();
        // foreach($plan_info as &$plan)
        // {
        //     $plan['info'] = unserialize(base64_decode($plan['schedufing']));
        //     $plan['info'] = json_decode(json_encode($plan['info']),true);
        //     // print_r($plan['info']);
        //     foreach($plan['info'] as $info)
        //     {
        //         foreach($info['day_arry'] as $arr)
        //         {
        //             if(!empty($arr['day']))
        //             {
        //                 foreach($arr['day'] as $jing)
        //                 {
        //                     $plan['jindian'][] = $jing['this_name'];
        //                     if(!empty( $jing['info']['spot_image_url']))
        //                     {
        //                         $plan['image_cover'] = $jing['info']['spot_image_url'];
        //                     }
        //                 }
        //             }
        //         }
        //     }
        //     unset($plan['schedufing']);
        //     $trip_info = Db::name('trip_info')->field($field)->where(array('status'=>2,'trip_id'=>$plan['trip_id']))->find();
        //     if(!empty($trip_info))
        //     {
        //         $trip_info['month'] = $this->cut_str($trip_info['date'],'-',-2);  

        //         $customer = Db::name('Customer')->where(array('uid'=>$trip_info['uid']))->find();
        //         $trip_info['user_name'] = $customer['user_name']; 
        //         $trip_info['jindian_name'] = $plan['jindian'];
        //         $trip_info['image_cover'] = $plan['image_cover']; 
        //         //如果用户自己编写了行程单的标题，使用此此标题；若没有编写，使用默认标题
        //         if(!empty($trip_info['travel_title']))
        //         {
        //             unset($trip_info['trip_name']);
        //             $trip_info['trip_name'] = $trip_info['travel_title'];
        //         }
        //         $result[] =  $trip_info;
        //     }
           
        // }
        // //根据点击量多少排序输出
        // $arrSort = array();
        // foreach($result AS $key => $value){
        //     foreach($value AS $k=>$v){
        //         $arrSort[$k][$key] = $v;
        //     }
        // }
        // //取出一維數組
        // $arr1 = array_map(create_function('$arrSort', 'return $arrSort["click_num"];'), $result);
        // array_multisort($arr1,SORT_DESC,$result );//多维数组的排序

        // 春节Top8原则
        $field = array('uid','trip_id','trip_name','custom_title','day_num','date','submit_time','status','click_num','travel_title','theme','before_eight','cover');
        $trip_info = Db::name('trip_info')->field($field)->limit(8)->order('before_eight desc')->select()->toArray();
        foreach($trip_info as &$tripValue)
        {
            $plan_info = Db::name('plan_info')->where(array('trip_id'=>$tripValue['trip_id']))->find();
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
                                if(isset($jing['this_name'])){
                                    $plan_info['jindian'][] = $jing['this_name'];
                                }
                                if(!empty( $jing['info']['spot_image_url']))
                                {
                                    $plan_info['image_cover'] = $jing['info']['spot_image_url'];
                                }
                            }
                        }
                    }
                }
                unset($plan_info['schedufing']);
                // $tripValue['month'] = $this->cut_str($trip_info['date'],'-',-2);  

                $customer = Db::name('Customer')->where(array('uid'=>$plan_info['uid']))->find();
                $tripValue['user_name'] = $customer['user_name']; 
                $tripValue['jindian_name'] = $plan_info['jindian'];
                //封面图
                if(!empty($tripValue['cover']))
                {
                    $ab ='http://';
                    // $trip['image_cover'] = cmf_get_image_preview_url($trip['cover']);
                    $tripValue['image_cover'] = $ab.$_SERVER['HTTP_HOST'].$tripValue['cover'];  
                }else{
                    $tripValue['image_cover'] =  $plan_info['image_cover'];
                }
                //如果用户自己编写了行程单的标题，使用此此标题；若没有编写，使用默认标题
                if(!empty($tripValue['travel_title']))
                {
                    unset($tripValue['trip_name']);
                    $tripValue['trip_name'] = $tripValue['travel_title'];
                }
            }
        }
        // print_r($trip_info);
        // exit;
        $result = $trip_info;

        $dataRselut['tourList'] = $result;     
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

    // 测试脚本 更新plan_info表的schedufing 字段，序列化形式
    // public function aa()
    // {
    //     $plan_info = Db::name('plan_info')->select()->toarray();
    //     foreach($plan_info as $plan)
    //     {
    //         $a = json_decode($plan['schedufing']);
    //         $b = base64_encode(serialize($a));
    //         $data['schedufing'] = $b;
    //         Db::name('plan_info')->where(array('id'=>$plan['id']))->update($data);
    //     }
        
    // }
}
