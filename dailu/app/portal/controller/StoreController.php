<?php
// +----------------------------------------------------------------------
// | ThinkCMF [ WE CAN DO IT MORE SIMPLE ]
// +----------------------------------------------------------------------
// | Copyright (c) 2013-2017 http://www.thinkcmf.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed ( http://www.apache.org/licenses/LICENSE-2.0 )
// +----------------------------------------------------------------------
// | Author: 老猫 <thinkcmf@126.com>
// +----------------------------------------------------------------------
namespace app\portal\controller;
use think\Db;
use think\Cookie;
use think\Request;
use Yansongda\Pay\Pay;
use Yansongda\Pay\Log;
use cmf\controller\HomeBaseController;
use Endroid\QrCode\QrCode;
header("Content-type: text/html; charset=utf-8");
// header('Content-type: image/jpeg');
class StoreController extends HomeBaseController{
    protected $ali_config = [
        'app_id' => '2017062607572577',
        'notify_url' => 'http://a.5199yl.com/portal/store/AlinotifyUrl.html',
        'return_url' => 'http://a.5199yl.com/portal/store/storePaySuccess.html',
        'ali_public_key' => 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAv3dPKTn8/0E/PXQhjj7wmrmX8Rnc0hzJFXXbLUX2be0iSujAEXqQKNxvnNnYGXqd0Kt905Bex6EosQ1EXCG7B0NgLUkuyjnay1SNkkg+fc6GwDVjuoTLbri96UH2Iz7ljWHnsGsjFToo//Ga+lXyu11aRH60jJjVQOKFZ2l7BnY19s+OxpO3Fnw912pb8DVSGdBqcYk+5nrLiq5w7aewnFxPMgybpJ1i5DEBHVV0g7zLss7mrYRv7DmeRq79nr2YP+SF6CCRDBIU4chZy8QSxcEHWWW8UjsHCJHcsH2xdhoVJSJZbW8TxTaW1O1Ieu+ASlkSCPIupmnqCNGCi21smwIDAQAB',
        // 加密方式： **RSA2**  
        'private_key' => 'MIIEowIBAAKCAQEA4yz3Zc4oLmLF3iUiFfYblRgNt1/DkF+39UeZNFj+yEvh4w+WQkGqL9W4HnbE/IwFoXc02pujIDmrs/3yR4eG272Rdb+EunzYeRcBlPVed6vjB4B2o5ZG6SvQareHBXtNJE5vWi4tToeUdGBf1ZZMvDGxlIHSe/DY2Tb3jnbJtlRLYRJlo5MbVOpW3imqDrmZYEuZ3K35ACFcIC7TtOWnqAFNomVDokYscLcV9/ugnD96LdomD7hZm+8CmgoGwf07VyaVcasMCI9xcsZmJDljORkv0RkLDdrRYYURVXCcynaYNuizEpb5U8J9uI12bN+GxeLPMa9T4GUqst2DLqGFiQIDAQABAoIBACsXKWofG5II3D1Rz9BYmUzDfj6NJJwq+8rDpPS/+LvnYNZf64Fv0Sc3o6/rmVvJ93t0EAtzQBLpvX7rqVwWAeeGYqPyCuwQqEL3sS4fCKcsbGjM3jQTWin6TJMhcrQAelZrpkV1wtRFdUxJx4PM+Yss5eEkatdljMxO19AnCgXSReOp0+KR/nE4FUU5sQZdScVg+2UvlPGyS4pz8M7cmz/8r6OC83ahdBOEKranigtqtvfMd2BuPOcanOlhRG+maQEHbORK26VejtdbzkgOC4oMgcV/zVLA3i6pCI/CWoqQ78NzZlxRNKNAWD8sOq6lyKO07T56faSNgASruc4QMa0CgYEA9pj5+/4P8gYyMiVfLG6u/q/AKcfgzghIbgi91sABnBFeiGcpJnN/LWwt/Ng//nTjMqi/Qb8P1GT6XglZg/FgHZAlpmzGutLFUxxmuobmiFj4IAnaB6ar2US9Lcix/TmSoPuWCNezz7c19y/maydOoHccm+y1Umr+ItNHvJFPaa8CgYEA69Zp7oeChc9WK1N4ixefWX81EpUfASL8eEfDyjfFQWMxssE5yZS9A6bkHhHzWHMrtijBCbxkSWIMLluN2wo3qIySDxbazeEqeNPmQej6ZJVfhqUXC2xT9O4ccSK1o2Xm0kyeRKr3kmH7GnKQ+Hjlfhf2eQ2VxhYNAQhi65WjqkcCgYAZWm0JPXvCNGTgxvrcBJ01TjiBky1HwY5A0eFCvQbtVtPTTlfqviErOF4aCtm5facGRFc1mUE1YxRiqq9rY1uwbmuQisp71sO24cqmDsyQ5CTOlnS2KKquceTJWkMCd/LdXkB0tEimaH3B5kjYZ3gsA1MLrPCPgrSSPAq6Fm6FvQKBgQDOrMuOvvCShV31gCP+eQgrrT/8dfSC0X9BhVq+p1tVbzGJfq4+yvtN7P6yn3aLh/rBmzt4ZcHZUXRtV8ycLXsTWYVSdevwSqgm1URPdHWimgjp/VmRqDB3UAha2VkmxdGfcIeuk8l8XiNpTQdgyMoNU8Cq203rFz30Lr5JyIxyVwKBgB4tbq9r8qy4s7NcQzMv3g2zETp9gMC42CQOmUWxlb4O3GbSpSiDxU8YHD9BlO9XwJ/phKH/Eh7d/BieaPC1OXtNBhDPOEgoWVLIWh5V2UHdNbPFfESU5IqcNb7hvkBH9veGidcjVyj1sMrTcQLTkOuebBHxbA8NrvTSC8AUR3yR',
        'log' => [ // optional
            'file' => './logs/alipay.log',
            'level' => 'debug'
        ],
        'mode' => '', // optional,设置此参数，将进入沙箱模式
    ];

	public function changeThreeWord($city_name_var){
		$xml = simplexml_load_file(dirname(__FILE__)."\city.xml");
        $city_name=$city_name_var;  //取参数
        $three_word=array();  //机场的三字码
        $i=0;
        foreach($xml->state as $state){
            foreach($state->attributes() as $city){
                if($city_name==$city){
                   foreach($state->children() as $a){
                       foreach($a->attributes() as $b){
                           $three_word[$i]=$b;
                           $i++;
                       }
                   }
                }
            }

        }
        return $three_word;
    }

    //des加密16进制大写
    public function encrypt($str,$key){
        $size = mcrypt_get_block_size ( MCRYPT_DES, MCRYPT_MODE_ECB );
        $pad = $size - (strlen ( $str ) % $size);

        $str = $str . str_repeat ( chr ( $pad ), $pad );
        return strtoupper( bin2hex( mcrypt_encrypt(MCRYPT_DES, $key, $str, MCRYPT_MODE_ECB) ) );
    } 

    public function accessToken(){     
        $tokenFile = dirname(__FILE__)."\access_token.txt";//缓存文件名
        // print_r($tokenFile);
        if(!empty(file_get_contents($tokenFile))){
            $data = json_decode(file_get_contents($tokenFile)); 
            if ($data->expire_time < time() or !$data->expire_time){   
            echo "1<br>"; 
                $appid = "wx7646596dc6e4f51a";
                $appsecret = "3eb9f29f4d9a0612bcee3fb5373cb33b";
                $url = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=$appid&secret=$appsecret";
                $res = $this->getData($url);
                $access_token = $res['access_token'];       
                if($access_token) {         
                    $data['expire_time'] = time() + 7200;         
                    $data['access_token'] = $access_token;     
                    $fp = fopen($tokenFile, "w");         
                    fwrite($fp, json_encode($data));         
                    fclose($fp);
                }
            }else{       
                echo "2<br>";
                $access_token = $data->access_token;     
            } 
        }else{
            echo "3<br>";
            $appid = "wx7646596dc6e4f51a";
            $appsecret = "3eb9f29f4d9a0612bcee3fb5373cb33b";
            $url = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=$appid&secret=$appsecret";
            $res = $this-> getData($url);
            $access_token = $res['access_token'];       
            if($access_token) {         
                $data['expire_time'] = time() + 7000;         
                $data['access_token'] = $access_token;     
                $fp = fopen($tokenFile, "w");         
                fwrite($fp, json_encode($data));         
                fclose($fp);
            }
        }  
        // print_r($access_token);exit;
        return $access_token;
    }

    //取得微信返回的JSON数据 　
    public function getData($url){
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, FALSE);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        $output = curl_exec($ch);
        curl_close($ch);
        return json_decode($output, true);
    }

    public function wxt(){
        $noncestr = '';
        $pattern = '1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLOMNOPQRSTUVWXYZ';    //字符池
        for($i=0; $i<20; $i++){
            $noncestr .= $pattern{mt_rand(0,62)};    //生成php随机数
        }
        // echo $noncestr;exit;
        $timestamp = time();
        $url = 'http://'.$_SERVER['HTTP_HOST'].$_SERVER['REQUEST_URI'];
        $data = json_decode(file_get_contents("https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=wxee361232f4e42a9a&secret=5b60c1dc5578563c9d080877949bf3d2"));
        // print_r($data);
        // $url = "https://api.weixin.qq.com/wxa/getwxacode?access_token=".$data->access_token;
        $data = json_decode(file_get_contents("https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=".$data->access_token."&type=jsapi"));
        $jsapi_ticket = $data->ticket;
        $signature = sha1("jsapi_ticket=".$jsapi_ticket."&noncestr=".$noncestr."&timestamp=".$timestamp."&url=".$url);
        $body['path'] = 'www.baidu.com';
        $body['width'] = 430;
        $body['auto_color'] = true;
        $body['is_hyaline'] = false;
        $body = json_encode($body);
        $res = $this->request($url,$https=true,$method='post',$body);
        $base64   = base64_encode($res);
        return ('data:image/png ;base64,' . $base64);
        // $jpg = $res;//得到post过来的二进制原始数据
        // $filename="\geo1.jpeg";//要生成的图片名字
        // $file = fopen(dirname(__FILE__).$filename,'w');//打开文件准备写入
        // fwrite($file,$jpg);//写入
        // fclose($file);//关闭
        // echo json_encode($da);
    }

    //模拟post
    public function request($url,$https,$method,$post_data){
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        if($https === true){
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        }
        if($method ==='post'){
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $post_data);
        }
        if($method==='get'){
            curl_setopt_array($ch, array(
            CURLOPT_URL =>$url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => "",
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => "GET",
            CURLOPT_HTTPHEADER => array(
                "cache-control: no-cache",
                "postman-token: 2dd165a8-96bf-22d4-cf96-1c8ec21045e9"
            ),
         ));
        }
        $content = curl_exec($ch);
        curl_close($ch);
        return $content;
    }

    public function geo(){
    	$xml = simplexml_load_file(dirname(__FILE__)."\geo_cn.xml");
        $aa  = json_decode(json_encode($xml))->HotelGeoList->HotelGeo;
        $info = json_decode(json_encode($aa),TRUE);
        $city = $city ? $city : input('post.city').'市';
        foreach ($info as $k => $v) {
            if($v['@attributes']['CityName'] == $city){
                $city = $v;
                $city_id = $v['@attributes']['CityCode'];//城市编码
            }
        }
    }

    //目的地补全，暂不可用
    public function dest($city){
        // $query_text = input('post.query_text') ? input('post.query_text') : '';
        $time = time();
        $data = json_encode(array(
            'Version'=>'1.33',
            'Local'=>'zh_CN',
            'Request'=>array(
                'QueryText'=>$city,//
                'OSType'=>'PC',//
                'SugOrientation'=>0,//
            )
        ));
        $signature = md5($time.md5($data.'2dfff541a55d28fc7ddecd0be2920a68').'7da0f3f5ced31dcb2a4996b9dfc6f36b');
        $url = "http://api.elong.com/rest?format=json&method=hotel.destination&user=21b5b1dbbc33412cbc2c538de927af4e&timestamp=$time&signature=$signature&data=$data";
        $url = str_replace(" ","%20",$url);
        $file_contents = json_decode(file_get_contents($url),true);
        // print_r($file_contents['Result']['regionResult']);
        foreach ($file_contents['Result']['regionResult']as $key => $value) {
            if($value['regionType'] == 0){
                return $value['regionId'];
            }else{
                return $value['parentId'];
            }
        }
    }
    //酒店筛选项信息
    public function hotelFilter($city='',$hot_filter=''){
        // $xml = simplexml_load_file(dirname(__FILE__)."\geo_cn.xml");
        // $aa  = json_decode(json_encode($xml))->HotelGeoList->HotelGeo;
        // $info = json_decode(json_encode($aa),TRUE);
        $city = input('post.city') ? input('post.city') : $city;
        $filter_type = input('post.filter_type') ? input('post.filter_type') : '';
        $type = input('post.type') ? input('post.type') : '';
        $hot_filter = $hot_filter ? false : true;
        if(empty($city)){
            return false;
        }
        // foreach ($info as $k => $v) {
        //     if($v['@attributes']['CityName'] == $city){
        //         $city = $v;
        //         $city_id = $v['@attributes']['CityCode'];//城市编码
        //         // break;
        //     }
        // }
       $city_id = $this->dest(str_replace('市','',$city));
        if(empty($city_id)){
            $city_id ='';
        }
        $time = time();
        $data = json_encode(array(
            'Version'=>'1.33',
            'Local'=>'zh_CN',
            'Request'=>array(
                'CityId'=>$city_id,//
                'HotFilter'=>$hot_filter,//
                'FilterType'=>$filter_type,//
            )
        ));
        $signature = md5($time.md5($data.'2dfff541a55d28fc7ddecd0be2920a68').'7da0f3f5ced31dcb2a4996b9dfc6f36b');
        $url = "http://api.elong.com/rest?format=json&method=hotel.filter&user=21b5b1dbbc33412cbc2c538de927af4e&timestamp=$time&signature=$signature&data=$data";
        $url = str_replace(" ","%20",$url);
        $file_contents = json_decode(file_get_contents($url),true);
        // echo json_encode($file_contents,true);exit;
        if($file_contents['Code'] == '0' && !empty($file_contents['Result']['hotelFilterInfos'])){
            $hotel_val = $file_contents['Result'];
            if($filter_type == '3'){
                // print_r($hotel_val);exit;
                $filter = $hotel_val['hotelFilterInfos'][0]['subHotelFilterInfos'];
                foreach ($filter as $key1 => $value1) {
                    $filters[$value1['parentTypeName']][] = $value1;
                }
                $hotel_val = $filters;
            }else{
                if($hot_filter == false){
                    foreach ($hotel_val['hotelFilterInfos'] as $key => $value) {
                        $v = '';
                        switch ($value['nameCn']) {
                            case '行政区':
                                $hotel_vals['行政区'] = $value['subHotelFilterInfos'];
                                break;
                            case '机场/车站':
                            $a = [];
                                if($hot_filter == false){
                                    foreach ($value['subHotelFilterInfos'] as $k => $v) {
                                        unset($v['subHotelFilterInfos'][0]);
                                         $a = array_merge($a,$v['subHotelFilterInfos']);
                                    }
                                    $hotel_vals['机场/车站'] = $a;
                                }else{
                                    $hotel_vals['机场/车站'] = $value['subHotelFilterInfos'];
                                }
                                // $hotel_vals['机场/车站'] = $value['subHotelFilterInfos'];
                                // echo json_encode($hotel_vals['机场/车站']);exit;
                                break;
                            case '商圈':
                                $hotel_vals['商圈'] = $value['subHotelFilterInfos'];
                                break;
                            case '医院':
                                $hotel_vals['医院'] = $value['subHotelFilterInfos'];
                                break;
                            case '大学':
                                $hotel_vals['大学'] = $value['subHotelFilterInfos'];
                                break;
                            case '市内景点':
                                $hotel_vals['市内景点'] = $value['subHotelFilterInfos'];
                                break;
                            case '市外景点':
                                $hotel_vals['市外景点'] = $value['subHotelFilterInfos'];
                                break;
                            case '演出场馆':
                                $hotel_vals['演出场馆'] = $value['subHotelFilterInfos'];
                                break;
                            default:
                                # code...
                                break;
                        }
                    }
                    $hotel_val = $hotel_vals;
                }
            }
            // echo json_encode($hotel_val,true);exit;
        }else{
            // echo json_encode(array('ResultCode'=>'NO'));
            $hotel_val = ['品牌'=>[['nameCn'=>'暂无']]];
        }
        if($hot_filter == false){
            return $hotel_val;
        }else{
            echo json_encode($hotel_val);
        }
    }

    //商圈等
    public function position($city=''){
        $type = input('post.type')  ? input('post.type') : '';
        $xml = simplexml_load_file(dirname(__FILE__)."\geo_cn.xml");
        $aa  = json_decode(json_encode($xml))->HotelGeoList->HotelGeo;
        $info = json_decode(json_encode($aa),TRUE);
         //区分PC和APP
        $app_or_pc = input('post.app_or_pc') ? input('post.app_or_pc') : '';

        $filter = $this->hotelFilter($city,true);
        // echo json_encode($filter);exit;
        foreach ($info as $k => $v) {
            if($v['@attributes']['CityName'] == $city){
                $city = $v;
                // $city_id = $v['@attributes']['CityCode'];//城市编码
            }
        }
        $business_name = isset($city['CommericalLocations']['Location']) ? $city['CommericalLocations']['Location'] :[];//商圈
        $dis_name = isset($city['Districts']['Location']) ? $city['Districts']['Location'] : [];//行政区
        $lan_name = isset($city['LandmarkLocations']['Location'])? $city['LandmarkLocations']['Location'] : [];//车站
        // print_r($filters);exit;
        
        // echo json_encode($filter);exit;
        // $name = [['Id'=>'','Name'=>'不限']];
        switch ($type) {
            case '商圈':
                if($filter['商圈']){
                    // echo json_encode($filter['商圈']);exit;
                    foreach ($filter['商圈'] as $key => $value) {
                        if($value['nameCn'] !== '不限'){
                            $name[$key]['Id'] = $value['idV4'];
                            $name[$key]['Name'] = $value['nameCn'];
                        }
                    }
                }else{
                    $name = [];
                }
                $name = array_values($name);
                break;
            case '行政区':
                if($filter['行政区']){
                    // echo json_encode($filter['行政区']);exit;
                    foreach ($filter['行政区'] as $key => $value) {
                        if($value['nameCn'] !== '不限'){
                            $name[$key]['Id'] = $value['idV4'];
                            $name[$key]['Name'] = $value['nameCn'];
                        }
                    }
                }else{
                    $name = [];
                }
                $name = array_values($name);
                break;
            case '医院':
                if($filter['医院']){
                    // echo json_encode($filter['yy']);exit;
                    foreach ($filter['医院'] as $key => $value) {
                        if($value['nameCn'] !== '不限'){
                            $name[$key]['Id'] = '';
                            $name[$key]['Name'] = $value['nameCn'];
                        }
                    }
                }else{
                    $name = [];
                }
                $name = array_values($name);
                break;
            case '大学':
                if($filter['大学']){
                    // echo json_encode($filter['dx']);exit;
                    foreach ($filter['大学'] as $key => $value) {
                        if($value['nameCn'] !== '不限'){
                            $name[$key]['Id'] = '';
                            $name[$key]['Name'] = $value['nameCn'];
                        }
                    }
                }else{
                    $name = [];
                }
                $name = array_values($name);
                break;
            case '市内景点':
                if($filter['市内景点']){
                    // echo json_encode($filter['市内景点']);exit;
                    foreach ($filter['市内景点'] as $key => $value) {
                        if($value['nameCn'] !== '不限'){
                            $name[$key]['Id'] = '';
                            $name[$key]['Name'] = $value['nameCn'];
                        }
                    }
                }else{
                    $name = [];
                }
                $name = array_values($name);
                break;
            case '市外景点':
                if($filter['市外景点']){
                    // echo json_encode($filter['市外景点']);exit;
                    foreach ($filter['市外景点'] as $key => $value) {
                        if($value['nameCn'] !== '不限'){
                            $name[$key]['Id'] = '';
                            $name[$key]['Name'] = $value['nameCn'];
                        }
                    }
                }else{
                    $name = [];
                }
                $name = array_values($name);
                break;
            case '演出场馆':
                if($filter['演出场馆']){
                    // echo json_encode($filter['演出场馆']);exit;
                    foreach ($filter['演出场馆'] as $key => $value) {
                        if($value['nameCn'] !== '不限'){
                            $name[$key]['Id'] = '';
                            $name[$key]['Name'] = $value['nameCn'];
                        }
                    }
                }else{
                    $name = [];
                }
                $name = array_values($name);
                break;
            default:
                if($filter['机场/车站']){
                    // echo json_encode($filter['机场/车站']);exit;
                    foreach ($filter['机场/车站'] as $key => $value) {
                        if($value['nameCn'] !== '不限'){
                            $name[$key]['Id'] = '';
                            $name[$key]['Name'] = $value['nameCn'];
                        }
                    }
                }else{
                    $name = [];
                }
                $name = array_values($name);
                break;
        }
        if(isset($app_or_pc) && $app_or_pc == 'app'){
            $return = array('status'=>true,'msg'=>'请求成功','data'=>$name);
            echo json_encode($return,JSON_UNESCAPED_UNICODE);
        }else{
            echo json_encode($name,JSON_UNESCAPED_UNICODE);

        }
    }

    public function theme($city=''){
        $xml = simplexml_load_file(dirname(__FILE__)."\\theme.xml");
        $data = json_decode(json_encode($xml),true);
        $data = $data['HotelTheme'];
        $city = input('post.city') ? input('post.city') : $city;
        $post = input('post.post') ? input('post.post') : '';
        if($city){
            $theme = [];
            foreach ($data as $k => $v) {
                if($v['@attributes']['CityName'] == $city){
                    $theme = $v['Themes']['Location'];
                }
            }
            if($theme){
                foreach ($theme as $key => $value) {
                    $themes[] = $value['@attributes'];
                }
            }else{
                $themes = '';
            }
            if(!empty($post)){
                echo json_encode($themes);
            }else{
                return $themes;
            }
        }
        // echo json_encode($data);
    }
    //酒店详情修改
    public function facilities($data){
        if(strpos($data,',')){
            $data = explode(',', $data);
        }else{
            $data = array($data);
        }
        foreach ($data as $k => $v) {
            $arr[$k]['id'] = $v;
            switch ($v) {
                case '1':
                    $arr[$k]['type'] = 'WIFI上网';
                    break;
                case '2':
                    $arr[$k]['type'] = 'WIFI上网';
                    break;
                case '3':
                    $arr[$k]['type'] = '宽带上网';
                    break;
                case '4':
                    $arr[$k]['type'] = '宽带上网';
                    break;
                case '5':
                    $arr[$k]['type'] = '停车场';
                    break;
                case '6':
                    $arr[$k]['type'] = '停车场';
                    break;
                case '7':
                    $arr[$k]['type'] = '接机服务';
                    break;
                case '8':
                    $arr[$k]['type'] = '接机服务';
                    break;
                case '9':
                    $arr[$k]['type'] = '游泳池';
                    break;
                case '10':
                    $arr[$k]['type'] = '游泳池';
                    break;
                case '11':
                    $arr[$k]['type'] = '健身房';
                    break;
                case '12':
                    $arr[$k]['type'] = '商务中心';
                    break;
                case '13':
                    $arr[$k]['type'] = '会议室';
                    break;
                case '14':
                    $arr[$k]['type'] = '酒店餐厅';
                    break;
                case '15':
                    $arr[$k]['type'] = '叫醒服务';
                    break;
                case '16':
                    $arr[$k]['type'] = '行李寄存';
                    break;
            }
        }
        return $arr;
    }

    //保存常用联系人
    public function contactSave(){
        $post = input('post.');
        $result = Db::name('contacts')->insert($post);
        if($result == 1){
            $return = array('status'=>'true');
        }else{
            $return = array('status'=>'false');
        }
        echo json_encode($return,true);
    }

    //常用联系人查询
    public function contacts(){
        $user_id = cookie('uid');
        $contacts = Db::name('contacts')->where(['user_id'=>$user_id])->select()->toArray();
        return $contacts;
    }

    //获取二维码
    public function getarcode(){
        $url = $_GET['url'];
        import('phpqrcode',EXTEND_PATH);
        $errorCorrectionLevel = 'L'; //容错级别
        $matrixPointSize = 6; //生成图片大小  
        // 生成二维码图片     
        $mytest = new \QRcode();
        $a = $mytest::png($url,false, $errorCorrectionLevel, $matrixPointSize, 2);
        echo $a;
    }

    //商城首页
    public function index(){
    	$ip = get_client_ip();
        $city_info = get_ip_lookup($ip);//获取当前城市
        // $city_info = get_ip_lookup('115.236.182.122');//获取当前城市
        $local_city = $city_info;
        $arrival_date = date('Y-m-d',strtotime('+5 day'));
    	$departure_date = date('Y-m-d',strtotime('+1 day',strtotime($arrival_date)));
        $hotel_list_info = $this->hotel($local_city,$zone_id='',$theme_id='',$arrival_date,$departure_date,$sort='Default',$page=1,$page_size=4);//获取酒店信息
        // print_r($hotel_list_info);exit;
        $array = array(array('start'=>'杭州','end'=>'北京'),array('start'=>'杭州','end'=>'三亚'),array('start'=>'杭州','end'=>'成都'),array('start'=>'杭州','end'=>'青岛'));
        // print_r($array);exit;
        $date = date('Y-m-d',strtotime("+1 day"));
        foreach ($array as $key => $value) {
        	$flight_list_info[] = $this->lowFlight($value['start'],$value['end'],$date);
        }
        $bus_date = date('YmdHs',strtotime('+1 day'));
        $bus_list_info = $this->bus('杭州','杭州萧山国际机场','杭州萧山国际机场','',$bus_date);//获取接送机信息
        // print_r($bus_list_info);
        $this -> assign('city_name',$local_city);
        $this -> assign('hotel_list_info',$hotel_list_info['hotel']);
        $this -> assign('flight_list_info',$flight_list_info);
        $this -> assign('bus_list_info',$bus_list_info);
        return $this->fetch();
    }

    //酒店匹配
    public function match($city=null,$zone_id='',$theme_id='',$arrival_date='',$departure_date='',$sort='Default',$page=1,$page_size=''){
    	$city = input('post.city') ? input('post.city') : $city;
    	$type = input('post.type') ? input('post.type') : null;
        $hotel_list = $this -> hotel($city,$zone_id,$theme_id,$arrival_date,$departure_date,$sort,$page,$page_size);
        if($hotel_list['hotel'] == false){
            return $return = false;
        }else{
            foreach ($hotel_list['hotel'] as $key => $value) {
            	$hotel_list_info[$key]['detail'] = $value['Detail'];
            	//根据价格冒泡排序
            	$count = count($value['Rooms']);
            	for($k=1;$k<$count;$k++){
    		        for($i=0;$i<$count-$k;$i++){
    		            if($value['Rooms'][$i]['RatePlans'][0]['TotalRate']>$value['Rooms'][$i+1]['RatePlans'][0]['TotalRate']){//相邻比较
    		                $tem=$value['Rooms'][$i];
    		                $value['Rooms'][$i]['RatePlans'][0]['TotalRate']=$value['Rooms'][$i+1]['RatePlans'][0]['TotalRate'];
    		                $value['Rooms'][$i+1]=$tem;
    		            }

    		        }
        		}
            	$hotel_list_info[$key]['price'] = $value['Rooms'][0]['RatePlans'][0]['TotalRate'];
            } 
            if($type){
            	echo json_encode($hotel_list_info);
            }else{
            	return $hotel_list_info;
            }
        }
    }

    //酒店搜索
    public function hotel($city='',$zone_id='',$theme_id='',$arrival_date='',$departure_date='',$sort='Default',$page=1,$page_size=6,$query_text='',$position='',$price=''){
        $price = input('post.rate') ? input('post.rate') : $price;
        $zone_id = input('post.zone_id') ? input('post.zone_id') : $zone_id;
        if(input('?post.post')){
            setcookie('hotel_city',$city);
            setcookie('hotel_arrival_date',$arrival_date);
            setcookie('hotel_departure_date',$departure_date);
            setcookie('query_text',$query_text);
            setcookie('price',$price);
            setcookie('zone_id',$zone_id);
        }
    	$xml = simplexml_load_file(dirname(__FILE__)."\geo_cn.xml");
        $aa  = json_decode(json_encode($xml))->HotelGeoList->HotelGeo;
        $info = json_decode(json_encode($aa),TRUE);
        $city = $city ? $city : input('post.city').'市';
        $city_name = str_replace('市','',$city);
        if(empty($city)){
            return false;
        }
        foreach ($info as $k => $v) {
            if($v['@attributes']['CityName'] == $city){
                $city = $v;
                $city_id = $v['@attributes']['CityCode'];//城市编码
            }
        }
        if(empty($city_id)){
            $city_id ='';
        }
        $city_id = $this->dest($city_name);
        $query_text = input('post.query_text') ? input('post.query_text') : ($query_text ? $query_text : '');
        $query_type = input('post.query_type') ? input('post.query_type') : '';
        $facilities = input('post.facilities') ? input('post.facilities') : '';
        $theme_id = input('post.theme_id') ? input('post.theme_id') : $theme_id;
        $star_rate = input('post.star_rate') ? input('post.star_rate') : '';
        $brand_id = input('post.brand_id') ? input('post.brand_id') : '';
        $group_id = input('post.group_id') ? input('post.group_id') : null;
        
        if(!empty($price)){
            $price = explode(',', $price);
            if($price[0]>=$price[1]){
                $low_rate = $price[1];
                $high_rate = $price[0];
            }else{
                $low_rate = $price[0];
                $high_rate = $price[1];
            }
        }else{
            $low_rate = $high_rate = null;
        }
        // echo $high_rate;echo $low_rate;exit;
    	$dis_id = input('post.dis_id') ? input('post.dis_id') : '';
        $sort = input('post.sort') ? input('post.sort') : $sort;
    	$page = input('post.page') ? input('post.page') : $page;
    	$page_size = input('post.page_size') ? input('post.page_size') : $page_size;
        $result_type = input('post.map_post') ? '1,2,3,4' : '1,2,3,4,8';

        $position = isset($_POST['position']) ? ($_POST['position']['Longitude'] ? $_POST['position'] : '') : $position; 
        $pos = input('post.');
        if($dis_id){
            $position = '';
        }
        // $position = ['Longitude'=>'121.995264','Latitude'=>'30.004014','Radius'=>'100000'];
    	$time = time();
    	$data = json_encode(array(
            'Version'=>'1.33',
            'Local'=>'zh_CN',
            'Request'=>array(
                'ArrivalDate'=> $arrival_date,//入住日期
                'DepartureDate'=> $departure_date,//离店日期
                'CityId'=>$city_id,//城市编码
                'QueryText'=>$query_text,//查询关键词
                'QueryType'=>$query_type,//查询类型
                'PaymentType'=>'All',//支付方式
                'ProductProperties'=>'All',//产品类型All =全部,LastMinuteSale =今日特价,LimitedTimeSale =限时抢购,WithoutGuarantee =免担保AdvanceBooking=早订优惠LongStayBooking=连住优惠
                'Facilities'=>$facilities,//设施 
                'ThemeIds'=>$theme_id,//主题
                'StarRate'=>$star_rate,//推荐星级
                'BrandId'=>$brand_id,//品牌编码
                'GroupId'=>$group_id,//酒店集团编码                
                'LowRate'=>$low_rate,//最小价格
                'HighRate'=>$high_rate,//最大价格   
                'DistrictId'=>$dis_id,//地区编码 
                'BusinessZoneId'=>$zone_id,//商圈编码 
                'Position'=>$position,//位置查询   
                // 'InvoiceMode'=>'Hotel',//预付发票模式  
                'Sort'=>$sort,//排序类型 Default艺龙默认排序,StarRankDesc推荐星级降序,RateAsc价格升序,RateDesc价格降序,DistanceAsc距离升序
                'PageIndex'=>$page,//页码
                'PageSize'=>$page_size,//每页记录数  
                'CustomerType'=>'None',//宾客类型   
                'CheckInPersonAmount'=>'0',//房间入住人数  
                'ResultType'=>$result_type//返回信息类型
            )
        ));
        $signature = md5($time.md5($data.'2dfff541a55d28fc7ddecd0be2920a68').'7da0f3f5ced31dcb2a4996b9dfc6f36b');
        $str = mb_convert_encoding("http://api.elong.com/rest?format=json&method=hotel.list&user=21b5b1dbbc33412cbc2c538de927af4e&timestamp=$time&signature=$signature&data=$data","UTF-8");
        $file_contents = json_decode(file_get_contents($str),true);
        // echo json_encode($file_contents);exit;
        $post = input('post.post');
        if(!empty($file_contents['Result']) && $file_contents['Code'] =='0'){
            $code = $file_contents['Code'];
            $result = json_decode(json_encode($file_contents['Result']),TRUE);
            $hotel = $result['Hotels'];
            $count = $result['Count'];//酒店数目
            foreach ($hotel as $key => &$value) {
            	if(!array_key_exists('ThumbNailUrl',$value['Detail'])){
        		    $value['Detail']['ThumbNailUrl'] = 'http://mpic.tiankong.com/e4f/1ee/e4f1ee450b0f3803d00f5ecb8b08be7e/640.jpg';
        		}else{
                    $value['Detail']['ThumbNailUrl'] = str_replace('120_120','350_350', $value['Detail']['ThumbNailUrl']);
                }
                if(!array_key_exists('BusinessZoneName',$value['Detail'])){
                    $value['Detail']['BusinessZoneName'] = '';
                }
                if(!array_key_exists('Facilities',$value)){
                    $value['Facilities'] = '';
                }else{
                    $arr = $this->facilities($value['Facilities']);
                    $value['Facilities'] = $arr;
                }
                $value['Detail']['Review']['Score'] = substr(number_format($value['Detail']['Review']['Score']*5/100,2),0,-1);
                if($value['Detail']['Review']['Score']>4.5){
                    $value['Detail']['Review']['comm'] = '棒极了';
                }elseif($value['Detail']['Review']['Score']<4){
                    $value['Detail']['Review']['comm'] = '还不错';
                }else{
                    $value['Detail']['Review']['comm'] = '挺好哒';
                }
                $comment = ['价格优惠','性价比高','交通便利','地理位置好','出行方便','前台热情','空气清新','服务态度好','设计有特色','服务周到','购物方便','设施齐全'];
                $rand_k = rand(1,9);
                $value['Detail']['comment'] = $comment[$rand_k];
                $value['Detail']['book_time'] = $rand_k;
                // if($other_sort == 'star_asc'){
                    // $ky[$key] = $value['Detail']['Category']; 
                // }
                if(input('post.map_post') == true){
                    switch ($value['Detail']['Category']) {
                        case '0':
                            $value['Detail']['Category'] = '客栈';
                            break;
                        case '1':
                            $value['Detail']['Category'] = '客栈';
                            break;
                        case '2':
                            $value['Detail']['Category'] = '客栈';
                            break;
                        case '3':
                            $value['Detail']['Category'] = '舒适';
                            break;
                        case '4':
                            $value['Detail']['Category'] = '高档';
                            break;
                        case '5':
                            $value['Detail']['Category'] = '豪华';
                            break;
                        case 'A':
                            $value['Detail']['Category'] = '公寓';
                            break;
                    }
                }
                $map_hotel[$key]['LowRate'] = ceil($value['LowRate']);
                $map_hotel[$key]['HotelId'] = $value['HotelId'];
                $map_hotel[$key]['Detail'] = $value['Detail'];
                $map_hotel[$key]['Facilities'] = $value['Facilities'];
            }
            $return = array('count'=>$count,'hotel'=>$map_hotel);
            // print_r($return);exit;
            if($post){
                // $arr = $_POST['arr'];
                // $arr = [];
                // $arr = array(['lng'=>'120.086317','lat'=>'30.292573'],['lng'=>'120.222065','lat'=>'30.291012'],['lng'=>'120.221722','lat'=>'30.196399'],['lng'=>'120.086281','lat'=>'30.191206']);
                if($position){
                    foreach ($return['hotel'] as $key => $value) {
                        // print_r($value);
                        // $data = $this->isPointInPolygon($arr,['lng'=>$value['Detail']['Longitude'],'lat'=>$value['Detail']['Latitude']]);
                        // if($data == true){
                        //     $returns['hotel'][] = $value;
                        // }
                        // if(str_replace('市','',$value['Detail']['CityName']) == $city_name){
                        if(strstr($value['Detail']['CityName'],$city_name)){
                            $returns['hotel'][] = $value;
                        }
                    }
                }else{
                    $returns['hotel'] = $return['hotel'];
                }
                $city_id = input('post.city_id');
                if($city_id){
                    $where['city_id'] = $city_id;
                    $where['traffic_type'] = array('in',['train','plane']);
                    $traffic = Db::name('city_traffic')->field('city_id,city_name,traffic_name,traffic_longitude,traffic_latitude,traffic_type')->where($where)->select()->toArray();
                    $returns['traffic'] = $traffic;
                }
                $returns['count'] = $count;
                //区分PC和APP
                $app_or_pc = input('post.app_or_pc') ? input('post.app_or_pc') : '';
                if(isset($app_or_pc) && $app_or_pc == 'app'){
                    $return = array('status'=>true,'msg'=>'请求成功','data'=>$returns);
                    echo json_encode($return,JSON_UNESCAPED_UNICODE);
                }else{
                    echo json_encode($returns);
                }
            }else{
                if(isset($app_or_pc) && $app_or_pc == 'app'){
                    $result = array('status'=>true,'msg'=>'请求成功','data'=>$return);
                    echo json_encode($result,JSON_UNESCAPED_UNICODE);
                }else{
                    return $return;
                }  
            }
        }else{
            $return = array('count'=>null,'hotel'=>false);
            if($post){
                //区分PC和APP
                $app_or_pc = input('post.app_or_pc') ? input('post.app_or_pc') : '';
                if(isset($app_or_pc) && $app_or_pc == 'app'){
                	$return = array('hotel'=>[]);
                    $result = array('status'=>true,'msg'=>'请求成功','data'=>$return);
                    echo json_encode($result,JSON_UNESCAPED_UNICODE);
                }else{
                    echo json_encode($return);
                }
        	}else{
        		$this->error('非法提交','store/hotelIndex');
        	}
        }
        
    }

    //计算坐标点是否在区域内
    public function isPointInPolygon( $coordArray, $point){
        if(!is_array($coordArray)||!is_array($point)) return false;
        $maxY = $maxX = 0;
        $minY = $minX = 9999;
        foreach ($coordArray as $item){
            if($item['lng']>$maxX) $maxX = $item['lng'];
            if($item['lng'] < $minX) $minX = $item['lng'];
            if($item['lat']>$maxY) $maxY = $item['lat'];
            if($item['lat'] < $minY) $minY = $item['lat'];
            $vertx[] = $item['lng'];
            $verty[] = $item['lat'];
        }
        if ($point['lng'] < $minX || $point['lng'] > $maxX || $point['lat'] < $minY || $point['lat'] > $maxY) {
            return false;
        }
     
        $c = false;
        $nvert=count($coordArray);
        $testx=$point['lng'];
        $testy=$point['lat'];
        for ($i = 0, $j = $nvert-1; $i < $nvert; $j = $i++) {
            if ( ( ($verty[$i]>$testy) != ($verty[$j]>$testy) )
                && ($testx < ($vertx[$j]-$vertx[$i]) * ($testy-$verty[$i]) / ($verty[$j]-$verty[$i]) + $vertx[$i]) )
                $c = !$c;
        }
        return $c;
    }

    //商城酒店首页
    public function hotelIndex(){
        $ip = get_client_ip();
        $city_info = get_ip_lookup($ip);//获取当前城市
        $city_info = get_ip_lookup('115.236.182.122');//获取当前城市
        // print_r($city_info);exit;
        $local_city = $city_info;
        // $local_city = '杭州市';
        $arrival_date = date('Y-m-d',strtotime('+1 day'));
        $departure_date = date('Y-m-d',strtotime('+1 day',strtotime($arrival_date)));
        $hotel_list_info = $this->hotel($local_city,$zone_id='',$theme_id='',$arrival_date,$departure_date,$sort='Default',$page=1,$page_size=6);//获取酒店特选推荐
        // print_r($hotel_list_info);
        $hotel_list = $this->hotel($local_city,$zone_id='',$theme_id='',$arrival_date,$departure_date,$sort='Default',$page=3,$page_size=4);//获取酒店目的地推荐
        // print_r($hotel_list);
        // $citys = include(dirname(__FILE__).'\district.php');
        // foreach ($citys as $key => $value) {
        //  if($key == '杭州'){
        //      $city = $value;
        //  }
        // }
        $city = $this->citySelect(str_replace('市','',$local_city));
    	// print_r($hotel_list_info);
        $theme = $this->theme($local_city);
        $this -> assign('theme',array_slice($theme,0,6));
    	$this ->assign('city',$city);
    	$this->assign('hotel_list_info',$hotel_list_info['hotel']);
    	$this->assign('hotel_list',$hotel_list['hotel']);
    	return $this->fetch();
    }

    //酒店目录选择
    public function citySelect($city_name){
        $citys = include(dirname(__FILE__).'\district.php');
        foreach ($citys as $key => $value) {
            if($key == $city_name){
                $city = $value;
            }
        }
        return $city;
        
    }

    //酒店列表
    public function hotelList(){
    	if(!empty($_COOKIE['hotel_city'])){
            $city = $_COOKIE['hotel_city'];
            $bus_name = $this->hotelFilter($city,true);
            // print_r($bus_name);exit;
            $theme = $this->theme($city);
            // print_r($theme);exit;
            // $zone_id = input('post.zone_id') ? input('post.zone_id') : '';
            // $page = input('post.page') ? input('post.page') : 1;
            $arrival_date = $_COOKIE['hotel_arrival_date'];
            $departure_date = $_COOKIE['hotel_departure_date'];
            if(isset($_COOKIE['query_text'])){
                $query_text = $_COOKIE['query_text'];
            }else{
                $query_text = '';
            }
            if(isset($_COOKIE['zone_id'])){
                $zone_id = $_COOKIE['zone_id'];
            }else{
                $zone_id = '';
            }
            if(isset($_COOKIE['price'])){
                $price = $_COOKIE['price'];
            }else{
                $price = '';
            }
            $hotel_list_info = $this->hotel($city,$zone_id,$theme_id='',$arrival_date,$departure_date,$sort='Default',$page=1,20,$query_text,'',$price);
            $city = str_replace('市','', $city);
            $this->assign('theme',$theme);
            $this->assign('city',$city);
            $this->assign('business_name',$bus_name);
            $this->assign('hotel_list_info',$hotel_list_info);
            return $this->fetch();
        }else{
            $this->redirect('store/hotelindex');//重定向
        }
    }

    //获取酒店详情
    public function getHotelDetail($arrival_date,$departure_date,$hotel_id){
    	//区分PC和APP
        $app_or_pc = input('post.app_or_pc') ? input('post.app_or_pc') : '';
        $time = time();
        $data = json_encode(array(
            'Version'=>'1.33',
            'Local'=>'zh_CN',
            'Request'=>array(
                'ArrivalDate'=>$arrival_date,
                'DepartureDate'=>$departure_date,
                'HotelIds'=>$hotel_id,
                'Options'=>'1,2,3,4,8',
                'PaymentType'=>'Prepay'
            )
        ));
        $signature = md5($time.md5($data.'2dfff541a55d28fc7ddecd0be2920a68').'7da0f3f5ced31dcb2a4996b9dfc6f36b');
        $data = urlencode($data);
        $file_contents = file_get_contents("http://api.elong.com/rest?format=json&method=hotel.detail&user=21b5b1dbbc33412cbc2c538de927af4e&timestamp=$time&signature=$signature&data=$data");
        $data = json_decode($file_contents);
        // echo json_encode($data->Result->Hotels);exit;
        // print_r($data);exit;
        if(!empty($data->Result) && $data->Code =='0'){
            $obj = $data->Result->Hotels;
            $hotel_detail = json_decode(json_encode($obj[0]),TRUE);
            $hotel_detail['Detail']['Review']['Score'] = substr(number_format($hotel_detail['Detail']['Review']['Score']*5/100,2),0,-1);
            $pic_arr = array();
            $high_pic_arr = array();
            foreach ($hotel_detail['Rooms'] as $key => &$value) {
                $big = [];
                $small = [];
                foreach ($hotel_detail['Images'] as $key1 => $value1) {
                    if(array_key_exists('RoomId',$value1)){
                        if(strpos($value1['RoomId'], $value['RoomId']) !== false || $value['RoomId'] == $value1['RoomId']){
                            // echo $key;exit;
                            foreach ($value1['Locations'] as $key2 => $value2) {
                                if($value2['SizeType'] == 1){
                                    $big[] = $value2['Url'];
                                }elseif($value2['SizeType'] == 3){
                                    $small[] = $value2['Url'];
                                }
                            }
                            // $value['trueImg'][] = $value1['Locations'];
                        }
                    }
                }
                $value['trueImg']['big'] = $big;
                $value['trueImg']['small'] = $small;
                switch ($value['Broadnet']) {
                    case '0':
                        $value['Broadnet'] ='无网络服务';
                        break;
                    case '1':
                        $value['Broadnet'] ='免费宽带';
                        break;
                    case '2':
                        $value['Broadnet'] ='收费宽带';
                        break;
                    case '3':
                        $value['Broadnet'] ='免费WIFI';
                        break;
                    default:
                        $value['Broadnet'] ='收费WIFI';
                        break;
                }
                $price = array_column($value['RatePlans'],'AverageRate');
                sort($price);//根据价格排序
                // print_r($price);
                $value['lowPrice'] = ceil($price[0]);
                // if($value['Broadnet'] == 0){
                //  $value['Broadnet'] = '无';
                // }
                if(!array_key_exists('ImageUrl',$value)){
                    if($key>0){
                        $value['ImageUrl'] = $hotel_detail['Rooms'][$key-1]['ImageUrl'];
                    }else{
                        $value['ImageUrl'] = '';
                    }
                }
                foreach ($value['RatePlans'] as $k => &$v) {
                    if(!empty($hotel_detail['PrepayRules'])){
                        foreach ($hotel_detail['PrepayRules'] as $k1 => $v1) {
                            if(array_key_exists('PrepayRuleIds',$v)){
                                if($v['PrepayRuleIds'] == $v1['PrepayRuleId']){
                                    if($v1['ChangeRule'] == 'PrepayNoChange'){
                                        $v1['ChangeRule'] = '不可取消';
                                    }elseif($v1['ChangeRule'] == 'PrepayNeedOneTime'){
                                        $now_date = date('Y-m-d H:i:s');
                                        $pre_time = substr($v1['DateNum'],0,10).' '.$v1['Time'].':00';
                                        if($now_date>$pre_time){
                                            $v1['ChangeRule'] = '不可取消';
                                        }else{
                                            $v1['ChangeRule'] = '免费取消';
                                        }
                                    }elseif($v1['ChangeRule'] == 'PrepayNeedSomeDay'){
                                        $now_date = date('Y-m-d H:i:s');
                                        $hour = $v1['Hour'];
                                        $hour2 = $v1['Hour2'];
                                        $arr_nowdate = date('Y-m-d H:i:s',strtotime("$arrival_date 24:00:00 - $hour hour"));//Hour小时前
                                        $arr_nowdate2 = date('Y-m-d H:i:s',strtotime("$arrival_date 24:00:00 - $hour2 hour"));//Hour2小时前
                                        // $v1['arr_nowdate']=$arr_nowdate;
                                        // $v1['arr_nowdate2']=$arr_nowdate2;
                                        // $v1['now_date']=$now_date;
                                        if($arr_nowdate<$now_date){
                                            $v1['ChangeRule'] = '不可取消';
                                        }elseif($arr_nowdate<$now_date && $arr_nowdate2>$now_date){
                                            if($v1['DeductFeesAfter'] == 0){
                                                $v1['ChangeRule'] = '免费取消';
                                            }else{
                                                if($v1['DeductNumAfter'] == '100'){
                                                    $v1['ChangeRule'] = '不可取消';
                                                }else{
                                                    $v1['ChangeRule'] = '付费取消';
                                                }
                                            }
                                        }elseif($arr_nowdate2<$now_date){

                                        }else{
                                            if($v1['DeductFeesBefore'] == 0){
                                                $v1['ChangeRule'] = '免费取消';
                                            }else{
                                                if($v1['DeductNumBefore'] == '100'){
                                                    $v1['ChangeRule'] = '不可取消';
                                                }else{
                                                    $v1['ChangeRule'] = '付费取消';
                                                }
                                            }
                                        }
                                    }
                                    $v['PrepayRule'] = $v1;
                                }
                            }else{
                                $v['PrepayRule'] = '';
                            }
                        }
                    }else{
                        // $v1['ChangeRule'] = '不可取消';
                        $v['PrepayRule'] = '';
                    }
                    if(!empty($hotel_detail['GuaranteeRules'])){
                        foreach ($hotel_detail['GuaranteeRules'] as $k2 => $v2) {
                            //房间信息存在GuaranteeRuleIds字段且不为空，则为担保
                            if(array_key_exists('GuaranteeRuleIds',$v)){
                                if(!empty($v['GuaranteeRuleIds'])){
                                    if($v['GuaranteeRuleIds'] == $v2['GuranteeRuleId']){
                                        if($v2['ChangeRule'] == 'NoChange'){
                                            $v2['ChangeRule'] = '不可取消';
                                        }elseif($v2['ChangeRule'] == 'NeedSomeDay'){
                                            $v2['ChangeRule'] = '限时取消';
                                        }else{
                                            $v2['ChangeRule'] = '限时取消';
                                        }
                                        $v['GuranteeRule'] = $v2;
                                    }
                                        $v['payType'] = '担保';
                                }else{
                                    $v['GuranteeRule'] = '';
                                    // $v['payType'] = '&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp';//字段为空，既不需要担保也不需要预付
                                    $v['payType'] = '到店付';//既不需要担保也不需要预付
                                    $v['payTypeInfo'] = '入住日到达酒店后向酒店支付房费，无需提前在线支付';
                                }
                            }else{
                                $v['payType'] = '预付';
                                $v['payTypeInfo'] = '预定酒店时需提前支付房费';
                            }
                        }
                    }else{
                        $v['payType'] = '预付';
                    }
                    //是否有早餐
                    if(!empty($hotel_detail['ValueAdds'])){
                        foreach ($hotel_detail['ValueAdds'] as $k3 => $v3) {
                            if(!empty($v['ValueAddIds'])){
                                switch ($v3['TypeCode']) {
                                    case '01':
                                        $v3['TypeCode'] = '单早';
                                        break;
                                    case '99':
                                        $v3['TypeCode'] = '单早';
                                        break;
                                    default:
                                        $v3['TypeCode'] = '无早';
                                        break;
                                }
                                if(strpos($v['ValueAddIds'],',')===false){
                                    if($v['ValueAddIds'] == $v3['ValueAddId']){
                                        $v['ValueAdd'] = $v3;
                                    }
                                }else{
                                    if(strstr($v['ValueAddIds'],$v3['ValueAddId'])){
                                        $v['ValueAdd'] = $v3;
                                    }
                                }
                                
                            }else{
                                $v['ValueAdd']['TypeCode'] ='无早';
                            }
                        }
                    }else{
                        $v['ValueAdd']['TypeCode'] ='无早';
                    }
                    $v['AverageRate'] = ceil($v['AverageRate']);
                }
                $value['num'] = count($value['RatePlans']);
            }
            foreach ($hotel_detail['Images'] as $key2 => $value2) {  
                if($key2>=0 && $key2<6){    
                    array_push($pic_arr,$value2['Locations']['2']['Url']);
                    $hotel_detail['hotelImage'] = $pic_arr;
                }
                // if($key2>1 && $key2<12){
                    array_push($high_pic_arr,$value2['Locations']['3']['Url']);
                    $hotel_detail['highImage'] = $high_pic_arr;
                // }
            }
            if(!array_key_exists('Facilities',$hotel_detail)){
                $hotel_detail['Facilities'] = '';
            }else{
                $facilities = $this->facilities($hotel_detail['Facilities']);
                $hotel_detail['Facilities'] = $facilities;
            }
        }else{
            $hotel_detail = null;
        }
        if(input('post.map_post') == true){
            //下单页面修改日期
            $room_id = input('post.room_id');
            $rate_plan = input('post.rate_plan');
            if(!empty($rate_plan)){
                foreach ($hotel_detail['Rooms'] as $key => $value) {
                    if($value['RoomId'] == $room_id){
                        foreach ($value['RatePlans'] as $key1 => $value1) {
                            if($value1['RatePlanId'] == $rate_plan){
                                $hotel_price['status'] = true;
                                $hotel_price['TotalRate'] = $value1['TotalRate'];
                                break;
                            }else{
                                $hotel_price['status'] = false;
                            }   
                        }
                    }
                }
                //区分PC和APP
                if(isset($app_or_pc) && $app_or_pc == 'app'){
                    $return = array('status'=>true,'msg'=>'请求成功','data'=>$hotel_price);
                    echo json_encode($return,JSON_UNESCAPED_UNICODE);
                }else{
                    echo json_encode($hotel_price);
                }

                // echo json_encode($hotel_price);
            }else{
                if(isset($app_or_pc) && $app_or_pc == 'app'){
                    $return = array('status'=>true,'msg'=>'请求成功','data'=>$hotel_detail);
                    echo json_encode($return,JSON_UNESCAPED_UNICODE);
                }else{
                    echo json_encode($hotel_detail);
                }
            }
        }else{
            if(isset($app_or_pc) && $app_or_pc == 'app'){
                $return = array('status'=>true,'msg'=>'请求成功','data'=>$hotel_detail);
                echo json_encode($return,JSON_UNESCAPED_UNICODE);
            }else{
                return $hotel_detail;
            }  
        }
    }

    //酒店详情页
    public function hotelDetail(){
        $arrival_date = input('get.arrival_date') ? input('get.arrival_date') : '';
        $departure_date = input('get.departure_date') ? input('get.departure_date') : '';
        $hotel_id = input('get.hotel_id') ? input('get.hotel_id') : '';
        $hotel_detail = $this->getHotelDetail($arrival_date,$departure_date,$hotel_id);
        // print_r($hotel_detail);exit;
        $city = $hotel_detail['Detail']['CityName'];
        $position = ['Longitude'=>$hotel_detail['Detail']['Longitude'],'Latitude'=>$hotel_detail['Detail']['Latitude'],'Radius'=>'2000'];
        $near_hotels = $this->hotel($city,$zone_id='',$theme_id='',$arrival_date,$departure_date,$sort='DistanceAsc',1,6,'',$position);
        $hotels = $near_hotels['hotel'];
        unset($hotels[0]);
        foreach ($hotels as $key => &$value) {
            $dis= getDistance($value['Detail']['Longitude'], $value['Detail']['Latitude'],$hotel_detail['Detail']['Longitude'], $hotel_detail['Detail']['Latitude'], 3);
            $value['dis'] = round($dis,0);
        }
        // print_r($hotels);
        $this->assign('near_hotels',$hotels);
        $this->assign('hotel_detail',$hotel_detail);
        $this->assign('arrival_date',$arrival_date);
        $this->assign('departure_date',$departure_date);
        return $this->fetch();
    }

    //数据验证
    public function hotelVal(){
        $arrival_date = input('post.arrival_date') ? input('post.arrival_date') : '';
        $departure_date = input('post.departure_date') ? input('post.departure_date') : '';
        $hotel_id = input('post.hotel_id') ? input('post.hotel_id') : '';
        $room_type = input('post.room_type') ? input('post.room_type') : '';
        $rate_plan = input('post.rate_plan') ? input('post.rate_plan') : '';
        $price = input('post.total_price') ? input('post.total_price') : '';
        $rooms_number = input('post.rooms_number') ? input('post.rooms_number') : '';
        $total_price = $price*$rooms_number;
        $time = time();
        $data = json_encode(array(
            'Version'=>'1.33',
            'Local'=>'zh_CN',
            'Request'=>array(
                'ArrivalDate'=>$arrival_date,//入住日期
                'DepartureDate'=>$departure_date,//离店日期
                'EarliestArrivalTime'=>$arrival_date.' 14:00:00',//最早到店时间
                'LatestArrivalTime'=>$arrival_date.' 20:00:00',//最晚到店时间
                'HotelId'=>$hotel_id,//酒店编号
                'RoomTypeID'=>$room_type,//房型编号
                'RatePlanId'=>$rate_plan,//产品编号
                'TotalPrice'=>$total_price,//总价
                'NumberOfRooms'=>$rooms_number//房间数量
            )
        ));
        $signature = md5($time.md5($data.'2dfff541a55d28fc7ddecd0be2920a68').'7da0f3f5ced31dcb2a4996b9dfc6f36b');
        $url = "http://api.elong.com/rest?format=json&method=hotel.data.validate&user=21b5b1dbbc33412cbc2c538de927af4e&timestamp=$time&signature=$signature&data=$data";
        $url = str_replace(" ","%20",$url);
        $file_contents = json_decode(file_get_contents($url));
        // print_r($file_contents);
        // $hotel_val = json_decode(json_encode($file_contents),TRUE);//对象转数组
        if($file_contents->Code == '0'){
            $hotel_val = $file_contents->Result;
            $hotel_val->price =$total_price;
            // print_r($hotel_val);
            echo json_encode($hotel_val);
        }else{
            echo json_encode(array('ResultCode'=>'NO'));
        }
        // print_r($hotel_val);
    }

    //酒店提交订单页面
    public function hotelForm(){
        if(empty(cookie('uid'))){
            $this->redirect('Login/login');
        }
        return $this->fetch();
    }

    //酒店下单
    public function hotelOrderCreate(){
        $post = input('post.');
        $hotel_id = input('post.HotelId') ? input('post.HotelId') : '90175631';
        $mobile = input('post.mobile') ? input('post.mobile') : '13121383774';
        $name = input('post.name') ? input('post.name') : '张雷';
        $arrival_date = input('post.ArrivalDate') ? input('post.ArrivalDate') : '2018-07-28';
        $departure_date = input('post.DepartureDate') ? input('post.DepartureDate') : '2018-07-29';
        // $need_invoice = input('post.IsNeedInvoice') ? input('post.IsNeedInvoice') : false;
        // $invoice = input('post.invoice') ? input('post.invoice') : array('InvoiceType'=>'Paper','TitleType'=>'Enterprise','Title'=>'阿里巴巴','ITIN'=>'abc012345678912','ItemName'=>'代订房费','Amount'=>508.0,'Recipient'=>array('Province'=>'浙江省','City'=>'杭州市','District'=>'滨江区','Street'=>'长河街道','PostalCode'=>'310052','Name'=>'张泉','Phone'=>'13121383774'));
        $number_of_customers = input('post.NumberOfCustomers') ? input('post.NumberOfCustomers') : '1';//客人数量
        $number_of_rooms = input('post.NumberOfRooms') ? input('post.NumberOfRooms') : '1';//房间数量 
        // $customers = input('post.Customers') ? input('post.Customers') : array(array('Name'=>'张泉','Gender'=>'Unknown'));
        $customers = $_POST['Customers'] ? $_POST['Customers'] :'';
        foreach ($customers as $key => $value) {
            $customer[]['Customers'][] = $value;
        }
        $payment_type = input('post.PaymentType') ? input('post.PaymentType') : 'Prepay';//付款类型:SelfPay-前台现付、Prepay-预付
        $rate_plan_id = input('post.RatePlanId') ? input('post.RatePlanId') : '15441748';//RatePlanId
        $room_type_id = input('post.RoomTypeId') ? input('post.RoomTypeId') : '0002';//RoomTypeId
        $price = input('post.total_price') ? input('post.total_price') : '383.33';
        $payment = input('post.PayType') ? input('post.PayType') : '';
        $total_price = $price*$number_of_rooms;
        $order_id = $hotel_id.substr($mobile,7);
        $ip = get_client_ip();
        $time = time();
        $data = json_encode(array(
            'Version'=>'1.33',
            'Local'=>'zh_CN',
            'Request'=>array(
                'AffiliateConfirmationId'=>$order_id,//订单号，重试时提交不可修改，使用手机号后六位
                'ArrivalDate'=>$arrival_date,//入驻日期
                'ConfirmationType'=>'NoNeed',//SMS_cn 艺龙发送短信，订单失败主动联系
                //联系人
                'Contact'=>array(
                    'Mobile'=>$mobile,
                    'Name'=>$name
                ),
                // 'CreditCard'=>array(
                //     'ExpirationMonth'=>'10',
                //     'ExpirationYear'=>'2016',
                //     'HolderName'=>'',
                //     'IdNo'=>'',
                //     'IdType'=>'IdentityCard',
                //     'Number'=>'',
                //     'cVV'=>'',
                // )
                'CurrencyCode'=>'RMB',//货币类型
                'CustomerIPAddress'=>$ip,//客人访问IP
                'CustomerType'=>'All',//客人类型
                'DepartureDate'=>$departure_date,//离店日期
                'EarliestArrivalTime'=>$arrival_date.' 14:00:00',//最早到店时间
                'HotelId'=>$hotel_id,//酒店编号    
                'IsGuaranteeOrCharged'=>false,//是否已担保或已付款
                'IsCreateOrderOnly'=>true,//true为仅创建订单
                'IsNeedInvoice'=>'false',//是否需要发票
                // 'Invoice'=>$invoice,//发票信息
                'LatestArrivalTime'=>$arrival_date.' 20:00:00',//最晚到店时间 
                'NumberOfCustomers'=>$number_of_customers,//客人数量
                'NumberOfRooms'=>$number_of_rooms,//房间数量 
                //入住人信息
                // 'OrderRooms'=>array(
                //     array(
                //         'Customers'=>$customers
                //     ),
                //     array(
                //         'Customers'=>$customers
                //     )
                // ),//客人信息  
                'OrderRooms'=>$customer,  
                // 'PaymentType'=>$payment_type,//付款类型:SelfPay-前台现付、Prepay-预付
                'PaymentType'=>'Prepay',//付款类型:SelfPay-前台现付、Prepay-预付
                'RatePlanId'=>$rate_plan_id,//RatePlanId
                'RoomTypeId'=>$room_type_id,//RoomTypeId
                'TotalPrice'=>$price//总价,RatePlan的TotalRate * 房间数
            )
        ));
        $signature = md5($time.md5($data.'2dfff541a55d28fc7ddecd0be2920a68').'7da0f3f5ced31dcb2a4996b9dfc6f36b');
        $url = "https://api.elong.com/rest?format=json&method=hotel.order.create&user=21b5b1dbbc33412cbc2c538de927af4e&timestamp=$time&signature=$signature&data=$data";
        $url = str_replace(" ","%20",$url);
        $file_contents = json_decode(file_get_contents($url));
        $uid = cookie('uid');
        if($file_contents->Code === '0'){
            $payment_type = $payment_type=='SelfPay' ? '前台现付' : '预付';
            $order_id = Db::name('Hotel_order')->insertGetId(array('uid'=>$uid,'hotel_order_id'=>$file_contents->Result->OrderId,'payment_type'=>$payment_type,'payment'=>$payment,'total_price'=>$price,'create_date'=>date('Y-m-d H:i:s')));
            $return = array('status'=>true,'id'=>$order_id); 
        }else{
            $return = array('status'=>false,'id'=>'');
        }
        echo json_encode($return);
    }

    //酒店支付页面
    public function hotelPay(){
        $order_id = input('get.hotel_id') ? input('get.hotel_id') : '';
        $order_name = input('get.order_name') ? input('get.order_name') : '';
        $order_info = Db::name('Hotel_order')->where(['id'=>$order_id])->find();
        if($order_info['hotel_name'] == ''){
            sleep(1);
            $order = $this->hotelOrderDetail($order_info['hotel_order_id']);
                // print_r($order);exit;
            Db::name('Hotel_order')->where(['id'=>$order_id])->update(['hotel_name'=>$order['HotelName'],'hotel_room_type'=>$order['RoomTypeName'],'rate_plan_name'=>$order['RatePlanName'],'arrival_date'=>substr($order['ArrivalDate'],0,strpos($order['ArrivalDate'], 'T')),'departure_date'=>substr($order['DepartureDate'],0,strpos($order['DepartureDate'], 'T')),'order_status'=>$order['Status'],'value_add'=>$order['ValueAdds'],'show_status'=>$order['ShowStatus'],'room_number'=>$order['NumberOfRooms'],'is_cancel'=>$order['IsCancelable'],'cancle_time'=>substr($order['CancelTime'],0,strpos($order['CancelTime'], '+')),'hotel_info'=>json_encode($order['OrderHotel']),'contact'=>json_encode($order['Contact']),'order_room'=>json_encode($order['OrderRooms'])]);   
            $order_info = Db::name('Hotel_order')->where(['id'=>$order_id])->find();
        // }
        // print_r($order_in);
        // $payment_type = input('get.payment_type') ? input('get.payment_type') : '';
        // $payment_type = urldecode($payment_type);
        // if($payment_type == '担保'){

        }else{
            sleep(1);
            $order = $this->hotelOrderDetail($order_info['hotel_order_id']);
            // print_r($order);
            Db::name('Hotel_order')->where(['id'=>$order_id])->update(['order_status'=>$order['Status'],'show_status'=>$order['ShowStatus']]);
            $order_info = Db::name('Hotel_order')->where(['id'=>$order_id])->find();
        }
        // print_r($order_info);exit;
        $this->assign('order_info',$order_info);
        return $this->fetch();
    }

    //支付宝支付
    public function Alipay(){
        $order_id = input('get.id') ? input('get.id') : '';
        $order_name = input('get.order_name') ? input('get.order_name') : '';
        $type = input('get.type') ? input('get.type') : '';
        // $type = 'flight';
        if($type == 'flight'){
            $order_info = Db::name('Flight_order')->where(['id'=>$order_id])->find();
            $price = $order_info['all_price'];
            $out_trade_no = 'flight'.time();
            $order_name = '袋鹿旅行机票订单';
            $db = 'Flight_order';
        }elseif($type == 'train'){

        }else{
            $order_info = Db::name('Hotel_order')->where(['id'=>$order_id])->find();
            $price = $order_info['total_price'];
            $out_trade_no = 'hotel'.time();
            $order_name = '袋鹿旅行酒店订单'; 
            $db = 'Hotel_order';
        }
        $order = [
            'out_trade_no' => $out_trade_no,//商户订单号，不可重复
            'total_amount' => $price,//订单金额
            'subject' => $order_name,//订单标题
        ];
        Db::name($db)->where(['id'=>$order_id])->update(['pay_order_id'=>$out_trade_no]);
        $alipay = Pay::alipay($this->ali_config)->web($order);
        return $alipay->send();// laravel 框架中请直接 `return $alipay`
    }

    public function xtest($credit=''){
        import('xcrypt',EXTEND_PATH);
        $key = 'e2920a68';
        $scrypt = new \Xcrypt($key,'cbc',$key);
        echo '向量：';
        var_dump($scrypt->getIV());
        //加密
        $str = time().'#'.$credit;
        $b = $scrypt->encrypt($str, 'base64');
        //解密
        $c = $scrypt->decrypt($b, 'base64');
         
        echo '加密后：';
        var_dump($b);
        echo '解密后：';
        var_dump($c);
    }

    //付款成功
    public function storePaySuccess(){
        $out_trade_no = input('get.out_trade_no') ? input('get.out_trade_no') : (input('get.orderId') ? input('get.orderId') :'');
        if(!empty($out_trade_no)){
            if(stristr($out_trade_no,'hotel')){
                $order_info = Db::name('Hotel_order')->where(['pay_order_id'=>$out_trade_no])->find();
                $contact = json_decode($order_info['contact'])->Mobile;
                $type = 'hotel';
                $order_id = $order_info['hotel_order_id'];
            }elseif(stristr($out_trade_no,'flight')){
                $order_info = Db::name('Flight_order')->where(['pay_order_id'=>$out_trade_no])->find();
                $contact = $order_info['contact_mob'];
                $type = 'flight';
                $order_id = $order_info['order_no'];
            }elseif(stristr($out_trade_no,'train')){

            }else{

            }
        }else{
            // $this->redirect('store/hotelPay.html?hotel_id='.$order_info['id']);
            $this->error('非法提交','store/hotelIndex');
        }
        $this->assign('type',$type);
        $this->assign('order_id',$order_id);
        $this->assign('contact',$contact);
        return $this->fetch();
    }

    //支付宝异步回调
    public function AlinotifyUrl(){
        $alipay = Pay::alipay($this->ali_config);
        try{
            $post = $_POST;
            $ver = $alipay->verify($post); // 是的，验签就这么简单！
            if($ver){
                $data = $alipay->find($post['out_trade_no']); // 订单查询
                $out_trade_no = $data->out_trade_no;
                if($data->trade_status == 'TRADE_SUCCESS' || $data->trade_status == 'TRADE_FINISHED'){
                    if(stristr($out_trade_no,'hotel')){
                        $db = 'Hotel_order';
                        $this->hotelOrderPay($out_trade_no);
                    }elseif(stristr($out_trade_no,'flight')){
                        $db = 'Flight_order';
                        $this->flightPayValidate($out_trade_no);
                    }elseif(stristr($out_trade_no,'train')){

                    }else{

                    }
                    Db::name($db)->where(['pay_order_id'=>$out_trade_no])->update(['pay_status'=>1,'pay_type'=>2]);
                }
                
            }
            // 请自行对 trade_status 进行判断及其它逻辑进行判断，在支付宝的业务通知中，只有交易通知状态为 TRADE_SUCCESS 或 TRADE_FINISHED 时，支付宝才会认定为买家付款成功。
            // 1、商户需要验证该通知数据中的out_trade_no是否为商户系统中创建的订单号；
            // 2、判断total_amount是否确实为该订单的实际金额（即商户订单创建时的金额；
            // 3、校验通知中的seller_id（或者seller_email) 是否为out_trade_no这笔单据的对应的操作方（有的时候，一个商户可能有多个seller_id/seller_email）；
            // 4、验证app_id是否为该商户本身。
            // 5、其它业务逻辑情况
            // $order_info = $alipay->find();
            Log::debug('Alipay notify', $ver->all());
        } catch (Exception $e) {
            $e->getMessage();
        }

        return $alipay->success()->send();// laravel 框架中请直接 `return $alipay->success()`
    }

    //微信支付config
    protected $wx_config = [
        // 'appid' => 'wx0813e8a3359cc21b', // APP APPID
        'app_id' => 'wx2093f9b9a90e2a15', // 公众号 APPID
        // 'miniapp_id' => 'wxb3fxxxxxxxxxxx', // 小程序 APPID
        'mch_id' => '1482298462',
        'key' => '6b371ec38e8e65764eb68a890e6e439b',
        'notify_url' => 'http://a.5199yl.com/portal/store/wx_notify.html',
        'cert_client' => './cert/apiclient_cert.pem', // optional，退款等情况时用到
        'cert_key' => './cert/apiclient_key.pem',// optional，退款等情况时用到
        'log' => [ // optional
            'file' => './logs/wechat.log',
            'level' => 'info',
            'type' => 'single',
        ],
        'mode' => 'normal', // optional, dev/hk;当为 `hk` 时，为香港 gateway。
    ];

    //微信支付
    public function wxPay(){
        $post = input('post.');
        $order_id = input('get.id') ? input('get.id') : '';
        // $order_name = input('get.order_name') ? input('get.order_name') : '';
        $type = input('get.type') ? input('get.type') : '';
        if($type == 'flight'){
            $order_info = Db::name('Flight_order')->where(['id'=>$order_id])->find();
            $price = $order_info['all_price'];
            $out_trade_no = 'flight'.time();
            $order_name = '袋鹿旅行机票订单';
            $db = 'Flight_order';
        }elseif($type == 'train'){

        }else{
            $order_info = Db::name('Hotel_order')->where(['id'=>$order_id])->find();
            $price = $order_info['total_price'];
            $out_trade_no = 'hotel'.time();
            $order_name = '袋鹿旅行酒店订单'; 
            $db = 'Hotel_order';
        }
        $order = [
            'out_trade_no' => $out_trade_no,
            'body' => $order_name ,
            'total_fee' => $price*100, // **单位：分**
        ];
        $result = Pay::wechat($this->wx_config)->scan($order);
        Db::name($db)->where(['id'=>$order_id])->update(['pay_order_id'=>$out_trade_no]);
        $qr = $result->code_url;
        $return = ['qr'=>$qr,'out_trade_no'=>$out_trade_no,'price'=>$price];
        echo json_encode($return,JSON_UNESCAPED_UNICODE);
    }

    //微信回调
    public function wx_notify(){
        $pay = Pay::wechat($this->wx_config);
        try{
            $xml = file_get_contents('php://input');
            // $data = $pay->verify($post); // 是的，验签就这么简单！
            $arr = $this->fromXml($xml);
            $order = $pay->find($arr['out_trade_no']);
            $out_trade_no = $order->out_trade_no;
            if($order->trade_state == 'SUCCESS'){
                if(stristr($out_trade_no,'hotel')){
                    $db = 'Hotel_order';
                    $this->hotelOrderPay($out_trade_no);
                }elseif(stristr($out_trade_no,'flight')){
                    $db = 'Flight_order';
                    $this->flightPayValidate($out_trade_no);
                }elseif(stristr($out_trade_no,'train')){

                }else{

                }
                Db::name($db)->where(['pay_order_id'=>$out_trade_no])->update(['pay_type'=>1,'pay_status'=>1]);
                // $this->hotelOrderPay($out_trade_no);
            }
            // Log::debug('Wechat notify', $data->all());
        } catch (Exception $e) {
            $e->getMessage();
        }
        
        return $pay->success()->send();// laravel 框架中请直接 `return $pay->success()`
    }

    //微信查询付款详情
    public function wxOrderDetail(){
        $out_trade_no = input('post.out_trade_no');
        $pay = Pay::wechat($this->wx_config);
        $order = $pay->find($out_trade_no);
        if($order->trade_state == 'SUCCESS'){
            echo json_encode(['status'=>true]);
        }else{
            echo json_encode(['status'=>false]);
        }
    }

    //xml转数组
    public function fromXml($xml){   
        if(!$xml){return false;}
        $xml_parser = xml_parser_create();   
        if(!xml_parse($xml_parser,$xml,true)){   
            xml_parser_free($xml_parser);   
            return false;  
        }
        xml_parser_free($xml_parser);
        //将XML转为array,禁止引用外部xml实体
        libxml_disable_entity_loader(true);
        return json_decode(json_encode(simplexml_load_string($xml, 'SimpleXMLElement', LIBXML_NOCDATA)), true);       
    }

    //快钱支付
    public function billPay(){
        $order_id = input('get.id') ? input('get.id') : '15';
        $type = input('get.type') ? input('get.type') : 'flight';
        if($type == 'flight'){
            $order_info = Db::name('Flight_order')->where(['id'=>$order_id])->find();
            $price = $order_info['all_price'];
            $out_trade_no = 'flight'.time();
            $order_name = '袋鹿旅行机票订单';
            $db = 'Flight_order';
            $flight_info = json_decode($order_info['flight_info'],true);
            $productName = $flight_info['carrierName'].$flight_info['flightNum'];
            $productDesc = $flight_info['cbcn'];
        }elseif($type == 'train'){

        }else{
            $order_info = Db::name('Hotel_order')->where(['id'=>$order_id])->find();
            $price = $order_info['total_price'];
            $out_trade_no = 'hotel'.time();
            $order_name = '袋鹿旅行酒店订单'; 
            $db = 'Hotel_order';
            $productName = $order_info['hotel_name'];
            $productDesc = $order_info['hotel_room_type'];
        }
        // $order_info = Db::name($db)->where(['id'=>$order_id])->find();
        //人民币网关账号，该账号为11位人民币网关商户编号+01,该参数必填。
        $merchantAcctId = "1007317332301";
        //编码方式，1代表 UTF-8; 2 代表 GBK; 3代表 GB2312 默认为1,该参数必填。
        $inputCharset = "1";
        //接收支付结果的页面地址，该参数一般置为空即可。
        // $pageUrl = "http://a.5199yl.com/portal/store/index";
        $pageUrl = "";
        //服务器接收支付结果的后台地址，该参数务必填写，不能为空。
        $bgUrl = "http://a.5199yl.com/portal/store/billReceive.html";
        // $bgUrl = "";
        //网关版本，固定值：v2.0,该参数必填。
        $version =  "v2.0";
        //语言种类，1代表中文显示，2代表英文显示。默认为1,该参数必填。
        $language =  "1";
        //签名类型,该值为4，代表PKI加密方式,该参数必填。
        $signType =  "4";
        //支付人姓名,可以为空。
        $payerName= ""; 
        //支付人联系类型，1 代表电子邮件方式；2 代表手机联系方式。可以为空。
        $payerContactType =  "1";
        //支付人联系方式，与payerContactType设置对应，payerContactType为1，则填写邮箱地址；payerContactType为2，则填写手机号码。可以为空。
        $payerContact =  "13121383773@qq.com";
        //商户订单号，以下采用时间来定义订单号，商户可以根据自己订单号的定义规则来定义该值，不能为空。
        $orderId = $out_trade_no;
        //订单金额，金额以“分”为单位，商户测试以1分测试即可，切勿以大金额测试。该参数必填。
        $orderAmount = $price*100;
        //订单提交时间，格式：yyyyMMddHHmmss，如：20071117020101，不能为空。
        $orderTime = date("YmdHis");
        //商品名称，可以为空。
        $productName= $productName;
        //商品数量，可以为空。
        $productNum = "1";
        //商品代码，可以为空。
        $productId = "";
        //商品描述，可以为空。
        $productDesc = $productDesc;
        //扩展字段1，商户可以传递自己需要的参数，支付完快钱会原值返回，可以为空。
        $ext1 = "";
        //扩展自段2，商户可以传递自己需要的参数，支付完快钱会原值返回，可以为空。
        $ext2 = "";
        //支付方式，一般为00，代表所有的支付方式。如果是银行直连商户，该值为10，必填。
        $payType = "00";
        //银行代码，如果payType为00，该值可以为空；如果payType为10，该值必须填写，具体请参考银行列表。
        $bankId = "";
        //同一订单禁止重复提交标志，实物购物车填1，虚拟产品用0。1代表只能提交一次，0代表在支付不成功情况下可以再提交。可为空。
        $redoFlag = "";
        //快钱合作伙伴的帐户号，即商户编号，可为空。
        $pid = "";
        // signMsg 签名字符串 不可空，生成加密签名串
        function kq_ck_null($kq_va,$kq_na){
            if($kq_va == ""){
                $kq_va="";
            }else{
                return $kq_va=$kq_na.'='.$kq_va.'&';
            }
        }
        $kq_all_para=kq_ck_null($inputCharset,'inputCharset');
        // $kq_all_para.=kq_ck_null($pageUrl,"pageUrl");
        $kq_all_para.=kq_ck_null($bgUrl,'bgUrl');
        $kq_all_para.=kq_ck_null($version,'version');
        $kq_all_para.=kq_ck_null($language,'language');
        $kq_all_para.=kq_ck_null($signType,'signType');
        $kq_all_para.=kq_ck_null($merchantAcctId,'merchantAcctId');
        // $kq_all_para.=kq_ck_null($payerName,'payerName');
        $kq_all_para.=kq_ck_null($payerContactType,'payerContactType');
        $kq_all_para.=kq_ck_null($payerContact,'payerContact');
        $kq_all_para.=kq_ck_null($orderId,'orderId');
        $kq_all_para.=kq_ck_null($orderAmount,'orderAmount');
        $kq_all_para.=kq_ck_null($orderTime,'orderTime');
        $kq_all_para.=kq_ck_null($productName,'productName');
        $kq_all_para.=kq_ck_null($productNum,'productNum');
        // $kq_all_para.=kq_ck_null($productId,'productId');
        $kq_all_para.=kq_ck_null($productDesc,'productDesc');
        // $kq_all_para.=kq_ck_null($ext1,'ext1');
        // $kq_all_para.=kq_ck_null($ext2,'ext2');
        $kq_all_para.=kq_ck_null($payType,'payType');
        // $kq_all_para.=kq_ck_null($bankId,'bankId');
        // $kq_all_para.=kq_ck_null($redoFlag,'redoFlag');
        // $kq_all_para.=kq_ck_null($pid,'pid');
        $kq_all_para=substr($kq_all_para,0,strlen($kq_all_para)-1);
        /////////////  RSA 签名计算 ///////// 开始 //
        $fp = fopen(dirname(__FILE__)."/99bill-rsa.pem", "r");
        $priv_key = fread($fp, 123456);
        fclose($fp);
        $pkeyid = openssl_get_privatekey($priv_key);
        // compute signature
        openssl_sign($kq_all_para, $signMsg, $pkeyid,OPENSSL_ALGO_SHA1);
        // free the key from memory
        openssl_free_key($pkeyid);
        $signMsg = base64_encode($signMsg);
        /////////////  RSA 签名计算 ///////// 结束 //
        $url = 'https://www.99bill.com/gateway/recvMerchantInfoAction.htm';
        Db::name($db)->where(['id'=>$order_id])->update(['pay_order_id'=>$orderId]);
        $query = [
            'inputCharset' => $inputCharset,
            'pageUrl' => $pageUrl,
            'bgUrl' => $bgUrl,
            'version' => $version,
            'language' => $language,
            'signType' => $signType,
            'signMsg' => $signMsg,
            'merchantAcctId' => $merchantAcctId,
            'payerName' => $payerName,
            'payerContactType' => $payerContactType,
            'payerContact' => $payerContact,
            'orderId' => $orderId,
            'orderAmount' => $orderAmount,
            'orderTime' => $orderTime,
            'productName' => $productName,
            'productNum' => $productNum,
            'productId' => $productId,
            'productDesc' => $productDesc,
            'ext1' => $ext1,
            'ext2' => $ext2,
            'payType' => $payType,
            'bankId' => $bankId,
            'redoFlag' => $redoFlag,
            'pid' => $pid,
        ];
        $a = $this->buildRequestForm($query,'post','确认',$url);
        echo $a;
    }

    //form表单提交
    public function buildRequestForm($para, $method, $button_name,$url) {
        //待请求参数数组

        $sHtml = "<form id='bill99submit' name='bill99submit' action='".$url."' method='".$method."' style='display:none;'>";
        while (list ($key, $val) = each ($para)) {
            $sHtml.= "<input type='hidden' name='".$key."' value='".$val."'/>";
        }

        //submit按钮控件请不要含有name属性
        $sHtml = $sHtml."<input type='submit' value='".$method."'></form>";
        
        $sHtml = $sHtml."<script>document.forms['bill99submit'].submit();</script>";
        
        return $sHtml;
    }

    //快钱回调
    public function billReceive(){
        $ok = $this->checkSignMsg();
        if($ok ==1 ){ //验证签名成功
            switch($_REQUEST['payResult']){
                case '10':
                    //此处做商户逻辑处理
                    //$rtnOK=1;
                    //以下是我们快钱设置的show页面，商户需要自己定义该页面。
                    $out_trade_no = $_REQUEST['orderId'];
                    if(stristr($out_trade_no,'hotel')){
                        $db = 'Hotel_order';
                        $this->hotelOrderPay($out_trade_no);
                    }elseif(stristr($out_trade_no,'flight')){
                        $db = 'Flight_order';
                        $this->flightPayValidate($out_trade_no);
                    }elseif(stristr($out_trade_no,'train')){

                    }else{

                    }
                    Db::name($db)->where(['pay_order_id'=>$out_trade_no])->update(['pay_type'=>3,'pay_status'=>1]);
                    return <<<EOT
                        <result>1</result><redirecturl>http://a.5199yl.com/portal/store/storePaySuccess</redirecturl> 
EOT;
                    break;
                default:
                //  $rtnOK=0;
                    //以下是我们快钱设置的show页面，商户需要自己定义该页面。
                //  $rtnUrl="http://123.56.181.50:8080/show.php?msg=false";
                    return <<<EOT
                        <result>0</result><redirecturl>http://a.5199yl.com/portal/store/index</redirecturl> 
EOT;
                    break;
            }
        }else{
            //$rtnOK=0;
            //以下是我们快钱设置的show页面，商户需要自己定义该页面。
            //$rtnUrl="http://123.56.181.50:8080/show.php?msg=error";
            return <<<EOT
                        <result>0</result><redirecturl>http://a.5199yl.com/portal/store/index</redirecturl> 
EOT;
        }
        
    }

    //PKI加密技术
    public function kq_ck_null($kq_va,$kq_na){
        if($kq_va == ""){
            return $kq_va="";
        }else{
            return $kq_va=$kq_na.'='.$kq_va.'&';
        }
    }

    //快钱验证
    public function checkSignMsg(){
        $kq_check_all_para=$this->kq_ck_null($_REQUEST['merchantAcctId'],'merchantAcctId');
        //网关版本，固定值：v2.0,该值与提交时相同。
        $kq_check_all_para.=$this->kq_ck_null($_REQUEST['version'],'version');
        //语言种类，1代表中文显示，2代表英文显示。默认为1,该值与提交时相同。
        $kq_check_all_para.=$this->kq_ck_null($_REQUEST['language'],'language');
        //签名类型,该值为4，代表PKI加密方式,该值与提交时相同。
        $kq_check_all_para.=$this->kq_ck_null($_REQUEST['signType'],'signType');
        //支付方式，一般为00，代表所有的支付方式。如果是银行直连商户，该值为10,该值与提交时相同。
        $kq_check_all_para.=$this->kq_ck_null($_REQUEST['payType'],'payType');
        //银行代码，如果payType为00，该值为空；如果payType为10,该值与提交时相同。
        $kq_check_all_para.=$this->kq_ck_null($_REQUEST['bankId'],'bankId');
        //商户订单号，,该值与提交时相同。
        $kq_check_all_para.=$this->kq_ck_null($_REQUEST['orderId'],'orderId');
        //订单提交时间，格式：yyyyMMddHHmmss，如：20071117020101,该值与提交时相同。
        $kq_check_all_para.=$this->kq_ck_null($_REQUEST['orderTime'],'orderTime');
        //订单金额，金额以“分”为单位，商户测试以1分测试即可，切勿以大金额测试,该值与支付时相同。
        $kq_check_all_para.=$this->kq_ck_null($_REQUEST['orderAmount'],'orderAmount');
        // 快钱交易号，商户每一笔交易都会在快钱生成一个交易号。
        $kq_check_all_para.=$this->kq_ck_null($_REQUEST['dealId'],'dealId');
        //银行交易号 ，快钱交易在银行支付时对应的交易号，如果不是通过银行卡支付，则为空
        $kq_check_all_para.=$this->kq_ck_null($_REQUEST['bankDealId'],'bankDealId');
        //快钱交易时间，快钱对交易进行处理的时间,格式：yyyyMMddHHmmss，如：20071117020101
        $kq_check_all_para.=$this->kq_ck_null($_REQUEST['dealTime'],'dealTime');
        //商户实际支付金额 以分为单位。比方10元，提交时金额应为1000。该金额代表商户快钱账户最终收到的金额。
        $kq_check_all_para.=$this->kq_ck_null($_REQUEST['payAmount'],'payAmount');
        //费用，快钱收取商户的手续费，单位为分。
        $kq_check_all_para.=$this->kq_ck_null($_REQUEST['fee'],'fee');
        //扩展字段1，该值与提交时相同
        $kq_check_all_para.=$this->kq_ck_null($_REQUEST['ext1'],'ext1');
        //扩展字段2，该值与提交时相同。
        $kq_check_all_para.=$this->kq_ck_null($_REQUEST['ext2'],'ext2');
        //处理结果， 10支付成功，11 支付失败，00订单申请成功，01 订单申请失败
        $kq_check_all_para.=$this->kq_ck_null($_REQUEST['payResult'],'payResult');
        //错误代码 ，请参照《人民币网关接口文档》最后部分的详细解释。
        $kq_check_all_para.=$this->kq_ck_null($_REQUEST['errCode'],'errCode');
        $trans_body=substr($kq_check_all_para,0,strlen($kq_check_all_para)-1);
        $text = json_encode($trans_body);
        $MAC=base64_decode($_REQUEST['signMsg']);
        $fp = fopen(dirname(__FILE__)."\99bill.cert.rsa.20340630.cer", "r"); 
        // Db::name('wxhd')->insert(['text'=>$text]);
        $cert = fread($fp, 8192); 
        fclose($fp); 
        $pubkeyid = openssl_get_publickey($cert); 
        return openssl_verify($trans_body, $MAC, $pubkeyid); 
    }

    //酒店订单支付
    public function hotelOrderPay($out_trade_no){
        // $out_trade_no = 'hotel1547461557';
        $order_info = Db::name('Hotel_order') -> field('uid,hotel_name,contact,hotel_order_id,total_price')->where(['pay_order_id'=>$out_trade_no])->find();
        // $credit = input('post.number') ? input('post.number') : '';
        // $number = $this->xcrypt($credit);
        // print_r($order_info);exit;
        $time = time();
        $data = json_encode(array(
            'Version'=>'1.33',
            'Local'=>'zh_CN',
            'Request'=>array(
                'OrderId'=>$order_info['hotel_order_id'],
                // 'OrderId'=>'464975469',
                'IsGuaranteeOrCharged'=>true,
                //信用卡信息
                // 'CreditCard'=>array(
                //     'ExpirationMonth'=>'10',//有效期月
                //     'ExpirationYear'=>'2016',//有效期年
                //     'HolderName'=>'',//持卡人
                //     'IdNo'=>'',//证件号码
                //     'IdType'=>'IdentityCard',//证件类型
                //     'Number'=>'',//卡号
                //     'cVV'=>'',
                // ),
                'Amount'=>$order_info['total_price']
            )
        ));
        $signature = md5($time.md5($data.'2dfff541a55d28fc7ddecd0be2920a68').'7da0f3f5ced31dcb2a4996b9dfc6f36b');
        $url = "https://api.elong.com/rest?format=json&method=hotel.order.pay&user=21b5b1dbbc33412cbc2c538de927af4e&timestamp=$time&signature=$signature&data=$data";
        // $url = str_replace(" ","%20",$url);
        $fileContents = json_decode(file_get_contents($url));
        $hotelDetail = json_encode($fileContents);//对象转数组
        $contact = json_decode($order_info['contact'],true);
        vendor('duanxin.sendAPI'); //引进短信接口API
        $sms_text = "【袋鹿旅行】欢迎预定".$order_info['hotel_name']."。如有疑问请联系客服";
        $data = [];
        $data['uid']=$order_info['uid'];
        $data['sendto']='user';
        $data['type']='wapregCode2';
        //调用短信接口
        $sendArr = array(
            'content'   => $sms_text,     //短信内容
            'mobile'    => $contact['Mobile']         //手机号码
        );
        $url        = "http://www.api.zthysms.com/sendSms.do";
        $username   = 'YRCWhy';
        $password   = 'Yrcw123456';
        $ucpass = new \sendAPI($url, $username, $password); //这里第一个反斜杠是必须要有的。 
        $ucpass->send_sms($contact['Mobile'],$sms_text,$sendArr,$data);
        Db::name('wxhd')->insert(['text'=>$hotelDetail]);
    }

    //订单状态增量
    public function hotelOrderInor(){
        $post = input('post.');
        $time = time();
        $data = json_encode(array(
            'Version'=>'1.33', 
            'Local'=>'zh_CN',
            'Request'=>array(
                'OrderId'=>'461936961',
                // 'IsGuaranteeOrCharged'=>'',
            )
        ));
        $signature = md5($time.md5($data.'2dfff541a55d28fc7ddecd0be2920a68').'7da0f3f5ced31dcb2a4996b9dfc6f36b');
        $url = "https://api.elong.com/rest?format=json&method=hotel.order.detail&user=21b5b1dbbc33412cbc2c538de927af4e&timestamp=$time&signature=$signature&data=$data";
        $fileContents = json_decode(file_get_contents($url));
        $hotelDetail = json_decode(json_encode($fileContents),TRUE);//对象转数组
        print_r($fileContents);
    }

    //订单详情
    public function hotelOrderDetail($order_id){
        // $post = input('post.');
        $uid = cookie('uid');
        // $user = Db::name('Hotel_order')->where(['uid'=>$uid])->find();
        $time = time();
        $data = json_encode(array(
            'Version'=>'1.35', 
            'Local'=>'zh_CN',
            'Request'=>array(
                'OrderId'=>$order_id,
                // 'IsGuaranteeOrCharged'=>'',
            )
        ));
        $signature = md5($time.md5($data.'2dfff541a55d28fc7ddecd0be2920a68').'7da0f3f5ced31dcb2a4996b9dfc6f36b');
        $url = "https://api.elong.com/rest?format=json&method=hotel.order.detail&user=21b5b1dbbc33412cbc2c538de927af4e&timestamp=$time&signature=$signature&data=$data";
        $fileContents = json_decode(file_get_contents($url));
        $hotelDetail = json_decode(json_encode($fileContents),TRUE);//对象转数组
        $now_date = date('Y-m-d H:i:s');
        $cancle_time = substr($hotelDetail['Result']['CancelTime'],0,10).' '.substr($hotelDetail['Result']['CancelTime'],11,8);
        if($cancle_time>$now_date && $hotelDetail['Result']['IsCancelable'] == 1){
            $hotelDetail['Result']['cancelable'] = true;
        }else{
            $hotelDetail['Result']['cancelable'] = false;
        }
        Db::name('Hotel_order')->where(['hotel_order_id'=>$order_id])->update(['order_status'=>$hotelDetail['Result']['Status'],'show_status'=>$hotelDetail['Result']['ShowStatus'],'is_cancel'=>$hotelDetail['Result']['cancelable']]);
        // print_r($hotelDetail);exit;
        return $hotelDetail['Result'];
    }

    //酒店订单详情页面
    public function hotelOrderDetails(){
        $order_id = input('get.order_id');
        $order_detail = $this->hotelOrderDetail($order_id);
        $hotel_order = Db::name('hotel_order')->field('id,pay_type,pay_status,create_date')->where('hotel_order_id',$order_id)->find();
        $order_detail['hotel_id'] = $hotel_order['id'];
        $order_detail['pay_type'] = $hotel_order['pay_type'];
        $order_detail['pay_status'] = $hotel_order['pay_status'];
        $order_detail['create_date'] = $hotel_order['create_date'];
        $order_detail['ArrivalDate'] = str_replace('T',' ', $order_detail['ArrivalDate']);
        $order_detail['DepartureDate'] = str_replace('T',' ', $order_detail['DepartureDate']);
        $this->assign('order_detail',$order_detail);
        return $this->fetch();
    }

    //酒店订单列表
    public function hotelOrderList($uid,$page,$show_status){
        $order_db = Db::name('hotel_order');
        $order_id = $order_db->where(['uid'=>$uid,'is_del'=>false])->order('id desc')->page($page,8)->column('hotel_order_id');
        foreach ($order_id as $k => $v) {
            $this->hotelOrderDetail($v);//更新订单状态
        }
        $where['uid'] = $uid;
        $where['is_del'] = false;
        $show_status == '1' ? $where['pay_status'] = 1 :null;
        $show_status ? $where['show_status'] = $show_status : null;
        $order_list = $order_db ->where($where)->order('id desc')->page($page,8)->select()->toArray();
        foreach ($order_list as $key => &$value) {
            $value['stay_days'] = (strtotime($value['departure_date'])-strtotime($value['arrival_date']))/86400;
        }
        $count = $order_db->where($where)->count('id');
        // print_r($order_list);
        return $return = ['count'=>$count,'order_list'=>$order_list];
    }
    //取消订单
    public function hotelOrderCancel(){
        $post = input('post.');
        $pay_status = Db::name('Hotel_order')->field('pay_status,total_price')->where('hotel_order_id',$post['order_id'])->find();
        //支付之后存入退款表
        if($pay_status['pay_status'] == 1){
            $create_time = date('Y-m-d H:i:s');
            $order_cancel_db = Db::name('order_cancel');
            $cancel_info = Db::name('order_cancel')->where('order_id',$post['order_id'])->value('id');
            if(empty($cancel_info)){
                $id = $order_cancel_db->insertGetId(['order_id'=>$post['order_id'],'cause'=>$post['cause'],'orther_cause'=>$post['orther_cause'],'order_type'=>'hotel','create_time'=>$create_time]);
            }
        }
        $time = time();
        $data = json_encode(array(
            'Version'=>'1.33', 
            'Local'=>'zh_CN',
            'Request'=>array(
                'OrderId'=>$post['order_id'],
                'CancelCode'=>'行程变更'
                // 'IsGuaranteeOrCharged'=>'',
            )
        ));
        $signature = md5($time.md5($data.'2dfff541a55d28fc7ddecd0be2920a68').'7da0f3f5ced31dcb2a4996b9dfc6f36b');
        $url = "https://api.elong.com/rest?format=json&method=hotel.order.cancel&user=21b5b1dbbc33412cbc2c538de927af4e&timestamp=$time&signature=$signature&data=$data";
        $fileContents = json_decode(file_get_contents($url));
        $hotelDetail = json_decode(json_encode($fileContents),TRUE);//对象转数组
        if($hotelDetail['Result']['Successs'] == 1 && $hotelDetail['Code'] == 0 ){
            $status = true;
            $msg = '取消订单提交成功';
            if($pay_status['pay_status'] == 1){
                if(empty($cancel_info)){
                    $price = $pay_status['total_price'] - $hotelDetail['Result']['PenaltyAmount'];
                    $order_cancel_db->where('id',$id)->update(['is_success'=>1,'price'=>$price]);
                }
            }
        }else{
            $status = false;
            $msg = $hotelDetail['Code'];
        }
            echo json_encode(['status'=>$status,'price'=>$hotelDetail['Result']['PenaltyAmount'],'msg'=>$msg],JSON_UNESCAPED_UNICODE);

    }

    //酒店退款申请
    public function hotelMoneyback(){
        $order_id = input('get.order_id');
        $order_detail = $this->hotelOrderDetail($order_id);
        $order_detail['ArrivalDate'] = str_replace('T',' ', $order_detail['ArrivalDate']);
        $order_detail['DepartureDate'] = str_replace('T',' ', $order_detail['DepartureDate']);
        $order_detail['cancel_info'] = Db::name('order_cancel')->where('order_id',$order_id)->value('id');
        // print_r($order_detail);
        $this->assign('order_detail',$order_detail);
        return $this->fetch();
    }

    //酒店删除订单
    public function delOrder(){
        $id = input('post.id');
        $result = Db::name('Hotel_order')->where(['id'=>$id])->update(['is_del'=>1]);
        if($result){
            echo json_encode(['status'=>true]);
        }else{
            echo json_encode(['status'=>false]);
        }
    }

    //机票首页
    public function airIndex(){
    	$array = array('天津','西安','三亚','青岛','桂林','哈尔滨','成都','武汉');
    	$city_name = input('post.city_name') ? input('post.city_name') : '杭州';
        $date = date('Y-m-d',strtotime("+1 day"));
        foreach ($array as $key => $value) {
        	$flight_list_info[] = $this->lowFlight($city_name,$value,$date,1);
        }
        $bus_date = date('YmdHs',strtotime('+1 day'));
        $bus_list_info = $this->bus('杭州','杭州萧山国际机场','杭州萧山国际机场','',$bus_date);//获取接送机信息
        $this -> assign('flight_list_info',$flight_list_info);
        $this -> assign('bus_list_info',$bus_list_info);
        return $this->fetch();
    } 

    //机票列表页
    public function airList(){
        if(!empty($_COOKIE['start_city'])){
            $start_val = input('post.start_val') ? input('post.start_val') : $_COOKIE['start_city'];
            $end_city = input('post.end_city') ? input('post.end_city') : $_COOKIE['end_city'];
            $date = input('post.date') ? input('post.date') : $_COOKIE['date'];
            if(!empty(Cookie::has('rdate'))){
                $rdate = $_COOKIE['rdate'];
            }else{
                $rdate = '';
            }
            $flight_list_info = $this->searchFlight($start_val,$end_city,$date,1,$rdate);
            // print_r($flight_list_info);exit;
            $this -> assign('flight_list_info',$flight_list_info['flight']);
            return $this->fetch();
        }else{
            $this->redirect('store/airindex');//重定向
        }exit;
    }
    //机票列表带返程   
    public function airListdouble(){
       if(!empty($_COOKIE['start_city'])){
            $start_val = input('post.start_val') ? input('post.start_val') : $_COOKIE['start_city'];
            $end_city = input('post.end_city') ? input('post.end_city') : $_COOKIE['end_city'];
            $date = input('post.date') ? input('post.date') : $_COOKIE['date'];
            if(!empty(Cookie::has('rdate'))){
                $rdate = $_COOKIE['rdate'];
            }else{
                $rdate = '';
            }
            $flight_list_info = $this->searchFlight($start_val,$end_city,$date,1,$rdate);
            // print_r($flight_list_info);exit;
            $this -> assign('flight_list_info',$flight_list_info['flight']);
            return $this->fetch();
        }else{
            $this->redirect('store/airindex');//重定向
        }exit;
    }
    //低价机票
    public function lowFlight($start_city='',$end_city='',$date='',$type=1){
    	$res = $this->searchFlight($start_city,$end_city,$date,$type);
    	foreach ($res['flight'] as $key => $value) {
            $air[$key] = $value['barePrice'];
        }
        // $date = date('Y-m-d',strtotime("+1 day"));
        array_multisort($air,SORT_ASC,$res['flight']);
        $res['flight'][0]['dpt_city'] = $start_city;
        $res['flight'][0]['arr_city'] = $end_city;
        $res['flight'][0]['date'] = $date;
        return $res['flight'][0];
    }

    //机票搜索
    public function searchFlight($start_city='',$end_city='',$date='',$type='',$rdate=''){
		$createTime = time();
		$start = input('post.start_city') ? input('post.start_city') : $start_city;
		$end = input('post.end_city') ? input('post.end_city') : $end_city;
        $date = input('post.date') ? input('post.date') : $date;
        $rdate = input('post.rdate') ? input('post.rdate') : $rdate;
        setcookie('start_city',$start);
        setcookie('end_city',$end);
        setcookie('date',$date);
        setcookie('rdate',$rdate);
        $result= $this->changeThreeWord($start);
        if(empty($result)){
            $return = array('status'=>'false','flight'=>'');
            echo json_encode($return);
            exit;
        }
        foreach ($result as $start_val){
            break;
        }
        $result= $this->changeThreeWord($end);
        foreach ($result as $end_val){
            break;
        }
        $params = json_encode(array(
                    'dpt'=>"$start_val",
                    'arr'=>"$end_val",
                    'date'=>$date,
                    'ex_track'=>'tehui'
                ));
        $sign   = md5('createTime='.$createTime.'key=6178322b4842d39dba955decb330d534params='.$params.'tag=flight.national.supply.sl.searchflighttoken=aef2cd32710926403bfa70170bbf205d');
        $url     = "http://qae.qunar.com/api/router?sign=$sign&tag=flight.national.supply.sl.searchflight&token=aef2cd32710926403bfa70170bbf205d&createTime=$createTime&params=$params";
        $res = file_get_contents($url);
        $res = json_decode($res);
        // print_r($res);exit;
        if($res->message == 'SUCCESS'){
	        $flightInfos = $res->result->flightInfos;
	        $flightInfos = json_decode(json_encode($flightInfos),true);
            $station   = include(dirname(__FILE__).'\airport.php');
            foreach ($flightInfos as $key => &$value) {
                $value['airlines'] = $station[$value['carrier']];
            }
            // print_r($flightInfos);exit;
            $dep_time1 = '10:00';
            $dep_time2 = '00:00';
            $f1=array();
            if($dep_time1){
                foreach ($flightInfos as $k => $v) {
                    if($v['dptTime']>=$dep_time2&&$v['dptTime']<=$dep_time1){
                        $f1[]=$v;
                    }
                }
            }
            // print_r($f1);exit;
            $return['status']='true';
            $return['flight']=$flightInfos;
	        if(!empty($type)){
		        //对航班根据barePrice排序
		        // foreach ($res as $key => $value) {
		        //     $air[$key] = $value['barePrice'];
		        // }
		        // array_multisort($air,SORT_ASC,$res);
		        // $res[0]['dpt_city'] = $start;
		        // $res[0]['arr_city'] = $end;
		        // $res[0]['date'] = $date;
		        // $flightInfos['total'] = json_decode($res)->result->total;
		        // $return['total']=$res->result->total;
	        	return $return;
	        }else{
	        	echo json_encode($return,true);
	        }
        }else{
            $this->error('未知错误','index/index');
        	// $return = array('status'=>'false','flight'=>'');
        	if(!empty($type)){
        		return $return;
        	}else{
        		echo json_encode($return);
        	}
        }
	}

    //机票报价搜索
    public function searchPrice(){
        $data = input('post.');
        // print_r($data);exit;
        /*$start_city = input('post.start_city') ? input('post.start_city') : '北京';
        $end_city = input('post.end_city') ? input('post.end_city') : '上海';
        $date = input('post.date') ? input('post.date') : '2018-06-16';
        $filght_num = input('post.filght_num') ? input('post.filght_num') : 'MU5130';*/
        $result= $this->changeThreeWord($data['start_city']);
        foreach ($result as $start_val){
            break;
        }
        $result= $this->changeThreeWord($data['end_city']);
        foreach ($result as $end_val){
            break;
        }
        $createTime = time();
        $params = json_encode(array(
                                'dpt'=>"$start_val",
                                'arr'=>"$end_val",
                                'date'=>$data['date'],
                                'flightNum'=>$data['flight_num'],
                                'ex_track'=>'youxuan'
                                ));
        // print_r($params);
        $sign   = md5('createTime='.$createTime.'key=6178322b4842d39dba955decb330d534params='.$params.'tag=flight.national.supply.sl.searchpricetoken=aef2cd32710926403bfa70170bbf205d');
        $url    = "http://qae.qunar.com/api/router?sign=$sign&tag=flight.national.supply.sl.searchprice&token=aef2cd32710926403bfa70170bbf205d&createTime=$createTime&params=$params";
        // echo $url;exit;
        $res = json_decode(file_get_contents($url),true);
        // $return = json_decode(json_encode($res),true);
        // $result = $res->result;
        $result = $res['result'];
        // print_r($result);exit;
        foreach ($result['vendors'] as $key => &$value) {
            $value['flightNum'] = $result['code'];
            $value['dpt'] = $result['depCode'];
            $value['arr'] = $result['arrCode'];
            $value['dptDate'] = str_replace('-', '', $result['date']);
            $value['dptTime'] = $result['btime'];
            $value['carrier'] = $result['carrier'];
            $value['depCode'] = $result['depCode'];
            $value['arrCode'] = $result['arrCode'];
            $value['date'] = $result['date'];
            // print_r($value);
            $value['bag'] = $this->flightBag($value);
            $value['tgq'] = $this->flightTgq($value);
        }
        // foreach ($result->vendors as $key => &$value) {
        //     $value->flightNum = $result->code;
        //     $value->dpt = $result->depCode;
        //     $value->arr = $result->arrCode;
        //     $value->dptDate = str_replace('-', '', $result->date);
        //     $value->dptTime = $result->btime;
        //     $value->carrier = $result->carrier;
        //     $value->depCode = $result->depCode;
        //     $value->arrCode = $result->arrCode;
        //     $value->date = $result->date;
        //     // print_r($value);
        //     $value->bag = false;
        //     $value->tgq = false;
        // }
        echo json_encode($result,true);
    }

    //机票退改签说明查询接口
    public function flightTgq($data){
        // print_r($data);exit;
        $createTime = time();
        $params = json_encode(
            array(
                'flightNum' => $data['flightNum'],//航班号,报价返回code
                'cabin' => $data['cabin'],//舱位,报价返回cabin
                'dpt' => $data['dpt'],//出发机场三字码 报价返回depCode
                'arr' => $data['arr'],//到达机场三字码 报价返回arrCode
                'dptDate' => $data['dptDate'],//需要计算的退改签的日期 报价返回date（注意此处格式无‘-’，需要转换）
                'dptTime' => $data['dptTime'],//起飞时间    报价返回btime
                'policyId' => $data['policyId'],//政策ID  报价返回policyId
                'maxSellPrice' => $data['basePrice'],//最大销售价 报价搜索返回bareprice
                'minSellPrice' => $data['basePrice'],//最小销售价 报价搜索返回bareprice
                'printPrice' => $data['vppr'],//票面价   报价返回vppr
                'tagName' => $data['prtag'],//价格类型    报价返回prtag
                'translate' => false,//是否翻译    默认传：false
                'sfid' => $data['groupId'],//群组id  报价返回groupId
                'needPercentTgqText' => false,//是否需要展示百分比文本   默认传false
                'businessExt' => $data['businessExt'],//扩展信息    报价返回businessExt
                'client'=>$data['domain'],//代理商域名
            ));
        // print_r($params);echo '<br>';
        $sign   = md5('createTime='.$createTime.'key=6178322b4842d39dba955decb330d534params='.$params.'tag=flight.national.supply.sl.tgqNewtoken=aef2cd32710926403bfa70170bbf205d');
        $params = urlencode($params);
        $url     = "http://qae.qunar.com/api/router?sign=$sign&tag=flight.national.supply.sl.tgqNew&token=aef2cd32710926403bfa70170bbf205d&createTime=$createTime&params=$params";
        $res = file_get_contents($url);
        // print_r($res);exit;
        $res = json_decode($res,true);
        if($res['code'] == 0 && $res['message'] == 'SUCCESS'){
            return $res['result'];
        }else{
            return false;
        }
    }

    //行李额接口
    public function flightBag($data){
        $createTime = time();
        $params = json_encode(
            array(
                'airlineCode' => $data['carrier'],//航司二字码,airlineCode
                'cabin' => $data['cabin'],//舱位,报价返回cabin
                'depCode' => $data['depCode'],//出发机场三字码 报价返回depCode
                'arrCode' => $data['arrCode'],//到达机场三字码 报价返回arrCode
                'saleDate' => $data['date'],//销售日期 （同出行日期），saleDate
                'depDate' => $data['date'],//出行日期,depDate
                'luggage' => $data['luggage'],//行李额标识,luggage
            ));
        // print_r($params);echo '<br>';
        $sign   = md5('createTime='.$createTime.'key=6178322b4842d39dba955decb330d534params='.$params.'tag=flight.national.supply.sl.baggageruletoken=aef2cd32710926403bfa70170bbf205d');
        $params = urlencode($params);
        $url     = "http://qae.qunar.com/api/router?sign=$sign&tag=flight.national.supply.sl.baggagerule&token=aef2cd32710926403bfa70170bbf205d&createTime=$createTime&params=$params";
        $res = file_get_contents($url);
        $res = json_decode($res,true);
        // print_r($res);exit;
        if($res['code'] == 0 && $res['message'] == 'SUCCESS'){
            return $res['result']['specialRules'];
        }else{
            return false;
        }
    }

    //获取毫秒时间戳
    public function getMsecTime(){
        list($msec, $sec) = explode(' ', microtime());
        $msectime =  (float)sprintf('%.0f', (floatval($msec) + floatval($sec)) * 1000);
        return $msectime;
    }

    //BK接口
    public function flightBK(){
        $post = input('post.');
        $vppr = input('post.vppr');
        $barePrice = input('post.barePrice');
        $basePrice = input('post.basePrice');
        $price = input('post.price');//booking价
        $businessExt = input('post.businessExt');
        $prtag = input('post.prtag');
        $carrier = input('post.carrier');
        $code = input('post.code');
        $cabin = input('post.cabin');
        $depCode = input('post.depCode');
        $arrCode = input('post.arrCode');
        $policyType = input('post.policyType');
        $date = str_replace('-','',input('post.date'));
        $policyId = input('post.policyId');
        // $btime = str_replace(':','',input('post.btime'));
        $btime = input('post.btime');
        $wrapperId = input('post.wrapperId');
        $client = input('post.domain');
        $airtype = input('post.airtype');
        setcookie('airtype',$airtype);
        $createTime = $this->getMsecTime();
        $params = json_encode(array(
                    'ticketPrice'=>$vppr,//票面价
                    'barePrice'=>$barePrice,//裸票价
                    'price'=>$barePrice,//booking价
                    'basePrice'=>$basePrice,//政策价
                    'businessExt'=>$businessExt,//业务扩展字段
                    'tag'=>$prtag,//产品Tag
                    'carrier'=>$carrier,//航司
                    'flightNum'=>$code,//航班号
                    'cabin'=>$cabin,//舱位
                    'from'=>$depCode,//起飞机场三字码
                    'to'=>$arrCode,//到达机场三字码
                    'policyType'=>$policyType,//政策类型
                    'wrapperId'=>$wrapperId,//
                    'startTime'=>$date,//起飞日期
                    'client'=>$client,//代理商域名
                    'policyId'=>$policyId,//政策id
                    'dptTime'=>$btime,//起飞时间
                    'flightType'=>'1',//航程类型。固定值1,表示单程
                    'userName'=>'hwcaqfz3594'//去哪儿用户名
                ));
        $sign   = md5('createTime='.$createTime.'key=6178322b4842d39dba955decb330d534params='.$params.'tag=flight.national.supply.sl.bktoken=aef2cd32710926403bfa70170bbf205d');
        $params = urlencode($params);
        $url     = 'http://qae.qunar.com/api/router?sign='.$sign.'&tag=flight.national.supply.sl.bk&token=aef2cd32710926403bfa70170bbf205d&createTime='.$createTime.'&'.'params='.$params;
        $res = file_get_contents($url);
        $res = json_decode($res,true);
        if($res['code'] == 0 && $res['message'] == 'SUCCESS' && !empty($res['result'])){
            $status = true;
        }else{
            $status = false;
        }
        echo json_encode(['status'=>$status,'data'=>$res],JSON_UNESCAPED_UNICODE);

    }

    //机票提交订单页面
    public function airForm(){
        $contacts = $this->contacts();
        $this->assign('contacts',$contacts);
        return $this->fetch();
    }

    //机票订单生成
    public function orderCreate(){
        $create_time = time();
        if(request()->isPost()){
            $result = input('post.result/a');
            $post = input('post.');
            $tag = $result['extInfo']['tag'];
            $tof = $result['priceInfo']['tof'];
            $children_tof = $result['priceInfo']['childtof'];
            $construction_fee = $result['priceInfo']['arf'];
            $view_price = $result['priceInfo']['priceTag']['ADU'][0]['viewPrice'];
            $passenger_price_tag = $result['priceInfo']['priceTag']['ADU'][0]['tag'];
            $ticket_pirce = $result['extInfo']['ticketPirce'];
            $child_print_price = $result['priceInfo']['childTicketPrice'];//有时为零
            $discount = $result['priceInfo']['discount'];
            $policy_type = $result['extInfo']['policyType'];
            $policy_id = $result['extInfo']['policyId'];
            $contact = input('post.contact') ? input('post.contact') : '';
            $phone = input('post.contactMob') ? input('post.contactMob') : '';
            $contact_email = input('post.contactEmail') ? input('post.contactEmail') : '';
            // $contact_email = $post['contactEmail'];
            $invoice_type = array_key_exists('2',$result['expressInfo']['invoiceType']) ? 2 : 1;
            // print_r($invoice_type);exit;
            // $receiver_title = $post['receiverTitle'];
            // $receiver_type = $post['receiverType'];
            // $taxpayer_id = $post['taxpayerId'];
            // $sjr_name = $post['sjr'];
            // $sjr_phone = $post['sjrPhone'];
            // $sjr_address = $post['address'];
            // $xcd = $post['xcd'];
            // $bxInvoice = $post['bxInvoice'];
            $flight_num = $result['flightInfo'][0]['flightNum'];
            // $gx = $result['flightInfo'][0]['actFlightNum'];
            $stop_info = $result['flightInfo'][0]['stops'];
            $dpt = $result['flightInfo'][0]['dpt'];
            $arr = $result['flightInfo'][0]['arr'];
            $dpt_city = $result['flightInfo'][0]['dptCity'];
            $arr_city = $result['flightInfo'][0]['arrCity'];
            $dpt_date = $result['flightInfo'][0]['dptDate'];
            $dpt_time = $result['flightInfo'][0]['dptTime'];
            $arr_time = $result['flightInfo'][0]['arrTime'];
            $dpt_time = str_replace(':','',$dpt_time);
            $arr_time = str_replace(':','',$arr_time);
            $cabin = $result['flightInfo'][0]['cabin'];
            $child_cabin = $result['flightInfo'][0]['childCabin'];
            $passengers = input('post.passengers/a');
            $all_price = 0;
            foreach ($passengers as $key => &$value) {
                $bir = substr($value['cardNo'],6,8);
                $value['birthday'] = substr($bir,0,4).'-'.substr($bir,4,2).'-'.substr($bir,6,2);
                $value['bx'] = false; 
                $value['flightDelayBx'] = false; 
                $value['tuipiaoBx'] = false; 
                if($value['ageType'] == 0){
                    $all_price = $all_price+$result['priceInfo']['priceTag']['ADU'][0]['viewPrice']+$construction_fee;
                    $value['passengerPriceTag'] = $result['priceInfo']['priceTag']['ADU'][0]['tag'];
                }else{
                    $all_price = $all_price+$result['priceInfo']['priceTag']['CHI'][0]['viewPrice'];
                    $value['passengerPriceTag'] = $result['priceInfo']['priceTag']['CHI'][0]['tag'];
                }
            }
            $booking_tag = $result['bookingTag'];
            $qt = $result['extInfo']['qt'];
            $clientSite = $result['extInfo']['clientId'];
            $receiver_title = input('post.receiverTitle') ? input('post.receiverTitle') : '';
            $receiver_type = input('post.receiverType') ? input('post.receiverType') : '';
            $taxpayer_id = input('post.taxpayerId') ? input('post.taxpayerId') : '';
            $sjr_name = input('post.sjrName') ? input('post.sjrName') : '';
            $sjr_phone = input('post.sjrPhone') ? input('post.sjrPhone') : '';
            $sjr_address = input('post.sjrAddress') ? input('post.sjrAddress') : '';
            $xcd = input('post.xcd') ? input('post.xcd') : '';
            $xcd_method = input('post.xcdMethod') ? input('post.xcdMethod') : '';
            $passenger_count = count($passengers);
            $params = json_encode(array(
                        'productTag'=>$tag,//产品类型,Booking返回extInfo中tag
                        // 'insureTag'=>'',//保险tag
                        'flyFund'=>false,//是否用飞基金
                        'isUseBonus'=>false,//是否可以使用红包
                        'fuelTax'=>$tof,//燃油税
                        // 'childFuelTax'=>$children_tof,//儿童燃油税
                        'constructionFee'=>$construction_fee,//机建费
                        'printPrice'=>$view_price,//票面价,ADU下viewPrice
                        'yPrice'=>$ticket_pirce,//公布运价,extInfo下面ticketPrice
                        'childPrintPrice'=>$child_print_price,//儿童票面价
                        // 'discount'=>$discount,//票面价折扣
                        // 'policyType'=>$policy_type,//政策
                        // 'policyId'=>$policy_id,//政策id
                        // 'type'=>'',//暂时无用,设置为空
                        'contact'=>$contact,//联系人姓名
                        'contactPreNum'=>'86',//国家区位码
                        'contactMob'=>$phone,//联系人电话
                        'contactEmail'=>$contact_email,//联系人邮箱
                        'invoiceType'=>$invoice_type,//发票类型
                        'receiverTitle'=>$receiver_title,//发票抬头
                        'receiverType'=>$receiver_type,//抬头类型，个人为2，若为单位、企业，都传3
                        'taxpayerId'=>$taxpayer_id,//纳税人识别号
                        'sjr'=>$sjr_name,//收件人姓名
                        'sjrPhone'=>$sjr_phone,//收件人电话
                        'address'=>$sjr_address,//收件人地址
                        'xcd'=>"",//是否邮寄行程单，"1"：勾选 ，""：未勾选
                        'xcdMethod'=>'',//xcd_config表中的id，暂时不需要，设置为空串当xcd传“1”时，此处必填，传8
                        // 'xcdPrice'=>'',//快递费
                        'bxInvoice'=>'',//是否勾选保险发票选项，"1"：勾选，""：未勾选
                        'flightInfo'=>array(
                            'flightNum'=>$flight_num,//航班号
                            'gx'=>'',//共享航班号
                            'flightType'=>'1',//行程类型 1:单程，2：往返
                            'stopInfo'=>$stop_info,//经停数
                            'deptAirportCode'=>$dpt,//出发机场，大写，三字码
                            'arriAirportCode'=>$arr,//到达机场，大写，三字码
                            'deptCity'=>$dpt_city,//出发城市，汉字
                            'arriCity'=>$arr_city,//到达城市，汉字
                            'deptDate'=>$dpt_date,//出发日期
                            'deptTime'=>$dpt_time,//出发时间
                            'arriTime'=>$arr_time,//到达时间
                            'cabin'=>$cabin,//舱位
                            'childCabin'=>$child_cabin//儿童舱位
                        ),
                        'passengerCount'=>$passenger_count,//乘机人数
                        'passengers'=>$passengers,
                        'bookingTag'=>$booking_tag,//booking返回结果中的 bookingTag
                        'qt'=>$qt,//主站一次booking跳转唯一码
                        'source'=>'web.baituor.yyl',//订单来源
                        'clientSite'=>$clientSite//代理商域名
                    ));
            $sign   = md5('createTime='.$create_time.'key=6178322b4842d39dba955decb330d534params='.$params.'tag=flight.national.supply.sl.ordertoken=aef2cd32710926403bfa70170bbf205d');
            // echo $params;exit;
            $params = urlencode($params);
            $url    = "http://qae.qunar.com/api/router?sign=$sign&tag=flight.national.supply.sl.order&token=aef2cd32710926403bfa70170bbf205d&createTime=$create_time&params=$params";
            $res = file_get_contents($url);
            $res = json_decode($res,true);
            if($res['code'] == 0 && $res['message'] == 'SUCCESS'){
                $airtype = $_COOKIE['airtype'];
                $result['flightInfo'][0]['airtype'] = $airtype;
                $id = DB::name('flight_order')->insertGetId(['order_id'=>$res['result']['id'],'order_no'=>$res['result']['orderNo'],'flight_info'=>json_encode($result['flightInfo'][0]),'passengers'=>json_encode($passengers),'contact'=>$contact,'contact_mob'=>$phone,'contact_email'=>$contact_email,'create_time'=>$create_time,'policy_info'=>json_encode($result['policyInfo']['specialRule']),'charge_info'=>json_encode($result['tgqShowData']),'child_print_price'=>$child_print_price,'print_price'=>$ticket_pirce,'bare_price'=>$result['priceInfo']['priceTag']['ADU'][0]['viewPrice'],'child_bare_price'=>$result['priceInfo']['priceTag']['CHI'][0]['viewPrice'],'all_price'=>$all_price,'client_site'=>$clientSite]);
                $status = true;
            }else{
                $status = false;
            }
        }
        echo json_encode(['status'=>$status,'message'=>$res['message'],'traffic_id'=>$id]);
    }

    //支付校验接口
    public function flightPayValidate($out_trade_no=''){
        // $out_trade_no = 'flight1548922921';
        $order_id = Db::name('Flight_order')->field('order_id,client_site')->where('pay_order_id',$out_trade_no)->find();
        $createTime = $this->getMsecTime();
        $params = json_encode(array(
                'clientSite'=>$order_id['client_site'],//代理商域名
                'orderId' => $order_id['order_id'],//机票订单ID(生单接口返回的),不是orderNo
                'pmCode'=>'DAIKOU',//支付方式,OUTDAIKOU（第三方余额代扣）DAIKOU（qunar余额代扣）
                'bankCode'=>'QUNARPAY',//QUNARPAY商户余额代扣ALIPAY支付宝余额代扣YEEPAY易宝余额代扣
            ));
        $sign   = md5('createTime='.$createTime.'key=6178322b4842d39dba955decb330d534params='.$params.'tag=flight.national.supply.sl.payValidatetoken=aef2cd32710926403bfa70170bbf205d');
        $params = urlencode($params);
        $url     = "http://qae.qunar.com/api/router?sign=$sign&tag=flight.national.supply.sl.payValidate&token=aef2cd32710926403bfa70170bbf205d&createTime=$createTime&params=$params";
        $res = file_get_contents($url);
        // echo $res;exit;
        $res = json_decode($res,true);
        if($res['code'] == 0 && $res['message'] == 'SUCCESS'){
            $status = true;
            $this->flightPay($order_id['order_id'],$order_id['client_site']);
        }else{
            $status = false;
        }
        echo json_encode(['status'=>$status],JSON_UNESCAPED_UNICODE);

    }
    //机票支付
    public function flightPay($order_id='',$client_site=''){
        $createTime = time();
        $params = json_encode(array(
                'clientSite'=>$client_site,//代理商域名
                'orderId' => $order_id,//机票订单ID(生单接口返回的),不是orderNo
                // 'orderNo' => 'xep190131153943849',
                'pmCode'=>'DAIKOU',//支付方式,OUTDAIKOU（第三方余额代扣）DAIKOU（qunar余额代扣）
                'bankCode'=>'QUNARPAY',//QUNARPAY商户余额代扣ALIPAY支付宝余额代扣YEEPAY易宝余额代扣
                'paymentMerchantCode'=>'hwcaqfz3594',//付款账户
                'curId'=>'CNY',//货币代码
                'bgRetUrl'=>'http://a.5199yl.com/portal/store/flightReceive.html',//支付回调地址 Y
                // 'customerIp'=>'',//付款方IP N
                // 'validTime'=>$valid_time,//过期时间 N
                // 'productName'=>$product_name,//商品名称 N
                // 'productId'=>$product_id,//商品编号 N
                // 'productDetail'=>$product_detail,//订单详情 N
                // 'accountRemark'=>$account_remark,//账务备注 N
            ));
        // print_r($params);echo '<br>';exit;
        $sign   = md5('createTime='.$createTime.'key=6178322b4842d39dba955decb330d534params='.$params.'tag=flight.national.supply.sl.paytoken=aef2cd32710926403bfa70170bbf205d');
        $params = urlencode($params);
        $url     = "http://qae.qunar.com/api/router?sign=$sign&tag=flight.national.supply.sl.pay&token=aef2cd32710926403bfa70170bbf205d&createTime=$createTime&params=$params";
        $res = file_get_contents($url);
        // print_r(json_decode($res));exit;
        $res = json_decode($res,true);
        if($res['code'] == 0 && $res['message'] == 'SUCCESS'){
            $db = DB::name('flight_order');
            $order = $db->field('flight_info,contact_mob')->where('order_id',$order_id)->find();
            $order_info = json_decode($order['flight_info'],true);
            vendor('duanxin.sendAPI'); //引进短信接口API
            $sms_text = "【袋鹿旅行】欢迎预定".$order_info['carrierName'].$order_info['flightNum'].'航班'.$order_info['cbcn']."。如有疑问请联系客服";
            $data = [];
            $data['uid']=$order_info['uid'];
            $data['sendto']='user';
            $data['type']='wapregCode2';
            //调用短信接口
            $sendArr = array(
                'content'   => $sms_text,     //短信内容
                'mobile'    => $order['contact_mob']         //手机号码
            );
            $url        = "http://www.api.zthysms.com/sendSms.do";
            $username   = 'YRCWhy';
            $password   = 'Yrcw123456';
            $ucpass = new \sendAPI($url, $username, $password); //这里第一个反斜杠是必须要有的。 
            $ucpass->send_sms($order['contact_mob'],$sms_text,$sendArr,$data);
            DB::name('flight_order')->where('order_id',$order_id)->update(['chupiao'=>1]);
        }
        // echo json_encode($res,true);
    }

    //机票火车票支付页公共
    public function trafficPay(){
        $order_id = input('get.traffic_id') ? input('get.traffic_id') : '9';
        $type = input('get.type') ? input('get.type') : '';
        $type = 'flight';
        if($type == 'flight'){
            $order_info = Db::name('flight_order')->where('id',$order_id)->find();
        }else{

        }
        if(empty($order_info)){
            // $this->error('非法提交','www.dailuer.com');
        }
        $this->assign('order_info',$order_info);
        return $this->fetch();
    }

    //机票订单详情
    public function airDetails($order_no){
        $local_detail = Db::name('flight_order')->where('order_no',$order_no)->find();
        $local_detail['flight_info'] = json_decode($local_detail['flight_info'],true);
        $local_detail['passengers'] = json_decode($local_detail['passengers'],true);
        $local_detail['policy_info'] = json_decode($local_detail['policy_info'],true);
        $local_detail['charge_info'] = json_decode($local_detail['charge_info'],true);
        // print_r($local_detail);
        $createTime = time();
        $params = json_encode(array(
                'orderNo' => $order_no,
                // 'orderNo' => 'xep190115102118189',
            ));
        $sign   = md5('createTime='.$createTime.'key=6178322b4842d39dba955decb330d534params='.$params.'tag=flight.national.tts.order.info.detail.gettoken=aef2cd32710926403bfa70170bbf205d');
        $params = urlencode($params);
        $url     = "http://qae.qunar.com/api/router?sign=$sign&tag=flight.national.tts.order.info.detail.get&token=aef2cd32710926403bfa70170bbf205d&createTime=$createTime&params=$params";
        $res = file_get_contents($url);
        $air_detail = json_decode($res,true);
        // print_r($air_detail);exit;
        $data['local_detail'] = $local_detail;
        $data['air_detail'] = $air_detail;
        return $data;
    }

    //机票订单详情
    public function airOrderdetails(){
        $order_no = input('get.order_id');
        $order_detail = $this->airDetails($order_no);
        $refund_info = $this->airRefundSearch($order_no);
        // print_r($refund_info);exit;
        $this->assign('refund_info',$refund_info);
        $this->assign('order_detail',$order_detail);
        return $this->fetch();
    }

    //机票退款页
    public function airMoneyback(){
        $order_no = input('get.order_id');
        // $order_no = 'xep190115102118189';
        $order_detail = $this->airDetails($order_no);
        $refund_info = $this->airRefundSearch($order_no);
        // print_r($refund_info);
        $this->assign('refund_info',$refund_info);
        $this->assign('order_detail',$order_detail);
        return $this->fetch();
    }

    //机票申请退款
    public function airRefund(){
        $post = input('post.');
        // $id = json_encode(input('post.id/a'));
        $passengers_info = json_encode(input('post.passengers/a'));
        $result = Db::name('order_cancel')->insert(['order_id'=>$post['order_no'],'passenger_info'=>$passengers_info,'order_type'=>'flight','cause'=>$post['backreason'],'orther_cause'=>$post['describe'],'create_time'=>date('Y-m-d H:i:s')]);
        if($result){
            $status = true;
            $msg = '申请成功';
        }else{
            $status = false;
            $msg = '申请失败,请联系客服';
        }
        echo json_encode(['status'=>$status,'msg'=>$msg]);
    }


    //机票退票查询接口
    public function airRefundSearch($order_no){
        $createTime = time();
        $params = json_encode(array(
                'orderNo' => $order_no
            ));
        $sign   = md5('createTime='.$createTime.'key=6178322b4842d39dba955decb330d534params='.$params.'tag=flight.national.supply.sl.refundSearchtoken=aef2cd32710926403bfa70170bbf205d');
        $params = urlencode($params);
        $url     = "http://qae.qunar.com/api/router?sign=$sign&tag=flight.national.supply.sl.refundSearch&token=aef2cd32710926403bfa70170bbf205d&createTime=$createTime&params=$params";
        $res = file_get_contents($url);
        $res = json_decode($res,true);
        if($res['code'] == 0 && $res['message'] == 'SUCCESS'){
            return $res['result'];
        }
    }


    //机票退票申请接口
    public function airApplyRefund(){
        // print_r($local_detail);
        $createTime = time();
        $params = json_encode(array(
                // 'orderNo' => $order_no,
                'orderNo' => 'xep190115102118189',
                'refundCauseId' => 'xep190115102118189',
                'orderNo' => 'xep190115102118189',
            ));
        $sign   = md5('createTime='.$createTime.'key=6178322b4842d39dba955decb330d534params='.$params.'tag=flight.national.supply.sl.applyRefundtoken=aef2cd32710926403bfa70170bbf205d');
        $params = urlencode($params);
        $url     = "http://qae.qunar.com/api/router?sign=$sign&tag=flight.national.supply.sl.applyRefund&token=aef2cd32710926403bfa70170bbf205d&createTime=$createTime&params=$params";
        $res = file_get_contents($url);
        $air_detail = json_decode($res,true);
    }

    //交通支付完成页面
    public function trafficPaySuccess(){
        return $this->fetch();
    }

    //通过高德api获取指定地点的经纬度
    public function addresstolatlag($address){
	    $url='http://restapi.amap.com/v3/geocode/geo?address='.$address.'&key=93af143f0b140e3199b29d1084733ea7';
	    if($result=file_get_contents($url)){
	        $result = json_decode($result,true);
	        //判断是否成功
	        if(!empty($result['count'])){
	            return  explode(',',$result['geocodes']['0']['location']);
	        }else{
	            return false;
	        }

	    }
	}

    //巴士
    public function bus($city='',$dep='',$arr='',$car=[1,2,3,4,5,14],$date=''){
    	$time = date('YmdHsi');
    	$citys = include(dirname(__FILE__).'\city.php');
    	$xml = simplexml_load_file(dirname(__FILE__)."\city.xml");
    	$dept_airport = input('post.dept_airport') ? input('post.dept_airport') : $dep;
        $arr_airport = input('post.arr_airport') ? input('post.arr_airport') : $arr;
    	$date = input('post.date') ? input('post.date') : $date;
    	$dep = $this->addresstolatlag($dept_airport);
    	$arr = $this->addresstolatlag($arr_airport);
    	$pattern_type = input('post.pattern_type') ? input('post.pattern_type') : 1;
        if($pattern_type == 1){
	    	foreach($xml->state as $state){
	            foreach($state->children() as $air_code){
	                if($dept_airport==$air_code){
	            		$fixed_code = $air_code->attributes();
	                }
	            }
	        }
    	}else{
    		foreach($xml->state as $state){
	            foreach($state->children() as $air_code){
	                if($arr_airport==$air_code){
	            		$fixed_code = $air_code->attributes();
	                }
	            }
	        }
    	}
	    $fixed_code = "$fixed_code";
    	$city_name = input('post.city_name') ? input('post.city_name') : $city;
    	foreach ($citys as $key => $value) {
    		if($city_name == $value['name']){
    			$city_code = $value['id'];
    		}
    	}
    	$car_type = input('post.car_type') ? input('post.car_type') : $car;
    	$data = array(
    		'UseType'=>'1',//1-接送机,2 -接送火车
    		'Pattern_type'=>$pattern_type,//用车形态（1-接机，2-送机）
    		'CityCode'=>$city_code,//城市 Code，ID
    		'VehicleTypeList'=>$car_type,//用车类型
    		'DuseLocationDetailAddress'=>$dept_airport,//出发详细地址
    		'DuseLocationAddress'=>$dept_airport,//出发地址
    		'DuseLocationLongitude'=>$dep[0],//出发经度
    		'DuseLocationLatitude'=>$dep[1],//出发纬度
    		'AuseLocationAdd'=>$arr_airport,//到达详细地址
    		'AuseLocationDetailAddress'=>$arr_airport,//到达地址
    		'AuseLocationLongitude'=>$arr[0],//到达经度
    		'AuseLocationLatitude'=>$arr[1],//到达纬度
    		'UseTime'=>$date,//用车时间
    		'FixedCode'=>$fixed_code//机场三字码
    	);
    	$data_json = json_encode($data,JSON_UNESCAPED_UNICODE);
    	// print_r($data_json);
        $dec = $this->encrypt($data_json,'12345678');
        // print_r($dec);
        $lenth = strlen($dec);
        $sign = md5("5bus1.5Bus".$time."12345678".$lenth);
        $url ="http://112.74.68.23:9999/Bus/ProductQuery/1.5/".$time."/".$sign."/JCBS";
        $res = $this->request($url,$https=false,$method='post',$dec);
        $res = json_decode($res);
        // print_r($res);
        if($res->MsgCode =='OK'){
        	$return = json_decode(json_encode($res->QueryResultList),true);
        	if(!empty($city)){
        		return $return;
        	}else{
        		echo json_encode($return);
        	}
        }else{
        	$return = array('status'=>false);
        	if(!empty($city)){
        		return $return;
        	}else{
        		echo json_encode($return);
        	}
        }
        
    }

    //包车首页
    public function busIndex(){
        $bus_date = date('YmdHs',strtotime('+1 day'));
    	$data = $this->bus('杭州','杭州萧山国际机场','杭州萧山国际机场','',$bus_date);
    	// if($data->MsgCode == 'OK'){
    	// 	$dataInfo = json_decode(json_encode($data->QueryResultList));
    	// }
    	print_r($data);
        // return $this->fetch();
    }

    //火车票首页
    public function trainIndex(){
        $ip = get_client_ip();
        $city_info = get_ip_lookup($ip);//获取当前城市
        $city_info = get_ip_lookup('115.236.182.122');//获取当前城市
        $local_city = $city_info;
        // $local_city = '杭州市';
        $arrival_date = date('Y-m-d',strtotime('+1 day'));
        $departure_date = date('Y-m-d',strtotime('+1 day',strtotime($arrival_date)));
        $date = date('m-d',strtotime('+1 day'));
        $hotel_list = $this->hotel($local_city,$zone_id='',$theme_id='',$arrival_date,$departure_date,$sort='Default',$page=3,$page_size=4);//获取酒店目的地推荐
        $array = array('天津','西安','三亚','青岛','桂林','哈尔滨','成都','武汉');
        $city_name = input('post.city_name') ? input('post.city_name') : '杭州';
        $date = date('Y-m-d',strtotime("+1 day"));
        foreach ($array as $key => $value) {
            $flight_list_info[] = $this->lowFlight($city_name,$value,$date,1);
        }
        $bus_date = date('YmdHs',strtotime('+1 day'));
        $this -> assign('flight_list_info',$flight_list_info);
        $this->assign('date',$date);
        $theme = $this->theme($local_city);
        $this -> assign('theme',array_slice($theme,0,6));
        $this->assign('hotel_list',$hotel_list['hotel']);
        return $this->fetch();
    }

    public function trainList(){
        return $this->fetch();
    }

    public function trainForm(){
        return $this->fetch();
    }

    public function trainFormprev(){
        return $this->fetch();
    }

    public function trainMoneyback(){
        return $this->fetch();
    }

    //火车票查询
    public function trainSearch(){
        $post_data = I('post.');//接收前台数据
        $start     = $post_data['startCity'];//出发地
        $end       = $post_data['endCity'];//目的地
        $startTime = $post_data['startTime'];//始发时间
        $station   = include(dirname(__FILE__).'\name.php');
        $retailId  = "FX7052709274825C095";//公司账号id
        $Dptime    = $startTime;//出发日期
        $dptCode   = $station[$start];//出发地三字码
        $eptCode   = $station[$end]; //目的地三字码
        $url       = "http://www.51bib.com/TrainSearchList.ashx";
        $body      = "data={\"retailId\":\"$retailId\",\"Dptime\":\"$Dptime\",\"dptCode\":\"$dptCode\",\"eptCode\":\"$eptCode\"}";
        $res       = $this -> request($url,$https=false,$method='post',$body);
        $content   = iconv("GB2312","UTF-8",$res);
        echo $content;
    }    

    //火车票票价查询
    public function trainPrice(){
        $post_data          = I('post.');
        $train              = $_POST['train'];
        $code               = $_POST['seat_types'];
        $order_sn           = 'train'.time().rand(10,99);
        $userinfo           = $this->user_session;
        $data['uid']        = $userinfo['uid'];
        $data['createdAt']  = date("Y-m-d H:i:s");
        $data['outOrderNo'] = $order_sn;
        $data['trainId']    = $train['trainId'];//班次ID
        $data['trainNo']    = $train['trainNo'];//班次
        $data['locationCode'] = $train['locationCode'];//
        $data['startTime']  = $train['startTime'];
        $data['arriveTime'] = $train['arriveTime'];
        $data['lastTime']   = $train['lastTime'];
        $data['startDate']  = $train['startDate'];
        $data['arriveDate'] = $train['arriveDate'];
        $data['seatTypes']  = $train['seatTypes'];
        $data['saleTime']   = $train['saleTime'];
        $data['canWebBuy']  = $train['canWebBuy'];
        $data['saleTimeInMillis'] = $train['saleTimeInMillis'];
        $data['day']        = $train['day'];
        $data['secretStr']  = $train['secretStr'];
        $data['fromStation'] = json_encode($train['fromStation']);
        $data['toStation']  = json_encode($train['toStation']);
        $data['trainSeatList'] = json_encode($train['trainSeatList']);
        $data['dptcode'] = $train['dptcode'];
        $data['eptcode'] = $train['eptcode'];
        $data['seat_types'] = $post_data['seat_types'];
        $data['totalPrice'] = $train['price'];
        $order_id = D('train_order')->data($data)->add();
        $arr = array('price'=>$train['price'],'id'=>$order_id);
        echo json_encode($arr);
    }

    // 车票下单
    public function trainCreate(){
        $data = I('post.');
        $personInfo = $_POST['personInfo'];//乘客信息
        $num = count($personInfo);
        foreach($personInfo as $visitor){
            $psgname['psgname'] = $visitor['name'];
            $psgname['psgtype'] = 2;
            $psgname['psgni'] = $visitor['cardNum'];
            $birth = substr($visitor['cardNum'],6,8);
            $psgname['birthday'] =  substr($birth,0,4).'-'.substr($birth,4,2).'-'.substr($birth,6,2);
            if($visitor['safety_state'] == '10'){
                $count ++;
            }
            $psgInfo[] = $psgname;
        }
        $order_id = $data['order_id'];
        $info = D('train_order')->where(array("order_id"=>$order_id))->find();
        if(empty($info['totalPrice'])){
            $this->error_tips('订单来源无法识别，请重试。');
        }
        $totalPrice = $info['totalPrice'];
        $fromStation = json_decode($info['fromStation']);
        $toStation = json_decode($info['toStation']);
        $trainSeatList = json_decode($info['trainSeatList']);
        foreach ($trainSeatList as $value) {
            if($info['seat_types'] == $value->code){
                $trainInfo = $value;
            }
        }
        if($data['isInvoice'] == 'true'){
            $parprice = $totalPrice*$num+$count*10+10;//用户支付价格
        }else{
            $parprice = $totalPrice*$num+$count*10;//用户支付价格
        }
        $trainId = $info['trainId'];
        $trainNo = $info['trainNo'];
        $locationCode = $info['locationCode'];
        $startTime = $info['startTime'];
        $arriveTime = $info['arriveTime'];
        $lastTime = $info['lastTime'];
        $startDate = $info['startDate'];
        $seatTypes = $info['seatTypes'];
        $saleTime = $info['saleTime'];
        $canWebBuy = $info['canWebBuy'];
        $saleTimeInMillis = $info['saleTimeInMillis'];
        $day = $info['day'];
        $secretStr = $info['secretStr'];
        $name = $fromStation->name;
        $code = $fromStation->code;
        $no  = $fromStation->no;
        $type = $fromStation->type;
        $name1 = $toStation->name;
        $code1 = $toStation->code;
        $no1  = $toStation->no;
        $type1 = $toStation->type;
        $code3 = $trainInfo->code;
        $name3 = $trainInfo->name;
        $shortName3 = $trainInfo->shortName;
        $count3 = $trainInfo->count;
        $price3 = $trainInfo->price;
        foreach ($psgInfo as $val){
            foreach ($val as $key => $value){  
                $val[$key] = urlencode($value);
            }  
            $va[] = $val;  
        }
        $psg = urldecode(json_encode($va));
        $url = "http://www.51bib.com/trainCreate.ashx";
        $body   = "flightdata={\"trainId\":\"$trainId\",\"trainNo\":\"$trainNo\",\"locationCode\":\"$locationCode\",\"startTime\":\"$startTime\",\"arriveTime\":\"$arriveTime\",\"lastTime\":\"$lastTime\",\"startDate\":\"$startDate\",\"seatTypes\":\"$seatTypes\",\"saleTime\":\"$saleTime\",\"canWebBuy\":\"$canWebBuy\",\"saleTimeInMillis\":$saleTimeInMillis,\"day\":$day,\"secretStr\":\"$secretStr\",\"fromStation\":{\"name\":\"$name\",\"code\":\"$code\",\"no\":\"$no\",\"type\":\"$type\"},\"toStation\":{\"name\":\"$name1\",\"code\":\"$code1\",\"no\":\"$no1\",\"type\":\"$type1\"},\"trainSeatList\":[{\"code\":\"$code3\",\"name\":\"$name3\",\"shortName\":\"$shortName3\",\"count\":$count3,\"price\":$price3}],\"arriveDate\":\"20170523\",\"dptcode\":\"null\",\"eptcode\":\"null\"}&cabindata={\"code\":\"$code3\",\"name\":\"$name3\",\"shortName\":\"$shortName3\",\"count\":$count3,\"price\":$price3}&psgdata=$psg&traindata={\"trainuser\":\"\",\"trainpassword\":\"\"}&linkmobile=18014261253&retailid=FX7052709274825C095";
        $res     = $this -> request($url,$https=false,$method='post',$body);
        $content = iconv("GB2312","UTF-8",$res);
        //保险
        $options = array(
                'trace'                 => true,
                'encoding'              => 'UTF-8',
                'connection_timeout'    => 120,
                'soap_version'          => SOAP_1_1,
                'compression'           => SOAP_COMPRESSION_ACCEPT | SOAP_COMPRESSION_GZIP,
                'keep_alive'            => true
            );
            $outPolicyNo = 'insurance'.time().rand(10,99);
            $startDate = substr($info['startDate'],0,4).'-'.substr($info['startDate'],4,2).'-'.substr($info['startDate'],6,2);
            $a=$startDate.','.$info['startTime'].':00';
            $beginDate = str_replace(',',' ',$a);
            $endDate = substr($info['arriveDate'],0,4).'-'.substr($info['arriveDate'],4,2).'-'.substr($info['arriveDate'],6,2);
            $b=$endDate.','.$info['arriveTime'].':00';
            $endDate = str_replace(',',' ',$b);
            $soap = new SoapClient("http://ws.51book.com:8000/ltips/services/insuranceProductService1.0?wsdl",$options);
            for($i=0;$i<$num;$i++){
                if($personInfo[$i]['safety_state'] == '10'){
                    $outNo[]= $outPolicyNo.$i;//保险外部订单号
                    $birth = substr($personInfo[$i]['cardNum'],6,8);
                    $birthday = substr($birth,0,4).'-'.substr($birth,4,2).'-'.substr($birth,6,2);
                    $sign = strtolower(MD5('YRC86800118'.$birthday.$personInfo[$i]['cardNum'].'0'.$personInfo[$i]['name'].'2'.$outPolicyNo.$i.$data['addresseeTel'].'EXdPNBG6'));
                    $res = $soap -> createInsuranceOrder(array('request'=>array(
                            'agencyCode'=>'YRC86800118',//公司代码
                            'sign'=> $sign,//验证信息
                            'outPolicyNo'=>$outPolicyNo.$i,//外部保单号
                            'insurancePerson'=>$personInfo[$i]['name'],//投保人
                            'phone'=>$data['addresseeTel'],//投保人电话
                            'birthday'=>$birthday,//投保人生日
                            'certType'=>0,//证件类型
                            'certCode'=>$personInfo[$i]['cardNum'],//证件号
                            'orderUrl'=>"http://www.5199yl.com/index.php?g=Index&c=Air&a=airPay",//订单变更通知
                            'isPay'=>"2",//是否自动支付
                            'isDetails'=>'1',
                            'param'=>'',
                            //投保明细
                            'insurances'=>array(
                                'productId'=>'133',//产品ID
                                'name'=>$personInfo[$i]['name'],//被保险人姓名
                                'certType'=>'0',//证件类型
                                'certCode'=>$personInfo[$i]['cardNum'],//证件号码
                                'mobile'=>$data['addresseeTel'],//被保人手机号
                                'beginDate'=>$beginDate,//保险起保时间
                                'sex'=>'1',//性别
                                'birthday'=>$birthday,//出生日期
                                'insuranceType'=>'1',//投保类型
                                'endDate'=>$endDate,
                                'flightNo'=>$info['trainNo'],
                                'startAddress'=>'',
                                'endAddress'=>'',
                                'pnr'=>'pnr',
                                'ticketNo'=>'',
                                'param'=>''
                                )
                            )));
                }
            }
        $content = json_decode($content);
        $orderId = $content->orderId;
        $outOrder = json_encode($outNo);//保险外部订单号
        $file_contents = file_get_contents("http://www.51bib.com/trainOrderInfo.ashx?orderId=$orderId&retailId=FX7052709274825C095");
        $contents = iconv("GB2312","UTF-8",$file_contents);
        $content = json_decode($contents);
        $info = $content->orderInfoDetail;
        $fromStationName = $info->fromStationName;
        $toStationName = $info->toStationName;
        D('train_order')->where(array('order_id'=>$order_id))->data(array('parprice'=>$parprice,'outOrder'=>$outOrder,'personInfo'=>$psg,'orderId'=>$orderId,'checkname'=>$data['addresseeName'],'checkTel'=>$data['addresseeTel'],'fromStationName'=>$fromStationName,'toStationName'=>$toStationName,'user_name'=>$data['user_name'],'user_tel'=>$data['user_tel'],'user_place'=>$data['user_place'],'province'=>$data['province'],'city'=>$data['city'],'zip_code'=>$data['zip_code']))->save();
        echo json_encode($order_id);

    }

    //付款成功
    public function railwayOrderSuccess(){
        $order_id = $_GET['order_id'];
        $res = D('train_order')->where(array('order_id'=>$order_id))->find();
        $orderId  = $res['orderId'];
        $retailId = "FX7052709274825C095";
        $url = "http://www.51bib.com/trainpay.ashx";
        $body    = "data={\"orderId\": \"$orderId\",\"retailId\": \"$retailId\"}";
        $info     = $this -> request($url,$https=false,$method='post',$body);
        $content = iconv("GB2312","UTF-8",$info);
        //保险支付
        if($res['is_success'] == 'T'){
            $options = array(
                    'trace'                 => true,
                    'encoding'              => 'UTF-8',
                    'connection_timeout'    => 120,
                    'soap_version'          => SOAP_1_1,
                    'compression'           =>SOAP_COMPRESSION_ACCEPT | SOAP_COMPRESSION_GZIP,
                    'keep_alive'            =>true
                );
                $outPolicyNo = json_decode($res['outOrder'],true);
                $num = count($outPolicyNo);
                $soap = new SoapClient("http://ws.51book.com:8000/ltips/services/insuranceProductService1.0?wsdl",$options);
                for ($i=0; $i <$num ; $i++) {
                    $sign = strtolower(MD5('YRC86800118'.$outPolicyNo[$i].'11EXdPNBG6'));
                    $arr = $soap -> payInsuranceOrder(array('request'=>array(
                            'agencyCode'=>'YRC86800118',
                            'sign'=> $sign,
                            'orderNo'=>'',
                            'outOrderNo'=>$outPolicyNo[$i],
                            'payType' =>'1',
                            'payAmount'=>'',
                            'payChannels'=>'1',
                            'param'=>''
                            )));
                }
        }
        $this->assign('res',$res);
        $this -> display();
    }

    //订单详情
    public function orderItem(){
        $order_id = $_GET['order_id'];
        $res = D('train_order')->where(array('order_id'=>$order_id))->find();
        $personInfo = json_decode($res['personInfo']);
        $num = count($personInfo);
        for ($i=0; $i <$num ; $i++) { 
            foreach ($personInfo[$i] as $key => $value) {
                $in[$key] = $value;
            }
            $person[] = $in;
        }
        $day = substr($res['startDate'],0,4).'-'.substr($res['startDate'],4,2).'-'.substr($res['startDate'],6,2);
        $res['day'] = $day;
        $orderId = $res['orderId'];
        $file_contents = file_get_contents("http://www.51bib.com/trainOrderInfo.ashx?orderId=$orderId&retailId=FX7052709274825C095");
        $contents = iconv("GB2312","UTF-8",$file_contents);
        $content = json_decode($contents);
        $info = $content->orderInfoDetail;
        foreach ($info as $key => $value) {
            $in[$key] = $value;
        }
        $count = count($in['psgList']);
        $psgList = $in['psgList']; 
        for ($i=0; $i <$count ; $i++) { 
            foreach ($psgList[$i] as $key => $value) {
                $psginfo[$key] = $value;
            }
            $psgdata[] = $psginfo;
        }
        $price = $res['totalPrice']/$count;
        $res['personInfo'] = $person;
        $res['count'] = $count;
        $res['status'] = $info->orderStatus;
        $this -> assign('psgdata',$psgdata);
        $this -> assign('status',$content->orderInfoDetail->orderStatus);
        $this -> assign('count',$count);
        $this -> assign('res',$res);
        $this -> assign('info',$in);
        $this -> assign('person',$person);
        $this -> display();
    }

    //商城订单列表
    public function storeOrderlist(){
        $uid = cookie('uid');
        $page = input('get.page') ? input('get.page') : 1;
        $show_status = input('get.show_status') ? input('get.show_status') : null;
        $date = input('get.date') ? input('get.date') : null;
        $hotel_order_list = $this->hotelOrderList($uid,$page,$show_status,$date);//获取酒店列表信息
        // print_r($hotel_order_list);exit;
        // $order_db = Db::name('hotel_order');
        // $order_id = $order_db->where('uid',$uid)->order('id desc')->page($page,8)->column('hotel_order_id');
        // foreach ($order_id as $k => $v) {
        //     $this->hotelOrderDetail($v);//更新订单状态
        // }
        // $order_list = $order_db ->where('uid',$uid)->order('id desc')->page($page,8)->select()->toArray();
        // foreach ($order_list as $key => &$value) {
        //     $value['stay_days'] = (strtotime($value['departure_date'])-strtotime($value['arrival_date']))/86400;
        // }
        // $count = $order_db->where('uid',$uid)->count('id');
        $this->assign('count',$hotel_order_list['count']);
        // print_r($order_list);exit;
        $this->assign('order_list',$hotel_order_list['order_list']);
        return $this->fetch();
    }

     //商城订单列表
    public function airOrderlist(){
        $uid = cookie('uid');
        $page = input('get.page') ? input('get.page') : 1;
        $show_status = input('get.show_status') ? input('get.show_status') : null;
        $date = input('get.date') ? input('get.date') : null;
        $hotel_order_list = $this->hotelOrderList($uid,$page,$show_status,$date);//获取酒店列表信息
        // print_r($hotel_order_list);exit;
        // $order_db = Db::name('hotel_order');
        // $order_id = $order_db->where('uid',$uid)->order('id desc')->page($page,8)->column('hotel_order_id');
        // foreach ($order_id as $k => $v) {
        //     $this->hotelOrderDetail($v);//更新订单状态
        // }
        // $order_list = $order_db ->where('uid',$uid)->order('id desc')->page($page,8)->select()->toArray();
        // foreach ($order_list as $key => &$value) {
        //     $value['stay_days'] = (strtotime($value['departure_date'])-strtotime($value['arrival_date']))/86400;
        // }
        // $count = $order_db->where('uid',$uid)->count('id');
        $this->assign('count',$hotel_order_list['count']);
        // print_r($order_list);exit;
        $this->assign('order_list',$hotel_order_list['order_list']);
        return $this->fetch();
    }

     //包车首页
     public function carRental(){
        return $this->fetch();
    }
    //包车详情页
     public function rentalDetail(){
        return $this->fetch();
    }

}