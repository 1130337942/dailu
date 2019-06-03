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
namespace app\well\controller;
use think\Db;

use cmf\controller\AdminBaseController;

/******************** 当季热门城市管理 **********************/
class MakeController extends AdminBaseController
{
    public function index()
    {
        vendor('Page.system_page'); //分页
        $p = isset($_GET['page'])?$_GET['page']:1;
        //按照问题类型查询
        $where = array(); 
        if (!empty($_GET['problem_go'])) {
            if($_GET['problem_go'] == 'wellcity'){
                $where['wellcity'] = 1;
            }else{
                $where['wellcity'] = 0;
            }
        }
        if (!empty($_GET['keyword'])) {
            $where['city_name'] = $_GET['keyword'];
        }
        $field = array('id,city_id,city_name,province_id,province_name,wellcity');
        $cityData = Db::name('City_details')->field($field)->where($where)->page($p.',30')->select()->toarray();
        $count = Db::name('City_details')->where($where)->count();
        $Page       =  new \Page($count,30);// 实例化分页类 传入总记录数和每页显示的记录数
        $show       =  $Page->show();// 分页显示输出
        $this->assign('page',$show);// 赋值分页输出
        $this->assign('cityData',$cityData); 
        return $this->fetch();
    }

    //设置/取消 当季热门城市 wellcity
    public function recommend()
    {
        $param = $this->request->param();

        if (isset($param['ids']) && isset($param["yes"])) {
            $ids = $this->request->param('ids/a');

            Db::name('City_details')->where(['id' => ['in', $ids]])->update(['wellcity' => 1]);
            $this->success("设置成功！", 'Make/index');

        }
        if (isset($param['ids']) && isset($param["no"])) {
            $ids = $this->request->param('ids/a');

            Db::name('City_details')->where(['id' => ['in', $ids]])->update(['wellcity' => 0]);
            $this->success("取消成功！", 'Make/index');
        }
    }
}