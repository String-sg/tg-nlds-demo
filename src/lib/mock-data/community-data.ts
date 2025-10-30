/**
 * Mock data for Community Platform
 * Teacher content sharing and collaboration
 */

import type { Post, Comment, Reply, CommunityStats, TopContributor } from '@/types/community'

export const mockPosts: Post[] = [
  {
    id: 'post-1',
    title: 'Multiplication Arrays - Interactive Lesson Plan',
    description: 'A complete lesson plan for teaching multiplication using visual arrays and hands-on activities',
    content: `This lesson introduces Year 3 students to multiplication through the concept of arrays. Students will use counters to build arrays and understand that multiplication represents equal groups.

**Learning Objectives:**
- Understand multiplication as repeated addition
- Create and identify arrays
- Write multiplication sentences from arrays

**Materials Needed:**
- Counters (beans, buttons, or manipulatives)
- Grid paper
- Array cards (attached)

**Activity Sequence:**
1. Introduction (10 min): Show real-world arrays (egg carton, muffin tin)
2. Guided Practice (15 min): Build arrays with counters
3. Independent Work (20 min): Array creation worksheet
4. Share & Discuss (10 min): Students present their arrays

This has been very successful in my classroom - students love the hands-on element!`,
    author: 'Sarah Mitchell',
    authorRole: 'Year 3 Teacher',
    authorAvatar: '/avatars/sarah-m.jpg',
    category: 'lesson-plan',
    tags: ['multiplication', 'year-3', 'hands-on', 'arrays', 'mathematics'],
    subject: 'Mathematics',
    gradeLevel: 'Year 3-4',
    createdDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    likes: 47,
    comments: [
      {
        id: 'comment-1-1',
        postId: 'post-1',
        author: 'James Wilson',
        authorRole: 'Year 4 Teacher',
        content: 'This is brilliant! I tried it with my Year 4s and they grasped the concept much faster than with previous methods. Thank you for sharing!',
        createdDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        likes: 12,
        replies: [
          {
            id: 'reply-1-1-1',
            commentId: 'comment-1-1',
            author: 'Sarah Mitchell',
            authorRole: 'Year 3 Teacher',
            content: 'So glad it worked for you! The hands-on approach really makes a difference.',
            createdDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            likes: 5,
          },
        ],
        isEdited: false,
      },
      {
        id: 'comment-1-2',
        postId: 'post-1',
        author: 'Emma Thompson',
        authorRole: 'Mathematics Coordinator',
        content: 'Love the progression from concrete to abstract. Have you considered adding a digital follow-up activity?',
        createdDate: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        likes: 8,
        replies: [],
        isEdited: false,
      },
    ],
    downloads: 134,
    views: 423,
    attachments: [
      {
        id: 'attach-1-1',
        name: 'Array-Cards-Printable.pdf',
        type: 'document',
        url: '/resources/array-cards.pdf',
        fileSize: '2.4 MB',
        format: 'PDF',
        thumbnailUrl: '/thumbnails/array-cards.png',
        downloads: 134,
      },
      {
        id: 'attach-1-2',
        name: 'Array-Worksheet.pdf',
        type: 'document',
        url: '/resources/array-worksheet.pdf',
        fileSize: '1.8 MB',
        format: 'PDF',
        thumbnailUrl: '/thumbnails/array-worksheet.png',
        downloads: 127,
      },
    ],
    isBookmarked: true,
    isPinned: false,
    status: 'published',
  },
  {
    id: 'post-2',
    title: 'Place Value Games for Year 2',
    description: 'Collection of engaging games to reinforce place value understanding',
    content: `Here are 5 of my favorite place value games that work brilliantly with Year 2 students. All require minimal prep and can be adapted for different ability levels.

**Game 1: Place Value Bingo**
Create bingo cards with numbers. Call out "2 tens and 3 ones" and students mark 23.

**Game 2: Number Building Race**
Students race to build numbers using base-10 blocks based on verbal instructions.

**Game 3: Digit Detective**
Show a 2-digit number and students identify the value of each digit.

**Game 4: Greater/Less Than Challenge**
Students compare two 2-digit numbers and explain their reasoning.

**Game 5: Mystery Number**
Give clues about tens and ones, students guess the number.

All game materials are attached. Feel free to modify for your class!`,
    author: 'Rachel Foster',
    authorRole: 'Year 2 Teacher',
    authorAvatar: '/avatars/rachel-f.jpg',
    category: 'activity',
    tags: ['place-value', 'year-2', 'games', 'number-sense', 'mathematics'],
    subject: 'Mathematics',
    gradeLevel: 'Year 2-3',
    createdDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    likes: 89,
    comments: [
      {
        id: 'comment-2-1',
        postId: 'post-2',
        author: 'David Kumar',
        authorRole: 'Year 1 Teacher',
        content: 'These are fantastic! I&apos;ve adapted them for Year 1 with smaller numbers and they absolutely love it.',
        createdDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        likes: 15,
        replies: [],
        isEdited: false,
      },
    ],
    downloads: 203,
    views: 678,
    attachments: [
      {
        id: 'attach-2-1',
        name: 'Place-Value-Games-Pack.zip',
        type: 'zip',
        url: '/resources/place-value-games.zip',
        fileSize: '5.2 MB',
        format: 'ZIP',
        downloads: 203,
      },
    ],
    isBookmarked: false,
    isPinned: true,
    status: 'published',
  },
  {
    id: 'post-3',
    title: 'How do you teach word problems effectively?',
    description: 'Looking for strategies to help students tackle word problems',
    content: `I&apos;m struggling with getting my Year 4 students to approach word problems systematically. They often jump to calculations without understanding what the problem is asking.

What strategies have worked for you? Do you use any specific frameworks or visual organizers?

Would love to hear what&apos;s been successful in your classrooms!`,
    author: 'Michael Chen',
    authorRole: 'Year 4 Teacher',
    authorAvatar: '/avatars/michael-c.jpg',
    category: 'question',
    tags: ['word-problems', 'year-4', 'problem-solving', 'mathematics'],
    subject: 'Mathematics',
    gradeLevel: 'Year 4-5',
    createdDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    likes: 34,
    comments: [
      {
        id: 'comment-3-1',
        postId: 'post-3',
        author: 'Linda Watson',
        authorRole: 'Mathematics Lead',
        content: 'I use the CUBES strategy: Circle numbers, Underline question, Box key words, Eliminate unnecessary info, Solve and check. Works really well!',
        createdDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        likes: 28,
        replies: [
          {
            id: 'reply-3-1-1',
            commentId: 'comment-3-1',
            author: 'Michael Chen',
            authorRole: 'Year 4 Teacher',
            content: 'That sounds perfect! Do you have any resources for this?',
            createdDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            likes: 6,
          },
          {
            id: 'reply-3-1-2',
            commentId: 'comment-3-1',
            author: 'Linda Watson',
            authorRole: 'Mathematics Lead',
            content: 'I&apos;ll create a post with my CUBES materials - watch this space!',
            createdDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            likes: 12,
          },
        ],
        isEdited: false,
      },
      {
        id: 'comment-3-2',
        postId: 'post-3',
        author: 'Patricia Lee',
        authorRole: 'Year 5 Teacher',
        content: 'We use problem-solving journals where students draw pictures and write their thinking. Visual representation helps them understand before calculating.',
        createdDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        likes: 19,
        replies: [],
        isEdited: false,
      },
    ],
    downloads: 0,
    views: 289,
    attachments: [],
    isBookmarked: true,
    isPinned: false,
    status: 'published',
  },
  {
    id: 'post-4',
    title: 'Fraction Wall Visual Aid - Free Template',
    description: 'Printable fraction wall to help students understand equivalent fractions',
    content: `I created this large fraction wall template that I print on A3 and laminate for my classroom. Students can physically see how fractions relate to each other.

**Features:**
- Color-coded for easy visualization
- Shows 1 whole through to 1/12
- Great for finding equivalent fractions
- Can be used for comparing fractions

I also created a smaller version that students can keep in their math folders. Both versions attached!

**Teaching tip:** Use different colored markers to show equivalent fractions by drawing lines across the wall.`,
    author: 'Emma Richardson',
    authorRole: 'Year 5 Teacher',
    authorAvatar: '/avatars/emma-r.jpg',
    category: 'resource',
    tags: ['fractions', 'year-5', 'visual-aid', 'printable', 'mathematics'],
    subject: 'Mathematics',
    gradeLevel: 'Year 4-6',
    createdDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    likes: 156,
    comments: [
      {
        id: 'comment-4-1',
        postId: 'post-4',
        author: 'Robert Taylor',
        authorRole: 'Year 6 Teacher',
        content: 'This is exactly what I needed! The color coding makes it so much clearer for students who struggle with fractions.',
        createdDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        likes: 22,
        replies: [],
        isEdited: false,
      },
    ],
    downloads: 342,
    views: 892,
    attachments: [
      {
        id: 'attach-4-1',
        name: 'Fraction-Wall-A3.pdf',
        type: 'document',
        url: '/resources/fraction-wall-a3.pdf',
        fileSize: '1.2 MB',
        format: 'PDF',
        thumbnailUrl: '/thumbnails/fraction-wall.png',
        downloads: 342,
      },
      {
        id: 'attach-4-2',
        name: 'Fraction-Wall-Student.pdf',
        type: 'document',
        url: '/resources/fraction-wall-student.pdf',
        fileSize: '0.8 MB',
        format: 'PDF',
        thumbnailUrl: '/thumbnails/fraction-wall-small.png',
        downloads: 298,
      },
    ],
    isBookmarked: false,
    isPinned: true,
    status: 'published',
  },
  {
    id: 'post-5',
    title: 'Mental Math Warm-Up Routines',
    description: 'Quick 5-minute activities to start your math lessons',
    content: `Starting each math lesson with a 5-minute mental math warm-up has transformed my teaching. Students are more engaged and ready to learn.

**My favorite routines:**

**Monday: Number of the Day**
Pick a number, students find different ways to make it (addition, subtraction, multiplication)

**Tuesday: Fact Fluency Practice**
Rapid-fire basic facts using number fans

**Wednesday: Estimation Station**
Show a jar of items, students estimate, discuss strategies

**Thursday: Problem of the Day**
One challenging problem to discuss together

**Friday: Math Talk**
Show a visual pattern, students describe what they notice

I rotate these weekly and students now come in excited for math! The consistency helps build confidence.`,
    author: 'Daniel Brown',
    authorRole: 'Year 3 Teacher',
    authorAvatar: '/avatars/daniel-b.jpg',
    category: 'teaching-tip',
    tags: ['mental-math', 'warm-up', 'routines', 'year-3', 'mathematics'],
    subject: 'Mathematics',
    gradeLevel: 'Year 2-4',
    createdDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    likes: 112,
    comments: [
      {
        id: 'comment-5-1',
        postId: 'post-5',
        author: 'Sophie Anderson',
        authorRole: 'Year 2 Teacher',
        content: 'I love the weekly rotation idea! Keeps it fresh and students know what to expect each day.',
        createdDate: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
        likes: 18,
        replies: [],
        isEdited: false,
      },
    ],
    downloads: 87,
    views: 534,
    attachments: [
      {
        id: 'attach-5-1',
        name: 'Mental-Math-Routine-Guide.pdf',
        type: 'document',
        url: '/resources/mental-math-routines.pdf',
        fileSize: '1.5 MB',
        format: 'PDF',
        downloads: 87,
      },
    ],
    isBookmarked: false,
    isPinned: false,
    status: 'published',
  },
  {
    id: 'post-6',
    title: 'Shape Scavenger Hunt - Outdoor Math Activity',
    description: 'Take geometry outside with this engaging scavenger hunt',
    content: `Get students moving and learning with this outdoor geometry activity! Perfect for a sunny day or as part of a cross-curricular unit.

**Activity Overview:**
Students work in pairs to find real-world examples of 2D and 3D shapes around the school grounds.

**What you need:**
- Clipboards
- Recording sheet (attached)
- Digital camera or iPad (optional)
- Time: 30-40 minutes

**Instructions:**
1. Review target shapes beforehand
2. Give each pair a recording sheet
3. Set clear boundaries for the search area
4. Students photograph or sketch their findings
5. Return to class to share and discuss

**Extension:** Students can measure perimeter or count faces, edges, and vertices of their found shapes.

My Year 3s absolutely loved this! They found shapes in unexpected places and it led to great discussions about shape properties.`,
    author: 'Olivia Parker',
    authorRole: 'Year 3 Teacher',
    authorAvatar: '/avatars/olivia-p.jpg',
    category: 'activity',
    tags: ['geometry', 'shapes', 'outdoor-learning', 'year-3', 'mathematics'],
    subject: 'Mathematics',
    gradeLevel: 'Year 2-4',
    createdDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    likes: 73,
    comments: [],
    downloads: 156,
    views: 445,
    attachments: [
      {
        id: 'attach-6-1',
        name: 'Shape-Hunt-Recording-Sheet.pdf',
        type: 'document',
        url: '/resources/shape-scavenger-hunt.pdf',
        fileSize: '1.1 MB',
        format: 'PDF',
        thumbnailUrl: '/thumbnails/shape-hunt.png',
        downloads: 156,
      },
    ],
    isBookmarked: false,
    isPinned: false,
    status: 'published',
  },
  {
    id: 'post-7',
    title: 'Times Tables Fluency Assessment Tracker',
    description: 'Excel spreadsheet to track student progress on multiplication facts',
    content: `Keeping track of which times tables each student has mastered used to be a nightmare until I created this tracker.

**Features:**
- Individual student progress for 2x through 12x tables
- Color-coded proficiency levels (learning, developing, secure)
- Class overview dashboard
- Automatic percentage calculations
- Print-friendly format for parent conferences

**How I use it:**
- Weekly quick assessments (2 minutes per student)
- Students know which table they&apos;re working on next
- Parents can see clear progress
- Helps me plan intervention groups

This has made times tables practice so much more systematic in my classroom. Happy to answer any questions about implementation!`,
    author: 'Thomas Wright',
    authorRole: 'Year 4 Teacher',
    authorAvatar: '/avatars/thomas-w.jpg',
    category: 'assessment',
    tags: ['times-tables', 'assessment', 'tracking', 'year-4', 'mathematics'],
    subject: 'Mathematics',
    gradeLevel: 'Year 3-5',
    createdDate: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    likes: 94,
    comments: [
      {
        id: 'comment-7-1',
        postId: 'post-7',
        author: 'Grace Martin',
        authorRole: 'Year 5 Teacher',
        content: 'This is brilliant! Do you assess all students in one sitting or spread it across the week?',
        createdDate: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000).toISOString(),
        likes: 8,
        replies: [
          {
            id: 'reply-7-1-1',
            commentId: 'comment-7-1',
            author: 'Thomas Wright',
            authorRole: 'Year 4 Teacher',
            content: 'I do 5-6 students per day during independent work time. Takes about 10 minutes total and everyone gets assessed once a week.',
            createdDate: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000).toISOString(),
            likes: 11,
          },
        ],
        isEdited: false,
      },
    ],
    downloads: 167,
    views: 512,
    attachments: [
      {
        id: 'attach-7-1',
        name: 'Times-Tables-Tracker.xlsx',
        type: 'spreadsheet',
        url: '/resources/times-tables-tracker.xlsx',
        fileSize: '0.3 MB',
        format: 'XLSX',
        downloads: 167,
      },
    ],
    isBookmarked: true,
    isPinned: false,
    status: 'published',
  },
]

export const mockCommunityStats: CommunityStats = {
  totalMembers: 1247,
  totalPosts: 3856,
  totalResources: 2134,
  activeToday: 89,
  topContributors: [
    {
      userId: 'user-1',
      name: 'Emma Richardson',
      role: 'Year 5 Teacher',
      avatar: '/avatars/emma-r.jpg',
      posts: 43,
      helpfulness: 1245,
    },
    {
      userId: 'user-2',
      name: 'Rachel Foster',
      role: 'Year 2 Teacher',
      avatar: '/avatars/rachel-f.jpg',
      posts: 38,
      helpfulness: 1089,
    },
    {
      userId: 'user-3',
      name: 'Thomas Wright',
      role: 'Year 4 Teacher',
      avatar: '/avatars/thomas-w.jpg',
      posts: 31,
      helpfulness: 892,
    },
  ],
}

// Helper functions
export function getPostById(id: string): Post | undefined {
  return mockPosts.find((post) => post.id === id)
}

export function getPostsByCategory(category: string): Post[] {
  return mockPosts.filter((post) => post.category === category)
}

export function getPostsBySubject(subject: string): Post[] {
  return mockPosts.filter((post) => post.subject === subject)
}

export function getPinnedPosts(): Post[] {
  return mockPosts.filter((post) => post.isPinned)
}

export function getBookmarkedPosts(): Post[] {
  return mockPosts.filter((post) => post.isBookmarked)
}

export function getPopularPosts(): Post[] {
  return [...mockPosts].sort((a, b) => b.likes - a.likes)
}

export function getRecentPosts(): Post[] {
  return [...mockPosts].sort(
    (a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
  )
}

export function getTotalDownloads(): number {
  return mockPosts.reduce((total, post) => total + post.downloads, 0)
}

export function getCommunityStats(): CommunityStats {
  return mockCommunityStats
}
