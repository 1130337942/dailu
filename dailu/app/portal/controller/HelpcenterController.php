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

use cmf\controller\HomeBaseController;

class HelpCenterController extends HomeBaseController
{
    public function helpMain()
    {
        return $this->fetch();
    }
   public function questions()
    {
        return $this->fetch();
    }
    public function questions_account()
    {
        return $this->fetch();
    }
    public function questions_feedback()
    {
        return $this->fetch();
    }
    public function questions_design()
    {
        return $this->fetch();
    }
    

   public function greenhand()
    {
        return $this->fetch();
    }
   public function greenhand_design()
    {
        return $this->fetch();
    }

   public function greenhand_citydesign()
    {
        return $this->fetch();
    }

    public function greenhand_elementdesign()
    {
        return $this->fetch();
    }
   public function greenhand_travel()
    {
        return $this->fetch();
    }
   public function greenhand_greatravel()
    {
        return $this->fetch();
    }
}
