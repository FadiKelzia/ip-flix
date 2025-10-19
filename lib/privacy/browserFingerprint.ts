// Browser Fingerprinting and Privacy Detection
// All collection happens client-side with user consent

export interface PrivacyAuditResult {
  // Browser Fingerprinting
  fingerprint: {
    canvas: string;
    webgl: string;
    audio: string;
    fonts: string[];
    plugins: string[];
  };

  // Device Information
  device: {
    screenResolution: string;
    colorDepth: number;
    pixelRatio: number;
    hardwareConcurrency: number;
    deviceMemory: number | null;
    maxTouchPoints: number;
    platform: string;
    architecture: string;
  };

  // Network & Connection
  network: {
    effectiveType: string | null;
    downlink: number | null;
    rtt: number | null;
    saveData: boolean | null;
    webrtcIPs: string[];
  };

  // Privacy Settings
  privacy: {
    doNotTrack: string | null;
    incognitoDetected: boolean;
    adBlockerDetected: boolean;
    cookiesEnabled: boolean;
    javaEnabled: boolean;
    thirdPartyCookiesBlocked: boolean;
  };

  // Storage & Tracking
  storage: {
    cookies: Array<{ name: string; domain: string; secure: boolean; httpOnly: boolean }>;
    localStorage: number;
    sessionStorage: number;
    indexedDB: string[];
    serviceWorkers: number;
  };

  // Permissions & APIs
  permissions: {
    notifications: string;
    geolocation: string;
    camera: string;
    microphone: string;
    battery: boolean;
  };

  // Browser Capabilities
  capabilities: {
    webgl: boolean;
    webrtc: boolean;
    webassembly: boolean;
    webWorkers: boolean;
    sharedWorkers: boolean;
    serviceWorker: boolean;
    indexedDB: boolean;
    localStorage: boolean;
    sessionStorage: boolean;
  };

  // Privacy Score
  privacyScore: number; // 0-100
  privacyLevel: 'Low' | 'Medium' | 'High' | 'Very High';
  risks: string[];
  recommendations: string[];
}

// Canvas Fingerprinting
export function getCanvasFingerprint(): string {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return 'unavailable';

    canvas.width = 200;
    canvas.height = 50;

    // Draw text with different styles
    ctx.textBaseline = 'top';
    ctx.font = '14px "Arial"';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('Browser Fingerprint 🔒', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('Privacy Audit', 4, 17);

    return canvas.toDataURL().slice(-50); // Last 50 chars as fingerprint
  } catch {
    return 'blocked';
  }
}

// WebGL Fingerprinting
export function getWebGLFingerprint(): string {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext;
    if (!gl) return 'unavailable';

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (!debugInfo) return 'unavailable';

    const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);

    return `${vendor}|${renderer}`.slice(0, 50);
  } catch {
    return 'blocked';
  }
}

// Audio Context Fingerprinting
export function getAudioFingerprint(): Promise<string> {
  return new Promise((resolve) => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) {
        resolve('unavailable');
        return;
      }

      const context = new AudioContext();
      const oscillator = context.createOscillator();
      const analyser = context.createAnalyser();
      const gainNode = context.createGain();
      const scriptProcessor = context.createScriptProcessor(4096, 1, 1);

      gainNode.gain.value = 0; // Mute
      oscillator.connect(analyser);
      analyser.connect(scriptProcessor);
      scriptProcessor.connect(gainNode);
      gainNode.connect(context.destination);

      scriptProcessor.onaudioprocess = function (event) {
        const output = event.outputBuffer.getChannelData(0);
        const fingerprint = output.slice(0, 30).join('').slice(0, 50);
        oscillator.disconnect();
        scriptProcessor.disconnect();
        context.close();
        resolve(fingerprint || 'generated');
      };

      oscillator.start(0);

      setTimeout(() => resolve('timeout'), 1000);
    } catch {
      resolve('blocked');
    }
  });
}

// Detect installed fonts
export function getInstalledFonts(): string[] {
  const baseFonts = ['monospace', 'sans-serif', 'serif'];
  const testFonts = [
    'Arial', 'Verdana', 'Courier New', 'Times New Roman', 'Georgia',
    'Palatino', 'Garamond', 'Comic Sans MS', 'Trebuchet MS', 'Impact',
    'Helvetica', 'Calibri', 'Cambria', 'Consolas', 'Lucida Console'
  ];

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return [];

  const detected: string[] = [];

  baseFonts.forEach((baseFont) => {
    ctx.font = `72px ${baseFont}`;
    const baseWidth = ctx.measureText('mmmmmmmmmmlli').width;

    testFonts.forEach((testFont) => {
      ctx.font = `72px ${testFont}, ${baseFont}`;
      const testWidth = ctx.measureText('mmmmmmmmmmlli').width;

      if (testWidth !== baseWidth) {
        detected.push(testFont);
      }
    });
  });

  return [...new Set(detected)];
}

// Get browser plugins
export function getBrowserPlugins(): string[] {
  const plugins: string[] = [];

  if (navigator.plugins && navigator.plugins.length > 0) {
    for (let i = 0; i < navigator.plugins.length; i++) {
      plugins.push(navigator.plugins[i].name);
    }
  }

  return plugins;
}

// WebRTC IP Leak Detection
export function detectWebRTCLeak(): Promise<string[]> {
  return new Promise((resolve) => {
    const ips: string[] = [];
    const RTCPeerConnection = window.RTCPeerConnection ||
      (window as any).mozRTCPeerConnection ||
      (window as any).webkitRTCPeerConnection;

    if (!RTCPeerConnection) {
      resolve([]);
      return;
    }

    try {
      const pc = new RTCPeerConnection({ iceServers: [] });
      pc.createDataChannel('');

      pc.createOffer().then((offer) => pc.setLocalDescription(offer));

      pc.onicecandidate = (ice) => {
        if (!ice || !ice.candidate || !ice.candidate.candidate) {
          resolve([...new Set(ips)]);
          return;
        }

        const match = /([0-9]{1,3}(\.[0-9]{1,3}){3})/.exec(ice.candidate.candidate);
        if (match && match[1]) {
          ips.push(match[1]);
        }
      };

      setTimeout(() => {
        pc.close();
        resolve([...new Set(ips)]);
      }, 2000);
    } catch {
      resolve([]);
    }
  });
}

// Detect incognito/private browsing
export async function detectIncognito(): Promise<boolean> {
  try {
    // Chrome/Edge detection
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const { quota } = await navigator.storage.estimate();
      if (quota && quota < 120000000) return true; // Less than ~120MB suggests incognito
    }

    // Firefox detection
    if (window.indexedDB) {
      try {
        const db = window.indexedDB.open('test');
        return await new Promise((resolve) => {
          db.onsuccess = () => resolve(false);
          db.onerror = () => resolve(true);
        });
      } catch {
        return true;
      }
    }

    return false;
  } catch {
    return false;
  }
}

// Detect ad blocker
export function detectAdBlocker(): Promise<boolean> {
  return new Promise((resolve) => {
    const testAd = document.createElement('div');
    testAd.innerHTML = '&nbsp;';
    testAd.className = 'adsbox';
    testAd.style.position = 'absolute';
    testAd.style.left = '-999px';
    document.body.appendChild(testAd);

    setTimeout(() => {
      const blocked = testAd.offsetHeight === 0;
      document.body.removeChild(testAd);
      resolve(blocked);
    }, 100);
  });
}

// Get all cookies
export function getAllCookies(): Array<{ name: string; domain: string; secure: boolean; httpOnly: boolean }> {
  const cookies = document.cookie.split(';');
  return cookies.map((cookie) => {
    const [name] = cookie.trim().split('=');
    return {
      name: name || 'unknown',
      domain: window.location.hostname,
      secure: false, // Can't detect from JS
      httpOnly: false, // Can't detect from JS
    };
  }).filter(c => c.name !== 'unknown');
}

// Calculate privacy score
export function calculatePrivacyScore(audit: Partial<PrivacyAuditResult>): {
  score: number;
  level: 'Low' | 'Medium' | 'High' | 'Very High';
  risks: string[];
  recommendations: string[];
} {
  let score = 100;
  const risks: string[] = [];
  const recommendations: string[] = [];

  // Canvas fingerprinting (-15 points)
  if (audit.fingerprint?.canvas && audit.fingerprint.canvas !== 'blocked' && audit.fingerprint.canvas !== 'unavailable') {
    score -= 15;
    risks.push('Canvas fingerprinting is possible');
    recommendations.push('Use browser extensions that block canvas fingerprinting');
  }

  // WebGL fingerprinting (-15 points)
  if (audit.fingerprint?.webgl && audit.fingerprint.webgl !== 'blocked' && audit.fingerprint.webgl !== 'unavailable') {
    score -= 15;
    risks.push('WebGL fingerprinting exposes GPU information');
    recommendations.push('Disable WebGL or use privacy-focused browsers');
  }

  // Many fonts detected (-10 points)
  if (audit.fingerprint?.fonts && audit.fingerprint.fonts.length > 10) {
    score -= 10;
    risks.push(`${audit.fingerprint.fonts.length} fonts detected - unique fingerprint`);
    recommendations.push('Reduce installed fonts or use font blocking extensions');
  }

  // Do Not Track disabled (-5 points)
  if (audit.privacy?.doNotTrack === null || audit.privacy?.doNotTrack === '0') {
    score -= 5;
    risks.push('Do Not Track is not enabled');
    recommendations.push('Enable Do Not Track in browser settings');
  }

  // No ad blocker (-10 points)
  if (audit.privacy?.adBlockerDetected === false) {
    score -= 10;
    risks.push('No ad blocker detected');
    recommendations.push('Install an ad blocker like uBlock Origin');
  }

  // Third-party cookies enabled (-20 points)
  if (audit.privacy?.thirdPartyCookiesBlocked === false) {
    score -= 20;
    risks.push('Third-party cookies are enabled');
    recommendations.push('Block third-party cookies in browser settings');
  }

  // WebRTC leak (-15 points)
  if (audit.network?.webrtcIPs && audit.network.webrtcIPs.length > 0) {
    score -= 15;
    risks.push('WebRTC is leaking local IP addresses');
    recommendations.push('Disable WebRTC or use extensions to prevent IP leaks');
  }

  // Many cookies (-10 points)
  if (audit.storage?.cookies && audit.storage.cookies.length > 20) {
    score -= 10;
    risks.push(`${audit.storage.cookies.length} cookies stored`);
    recommendations.push('Regularly clear cookies and browsing data');
  }

  // Determine level
  let level: 'Low' | 'Medium' | 'High' | 'Very High';
  if (score >= 80) level = 'Very High';
  else if (score >= 60) level = 'High';
  else if (score >= 40) level = 'Medium';
  else level = 'Low';

  return {
    score: Math.max(0, score),
    level,
    risks,
    recommendations,
  };
}
