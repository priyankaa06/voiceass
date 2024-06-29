const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const textToSpeech = require('@google-cloud/text-to-speech');
const speech = require('@google-cloud/speech');
const fs = require('fs');
const util = require('util');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

const ttsClient = new textToSpeech.TextToSpeechClient();
const sttClient = new speech.SpeechClient();

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/text-to-speech', async (req, res) => {
    const { text } = req.body;
    const request = {
        input: { text: text },
        voice: { languageCode: 'en-US', ssmlGender: 'NEUTRAL' },
        audioConfig: { audioEncoding: 'MP3' },
    };

    try {
        const [response] = await ttsClient.synthesizeSpeech(request);
        const writeFile = util.promisify(fs.writeFile);
        const audioFile = path.join(__dirname, 'public', 'output.mp3');
        await writeFile(audioFile, response.audioContent, 'binary');
        res.json({ message: 'Text to speech conversion successful.', audio: 'output.mp3' });
    } catch (err) {
        res.status(500).send(err);
    }
});

app.post('/speech-to-text', async (req, res) => {
    const audio = req.body.audio; // Expecting base64 encoded audio
    const audioBuffer = Buffer.from(audio, 'base64');

    const request = {
        audio: {
            content: audioBuffer.toString('base64'),
        },
        config: {
            encoding: 'LINEAR16',
            sampleRateHertz: 16000,
            languageCode: 'en-US',
        },
    };

    try {
        const [response] = await sttClient.recognize(request);
        const transcription = response.results
            .map(result => result.alternatives[0].transcript)
            .join('\n');
        res.json({ transcription: transcription });
    } catch (err) {
        res.status(500).send(err);
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
