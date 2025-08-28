const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Write env vars into /server/.env
const serverEnvFilePath = path.join(__dirname, 'server', '.env');
const envVars = [
    `TOKEN_SECRET_KEY=${process.env.TOKEN_SECRET_KEY}`,
    `NODE_ENV=${process.env.NODE_ENV}`,
    `BASE_URL=${process.env.BASE_URL}`,
].join('\n');

fs.writeFileSync(serverEnvFilePath, envVars);

// Function to spawn a process
function startProcess(command, args, cwd) {
    const proc = spawn(command, args, { cwd, stdio: 'inherit' });

    proc.on('exit', (code, signal) => {
        console.log(`${command} exited with code ${code} and signal ${signal}`);
        process.exit(code || 0); // exit parent if any child exits
    });

    return proc;
}

// Start backend
const backend = startProcess('npm', ['run', 'start:prod'], path.join(__dirname, 'server'));

// Start frontend
const frontend = startProcess('npx', ['serve', '-s', 'client-dist', '-l', '80'], __dirname);


// Graceful shutdown handler
function shutdown(signal) {
    console.log(`Received ${signal}, shutting down processes...`);
    backend.kill('SIGINT');
    frontend.kill('SIGINT');
    process.exit(0);
}

// Handle termination signals
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
