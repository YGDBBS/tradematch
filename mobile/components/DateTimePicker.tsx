import { useState } from "react"
import { View, Pressable, StyleSheet, Platform } from "react-native"
import DateTimePickerNative, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker"
import { Calendar, Clock, X } from "lucide-react-native"
import { Text } from "./Text"
import { colors, spacing, borderRadius } from "@/constants/theme"

interface DateTimePickerProps {
  label?: string
  value: Date | null
  onChange: (date: Date | null) => void
  mode?: "date" | "time" | "datetime"
  placeholder?: string
  disabled?: boolean
  minimumDate?: Date
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  })
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatDateTime(date: Date): string {
  return `${formatDate(date)} at ${formatTime(date)}`
}

export function DateTimePicker({
  label,
  value,
  onChange,
  mode = "datetime",
  placeholder = "Select date & time",
  disabled = false,
  minimumDate,
}: DateTimePickerProps) {
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [tempDate, setTempDate] = useState<Date>(value ?? new Date())

  const handleDateChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false)
    }

    if (selectedDate) {
      setTempDate(selectedDate)

      if (mode === "date") {
        onChange(selectedDate)
        setShowDatePicker(false)
      } else if (mode === "datetime" && Platform.OS === "android") {
        // On Android, show time picker after date is selected
        setShowTimePicker(true)
      } else if (Platform.OS === "ios") {
        // iOS has combined datetime picker
        onChange(selectedDate)
      }
    }
  }

  const handleTimeChange = (_event: DateTimePickerEvent, selectedTime?: Date) => {
    setShowTimePicker(false)

    if (selectedTime) {
      // Combine the date from tempDate with the time from selectedTime
      const combined = new Date(tempDate)
      combined.setHours(selectedTime.getHours())
      combined.setMinutes(selectedTime.getMinutes())
      onChange(combined)
    }
  }

  const handlePress = () => {
    if (disabled) return
    setTempDate(value ?? new Date())
    setShowDatePicker(true)
  }

  const handleClear = () => {
    onChange(null)
  }

  const handleIOSConfirm = () => {
    onChange(tempDate)
    setShowDatePicker(false)
  }

  const displayValue = value
    ? mode === "date"
      ? formatDate(value)
      : mode === "time"
        ? formatTime(value)
        : formatDateTime(value)
    : null

  const Icon = mode === "time" ? Clock : Calendar

  return (
    <View style={styles.container}>
      {label && (
        <Text variant="label" style={styles.label}>
          {label}
        </Text>
      )}

      <Pressable
        onPress={handlePress}
        disabled={disabled}
        style={({ pressed }) => [
          styles.input,
          disabled && styles.inputDisabled,
          pressed && styles.inputPressed,
        ]}
      >
        <Icon size={20} color={colors.textMuted} strokeWidth={2} />
        <Text
          variant="body"
          style={[styles.inputText, !displayValue && styles.placeholder]}
          numberOfLines={1}
        >
          {displayValue || placeholder}
        </Text>
        {value && !disabled && (
          <Pressable onPress={handleClear} hitSlop={8} style={styles.clearButton}>
            <X size={18} color={colors.textMuted} />
          </Pressable>
        )}
      </Pressable>

      {/* iOS - Modal-style picker */}
      {Platform.OS === "ios" && showDatePicker && (
        <View style={styles.iosPickerContainer}>
          <View style={styles.iosPickerHeader}>
            <Pressable onPress={() => setShowDatePicker(false)}>
              <Text variant="body" color="muted">
                Cancel
              </Text>
            </Pressable>
            <Pressable onPress={handleIOSConfirm}>
              <Text variant="bodyStrong" color="accent">
                Done
              </Text>
            </Pressable>
          </View>
          <DateTimePickerNative
            value={tempDate}
            mode={mode === "datetime" ? "datetime" : mode}
            display="spinner"
            onChange={handleDateChange}
            minimumDate={minimumDate}
            style={styles.iosPicker}
          />
        </View>
      )}

      {/* Android - Native dialogs */}
      {Platform.OS === "android" && showDatePicker && (
        <DateTimePickerNative
          value={tempDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
          minimumDate={minimumDate}
        />
      )}

      {Platform.OS === "android" && showTimePicker && (
        <DateTimePickerNative
          value={tempDate}
          mode="time"
          display="default"
          onChange={handleTimeChange}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.sm,
  },
  label: {
    marginBottom: spacing.xs,
  },
  input: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    gap: spacing.sm,
  },
  inputDisabled: {
    opacity: 0.5,
  },
  inputPressed: {
    backgroundColor: colors.background,
  },
  inputText: {
    flex: 1,
  },
  placeholder: {
    color: colors.textMuted,
  },
  clearButton: {
    padding: spacing.xs,
  },
  iosPickerContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    marginTop: spacing.sm,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },
  iosPickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iosPicker: {
    height: 200,
  },
})
