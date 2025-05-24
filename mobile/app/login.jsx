import { StyleSheet, Text, View, Button } from 'react-native'
import React from 'react'
import { router } from "expo-router";


export default function login() {
  return (
    <View>
      <Text>login</Text>
      <Button title="home" onPress={() => router.push("/(tabs)/home")} />
    </View>
  );
}

const styles = StyleSheet.create({})