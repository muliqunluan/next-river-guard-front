import { NextRequest, NextResponse } from "next/server";

/**
 * 媒体文件代理路由
 *
 * 后端 GET /media/:id/file 需要 JWT 认证，
 * 但浏览器 <img>/<video> 标签无法携带 Authorization 头。
 * 此路由从 cookie 中读取 auth_token，代理请求到后端并返回文件流。
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  // 服务端运行，直接使用本地地址访问后端；NEXT_PUBLIC_BACKEND_URL 仅用于客户端（config.ts）
  const backendHost = process.env.NEXT_PUBLIC_BACKEND_URL || '127.0.0.1:7050';
  const backendUrl = `http://${backendHost}/api/media/${id}/file`;

  // 从 cookie 中读取认证 token
  const authToken = request.cookies.get("auth_token")?.value;

  if (!authToken) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  try {
    const response = await fetch(backendUrl, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `后端返回 ${response.status}` },
        { status: response.status },
      );
    }

    // 返回文件流
    const arrayBuffer = await response.arrayBuffer();
    const contentType =
      response.headers.get("content-type") || "application/octet-stream";
    const contentDisposition =
      response.headers.get("content-disposition") || undefined;

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        ...(contentDisposition ? { "Content-Disposition": contentDisposition } : {}),
        "Cache-Control": "private, max-age=300",
      },
    });
  } catch (error) {
    console.error("代理媒体文件请求失败:", error);
    return NextResponse.json({ error: "获取媒体文件失败" }, { status: 502 });
  }
}
