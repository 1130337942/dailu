<?php
//+----------------------------------------------------------------------
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
 * Class CityController
 * @package app\tourist\controller
 */
class CityController extends AdminBaseController
{
    //所有城市列表
    public function index()
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
                $where['city_name']= array('like',"%$queryString%");
            }
        }

        $cityData = Db::name('City_details')->whereOr($where)->page($p.',30')->order('is_top desc')->select();
        foreach($cityData as $key=>&$city)
        {
            $province_name = Db::name('Provinces')->field('province_name')->where('province_id',$city['province_id'])->find();
            $city['province_name'] = $province_name['province_name'];
        }
        $count = Db::name('City_details')->whereOr($where)->count();
        $Page       =  new \Page($count,30);
        $show       =  $Page->show();
        $this->assign('page',$show);
        $this->assign('cityData',$cityData);
        return $this->fetch();
    }
        
    //添加城市
    public function add_city()
    {
        //获取省份信息
        $area = $this->getPro();
        $this->assign('area',$area);
        return $this->fetch();
    }
    //添加城市 提交数据
    public function do_add_city()
    {
        if($_POST)
        {
            $post = $_POST;
            $areaDB = Db::name('Area');
            //城市基本信息存入到City_details表中
            $dataArr['province_id'] = $post['addCity']['province_id'];
            $dataArr['city_id'] = $post['addCity']['city_id'];
            $dataArr['fit_day'] = $post['addCity']['fit_day'];
            $dataArr['hot_spots'] = $post['addCity']['hot_spots'];
            $dataArr['food'] = $post['addCity']['food'];
            $dataArr['longitude'] = $post['addCity']['longitude'];
            $dataArr['latitude'] = $post['addCity']['latitude'];
            $dataArr['city_Introduction'] = $post['addCity']['city_Introduction'];
            $dataArr['city_score'] = $post['addCity']['city_score'];
            if(!empty($post['addCity']['photo_urls']))
            {
                $dataArr['more'] = json_encode($post['addCity']['photo_urls']);
            } 
            
            
            $AreaData =  $areaDB->field(array('area_name','area_url'))->where(array('area_id'=>$post['addCity']['city_id']))->find();
            $provinceData =  $areaDB->field(array('area_name'))->where(array('area_id'=>$post['addCity']['province_id']))->find();
            $dataArr['city_name'] = $AreaData['area_name'];
            $dataArr['province_name'] = $provinceData['area_name'];

            $dataArr['create_time'] = time();
            $dataArr['update_time'] = time();

            //城市简称第一个字母大写
            $dataArr['city_abbreviation'] = ucfirst($AreaData['area_url']);
            Db::name('City_details')->data($dataArr,true)->insert();
            
            //知名景点存到famous_spot表中
            if(isset($post['spotInfo']))
            {
            	foreach($post['spotInfo'] as $k=>$value)
	            {
	                $spotData['spot_name'] = $value['spotName'];
	                $spotData['spot_Introduction'] = $value['spot_Introduction'];
	                if(!empty($value['photo_urls']))
	                {
	                    $spotData['pic'] = json_encode($value['photo_urls']);
	                } 
	                
	                $spotData['is_province_hot'] = $value['is_province_hot'];
	                $spotData['spot_address'] = $value['spot_address'];
	                $spotData['score'] = $value['score'];
	                $spotData['absture'] = $value['absture'];
	                $spotData['province_id'] = $post['addCity']['province_id'];
	                $spotData['city_id'] = $post['addCity']['city_id'];
	                $spotData['city_name'] = $AreaData['area_name'];
	                Db::name('Famous_spot')->insert($spotData);
	            }
            }
            
            //特色美食存到special_food表中
            if(isset($post['foodInfo']))
            {
            	foreach($post['foodInfo'] as $k2=>$value2)
	            {
	                $foodData['dishes_name'] = $value2['dishes_name'];
	                $foodData['dishes_Introduction'] = $value2['dishes_Introduction'];
	                $foodData['dishes_details'] = $value2['dishes_details'];
	                if(!empty($value2['photo_urls']))
	                {
	                    $foodData['dishes_picture'] = json_encode($value2['photo_urls']);
	                } 
	                
	                $foodData['is_recommended'] = $value2['is_recommended'];
	                $foodData['province_id'] = $post['addCity']['province_id'];
	                $foodData['city_id'] = $post['addCity']['city_id'];
	                $foodData['city_name'] = $AreaData['area_name'];
	                Db::name('Special_food')->insert($foodData);
	            }
            }
            
            
            //本地特产存到special_goods表中
            if(isset($post['goodsInfo']))
            {
            	foreach($post['goodsInfo'] as $k3=>$value3)
	            {
	                $goodsData['goods_name'] = $value3['goods_name'];
	                $goodsData['goods_Introduction'] = $value3['goods_Introduction'];
	                $goodsData['goods_details'] = $value3['goods_details'];
	                if(!empty($value3['photo_urls']))
	                {
	                    $goodsData['goods_pic'] = json_encode($value3['photo_urls']);
	                } 
	                
	                $goodsData['goods_is_recommended'] = $value3['goods_is_recommended'];
	                $goodsData['province_id'] = $post['addCity']['province_id'];
	                $goodsData['city_id'] = $post['addCity']['city_id'];
	                $goodsData['city_name'] = $AreaData['area_name'];
	                Db::name('Special_goods')->insert($goodsData);
	            }
            }
            
            
            //城市交通存到city_traffic表中
            if(isset($post['trafficInfo']))
            {
        		foreach($post['trafficInfo'] as $k4=>$value4)
	            {
	                $trafficData['traffic_name'] = $value4['traffic_name'];
	                if(!empty($value4['traffic_phone']))
	                {
	                    $trafficData['traffic_phone'] = $value4['traffic_phone'];
	                }
	                if(!empty($value4['traffic_type']))
	                {
	                    $trafficData['traffic_type'] = $value4['traffic_type'];
	                }
	                if(!empty($value4['traffic_address']))
	                {
	                    $trafficData['traffic_address'] = $value4['traffic_address'];
	                }
	                
	                if(!empty($value4['traffic_longitude']))
	                {
	                    $trafficData['traffic_longitude'] = $value4['traffic_longitude'];
	                }
	                if(!empty($value4['traffic_latitude']))
	                {
	                    $trafficData['traffic_latitude'] = $value4['traffic_latitude'];
	                }

	                if(!empty($value4['photo_urls']))
	                {
	                    $trafficData['traffic_pic'] = json_encode($value4['photo_urls']);
	                }
	                
	                $trafficData['province_id'] = $post['addCity']['province_id'];
	                $trafficData['city_id'] = $post['addCity']['city_id'];
	                $trafficData['city_name'] = $AreaData['area_name'];
	            // print_r($trafficData); exit;
	                Db::name('City_traffic')->insert($trafficData);
	            }
            }
            

            $this->success('保存成功!', url('City/index'));
        }
       
    }
    
    
    //编辑城市 数据显示
    public function edit_city()
    {   
        vendor('Page.system_page');   //引入第三方系统库
        
        $id = $this->request->param('id', 0, 'intval'); 
        //将接收的id存到session中，便于后面方法中调用
        $_SESSION['id']=$id;
        
        /*******************    城市基本详情   ***********/
        $post = Db::name('City_details')->where(array('id'=>$id))->find();
        //图片信息转换成数组
        $post['more2'] = json_decode($post['more'], True);
        $this->assign('post',$post);
        /******************   知名景点详情  ***************/
        $count = Db::name('Famous_spot')->where(array('city_id'=>$post['city_id']))->count();// 查询满足要求的总记录数 
        $famousSpot_Data = Db::name('Famous_spot')->where(array('city_id'=>$post['city_id']))->select();
        $Page = new \Page($count,2);// 实例化分页类 传入总记录数和每页显示的记录数
        $ppData1 = $this->object_to_array($Page);
        $cityId['city_id'] = $post['city_id'];
        $pp1= array_merge($ppData1,$cityId);
        $this->assign('pp1',$pp1);

      	/*****************   特色美食详情    *****************/ 
        $count2 = Db::name('Special_food')->where(array('city_id'=>$post['city_id']))->count();// 查询满足要求的总记录数  
        $SpesicalFood_Data = Db::name('Special_food')->where(array('city_id'=>$post['city_id']))->select();
        $Page2       = new \Page($count2,2);// 实例化分页类 传入总记录数和每页显示的记录数
        $ppData2 = $this->object_to_array($Page2);
        $pp2= array_merge($ppData2,$cityId);
        $this->assign('pp2',$pp2);
       
        /*****************     本地特产详情  *****************/
        $count3 = Db::name('Special_goods')->where(array('city_id'=>$post['city_id']))->count();// 查询满足要求的总记录数  
        $SpesicalGoods_Data = Db::name('Special_goods')->where(array('city_id'=>$post['city_id']))->select();
        $Page3       = new \Page($count3,2);// 实例化分页类 传入总记录数和每页显示的记录数
        $ppData3 = $this->object_to_array($Page3);
        $pp3= array_merge($ppData3,$cityId);
        $this->assign('pp3',$pp3);
     
        /******************   城市交通详情   *****************/
        $count4 = Db::name('City_traffic')->where(array('city_id'=>$post['city_id']))->count();// 查询满足要求的总记录数  
        $cityTraffic_Data = Db::name('City_traffic')->where(array('city_id'=>$post['city_id']))->select();
        $Page4       = new \Page($count4,2);// 实例化分页类 传入总记录数和每页显示的记录数
        $ppData4 = $this->object_to_array($Page4);
        $pp4= array_merge($ppData4,$cityId);
        $this->assign('pp4',$pp4);
        
        
        //显示省份 
        $areaData = $this->getPro();  //格式是对象里嵌套着数组
        $area = $this->object_to_array($areaData);   //对象转换成二维数组
        foreach($area as $key=>&$val)
        {       
            if($val['area_id'] == $post['province_id'])
            {
               $val['status'] = 'selected=selected';
            }else {
                $val['status'] = '';
            }
        }   
        $this->assign('area',$area);
        
        //显示省份下对应的城市
        $cityListData = $this->getCity($post['province_id']);
        $cityList = $this->object_to_array($cityListData);
        foreach($cityList as &$values)
        {
            if($values['area_id'] == $post['city_id'])
            {
                 $values['status'] = 'selected=selected';
            }else {
                $values['status'] = '';
            }
        }
        $this->assign('cityList',$cityList);
        
        return $this->fetch();
    }
    
    public function jsonReturn($data,$type='JSON_UNESCAPED_UNICODE')
    {
        
            echo json_encode($data,$type);
            exit;
    }
    
/********  测试接口*******************/
    public function test()
    {
        $id = $_SESSION['views'];
        var_dump($id);
    }
    
    /******************   知名景点详情  ***************/
    public function famous_spot()
    {
        vendor('Page.system_page');   //引入第三方系统库
        $p = isset($_POST['page'])?$_POST['page']:1;
        $post = Db::name('City_details')->where(array('id'=>$_SESSION['id']))->find();
        $count = Db::name('Famous_spot')->where(array('city_id'=>$post['city_id']))->count();// 查询满足要求的总记录数  
        $famousSpot_Data = Db::name('Famous_spot')->page($p.',2')
        ->where(array('city_id'=>$post['city_id']))->select();
        $Page       = new \Page($count,1);// 实例化分页类 传入总记录数和每页显示的记录数
        $famousInfo = $this->object_to_array($famousSpot_Data);
        $pp1 = $this->object_to_array($Page);
        // $spot['urlTop'] = "http://thinkcmf5.com:8080/public/upload/";    //图片展示的URL头部，后期上传到正式需要对应修改
      
        foreach($famousInfo as &$famous)
        {
            $famous_pic =json_decode($famous['pic'],true);
            foreach($famous_pic as $key1 => &$famous_value)
            {
                //common.php中封装的图片url解析方法
                $famous['url'][$key1] = cmf_get_image_preview_url($famous_value['url']); 
                $famous['pic_name'][$key1] = $famous_value['name'];
            }
        }
        $spot = array();
        $spot['spot'] = $famousInfo;
        $famousArr = $this->object_to_array($spot);
        $this->jsonReturn($famousArr,JSON_UNESCAPED_UNICODE);
        
    }

    /*****************   特色美食详情显示    *****************/
    public function special_food()
    {
        vendor('Page.system_page');   //引入第三方系统库
        $p = isset($_POST['page'])?$_POST['page']:1;
        $post = Db::name('City_details')->where(array('id'=>$_SESSION['id']))->find();
        $count = Db::name('Special_food')->where(array('city_id'=>$post['city_id']))->count();// 查询满足要求的总记录数  
        $specialFood_Data = Db::name('Special_food')->page($p.',2')
        ->where(array('city_id'=>$post['city_id']))->select();
        $Page       = new \Page($count,2);// 实例化分页类 传入总记录数和每页显示的记录数
        $foodInfo = $this->object_to_array($specialFood_Data);
        foreach($foodInfo as &$food)
        {
            $food_pic =json_decode($food['dishes_picture'],true);
            foreach($food_pic as $key2 => &$food_value)
            {
                //common.php中封装的图片url解析方法
                $food['url'][$key2] = cmf_get_image_preview_url($food_value['url']); 
                $food['pic_name'][$key2] = $food_value['name'];
            }
        }
        $foodResult = array();
        $foodResult['food'] = $foodInfo;
        $this->jsonReturn($foodResult,JSON_UNESCAPED_UNICODE);
    } 
    
    /*****************   本地特产详情显示    *****************/
    public function special_goods()
    {
        vendor('Page.system_page');   //引入第三方系统库
        $p = isset($_POST['page'])?$_POST['page']:1;
        $post = Db::name('City_details')->where(array('id'=>$_SESSION['id']))->find();
        $count = Db::name('Special_goods')->where(array('city_id'=>$post['city_id']))->count();// 查询满足要求的总记录数  
        $specialGoods_Data = Db::name('Special_goods')->page($p.',2')
        ->where(array('city_id'=>$post['city_id']))->select();
        $Page       = new \Page($count,2);// 实例化分页类 传入总记录数和每页显示的记录数
        $goodsInfo = $this->object_to_array($specialGoods_Data);
        
        foreach($goodsInfo as &$goods)
        {
            $goods_pic =json_decode($goods['goods_pic'],true);
            foreach($goods_pic as $key3 => &$goods_value)
            {
                //common.php中封装的图片url解析方法
                $goods['url'][$key3] = cmf_get_image_preview_url($goods_value['url']); 
                $goods['pic_name'][$key3] = $goods_value['name']; 
            }
        }
        $goodsResult = array();
        $goodsResult['goods'] = $goodsInfo;
        $this->jsonReturn($goodsResult,JSON_UNESCAPED_UNICODE);
    } 
    
    /*****************   城市交通详情显示    *****************/
    public function city_traffic()
    {
        vendor('Page.system_page');   //引入第三方系统库
        $p = isset($_POST['page'])?$_POST['page']:1;
        $post = Db::name('City_details')->where(array('id'=>$_SESSION['id']))->find();
        $count = Db::name('City_traffic')->where(array('city_id'=>$post['city_id']))->count();// 查询满足要求的总记录数  
        $cityTraffic_Data = Db::name('City_traffic')->page($p.',2')
        ->where(array('city_id'=>$post['city_id']))->select();
        $Page       = new \Page($count,2);// 实例化分页类 传入总记录数和每页显示的记录数
        $cityTrafficInfo = $this->object_to_array($cityTraffic_Data);
        foreach($cityTrafficInfo as &$traffic)
        {
            if(!empty($traffic['traffic_pic']))
            {
                $traffic_pic =json_decode($traffic['traffic_pic'],true);
                foreach($traffic_pic as $key4 => &$traffic_value)
                {
                    //common.php中封装的图片url解析方法
                    $traffic['url'][$key4] = cmf_get_image_preview_url($traffic_value['url']); 
                    $traffic['pic_name'][$key4] = $traffic_value['name'];
                }
            }
        }
        $trafficResult = array();
        $trafficResult['traffic'] = $cityTrafficInfo;
        $this->jsonReturn($trafficResult,JSON_UNESCAPED_UNICODE);
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
    
    /***************************** 编辑城市信息 提交数据******************************** */
    // //旅游城市 提交数据
     public function do_edit_city()
     {
         $areaDB = Db::name('Area');
         if ($this->request->isPost()) {
            $post = $_POST;
            $cityData = $post['City'];
            $data['city_id'] =$cityData['city_id']; 
            $data['province_id'] =$cityData['province_id'];
            $data['fit_day'] =$cityData['fit_day'];
            $data['hot_spots'] =$cityData['hot_spots'];
            $data['food'] =$cityData['food'];
            $data['longitude'] =$cityData['longitude'];
            $data['latitude'] =$cityData['latitude'];
            $data['city_score'] =$cityData['city_score'];
            $data['city_Introduction'] =$cityData['city_Introduction'];
            if(!empty($cityData['photo_urls']))
            {
                $data['more'] = json_encode($cityData['photo_urls']);
            }
            
            //根据城市id 和省份id转成名称存入数据库
            $province_id = $cityData['province_id'];
            $AreaData =  $areaDB->field(array('area_name','area_url'))->where(array('area_id'=>$cityData['city_id']))->find();
            $provinceData =  $areaDB->field(array('area_name'))->where(array('area_id'=>$cityData['province_id']))->find();
            $data['city_name'] = $AreaData['area_name'];
            $data['province_name'] = $provinceData['area_name'];
            $data['update_time'] = time();   //更新时间
            //城市简称第一个字母大写
            $data['city_abbreviation'] = ucfirst($AreaData['area_url']);

            /*** 在修改city_detail表数据的时候（如果修改了城市），必须同时将新的province_id、city_id、city_name
             * 更新到与city_details相关联的几个表当中
             * 四张表Famous_spot、Special_food、Special_goods、City_traffic
             * ***/
            $city['city_id'] =$cityData['city_id']; 
            $city['province_id'] =$cityData['province_id'];
            $city['city_name'] = $AreaData['area_name'];
            $old_cityData = Db::name('City_details')->where(array('id'=>$_SESSION['id']))->find();
            Db::name('Famous_spot')->where(array('city_id'=>$old_cityData['city_id']))->update($city);
            Db::name('Special_food')->where(array('city_id'=>$old_cityData['city_id']))->update($city);
            Db::name('Special_goods')->where(array('city_id'=>$old_cityData['city_id']))->update($city);
            Db::name('City_traffic')->where(array('city_id'=>$old_cityData['city_id']))->update($city);

            //更新city_detail表中的数据
            $where['id'] = $cityData['id'];
            if(Db::name('City_details')->where($where)->update($data))
            {
                $this->success('修改成功!', url('City/index'));
            }else{
                $this->error('修改失败!', url('City/index'));
            }
         }else{
             $this->error('非法修改，请重新提交!', url('City/edit_city'));
         }
     }

    //知名景点模块 编辑提交
    public function do_edit_spot()
    {
        $areaDB = Db::name('Area');
        if($this->request->isPost())
        {
            $post = $_POST;
            $spotData = $post['spot_obj'];
            $data['city_id'] = $spotData['city_id'];
            $AreaData =  $areaDB->field(array('area_name'))->where(array('area_id'=>$spotData['city_id']))->find();
            $data['city_name'] = $AreaData['area_name'];
            $data['spot_name'] = $spotData['spot_name']; 
            $data['spot_Introduction'] = $spotData['spot_Introduction'];
            $data['is_province_hot'] = $spotData['is_province_hot'];
            $data['spot_address'] = $spotData['spot_address'];
            $data['score'] = $spotData['score'];
            $data['absture'] = $spotData['absture'];
            if(!empty($spotData['pic']))
            {
                $data['pic'] = json_encode($spotData['pic']);
            }
            
            $spot = Db::name('Famous_spot');
            $where['id'] = $spotData['id'];
            if($spot->where($where)->update($data))
            {
                $this->success('修改成功!', url('City/index'));
            }  else {
                $this->error('修改失败!', url('City/index'));
            }
        }  else {
            $this->error('非法修改，请重新提交!', url('City/edit_city'));
        }  
    }

    //特色美食模块 编辑提交
    public function do_edit_food()
    {
        $areaDB = Db::name('Area');
        if($this->request->isPost())
        {
            $post = $_POST;
            $foodData = $post['food_obj'];
            $data['city_id'] = $foodData['city_id'];
            $AreaData =  $areaDB->field(array('area_name'))->where(array('area_id'=>$foodData['city_id']))->find();
            $data['city_name'] = $AreaData['area_name'];
            $data['dishes_name'] =$foodData['dishes_name']; 
            $data['dishes_Introduction'] = $foodData['dishes_Introduction'];
            $data['is_recommended'] = $foodData['is_recommended'];
            $data['dishes_details'] = $foodData['dishes_details'];
            if(!empty($foodData['dishes_picture']))
            {
                $data['dishes_picture'] = json_encode($foodData['dishes_picture']);
            }
            
            $food = Db::name('Special_food');
            $where['id'] = $foodData['id'];
            if($food->where($where)->update($data))
            {
                $this->success('修改成功!', url('City/index'));
            }  else {
                $this->error('修改失败!', url('City/index'));
            }
        }  else {
            $this->error('非法修改，请重新提交!', url('City/edit_city'));
        }  
    }

    //本地特产模块 编辑提交
    public function do_edit_goods()
    {
        $areaDB = Db::name('Area');
        if($this->request->isPost())
        {
            $post = $_POST;
            $goodsData = $post['goods_obj'];
            $data['city_id'] = $goodsData['city_id'];
            $AreaData =  $areaDB->field(array('area_name'))->where(array('area_id'=>$goodsData['city_id']))->find();
            $data['city_name'] = $AreaData['area_name'];
            $data['goods_name'] =$goodsData['goods_name']; 
            $data['goods_details'] = $goodsData['goods_details'];
            $data['goods_is_recommended'] = $goodsData['goods_is_recommended'];
            $data['goods_Introduction'] = $goodsData['goods_Introduction'];
            if(!empty($goodsData['goods_pic']))
            {
                $data['goods_pic'] = json_encode($goodsData['goods_pic']);
            }
            
            $goods = Db::name('Special_goods');
            $where['id'] = $goodsData['id'];
            if($goods->where($where)->update($data))
            {
                $this->success('修改成功!', url('City/index'));
            }  else {
                $this->error('修改失败!', url('City/index'));
            }
        }  else {
            $this->error('非法修改，请重新提交!', url('City/edit_city'));
        }  
    }

    //城市交通模块 编辑提交
    public function do_edit_traffic()
    {
        $areaDB = Db::name('Area');
        if($this->request->isPost())
        {
            $post = $_POST;
            $trafficData = $post['traffic_obj'];
            $data['city_id'] = $trafficData['city_id'];
            $AreaData =  $areaDB->field(array('area_name'))->where(array('area_id'=>$trafficData['city_id']))->find();
            $data['city_name'] = $AreaData['area_name'];
            $data['traffic_name'] =$trafficData['traffic_name']; 
            $data['traffic_type'] =$trafficData['traffic_type']; 
            $data['traffic_phone'] =$trafficData['traffic_phone']; 
            $data['traffic_address'] = $trafficData['traffic_address'];
            if(!empty($trafficData['traffic_longitude']))
            {
                $data['traffic_longitude'] = $trafficData['traffic_longitude'];
            }
            if(!empty($trafficData['traffic_latitude']))
            {
                $data['traffic_latitude'] = $trafficData['traffic_latitude'];
            }
            
           
            if(!empty($trafficData['traffic_pic']))
            {
                $data['traffic_pic'] = json_encode($trafficData['traffic_pic']);
            }
            
            $traffic = Db::name('City_traffic');
            $where['id'] = $trafficData['id'];
            if($traffic->where($where)->update($data))
            {
                $this->success('修改成功!', url('City/index'));
            }  else {
                $this->error('修改失败!', url('City/index'));
            }
        }  else {
            $this->error('非法修改，请重新提交!', url('City/edit_city'));
        }  
    }
    
    //删除城市
    public function delete_city()
    {
        $param = $this->request->param();  

        $cityData = Db::name('City_details')->where(array('id'=>$param['id']))->find();
        Db::name('Famous_spot')->where(array('city_id'=>$cityData['city_id']))->delete();
        Db::name('Special_food')->where(array('city_id'=>$cityData['city_id']))->delete();
        Db::name('Special_goods')->where(array('city_id'=>$cityData['city_id']))->delete();
        Db::name('City_traffic')->where(array('city_id'=>$cityData['city_id']))->delete();
        //单个选中删除
        if(isset($param['id']))
        {
            if(Db::name('City_details')->where(array('id'=>$param['id']))->delete())
            {
                $this->success('删除成功！');
            }
        }
        //批量选中删除
        if(isset($param['ids']))
        {
            $ids = $param['ids'];
            if(Db::name('City_details')->where(['id' => ['in', $ids]])->delete())
            {
                echo 2;
                $this->success('删除成功！');
            }
        }   
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
    
    //发布，未发布（状态status 0-未发布，1-发布）
    public function publish()
    {
        $param = $this->request->param();

        if (isset($param['ids']) && isset($param["yes"])) {
            $ids = $this->request->param('ids/a');

            Db::name('City_details')->where(['id' => ['in', $ids]])->update(['status' => 1]);

            $this->success("发布成功！", '');
        }

        if (isset($param['ids']) && isset($param["no"])) {
            $ids = $this->request->param('ids/a');

            Db::name('City_details')->where(['id' => ['in', $ids]])->update(['status' => 0]);

            $this->success("取消发布成功！", '');
        }

    }
    
    //置顶 取消（is_top 0-未置顶，1-置顶）
    public function top()
    {
        $param = $this->request->param();

        if (isset($param['ids']) && isset($param["yes"])) {
            $ids = $this->request->param('ids/a');

            Db::name('City_details')->where(['id' => ['in', $ids]])->update(['is_top' => 1]);

            $this->success("置顶成功！", '');

        }

        if (isset($_POST['ids']) && isset($param["no"])) {
            $ids = $this->request->param('ids/a');

            Db::name('City_details')->where(['id' => ['in', $ids]])->update(['is_top' => 0]);

            $this->success("取消置顶成功！", '');
        }
    }
   
    //推荐  取消推荐 (0-取消推荐，1-推荐) 
    //推荐为省份下的 热门城市 (按照推荐的时间戳，后推荐的前面)
    public function recommend()
    {
        $param = $this->request->param();

        if (isset($param['ids']) && isset($param["yes"])) {
            $ids = $this->request->param('ids/a');

            Db::name('City_details')->where(['id' => ['in', $ids]])->update(['recommended' => 1]);
            Db::name('City_details')->where(['id' => ['in', $ids]])->update(['recom_time'=>time()]);
            $this->success("推荐成功！", '');

        }
        if (isset($param['ids']) && isset($param["no"])) {
            $ids = $this->request->param('ids/a');

            Db::name('City_details')->where(['id' => ['in', $ids]])->update(['recommended' => 0]);
            Db::name('City_details')->where(['id' => ['in', $ids]])->update(['recom_time'=>0]);
            $this->success("取消推荐成功！", '');

        }
    }

}
