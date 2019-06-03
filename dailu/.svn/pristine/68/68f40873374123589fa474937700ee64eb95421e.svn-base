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
namespace app\Activity\controller;
use think\Db;

use cmf\controller\AdminBaseController;

/******************** 反馈管理 **********************/
class ActivityController extends AdminBaseController{
    
    //app新闻页面
    public function activityList(){
        vendor('Page.system_page'); //分页
        $where = [];
        $p = isset($_GET['page'])?$_GET['page']:1;
        $activity = input('post.activity');
        $spot_name = input('post.spot_name');
        $activity ? $where['activity']=['like','%'.$activity.'%'] : null;//按照标题查询
        $spot_name ? $where['spot_name']=['like','%'.$spot_name.'%'] : null;//按照景点查询
        $news_data = Db::name('spot_select')->where($where)->order('id desc')->page($p.',20')->select()->toArray();
        $count = Db::name('spot_select')->where($where)->count();
        $Page = new \Page($count,20);// 实例化分页类 传入总记录数和每页显示的记录数
        $show = $Page->show();// 分页显示输出
        $this->assign('page',$show);// 赋值分页输出
        $this->assign('news_data',$news_data);
        return $this->fetch();
    }

    //活动发布页面
    public function releaseActivity(){

        return $this->fetch();
    }

    //添加活动
    public function addActivity(){
        $data = input('post.');
        $data['start_time'] = str_replace('-','.',$data['start_time']);
        $data['end_time'] = str_replace('-','.',$data['end_time']);
        $data['prize'] = json_encode($data['prize'],JSON_UNESCAPED_UNICODE);
        $data['rules'] = json_encode($data['rules'],JSON_UNESCAPED_UNICODE);
        // print_r($data);exit;
        $result = Db::name('spot_select')->insert($data);
        if($result){
            $back = ['status' => true,'msg' => '提交成功'];
        }else{
            $back = ['status' => false,'msg' => '提交失败'];
        }
        echo json_encode($back);
    }

    //删除活动
    public function deleteActivity(){
        $get = $_GET;
        if(Db::name('spot_select')->where(array('id' => $get['id']))->delete()){
            $result = array('status'=>'ok');
        }else{
            $result = array('status'=>'no');
        }
        echo json_encode($result,JSON_UNESCAPED_UNICODE);
    }

    //报名列表
    public function activityUserList(){
        vendor('Page.system_page'); //分页
        $where = [];
        $p = isset($_GET['page'])?$_GET['page']:1;
        $name = input('post.user_name');
        $phone = input('post.user_phone');
        $name ? $where['user_name']=['like','%'.$name.'%'] : null;//按照名字查询
        $phone ? $where['user_phone']=['like','%'.$phone.'%'] : null;//按照电话查询
        $news_data = Db::name('spot_activity_user')->where($where)->order('id desc')->page($p.',20')->select()->toArray();
        $count = Db::name('spot_activity_user')->where($where)->count();
        $Page = new \Page($count,20);// 实例化分页类 传入总记录数和每页显示的记录数
        $show = $Page->show();// 分页显示输出
        $this->assign('page',$show);// 赋值分页输出
        $this->assign('news_data',$news_data);
        return $this->fetch();
    }

    //删除用户
    public function delActivityUser(){
        $get = $_GET;
        if(Db::name('spot_activity_user')->where(array('id' => $get['id']))->delete()){
            $result = array('status'=>'ok');
        }else{
            $result = array('status'=>'no');
        }
        echo json_encode($result,JSON_UNESCAPED_UNICODE);
    }   

    //活动用户途径景点
    public function userSpots(){
        vendor('Page.system_page'); //分页
        $where = [];
        $name = input('post.user_name');
        $phone = input('post.user_phone');
        $name ? $where['user_name']=['like','%'.$name.'%'] : null;//按照名字查询
        $phone ? $where['user_phone']=['like','%'.$phone.'%'] : null;//按照电话查询
        $p = isset($_GET['page'])?$_GET['page']:1;

        $spots = Db::name('spot_select')->select()->toArray();
        $users = Db::name('spot_activity_user')->column('user_phone');
        $where['user_phone'] = [['in',$users],['like','%'.$phone.'%']];
        $user_spots = [];
        foreach ($spots as $k => $v) {
            $where['spot_name'] = ['in',$v['spot_name']];
            $where['activity_id'] = $v['id'];
            $user_spots[$v['activity']] = Db::name('spot_activity_record')->field("id,user_phone,user_name,GROUP_CONCAT(spot_name) as spot_name")->where($where)->group('user_phone')->order('id desc')->page($p.',20')->select()->toArray();
        }
        $count = Db::name('spot_activity_record')->where($where)->count();
        $Page = new \Page($count,20);// 实例化分页类 传入总记录数和每页显示的记录数
        $show = $Page->show();// 分页显示输出
        $this->assign('page',$show);// 赋值分页输出
        $this->assign('user_spots',$user_spots);
        return $this->fetch();
    }

}