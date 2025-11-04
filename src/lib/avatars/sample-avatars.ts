/**
 * Utility functions for working with sample student avatars
 * These avatars are pre-generated and stored in public/avatars/students
 */

export interface SampleAvatar {
  id: string
  name: string
  gender: 'male' | 'female'
  ethnicity: string
  age: number
  imagePath: string
}

/**
 * List of available sample student avatars
 */
export const SAMPLE_AVATARS: SampleAvatar[] = [
  {
    id: 'sample-1',
    name: 'Wei Ming',
    gender: 'male',
    ethnicity: 'Chinese',
    age: 11,
    imagePath: '/avatars/students/sample-1.png',
  },
  {
    id: 'sample-2',
    name: 'Aisha',
    gender: 'female',
    ethnicity: 'Malay',
    age: 12,
    imagePath: '/avatars/students/sample-2.png',
  },
  {
    id: 'sample-3',
    name: 'Ravi',
    gender: 'male',
    ethnicity: 'Indian',
    age: 11,
    imagePath: '/avatars/students/sample-3.png',
  },
  {
    id: 'sample-4',
    name: 'Emma',
    gender: 'female',
    ethnicity: 'Chinese',
    age: 12,
    imagePath: '/avatars/students/sample-4.png',
  },
  {
    id: 'sample-5',
    name: 'Arjun',
    gender: 'male',
    ethnicity: 'Indian',
    age: 11,
    imagePath: '/avatars/students/sample-5.png',
  },
]

/**
 * Get a random sample avatar
 */
export function getRandomSampleAvatar(): SampleAvatar {
  const randomIndex = Math.floor(Math.random() * SAMPLE_AVATARS.length)
  return SAMPLE_AVATARS[randomIndex]
}

/**
 * Get sample avatar by ID
 */
export function getSampleAvatarById(id: string): SampleAvatar | undefined {
  return SAMPLE_AVATARS.find((avatar) => avatar.id === id)
}

/**
 * Get sample avatar by gender
 */
export function getSampleAvatarsByGender(gender: 'male' | 'female'): SampleAvatar[] {
  return SAMPLE_AVATARS.filter((avatar) => avatar.gender === gender)
}

/**
 * Get a random sample avatar matching specific criteria
 */
export function getMatchingSampleAvatar(criteria?: {
  gender?: 'male' | 'female'
  ethnicity?: string
}): SampleAvatar {
  let filtered = SAMPLE_AVATARS

  if (criteria?.gender) {
    filtered = filtered.filter((avatar) => avatar.gender === criteria.gender)
  }

  if (criteria?.ethnicity) {
    filtered = filtered.filter(
      (avatar) => avatar.ethnicity.toLowerCase() === criteria.ethnicity?.toLowerCase()
    )
  }

  // If no matches, return random from all
  if (filtered.length === 0) {
    return getRandomSampleAvatar()
  }

  const randomIndex = Math.floor(Math.random() * filtered.length)
  return filtered[randomIndex]
}

/**
 * Get student avatar URL - returns sample avatar if student has no photo
 * Use this in components to always show an avatar
 */
export function getStudentAvatarUrl(
  studentPhoto: string | null | undefined,
  studentGender?: 'male' | 'female' | 'other',
  studentEthnicity?: string
): string {
  // If student has a profile photo, use it
  if (studentPhoto) {
    return studentPhoto
  }

  // Otherwise, get a matching sample avatar
  const gender = studentGender === 'other' ? undefined : studentGender
  const avatar = getMatchingSampleAvatar({
    gender,
    ethnicity: studentEthnicity,
  })

  return avatar.imagePath
}
