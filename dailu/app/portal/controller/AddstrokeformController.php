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
namespace app\portal\controller;

use cmf\controller\HomeBaseController;
use think\Db;

class AddstrokeformController extends HomeBaseController
{
    //设计行程表单页面
    public function addStrokeform()
    {
        //清除上一次操作的session数据
        session_start();
        unset($_SESSION);
        session_destroy(); 
    
        return $this->fetch();
    }

    //出发城市、返回城市列表
    public function cityForm()
    {
        $city_name = $_GET;
        $pid = Db::name('Area')->field(array('area_pid'))->where(array('area_name'=>$city_name['city_name']))->find();
        $cityData = Db::name('Area')->field(array('area_pid','area_id','area_name','area_ip_desc'))->where(array('area_pid'=>$pid['area_pid']))->select();
        $cityList['list'] = json_decode($cityData,true);
    // print_r($cityList); exit;   
        echo json_encode($cityList,JSON_UNESCAPED_UNICODE);
    }

    // 出发城市，返回城市中需要检索的城市列表
    public function otherSearchCity()
    {
        //返回省份，直辖市
        $provinceData = Db::name('Area')->field(array('area_name','area_id','area_pid','is_municipalities'))->where(array('area_type'=>1))->select();
        $provinceResult = json_decode($provinceData,true);
        foreach($provinceResult as $key=>&$value)
        {
            if($value['is_municipalities'] == 1)
            {
                $municipalitiesInfo[$key] = $value;
            }
            if($value['is_municipalities'] == 0)
            {
                $provinceInfo[$key] = $value;
            }
        }
        $mun['municipalitie'] = $municipalitiesInfo;
        $pro['province'] = $provinceInfo;
        $result['Info'] = array_merge($mun,$pro);
        echo json_encode($result,JSON_UNESCAPED_UNICODE);
    }

    public function province_city()
    {
        //点击相关省份，渲染城市数据
        $get = isset($_GET) ? $_GET: '';
        if($get)
        {
            //显示省份下对应的城市
            $cityListData = $this->getCity($get['province_id']);
            $cityResult['city'] = json_decode($cityListData,true);
            echo json_encode($cityResult,JSON_UNESCAPED_UNICODE);
        }
    }
    //搜索框 
    public function search()
    {
        $queryString = $_GET['city_name'];
        if(strlen($queryString) > 0)
        {
            $where = array();
            // $where['_string'] = ' (area_name like "%$queryString%")  OR (  area_url like "%$queryString%") ';
            $where['area_name'] = array('like',"%$queryString%"); 
            // $where['_logic'] = 'or'; 
            // $where['area_url'] = array('like',"%$queryString%"); 
            $where['area_type'] = 2;
            $provinceData['searchList'] = Db::name('Area')->field(array('area_name','area_id'))->where($where)->select();
            echo json_encode($provinceData,JSON_UNESCAPED_UNICODE);
        }
    }

    //根据省份id列出 某个省份下的城市列表 
    public function getCity($province_id)
    {
        //获取省份信息
        $areaDB= Db::name('Area');
        $where['area_type'] = 2;    
        $where['area_pid'] = $province_id;
        $areaArr = $areaDB->where($where)->select();
        return $areaArr;
    }

    //开启袋鹿行程（表单页面） 
    public function startData()
    {
        session_start();
        $postForm = $_POST;
        $tagId = create_guid();
        $postForm['tagId'] = $tagId;
        $_SESSION['start'] = $postForm;
        $result['status'] = 'ok';
        echo json_encode($result,JSON_UNESCAPED_UNICODE);
    }

}