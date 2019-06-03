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
namespace app\news\controller;
use think\Db;

use cmf\controller\AdminBaseController;

/******************** 反馈管理 **********************/
class newsController extends AdminBaseController{
    
    //app新闻页面
    public function appNewsList(){
        vendor('Page.system_page'); //分页
        $where = [];
        $where['source'] = 'APP';
        $p = isset($_GET['page'])?$_GET['page']:1;
        $type = input('post.type');
        $title = input('post.title');
        $writer = input('post.writer');
        $hot_spot = input('post.hot_spot');
        $type ? $where['type']=$type : null;//按照类型查询
        $title ? $where['title']=['like','%'.$title.'%'] : null;//按照标题查询
        $writer ? $where['writer']=['like','%'.$writer.'%'] : null;//按照标题查询
        $hot_spot ? $where['hot_spot']=$hot_spot : null;//按照类型查询
        $news_data = Db::name('news')->where($where)->order('id desc')->page($p.',20')->select()->toArray();
        foreach ($news_data as $key => &$value) {
            $value['image'] = cmf_get_image_url($value['image']);
        }
        $count = Db::name('news')->where($where)->count();
        $Page = new \Page($count,20);// 实例化分页类 传入总记录数和每页显示的记录数
        $show = $Page->show();// 分页显示输出
        // print_r($news_data);exit;
        $this->assign('page',$show);// 赋值分页输出
        $this->assign('news_data',$news_data);
        return $this->fetch();
    }

    //app新闻发布页面
    public function appNews(){
        return $this->fetch();
    }

    //添加app新闻
    public function addAppNews(){
        $data = input('post.');
        $data['source'] = 'APP';
        $data['create_time'] = time();
        $result = Db::name('news')->insert($data);
        if($result){
            $back = ['status' => true,'msg' => '提交成功'];
        }else{
            $back = ['status' => false,'msg' => '提交失败'];
        }
        echo json_encode($back);
    }

    //删除新闻
    public function deleteNews(){
        $get = $_GET;
        if(Db::name('news')->where(array('id' => $get['id']))->delete()){
            $result = array('status'=>'ok');
        }else{
            $result = array('status'=>'no');
        }
        echo json_encode($result,JSON_UNESCAPED_UNICODE);
    }

    //pc新闻页面
    public function pcNewsList(){
        vendor('Page.system_page'); //分页
        $where = [];
        $where['source'] = 'PC';
        $p = isset($_GET['page'])?$_GET['page']:1;
        $type = input('post.type');
        $title = input('post.title');
        $writer = input('post.writer');
        $hot_spot = input('post.hot_spot');
        $type ? $where['type']=$type : null;//按照类型查询
        $title ? $where['title']=['like','%'.$title.'%'] : null;//按照标题查询
        $writer ? $where['writer']=['like','%'.$writer.'%'] : null;//按照标题查询
        $hot_spot ? $where['hot_spot']=$hot_spot : null;//按照类型查询
        $news_data = Db::name('news')->where($where)->order('id desc')->page($p.',20')->select()->toArray();
        foreach ($news_data as $key => &$value) {
            $value['image'] = cmf_get_image_url($value['image']);
        }
        $count = Db::name('news')->where($where)->count();
        $Page = new \Page($count,20);// 实例化分页类 传入总记录数和每页显示的记录数
        $show = $Page->show();// 分页显示输出
        // print_r($news_data);exit;
        $this->assign('page',$show);// 赋值分页输出
        $this->assign('news_data',$news_data);
        return $this->fetch();
    }

    //新闻发布页面
    public function pcNews(){
        return $this->fetch();
    }

    //修改app新闻
    public function editAppNews(){
        $id = input('post.id');
        $news_data = Db::name('news')->where('id',$id)->find();
        $this->assign('news_data',$news_data);
        return $this->fetch();
    }

    //添加pc新闻
    public function addPcNews(){
        $data = input('post.');
        $data['source'] = 'PC';
        $data['create_time'] = time();
        $result = Db::name('news')->insert($data);
        if($result){
            $back = ['status' => true,'msg' => '提交成功'];
        }else{
            $back = ['status' => false,'msg' => '提交失败'];
        }
        echo json_encode($back);
    }

    //app新闻banner链接匹配列表
    public function matchNewsList(){
        $news_list = Db::name('news_match')->select()->toArray();
        foreach ($news_list as $key => &$value) {
            $value['image'] = cmf_get_image_url($value['image']);
        }
        $this->assign('news_list',$news_list);
        return $this->fetch();
    }

    //添加app新闻banner链接匹配页面
    public function matchNews(){
        return $this->fetch();
    }
    //添加app新闻banner链接匹配
    public function addMatchNews(){
        $data = input('post.');
        $data['news_url'] = trim($data['news_url']);
        $data['create_time'] = time();
        $result = Db::name('news_match')->insert($data);
        if($result){
            $back = ['status' => true,'msg' => '提交成功'];
        }else{
            $back = ['status' => false,'msg' => '提交失败'];
        }
        echo json_encode($back);
    }

    //删除app新闻banner链接匹配
    public function delMatchNews(){
        $get = $_GET;
        if(Db::name('news_match')->where(array('id' => $get['id']))->delete()){
            $result = array('status'=>'ok');
        }else{
            $result = array('status'=>'no');
        }
        echo json_encode($result,JSON_UNESCAPED_UNICODE);
    }   

    //是否展示app新闻匹配
    public function showStatus(){
        $status = input('post.status');
        $sort = input('post.sort');
        $id = input('post.id');
        if(Db::name('news_match')->where('id',$id)->update(['status'=>$status,'sort'=>$sort])){
            $result = array('status'=>'ok');
        }else{
            $result = array('status'=>'no');
        }
        echo json_encode($result,JSON_UNESCAPED_UNICODE);
    } 
}