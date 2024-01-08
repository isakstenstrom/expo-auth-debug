import * as React from 'react';
import {
  exchangeCodeAsync,
  makeRedirectUri,
  useAuthRequest,
  useAutoDiscovery,
} from 'expo-auth-session';
import { Text, SafeAreaView, ScrollView } from 'react-native';

export default function App() {
  const discovery = useAutoDiscovery(
    'https://login.microsoftonline.com/<TENANT_ID>/v2.0',
  );
  const redirectUri = makeRedirectUri({ native: 'expoauthdebug://redirect' });
  const clientId = '<CLIENT_ID>';

  const [token, setToken] = React.useState<string | null>(null);
  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId,
      scopes: ['openid', 'profile', 'email', 'offline_access'],
      redirectUri,
    },
    discovery,
  );

  React.useEffect(() => {
    if (response?.type === 'success' && discovery) {
      exchangeCodeAsync(
        {
          clientId,
          code: response.params.code,
          extraParams: request?.codeVerifier
            ? { code_verifier: request.codeVerifier }
            : undefined,
          redirectUri,
        },
        discovery,
      ).then((res) => {
        setToken(res.accessToken);
      });
    } else {
      const interval = setInterval(() => {
        if (request) {
          promptAsync();
          clearInterval(interval);
        }
      }, 100);
    }
  }, [response]);

  React.useEffect(() => {
    if (request) {
      promptAsync();
    }
  }, [request, promptAsync]);

  return (
    <SafeAreaView>
      <ScrollView>
        <Text>{`Token: ${token}`}</Text>
        <Text>{`Response: ${JSON.stringify(response)}`}</Text>
        <Text>{`Request: ${JSON.stringify(request)}`}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
