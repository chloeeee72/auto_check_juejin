const Koa = require('koa');
const schedule = require('node-schedule');
const _request = require('request');
const app = new Koa();
const { cookie, aid, uuid, _signature, PUSH_PLUS_TOKEN, rule, isScheduleCronstyle } = require('./config')
// const {PUSH_URL, BASE_GETSIGN_URL, BASE_GETLOTTERY_URL, SIGN_URL, LOTTERY_URL} = require('./api')

const BASE_SIGN_URL = 'https://api.juejin.cn/growth_api/v1/check_in';
const BASE_LOTTERY_URL = 'https://api.juejin.cn/growth_api/v1/lottery/draw';
// pushplus api
const PUSH_URL = 'http://www.pushplus.plus/send';
// 签到 查询api get
const BASE_GETSIGN_URL = 'https://api.juejin.cn/growth_api/v1/get_today_status';
// 抽奖 查询api get
const BASE_GETLOTTERY_URL = 'https://api.juejin.cn/growth_api/v1/lottery_config/get';
// 签到 api post
const SIGN_URL = `${BASE_SIGN_URL}?aid=${aid}&uuid=${uuid}&_signature=${_signature}`;
// 抽奖 api post
const LOTTERY_URL = `${BASE_LOTTERY_URL}?aid=${aid}&uuid=${uuid}&_signature=${_signature}`;

const sign_options = {
  url: SIGN_URL,
  method:'post',
  headers: {
    'cookie': 'sessionid='+ cookie,
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36 Edg/92.0.902.67',
  },
}

const draw_options = {
  url: LOTTERY_URL,
  method: 'post',
  headers: {
    'cookie': cookie
  },
}

const push_options = {
  url: PUSH_URL,
  method:'post',
  headers: {
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36 Edg/92.0.902.67',
    'content-type' : 'application/json',
  },
  json: true,
}

const today_draw_status = {
  url: BASE_GETLOTTERY_URL,
  method: 'get',
  headers: {
    'cookie': cookie
  }
}

// 适配Koa
function request(options) {
  return new Promise(function (resolve, reject) {
    _request(options, function (error, response, body) {
      error && reject(error);
      resolve(response, body);
    })
  })
}

// 推送
function handlePush(desp, options){
  const body = {
    "token": `${PUSH_PLUS_TOKEN}`,
    "title": `掘金签到结果 ${new Date().toLocaleString()}`,
    'content': `${new Date().toLocaleString()}  ${desp}`,
  }
  return new Promise(function (resolve, reject) {
    options.body = body
    _request.get(options,function (error, response, body) {
      error && reject(error);
      resolve(response, body);
    })
  })
}

// 发送请求 输出信息 pushplus推送
async function start (ctx, next) {
  const sign_res = await request(sign_options)
  // const draw_res = await request(draw_options)
  console.log('request--------',sign_res.body)
  // checkIn();
  // draw();
  handlePush(sign_res.body ,push_options);
}

// 定时任务
const scheduleCronstyle = ()=>{
  schedule.scheduleJob(rule,()=>{
    start();
  });
}

app.listen(3000,()=>{
  console.log('服务启动成功---------->');
  if(isScheduleCronstyle){
    scheduleCronstyle();
  }else{
    start();
  }
})