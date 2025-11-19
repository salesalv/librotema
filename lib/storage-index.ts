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
export const updateUser = useSupabase ? supabaseStorage.updateUser : (id: string, updates: Parameters<typeof localStorageStorage.updateUser>[1]) => Promise.resolve(localStorageStorage.updateUser(id, updates))
export const deleteUser = useSupabase ? supabaseStorage.deleteUser : (id: string) => Promise.resolve(localStorageStorage.deleteUser(id))
export const deleteMultipleUsers = useSupabase ? supabaseStorage.deleteMultipleUsers : (ids: string[]) => Promise.resolve(ids.forEach(id => localStorageStorage.deleteUser(id)))
export const getUserByDni = useSupabase ? supabaseStorage.getUserByDni : (dni: string) => Promise.resolve(localStorageStorage.getUserByDni(dni))
export const getUsersByRole = useSupabase ? supabaseStorage.getUsersByRole : (role: Parameters<typeof localStorageStorage.getUsersByRole>[0]) => Promise.resolve(localStorageStorage.getUsersByRole(role))

export const getSubjects = useSupabase ? supabaseStorage.getSubjects : () => Promise.resolve(localStorageStorage.getSubjects())
export const addSubject = useSupabase ? supabaseStorage.addSubject : (subject: Parameters<typeof localStorageStorage.addSubject>[0]) => Promise.resolve(localStorageStorage.addSubject(subject))
export const updateSubject = useSupabase ? supabaseStorage.updateSubject : (id: string, updates: Parameters<typeof localStorageStorage.updateSubject>[1]) => Promise.resolve(localStorageStorage.updateSubject(id, updates))
export const deleteSubject = useSupabase ? supabaseStorage.deleteSubject : (id: string) => Promise.resolve(localStorageStorage.deleteSubject(id))
export const deleteMultipleSubjects = useSupabase ? supabaseStorage.deleteMultipleSubjects : (ids: string[]) => Promise.resolve(ids.forEach(id => localStorageStorage.deleteSubject(id)))

export const getEspecialidades = useSupabase ? supabaseStorage.getEspecialidades : () => Promise.resolve([])

export const getCourses = useSupabase ? supabaseStorage.getCourses : () => Promise.resolve(localStorageStorage.getCourses())
export const addCourse = useSupabase ? supabaseStorage.addCourse : (course: Parameters<typeof localStorageStorage.addCourse>[0]) => Promise.resolve(localStorageStorage.addCourse(course))
export const updateCourse = useSupabase ? supabaseStorage.updateCourse : (id: string, updates: Parameters<typeof localStorageStorage.updateCourse>[1]) => Promise.resolve(localStorageStorage.updateCourse(id, updates))
export const deleteCourse = useSupabase ? supabaseStorage.deleteCourse : (id: string) => Promise.resolve(localStorageStorage.deleteCourse(id))
export const deleteMultipleCourses = useSupabase ? supabaseStorage.deleteMultipleCourses : (ids: string[]) => Promise.resolve(ids.forEach(id => localStorageStorage.deleteCourse(id)))

export const getSubjectCourses = useSupabase ? supabaseStorage.getSubjectCourses : () => Promise.resolve(localStorageStorage.getSubjectCourses())
export const addSubjectCourse = useSupabase ? supabaseStorage.addSubjectCourse : (sc: Parameters<typeof localStorageStorage.addSubjectCourse>[0]) => Promise.resolve(localStorageStorage.addSubjectCourse(sc))
export const deleteSubjectCourse = useSupabase ? supabaseStorage.deleteSubjectCourse : (id: string) => Promise.resolve(localStorageStorage.deleteSubjectCourse(id))

export const getTeacherSubjects = useSupabase ? supabaseStorage.getTeacherSubjects : () => Promise.resolve(localStorageStorage.getTeacherSubjects())
export const addTeacherSubject = useSupabase ? supabaseStorage.addTeacherSubject : (ts: Parameters<typeof localStorageStorage.addTeacherSubject>[0]) => Promise.resolve(localStorageStorage.addTeacherSubject(ts))
export const updateTeacherSubject = useSupabase ? supabaseStorage.updateTeacherSubject : (id: string, updates: Parameters<typeof localStorageStorage.updateTeacherSubject>[1]) => Promise.resolve(localStorageStorage.updateTeacherSubject(id, updates))
export const deleteTeacherSubject = useSupabase ? supabaseStorage.deleteTeacherSubject : (id: string) => Promise.resolve(localStorageStorage.deleteTeacherSubject(id))
export const deleteMultipleTeacherSubjects = useSupabase ? supabaseStorage.deleteMultipleTeacherSubjects : (ids: string[]) => Promise.resolve(localStorageStorage.deleteMultipleTeacherSubjects(ids))

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

