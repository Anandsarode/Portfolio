import React, { useState } from 'react';
import {
  GripVertical,
  Plus,
  Trash2,
  Edit3,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Link2,
  Film,
  Share2,
  Check,
  X,
  Monitor,
  Smartphone,
  Columns,
  Square,
} from 'lucide-react';
import type {
  ProfileConfig,
  SocialProfile,
  ContentBlock,
  BlockType,
  MediaEmbedKind,
  SocialPlatform,
} from '../types';
import { LandingPageRenderer } from './LandingPageRenderer';

interface PageBuilderViewProps {
  profile: ProfileConfig;
  socials: SocialProfile[];
  blocks: ContentBlock[];
  primaryDomain?: string;
  onUpdateProfile: (updates: Partial<ProfileConfig>) => void;
  onUpdateBlocks: (nextBlocks: ContentBlock[]) => void;
  onUpdateSocials: (nextSocials: SocialProfile[]) => void;
  onRecordEvent: (
    type: 'page_view' | 'link_click' | 'social_click' | 'media_play',
    targetId?: string,
    targetTitle?: string
  ) => void;
}

const CURATED_THUMBNAILS = [
  {
    label: 'Architectural Monograph',
    url: '/src/assets/images/thumb_monograph_book_1794161555548.jpg',
  },
  {
    label: 'Sculptural Gallery Exhibition',
    url: '/src/assets/images/thumb_exhibition_gallery_1794161555364.jpg',
  },
  {
    label: 'Analog Studio Synthesizer',
    url: '/src/assets/images/thumb_acoustic_session_1794161557011.jpg',
  },
  {
    label: 'Sunlit Travertine Studio',
    url: '/src/assets/images/cover_atelier_architecture_1794161554142.jpg',
  },
];

export const PageBuilderView: React.FC<PageBuilderViewProps> = ({
  profile,
  socials,
  blocks,
  primaryDomain,
  onUpdateProfile,
  onUpdateBlocks,
  onUpdateSocials,
  onRecordEvent,
}) => {
  const [activeEditorTab, setActiveEditorTab] = useState<'blocks' | 'socials'>('blocks');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [editingBlock, setEditingBlock] = useState<ContentBlock | null>(null);
  const [isCreatingBlock, setIsCreatingBlock] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  // New social form state
  const [newSocialPlatform, setNewSocialPlatform] = useState<SocialPlatform>('substack');
  const [newSocialLabel, setNewSocialLabel] = useState('Substack');
  const [newSocialHandle, setNewSocialHandle] = useState('@elenarostova');
  const [newSocialUrl, setNewSocialUrl] = useState('https://substack.com');

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const updated = [...blocks];
    const [moved] = updated.splice(draggedIndex, 1);
    updated.splice(dropIndex, 0, moved);
    onUpdateBlocks(updated);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const moveBlock = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= blocks.length) return;
    const updated = [...blocks];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    onUpdateBlocks(updated);
  };

  const toggleBlockVisibility = (id: string) => {
    onUpdateBlocks(
      blocks.map((b) => (b.id === id ? { ...b, enabled: !b.enabled } : b))
    );
  };

  const toggleBlockSpan = (id: string) => {
    onUpdateBlocks(
      blocks.map((b) =>
        b.id === id
          ? { ...b, featuredSpan: b.featuredSpan === 'full' ? 'half' : 'full' }
          : b
      )
    );
  };

  const deleteBlock = (id: string) => {
    onUpdateBlocks(blocks.filter((b) => b.id !== id));
    if (editingBlock?.id === id) {
      setEditingBlock(null);
    }
  };

  const startNewBlock = (type: BlockType) => {
    const draft: ContentBlock = {
      id: `blk-${Date.now()}`,
      type,
      title:
        type === 'media_embed'
          ? 'Acoustic Space & Light — Studio Recording'
          : 'New Editorial Publication or Featured Link',
      subtitle:
        type === 'media_embed'
          ? 'Live recorded study from our autumn architectural residency.'
          : 'Explore full project documentation, essays, and curated reference material.',
      category: type === 'media_embed' ? 'Media Embed' : 'Featured Link',
      publishedDate: 'November 2026',
      url: 'https://en.wikipedia.org/wiki/Architecture',
      thumbnailUrl: CURATED_THUMBNAILS[0].url,
      featuredSpan: 'full',
      mediaKind: type === 'media_embed' ? 'audio_studio' : undefined,
      mediaEmbedUrl:
        type === 'media_embed' ? 'https://www.youtube.com/embed/jfKfPfyJRdk' : undefined,
      durationLabel: type === 'media_embed' ? '03:45' : undefined,
      enabled: true,
      clicks: 0,
    };
    setEditingBlock(draft);
    setIsCreatingBlock(true);
  };

  const saveEditingBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBlock) return;

    const normalizedUrl =
      editingBlock.url && !/^https?:\/\//i.test(editingBlock.url)
        ? `https://${editingBlock.url}`
        : editingBlock.url;

    const finalBlock: ContentBlock = {
      ...editingBlock,
      url: normalizedUrl,
    };

    if (isCreatingBlock) {
      onUpdateBlocks([finalBlock, ...blocks]);
    } else {
      onUpdateBlocks(
        blocks.map((b) => (b.id === finalBlock.id ? finalBlock : b))
      );
    }

    setEditingBlock(null);
    setIsCreatingBlock(false);
  };

  const handleAddSocial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSocialLabel.trim() || !newSocialUrl.trim()) return;
    const normalizedUrl = /^https?:\/\//i.test(newSocialUrl.trim())
      ? newSocialUrl.trim()
      : `https://${newSocialUrl.trim()}`;

    const created: SocialProfile = {
      id: `soc-${Date.now()}`,
      platform: newSocialPlatform,
      label: newSocialLabel.trim(),
      handle: newSocialHandle.trim() || `@${profile.handle}`,
      url: normalizedUrl,
      enabled: true,
      clicks: 0,
    };

    onUpdateSocials([...socials, created]);
    setNewSocialLabel('');
    setNewSocialHandle('');
    setNewSocialUrl('');
  };

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8">
      {/* Studio Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#E6E1DA] dark:border-[#26262B]">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#6E6A63] dark:text-[#9E988E] mb-1">
            <span>Workspace</span>
            <span aria-hidden="true">·</span>
            <span>Curated Page Architecture</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{blocks.length} Total Blocks</span>
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl font-semibold tracking-tight text-[#181615] dark:text-[#F4F1EA]">
            Page Builder & Content Architecture
          </h1>
        </div>

        {/* Segmented Control for Editor Mode */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 p-1 bg-[#EFECE6] dark:bg-[#18181C] rounded-lg border border-[#E4DFD7] dark:border-[#26262B]">
            <button
              type="button"
              onClick={() => setActiveEditorTab('blocks')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeEditorTab === 'blocks'
                  ? 'bg-white dark:bg-[#26262C] text-[#181615] dark:text-[#F4F1EA] shadow-xs'
                  : 'text-[#6E6A63] dark:text-[#9E988E] hover:text-[#181615] dark:hover:text-white'
              }`}
            >
              Content Blocks ({blocks.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveEditorTab('socials')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeEditorTab === 'socials'
                  ? 'bg-white dark:bg-[#26262C] text-[#181615] dark:text-[#F4F1EA] shadow-xs'
                  : 'text-[#6E6A63] dark:text-[#9E988E] hover:text-[#181615] dark:hover:text-white'
              }`}
            >
              Social Profiles ({socials.length})
            </button>
          </div>

          <button
            type="button"
            onClick={() => startNewBlock('featured_link')}
            className="px-4 py-2 text-xs font-medium bg-[#181615] dark:bg-[#F4F1EA] text-[#FAF8F5] dark:text-[#0C0C0E] rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Featured Link</span>
          </button>

          <button
            type="button"
            onClick={() => startNewBlock('media_embed')}
            className="px-4 py-2 text-xs font-medium border border-[#D8D2C9] dark:border-[#323238] bg-white dark:bg-[#16161A] text-[#181615] dark:text-[#F4F1EA] rounded-lg hover:bg-[#F3EFEA] dark:hover:bg-[#1E1E24] transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Film className="w-3.5 h-3.5" />
            <span>Add Media Embed</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Split: Left Drag-and-Drop Manager + Right Live Interactive Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8 items-start">
        {/* Left Column: Block & Social Manager */}
        <div className="lg:col-span-5 space-y-5">
          {editingBlock && (
            <form
              onSubmit={saveEditingBlock}
              className="border border-[#C84B31]/40 bg-white dark:bg-[#16161A] rounded-xl p-5 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#E6E1DA] dark:border-[#26262B]">
                <h2 className="font-editorial text-xl font-semibold text-[#181615] dark:text-[#F4F1EA]">
                  {isCreatingBlock ? 'Create Content Block' : 'Edit Content Block'}
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setEditingBlock(null);
                    setIsCreatingBlock(false);
                  }}
                  className="p-1 text-[#6E6A63] hover:text-[#181615] dark:hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#4A4640] dark:text-[#B8B3A8] mb-1">
                    Block Type
                  </label>
                  <select
                    value={editingBlock.type}
                    onChange={(e) =>
                      setEditingBlock({
                        ...editingBlock,
                        type: e.target.value as BlockType,
                        mediaKind:
                          e.target.value === 'media_embed'
                            ? editingBlock.mediaKind || 'audio_studio'
                            : undefined,
                      })
                    }
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#D8D2C9] dark:border-[#2E2E36] bg-[#FAF8F5] dark:bg-[#0C0C0E] text-[#181615] dark:text-[#F4F1EA]"
                  >
                    <option value="featured_link">Featured Link with Thumbnail</option>
                    <option value="media_embed">Rich Media Embed (Audio / Video)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#4A4640] dark:text-[#B8B3A8] mb-1">
                    Grid Width Span
                  </label>
                  <select
                    value={editingBlock.featuredSpan}
                    onChange={(e) =>
                      setEditingBlock({
                        ...editingBlock,
                        featuredSpan: e.target.value as 'full' | 'half',
                      })
                    }
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#D8D2C9] dark:border-[#2E2E36] bg-[#FAF8F5] dark:bg-[#0C0C0E] text-[#181615] dark:text-[#F4F1EA]"
                  >
                    <option value="full">Full Width Showcase (2 Columns)</option>
                    <option value="half">Half Width Card (1 Column)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#4A4640] dark:text-[#B8B3A8] mb-1">
                  Headline Title
                </label>
                <input
                  type="text"
                  required
                  value={editingBlock.title}
                  onChange={(e) => setEditingBlock({ ...editingBlock, title: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-[#D8D2C9] dark:border-[#2E2E36] bg-[#FAF8F5] dark:bg-[#0C0C0E] text-[#181615] dark:text-[#F4F1EA]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#4A4640] dark:text-[#B8B3A8] mb-1">
                  Editorial Subtitle / Description
                </label>
                <textarea
                  rows={2}
                  value={editingBlock.subtitle}
                  onChange={(e) => setEditingBlock({ ...editingBlock, subtitle: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#D8D2C9] dark:border-[#2E2E36] bg-[#FAF8F5] dark:bg-[#0C0C0E] text-[#181615] dark:text-[#F4F1EA]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#4A4640] dark:text-[#B8B3A8] mb-1">
                    Category Label (Unboxed Kicker)
                  </label>
                  <input
                    type="text"
                    value={editingBlock.category}
                    onChange={(e) => setEditingBlock({ ...editingBlock, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#D8D2C9] dark:border-[#2E2E36] bg-[#FAF8F5] dark:bg-[#0C0C0E] text-[#181615] dark:text-[#F4F1EA]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#4A4640] dark:text-[#B8B3A8] mb-1">
                    Edition / Date Metadata
                  </label>
                  <input
                    type="text"
                    value={editingBlock.publishedDate}
                    onChange={(e) =>
                      setEditingBlock({ ...editingBlock, publishedDate: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#D8D2C9] dark:border-[#2E2E36] bg-[#FAF8F5] dark:bg-[#0C0C0E] text-[#181615] dark:text-[#F4F1EA]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#4A4640] dark:text-[#B8B3A8] mb-1">
                  Destination URL
                </label>
                <input
                  type="text"
                  required
                  value={editingBlock.url}
                  onChange={(e) => setEditingBlock({ ...editingBlock, url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-[#D8D2C9] dark:border-[#2E2E36] bg-[#FAF8F5] dark:bg-[#0C0C0E] text-[#181615] dark:text-[#F4F1EA]"
                />
              </div>

              {editingBlock.type === 'media_embed' && (
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#E6E1DA] dark:border-[#26262B]">
                  <div>
                    <label className="block text-xs font-medium text-[#4A4640] dark:text-[#B8B3A8] mb-1">
                      Media Player Mode
                    </label>
                    <select
                      value={editingBlock.mediaKind || 'audio_studio'}
                      onChange={(e) =>
                        setEditingBlock({
                          ...editingBlock,
                          mediaKind: e.target.value as MediaEmbedKind,
                        })
                      }
                      className="w-full px-3 py-2 text-xs rounded-lg border border-[#D8D2C9] dark:border-[#2E2E36] bg-[#FAF8F5] dark:bg-[#0C0C0E]"
                    >
                      <option value="audio_studio">In-Page Studio Audio Synthesizer</option>
                      <option value="youtube">YouTube / Video Iframe Embed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#4A4640] dark:text-[#B8B3A8] mb-1">
                      Iframe Embed URL (for Video)
                    </label>
                    <input
                      type="text"
                      value={editingBlock.mediaEmbedUrl || ''}
                      onChange={(e) =>
                        setEditingBlock({ ...editingBlock, mediaEmbedUrl: e.target.value })
                      }
                      placeholder="https://www.youtube.com/embed/..."
                      className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-[#D8D2C9] dark:border-[#2E2E36] bg-[#FAF8F5] dark:bg-[#0C0C0E]"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-[#4A4640] dark:text-[#B8B3A8] mb-1.5">
                  Thumbnail Artwork Preset or Custom Path
                </label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {CURATED_THUMBNAILS.map((item) => (
                    <button
                      key={item.url}
                      type="button"
                      onClick={() => setEditingBlock({ ...editingBlock, thumbnailUrl: item.url })}
                      className={`relative h-14 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                        editingBlock.thumbnailUrl === item.url
                          ? 'border-[#C84B31]'
                          : 'border-transparent opacity-75 hover:opacity-100'
                      }`}
                      title={item.label}
                    >
                      <img
                        src={item.url}
                        alt={item.label}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={editingBlock.thumbnailUrl || ''}
                  onChange={(e) =>
                    setEditingBlock({ ...editingBlock, thumbnailUrl: e.target.value })
                  }
                  placeholder="/src/assets/images/..."
                  className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-[#D8D2C9] dark:border-[#2E2E36] bg-[#FAF8F5] dark:bg-[#0C0C0E]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingBlock(null);
                    setIsCreatingBlock(false);
                  }}
                  className="px-3.5 py-2 text-xs font-medium text-[#6E6A63] hover:text-[#181615] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium bg-[#181615] dark:bg-[#F4F1EA] text-[#FAF8F5] dark:text-[#0C0C0E] rounded-lg hover:opacity-90 flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isCreatingBlock ? 'Publish Block' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          )}

          {activeEditorTab === 'blocks' ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-[#6E6A63] dark:text-[#9E988E]">
                <span>Drag blocks by the handle or use arrow controls to reorder your landing page.</span>
              </div>

              {blocks.map((block, index) => {
                const isDragged = draggedIndex === index;
                const isDragOver = dragOverIndex === index;

                return (
                  <div
                    key={block.id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={() => {
                      setDraggedIndex(null);
                      setDragOverIndex(null);
                    }}
                    className={`border rounded-xl p-4 transition-all duration-150 bg-white dark:bg-[#16161A] ${
                      isDragOver
                        ? 'border-[#C84B31] ring-1 ring-[#C84B31]/30'
                        : 'border-[#E6E1DA] dark:border-[#26262B]'
                    } ${isDragged ? 'opacity-50 scale-[0.99]' : 'opacity-100'} ${
                      !block.enabled ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="mt-1 text-[#9E988E] hover:text-[#181615] dark:hover:text-white cursor-grab active:cursor-grabbing shrink-0"
                        title="Drag to reorder"
                      >
                        <GripVertical className="w-4 h-4" />
                      </div>

                      {block.thumbnailUrl && (
                        <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 border border-[#E6E1DA] dark:border-[#26262B]">
                          <img
                            src={block.thumbnailUrl}
                            alt={block.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        {/* Unboxed Metadata with Middot Separators */}
                        <div className="flex items-center gap-1.5 text-[11px] text-[#6E6A63] dark:text-[#9E988E]">
                          <span>{block.category}</span>
                          <span aria-hidden="true">·</span>
                          <span>{block.publishedDate}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums">{block.clicks} clicks</span>
                        </div>

                        <h3 className="font-editorial text-lg font-semibold text-[#181615] dark:text-[#F4F1EA] truncate mt-0.5">
                          {block.title}
                        </h3>

                        <div className="text-xs text-[#6E6A63] dark:text-[#9E988E] truncate font-mono mt-0.5">
                          {block.url}
                        </div>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="mt-3 pt-3 border-t border-[#F0ECE4] dark:border-[#222228] flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => moveBlock(index, -1)}
                          disabled={index === 0}
                          title="Move Up"
                          className="p-1.5 rounded-md text-[#6E6A63] hover:text-[#181615] dark:hover:text-white disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveBlock(index, 1)}
                          disabled={index === blocks.length - 1}
                          title="Move Down"
                          className="p-1.5 rounded-md text-[#6E6A63] hover:text-[#181615] dark:hover:text-white disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleBlockSpan(block.id)}
                          title="Toggle Full / Half Grid Width"
                          className="px-2 py-1 rounded-md text-[11px] font-medium text-[#6E6A63] hover:text-[#181615] dark:hover:text-white flex items-center gap-1 cursor-pointer"
                        >
                          {block.featuredSpan === 'full' ? (
                            <>
                              <Square className="w-3 h-3" />
                              <span>Full Span</span>
                            </>
                          ) : (
                            <>
                              <Columns className="w-3 h-3" />
                              <span>Half Span</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => toggleBlockVisibility(block.id)}
                          className="px-2.5 py-1 rounded-md text-xs text-[#6E6A63] hover:text-[#181615] dark:hover:text-white flex items-center gap-1 cursor-pointer"
                        >
                          {block.enabled ? (
                            <>
                              <Eye className="w-3.5 h-3.5" />
                              <span>Visible</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3.5 h-3.5" />
                              <span>Hidden</span>
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingBlock(block);
                            setIsCreatingBlock(false);
                          }}
                          className="px-2.5 py-1 rounded-md text-xs font-medium text-[#181615] dark:text-[#F4F1EA] hover:bg-[#F3EFEA] dark:hover:bg-[#222228] flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteBlock(block.id)}
                          aria-label="Delete block"
                          className="p-1.5 rounded-md text-[#B91C1C] hover:bg-[#B91C1C]/10 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Social Media Profile Bar Editor */
            <div className="space-y-4">
              <form
                onSubmit={handleAddSocial}
                className="border border-[#E6E1DA] dark:border-[#26262B] bg-white dark:bg-[#16161A] rounded-xl p-4 space-y-3"
              >
                <div className="text-xs font-semibold text-[#181615] dark:text-[#F4F1EA]">
                  Add Social Media Profile
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <select
                    value={newSocialPlatform}
                    onChange={(e) => {
                      const plat = e.target.value as SocialPlatform;
                      setNewSocialPlatform(plat);
                      setNewSocialLabel(plat.charAt(0).toUpperCase() + plat.slice(1));
                    }}
                    className="px-3 py-2 text-xs rounded-lg border border-[#D8D2C9] dark:border-[#2E2E36] bg-[#FAF8F5] dark:bg-[#0C0C0E]"
                  >
                    <option value="instagram">Instagram</option>
                    <option value="x">X / Twitter</option>
                    <option value="youtube">YouTube</option>
                    <option value="spotify">Spotify</option>
                    <option value="github">GitHub</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="substack">Substack</option>
                    <option value="website">Website</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Display Label (e.g. Substack)"
                    value={newSocialLabel}
                    onChange={(e) => setNewSocialLabel(e.target.value)}
                    className="px-3 py-2 text-xs rounded-lg border border-[#D8D2C9] dark:border-[#2E2E36] bg-[#FAF8F5] dark:bg-[#0C0C0E]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    placeholder="Handle (e.g. @elenarostova)"
                    value={newSocialHandle}
                    onChange={(e) => setNewSocialHandle(e.target.value)}
                    className="px-3 py-2 text-xs font-mono rounded-lg border border-[#D8D2C9] dark:border-[#2E2E36] bg-[#FAF8F5] dark:bg-[#0C0C0E]"
                  />
                  <input
                    type="text"
                    placeholder="https://..."
                    value={newSocialUrl}
                    onChange={(e) => setNewSocialUrl(e.target.value)}
                    className="px-3 py-2 text-xs font-mono rounded-lg border border-[#D8D2C9] dark:border-[#2E2E36] bg-[#FAF8F5] dark:bg-[#0C0C0E]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 text-xs font-medium bg-[#181615] dark:bg-[#F4F1EA] text-[#FAF8F5] dark:text-[#0C0C0E] rounded-lg hover:opacity-90 cursor-pointer"
                >
                  Add Profile to Header Bar
                </button>
              </form>

              <div className="space-y-2.5">
                {socials.map((soc) => (
                  <div
                    key={soc.id}
                    className="border border-[#E6E1DA] dark:border-[#26262B] bg-white dark:bg-[#16161A] rounded-xl p-3.5 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-[#181615] dark:text-[#F4F1EA]">
                          {soc.label}
                        </span>
                        <span aria-hidden="true" className="text-xs text-[#6E6A63]">·</span>
                        <span className="text-xs font-mono text-[#6E6A63] dark:text-[#9E988E]">
                          {soc.handle}
                        </span>
                        <span aria-hidden="true" className="text-xs text-[#6E6A63]">·</span>
                        <span className="text-xs font-mono tabular-nums text-[#6E6A63]">
                          {soc.clicks} clicks
                        </span>
                      </div>
                      <input
                        type="text"
                        value={soc.url}
                        onChange={(e) =>
                          onUpdateSocials(
                            socials.map((item) =>
                              item.id === soc.id ? { ...item, url: e.target.value } : item
                            )
                          )
                        }
                        className="mt-1.5 w-full px-2.5 py-1 text-xs font-mono rounded border border-[#E6E1DA] dark:border-[#26262B] bg-[#FAF8F5] dark:bg-[#0C0C0E]"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateSocials(
                            socials.map((item) =>
                              item.id === soc.id ? { ...item, enabled: !item.enabled } : item
                            )
                          )
                        }
                        className="px-2.5 py-1.5 rounded-lg border border-[#E6E1DA] dark:border-[#26262B] text-xs cursor-pointer"
                      >
                        {soc.enabled ? 'Active' : 'Muted'}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateSocials(socials.filter((item) => item.id !== soc.id))
                        }
                        aria-label="Remove social profile"
                        className="p-1.5 text-[#B91C1C] hover:bg-[#B91C1C]/10 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live Interactive Landing Page Preview */}
        <div className="lg:col-span-7">
          <div className="border border-[#E6E1DA] dark:border-[#26262B] bg-white dark:bg-[#16161A] rounded-2xl overflow-hidden">
            {/* Preview Frame Top Control Bar */}
            <div className="px-4 py-3 border-b border-[#E6E1DA] dark:border-[#26262B] flex items-center justify-between gap-4 bg-[#F5F2EC] dark:bg-[#121215]">
              <div className="flex items-center gap-2 text-xs text-[#6E6A63] dark:text-[#9E988E]">
                <span className="font-medium text-[#181615] dark:text-[#F4F1EA]">
                  Interactive Live Preview
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-mono">
                  {primaryDomain ? `https://${primaryDomain}` : `atelier.link/${profile.handle}`}
                </span>
              </div>

              <div className="flex items-center gap-1 p-0.5 bg-[#E6E1DA] dark:bg-[#222228] rounded-lg">
                <button
                  type="button"
                  onClick={() => setPreviewDevice('desktop')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md flex items-center gap-1 transition-colors cursor-pointer ${
                    previewDevice === 'desktop'
                      ? 'bg-white dark:bg-[#16161A] text-[#181615] dark:text-white'
                      : 'text-[#6E6A63]'
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>Canvas</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('mobile')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md flex items-center gap-1 transition-colors cursor-pointer ${
                    previewDevice === 'mobile'
                      ? 'bg-white dark:bg-[#16161A] text-[#181615] dark:text-white'
                      : 'text-[#6E6A63]'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Compact</span>
                </button>
              </div>
            </div>

            {/* Rendered Landing Page Container */}
            <div className="p-4 sm:p-6 bg-[#EFECE6] dark:bg-[#09090B] flex justify-center">
              <div
                className={`w-full transition-all duration-200 rounded-xl overflow-hidden border border-[#DFD9CE] dark:border-[#26262B] max-h-[780px] overflow-y-auto ${
                  previewDevice === 'mobile' ? 'max-w-[410px]' : 'max-w-full'
                }`}
              >
                <LandingPageRenderer
                  profile={profile}
                  socials={socials}
                  blocks={blocks}
                  primaryDomain={primaryDomain}
                  isPreview={previewDevice === 'mobile'}
                  onRecordEvent={onRecordEvent}
                  onQuickSwitchDesign={onUpdateProfile}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
