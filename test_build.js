const { exec } = require('child_process');

exec('npm run build', (error, stdout, stderr) => {
  console.log('--- STDOUT ---');
  console.log(stdout);
  console.log('--- STDERR ---');
  console.log(stderr);
  if (error) {
    console.error('--- ERROR ---');
    console.error(error);
  }
});
