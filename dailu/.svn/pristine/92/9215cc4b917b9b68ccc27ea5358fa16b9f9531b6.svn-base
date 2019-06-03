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

/********************  购物天堂 **********************/
class ShopController extends AdminBaseController
{
    public function index()
    {
        return $this->fetch();
    }

    //购物详情
    public function shopping_streets()
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
                $where['shopping_name']= array('like',"%$queryString%");
                $shoppingData = Db::name('shopping_streets')->where($where)->order('is_top desc')->select();
                $shoppingResult = json_decode($shoppingData,true);
            }
        }

        $shoppingData = Db::name('shopping_streets')->whereOr($where)->page($p.',30')->order('is_top desc')->select();
        $shoppingResult = json_decode($shoppingData,true);
        
        $count = Db::name('shopping_streets')->whereOr($where)->count();
        $Page       =  new \Page($count,30);
        $show       =  $Page->show();
        $this->assign('page',$show);
        $this->assign('p',$p);
        $this->assign('shoppingResult',$shoppingResult);
        return $this->fetch();
    }
    
    //添加
    public function add_shopping_streets()
    {
        //获取省份信息
        $area = $this->getPro();
        $this->assign('area',$area);
        return $this->fetch();
    }
    //处理添加购物
    public function do_add_shopping_streets()
    {
        if($_POST)
        {
            $post = $_POST;
            $areaDB = Db::name('Area');
            $shoppingData['province_id'] = $post['province_id'];
            $shoppingData['city_id'] = $post['city_id'];
            $shoppingData['area_id'] = $post['area_id'];
            $shoppingData['type'] = $post['type'];
            $shoppingData['shopping_name'] = $post['shopping_name'];
            $shoppingData['shop_type'] = $post['shop_type'];
            $shoppingData['longitude'] = $post['longitude'];
            $shoppingData['latitude'] = $post['latitude'];
            $shoppingData['shopping_Introduction'] = $post['shopping_Introduction'];
            $shoppingData['shopping_time'] = $post['shopping_time'];
            $shoppingData['phone'] = $post['phone'];
            $shoppingData['address'] = $post['address'];
            $shoppingData['business_hours'] = $post['business_hours'];

            $shoppingData['absture'] = $post['absture'];
            $shoppingData['attr_score'] = $post['attr_score'];
            $shoppingData['tuijian_time'] = $post['tuijian_time'];
            $shoppingData['period_time'] = $post['period_time'];
            $shoppingData['not_modifity']=$post['not_modifity'];

            if(!empty($post['tebie_tuijian']))
            {
                $shoppingData['tebie_tuijian'] = $post['tebie_tuijian'];
            }
            if(!empty($post['other_description']))
            {
                $shoppingData['other_description'] = $post['other_description'];
            }

            $shoppingData['create_time'] = time();
            $shoppingData['update_time'] = time();
            $shoppingData['published_time'] = time();
            // $shoppingData['status'] = $post['status'];
            
            $cityData =  $areaDB->field(array('area_name'))->where(array('area_id'=>$post['city_id']))->find();
            $shoppingData['city_name'] = $cityData['area_name'];
            if($post['area_id'] != '')
            {
                $areaData =  $areaDB->field(array('area_name'))->where(array('area_id'=>$post['area_id']))->find();
                $shoppingData['area_name'] = $areaData['area_name'];
            }
            if (!empty($post['photo_names']) && !empty($post['photo_urls'])) {
                $shoppingData['pic'] = [];
                foreach ($post['photo_urls'] as $key => $url) {
                    $photoUrl = cmf_asset_relative_url($url);
                    array_push($shoppingData['pic'], ["url" => $photoUrl, "name" => $post['photo_names'][$key]]);
                }
            }
            if(!empty($shoppingData['pic']))
            {
                $shoppingData['pic'] = json_encode($shoppingData['pic']);
            }
            
            
            if (!empty($post['photo_names2']) && !empty($post['photo_urls2'])) {
                $shoppingData['picture2'] = [];
                foreach ($post['photo_urls2'] as $key => $url) {
                    $photoUrl2 = cmf_asset_relative_url($url);
                    array_push($shoppingData['picture2'], ["url" => $photoUrl2, "name" => $post['photo_names2'][$key]]);
                }
            }
            if(!empty($shoppingData['picture2']))
            {
                $shoppingData['picture2'] = json_encode($shoppingData['picture2']);
            }
            

            if(Db::name('shopping_streets')->insert($shoppingData))
            {
                $this->success('保存成功!', url('shop/shopping_streets'));
            }  else {
                $this->success('保存失败!', url('shop/shopping_streets'));
            }
            
        }
    }
    //编辑购物
    public function edit_shopping_streets()
    {
        $str = trim(strrchr($_SERVER["QUERY_STRING"], '/'),'/');
        $page = substr($str,0,strpos($str, '.'));
        $this->assign('page',$page);

        $id = $this->request->param('id', 0, 'intval');
        $shopping_streetsData = Db::name('shopping_streets')->where(array('id'=>$id))->find();
        //图片格式处理
        $shopping_streetsData['pic11'] = json_decode($shopping_streetsData['pic'], True);
        $shopping_streetsData['picture21'] = json_decode($shopping_streetsData['picture2'], True);
        $this->assign('shopping_streetsData',$shopping_streetsData);    
        //显示省份 
        $areaData = $this->getPro();  //格式是对象里嵌套着数组
        $area = $this->object_to_array($areaData);   //对象转换成二维数组
        //显示省份 
        $areaData = $this->getPro();  //格式是对象里嵌套着数组
        $area = $this->object_to_array($areaData);   //对象转换成二维数组
        foreach($area as $key=>&$val)
        {       
            if($val['area_id'] == $shopping_streetsData['province_id'])
            {
                $val['status'] = 'selected=selected';
            }else {
                $val['status'] = '';
            }
        }   
        $this->assign('area',$area);

        //显示省份下对应的城市
        $cityListData = $this->getCity($shopping_streetsData['province_id']);
        $cityList = $this->object_to_array($cityListData);
        foreach($cityList as &$values)
        {
            if($values['area_id'] == $shopping_streetsData['city_id'])
            {
                    $values['status'] = 'selected=selected';
            }else {
                $values['status'] = '';
            }
        }
        $this->assign('cityList',$cityList);

        //显示城市下对应的区域，县
        $areaListData = $this->getArea($shopping_streetsData['city_id'])->toarray();
        $areaList = $areaListData;
        foreach($areaList as &$va)
        {
            if($va['area_id'] == $shopping_streetsData['area_id'])
            {
                    $va['status'] = 'selected=selected';
            }else {
                $va['status'] = '';
            }
        }
        $this->assign('areaList',$areaList);
        return $this->fetch();
    }
    //处理编辑购物
    public function do_edit_shopping_streets()
    {
        if($_POST)
        {
            $post = $_POST;
            $page = $post['page'];
            $areaDB = Db::name('Area');
            $shoppingData['province_id'] = $post['province_id'];
            $shoppingData['city_id'] = $post['city_id'];
            $shoppingData['area_id'] = $post['area_id'];
            $shoppingData['type'] = $post['type'];
            $shoppingData['shopping_name'] = $post['shopping_name'];
            $shoppingData['shop_type'] = $post['shop_type'];
            $shoppingData['longitude'] = $post['longitude'];
            $shoppingData['latitude'] = $post['latitude'];
            $shoppingData['shopping_Introduction'] = $post['shopping_Introduction'];
            $shoppingData['shopping_time'] = $post['shopping_time'];
            $shoppingData['phone'] = $post['phone'];
            $shoppingData['address'] = $post['address'];
            $shoppingData['business_hours'] = $post['business_hours'];

            $shoppingData['absture'] = $post['absture'];
            $shoppingData['attr_score'] = $post['attr_score'];
            $shoppingData['tuijian_time'] = $post['tuijian_time'];
            $shoppingData['period_time'] = $post['period_time'];
            $shoppingData['not_modifity']=$post['not_modifity'];

            if(!empty($post['tebie_tuijian']))
            {
                $shoppingData['tebie_tuijian'] = $post['tebie_tuijian'];
            }
            if(!empty($post['other_description']))
            {
                $shoppingData['other_description'] = $post['other_description'];
            }

            $shoppingData['update_time'] = time();
            
            $cityData =  $areaDB->field(array('area_name'))->where(array('area_id'=>$post['city_id']))->find();
            $shoppingData['city_name'] = $cityData['area_name'];
            if($post['area_id'] != '')
            {
                $areaData =  $areaDB->field(array('area_name'))->where(array('area_id'=>$post['area_id']))->find();
                $shoppingData['area_name'] = $areaData['area_name'];
            }
            if (!empty($post['photo_names']) && !empty($post['photo_urls'])) {
                $shoppingData['pic'] = [];
                foreach ($post['photo_urls'] as $key => $url) {
                    $photoUrl = cmf_asset_relative_url($url);
                    array_push($shoppingData['pic'], ["url" => $photoUrl, "name" => $post['photo_names'][$key]]);
                }
            }
            if(!empty($shoppingData['pic']))
            {
                $shoppingData['pic'] = json_encode($shoppingData['pic']);
            }

                 
            if (!empty($post['photo_names2']) && !empty($post['photo_urls2'])) {
                $shoppingData['picture2'] = [];
                foreach ($post['photo_urls2'] as $key => $url) {
                    $photoUrl2 = cmf_asset_relative_url($url);
                    array_push($shoppingData['picture2'], ["url" => $photoUrl2, "name" => $post['photo_names2'][$key]]);
                }
            }
            if(!empty($shoppingData['picture2']))
            {
                $shoppingData['picture2'] = json_encode($shoppingData['picture2']);
            }
            
            
 
            $where['id'] = $post['id'];
            if(Db::name('shopping_streets')->where($where)->update($shoppingData))
            {
                $this->success('修改成功!',url('/foodshop/shop/shopping_streets.html?page='.$page));
            }  else {
                $this->success('修改失败!', url('shop/shopping_streets'));
            }
            
        }
    }
    //删除购物
    public function delete_shopping_streets()
    {
        $param = $this->request->param();
        //单个选中删除
        if(isset($param['id']))
        {
            if(Db::name('shopping_streets')->where(array('id'=>$param['id']))->delete())
            {
                $this->success('删除成功！');
            }
        }
        //批量选中删除
        if(isset($param['ids']))
        {
            $ids = $param['ids'];
            if(Db::name('shopping_streets')->where(['id' => ['in', $ids]])->delete())
            {
                $this->success('删除成功！');
            }
        }   
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
    //置顶 取消（is_top 0-未置顶，1-置顶）
    public function top()
    {
        $param = $this->request->param();

        if (isset($param['ids']) && isset($param["yes"])) {
            $ids = $this->request->param('ids/a');

            Db::name('shopping_streets')->where(['id' => ['in', $ids]])->update(['is_top' => 1]);

            $this->success("置顶成功！", '');

        }

        if (isset($_POST['ids']) && isset($param["no"])) {
            $ids = $this->request->param('ids/a');

            Db::name('shopping_streets')->where(['id' => ['in', $ids]])->update(['is_top' => 0]);

            $this->success("取消置顶成功！", '');
        }
    }

    //购物详情是否发布（1-发布、0-未发布,发布时间随之改变）
    public function publish()
    {
        $param = $this->request->param();

        if (isset($param['ids']) && isset($param["yes"])) {
            $ids = $this->request->param('ids/a');

            $data['status'] = 1;
            $data['published_time'] = time();
            Db::name('shopping_streets')->where(['id' => ['in', $ids]])->update($data);

            $this->success("发布成功！", '');

        }

        if (isset($_POST['ids']) && isset($param["no"])) {
            $ids = $this->request->param('ids/a');

            $data['status'] = 0;
            $data['published_time'] = time();
            Db::name('shopping_streets')->where(['id' => ['in', $ids]])->update($data);

            $this->success("取消发布成功！", '');
        }

    }

    /************ 购物天堂 ==》推荐商品 ******************/
    public function recommend_goods()
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
                $where['goods_name']= array('like',"%$queryString%");
            }
        }
        
        $goodsData = Db::name('goods_info')->whereOr($where)->page($p.',30')->order('is_top desc')->select();
        $goodsResult = json_decode($goodsData,true);
        $count = Db::name('goods_info')->whereOr($where)->count();
        $Page       =  new \Page($count,30);
        $show       =  $Page->show();
        $this->assign('page',$show);
        $this->assign('p',$p);
        $this->assign('goodsResult',$goodsResult);
        return $this->fetch();
    }
    //添加 商品推荐
    public function add_recommend_goods()
    {
        //获取省份信息
        $area=$this->getPro();
        $this->assign('area', $area);
        return $this->fetch();
    }
    //处理添加 商品推荐
    public function do_add_recommend_goods()
    {
        if($_POST)
        {
            $areaDB=Db::name('Area');
            $post = $_POST;
            $goodsData['goods_name'] = $post['goods_name'];

            $goodsData['province_id']=$post['province_id'];
            $goodsData['city_id']=$post['city_id'];
            $goodsData['area_id']=$post['area_id'];
            if(!empty($post['absture']))
            {
                $goodsData['absture'] = $post['absture'];
            }
            if(!empty($post['spot_Introduction']))
            {
                $goodsData['spot_Introduction'] = $post['spot_Introduction'];
            }
            $goodsData['type'] = $post['type'];
            $goodsData['is_specialty'] = $post['is_specialty'];
            if(!empty($post['recom_sites']))
            {
                $goodsData['recom_sites'] = $post['recom_sites'];
            }
            if(!empty($post['store_name']))
            {
                $goodsData['store_name'] = $post['store_name'];
            }
            if (!empty($post['photo_names']) && !empty($post['photo_urls'])) {
                $goodsData['pic'] = [];
                foreach ($post['photo_urls'] as $key => $url) {
                    $photoUrl = cmf_asset_relative_url($url);
                    array_push($goodsData['pic'], ["url" => $photoUrl, "name" => $post['photo_names'][$key]]);
                }
            }
            if(!empty($goodsData['pic']))
            {
                $goodsData['pic'] = json_encode($goodsData['pic']);
            }
            

            $cityData=$areaDB->field(array('area_name'))->where(array('area_id'=>$post['city_id']))->find();
            $goodsData['city_name']=$cityData['area_name'];
            if($post['area_id'] !='') {
                $areaData=$areaDB->field(array('area_name'))->where(array('area_id'=>$post['area_id']))->find();
                $goodsData['area_name']=$areaData['area_name'];
            }

            $goodsData['create_time'] = time();
            $goodsData['update_time'] = time();
            $goodsData['published_time'] = time();
            // $goodsData['status'] = $post['status'];

            if(Db::name('goods_info')->insert($goodsData))
            {
                $this->success('保存成功!', url('shop/recommend_goods'));
            }  else {
                $this->success('保存失败!', url('shop/recommend_goods'));
            }
            
        }
    }

    //编辑商品推荐
    public function edit_recommend_goods()
    {
        $str = trim(strrchr($_SERVER["QUERY_STRING"], '/'),'/');
        $page = substr($str,0,strpos($str, '.'));
        $this->assign('page',$page);
        
        $id = $this->request->param('id', 0, 'intval');
        $goodsData = Db::name('goods_info')->where(array('id'=>$id))->find();
        //图片格式处理
        $goodsData['pic11'] = json_decode($goodsData['pic'], True);
        $this->assign('goodsData',$goodsData);  
        //显示省份 
        $areaData = $this->getPro();  //格式是对象里嵌套着数组
        $area = $this->object_to_array($areaData);   //对象转换成二维数组
   
        foreach($area as $key=>&$val)
        {       
            if($val['area_id'] == $goodsData['province_id'])
            {
               $val['status'] = 'selected=selected';
            }else {
                $val['status'] = '';
            }
        }   
        $this->assign('area',$area);
        
        //显示省份下对应的城市
        $cityListData = $this->getCity($goodsData['province_id']);
        $cityList = $this->object_to_array($cityListData);
        
        foreach($cityList as &$values)
        {
            if($values['area_id'] == $goodsData['city_id'])
            {
                 $values['status'] = 'selected=selected';
            }else {
                $values['status'] = '';
            }
        }
        $this->assign('cityList',$cityList);

        //显示城市下对应的区域，县
        $areaListData = $this->getArea($goodsData['city_id'])->toarray();
        $areaList = $areaListData;
        foreach($areaList as &$va)
        {
            if($va['area_id'] == $goodsData['area_id'])
            {
                 $va['status'] = 'selected=selected';
            }else {
                $va['status'] = '';
            }
        }
        $this->assign('areaList',$areaList);
        return $this->fetch();
    }

    //处理编辑 商品推荐
    public function do_edit_recommend_goods()
    {
        if($_POST)
        {
            $areaDB=Db::name('Area');
            $post = $_POST;
            $page = $post['page'];
            $goodsData['goods_name'] = $post['goods_name'];

            $goodsData['province_id']=$post['province_id'];
            $goodsData['city_id']=$post['city_id'];
            $goodsData['area_id']=$post['area_id'];
            if(!empty($post['absture']))
            {
                $goodsData['absture'] = $post['absture'];
            }
            if(!empty($post['spot_Introduction']))
            {
                $goodsData['spot_Introduction'] = $post['spot_Introduction'];
            }

            $goodsData['type'] = $post['type'];
            $goodsData['is_specialty'] = $post['is_specialty'];
            if(!empty($post['recom_sites']))
            {
                $goodsData['recom_sites'] = $post['recom_sites'];
            }
            if(!empty($post['store_name']))
            {
                $goodsData['store_name'] = $post['store_name'];
            }

            if (!empty($post['photo_names']) && !empty($post['photo_urls'])) {
                $goodsData['pic'] = [];
                foreach ($post['photo_urls'] as $key => $url) {
                    $photoUrl = cmf_asset_relative_url($url);
                    array_push($goodsData['pic'], ["url" => $photoUrl, "name" => $post['photo_names'][$key]]);
                }
            }
            if(!empty($goodsData['pic']))
            {
               $goodsData['pic'] = json_encode($goodsData['pic']);
            }
         

            $cityData=$areaDB->field(array('area_name'))->where(array('area_id'=>$post['city_id']))->find();
            $goodsData['city_name']=$cityData['area_name'];
            if($post['area_id'] !='') {
                $areaData=$areaDB->field(array('area_name'))->where(array('area_id'=>$post['area_id']))->find();
                $goodsData['area_name']=$areaData['area_name'];
            }

            $goodsData['update_time'] = time();
          
            $where['id'] = $post['id'];
            if(Db::name('goods_info')->where($where)->update($goodsData))
            {
                $this->success('修改成功!', url('/foodshop/shop/recommend_goods.html?page='.$page));
            }  else {
                $this->success('修改失败!', url('shop/recommend_goods'));
            }
            
        }
    }

    //删除 商品推荐
    public function delete_recommend_goods()
    {
        $param = $this->request->param();
        //单个选中删除
        if(isset($param['id']))
        {
            if(Db::name('goods_info')->where(array('id'=>$param['id']))->delete())
            {
                $this->success('删除成功！');
            }
        }
        //批量选中删除
        if(isset($param['ids']))
        {
            $ids = $param['ids'];
            if(Db::name('goods_info')->where(['id' => ['in', $ids]])->delete())
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

            Db::name('goods_info')->where(['id' => ['in', $ids]])->update(['is_top' => 1]);

            $this->success("置顶成功！", '');

        }

        if (isset($_POST['ids']) && isset($param["no"])) {
            $ids = $this->request->param('ids/a');

            Db::name('goods_info')->where(['id' => ['in', $ids]])->update(['is_top' => 0]);

            $this->success("取消置顶成功！", '');
        }
    }

    //推荐商品是否发布（1-发布、0-未发布,发布时间随之改变）
    public function publish2()
    {
        $param = $this->request->param();

        if (isset($param['ids']) && isset($param["yes"])) {
            $ids = $this->request->param('ids/a');

            $data['status'] = 1;
            $data['published_time'] = time();
            Db::name('goods_info')->where(['id' => ['in', $ids]])->update($data);

            $this->success("发布成功！", '');

        }

        if (isset($_POST['ids']) && isset($param["no"])) {
            $ids = $this->request->param('ids/a');

            $data['status'] = 0;
            $data['published_time'] = time();
            Db::name('goods_info')->where(['id' => ['in', $ids]])->update($data);

            $this->success("取消发布成功！", '');
        }

    }

}