'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ExternalLink, BookOpen, FileText, ChevronRight, Play, Clock, Users, Heart, Bookmark, X, Search, Video, Lightbulb, ThumbsUp, ThumbsDown, Plus } from 'lucide-react'

// T&L Essentials - Pinned documents
const essentialDocuments = [
  {
    title: 'T&L Guide',
    url: 'https://docs.google.com/document/d/1b8JtMppG-Pj4p7jBaZogCEneGUSfNLXr_OUx-kyzmyw/edit?usp=sharing',
    icon: FileText,
    color: 'bg-blue-100 text-blue-600'
  },
  {
    title: 'Syllabus',
    url: 'https://docs.google.com/document/d/1VXdBg0akiKCD9tTk7_Bxxbwc7at9eARnulgHOczyfvU/edit?usp=sharing',
    icon: BookOpen,
    color: 'bg-green-100 text-green-600'
  },
  {
    title: 'Scheme of Work',
    url: 'https://docs.google.com/spreadsheets/d/1J23IdHpUEsyHg54C8nHlNxI1VXGde1-fDkqXVw5F3rk/edit?usp=sharing',
    icon: FileText,
    color: 'bg-purple-100 text-purple-600'
  },
  {
    title: 'Assessment Rubrics',
    url: '#',
    icon: FileText,
    color: 'bg-orange-100 text-orange-600'
  }
]

// Teaching Inspiration - Curated content
const inspirationContent = [
  {
    id: 'inspiration-1',
    title: 'Questioning Techniques in Economics',
    subtitle: '5 high-impact strategies for deeper student thinking',
    type: 'Video',
    duration: '12 min',
    approach: 'Inquiry-Based',
    thumbnail: 'bg-red-100',
    icon: 'video',
    saves: 238,
    reason: 'Aligns with your goal: "questioning techniques and differentiated instruction"',
    url: 'https://drive.google.com/file/d/1CCbIISoFHgEZRtkcJMrDNkm7XfeeFfEp/view?usp=drive_link'
  },
  {
    id: 'inspiration-2',
    title: 'Building Student Resilience Through Feedback',
    subtitle: 'Transform how students receive and use feedback',
    type: 'Article',
    duration: '8 min read',
    approach: 'Social-Emotional',
    thumbnail: 'bg-blue-100',
    icon: 'document',
    saves: null,
    reason: '412 teachers in your school saved this',
    url: 'https://drive.google.com/drive/folders/1HNM7rT_cYnuxNfmfCRCA9fxq0tM9osAe?usp=drive_link'
  },
  {
    id: 'inspiration-3',
    title: 'AI Tools for Formative Assessment',
    subtitle: 'Practical ways to leverage AI for real-time learning insights',
    type: 'Course',
    duration: '45 min',
    approach: 'Technology',
    thumbnail: 'bg-orange-100',
    icon: 'book',
    saves: 189,
    reason: 'Matches: "AI in adaptive assessment"',
    url: '#'
  },
  {
    id: 'inspiration-4',
    title: 'Outdoor Learning: Reflection Design',
    subtitle: 'Structured approaches to post-activity reflection',
    type: 'Guide',
    duration: '15 min read',
    approach: 'Experiential',
    thumbnail: 'bg-purple-100',
    icon: 'book',
    saves: 156,
    reason: 'Aligns with: "planning and reflection for outdoor education"',
    url: '#'
  }
]

// Sample resources data (similar to goals-content dummy data)
const dummyResourcesData = [
  {
    title: "21st Century Competencies Framework",
    author: "Ministry of Education",
    type: "Policy",
    pedApproaches: "Competency-based Learning",
    url: "https://www.moe.gov.sg/education-in-sg/21st-century-competencies",
    description: "Comprehensive framework for developing 21st century skills",
    saves: 245
  },
  {
    title: "Assessment Literacy for Teachers",
    author: "Academy of Singapore Teachers",
    type: "Guide",
    pedApproaches: "Assessment Literacy",
    url: "https://www.academyofsingaporeteachers.moe.edu.sg",
    description: "Professional learning guide on effective assessment practices",
    saves: 189
  },
  {
    title: "Differentiated Instruction Strategies",
    author: "Dr. Sarah Chen",
    type: "Video",
    pedApproaches: "Differentiated Learning",
    url: "#",
    description: "Practical strategies for meeting diverse learning needs",
    saves: 156
  },
  {
    title: "Digital Literacy Framework",
    author: "MOE ICT Division",
    type: "Framework",
    pedApproaches: "Technology Integration",
    url: "https://www.moe.gov.sg/education/programmes/digital-literacy",
    description: "Framework for developing digital literacy across subjects",
    saves: 201
  },
  {
    title: "Student-Centered Learning Approaches",
    author: "NIE Singapore",
    type: "Book",
    pedApproaches: "Student-Centered Learning",
    url: "https://www.nie.edu.sg",
    description: "Comprehensive guide to student-centered pedagogies",
    saves: 134
  }
]

export function ResourcesContent() {
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [pedFilter, setPedFilter] = useState('all')
  const [dismissedCards, setDismissedCards] = useState<string[]>([])


  const handleDismiss = (cardId: string) => {
    setDismissedCards(prev => [...prev, cardId])
  }

  const filteredResources = dummyResourcesData.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.author.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === 'all' || resource.type.includes(typeFilter)
    const matchesPed = pedFilter === 'all' || resource.pedApproaches.toLowerCase().includes(pedFilter.toLowerCase())

    return matchesSearch && matchesType && matchesPed
  })

  const visibleInspirationContent = inspirationContent.filter(content => !dismissedCards.includes(content.id))


  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <BookOpen className="h-7 w-7 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Resources</h1>
            <p className="text-sm text-muted-foreground">Curated teaching resources and inspiration</p>
          </div>
        </div>

        {/* Pinned Resources - Slack-style tabs */}
        <div className="border-b border-gray-200 pb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-gray-700 uppercase tracking-wide">Pinned Resources</h2>
            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700 h-6 px-2 text-xs">
              Customize
            </Button>
          </div>
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {essentialDocuments.map((doc, index) => {
              const Icon = doc.icon
              return (
                <a
                  key={index}
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group"
                >
                  <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 transition-all cursor-pointer whitespace-nowrap">
                    <div className={`w-4 h-4 rounded ${doc.color} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="h-2.5 w-2.5" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{doc.title}</span>
                    <ExternalLink className="h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </a>
              )
            })}
            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700 px-2 py-1 h-8 border border-dashed border-gray-300 rounded-md">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Teaching Inspiration Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-orange-500" />
            <h2 className="text-sm font-medium text-gray-700 uppercase tracking-wide">TEACHING INSPIRATION</h2>
            <div className="ml-auto">
              <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800 h-6 px-2 text-xs">
                Show more like this
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {/* Main content cards - take up 2 columns */}
            <div className="col-span-2 space-y-3">
              {visibleInspirationContent.slice(0, 2).map((content) => {
                const getIcon = (iconType: string) => {
                  switch(iconType) {
                    case 'video': return <Video className="h-5 w-5 text-red-600" />
                    case 'document': return <FileText className="h-5 w-5 text-blue-600" />
                    case 'book': return <BookOpen className="h-5 w-5 text-orange-600" />
                    default: return <FileText className="h-5 w-5 text-gray-600" />
                  }
                }

                return (
                  <Card key={content.id} className="relative border border-gray-200 hover:border-gray-300 transition-colors">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-3 right-3 h-6 w-6 p-0 hover:bg-gray-100"
                      onClick={() => handleDismiss(content.id)}
                    >
                      <X className="h-3 w-3 text-gray-400" />
                    </Button>

                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        {/* Thumbnail */}
                        <div className={`w-12 h-12 ${content.thumbnail} rounded-lg flex items-center justify-center flex-shrink-0`}>
                          {getIcon(content.icon)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 space-y-3">
                          <div>
                            <h3 className="font-semibold text-base text-gray-900">{content.title}</h3>
                            <p className="text-gray-600 text-sm mt-1">"{content.subtitle}"</p>
                          </div>

                          <div className="flex items-center gap-3">
                            <Badge variant="secondary" className="bg-red-100 text-red-700 hover:bg-red-100 text-xs">
                              {content.type}
                            </Badge>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Clock className="h-3 w-3" />
                              <span>{content.duration}</span>
                            </div>
                            <Badge variant="outline" className="text-gray-600 text-xs">
                              {content.approach}
                            </Badge>
                          </div>

                          {/* Why this recommendation */}
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                            <div className="flex items-start gap-2">
                              <Lightbulb className="h-3 w-3 text-blue-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <span className="text-blue-800 font-medium text-xs">Why this?</span>
                                <span className="text-blue-700 text-xs ml-1">{content.reason}</span>
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center justify-between">
                            <div className="text-xs text-gray-500">
                              {content.saves && `${content.saves} teachers saved`}
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50 h-6 px-2 text-xs">
                                <Bookmark className="mr-1 h-3 w-3" />
                                Save
                              </Button>
                              <Button size="sm" variant="ghost" className="text-gray-500 hover:text-gray-700 h-6 w-6 p-0">
                                <ThumbsDown className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Embedded video - takes up 1 column */}
            <div className="col-span-1">
              <Card className="border border-gray-200 h-full">
                <CardContent className="p-4 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-sm text-gray-900">Featured Video</h3>
                    <Video className="h-4 w-4 text-red-600" />
                  </div>

                  <div className="flex-1 rounded-lg overflow-hidden mb-3">
                    <a
                      href="https://www.tiktok.com/@mr_physixs/video/7195186195175853313"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block relative group"
                    >
                      <div className="aspect-[9/16] bg-gradient-to-br from-pink-400 via-purple-500 to-blue-600 rounded-lg flex items-center justify-center relative overflow-hidden">
                        {/* Play button overlay */}
                        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center group-hover:bg-opacity-30 transition-all">
                          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Play className="h-6 w-6 text-black ml-1" fill="black" />
                          </div>
                        </div>

                        {/* TikTok logo */}
                        <div className="absolute top-3 right-3 w-6 h-6 bg-white rounded flex items-center justify-center">
                          <Video className="h-4 w-4 text-black" />
                        </div>

                        {/* Creator info at bottom */}
                        <div className="absolute bottom-3 left-3 right-3 text-white">
                          <p className="text-xs font-medium">@mr_physixs</p>
                          <p className="text-xs opacity-80 line-clamp-2">Physics experiments - JC concepts made visual</p>
                        </div>
                      </div>
                    </a>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs text-gray-600">Physics experiments - JC concepts made visual</p>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="bg-orange-100 text-orange-700 text-xs">
                        TikTok
                      </Badge>
                      <a
                        href="https://www.youtube.com/@knowgets"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                      >
                        See more →
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Browse All Section */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-gray-700">BROWSE ALL</h2>

          {/* Search and Filters */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-gray-50 border-gray-200"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40 bg-white border-gray-200">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Document">Documents</SelectItem>
                <SelectItem value="Books">Books</SelectItem>
              </SelectContent>
            </Select>
            <Select value={pedFilter} onValueChange={setPedFilter}>
              <SelectTrigger className="w-40 bg-white border-gray-200">
                <SelectValue placeholder="All Approaches" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Approaches</SelectItem>
                <SelectItem value="Assessment Literacy">Assessment Literacy</SelectItem>
                <SelectItem value="Brain-based Learning">Brain-based Learning</SelectItem>
                <SelectItem value="Content Teaching">Content Teaching</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card className="border border-gray-200">

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-4 font-medium">Title</th>
                    <th className="text-left p-4 font-medium">Type</th>
                    <th className="text-left p-4 font-medium">Approach</th>
                    <th className="text-left p-4 font-medium">Engagement</th>
                    <th className="text-left p-4 font-medium">Link</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResources.slice(0, 20).map((resource, index) => {
                    const getTypeIcon = (type: string) => {
                      if (type.includes('Video') || type.includes('video')) {
                        return <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center"><Video className="h-4 w-4 text-red-600" /></div>
                      } else if (type.includes('Book') || type.includes('book')) {
                        return <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center"><BookOpen className="h-4 w-4 text-green-600" /></div>
                      } else {
                        return <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center"><FileText className="h-4 w-4 text-blue-600" /></div>
                      }
                    }

                    return (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-4">
                          <div className="flex items-start gap-3">
                            {getTypeIcon(resource.type)}
                            <div className="space-y-1">
                              <div className="font-medium text-gray-900">{resource.title}</div>
                              <div className="text-sm text-gray-500">{resource.author}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline" className="text-xs text-red-700 bg-red-50 border-red-200">
                            {resource.type}
                          </Badge>
                        </td>
                        <td className="p-4">
                          {resource.pedApproaches && (
                            <Badge variant="outline" className="text-xs text-gray-600 bg-gray-50">
                              {resource.pedApproaches}
                            </Badge>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="text-sm text-gray-600">
                            {resource.saves} saves
                          </div>
                        </td>
                        <td className="p-4">
                          {resource.url && (
                            <a
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            {filteredResources.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No resources found matching your criteria.</p>
              </div>
            )}
            {filteredResources.length > 20 && (
              <div className="p-4 text-center border-t">
                <Button variant="outline">
                  Load more resources ({filteredResources.length - 20} more)
                </Button>
              </div>
            )}
          </CardContent>
          </Card>
        </div>

      </div>
    </div>
  )
}