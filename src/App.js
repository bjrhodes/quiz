import React, { useState, useEffect } from 'react';

import qServer from './services/server';
import getQuizId from './services/getQuizId';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';

import Answers from './Components/Answers';
import Chat from './Components/Chat';
import CurrentQuestion from './Components/CurrentQuestion';
import JoinAQuiz from './Components/JoinAQuiz';
import StartAQuiz from './Components/StartAQuiz';
import Team from './Components/Team';

const quizId = getQuizId();

const quizLayout = (quizServer) =>
  <Container>
    < Grid container spacing={3} >
      <Grid item xs={12}>
        <CurrentQuestion></CurrentQuestion>
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <Answers></Answers>
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <Team quizServer={quizServer}></Team>
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <Chat></Chat>
      </Grid>
    </Grid >
  </Container >;

const loading = () =>
  <Container>LOADING</Container>;

const quizChooser = () => {
  return <Container>
    <JoinAQuiz></JoinAQuiz>
    <StartAQuiz></StartAQuiz>
  </Container>;
};

let serverPromise = null;

const bootServer = () => {
  if (!serverPromise) {
    serverPromise = qServer("127.0.0.1:8082", quizId);
  }
  return serverPromise;
}


function App() {
  const [service, setService] = useState(false);

  useEffect(() => {
    bootServer().then(setService).catch(() => {/** @todo redirect to a not found view I guess!? */ });
  }, []);

  return quizId ? (service ? quizLayout(service) : loading()) : quizChooser();
}

export default App;
