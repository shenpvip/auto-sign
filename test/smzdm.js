const axios = require("axios")
const server = require("../utils/push")
// 读取环境变量
// const cookies = process.env.SMZDM_COOKIE
const cookies = '__ckguid=wPj5CuwIR2wlJB2QksCcKB2; device_id=213070643316642473666950121b9be7461fd19c38fba067f0f4b3721a; homepage_sug=a; r_sort_type=score; __jsluid_s=7e874e7b285fcbd95f33d4e42dcd06fc; footer_floating_layer=0; Hm_lvt_9b7ac3d38f30fe89ff0b8a0546904e58=1664247369; Hm_lpvt_9b7ac3d38f30fe89ff0b8a0546904e58=1664247369; _zdmA.vid=*; ad_date=30; ad_json_feed=%7B%7D; DISABLE_APP_TIP=1; sensorsdata2015jssdkcross=%7B%22distinct_id%22%3A%221837cdf88b2189-059e015443634a-26021c51-2359296-1837cdf88b3417%22%2C%22first_id%22%3A%22%22%2C%22props%22%3A%7B%22%24latest_traffic_source_type%22%3A%22%E8%87%AA%E7%84%B6%E6%90%9C%E7%B4%A2%E6%B5%81%E9%87%8F%22%2C%22%24latest_search_keyword%22%3A%22%E6%9C%AA%E5%8F%96%E5%88%B0%E5%80%BC%22%2C%22%24latest_referrer%22%3A%22https%3A%2F%2Fwww.baidu.com%2Flink%22%7D%2C%22%24device_id%22%3A%221837cdf88b2189-059e015443634a-26021c51-2359296-1837cdf88b3417%22%7D; sess=BA-2bxxM74NARL2LDEA7C3kiccgQsaYcY%2BzI6Wa7az%2F%2B90BR3PIb%2FFZ3Qbg0JsHD%2Bb5IejB%2Fujn%2BAT%2BLausuBEYq4peZ23DKuR3hy%2B%2F7OIEkppmAvUNdhufl7%2FZ; user=user%3A8520695656%7C8520695656; bannerCounter=%5B%7B%22number%22%3A3%2C%22surplus%22%3A1%7D%2C%7B%22number%22%3A0%2C%22surplus%22%3A1%7D%2C%7B%22number%22%3A1%2C%22surplus%22%3A1%7D%2C%7B%22number%22%3A1%2C%22surplus%22%3A1%7D%2C%7B%22number%22%3A0%2C%22surplus%22%3A1%7D%2C%7B%22number%22%3A0%2C%22surplus%22%3A1%7D%5D; smzdm_id=8520695656; _zdmA.time=1664506397716.4387.https%3A%2F%2Fwww.smzdm.com%2F; _zdmA.uid=ZDMA.P-IBLIj_7.1664506399.2419200'

const DEFAULT_HEADERS = {
    'Accept': '*/*',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'zh-CN,zh;q=0.9',
    'Connection': 'keep-alive',
    'Host': 'zhiyou.smzdm.com',
    'Referer': 'https://www.smzdm.com/',
    'Sec-Fetch-Dest': 'script',
    'Sec-Fetch-Mode': 'no-cors',
    'Sec-Fetch-Site': 'same-site',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36',
}

async function checkIn() {
    const session = axios.create({
        headers: DEFAULT_HEADERS
    })
    session.defaults.headers['Cookie'] = cookies
    const res = await session.get('https://zhiyou.smzdm.com/user/checkin/jsonp_checkin')
    console.log(res.data)
    const { error_code, error_msg, data } = res.data
    if (error_code === 0) {
        server({ title: '什么值得买签到成功', desp: data.slogan })
    }else{
        server({ title: '什么值得买签到失败', desp: error_msg })
    }
}

checkIn()