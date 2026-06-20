import { useEffect, useRef } from 'react'

export const ACHIEVEMENTS = [
  { id: 'first_task',       emoji: '🎯', name: 'First Blood',       desc: 'Complete your first deadline',      rarity: 'common',    req: g => g.completedDeadlines >= 1 },
  { id: 'deadline_5',       emoji: '⚡', name: 'On Fire',            desc: 'Complete 5 deadlines',              rarity: 'common',    req: g => g.completedDeadlines >= 5 },
  { id: 'deadline_slayer',  emoji: '🏹', name: 'Deadline Slayer',    desc: 'Complete 50 deadlines',             rarity: 'epic',      req: g => g.completedDeadlines >= 50 },
  { id: 'early_bird',       emoji: '🌅', name: 'Early Bird',         desc: 'Earn 200+ XP',                      rarity: 'rare',      req: g => g.xp >= 200 },
  { id: 'semester_survivor',emoji: '🎓', name: 'Semester Survivor',  desc: 'Reach level 5',                     rarity: 'rare',      req: g => (Math.floor(g.xp/200)+1) >= 5 },
  { id: 'focus_first',      emoji: '🔮', name: 'First Focus',        desc: 'Complete a focus session',          rarity: 'common',    req: g => g.totalSessions >= 1 },
  { id: 'deep_work',        emoji: '🧠', name: 'Deep Work',          desc: '10 focus sessions',                 rarity: 'uncommon',  req: g => g.totalSessions >= 10 },
  { id: 'focus_master',     emoji: '🔥', name: 'Focus Master',       desc: '100 focus sessions',                rarity: 'legendary', req: g => g.totalSessions >= 100 },
  { id: 'streak_3',         emoji: '📅', name: 'Consistent',         desc: '3-day login streak',                rarity: 'common',    req: g => g.streak >= 3 },
  { id: 'perfect_week',     emoji: '💫', name: 'Perfect Week',       desc: '7-day login streak',                rarity: 'rare',      req: g => g.streak >= 7 },
  { id: 'consistency_king', emoji: '👑', name: 'Consistency King',   desc: '30-day login streak',               rarity: 'legendary', req: g => g.streak >= 30 },
  { id: 'xp_500',           emoji: '⭐', name: 'Rising Star',        desc: 'Earn 500 XP',                       rarity: 'uncommon',  req: g => g.xp >= 500 },
  { id: 'xp_1000',          emoji: '🌟', name: 'Academic Star',      desc: 'Earn 1000 XP',                      rarity: 'epic',      req: g => g.xp >= 1000 },
]

export const RARITY_COLORS = {
  common:    '#9E93B7',
  uncommon:  '#34D399',
  rare:      '#3B82F6',
  epic:      '#A855F7',
  legendary: '#F59E0B',
}

export function useAchievements({ gamification, unlockAchievement, addNotification, showToast }) {
  const notified = useRef(new Set(gamification.achievements || []))

  useEffect(() => {
    ACHIEVEMENTS.forEach(a => {
      if (!notified.current.has(a.id) && a.req(gamification)) {
        notified.current.add(a.id)
        unlockAchievement(a.id)
        showToast?.(`🏆 ${a.name} unlocked!`)
        addNotification?.({
          type: 'achievement',
          title: 'Achievement Unlocked!',
          body: `${a.emoji} ${a.name} — ${a.desc}`,
          rarity: a.rarity,
        })
      }
    })
  }, [gamification.xp, gamification.streak, gamification.totalSessions, gamification.completedDeadlines])
}
