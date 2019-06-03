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

/******************** 美食诱惑 ==》店铺 **********************/
class FoodController extends AdminBaseController
{
    /******************** 美食诱惑 ==》店铺 **********************/
    /******************* 店铺简要介绍 ****************************/
    //店铺简要介绍列表
    public function store_info()
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
                $where['store_name']= array('like',"%$queryString%");
            }
        }

        $storeInfoData = Db::name('Store_info')->whereOr($where)->page($p.',30')->order('is_top desc')->select();
        $storeResult = json_decode($storeInfoData,true);
        
        $count = Db::name('Store_info')->whereOr($where)->count();
        $Page       =  new \Page($count,30);
        $show       =  $Page->show();
        $this->assign('page',$show);
        $this->assign('p',$p);
        $this->assign('storeResult',$storeResult);
        return $this->fetch();

    }
    
    //添加店铺
    public function add_store_info()
    {
        //获取省份信息
        $area = $this->getPro();
        $this->assign('area',$area);
        return $this->fetch();
    }
    //处理添加店铺
    public function do_add_store_info()
    {
        if($_POST)
        {
            $post = $_POST;
            $areaDB = Db::name('Area');
            $storeData['province_id'] = $post['province_id'];
            $storeData['city_id'] = $post['city_id'];
            $storeData['area_id'] = $post['area_id'];
            $storeData['type'] = $post['type'];
            $storeData['store_name'] = $post['store_name'];
            $storeData['longitude'] = $post['longitude'];
            $storeData['latitude'] = $post['latitude'];
            $storeData['store_Introduction'] = $post['store_Introduction'];
            $storeData['per_capita'] = $post['per_capita'];
            $storeData['meal_time'] = $post['meal_time'];
            $storeData['phone'] = $post['phone'];
            $storeData['address'] = $post['address'];
            $storeData['business_hours'] = $post['business_hours'];
            if(!empty($post['other_description']))
            {
                $storeData['other_description'] = $post['other_description'];
            }

            $storeData['create_time'] = time();
            $storeData['update_time'] = time();
            $storeData['published_time'] = time();
            // $storeData['status'] = $post['status'];
            
            $cityData =  $areaDB->field(array('area_name'))->where(array('area_id'=>$post['city_id']))->find();
            $storeData['city_name'] = $cityData['area_name'];
            if($post['area_id'] != '')
            {
                $areaData =  $areaDB->field(array('area_name'))->where(array('area_id'=>$post['area_id']))->find();
                $storeData['area_name'] = $areaData['area_name'];
            }
            if (!empty($post['photo_names']) && !empty($post['photo_urls'])) {
                $storeData['pic'] = [];
                foreach ($post['photo_urls'] as $key => $url) {
                    $photoUrl = cmf_asset_relative_url($url);
                    array_push($storeData['pic'], ["url" => $photoUrl, "name" => $post['photo_names'][$key]]);
                }
            }
            if(!empty($storeData['pic']))
            {
                $storeData['pic'] = json_encode($storeData['pic']);
            }
            
            
            if (!empty($post['photo_names2']) && !empty($post['photo_urls2'])) {
                $storeData['picture2'] = [];
                foreach ($post['photo_urls2'] as $key => $url) {
                    $photoUrl2 = cmf_asset_relative_url($url);
                    array_push($storeData['picture2'], ["url" => $photoUrl2, "name" => $post['photo_names2'][$key]]);
                }
            }
            if(!empty($storeData['picture2']))
            {
                 $storeData['picture2'] = json_encode($storeData['picture2']);
            }
           

            if(Db::name('Store_info')->insert($storeData))
            {
                $this->success('保存成功!', url('food/store_info'));
            }  else {
                $this->success('保存失败!', url('food/store_info'));
            }
            
        }
    }
    //编辑店铺
    public function edit_store_info()
    {
        $str = trim(strrchr($_SERVER["QUERY_STRING"], '/'),'/');
        $page = substr($str,0,strpos($str, '.'));
        $this->assign('page',$page);

        $id = $this->request->param('id', 0, 'intval');
        $store_infoData = Db::name('Store_info')->where(array('id'=>$id))->find();
        //图片格式处理
        $store_infoData['pic11'] = json_decode($store_infoData['pic'], True);
        $store_infoData['picture21'] = json_decode($store_infoData['picture2'], True);
        $this->assign('store_infoData',$store_infoData);  
        //显示省份 
        $areaData = $this->getPro();  //格式是对象里嵌套着数组
        $area = $this->object_to_array($areaData);   //对象转换成二维数组
        //显示省份 
        $areaData = $this->getPro();  //格式是对象里嵌套着数组
        $area = $this->object_to_array($areaData);   //对象转换成二维数组
        foreach($area as $key=>&$val)
        {       
            if($val['area_id'] == $store_infoData['province_id'])
            {
                $val['status'] = 'selected=selected';
            }else {
                $val['status'] = '';
            }
        }   
        $this->assign('area',$area);

        //显示省份下对应的城市
        $cityListData = $this->getCity($store_infoData['province_id']);
        $cityList = $this->object_to_array($cityListData);
        foreach($cityList as &$values)
        {
            if($values['area_id'] == $store_infoData['city_id'])
            {
                    $values['status'] = 'selected=selected';
            }else {
                $values['status'] = '';
            }
        }
        $this->assign('cityList',$cityList);

        //显示城市下对应的区域，县
        $areaListData = $this->getArea($store_infoData['city_id'])->toarray();
        $areaList = $areaListData;
        foreach($areaList as &$va)
        {
            if($va['area_id'] == $store_infoData['area_id'])
            {
                    $va['status'] = 'selected=selected';
            }else {
                $va['status'] = '';
            }
        }
        $this->assign('areaList',$areaList);
        return $this->fetch();
    }
    //处理编辑店铺
    public function do_edit_store_info()
    {
        if($_POST)
        {
            $post = $_POST;
            $page = $post['page'];
            $areaDB = Db::name('Area');
            $storeData['province_id'] = $post['province_id'];
            $storeData['city_id'] = $post['city_id'];
            $storeData['area_id'] = $post['area_id'];
            $storeData['type'] = $post['type'];
            $storeData['store_name'] = $post['store_name'];
            $storeData['longitude'] = $post['longitude'];
            $storeData['latitude'] = $post['latitude'];
            $storeData['store_Introduction'] = $post['store_Introduction'];
            $storeData['per_capita'] = $post['per_capita'];
            $storeData['meal_time'] = $post['meal_time'];
            $storeData['phone'] = $post['phone'];
            $storeData['address'] = $post['address'];
            $storeData['business_hours'] = $post['business_hours'];
            if(!empty($post['other_description']))
            {
                $storeData['other_description'] = $post['other_description'];
            }
            $storeData['update_time'] = time();
            
            $cityData =  $areaDB->field(array('area_name'))->where(array('area_id'=>$post['city_id']))->find();
            $storeData['city_name'] = $cityData['area_name'];
            if($post['area_id'] != '')
            {
                $areaData =  $areaDB->field(array('area_name'))->where(array('area_id'=>$post['area_id']))->find();
                $storeData['area_name'] = $areaData['area_name'];
            }
            if (!empty($post['photo_names']) && !empty($post['photo_urls'])) {
                $storeData['pic'] = [];
                foreach ($post['photo_urls'] as $key => $url) {
                    $photoUrl = cmf_asset_relative_url($url);
                    array_push($storeData['pic'], ["url" => $photoUrl, "name" => $post['photo_names'][$key]]);
                }
            }
            if(!empty($storeData['pic']))
            {
                $storeData['pic'] = json_encode($storeData['pic']);
            }
            
            if (!empty($post['photo_names2']) && !empty($post['photo_urls2'])) {
                $storeData['picture2'] = [];
                foreach ($post['photo_urls2'] as $key => $url) {
                    $photoUrl2 = cmf_asset_relative_url($url);
                    array_push($storeData['picture2'], ["url" => $photoUrl2, "name" => $post['photo_names2'][$key]]);
                }
            }
            if(!empty($storeData['picture2']))
            {
                 $storeData['picture2'] = json_encode($storeData['picture2']);
            }

            $where['id'] = $post['id'];
            if(Db::name('Store_info')->where($where)->update($storeData))
            {
                $this->success('修改成功!', url('/foodshop/food/store_info.html?page='.$page));
               
            }  else {
                $this->success('修改失败!', url('food/store_info'));
            }
            
        }
    }
    //删除店铺
    public function delete_store_info()
    {
        $param = $this->request->param();
        //单个选中删除
        if(isset($param['id']))
        {
            if(Db::name('Store_info')->where(array('id'=>$param['id']))->delete())
            {
                $this->success('删除成功！');
            }
        }
        //批量选中删除
        if(isset($param['ids']))
        {
            $ids = $param['ids'];
            if(Db::name('Store_info')->where(['id' => ['in', $ids]])->delete())
            {
                $this->success('删除成功！');
            }
        }   
    }

    //对象转换成数组
    public function object_to_array($object) {
        if (is_object($object)) {
            foreach ($object as $key=>$value) {
                $array[$key]=$value;
            }
        }
        else {
            $array=$object;
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
    //置顶 取消（is_top 0-未置顶，1-置顶）
    public function top()
    {
        $param = $this->request->param();

        if (isset($param['ids']) && isset($param["yes"])) {
            $ids = $this->request->param('ids/a');

            Db::name('Store_info')->where(['id' => ['in', $ids]])->update(['is_top' => 1]);

            $this->success("置顶成功！", '');

        }

        if (isset($_POST['ids']) && isset($param["no"])) {
            $ids = $this->request->param('ids/a');

            Db::name('Store_info')->where(['id' => ['in', $ids]])->update(['is_top' => 0]);

            $this->success("取消置顶成功！", '');
        }
    }

    //店铺是否发布（1-发布、0-未发布,发布时间随之改变）
    public function publish()
    {
        $param = $this->request->param();

        if (isset($param['ids']) && isset($param["yes"])) {
            $ids = $this->request->param('ids/a');

            $data['status'] = 1;
            $data['published_time'] = time();
            Db::name('Store_info')->where(['id' => ['in', $ids]])->update($data);

            $this->success("发布成功！", '');

        }

        if (isset($_POST['ids']) && isset($param["no"])) {
            $ids = $this->request->param('ids/a');

            $data['status'] = 0;
            $data['published_time'] = time();
            Db::name('Store_info')->where(['id' => ['in', $ids]])->update($data);

            $this->success("取消发布成功！", '');
        }

    }

    /***************** 菜品推荐**********************/
    //店铺中的菜品推荐
    public function dishes_recommended()
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
                $where['store_name']= array('like',"%$queryString%");
            }
        }
        $Dishes_recommendedData = Db::name('Dishes_recommended_info')->whereOr($where)->page($p.',30')
        ->order('is_top desc')->select();
        $Dishes_recommendedResult = json_decode($Dishes_recommendedData,true);
    
        $count = Db::name('Dishes_recommended_info')->whereOr($where)->count();
        $Page       =  new \Page($count,30);
        $show       =  $Page->show();
        $this->assign('page',$show);
        $this->assign('p',$p);
        $this->assign('Dishes_recommendedResult',$Dishes_recommendedResult);
        return $this->fetch();
    }
    //添加 菜品推荐
    public function add_dishes_recommended()
    {
        //获取省份信息
        $area=$this->getPro();
        $this->assign('area', $area);
        return $this->fetch();
    }
    //处理添加 菜品推荐
    public function do_add_dishes_recommended()
    {
        if($_POST)
        {
            $areaDB=Db::name('Area');
            $post = $_POST;
            if(!empty($post['store_name']))
            {
                $dishes_recommendedData['store_name'] = $post['store_name'];
            }
            $dishes_recommendedData['province_id']=$post['province_id'];
            $dishes_recommendedData['city_id']=$post['city_id'];
            $dishes_recommendedData['area_id']=$post['area_id'];
            if(!empty($post['absture']))
            {
                $dishes_recommendedData['absture'] = $post['absture'];
            }
            if(!empty($post['spot_Introduction']))
            {
                $dishes_recommendedData['spot_Introduction'] = $post['spot_Introduction'];
            }
            if(!empty($post['recom_sites']))
            {
                $dishes_recommendedData['recom_sites'] = $post['recom_sites'];
            }
            $dishes_recommendedData['dishes_name'] = $post['dishes_name'];
            $dishes_recommendedData['is_hot_have'] = $post['is_hot_have'];
            if (!empty($post['photo_names']) && !empty($post['photo_urls'])) {
                $dishes_recommendedData['pic'] = [];
                foreach ($post['photo_urls'] as $key => $url) {
                    $photoUrl = cmf_asset_relative_url($url);
                    array_push($dishes_recommendedData['pic'], ["url" => $photoUrl, "name" => $post['photo_names'][$key]]);
                }
            }
            if(!empty($dishes_recommendedData['pic']))
            {
                $dishes_recommendedData['pic'] = json_encode($dishes_recommendedData['pic']);
            }
            

            $cityData=$areaDB->field(array('area_name'))->where(array('area_id'=>$post['city_id']))->find();
            $dishes_recommendedData['city_name']=$cityData['area_name'];
            if($post['area_id'] !='') {
                $areaData=$areaDB->field(array('area_name'))->where(array('area_id'=>$post['area_id']))->find();
                $dishes_recommendedData['area_name']=$areaData['area_name'];
            }

            $dishes_recommendedData['create_time'] = time();
            $dishes_recommendedData['update_time'] = time();
            $dishes_recommendedData['published_time'] = time();
            // $dishes_recommendedData['status'] = $post['status']; 

            if(Db::name('Dishes_recommended_info')->insert($dishes_recommendedData))
            {
                $this->success('保存成功!', url('food/dishes_recommended'));
            }  else {
                $this->success('保存失败!', url('food/dishes_recommended'));
            }
            
        }
    }

    //编辑 菜品推荐
    public function edit_dishes_recommended()
    {
        $str = trim(strrchr($_SERVER["QUERY_STRING"], '/'),'/');
        $page = substr($str,0,strpos($str, '.'));
        $this->assign('page',$page);

        $id = $this->request->param('id', 0, 'intval');
        $dishes_recommendedData = Db::name('Dishes_recommended_info')->where(array('id'=>$id))->find();
        //图片格式处理
        $dishes_recommendedData['pic11'] = json_decode($dishes_recommendedData['pic'], True);
        $this->assign('dishes_recommendedData',$dishes_recommendedData);  
        //显示省份 
        $areaData = $this->getPro();  //格式是对象里嵌套着数组
        $area = $this->object_to_array($areaData);   //对象转换成二维数组
   
        foreach($area as $key=>&$val)
        {       
            if($val['area_id'] == $dishes_recommendedData['province_id'])
            {
               $val['status'] = 'selected=selected';
            }else {
                $val['status'] = '';
            }
        }   
        $this->assign('area',$area);
        
        //显示省份下对应的城市
        $cityListData = $this->getCity($dishes_recommendedData['province_id']);
        $cityList = $this->object_to_array($cityListData);
        
        foreach($cityList as &$values)
        {
            if($values['area_id'] == $dishes_recommendedData['city_id'])
            {
                 $values['status'] = 'selected=selected';
            }else {
                $values['status'] = '';
            }
        }
        $this->assign('cityList',$cityList);

        //显示城市下对应的区域，县
        $areaListData = $this->getArea($dishes_recommendedData['city_id']);
        $areaList = $this->object_to_array($areaListData);
        foreach($areaList as &$va)
        {
            if($va['area_id'] == $dishes_recommendedData['area_id'])
            {
                 $va['status'] = 'selected=selected';
            }else {
                $va['status'] = '';
            }
        }
        $this->assign('areaList',$areaList);

        return $this->fetch();
    }

    //处理编辑 菜品推荐
    public function do_edit_dishes_recommended()
    {
        if($_POST)
        {
            $areaDB=Db::name('Area');
            $post = $_POST;
            $page = $post['page'];
            if(!empty($post['store_name']))
            {
                $dishes_recommendedData['store_name'] = $post['store_name'];
            }
            $dishes_recommendedData['province_id']=$post['province_id'];
            $dishes_recommendedData['city_id']=$post['city_id'];
            $dishes_recommendedData['area_id']=$post['area_id'];
            $dishes_recommendedData['dishes_name'] = $post['dishes_name'];
            if(!empty($post['absture']))
            {
                $dishes_recommendedData['absture'] = $post['absture'];
            }
            if(!empty($post['spot_Introduction']))
            {
                $dishes_recommendedData['spot_Introduction'] = $post['spot_Introduction'];
            }
            if(!empty($post['recom_sites']))
            {
                $dishes_recommendedData['recom_sites'] = $post['recom_sites'];
            }
            $dishes_recommendedData['is_hot_have'] = $post['is_hot_have'];
            if (!empty($post['photo_names']) && !empty($post['photo_urls'])) {
                $dishes_recommendedData['pic'] = [];
                foreach ($post['photo_urls'] as $key => $url) {
                    $photoUrl = cmf_asset_relative_url($url);
                    array_push($dishes_recommendedData['pic'], ["url" => $photoUrl, "name" => $post['photo_names'][$key]]);
                }
            }
            if(!empty($dishes_recommendedData['pic']))
            {
                $dishes_recommendedData['pic'] = json_encode($dishes_recommendedData['pic']);
            }
            

            $cityData=$areaDB->field(array('area_name'))->where(array('area_id'=>$post['city_id']))->find();
            $dishes_recommendedData['city_name']=$cityData['area_name'];
            if($post['area_id'] !='') {
                $areaData=$areaDB->field(array('area_name'))->where(array('area_id'=>$post['area_id']))->find();
                $dishes_recommendedData['area_name']=$areaData['area_name'];
            }
            $dishes_recommendedData['update_time'] = time();

            $where['id'] = $post['id'];
            if(Db::name('Dishes_recommended_info')->where($where)->update($dishes_recommendedData))
            {
                $this->success('修改成功!',url('/foodshop/food/dishes_recommended.html?page='.$page));
            }  else {
                $this->success('修改失败!', url('food/dishes_recommended'));
            }
            
        }
    }

    //删除 菜品推荐
    public function delete_dishes_recommended()
    {
        $param = $this->request->param();
        //单个选中删除
        if(isset($param['id']))
        {
            if(Db::name('Dishes_recommended_info')->where(array('id'=>$param['id']))->delete())
            {
                $this->success('删除成功！');
            }
        }
        //批量选中删除
        if(isset($param['ids']))
        {
            $ids = $param['ids'];
            if(Db::name('Dishes_recommended_info')->where(['id' => ['in', $ids]])->delete())
            {
                $this->success('删除成功！');
            }
        }   
    }
    //置顶 取消（is_top 0-未置顶，1-置顶）
    public function top2()
    {
        $param = $this->request->param();

        if (isset($param['ids']) && isset($param["yes"])) {
            $ids = $this->request->param('ids/a');

            Db::name('Dishes_recommended_info')->where(['id' => ['in', $ids]])->update(['is_top' => 1]);

            $this->success("置顶成功！", '');

        }

        if (isset($_POST['ids']) && isset($param["no"])) {
            $ids = $this->request->param('ids/a');

            Db::name('Dishes_recommended_info')->where(['id' => ['in', $ids]])->update(['is_top' => 0]);

            $this->success("取消置顶成功！", '');
        }
    }

    //菜品推荐是否发布（1-发布、0-未发布,发布时间随之改变）
    public function publish2()
    {
        $param = $this->request->param();

        if (isset($param['ids']) && isset($param["yes"])) {
            $ids = $this->request->param('ids/a');

            $data['status'] = 1;
            $data['published_time'] = time();
            Db::name('Dishes_recommended_info')->where(['id' => ['in', $ids]])->update($data);

            $this->success("发布成功！", '');

        }

        if (isset($_POST['ids']) && isset($param["no"])) {
            $ids = $this->request->param('ids/a');

            $data['status'] = 0;
            $data['published_time'] = time();
            Db::name('Dishes_recommended_info')->where(['id' => ['in', $ids]])->update($data);

            $this->success("取消发布成功！", '');
        }

    }

    /******************* 美食诱惑 ==》 美食街***********************/
    //美食街的简要介绍
    public function court()
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
                $where['food_court_name']= array('like',"%$queryString%");
            }
        }

        $Food_courtData = Db::name('Food_court')->whereOr($where)->page($p.',30')->order('is_top desc')->select();
        $Food_courtResult = json_decode($Food_courtData,true);
        $count = Db::name('Food_court')->whereOr($where)->count();
        $Page       =  new \Page($count,30);
        $show       =  $Page->show();
        $this->assign('page',$show);
        $this->assign('p',$p); 
        $this->assign('Food_courtResult',$Food_courtResult);
        return $this->fetch();
    }
    
    //添加美食街
    public function add_court()
    {
        //获取省份信息
        $area = $this->getPro();
        $this->assign('area',$area);
        return $this->fetch();
    }
    //处理添加美食街
    public function do_add_court()
    {
        if($_POST)
        {
            $post = $_POST;
            $areaDB = Db::name('Area');
            $food_courtData['province_id'] = $post['province_id'];
            $food_courtData['city_id'] = $post['city_id'];
            $food_courtData['area_id'] = $post['area_id'];
            $food_courtData['type'] = $post['type'];
            $food_courtData['food_court_name'] = $post['food_court_name'];
            $food_courtData['longitude'] = $post['longitude'];
            $food_courtData['latitude'] = $post['latitude'];
            $food_courtData['court_Introduction'] = $post['court_Introduction'];
            $food_courtData['suit_time'] = $post['suit_time'];
            $food_courtData['phone'] = $post['phone'];
            $food_courtData['address'] = $post['address'];
            $food_courtData['business_hours'] = $post['business_hours'];
 
            $food_courtData['absture'] = $post['absture'];
            $food_courtData['per_capita'] = $post['per_capita'];
            $food_courtData['meal_time'] = $post['meal_time'];
            $food_courtData['attr_score'] = $post['attr_score'];
            $food_courtData['period_time'] = $post['period_time'];
            $food_courtData['not_modifity']=$post['not_modifity'];

            if(!empty($post['tebie_tuijian']))
            {
                $food_courtData['tebie_tuijian'] = $post['tebie_tuijian'];
            }
            if(!empty($post['other_description']))
            {
                $food_courtData['other_description'] = $post['other_description'];
            }

            $food_courtData['create_time'] = time();
            $food_courtData['update_time'] = time();
            $food_courtData['published_time'] = time();
            // $food_courtData['status'] = $post['status'];
            
            $cityData =  $areaDB->field(array('area_name'))->where(array('area_id'=>$post['city_id']))->find();
            $food_courtData['city_name'] = $cityData['area_name'];
            if($post['area_id'] != '')
            {
                $areaData =  $areaDB->field(array('area_name'))->where(array('area_id'=>$post['area_id']))->find();
                $food_courtData['area_name'] = $areaData['area_name'];
            }
            if (!empty($post['photo_names']) && !empty($post['photo_urls'])) {
                $food_courtData['pic'] = [];
                foreach ($post['photo_urls'] as $key => $url) {
                    $photoUrl = cmf_asset_relative_url($url);
                    array_push($food_courtData['pic'], ["url" => $photoUrl, "name" => $post['photo_names'][$key]]);
                }
            }
            if(!empty($food_courtData['pic']))
            {
                 $food_courtData['pic'] = json_encode($food_courtData['pic']);
            }
           
            
            if (!empty($post['photo_names2']) && !empty($post['photo_urls2'])) {
                $food_courtData['picture2'] = [];
                foreach ($post['photo_urls2'] as $key => $url) {
                    $photoUrl2 = cmf_asset_relative_url($url);
                    array_push($food_courtData['picture2'], ["url" => $photoUrl2, "name" => $post['photo_names2'][$key]]);
                }
            }
            if(!empty($food_courtData['picture2']))
            {
                $food_courtData['picture2'] = json_encode($food_courtData['picture2']);
            }
            
            if(Db::name('Food_court')->insert($food_courtData))
            {
                $this->success('保存成功!', url('food/court'));
            }  else {
                $this->success('保存失败!', url('food/court'));
            }
            
        }
    }
    //编辑美食街
    public function edit_court()
    {
        $str = trim(strrchr($_SERVER["QUERY_STRING"], '/'),'/');
        $page = substr($str,0,strpos($str, '.'));
        $this->assign('page',$page);

        $id = $this->request->param('id', 0, 'intval');
        $Food_courtData = Db::name('Food_court')->where(array('id'=>$id))->find();
        //图片格式处理
        $Food_courtData['pic11'] = json_decode($Food_courtData['pic'], True);
        $Food_courtData['picture21'] = json_decode($Food_courtData['picture2'], True);
        $this->assign('Food_courtData',$Food_courtData);  
        //显示省份 
        $areaData = $this->getPro();  //格式是对象里嵌套着数组
        $area = $this->object_to_array($areaData);   //对象转换成二维数组
        //显示省份 
        $areaData = $this->getPro();  //格式是对象里嵌套着数组
        $area = $this->object_to_array($areaData);   //对象转换成二维数组
        foreach($area as $key=>&$val)
        {       
            if($val['area_id'] == $Food_courtData['province_id'])
            {
                $val['status'] = 'selected=selected';
            }else {
                $val['status'] = '';
            }
        }   
        $this->assign('area',$area);

        //显示省份下对应的城市
        $cityListData = $this->getCity($Food_courtData['province_id']);
        $cityList = $this->object_to_array($cityListData);
        foreach($cityList as &$values)
        {
            if($values['area_id'] == $Food_courtData['city_id'])
            {
                    $values['status'] = 'selected=selected';
            }else {
                $values['status'] = '';
            }
        }
        $this->assign('cityList',$cityList);

        //显示城市下对应的区域，县
        $areaListData = $this->getArea($Food_courtData['city_id']);
        $areaList = $this->object_to_array($areaListData);
        foreach($areaList as &$va)
        {
            if($va['area_id'] == $Food_courtData['area_id'])
            {
                    $va['status'] = 'selected=selected';
            }else {
                $va['status'] = '';
            }
        }
        $this->assign('areaList',$areaList);
        return $this->fetch();
    }
    //处理编辑美食街
    public function do_edit_court()
    {
        if($_POST)
        {
            $post = $_POST;
            $page = $post['page'];
            $areaDB = Db::name('Area');
            $food_courtData['province_id'] = $post['province_id'];
            $food_courtData['city_id'] = $post['city_id'];
            $food_courtData['area_id'] = $post['area_id'];
            $food_courtData['type'] = $post['type'];
            $food_courtData['food_court_name'] = $post['food_court_name'];
            $food_courtData['longitude'] = $post['longitude'];
            $food_courtData['latitude'] = $post['latitude'];
            $food_courtData['court_Introduction'] = $post['court_Introduction'];
            $food_courtData['suit_time'] = $post['suit_time'];
            $food_courtData['phone'] = $post['phone'];
            $food_courtData['address'] = $post['address'];
            $food_courtData['business_hours'] = $post['business_hours'];

            $food_courtData['absture'] = $post['absture'];
            $food_courtData['per_capita'] = $post['per_capita'];
            $food_courtData['meal_time'] = $post['meal_time'];
            $food_courtData['attr_score'] = $post['attr_score'];
            $food_courtData['period_time'] = $post['period_time'];
            $food_courtData['not_modifity']=$post['not_modifity'];

            if(!empty($post['tebie_tuijian']))
            {
                $food_courtData['tebie_tuijian'] = $post['tebie_tuijian'];
            }
            if(!empty($post['other_description']))
            {
                $food_courtData['other_description'] = $post['other_description'];
            }

            $food_courtData['update_time'] = time();
            
            $cityData =  $areaDB->field(array('area_name'))->where(array('area_id'=>$post['city_id']))->find();
            $food_courtData['city_name'] = $cityData['area_name'];
            if($post['area_id'] != '')
            {
                $areaData =  $areaDB->field(array('area_name'))->where(array('area_id'=>$post['area_id']))->find();
                $food_courtData['area_name'] = $areaData['area_name'];
            }
            if (!empty($post['photo_names']) && !empty($post['photo_urls'])) {
                $food_courtData['pic'] = [];
                foreach ($post['photo_urls'] as $key => $url) {
                    $photoUrl = cmf_asset_relative_url($url);
                    array_push($food_courtData['pic'], ["url" => $photoUrl, "name" => $post['photo_names'][$key]]);
                }
            }
            if(!empty($food_courtData['pic']))
            {
                $food_courtData['pic'] = json_encode($food_courtData['pic']);
            }
            
            if (!empty($post['photo_names2']) && !empty($post['photo_urls2'])) {
                $food_courtData['picture2'] = [];
                foreach ($post['photo_urls2'] as $key => $url) {
                    $photoUrl2 = cmf_asset_relative_url($url);
                    array_push($food_courtData['picture2'], ["url" => $photoUrl2, "name" => $post['photo_names2'][$key]]);
                }
            }
            if(!empty($food_courtData['picture2']))
            {
                $food_courtData['picture2'] = json_encode($food_courtData['picture2']);
            }
            
            $where['id'] = $post['id'];
            if(Db::name('Food_court')->where($where)->update($food_courtData))
            {
                $this->success('修改成功!',url('/foodshop/food/court.html?page='.$page));
                
            }  else {
                $this->success('修改失败!', url('food/court'));
            }
            
        }
    }
    //删除美食街
    public function delete_court()
    {
        $param = $this->request->param();
        //单个选中删除
        if(isset($param['id']))
        {
            if(Db::name('Food_court')->where(array('id'=>$param['id']))->delete())
            {
                $this->success('删除成功！');
            }
        }
        //批量选中删除
        if(isset($param['ids']))
        {
            $ids = $param['ids'];
            if(Db::name('Food_court')->where(['id' => ['in', $ids]])->delete())
            {
                $this->success('删除成功！');
            }
        }   
    }

    //置顶 取消（is_top 0-未置顶，1-置顶）
    public function top3()
    {
        $param = $this->request->param();

        if (isset($param['ids']) && isset($param["yes"])) {
            $ids = $this->request->param('ids/a');

            Db::name('Food_court')->where(['id' => ['in', $ids]])->update(['is_top' => 1]);

            $this->success("置顶成功！", '');

        }

        if (isset($_POST['ids']) && isset($param["no"])) {
            $ids = $this->request->param('ids/a');

            Db::name('Food_court')->where(['id' => ['in', $ids]])->update(['is_top' => 0]);

            $this->success("取消置顶成功！", '');
        }
    }

    //美食街是否发布（1-发布、0-未发布,发布时间随之改变）
    public function publish3()
    {
        $param = $this->request->param();

        if (isset($param['ids']) && isset($param["yes"])) {
            $ids = $this->request->param('ids/a');

            $data['status'] = 1;
            $data['published_time'] = time();
            Db::name('Food_court')->where(['id' => ['in', $ids]])->update($data);

            $this->success("发布成功！", '');

        }

        if (isset($_POST['ids']) && isset($param["no"])) {
            $ids = $this->request->param('ids/a');

            $data['status'] = 0;
            $data['published_time'] = time();
            Db::name('Food_court')->where(['id' => ['in', $ids]])->update($data);

            $this->success("取消发布成功！", '');
        }

    }

    /******************** 美食诱惑 ==》店铺 **********************/
    /******************连锁餐厅**********************/
    //连锁餐厅的简要介绍
    public function restaurant_index()
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
                $where = array();
                $where['restaurant_name']= array('like',"%$queryString%");
            }
        }

        $RestaurantData = Db::name('Restaurant_chain')->whereOr($where)->page($p.',30')->order('is_top desc')->select();
        $RestaurantResult = json_decode($RestaurantData,true);
        
        $count = Db::name('Restaurant_chain')->whereOr($where)->count();
        $Page       =  new \Page($count,30);
        $show       =  $Page->show();
        $this->assign('page',$show);
        $this->assign('p',$p);
        $this->assign('RestaurantResult',$RestaurantResult);
        return $this->fetch();
    }
    
    //添加连锁餐厅简要介绍
    public function add_restaurant_index()
    {
        //获取省份信息
        $area = $this->getPro();
        $this->assign('area',$area);
        return $this->fetch();
    }
    //处理添加连锁餐厅简要介绍
    public function do_add_restaurant_index()
    {
        if($_POST)
        {
            $post = $_POST;
            $areaDB = Db::name('Area');
            $restaurantData['province_id'] = $post['province_id'];
            $restaurantData['city_id'] = $post['city_id'];
            $restaurantData['area_id'] = $post['area_id'];
            $restaurantData['type'] = $post['type'];
            $restaurantData['restaurant_name'] = $post['restaurant_name'];
            $restaurantData['longitude'] = $post['longitude'];
            $restaurantData['latitude'] = $post['latitude'];
            $restaurantData['restaurant_Introduction'] = $post['restaurant_Introduction'];
            $restaurantData['per_capita'] = $post['per_capita'];
            $restaurantData['meal_time'] = $post['meal_time'];
            $restaurantData['phone'] = $post['phone'];
            $restaurantData['address'] = $post['address'];
            $restaurantData['business_hours'] = $post['business_hours'];
            if(!empty($post['other_description']))
            {
                $restaurantData['other_description'] = $post['other_description'];
            }

            $restaurantData['create_time'] = time();
            $restaurantData['update_time'] = time();
            $restaurantData['published_time'] = time();
            // $restaurantData['status'] = $post['status'];
            
            $cityData =  $areaDB->field(array('area_name'))->where(array('area_id'=>$post['city_id']))->find();
            $restaurantData['city_name'] = $cityData['area_name'];
            if($post['area_id'] != '')
            {
                $areaData =  $areaDB->field(array(' area_name'))->where(array('area_id'=>$post['area_id']))->find();
                $restaurantData['area_name'] = $areaData['area_name'];
            }
            if (!empty($post['photo_names']) && !empty($post['photo_urls'])) {
                $restaurantData['pic'] = [];
                foreach ($post['photo_urls'] as $key => $url) {
                    $photoUrl = cmf_asset_relative_url($url);
                    array_push($restaurantData['pic'], ["url" => $photoUrl, "name" => $post['photo_names'][$key]]);
                }
            }
            if(!empty($restaurantData['pic']))
            {
                 $restaurantData['pic'] = json_encode($restaurantData['pic']);
            }
           
            
            if (!empty($post['photo_names2']) && !empty($post['photo_urls2'])) {
                $restaurantData['picture2'] = [];
                foreach ($post['photo_urls2'] as $key => $url) {
                    $photoUrl2 = cmf_asset_relative_url($url);
                    array_push($restaurantData['picture2'], ["url" => $photoUrl2, "name" => $post['photo_names2'][$key]]);
                }
            }
            if(!empty($restaurantData['picture2']))
            {
                $restaurantData['picture2'] = json_encode($restaurantData['picture2']);
            }
            
            if(Db::name('Restaurant_chain')->insert($restaurantData))
            {
                $this->success('保存成功!', url('food/restaurant_index'));
            }  else {
                $this->success('保存失败!', url('food/restaurant_index'));
            }
            
        }
    }
    //编辑连锁餐厅简要介绍
    public function edit_restaurant_index()
    {
        $str = trim(strrchr($_SERVER["QUERY_STRING"], '/'),'/');
        $page = substr($str,0,strpos($str, '.'));
        $this->assign('page',$page);

        $id = $this->request->param('id', 0, 'intval');
        $Restaurant_chainData = Db::name('Restaurant_chain')->where(array('id'=>$id))->find();
        //图片格式处理
        $Restaurant_chainData['pic11'] = json_decode($Restaurant_chainData['pic'], True);
        $Restaurant_chainData['picture21'] = json_decode($Restaurant_chainData['picture2'], True);
        $this->assign('Restaurant_chainData',$Restaurant_chainData);  
        //显示省份 
        $areaData = $this->getPro();  //格式是对象里嵌套着数组
        $area = $this->object_to_array($areaData);   //对象转换成二维数组
        //显示省份 
        $areaData = $this->getPro();  //格式是对象里嵌套着数组
        $area = $this->object_to_array($areaData);   //对象转换成二维数组
        foreach($area as $key=>&$val)
        {       
            if($val['area_id'] == $Restaurant_chainData['province_id'])
            {
                $val['status'] = 'selected=selected';
            }else {
                $val['status'] = '';
            }
        }   
        $this->assign('area',$area);

        //显示省份下对应的城市
        $cityListData = $this->getCity($Restaurant_chainData['province_id']);
        $cityList = $this->object_to_array($cityListData);
        foreach($cityList as &$values)
        {
            if($values['area_id'] == $Restaurant_chainData['city_id'])
            {
                    $values['status'] = 'selected=selected';
            }else {
                $values['status'] = '';
            }
        }
        $this->assign('cityList',$cityList);

        //显示城市下对应的区域，县
        $areaListData = $this->getArea($Restaurant_chainData['city_id']);
        $areaList = $this->object_to_array($areaListData);
        foreach($areaList as &$va)
        {
            if($va['area_id'] == $Restaurant_chainData['area_id'])
            {
                    $va['status'] = 'selected=selected';
            }else {
                $va['status'] = '';
            }
        }
        $this->assign('areaList',$areaList);
        return $this->fetch();
    }
    //处理编辑连锁餐厅简要介绍
    public function do_edit_restaurant_index()
    {
        if($_POST)
        {
            $post = $_POST;
            $page = $post['page'];
            $areaDB = Db::name('Area');
            $Restaurant_chainData['province_id'] = $post['province_id'];
            $Restaurant_chainData['city_id'] = $post['city_id'];
            $Restaurant_chainData['area_id'] = $post['area_id'];
            $Restaurant_chainData['type'] = $post['type'];
            $Restaurant_chainData['restaurant_name'] = $post['restaurant_name'];
            $Restaurant_chainData['longitude'] = $post['longitude'];
            $Restaurant_chainData['latitude'] = $post['latitude'];
            $Restaurant_chainData['restaurant_Introduction'] = $post['restaurant_Introduction'];
            $Restaurant_chainData['per_capita'] = $post['per_capita'];
            $Restaurant_chainData['meal_time'] = $post['meal_time'];
            $Restaurant_chainData['phone'] = $post['phone'];
            $Restaurant_chainData['address'] = $post['address'];
            $Restaurant_chainData['business_hours'] = $post['business_hours'];
            if(!empty($post['other_description']))
            {
                $Restaurant_chainData['other_description'] = $post['other_description'];
            }

            $Restaurant_chainData['update_time'] = time();
            
            $cityData =  $areaDB->field(array('area_name'))->where(array('area_id'=>$post['city_id']))->find();
            $Restaurant_chainData['city_name'] = $cityData['area_name'];
            if($post['area_id'] != '')
            {
                $areaData =  $areaDB->field(array('area_name'))->where(array('area_id'=>$post['area_id']))->find();
                $Restaurant_chainData['area_name'] = $areaData['area_name'];
            }
            if (!empty($post['photo_names']) && !empty($post['photo_urls'])) {
                $Restaurant_chainData['pic'] = [];
                foreach ($post['photo_urls'] as $key => $url) {
                    $photoUrl = cmf_asset_relative_url($url);
                    array_push($Restaurant_chainData['pic'], ["url" => $photoUrl, "name" => $post['photo_names'][$key]]);
                }
            }
            if(!empty($Restaurant_chainData['pic']))
            {
                $Restaurant_chainData['pic'] = json_encode($Restaurant_chainData['pic']);
            }
            
            
            if (!empty($post['photo_names2']) && !empty($post['photo_urls2'])) {
                $Restaurant_chainData['picture2'] = [];
                foreach ($post['photo_urls2'] as $key => $url) {
                    $photoUrl2 = cmf_asset_relative_url($url);
                    array_push($Restaurant_chainData['picture2'], ["url" => $photoUrl2, "name" => $post['photo_names2'][$key]]);
                }
            }
            if(!empty($Restaurant_chainData['picture2']))
            {
                 $Restaurant_chainData['picture2'] = json_encode($Restaurant_chainData['picture2']);
            }
           
            $where['id'] = $post['id'];
            if(Db::name('Restaurant_chain')->where($where)->update($Restaurant_chainData))
            {
                $this->success('修改成功!', url('/foodshop/food/restaurant_index.html?page='.$page));
            }  else {
                $this->success('修改失败!', url('food/restaurant_index'));
            }
            
        }
    }
    //删除连锁餐厅简要介绍
    public function delete_restaurant_index()
    {
        $param = $this->request->param();
        //单个选中删除
        if(isset($param['id']))
        {
            if(Db::name('Restaurant_chain')->where(array('id'=>$param['id']))->delete())
            {
                $this->success('删除成功！');
            }
        }
        //批量选中删除
        if(isset($param['ids']))
        {
            $ids = $param['ids'];
            if(Db::name('Restaurant_chain')->where(['id' => ['in', $ids]])->delete())
            {
                $this->success('删除成功！');
            }
        }   
    }

    //置顶 取消（is_top 0-未置顶，1-置顶）
    public function top4()
    {
        $param = $this->request->param();

        if (isset($param['ids']) && isset($param["yes"])) {
            $ids = $this->request->param('ids/a');

            Db::name('Restaurant_chain')->where(['id' => ['in', $ids]])->update(['is_top' => 1]);

            $this->success("置顶成功！", '');

        }

        if (isset($_POST['ids']) && isset($param["no"])) {
            $ids = $this->request->param('ids/a');

            Db::name('Restaurant_chain')->where(['id' => ['in', $ids]])->update(['is_top' => 0]);

            $this->success("取消置顶成功！", '');
        }
    }

    //连锁餐厅是否发布（1-发布、0-未发布,发布时间随之改变）
    public function publish4()
    {
        $param = $this->request->param();

        if (isset($param['ids']) && isset($param["yes"])) {
            $ids = $this->request->param('ids/a');

            $data['status'] = 1;
            $data['published_time'] = time();
            Db::name('Restaurant_chain')->where(['id' => ['in', $ids]])->update($data);

            $this->success("发布成功！", '');

        }

        if (isset($_POST['ids']) && isset($param["no"])) {
            $ids = $this->request->param('ids/a');

            $data['status'] = 0;
            $data['published_time'] = time();
            Db::name('Restaurant_chain')->where(['id' => ['in', $ids]])->update($data);

            $this->success("取消发布成功！", '');
        }

    }
    /***************** 连锁餐厅 推荐菜品 *********************/
    //连锁餐厅的推荐菜品
    public function recon_dishes()
    {
       vendor('Page.system_page'); //分页
        $p = isset($_GET['page'])?$_GET['page']:1;
        $where = array();
        if (!empty($_GET['keyword'])) 
        {
            $queryString = $_GET['keyword'];
            if(strlen($queryString) > 0)
            {
                $where['store_name']= array('like',"%$queryString%");
            }
        }
        //默认是按照id进行查询的，这里根据是否置顶is_top进行查询显示
        $recom_dishesdData = Db::name('recom_dishes')->whereOr($where)->page($p.',30')->order('is_top desc')->select();
        $recom_dishesResult = json_decode($recom_dishesdData,true);
        $count = Db::name('recom_dishes')->whereOr($where)->count();
        $Page       =  new \Page($count,30);
        $show       =  $Page->show();
        $this->assign('page',$show);
        $this->assign('p',$p);
        $this->assign('recom_dishesResult',$recom_dishesResult);
        return $this->fetch();
    }
    //添加连锁餐厅的推荐菜品
    public function add_recon_dishes()
    {
        //获取省份信息
        $area=$this->getPro();
        $this->assign('area', $area);
        return $this->fetch();
    }
    //处理添加连锁餐厅的推荐菜品
    public function do_add_recon_dishes()
    {
        if($_POST)
        {
            $post = $_POST;
            $dishes_recommendedData['store_name'] = $post['store_name'];
            $dishes_recommendedData['dishes_name'] = $post['dishes_name'];
            $dishes_recommendedData['is_hot_have'] = $post['is_hot_have'];

            $dishes_recommendedData['province_id']=$post['province_id'];
            $dishes_recommendedData['city_id']=$post['city_id'];

            if (!empty($post['photo_names']) && !empty($post['photo_urls'])) {
                $dishes_recommendedData['pic'] = [];
                foreach ($post['photo_urls'] as $key => $url) {
                    $photoUrl = cmf_asset_relative_url($url);
                    array_push($dishes_recommendedData['pic'], ["url" => $photoUrl, "name" => $post['photo_names'][$key]]);
                }
            }
             if(!empty($dishes_recommendedData['pic']))
            {
                $dishes_recommendedData['pic'] = json_encode($dishes_recommendedData['pic']);
            }
            

            $dishes_recommendedData['create_time'] = time();
            $dishes_recommendedData['update_time'] = time();
            $dishes_recommendedData['published_time'] = time();
            // $dishes_recommendedData['status'] = $post['status'];

            // print_r($dishes_recommendedData);
            // exit;
            if(Db::name('recom_dishes')->insert($dishes_recommendedData))
            {
                $this->success('保存成功!', url('food/recon_dishes'));
            }  else {
                $this->success('保存失败!', url('food/recon_dishes'));
            }
            
        }
    }

    //编辑 连锁餐厅菜品推荐
    public function edit_recon_dishes()
    {
        $str = trim(strrchr($_SERVER["QUERY_STRING"], '/'),'/');
        $page = substr($str,0,strpos($str, '.'));
        $this->assign('page',$page);

        $id = $this->request->param('id', 0, 'intval');
        $recon_dishesData = Db::name('recom_dishes')->where(array('id'=>$id))->find();
        //图片格式处理
        $recon_dishesData['pic11'] = json_decode($recon_dishesData['pic'], True);
        $this->assign('recon_dishesData',$recon_dishesData);  

        //显示省份 
        $areaData = $this->getPro();  //格式是对象里嵌套着数组
        $area = $this->object_to_array($areaData);   //对象转换成二维数组
   
        foreach($area as $key=>&$val)
        {       
            if($val['area_id'] == $recon_dishesData['province_id'])
            {
               $val['status'] = 'selected=selected';
            }else {
                $val['status'] = '';
            }
        }   
        $this->assign('area',$area);
        
        //显示省份下对应的城市
        $cityListData = $this->getCity($recon_dishesData['province_id']);
        $cityList = $this->object_to_array($cityListData);
        
        foreach($cityList as &$values)
        {
            if($values['area_id'] == $recon_dishesData['city_id'])
            {
                 $values['status'] = 'selected=selected';
            }else {
                $values['status'] = '';
            }
        }
        $this->assign('cityList',$cityList);
        return $this->fetch();
    }

    //处理编辑 连锁餐厅菜品推荐
    public function do_edit_recon_dishes()
    {
        if($_POST)
        {
            $post = $_POST;
            $page = $post['page'];
            $dishes_recommendedData['store_name'] = $post['store_name'];
            $dishes_recommendedData['dishes_name'] = $post['dishes_name'];
            $dishes_recommendedData['is_hot_have'] = $post['is_hot_have'];

            $dishes_recommendedData['province_id']=$post['province_id'];
            $dishes_recommendedData['city_id']=$post['city_id'];
            
            if (!empty($post['photo_names']) && !empty($post['photo_urls'])) {
                $dishes_recommendedData['pic'] = [];
                foreach ($post['photo_urls'] as $key => $url) {
                    $photoUrl = cmf_asset_relative_url($url);
                    array_push($dishes_recommendedData['pic'], ["url" => $photoUrl, "name" => $post['photo_names'][$key]]);
                }
            }
            if(!empty($dishes_recommendedData['pic']))
            {
                $dishes_recommendedData['pic'] = json_encode($dishes_recommendedData['pic']);
            }
            

            $dishes_recommendedData['update_time'] = time();

            $where['id'] = $post['id'];
            if(Db::name('recom_dishes')->where($where)->update($dishes_recommendedData))
            {
                $this->success('修改成功!', url('/foodshop/food/recon_dishes.html?page='.$page));
            }  else {
                $this->success('修改失败!', url('food/recon_dishes'));
            }
            
        }
    }

    //删除 连锁餐厅菜品推荐
    public function delete_recon_dishes()
    {
        $param = $this->request->param();
        //单个选中删除
        if(isset($param['id']))
        {
            if(Db::name('recom_dishes')->where(array('id'=>$param['id']))->delete())
            {
                $this->success('删除成功！');
            }
        }
        //批量选中删除
        if(isset($param['ids']))
        {
            $ids = $param['ids'];
            if(Db::name('recom_dishes')->where(['id' => ['in', $ids]])->delete())
            {
                $this->success('删除成功！');
            }
        }   
    }
    //置顶 取消（is_top 0-未置顶，1-置顶）
    public function top5()
    {
        $param = $this->request->param();

        if (isset($param['ids']) && isset($param["yes"])) {
            $ids = $this->request->param('ids/a');

            Db::name('recom_dishes')->where(['id' => ['in', $ids]])->update(['is_top' => 1]);

            $this->success("置顶成功！", '');

        }

        if (isset($_POST['ids']) && isset($param["no"])) {
            $ids = $this->request->param('ids/a');

            Db::name('recom_dishes')->where(['id' => ['in', $ids]])->update(['is_top' => 0]);

            $this->success("取消置顶成功！", '');
        }
    }

    //连锁餐厅菜品推荐是否发布（1-发布、0-未发布,发布时间随之改变）
    public function publish5()
    {
        $param = $this->request->param();

        if (isset($param['ids']) && isset($param["yes"])) {
            $ids = $this->request->param('ids/a');

            $data['status'] = 1;
            $data['published_time'] = time();
            Db::name('recom_dishes')->where(['id' => ['in', $ids]])->update($data);

            $this->success("发布成功！", '');

        }

        if (isset($_POST['ids']) && isset($param["no"])) {
            $ids = $this->request->param('ids/a');

            $data['status'] = 0;
            $data['published_time'] = time();
            Db::name('recom_dishes')->where(['id' => ['in', $ids]])->update($data);

            $this->success("取消发布成功！", '');
        }

    }

    /***** 连锁餐厅 ==> 分店 *****/

    //连锁餐厅的简要介绍
    public function branch()
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
                $where['store_name']= array('like',"%$queryString%");
            }
        }

        $BranchData = Db::name('Branch')->whereOr($where)->page($p.',30')->order('is_top desc')->select();
        $BranchResult = json_decode($BranchData,true);
        $count = Db::name('Branch')->whereOr($where)->count();
        $Page       =  new \Page($count,30);
        $show       =  $Page->show();
        $this->assign('page',$show);
        $this->assign('p',$p);
        $this->assign('BranchResult',$BranchResult);
        return $this->fetch();
    }
    
    //添加连锁餐厅简要介绍
    public function add_branch()
    {
        return $this->fetch();
    }
    //处理添加连锁餐厅简要介绍
    public function do_add_branch()
    {
        if($_POST)
        {
            $post = $_POST;
            $branchData['store_name'] = $post['store_name'];
            $branchData['longitude'] = $post['longitude'];
            $branchData['latitude'] = $post['latitude'];
            $branchData['branch_name'] = $post['branch_name'];
            $branchData['phone'] = $post['phone'];
            $branchData['address'] = $post['address'];
            $branchData['business_hours'] = $post['business_hours'];

            $branchData['create_time'] = time();
            $branchData['update_time'] = time();
            $branchData['published_time'] = time();
            // $branchData['status'] = $post['status'];
            if(Db::name('Branch')->insert($branchData))
            {
                $this->success('保存成功!', url('food/branch'));
            }  else {
                $this->success('保存失败!', url('food/branch'));
            }
            
        }
    }
    //编辑连锁餐厅简要介绍
    public function edit_branch()
    {
        $str = trim(strrchr($_SERVER["QUERY_STRING"], '/'),'/');
        $page = substr($str,0,strpos($str, '.'));
        $this->assign('page',$page);
        
        $id = $this->request->param('id', 0, 'intval');
        $BranchData = Db::name('Branch')->where(array('id'=>$id))->find();
        $this->assign('BranchData',$BranchData);  
        return $this->fetch();
    }
    //处理编辑连锁餐厅简要介绍
    public function do_edit_branch()
    {
        if($_POST)
        {
            $post = $_POST;
            $page = $post['page'];
            $branchData['store_name'] = $post['store_name'];
            $branchData['longitude'] = $post['longitude'];
            $branchData['latitude'] = $post['latitude'];
            $branchData['branch_name'] = $post['branch_name'];
            $branchData['phone'] = $post['phone'];
            $branchData['address'] = $post['address'];
            $branchData['business_hours'] = $post['business_hours'];
           
            $branchData['update_time'] = time();
            $where['id'] = $post['id'];
            if(Db::name('Branch')->where($where)->update($branchData))
            {
                $this->success('修改成功!', url('/foodshop/food/branch.html?page='.$page));
            }  else {
                $this->success('修改失败!', url('food/branch'));
            }
            
        }
    }
    //删除连锁餐厅简要介绍
    public function delete_branch()
    {
        $param = $this->request->param();
        //单个选中删除
        if(isset($param['id']))
        {
            if(Db::name('Branch')->where(array('id'=>$param['id']))->delete())
            {
                $this->success('删除成功！');
            }
        }
        //批量选中删除
        if(isset($param['ids']))
        {
            $ids = $param['ids'];
            if(Db::name('Branch')->where(['id' => ['in', $ids]])->delete())
            {
                $this->success('删除成功！');
            }
        }   
    }

    //置顶 取消（is_top 0-未置顶，1-置顶）
    public function top6()
    {
        $param = $this->request->param();

        if (isset($param['ids']) && isset($param["yes"])) {
            $ids = $this->request->param('ids/a');

            Db::name('Branch')->where(['id' => ['in', $ids]])->update(['is_top' => 1]);

            $this->success("置顶成功！", '');

        }

        if (isset($_POST['ids']) && isset($param["no"])) {
            $ids = $this->request->param('ids/a');

            Db::name('Branch')->where(['id' => ['in', $ids]])->update(['is_top' => 0]);

            $this->success("取消置顶成功！", '');
        } 
    }

    //连锁餐厅简要介绍是否发布（1-发布、0-未发布,发布时间随之改变）
    public function publish6()
    {
        $param = $this->request->param();

        if (isset($param['ids']) && isset($param["yes"])) {
            $ids = $this->request->param('ids/a');

            $data['status'] = 1;
            $data['published_time'] = time();
            Db::name('Branch')->where(['id' => ['in', $ids]])->update($data);

            $this->success("发布成功！", '');

        }

        if (isset($_POST['ids']) && isset($param["no"])) {
            $ids = $this->request->param('ids/a');

            $data['status'] = 0;
            $data['published_time'] = time();
            Db::name('Branch')->where(['id' => ['in', $ids]])->update($data);

            $this->success("取消发布成功！", '');
        }

    }
    
}