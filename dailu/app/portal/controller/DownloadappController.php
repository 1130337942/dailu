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

use cmf\controller\HomeBaseController; 


/***************** 个人主页 ****************/
class DownloadAppController extends HomeBaseController
{
   
    public function downloadApp()
    {
        return $this->fetch();
    }

    
    public function dailuerAPP()
    {
        return $this->fetch();
    }
   
}
