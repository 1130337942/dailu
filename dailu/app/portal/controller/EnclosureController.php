<?php
namespace app\portal\controller;
use think\Db;
use cmf\controller\HomeBaseController;
class EnclosureController extends HomeBaseController{
	public function circlePreview(){
		return $this->fetch();
	}
	public function aMap(){
        return $this->fetch();
    }
    public function view(){
    	$where['type'] = array('NEQ','top8');
		$nature_data = Db::name('Nature_absture')->field('id,spot_name,1 as type')->where($where)->select()->toArray();
		$describe_data = Db::name('Describe')->field('id,spot_name,2 as type')->select()->toArray();
		// $cultural_data=Db::name('Cultural_spot')->field('id,scenic_name as spot_name,3 as type')->select()->toArray();
		$data = array_merge($nature_data,$describe_data);
		echo json_encode($data);
    }
	public function point(){
		return $this->fetch();
	}
	//地图选点
	public function getMap(){
		$name = $_POST['scenery'];
		$view_id = $_POST['view_id'];
		$type = $_POST['type'];
		$coord = json_encode($_POST['coord']);
		$data = Db::name('amap')->where(array('name'=>$name))->find();
		if(empty($data)){
			$return = Db::name('amap')->insert(array('name'=>$name,'view_id'=>$view_id,'type'=>$type,'coord'=>$coord));
			if(!empty($return)){
				echo json_encode(array('status'=>true));
			}else{
				echo json_encode(array('status'=>false));
			}
		}else{
			echo 'again';
		}
	}
	//坐标点查看
	public function coordinate(){
		$data=Db::name('amap')->select();
		// print_r($data);
		$this->assign('info',$data);
		return $this->fetch();
	}
	//坐标点编辑
	public function editCoord(){
		$id = input('post.list_id');
		$data=Db::name('amap')->where(['id'=>$id])->find();
		$data['coord'] = json_decode($data['coord']);
		if($data){
			echo json_encode(array('status'=>'ok','data'=>$data));
		}else{
			echo json_encode(array('status'=>'no'));
		}
	}
	//坐标点编辑操作
	public function doEditCoord(){
		$name = $_POST['scenery'];
		$id = $_POST['list_id'];
		$coord = json_encode($_POST['coord']);
		$data = Db::name('amap')->where(array('id'=>$id))->update(array('name'=>$name,'coord'=>$coord));
		if(!empty($data)){
			echo json_encode(array('status'=>true));
		}else{
			echo json_encode(array('status'=>false));
		}
	}
	//坐标点删除
	public function coordDel(){
		$id = $_POST['listId'];
		$return = Db::name('amap')->where(['id'=>$id])->delete();
		if($return){
			echo json_encode(array('status'=>'ok'));
		}else{
			echo json_encode(array('status'=>'no'));
		}
	}
	//坐标点查询
	public function coordSelect(){
		$name = $_POST['name'];
		$return = Db::name('amap')->where(['name'=>$name])->find();
		if($retutn){
			echo json_encode(array('status'=>true,'coord'=>$return));
		}else{
			echo json_encode(array('status'=>false,'coord'=>$return));
		}
	}
	//景点电子围栏查看
	public function enclosure(){
		$id = $_POST['id'];
		$view_id = $_POST['view_id'];
		$type = $_POST['type'];
		$enclosure = DB::name('amap')->where('id',$id)->update(['view_id'=>$view_id,'type'=>$type]);
		if($enclosure){
			echo json_encode(['status'=>'ok']);
		}else{
			echo json_encode(array('status'=>'no'));
		}
	}
























}