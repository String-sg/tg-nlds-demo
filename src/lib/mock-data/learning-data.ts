/**
 * Mock data for Learning Platform
 * Professional development courses for primary mathematics teachers
 */

import type {
  Course,
  Module,
  Lesson,
  Resource,
  Certificate,
} from '@/types/learning'

export const mockCourses: Course[] = [
  {
    id: 'course-1',
    title: 'Building Number Sense in Early Years',
    description:
      'Develop effective strategies for teaching foundational number concepts to Year 1-3 students. Learn hands-on approaches to help children understand quantity, counting, and basic operations through play-based learning.',
    subject: 'Mathematics',
    level: 'Primary',
    category: 'subject-knowledge',
    duration: '4 weeks',
    instructor: 'Dr. Sarah Chen',
    instructorRole: 'Mathematics Education Specialist',
    thumbnail: '/images/courses/number-sense.jpg',
    enrolledDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    progress: 65,
    completed: false,
    modules: [
      {
        id: 'mod-1-1',
        courseId: 'course-1',
        title: 'Understanding Number Sense',
        description: 'Introduction to number sense and why it matters',
        order: 1,
        duration: '3 hours',
        completed: true,
        progress: 100,
        lessons: [
          {
            id: 'lesson-1-1-1',
            moduleId: 'mod-1-1',
            title: 'What is Number Sense?',
            description: 'Explore the concept and importance of number sense',
            order: 1,
            type: 'video',
            duration: '25 minutes',
            completed: true,
            content: {
              videoUrl: '/videos/number-sense-intro.mp4',
              text: 'Number sense is the foundational understanding of numbers and their relationships...',
            },
            resources: [],
          },
          {
            id: 'lesson-1-1-2',
            moduleId: 'mod-1-1',
            title: 'Developmental Stages',
            description: 'Understanding how children develop number sense',
            order: 2,
            type: 'reading',
            duration: '30 minutes',
            completed: true,
            content: {
              text: 'Children progress through distinct stages as they develop number sense...',
            },
            resources: [],
          },
        ],
      },
      {
        id: 'mod-1-2',
        courseId: 'course-1',
        title: 'Counting and Subitizing',
        description: 'Teaching effective counting strategies',
        order: 2,
        duration: '4 hours',
        completed: false,
        progress: 50,
        lessons: [
          {
            id: 'lesson-1-2-1',
            moduleId: 'mod-1-2',
            title: 'Counting Principles',
            description: 'The five counting principles every child should master',
            order: 1,
            type: 'video',
            duration: '35 minutes',
            completed: true,
            content: {
              videoUrl: '/videos/counting-principles.mp4',
            },
            resources: [],
          },
          {
            id: 'lesson-1-2-2',
            moduleId: 'mod-1-2',
            title: 'Subitizing Activities',
            description: 'Hands-on activities for developing subitizing skills',
            order: 2,
            type: 'activity',
            duration: '45 minutes',
            completed: false,
            content: {},
            resources: [
              {
                id: 'res-1-2-2-1',
                title: 'Subitizing Cards Printable',
                description: 'Ready-to-print dot pattern cards',
                type: 'worksheet',
                url: '/resources/subitizing-cards.pdf',
                fileSize: '2.3 MB',
                format: 'PDF',
                downloadable: true,
                tags: ['printable', 'hands-on', 'year-1', 'year-2'],
              },
            ],
          },
        ],
      },
    ],
    tags: ['number-sense', 'early-years', 'foundational-skills', 'hands-on'],
  },
  {
    id: 'course-2',
    title: 'Geometry and Spatial Reasoning',
    description:
      'Enhance your teaching of geometric concepts and spatial thinking for primary students. Explore shapes, patterns, measurement, and spatial relationships through engaging activities and real-world applications.',
    subject: 'Mathematics',
    level: 'Primary',
    category: 'subject-knowledge',
    duration: '3 weeks',
    instructor: 'Mr. James Thompson',
    instructorRole: 'Senior Mathematics Teacher',
    thumbnail: '/images/courses/geometry.jpg',
    enrolledDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    progress: 30,
    completed: false,
    modules: [
      {
        id: 'mod-2-1',
        courseId: 'course-2',
        title: '2D and 3D Shapes',
        description: 'Teaching shape recognition and properties',
        order: 1,
        duration: '3.5 hours',
        completed: false,
        progress: 60,
        lessons: [
          {
            id: 'lesson-2-1-1',
            moduleId: 'mod-2-1',
            title: 'Shape Properties and Classification',
            description: 'Understanding how to teach shape characteristics',
            order: 1,
            type: 'video',
            duration: '28 minutes',
            completed: true,
            content: {
              videoUrl: '/videos/shape-properties.mp4',
            },
            resources: [],
          },
          {
            id: 'lesson-2-1-2',
            moduleId: 'mod-2-1',
            title: 'Hands-On Shape Activities',
            description: 'Interactive classroom activities for shape learning',
            order: 2,
            type: 'activity',
            duration: '40 minutes',
            completed: false,
            content: {},
            resources: [
              {
                id: 'res-2-1-2-1',
                title: 'Shape Hunt Activity Sheet',
                type: 'worksheet',
                url: '/resources/shape-hunt.pdf',
                fileSize: '1.8 MB',
                format: 'PDF',
                downloadable: true,
                tags: ['shapes', 'activity', 'year-2', 'year-3'],
              },
            ],
          },
        ],
      },
    ],
    tags: ['geometry', 'spatial-reasoning', 'shapes', 'measurement'],
  },
  {
    id: 'course-3',
    title: 'Problem-Solving Strategies for Primary Maths',
    description:
      'Learn how to teach students effective problem-solving approaches and develop mathematical thinking skills. Includes strategies for word problems, multi-step problems, and mathematical reasoning.',
    subject: 'Mathematics',
    level: 'Primary',
    category: 'pedagogy',
    duration: '5 weeks',
    instructor: 'Ms. Rachel Foster',
    instructorRole: 'Mathematics Curriculum Coordinator',
    thumbnail: '/images/courses/problem-solving.jpg',
    progress: 0,
    completed: false,
    modules: [
      {
        id: 'mod-3-1',
        courseId: 'course-3',
        title: 'Introduction to Problem-Solving',
        description: 'Framework for teaching problem-solving skills',
        order: 1,
        duration: '2.5 hours',
        completed: false,
        progress: 0,
        lessons: [
          {
            id: 'lesson-3-1-1',
            moduleId: 'mod-3-1',
            title: 'The Problem-Solving Process',
            description: 'Step-by-step approach to mathematical problem-solving',
            order: 1,
            type: 'video',
            duration: '32 minutes',
            completed: false,
            content: {
              videoUrl: '/videos/problem-solving-process.mp4',
            },
            resources: [],
          },
        ],
      },
    ],
    tags: ['problem-solving', 'critical-thinking', 'word-problems', 'reasoning'],
  },
  {
    id: 'course-4',
    title: 'Assessment Strategies in Primary Mathematics',
    description:
      'Master formative and summative assessment techniques tailored for primary mathematics. Learn to design effective assessments, interpret student work, and use data to inform your teaching practice.',
    subject: 'Mathematics',
    level: 'Primary',
    category: 'assessment',
    duration: '3 weeks',
    instructor: 'Dr. Michael Lee',
    instructorRole: 'Assessment and Evaluation Specialist',
    thumbnail: '/images/courses/assessment.jpg',
    enrolledDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    progress: 100,
    completed: true,
    certificateUrl: '/certificates/cert-004.pdf',
    modules: [
      {
        id: 'mod-4-1',
        courseId: 'course-4',
        title: 'Formative Assessment Techniques',
        description: 'Daily assessment strategies for monitoring progress',
        order: 1,
        duration: '3 hours',
        completed: true,
        progress: 100,
        lessons: [
          {
            id: 'lesson-4-1-1',
            moduleId: 'mod-4-1',
            title: 'Exit Tickets and Quick Checks',
            description: 'Using brief assessments to gauge understanding',
            order: 1,
            type: 'video',
            duration: '22 minutes',
            completed: true,
            content: {
              videoUrl: '/videos/exit-tickets.mp4',
            },
            resources: [
              {
                id: 'res-4-1-1-1',
                title: 'Exit Ticket Templates',
                type: 'template',
                url: '/resources/exit-ticket-templates.pdf',
                fileSize: '1.2 MB',
                format: 'PDF',
                downloadable: true,
                tags: ['assessment', 'formative', 'templates'],
              },
            ],
          },
        ],
      },
      {
        id: 'mod-4-2',
        courseId: 'course-4',
        title: 'Data-Driven Instruction',
        description: 'Using assessment data to improve teaching',
        order: 2,
        duration: '3.5 hours',
        completed: true,
        progress: 100,
        lessons: [
          {
            id: 'lesson-4-2-1',
            moduleId: 'mod-4-2',
            title: 'Analyzing Student Work',
            description: 'Identifying patterns and misconceptions',
            order: 1,
            type: 'reading',
            duration: '35 minutes',
            completed: true,
            content: {},
            resources: [],
          },
        ],
      },
    ],
    tags: ['assessment', 'formative', 'summative', 'data-analysis'],
  },
  {
    id: 'course-5',
    title: 'Differentiation in the Mathematics Classroom',
    description:
      'Learn practical strategies for differentiating mathematics instruction to meet diverse student needs. Includes techniques for scaffolding, extension activities, and supporting struggling learners.',
    subject: 'Mathematics',
    level: 'Primary',
    category: 'pedagogy',
    duration: '4 weeks',
    instructor: 'Ms. Emma Watson',
    instructorRole: 'Inclusion and Differentiation Specialist',
    thumbnail: '/images/courses/differentiation.jpg',
    progress: 0,
    completed: false,
    modules: [
      {
        id: 'mod-5-1',
        courseId: 'course-5',
        title: 'Principles of Differentiation',
        description: 'Understanding effective differentiation strategies',
        order: 1,
        duration: '2 hours',
        completed: false,
        progress: 0,
        lessons: [
          {
            id: 'lesson-5-1-1',
            moduleId: 'mod-5-1',
            title: 'What is Differentiation?',
            description: 'Core concepts and why it matters',
            order: 1,
            type: 'video',
            duration: '28 minutes',
            completed: false,
            content: {
              videoUrl: '/videos/differentiation-intro.mp4',
            },
            resources: [],
          },
        ],
      },
    ],
    tags: ['differentiation', 'inclusion', 'scaffolding', 'support'],
  },
  {
    id: 'course-6',
    title: 'Using Manipulatives to Teach Mathematics',
    description:
      'Discover how to effectively use concrete materials and manipulatives to build mathematical understanding. From counters to base-ten blocks, learn when and how to incorporate hands-on tools in your lessons.',
    subject: 'Mathematics',
    level: 'Primary',
    category: 'pedagogy',
    duration: '2 weeks',
    instructor: 'Mr. David Kumar',
    instructorRole: 'Primary Mathematics Lead Teacher',
    thumbnail: '/images/courses/manipulatives.jpg',
    enrolledDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    progress: 100,
    completed: true,
    certificateUrl: '/certificates/cert-006.pdf',
    modules: [
      {
        id: 'mod-6-1',
        courseId: 'course-6',
        title: 'Types of Manipulatives',
        description: 'Overview of common mathematical manipulatives',
        order: 1,
        duration: '1.5 hours',
        completed: true,
        progress: 100,
        lessons: [
          {
            id: 'lesson-6-1-1',
            moduleId: 'mod-6-1',
            title: 'Choosing the Right Manipulative',
            description: 'Matching tools to learning objectives',
            order: 1,
            type: 'video',
            duration: '18 minutes',
            completed: true,
            content: {
              videoUrl: '/videos/choosing-manipulatives.mp4',
            },
            resources: [],
          },
        ],
      },
    ],
    tags: ['manipulatives', 'hands-on', 'concrete', 'practical'],
  },
]

export const mockCertificates: Certificate[] = [
  {
    id: 'cert-1',
    courseId: 'course-4',
    courseName: 'Assessment Strategies in Primary Mathematics',
    issuedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    certificateUrl: '/certificates/cert-004.pdf',
    credentialId: 'ASPM-2024-001234',
  },
  {
    id: 'cert-2',
    courseId: 'course-6',
    courseName: 'Using Manipulatives to Teach Mathematics',
    issuedDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    certificateUrl: '/certificates/cert-006.pdf',
    credentialId: 'UMTM-2024-001235',
  },
]

export const mockAvailableCourses: Course[] = [
  {
    id: 'course-7',
    title: 'Mathematical Discourse and Classroom Talk',
    description:
      'Develop skills to facilitate rich mathematical discussions in your classroom. Learn questioning techniques and strategies to encourage student-to-student dialogue.',
    subject: 'Mathematics',
    level: 'Primary',
    category: 'pedagogy',
    duration: '3 weeks',
    instructor: 'Dr. Patricia Martinez',
    instructorRole: 'Mathematics Education Researcher',
    thumbnail: '/images/courses/discourse.jpg',
    progress: 0,
    completed: false,
    modules: [],
    tags: ['discourse', 'questioning', 'discussion', 'communication'],
  },
  {
    id: 'course-8',
    title: 'Fractions and Decimals Fundamentals',
    description:
      'Build deep understanding of how to teach fractions and decimals effectively. Address common misconceptions and learn progression from concrete to abstract.',
    subject: 'Mathematics',
    level: 'Primary',
    category: 'subject-knowledge',
    duration: '4 weeks',
    instructor: 'Ms. Linda Chen',
    instructorRole: 'Mathematics Consultant',
    thumbnail: '/images/courses/fractions.jpg',
    progress: 0,
    completed: false,
    modules: [],
    tags: ['fractions', 'decimals', 'rational-numbers', 'progression'],
  },
]

// Helper functions
export function getCourseById(id: string): Course | undefined {
  return mockCourses.find((course) => course.id === id)
}

export function getEnrolledCourses(): Course[] {
  return mockCourses.filter((course) => course.enrolledDate)
}

export function getInProgressCourses(): Course[] {
  return mockCourses.filter(
    (course) => course.enrolledDate && !course.completed && course.progress > 0
  )
}

export function getCompletedCourses(): Course[] {
  return mockCourses.filter((course) => course.completed)
}

export function getAvailableCourses(): Course[] {
  return [...mockCourses.filter((course) => !course.enrolledDate), ...mockAvailableCourses]
}

export function getCoursesByCategory(category: string): Course[] {
  return mockCourses.filter((course) => course.category === category)
}

export function getUserCertificates(): Certificate[] {
  return mockCertificates
}

export function getTotalLearningHours(): number {
  // Calculate from completed courses
  const completedCourses = getCompletedCourses()
  // Simplified: assume 1 week = 8 hours
  return completedCourses.reduce((total, course) => {
    const weeks = parseInt(course.duration)
    return total + (weeks * 8)
  }, 0)
}
