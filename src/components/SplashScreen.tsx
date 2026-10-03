// @ts-nocheck
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

// Sharp Vector Star Component (Figma Match)
const SharpStar = ({ size = 175, color = '#E6C61A' }) => {
  return (
    <View style={{ width: size, height: size, position: 'relative' }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <polygon
          points="50,2 65,34 99,38 74,62 81,97 50,79 19,97 26,62 1,38 35,34"
          fill={color}
          stroke={color}
          strokeWidth="1"
          strokeLinejoin="miter"
        />
      </svg>
    </View>
  );
};

export default function SplashScreen({ onContinue }) {

  useEffect(() => {
    const timer = setTimeout(() => {
      if (onContinue) {
        onContinue();
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [onContinue]);

  return (
    <TouchableOpacity
      style={styles.splashContainer}
      activeOpacity={0.95}
      onPress={onContinue}
    >
      <View style={styles.splashContentCenter}>
        <View style={styles.clipboardWrapper}>
          
          {/* 1. Top Broad Clip Box */}
          <View style={styles.topClip} />

          {/* 2. Clipboard Outer Frame (Thick Borders) */}
          <View style={styles.leftLine} />
          <View style={styles.topLeftCorner} />
          <View style={styles.topRightCorner} />
          
          {/* Right vertical border straight above 's' */}
          <View style={styles.rightTopDrop} />
          
          {/* Bottom left line extended towards star */}
          <View style={styles.bottomLeftExtendedLine} />

          {/* 3. TaskMaster Bold Text */}
          <Text style={styles.brandTitleText}>TaskMaster</Text>

          {/* 4. Sharp Yellow Star with gap below 'M' */}
          <View style={styles.starBox}>
            <SharpStar size={175} color="#E8C61D" />
          </View>

        </View>
      </View>

      {/* Footer Tagline */}
      <View style={styles.splashFooter}>
        <Text style={styles.splashTagline}>Organize your day, conquer your goals.</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: '#B5BDC7',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 55,
  },
  splashContentCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  clipboardWrapper: {
    width: 290,
    height: 320,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // 1. Top Clip Box - Nalla Tall Height (96px) & Horizontal Line Exact Center Pass
  topClip: {
    position: 'absolute',
    top: -20,
    width: 126,
    height: 96, // Nalla tall height figma maadhiri
    borderWidth: 22,
    borderColor: '#000000',
    borderRadius: 16,
    zIndex: 5,
    backgroundColor: '#B5BDC7',
  },

  // 2. Top-Left Horizontal Line
  topLeftCorner: {
    position: 'absolute',
    top: 24,
    left: 10,
    width: 78,
    height: 22,
    backgroundColor: '#000000',
    borderTopLeftRadius: 20,
  },

  // 3. Top-Right Horizontal Line
  topRightCorner: {
    position: 'absolute',
    top: 24,
    right: 28,
    width: 60,
    height: 22,
    backgroundColor: '#000000',
    borderTopRightRadius: 20,
  },

  // 4. Main Left Vertical Border
  leftLine: {
    position: 'absolute',
    top: 24,
    left: 10,
    width: 22,
    height: 260,
    backgroundColor: '#000000',
    borderBottomLeftRadius: 20,
  },

  // 5. Right Vertical Border ('s' kku mela little gap varadhuku height: 72)
  rightTopDrop: {
    position: 'absolute',
    top: 24,
    right: 28,
    width: 22,
    height: 72, // 86-la irundhu 72-ku koraichu gap create panniyirukku
    backgroundColor: '#000000',
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },

  // 6. Extended Bottom Line towards Star
  bottomLeftExtendedLine: {
    position: 'absolute',
    bottom: 34,
    left: 10,
    width: 118,
    height: 22,
    backgroundColor: '#000000',
    borderBottomLeftRadius: 20,
  },

  // 7. TaskMaster Bold Text
  brandTitleText: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 32,
    fontWeight: '900',
    color: '#000000',
    position: 'absolute',
    top: 96,
    right: -10,
    letterSpacing: -0.8,
    zIndex: 10,
  },

  // 8. Star Positioned with gap below letter 'M'
  starBox: {
    position: 'absolute',
    bottom: 12, // 'bottom: 26' nunchi '12' ki tagginchadam valla 'M' kindha neat gap vastundi
    right: -14,
    zIndex: 12,
  },

  splashFooter: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  splashTagline: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
  },
  splashTapHint: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 12,
    color: '#4B5563',
    marginTop: 8,
  },
});