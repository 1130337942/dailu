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
namespace app\portal\controller;

use cmf\controller\HomeBaseController;
use think\Db;

/**
 * 行程总览
 * 
 **/
class VisitoverviewController extends HomeBaseController
{
    // //行程总览页面
    public function visit()
    {
        return $this->fetch();
    }
    public function overview()
    {
        echo 11;
        session_start();
        $post = $_POST;
    print_r($post);
        // $_SESSION['data'] = $post;
    }

}