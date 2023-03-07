/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect, useState} from 'react';
import NfcManager, {NfcTech} from 'react-native-nfc-manager';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
  TouchableOpacity,
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };
  const [text, setText] = useState('');
  const [log, setLog] = useState('');
  const [isError, setIsError] = useState('');
  const handleTextChange = text => {
    setText(text);
  };
  // ////////////////////////////////////////////////////////////////////?
  // async function writeNdef({type, value}) {
  //   let result = false;

  //   try {
  //     // STEP 1
  //     await NfcManager.requestTechnology(NfcTech.Ndef);

  //     const bytes = Ndef.encodeMessage([Ndef.textRecord('Hello NFC')]);

  //     if (bytes) {
  //       await NfcManager.ndefHandler.writeNdefMessage(bytes); // STEP 3
  //       result = true;
  //     }
  //   } catch (ex) {
  //     console.warn(ex);
  //   } finally {
  //     // STEP 4
  //     NfcManager.cancelTechnologyRequest();
  //   }

  //   return result;
  // }
  // ////////////////////////////////////////////////////////////////////?

  // ////////////////////////////////////////////////////////////////////?
  // async function readMifare() {
  //   let mifarePages = [];

  //   try {
  //     // STEP 1
  //     let reqMifare = await NfcManager.requestTechnology(
  //       NfcTech.MifareUltralight,
  //     );

  //     const readLength = 60;
  //     const mifarePagesRead = await Promise.all(
  //       [...Array(readLength).keys()].map(async (_, i) => {
  //         const pages =
  //           await NfcManager.mifareUltralightHandlerAndroid.mifareUltralightReadPages(
  //             i * 4,
  //           );
  //         mifarePages.push(pages);
  //       }),
  //     );
  //   } catch (ex) {
  //     console.warn(ex);
  //   } finally {
  //     // STEP 4
  //     NfcManager.cancelTechnologyRequest();
  //   }
  //   setLog(mifarePages.toString());
  //   return mifarePages;
  // }
  // ////////////////////////////////////////////////////////////////////?

  const readData = async () => {
    setLog('');
    try {
      let tech = NfcTech.NfcA;
      let res = await NfcManager.requestTechnology(tech, {
        alertMessage: 'Ist Bereit',
      });

      let cmd = NfcManager.transceive;
      res = await cmd([0x3a, 4, 4]);
      let payloadLength = parseInt(res.toString().split(',')[1]);
      let payloadPages = Math.ceil(payloadLength / 4);
      let startPage = 5;
      let endPage = startPage + payloadPages - 1;

      res = cmd([0x3a, startPage, endPage]);
      let bytes = res.toString().split(',');
      let tempText = '';

      for (let i = 0; i < bytes.length; i++) {
        if (i < 5) {
          continue;
        }

        if (parseInt(bytes[i]) === 254) {
          break;
        }

        tempText = tempText + String.fromCharCode(parseInt(bytes[i]));
        console.log(tempText);
      }

      setLog(tempText);
      // NfcManager.cancelTechnologyRequest().catch(() => 0);
    } catch (err) {
      setIsError(err.toString());
      // NfcManager.cancelTechnologyRequest().catch(() => 0);
    }
  };

  const writeData = async () => {
    if (!text.length) {
      setText('Bitte etwas eingeben!');
      return;
    }

    try {
      let tech = NfcTech.NfcA;
      let res = await NfcManager.requestTechnology(tech, {
        alertMessage: 'Ist Bereit',
      });

      let cmd = NfcManager.transceive;
      let fullLength = text.length + 7;
      let payloadLength = text.length + 3;

      res = await cmd([0xa2, 0x04, 0x03, fullLength, 0xd1, 0x01]);
      res = await cmd([0xa2, 0x04, 0x03, payloadLength, 0xd1, 0x01]);

      let currentPage = 6;
      let currentPayload = [0xa2, currentPage, 0x6e];

      for (let i = 0; i < text.length; i++) {
        currentPayload.push(text.charCodeAt(i));
        if (currentPayload.length == 6) {
          res = await cmd(currentPayload);
          currentPage += 1;
          currentPayload = [0xa2, currentPage];
        }
      }
      currentPayload.push(254);

      while (currentPayload.length < 6) {
        currentPayload.push(0);
      }

      res = await cmd(currentPayload);

      console.log('hallo');
      setLog(res.toString() === '10' ? res.toString() : res.toString());
    } catch (err) {
      setIsError(err.toString());
    }
  };
  useEffect(() => {
    NfcManager.start();

    // return () => {};
  }, []);

  return (
    <SafeAreaView style={backgroundStyle}>
      <View
        style={{
          backgroundColor: '#ddd',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          rowGap: 10,
        }}>
        <Text
          style={{
            width: '80%',
            backgroundColor: '#222',
            height: 100,
            borderRadius: 20,
            textAlign: 'center',
            textAlignVertical: 'center',
            color: '#fff',
            fontSize: 20,
          }}>
          {log}
        </Text>
        <TextInput
          style={{
            backgroundColor: 'red',
            height: 50,
            width: '90%',
            padding: 15,
            textAlign: 'center',
            color: 'black',
            borderRadius: 10,
          }}
          autoComplete="off"
          placeholder="NFC Eingeben"
          onChangeText={handleTextChange}
        />
        <View
          style={{
            display: 'flex',
            width: '100%',
            flexDirection: 'row',
            justifyContent: 'center',
            columnGap: 10,
          }}>
          <TouchableOpacity
            style={{
              width: '40%',
              height: 50,
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 8,
              backgroundColor: '#9D2235',
            }}
            onPress={writeData}
            // onPress={writeNdef}
          >
            <Text
              style={{
                width: '100%',
                textAlign: 'center',
                fontWeight: '700',
                fontSize: 20,
                color: 'white',
              }}>
              Eintragen
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              width: '40%',
              height: 50,
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 8,
              backgroundColor: '#006C5B',
            }}
            onPressIn={readData}
            onPressOut={() =>
              NfcManager.cancelTechnologyRequest().catch(() => 0)
            }
            // onPress={readMifare}
          >
            <Text
              style={{
                width: 120,
                textAlign: 'center',
                fontWeight: '700',
                fontSize: 20,
                color: 'white',
              }}>
              Lesen
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
