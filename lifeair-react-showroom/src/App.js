import React from 'react';
import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloProvider } from 'react-apollo';
import { setContext } from 'apollo-link-context';
import 'dotenv/config';

import TravelSelectorWithData from './components/TravelSelector/TravelSelector';



import './App.css';

const authLink = setContext((_, { headers }) => {
  return {
    headers: Object.assign({}, headers, { Authorization: `Basic ${process.env.REACT_APP_AUTHORIZATION_TOKEN}` })
  }
})


const apolloClient = new ApolloClient({
  link: authLink.concat(new HttpLink({uri: `${process.env.REACT_APP_BACKEND_URL}/o/graphql`})), 
  cache: new InMemoryCache()
});

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <div>LifeAir travel Agency</div>
        <ApolloProvider client={apolloClient}>
          <TravelSelectorWithData/>
        </ApolloProvider>
      </header>
    </div>
  );
}

export default App;
