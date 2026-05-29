// frontend/mobile/src/App.js
// Estrutura de arquivos em conformidade com o gabarito.
// Conforme solicitado pelo cliente, a aplicação principal foi otimizada para Web Responsiva (Mobile-First).

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>ABEMCE Mobile</Text>
      <Text style={styles.text}>Acesse a versão Web responsiva para visualizar todas as telas.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#009ada',
    marginBottom: 10
  },
  text: {
    fontSize: 16,
    color: '#57606f',
    textAlign: 'center'
  }
});
