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
namespace app\store\controller;
use think\Db;

use cmf\controller\AdminBaseController;

/******************** 反馈管理 **********************/
class storeController extends AdminBaseController{
    
    //酒店订单页面
    public function hotelOrderList(){
        $order_cancel = DB::name('order_cancel')->field("*,'酒店' as order_type ")->where('order_type','hotel')->select()->toarray();
        $this->assign('order_cancel',$order_cancel);
        return $this->fetch();
    }
    //酒店订单页面
    public function airOrderList(){
    	// $a = [['name'=>'王兵','id'=>'123'],['name'=>'王磊','id'=>'4564']];
    	// echo $bn = json_encode($a);exit;

        $order_cancel = DB::name('order_cancel')->field("*,'机票' as order_type ")->where('order_type','flight')->select()->toarray();
        foreach ($order_cancel as $key => &$value) {
       		$value['passenger_info'] = json_decode($value['passenger_info'],true);
        }
        // print_r($order_cancel);exit;
        $this->assign('order_cancel',$order_cancel);
        return $this->fetch();
    }
}