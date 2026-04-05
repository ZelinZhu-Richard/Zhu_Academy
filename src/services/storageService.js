import { slugify } from '../utils/slugify';

const STORAGE_PREFIX = 'zhu-academy:graph:';

function isStorageAvailable() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function getGraphStorageKey(topic) {
  return `${STORAGE_PREFIX}${slugify(topic || 'default')}`;
}

export function loadGraphState(topic) {
  if (!isStorageAvailable() || !topic) {
    return null;
  }

  const storageKey = getGraphStorageKey(topic);
  const rawValue = window.localStorage.getItem(storageKey);

  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue);
  } catch {
    window.localStorage.removeItem(storageKey);
    return null;
  }
}

export function saveGraphState(topic, state) {
  if (!isStorageAvailable() || !topic) {
    return;
  }

  window.localStorage.setItem(getGraphStorageKey(topic), JSON.stringify(state));
}

export function clearGraphState(topic) {
  if (!isStorageAvailable() || !topic) {
    return;
  }

  window.localStorage.removeItem(getGraphStorageKey(topic));
}
