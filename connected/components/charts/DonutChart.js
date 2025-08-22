import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../constants/theme';

const DonutChart = ({ data, size = 120, showTotal = true, totalLabel = "Total" }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  if (total === 0) {
    return (
      <View style={[styles.donutContainer, { width: size, height: size }]}>
        <View style={[styles.donutChart, { backgroundColor: colors.lightPink }]}>
          <View style={styles.donutCenter}>
            <Text style={styles.donutCenterText}>0</Text>
            <Text style={styles.donutCenterLabel}>{totalLabel}</Text>
          </View>
        </View>
      </View>
    );
  }
  
  return (
    <View style={[styles.donutContainer, { width: size, height: size }]}>
      <View style={styles.donutChart}>
        {data.map((item, index) => {
          const percentage = (item.value / total) * 100;
          return (
            <View
              key={index}
              style={[
                styles.donutSegment,
                {
                  backgroundColor: item.color || colors.chartColors[index % colors.chartColors.length],
                  width: `${percentage}%`,
                }
              ]}
            />
          );
        })}
      </View>
      {showTotal && (
        <View style={styles.donutCenter}>
          <Text style={styles.donutCenterText}>{total}</Text>
          <Text style={styles.donutCenterLabel}>{totalLabel}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  donutContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  donutChart: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  donutSegment: {
    height: '100%',
  },
  donutCenter: {
    position: 'absolute',
    width: '60%',
    height: '60%',
    borderRadius: 100,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutCenterText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  donutCenterLabel: {
    fontSize: 10,
    color: colors.textSecondary,
  },
});

export default DonutChart;