<?php
// +----------------------------------------------------------------------
// | ThinkCMF [ WE CAN DO IT MORE SIMPLE ]
// +----------------------------------------------------------------------
// | Copyright (c) 2013-2017 http://www.thinkcmf.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed ( http://www.apache.org/licenses/LICENSE-2.0 )
// +----------------------------------------------------------------------
// | Author: iokakaxi <thinkcmf@126.com>
// +----------------------------------------------------------------------
namespace app\advice\controller;
use think\Db;

use cmf\controller\AdminBaseController;

/******************** 意见反馈 **********************/
class FeedbackController extends AdminBaseController
{
    public function index()
    {
        vendor('Page.system_page'); //分页
        $p = isset($_GET['page'])?$_GET['page']:1;
        //按照问题类型查询
        $where = array(); 
        if (!empty($_GET['pro_type'])) {
            $where['pro_type']= $_GET['pro_type'];
        }
        //按照问题来源查询
        if (!empty($_GET['problem_go'])) {
            $where['problem_go'] = $_GET['problem_go'];
        }
        //按照日期区间查询
        if (!empty($_GET['feedback_time'])) {
            $start_time = strtotime(substr($_GET['feedback_time'],0,10));
            $end_time = strtotime(substr($_GET['feedback_time'],13));
            $where['feedback_time'] = array('between', array($start_time, $end_time));
        }

        $adviceData = Db::name('Advice')->where($where)->page($p.',20')->select()->toarray();
        foreach($adviceData as &$advice)
        {
            $customer = Db::name('Customer')->where(array('uid'=>$advice['uid']))->find();
            $advice['user_name'] = $customer['user_name'];
            $advice['image_url'] = cmf_get_image_url($advice['pic']);
            if(empty($advice['pic']))
            {
                $advice['image_url'] = '无图片';
            }
        }
        $count = Db::name('Advice')->where($where)->count();
        $Page       =  new \Page($count,20);// 实例化分页类 传入总记录数和每页显示的记录数
        $show       =  $Page->show();// 分页显示输出
        $this->assign('page',$show);// 赋值分页输出
        $this->assign('adviceData',$adviceData); 
        return $this->fetch();
    }

    //删除反馈记录
    public function DeleteAdvice()
    {
        $get = $_GET;
        if (Db::name('Advice')->where(array('id' => $get['id']))->delete()) {
            $result = array('status'=>'ok');
        }
        echo json_encode($result,JSON_UNESCAPED_UNICODE);
    }
}