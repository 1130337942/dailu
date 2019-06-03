<?php
namespace app\portal\controller;
header("Content-type: text/html; charset=utf-8"); 
use cmf\controller\HomeBaseController;
use think\Db;
class FlightController extends HomeBaseController{
    //航班搜索
	public function searchFlight(){
		$createTime = time();
        $params = json_encode(array(
                                'dpt'=>'PEK',
                                'arr'=>'SHA',
                                'date'=>'2018-05-25',
                                'ex_track'=>'tehui'
                                ));
        $sign   = md5('createTime='.$createTime.'key=6178322b4842d39dba955decb330d534params='.$params.'tag=flight.national.supply.sl.searchflighttoken=aef2cd32710926403bfa70170bbf205d');
        $url     = "http://qae.qunar.com/api/router?sign=$sign&tag=flight.national.supply.sl.searchflight&token=aef2cd32710926403bfa70170bbf205d&createTime=$createTime&params=$params";
        $res = file_get_contents($url);
        $res = json_decode($res)->result->flightInfos;
        $res = json_decode(json_encode($res),true);
        foreach ($res as $key => $value) {
            $air[$value['flightNum']][] = $value;
        }
        print_r($res);
        // print_r(json_decode($res));
	}
    //报价搜索
    public function searchprice(){
        $createTime = time();
        $params = json_encode(array(
                                'dpt'=>'PEK',
                                'arr'=>'SHA',
                                'date'=>'2018-05-25',
                                'flightNum'=>'NZ3819',
                                'ex_track'=>'tehui'
                                ));
        $sign   = md5('createTime='.$createTime.'key=6178322b4842d39dba955decb330d534params='.$params.'tag=flight.national.supply.sl.searchpricetoken=aef2cd32710926403bfa70170bbf205d');
        $url    = "http://qae.qunar.com/api/router?sign=$sign&tag=flight.national.supply.sl.searchprice&token=aef2cd32710926403bfa70170bbf205d&createTime=$createTime&params=$params";
        $res = file_get_contents($url);
        print_r(json_decode($res));
    }
    //BK接口
    public function flightBK(){
        $createTime = time();
        $params = json_encode(array(
                                'ticketPrice'=>'1240',//票面价
                                'barePrice'=>'1240',//裸票价
                                'price'=>'1240',//booking价
                                'basePrice'=>'0',//政策价
                                'businessExt'=>'Vma/KC3/v9FG2M3TO/nM1BaxeTXI5T5lLoyuleTCnVOgDNBp8BItSwhAj9qex25S+AnbAISXuKFNAhN8EFQ38uXwJSX+lFY6tuP2dOn+4CFLdDT7Z3ZPhkFBc2rYNzT7I719v+dck7bh0BQkmnX7OTpjMQGlU9aUdKfL2DKepoJvYXieQoFw1ryywG5+Bj71G5bhiyCLXhSFPafG3N+HSjW2qn6dDU6MB5RJAjxLu1rOGziDvW1JV7jzt6sYPnV//WKbKqG4/k9QNqlGlIrniCfyLgaOr9NVKYri4HOD8EPmeDTTFNO0GWwE4VHap7WZcHJAPKCmdDz231zn0yXzXQdpmCdr8weiDeeCPC80fs4u4WncBxCqX+DnykAsmOWpFFOsBb+bS1/tzhXhAAxZu5PQFmrU5yrpfcHyImxWTwGMGEJ8DiZBqexkZwMA1HwsINKYjrjRQI3OY3iBzHCI9/q8EzrRhaqVt5C7t5xkpvvVmFrcpLtivq0uP2ZDcwkKos3sPTlKzKjhxENbdM7JhUz4+RhaLzxLTNjaBSK+BfEWz7Llwpj6w4MTyTpZs0QcpHJ5T9PN2NCdbcruKHQMwkVm/DZwfxz7btdo+LAKweBUCy6OckcsFRfqTin+jsiYszau1qvv4wuKC3aiUrXm9tAdiuUj4Uz6BH7B/Js0KigZvn/rZLKgpbcOosq2Egk8vc0UlndZu+UvNStSGK/SqQ==',//业务扩展字段
                                'tag'=>'SPL1',//产品Tag
                                'carrier'=>'NZ',//航司
                                'flightNum'=>'NZ3819',//航班号
                                'cabin'=>'Y',//舱位
                                'from'=>'PEK',//起飞机场三字码
                                'to'=>'PVG',//到达机场三字码
                                'policyType'=>'1',//政策类型
                                'wrapperId'=>'ttsgndh3652',//
                                'startTime'=>'20180425',//起飞日期
                                'client'=>'xep.trade.qunar.com',//代理商域名
                                'policyId'=>'301770810',//政策id
                                'dptTime'=>'08:05',//起飞时间
                                'flightType'=>'1',//航程类型。固定值1,表示单程
                                'userName'=>'hwcaqfz3594'//去哪儿用户名
                                ));
        // print_r($params);echo '<br>';
        $sign   = md5('createTime='.$createTime.'key=6178322b4842d39dba955decb330d534params='.$params.'tag=flight.national.supply.sl.bktoken=aef2cd32710926403bfa70170bbf205d');
        $params = urlencode($params);
        $url     = "http://qae.qunar.com/api/router?sign=$sign&tag=flight.national.supply.sl.bk&token=aef2cd32710926403bfa70170bbf205d&createTime=$createTime&params=$params";
        $res = file_get_contents($url);
        print_r(json_decode($res));
    }
    //订单生成
    public function orderCreate(){
        $createTime = time();
        $params = json_encode(array(
                                'productTag'=>'SPL1',//产品类型,Booking返回extInfo中tag
                                'insureTag'=>'',//保险tag
                                'flyFund'=>false,//是否用飞基金
                                'isUseBonus'=>false,//是否可以使用红包
                                'fuelTax'=>'0',//燃油税
                                'childFuelTax'=>'0',//儿童燃油税
                                'constructionFee'=>'50',//机建费
                                'printPrice'=>'940',//票面价
                                'yPrice'=>'940',//公布运价,Booking返回ticketPrice
                                'childPrintPrice'=>'',//儿童票面价
                                'discount'=>'',//票面价折扣
                                'policyType'=>'1',//政策
                                'policyId'=>'301770810',//政策id
                                'type'=>'',//暂时无用,设置为空
                                'contact'=>'',//联系人姓名
                                'contactPreNum'=>'86',//国家区位码
                                'contactMob'=>'17739770430',//联系人电话
                                'contactEmail'=>'',//联系人邮箱
                                'invoiceType'=>'',//发票类型
                                'receiverTitle'=>'',//发票抬头
                                'receiverType'=>'',//抬头类型，个人为2，若为单位、企业，都传3
                                'taxpayerId'=>'',//纳税人识别号
                                'sjr'=>'',//收件人姓名
                                'sjrPhone'=>'',//收件人电话
                                'address'=>'',//收件人地址
                                'xcd'=>'',//是否邮寄行程单，"1"：勾选 ，""：未勾选
                                'xcdMethod'=>'',//xcd_config表中的id，暂时不需要，设置为空串
                                'xcdPrice '=>'',//快递费
                                'bxInvoice'=>'',//是否勾选保险发票选项，"1"：勾选，""：未勾选
                                'flightInfo'=>array(
                                    'flightNum'=>'NZ3819',//航班号
                                    'gx'=>'',//共享航班号
                                    'flightType'=>'1',//行程类型 1:单程，2：往返
                                    'stopInfo'=>'0',//经停数
                                    'deptAirportCode'=>'PEK',//出发机场，大写，三字码
                                    'arriAirportCode'=>'PVG',//到达机场，大写，三字码
                                    'deptCity'=>'北京',//出发城市，汉字
                                    'arriCity'=>'上海',//到达城市，汉字
                                    'deptDate'=>'2018-04-25',//出发日期
                                    'deptTime'=>'0805',//出发时间
                                    'arriTime'=>'1015',//到达时间
                                    'cabin'=>'H',//舱位
                                    'childCabin'=>''//儿童舱位
                                ),
                                'passengerCount'=>'1',//乘机人数
                                'passengers'=>array(
                                    'name'=>'周志朋',//乘机人姓名
                                    'ageType'=>'0',//年龄类型，0：成人；1：儿童
                                    'cardType'=>'NI',//证件类型，NI:身份证,PP:护照,ID:其他
                                    'cardNo'=>'370283199306171416',//证件号码
                                    'sex'=>'1',//性别，0: 女，1: 男
                                    'birthday'=>'1993-06-17',//生日
                                    'passengerPriceTag'=>'',//乘机人报价tag，若为儿童，必填儿童tag，例如CHI1；
                                    'bx'=>'',//是否勾选航意险
                                    'flightDelayBx'=>'',//是否勾选航延险
                                    'flightDelayType'=>'',//保险产品类型(航延险/退票险)
                                    'flightDelayCode'=>'',//保险产品编码
                                    'tuipiaoBx'=>'',//是否勾选退票险,false不勾选, true勾选
                                    'tuipiaoCode'=>''//退票险产品编码
                                ),
                                'bookingTag'=>'WrBmHgpYqKMAAsPgz1hErVrhLCgv9n1MZQf12w==',//booking返回结果中的 bookingTag
                                'xth'=>'',//1：代表新特惠返现
                                'qt'=>'8ce420bf-326c-448c-be3a-3042b292d5f5',//主站一次booking跳转唯一码
                                'source'=>'web.baituor.yyl',//订单来源
                                'clientSite'=>'xep.trade.qunar.com'//代理商域名
                                ));
        $sign   = md5('createTime='.$createTime.'key=6178322b4842d39dba955decb330d534params='.$params.'tag=flight.national.supply.sl.ordertoken=aef2cd32710926403bfa70170bbf205d');
        $params = urlencode($params);
        $url    = "http://qae.qunar.com/api/router?sign=$sign&tag=flight.national.supply.sl.order&token=aef2cd32710926403bfa70170bbf205d&createTime=$createTime&params=$params";
        $res = file_get_contents($url);
        print_r(json_decode($res));
    }
    //订单支付
    public function orderPay(){
        $createTime = time();
        $params = array(
            'clientSite'=>'',//代理商域名
            'orderId'=>'',//机票订单ID(生单接口返回的),不是orderNo
            'pmCode'=>'',//支付方式,OUTDAIKOU（第三方余额代扣）  DAIKOU（qunar余额代扣）
            'bankCode'=>'',//银行编号,QUNARPAY  商户余额代扣  ALIPAY   支付宝余额代扣  TENPAY  财付通余额代扣
            'paymentMerchantCode'=>'',//付款账户
            'curId'=>'',//货币代码
            'bgRetUrl'=>'',//支付回调地址
            'customerIp'=>'',//付款方IP
            'validTime'=>'',//过期时间
            'productName'=>'',//商品名称
            'productId'=>'',//商品编号
            'productDetail'=>'',//订单详情
            'accountRemark'=>''//账务备注
        );
        $sign   = md5('createTime='.$createTime.'key=6178322b4842d39dba955decb330d534params='.$params.'tag=flight.national.supply.sl.paytoken=aef2cd32710926403bfa70170bbf205d');
        $params = urlencode($params);
        $url    = "http://qae.qunar.com/api/router?sign=$sign&tag=flight.national.supply.sl.pay&token=aef2cd32710926403bfa70170bbf205d&createTime=$createTime&params=$params";
        $res = file_get_contents($url);
        print_r(json_decode($res));
    }
    //订单详情
    public function orderDetail(){
        $createTime = time();
        $params = array(
            'orderNo'=>''//订单号
        );
        $sign   = md5('createTime='.$createTime.'key=6178322b4842d39dba955decb330d534params='.$params.'tag=flight.national.tts.order.info.detail.gettoken=aef2cd32710926403bfa70170bbf205d');
        $params = urlencode($params);
        $url    = "http://qae.qunar.com/api/router?sign=$sign&tag=flight.national.tts.order.info.detail.get&token=aef2cd32710926403bfa70170bbf205d&createTime=$createTime&params=$params";
        $res = file_get_contents($url);
        print_r(json_decode($res));
    }


























}