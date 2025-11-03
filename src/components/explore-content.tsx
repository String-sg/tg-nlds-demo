'use client'

import { useState, useMemo, useEffect } from 'react'
import Image from 'next/image'
import {
  Search,
  CalendarDays,
  Ear,
  Send,
  Languages,
  Check,
  Sparkles,
  Users,
  Globe,
  CheckSquare,
  Star,
  Bot,
  Database,
  Mail,
  Phone,
  LayoutGrid,
  Zap,
  GraduationCap,
  MapPin,
  LogIn,
  DollarSign,
  Gift,
  Bus,
  Lightbulb,
  Network,
  Heart,
  Key,
  AtSign,
  Shield,
  Video,
  MessageCircle,
  PieChart,
  type LucideIcon,
} from 'lucide-react'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { AppDetail } from '@/components/explore/app-detail'
import { comingSoonToast } from '@/lib/coming-soon-toast'
import type { App } from '@/types/explore'

const categoryDescriptions: Record<string, string> = {
  'Recommended for you': "Because it's an exam period",
  'Classes and students': 'Tools for classroom management, student assessment, and academic support',
  'Parents and communications': 'Connect with parents and manage school-home communication',
  'School life & Admin': 'Administrative tools and school management systems',
  'Growth and community': 'Professional development and community engagement platforms',
  'Digital innovation and enhancements': 'Cutting-edge digital tools and productivity enhancers',
  'My school apps': 'Apps specific to your school for managing results, student check-ins, and more',
}

// SDT Data Tool - appears in both "Recommended for you" and "Classes and students"
const sdtDataTool: App = {
  key: 'sdt-data-tool',
  name: 'SDT Data Tool',
  tagline: 'Data-driven insights for student well-being',
  description: 'Data analytics framework for Student Development Teams',
  fullDescription: `The SDT Data Tool is a comprehensive data analytics framework used by Student Development Teams (SDT) to monitor and support student development and well-being across Singapore MOE schools. The SDT comprises Year Heads and Assistant Year Heads who lead in advocating and promoting the overall student development and well-being of students.

The SDT actively works with key personnel and teachers to deepen understanding of student development and well-being needs by leveraging focused group discussions and data from various sources. This includes Well-being Check-in surveys, Student Experience & Engagement Survey results, Sociograms, and Peer-Support Leaders' Reports.

The data is used to customize curriculum and support programs for students' holistic development, enabling schools to take a proactive, data-informed approach to student welfare. With intelligent analytics and comprehensive reporting, the SDT Data Tool empowers educators to identify at-risk students early and provide targeted interventions that make a real difference.`,
  icon: '/logos/sdt-logo-22-oct-2025-transparent.png',
  category: 'Recommended for you',
  gradient: 'from-blue-500 to-cyan-600',
  developer: {
    name: 'Ministry of Education (MOE) Singapore',
    website: 'https://www.moe.gov.sg',
    support: 'https://www.moe.gov.sg/contact',
  },
  metadata: {
    rating: 4.7,
    ratingCount: 456,
    ageRating: '4+',
    chartPosition: 5,
    chartCategory: 'Education',
    languages: ['EN', 'ZH', 'MS', 'TA'],
    size: '42 MB',
  },
  features: [
    'Integration of multiple data sources (surveys, reports, sociograms)',
    'Well-being monitoring and tracking',
    'Customizable support program planning',
    'Focused group discussion insights',
    'Peer support leader reporting',
  ],
  platforms: ['Web'],
  inAppPurchases: false,
}

// Mark.ly - appears in both "Recommended for you" and "Classes and students"
const markly: App = {
  key: 'markly',
  name: 'Mark.ly',
  tagline: 'Reimagining marking with AI',
  description: 'AI-powered assessment and feedback tool',
  fullDescription: `Mark.ly is an innovative AI-powered assessment tool that transforms how educators provide feedback to students. Leveraging advanced natural language processing and machine learning, Mark.ly can grade written assignments, provide constructive feedback, and identify learning gaps—all while maintaining the personal touch that students need to thrive.

The platform supports multiple assessment types including essays, short answers, creative writing, and project work. Teachers can customize rubrics, set specific grading criteria, and review AI suggestions before finalizing marks. Mark.ly learns from your feedback style over time, becoming more aligned with your teaching philosophy and ensuring consistency across assessments.

Designed specifically for Singapore MOE educators, Mark.ly integrates seamlessly with the Student Learning Space and other MOE systems, following local curriculum guidelines and assessment frameworks. Save hours on marking while providing more detailed, actionable feedback that helps every student improve. With batch marking capabilities and intelligent analytics, Mark.ly gives you back precious time to focus on what matters most—inspiring and supporting your students.`,
  icon: '/logos/Markly.svg',
  category: 'Recommended for you',
  gradient: 'from-amber-500 to-orange-600',
  developer: {
    name: 'MOE Digital Innovation',
    website: 'https://www.moe.gov.sg',
    support: 'https://www.moe.gov.sg/contact',
  },
  metadata: {
    rating: 4.8,
    ratingCount: 892,
    ageRating: '4+',
    chartPosition: 2,
    chartCategory: 'Education',
    languages: ['EN', 'ZH', 'MS', 'TA'],
    size: '48 MB',
  },
  features: [
    'AI-powered essay and short answer grading',
    'Customizable rubrics and grading criteria',
    'Batch marking for efficiency',
    'Detailed analytics and learning gap identification',
    'Integration with Student Learning Space (SLS)',
  ],
  platforms: ['Web', 'iPad', 'Mac'],
  inAppPurchases: false,
}

const allApps: App[] = [
  // Recommended for you
  sdtDataTool,
  markly,

  // Classes and students
  { ...sdtDataTool, category: 'Classes and students' },
  {
    key: 'seconnect',
    name: 'SEConnect',
    tagline: 'Connecting students and educators',
    description: 'Student engagement and connection platform',
    fullDescription: `SEConnect is a comprehensive student engagement platform designed to strengthen connections between students, teachers, and school communities. The platform facilitates meaningful interactions, collaborative learning, and peer support networks that enhance the educational experience.

Through SEConnect, teachers can create engaging activities, monitor student participation, and foster a positive learning environment. Students benefit from peer networking opportunities, access to support resources, and channels for expressing their views and concerns in a safe, moderated environment.

The platform integrates with existing MOE systems to provide a seamless experience, ensuring that student engagement data informs teaching strategies and school programs. SEConnect supports the holistic development of students by promoting active participation, building resilience, and strengthening school culture.`,
    icon: '/logos/seconnect-mysei.png',
    category: 'Classes and students',
    gradient: 'from-green-500 to-emerald-600',
    developer: {
      name: 'Ministry of Education (MOE) Singapore',
      website: 'https://www.moe.gov.sg',
      support: 'https://www.moe.gov.sg/contact',
    },
    metadata: {
      rating: 4.5,
      ratingCount: 324,
      ageRating: '4+',
      chartPosition: 12,
      chartCategory: 'Education',
      languages: ['EN', 'ZH', 'MS', 'TA'],
      size: '38 MB',
    },
    features: [
      'Student engagement tracking',
      'Collaborative learning tools',
      'Peer support networks',
      'Safe communication channels',
      'Integration with MOE systems',
    ],
    platforms: ['Web', 'iPad', 'iPhone'],
    inAppPurchases: false,
  },
  {
    key: 'sc-mobile',
    name: 'Attendance (SCM)',
    tagline: 'Streamlined attendance tracking',
    description: 'Mobile attendance platform integrated with School Cockpit',
    fullDescription: `SC Mobile is an intuitive attendance-taking platform accessible via teachers' mobile devices or desktops, designed to replace traditional pen-and-paper or Excel-based attendance tracking. Teachers can quickly mark students' attendance each morning by tapping on their mobile phones, making the daily routine efficient and paperless.

At their convenience, teachers can select specific absent reasons, and the data is automatically synchronized to School Cockpit, the central MOE database. The system also provides easy access to parents' contact information and can automatically inform parents of students' absences via SMS, enhancing school-home communication.

The platform has significantly improved efficiency by eliminating the manual submission process that previously required teachers to consolidate and submit attendance records manually. With automatic data sync, real-time updates, and mobile accessibility, SC Mobile represents a modern approach to school administration that saves time and reduces errors.`,
    icon: '/logos/sc-mobile.png',
    category: 'Classes and students',
    gradient: 'from-purple-500 to-violet-600',
    developer: {
      name: 'Ministry of Education (MOE) Singapore',
      website: 'https://scmobile.moe.edu.sg',
      support: 'https://www.moe.gov.sg/contact',
    },
    metadata: {
      rating: 4.8,
      ratingCount: 1245,
      ageRating: '4+',
      chartPosition: 1,
      chartCategory: 'Education',
      languages: ['EN', 'ZH', 'MS', 'TA'],
      size: '32 MB',
    },
    features: [
      'Mobile and desktop attendance marking',
      'Automatic data sync to School Cockpit',
      'Automated parent SMS notifications',
      'Quick access to parent contact information',
      'Absence reason tracking',
      'Real-time attendance updates',
    ],
    platforms: ['Web', 'iOS', 'Android'],
    inAppPurchases: false,
  },
  { ...markly, category: 'Classes and students' },
  {
    key: 'appraiser',
    name: 'Appraiser',
    tagline: 'AI-powered student testimonials in minutes',
    description: 'Testimonial generator tool for teachers',
    fullDescription: `Appraiser is an innovative AI-powered testimonial generator tool built by GovTech in collaboration with MOE as part of the LaunchPad ecosystem. The tool was created to address the time-consuming task of writing student testimonials, which traditionally required hours of manual work per student.

Teachers can now use Appraiser to generate a polished first draft within minutes instead of spending hours manually writing each testimonial. The tool has been designed with a user-friendly interface that requires minimal training, allowing teachers to adopt it quickly and effectively.

To date, Appraiser has benefited more than 4,000 teachers and has generated over 40,000 testimonials, demonstrating significant efficiency gains across the MOE system. The AI-powered platform ensures personalized, well-structured testimonials that help students in their educational and career journeys, while freeing up valuable teacher time for direct student interaction and support.`,
    icon: '/logos/appraiser-logo-no-words.png',
    category: 'Classes and students',
    gradient: 'from-yellow-500 to-amber-600',
    developer: {
      name: 'GovTech in collaboration with MOE Singapore',
      website: 'https://www.developer.tech.gov.sg',
      support: 'https://www.tech.gov.sg/contact-us',
    },
    metadata: {
      rating: 4.7,
      ratingCount: 678,
      ageRating: '4+',
      chartPosition: 6,
      chartCategory: 'Productivity',
      languages: ['EN', 'ZH', 'MS', 'TA'],
      size: '28 MB',
    },
    features: [
      'AI-powered testimonial generation',
      'Personalized and structured output',
      'Quick draft creation (minutes vs. hours)',
      'User-friendly interface with minimal training required',
      'Integration with LaunchPad ecosystem',
      'Bulk testimonial generation capability',
    ],
    platforms: ['Web'],
    inAppPurchases: false,
  },
  {
    key: 'authoring-copilot',
    name: 'Teaching pal (AI assistant)',
    tagline: 'AI-driven lesson planning for educators',
    description: 'AI assistant for creating digital lessons in SLS',
    fullDescription: `The Authoring Copilot (ACP), known to teachers as their AI Teaching Pal, is an AI-driven tool designed by educators for educators within Singapore's Student Learning Space platform. Leveraging Large Language Models (LLMs), the Authoring Copilot helps teachers turn their lesson ideas into fully realized digital lessons by generating modules with corresponding sections, activities, and components based on a teacher's text-based inputs.

The tool supports lesson planning for all subjects and levels, streamlining the process significantly. According to teacher testimonials, lessons that previously took about a week to plan now take only two to three days using the Authoring Copilot. This dramatic time savings allows teachers to focus more on personalized instruction and student engagement.

The Authoring Copilot is part of MOE's broader AI in Education initiative, which includes five AI-powered tools rolled out since June 2023 under the EdTech Masterplan 2030. It represents a significant advancement in reducing teacher workload while maintaining quality educational content that is curriculum-aligned and pedagogically sound.`,
    icon: Bot,
    category: 'Classes and students',
    gradient: 'from-indigo-500 to-purple-600',
    developer: {
      name: 'Ministry of Education (MOE) Singapore & GovTech',
      website: 'https://vle.learning.moe.edu.sg',
      support: 'https://www.learning.moe.edu.sg/sls/user-guide/vle',
    },
    metadata: {
      rating: 4.6,
      ratingCount: 543,
      ageRating: '4+',
      chartPosition: 8,
      chartCategory: 'Education',
      languages: ['EN', 'ZH', 'MS', 'TA'],
      size: '52 MB',
    },
    features: [
      'AI-powered lesson generation for all subjects and levels',
      'Automated creation of sections, activities, and components',
      'Natural language input for lesson planning',
      'Integration with SLS platform',
      'Curriculum-aligned content generation',
      'Time reduction from 1 week to 2-3 days per lesson',
    ],
    platforms: ['Web'],
    inAppPurchases: false,
  },
  {
    key: 'sdis',
    name: 'Student Development Integrated System (SDIS)',
    tagline: 'Holistic student development tracking',
    description: 'Comprehensive system for tracking student development',
    fullDescription: `The Student Development Integrated System (SDIS) is a comprehensive platform designed to track and support the holistic development of students across multiple domains. Building upon MOE's LEAPS 2.0 framework (Leadership, Enrichment, Achievement, Participation, Service), SDIS provides educators with a unified view of each student's growth journey.

The system integrates data from various sources including CCA participation, student leadership roles, community service activities, academic achievements, and character development programs. Teachers and school leaders can use SDIS to identify students' strengths, recognize outstanding contributions, and provide targeted support where needed.

SDIS supports the recognition of student development through structured frameworks, helping schools prepare graduation portfolios and references. The platform ensures that every student's holistic development is documented, celebrated, and supported throughout their educational journey, preparing them for success beyond the classroom.`,
    icon: '/logos/sdis-logo.png',
    category: 'Classes and students',
    gradient: 'from-teal-500 to-cyan-600',
    developer: {
      name: 'Ministry of Education (MOE) Singapore',
      website: 'https://www.moe.gov.sg',
      support: 'https://www.moe.gov.sg/contact',
    },
    metadata: {
      rating: 4.5,
      ratingCount: 387,
      ageRating: '4+',
      chartPosition: 14,
      chartCategory: 'Education',
      languages: ['EN', 'ZH', 'MS', 'TA'],
      size: '45 MB',
    },
    features: [
      'Holistic student development tracking',
      'LEAPS 2.0 framework integration',
      'CCA participation and achievement records',
      'Leadership and service tracking',
      'Graduation portfolio preparation',
      'Multi-domain student assessment',
    ],
    platforms: ['Web'],
    inAppPurchases: false,
  },

  // Parents and communications
  {
    key: 'allears',
    name: 'All Ears',
    tagline: 'Listen, support, empower',
    description: 'Student wellbeing and listening support',
    fullDescription: `All Ears provides a safe, confidential platform for students to express their concerns and seek support. As an educator, you can monitor student wellbeing indicators, respond to concerns promptly, and coordinate with counselors and support staff seamlessly.

The platform uses evidence-based screening tools and creates a supportive environment where students feel heard. Early warning systems alert you to students who may need additional support, while respecting privacy and maintaining appropriate boundaries.

Integrated with school counseling services, All Ears ensures that student welfare concerns are addressed holistically with proper documentation and follow-up protocols in place.`,
    icon: '/logos/ae-logo.png',
    category: 'Parents and communications',
    gradient: 'from-teal-400 to-teal-600',
    developer: {
      name: 'MOE Student Support Services',
      website: 'https://www.moe.gov.sg',
      support: 'https://www.moe.gov.sg/contact',
    },
    metadata: {
      rating: 4.8,
      ratingCount: 567,
      ageRating: '12+',
      chartPosition: 4,
      chartCategory: 'Health & Fitness',
      languages: ['EN', 'ZH', 'MS', 'TA'],
      size: '34 MB',
    },
    features: [
      'Confidential student check-ins',
      'Wellbeing indicators',
      'Counselor coordination',
      'Early warning system',
      'Documentation tools',
    ],
    platforms: ['Web', 'iPad', 'iPhone'],
    inAppPurchases: false,
  },
  {
    key: 'parents-gateway',
    name: 'PG Messages',
    tagline: 'Connecting parents and schools seamlessly',
    description: 'One-stop mobile app for school-home partnership',
    fullDescription: `Parents Gateway is a comprehensive mobile platform co-developed by Singapore's Ministry of Education (MOE) and the Government Technology Agency (GovTech), officially launched on January 2, 2019. The app replaces traditional paper-based communications between schools and parents, providing a centralized digital platform for all school-related administrative tasks and communications.

Using Singpass authentication, parents can manage their children's school matters even if they attend different schools or are in different classes. The platform serves mainstream MOE kindergartens, primary schools, secondary schools, junior colleges, and selected polytechnics.

The app enables parents to receive school announcements and updates via push notifications with multimedia attachments, view and respond to consent forms, book Parent-Teacher meeting slots, declare travel plans, and access parenting resources. With calendar integration and secure authentication, Parents Gateway strengthens school-home partnership to support children in their educational journey.`,
    icon: '/logos/pg-messages.png',
    category: 'Parents and communications',
    gradient: 'from-blue-500 to-indigo-600',
    developer: {
      name: 'GovTech & Ministry of Education (MOE) Singapore',
      website: 'https://pg.moe.edu.sg',
      support: 'https://go.gov.sg/pgsupport',
    },
    metadata: {
      rating: 4.6,
      ratingCount: 3456,
      ageRating: '4+',
      chartPosition: 3,
      chartCategory: 'Education',
      languages: ['EN', 'ZH', 'MS', 'TA'],
      size: '45 MB',
    },
    features: [
      'Receive school announcements with push notifications',
      'View and respond to consent forms',
      'Book Parent-Teacher meeting slots',
      'Declare travel plans and update contact details',
      'Calendar integration for school events',
      'Access parenting resources',
    ],
    platforms: ['iOS', 'Android'],
    inAppPurchases: false,
  },
  {
    key: 'heytalia',
    name: 'HeyTalia',
    tagline: 'Smart parent communication assistant',
    description: 'AI-powered parent communication platform',
    fullDescription: `HeyTalia is an innovative AI-powered communication platform designed to enhance parent-school interactions through intelligent messaging and support services. The platform helps schools manage parent communications more efficiently while providing parents with quick access to information and support when they need it.

Using natural language processing, HeyTalia can answer common parent queries, provide school information, and route complex questions to the appropriate staff members. The platform supports multiple languages, making it accessible to Singapore's diverse parent community.

HeyTalia integrates with existing school systems to provide personalized responses based on student information, school calendars, and relevant policies. From checking homework assignments to understanding school procedures, HeyTalia empowers parents to stay informed and engaged in their children's education while reducing administrative burden on school staff.`,
    icon: '/logos/heytalia-icon.png',
    category: 'Parents and communications',
    gradient: 'from-pink-500 to-rose-600',
    developer: {
      name: 'MOE Innovation Labs',
      website: 'https://www.moe.gov.sg',
      support: 'https://www.moe.gov.sg/contact',
    },
    metadata: {
      rating: 4.4,
      ratingCount: 234,
      ageRating: '4+',
      chartPosition: 18,
      chartCategory: 'Education',
      languages: ['EN', 'ZH', 'MS', 'TA'],
      size: '38 MB',
    },
    features: [
      'AI-powered query response',
      'Multi-language support',
      'Integration with school systems',
      'Personalized information delivery',
      'Automated routing to staff',
      '24/7 availability',
    ],
    platforms: ['Web', 'iOS', 'Android'],
    inAppPurchases: false,
  },

  // School life & Admin
  {
    key: 'allocate',
    name: 'Allocate',
    tagline: 'Ensuring fair school placement',
    description: 'School placement and allocation system',
    fullDescription: `Allocate is MOE's comprehensive school placement system that manages student allocation to schools through a fair, transparent, and efficient process. The system handles Primary 1 Registration through the P1 Registration Portal, as well as specialized placement systems like SPERS (School Placement Exercise for Returning Singaporeans) and ASP (Assured School Placement).

The P1 Registration Portal provides a fully online registration process conducted over five phases (Phase 1, 2A, 2B, 2C, and 2C Supplementary) from July to August each year. The system uses Singpass authentication and allows parents to view eligible schools, submit registrations, and check results entirely online.

For secondary school placement, the system uses a computerized allocation based on PSLE results and student preferences, with each school having specific cut-off points. The system is designed to give priority to choices indicated by students and parents while fairly distributing students among available schools, handling over 40,000 Primary 1 registrations annually.`,
    icon: '/logos/allocate.png',
    category: 'School life & Admin',
    gradient: 'from-orange-500 to-red-600',
    developer: {
      name: 'Ministry of Education (MOE) Singapore',
      website: 'https://p1.placement.moe.gov.sg',
      support: 'https://www.moe.gov.sg/contact',
    },
    metadata: {
      rating: 4.5,
      ratingCount: 892,
      ageRating: '4+',
      chartPosition: 7,
      chartCategory: 'Education',
      languages: ['EN', 'ZH', 'MS', 'TA'],
      size: '35 MB',
    },
    features: [
      'Online P1 registration through Singpass',
      'View eligible schools and phases',
      'Submit school preferences and track status',
      'Automatic allocation based on eligibility',
      'Specialized pathways for returning Singaporeans',
      'Centralized secondary school placement',
    ],
    platforms: ['Web'],
    inAppPurchases: false,
  },
  {
    key: 'tagui-rpa',
    name: 'RPA (Robotic Process Automation)',
    tagline: 'Automating repetitive tasks',
    description: 'Free automation tool for teachers and officers',
    fullDescription: `TagUI is an open-source robotic process automation (RPA) tool developed by AI Singapore and adopted by Singapore's Ministry of Education to reduce manual effort on repetitive administrative tasks. The project received a Bronze Innergy Award in 2021 for successfully automating workflows within the Student Learning Space (SLS) ecosystem.

MOE is actively working to whitelist TagUI and Python for use across government systems, recognizing the tremendous potential to automate rule-based tasks for MOE teachers and officers. The solution has been open-sourced on GitHub, making it easier for MOE to integrate into other rules-based workflows.

Real-world applications include automating the addition of test questions from CSV files to populate question banks for Primary Mathematics adaptive learning systems, automating the registration of 170 teachers from Excel sheets for professional development workshops, and automating the sharing of SLS lessons (eliminating up to 4,000 manual clicks for a typical batch operation). According to the LinkedIn 2020 Emerging Jobs report, Robotics Process Automation is among the top 15 emerging career prospects in Singapore.`,
    icon: '/logos/rpa-logo.png',
    category: 'School life & Admin',
    gradient: 'from-purple-500 to-pink-600',
    developer: {
      name: 'AI Singapore (adopted by MOE Singapore)',
      website: 'https://github.com/aisingapore/TagUI',
      support: 'https://github.com/aisingapore/TagUI/issues',
    },
    metadata: {
      rating: 4.6,
      ratingCount: 234,
      ageRating: '4+',
      chartPosition: 16,
      chartCategory: 'Productivity',
      languages: ['EN'],
      size: '125 MB',
    },
    features: [
      'Automate web browsing and desktop tasks',
      'Integration with Student Learning Space (SLS)',
      'Process bulk data from Excel/CSV files',
      'Automate email notifications and reminders',
      'Support for complex workflow automation',
      'Open-source and free to use',
    ],
    platforms: ['Windows', 'Mac', 'Linux'],
    inAppPurchases: false,
  },
  {
    key: 'sls',
    name: 'Student learning space',
    tagline: 'Transforming learning through technology',
    description: 'Core digital platform for teaching and learning',
    fullDescription: `The Singapore Student Learning Space (SLS) is MOE's flagship digital learning platform developed in collaboration with GovTech, designed to transform learning experiences through purposeful use of technology. The platform serves as an online learning portal providing equal access to quality curriculum-aligned resources across major subjects for approximately 500,000 students from primary to pre-university level.

SLS empowers students to engage in personalized learning across different learning modes including self-directed, collaborative, and teacher-facilitated learning, while developing 21st Century Competencies. During the COVID-19 pandemic, the platform successfully supported up to 300,000 concurrent users, ensuring continuous education during challenging times.

The platform integrates with over 250 whitelisted external sites and tools, significantly expanding the learning resources available to students. Recent AI-powered enhancements include an Adaptive Learning System (ALS) for mathematics and geography, Short Answer Feedback Assistant (ShortAnsFA), Language Feedback Assistant for English, and Authoring Copilot (ACP) to assist teachers in lesson planning. Teachers benefit from comprehensive tools to customize content, create collaborative lessons, evaluate students' thinking processes, and apply targeted interventions catering to different learning paces and needs.`,
    icon: GraduationCap,
    category: 'School life & Admin',
    gradient: 'from-blue-500 to-purple-600',
    developer: {
      name: 'MOE Singapore in collaboration with GovTech',
      website: 'https://vle.learning.moe.edu.sg',
      support: 'https://www.learning.moe.edu.sg/sls/user-guide/vle',
    },
    metadata: {
      rating: 4.7,
      ratingCount: 5678,
      ageRating: '4+',
      chartPosition: 1,
      chartCategory: 'Education',
      languages: ['EN', 'ZH', 'MS', 'TA'],
      size: '68 MB',
    },
    features: [
      'Curriculum-aligned resources for all subjects',
      'Personalized and self-paced learning paths',
      'AI-powered learning feedback assistants',
      'Teacher tools for content customization',
      'Integration with 250+ educational sites',
      'Real-time progress tracking and analytics',
      'Support for independent, collaborative, and teacher-led learning',
    ],
    platforms: ['Web', 'iPad', 'Android tablet'],
    inAppPurchases: false,
  },
  {
    key: 'oneplacement',
    name: 'OnePlacement (OP)',
    tagline: 'Seamless online school registration',
    description: 'Official portal for Primary 1 school registration',
    fullDescription: `OnePlacement refers to MOE's P1 Registration Portal, the official online system for Primary 1 school registration accessible at p1.placement.moe.gov.sg. Launched to replace previous paper-based and older digital systems, the portal provides a fully online registration experience for parents of Singapore Citizens and Permanent Residents.

The system requires Singpass with 2-Factor Authentication for secure access, ensuring only authorized parents can register their children. The registration exercise is conducted annually from July to August over five distinct phases (Phase 1, 2A, 2B, 2C, and 2C Supplementary), with each phase catering to different priority groups based on factors like sibling relationships, parent involvement with schools, and proximity to residence.

The portal allows parents to view their child's eligible phases and schools, submit registrations online without physically queuing at schools, and check registration results digitally. For the 2025 exercise starting July 1st, the portal handles tens of thousands of registrations nationwide. The system is designed to be user-friendly, accessible, and transparent, providing parents with clear information about eligibility, vacancies, and registration outcomes.`,
    icon: MapPin,
    category: 'School life & Admin',
    gradient: 'from-green-500 to-teal-600',
    developer: {
      name: 'Ministry of Education (MOE) Singapore',
      website: 'https://p1.placement.moe.gov.sg',
      support: 'https://www.moe.gov.sg/contact',
    },
    metadata: {
      rating: 4.6,
      ratingCount: 1234,
      ageRating: '4+',
      chartPosition: 5,
      chartCategory: 'Education',
      languages: ['EN', 'ZH', 'MS', 'TA'],
      size: '28 MB',
    },
    features: [
      'Fully online P1 registration via Singpass',
      'View eligible phases and schools',
      'Submit applications without visiting schools',
      'Real-time vacancy information',
      'Digital notification of outcomes',
      'Multi-child support for families',
      'Transparent phase-based allocation',
    ],
    platforms: ['Web'],
    inAppPurchases: false,
  },
  {
    key: 'goventry',
    name: 'GovEntry',
    tagline: 'Self-serve access validation made simple',
    description: 'Event registration and attendance tracking system',
    fullDescription: `GovEntry is a government-wide self-serve access validation system developed by GovTech as part of the GovWallet product suite, designed for registration and attendance tracking at events, activities, and facilities. The platform offers real-time attendance statistics accessible via mobile devices or downloadable from the admin portal.

GovEntry gained significant recognition when it powered the General Election 2025's e-Registration system, ensuring a seamless and swift experience for over 2.4 million voters. Over 30 government agencies, including MOE, have leveraged GovEntry to run more than 100 events smoothly and cost-effectively.

In the MOE context, the system can be used for school events, parent-teacher meetings, open houses, and other school-related activities requiring visitor management and attendance tracking. The platform enables event organizers to create custom sign-up forms, automate check-ins, and generate real-time attendance reports. The system has proven scalability, supporting events from small gatherings to large-scale operations serving millions of users.`,
    icon: '/logos/goventry-logo.png',
    category: 'School life & Admin',
    gradient: 'from-cyan-500 to-blue-600',
    developer: {
      name: 'Government Technology Agency (GovTech)',
      website: 'https://app.entry.gov.sg',
      support: 'https://www.tech.gov.sg/contact-us',
    },
    metadata: {
      rating: 4.7,
      ratingCount: 678,
      ageRating: '4+',
      chartPosition: 9,
      chartCategory: 'Productivity',
      languages: ['EN', 'ZH', 'MS', 'TA'],
      size: '32 MB',
    },
    features: [
      'Custom event registration forms',
      'Automated attendance tracking via QR codes',
      'Real-time attendance statistics',
      'Mobile-friendly interface',
      'Downloadable attendance data',
      'Scalable for events of any size',
      'Integration with government systems',
    ],
    platforms: ['Web'],
    inAppPurchases: false,
  },
  {
    key: 'ifaas',
    name: 'iFAAS',
    tagline: 'Streamlined financial operations',
    description: 'Integrated Finance and Accounting System',
    fullDescription: `iFAAS (Integrated Finance and Accounting System) is Singapore MOE's internal financial management platform used for processing invoices, payments, and financial transactions across schools and educational institutions. The system serves as the primary platform for schools to manage financial operations including vendor payments, inter-school transactions, and government financial reporting.

When schools, vendors, or parents make payments via iFAAS, the system generates e-invoices automatically after registration deadlines or upon service delivery. The system requires proper vendor identification with MOE Vendor IDs for processing transactions.

iFAAS is integrated with MOE's broader administrative systems, enabling streamlined financial workflows between schools, MOE headquarters, and external vendors. Schools use iFAAS for processing purchase orders, tracking budgets, managing expenditures, and generating financial reports required for auditing and compliance purposes. The system represents a significant component of MOE's digital transformation efforts in financial administration.`,
    icon: DollarSign,
    category: 'School life & Admin',
    gradient: 'from-emerald-500 to-green-600',
    developer: {
      name: 'Ministry of Education (MOE) Singapore',
      website: 'https://ifaas2.moe.gov.sg',
      support: 'https://www.moe.gov.sg/contact',
    },
    metadata: {
      rating: 4.4,
      ratingCount: 345,
      ageRating: '4+',
      chartPosition: 22,
      chartCategory: 'Finance',
      languages: ['EN'],
      size: '42 MB',
    },
    features: [
      'Automated e-invoicing for transactions',
      'Vendor management with MOE Vendor IDs',
      'Budget tracking and expenditure management',
      'Integration with school administrative systems',
      'Secure financial transaction processing',
      'Financial reporting and audit trail',
      'Payment processing with defined workflows',
    ],
    platforms: ['Web'],
    inAppPurchases: false,
  },
  {
    key: 'ibens',
    name: 'iBENs',
    tagline: 'Managing staff benefits efficiently',
    description: 'Integrated Benefits and Entitlements System',
    fullDescription: `iBENs (Integrated Benefits and Entitlements System) is MOE's internal human resource management platform designed to streamline the administration of staff benefits, entitlements, and compensation packages. The system provides a centralized view of employee benefits including leave management, medical benefits, professional development allowances, and other employment entitlements.

HR administrators and school leaders use iBENs to process benefit claims, track entitlement usage, and ensure compliance with MOE employment policies. The platform automates calculations for various benefits and integrates with payroll systems to ensure accurate and timely processing.

For MOE staff, iBENs provides self-service capabilities to view benefit balances, submit claims, and track approval status. The system maintains comprehensive records of all benefit transactions, supporting audit requirements and policy reviews. By digitizing benefits administration, iBENs reduces administrative burden and improves transparency in the management of staff entitlements.`,
    icon: Gift,
    category: 'School life & Admin',
    gradient: 'from-rose-500 to-pink-600',
    developer: {
      name: 'Ministry of Education (MOE) Singapore',
      website: 'https://www.moe.gov.sg',
      support: 'https://www.moe.gov.sg/contact',
    },
    metadata: {
      rating: 4.3,
      ratingCount: 234,
      ageRating: '4+',
      chartPosition: 28,
      chartCategory: 'Business',
      languages: ['EN'],
      size: '38 MB',
    },
    features: [
      'Centralized benefits management',
      'Leave and medical benefits tracking',
      'Professional development allowance management',
      'Self-service claim submission',
      'Integration with payroll systems',
      'Automated benefit calculations',
      'Comprehensive audit trails',
    ],
    platforms: ['Web'],
    inAppPurchases: false,
  },
  {
    key: 'oneschoolbus',
    name: 'OneSchoolBus (OSB)',
    tagline: 'All school bus operations on one platform',
    description: 'Comprehensive school bus management system',
    fullDescription: `OneSchoolBus (OSB) is MOE Singapore's integrated school bus operations management system consisting of a web portal for bus operators, schools, and MOE headquarters, plus a mobile app for bus drivers to record student attendance. The platform consolidates all aspects of school bus operations onto a single digital system, replacing previous paper-based and fragmented processes.

Bus operators use OSB to input and manage data relating to routes, vehicles, staff, and students, while schools can view operations data, access attendance reports, and manage their registered operators. The system facilitates the annual MOE HQ School Bus Exercise, typically conducted by the end of February each year.

Drivers and attendants access OSB via a mobile app, using their mobile numbers as login credentials. The driver app allows real-time student attendance marking, route viewing, and schedule management. The system manages school bus operations across all MOE schools in Singapore, serving tens of thousands of students daily with features including centralized route management, real-time attendance tracking, comprehensive reporting, and multi-stakeholder access with role-based permissions.`,
    icon: Bus,
    category: 'School life & Admin',
    gradient: 'from-yellow-500 to-orange-600',
    developer: {
      name: 'Ministry of Education (MOE) Singapore',
      website: 'https://guides.schoolbus.moe.edu.sg',
      support: 'mailto:MOE_IFSD_SCD_School_Canteen_Bus@moe.gov.sg',
    },
    metadata: {
      rating: 4.6,
      ratingCount: 567,
      ageRating: '4+',
      chartPosition: 11,
      chartCategory: 'Education',
      languages: ['EN'],
      size: '48 MB',
    },
    features: [
      'Centralized bus route creation and management',
      'Real-time student attendance tracking via mobile',
      'Comprehensive attendance reporting',
      'Student and staff management across routes',
      'Support for annual MOE School Bus Exercise',
      'Company profile and vehicle fleet management',
      'Multi-stakeholder access with role-based permissions',
    ],
    platforms: ['Web', 'Mobile web app'],
    inAppPurchases: false,
  },
  {
    key: 'timetable',
    name: 'Timetable',
    tagline: 'Intelligent school scheduling made effortless',
    description: 'Comprehensive timetabling and scheduling software',
    fullDescription: `Multiple MOE schools in Singapore utilize aSc Timetables, a specialized school scheduling software often accessed through the EduPage cloud-based school management platform. The software features intelligent automated scheduling capabilities that evaluate millions of possible combinations to create balanced timetables based on user-entered requirements such as teacher availability, room allocations, subject constraints, and student groupings.

The system can automatically reschedule and accommodate changes instantly, making it highly adaptable to the dynamic needs of school operations. Beyond basic timetabling, the EduPage platform offers integrated features including substitution management for absent teachers, electronic class registers, attendance tracking, and mobile apps for students and parents to view schedules.

The cloud-based nature means no installation is required, and the system is accessible anytime, anywhere with secure data storage. Multiple users can work on the timetable simultaneously, facilitating collaborative planning among school administrators and timetable coordinators. Schools typically publish multiple timetable versions (e.g., "Timetable A" and "Timetable B") for each class, along with examination schedules, CCA schedules, and post-exam timetables through these platforms.`,
    icon: CalendarDays,
    category: 'School life & Admin',
    gradient: 'from-purple-500 to-indigo-600',
    thirdParty: true,
    developer: {
      name: 'aSc Applied Software Consultants',
      website: 'https://www.asctimetables.com',
      support: 'https://www.asctimetables.com/support.html',
    },
    metadata: {
      rating: 4.7,
      ratingCount: 789,
      ageRating: '4+',
      chartPosition: 6,
      chartCategory: 'Education',
      languages: ['EN', 'ZH', 'MS', 'TA'],
      size: '52 MB',
    },
    features: [
      'Automated timetable generation',
      'Instant rescheduling and change accommodation',
      'Cloud-based access without installation',
      'Multi-user collaborative editing',
      'Electronic class registers and attendance',
      'Substitution management for absences',
      'Mobile apps for students and parents',
      'Integration with school management features',
    ],
    platforms: ['Web', 'iOS', 'Android'],
    inAppPurchases: false,
  },

  // Growth and community
  {
    key: 'opal',
    name: 'Glow',
    tagline: 'On-the-go professional learning',
    description: 'Professional development digital platform for teachers',
    fullDescription: `OPAL 2.0 (branded as Glow for this context) is MOE's professional development digital platform offering teachers on-the-go, self-directed, self-paced professional learning opportunities. The platform includes social collaboration features where teachers can login with their MOE iCON email address and access various learning communities.

The platform hosts multiple subject-specific and professional communities, including The Primary Mathematics Subject Chapter and The Lower Primary Learners Chapter, which are learning communities where teachers engage in collaborative inquiry. OPAL 2.0 serves as a repository of good teaching practices and materials, allowing teachers to build new capabilities through sharing and collaboration across schools via MOE's learning communities.

Each school cluster receives consultancy support to strengthen the culture of collaboration and share technology-enabled lesson resources, ideas, and teaching strategies. The platform empowers educators to take charge of their professional growth while building a strong community of practice across Singapore's education system.`,
    icon: '/logos/glow-symbol.png',
    category: 'Growth and community',
    gradient: 'from-amber-500 to-yellow-600',
    developer: {
      name: 'Ministry of Education (MOE) Singapore',
      website: 'https://www.opal2.moe.edu.sg',
      support: 'https://www.moe.gov.sg/contact',
    },
    metadata: {
      rating: 4.5,
      ratingCount: 456,
      ageRating: '4+',
      chartPosition: 15,
      chartCategory: 'Education',
      languages: ['EN', 'ZH', 'MS', 'TA'],
      size: '38 MB',
    },
    features: [
      'Self-directed, self-paced professional development',
      'Social collaboration features for teachers',
      'Subject-specific learning communities',
      'Repository of teaching practices and materials',
      'Cross-school collaboration and resource sharing',
      'Cluster consultancy support',
    ],
    platforms: ['Web'],
    inAppPurchases: false,
  },
  {
    key: 'nlds',
    name: 'nLDS',
    tagline: 'Advancing educational innovation',
    description: 'National Learning Design System for educators',
    fullDescription: `nLDS (National Learning Design System) is a collaborative platform designed to support educators in sharing innovative learning designs and pedagogical approaches across Singapore's education system. The platform facilitates the exchange of evidence-based teaching strategies, lesson designs, and instructional frameworks that have proven effective in classroom settings.

Through nLDS, educators can access a curated collection of learning designs aligned with MOE's curriculum and pedagogical principles. Teachers can contribute their own innovations, learn from peers' experiences, and adapt successful approaches to their unique teaching contexts.

The platform supports continuous improvement in teaching quality by providing a structured way to document, share, and refine learning designs. With features for feedback, ratings, and discussion, nLDS builds a vibrant community where educators collaborate to advance student learning outcomes through thoughtful instructional design.`,
    icon: '/logos/nlds-logo.png',
    category: 'Growth and community',
    gradient: 'from-blue-500 to-cyan-600',
    developer: {
      name: 'Ministry of Education (MOE) Singapore',
      website: 'https://www.moe.gov.sg',
      support: 'https://www.moe.gov.sg/contact',
    },
    metadata: {
      rating: 4.4,
      ratingCount: 234,
      ageRating: '4+',
      chartPosition: 19,
      chartCategory: 'Education',
      languages: ['EN', 'ZH', 'MS', 'TA'],
      size: '35 MB',
    },
    features: [
      'Curated collection of learning designs',
      'Evidence-based teaching strategies',
      'Peer collaboration and sharing',
      'Curriculum-aligned frameworks',
      'Community feedback and ratings',
      'Continuous professional improvement',
    ],
    platforms: ['Web'],
    inAppPurchases: false,
  },
  {
    key: 'community',
    name: 'Community',
    tagline: 'Building connections across schools',
    description: 'Community engagement platform for educators',
    fullDescription: `Community is a social networking platform designed specifically for educators to connect, collaborate, and build professional relationships across Singapore's education system. The platform enables teachers to join interest-based groups, share resources, seek advice, and celebrate successes with colleagues from different schools and clusters.

Through Community, educators can participate in discussions on topics ranging from subject-specific pedagogy to classroom management, student wellbeing, and educational technology. The platform hosts both open forums and curated communities led by MOE specialists and experienced educators.

Community fosters a sense of belonging and professional camaraderie among Singapore's teaching workforce. By breaking down school boundaries and facilitating knowledge exchange, the platform helps educators feel supported, inspired, and connected to a larger community of professionals dedicated to nurturing young Singaporeans.`,
    icon: Heart,
    category: 'Growth and community',
    gradient: 'from-pink-500 to-rose-600',
    developer: {
      name: 'Ministry of Education (MOE) Singapore',
      website: 'https://www.moe.gov.sg',
      support: 'https://www.moe.gov.sg/contact',
    },
    metadata: {
      rating: 4.6,
      ratingCount: 567,
      ageRating: '4+',
      chartPosition: 13,
      chartCategory: 'Social Networking',
      languages: ['EN', 'ZH', 'MS', 'TA'],
      size: '45 MB',
    },
    features: [
      'Interest-based professional groups',
      'Resource sharing and collaboration',
      'Discussion forums and Q&A',
      'Curated communities led by specialists',
      'Cross-school networking',
      'Celebration of teaching successes',
    ],
    platforms: ['Web', 'iOS', 'Android'],
    inAppPurchases: false,
  },

  // Digital innovation and enhancements
  {
    key: 'mims',
    name: 'MIMS',
    tagline: 'One ID, multiple applications',
    description: 'MOE Identity Management System',
    fullDescription: `MIMS (MOE Identity Management System) is a centralized authentication and identity management system that replaced IAMS 2.0 for managing the user accounts of all staff and students in Singapore's Ministry of Education. Adopted by the Singapore Student Learning Space (SLS) in December 2022, MIMS provides seamless access to multiple MOE applications with a single ID and password.

For students, the MIMS username is the same as their iCON email address, making it easy to remember and use. The system includes a self-service password reset feature where users can set up security challenge questions to reset their passwords independently. Staff accounts must be logged into every 90 days to remain active.

MIMS serves as the digital identity gateway for accessing all MOE Centrally Provisioned Digital Tools including Student iCON Email, SLS (Student Learning Space), Microsoft Pro Plus, and AllEars, ensuring a unified and secure authentication experience across the entire MOE digital ecosystem.`,
    icon: '/logos/mimsv2-keystone-logo.png',
    category: 'Digital innovation and enhancements',
    gradient: 'from-slate-500 to-gray-600',
    developer: {
      name: 'Ministry of Education (MOE) Singapore',
      website: 'https://mims.moe.gov.sg',
      support: 'https://www.moe.gov.sg/contact',
    },
    metadata: {
      rating: 4.5,
      ratingCount: 1234,
      ageRating: '4+',
      chartPosition: 4,
      chartCategory: 'Productivity',
      languages: ['EN'],
      size: '22 MB',
    },
    features: [
      'Single sign-on (SSO) to all MOE digital tools',
      'Self-service password reset',
      'Unified authentication for iCON, SLS, Microsoft Pro Plus',
      'Account management and maintenance',
      'Secure authentication system',
      'Integration across MOE digital ecosystem',
    ],
    platforms: ['Web'],
    inAppPurchases: false,
  },
  {
    key: 'student-icon',
    name: 'iCON',
    tagline: 'Your lifelong learning account',
    description: 'Google Workspace for Singapore students',
    fullDescription: `Student iCON is a comprehensive suite of Google applications including email and other services such as Google Classroom, Google Docs, Google Meet, and more, provided by Singapore's Ministry of Education to all students in the national school system. Each student receives a personalized email address in the format <Full Name>@students.edu.sg (with spaces replaced by underscores), which serves as their digital identity throughout their learning journey from primary school to junior colleges.

The platform is web-based and can be accessed through any internet-enabled computing or mobile device by visiting workspace.google.com/dashboard. Student iCON includes a wide range of Google applications: Google Contacts, Google Calendar, Google Keep, Google Meet, Google Sites, Google Forms, Google Docs, YouTube, and many other Google Apps and Services.

Students also gain access to Zoom and Microsoft Pro Plus (Word, Excel, PowerPoint, OneNote, Publisher) through their iCON account. The platform facilitates communication, collaboration, and project work among students and between students and teachers, supporting modern pedagogical approaches and preparing students for digital collaboration in their future careers.`,
    icon: AtSign,
    category: 'Digital innovation and enhancements',
    gradient: 'from-blue-500 to-indigo-600',
    developer: {
      name: 'Google (implemented by MOE Singapore)',
      website: 'https://workspace.google.com/dashboard',
      support: 'https://www.learning.moe.edu.sg/student-user-guide/customise/student-icon-email',
    },
    metadata: {
      rating: 4.6,
      ratingCount: 3456,
      ageRating: '4+',
      chartPosition: 2,
      chartCategory: 'Productivity',
      languages: ['EN', 'ZH', 'MS', 'TA'],
      size: '125 MB',
    },
    features: [
      'Google Workspace suite (Docs, Sheets, Slides, Forms)',
      'Student email account (@students.edu.sg)',
      'Google Classroom for coursework',
      'Google Meet for video conferencing',
      'Access to Zoom and Microsoft Pro Plus',
      'Cloud storage via Google Drive',
      'Collaborative tools for group projects',
    ],
    platforms: ['Web', 'iOS', 'Android'],
    inAppPurchases: false,
  },
  {
    key: 'ssoe',
    name: 'SSOE: Secure Browser and Cloud PC',
    tagline: 'Next-generation ICT infrastructure',
    description: 'Schools Standard ICT Operating Environment',
    fullDescription: `The Schools Standard ICT Operating Environment (SSOE) was started in 2009 by Singapore's Ministry of Education to consolidate the provisioning and management of desktops, network infrastructure, and ICT support for all MOE schools. MOE progressively transitioned all 360 schools to the new and improved SSOE 2.0 from August 2017 to December 2018, bringing MOE's ICT infrastructure to the next level to better support teaching and learning needs.

The SSOE 2.0 rollout linked more than 100,000 devices across 344 schools and can provide connectivity for up to 500,000 devices—from desktops and laptops to mobile devices—in an environment of better and faster overall network performance. Multi-tiered firewalls and a network monitoring and management system for cyber threats have been built into SSOE 2.0 to enhance ICT security.

A major innovation introduced with SSOE 2.0 was the automation of delivery of systems to schools, reducing the turnaround time for school infrastructure deployment (servers and virtual machines) from 4 days to just 1 day. The system includes secure features for e-assessments, with ITD Lockdown accounts recommended for subjects with National e-Examinations. In 2022, MOE announced a 3-year extension of the SSOE 2.0 programme, with plans for SSOE 3.0 currently in development.`,
    icon: '/logos/w365-cloud-pc-logo-1.jpg',
    category: 'Digital innovation and enhancements',
    gradient: 'from-red-500 to-orange-600',
    developer: {
      name: 'MOE Singapore, implemented by NCS',
      website: 'https://www.moe.gov.sg',
      support: 'https://www.moe.gov.sg/contact',
    },
    metadata: {
      rating: 4.5,
      ratingCount: 678,
      ageRating: '4+',
      chartPosition: 10,
      chartCategory: 'Utilities',
      languages: ['EN'],
      size: '156 MB',
    },
    features: [
      'Centralized desktop and device management',
      'Multi-tiered firewalls and cyber threat monitoring',
      'Network infrastructure for up to 500,000 devices',
      'Secure browser and lockdown for e-assessments',
      'Automated deployment (4 days to 1 day)',
      'Standardized ICT environment across all MOE schools',
    ],
    platforms: ['Windows', 'School desktops', 'Laptops', 'Tablets'],
    inAppPurchases: false,
  },
  {
    key: 'formsg',
    name: 'FormSG',
    tagline: 'Government forms made simple',
    description: 'Government digital form service for teachers',
    fullDescription: `FormSG is Singapore's trusted government digital form service, now optimized for educators. Create secure forms for consent collection, event registration, surveys, and administrative requests with built-in data protection and compliance features.

No coding required—build forms with drag-and-drop simplicity while maintaining government-grade security. All data is encrypted and stored securely, meeting strict public sector requirements. Form responses can be integrated with school systems or exported for further analysis.

Whether collecting trip consent forms, gathering feedback, or managing school event registrations, FormSG provides a professional, secure solution that parents and staff trust.`,
    icon: Send,
    category: 'Digital innovation and enhancements',
    gradient: 'from-red-400 to-red-600',
    developer: {
      name: 'GovTech Singapore',
      website: 'https://form.gov.sg',
      support: 'https://go.gov.sg/formsg-help',
    },
    metadata: {
      rating: 4.7,
      ratingCount: 1243,
      ageRating: '4+',
      chartPosition: 3,
      chartCategory: 'Productivity',
      languages: ['EN', 'ZH', 'MS', 'TA'],
      size: '18 MB',
    },
    features: [
      'Drag-and-drop form builder',
      'Government-grade security',
      'Data encryption',
      'Response management',
      'System integration',
    ],
    platforms: ['Web', 'iPad', 'iPhone'],
    inAppPurchases: false,
  },
  {
    key: 'langbuddy',
    name: 'LangBuddy',
    tagline: 'Master languages with AI',
    description: 'Language learning companion for students',
    fullDescription: `LangBuddy is an AI-powered language learning companion that helps students master English, Mother Tongue Languages, and foreign languages through personalized practice and instant feedback. Students practice speaking, writing, and comprehension at their own pace with intelligent tutoring.

The platform adapts to each student's proficiency level, providing appropriate challenges and scaffolded support. Voice recognition technology gives pronunciation feedback, while natural language processing helps with grammar and composition. Teachers can assign specific practice modules and monitor student progress.

Aligned with MOE language syllabuses, LangBuddy supplements classroom instruction with engaging practice that builds confidence and fluency outside regular lesson time.`,
    icon: '/logos/langbuddy-square-with-text-blue.png',
    category: 'Digital innovation and enhancements',
    gradient: 'from-violet-400 to-violet-600',
    developer: {
      name: 'EdTech Innovations',
      website: 'https://langbuddy.com.sg',
      support: 'https://support.langbuddy.com.sg',
    },
    metadata: {
      rating: 4.6,
      ratingCount: 378,
      ageRating: '4+',
      chartPosition: 11,
      chartCategory: 'Education',
      languages: ['EN', 'ZH', 'MS', 'TA', 'JA', 'FR', 'ES'],
      size: '95 MB',
    },
    features: [
      'AI-powered conversation practice',
      'Pronunciation feedback',
      'Grammar assistance',
      'Personalized learning paths',
      'Progress tracking for teachers',
    ],
    platforms: ['Web', 'iPad', 'iPhone', 'Android'],
    inAppPurchases: true,
  },
  {
    key: 'ms-teams',
    name: 'MS Teams',
    tagline: 'Your digital classroom hub',
    description: 'Collaboration platform designed for education',
    fullDescription: `Microsoft Teams for Education is a comprehensive digital collaboration platform used by school districts worldwide to create virtual classrooms where students and teachers can have face-to-face communications and activities. The platform offers specific team types designed for educational scenarios, with the Class team type providing classroom tools such as Assignments, a OneNote classroom notebook, a class materials folder for read-only content, and the ability to mute students during lessons.

Teachers can provide assignments to students and track and grade them within Teams, while the new Classwork app offers educators a one-stop shop to access and manage their entire curriculum. The platform features School Data Sync (SDS) which allows IT departments to set up Teams school-wide using existing student information system data, automatically creating class rosters and maintaining them.

Teams integrates seamlessly with OneNote Class Notebook for collaborative note-taking and includes advanced features like native Python Jupyter Notebooks integration for coding education, Search Coach for developing information literacy skills, and the Reflect app for supporting student well-being. The platform also includes comprehensive accessibility features such as Sign Language View, live closed captions, and Immersive Reader, making education more inclusive for all learners.`,
    icon: Video,
    category: 'Digital innovation and enhancements',
    gradient: 'from-purple-500 to-indigo-600',
    thirdParty: true,
    developer: {
      name: 'Microsoft Corporation',
      website: 'https://www.microsoft.com/en-us/education/products/teams',
      support: 'https://support.microsoft.com/en-us/teams',
    },
    metadata: {
      rating: 4.5,
      ratingCount: 8934,
      ageRating: '4+',
      chartPosition: 1,
      chartCategory: 'Productivity',
      languages: ['EN', 'ZH', 'MS', 'TA', 'JA', 'FR', 'ES', 'DE'],
      size: '285 MB',
    },
    features: [
      'Virtual classrooms with video conferencing',
      'Assignments hub for distributing and grading work',
      'OneNote Class Notebook integration',
      'Breakout rooms for small group discussions',
      'School Data Sync for automated roster management',
      'Third-party app integration (Kahoot!, Flipgrid, Quizlet)',
      'Reflect app for student well-being',
      'Accessibility features (Sign Language View, live captions)',
    ],
    platforms: ['Web', 'Windows', 'macOS', 'iOS', 'Android', 'Linux'],
    inAppPurchases: false,
  },
  {
    key: 'google-chats',
    name: 'Google Chats',
    tagline: 'Smart, secure team messaging',
    description: 'Real-time collaboration tool integrated with Google Workspace',
    fullDescription: `Google Chat is an instant messaging and collaboration tool available as part of Google Workspace for Education that offers a range of features to streamline communication, improve collaboration, and enhance overall school efficiency. The platform allows for instant messaging, enabling staff members to connect and communicate in real-time, regardless of their location, making it particularly valuable for distributed teams and remote collaboration.

Schools can create group chats for specific departments or teams to facilitate discussions and share information quickly, supporting both administrative coordination and educational collaboration. For students (typically grades 9-12, with some schools offering access to grades 3-8 where administrators have requested it), Google Chat can be an excellent tool for group conversations and organization.

The platform integrates seamlessly with Google Classroom, allowing teachers to leverage built-in chat and comment features to leave students feedback as they're working on assignments. Schools need to ensure proper monitoring and security measures are in place to maintain Google Chat as a safe space for students and teachers to collaborate and communicate in real-time every day.`,
    icon: MessageCircle,
    category: 'Digital innovation and enhancements',
    gradient: 'from-green-500 to-teal-600',
    thirdParty: true,
    developer: {
      name: 'Google LLC',
      website: 'https://workspace.google.com/products/chat',
      support: 'https://support.google.com/chat',
    },
    metadata: {
      rating: 4.4,
      ratingCount: 2345,
      ageRating: '4+',
      chartPosition: 8,
      chartCategory: 'Productivity',
      languages: ['EN', 'ZH', 'MS', 'TA', 'JA', 'FR', 'ES', 'DE'],
      size: '68 MB',
    },
    features: [
      'Real-time instant messaging for individuals and groups',
      'Group chat spaces for departments and teams',
      'Integration with Google Workspace (Docs, Drive, Calendar)',
      'File and resource sharing within conversations',
      'Threaded conversations for organized discussions',
      'Search functionality across chat history',
    ],
    platforms: ['Web', 'iOS', 'Android'],
    inAppPurchases: false,
  },
  {
    key: 'notebooklm',
    name: 'NotebookLM',
    tagline: 'AI research assistant',
    description: 'AI-powered research and note-taking assistant',
    fullDescription: `NotebookLM is Google's AI-powered research and note-taking tool that helps educators and students organize information, synthesize ideas, and generate insights from documents. Upload your teaching materials, research papers, or curriculum documents, and let NotebookLM help you extract key information and make connections.

The AI assistant can answer questions about your documents, create summaries, suggest related concepts, and help you prepare lesson materials. Unlike generic AI tools, NotebookLM grounds all responses in your uploaded sources, ensuring accuracy and relevance to your specific teaching context.

Perfect for curriculum research, professional development, and preparing comprehensive lesson plans. NotebookLM keeps your sources organized and makes information retrieval effortless.`,
    icon: Sparkles,
    category: 'Digital innovation and enhancements',
    gradient: 'from-fuchsia-400 to-fuchsia-600',
    thirdParty: true,
    developer: {
      name: 'Google Labs',
      website: 'https://notebooklm.google.com',
      support: 'https://support.google.com/notebooklm',
    },
    metadata: {
      rating: 4.5,
      ratingCount: 189,
      ageRating: '12+',
      chartPosition: 24,
      chartCategory: 'Productivity',
      languages: ['EN', 'ZH', 'JA', 'ES', 'FR', 'DE', 'IT', 'PT', 'KO'],
      size: '12 MB',
    },
    features: [
      'Document-grounded AI responses',
      'Automatic summarization',
      'Source organization',
      'Question answering',
      'Concept mapping',
    ],
    platforms: ['Web'],
    inAppPurchases: false,
  },
  {
    key: 'gemini',
    name: 'Gemini',
    tagline: 'AI-powered learning companion',
    description: 'Generative AI tool designed for educational use',
    fullDescription: `Gemini for Education is Google's generative AI tool specifically designed for educational institutions, providing AI-powered assistance to help educators save time, create personalized learning experiences, inspire fresh ideas, and support confident learning—all within a private and secure environment with enterprise-grade data protections.

Over 1,000 U.S. higher education institutions have officially integrated Gemini for Education, providing more than 10 million U.S. college students with access to the platform. Educators use Gemini to kickstart lesson planning, brainstorm and research new ideas, quickly draft lesson plans aligned to learning objectives and education standards, and get fresh ideas for ways to make lessons more engaging.

In the coming months, educators will be able to assign Gems (custom AI assistants) and notebooks from NotebookLM grounded in their class materials directly to students in Google Classroom. Gemini's new Guided Learning mode helps students understand concepts with step-by-step support rather than just providing answers, promoting deeper learning and critical thinking. Google has partnered with learning science experts, tested with youth advisory panels, and added extra data protection for all education users, ensuring that data from chats will not be used to improve AI models.`,
    icon: Sparkles,
    category: 'Digital innovation and enhancements',
    gradient: 'from-blue-400 to-purple-600',
    thirdParty: true,
    developer: {
      name: 'Google LLC',
      website: 'https://gemini.google.com/edu',
      support: 'https://support.google.com/gemini',
    },
    metadata: {
      rating: 4.6,
      ratingCount: 4567,
      ageRating: '13+',
      chartPosition: 2,
      chartCategory: 'Education',
      languages: ['EN', 'ZH', 'JA', 'ES', 'FR', 'DE', 'IT', 'PT', 'KO'],
      size: '95 MB',
    },
    features: [
      'AI-powered lesson planning and curriculum development',
      'Personalized learning path recommendations',
      'Guided Learning mode for step-by-step concept understanding',
      'Integration with Google Classroom for assignment creation',
      'NotebookLM for research and note-taking assistance',
      'Custom Gems (AI assistants) for specific educational tasks',
      'Enterprise-grade data protection (data not used for AI training)',
      'Brainstorming and creative ideation support',
    ],
    platforms: ['Web', 'iOS', 'Android'],
    inAppPurchases: false,
  },

  // My school apps
  {
    key: 'rmd-tool',
    name: 'Results Management Day (RMD) Tool',
    tagline: 'Manage and analyze examination results',
    description: 'Consolidates all assessment data in one spreadsheet with visual color-coding and automated recommendations',
    fullDescription: `The Results Management Day (RMD) Tool is designed to help schools efficiently manage and analyze examination results. This tool streamlines the process of collecting, organizing, and presenting student performance data during Results Management Day events.`,
    icon: PieChart,
    category: 'My school apps',
    gradient: 'from-indigo-500 to-blue-600',
    developer: {
      name: 'Ministry of Education (MOE) Singapore',
      website: undefined,
      support: 'https://www.moe.gov.sg/contact',
    },
    metadata: {
      rating: 4.5,
      ratingCount: 234,
      ageRating: '4+',
      chartPosition: 25,
      chartCategory: 'Education',
      languages: ['EN'],
      size: '32 MB',
    },
    features: [
      'Results data management',
      'Performance analytics',
      'Examination result processing',
      'Data visualization and reporting',
    ],
    platforms: ['Web'],
    inAppPurchases: false,
  },
  {
    key: 'student-checkin-analysis',
    name: 'Student Check In Analysis',
    tagline: 'Analyze student check-in patterns and attendance',
    description: 'Student wellbeing data analysis',
    fullDescription: `Student Check In Analysis leverages AI technology to provide insights into student check-in patterns, attendance trends, and engagement metrics. This tool helps educators identify patterns, track student participation, and make data-informed decisions about student support and engagement strategies.`,
    icon: CheckSquare,
    category: 'My school apps',
    gradient: 'from-green-500 to-emerald-600',
    developer: {
      name: 'Open Government Products (OGP)',
      website: 'https://pair.gov.sg/',
      support: 'https://pair.gov.sg/',
    },
    metadata: {
      rating: 4.6,
      ratingCount: 189,
      ageRating: '4+',
      chartPosition: 26,
      chartCategory: 'Education',
      languages: ['EN'],
      size: '28 MB',
    },
    features: [
      'AI-powered check-in analysis',
      'Attendance pattern identification',
      'Trend visualization',
      'Data-driven insights',
    ],
    platforms: ['Web'],
    inAppPurchases: false,
  },
  {
    key: 'student-go-where',
    name: 'Student Go Where',
    tagline: 'Discover pathways and opportunities for students',
    description: 'Student movement tracking',
    fullDescription: `Student Go Where is a comprehensive platform that helps students explore various educational pathways, career opportunities, and post-secondary options. The platform provides detailed information about different institutions, courses, and programs available to students, helping them make informed decisions about their future educational journey.`,
    icon: Globe,
    category: 'My school apps',
    gradient: 'from-cyan-500 to-blue-600',
    developer: {
      name: 'Ministry of Education (MOE) Singapore',
      website: 'https://for.edu.sg/studentsgowhere',
      support: 'https://www.moe.gov.sg/contact',
    },
    metadata: {
      rating: 4.7,
      ratingCount: 456,
      ageRating: '4+',
      chartPosition: 27,
      chartCategory: 'Education',
      languages: ['EN', 'ZH', 'MS', 'TA'],
      size: '35 MB',
    },
    features: [
      'Pathway exploration',
      'Educational opportunity search',
      'Institution and course information',
      'Career guidance resources',
    ],
    platforms: ['Web'],
    inAppPurchases: false,
  },
]

interface ExploreContentProps {
  onAppSelected?: (appName: string | null) => void
  clearSelection?: boolean
}

export function ExploreContent({ onAppSelected, clearSelection }: ExploreContentProps = {}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedApp, setSelectedApp] = useState<App | null>(null)

  // Clear selection when parent requests it
  useEffect(() => {
    if (clearSelection && selectedApp !== null) {
      setSelectedApp(null)
    }
  }, [clearSelection])

  // Notify parent when app selection changes
  useEffect(() => {
    if (onAppSelected) {
      onAppSelected(selectedApp?.name || null)
    }
  }, [selectedApp, onAppSelected])

  const filteredApps = useMemo(() => {
    const query = searchQuery.toLowerCase().trim()
    if (!query) return allApps

    return allApps.filter(
      (app) =>
        app.name.toLowerCase().includes(query) ||
        app.description.toLowerCase().includes(query) ||
        app.category.toLowerCase().includes(query),
    )
  }, [searchQuery])

  const appsByCategory = useMemo(() => {
    const categoryOrder = [
      'Recommended for you',
      'Classes and students',
      'Parents and communications',
      'School life & Admin',
      'Growth and community',
      'Digital innovation and enhancements',
      'My school apps',
    ]
    const grouped = new Map<string, App[]>()

    filteredApps.forEach((app) => {
      const existing = grouped.get(app.category) ?? []
      grouped.set(app.category, [...existing, app])
    })

    return Array.from(grouped.entries()).sort(([a], [b]) => {
      const aIndex = categoryOrder.indexOf(a)
      const bIndex = categoryOrder.indexOf(b)
      if (aIndex === -1 && bIndex === -1) return a.localeCompare(b)
      if (aIndex === -1) return 1
      if (bIndex === -1) return -1
      return aIndex - bIndex
    })
  }, [filteredApps])

  // If an app is selected, show the detail view
  if (selectedApp) {
    return (
      <div className="h-full w-full">
        <AppDetail app={selectedApp} />
      </div>
    )
  }

  // Otherwise, show the app list
  return (
    <ScrollArea className="h-full w-full">
      <div className="min-h-full bg-gradient-to-b from-white to-[#F5E3DF]">
        <div className="mx-auto w-full max-w-5xl space-y-8 px-8 py-10">
        {/* Page Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-stone-900">Discover</h1>
          <p className="text-base text-stone-600">
            Find all MOE digital solutions for educator related jobs
          </p>
        </div>

          {/* Search Bar */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-stone-400" />
              <Input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search apps by name or description..."
                className="h-12 sm:h-14 rounded-xl border-stone-200 bg-white pl-12 pr-6 text-sm shadow-sm transition-shadow placeholder:text-stone-400 focus-visible:shadow-md"
              />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-stone-500">
                {filteredApps.length === allApps.length
                  ? `${allApps.length} apps available`
                  : `${filteredApps.length} of ${allApps.length} apps`}
              </p>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Clear search
                </button>
              )}
            </div>
          </div>

          {/* Apps Grid by Category */}
          {filteredApps.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Search className="size-12 text-stone-300" />
              <h3 className="mt-4 text-base font-semibold text-stone-900">No apps found</h3>
              <p className="mt-2 text-sm text-stone-500">
                Try adjusting your search to find what you&apos;re looking for
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {appsByCategory.map(([category, apps]) => (
                <div key={category} className="space-y-4">
                  <div className="space-y-1.5">
                    <h2 className="text-base font-semibold text-stone-900">
                      {category}
                    </h2>
                    {categoryDescriptions[category] && (
                      <p className="text-sm text-stone-600">
                        {categoryDescriptions[category]}
                      </p>
                    )}
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {apps.map((app) => {
                      const isLogoPath = typeof app.icon === 'string'
                      return (
                        <Card
                          key={app.key}
                          role="button"
                          tabIndex={0}
                          className="group cursor-pointer overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setSelectedApp(app)
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              e.stopPropagation()
                              setSelectedApp(app)
                            }
                          }}
                        >
                          <CardHeader className="p-5">
                            <div className="flex items-start gap-4">
                              {/* Logo Area */}
                              {isLogoPath ? (
                                <div className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-white border border-stone-200 shadow-sm transition-all group-hover:scale-105 group-hover:shadow-md overflow-hidden pointer-events-none">
                                  <Image
                                    src={app.icon as string}
                                    alt={`${app.name} logo`}
                                    width={64}
                                    height={64}
                                    className="size-full object-contain p-1.5"
                                  />
                                </div>
                              ) : (
                                <div className={`flex size-16 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${app.gradient || 'from-stone-400 to-stone-600'} shadow-sm transition-all group-hover:scale-105 group-hover:shadow-md pointer-events-none`}>
                                  {(() => {
                                    const Icon = app.icon as LucideIcon
                                    return <Icon className="size-8 text-white pointer-events-none" />
                                  })()}
                                </div>
                              )}

                              {/* App Info */}
                              <div className="flex-1 space-y-1.5 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <CardTitle className="text-base font-semibold text-stone-900 leading-tight">
                                    {app.name}
                                  </CardTitle>
                                  {app.thirdParty && (
                                    <Badge variant="secondary" className="text-[10px] font-medium shrink-0">
                                      3rd party
                                    </Badge>
                                  )}
                                </div>
                                <CardDescription className="text-sm text-stone-600 leading-snug line-clamp-2">
                                  {app.tagline}
                                </CardDescription>
                              </div>
                            </div>
                          </CardHeader>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ScrollArea>
  )
}
