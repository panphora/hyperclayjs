const behaviorCollector = (() => {
  let lastMouseMove = 0;
  let lastScroll = 0;
  const THROTTLE_MS = 50;

  const data = {
    mousePositions: [],
    scrollEvents: [],
    keyboardEvents: [],
    startTime: Date.now(),
    webdriver: navigator.webdriver,
    interactions: {
      clicks: [],
      touches: [],
      focusEvents: [],
      blurEvents: [],
      tabSwitches: [],
      keysSummary: new Set()
    },
    navigation: {
      scrollCount: 0,
      maxScrollDepth: 0,
      lastScrollPosition: 0,
      scrollDirectionChanges: 0
    },
    mouseMetrics: {
      totalDistance: 0,
      lastPosition: null
    },
    timing: {
      firstInteraction: null,
      lastInteraction: null
    }
  };

  function updateTiming() {
    const now = Date.now();
    if (!data.timing.firstInteraction) {
      data.timing.firstInteraction = now;
    }
    data.timing.lastInteraction = now;
  }

  function setupListeners() {
    document.addEventListener('mousemove', (e) => {
    const now = Date.now();
    if (now - lastMouseMove < THROTTLE_MS) return;
    lastMouseMove = now;

    const position = {
      x: Math.round(e.clientX),
      y: Math.round(e.clientY),
      timestamp: now,
      isTrusted: e.isTrusted
    };
    data.mousePositions.push(position);

    if (data.mouseMetrics.lastPosition) {
      const distance = Math.sqrt(
        Math.pow(position.x - data.mouseMetrics.lastPosition.x, 2) +
        Math.pow(position.y - data.mouseMetrics.lastPosition.y, 2)
      );
      data.mouseMetrics.totalDistance += distance;
    }

    data.mouseMetrics.lastPosition = position;
    updateTiming();

    if (data.mousePositions.length > 100) {
      data.mousePositions.shift();
    }
  }, {
    passive: true
  });

  window.addEventListener('scroll', (e) => {
    const now = Date.now();
    if (now - lastScroll < THROTTLE_MS) return;
    lastScroll = now;

    const position = Math.round(window.scrollY);
    data.navigation.scrollCount++;

    const scrollEvent = {
      position: position,
      timestamp: now,
      direction: position > data.navigation.lastScrollPosition ? 'down' : 'up',
      isTrusted: e.isTrusted
    };

    data.scrollEvents.push(scrollEvent);

    if (position > data.navigation.maxScrollDepth) {
      data.navigation.maxScrollDepth = position;
    }

    if (data.scrollEvents.length > 1) {
      const lastEvent = data.scrollEvents[data.scrollEvents.length - 2];
      if (lastEvent.direction !== scrollEvent.direction) {
        data.navigation.scrollDirectionChanges++;
      }
    }

    data.navigation.lastScrollPosition = position;
    updateTiming();

    if (data.scrollEvents.length > 50) {
      data.scrollEvents.shift();
    }
  }, {
    passive: true
  });

  // Capture blur events
  document.addEventListener('blur', (e) => {
    data.interactions.blurEvents.push({
      target: e.target.tagName,
      timestamp: Date.now(),
      isTrusted: e.isTrusted
    });

    if (data.interactions.blurEvents.length > 20) {
      data.interactions.blurEvents.shift();
    }
  }, {
    capture: true
  });

  document.addEventListener('keydown', (e) => {
    data.keyboardEvents.push({
      key: e.key,
      timestamp: Date.now(),
      modifiers: {
        ctrl: e.ctrlKey,
        alt: e.altKey,
        shift: e.shiftKey
      },
      isTrusted: e.isTrusted
    });
    data.interactions.keysSummary.add(e.key);
    updateTiming();

    if (data.keyboardEvents.length > 50) {
      data.keyboardEvents.shift();
    }
  }, {
    passive: true
  });

  document.addEventListener('click', (e) => {
    data.interactions.clicks.push({
      x: Math.round(e.clientX),
      y: Math.round(e.clientY),
      timestamp: Date.now(),
      target: e.target.tagName,
      isTrusted: e.isTrusted
    });
    updateTiming();

    if (data.interactions.clicks.length > 20) {
      data.interactions.clicks.shift();
    }
  }, {
    passive: true
  });

  document.addEventListener('touchstart', (e) => {
    data.interactions.touches.push({
      touchCount: e.touches.length,
      timestamp: Date.now(),
      isTrusted: e.isTrusted
    });
    updateTiming();

    if (data.interactions.touches.length > 20) {
      data.interactions.touches.shift();
    }
  }, {
    passive: true
  });

  document.addEventListener('focus', (e) => {
    data.interactions.focusEvents.push({
      target: e.target.tagName,
      timestamp: Date.now(),
      isTrusted: e.isTrusted
    });
    updateTiming();

    if (data.interactions.focusEvents.length > 20) {
      data.interactions.focusEvents.shift();
    }
  }, {
    passive: true,
    capture: true
  });

    document.addEventListener('visibilitychange', () => {
      data.interactions.tabSwitches.push({
        state: document.visibilityState,
        timestamp: Date.now()
      });

      if (data.interactions.tabSwitches.length > 20) {
        data.interactions.tabSwitches.shift();
      }
    }, {
      passive: true
    });
  }

  return {
    init: setupListeners,
    getData: () => ({
      ...data,
      timeSpent: Date.now() - data.startTime,
      interactions: {
        ...data.interactions,
        keysSummary: Array.from(data.interactions.keysSummary)
      }
    })
  };
})();

// Export to window (called by export-to-window module)
export function exportToWindow() {
  window.hyperclay = window.hyperclay || {};
  window.hyperclay.behaviorCollector = behaviorCollector;
}

export default behaviorCollector;

// Auto-initialize - start collecting behavior data
export function init() {
  behaviorCollector.init();
}

// Auto-init when module is imported
init();