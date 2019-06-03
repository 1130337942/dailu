<?php
// +----------------------------------------------------------------------
// | ThinkCMF [ WE CAN DO IT MORE SIMPLE ]
// +----------------------------------------------------------------------
// | Copyright (c) 2013-2017 http://www.thinkcmf.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed ( http://www.apache.org/licenses/LICENSE-2.0 )
// +----------------------------------------------------------------------
// | Author:  <thinkcmf@126.com>
// +----------------------------------------------------------------------
namespace app\portal\controller;
use think\Db;

use cmf\controller\HomeBaseController; 


/***************** 个人主页 ****************/
class newsController extends HomeBaseController
{
   
    public function newsList(){
        return $this->fetch();
    }

    public function make_time($data){
        $time = time();
        foreach ($data as $key => &$value) {
            $diff_time = ($time-$value['create_time'])/3600;
            if($diff_time<24){
                $value['time'] = ceil($diff_time).'小时前';
            }else{
                $value['time'] = ceil($diff_time/24).'天前';
            }
        }
        return $data;
    }
    public function getNewsList(){
        $p = isset($_POST['page'])?$_POST['page']:1;
        $type = input('post.type') ? input('post.type') : '';
        $where = [];
        $where['source'] = 'PC';
        if($type){
            $where['type'] = $type;
        }
        $news_db = Db::name('news');
        $news_list = $news_db->where($where)->order('id desc')->page($p.',8')->select()->toArray();
        foreach ($news_list as $key => &$value) {
            $value['image'] = cmf_get_image_url($value['image']);
        }
        $news_list = $this->make_time($news_list);
        $hot_news_list = $news_db->where(['hot_spot'=>'true','source'=>'PC'])->order('id desc')->limit(5)->select()->toArray();
        $hot_news_list = $this->make_time($hot_news_list);
        $result = ['news_list'=>$news_list,'hot_news_list'=>$hot_news_list];
        echo json_encode($result,JSON_UNESCAPED_UNICODE);
    }

    public function details(){
        $id = $_GET['id'];
        $news_detail = Db::name('news')->where('id',$id)->find();
        if(empty($news_detail)){
            $this->error('暂无该新闻');
        }
        $hot_news = Db::name('news')->field('id,title,create_time')->where(['hot_spot'=>'true','source'=>'PC'])->order('id desc')->limit(5)->select()->toArray();
        $news_detail['content'] = htmlspecialchars_decode($news_detail['content']);
        $hot_news = $this->make_time($hot_news);
        $this->assign('hot_news',$hot_news);
        $this->assign('news_detail',$news_detail);
        return $this->fetch();
    }

    public function mdetails(){
        $id = $_GET['id'];
        $news_detail = Db::name('news')->where('id',$id)->find();
        $news_detail['content'] = htmlspecialchars_decode($news_detail['content']);
        $this->assign('news_detail',$news_detail);
        return $this->fetch();
    }
}
