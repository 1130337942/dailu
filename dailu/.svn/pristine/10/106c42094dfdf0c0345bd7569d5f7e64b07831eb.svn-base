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
namespace app\trip\controller;
use think\Db;

use cmf\controller\AdminBaseController;

/***************** 行程管理 ==》达人分享 ****************/
class TriplistController extends AdminBaseController
{
    public function index()
    {
        vendor('Page.system_page'); //分页
        $p = isset($_GET['page'])?$_GET['page']:1;
        //搜索条件获取
        //  模糊查询
        $where_condition = array();
        
        if (!empty($_GET['keyword'])) 
        {
            $queryString = $_GET['keyword'];
            if(strlen($queryString) > 0)
            {
                $where_condition['trip_id']= "$queryString";
            }
        }

        // $urlData = $_SERVER["REQUEST_SCHEME"].'://'.$_SERVER["SERVER_NAME"].':'.'8080'."/portal/itinerary/tripinfoShare.html";
        $urlData = $_SERVER["REQUEST_SCHEME"].'://'.$_SERVER["SERVER_NAME"]."/portal/itinerary/tripinfoShare.html";
        $field = array('id','uid','trip_id','custom_title','trip_name','submit_time','pass_time','creat_time','status');
        $trip_info = Db::name('trip_info')->field($field)->where($where_condition)->order('creat_time desc')->page($p.',30')->select()->toArray();

        foreach($trip_info as &$t)
        {
            $url =$urlData.'?' ."them=".$t['uid'].'&'."trip=".$t['trip_id'];
            $t['url'] = urlencode($url);
            $user = Db::name('Customer')->field('user_name')->where(array('uid'=>$t['uid']))->find();
            $t['user_name'] = $user['user_name'];
        }

        $count = Db::name('trip_info')->whereOr($where_condition)->count();
        $Page       =  new \Page($count,30);// 实例化分页类 传入总记录数和每页显示的记录数
        $show       =  $Page->show();// 分页显示输出
        $this->assign('page',$show);// 赋值分页输出

        $this->assign('trip_info',$trip_info);
        return $this->fetch();
    }

    public function getarcode(){
        $url = $_GET['url'];
        import('phpqrcode',EXTEND_PATH);
        $errorCorrectionLevel = 'L'; //容错级别
        $matrixPointSize = 3; //生成图片大小  
        // 生成二维码图片     
        $mytest = new \QRcode();
        $a = $mytest::png($url,false, $errorCorrectionLevel, $matrixPointSize, 2);
        echo $a;
    }
}
