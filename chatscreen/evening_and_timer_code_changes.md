# Evening Gradient & 10-Min Timer Redirection — Code Implementation Guide

Share this guide with your friend to compile:
1. The robust time-based evening dusk/purple gradient fix (resolves the pinkish-grey horizon transition).
2. The automatic 10-minute session redirect to the Consciousness awareness screen.

---

## File 1: `src/components/AmbientBackground.tsx`
Update `CrossfadedGradient` to read `fractionalHour` and use time-of-day checks, rather than checking top hex code substrings which break during dynamic hex interpolation.

### 1. Update `CrossfadedGradient` signature and implementation
```tsx
function CrossfadedGradient({
  colors,
  easeMs,
  fractionalHour, // <-- Add this prop
}: {
  colors: [string, string, string];
  easeMs: number;
  fractionalHour: number; // <-- Add this type
}) {
  const [committed, setCommitted] = useState<[string, string, string]>(colors);
  const [next, setNext] = useState<[string, string, string] | null>(null);
  const fade = useRef(new Animated.Value(0)).current;
  const colorsKey = colors.join("|");

  useEffect(() => {
    setNext(colors);
    fade.setValue(0);
    Animated.timing(fade, {
      toValue: 1,
      duration: easeMs,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        setCommitted(colors);
        setNext(null);
        fade.setValue(0);
      }
    });
  }, [colorsKey, easeMs]);

  // Construct smooth 4-stop color ramp for seamless natural gradient blending
  const make4Stops = (c: [string, string, string]): [string, string, string, string] => {
    // Robust check using fractionalHour:
    // Night: 20.5 (8:30pm) to 5.0 (5:00am)
    // Evening (Dusk/Purple): 17.5 (5:30pm) to 20.5 (8:30pm)
    // Day/Sunrise: 5.0 to 17.5
    const isNightSky = fractionalHour >= 20.5 || fractionalHour < 5.0;
    const isPurpleSky = fractionalHour >= 17.5 && fractionalHour < 20.5;

    if (isNightSky) {
      return [
        c[0], // Deep midnight space top
        c[1], // Rich twilight indigo-navy mid
        "#16203a", // Mid-lower deep navy
        "#223157", // Soft midnight dusk navy bottom near input capsule
      ];
    }
    if (isPurpleSky) {
      return [
        c[0], // Deep dark twilight purple top
        c[1], // Rich dusk purple mid
        "#4a2c56", // Lighter purplish-lavender dusk
        "#6b3c60", // Soft purplish dusk bottom near input capsule
      ];
    }
    return [
      c[0], // cerulean top
      c[1], // soft sky blue
      "#dfccbe", // atmospheric white-peach blend
      c[2], // warm dusty horizon
    ];
  };

  return (
    <>
      <LinearGradient
        colors={make4Stops(committed)}
        locations={[0, 0.40, 0.78, 1.0]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      {next && (
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: fade }]}>
          <LinearGradient
            colors={make4Stops(next)}
            locations={[0, 0.40, 0.78, 1.0]}
            style={StyleSheet.absoluteFill}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
          />
        </Animated.View>
      )}
    </>
  );
}
```

### 2. Destructure `fractionalHour` and pass it to `CrossfadedGradient`
```tsx
export function AmbientBackground({
  skyColors,
  sunAltitude,
  sunProgress,
  sunOpacity,
  nightOpacity,
  auroraActive,
  fractionalHour, // <-- Destructure here
  weatherState = "clear",
  easeMs = 20_000,
}: AmbientBackgroundProps) {

  // ...
  
  return (
    <View ...>
      {/* 1. Base Solar Sky Gradient */}
      <CrossfadedGradient colors={skyColors} easeMs={easeMs} fractionalHour={fractionalHour} />
```

---

## File 2: `src/screens/AIChatDarkScreen.js`
Update the timer logic to automatically close the chat and navigate to `'Consciousness'` when 10 minutes (600 seconds) pass.

```diff
   useEffect(() => {
     const timer = setInterval(() => {
       setElapsedSeconds((prev) => {
         const next = prev + 1;
         if (next === 600) {
-          setShowTenMinModal(true);
+          if (navigation?.navigate) {
+            navigation.navigate('Consciousness');
+          }
         }
         return next;
       });
     }, 1000);
     return () => clearInterval(timer);
-  }, []);
+  }, [navigation]);
```

---

## File 3: `src/screens/AIChatLightScreen.js`
Apply the same automatic redirect change to the light chat screen:

```diff
   useEffect(() => {
     const timer = setInterval(() => {
       setElapsedSeconds((prev) => {
         const next = prev + 1;
         if (next === 600) {
-          setShowTenMinModal(true);
+          if (navigation?.navigate) {
+            navigation.navigate('Consciousness');
+          }
         }
         return next;
       });
     }, 1000);
     return () => clearInterval(timer);
-  }, []);
+  }, [navigation]);
```
