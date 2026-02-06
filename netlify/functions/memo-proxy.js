// netlify/functions/memo-proxy.js
exports.handler = async (event, context) => {
  try {
    // 从请求参数中获取key
    const { key } = event.queryStringParameters;
    if (!key) {
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, message: "缺少key参数" })
      };
    }

    // 转发请求到目标API
    const apiUrl = `https://n.showmsg.cn/api/v1/memos/${key}`;
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Referer": event.headers.origin // 传递Netlify域名作为Referer
      }
    });

    // 处理API返回结果
    const data = await response.json();
    return {
      statusCode: 200,
      headers: {
        // 允许Netlify域名跨域
        "Access-Control-Allow-Origin": event.headers.origin,
        "Access-Control-Allow-Methods": "GET"
      },
      body: JSON.stringify(data)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": event.headers.origin
      },
      body: JSON.stringify({ success: false, message: "代理请求失败：" + error.message })
    };
  }
};
