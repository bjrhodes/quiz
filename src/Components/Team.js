import React, { useState, useEffect } from 'react';

import { pathIsArray } from '../services/utils';

const validateParticipants = setParticipants => serverResponse =>
    pathIsArray(['participants'], serverResponse)
        ? setParticipants(serverResponse.participants)
        : console.log(serverResponse);

const subscribeToParticipants = (quizServer, setParticipants) => () => {
    quizServer.subscribe('Components/Team', validateParticipants(setParticipants));

    quizServer.getParticipants();

    return () => quizServer.unsubscribe('Components/Team');
};

export default function ({ quizServer, peer }) {
    const [participants, setParticipants] = useState([]);

    useEffect(subscribeToParticipants(quizServer, setParticipants), [quizServer]);

    // @todo get server to return participants and list them here!

    return <h2>Team</h2>;
};