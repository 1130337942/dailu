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
namespace app\promote\controller;
use think\Db;

use think\db\Query;
use think\Exception;
use think\Loader;
use think\Model;

use cmf\controller\AdminBaseController;

/***************** 推广管理 =》 推广系统  ****************/
class PromotesystemController extends AdminBaseController
{
    //用户推广列表
    public function index()
    {
        // $userData = Db::name('Customer')->where(array('register_data'=>array('neq',0)))->select()->toArray();
        $Data = Db::name('Customer')->select()->toArray();
        foreach($Data as $user)
        {
            if($user['register_data'] != 0)
            {
                $result[] = $user;
            }
        }

        //列表数据
        if(isset($result))
        {
             //对应的一个A推广出B、C、D
            foreach($Data as $user)
            {
                foreach($result as $key=>$re)
                {
                    if($user['p_refer_code'] == $re['refer_code'])
                    {
                        $assoc[$key][] = $user;
                    }
                }
            }
        // print_r($assoc);
            //通过推广注册的用户，几个人发布了行程，几个人的发布的行程被审核通过(总数)
            foreach($assoc as $kk=>&$acsx)
            {
                foreach($acsx as $key=>&$a)
                {
                    $number1 = Db::name('Trip_info')->where(array('uid'=>$a['uid'],'status'=>1))->count();
                    $a['is_release'] = $number1;  //发布行程个数
                    if($a['is_release'] != 0)
                    {
                        $keydata1[$kk][] = 'true';
                    }
                    $number2 = Db::name('Trip_info')->where(array('uid'=>$a['uid'],'status'=>2))->count();
                    $a['is_audit'] = $number2;   //审核通过的行程个数
                    if($a['is_audit'] != 0)
                    {
                        $keydata2[$kk][] = 'true';
                    }
                }
            }

            foreach($result as $k=>&$res)
            {
                // 发布行程的人数
                if(isset($keydata1))
                {
                    foreach($keydata1 as $k2=>&$h)
                    {
                        if($k == $k2)
                        {
                            $res['releaseNum'] = count($h);
                        }
                    }
                }
                if(isset($keydata2))
                {
                    //发布以后审核通过的人数
                    foreach($keydata2 as $k3=>$j)
                    {
                        if($k == $k3)
                        {
                            $res['auditNum'] = count($j);
                        }
                    }
                }
               
                //为0时，添加对应字段
                if(!isset($res['releaseNum']))
                {
                    $res['releaseNum'] = 0;
                }
                if(!isset($res['auditNum']))
                {
                    $res['auditNum'] = 0;
                }
            }
            $this->assign('result',$result);
        }
    // print_r($result);
    // exit;
      
        return $this->fetch();
    }
    
    //填写完推广注册的单价，审核通过的单价,计算每天的价格，单个总价格返回
    public function submitData()
    {
        $post = $_POST;
        $uid = $post['uid'];
        $date = time();
        $reg_price = $post['reg_price'];
        $audit_price = $post['audit_price'];

        $data['register_data'] = $post['register_data'];  //注册总人数
        $data['is_audit'] = $post['is_audit'];             //审核通过总人数

        /*****单个日的 数量,单个日的总价格****/
        //一级A
        
        $Data = Db::name('Customer')->where(array('uid'=>$uid))->find();
        // print_r($Data);
        //发展出来的二级B、C、D
        $where['p_refer_code'] = $Data['refer_code'];
        //在当前时间 以后 注册的，审核的，用当前填写的单价计算。
        //不然用上次的价格计算
        //已经参与计算过的记录，在第二次操作的时候不参与计算
        $where['add_time'] = array('gt',$date); 
        $where['is_tuig_price'] = 0;
        $twoData = Db::name('Customer')->where($where)->select()->toarray();

        $is_tuig_price['is_tuig_price'] = 1;
        foreach($twoData as $t)
        {
            Db::name('Customer')->where(array('uid'=>$t['uid']))->update($is_tuig_price);
        }
        //对应日期下（如：9月2号）A推广出B、C已经注册

        if(!empty($twoData))
        {
            foreach($twoData as $te)
            {
                $b[]= $te['add_time'];
            }
            $c = array_unique($b);

            foreach($c as $v)
            {
                $n=0;
                foreach($twoData as $t){
                    if($v==$t['add_time'])
                        $n++;
                }
                // echo "数字 $v 出现了 $n 次";
                $new[$v]=$n;
            }
            // echo json_encode($new);
            $aa="'".implode("','", $new)."'";
            //去重
            $newArr = $this->array_unset_tt($twoData,'add_time'); 
    
            //个数整合
            foreach($newArr as $k5=>&$ee)
            {
                foreach($new as $k6=>$ww)
                {
                    if($k5 == $k6)
                    {
                        $ee['zhuce_number'] = $ww;
                    }
                }
            }

            foreach($newArr as $y=>$o)
            {
                $twoDataResult[] = $o;
            }
            // print_r($twoDataResult);
        }
        if(isset($twoDataResult))
        {
            foreach($twoDataResult as $key=>$ttt)
            {
                $aaa[$key]['add_time'] = $ttt['add_time'];
                $aaa[$key]['zhuce_number'] = $ttt['zhuce_number'];
            }

            //单日注册数，注册单价，单日注册总奖励
            foreach($aaa as &$pri)
            {
                $zhuce_array = array('date'=>$pri['add_time'],'number'=>$pri['zhuce_number']);
                $pri['day_zhuce_price'] = $zhuce_array['number'] * $reg_price;
                $pri['reg_price'] = $reg_price;
                $pri['zhuce_number'] = $pri['zhuce_number'];
                $pri['uid'] = $uid;
                $pri['date'] = $pri['add_time'];
                $pri['user_name'] = $Data['user_name'];
                $pri['register_data'] = $post['register_data'];  //注册总人数
                $pri['is_audit'] = $post['is_audit'];             //审核通过总人数
            }
            //对应日期下 (发布行程并且审核通过的人数),审核单价、单日审核总奖励
            foreach($twoDataResult as $two)
            {
                $trip = Db::name('Trip_info')->where(array('uid'=>$two['uid'],'status'=>2))->find();
                $number2[] = Db::name('Trip_info')->where(array('uid'=>$two['uid'],'status'=>2))->count();
            }

            foreach($number2 as $key=>$nnn)
            {
                $day_shenhe_price = $nnn * $audit_price;
                foreach($aaa as $key2=>&$pytre)
                {
                    if($key == $key2)
                    {
                        $pytre['shenhe_number'] = $nnn;
                        $pytre['audit_price'] = $audit_price;
                        $pytre['day_shenhe_price'] = $day_shenhe_price;
                        $pytre['day_total_price'] = $pytre['day_zhuce_price'] + $pytre['day_shenhe_price'];
                    }
                    unset($pytre['add_time']);
                }
            }
        // print_r($aaa); exit;
            //批量存入到promote表
            $this->saveAll($aaa);
        }
        /***end***/

        //一级A用户，最新日期下的最新单价
        $data['reg_price'] = $reg_price;
        $data['audit_price'] = $audit_price;
        $data['date_time'] = $date;
        
        // //本人获得的所有奖励总数
        $total = Db::name('Promote')->where(array('uid'=>$uid))->select();
        $sum = 0;
        foreach($total as $item){
            $sum += (int) $item['day_total_price'];
        }
        $sumData['total_price'] = $sum;
        Db::name('Promote')->where(array('uid'=>$uid))->update($sumData);

        $data['total_price'] = $sum;
        $result['total_price'] = $sum;
        Db::name('Customer')->where(array('uid'=>$uid))->update($data);
        echo json_encode($result,JSON_UNESCAPED_UNICODE);

    }

    /**
     * 批量保存当前关联数据对象
     * @access public
     * @param array $dataSet 数据集
     * @return integer
     */
    public function saveAll(array $dataSet)
    {
        $result = false;
        foreach ($dataSet as $key => $data) {
            $result = Db::name('Promote')->insert($data);
        }
        return $result;
    }

    //查看详情
    public function promote_price()
    {
        $post = $_POST;
        $uid = $post['uid'];
        $isEdit = $post['isEdit'];  //为false时，说明没有点击提交，默认使用之前的单价进行计算
        $data['register_data'] = $post['register_data'];  //注册总人数
        $data['is_audit'] = $post['is_audit'];             //审核通过总人数
        if($isEdit == 'false')
        {
            //当没有填写新的单价时，使用之前的单价进行计算
            //一级A
            $Data = Db::name('Customer')->where(array('uid'=>$uid))->find();
            $date = $Data['date_time'];
            $where['p_refer_code'] = $Data['refer_code'];
            $where['add_time'] = array('gt',$date); 
            $where['is_tuig_price'] = 0;
            $twoData = Db::name('Customer')->where($where)->select()->toarray();

            $is_tuig_price['is_tuig_price'] = 1;
            foreach($twoData as $t)
            {
                Db::name('Customer')->where(array('uid'=>$t['uid']))->update($is_tuig_price);
            }

            //对应日期下（如：9月2号）A推广出B、C已经注册
            if(!empty($twoData))
            {
                foreach($twoData as $te)
                {
                    $b[]= $te['add_time'];
                }
                $c = array_unique($b);

                foreach($c as $v)
                {
                    $n=0;
                    foreach($twoData as $t){
                        if($v==$t['add_time'])
                            $n++;
                    }
                    $new[$v]=$n;
                }
                $aa="'".implode("','", $new)."'";
                //去重
                $newArr = $this->array_unset_tt($twoData,'add_time'); 
        
                //个数整合
                foreach($newArr as $k5=>&$ee)
                {
                    foreach($new as $k6=>$ww)
                    {
                        if($k5 == $k6)
                        {
                            $ee['zhuce_number'] = $ww;
                        }
                    }
                }

                foreach($newArr as $y=>$o)
                {
                    $twoDataResult[] = $o;
                }
                // print_r($twoDataResult);
            }
            if(isset($twoDataResult))
            {
                foreach($twoDataResult as $key=>$ttt)
                {
                    $aaa[$key]['add_time'] = $ttt['add_time'];
                    $aaa[$key]['zhuce_number'] = $ttt['zhuce_number'];
                }

                //单日注册数，注册单价，单日注册总奖励
                foreach($aaa as &$pri)
                {
                    $zhuce_array = array('date'=>$pri['add_time'],'number'=>$pri['zhuce_number']);
                    $pri['day_zhuce_price'] = $zhuce_array['number'] * $Data['reg_price'];
                    $pri['reg_price'] = $Data['reg_price'];
                    $pri['zhuce_number'] = $pri['zhuce_number'];
                    $pri['uid'] = $uid;
                    $pri['date'] = $pri['add_time'];
                    $pri['user_name'] = $Data['user_name'];
                    $pri['register_data'] = $post['register_data'];  //注册总人数
                    $pri['is_audit'] = $post['is_audit'];             //审核通过总人数
                }
                //对应日期下 (发布行程并且审核通过的人数),审核单价、单日审核总奖励
                foreach($twoDataResult as $two)
                {
                    $trip = Db::name('Trip_info')->where(array('uid'=>$two['uid'],'status'=>2))->find();
                    $number2[] = Db::name('Trip_info')->where(array('uid'=>$two['uid'],'status'=>2))->count();
                }

                foreach($number2 as $key=>$nnn)
                {
                    $day_shenhe_price = $nnn * $Data['audit_price'];
                    foreach($aaa as $key2=>&$pytre)
                    {
                        if($key == $key2)
                        {
                            $pytre['shenhe_number'] = $nnn;
                            $pytre['audit_price'] = $Data['audit_price'];
                            $pytre['day_shenhe_price'] = $day_shenhe_price;
                            $pytre['day_total_price'] = $pytre['day_zhuce_price'] + $pytre['day_shenhe_price'];
                        }
                        unset($pytre['add_time']);
                    }
                }
            // print_r($aaa); exit;
                //批量存入到promote表
                $this->saveAll($aaa);

                $total = Db::name('Promote')->where(array('uid'=>$uid))->select();
                $sum = 0;
                foreach($total as $item){
                    $sum += (int) $item['day_total_price'];
                }
                $data['total_price'] = $sum;
                Db::name('Customer')->where(array('uid'=>$uid))->update($data);
            }
        }
        
        //正常
        //点击推广的查看详情
        $promote = Db::name('Promote')->where(array('uid'=>$uid))->select()->toArray();

        foreach($promote as &$yy)
        {
            $yy['date_of'] = date("Y-m-d H:i:s",$yy['date']);
        }
        $result = array('status' => 'ok', 'list'=>$promote,'msg' => '查看详情成功!');
        echo json_encode($result,JSON_UNESCAPED_UNICODE);
    }

     //二维数组去重
    //$arr->传入数组   $key->判断的key值
    public function array_unset_tt($arr,$key)
    {   
        //建立一个目标数组
        $res = array();      
        foreach ($arr as $value) 
        {         
            //查看有没有重复项
            if(isset($res[$value[$key]])){
                //有：销毁
                unset($value[$key]);
            }
            else{
                //没有,存储起来
                $res[$value[$key]] = $value;
            }  
        }
        return $res;
    }

    
}
