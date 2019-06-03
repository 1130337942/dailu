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
namespace app\spot\controller;
use think\Db;

use cmf\controller\AdminBaseController;

/********************     景点管理  ======本土体验  **********************/
class LocalController extends AdminBaseController
{
        //简要介绍列表显示
        public function describe()
        {
            vendor('Page.system_page'); //分页
            $p = isset($_GET['page'])?$_GET['page']:1;
            //  模糊查询
            $where = array();
            if (!empty($_GET['keyword'])) 
            {
                $queryString = $_GET['keyword'];
                if(strlen($queryString) > 0)
                {
                    $where['spot_name']= array('like',"%$queryString%");
                }
            }
            //默认是按照id进行查询的，这里根据是否置顶is_top进行查询显示
            $natureData = Db::name('Describe')->whereOr($where)->page($p.',30')->order('is_top desc')->select();
            $natureResult = json_decode($natureData,true);
            $count = Db::name('Describe')->whereOr($where)->count();
            $Page       =  new \Page($count,30);
            $show       =  $Page->show();
            $this->assign('page',$show);
            $this->assign('p',$p); 
            $this->assign('natureResult', $natureResult);
            return $this->fetch();
        }
        
        //添加本土体验的简要介绍
        public function add_describe()
        {
            //获取省份信息
            $area = $this->getPro();
            $this->assign('area',$area);
            return $this->fetch();
        }
        //处理添加本土体验的简要介绍
        public function do_add_describe()
        {
            if($_POST)
            {
                $post = $_POST;
                $areaDB = Db::name('Area');
                $introduceData['province_id'] = $post['province_id'];
                $introduceData['city_id'] = $post['city_id'];
                $introduceData['area_id'] = $post['area_id'];
                $introduceData['type'] = $post['type'];
                $introduceData['spot_name'] = $post['spot_name'];
                $introduceData['longitude'] = $post['longitude'];
                $introduceData['latitude'] = $post['latitude'];
                $introduceData['spot_Introduction'] = $post['spot_Introduction'];
                $introduceData['absture'] = $post['absture'];
                $introduceData['suit_season'] = $post['suit_season'];
                $introduceData['suit_time'] = $post['suit_time'];
                $introduceData['period_time']=$post['period_time'];
                $introduceData['not_modifity']=$post['not_modifity'];
                
                if(!empty($post['phone']))
                {
                    $introduceData['phone'] = $post['phone'];
                }
                
                $introduceData['address'] = $post['address'];
                $introduceData['attractions_tickets'] = $post['attractions_tickets'];
                if(!empty($post['ticket_data']))
                {
                    $introduceData['ticket_data']=$post['ticket_data'];
                }
                if(!empty($post['other_description']))
                {
                    $introduceData['other_description'] = $post['other_description'];
                }
                $introduceData['create_time'] = time();
                $introduceData['update_time'] = time();
                $introduceData['published_time'] = strtotime($post['published_time']);
                // $introduceData['status'] = $post['status'];
                $introduceData['attr_score']=$post['attr_score'];
                $introduceData['ranking']=$post['ranking'];
                $introduceData['play_time']=$post['play_time'];

                $cityData =  $areaDB->field(array('area_name'))->where(array('area_id'=>$post['city_id']))->find();
                $introduceData['city_name'] = $cityData['area_name'];
                if($post['area_id'] != '')
                {
                    $areaData =  $areaDB->field(array('area_name'))->where(array('area_id'=>$post['area_id']))->find();
                    $introduceData['area_name'] = $areaData['area_name'];
                }
                if (!empty($post['photo_names']) && !empty($post['photo_urls'])) {
                    $introduceData['pic'] = [];
                    foreach ($post['photo_urls'] as $key => $url) {
                        $photoUrl = cmf_asset_relative_url($url);
                        array_push($introduceData['pic'], ["url" => $photoUrl, "name" => $post['photo_names'][$key]]);
                    }
                }
                if(!empty($introduceData['pic']))
                {
                    $introduceData['pic'] = json_encode($introduceData['pic']);
                }
               
                
                if (!empty($post['photo_names2']) && !empty($post['photo_urls2'])) {
                    $introduceData['picture2'] = [];
                    foreach ($post['photo_urls2'] as $key => $url) {
                        $photoUrl2 = cmf_asset_relative_url($url);
                        array_push($introduceData['picture2'], ["url" => $photoUrl2, "name" => $post['photo_names2'][$key]]);
                    }
                }
                if(!empty($introduceData['picture2']))
                {
                    $introduceData['picture2'] = json_encode($introduceData['picture2']);
                }
                
                
                if (!empty($post['file_names']) && !empty($post['file_urls'])) {
                    $introduceData['audio_file'] = [];
                    foreach ($post['file_urls'] as $key => $url) {
                        $fileUrl = cmf_asset_relative_url($url);
                        array_push($introduceData['audio_file'], ["url" => $fileUrl, "name" => $post['file_names'][$key]]);
                    }
                }
                if(!empty($introduceData['audio_file']))
                {
                    $introduceData['audio_file'] = json_encode($introduceData['audio_file']);
                }
                
                if(Db::name('Describe')->insert($introduceData))
                {
                    $this->success('保存成功!', url('local/describe'));
                }  else {
                    $this->success('保存失败!', url('local/describe'));
                }
                
            }
        }
        
        //编辑本土体验下的 简要介绍
        public function edit_describe()
        {
            $str = trim(strrchr($_SERVER["QUERY_STRING"], '/'),'/');
            $page = substr($str,0,strpos($str, '.'));
            $this->assign('page',$page);

            $id = $this->request->param('id', 0, 'intval');
            $natureAbstureData = Db::name('Describe')->where(array('id'=>$id))->find();
            //图片格式处理
            $natureAbstureData['pic11'] = json_decode($natureAbstureData['pic'], True);
            $natureAbstureData['picture21'] = json_decode($natureAbstureData['picture2'], True);
            //音频文件处理
            $natureAbstureData['audio_file11'] = json_decode($natureAbstureData['audio_file'], True);
            $this->assign('natureAbstureData',$natureAbstureData);  
            //显示省份 
            $areaData = $this->getPro();  //格式是对象里嵌套着数组
            $area = $this->object_to_array($areaData);   //对象转换成二维数组
            //显示省份 
            $areaData = $this->getPro();  //格式是对象里嵌套着数组
            $area = $this->object_to_array($areaData);   //对象转换成二维数组
            foreach($area as $key=>&$val)
            {       
                if($val['area_id'] == $natureAbstureData['province_id'])
                {
                   $val['status'] = 'selected=selected';
                }else {
                    $val['status'] = '';
                }
            }   
            $this->assign('area',$area);

            //显示省份下对应的城市
            $cityListData = $this->getCity($natureAbstureData['province_id']);
            $cityList = $this->object_to_array($cityListData);
            foreach($cityList as &$values)
            {
                if($values['area_id'] == $natureAbstureData['city_id'])
                {
                     $values['status'] = 'selected=selected';
                }else {
                    $values['status'] = '';
                }
            }
            $this->assign('cityList',$cityList);

            //显示城市下对应的区域，县
            $areaListData = $this->getArea($natureAbstureData['city_id'])->toarray();
            $areaList = $areaListData;
            foreach($areaList as &$va)
            {
                if($va['area_id'] == $natureAbstureData['area_id'])
                {
                     $va['status'] = 'selected=selected';
                }else {
                    $va['status'] = '';
                }
            }
            $this->assign('areaList',$areaList);

            return $this->fetch();
        }
        
        //处理编辑人简要介绍
        public function do_edit_describe()
        {
            if($_POST)
            {
                $post = $_POST;
                $page = $post['page'];
                $areaDB = Db::name('Area');
                $introduceData['province_id'] = $post['province_id'];
                $introduceData['city_id'] = $post['city_id'];
                $introduceData['area_id'] = $post['area_id'];
                $introduceData['type'] = $post['type'];
                $introduceData['spot_name'] = $post['spot_name'];
                $introduceData['longitude'] = $post['longitude'];
                $introduceData['latitude'] = $post['latitude'];
                $introduceData['spot_Introduction'] = $post['spot_Introduction'];
                $introduceData['absture'] = $post['absture'];
                $introduceData['suit_season'] = $post['suit_season'];
                $introduceData['suit_time'] = $post['suit_time'];
                $introduceData['period_time']=$post['period_time'];
                $introduceData['not_modifity']=$post['not_modifity'];

                if(!empty($post['phone']))
                {
                    $introduceData['phone'] = $post['phone'];
                }
               
                $introduceData['address'] = $post['address'];
                $introduceData['attractions_tickets'] = $post['attractions_tickets'];
                 if(!empty($post['ticket_data']))
                {
                    $introduceData['ticket_data']=$post['ticket_data'];
                }
                if(!empty($post['other_description']))
                {
                    $introduceData['other_description'] = $post['other_description'];
                }
                
                $introduceData['update_time'] = time();
                $introduceData['attr_score']=$post['attr_score'];
                $introduceData['ranking']=$post['ranking'];
                $introduceData['play_time']=$post['play_time'];

                $cityData =  $areaDB->field(array('area_name'))->where(array('area_id'=>$post['city_id']))->find();
                $introduceData['city_name'] = $cityData['area_name'];
                if($post['area_id'] != '')
                {
                    $areaData =  $areaDB->field(array('area_name'))->where(array('area_id'=>$post['area_id']))->find();
                    $introduceData['area_name'] = $areaData['area_name'];
                }
                if (!empty($post['photo_names']) && !empty($post['photo_urls'])) {
                    $introduceData['pic'] = [];
                    foreach ($post['photo_urls'] as $key => $url) {
                        $photoUrl = cmf_asset_relative_url($url);
                        array_push($introduceData['pic'], ["url" => $photoUrl, "name" => $post['photo_names'][$key]]);
                    }
                }  
                if(!empty($introduceData['pic']))
                {
                    $introduceData['pic'] = json_encode($introduceData['pic']);
                } 
                
                
                if (!empty($post['photo_names2']) && !empty($post['photo_urls2'])) {
                    $introduceData['picture2'] = [];
                    foreach ($post['photo_urls2'] as $key => $url) {
                        $photoUrl2 = cmf_asset_relative_url($url);
                        array_push($introduceData['picture2'], ["url" => $photoUrl2, "name" => $post['photo_names2'][$key]]);
                    }
                }
                if(!empty($introduceData['picture2']))
                {
                    $introduceData['picture2'] = json_encode($introduceData['picture2']);
                }
                
               
                if (!empty($post['file_names']) && !empty($post['file_urls'])) {
                    $introduceData['audio_file'] = [];
                    foreach ($post['file_urls'] as $key => $url) {
                        $fileUrl = cmf_asset_relative_url($url);
                        array_push($introduceData['audio_file'], ["url" => $fileUrl, "name" => $post['file_names'][$key]]);
                    }
                }
                if(!empty($introduceData['audio_file']))
                {
                    $introduceData['audio_file'] = json_encode($introduceData['audio_file']);
                }

                $where['id'] = $post['id'];
                if(Db::name('Describe')->where($where)->update($introduceData))
                {
                    $this->success('修改成功!', url('/spot/local/describe.html?page='.$page));
                }  else {
                    $this->success('修改失败!', url('local/describe'));
                }
                
            }
        }
        
        //删除本土体验下的 简要介绍
        public function delete_describe()
        {
            $param = $this->request->param();
            //单个选中删除
            if(isset($param['id']))
            {
                if(Db::name('Describe')->where(array('id'=>$param['id']))->delete())
                {
                    $this->success('删除成功！');
                }
            }
            //批量选中删除
            if(isset($param['ids']))
            {
                $ids = $param['ids'];
                if(Db::name('Describe')->where(['id' => ['in', $ids]])->delete())
                {
                    $this->success('删除成功！');
                }
            }   
        }
        
        //置顶 取消（is_top 0-未置顶，1-置顶）
        public function top()
        {
            $param = $this->request->param();

            if (isset($param['ids']) && isset($param["yes"])) {
                $ids = $this->request->param('ids/a');

                Db::name('Describe')->where(['id' => ['in', $ids]])->update(['is_top' => 1]);

                $this->success("置顶成功！", '');

            }

            if (isset($_POST['ids']) && isset($param["no"])) {
                $ids = $this->request->param('ids/a');

                Db::name('Describe')->where(['id' => ['in', $ids]])->update(['is_top' => 0]);

                $this->success("取消置顶成功！", '');
            }
        }

        //本土体验是否发布（1-发布、0-未发布,发布时间随之改变）
        public function publish()
        {
            $param = $this->request->param();

            if (isset($param['ids']) && isset($param["yes"])) {
                $ids = $this->request->param('ids/a');

                $data['status'] = 1;
                $data['published_time'] = time();
                Db::name('Describe')->where(['id' => ['in', $ids]])->update($data);

                $this->success("发布成功！", '');

            }

            if (isset($_POST['ids']) && isset($param["no"])) {
                $ids = $this->request->param('ids/a');

                $data['status'] = 0;
                $data['published_time'] = time();
                Db::name('Describe')->where(['id' => ['in', $ids]])->update($data);

                $this->success("取消发布成功！", '');
            }

        }
        
        //打印生成一个6位的随机数
        public function getrandomstring($len,$chars=null){
            if(is_null($chars)){
                    $chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            }
            mt_srand(1000*(double)time());
            $str = '';
            for($i = 0,$lc = strlen($chars)-1;$i<$len;$i++){
                    $str.= $chars[mt_rand(0,$lc)];
            }
            return $str;
        }
        
        //对象转换成数组
        public function object_to_array($object) {
            if (is_object($object)) {
                foreach ($object as $key => $value) {
                    $array[$key] = $value;
                }
            }
            else {
              $array = $object;
            }
            return $array;
        }
        //列出省份信息
        public function getPro()
        {
            //获取省份信息
            $areaDB = Db::name('Area');
            $where['area_type'] = 1;
            $where['area_pid'] = 0;
            $areaArr = $areaDB->where($where)->select();
            return $areaArr;
        }
        //根据省份id列出 某个省份下的城市列表 
        public function getCity($pro_id)
        {
            //获取省份信息
            $areaDB= Db::name('Area');
            $where['area_type'] = 2;
            $where['area_pid'] = $pro_id;
            $areaArr = $areaDB->where($where)->select();
            return $areaArr;
        }

        //根据城市id列出 某个城市下的区域列表 
        public function getArea($city_id)
        {
            //获取省份信息
            $areaDB= Db::name('Area');
            $where['area_type'] = 3;
            $where['area_pid'] = $city_id;
            $areaArr = $areaDB->where($where)->select();
            return $areaArr;
        }
        //根据省份获取城市/地区联动
        public function getCityLink() {
            $area_id = $_GET['area_id'];
            $area_type = $_GET['area_type'];
            $areaDB= Db::name('Area');
            $where['area_pid'] = $area_id;
            $where['area_type'] = $area_type;
            $areas = $areaDB->where($where)->select();
            echo json_encode($areas);
        }
}
