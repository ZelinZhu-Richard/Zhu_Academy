export function masteryColor(score = 0) {
  if (score >= 0.8) {
    return 'rgba(36, 130, 90, 0.18)';
  }

  if (score >= 0.5) {
    return 'rgba(213, 146, 28, 0.18)';
  }

  return 'rgba(166, 64, 45, 0.18)';
}
