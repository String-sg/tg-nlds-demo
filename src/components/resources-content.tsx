'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ExternalLink, BookOpen, FileText, ChevronRight, Play, Clock, Users, Heart, Bookmark, X, Search, Video, Lightbulb, ThumbsUp, ThumbsDown } from 'lucide-react'

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

// CSV parsing function
function parseCSV(csvText: string) {
  const lines = csvText.split('\n').filter(line => line.trim())
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))

  return lines.slice(1).map(line => {
    const values: string[] = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    values.push(current.trim())

    const resource: any = {}
    headers.forEach((header, index) => {
      resource[header] = values[index] || ''
    })

    return {
      title: resource.Title || '',
      author: resource.By || '',
      type: resource.Type || '',
      pedApproaches: resource['Ped Approaches'] || '',
      url: resource.URL || '',
      description: resource.Description || '',
      saves: Math.floor(Math.random() * 200) + 10 // Mock engagement data
    }
  })
}

export function ResourcesContent() {
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [pedFilter, setPedFilter] = useState('all')
  const [dismissedCards, setDismissedCards] = useState<string[]>([])
  const [csvResources, setCsvResources] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/resources.csv')
      .then(response => response.text())
      .then(csvText => {
        const parsed = parseCSV(csvText)
        setCsvResources(parsed)
        setLoading(false)
      })
      .catch(error => {
        console.error('Error loading CSV:', error)
        setLoading(false)
      })
  }, [])

  const handleDismiss = (cardId: string) => {
    setDismissedCards(prev => [...prev, cardId])
  }

  const filteredResources = csvResources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.author.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === 'all' || resource.type.includes(typeFilter)
    const matchesPed = pedFilter === 'all' || resource.pedApproaches.toLowerCase().includes(pedFilter.toLowerCase())

    return matchesSearch && matchesType && matchesPed
  })

  const visibleInspirationContent = inspirationContent.filter(content => !dismissedCards.includes(content.id))

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading resources...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6 space-y-8">

        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Resources</h1>
              <p className="text-muted-foreground">Curated teaching resources and inspiration</p>
            </div>
          </div>
        </div>

        {/* Essentials Section */}
        <Card className="border-2">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">ESSENTIALS</CardTitle>
              <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">
                View all <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                    <Card className="h-24 hover:shadow-md transition-shadow cursor-pointer border-2 hover:border-blue-200">
                      <CardContent className="p-4 h-full flex flex-col items-center justify-center text-center">
                        <div className={`w-8 h-8 rounded-lg ${doc.color} flex items-center justify-center mb-2`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <p className="text-sm font-medium line-clamp-2">{doc.title}</p>
                      </CardContent>
                    </Card>
                  </a>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Teaching Inspiration Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-orange-500" />
            <h2 className="text-lg font-semibold text-gray-700">TEACHING INSPIRATION</h2>
            <div className="ml-auto">
              <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">
                Show more like this
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {visibleInspirationContent.map((content) => {
              const getIcon = (iconType: string) => {
                switch(iconType) {
                  case 'video': return <Video className="h-6 w-6 text-red-600" />
                  case 'document': return <FileText className="h-6 w-6 text-blue-600" />
                  case 'book': return <BookOpen className="h-6 w-6 text-orange-600" />
                  default: return <FileText className="h-6 w-6 text-gray-600" />
                }
              }

              return (
                <Card key={content.id} className="relative border border-gray-200 hover:border-gray-300 transition-colors">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-4 right-4 h-8 w-8 p-0 hover:bg-gray-100"
                    onClick={() => handleDismiss(content.id)}
                  >
                    <X className="h-4 w-4 text-gray-400" />
                  </Button>

                  <CardContent className="p-6">
                    <div className="flex gap-6">
                      {/* Thumbnail */}
                      <div className={`w-20 h-20 ${content.thumbnail} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        {getIcon(content.icon)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 space-y-4">
                        <div>
                          <h3 className="font-semibold text-xl text-gray-900">{content.title}</h3>
                          <p className="text-gray-600 mt-1">"{content.subtitle}"</p>
                        </div>

                        <div className="flex items-center gap-4">
                          <Badge variant="secondary" className="bg-red-100 text-red-700 hover:bg-red-100">
                            {content.type}
                          </Badge>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Clock className="h-4 w-4" />
                            <span>{content.duration}</span>
                          </div>
                          <Badge variant="outline" className="text-gray-600">
                            {content.approach}
                          </Badge>
                        </div>

                        {/* Why this recommendation */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <div className="flex items-start gap-2">
                            <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <span className="text-blue-800 font-medium text-sm">Why this?</span>
                              <span className="text-blue-700 text-sm ml-1">{content.reason}</span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-500">
                            {content.saves && `${content.saves} teachers saved`}
                          </div>
                          <div className="flex gap-3">
                            <Button size="sm" variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                              <Bookmark className="mr-2 h-4 w-4" />
                              Save
                            </Button>
                            <Button size="sm" variant="ghost" className="text-gray-500 hover:text-gray-700">
                              <ThumbsDown className="h-4 w-4" />
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
        </div>

        {/* Browse All Section */}
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">BROWSE ALL</CardTitle>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <div className="relative flex-1 min-w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search resources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Document">Documents</SelectItem>
                  <SelectItem value="Books">Books</SelectItem>
                </SelectContent>
              </Select>
              <Select value={pedFilter} onValueChange={setPedFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Approaches" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Approaches</SelectItem>
                  <SelectItem value="Assessment Literacy">Assessment Literacy</SelectItem>
                  <SelectItem value="Brain-based Learning">Brain-based Learning</SelectItem>
                  <SelectItem value="Content Teaching">Content Teaching</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="newest">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="relevant">Most Relevant</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>

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
                  {filteredResources.slice(0, 20).map((resource, index) => (
                    <tr key={index} className="border-b hover:bg-muted/25">
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="font-medium">{resource.title}</div>
                          {resource.description && (
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {resource.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className="text-xs">
                          {resource.type}
                        </Badge>
                      </td>
                      <td className="p-4">
                        {resource.pedApproaches && (
                          <Badge variant="secondary" className="text-xs">
                            {resource.pedApproaches}
                          </Badge>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Heart className="h-3 w-3" />
                          <span>{resource.saves} saves</span>
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
                  ))}
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
  )
}