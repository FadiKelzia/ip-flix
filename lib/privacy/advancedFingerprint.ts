/**
 * Advanced Browser Fingerprinting - CreepJS Inspired
 * Detects browser tampering, lies, and advanced tracking techniques
 */

export interface AdvancedFingerprint {
  // Lie Detection
  lies: {
    detected: boolean;
    count: number;
    details: string[];
    trustScore: number; // 0-100
  };

  // Bot Detection
  bot: {
    isBot: boolean;
    botScore: number; // 0-100
    indicators: string[];
  };

  // Advanced Hardware
  hardware: {
    gpuVendor: string;
    gpuRenderer: string;
    cores: number;
    memory: number;
    architecture: string;
    batteryCharging: boolean | null;
    batteryLevel: number | null;
  };

  // Speech & Media
  media: {
    voices: number;
    voiceNames: string[];
    mediaDevices: number;
    cameras: number;
    microphones: number;
    speakers: number;
  };

  // Advanced Browser APIs
  apis: {
    clientHints: any;
    performanceEntries: number;
    mathPrecision: string;
    errorStackFormat: string;
    timezoneName: string;
  };

  // Behavioral
  behavioral: {
    mouseMovement: boolean;
    keyboardDetected: boolean;
    touchDetected: boolean;
    automationDetected: boolean;
  };
}

/**
 * Detect browser lies and tampering
 */
export async function detectLies(): Promise<{
  detected: boolean;
  count: number;
  details: string[];
  trustScore: number;
}> {
  const lies: string[] = [];

  // User agent vs actual features
  const ua = navigator.userAgent;

  // Check Chrome lies
  if (ua.includes('Chrome')) {
    if (!(window as any).chrome) {
      lies.push('Claims to be Chrome but window.chrome is missing');
    }
  }

  // Check Safari lies
  if (ua.includes('Safari') && !ua.includes('Chrome')) {
    if (!(window as any).safari) {
      lies.push('Claims to be Safari but window.safari is missing');
    }
  }

  // Check platform consistency
  const platform = navigator.platform;
  if (ua.includes('Win') && !platform.includes('Win')) {
    lies.push('User agent claims Windows but platform disagrees');
  }
  if (ua.includes('Mac') && !platform.includes('Mac')) {
    lies.push('User agent claims Mac but platform disagrees');
  }
  if (ua.includes('Linux') && !platform.includes('Linux')) {
    lies.push('User agent claims Linux but platform disagrees');
  }

  // Check language lies
  const navLang = navigator.language;
  const navLangs = navigator.languages;
  if (navLangs && navLangs.length > 0 && navLang !== navLangs[0]) {
    lies.push('navigator.language differs from navigator.languages[0]');
  }

  // Check screen resolution lies
  if (screen.width < 100 || screen.height < 100) {
    lies.push('Suspicious screen dimensions');
  }

  // Check timezone lies
  const tzOffset = new Date().getTimezoneOffset();
  const tzName = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (!tzName || tzName === 'UTC') {
    lies.push('Timezone set to UTC (common in automation)');
  }

  // Check headless browser indicators
  if ((navigator as any).webdriver) {
    lies.push('navigator.webdriver is true (automation detected)');
  }

  // Check plugins inconsistency
  if (navigator.plugins.length === 0 && !ua.includes('Mobile')) {
    lies.push('No plugins detected (unusual for desktop browsers)');
  }

  // Check connection API tampering
  const connection = (navigator as any).connection;
  if (connection && connection.rtt === 0) {
    lies.push('Network RTT is 0 (suspicious)');
  }

  // Calculate trust score
  const trustScore = Math.max(0, 100 - (lies.length * 10));

  return {
    detected: lies.length > 0,
    count: lies.length,
    details: lies,
    trustScore,
  };
}

/**
 * Advanced bot detection
 */
export async function detectBot(): Promise<{
  isBot: boolean;
  botScore: number;
  indicators: string[];
}> {
  const indicators: string[] = [];
  let score = 0;

  // Webdriver detection
  if ((navigator as any).webdriver) {
    score += 40;
    indicators.push('WebDriver detected');
  }

  // Phantom/Headless detection
  if ((window as any)._phantom || (window as any).phantom) {
    score += 50;
    indicators.push('PhantomJS detected');
  }

  if ((window as any).callPhantom || (window as any)._selenium) {
    score += 50;
    indicators.push('Selenium detected');
  }

  // Headless Chrome
  if (!navigator.plugins || navigator.plugins.length === 0) {
    if (navigator.userAgent.includes('HeadlessChrome')) {
      score += 50;
      indicators.push('Headless Chrome detected');
    }
  }

  // Check for automation tools
  if ((window as any).domAutomation || (window as any).domAutomationController) {
    score += 40;
    indicators.push('DOM automation detected');
  }

  // Check for suspicious properties
  if ((document as any).__webdriver_script_fn || (document as any).__webdriver_unwrapped) {
    score += 40;
    indicators.push('WebDriver properties detected');
  }

  // Mouse movement check (bots often don't move mouse)
  const hasMouseMovement = await checkMouseMovement();
  if (!hasMouseMovement) {
    score += 20;
    indicators.push('No mouse movement detected');
  }

  // Permission API inconsistencies
  try {
    const permissions = await navigator.permissions.query({ name: 'notifications' as PermissionName });
    if (permissions.state === 'denied' && Notification.permission === 'granted') {
      score += 15;
      indicators.push('Permission API inconsistency');
    }
  } catch (e) {
    // Permission API not available
  }

  // Chrome/CDP detection
  if ((window as any).chrome && (window as any).chrome.runtime) {
    const cdpDetected = Object.keys((window as any).chrome.runtime).includes('onConnectExternal');
    if (!cdpDetected && navigator.userAgent.includes('HeadlessChrome')) {
      score += 30;
      indicators.push('Headless browser indicators');
    }
  }

  return {
    isBot: score >= 50,
    botScore: Math.min(100, score),
    indicators,
  };
}

/**
 * Get advanced hardware information
 */
export async function getAdvancedHardware() {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext;

  let gpuVendor = 'Unknown';
  let gpuRenderer = 'Unknown';

  if (gl) {
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      gpuVendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
      gpuRenderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
    }
  }

  let batteryCharging: boolean | null = null;
  let batteryLevel: number | null = null;

  if ('getBattery' in navigator) {
    try {
      const battery: any = await (navigator as any).getBattery();
      batteryCharging = battery.charging;
      batteryLevel = Math.round(battery.level * 100);
    } catch (e) {
      // Battery API not available or blocked
    }
  }

  return {
    gpuVendor,
    gpuRenderer,
    cores: navigator.hardwareConcurrency || 0,
    memory: (navigator as any).deviceMemory || 0,
    architecture: (navigator as any).userAgentData?.platform || navigator.platform,
    batteryCharging,
    batteryLevel,
  };
}

/**
 * Get speech synthesis and media device info
 */
export async function getMediaInfo() {
  // Speech synthesis voices
  const voices = speechSynthesis.getVoices();
  const voiceNames = voices.map(v => v.name);

  // Media devices
  let cameras = 0;
  let microphones = 0;
  let speakers = 0;

  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    cameras = devices.filter(d => d.kind === 'videoinput').length;
    microphones = devices.filter(d => d.kind === 'audioinput').length;
    speakers = devices.filter(d => d.kind === 'audiooutput').length;
  } catch (e) {
    // Media devices not accessible
  }

  return {
    voices: voices.length,
    voiceNames: voiceNames.slice(0, 10), // Limit to first 10
    mediaDevices: cameras + microphones + speakers,
    cameras,
    microphones,
    speakers,
  };
}

/**
 * Get advanced browser API information
 */
export async function getAdvancedAPIs() {
  // Client Hints
  let clientHints: any = null;
  if ((navigator as any).userAgentData) {
    try {
      clientHints = await (navigator as any).userAgentData.getHighEntropyValues([
        'platform',
        'platformVersion',
        'architecture',
        'model',
        'uaFullVersion',
      ]);
    } catch (e) {
      clientHints = (navigator as any).userAgentData;
    }
  }

  // Performance entries
  const performanceEntries = performance.getEntries().length;

  // Math precision (browser-specific)
  const mathPrecision = Math.PI.toString().slice(0, 20);

  // Error stack format
  let errorStackFormat = 'unknown';
  try {
    throw new Error('test');
  } catch (e: any) {
    if (e.stack) {
      if (e.stack.includes('@')) errorStackFormat = 'Firefox';
      else if (e.stack.includes('    at ')) errorStackFormat = 'Chrome/Edge';
      else errorStackFormat = 'Other';
    }
  }

  // Timezone
  const timezoneName = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return {
    clientHints,
    performanceEntries,
    mathPrecision,
    errorStackFormat,
    timezoneName,
  };
}

/**
 * Detect behavioral patterns
 */
export function getBehavioralIndicators(): {
  mouseMovement: boolean;
  keyboardDetected: boolean;
  touchDetected: boolean;
  automationDetected: boolean;
} {
  return {
    mouseMovement: (window as any)._mouseDetected || false,
    keyboardDetected: (window as any)._keyboardDetected || false,
    touchDetected: (window as any)._touchDetected || false,
    automationDetected: !!(navigator as any).webdriver,
  };
}

/**
 * Check for mouse movement (simple detection)
 */
function checkMouseMovement(): Promise<boolean> {
  return new Promise((resolve) => {
    if ((window as any)._mouseDetected) {
      resolve(true);
      return;
    }

    const timeout = setTimeout(() => {
      document.removeEventListener('mousemove', handler);
      resolve(false);
    }, 1000);

    const handler = () => {
      clearTimeout(timeout);
      document.removeEventListener('mousemove', handler);
      (window as any)._mouseDetected = true;
      resolve(true);
    };

    document.addEventListener('mousemove', handler, { once: true });
  });
}

/**
 * Initialize behavioral tracking
 */
export function initBehavioralTracking() {
  // Mouse movement
  document.addEventListener('mousemove', () => {
    (window as any)._mouseDetected = true;
  }, { once: true });

  // Keyboard
  document.addEventListener('keydown', () => {
    (window as any)._keyboardDetected = true;
  }, { once: true });

  // Touch
  document.addEventListener('touchstart', () => {
    (window as any)._touchDetected = true;
  }, { once: true });
}

/**
 * Get complete advanced fingerprint
 */
export async function getAdvancedFingerprint(): Promise<AdvancedFingerprint> {
  const lies = await detectLies();
  const bot = await detectBot();
  const hardware = await getAdvancedHardware();
  const media = await getMediaInfo();
  const apis = await getAdvancedAPIs();
  const behavioral = getBehavioralIndicators();

  return {
    lies,
    bot,
    hardware,
    media,
    apis,
    behavioral,
  };
}
