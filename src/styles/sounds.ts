// Web Audio API based sound generation

const createOscillator = (
    context: AudioContext,
    freq: number,
    type: OscillatorType = 'sine'
) => {
    const osc = context.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, context.currentTime);
    return osc;
};

const createGain = (context: AudioContext, startVal: number = 0.1) => {
    const gain = context.createGain();
    gain.gain.setValueAtTime(startVal, context.currentTime);
    return gain;
};

const getAudioContext = () => {
    if (typeof window === 'undefined') return null;
    return new (window.AudioContext || (window as any).webkitAudioContext)();
};

export const playSuccessSound = () => {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = createOscillator(ctx, 220, 'sine'); // 220Hz
    const gain = createGain(ctx, 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    // Positive chime effect
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);
};

export const playAlertSound = () => {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Double beep (880Hz, 100ms x2)
    const now = ctx.currentTime;

    const beep = (startTime: number) => {
        const osc = createOscillator(ctx, 880, 'square');
        const gain = createGain(ctx, 0.1);

        osc.connect(gain);
        gain.connect(ctx.destination);

        gain.gain.setValueAtTime(0.1, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.1);

        osc.start(startTime);
        osc.stop(startTime + 0.1);
    };

    beep(now);
    beep(now + 0.15); // Gap of 50ms + 100ms duration = 150ms start for second beep
};

export const playWarningSound = () => {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Warning tone (440Hz, 300ms)
    const osc = createOscillator(ctx, 440, 'sawtooth');
    const gain = createGain(ctx, 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
};

export const playOpportunitySound = () => {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Rising sequence for opportunity
    const now = ctx.currentTime;

    const note = (freq: number, start: number, duration: number) => {
        const osc = createOscillator(ctx, freq, 'sine');
        const gain = createGain(ctx, 0.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        gain.gain.exponentialRampToValueAtTime(0.01, start + duration);

        osc.start(start);
        osc.stop(start + duration);
    };

    note(523.25, now, 0.1); // C5
    note(659.25, now + 0.1, 0.1); // E5
    note(783.99, now + 0.2, 0.2); // G5
};
