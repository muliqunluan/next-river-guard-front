'use client'
import useUserStore from "@/lib/stores/useUserStore"

const Page = () => {
    const { user, isLoading, isAuthenticated } = useUserStore()
    console.log(user?.email)
    if (isLoading) return <div>加载中...</div>;

    if (!isAuthenticated) return <div>请先登录</div>;
    return (
        <div>
            <h1>用户信息</h1>
            <p>用户名: {user?.first_name}{user?.last_name}</p>
            <p>邮箱: {user?.email}</p>
        </div>
    )
}

export default Page