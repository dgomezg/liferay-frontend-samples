import React from 'react';
import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloProvider } from 'react-apollo';
import { setContext } from 'apollo-link-context';

import TravelSelectorWithData from './components/TravelSelector/TravelSelector';


import './App.css';

const authLink = setContext((_, { headers }) => {
  return {
    headers: Object.assign({}, headers, { Authorization: 'Basic dGVzdDp0ZXN0' })
  }
})

const BACKEND_URL = 'http://liferay-gs-ci:8091'

const apolloClient = new ApolloClient({
  link: authLink.concat(new HttpLink({uri: BACKEND_URL+'/o/graphql'})), 
  cache: new InMemoryCache()
});

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <div>Header-banner</div>
        <ApolloProvider client={apolloClient}>
          <TravelSelectorWithData/>
        </ApolloProvider>
      </header>
    </div>
  );
}

export default App;
