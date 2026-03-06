const http = require('http');


http.get(`${import.meta.env.VITE_API_BASE_URL}/api/v1/mentors?size=100`, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            console.log('Mentors count:', json.content.length);
            let found = false;
            
            json.content.forEach(mentor => {
                mentor.subjects.forEach(subject => {
                    if (subject.subjectName.toLowerCase().includes('scalable enterprise architecture')) {
                        console.log(`FOUND! Mentor: ${mentor.firstName} ${mentor.lastName}, Subject: ${subject.subjectName}`);
                        found = true;
                    }
                });
            });
            
            if (!found) console.log('Subject NOT FOUND in mentors list.');
        } catch (e) {
            console.error('Failed to parse JSON:', e.message);
            console.log('Raw data received (likely HTML):', data);
        }
    });
}).on('error', (err) => {
    console.error('Error fetching data:', err.message);
});