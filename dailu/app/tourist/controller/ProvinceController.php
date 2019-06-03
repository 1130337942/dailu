<?php
// +----------------------------------------------------------------------
// | ThinkCMF [ WE CAN DO IT MORE SIMPLE ]
// +----------------------------------------------------------------------
// | Copyright (c) 2013-2017 http://www.thinkcmf.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed ( http://www.apache.org/licenses/LICENSE-2.0 )
// +----------------------------------------------------------------------
// | Author: bingwang
// +----------------------------------------------------------------------
namespace app\tourist\controller;
use think\Model;
use think\Db;

use cmf\controller\AdminBaseController;

/**
 * Class ProvinceController
 * @package app\tourist\controller
 */
class ProvinceController extends AdminBaseController
{
    //所有省份列表
    public function index()
    {
         //搜索条件获取
        $where = array(); 
        if (!empty($_GET['keyword'])) {
            $where['province_name']= $_GET['keyword'];
        }
        //默认是按照id进行查询的，这里根据是否置顶is_top进行查询显示
        $provinceData = Db::name('Province_details')->where($where)->order('is_top desc')->select();
        $this->assign('provinceData',$provinceData);
        return $this->fetch();
    }
      
    //省份添加
    public function add_province()
    {
        //获取省份信息
        $area = $this->getPro();
        $this->assign('area',$area);
        return $this->fetch();
    }
    //处理省份添加
    public function do_add_province()
    {
        if($_POST) {
            $post=$_POST;
            $provinceData = Db::name('Area')->field(array('area_name','is_municipalities','area_url'))->where(array('area_id'=>$post['province_id']))->find();
            $provinceResult['province_id'] = $post['province_id'];
            $provinceResult['province_name'] = $provinceData['area_name'];
            $provinceResult['province_English'] = $provinceData['area_url'];
            $provinceResult['is_municipalities'] = $provinceData['is_municipalities'];
            $provinceResult['province_Introduction'] = $post['province_Introduction'];
            $provinceResult['create_time'] = time();
            $provinceResult['update_time'] = time();

            if (!empty($post['photo_names']) && !empty($post['photo_urls'])) {
                $post['pic']=[];
                foreach ($post['photo_urls'] as $key=> $url) {
                    $photoUrl=cmf_asset_relative_url($url);
                    array_push($post['pic'], ["url"=> $photoUrl, "name"=> $post['photo_names'][$key]]);
                }
            }
            if(!empty($post['pic']))
            {
                $provinceResult['pic']=json_encode($post['pic']);
            } 
            
    
            if(Db::name('Province_details')->insert($provinceResult))
            {
                $this->success('保存成功!', url('province/index'));
            }
        }
    }
    
    //编辑省份详情
    public function edit_province()
    {
        $id = $this->request->param('id', 0, 'intval');
        $provinceData = Db::name('Province_details')->where(array('id'=>$id))->find();
        $provinceData['pic11']=json_decode($provinceData['pic'], True);
        $this->assign('provinceData',$provinceData);
        //显示省份 
        $areaData = $this->getPro();  //格式是对象里嵌套着数组
        $area = $this->object_to_array($areaData);   //对象转换成二维数组
        foreach($area as $key=>&$val)
        {       
            if($val['area_id'] == $provinceData['province_id'])
            {
               $val['status'] = 'selected=selected';
            }else {
                $val['status'] = '';
            }
        }   
        $this->assign('area',$area);
        return $this->fetch();
    }
    
    //省份编辑提交数据
    public function do_edit_province()
    {
        if($_POST) {
            $post=$_POST;
            $provinceData = Db::name('Area')->field(array('area_name','is_municipalities','area_url'))->where(array('area_id'=>$post['province_id']))->find();
            $provinceResult['province_id'] = $post['province_id'];
            $provinceResult['province_name'] = $provinceData['area_name'];
            $provinceResult['province_English'] = $provinceData['area_url'];
            $provinceResult['is_municipalities'] = $provinceData['is_municipalities'];
            $provinceResult['province_Introduction'] = $post['province_Introduction'];
            $provinceResult['update_time'] = time();
            if (!empty($post['photo_names']) && !empty($post['photo_urls'])) {
                $post['pic']=[];
                foreach ($post['photo_urls'] as $key=> $url) {
                    $photoUrl=cmf_asset_relative_url($url);
                    array_push($post['pic'], ["url"=> $photoUrl, "name"=> $post['photo_names'][$key]]);
                }
            }
            if(!empty($post['pic']))
            {
                $provinceResult['pic']=json_encode($post['pic']);
            } 
            

            $where['id'] = $post['id'];
            if(Db::name('Province_details')->where($where)->update($provinceResult))
            {
                $this->success('修改成功!', url('Province/index'));
            }else{
                $this->error('修改失败!', url('Province/index'));
            }
        }  else {
            $this->error('非法修改，请重新提交!', url('Province/edit_province'));
        }
        
    }
    
    //删除省份
    public function delete_province()
    {
        $param = $this->request->param();
        //单个选中删除                                                                                                                                            
        if(isset($param['id']))
        {
            if(Db::name('Province_details')->where(array('id'=>$param['id']))->delete())
            {
                $this->success('删除成功！');
            }
        }
        //批量选中删除
        if(isset($param['ids']))
        {
            $ids = $param['ids'];
            if(Db::name('Province_details')->where(['id' => ['in', $ids]])->delete())
            {
                $this->success('删除成功！');
            }
        }   
    }
    //对象转换成数组
    public function object_to_array($object) 
    {
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
    
    //置顶 取消（is_top 0-未置顶，1-置顶）
    public function top()
    {
        $param = $this->request->param();

        if (isset($param['ids']) && isset($param["yes"])) {
            $ids = $this->request->param('ids/a');

            Db::name('Province_details')->where(['id' => ['in', $ids]])->update(['is_top' => 1]);

            $this->success("置顶成功！", '');

        }

        if (isset($_POST['ids']) && isset($param["no"])) {
            $ids = $this->request->param('ids/a');

            Db::name('City_details')->where(['id' => ['in', $ids]])->update(['is_top' => 0]);

            $this->success("取消置顶成功！", '');
        }
    }

    //省份是否发布（1-发布、0-未发布,发布时间随之改变）
    public function publish()
    {
        $param = $this->request->param();

        if (isset($param['ids']) && isset($param["yes"])) {
            $ids = $this->request->param('ids/a');

            $data['status'] = 1;
            $data['published_time'] = time();
            Db::name('Province_details')->where(['id' => ['in', $ids]])->update($data);

            $this->success("发布成功！", '');

        }

        if (isset($_POST['ids']) && isset($param["no"])) {
            $ids = $this->request->param('ids/a');

            $data['status'] = 0;
            $data['published_time'] = time();
            Db::name('Province_details')->where(['id' => ['in', $ids]])->update($data);

            $this->success("取消发布成功！", '');
        }

    }

}
