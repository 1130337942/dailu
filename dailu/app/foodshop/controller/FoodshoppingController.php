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
namespace app\foodshop\controller;
use think\Db;

use cmf\controller\AdminBaseController;

/******************** 美食购物 **********************/
class FoodshoppingController extends AdminBaseController
{
    public function index()
    {
        return $this->fetch();
    }
}