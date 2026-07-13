'use client'

import { useState, useEffect, useCallback } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import useUserStore from "@/lib/stores/useUserStore"
import {
  fetchRoles,
  createRole,
  deleteRole,
  assignRoleToUser,
  removeRoleFromUser,
  fetchUsersWithRole,
} from "@/lib/data/roles"
import { searchUserByEmail } from "@/lib/data/user"
import type { Role } from "@/lib/types/types"
import { toast } from "sonner"
import { Shield, Plus, Trash2, ShieldAlert, Loader2, Search, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

/** 检查当前用户是否拥有 admin 角色 */
function isAdmin(user: { roles?: string[] } | null): boolean {
  if (!user?.roles) return false
  return user.roles.includes("admin")
}

export default function AdminPage() {
  const { user, isAuthenticated, isLoading: userLoading, loadUser } = useUserStore()
  const queryClient = useQueryClient()

  // ===== Tab 切换 =====
  const [activeTab, setActiveTab] = useState("roles")

  // ===== 角色管理状态 =====
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newRoleName, setNewRoleName] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null)

  // ===== 用户角色分配状态 =====
  const [searchEmail, setSearchEmail] = useState("")
  const [searchedEmail, setSearchedEmail] = useState<string | null>(null)
  const [userRoles, setUserRoles] = useState<string[]>([])       // 目标用户已有的角色
  const [isSearching, setIsSearching] = useState(false)
  const [assigningRole, setAssigningRole] = useState<string | null>(null)
  const [removingRole, setRemovingRole] = useState<string | null>(null)
  const [userIsProtected, setUserIsProtected] = useState(false)
  const [userFound, setUserFound] = useState<boolean | null>(null) // null=未搜索, true=用户存在, false=用户不存在

  // 加载用户
  useEffect(() => {
    if (isAuthenticated && !user) loadUser()
  }, [isAuthenticated, user, loadUser])

  // ===== 获取所有角色 =====
  const {
    data: allRoles = [],
    isLoading: rolesLoading,
    error: rolesError,
  } = useQuery<Role[]>({
    queryKey: ["roles"],
    queryFn: fetchRoles,
    enabled: isAuthenticated && !!user && isAdmin(user),
  })

  // ===== 可分配的角色（全部角色 - 用户已有的角色） =====
  const availableRoles = allRoles.filter((r) => !userRoles.includes(r.name))

  // ===== 搜索用户：调用后端 GET /users/email/:email 直接查找 =====
  // 该端点返回完整用户对象（含 roles 数组和 is_protected），无需遍历角色
  const handleSearch = useCallback(async () => {
    const email = searchEmail.trim()
    if (!email) {
      toast.error("请输入邮箱地址")
      return
    }

    setIsSearching(true)
    setSearchedEmail(null)
    setUserRoles([])
    setUserIsProtected(false)
    setUserFound(null)

    try {
      // 直接通过邮箱查询用户（后端返回完整用户对象）
      const user = await searchUserByEmail(email)

      if (user) {
        // 用户存在
        const userRoleList = user.roles || []
        setUserRoles(userRoleList)
        setUserIsProtected(!!user.is_protected)
        setSearchedEmail(email)
        setUserFound(true)

        if (userRoleList.length === 0) {
          toast.success(`已找到用户 "${email}"，当前未分配任何角色，可直接点击上方标签为其分配角色`)
        }
        // 有角色时不弹 toast，静默显示
      } else {
        // 用户不存在（后端返回 404 或 null）
        setSearchedEmail(email)
        setUserFound(false)
        toast.info(`未找到邮箱为 "${email}" 的用户，请确认邮箱地址是否正确`)
      }
    } catch (err) {
      toast.error("搜索用户失败")
    } finally {
      setIsSearching(false)
    }
  }, [searchEmail])

  // ===== 分配角色 =====
  const handleAssign = async (roleName: string) => {
    if (!searchedEmail) return

    // admin 角色分配需要确认
    if (roleName === "admin") {
      const confirmed = confirm(`确定要将 admin 角色分配给 ${searchedEmail} 吗？`)
      if (!confirmed) return
    }

    setAssigningRole(roleName)
    try {
      await assignRoleToUser({ email: searchedEmail, roleName })
      toast.success(`已为 ${searchedEmail} 分配角色 "${roleName}"`)
      setUserRoles((prev) => [...prev, roleName])
      queryClient.invalidateQueries({ queryKey: ["roles"] })
    } catch (err: any) {
      toast.error(err.message || "分配角色失败")
    } finally {
      setAssigningRole(null)
    }
  }

  // ===== 移除角色 =====
  const handleRemove = async (roleName: string) => {
    if (!searchedEmail) return

    // 保护检查：受保护用户的 admin 角色不可被移除
    if (roleName === "admin" && userIsProtected) {
      toast.error("受保护用户的管理员角色不可被移除")
      return
    }

    // admin 角色移除需要确认
    if (roleName === "admin") {
      const confirmed = confirm(`确定要从 ${searchedEmail} 移除 admin 角色吗？此操作可能导致权限问题`)
      if (!confirmed) return
    }

    setRemovingRole(roleName)
    try {
      await removeRoleFromUser(searchedEmail, roleName)
      toast.success(`已从 ${searchedEmail} 移除角色 "${roleName}"`)
      setUserRoles((prev) => prev.filter((r) => r !== roleName))
      queryClient.invalidateQueries({ queryKey: ["roles"] })
    } catch (err: any) {
      toast.error(err.message || "移除角色失败")
    } finally {
      setRemovingRole(null)
    }
  }

  // ===== 角色管理 mutations =====
  const createRoleMutation = useMutation({
    mutationFn: (name: string) => createRole(name),
    onSuccess: () => {
      toast.success(`角色 "${newRoleName}" 创建成功`)
      setNewRoleName("")
      setCreateDialogOpen(false)
      queryClient.invalidateQueries({ queryKey: ["roles"] })
    },
    onError: (error: Error) => toast.error(error.message || "创建角色失败"),
  })

  const deleteRoleMutation = useMutation({
    mutationFn: (id: number) => deleteRole(id),
    onSuccess: () => {
      toast.success("角色已删除")
      setDeleteDialogOpen(false)
      setRoleToDelete(null)
      queryClient.invalidateQueries({ queryKey: ["roles"] })
    },
    onError: (error: Error) => toast.error(error.message || "删除角色失败"),
  })

  // ===== 权限检查 =====
  if (userLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Shield className="h-12 w-12 text-muted-foreground" />
        <p className="text-lg text-muted-foreground">请先登录后访问管理页面</p>
      </div>
    )
  }

  if (!isAdmin(user)) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Shield className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-semibold">权限不足</h2>
        <p className="text-muted-foreground">您没有管理员权限，无法访问此页面</p>
        <Badge variant="secondary" className="mt-2">
          当前角色：{user?.roles?.length ? user.roles.join(", ") : "无"}
        </Badge>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-2">
      {/* 页面标题 */}
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">管理员控制面板</h1>
          <p className="text-sm text-muted-foreground">管理系统角色和用户权限分配</p>
        </div>
      </div>

      <Separator />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4" />
            角色管理
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            用户角色分配
          </TabsTrigger>
        </TabsList>

        {/* ============================================================ */}
        {/* Tab 1: 角色管理                                                */}
        {/* ============================================================ */}
        <TabsContent value="roles" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">角色列表</h2>
              <p className="text-sm text-muted-foreground">管理系统中的所有角色</p>
            </div>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              创建角色
            </Button>
          </div>

          {rolesLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : rolesError ? (
            <Card>
              <CardContent className="py-8 text-center text-destructive">
                加载角色列表失败：{(rolesError as Error).message}
              </CardContent>
            </Card>
          ) : allRoles.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">暂无角色数据</CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {allRoles.map((role) => (
                <Card key={role.id} className="relative group">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{role.name}</CardTitle>
                      {role.name !== "admin" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => { setRoleToDelete(role); setDeleteDialogOpen(true) }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <CardDescription>
                      ID: {role.id}
                      {role.name === "admin" && (
                        <Badge variant="secondary" className="ml-2">系统保护</Badge>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {role.permissions && role.permissions.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {role.permissions.map((perm) => (
                          <Badge key={perm.id} variant="outline" className="text-xs">{perm.name}</Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ============================================================ */}
        {/* Tab 2: 用户角色分配（Tag 交互设计）                             */}
        {/* ============================================================ */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Search className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">搜索用户</CardTitle>
              </div>
              <CardDescription>输入邮箱地址搜索用户，查看并管理其角色</CardDescription>
            </CardHeader>
            <CardContent>
              {/* 搜索框 */}
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="输入用户邮箱，如 admin@test.com"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSearch() }}
                  disabled={isSearching}
                  className="flex-1"
                />
                <Button onClick={handleSearch} disabled={isSearching || rolesLoading}>
                  {isSearching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  搜索
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            {/* ===== 区域一：可分配的角色 ===== */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Plus className="h-4 w-4 text-green-500" />
                  可分配的角色
                </CardTitle>
                <CardDescription>
                  {!searchedEmail
                    ? "搜索用户后，此处显示可分配的角色"
                    : userFound === false
                      ? "未找到该用户，无法分配角色"
                      : `点击标签为 ${searchedEmail} 分配角色`
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {rolesLoading ? (
                  <div className="flex items-center justify-center h-20">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : !searchedEmail ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    暂无可用角色
                  </p>
                ) : userFound === false ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    未找到该用户，无法分配角色
                  </p>
                ) : availableRoles.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    该用户已拥有所有角色
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {availableRoles.map((role) => (
                      <Badge
                        key={role.id}
                        variant="outline"
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors text-sm px-3 py-1.5 select-none"
                        onClick={() => handleAssign(role.name)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === "Enter") handleAssign(role.name) }}
                      >
                        {assigningRole === role.name ? (
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        ) : (
                          <Plus className="h-3 w-3 mr-1" />
                        )}
                        {role.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* ===== 区域二：用户已有的角色 ===== */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-4 w-4 text-blue-500" />
                  {searchedEmail ? `${searchedEmail} 的角色` : "用户角色"}
                </CardTitle>
                <CardDescription>
                  {searchedEmail ? (
                    <>
                      点击标签上的 × 可移除该角色
                      {userIsProtected && (
                        <span className="ml-2 text-orange-500 font-medium">（受保护用户）</span>
                      )}
                    </>
                  ) : (
                    "搜索用户后将在此处显示其拥有的角色"
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isSearching ? (
                  <div className="flex items-center justify-center h-20">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : !searchedEmail ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    请在搜索框中输入邮箱后搜索
                  </p>
                ) : userFound === false ? (
                  <div className="text-center py-6">
                    <p className="text-sm text-destructive font-medium">
                      未找到该用户
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      请确认邮箱地址是否正确，该用户可能尚未注册
                    </p>
                  </div>
                ) : userRoles.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-sm text-muted-foreground">
                      该用户当前没有分配任何角色
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      请在左侧「可分配的角色」区域点击角色标签为其授予角色
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {userRoles.map((roleName) => (
                      <Badge
                        key={roleName}
                        variant="secondary"
                        className="text-sm px-3 py-1.5 gap-1"
                      >
                        {removingRole === roleName ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <>
                            {roleName}
                            {roleName === "admin" && userIsProtected ? (
                              <span className="inline-flex items-center text-muted-foreground cursor-not-allowed">
                                <X className="h-3 w-3" />
                              </span>
                            ) : (
                              <span
                                className="inline-flex items-center cursor-pointer hover:text-destructive transition-colors pointer-events-auto"
                                onClick={() => handleRemove(roleName)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => { if (e.key === "Enter") handleRemove(roleName) }}
                              >
                                <X className="h-3 w-3" />
                              </span>
                            )}
                          </>
                        )}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* ===== 创建角色对话框 ===== */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>创建新角色</DialogTitle>
            <DialogDescription>输入新的角色名称，例如：editor、viewer。</DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault()
            if (!newRoleName.trim()) { toast.error("请输入角色名称"); return }
            createRoleMutation.mutate(newRoleName.trim())
          }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-role-name">角色名称</Label>
              <Input
                id="new-role-name"
                placeholder="editor"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                disabled={createRoleMutation.isPending}
                autoFocus
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline"
                onClick={() => { setCreateDialogOpen(false); setNewRoleName("") }}
                disabled={createRoleMutation.isPending}>取消</Button>
              <Button type="submit" disabled={createRoleMutation.isPending}>
                {createRoleMutation.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />创建中...</> : "创建"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ===== 删除角色确认对话框 ===== */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除角色</DialogTitle>
            <DialogDescription>确定要删除角色 "{roleToDelete?.name}" 吗？此操作不可撤销。</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline"
              onClick={() => { setDeleteDialogOpen(false); setRoleToDelete(null) }}
              disabled={deleteRoleMutation.isPending}>取消</Button>
            <Button variant="destructive"
              onClick={() => { if (roleToDelete) deleteRoleMutation.mutate(roleToDelete.id) }}
              disabled={deleteRoleMutation.isPending}>
              {deleteRoleMutation.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />删除中...</> : "确认删除"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
