import React from 'react';
import { nanoid } from 'nanoid';

export default function (quizServer, peer) {
    const quizUrl = `/${nanoid(8)}`;
    return <a href={quizUrl}>Start a new quiz</a>
};