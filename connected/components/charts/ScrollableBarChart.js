import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { colors } from '../../constants/theme';

const ScrollableBarChart = ({ data, height = 200 }) => {
  const maxValue = Math.max(...data.map(d => d.value), 1);
  const barWidth = 60;
  const spacing = 15;
  
  return (
    <View style={[styles.barChartContainer, { height }]}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={true}
        style={styles.barChartScroll}
      >
        <View style={[styles.barChart, { width: data.length * (barWidth + spacing) + spacing }]}>
          {data.map((item, index) => {
            const barHeight = (item.value / maxValue) * (height - 60);
            return (
              <View key={index} style={[styles.barWrapper, { width: barWidth, marginHorizontal: spacing / 2 }]}>
                <Text style={styles.barValue}>{item.value}%</Text>
                <View
                  style={[
                    styles.bar,
                    {
                      height: barHeight,
                      backgroundColor: colors.chartColors[index % colors.chartColors.length],
                      width: barWidth - 10,
                    }
                  ]}
                />
                <Text style={styles.barLabel} numberOfLines={2}>{item.label}</Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  barChartContainer: {
    marginBottom: 20,
  },
  barChartScroll: {
    flexGrow: 0,
  },
  barChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 10,
  },
  barWrapper: {
    alignItems: 'center',
  },
  barValue: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 5,
  },
  bar: {
    borderRadius: 4,
  },
  barLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 5,
    textAlign: 'center',
  },
});

export default ScrollableBarChart;