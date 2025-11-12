// Este archivo exporta las funciones de storage según la configuración
// Si Supabase está configurado, usa Supabase, sino usa localStorage

import { isSupabaseConfigured } from './supabase'
import * as localStorageStorage from './storage'
import * as supabaseStorage from './supabase-storage'

// Determinar qué storage usar
const useSupabase = isSupabaseConfigured

// Exportar funciones según la configuración
export const getUsers = useSupabase ? supabaseStorage.getUsers : () => Promise.resolve(localStorageStorage.getUsers())
export const addUser = useSupabase ? supabaseStorage.addUser : (user: Parameters<typeof localStorageStorage.addUser>[0]) => Promise.resolve(localStorageStorage.addUser(user))
export const getUserByDni = useSupabase ? supabaseStorage.getUserByDni : (dni: string) => Promise.resolve(localStorageStorage.getUserByDni(dni))
export const getUsersByRole = useSupabase ? supabaseStorage.getUsersByRole : (role: Parameters<typeof localStorageStorage.getUsersByRole>[0]) => Promise.resolve(localStorageStorage.getUsersByRole(role))

export const getSubjects = useSupabase ? supabaseStorage.getSubjects : () => Promise.resolve(localStorageStorage.getSubjects())
export const addSubject = useSupabase ? supabaseStorage.addSubject : (subject: Parameters<typeof localStorageStorage.addSubject>[0]) => Promise.resolve(localStorageStorage.addSubject(subject))

export const getCourses = useSupabase ? supabaseStorage.getCourses : () => Promise.resolve(localStorageStorage.getCourses())
export const addCourse = useSupabase ? supabaseStorage.addCourse : (course: Parameters<typeof localStorageStorage.addCourse>[0]) => Promise.resolve(localStorageStorage.addCourse(course))

export const getSubjectCourses = useSupabase ? supabaseStorage.getSubjectCourses : () => Promise.resolve(localStorageStorage.getSubjectCourses())
export const addSubjectCourse = useSupabase ? supabaseStorage.addSubjectCourse : (sc: Parameters<typeof localStorageStorage.addSubjectCourse>[0]) => Promise.resolve(localStorageStorage.addSubjectCourse(sc))

export const getTeacherSubjects = useSupabase ? supabaseStorage.getTeacherSubjects : () => Promise.resolve(localStorageStorage.getTeacherSubjects())
export const addTeacherSubject = useSupabase ? supabaseStorage.addTeacherSubject : (ts: Parameters<typeof localStorageStorage.addTeacherSubject>[0]) => Promise.resolve(localStorageStorage.addTeacherSubject(ts))

export const getLogbooks = useSupabase ? supabaseStorage.getLogbooks : () => Promise.resolve(localStorageStorage.getLogbooks())
export const getLogbookByTeacherAndSubject = useSupabase 
  ? supabaseStorage.getLogbookByTeacherAndSubject 
  : (teacherId: string, subjectId: string, courseId: string) => Promise.resolve(localStorageStorage.getLogbookByTeacherAndSubject(teacherId, subjectId, courseId))
export const addOrUpdateLogbook = useSupabase 
  ? supabaseStorage.addOrUpdateLogbook 
  : (logbook: Parameters<typeof localStorageStorage.addOrUpdateLogbook>[0]) => Promise.resolve(localStorageStorage.addOrUpdateLogbook(logbook))

export const getCurrentUser = localStorageStorage.getCurrentUser
export const setCurrentUser = localStorageStorage.setCurrentUser
export const initializeData = useSupabase ? supabaseStorage.initializeData : () => Promise.resolve(localStorageStorage.initializeData())

