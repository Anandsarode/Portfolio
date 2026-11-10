import React, { useState, useMemo } from 'react';
import {
  GripVertical,
  Download,
  ArrowUp,
  ArrowDown,
  Columns,
  Square,
  RotateCcw,
  Search,
} from 'lucide-react';
import type {
  AnalyticsEvent,
  AnalyticsWidgetConfig,
  ContentBlock,
  SocialProfile,
} from '../types';

interface AnalyticsViewProps {
  events: AnalyticsEvent[];
  blocks: ContentBlock[];
  socials: SocialProfile[];
  widgets: AnalyticsWidgetConfig[];
  onUpdateWidgetLayout: (nextWidgets: AnalyticsWidgetConfig[]) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  events,
  blocks,
  socials,
  widgets,
  onUpdateWidgetLayout,
}) => {
  const [timeWindow, setTimeWindow] = useState<'7d' | '14d' | 'all'>('14d');
  const [draggedWidgetIdx, setDraggedWidgetIdx] = useState<number | null>(null);
  const [dragOverWidgetIdx, setDragOverWidgetIdx] = useState<number | null>(null);
  const [eventSearch, setEventSearch] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState<'all' | 'page_view' | 'link_click' | 'social_click' | 'media_play'>('all');

  const filteredEvents = useMemo(() => {
    const now = Date.now();
    const cutoff =
      timeWindow === '7d'
        ? now - 7 * 86400000
        : timeWindow === '14d'
        ? now - 14 * 86400000
        : 0;

    return events.filter((evt) => {
      const ts = new Date(evt.timestamp).getTime();
      if (cutoff > 0 && ts < cutoff) return false;
      if (eventTypeFilter !== 'all' && evt.type !== eventTypeFilter) return false;
      if (eventSearch.trim()) {
        const q = eventSearch.toLowerCase();
        const matchTitle = (evt.targetTitle || '').toLowerCase().includes(q);
        const matchRef = evt.referrer.toLowerCase().includes(q);
        const matchRegion = evt.region.toLowerCase().includes(q);
        return matchTitle || matchRef || matchRegion;
      }
      return true;
    });
  }, [events, timeWindow, eventTypeFilter, eventSearch]);

  const metrics = useMemo(() => {
    const pageViews = filteredEvents.filter((e) => e.type === 'page_view').length;
    const linkClicks = filteredEvents.filter((e) => e.type === 'link_click').length;
    const socialClicks = filteredEvents.filter((e) => e.type === 'social_click').length;
    const mediaPlays = filteredEvents.filter((e) => e.type === 'media_play').length;
    const totalInteractions = linkClicks + socialClicks + mediaPlays;
    const ctr = pageViews > 0 ? ((totalInteractions / pageViews) * 100).toFixed(1) : '0.0';

    // Daily timeline aggregation
    const daysCount = timeWindow === '7d' ? 7 : 14;
    const dailySeries: Array<{ dateLabel: string; views: number; clicks: number }> = [];
    const now = new Date();

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const dayKey = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const dayEvents = filteredEvents.filter((e) => e.timestamp.slice(0, 10) === dayKey);
      dailySeries.push({
        dateLabel: label,
        views: dayEvents.filter((e) => e.type === 'page_view').length,
        clicks: dayEvents.filter((e) => e.type !== 'page_view').length,
      });
    }

    // Referrer aggregation
    const refCounts: Record<string, number> = {};
    filteredEvents.forEach((e) => {
      refCounts[e.referrer] = (refCounts[e.referrer] || 0) + 1;
    });
    const referrers = Object.entries(refCounts)
      .map(([name, count]) => ({
        name,
        count,
        share: filteredEvents.length > 0 ? ((count / filteredEvents.length) * 100).toFixed(1) : '0.0',
      }))
      .sort((a, b) => b.count - a.count);

    // Device & Region aggregation
    const devCounts: Record<string, number> = { Desktop: 0, Mobile: 0, Tablet: 0 };
    const regCounts: Record<string, number> = {};
    filteredEvents.forEach((e) => {
      devCounts[e.device] = (devCounts[e.device] || 0) + 1;
      regCounts[e.region] = (regCounts[e.region] || 0) + 1;
    });

    const topRegions = Object.entries(regCounts)
      .map(([region, count]) => ({ region, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      pageViews,
      linkClicks,
      socialClicks,
      mediaPlays,
      totalInteractions,
      ctr,
      dailySeries,
      referrers,
      devCounts,
      topRegions,
    };
  }, [filteredEvents, timeWindow]);

  const handleWidgetDragStart = (index: number) => {
    setDraggedWidgetIdx(index);
  };

  const handleWidgetDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragOverWidgetIdx !== index) {
      setDragOverWidgetIdx(index);
    }
  };

  const handleWidgetDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedWidgetIdx === null || draggedWidgetIdx === dropIndex) {
      setDraggedWidgetIdx(null);
      setDragOverWidgetIdx(null);
      return;
    }

    const reordered = [...widgets];
    const [moved] = reordered.splice(draggedWidgetIdx, 1);
    reordered.splice(dropIndex, 0, moved);
    onUpdateWidgetLayout(reordered);
    setDraggedWidgetIdx(null);
    setDragOverWidgetIdx(null);
  };

  const moveWidget = (index: number, direction: -1 | 1) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= widgets.length) return;
    const reordered = [...widgets];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIdx, 0, moved);
    onUpdateWidgetLayout(reordered);
  };

  const toggleWidgetColSpan = (id: AnalyticsWidgetConfig['id']) => {
    onUpdateWidgetLayout(
      widgets.map((w) =>
        w.id === id ? { ...w, colSpan: w.colSpan === 2 ? 1 : 2 } : w
      )
    );
  };

  const resetWidgetLayout = () => {
    const defaultOrder: AnalyticsWidgetConfig['id'][] = [
      'kpi_summary',
      'traffic_timeline',
      'top_links',
      'referrer_sources',
      'device_distribution',
      'event_stream',
    ];
    const sorted = [...widgets].sort(
      (a, b) => defaultOrder.indexOf(a.id) - defaultOrder.indexOf(b.id)
    );
    onUpdateWidgetLayout(sorted);
  };

  const exportCsv = () => {
    const header = ['Event ID', 'Timestamp', 'Event Type', 'Target Title', 'Referrer', 'Device', 'Region'];
    const rows = filteredEvents.map((e) => [
      e.id,
      e.timestamp,
      e.type,
      `"${(e.targetTitle || 'Landing Page').replace(/"/g, '""')}"`,
      `"${e.referrer}"`,
      e.device,
      `"${e.region}"`,
    ]);
    const csvContent = [header.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `atelier-link-telemetry-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const maxDailyViews = Math.max(
    1,
    ...metrics.dailySeries.map((d) => Math.max(d.views, d.clicks))
  );

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8">
      {/* Analytics Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#E6E1DA] dark:border-[#26262B]">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#6E6A63] dark:text-[#9E988E] mb-1">
            <span>Attribution Intelligence</span>
            <span aria-hidden="true">·</span>
            <span>Drag-and-Drop Modular Grid</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{filteredEvents.length} Events in Window</span>
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl font-semibold tracking-tight text-[#181615] dark:text-[#F4F1EA]">
            Drag-and-Drop Engagement Analytics
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Date Window Segmented Control */}
          <div className="flex items-center gap-1 p-1 bg-[#EFECE6] dark:bg-[#18181C] rounded-lg border border-[#E4DFD7] dark:border-[#26262B]">
            <button
              type="button"
              onClick={() => setTimeWindow('7d')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                timeWindow === '7d'
                  ? 'bg-white dark:bg-[#26262C] text-[#181615] dark:text-[#F4F1EA] shadow-xs'
                  : 'text-[#6E6A63] dark:text-[#9E988E]'
              }`}
            >
              7 Days
            </button>
            <button
              type="button"
              onClick={() => setTimeWindow('14d')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                timeWindow === '14d'
                  ? 'bg-white dark:bg-[#26262C] text-[#181615] dark:text-[#F4F1EA] shadow-xs'
                  : 'text-[#6E6A63] dark:text-[#9E988E]'
              }`}
            >
              14 Days
            </button>
            <button
              type="button"
              onClick={() => setTimeWindow('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                timeWindow === 'all'
                  ? 'bg-white dark:bg-[#26262C] text-[#181615] dark:text-[#F4F1EA] shadow-xs'
                  : 'text-[#6E6A63] dark:text-[#9E988E]'
              }`}
            >
              All Time
            </button>
          </div>

          <button
            type="button"
            onClick={resetWidgetLayout}
            className="px-3.5 py-2 text-xs font-medium border border-[#D8D2C9] dark:border-[#323238] bg-white dark:bg-[#16161A] text-[#181615] dark:text-[#F4F1EA] rounded-lg hover:bg-[#F3EFEA] dark:hover:bg-[#1E1E24] flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Layout</span>
          </button>

          <button
            type="button"
            onClick={exportCsv}
            className="px-4 py-2 text-xs font-medium bg-[#181615] dark:bg-[#F4F1EA] text-[#FAF8F5] dark:text-[#0C0C0E] rounded-lg hover:opacity-90 flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV</span>
          </button>
        </div>
      </div>

      {/* Rearrangeable Drag-and-Drop Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {widgets.map((widget, index) => {
          const isDragged = draggedWidgetIdx === index;
          const isDragOver = dragOverWidgetIdx === index;

          return (
            <div
              key={widget.id}
              draggable
              onDragStart={() => handleWidgetDragStart(index)}
              onDragOver={(e) => handleWidgetDragOver(e, index)}
              onDrop={(e) => handleWidgetDrop(e, index)}
              onDragEnd={() => {
                setDraggedWidgetIdx(null);
                setDragOverWidgetIdx(null);
              }}
              className={`border rounded-xl bg-white dark:bg-[#16161A] p-6 transition-all duration-150 ${
                widget.colSpan === 2 ? 'lg:col-span-2' : 'lg:col-span-1'
              } ${
                isDragOver
                  ? 'border-[#C84B31] ring-1 ring-[#C84B31]/40'
                  : 'border-[#E6E1DA] dark:border-[#26262B]'
              } ${isDragged ? 'opacity-50 scale-[0.99]' : 'opacity-100'}`}
            >
              {/* Widget Header with Drag Handle & Span Controls */}
              <div className="flex items-start justify-between gap-4 pb-4 mb-5 border-b border-[#EFECE6] dark:border-[#222228]">
                <div className="flex items-start gap-2.5">
                  <div
                    className="mt-1 text-[#9E988E] hover:text-[#181615] dark:hover:text-white cursor-grab active:cursor-grabbing shrink-0"
                    title="Drag card to rearrange analytics layout"
                  >
                    <GripVertical className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-editorial text-xl font-semibold text-[#181615] dark:text-[#F4F1EA]">
                      {widget.title}
                    </h2>
                    <p className="text-xs text-[#6E6A63] dark:text-[#9E988E] mt-0.5">
                      {widget.subtitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => moveWidget(index, -1)}
                    disabled={index === 0}
                    title="Move Widget Earlier"
                    className="p-1.5 rounded-md text-[#6E6A63] hover:text-[#181615] dark:hover:text-white disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveWidget(index, 1)}
                    disabled={index === widgets.length - 1}
                    title="Move Widget Later"
                    className="p-1.5 rounded-md text-[#6E6A63] hover:text-[#181615] dark:hover:text-white disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleWidgetColSpan(widget.id)}
                    title="Toggle 1-Column / 2-Column Span"
                    className="px-2 py-1 rounded-md text-xs font-medium text-[#6E6A63] hover:text-[#181615] dark:hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    {widget.colSpan === 2 ? (
                      <>
                        <Square className="w-3.5 h-3.5" />
                        <span>Full Width</span>
                      </>
                    ) : (
                      <>
                        <Columns className="w-3.5 h-3.5" />
                        <span>Half Width</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Widget Body by Type */}
              {widget.id === 'kpi_summary' && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                  <div>
                    <div className="text-xs text-[#6E6A63] dark:text-[#9E988E]">
                      Landing Page Views
                    </div>
                    <div className="mt-1 font-mono text-3xl font-semibold tabular-nums text-[#181615] dark:text-[#F4F1EA]">
                      {metrics.pageViews.toLocaleString()}
                    </div>
                    <div className="mt-1 text-xs text-[#6E6A63] dark:text-[#9E988E]">
                      Unique sessions · Real-time
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-[#6E6A63] dark:text-[#9E988E]">
                      Outbound Link Clicks
                    </div>
                    <div className="mt-1 font-mono text-3xl font-semibold tabular-nums text-[#181615] dark:text-[#F4F1EA]">
                      {metrics.linkClicks.toLocaleString()}
                    </div>
                    <div className="mt-1 text-xs text-[#6E6A63] dark:text-[#9E988E]">
                      Featured blocks · Direct taps
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-[#6E6A63] dark:text-[#9E988E]">
                      Media & Social Actions
                    </div>
                    <div className="mt-1 font-mono text-3xl font-semibold tabular-nums text-[#181615] dark:text-[#F4F1EA]">
                      {(metrics.mediaPlays + metrics.socialClicks).toLocaleString()}
                    </div>
                    <div className="mt-1 text-xs text-[#6E6A63] dark:text-[#9E988E]">
                      {metrics.mediaPlays} media · {metrics.socialClicks} social
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-[#6E6A63] dark:text-[#9E988E]">
                      Click-Through Rate (CTR)
                    </div>
                    <div className="mt-1 font-mono text-3xl font-semibold tabular-nums text-[#C84B31]">
                      {metrics.ctr}%
                    </div>
                    <div className="mt-1 text-xs text-[#6E6A63] dark:text-[#9E988E]">
                      Interactions per page view
                    </div>
                  </div>
                </div>
              )}

              {widget.id === 'traffic_timeline' && (
                <div>
                  <div className="flex items-center justify-between text-xs text-[#6E6A63] dark:text-[#9E988E] mb-4">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 bg-[#181615] dark:bg-[#F4F1EA] inline-block" />
                        <span>Page Views</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 bg-[#C84B31] inline-block" />
                        <span>Outbound Clicks & Plays</span>
                      </span>
                    </div>
                    <span className="font-mono tabular-nums">
                      Peak: {maxDailyViews} events/day
                    </span>
                  </div>

                  <div className="grid grid-cols-7 sm:grid-cols-14 gap-2 items-end h-44 pt-4 border-b border-[#E6E1DA] dark:border-[#26262B]">
                    {metrics.dailySeries.map((day, idx) => {
                      const viewHeightPct = Math.max(8, Math.round((day.views / maxDailyViews) * 100));
                      const clickHeightPct = Math.max(6, Math.round((day.clicks / maxDailyViews) * 100));
                      return (
                        <div key={idx} className="flex flex-col items-center h-full justify-end group">
                          <div className="w-full flex items-end justify-center gap-1 h-32">
                            <div
                              style={{ height: `${viewHeightPct}%` }}
                              title={`${day.dateLabel}: ${day.views} views`}
                              className="w-2.5 bg-[#181615] dark:bg-[#F4F1EA] rounded-t-xs transition-opacity group-hover:opacity-80"
                            />
                            <div
                              style={{ height: `${clickHeightPct}%` }}
                              title={`${day.dateLabel}: ${day.clicks} clicks`}
                              className="w-2.5 bg-[#C84B31] rounded-t-xs transition-opacity group-hover:opacity-80"
                            />
                          </div>
                          <span className="mt-2 text-[10px] font-mono tabular-nums text-[#6E6A63] dark:text-[#9E988E] truncate">
                            {day.dateLabel}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {widget.id === 'top_links' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#E6E1DA] dark:border-[#26262B] text-[11px] text-[#6E6A63] dark:text-[#9E988E]">
                        <th className="py-2 font-medium">Block Title & Category</th>
                        <th className="py-2 font-medium text-right">Clicks</th>
                        <th className="py-2 font-medium text-right">Share</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F0ECE4] dark:divide-[#222228] text-xs">
                      {blocks
                        .slice()
                        .sort((a, b) => b.clicks - a.clicks)
                        .map((blk) => {
                          const totalBlockClicks = Math.max(
                            1,
                            blocks.reduce((acc, b) => acc + b.clicks, 0)
                          );
                          const sharePct = ((blk.clicks / totalBlockClicks) * 100).toFixed(1);
                          return (
                            <tr key={blk.id} className="hover:bg-[#FAF8F5] dark:hover:bg-[#1C1C22]">
                              <td className="py-2.5 pr-3">
                                <div className="font-medium text-[#181615] dark:text-[#F4F1EA] truncate max-w-[260px]">
                                  {blk.title}
                                </div>
                                <div className="text-[11px] text-[#6E6A63] dark:text-[#9E988E]">
                                  {blk.category} · {blk.publishedDate}
                                </div>
                              </td>
                              <td className="py-2.5 text-right font-mono tabular-nums font-medium text-[#181615] dark:text-[#F4F1EA]">
                                {blk.clicks.toLocaleString()}
                              </td>
                              <td className="py-2.5 text-right font-mono tabular-nums text-[#6E6A63] dark:text-[#9E988E]">
                                {sharePct}%
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              )}

              {widget.id === 'referrer_sources' && (
                <div className="space-y-3">
                  {metrics.referrers.map((ref) => (
                    <div key={ref.name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-[#181615] dark:text-[#F4F1EA]">
                          {ref.name}
                        </span>
                        <span className="font-mono tabular-nums text-[#6E6A63] dark:text-[#9E988E]">
                          {ref.count} visits · {ref.share}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-[#EFECE6] dark:bg-[#222228] rounded-sm overflow-hidden">
                        <div
                          style={{ width: `${Math.max(4, Number(ref.share))}%` }}
                          className="h-full bg-[#181615] dark:bg-[#F4F1EA]"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {widget.id === 'device_distribution' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <div className="text-xs font-medium text-[#6E6A63] dark:text-[#9E988E] mb-3">
                      Viewport Form Factor
                    </div>
                    <div className="space-y-2.5 text-xs">
                      {(['Desktop', 'Mobile', 'Tablet'] as const).map((dev) => {
                        const count = metrics.devCounts[dev] || 0;
                        const pct =
                          filteredEvents.length > 0
                            ? ((count / filteredEvents.length) * 100).toFixed(1)
                            : '0.0';
                        return (
                          <div
                            key={dev}
                            className="flex items-center justify-between py-1.5 border-b border-[#F0ECE4] dark:border-[#222228]"
                          >
                            <span className="text-[#181615] dark:text-[#F4F1EA]">{dev}</span>
                            <span className="font-mono tabular-nums text-[#6E6A63] dark:text-[#9E988E]">
                              {count} · {pct}%
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-medium text-[#6E6A63] dark:text-[#9E988E] mb-3">
                      Top Visitor Hubs
                    </div>
                    <div className="space-y-2.5 text-xs">
                      {metrics.topRegions.map((item) => (
                        <div
                          key={item.region}
                          className="flex items-center justify-between py-1.5 border-b border-[#F0ECE4] dark:border-[#222228]"
                        >
                          <span className="text-[#181615] dark:text-[#F4F1EA]">{item.region}</span>
                          <span className="font-mono tabular-nums text-[#6E6A63] dark:text-[#9E988E]">
                            {item.count} events
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {widget.id === 'event_stream' && (
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#6E6A63]" />
                      <input
                        type="text"
                        value={eventSearch}
                        onChange={(e) => setEventSearch(e.target.value)}
                        placeholder="Filter ledger by block title, referrer, or city..."
                        className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-[#D8D2C9] dark:border-[#2E2E36] bg-[#FAF8F5] dark:bg-[#0C0C0E]"
                      />
                    </div>
                    <select
                      value={eventTypeFilter}
                      onChange={(e) => setEventTypeFilter(e.target.value as typeof eventTypeFilter)}
                      className="px-2.5 py-1.5 text-xs rounded-lg border border-[#D8D2C9] dark:border-[#2E2E36] bg-[#FAF8F5] dark:bg-[#0C0C0E]"
                    >
                      <option value="all">All Event Types</option>
                      <option value="page_view">Page Views</option>
                      <option value="link_click">Link Clicks</option>
                      <option value="media_play">Media Plays</option>
                      <option value="social_click">Social Clicks</option>
                    </select>
                  </div>

                  <div className="max-h-60 overflow-y-auto divide-y divide-[#F0ECE4] dark:divide-[#222228] text-xs">
                    {filteredEvents.slice(0, 25).map((evt) => (
                      <div key={evt.id} className="py-2 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-medium text-[#181615] dark:text-[#F4F1EA] truncate">
                            {evt.targetTitle || 'Landing Page View'}
                          </div>
                          <div className="text-[11px] text-[#6E6A63] dark:text-[#9E988E]">
                            {evt.type.replace('_', ' ')} · via {evt.referrer} · {evt.region}
                          </div>
                        </div>
                        <div className="font-mono text-[11px] tabular-nums text-[#6E6A63] shrink-0">
                          {new Date(evt.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
