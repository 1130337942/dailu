<?php
// +----------------------------------------------------------------------
// | ThinkCMF [ WE CAN DO IT MORE SIMPLE ]
// +----------------------------------------------------------------------
// | Copyright (c) 2013-2019 http://www.thinkcmf.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed ( http://www.apache.org/licenses/LICENSE-2.0 )
// +----------------------------------------------------------------------
// | Author: iokakaxi <thinkcmf@126.com>
// +----------------------------------------------------------------------
namespace app\advice\controller;
use think\Db;

use cmf\controller\AdminBaseController;

/******************** 旅行社权限申请 **********************/
class ApplyagencyController extends AdminBaseController
{
    public function index()
    {
        // vendor('Page.system_page'); //分页
        // $p = isset($_GET['page'])?$_GET['page']:1;
        $where = [];
        $request = input('request.');
        if (!empty($request['keyword'])) {
            $keyword = $request['keyword'];

            $where['user_name|phone'] = ['like', "%$keyword%"];
        }

        $Apply_agency = Db::name('Apply_agency')->where($where)->select()->toarray();
        // print_r($Apply_agency );
        // exit;
        // $count = Db::name('Apply_agency')->where($where)->count();
        // $Page       =  new \Page($count,20);// 实例化分页类 传入总记录数和每页显示的记录数
        // $show       =  $Page->show();// 分页显示输出
        // $this->assign('page',$show);// 赋值分页输出
        $this->assign('Apply_agency',$Apply_agency); 
        return $this->fetch();
    }

    //审核通过成为旅行社权限
    public function applyok() {
        $get = $_GET;
        if($get['way'] == 0)
        {
            $data['insiders'] = 3;
        }
        if($get['way'] == 1)
        {
            $data['insiders'] = 1;
        }
        // print_r($data);
        // exit;
        $tag= Db::name('Apply_agency')->where(array('uid' => $get['uid']))->update($data);
        $tag= Db::name('Customer')->where(array('uid' => $get['uid']))->update($data);
        if ($tag !== false) {
            $result = array('status'=>'ok');
        }
        echo json_encode($result,JSON_UNESCAPED_UNICODE);
    }

    //已经存在旅行社权限的用户列表，（insiders = 3）
    public function complete() {
        $wherecom = [];
        $request = input('request.');
        if (!empty($request['keyword'])) {
            $keyword = $request['keyword'];

            $wherecom['user_name|phone'] = ['like', "%$keyword%"];
        }

        $agencyed =  Db::name('Customer')->where(array('insiders' => 3))->where($wherecom)->select()->toArray();
        $this->assign('agencyed',$agencyed); 
        return $this->fetch();
    }
    
}