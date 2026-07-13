"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AuthDialog } from "@/components/pages/login/login";
import useUserStore from "@/lib/stores/useUserStore";

export function AuthRequiredAlert() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { isAuthenticated } = useUserStore();

  const authRequired = searchParams.get('auth_required') === 'true';
  const redirectPath = searchParams.get('redirect');

  useEffect(() => {
    // 如果检测到权限提示，打开登录对话框
    if (authRequired && !isAuthenticated) {
      setIsDialogOpen(true);
    }
  }, [authRequired, isAuthenticated]);

  // 监听登录成功，执行重定向
  useEffect(() => {
    if (isAuthenticated && redirectPath && authRequired) {
      // 登录成功后，重定向到原本想访问的页面
      router.push(redirectPath);
    }
  }, [isAuthenticated, redirectPath, authRequired, router]);

  if (!authRequired) {
    return null;
  }

  return (
    <>
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>需要登录</AlertTitle>
        <AlertDescription className="mt-2">
          <div className="flex flex-col gap-3">
            <p>该页面需要登录后才能访问，请先登录。</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDialogOpen(true)}
            >
              登录
            </Button>
          </div>
        </AlertDescription>
      </Alert>
      
      <AuthDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </>
  );
}
