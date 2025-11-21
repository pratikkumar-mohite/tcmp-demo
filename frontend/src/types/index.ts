export interface Attendee {
  id: string;
  fullName: string;
  email: string;
  designation: string;
  createdAt: string;
}

export interface Speaker {
  id: string;
  name: string;
  bio: string;
  photoURL: string;
}

export interface Session {
  id: string;
  title: string;
  description: string;
  time: string;
  speakerId: string;
}

export interface SessionWithSpeaker extends Session {
  speaker?: Speaker;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  designation: string;
}

export interface Stats {
  [designation: string]: number;
}

export interface Todo {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

