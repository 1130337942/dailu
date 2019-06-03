<?php
// +----------------------------------------------------------------------
// | ThinkCMF [ WE CAN DO IT MORE SIMPLE ]
// +----------------------------------------------------------------------
// | Copyright (c) 2013-2018 http://www.thinkcmf.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed ( http://www.apache.org/licenses/LICENSE-2.0 )
// +----------------------------------------------------------------------
// | Author: kakaxi <thinkcmf@126.com>
// +----------------------------------------------------------------------
namespace app\portal\controller;
use think\Db;

use cmf\controller\HomeBaseController;

class TravelController extends HomeBaseController
{
    public function travelShare()
    {
        return $this->fetch();
    }
    public function travelCourse()
    {
        return $this->fetch();
    }
    //达人行程
    public function talentTrip()
    {
        return $this->fetch();
    }

    //达人行程页面数据
    public function TalentShow()
    {
        vendor('Page.system_page'); //分页
        $p = isset($_POST['page'])?$_POST['page']:1;
        // 根据点击量多少排序输出（此规则暂时屏蔽，暂使用春节原则）
        // $field = array('uid','trip_id','trip_name','custom_title','day_num','date','submit_time','status','click_num','travel_title');
        // $plan_info = Db::name('plan_info')->where(array('status'=>2))->order('click_num desc')->page($p.',16')->select()->toArray();
        // $rows = Db::name('trip_info')->where(array('status'=>2))->count(); //计算数组所得到记录总数
        // $pageSize = 16;     //每页展示的数据条数
        // $pagecount = ceil($rows / $pageSize);   //总页数
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
        $statusWhere['status'] = 'status=1 OR status=2';
        $field = array('uid','trip_id','trip_name','custom_title','day_num','date','submit_time','status','click_num','travel_title','theme','before_eight','cover');
        //暂时屏蔽审核
        // $trip_info = Db::name('trip_info')->field($field)->where(array('status'=>2))->order('theme desc')->page($p.',16')->select()->toArray();
        // $rows = Db::name('trip_info')->where(array('status'=>2))->count(); //计算数组所得到记录总数
        //暂时不需要审核
        $trip_info = Db::name('trip_info')->field($field)->where('status', 1)->whereor('status', 2)->order('theme desc')->page($p.',16')->select()->toArray();
        $rows = Db::name('trip_info')->where('status', 1)->whereor('status', 2)->count(); //计算数组所得到记录总数

        $pageSize = 16;     //每页展示的数据条数
        $pagecount = ceil($rows / $pageSize);   //总页数
        foreach($trip_info as &$tripValue)
        {
            //暂时屏蔽审核
            // $plan_info = Db::name('plan_info')->where(array('status'=>2,'trip_id'=>$tripValue['trip_id']))->find();
            //暂时不需要审核
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
                                $plan_info['jindian'][] = $jing['this_name'];
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
                    $tripValue['image_cover'] = $plan_info['image_cover']; 
                }
                //如果用户自己编写了行程单的标题，使用此此标题；若没有编写，使用默认标题
                if(!empty($tripValue['travel_title']))
                {
                    unset($tripValue['trip_name']);
                    $tripValue['trip_name'] = $tripValue['travel_title'];
                }
            }
        }
        $result = $trip_info;
        
        $dataRselut['tourList'] = $result;   
        $dataRselut['pagecount'] = $pagecount;
        $dataRselut['status'] = 'true';
        $dataRselut['msg'] = '数据返回成功！';
        echo json_encode($dataRselut,JSON_UNESCAPED_UNICODE);
    }

    //达人行程搜索条件
    public function SearchTalent()
    {
        $post = $_POST;
        $city_name = isset($post['city_name']) ? $post['city_name'] : '';  //目的地(城市名称)
        $month = isset($post['month']) ? $post['month'] : '';           //月份
        $day_num = isset($post['day_num']) ? $post['day_num'] : '';    //行程天数

        $wherelist = array();
        $urlist=array();

        //获取查询条件
        if(!empty($city_name)){
            $wherelist[] = "trip_name like '%$city_name%' or travel_title like '%$city_name%'";
            $urllist[]="city_name=".$city_name; 
        }

        if(!empty($month)){
            if($month != '-all-')
            {
                $wherelist[] = "date like '%$month%'";
                $urllist[]="month=".$month;  
            }  
        }
        if(!empty($day_num))
        {
            if($day_num != 'all')
            {
                if( strstr($day_num, '-'))
                {
                    $res = explode('-',$day_num);
                    $wherelist[] = "day_num between $res[0] and $res[1]";
                    $urllist[]="day_num=".$day_num;
                }else{
                    $wherelist[] = "day_num >= 21";
                    $urllist[]="day_num=".$day_num;
                }
            }
            
        }
       // print_r($wherelist);

        //判断查询条件
        $where = isset($where) ? $where : '';
        if(count($wherelist) > 0)
        {
            $where = implode('and ',$wherelist); //注意and后面的空格
            $url='&'.implode('& ',$urllist);
        }

        vendor('Page.system_page'); //分页
        $p = isset($_POST['page'])?$_POST['page']:1;

        $statusWhere['status'] = '1 OR 2';

        $field = array('uid','trip_id','trip_name','custom_title','day_num','date','submit_time','status','click_num','travel_title','cover');
        $trip_info = Db::name('trip_info')->field($field) ->order('click_num desc')->where($where)->where($statusWhere)->page($p.',16')->select()->toArray();

        $rows = Db::name('trip_info')->where($where)->where($statusWhere)->count(); //计算数组所得到记录总数
        $pageSize = 16;     //每页展示的数据条数
        $pagecount = ceil($rows / $pageSize);   //总页数

        foreach($trip_info as &$trip)
        {
            $plan_info = Db::name('plan_info')->where(array('trip_id'=>$trip['trip_id']))->where($statusWhere)->find();

            if(!empty($plan_info))
            {
                $plan['info'] = unserialize(base64_decode($plan_info['schedufing']));
                $plan['info'] = json_decode(json_encode($plan['info']),true);
                foreach($plan['info'] as $info)
                {
                    foreach($info['day_arry'] as $arr)
                    {
                        if(!empty($arr['day']))
                        {
                            foreach($arr['day'] as $jing)
                            {
                                $trip['jindian_name'][] = $jing['this_name'];
                                if(!empty( $jing['info']['spot_image_url']))
                                {
                                    $trip['image_cover'] = $jing['info']['spot_image_url']; 
                                }
                            }
                        }
                    }
                }
                unset($plan_info['schedufing']);
            }
            //封面图
            if(!empty($trip['cover']))
            {
                $ab ='http://';
                // $trip['image_cover'] = cmf_get_image_preview_url($trip['cover']);
                $trip['image_cover'] = $ab.$_SERVER['HTTP_HOST'].$trip['cover'];  
            }else{
                $trip['image_cover'] =  $trip['image_cover'];
            }
            $trip['month'] = $this->cut_str($trip['date'],'-',-2);  
            $customer = Db::name('Customer')->where(array('uid'=>$trip['uid']))->find();
            $trip['user_name'] = $customer['user_name']; 
         	
            $result =  $trip_info;
        } 
        // print_r($result);
        //根据点击量多少排序输出
        $arrSort = array();

        if(isset($result))
        {
        	foreach($result AS $key => &$vvv){
                //如果用户自己编写了行程单的标题，使用此此标题；若没有编写，使用默认标题
	            if(!empty($vvv['travel_title']))
	            {
	                unset($vvv['trip_name']);
	                $vvv['trip_name'] = $vvv['travel_title'];
	            }           
            }

            foreach($result AS $key => $value){
                foreach($value AS $k=>$v){
                    $arrSort[$k][$key] = $v;
                }
            }
            //取出一維數組
            $arr1 = array_map(create_function('$arrSort', 'return $arrSort["click_num"];'), $result);
            array_multisort($arr1,SORT_DESC,$result);//多维数组的排序
            $dataRselut['tourList'] = $result;   
            $dataRselut['pagecount'] = $pagecount;
            $dataRselut['status'] = 'true';
            $dataRselut['msg'] = '检索成功！';
            echo json_encode($dataRselut,JSON_UNESCAPED_UNICODE);
        }else{
            $dataRselut = array('status'=>'false','msg'=>'没有检索到相关数据！');
            echo json_encode($dataRselut,JSON_UNESCAPED_UNICODE);
        }
       
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
   
}