'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { MapIcon, Library, ArrowLeft, AlertCircle, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getMapById } from '@/lib/data/map';
import type { MapData } from '@/lib/types/types';
import MapViewer from '@/components/pages/map-viewer/map-viewer';
import { useMapViewerStore } from '@/lib/stores/useMapViewerStore';

/**
 * 选择器模式 - 用户直接通过侧边栏导航进入，无 mapId 时显示
 */
const SelectorMode = ({ locale }: { locale: string }) => {
  const t = useTranslations('pages.mapViewer');

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col items-center justify-center py-24 text-center space-y-8">
        <div className="rounded-full bg-primary/10 p-8">
          <MapIcon className="h-16 w-16 text-primary" />
        </div>
        <div className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground text-sm max-w-md">
            {t('selectDescription')}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild size="lg" className="gap-3 text-base">
            <Link href={`/${locale}/map-square`}>
              <MapIcon className="h-5 w-5" />
              {t('browseMapSquare')}
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="gap-3 text-base">
            <Link href={`/${locale}/my-maps`}>
              <Library className="h-5 w-5" />
              {t('viewMyMaps')}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

/**
 * 地图加载状态
 */
const MapLoading = () => (
  <div className="container mx-auto p-6 space-y-4">
    <div className="flex items-center gap-4">
      <Skeleton className="h-10 w-24" />
      <Skeleton className="h-8 w-48" />
    </div>
    <Skeleton className="w-full h-[calc(100vh-12rem)] rounded-lg" />
  </div>
);

/**
 * 地图加载失败
 */
const MapError = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
  <div className="container mx-auto p-6">
    <div className="flex flex-col items-center justify-center py-24 text-center space-y-6">
      <div className="rounded-full bg-destructive/10 p-6">
        <AlertCircle className="h-12 w-12 text-destructive" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">加载失败</h2>
        <p className="text-muted-foreground text-sm max-w-md">{message}</p>
      </div>
      <Button onClick={onRetry} variant="outline" className="gap-2">
        <RefreshCw className="h-4 w-4" />
        重试
      </Button>
    </div>
  </div>
);

/**
 * 地图查看模式 - 有 mapId 时显示
 */
const ViewerMode = ({ mapId, locale }: { mapId: number; locale: string }) => {
  const t = useTranslations('pages.mapViewer');
  const [mapData, setMapData] = useState<MapData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMap = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getMapById(mapId);
      if (data) {
        setMapData(data);
      } else {
        setError(t('notFound'));
      }
    } catch (err: any) {
      setError(err?.message || t('loadError'));
    } finally {
      setIsLoading(false);
    }
  }, [mapId, t]);

  useEffect(() => {
    fetchMap();
  }, [fetchMap]);

  if (isLoading) return <MapLoading />;
  if (error) return <MapError message={error} onRetry={fetchMap} />;
  if (!mapData) return <MapError message={t('notFound')} onRetry={fetchMap} />;

  return (
    <div className="w-full">
      {/* 顶部信息栏 */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="shrink-0"
          >
            <Link href={`/${locale}/map-square`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h2 className="text-base font-semibold leading-tight truncate max-w-[300px] sm:max-w-md">
              {mapData.name}
            </h2>
            {mapData.owner && (
              <p className="text-xs text-muted-foreground">
                {mapData.owner.first_name} {mapData.owner.last_name}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/${locale}/map-square`}>
              {t('backToSquare')}
            </Link>
          </Button>
        </div>
      </div>

      {/* 地图容器 - 使用 calc 确保高度正确 */}
      <div className="w-full h-[calc(100vh-8rem)]">
        <MapViewer mapData={mapData} className="w-full h-full" />
      </div>
    </div>
  );
};

/**
 * 主页面组件 - 使用 useSearchParams 读取 mapId，并通过 store 持久化
 */
const MapViewerPage = () => {
  const locale = useLocale();
  const searchParams = useSearchParams();
  const { lastMapId, setLastMapId } = useMapViewerStore();

  const mapIdParam = searchParams.get('mapId');

  // 当 URL 中有 mapId 时，将其持久化到 store（通过 useEffect 避免在渲染中更新 store）
  useEffect(() => {
    if (mapIdParam) {
      const mapId = parseInt(mapIdParam, 10);
      if (!isNaN(mapId)) {
        setLastMapId(mapId);
      }
    }
  }, [mapIdParam, setLastMapId]);

  // 1) 优先使用 URL 参数中的 mapId
  if (mapIdParam) {
    const mapId = parseInt(mapIdParam, 10);
    if (!isNaN(mapId)) {
      return <ViewerMode mapId={mapId} locale={locale} />;
    }
  }

  // 2) URL 中没有有效 mapId 时，尝试从 store 恢复上次查看的地图
  if (lastMapId !== null) {
    return <ViewerMode mapId={lastMapId} locale={locale} />;
  }

  // 3) 都没有，显示选择器
  return <SelectorMode locale={locale} />;
};

/**
 * 页面入口 - 添加 Suspense 边界（Next.js 15+ 要求 useSearchParams 在 Suspense 内）
 */
const Page = () => {
  return (
    <Suspense fallback={<MapLoading />}>
      <MapViewerPage />
    </Suspense>
  );
};

export default Page;
