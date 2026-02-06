exports.handler = async (event, context) => {
  try {
    const { key } = event.queryStringParameters;
    if (!key) {
      return {
        statusCode: 400,
        headers: { "Access-Control-Allow-Origin": event.headers.origin },
        body: JSON.stringify({ success: false, message: "缺少key参数（4位数字密码）" })
      };
    }

    // 关键修正1：查询纸条的正确路径是 /view/{key}，而非/api/v1/memos/{key}
    const apiUrl = `https://n.showmsg.cn/view/${key}`;
    const response = await fetch(apiUrl, {
      method: "GET",
      // 关键修正2：对齐x1.js中的请求头，通过API的Referer/Origin验证
      headers: {
        "Content-Type": "application/json",
        "Origin": "https://n.showmsg.cn",
        "Referer": "https://n.showmsg.cn/create",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:147.0) Gecko/20100101 Firefox/147.0"
      }
    });

    // 先获取原始响应，避免非JSON解析报错
    const rawResponse = await response.text();
    // 目标API的/view/{key}返回的是HTML页面（不是JSON），直接返回给前端
    return {
      statusCode: 200,
      headers: { 
        "Access-Control-Allow-Origin": event.headers.origin,
        "Content-Type": "text/html; charset=utf-8" // 匹配响应格式
      },
      body: rawResponse
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": event.headers.origin },
      body: JSON.stringify({ 
        success: false, 
        message: "代理请求失败：" + error.message 
      })
    };
  }
};
