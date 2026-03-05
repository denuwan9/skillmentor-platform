const http = require('http');

http.get('http://localhost:8081/api/v1/mentors', (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            console.log('Mentors count:', json.content.length);
            json.content.forEach(mentor => {
                console.log(`Mentor: ${mentor.firstName} ${mentor.lastName}`);
                mentor.subjects.forEach(subject => {
                    console.log(`  - Subject: ${subject.subjectName}`);
                });
            });
        } catch (e) {
            console.error('Failed to parse JSON:', e.message);
            console.log('Raw data:', data);
        }
    });
}).on('error', (err) => {
    console.error('Error fetching data:', err.message);
});
