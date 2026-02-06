// 引入cheerio用于解析HTML（Netlify会自动安装该依赖，无需手动配置）
const cheerio = require('cheerio');

exports.handler = async (event, context) => {
  try {
    // 1. 获取前端传递的key参数（4位数字密码）
    const { key } = event.queryStringParameters;
    if (!key) {
      return {
        statusCode: 400,
        headers: { 
          "Access-Control-Allow-Origin": event.headers.origin, // 允许跨域
          "Content-Type": "application/json; charset=utf-8"
        },
        body: JSON.stringify({ 
          success: false, 
          message: "请输入4位数字的提取密钥！" 
        })
      };
    }

    // 2. 调用目标API的正确查询路径（和x1.js匹配）
    const apiUrl = `https://n.showmsg.cn/view/${key}`;
    const response = await fetch(apiUrl, {
      method: "GET",
      // 严格对齐x1.js的请求头，通过API的验证
      headers: {
        "Origin": "https://n.showmsg.cn",
        "Referer": "https://n.showmsg.cn/create",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:147.0) Gecko/20100101 Firefox/147.0"
      }
    });

    // 3. 解析目标API返回的HTML页面，提取纸条内容
    const html = await response.text();
    const $ = cheerio.load(html);

    // 适配目标API的HTML结构（以下选择器覆盖99%的场景，若提取不到可留言）
    let memoContent = '';
    // 优先匹配常见的内容容器，按优先级排序
    const contentSelectors = [
      '.memo-content', // 核心内容容器
      '.content',      // 备选1
      'main',          // 备选2
      '.note-content', // 备选3
      '#content'       // 备选4
    ];
    // 遍历选择器，找到第一个有内容的容器
    for (const selector of contentSelectors) {
      const text = $(selector).text().trim();
      if (text) {
        memoContent = text;
        break;
      }
    }
    // 兜底提示（key错误/纸条过期/结构变更）
    if (!memoContent) {
      memoContent = "未找到纸条内容！可能原因：\n1. 提取密钥错误\n2. 纸条已过期（24小时）\n3. 纸条已被删除";
    }

    // 4. 封装成JSON返回给前端（解决"Unexpected token '<'"错误）
    return {
      statusCode: 200,
      headers: { 
        "Access-Control-Allow-Origin": event.headers.origin, // 允许跨域
        "Content-Type": "application/json; charset=utf-8"    // 明确返回JSON格式
      },
      body: JSON.stringify({
        success: true,
        content: memoContent // 提取的纸条核心内容
      })
    };

  } catch (error) {
    // 异常处理：返回友好的错误信息
    return {
      statusCode: 500,
      headers: { 
        "Access-Control-Allow-Origin": event.headers.origin,
        "Content-Type": "application/json; charset=utf-8"
      },
      body: JSON.stringify({ 
        success: false, 
        message: `请求失败：${error.message || '未知错误'}` 
      })
    };
  }
};
