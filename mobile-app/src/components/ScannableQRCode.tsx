import React, { useMemo, useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, Text, Image, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// @ts-ignore
import qrcode from '../utils/qrcode.js';

interface ScannableQRCodeProps {
  value: string;
  size?: number;
  showScannerCorners?: boolean;
  showScanBeam?: boolean;
  centerBadgeIcon?: string;
  badgeLabel?: string;
}

export const ScannableQRCode: React.FC<ScannableQRCodeProps> = ({
  value,
  size = 190,
  showScannerCorners = true,
  showScanBeam = true,
  centerBadgeIcon = 'gift',
  badgeLabel,
}) => {
  const beamAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!showScanBeam) return;
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(beamAnim, {
          toValue: 1,
          duration: 2200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(beamAnim, {
          toValue: 0,
          duration: 2200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [showScanBeam, beamAnim]);

  // Generate QR matrix using pure JS ISO/IEC 18004 engine
  const { rects, count, base64Uri } = useMemo(() => {
    try {
      const qr = qrcode(0, 'M');
      qr.addData(value || 'https://gymora.app');
      qr.make();
      const moduleCount = qr.getModuleCount();
      
      // Run-length encoded rectangles for ultra-fast, pixel-crisp vector rendering
      const rList: { r: number; c: number; len: number }[] = [];
      for (let r = 0; r < moduleCount; r++) {
        let c = 0;
        while (c < moduleCount) {
          if (qr.isDark(r, c)) {
            let len = 1;
            while (c + len < moduleCount && qr.isDark(r, c + len)) {
              len++;
            }
            rList.push({ r, c, len });
            c += len;
          } else {
            c++;
          }
        }
      }

      let dataUri = '';
      try {
        dataUri = qr.createDataURL(6, 2);
      } catch (_) {}

      return { rects: rList, count: moduleCount, base64Uri: dataUri };
    } catch (err) {
      console.warn('QR generation error:', err);
      return { rects: [], count: 0, base64Uri: '' };
    }
  }, [value]);

  const quietMarginModules = 2;
  const totalModules = count + quietMarginModules * 2;
  const cellSize = size / totalModules;
  const innerOffset = quietMarginModules * cellSize;

  const beamTranslateY = beamAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, size - 4],
  });

  return (
    <View style={[styles.outerContainer, { width: size + 24, height: size + 24 }]}>
      {/* 4 Scanner Viewfinder Corners */}
      {showScannerCorners && (
        <>
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />
        </>
      )}

      {/* White QR Board (Quiet Zone) */}
      <View style={[styles.qrCanvas, { width: size, height: size }]}>
        {count > 0 ? (
          <View style={{ width: size, height: size, position: 'relative' }}>
            {rects.map((rect, idx) => (
              <View
                key={idx}
                style={{
                  position: 'absolute',
                  left: innerOffset + rect.c * cellSize,
                  top: innerOffset + rect.r * cellSize,
                  width: rect.len * cellSize + 0.3, // Slight overlap avoids hairline subpixel gaps
                  height: cellSize + 0.3,
                  backgroundColor: '#0F172A',
                }}
              />
            ))}

            {/* Center Logo / Badge to make it look official & premium */}
            {centerBadgeIcon && (
              <View
                style={[
                  styles.centerBadge,
                  {
                    left: (size - 30) / 2,
                    top: (size - 30) / 2,
                  },
                ]}
              >
                <Ionicons name={centerBadgeIcon as any} size={15} color="#EA580C" />
              </View>
            )}

            {/* Glowing Laser Scan Beam */}
            {showScanBeam && (
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.scanBeam,
                  {
                    width: size - 12,
                    left: 6,
                    transform: [{ translateY: beamTranslateY }],
                  },
                ]}
              >
                <View style={styles.beamLine} />
              </Animated.View>
            )}
          </View>
        ) : base64Uri ? (
          <Image
            source={{ uri: base64Uri }}
            style={{ width: size, height: size }}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.loadingBox}>
            <Text style={styles.loadingText}>Generating QR...</Text>
          </View>
        )}
      </View>

      {/* Optional Badge label */}
      {badgeLabel ? (
        <View style={styles.badgePill}>
          <Text style={styles.badgePillText}>{badgeLabel}</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    padding: 12,
  },
  qrCanvas: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  // Viewfinder Corner Accents
  corner: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderColor: '#EA580C',
  },
  cornerTL: {
    top: 2,
    left: 2,
    borderTopWidth: 3.5,
    borderLeftWidth: 3.5,
    borderTopLeftRadius: 8,
  },
  cornerTR: {
    top: 2,
    right: 2,
    borderTopWidth: 3.5,
    borderRightWidth: 3.5,
    borderTopRightRadius: 8,
  },
  cornerBL: {
    bottom: 2,
    left: 2,
    borderBottomWidth: 3.5,
    borderLeftWidth: 3.5,
    borderBottomLeftRadius: 8,
  },
  cornerBR: {
    bottom: 2,
    right: 2,
    borderBottomWidth: 3.5,
    borderRightWidth: 3.5,
    borderBottomRightRadius: 8,
  },
  // Center logo cutout
  centerBadge: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#EA580C',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  // Animated laser scan beam
  scanBeam: {
    position: 'absolute',
    top: 0,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 15,
  },
  beamLine: {
    width: '100%',
    height: 2.5,
    backgroundColor: '#EA580C',
    borderRadius: 2,
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 4,
  },
  loadingBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  badgePill: {
    position: 'absolute',
    bottom: -8,
    backgroundColor: '#EA580C',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    zIndex: 20,
  },
  badgePillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});

