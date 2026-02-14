
import http from 'http';

const data = JSON.stringify({
    conversation: [{ role: 'user', text: 'Halo, saya butuh teman cerita.' }]
});

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/chat',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, res => {
    console.log(`statusCode: ${res.statusCode}`);
    let body = '';
    res.on('data', d => body += d);
    res.on('end', () => {
        console.log('Response:', body);
    });
});

req.on('error', error => {
    console.error(error);
});

req.write(data);
req.end();
