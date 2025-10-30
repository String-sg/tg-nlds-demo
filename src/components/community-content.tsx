'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  MessageSquare,
  Heart,
  Download,
  Bookmark,
  Share2,
  Search,
  Plus,
  Users,
  FileText,
  Paperclip,
  Pin,
  BookmarkCheck,
  Filter,
} from 'lucide-react'
import {
  getRecentPosts,
  getPinnedPosts,
  getBookmarkedPosts,
  getCommunityStats,
} from '@/lib/mock-data/community-data'
import type { Post } from '@/types/community'
import { cn } from '@/lib/utils'

interface CommunityContentProps {
  defaultTab?: string
}

export function CommunityContent({ defaultTab = 'feed' }: CommunityContentProps) {
  const [activeTab, setActiveTab] = useState(defaultTab)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)

  const recentPosts = getRecentPosts()
  const pinnedPosts = getPinnedPosts()
  const bookmarkedPosts = getBookmarkedPosts()
  const stats = getCommunityStats()

  const feedPosts = [...pinnedPosts, ...recentPosts.filter((p) => !p.isPinned)]
  const myPosts = recentPosts.filter((p) => p.author === 'Sarah Mitchell') // Mock current user

  return (
    <ScrollArea className="h-full w-full">
      <div className="mx-auto w-full max-w-5xl space-y-8 px-8 py-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-stone-900">Teacher Community</h1>
            <p className="mt-1 text-sm text-stone-600">
              Share resources and collaborate with fellow educators
            </p>
          </div>
          <Button>
            <Plus className="mr-2 size-4" />
            New Post
          </Button>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-4 gap-4 rounded-lg bg-stone-50 border border-stone-200 p-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5">
              <Users className="size-4 text-stone-600" />
              <span className="text-xl font-semibold text-stone-900">{stats.totalMembers}</span>
            </div>
            <div className="mt-1 text-xs text-stone-500">Members</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5">
              <FileText className="size-4 text-stone-600" />
              <span className="text-xl font-semibold text-stone-900">{stats.totalPosts}</span>
            </div>
            <div className="mt-1 text-xs text-stone-500">Posts</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5">
              <Download className="size-4 text-stone-600" />
              <span className="text-xl font-semibold text-stone-900">{stats.totalResources}</span>
            </div>
            <div className="mt-1 text-xs text-stone-500">Resources</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5">
              <MessageSquare className="size-4 text-stone-600" />
              <span className="text-xl font-semibold text-stone-900">{stats.activeToday}</span>
            </div>
            <div className="mt-1 text-xs text-stone-500">Active Today</div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone-400" />
            <Input
              placeholder="Search posts, resources, or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="size-4" />
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="feed" className="gap-2">
              <FileText className="size-4" />
              Feed
            </TabsTrigger>
            <TabsTrigger value="my-posts" className="gap-2">
              <MessageSquare className="size-4" />
              My Posts
            </TabsTrigger>
            <TabsTrigger value="saved" className="gap-2">
              <BookmarkCheck className="size-4" />
              Saved
            </TabsTrigger>
          </TabsList>

          {/* Feed Tab */}
          <TabsContent value="feed" className="space-y-4">
            {feedPosts.map((post) => (
              <PostCard key={post.id} post={post} onSelect={setSelectedPost} />
            ))}
          </TabsContent>

          {/* My Posts Tab */}
          <TabsContent value="my-posts" className="space-y-4">
            {myPosts.length > 0 ? (
              myPosts.map((post) => (
                <PostCard key={post.id} post={post} onSelect={setSelectedPost} isOwn />
              ))
            ) : (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <MessageSquare className="mb-4 size-12 text-stone-400" />
                  <h3 className="mb-2 text-lg font-semibold text-stone-900">No Posts Yet</h3>
                  <p className="mb-4 text-center text-sm text-stone-600">
                    Share your teaching resources and ideas with the community
                  </p>
                  <Button>
                    <Plus className="mr-2 size-4" />
                    Create Your First Post
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Saved Tab */}
          <TabsContent value="saved" className="space-y-4">
            {bookmarkedPosts.length > 0 ? (
              bookmarkedPosts.map((post) => (
                <PostCard key={post.id} post={post} onSelect={setSelectedPost} />
              ))
            ) : (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Bookmark className="mb-4 size-12 text-stone-400" />
                  <h3 className="mb-2 text-lg font-semibold text-stone-900">No Saved Posts</h3>
                  <p className="mb-4 text-center text-sm text-stone-600">
                    Bookmark posts to save them for later
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  )
}

// Post Card Component
interface PostCardProps {
  post: Post
  onSelect: (post: Post) => void
  isOwn?: boolean
}

function PostCard({ post, onSelect, isOwn = false }: PostCardProps) {
  const categoryConfig: Record<
    string,
    { icon: React.ComponentType<{ className?: string }>; color: string }
  > = {
    'lesson-plan': { icon: FileText, color: 'bg-blue-50 text-blue-700 border-blue-200' },
    worksheet: { icon: FileText, color: 'bg-green-50 text-green-700 border-green-200' },
    activity: { icon: Users, color: 'bg-purple-50 text-purple-700 border-purple-200' },
    assessment: { icon: FileText, color: 'bg-orange-50 text-orange-700 border-orange-200' },
    'teaching-tip': { icon: MessageSquare, color: 'bg-pink-50 text-pink-700 border-pink-200' },
    discussion: { icon: MessageSquare, color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    resource: { icon: Paperclip, color: 'bg-teal-50 text-teal-700 border-teal-200' },
    question: { icon: MessageSquare, color: 'bg-amber-50 text-amber-700 border-amber-200' },
  }

  const config = categoryConfig[post.category] || categoryConfig.resource
  const CategoryIcon = config.icon

  return (
    <Card className="group cursor-pointer transition-shadow hover:shadow-md border-stone-200">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar className="size-10 border border-stone-200">
              <AvatarImage src={post.authorAvatar} />
              <AvatarFallback className="text-xs bg-stone-100">
                {post.author
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium text-stone-900">{post.author}</p>
                {post.isPinned && <Pin className="size-3 text-orange-600" />}
              </div>
              <p className="text-xs text-stone-500">{post.authorRole}</p>
            </div>
          </div>
          <Badge variant="outline" className={cn('text-xs font-medium shrink-0', config.color)}>
            <CategoryIcon className="mr-1 size-3" />
            {post.category.replace('-', ' ')}
          </Badge>
        </div>

        <div>
          <CardTitle className="line-clamp-1 text-lg leading-tight group-hover:text-blue-600">
            {post.title}
          </CardTitle>
          <CardDescription className="mt-1.5 line-clamp-2 leading-relaxed">
            {post.description}
          </CardDescription>
        </div>

        {/* Tags and Metadata */}
        <div className="flex flex-wrap items-center gap-2">
          {post.subject && (
            <Badge variant="outline" className="text-xs font-normal">
              {post.subject}
            </Badge>
          )}
          {post.gradeLevel && (
            <Badge variant="outline" className="text-xs font-normal">
              {post.gradeLevel}
            </Badge>
          )}
          {post.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs font-normal">
              {tag}
            </Badge>
          ))}
          <span className="ml-auto text-xs text-stone-500">
            {new Date(post.createdDate).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
            })}
          </span>
        </div>
      </CardHeader>

      {/* Attachments Preview */}
      {post.attachments.length > 0 && (
        <>
          <Separator />
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-sm text-stone-600">
              <Paperclip className="size-4" />
              <span>
                {post.attachments.length} attachment{post.attachments.length !== 1 ? 's' : ''}
              </span>
              {post.attachments.slice(0, 2).map((attachment) => (
                <Badge key={attachment.id} variant="secondary" className="text-xs font-normal">
                  {attachment.format}
                </Badge>
              ))}
            </div>
          </CardContent>
        </>
      )}

      {/* Action Bar */}
      <Separator />
      <CardContent className="pt-4">
        <div className="flex items-center justify-between">
          <div className="flex gap-4">
            <button className="flex items-center gap-1.5 text-sm text-stone-500 transition-colors hover:text-red-600">
              <Heart className="size-4" />
              <span>{post.likes}</span>
            </button>
            <button className="flex items-center gap-1.5 text-sm text-stone-500 transition-colors hover:text-blue-600">
              <MessageSquare className="size-4" />
              <span>{post.comments.length}</span>
            </button>
            <button className="flex items-center gap-1.5 text-sm text-stone-500 transition-colors hover:text-green-600">
              <Download className="size-4" />
              <span>{post.downloads}</span>
            </button>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className={cn('size-8', post.isBookmarked && 'text-blue-600')}
            >
              <Bookmark className="size-4" />
            </Button>
            <Button variant="ghost" size="icon" className="size-8">
              <Share2 className="size-4" />
            </Button>
          </div>
        </div>
      </CardContent>

      {/* Comments Preview */}
      {post.comments.length > 0 && (
        <>
          <Separator />
          <CardContent className="pt-4">
            <div className="space-y-3">
              <p className="text-xs font-medium text-stone-500">Recent Comments</p>
              {post.comments.slice(0, 2).map((comment) => (
                <div key={comment.id} className="flex gap-2.5 text-sm">
                  <Avatar className="size-7 border border-stone-200">
                    <AvatarImage src={comment.authorAvatar} />
                    <AvatarFallback className="text-xs bg-stone-100">
                      {comment.author
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs leading-relaxed">
                      <span className="font-medium text-stone-900">{comment.author}</span>{' '}
                      <span className="text-stone-600">{comment.content.slice(0, 100)}...</span>
                    </p>
                  </div>
                </div>
              ))}
              {post.comments.length > 2 && (
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-xs text-stone-600"
                  onClick={() => onSelect(post)}
                >
                  View all {post.comments.length} comments
                </Button>
              )}
            </div>
          </CardContent>
        </>
      )}
    </Card>
  )
}
