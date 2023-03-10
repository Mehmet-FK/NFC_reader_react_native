/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect, useState} from 'react';
import NfcManager, {Ndef, NfcTech} from 'react-native-nfc-manager';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
  TouchableOpacity,
  Image,
} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';
import NfcProxy from './NfcProxy';
const imgUrl = './logo.png';
function App() {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const [text, setText] = useState(null);
  const [log, setLog] = useState({text: '', id: ''});
  const [status, setStatus] = useState('');
  const [supported, setSupported] = useState(null);
  const [enabled, setEnabled] = useState(null);
  const handleTextChange = text => {
    setText(text);
  };

  /* const initNfc = async () => {
    try {
      const success = await NfcProxy.init();
      setSupported(success);
      setEnabled(await NfcProxy.isEnabled());

      if (success) {
        function onBackgroundTag(bgTag) {
          navigation.navigate('TagDetail', {tag: bgTag});
        }

        function onDeepLink(url, launch) {
          try {
            const customScheme = [
              'com.washow.nfcopenrewriter://', // android
              'com.revteltech.nfcopenrewriter://', // ios
            ].find(scheme => {
              return scheme === url.slice(0, scheme.length);
            });

            if (!customScheme) {
              return;
            }

            url = url.slice(customScheme.length);

            // issue #23: we might have '?' in our payload, so we cannot simply "split" it
            let action = url;
            let query = '';
            let splitIdx = url.indexOf('?');

            if (splitIdx > -1) {
              action = url.slice(0, splitIdx);
              query = url.slice(splitIdx);
            }

            const params = qs.parse(query);
            if (action === 'share') {
              const sharedRecord = JSON.parse(params.data);
              if (sharedRecord.payload?.tech === NfcTech.Ndef) {
                navigation.navigate('NdefWrite', {savedRecord: sharedRecord});
              } else {
                console.warn('unrecognized share payload tech');
              }
            }
          } catch (ex) {
            console.warn('fail to parse deep link', ex);
          }
        }

        // get the initial launching tag
        const bgTag = await NfcManager.getBackgroundTag();
        if (bgTag) {
          onBackgroundTag(bgTag);
        } else {
          const link = await Linking.getInitialURL();
          console.warn('DEEP LINK', link);
          if (link) {
            onDeepLink(link, true);
          }
        }

        // listen to other background tags after the app launched
        NfcManager.setEventListener(
          NfcEvents.DiscoverBackgroundTag,
          onBackgroundTag,
        );

        // listen to the NFC on/off state on Android device
        if (Platform.OS === 'android') {
          NfcManager.setEventListener(
            NfcEvents.StateChanged,
            ({state} = {}) => {
              NfcManager.cancelTechnologyRequest().catch(() => 0);
              if (state === 'off') {
                setEnabled(false);
              } else if (state === 'on') {
                setEnabled(true);
              }
            },
          );
        }

        Linking.addEventListener('url', event => {
          if (event.url) {
            onDeepLink(event.url, false);
          }
        });
      }
    } catch (ex) {
      console.warn('ALERTALERTALERT', ex);
    }
  };
 */
  const writeNdef = async () => {
    if (!text) {
      setStatus('Eingabe erforderlich!');
      return;
    }

    try {
      setStatus('Bitte Tag scannen....');
      console.log('1');
      await NfcManager.requestTechnology(NfcTech.Ndef, {
        alertMessage: '',
      });
      console.log('2');
      let bytes = null;

      bytes = Ndef.encodeMessage([Ndef.textRecord(text)]);
      console.log('3');

      if (bytes) {
        console.log('4');
        await NfcManager.writeNdefMessage(bytes);
        result = true;
        console.log('5');
      }
      setStatus('geschrieben...');
      console.log('TEXT====>', text);
      setLog({text, id: ''});
    } catch (ex) {
      console.log(ex);
      setStatus('Fehler aufgetreten!');
    } finally {
      NfcManager.cancelTechnologyRequest();
    }
  };

  useEffect(() => {
    NfcProxy.init();
  }, []);

  return (
    <SafeAreaView style={backgroundStyle}>
      <View
        style={{
          backgroundColor: '#000',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          rowGap: 10,
          position: 'relative',
        }}>
        <View
          style={{
            height: 80,
            width: '100%',
            backgroundColor: '#ddd',
            position: 'absolute',
            top: 0,
            paddingLeft: 10,
            display: 'flex',
            justifyContent: 'center',
          }}>
          <Image style={{width: 150, height: 60}} source={require(imgUrl)} />
        </View>
        <Text
          style={{
            width: '80%',
            backgroundColor: '#ddd',
            height: 200,
            borderRadius: 20,
            textAlign: 'center',
            textAlignVertical: 'center',
            color: '#000',
            fontSize: 20,
          }}>
          {`Text: ${log?.text} \n`}
          {log.id && ` ID: ${log.id}`}
        </Text>
        <Text
          style={{
            width: '80%',
            // backgroundColor: 'i',
            height: 40,
            borderRadius: 20,
            textAlign: 'center',
            textAlignVertical: 'center',
            color: '#fff',
            fontSize: 20,
          }}>
          {status}
        </Text>
        <TextInput
          value={text}
          style={{
            backgroundColor: '#fff',
            height: 50,
            width: '90%',
            padding: 15,
            textAlign: 'center',
            color: 'black',
            borderRadius: 10,
          }}
          placeholderTextColor="black"
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
            onPress={writeNdef}>
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
            onPress={async () => {
              setText(null);
              const tag = await NfcProxy.readTag(setStatus, setLog);
              console.log('Tag console', tag);
            }}>
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

export default App;
