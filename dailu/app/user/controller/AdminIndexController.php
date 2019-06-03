<?php
// +----------------------------------------------------------------------
// | ThinkCMF [ WE CAN DO IT MORE SIMPLE ]
// +----------------------------------------------------------------------
// | Copyright (c) 2013-2017 http://www.thinkcmf.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed ( http://www.apache.org/licenses/LICENSE-2.0 )
// +----------------------------------------------------------------------
// | Author: Powerless < wzxaini9@gmail.com>
// +----------------------------------------------------------------------

namespace app\user\controller;

use cmf\controller\AdminBaseController;
use think\Db;

/**
 * Class AdminIndexController
 * @package app\user\controller
 *
 * @adminMenuRoot(
 *     'name'   =>'用户管理',
 *     'action' =>'default',
 *     'parent' =>'',
 *     'display'=> true,
 *     'order'  => 10,
 *     'icon'   =>'group',
 *     'remark' =>'用户管理'
 * )
 *
 * @adminMenuRoot(
 *     'name'   =>'用户组',
 *     'action' =>'default1',
 *     'parent' =>'user/AdminIndex/default',
 *     'display'=> true,
 *     'order'  => 10000,
 *     'icon'   =>'',
 *     'remark' =>'用户组'
 * )
 */
class AdminIndexController extends AdminBaseController
{

    /**
     * 后台本站用户列表
     * @adminMenu(
     *     'name'   => '本站用户',
     *     'parent' => 'default1',
     *     'display'=> true,
     *     'hasView'=> true,
     *     'order'  => 10000,
     *     'icon'   => '',
     *     'remark' => '本站用户',
     *     'param'  => ''
     * )
     */
    public function index()
    {
        // $where   = [];
        // $request = input('request.');

        // if (!empty($request['uid'])) {
        //     $where['id'] = intval($request['uid']);
        // }
        // $keywordComplex = [];
        // if (!empty($request['keyword'])) {
        //     $keyword = $request['keyword'];

        //     $keywordComplex['user_login|user_nickname|user_email']    = ['like', "%$keyword%"];
        // }
        // $usersQuery = Db::name('user');

        // $list = $usersQuery->whereOr($keywordComplex)->where($where)->order("create_time DESC")->paginate(10);
        // Db::name('Customer')
        // // 获取分页显示
        // $page = $list->render();
        // $this->assign('list', $list);
        // $this->assign('page', $page);

        /////
        vendor('Page.system_page'); //分页
        $p = isset($_GET['page'])?$_GET['page']:1;

        $where   = [];
        $request = input('request.');

        $keywordComplex = [];
        if (!empty($request['keyword'])) {
            $keyword = $request['keyword'];

            $keywordComplex['user_name|phone'] = ['like', "%$keyword%"];
        }

        $list = Db::name('Customer')->whereOr($keywordComplex)->order("add_time DESC")->page($p.',40')->select()->toarray();
        $list2 = Db::name('Customer')->whereOr($keywordComplex)->order("add_time DESC")->select()->toarray();
        $count = Db::name('Customer')->whereOr($keywordComplex)->count();
        foreach($list as &$l)
        {
            foreach($list2 as &$value)
            {
                //注册来源
                if(!empty($l['p_refer_code']))
                {
                    if($l['p_refer_code'] == $value['refer_code'])
                    {
                        $l['p_name'] = $value['user_name'];
                    }
                }
               
                
            } 
        }

        foreach($list as &$vv)
        {
        	$num = Db::name('trip_info')->where(array('uid'=>$vv['uid'],'status'=>2))->count();
        	$vv['num'] = $num;
          	if(!isset($vv['p_name']))
            {
                $vv['p_name'] = '自己注册';
            }
        }
        // print_r($list);
        // 获取分页显示
        // $page = $list->render();

        $Page       =  new \Page($count,2);// 实例化分页类 传入总记录数和每页显示的记录数
        $show       =  $Page->show();// 分页显示输出
        $this->assign('page',$show);
        $this->assign('list', $list);
        // 渲染模板输出
        return $this->fetch();
    }

    //内部用户列表
    public function insiders()
    {
        vendor('Page.system_page'); //分页
        $p = isset($_GET['page'])?$_GET['page']:1;

        $where   = [];
        $request = input('request.');

        $keywordComplex = [];
        if (!empty($request['keyword'])) {
            $keyword = $request['keyword'];

            $keywordComplex['user_name|phone'] = ['like', "%$keyword%"];
        }
        $insiders = 2;
        $where2['insiders'] = $insiders;
        $list = Db::name('Customer')->whereOr($keywordComplex)->order("add_time DESC")->whereOr($where2)->page($p.',40')->select()->toarray();
        $list2 = Db::name('Customer')->whereOr($keywordComplex)->order("add_time DESC")->whereOr($where2)->select()->toarray();
        $count = Db::name('Customer')->whereOr($keywordComplex)->whereOr($where2)->count();
        $this->assign('insiders',$insiders);
        foreach($list as &$l)
        {
            foreach($list2 as &$value)
            {
                //注册来源
                if(!empty($l['p_refer_code']))
                {
                    if($l['p_refer_code'] == $value['refer_code'])
                    {
                        $l['p_name'] = $value['user_name'];
                    }
                }
               
                
            } 
        }

        foreach($list as &$vv)
        {
        	$num = Db::name('trip_info')->where(array('uid'=>$vv['uid'],'status'=>2))->count();
        	$vv['num'] = $num;
          	if(!isset($vv['p_name']))
            {
                $vv['p_name'] = '自己注册';
            }
        }

        $Page       =  new \Page($count,40);// 实例化分页类 传入总记录数和每页显示的记录数
        $show       =  $Page->show();// 分页显示输出
        $this->assign('page',$show);
        $this->assign('list', $list);
        // 渲染模板输出
        return $this->fetch();
    }

    //会员列表
    public function members()
    {
        vendor('Page.system_page'); //分页
        $p = isset($_GET['page'])?$_GET['page']:1;

        $where   = [];
        $request = input('request.');

        $keywordComplex = [];
        if (!empty($request['keyword'])) {
            $keyword = $request['keyword'];

            $keywordComplex['user_name|phone'] = ['like', "%$keyword%"];
        }
        $insiders = 1;
        $where2['insiders'] = $insiders;
        $list = Db::name('Customer')->whereOr($keywordComplex)->order("add_time DESC")->whereOr($where2)->page($p.',40')->select()->toarray();
        $list2 = Db::name('Customer')->whereOr($keywordComplex)->order("add_time DESC")->whereOr($where2)->select()->toarray();
        $count = Db::name('Customer')->whereOr($keywordComplex)->whereOr($where2)->count();
        $this->assign('insiders',$insiders);

        foreach($list as &$l)
        {
            foreach($list2 as &$value)
            {
                //注册来源
                if(!empty($l['p_refer_code']))
                {
                    if($l['p_refer_code'] == $value['refer_code'])
                    {
                        $l['p_name'] = $value['user_name'];
                    }
                }
               
                
            } 
        }

        foreach($list as &$vv)
        {
        	$num = Db::name('trip_info')->where(array('uid'=>$vv['uid'],'status'=>2))->count();
        	$vv['num'] = $num;
          	if(!isset($vv['p_name']))
            {
                $vv['p_name'] = '自己注册';
            }
        }

        $Page       =  new \Page($count,40);// 实例化分页类 传入总记录数和每页显示的记录数
        $show       =  $Page->show();// 分页显示输出
        $this->assign('page',$show);
        $this->assign('list', $list);
        // 渲染模板输出
        return $this->fetch();
    }

    /**
     * 本站用户拉黑
     * @adminMenu(
     *     'name'   => '本站用户拉黑',
     *     'parent' => 'index',
     *     'display'=> false,
     *     'hasView'=> false,
     *     'order'  => 10000,
     *     'icon'   => '',
     *     'remark' => '本站用户拉黑',
     *     'param'  => ''
     * )
     */
    public function ban()
    {
        $id = input('param.id', 0, 'intval');
        if ($id) {
            $result = Db::name("user")->where(["id" => $id, "user_type" => 2])->setField('user_status', 0);
            if ($result) {
                $this->success("会员拉黑成功！", "adminIndex/index");
            } else {
                $this->error('会员拉黑失败,会员不存在,或者是管理员！');
            }
        } else {
            $this->error('数据传入失败！');
        }
    }

    /**
     * 本站用户启用
     * @adminMenu(
     *     'name'   => '本站用户启用',
     *     'parent' => 'index',
     *     'display'=> false,
     *     'hasView'=> false,
     *     'order'  => 10000,
     *     'icon'   => '',
     *     'remark' => '本站用户启用',
     *     'param'  => ''
     * )
     */
    public function cancelBan()
    {
        $id = input('param.id', 0, 'intval');
        if ($id) {
            Db::name("user")->where(["id" => $id, "user_type" => 2])->setField('user_status', 1);
            $this->success("会员启用成功！", '');
        } else {
            $this->error('数据传入失败！');
        }
    }
}
