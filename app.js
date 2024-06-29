document.addEventListener('DOMContentLoaded', function () {
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const speakButton = document.getElementById('speak');
    const audioPlayer = document.getElementById('audioPlayer');

    darkModeToggle.addEventListener('click', function () {
        document.body.classList.toggle('dark-mode');

        // Save the user's preference in localStorage
        if (document.body.classList.contains('dark-mode')) {
            localStorage.setItem('theme', 'dark');
        } else {
            localStorage.setItem('theme', 'light');
        }
    });

    // Load the user's preference from localStorage
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
    }

    speakButton.addEventListener('click', async function () {
        const text = document.getElementById('text').value;
        if (text.trim() === '') {
            alert('Please enter some text.');
            return;
        }

        try {
            const response = await fetch('/text-to-speech', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text })
            });

            if (response.ok) {
                const data = await response.json();
                audioPlayer.src = data.audio;
                audioPlayer.play();
            } else {
                console.error('Error:', response.statusText);
                alert('An error occurred while converting text to speech.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while converting text to speech.');
        }
    });
});
