export interface Professor {
  id: string
  email: string
  name: string
  created_at: string
}

export interface Class {
  id: string
  professor_id: string
  name: string
  level: string
  robot_name: string
  personality: string
  code: string
  created_at: string
}

export interface Conversation {
  id: string
  class_id: string
  student_name: string
  duration: number
  accuracy: number
  mistakes: number
  created_at: string
}

export interface ClassWithStats extends Class {
  conversations: Conversation[]
  avg_accuracy: number
  total_sessions: number
}
