import { Experience, ExperienceResponse, SenderUser, RecipientProfile, Question } from '../types';
import { DEFAULT_ROMANTIC_QUESTIONS } from '../data/defaultQuestions';
import { db, auth, handleFirestoreError, OperationType } from './firebase';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const EXPERIENCES_KEY = 'closer_experiences_v1';
const RESPONSES_KEY = 'closer_responses_v1';
const USER_KEY = 'closer_user_v1';

/**
 * Recursively strips undefined values so Firestore operations never fail with:
 * "Function setDoc() called with invalid data. Unsupported field value: undefined"
 */
export function sanitizeForFirestore<T>(data: T): T {
  if (data === undefined) {
    return null as unknown as T;
  }
  if (data === null || typeof data !== 'object') {
    return data;
  }
  if (data instanceof Date) {
    return data.toISOString() as unknown as T;
  }
  if (Array.isArray(data)) {
    return data
      .filter((item) => item !== undefined)
      .map((item) => sanitizeForFirestore(item)) as unknown as T;
  }
  const cleaned: Record<string, any> = {};
  for (const [key, value] of Object.entries(data as Record<string, any>)) {
    if (value !== undefined) {
      cleaned[key] = sanitizeForFirestore(value);
    }
  }
  return cleaned as T;
}

const DEFAULT_USER: SenderUser = {
  userId: 'user-demo-1',
  email: 'majidarain778866@gmail.com',
  name: 'Anonymous',
};

const INITIAL_EXPERIENCES: Experience[] = [
  {
    id: 'exp-ayesha',
    slug: 'ayesha-special',
    ownerId: 'user-demo-1',
    senderName: 'Anonymous',
    recipientName: 'Ayesha',
    title: 'A little conversation for Ayesha',
    customGreeting: 'Before you rush through your busy day… take two quiet minutes for this.',
    personalNote: 'I hope this made you smile as much as talking to you makes me smile. Drinks or dinner next week?',
    theme: 'midnight-rose',
    questions: DEFAULT_ROMANTIC_QUESTIONS,
    active: true,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    viewCount: 4,
  },
  {
    id: 'exp-alex',
    slug: 'alex-connection',
    ownerId: 'user-demo-1',
    senderName: 'Anonymous',
    recipientName: 'Alex',
    title: 'Just between you and me',
    customGreeting: 'A few little secrets and late night questions...',
    personalNote: 'Can’t wait to hear your answers over dinner.',
    theme: 'velvet-violet',
    questions: DEFAULT_ROMANTIC_QUESTIONS.slice(0, 6),
    active: true,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    viewCount: 2,
  },
];

const INITIAL_RESPONSES: ExperienceResponse[] = [
  {
    id: 'resp-ayesha-demo',
    experienceId: 'exp-ayesha',
    sessionId: 'sess-ayesha-123',
    recipientName: 'Ayesha',
    startedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    completedAt: new Date(Date.now() - 3600000 * 5 + 92000).toISOString(),
    deviceCategory: 'mobile',
    location: {
      city: 'Lahore',
      country: 'Pakistan',
      granted: true,
      formatted: 'Lahore, Pakistan',
    },
    notified: true,
    answers: {
      'q1-evening': {
        questionId: 'q1-evening',
        questionText: 'What does your perfect evening look like?',
        category: 'cute',
        value: 'Sunset glow 🌅',
        answeredAt: new Date(Date.now() - 3600000 * 5 + 15000).toISOString(),
      },
      'q2-food': {
        questionId: 'q2-food',
        questionText: 'Okay… and what are we ordering?',
        category: 'food',
        value: 'Artisan Pizza 🍕',
        answeredAt: new Date(Date.now() - 3600000 * 5 + 30000).toISOString(),
      },
      'q3-connection': {
        questionId: 'q3-connection',
        questionText: 'What makes spending time with someone feel special to you?',
        category: 'personal',
        value: 'Feeling understood 🤍',
        answeredAt: new Date(Date.now() - 3600000 * 5 + 44000).toISOString(),
      },
      'q4-attention': {
        questionId: 'q4-attention',
        questionText: 'Be honest… what gets your attention first?',
        category: 'playful',
        value: 'Their eyes 👀',
        answeredAt: new Date(Date.now() - 3600000 * 5 + 56000).toISOString(),
      },
      'q5-smile': {
        questionId: 'q5-smile',
        questionText: 'If someone made you smile a little too much… would you secretly enjoy it? 👀',
        category: 'flirty',
        value: 'Definitely YES ❤️',
        evasionCount: 2,
        answeredAt: new Date(Date.now() - 3600000 * 5 + 68000).toISOString(),
      },
      'q6-chemistry': {
        questionId: 'q6-chemistry',
        questionText: 'Late-night conversation, dim lights, and really good chemistry… sounds tempting? 😏',
        category: 'teasing',
        value: 'Very tempting YES ✨',
        evasionCount: 1,
        answeredAt: new Date(Date.now() - 3600000 * 5 + 77000).toISOString(),
      },
      'q7-growth': {
        questionId: 'q7-growth',
        questionText: 'If the chemistry feels real and the connection feels safe… would you let it grow? ❤️',
        category: 'romantic',
        value: 'YES, I would ❤️',
        evasionCount: 0,
        answeredAt: new Date(Date.now() - 3600000 * 5 + 85000).toISOString(),
      },
      'q8-final': {
        questionId: 'q8-final',
        questionText: 'Would you like to make some beautiful memories together? ❤️',
        category: 'final',
        value: 'YES, absolutely ❤️',
        evasionCount: 3,
        answeredAt: new Date(Date.now() - 3600000 * 5 + 92000).toISOString(),
      },
    },
  },
];

class StorageService {
  private isCloudSynced = false;

  constructor() {
    this.initAuthAndCloudSync();
  }

  private initAuthAndCloudSync() {
    if (typeof window === 'undefined') return;

    // Listen to Firebase Auth state
    onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        this.updateCurrentUser({
          userId: firebaseUser.uid,
          email: firebaseUser.email || this.getCurrentUser().email,
          name: firebaseUser.displayName || this.getCurrentUser().name,
        });
      }
      this.syncFromCloud().catch(() => {});
    });
  }

  private notifyListeners() {
    window.dispatchEvent(new Event('closer-storage-update'));
  }

  async syncFromCloud() {
    try {
      const currentUid = auth.currentUser?.uid;
      if (!currentUid) {
        this.isCloudSynced = true;
        return;
      }

      // Fetch creator's experiences
      const expQuery = query(collection(db, 'experiences'), where('ownerId', '==', currentUid));
      const expSnap = await getDocs(expQuery);
      if (!expSnap.empty) {
        const cloudList: Experience[] = [];
        expSnap.forEach((docSnap) => {
          cloudList.push(docSnap.data() as Experience);
        });
        if (cloudList.length > 0) {
          this.mergeExperiences(cloudList);
        }
      }

      // Fetch creator's responses
      const respQuery = query(collection(db, 'responses'), where('ownerId', '==', currentUid));
      const respSnap = await getDocs(respQuery);
      if (!respSnap.empty) {
        const cloudResponses: ExperienceResponse[] = [];
        respSnap.forEach((docSnap) => {
          cloudResponses.push(docSnap.data() as ExperienceResponse);
        });
        if (cloudResponses.length > 0) {
          this.mergeResponses(cloudResponses);
        }
      }

      this.isCloudSynced = true;
    } catch (e) {
      console.info('Firestore cloud sync fallback to local cache:', e);
    }
  }

  private mergeExperiences(cloudExps: Experience[]) {
    const local = this.getExperiences();
    const map = new Map<string, Experience>();
    local.forEach((e) => map.set(e.id, e));
    cloudExps.forEach((e) => map.set(e.id, e));
    const merged = Array.from(map.values());
    this.saveExperiences(merged);
  }

  private mergeResponses(cloudResps: ExperienceResponse[]) {
    const local = this.getResponses();
    const map = new Map<string, ExperienceResponse>();
    local.forEach((r) => map.set(r.id, r));
    cloudResps.forEach((r) => map.set(r.id, r));
    const merged = Array.from(map.values());
    localStorage.setItem(RESPONSES_KEY, JSON.stringify(merged));
    this.notifyListeners();
  }

  getCurrentUser(): SenderUser {
    try {
      const stored = localStorage.getItem(USER_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Storage read error:', e);
    }
    return DEFAULT_USER;
  }

  updateCurrentUser(user: Partial<SenderUser>): SenderUser {
    const current = this.getCurrentUser();
    const updated = { ...current, ...user };
    localStorage.setItem(USER_KEY, JSON.stringify(updated));
    this.notifyListeners();
    return updated;
  }

  getExperiences(): Experience[] {
    try {
      const stored = localStorage.getItem(EXPERIENCES_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Storage read error:', e);
    }
    // Seed initial
    this.saveExperiences(INITIAL_EXPERIENCES);
    return INITIAL_EXPERIENCES;
  }

  getExperienceById(id: string): Experience | null {
    const list = this.getExperiences();
    return list.find((e) => e.id === id) || null;
  }

  getExperienceBySlug(slug: string): Experience | null {
    const list = this.getExperiences();
    return (
      list.find(
        (e) =>
          e.slug.toLowerCase() === slug.toLowerCase() ||
          e.id.toLowerCase() === slug.toLowerCase()
      ) || null
    );
  }

  /**
   * Fetches an experience by slug or ID with local memory fallback and single-read Firestore lookup.
   * Enables seamless recipient links in fresh browser sessions/incognito without requiring authentication.
   */
  async fetchExperienceBySlugOrId(slugOrId: string): Promise<Experience | null> {
    const local = this.getExperienceBySlug(slugOrId);
    if (local) return local;

    try {
      // Direct Firestore document get (1 read on Spark free tier)
      const directRef = doc(db, 'experiences', slugOrId);
      const snap = await getDoc(directRef);
      if (snap.exists()) {
        const data = snap.data() as Experience;
        this.mergeExperiences([data]);
        return data;
      }

      // If slug doesn't have exp- prefix, try with prefix
      if (!slugOrId.startsWith('exp-')) {
        const altRef = doc(db, 'experiences', `exp-${slugOrId}`);
        const altSnap = await getDoc(altRef);
        if (altSnap.exists()) {
          const data = altSnap.data() as Experience;
          this.mergeExperiences([data]);
          return data;
        }
      } else {
        // If slugOrId has exp- prefix, try stripped
        const stripped = slugOrId.replace(/^exp-/, '');
        const altRef = doc(db, 'experiences', stripped);
        const altSnap = await getDoc(altRef);
        if (altSnap.exists()) {
          const data = altSnap.data() as Experience;
          this.mergeExperiences([data]);
          return data;
        }
      }
    } catch (e) {
      console.info('Experience fetch notice:', e);
    }
    return null;
  }

  incrementViewCount(experienceId: string) {
    const list = this.getExperiences();
    const idx = list.findIndex((e) => e.id === experienceId);
    if (idx !== -1) {
      const newCount = (list[idx].viewCount || 0) + 1;
      list[idx].viewCount = newCount;
      this.saveExperiences(list);
      // Sync cloud update
      updateDoc(doc(db, 'experiences', experienceId), { viewCount: newCount }).catch(() => {});
      if (list[idx].slug && list[idx].slug !== experienceId) {
        updateDoc(doc(db, 'experiences', list[idx].slug), { viewCount: newCount }).catch(() => {});
      }
    }
  }

  saveExperiences(experiences: Experience[]) {
    localStorage.setItem(EXPERIENCES_KEY, JSON.stringify(experiences));
    this.notifyListeners();
  }

  createExperience(
    exp: Omit<Experience, 'id' | 'createdAt' | 'viewCount'>
  ): Experience {
    const list = this.getExperiences();
    const currentUser = this.getCurrentUser();
    const newExperience: Experience = {
      ...exp,
      id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      ownerId: auth.currentUser?.uid || exp.ownerId || currentUser.userId,
      createdAt: new Date().toISOString(),
      viewCount: 0,
    };
    list.unshift(newExperience);
    this.saveExperiences(list);

    // Sync to Firestore with sanitization
    try {
      const sanitized = sanitizeForFirestore(newExperience);
      setDoc(doc(db, 'experiences', newExperience.id), sanitized).catch((err) => {
        console.warn('Firestore write warning:', err);
      });
      // Also register under slug so recipient getDoc resolves instantly
      if (newExperience.slug && newExperience.slug !== newExperience.id) {
        setDoc(doc(db, 'experiences', newExperience.slug), sanitized).catch((err) => {
          console.warn('Firestore slug alias write warning:', err);
        });
      }
    } catch (err) {
      console.warn('Firestore experience write notice:', err);
    }

    return newExperience;
  }

  updateExperience(id: string, updates: Partial<Experience>): Experience | null {
    const list = this.getExperiences();
    const idx = list.findIndex((e) => e.id === id);
    if (idx === -1) return null;

    const oldSlug = list[idx].slug;
    list[idx] = { ...list[idx], ...updates };
    this.saveExperiences(list);

    // Sync to Firestore with sanitization
    try {
      const sanitized = sanitizeForFirestore(updates);
      updateDoc(doc(db, 'experiences', id), sanitized).catch((err) => {
        console.warn('Firestore update warning:', err);
      });
      if (list[idx].slug && list[idx].slug !== id) {
        setDoc(doc(db, 'experiences', list[idx].slug), sanitizeForFirestore(list[idx]), { merge: true }).catch(() => {});
      }
      if (oldSlug && oldSlug !== list[idx].slug && oldSlug !== id) {
        deleteDoc(doc(db, 'experiences', oldSlug)).catch(() => {});
      }
    } catch (err) {
      console.warn('Firestore experience update notice:', err);
    }

    return list[idx];
  }

  deleteExperience(id: string): boolean {
    const list = this.getExperiences();
    const expToDelete = list.find((e) => e.id === id);
    const filtered = list.filter((e) => e.id !== id);
    if (filtered.length !== list.length) {
      this.saveExperiences(filtered);
      deleteDoc(doc(db, 'experiences', id)).catch((err) => {
        console.warn('Firestore delete warning:', err);
      });
      if (expToDelete?.slug && expToDelete.slug !== id) {
        deleteDoc(doc(db, 'experiences', expToDelete.slug)).catch(() => {});
      }
      return true;
    }
    return false;
  }

  getResponses(experienceId?: string): ExperienceResponse[] {
    try {
      const stored = localStorage.getItem(RESPONSES_KEY);
      let list: ExperienceResponse[] = [];
      if (stored) {
        list = JSON.parse(stored);
      } else {
        list = INITIAL_RESPONSES;
        localStorage.setItem(RESPONSES_KEY, JSON.stringify(INITIAL_RESPONSES));
      }
      if (experienceId) {
        return list.filter((r) => r.experienceId === experienceId);
      }
      return list;
    } catch (e) {
      console.warn('Storage read error:', e);
      return INITIAL_RESPONSES;
    }
  }

  getResponseById(id: string): ExperienceResponse | null {
    const list = this.getResponses();
    return list.find((r) => r.id === id) || null;
  }

  async saveActiveSessionProfile(
    experienceId: string,
    sessionId: string,
    profile: RecipientProfile
  ): Promise<void> {
    const sessionData = sanitizeForFirestore({
      id: sessionId,
      sessionId: sessionId,
      experienceId: experienceId,
      recipientName: profile.name || 'Special Guest',
      nickname: profile.nickname || '',
      theme: profile.selectedTheme || 'midnight-rose',
      lovelyName: profile.lovelyName || profile.nickname || profile.name || 'Sweetheart',
      ...(profile.photoUrl ? { photoUrl: profile.photoUrl } : {}),
      status: 'profile_completed',
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });

    // Cache locally in session storage
    try {
      sessionStorage.setItem(`closer_session_${sessionId}`, JSON.stringify(sessionData));
    } catch {}

    // Persist to Firestore linked to active session
    try {
      await setDoc(doc(db, 'sessions', sessionId), sessionData, { merge: true });
    } catch (err) {
      console.warn('Firestore active session save notice:', err);
    }
  }

  saveResponse(
    response: Omit<ExperienceResponse, 'id' | 'completedAt'>
  ): ExperienceResponse {
    const list = this.getResponses();
    const newResponse: ExperienceResponse = {
      ...response,
      id: `resp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      completedAt: new Date().toISOString(),
      notified: true,
    };
    list.unshift(newResponse);
    localStorage.setItem(RESPONSES_KEY, JSON.stringify(list));
    this.notifyListeners();

    // Sync to Firestore with undefined sanitization
    try {
      const sanitized = sanitizeForFirestore(newResponse);
      setDoc(doc(db, 'responses', newResponse.id), sanitized).catch((err) => {
        console.warn('Firestore response write warning:', err);
      });
    } catch (err) {
      console.warn('Firestore response write notice:', err);
    }

    return newResponse;
  }

  updateResponsePhoto(responseId: string, photoUrl: string) {
    if (!photoUrl) return;
    const list = this.getResponses();
    const idx = list.findIndex((r) => r.id === responseId);
    if (idx !== -1) {
      list[idx].photoUrl = photoUrl;
      if (list[idx].recipientProfile) {
        list[idx].recipientProfile = {
          ...list[idx].recipientProfile,
          photoUrl,
        };
      }
      localStorage.setItem(RESPONSES_KEY, JSON.stringify(list));
      this.notifyListeners();
      try {
        const sanitized = sanitizeForFirestore({
          photoUrl,
          recipientProfile: list[idx].recipientProfile,
        });
        setDoc(doc(db, 'responses', responseId), sanitized, { merge: true }).catch((err) => {
          console.warn('Firestore response photo update notice:', err);
        });
      } catch (err) {
        console.warn('Firestore response photo update notice:', err);
      }
    }
  }

  deleteResponse(id: string): boolean {
    const list = this.getResponses();
    const filtered = list.filter((r) => r.id !== id);
    if (filtered.length !== list.length) {
      localStorage.setItem(RESPONSES_KEY, JSON.stringify(filtered));
      this.notifyListeners();
      deleteDoc(doc(db, 'responses', id)).catch((err) => {
        console.warn('Firestore response delete warning:', err);
      });
      return true;
    }
    return false;
  }

  getCustomTemplates(): Question[] {
    try {
      const stored = localStorage.getItem('closer_custom_templates_v1');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}
    return [];
  }

  saveCustomTemplate(template: Question): Question {
    const list = this.getCustomTemplates();
    const cleanTemplate: Question = {
      ...template,
      id: template.sourceTemplateId || `custom-template-${Date.now()}`,
      sourceTemplateId: template.sourceTemplateId || `custom-template-${Date.now()}`,
    };
    const existingIdx = list.findIndex((t) => t.id === cleanTemplate.id);
    if (existingIdx >= 0) {
      list[existingIdx] = cleanTemplate;
    } else {
      list.push(cleanTemplate);
    }
    try {
      localStorage.setItem('closer_custom_templates_v1', JSON.stringify(list));
      this.notifyListeners();
    } catch (e) {
      console.warn('Could not save custom template', e);
    }
    return cleanTemplate;
  }

  resetToDefaults() {
    localStorage.removeItem(EXPERIENCES_KEY);
    localStorage.removeItem(RESPONSES_KEY);
    localStorage.removeItem(USER_KEY);
    this.saveExperiences(INITIAL_EXPERIENCES);
    localStorage.setItem(RESPONSES_KEY, JSON.stringify(INITIAL_RESPONSES));
    this.notifyListeners();
  }
}

export const storageService = new StorageService();
