import { useState, useMemo } from "react"
import { View, Pressable, StyleSheet, ScrollView } from "react-native"
import { ChevronLeft, ChevronRight } from "lucide-react-native"
import { Text } from "./Text"
import { Card } from "./Card"
import { colors, spacing, borderRadius } from "@/constants/theme"
import type { Job } from "@/lib/types"

interface WeekCalendarProps {
  jobs: Job[]
  onJobPress: (job: Job) => void
  onDayPress?: (date: Date) => void
}

function getWeekDates(baseDate: Date): Date[] {
  const dates: Date[] = []
  const start = new Date(baseDate)
  // Start from Monday
  const day = start.getDay()
  const diff = start.getDate() - day + (day === 0 ? -6 : 1)
  start.setDate(diff)

  for (let i = 0; i < 7; i++) {
    const date = new Date(start)
    date.setDate(start.getDate() + i)
    dates.push(date)
  }
  return dates
}

function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  )
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
}

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

export function WeekCalendar({ jobs, onJobPress, onDayPress }: WeekCalendarProps) {
  const [weekOffset, setWeekOffset] = useState(0)

  const today = new Date()
  const baseDate = useMemo(() => {
    const d = new Date(today)
    d.setDate(d.getDate() + weekOffset * 7)
    return d
  }, [weekOffset])

  const weekDates = useMemo(() => getWeekDates(baseDate), [baseDate])

  const jobsByDay = useMemo(() => {
    const map: Map<string, Job[]> = new Map()
    jobs.forEach((job) => {
      if (job.scheduled_at) {
        const jobDate = new Date(job.scheduled_at)
        const key = jobDate.toISOString().split("T")[0]
        const existing = map.get(key) || []
        map.set(key, [...existing, job])
      }
    })
    // Sort jobs by time within each day
    map.forEach((dayJobs, key) => {
      map.set(
        key,
        dayJobs.sort(
          (a, b) => new Date(a.scheduled_at!).getTime() - new Date(b.scheduled_at!).getTime()
        )
      )
    })
    return map
  }, [jobs])

  const weekLabel = useMemo(() => {
    const start = weekDates[0]
    const end = weekDates[6]
    if (start.getMonth() === end.getMonth()) {
      return `${start.getDate()} - ${end.getDate()} ${MONTH_NAMES[start.getMonth()]}`
    }
    return `${start.getDate()} ${MONTH_NAMES[start.getMonth()].slice(0, 3)} - ${end.getDate()} ${MONTH_NAMES[end.getMonth()].slice(0, 3)}`
  }, [weekDates])

  const goToPreviousWeek = () => setWeekOffset((prev) => prev - 1)
  const goToNextWeek = () => setWeekOffset((prev) => prev + 1)
  const goToToday = () => setWeekOffset(0)

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={goToPreviousWeek}
          style={({ pressed }) => [styles.navButton, pressed && styles.pressed]}
        >
          <ChevronLeft size={24} color={colors.navy} />
        </Pressable>

        <Pressable onPress={goToToday} style={styles.weekLabel}>
          <Text variant="titleSmall" align="center">
            {weekLabel}
          </Text>
          {weekOffset !== 0 && (
            <Text variant="small" color="accent" align="center">
              Tap for today
            </Text>
          )}
        </Pressable>

        <Pressable
          onPress={goToNextWeek}
          style={({ pressed }) => [styles.navButton, pressed && styles.pressed]}
        >
          <ChevronRight size={24} color={colors.navy} />
        </Pressable>
      </View>

      {/* Day Headers */}
      <View style={styles.dayHeaders}>
        {weekDates.map((date, index) => {
          const isToday = isSameDay(date, today)
          return (
            <Pressable
              key={index}
              onPress={() => onDayPress?.(date)}
              style={[styles.dayHeader, isToday && styles.dayHeaderToday]}
            >
              <Text variant="small" color={isToday ? "white" : "muted"}>
                {DAY_NAMES[index]}
              </Text>
              <Text variant="bodyStrong" style={isToday ? styles.dayNumberToday : undefined}>
                {date.getDate()}
              </Text>
            </Pressable>
          )
        })}
      </View>

      {/* Jobs Grid */}
      <ScrollView style={styles.gridScroll} showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {weekDates.map((date, index) => {
            const key = date.toISOString().split("T")[0]
            const dayJobs = jobsByDay.get(key) || []
            const isToday = isSameDay(date, today)

            return (
              <View key={index} style={[styles.dayColumn, isToday && styles.dayColumnToday]}>
                {dayJobs.length === 0 ? (
                  <View style={styles.emptyDay} />
                ) : (
                  dayJobs.map((job) => (
                    <Pressable
                      key={job.id}
                      onPress={() => onJobPress(job)}
                      style={({ pressed }) => [styles.jobCard, pressed && styles.pressed]}
                    >
                      <Text variant="small" color="accent" numberOfLines={1}>
                        {formatTime(job.scheduled_at!)}
                      </Text>
                      <Text variant="bodySmall" numberOfLines={2}>
                        {job.title}
                      </Text>
                    </Pressable>
                  ))
                )}
              </View>
            )
          })}
        </View>
      </ScrollView>

      {/* Empty State */}
      {jobs.filter((j) => j.scheduled_at).length === 0 && (
        <Card style={styles.emptyCard}>
          <Text variant="body" color="muted" align="center">
            No scheduled jobs yet
          </Text>
          <Text variant="small" color="muted" align="center">
            Add a schedule when creating or editing a job
          </Text>
        </Card>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.md,
  },
  navButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: borderRadius.full,
  },
  weekLabel: {
    flex: 1,
    alignItems: "center",
  },
  pressed: {
    opacity: 0.7,
  },
  dayHeaders: {
    flexDirection: "row",
    marginBottom: spacing.sm,
  },
  dayHeader: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  dayHeaderToday: {
    backgroundColor: colors.teal,
  },
  dayNumberToday: {
    color: colors.white,
  },
  gridScroll: {
    flex: 1,
  },
  grid: {
    flexDirection: "row",
    minHeight: 200,
  },
  dayColumn: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    paddingHorizontal: 2,
    gap: spacing.xs,
  },
  dayColumnToday: {
    backgroundColor: `${colors.teal}08`,
  },
  emptyDay: {
    height: 60,
  },
  jobCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
    padding: spacing.xs,
    borderLeftWidth: 3,
    borderLeftColor: colors.teal,
  },
  emptyCard: {
    marginTop: spacing.lg,
    paddingVertical: spacing.xl,
  },
})
