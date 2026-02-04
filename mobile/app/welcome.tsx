import { useEffect, useRef } from "react"
import { View, StyleSheet, ScrollView, StatusBar, Animated as RNAnimated } from "react-native"
import { router } from "expo-router"
import { Screen, Text, Button } from "@/components"
import { colors, semantic, spacing, borderRadius } from "@/constants/theme"

const BENEFIT_CARDS = [
  { title: "Qualified leads", body: "Only serious customers who are ready to book." },
  {
    title: "Payment held by Stripe",
    body: "You get paid when the job's done, not when they remember.",
  },
  { title: "Clear job scope", body: "Agree details and price upfront — fewer disputes." },
  { title: "Less chasing", body: "Focus on the work; we help with the rest." },
]

const CARD_DURATION = 400
const CARD_STAGGER_MS = 120

/**
 * First screen when not signed in: hero, animated benefit cards, then Sign in / Create account.
 * Uses RN Animated (not Reanimated) so it runs in Expo Go without Worklets native mismatch.
 */
export default function WelcomeScreen() {
  const heroOpacity = useRef(new RNAnimated.Value(0)).current
  const heroTranslate = useRef(new RNAnimated.Value(20)).current
  const cardOpacity = useRef(new RNAnimated.Value(0)).current
  const cardTranslate = useRef(new RNAnimated.Value(20)).current
  const benefitAnims = useRef(
    BENEFIT_CARDS.map(() => ({
      opacity: new RNAnimated.Value(0),
      translateX: new RNAnimated.Value(60),
    }))
  ).current

  useEffect(() => {
    RNAnimated.parallel([
      RNAnimated.timing(heroOpacity, {
        toValue: 1,
        duration: 500,
        delay: 100,
        useNativeDriver: true,
      }),
      RNAnimated.timing(heroTranslate, {
        toValue: 0,
        duration: 500,
        delay: 100,
        useNativeDriver: true,
      }),
    ]).start()

    RNAnimated.parallel([
      RNAnimated.timing(cardOpacity, {
        toValue: 1,
        duration: 400,
        delay: 400,
        useNativeDriver: true,
      }),
      RNAnimated.timing(cardTranslate, {
        toValue: 0,
        duration: 400,
        delay: 400,
        useNativeDriver: true,
      }),
    ]).start()

    const staggered = benefitAnims.map((anim, index) =>
      RNAnimated.parallel([
        RNAnimated.timing(anim.opacity, {
          toValue: 1,
          duration: CARD_DURATION,
          delay: 500 + index * CARD_STAGGER_MS,
          useNativeDriver: true,
        }),
        RNAnimated.timing(anim.translateX, {
          toValue: 0,
          duration: CARD_DURATION,
          delay: 500 + index * CARD_STAGGER_MS,
          useNativeDriver: true,
        }),
      ])
    )
    RNAnimated.stagger(0, staggered).start()
  }, [heroOpacity, heroTranslate, cardOpacity, cardTranslate, benefitAnims])

  return (
    <Screen padded={false} safeAreaColor={colors.primary}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <RNAnimated.View
            style={[
              styles.heroContent,
              {
                opacity: heroOpacity,
                transform: [{ translateY: heroTranslate }],
              },
            ]}
          >
            <Text variant="title" style={styles.title}>
              TradeMatch
            </Text>
            <Text variant="body" style={styles.tagline}>
              Jobs that pay. Customers who don't mess about.
            </Text>
          </RNAnimated.View>
        </View>

        <RNAnimated.View
          style={[
            styles.benefitsSection,
            {
              opacity: cardOpacity,
              transform: [{ translateY: cardTranslate }],
            },
          ]}
        >
          <Text variant="titleSmall" style={styles.benefitsTitle}>
            Why TradeMatch?
          </Text>
          {BENEFIT_CARDS.map((card, index) => (
            <RNAnimated.View
              key={card.title}
              style={[
                styles.benefitRow,
                {
                  opacity: benefitAnims[index].opacity,
                  transform: [{ translateX: benefitAnims[index].translateX }],
                },
              ]}
            >
              <View style={styles.benefitCard}>
                <View style={styles.benefitIndicator} />
                <View style={styles.benefitContent}>
                  <Text variant="label" style={styles.benefitCardTitle}>
                    {card.title}
                  </Text>
                  <Text variant="bodySmall" style={styles.benefitCardBody}>
                    {card.body}
                  </Text>
                </View>
              </View>
            </RNAnimated.View>
          ))}
        </RNAnimated.View>

        <View style={styles.actions}>
          <Button
            title="Get started"
            variant="primary"
            onPress={() => router.replace("/signup")}
            fullWidth
            style={styles.primaryButton}
          />
          <Button
            title="Sign in"
            variant="secondary"
            onPress={() => router.replace("/login")}
            fullWidth
          />
        </View>
      </ScrollView>
    </Screen>
  )
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl * 2,
    paddingBottom: spacing.xl,
  },
  hero: {
    marginBottom: spacing.xl,
    backgroundColor: colors.primary,
    marginHorizontal: -spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    marginTop: -spacing.xl * 2,
  },
  heroContent: {},
  title: {
    marginBottom: spacing.md,
    color: colors.surface,
    fontSize: 28,
  },
  tagline: {
    lineHeight: 24,
    color: colors.surface,
    opacity: 0.9,
  },
  benefitsSection: {
    marginBottom: spacing.xl,
  },
  benefitsTitle: { marginBottom: spacing.md },
  benefitRow: { marginBottom: spacing.sm },
  benefitCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: semantic.card.bg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: semantic.card.border,
  },
  benefitIndicator: {
    width: 4,
    height: "100%",
    minHeight: 40,
    backgroundColor: colors.accent,
    borderRadius: borderRadius.full,
    marginRight: spacing.md,
  },
  benefitContent: {
    flex: 1,
  },
  benefitCardTitle: { marginBottom: spacing.xs },
  benefitCardBody: { lineHeight: 20 },
  actions: { gap: spacing.md },
  primaryButton: { marginBottom: spacing.xs },
})
