const SPACES = [
  'https://kartikjain12345-oryn-voice-gen.hf.space',
  'https://kartikjain12345-oryn-caption-engine.hf.space',
];

const INTERVAL = 13 * 60 * 1000; // 13 minutes

let timer = null;

function ping() {
  SPACES.forEach(url => {
    fetch(url, { method: 'HEAD', mode: 'no-cors' }).catch(() => {});
  });
}

export function startKeepAlive() {
  if (timer) return;
  ping();
  timer = setInterval(ping, INTERVAL);
}

export function stopKeepAlive() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}
