// conforme planejado, este js será responsavel pelo mobile e terá uma função bem simples, 
// que é apenas exibir uma mensagem informando os usuários que a versão mobile do ABEMCE é 
// apenas um placeholder e que eles devem acessar a versão web responsiva para visualizar todas as 
// telas e funcionalidades do sistema.

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
