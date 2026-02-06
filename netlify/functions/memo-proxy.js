exports.handler = async (event, context) => {
  try {
    const { key } = event.queryStringParameters;
    if (!key) {
      return {
        statusCode: 400,
        headers: { "Access-Control-Allow-Origin": event.headers.origin },
        body: JSON.stringify({ success: false, message: "缺少key参数" })
      };
    }

    const apiUrl = `https://n.showmsg.cn/api/v1/memos/${key}`;
    const response = await fetch(apiUrl, {
      method: "GET",
      // 移除Referer头，仅保留User-Agent模拟浏览器请求
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });

    // 先获取原始响应文本，避免JSON解析报错
    const rawResponse = await response.text();
    let data;
    try {
      data = JSON.parse(rawResponse);
    } catch (parseError) {
      return {
        statusCode: response.status,
        headers: { "Access-Control-Allow-Origin": event.headers.origin },
        body: JSON.stringify({
          success: false,
          message: `目标API返回：${rawResponse}`
        })
      };
    }

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": event.headers.origin },
      body: JSON.stringify(data)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": event.headers.origin },
      body: JSON.stringify({ success: false, message: "代理请求失败：" + error.message })
    };
  }
};
